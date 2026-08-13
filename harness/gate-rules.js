/* THE GATE'S ARITHMETIC, pulled out of run-all.js so it can be proven in milliseconds.

   Same reason drive.js's parseEval is a separate pure function: everything else in this harness
   needs forty minutes and a GPU, so the parts with actual reasoning in them have to be checkable
   without one. run-all.js imports these rather than keeping its own copy - a rule that exists in two
   places is a rule that will be edited in one.

   WHY THIS EXISTS AT ALL — two faults, found 2026-08-11 by reading a real gate run's output against
   its own report.json.

   1. `mp: skipped (not written yet)` was printed for a suite that IS written, DID run, and returned
      `skipped: "3D hero layer not live (on:false ready:false)"`. Two entirely different states were
      collapsed into one field: run-all.js set `skipped:true` for a MISSING FILE, and test-mp.js sets
      `skipped:<reason>` for a layer that was off. The gate reported the informative one as the
      uninformative one and threw the reason away. The mp suite is the one that proves Oliver is not
      invisible to himself in PvP; a reader had no way to know its sixteen assertions had not run.

   2. THE WORSE HALF: a suite that did not run could SHRINK THE BASELINE. The ratchet computes
      `fixed = known - now`, and a suite that produced no results contributes nothing to `now` - so
      every one of its baselined failures looked fixed, got announced as `FIXED:`, and was dropped
      from the file. Nobody fixed them; the suite simply did not look. That is docs/VISION.md's
      "missing data is not a negative finding" inverted into a positive one, and it is silent.
      Not reachable today only because no mp failure happens to be baselined right now.

   The header of run-all.js already reasons about a suite that FLAKES and under-reports, and
   deliberately accepts that: the baseline shrinks, the failure returns as a loud REGRESSION next
   run. That trade is fine for a suite that ran and got a wrong answer. It is not fine for a suite
   that never looked, because there is no measurement to be loud about. So a DARK suite's baselined
   ids are carried forward untouched. */

/* A suite is DARK when it produced no verdicts at all - the file is missing, the suite itself
   reported it could not measure, or it THREW. Distinct from "ran and found nothing wrong".

   THE THIRD STATE WAS ADDED 2026-08-12, AFTER IT DESTROYED A RUN. `run-all.js`'s `suite()` answered a
   thrown suite with `{pass:0, fail:1, failures:[{id:name, detail}]}` — a synthetic failure carrying
   no cls, zone, skill or claim, so `idOf` named it `skills:/:`. Nothing in the gate could tell that
   from a skill that failed. The 16:02 gate on 2026-08-12 printed exactly:

     skills: 0 pass, 1 fail
     REGRESSION: skills:/:
     FIXED: skills:ranger/Tumble:damage   (and mage/Attunement, and berserker/Charge)
     GATE: FAIL (1 new)

   and `autopilot.ps1` stashed that run's whole tree — the confirm pass and the disk-leak fix, both
   finished and verified, recovered by hand two runs later. The suite had not found a bug; it had
   crashed, on a disk the harness itself had filled.

   Both halves of that output are wrong, and the second is the more dangerous:
   - a crash is not evidence against the run's code. `docs/VISION.md`: missing data is not a negative
     finding, report inconclusive, never invent a failure. A synthetic failure row IS an invented one.
   - the three FIXED lines are the header's own fault-2 arriving from a new direction. A crashed suite
     contributes nothing to `now`, so every baselined id it owns looks fixed. Only the accidental
     redness stopped the baseline being rewritten — `fresh.length` exits before the write, and
     `skills:/:` can never be in the baseline. One row of luck between this and a wiped ratchet.

   A crashed suite is now dark: its ids are CARRIED, it can invent no failure, and the gate exits
   INCONCLUSIVE rather than red. */
export function isDark(s){
  return !!(s && (s.missing || s.skipped || s.crashed));
}

/* The one line the gate prints per suite. Names the reason when there is one, because the reason is
   the whole value of a skip. */
export function suiteLine(name, s){
  if(s && s.missing) return `${name}: skipped (not written yet)`;
  if(s && s.crashed) return `${name}: CRASHED — ${s.crashed} (it measured NOTHING; this is not a game failure)`;
  if(s && s.skipped) return `${name}: SKIPPED — ${s.skipped} (its assertions did NOT run)`;
  return `${name}: ${(s && s.pass) || 0} pass, ${(s && s.fail) || 0} fail` +
         (s && s.unproven ? `, ${s.unproven.length} unproven` : '');
}

