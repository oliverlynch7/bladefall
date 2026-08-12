/* UNSEEN, PHOTOGRAPHED — the measuring probe's twin, staged to be LOOKED at.

   `harness/probes/unseen.probe.js` returns numbers and then puts the hero back on its mark for the
   next trial, so the frame it hands the camera shows nothing. This one stands the ninja still ONCE,
   lands one hit and stops, leaving the body where Unseen put it — and returns the same readings
   taken on the frame that is about to be photographed, so the picture and the numbers are of one
   moment rather than of two runs that agree.

   A separate file rather than a flag on the other one, for the reason slippery-shot.probe.js gives:
   a probe that sometimes returns and sometimes poses is a probe whose numbers depend on which mode
   it was in.

   THE FOE GOES BESIDE THE HERO, NOT IN FRONT OF IT. Unseen mirrors the body through the target, so
   staged along z the whole 101-unit move is toward or away from an overhead camera that is already
   lagging behind it — the two bodies would overlap and the picture would show nothing moving.
   Sideways, the hero crosses the frame and the gap is the width of the picture.

   THE MARKER IS A RULER, never struck: it stands on the spot the hero occupied before the hit, 70
   units across the line of travel so it can never be the thing the hero teleported to. Without it
   "the ninja is standing on the far side" and "the ninja is standing where it always was" are the
   same photograph.

   The 45 ticks at the end are for the CAMERA, not the hero: G.cam lerps 10% a frame toward the
   follow point. The hero does not move again — nothing here strikes twice. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'ninja';
  __BF3.meta.camMode = 'far';

  (function(){
    const tries = ['ninja'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
  })();

  const cs = __BF3.classState('ninja');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'nin_deadly'; cs.ch[5] = 'nin_evasive';
  cs.ch[7] = 'nin_bleed';  cs.ch[9] = 'nin_assassin';
  p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;

  let threw = null;
  const tick = (n, clear) => {
    for(let i = 0; i < n; i++){
      if(clear) G.enemies.length = 0;
      IN.jx = 0; IN.jz = 0;
      try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; }
    }
  };

  p.vx = 0; p.vz = 0;
  p._stillT = 0; p._stillX = p.x; p._stillZ = p.z;
  const HOME = { x: p.x, z: p.z };
  tick(72, true);                                   // 1.2s of the game's own clock, standing still
  const stillT = Math.round((p._stillT || 0) * 100) / 100;

  G.enemies.length = 0; G._desig = false;
  const marker = __BF3.spawnEnemy('grunt', HOME.x, HOME.z + 70);
  if(marker){ marker.active = true; marker.immobile = true; marker.hp = marker.maxHp = 100000; }
  const e = __BF3.spawnEnemy('grunt', HOME.x - 60, HOME.z);
  if(!e) return JSON.stringify({ ok:false, why:'no target' });
  e.active = true; e.immobile = true; e.hp = e.maxHp = 100000;
  p.yaw = Math.atan2(e.x - p.x, e.z - p.z);

  const bx = p.x, bz = p.z;
  try { __BF3.hitEnemy(e, 5, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
  const dot = (bx - e.x) * (p.x - e.x) + (bz - e.z) * (p.z - e.z);
  const moved = Math.round(Math.hypot(p.x - bx, p.z - bz) * 10) / 10;

  /* SIX TICKS, NOT FORTY-FIVE, and the count is the difference between a photograph of the strike
     and a photograph of the arena. The evidence in the frame is the 'UNSEEN' floater and the burst
     the hook throws (11325-11326), and both are on a timer — the first staging spent 0.75s waiting
     for a camera that ticking cannot move anyway, and by the shutter they were gone. */
  tick(6, false);

  /* SNAP THE CAMERA, because ticking cannot move it. G.cam is the smoothed follow-point the
     shoulder camera is built off, and it is advanced by the RENDER loop, not by update(dt) — so the
     45 ticks above move nothing. The first render of this probe proved it: hero at z 340, `cam z
     34`, and a photograph of an empty arena floor with both bodies off-frame. This is the same
     snap harness/shot.js:497 does for --focus, and for the same reason. */
  try { G.cam.x = p.x; G.cam.z = p.z; G.cam.y = p.y || 0; } catch(err){}
  try { __BF3.hudUpdate(); } catch(err){}            // the HUD still reads the class it booted as

  return JSON.stringify({
    ok: stillT >= 1 && moved > 0 && dot < 0,
    stillT: stillT, moved: moved, behind: dot < 0,
    distAfter: Math.round(Math.hypot(p.x - e.x, p.z - e.z)), wanted: Math.round(e.r + 26),
    hpLost: Math.round(100000 - e.hp),
    /* WHERE EVERYTHING IS ON THE FRAME BEING PHOTOGRAPHED, so "off-frame" and "not drawn" cannot be
       the same picture — slippery-shot.probe.js paid for that lesson with two blank renders. */
    hero: { x: Math.round(p.x), z: Math.round(p.z) },
    startedAt: { x: Math.round(bx), z: Math.round(bz) },
    foe: { x: Math.round(e.x), z: Math.round(e.z), dead: !!e.dead },
    marker: marker ? { x: Math.round(marker.x), z: Math.round(marker.z) } : null,
    cam: G.cam ? { x: Math.round(G.cam.x), z: Math.round(G.cam.z) } : null,
    enemies: (G.enemies || []).length, threw: threw,
  });
})()
