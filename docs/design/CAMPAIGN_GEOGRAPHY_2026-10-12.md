# Campaign geography and architectural continuity

Source: [U-GEO-20261012](../requirements/USER_SOURCE_2026-10-12_GEOGRAPHY.md). Affects GOV-02, LV-01/02/03/07/11 and MAP-01 through MAP-08. Status: implemented and locally browser-verified for v2.187.0; no human playtest claim.

## Problem confirmed in code

Most modern campaign builders join room rectangles with sampled square platforms. Many are thin slabs; outside those paths is the shared lethal hazard plane. The floor strips describe a traversal graph but do not themselves describe a village, castle or palace. Decorating those strips leaves the underlying problem intact. Ruined Keep's Dungeons also has a real lower floor, rescue lift and water drain which must not be filled or bypassed. Sunspire's shelf puzzle and dragon terrace deliberately require gaps. Those are protected features.

## Grounded implementation plan

1. Inventory the live room/route footprints, quest barriers, heights, optional branches and deliberate hazard areas. Save overhead maps and pre-change checkpoints for comparison.
2. Add a deterministic campaign geography layer after each authored builder. Physical and visible boundaries share the same descriptors. Keep named mechanisms, quest identities, rewards and saved progress. Do not apply campaign geography to hubs, trials, side modes or beta prototypes.
3. Ruined Keep: enclosed outer court, breach court and inner ward on continuous ground, with curtain walls and purposeful subdivisions; dungeon wings become actual connected chambers, with a bounded lift shaft and lower service/drain areas. No new route around the prison lift or sealed optional rooms.
4. Sunspire: supported terraced gardens and an ascending central architectural axis; the upper half becomes a monumental library with defined vestibule, reading nave, record wing, archive wing and gallery. Preserve optional rooftop/patio exploration, exterior dragon terraces, light puzzles and folding-shelf gaps.
5. Briar gets meadow/forest ground and wooded/fenced boundaries. Hollow gets canyon sides, Frostfell mountain faces/cave enclosure, Emberdeep foundry boundaries and real lava channels, Storm Coast landward rock and seaward exposure, Duskmoor castle enclosure and supported tower architecture with exposed broken stair flights. Do not wrap every map in the same rectangular wall.

## Failure cases and checks

- No invisible wall: boundary collision must have matching substantial visible scenery. Fence/foliage marks a boundary; supporting earth/stone closes it physically.
- Do not create a shortcut around a gate, lift, moving bridge, water channel or optional parkour puzzle. Test unsolved and solved states.
- Filling a floor must not bury a lower route, place a ceiling through a character, duplicate coplanar surfaces or strand an NPC.
- New foundations support the existing floor height; new protective rails leave every intended entrance open.
- Camera views must preserve the floor underfoot and handle interior walls without showing actors through them. Check far and shoulder views.
- Use shared geometry/materials and chunking. Check real scene counts and renderer errors; do not claim a frame-rate guarantee without hardware measurements.
- Rebuild deterministically for host/guest and old checkpoint saves. Preserve tutorial, hub, beta and special-mode behavior.
- Browser verification: all 24 campaign scenes; targeted physical movement/collision, fall policy, quest/gate/lift/shelf states, old save, checkpoint and local co-op regressions. Keep source review, screenshot inspection and human playtesting separate.

## Explicit limits

This is an environmental structure and navigation pass, not a replacement story or puzzle system. Duskmoor shove/grab enemies remain a separate combat proposal so geography changes can be assessed on their own. Human judgment remains necessary for pacing, beauty and challenge.

## Latest steering: scale and materials

Preserve every campaign scene's existing bounds and overall route extent. Map the current bounds against the pre-change inventory. Improve the shared material library: floor paving, stone block mortar, wood grain, rock strata, mineral veins and subtle ground wear. Use tiled textures on existing surfaces, no geometric tessellation. Review under normal gameplay cameras.

## Visual blueprint review — U-GEO-20261012-D

Added `public/design/campaign-geography/`, linked first in title > Dev previews. All sixteen campaign halves have a concise journey, actual quest/NPC destinations, optional-route purposes, protected mechanisms and a design-review note. The drawing uses captured collision/floor geometry and the actual exported route centers, including Briar's generated walking ribbons and canopy perches. Preserve the preceding release's footprint alongside the rebuild for comparison. Drag/zoom, height slices, an elevation profile and optional enemy starting positions expose stacked routes and deliberate gaps. Initial puzzle state is explicitly labeled; route lines do not imply that a gate is open or a jump is feasible.

