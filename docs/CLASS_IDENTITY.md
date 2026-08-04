# Class distinctiveness — the measurement, and what it says

Oliver's priority #2: 16 classes that feel genuinely different, League-style, not stat reskins.
Measured 2026-08-03 before changing anything.

## Finding 1: sixteen classes, five attack styles

| style | classes |
|---|---|
| warrior | warrior, paladin, ninja, berserker, monk |
| mage | mage, necromancer, chronomancer, stormcaller, warlock |
| ranger | ranger, pirate, skylancer, beastmaster |
| reaper | reaper |
| melee | bladedancer |

The basic attack is the thing you do every second of play. Five classes share one, and another five
share another - so a third of the roster feels identical in the moment-to-moment, before any skill
is pressed.

## Finding 2 — the real one: fourteen of sixteen innates open with the SAME clause

The innate trait is the one line each class uses to say what it is. Here is every opener:

    Battle Ready        +8% damage ...
    Clear Aim          +10% damage ...
    Arcane Attunement   +8% damage ...
    Holy Warrior       +12% damage ...
    Death's Embrace     +8% damage ...
    Killer Instinct     +8% damage ...
    Bloodrage           +8% damage ...
    Plunder             +8% damage ...
    Time Attunement     +8% damage ...
    Static Charge       +8% damage ...
    Dark Bargain       +12% damage ...
    Born to Fly        +10% damage ...
    Perfect Timing     +10% damage ...
    Focus              +15% damage ...

Only Soul Hunger (Reaper) and Bonded Companion (Beastmaster) lead with a mechanic.

**A bonus every class has is not an identity - it is a baseline wearing a costume.** The genuinely
distinguishing part of each trait is the clause AFTER the comma (Static stacks, corpses to raise,
stored Ripostes, slower falling), and it is buried behind an identical opener. That is the
mechanical root of "they feel like stat reskins", and it is fixable without touching a single skill.

## The proposed fix, and why it is close to free

Delete the flat damage percentage from all fourteen and fold the average into base damage. Everyone
has it, so removing it from everyone changes almost nothing about difficulty - it is invisible
power that costs the roster its identity. What is left is fourteen traits that each say one true,
specific thing.

