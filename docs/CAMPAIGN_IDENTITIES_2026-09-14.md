# Campaign identity direction

Oliver rejects the repeated room-and-loop appearance. Clarity stays, but each world needs a distinct silhouette, material/light profile, obstacles, navigation, encounters, discovery and gameplay. Keep preferred hero/weapon assets and browser performance. This supersedes the old uniform campaign-route art/layout direction.

World identities:
- Outskirts: open farming valley, grounded roads, amber crops and olive meadows, watchpost orientation and optional farm discoveries.
- Black Woods: dense enclosed roots and lantern-lit clearings, meandering routes and concealed shortcuts. Develop exploration rather than repeat the open valley.
- Hollow Pass: ochre slot canyon, pale eroded cliffs and turquoise wind, a winding low wash with exposed upper rim paths. Windbreak controls create calm crossing windows. Dry Wash develops this through a fossil basin, irrigation machinery and cliffside ruins.
- Keep: steel-blue outer fortress, enclosed courtyards and narrow ramparts. Open shortcuts from behind barricades; descend into a tight rust/red prison with a distinct escape route.
- Frost: blue-white caves opening onto exposed aquamarine shelves. Momentum and sheltered recovery patches govern movement; the second area rewards controlling long slide routes.
- Ember: charcoal industrial ruins, orange magma and cyan cooling machinery. Pressure cycles and valves change safe approaches; refinery maintenance paths differ from the open caldera.
- Abyss: violet/indigo void surrounding broken radial fragments. Anchor unstable crossings and choose which fragment to secure. Hollow Deep folds into ruined records chambers.
- Palace: ivory, gold and verdigris, formal terraces interrupted by light machinery. Align a light route; gardens replace rigid axes with overgrown winding terraces.
- Castle: cold black ramparts, crimson banners and warm defended refuges. Breach the siege approach, then climb a tightly coiled tower route with shortcuts and a visible destination.

Implementation begins with Hollow Pass and Dry Wash as the first distinct pair. They must pass a real playthrough of their navigation mechanic, legacy/new save checks, collision walking, high/low visual checks and new Blender overviews before that identity approach is extended to the remaining worlds. Do not describe planned mechanics above as implemented.

## Hollow grounded plan

The current two Hollow maps both use the shared eight-room graph, generic tree/column replacement, world-wide wind and kill/fetch quotas. Existing platform collision, room enemies, quest markers, interacting and campaign saves can support a bespoke pair.

Build an asymmetric S-shaped lower canyon with a higher switchback/rim route and a hidden side alcove, then a broader fossil basin with offset ruins and a climbing aqueduct. Retain the class-trial entrance. Replace the Hollow kill/nest checklist with recovering a caravan charter in the hidden rim alcove, then lighting the Pass Beacon. Keep the quest IDs and migrate completed legacy objectives; unfinished old quotas restart as the new exploration objectives. Place the five Dry Wash relics on distinct reachable shelves. Add optional operable windbreak vanes: a vane gives a clearly signalled calm interval in its nearby crossing, while the sheltered low path remains available. The first map teaches this in a safe basin; the second uses two exposed shelf transitions. Use localized wind exposure instead of shoving players in every canyon shelter. Vanes are repeatable controls, not another collectible quota; no mandatory ability upgrade or timed failure state. Preserve existing save objectives and gear.

Visuals: warm ochre sandstone/pale caps, shaded teal clefts, rope bridges, wind-driven pennants and sparse brass machinery. Cliff walls follow the actual canyon bends and cut away for the camera. Existing kit geometry stays instanced; add no large texture download. Keep other worlds unchanged in this first implementation.

## First implementation — v1.971.0-canyon-identity

Hollow Pass and Dry Wash use HOLLOW_JOURNEYS revision 3, with 11 and 9 districts respectively. The first has a winding lower wash, exposed rim loop, hidden caravan alcove and distant beacon. The second opens into a broad fossil basin and climbs around a broken aqueduct, with a low survey-tomb branch. Sandstone cliffs follow route edges; background pillars stand outside the full walkable footprint. Pale rib arches, brass windbreaks, rope walks and turquoise wind provide a local visual vocabulary. Shared Hollow scenery also takes the warmer sandstone palette.

Two repeatable windbreaks per map calm their nearby crossing for 12 seconds. Sheltered areas experience no gust force. Exposed ground applies a counterable drift; airborne movement keeps the existing gentler ledge handling. Visual arrows, wind ribbons and a HUD status communicate exposure and the calm interval. The mechanics do not require a class ability. Hollow Pass replaces the old kill/nest quotas with charter recovery followed by the beacon. Existing completed objectives migrate, and a new mid-objective save resumes correctly. Dry Wash retains its five placed fossils and shrine discovery.

Validation:
- Real Chrome: all four windbreak interactions, calm windows and expiry; sheltered entry checks; no page errors on either map.
- Real physics: 40 directed edge walks across both maps with active wind, opposing starting phases and enemies disabled, all passed. This checks controllability and collision, not combat balance.
- Node fixture: all campaign exploration edges walked bidirectionally and all 24 maps passed target reachability. The other 22 maps retain identical generator geometry and quest definitions.
- Real Chrome objectives: early beacon blocked, physical charter pickup, pagehide save/reload/continue, beacon completion and exit; old partial/complete objective migration; all five physical Dry Wash relic pickups and shrine completion open the exit.
- High/low screenshots inspected. Representative static scenery: Hollow Pass 33,196 visible triangles / 92 calls at high and 12,652 / 45 at low; Dry Wash 21,192 / 56 and 8,136 / 32. These are scenery counters at sampled views, not total renderer or frame-rate claims.
- Full-map Blender exports rendered and inspected; gallery entries campaign-1-0 and campaign-1-1 and route diagrams updated.

Remaining campaign identities above are design direction, not completed mechanics. This release is the Hollow pair; the other worlds still need their individual implementation and validation.
