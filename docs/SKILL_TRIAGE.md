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

> **SUPERSEDED IN SCOPE, 2026-08-12 — it is TWELVE, not two, and they share one cause. See section J.**
> Attunement is row 8 of that table. Only `ranger/Tumble` below is outside it. Read J before acting on
> anything here; the closing note in this section is corrected there.

Per this plan's own constraint, a skill is never "fixed" by rewriting its description to match
broken behaviour. Both of these look like the description was left behind by a deliberate redesign
whose intent is written in the code's own comment, which makes them content decisions, not bugs.

| class | skill | claims | its description | what the code does | status |
|---|---|---|---|---|---|
| mage | Attunement | damage | "A 4s storm repeatedly damages enemies around you." | `SKILL_FX.m_tempest` is **redefined at 18708** as a pure buff: "Your element changes on every cast for 10s." No damage at all. | needs Oliver |
| ranger | Tumble | damage | "Roll back ~5m with brief i-frames + a 0.75x parting shot. A dodged hit keeps Clear Aim." | `SKILL_FX.tumble` (9812) dodges, grants invuln and SNARES. There is no parting shot. | needs Oliver |

Worth noting on Attunement: the redefinition (now at **19291**, not 18708) only rebinds `m_tempest`.
The aliases `chr_tempest`, `st_storm` and `necro_storm` were assigned from `m_tempest` *earlier*
(10279 and neighbours) and therefore still held the ORIGINAL damage-storm function.

**TWO THIRDS OF THAT PARAGRAPH IS NO LONGER TRUE, and it is corrected here rather than deleted
because the reasoning was right and the file moved under it.** `chr_tempest` and `st_storm` are BOTH
redefined again, later still, at 19253 and 19299 — as Stopped Clock and Conduit, neither of which is
a storm and neither of which deals damage. So they no longer get the storm their cards promise, and
they are rows 1 and 3 of section J. **Only `necro_storm` still holds the original damage storm**, and
its card ("A storm of decay rages around you for 4s") is the one of the three that is still honest
about the damage — though `harness/probes/necrot.probe.js` has separately measured that it lands no
decay at all, which is section E's necromancer group.

The general lesson is the one this file keeps paying for: `SKILL_FX` is a plain object written to in
three places, so **a note about what a name points at is true only on the day it is written.** Section
J's sweep — list every `SKILL_FX.<id>=function` and take the LAST one — is the form that stays true.

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

**CORRECTION, 2026-08-12: THE POPULATION IS 128, NOT 124** — and the four the audit could not see are
in section P below. Every count in this section that says 124 is four short for that reason; the
number of DEAD is unaffected, because all four are wired. **Read this section as `128 total, 102
wired, 26 dead`.** It is also the reason the phrase *"the only figure here that cannot drift"* below
was too strong: a number recomputed from the game every run is still only as good as the parse that
produces it.

