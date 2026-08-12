/* THE GATE. Autopilot may only leave work behind when this exits 0.

   IT GATES ON REGRESSION, NOT ON PERFECTION, and that distinction is what makes it usable on day
   one. The game already has known failures - warrior/Charge promises damage and deals none, which
   is exactly the bug Oliver found in PvP. A gate meaning "everything passes" would be red from the
   first run, so every autopilot run would revert its own work and the automation would deadlock
   while looking busy. So: the first run records a BASELINE, and afterwards a run is green when it
   introduces no failure that was not already there. Fixing a baselined failure shrinks the
   baseline; that is the whole point of the exercise.

   Unit tests run first because they take milliseconds. Measuring the game with a broken ruler for
   forty minutes and then discovering the ruler was wrong is the failure mode this whole harness
   exists to stop. */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isDark, suiteLine, suiteOf, reconcile, confirmPass } from './gate-rules.js';

const HERE = import.meta.dirname;
const REPORT = join(HERE, 'report.json');
const BASELINE = join(HERE, 'baseline.json');

/* node --test on a DIRECTORY fails on Windows - it treats the directory as a test file - so the
   files are enumerated and passed explicitly. */
function unitTests(){
  const dir = join(HERE, 'test');
  if(!existsSync(dir)) return { pass: 0, fail: 0, failures: [] };
  const files = readdirSync(dir).filter(f => f.endsWith('.test.js')).map(f => join(dir, f));
  if(!files.length) return { pass: 0, fail: 0, failures: [] };
  try {
    execFileSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
    return { pass: 1, fail: 0, failures: [] };
  } catch(e){
    return { pass: 0, fail: 1, failures: [{ id: 'unit', detail: 'unit tests failed' }] };
  }
}

/* A suite that is not written yet is SKIPPED, not failed. The plan builds them one at a time and
   a missing file must not wedge the automation that is meant to be building it.
   `missing`, NOT `skipped` — a suite sets `skipped:<reason>` itself when it ran and could not
   measure (test-mp.js does, when the 3D layer is not live). Those are two different states and
   collapsing them printed "not written yet" for a file that has existed since Task 5. See
   gate-rules.js. */
async function suite(name, file, fn){
  if(!existsSync(join(HERE, file))) return { missing: true, pass: 0, fail: 0, failures: [] };
  try {
    const mod = await import('./' + file);
    return await mod[fn]();
  } catch(e){
    /* A THROWN SUITE MEASURED NOTHING, so it reports nothing. Until 2026-08-12 this line answered a
       crash with `{pass:0, fail:1, failures:[{id:name, …}]}` — a failure row with no cls and no
       claim, which `idOf` named `skills:/:` and the ratchet called a REGRESSION. A disk-full Chrome
       therefore read as a game bug and cost a run its verified work; see gate-rules.js `isDark` for
       the gate output that did it. The detail is kept and printed, it is simply not a verdict. */
    return { crashed: String(e && e.message || e).slice(0, 300), pass: 0, fail: 0, failures: [] };
  }
}

/* A stable identity for one failure, so today's report can be compared with the baseline. */
const idOf = (s, f) => `${s}:${f.cls || f.zone || ''}/${f.skill || f.check || ''}:${f.claim || ''}`;

