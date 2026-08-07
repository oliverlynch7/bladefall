/* ─────────────────────────────────────────────────────────────────────────────
   SYNTAX GATE — the mandatory pre-commit check from AUTOPILOT.md.

   Why this is a FILE and not the `node -e "..."` one-liner the spec used to name:
   an unattended run gets its Bash commands checked against a permission allowlist, and
   allowlisting `node -e` means allowlisting "run any JavaScript I like", which is not a
   permission an autonomous agent should hold. A committed script can be allowlisted by its
   exact path instead — the автopilot gets its gate, and nothing broader.

   It also checks MORE than the one-liner did. The one-liner only parsed the game's classic
   <script> block; the 3D layer is four ES modules that it never looked at, so a syntax error
   in world3d.js passed the gate cleanly.

   Run:  node tools/gate.js        (exit 0 = safe to commit, 1 = do not commit)
   ───────────────────────────────────────────────────────────────────────────── */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
let bad = 0;
const say = (ok, what, extra) => {
  if (!ok) bad++;
  console.log((ok ? 'OK   ' : 'FAIL ') + what + (extra ? '  — ' + extra : ''));
};

/* 1. The game itself. index.html carries the whole classic game in one <script> block; it is
      not a module, so it is parsed with `new Function` exactly as the original gate did. */
const htmlPath = path.join(root, 'public/3d/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
/* Check EVERY classic <script> block, skipping importmap/module/src tags.

   The first version used a greedy match from the first <script> to the LAST </script>, with a
   comment claiming that selected "the largest" block. Greedy does not select the largest, it
   spans ACROSS blocks - so the captured text contained the closing tag of one block and the
   opening tags of the importmap and module that follow, and the gate failed on a perfectly valid
   file with "Unexpected token '<'".

   It was written but never executed (the run that produced it had no permission to invoke node),
   so its first run was its first test, and it failed. Hence: iterate, do not guess. */
const blocks = [...html.matchAll(/<script(?![^>]*src=)(?![^>]*type=["'](?:importmap|module|application\/json)["'])[^>]*>([\s\S]*?)<\/script>/g)];
const m = blocks.length ? [null, blocks.map(b => b[1]).join('\n;\n')] : null;
if (!m) say(false, 'public/3d/index.html', 'no classic <script> block found');
else {
  try { new Function(m[1]); say(true, 'public/3d/index.html <script>'); }
  catch (e) { say(false, 'public/3d/index.html <script>', e.message); }
}

/* 2. The ES modules. `node --check` on a .js file containing `import` can be rejected as
      CommonJS depending on how module detection resolves, so each source is copied to a
      temp .mjs — an unambiguous module — and checked there. Parsing only; nothing runs. */
/* DISCOVERED, never listed. A hand-written list is a gate with a hole in it: add a fifth module
   and the gate keeps printing GATE OK without ever having parsed it, which is precisely the
   "it passed, so it must be fine" failure this file exists to prevent. Everything directly under
   public/3d/ is ours; three.module.js and jsm/ are vendored Three.js and are not. */
const SRC3D = path.join(root, 'public/3d');
const MODULES = fs.readdirSync(SRC3D)
  .filter(f => f.endsWith('.js') && f !== 'three.module.js')
  .sort()
  .map(f => 'public/3d/' + f);
const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'bf-gate-'));
try {
  for (const rel of MODULES) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) { console.log('SKIP ' + rel + '  — not present'); continue; }
    const tmp = path.join(tmpdir, path.basename(rel, '.js') + '.mjs');
    fs.copyFileSync(abs, tmp);
    const r = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
    say(r.status === 0, rel, r.status === 0 ? '' : (r.stderr || '').trim().split('\n').slice(0, 3).join(' / '));
  }
} finally {
  fs.rmSync(tmpdir, { recursive: true, force: true });
}

/* 3. VERSION3D must carry the -autopilot suffix on the work branch, so branch previews
      cache-bust and it is obvious at a glance that a build is autonomous work. Advisory
      only — a wrong version is a labelling mistake, not broken code. */
const ver = html.match(/VERSION3D\s*=\s*['"]([^'"]+)['"]/);
if (ver) console.log('     VERSION3D = ' + ver[1] + (/-autopilot$/.test(ver[1]) ? '' : '   (note: no -autopilot suffix)'));

console.log(bad ? '\nGATE FAILED (' + bad + ') — do not commit' : '\nGATE OK');


/* DUPLICATE-DEFINITION REMINDER. Not a failure - the duplicates are deliberate, four scape tables
   define the same zone names on purpose. But an edit matched by NAME lands on the first one and
   fails SILENTLY: the file parses, this gate passes, the game runs, and the change does nothing.
   That has now cost four sessions, so a prose warning in a doc nobody re-reads is not enough.
   Printed here because this is the thing you run immediately before committing. */
try {
  const _cp = require('child_process'), _pt = require('path');
  const _out = _cp.execFileSync('node', [_pt.join(__dirname, 'dupes.js')], { encoding: 'utf8' });
  const _n = (_out.match(/×[0-9]+/g) || []).length;
  if (_n) console.log('\nnote: ' + _n + ' names are defined more than once.'
    + '\n      Before editing one:  node tools/dupes.js <name>'
    + '\n      After editing one:   __BF3.G._scapeTable   (says which copy actually ran)');
} catch (e) {}

process.exit(bad ? 1 : 0);
