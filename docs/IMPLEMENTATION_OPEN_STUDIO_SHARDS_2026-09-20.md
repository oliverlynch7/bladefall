# Open Voice Studio and shard progression — 2026-09-20

User explicitly requests removing password protection for now. Supersedes earlier private-owner access requirement: catalog, drafts, take playback, uploads, wording edits and approvals will work without a key. Keep same-origin write checks, input limits, immutable takes, version conflict handling and exact-wording approval. Remove sign-in UI and stale privacy claims; do not expose stored secrets or make the storage bucket itself public.

Then build the five-shard progression foundation against current checkpoint code: validated stable region/slot IDs, individual physical collection and shared authored reward receipts, pending versus banked state, duplicate handling and rollback. Inspect save and transition integration before changing live unlock behavior. Existing single-secret routes must remain functional until all five placements and Hall unlocks replace them together. Broader campaign scope remains open.


## [Codex | 2026-09-20] Open studio and shard save foundation — 1.992

Voice Studio no longer requires a password, including catalog, drafts, upload, playback, edits and approvals. Exact-wording approval, immutable takes, backups, offline recovery, origin checks and conflict checks remain. Tested fresh-cookie browser access and all 42 lines. No production recordings modified by QA.

RIFT-01/03 and SAVE checkpoint work continued: stable five-slot IDs for eight approved regions, local pending collection, permanent half-completion banking, once-per-attempt 120-gold echoes (existing secret reward value), normalization and correct class mapping. New meta field is save-local and captured in existing checkpoints; pending IDs never autosave. Shared Gus reward now has a supported personal receipt path; unknown reward kinds are not marked claimed. This is groundwork, NOT completed placements/Hall: Gus remains rehearsal-only, no five-shard world placements enabled, existing one-secret portals retained until replacement routes are complete.

Validation: Node ledger, Gus branches and open Voice API tests passed. Browser studio passed 14 checks with generated local audio; shard checkpoint QA passed nine runtime checks; existing campaign checkpoint QA passed 11 checks including old save compatibility and trial class restoration. No real WebRTC session or physical microphone claimed. Next: complete Briar five-shard routes, live Gus workshop and Rift Hall, then Black Woods quests/boss and remaining campaign backlog.
