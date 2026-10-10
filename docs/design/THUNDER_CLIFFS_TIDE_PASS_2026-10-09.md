# Thunder Cliffs tide route — grounded live-map pass

The optional inland shard currently opens after pressing three adjacent stones in numerical order. Its surrounding tide loop is already a broad side branch with a sealed grotto, so the route can support a real traversal problem without altering the main hydra approach.

## Player action and spatial plan

- At the Tide Circle, read a short carving that points to the inland rock door. The gap toward the grotto has visible stable landings and exposed stepping rocks. The tide visibly falls, warns, then surges on a readable cycle.
- Cross the rocks by jumping. Wide stone rests are safe places to wait through a surge; the narrow exposed stones are dangerous during it. A missed jump lands on a low catch and returns the player to the tide circle after a short beat, without a death/reload.
- Reach the release catch beside the sealed door and use it during low tide. It slides the grotto door open, revealing the same SC-05 Rift Shard. At high tide the catch is visible but blocked with a clear reason. The route can be retried indefinitely.
- Keep both the floor and stones opaque at all times. Tide visuals and warnings may change; standable geometry must never fade below the player.

This is observation, timing, and traversing real space followed by one distant release. It is not a disguised three-button sequence. Dash's already-spaced timed flag race remains a separate optional traversal activity.

## Constraints and verification

Preserve `tc.tide.open`, SC-05, the main upper route, the Dash route, co-op host-owned story state and prior save loading. Leave the old three-button event IDs in the story book as legacy aliases but remove their live interactables; old progress does not corrupt a save. Check a low-tide success, high-tide refusal, miss/recovery, physical jumps, opened-gate travel, multiplayer clock sync, and the existing campaign route in a muted real browser. View the route from the normal shoulder camera, including a failed attempt. Subjective timing and difficulty remain for Oliver to playtest.

## [Codex | 2026-10-10] Implemented and checked

The live route now uses four separated rock caps, a lower recovery ledge, a phase gauge and a far-side door catch. Narrow stones take one surge hit per cycle; the large last landing is safe. SC-05 and `tc.tide.open` are unchanged. A revision-2003 save with the door already open loaded with the door and shard intact. The prior three stones are absent from live interactables, while legacy event IDs remain in the story book.

Static gate and story tests pass. Real-browser checks physically jumped the rocks, recovered from a miss, refused the catch at high tide, opened it at low tide, crossed the gate, and reached SC-05. Full Thunder Cliffs waypoints, Dash's timed route, hydra approach, death/retry and co-op state checks pass. The route was viewed in the shoulder camera before and after water-color refinement. Only a human playtest can settle the final rhythm and difficulty.
