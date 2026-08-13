/* CAN A GUEST BE HIT BY AN ENEMY THAT IS SOMEWHERE ELSE ON THEIR SCREEN?

   Sub-project D Task 2. The documented co-op failure is that the host plays a lag-free game while a
   guest plays a delayed one, so the host is simply better at it. The plan expected to find drift and
   to weigh it against enemy reach.

   The measurement below is deliberately in three parts, because the first thing this found is that
   the plan's question had a simpler answer than it assumed:

   1. IS POSITION RECONCILED AT ALL? Asked by DOING it, not by reading applyEnemies. A snapshot is
      built from the live enemies with every x and z moved a long way, the game is put into guest
      mode for exactly the length of that one call, and the enemies are measured afterwards. If the
      guest adopts the host's positions they will have moved; if it does not, drift is not damped by
      anything and grows for as long as the two simulations disagree.

   2. HOW FAR DOES AN ENEMY GO? Path length and net displacement over 30 simulated seconds. This is
      the SCALE of the disagreement that is available to accumulate - an upper bound on drift, and
      the honest one to compare against reach, because nothing is correcting it.

   3. WHAT IS REACH? The game's melee contact test is a radius sum, so reach is read off the enemies
      themselves (e.r) rather than named here.

   4. AND SINCE 2026-08-12, DOES THE FIX FOR ALL OF THAT LAND ONLY WHERE IT SHOULD? Three trials in
      one launch - a sleeping snapshot, a pre-flag snapshot and an awake one - because the awake case
      alone would pass with the wake flag ignored entirely. See the section itself for the ordering.

   WHAT THIS IS NOT: a network measurement. No session is held and no packet crosses a wire. It
   measures what the guest's own code does with a host snapshot, which is the half that lives in this
   repo. Two real machines remain the final check for latency and jitter. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && e.mid != null && !e.practice && !e.dummy);

  /* The campaign spawns with mid == null (mids are assigned by the host when a session starts), and
     applyEnemies is keyed entirely on mid - so without one there is nothing for a snapshot to
     reconcile TO and part 1 would measure an empty list and call it "no sync". Stamp them the way a
     host would. */
  let stamped = 0;
  for(const e of (G.enemies || [])){
    if(e && !e.dead && !e.practice && !e.dummy && e.mid == null){ e.mid = 900000 + (stamped++); }
  }
  const before = live().map(e => ({ mid:e.mid, type:e.type, x:e.x, z:e.z, r:e.r }));
  if(!before.length) return JSON.stringify({ ok:false, why:'no live enemies here to measure' });

  /* ---- 1. does a host snapshot move a guest's enemies? ---------------------------------------- */
  const SHIFT = 500;
  const snap = before.map(e => [e.mid, MP.typeIdx(e.type), Math.round(e.x + SHIFT), Math.round(e.z + SHIFT),
                                9999, 9999]);
  const wasActive = MP.active, wasHost = MP.isHost, wasKilled = MP._killed, wasGot = MP._gotEn;
  let applyThrew = null;
  MP._killed = {};                       // a fresh kill ledger, so nothing here is credited twice
  MP.active = true; MP.isHost = false;   // applyEnemies returns immediately unless guest() is true
  try { MP.applyEnemies(snap, null); } catch(e){ applyThrew = String(e && e.message || e); }
  MP.active = wasActive; MP.isHost = wasHost; MP._killed = wasKilled; MP._gotEn = wasGot;

  const byMid = {}; for(const e of live()) byMid[e.mid] = e;
  let moved = 0, hpTook = 0;
  for(const b of before){
    const e = byMid[b.mid]; if(!e) continue;
    if(Math.hypot(e.x - b.x, e.z - b.z) > 1) moved++;
    if(e.maxHp === 9999 || e.hp === 9999) hpTook++;
  }

  /* ---- 2. how far does an enemy travel while nothing corrects it? ------------------------------
     TWO THINGS HAD TO BE SET UP, and the first version of this measured neither, reported every mob
     as having travelled 0 units, and would have been read as "there is nothing to drift".
     - ENEMIES SPAWN ASLEEP. active:false and a ~1.2s dropT drop-in timer; the game wakes them when a
       player comes near. A probe that stands at the entrance for thirty seconds watches a level in
       which nothing happens. They are woken here through the game's own two fields, not moved.
     - AND THE PLAYER HAS TO BE WORTH CHASING. A stationary observer is converged on once and then
       stood next to, which measures the distance to the entrance rather than the distance a mob
       covers in a fight. The player walks a wide circle through the game's own input channel, which
       is the shape of a real engagement - and it is exactly the disagreement two clients can have,
       because on the other screen this mob is chasing somebody else entirely. */
  for(const e of live()){ e.active = true; e.dropT = 0; }
  const IN = B.input, meta = B.meta;
  const camWas = meta.camMode; meta.camMode = 'far';    // world-space steering; camera-relative spins
  const start = live().map(e => ({ mid:e.mid, type:e.type, x:e.x, z:e.z, r:e.r, path:0, px:e.x, pz:e.z }));
  const track = {}; for(const s of start) track[s.mid] = s;
  const TICKS = 1800;                    // 30 seconds at the game's own step
  for(let k = 0; k < TICKS; k++){
    const a = (k / 60) * 0.5;            // one slow lap, so the mobs are led rather than parked on
    IN.jx = Math.cos(a); IN.jz = Math.sin(a);
    try { B.update(1 / 60); } catch(e){}
    G.p.hp = G.p.maxHp || 100;           // the fight must not end early by killing the observer
    for(const e of live()){
      const s = track[e.mid]; if(!s) continue;
      s.path += Math.hypot(e.x - s.px, e.z - s.pz);
      s.px = e.x; s.pz = e.z;
    }
  }
  IN.jx = 0; IN.jz = 0; meta.camMode = camWas;
  const rows = [];
  for(const e of live()){
    const s = track[e.mid]; if(!s) continue;
    rows.push({ type:s.type, r:Math.round(s.r),
                travelled:Math.round(s.path),
                net:Math.round(Math.hypot(e.x - s.x, e.z - s.z)) });
  }
  rows.sort((a, b) => b.travelled - a.travelled);

  /* ---- 4. DOES THE CORRECTION LAND, AND ONLY WHEN IT SHOULD? ------------------------------------
     Part 1 applies one snapshot and measures immediately, which is the right question for the APPLY
     (it must never teleport) and the wrong one for the fix: the pull lives in the enemy update, so a
     probe that does not tick reads 0 against a working build.

     Three trials, in this order on purpose. The two that must read ZERO run FIRST, from a state no
     trial has touched, so their zeros cannot be an artifact of a reset between trials:

       A  sleeping   slot 6 = 0   the host is not simulating this mob -> its x,z is a stale spawn
                                  point, not a correction. Must not move.
       B  old peer   6 slots      a packet from before the flag existed. Must not move: fail-safe.
       C  awake      slot 6 = 1   the host is simulating it. Must move.

     C is what makes A and B mean something: same bodies, same shift, same launch, one slot different.
     (The plan asked for A to be watched to fail against a build with the guard forced open. C is that
     build's behaviour, measured on the same frame instead of in a second launch — if C read 0 too,
     A's zero would be worthless and this section would say so.)

     Every trial sends hp/maxHp 9999, so hpTook proves the snapshot ARRIVED even in the trials where
     nothing is expected to move. A null result and a working guard look identical without it. */
  const trial = (name, flag, slots) => {
    /* THE OBSERVER HAS TO BE ALIVE, and the first version of this section did not check.
       Part 2 walks the player through thirty seconds of a live level and tops its HP back up AFTER
       each update - which stops it dying of attrition but does not undo a death that already
       happened, because p.dead stays set. A dead player's update does not step the enemies at all,
       so all three trials came back moved: 0 - the two that must read zero AND the one that must
       not. That reads exactly like a working guard and is a frozen game. The revive below is the
       fix; `player` in each row is the receipt, so a future freeze says so instead of passing. */
    G.p.dead = false; G.p.downed = false; G.p.hp = G.p.maxHp || 100; G.p.invuln = 999;
    for(const e of live()){ e.active = true; e.dropT = 0; e.mx = null; e.mz = null; }
    const pre = live().map(e => ({ mid:e.mid, x:e.x, z:e.z }));
    const rowsIn = pre.map(b => { const e = byMid2(b.mid);
      const r = [b.mid, MP.typeIdx(e.type), Math.round(b.x + SHIFT), Math.round(b.z + SHIFT), 9999, 9999];
      if(slots === 7) r.push(flag);
      return r; });
    const aWas = MP.active, hWas = MP.isHost, kWas = MP._killed, gWas = MP._gotEn;
    MP._killed = {}; MP.active = true; MP.isHost = false;      // guest for the apply AND for the ticks:
    let threw = null;                                          // the pull is gated on MP.guest()
    try { MP.applyEnemies(rowsIn, null); } catch(err){ threw = String(err && err.message || err); }
    const FR = 20;                                             // k = min(1,dt*12) = 0.2/frame; 4 halve it
    let tickThrew = null;
    for(let k = 0; k < FR; k++){
      try { B.update(1 / 60); } catch(err){ if(!tickThrew) tickThrew = String(err && err.message || err); }
      G.p.hp = G.p.maxHp || 100; G.p.dead = false; G.p.downed = false; G.p.invuln = 999; }
    MP.active = aWas; MP.isHost = hWas; MP._killed = kWas; MP._gotEn = gWas;
    let mv = 0, hp9 = 0, resid = 0, n = 0, targeted = 0;
    for(const b of pre){ const e = byMid2(b.mid); if(!e) continue;
      if(Math.hypot(e.x - b.x, e.z - b.z) > 1) mv++;
      if(e.hp === 9999 || e.maxHp === 9999) hp9++;
      if(e.mx != null){ targeted++; resid += Math.hypot(e.x - e.mx, e.z - e.mz); n++; } }
    return { trial:name, slotsSent:slots, flagSent:(slots === 7 ? flag : null), of:pre.length,
             moved:mv, hpAdopted:hp9, targetsStored:targeted,
             residualToTarget: n ? Math.round(resid / n) : null, gapAsked: Math.round(SHIFT * Math.SQRT2),
             framesTicked:FR, threw:threw, tickThrew:tickThrew,
             player: { dead:!!G.p.dead, hp:Math.round(G.p.hp) } };
  };
  function byMid2(mid){ for(const e of live()) if(e.mid === mid) return e; return null; }
  const correction = [ trial('A_sleeping', 0, 7), trial('B_oldPeer', null, 6), trial('C_awake', 1, 7) ];

  return JSON.stringify({
    ok: true, at: G.areaName, seconds: TICKS / 60,
    reconcile: { enemies: before.length, movedBySnapshot: moved, hpAdoptedFromSnapshot: hpTook,
                 shiftAsked: SHIFT, threw: applyThrew },
    travel: rows.slice(0, 12),
    survivors: rows.length,
    correction: correction,
    verdict: (correction[0].moved === 0 && correction[1].moved === 0 && correction[2].moved > 0)
      ? 'corrected only when the host is awake to it'
      : 'NOT the designed behaviour — read the three trials',
  });
})()
