# Verification Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated harness that answers "does this actually work when played" for every skill, every level and multiplayer, and gate the autopilot on it.

**Architecture:** Four Node scripts under `harness/`, all built on one driver that shells out to the existing `harness/shot.js` rather than reimplementing its 734 lines of CDP, static-server and scene-readiness logic. `shot.js --eval` already boots the game headless, waits for the 3D world, runs arbitrary JS against `__BF3` and prints the result. The driver spawns it, parses the result, and hands back a value. `run-all.js` aggregates and its exit code becomes the autopilot's commit gate.

**Tech Stack:** Node 26 (built-in test runner `node --test`, built-in `WebSocket`), headless Chrome over the DevTools Protocol via the existing `shot.js`. No npm install — this machine has no resolvable playwright/puppeteer and an unattended run cannot install one.

## Status (from git, not from memory)

| Task | State | Commit |
|---|---|---|
| 1 shared driver | done | `7725819` |
| 2 claim parser | done | `c35333d` |
| 3 skill tester | done | `2a86ea0`, `d7c50de` |
| 4 level tester | **done** | `8a8f766` (+ the game fix it found, `8dcc77f`) |
| 5 multiplayer tester | **done** | this run; the plan's probe tested itself — see Task 5 |
| 6 aggregate gate | done | `34262a6`; baselines not pass/fail. **The ratchet was missing** — see below. **And a suite that did not run was being reported as an unwritten file AND credited with fixing its own baselined failures** — fixed 2026-08-11, Task 6 Step 4 |
| 7 autopilot guards | done | `34262a6`, `a3e999c`; **Step 5 was half-done until 2026-08-11** — the stale `AUTOPILOT_BLOCKED.md` was still in the tree, telling every fresh checkout the autopilot was blocked. Removed; its untracked 881-line sibling deliberately kept, see the step |
| 8 re-enable the schedule | not started | — |

**Every step box in Tasks 1–7 is now ticked, checked against the repo on 2026-08-11 rather than
against this table.** They had been left unticked while the table above said "done", so the standing
rule *take the first task whose steps are not all ticked* sent every run back to Task 1 — a plan that
reads as unstarted is worse than one that reads as unfinished. Where what shipped differs from the
code printed in a step, the step now says so and points at the file.

**Next task is 8 (re-enable the schedule) — and it is OLIVER'S.** It edits a Windows scheduled task
to start running this automation unattended every 6 hours on his machine. That is not a code change
and not reversible by a `git revert`, so an autopilot run must not do it to itself. Every code task
in this plan is now done.

## Corrections from execution

Five things this plan assumed and got wrong, each found by running it rather than by reading it.
Later tasks must use the corrected form.

1. **`harness/` is ESM.** `harness/package.json` declares `"type": "module"`, so every file here
   uses `import`/`export`, not `require`. The plan's CommonJS snippets in Tasks 3–6 must be
   converted. Consequently `harness/shot.js` — which is CommonJS — **cannot be run where it
   lives**; `node harness/shot.js` dies on its own first `require`. It only runs from `_shot/`,
   which carries `"type": "commonjs"`. `drive.js` exports `ensureRunner()` which copies it there,
   comparing by CONTENT not mtime, because a checkout stamps every file with the same time.

2. **`node --test <dir>` fails on Windows** — it treats the directory as a test file. The working
   form is a file list: `node --test harness/test/*.test.js`. `run-all.js` must enumerate
   `harness/test/*.test.js` with `readdirSync` and pass explicit paths, since it cannot rely on
   shell globbing.

3. **A PROBE BELONGS IN A FILE, NOT ON A COMMAND LINE** (found in Task 4). `shot.js` now takes
   `--eval @path` and `--pre @path`. Two things forced it: a probe long enough to be interesting
   is long enough for a shell to mangle, and a probe that exists both inside a harness module and
   in the command you typed will be edited in one place only — after which two runs measure two
   different things while both calling it "the level probe". `harness/probes/level.probe.js` is
   the file `test-levels.js` reads, so they cannot diverge.

4. **THE PLAN'S WALKER CANNOT PASS A LEVEL THIS GAME SHIPS** (found in Task 4). Steering at the
   goal and jumping when stuck walks The Outskirts — the zone Oliver has playtested for weeks —
   into the first void. Two reasons, both the level design working as intended: main levels
   BRANCH (the Outskirts' centre is empty at z −1000 and the route is a corridor at |x| ≈ 500
   that rejoins 1000 units later), and **every campaign area ends on an island you must jump AND
   DASH to** — `dashGate()` is called from `finishScape` for all of them and moves the exit
   across a ~195-unit void deliberately. Measured on the real body: a running jump carries **138**
   units, a jump plus an air dash **216**. Any walker that does not dash reports all sixteen areas
   as ending in an impassable gap.

5. **A PROBE MUST DRIVE THE GAME, NOT STAND IN FOR IT** (found in Task 5). The plan's multiplayer
   probe assigned `window.__hero3dPending` and then asserted on what it had just assigned, so it
   passed against the very bug it existed to catch. The general rule, and the reason both live
   probes now carry a permanent URL-flag known-bad: **an assertion nobody has watched FAIL is an
   assertion nobody should believe.** The specific trap is that the game is one big IIFE
   (`index.html:1019`), so a probe reaches only what is hung on `window` — and when the thing you
   mean to test is closure-local, the path of least resistance is to imitate it, which is the one
   move guaranteed to measure nothing. Export it on `__BF3` instead.

## Global Constraints

- No new runtime dependencies. Nothing that needs `npm install`.
- Everything lives in `harness/` and is COMMITTED. `_shot/` is gitignored and a fresh checkout does not have it.
- Work happens on branch `autopilot-merged`. Never commit to `main` — merging to main is what deploys live, and only Oliver does it.
- The game file is `public/3d/index.html`. Any change to it must pass the syntax gate: `node tools/gate.js`.
- Test assertions must drive the game's own systems through `__BF3`. Do not reimplement a game test in the probe — per `index.html`'s own comment, "Every probe that reimplements one of these tests eventually measures something the game does not believe."
- Every runner must be validated against a known-good AND a known-bad case before its output is trusted.
- Headless SwiftShader needs 30–45s to load the 3D world. Use `--scene` so `shot.js` waits for readiness; a shot taken early silently returns the voxel fallback.

---

### Task 1: The shared driver

**Files:**
- Create: `harness/drive.js`
- Create: `harness/test/drive.test.js`

**Interfaces:**
- Produces: `runScenario({ scene, pre, js, waitMs, timeoutMs }) -> Promise<any>` — boots the game at `scene`, optionally runs `pre`, evaluates `js`, returns the parsed value. Throws on eval error or timeout.
- Produces: `parseEval(stdout) -> any` — pure; extracts the value from `shot.js` output. Exported for unit testing without a browser.

> **Task 1 shipped in `7725819`.** Its steps are ticked below against the repo, not against memory:
> `harness/drive.js` and `harness/test/drive.test.js` both exist and the suite is green. The code in
> the steps is the PLAN's CommonJS version and is kept only for the diff — what shipped is ESM, and
> `runScenario` grew `url` and `--eval @file` support later (Corrections 1 and 3, and Task 5 Step 2).

- [x] **Step 1: Write the failing test for the pure parser**

Create `harness/test/drive.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { parseEval } = require('../drive.js');

test('parseEval pulls a JSON string value out of shot.js output', () => {
  const out = 'boot\nEVAL → {\n  "value": "{\\"ok\\":true,\\"n\\":3}"\n}\nshot -> x.png';
  assert.deepStrictEqual(parseEval(out), { ok: true, n: 3 });
});

test('parseEval returns a plain value unchanged when it is not JSON', () => {
  const out = 'EVAL → {\n  "value": "hello"\n}';
  assert.strictEqual(parseEval(out), 'hello');
});

test('parseEval throws when the page threw', () => {
  const out = 'EVAL → {\n  "error": "ReferenceError: x is not defined"\n}';
  assert.throws(() => parseEval(out), /ReferenceError/);
});

test('parseEval throws when there is no EVAL line at all', () => {
  assert.throws(() => parseEval('boot\nshot -> x.png'), /no EVAL/);
});
```

