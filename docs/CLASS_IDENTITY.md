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
