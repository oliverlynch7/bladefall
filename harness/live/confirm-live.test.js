/* THE CONFIRM PASS, DRIVEN AGAINST THE REAL GAME. Run by hand, never by the gate.

   WHY IT IS NOT IN `harness/test/`. `run-all.js` discovers every `*.test.js` in that directory and
   runs the lot in its FAST stage, before it will spend a single launch — the whole point of that
   stage being that a broken ruler is found in milliseconds rather than after forty minutes. This
   file launches real Chrome twice per case. Putting it there would add ~4 minutes to every gate and
   make the fast stage the slow one.

     node --test harness/live/confirm-live.test.js

   WHAT IT PROVES THAT `harness/test/gate.test.js` CANNOT. That file drives `confirmPass` with a fake
   `rerun`, which is the right way to test the ARITHMETIC and is exactly why the rules were pulled
   into `gate-rules.js`. What a fake can never check is the SEAM: that the thing `run-all.js` hands
   `confirmPass` really behaves the way the fake pretends. The plan says so in its own words — Task 4
   Step 4: "the real `runSkillTests({classes})` call is covered by unit tests and by its identical use
   in the CLI, not by having been watched to run inside a gate."

   Three things can only break at that seam, and each of them fails SILENTLY and in the dangerous
   direction — toward clearing an accusation rather than raising one:

   1. `runSkillTests({classes})` returning a shape `isDark()` calls dark. Every accusation would then
      stand forever and no flap would ever be cleared. Loud-ish, but wrong.
   2. `failureId` naming a re-run's failure differently from the way the accusation was named. The
      re-run would report the row, the confirm pass would not recognise it, and EVERY REAL REGRESSION
      would be laundered into a flap. This is the one that matters, and it is why `failureId` was
      moved into `gate-rules.js` and is imported here rather than transcribed — a transcription would
      assert that this file agrees with itself.
   3. `{classes:[x]}` being ignored, so the "scoped" re-run is a full sixteen-class suite. Nothing
      would be wrong with the verdict; the cost model in the plan (57.3s a launch) would simply be
      fiction.

   COST: four real launches, ~4 minutes. */
import { test } from 'node:test';
import assert from 'node:assert';
import { confirmPass, failureId, classOf } from '../gate-rules.js';
import { runSkillTests } from '../test-skills.js';

/* Exactly the wiring run-all.js uses, and deliberately written as one object so that a future edit
   to the call site has to be made here too. */
const LIVE = lines => ({
  rerun: async targets => runSkillTests({ classes: targets }),
  idOf: f => failureId('skills', f),
  log: l => { lines.push(l); console.log('    | ' + l); },
});

const run = fresh => {
  const lines = [];
  return confirmPass(fresh, LIVE(lines)).then(r => ({ ...r, lines }));
};

/* A baselined, deterministic failure: berserker/Charge deals zero damage at every bench distance
   (measured six ways by harness/probes/reach.probe.js) and has been in baseline.json since the
   ratchet was first recorded. If this row ever stops failing, this test is the wrong instrument
   rather than a bug — pick another baselined row from harness/baseline.json. */
const REAL_FAILURE = 'skills:berserker/Charge:damage';

/* A row that cannot exist, in a class that does. The re-run will genuinely run and genuinely not
   report it, which is a FLAP by construction rather than by luck. */
const NO_SUCH_ROW = 'skills:warlock/__no_such_skill__:damage';

test('LIVE: a real, reproducible failure is CONFIRMED by real launches', { timeout: 600000 }, async () => {
  const r = await run([REAL_FAILURE]);

  assert.strictEqual(r.ran, true, 'the re-run measured nothing — seam fault 1 (dark shape)');
  assert.deepStrictEqual(r.confirmed, [REAL_FAILURE],
    'the re-run reported this row and the confirm pass did not recognise it — seam fault 2 (failureId drift)');
  assert.deepStrictEqual(r.flapped, []);
  assert.strictEqual(r.tally[REAL_FAILURE], r.launches, 'it must fail EVERY launch, it is deterministic');
  assert.ok(r.lines.some(l => /CONFIRMED \(\d+ of \d+ launches failed\)/.test(l)));
});

test('LIVE: a row the re-run does not report is FLAPPED, and it takes two launches to say so', { timeout: 600000 }, async () => {
  const r = await run([NO_SUCH_ROW]);

  assert.strictEqual(r.ran, true);
  assert.deepStrictEqual(r.flapped, [NO_SUCH_ROW]);
  assert.deepStrictEqual(r.confirmed, []);
  assert.strictEqual(r.launches, 2, 'two agreeing launches settle it — a third would be waste');
  assert.strictEqual(r.tally[NO_SUCH_ROW], 0);
});

test('LIVE: the re-run really is scoped to the accused class', { timeout: 600000 }, async () => {
  /* Seam fault 3: if {classes} were ignored this would come back with all sixteen classes' worth of
     assertions and the plan's 57.3s-a-launch cost model would be fiction. One class is ~9. */
  const one = await runSkillTests({ classes: ['warlock'] });
  assert.ok(one.pass + one.fail > 0, 'the scoped suite measured nothing at all');
  assert.ok(one.pass + one.fail < 30, `scoping was ignored: ${one.pass + one.fail} assertions for one class`);
  assert.strictEqual(classOf(REAL_FAILURE), 'berserker');
});
