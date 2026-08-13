/* DOES THE WORLD PING POINT AT THE MONSTER IT WAS AIMED AT?

   docs/superpowers/plans/2026-08-12-guest-enemy-positions.md Task 4, Step 1 — which says in so many
   words to CHECK rather than assume, and that "no change needed" is a real outcome.

   Sub-project D Task 5 sends a mark as `{t:'mark',by,n,x,z,y}` (index.html:12352) — a POSITION, with
   nothing identifying a body. `dropPing` (12118) picks the body with the game's own `aimTarget` and
   then throws it away, keeping only its x/z/y and the word TARGET. So the feature is a GROUND mark
   that happens to have been aimed by a body, and there are two separate ways that can be wrong:

     B. THE OTHER SCREEN. The receiver draws the marker at the sender's coordinates. Before the guest
        adopted the host's enemy positions (Tasks 1–2 of this plan) the two clients ran independent AI
        and their pictures drifted ~1000–1700 units apart in thirty seconds (docs/MP_AUDIT.md §2), so
        a marker on a monster on one screen was a marker on bare ground on the other. This is the half
        the plan expects to be already fixed, and it is measured rather than reasoned about.

     C. TIME. The marker is static for its whole PING_LIFE of 5 seconds (12078) and the monster is
        not. Nothing tracks the body — not on the receiver's screen and not on the sender's own. This
        half is UNAFFECTED by the position sync, because both clients agree about a body that has
        walked off the mark.

   Three trials in one launch, in that order, plus A as the instrument's own positive control.

   ── WHY B DISPLACES THE CLAIM AND NOT THE BODY ──
   Same reasoning possync.probe.js records: the correction is applied one line before the game's own
   edge guard (13477–13481), which REFUSES a pull whose first 20% step lands over void. A body shoved
   somewhere arbitrary is a body the guard may legitimately refuse, and a trial whose bar is "the gap
   closed" would then read the guard as a defect. So the host's claimed position is a SHORT step
   toward the player — floored by construction, because the player is standing on it — and it is
   checked with floorAt before it is allowed to score.

   WHAT THIS IS NOT: a network measurement. No session is held and no packet crosses a wire. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!B.dropPing) return JSON.stringify({ ok:false, why:'dropPing is not exported on __BF3' });
  if(!G || !G.p) return JSON.stringify({ ok:false, why:'no game' });

  /* dropPing returns early unless mode is 'play', and `mode` is a getter with no setter, so a bench
     that arrives paused reports a feature that does nothing. Knock on the game's own door. */
  if(B.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(B.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(B.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:B.mode });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);
  const marks = () => (G.marks || []);
  const clearMarks = () => { G.marks = []; };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const r2 = x => x == null ? null : Math.round(x * 100) / 100;
  const floored = (x, z) => { try { const f = B.floorAt(x, z); return f != null && isFinite(f); } catch(e){ return false; } };

  /* The observer must not die and the game must not stop: `update()` returns at its third line unless
     mode is 'play' and there is no setter, so a probe that keeps ticking a stopped world gets a full
     run's worth of plausible zeroes (AUTOPILOT.md records this costing two runs). Every tick is
     counted and the count is reported beside the count asked for. */
  let playTicks = 0, ticksAsked = 0, leftPlayAt = null;
  /* `keep` pins ONE observed body alive for the duration, and it is not decoration: the first run of
     trial E/F picked the level's furthest walker, the player killed it inside the 4.5 seconds, and
     both arms then read a gap of 0 against a corpse that had stopped moving — a dead heat that says
     nothing, reported honestly by the trial's own theBodyActuallyLeft bar rather than passed off as
     a result. The intervention is on the body under observation only and is reported. */
  const tick = (n, keep) => {
    for(let k = 0; k < n; k++){
      ticksAsked++;
      if(B.mode === 'play') playTicks++; else if(leftPlayAt == null) leftPlayAt = ticksAsked;
      try { B.update(1 / 60); } catch(e){}
      G.p.hp = G.p.maxHp || 100; G.p.dead = false; G.p.downed = false; G.p.invuln = 999;
      if(keep){ keep.hp = keep.maxHp || 100; keep.dead = false; }
    }
  };
  /* PING_COOL is 0.6s measured on G.time, and _pingT is module-local, so the only way to clear the
     cooldown is to let the game's own clock run. 45 frames is 0.75s. */
  const cool = () => tick(45);

  const SAVED = { active:MP.active, isHost:MP.isHost, myId:MP.myId, teams:MP.teams,
                  teamMap:MP.teamMap, pvp:MP.pvp, killed:MP._killed, gotEn:MP._gotEn };
  let out;
  try {
    MP.active = false; MP.isHost = false; MP.teams = false; MP.pvp = false; MP.myId = 'me';

    /* Campaign enemies spawn with mid == null; applyEnemies is keyed entirely on mid, so without
       stamping them trial B reconciles to nothing and reads "no sync" for a reason that has nothing
       to do with the code under test. */
    let stamped = 0;
    for(const e of live()) if(e.mid == null) e.mid = 900000 + (stamped++);
    for(const e of live()){ e.active = true; e.dropT = 0; e.mx = null; e.mz = null; }

    const all = live();
    if(all.length < 1) return JSON.stringify({ ok:false, why:'no live enemies here to aim at' });

    /* THE SUBJECT is the enemy the game's own aimTarget will pick, found by asking it rather than by
       picking the nearest and hoping: aimTarget scores angle over distance and a probe that chose
       differently would be measuring its own guess. The hero is turned to face a body first.
       NOTHING IS TICKED BETWEEN THE AIM AND THE PING. aimTarget is deterministic given a world, so
       calling it immediately before dropPing gives the body dropPing itself will pick; a single
       frame in between moves every mob and the two calls can disagree, which reads as the mark
       missing its target when it did not. */
    clearMarks(); cool();
    const near = live().slice().sort((a, b) => dist(a, G.p) - dist(b, G.p))[0];
    G.p.yaw = Math.atan2(near.x - G.p.x, near.z - G.p.z);
    let subject = null; try { subject = B.aimTarget(G.p, G.p.weapon, 900); } catch(e){}
    const subjectAt = subject ? { x:subject.x, z:subject.z } : null;

    /* ── A. THE AIM HALF, and the probe's own positive control ────────────────────────────────
       If dropPing does not put a marker on a body here, every number in B and C is about a marker
       that was never on one. */
    const made = B.dropPing();
    const mA = marks()[0] || null;
    const aimedAt = subjectAt;
    const trialA = {
      subject: subject ? (subject.type || 'enemy') : null,
      subjectDist: subject ? Math.round(dist(subject, G.p)) : null,
      made: !!made,
      markName: mA ? mA.name : null,
      /* TARGET means aimTarget found a body; HERE means it fell back to a point on the ground
         PING_CAST in front of the hero, which is a different feature and cannot be scored here. */
      onABody: !!(mA && mA.name === 'TARGET'),
      gapToSubject: (mA && aimedAt) ? Math.round(dist(mA, aimedAt)) : null,
    };

    /* ── B. THE OTHER SCREEN: is the marker over the body the RECEIVER is drawing? ─────────────
       The host pings a body at the host's authoritative position; the guest holds the same body
       somewhere else. The marker is drawn at the host's coordinates on both screens, so the gap the
       guest SEES is host-position minus guest-position — which is exactly what the position sync
       exists to close, and this measures whether it does.
       Two arms differing in one bit: the wake flag the host sends. Asleep is the control, because the
       awake arm alone passes just as happily against a build that adopts every position it is sent. */
    const armB = (name, awake) => {
      const subs = live().filter(e => e.mid != null).slice(0, 12);
      if(!subs.length) return { arm:name, of:0, scored:0 };
      for(const e of subs){ e.mx = null; e.mz = null; }
      const pre = subs.map(e => ({ mid:e.mid, x:e.x, z:e.z }));
      /* The host's claim: a short step toward the player. Floored at the far end by construction. */
      const claim = pre.map(b => {
        const dx = G.p.x - b.x, dz = G.p.z - b.z, d = Math.hypot(dx, dz) || 1;
        return { x: b.x + dx / d * 90, z: b.z + dz / d * 90 };
      });
      const rows = pre.map((b, i) => {
        const e = subs.find(q => q.mid === b.mid);
        return [b.mid, MP.typeIdx(e.type), Math.round(claim[i].x), Math.round(claim[i].z), 9999, 9999, awake ? 1 : 0];
      });

      MP._killed = {}; MP.active = true; MP.isHost = false;
      let threw = null;
      try { MP.applyEnemies(rows, null); } catch(err){ threw = String(err && err.message || err); }
      tick(20);                                     // k = min(1, dt*12) = 0.2 a frame; twenty settle it
      MP.active = false; MP.isHost = false;

      let scored = 0, before = 0, after = 0, skippedVoid = 0, stored = 0;
      for(let i = 0; i < pre.length; i++){
        const e = live().find(q => q.mid === pre[i].mid); if(!e) continue;
        if(e.mx != null) stored++;
        const firstX = pre[i].x + (claim[i].x - pre[i].x) * 0.2, firstZ = pre[i].z + (claim[i].z - pre[i].z) * 0.2;
        if(!floored(claim[i].x, claim[i].z) || !floored(firstX, firstZ)){ skippedVoid++; continue; }
        /* The MARK is at the host's claim. `before` is the gap the guest would see with no sync at
           all; `after` is the gap it sees once the correction has run. */
        before += dist(claim[i], pre[i]);
        after  += dist(claim[i], e);
        scored++;
      }
      return { arm:name, awakeSent:awake ? 1 : 0, of:pre.length, scored:scored, targetsStored:stored,
               skippedOverVoid:skippedVoid, threw:threw,
               markToBodyBefore: scored ? r2(before / scored) : null,
               markToBodyAfter:  scored ? r2(after  / scored) : null };
    };
    /* ASLEEP FIRST, for possync's reason: the awake arm scatters bodies toward the player, and running
       it first would hand the control a level whose mobs are already somewhere else. */
    const bAsleep = armB('asleep', false);
    const bAwake  = armB('awake',  true);

    /* ── C. TIME: the marker is static and the monster is not ─────────────────────────────────
       Ticked through the GAME'S OWN update with nothing driven by hand, sampled once a second across
       the marker's whole 5s life. This is the half no amount of position sharing touches: both
       clients agree, correctly, about a body that is no longer where it was called out. */
    clearMarks(); cool();
    for(const e of live()){ e.active = true; }
    const nearC = live().slice().sort((a, b) => dist(a, G.p) - dist(b, G.p))[0];
    G.p.yaw = Math.atan2(nearC.x - G.p.x, nearC.z - G.p.z);
    let subjC = null; try { subjC = B.aimTarget(G.p, G.p.weapon, 900); } catch(e){}
    const madeC = B.dropPing();
    const mC = marks()[marks().length - 1] || null;
    /* THE BODY'S OWN DISPLACEMENT IS RECORDED BESIDE THE GAP, and it is the half that makes the
       after-reading mean anything: a gap of 0 against a body that never moved is what a broken fix
       and a working one both produce. `bodyMoved` is how far the subject travelled from where it
       was called out, so a run can see the marker keeping up rather than merely see a small number. */
    const subjC0 = subjC ? { x:subjC.x, z:subjC.z } : null;
    const walk = [];
    if(mC && subjC){
      walk.push({ t:0, gap:Math.round(dist(mC, subjC)), bodyMoved:0, moving:!!subjC.active });
      for(let s = 1; s <= 5; s++){
        tick(60);
        walk.push({ t:s, gap: subjC.dead ? null : Math.round(dist(mC, subjC)),
                    bodyMoved: Math.round(dist(subjC, subjC0)),
                    dead: !!subjC.dead, markAlive: marks().indexOf(mC) >= 0 });
      }
    }
    const last = walk.length ? walk[walk.length - 1] : null;

    /* ── D. WAS C'S SUBJECT REPRESENTATIVE? ───────────────────────────────────────────────────
       The first run of this probe answered C with a `caster`, whose gap rose to 95 and then went
       FLAT for three seconds — because a caster walks to its preferred range and stops. Reading
       "a mark stays on its body" off one mob that halts is exactly the complete-plausible-wrong
       picture this harness keeps producing, so the same five seconds are measured for EVERY live
       body at once and the distribution is reported rather than one draw from it.
       Displacement from each body's own t=0 position, which is what a static mark measures against.
       No ping is involved: a mark IS its coordinates, so how far the body walks is the whole of it. */
    const pop = live().slice();
    const start = pop.map(e => ({ e:e, x:e.x, z:e.z, type:e.type,
                                 fromPlayer:Math.round(dist(e, G.p)) }));
    const series = [];
    for(let s = 1; s <= 5; s++){
      tick(60);
      const moved = start.filter(b => !b.e.dead).map(b => Math.hypot(b.e.x - b.x, b.e.z - b.z));
      moved.sort((a, b) => a - b);
      /* THE POPULATION MEDIAN IS 0 AND IT IS NOT THE ANSWER. Most of a level's 41 bodies are
         nowhere near the player and never take a step, so a median over all of them measures how
         much of the level is idle rather than what happens to a marker. The only body anyone pings
         is one that is coming for somebody, so the moving bodies are cut out and reported
         separately — and the all-bodies numbers are kept beside them so the cut is visible rather
         than quietly applied. */
      const movers = moved.filter(d => d > 1);
      series.push({ t:s, of:moved.length,
                    median: moved.length ? Math.round(moved[moved.length >> 1]) : null,
                    max: moved.length ? Math.round(moved[moved.length - 1]) : null,
                    movers: movers.length,
                    moversMedian: movers.length ? Math.round(movers[movers.length >> 1]) : null,
                    /* 125 is MP_AUDIT's own melee-reach yardstick: past it the marker is no longer
                       pointing at the thing it was called out for. */
                    pastReach: moved.filter(d => d > 125).length });
    }
    const end5 = series[series.length - 1] || null;

    /* ── E/F. THE RECEIVER'S HALF, through MP's own recvMark rather than an imitation of it ────
       F is a mark that names a body; E is the same call with no mid, which is EXACTLY the behaviour
       that shipped before this — so E is the negative control and no flag had to be added to the
       game to obtain one. Both are ticked through the same five seconds, so the only difference
       between them is the field under test.
       The subject is a body chosen for MOVING: a control that stands still and a test that stands
       still are the same reading twice. Chosen from trial D's OWN record of who walked furthest over
       the five seconds it just measured, rather than by proximity and hope. */
    clearMarks();
    const cand = start.filter(b => b.e && !b.e.dead && b.e.mid != null)
                      .sort((a, b) => Math.hypot(b.e.x - b.x, b.e.z - b.z) - Math.hypot(a.e.x - a.x, a.e.z - a.z));
    let mover = cand.length ? cand[0].e : null, moverFrom = null;
    let remote = { ok:false, why:'no body with a mid to name' };
    if(mover){
      moverFrom = { x:mover.x, z:mover.z };
      const aWas = MP.active, iWas = MP.isHost;
      MP.active = true; MP.isHost = false; MP.myId = 'me';
      MP.recvMark({ t:'mark', by:'friend', n:'Friend', x:mover.x, z:mover.z, y:mover.y || 0, mid:mover.mid });
      MP.recvMark({ t:'mark', by:'friend', n:'Friend', x:mover.x, z:mover.z, y:mover.y || 0 });   // no mid
      const withMid = marks()[0] || null, noMid = marks()[1] || null;
      MP.active = aWas; MP.isHost = iWas;
      /* 4.5s, NOT 5.0. A mark is filtered out of G.marks at exactly its life, and updateMarks only
         follows marks that are still IN the list — so ticking the full life would stop the tracking
         one frame before the reading is taken and report the fix not working. */
      tick(270, mover);
      const bodyWalked = Math.round(dist(mover, moverFrom));
      remote = {
        subject: mover.type || 'enemy', bodyWalkedIn4p5s: bodyWalked, bodyDied: !!mover.dead,
        pinnedAlive: true,
        withMid: withMid ? { gapToBody:Math.round(dist(withMid, mover)), mid:withMid.mid } : null,
        noMid:   noMid   ? { gapToBody:Math.round(dist(noMid,   mover)), mid:noMid.mid   } : null,
        /* THE THREE BARS. The named mark must be ON the body; the unnamed one must have been LEFT by
           it — and if the body did not walk far enough for the two to differ, neither bar means
           anything, which is why the walk is reported and required rather than assumed. */
        theBodyActuallyLeft: bodyWalked > 125,
        namedMarkFollowed: !!(withMid && dist(withMid, mover) <= 40),
        unnamedMarkStayedBehind: !!(noMid && dist(noMid, mover) > 125),
      };
    }

    out = {
      ok: true, at: G.areaName, enemies: all.length, stampedMids: stamped,
      pingLife: 5, meleeReachYardstick: '90-125 (docs/MP_AUDIT.md)',
      A_aim: trialA,
      B_otherScreen: { asleep: bAsleep, awake: bAwake,
        /* THE BAR. The awake arm must close most of the gap the control does not. */
        posSyncPutsTheBodyUnderTheMark:
          !!(bAwake.scored && bAsleep.scored && bAwake.markToBodyAfter != null &&
             bAwake.markToBodyAfter < bAwake.markToBodyBefore * 0.5 &&
             bAwake.markToBodyAfter < bAsleep.markToBodyAfter * 0.75) },
      C_time: { subject: subjC ? (subjC.type || 'enemy') : null, made: !!madeC,
                markName: mC ? mC.name : null, walk: walk,
                gapAtEndOfLife: last ? last.gap : null,
                /* Melee reach is the yardstick MP_AUDIT already uses for "is this the same fight". */
                stillOnTheBodyAt5s: !!(last && last.gap != null && last.gap <= 125) },
      D_population: { of: start.length, series: series,
                      /* THE BAR C ON ITS OWN CANNOT SETTLE: over a marker's whole life, how many
                         bodies walk further than the reach that decides whether it is still the
                         same fight. */
                      bodiesPastReachAt5s: end5 ? end5.pastReach : null,
                      medianWalkAt5s: end5 ? end5.median : null,
                      maxWalkAt5s: end5 ? end5.max : null,
                      moversAt5s: end5 ? end5.movers : null,
                      moversMedianWalkAt5s: end5 ? end5.moversMedian : null,
                      /* THE NUMBER THE CONCLUSION TURNS ON: among the bodies that are actually
                         moving — the only kind anyone calls out — what share has left the marker
                         by the time it expires. */
                      shareOfMoversPastReachAt5s:
                        (end5 && end5.movers) ? Math.round(end5.pastReach / end5.movers * 100) / 100 : null },
      EF_receiver: remote,
      playTicks: playTicks, ticksAsked: ticksAsked, leftPlayAtTick: leftPlayAt, mode: B.mode,
      posSyncOff: !!B.NO_POS_SYNC,
    };
  } finally {
    MP.active = SAVED.active; MP.isHost = SAVED.isHost; MP.myId = SAVED.myId;
    MP.teams = SAVED.teams; MP.teamMap = SAVED.teamMap; MP.pvp = SAVED.pvp;
    MP._killed = SAVED.killed; MP._gotEn = SAVED.gotEn;
    G.marks = [];
  }
  return JSON.stringify(out);
})()
