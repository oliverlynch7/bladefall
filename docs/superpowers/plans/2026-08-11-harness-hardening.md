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

### Task 1: Kill the flap at its source — **IT WAS ALREADY DEAD. Measured 2026-08-12, ten times.**

This task was written before `a724d69` landed, and that commit killed the flap at a source the plan
did not suspect: not the bench's distance, but the fact that **every skill was cast from the body
the previous skill left behind.** Riposte only ever lunged 95 units — past the dummy — because
`bd_counter`, cast one slot earlier, had stored a parry on the player and nothing put the player
back. `test-skills.js` now snapshots every number and boolean on `G.p` and restores it before each
cast, so the charged branch is no longer reachable at random. Full account: `docs/SKILL_TRIAGE.md`
section F, including the A/B in one launch (bench order, no restore: **2/3 missed**; bench order,
restored: **0/3**).

So the work this task exists to do is done, and its remaining steps are dispositioned below against
this plan's own instruction — *record it and stop rather than changing geometry on a guess.*

**Files:**
- Modify: `harness/test-skills.js` — done, one shared constant, value unchanged
- ~~Modify: `harness/baseline.json` (regenerated)~~ — not needed, nothing moved

- [x] **Step 1: Reproduce the flap and prove it is geometry** — **it does not reproduce.**

