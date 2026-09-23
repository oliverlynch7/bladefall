# Party class trials — grounded implementation plan

Baseline f93bf21 / 2.025. MP-01/02/04 and RIFT-05/06 authorize coherent multiplayer and personal unlocks. Current Hall explicitly blocks parties; trial scene identity is missing from placement packets, mentor story packets exclude trials, and local completion can unlock without shared proof. Equipment escrow already exists and must remain local.

Implement shared entry for existing earned trials only. Require each connected participant to have personally opened that class frame (or already learned the class), remain in the Hall and be alive. Guests may request entry from their frame; host owns transition. Advertise saved access in presence, recheck locally before loading. Late joiners must be eligible; otherwise remain outside the party with their save unchanged. Starter tutorials remain solo.

Separate trial session identity from campaign zone. Synchronize seed, kill count, mentor state/position and completion. Only host resolves exit after enough kills and mentor teaching; repeating messages cannot grant twice. A final completion receipt travels with the following hub packet to handle a lost completion packet. Abandonment or disconnect restores personal escrow; no shared gear inventory. Do not change trial encounter designs, Pyromancer kit, mount behavior or recorded dialogue in this batch.

Browser verification: eligible/ineligible entry, guest request, shared mentor pause/owner choices, guest attacks, host kill progress, duplicate/stale messages, completion, missed final packet, equipment preservation and disconnect. Solo trials and campaign/hub co-op regressions, pre-change save, phone status UI. Controlled handler relay is not an internet WebRTC soak test.


## [Codex | 2026-09-23] Party trials — 2.026
Implemented shared entry and completion for the seven existing earned class trials. Every participant requires personal Rift access and must gather in the Hall. Guest requests are host-validated; mentor dialogue, enemy progress and teaching sync under a dedicated session identity. Existing party HP scaling applies. Local equipment escrow, duplicate/stale message protection, completion receipts, abandonment, disconnect and existing hardcore wipe semantics are preserved. Starter tutorials remain solo.

Evidence: 34 two-context multiplayer handler checks, seven solo mentor/reward/loadout checks, nine Hall co-op checks, eleven return-adventure co-op checks, hardcore exit, pre-change save preservation, story/Rift/authority/Voice API tests and inline syntax passed. Three staged browser previews; gallery191. Voice Studio remains359 lines; no recorded text changed. Controlled relay is not an internet WebRTC soak test or combat balance certification. Trial arenas, Pyromancer kit, mounts/flight and remaining equipment/cape/trail audit remain open. Exact U181 archived with181 messages,zero parse errors and valid source references.