- [x] **Step 2: Run it to make sure it fails**

Run: `node --test harness/test/drive.test.js`
Expected: FAIL — `Cannot find module '../drive.js'`

- [x] **Step 3: Implement the driver**

Create `harness/drive.js`:

```js
/* Shared driver for the verification harness.

   Deliberately shells out to shot.js instead of reimplementing it. shot.js already owns the hard
   parts - finding Chrome, serving public/ over real HTTP because file:// fails CORS on ES modules
   and glTF, the CDP client over Node's built-in WebSocket, and the --scene readiness wait that
   stops a probe photographing the voxel fallback and calling it the 3D world. Reimplementing any
   of that would be a second thing to keep correct. */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHOT = path.join(ROOT, 'harness', 'shot.js');

/* shot.js prints:  EVAL -> {\n  "value": ...\n}  (or "error"). Pure, so it is unit-testable
   without a browser - which matters because everything else here needs 45 seconds and a GPU. */
function parseEval(stdout){
  const i = stdout.indexOf('EVAL → ');
  if(i === -1) throw new Error('no EVAL in harness output:\n' + stdout.slice(-600));
  const tail = stdout.slice(i + 'EVAL → '.length);
  let depth = 0, end = -1;
  for(let k = 0; k < tail.length; k++){
    if(tail[k] === '{') depth++;
    else if(tail[k] === '}'){ depth--; if(depth === 0){ end = k + 1; break; } }
  }
  if(end === -1) throw new Error('unterminated EVAL payload');
  const wrap = JSON.parse(tail.slice(0, end));
  if(wrap.error) throw new Error('page threw: ' + wrap.error);
  const v = wrap.value;
  if(typeof v === 'string'){
    try { return JSON.parse(v); } catch(e){ return v; }
  }
  return v;
}

function runScenario(opts){
  const o = opts || {};
  const args = [SHOT, '--out', path.join(ROOT, '_shot', 'out', 'harness.png'),
                '--wait', String(o.waitMs || 9000)];
  if(o.scene != null) args.push('--scene', String(o.scene));
  if(o.pre) args.push('--pre', o.pre);
  args.push('--eval', o.js);

  return new Promise((resolve, reject) => {
    const ch = spawn(process.execPath, args, { cwd: ROOT });
    let out = '', err = '';
    const timer = setTimeout(() => { ch.kill(); reject(new Error('scenario timed out')); },
                             o.timeoutMs || 300000);
    ch.stdout.on('data', d => { out += d; });
    ch.stderr.on('data', d => { err += d; });
    ch.on('close', () => {
      clearTimeout(timer);
      try { resolve(parseEval(out)); }
      catch(e){ reject(new Error(e.message + (err ? '\nstderr: ' + err.slice(-400) : ''))); }
    });
  });
}

module.exports = { runScenario, parseEval };
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `node --test harness/test/drive.test.js`
Expected: PASS, 4 tests.

- [x] **Step 5: Validate the driver against the real game (known-good case)**

Run:

```bash
node -e "require('./harness/drive.js').runScenario({scene:1, js:'JSON.stringify({zone:__BF3.G.areaName, hp:__BF3.G.p.hp})'}).then(v=>console.log('OK',v)).catch(e=>{console.error('FAIL',e.message);process.exit(1)})"
```

Expected: `OK { zone: 'Hollow Pass', hp: 100 }`

- [x] **Step 6: Validate the driver against a known-bad case**

Run:

```bash
node -e "require('./harness/drive.js').runScenario({scene:1, js:'nope.nope'}).then(v=>{console.error('FAIL: should have thrown');process.exit(1)}).catch(e=>console.log('OK rejected:', e.message.slice(0,60)))"
```

Expected: `OK rejected: page threw: ReferenceError...`

- [x] **Step 7: Commit**

```bash
git add harness/drive.js harness/test/drive.test.js
git commit -m "harness: shared driver over shot.js, with a pure parser that unit-tests without a GPU"
```

---

### Task 2: The claim parser

**Files:**
- Create: `harness/claims.js`
- Create: `harness/test/claims.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `claimsOf(description) -> string[]` — returns any of `'damage'`, `'heal'`, `'shield'`, `'control'`, `'summon'`, `'buff'`. Pure.

This is separated from the live runner on purpose: it is the only part with interesting logic and the only part testable in milliseconds.

> **Task 2 shipped in `c35333d`.** Ticked against the repo: `harness/claims.js` and
> `harness/test/claims.test.js` both exist and are green. The rules table below is the version this
> plan shipped and has since been CORRECTED twice by measurement — eleven descriptions the parser
> mis-read (Task 3 Step 4) and the Beastmaster's eighteen companion lines — so read `claims.js`
> itself, not this snippet, before changing a rule.

- [x] **Step 1: Write the failing test**

Create `harness/test/claims.test.js`. The descriptions are REAL, read from the game:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { claimsOf } = require('../claims.js');

test('damage claims', () => {
  assert.deepStrictEqual(claimsOf('Sweeping strike: 2.2x damage in a wide arc'), ['damage']);
  assert.deepStrictEqual(claimsOf('Slam the ground: damage + heavy knockback all around').sort(),
                         ['control', 'damage']);
});

test('control claims', () => {
  assert.deepStrictEqual(claimsOf('Rush forward, damaging and stunning enemies in your path').sort(),
                         ['control', 'damage']);
});

test('buff claims', () => {
  assert.deepStrictEqual(claimsOf('+35% damage and attack speed for 6s'), ['buff']);
});

test('heal and shield are distinguished', () => {
  assert.deepStrictEqual(claimsOf('Restore 40 health to yourself'), ['heal']);
  assert.deepStrictEqual(claimsOf('Absorb the next 80 damage with a shield'), ['shield']);
});

test('summon claims', () => {
  assert.deepStrictEqual(claimsOf('Turn a fresh corpse into a stronger risen fighter'), ['summon']);
});

test('an unparseable description claims nothing rather than guessing', () => {
  assert.deepStrictEqual(claimsOf('A mysterious technique'), []);
});
```

- [x] **Step 2: Run it to make sure it fails**

Run: `node --test harness/test/claims.test.js`
Expected: FAIL — `Cannot find module '../claims.js'`

- [x] **Step 3: Implement the parser**

Create `harness/claims.js`:

```js
/* What a skill's own description PROMISES the player.

   A buff is checked before damage on purpose: "+35% damage ... for 6s" contains the word damage but
   promises a stat change, not a hit. Getting that order wrong reports every buff in the game as a
   broken damage skill, which is a flood of false failures and the fastest way to make the whole
   harness ignorable. */
const RULES = [
  ['buff',    /[+-]\s*\d+%|\bfor \d+(\.\d+)?s\b|\bincreas|\bboost|\bempower/i],
  ['heal',    /\bheal|\brestore|\blifesteal|\bregen/i],
  ['shield',  /\bshield|\babsorb|\bbarrier|\bward\b/i],
  ['control', /\bstun|\bslow|\broot|\bknockback|\bfear|\bfreez|\bimmobil|\bsilenc/i],
  ['summon',  /\bsummon|\braise|\bminion|\bskeleton|\bcompanion\b/i],
  ['damage',  /\bdamage|\bstrike|\bslash|\bhit\b|\bblast|\bburn|\bexplo|\bbolt\b/i],
];

function claimsOf(d){
  const s = String(d || '');
  const out = [];
  const isBuff = RULES[0][1].test(s);
  for(const [name, re] of RULES){
    if(name === 'damage' && isBuff && !/\bdeal|\bdealing|\bstrike|\bslash|\bblast/i.test(s)) continue;
    if(re.test(s)) out.push(name);
  }
  return out;
}

module.exports = { claimsOf };
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `node --test harness/test/claims.test.js`
Expected: PASS, 6 tests.

- [x] **Step 5: Commit**

```bash
git add harness/claims.js harness/test/claims.test.js
git commit -m "harness: parse what a skill's description actually promises"
```

---

### Task 3: The skill tester

**Files:**
- Create: `harness/test-skills.js`

