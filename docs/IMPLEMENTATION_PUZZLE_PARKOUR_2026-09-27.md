# Puzzle and parkour batch — 2026-09-27

Version: 2.045.0-puzzles-and-parkour.

## Implemented
- Deep Ice Caves main waterworks: fill in three measured increments, freeze at bank height, drain beneath the ice. Wrong heights drain safely for another attempt. Physical depth posts and changing water surface explain the state.
- Optional lower channel: independent inlet, spill and chiller valves with connected lit pipes. Solve by routing water, regardless of input order.
- Sky Library: each handle turns its shelf and the next shelf together. Pale target marks, gold pointers, numbered controls and a reset lever. Solving extends five narrow platforms toward the relocated SP-03 shelf.
- Library platform crossing uses ordinary single jumps, with lower catch floors and a route back to the start.
- Long Ascent: two missing steps in the exposed upper flight, removed from both collision and rendered meshes. Catch ledges below support safe jump recovery. Existing lift alternative remains.
- Puzzle feedback states what changed and coalesces repeat actions. Already discovered ice/shelf journal clues migrate to the new rules. Completed puzzle flags and rewards remain intact; NPC dialogue and voice IDs unchanged.

## Verification
Evidence: `qa/PUZZLE_PARKOUR_2026-09-27.json`.
- Seven Node suites pass: new puzzle states, feedback/journal guidance, story transactions, authority, Ice Caves, Sky Library and Long Ascent.
- New regression suite covers every water depth, safe retries, flow configurations, all 64 incomplete shelf configurations via reset, saved solved states and invalid transaction rollback.
- Real Chromium/WebGL: both ice puzzles and linked shelves solve through interaction requests; seven library waypoints traversed with one jump; 258 tower/side route waypoints traversed.
- Deliberate falls reach library floor and both tower catch ledges; one-jump recovery succeeds.
- Two-browser controlled packet relay: remote shelf turns, shared bridges, dialogue ownership, guard gates and individual shard collection pass without page errors.
- Pre-change HEAD HTML creates a save; current HTML resumes it preserving currency, rank, pets, NPC state, disabled speech and saved clue. Auxiliary modules are current, not a full archived deployment.
- Syntax and whitespace checks pass. Screenshots inspected locally for the channel and library reward approach.

## Limits and follow-up
This is a focused batch, not completion of the entire campaign puzzle redesign. Traversal checks isolate terrain by disabling/stunning enemies; they do not establish combat difficulty or novice completion times. Controlled packet relay is not an internet latency test. Continue with other regions after playtesting these mechanics.

Design references consulted: Nintendo's Tears of the Kingdom overview (https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/The-Legend-of-Zelda-Tears-of-the-Kingdom-1576884.html), Ubisoft's physics/design discussion (https://news.ubisoft.com/en-us/article/4L1Ir1ltkWDqqXJKPvM1Qb/immortals-fenyx-rising-game-director-on-flying-physics-and-aerial-combat), and PlayStation's Lost Legacy coverage (https://blog.playstation.com/?p=193212). General inspiration: visible physical consequences, retryable mechanisms and traversal connected to environmental puzzles; no copied assets or layouts.