/* Which suite an id belongs to. idOf() builds `${suite}:${who}/${what}:${claim}`, so the suite is
   everything before the first colon. */
export const suiteOf = id => String(id).split(':')[0];

/* THE CONFIRM PASS — a fresh failure is an ACCUSATION, not yet a verdict.

   WHY THIS EXISTS. `run-all.js` calls any failure absent from the baseline a REGRESSION and exits 1,
   and `autopilot.ps1` answers a red gate by stashing the run's tree. So a skill row that fails one
   launch in three costs a run its work, and one of those rows is known and named: on 2026-08-12 a
   full gate printed `REGRESSION: skills:skylancer/Dive Strike:damage` against a change that cannot
   reach it (its one edit sits behind `meta.classId==='warrior'`), and three immediate re-runs of that
   class reported `4 pass, 0 fail` three times out of three. The harness plan records the mechanism:
   Dive Strike's damage is owed by its LANDING while the dummy walks toward the player, so whether the
   burst catches it depends on where the dummy has got to. The cast happened; the geometry missed.

   `harness/probes/determinism.probe.js` cannot see this class of fault and says so in its own header
   — it casts every kit three times inside ONE page, so it holds one arrival state. The instrument
   for a payout that depends on POSITION AT A MOMENT is a second launch, and this is it.

   The cost is paid only when something actually flaps: a clean run re-runs nothing.

   THREE RULES, and the second is the one that keeps this honest:
   - re-measured and failed again  -> CONFIRMED. A real regression, still a red gate.
   - re-measured and did not fail  -> FLAPPED. Not a regression. It is also NOT a fix, so it must be
     kept out of the baseline: writing it in would record a flake as a known failure and hand the
     suite a green light for a row nobody has ever diagnosed.
   - could not be re-measured      -> CONFIRMED, deliberately. Absence of a second measurement must
     never clear an accusation; docs/VISION.md's "missing data is not a negative finding" cuts this
     way too. Only the skills suite is re-runnable per class today (`runSkillTests({classes})`);
     levels are keyed by zone and mp by peer, so their ids fall through this door and stay loud.

   ONE RE-RUN WAS NOT ENOUGH, and the measurement that says so is a real gate on 2026-08-13.
   `confirming 1 new failure(s) with a second launch of: warlock` printed, the launch was spent, and
   `REGRESSION: skills:warlock/Final Curse:damage` was upheld — a red gate that held a verified fix
   out of the repository for a whole run. Then four launches of the identical command on the
   identical tree: THREE FAILED AND ONE PASSED, and two launches of the same command against HEAD
   with the change reverted both passed. So the row fails about three times in four whatever the
   tree says, and **a single confirming re-run is itself a coin toss weighted by the very flakiness
   it is trying to measure**: it clears a 50% flapper half the time and upholds a 75% one three
   times in four.

   So the rule is now BEST-OF-N with an explicit N, and the tally is printed rather than kept in a
   run's head — `CONFIRMED (3 of 4 launches failed): skills:warlock/Final Curse:damage`. The
   original gate launch counts as one of the launches, because it IS a measurement and it is the one
   that made the row fresh. At the default N=3 that means a row needs to fail 2 of the 3 confirming
   launches (3 of 4 overall) to stand.

   BE CLEAR ABOUT WHAT THIS DOES AND DOES NOT BUY, because the arithmetic is unflattering and
   pretending otherwise would be the same error the plan was written against. Against a row that
   fails with probability p on any launch, one re-run upholds it with probability p; best-of-3
   upholds it with p²(3−2p). At p=1 (a real regression) both are 1.0 — nothing is laundered, which
   is the property that must not be lost. At p=0.5 both are 0.5. At p=0.75 — the measured warlock
   row — it goes 0.75 → 0.84, i.e. the WRONG WAY for that specific row. Best-of-N sharpens the
   verdict toward whatever the row really does; it does not rescue a row that genuinely fails most
   of the time. What actually helps the warlock case is the ledger below: the flap history is what
   tells the next run "this row has been accused twice and cleared twice" in zero launches.

   It costs at most N launches per accused CLASS, and usually fewer: `decided()` stops the loop as
   soon as no remaining launch could change any accused row's verdict, which is after two launches
   whenever the two agree. A clean run still pays nothing at all. */

/* How many confirming launches a fresh row is worth. THREE, and the number was measured before it
   was chosen: `node harness/test-skills.js --classes warlock` is **57.3s** wall clock (2026-08-13,
   one class, 9 assertions). So the worst case for one accused class is ~2.9 minutes and the common
   case ~1.9 (the loop settles after two launches whenever the two agree), against the 20-45 minutes
   the gate already spends — 5-15%, paid only on a run that has something fresh to argue about.
   Raising N buys less than the ledger below does; see the probabilities above. */
