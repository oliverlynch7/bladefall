# Broken Walls finishing pass — 2026-10-14

## Approval and baseline
Latest user: “Okay go ahead and work on that.” This approves Broken Walls as the next step in the existing sequential campaign pass (U-GEO-20261012). Baseline b4fbfa47, v2.194.0. Scope is production Ruined Keep part one; the beta and later parts are unchanged. Keep bounds -2440..1850 X, -4900..680 Z, current rewards, story flags and encounters.

## Inspected faults and intended changes
- Initial suspicion about dungeon gate flag naming was disproved: both renderers already use `rk.cells`. Keep that behavior and explicitly verify both key/wheel routes and saved open states.
- Main guidance always selects the high wheel. Guide to the arrow stair before its platform; use actual remaining guards; after rescue offer the nearest reachable key or battlement approach, respecting current elevation. Keep both routes.
- Broad paved courts have no useful visual route. Add a joined muted blue-grey stone runner and warm inset edging from entry through the gate, around the breach flanks, and toward prison. Separate ochre workshop and muted moss west-route signs. No floor added over optional jump gaps. Reuse masonry/flagstone material and detailed kit.
- Plain cube bell, bow and wheel obscure affordances. Replace with fitted bronze bell and rope, mounted ballista with visible cut cord, gate wheel with spindle, and workshop latch whose moving pointer/green sector use exactly the same timing predicate. Gate artwork must track real flags. Preserve existing immediate release semantics and completed-save restoration.
- Breach warning boxes are at a fixed position unrelated to incoming attackers. Mark the actual next entry side before each wave, preserve three waves/30 seconds and prisoner health. Explain leaving/retry and remaining attackers in the tracker. Start the bell to the side of the evacuation lane so prisoners do not walk through it; move its trigger and model together. Retry remains host-owned.
- Keep art adds large decorative towers that have no collision. Fit narrow collision to these existing tower footprints, with explicit route checks; avoid blocking bell, paths, landings or NPCs.
- Clear superseded transient quest notices without deleting journal clues; repair local corrupted punctuation and confusing dialogue where found. No new lore, combat rewards or SFX.

## Plan view before geometry
Update map 2-0 and PLANS intent first. Main sequence remains Grant -> east stair/post -> side gate -> breach court -> key OR east battlement -> cell stair. West tower/old wall/chamber and east workshop remain optional. Bell proposed at (-210,-1850,0), out of prisoner X=-60..60 line. Tower collision matches existing art at (-540,420),(540,420),(-720,-2640),(720,-2640),(-1860,-3750,80),(420,-4360). All other 15 maps retained. Refresh final geometry only from the built initial state.

## Verification and failure controls
1. Before/current normal-camera shots of entrance, bell, arrow post, workshop and gate. Genuine b4fbfa47 save with partial gate flags/name/gold/character XP/class XP.
2. Physical main/optional route traversal. Check all doors closed/open, no alternate bypass, no new prop obstruction, upper wheel and tower/chamber return. Correct terrain if tests expose a real mismatch; don't mask it with teleportation.
3. Continuous normal-camera workshop interaction: mistimed input, visible unchanged latch, wait for green, successful release, enter and collect tools. No jump cuts during sequence.
4. Live breach AI reaches/damages prisoners; failure/leave retreat, retry and successful finish. Existing enemies, no combat pass based solely on stubs.
5. Two rendered clients through actual host/guest handlers: local dialogue, shared gates/timing/rescue, host-only health, duplicate state and exit. Local relay is not Internet testing.
6. Source/syntax/story regressions, old-save reload, exact-path commit, main push, Cloudflare and production version check. Close owned tabs, stop server, remove generated fixtures.

Human pacing/beauty/comprehension and low-end performance remain unverified. No claim that automation establishes fun.

## Traversal-driven adjustment
The real upper-wheel climb intersects the east decorative tower at (720,-2640). Making that art solid exposed the existing overlap. Move the matching west/east tower pair to X +/-930 at the same Z, update art and collision together, then repeat all routes. The workshop test must first open its legitimate locked door; testing a closed door as a free route is not a level fault.

## Final acceptance and adjustments

Implemented v2.195.0. See `../art-validation/keep-journey-20261014/summary.json` for all results and exact limits. Existing gate flags were correct and left intact. Mistimed/accepted workshop inputs and an entire real-time walk through the door passed. Final visual inspection replaced stair-stepped paving edges with a clipped union mesh; kept one shared readable sign palette instead of separate route colors. Moved two supply props clear of the new road and two decorative columns away from the ballista/wheel. No corrupted story punctuation was found; the short Grant response and unsupported ancestry intro were simplified.

40 recorded main waypoints, 136 optional waypoints plus the chamber shortcut, live rescue damage/retreat/retry, both exit choices, 13 local host/guest assertions, six solid towers, and a real previous-version save all passed. Navigation, timing boundaries, restore idempotence, authority, journal and syntax regressions passed. All other blueprint maps are preserved. Human pacing, comprehension, enjoyment and low-end performance still need playtesting. Public-network co-op was not tested.