**Now 102 wired / 26 dead** — the count `harness/audit-passives.js` prints on every gate run, which is
recomputed from the game rather than carried forward in prose:
`st_ward` (Storm Ward), `bsk_thick` (Thick Hide), `pal_bounce` (Bounce
Back), `mon_flow` (Flow), `chr_potent` (Potent), `mon_killer` (Killer Focus), `r_ambush` (Ambusher),
`x_strength` (Harvested Strength), `r_bounty` (Bounty Hunter), `sky_eye` (Hunter's Eye), `pal_burn`
(Burning Light), `sky_armor` (Sky Armor), `x_crimson` (Crimson Harvest), `chr_echo` (Echo) and
`pal_blessed` (Blessed Blade), `bsk_heavy` (Heavy Hands), `pir_deadly` (Dead Aim), `mon_master`
(Master Striker) and `pir_swagger` (Swagger) were wired 2026-08-11.
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
| pirate | 3 / 8 | Sea Legs, Lucky, Greed (~~Dead Aim~~, ~~Swagger~~, ~~Slippery~~ wired 2026-08-11) |
| ranger | 4 / 8 | Longshot, Close-Quarters Archer, Escape Artist, Elemental Archer (~~Ambusher~~, ~~Bounty Hunter~~ wired 2026-08-11) |
| berserker | 3 / 8 | Reckless, Bloodthirst, Unbreakable (~~Thick Hide~~, ~~Heavy Hands~~ wired 2026-08-11) |
| chronomancer | 2 / 8 | Entropy, Deep Freeze (~~Potent~~, ~~Echo~~ wired 2026-08-11) |
| necromancer | 3 / 8 | Withering, Plague, Pestilence — **all three one missing mechanic, measured 2026-08-12** |
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

**THE NECROMANCER'S THREE ARE ALSO ONE MISSING MECHANIC, and this one was MEASURED rather than read
— 2026-08-12, `harness/probes/necrot.probe.js`.** All three cards are written about one state:
`necro_wither` (*"enemies standing on a corpse cannot heal and **rot** slowly"*), `necro_plague`
(*"an enemy that dies while **rotting** infects everything near it"*) and `necro_pest` (*"your
minions leave a **rotting** trail"*). The game has exactly one decay status — `venom` (`EL_STAT`,
9507) — and it is only ever reached through `applyElement`, which in turn is only ever reached from a
WEAPON'S element (hitEnemy 10875, the swing 11384, the sweep 13107) or from Burning Light's splash.

The probe cast **both sides of all four skill ranks** at a fresh dummy and landed a real swing with
the class's own starter, then read the dummy's status object back. `anyVenom: false`. Not one of the
eight produces it:

| cast | its own words | what actually landed |
|---|---|---|
| Plague Bolt | "rapid-fire bolts of **necrotic plague**" | `burn 1.35` — the WEAPON's fire, not the skill's |
| Death Storm | "a storm of **decay** rages around you for 4s" | **nothing at all**, on 862 damage |
| Death Grip | "a skeletal grip implodes enemies inward" | `burn 1.35`, same weapon element |
| Corpse Nova, Summon Skeletons, Raise the Dead, Bone Wall, Army of the Dead | — | nothing |
| a real swing | — | `burn 1.35` |

**The only status a Necromancer can put on anything is BURN, and it comes from the Cracked Bonestaff
— the class's own starter is a FIRE staff.** Statically the cause is one line: `SKILL_FX.necro_bolt`
IS `SKILL_FX.m_bolt` and `necro_storm` IS `m_tempest` (10279), so "Plague Bolt" and "a storm of decay"
are the mage's plain bolt and tempest wearing necromancer names. So the three passives are blocked on
a MECHANIC, exactly like the Stormcaller's six, and choosing what rot IS — a new status, or venom
adopted, with a rate and a duration nothing states — is a design decision with numbers in it. **It is
one decision that unblocks three passives, two skill descriptions and the class's whole identity**,
and against `docs/VISION.md` priority #2 that last part is the point: a Necromancer currently plays as
a mage with skeletons.

*Two things the probe had to be corrected on, both worth keeping.* Its first run reported "the kit
rots nothing" **having cast only the a-side of every rank** — `cheatRank10All` picks a-sides, so
Plague Bolt and Death Storm, the two skills whose names promise the exact thing under test, were never
cast. That is this sub-project's two-list trap in a new costume: a bench that names the kit and casts
a quarter of it. And "does it rot" had to be split from "does any status land", because the swing DID
land one — a burn, off the fire staff. Answering this question with a burn stack would have been the
wrong yes.

### What is left in this section, and the ONE decision that unblocks each group

Taken together with the rows above, **every one of the 26 remaining dead passives is now blocked on
something only Oliver can decide** — a number, a unit, or a mechanic that does not exist. That is a
floor, not a wall: none of them needs more investigation, each needs one answer.

| group | rows | the one thing needed |
|---|---|---|
| stormcaller ×6 | Conductor, Overcharge, Charged, Amped, Static Master, Galvanize | **a lightning chain**, plus the falloff "softer each" names no amount |
| necromancer ×3 | Withering, Plague, Pestilence | **what "rot" is** — measured above |
| ranger ×2 | Longshot, Close-Quarters Archer | **what a metre is in world units** (the only four `m` in the game are these cards) |
| ranger ×1 + berserker ×1 | Escape Artist, Unbreakable | **a player slow / stun** — neither exists, so wiring them grants immunity to nothing |
| ranger ×1 | Elemental Archer | a ground→element map |
| chronomancer ×1 | Deep Freeze | an enemy-facing model |
| chronomancer ×1 | Entropy | how fast a held enemy weakens |
| monk ×2 | Inner Fire, Still Water | a mana refund per dodge; a heal rate for "quickly" (Meditation's is 1.2%/s and is the *slow* one) |
| monk ×1 | Iron Body | half of it is the player stun above; the knockback half is a one-liner beside Heavy Hands |
| pirate ×3 | Sea Legs, Lucky, Greed | "cannot be knocked off a ledge" is a mechanic; "sometimes" is a chance; "a little further" per 500 gold is a step |
| skylancer ×1 | High Ground | a height→damage scale; the hook is binary today (×0.8 grounded, ×1.5 airborne) |
| bladedancer ×1 | Keep Moving | as written it is **unbounded** — "you cannot be hit while moving between two parries" gives permanent immunity to a mobile class once it has parried once. It needs a window, and choosing one is a balance call |
| berserker ×2 | Reckless, Bloodthirst | **Reckless has no upside clause at all** — "every swing costs you a sliver of health, hit or miss" and nothing else. The file defines "a sliver" once, as the Warlock's 3% (11411), but the Warlock's version pays ×1.4 damage and refunds on a kill. A pure cost is either the Berserker's low-HP kit being enabled on purpose or a lost clause, and that is a design read. Bloodthirst needs a heal amount |

**Nothing here should be wired by an autopilot run.** Each would mean putting a number on a card that
does not have one, which is the one thing this document forbids.

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
| **pirate / Swagger** (`pir_swagger`, r5 b) — "While your pistol is loaded you move noticeably faster." | 2026-08-11 | `harness/probes/swagger.probe.js`, THREE halves in one launch, TWO walks per half (loaded, then spent) measured as **distance covered at terminal speed** rather than as an effSpeed reading: six walks of 245.4–245.8 before, and after, **270.21 loaded against 245.85 spent** (ratio 1.099) while the control `pir_swift` stayed at 0.998 and the known-bad at 0.999. The pistol is emptied and reloaded through the game's own paths, never by assignment |
| **monk / Master Striker** (`mon_master`, r9 b) — "Every fourth unbroken strike hits everything around you." | 2026-08-11 | `harness/probes/monkmaster.probe.js`, THREE halves in one launch, each with FOUR strikes then a game-driven chain break then TWO more: a neighbour 120 units away that is never struck directly lost **0 / 0 / 0 / 127** in the passive half and nothing at all in the control or the known-bad, a far foe at 420 lost nothing in any half, and nothing splashed after the break. Photographed at `_shot/out/mm-splash2.png` — the MASTER STRIKER banner over the monk, 112 over the struck foe and 127 over each flanking grunt |
| **berserker / Heavy Hands** (`bsk_heavy`, r3 a) — "You cannot dodge — but nothing can knock you back or stagger you." | 2026-08-11 | `harness/probes/heavyhands.probe.js`, THREE halves in one launch, THREE trials per half: control and known-bad thrown at the game's own **vz 210 / vy 160** with the dodge firing; the passive half **vz 0, vy 0, onGround true, dodge refused** — and **hpLost 6 in all three**, because an early return would have been damage immunity. Dodge button photographed unavailable at `dodgeCd 0` |
| **paladin / Blessed Blade** (`pal_blessed`, r9 b) — "Your oath can be sworn at any range — mark without closing." | 2026-08-11 | `harness/probes/blessed.probe.js`, THREE halves in one launch, THREE trials per half (far / behind / a melee hit): a foe at **600 units against a 198-unit melee aim reach** sworn only in the passive half, the same foe placed BEHIND sworn in no half, the melee hit sworn in every half — and `hurt:false` throughout, so the swing never landed |
| **pirate / Slippery** (`pir_evasive`, r7 a) — "Firing the pistol pushes you back out of melee range." | 2026-08-11 | `harness/probes/slippery.probe.js`, THREE halves in one launch, TWO shots per half (loaded, then spent): all six shots moved **0** before; after, the loaded shot moved **139.4** and took the gap from 60 to 199.4 past the game's own reach of **88**, while the spent shot moved 0, the control `pir_luck` and the known-bad `mon_iron` stayed at 0 in both trials, and `dodgeCdT` was never spent |

### Slippery — the one-line reuse was the trap, and the probe was wrong twice before the game was

**Everything the card needs already existed, which is why this row was worth taking.** The shove is
the Pirate's own Roll: `SKILL_FX.pir_tumble` IS `SKILL_FX.tumble` (10304, 10229), whose first line
reverses the dash off the yaw and whose 0.22s at the dash speed of 560 (12874) carries **~123 units**
— against the game's own melee reach of `((e.weapon&&e.weapon.range)||60) + e.r + p.r` (12168), which
the probe measured live at **88**. So the class's own roll distance lands just past its own melee
reach and no distance had to be chosen. Roll's 0.35s of i-frames and its snare are not copied; the
card promises a push and nothing else.

**THE OBVIOUS ONE-LINE FIX IS `p.dodgeTimer=0.22`, AND IT WOULD HAVE SHIPPED AN I-FRAME.** That field
is not just the dash's clock — eight damage tests in the file read it as *this body is dodging*
(11446, 12255, 12672, 13056, 13061, 13064, 13233) and 13003 blocks attacking while it runs. Reusing it
hands every pistol shot 0.22s of untouchability the card never mentions, and the probe would have gone
green on it, because the probe measures the push. Same shape as pass 20's note, where the obvious early
return out of `hurtPlayer` would have read as knockback immunity and been damage immunity. The shove
runs on its own `p._slipT`, driving the identical velocity and nothing else, and the probe asserts
`dodgeCdT` was never spent so the fix cannot quietly become "you also get a free dodge".

**The probe carried two faults of its own, and both would have measured the wrong thing.**
- **It faced the hero the wrong way.** Forward in this game is `(sin(yaw), cos(yaw))` — every
  projectile spawn and every aim solve agrees — so a foe placed at `z−60` in front of a hero at
  `yaw 0` is actually BEHIND it, and a backward dash drives *into* the body. It now turns the hero
  with the game's own `atan2(dx, dz)`.
- **It reset the hero's position between trials but not its velocity.** A dash does not stop dead when
  its timer ends; the leftover 560 goes to the friction tail. Measured on the fixed game: the loaded
  half pushed 139.4 and the spent half that followed it drifted **18.7 with nothing fired** — which
  reads exactly like a passive shoving on every swing, the very bug the spent trial exists to exclude.
  With the velocity zeroed the spent half is 0.

**PHOTOGRAPHED at `_shot/out/slip-shove4.png`** — the pirate standing clear on the right, the grunt it
shot on the left with its health bar down, and a second grunt as a RULER marking the spot it fired
from. It took three renders to get one, and the two failures are worth recording because they are the
harness's geometry rather than anything about the fix. Staged the way the measuring probe stages it —
foe in front, along −z — the shove drives the hero directly AWAY from the camera, and `G.cam` is
already hundreds of units behind (measured on that frame: hero z 493, cam z 65), so the foe ends up
between camera and hero, low in frame, behind the ability bar. Both renders showed a healthy pirate
alone in a healthy arena, which is a photograph of nothing. **`G.cam` does not catch up inside a probe,
either, and that is the useful half:** 65 `update()` ticks moved it zero units, so the lerp lives in
`render()`, which barely runs headless. So the fix is `--focus`, whose whole job is to snap `G.cam`,
and which runs BEFORE `--eval` — the camera stays exactly where focus put it while the hero slides
across the frame. `harness/probes/slippery-shot.probe.js` stages the foe SIDEWAYS for the same reason,
so both bodies share a screen height.

### Swagger — the row that cannot be photographed, and the tolerance that had to be measured

One clause in `effSpeed`, and both halves of it were already in the file. The multiplier is the Dread
Captain capstone's own **1.10**, sitting in the same function one clause to the left, so "noticeably
faster" is the step this class already moves by rather than a number chosen to sound right. The
condition is `p._loaded` — the pistol state the Pirate already keeps, spent in `CLASS_BASIC.pirate`
(11267), reloaded on a kill in `killEnemy` (10939), and already read by its SIBLING at rank 9, where
Cutthroat takes the spent half of the same flag (11265). So a passive that had never been read was
sitting next to a passive reading the exact state it needed.

**`!==false`, not truthiness**, and that is the one subtlety: a Pirate *arrives* loaded with the flag
still `undefined` (12851), so a truthiness test would have left the passive silent until the first
shot — a bonus that only starts working after you stop qualifying for it. `CLASS_BASIC.pirate`'s own
guard reads the flag the same way, which is what settled it.

**THE BAR IS DISTANCE WALKED, NOT `effSpeed()`.** The card promises the player MOVES faster, and this
sub-project has now been burned twice by measuring the thing the code sets instead of the thing the
card promises — Burning Light passed a stack-count bar while burning nobody. A multiplier that landed
in the function and never reached the body would satisfy an `effSpeed` reading and fail this one.
Terminal speed only: 30 warm-up ticks run before the stopwatch starts, because a body accelerating
from a standstill dilutes the ratio toward 1, which is the direction that hides a real bonus.

| half | loaded (units walked) | spent | ratio |
|---|---|---|---|
| control `pir_swift` | 245.42 | 245.83 | 0.998 |
| **`pir_swagger`, before** | **245.67** | **245.83** | **0.999** |
| **`pir_swagger`, after** | **270.21** | **245.85** | **1.099** |
| known-bad `mon_iron` | 245.67 | 245.83 | 0.999 |

Two walks per half, because "while your pistol is loaded" is half the sentence: a passive that simply
made the Pirate faster would satisfy a loaded-only reading, and the spent walk has to come back to the
control's number. It does, to within 0.02 of a unit.

**The probe's own tolerance had to be measured rather than assumed, and its first run was red against a
correct game for that reason.** An exact-equality bar fails on 0.998: a tick-quantised walk cannot land
on the same tenth of a unit twice. The floor measured across six walks is ~0.2%, so the bar admits 1%
— which still leaves the 10% the card promises ten times clear of the noise. Same lesson as the monk
row's `focusT === 0`: read the shape of the quantity before writing the assertion.

**This is the first row in this section with NO PICTURE, and that is stated rather than glossed.** A
movement multiplier does not exist in a still frame; there is nothing to point a camera at. The render
taken alongside (`_shot/out/sw-after.png`) proves only what it can — the Pirate stands in the Arena at
rank 10 with its own bar and its own kit, the kill the probe drove having dropped loot, nothing
broken. The kinematic measurement is the proof, and it is a stronger one than a photograph of a number
would have been.

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

## H. THE NINJA'S UNSEEN NEVER ARMED — **FIXED 2026-08-12**, and the passive audit called it wired

**The largest thing found since section A, and it is the same shape one level down: a mechanic that
exists, is described, is read in four places — and is gated on a clock that does not run.**

`CLASS_BASIC.ninja` (index.html:11312) is the Ninja's entire basic-attack identity, and its own
comment states the promise: *"Stand still for a moment and your next attack lands from BEHIND the
target — a melee class with repositioning built into its ordinary attack rather than into a
cooldown."* That is what makes the class not a Warrior with daggers.

The gate is `p._stillT >= 1` (0.5 with Swift). **`_stillT` is advanced in exactly one place in the
whole file** — `class2Innate`, index.html:10045 — and that line sat inside
`if(meta.classId==='mage')`, because `m_temporal` (effCdr, 3766) was the first thing to want it.
So for every class but the mage the clock stood at 0 forever, and the only two lines that could ever
set it were the Vanish skill (19233) and Combo Edge (10930) — and Combo Edge fires off an Unseen
strike, so it is circular. **Standing still had never armed anything.**

**AND THE PASSIVE AUDIT REPORTED THE CLASS AT 0 DEAD, CORRECTLY, THROUGHOUT.** Two of the Ninja's
cards are written about this clock — `nin_swift` (r3 a, *"Unseen rearms in half the time — strike
from behind twice as often"*) and `nin_combo` (r5 b, *"Killing with Unseen instantly rearms it"*) —
and both ids ARE read by game code, so `harness/audit-passives.js` counts them wired. They are. They
are wired to a clock that does not run. This is the second concrete instance of the limit section E
states in advance (*"this proves WIRED, not CORRECT"*), after `w_unyield` in pass 20, and it is the
worse of the two: `w_unyield` does the wrong thing, this one does nothing at all.

### How it was measured — `harness/probes/unseen.probe.js`, three halves in one launch

Four trials per half, one per clause of the card and two that must NOT fire:

| trial | what it does | must fire |
|---|---|---|
| `still` | 1.2s of the game's own ticks, no input, then a hit | in both live halves |
| `short` | 0.7s — past Swift's 0.5 and short of the base 1 | ONLY in the Swift half |
| `moving` | 1.2s spent walking, then a hit | in NO half |
| `armed` | `p._stillT = 9`, Vanish's own arming line verbatim | in EVERY half — bench liveness |

The bar is **where the body ended up**, not a flag: Unseen mirrors the hero through the target to
`e.r + 26` on the far side (11322), so "it fired" is measured as the hero moving AND the vector from
foe to hero reversing (a negative dot product against where it started). A flag would have gone green
for a wiring that set the field and moved nobody — the shape pass 15 was caught by.

**Before**, all three halves: `stillT 0` after 1.2s at a drift of **0**, `moved 0`, `behind false`,
`hpLost 6`. **After**: the live halves `stillT 1.2`, `moved 101`, `behind true`,
`distAfter 41` = `wanted 41`, `hpLost 8` — the innate's own ×1.5 on a base of 6. The 0.7s trial fires
in the Swift half and not in the one without it, so **Swift is proven as well, and its threshold is
proven, not just its existence**. The walking trial fires in no half. `ok true, okAgainstInert false`.

The permanent known-bad is carried in the probe rather than produced by breaking the repo: a third
half pins `_stillT` to 0 after every tick, which is exactly the state the mage-gated accumulator left
a Ninja in. `okAgainstInert` is therefore what this probe would report against the shipped game.

Photographed at `_shot/out/unseen-strike3.png` — the cyan **UNSEEN** banner over the struck foe with
the **8** under it, the strike burst, and a marker grunt standing on the spot the ninja fired from,
101 units back on the other side of the target. *The staging needed two goes and both failures are
worth keeping:* `G.cam` is advanced by the RENDER loop, not by `update(dt)`, so forty-five ticks
"waiting for the camera" moved it nothing and handed back an empty floor with both bodies off-frame
(hero z 340, `cam z 34`) — it has to be snapped, the way `harness/shot.js:497` snaps it for `--focus`.
And those same forty-five ticks outlived the floater, so the second frame was correct and showed no
evidence. Six ticks and a snap.

### The fix, and the one thing it had to protect

The accumulator is ungated, and **capped at 8**. Vanish and Combo Edge arm Unseen by writing
`_stillT = 9`, and that arm has to survive walking away — it is the whole of Vanish's own comment
(*"the next Unseen strike is already armed"*), and wiping it would be a silent nerf smuggled in by a
fix aimed at something else. With the cap, standing still can never reach 9 on its own, so `>= 9`
means "explicitly armed" and cannot be earned by loitering. No reader is affected: the thresholds in
the file are 0.5, 1 and 1.5.

Nothing else in `public/` reads `_stillT`, so nothing but the Ninja changes. Regression: the skill
suite for ninja and mage — the only two classes that touch this field — reports **6 pass / 1 fail /
1 unproven**, the fail being the baselined `mage/Attunement` stale description and the unproven the
baselined `ninja/Death Mark`. Identical to the last gate report.

### The GAME finding this turned up, which is NOT fixed — Oliver's

**`nin_storm` (r8 b) is named "Vanish" and described as "A spinning storm of steel that cuts
everything around you."** The code implements the NAME: `SKILL_FX.nin_storm` (19232) grants four
seconds of invulnerability, breaks every enemy's target lock, and arms Unseen. There is no storm and
nothing is cut. That is section C's shape — a description that outlived its skill's redesign — and
this document's own rule forbids fixing a skill by editing its description, so which of the two is
the real card is Oliver's call. Worth putting to him with the rest of section C.

---

## I. THE NECROMANCER'S HARVEST ANNOUNCED A CORPSE AND DELETED IT — **FIXED 2026-08-12**

**The third `CLASS_BASIC` identity found broken, after the Ninja's Unseen (section H), and this one
lies to the player's face: the game floats the word `CORPSE` over the target and there is no corpse.**

`CLASS_BASIC.necromancer` (index.html:11393) is the class's whole basic-attack identity and its own
comment states the promise: *"Every basic hit builds toward a corpse: at five, the target drops one
whether it dies or not. A Necromancer should never be short of bodies, and waiting for kills made the
class worst exactly when it was losing."*

It counts to five correctly. It pushes a corpse. It calls `addText(… 'CORPSE' …)` on the next line.
And it pushed that corpse with **`t: 0`**, while `minionUpdate` (11694) does
`for(const c of G.corpses) c.t -= dt; G.corpses = G.corpses.filter(c => c.t > 0)` — so the body was
filtered out on the very next frame. **The kill path three hundred lines up (11024) pushes the same
object with `t: 3.5`.** One field, in the one place the same feature omitted it.

**Nothing had to be invented, which is why this was an autopilot row rather than Oliver's.** 3.5s is
this feature's own corpse lifetime, taken verbatim from the kill path, and the threshold of five is
the hook's own. No number on a card that does not have one.

### How it was measured — `harness/probes/harvest.probe.js`, three halves in one launch

**The bar is the GAME'S OWN discriminator, not a number the probe chose.** `SKILL_FX.necro_raise`
(11732) raises **one** risen fighter off the nearest corpse and, finding none, falls back to **two**
weaker ones (11735). So `risen 1` means a real corpse was consumed and `risen 2` means the cast ran
and found nothing. **A plain "did any minion appear" bar would have gone green against the shipped
game on the fallback alone** — the same shape as pass 15, where Burning Light lit exactly the right
enemy and burned nothing.

| trial | what it does | before | after |
|---|---|---|---|
| `harvest` | five basic hits on a dummy that never dies, then 0.25s of the game's own ticks, then Raise the Dead | added 1, **survived 0, risen 2** | added 1, **survived 1, risen 1** |
| `four` | four hits, not five — "at five" is half the sentence | added 0, risen 2 | added 0, risen 2 |
| `kill` | a corpse from the game's own death path (11024) | added 1, survived 1, **risen 1** | unchanged |

The `kill` trial is the bench-liveness check and it is what makes the control's zeros mean anything:
without it, `risen 2` in the harvest trial could equally have been a bench that cannot observe a raise
at all. It raises correctly in **every** half, before and after.

**The known-bad is carried in the probe, not produced by breaking the repo** (the rule
`level.probe.js`'s `?breakgap` and `mp.probe.js`'s `?heroslot` follow): a third half sets `t = 0` on
every corpse the harvest hook adds, which is the shipped line verbatim. It reads
`added 1, survived 0, risen 2` — **identical to the before-run's live half** — so `okAgainstInert` is
false while `ok` is true, in one launch, on real measurements.

*The probe was wrong once and the before-run caught it.* Its first version pinned **every** corpse in
`G.corpses`, which in the kill trial is the DEATH path's corpse — so the inert half zeroed its own
liveness control and reported `kill.risen 2`. The known-bad has to reproduce the shipped bug and
nothing else; the pin now skips a lethal swing.

The two-list trap is checked inside the probe rather than in a command nobody re-runs: it asserts
`c2CurSkills()[1]` really is Raise the Dead before believing anything (`casts:
["Summon Skeletons","Raise the Dead","Bone Wall","Army of the Dead"]`).

Regression: `node harness/test-skills.js --classes necromancer` → **4 pass / 0 fail / 0 unproven**,
either side. `node tools/gate.js` → `GATE OK`.

### The GAME finding this turned up, which is NOT fixed — Oliver's

**The Necromancer's innate CARD does not describe its basic attack.** `CLASS2.necromancer.innate`
(2103) still reads *"Magic weapons deal +8% damage, and every kill restores 3 mana and leaves a corpse
you can raise"* — the flat percentage the `CLASS_BASIC` header (11209) says these hooks **replaced**,
and no mention of Harvest at all. So the mechanic this section just fixed is one the player is never
told about. That is section C's shape (a description that outlived its skill's redesign) and this
document's own rule forbids fixing a skill by editing its description, so which of the two is the real
card is his. Worth putting to him with the rest of section C — and worth checking the other eleven
`CLASS_BASIC` entries against their innate cards at the same time, because this is unlikely to be the
only one.

---

## J. SECTION C IS NOT TWO STALE DESCRIPTIONS. IT IS TWELVE, AND THEY HAVE ONE CAUSE — Oliver's

**Found 2026-08-12 by the same static sweep as section I, and it is the most useful thing in this
document for the amount of work it takes to settle: twelve rows, one decision.**

`index.html:19210` carries the refactor's own statement of intent: *"Slot 3 is the rank-8 pick, the
last and most exciting choice a class offers — and in nine classes both options were damage with a
different spread… Each replaces the group-damage half with A NEW RULE FOR THE REST OF THE FIGHT."*
Twelve `SKILL_FX` handlers were rewritten at the end of the file (19223–19352) to do exactly that,
deliberately and well. **The `CLASS2` cards the player reads were not rewritten with them.**

So a Chronomancer's rank-8 pick is offered as *"A storm of decaying time around you"* and casts a
three-second freeze that deals no damage at all. A Warlock is offered *"A moving void storm"* and
casts a bargain that spends half his health. Every one of these is the *code* being the interesting
version and the *card* still selling the thing it replaced.

| id | the card the player picks from | what the code actually does | mismatch |
|---|---|---|---|
| `chr_tempest` | **Time Storm** — "A storm of decaying time around you." | **Stopped Clock** — freezes everything but you for 3s. No damage anywhere. | name + text |
| `war_storm` | **Dark Storm** — "A moving void storm tears at nearby foes for 5 seconds." | **Pact** — spend half your current HP, deal exactly that to everything within 380, once. | name + text |
| `st_storm` | **Thunderstorm** — "A storm of lightning rages around you for 4s." | **Conduit** — tethers everything within 340 for 8s so they share damage. | name + text |
| `mon_thousand` | **Thousand Fists** — "A blinding assault: +35% damage and attack speed for 6s." | **Stillness** — for 6s, standing still returns what hits you, doubled. | name + text |
| `bd_steel` | **Dance of Steel** — "Flash between nearby enemies with a rapid series of six cuts." | **Perfect Guard** — a 3s parry state. | name + text |
| `w_berserk` | **Warcry** — "+35% damage and +30% attack speed for 6s." | taunts everything within 620 for 6s. The name is right; the sentence is the old buff. | text |
| `nin_storm` | **Vanish** — "A spinning storm of steel that cuts everything around you." | 4s invulnerable, breaks every target lock, arms Unseen. | text — already recorded in section H |
| `m_tempest` | **Attunement** — "A 4s storm repeatedly damages enemies around you." | your element cycles on every cast for 10s. | text — **this is section C's `mage/Attunement`** |
| `bsk_whirl` | **Whirlwind** — "Spin, cutting everything around you for 2.2x." | **No Retreat** — `_noRetreatT = 10`; all your damage doubles for 10s. | name + text, **and see below** |
| `bsk_cleave` | **Cleave** — "A broad 2.2x blade sweep." | **Bloodletting** — costs 10% max HP, hits for 2.6x within 210. | name + text; the cost is undocumented |
| `bsk_charge` | **Charge** — "Rush forward, damaging and stunning in your path." | **Headlong** — an unsteerable 0.9s dash with i-frames. **No damage and no stun anywhere in the path** (the movement branch at 12853 only moves the body). | name + text — **this is section B's `berserker/Charge:damage`** |
| `bsk_bash` | **Headbutt** — "Drive forward for 1.7x damage and stun." | 2.2x within 150, stuns them 2.2s — **and costs you 6% max HP and stuns YOU for 0.5s.** | text; the self-cost is undocumented |

**TWO OF THE THREE REMAINING BASELINED SKILL FAILURES ARE ON THIS LIST, and that reframes both.**
`harness/baseline.json` holds `mage/Attunement`, `berserker/Charge:damage` and `ranger/Tumble`. The
first two are not bugs at all — they are this refactor's paperwork. The harness is correctly reporting
that a skill does not do what its card says; the card is what moved. Nothing should be fixed in code
for either.

**`bsk_whirl` is the one row here with a SECOND fault, and it is not a description problem.** Its own
code comment (19319) states the design in full: *"You cannot move backwards for 10s, and all your
damage doubles. The class is played by choosing not to retreat; this removes the choice and pays you
for it."* `p._noRetreatT` appears exactly **twice** in the file — set here (19322) and read at 10830
to double outgoing damage. **The movement restriction is not implemented anywhere.** So the cost half
of a deliberately two-sided card does nothing and what ships is a plain ten-second damage doubler.
Left for Oliver rather than wired, for pass 20's reason and not for the usual one: nothing needs
inventing — "backwards" is `p.yaw` and the file already owns per-frame movement overrides three lines
away in `_headlongT` (12853) and `_slipT` — but adding a restriction takes freedom away from a skill
berserkers have been playing with, which is a balance change and his call.

**What is being asked of Oliver, stated so it can be answered in one pass:** for each row, is the CARD
right or is the CODE right? Twelve answers, and every one of them is a sentence rather than a number.
This document's own rule — *never fix a skill by editing its description to match broken behaviour* —
is why no autopilot run may take these: here the behaviour is not broken, it is the newer of the two,
which is precisely the judgement call the rule reserves for him.

*Where this came from, so it can be re-run:* `SKILL_FX` is a plain object and the file assigns to it
in three separate places, so the LAST assignment wins — the block's own header (19216) says it was
appended for exactly that reason. Listing every `SKILL_FX.<id>=function` and comparing the last
definition of each id against its `CLASS2` card is a grep, not a launch. `bd_steel` is defined twice
(10445 and 19271) and only the second one runs, which is the duplicate-body hazard `AUTOPILOT.md`
warns about, caught here by the same sweep.

---

## K. THREE CLASSES PROMISE TO CONTROL WHO THE ENEMIES ATTACK. THERE IS NO AGGRO MODEL AT ALL

**Found 2026-08-12 by the same sweep as sections I and J, and it is the one finding here that is
about `docs/VISION.md`'s FIRST priority rather than its second: in co-op, no one can take a hit for
anyone.** It is recorded and not fixed, because unlike I and J the missing piece is a mechanic.

Four fields carry the idea of aggro in this file. **Every one of them is written and read by nothing.**

| field | written at | read at | what it is supposed to do |
|---|---|---|---|
| `e.taunt` | 9951 (`bulwark`, which IS `pal_taunt`), zeroed 9980 | **nowhere** | the source comment says `// pull aggro` |
| `e._taunt` | 19228 (`w_berserk`, Warcry) | **nowhere** | hold the taunt for 6s |
| `p.warcryT` | 19230 | **nowhere** | the 6s duration |
| `e.target` | 19228 (set), 19263 (cleared by Vanish) | **nowhere** | who this enemy is attacking |

`e.target` deserves its own line: a grep for `\.target\b` in the whole file returns twelve hits and
**ten of them are DOM events** (`e.target.value`, `e.target.closest`). The enemy-facing field exists
in exactly two lines of game code, one of which sets it and the other of which clears it. Nothing
between them ever asks what it holds.

**And that is not an oversight in three skills, it is the architecture.** The enemy AI has no
target-selection step to taunt: melee contact damage is applied straight against the local player
(`13244`, `hurtPlayer(…)` guarded only by `dXZ(e.x,e.z,p.x,p.z)`), and `p` is `G.p`. An enemy does not
choose whom to attack, so there is nothing for a taunt to change.

**What each of the three skills actually ships:**

- **warrior / Warcry** (`w_berserk`, r8 a — one of the two climax picks the whole class builds
  toward). Its three effects are `e._taunt`, `e.target` and `p.warcryT`, all write-only. **What ships
  is a floating `WARCRY xN` and a ring.** This is section A's shape — a cast that spends its cooldown
  and does nothing — on a rank-8 pick, and section A is the closest thing in this document to Oliver's
  original report.
- **paladin / Taunt** (`pal_taunt`, which aliases `bulwark`). The brace half is real and works
  (`p.guardT=3.2`, read in `hurtPlayer`). **"Pull nearby foes to you" does nothing** — there is no
  pull and no aggro. This document already records `paladin/Taunt:shield` as passing; it passes on the
  half that works.
- **ninja / Vanish** (`nin_storm`). The four seconds of invulnerability are real. **"breaks every
  enemy's target lock" is the `e.target=null` line above**, which clears a field the AI does not read.

**AND THE HARNESS CANNOT SEE ANY OF IT, which is worth fixing before the skills are.** `claims.js`
has no rule that turns *"Pull nearby foes to you"* into a claim — its control pattern is
`stun|slow|root|knockback|fear|freez|immobil|silenc`, with no `pull` and no `taunt`. So the bench has
never had an assertion to fail. **Do not simply add the word:** a new rule here creates failures that
are not in `harness/baseline.json`, `run-all.js` calls those REGRESSIONs, and `autopilot.ps1` answers
a red gate with `git checkout -- .` — so the right order is a rule and a re-baseline in one deliberate
pass, sub-project A's work rather than a side effect of this one.

**Why an autopilot run must not take this.** Wiring a taunt means giving enemies a target to choose,
which is a mechanic that does not exist and would change how every fight in the game behaves — the
same bar section E's remaining rows are held at, and a much larger piece of work than any of them. It
is also the piece that would make a Paladin or a Warrior mean something in a party, so it belongs with
`docs/MP_AUDIT.md` and the multiplayer plan rather than in a skill pass. **Oliver's, and worth putting
to him as a co-op question, not a bug list.**

---

## L. THE BEASTMASTER'S COMPANION NEVER TOOK THE ORDER — **FIXED 2026-08-12**

**The fourth `CLASS_BASIC`-shaped identity found broken, after the Ninja's Unseen (H) and the
Necromancer's Harvest (I) — and the worst of the three, because the hook died on its FIRST
STATEMENT and every other fault in it had therefore never had a chance to matter.**

`useSkill` (index.html:10544) opens with the class's whole statement of what it is:

> THE BEASTMASTER'S COMPANION TAKES YOUR SKILL INPUTS. Press a skill and the pet commits too — it
> lunges at whatever you are aiming at and its own attack comes off cooldown at once. You are
> playing two characters, which is the class: every skill is also an order.

It then does four things, and announces a fifth to the player's face — `addText(… 'SIC EM' …)`.
**Three separate faults, stacked, each one hiding the one underneath it:**

1. **`aimTarget()` was called with no arguments.** Its first act is `playerAimYaw(p)`, so it threw on
   `undefined.yaw` — straight into the hook's own `try{}catch(err){}`. **Nothing in the hook ran, not
   even the SIC EM.** Measured, not read: the probe calls it the same way and reports
   `"Cannot read properties of undefined (reading 'yaw')"`, and it keeps that call as a permanent
   diagnostic so the fault cannot come back invisibly.
2. **`orderX`/`orderZ`/`orderT` were read by nothing.** `petUpdate` (11651) picks its target by
   proximity **to the pet**, leashed to foes within 460 of the hero, and has no notion of what you
   are aiming at. So even a stored order changed nothing.
3. **`pet.atkCd = 0` is the wrong field.** The companion's attack timer is `pet.atkT` (11672).
   `atkCd` belongs to the player (9653) and to PvP bots (12708) — which is exactly why a
   receiver-agnostic reader search cannot see that one dead, and it is the limit
   `harness/audit-fields.js` states about itself up front.

**Nothing had to be invented, which is why this was an autopilot row rather than Oliver's.** 3.5s is
the hook's own duration. `PET_LEASH` is `petUpdate`'s own 460, now named and used in both places so
an order can never name a foe the companion was not already allowed to engage. The selector change
is a metric swap — nearest to the aim point instead of nearest to the pet — not a new rule.

### How it was measured — `harness/probes/petorder.probe.js`, three halves in one launch

**The bar is which foe the pet GOES FOR**, not whether the fields hold values. This document has
twice recorded being burned measuring what the code sets instead of what the player is promised
(pass 15, Burning Light lit exactly the right enemy and burned nothing). Each trial stands two foes:
`near`, parked on the pet and away from the hero's aim, and `aimed`, straight down the hero's
forward vector and further from the pet. The melee dart plants the companion on its target
(`petAttack`, 11688), so the choice is readable as a distance *and* as HP lost.

| | before | after |
|---|---|---|
| ordered: pet → aimed foe | **525** | **31** |
| ordered: pet → near foe | 33 | 463 |
| ordered: aimed foe HP lost | **0** | **55** |
| ordered: near foe HP lost | 55 | **0** |
| ordered: `orderX/Z/T` after the press | `null / null / 0` | `0 / 640 / 3.5` |
| ordered: `atkT` after the press | 0.9 | **0** |
| **no order pressed**: pet → near / aimed | 35 / 527 | 35 / 527 |

**The no-order control is what makes the rest mean anything, and it holds in ALL THREE halves.** A
fix that simply sent the companion at the reticle forever would clear a one-trial bar and would be a
worse card than the one the class was designed around; with nothing pressed the pet still takes the
foe beside it.

**The known-bad is carried in the probe, not produced by breaking the repo** (the rule
`level.probe.js`'s `?breakgap` and `mp.probe.js`'s `?heroslot` follow): a third half pins
`pet.orderT` back to 0 on every tick, which is exactly what "nothing reads orderT" amounts to. It
reads `toNear 33, toAimed 525, nearLost 111` — **identical to the before-run** — so `okAgainstInert`
is false while `ok` is true, in one launch, on real measurements.

**The skill pressed is slot 2, Mend the Pack**, and the choice is load-bearing: it is a heal that
touches no enemy and no pet targeting. Sic 'Em, Coordinated Strike, Pack Step and Stampede all move
or aim the companion themselves, so pressing one of those would have let the **shipped** game pass
this bar on the skill's own effect and prove nothing. The probe asserts the slot has not drifted onto
one (`commandsPet: false`).

*Two things the probe was wrong about first, both caught by a run rather than by reading.*
`spawnPet()` takes **no arguments** — it reads `meta.petActive` (11631) — so the first launch came
back `no companion could be put in the field` and measured nothing. And the companion had to be the
Beastmaster's own `spiritwolf`, which `PETIDS` does not list because it is `hidden:true` (it is
summoned by Bonded Companion, never sold).

Regression: `node harness/test-skills.js --classes beastmaster` → **6 pass / 0 fail / 0 unproven**.
`node tools/gate.js` → `GATE OK`. Unit stage 53/53.

**No picture.** A retarget is a behaviour and does not exist in a still frame, said plainly rather
than glossed — the same honesty pass 23 (Swagger) had to state about a movement multiplier. The
after-frame confirms only what a frame can: the class, a live Spirit Wolf at 264/264, an intact HUD.

### The GAME finding this turned up, which is NOT fixed — Oliver's

**The Beastmaster's innate CARD does not describe the mechanic above.**
`CLASS2.beastmaster.innate` (2223) still reads *"Your companion gains +25% max HP and +15% damage or
healing…"* — and the hook's own comment says that flat bonus is *"the exact stat-reskin this rewrite
exists to remove."* So the identity this section just brought to life is one the player is never
told about. Section J's shape exactly, and this document's rule forbids fixing a skill by editing its
description, so which of the two is the real card is his. **Worth answering with the section J
twelve, as a thirteenth row.**

---

## M. WHAT THE FIELD SWEEP FOUND AND DID NOT FIX — three rows, all Oliver's

`harness/audit-fields.js` (added 2026-08-12) is the widened static sweep
`docs/superpowers/plans/2026-08-10-skill-correctness.md` asks for by name: every field the game
**writes and never reads**, over `p.`, `e.`, `G.`, `G.pet.` and a receiver-agnostic `*` mode. It
independently reproduced every field sections J and K found by hand, found section L above, and
turned up three more that are recorded rather than taken.

**TWO OF THE SIX BOSS PHASE-2 MECHANICS ARE ANNOUNCED AND NEVER BUILT.** `BOSS_PHASE2` (19379) gives
each boss a second half that changes what the fight *is*, and its header explains why. Four of the
six are wired — `_rubble` (13619), `_volleyPin` (13477), `_endlessCourt` (13499), `_crossQuake`
(13526). **The other two set a field nothing reads, and each floats its own line over the boss's
head as it does so:**

| boss | the game says | what it sets | read at |
|---|---|---|---|
| Frost Sorcerer | **"A SECOND OF HIM"** — the blink leaves a mirror that casts too | `e._mirrorCast = 1` | **nowhere** |
| Abyss King, Awakened | **"THE EDGE FALLS AWAY"** — the arena's rim collapses and keeps collapsing | `e._rimFall = 1` | **nowhere** |

**Not taken, and the reason is not "a number has to be invented" — for the King it does not.** The
tyrant already owns a live collapsing-floor system (`G.collapse`, pushed at 13565, updated at 13102,
drawn at 16736) with its own disc radius, warning time and cadence, so a rim variant is reachable
from the game's own parts. What it would change is **how the final boss fight plays**: an arena that
shrinks under you is a difficulty decision on the hardest fight in the game, and `docs/VISION.md`
puts balance in the ask-first column. The Sorcerer's mirror is a step past that again — a second
casting body is a mechanic that does not exist. **Both are his: the King's is a yes/no, the
Sorcerer's is a design.**

**`e.petTauntT` IS A FOURTH AGGRO ROW — section K's list was not complete.** `SKILL_FX.bst_roar`
(10318) sets it on every foe in range and the card (r6 b) promises *"a damaging roar… turns their
attention toward your companion."* The damage and the slow are real; the attention is not, for
section K's reason — there is no target-selection step in the enemy AI to turn. Section K's table
should be read as **five** fields, not four.

**`p.spinT` is an inert leftover, not a promise.** `spellSweep` (9789) and `spinCleave` (9794) each
set it to 0.4 and nothing reads it. No card in the game promises a spin, so this is `_vanish`'s shape
rather than Unseen's — recorded only so the next sweep does not spend a launch on it.

---

## N. COMBO EDGE PAID OUT ONLY FOR THE *OTHER* PASSIVE — **FIXED 2026-08-12**

**Section H's shape a second time in the same class, and this one was hiding UNDER the section H fix.**
Unseen could not arm at all until pass 25, so nothing downstream of it had ever been exercised. The
moment standing still armed the strike, the next question — does killing with it rearm it — became
answerable, and the answer was no.

`nin_combo` (CLASS2.ninja r5 b, 2120) reads *"Killing with Unseen instantly rearms it — chain from
body to body."* It is genuinely wired: `killEnemy` (10967) checks `c2Passive('nin_combo')` and writes
`p._stillT = 9`, Vanish's own arming line. **The gate beside it was `e._ninExec !== undefined`, and
`_ninExec` had exactly one assignment in the whole file — inside `CLASS_BASIC.ninja`'s DEADLY
PRECISION branch (11358).** So what shipped was not the card. It was *"killing with Deadly Precision
rearms Unseen"*, with two consequences a player experiences as the tooltip lying:

- `nin_deadly` is **rank 3 b** and `nin_combo` is **rank 5 b**. A Ninja who took **Swift** at rank 3 —
  half of all Ninjas, and the half the card at rank 3 a explicitly points at Unseen — could never fire
  Combo Edge at all, at any HP, for the whole run.
- Even holding both, an Unseen strike that killed a **healthy** enemy outright marked nothing. That is
  the ordinary case, and it is precisely the one *"chain from body to body"* describes.

**The passive audit calls `nin_combo` wired and always has.** Third instance of the limit section E
states in advance — after `w_unyield` (pass 20) and Unseen itself (section H) — and the cheapest of
the three to have missed, because the id is not merely mentioned, it is read in a live branch that
does the right thing when it runs.

### How it was measured — `harness/probes/nincombo.probe.js`, three halves in one launch

The bar is the game's own arm state, `p._stillT`, read after the kill. An armed Unseen strike
**consumes** it to 0 on its way through (11354), so 0 after the kill is a real "did not rearm" and 9
is the rearm's own line. Every trial also reports that the foe actually died, so a zero can never mean
the bench failed to kill anything.

Halves: `live` = Swift + Combo Edge (the build the shipped game could never pay); `deadly` = Deadly
Precision + Combo Edge (the shipped game's only working path, carried so a zero elsewhere cannot be
"the bench cannot see a rearm"); `control` = Swift + Evasion, no Combo Edge.

| trial | | live (before → after) | deadly (before → after) | control |
|---|---|---|---|---|
| `hearty` | full-health foe, killed outright by Unseen | **0 → 9** | **0 → 9** | 0 → 0 |
| `wounded` | foe already below a third | **0 → 9** | 9 → 9 | 0 → 0 |
| `notunseen` | a plain kill, Unseen not armed | 0 → 0 | 0 → 0 | 0 → 0 |

`notunseen` is the trial that makes the rest mean anything: a wiring that rearmed on every kill would
be a strictly different and strictly better card than the menu shows, and it would clear a two-trial
bar. It fires in no half, either side.

**THE KNOWN-BAD COULD NOT BE AN `inert` HALF, and the reason is worth keeping.** The mark is written
and read inside ONE synchronous `hitEnemy` call, so nothing a bench pins between ticks can reach it —
the trick `petorder.probe.js` and `unseen.probe.js` both use is unavailable here. The shipped gate's
condition is **transcribed in the probe** instead (`shippedFired`) and the identical bar is evaluated
against it, which is the shape `harness/test/gate.test.js` uses when it asserts `OLD_LINE` and the new
line disagree. `okAgainstShipped` was **false while `ok` was true**, in the same launch, on the same
measurements.

### The fix

The mark moves ABOVE the Deadly Precision branch, so it is set by every Unseen strike rather than by
the execute alone, and it is **scoped to `p.swingId`** rather than left a bare flag — a foe merely
*wounded* by Unseen and finished off in a later fight would otherwise still count as an Unseen kill.
Nothing is invented: `p.swingId` is the game's own per-swing discriminator and is already used in this
exact form two hundred lines up (`e.lastHit === p.swingId`, 10742). `_ninExec` is gone rather than left
behind, so the sweep in `harness/audit-fields.js` does not inherit a new write-never-read field from a
fix.

Photographed at `_shot/out/nc-rearm.png` (`harness/probes/nincombo-shot.probe.js`): **UNSEEN** over the
body and **UNSEEN READY** over the hero in one frame, with the kill's XP and gold beside them, on a
Ninja whose rank 3 is Swift. Regression: `node harness/test-skills.js --classes ninja` reports **3 pass
/ 0 fail / 1 unproven**, the unproven being the baselined `ninja/Death Mark`.

---

## O. HASTE NAMED A COOLDOWN ARRAY THIS GAME DOES NOT HAVE — **FIXED 2026-08-12**

**The first row found by the READ-NEVER-WRITTEN half of `harness/audit-fields.js`**, which
`docs/superpowers/plans/2026-08-10-skill-correctness.md` records as never having been worked. The
whole finding is one line of sweep output:

```
=== p.* — 171 fields ===
  READ NEVER WRITTEN  p.cds  (2 reads, first at line 11644)
```

Both reads are that one line, and it is the entire implementation of a rank-3 card:

```js
if(c2Passive('chr_haste')){ for(let i=0;i<4;i++) p.cds && (p.cds[i]=0); }   // Haste: every cooldown reset
```

`chr_haste` (CLASS2.chronomancer r3 b, 2154) reads *"Rewinding resets every skill cooldown."*
**There is no `p.cds` in this game.** The player's cooldown array is `p.skillCd`, built at 3642 and
read in twenty-three other places; `p.cds` is assigned nowhere in the file, so `p.cds &&` is a
short-circuit onto `undefined` and the loop's body never runs. Every chronomancer who has ever taken
Haste over Potent has been paid nothing for it.

**FOURTH INSTANCE OF THE LIMIT THE PASSIVE AUDIT STATES ABOUT ITSELF**, after `w_unyield` (pass 20),
Unseen (section H) and Combo Edge (section N) — and the first where the id has a reader that genuinely
works, so nothing about it looks wrong from any angle the audit can see. `chr_haste` is mentioned twice
in live code: here, and in `effCdr` (3766), where it grants +10% cooldown reduction. So the passive is
wired, one of its two readers works, and the card is still a lie.

**The +10% is visible in the probe's own numbers and it is what makes the halves trustworthy.** The
Haste half enters every trial with cooldowns 13% shorter than the control's — `1.3 / 5.2 / 8.45 / 14.3`
against `1.5 / 6 / 9.75 / 16.5` — so the passive is demonstrably *selected* and demonstrably *read*.
A zero after the Rewind can therefore never be "the bench failed to pick the passive", which is the
usual way a row like this measures nothing.

### How it was measured — `harness/probes/chrhaste.probe.js`, two halves in one launch

A/B between the two options at the SAME rank in the SAME game, so the only difference between the
halves is which passive is chosen. `chr_potent` is the control: wired, delivered by the same three
lines of the same death save (11641–11644), and nothing to do with cooldowns.

**The bar is what the player is promised, not what the code sets** — this document has twice been
burned reading the field instead of the effect (pass 15 lit exactly the right enemy and burned
nothing; pass 23 measured distance covered rather than an `effSpeed` reading). So each half ends by
PRESSING slot 0 after the Rewind and reading the pool. `useSkill` returns at `if(p.skillCd[i]>0)
return;` (10580) **before** it spends anything, so mana leaving the pool is the game's own statement
that the cast was allowed through. A reset you can see in `p.skillCd` and cannot cast off would clear
a field-reading bar and still be the bug.

| | control (`chr_potent`) | Haste, before | Haste, after |
|---|---|---|---|
| cooldowns armed by four real casts | 4 | 4 | 4 |
| `skillCd` after the Rewind | `1.22 / 4.88 / 7.93 / 13.42` | `1.3 / 5.2 / 8.45 / 14.3` — unchanged | **`0 / 0 / 0 / 0`** |
| mana spent by a press after the Rewind | **0** (refused) | **0** (refused) | **7** (cast) |
| `rewound` | true | true | true |

Everything is driven through the game's own systems: the Rewind history is built by running
`update()` until the game has recorded it (never by fabricating `p._rew`), the cooldowns are armed by
CASTING through `useSkill` rather than by assigning to `skillCd`, and the Rewind is reached by taking
a real killing blow through `hurtPlayer`. Both halves assert `rewound` off the game's own `G._rewUsed`
counter, so a surviving cooldown can never be a blow that silently did nothing.

**The ticks come before the casts, not after**, and that ordering is load-bearing: `update` decays
`skillCd` by `dt` every frame (13022), so filling the 3.5s history after the casts would hand the
trial four cooldowns that had already run most of the way down.

**THE KNOWN-BAD COULD NOT BE AN `inert` HALF.** The trick `petorder.probe.js` and `unseen.probe.js`
use — pin the field back between ticks — is unavailable, because the reset and the press either side
of it are one synchronous stretch with no frame in between. So the shipped statement is TRANSCRIBED
and fed the identical bar, the shape `harness/test/gate.test.js` uses: `p.cds` is read out of the live
game (`cdsType: "undefined"`, measured, not read off the source), and since it does not exist the
shipped line provably cannot move a cooldown, so the bar is re-evaluated against the cooldowns as they
stood before the blow. `okAgainstShipped` was **false while `ok` was true**, in the same launch, on the
same measurements.

### The fix

`p.cds` becomes `p.skillCd`, guarded the way the file's other twenty-three readers guard it. Nothing
is invented — the array, the four slots and the `p.skillCd[i]=0` form are the game's own, taken from
the Bladedancer capstone eleven lines up (11520). `skillCdMax` is deliberately left alone:
`skillCoolPaint` (10666) takes the wheel off a button itself on the frame its cooldown reaches zero,
and the paint reads `Math.max(cd, skillCdMax[i])` only while `cd > 0`.

**Photographed, and this is a row where a photograph means something** — unlike a retarget (section L)
or a movement multiplier (pass 23), four cooldown wheels exist in a still frame.
`harness/probes/chrhaste-shot.probe.js`, one half per run, same camera, same instant, the two frames
differing in exactly one thing — which passive is chosen at rank 3:

- `_shot/out/haste-cooling.png` (control) — the **REWIND** floater and *"Three seconds back. Once per
  area."* over the hero, and under it four greyed skill buttons counting **1.4 / 5.9 / 9.6 / 16.4**.
- `_shot/out/haste-ready.png` (Haste) — the same floater, the same toast, the same camera, and four
  lit skill buttons with their icons back and no countdown on any of them.

The button state is returned as well as rendered (`cooling`, and the `.sk-cd` text), so "off-frame" and
"not drawn" cannot be the same picture.

Regression: `node harness/test-skills.js --classes chronomancer` → **4 pass / 0 fail / 0 unproven**,
unchanged either side. `node tools/gate.js` → `GATE OK`. Unit stage 53/53.

### What this says about the sweep, for the next run

The read-never-written half turned up **three** rows over `p.` and `e.` once the DOM-event noise
(`e.clientX`, `e.preventDefault`, `p.catch`) is set aside. This was one. The other two are recorded
under *"Not listed here"* below: `e.dmg2` and `e._iansSplash`, neither of which is a broken promise.
**That half of the sweep is now worked and is close to empty** — so the next lead has to come from
somewhere else, and the standing candidate is still the stat-snapshot half of that plan's Task 3
Step 2, against the 98 passives that do have a reader.

---

## P. THE PASSIVE AUDIT COULD NOT SEE FOUR OF THE GAME'S PASSIVES — **FIXED 2026-08-12**

**A BENCH row, not a game one, and taken before more game work for the reason section F was.** A
harness that mis-measures is worse than one that does not run: this one has been quoted as the
population of the whole passive programme — "124 passives in the game" — in this document and in
`docs/superpowers/plans/2026-08-10-skill-correctness.md`, and it was wrong by four.

`CLASS2` holds **128** passives: sixteen classes × four passive ranks (3/5/7/9) × two options.
`harness/test/passives.test.js` had that arithmetic written into a comment —

> *Sixteen classes carry four passive ranks of two options, so the floor is well above any plausible
> partial parse.*

— directly above `assert.ok(r.total >= 100)`. So the test stated 128 and accepted 124.

**The mechanism is one quote character.** `passivesOf`'s entry regex was
`id:'…'[^}]*?n:'([^']*)'[^}]*?d:'([^']*)'` — single quotes required on both `n:` and `d:`. **A name
containing an apostrophe cannot be written in single quotes**, and four are not:

| id | class / rank | name, as the file writes it | its card |
|---|---|---|---|
| `x_favor` | reaper r9 b | `n:"Death's Favor"` | Elite and boss hits restore 1 mana; elite kills restore 8% HP. |
| `pal_will` | paladin r9 a | `n:"Guardian's Will"` | Take 15% less damage while below half HP. |
| `bst_rhythm` | beastmaster r5 b | `n:"Predator's Rhythm"` | Basic attacks reduce all Beastmaster command cooldowns by 0.25s. |
| `bst_authority` | beastmaster r9 a | `n:"Alpha's Authority"` | Companion attacks gain occasional splash damage and commands are 15% stronger. |

**UNDER-COUNTING IS THE SMALL HALF.** A skipped entry is not merely missing from a total — it is
outside the `KNOWN_DEAD` ratchet's reach entirely, so **any of those four going dead would have left
the gate green with nothing to say.** That is the green-light-that-cannot-go-red shape this whole
programme exists to remove, sitting inside the tool that removes it. All four are wired today —
`x_favor` in the elite-hit rider (10822) and the elite-kill rider (11050), `pal_will` in `hurtPlayer`
(11524), `bst_rhythm` on the basic attack (10782), `bst_authority` in `beastCommandPower` (10299) and
the companion's splash (11738) — but that is luck, not a guard, and the audit could not have said
otherwise either way.

### How it was found — a static check, no launch, no GPU

**Every `c2Passive('<id>')` literal in the game, checked against the ids `CLASS2` actually defines.**
148 literal call sites, 102 distinct ids, and four of them were ids the game guards on that the audit
had never heard of. An audit whose parse is complete cannot produce that result, so the four names
*are* the diagnosis. The reverse direction is worth stating because it came back empty and would be a
worse fault: an id guarded that `CLASS2` does NOT define would be a permanently-false guard — section
H's shape with no card behind it — and there are none. Nor is any passive guarded under the wrong
class's `meta.classId` check.

Worth re-running after any kit change. It is cheaper than every other check in this document.

### The fix, and why both halves had to change

`n:` and `d:` now accept either quote style. The **id** stays single-quoted-only on purpose: an id is
an identifier and can never need the other quote, so widening it would only add ways to match
something that is not an id.

And the real-game floor is no longer `>= 100`. It is the arithmetic the comment already stated —
**per class as well as in total**, because an aggregate floor cannot tell a parser that lost four
entries from one that never had them, while *every class has exactly eight* fails the moment any
single tree stops parsing.

Both halves are asserted to DISAGREE with what they replace, the rule `harness/test/gate.test.js`
sets: the old single-quote-only regex is transcribed into the test file and asserted to MISS the
double-quoted entry, and a second test moves the reader so the double-quoted passive is the DEAD one
and must be accused — proving the fix restores the accusation, not just the count.

Unit stage **53 → 55 tests**, all green. `128 total, 102 wired, 26 dead`, every class at 8/8, no
duplicates, and the dead list is byte-for-byte what it was — so nothing in section E moves and
`KNOWN_DEAD` needs no edit. No game code was touched.

## Q. THE READER IS A STAT MULTIPLIER AND THE CARD PROMISES A MECHANIC — five rows, one **FIXED 2026-08-12**

**None of these is in section E and none of them ever will be.** `harness/audit-passives.js` reports
every id below as WIRED, correctly: each one *is* read. It asks "does anything read this id", which is
the only question a static sweep can answer, and it cannot ask whether the reader honours the card.
That limit is written into the audit's own header and into Task 3 Step 2 of the plan, and this section
is the first systematic result of taking it seriously — the stat-snapshot half of that step, done by
reading each of the 102 wired cards against its own reader rather than by launching a browser 102
times.

**The shape is one shape, and it is worth naming because it recurs across four classes.** The card
describes a MECHANIC — a parry, a reload, an interrupt, a resistance — and the only code that mentions
the id multiplies a stat in `effAtkSpeed` / `effSpeed` / `effDamage`. The passive does something. It
does not do what the player was told. This is the same family as sections H, N and O (counted wired
for its whole life, doing something other than the card), and it is invisible to every tool this
sub-project has built.

| id | class · rank | its card | its only reader | state |
|---|---|---|---|---|
| `pir_swift` | pirate r3 b — Quick Hands | "Opening a chest reloads your pistol." | `effAtkSpeed` +10% attack speed (3754) | **FIXED**, pass 31 |
| `bd_feet` | bladedancer r3 b — Light Feet | "Dodging through an enemy parries their next attack automatically." | `effSpeed` +10% move speed (3755) | **FIXED**, pass 32 |
| `bd_fast` | bladedancer r5 b — Fast Hands | "A parry refunds the time your attack would have taken." | `effAtkSpeed` +12% attack speed (3754) | **FIXED**, pass 33 |
| `w_heavy` | warrior r3 a — Heavy Hand | "Your basic attacks cannot be interrupted — and you cannot cancel them either." | `effDamage` +12% (3706) **and** `effAtkSpeed` −5% (3754) | confirmed, unfixed — needs a mechanic that may not exist |
| `w_juggernaut` | warrior r9 b — Juggernaut | "+15% knockback resistance and +8% damage reduction while moving." | `hurtPlayer` `dmg*=.92` while moving (11543) | HALF wired — the DR is there, the knockback resistance is not |
| `x_doom` | reaper r3 b — Lingering Doom | "Marked enemies that die spread their mark to the nearest foe." | the doom timer burns 20% slower (13284) | confirmed, unfixed — **Oliver's**: a reaper cannot mark anything, so which mark is a design call |
| `x_chill` | reaper r7 b — Grave Chill | "Corrupted enemies cannot flee — they walk toward you instead." | corrupted enemies move 18% slower (13283) | confirmed, unfixed — **Oliver's**, nothing flees |
| `x_corrupt` | reaper r9 a — Corruption Mastery | "Rupturing a corrupted enemy corrupts everything near it." | +25% corrupt buildup (9527) and +15% rupture damage (9551) | **FIXED**, pass 34 — the radius was rupture's own 120 |
| `bsk_rage` | berserker r7 a — Rage | "Below a quarter health you cannot be healed, and your damage doubles." | the doubling only (11353) | HALF wired — the upside is there, the drawback is not |
| `chr_temporal` | chronomancer r7 a — Temporal Flow | "Standing still rewinds your cooldowns rather than merely pausing them." | an UNCONDITIONAL +10% cooldown reduction (3766) | confirmed, unfixed — **Oliver's**, both stages would be invented |
| `pal_heal` | paladin r7 b — Healing Light | "Every skill you cast heals the ally nearest you, or you if alone." | `effLifesteal` +5% lifesteal (3759) | confirmed, unfixed — actionable only if the amount can be taken from the file |

### Quick Hands — the row that was taken, and why it was takeable

`_loaded` is the Pirate's whole identity: the flintlock overrides a basic attack or a charge, is spent
on a shot (11306), and comes back **only on a kill** (10979), which is what stops "always equipped"
from meaning "always available". Its three writers are that, the spend, and arrive-loaded (12938).
**No chest is among them, anywhere in the file.**

Nothing had to be invented, and that is the whole reason this row was takeable rather than Oliver's:
the card is a BOOLEAN, and the four lines that answer it are the kill rider's own — the same guard
(`!G.p._loaded`, so a chest opened with a loaded pistol is silent), the same floater, the same colour.
It sits above the hub-sprint early return because a Treasure Sprint's finale chest is a chest. Mimics
are untouched by construction: `mimicReveal` never reaches `openChest`, and a mimic is a fight.

Measured by `harness/probes/quickhands.probe.js`, three halves in one launch with two windows each:

| half | pick | chest window | idle window (same ticks, no chest) |
|---|---|---|---|
| control | `pir_deadly` (a-side of the same rank) | spent → **spent** | spent → spent |
| passive | `pir_swift` | spent → **LOADED** | spent → spent |
| known-bad | `mon_iron` (a dead id, identical bar) | spent → **spent** | spent → spent |

`ok true, okAgainstInert false`. Gold +70 on every chest window and 0 on every idle window, so the
payout is unchanged in all three halves.

Two things the probe does deliberately, both of them rules this sub-project has paid for:
- **The GAME opens the chest.** `__BF3.openChest` is exported and calling it would prove the door
  swings, not that anything opens it — sub-project A Task 5's fault in a new costume. The probe pushes
  an ordinary `{x,z,y,opened:false,bob:0}` into `G.chests` and ticks, so the interact step decides.
- **The GAME spends the pistol.** `CLASS_BASIC.pirate` fires it from inside `hitEnemy`. The probe never
  assigns `_loaded`, because that flag is both the input and the output of the thing under test.

**And one thing it reports honestly rather than counting:** the drops. They land at `ch.x ± 28,
ch.z + 20` and the pickup step collects anything within 40 units **in the same frame the chest loop
created it**, so a hero standing on the chest it just opened reads `G.pickups.length` unchanged whether
two items dropped or none — measured, 0 in all three halves on this probe's first run, which failed the
probe's own bar before the bar was corrected. Offsetting the chest does not rescue it (one of the two
drop positions stays inside the 40, and the drop count is `1 + (rand < 0.4)`, so it would flap). The
purse reading proves `openChest` ran its body past the inserted lines; the loot is not claimed.