export const CONFIRM_LAUNCHES = 3;

/* Did the row fail a MAJORITY of the launches that measured it? `fails`/`launches` count the
   CONFIRMING launches only; the +1 on each side is the original gate launch, which failed by
   definition — that is what made the row fresh.

   At launches=1 it reduces to the old rule exactly — fails=1 gives 4 > 2 (CONFIRMED), fails=0 gives
   2 > 2 (FLAPPED) — so the single-launch behaviour every existing test pins is the N=1 case of this
   function rather than a second copy of it. */
export function majorityFailed(fails, launches){
  return (fails + 1) * 2 > (launches + 1);
}

/* Is this row's verdict already settled, whatever the `remaining` launches do?

   Returns true (CONFIRMED), false (FLAPPED) or null (not yet known). Sound because the two bounds
   are the extremes: every remaining launch measuring a failure is the most confirming future
   available, every remaining launch measuring a pass the least, and a launch that goes DARK lands
   between them (it moves neither count). When the two bounds agree there is nothing left to learn
   and the loop may stop — which is what makes N=3 cost two launches on a row that is clearly one
   thing or the other. */
export function decided(fails, measured, remaining){
  const hi = majorityFailed(fails + remaining, measured + remaining);   // all remaining fail
  const lo = majorityFailed(fails,             measured + remaining);   // all remaining pass
  return hi === lo ? hi : null;
}

/* A STABLE IDENTITY FOR ONE FAILURE, so today's report can be compared with the baseline — and so
   the confirm pass can tell "the re-run reported the same row" from "the re-run reported a different
   one". It lives here rather than in run-all.js because the confirm pass has to name a re-run's
   failures the SAME way the accusation was named: if the two ever drift, every genuine regression is
   silently read as a flap and waved through. That is a rule that must not exist in two places. */
export function failureId(suite, f){
  return `${suite}:${f.cls || f.zone || ''}/${f.skill || f.check || ''}:${f.claim || ''}`;
}

/* The class an id names, or null when the id is not a per-class skills row. failureId() builds
   `skills:<cls>/<skill>:<claim>`. */
export function classOf(id){
  const m = /^skills:([^/:]+)\//.exec(String(id));
  return m && m[1] ? m[1] : null;
}

/* The distinct classes worth paying a second launch for. */
export function confirmTargets(fresh){
  return [...new Set((fresh || []).map(classOf).filter(Boolean))];
}

/* `targets` is what was actually re-measured (empty if every confirming launch went dark or threw).

   `tally` may be given either way round, and the array form is not a convenience — it is the N=1
   rule the gate shipped first, kept executable so the cases recorded against it still drive this
   function rather than a transcription of it:
     - an ARRAY of ids  -> "one launch, and these are the ids it still reported failing"
     - an OBJECT id->n  -> n of `launches` confirming launches saw this row fail */
export function splitConfirmed(fresh, targets, tally, launches){
  if(Array.isArray(tally) || tally == null){
    const S = new Set(tally || []);
    const t = {};
    for(const id of fresh || []) t[id] = S.has(id) ? 1 : 0;
    tally = t; launches = 1;
  }
  const T = new Set(targets || []), n = launches || 0;
  const confirmed = [], flapped = [];
  for(const id of fresh || []){
    const cls = classOf(id);
    if(cls && T.has(cls) && !majorityFailed(tally[id] || 0, n)) flapped.push(id);
    else confirmed.push(id);
  }
  return { confirmed, flapped };
}

/* THE FLAP LEDGER — the cheap half, and the one that would have answered the warlock question in
   ZERO launches. Nothing in the gate has ever recorded that a row was accused BEFORE, so two runs
   two days apart each met a delayed-payout row for the "first" time and neither could see the
   other's evidence.

   Persisted in `harness/report.json`, which is gitignored — so this ledger is per-MACHINE, not per
   checkout. That is the right scope rather than a limitation to apologise for: the question it
   answers is "has this row flapped on the box the scheduler actually runs on", and a fresh clone
   has no history to be right about. */
export function mergeFlaps(prev, { flapped = [], confirmed = [], at } = {}){
  const out = {};
  for(const [id, rec] of Object.entries(prev || {})) out[id] = { ...rec };
  const bump = (id, key) => {
    const r = out[id] || (out[id] = { flapped: 0, confirmed: 0 });
    r[key] = (r[key] || 0) + 1;
    if(at) r.last = at;
  };
  for(const id of flapped)   bump(id, 'flapped');
  for(const id of confirmed) bump(id, 'confirmed');
  return out;
}

