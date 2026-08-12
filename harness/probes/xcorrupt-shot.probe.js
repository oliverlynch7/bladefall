/* THE PICTURE for Corruption Mastery — the frame `xcorrupt.probe.js` measures.

   Run:
     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/xc-spread.png \
          --eval @harness/probes/xcorrupt-shot.probe.js

   Holds the game at the instant of the rupture: the ruptured body in the middle, one foe inside the
   120 radius and one outside it, so the CORRUPTION SPREADS floater and the neighbour's corruption
   status can be seen rather than inferred. The measurements are the other probe's job; this only
   has to be looked at. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'reaper';
  try { const w = __BF3.classStartWeapon('reaper'); if(w) p.weapon = w; } catch(e){}

  const cs = __BF3.classState('reaper');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'x_strength'; cs.ch[5] = 'x_wraithwalk'; cs.ch[7] = 'x_crimson';
  cs.ch[9] = 'x_corrupt';

  G.enemies.length = 0;
  const tgt  = __BF3.spawnEnemy('grunt', p.x,       p.z - 210);
  const near = __BF3.spawnEnemy('grunt', p.x +  90, p.z - 210);
  const far  = __BF3.spawnEnemy('grunt', p.x + 400, p.z - 210);
  for(const e of [tgt, near, far]){ if(!e) continue; e.active = true; e.dummy = false; e.speed = 0; e.hp = e.maxHp = 100000; }

  for(let k = 0; k < 5; k++){
    G._desig = false;
    try { __BF3.hitEnemy(tgt, 20, p, 0, 0, 'void'); } catch(e){}
    for(let f = 0; f < 10; f++) __BF3.update(1/60);
  }
  G._desig = true;
  try { __BF3.hitEnemy(tgt, 20, p, 0, 0, null); } catch(e){}
  G._desig = false;

  for(let f = 0; f < 3; f++) __BF3.update(1/60);   // let the ring and the floater exist in the frame

  const CORR = (e) => (e && e.st && e.st.corrupt) || 0;
  return JSON.stringify({ nearCorrupt: CORR(near), farCorrupt: CORR(far), tgtCorrupt: CORR(tgt) });
})()
