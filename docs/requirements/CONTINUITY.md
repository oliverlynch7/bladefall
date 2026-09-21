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


## Production verification - September 20

50340a3 pushed to main. Cloudflare Pages deployment 476b3758-d7e6-417f-88d7-ba21577223eb succeeded. Production browser confirmed 1.986.0-anatomical-weapon-grips, renderer ready, no renderer error; weapon gallery returns HTTP 200 with Build 1.986. Private decision archive decision-archive/2026-09-20-weapon-grips contains 123 user-role messages, zero unparsed lines and valid source references.


## September 20 — custom SFX planning

User steered main implementation to comprehensive ElevenLabs SFX production inventory (AUDIO-SFX-01). Added docs/audio source inventory, generator script, production guide, full prompts, coverage audit, and static mobile production desk /3d/audio-planning/. 1,296 cue briefs, 128 skill signatures, 30 starter auditions; suggested variations are optional, not a purchase order. No sound generation or gameplay audio changes. Current file loader decodes registry eagerly and RMS-adjusts files; replace that architecture with scoped loading/mixing during integration rather than adding the full bank at boot. Literal playFx keys firewhoosh, loot and shoot are absent from FXDEF in audited snapshot. Existing story work queue remains canonical NPC dialogue/quest/journal and Thomas/Mara Briar slice. Music remains separate and unintegrated. User exact request is preserved in implementation source document.


## [Codex | 2026-09-20] VISUAL-COSMETICS-01 — queued cape, trail and level surface overhaul

New queue item VISUAL-COSMETICS-01: cape/trail cosmetic visual overhaul, convincing cloth motion, character-fit palettes/detail, body-clipping prevention and animation QA. Level redesign acceptance now explicitly includes remaining z-fighting in each half and boss arena. Requirements and exact user wording saved. No gameplay changes this turn; implementation remains OPEN. Continue the canonical NPC dialogue/quest/journal and Thomas/Mara Briar foundation, carrying these visual checks into level work.


## [Codex | 2026-09-20] Story foundation 1.987

SFX email sent through Gmail with three Markdown attachments and production link. Resumed core campaign implementation: public/3d/story-state.js reducer, story/briar-foundation.json and separate story/preview.html; live journal N/HUD button with current objectives, discovered optional tasks, notes and quest items. Route checkpoint stores G.storyState; restore strips stale conversation modal but keeps NPC cursor. Thirteen browser checks, reducer suite and eleven existing checkpoint regressions passed. Detailed evidence/limits in IMPLEMENTATION_STORY_FOUNDATION_2026-09-20.md. Next: actual Briar Thomas/Mara NPCs and landscape, camera/speech, host-authoritative shared conversations/world events and visible pad restoration, then other Briar quests/shards/boss. Do not claim preview buttons are in-world features. Cape/trail and per-level z-fighting requests remain queued. Untracked older docs/story drafts still unrelated.


## [Codex | 2026-09-20] VO-PRIORITY-01 — early independent voice production

New priority VO-PRIORITY-01: user wants to record NPC VO independently between Codex sessions. Next batch is shared dialogue authoring/recording metadata plus minimal private Voice Studio, NOT postponing it until all levels are finished. Inspect/configure authenticated storage before any private recordings are uploaded. Repo has Pages Functions for TURN but no existing private studio/auth/storage implementation found. Refer to docs/VOICE_STUDIO_EARLY_DELIVERY.md. Thomas/Mara first stable scene batch, then hub intros, then campaign cast; in-world NPC/camera/co-op integration remains required and should consume the same lines. No studio URL or recording-ready claim yet. Keep cape/trail and z-fighting backlog intact.


## [Codex | 2026-09-20] Early Voice Studio implementation

Candidate 1.988.0-voice-studio. Studio /3d/voice-studio/, API functions/voice-api/[[path]].js, R2 bladefall-voice-private, wrangler.toml preserves existing Pages settings. Production auth secrets configured via Wrangler; private access file C:/Users/Oliver/Documents/Codex/2026-09-08/o-2/private/bladefall-voice-studio-access.txt (NEVER commit). Local .dev.vars uses unrelated test-only key, ignored. Local Wrangler port4333/session53419 stores only synthetic test recordings. First12 Thomas/Mara lines ready; guide docs/VOICE_STUDIO_USER_GUIDE.md. Next: actual microphone feedback if supplied, more hub/region voice-ready batches, and in-world NPC/camera/mouth/co-op integration. Synthetic browser capture, recovery and second-session storage checks passed; actual phone mic untested. Do not mistake preview voice playback for finished campaign integration.


