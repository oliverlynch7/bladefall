# Sky Library shelf crossing — grounded change packet

## What exists

The optional SP-03 branch puts three shelf handles and a reset lever together on the near landing. The `linkedRotate` effect turns paired values until `[1,2,3]` matches. All five stepping platforms then appear at once. The normal camera shows a broad pale platform and an empty gap; the route matters only after the combination is solved. This is mechanically the same small-control guessing family Oliver identified as repetitive.

## New player action

Keep Simon, the optional shard, the far restricted shelf, and the independent main path. Put a clear first folding-shelf crank on the near landing. It extends the first two physical shelf bridges. The player crosses the gap and reaches a second crank on the new landing; it extends the remaining shelves toward the shard. The route bends, rises, and changes jump distance, so traversing the library is the challenge. Gold edge rails and colored book spines make each newly opened shelf visible. An existing lower row of catch platforms lets a missed jump become a recoverable retry rather than a death or a soft lock.

Simon and the journal explain the two cranks in short language. The optional objective tracks the current stage. The main guardian route never depends on this branch. No new story reveal or reward is added.

## Save and co-op behavior

Keep `sl.shelf.open` as the completed flag and SP-03 as the reward ID. Old completed saves draw the full crossing. Old incomplete knob positions are ignored; the new near crank starts the route. Both cranks are authored shared-world transactions, so the host remains authoritative in co-op. A late guest sees the same stage from story state.

## Verification

Check before/after normal-camera frames, a failed jump and recovery, first and second crank effects, physical jump route, direct-shard prevention before the second crank, main-path independence, old saved flags, and co-op request propagation. Do not call this human-playtested until Oliver tries it.

## Implementation and local QA

Version 2.168.0 replaces the linked three-handle combination with the staged shelf crossing. The first crank unfolds two shelves; the second crank stands on the far shelf and unfolds four more. The final shelf overlaps the archive floor so the last jump has a solid landing. The older lower catch route remains. Both cranks now give short, specific on-screen feedback; Simon's notes and the optional tracker describe the route. The main guardian door remains independent.

Muted Chromium QA verified all eight travel waypoints through the shard room, a missed jump to height 280 and a return to the height-360 near landing, both shared co-op stages, the independent main door, old completed and partial story states, and no page errors. The new inline-script parse guard catches syntax mistakes before browser testing. Normal-camera frames are under `output/playwright/sky-library-shelves-*-2168.png` in the local workspace. Fun, difficulty and discoverability still require Oliver's playtest.
