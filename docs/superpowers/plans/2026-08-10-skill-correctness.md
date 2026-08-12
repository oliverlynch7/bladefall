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
| 3 | **F — the bench itself flapped** | `2026-08-11` | `harness/probes/riposte.probe.js`, A/B in one launch: 2/3 missed raw, 0/3 with the pose restored |
| 4 | **E — stormcaller Storm Ward was never read** | `f75c81e` | `harness/probes/stward.probe.js`, A/B in one launch: shield 0 before, 4% of max HP after, control 0 both times |
| 5 | **E — berserker Thick Hide was never read** | `3934095` | `harness/probes/thickhide.probe.js`, four trials in one launch: all four died before, 1 HP / dead / 1 HP after; HUD photographed at `HP 1/477, Deaths 2` |
| 6 | **G — picking Frenzy hard-locked the game** | `7122bd9` | `harness/probes/frenzy.probe.js`, A/B on the same rank in one launch: the game's own frame counter stops dead (`lastSecond 0`) before, keeps climbing after |
| 7 | **E — paladin Bounce Back was never read** | `9575959` | `harness/probes/bounce.probe.js`, A/B in one launch: attacker lost 0 before and 57 after, player took 20 in BOTH — so the reflect was added, not the block weakened |
| 8 | **E — monk Flow was never read** | `645058b` | `harness/probes/monkflow.probe.js`, A/B in one launch: the dodge cut ratio was 1 before and exactly 2 after |
| 9 | **E — chronomancer Potent was never read** | `7784f09` | `harness/probes/chrpotent.probe.js`, A/B in one launch: the rewind ring recorded no mana at all before (`past: null` on both halves), the whole pool came back on the potent half after while the control stayed at 0 |
| 10 | **E — monk Killer Focus was never read** | `2ac076e` | `harness/probes/monkiller.probe.js`, A/B in one launch with TWO strikes per half: ratio 1.009 on all four before, exactly 3 then exactly 1 after |
| 11 | **E — ranger Ambusher was never read** | `140c541` | `harness/probes/ambush.probe.js`, A/B in one launch with THREE strikes per half (one per clause of the card): all six 115 before; 138/115/115 against a 115/115/115 control after |
| 12 | **E — reaper Harvested Strength was never read** | `8870192` | `harness/probes/soulfree.probe.js`, A/B in one launch with THREE trials per half (one per clause of the card): all six casts paid full price before; 0, then full price, then a cast on an empty bar after. Reaper suite 6 pass / 0 fail either side |
| 14 | **E — skylancer Hunter's Eye was never read** | this run | `harness/probes/skyeye.probe.js`, A/B in one launch with TWO strikes per half (one falling, one rising, because "while falling" is half the sentence): all three halves went vy −100 → −55 with no heading before; the passive half −360 at aim exactly 1.0 on the foe after, while the control and both rising strikes stayed put and all four damage readings were 168. Skylancer suite 4 pass / 0 fail either side |
| 15 | **E — paladin Burning Light was never read** | this run | `harness/probes/palburn.probe.js`, THREE halves in one launch, each carrying TWO clusters (one around the Sworn target, one around a foe deliberately not sworn) so both conditions on the card have a control inside their own half: nothing lit anywhere in the control or the known-bad half; 1 stack, heat 1293 and 139 HP burned off the Sworn target's neighbour in the passive half, with the unsworn cluster and the out-of-radius foe untouched. **The first wiring was wired, lit the right enemy, and burned nothing** — see below. Paladin suite 7 pass / 0 fail after |
| 16 | **E — skylancer Sky Armor was never read** | this run | `harness/probes/skyarmor.probe.js`, THREE halves in one launch with TWO hits per half, each from its own fresh jump: control 62 early and 62 late, the passive half 0 early (invuln 0.18, the dodge's own window verbatim) and 62 late — so the window opens AND closes — and the known-bad half 62 both times. Skylancer suite 4 pass / 0 fail after |
| 13 | **E — ranger Bounty Hunter was never read** | `f693c69` | `harness/probes/bounty.probe.js`, THREE halves in one launch, each measuring a MARKED foe against an UNMARKED one so the mark is what is under test: control 623/623 damage, 0/0 heal, 550/550 gold; passive 573/623, 19/0, 605/550. Ranger suite 4 pass / 1 fail either side, the fail being the baselined `ranger/Tumble` stale description (section C, Oliver's) |

**THE AGGREGATE GATE RAN, 2026-08-11, and it says what passes 5–8 claimed it would: `GATE: PASS
(3 known, 0 newly fixed)`, exit 0, no `REGRESSION:` line.** Nothing in `harness/baseline.json` moved —
the three knowns are still `ranger/Tumble`, `mage/Attunement` and `berserker/Charge:damage`, all three
of them section C/B design calls that belong to Oliver. Per-suite: unit 27/27, **skills 70 pass / 3
fail / 2 unproven** (65/8/2 at the last re-baseline, so six of the eight have gone), levels 35/0/13,
mp skipped. The four class-gated wirings did not disturb anything outside their class, which is
exactly the claim that was outstanding.

*Two things it also reported, neither a regression and both already predicted by this document.*
Levels moved 36/0/12 → 35/0/13: that is the den-less head-count Task 4 records as flapping — a live
population snapshot, correctly routed to `unproven` rather than to a verdict, which is the whole point
of that fix. And **`mp: skipped (not written yet)`**, which is worth a look next run: sub-project A's
Task 5 records `harness/test-mp.js` as shipped and green at 16/0, so either the module is not where
`run-all.js` looks for it or the skip is stale. A suite that silently reports "not written yet" for
something that IS written is the same green-light-that-cannot-go-red shape this harness exists to
prevent, one level up. Not chased in this run — it is a harness question, not a skill one.

**Superseded, kept for the record — what the run before this one asked for:** Passes 5–8 shipped on 2026-08-11
verified per pass and per class — the fast unit stage (27 tests, the same stage `run-all.js` runs
before it spends GPU time), a committed A/B probe watched to fail against the unfixed game, and
`test-skills.js --classes <the touched class>` either side — but **the full aggregate gate has not run
since `f75c81e`.** At the measured cost of a launch it is a ~40-minute job against a run that is
killed on a 20-minute clock, so four verified commits were the better use of the window than one
commit plus a gate. Nothing in `harness/baseline.json` should have moved (all four changes are
class-gated and the three baselined failures are untouched), which is exactly the claim a gate run
would settle. Say what it reports either way.

**Pass 15 is the first row where the FIRST wiring was genuinely wired, lit exactly the right enemy,
and still did nothing — and only a health-lost bar could see it.** Both of Burning Light's numbers were
already in the file (the radius is `igniteBurn`'s combustion splash verbatim; the heat is the dying
Sworn target's own `stDmg`), so the spread went through `applyElement`, the door every fire hit in the
game uses. `applyElement`'s buildup is `buildAmt`, which scales with **the weapon's swing speed**, and
the paladin's own starter sword yields **0.95** of a stack against a DoT of
`Math.floor(st.burn) * stDmg * 0.055`. Measured: `lit 0.95`, `heat 1293`, `lost 0`. The audit would
have called `pal_burn` wired and a stack-count assertion would have gone green. The stack is now
topped to the whole one the combustion splash hands over — `lit 1`, `lost 139` — and the general
lesson is the one this plan keeps re-learning in new places: **the bar has to be the thing the card
promises the player, not the thing the code sets.** Full write-up in `docs/SKILL_TRIAGE.md` section E.

**Pass 14 is the first row whose card states NO number anywhere, and that is why it was worth taking
rather than skipping.** "Attacking while falling drives you down onto the target" names no speed, no
distance and no damage — the shape this plan's own rule hands to Oliver when a number has to be
invented. None had to be: Dive Strike (`SKILL_FX.sky_dive`, 10264) is the class's own dive and its two
constants were taken verbatim, with only the heading changed to the card's own word (onto the TARGET,
not along the yaw). The passive also *replaces* the innate's hang rather than adding to it, so picking
it is a real choice about which airborne Skylancer you are. Full write-up and the negative finding it
turned up — `chr_freeze` is blocked on a missing enemy-facing model, not on a number — in
`docs/SKILL_TRIAGE.md` section E.

**Pass 13 is the first row in this section whose card has THREE clauses, and it is the first whose
condition is not the passive itself.** Bounty Hunter pays out on a MARKED enemy, so "the passive half
differs from the control" is not enough of a bar — a wiring that paid on every enemy would clear it
and would be a worse bug than the dead passive. Each half therefore carries its own unmarked control
(a second foe, hit and killed in the same half), and the unmarked numbers must match the control's
exactly. They did, in all three halves. The known-bad is carried in the probe rather than produced by
breaking the repo: a third half runs the dead `r_elem` again and is fed to the identical bar as if it
were the fix, so `okAgainstInert` is what this probe would say against the shipped game. `false`
while `ok` was `true`, in one launch, on real measurements.

**Pass 6 came out of pass 5's probe rather than out of the triage list, and that is the exception the
list's own rule allows for.** Task 2 Step 1 says never hunt a bug the harness cannot see — the point
being not to act on desk research. This was not read; it was *measured*, as a free diagnostic in the
launch that was already paying for a browser, because the Thick Hide trials had to steer around
berserker rank 7 to be trustworthy and steering around something silently is how a probe ends up
measuring nothing. **A row can be discovered by a probe, and a passive audit cannot see this class of
fault at all:** `bsk_frenzy` IS wired, three times over, and "is it read in a fourth place that
crashes" is not a question "does anything read this id" can ask.

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
