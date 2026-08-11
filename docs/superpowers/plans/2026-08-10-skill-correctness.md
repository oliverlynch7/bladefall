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

## The two-list trap, which has already burned this suite once

There are two skill lists and two dispatchers. `curSkills()` reads the legacy `CLASSES` kit
(index.html:2353); `useSkill` branches on `c2def()` and, because ALL SIXTEEN classes have a CLASS2
tree, always casts `c2CurSkills()[i]` (10311, 9948) — a different list at the same index.

The first version of `test-skills.js` read names and descriptions from one and cast from the other,
so every verdict it produced named a skill it had never cast: warrior index 2 read "Charge" and cast
Iron Guard, mage index 1 read "Nova" and cast Blink. Four reported bugs and sixty-two reported
passes were all equally unfounded. Fixed in `faf52c3` by reading from the list that gets cast.

Task 2 Step 2 re-checks this per class rather than trusting it once, because it is the single
cheapest way for this whole plan to be measuring nothing while looking productive.

---

### Task 1: Triage — which failures are real?

The current `harness/baseline.json` was recorded BEFORE the claim parser was fixed, so it is a mix of real bugs and artifacts. `harness/claims.js`'s own comments already name several as false: Blade Fury, Berserk and Stillness (buffs written without a number, read as damage), Shadow Bolt (`\bheal` matching the "heal" inside "health"), and all four Beastmaster entries (commanding a pet that is already out is not summoning). Acting on a stale list means fixing bugs that do not exist.

**Files:**
- Delete then regenerate: `harness/baseline.json`
- Create: `docs/SKILL_TRIAGE.md`

