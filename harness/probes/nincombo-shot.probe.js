/* COMBO EDGE, PHOTOGRAPHED — the measuring probe's twin, staged to be LOOKED at.

   `harness/probes/nincombo.probe.js` returns numbers and puts the hero back on its mark between
   trials, so the frame it hands the camera shows nothing. This one arms Unseen once, kills ONE foe
   with it and stops, leaving both floaters up: 'UNSEEN' over the body (CLASS_BASIC.ninja, 11364)
   and 'UNSEEN READY' over the hero (killEnemy, 10969). Those two words in one frame ARE the card —
   the strike, and the rearm it is supposed to hand back.

   A separate file rather than a flag on the other one, for the reason slippery-shot.probe.js gives:
   a probe that sometimes returns and sometimes poses is a probe whose numbers depend on which mode
   it was in.

   RANK 3 IS PINNED TO SWIFT, NOT DEADLY PRECISION, on purpose. This is the exact build the shipped
   game could never pay out to — `_ninExec` was set only inside the Deadly Precision branch — so the
   photograph is of the half that was dead, not of the half that already worked.

   THE FOE GOES BESIDE THE HERO for unseen-shot.probe.js's reason: Unseen mirrors the body through
   the target, so a foe staged along z moves the hero toward or away from an overhead camera and the
   two bodies overlap. Sideways, the move crosses the frame.

   The six ticks at the end are for the FLOATERS, which are on a timer, and the camera is snapped
   rather than ticked because G.cam is advanced by the render loop and not by update(dt). Both
   lessons are unseen-shot.probe.js's, paid for there. */
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
  cs.ch[3] = 'nin_swift'; cs.ch[5] = 'nin_combo';
  cs.ch[7] = 'nin_bleed'; cs.ch[9] = 'nin_assassin';
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
  /* FULL HEALTH, and small enough that one Unseen strike finishes it. Not a wounded foe: the
     wounded case is the only one the shipped game ever paid, and photographing it would show the
     path that already worked. */
  const e = __BF3.spawnEnemy('grunt', HOME.x - 60, HOME.z);
  if(!e) return JSON.stringify({ ok:false, why:'no target' });
  e.active = true; e.immobile = true; e.maxHp = 40; e.hp = 40;
  p.yaw = Math.atan2(e.x - p.x, e.z - p.z);

  const bx = p.x, bz = p.z;
  try { __BF3.hitEnemy(e, 400, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
  const moved = Math.round(Math.hypot(p.x - bx, p.z - bz) * 10) / 10;
  const rearmed = Math.round((p._stillT || 0) * 100) / 100;

  tick(6, false);
  try { G.cam.x = p.x; G.cam.z = p.z; G.cam.y = p.y || 0; } catch(err){}
  try { __BF3.hudUpdate(); } catch(err){}

  return JSON.stringify({
    ok: stillT >= 1 && moved > 0 && !!e.dead && rearmed >= 1,
    stillT: stillT, moved: moved, rearmed: rearmed,
    /* WHERE EVERYTHING IS ON THE FRAME BEING PHOTOGRAPHED, so "off-frame" and "not drawn" cannot be
       the same picture. */
    hero: { x: Math.round(p.x), z: Math.round(p.z) },
    startedAt: { x: Math.round(bx), z: Math.round(bz) },
    foe: { x: Math.round(e.x), z: Math.round(e.z), hp: Math.round(e.hp), dead: !!e.dead },
    cam: G.cam ? { x: Math.round(G.cam.x), z: Math.round(G.cam.z) } : null,
    enemies: (G.enemies || []).length, threw: threw,
  });
})()
