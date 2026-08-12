# Skill triage — 2026-08-10

Sub-project B, Task 1. Every row below is a measurement, not a reading: taken from
`harness/report.json` on a bench that was rebuilt this run because the old one was measuring a
state the game does not allow. Nothing here is fixed yet.

Reproduce any single row with:

```bash
node harness/test-skills.js --classes <class>
```

## Read this before acting on any row

The bench had **four** faults, all found and fixed this run, and all four were producing confident
verdicts. Rows are only listed below if they survive the fixed bench.

1. **It cast off-class.** `useSkill` calls `fx(p, classFamilyOk(p.weapon), am)`, and a great many
   handlers gate their defining half on that second argument — `harvest`'s heal is `if(hit && ok)`.
   The bench swapped `meta.classId` and left the Arena's Keen Legendary **sword** in the hero's
   hands, so, measured across all sixteen classes in one launch, **eleven cast off-class**: ranger,
   mage, reaper, necromancer, berserker, chronomancer, monk, stormcaller, warlock, skylancer,
   beastmaster. It is not a state a player can reach — `index.html:13220` hard-blocks equipping
   off-class. `reaper/Soul Siphon`, the row that matched Oliver's report word for word ("said they
   would heal you and then didn't"), was entirely this: on-class it heals.
2. **It read protection from one field on one body.** `p.shieldHp` is an absorb pool; `p.guardT` is
   the BRACE (`index.html:11155`, `if(p.guardT>0) dmg*=0.4`) and is what "brace behind your shield"
   compiles to; and `beastmaster/Guardian Bond` shields the **companion** (`pet.shieldHp`, 10111).
   `paladin/Shield Bash`, `paladin/Taunt` and `Guardian Bond` were each failed for not doing
   something none of them ever claimed to do to that field. All three pass now.
3. **It read the cooldown five seconds after casting.** `onCd` decides every control and buff claim.
   Once the observation window grew to 5s (three skills promise a 4s effect), every skill with a
   cooldown of 5s or less had already come back off it — `beastmaster/Sic 'Em` and
   `chronomancer/Slow Field` both reported `onCd:false` while plainly having fired.
4. **It sometimes measured a paused game.** Roughly one launch in six arrives in `mode:'pause'`, and
   `useSkill`'s first guard returns *without spending a cooldown* — so the class reports four skills
   that "fired and changed nothing", indistinguishable from four real bugs. The probe now knocks on
   the game's own resume door, logs the mode at every phase, and the suite re-runs a class whose
   bench is known to have measured nothing.

Two more things the bench now publishes rather than implies, because both change how a row reads:

- **A noise floor.** A drift control — the identical 5s window with nothing cast — runs before any
  swing. It is not small: the beastmaster's companion fights on its own and takes **165 HP** off the
  dummy with no skill used, and the warrior heals **238** unprompted. Drift is never subtracted
  inside the FAIL bar (doing that invented two bugs — `reaper/Reap` and `paladin/Last Stand`, both of
  which visibly heal); a claim that is met but only inside the noise floor is reported **unproven**.
- **Which weapon each class was measured holding**, in `weapon.note`. See the game bug at the bottom.

Current gate (2026-08-11, after the section F fix): skills **70 pass / 3 fail / 2 unproven**, levels
36/0/12, mp 27/0, `GATE: PASS`. The three surviving failures are `ranger/Tumble`,
`mage/Attunement` and `berserker/Charge` — sections C and B, all three of them Oliver's calls rather
than bugs, and all three already in `harness/baseline.json`, which this run did not have to change.

The pass/unproven split still moves by one between runs, which is the noise floor doing its job
rather than a result changing — a claim that is met but only by less than the drift is reported
unproven, and the drift is measured fresh each run. **What no longer moves is the FAIL list**: see
section F for the cross-skill contamination that used to put a fourth, different row in it.

---

## A. Nine skills have no handler at all — ONE bug, one ordering fault — **FIXED `5339f48`**

**This is the largest thing in this document and it is the closest match to Oliver's report.**
`SKILL_FX` is built by aliasing, and five alias lines sit *above* the definitions they copy, so each
one silently stores `undefined`:

| alias line | assigns | defined at |
|---|---|---|
| 10078 | `necro_grip = m_gravity` | 10148 |
| 10080 | `nin_step = x_step` | 10153 |
| 10084 | `st_lance = m_beam`, `st_orb = m_gravity`, `st_overload = m_overload` | 10146 / 10148 / 10150 |
| 10125 | `pir_spike = r_spike` | 10305 |
| 10129 | `chr_beam = m_beam`, `chr_gravity = m_gravity`, `chr_overload = m_overload` | 10146 / 10148 / 10150 |

`useSkill` then does `const fx = SKILL_FX[s.fx], r = fx ? fx(...) : null` — so the cast spends the
mana, spends the cooldown, plays no effect and does nothing at all. Measured live, not read:
`Object.keys(SKILL_FX).filter(k => typeof SKILL_FX[k] !== 'function')` returns exactly these nine.

| class | skill | rank | its description | in the default build? | status |
|---|---|---|---|---|---|
| ninja | Shadow Step | r4 a | "Dash through shadow and become briefly untouchable." | **yes** | **fixed `5339f48`** |
| chronomancer | Time Warp | r6 a | "Implode foes inward and deal damage." | **yes** | **fixed `5339f48`** |
| stormcaller | Ball Lightning | r6 a | "A crackling orb that pulls foes in and zaps them." | **yes** | **fixed `5339f48`** |
| necromancer | Death Grip | r6 b | "A skeletal grip implodes enemies inward and deals damage." | no (path B) | **fixed `5339f48`** |
| stormcaller | Lightning Lance | r2 b | "A piercing bolt through every foe in a line." | no (path B) | **fixed `5339f48`** |
| stormcaller | Chain Reaction | r8 b | "A massive electric explosion around your target." | no (path B) | **fixed `5339f48`** |
| pirate | Powder Keg | r8 b | "Drop a trap that damages and snares." | no (path B) | **fixed `5339f48`** |
| chronomancer | Time Lance | r2 b | "A piercing lance through every foe." | no (path B) | **fixed `5339f48`** |
| chronomancer | Singularity | r8 b | "A massive temporal explosion." | no (path B) | **fixed `5339f48`** |

Only the first three sit in the rank-10 path-A build every class defaults to, which is why the suite
reports three and the table lists nine — the other six are one choice away and equally dead.
**The Stormcaller and the Chronomancer are each missing three of their eight skills** (Lightning
Lance / Ball Lightning / Chain Reaction, and Time Lance / Time Warp / Singularity), and in both
cases one of the three is in the default kit. Both classes are wholly `m_*` reskins, which is why
they are hit hardest: every skill either class has is an alias, and the alias lines came first.

**It is one fix and it is an ordering fix, not nine handler rewrites** — the bodies all exist and
are correct. Any fix must be verified by the `dead handler` assertion, which has been watched to
fail nine times and is therefore believable.

### How it was fixed, and the fix that was NOT taken

`5339f48` re-binds the nine dead names in a late block just above `useSkill`, after every source
definition exists (`m_beam` 10146, `m_gravity` 10148, `m_overload` 10150, `x_step` 10153, `r_spike`
10305). Each is written `SKILL_FX.x = SKILL_FX.x || SKILL_FX.<source>`, so it can never blank a name
a later block has already defined.

**Moving the five alias lines down instead would have been the obvious fix and it is the wrong
one.** Those five lines carry about thirty aliases that are correct today, and three of them —
`chr_tempest` (10129), `st_storm` (10084) and `necro_storm` (10078) — deliberately capture the
ORIGINAL `m_tempest` damage-storm, because `m_tempest` is redefined at 18708 as a pure element buff.
Moving those lines past 18708 would silently convert three classes' storms into a buff nobody asked
for, and nothing in this document or the harness would have reported it, because the storms would
still have handlers. Only the nine dead names are touched.

Proof, in the order it was taken:
- `node harness/test-skills.js --classes stormcaller chronomancer ninja` — **8 pass / 3 fail before,
  11 pass / 0 fail after**, the three FAIL lines naming exactly `st_orb`, `chr_gravity`, `nin_step`.
- A live probe of the whole table: `Object.keys(SKILL_FX).filter(k => typeof SKILL_FX[k] !==
  'function')` returns **`[]` out of 159 entries**. That is what covers the six path-B skills — the
  tester's rank-10 default kit never reaches them, so a suite run alone could not have proven them.
- **Photographed, because typeof is not a picture** (`_shot/out/b-storb-after.png`): the Stormcaller
  casting Ball Lightning at five dummies renders `m_gravity`'s violet ring on the ground, pulls all
  five in, lands **15 HITS** with damage numbers over each, and puts the skill on an 11.1s cooldown.
  Before the fix that cast spent the mana and the cooldown and drew nothing at all.

---

## B. Berserker Charge sent you flying, permanently — **RUNAWAY TIMER FIXED**

| class | skill | claims | its description | status |
|---|---|---|---|---|
| berserker | Charge | damage | "Rush forward, damaging and stunning in your path." | runaway dash **fixed**; the missing damage is Oliver's |

Two faults, one skill. `SKILL_FX.bsk_charge` (18782) is the "HEADLONG" redesign: it sets
`p._headlongT = 0.9` and an invuln window, and deals no damage and applies no stun.

`_headlongT` appears in exactly **two** places in the whole file — set at 18783, read at 12345 to
drive the body forward at 760 units/second. **Nothing ever decremented it.** So the condition
`if((G.p._headlongT||0) > 0)` was true forever after the first cast, and the Berserker flew in a
straight line for the rest of the run with `vx`/`vz` pinned to zero. The bench saw it plainly: the
hero's HP went 239 → 477 during the observation window because it had left the fight entirely.

**Fixed by decrementing the timer where it is read** — `_headlongT = Math.max(0, _headlongT - dt)`
inside the block at 12345, so the dash lasts the 0.9s the handler advertises and matches the invuln
window the same handler grants, which is plainly the intent.

Measured, not read, before and after, by `harness/probes/headlong.probe.js` (`--scene arena:flat`):

| | dash length in the first 0.9s | `_headlongT` at 0.9s | at 3s | travelled by 3s | still driven? |
|---|---|---|---|---|---|
| before | 684 | 0.9 | 0.9 | 1305 and climbing | **yes** |
| after | 684 | 0 | 0 | 684 | no |

The dash itself is untouched — 684 units both times, which is `760 × 0.9` exactly. The probe's
verdict is deliberately KINEMATIC (six more frames, does the body still move) rather than a read of
the flag, because a timer that expires while something else keeps pushing would satisfy the flag and
not the player. Photographed either side as well: before, `Deaths 1` and the hero sliding out of
frame after the fell-out-of-the-world rescue threw him back and the dash set off again
(`_shot/out/headlong-before.png`); after, `Deaths 0` and the hero standing where the dash ended
(`headlong-after.png`).

