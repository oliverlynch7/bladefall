# Remaining campaign journey finishing pass — 2026-10-14

Baseline: fc6e6e24. Scope: ten remaining campaign halves, after the completed Briar/Hollow/Keep passes. Current source builders, quest objects and exported paths are the authority. This is a finishing pass, preserving large-scale layouts and real mechanics, not a new story or a set of interchangeable switch puzzles.

## Authored area plan

| Area | Spatial purpose and changes | Protected interaction / verification |
|---|---|---|
| Snowbound Peaks | Sign the shelter, supply loop, high trail and cave approach. Lay restrained packed-snow trail edges on supported floors. Correct blueprint coil location to the shelter. Guide the approach to the cornice, not straight at its high anchor. | Heater crossing, camp ridge, cornice gaps, wind and missed-jump recovery. |
| Deep Ice Caves | Separate laboratory, spring chamber and exit with researcher signs and mineral/stone inlays. Keep lab furnishings outside the rescue approach. | Ellis guards and rescue, fill/freeze/drain mistake/reset/crossing, side spill and ledge recovery. |
| Iron Halls | Mark receiving, western stores, worker shelter and casting-floor circulation with industrial paint/brass. Keep rail machinery readable. | Shelter guards, handles/cart, physical scrap sled and hammer; overhead and blank routes. |
| Great Furnace | Distinguish worker-floor, transport, office and cooling routes. Clear routes around controls and escort. | Pike gate, worker failure/retry/arrival, cooling pedal release/retry, piston and pressure branches. |
| Shipwreck Shore | Use nautical signs at actual salvage forks, with modest beach trail detail. Keep Otto's return journey legible. | Wreck climb, occupied lookout, drain/latch rope room, hull release, boarding/voyage boundary. |
| Thunder Cliffs | Label eastern steps and optional cargo lift truthfully; mark upper climb and arch fork without revealing rewards. | Lift is optional; tide timing, cliff/race route, upper barrier and hydra transition. |
| Palace Courtyard | Use restrained marble/brass route inlays and garden/terrace direction boards. Make low waterworks versus upper patrol route obvious. | Either balcony works, full library seal, mirror beam, memorial/roof and garden loops. |
| Sky Library | Signed reading halls, maintenance and terrace junctions; fitted stone inlays. Check bookcase entrances and separate floor levels. | Access options, required guards, physical reflector, staged shelves and dragon terraces. |
| Castle Gates | Sign repair yard, supply stores, drain and gatehouse; paving belongs to service approaches, not moat. | Broken drain, return bridge, disguise or confrontation, store and balcony routes. |
| Long Ascent | Floor-specific landing signs and short stair-edge markers. Navigation must follow the spiral rather than point through the tower or at the same X/Z on another floor. | Both catches, broken upper flights, cells/vault brake, service lift, summit guards and throne doors. |

## Construction rules

Reuse the existing crafted-model/material pipeline; signs are authored at actual junctions with solid narrow posts and readable double-sided text. Do not use random clutter. Surface detail is clipped to real floor heights and cannot visually fill a hazard or a parkour gap. Keep clear landing/control approaches. No new hidden reward arrows. Shared helper code is acceptable; area placements and route decisions remain explicit.

Update the ten blueprint review entries before layout changes; correct stale steps and preserve historical scale. Capture current initial-state geometry after building, retaining the first six completed map records.

## Verification and completion

Use one local visible browser fixture for repeatable area selection, actual movement/physics, interaction checks and screenshots. Test authored main paths and affected branches per area, closed/open gates, at least one continuous normal-camera mistake/recovery sequence for each regional mechanism, and inspect rendered controls. Run existing relevant logic suites. Test real host/guest handlers over a local relay and genuine pre-change saves, in isolated tabs so QA clients do not overwrite each other's autosaves. Treat failures as work to fix, not reasons to lower the bar. Record exact coverage and limits; automated checks do not establish human enjoyment, online latency or low-end performance. Publish only after checks, with version bump and deployment confirmation. Do not include unrelated companion/rig edits.

## Build findings

The initial placement audit and real movement checks caught new posts obstructing the ice-cave rope return and Castle Gates store return. Both were moved before the successful route retests. Five other placements were moved to actual supported landings. Normal-camera inspection then caught the coastal entrance signs competing with Otto’s boat and Abe’s shelter; the signs now stand beside those features. Coastal route materials use sand/weathered-stone colors, distinct from palace inlays. The full-size environments and their established assets remain in place.

A clean reload with new asset version keys exposed duplicated deep-world module instances. All dependent palace/castle/boss/portal imports now share one version, and a regression check enforces that rule for the asset pool and crafted-scene owner. This was caught and fixed before deployment.

The coil blueprint now points beside Heath’s shelter. Required cornice guidance follows reachable ledges only after that clue becomes the current main objective; it cannot replace an earlier task. The tower chooses its current storey before selecting the next flight. The ice-crossing notice describes the secured crossing instead of generic puzzle text.


## [Codex | 2026-10-14] All remaining campaign journeys finished — v2.197.0

Completed the pass across Snowbound Peaks, Deep Ice Caves, Iron Halls, Great Furnace, Shipwreck Shore, Thunder Cliffs, Palace Courtyard, Sky Library, Castle Gates and Long Ascent. Added 48 fitted, framed, double-sided destination signs and floor-clipped regional route surfaces; kept existing full-size maps, story/rewards, detailed assets and deliberate hazards. Guidance follows the tower’s current storey and required cornice ledges, identifies the lower library latch and remaining required guards. The ice crossing now describes its concrete result. The blueprint coil location is corrected to Heath’s shelter.

Physical/visual checks moved new posts away from the ice rescue return, castle store return, unsupported cliff/terrace edges, Otto’s boat and Abe’s shelter. All new posts have supported footing and clear wall access. Unified the shared rendering module versions after a clean reload caught a split asset pool. Refreshed only the last ten initial-state blueprints; first six records, all bounds and historical footprints remain unchanged.

Verified 808 route waypoints, six cornice landings, 92 returned quest assertions, five continuous normal-camera mistake/recovery sequences, two coastal entrance walks, 61 host/guest assertions through a local serialized relay, and ten genuine fc6e6e24 saves preserving names, 983 gold, character level 12 / XP 87, Warrior rank 7 / XP 169 and quest flags. Fifteen logic suites and 24 source/import-map syntax checks passed. Inspected ten rendered junctions. Scope, evidence, resolved failures and browser caveat: docs/art-validation/remaining-journey-20261014/summary.json.

This finishes the remaining-area process requested in this turn. Automated traversal is not a human pacing/fun/novice-comprehension, full combat or low-end performance verdict; local relay testing is not an Internet session. No new custom SFX. Unrelated companion and articulated-rig edits remain untouched and unstaged. Deployment confirmation follows.
