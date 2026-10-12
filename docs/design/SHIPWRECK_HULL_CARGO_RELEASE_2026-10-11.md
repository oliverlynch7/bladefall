# Shipwreck Shore: cargo release at the lower hatch

## Grounded problem

The optional SC-01 route currently starts with three numbered weights on the rudder deck. The only decision is to toggle nearby objects until their sum is five. That is the repeated button-combination experience Oliver rejected. Its resulting hatch is on the lower crawlspace route, so the current upper-deck controls and lower gate do not communicate one physical cause clearly. The full shore route, boat repair, Rose, Stormshot and voyage are worth preserving.

## Scoped replacement

Keep the upper wreck and lower crawlspace routes. Replace the three weights with a storm-swaying cargo cage suspended from a salvage boom. A painted strike mark on the braced beam shows where the load must pass. The player reaches one release lever on the upper deck and times it as the cage crosses the mark. The lever shows a clear ready state, a premature pull visibly slips and can be retried, and a successful pull drops the load onto the beam. A connected line and the beam's movement show why the lower hatch opens; the existing physical ramp then leads to SC-01. This is a timing-and-observation interaction, not a number code. The introductory hull note and optional tracker explain it in plain words.

`sc.hull.open` remains the durable shared truth for the hatch and shard. The old `sc.weight.*` events and partial `sc.hull` mask/load values become inert. Already-open saves stay open, and an unfinished old save can solve the new mechanism. The main boat objectives, rewards and co-op authority do not change. No new lore or custom SFX work.

## Verification and risks

- In a muted real browser, inspect the complete approach in normal camera, including an early pull, visible retry, successful impact, lower gate removal, ramp walk and shard pickup. The visible strike mark and prompt must be legible at ordinary camera distance.
- Verify the lever cannot be used from the lower path, the timing window is fair, and the hatch remains closed on miss. Check co-op guest request against host timing, old completed and partial saves, checkpoint reload and the complete shore/voyage route.
- Run story-state, static/syntax and existing campaign regression checks. Browser checks establish mechanics and appearance only; Oliver still judges enjoyment and challenge in human play.

## Local result, v2.176.0

The three weight inputs have been removed. A swinging cage, painted strike mark, side-mounted release lever, lift line and lower timber ramp now communicate one cause and result. A premature E press keeps the hatch shut and gives a short cue; a correctly timed press opens the existing hatch and SC-01 route. The release is unreachable from the lower path. The timing window is about eight tenths of a second per crossing to allow for a co-op request.

Muted normal-camera review covered the early pull, retry, impact and lower ramp. Browser checks passed the complete shore route, physical hatch walk and shard, checkpoint rollback, boat voyage, a guest-operated release accepted by the host, and old partial/completed save reloads. Static story and authority tests passed. Human playtesting is still needed for whether the timing feels satisfying and whether the cargo mechanism looks clear enough during ordinary exploration.
