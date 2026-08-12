/* WHAT DID THAT RUN ACTUALLY DO? — the green-run report.

   The only thing the autopilot has ever pinged is a FAILURE alert, so a healthy run and no run at
   all look identical from the outside. Oliver has asked twice what it has been up to
   (docs/superpowers/plans/2026-08-11-harness-hardening.md, Task 3). This builds the line and the
   Telegram body; autopilot.ps1 posts it.

   IT LIVES IN NODE, NOT IN POWERSHELL, FOR ONE REASON: it can then be tested. The allowlist an
   unattended run works under permits `node --test <files>` and does not permit `powershell
   -Command`, so anything written as PowerShell in autopilot.ps1 can be parse-checked
   (tools/psparse.ps1) and never RUN by the session that wrote it. A summary nobody can execute is a
   summary nobody can verify, and this repo's own rule is that unverified work is worse than none.
   harness/test/run-report.test.js exercises every function below, including the CLI end to end.

   AND IT BUILDS THE JSON ITSELF, which is the second reason. Every tgPing in autopilot.ps1 is
   assembled by string concatenation:

       $body = '{"action":"tgPing","password":"...","text":"' + $text + '"}'

   That is fine for the fixed strings it is used with today and breaks the moment the text carries a
   commit subject with a double quote or a backslash in it — which is a thing commit subjects do.
   The failure is silent: thework.pages.dev gets malformed JSON, the ping vanishes, and the run
   still looks green. JSON.stringify is the whole fix, so the text is escaped by something that
   knows the rules. run-report.test.js asserts the two idioms DISAGREE on a subject with a quote in
   it, so the bug this avoids is recorded as a failing case rather than as a claim.

   Nothing here decides whether to send. `shouldReport` says whether there is anything to say — a
   run that correctly found nothing to do must stay quiet or the channel gets muted and takes the
   failure alerts with it. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

/* ── the pure half: no git, no filesystem, no network ─────────────────────────────────────────── */

/* A run with no commits has nothing to report. Deliberately not "no commits AND a red gate": the
   gate is red only on the path that stashes and exits, which never reaches this. */
export function shouldReport(commits){ return (commits || []).length > 0; }

/* Bullets, not prose, and the play URL on the header line — the format AUTOPILOT.md records as the
   one Oliver asked for in 2026-07. Kept to the commit SUBJECTS because they are what a reader wants
   ("what changed") and they are already written in plain English by the run that made them. */
export function reportText({ commits, gate, baseline, url }){
  const subjects = (commits || []).map(c => (typeof c === 'string' ? c : c.subject));
  const head = `🤖 BLADEFALL autopilot — ${subjects.length} commit${subjects.length === 1 ? '' : 's'}`
             + (url ? ` — play: ${url}` : '');
  const bullets = subjects.map(s => '• ' + s).join('\n');
  const foot = [gate ? gate : null,
                Number.isFinite(baseline) ? `${baseline} known failures still tracked` : null]
               .filter(Boolean).join(' · ');
  return [head, '', bullets, '', foot].filter(x => x !== null).join('\n');
}

/* The POST body thework.pages.dev expects. See the header for why this is not built with `+`. */
export function reportBody(opts){
  return JSON.stringify({ action: 'tgPing', password: opts.password || '', text: reportText(opts) });
}

/* Cloudflare Pages serves a branch preview at <branch>.<project>.pages.dev with the branch name
   lowercased and everything outside [a-z0-9-] folded to a dash. Derived rather than hard-coded so
   it cannot name the wrong branch after a rename — the failure mode of the URL in AUTOPILOT.md,
   which still names two branches (`autopilot-a`, `autopilot-b`) that this checkout does not use. */
export function previewUrl(branch){
  const slug = String(branch || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return slug ? `https://${slug}.bladefall.pages.dev/3d/` : 'https://bladefall.pages.dev/3d/';
}

/* run-all.js prints exactly one line starting `GATE:`; that is the sentence worth forwarding. */
export function gateLineOf(gateOutput){
  const line = String(gateOutput || '').split(/\r?\n/).reverse().find(l => l.startsWith('GATE:'));
  return line ? line.trim() : null;
}

/* ── the impure half: reads git and baseline.json ─────────────────────────────────────────────── */

export function commitsSince(sha, cwd){
  if(!sha) return [];
  const out = execFileSync('git', ['log', '--format=%s', `${sha}..HEAD`],
                           { cwd: cwd || ROOT, encoding: 'utf8' });
  return out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

export function currentBranch(cwd){
  try {
    return execFileSync('git', ['branch', '--show-current'], { cwd: cwd || ROOT, encoding: 'utf8' }).trim();
  } catch(e){ return ''; }
}

/* How many known failures the ratchet is still carrying. Missing file is not zero — an absent
   baseline means "not measured", and reporting 0 there would read as "everything passes". */
export function baselineCount(file){
  const f = file || join(ROOT, 'baseline.json');
  if(!existsSync(f)) return null;
  try { return (JSON.parse(readFileSync(f, 'utf8')).known || []).length; } catch(e){ return null; }
}

/* ── CLI ──────────────────────────────────────────────────────────────────────────────────────
   node harness/run-report.js --since <sha> [--gate <line>] [--password <pw>] [--out <file>] [--text]
   Prints the POST body (or, with --text, just the message); with --out, writes it as UTF-8 and
   prints the path instead.
   EXIT 3 means "nothing to report" — a run that committed nothing. autopilot.ps1 treats that as
   the quiet path rather than as an error, so a silent run stays silent.

   **--out EXISTS BECAUSE OF ENCODING, and the failure it avoids is silent and cosmetic — which is
   the kind that survives.** The text carries `•` and an emoji, because that is the digest format
   AUTOPILOT.md records Oliver asking for. PowerShell 5.1 decodes a native command's stdout using
   `[Console]::OutputEncoding` — an OEM codepage on this machine, not UTF-8 — so `$body = & node …`
   mangles both before `Invoke-RestMethod` has even seen them, and no amount of `-ContentType
   charset=utf-8` can put back bytes that were destroyed at capture. Writing the file and reading it
   with `[System.IO.File]::ReadAllBytes` moves the exact bytes Node wrote, with no decode step in
   between. Same reason AUTOPILOT.md's own memo says to write the digest JSON to a file and hand
   `curl` a `--data-binary @file`. */
if(import.meta.filename === process.argv[1]){
  const argv = process.argv.slice(2);
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
  const commits = commitsSince(arg('--since'));
  if(!shouldReport(commits)) process.exit(3);
  const opts = { commits, gate: gateLineOf(arg('--gate')) || arg('--gate') || null,
                 baseline: baselineCount(), url: previewUrl(currentBranch()),
                 password: arg('--password') || '' };
  const payload = argv.includes('--text') ? reportText(opts) : reportBody(opts);
  const out = arg('--out');
  if(out){ writeFileSync(out, payload, 'utf8'); process.stdout.write(out); }
  else process.stdout.write(payload);
  process.exit(0);
}