The request arrived after this pass had started. These plans are a review gate before publication, not a claim that the entire current build was produced from prior sketches. Future layout changes begin with blueprint changes. The build script owns the authored intent; the browser capture script refreshes current geometry without touching user saves.

Review corrections: checked current quest logic instead of repeating old planning notes. Thunder Cliffs' cargo lift is already optional; the blueprint presents it as a shortcut, with the eastern steps as the main ascent. The library's damaged-record rescue is optional and distinct from the Legion orders. Earlier path checking moved the records-room bookshelf out of the actual walking lane; courtyard and sanctum side walls were extended to meet their quest barriers.

## Implemented geography/material pass — v2.187.0

- Existing bounds retained in all 24 campaign scenes, including boss arenas. Briar meadow/woodland borders, canyon and coastal land masses, mountain/cave faces, foundry shells and castle supporting architecture give the routes a physical setting.
- Ruined Keep has connected courts and bounded chambers; the prisoner lift shaft, lower works and drain remain separate. Arrival, arrow-post and workshop connections follow explicit entrances.
- Sunspire has a central garden ascent, supported patios and a monumental facade, followed by connected vestibule, keeper room, reading nave, records wing, galleries and sanctum. Alternate balconies, lower maintenance, folding shelves and exterior nesting terraces remain distinct.
- Contextual falls: ordinary Briar ground, Keep courts/arena and Sunspire gardens recover without arbitrary terrain damage; genuine mountain, lava, sea, dungeon and tower risks remain. Hitless rules retain their existing behavior.
- Shared 512-pixel painted textures add masonry joints, flagstone, wood grain, metal panels, rock strata, ice veins and ground variation. World-scaled mapping preserves detail on large surfaces; pigment also varies roughness and normal relief. Textures add no tessellation. Large boundary walls now use these materials instead of grids of tiny brick meshes, while keeping geometric coping and supports. Fourteen shared surface types are available; textures are generated once per type and reused.
- Frost cave collision-height ice now uses full-height art, with standalone crystal clusters left intact. Only palace floors receive the narrow architectural inlay; generic route stripes were removed elsewhere during visual review.

## Verification and limits

Evidence: `docs/art-validation/campaign-geography-2026-10-12.json` and the retained review images alongside it.

- 123 geography assertions across all 24 scenes: unchanged bounds, repeatability, wall/art pairing, context recovery, special-mode isolation and six protected puzzle gaps.
- 238 quest/NPC interaction approaches have valid footing and a clear interaction line in the relevant puzzle state. No new geography walls intersect sampled authored path centers; centerline sampling alone is not full route proof.
- Physically traversed 30 waypoints on seven edited Keep/Sunspire routes, plus Keep bell and canyon roof climbs. Palace west/east alternatives and old completion flags passed. Prison winch, prisoner transfer, repeat lift rides, coastal approach and cave-cache approach passed.
- 24 checkpoint restores, a pre-change save, twelve articulated mechanism behaviors and seven local host/guest clue/pickup assertions passed. Co-op used the real packet handlers between local browser contexts, not public-network play.
- All 24 scenes rendered in a real browser without reported WebGL/page errors; all three Frostfell scenes were rechecked after the full-height ice correction. Representative normal-camera frames inspected. At the sampled spawn views the final full sweep peaked at 310 draw calls / 353,601 triangles; these are scene samples, not a low-end hardware frame-rate guarantee.
- Blueprint controls passed 55 browser checks across every half, including comparison, layers, selection, drag/zoom/reset, phone width and deep linking. Captured desktop and phone views.
- The old Thunder route harness stalled on its earned rank-2 choice screen after the race, not on geometry. Its route-only fixture now starts at rank 10 and waits for boss loading; race and hydra-route travel then passed. An unrelated stale roguelite probe pointed to an old server and is not counted as verification of this campaign change.

This completes the bounded geography/material/blueprint pass, not the user's broad goal of a fully polished campaign. Human assessment of traversal pacing, encounter density, aesthetics and puzzle enjoyment remains open. No full unattended campaign completion or external-network playtest is claimed. Duskmoor shove/grab enemies remain separate combat work. Unrelated companion/rig edits are excluded.
