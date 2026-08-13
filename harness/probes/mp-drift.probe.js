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

  /* THE BENCH WALKS INTO AN NPC, AND UNTIL 2026-08-12 THAT SILENTLY ENDED THE MEASUREMENT.
     `update()` returns at its third line unless `mode === 'play'` (index.html:13038), and `mode` is
     exported as a getter with no setter (19722), so nothing a probe can assign puts the game back.
     Two earlier runs blamed the observer's death and fixed that; the death was never the cause.
     Measured by `harness/probes/mp-mode.probe.js`: at tick 438 - 7.3s into a 1800-tick lap - the
     player reaches x -17, z 489 and the Warden's Shade raises its card. `mode` goes to 'menu' with
     the overlay up and ONE button, `#shadeGo`, whose onclick IS `resumePlay` (1300). The remaining
     22.7 seconds then ticked a stopped game.
     So this is not a lap that measured 30 seconds of drift; it is a lap that measured 7.3 and
     reported 30, and every trial after it ran on a frozen world - which reads exactly like a
     working guard, the failure shape this sub-project exists to catch.
     The fix knocks on the game's own doors and never reaches past them, the idiom
     `harness/test-skills.js` already uses for the pause card. It is deliberately NOT a blind
     "click the first button in the overlay": AUTOPILOT.md records that exact clicker taking
     `tutSkip` and skipping a whole class trial. Only doors whose handler is `resumePlay` are
     pressed, by id. Every press is counted and reported, so an interrupted lap says so in its own
     numbers instead of being invisible. */
  let doorPresses = 0, doorFailed = 0; const doorsUsed = {};
  const resumeDoor = () => {
    if(B.mode === 'play') return false;
    for(const id of ['shadeGo', 'hubTutGo', 'resBtn']){        // all three are wired to resumePlay
      const el = document.getElementById(id);
      if(el){ try { el.click(); doorPresses++; doorsUsed[id] = (doorsUsed[id] || 0) + 1; } catch(e){} }
      if(B.mode === 'play') return true;
    }
    doorFailed++;
    return false;
  };

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
  let lapPlayTicks = 0;                  // ticks the game was ACTUALLY stepping; see resumeDoor above
  for(let k = 0; k < TICKS; k++){
    const a = (k / 60) * 0.5;            // one slow lap, so the mobs are led rather than parked on
    IN.jx = Math.cos(a); IN.jz = Math.sin(a);
    if(B.mode === 'play') lapPlayTicks++;
    try { B.update(1 / 60); } catch(e){}
    /* The observer must not die, and topping HP up AFTER the update does not achieve that: a hit
       that takes it from full to zero inside one frame kills it before this line runs, and death
       leaves play mode permanently (see the trial reset below). invuln is the game's own field and
       does not stop the mobs chasing, which is the thing being measured. */
    G.p.hp = G.p.maxHp || 100; G.p.invuln = 999;
    resumeDoor();                        // an NPC card mid-lap must not silently end the measurement
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
  const trial = (name, flag, slots, tgtOf) => {
    /* THE OBSERVER HAS TO BE ALIVE, and the first version of this section did not check.
       Part 2 walks the player through thirty seconds of a live level and tops its HP back up AFTER
       each update - which stops it dying of attrition but does not undo a death that already
       happened, because p.dead stays set. A dead player's update does not step the enemies at all,
       so all three trials came back moved: 0 - the two that must read zero AND the one that must
       not. That reads exactly like a working guard and is a frozen game. The revive below is the
       fix; `player` in each row is the receipt, so a future freeze says so instead of passing. */
    G.p.dead = false; G.p.downed = false; G.p.hp = G.p.maxHp || 100; G.p.invuln = 999;
    /* AND CLEARING p.dead IS NOT ENOUGH, WHICH IS WHY `mode` IS REPORTED BELOW. update() returns at
       its third line unless mode === 'play' (13038), `mode` has no setter on __BF3 (19722 exports a
       getter only). A probe can revive the body it can reach and still be ticking a game that has
       stopped. Two runs read that as the observer's death; measured, it is the Warden's Shade card
       the lap walks into (see resumeDoor). Knock on the door here too, before the trial ticks, so a
       trial can never inherit a stopped game from the lap - and report `playTicks`, which is the
       receipt: a trial reporting fewer than `framesTicked` measured a frozen world and says so. */
    resumeDoor();
    for(const e of live()){ e.active = true; e.dropT = 0; e.mx = null; e.mz = null; }
    const pre = live().map(e => ({ mid:e.mid, x:e.x, z:e.z }));
    /* Where the host claims each body is. The default is the blunt +500 diagonal every earlier run
       used; `tgtOf` lets a trial ask for somewhere the level can actually support (see D). */
    const want = pre.map((b, i) => tgtOf ? tgtOf(b, i, pre) : { x: b.x + SHIFT, z: b.z + SHIFT });
    const rowsIn = pre.map((b, i) => { const e = byMid2(b.mid);
      const r = [b.mid, MP.typeIdx(e.type), Math.round(want[i].x), Math.round(want[i].z), 9999, 9999];
      if(slots === 7) r.push(flag);
      return r; });
    /* The gap actually asked for, per trial. It used to be reported as SHIFT*sqrt(2) for every row,
       which is right for A/B/C and wrong for any trial that does not use the +500 diagonal — D's
       gaps are set by where the other bodies happen to be standing, so a hard-coded 707 beside a
       residual of 1393 reads as a correction that made things worse. */
    let gap = 0; for(let i = 0; i < pre.length; i++) gap += Math.hypot(want[i].x - pre[i].x, want[i].z - pre[i].z);
    gap = pre.length ? Math.round(gap / pre.length) : 0;
    const aWas = MP.active, hWas = MP.isHost, kWas = MP._killed, gWas = MP._gotEn;
    MP._killed = {}; MP.active = true; MP.isHost = false;      // guest for the apply AND for the ticks:
    let threw = null;                                          // the pull is gated on MP.guest()
    try { MP.applyEnemies(rowsIn, null); } catch(err){ threw = String(err && err.message || err); }
    const FR = 20;                                             // k = min(1,dt*12) = 0.2/frame; 4 halve it
    let tickThrew = null, playTicks = 0;
    /* Per-frame correction magnitude, which Task 2 Step 7 asks for and which is cheaper and more
       honest than a photograph: a still frame cannot show rubber-banding. Sampled on one subject so
       the trace is readable - the first enemy carrying a stored target. */
    const trace = [];
    for(let k = 0; k < FR; k++){
      if(B.mode === 'play') playTicks++;
      const sub = live().find(e => e.mx != null);
      const bx = sub ? sub.x : 0, bz = sub ? sub.z : 0;
      try { B.update(1 / 60); } catch(err){ if(!tickThrew) tickThrew = String(err && err.message || err); }
      if(sub && trace.length < FR) trace.push(Math.round(Math.hypot(sub.x - bx, sub.z - bz) * 10) / 10);
      G.p.hp = G.p.maxHp || 100; G.p.dead = false; G.p.downed = false; G.p.invuln = 999;
      resumeDoor(); }
    MP.active = aWas; MP.isHost = hWas; MP._killed = kWas; MP._gotEn = gWas;
    /* DOES THE TARGET EXIST? The correction is applied one line before the game's own edge guard
       (index.html:13480), which restores e.sx/e.sz whenever `enemySupport` finds nothing under the
       body - so a pull toward a spot with no floor is REFUSED, by design, and reads as a correction
       that did not converge. `__BF3.floorAt` returns -Infinity for void (19783), which is the one
       number that tells the two apart, and the plan named it as the reading to take first.
       In real play the host's position is floored by construction (both clients build the same level
       from the same seed); the +500 diagonal a synthetic trial asks for is not. Splitting the
       residual by whether the TARGET had a floor is therefore the difference between "the correction
       is broken" and "this probe asked for the river". */
    let mv = 0, hp9 = 0, resid = 0, n = 0, targeted = 0;
    let onFloor = 0, offFloor = 0, residOn = 0, nOn = 0, residOff = 0, nOff = 0;
    /* WHICH BODIES WERE REFUSED, AND WHAT REFUSED THEM. A body that ends within a unit of where it
       started, on a frame it was pulled 141 units, was put back — that is the edge guard's
       `e.x=e.sx; e.z=e.sz`, the only thing on this path that undoes a whole step.
       The guard is evaluated where the body LANDS after one 20% step, not at the target, which is
       why `floorAt(target)` above turned out not to predict it: a floored target across a river is
       reached through the river. `firstStep` is that landing spot, computed the same way the game
       computes it (k = min(1, dt*12) = 0.2 at 60fps).
       And flyers and goblins skip the guard entirely (13481, `e.kind!=='fly'&&e.kind!=='goblin'`),
       so they are the built-in control: if the guard is what refuses the rest, those must converge. */
    let refused = 0, refusedVoidStep = 0, refusedFlooredStep = 0, exemptKind = 0, exemptRefused = 0;
    for(let i = 0; i < pre.length; i++){ const b = pre[i]; const e = byMid2(b.mid); if(!e) continue;
      const net = Math.hypot(e.x - b.x, e.z - b.z);
      if(net > 1) mv++;
      if(e.hp === 9999 || e.maxHp === 9999) hp9++;
      if(e.mx != null){ targeted++;
        const r = Math.hypot(e.x - e.mx, e.z - e.mz); resid += r; n++;
        let f = null; try { f = B.floorAt(e.mx, e.mz); } catch(err){}
        if(f != null && isFinite(f)){ onFloor++; residOn += r; nOn++; }
        else { offFloor++; residOff += r; nOff++; }
        const exempt = (e.kind === 'fly' || e.kind === 'goblin');
        if(exempt) exemptKind++;
        if(net <= 1){ refused++; if(exempt) exemptRefused++;
          let fs = null;
          try { fs = B.floorAt(b.x + (e.mx - b.x) * 0.2, b.z + (e.mz - b.z) * 0.2); } catch(err){}
          if(fs != null && isFinite(fs)) refusedFlooredStep++; else refusedVoidStep++; } } }
    return { trial:name, slotsSent:slots, flagSent:(slots === 7 ? flag : null), of:pre.length,
             moved:mv, hpAdopted:hp9, targetsStored:targeted,
             residualToTarget: n ? Math.round(resid / n) : null, gapAsked: gap,
             targetFloored: onFloor, targetInVoid: offFloor,
             residualFlooredTargets: nOn ? Math.round(residOn / nOn) : null,
             residualVoidTargets: nOff ? Math.round(residOff / nOff) : null,
             refusedEntirely: refused, refusedWhoseFirstStepIsVoid: refusedVoidStep,
             refusedWhoseFirstStepIsFloored: refusedFlooredStep,
             guardExemptKinds: exemptKind, guardExemptButRefused: exemptRefused,
             framesTicked:FR, playTicks:playTicks, perFrameStep:trace,
             threw:threw, tickThrew:tickThrew,
             player: { dead:!!G.p.dead, hp:Math.round(G.p.hp) }, mode: B.mode };
  };
  function byMid2(mid){ for(const e of live()) if(e.mid === mid) return e; return null; }
  /* D asks for a place the level definitely supports: the position another LIVE enemy is standing on
     right now. Nothing is chosen and no floor is searched for — a body standing somewhere is proof
     that somewhere is standable, which is what makes this the real-play case rather than a kinder
     one. Same flag, same frames, same bodies as C; only the destination differs. */
  const correction = [ trial('A_sleeping', 0, 7), trial('B_oldPeer', null, 6), trial('C_awake', 1, 7),
                       trial('D_awakeFlooredTarget', 1, 7,
                             (b, i, pre) => pre[(i + Math.floor(pre.length / 2)) % pre.length]) ];

  return JSON.stringify({
    ok: true, at: G.areaName,
    /* `seconds` is what the lap actually STEPPED, not what it asked for. Before the door-knock this
       read 30 while the game had stopped at 7.3, and the travel figures below were quoted as
       30-second drift in MP_AUDIT.md, BACKLOG.md and the plan. */
    seconds: Math.round(lapPlayTicks / 60 * 10) / 10, secondsAsked: TICKS / 60,
    lap: { playTicks: lapPlayTicks, ofTicks: TICKS,
           doorPresses: doorPresses, doorsUsed: doorsUsed, doorFailed: doorFailed },
    reconcile: { enemies: before.length, movedBySnapshot: moved, hpAdoptedFromSnapshot: hpTook,
                 shiftAsked: SHIFT, threw: applyThrew },
    travel: rows.slice(0, 12),
    survivors: rows.length,
    correction: correction,
    /* THE BAR IS `targetsStored`, NOT `moved`, AND THE CHANGE IS THE FROZEN BENCH'S DOING.
       While the trials were ticking a stopped game, `moved` was a clean discriminator because the
       only thing that could move a body was the correction. On a world that is actually running, the
       mobs are awake and chasing the observer, so A and B both read `moved: 6` of 40 from their own
       AI - and a bar that reads 6 where it demands 0 would now fail against a CORRECT build.
       `targetsStored` is what the wake flag actually gates (applyEnemies writes e.mx/e.mz only when
       slot 6 says awake), it is unreachable by any amount of walking, and it reads 0 / 0 / 40 / 40.
       `moved` is still reported, because it is the thing a player would see. */
    verdict: (correction[0].targetsStored === 0 && correction[1].targetsStored === 0
              && correction[2].targetsStored > 0)
      ? 'corrected only when the host is awake to it'
      : 'NOT the designed behaviour — read the trials',
  });
})()
