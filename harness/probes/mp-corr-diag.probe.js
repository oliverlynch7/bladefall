/* WHY DID THE CORRECTION TRIALS FREEZE? — 2026-08-12, diagnostic for mp-drift.probe.js part 4.

   Its three trials all reported moved: 0, INCLUDING the two where the guard is not involved and the
   enemies' own AI should have carried them ~18 units in 20 frames. A uniform freeze across trials
   that share nothing but the harness is a fault in the harness, not a verdict about the game — so
   this asks the one question the swallowed catch hid: does B.update() throw in guest mode, and with
   what message?

   It skips mp-drift's 30-second lap on purpose: the lap is not needed to make update() throw, and
   the whole point is a fast answer. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);
  let stamped = 0;
  for(const e of live()){ if(e.mid == null) e.mid = 900000 + (stamped++); }
  for(const e of live()){ e.active = true; e.dropT = 0; }

  const state = () => ({ pDead: !!G.p.dead, pDowned: !!G.p.downed, pHp: Math.round(G.p.hp),
                         over: !!G.over, paused: !!G.paused, activeEnemies: live().filter(e => e.active).length });

  const stateBefore = state();

  /* one tick with NO snapshot, guest mode on, error NOT swallowed */
  const aWas = MP.active, hWas = MP.isHost;
  MP.active = true; MP.isHost = false;
  const e0 = live()[0];
  const x0 = e0 ? e0.x : null, z0 = e0 ? e0.z : null;
  let threwPlain = null;
  try { B.update(1/60); } catch(err){ threwPlain = String(err && err.stack || err.message || err); }
  const movedPlain = e0 ? +Math.hypot(e0.x - x0, e0.z - z0).toFixed(3) : null;

  /* one tick WITH a target stored, so the new line is exercised */
  let threwTargeted = null, movedTargeted = null;
  if(e0){
    e0.mx = e0.x + 500; e0.mz = e0.z + 500;
    const x1 = e0.x, z1 = e0.z;
    try { B.update(1/60); } catch(err){ threwTargeted = String(err && err.stack || err.message || err); }
    movedTargeted = +Math.hypot(e0.x - x1, e0.z - z1).toFixed(3);
    e0.mx = null; e0.mz = null;
  }
  MP.active = aWas; MP.isHost = hWas;

  return JSON.stringify({
    ok:true, at:G.areaName,
    stateBefore, stateAfter: state(),
    guestReads: { active: MP.active, isHost: MP.isHost, guestNow: MP.guest() },
    plainTick: { moved: movedPlain, threw: threwPlain ? threwPlain.slice(0, 400) : null },
    targetedTick: { moved: movedTargeted, threw: threwTargeted ? threwTargeted.slice(0, 400) : null },
  });
})()
