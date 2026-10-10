# Black Woods grove track route — 10 October 2026

## Finding and authority

The live Black Woods optional BR-04 path has three animal stones in one row. Reading its clue and pressing bird, deer, wolf is the same player action as the other retired ordered-input puzzles. The grove already has a shallow pool, visible animal prints, a split tree, a personal shard and a shared `woods.tracks.open` flag. Oliver's later feedback about repeated three-button puzzles, stronger environmental cause and effect, and more challenging optional parkour supersedes the historical fixed-sequence treatment in the September Black Woods work order. The current main story route and Beth rescue do not depend on this side path.

## Player experience

The old stone remains as an optional, brief clue. Bird prints end at the water. Hoofprints continue around it and toward the split tree; pawprints circle its base. The hooves disappear upward, where natural root perches form an uneven optional climb. A visible vine binding at the high perch is the only interaction needed. Releasing it peels back the root bundle over the lower hollow, revealing the existing BR-04 Rift Shard. A player can spot and climb the roots without reading the stone. Falls land in the open grove and allow a quick retry. The physical route, height changes and opening roots distinguish the activity from a three-input code.

Use the existing forest tree models around the route. Shape each landing as a branch or moss-covered root supported by a tree, with enough visual contrast to read from the ground and varied jump lengths. Avoid a row of floating square slabs, false collision, vanishing floor, occlusion that hides the landing, or an unrelated monster wave. No custom SFX work.

## Compatibility and verification

- Preserve `woods.tracks.open`, BR-04's ID and personal pickup, the main signal route, Beth rescue and both existing alternate approaches. Old completed saves keep the hollow open; old partial bird/deer/wolf counts do not force a new input order.
- The host owns the opening flag; either co-op player may release the binding, and each collects BR-04 individually. A checkpoint retry restores the pre-branch state. The release must be unreachable from the ground and must reject distant requests.
- Test the uncut normal-speed route with a miss/recovery, ordinary interaction prompt, visible root movement and shard collection. Test old partial/open saves, co-op guest use, all Black Woods main and rescue regressions, and both normal and shoulder cameras in a muted browser. Automated checks cannot establish final fun or difficulty.

## Implementation and verification

Version 2.154.0 replaces the three adjacent animal stones with six staggered root perches. Each has an invisible, authored landing and a matching low-poly bark-and-moss mesh; the visible mesh is merged into four material batches for the browser. A high binding interaction retracts the lower roots, removes their collider, and reveals BR-04. The old clue becomes a short note about the physical trail. The Black Woods signal and Beth rescue remain independent.

The muted browser checks crossed the climb with normal movement and jumps, intentionally fell into the grove, climbed again, used the ordinary interaction prompt, watched the release complete, and collected the shard. Full Black Woods ground and high routes, Lewis and Beth, host/guest release with personal shard collection, checkpoint retry, old partial/completed save reloads, normal and shoulder cameras, generic 3D and voxel fallbacks, story-state tests and the static gate passed. The existing Beth QA checks were updated to its already-live immediate companion grant; the co-op dialogue checks now expect the already-live local camera behavior. Screenshots were reviewed locally; Oliver's playtest is still needed to judge the route's appeal and difficulty.
