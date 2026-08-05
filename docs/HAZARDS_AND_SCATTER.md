# Hazard identity + mob scatter

Oliver: *"do the hazard identity pass idea that we would have mobs scattered all throughout the
level. not evenly so, and not at every moment, but not only just around spawners."*

Two passes, both measured before and after with `tools/mobdist.js`.

## 1. Hazard identity

Before: eight zones, four hazards. Outskirts and Palace had **none**. Keep borrowed Phasing from the
Abyss; Castle borrowed Emberfall from Emberdeep. So half the zones in the game played identically to
another zone no matter how differently they looked.

Four new hazards, built so that no two ask the same question of the player:

| zone | hazard | the question |
|---|---|---|
| Outskirts | **Thornwild** (new) | *where* you walk |
| Hollow Pass | Gales | mid-air control |
| Ruined Keep | **Collapse** (new) | *when* you move |
| Frostfell | Rime | braking distance |
| Emberdeep | Emberfall | rhythm |
| The Abyss | Phasing | which ground is real |
| Sunspire Palace | **Sunspire Glare** (new) | timing a moving thing |
| Castle Duskmoor | **Duskmoor Gloom** (new) | routing between resources |

Design notes that are not obvious from the code:

- **Thornwild** is tier 1, so it must TEACH rather than punish. It never kills from full (~3% bleed
  per second), and you stop it by walking out. The lesson is "the ground is not neutral", which
  every later zone then charges you for. It scales TOP SPEED, not acceleration — slowing
  acceleration reads as input lag, which is the one thing a movement hazard must never feel like.
- **Collapse** lands NEAR the player, never on them, and picks its spot fresh each time. A ruin that
  only collapses in three fixed places is a trap layout: you learn it once and never look up again.
  The falling mass and its growing ground shadow are the dodge window.
- **Glare** rotates rather than blinks. Rotation is readable from anywhere in the level without
  having learned a timer, and it is the only hazard here you solve by moving WITH it.
- **Gloom** is the only one that changes how you read the MAP rather than how you move. Every room
  gets a lamp and every existing torch counts, so no room is a death sentence and the route between
  them is where the pressure lives. It builds over 3.5s and drains at 1.8x, so a dark crossing is a
  decision with a cost, not a wall.

## 2. Mob scatter

Measured first (`node tools/mobdist.js`). Every zone, before:

    zone        mobs  open%  nearDen%  clump   reads as
    outskirts   34     0      38       0.49    ARENAS-ONLY
    hollow      20     5      70       0.61    ARENAS-ONLY SPAWNER-BOUND
    keep        35     3      71       0.39    ARENAS-ONLY SPAWNER-BOUND
    frost       24     4      54       0.35    ARENAS-ONLY
    ember       29     0      48       0.33    ARENAS-ONLY
    abyss       25     4      56       0.43    ARENAS-ONLY
    palace      28     0      46       0.38    ARENAS-ONLY
    castle      32     0      56       0.29    ARENAS-ONLY

Between 0% and 5% of enemies stood outside a room. Every zone was a chain of arenas joined by
completely safe walking.

**The other two clauses were already satisfied, and checking first is what stopped the pass making
things worse:**

- *"not evenly so"* — clumpiness already measured 0.29–0.61 against 1.0 for a uniform spread. The
  packs were ALREADY clumpy. Scattering evenly would have flattened the one thing that was right.
- *"not at every moment"* — enemies sleep until the player is within 640 units (the `dropT` gate in
  the enemy update). Filling the open space does not fill the level with combat.

So `scatterPass()` adds exactly one thing: presence BETWEEN rooms. Packs of 2–4 on the span between
consecutive rooms, only ~half of spans (the dice roll is what keeps stretches quiet — a pack on
every span is a corridor of enemies, the same failure as none), never within 450 units of a den,
plus lone sentries so the open space is not uniformly "pack or nothing" either.

### The mistake worth keeping

The first version anchored packs at the MIDPOINT of the line between two consecutive rooms, and
measured no change at all: 0% open before, 0% open after, despite 14 new enemies.

Rooms here are about 1280x900 and consecutive ones sit as little as **780** apart, so they OVERLAP.
The midpoint between two room centres is the single most reliable way to land inside a room. I had
aimed the pass at the fullest part of the map while believing it was the emptiest.

37% of a zone's area is inside a room, so the open space was real and plentiful — it just is not
where the straight line between two room centres goes. The fix is to stop inferring "outside" from
geometry and test it directly: sample up to 8 candidate points along and beside the span, keep the
first that is genuinely outside every room and on good ground. Same fix for the sentries, whose ring
was measured from one room's edge and landed inside its neighbour.

This is the third time on this project that a pass measured no effect because the metric was fine
and the ASSUMPTION underneath the placement was wrong. The tool is what caught it each time.

### The second mistake, which was in the METRIC

After the fix, five zones went to 14-27% open. Three did not move: Emberdeep 6%, the Abyss 4%,
Castle Duskmoor 3%.

I measured how much open non-room ground those levels contain, concluded they were platforms over a
chasm with nothing left to fill, and told Oliver they were saturated. **That was wrong, and it was
wrong for the same reason as everything else in this file: I re-implemented one of the game's own
tests instead of calling it.** My ground check asked "is there a segment or a plat here", which is
not how this game decides what you can stand on - it reported the OUTSKIRTS, open grassland, as 2%
standable ground.

`surfaceHeightAt` is now exported for the tools, and the probe calls it. The real numbers, read as a
RATIO of "share of enemies in the open" against "share of the level that IS open ground":

    zone        open%  ground%  ratio
    outskirts    16      4       4.0
    hollow       34      9       3.8
    frost        18      5       3.6
    palace       17      8       2.1
    keep         23     12       1.9
    abyss         4      4       1.0   balanced
    ember         6      8       0.75  under-used
    castle        3      7       0.43  under-used