/* What the ledger has to say about a row the gate is about to accuse, or '' when it has never seen
   it. Kept here rather than in run-all.js so the wording is testable. */
export function flapNote(history, id){
  const h = (history || {})[id];
  if(!h || (!h.flapped && !h.confirmed)) return '';
  return `${id} — seen before: FLAPPED ${h.flapped || 0}, CONFIRMED ${h.confirmed || 0}` +
         (h.last ? ` (last ${h.last})` : '');
}

/* The whole confirm pass, orchestration included, so it can be driven without a GPU.

   `rerun(targets)` re-measures those classes and returns a suite result; it may return a dark one or
   throw, and both must leave every accusation standing. `idOf(f)` names a failure the same way the
   caller's ids were built — passed in rather than duplicated, because a rule that exists in two
   places is a rule that will be edited in one. `log` collects the lines the gate prints. */
export async function confirmPass(fresh, { rerun, idOf, log = () => {},
                                           launches = CONFIRM_LAUNCHES, history = null } = {}){
  const none = { confirmed: [], flapped: [], ran: false, tally: {}, launches: 0 };
  if(!fresh || !fresh.length) return none;
  const targets = confirmTargets(fresh);
  if(!targets.length) return { ...none, confirmed: [...fresh] };

  const N = Math.max(1, launches | 0);
  log(`confirming ${fresh.length} new failure(s) with up to ${N} more launch(es) of: ${targets.join(', ')}`);
  for(const id of fresh){
    const note = flapNote(history, id);
    if(note) log('  ledger: ' + note);
  }

  /* Only the per-class rows can be decided here at all; a levels/mp id stays loud no matter how
     many launches happen, so it must not hold the loop open either. */
  const accused = fresh.filter(id => classOf(id));
  const tally = {};
  for(const id of accused) tally[id] = 0;
  let measured = 0;

  for(let k = 0; k < N; k++){
    let scoped = null;
    try { scoped = await rerun(targets); }
    catch(e){ log(`confirm launch ${k + 1}/${N} FAILED (${String(e && e.message || e).slice(0, 120)}) — it measured nothing`); }

    if(scoped && !isDark(scoped)){
      measured++;
      const again = new Set((scoped.failures || []).map(f => idOf(f)));
      for(const id of accused) if(again.has(id)) tally[id]++;
      log(suiteLine(`skills (confirm ${k + 1}/${N})`, scoped));
    } else if(scoped){
      log(`confirm launch ${k + 1}/${N} DARK (${scoped.skipped || scoped.crashed || 'no verdicts'}) — it measured nothing`);
    }

    const remaining = N - k - 1;
    if(remaining && accused.every(id => decided(tally[id], measured, remaining) !== null)){
      log(`every accused row is settled after ${k + 1} launch(es); skipping ${remaining} more`);
      break;
    }
  }

  if(!measured) log('NO confirming launch measured anything — every new failure stands');
  const split = splitConfirmed(fresh, measured ? targets : [], tally, measured);
  const said = id => `${(tally[id] || 0) + 1} of ${measured + 1} launches failed`;
  for(const id of split.flapped){
    log(`FLAPPED (${said(id)} — not a regression, and not a fix): ${id}`);
  }
  if(measured) for(const id of split.confirmed){
    if(classOf(id)) log(`CONFIRMED (${said(id)}): ${id}`);
  }
  return { ...split, ran: measured > 0, tally, launches: measured };
}

/* THE RATCHET. `known` is the baseline, `now` is this run's failures, `dark` is the set of suite
   names that produced no verdicts.

   - fresh: a failure that is not in the baseline. Any one of these is a red gate.
   - fixed: a baselined failure that this run did NOT see AND whose suite actually looked.
   - next:  what the baseline should become on a green run - this run's failures, PLUS every
            baselined id belonging to a dark suite, which is carried rather than forgotten. */
export function reconcile(known, now, dark){
  const K = new Set(known || []), N = new Set(now || []), D = new Set(dark || []);
  const carried = [...K].filter(id => D.has(suiteOf(id)));
  return {
    fresh:   [...N].filter(id => !K.has(id)),
    fixed:   [...K].filter(id => !N.has(id) && !D.has(suiteOf(id))),
    carried,
    next:    [...new Set([...N, ...carried])],
  };
}