Then the remaining gap is Finding 1: the shared basic attack. Options, cheapest first:
  1. Per-class swing TIMING and reach off the existing styles (a Berserker's swing is not a
     Paladin's), which is data, not new code.
  2. A per-class basic-attack MODIFIER hook - every third Ninja hit applies bleed, a Stormcaller's
     basic chains to a second target - which is where League-style identity actually lives.
  3. New attack styles for the classes that most deserve one.

NOT STARTED. This is a balance change across sixteen classes and Oliver's game to direct - the
measurement is the deliverable here, because it changes what the work is.

---

# The rewrite — design, 2026-08-03

Oliver gave creative liberty here. The rule I am designing to: **a class's identity should be
something you can describe without using a number.** "Deals more damage" is not an identity.
"Kills leave corpses you can raise" is.

Each class below gets ONE sentence that is true only of it, and that changes how you play rather
than how big the numbers are. The flat +8-12% comes off all fourteen and folds into base damage, so
difficulty does not move.

## Warrior core

- **Warrior** — *Momentum.* Consecutive hits on the same target build a stack; at three, your next
  hit staggers. Rewards committing to one enemy instead of spreading damage.
- **Berserker** — *No brakes.* You cannot heal above half HP by any means, but every point below
  half is damage. The class plays at a health total it refuses to let you fix.
- **Paladin** — *Oath.* Mark one enemy; while it lives you take less from everything else. Punishes
  target-swapping, rewards picking the right threat.
- **Ninja** — *Unseen.* Standing still for 1s makes your next attack come from behind the target.
  A melee class with a repositioning tool built into its basic attack.
- **Monk** — *Flow.* Every attack that connects shortens your next dodge's cooldown. The only class
  that gets more mobile the more it fights.

## Mage core

- **Mage** — *Overcharge.* Holding the attack past full charge spends mana for a bigger hit. The
  only class where the basic attack has a resource decision in it.
- **Necromancer** — *Corpses.* Already the identity; keep it and make corpses persist across rooms.
- **Stormcaller** — *Chain.* Basic attacks arc to a second target at reduced damage. Keep the Static
  stacks; the chaining is what makes it read as lightning at a glance.
- **Warlock** — *Blood price.* Already has it (skills cost HP). Sharpen: the HP is spent up front
  and returned on kill, so a fight going well costs nothing and a fight going badly compounds.
- **Chronomancer** — *Rewind.* Once per room, return to where you stood three seconds ago at that
  moment's HP. The strongest identity on the roster and currently spent on cooldown percentages.

## Ranger core

- **Ranger** — *Distance.* Damage scales with how far the target is, not a flat bonus. Makes the
  class about maintaining spacing, which is what a ranger IS.
- **Pirate** — *Powder.* The flintlock reloads on kill rather than on a timer. Turns a slow gun into
  a snowball and makes the Pirate's good rounds feel completely different from its bad ones.
- **Skylancer** — *Air.* Damage while airborne, and attacks extend hang time. Already close; commit
  fully - it should be unplayable on the ground and dominant off it.
- **Beastmaster** — *The pet is the class.* Your companion takes your skill inputs. You are playing
  two characters badly or one very well.

## Standalone

- **Reaper** — *Soul Hunger* is fine. Untouched.
- **Bladedancer** — *Perfect Timing* is fine. Untouched.

## Then: per-class basic attacks

The remaining stat-reskin is five classes sharing one swing. The cheap version is per-class swing
timing and reach off the existing styles; the real version is a basic-attack modifier hook, which
is where the designs above (chain, overcharge, unseen, momentum) actually live. That hook is the
single highest-value piece of code in this whole plan - most of the identities above are one
callback each once it exists.

STATUS: designed, not implemented. The implementation is a balance change across sixteen classes and
wants a session with room to verify each one, not the tail end of one.

---

## Pirate, revised — Oliver's design, 2026-08-03

**The flintlock stops being an item and becomes part of the class.** It is always equipped, and it
overrides EITHER your basic attack or your charge attack - you choose which. Better than my version,
and it fixes three separate problems at once:

1. **C4's root cause, properly.** The flintlock being the Pirate's only on-class weapon meant a
   Pirate who had not found one played at a permanent penalty. I patched that by widening the
   family to warrior weapons; this removes the premise instead. You are never a Pirate without a
   pistol, because the pistol is not loot.
2. **It makes the class's fantasy literal.** A pirate carries a cutlass AND a pistol. No other class
   holds two weapons, so nothing else can accidentally feel like it.
3. **The choice IS the build.** Two genuinely different characters out of one class:
   - **Pistol on BASIC** - a gunner who swings a blade when you charge. Ranged primary, melee
     punctuation.
   - **Pistol on CHARGE** - a swordsman with a finisher. Melee primary, and the charge becomes a
     decision rather than a bigger swing.

**Where it meets my earlier note:** the pistol reloads ON KILL rather than on a timer. That is what
stops "always equipped" from meaning "always available" - the pistol is a resource you earn by
finishing enemies, so a round going well snowballs and a round going badly leaves you on the sword.
It also gives the two configurations different textures: on BASIC the reload is your rhythm, on
CHARGE it is a reward you spend.

Consequences to handle when this is built:
- **The flintlock item stops dropping.** It should not exist in loot tables once it is innate;
  finding one would be finding something you already have.
- **Its stats move onto the class** and scale with level rather than with rarity - a class feature
  cannot be common or legendary.
- **THERE IS NO PISTOL MODEL IN ANY KIT.** Flagged during E2 and it matters far more now: this is
  no longer an occasional drop with no art, it is the thing a whole class does every few seconds.
  DECIDED: Oliver sources a model later, so the mechanic is NOT blocked. Build against the existing
  voxel render and swap on arrival - ART_MODELS in hero3d (added in E2) deliberately has no
  `flintlock` entry because no model existed, so adding one is the entire swap. Waiting on art, not
  on code.


---

# The passives have the same disease

Oliver, unprompted: "I noticed a lot of basicness in the class passives." He is right, and it is
the innate problem again one layer down. Sampled eighteen:

    Heavy Hand          +12% damage, -5% attack speed
    Bloodlust           +12% damage and speed on kill
    Weapon Master       +10% damage
    Longshot            +8% damage at range
    Patient Hunter      10% -> 14% damage
    Elemental Archer    +10% reaction damage
    Potent Weave        +12% skill damage, +8% cost
    Glass Cannon        +15% magic damage, +8% damage taken
    Elemental Savant    +15% buildup
    Harvested Strength  +2% per stack
    Crimson Harvest     lifesteal 25% stronger
    Corruption Mastery  +25% buildup, +15% damage
    Thick Armor         -12% damage taken

Four of eighteen do something you could describe without arithmetic: Spell Echo (every fourth skill
repeats), Escape Artist, Second Wind, Soul Armor.

## Why this is worse than it looks

The structure is a 1-of-2 CHOICE at each rank, which is the right structure. But a choice between
"+12% damage" and "+10% attack speed" is not a decision - it is arithmetic, and there is a correct
answer that a spreadsheet finds once and every player copies forever. The choice architecture is
doing no work, which is why the ranks feel like filling in a form.

**The rule: a passive should change a DECISION, not a number.** Test - can you describe what it does
without saying a percentage? If not, it is a stat allocation wearing a name.

## Worked examples, to show the shape

- Heavy Hand / Swift Steel (+12% dmg vs +10% speed) becomes:
  **Heavy Hand** - your basic attacks cannot be interrupted, but you cannot cancel them either.
  **Swift Steel** - every fourth basic attack is free and instant, ignoring your attack timer.
  One commits you, one rewards rhythm. Both change how you hold the button.
- Glass Cannon (+15% damage, +8% taken) becomes:
  **Glass Cannon** - you have no armour at all, and your spells cost no mana below 25% HP.
- Longshot (+8% at range) becomes:
  **Longshot** - your arrows pierce every target in a line, but only past 7m.
- Thick Armor (-12% taken) becomes:
  **Thick Armor** - the first hit in every fight deals no damage.

Same power budget, completely different play.

STATUS: measured and designed in principle, not implemented. Eighteen-plus passives across sixteen
classes is a bigger job than the innates and wants its own session.


---

# BUILD LOG

## The hook — DONE (v1.560.0)

`CLASS_BASIC` in index.html, called from hitEnemy for the player's BASIC attacks only (`G._desig`
marks charged hits and skills, which have their own identities). An entry may modify the damage and
act on the world. Everything a class does every few seconds now lives in one table instead of being
scattered through effPower as percentages.