The Abyss was genuinely saturated. Emberdeep and Castle Duskmoor were not - they have 7-8% open
ground, as much as the Palace, and the scatter simply never reached it. One zone out of three, which
is what stating that conclusion confidently was worth.

### The third wrong guess, and the counter that ended it

I then guessed the elevation test: those two are the VERTICAL zones, so a span runs from a room at
y=0 to one at y=580 and a check against their AVERAGE rejects floor and top alike. It is a real bug
and the fix is kept - ground at either end's elevation now counts - but it moved Emberdeep from 6%
to 6%. Wrong again.

So I stopped guessing and put a rejection tally on the pass. One run gave the answer:

    ember: spans 9, killed-by-dice 5, no-anchor 1, PLACED 6

The quiet was a per-span coin flip at 45%. In the Outskirts that is 16 spans and 9 survivors; in
Emberdeep it is 9 spans and 3. The small zones are exactly the ones that can least afford the
variance, and every zone that "failed" was a small one. It is now a fixed SHARE of spans (60%),
shuffled - so which spans stay quiet is still random, which is the part a player feels, while how
many no longer depends on how many rooms the zone happens to have.

Three guesses, each plausible, each costing a full measurement cycle. The counter cost one edit and
answered it outright. **When a pass silently does nothing, count the rejections before theorising
about them.**

### The fourth, which was ORDERING

Castle Duskmoor reported 6 lights for 10 rooms. I blamed a ground check at the room centre - a real
flaw, and fixing it changed the count not at all. The cause was that `hazSetup` runs INSIDE the
scape builder, while `zoneTopology`, `addVerticality` and `highGround` all push more rooms
afterwards. The hazard only ever furnished the rooms that existed at the moment it ran: four unlit
rooms in the one hazard that punishes darkness, and whole late-built rooms with no thorns in the
Outskirts and no vents in Emberdeep.

`hazTopUp()` now runs after the room-building passes and fills in whatever appeared since.
Castle 6 -> 10 lights, Outskirts 9 -> 13 thorn patches, Emberdeep 9 vents across 10 rooms.

The number was in front of me twice before I asked WHEN it was produced rather than WHY it was
small. In a pipeline of passes that each mutate the same world, "when did this run" is worth
checking before "what is wrong with it".

Lessons, all about tools rather than levels:
  - a probe that re-implements a game rule eventually measures something the game does not believe
  - a metric with a fixed threshold was, for three of eight zones, worse than no metric: it was
    confidently wrong in the direction of more work, then confidently wrong in the direction of
    less. It now reports the ratio, which has no threshold to get wrong.
  - instrument before hypothesising. Three theories cost more than one counter.

## Final state, measured

    zone        mobs  open%  ground%  ratio   was
    outskirts    41    12      4       3.0     0%
    hollow       23    13      9       1.4     5%
    keep         41    12     12       1.0     3%
    frost        30    23      5       4.6     4%
    ember        34    15      8       1.9     0%
    abyss        30    13      4       3.3     4%
    palace       35    17      8       2.1     0%
    castle       35     9      7       1.3     0%

Every zone now carries at least its proportional share of enemies in the open, where before every
one of them was a chain of arenas. Clumpiness stayed between 0.32 and 0.66 throughout, so the packs
are still packs - the pass added presence without flattening the distribution, which was the risk.

## Fairness audit (before the playtest, not after)

A hazard can be unfair rather than merely unfun, and unfairness is measurable without playing. Three
checks, run before Oliver touched any of it:

**Castle Duskmoor forced damage.** The gloom bites after 3.5s, about 770 units at run speed. The
longest unlit stretch on the route was 1560 - more than twice survivable - with 57% of the route
dark. The zone was not offering a decision, it was charging damage twice over on the worst crossing,
which is exactly how a hazard reads as tedious rather than tense. Lanterns now go in along the route
wherever a dark run would exceed 520. Worst run 1560 -> 480, dark share 57% -> 27%: still a hazard,
no longer a tax.

**The lights were invisible.** They were positions with a radius and no model. You cannot route
toward a safe place you cannot see, which turns a navigation hazard into a guessing game. Each is
now a standing brazier visible from across the level; the ground ring still only appears once you
are out in the dark and need the exact edge.

**Narrow footing.** Collapse knocks you AWAY from the impact, so on a causeway it is a death rather
than a hit; Thornwild cuts top speed by a third, so a patch on the run-up to a gap silently makes
that gap unclearable. Neither is diagnosable while playing - both read as "the game killed me
unfairly". `openFooting()` now refuses both on anything but open ground.

That guard cost coverage the moment it went in: the Outskirts fell from 13 thorn patches to 6, and
only ~40% of debris spots passed - and because the strike timer resets BEFORE the placement attempt,
a rejected spot burned a whole cycle, so the keep would have quietly stopped collapsing in the
ledge-heavy stretches where it is most atmospheric. Retries fixed both: 19 thorn patches, none on a
ledge, and six candidate spots per collapse.

Trading a fairness bug for a limp hazard is not a fix, and the second measurement is the only reason
that did not ship.

## Still unverified

Nothing here has been played. The passes are measurable and measured; what they FEEL like is not
something the probe can report:

- whether the added enemies make zones feel populated or attritional (Outskirts 34 -> 48, Keep
  35 -> 42, on top of the earlier encounter pass)
- whether Gloom in the Castle is tense or tedious
- whether Collapse reads as dodgeable in motion, which is the whole design bet