The damage half is a **design call and still belongs to Oliver**: the handler's own comment says
Headlong "replac[es] a copy of the Warrior's Charge" and is deliberately a commit-you dash, so the
honest question is whether the *description* is stale or the *contact damage* was dropped. Per this
plan's own rule the description was NOT edited to match the code. `berserker/Charge:damage` therefore
stays in `harness/baseline.json` as a known failure, and that is correct — the gate should keep
reporting it until he decides.

---

## C. Two descriptions that outlived their skill's redesign — Oliver's call

Per this plan's own constraint, a skill is never "fixed" by rewriting its description to match
broken behaviour. Both of these look like the description was left behind by a deliberate redesign
whose intent is written in the code's own comment, which makes them content decisions, not bugs.

| class | skill | claims | its description | what the code does | status |
|---|---|---|---|---|---|
| mage | Attunement | damage | "A 4s storm repeatedly damages enemies around you." | `SKILL_FX.m_tempest` is **redefined at 18708** as a pure buff: "Your element changes on every cast for 10s." No damage at all. | needs Oliver |
| ranger | Tumble | damage | "Roll back ~5m with brief i-frames + a 0.75x parting shot. A dodged hit keeps Clear Aim." | `SKILL_FX.tumble` (9812) dodges, grants invuln and SNARES. There is no parting shot. | needs Oliver |

Worth noting on Attunement: the redefinition at 18708 only rebinds `m_tempest`. The aliases
`chr_tempest`, `st_storm` and `necro_storm` were assigned from `m_tempest` *earlier* (10129, 10084,
10078) and therefore still hold the ORIGINAL damage-storm function. That is not a bug — those three
classes' descriptions still say "storm" and they still get one — but it does mean one name now maps
to two different skills depending on where you read it.

Tumble's legacy `CLASSES` entry (1877) says "Roll backward and snare nearby enemies", which matches
the code exactly. It is the CLASS2 rewrite (2051) that added the parting shot.

---

## D. Three classes cannot equip their own starting weapon — a game bug the bench tripped over

Found while giving each class an on-class weapon, and measured for all sixteen in one launch.
`classStartWeapon(cid)` is what a fresh character is handed, and for three classes what it hands
over is **off-class for that class** — so a new player's first weapon silently costs them
`OFFCLASS_MUL` damage and every `if(ok)` half of their own kit.

| class | its family | its starter | in family? |
|---|---|---|---|
| berserker | great, axe, hammer | `sword` ("Notched Blade") | **no** |
| pirate | sword, cross, javelin, axe | `flintlock` ("Old Flintlock") | **no** |
| beastmaster | bow, javelin | absent from `CLASSSTART` entirely → falls back to the warrior's `sword` | **no** |

The bench works around it — beastmaster borrows the ranger's Cracked Shortbow (in family), pirate
borrows the warrior's Rusty Sword, and the berserker gets `anyClass` forced because **no starter in
the game lands in great/axe/hammer at all**. That last one is the interesting part: it is not a
missing table entry, it is a missing weapon.

This is `docs/VISION.md` priority #2 territory and touches starting-gear balance, so it is
**Oliver's call**, but the beastmaster line is plainly an omission rather than a decision.

---

## E. FORTY-SIX PASSIVES ARE OFFERED, DESCRIBED, AND NEVER CONSULTED

Found 2026-08-10 by `harness/audit-passives.js`, the passive half of sub-project B Task 3. It is the
largest single finding in this document — **124 passives in the game, 78 wired, 46 dead** — and it is
the same shape of fault as section A one level up: the content exists, the menu offers it, and no
code ever reads it back.