Three identities shipped against it, as proof the shape works:

- **Warrior — Momentum.** Three consecutive hits on the SAME target stagger it. Switching target
  resets the count, so it rewards committing to one enemy.
- **Stormcaller — Chain.** The basic attack arcs to a nearby second enemy for a third of the damage.
  The class reads as lightning at a glance, which no percentage ever achieved.
- **Ranger — Distance.** Damage scales with range: 0.75x in a sword's reach, 1.35x at distance.
  The class is about spacing, so the damage IS spacing.

Verified: the stagger fires on the third hit and resets on target switch, the chain splashes a
second target, the ranger's far hit beats his near hit 153 to 90, and skills/charged attacks are
untouched.

## Eleven of sixteen — DONE (v1.570.0)

Warrior Momentum, Stormcaller Chain, Ranger Distance, plus:

- **Berserker — No brakes.** Damage rises as health falls, up to +85%. A Berserker at a sliver is
  terrifying; at full health, ordinary. The class is played by choosing not to retreat.
- **Paladin — Oath.** Your first target of a fight is Sworn: you hit it 15% harder and take a third
  less from everything else while it lives. Swapping off it early costs you the shield.
- **Ninja — Unseen.** Stand still a moment and the next attack teleports you behind the target for
  1.5x. Repositioning inside the ordinary attack rather than on a cooldown.
- **Monk — Flow.** Every connecting hit shaves 0.35s off your dodge. The only class that gets MORE
  mobile the more it fights.
- **Mage — Overcharge.** Basic attacks spend 6 mana for 1.35x. A Mage holding mana for a skill is
  choosing to punch softer - a resource decision inside the ordinary attack.
- **Necromancer — Harvest.** Every fifth basic hit drops a corpse whether the target dies or not.
  Waiting for kills made the class worst exactly when it was losing.
- **Warlock — Blood price.** Basic attacks cost 1.2% max HP for 1.4x damage, and a KILL returns
  every point spent. A good round is free; a bad one compounds.
- **Skylancer — Air.** 0.8x on the ground, 1.5x airborne, and attacking slows your fall so a good
  jump is a whole engagement.

## All sixteen — DONE (v1.580.0)

The last three needed their own systems rather than a callback, which is why they were last:

