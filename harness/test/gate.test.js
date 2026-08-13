/* THE GATE'S OWN ARITHMETIC, tested.

   Every one of these cases is taken from a real gate run on 2026-08-11 whose output disagreed with
   its own report.json: it printed `mp: skipped (not written yet)` while `report.json` held
   `"skipped": "3D hero layer not live (on:false ready:false)"` for a file that has existed since
   sub-project A Task 5.

   THE OLD RULES ARE WRITTEN OUT BELOW AND ASSERTED TO DISAGREE. A test that only says the new
   behaviour is the new behaviour cannot tell you the bug was ever real - the same trap
   passives.test.js names ("the two cases must disagree") and the same one the harness plan's Task 5
   records, where a probe asserted on what it had itself assigned and passed forever against the bug
   it existed to catch. */
import { test } from 'node:test';
import assert from 'node:assert';
import { isDark, suiteLine, suiteOf, reconcile,
         classOf, confirmTargets, splitConfirmed, confirmPass,
         CONFIRM_LAUNCHES, majorityFailed, decided, mergeFlaps, flapNote } from '../gate-rules.js';

/* run-all.js as it stood before this fix, transcribed exactly. */
const OLD_LINE  = (name, s) => s.skipped ? `${name}: skipped (not written yet)`
                                         : `${name}: ${s.pass || 0} pass, ${s.fail || 0} fail`;
const OLD_FIXED = (known, now) => [...known].filter(id => !now.has(id));

test('a missing file and a suite that could not measure are DIFFERENT states', () => {
  assert.strictEqual(suiteLine('mp', { missing: true, pass: 0, fail: 0 }),
                     'mp: skipped (not written yet)');
  const ran = suiteLine('mp', { pass: 0, fail: 0, skipped: '3D hero layer not live (on:false ready:false)' });
  assert.match(ran, /SKIPPED/);
  assert.match(ran, /3D hero layer not live/);          // the reason survives, which is the whole value of a skip
  assert.match(ran, /did NOT run/);                     // and the reader is told the assertions did not happen
  assert.doesNotMatch(ran, /not written yet/);
});

test('and the old rule got that case wrong — the two must disagree', () => {
  const s = { pass: 0, fail: 0, skipped: '3D hero layer not live (on:false ready:false)' };
  assert.strictEqual(OLD_LINE('mp', s), 'mp: skipped (not written yet)');   // what it really printed
  assert.notStrictEqual(suiteLine('mp', s), OLD_LINE('mp', s));
});

test('a suite that ran and passed prints its counts, unproven included', () => {
  assert.strictEqual(suiteLine('skills', { pass: 70, fail: 3, unproven: ['a', 'b'] }),
                     'skills: 70 pass, 3 fail, 2 unproven');
  assert.strictEqual(suiteLine('levels', { pass: 35, fail: 0 }), 'levels: 35 pass, 0 fail');
});

test('dark means produced no verdicts, by either route', () => {
  assert.strictEqual(isDark({ missing: true }), true);
  assert.strictEqual(isDark({ skipped: 'layer off' }), true);
  assert.strictEqual(isDark({ pass: 16, fail: 0 }), false);
  assert.strictEqual(isDark({ pass: 0, fail: 0, failures: [] }), false);   // ran, found nothing wrong
});

test('an id says which suite it came from', () => {
  assert.strictEqual(suiteOf('skills:ranger/Tumble:damage'), 'skills');
  assert.strictEqual(suiteOf('mp:/holds every hero:'), 'mp');
});

test('A SUITE THAT DID NOT RUN CANNOT SHRINK THE BASELINE', () => {
  /* The failure this whole module exists for. mp did not look; its baselined failure is not fixed,
     it is unmeasured, and it must survive into the next baseline. */
  const known = new Set(['skills:ranger/Tumble:damage', 'mp:/holds every hero:']);
  const now   = new Set(['skills:ranger/Tumble:damage']);
  const r = reconcile(known, now, ['mp']);

  assert.deepStrictEqual(r.fixed, []);                              // nothing was fixed
  assert.deepStrictEqual(r.carried, ['mp:/holds every hero:']);
  assert.ok(r.next.includes('mp:/holds every hero:'));              // and it is still known tomorrow
  assert.deepStrictEqual(r.fresh, []);
});

