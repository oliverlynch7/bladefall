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
| stormcaller | ~~7 / 8~~ **6 / 8** | Conductor, Overcharge, ~~Storm Ward~~, Charged, Amped, Static Master, Galvanize |
| monk | 6 / 8 | Iron Body, Inner Fire, Flow, Killer Focus, Still Water, Master Striker |
| pirate | 6 / 8 | Dead Aim, Sea Legs, Swagger, Slippery, Lucky, Greed |
| ranger | 6 / 8 | Longshot, Close-Quarters Archer, Escape Artist, Ambusher, Elemental Archer, Bounty Hunter |
| berserker | 5 / 8 | Heavy Hands, Reckless, Thick Hide, Bloodthirst, Unbreakable |
| chronomancer | 4 / 8 | Potent, Entropy, Echo, Deep Freeze |
| necromancer | 3 / 8 | Withering, Plague, Pestilence |
| paladin | 3 / 7 | Burning Light, Bounce Back, Blessed Blade |
| skylancer | 3 / 8 | High Ground, Hunter's Eye, Sky Armor |
| reaper | 2 / 7 | Harvested Strength, Crimson Harvest |
| bladedancer | 1 / 8 | Keep Moving |
| warrior, mage, ninja, warlock, beastmaster | 0 | — |

**The Stormcaller is the worst-hit class in the game twice over** — section A had it missing three of
its eight *skills*, and it is also missing seven of its eight *passives*. Between the two, almost
nothing a Stormcaller chooses at any rank has ever affected the game.

The Ranger is the surprise. It is a CORE class, not a variant, and it is the one hand-written kit in
the dead column — six of eight, including both options at rank 3, both at rank 5, and both at rank 9.
So a Ranger's rank-3 "choice" is between two passives that each do nothing, three times over.

**This is `docs/VISION.md` priority #2 in the plainest possible terms.** A rank-3 choice between two
passives that both do nothing is not a build decision, and a class whose entire passive tree is inert
is a stat-reskin of its core no matter what its cards say.

**Recorded as a ratchet, not as a wall.** The 46 live in `KNOWN_DEAD` in
`harness/test/passives.test.js`, so the gate stays green on them while a **newly** dead passive fails
immediately — and the list is checked in both directions, so a passive that gets wired must be taken
out or the test says so. Working these is sub-project B Task 2, one commit at a time, and each fix
takes an id off that Set.

### Fixed from this section

| passive | class | what it does now | proven by |
|---|---|---|---|
| **Storm Ward** (`st_ward`) | stormcaller | casting a skill grants a shield worth 4% max HP for 3s | `harness/probes/stormward.probe.js` — **0 before, 21 after**, watched to fail |

**Storm Ward was the cheapest row in this section and it is worth saying why, because it is a
shape and not a one-off.** Its card — *"Casting a skill grants a shield equal to 4% max HP"* — is
word for word the Mage's Ward, the Warlock's Soul Shield and (at 6%) the Skylancer's Sky Armor,
all three of which are implemented, in one place, in `useSkill`'s CLASS2 branch, as the identical
expression. So the fix invented no number, chose no duration, and picked no site: it copied the
three siblings sitting around the hole. **Where a dead passive has a wired twin, the twin is the
specification** — no balance call is being made and none of section E's "wiring a passive changes
how a class plays" caveat is in play.

That twin is also what makes the probe believable. It runs three trials in ONE launch and the
third is the WARLOCK casting the same promise, carried permanently as a known-good: measured
before the fix, the Warlock's shield came back **19** while the Stormcaller's came back **0**, so
the bench was demonstrably able to see the thing it was accusing the Stormcaller of not doing.
Without that trial a probe that could not observe *any* shield would report this passive dead with
total confidence. Trial A — the same class with the rank-5 choice left on `st_momentum` — is the
other half: it must stay 0, or the "fix" is shielding every Stormcaller regardless of what they
chose, which is a different passive.

After: `passives: 124 total, 79 wired, 45 dead`; the Stormcaller goes 7/8 dead to 6/8.

### Which of the remaining 45 are cheap, and which are Oliver's — scouted 2026-08-11

Read before picking the next one. The forty-five are not interchangeable: some have a wired twin
elsewhere in the game that supplies both the behaviour and the number, and some cannot be built at
all without choosing a number the card does not state. Sorting them once beats each run
rediscovering it. **This is a reading, not a measurement** — every row still has to be watched to
fail before it is believed.

**Cheap — a wired twin exists, so nothing is invented:**

| passive | class | its card | the twin that specifies it |
|---|---|---|---|
| `bsk_thick` Thick Hide | berserker | "Damage that would drop you below 1 HP leaves you at 1 instead, once per fight." | `necro_undying` (index.html:11244) already intercepts a killing blow in `hurtPlayer` |
| `bsk_heavy` Heavy Hands | berserker | "You cannot dodge — but nothing can knock you back or stagger you." | warrior `w_unyield`, same sentence, wired |
| `bsk_tough` Unbreakable | berserker | "While below half health you cannot be stunned, slowed or feared." | `w_unyield` again, plus the class's own `frac` low-HP test in `CLASS_BASIC.berserker` |
| `mon_iron` Iron Body | monk | "While your dodge is ready, you cannot be stunned or knocked back." | `w_unyield`; `effDodgeCd` already answers "is the dodge ready" |

**Not cheap, but still not a balance call — they need a MECHANISM built, not a number chosen:**
`necro_wither` / `necro_plague` / `necro_pest` (a rot state on enemies, which nothing has yet),
`mon_master` ("every fourth unbroken strike hits everything around you" — a strike counter),
`pir_deadly` ("the pistol pierces every enemy in a line").

**Oliver's, because the card does not say enough to build it:**

| passive | what is missing |
|---|---|
| `r_longshot` "+8% damage to enemies 7m+ away" | **the game has no units-per-metre.** Three anchors, three answers: `r_spike`'s "4m field" is `R=160` (40 u/m), the hero's own body is `h:44` (~24 u/m), and a Tumble described as "~5m" travels ~297 (~59 u/m). 7m is 168, 280 or 413 units depending on which you believe, and picking one is inventing the passive's strength. |
| `r_closeq` "Enemies within 4m are knocked back by every shot" | same scale problem, plus the knockback amount |
| `pir_swagger` "you move noticeably faster" | no number anywhere |
| `pir_luck` "a pistol kill sometimes drops gold" | no rate |
| `pir_greed` "every 500 gold sharpens your blade a little further" | already recorded as his |
| `sky_high` "the higher you are, the harder you land it" | no curve |
| `sky_armor` "nothing can hit you in the first moment after a jump" | no duration |

**Scope, stated so nobody over-reads it:** this proves WIRED, not CORRECT. A passive read once and
read wrongly passes. That is the stat-snapshot job Task 3 Step 2 describes and it is much larger
work; this is the floor under it, and the floor is where section A's nine dead skills were found.

**Not a balance call, and worth saying so.** Wiring a passive that has never done anything changes
how a class plays, which is Oliver's territory — but every one of the 46 has an authored description
stating its intent, so implementing it is delivering the promise already on the card rather than
inventing a number. Where a description does not say enough to implement (`Greed` — "every 500 gold
sharpens your blade a little further" names no amount), that one is his.

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
