/* DOES THE 14 Hz CORRECTION ACTUALLY CLOSE THE GAP BETWEEN TWO SIMULATIONS OF THE SAME LEVEL?

   Sub-project E, Task 2 Step 6 — the one thing `mp-drift.probe.js` could not ask. That probe
   applies a SYNTHETIC snapshot (+500 on both axes) and measures how fast one body converges. It
   proves the mechanism. It cannot prove the mechanism is worth having, because the number it is
   supposed to beat — how far two independent clients' pictures separate over a lap — had never been
   measured against a real second picture. It was inferred from how far a single mob TRAVELS, which
   is an upper bound, not a separation.

   This probe stands up the second picture. Three laps, one launch, one level:

     1. HOST    build the level, walk the lap, record `MP.enemySnap()` at the game's own 14 Hz gate.
     2. GUEST+  rebuild the SAME level, walk the SAME lap, apply the host's packets. Measure the
                distance between each body and the same body in the host's recording.
     3. GUEST-  rebuild it again, same lap, same packets with SLOT 6 REMOVED — the pre-flag packet,
                which `applyEnemies` fails safe on by leaving e.mx alone. This is the control, and it
                is the whole reason the number in 2 means anything.

   2 and 3 differ by ONE ARRAY SLOT. Everything else — level, seed, mids, player path, packet rate,
   packet contents, HP reconciliation, mirror culling — is identical. If 3 also read small, the fix
   would not be what closed the gap and this probe would say so.

   HOW A SECOND SIMULATION IS STOOD UP, since nothing here had one before. Not by a second page or a
   second world object: by the game's own co-op mechanism. `enterZone` adopts `MP.rseed` when it is a
   guest (index.html:4215) precisely so two clients build the same dungeon, and `spawnEnemy` hands
   out mids in spawn order (7703) precisely so their bodies line up. Rebuilding at the recorded
   runSeed IS what the second machine does. Measured, not assumed: the roster comparison below
   reports how many mids, types and spawn points survived the rebuild, and a rebuild that did not
   reproduce the level would make every separation figure meaningless — so it is reported first.

   WHAT THIS IS NOT. No wire, no jitter, no packet loss. The only staleness modelled is that a guest
   applies the packet from the PREVIOUS 14 Hz tick, not the one being recorded on the frame it is
   measured against — one packet period, ~71 ms, which is the floor any real link has. So these are
   BEST-CASE separations for the corrected lap. The control has the same handicap and is unaffected
   by it, since it ignores position entirely.

   WHAT WOULD MAKE THIS LIE, in the order it has already bitten this sub-project:
   - A frozen game. `update()` returns unless mode === 'play' (13122) and an NPC card mid-lap stops
     it, which once turned 30 seconds into 7.3 and read as a working guard. Every lap reports
     `playTicks` and its door presses.
   - A dead observer. A dead player's update does not step the enemies at all. Revived every frame;
     `player` is the receipt.
   - Laps that did not line up. Both laps fire on the same tick numbers because the 14 Hz gate is a
     fixed-dt accumulator; `sampleMisaligned` counts any that did not, and it must be 0.
   - Nothing to compare. `comparedAtEnd` is how many bodies were alive in BOTH pictures at the end. */
