# Requirements continuity workflow

## Required at the start of every task

Read ../REQUIREMENTS_REGISTER.md and DECISION_LOG.md before planning or editing gameplay. For lore work also read ../STORY_CANON.md and the relevant original source messages, especially U079. Older plans are references only where consistent. Never rely on an assistant summary as the only authority.

## Capture each new decision before dependent implementation

1. Preserve the user's exact message in a new dated source file (or append to the current unsealed source file). Include a stable message ID, original timestamp if available, session identity and source location. Do not rewrite typos in the original. Distinguish user text from injected context and assistant proposals.
2. Add an append-only decision-log entry: source ID, affected requirement IDs, approved wording, status, what it replaces, unresolved questions. Preserve superseded decisions rather than erasing their history.
3. Update the living register. Mark proposals as proposals. A question, 'maybe', or creative suggestion does not automatically approve a specific implementation. A later explicit instruction can supersede earlier authority.
4. Before editing code, list affected IDs and acceptance checks. After work, attach revision/test evidence and mark each row verified, partial or blocked. Do not equate a written design with shipped code.
5. Before compaction, handoff or end of a work session: persist new sources, decisions, unfinished work, current branch and verification state. Commit documentation changes separately from unrelated gameplay work.

## Archive and backup

The baseline has three layers:
- docs/requirements/USER_SOURCE_2026-09-19.md: frozen verbatim user-message text in this repository, including the complete master brief.
- docs/REQUIREMENTS_REGISTER.md: reconciled implementation requirements and unresolved details.
- Local decision-archive/2026-09-19 beside the working project: raw session snapshot, all 99 user-role records including injected context, extracted text, SHA-256 manifest. Raw session/tool history is private and is not published in the game or committed to the repository.

Use scripts/archive_decisions.py to take a fresh immutable snapshot of an available session into a PRIVATE directory outside the repository. It records only the bytes actually available at the time, does not rewrite the original, validates source references and emits a manifest. Snapshots do not automatically capture later messages. Run again at the next handoff or checkpoint. Do not upload full raw sessions to a public repo.

Git version history protects the register and extracted user source. Push the documentation commit to the configured remote for a second copy. A private off-device backup of raw archives is recommended; no such backup should be claimed unless verified. No workflow can promise immunity from disk/account loss or recover messages absent from accessible records.

## Coverage audit

Every original user request must be mapped to requirements, classified as continuation/approval/question/context, or explicitly flagged unresolved. The complete source remains available even when a request is summarized. Before claiming reconciliation, search for every rejected name and later correction, and verify old drafts are clearly superseded. Keep original story brief intact rather than replacing it with a shortened retelling.

## Current implementation status

September 19 baseline: documentation reconciliation only. Historical gameplay completion claims must be rechecked before setting VERIFIED. No new campaign, ship, class, weapon or save behavior is implied by these files.

## Handoff — September 20 implementation and music planning

Repo work/bladefall-queue, branch codex/approved-queue-20260917. Equipment release bd1b29f pushed HEAD:main; production confirmed 1.982.0-equipment-foundations, Cloudflare deployment caa231fd. U115 rejects screenshot weapon holding and requests every class recolor. Corrections remain UNCOMMITTED in public/3d/index.html (candidate 1.983) and hero3d.js. Do not claim released. Body palettes apply by default, 16 class checks passed, same-body changes and mirror stale weapon fixed, peer palette isolation checked, Pirate pair rebuilt at palm-local origins. Metrics idle/run/shoot/saber/moving saber stay within 1 game unit of parent grip. Actual motion visual QA still needed; fixed screenshot alone isn't final signoff. Offhand mirroring and network signature/saber state added. Latest relightWeapon metalness adjustment syntax checked but full visual pass pending. Scripts tmp/qa-class-palettes.cjs and qa-grips.cjs, screenshots output/playwright; local server port4331. Existing story drafts untracked and unrelated; do not sweep into commits. UPDATE_ROADMAP invalid historic encoding: append bytes only.

User steered to music placement U116–U117. Music docs are proposals; supplied 21 tracks only inventoried, not auditioned/copied/deployed. Preserve original desktop files. Return to weapon/palette QA/deployment, then completed-half checkpoint foundation, then dialogue/world/co-op systems and campaign sequence. Save investigation: autosaveRun resumes live provisional state, bankNow only escrows five fields, nextArea never banks halves, showDeathScreen returns to hub. Replace with explicit half snapshot/rollback semantics before new quests/shards depend on it. Secondary mode/permadeath and co-op contracts need deliberate integration tests. No checkpoint code implemented yet.

## Handoff — September 20 class visuals and checkpoint foundation

d60f15b (1.983.0) pushed to main and confirmed live in browser. All 16 class palettes and Pirate palm-local grip/off-hand motion corrected; gallery /3d/art-previews/classes/. Full all-weapon/skin combinations still open. Candidate 1.984.0 now implements completed-half checkpoint persistence and retry: see IMPLEMENTATION_CHECKPOINTS_2026-09-20.md and three committed local QA scripts. Both halves/boss of all eight current regions tested; co-op messages tested using two isolated browser contexts, not live WebRTC. Older untracked story drafts remain unrelated. Music docs preserved; no audio integration yet. Main next foundation: canonical story replacement, data-driven NPC dialogue/quest/journal with stable voice IDs and shared events; add five-shard persistence fields to checkpoint state before the shard feature ships. Then full Briar slice, remaining campaign regions/unique bosses. Do not report the overall overhaul complete.

## Production verification — September 20

c9e1fe3 pushed to main. Cloudflare Pages check succeeded (deployment f7da7374-5336-4bd9-9457-79a2f804cf6e). Production browser confirmed 1.984.0-campaign-checkpoints, checkpoint API loaded, 3D renderer ready with no renderer error. Class gallery loaded at phone width (390px), 17 images, no horizontal overflow. Separate immutable private session archive decision-archive/2026-09-20-checkpoints contains 119 user-role messages, zero unparsed lines and valid source references.


## September 20 — visual correction 1.985

VISUAL-REVIEW-02/03 captured verbatim. Paladin pale gold/ivory; Pirate backward barrel and finger-axis saber corrected, palm centers based on skinned hand geometry. Forward aim uses arm IK; procedural arm transforms restored before next mixer sample to prevent accumulation. Seven browser pose checks passed (scripts/qa-pirate-palm-grips.cjs), multi-angle and firing/saber screenshots reviewed. Bounding-box containment is a regression check, not proof of every surface/animation. Full all-body/all-weapon grip audit remains OPEN; preserve existing hand-adjusted fits. Next main foundation remains canonical NPC dialogue/quest/journal and Briar Thomas/Mara slice. No other campaign overhaul claimed complete.


## September 20 - anatomical grips, candidate 1.986

VISUAL-REVIEW-04/05 implemented in weapon-grips.js with explicit asset handles and closed-fist palm positions, two-bone arm solving, support contact, javelin thrust/release, bow draw/string motion. Sampled 64 runtime asset/body fits (448 poses), all 16 classes (112 hand checks), 84 bow checks after dynamic string addition, and actual javelin throws across Ranger/Ninja/Pirate. Peer packet roundtrip and rendered peer support/release checked; not a live WebRTC session. Phone gallery /3d/art-previews/weapons/ has 64 fits plus 3 javelin pose sheets. No claim of every animation frame or all campaign completion. Next work: canonical NPC dialogue/quest/journal foundation and Thomas/Mara Briar slice. Untracked story drafts remain unrelated. See docs/IMPLEMENTATION_WEAPON_GRIPS_2026-09-20.md for release evidence.