test('and the old rule would have announced that as FIXED and dropped it', () => {
  const known = new Set(['skills:ranger/Tumble:damage', 'mp:/holds every hero:']);
  const now   = new Set(['skills:ranger/Tumble:damage']);
  assert.deepStrictEqual(OLD_FIXED(known, now), ['mp:/holds every hero:']);   // the bug, stated
  assert.notDeepStrictEqual(reconcile(known, now, ['mp']).fixed, OLD_FIXED(known, now));
});

test('a suite that DID run and no longer fails is still genuinely fixed', () => {
  /* The ratchet must keep working. Breaking it in the name of safety would be the other failure -
     a baseline that only ever grows is the stale list the run-all header already fixed once. */
  const known = new Set(['skills:monk/Killer Focus:damage', 'skills:ranger/Tumble:damage']);
  const now   = new Set(['skills:ranger/Tumble:damage']);
  const r = reconcile(known, now, []);
  assert.deepStrictEqual(r.fixed, ['skills:monk/Killer Focus:damage']);
  assert.deepStrictEqual(r.next, ['skills:ranger/Tumble:damage']);
  assert.deepStrictEqual(r.carried, []);
});

test('a failure not in the baseline is a regression, and a dark suite cannot manufacture one', () => {
  const known = new Set(['skills:ranger/Tumble:damage']);
  const now   = new Set(['skills:ranger/Tumble:damage', 'levels:Emberdeep/quest:ed1']);
  assert.deepStrictEqual(reconcile(known, now, []).fresh, ['levels:Emberdeep/quest:ed1']);
  /* mp produced nothing, so it can contribute nothing to `now` and therefore nothing to `fresh`. */
  assert.deepStrictEqual(reconcile(known, new Set(['skills:ranger/Tumble:damage']), ['mp']).fresh, []);
});

/* A SUITE THAT CRASHED. run-all.js as it stood before this fix, transcribed exactly: a thrown suite
   became one synthetic failure row, and `idOf` had nothing to name it with. */
const OLD_CRASH  = name => ({ pass: 0, fail: 1, failures: [{ id: name, detail: 'ENOSPC: no space left on device' }] });
const NEW_CRASH  = () => ({ crashed: 'ENOSPC: no space left on device', pass: 0, fail: 0, failures: [] });
const OLD_ISDARK = s => !!(s && (s.missing || s.skipped));
const CRASH_ID   = 'skills:/:';   // idOf('skills', {id, detail}) — no cls, no skill, no claim
const THREE = ['skills:ranger/Tumble:damage', 'skills:mage/Attunement:damage', 'skills:berserker/Charge:damage'];

test('a suite that THREW measured nothing, so it is dark — and the old rule said it was not', () => {
  assert.strictEqual(isDark(NEW_CRASH()), true);
  assert.strictEqual(OLD_ISDARK(OLD_CRASH('skills')), false);   // the bug, in one boolean
  assert.strictEqual(isDark({ pass: 70, fail: 3 }), false);     // a suite that RAN is still not dark
});

test('a crash is reported as a crash, not as "0 pass, 1 fail"', () => {
  assert.match(suiteLine('skills', NEW_CRASH()), /CRASHED — ENOSPC.*not a game failure/);
  assert.strictEqual(OLD_LINE('skills', OLD_CRASH('skills')), 'skills: 0 pass, 1 fail');
});

test('THE 2026-08-12 16:02 GATE, reconstructed: a full disk was reported as a game regression', () => {
  /* What that run actually printed, and what it cost: REGRESSION on an id with no class and no
     skill, the three real knowns announced FIXED by a suite that never looked, GATE: FAIL (1 new),
     and autopilot.ps1 stashing the run's finished work. */
  const known = new Set(THREE);
  const old   = reconcile(known, new Set([CRASH_ID]), []);          // crash counted as a verdict
  assert.deepStrictEqual(old.fresh, [CRASH_ID]);                     // -> red gate, tree stashed
  assert.deepStrictEqual(old.fixed, THREE);                          // -> and the baseline credited

  /* With the crash dark, the same run says nothing about the game either way. */
  const now = reconcile(known, new Set(), ['skills']);
  assert.deepStrictEqual(now.fresh, []);
  assert.deepStrictEqual(now.fixed, []);                             // nobody fixed anything
  assert.deepStrictEqual(now.carried, THREE);                        // and nothing is forgotten
  assert.deepStrictEqual(now.next, THREE);
});