- **Chronomancer — Rewind.** A killing blow returns you to where you stood three seconds ago at that
  moment's health, once per area. Not a death save: you come back THERE, so the ground is lost and
  the three seconds that killed you are the three you must play differently. A 3.5s history ring is
  sampled four times a second, for the Chronomancer only.
- **Beastmaster — Every skill is an order.** Pressing a skill sends the companion at whatever you
  are aiming at and clears its attack cooldown. You are playing two characters, which is the class.
- **Pirate — Powder and steel.** Oliver's design: the flintlock is class equipment, not loot. Always
  loaded, overrides your basic OR your charge (`meta.pirateSlot`), reloads on a KILL rather than a
  timer. The only character carrying two weapons, and which hand holds the pistol is the build.

## Remaining, in order
2. Strip the flat +8-12% from the fourteen innates and fold into base damage.
3. Rewrite the passives against the decision-not-a-number rule.
4. The Pirate's flintlock-as-class-equipment.


---

# The weapon matrix, rebuilt around identity

Assigned ad hoc before, and C4 made it worse: I widened the Pirate and the Paladin to fix a symptom
and ended up with two EARNED classes holding nine weapon types each - the widest access in the game
going to the hardest classes to unlock, which undercuts the three you start with.

## The rule

**Core classes are generalists. Earned classes are specialists.** You trade breadth for identity, so
unlocking a class means committing to a way of fighting rather than collecting more options. Core
tops out at four types; earned tops out at three.

| class | types | why |
|---|---|---|
| Warrior | sword great axe hammer | the melee generalist; the one you learn on |
| Ranger | bow cross dagger javelin | its identity is DISTANCE, so everything reaches |
| Mage | staff wand spellblade | the caster generalist |
| Berserker | great axe hammer | no sword. Heavy commitment, no finesse |
| Paladin | sword hammer spellblade | knightly arms and a blessed blade - not butcher's tools, not a mage in plate |
| Ninja | dagger sword cross | was NINE. A ninja with a warhammer is absurd |
| Pirate | sword cross javelin | cutlass and boarding weapons. NO flintlock - see below |
| Monk | fist | the class is the fists |
| Necromancer | staff wand | not a duelist; the corpses do the fighting |
| Stormcaller | staff wand | ranged lightning; no melee blade |
| Warlock | staff dagger | blood magic is close work |
| Chronomancer | staff wand spellblade | the most conventional caster, fitting for a control class |
| Skylancer | javelin bow | airborne reach |
| Bladedancer | sword dagger | pure blades - its trait literally reads "blade weapons" |
| Beastmaster | bow javelin | it fights THROUGH the companion, so its own arms stay light |
| Reaper | scythe | one weapon, and the class is built on it |

## The Pirate's flintlock is gone from the list, deliberately

The pistol is class equipment now - always in his off hand. Listing it as loot would mean finding
something you already have, and it was the reason C4 existed at all. That entry has now been removed
rather than compensated for.


---

# Weapon coverage — is it balanced?

The right test is not "how many weapons does a class get", it is **if this drops, how many of the
sixteen can use it?** A type only two classes can wield is dead weight in thirteen chests out of
fourteen.

## A correction first

My first count said NINETEEN OF TWENTY-EIGHT archetypes were unusable, including Ian's Blade. That
was wrong and I nearly reported it as a crisis. The archetype ID is not the family key: each
archetype carries an `art`, and families match on THAT. `saber`->sword, `crossbow`->cross,
`firestaff`->staff, `holyscepter`->wand, and Ian's Blade is `anyClass`. Nothing was dead.
Fourth time in this session a measurement of the wrong field produced a false alarm. Check what the
consumer actually reads before believing a count.

## The real picture, by art

    sword 5   staff 5   dagger 4   javelin 4   wand 4
    great 3   axe 3   hammer 3   bow 3   cross 3   spellblade 3
    scythe 1 (Reaper)   fist 1 (Monk)

Axe and greatsword were on TWO each - reachable only by Warrior and Berserker - so those drops were
dead weight for fourteen of sixteen classes. Fixed by giving the Pirate a boarding axe (about as
piratical as it gets) and the Paladin the greatsword. I had called the greatsword a butcher's tool
when trimming his list; that was wrong, a two-handed sword is the most knightly weapon there is and
the line belongs on the axe alone.

Everything now sits at 3-5 except the two deliberate exclusives. No class exceeds four types.

