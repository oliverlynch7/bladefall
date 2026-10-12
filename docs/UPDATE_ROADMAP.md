## [Codex | 2026-10-06] 2.121.0-hub-upgrades

Rebuilt the four purchased Waystation decorations for Lantern Court: crowned fire bowls replace the old lamp props; tall cloth heraldic banners line the edges; restored north battlements rise above the existing wall; gilding changes the crystal and adds a luminous crown and fittings. Shared placement data supplies purchase-time and reload collision fixtures. The old brazier lamp at (270,395), which intersected the west chess chair, is removed. Prices and ownership IDs are unchanged.

Validation: real browser purchased all five shop upgrades (including existing chess), deducted 26,500 gold correctly, retained ownership/gold/eight decoration colliders after reload, and reported no page exceptions. All existing shop/portal approach points remained clear of the new fixtures; west chess seating is clear. Reviewed before/after and chess-area screenshots. Previous-version save preserved name, gold, choices and all 17 classes. Syntax gate passes; 69 pre-existing duplicate names remain. Main campaign and beta terrain are unchanged by this release. Wider beta district rebuild remains pending.

## [Codex | 2026-10-10] Snowbound buried-camp ridge

Version 2.149.0 replaces the live Snowbound camp's 1-3-2 marker puzzle with seven actual parkour landings and a high survey release. The same Winter Cloak chest and FF-02 shard remain, with a visible snow cover change. The notebook and Heath now point to the ridge, while the main route is unchanged. A spent release prompt is hidden and a saved old marker clue is updated on load. Browser QA traversed the ledges, recovered from a miss, claimed the rewards, and passed full route, co-op, checkpoint and old-save checks. The feel and final art still need Oliver's playtest. See docs/design/SNOWBOUND_CAMP_RIDGE_2026-10-10.md.

## [Codex | 2026-10-10] Palace Courtyard route choice

Shipped in v2.159.0: either balcony opens the mirror terrace, with upper combat and lower garden approaches on both sides. The other balcony is optional, and old saves migrate without changing reward identity. Courtyard fall-back sun glare was reduced. Browser route, co-op and checkpoint QA passed; full human playtesting remains. See docs/design/PALACE_COURTYARD_ROUTE_CHOICE_2026-10-10.md.

## [Codex | 2026-10-11] Broken Walls supply hoist, v2.171.0

The optional Quartermaster food request now uses four collision-backed service ledges to reach an upper brake. Releasing it visibly raises the counterweight and lowers the food basket for collection below; the tracker follows that change. A failed jump returns to the chamber floor. The old opened flag, reward and accepted/ready/done states remain, with immediate saving on collection. Old partial weight values do not solve the new route; completed and ready revisits show an empty, lowered hoist. Muted browser QA passed the full physical climb with miss/retry, normal prompts, once-only food, legacy-shaped partial/completed save reloads, two-page co-op and the 228-waypoint Broken Walls route including the separate shard trial. Static, dialogue and story tests passed. Human playtesting remains for feel and final visuals. See docs/design/RUINED_KEEP_SUPPLY_HOIST_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Ruined Keep dungeon lift winch, v2.172.0

The required three-weight lift input is now a walkable winch on the lift deck. Its handle, counterweight and progress lights show the platform and prisoners rising together; releasing or falling lowers the lift for retry, and a full turn retains the existing completion and late-rider cycle. The quest tracker, Walter and journal explain the action. Old complete and partial saves, optional branches, all dungeon shards, checkpoint retry, host/guest operation, guest disconnect and full campaign route passed muted browser regression. Transient dialogue-file fetches now retry before disabling the shared story book. A normal-camera visual pass was completed; human playtest remains for feel and final presentation. See docs/design/RUINED_KEEP_LIFT_WINCH_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Castle Gates broken drain crossing, v2.175.0

The repeated two-catch bridge step is now an offset stone crossing to one brake, a visible return walkway and a lowerable, walkable bridge. The direct far-bank shortcut is gone. Old bridge and catch flags remain safe; quiet infiltration, three-wave assault and rewards are unchanged. Muted browser tests passed actual jumps, missed-jump recovery, E interactions, bridge traversal, full route, checkpoint, combat, legacy states and two-client co-op, plus visual inspection. Human difficulty and art playtest remains. See docs/design/CASTLE_GATES_DRAIN_CROSSING_2026-10-11.md. No custom SFX work.