test('THE CONFIRM PASS CANNOT RESCUE A CRASH, which is why this is a separate fix', () => {
  /* A crash row names no class, so there is nothing to re-run and the accusation would stand — the
     confirm pass is a defence against a flapping SKILL, not against a broken ruler. */
  assert.strictEqual(classOf(CRASH_ID), null);
  assert.deepStrictEqual(confirmTargets([CRASH_ID]), []);
  assert.deepStrictEqual(splitConfirmed([CRASH_ID], [], []).confirmed, [CRASH_ID]);
});

/* THE CONFIRM PASS. The old rule is transcribed here too: every fresh id was a REGRESSION, full
   stop, with no second measurement anywhere in the gate. */
const OLD_REGRESSIONS = fresh => [...fresh];

const DIVE = 'skills:skylancer/Dive Strike:damage';

test('an id says which CLASS it came from, and only a per-class row has one', () => {
  assert.strictEqual(classOf(DIVE), 'skylancer');
  assert.strictEqual(classOf('skills:ranger/Tumble:damage'), 'ranger');
  assert.strictEqual(classOf('levels:Emberdeep/quest:ed1'), null);   // keyed by zone, not class
  assert.strictEqual(classOf('mp:/holds every hero:'), null);        // keyed by peer
});

test('only the re-runnable rows are worth a second launch, and each class is paid for once', () => {
  assert.deepStrictEqual(confirmTargets([DIVE, 'skills:skylancer/Wind Lift:damage']), ['skylancer']);
  assert.deepStrictEqual(confirmTargets([DIVE, 'levels:Emberdeep/quest:ed1']), ['skylancer']);
  assert.deepStrictEqual(confirmTargets([]), []);
});

test('re-measured and it failed again — that is a real REGRESSION and the gate stays red', () => {
  const r = splitConfirmed([DIVE], ['skylancer'], [DIVE]);
  assert.deepStrictEqual(r.confirmed, [DIVE]);
  assert.deepStrictEqual(r.flapped, []);
});

test('THE FLAP: re-measured and it did not fail, so it is not a regression', () => {
  /* The real 2026-08-12 case. The gate printed REGRESSION for Dive Strike against a change gated on
     meta.classId==='warrior'; three immediate re-runs of skylancer reported 4 pass, 0 fail. */
  const r = splitConfirmed([DIVE], ['skylancer'], []);
  assert.deepStrictEqual(r.confirmed, []);
  assert.deepStrictEqual(r.flapped, [DIVE]);
});

test('and the old rule got that case wrong — the two must disagree', () => {
  const fresh = [DIVE];
  assert.deepStrictEqual(OLD_REGRESSIONS(fresh), [DIVE]);            // what it really printed
  assert.notDeepStrictEqual(splitConfirmed(fresh, ['skylancer'], []).confirmed, OLD_REGRESSIONS(fresh));
});

test('A FLAP IS NOT A FIX EITHER — it must never be written into the baseline', () => {
  /* The trap in the other direction. A flapped id is absent from the baseline by definition (that is
     what made it fresh), so recording it would hand the suite a permanent green light for a row
     nobody has ever diagnosed. It is dropped from `now` before the ratchet runs. */
  const known = new Set(['skills:ranger/Tumble:damage']);
  const now   = new Set(['skills:ranger/Tumble:damage', DIVE]);
  const { flapped } = splitConfirmed(reconcile(known, now, []).fresh, ['skylancer'], []);
  const settled = new Set([...now].filter(id => !flapped.includes(id)));

  const r = reconcile(known, settled, []);
  assert.deepStrictEqual(r.fresh, []);                     // green
  assert.deepStrictEqual(r.fixed, []);                     // and nothing was fixed
  assert.ok(!r.next.includes(DIVE));                       // the flake is not now "known"
  assert.deepStrictEqual(r.next, ['skills:ranger/Tumble:damage']);
});

