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
| 18 | **E — chronomancer Echo was never read** | this run | `harness/probes/echo.probe.js`, THREE halves in one launch, TWO damage windows per half on one dummy (the skill is a stream, so a single total cannot separate the cast from the echo): cast 80 in every half, second window 0 / 0 / 80, the echo's 80 being the cast's own unreduced power. The probe's first run failed on its OWN clean-check — it read the cooldown four seconds after a 2s-cooldown cast, this sub-project's fault 3 committed again. Chronomancer suite 4 pass / 0 fail after |
| 17 | **E — reaper Crimson Harvest was never read** | this run | `harness/probes/crimson.probe.js`, THREE halves in one launch with TWO kills per half (one below half health, one above, because "below half health" is half the sentence): control 0/0, the passive half 24 then 0, the known-bad half 0/0, on a 477 HP hero. The amount is the Void Scythe harvest's own 5%, verbatim. Reaper suite 6 pass / 0 fail after, and the class now has **no dead passives left** |
| 16 | **E — skylancer Sky Armor was never read** | this run | `harness/probes/skyarmor.probe.js`, THREE halves in one launch with TWO hits per half, each from its own fresh jump: control 62 early and 62 late, the passive half 0 early (invuln 0.18, the dodge's own window verbatim) and 62 late — so the window opens AND closes — and the known-bad half 62 both times. Skylancer suite 4 pass / 0 fail after |
| 21 | **E — pirate Dead Aim was never read** | this run | `harness/probes/deadaim.probe.js`, FIVE bodies in a line and THREE halves in one launch: control and known-bad stop at 3 of 5 with pierce spent to 0, the passive half takes all 5 with pierce 99 → 94. **The probe was wrong twice before it was right** — it said 4 of 5 and the first guess (range) did not fix it; adding a per-frame trace of the live projectile showed `pierce:96` still in hand when it stopped, so the shot was sinking below the last body, not running out of pierce. The line now starts 400 units out so the aim solve flies flat. First of the Pirate's six. Pirate suite 3 pass / 0 fail / 1 unproven, ranger (the other `fireProjectile` class) 4 pass / 1 baselined fail |
| 20 | **E — berserker Heavy Hands was never read** | this run | `harness/probes/heavyhands.probe.js`, THREE halves in one launch with THREE trials per half: control and known-bad thrown at the game's own vz 210 / vy 160 with the dodge firing, the passive half vz 0 / vy 0 / onGround true with the dodge refused — and **hpLost 6 in all three**, because the obvious early return out of `hurtPlayer` would have read as knockback immunity and been DAMAGE immunity. The dodge button is photographed unavailable at `dodgeCd 0`. **The first row in the section with no number on either side**, and it also turned up `w_unyield` — wired, and to a completely different card (see below). Berserker suite 4 pass / 1 fail either side, the fail being the baselined Charge |
| 19 | **E — paladin Blessed Blade was never read** | this run | `harness/probes/blessed.probe.js`, THREE halves in one launch with THREE trials per half (a foe 600 units ahead against a 198-unit melee aim reach, the same foe 600 units BEHIND, and an ordinary melee hit): the far foe sworn only in the passive half, the behind foe sworn in no half, the melee hit sworn in every half so the control's zero is a real zero — and `hurt:false` throughout, so the swing never landed. **Paladin is now the second class with no dead passives** (0/7). Paladin suite 7 pass / 0 fail either side |
| 23 | **E — pirate Swagger was never read** | this run | `harness/probes/swagger.probe.js`, THREE halves in one launch, TWO walks per half (loaded then spent), the bar being DISTANCE COVERED at terminal speed rather than an `effSpeed` reading — the card promises movement, and this sub-project has twice been burned measuring what the code sets instead. Six walks of 245.4–245.8 before; after, 270.21 loaded against 245.85 spent (ratio 1.099) with the control at 0.998 and the known-bad at 0.999. The pistol is emptied and reloaded through the game's own paths (a shot spends it, a kill reloads it), never by assignment. **The first row with no picture** — a movement multiplier does not exist in a still frame, said plainly rather than glossed. Pirate suite 3 pass / 0 fail / 1 unproven either side |
| 22 | **E — monk Master Striker was never read** | this run | `harness/probes/monkmaster.probe.js`, THREE halves in one launch, each with FOUR strikes then a chain break driven by the game's own 242 ticks of decay then TWO more strikes: a neighbour 120 units out that is never struck directly lost 0/0/0/**127** in the passive half, nothing in the control or the known-bad, a far foe at 420 nothing anywhere, and nothing after the break. **The fix had to sit one line ABOVE the monk's Focus refresh** — read below it, `focusT` is already renewed, every strike looks like a continuation and "unbroken" degrades into a lifetime counter. The break phase is placed at a NON-multiple of four on purpose: break-then-four splashes on the fourth either way, so modulo arithmetic hides the reset. Monk suite 4 pass / 0 fail, photographed at `_shot/out/mm-splash2.png` |
| 24 | **E — pirate Slippery was never read** | this run | `harness/probes/slippery.probe.js`, THREE halves in one launch with TWO shots per half (loaded then spent, because "firing the pistol" is the condition and a passive that shoved on every swing would clear a loaded-only bar): all six shots moved 0 before; after, the loaded shot moved 139.4 and took the gap from 60 to 199.4 past the game's own reach of 88, the spent shot moved 0, and the control and known-bad stayed at 0 throughout. **The obvious one-line fix — `p.dodgeTimer=0.22` — would have shipped an i-frame**: eight damage tests read that field as "this body is dodging", so the shove runs on its own `_slipT` and the probe asserts `dodgeCdT` was never spent. The probe was wrong twice first, both ways silently: it faced the hero at `yaw 0` toward a foe the game's own forward vector puts BEHIND it, and it reset position between trials but not velocity, so the dash's friction tail drifted the spent half 18.7 units with nothing fired. Pirate suite 3 pass / 0 fail / 1 unproven either side |
| 25 | **H — the ninja's Unseen never armed** | this run | `harness/probes/unseen.probe.js`, THREE halves in one launch with FOUR trials each: all three halves read `stillT 0` after 1.2s of the game's own ticks at a drift of 0 and repositioned nobody before; after, the live halves move the body 101 units to `distAfter 41` = `wanted 41` on the far side of the target for 8 damage against the base 6, the 0.7s trial fires ONLY in the half holding Swift, the walking trial fires in no half, and the inert half — `_stillT` pinned at 0, which is exactly the shipped state — fires nowhere. **Not a dead passive: a live mechanic gated on a clock that only ran for the mage**, so the passive audit had reported the class at 0/8 dead throughout while two of its cards were written about a clock that never advanced. The second instance of the limit Task 3 Step 2 states in advance, after `w_unyield`, and the worse of the two. Photographed at `_shot/out/unseen-strike3.png` |
| 26 | **I — the necromancer's Harvest deleted the corpse it announced** | this run | `harness/probes/harvest.probe.js`, THREE halves in one launch with THREE trials each: five hits gave `added 1, survived 0, risen 2` before and `1 / 1 / 1` after, four hits found no corpse in any half either side, and a corpse from a KILL raised correctly in every half both ways — so the control's zeros are real zeros. **The bar is the game's own discriminator**: `necro_raise` raises ONE fighter off a corpse and falls back to TWO without one, so a plain "did a minion appear" test would have gone green against the shipped game on the fallback alone. The known-bad half reads identically to the before-run's live half. Found by a static sweep for the section H shape, not from the triage list — section E is floored and this is what the plan says to hunt instead |
| 27 | **L — the Beastmaster's companion never took the order** | this run | `harness/probes/petorder.probe.js`, THREE halves in one launch with TWO trials each (ordered, and a no-order control that must hold in every half): the pet was 525 from the aimed foe and 33 from the one beside it, and is now 31 and 463, with the damage moving with it (aimedLost 0 → 55, nearLost 55 → 0) — while the no-order control reads 35 / 527 in all three halves, so this is a retarget and not a pet that now always charges the reticle. The known-bad half reads identically to the before-run. **Three faults stacked, and the outer one hid the other two: `aimTarget()` was called with NO ARGUMENTS**, threw on `undefined.yaw` into the hook's own catch, and killed the whole hook including the SIC EM the player is shown — so the dead `orderX/orderZ/orderT` and the wrong-field `atkCd` had never had a chance to matter. Found by the widened sweep this same run, not from the triage list. Beastmaster suite 6 pass / 0 fail / 0 unproven |
| 28 | **N — the ninja's Combo Edge paid out only for the OTHER passive** | this run | `harness/probes/nincombo.probe.js`, THREE halves in one launch with THREE trials each: a Ninja holding Swift + Combo Edge left `_stillT` at 0 after an Unseen kill on a full-health foe AND on a wounded one before; 9 on both after, while the half holding Deadly Precision went 0 → 9 on the healthy foe and stayed 9 on the wounded one (the shipped game's only working path, unbroken), the no-Combo-Edge control stayed 0 everywhere, and a plain non-Unseen kill rearmed in no half either side. **The known-bad could not be an `inert` half** — the mark is written and read inside one synchronous `hitEnemy` call, so the shipped gate is TRANSCRIBED in the probe and fed the identical bar (`okAgainstShipped` false while `ok` true). Photographed at `_shot/out/nc-rearm.png`. Section H's shape hiding UNDER the section H fix: nothing downstream of Unseen had ever been exercised, because Unseen could not arm |
| 30 | **P — the passive audit could not see four of the game's passives** | this run | A BENCH pass, like pass 3, and taken for pass 3's reason. `passivesOf`'s entry regex demanded single quotes on `n:` and `d:`, so the four passives whose names carry an apostrophe (`x_favor`, `pal_will`, `bst_rhythm`, `bst_authority`) were skipped silently — 124 parsed where CLASS2 holds 128, and those four sat outside the `KNOWN_DEAD` ratchet's reach entirely, so one going dead would have left the gate green. Found by checking every `c2Passive('<id>')` literal against the ids CLASS2 defines: four ids the game guards on that the audit had never heard of. Proven by `harness/test/passives.test.js` with the old regex transcribed and asserted to MISS the double-quoted entry, and by replacing the `>= 100` floor with the arithmetic its own comment already stated — per class as well as in total. Unit stage 53 → 55 tests, `128 total, 102 wired, 26 dead`, dead list unchanged |
| 29 | **O — chronomancer Haste named a cooldown array that does not exist** | this run | `harness/probes/chrhaste.probe.js`, TWO halves in one launch (the two options at the same rank, so the only difference is the pick): four real casts armed four real cooldowns in both halves, the control kept all four after its Rewind and the Haste half kept all four before / cleared all four after — and each half then PRESSED a skill, spending 0 mana before and 7 after, because `useSkill` returns at its cooldown gate *before* it spends anything. **First row found by the READ-NEVER-WRITTEN half of the field sweep**, which this plan records as never having been worked: `p.cds (2 reads, first at line 11644)`, both of them that one line. Photographed as a true A/B — `_shot/out/haste-cooling.png` counting 1.4 / 5.9 / 9.6 / 16.4 under the REWIND floater against `_shot/out/haste-ready.png` with four lit buttons at the same instant. Chronomancer suite 4 pass / 0 fail either side |
| 33 | **Q — bladedancer Fast Hands refunded nothing; its one reader was an attack-speed line** | this run | `harness/probes/fasthands.probe.js`, THREE halves in one launch with TWO trials each (a parried hit and an unparried one, because a passive that zeroed the timer on ANY hit taken would clear a parry-only bar): control 0.200 → 0.184 in both trials, the passive half **0.179 → 0** on the parry and 0.179 → 0.162 on the unparried hit, the known-bad 0.200 → 0.184 in both. A parry fired in all three parried trials and the hit landed in all three unparried ones, so the zero is a real zero. `p.atkCd` IS the time an attack takes — `playerAttack` sets it and returns on it — so zeroing it is Swift Steel's own refund three lines from where the field is set; `p.atkTimer` is left alone because that is the ANIMATION. Everything is driven rather than assigned: the window is CAST through `useSkill`, the swing is a real input press, the hit is the game's own contact damage. **The before-numbers also proved the undocumented half is still live**: 0.179 against 0.200 is exactly the +12% attack speed the `effAtkSpeed` reader has always granted, which is the state this section hands to Oliver rather than deciding. Bladedancer suite 5 pass / 0 fail / 0 unproven |
| 32 | **Q — bladedancer Light Feet parried nothing; its one reader was a move-speed line** | this run | `harness/probes/lightfeet.probe.js`, THREE halves in one launch with TWO trials each (a dash THROUGH a foe, and the identical dash with the foe 400 units off the line, because a passive that parried after every dodge would clear a through-only bar): the passive half took **0 damage with a Riposte stored** on the through trial and lost 4 HP on the past trial, while the control (`bd_sharp`) and the known-bad (`mon_iron`) lost HP in all four of theirs; the dash measured 120–122 units in every trial. Wired inside the dash (12981), not at the button, because "through" is a fact about where the body travelled — the overlap test is the game's own contact test verbatim. **The FAITHFUL implementation was rejected on the card's own terms**: a per-enemy mark cannot be read, because `hurtPlayer` is never handed the attacker (a descriptor at 13348, the projectile's position at 13345), so it would silently fail to catch a marked archer's arrow. The window deviation is recorded rather than hidden. **The probe was wrong twice first, both silently**: the dash's friction tail walked the hero out of contact with a pinned foe (`hitAt −1` five times of six), and `e.active` without `e.dropT` left a spawned body inert for ~41 frames — past the very window under test. Bladedancer suite 5 pass / 0 fail / 0 unproven |
| 31 | **Q — pirate Quick Hands reloaded nothing; its one reader was an attack-speed line** | this run | `harness/probes/quickhands.probe.js`, THREE halves in one launch with TWO windows each (a chest, and the same ticks with no chest, because a passive that reloaded on a timer would clear a chest-only bar): the passive half went spent → LOADED on the chest and stayed spent on the idle window, while the control (`pir_deadly`, the a-side of the same rank) and the known-bad (`mon_iron`) stayed spent in all four of their windows; gold +70 on every chest window and 0 on every idle one, so the payout is unchanged. **THE FIRST ROW OF A NEW SECTION AND A NEW SHAPE: the card promises a MECHANIC and the only reader multiplies a STAT.** The passive audit has always called `pir_swift` wired and is right — it is read, in `effAtkSpeed`, for +10% attack speed the card never mentions, while the card's own sentence had no implementation at all (`_loaded` has three writers and no chest is among them). Nothing invented: the card is a boolean and the four lines are the kill rider's own, floater and colour included. The probe's first run failed on its OWN loot clause — the pickup step collects the drops in the same frame the chest creates them, so a hero standing on the chest reads 0 either way — and the bar now says what it can prove. Pirate suite 3 pass / 0 fail / 1 unproven either side |
| 34 | **Q — reaper Corruption Mastery spread nothing; its two readers were a buildup rate and a damage number** | this run | `harness/probes/xcorrupt.probe.js`, THREE halves in one launch with TWO trials each (a rupture of a CORRUPTED body and one of an uncorrupted body, because "rupturing a corrupted enemy" is the condition), and a far foe in every trial outside the radius so "everything **near** it" is tested as a radius: all six trials spread 0 before; after, the passive half took the neighbour 0 → 3.85 and held it through 60 ticks, and **cashed that stack in for 74 real rupture damage**, while the far foe stayed 0, the uncorrupted trial spread 0, and the control (`x_favor`, the b-side of the same rank) and the known-bad (`mon_iron`) stayed 0 in all four of theirs. The bar is deliberately NOT "the meter went up": corruption has no DoT of its own — `statusTick` DoTs burn and venom only — so its entire payoff is that the body can be RUPTURED, and a stack that cannot be cashed in is pass 15's 0.95 stacks again. **The radius was the condition this row was blocked on and it turned out the effect already owned one**: 120 is the `skillRing` Rupture has always drawn, one line above the fix, and also `igniteBurn`'s combustion-splash radius verbatim. **The probe was wrong once, and the fixed game failed its own clean-check to say so** — it read the ruptured body's meter at the END of the trial, and the neighbour's rupture 80 units away spreads corruption straight BACK onto it, so a working chain read as a rupture that never happened. Photographed at `_shot/out/xc-spread.png` (RUPTURE and CORRUPTION SPREADS in one frame). Reaper suite 6 pass / 0 fail / 0 unproven either side |
| 35 | **Q — berserker Rage doubled your damage and never charged you the printed cost** | this run | `harness/probes/rage.probe.js`, THREE halves in one launch with TWO trials and a DRIFT window each (60% health, 10% health, and the identical ticks at 10% with nothing in the world to heal you, because "below a quarter" is half the sentence): the control and the known-bad healed +134 at both healths, the passive half healed +134 at 60% and **0 at 10% with the spring not spent**, and every drift window moved 0. **The fix is mostly not a passive — it is `healPlayer()`, the door this file had never had**: thirty separate `p.hp=Math.min(effMaxHp(p),p.hp+x)` sites across sixteen classes now call one function, and `healBlocked()` beside it is four lines. Nothing invented; the threshold is the doubling's own `p.hp/effMaxHp(p) < 0.25`. **The upside is measured in the same launch** — 40/79/40 dealt at 10% health and 30/30/30 at 60% — so the doubling is proven still present and still conditional. A full restore (`p.hp=effMaxHp(p)`) is deliberately NOT routed: a reset is not a heal, and blocking respawns would be a berserker who can never leave a quarter health again. Photographed at `_shot/out/rage-locked.png` (HP 48/477) against `_shot/out/rage-healed.png` (167/477). Berserker suite 4 pass / 1 fail either side, the fail being the baselined Charge |
| 13 | **E — ranger Bounty Hunter was never read** | `f693c69` | `harness/probes/bounty.probe.js`, THREE halves in one launch, each measuring a MARKED foe against an UNMARKED one so the mark is what is under test: control 623/623 damage, 0/0 heal, 550/550 gold; passive 573/623, 19/0, 605/550. Ranger suite 4 pass / 1 fail either side, the fail being the baselined `ranger/Tumble` stale description (section C, Oliver's) |

**SECTION E HAS HIT ITS FLOOR — 2026-08-12, and the next run should not go looking for a row there.**
All 26 remaining dead passives are now triaged — the count the audit itself printed on the
2026-08-12 gate run (`124 total, 98 wired, 26 dead`), not one carried forward in prose — with the
group-by-group table in
`docs/SKILL_TRIAGE.md` section E under *"What is left, and the ONE decision that unblocks each
group"*. Every one of them is blocked on a number, a unit, or a mechanic that does not exist —
inventing any of those is the one thing this plan's own constraints forbid. The last group to be
settled was the Necromancer's three, and it was **measured, not read**: `harness/probes/necrot.probe.js`
cast both sides of all four skill ranks plus a real swing and reported `anyVenom: false`, so the class
cannot produce the decay state all three of its cards are written about. "Plague Bolt" lands the
WEAPON's burn and "a storm of decay" lands nothing at all, because both are the mage's skills under
necromancer names (`10279`).

So Task 2's remaining targets come from **section H and the wired-but-wrong shape**, not from section
E — a mechanic that exists, is described, is read, and is gated on something that never happens. That
is where pass 25 came from and it is the shape `w_unyield` (pass 20) also has. Neither is findable by
the passive audit, which asks only "does anything read this id".

**AND THERE IS A CHEAP WAY TO FIND THEM, which pass 26 came out of.** A static sweep for player
fields that are READ and never WRITTEN — or written and never read — takes no launch and no GPU, and
it is what the section H/I shape looks like from the outside. Run over `p.<field>` it turned up three
things in one pass: the Necromancer's Harvest corpse (pass 26, fixed), the Reaper's `soulStrengthT`
damage clause that no card promises (Oliver's, recorded in `docs/SKILL_TRIAGE.md` under *"Not listed
here"*), and two inert leftovers worth naming so nobody spends a launch on them. **The next sweep
should widen past `p.` — enemy state (`e.<field>`) and `G.<field>` have never been checked this way**,
and `CLASS_BASIC` is now 3 for 12 on identities that did not work.

**AND THE SAME SWEEP SETTLED TWO OF THE THREE REMAINING BASELINED FAILURES WITHOUT TOUCHING THE GAME
— they are not bugs.** `SKILL_FX` is a plain object assigned to in three places, so the last
definition of an id wins; twelve rank-8 and Berserker handlers were deliberately rewritten at the end
of the file (19223–19352, the block's own header says why) and **their `CLASS2` cards were never
rewritten with them.** `mage/Attunement` and `berserker/Charge:damage` are two of those twelve: the
harness is right that the skill does not do what the card says, and it is the *card* that moved.
Full table, all twelve rows, in `docs/SKILL_TRIAGE.md` section J. **Every one of them is Oliver's** —
this plan's rule against editing a description to match behaviour exists precisely for the case where
the behaviour is the newer and better of the two, and answering them is twelve sentences rather than
twelve numbers. One row, `bsk_whirl`, carries a second and separate fault: its card's cost clause
("you cannot move backwards for 10s") is not implemented anywhere, so what ships is a plain damage
doubler. That is a balance change and his as well, for pass 20's reason.

**So this sub-project's honest state is: no skill row an autopilot run may take is currently known.**
Section E is floored, section J is Oliver's by rule, and the next candidate has to be *found* — by
widening the sweep, not by re-reading the triage list.

**THE SWEEP WAS WIDENED, 2026-08-12, AND IT WORKED — so the paragraph above is answered rather than
still open.** `harness/audit-fields.js` + `harness/test/fields.test.js` (16 tests, ratcheted in both
directions, in `run-all.js`'s fast stage) sweep `p.`, `e.`, `G.`, `G.pet.` and a receiver-agnostic
`*`. It reproduced independently every field sections J and K had found by hand, and found **pass 27
(section L), the Beastmaster's dead order** — a class identity, VISION.md priority #2, announced to
the player with floating text and dead from its first statement.

Two corrections it needed first, both found by running it against the real game and both failing in
the ACCUSING direction — a false *dead* verdict, which is the one that gets a non-bug "fixed":
`Array.from` splits by code POINTS, so one emoji desynced the stripper and it began blanking live
code (37 of the first run's 208 `p.*` "fields" were halves of real identifiers); and the reader
search was receiver-restricted, while the game reaches the player under more than one name
(`p._headlongT` is read as `G.p._headlongT`). Each now has a unit test asserting the new and old
behaviour DISAGREE.

**What it left on the table, all of it Oliver's, in `docs/SKILL_TRIAGE.md` section M:** two of the six
`BOSS_PHASE2` mechanics are announced to the player and never built (the Frost Sorcerer's
*"A SECOND OF HIM"* and the Awakened King's *"THE EDGE FALLS AWAY"*) — the King's is reachable from
the game's own `G.collapse` system and is held back because an arena that shrinks under you is a
difficulty call on the final boss, not because a number is missing; `e.petTauntT` makes section K
**five** aggro fields rather than four; and `p.spinT` is an inert leftover.

**Where the next run should look:** the sweep's `*` mode is unratcheted and only eyeballed once. Its
read-never-written half has not been worked at all, and `CLASS_BASIC` is now 4 for 12 on identities
that did not work — the other eight have never been checked against what they claim.

**THE READ-NEVER-WRITTEN HALF IS NOW WORKED, 2026-08-12, and it gave pass 29 (section O) — the
chronomancer's Haste, whose whole implementation named `p.cds`, an array this game does not have.**
Over `p.` and `e.`, once the DOM-event noise is set aside (`e.clientX`, `e.preventDefault`, `p.catch`
— an event handler's parameter is also called `e`), it reports exactly three rows. One was the bug;
the other two are recorded under `docs/SKILL_TRIAGE.md`'s *"Not listed here"* — `e.dmg2`, a boss
shockwave whose damage is a difficulty call and therefore Oliver's, and `e._iansSplash`, which is
**not a finding but a limit of the sweep**: its write is `e2._iansSplash=1`, and the any-receiver
pass carries `(?<![0-9.])` so it never sees a receiver whose name ends in a digit. That is worth
carrying forward because it is the one direction this sweep can fail in ACCUSINGLY — a field whose
only reader is `e2.foo` would be reported as written-and-never-read, and a false *dead* verdict is
the one that gets a non-bug "fixed". `G.` and `G.pet.` report nothing at all in this direction.

**So that half is close to empty and the next lead has to come from somewhere else.** The standing
candidate is the stat-snapshot half of Task 3 Step 2, now cheap: against 98 passives that DO have a
reader, "is the reader honouring the card" is the question sections H, N and O all turned out to be,
and it is the only one of the three remaining leads that a sweep cannot answer statically.

**THAT CANDIDATE WAS TAKEN, 2026-08-12, AND IT DID NOT NEED A LAUNCH AT ALL — which is the finding as
much as the bug is.** Step 2 deferred the stat snapshot because 128 passives × two game states does
not fit in any run. It never had to be a snapshot: reading each wired card against its own
`c2Passive('<id>')` site, class by class, answers the same question statically and costs nothing.
Four of the sixteen classes were swept this way — warrior, mage, warlock and bladedancer, the four
least worked by this task's passes — plus a targeted read of the pirate, and it produced **five rows in
one sitting**, now `docs/SKILL_TRIAGE.md` section Q. Mage and warlock came back clean.

They share one shape, and it is the shape sections H, N and O each hit separately: **the card promises
a MECHANIC and the only reader multiplies a STAT.** `pir_swift` says "opening a chest reloads your
pistol" and grants +10% attack speed; `bd_feet` says a dodge through an enemy parries them and grants
+10% move speed; `bd_fast` says a parry refunds your attack time and grants +12% attack speed;
`w_heavy` says your swings cannot be interrupted and grants +12% damage and −5% attack speed;
`w_juggernaut` promises knockback resistance AND damage reduction and implements only the second.
Every one of them is reported WIRED by `harness/audit-passives.js`, correctly — the audit asks whether
anything reads the id, and cannot ask whether the reader honours the card.

**THE SWEEP WAS WIDENED AGAIN IN THE SAME RUN, WHILE THE AGGREGATE GATE WAS RUNNING, AND SECTION Q IS
NOW TEN ROWS.** Reaper, skylancer, berserker, chronomancer and ranger were read the same launch-free
way, and five more came back — three of them the REAPER'S, a class this plan has been recording as
finished ("the class now has no dead passives left", pass 17). That was true and it was about section
E; three of its eight passives still do something other than what their card says.

| id | its card | its reader | verdict |
|---|---|---|---|
| `x_doom` | a dying marked enemy passes its mark to the nearest foe | the mark lasts 20% longer | ~~actionable~~ **NOT TAKEABLE — see below** |
| `x_corrupt` | rupturing a corrupted enemy corrupts everything near it | +25% buildup, +15% rupture damage | **FIXED, pass 34** — corruption did own a radius |
| `x_chill` | corrupted enemies cannot flee and walk toward you | they move 18% slower | **Oliver's** — nothing in this game flees except Arena bots and the treasure goblin |
| `bsk_rage` | you cannot be healed below a quarter, and your damage doubles | the doubling only | half wired, and the missing half is the DRAWBACK — pass 20's own rule says take it |
| `chr_temporal` | standing still REWINDS your cooldowns rather than pausing them | an unconditional +10% CDR | **Oliver's** — cooldowns never pause, so both stages would be invented |

**AND THEN IT WAS FINISHED — ALL SIXTEEN CLASSES, same run.** Paladin, necromancer, ninja, monk,
stormcaller and beastmaster went the same way while the gate ran. **Every wired passive in the game
has now been read against its own card**, which closes the open half of Task 3 Step 2 — and it closed
for a cheaper reason than this plan ever expected: it never needed a launch at all.

The last six gave one more row and one finding of the opposite shape. `pal_heal` — "every skill you
cast heals the ally nearest you, or you if alone" — reads as **+5% lifesteal**, which is paid on
damage dealt, fires on basic attacks rather than casts, and can never reach an ally: all three clauses
missed by one line, and the clause that matters most is `docs/VISION.md`'s priority #1. **That is the
second class this sweep caught while this plan was calling it finished**, after the reaper. And
`necro_undying` is the reverse: its card's mechanic works, and it *also* carries the flat 12% damage
reduction it was rewritten AWAY from, never removed — `w_swift`'s shape, so it joins section J rather
than section Q.

**Section Q's final state: eleven rows, three fixed.** Clean classes, listed so nobody re-reads them:
mage, warlock, skylancer, ninja, monk, stormcaller, beastmaster, necromancer.

**Where the next run should look, in order.** `bd_feet` and `bd_fast` were both taken this run, as
passes 32 and 33 — **the bladedancer now has no section Q row left**, and it is the first class whose
stat-multiplier stand-ins have both been replaced by the mechanics their cards describe. The next
three, cheapest first: **`x_doom`** (a kill rider beside four that already exist), then
**`w_juggernaut`**, then **`bsk_rage`**. `w_juggernaut`
is takeable too — pass 20 put the knockback in one place so Heavy Hands could skip it, and 15% is the
card's own number — but its "while moving" clause is ambiguous about which half it governs, which is an
English question about a card and not a measurement. `w_heavy` is NOT takeable: this file has no
interrupt state, so answering it means designing one. **And eleven classes have not been swept at all**,
so section Q's five rows are a floor, not a total.

**THE ORDER ABOVE WAS WRONG AT ITS HEAD, 2026-08-12, and the run that took the second name got the
first one for free.** `x_doom` was called the cheapest of the three and **it is not takeable at all** —
not because a number has to be invented, but because *the reaper has no way to mark anything*.
Traced rather than argued: `e.doomT` has exactly one writer in the game, `SKILL_FX.deathsdoor`
(9944), which lives only in the **legacy** `CLASSES` reaper kit (1896, rank 7); `useSkill` branches on
`c2def()` and the reaper HAS a `CLASS2` tree, so it always casts `c2CurSkills()[i]`, and the reaper's
eight CLASS2 skills are `x_reap / x_cleave / x_step / x_wraith / x_pull / x_bind / x_siphon /
x_vortex`. None of them dooms. `e.markT` is no better: its only writers are the ranger's Mark and
Death Mark (9893, 9984). So a wiring of "spread their mark" over either field would be a passive that
can never fire in play — the section H shape this plan exists to catch, shipped deliberately. Which
mark the card means (doom, `markT`, or corruption, which is the one thing a reaper CAN apply) is a
design decision, so **the row is Oliver's**. Two further consequences worth his eye, both measured the
same way: the reaper's rank-10 capstone reads `(e.markT||0)>0` and that clause is unreachable for the
same reason, and **Death's Door — a whole rank-7 skill with a full implementation plus the entire
`doomT`/`doomDps`/`doomAcc`/`doomSrc` DoT system in the enemy update loop (13284) — is unreachable
content.** That is section J's shape: the kit moved and the code did not.

**`x_corrupt` WAS takeable, and it is pass 34.** This document made "does corruption own a splash
radius of its own" the condition on that row, and it does: 120 is the `skillRing` Rupture draws one
line above the fix, and it is `igniteBurn`'s combustion-splash radius verbatim. Nothing was chosen.
**So the next three, cheapest first, are now `w_juggernaut`** (with its "while moving" English question
settled first — Oliver's, and one sentence), then **`bsk_rage`**, then `pal_heal`. `bsk_rage`'s missing
half is a heal LOCK and this file has no central door for player healing — 18 separate
`p.hp=Math.min(effMaxHp(p),…)` sites — so taking it means introducing one, which is a refactor across
every class before it is a passive fix. Say that in advance rather than discovering it mid-pass.

**`bsk_rage` WAS TAKEN, 2026-08-12, as pass 35 — and the count above was low.** There are **thirty**
incremental player-heal sites, not eighteen: the count came from one grep shape and missed the three
written `p.hp += x` (the companion's mend, the healing pads, the Vitality perk) along with the ones
written against `G.p` rather than `p`. The refactor was the size the plan said and slightly larger, and
it is the deliverable rather than a side effect — `healPlayer()` is where `pal_heal`, the next row but
one, will have to speak. **The warning was right and worth having had in advance.**

**So the next two are `w_juggernaut` — still blocked on Oliver's one sentence, and it is a cheap
sentence to ask for — and then `pal_heal`.** `pal_heal` is the last section Q row that is not
explicitly Oliver's, and it now has a door to be wired into; what it still lacks is an AMOUNT, and
whether "the ally nearest you" can mean a co-op peer at all is a question about `MP`, not about the
paladin. State both before starting it rather than discovering them mid-pass.

**THE OTHER EIGHT WERE READ, 2026-08-12, AND THE ONE THING THAT CAME OUT OF IT WAS PASS 28 — but say
what that sweep was and was not.** Every one of the twelve `CLASS_BASIC` entries was traced from the
state field it writes to whoever reads it: the warrior's `_momKeep` (killEnemy 10974), the warlock's
`_bloodOwed` (10984), the pirate's `_loaded` (10978), the ranger's `_ambushT`/`_ambushCd` (10075), the
stormcaller's re-entrancy guard, the paladin's `_oath` (11499) and the necromancer's corpse (pass 26)
are all read where their cards say they should be. **The ninja's was not** — the mark Combo Edge reads
had exactly one writer and it was inside a DIFFERENT passive's branch. That is section N.
**This was a WIRING trace and not a correctness one**, the same limit Task 3 Step 2 states for the
passive audit: it can say a field reaches a reader, not that the reader honours the card. Six of the
twelve entries (`berserker`, `mage`, `monk`, `skylancer` and the two damage-shape ones) hold no
cross-function state at all, so a trace of this kind cannot say anything about them and none of them
has been measured against its own words.

**THE AGGREGATE GATE RAN AGAIN, 2026-08-12, after passes 31–33: `GATE: PASS (3 known, 0 newly fixed)`,
exit 0, no `REGRESSION:` line.** Nothing in `harness/baseline.json` moved — the three knowns are still
`ranger/Tumble`, `mage/Attunement` and `berserker/Charge:damage`, all sections B/C/J and all Oliver's.
Per-suite: unit 55/55, **skills 69 pass / 3 fail / 3 unproven**, levels 36/0/12, **mp 54 pass / 0 fail**.
Three game changes across two classes disturbed nothing outside them, which is the claim that was
outstanding.

**And it answers the question the last gate run left open, in the good direction.** That run printed
`mp: skipped`, and this document said so and said why it mattered: the mp suite is the one that proves
Oliver is not invisible to himself in PvP, and sub-project A Task 5 records it as shipped and green.
It ran this time, at **54 pass / 0 fail**. So the skip really was the load-dependent one Task 5 Step 4
predicted — headless SwiftShader failing to bring the 3D layer up under contention — and not a missing
or misplaced module. Worth keeping because it means the loud-skip fix is doing its job: the suite is
flaky in its *availability*, never in its verdicts.

Levels moved 35/0/13 → 36/0/12, which is the den-less head-count flapping back the other way — a live
population snapshot correctly routed to `unproven` rather than to a verdict, exactly as Task 4 records.

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

**Pass 20 found the first passive that is WIRED AND WRONG, which is a shape this plan has assumed
did not exist yet.** `w_unyield` (warrior r5 b) promises "you cannot be staggered, knocked back, or
moved by anything" and its only reader gives 12% less damage below half health — no overlap with its
own card in either direction. The passive audit cannot see it, because the id IS mentioned, so the
warrior has reported 0/8 dead throughout. That is exactly the limit Task 3 Step 2 states in advance
("this proves WIRED, not CORRECT") and this is the first concrete instance. **Left for Oliver, and
not for the usual reason:** nothing needs inventing — the skip Heavy Hands just added is three lines
away and `w_unyield` could take it verbatim — but doing so would replace a defensive bonus a warrior
has been playing with for weeks, which is a balance change. Both honest fixes (make it do what it
says, or rewrite the card to say what it does) are his. Full write-up in `docs/SKILL_TRIAGE.md`
section E.

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

- [x] **Step 5: Re-baseline and hand the new findings to the triage list** — done; ticked 2026-08-12
      against the repo rather than against memory, for the reason sub-project A's Task 1–7 boxes were:
      *a plan that reads as unstarted is worse than one that reads as unfinished*, and while this box
      was open the standing rule "take the first task whose steps are not all ticked" pointed every
      run at a step whose whole content was "this happens in Task 2".

The 46 rows are in `docs/SKILL_TRIAGE.md` section E and are worked through Task 2, one commit at a
time; each fix takes an id out of `KNOWN_DEAD`. Nothing else re-baselines here — the audit is a unit
test, so it lives in `run-all.js`'s fast stage and never touches `harness/baseline.json`.

**Where it ended up, from the gate run's own printed line and not from prose: `124 total, 98 wired,
26 dead`.** Twenty of the 46 were wired by Task 2 passes; the remaining 26 are triaged group by group
in section E under *"What is left, and the ONE decision that unblocks each group"* and every one is
blocked on a number, a unit or a mechanic that does not exist. `KNOWN_DEAD` is a ratchet checked in
BOTH directions, so this step cannot silently stop describing the game: a newly dead passive fails the
gate, and a passive that becomes wired fails it too until the list is updated.

**EVERY COUNT ABOVE IS FOUR SHORT, AND THE AUDIT NEVER SAW THOSE FOUR AT ALL — found and fixed
2026-08-12 (pass 30).** `CLASS2` holds **128** passives, not 124: sixteen classes × four passive ranks
× two options, which is the arithmetic this step's own test comment had already written down beside an
assertion that accepted 124. `passivesOf`'s entry regex required SINGLE quotes on both `n:` and `d:`,
and four passive names contain an apostrophe and are therefore written in double quotes — **Death's
Favor** (`x_favor`), **Guardian's Will** (`pal_will`), **Predator's Rhythm** (`bst_rhythm`) and
**Alpha's Authority** (`bst_authority`). Skipped in silence, every run since the audit was written.

**Under-counting is the small half.** A skipped entry is not merely absent from a total — it is
outside the `KNOWN_DEAD` ratchet's reach entirely, so any of those four going dead would have left the
gate green with nothing to say. All four happen to be wired today (`x_favor` in the elite-hit and
elite-kill riders, `pal_will` in `hurtPlayer`, `bst_rhythm` on the basic attack, `bst_authority` in
`beastCommandPower` and the companion's splash), which is luck rather than a guard: the audit could not
have told anyone otherwise. Corrected state, from the run's own printed line: **`128 total, 102 wired,
26 dead`** — the dead list is unchanged, so nothing about section E moves.

Found by a static sweep this plan had not asked for and should: **every `c2Passive('<id>')` literal in
the game checked against the ids `CLASS2` actually defines.** Those four came back as ids the game
guards on and the audit had never heard of, which is only possible if the audit's parse is incomplete.
The check costs no launch and is worth re-running after any kit change; the reverse direction (an id
guarded that CLASS2 does *not* define) would be a permanently-false guard, and there are none today.

Both halves of the fix are asserted to DISAGREE with the version they replace, the rule
`harness/test/gate.test.js` sets: the old single-quote-only regex is transcribed into
`harness/test/passives.test.js` and asserted to miss the double-quoted entry, and the real-game floor
is no longer `>= 100` — it is the arithmetic itself, per class as well as in total, because an
aggregate floor cannot tell a parser that lost four entries from one that never had them.

**The stat-snapshot half of Step 2 is still the open piece, and it is now the cheap one.** It was
deferred because 128 passives × two game states does not fit in any run; against 102 wired ones with a
reader to exercise it is a different size of job. Sections H, N and O are the standing argument for
doing it: `nin_swift`, `nin_combo` and `chr_haste` were all counted wired throughout, and all three
were wired to a condition that never came true.

---

## When this plan is done

`docs/SKILL_TRIAGE.md` has no unfixed rows, and `harness/baseline.json` contains no `skills:` entries. At that point every skill and passive in all sixteen classes does what its description says, and the next plan is sub-project C (level completability — `The Abyss/quest:ab1` is already known) or D (per-peer multiplayer rigs).

## Self-Review

**Spec coverage.** The programme spec's sub-project B asks for every class, every skill, every passive. Tasks 1–2 cover actives via the existing tester; Task 3 adds passives, which the tester genuinely does not cover today.

**Placeholder scan.** Task 2 is a loop rather than N enumerated tasks because the list is not known until Task 1 runs, and because naming targets in advance is exactly how this plan's first draft came to open with a bug that did not exist. Its steps are written in full and the commands are exact.

**Type consistency.** `node harness/test-skills.js --classes <class>` matches the CLI in `test-skills.js`. `node harness/run-all.js` writes `harness/report.json` and `harness/baseline.json` and prints `FIXED:`/`REGRESSION:` lines, which is what Steps 7/5 read.

**Risk carried forward.** If Task 1 regenerates the baseline and almost nothing survives, that is a real outcome and not a failure of this plan — it would mean the reported bugs were mostly parser artifacts, and the honest next move is to re-test in a live PvP match with Oliver rather than to go hunting for bugs the harness cannot see.