## [Codex | 2026-09-20] Hub dialogue 1.989

Prior Voice Studio 7264206 deployed and production owner login verified (12 lines, zero test uploads, signout401). Current batch adds story/hub-dialogue.json, hub-dialogue.js/css and server book merge (32total lines). Five existing human service NPCs have in-world camera/subtitles/speech, save-slot intro/cursor persistence, optional victory news and fitted eyes/mouth. Source scripts serve game and Studio. Tests:17 hub browser checks,5 voice/mouth checks,13 studio recording/recovery checks, existing reducer/API suites. Check docs/IMPLEMENTATION_HUB_DIALOGUE_2026-09-20.md. Next: Thomas/Mara in-world Briar placement, supplies/restored healing pad and host-authoritative campaign dialogue; campaign expansion, bosses, shards and visual backlog remain open. Hub service chats intentionally remain personal, not shared campaign choices. Do not equate this hub batch with all-campaign completion.


## Production verification - September 20

42d280c pushed to main; Cloudflare Pages deployment 55261125-5d9d-400d-adc0-4ba55c71872e succeeded. Live browser verified version 1.989.0-hub-conversations, 20 new hub lines, six screenshot images and private catalog rejecting unauthenticated reads (401). All original Thomas/Mara IDs remain intact.


## [Codex | 2026-09-20] Briar opening integration 1.990

Continued approved implementation; no new design decision. MAP-01, DLG-02/06/07/08, MP-01/02/03, SAVE-03/04/05 and VO-PRIORITY-01 are PARTIAL with new live evidence: Thomas/Mara in Homefields; garden/store supplies; unlimited restored healing pad; ordered mill repair and guard-gated departure; shared host-authoritative dialogue/world/rewards and completed-half story/receipt checkpoints. See IMPLEMENTATION_BRIAR_LIVE_2026-09-20.md for exact tests and limits. Existing 32 recording lines remain unchanged. Wider Briar expansion, optional cast, five individual shards, Black Woods/boss and other regions remain OPEN. Next implementation should extend those content branches and recording-ready scripts using this live shared foundation. Private archive decision-archive/2026-09-20-briar-opening stores 130 user-role messages with zero unparsed lines and valid requirement source references. Older untracked draft dialogue files remain unrelated.


## Production verification — September 20

5b9537c gameplay and ffa367e evidence pushed to main. Cloudflare Pages deployment a208c4ef-3610-49bf-be77-f49e6b6306af succeeded. Production browser confirmed 1.990.0-briar-opening, story authority loaded, 12 unchanged Briar dialogue lines and eight world events, private catalog rejects unauthenticated reads (401), and all four gallery screenshots load at 390px without horizontal overflow. Production save state was not modified for quest testing. First production check reached the preceding deployment while the build was in progress; refreshed after confirmed success and passed.


## [Codex | 2026-09-20] Gus recording-ready optional quest

Continued approved DLG-03/04 and VO-PRIORITY-01: ten new stable Gus lines in the private Voice Studio (42 total), with performance notes. Separate rehearsal supports tool delivery, once-only BR-02 reward/shortcut, insult, sign-repair apology, final refusal, leave/resume and retry. No new user design decisions. All original Thomas/Mara/hub lines unchanged. Gus remains rehearsal-only: live placement, physical five-shard collection/banking and Rift Hall integration remain OPEN, alongside Black Woods, remaining regions/bosses and the broader requirements register. See IMPLEMENTATION_GUS_VOICE_2026-09-20.md.

## Production verification — Gus recording batch

f148585 deployed successfully through Cloudflare Pages (4d1e497c-f6ab-4150-9405-1bd614fb4e5e). Private decision archive 2026-09-20-gus-voice contains 132 user-role messages, zero unparsed lines and valid requirement source references. The initial production check reached the old deployment while the build was still running; verify again after success. Live Gus placement remains intentionally pending the five-shard integration.
After deployment success, the production browser confirmed all ten Gus lines, the rehearsal-only notice and unauthenticated catalog rejection (401).


## [Codex | 2026-09-20] Explicit access change

User: “You can remove the password protection for the voice studio for now. No need. And then continue building”. Supersedes the earlier owner-only Voice Studio requirement for now. Studio reads, edits, recordings and approvals are available without login. Keep take preservation, version checks and same-origin write protections. No secrets are published.