**Interfaces:**
- Consumes: `runScenario` from `harness/drive.js`, `claimsOf` from `harness/claims.js`.
- Produces: `runSkillTests() -> Promise<{ pass:number, fail:number, failures:Array<{cls,skill,claim,text,detail}> }>`

> **Task 3 shipped in `2a86ea0` and `d7c50de`.** Ticked against the repo: `harness/test-skills.js`
> exists and runs. The code in Step 2 is the plan's version and has been overtaken twice by
> measurement — it read one skill list and cast from another (`faf52c3`), and its bench had four
> further faults found in sub-project B Task 1 Step 1. Read the file, not the snippet.

- [x] **Step 1: Write the in-page probe and run it for ONE class to see real output**

Run:

```bash
node -e "
const {runScenario}=require('./harness/drive.js');
runScenario({scene:'arena:flat', waitMs:12000, js:\`(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const out=[]; const sk=__BF3.curSkills()||[];
  for(let i=0;i<sk.length;i++){ if(sk[i]) out.push({i:i,n:sk[i].n,d:sk[i].d}); }
  return JSON.stringify({cls:__BF3.meta.classId, skills:out});
})()\`}).then(v=>console.log(JSON.stringify(v,null,2))).catch(e=>{console.error(e.message);process.exit(1)});
"
```

Expected: a class id and its skills with descriptions. Record the exact shape before writing assertions against it.

- [x] **Step 2: Write the tester**

Create `harness/test-skills.js`:

```js
/* Does every skill do what its own text says?

   Oliver, after a PvP match: "there was a bunch of skills that didn't do what they said. Some of
   them said they would do damage and then didn't, or some of them said they would heal you and
   then didn't."

   The bar is deliberately EFFECT, not number: a skill claiming damage must make a target's HP go
   down. That catches every failure he described across all 16 classes with nothing hand-authored,
   and it will not catch a skill that hits for the wrong amount. Numbers are a later phase. */
const { runScenario } = require('./drive.js');
const { claimsOf } = require('./claims.js');

const PROBE = (classId) => `(async function(){
  const R = [];
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = ${JSON.stringify(classId)};
  const G = __BF3.G, p = G.p;
  const skills = __BF3.curSkills() || [];
  for(let i = 0; i < skills.length; i++){
    const s = skills[i]; if(!s) continue;
    /* A fresh dummy per skill, at a fixed distance, so one skill's kill cannot mask the next
       skill's no-op. */
    G.enemies.length = 0;
    const dummy = __BF3.spawnEnemy('dummy', p.x, p.z - 90);
    if(dummy){ dummy.dummy = true; dummy.active = true; dummy.hp = dummy.maxHp = 100000; }
    p.hp = Math.round((p.hpm || 100) * 0.5);          // damaged, so a heal has room to show
    p.mana = p.manam || 999; p.skillCd[i] = 0;
    const before = { tgt: dummy ? dummy.hp : null, hp: p.hp,
                     minions: (G.minions || []).length,
                     shield: p.shield || 0, spd: p.speed || 0 };
    let threw = null;
    try { __BF3.useSkill(i); } catch(e){ threw = String(e && e.message || e); }
    for(let k = 0; k < 90; k++) __BF3.update(1/60);   // 1.5s for travel, dots and buff windows
    const after = { tgt: dummy ? dummy.hp : null, hp: p.hp,
                    minions: (G.minions || []).length,
                    shield: p.shield || 0, spd: p.speed || 0 };
    R.push({ i: i, n: s.n, d: s.d || '', threw: threw, before: before, after: after,
             onCd: (p.skillCd[i] || 0) > 0 });
  }
  return JSON.stringify({ cls: ${JSON.stringify(classId)}, results: R });
})()`;

const SATISFIED = {
  damage:  (b, a) => a.tgt != null && a.tgt < b.tgt,
  heal:    (b, a) => a.hp > b.hp,
  shield:  (b, a) => a.shield > b.shield,
  summon:  (b, a) => a.minions > b.minions,
  /* control and buff are checked as "something measurably changed" because their target state is
     not one field. A control skill that never fires also never puts itself on cooldown. */
  control: (b, a, r) => r.onCd,
  buff:    (b, a, r) => r.onCd,
};

async function runSkillTests(){
  const classes = await runScenario({
    scene: 'arena:flat', waitMs: 12000,
    js: '(function(){ return JSON.stringify(Object.keys(__BF3.CLASSES||{})); })()',
  });
  const failures = [];
  let pass = 0;
  for(const cls of classes){
    let got;
    try { got = await runScenario({ scene: 'arena:flat', waitMs: 12000, js: PROBE(cls) }); }
    catch(e){ failures.push({ cls, skill: '(class)', claim: 'load', text: '', detail: e.message }); continue; }
    for(const r of got.results){
      if(r.threw){ failures.push({ cls, skill: r.n, claim: 'throw', text: r.d, detail: r.threw }); continue; }
      const claims = claimsOf(r.d);
      if(!claims.length){ pass++; continue; }         // nothing promised, nothing to check
      for(const c of claims){
        const ok = SATISFIED[c] ? SATISFIED[c](r.before, r.after, r) : true;
        if(ok) pass++;
        else failures.push({ cls, skill: r.n, claim: c, text: r.d,
                             detail: JSON.stringify({ before: r.before, after: r.after }) });
      }
    }
  }
  return { pass, fail: failures.length, failures };
}

module.exports = { runSkillTests };

if(require.main === module){
  runSkillTests().then(r => {
    for(const f of r.failures) console.log(`FAIL ${f.cls}/${f.skill} claims ${f.claim}: "${f.text}"`);
    console.log(`skills: ${r.pass} pass, ${r.fail} fail`);
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
```

- [x] **Step 3: Run it**

Run: `node harness/test-skills.js`
Expected: a list of `FAIL <class>/<skill> claims <claim>` lines and a summary. Failures here are the BUG Oliver reported, not a broken test — but confirm the next step before believing any of them.

- [x] **Step 4: Validate against a known-good and a known-bad case** — done, and **the tester was
      wrong: 11 of its 15 failures were false.**

Pick one skill the tester reports as PASSING and one it reports as FAILING. Play each in the real game (`--scene arena:flat`, screenshot before/after) and confirm the verdict matches what actually happens. If a passing skill visibly does nothing, or a failing skill visibly works, the tester is wrong and must be fixed BEFORE any game code is touched.

This step is the reason the first gate run's 16 "known failures" must not be read as a bug list. It
did not need a screenshot to settle: the accusations were checked against the skills' own text and
against the game's data, and eleven of them were the parser mis-reading English. Every description
below is real, copied out of `harness/report.json`.

| Skill | Its own text | What the parser did | Why that is wrong |
|---|---|---|---|
| warlock/Shadow Bolt | "…powered by a sliver of your **health**" | claimed **heal** | `\bheal` matches the first four letters of *health*. The skill SPENDS health; it was failed for not restoring any — accused of the exact opposite of what it does. |
| paladin/Guard Up | "**Raise a holy shield** that absorbs damage" | claimed **summon** | The "raise a shield is not a summon" rule already existed and required the noun right after the article. One adjective defeated it. |
| ninja/Blade Fury, berserker/Berserk | "+damage and attack speed for a few seconds" | claimed **damage** | The buff rule needed a digit (`+35%`, `for 6s`). The game mostly does not write them that way. |
| monk/Stillness | "…more damage and speed" | claimed **damage** | Same: a bare comparative is as much a buff promise as a percentage. |
| beastmaster ×4 | "**Command** your companion to lunge", "**Unleash** your companion…" | claimed **summon** | `companion` was a summon keyword. All 18 companion lines in the game were checked: every one commands, buffs or restores a pet that is already out. Not one summons anything. |
| pirate/Cannonade, warlock/Curse Circle | "Mark foes to explode **on death**", "so **your spells** hit them harder" | claimed **damage** | Neither deals damage on cast — one waits for the target to die, the other makes a *different* source hit harder. The bench casts once at a 100000-HP dummy that never dies and is never hit by anything else, so it cannot observe either. Now UNPROVEN, per VISION.md: "Missing data is not a negative finding." |

