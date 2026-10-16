# Hollow Pass new-player review

Approval: U-HOLLOW-REVIEW-20261015. Baseline 7beba2d0 / v2.202.0-first-boss.

## Grounded scope

The current main journey is a lower-road prisoner wagon, a loaded cart/bridge winch, a lookout that permits combat or a high rope bypass, and the lift into Lost Canyon. Canyon entry permits correct orders, a fight, or a service route; Ruth directs two rescues, the north group needs protection, the alarm cable requires a scaffold climb, and the escape gate leads to the Marksman. Existing side routes include Skip's rope/ridge reward, a cargo release, old prisoners, water, cave supplies and freight storage.

1. Reuse the genuine early Warrior save and earn the Brute completion through normal combat rules. Record any scripted input assistance. Inspect the real exit, bank/unlock and subsequent hub/Hollow entry rather than setting completion flags.
2. Traverse both halves with the ordinary collision/combat engine and gameplay camera. Check current objective text, arrows, journal feedback, interaction availability and visible consequences. Include a premature interaction, optional content, a wrong turn/missed jump and recovery. Do not suppress foes or boost stats during the main journey.
3. Fix demonstrated confusion or broken transitions. In particular, compare the alarm's wording with its actual mandatory escape condition, ensure optional rewards don't displace main directions, and verify escort failure/retry messaging. Keep instructions short and matched to actual bindings and mechanisms.
4. Check progress after title/reload and death/retry, quest items before/after NPC dialogue, duplicate rewards, both gate paths and co-op shared quest state where affected. Reuse existing targeted tests and add only meaningful regressions for changes.
5. Review the Marksman entrance and warnings with the earned build. Publish a bounded verified release, preserve unrelated work, record evidence and explain human-playtest limits.

No new quest framework, map shrink, general difficulty nerf or custom SFX. Any needed physical layout change must first update its existing campaign blueprint. Code tests establish rules; rendered movement establishes traversability/presentation. Neither alone establishes fun or novice pacing.

## Review findings and bounded implementation

- Keep the existing route and encounters. The earned-save Brute exit and Hollow unlock work. The initial off-route fall was caused by the local test driver applying camera-relative inputs in overhead mode; it is not a product movement failure.
- The Waystone's 72-unit interaction radius is slightly inside the enlarged front collision edge (~76 units from its center). Extend reach only, then test the front approach and competing NPC targets.
- Canyon hazard labels say fall, but death attribution and particles fall back to lava. Add the existing canyon theme to the fall branch without changing damage.
- The bridge's moving cart must be described as moving until it docks. An early cart inspection should point to the transport orders rather than a generic return-later message. Link the cart to its discovered freight clue.
- Retire Skip's return-rope instructions after turn-in, including legacy saved notes, and do not replay the pickup instruction on a completed revisit.
- Ruth must explain that both cage groups and the alarm cable are required to open the escape route. The north group needs the player to protect it; Ruth does not escort that group for the player. Locked cages/escape controls should name the remaining task.
- Validate mandatory jump-climb navigation, alarm/escort ordering, failure/retry, title/reload and shared host/guest state with the existing test tools plus new targeted regressions.


## [Codex | 2026-10-16] Hollow guidance bounded release - v2.203.0

Implemented cart/bridge timing and clue guidance, completed rope-note repair, required alarm/player escort explanations, locked-object feedback, Waystone reach and canyon fall attribution. Targeted logic/syntax checks pass. Prior rendered fixtures cover gate/cage collision, all alarm/freight jumps, continuous missed-jump recovery, live prisoner damage/failure/retry, 16 local host/guest checks and an old partial-save load (level 10, rank 6, 913 gold and flags retained).

The earned Warrior reached north escort wave 1, then rank-5 passive selection paused the driver at 20% rescue progress. Last persisted evidence: canyon-alarm-earned.json. Full scope, fixture corrections and test limits: docs/art-validation/hollow-review-20261015/summary.json. Browser discovery currently returns no available browser. Remaining: earned escort/Marksman approach, rendered Waystone front interaction and final production browser smoke check. Do not claim the entire review complete or infer novice fun/difficulty. Unrelated companion/rig changes remain untouched. Deployment confirmation follows.
