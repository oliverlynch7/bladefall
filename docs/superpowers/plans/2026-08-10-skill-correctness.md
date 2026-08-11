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

#### Passes completed

One line per pass, so the next run can see what has been taken without re-reading the triage list.

| pass | row | commit | how it was proven |
|---|---|---|---|
| 1 | **B — berserker Headlong flew forever** | `6e37943` | `harness/probes/headlong.probe.js`, fail before / pass after, plus an A/B render |
| 2 | **A — nine skills had no handler at all** | `5339f48` | the `dead handler` assertion, watched to fail nine times; `SKILL_FX` typeof sweep; a render of Ball Lightning landing 15 hits |
| 3 | **F — the bench itself flapped** | `a724d69` | `harness/probes/riposte.probe.js`, A/B in one launch: 2/3 missed raw, 0/3 with the pose restored |
| 4 | **E — `st_ward` (Storm Ward) was never read** | this run | `harness/probes/stward.probe.js`, A/B in one launch: `sameEitherWay:true` before, `21 / 0` after; `KNOWN_DEAD` 46 → 45 |

**Pass 4 opened section E, and choosing WHICH row mattered more than the fix did.** The obvious
target was the Stormcaller — seven dead passives of eight, the worst-hit class in the game. Costing
it first is what stopped it being started: six of those seven modify a **chain** that does not exist
anywhere in the game (`SKILL_FX.st_bolt` is the mage's single-target bolt; nothing in `public/`
chains, arcs or leaps between targets). So the Stormcaller is one mechanic, not seven passives, and
it belongs to a run that can finish it. Full measurement in `docs/SKILL_TRIAGE.md` section E.

`st_ward` was taken instead because it is the one row in that class that needs neither a new
mechanic nor an invented number: mage `m_ward` and warlock `war_shield` implement the identical
sentence at the identical 4%, eight lines apart in the same function. **A row's loudness is not its
readiness** — the same lesson pass 1 recorded from the other direction, where the loudest row
(berserker Charge) contained one fault the harness could see and one it never can.

**And the origin of all 46 is now known**, which was an open question when section E was written:
`81ea3fc` rewrote twenty-five passive descriptions and stripped the placeholder `+12% damage`
multipliers that implemented the old ones, in the same commit, without landing the new mechanics.
The orphaned comments are still in `effPower`. The rule that falls out — **a description rewrite and
its implementation ship together, or the game ships the promise without the thing** — is the same
fault as section A and section F wearing different clothes.

**Pass 3 was a BENCH bug, and taking it before any more game work was the right order.** Section F
was not a skill that lies; it was a skill whose verdict depended on what the *previous* skill left
on the player, so the same code returned `5 pass, 0 fail` and `4 pass, 1 fail` from consecutive
runs. That shape is more dangerous than a wrong verdict: a *new* hard failure is what `run-all.js`
calls a REGRESSION, and `autopilot.ps1` answers a red gate with `git checkout -- .`, so a flapping
assertion here can delete a run's verified work rather than merely mis-report it. **Every row taken
after this one is measured on a bench that isolates the player as well as the target**, which no
earlier row was — so a row that changes verdict at the next re-baseline is not necessarily a
regression, and the re-baseline in this pass is the new reference.

**Pass 1's proof did NOT come from `test-skills.js`, and that is the point worth carrying forward.**
The harness reports `berserker/Charge:damage`, and the damage half is Oliver's design call — so the
suite's verdict on this row cannot move whether the bug is fixed or not, and waiting for it to would
have meant either leaving a game-breaking fault in place or editing the description to make a green
light appear. The runaway timer needed its own measurement, and it got one: a committed probe with a
kinematic bar (six frames after the window — did the body still move) that was watched to fail
against the unfixed game before it was believed. **A triage row can contain more than one fault, and
only some of them are the harness's to see.**

---

### Task 3: Passives, which nothing has checked yet

`test-skills.js` covers active skills. Passives are `kind:'passive'` entries in the rank tables and are never cast, so the current probe never exercises them — meaning "every passive does what it says" is currently unverified rather than verified.

**Files:**
- Create: `harness/audit-passives.js`, `harness/test/passives.test.js`
- Test: `node --test harness/test/passives.test.js`

- [x] **Step 1: Find how a passive is chosen and applied** — done.

