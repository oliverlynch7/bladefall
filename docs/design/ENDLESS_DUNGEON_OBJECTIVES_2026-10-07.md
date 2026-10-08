# Endless Dungeon: distinct room objectives

## [Codex | 2026-10-07]

The revision-9 expansion makes Prison Break larger, but its new guard rooms still ask the player to clear enemy packs. Room names, colors and cover do not change that input loop. This pass changes two new-wing rooms per section on fresh revision-10 runs while keeping the existing route, three bosses, two chests per section, permanent economy, sparse healing, co-op ownership and earlier checkpoint geometry.

- The workroom (room 11) has two visible ward crystals in clear floor sockets. While either survives, one guard reinforces the room on a capped interval. Destroying the crystals stops reinforcements; clearing the remaining guards opens the route. The sockets and their lighting must change visibly when destroyed. This creates a priority decision rather than another fixed kill count.
- The yard (room 13) has a marked center. It charges only while a living player holds it. Enemy groups arrive at the start and at two charge milestones. The route opens after the charge is complete and the current guards are defeated. The floor marker and HUD expose progress and whether the player must return to the circle.

Do not require co-op partners to stand together. The host owns spawns, progress and rewards and shares room state; either living player can hold. Checkpoint resume restarts an unfinished encounter, while cleared rooms and rewards remain. Old revision-1-to-9 layouts and combat rules remain unchanged. Distinct socket/ring art is visual only and must not add hidden colliders or block attacks. Test the failure/recovery loop, real combat, checkpoint resume, co-op state and layout hashes in a browser. Automated tests cannot establish final difficulty or enjoyment.

## Shipped evidence

Version 2.139.0 implements the revision-10 plan above. Pure tests exercised 1,080 seeded layouts, 2,160 ward socket placements, 25,920 enemy spawn positions and 9,720 historical-layout comparisons. Browser tests verified that ordinary melee damages a ward, reinforcement begins and stops, the hold timer stops outside the circle and resumes inside, all three waves and both room rewards clear once, either co-op player can hold, 1.6x co-op HP and guest reward/checkpoint isolation remain, and a saved revision-9 run retains its plan and health. A full three-section run reached Tier 2 with exactly two chests per section. Desktop and 390px phone views were inspected; art reports about 41k triangles and ten draw calls per section. Human feedback remains the acceptance gate for encounter pressure and overall dungeon variety.
