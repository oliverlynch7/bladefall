# Campaign environment craft pass â€” October 12, 2026

## Approved scope

All nine families and eight regional lists from CUSTOM_3D_ASSET_PRIORITIES_2026-10-12.md. This is presentation work on the current campaign, not a map replacement. Keep collision footprints, exact walkable tops, authored openings, player support and existing animation state. Retain good trees and current chest/clue/pickup models.

## Grounded implementation

Existing region renderers instance imported kits; most structural silhouettes still use rectangular components. Static authored props appear in both typed deco and untyped construction groups. Stateful parts are split between region Three.js renderers and classic level draw functions. Therefore:

1. Build a shared mesh library with tapered/chamfered silhouettes, curved sections, material separation and merged/cached geometry. Upgrade appropriate kit primitives while fitting their existing bounds. Keep floor-top envelopes intact.
2. Replace identified authored architecture with full models and explicit ownership metadata; avoid spatial guessing and duplicated old pieces. Add mechanical assemblies at existing mechanisms, animate from the same gameplay state, and preserve existing colliders.
3. Apply regional fittings and landmarks to every campaign half and boss arena that uses these assets. Any extra geometry must be supported by an existing structure and avoid usable paths. Camera cutaways must protect supporting floors and should not expose enemies through solid walls.
4. Add a developer model/coverage view for review; keep scene counts, model coverage and bounded visibility inspectable. Use cached geometry, instancing and shared materials; dispose scene-owned resources without destroying caches.
5. Verify every campaign scene in a real muted browser, including moving mechanisms, low-detail rendering, representative normal camera views, existing collision/routes, an old save and shared quest state. Record coverage and limitations, bump version and publish the completed pass.

## Coverage checklist

- [x] Natural cliffs, hill/ledge transitions, shelves/overhangs, riverbanks and cave mouths.
- [x] Cottage/barn/workshop, roof/window/door/chimney, damaged construction.
- [x] Timber/rope/stone bridges, stairs/landings, canopy perches and scaffolds.
- [x] Arches/corners/buttresses, broken masonry, cell fronts and gatehouses.
- [x] Wheel/winch/crane/pulley/counterweight/gates/lifts/pressure mechanisms.
- [x] Wagons/prisoner transport/tents/barricades/racks/supplies.
- [x] Landmark vegetation/roots/trunks/rocks/foliage, preserving mature trees.
- [x] Lanterns/braziers/sconces/shelves/benches/workstations.
- [x] Briar mill/barn/belfry/canopy.
- [x] Hollow cliffs/freight/bridge/prisoner enclosure.
- [x] Keep gatehouse/cells/rescue hoist/workshop.
- [x] Frost ice mouth/shelves/laboratory/frozen waterworks.
- [x] Ember furnace/bellows/exhaust/pipes/valves/presses/channels.
- [x] Coast wrecks/crane/ballista/dock/rope; functional boat preserved.
- [x] Sunspire arches/balustrades/fountain/mirrors/receiver/hinged library.
- [x] Castle entrance/spiral supports/lift housing/throne/gate surroundings.

## Risks to check

Decorative meshes cannot silently redefine collision. Roofs must not close the camera-safe barn opening. Cloth, chain and braces must clear routes. No static copy of a moving gate/lift/wheel. Floor contact and material contrast must survive low settings. All region renderers and shared versions must resolve to the same module cache. Preserve old saves and local co-op authoritative puzzle state. Screenshots, automated checks and human playtesting are separate evidence.


## Implementation and verified coverage — v2.186.0

All nine approved environmental families are covered across their relevant campaign placements. This is a shared model/kit and authored-landmark pass, not a claim that every mesh in the game was individually replaced. The library contains 59 original procedural 3D models in eight palettes, with 678 fitted model components across 24 scene snapshots plus shared kit replacements. Door detail is integrated in cottages; the separately available scaffold/perch/shelf variants are not substituted indiscriminately for existing supported routes. Those existing structures receive fitted landing, collar and chamfered timber/stone components.

| Region | Applied work |
|---|---|
| Briar Town / Black Woods | Timber cottages and damaged hamlet variants; shingle roofs, doors/windows/chimneys; mill and wheel; open barn/workshop gables; stone bridge; signal belfry fittings; canopy tenons, roots and fallen timber. Mature trees and the established walkable canopy stay in place. |
| Hollow Pass | Layered rock bodies, freight cart/cranes/winch/pressure plate, hinged rope bridge, raised cage fronts, prisoner wagon, gabled camp roofs, Ruth's supported awning, supplies and existing scaffold landings. |
| Ruined Keep | Gatehouse arch and buttresses, three working portcullises, prison fronts/arches and sconces, rescue-lift deck/shaft caps/pulley, press gears, workshop bench; existing correctly animated winch/counterweight retained. |
| Frostfell | Shaped snow cliffs and crystal rubble, ice cave entrance, camp roofs and supplies, Ellis laboratory/shelves/instruments/lanterns, waterworks valves and pipes tied to the water state. |
| Emberdeep | Furnace with an open fire chamber and foundation, bellows/exhaust/flanged pipes/valves, live press frames/rams, cooling channels/pistons, forge racks and workstations. Removed duplicated core body and stopped natural rock dressing from becoming arbitrary furnaces. |
| Stormcoast | Layered coastal foundations and spires, three ribbed broken hulls with planking and camera-clear broken port side, salvage crane/winch, ballista, curved arches and shelter roofs, rope bollards, Otto's bench. Existing playable boat/crossing retained. |
| Sunspire | Ornate arches and balustrades, tiered fountain and benches, rotating mirror frames/receiver, fitted bookcases, folding shelf frames/hinges and leaves that follow both crank stages. |
| Castle Duskmoor | Monumental gate arch, working portcullis, buttresses/windows, spiral-step corbels, service-lift housing/hoist, upholstered royal throne and existing Hollow Gate surround. Story reveals retained. |

### Rendering and preservation

- Original geometry is cached and merged by material, repeated placements are instanced, and additional scenery is culled by distance. Lantern/fire cores have their own unlit material; stone and timber keep distinct finishes. Imported-kit replacements are fitted to original bounds.
- Collision, parkour routes, story and loot rules are preserved. Old structure pieces are explicitly marked as owned rather than hidden through proximity guesses. Existing high-quality trees, functional ship, and good hoists/counterweights are retained.
- Animated decks, bridge, valves, cage fronts, press rams, mirrors and folding shelves follow existing game state. The jammed mill wheel stops after its feed is closed; the update does not invent a new mill outcome.
- The developer model workshop is linked from Title → Dev previews → Campaign environment. It supports regional palettes, orbit/zoom, weathered cottage, turntable and phone layouts.

### Evidence

See `docs/art-validation/campaign-craft-2026-10-12.json`. The final muted browser run passed all 24 campaign scenes, 59 finite model constructions and rendered workshop selections, 12 mechanism assertions plus the runtime-error check, imported-kit bounds, and low detail. Regression evidence covers 238 reachable interactions in the appropriate puzzle state, no crafted-prop footing failures, 24 checkpoint restores, a pre-change save, seven local co-op clue/pickup cases, and 184 coastal movement waypoints.

Normal-camera scene frames and all-model contact sheets were visually inspected. Review fixed hidden lantern light, duplicated furnace bodies, canopy occlusion, natural-rock surface artifacts, wreck framing and phone preview framing. These are source, browser and visual checks; they are not user aesthetic acceptance or a public-network/low-end-hardware certification. Campaign pacing, narrative and general quality remain ongoing work outside this bounded art request.