**THE +10% ATTACK SPEED IS LEFT ALONE AND IS OLIVER'S** — `w_unyield`'s call, made for `w_unyield`'s
reason. This fix only ADDS the thing the card promises; removing an undocumented bonus a Pirate has
been playing with for weeks is a balance change, and both honest endings (delete it, or put it on the
card) are one sentence from him rather than one number from a run.

### Light Feet — the row where the FAITHFUL implementation was the worse one

Taken as pass 32, immediately after Quick Hands and for the same reason: the card is a boolean about
machinery the class already owns in full. `p.bdParryT` is the window, `hurtPlayer` (11536) is where it
catches, and one open window already buys the parry, the stored Riposte, the i-frames, Healing Counter
and the rank-10 capstone. So the fix is four lines and no new state, and the only number in it —
`c2Passive('bd_patient') ? .85 : .65` — is Counter Stance's own, which also means Patient Guard keeps
working on this parry exactly as it does on the class's other four.

**It is wired inside the dash, not at the dodge button, and that is the card's word doing the work.**
"Through" is a fact about where the body travelled, so the only place that can answer it is the line
that drives the dash — 12981, 0.20s of 560 u/s, frame by frame. The overlap test is the game's own
contact test verbatim (13348, same radii, same `vOverlap`), so dashing *under* a flyer does not count
and neither does dashing past one.

