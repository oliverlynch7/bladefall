/* THE GREEN-RUN REPORT, tested — including the CLI, because that is the part autopilot.ps1 calls.

   The point of run-report.js living in Node rather than in PowerShell is that these assertions can
   RUN under the allowlist an unattended session works within (`node --test` is on it; `powershell
   -Command` deliberately is not). So the CLI is exercised here as a child process against this very
   repository, not merely imported.

   THE TWO IDIOMS MUST DISAGREE. autopilot.ps1 builds every Telegram body by concatenating a string
   into a JSON literal. That is not a style complaint: a commit subject containing a double quote
   produces a body that is not JSON, the ping is silently dropped, and the run still looks green.
   The test below asserts the old idiom actually breaks on that input and the new one does not —
   the same rule gate.test.js and passives.test.js follow, because a test that only says the new
   behaviour is the new behaviour cannot tell you the bug was ever real. */
import { test } from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { shouldReport, reportText, reportBody, previewUrl, gateLineOf,
         commitsSince, baselineCount, currentBranch } from '../run-report.js';

const ROOT = join(import.meta.dirname, '..', '..');
const CLI = join(ROOT, 'harness', 'run-report.js');

/* autopilot.ps1's idiom, transcribed exactly, so the failure it carries is a measured one. */
const OLD_BODY = (text) => '{"action":"tgPing","password":"pw","text":"' + text + '"}';

test('a run that committed nothing has nothing to say', () => {
  assert.strictEqual(shouldReport([]), false);
  assert.strictEqual(shouldReport(undefined), false);
  assert.strictEqual(shouldReport(['one commit']), true);
});

test('the text is a header, one bullet per commit, and a gate line', () => {
  const t = reportText({ commits: ['fixed the thing', 'and the other thing'],
                         gate: 'GATE: PASS (57 known, 1 newly fixed)', baseline: 57,
                         url: 'https://autopilot-merged.bladefall.pages.dev/3d/' });
  assert.match(t, /2 commits/);
  assert.match(t, /play: https:\/\/autopilot-merged\.bladefall\.pages\.dev\/3d\//);
  assert.match(t, /^• fixed the thing$/m);
  assert.match(t, /^• and the other thing$/m);
  assert.match(t, /GATE: PASS \(57 known, 1 newly fixed\)/);
  assert.match(t, /57 known failures still tracked/);
});

test('one commit is not "1 commits"', () => {
  assert.match(reportText({ commits: ['only me'] }), /1 commit —|1 commit$/m);
});

test('an unmeasured baseline is not reported as zero failures', () => {
  const t = reportText({ commits: ['x'], gate: 'GATE: PASS (0 known, 0 newly fixed)', baseline: null });
  assert.doesNotMatch(t, /known failures still tracked/);
  assert.strictEqual(baselineCount(join(ROOT, 'harness', 'no-such-baseline.json')), null);
});

test('a commit subject with a quote in it breaks the old body and not this one', () => {
  const subject = 'harness: the bench said "5 pass" and meant \\ nothing';
  const body = reportBody({ commits: [subject], gate: 'GATE: PASS', baseline: 3, password: 'pw' });
  const parsed = JSON.parse(body);                       // must not throw — that is the whole test
  assert.strictEqual(parsed.action, 'tgPing');
  assert.strictEqual(parsed.password, 'pw');
  assert.ok(parsed.text.includes(subject));
  assert.throws(() => JSON.parse(OLD_BODY(reportText({ commits: [subject] }))),
                'the old string-concat idiom is supposed to produce invalid JSON here');
});

test('the preview URL follows the branch rather than a name written down two branches ago', () => {
  assert.strictEqual(previewUrl('autopilot-merged'), 'https://autopilot-merged.bladefall.pages.dev/3d/');
  assert.strictEqual(previewUrl('feature/Big_Thing'), 'https://feature-big-thing.bladefall.pages.dev/3d/');
  assert.strictEqual(previewUrl(''), 'https://bladefall.pages.dev/3d/');
});

test('the gate line is picked out of the gate\'s whole output, last one wins', () => {
  const out = 'skills: 70 pass, 0 fail\nREGRESSION: a/b\nGATE: FAIL (1 new)\n';
  assert.strictEqual(gateLineOf(out), 'GATE: FAIL (1 new)');
  assert.strictEqual(gateLineOf('nothing here'), null);
  assert.strictEqual(gateLineOf(''), null);
});

/* ── the halves that touch git ────────────────────────────────────────────────────────────────── */

const gitOk = (args) => {
  try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch(e){ return null; }
};

test('commitsSince reads this repository, and an empty range is empty', (t) => {
  const head = gitOk(['rev-parse', 'HEAD']);
  if(!head){ t.skip('not a git checkout'); return; }
  assert.deepStrictEqual(commitsSince(head), []);
  assert.deepStrictEqual(commitsSince(null), []);
  assert.ok(currentBranch().length >= 0);
});

test('the CLI prints a postable body for a real range, and exits 3 for an empty one', (t) => {
  const two = gitOk(['rev-parse', 'HEAD~2']);
  if(!two){ t.skip('fewer than two commits in this checkout'); return; }
  /* Expected subjects fetched with a DIFFERENT git invocation than the module uses, so this is not
     the probe asserting on what it assigned itself. */
  const want = gitOk(['log', '-2', '--pretty=format:%s']).split('\n');
  const out = execFileSync(process.execPath, [CLI, '--since', two, '--gate', 'GATE: PASS (3 known)',
                                              '--password', 'pw'],
                           { cwd: ROOT, encoding: 'utf8' });
  const parsed = JSON.parse(out);
  assert.strictEqual(parsed.action, 'tgPing');
  for(const s of want) assert.ok(parsed.text.includes(s), `missing commit subject: ${s}`);
  assert.match(parsed.text, /GATE: PASS \(3 known\)/);
  assert.match(parsed.text, /bladefall\.pages\.dev\/3d\//);

  const head = gitOk(['rev-parse', 'HEAD']);
  let code = 0;
  try { execFileSync(process.execPath, [CLI, '--since', head], { cwd: ROOT, encoding: 'utf8' }); }
  catch(e){ code = e.status; }
  assert.strictEqual(code, 3, 'a run with no commits must exit 3 so autopilot.ps1 stays quiet');
});

/* --out is the path autopilot.ps1 actually uses, and the reason is encoding: PowerShell 5.1 decodes
   a native command's stdout through an OEM codepage, so the bullets and the emoji would be mangled
   at capture if the body came back on stdout. The bytes on disk are therefore the contract - read
   them as bytes here, exactly as `[System.IO.File]::ReadAllBytes` will. */
test('--out writes UTF-8 bytes, so the bullet survives the trip PowerShell would have broken', (t) => {
  const two = gitOk(['rev-parse', 'HEAD~2']);
  if(!two){ t.skip('fewer than two commits in this checkout'); return; }
  const out = join(tmpdir(), 'bf-run-report-test.json');
  rmSync(out, { force: true });
  const printed = execFileSync(process.execPath, [CLI, '--since', two, '--out', out],
                               { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(printed.trim(), out, '--out prints the path it wrote, not the body');
  const bytes = readFileSync(out);                       // no decoding step, on purpose
  assert.ok(bytes.includes(Buffer.from('•', 'utf8')), 'the bullet is not UTF-8 on disk');
  const parsed = JSON.parse(bytes.toString('utf8'));
  assert.match(parsed.text, /^• /m);
  rmSync(out, { force: true });
});
