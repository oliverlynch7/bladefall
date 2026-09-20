# Briar live quest integration — September 20, 2026

Grounded scope: replace the first Briar half's legacy survey/nest/Waystone checklist with the already authored Thomas/Mara opening, real garden/store pickups, restored healing station, a short mill repair sequence and departure. Reuse the current large valley terrain as the route foundation; this is not the entire planned region expansion, optional cast, five-shard system or boss overhaul.

Preserve all 12 recording-ready Thomas/Mara line IDs and wording. Reuse the hub camera, subtitles, speech and fitted NPC faces through an external story presentation adapter. Add plain quest directions and journal notes for physical tasks; do not invent extra major canon or advertise unfinished dialogue for recording.

Shared campaign transactions are host-authoritative, bounded to current run/half, validated for proximity and current dialogue owner. Guests request IDs, never effects. Broadcast revisioned snapshots, retry dropped requests, freeze gameplay while a shared conversation is open, and release it if its owner leaves. Rewards apply once per eligible connected player; physical secret shards are not shared by this system. Snapshot world flags and local reward claims at half checkpoints; unfinished-half death/reload still rolls back.

Validation: reducer and authority tests, real browser solo quest/interaction/healing/checkpoint tests, two isolated browser contexts exchanging real game packets for co-op authority and shared presentation, existing hub/voice/checkpoint regressions, screenshots and production verification. Controlled packet tests must not be described as live WebRTC testing.


## Verification and release scope

Candidate 1.990.0-briar-opening. Fourteen solo browser checks passed: physical pickup gating/deduplication, leave/resume, pause, delivery, personal reward receipts, infinite healing, ordered mill repair, bridge collision change, guard-gated departure and both rollback/banked story persistence. Movement QA walked 51 waypoints through the garden, over the rear store window, around the mill, and up to the wagon gate using real movement/collision/jump updates; enemies were stunned to isolate route testing. This is not a balance playtest.

Fourteen controlled co-op browser checks passed, including guest-initiated shared dialogue/camera, owner-only choice, paused combat, shared supplies, individual once-only rewards, late-join visibility without retroactive rewards or banking unfinished progress, shared retry and owner disconnect. These tests exchange real game packets between isolated browser contexts; they are not a live internet/WebRTC session.

Existing regressions: 17 hub dialogue checks, five voice/mouth timing checks, 13 journal/preview checks, 11 checkpoint checks and eight co-op checkpoint/hardcore checks passed. All 24 half/boss checkpoint routes across the eight regions passed. Node reducer, authority and Voice API suites passed. Hub QA reloads pre-change saved state; legacy campaign-save migration is included in checkpoint regression. Material cloning was also fixed: same-body peers retain an actual source Texture rather than a JSON copy, preventing a renderer fallback found during co-op QA.

Screenshots: /3d/art-previews/briar-story/. Stable 12 Thomas/Mara lines and their voice metadata/recording IDs are unchanged; the Studio still has 32 total lines. No fake recordings uploaded. Existing characters, weapon fits and equipment progression preserved.

Remaining: complete Briar optional cast/branch consequences, five individual Rift Shards, broader village art/layout expansion, Black Woods and unique boss; then other planned regions. Other regions still contain legacy story/layout content and must not be described as canon-migrated. Cape/trail overhaul and per-level z-fighting audit remain queued. Existing missing glow-gauntlet icon request observed during old-save hub QA is unrelated and remains open.