## [Codex | 2026-09-20] Open studio and shard save foundation — 1.992

Voice Studio no longer requires a password, including catalog, drafts, upload, playback, edits and approvals. Exact-wording approval, immutable takes, backups, offline recovery, origin checks and conflict checks remain. Tested fresh-cookie browser access and all 42 lines. No production recordings modified by QA.

RIFT-01/03 and SAVE checkpoint work continued: stable five-slot IDs for eight approved regions, local pending collection, permanent half-completion banking, once-per-attempt 120-gold echoes (existing secret reward value), normalization and correct class mapping. New meta field is save-local and captured in existing checkpoints; pending IDs never autosave. Shared Gus reward now has a supported personal receipt path; unknown reward kinds are not marked claimed. This is groundwork, NOT completed placements/Hall: Gus remains rehearsal-only, no five-shard world placements enabled, existing one-secret portals retained until replacement routes are complete.

Validation: Node ledger, Gus branches and open Voice API tests passed. Browser studio passed 14 checks with generated local audio; shard checkpoint QA passed nine runtime checks; existing campaign checkpoint QA passed 11 checks including old save compatibility and trial class restoration. No real WebRTC session or physical microphone claimed. Next: complete Briar five-shard routes, live Gus workshop and Rift Hall, then Black Woods quests/boss and remaining campaign backlog.

## [Codex | 2026-09-20] Open studio production confirmation

703348c deployed successfully (Cloudflare 1c266a64-9d4e-493c-a806-061125ca563e). Production browser with all cookies cleared opened the editor immediately: zero password fields, 42 lines, “Select a line to begin.” No production writes/audio uploads performed. Private archive decision-archive/2026-09-20-open-studio preserves 133 user-role messages, zero unparsed lines, valid source references. Next live content remains Briar shard placements/workshop and Rift Hall; ledger is integrated but placements are not enabled.


## [Codex | 2026-09-20] Homefields exploration first iteration — 1.993

Implemented four connected landscape additions (West Farm Valley, Orchard Lookout, East Pastures, Bell Tower Ridge), orchard/ridge climbs, return loops, modest farm/tower geometry, six wing enemies in two groups, one limited healing pad, orchard chest, and a fixed optional bell sequence with environmental clue/journal, visible progress, reset feedback and once-only shared gold reward. Existing core remains for this iteration; latest user permits full replacement in future. No claim of five-times size or finished Homefields/campaign. Gus and five shard placements/Hall remain pending. No new NPC voice lines were finalized against this provisional geography.

Verification: Node story/Gus/authority/voice API and new puzzle tests pass. Real browser traversal covers 33 new route/climb/return waypoints; existing 51-point main traversal and 14 opening/save checks passed during this turn. Puzzle runtime confirmed clue, solved state, personal reward receipt and duplicate rejection. Movement QA stuns enemies, so combat balance is NOT verified; network authority unit tests are not a live WebRTC playtest. Initial return test walked into the underside of the orchard plateau; corrected route goes around its east edge. Initial clearance touched store collisions; narrowed cleanup to preserve the village core and reran opening tests. Screenshot: /3d/art-previews/briar-story/homefields-tower.png. More landscape detail, encounter design, central town reconstruction, additional puzzles and secrets remain OPEN.


## [Codex | 2026-09-20] Village reconstruction and granary — 1.994

Continued approved landscape-first MAP-01/GOV-02 work. Replaced central village scenery with four detailed timber homes, shared yard, household details and open routes. Added an enterable eastern granary with loft climb/chest, a separate locked rear store room and return route to eastern fields. New optional hanging-weight puzzle (1/2/4, target 5) has discoverable journal clue, numbered weights, visible total, reversible mistakes, latched door collision removal and once-only shared gold reward. No new spoken lines; all 42 recording lines unchanged. Five-shard placements, live Gus, Rift Hall, Black Woods/boss and rest of campaign remain OPEN. This is another playable iteration, not the completed region/art pass.

Validation: new reducer puzzle tests, existing story/bell/Gus/authority/voice API tests passed. Browser granary QA passed 17 movement waypoints plus closed-door block, correct opening, once-only reward; 33 exploration and 51 main-route waypoints passed. Controlled two-context co-op QA passed 17 checks including shared wrong total, door collision and rewards; not a real WebRTC session. Browser save checks confirmed provisional rewards do not autosave, reload recloses unfinished puzzle, completing half banks gate/reward receipts. Existing opening/save QA passed 14 checks. Initial loft landing gap and missing annex/eastern ground strips fixed before passing movement tests. Movement tests stun enemies; combat balance and device performance remain unverified. Screenshot gallery updated with village/granary images; earlier dialogue images retain old build labels.

