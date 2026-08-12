# Harness Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the harness from being able to destroy the work it exists to protect, and make the automation say what it did.

**Architecture:** No new suites. Task 1 removes a false-failure source in the skill bench; Task 2 makes a red gate non-destructive; Task 3 gives each run a one-line report.

**Tech Stack:** `harness/*.js` (ESM), `autopilot.ps1`. Node 26, no npm install.

## Why this is first

`bladedancer/Riposte` **flapped**: identical code returned `5 pass, 0 fail` and `4 pass, 1 fail` on consecutive runs. `run-all.js` calls a new hard failure a REGRESSION, and `autopilot.ps1` answers a red gate with `git checkout -- .`.

So a flake can delete a run's verified work. Every other plan in this repo is worth less until that is not true. The triage doc already named it as the thing to take before any new skill work, and named the lead: **Riposte lunges 55 units onto a dummy the bench places 60 away.**

## Global Constraints

- Work on branch `autopilot-merged`. Never `main`.
- `harness/` is ESM. Use `import`/`export`.
- Any `public/3d/index.html` change must pass `node tools/gate.js`.
- Every assertion must be watched to FAIL before it is believed.
- **Task 1 re-baselines all sixteen classes. It must not share a run with anything else** — that is exactly why the triage doc left it alone.

---

### Task 1: Kill the flap at its source

**Files:**
- Modify: `harness/test-skills.js`
- Modify: `harness/baseline.json` (regenerated)

- [x] **Step 1: Reproduce the flap and prove it is geometry** — **IT DOES NOT REPRODUCE, and the
      reason is that it was already fixed.** Measured 2026-08-12, ten consecutive runs:
      `5 pass, 0 fail, 0 unproven` ten times out of ten, no other line.