test('A ROW THAT CANNOT BE RE-MEASURED STAYS LOUD', () => {
  /* Levels and mp ids have no per-class re-run, and a confirm run that went dark passes no targets.
     Both must leave the accusation standing: missing data is not a negative finding. */
  assert.deepStrictEqual(splitConfirmed(['levels:Emberdeep/quest:ed1'], ['skylancer'], []).confirmed,
                         ['levels:Emberdeep/quest:ed1']);
  assert.deepStrictEqual(splitConfirmed([DIVE], [], []).confirmed, [DIVE]);   // confirm run gave nothing
  assert.deepStrictEqual(splitConfirmed([DIVE], [], []).flapped, []);
});

test('a mixed run splits both ways at once', () => {
  const fresh = [DIVE, 'skills:monk/Deflect:damage', 'levels:Emberdeep/quest:ed1'];
  const r = splitConfirmed(fresh, ['skylancer', 'monk'], ['skills:monk/Deflect:damage']);
  assert.deepStrictEqual(r.flapped, [DIVE]);
  assert.deepStrictEqual(r.confirmed, ['skills:monk/Deflect:damage', 'levels:Emberdeep/quest:ed1']);
});

/* THE ORCHESTRATION ITSELF, driven with a fake re-run. These exercise the same function run-all.js
   calls — not a transcription of it — so the launch-shaped half is covered without a launch. */
const drive = (fresh, rerun, opts = {}) => {
  const lines = [];
  return confirmPass(fresh, { rerun, idOf: f => `skills:${f.cls}/${f.skill}:${f.claim}`,
                              log: l => lines.push(l), ...opts }).then(r => ({ ...r, lines }));
};
const SKY_FAIL = { cls: 'skylancer', skill: 'Dive Strike', claim: 'damage' };

test('confirm pass: a clean run re-runs NOTHING', async () => {
  let called = 0;
  const r = await drive([], async () => { called++; return { pass: 1, fail: 0, failures: [] }; });
  assert.strictEqual(called, 0);                  // the cost is paid only when something is fresh
  assert.deepStrictEqual(r.confirmed, []);
  assert.strictEqual(r.ran, false);
});

test('confirm pass: it re-runs ONLY the accused class', async () => {
  let got = null;
  await drive([DIVE], async t => { got = t; return { pass: 4, fail: 0, failures: [] }; });
  assert.deepStrictEqual(got, ['skylancer']);     // not all sixteen
});

test('confirm pass: the flap is cleared and said out loud', async () => {
  const r = await drive([DIVE], async () => ({ pass: 4, fail: 0, failures: [] }));
  assert.deepStrictEqual(r.flapped, [DIVE]);
  assert.deepStrictEqual(r.confirmed, []);
  assert.ok(r.lines.some(l => l.startsWith('FLAPPED')));
  assert.ok(r.lines.some(l => /launch\(es\) of: skylancer/.test(l)));
});

test('confirm pass: a row that fails BOTH times is still a regression', async () => {
  const r = await drive([DIVE], async () => ({ pass: 3, fail: 1, failures: [SKY_FAIL] }));
  assert.deepStrictEqual(r.confirmed, [DIVE]);
  assert.deepStrictEqual(r.flapped, []);
});

test('confirm pass: A RE-RUN THAT THREW CLEARS NOTHING', async () => {
  /* The dangerous direction. If a crashed confirm run counted as "did not fail again", every real
     regression would be laundered into a flap by breaking the re-run. */
  const r = await drive([DIVE], async () => { throw new Error('chrome would not start'); });
  assert.deepStrictEqual(r.confirmed, [DIVE]);
  assert.deepStrictEqual(r.flapped, []);
  assert.ok(r.lines.some(l => /confirm launch \d+\/\d+ FAILED/.test(l)));
  assert.ok(r.lines.some(l => /every new failure stands/.test(l)));
});

test('confirm pass: A DARK RE-RUN CLEARS NOTHING EITHER', async () => {
  const r = await drive([DIVE], async () => ({ skipped: '3D hero layer not live', pass: 0, fail: 0 }));
  assert.deepStrictEqual(r.confirmed, [DIVE]);
  assert.deepStrictEqual(r.flapped, []);
  assert.ok(r.lines.some(l => /confirm launch \d+\/\d+ DARK/.test(l)));
});

test('confirm pass: a levels row alone never spends a launch', async () => {
  let called = 0;
  const r = await drive(['levels:Emberdeep/quest:ed1'], async () => { called++; return {}; });
  assert.strictEqual(called, 0);                            // nothing re-runnable to pay for
  assert.deepStrictEqual(r.confirmed, ['levels:Emberdeep/quest:ed1']);   // and it stays loud
});

