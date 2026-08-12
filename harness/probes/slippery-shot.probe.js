/* SLIPPERY, PHOTOGRAPHED — the measuring probe's twin, staged to be LOOKED at.

   `harness/probes/slippery.probe.js` returns numbers and then puts the hero back at home for its next
   trial, so the frame it hands the camera shows nothing. This one runs the loaded shot ONCE and stops,
   leaving the body where the shove put it, and returns the same gap reading taken on the frame that is
   about to be photographed — so the picture and the number are of the same moment rather than of two
   runs that agree.

   It is deliberately a separate file rather than a flag on the other one: a probe that sometimes
   returns and sometimes poses is a probe whose numbers depend on which mode it was in.

   Everything else is the measuring probe's setup verbatim - the foe pinned 60 units in front, the hero
   turned by the game's own atan2(dx, dz), the pistol emptied and reloaded through the game's own paths.
   The extra 45 ticks at the end are for the CAMERA, not the hero: G.cam lerps 10% a frame toward the
   follow point, so a hero that just moved 139 units in 0.22s is still most of the way off-frame when
   the dash ends. The hero's own velocity is spent by then, so nothing but the camera moves. */
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
  __BF3.meta.classId = 'pirate';
  __BF3.meta.pirateSlot = 'basic';
  __BF3.meta.camMode = 'far';

  (function(){
    const tries = ['pirate'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
  })();

  const cs = __BF3.classState('pirate');
  cs.ch = cs.ch || {};
  cs.ch[7] = 'pir_evasive';
  p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;

  let threw = null;
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  /* Reload through a kill, the way the game does it (killEnemy, 10939). */
  G.enemies.length = 0;
  const k = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
  if(k){ k.active = true; k.hp = k.maxHp = 1; try { __BF3.hitEnemy(k, 500, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); } }

  G.enemies.length = 0;
  p.vx = 0; p.vz = 0; p.dodgeTimer = 0; p.dodgeCdT = 0; p._slipT = 0;
  IN.jx = 0; IN.jz = 0;

  /* THE FOE GOES BESIDE THE HERO, NOT IN FRONT OF IT, and that is forced by the camera rather than
     chosen. Staged along −z the way the measuring probe stages it, the shove drives the hero AWAY from
     an overhead camera that is already lagging hundreds of units behind it (measured on the second
     render: hero z 493, G.cam z 65), so the foe ends up between the camera and the hero — nearer, lower
     in frame, and behind the ability bar. Two renders showed a healthy pirate alone in a healthy arena,
     which is a photograph of nothing. Sideways, both bodies sit at the same screen height and the gap
     is the width of the picture. The push does not care which way it points: the hero is turned to face
     the foe by the game's own atan2 either way. */
  /* A RULER, not a target: it is never shot, and it is offset 70 units ACROSS the shove rather than
     along it, so it marks the x the hero fired from without ever standing in the path. */
  const marker = __BF3.spawnEnemy('grunt', p.x, p.z + 70);
  if(marker){ marker.active = true; marker.immobile = true; marker.hp = marker.maxHp = 100000; }
  const e = __BF3.spawnEnemy('grunt', p.x - 60, p.z);
  if(!e) return JSON.stringify({ ok:false, why:'no target' });
  p.yaw = Math.atan2(e.x - p.x, e.z - p.z);
  e.active = true; e.immobile = true; e.hp = e.maxHp = 100000;
  const reach = ((e.weapon && e.weapon.range) || 60) + (e.r || 0) + (p.r || 0);

  const gap0 = Math.hypot(p.x - e.x, p.z - e.z);
  const loadedAtShot = p._loaded;
  try { __BF3.hitEnemy(e, 100, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
  tick(20);                       // the shove
  const gap1 = Math.hypot(p.x - e.x, p.z - e.z);
  tick(45);                       // the camera, catching up to it

  return JSON.stringify({
    ok: gap1 > reach && loadedAtShot !== false,
    loadedAtShot: loadedAtShot,
    gap0: Math.round(gap0 * 10) / 10, gap1: Math.round(gap1 * 10) / 10,
    reach: Math.round(reach * 10) / 10,
    gapNow: Math.round(Math.hypot(p.x - e.x, p.z - e.z) * 10) / 10,   // the frame being photographed
    dodgeCd: Math.round((p.dodgeCdT || 0) * 100) / 100, threw: threw,
    /* WHERE THE TWO BODIES ARE ON THE FRAME BEING PHOTOGRAPHED. Without this the picture is only
       evidence that the game did not fall over: the first render of this probe showed a healthy
       pirate in a healthy arena and no visible foe, and "the target is off-frame" and "the target
       stopped being drawn" are the same photograph. */
    hero: { x: Math.round(p.x), z: Math.round(p.z) },
    foe: { x: Math.round(e.x), z: Math.round(e.z), hp: Math.round(e.hp), dead: !!e.dead, active: !!e.active },
    marker: marker ? { x: Math.round(marker.x), z: Math.round(marker.z) } : null,
    cam: G.cam ? { x: Math.round(G.cam.x), z: Math.round(G.cam.z) } : null,
    enemies: (G.enemies || []).length,
  });
})()
