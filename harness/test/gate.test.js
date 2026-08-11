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
import { isDark, suiteLine, suiteOf, reconcile } from '../gate-rules.js';

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