Run the bladedancer class ten times and count the verdicts:

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do node harness/test-skills.js --classes bladedancer 2>&1 | tail -1; done
```

Expected: a mix of `5 pass, 0 fail` and `4 pass, 1 fail`. If it is stable ten times, the flap has another cause — record that and stop rather than changing geometry on a guess.

**Ten runs, ten identical lines: `skills: 5 pass, 0 fail, 0 unproven`.** Run 2026-08-12 on
`autopilot-merged` at `93c3f4b`, serially, ~1–2 minutes each. Not "another cause" — the cause was
found and fixed the day after this plan was written, and the ten runs are that fix holding.

*Read the loop before copying it: the Bash tool in an unattended session rejects `for` loops
outright (`Contains simple_expansion`). Ten invocations chained with `&&`, in two backgrounded
batches, is what actually ran.*

- [x] **Step 2: Measure the reach the bench actually needs — NOT TAKEN, and already measured**

The numbers this step would have gone to get already exist, taken by `harness/probes/riposte.probe.js`
in one launch and written up in SKILL_TRIAGE section F:

| | separation after the lunge | cone term | dealt at cast |
|---|---|---|---|
| uncharged Riposte, dummy at 60 | 5, **inside the dummy's own 15-unit radius** | skipped — `bdArc` does not cone-test a target that overlaps the swing origin | 108, six casts out of six |
| charged Riposte, dummy at 60 | 35, and *behind* the player | dot **−1** against a needed 0.81 | **0** |

So the bench distance is not marginal for the uncharged lunge, which is the only one reachable now.
Spending three browser launches to re-derive that would produce the same table.

- [x] **Step 3: Make the target distance a named constant — DONE. Shortened — NO, deliberately.**

The constant landed: `TARGET_DIST` in `test-skills.js`, used by BOTH `BASELINE` and `PROBE`, which
is the half of this step that was always right — the two were a bare `60` written twice, and the rig
test's whole job is to certify the geometry the skill probe then measures in. Nothing would have
caught them diverging, because both halves would still run and both would still report numbers.

**The value stays at 60**, and the two things this step wanted to change are both refused on
evidence rather than on caution:

- *Shortening to 30.* It is a fix for a flap that no longer happens, and moving this number
  re-baselines all sixteen classes — every damage verdict in the suite is taken at this distance.
  Trading a real 16-class re-baseline for a hypothetical is the wrong side of this plan's own Step 1
  instruction.
- *Freezing the dummy's speed to 0.* Worse than unnecessary: the dummy's walk is part of what the
  **drift control** measures, and the drift is large and real (506 HP off the dummy for the paladin
  with nothing cast, 218 for the beastmaster). A frozen dummy silently lowers the noise floor every
  `CLEARS_NOISE` threshold is judged against, so it would move pass/unproven verdicts across the
  whole suite while looking like a tidy-up. It also cannot be what fixed anything here: no `update()`
  runs between `mkDummy()` and `useSkill()`, so the dummy is at exactly 60 at the moment of every
  cast regardless of how fast it walks afterwards.

- [x] **Step 4: Prove the flap is gone** — the ten runs under Step 1 ARE this step, since no geometry
      moved. Ten identical lines.

- [x] **Step 5: Re-baseline, alone — NOT NEEDED, and not doing it is the safer answer**

Nothing moved that a baseline entry depends on: the constant is the same 60 the file already spawned
at, and the two probes verify identical. Confirmed rather than assumed — `--classes bladedancer
warrior` after the change returns exactly what it returned before it.

`rm -f harness/baseline.json && node harness/run-all.js` is a **destructive** command in a repo whose
gate ratchets on that file: it discards the known-failure list and re-records whatever today's launch
happens to see, so any suite that flakes low in that one run silently erases real failures from the
ledger. It is the right move after a real geometry change and the wrong one after none.

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

- [x] **Step 1: Build a one-line summary at the end of a green run** — done 2026-08-12, and it is
      built in **Node, not PowerShell**, which is the one design decision here worth defending.

The summary is `harness/run-report.js`: commit subjects for `<startSha>..HEAD`, the gate's own
`GATE:` line, the entry count in `harness/baseline.json`, and the branch's own preview URL derived
from `git branch --show-current` rather than written down (the URL in AUTOPILOT.md still names
`autopilot-a` and `autopilot-b`, two branches this checkout does not use).

**Why not PowerShell.** An unattended session may run `node --test` and may not run
`powershell -Command`; that is not an accident, it is the wall that keeps this automation off `main`.
So anything written as PowerShell here can be parse-checked and never *executed* by the run that
wrote it — an unverifiable summary, which this repo's own rule puts below no summary at all. In Node
it has nine assertions, the CLI among them, run as a child process against this repository.

**And it builds the JSON itself, which found a live bug in the idiom it replaces.** Every existing
`tgPing` in `autopilot.ps1` is assembled as `'{"…","text":"' + $text + '"}'`. A commit subject with
a double quote in it — this repo has them — makes that body invalid JSON, the POST is dropped, and
the run still looks perfectly green. `run-report.test.js` asserts the two idioms **disagree** on
exactly that input, so the bug is recorded as a failing case rather than as a claim.

- [x] **Step 2: Send it on the existing channel** — done. Same `thework.pages.dev/state` `tgPing`
      endpoint, once per run, and only when the run committed something: the CLI **exits 3** for an
      empty range and `autopilot.ps1` logs `nothing committed this run - no report sent`. A quiet run
      stays quiet, or the channel gets muted and takes the failure alerts with it.

      *Not a duplicate of the session's own digest, and the runs where it matters most are the ones
      that never send one:* a session killed at the task time limit AFTER committing has already left
      verified work in the branch and said nothing about it. This line is built from git, so it
      reports what is actually there.

- [x] **Step 3: Verify** — done, in the three pieces that can actually be verified from here.
      `Start-ScheduledTask` is **not** one of them and was not run.

| what | how | result |
|---|---|---|
| the report's own logic, and the escaping bug it fixes | `node --test harness/test/run-report.test.js` | 9 pass, 0 fail |
| the CLI `autopilot.ps1` actually calls | spawned as a child process inside that test, against this repo, `--since HEAD~2` | valid JSON body carrying both real commit subjects; exit **3** for `--since HEAD` |
| every assertion is one that can fail | bullets changed `•`→`-` on purpose | the header/bullet test went red, then green again on revert |
| `autopilot.ps1` still parses | `powershell -NoProfile -ExecutionPolicy Bypass -File tools/psparse.ps1 autopilot.ps1` | `PARSE CLEAN` |

**What is NOT verified, stated plainly:** the ~12 lines of PowerShell glue have been parsed and read,
not executed. `Start-ScheduledTask -TaskName 'Bladefall Autopilot'` from an unattended run would
launch a second Claude session inside this one — the overlap lock would either skip it (proving
nothing) or the two would edit the same checkout. The first real scheduled run is the end-to-end
test; if the glue is wrong, `try/catch` logs `report failed:` and the run still ends green, because
a broken reporter must never be able to fail a run that passed its gate.

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
