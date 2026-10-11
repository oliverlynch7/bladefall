# Winding Cliffs freight cart — scoped live-campaign change

## Why this interaction changes

The required freight bridge currently asks the player to toggle adjacent 2, 3 and 5-mark weights until a hidden sum is seven, then guess between two brakes. In play, that is another nearby-button combination. The bridge itself already has a clear lowering animation and a real crossing; preserve both.

## Player action and visible response

The broken-wagon trail leads to the bridge works. The freight plate shows a cart, a floor plate, and a bridge cable. On the left siding, a loaded rail cart sits away from the plate. The player pushes it once; the cart rolls along an unobstructed, collision-backed track and compresses the visibly marked plate. The cable indicator changes from slack/dark to taut/bright. The player then reaches the winch brake on the opposite side of the works and releases it, watching the bridge lower. A premature brake press explains that the plate has no weight yet. This is a physical cause-and-effect task, not an order or number guess. The optional high-bracket cargo chest keeps its separate parkour route.

## State and co-op

Keep `hp.bridge`, `hp.brake.right`, bridge geometry, checkpoint and rewards. `hp.cart.push` is a new host-authoritative, once-only story event. It sets the legacy `hp.weight.open` flag as the internal docked state, so an older save with a solved weight puzzle can still use the brake. Old `hp.bridge` saves remain complete. Unsolved old weight masks do not grant progress. The cart starts fully docked when a saved flag says it is ready; a new push animates on host and guest from the shared event. The brake is unavailable until that animation finishes locally and on the host. Only the host commits story progress.

## Acceptance

- Readable approach and interactions in normal third-person camera, before and after the push and bridge release.
- A premature brake cannot open the crossing, explains why, and can be retried.
- Cart render and collider move together; no cart blocks the bridge after docking.
- Full physical route, optional cargo release, quiet lookout route, checkpoint and old save states still work.
- Guest sees the cart roll and bridge lower, and can initiate the shared cart action.
- Static, story, guidance and browser checks pass. Human playtesting remains necessary for feel and visual quality.

## Verification — 2026-10-11

Version 2.166.0 uses a short authored siding off the existing Bridge Works. Normal-camera screenshots exposed an old 530-unit cliff pillar cutting across that siding; it was moved away before signoff. The loaded cart and dark rail now remain visible from the push prompt. An ordinary E interaction starts the cart, the rendered car and its collider travel together, the floor plate sinks and lights when loaded, and an early E on the winch gives a useful blocked message. A second ordinary E releases the bridge and adds the same walkable crossing as before.

The 118-waypoint physical Winding Cliffs route, both lookout approaches, cargo climb/chest, bridge set piece, combat route, guidance, two-page co-op mirroring and guest-owned push/winch, checkpoint, old partial/ready/completed bridge saves, old cargo saves, story authority and dialogue-logic checks passed in muted browser/unit QA. Screenshots: `output/playwright/cliff-freight-before.png`, `cliff-freight-moving.png`, `cliff-freight-docked.png`. The cart and surrounding canyon remain in the existing voxel style; this check establishes readable cause and effect, not a claim that a human has judged the art or puzzle satisfying.
