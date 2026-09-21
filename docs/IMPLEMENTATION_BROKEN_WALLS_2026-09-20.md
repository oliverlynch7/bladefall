# Broken Walls implementation

Approved authority: Campaign Expansion Plan section 3, current requirements and lore. Inspected loadArea/briar story transactions/host authority/half checkpoints, Lost Canyon shared state, keep-art surface ownership and Voice Studio catalog. Replace only Ruined Keep part one. The Dungeons and The Fallen remain next.

Terrain first: outer wall rescue, raised arrow position, central breach with two fight lanes and protected civilian crossing, battlement wheel versus guard-post key, optional bell tower with recovery shelf, timed workshop gate, Felix return/rare Lockpick dagger/shortcut, and a harder sealed chamber reached through Felix or independently via the old wall. Physical RK-01/RK-02, bank only at half boundary.

Host owns timed defense and chamber waves. Dialogue freezes world time. Thirty-second defense stays in the breach; retreat resets only the local encounter after a clear grace period. No fragile escort health. Completion requires clearing remaining attackers. Finite waves; shared enemy state; guests cannot forge completion events. All optional branches remain independent of the main exit. Stage geometry uses existing fortress palette/kit with unique landmarks and valid collision; avoid overlapping height surfaces. Stable Grant/Felix VO lines only after routes are concrete.

Validate solo paths, timed gate, shared dialogue/defense pause, reset, duplicate rewards, physical versus shared loot, half checkpoints, phones and renderer screenshots. Publish one coherent batch, preserve legacy class access pending all five Reaper shards.

## Implemented and verified

Release 2.005.0-broken-walls replaces only Ruined Keep part one. Ten named exploration/fight spaces plus a high lookout, two breach lanes, eastern battlements, workshop timing latch, western tower climb with a lower recovery court, independent old-wall chamber route, three limited healing pads and two physical Reaper shards. Grant's rescue leads into a host-owned 30-second defense, three finite waves (seven attackers), then clearing survivors. Four seconds away resets that encounter safely; no escort health or permanent civilian death. The dungeon gate accepts either the lower guard key or upper wheel. Felix's tool return gives each present player one rare Lockpick dagger and opens the shortcut; neither Felix nor his reward is required for the main quest or chamber. The chamber warns before four guards wake and releases RK-02 only after victory.

Ten new stable Grant/Felix recording lines, 129 catalog lines total. Context and acting direction included. Conversations use the existing shared pause/owner choices/leave-resume system. Journal notes record the main and optional routes. No new lore about Bladeborn identity, the King's location, or the final restoration is revealed.

Rendering reuses the fortress kit with battlement caps, standards, ruined towers, workshop framing, camp supplies and chamber stands. New overlapping walkable surfaces claim disjoint footprints from highest to lowest, reducing fighting surfaces. Camera-blocking terrain cuts away without changing collision. The measured traversal snapshot had 383,136 total kit triangles, 51,024 visible triangles and 42 visible kit draw calls; this is one viewpoint, not a worst-case performance benchmark. Five browser screenshots are in the campaign preview gallery.

Verification:
- Actual browser/controller: 264 route samples, no failed samples; 16 quest/runtime checks including guarded interactions, retreat, dialogue pause, finite waves, upper gate route, timing window, reward and shard gating.
- Controlled two-context co-op: 12 checks, including matching dialogue, ownership/exit, shared completion, once-only equipment, personal physical shards and rejection of forged internal completion events. Uses the real packet handlers with a controlled relay, not an end-to-end WebRTC network test.
- Five Broken Walls checkpoint checks: reload rollback, death rollback, half boundary bank, second-half death retention, once-only gold echo. All 11 existing campaign/legacy checkpoint checks also pass.
- Story/authority/shard/Voice API suites pass. New content test covers ten graph nodes, independent chamber route, main key route without Felix, idempotency, host-only spawns and no repeated retreat notices.
- Grant desktop and Felix 390px dialogue screenshots reviewed; no horizontal overflow. Terrain/quest traversal freezes enemies and uses invulnerability where needed, so these results do not claim combat difficulty is balanced. No production saves or voice recordings modified by QA.

Next: The Dungeons, Walter/Sly, lift puzzle, remaining three Reaper shards and The Fallen's indoor duel. Legacy trial access remains until the full five-shard Keep route is complete. This release does not mark the whole region, global cosmetic queue, or wider campaign complete.
