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

/* A suite is DARK when it produced no verdicts at all - the file is missing, or the suite itself
   reported it could not measure. Distinct from "ran and found nothing wrong". */
export function isDark(s){
  return !!(s && (s.missing || s.skipped));
}

/* The one line the gate prints per suite. Names the reason when there is one, because the reason is
   the whole value of a skip. */
export function suiteLine(name, s){
  if(s && s.missing) return `${name}: skipped (not written yet)`;
  if(s && s.skipped) return `${name}: SKIPPED — ${s.skipped} (its assertions did NOT run)`;
  return `${name}: ${(s && s.pass) || 0} pass, ${(s && s.fail) || 0} fail` +
         (s && s.unproven ? `, ${s.unproven.length} unproven` : '');
}

/* Which suite an id belongs to. idOf() builds `${suite}:${who}/${what}:${claim}`, so the suite is
   everything before the first colon. */
export const suiteOf = id => String(id).split(':')[0];

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
