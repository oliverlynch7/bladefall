# Skill Correctness Implementation Plan (sub-project B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every skill and passive in the game does what its own description says, verified by the harness rather than by reading the code.

**Architecture:** The harness from sub-project A already finds these. This plan fixes them, one bug per commit, each proven by the baseline shrinking. No new test machinery.

**Tech Stack:** The game is `public/3d/index.html` (one big IIFE). Tests are the existing `harness/` runners. Node 26, no npm install.

## Why this exists

Oliver, after a PvP match with a friend: *"there was a bunch of skills that didn't do what they said. Some of them said they would do damage and then didn't, or some of them said they would heal you and then didn't."*

This is `docs/VISION.md` priority #2 — class distinctiveness — and it fails at the most basic level: a class cannot feel distinct if its kit does not do what the tooltip promises.

## Global Constraints

- Work on branch `autopilot-merged`. Never `main`.
- Any change to `public/3d/index.html` must pass `node tools/gate.js`.
- **ONE BUG PER COMMIT.** A commit that fixes three skills cannot be reverted when one of them turns out wrong.
- **Never fix a skill by editing its DESCRIPTION to match broken behaviour.** The description is the promise; the code is what is broken. If a description is genuinely wrong about the design intent, stop and put it in `docs/SKILL_TRIAGE.md` for Oliver — that is a design decision, not a bug fix.
- Verify with `node harness/test-skills.js --classes <class>` before and after. The before-run must FAIL and the after-run must PASS, or the fix is unproven.
- `harness/` is ESM. Use `import`/`export`.
- The gate measures regression against `harness/baseline.json`. Fixing a baselined failure should SHRINK that file — which is the deliverable, not a side effect.

## The suspect, to be tested and not assumed

There are two dispatchers: `useSkill` (index.html ~10230) and `useSkillLegacy` (~10284). Oliver's own notes say the class-v2 rewrite converted RANGER and left the other fifteen classes on the legacy bridge. A skill whose v2 table carries the description while the legacy path carries the behaviour would produce exactly this symptom class.

That is a hypothesis with a plausible mechanism. It is **not** a finding. Task 2 tests it on a single skill before anyone edits anything.

---

### Task 1: Triage — which failures are real?

The current `harness/baseline.json` was recorded BEFORE the claim parser was fixed, so it is a mix of real bugs and artifacts. `harness/claims.js`'s own comments already name several as false: Blade Fury, Berserk and Stillness (buffs written without a number, read as damage), Shadow Bolt (`\bheal` matching the "heal" inside "health"), and all four Beastmaster entries (commanding a pet that is already out is not summoning). Acting on a stale list means fixing bugs that do not exist.

**Files:**
- Delete then regenerate: `harness/baseline.json`
- Create: `docs/SKILL_TRIAGE.md`

- [ ] **Step 1: Regenerate the baseline with the current parser**

```bash
rm -f harness/baseline.json && node harness/run-all.js
```

Expected: a fresh `harness/baseline.json`, and `GATE: PASS (baseline recorded — N known failures)`. N should be well below 15.

- [ ] **Step 2: Write the triage list**

Create `docs/SKILL_TRIAGE.md` with one row per surviving failure, taken from `harness/report.json`:

```markdown
# Skill triage — <date>

Regenerated from harness/report.json. Each row is a skill whose behaviour does not match its own
description, on a bench that proved it can measure the effect in question.

| class | skill | claims | its description | status |
|---|---|---|---|---|
| warrior | Charge | damage | "Rush forward, damaging and stunning enemies in your path" | confirmed, unfixed |
```

Fill one row per entry in the regenerated baseline. `status` starts as `confirmed, unfixed`.

- [ ] **Step 3: Commit**

```bash
git add harness/baseline.json docs/SKILL_TRIAGE.md
git commit -m "triage: regenerate the baseline against the fixed parser, and list what actually survives"
```

---

### Task 2: Fix warrior/Charge, and learn the mechanism

Charge is first because it is the most independently verified failure in the game: measured on a bench that was itself proven able to draw blood, Charge fires (it goes on cooldown) and deals zero damage to a grunt 60 units directly in front.

**Files:**
- Modify: `public/3d/index.html` (the Charge implementation)

- [ ] **Step 1: Confirm it still fails**

```bash
node harness/test-skills.js --classes warrior
```

Expected: `FAIL warrior/Charge claims damage`. If it passes, the parser or the bench changed — stop, and re-run Task 1 instead of hunting a bug that is not there.

