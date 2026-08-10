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
   a missing file must not wedge the automation that is meant to be building it. */
async function suite(name, file, fn){
  if(!existsSync(join(HERE, file))) return { skipped: true, pass: 0, fail: 0, failures: [] };
  try {
    const mod = await import('./' + file);
    return await mod[fn]();
  } catch(e){
    return { pass: 0, fail: 1, failures: [{ id: name, detail: String(e && e.message || e).slice(0, 300) }] };
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

  for(const [k, s] of Object.entries(report.suites)){
    if(s.skipped){ console.log(`${k}: skipped (not written yet)`); continue; }
    console.log(`${k}: ${s.pass || 0} pass, ${s.fail || 0} fail` +
                (s.unproven ? `, ${s.unproven.length} unproven` : ''));
  }

  if(!existsSync(BASELINE)){
    writeFileSync(BASELINE, JSON.stringify({ at: report.at, known: [...now] }, null, 2));
    console.log(`GATE: PASS (baseline recorded — ${now.size} known failures)`);
    process.exit(0);
  }

  const known = new Set(JSON.parse(readFileSync(BASELINE, 'utf8')).known || []);
  const fresh = [...now].filter(id => !known.has(id));
  const fixed = [...known].filter(id => !now.has(id));
  for(const id of fresh) console.log('REGRESSION: ' + id);
  for(const id of fixed) console.log('FIXED: ' + id);

  if(fresh.length){ console.log(`GATE: FAIL (${fresh.length} new)`); process.exit(1); }

  /* THE BASELINE HAS TO SHRINK, or the header above is a lie and this is a ratchet with no pawl.
     A fixed failure that stays in the file is a licence to break it again in a later run and be
     told the gate is green. Only ids from suites that actually RAN are dropped: a suite that was
     skipped - because its file does not exist yet, which is the normal state while the plan is
     still being built - must not have its known failures quietly forgotten and then re-reported
     as regressions the day it comes back. */
  if(fixed.length){
    const ran = new Set(Object.entries(report.suites).filter(([, s]) => !s.skipped).map(([k]) => k));
    const kept = [...known].filter(id => !ran.has(id.slice(0, id.indexOf(':'))));
    writeFileSync(BASELINE, JSON.stringify({ at: report.at, known: [...new Set([...kept, ...now])] }, null, 2));
    console.log(`baseline: ${known.size} → ${new Set([...kept, ...now]).size}`);
  }
  console.log(`GATE: PASS (${now.size} known, ${fixed.length} newly fixed)`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