/* ── BEST-OF-N. One confirming re-run was not enough, and a real gate on 2026-08-13 is the evidence:
   it printed `confirming 1 new failure(s) with a second launch of: warlock`, upheld
   `skills:warlock/Final Curse:damage`, and cost a verified fix a whole run. Four launches of the
   identical command on the identical tree then came back three fail / one pass, and two launches of
   the same command with the change reverted both passed. The row fails ~3 in 4 whatever the tree
   says, so a single re-run is a coin toss weighted by the flakiness it is measuring.

   THE OLD SINGLE-LAUNCH RULE IS TRANSCRIBED BELOW AND ASSERTED TO DISAGREE, same as every other
   section in this file — a test that only says the new rule is the new rule cannot tell you the old
   one was ever wrong. */
const OLD_ONE_LAUNCH = (fresh, targets, firstLaunchFailed) =>
  splitConfirmed(fresh, targets, firstLaunchFailed ? fresh : []);
const CURSE = 'skills:warlock/Final Curse:damage';
const CURSE_FAIL = { cls: 'warlock', skill: 'Final Curse', claim: 'damage' };
const PASSES = { pass: 4, fail: 0, failures: [] };
const FAILS  = { pass: 3, fail: 1, failures: [SKY_FAIL] };
/* A rerun that returns a scripted sequence and counts how many launches were actually spent. */
const script = (...results) => {
  const f = async () => results[Math.min(f.calls++, results.length - 1)];
  f.calls = 0;
  return f;
};

test('the majority rule reduces EXACTLY to the old rule at one launch', () => {
  /* This is why there is one function and not two. Every single-launch case above still drives it. */
  assert.strictEqual(majorityFailed(1, 1), true);    // failed the re-run  -> CONFIRMED
  assert.strictEqual(majorityFailed(0, 1), false);   // passed the re-run  -> FLAPPED
  assert.strictEqual(majorityFailed(0, 0), true);    // nothing measured   -> stands
});

test('at N=3 a row must fail 2 of the 3 confirming launches — 3 of 4 overall', () => {
  assert.strictEqual(majorityFailed(3, 3), true);    // 4 of 4
  assert.strictEqual(majorityFailed(2, 3), true);    // 3 of 4
  assert.strictEqual(majorityFailed(1, 3), false);   // 2 of 4 is not a majority
  assert.strictEqual(majorityFailed(0, 3), false);   // 1 of 4
});

test('A REAL REGRESSION IS NEVER LAUNDERED — the property that must not be lost', async () => {
  /* Best-of-N sharpens a verdict; it must not soften one. A row that fails every launch stands, and
     it stands at every N. */
  for(const n of [1, 2, 3, 5]) assert.strictEqual(majorityFailed(n, n), true);
  const r = await drive([DIVE], script(FAILS, FAILS, FAILS));
  assert.deepStrictEqual(r.confirmed, [DIVE]);
  assert.deepStrictEqual(r.flapped, []);
});

test('THE DISAGREEMENT: fail once then pass twice is a FLAP, and the old rule called it a regression', async () => {
  /* The exact shape the warlock run could not tell apart. Under the old rule the whole verdict was
     whichever answer the FIRST re-run happened to give. */
  assert.deepStrictEqual(OLD_ONE_LAUNCH([DIVE], ['skylancer'], true).confirmed, [DIVE]);   // the bug, stated

  const r = await drive([DIVE], script(FAILS, PASSES, PASSES));
  assert.deepStrictEqual(r.flapped, [DIVE]);                       // 2 of 4 — not a majority
  assert.deepStrictEqual(r.confirmed, []);
  assert.notDeepStrictEqual(r.confirmed, OLD_ONE_LAUNCH([DIVE], ['skylancer'], true).confirmed);
});

test('and pass once then fail twice is a REGRESSION, where the old rule would have cleared it', async () => {
  /* The same coin, other face: the old rule threw away everything after launch one in this
     direction too, and this is the direction where doing so hides a real break. */
  assert.deepStrictEqual(OLD_ONE_LAUNCH([DIVE], ['skylancer'], false).flapped, [DIVE]);

  const r = await drive([DIVE], script(PASSES, FAILS, FAILS));
  assert.deepStrictEqual(r.confirmed, [DIVE]);                     // 3 of 4
  assert.deepStrictEqual(r.flapped, []);
});