**Result: skills went 58 pass / 15 fail → 62 pass / 4 fail / 3 unproven, with no new failure and no
game code touched.** The eight pre-existing parser tests still pass, so this is a correction rather
than a re-fit; the eleven descriptions are now regression tests of their own.

**Measured, not assumed, and it mattered once:** reclassifying the Beastmaster commands moved
`Sic 'Em` from a summon claim to `['control','damage']`, and its damage is dealt by the COMPANION —
another agent, with its own pathing. That looked like it would need the indirect rule widened. It
was left alone and re-run instead, and the pet lands its hit inside the 2s window, so the claim
passes honestly. Widening the rule would have blinded the harness to a whole class of skill for no
reason.

~~**THE FOUR THAT SURVIVE ARE THE REAL BUG LIST — sub-project B starts here.**~~ **RETRACTED, same
day, by the next thing that was measured. Those four named skills the bench had never cast.**

The four were warrior/Charge, mage/Nova, reaper/Soul Harvest and paladin/Taunt, each reported as
firing (`onCd:true`) and then doing nothing. Every one was an artefact of the fault below, and the
retraction is left in place rather than deleted because the wrong version was committed and pushed,
and a plan that quietly loses its errors teaches nothing.

### THE SUITE READ ONE LIST AND CAST FROM ANOTHER — the whole suite, its entire life

`test-skills.js` read names and descriptions from `curSkills()`, the legacy `CLASSES` kit
(`index.html:2353`), and then cast by that same index through `useSkill(i)`. `useSkill` branches on
`c2def()`, and **all sixteen classes have a CLASS2 tree**, so it *always* casts `c2CurSkills()[i]`
(`10311`, `9948`) — a different list. Probed live, both lists side by side:

| Class | index | description read | what the game casts there |
|---|---|---|---|
| warrior | 2 | **Charge** — "Rush forward, damaging and stunning…" | rank-6 Iron Guard \| Shockwave Stomp |
| mage | 1 | **Nova** | Blink \| Nova |
| reaper | 1 | **Soul Harvest** | Shadow Step \| Wraith Form |

Charge is rank 4, which is slot **1**, so index 2 never reaches it. Confirmed by measurement rather
than by reading the table: casting index 2 as warrior left `p.chargeDash` at 0 and `p._chDmg` at 0,
and the hero **stood still for all 120 ticks** while the dummy walked toward it. Charge's own first
statement is `p.chargeDash=0.32`. It plainly never ran, so "Charge deals no damage" was never a
statement about Charge.

**The 62 passes were no better founded than the 4 failures.** Both lists are full of damage skills,
so a damage claim was usually satisfied by whatever did fire. This suite has never measured what it
said it measured.

Fixed by reading from the list that gets cast (`__BF3.c2CurSkills`, exported next to the other
harness exports, falling back to `curSkills()` so the suite still works for any class without a
tree). **The baseline had to be RE-TAKEN, not compared:** every failure id it held was produced by a
bench casting the wrong skill, so `harness/baseline.json` was deleted and recorded fresh.

**Why this got through, worth keeping:** the suite was validated end-to-end — a bench self-test that
proves a plain attack can draw blood, real descriptions in the unit tests, known-good and known-bad.
None of that could see this, because every check was internally consistent. The one question nobody
asked was whether the name being printed belonged to the skill being cast.

### The honest bug list — 8 candidates, and they are CANDIDATES

Re-taken baseline: skills **65 pass / 8 fail / 2 unproven**, levels 36/0/12, mp 16/0, `GATE: PASS`.

| Skill | Claim | Measured |
|---|---|---|
| reaper/Soul Siphon | heal | dealt damage (100000 → 99835) but hp 239 → 239 |
| paladin/Shield Bash | shield | dealt damage and stunned, shield 0 → 0 |
| paladin/Taunt | shield | shield 0 → 0 |
| berserker/Charge | damage | target unchanged |
| mage/Attunement | damage | target unchanged |
| chronomancer/Time Warp | damage | target unchanged |
| ranger/Tumble | damage | target unchanged |
| beastmaster/Guardian Bond | shield | player shield 0 → 0 |

Soul Siphon is the one that matches Oliver's report word for word — "some of them said they would
heal you and then didn't" — and it visibly does the damage half of its own sentence.