- [x] **Step 1: Regenerate the baseline with the current parser** — done, and **the parser was not
      the only thing that had to be fixed first.** Regenerating against the bench as it stood would
      have recorded eight rows of which four were artefacts, so this step turned into repairing the
      bench and only then recording. Four faults, each found by measurement:

  1. **It cast off-class.** `useSkill` calls `fx(p, classFamilyOk(p.weapon), am)` and a great many
     handlers gate their defining half on that argument (`harvest`'s heal is `if(hit && ok)`). The
     bench swapped `meta.classId` and left the Arena's Keen Legendary **sword** in hand. Probed for
     all sixteen classes in one launch: **eleven were casting off-class** — ranger, mage, reaper,
     necromancer, berserker, chronomancer, monk, stormcaller, warlock, skylancer, beastmaster. The
     game HARD BLOCKS that state (`index.html:13220`), so the bench was the only thing in the world
     that could stand there. Fixed by equipping through the game's own `classStartWeapon()`.
  2. **It read protection from one field on one body** — `p.shieldHp` only, missing `p.guardT` (the
     brace, `11155`) and the companion's `pet.shieldHp` (`10111`).
  3. **It read the cooldown five seconds after the cast**, so once the window grew to 5s every skill
     with a cooldown of 5s or less reported `onCd:false` and failed every control and buff claim.
  4. **It sometimes measured a PAUSED game.** ~1 launch in 6 arrives in `mode:'pause'`, and
     `useSkill` returns on that guard *without spending a cooldown* — four skills that "fired and
     changed nothing", indistinguishable from four real bugs. The probe now logs the mode at every
     phase, knocks on the game's own resume door, and the suite re-runs a class whose bench is known
     to have measured nothing.

  Two further corrections, both to changes made in this same step:
  - **A drift control must not be subtracted inside the FAIL bar.** It was, and it immediately
    invented two bugs — `reaper/Reap` and `paladin/Last Stand`, both of which visibly heal — because
    the noise floor is made of the class's own passive healing (the warrior heals **238** unprompted
    in 5s; the beastmaster's pet takes **165** off the dummy with nothing cast). Drift now only
    downgrades a met claim to *unproven*, never to *failed*.
  - **The rig test has to run LAST.** `playerAttack` leaves the swing chain running, so a control
    window placed after it measured a player mid-combo with lifesteal.

  Result: **67 pass / 6 fail / 2 unproven**, from 8 baselined failures of which four were artefacts.

- [x] **Step 2: Write the triage list** — `docs/SKILL_TRIAGE.md`, four sections.

Create `docs/SKILL_TRIAGE.md` with one row per surviving failure, taken from `harness/report.json`:

```markdown
# Skill triage — <date>

Regenerated from harness/report.json. Each row is a skill whose behaviour does not match its own
description, on a bench that proved it can measure the effect in question.

| class | skill | claims | its description | status |
|---|---|---|---|---|
| paladin | Taunt | shield | "<its real description, copied from the game>" | confirmed, unfixed |
```

Fill one row per entry in the regenerated baseline. `status` starts as `confirmed, unfixed`.

**What it actually contains, so Task 2 has its targets without re-reading the whole file:**

- **A. NINE skills have no handler at all, and it is ONE ordering fault.** `SKILL_FX` is built by
  aliasing and five alias lines sit above the definitions they copy, so each stores `undefined`:
  `necro_grip`, `nin_step`, `st_lance`, `st_orb`, `st_overload`, `pir_spike`, `chr_beam`,
  `chr_gravity`, `chr_overload`. `useSkill` does `fx ? fx(...) : null`, so the cast spends mana and
  cooldown and does nothing. Three are in the default rank-10 build (ninja Shadow Step, chronomancer
  Time Warp, stormcaller Ball Lightning); the Stormcaller has **three of eight skills dead**. This
  is the closest match in the game to Oliver's report and it is the obvious first Task 2 target.
- **B. Berserker Charge flies forever.** `_headlongT` is set to 0.9 at 18762 and appears four times
  in the file; nothing decrements it, so the body is driven at 760 u/s in a straight line for the
  rest of the run. The missing damage is a design call; the runaway timer is not.
- **C. Two stale descriptions** (mage Attunement, ranger Tumble) — Oliver's, per this plan's own
  "never fix a skill by editing its description" rule.
- **D. Three classes cannot equip their own starting weapon** (berserker, pirate, beastmaster) —
  starting-gear balance, so Oliver's, but the beastmaster is plainly a missing `CLASSSTART` entry.

- [x] **Step 3: Commit**

```bash
git add harness/baseline.json docs/SKILL_TRIAGE.md
git commit -m "triage: regenerate the baseline against the fixed parser, and list what actually survives"
```

---

### Task 2: Work the triage list, one bug per commit

**This task is a LOOP.** One pass = one bug = one commit. Finishing a single pass and stopping is a
complete, revertible unit of work, so it is always safe to stop between passes.

There is deliberately no named first bug here. An earlier draft of this plan opened with "fix
warrior/Charge, the most independently verified failure in the game" — and Charge was never broken.
The bench that produced that verdict read skill names from `curSkills()` and cast from
`c2CurSkills()`, two different lists, so it had never cast the skill it was naming (`faf52c3`).
Naming a target in a plan gives it an authority the evidence did not have. **The triage list
produced by Task 1 is the only source of targets.**

**Files:**
- Modify: `public/3d/index.html`
- Modify: `docs/SKILL_TRIAGE.md`

- [ ] **Step 1: Take the top unfixed row and confirm it still fails**

```bash
node harness/test-skills.js --classes <that row's class>
```

Expected: the FAIL line naming that skill. If it passes, mark the row `no longer reported` and take
the next row — never go hunting a bug the harness cannot currently see.

- [ ] **Step 2: Confirm the bench is casting the skill it names**

```bash
node _shot/shot.js --scene arena:flat --wait 12000 --eval "(function(){ __BF3.cheatUnlockClasses(); __BF3.cheatRank10All(); __BF3.meta.classId='<class>'; const a=(__BF3.c2CurSkills?__BF3.c2CurSkills():[]).map(s=>s&&s.n); const b=(__BF3.curSkills()||[]).map(s=>s&&s.n); return JSON.stringify({casts:a, reads:b}); })()"
```

Expected: `casts` and `reads` agree at the index under test. They did not before `faf52c3`, and that
one mismatch invalidated every verdict the suite had ever produced — 62 passes as well as 4
failures. Re-check it per class rather than trusting it once.

- [ ] **Step 3: Find the mechanism before editing anything**

Read the handler. Compare against a skill in the SAME class that the harness reports as passing —
the difference between a working sibling and a broken one is usually the whole bug.

`public/3d/index.html` has duplicate function bodies; `AUTOPILOT.md` says so and it has burned five
sessions. After finding a handler, confirm the copy you are about to edit is the one that runs
(`__BF3.G._scapeTable` for scapes; for skills, check `c2def()` / `c2CurSkills` vs the legacy table).

State the mechanism in one sentence. If you cannot, you have not found it — do not edit.

- [ ] **Step 4: Make the smallest change, then gate it**

```bash
node tools/gate.js
```

Expected: `OK   public/3d/index.html <script>`

- [ ] **Step 5: Prove it — fail before, pass after**

```bash
node harness/test-skills.js --classes <that row's class>
```

Expected: no FAIL line for that skill, and nothing else in the class newly failing. If a sibling
broke, revert and return to Step 3.

- [ ] **Step 6: Commit that ONE fix**

```bash
git add public/3d/index.html
git commit -m "<class>/<skill> does what it promises

<one sentence: the mechanism>

Verified with node harness/test-skills.js --classes <class>, failing before and passing after."
```

- [ ] **Step 7: Shrink the baseline, mark the row, repeat**

```bash
node harness/run-all.js
```

Expected: a `FIXED: skills:<class>/<skill>:<claim>` line and `GATE: PASS`. A `REGRESSION:` line means
the fix broke something else — revert the commit and return to Step 3.

```bash
git add harness/baseline.json docs/SKILL_TRIAGE.md
git commit -m "baseline: <class>/<skill> fixed"
```

Then return to Step 1 with the next unfixed row.

---

### Task 3: Passives, which nothing has checked yet

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

Any newly reported passive failures get rows in `docs/SKILL_TRIAGE.md` and are then worked through Task 2.

---

## When this plan is done

`docs/SKILL_TRIAGE.md` has no unfixed rows, and `harness/baseline.json` contains no `skills:` entries. At that point every skill and passive in all sixteen classes does what its description says, and the next plan is sub-project C (level completability — `The Abyss/quest:ab1` is already known) or D (per-peer multiplayer rigs).

## Self-Review

**Spec coverage.** The programme spec's sub-project B asks for every class, every skill, every passive. Tasks 1–2 cover actives via the existing tester; Task 3 adds passives, which the tester genuinely does not cover today.

**Placeholder scan.** Task 2 is a loop rather than N enumerated tasks because the list is not known until Task 1 runs, and because naming targets in advance is exactly how this plan's first draft came to open with a bug that did not exist. Its steps are written in full and the commands are exact.

**Type consistency.** `node harness/test-skills.js --classes <class>` matches the CLI in `test-skills.js`. `node harness/run-all.js` writes `harness/report.json` and `harness/baseline.json` and prints `FIXED:`/`REGRESSION:` lines, which is what Steps 7/5 read.

**Risk carried forward.** If Task 1 regenerates the baseline and almost nothing survives, that is a real outcome and not a failure of this plan — it would mean the reported bugs were mostly parser artifacts, and the honest next move is to re-test in a live PvP match with Oliver rather than to go hunting for bugs the harness cannot see.
