# Storm Coast machinery and traversal — 2.049.0

## Changes
- Shipwreck Shore: hanging cargo and a moving beam visualize the existing five-unit hatch puzzle. Solving it opens a short physical ramp inside the hatch. Broken decking on the wreck approach requires ordinary jumps, with lower catch boards.
- Thunder Cliffs: separated platforms on the main upper ascent and narrower stones on the optional wind climb. Catch ledges support retrying. The old obstructed low return is replaced with automatic recovery to the wind-climb entrance after a second on the bottom catch, excluding dead/downed players.
- Hydra: two raised flank routes, 13 stepping platforms each, provide a jumping alternative above the low sweep. Attacks, exposure windows, neck restraints and the merciful outcome are preserved.
- Current discovered notes update; newly found clues describe the routes. Existing NPC recordings, boat crossing, shard IDs and completed flags are preserved. Tide-stone sequence remains unchanged; this batch makes no claim of finishing all campaign puzzles.

## Verification
Node story suites passed. Browser: 50 shore waypoints, 131 cliff waypoints, 26 Hydra stepping points with single-jump movement, bottom-catch recovery, main/side quest gating and rewards passed. Combat verifies real sword and bow damage to exposed restraints, warning damage, all-chain mercy outcome, reward dedupe and retreat. Screenshots of flank routes and recovery inspected.

Two-browser controlled relay checks passed for shore dialogue, shared versus personal shards, boat helm swaps, ready/repair, disconnect and stale packets; cliff lift/cave, guest restraint damage and shared Hydra release also passed. These are controlled relays, not real internet latency tests.

Pre-change HTML save fixture preserves pets, rank, gold, hub dialogue, clue, checkpoint and disabled speech. Auxiliary modules are current, not an archived deployment. Traversal uses disabled enemies/invulnerability and does not prove natural combat balance. Existing stale test conversation sequences were updated to reopen after the approved leave-conversation behavior; shore co-op fixture now sends the guest's nearby position before shared conversation.

Evidence: docs/qa/storm-traversal-2026-09-27.json. Art overhaul and custom SFX remain deferred.