**Now 96 wired / 28 dead**: `st_ward` (Storm Ward), `bsk_thick` (Thick Hide), `pal_bounce` (Bounce
Back), `mon_flow` (Flow), `chr_potent` (Potent), `mon_killer` (Killer Focus), `r_ambush` (Ambusher),
`x_strength` (Harvested Strength), `r_bounty` (Bounty Hunter), `sky_eye` (Hunter's Eye), `pal_burn`
(Burning Light), `sky_armor` (Sky Armor), `x_crimson` (Crimson Harvest), `chr_echo` (Echo) and
`pal_blessed` (Blessed Blade), `bsk_heavy` (Heavy Hands), `pir_deadly` (Dead Aim) and `mon_master`
(Master Striker) were wired 2026-08-11.
See "Rows taken" at the end of this section. **The Reaper was the first class this sub-project took
from dead passives to none, and the Paladin is the second** — they join warrior, mage, ninja,
warlock and beastmaster, which never had any.

The question the audit asks is deliberately narrow: **does any line in `public/` outside the choice
menu ever mention this passive's id?** A passive is chosen at ranks 3/5/7/9, stored in
`classState(cls).ch[rank]`, and reaches the game only through `c2Passive('<id>')` — 124 call sites
carry a literal id, between them naming the 78 passives that are wired. An id that no call and no
other line mentions cannot affect anything, whatever its card says.

Two regions are excluded from the search and getting that wrong makes the audit useless:
`CLASS2` itself, because a definition is not a use, and **`PASSIVE_ART`, an icon table keyed by every
passive id in the game** — count that as a reader and all 124 look wired forever. Both are located by
their own declarations rather than by line number so they cannot drift.

Checked across every `.js` and `.html` under `public/`, not just `index.html`, in case a passive was
read by the 3D layer. It is not: each of the 46 appears exactly twice, in `CLASS2` and in
`PASSIVE_ART`.

**Which classes are hollow — eleven of the sixteen, and the pattern is not random.** Counts printed
by the audit itself on every gate run, so this table cannot drift from the code:

| class | dead / total | the dead ones |
|---|---|---|
| stormcaller | **6 / 8** | Conductor, Overcharge, Charged, Amped, Static Master, Galvanize (~~Storm Ward~~ wired 2026-08-11) |
| monk | 3 / 8 | Iron Body, Inner Fire, Still Water (~~Flow~~, ~~Killer Focus~~, ~~Master Striker~~ wired 2026-08-11) |
| pirate | 5 / 8 | Sea Legs, Swagger, Slippery, Lucky, Greed (~~Dead Aim~~ wired 2026-08-11) |
| ranger | 4 / 8 | Longshot, Close-Quarters Archer, Escape Artist, Elemental Archer (~~Ambusher~~, ~~Bounty Hunter~~ wired 2026-08-11) |
| berserker | 3 / 8 | Reckless, Bloodthirst, Unbreakable (~~Thick Hide~~, ~~Heavy Hands~~ wired 2026-08-11) |
| chronomancer | 2 / 8 | Entropy, Deep Freeze (~~Potent~~, ~~Echo~~ wired 2026-08-11) |
| necromancer | 3 / 8 | Withering, Plague, Pestilence |
| paladin | **0 / 7** | — (~~Bounce Back~~, ~~Burning Light~~, ~~Blessed Blade~~ wired 2026-08-11) |
| skylancer | 1 / 8 | High Ground (~~Hunter's Eye~~, ~~Sky Armor~~ wired 2026-08-11) |
| reaper | **0 / 7** | — (~~Harvested Strength~~, ~~Crimson Harvest~~ wired 2026-08-11) |
| bladedancer | 1 / 8 | Keep Moving |
| warrior, mage, ninja, warlock, beastmaster | 0 | — |

**The Stormcaller is the worst-hit class in the game twice over** — section A had it missing three of
its eight *skills*, and it was also missing seven of its eight *passives* (six, since Storm Ward).
Between the two, almost nothing a Stormcaller chooses at any rank has ever affected the game.

**And its six remaining dead passives are all one missing mechanic, which is worth knowing before
anyone takes them one at a time.** Conductor, Overcharge, Charged, Amped, Static Master and Galvanize
each modify a lightning CHAIN — "arcs to a third enemy", "jumps twice as far", "each jump hits
harder", "a chained enemy is stunned", "chains that find no second target strike the first twice".
**There is no chain in the game.** `SKILL_FX.st_bolt` is `SKILL_FX.m_bolt` (10124), the mage's single
projectile with `pierce:1` (9860–9868), and a grep for a chain/arc mechanic in combat returns nothing
but scenery. So Chain Bolt's own text — "Rapid bolts that leap to a nearby foe (~2s, softer each)" —
and the capstone's "your lightning arcs to more enemies" are both unimplemented as well. That makes
it one root cause behind six passives, a skill description and a capstone, exactly the shape of
section A. It is bigger than a passive-wiring row and it needs a falloff number the cards do not
state ("softer each" names no amount), so it should be taken as its own piece of work with that one
number put to Oliver.

**A SECOND ROW IS BLOCKED ON A MISSING MECHANIC THE SAME WAY, and it was measured while looking for
the next thing to take.** `bsk_tough` (Unbreakable) — "while below half health you cannot be stunned,
slowed or feared" — **cannot be honestly wired, because the player cannot be stunned, slowed or
feared at all.** `p.stunT` appears in exactly two places in the file: `newG` initialises it to 0
(7672) and `SKILL_FX.bsk_bash` sets it (18999). **Nothing ever reads it.** `p.slowT` and any player
fear do not exist in any form — every `slowT`/`fearT` in the file is on an enemy. So wiring this
passive would be granting immunity to nothing, which is the one thing worse than a dead passive: a
green light on a card that still does nothing.

**And the same two lines are a skill lying, which is section A's shape rather than section E's.**
Headbutt's own comment reads *"It stuns them and it stuns YOU"*, and the self-stun half is that
unread `p.stunT`. The enemy half works. So the drawback the skill advertises — the whole reason the
comment gives for the class having it — has never existed.

**Both halves are left for Oliver deliberately.** Teaching the game to stun the PLAYER is a new
mechanic, not a wiring fix: nothing in the file says what a stunned player cannot do (move? attack?
dodge? all three?), and choosing is a feel decision about how punishing a self-stun should be. That is
`docs/VISION.md`'s "ask first" column. Once it exists, `bsk_tough` becomes a one-line wiring row like
the rest of this section.

The Ranger is the surprise. It is a CORE class, not a variant, and it is the one hand-written kit in
the dead column — six of eight, including both options at rank 3, both at rank 5, and both at rank 9.
So a Ranger's rank-3 "choice" is between two passives that each do nothing, three times over.

**And the six are NOT uniformly blocked — checked 2026-08-11, because "the Ranger is six of eight"
reads like one big job and it is three small ones.** Only rank 3 is blocked, and on a unit rather
than on a mechanic:

| rank | passive | its numbers | state |
|---|---|---|---|
| 3 a | Longshot | "+8% damage to enemies **7m+** away" | **blocked — the game has no metre** |
| 3 b | Close-Quarters Archer | "enemies within **4m** are knocked back" | **blocked — same** |
| 5 a | Escape Artist | "−15% damage taken & −30% slows for 1.5s" | half implementable — see below |
| 5 b | Ambusher | "next click within 3s +20% (once per 6s)" | **wired 2026-08-11 — see Rows taken** |
| 9 a | Elemental Archer | "the element of the ground they fly over" | design — no ground→element map exists |
| 9 b | Bounty Hunter | "−8% to you; killing one heals 4% HP, +10% gold" | **wired 2026-08-11 — see Rows taken** |

**Metres appear in exactly four places in the whole game and all four are dead ranger cards** —
`7m+`, `4m`, `~5m` and `4m` at index.html:2051, 2052, 2053 and 2057. Nothing wired uses the unit and
nothing defines it, so converting `7m` into world units means choosing a scale, which is inventing a
number. That is Oliver's, and it is ONE decision that unblocks both rank-3 options at once.

**Escape Artist is half-blocked for the reason `bsk_tough` is fully blocked:** the "−30% slows" half
cannot be honestly wired because **the player cannot be slowed at all** — `p.slowT` does not exist and
every `slowT` in the file is on an enemy. The "−15% damage taken" half is a one-liner in hurtPlayer
beside `w_unyield`. Wiring half of a card and letting the audit call it wired would be worse than
leaving it dead, so it goes with the missing player-slow mechanic, next to Unbreakable.

**This is `docs/VISION.md` priority #2 in the plainest possible terms.** A rank-3 choice between two
passives that both do nothing is not a build decision, and a class whose entire passive tree is inert
is a stat-reskin of its core no matter what its cards say.

**Recorded as a ratchet, not as a wall.** The 46 live in `KNOWN_DEAD` in
`harness/test/passives.test.js`, so the gate stays green on them while a **newly** dead passive fails
immediately — and the list is checked in both directions, so a passive that gets wired must be taken
out or the test says so. Working these is sub-project B Task 2, one commit at a time, and each fix
takes an id off that Set.

**Scope, stated so nobody over-reads it:** this proves WIRED, not CORRECT. A passive read once and
read wrongly passes. That is the stat-snapshot job Task 3 Step 2 describes and it is much larger
work; this is the floor under it, and the floor is where section A's nine dead skills were found.

### Rows taken

| row | commit | how it was proven |
|---|---|---|
| **stormcaller / Storm Ward** (`st_ward`, r5 b) — "Casting a skill grants a shield equal to 4% max HP." | 2026-08-11 | `harness/probes/stward.probe.js`, A/B in ONE launch |
| **berserker / Thick Hide** (`bsk_thick`, r5 a) — "Damage that would drop you below 1 HP leaves you at 1 instead, once per fight." | 2026-08-11 | `harness/probes/thickhide.probe.js`, FOUR trials in one launch |
| **paladin / Bounce Back** (`pal_bounce`, r7 a) — "Damage you block is returned to whoever dealt it." | 2026-08-11 | `harness/probes/bounce.probe.js`, A/B in one launch: attacker lost 0 before, 57 after, player took 20 in both |
| **monk / Flow** (`mon_flow`, r5 a) — "Each hit shortens your dodge twice as much." | 2026-08-11 | `harness/probes/monkflow.probe.js`, A/B in one launch: ratio 1 before, exactly 2 after |
| **chronomancer / Potent** (`chr_potent`, r3 a) — "Rewinding also restores the mana you had three seconds ago." | 2026-08-11 | `harness/probes/chrpotent.probe.js`, A/B in one launch: the ring recorded no mana at all before, the whole pool came back after |
| **monk / Killer Focus** (`mon_killer`, r7 b) — "The first strike after a dodge hits for triple." | 2026-08-11 | `harness/probes/monkiller.probe.js`, A/B in one launch, two strikes per half: ratio 1.009 on all four before, exactly 3 then exactly 1 after |
| **ranger / Ambusher** (`r_ambush`, r5 b) — "After Tumble/Shadowstrike: next click within 3s +20% (once per 6s)." | 2026-08-11 | `harness/probes/ambush.probe.js`, A/B in one launch, THREE strikes per half: all six 115 before; 138/115/115 against a 115/115/115 control after |
| **reaper / Harvested Strength** (`x_strength`, r3 a) — "Souls you collect are spent on your next skill, making it free." | 2026-08-11 | `harness/probes/soulfree.probe.js`, A/B in one launch, THREE trials per half: all six casts paid full price before; 0 / full price / casts-on-an-empty-bar after |
| **skylancer / Hunter's Eye** (`sky_eye`, r7 b) — "Attacking while falling drives you down onto the target." | 2026-08-11 | `harness/probes/skyeye.probe.js`, A/B in one launch, TWO strikes per half (one falling, one rising): all three halves −100 → −55 with no heading before; −360 at aim exactly 1.0 after, control and rising strikes unmoved, all four damage readings 168 |
| **ranger / Bounty Hunter** (`r_bounty`, r9 b) — "Marked enemies deal −8% to you; killing one heals 4% HP and gives +10% gold." | 2026-08-11 | `harness/probes/bounty.probe.js`, THREE halves in one launch, each measuring a marked foe against an unmarked one: 623/623 damage, 0/0 heal, 550/550 gold on the control; 573/623, 19/0, 605/550 on the passive |
| **paladin / Burning Light** (`pal_burn`, r5 b) — "Killing your Sworn target sets every enemy near it alight." | 2026-08-11 | `harness/probes/palburn.probe.js`, THREE halves in one launch, each carrying an UNSWORN kill and an out-of-radius foe as its own controls: nothing lit anywhere in the control or the known-bad half; 1 stack, heat 1293 and **139 HP burned** off the Sworn target's neighbour in the passive half, unsworn cluster and far foe untouched |
| **skylancer / Sky Armor** (`sky_armor`, r9 b) — "Nothing can hit you in the first moment after a jump." | 2026-08-11 | `harness/probes/skyarmor.probe.js`, THREE halves in one launch, TWO hits per half from two fresh jumps: control 62 early / 62 late, passive **0 early** (invuln 0.18) / 62 late, known-bad 62 / 62 |
| **reaper / Crimson Harvest** (`x_crimson`, r7 a) — "Below half health, every soul you collect heals you outright." | 2026-08-11 | `harness/probes/crimson.probe.js`, THREE halves in one launch, TWO kills per half (one below half health, one above): control 0 / 0, passive **24 then 0**, known-bad 0 / 0, on a 477 HP hero |

| **chronomancer / Echo** (`chr_echo`, r9 a) — "Your last skill fires again, by itself, three seconds later." | 2026-08-11 | `harness/probes/echo.probe.js`, THREE halves in one launch, TWO damage windows per half on one dummy: cast **80 in every half**, second window **0 / 0 / 80**, and the echo's 80 is the cast's own |
| **pirate / Dead Aim** (`pir_deadly`, r3 a) — "The pistol pierces every enemy in a line." | 2026-08-11 | `harness/probes/deadaim.probe.js`, FIVE bodies in a line, THREE halves in one launch: control and known-bad stop at **3 of 5** with pierce spent to 0, the passive half takes **5 of 5** with pierce 99 → 94. The probe's own first two runs said 4 of 5 and the path trace proved that was the shot SINKING, not the pierce — `pierce:96` still in hand when it stopped connecting |
| **monk / Master Striker** (`mon_master`, r9 b) — "Every fourth unbroken strike hits everything around you." | 2026-08-11 | `harness/probes/monkmaster.probe.js`, THREE halves in one launch, each with FOUR strikes then a game-driven chain break then TWO more: a neighbour 120 units away that is never struck directly lost **0 / 0 / 0 / 127** in the passive half and nothing at all in the control or the known-bad, a far foe at 420 lost nothing in any half, and nothing splashed after the break. Photographed at `_shot/out/mm-splash2.png` — the MASTER STRIKER banner over the monk, 112 over the struck foe and 127 over each flanking grunt |
| **berserker / Heavy Hands** (`bsk_heavy`, r3 a) — "You cannot dodge — but nothing can knock you back or stagger you." | 2026-08-11 | `harness/probes/heavyhands.probe.js`, THREE halves in one launch, THREE trials per half: control and known-bad thrown at the game's own **vz 210 / vy 160** with the dodge firing; the passive half **vz 0, vy 0, onGround true, dodge refused** — and **hpLost 6 in all three**, because an early return would have been damage immunity. Dodge button photographed unavailable at `dodgeCd 0` |
| **paladin / Blessed Blade** (`pal_blessed`, r9 b) — "Your oath can be sworn at any range — mark without closing." | 2026-08-11 | `harness/probes/blessed.probe.js`, THREE halves in one launch, THREE trials per half (far / behind / a melee hit): a foe at **600 units against a 198-unit melee aim reach** sworn only in the passive half, the same foe placed BEHIND sworn in no half, the melee hit sworn in every half — and `hurt:false` throughout, so the swing never landed |

### Master Striker — the first row whose card promises a CHAIN, and the one line the fix had to sit above

"Every fourth unbroken strike hits everything around you" is three separate promises, and the whole
row turned on where in `hitEnemy` the wiring goes rather than on what it does.

**Nothing was invented, in any of the three.**
- *"Everything around you"* is the monk's OWN Whirl Kick, verbatim. `SKILL_FX.mon_whirl` is
  `SKILL_FX.w_whirl` (10261): reach `<165+o.r` over `combatTargets()` behind a `losBlocked` check,
  knockback 260, ring `skillRing(...,185)`. The class already had an authored answer to that exact
  phrase, so this passive fires it from a chain instead of from a button and no radius had to be
  chosen. The blow the neighbours take is the one the primary took — `dmg` at the insertion point is
  the final rounded figure (10846) — so the strike really does hit everything around you rather than
  being a second attack with a number of its own.
- *"Every fourth"* is `w_swift`'s shape a hundred lines up (`src._swiftHits%4===0`, 10781), and the
  splash is Soul Tether's (10824): a re-entrant-guarded loop over `combatTargets()` from inside
  `hitEnemy`. **The guard is load-bearing rather than tidy** — the splash's own hits pass back through
  `hitEnemy` with `src===G.p`, so without it they would count as strikes and every fourth splash
  would set off another.
- *"Unbroken"* is the monk's own Focus rhythm. Focus is built on every monk hit and its stacks are
  zeroed by `class2Innate` the moment `focusT` lapses (10048), so the game already owned a definition
  of "the monk stopped attacking" and this borrows it instead of introducing a second window with a
  second number in it.

**AND THAT IS WHY THE FIX SITS ONE LINE ABOVE THE FOCUS REFRESH, NOT BELOW IT.** The next line
(10882) sets `focusT` to 4 on every monk hit. Read after it, the window is always alive, every strike
looks like a continuation, and the card's "unbroken" quietly degrades into a plain lifetime counter
that never resets. The pre-hit state of that window exists for exactly the span between the damage
being applied and the refresh, and that is where the counter is read.

**The chain break needed its own phase, at a non-multiple of four, or it could not have been observed
at all.** Breaking the chain after 4 strikes and then landing 4 more proves nothing: with a reset the
splash comes on the 4th, and without one the counter is at 8 — which is also a multiple of four.
Modulo arithmetic hides the reset. The probe therefore breaks the chain and lands **two** strikes: 1
and 2 of a new chain splash nothing, while a counter that ignored the break would be at 5 and 6 and
would splash on the second. The break itself is driven by the game — 242 ticks of `update()` until
`focusT` lapses, never by writing the counter — because a probe that resets the state under test is
asserting on something it wrote.

| half | strikes 1–4 on the primary (neighbour lost) | far foe at 420 | after the break |
|---|---|---|---|
| control `mon_still` | 0 / 0 / 0 / **0** | 0 | 0, 0 |
| **`mon_master`, before** | 0 / 0 / 0 / **0** | 0 | 0, 0 |
| **`mon_master`, after** | 0 / 0 / 0 / **127** | 0 | 0, 0 |
| known-bad `mon_iron` | 0 / 0 / 0 / **0** | 0 | 0, 0 |

The primary lost 112 to each of its four strikes in every half, so the zeroes above are real zeroes
rather than a bench that never swung. **The control is the a-side of this very rank and it is also
dead** — there is no wired sibling at monk rank 9 to use, which is itself section E's point in one
line: a rank-9 "choice" between two passives that each do nothing.

*One number worth explaining before someone reads it as a bug:* the neighbours lose **127** where the
primary loses 112. The splash passes the strike's damage back through `hitEnemy`, so the receiving
body runs the pipeline again — element matching, the combo multiplier, its own modifiers. That is Soul
Tether's behaviour too (`hitEnemy(o, dmg*0.4, …)`), and it is the file's existing idiom for "this hit
also lands on someone else".

*And a small correction inside the probe itself, which failed its own clean-check first:* it asserted
`focusT === 0` after the lapse. `focusT` is decremented only while positive and left alone once it is
not, so a lapsed window reads as **−0.02**, never as exactly 0 — every half of the first run was red
against a game that was behaving correctly. The bar now tests `<= 0`. This is the third probe in this
sub-project to be defeated by the exact shape of a timer it was reading rather than by the game.

**Left behind, and stated rather than fixed:** `_stillT` — the standing-still timer that `mon_still`
(Still Water) and `nin_swift` both want — is ticked for the MAGE ONLY (`class2Innate`, 10045:
`if(meta.classId==='mage')`), while `11269` reads it for the ninja. So the next monk row in this
section is blocked behind a one-class guard on a shared field, and the ninja has a live reader of a
timer that never advances. Not chased here: it is one line to widen and it changes a wired ninja
passive's behaviour, which is a different row from a dead monk one.

### Dead Aim — the row where the PROBE was wrong twice and the game was right all along

The wiring is one value. Pierce is already a projectile field, already spent one body at a time
(`13188: if(pr.pierce>0) pr.pierce--; else pr.life=0`), and the flintlock already ships with
`pierce:2`, which carries a shot through exactly three bodies. The card asks for one change and names
its own value — *every* — and **99 is this file's own constant for that**, used verbatim by the
thrown scythe, the hurled axe and the longbow's power arrow, each described in its own comment as
piercing everything. Gated on `w.arche==='flintlock'` rather than on the class, because the card says
THE PISTOL: a Pirate carrying a bow is not carrying the thing this passive is about.

**Then the probe said 4 of 5, twice, and the row nearly went down as half-working.** The wiring was
plainly doing *something* — 3 of 5 before, 4 of 5 after, control and known-bad unmoved — but "pierces
every enemy in a line" does not mean four. The first guess was range and the line was tightened from
a 120-unit gap to 80. It returned 4 again.

**Guessing a third time would have been the mistake. The probe was made to report the shot instead.**
It now samples the live projectile every sixth frame — position, height and pierce remaining — and
the answer was in one line: when the shot stopped connecting it still had **`pierce: 96`**. It had not
run out of pierce. It had run out of ALTITUDE.

`fireProjectile` solves the launch onto the aim target's mid-height, and the muzzle (`p.y+26`) sits
seven units above a grunt's chest (19). That seven becomes a velocity by dividing by the flight time
to the NEAREST body — and with the line starting close, that time is clamped to its 0.12s floor, so
the shot leaves at **−58 units a second** and is under everyone's feet 380 units out. The fix was to
the bench, not the bar and not the game: **start the line 400 units away**, where the same seven units
divided by 0.444s is a −16 drift that costs 12 units of height over the shot's entire life against a
26-unit hit window. Flat shot, five bodies, and the trace to show it:

| half | pierce at muzzle | bodies hit | pierce left when it stopped |
|---|---|---|---|
| control `pir_swift` | 2 | 3 of 5 | 0 — spent |
| **`pir_deadly`, before** | **2** | **3 of 5** | 0 — spent |
| **`pir_deadly`, after** | **99** | **5 of 5** | 94 |
| known-bad `mon_iron` | 2 | 3 of 5 | 0 — spent |

`ok:true / okAgainstInert:false`. Pirate suite 3 pass / 0 fail / 1 unproven; the Ranger — the other
class that lives on `fireProjectile` — is 4 pass / 1 fail, that one being the baselined
`ranger/Tumble` stale description (section C, Oliver's).

**The lesson is this document's own, in a new place:** a bar that fails tells you *that* something is
wrong and never *what*. Two launches went on plausible theories about a probe whose subject was
sitting in a field it was not printing. Cost of adding the trace: one launch. Cost of the two guesses
before it: two.

*Recorded in passing, and it is section D confirmed live rather than inherited:* the probe reports
`inFamily: false` for a Pirate holding the Old Flintlock — its own starting weapon. It fires and
pierces regardless (only the damage is docked), so nothing here depends on it, but the bug is real
and still Oliver's.

### Heavy Hands — the first row with NO NUMBER on either side, and the finding that unblocked it

**This section had already concluded, twice, that "the player cannot be knocked back" and shelved two
rows on it.** `bsk_tough` (Unbreakable) is recorded above as unwireable because `p.stunT` is written
once and read nowhere, and Escape Artist is half-shelved because `p.slowT` does not exist. Both
findings stand. The inference drawn alongside them — that player-side hard control does not exist at
all — did not, and it was wrong by one line.

**`hurtPlayer` 11470–11471 throws the player away from the source on EVERY hit**, at a flat 210 with
`vy 160` and `onGround` cleared. That launch is the game's whole player-stagger: there is no separate
stagger state, and being put in the air with your ground velocity replaced is exactly what interrupts
you. So Heavy Hands' second clause had a real mechanism to be immune to, and being immune to it is
one skip.

**Both halves are booleans, which makes this the cleanest row in the section.** Every other one had to
source a number from somewhere in the file (Crimson Harvest the Void Scythe's 5%, Sky Armor the
dodge's 0.18s, Burning Light the combustion splash's radius, and Blessed Blade got out of it only
because its card says "any"). This one had nothing to source: "you cannot dodge" is the
`input.dodgeEdge` gate refusing, and "nothing can knock you back" is those two lines not running.

**Both halves shipped together, and shipping one would have been the trap.** The card is a TRADE —
the drawback is why the immunity is affordable — so wiring only the immunity turns a rank-3 choice
into a free upgrade and quietly rebalances the class. The probe therefore fails a half that is not
knocked back *and* can still dodge.

**And the third trial is the one that matters most.** The obvious place to put an immunity is an
early return at the top of `hurtPlayer`. That would read as knockback immunity to any bar that only
watches velocity — and it would in fact be **damage** immunity, a strictly different and far better
card than the menu shows. The skip is therefore placed low, past `p.hp-=dmg`, and every half reads
`hpLost` off the same hit. All three lost 6.

| half | knock (vz / vy / onGround) | dodge | hpLost |
|---|---|---|---|
| control `bsk_reckless` | 210 / 160 / false | fired | 6 |
| **`bsk_heavy`, before** | **210 / 160 / false** | **fired** | 6 |
| **`bsk_heavy`, after** | **0 / 0 / true** | **refused** | 6 |
| known-bad `mon_iron` | 210 / 160 / false | fired | 6 |

`ok:true / okAgainstInert:false` after, `ok:false` before. Berserker suite **4 pass / 1 fail** either
side, the fail being the baselined `berserker/Charge:damage` (section B, Oliver's).

**The refused dodge is SHOWN, not swallowed.** The edge is still consumed so a refused press cannot
queue and fire later, and the dodge button carries the same `cooling` class it wears on cooldown —
photographed reading unavailable while `dodgeCdT` is 0, which is the state that only this passive can
produce (`_shot/out/heavy-hud.png`). A passive that eats an input silently is indistinguishable from
a dropped input, and on a phone that is the difference between a build choice and a bug report.

#### A NEW ROW THIS TURNED UP, and it is not the same shape as anything above: `w_unyield` is WIRED AND WRONG

Warrior rank-5 option b (index.html:2040) reads: **"You cannot be staggered, knocked back, or moved
by anything."** Its only reader, `hurtPlayer` 11405, is `if(c2Passive('w_unyield') && p.hp <
effMaxHp(p)*.5) dmg *= .88` — **12% less damage below half health.** Not one word of that is on the
card, and not one word of the card is in the code. It sits four lines above the knock-away it claims
to prevent and does not touch it.

**The passive audit cannot see this and never will.** `audit-passives.js` asks whether any line
mentions the id; this id is mentioned, so the warrior reports 0/8 dead and always has. This is the
gap Task 3 Step 2 names in one sentence — *"this proves WIRED, not CORRECT, and a passive read once
and read wrongly still passes"* — and it is the first concrete instance anyone has found.

**Not fixed here, deliberately, and not for the usual reason.** Nothing needs inventing: the skip now
exists three lines away and `w_unyield` could take it verbatim. But that would *replace* a defensive
bonus a warrior has been playing with for weeks with a different one, which is a balance change and
`docs/VISION.md`'s "ask first" column, not a wiring fix. Two honest resolutions and both are Oliver's:
make it do what it says (and drop the 12%), or keep the 12% and rewrite the card to say so. The one
thing that should not survive is the current state, where the menu promises immunity and delivers a
percentage.

**And `mon_iron` (monk r3 a) is HALF-unblocked by the same discovery, which under this section's own
rule means it is still blocked.** "While your dodge is ready, you cannot be stunned or knocked back":
the knock-back half is now a one-line skip beside Heavy Hands', and the stun half **cannot be honestly
wired, because the player still cannot be stunned** — `p.stunT` is written once (`SKILL_FX.bsk_bash`,
18999) and read nowhere. Wiring one clause and letting the audit call the card wired is precisely the
trade this section already refused for Escape Artist, and for the same reason: a green light on a card
that only half does what it says is worse than an honest dead one. It goes on the shelf beside
Unbreakable and Escape Artist, and **all three come off it together the day the player can be stunned
and slowed** — which is a new mechanic and Oliver's call, since nothing in the file says what a
stunned player cannot do.

### Blessed Blade — the row whose whole implementation is a DIFFERENT MOMENT, not a different effect

**The oath already existed, was already sworn, and already worked.** `CLASS_BASIC.paladin`
(index.html:11224) sets `p._oath` the first time a basic attack lands on something, and three other
places already read it: Holy Power doubles skill damage on it (10787), Burning Light spreads off its
death (10134), and `hurtPlayer` gives you a third off everything else while it lives (11375). So this
card does not ask for an effect. It asks for the same effect at a different MOMENT — on the swing
rather than on the hit — and that is the entire wiring: six lines in `playerAttack`, immediately
after the aim snap so the oath and the swing agree about what the attack is pointed at.

**NOTHING WAS INVENTED, and this row is the cleanest case of that in the section.** Every other row
here had to find its number somewhere in the file (Crimson Harvest took the Void Scythe's 5%, Sky
Armor the dodge's own 0.18s window, Burning Light the combustion splash's radius). This one needed no
number at all, because the card states its own: *"at any range"*. The reach is `Infinity`. Picking
600, or 900, or "twice your weapon range" would have been choosing a number the card refuses to
choose, and every such choice is a balance call that belongs to Oliver.

**The one real decision was WHICH targeting, and the probe is built around it.** `aimTarget(p, w, d)`
behaves differently for a melee weapon than for a ranged one: the melee profile takes the best-aligned
enemy with no line-of-sight and no sight-cone test at all, so at `Infinity` it would have sworn things
through walls and *behind the player's back*. That is a strictly better card than the menu shows —
the kind of bug nobody reports, because it only ever helps. The wiring uses the RANGED profile, whose
`targetInPlayerSight` requires the foe inside the 90° cone with an unobstructed line: **"without
closing" is about distance, and only about distance.** So `harness/probes/blessed.probe.js` puts the
SAME foe at the SAME 600 units straight BEHIND the player in every half, and it must be sworn in
none. It is not — including in the passive half, where everything else changes.

**And the third trial is what makes the control's zero mean anything.** A half also lands an ordinary
melee hit through the game's own `hitEnemy`, which must swear in EVERY half because that path is
untouched. Without it, "the control swore nothing at range" is indistinguishable from a bench that
cannot observe an oath at all — the same shape as the harness's own never-red green light. All three
halves swear the near hit; only the passive half swears the far one; `hurt:false` throughout, so
`playerAttack` really did return without the blade touching anything (melee swings resolve later, out
of `update()`, which the probe never ticks).

Measured, one launch each side of the change, everything else identical:

| half | far (600u) | behind (600u) | near melee hit |
|---|---|---|---|
| control `pal_will` | not sworn | not sworn | sworn |
| **`pal_blessed`, before** | **not sworn** | not sworn | sworn |
| **`pal_blessed`, after** | **SWORN** | not sworn | sworn |
| known-bad `mon_iron` | not sworn | not sworn | sworn |

`ok:true / okAgainstInert:false` after, `ok:false` before. Paladin suite **7 pass / 0 fail** either
side, so nothing in the class moved but this.

**Not photographed, and said plainly rather than implied.** Four renders went at it and none produced
a legible picture: the proof is a floating `SWORN` marker over a foe far enough away to be a few
pixels at the top of the frame, and `--focus` cannot be aimed at an enemy the `--eval` spawns
(`--focus` is evaluated first). The arena was rendered from the changed build and is unchanged
(`_shot/out/blessed-after.png`, `blessed-sworn.png`), so there is no visual regression — but the
verdict on this row rests on the probe, not on an image.

### Echo — and the probe that failed itself first

**Both halves of the card were already in the file.** The mechanism is the MAGE's Echo of the Weave
(`useSkill` 10499), which re-calls the same `fx` for a repeat cast; the delay is the card's own three
seconds; the power is the skill's own `s.am`, unreduced, **because unlike the mage's card this one
does not say "weaker"** — the mage echoes at 0.35 and says so, this one just says it fires again.
Measured: 80 damage from the cast, 80 from the echo.

**It is armed AFTER the refund check and nulled BEFORE it fires**, which is the whole of its safety.
A cast that found no target never happened — it does not go on cooldown — so it must not leave an
echo behind; and taking the pending echo out of `p._echo` before invoking the handler means an echo
can never arm another, since `useSkill` is the only thing that arms one. It also OVERWRITES rather
than queues: "your LAST skill" is one pending echo.

**It is cleared for every other class**, in the `else` of its own tick, so a chronomancer's unfired
echo cannot go off in somebody else's hands after a class swap.

**THE PROBE'S OWN CLEAN-CHECK WAS WRONG ON THE FIRST RUN, and the numbers under it were already
right.** It asserted the skill was on cooldown, and read that four seconds after casting a skill
whose cooldown is two — so `onCd` came back false in all three halves and `ok` was false while the
damage windows read 98 / 0 / 98 / 0, exactly the result being looked for. That is fault 3 from
Task 1 Step 1 of this sub-project ("it read the cooldown five seconds after the cast") committed
again in a new probe by a different route. A cooldown is evidence that a cast happened and it is only
evidence while it is still running; it is now read in the same statement as the cast.

**Two windows, not one total, and that is the design.** Time Bolt is a stream, so "did more damage
happen" cannot be answered by a single number — the original cast is still landing at 2s. Each trial
records 0–2.5s (the cast) and 2.5–5.0s (where an echo due at 3.0s lands) separately, so the first
window must agree across all three halves and only the second may move. It did: 80, 80, 80.

### Crimson Harvest — the row that finished a class

**Neither half of the card needed a new idea.** A "soul" is a KILL, which is what the Reaper's own
`c2OnKill` block already means by the word: the innate is "slain enemies restore 2 mana" and Soul
Armor on the very next line calls the same event "collecting a kill". And the amount is the Void
Scythe harvest's, verbatim — `Math.max(3, round(effMaxHp*0.05))` at `killEnemy` 10893, under a comment
reading *"every soul reaped restores HP"*, which is this card's sentence written by somebody else
years earlier. So a Reaper's soul is worth 5% of them whoever is holding the scythe.

**"Below half health" is half the sentence, so the probe kills twice per half.** A wiring that healed
on every kill would satisfy a one-kill bar and would be a strictly BETTER card than the menu shows —
the kind of bug nobody reports. Measured: 24 HP below half, **0 above it**, in the passive half; 0 and
0 in both the control and the known-bad.

**The starter scythe is not the Void Scythe, and the probe would have been worthless if it were.** The
harvest at 10893 is gated on `w.reaper`, a flag the legendary carries and CLASSSTART's `Notched Scythe`
does not, so the control's zero is a real zero rather than two equal heals cancelling. `weaponHarvests:
false` is reported on every run so that can never quietly stop being true.

**The known-bad borrows a dead id from another class**, because after this row the Reaper has none of
its own left. `c2Passive` (9987) is a plain id lookup over ranks 3/5/7/9, so putting `mon_iron` in the
Reaper's rank-7 slot reproduces exactly the state the shipped game was in here — which is the point of
a known-bad, and it came back false in the same launch that returned true for the fix.

### Sky Armor — the first row whose whole implementation is one field the game already returns on

**No number was invented and no new kind of protection was added.** "Nothing can hit you" has exactly
one meaning in this file: `hurtPlayer` does `if(p.invuln>0||p.dodgeTimer>0) return;` (11327) *before*
any class clause, any brace, any shield. So the passive sets `p.invuln` and nothing else — it cannot
interact strangely with `sky_soft`'s −15% or the rank-10 capstone, because it returns before either.
"The first moment" is the player's own i-frame window, **0.18**, taken verbatim from the dodge
fourteen lines below the jump handler, whose comment already explains why it is that length ("i-frame
(0.18) sits JUST inside the dash (0.20) — timing has to be right"). Sky Armor is therefore a dodge you
get by jumping, and the two windows can never drift apart.

**It sits INSIDE the jump guard, which is the part worth keeping.** `input.jumpEdge` fires on every
press; the block that consumes it only jumps when `p.onGround||p.jumps<p.maxJumps`. Granting the
window on the edge rather than on the jump would turn the card into "press jump to be untouchable",
which a Skylancer out of air jumps could hold down for the whole fight — a far worse bug than the
dead passive, and one no single-hit bar would ever see.

**THE WINDOW HAS TO CLOSE, and that is the assertion this probe is built around.** Each half jumps
TWICE from a clean stance and takes one hit each time — once in the frame after lift-off, once 20
frames (~0.33s) later. A wiring that made the class permanently untouchable after its first jump
passes a naive one-hit bar. Measured: the passive half took 0 then **62**, the same 62 the control
took, so a window was added rather than the damage being changed. The two hits are separate trials on
purpose — `hurtPlayer` sets `p.invuln=0.7` on every hit that lands (11390), so measured in sequence
the control's early hit would have swallowed its own late hit and the halves would not be comparable.

**The jump is the game's own.** The probe sets `input.jumpEdge` and steps `update()`; it never writes
`p.vy` or `p.invuln`. Sub-project A Task 5's rule — a probe that imitates the thing it measures passes
against the bug it exists to catch — is the reason, and here it also happens to be what proves the
guard above: `jumped` is read back off `p.onGround`/`p.vy` after the frame, in all six trials.

*One thing this row changed outside itself:* `harness/probes/skyeye.probe.js` used `sky_armor` as its
permanent known-bad because it was dead. Its bar is kinematic so it still came back false, but a
known-bad naming a passive that now does something is a comment that has started lying. Swapped for
`sky_high`, which is still dead.

**Bounty Hunter is three clauses, so it is three readers, and the mark — not the passive — is what
each of them is conditioned on.** The −8% is a class line in `hurtPlayer` beside the ninja's and the
warrior's, reading `by` the way the paladin's Oath does two screens up, because this is the only
defensive passive in the game conditioned on WHO is hitting you. The heal sits in `c2OnKill` with the
other kill riders (`war_feast`'s 5% is the same shape). The +10% is a multiplier on the kill's own
purse at the single `awardGold` call in `killEnemy` rather than a second award, so the payout formula
stays in one place and cannot drift from it. Nothing is invented: −8%, 4% and +10% are all printed on
the card, and a mark is `e.markT`, which BOTH of the ranger's rank-8 options already set to 8
(`SKILL_FX.mark` 9860, `SKILL_FX.deathmark` 9951) — so the rank-9 passive always has a source inside
its own kit.

**Every clause has its control INSIDE its own half, and that is the assertion that matters here.** A
wiring that paid the bounty on every enemy rather than on a marked one would satisfy a naive "the
passive half differs" bar and would be a worse bug than the dead passive. So each half hits, and
kills, a marked foe AND an unmarked one: the unmarked numbers must be identical to the control's in
both halves, and they are (623 damage, 0 heal, 550 gold, in all three halves).

**The known-bad is carried in the probe rather than produced by breaking the repo.** A THIRD half
runs with the dead `r_elem` picked again and is fed to the identical bar as if it were the fix —
`okAgainstInert`, which is exactly what this probe would report against a game where nothing reads
the id. It came back `false` while `ok` came back `true`, in the same launch, on real measurements.

**The mark is put on by the game's own Hunter's Mark**, cast through `useSkill` at slot 3, not by
writing `markT` from the probe; it reports `markedBy` so a fallback could never pass silently, and it
did not need one (`cast,cast,cast`).

### Burning Light — the first row where the FIRST wiring passed a wiring bar and burned nothing

**Both of its numbers were already in the file, which is why this row was takeable.** "Alight" is the
game's own Burn stack, and the spread's radius is `igniteBurn`'s combustion splash verbatim —
`dXZ(o.x,o.z,e.x,e.z) < 120+o.r` over `G.enemies`, this file's existing answer to the exact sentence
"the fire spreads to everything near it". The heat is the Sworn target's own `stDmg`, the
representative hit `applyStatus` already records for every damage path in the game, so what spreads is
the fire that was consuming your target rather than a number somebody chose. It sits in `c2OnKill`
with the other kill riders and is conditioned on `p._oath === e`, because *"killing your **Sworn**
target"* is the whole condition on the card — a paladin who kills anything else lights nothing.

**THE FIRST VERSION WAS WIRED, RENDERED THE RIGHT STACK ON THE RIGHT ENEMY, AND DEALT ZERO DAMAGE.**
It handed the spread to `applyElement` alone. `applyElement` → `applyStatus` → `buildAmt(w,boss)`,
which scales buildup with **the weapon's swing speed** — and the paladin's own Squire's Sword yields
**0.95** of a stack. `statusTick`'s DoT is `Math.floor(st.burn) * stDmg * 0.055`, so 0.95 stacks burns
for exactly nothing. Measured in the probe's own first output: `lit.nearA 0.95`, `heat.nearA 1293`,
`lost.nearA 0`.

That is the trap this whole section exists to avoid, one step further in than usual: the audit would
have called `pal_burn` wired, a stack-count assertion would have gone green, and the card would still
have done nothing. A meter filled by repeated swings is simply the wrong rule for a fire spreading off
a corpse — the weapon is not what is burning them, which is why the combustion splash hands over a
whole stack and never consults the weapon at all. The stack is now topped to that whole one after
`applyElement` has done the bookkeeping only it can do (the `stFresh` stamp, without which the stack
lands already past its `STWIN` grace window and decays immediately; `stDmg`; the per-target rate
limit; boss resistance; the ignite reaction at cap). Re-measured: `lit 1`, **`lost 139`**.

**Two conditions, two controls, both inside every half** — `harness/probes/palburn.probe.js` puts two
clusters in the world, one around the Sworn target and one around a foe deliberately not sworn, and
kills both. A wiring that lit on any kill, or lit the whole level, would satisfy a naive "the passive
half differs" bar and would be a worse bug than the dead passive. The oath is sworn by the game
(`CLASS_BASIC.paladin`, on the first non-designated hit) and the probe asserts the second cluster does
**not** take it. Known-bad carried permanently: a third half picks `pal_blessed`, the paladin's other
still-dead passive, and is fed to the identical bar — `okAgainstInert` came back `false` while `ok`
came back `true`, in the same launch.

**The bench does not empty `G.enemies`, and that is a note worth reusing.** Two destinations in this
game end a round when the enemy list drains — the Arena scores it, a campaign area calls
`areaClear`/`openWay` — so a probe that clears the list can end up measuring a different mode than the
one it started in. Existing mobs are deactivated instead, which is what `statusTick` already gates on.

**Storm Ward needed no number invented and that is why it was taken first.** Three classes already
carry the identical sentence and the identical three lines — mage `m_ward` (10404), warlock
`war_shield` (10412), skylancer `sky_guard` at 6% (10417) — so the fix is the fourth twin of an
existing implementation rather than a new mechanic, and 4% is written on the card.

Proven by casting it, not by reading it. The probe picks between the two options at the SAME rank in
the SAME game, so the only difference between the two halves is which passive is chosen: with the
a-side `st_momentum` picked the pool must stay 0, with `st_ward` it must hold 4% of max HP. Both
casts report `onCd:true`, so a zero can never be a cast that silently never happened.

| | control (`st_momentum`) | ward (`st_ward`) | 4% of max HP |
|---|---|---|---|
| before the fix | shield 0 | **shield 0** | 19 |
| after | shield 0 | **shield 21, shieldT 3** | 21 |

(Max HP differs between the two runs — the Arena rolls its own loadout — which is why the probe
computes the expected number from the live `effMaxHp` rather than hard-coding one.)

**Thick Hide was taken second for the same reason, and it is a DEATH SAVE, which the file already
has three of.** `necro_undying` spends a minion on a killing blow (11244), the chronomancer's Rewind
puts you back three seconds (11252), and the pet's One Pack leaves the companion at 1 HP
(`hurtPet`, 11285). So the fourth is a known shape in a function that already branches for it, and
`1 HP` is written on the card. **The one thing not written on the card is what a "fight" is** — and
that number was not invented either: `pal_thick`, forty lines above in the same function, already
defines a fight as ending after five seconds without being hit, and says so in its own comment. The
stamp is written where damage actually LANDS, past every early return, so a dodge, a brace or a
fully-absorbed hit cannot hold a fight open forever and quietly turn "once per fight" into once per
run.

**Four trials in one launch, because a save that fires every time is as wrong as one that never
fires.** The A/B is between the two options at the same rank in the same game; trials 3 and 4 are
what make it *once per fight* rather than *once*:

| trial | picked | HP before | HP after | died? |
|---|---|---|---|---|
| 1 control | `bsk_blood` (b-side, wired, not a death save) | 119 | 477 (respawn) | **yes** |
| 2 thick | `bsk_thick` | 119 | **1** | no |
| 3 again — same fight, no ticks between | `bsk_thick` | 119 | 477 | **yes**, the save is spent |
| 4 rearm — 6.3s untouched, then hit | `bsk_thick` | 119 | **1** | no |

**Death is read from the game, not inferred.** In the Arena `die()` is `arenaRespawn()`, which
increments `G.arenaScore.b`, so a trial "died" when the game's own counter moved — and every trial is
therefore recoverable, which is why all four fit in one launch. Not read off `p.dead`: arenaRespawn
clears it in the same synchronous call. Watched to fail first: against the shipped game all four
trials died, `hpAfter 477` every time.

Photographed as well, and the HUD carries the whole result in two numbers
(`_shot/out/thick-after.png`): **HP 1 / 477** and **Deaths 2** — the two unsaved trials, and the two
saved ones leaving exactly 1. Before: `thick-before.png`.

*One honest limitation:* the probe leaves the Arena's off-class sword in the hero's hands, unlike
`stward.probe.js`. `hurtPlayer` never reads `classFamilyOk`, so nothing measured here depends on it —
but a probe of anything on the dealing-damage side must equip through `classStartWeapon()` as the
bench does.

**Bounce Back needed no number either, because "block" already means one thing in this game.**
`p.guardT>0` makes hurtPlayer do `dmg*=0.4` (11234), so the damage you blocked IS the 60% that
multiply removes — the game computes it for itself. And returning damage to an attacker exists twice
in the same function already: `p.reflectT` throws it back at 1.5x on the very next line, and the
monk's Stillness returns it doubled at 11170 through `hitEnemy(by, …)` inside a try/catch, which is
the shape this copies. The paladin reaches the brace through its own default kit — `pal_bash` is
`w_bash` (guardT 1.2), `pal_taunt` is `bulwark` (guardT 3.2), both a-side and both in the rank-10
build.

| | attacker lost | player took | braced |
|---|---|---|---|
| control `pal_heal` (b-side of the same rank), before and after | **0** | 20 | yes |
| **`pal_bounce`, before** | **0** | 20 | yes |
| **`pal_bounce`, after** | **57** | 20 | yes |

**"Both halves took the SAME hit" is the assertion that says the reflect was added rather than the
brace altered** — a fix that returned damage by weakening the block would satisfy a naive
attacker-lost-something bar. The bar is EFFECT, not amount, on purpose: the brace sits behind class
multipliers (the rank-10 capstone alone is `dmg*=0.82`), so a hard-coded expected number would be a
balance assertion wearing a correctness assertion's clothes. *Not chased, and stated rather than
smoothed over:* 100 incoming computes to about 49 blocked and the attacker lost 57, because the
returned hit goes through the game's own `hitEnemy` and is processed like any other player-dealt
damage. Paladin's skill suite is 7 pass / 0 fail either side.

**Bounce Back's probe has to pin `ch[3]` to the b-side or it reports a false zero for BOTH halves**,
which is worth keeping because it is a trap for any future paladin probe: the a-side is `pal_thick`,
"the first hit of every fight deals no damage at all", and hurtPlayer honours it at 11179 by RETURNING
before the brace is ever reached. `cheatRank10All` takes a-sides, so the first hit of each trial would
be swallowed whole.

**Flow was the cheapest honest row in this section, and it is worth naming why so the next run can
look for that shape first.** The thing it doubles already exists as a number in the file: the monk's
own innate — `CLASS_BASIC.monk` (11103), whose comment is *also* headed FLOW — does
`p.dodgeCdT -= 0.35` on every connecting hit, and the passive's whole sentence is "twice as much".
So the fix is `base * 2` off the innate's own constant, which means nothing is invented, nothing is a
balance decision, and a future retune of 0.35 carries the passive with it instead of leaving two
literals to drift.

| | dodge cooldown cut by one hit | ratio |
|---|---|---|
| control `mon_focused` (b-side of the same rank), before and after | 0.35 | — |
| **`mon_flow`, before** | **0.35** | **1** |
| **`mon_flow`, after** | **0.70** | **2** |

**The assertion is the RATIO, not the number**, because the sentence promises a doubling and an
absolute expectation would go stale the day 0.35 is retuned. Driven through `hitEnemy`, which is where
`CLASS_BASIC[meta.classId]` is dispatched from (10670) — a probe that called the hook itself would be
measuring its own copy. Monk's skill suite is 4 pass / 0 fail either side.

**Potent was cheap for the shape Flow named — the thing it asks for was already in the file.** The
Chronomancer's Rewind keeps a ring of the last 3.5 seconds (`p._rew`, 14 samples at 0.25s, 12583),
and the death save at 11301 already reads `_rew[0]` and restores position and health from it. "The
mana you had three seconds ago" is that same sample's mana, and **the only reason the passive could
not be read was that the push did not record the field.** No number is invented and none of it is a
balance decision.

**Which "Rewinding" it means is settled by the file, not by judgement, and that mattered because
there are two things called Rewind.** The rank-4 skill `chr_blink` is `SKILL_FX.m_blink` — the mage's
teleport, which restores no state and does not go back three seconds. The death save is the one that
does, and `chr_potent`'s two siblings at the neighbouring rank are already wired **inside it**:
`chr_ward` ("for three seconds after a Rewind you cannot be harmed") at 11307 and `chr_haste`
("rewinding resets every skill cooldown") at 11308. So this is the third line of a block that already
had two of the same shape.

| | ring's mana 3.5s ago | mana after the rewind | rewound? |
|---|---|---|---|
| control `chr_haste` (b-side of the same rank), before | **null — not recorded** | 0 | yes |
| **`chr_potent`, before** | **null** | **0** | yes |
| control `chr_haste`, after | 75 | **0** | yes |
| **`chr_potent`, after** | 75 | **75** | yes |

**The control staying at 0 after the fix is the assertion that says the restore is the PASSIVE and
not the rewind.** The ring now records mana for every Chronomancer, so `past` reads 75 on both halves
— and only the half that picked Potent gets it back. Both halves assert `rewound` off the game's own
`G._rewUsed` counter, so a mana reading of 0 can never be a rewind that silently never happened.

Two things the probe had to learn, both by being wrong first: the sample count must be read BEFORE
the killing blow, because the death save does `p._rew.length = 0` on the same array the probe holds a
reference to (the first run printed `samples: 0` beside an `oldestAgeS` of 3.53); and the history is
built by running `update()` until the game has recorded it, never by fabricating a `_rew` array,
which would be asserting on something the probe wrote. The restore is `Math.max` against the mana you
already hold and clamped to `maxMana`, so a "restore" can never take mana away or overfill the pool.

*Recorded unconditionally, and that is deliberate:* the push does not check `c2Passive('chr_potent')`,
because the choice can be re-made mid-run and a ring that only started filling after the choice would
hand back three seconds of nothing. One number per sample, for one class, 14 samples deep.

**Killer Focus was the same trade as Potent: both halves of the mechanism already existed, twenty
lines apart.** `w_tactical` (warrior, Tactical Guard) is armed at the dodge itself — `if(meta.classId
==='warrior'&&c2Passive('w_tactical'))p.tacticalT=2` (12702) — and read on the TAKING side in
hurtPlayer. Killer Focus is that shape mirrored onto the DEALING side, where `CLASS_BASIC.monk`
already sits and where the ninja's Unseen already returns `dmg * 1.5`. "Triple" is the card's own
word, so no number was invented.

**No timer, and that is a decision the cards make rather than one taken here.** `w_tactical`'s card
says *"for 2s"* and its code uses 2; Killer Focus's says *"the first strike after a dodge"*, which
names a consumption condition and no duration. It is therefore a bare flag, spent by the first strike
that lands. Where this file's cards mean a window they say so, and inventing one would be inventing a
balance number.

| | first strike after a dodge | second strike | dodged? |
|---|---|---|---|
| control `mon_med` (a-side of the same rank), before and after | 112 | 112 | yes |
| **`mon_killer`, before** | **113 → ratio 1.009** | 114 → ratio 1.009 | yes |
| **`mon_killer`, after** | **336 → ratio exactly 3** | 112 → ratio exactly 1 | yes |

**Two strikes per half, because "the FIRST strike" is half the sentence.** A passive that tripled
*every* strike would satisfy a naive one-hit bar and would be a different, worse bug. And the dodge is
a real dodge — the probe sets `input.dodgeEdge` and runs a frame of `update()`, so the game's own
branch decides whether a dodge happened, and both halves assert `dodged` off the game's own cooldown
moving. The probe never assigns the flag the passive reads; doing so is the fault the harness plan's
Task 5 records as passing forever against the very bug it existed to catch.

**`G.combo` MUST BE PINNED BY ANY DAMAGE PROBE, and this is the general finding of the pass.** The
probe's first run came back 112, 113, 113, 114 — creeping by one, in sequence, across both halves.
That is `hitEnemy` itself: 10631 increments a global `G.combo` on every hit that passes through it and
10632 multiplies by `1 + min(0.2, G.combo*0.004)`. **No two strikes in a sequence are measured under
the same multiplier unless it is reset**, so an equality assertion between them can never hold, and
the drift runs in exactly the direction that makes a bonus look real. It is global, not a monk
mechanic. `test-skills.js` is immune only because its bar is EFFECT (did HP go down) rather than
amount — anything that starts asserting on damage numbers has to reset this first.

**Ambusher was the first row whose card states EVERY number it needs — +20%, a 3s window, once per
6s — so there was nothing to decide at all.** Both mechanisms existed: `CLASS_BASIC.ranger` (11029) is
already where a ranger's basic attack gets a multiplier, and the two skills the card names are already
`SKILL_FX.r_tumble` / `r_shadow`. The 6s ration is checked at the SPEND rather than at the arm,
because the card rations the *bonus*; rationing the arm instead would let a cast inside the cooldown
quietly eat a window it could not use.

| | first click after the skill | next click | click after a re-cast, 0s later |
|---|---|---|---|
| control `r_escape` (a-side of the same rank), before and after | 115 | 115 | 115 |
| **`r_ambush`, before** | **115** | 115 | 115 |
| **`r_ambush`, after** | **138 → exactly +20%** | **115** | **115** |

**Three strikes per half, because the sentence has three clauses** — "+20%", "next click", "once per
6s". A passive that armed on every cast would satisfy the first two and fail the third, and would be a
different, worse bug than the dead one. No game time passes between the strikes (`G.time` only
advances through `update()`, and none is run), so the third strike tests the ration exactly.

**THE CONTROL IS ITSELF DEAD, which is a first for this section and is stated rather than hidden.**
Both of the ranger's rank-5 options are in section E, so unlike Storm Ward and Bounce Back there was
no wired sibling to use. `r_escape` is still the right control and is arguably a stricter one: it is a
passive *proven* to do nothing on the damage axis.

**The distance trap, specific to this class and worth carrying.** `CLASS_BASIC.ranger` returns
`dmg * clamp(0.75 + d/520*0.6)` — the multiplier IS the range to the target — and Tumble is a movement
skill that rolls the hero backwards. A strike taken after a tumble is therefore at a different range
from one taken before, and comparing them measures the roll. The probe spawns its target AFTER the
cast, at a fixed offset from wherever the hero ended up, and moves it again after the re-cast. The
control's three identical 115s are what prove that worked.

**Harvested Strength had nothing left to decide either — the branch that arms it already said what
it does.** `c2OnKill`'s reaper block (10083) carries the comment *"x_strength's stack counter is gone
with its rewrite (Harvested Strength now makes your next skill free)"*, written when the passive was
redesigned and never followed by a line that read the id. Both halves of the card are defined
elsewhere in the file rather than invented here: a **soul is a kill** in the game's own words (the
Reaper innate is "slain enemies restore 2 mana", and Soul Armor two ranks down calls the identical
event "collecting a kill"), and **free already means a mana cost of nothing** — `m_glass`, Glass
Cannon, is the same word in the same game.

| | cast after a kill | the very next cast | after a kill, with an empty bar |
|---|---|---|---|
| control `x_doom` (b-side of the same rank, wired, works on marks), before and after | 6 of 6 | 6 | **cannot cast at all** |
| **`x_strength`, before** | **6** | 6 | cannot cast at all |
| **`x_strength`, after** | **0** | **6** | **casts, and takes nothing** |

**Three trials per half, because the sentence has three parts.** A passive that merely discounted
every cast would pass trial 1 and fail trial 2 — "your NEXT skill" is half the promise. Trial 3 is
what separates *free* from *cheaper*, and it is also the trap this fix had to walk around:
**zeroing the COST is the obvious implementation and it stops the skill firing at all.**
`spendSkillMana` returns what it charged and `useSkill` reads a zero as *the cast could not be paid
for* (`if(!manaSpent) return`). The payment is therefore skipped rather than priced at nothing, and
the pool is not consulted, so an empty bar still casts.

**Which means Glass Cannon is a LEAD, not a finding, and it is recorded here rather than acted on.**
`skillManaCost` returns 0 for `m_glass` below a quarter health (10325), which is exactly the value
`useSkill` treats as unpayable — so a Mage who picked it may find its skills stop working precisely
when the passive is meant to be helping. **Read from the source and NOT measured**, so it is a
question for the next pass, not a bug list entry: the passive is wired, so `audit-passives.js` cannot
see it either way, and this whole section exists because a passive read once and read wrongly still
passes.

**A refunded cast puts the soul back.** A skill that finds no target returns `'refund'`, takes no
cooldown and — for anyone else — costs no mana. Paying that back as *mana* would hand the player a
pool they never spent, so the soul is re-armed instead.

**Not a balance call, and worth saying so.** Wiring a passive that has never done anything changes
how a class plays, which is Oliver's territory — but every one of the 46 has an authored description
stating its intent, so implementing it is delivering the promise already on the card rather than
inventing a number. Where a description does not say enough to implement (`Greed` — "every 500 gold
sharpens your blade a little further" names no amount), that one is his.

### Hunter's Eye — the first row whose card states NO number at all

Every row taken before this one had its numbers written on it, or one line away: "+20%", "triple",
"twice as much", "4% max HP", "leaves you at 1". **Hunter's Eye says only "attacking while falling
drives you down onto the target"** — no speed, no distance, no damage. That is exactly the shape this
document says belongs to Oliver when a number has to be invented (`Greed`, "a little further"), so the
question was whether one had to be.

It did not. **The drive already exists in the class's own kit and was taken verbatim:**
`SKILL_FX.sky_dive` (10264) is Dive Strike, and it sets `p.vx/p.vz` to 520 along the heading and
`p.vy = Math.min(p.vy, -360)`. Hunter's Eye is that same dive on the ordinary airborne attack, with
one difference the card itself dictates — it aims at the TARGET (`atan2(e.x-p.x, e.z-p.z)`) rather than
at where the camera points. Same rule as `mon_flow` taking the monk innate's own 0.35: change Dive
Strike and the passive follows, and there is no second number to retune.

**It TRADES the innate's hang rather than adding to it, and that is the point of the choice.**
`CLASS_BASIC.skylancer` already did `p.vy *= 0.55` on a falling attack — "attacking keeps you up". The
passive returns before that line, so picking it makes you the Skylancer who comes DOWN on things
instead of the one who hangs. A wiring that did both would have left the card's own verb meaningless.

| | falling strike (vy −100 in) | rising strike (vy +200 in) | heading left behind | damage |
|---|---|---|---|---|
| control `sky_float` (a-side of the same rank, wired — it softens gravity), before and after | **−55** (the hang) | 200 | none | 168 |
| **`sky_eye`, before** | **−55** | 200 | none | 168 |
| **`sky_eye`, after** | **−360** | **200** | **520, aim exactly 1.0 at the foe** | 168 |

**Two strikes per half, because "while FALLING" is half the sentence.** A wiring that drove you down
whenever you were airborne would pass a one-strike bar and would be a worse bug than the dead passive —
it would cancel the class's own rising attacks, which is most of what a Skylancer does. The rising
strike must leave the body exactly as it found it, and does, in both halves.

**The damage column is an assertion, not a decoration.** The card promises movement and says nothing
about damage, so all four readings must be the same 168; a wiring that quietly paid a damage bonus
would be a different promise from the one on the card and would sail through a movement-only bar.

**The measurement is kinematic, which is why it can be trusted at all.** `hitEnemy` dispatches
`CLASS_BASIC[classId]` inside a `try/catch` (10707), so a hook that throws is SILENT — the damage still
lands and nothing is printed. A bar that only read the damage number could not tell a working hook from
a throwing one. Reading `p.vy` and the heading the strike leaves behind cannot be satisfied by an
exception.

*A negative finding from picking this row, recorded so nobody re-derives it:* **`chr_freeze` (Deep
Freeze) — "a frozen enemy shatters instantly if you strike it from behind" — is blocked, and not on a
number.** The frozen half exists (`freezeChill`, 9542, sets `stunT`/`freezeCd` and prints FROZEN); the
BEHIND half does not. Nothing in combat knows which way an enemy faces — the ninja's Unseen, the one
mechanic in the game whose own text says "from behind", is a *stand-still* timer (`p._stillT`, 11142)
that teleports you round the target rather than a facing test. Wiring this would mean inventing an
enemy-facing model, which is a new mechanic and Oliver's, and it goes next to `bsk_tough` and Escape
Artist for the same reason.

---

## F. `bladedancer/Riposte:damage` FLAPPED — **FIXED 2026-08-11**, and the lead was only half right

Found 2026-08-11 by hitting it. A full `run-all.js` sweep reported
`REGRESSION: skills:bladedancer/Riposte:damage` and `GATE: FAIL (1 new)` on a run whose only game
changes were in the 3D renderer and the MP peer fields — nothing that can reach a bladedancer skill.
`node harness/test-skills.js --classes bladedancer` immediately afterwards: **5 pass, 0 fail, 0
unproven.** So it is the bench, not the game.

**Why it matters more than one flaky row.** This is not the harmless kind of flap the header
describes — that one moves a claim between *pass* and *unproven*, which changes a count and nothing
else. This one produces a hard **FAIL that is new**, which is exactly what `run-all.js` treats as a
REGRESSION, and `autopilot.ps1`'s green gate answers a red gate with `git checkout -- .`. **An
unstable assertion here does not just mis-report; it can delete a run's verified work.**

**The likely mechanism, stated as a lead and not as a finding.** `SKILL_FX.bd_riposte` (10236) is a
LUNGE — uncharged it moves the player `55` units along its facing and only then swings `bdArc(p, d,
170, 1.25, …)`, a cone. The bench spawns its dummy at `p.z - 60`. So the lunge lands the player about
**five units** from the target and the arc has to resolve a direction from a near-zero separation.
That is the same family as the geometry note already in `test-skills.js`'s header — "the geometry of
'in front of you' is not simply p.z-90" — and it has not been confirmed; confirming it means
measuring `p.x/p.z` and the dummy's across repeated casts, which nothing has done yet.

### What it actually was — measured by `harness/probes/riposte.probe.js`

The overshoot is real and the arithmetic above is right, but it is **not reachable from the state
the lead assumed**. An UNCHARGED Riposte lunges 55 against a dummy at 60, landing 5 units away —
*inside* the dummy's own 15-unit radius, where `bdArc` skips its cone test altogether
(`if(d>e.r && dot<cos) continue`) and therefore always hits. Six isolated casts: **0 missed**,
`sep 5, overlaps true, dealtAtCast 108` every time.

**A CHARGED Riposte lunges 95, and 95 is past a target standing at 60.** The player lands 35 units
*beyond* the dummy, which is now behind them: `sep 35, overlaps false, dot -1 against a needed
0.81`, cone rejects, **0 damage**. So the flap is not the geometry being marginal — it is the skill
being cast in two different states and only one of them being reachable at will.

**What decided the state was the skill cast one slot earlier.** `bd_counter` is index 0, Riposte is
index 1. Counter opens a 0.65s PARRY window; if the grunt's swing happens to land inside it,
`hurtPlayer` stores a Riposte, and the next cast is the charged one. Whether a grunt lands a hit
inside a 0.65s window is a race — so **the real bench fault was that a skill's verdict depended on
the previous skill's side effects.** A fresh dummy per skill was only ever half the isolation; the
player carried stances, charges, dash flags, i-frames and its own position from one cast to the next.

**Fixed generally, not for the bladedancer.** `test-skills.js` now snapshots every number and
boolean on `G.p` before the drift control and restores it before every cast, so each skill is cast
from the same body. Only scalars are restored — the weapon and `skillCd` are objects and are left
alone — and a key a skill invented is zeroed rather than deleted, because the game reads all of
these as `p.foo||0`. Any class with a stance, a charge or a dash had the same exposure; a denylist
would have had to be rediscovered once per class.

*And the ordering had to move with it.* `mkDummy()` places the dummy at `p.z-60`, so it has to be
told where the player IS. Spawning first and restoring the pose afterwards puts the target 60 units
in front of wherever the *last* skill left the body and then teleports the body back to the start —
a rig with the dummy hundreds of units off to one side. Watched to fail exactly that way: the first
version of this fix took the bladedancer from 1 failure in 3 runs to **3 in 4**. `reset()` now runs
before `mkDummy()` in all three places.

Proof, A/B **in one launch** so the two halves cannot be compared across two different games — same
sequence three times each, the only difference being whether the pose is restored:

| | riposte missed | charged on each replay |
|---|---|---|
| isolated, nothing else cast | 0 / 6 | false, false, false, false, false, false |
| bench order, no pose restore | **2 / 3** | false, **true**, **true** |
| bench order, pose restored | **0 / 3** | false, false, false |

And end to end through the real suite: `node harness/test-skills.js --classes bladedancer` failed
**1 of 3** runs before, and passed **5 of 5** after.

### The GAME finding this turned up, which is NOT fixed

**A charged Riposte whiffs a target it is standing next to.** The lunge is 95 units and the cone
only forgives a target whose body overlaps the swing origin, so any enemy inside ~80 units is
dashed straight past and missed — and a parried enemy is by definition the one that just hit you in
melee. The *stronger* half of the counter is the half that cannot connect at counter range. The
class's own other dash already handles this: `bd_step` (10237) sweeps the whole dash SEGMENT for
hits; `bd_riposte` teleports through everything and only swings at the far end.

Left alone deliberately. Changing a lunge distance or an arc is feel, and this document's own rule
is that balance belongs to Oliver — but unlike sections C and D this one needs no number invented,
because `bd_step` shows what the fix looks like in the same class.

---

## G. PICKING FRENZY HARD-LOCKED THE GAME — **FIXED 2026-08-11**

Found the same day, as a free diagnostic inside `harness/probes/thickhide.probe.js`: the Thick Hide
trials had to steer around berserker rank 7 to be trustworthy, so the probe measured what it was
steering around rather than assuming it. `hurtPlayer:11205` read

```js
if(meta.classId==='berserker'&&c2def('berserker')){ if(c2Passive('bsk_frenzy')){ … v*=1+(1-fr); }}
```

**There is no `v` in `hurtPlayer`.** The identical clause appears three more times in the file (3740,
3754, 3760) where a local `v` is the stat being scaled — 3754 is `effAtkSpeed`, where Frenzy is
already correctly implemented. This is that attack-speed line pasted into the damage-TAKEN function,
and the file is strict (`index.html:1019`), so it threw `ReferenceError: v is not defined` on **every
hit a Frenzy berserker took.**

**Two consequences, both measured by `harness/probes/frenzy.probe.js`, A/B against `bsk_rage` — the
other option at the same rank — in one launch.**

| | frame counter over 12s | last second | HP under three grunts | throws in 900 ticks |
|---|---|---|---|---|
| control `bsk_rage`, before | 4 → 54, climbing | **4** | 477 → 469 | 0 |
| **`bsk_frenzy`, before** | 4 → **37, then stopped** | **0** | **477 → 477** | **811**, first at tick 89 |
| control `bsk_rage`, after | 4 → 53 | 4 | 477 → 467 | 0 |
| `bsk_frenzy`, after | 5 → 54 | **5** | **477 → 467** | **0** |

1. **THE GAME FREEZES, PERMANENTLY.** `frame()` (18794) has no try/catch and calls
   `requestAnimationFrame(frame)` on its LAST line, after `update(DT)` — so an exception out of update
   never reaches the reschedule and the loop is never re-armed. Read from the game's own frame counter
   (`voxMetrics().frame`) sampled once a second through the real rAF loop: with Frenzy picked it climbs
   to 37 and does not move again for four straight seconds. Photographed either side — before, a burst
   of gold particles hanging motionless in mid-air (`_shot/out/frenzy-before2.png`); after, a live
   fight with a `-5` over the grunts (`frenzy-after.png`).
2. **Until it locks, you are invulnerable.** The throw fires before `p.hp-=dmg` (11226), so the hit is
   swallowed whole: 477 HP unmoved across 900 ticks with three grunts on top of the player, against
   the control's 477 → 397.

**Rank 7 is one of exactly two choices, reachable by any berserker who plays that far, so this is
half a rank rather than an edge case.** Nothing had caught it because `cheatRank10All` takes the
a-side, so the bench has only ever played `bsk_rage`; and the audit in section E cannot see it either
— `bsk_frenzy` IS wired, three times over, and being read in a fourth place that crashes is not a
question "does anything read this id" can ask.

**Fixed by DELETING the clause, not by giving `v` a meaning.** Frenzy is attack speed, it already
works in `effAtkSpeed`, and there is nothing it could honestly mean to damage taken — inventing a
defensive bonus here would be putting a number on a card that does not have one, which is the one
thing this document forbids. The berserker skill suite is unchanged either side of the fix (4 pass /
1 fail, the fail being Charge's missing damage, already baselined and Oliver's).

*The measurement itself needed correcting once, which is worth keeping.* The freeze phase first ran
for four seconds and reported **both** halves alive and neither taking damage — a green-looking pair
of samples measuring a fight that had not started. Headless SwiftShader runs this scene at ~5fps and
`frame()` clamps dt to 0.05, so four real seconds buy under ONE second of simulation, and the first
grunt hit lands at 1.2s. The probe now runs twelve seconds and **asserts that the control took
damage** as a precondition, so it cannot go green off a window too short to see anything.

---

## Not listed here, and why

- **`ninja/Death Mark` and `pirate/Cannonade`** — unproven, not failed. Both promise damage owed by
  another source or on a condition the bench never meets (the dummy has 100000 HP and never dies).
- **`reaper/Soul Siphon:heal`, `paladin/Shield Bash:shield`, `paladin/Taunt:shield` and
  `beastmaster/Guardian Bond:shield`** — half of the previous eight-row baseline, all four of them
  artefacts of bench faults 1 and 2 above. They pass now. A fifth,
  `chronomancer/Time Warp:damage`, survives under a different and much more specific name
  (`dead handler`, section A). The remaining three — `ranger/Tumble`, `mage/Attunement`,
  `berserker/Charge` — are sections B and C.
- **`p.siphonT`** — `SKILL_FX.x_siphon` (10175) sets it and **nothing in the file ever reads it**, so
  the "for 4s" half of Soul Siphon's drain is not implemented. The heal and the damage both land, so
  the claim passes and this is not a failure; recorded because it is a real dead field and the next
  person to read that line should not have to grep for it twice.
