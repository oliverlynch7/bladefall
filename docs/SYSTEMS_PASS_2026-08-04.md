# Systems pass — quests, enemies, teaching, loot, editor

Oliver: *"Do it all. Don't stop till you're done."* — seven items surveyed in the previous turn.

Every one measured before it was built, because the pattern that produced the class, boss, zone and
hazard passes is the same each time: find the number that shows the sameness, then fix that.

---

## 1. Objective verbs — the biggest one

**Measured first.** Across all eight zones and ~24 areas the game had FOUR verbs:

    kill  9    find  8    fetch  7    back  5

Every zone asked the same three things with different nouns. This is the complaint Oliver made
about level layouts, one layer up: the zones, hazards and enemies are all distinct now, but the
REASON to be in them was not.

Five new verbs, each using a system the game already has, each asking something the others do not:

| verb | what it asks | reuses |
|---|---|---|
| `hunt` | find and kill ONE named elite, not a species | elites, a beacon that tracks it |
| `purge` | destroy the spawner dens themselves | the den system |
| `reach` | stand on a named vantage | the verticality pass's high ground |
| `kindle` | light the dead braziers along the route | the interact prompt |
| `survive` | hold a spot while it comes to you | wave spawning |

`survive` is the only verb in the game where the player stands still; every other one is "move
toward a thing". `purge` is the only one aimed at a structure — and it fights back for it, because
otherwise it is "walk to three dots and press E", which is a chore rather than an objective.

Assigned thematically rather than rotated: the Keep holds a breach because it is a fortress, Castle
Duskmoor kindles gate-fires because its hazard IS the dark, the Abyss hunts one thing because it is
where something looks back. Cull counts came down to make room, so the area is not longer.

## 2. Enemy behaviour

**Measured first.** 33 enemy types, but 18 shared `kind:'walk'`, and of those, eight had nothing but
stats and a colour. They are also most of what you fight in the early zones — the wrong creature to
leave featureless when the player meets it a hundred times.

    bones      rise      gets back up once. Teaches you to watch the corpse.
    sentinel   watch     raises the alarm and wakes the room. Kill it first.
    shadeling  fade      untouchable for a beat. You cannot burst it, you have to time it.
    sporeback  spores    lingering cloud where it fell. Denies the ground you just won.
    toxling    volatile  detonates on death. Punishes killing it in your face.
    frostling  chillaura slows you by existing near you. Nothing alone, a problem in a pack.
    emberling  ignite    burning ground where it falls.

`grunt` is deliberately still plain. A roster needs one thing that does exactly what it looks like
it does, or "this one has a trick" stops carrying information.

**A correction worth recording:** I first reported that 18 enemies had no behaviour at all. Wrong —
I searched for ability-shaped field names and missed the `spec` field, which already gave the
Batch-2 zone natives real tricks (shell, blink, tether, totem, trail, knight-slam, sun-priest). The
roster was in better shape than my first look claimed.

## 3. Teaching

The game had gained four hazards, five verbs and seven enemy tricks and explained none of them
beyond a zone-entry toast. A system nobody explains reads as noise — the player concludes the game
is unfair rather than that it is asking something.

All of it now teaches just-in-time on FIRST CONTACT, the rule the movement tutorial already
followed. Never on zone entry: a warning you receive before you can act on it is just text.

## 4. Loot

**Measured first.** A weapon's rarity changed exactly one number — `dmg = base * rarity.mul`, plus
5% lifesteal if it happened to be legendary. A legendary was a common with a bigger number, which is
why picking one up was a menu comparison rather than an event: nothing about how you FIGHT changed.

Twelve affixes, every one driving a field the combat code already reads (dmg, cd, kb, lifesteal,
el), so none of it needed new combat machinery. Rarity now buys a COUNT of affixes (0/1/1/2/3), not
just a multiplier — which is what lets a Rare with two good rolls beat an Epic with one bad one.
That comparison is the whole point: loot is interesting exactly when the answer is not obvious from
the colour.

A real roll from the verification run:

    epic:      Balanced Epic Sword       dmg 42.6  cd 0.41            slow and heavy
    legendary: Profane Legendary Sword   dmg 35.3  cd 0.25  void      fast and elemental

Elemental affixes only land on weapons with no element of their own — a fire staff that rolled
"Frostbitten" would be lying about what comes out of it. Ian's Blade never rolls: it is the one
weapon whose identity is the story rather than the dice.

## 5. Editor spawners

The palette carried a note saying dens were left out because nobody had established what a den with
no quest does — "placing one would be a guess dressed as a feature" — and asking for the consumer to
be read. Read it. The tick does **not** look at `questId` at all: it finds the area's active kill
quest and filters `G.dens` by `d.type === kq.mob`. Kill credit is counted separately, by mob type,
in `questKill()`.

So all three feared outcomes were wrong: it cannot corrupt a counter (the counter never reads dens),
it cannot spawn freely (no matching quest means the tick does nothing), and it is not undefined (a
non-matching den is inert). The palette now places one, and the toast says which of those you just
made rather than leaving you to find out.

## 6. Story endgame — already done

I had listed this as unfinished. It is not. `STORY.ending` fires with a difficulty-specific closing
line, and Ian's Blade's reveal fires on reforge. Castle Duskmoor has its boss. The only open item is
a question in the story bible addressed to Oliver about how final he wants the ending, and the
implemented version already answers it.

## 7. Screenshot harness — not fixed, and the reason is embarrassing

I set out to fix the harness because it "could not capture transient state" and had defeated me on
the Collapse telegraph. It can. It already waits two rAF ticks after `--eval` precisely for this,
with a comment explaining a previous session's identical mistake.

Every failure was mine:
- injected `warn:5` when the design range is 0→1.15, which makes the shadow's width NEGATIVE and
  puts the falling mass ~1700 units above the level
- placed markers at `p.z-150` when the camera looks along **+z**, i.e. behind the shutter
- used `--scene 9` when `--scene` takes a zone index 0-7, and read the wrapped result as data
- read a draw-counter immediately after `update()`, which is not what renders

I did verify hazard visuals render — the Emberdeep vents photographed cleanly, along with the new
`hunt` objective and the just-in-time teaching line. I never got the Collapse telegraph itself and
stopped chasing it.

## Still unverified

Nothing in this document has been played. Specifically:
- whether `survive` is tense or a chore, which is the verb most likely to be wrong
- whether the affix numbers are balanced (they are plausible, not tuned)
- whether the enemy death behaviours make the early zones feel dangerous or noisy
- the Collapse telegraph, still
