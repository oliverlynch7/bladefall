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
     levels are keyed by zone and mp by peer, so their ids fall through this door and stay loud. */

/* The class an id names, or null when the id is not a per-class skills row. idOf() builds
   `skills:<cls>/<skill>:<claim>`. */
export function classOf(id){
  const m = /^skills:([^/:]+)\//.exec(String(id));
  return m && m[1] ? m[1] : null;
}

/* The distinct classes worth paying a second launch for. */
export function confirmTargets(fresh){
  return [...new Set((fresh || []).map(classOf).filter(Boolean))];
}

/* `targets` is what was actually re-measured (empty if the confirm run went dark or threw);
   `stillFailing` is the set of ids the re-run reported. */
export function splitConfirmed(fresh, targets, stillFailing){
  const T = new Set(targets || []), S = new Set(stillFailing || []);
  const confirmed = [], flapped = [];
  for(const id of fresh || []){
    const cls = classOf(id);
    if(cls && T.has(cls) && !S.has(id)) flapped.push(id);
    else confirmed.push(id);
  }
  return { confirmed, flapped };
}

/* The whole confirm pass, orchestration included, so it can be driven without a GPU.

   `rerun(targets)` re-measures those classes and returns a suite result; it may return a dark one or
   throw, and both must leave every accusation standing. `idOf(f)` names a failure the same way the
   caller's ids were built — passed in rather than duplicated, because a rule that exists in two
   places is a rule that will be edited in one. `log` collects the lines the gate prints. */
export async function confirmPass(fresh, { rerun, idOf, log = () => {} } = {}){
  if(!fresh || !fresh.length) return { confirmed: [], flapped: [], ran: false };
  const targets = confirmTargets(fresh);
  if(!targets.length) return { confirmed: [...fresh], flapped: [], ran: false };

  log(`confirming ${fresh.length} new failure(s) with a second launch of: ${targets.join(', ')}`);
  let scoped = null;
  try { scoped = await rerun(targets); }
  catch(e){ log(`confirm run FAILED (${String(e && e.message || e).slice(0, 120)}) — every new failure stands`); }

  let measured = [];
  const again = new Set();
  if(scoped && !isDark(scoped)){
    measured = targets;
    for(const f of (scoped.failures || [])) again.add(idOf(f));
    log(suiteLine('skills (confirm)', scoped));
  } else if(scoped){
    log(`confirm run DARK (${scoped.skipped || 'no verdicts'}) — every new failure stands`);
  }

  const split = splitConfirmed(fresh, measured, again);
  for(const id of split.flapped){
    log('FLAPPED (failed once, passed on a confirming re-run — not a regression, and not a fix): ' + id);
  }
  return { ...split, ran: measured.length > 0 };
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