A passive is offered at ranks 3/5/7/9 by `openClassChoice`, stored in `classState(cls).ch[rank]`
(`index.html:9944`), and reaches the game through exactly one door: `c2Passive('<id>')` at 9945,
called with a literal id at 124 sites. Nothing else consults `ch`. So "is this passive wired" is
answerable
by asking whether any line outside the choice menu mentions its id — which is a STATIC question, and
that changed what this task should build first.

- [x] **Step 2: Extend the probe** — done as a **wiring audit**, not the stat snapshot this step
      describes, and the reason is the finding.

The plan's shape was a before/after stat snapshot per passive. That is 124 passives × two game
states, and at the measured cost of a launch it does not fit in any run. It is also the wrong first
question, because the answer to the cheap question turned out to be: **46 of the 124 passives are
never read by any code at all.** A stat snapshot of a passive nothing consults measures the noise
floor and reports "no change" — the same accusation for a dead passive, a mis-implemented one and a
correctly-implemented one whose stat the probe guessed wrong.

`harness/audit-passives.js` parses `CLASS2` for every `kind:'passive'` entry, blanks out `CLASS2`
itself and the `PASSIVE_ART` icon table (which names all 124 ids and would otherwise make every
passive look wired forever), and reports any id nothing in the remaining source mentions. Static, no
browser, runs in 100ms, so it joins the unit tests `run-all.js` runs before it spends GPU time.

**Result: 124 total, 78 wired, 46 dead**, across twelve of the sixteen classes — the Stormcaller
missing seven of its eight passives, the Monk, Pirate and Ranger six each. Full table and the
class-by-class breakdown in `docs/SKILL_TRIAGE.md` section E.

The stat-snapshot half of this step is NOT done and is deliberately left open: this proves WIRED, not
CORRECT, and a passive read once and read wrongly still passes. It is the right next piece of work
once the 46 are down, and it is much cheaper then, because it only has to run against passives that
have a reader to exercise.

- [x] **Step 3: Prove the new assertion can FAIL** — done, twice, and neither way requires breaking
      the repo.

A miniature `CLASS2` + `PASSIVE_ART` + one line of game code lives in the test file, with one passive
read and one not. Six unit tests assert the audit separates them, that `PASSIVE_ART` does not count
as a reader, and that `CLASS2` does not either — if any of those regressed the audit would go green
and stay green regardless of the game. And the real-game assertion was watched to fail for real: with
`KNOWN_DEAD` empty it named all 46 with their descriptions.

The 46 are recorded as a **ratchet checked in both directions** — a newly dead passive fails the
gate, and a passive that becomes wired must be removed from the list or the test says so, because a
one-directional ratchet stops describing the game the moment anything is fixed.

- [x] **Step 4: Commit** — `harness/audit-passives.js`, `harness/test/passives.test.js`,
      `docs/SKILL_TRIAGE.md` section E.

- [ ] **Step 5: Re-baseline and hand the new findings to the triage list**

The 46 rows are in `docs/SKILL_TRIAGE.md` section E and are worked through Task 2, one commit at a
time; each fix takes an id out of `KNOWN_DEAD`. Nothing else re-baselines here — the audit is a unit
test, so it lives in `run-all.js`'s fast stage and never touches `harness/baseline.json`.

---

## When this plan is done

`docs/SKILL_TRIAGE.md` has no unfixed rows, and `harness/baseline.json` contains no `skills:` entries. At that point every skill and passive in all sixteen classes does what its description says, and the next plan is sub-project C (level completability — `The Abyss/quest:ab1` is already known) or D (per-peer multiplayer rigs).

## Self-Review

**Spec coverage.** The programme spec's sub-project B asks for every class, every skill, every passive. Tasks 1–2 cover actives via the existing tester; Task 3 adds passives, which the tester genuinely does not cover today.

**Placeholder scan.** Task 2 is a loop rather than N enumerated tasks because the list is not known until Task 1 runs, and because naming targets in advance is exactly how this plan's first draft came to open with a bug that did not exist. Its steps are written in full and the commands are exact.

**Type consistency.** `node harness/test-skills.js --classes <class>` matches the CLI in `test-skills.js`. `node harness/run-all.js` writes `harness/report.json` and `harness/baseline.json` and prints `FIXED:`/`REGRESSION:` lines, which is what Steps 7/5 read.

**Risk carried forward.** If Task 1 regenerates the baseline and almost nothing survives, that is a real outcome and not a failure of this plan — it would mean the reported bugs were mostly parser artifacts, and the honest next move is to re-test in a live PvP match with Oliver rather than to go hunting for bugs the harness cannot see.