## One genuinely dead archetype, found and retired

`flintlock` was the only archetype no family listed, because the pistol became the Pirate's class
equipment. Every one that dropped would have been unusable by everybody. Added to RETIRED_ARCHES -
the existing mechanism for exactly this - so it no longer drops while the archetype survives for the
class's own pistol to be built from. Drop pool 23 -> 22, zero dead drops.

---

# Skill choices — the audit, for sign-off

Sixty-four 1-of-2 skill choices across sixteen classes. Two systemic problems, not scattered ones.

## Finding 1: the CAPSTONE choice is damage-vs-damage in nine of sixteen classes

Slot 3 is the rank-8 pick - the last and most exciting choice a class offers. In nine classes both
options are simply damage with a different spread:

    Warrior       Berserk [Offense]        vs Execution [Finisher]
    Mage          Arcane Tempest [Group]   vs Elemental Overload [Burst]
    Berserker     Whirlwind [Group]        vs Execute [Finisher]
    Ninja         Blade Fury [Burst]       vs Blade Storm [Group]        <- near-identical names too
    Chronomancer  Time Storm [Group]       vs Singularity [Burst]
    Monk          Thousand Fists [Burst]   vs Dragon Kick [Finisher]
    Stormcaller   Thunderstorm [Group]     vs Chain Reaction [Burst]
    Warlock       Dark Storm [Group]       vs Final Curse [Boss]
    Bladedancer   Dance of Steel [Group]   vs Perfect Counter [Boss]

"Hit many things" versus "hit one thing hard" is a real choice ONCE. As the climax of nine
different classes it is the same choice nine times, and it arrives exactly where a class should
feel most itself.

Two are worse still - literally the same role on both sides:

    Reaper    slot 2   Void Pull [Control]      vs Gravebind [Control]
    Skylancer slot 3   Thunder Dive [Group]     vs Cyclone Volley [Group]

## Finding 2: Berserker is a Warrior reskin at the SKILL level

    Warrior:   Cleave, Charge, Whirlwind, Shield Bash, Berserk, Execution
    Berserker: Cleave, Charge, Whirlwind, Reckless Bash, Berserk, Execute

Five of eight are the same skill with the same name. The Berserker's new identity (damage rises as
health falls, cannot heal, executes the gutted) is doing all the work of distinguishing two classes
whose entire kit is shared. Same for Reaper/Ninja (Shadow Step) and Pirate/Monk (Roll).

## Proposed reworks — SIGN-OFF WANTED

The rule that worked for passives: make the two options answer DIFFERENT QUESTIONS, not the same
question at different sizes.

**Capstones become "a new rule for the rest of the fight" vs "one enormous moment":**

- Warrior      Berserk -> **Warcry**: every enemy that can see you attacks only you for 8s.
                Execution stays as the burst.
- Mage         Arcane Tempest -> **Attunement**: your element changes on every cast for 10s.
- Berserker    Whirlwind -> **No Retreat**: you cannot move backwards for 10s; all damage doubled.
- Ninja        Blade Storm -> **Vanish**: you disappear entirely for 4s; the next Unseen is a kill.
- Chronomancer Time Storm -> **Stopped Clock**: everything but you freezes for 3s.
- Monk         Thousand Fists -> **Stillness**: stop moving and every hit taken is returned doubled.
- Stormcaller  Thunderstorm -> **Conduit**: every enemy hit stays chained to every other for 8s.
- Warlock      Dark Storm -> **Pact**: spend half your current health, deal that much to everything.
- Bladedancer  Dance of Steel -> **Perfect Guard**: every attack is parried for 3s.

**The two same-role pairs:**

- Reaper    Gravebind -> **Soul Tether**: linked enemies share all damage dealt to any of them.
- Skylancer Cyclone Volley -> **Updraft**: enemies are pulled into the air and cannot land.

**Berserker's shared kit** - replace the four Warrior copies with low-health-facing skills:
Cleave -> **Bloodletting** (wound yourself to hit far harder), Charge -> **Headlong** (a charge that
cannot be stopped or steered), Reckless Bash -> **Headbutt** (damage both of you, stun both),
Whirlwind -> **Deathwish** (a spin that hits harder the less health you have).

IMPLEMENTED 2026-08-04 (v1.670-1.690). All nine capstones, both same-role pairs, and the
Berserker's four Warrior copies.
