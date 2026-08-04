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
