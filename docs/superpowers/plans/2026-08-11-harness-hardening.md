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

- [ ] **Step 1: Reproduce the flap and prove it is geometry**

Run the bladedancer class ten times and count the verdicts:

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do node harness/test-skills.js --classes bladedancer 2>&1 | tail -1; done
```

Expected: a mix of `5 pass, 0 fail` and `4 pass, 1 fail`. If it is stable ten times, the flap has another cause — record that and stop rather than changing geometry on a guess.

- [ ] **Step 2: Measure the reach the bench actually needs**

The bench spawns its target at `p.z - 60`. A lunge that carries 55 units lands 5 short, and whether it connects depends on where the dummy has walked. Probe the real reach of every skill the bench casts:

```bash
node _shot/shot.js --scene arena:flat --wait 12000 --eval "(function(){ __BF3.cheatUnlockClasses(); __BF3.cheatRank10All(); __BF3.meta.classId='bladedancer'; const p=__BF3.G.p; const out=[]; const sk=(__BF3.c2CurSkills?__BF3.c2CurSkills():__BF3.curSkills())||[]; for(let i=0;i<sk.length;i++){ if(!sk[i]) continue; const z0=p.z; __BF3.useSkill(i); for(let k=0;k<120;k++) __BF3.update(1/60); out.push({n:sk[i].n, moved:Math.round(z0-p.z)}); } return JSON.stringify(out); })()"
```

Expected: per-skill travel distances. The bench distance must be **less than the shortest lunge**, not more.

- [ ] **Step 3: Make the target distance a named constant and shorten it**

One constant in `test-skills.js`, used by BOTH `BASELINE` and `PROBE` — they must never diverge, which is already written into the file's comments. Set it under the shortest measured lunge (30 is safely inside every value seen so far). Freeze the dummy so it cannot walk out of range: set its speed to 0 after spawn.

- [ ] **Step 4: Prove the flap is gone**

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do node harness/test-skills.js --classes bladedancer 2>&1 | tail -1; done
```

Expected: ten identical lines. Anything else means the cause was not geometry — revert and record.

- [ ] **Step 5: Re-baseline, alone, and commit**

```bash
rm -f harness/baseline.json && node harness/run-all.js
git add harness/test-skills.js harness/baseline.json
git commit -m "harness: the bench put its target beyond some lunges, so verdicts depended on where the dummy wandered"
```

Note in the message which baseline entries appeared or disappeared, since a distance change moves every class.

---

### Task 2: A red gate must never delete work

Even with the flap fixed, `git checkout -- .` is the wrong answer to a red gate: it destroys the evidence of what went wrong.

**Files:**
- Modify: `autopilot.ps1`

- [ ] **Step 1: Replace the destructive revert with a stash**

Find the GREEN GATE block. Replace `git checkout -- .` with a stash that keeps the work:

```powershell
git stash push -u -m "autopilot gate-red $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -- . ':(exclude).claude/'
```

The `':(exclude).claude/'` is not optional — `-u` sweeps untracked files and the permission allowlist lives there. That mistake took the autopilot down for fourteen consecutive runs once already.

- [ ] **Step 2: Say so loudly**

Log the stash name and the gate's own failure lines, so a red gate leaves a readable trail rather than a silent revert.

- [ ] **Step 3: Verify** — **BLOCKED, and the block is one permission. Measured 2026-08-12.**

```powershell
powershell -NoProfile -Command "$errs=$null; [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path autopilot.ps1),[ref]$null,[ref]$errs); if($errs.Count){$errs}else{'PARSE CLEAN'}"
```

Expected: `PARSE CLEAN`.

**An unattended run cannot execute this.** `powershell` is not on the autopilot's permission
allowlist in any form — even `powershell -NoProfile -Command "1+1"` comes back
*"This command requires approval"* — so a run can edit `autopilot.ps1` and then has no way to check
that what it wrote still parses. There is no substitute: `node tools/gate.js` parses `index.html` and
the ES modules, and nothing in this repo parses PowerShell.

**Steps 1 and 2 were written in full on 2026-08-12 and then REVERTED unverified**, per this repo's
standing rule that unverifiable work is worse than no work. The stakes are why the rule wins here
rather than being argued with: an `autopilot.ps1` that does not parse stops the automation
completely, and it would do so on the next scheduled run, unattended, with the previous run's log
already written and green. What was reverted is one `$gateOut = & node harness/run-all.js 2>&1`, a
`Where-Object` filter for the gate's own `REGRESSION|GATE:|FAIL` lines into `Log`, and the same
`git stash push -u -m … -- . ':(exclude).claude/'` the killed-run guard at line 130 already uses.

**Two ways to unblock it, both Oliver's and both one line:**
1. Add `powershell -NoProfile -Command` to `.claude/settings.json`'s allow list, after which an
   autopilot run can take this task normally; or
2. apply Task 2 in a supervised session, where the parse check runs by hand.

A comment recording this now sits at the `git checkout -- .` site itself (`autopilot.ps1:239`), so
the next run finds it where the hazard is rather than only in this plan.

- [ ] **Step 4: Commit**

```bash
git add autopilot.ps1
git commit -m "autopilot: a red gate stashes the work instead of destroying it"
```

---

### Task 3: Make the automation say what it did

The only Telegram ping is a failure alert, so a healthy run is indistinguishable from no run at all without reading the log. Oliver has asked twice what it has been up to.

**Files:**
- Modify: `autopilot.ps1`

- [ ] **Step 1: Build a one-line summary at the end of a green run**

After the gate passes, collect: the number of commits this run made (`git rev-list --count` against the SHA captured at run start), the gate's own summary line, and the count of entries in `harness/baseline.json`.

- [ ] **Step 2: Send it on the existing channel**

Reuse the `thework.pages.dev/state` `tgPing` call already in the file. Send at most once per run, and only when the run actually committed something — a run that correctly found nothing to do should stay quiet, or the channel becomes noise and gets muted.

- [ ] **Step 3: Verify by running one cycle manually**

```powershell
Start-ScheduledTask -TaskName 'Bladefall Autopilot'
```

Then read the tail of `_autopilot.log` and confirm a summary line was produced.

- [ ] **Step 4: Commit**

```bash
git add autopilot.ps1
git commit -m "autopilot: report what a run actually did, not only when it breaks"
```

---

## Self-Review

**Spec coverage.** Covers the flap named in `SKILL_TRIAGE.md` section F, the destructive revert it makes dangerous, and the silence Oliver has raised twice.

**Placeholder scan.** Every step has an exact command and an expected result. Task 1 Step 1 has an explicit "if it does not reproduce, stop" branch rather than assuming the cause.

**Risk carried forward.** Task 1 changes bench geometry and therefore re-baselines all sixteen classes; entries may appear as well as disappear. That is why it is alone in its own run and why the commit message must record the delta.