async function main(){
  const report = { at: new Date().toISOString(), suites: {} };

  report.suites.unit = unitTests();
  if(report.suites.unit.fail){
    writeFileSync(REPORT, JSON.stringify(report, null, 2));
    console.log('GATE: FAIL (unit tests) — slow suites not run');
    process.exit(1);
  }

  report.suites.skills = await suite('skills', 'test-skills.js', 'runSkillTests');
  report.suites.levels = await suite('levels', 'test-levels.js', 'runLevelTests');
  report.suites.mp     = await suite('mp',     'test-mp.js',     'runMpTests');

  const now = new Set();
  for(const [name, s] of Object.entries(report.suites)){
    for(const f of (s.failures || [])) now.add(idOf(name, f));
  }
  writeFileSync(REPORT, JSON.stringify(report, null, 2));

  /* Which suites produced no verdicts at all. Kept as a set because it decides both what is
     printed and, below, what the ratchet is allowed to call fixed. */
  const dark = new Set(Object.entries(report.suites).filter(([, s]) => isDark(s)).map(([k]) => k));
  for(const [k, s] of Object.entries(report.suites)) console.log(suiteLine(k, s));

  /* A suite that THREW is a broken ruler, not a finding — see gate-rules.js `isDark`. It exits 2:
     not 0, because nothing may be committed on the strength of a measurement that did not happen;
     and not 1, because 1 means REGRESSION and autopilot.ps1 answers that by stashing the run's
     tree. The distinction is the whole point — the run this was written for lost the confirm pass
     and the disk-leak fix to a stash because a full disk was reported as a game failure. */
  const crashed = Object.entries(report.suites).filter(([, s]) => s.crashed);
  const inconclusive = () => {
    for(const [k, s] of crashed) console.log(`INCONCLUSIVE: ${k} crashed — ${s.crashed}`);
    console.log(`GATE: INCONCLUSIVE (${crashed.length} suite(s) crashed; nothing was measured, so nothing is claimed)`);
    process.exit(2);
  };

  if(!existsSync(BASELINE)){
    /* A first baseline recorded while a suite was dark would write down "no failures here" for a
       suite that never looked, and every later run would ratchet against that fiction. */
    if(crashed.length) inconclusive();
    writeFileSync(BASELINE, JSON.stringify({ at: report.at, known: [...now] }, null, 2));
    console.log(`GATE: PASS (baseline recorded — ${now.size} known failures)`);
    process.exit(0);
  }

  const known = new Set(JSON.parse(readFileSync(BASELINE, 'utf8')).known || []);
  /* A DARK suite's baselined failures are CARRIED, never counted as fixed. `fixed = known - now`
     alone credits a suite that never looked with every bug it did not report — announcing FIXED and
     dropping it from the file, which is docs/VISION.md's "missing data is not a negative finding"
     inverted into a positive one, silently. The flake case the header below reasons about is
     different and still accepted: a suite that RAN and under-reported shrinks the baseline and the
     failure returns loudly next run. A suite that did not run leaves nothing to be loud about. */
  const first = reconcile(known, now, dark);

  /* THE CONFIRM PASS. A fresh failure is re-measured before it is called a REGRESSION, because a red
     gate makes autopilot.ps1 stash the run's tree and at least one skills row is known to fail on
     geometry rather than on code — see gate-rules.js for the measurement and the three rules. Only
     the classes actually named are re-run, and only when something is fresh, so a clean run pays
     nothing. If the re-run throws or goes dark it passes no targets, and every accusation stands.
     The re-run is scoped to the accused classes ONLY — `runSkillTests({classes})` is the same entry
     point the CLI's --classes uses, so a flap costs one launch, not a second full suite. */
  const { flapped } = await confirmPass(first.fresh, {
    rerun: async targets => (await import('./test-skills.js')).runSkillTests({ classes: targets }),
    idOf: f => idOf('skills', f),
    log: line => console.log(line),
  });

  /* A flapped id is neither known nor fixed, so it is dropped before the ratchet sees it. */
  const settled = new Set([...now].filter(id => !flapped.includes(id)));
  const { fresh, fixed, carried, next } = reconcile(known, settled, dark);
  for(const id of fresh) console.log('REGRESSION: ' + id);
  for(const id of fixed) console.log('FIXED: ' + id);
  for(const id of carried) console.log(`CARRIED (${suiteOf(id)} did not run, so this is unmeasured rather than fixed): ` + id);

  /* Order matters: a REAL regression somewhere else still wins. A crash cannot launder one, it can
     only stop the run claiming the suites that never spoke. */
  if(fresh.length){ console.log(`GATE: FAIL (${fresh.length} new)`); process.exit(1); }
  if(crashed.length) inconclusive();

  /* THE RATCHET. This header has always promised that "fixing a baselined failure shrinks the
     baseline", and until now nothing ever wrote the file a second time - so the list only grew
     stale. A failure fixed in one run stayed "known" forever, which means it could come back the
     next day and the gate would wave it through as something it already knew about. Exactly the
     failure this whole harness exists to prevent, one level up: a green light that stops meaning
     anything.
     Rewritten only on a GREEN run, never when `fresh` is non-empty, so a regression can never
     baseline itself. The direction is safe: if a suite flakes and under-reports, the baseline
     shrinks and the real failure returns as a REGRESSION on the next run - loud, not silent. */
  if(fixed.length){
    writeFileSync(BASELINE, JSON.stringify({ at: report.at, known: next }, null, 2));
    console.log(`baseline shrunk: ${known.size} → ${next.length}`);
  }
  console.log(`GATE: PASS (${next.length} known, ${fixed.length} newly fixed` +
              (dark.size ? `, ${dark.size} suite(s) DARK: ${[...dark].join(', ')}` : '') + ')');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
