# Dungeon puzzle and traversal continuation

Version 2.046.0-dungeon-puzzles — 2026-09-27.

## Changes
The optional lower lock now uses a two-pan balance beam. Its existing 2/3/5 controls cycle weights between the rack, left pan and right pan. All weights must hang and both loads must match. The beam tilts toward the heavier load; visible stacks and numerical action feedback explain the current state. The main rescue lift and the preceding safety latch keep their existing rules.

The lower controls and clue were spaced apart for access and visibility. Discovered lower-lock and drain clues update to the new rules; nearby clue lookup explicitly recognizes the lower controls. Recorded NPC dialogue remains unchanged. Existing kd.deep.open progress and reward IDs remain valid.

The optional drain passage is raised to 80 units, with three stretches of 70-unit stones spaced at up to 150 units. Ordinary single jumps suffice. Scratch-mark navigation, dead ends, the dry store reward and RK-05 remain. Water recovery returns to the raised entrance without a death penalty. Shards, objects, marks and affected enemies move with the route.

## Checks and limits
- Node: prison branches/gates/rewards, balance puzzle (all 27 arrangements recover), unequal-load rejection, solved and legacy state stability, malformed actions, discovered clue access, prior puzzle regressions and story authority pass.
- Chromium/WebGL: 337 route waypoints, single-jump drain traversal, rescue lift ride, dialogue pause, shared rescue, optional lock, armor reward, all three shards and water recovery pass. Enemy interference disabled for traversal; this is not a combat balance assessment.
- Controlled two-browser co-op: working lift, shared optional chamber, duplicate packet safety and personal shard collection pass. Not a real internet latency test.
- Checkpoint test: dungeon death resets only unbanked dungeon progress; boss retry retains banked five-shard set.
- Pre-change HEAD HTML creates a save; current HTML restores currency, rank, pets, NPC state, disabled speech and saved clue. Auxiliary modules are current, not an archived full deployment. Node test separately preserves old solved lower-lock state.
- Beam and drain screenshots reviewed locally. Syntax/whitespace checks pass.

Evidence: qa/DUNGEON_PUZZLES_2026-09-27.json. This is a focused continuation; the full campaign puzzle overhaul is still ongoing.