## [Codex | 2026-09-20] Granary production verification

0807e1d deployed successfully through Cloudflare Pages (57433283-6d50-4f2c-aa5b-1bc70ed22fc6). Production browser verified 1.994, the new authored weight event, and all seven gallery images loading without horizontal overflow at 390px. No production gameplay save was edited for QA. Private archive 2026-09-20-homefields-granary retains 138 user-role messages, zero unparsed lines, valid source references.


## [Codex | 2026-09-20] Gus workshop — 1.995

Implemented Gus as a live optional Homefields NPC using existing detailed rigged citizen art, distinct work-clothes tint and belt hammer. Built a western timber workshop with climbable tool loft/window, workbench, damaged sign, and a back-door shortcut connecting to the orchard return route. Existing ten dialogue lines/voice IDs remain unchanged. Accepting the quest enables loft pickup; optional apology/sign repair restores his offer, cruelty closes it for the attempt without blocking main progress. Returning tools opens collision on both peers and grants each eligible party member BR-02 provisionally. Half completion banks it; retry discards it. Journal names the tool roll correctly. Existing rehearsal-only staging is lifted because checkpoint shard storage is now implemented; full five-shard placement and Rift Hall remain OPEN.

Validation: live browser workshop QA passed 17 movement waypoints and 10 checks including door obstruction, loft access, duplicate reward prevention, repair branch, rollback, checkpoint and reload. Existing exploration/main routes passed 33/51 waypoints; opening/save QA passed 14 checks. Controlled two-context co-op passed 20 checks including Gus shared door/individual rewards and duplicate snapshots; this is not a real WebRTC/device test. Gus reducer, story authority and voice API tests passed. Movement tests stun enemies; encounter balance remains unverified. Reviewed both new screenshots and added them to mobile gallery. Remaining: western combat/orchard refinement, BR-01 tutorial and complete five-shard/Rift Hall integration, Black Woods and boss, all other expanded regions.


## [Codex | 2026-09-20] Workshop production verification

a987630 deployed successfully through Cloudflare Pages (a2d5b082-07b2-4503-a9ad-7bc1ffb5cc6d). Read-only production browser verified 1.995, Gus live availability, nine gallery images loaded and no horizontal overflow at 390px. No production gameplay save changed. Legacy-save/checkpoint regression passed all 11 checks. Private archive 2026-09-20-gus-workshop holds 139 user-role messages with zero unparsed lines and valid references.


## [Codex | 2026-09-20] Western farms and orchard — 1.996

Continued MAP-01/GOV-02: added optional supply-wagon recovery with a visible empty wagon and provision crates beside Mara after recovery; field completion requires no NPC return or enemy quota. Farm defenses create staggered lanes and existing caster replaces one of three grunts. Two independent thornboars occupy extended orchard ground. The existing climb now branches to a hand wheel that lowers a collidable timber walkway, reaching a fruit-picker lookout/cache and a return descent. A discovered note enters the journal. No new spoken lines, shard IDs, major lore or main-route dependencies. Rewards use existing shared once-only transactions and half-checkpoint banking.

Validated in actual browser: new farm/orchard QA passed 23 movement waypoints and 10 access/reward/rollback checks; existing exploration passed 33 waypoints. Caster activated, wound up and fired; boar activated, wound up and charged at ground height (behavior smoke test with invulnerable player, not difficulty tuning). Controlled two-context co-op passed 22 checks including shared bridge geometry and both-player discovery rewards; not a real WebRTC session. Finishing half and reloading preserved both reward receipts and bridge flag. Legacy/checkpoint suite passed 11 checks; Gus reducer and voice API tests passed. Fixed two outer ground recovery gaps found in traversal and a legacy tree intersection found in screenshots. Reviewed farm and orchard screenshots and added to gallery. Full regional art/encounter balance still needs iteration.

Next: BR-01 discovery/tutorial, remaining five-shard and Rift Hall integration, then Black Woods terrain/quests/boss and other regions. All campaign expansion remains partial; do not mark the region complete.


