# Storm Coast implementation — ship crossing foundation

## Grounded plan

U168 continues the approved campaign expansion. The current main build is 2.014;
slot 5 still contains legacy Abyss terrain. The approved replacement is Shipwreck
Shore, Thunder Cliffs and the chained hydra. Do not present that replacement as
complete until its routes, encounters and checkpoint boundaries are connected.

The existing story authority validates distance, revision and actor identity;
campaign checkpoints already roll back the current half. Ordinary moving platforms
do not carry enemies, projectiles or remote players together. Moving an entire deck
through that system would risk the same frozen/unreachable combat problems recently
fixed. Implement a stable local deck with sea obstacles moving past it. Keep normal
combat coordinates during boarding and expose a small host-owned voyage state.

Build and test the voyage state machine independently before connecting the shore:

1. Forgiving buoy/wreck steering, with visible obstacle positions and shared collision
   geometry. Clamp helm input and step time; one hit per obstacle, no repeated damage
   from lingering contact. Coast scenery must not dictate damage.
2. Broad safe boarding lane. Progress cannot depend on guest-reported kills. Integration
   supplies the live deck-enemy count; ordinary weapons remain the combat system.
3. Sheltered repair and ready stop. Swap helm between connected living players. One
   repair per crossing; disconnects cannot strand the helm or a ready vote.
4. A second steering leg and boarding section give each co-op player both roles, then
   storm approach and landing. Solo uses the same alternating demands.
5. Explicit landing event is the only integration hook for advancing/banking half one.
   Failure never grants arrival. Pausing stops the whole simulation. No crossing save
   or permanent voyage checkpoint. Snapshot application never replays rewards.

Provide a browser preview of the boat, water, steering and warning geometry. Mark
combat preview controls as simulation controls; do not claim ordinary combat or
network integration from this isolated preview. Reuse the local Three runtime, avoid
new libraries and keep the geometry budget measurable. No existing takes or saves
are edited by the preview.

Next integration: authored shore routes/repair items, Otto/Rose story transactions,
both first-half shards, code chest, normal combat adapter, actual multiplayer packets,
then Thunder Cliffs/hydra. Only switch the campaign region/music once the replacement
is coherent. Existing approved story and loot decisions remain unchanged.


## [Codex | 2026-09-22] Storm Coast crossing foundation — 2.014.1

U168 continues the approved campaign queue. Built a host-owned voyage state machine and reusable low-poly longboat asset, plus an isolated browser preview at /3d/ship-preview/. Course alternates steering, two normal-combat handoff states, a sheltered one-use repair/role-swap stop and landing. It includes stale-input expiry, host-only wave completion, no client-supplied kills/arrival, pause, disconnect/dead-crew handling, deterministic obstacle placement and a long-hull collision capsule. Landing is emitted once; this module itself writes no saves or rewards. Static meshes are batched. Three new preview images are linked from the campaign gallery.

Validation: 80 seeded courses cleared without damage by a steering controller; collision dedupe, failure/arrival exclusion, wave gates, repair cap, solo/role swap, disconnects, pause, fixed-step determinism and stale snapshot rejection pass. Real Chromium browser: actual keyboard and pointer steering, pause/resume, two-player-role simulation, both ready buttons, repair button, 390px layout, no JavaScript errors and unchanged localStorage. Reviewed desktop/phone boat views and corrected phone framing. A pre-change 2.014 save retained gold/class/checkpoint clue without a replayed journal notice. This is not real network QA or normal-weapon deck-combat QA. Recorded preview views use roughly 2.8–4.2k triangles; device performance is not established.

IMPORTANT: this is an isolated development preview, not the completed Storm Coast replacement. Main campaign slot 5 still uses its legacy level. No shore quests, NPC voice lines, shards, hydra or normal combat were claimed as integrated. Next: build Shipwreck Shore routes, Otto/Rose quests and puzzles, connect the crossing to actual game combat/co-op/checkpoint systems, then Thunder Cliffs and hydra. Existing 206 Voice Studio lines/takes remain unchanged. Full queue remains open.

Private archive ../../decision-archive/2026-09-22-storm-crossing has 168 user messages, zero unparsed lines and valid source references. Implementation plan/evidence: docs/IMPLEMENTATION_STORM_CROSSING_2026-09-22.md.