**ONE DEVIATION, AND THE FAITHFUL VERSION WAS REJECTED ON THE CARD'S OWN TERMS.** This opens a WINDOW,
so an attack from a DIFFERENT enemy inside it is parried too, where the card says "**their** next
attack". The alternative is a per-enemy mark — and `hurtPlayer` is never handed the attacker: the
melee contact path passes `foeHit(e, …)`, a `{name, attack}` descriptor (13348), and the projectile
path passes the PROJECTILE's position (13345). So a marked-body version could only be matched by
position, and would silently fail to catch a marked archer's arrow. That is a bigger hole in "their
next attack" than a shared window is, and it would be a silent one. Stated here rather than hidden,
and cheap to revisit the day `hurtPlayer` learns who hit you.

Measured by `harness/probes/lightfeet.probe.js`, three halves in one launch with two trials each:

| half | pick | dash THROUGH a foe | identical dash, foe 400 off the line |
|---|---|---|---|
| control | `bd_sharp` (a-side of the same rank) | lost 5 HP | lost 5 HP |
| passive | `bd_feet` | **0 HP, Riposte stored, window 0.67** | lost 4 HP |
| known-bad | `mon_iron` (dead id, identical bar) | lost 4 HP | lost 4 HP |

`ok true, okAgainstInert false`. The dash measured 120–122 units in every trial, so all six are
staged. The hit is delivered the same way in both trials of a half — the foe is put on the hero and
the game's own contact damage fires — so the only thing that differs is whether the dash passed
through a body.

