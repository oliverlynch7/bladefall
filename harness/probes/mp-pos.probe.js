/* WHAT WOULD IT COST TO GIVE A GUEST THE HOST'S ENEMY POSITIONS?

   docs/BACKLOG.md item 1 states the fix shape as "sync position for enemies currently in combat with
   any player - not for all enemies, because the existing design deliberately avoids per-frame
   position sync FOR BANDWIDTH". mp-drift.probe.js measured that position is never reconciled and how
   far the two pictures drift. It did not measure the premise of the fix, and a plan is about to be
   written on it, so this probe asks the four questions that decide the design:

   1. IS POSITION ALREADY ON THE WIRE, AND WHAT DOES THE PACKET COST? enemySnap() is read here rather
      than described: the real array the host sends, its real JSON length, and the whole state message
      around it, costed at the send cadence the file actually uses. If x and z are already in every
      packet then "for bandwidth" is not a reason to be selective and the plan must not inherit it.

   2. HOW MANY ENEMIES ARE THERE TO BE SELECTIVE ABOUT? The snapshot is capped, the wake radius is the
      game's own, and a selective sync is only worth its complexity if the in-combat set is much
      smaller than the whole.

   3. DOES A GUEST'S MIRROR ENEMY RUN ITS OWN AI? applyEnemies stamps mirror:true on a spawn. If
      nothing gates the enemy update on it, a guest is running a full independent simulation of every
      mob, and any correction the host sends has to win against that simulation rather than merely
      arrive. Asked by putting the game in guest mode and ticking with NO snapshot at all.

   4. HOW HARD DOES THAT SIMULATION PUSH? Per-frame AI displacement, measured, against what a lerp at
      the file's own peer constant (MP.tick, k = min(1, dt*12)) would close in the same frame. This is
      the number that decides snap-vs-lerp, and it is the one thing a plan cannot get from reading.

   WHAT THIS IS NOT: a network measurement. No session is held and no packet crosses a wire. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);
  const p = G.p;

  /* Campaign mobs spawn with mid == null - mids are assigned when a session starts - and both
     enemySnap() and applyEnemies are keyed entirely on mid. Stamp them the way a host would, or
     every question below measures an empty list. */
  let stamped = 0;
  for(const e of live()){ if(e.mid == null) e.mid = 900000 + (stamped++); }
  if(!live().length) return JSON.stringify({ ok:false, why:'no live enemies here to measure' });

  /* ---- 1. the packet, as the host actually builds it ------------------------------------------ */
  const wasActive = MP.active, wasHost = MP.isHost, wasGot = MP._gotEn, wasKilled = MP._killed;
  MP.active = true; MP.isHost = true;                 // enemySnap() itself does not gate on this, but
  const snap = MP.enemySnap();                        // typeIdx caches off the live ENEMY table
  MP.active = wasActive; MP.isHost = wasHost;

  const row0 = snap[0] || null;
  const enBytes = JSON.stringify(snap).length;
  // the whole message the host sends, so the enemy half is costed in proportion rather than alone
  let msgBytes = null, players = null;
  try {
    const all = [MP.selfState()];
    players = all.length;
    msgBytes = JSON.stringify({ t:'state', players:all, en:snap, ek:[] }).length;
  } catch(err){ msgBytes = 'threw: ' + String(err && err.message || err); }

  const HZ = Math.round(1 / 0.07);                    // MP.tick's own send gate

  /* Does the row carry a position at all? Answered off the array the host built, not off the format
     comment above it. Compare each row's slots 2 and 3 against the enemy that produced it. */
  let posCarried = 0;
  for(const a of snap){
    const e = live().find(x => x.mid === a[0]); if(!e) continue;
    if(Math.abs(a[2] - e.x) <= 1 && Math.abs(a[3] - e.z) <= 1) posCarried++;
  }

  /* ---- 2. the population a selective sync would be selecting from ----------------------------- */
  const dist = e => Math.hypot(e.x - p.x, e.z - p.z);
  const all = live();
  const pop = {
    live: all.length,
    inSnapshot: snap.length,
    capped: snap.length < all.length,
    active: all.filter(e => e.active).length,
    within640: all.filter(e => dist(e) < 640).length,   // the game's own wake radius (index.html:13384)
    within300: all.filter(e => dist(e) < 300).length,
    within125: all.filter(e => dist(e) < 125).length,   // ~max melee reach, from mp-drift.probe.js
  };

  /* ---- 3. does a guest simulate its own mobs? ---------------------------------------------------
     Guest mode, every mob woken through the game's own two fields, and NOT ONE SNAPSHOT APPLIED.
     Anything that moves, moved because the guest's own AI moved it. */
  for(const e of all){ e.active = true; e.dropT = 0; }

  /* ---- 1b. is the wake flag a CONSTANT? --------------------------------------------------------
     Slot 6 is e.active. At the entrance every mob is asleep, so an all-zero column is CORRECT there
     and proves nothing — a flag hard-wired to 0 would read identically and would let the guest-side
     correction pass its own tests while never correcting anything. The same snapshot is therefore
     taken again now that the loop above has woken all of them, in the one launch. */
  const flagsOf = s => s.reduce((n, a) => n + (a[6] === 1 ? 1 : 0), 0);
  MP.active = true; MP.isHost = true;
  const snapAwake = MP.enemySnap();
  MP.active = wasActive; MP.isHost = wasHost;
  const wakeFlag = {
    slot: 6,
    asleep: { activeEnemies: pop.active, rows: snap.length, flagsSet: flagsOf(snap) },
    awake:  { activeEnemies: live().filter(e => e.active).length, rows: snapAwake.length, flagsSet: flagsOf(snapAwake) },
    rowFormatAwake: snapAwake[0] || null,
    // slot 6 absent entirely (an older peer, or a pre-flag build) must read as undefined, not as 0
    slotPresent: snap.length ? snap[0].length === 7 : null,
    enemyBytesAwake: JSON.stringify(snapAwake).length,
  };

  MP.active = true; MP.isHost = false; MP._gotEn = false; MP._killed = {};
  const mark = all.map(e => ({ mid:e.mid, type:e.type, x:e.x, z:e.z, r:e.r, hp:e.hp }));
  const TICKS = 60;                                   // one second at the game's own step
  let stepMax = 0, stepSum = 0, stepN = 0;
  const prev = {}; for(const e of all) prev[e.mid] = { x:e.x, z:e.z };
  for(let k = 0; k < TICKS; k++){
    try { B.update(1 / 60); } catch(err){}
    G.p.hp = G.p.maxHp || 100;                        // the observer must not die mid-measurement
    for(const e of live()){
      const q = prev[e.mid]; if(!q) continue;
      const s = Math.hypot(e.x - q.x, e.z - q.z);
      if(s > stepMax) stepMax = s;
      if(s > 0.01){ stepSum += s; stepN++; }
      q.x = e.x; q.z = e.z;
    }
  }
  MP.active = wasActive; MP.isHost = wasHost; MP._gotEn = wasGot; MP._killed = wasKilled;

  const byMid = {}; for(const e of live()) byMid[e.mid] = e;
  let movedAsGuest = 0, totalMove = 0;
  for(const m of mark){
    const e = byMid[m.mid]; if(!e) continue;
    const d = Math.hypot(e.x - m.x, e.z - m.z);
    if(d > 1){ movedAsGuest++; totalMove += d; }
  }

  /* ---- 4. snap vs lerp: what each moves in ONE frame -------------------------------------------
     The AI's own per-frame step against what the peer lerp would close on a gap the size of the
     measured 30s drift. If the lerp's frame is far larger than the AI's, the correction wins and a
     hard snap is not needed; if it is smaller, a lerp would never catch up and the plan must say so. */
  const dt = 1 / 60, K = Math.min(1, dt * 12);        // MP.tick, index.html:12342
  const GAP = 450;                                    // mid-range of mp-drift's measured 380-562
  const contest = {
    lerpK: +K.toFixed(4),
    aiStepPerFrameMax: +stepMax.toFixed(2),
    aiStepPerFrameMean: stepN ? +(stepSum / stepN).toFixed(2) : 0,
    lerpClosesPerFrame: +(GAP * K).toFixed(2),
    onGap: GAP,
    framesToHalveGap: Math.ceil(Math.log(0.5) / Math.log(1 - K)),
  };

  return JSON.stringify({
    ok: true, at: G.areaName,
    packet: { rowFormat: row0, rowsSent: snap.length, positionsCarried: posCarried,
              enemyBytes: enBytes, wholeMessageBytes: msgBytes, playersInMessage: players,
              sendHz: HZ, enemyBytesPerSecond: enBytes * HZ },
    wakeFlag: wakeFlag,
    population: pop,
    guestSimulatesItsOwnMobs: { ticked: TICKS, moved: movedAsGuest, of: mark.length,
                                meanMove: movedAsGuest ? Math.round(totalMove / movedAsGuest) : 0 },
    contest: contest,
  });
})()
