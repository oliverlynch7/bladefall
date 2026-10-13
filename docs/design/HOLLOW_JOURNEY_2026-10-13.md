# Hollow Pass journey finishing pass — 13 October 2026

## Latest authorization

> Ok what’s next? Keep working

Continues the approved campaign-finishing pass (U-GEO-20261012), after the completed HUD, class wardrobe and tutorial priorities. Winding Cliffs is the next bounded implementation. Lost Canyon and later campaign stages remain queued. This does not assert completion of the full campaign.

## Inspected baseline

Source af0b92d4, v2.192.0. Current map bounds remain [-2240,2250,-5000,650]. The geography pass already supplied broad canyon ground but the main trade-road centerline is scarcely visible. Several decorative blocks intersect the near-bank approach. The detailed winch asset sits on the left, while the functioning interaction is on the right. Bridge collision is granted immediately, before its 1.5-second animation ends. The objective points at the blocked lift even while its guards are alive. Orders read before speaking with Caleb do not advance the trail.

## Intended implementation

- Preserve the map size, authored route elevations, optional cargo-bracket climb, rope recovery, ridge shard, windbreak, enemies, rewards and story. Paint a joined worn sandstone/sand freight road along the actual ground-level approach and lookout routes, with narrower optional ground paths. Never paint across the locked ravine or across a raised shelf. Place double-sided direction boards outside walking lanes at the refuge, split, wagon, bridge and far-bank fork. Label destinations, not secrets.
- Clear the loose decorative blocks from the bridge approach and reuse existing detailed canyon/wagon/hoist models. Put the detailed winch exactly at its working handle. Match bridge collision to the animation; an old completed bridge loads fully open, a new one becomes walkable only when settled. Shared state continues through existing host story events; do not grant rewards twice.
- Orders found early should remain useful: reading them begins the transport trail, with concise directions. Keep Caleb available for the people/story context. Show bridge/guard/lift objectives that match the actual state and direct navigation to remaining guards while preserving the quiet alternate route. Clear obsolete transient notices while keeping journal clues.
- Update the visual blueprint before layout edits, then refresh it from actual generated geometry. Do not extend new floors, change combat balance, shrink the level or add another combination puzzle.

## Verification and failure cases

Inspect normal-camera road and bridge views; perform the main route and optional climb with real collision/input; deliberately try the winch early, test the moving bridge and a missed optional jump; confirm no road covers the ravine. Check the freight interaction before/after completion, saved partially/completely opened bridges, repeated sync and host/guest story packet behavior. Use a real pre-change save with retained character/class XP, gold and flags. Run syntax and relevant story/navigation/unit checks. Record automated versus visually observed versus human-playtested evidence separately. No custom SFX and no unrelated companion edits.


## Additional renderer finding during inspection

Several scenery modules import different cache-key copies of campaign-craft-scene.js. Its global has-model API was published at module evaluation, so an idle copy could hide the active registry and allow primitive fallback geometry to draw over the detailed models. Publish that API when a scene is actually attached, from its owning module. Verify the bridge/winch ownership and representative Briar/other-region scenes before delivery.


## [Codex | 2026-10-13] Winding Cliffs finishing pass — v2.193.0

Implemented the next campaign pass after Briar. Winding Cliffs keeps its 4,490 × 5,650 map bounds, original elevations, cargo climb, ridge/rope route, encounters and rewards. Added a joined worn freight road and five destination signs; reused the detailed wagon model, removed loose bridge-approach blocks and moved a supply crate out of the route between controls. The detailed winch is at its functional handle. A newly lowered bridge gains collision when its animation settles; previously completed saves restore it immediately.

Early-found transport orders now start the trail. The tracker reports remaining lookout guards and then the available lift; navigation points at the required guards while preserving the quiet high-route option. Transient obsolete cart/winch messages clear without removing journal clues. Refreshed the corresponding blueprint from actual initial-state geometry.

Also fixed a shared renderer ownership bug: multiple scenery imports used different cache keys for the crafted-model module, so an idle copy could overwrite the active has-model API and cause primitive fallback geometry to draw over detailed models. The active scene now publishes its own registry. Verified ownership in all eight campaign entry regions.

Checks: main route plus 91 optional-route waypoints using actual movement/collision; a rendered continuous bridge mistake/recovery/crossing sequence; ten host/guest assertions using the real handlers over a local relay; pre-change partial/complete bridge saves with character/class XP and gold retained; story, bridge timing, navigation and syntax checks. Evidence and limitations: docs/art-validation/hollow-journey-2026-10-13/summary.json. Enemies were stunned during route verification; no full combat playthrough, public-network session, low-end performance claim or human fun/novice-comprehension verdict.

Next: Lost Canyon and the remaining campaign finishing sequence. No custom SFX or unrelated companion changes. Deployment confirmation follows.