## [Codex | 2026-09-20] Farm/orchard production verification
279e9e5 deployed successfully (Cloudflare 2004a291-5c67-42ec-b45d-56ff121e5c82). Read-only production browser confirmed 1.996, both new world-event definitions, eleven gallery images loaded and mobile width fit at 390px. No production gameplay save modified. Final farm traversal and Gus workshop/reload tests passed after scenery fixes. Private archive 2026-09-20-homefields-farms: 140 user-role messages, zero unparsed lines, valid source references.


## [Codex | 2026-09-20] First physical Rift Shard — 1.997

Implemented BR-01 beside Mara's restored route, gated by her healing quest. E interaction validates local distance/height/alive/play state and collects for that player only. Detailed presentation uses shared low-poly octahedral crystal geometry, small orbiting facets and a thin ring, muted materials for banked echoes, carved base and pickup flourish. First-found notice is nonblocking, hides during menus/dialogue, and explains five matching shards/new fighting style and half banking. Journal derives saved/carried counts from personal ledger, with clear checkpoint/co-op rules; shared story snapshots cannot erase those counts. Gus reward uses the same introduction when it is the player's first shard. Particle-off respected. No recorded dialogue changed.

Browser validation: 10 discovery checks including real E key, height/distance rejection, intro visibility, journal counts, duplicate handling, saved echo, half bank/reload; no page/render errors. Phone notice fits 390x844 and intercepts no controls. Controlled two-context co-op passed 25 checks including guest-only physical pickup, unchanged host pickup availability and preservation through shared story snapshots. Nine shard checkpoint checks and 11 legacy/campaign checkpoint checks passed; ledger and voice API tests passed. Initial voxel fallback preview was replaced with true faceted mesh after review. Desktop and phone screenshots reviewed and published in gallery.

Still OPEN: BR-03/04/05 tied to expanded Black Woods, Rift Hall room/assembly/mentor interfaces, full five-shard class-access migration and revised mapping in the legacy access system. Do NOT claim Rift Hall is live. Legacy single-secret portals remain available until replacement content is complete. Current introduction intentionally does not point players to an absent Hall entrance; add location guidance when the room ships. Next prioritize Black Woods layout and its three authored shard routes so that Hall migration does not lock out existing class access.


## [Codex | 2026-09-20] First shard production verification
c5ff4e1 deployed successfully (Cloudflare a8e90b17-47ec-47d8-8f46-2c76963a25cc). Read-only production browser confirmed 1.997, faceted-mesh module served, fourteen gallery images loaded and no horizontal overflow at 390px. No production save edited. Private archive 2026-09-20-first-rift-shard stores 141 user-role messages, zero unparsed lines, valid references.


## [Codex | 2026-09-20] Black Woods playable terrain and shards — 1.998
Rebuilt Briar half 2 with seven connected clearings, ground camp approach and elevated hunting platforms, safer recovery ground, finite mixed encounters and limited healing pads. Lewis introduces the required signal sabotage: ground crank or upper cable, then northern shelter. Five new recording-ready Lewis lines include context and acting notes. Required exit stays locked until signal completion. Added BR-03 loft, BR-04 animal-track sequence puzzle and BR-05 screened supply nook. Puzzle symbols are shape-based; clue enters journal. Shared conversation/world-state routing now supports both Briar halves; physical shards remain personal.
Validated: 11 upper route/puzzle/shard/rollback checks with actual traversal including loft return; 9 ground-route waypoints with crank, Lewis relocation and boss-entry bank/reload; 6 controlled two-context co-op checks for shared dialogue/signal/puzzle, personal shard and retry. This uses a controlled packet relay, not real WebRTC. Existing 14 opening and 11 campaign/legacy checkpoint checks passed. Story, shard and Voice API tests passed. Reviewed both gallery screenshots. Traversal tests freeze enemies, so they are not combat-balance approval.
Still OPEN: Beth rescue and hidden companion, Brute orchard arena, Rift Hall assembly/mentor/access migration, more scenery and encounter polish. Existing legacy secret access remains until replacement is ready. This is NOT completion of Briar or the wider campaign. Next implement Beth’s rescue around the now-established woods routes, then Brute/Rift Hall.


## [Codex | 2026-09-20] Black Woods production verification
5dacf02 deployed successfully (Cloudflare afb9cbe6-d177-47cd-a031-3ac05bc66ede). Read-only production browser confirmed 1.998, Lewis story and Voice Studio catalog entry, all sixteen gallery images loaded and mobile width fit at 390px. No production gameplay save or voice recording modified. Private archive 2026-09-20-black-woods: 142 user-role messages, zero unparsed lines, valid source references.