**The 0.67 is checked, not glossed.** The probe reports the held picks, and rank 5 is `bd_patient`, so
the window starts at 0.85 and 0.67 is that less the decay between the overlap and the hit. Patient
Guard's branch is therefore exercised rather than merely written.

**The probe was wrong twice before the game was, both silently and both worth keeping:**
- It left the dash's friction tail under the hero. The movement branch hands the leftover 560 u/s to
  the friction step, so a hero parked beside a PINNED foe walks out of contact before the contact
  check runs and the foe cannot follow — `hitAt −1` in five of six trials.
- It set `e.active` on a spawned enemy without clearing `e.dropT`. `dropT` is the spawn-in delay and is
  checked FIRST (13261), so the body stayed inert for ~41 frames — which put the contact PAST the very
  window under test. A bench fault that reads exactly like a parry that does not hold.

### Fast Hands — the row whose own before/after numbers also proved the undocumented half is live

Taken as pass 33, same call a third time. `p.atkCd` IS "the time your attack would have taken":
`playerAttack` sets it to `w.cd/effAtkSpeed(p)*cdMul` and returns on it, so it is both the cost and
the gate, and zeroing it is Swift Steel's own refund three lines from where the field is set.
`p.atkTimer` is deliberately not touched — that is the swing ANIMATION, which Counter Stance sets on
purpose; the card refunds time, not a pose.

