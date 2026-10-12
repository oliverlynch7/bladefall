# Castle Gates: broken drain crossing

## Grounded problem

The shipped Castle Gates route uses two nearby `E` bridge catches in the drain and a third `E` wheel. The campaign audit names this as diluted preparation before the level's distinctive disguise and inspection scene. The actual route has a continuous flat drain floor, so its separate catch labels do not make the play different. The quiet Cross dialogue, the difficult finite assault, Roland's optional armor, and CD-02 are worth preserving.

## Scoped change

Keep the repair yard, supply collection, inspection, assault and reward paths. Collapse the middle of the drain path and remove its old direct outlet into the court. Place three offset, climbable remnants of the old masonry there, with pale edges visible in the normal camera. A miss costs the usual fall HP toll and returns the player to the last safe ledge. Put one physical bridge brake on the far end under the internal `cg.catch.west` flag. Releasing it drops a narrow return walkway across the broken drain. The wheel beside the bell post then lowers the actual bridge into the court with an animation. The old `cg.catch.east` flag and event remain loadable but are no longer a required or visible action. Existing `cg.bridge.open` saves still open the bridge.

The required action sequence becomes: observe the broken crossing, traverse the offset jump gaps, release one brake, use its new return walkway, then lower the bridge. No code, count, or adjacent-switch guessing. Roland and journal guidance should say where the broken drain, brake and near-bank wheel are in short, practical language. Main-objective navigation points at the brake until it is released, then the wheel. The optional roof and shard route remain accessible.

## Risks and acceptance

- Confirm actual player movement and held jump can traverse both gaps without dash, and a miss recovers without a softlock. Check possible shortcut jumps and collision at the landing.
- Confirm the near-bank wheel cannot lower the bridge before the far-bank brake is released, and the drain has no route that bypasses the closed bridge into the court. Confirm the bridge's visible deck and collision agree at both states.
- Test first visit, both preexisting partial catch states, completed bridge state, quiet inspection, failed inspection/assault, checkpoint reload and two-client host-owned world interactions.
- Inspect the entire crossing in a muted real browser with the normal camera, including a failed jump and successful retry. Node assertions alone do not establish appearance or fun. Oliver's playtest is still needed for feel and difficulty.

No new story reveal, reward, custom SFX, or broad map replacement is in scope.

## Local verification

Muted Chromium confirmed ordinary movement and jumps across all three stones to the far bank, a deliberately missed jump with a 22% HP toll and safe retry, brake release, the physical return walkway, E-key control of both brake and wheel, a blocked premature wheel interaction, and a full walk over the lowered bridge into the court. The same browser passed the 39-waypoint Castle Gates route, quiet/disguise and three-wave assault branches, checkpoint/reward banking, both legacy partial catch states and completed bridge state, repeated sync without duplicate decks, navigation progress, and two-client story authority. Normal-camera raised and lowered states were visually reviewed. Human playtesting remains needed for difficulty, pacing and art judgment. No custom SFX work.