- [ ] **Step 2: Find which dispatcher actually runs it**

```bash
grep -n "Charge\|war_charge" public/3d/index.html | head -20
```

Then confirm at runtime rather than by reading:

```bash
node _shot/shot.js --scene arena:flat --wait 12000 --eval "(function(){ __BF3.cheatUnlockClasses(); __BF3.cheatRank10All(); const s=__BF3.curSkills()[2]; return JSON.stringify({name:s.n, id:s.id, fx:s.fx, keys:Object.keys(s)}); })()"
```

Expected: the skill object as the game holds it. Its `id`/`fx` names the handler to read next. **There are duplicate function bodies in this file** — `AUTOPILOT.md` says so and it has burned five sessions — so after finding the handler, confirm the copy you are about to edit is the one that runs.

- [ ] **Step 3: Find where its damage should be applied and why it is not**

Read the handler. Compare against a skill in the SAME class that the harness reports as passing (Cleave claims damage and passes), because the difference between a working sibling and a broken one is usually the whole bug.

Write the finding into the commit message you will make in Step 6. If you cannot state a mechanism in one sentence, you have not found it yet — do not proceed to Step 4.

- [ ] **Step 4: Make the smallest change that addresses that mechanism**

One edit. No refactoring, no "while I'm here". Then:

```bash
node tools/gate.js
```

Expected: `OK   public/3d/index.html <script>`

- [ ] **Step 5: Prove it**

```bash
node harness/test-skills.js --classes warrior
```

Expected: no `FAIL warrior/Charge` line. If Charge now passes but something ELSE in warrior fails, you broke a sibling — revert and return to Step 3.

- [ ] **Step 6: Commit, and record the mechanism**

```bash
git add public/3d/index.html
git commit -m "warrior/Charge deals the damage it promises

<one sentence: what was actually wrong>

Was: fires, goes on cooldown, target takes nothing. Now: <what the harness reports>.
Verified with node harness/test-skills.js --classes warrior, failing before and passing after."
```

- [ ] **Step 7: Shrink the baseline**

```bash
node harness/run-all.js
```

Expected: a `FIXED: skills:warrior/Charge:damage` line and `GATE: PASS`. If the gate reports a REGRESSION instead, the fix broke something else — revert the commit and return to Step 3.

Then remove Charge's row from `docs/SKILL_TRIAGE.md`, or mark it `fixed <commit>`.

```bash
git add harness/baseline.json docs/SKILL_TRIAGE.md
git commit -m "baseline: warrior/Charge fixed, one fewer known failure"
```

---

### Task 3: Fix mage/Nova

Nova is the second independently confirmed one: "A freezing burst: damage + slow all around you" — it fires and deals nothing. It is an AoE where Charge is a dash, so if both share a cause, that cause is not about movement.

**Files:**
- Modify: `public/3d/index.html` (the Nova implementation)

- [ ] **Step 1: Confirm it still fails**

```bash
node harness/test-skills.js --classes mage
```

Expected: `FAIL mage/Nova claims damage`.

- [ ] **Step 2: Check whether Task 2's mechanism explains this one too**

If Task 2 found a shared mechanism (for example the legacy bridge dropping a damage call), test that hypothesis here FIRST — one grep, before any fresh investigation. A second instance of a known cause is a much cheaper fix than a new hunt, and it also tells you the cause is systemic rather than a one-off, which changes what the rest of this plan is worth.

If it does not explain Nova, investigate as in Task 2 Step 3: read the handler, compare against a passing sibling in the same class.

- [ ] **Step 3: Make the smallest change, gate it**

```bash
node tools/gate.js
```

Expected: `OK   public/3d/index.html <script>`

- [ ] **Step 4: Prove it**

```bash
node harness/test-skills.js --classes mage
```

Expected: no `FAIL mage/Nova` line, and nothing else in mage newly failing.

- [ ] **Step 5: Commit and shrink the baseline**

```bash
git add public/3d/index.html
git commit -m "mage/Nova deals the damage it promises

<one sentence: what was actually wrong, and whether it is the same cause as Charge>"
node harness/run-all.js
git add harness/baseline.json docs/SKILL_TRIAGE.md
git commit -m "baseline: mage/Nova fixed, one fewer known failure"
```

---

### Task 4: Work the rest of the triage list, one bug per commit

Every remaining row in `docs/SKILL_TRIAGE.md`, taken in the order it appears. Each one repeats the same seven steps as Task 2, in full — they are written out there.