Measured by `harness/probes/fasthands.probe.js`, three halves in one launch with two trials each:

| half | pick | parried hit | unparried hit |
|---|---|---|---|
| control | `bd_patient` (a-side of the same rank) | 0.200 → 0.184 | 0.200 → 0.184 |
| passive | `bd_fast` | **0.179 → 0** | 0.179 → 0.162 |
| known-bad | `mon_iron` (dead id, identical bar) | 0.200 → 0.184 | 0.200 → 0.184 |

`ok true, okAgainstInert false`. A parry fired in all three parried trials and the hit landed in all
three unparried ones, so the zero is a real zero and not a trial that failed to stage. The unparried
trial is the one that matters most: a passive that refunded on ANY hit taken would have cleared a
parry-only bar and would be a far stranger card than the one printed.

Everything the probe touches is driven rather than assigned: the window is opened by CASTING Counter
Stance through `useSkill`, the swing is a real one-frame `input.attack` press, and the hit is the
game's own contact damage. It assigns neither `bdParryT` nor `atkCd`, which are the input and the
output of the claim.

**And the numbers settled a second question for free.** `atkCdBefore` reads 0.179 in the passive half
against 0.200 in the other two — 0.200/1.12, which is the +12% attack speed the `effAtkSpeed` reader
has always granted. So the undocumented half is demonstrably still live and untouched by this fix,
which is exactly the state this section hands to Oliver rather than deciding.