The flap was killed on 2026-08-11 by a different fix than this task proposes, and `test-skills.js`
documents it in its own header ("EVERY CAST STARTS FROM THE SAME BODY, and until 2026-08-11 none of
them did"). `reset()` now restores the player's whole numeric/boolean pose before every cast, so
`bd_counter`'s parry window can no longer leave a stored Riposte on the body for the next skill —
which is the entire mechanism by which a 55-unit lunge became a 95-unit one. **Geometry was never
the cause; contamination was.** This step's own escape hatch says to record that and not change
geometry on a guess, and that is what happened.

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do node harness/test-skills.js --classes bladedancer 2>&1 | tail -1; done
```

Expected: a mix of `5 pass, 0 fail` and `4 pass, 1 fail`. If it is stable ten times, the flap has another cause — record that and stop rather than changing geometry on a guess.

- [x] **Step 2: Measure the reach the bench actually needs** — **done 2026-08-12, and it says Step 3
      must not be carried out as written.** Committed as `harness/probes/reach.probe.js` so the next
      run reads numbers rather than re-deriving them. Sweeps five classes' full rank-10 kits over six
      spawn distances (15/25/30/40/60/90) on the bench's own rig — same weapon selection, same pose
      restore, same 300-tick window — with the dummy's position the only variable.

Three findings, in order of how much they change the task:

1. **The suite's three current hard failures are NOT distance artifacts.** Each deals exactly zero
   at all six distances, so no bench distance rescues them and they must stay failed:
   `ranger/Tumble` 0×6 (rolls 197 units *away*), `mage/Attunement` 0×6, `berserker/Charge` 0×6
   while travelling **684 units** — against `warrior/Charge`, which travels ~315 and deals 77 at
   every distance. That contrast is the useful one: Charge as a mechanism works, the berserker's
   does not. These are real skill bugs and belong to the skill-correctness plan, not to this one.

2. **30 IS THE ONE VALUE THAT MUST NOT BE CHOSEN.** Step 3 says "30 is safely inside every value
   seen so far". Measured, `bladedancer/Riposte` deals `0, 0, 0, 201, 170, 201` — **zero at 15, 25
   and 30**, damage from 40 out. Riposte's lunge carries it *past* a close target and `bdArc`'s cone
   then fails behind it. So the proposed fix would have converted a passing skill into a hard
   failure — i.e. into exactly the REGRESSION that `run-all.js` reports and that this whole plan
   exists to stop being destructive. Shortening the distance is not merely unnecessary, it is the
   wrong direction.

3. **The dummy does not stay where it is put, at any distance.** Recorded each dummy's displacement
   from its spawn point: consistently `spawn distance + ~44` — the grunt closes the whole gap and
   ends adjacent to the player, who has itself been pushed ~44 units back. Within the 300-tick
   window every spawn distance collapses to the same melee range, which is why damage is flat across
   the sweep for `Volley`, `Elemental Bolt`, `Cleave` and the rest. **The bench's "target at 60" is a
   fiction after the first second**, so tuning that number was never going to buy determinism.

The residual variance is visible in the same table and has a different cause: `Counter Stance`
(`62, 92, 62, 92, 92, 0`) and `Mirror Guard` (`210, 240, 210, 62, 210, 148`) are non-monotonic in
distance because they pay out when the player is HIT, and whether a chasing grunt lands a swing
inside the window is a race. That — not reach — is what is left to harden.

```bash
node _shot/shot.js --scene arena:flat --wait 12000 --eval @harness/probes/reach.probe.js
```

```bash
node _shot/shot.js --scene arena:flat --wait 12000 --eval "(function(){ __BF3.cheatUnlockClasses(); __BF3.cheatRank10All(); __BF3.meta.classId='bladedancer'; const p=__BF3.G.p; const out=[]; const sk=(__BF3.c2CurSkills?__BF3.c2CurSkills():__BF3.curSkills())||[]; for(let i=0;i<sk.length;i++){ if(!sk[i]) continue; const z0=p.z; __BF3.useSkill(i); for(let k=0;k<120;k++) __BF3.update(1/60); out.push({n:sk[i].n, moved:Math.round(z0-p.z)}); } return JSON.stringify(out); })()"
```

Expected: per-skill travel distances. The bench distance must be **less than the shortest lunge**, not more.

- [x] **Step 3: Make the target distance a named constant** — done 2026-08-12. **One of its three
      instructions was carried out; the other two were measured first and refused, and a THIRD flap
      that nothing in this plan had suspected was found and fixed in their place.**

`DUMMY_DIST = 60` now feeds both `BASELINE` and `PROBE`. That much was free, and it was the half worth
having: `BASELINE` is what licenses reporting a damage claim as UNPROVEN rather than FAILED, and
`mkDummy`'s own comment claimed to be "EXACTLY the rig the baseline proved" while being a second copy
of the number.

**Shortening to 30: REFUSED, measured** (`harness/probes/reach.probe.js`, Step 2). `bladedancer/Riposte`
deals `0, 0, 0, 201, 170, 201` across 15/25/30/40/60/90 — nothing at 30. The one value the plan named
is the one value that converts a passing skill into a hard failure.

**Freezing the dummy: REFUSED, measured** (`harness/probes/freeze.probe.js`, new this run). Five kits
at 60 units with `e.speed = 0` (index.html:12874 is the whole of an enemy's locomotion) as the only
variable, mobile column against frozen column:

- it removes the player-was-HIT condition from **15 of 20 rows** — a frozen grunt never arrives to
  swing, so every skill that pays out on being struck loses its payout;
- it silences two skills outright — `ranger/Hunter's Mark` 28 → 0, `monk/Deflect` 20 → 0 — and moves
  five more (`bladedancer/Mirror Guard` 210 → 62, `warrior/Cleave` 146 → 115, `ranger/Volley`
  240 → 192, `ranger/Spike Trap` 78 → 120 the other way);
- and it does not do what it was for: the frozen dummy still ends **~31 units** off its spawn, because
  knockback moves it whatever its speed is.

**What was actually flapping: `G.minions`.** `harness/probes/determinism.probe.js` (new this run) casts
all sixteen kits three times **inside one page** and compares the MET booleans rather than the damage
numbers — one Chrome launch instead of the thirty a `run-all.js` loop would cost. 192 casts, and one
row was the flap in this plan's title with a second head:

```
necromancer/Raise the Dead   summon TRUE, FALSE, TRUE   dmg 1611 / 1562 / 1548
```

The same code passing, failing and passing, on a claim that FAILS the suite. `reset()` restores every
number and boolean on the player, but `G.minions` is an array on `G`, so a summon skill's own product
survived into the next skill's verdict — and `MET.summon` is a strictly-greater test. At
`spawnMinion`'s cap (index.html:11869) the array `shift()`s before it pushes, so **the length does not
change and a summon reads as a no-op**; Raise the Dead passes no cap of its own and gets the default
14, while Summon Skeletons and Army of the Dead pass `necroMinCap()` (26 at rank 10) and at rank 10
give their minions a null life so they never expire. So the kit parks 14+ permanent minions in the room
and the later skill's verdict comes down to how many happened to die to the dummy. `mkDummy` now empties
the minions with the enemies. Deliberately ONLY the minions: projectiles and hazards leak the same way
(the 32 damage `ranger/Hunter's Mark` shows on its first repeat and never again is the previous skill's
leftover) but nothing measured shows them changing a verdict.

*Kept for the next reader:* that comment lives inside the `PROBE` template literal, and the first
version of it contained backticks, which ends the string and stops the whole module parsing —
`SyntaxError: Unexpected identifier 'after'`, and every bench run dead until it was removed.

- [x] **Step 4: Prove the flap is gone** — done 2026-08-12, at two levels.

Per-launch, after the change: `node harness/test-skills.js --classes necromancer` three times →
`4 pass, 0 fail, 0 unproven` three times; `--classes bladedancer` twice → `5 pass, 0 fail, 0 unproven`,
matching what Step 1 recorded ten times over before the change, which is the point — the constant is a
no-op and the minion clear cost nothing.

Across the whole game, the in-page sweep re-run with the fix: **`necromancer/Raise the Dead` no longer
appears**, and 62 of 65 rows are bit-identical over three repeats. Three rows still flap, and **not one
of them flaps on a bit its own text claims**:

```
ranger/Hunter's Mark   damage 28, 0, 0        claims ['buff']            — damage never read
reaper/Soul Siphon     shield true,false,false claims buff, damage, heal — damage 128 and heal 24 on all three
paladin/Last Stand     damage 10, 0, 10       claims ['buff','heal']     — heal 72 on all three
```

That is an argument made of three parser results, so it is pinned by three assertions in
`harness/test/claims.test.js` (fast stage, runs before any launch). If a later edit teaches the parser
to read `shield` out of Soul Siphon's text, the test says so instead of a REGRESSION arriving one run
in three.

The ten-launch loop the plan asked for is still the right shape for a single class, but the in-page
sweep is what generalises: ten launches of one class costs the same as one launch of all sixteen.

- [x] **Step 5: Gate it, alone, and commit** — done 2026-08-12, and **the re-baseline was refused.**

The full gate, on the whole game:

```
unit:   1 pass, 0 fail
skills: 70 pass, 3 fail, 2 unproven
levels: 36 pass, 0 fail, 12 unproven
mp:     54 pass, 0 fail
GATE: PASS (3 known, 0 newly fixed)
```

The three failures are the three that were already known — `ranger/Tumble`, `mage/Attunement`,
`berserker/Charge` — so `baseline.json` is byte-identical and is not in the commit. That is the
expected result and the reason this step could be reduced: **nothing here moved the bench geometry**,
which is the only thing that would have moved every class.

`rm -f harness/baseline.json` is deliberately NOT run. The plan asked for it because it assumed a
distance change; with no such change, deleting the file only throws away the recorded three and
re-records whatever this run happened to see. Given that this whole task is about a suite that can
report a failure it did not have last time, re-recording the baseline from one observation is strictly
weaker than comparing against the three that are already written down — and `run-all.js` shrinks the
baseline by itself on any green run that fixes something.

```bash
git add harness/test-skills.js harness/probes/freeze.probe.js harness/probes/determinism.probe.js \
        harness/test/claims.test.js docs/superpowers/plans/2026-08-11-harness-hardening.md
git commit -m "harness: a summon skill's verdict depended on the last skill's minions"
```

---

### Task 2: A red gate must never delete work

Even with the flap fixed, `git checkout -- .` is the wrong answer to a red gate: it destroys the evidence of what went wrong.

**Files:**
- Modify: `autopilot.ps1`

- [x] **Step 1: Replace the destructive revert with a stash** — done in a supervised session, 2026-08-12.

Find the GREEN GATE block. Replace `git checkout -- .` with a stash that keeps the work:

```powershell
git stash push -u -m "autopilot gate-red $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -- . ':(exclude).claude/'
```

The `':(exclude).claude/'` is not optional — `-u` sweeps untracked files and the permission allowlist lives there. That mistake took the autopilot down for fourteen consecutive runs once already.

- [x] **Step 2: Say so loudly** — done. The gate's own REGRESSION/GATE:/FAIL lines go to the log, then the stash name.

Log the stash name and the gate's own failure lines, so a red gate leaves a readable trail rather than a silent revert.

- [x] **Step 3: Verify** — **UNBLOCKED, and verified.** `PARSE CLEAN`, exit 0.

```powershell
powershell -NoProfile -Command "$errs=$null; [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path autopilot.ps1),[ref]$null,[ref]$errs); if($errs.Count){$errs}else{'PARSE CLEAN'}"
```

Expected: `PARSE CLEAN`.

**This was blocked and is now unblocked.** `powershell` was not on the allowlist in any form, so a
run could edit `autopilot.ps1` and had no way to check it still parsed — and an unparseable
`autopilot.ps1` stops the automation completely, unattended, on the next scheduled run. The run that
hit this wrote Steps 1–2 and then correctly REVERTED them unverified.

The fix is **not** the obvious one. Allowlisting `powershell -NoProfile -Command` is arbitrary code
execution and walks straight around the deny list that keeps this automation off `main` — a denied
`git push origin main` is one `powershell -Command "git push origin main"` away. Instead
`tools/psparse.ps1` is a committed, parse-only script, and the allowlist entry points at that file.
It cannot run what it is given because it is never given anything to run, only a path to read.
Validated both ways: `PARSE CLEAN` exit 0 on a good file, `PARSE ERROR line 1` exit 1 on a broken one.

Future tasks editing `autopilot.ps1` verify with:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File tools/psparse.ps1 autopilot.ps1
```

A comment recording this now sits at the `git checkout -- .` site itself (`autopilot.ps1:239`), so
the next run finds it where the hazard is rather than only in this plan.

- [x] **Step 4: Commit** — done.

```bash
git add autopilot.ps1
git commit -m "autopilot: a red gate stashes the work instead of destroying it"
```

---

### Task 3: Make the automation say what it did

The only Telegram ping is a failure alert, so a healthy run is indistinguishable from no run at all without reading the log. Oliver has asked twice what it has been up to.

**Files:**
- Modify: `autopilot.ps1`
- Add: `harness/run-report.js`, `harness/test/run-report.test.js`

**THIS WAS BUILT ONCE ALREADY AND THE STASH CYCLE ATE IT.** `_autopilot.log` records a run reporting
"Task 3 (run report): `harness/run-report.js` + 10 unit tests including the CLI end-to-end and a
watched-to-fail check; `autopilot.ps1` glue parses clean" — and no commit anywhere contains that file.
It was left uncommitted, swept by the killed-run guard into `stash@{1}` at 12:04 on 2026-08-12, and a
later run's glue then logged `report skipped (run-report exit 1)` — the PowerShell half calling a
module that had been stashed out from under it. **Recovered from the stash rather than rewritten**
(`git show "stash@{1}^3:harness/run-report.js"`), reviewed rather than trusted, and committed this
time. This is the third artefact this plan has found in a stash; the lesson of Task 2 is that the
recovery path works and nobody looks.

- [x] **Step 1: Build the report at the end of a green run** — done 2026-08-12. Not one line and not
      in PowerShell: `harness/run-report.js`, whose pure half composes the text and body and whose
      impure half reads `git log --format=%s <startSha>..HEAD` and `harness/baseline.json`.

**It lives in Node because that is the only half an unattended run can TEST.** `node --test` is on the
allowlist; `powershell -Command` deliberately is not, so anything written as PowerShell can be
parse-checked and never executed by the session that wrote it. Two things fall out of that which the
plan's one-liner would not have got:

- **the body is `JSON.stringify`d, not concatenated.** Every existing `tgPing` in `autopilot.ps1` is
  built as `'{"action":…,"text":"' + $text + '"}'`, which stops being JSON the moment a commit subject
  contains a double quote — the POST is silently dropped and the run still looks green. The test
  asserts the two idioms DISAGREE on exactly that input, so the bug is recorded as a failing case.
- **the body travels as a FILE.** The digest carries `•` and an emoji; PowerShell 5.1 decodes a native
  command's stdout through `[Console]::OutputEncoding`, an OEM codepage here, so `$body = & node …`
  would mangle them at capture. `--out` plus `[System.IO.File]::ReadAllBytes` moves the exact bytes.

**One real defect found in the recovered code, fixed, and now tested:** `baselineCount()`'s default
path was `<repo>/baseline.json` and the file is `harness/baseline.json`. A missing baseline correctly
returns `null`, so every report silently dropped its "N known failures still tracked" line and the
existing assertion — a made-up path returns null — was satisfied by the bug. The new test reads the
file a second way and demands the two agree, and keeps the old path as the failing case.

- [x] **Step 2: Send it on the existing channel** — done. `Invoke-RestMethod` to the same
      `thework.pages.dev/state` endpoint, once per run, only when `run-report.js` exits 0. **Exit 3
      means "committed nothing", which is the quiet path** — a run that correctly found nothing to do
      must stay silent or the channel gets muted and takes the failure alerts with it. The report file
      is deleted after a successful post because it carries the ping password, and deliberately KEPT
      after a failed one, where it is the only evidence of what was attempted.

The same change hoists the ping password to `$tgPass`, reading `$env:BLADEFALL_TG_PASSWORD` with the
existing literal as fallback — three call sites become one. **That is not a secret fix and is not
claimed as one:** the value is already in this file's history and in `AUTOPILOT.md`. Rotating it is
Oliver's call, because the same password authenticates the other PraxisBrain automations.

- [ ] **Step 3: Verify by running one cycle manually — NOT POSSIBLE FROM INSIDE A RUN, and this is
      what was verified instead.**

```powershell
Start-ScheduledTask -TaskName 'Bladefall Autopilot'
```

The task's own overlap lock is held by the very session doing this work (`_autopilot.lock`, keyed on a
live PID), so a manually started cycle logs `skipped: run <pid> still alive` and exercises nothing.
`Start-ScheduledTask` is also not on the allowlist. What WAS verified:

- `powershell -NoProfile -ExecutionPolicy Bypass -File tools/psparse.ps1 autopilot.ps1` → `PARSE CLEAN`
- `node --test harness/test/run-report.test.js` → **11 pass, 0 fail**, and two of those spawn the CLI
  as a child process with the exact argument list `autopilot.ps1` uses, asserting the commit subjects
  land in the body, that `--out` writes real UTF-8 bytes, and that an empty range exits 3.
- the glue is wrapped in its own `try/catch` and sits AFTER `ClearMarkerIfClean`, so nothing it can do
  is able to fail the run it is reporting on.

**The evidence to look for, next run:** `_autopilot.log` should carry either `reported this run to
Telegram` or `nothing committed this run - no report sent`. A line reading `report skipped (run-report
exit <n>)` means the module is missing or throwing — which is precisely what the log said before this
commit, and the reason it said it.

- [x] **Step 4: Commit** — done.

```bash
git add autopilot.ps1
git commit -m "autopilot: report what a run actually did, not only when it breaks"
```

---

## Self-Review

**Spec coverage.** Covers the flap named in `SKILL_TRIAGE.md` section F, the destructive revert it makes dangerous, and the silence Oliver has raised twice.

**Placeholder scan.** Every step has an exact command and an expected result. Task 1 Step 1 has an explicit "if it does not reproduce, stop" branch rather than assuming the cause.

**Risk carried forward.** Task 1 changes bench geometry and therefore re-baselines all sixteen classes; entries may appear as well as disappear. That is why it is alone in its own run and why the commit message must record the delta.
