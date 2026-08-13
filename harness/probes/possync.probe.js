/* DOES A GUEST STILL ADOPT THE HOST'S ENEMY POSITIONS, AND STILL ONLY WHERE IT SHOULD?

   Sub-project D, the guest-position plan's Task 3. This is a REGRESSION GUARD, not a discovery
   probe: `mp-drift.probe.js` is where the mechanism was found and measured, and it costs a 30-second
   lap plus four trials. This asks the two questions that must never quietly stop being true, in one
   launch and no lap:

     1. the host has this enemy AWAKE  → the guest's body is pulled most of the way to it
     2. the host has this enemy ASLEEP → nothing is stored and nothing is pulled

   Two is not decoration. The awake assertion alone passes just as happily against a build that
   ignores the wake flag and adopts every position it is sent — which would drag back every monster a
   guest is fighting alone, the exact behaviour slot 6 was added to prevent.

   ── WHY THE TARGET IS 90 UNITS TOWARD THE PLAYER AND NOT THE +500 DIAGONAL mp-drift USES ──
   Measured, not chosen for neatness. The correction is applied one line before the game's own edge
   guard (index.html:13477–13481): `enemySupport` looks under the body AFTER one 20% step and, finding
   nothing, restores `e.sx/e.sz` — so a pull whose intermediate landing spot is over void is REFUSED,
   by design. On a +500 diagonal that is most of the level: mp-drift measures 28 of 41 bodies refused,
   every one of them with its first step in void and not one with a floored first step. That is the
   probe's own doing rather than a live defect — a real host snapshot at 14 Hz moves a body a few
   units from ground it is already standing on — but a suite whose bar is "the gap closed" would read
   it as a failure forever.
   So the target here is a SHORT step toward the player, which is floored by construction (the player
   is standing on it), and every body is checked with `floorAt` before it is allowed to count. A body
   whose target or first step is over void is reported and excluded rather than silently averaged in.

   WHAT THIS IS NOT: a network measurement. No session is held and no packet crosses a wire. Two real
   machines remain the final check for latency and jitter. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!G || !G.p) return JSON.stringify({ ok:false, why:'no game' });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && e.mid != null && !e.practice && !e.dummy);

  /* Campaign enemies spawn with mid == null — a host assigns mids when a session starts, and
     applyEnemies is keyed entirely on mid. Without this the snapshot reconciles to nothing and every
     trial reads "no sync" for a reason that has nothing to do with the code under test. */
  let stamped = 0;
  for(const e of (G.enemies || [])){
    if(e && !e.dead && !e.practice && !e.dummy && e.mid == null) e.mid = 900000 + (stamped++);
  }
  /* Awake in the GAME's sense (e.active), which is a different thing from slot 6 of the snapshot: this
     is whether the GUEST is simulating the body, and it has to be true or the enemy update returns
     before ever reaching the correction. Slot 6 is what the HOST claims, and that is what varies
     between the two trials below. */
  for(const e of live()){ e.active = true; e.dropT = 0; e.mx = null; e.mz = null; }

  const all = live();
  if(all.length < 4) return JSON.stringify({ ok:false, why:'too few live enemies here to measure', of:all.length });

  const STEP = 90;          // one snapshot's worth of travel, not a teleport — see the header
  const FRAMES = 20;        // k = min(1, dt*12) = 0.2 a frame; four halve the gap, twenty settle it
  const floored = (x, z) => { try { const f = B.floorAt(x, z); return f != null && isFinite(f); } catch(e){ return false; } };

  const byMid = m => { for(const e of live()) if(e.mid === m) return e; return null; };

  /* One trial = one applied snapshot + FRAMES of the game's own update, with the game in guest mode
     for both (the pull is gated on MP.guest(), so a trial that flips back before ticking measures a
     correction that never runs). */
  const trial = (name, awake) => {
    for(const e of live()){ e.mx = null; e.mz = null; }
    const pre = live().map(e => ({ mid:e.mid, x:e.x, z:e.z }));
    /* Toward the player: floored at the far end by construction, and short enough that the
       intermediate landing spot is floored too. Both are checked below rather than assumed. */
    const want = pre.map(b => {
      const dx = G.p.x - b.x, dz = G.p.z - b.z, d = Math.hypot(dx, dz) || 1;
      return { x: b.x + dx / d * STEP, z: b.z + dz / d * STEP };
    });
    const rows = pre.map((b, i) => {
      const e = byMid(b.mid);
      return [b.mid, MP.typeIdx(e.type), Math.round(want[i].x), Math.round(want[i].z), 9999, 9999, awake ? 1 : 0];
    });

    const aWas = MP.active, hWas = MP.isHost, kWas = MP._killed, gWas = MP._gotEn;
    MP._killed = {}; MP.active = true; MP.isHost = false;
    let threw = null;
    try { MP.applyEnemies(rows, null); } catch(err){ threw = String(err && err.message || err); }
    let tickThrew = null, playTicks = 0;
    for(let k = 0; k < FRAMES; k++){
      if(B.mode === 'play') playTicks++;
      try { B.update(1 / 60); } catch(err){ if(!tickThrew) tickThrew = String(err && err.message || err); }
      /* The observer must not die mid-trial: death takes the game out of play mode and `mode` has no
         setter, so every remaining frame would tick a stopped world and report a correction that
         never ran. AUTOPILOT.md records this failing silently for two runs. */
      G.p.hp = G.p.maxHp || 100; G.p.dead = false; G.p.downed = false; G.p.invuln = 999;
    }
    MP.active = aWas; MP.isHost = hWas; MP._killed = kWas; MP._gotEn = gWas;

    /* Only bodies the edge guard cannot refuse are scored, and how many were dropped is reported so a
       trial that scores almost nothing cannot look like a clean pass. */
    let stored = 0, hp9 = 0, scored = 0, closedSum = 0, movedAny = 0, skippedVoid = 0;
    for(let i = 0; i < pre.length; i++){
      const b = pre[i], e = byMid(b.mid); if(!e) continue;
      if(e.hp === 9999 || e.maxHp === 9999) hp9++;
      if(e.mx != null) stored++;
      if(Math.hypot(e.x - b.x, e.z - b.z) > 1) movedAny++;
      const firstX = b.x + (want[i].x - b.x) * 0.2, firstZ = b.z + (want[i].z - b.z) * 0.2;
      if(!floored(want[i].x, want[i].z) || !floored(firstX, firstZ)){ skippedVoid++; continue; }
      const gap0 = Math.hypot(want[i].x - b.x, want[i].z - b.z) || 1;
      const gap1 = Math.hypot(want[i].x - e.x, want[i].z - e.z);
      closedSum += Math.max(0, Math.min(1, 1 - gap1 / gap0));
      scored++;
    }
    return { trial:name, awakeSent:awake ? 1 : 0, of:pre.length,
             targetsStored:stored, hpAdopted:hp9, movedAtAll:movedAny,
             scored:scored, skippedOverVoid:skippedVoid,
             /* Mean fraction of the asked-for gap that was actually closed. 1.0 is "arrived"; a lerp
                never exactly arrives, so the suite's bar is deliberately well under it.
                IN THE ASLEEP TRIAL THIS IS THE CONTROL, and it is the reason the target points at
                the player rather than anywhere else: the mobs are awake in the game's sense and
                chasing, so some of them close this distance on their own. The asleep trial computes
                the same target, sends it with the wake flag CLEAR, and reports how much of it the AI
                closed by itself — so the suite can require the awake trial to beat the AI rather
                than merely to move, which is a bar a build with the correction deleted could pass. */
             gapClosed: scored ? Math.round(closedSum / scored * 100) / 100 : null,
             framesTicked:FRAMES, playTicks:playTicks, threw:threw, tickThrew:tickThrew,
             mode:B.mode, player:{ dead:!!G.p.dead, hp:Math.round(G.p.hp) } };
  };

  /* ASLEEP FIRST, ON PURPOSE. The awake trial scatters bodies toward the player; running it first
     would hand the asleep trial a level whose mobs are already somewhere else, and any movement they
     then made from their own AI would read as a correction the flag failed to suppress. */
  const asleep = trial('asleep', false);
  const awake  = trial('awake',  true);

  return JSON.stringify({
    ok: true, at: G.areaName, enemies: all.length, stampedMids: stamped, step: STEP,
    asleep: asleep, awake: awake,
    /* Reported so a run under ?nopossync=1 says WHY it failed rather than only that it did. */
    posSyncOff: !!B.NO_POS_SYNC,
  });
})()