**Files:**
- Modify: `public/3d/index.html`
- Modify: `docs/SKILL_TRIAGE.md`

- [ ] **Step 1: Take the top unfixed row and confirm it still fails**

```bash
node harness/test-skills.js --classes <that row's class>
```

Expected: the FAIL line for that skill. If it passes, mark the row `was an artifact, no longer reported` and take the next row — do not go looking for a bug the harness no longer sees.

- [ ] **Step 2: Find the mechanism before editing**

Read the handler. Compare against a passing sibling in the same class. Test any mechanism already found in Tasks 2 and 3 first. State it in one sentence or keep looking.

- [ ] **Step 3: Smallest change, then the syntax gate**

```bash
node tools/gate.js
```

Expected: `OK   public/3d/index.html <script>`

- [ ] **Step 4: Prove it, then commit that ONE fix**

```bash
node harness/test-skills.js --classes <that row's class>
git add public/3d/index.html
git commit -m "<class>/<skill> does what it promises

<one sentence: the mechanism>"
```

- [ ] **Step 5: Shrink the baseline and mark the row**

```bash
node harness/run-all.js
git add harness/baseline.json docs/SKILL_TRIAGE.md
git commit -m "baseline: <class>/<skill> fixed"
```

- [ ] **Step 6: Repeat from Step 1 until no unfixed rows remain**

One run of the autopilot will not finish the list, and it does not need to. Each pass through Steps 1–5 is a complete, revertible unit of work, so stopping between them is always safe.

---

### Task 5: Passives, which nothing has checked yet

`test-skills.js` covers active skills. Passives are `kind:'passive'` entries in the rank tables and are never cast, so the current probe never exercises them — meaning "every passive does what it says" is currently unverified rather than verified.

**Files:**
- Modify: `harness/test-skills.js`
- Test: `node harness/test-skills.js --classes warrior`

- [ ] **Step 1: Find how a passive is chosen and applied**

```bash
grep -n "kind:'passive'" public/3d/index.html | head -10
```

Then read `classState` and whichever function reads those entries, to learn how a passive is selected at runtime.

- [ ] **Step 2: Extend the probe to snapshot stats with the passive off, then on**

A passive claims a stat change, so the assertion is a before/after on the stat it names — the same shape as the buff check that already works. Reuse `claimsOf` for the claim; do not invent a second parser.

- [ ] **Step 3: Prove the new assertion can FAIL**

Temporarily break one passive in the game file, run the tester, confirm it reports that passive. Restore the file with `git checkout -- public/3d/index.html`.

An assertion nobody has watched fail is an assertion nobody should believe — this harness has already shipped two of those (the multiplayer probe that asserted on its own assignment, and the geometric audit that passed an unwalkable tower).

- [ ] **Step 4: Commit**

```bash
git add harness/test-skills.js
git commit -m "harness: passives are checked too, and the check was proven able to fail"
```

- [ ] **Step 5: Re-baseline and hand the new findings to the triage list**

```bash
node harness/run-all.js
```

Any newly reported passive failures get rows in `docs/SKILL_TRIAGE.md` and are then worked through Task 4.

---

## When this plan is done

`docs/SKILL_TRIAGE.md` has no unfixed rows, and `harness/baseline.json` contains no `skills:` entries. At that point every skill and passive in all sixteen classes does what its description says, and the next plan is sub-project C (level completability — `The Abyss/quest:ab1` is already known) or D (per-peer multiplayer rigs).

## Self-Review

**Spec coverage.** The programme spec's sub-project B asks for every class, every skill, every passive. Tasks 1–4 cover actives via the existing tester; Task 5 adds passives, which the tester genuinely does not cover today.

**Placeholder scan.** Task 4 is a loop rather than N enumerated tasks because the list is not known until Task 1 runs. Its steps are written in full rather than referring back, and the commands are exact.

**Type consistency.** `node harness/test-skills.js --classes <class>` matches the CLI in `test-skills.js`. `node harness/run-all.js` writes `harness/report.json` and `harness/baseline.json` and prints `FIXED:`/`REGRESSION:` lines, which is what Steps 7/5 read.

**Risk carried forward.** If Task 1 regenerates the baseline and almost nothing survives, that is a real outcome and not a failure of this plan — it would mean the reported bugs were mostly parser artifacts, and the honest next move is to re-test in a live PvP match with Oliver rather than to go hunting for bugs the harness cannot see.