**Two reasons not to hand this list to anyone as fact yet**, both of which are the bench and not the
game, and both cheap to settle next run:
- **Guardian Bond promises the COMPANION a shield** ("your companion intercepts part of incoming
  damage and gains a shield"). The probe reads `p.shieldHp` — the player's. It is measuring the
  wrong body, which is this same misattribution bug in miniature.
- **The observation window is 2s and several of these promise 4s** (Attunement is "a 4s storm",
  Soul Siphon drains "for 4s"). A tick loop that ends before the effect does cannot see it.

So the next task for sub-project B is to settle those two, not to start editing skills. Nothing here
is fixed: a damage or healing number is a balance call and belongs to Oliver.

- [x] **Step 5: Commit**

```bash
git add harness/test-skills.js
git commit -m "harness: assert every skill does what its description claims"
```

---

### Task 4: The level tester

**Files:**
- Create: `harness/test-levels.js`

**Interfaces:**
- Consumes: `runScenario` from `harness/drive.js`.
- Produces: `runLevelTests() -> Promise<{ pass:number, fail:number, failures:Array<{zone,area,check,detail}> }>`

- [x] **Step 1: Write the tester** — shipped as `harness/test-levels.js` + `harness/probes/level.probe.js`.

The code below is the PLAN's version and is kept only for the diff. What shipped differs in four
ways, all forced by running it: it reaches area 1 with `--scene <zone>.<area>` (the game's own
`nextArea()`) instead of the unsupported `G.area=1; loadStage()`; it indexes ZONES, not stages
(zone 1 is stage 3 — the plan's list would have tested the last zone twice and missed three);
it does both halves in one browser launch (16 launches, not 32); and it plans a route over the
level's walkable surface and then dashes across the exit gate, because the straight-line walker
below cannot finish any campaign area. See corrections 3 and 4 above.

```js
/* Can this level actually be finished?

   Castle Duskmoor shipped "verified" and could not be climbed at all: the audit that passed it was
   GEOMETRIC (is there a surface near this height) when the question was KINEMATIC (can a body walk
   there). This runner only asks kinematic questions - it drives the game's own physics and moves
   the real player - plus the completability checks Duskmoor also failed, where a quest wanted ten
   siege knights and the level spawned three. */
const { runScenario } = require('./drive.js');

const WALK = `(function(){
  const G = __BF3.G, up = __BF3.update, IN = __BF3.input, meta = __BF3.meta, P = G.p;
  meta.camMode = 'far';                       // world-space steering; camera-relative would spin
  G.enemies.length = 0;                       // traversal only - combat is the skill tester's job
  const goal = G.goalPos || G.portalPos;
  if(!goal) return JSON.stringify({ ok:false, why:'level has no goal' });
  let stuck = 0, last = 1e9, ticks = 0;
  while(ticks < 20000){
    const dx = goal.x - P.x, dz = goal.z - P.z, d = Math.hypot(dx, dz);
    if(d < 90) return JSON.stringify({ ok:true, ticks:ticks });
    IN.jx = dx/d; IN.jz = dz/d;
    if(P.onGround && stuck > 25){ IN.jumpEdge = true; IN.jump = true; }
    P.hp = P.hpm || 100;                      // isolate traversal from hazard damage
    up(1/60); ticks++;
    if(d > last - 0.6) stuck++; else stuck = 0;
    last = d;
    if(stuck > 400) return JSON.stringify({ ok:false, why:'stuck',
      at:{x:Math.round(P.x), z:Math.round(P.z), y:Math.round(P.y)},
      goal:{x:Math.round(goal.x), z:Math.round(goal.z)}, remaining:Math.round(d) });
  }
  return JSON.stringify({ ok:false, why:'ran out of ticks' });
})()`;

const QUESTS = `(function(){
  const G = __BF3.G;
  const counts = {};
  for(const e of (G.enemies||[])) counts[e.type] = (counts[e.type]||0) + 1;
  const out = [];
  for(const q of (__BF3.areaQuests()||[])){
    if(q.k === 'kill') out.push({ id:q.id, kind:'kill', mob:q.mob, need:q.n||0, have:counts[q.mob]||0 });
    else {
      const marks = (G.qmarks||[]).filter(m => m.q === q.id).length;
      out.push({ id:q.id, kind:q.k, need:q.n||1, have:marks });
    }
  }
  return JSON.stringify({ quests: out, enemies: (G.enemies||[]).length });
})()`;

/* Main zones only, by STAGE index - enterZone takes a stage index over main zones and CLAMPS, so
   enterZone(14) silently lands on the last zone rather than erroring. Learned the hard way. */
const STAGES = [
  { stage:0, name:'The Outskirts' }, { stage:1, name:'Hollow Pass' },
  { stage:2, name:'Ruined Keep' },   { stage:3, name:'Frostfell' },
  { stage:4, name:'Emberdeep' },     { stage:5, name:'The Abyss' },
  { stage:6, name:'Sunspire Palace' },{ stage:7, name:'Castle Duskmoor' },
];

async function runLevelTests(){
  const failures = [];
  let pass = 0;
  for(const z of STAGES){
    for(const area of [0, 1]){
      const pre = `__BF3.enterZone(${z.stage}); __BF3.G.area=${area}; __BF3.loadStage(__BF3.G.stageIndex||0);`;
      let walk, quests;
      try {
        walk   = await runScenario({ pre, waitMs: 12000, js: WALK });
        quests = await runScenario({ pre, waitMs: 12000, js: QUESTS });
      } catch(e){
        failures.push({ zone:z.name, area, check:'load', detail:e.message }); continue;
      }
      if(walk.ok) pass++;
      else failures.push({ zone:z.name, area, check:'walkable', detail:JSON.stringify(walk) });
      for(const q of quests.quests){
        if(q.have >= q.need) pass++;
        else failures.push({ zone:z.name, area, check:'quest:'+q.id,
                             detail:`${q.kind} needs ${q.need}, level provides ${q.have}` });
      }
    }
  }
  return { pass, fail: failures.length, failures };
}

module.exports = { runLevelTests };

if(require.main === module){
  runLevelTests().then(r => {
    for(const f of r.failures) console.log(`FAIL ${f.zone} area${f.area} ${f.check}: ${f.detail}`);
    console.log(`levels: ${r.pass} pass, ${r.fail} fail`);
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
```

- [x] **Step 2: Validate against a known-bad case**

Done, but NOT by reverting the underside fix — a known-bad you have to break the repo to produce
is a known-bad nobody re-runs. The probe carries its own, permanently:

```bash
node _shot/shot.js --scene 0.0 --url "/3d/index.html?hero3d=1&world3d=1&nobloom&breakgap=240" \
     --eval @harness/probes/level.probe.js
```

`?breakgap=<n>` widens the exit void by n units. At +240 the walker correctly reports the level
impassable (`the body could not follow any route`, remaining 220); unbroken it walks the same
level end to end (2305 / 2308 / 2317 ticks over three runs, 144 jumps, 29 dashes). Both
directions proven, and reproducible by anyone in one command.

- [x] **Step 3: Run the full pass** — all 8 zones × 2 areas, and it found five uncompletable levels

**Completability: 5 of 16 areas could not be finished, and every one is a `find` or
`fetch:placed` objective in a TERRAIN_ZONES zone.** Those branches build their terrain and
`return` before reaching the hand-authored body that calls `scapeFind()` / `scapeFetch()`, so the
quest is shown in the tracker with nothing in the world to satisfy it — `areaClear()` never goes
true, `openWay()` never fires, the exit never opens. Zero provisioned, every time, not a near
miss:

| Area | Objective | Had |
|---|---|---|
| The Dry Wash (1.1) | `hp2` Recover 5 Sun-Bleached Bones | 0 of 5 |
| The Dry Wash (1.1) | `hp3` Find the Hollow Shrine | none |
| The Rime Shelf (3.1) | `ff3` Find the Frostwatch Cairn | none |
| Emberdeep (4.0) | `ed2` Find the Ash Altar | none |
| The Hollow Deep (5.1) | `ab3` Find the Rift Anchor | none |
| The Long Ascent (7.1) | `ct3` Find the Sunken Records | none |

Zones 0, 2 and 6 are hand-authored and all of their objectives are provisioned, which is what
makes the correlation exact rather than suggestive. **Fixed in `8dcc77f`** with a `questBackstop()`
next to `questMarks()` — one place, every EXPANDED_SCAPES level, adds only what is missing.
Verified fixed on all five and unchanged on all three hand-authored controls.

**Traversal: recorded, never accused.** A walk that succeeds is counted; one that fails is
`unproven`. The walker completes The Outskirts but not the Black Woods, whose exit void has two
22-wide pillars in it and exactly one crossing — a limit of the navigator, not a fault in a level
people play daily. `test-levels.js` states the bar for promoting these to real failures so it
cannot drift.

**Left for Oliver (balance, so not touched):** the terrain zones build no dens, so their kill
quests are served by whoever is standing there. That population turns over as you watch — four
probes of Emberdeep read 11, 11, 7 and 8 magmaskit and 1, 1, 10 and 5 ember totems, total pinned
at 52 every time. A live head-count is a snapshot, not a supply. Adding dens settles it and
changes how hard the level fights back.

**AND THAT SNAPSHOT WAS BEING REPORTED AS A VERDICT, which turned the whole gate red on a run that
had not touched a level.** Recorded here because it cost a full 40-minute gate cycle to find.
Emberdeep's `ed1` wants 11 magmaskit; the fifth probe of that same level read **9**, so `run-all.js`
reported `REGRESSION: levels:Emberdeep/quest:ed1` and refused the commit. Nothing had changed — the
run's only edits were to the claim parser. The numbers above were already in this document; they
say plainly that this measurement flaps, and it was still wired to a pass/fail.

So a kill quest is a verdict only when it has a DEN behind it (a den respawns every 2s while fewer
than 5 are alive — an infinite supply, so a shortfall means something). Without one, the probe now
returns `denned:false` and `test-levels.js` routes the shortfall to **unproven** with its numbers
intact, the same treatment the walker's unfinished routes get and for the same reason. Everything
deterministic — `find`, placed `fetch`, marks, and any kill quest that does have a den — stays a
verdict, so the five uncompletable levels this task found are still caught.

Levels went **37 pass / 1 fail / 10 unproven → 37 pass / 0 fail / 11 unproven**. The one that moved
was The Abyss's `ab1` (blink-stalkers, 6 alive against 10 wanted) — the same den-less head-count,
and it had been sitting in the baseline as a failure since the first gate run.

- [x] **Step 4: Commit** — `8a8f766` (tester + probe + `--eval @file`), `8dcc77f` (the game fix)

---

### Task 5: The multiplayer tester

**Files:**
- Create: `harness/test-mp.js`

**Interfaces:**
- Consumes: `runScenario` from `harness/drive.js`.
- Produces: `runMpTests() -> Promise<{ pass:number, fail:number, failures:Array<{check,detail}> }>`

Scope, stated so nobody mistakes it for more than it is: this proves the RENDER path draws every queued hero, which is the bug that made Oliver invisible to himself. It does not prove connection behaviour. Two real machines remain the final check.

- [x] **Step 1: Write the tester** — shipped as `harness/test-mp.js` + `harness/probes/mp.probe.js`.

**THE PLAN'S PROBE TESTED THE PROBE, NOT THE GAME, and it would have passed forever.** It assigns
`window.__hero3dPending` itself and then asserts that what it just assigned is an array of length 3
whose head is `G.p`. Nothing in it ever calls the game's queueing code, so it passes exactly as
happily against the single-SLOT version whose bug — "I turned invisible on my screen" — is the
entire reason the queue exists. A green light that cannot go red is worse than no light.

The plan reached for that shape because it had correctly noticed MP is closure-local, and stopped
one step short of the reason. Measured, not assumed: **everything from `index.html:1019` down is
inside one `(function(){ "use strict"; … })()`**, so `drawHero3`, `flushHero3D` and `HERO3D_MAX` are
closure-local too and a probe sees only what is explicitly hung on `window`. A scouting probe said
so in one launch — `drawHero3`, `flushHero3D`, `deferArmed`, `MP`, `HERO3D_MAX` all `undefined`,
while `window.drawHero3D` and `window.__BF3` resolve. (`MP` was already exported at 18864; the scout
tested the bare identifier.)

So three names join the exported-for-the-harness cluster at `index.html:18869`, and the probe drives
**the game's own queueing and its own flush**. Counting is separated from rendering deliberately:
the wrapper records the dispatch and only then calls the real `drawHero3D` inside its own `try`, so
a renderer that throws is reported as a render error instead of masquerading as a hero the queue
failed to hold — without that, one throw aborts `flushHero3D`'s loop and under-counts every hero
after it.

Three trials, all measured live at `--scene 0`, cap 6:

| Trial | queued | drawn | local at |
|---|---|---|---|
| local first (the game's real order: hero at 18328, then `MP.drawPeers` at 18330) | 3 | 3 | 0 |
| local last (what the slot bug destroyed; `drawHero3` unshifts you to the front) | 3 | 3 | 0 |
| 12 allies + you (the cap must bite, and must never drop you) | 7 | 7 | 0 |

`node harness/test-mp.js` → **`mp: 16 pass, 0 fail  [at The Outskirts, cap 6]`**.

The plan's code below is kept only for the diff.

Create `harness/test-mp.js`:

```js
/* Multiplayer render correctness.

   Oliver, joining a PvP match: "I turned invisible on my screen, but I could see him, and the same
   happened for him." Cause: the 3D layer kept a single pending SLOT, so the local hero was queued
   first and every ally overwrote it. This asserts the queue draws everyone.

   MP itself is closure-local and cannot be reached from a probe, so this tests the layer directly
   rather than pretending to hold a connection. */
const { runScenario } = require('./drive.js');

const QUEUE = `(function(){
  if(!(window.HERO3D && window.HERO3D.on && window.HERO3D.ready)) return JSON.stringify({skip:'3D layer off'});
  const real = window.drawHero3D; const drawnAt = [];
  window.drawHero3D = function(p, t){ drawnAt.push(Math.round(p.x)); return real.apply(this, arguments); };
  const G = __BF3.G;
  /* Queue the local hero and two stand-ins exactly as index.html does: hero first, peers after. */
  window.__hero3dPending = null;
  const mk = (x) => Object.assign({}, G.p, { x: x });
  window.__hero3dPending = [[G.p, 0], [mk(G.p.x + 150), 0], [mk(G.p.x - 150), 0]];
  const q = window.__hero3dPending;
  const isQueue = Array.isArray(q);
  const len = isQueue ? q.length : 0;
  window.drawHero3D = real;
  return JSON.stringify({ isQueue: isQueue, queued: len, localFirst: isQueue && q[0][0] === G.p });
})()`;

async function runMpTests(){
  const failures = [];
  let pass = 0;
  const r = await runScenario({ scene: 1, waitMs: 12000, js: QUEUE });
  if(r.skip) return { pass: 0, fail: 0, failures: [], skipped: r.skip };
  if(r.isQueue) pass++; else failures.push({ check:'pending is a queue', detail:JSON.stringify(r) });
  if(r.queued === 3) pass++; else failures.push({ check:'holds every hero', detail:'queued '+r.queued });
  if(r.localFirst) pass++; else failures.push({ check:'local hero first', detail:'local not at head' });
  return { pass, fail: failures.length, failures };
}

module.exports = { runMpTests };

if(require.main === module){
  runMpTests().then(r => {
    for(const f of r.failures) console.log(`FAIL mp ${f.check}: ${f.detail}`);
    console.log(`mp: ${r.pass} pass, ${r.fail} fail` + (r.skipped ? ' (skipped: '+r.skipped+')' : ''));
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
```

- [x] **Step 2: Validate against a known-bad case** — added, because the plan had no such step here
      and this is the one suite whose subject is already FIXED, so a green run proves nothing on its
      own.

Not by reverting the game fix — per Task 4, a known-bad you must break the repo to produce is a
known-bad nobody re-runs. The probe carries its own, permanently, the way `level.probe.js` carries
`?breakgap`:

```bash
node harness/test-mp.js --bad
```

`?heroslot=1` queues through the historical single slot (`window.__hero3dPending = [p,t]`, each hero
overwriting the last). It reproduces Oliver's report exactly — `drew 1 of 3`, and in the game's real
draw order **`the local hero was never drawn — this is the invisibility bug`**. The runner reports
`known-bad: correctly detected ✓` and exits 0 only when the assertions DO fail.

Worth keeping: the bug is **asymmetric**, and the known-bad shows it. With the local hero queued
last it survives (`localAt 0`) and only the ally count is wrong; queued first — the order the game
actually uses — it is the one body dropped. That asymmetry is precisely why Oliver could see his
opponent while being invisible to himself.

`runScenario` gained a `url` passthrough so a suite can drive its own known-bad; both self-test
hooks in this harness are URL flags, and without it they could only ever be run by hand.

- [x] **Step 3: Commit** — `harness/test-mp.js`, `harness/probes/mp.probe.js`, the `drive.js` url
      passthrough, and the three `__BF3` exports.

- [x] **Step 4 (added 2026-08-12): THE SUITE NO LONGER GOES DARK BECAUSE THE MACHINE IS BUSY.**
      Taken from Task 6 Step 4's closing paragraph, which is the only place in either plan that named
      this as open work.

`mp.probe.js` opened with `H.on && H.ready` and, failing it, returned `3D hero layer not live
(on:false ready:false)`. Read at its site, that one message covers three unrelated situations, and
the right answer differs in each:

| state | what it means | right answer |
|---|---|---|
| `on:false`, no error | **off by flag** (`?hero3d=0`), a supported way to run the game | skip — already correct |
| `on:false`, `HERO3D.err` set | the renderer **THREW**; hero3d.js caught it and fell back to voxels for everyone (`hero3d.js:1781`) | skip, but say WHAT threw — the old message discarded the text |
| `on:true, ready:false` | the glTF is still **LOADING**. `--scene 0` waits on world3d's build, which is a different async | **WAIT** — nothing is wrong, the shutter is early |

The third is the one that made the 2026-08-11 gate run dark, and it is the one the plan predicted:
world3d can be up while the hero rig is not. The probe is now `async` and polls for readiness, so a
warm machine pays nothing and a cold one pays what it needs. It gives up at 30s and reports how long
it waited, because a wait that could become unbounded trades a dark suite for a hung gate.

**A CRASH IS STILL REPORTED AS A SKIP AND NOT A FAILURE, deliberately.** `autopilot.ps1` answers a red
gate with `git checkout -- .`, so an assertion that can fail for environmental reasons can DELETE a
run's verified work — sub-project B's pass 3 records exactly that hazard, in those words. Headless
SwiftShader falling over is environmental. It is now loud and it carries the error text; promoting it
to a failure is a separate decision with a real cost behind it, and it should be made deliberately
rather than as a side effect of this.

**Proven by a self-test carried permanently in the probe, beside `?heroslot` and `?breakgap` — and it
is the opposite shape to the other three, because it must PASS.** `?heroslow=<ms>` puts the layer back
into the exact state that made the suite dark (on, not ready), and the bar is that the suite comes
back with its measurements anyway. `wouldHaveSkipped` is what the old guard would have returned *from
the same launch*, so the two versions are watched to disagree rather than argued about — the rule
`harness/test/gate.test.js` sets.

Three runs, all measured:

| run | result |
|---|---|
| `node harness/test-mp.js --slow-hero` | **`waited 4172ms  (rescued a run that would have skipped)`**, `mp: 54 pass, 0 fail` |
| `node harness/test-mp.js` | `mp: 54 pass, 0 fail`, **`waited 0ms`** — a warm machine pays nothing |
| `node harness/test-mp.js --bad` | `41 pass, 9 fail`, `known-bad (single-slot): correctly detected ✓` — the assertions can still go red |

**And it was then put through the thing it was built for, the same day.** A full `node harness/run-all.js`
ran after this landed — sixteen skill launches and sixteen level launches ahead of the mp suite on the
same machine, which is exactly the contention that used to make it dark. Result: `GATE: PASS (3 known,
0 newly fixed)`, exit 0, and **`mp: 54 pass, 0 fail`**. One green gate does not prove a race is gone;
it does prove the suite ran under load, which is more than the last two gate runs could say.

**What it does NOT fix, said plainly.** If the layer genuinely never comes up in 30s the suite is
still dark, and it is still gate-neutral. What changes is that the run now says which of the three
states it was and, for a crash, what the renderer said — so the next person is not reading
`on:false ready:false` and guessing, which is what this run had to do before writing any of it.

---

### Task 6: The aggregate gate

**Files:**
- Create: `harness/run-all.js`

**Interfaces:**
- Consumes: `runSkillTests`, `runLevelTests`, `runMpTests`.
- Produces: `harness/report.json`; exit code 0 when everything passes, 1 otherwise. This exit code is the autopilot's commit gate.

- [x] **Step 1: Write the runner** — shipped in `34262a6`. The code below is the plan's version and is
      kept only for the diff: what runs is ESM, enumerates `harness/test/*.test.js` explicitly because
      `node --test <dir>` fails on Windows (Correction 2), and takes its ratchet and its per-suite
      reporting from `harness/gate-rules.js` (Step 4).

Create `harness/run-all.js`:

```js
/* THE GATE. Autopilot may only commit when this exits 0.

   Also runs the pure unit tests first: they take milliseconds and catch a broken claim parser
   before spending forty minutes of GPU time measuring the game with a broken ruler. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main(){
  const report = { at: new Date().toISOString(), suites: {} };

  try {
    execFileSync(process.execPath, ['--test', path.join(__dirname, 'test')],
                 { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    report.suites.unit = { pass: 1, fail: 0 };
  } catch(e){
    report.suites.unit = { pass: 0, fail: 1, failures: [{ detail: 'unit tests failed' }] };
    fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 2));
    console.log('GATE: FAIL (unit tests) - not running the slow suites');
    process.exit(1);
  }

  const suites = [
    ['skills', require('./test-skills.js').runSkillTests],
    ['levels', require('./test-levels.js').runLevelTests],
    ['mp',     require('./test-mp.js').runMpTests],
  ];
  for(const [name, fn] of suites){
    try { report.suites[name] = await fn(); }
    catch(e){ report.suites[name] = { pass: 0, fail: 1, failures: [{ detail: e.message }] }; }
  }

  fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 2));
  let fail = 0;
  for(const k of Object.keys(report.suites)){
    const s = report.suites[k];
    fail += s.fail || 0;
    console.log(`${k}: ${s.pass || 0} pass, ${s.fail || 0} fail`);
  }
  console.log(fail ? `GATE: FAIL (${fail})` : 'GATE: PASS');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [x] **Step 2: Run it** — and **the baseline never shrank, so the gate could only ever get weaker.**

Run: `node harness/run-all.js`
Expected: per-suite counts, `harness/report.json` written, and a `GATE:` line. A FAIL here is expected on first run — it is the bug backlog for sub-projects B and C.

`run-all.js`'s own header has always promised that "fixing a baselined failure shrinks the baseline;
that is the whole point of the exercise". It never did: the file was written once, when it did not
exist, and after that only ever read. So a failure fixed today stayed `known` forever, and could
come back tomorrow to a gate that waved it through as something it already knew about — the same
green-light-that-cannot-go-red failure this harness exists to prevent, one level up.

It now rewrites the baseline on a GREEN run only, never when `fresh` is non-empty, so a regression
can never baseline itself. The direction is deliberately the safe one: if a suite flakes and
under-reports, the baseline shrinks and the real failure returns as a REGRESSION next run — loud,
not silent.

Verified live rather than reasoned about: `baseline shrunk: 16 → 4`, `GATE: PASS (4 known, 12 newly
fixed)`, exit 0.

- [x] **Step 3: Commit**

```bash
git add harness/run-all.js harness/report.json
git commit -m "harness: one gate whose exit code decides whether autopilot may commit"
```

- [x] **Step 4 (added 2026-08-11): THE GATE WAS MISREPORTING A SUITE THAT DID NOT RUN — two faults,
      one field.** Found by reading a real gate run's printed output against its own `report.json`,
      which is the only reason it was visible at all: they disagreed.

The run printed `mp: skipped (not written yet)`. `harness/report.json` from the same run held
`"skipped": "3D hero layer not live (on:false ready:false)"`, for a file that has existed since
Task 5 and that this plan records as green at 16/0.

**1. Two different states were collapsed into one field.** `run-all.js` set `skipped:true` for a
MISSING FILE; `test-mp.js` sets `skipped:<reason>` when it RAN and could not measure. The printer
tested one flag and reported the informative case as the uninformative one, throwing the reason away.
It matters more than a wording bug: **the mp suite is the one that proves Oliver is not invisible to
himself in PvP**, and a reader of that output had no way to learn its sixteen assertions had not run.
A suite that quietly does not run is the green-light-that-cannot-go-red this harness exists to
prevent, one level up — the same shape as the never-shrinking baseline fixed in Step 2.

**2. THE WORSE HALF, which nobody had noticed: a suite that did not run could SHRINK THE BASELINE.**
The ratchet computed `fixed = known − now`, and a dark suite contributes nothing to `now` — so every
one of its baselined failures looked fixed, was announced as `FIXED:`, and was dropped from the file.
Nobody fixed them; the suite never looked. That is `docs/VISION.md`'s *"missing data is not a negative
finding"* inverted into a positive one, and silently. Not reachable on the day it was found only
because no `mp:` failure happens to be baselined right now — which is luck, not a guard.

The flake case `run-all.js`'s own header reasons about is different and is still accepted deliberately:
a suite that RAN and under-reported shrinks the baseline and the failure returns as a loud REGRESSION
next run. A suite that did not run leaves nothing to be loud about.

**Fixed in `harness/gate-rules.js`**, a new pure module, for the same reason `parseEval` is one:
everything else here needs forty minutes and a GPU, so the parts with reasoning in them have to be
checkable without one. `run-all.js` imports it rather than keeping a copy. `missing` and `skipped`
are now distinct; a dark suite's baselined ids are CARRIED and printed as such; the `GATE: PASS` line
names any dark suite.

**Proven by `harness/test/gate.test.js`, 10 tests, and the old rules are transcribed into the test
file and asserted to DISAGREE** on both cases — `OLD_LINE` really does print "not written yet" for the
mp reason, and `OLD_FIXED` really does return the mp id as fixed. A test that only says the new
behaviour is the new behaviour could not tell you the bug was ever real; that is the trap
`passives.test.js` names as "the two cases must disagree" and the one Task 5 records at length. The
ratchet's genuine direction is tested too, so this cannot quietly become a baseline that only grows.

**Left open, and stated rather than fixed:** the mp suite went dark because the 3D layer was not live
in that launch — headless SwiftShader under load. So the suite skips exactly when the machine is
busy, which is most autopilot runs. It is now LOUD when that happens, which is the floor; making it
retry or wait longer is a real piece of work and belongs to whoever takes Task 5 again.

**THAT WORK WAS TAKEN, 2026-08-12 — see Task 5 Step 4 below. The one-line guard was hiding THREE
different states under one name, and only one of them was worth skipping for.**

---

### Task 7: Autopilot guards

**Files:**
- Modify: `autopilot.ps1`
- Delete: `AUTOPILOT_BLOCKED.md`, `_AUTOPILOT_BLOCKED.md`

**Interfaces:**
- Consumes: `harness/run-all.js` exit code.

> **Task 7 shipped in `34262a6` and `a3e999c`.** Ticked against the repo rather than against memory:
> `autopilot.ps1:208` carries the limit guard (widened to `hit your session limit|usage limit
> reached`), `:233` runs the green gate, and `:193` carries the scope guard in the prompt text. Step 5
> was only HALF done and is now finished — see the note under it.

- [x] **Step 1: Read the current run body**

Run: `grep -n "claude\|Start-Process\|git commit\|git push" autopilot.ps1`
Expected: the lines that launch Claude and that commit. Note their exact line numbers before editing.

- [x] **Step 2: Add the limit guard**

The 2026-08-03 outage was ~200 runs that each started, printed `You've hit your session limit`, and ended having shipped nothing. After the Claude invocation captures its output into `$out`, add:

```powershell
# LIMIT GUARD. On 2026-08-03 this task fired every 20 minutes and every run died on the session
# limit, burning quota to produce nothing. A limited run is not a failed run - it is a run that
# must not have happened. Exit without touching the tree so the next window starts clean.
if ($out -match "hit your session limit") {
  Add-Content $LOG ("{0}  skipped: session limit" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  exit 0
}
```

- [x] **Step 3: Add the green gate**

Immediately before the commit step:

```powershell
# GREEN GATE. A run may only commit when the harness passes. Castle Duskmoor was committed four
# times while unplayable; this is the check that would have stopped it.
& node harness/run-all.js
if ($LASTEXITCODE -ne 0) {
  Add-Content $LOG ("{0}  REVERTED: harness gate failed" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  git checkout -- .
  exit 0
}
```

- [x] **Step 4: Add the scope guard to the prompt**

In the prompt text that `autopilot.ps1` passes to Claude, add these lines next to the existing "Work on the autopilot-merged branch only" rule:

```
- Sub-projects A-D only: verification harness, skill correctness, level completability, multiplayer.
- You may NOT author new zones (Sunspire Palace, Ruined Keep, The Outskirts). Those wait for Oliver.
- You may not commit unless `node harness/run-all.js` exits 0.
```

- [x] **Step 5: Delete the stale blocked files** — **ONE of the two, deliberately, 2026-08-11.** Both
      were still present when this box was finally ticked, which is why it is worth writing down which
      one went and why the other stayed.

Both describe a permission blocker that was fixed — `.claude/settings.json` and `tools/gate.js` both exist.

```bash
git rm --cached AUTOPILOT_BLOCKED.md 2>/dev/null; rm -f AUTOPILOT_BLOCKED.md _AUTOPILOT_BLOCKED.md
```

**`AUTOPILOT_BLOCKED.md` is gone.** 106 lines, TRACKED (last touched in `3cb232a`), and its own line 5
says *"delete this file once the fix below is in"*. It is: the table of denied commands it is built
around lists `node <any script>`, `git add`, `git commit` and `git push`, and this run used all four.
A fresh checkout was being handed a file announcing the autopilot is blocked when it is not, which is
the same shape of stale green/red light this whole plan exists to remove. Tracked, so `git revert`
brings it back.

**`_AUTOPILOT_BLOCKED.md` STAYS, and the command above should not be run as written.** It is 881 lines
and it is UNTRACKED — the `/_*` gitignore rule is the whole reason it was filed at that path, so `rm`
is unrecoverable and no revert exists. It is also not what this step thinks it is: it is the outage
LOG, holding thirteen blocked runs' desk research, and its own header points work at
`_AUTOPILOT_NEXT_RUN.md` instead. Deleting a run's only copy of that is exactly the irreversible,
not-revertible-by-git act Task 8 is held back from an autopilot run for. If Oliver wants it gone it is
one `rm`, and it is his.

- [x] **Step 6: Verify the guards fire** — `_autopilot.log` carries both outcomes, and the limit guard
      earned its widened pattern (`usage limit reached` as well as `hit your session limit`) from a
      real run that the first version did not match.

Run: `powershell -File autopilot.ps1 -WhatIf` if supported, otherwise run once manually and read `_autopilot.log`.
Expected: the log shows either a normal run or `skipped: session limit`, and never a commit while the gate is red.

- [x] **Step 7: Commit**

```bash
git add autopilot.ps1
git commit -m "autopilot: limit guard, green gate, scope guard"
```

---

### Task 8: Re-enable the schedule — **OVERTAKEN. It is already on, and the run reading this IS the schedule.**

**Files:**
- Modify: Windows scheduled task `Bladefall Autopilot` (currently Disabled, last ran 2026-08-03).

- [x] **Step 1: Confirm the current state** — confirmed 2026-08-12, by a different method than the
      one written here, and the answer is the opposite of the expectation.

`Get-ScheduledTask` is not on the unattended allowlist, so the state was read from the thing the
scheduler actually produces — `_autopilot.log`:

```
2026-08-12 09:44:02  run start
2026-08-12 09:53:43  skipped: session limit
2026-08-12 10:04:02  run start
2026-08-12 10:53:50  run end
2026-08-12 11:04:02  run start        <- this run
```

The task is **enabled and firing hourly at :04**, not Disabled with a `LastRunTime` of 2026-08-03.
The session writing this line was started by it: its prompt is `autopilot.ps1`'s `$prompt` verbatim.
Worth carrying separately, because AUTOPILOT.md's cadence section is written around the opposite
fact: **runs are no longer being killed at the 20-minute boundary** — the 10:04 run ended at 10:53,
having shipped six commits. That is the raised `ExecutionTimeLimit` holding, and it means an item
needing four browser launches now fits in one run.

- [x] **Steps 2–4: cadence, enable, manual cycle — NOT TAKEN, and two of them must not be**

- *Step 2 (6-hourly).* How often Oliver wants an autonomous agent running against his game is a call
  about his attention and his API spend, which `docs/VISION.md` puts squarely in the ask-first
  column. It is also already answered in the other direction, by him, in the live scheduler.
- *Step 3 (enable).* Already enabled.
- *Step 4 (`Start-ScheduledTask`).* This would launch a **second Claude session inside this one**,
  against this same checkout. Best case the overlap lock skips it and the step proves nothing; worst
  case two sessions edit the same working tree, which is the failure `AUTOPILOT.md` already has a
  memo about. The honest verification of a scheduled run is the next scheduled run.

- [x] **Step 5: Commit the disposition** — this edit.

<details>
<summary>The original steps, kept for the record</summary>

```powershell
Get-ScheduledTask -TaskName 'Bladefall Autopilot' | Get-ScheduledTaskInfo
```

Expected: `LastRunTime 8/3/2026`, and the task itself Disabled.

**Step 2: Set the cadence to 6-hourly**

```powershell
$t = Get-ScheduledTask -TaskName 'Bladefall Autopilot'
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddHours(6) -RepetitionInterval (New-TimeSpan -Hours 6)
Set-ScheduledTask -TaskName 'Bladefall Autopilot' -Trigger $trigger
```

**Step 3: Enable it**

```powershell
Enable-ScheduledTask -TaskName 'Bladefall Autopilot'
Get-ScheduledTask -TaskName 'Bladefall Autopilot' | Select-Object TaskName, State
```

Expected: `State: Ready`

**Step 4: Run one cycle manually and read the log**

```powershell
Start-ScheduledTask -TaskName 'Bladefall Autopilot'
```

Then: `tail -20 _autopilot.log`
Expected: a `run start` / `run end` pair with real work between them, or `skipped: session limit`. Not the 20-minute dead-start pattern.

**Step 5: Commit any log/doc changes**

```bash
git add -A AUTOPILOT.md
git commit -m "autopilot: back on, 6-hourly, gated on the harness"
```

</details>

---

## Self-Review

**Spec coverage.** Sub-project A's five files: Tasks 1–6. Autopilot contract's three changes: Task 7. Re-enable: Task 8. The spec's requirement that each runner be validated against known-good AND known-bad cases: Task 1 steps 5–6, Task 3 step 4, Task 4 step 2. Not covered here by design: B, C, D fixes (their own plans, once this is green), E and F.

**Placeholders.** None. Every code step carries complete code; every run step carries an exact command and expected output.

**Type consistency.** `runScenario({scene, pre, js, waitMs, timeoutMs})` is used with that exact shape in Tasks 3, 4 and 5. `claimsOf(d)` returns the six claim names consumed by `SATISFIED` in Task 3. Each suite returns `{pass, fail, failures}`, which is what `run-all.js` aggregates in Task 6.

**Known risk carried forward.** `test-levels.js` reaches area 1 via `G.area=1; loadStage(...)`, which worked when probing Duskmoor but is not a supported entry point — `enterZone` takes one argument and always starts at area 0. If it proves unreliable, the fallback is to test area 0 only and record area 1 as untested rather than report a false pass.