### The five rows found by widening the sweep, and which of them a run may take

Swept after passes 31–33, in the same launch-free way and while the aggregate gate was running. Three
of the five are the reaper's, which is worth stating plainly because **this document has been
recording the reaper as a finished class** — "the class now has **no dead passives left**" (pass 17).
That was true and it was about section E. Three of its eight passives nonetheless do something other
than what their card says, and no tool this sub-project owns could have said so.

- **`x_doom` — Lingering Doom. ~~ACTIONABLE~~ NOT TAKEABLE, AND IT IS OLIVER'S — corrected
  2026-08-12 by the run that took `x_corrupt`.** The card says a dying marked enemy passes its mark to
  the nearest foe; the one reader makes the mark last 20% longer on the enemy that already has it. The
  original entry called this the cheapest of the five because `c2OnKill` already carries four
  per-passive kill riders and "the nearest foe" needs no number. Both of those are still true and they
  are not the problem. **The problem is that a reaper cannot mark anything.**
  Traced, not argued. `e.doomT` has exactly ONE writer in the whole game — `SKILL_FX.deathsdoor`
  (9944) — and Death's Door lives only in the **legacy** `CLASSES` reaper kit (1896, rank 7).
  `useSkill` branches on `c2def()` and the reaper has a `CLASS2` tree, so it *always* casts
  `c2CurSkills()[i]`; the reaper's eight CLASS2 skills are `x_reap`, `x_cleave`, `x_step`, `x_wraith`,
  `x_pull`, `x_bind`, `x_siphon`, `x_vortex`, and not one of them dooms. `e.markT` is no better — its
  only writers are the ranger's Mark and Death Mark (9893, 9984). So wiring "spread their mark" over
  either field ships a passive that can never fire in play, which is the section H shape this document
  exists to catch, done on purpose. The one mark-like state a reaper CAN apply is **corruption**, and
  reading the card's "marked" as "corrupted" contradicts the class's own vocabulary one card away: the
  rank-10 capstone says "a marked **or** corrupted enemy" and its code (10246) tests them separately.
  Choosing between those three is a design decision, so the row is his.
  **Two things it turned up that are worth his eye on their own**, both from the same trace:
  the capstone's own `(e.markT||0)>0` clause is unreachable for exactly the same reason, and **Death's
  Door is unreachable CONTENT** — a complete rank-7 skill (`SKILL_FX.deathsdoor`, its 'DOOMED'
  floaters, its "⚰️ n marked for death" toast) plus the entire `doomT`/`doomDps`/`doomAcc`/`doomSrc`
  damage-over-time system in the enemy update loop (13284), none of which any player can reach. That
  is section J's shape — the kit moved and the code did not.