test('THE TALLY IS PRINTED, so the number is in the log and not in a run\'s head', async () => {
  /* The denominator is the launches actually SPENT, not the N that was budgeted — two agreeing
     launches settle it, so a plainly-broken row reads `3 of 3` rather than a `4 of 4` that never
     happened. Reporting the budget would be a number nobody measured. */
  const r = await drive([DIVE], script(FAILS, FAILS, FAILS));
  assert.ok(r.lines.some(l => /CONFIRMED \(3 of 3 launches failed\).*Dive Strike/.test(l)), r.lines.join('\n'));
  assert.strictEqual(r.tally[DIVE], 2);
  assert.strictEqual(r.launches, 2);

  const f = await drive([DIVE], script(FAILS, PASSES, PASSES));
  assert.ok(f.lines.some(l => /FLAPPED \(2 of 4 launches failed/.test(l)), f.lines.join('\n'));
  assert.strictEqual(f.launches, 3);                      // this one really did cost three
});

test('decided(): a verdict no remaining launch could change, and one that is still open', () => {
  assert.strictEqual(decided(2, 2, 1), true);    // 3 of 3 already; a third launch cannot undo it
  assert.strictEqual(decided(0, 2, 1), false);   // at best 2 of 4 — never a majority
  assert.strictEqual(decided(1, 2, 1), null);    // 2 of 4 or 3 of 4 — the third launch decides
  assert.strictEqual(decided(1, 1, 2), null);    // nothing is ever settled after ONE launch
  assert.strictEqual(decided(0, 1, 2), null);
});

test('and it SAVES a launch: two launches that agree end the loop', async () => {
  const clean = script(PASSES, PASSES, PASSES);
  await drive([DIVE], clean);
  assert.strictEqual(clean.calls, 2);                     // not 3 — the verdict was settled

  const broken = script(FAILS, FAILS, FAILS);
  await drive([DIVE], broken);
  assert.strictEqual(broken.calls, 2);

  const split = script(FAILS, PASSES, PASSES);
  await drive([DIVE], split);
  assert.strictEqual(split.calls, 3);                     // disagreement is what costs the third
});

test('N is explicit, and one launch is still available for anything that wants it', async () => {
  assert.strictEqual(CONFIRM_LAUNCHES, 3);
  const one = script(PASSES, FAILS, FAILS);
  const r = await drive([DIVE], one, { launches: 1 });
  assert.strictEqual(one.calls, 1);
  assert.deepStrictEqual(r.flapped, [DIVE]);              // the old behaviour, on demand
});

const DARK = { skipped: '3D hero layer not live', pass: 0, fail: 0 };

test('A DARK LAUNCH IN THE MIDDLE COUNTS FOR NEITHER SIDE', async () => {
  /* It must not be read as a pass — that is the direction that laundered every real regression, the
     trap Step 2 named — and it must not inflate the denominator either: a launch that measured
     nothing is not a launch. Here the row passes, goes dark, then fails, and the verdict is decided
     on the TWO real measurements. */
  const r = await drive([DIVE], script(PASSES, DARK, FAILS));
  assert.strictEqual(r.launches, 2);                      // two MEASURED, of three spent
  assert.strictEqual(r.tally[DIVE], 1);
  assert.deepStrictEqual(r.confirmed, [DIVE]);            // 2 of 3 is a majority
  assert.ok(r.lines.some(l => /DARK.*measured nothing/.test(l)));
  assert.ok(r.lines.some(l => /CONFIRMED \(2 of 3 launches failed\)/.test(l)), r.lines.join('\n'));
});

test('a dark launch SPENDS its slot, and that leans the verdict toward standing', async () => {
  /* Deliberate, and stated so the next reader does not "fix" it into a retry loop: a re-run that
     keeps going dark because Chrome will not start would then never terminate. Losing a slot makes
     the remaining evidence carry more weight, which points at CONFIRMED — the safe direction, and
     the same one every other missing-measurement rule in this file takes. */
  const s = script(FAILS, DARK, FAILS);
  const r = await drive([DIVE], s);
  assert.strictEqual(s.calls, 2);                         // the dark launch settled it, at m=1 f=1
  assert.strictEqual(r.launches, 1);
  assert.deepStrictEqual(r.confirmed, [DIVE]);            // 2 of 2
  assert.strictEqual(decided(1, 1, 1), true);             // no future could have cleared it
});

test('two rows in one class settle independently on the same launches', async () => {
  const LIFT = 'skills:skylancer/Wind Lift:damage';
  const LIFT_FAIL = { cls: 'skylancer', skill: 'Wind Lift', claim: 'damage' };
  const both = { pass: 2, fail: 2, failures: [SKY_FAIL, LIFT_FAIL] };
  const lift = { pass: 3, fail: 1, failures: [LIFT_FAIL] };
  const r = await drive([DIVE, LIFT], script(both, lift, lift));
  assert.deepStrictEqual(r.confirmed, [LIFT]);            // 4 of 4
  assert.deepStrictEqual(r.flapped, [DIVE]);              // 2 of 4
});

/* ── THE FLAP LEDGER. The cheap half, and the one that would have answered the warlock question in
   zero launches: nothing in the gate recorded that a row had been accused before, so two runs two
   days apart each met a delayed-payout row for the "first" time. */

test('the ledger accumulates across runs and keeps the two verdicts apart', () => {
  let led = mergeFlaps({}, { flapped: [CURSE], at: '2026-08-13T01:00:00Z' });
  led = mergeFlaps(led, { flapped: [CURSE], confirmed: [DIVE], at: '2026-08-13T02:00:00Z' });
  led = mergeFlaps(led, { confirmed: [CURSE], at: '2026-08-13T03:00:00Z' });

  assert.deepStrictEqual(led[CURSE], { flapped: 2, confirmed: 1, last: '2026-08-13T03:00:00Z' });
  assert.deepStrictEqual(led[DIVE],  { flapped: 0, confirmed: 1, last: '2026-08-13T02:00:00Z' });
});

test('the ledger does not mutate what it was given', () => {
  const prev = { [CURSE]: { flapped: 1, confirmed: 0 } };
  mergeFlaps(prev, { flapped: [CURSE] });
  assert.strictEqual(prev[CURSE].flapped, 1);
});

test('a row nobody has ever seen gets NO note, and a seen one names both counts', () => {
  assert.strictEqual(flapNote({}, CURSE), '');
  assert.strictEqual(flapNote({ [CURSE]: { flapped: 0, confirmed: 0 } }, CURSE), '');
  const note = flapNote({ [CURSE]: { flapped: 3, confirmed: 1, last: '2026-08-13T03:00:00Z' } }, CURSE);
  assert.match(note, /FLAPPED 3/);
  assert.match(note, /CONFIRMED 1/);
  assert.match(note, /Final Curse/);
});

test('and the confirm pass reads it out before spending a single launch', async () => {
  const history = { [CURSE]: { flapped: 2, confirmed: 0, last: '2026-08-12T16:02:00Z' } };
  const r = await drive([CURSE], script(FAILS, FAILS), { history });
  const idx = r.lines.findIndex(l => /ledger: .*FLAPPED 2/.test(l));
  assert.ok(idx >= 0, r.lines.join('\n'));
  assert.ok(idx < r.lines.findIndex(l => /confirm launch/.test(l)) ||
            !r.lines.some(l => /confirm launch/.test(l)));
});

test('a clean run writes nothing to the ledger, because nothing was accused', async () => {
  const r = await drive([], script(PASSES));
  assert.strictEqual(r.ran, false);
  assert.deepStrictEqual(mergeFlaps({}, { flapped: r.flapped, confirmed: r.confirmed }), {});
});

test('the real 2026-08-11 gate run reconciles to exactly what it printed', () => {
  /* The three knowns are the section B/C design calls that belong to Oliver, mp was dark, and the
     gate said PASS (3 known, 0 newly fixed). With the old rule it would have said the same thing
     ONLY because no mp failure happened to be baselined that day. */
  const known = new Set(['skills:ranger/Tumble:damage', 'skills:mage/Attunement:damage',
                         'skills:berserker/Charge:damage']);
  const r = reconcile(known, new Set([...known]), ['mp']);
  assert.deepStrictEqual(r.fresh, []);
  assert.deepStrictEqual(r.fixed, []);
  assert.strictEqual(r.next.length, 3);
});
