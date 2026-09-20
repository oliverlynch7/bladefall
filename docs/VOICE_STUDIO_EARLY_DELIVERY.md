# Early Voice Studio delivery

Priority updated September 20, 2026. Source: VO-PRIORITY-01. This is an implementation work order, not a shipped feature.

## Outcome

Oliver can open the private studio on phone or desktop, select a character and scene, edit a line, record/listen/retake, and approve an official take without Codex running or consuming Codex usage. His wife uses his account/setup. No AI generation is needed for ordinary human recording, editing or review. Hosting/storage are separate infrastructure, not Codex sessions.

## Revised order

1. **One script source.** Extend existing stable dialogue IDs with speaker, scene order, context, performance notes, text revision and draft/recording-ready status. The game and studio must consume the same authored lines. Player options give context but are not mandatory voiced lines. Validate quest branches and canon before labeling a scene recording-ready.
2. **Private recording workflow.** Establish Oliver-only authentication and durable recording storage, then deliver record, stop, playback, retake, edit text and Approve & use. Save successful takes immediately; preserve earlier takes until explicitly discarded. Clearly show saving, saved and failed states. Do not claim a browser-only cache is a cross-device backup.
3. **Recovery and portability.** Retain original recordings and exact text revision. Provide downloadable backup/export with line IDs, scene metadata and take references; verify recovery on another device. Pending uploads must survive an interrupted session where the browser permits local storage. Do not silently discard audio when upload fails or quota is exhausted.
4. **First useful script batches.** Thomas/Mara opening scenes, then stable hub service introductions, then each campaign region. Keep unfinished scenes visible as drafts but out of the default ready-to-record queue. Do not require the entire campaign to be written before Oliver can start recording. Do not force rerecording because an unrelated level layout changes.
5. **Game playback integration.** Approved take + matching text revision feeds subtitles and NPC speaking animation. Changed text flags the old take for review; do not silently erase the recording or present mismatched audio as current. Missing lines use the approved optional device speech/silence behavior. Fetch only relevant scene audio. Private drafts and rejected takes must never be publicly exposed. Approved game audio is intentionally published as game content.
6. **Continue NPC/world/co-op work and campaign rollout.** Bind the same dialogue graph to actual NPCs, camera, shared pause/choice/world state and quest consequences. Continue authoring voice batches as levels stabilize. Do not pause campaign work awaiting completed human recordings.

## First usable studio acceptance

- Oliver-only access verified; unauthenticated and other-account requests cannot read/write recordings or drafts.
- Record a real microphone take on supported desktop and phone browsers; denied permission/device changes handled clearly.
- Playback and retake; approval chooses the exact take heard, not a previous or still-saving one.
- Edit text, retain old takes, identify stale approved audio and preserve revision history.
- Refresh/close and reopen without losing confirmed saved audio or approvals.
- Open on a second device and recover the same saved take and script edit.
- Export and restore backup; verify audio bytes and line mapping.
- Prompt context and performance notes fit phone width and remain readable during recording.
- Distinguish saved/approved/published; approval sets official selection, while failed publication must not appear live.
- No Codex session required for any of these user actions after deployment.

## Infrastructure findings and remaining decisions

The current repository is a static game on Cloudflare Pages with a TURN-credentials Pages Function. No Voice Studio login, durable recording backend, or deployment configuration for private media was found in this audit. Exact auth/storage provider remains unresolved from prior planning; inspect available account capabilities before choosing. Do not publish a supposedly private unprotected page or rely on a hidden URL/password embedded in JavaScript. If external account setup is needed, ask only for the concrete missing identity/setup action while building independent script/UI work.

Do not use the SFX production desk's local progress tracker as recording storage. It tracks generation tasks and contains no audio backup.