- **`x_corrupt` — Corruption Mastery. FIXED, pass 34, 2026-08-12 — and the condition this entry set
  was met by the effect itself.** The card says rupturing a corrupted enemy corrupts everything near
  it; the two readers were +25% buildup (9527) and +15% rupture damage (9551), and nothing spread.
  This entry said the row became Oliver's if corruption had no `igniteBurn`-equivalent splash radius
  of its own. **It has one, and it was one line above the fix the whole time:** `ruptureCorrupt`
  draws `skillRing(e.x,e.z,'#d69bff','#8f52d6',120)`, and 120 is also `igniteBurn`'s combustion-splash
  radius verbatim — the same number from two independent directions, so nothing had to be chosen.
  The spread goes through `applyElement` and is then topped to a whole stack, which is pass 15's
  correction in both halves (the door stamps `stFresh`, without which the stack decays on arrival;
  `buildAmt` scales with the weapon's swing speed and can hand over a fraction, and a fraction of a
  corrupt meter primes nothing). Only the STACK is borrowed from `igniteBurn`, not its 40% splash
  damage — the card says "corrupts", not "damages".
  **The bar was deliberately not "the meter went up".** Corruption has no damage-over-time of its own
  (`statusTick` DoTs burn and venom only), so its whole payoff to the player is that the body can be
  RUPTURED — and a stack that cannot be cashed in is pass 15's 0.95 stacks in a new place. Each half
  therefore ruptures the neighbour afterwards and reads the damage: 0 before, **74** after.
  Measured by `harness/probes/xcorrupt.probe.js`, three halves in one launch, two trials each
  (corrupted and uncorrupted) with a far foe in every trial so "everything **near** it" is tested as a
  radius. Photographed at `_shot/out/xc-spread.png`.
  **The probe was wrong once, and the FIXED game is what said so** — it read the ruptured body's meter
  at the end of the trial, and the neighbour's own rupture 80 units away spreads corruption straight
  back onto it, so a working chain reported as a rupture that never happened. The chain is now
  reported as evidence (`chainedBack`) rather than asserted: it is a consequence of the radius being
  symmetric, not a clause of the card.
- **`x_chill` — Grave Chill. OLIVER'S, and not for the usual reason.** The card says corrupted enemies
  cannot flee and walk toward you instead; the one reader slows them 18%. **Nothing in this game
  flees.** `D.flee` belongs to the Arena bot profiles (12605–12608) and the only other fleeing body is
  the treasure goblin, so an ordinary mob has no fleeing state to forbid and no "walk toward you" to
  switch on. That is section K's absence — there is no aggro model — reached from a different door.
- **`bsk_rage` — Rage. HALF WIRED, and the missing half is the DRAWBACK.** "Below a quarter health you
  cannot be healed, and your damage doubles": the doubling is in `CLASS_BASIC.berserker`, and the heal
  lock is nowhere. There is no player-side heal cut at all — `healCut` is an ENEMY field (9532, heavy
  Venom choking a healer's mend). Pass 20's own rule is the argument for taking it: *"a card with a
  drawback has to be wired on BOTH sides or picking it is a strict upgrade"*, which is exactly what
  ships today. Takeable, with the caution that it touches every path that heals the player, so the
  probe needs a control heal that must still land above a quarter health.
- **`chr_temporal` — Temporal Flow. OLIVER'S.** The card says standing still *rewinds* your cooldowns
  "rather than merely pausing them"; the one reader is an **unconditional +10% cooldown reduction** —
  no stillness, no rewind. Its own twin two clauses to the left in the same function, the mage's
  `m_temporal`, gates correctly on `p._stillT >= 1.5`, and since section H ungated that clock it runs
  for every class, so the stillness half is available for free. The rest is not: the card describes
  rewinding as an *upgrade over pausing*, and cooldowns do not pause when you stand still, so both
  stages would have to be invented. Reading the card down to "recovers faster while still" is a
  description edit, which this document forbids.

### THE SWEEP IS COMPLETE — all sixteen classes, 2026-08-12

The last six went the same way in the same run: paladin, necromancer, ninja, monk, stormcaller,
beastmaster. **Every wired passive in the game has now been read against its own card.** That closes
the open half of Task 3 Step 2, and it closed for a cheaper reason than the plan expected — it never
needed a launch.

They yielded one more section Q row and one finding of a different shape:

- **`pal_heal` — Healing Light. The eleventh row, and a CO-OP one.** The card says "Every skill you
  cast heals the ally nearest you, or you if alone"; the one reader adds +5% **lifesteal** (3759).
  Lifesteal is paid on damage dealt, fires on basic attacks rather than on casts, and can never reach
  an ally — so all three clauses of the card are missed by a single line, and the clause that matters
  most is the one `docs/VISION.md` puts at priority #1. **The paladin is the second class this sweep
  has caught while this document was calling it finished** ("Paladin is now the second class with no
  dead passives", pass 19) — true, and about section E.
  *Actionable only if the amount can be taken from the file rather than chosen.* The card states no
  number. The nearest candidate is the 4% of max HP that `m_ward`, `war_shield` and `st_ward` all
  grant per cast — but every one of those is a SHIELD, and a shield unit is not a heal unit, so this
  is weaker than pass 14's Dive Strike borrowing and should be argued before it is used.
- **`necro_undying` — NOT a section Q row: the opposite one.** Its card, "a killing blow instead
  consumes a minion", is properly implemented (11663). It *also* carries a flat `dmg*=.88` (11560),
  which is the passive's OLD version — this file's own note records it as *"rewritten. Was 'take 12%
  less damage' — a number… Now a killing blow consumes a MINION"* — and the old line was never
  removed. So the passive quietly does both. Same shape as `w_swift`'s surviving +10% attack speed,
  and it belongs with section J's twelve for the same reason: the code is newer than the card, and
  which of the two is right is one sentence from Oliver rather than one number from a run.

**Clean, and listed so nobody re-reads them:** mage, warlock, skylancer, ninja, monk, stormcaller,
beastmaster, necromancer (apart from the leftover above). Every card's promise is implemented and the
reader honours it.

**One caveat on "clean" that is worth carrying.** This sweep asked whether the card's promise is
implemented, not whether the reader carries anything EXTRA. Several passives grant undocumented riders
on top of a correct implementation — `necro_undying`'s 12% and `w_swift`'s 10% are the two found, and
`m_potent`'s +12% skill power (3707) is a third — and a sweep aimed at that question would be a
different pass with a different table.

### The one row below that a run could take, and the one it could not
- **`w_heavy` is NOT the same call and should not be taken as one.** "Cannot be interrupted" and
  "cannot cancel" are claims about the swing state machine, and this file has no interrupt state to
  read — pass 20's note records the same absence for stagger, where the launch IS the interruption.
  Answering it means designing what interrupting a swing means, which is a mechanic, not a wiring.
- **`w_juggernaut` is the odd one: half of it is already right.** The +8% damage reduction while
  moving is implemented exactly as written (11523). The +15% knockback resistance is not implemented
  anywhere — and unlike `w_heavy` the mechanism now exists, because pass 20 put the knockback in one
  place (11601, three lines of velocity) so that Heavy Hands could skip it. A 15% resistance is
  `* 0.85` on those three lines, and 15% is the card's own number. Worth taking, with one thing settled
  first that a run should not settle alone: the card reads "+15% knockback resistance **and** +8%
  damage reduction while moving", and whether "while moving" governs both clauses or only the second
  is an English question about a card, not a measurement.

**How these were found, so the method can be re-run.** No launch and no GPU: every `kind:'passive'`
card in `CLASS2` read against every `c2Passive('<id>')` site in the file, class by class. Four classes
were swept this way (warrior, mage, warlock, bladedancer — the four least worked by Task 2's passes)
plus a targeted read of the pirate. **The other eleven classes have NOT been swept**, so this table is
a floor and not a total. Mage and warlock came back clean, which is why they are not in it.

## Not listed here, and why

- **`e._iansSplash`** — reported by the read-never-written sweep and **not a bug: a limit of the
  sweep**. It is written at 10845 as `e2._iansSplash=1`, and the sweep's any-receiver pass carries
  `(?<![0-9.])` to avoid reading `1.5` as a field, which also blinds it to every receiver whose name
  ends in a digit (`e2`, `p2`). Recorded so the next run does not spend a launch on it — and noted as
  the one place this sweep can fail in the ACCUSING direction, since a field whose only READER is
  `e2.foo` would be reported as written-and-never-read.
- **`e.dmg2`** — read once, at 13445, as the damage of the eruption shockwave a boss leaves behind
  (`dmg:e.dmg2||12`). Never assigned, so the fallback is the only value it has ever had. **Not a
  triage row: no card and no boss line promises a number here**, and picking one is a difficulty call
  on a boss mechanic, which `docs/VISION.md` puts in the ask-first column. Oliver's, and a small one.
- **`ninja/Death Mark` and `pirate/Cannonade`** — unproven, not failed. Both promise damage owed by
  another source or on a condition the bench never meets (the dummy has 100000 HP and never dies).
- **`reaper/Soul Siphon:heal`, `paladin/Shield Bash:shield`, `paladin/Taunt:shield` and
  `beastmaster/Guardian Bond:shield`** — half of the previous eight-row baseline, all four of them
  artefacts of bench faults 1 and 2 above. They pass now. A fifth,
  `chronomancer/Time Warp:damage`, survives under a different and much more specific name
  (`dead handler`, section A). The remaining three — `ranger/Tumble`, `mage/Attunement`,
  `berserker/Charge` — are sections B and C.
- **`p.soulStrengthT` / `p.soulStrength`** — the mirror image of `p.siphonT` below, found the same way
  and recorded for the same reason. `effDamage` (3751) carries a live reaper clause,
  `if((p.soulStrengthT||0)>0) v *= 1 + Math.min(5, p.soulStrength||0) * .02`, and `minionUpdate`
  (10068) decays the timer and zeroes the stacks — the exact structural twin of the Stormcaller's
  `staticT`/`staticStacks` two lines away, which works. **Neither field is assigned anywhere in the
  file**, so the clause can never fire: up to +10% damage that no reaper has ever had. It is NOT a
  triage row, because **no reaper card promises it** — the tree offers Harvested Strength, Crimson
  Harvest and the rest, and none of them says souls make you hit harder. Wiring it would mean
  inventing a buff, which is the one thing this document forbids; deciding whether the stacking
  damage or the silence is the real design is Oliver's. Found by a static sweep for player fields
  that are read and never written, which is the cheapest form of the section H/I shape and is worth
  re-running after any kit change.
- **`p._vanish` and `p._perfectGuard`** — set once each (19255, 19266) and read nowhere. Both sit
  beside the field that actually does the work (`p.invuln` and `p.bdParryT` respectively, set on the
  same or the previous line), so neither is a broken promise — they are inert leftovers. Recorded
  only so the next static sweep does not spend a launch on them.
- **`p.siphonT`** — `SKILL_FX.x_siphon` (10175) sets it and **nothing in the file ever reads it**, so
  the "for 4s" half of Soul Siphon's drain is not implemented. The heal and the damage both land, so
  the claim passes and this is not a failure; recorded because it is a real dead field and the next
  person to read that line should not have to grep for it twice.
