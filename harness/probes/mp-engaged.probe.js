/* HOW MANY ENEMIES ARE ACTUALLY ENGAGED AT ONCE?

   The companion to mp-pos.probe.js, and the only question left before the guest-position plan can
   choose between "correct every enemy in the snapshot" and "correct only the ones in combat".
   mp-pos measured the packet (position is already carried for every enemy, so the choice is not
   about bandwidth) and it measured the population AT THE ENTRANCE, where every mob is still asleep
   and the engaged set is trivially zero. That reading is true and useless for sizing the set.

   So: wake the level through the game's own two fields, walk the player a wide lap the way
   mp-drift.probe.js does - a stationary observer is converged on once and then stood next to, which
   measures the entrance rather than a fight - and sample the engaged count every half second.

   Three radii, none of them invented here:
     125 - the melee contact reach measured in docs/MP_AUDIT.md, i.e. can hit you right now
     300 - the distance the ordinary mob update uses to start a wind-up (index.html:13456)
     640 - the game's own wake radius (index.html:13384)

   If the engaged set is a small fraction of the live set, selectivity buys something. If it is most
   of them once a fight starts, it buys complexity and no saving, and the plan should say so. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);
  const p = G.p;

  let stamped = 0;
  for(const e of live()){ if(e.mid == null) e.mid = 900000 + (stamped++); }
  const n0 = live().length;
  if(!n0) return JSON.stringify({ ok:false, why:'no live enemies here to measure' });

  for(const e of live()){ e.active = true; e.dropT = 0; }

  const IN = B.input, meta = B.meta;
  const camWas = meta.camMode; meta.camMode = 'far';   // world-space steering; camera-relative spins
  const dist = e => Math.hypot(e.x - p.x, e.z - p.z);

  const s125 = [], s300 = [], s640 = [];
  const TICKS = 1800;                                  // 30s at the game's own step
  for(let k = 0; k < TICKS; k++){
    const a = (k / 60) * 0.5;                          // one slow lap, so the mobs are led not parked on
    IN.jx = Math.cos(a); IN.jz = Math.sin(a);
    try { B.update(1 / 60); } catch(err){}
    G.p.hp = G.p.maxHp || 100;                         // the fight must not end by killing the observer
    if(k % 30 === 0){
      const es = live();
      s125.push(es.filter(e => dist(e) < 125).length);
      s300.push(es.filter(e => dist(e) < 300).length);
      s640.push(es.filter(e => dist(e) < 640).length);
    }
  }
  IN.jx = 0; IN.jz = 0; meta.camMode = camWas;

  const stat = a => ({ max: Math.max.apply(null, a),
                       mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1),
                       zeroSamples: a.filter(v => v === 0).length, samples: a.length });

  const es = live();
  return JSON.stringify({
    ok: true, at: G.areaName, seconds: TICKS / 60,
    liveAtStart: n0, liveAtEnd: es.length,
    engaged: { within125: stat(s125), within300: stat(s300), within640: stat(s640) },
    // what a whole-snapshot correction would touch, for the same 30s, as the comparison
    snapshotRowsAtEnd: (function(){ const w = MP.active, h = MP.isHost;
      MP.active = true; MP.isHost = true; const n = MP.enemySnap().length;
      MP.active = w; MP.isHost = h; return n; })(),
  });
})()
