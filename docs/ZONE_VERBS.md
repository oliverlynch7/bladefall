# Zone overhaul — one VERB per level

Signed off by Oliver 2026-08-06. Each zone gets a different *thing you do*, not a different skin.
That is what makes them unique in play; theme is paint, the verb is the experience.

| zone | verb | state |
|---|---|---|
| Hollow Pass | **follow** — winding enclosed corridor, walls are a consequence of the route | SHIPPED `terrainCanyon` |
| Frostfell | **discover** — carved interior you cannot survey from the door | SHIPPED `terrainIceCave` |
| Emberdeep | **time it** — platforming over a lava sea | SHIPPED `terrainLavaField` |
| The Abyss | **commit** — shards in blackness, ground that only sometimes exists | TODO |
| Castle Duskmoor | **ascend** — one continuous climb up a single tower | TODO |
| Sunspire Palace | **be exposed** — formal symmetry, long sightlines, cover to cover | TODO |
| Ruined Keep | **breach** — concentric fortress you attack inward | TODO |
| The Outskirts | **orient** — open farmland, see everything, choose your line | TODO |

## The remaining five, in build order

**The Abyss — commit.** Floating shards in blackness with nothing beneath. Phasing means some
platforms exist only sometimes, and shards resolve out of the dark as you approach so the whole
route is never visible. Emberdeep's timing is EXTERNAL (a pillar's rhythm); here it is the ground's
existence. Punishes hesitation. Reuse the lava-field station/crossing skeleton, swap eruptions for
`G.phasers` and remove the light.

**Castle Duskmoor — ascend.** One continuous climb: a spiral of ramparts and stairs wrapping a
central keep. You always see where you have been below and where you are going above. Gloom pools
light on the inner stair and leaves the outer walk dark, so the climb is a choice between the safe
slow way and the exposed fast way. The boss is visible from the bottom. Needs a helical route
generator - height rises with angle rather than with z.

**Sunspire Palace — be exposed.** The only ORDERED place in the game: axial approach, colonnades,
terraces, reflecting pools, mirror symmetry. Long sightlines mean you are seen from far away -
archers on balconies, Glare sweeping the open floor. Cover is columns and arcades. Plays as a
ceremonial walk crossed with discipline. Generator is symmetric by construction, not noisy.

**Ruined Keep — breach.** Architecture you attack, not landscape. Concentric: outer bailey, curtain
wall, inner ward, keep. You fight INWARD. Every wall has several ways through - gate, collapsed
breach, climbable rubble - so the level's question is "how do you get in". Collapsed floors are
vertical shortcuts. Collapse hazard finally earns itself: the building falls as you climb it.
Reuse `terrainIceCave`'s subtractive carve, rectilinear instead of organic.

**The Outskirts — orient.** The only level where you see everything. Rolling farmland, a windmill on
the horizon as a landmark, sunken lanes for cover, hedgerows, a river with fords. You can see the
exit from the start; the question is which line you take. Deliberately the opposite of every other
zone - it teaches reading a space before the game starts hiding things. Low-amplitude heightfield,
no walls, visibility IS the feature.

## Rules for every one of them

- opt in via `TERRAIN_ZONES`; the hand-authored zone stays one flag away
- the zone OWNS its entrance and exit - both the canyon and the plates shipped with the player
  spawning into a hole because the ends were inferred from the layout
- verify walkable end to end with a jump-limited walker before looking at it
- `auditReachable()` runs automatically; check `G._reachMoved` is not silently large
- every deco entry needs a `c` colour or `col3()` throws inside the draw loop and blanks the frame
- screenshot and LOOK before committing
