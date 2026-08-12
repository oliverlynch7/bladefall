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
         classOf, confirmTargets, splitConfirmed, confirmPass } from '../gate-rules.js';

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
const drive = (fresh, rerun) => {
  const lines = [];
  return confirmPass(fresh, { rerun, idOf: f => `skills:${f.cls}/${f.skill}:${f.claim}`,
                              log: l => lines.push(l) }).then(r => ({ ...r, lines }));
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
  assert.ok(r.lines.some(l => /second launch of: skylancer/.test(l)));
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
  assert.ok(r.lines.some(l => /confirm run FAILED/.test(l)));
  assert.ok(r.lines.some(l => /every new failure stands/.test(l)));
});

test('confirm pass: A DARK RE-RUN CLEARS NOTHING EITHER', async () => {
  const r = await drive([DIVE], async () => ({ skipped: '3D hero layer not live', pass: 0, fail: 0 }));
  assert.deepStrictEqual(r.confirmed, [DIVE]);
  assert.deepStrictEqual(r.flapped, []);
  assert.ok(r.lines.some(l => /confirm run DARK/.test(l)));
});

test('confirm pass: a levels row alone never spends a launch', async () => {
  let called = 0;
  const r = await drive(['levels:Emberdeep/quest:ed1'], async () => { called++; return {}; });
  assert.strictEqual(called, 0);                            // nothing re-runnable to pay for
  assert.deepStrictEqual(r.confirmed, ['levels:Emberdeep/quest:ed1']);   // and it stays loud
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
