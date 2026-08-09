# Zone overhaul — one VERB per level

Signed off by Oliver 2026-08-06. Each zone gets a different *thing you do*, not a different skin.
That is what makes them unique in play; theme is paint, the verb is the experience.

| zone | verb | state |
|---|---|---|
| Hollow Pass | **follow** — winding enclosed corridor, walls are a consequence of the route | SHIPPED `terrainCanyon` |
| Frostfell | **discover** — carved interior you cannot survey from the door | SHIPPED `terrainIceCave` |
| Emberdeep | **time it** — platforming over a lava sea | SHIPPED `terrainLavaField` |
| The Abyss | **commit** — shards in blackness, ground that only sometimes exists | SHIPPED `terrainVoidShards` |
| Castle Duskmoor | **ascend** — one continuous climb up a single tower | BUILT `terrainSpireClimb`, unpushed |
| Sunspire Palace | **be exposed** — formal symmetry, long sightlines, cover to cover | TODO |
| Ruined Keep | **breach** — concentric fortress you attack inward | TODO |
| The Outskirts | **orient** — open farmland, see everything, choose your line | TODO |

## Two things this file did not warn about, and both cost a rebuild

Written down here because the next three zones will hit them.

**The row emitter is not universal.** Canyon, ice cave, lava field and void shards all emit by
scanning z, scanning x, and asking `covered(x,z)` for THE height. That returns ONE height per cell,
so it cannot express any zone that passes over the same (x,z) twice — Duskmoor's helix does it once
per turn. `terrainSpireClimb` emits along its path instead. Ruined Keep's collapsed-floor vertical
shortcuts will have the same problem.

**Hazard reach is flat.** Gloom's safety test was `dXZ(...) < L.r` with height stored and ignored,
and the same flat assumption appeared in hazTopUp's dedupe and in the fixed 260 torch radius. Any
zone with real stacked storeys must pass `G.spireRY` and give its lights an `ry`. Check the hazard
before assuming a vertical zone works: Duskmoor's first build had no dark in it anywhere.

## The remaining three, in build order

**Castle Duskmoor — DONE except art.** Generator, lighting and framing built and measured; see the
1.899.0 commit. Still open: enemy placement is one generic monster per landing, and the two routes
have no different threat profile yet (the outer walk should probably be where the archers are).

As built: keep radius 300, stair ring 520, outer walk 750, 5 turns of 210. The two routes are
separated by GEOMETRY, not by a tag — the outer walk sits beyond the 646 any stair sconce reaches,
so it is dark because of where it is. Inner stair measures 0% dark; outer walk 54%, worst dark leg
420 against the ~770 the gloom gives you at run speed.

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