(function(){
  const B = __BF3, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!B.G) return JSON.stringify({ ok:false, why:'no G' });

  const DT = 1 / 60, TICKS = 1800, SEND = 0.07;      // SEND is MP.tick's own gate (12439) — 14 Hz
  const SEED = B.G.runSeed;
  const ZONE = B.G.zone;

  const live = () => (B.G.enemies || []).filter(e => e && !e.dead && e.mid != null
                                                  && !e.practice && !e.dummy && !e.bot);
  /* Only doors whose handler is `resumePlay`, pressed by id — never "the first button in the
     overlay", which AUTOPILOT.md records taking `tutSkip` and skipping a whole trial. */
  let doorPresses = 0, doorFailed = 0; const doorsUsed = {};
  const knock = () => { if(B.mode === 'play') return true;
    for(const id of ['shadeGo', 'hubTutGo', 'resBtn']){ const el = document.getElementById(id);
      if(el){ try { el.click(); doorPresses++; doorsUsed[id] = (doorsUsed[id] || 0) + 1; } catch(e){} }
      if(B.mode === 'play') return true; }
    doorFailed++; return false; };

  /* ---- build the level again, the way the second machine does ---------------------------------- */
  const build = () => {
    const aW = MP.active, hW = MP.isHost, sW = MP.rseed;
    MP.active = true; MP.isHost = false; MP.rseed = SEED;     // the guest branch of enterZone (4215)
    let threw = null;
    try { B.enterZone(ZONE); } catch(e){ threw = String(e && e.message || e); }
    MP.active = aW; MP.isHost = hW; MP.rseed = sW;
    knock();
    /* Woken through the game's own two fields, not moved. A lap at the entrance with everything
       asleep watches a level in which nothing happens — and asleep, the two pictures agree at 0
       units for the trivial reason that neither body ever moves. */
    for(const e of live()){ e.active = true; e.dropT = 0; e.mx = null; e.mz = null; }
    return { threw:threw, seed:B.G.runSeed, at:B.G.areaName, enemies:live().length,
             startP:{ x:Math.round(B.G.p.x), z:Math.round(B.G.p.z), lvl:B.G.p.level },
             roster:live().map(e => ({ mid:e.mid, type:e.type, x:Math.round(e.x), z:Math.round(e.z),
                                       r:Math.round(e.r) })) };
  };

  const posOf = () => { const m = {}; for(const e of live()) m[e.mid] = { x:e.x, z:e.z }; return m; };

  /* ---- one lap ---------------------------------------------------------------------------------
     role 'host'  : records a packet + a position picture at every 14 Hz gate.
     role 'guest' : applies the PREVIOUS packet at every gate, then measures against the host's
                    picture for THIS gate. `strip` drops slot 6, which is the pre-flag packet. */
  const lap = (role, trace, strip, hostInfo) => {
    const IN = B.input, camWas = B.meta.camMode;
    B.meta.camMode = 'far';                            // world-space steering; camera-relative spins
    const aW = MP.active, hW = MP.isHost, kW = MP._killed, gW = MP._gotEn;
    MP._killed = {}; MP.active = true; MP.isHost = (role === 'host');
    const samples = [], series = [];
    const startPos = posOf(), trackPath = {};
    for(const e of live()) trackPath[e.mid] = { px:e.x, pz:e.z, path:0 };
    let playTicks = 0, applyThrew = null, si = 0, misaligned = 0, sendT = 0;
    const dp0 = doorPresses, df0 = doorFailed;

    for(let k = 0; k < TICKS; k++){
      const a = (k / 60) * 0.5;                        // one slow lap, so the mobs are led, not parked on
      IN.jx = Math.cos(a); IN.jz = Math.sin(a);
      sendT += DT; const fire = sendT >= SEND; if(fire) sendT = 0;

      if(fire && role === 'guest'){
        if(trace[si] && trace[si].k !== k) misaligned++;
        const prev = trace[si - 1];                    // one packet period of staleness, not zero
        if(prev){ const rows = strip ? prev.rows.map(r => r.slice(0, 6)) : prev.rows;
          try { MP.applyEnemies(rows, null); } catch(e){ if(!applyThrew) applyThrew = String(e && e.message || e); } }
      }
      if(B.mode === 'play') playTicks++;
      try { B.update(DT); } catch(e){}
      /* invuln is the game's own field and does not stop the mobs chasing, which is the thing being
         measured. Topping up AFTER the update does not prevent a death inside one frame, so p.dead
         is cleared here too — a dead player's update steps no enemies at all. */
      B.G.p.hp = B.G.p.maxHp || 100; B.G.p.dead = false; B.G.p.downed = false; B.G.p.invuln = 999;
      knock();

      for(const e of live()){ const t = trackPath[e.mid]; if(!t) continue;
        t.path += Math.hypot(e.x - t.px, e.z - t.pz); t.px = e.x; t.pz = e.z; }

      if(fire){
        if(role === 'host'){ samples.push({ k:k, rows:MP.enemySnap(), pos:posOf() }); }
        else {
          const h = trace[si];
          if(h){ let n = 0, sum = 0, mx = 0;
            for(const e of live()){ const hp = h.pos[e.mid]; if(!hp) continue;
              const d = Math.hypot(e.x - hp.x, e.z - hp.z); n++; sum += d; if(d > mx) mx = d; }
            series.push({ t:+(k / 60).toFixed(1), n:n, mean:Math.round(n ? sum / n : 0), max:Math.round(mx) }); }
          si++;
        }
      }
    }
    IN.jx = 0; IN.jz = 0; B.meta.camMode = camWas;
    MP.active = aW; MP.isHost = hW; MP._killed = kW; MP._gotEn = gW;

    /* End-of-lap picture: the number Step 6 asks to be stated. Compared against the host's LAST
       recorded picture, per body, only for bodies alive in both. */
    let per = [];
    if(role === 'guest'){
      const h = trace[trace.length - 1];
      for(const e of live()){ const hp = h && h.pos[e.mid]; if(!hp) continue;
        per.push({ mid:e.mid, type:e.type, r:Math.round(e.r),
                   sep:Math.round(Math.hypot(e.x - hp.x, e.z - hp.z)),
                   /* Two things that would otherwise be hidden inside a mean:
                      - hostNet: how far this body actually WENT on the host. A body that never left
                        its spawn agrees with the other picture at 0 units for a reason that has
                        nothing to do with this fix, and roughly two thirds of a level's mobs never
                        reach the observer's lap at all. Averaged in, they flatter both columns.
                      - sameType: whether the two builds even agree what this creature IS. They do
                        not always — `saltMob` (4716) and the role roll (7690) use unseeded
                        Math.random, so a minority of bodies are a flyer on one client and a grunt on
                        the other. That is a REAL co-op defect and not this plan's; it is split out
                        here so it cannot be quietly credited to (or blamed on) the position fix. */
                   hostNet:hostInfo ? Math.round(hostInfo.net[e.mid] || 0) : null,
                   sameType:hostInfo ? (hostInfo.types[e.mid] === e.type) : null,
                   hostType:hostInfo ? (hostInfo.types[e.mid] || null) : null,
                   /* THE FIRST GUESS AT WHY A BODY DID NOT CONVERGE, AND IT WAS MEASURED WRONG —
                      kept, with the refutation, because the wrong guess is the useful part.
                      The correction lands one line before the game's own edge guard, which restores
                      e.sx/e.sz whenever `enemySupport` finds nothing under the body, so "the guest
                      was asked to stand in the river" was the obvious explanation for a pull that
                      does not arrive. `floorAt` returns -Infinity for void (19783) and this reads
                      it. It does NOT explain the bodies that stayed apart: measured 2026-08-13, the
                      two worst had `targetFloored: true` at 1294 and 1079 units out.
                      `mp-drift.probe.js` already recorded why this test cannot settle it — the guard
                      is evaluated where the body LANDS after one 20% step, not at the target, so a
                      floored target across a river is reached through the river. This probe
                      therefore does NOT establish the cause, and does not claim one. */
                   kind:e.kind, guardExempt:(e.kind === 'fly' || e.kind === 'goblin'),
                   targetFloored:(function(){ if(e.mx == null) return null;
                     try { return isFinite(B.floorAt(e.mx, e.mz)); } catch(err){ return null; } })() }); }
      per.sort((x, y) => y.sep - x.sep);
    }
    const travel = [];
    for(const e of live()){ const t = trackPath[e.mid], s = startPos[e.mid]; if(!t || !s) continue;
      travel.push({ travelled:Math.round(t.path), net:Math.round(Math.hypot(e.x - s.x, e.z - s.z)) }); }
    travel.sort((x, y) => y.travelled - x.travelled);

    const stat = (arr) => { if(!arr.length) return null; const s = arr.slice().sort((a, b) => a - b);
      return { n:s.length, mean:Math.round(s.reduce((a, b) => a + b, 0) / s.length),
               median:s[Math.floor(s.length / 2)], p90:s[Math.floor(s.length * 0.9)],
               max:s[s.length - 1], min:s[0] }; };
    const MOVED = 50;                                  // "this body actually relocated during the lap"
    const movers = per.filter(p => (p.hostNet || 0) > MOVED);

    const packets = (role === 'host' ? samples.length : si);
    return { role:role, slot6:(role === 'guest' ? !strip : null),
             playTicks:playTicks, ofTicks:TICKS, seconds:+(playTicks / 60).toFixed(1),
             doorPresses:doorPresses - dp0, doorFailed:doorFailed - df0,
             packets:packets, sampleMisaligned:misaligned,
             /* The gate is `_sendT>=0.07` and it RESETS TO ZERO rather than subtracting (12439), so
                at a locked dt of 1/60 it fires on every fifth frame, not every 4.2. Reported as
                measured — the plan and MP_AUDIT.md both call this rate 14 Hz. */
             packetsPerSecond:+(packets / (playTicks / 60)).toFixed(1),
             applyThrew:applyThrew, mode:B.mode,
             player:{ dead:!!B.G.p.dead, hp:Math.round(B.G.p.hp), x:Math.round(B.G.p.x), z:Math.round(B.G.p.z) },
             aliveAtEnd:live().length, comparedAtEnd:per.length,
             separationAtEnd:stat(per.map(p => p.sep)),
             /* The three cuts that matter, because the all-bodies mean is the weakest of them:
                movers  — bodies the host actually moved more than 50 units. The rest sit at their
                          spawn in both pictures and agree at 0 for free.
                agreed  — movers the two builds also agree are the same creature. The cleanest
                          apples-to-apples, and the number to quote if only one is quoted.
                salted  — movers they DISAGREE about. Reported separately so the bestiary defect is
                          visible instead of being averaged into this plan's result. */
             separationMovers:stat(movers.map(p => p.sep)),
             separationMoversSameType:stat(movers.filter(p => p.sameType).map(p => p.sep)),
             separationMoversSaltedApart:stat(movers.filter(p => p.sameType === false).map(p => p.sep)),
             saltedDetail:movers.filter(p => p.sameType === false)
               .map(p => ({ mid:p.mid, host:p.hostType, guest:p.type, guestKind:p.kind,
                            guardExempt:p.guardExempt, targetFloored:p.targetFloored, sep:p.sep })),
             worstFive:per.slice(0, 5),
             /* Every 5 seconds of the lap, so a number that only looks good at the finish line says so. */
             separationOverTime:series.filter((s, i) => i % 70 === 0 || i === series.length - 1)
                                      .map(s => ({ t:s.t, mean:s.mean, max:s.max, n:s.n })),
             travelTop3:travel.slice(0, 3), _samples:samples };
  };

  /* ---- run it ---------------------------------------------------------------------------------- */
  const b1 = build();
  const hostLap = lap('host', null, false, null);
  const trace = hostLap._samples; delete hostLap._samples;

  /* What the HOST's own picture did over the lap, which is what decides whether a body is worth
     comparing at all. Taken from the recording rather than from the live world, because the live
     world has been rebuilt twice by the time this is read. */
  const hostInfo = { types:{}, net:{} };
  for(const r of b1.roster) hostInfo.types[r.mid] = r.type;
  { const f = trace[0], l = trace[trace.length - 1];
    if(f && l) for(const mid in l.pos){ const a = f.pos[mid], b = l.pos[mid];
      if(a && b) hostInfo.net[mid] = Math.hypot(b.x - a.x, b.z - a.z); } }

  const b2 = build();
  const on = lap('guest', trace, false, hostInfo); delete on._samples;

  const b3 = build();
  const off = lap('guest', trace, true, hostInfo); delete off._samples;

  /* Did the rebuild actually reproduce the level? If not, nothing above means anything. Types and
     roles are rolled with unseeded Math.random inside spawnEnemy (saltMob at 4716, the role roll at
     7690), so a minority genuinely differ between two builds — which is what happens between two
     real clients too, and is reported rather than hidden. */
  const cmp = (a, b) => { const by = {}; for(const r of a.roster) by[r.mid] = r;
    let mid = 0, type = 0, spawn = 0;
    for(const r of b.roster){ const o = by[r.mid]; if(!o) continue; mid++;
      if(o.type === r.type) type++;
      if(Math.hypot(o.x - r.x, o.z - r.z) <= 1) spawn++; }
    return { of:b.roster.length, midsMatched:mid, sameType:type, sameSpawnPoint:spawn }; };
  const rebuilt = { hostVsGuestOn:cmp(b1, b2), hostVsGuestOff:cmp(b1, b3) };
  /* The rosters are 41 rows each and would bury everything else. Their content has been reduced to
     `rebuilt` above; three rows are kept so the shape is still visible in the output. */
  for(const b of [b1, b2, b3]){ b.rosterHead = b.roster.slice(0, 3); delete b.roster; }

  /* Reach, read off the bodies rather than named here, and it is NOT the number the plan and
     MP_AUDIT.md section 3 compare against. Theirs is
     `((e.weapon&&e.weapon.range)||60)+e.r+p.r` ≈ 90–125, which lives at 12947 **inside `botAI`** —
     the Arena/duel bot AI that the campaign enemy loop `continue`s past on its second line (13476).
     No campaign monster has ever used it. What a campaign mob damages you on is the radius sum at
     13573, `dXZ(e.x,e.z,p.x,p.z) < (e.r + p.r)`, and that is what is read here. It comes out about a
     quarter of the quoted figure, so every bar in this probe is HARSHER than the plan's, not kinder.
     Corrected in MP_AUDIT.md the same day this probe was written. */
  const pr = B.G.p.r || 0;
  const reaches = live().map(e => Math.round(e.r + pr));
  const reach = reaches.length
    ? { min:Math.min.apply(null, reaches), max:Math.max.apply(null, reaches),
        mean:Math.round(reaches.reduce((a, b) => a + b, 0) / reaches.length) }
    : null;

  /* The headline is quoted off the MOVERS THAT BOTH BUILDS AGREE ARE THE SAME CREATURE — the
     narrowest, least flattering cut, and the only one where a difference can only be the position
     fix. The all-bodies figures are kept beside it because they are what a player's whole screen
     looks like. */
  const A = off.separationMoversSameType, C = on.separationMoversSameType;
  const Aall = off.separationAtEnd, Call = on.separationAtEnd;
  /* THE BAR IS SCOPED TO BODIES THE TWO BUILDS AGREE ARE THE SAME CREATURE, and that is a
     restriction that has to justify itself rather than be quietly convenient — it is exactly the
     move that turns a bench into a rubber stamp.
     It earns it on a MEASURED precondition, not on a story about why those bodies miss: two clients
     handed the same runSeed build the same map and the same spawn points and then disagree about
     what a minority of the creatures standing on them ARE (`rebuiltSameLevel.sameType` — 29 to 34 of
     41 across four runs). For those bodies the host's position is where a creature the guest does
     not have is standing, so the premise of a position correction — same body, same level — is
     already broken before the correction runs. Every one of the worst offenders is a guest walker
     being handed a host FLYER's coordinates.
     WHY they then fail to converge is NOT established here, and the first guess was measured wrong:
     see `targetFloored` above. That is logged as its own defect below, not folded into this result
     and not explained away.
     The restriction is safe because it does NOT let the known-bad through: measured under
     `?nopossync=1`, this same cut read a worst body of 147 against a melee reach of 26. */
  const Cm = on.separationMoversSameType, Am = off.separationMoversSameType;
  const cleanRun = hostLap.playTicks === TICKS && on.playTicks === TICKS && off.playTicks === TICKS
                && !on.sampleMisaligned && !off.sampleMisaligned && !on.applyThrew && !off.applyThrew
                && rebuilt.hostVsGuestOn.midsMatched === b1.enemies
                && rebuilt.hostVsGuestOn.sameSpawnPoint === b1.enemies;
  const green = !!(Cm && Am && reach && Cm.max < reach.min && Am.max > Cm.max * 10);
  return JSON.stringify({
    ok:true, at:b1.at, zone:ZONE, runSeed:SEED, secondsAsked:TICKS / 60,
    packetGate:SEND + 's, reset not subtracted', staleness:'one packet period; no wire, no jitter, no loss',
    builds:{ host:b1, guestOn:b2, guestOff:b3, rebuiltSameLevel:rebuilt },
    laps:{ host:hostLap, guest_slot6_ON:on, guest_slot6_OFF_control:off },
    reach:reach,
    /* THE NUMBER STEP 6 ASKS FOR, and the control that gives it meaning. */
    headline: (A && C) ? {
      bodies:C.n, of:on.comparedAtEnd,
      uncorrectedMeanSeparation:A.mean, uncorrectedMax:A.max,
      correctedMeanSeparation:C.mean,   correctedMax:C.max,
      closedBy:A.mean ? Math.round((1 - C.mean / A.mean) * 100) + '%' : null,
      insideMeleeReach: reach ? (C.max < reach.min) : null,
      allBodies:{ uncorrectedMean:Aall && Aall.mean, correctedMean:Call && Call.mean },
    } : null,
    noPosSync:B.NO_POS_SYNC,
    /* THE BAR IS THE TAIL, NOT THE MEAN, AND THAT WAS LEARNED FROM A FALSE PASS.
       The first version of this line read `corrected mean < control mean` and it went GREEN on a run
       under `?nopossync=1` — the shipped known-bad, where the store is disabled and the two guest
       laps are the same unsynced simulation twice. Measured on that run: all-bodies mean 242 vs 244,
       i.e. identical, while the movers-same-type MEANS happened to land 6 vs 68 purely because
       separation is heavy-tailed and two independent unsynced laps roll different tails. A bar that
       can be cleared by luck is not a bar.
       What cannot be cleared by luck is the TAIL. A corrected body's error is bounded by the lerp's
       own lag — one packet period plus the 20%/frame catch-up — and lands in single digits; an
       uncorrected one is bounded by nothing and runs to four. So the bar is: the WORST agreed body
       is still inside melee reach, and the control's worst is an order of magnitude further out.
       Under nopossync=1 the corrected worst was 147 against a reach of 26, and this fails. */
    bar: (Cm && Am && reach) ? { scope:'movers both builds agree are the same creature',
                                 bodies:Cm.n, correctedWorst:Cm.max, meleeReach:reach.min,
                                 controlWorst:Am.max, ratio:Cm.max ? +(Am.max / Cm.max).toFixed(1) : null } : null,
    /* A SECOND DEFECT, FOUND BY THIS BENCH AND NOT FIXED BY THIS PLAN. `saltMob` (4716) and the role
       roll (7690) draw from unseeded Math.random, so two clients handed the same runSeed build the
       same map and the same spawn points and then disagree about what a minority of the creatures
       standing on them ARE — 7 to 12 of 41 across four runs, and the mismatch is usually a FLYER on
       one side. Those bodies do not converge under the correction (mean 358, worst 1294) and this
       probe deliberately does not claim to know why: `targetFloored` was true for the two worst, so
       the obvious edge-guard explanation is already refuted. Backlog, not this task. */
    separateDefect_bestiaryMismatch: {
      bodiesTheBuildsDisagreedAbout:b1.enemies - rebuilt.hostVsGuestOn.sameType, of:b1.enemies,
      theirCorrectedSeparation:on.separationMoversSaltedApart, detail:on.saltedDetail },
    verdict: !cleanRun ? 'a lap did not run clean — read playTicks / sampleMisaligned / applyThrew'
      : (!Cm || !Am || !reach) ? 'NOT MEASURED — nothing moved far enough to compare'
      : B.NO_POS_SYNC
        ? (green ? 'KNOWN-BAD RUN STILL PASSED — the bar does not depend on the fix, do not trust it'
                 : 'known-bad (nopossync=1) failed the bar, as it must')
        : (green ? 'the correction holds both pictures inside melee reach; the control was watched to fail'
                 : 'NOT the designed behaviour — read the laps'),
  });
})()
