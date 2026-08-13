/* WHAT DOES A CORRECTED MOB LOOK LIKE? — the picture half of Task 2, 2026-08-12.

   The three trials in mp-drift.probe.js prove the pull lands and prove it is gated on the host's wake
   flag. Neither says whether the RESULT is a body standing on the ground: the correction is applied
   one line before the game's own obstacle and edge guard precisely so that guard validates it, and
   "the guard validates it" is a claim about geometry that a distance number cannot settle.

   So this puts a host snapshot in front of the camera. The six enemies nearest the player are told,
   as an AWAKE host would tell a guest, that they are standing in an arc ~220 units ahead of the hero.
   The frame that comes back is what a guest sees the instant its picture is reconciled.

   Reported per mob, so the picture has numbers beside it: where it ended up, how far that is from
   where the host said, its y against the floor under it (floorAt is the game's own), and whether the
   edge guard fired. A mob far from its target, or standing off its own floor, is a finding. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);
  let stamped = 0;
  for(const e of live()){ if(e.mid == null) e.mid = 900000 + (stamped++); }
  for(const e of live()){ e.active = true; e.dropT = 0; e.mx = null; e.mz = null; }
  const p = G.p;
  p.dead = false; p.downed = false; p.invuln = 999; p.hp = p.maxHp || 100;

  const near = live().sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z)).slice(0, 6);
  if(!near.length) return JSON.stringify({ ok:false, why:'no live enemies here' });

  /* the arc the host claims they are standing in, ahead of the hero along its own facing */
  const DIST = 220, yaw = p.yaw || 0;
  const want = near.map((e, i) => {
    const a = yaw + (i - (near.length - 1) / 2) * 0.34;
    return { mid:e.mid, x: p.x + Math.sin(a) * DIST, z: p.z + Math.cos(a) * DIST };
  });
  const wantBy = {}; for(const w of want) wantBy[w.mid] = w;

  const snap = near.map(e => [e.mid, MP.typeIdx(e.type), Math.round(wantBy[e.mid].x), Math.round(wantBy[e.mid].z),
                              Math.max(0, Math.round(e.hp)), Math.round(e.maxHp), 1]);   // slot 6 = host is awake to it

  const aWas = MP.active, hWas = MP.isHost, kWas = MP._killed;
  MP._killed = {}; MP.active = true; MP.isHost = false;
  let threw = null;
  try { MP.applyEnemies(snap, null); } catch(err){ threw = String(err && err.message || err); }
  for(let k = 0; k < 25; k++){                       // 25 frames at k=0.2 leaves ~0.4% of the gap
    try { B.update(1/60); } catch(err){}
    p.hp = p.maxHp || 100; p.dead = false; p.downed = false; p.invuln = 999;
  }
  MP.active = aWas; MP.isHost = hWas; MP._killed = kWas;

  const rows = near.map(e => {
    const w = wantBy[e.mid];
    let floor = null; try { floor = Math.round(B.floorAt(e.x, e.z)); } catch(err){}
    return { type:e.type, toTarget: Math.round(Math.hypot(e.x - w.x, e.z - w.z)),
             fromHero: Math.round(Math.hypot(e.x - p.x, e.z - p.z)),
             y: Math.round(e.y), floorUnder: floor, offFloor: (floor == null ? null : Math.round(e.y - floor)),
             edgeGuardHeld: Math.round(Math.hypot(e.x - e.sx, e.z - e.sz)) };
  });

  return JSON.stringify({ ok:true, at:G.areaName, threw:threw, distAsked:DIST,
                          hero:{ x:Math.round(p.x), z:Math.round(p.z), yaw:+(p.yaw||0).toFixed(2) },
                          mobs: rows });
})()
