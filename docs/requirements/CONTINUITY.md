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


## [Codex | 2026-09-20] Beth rescue and secret companion — 1.999
Continued approved Black Woods optional Nobody Left Behind. Eastern boot-print trail, broken-beam climb with safe ground beneath, independent thornboars and rope lift. Host rejects release while rescue beasts live; releasing tree restores a walkable crossing and reunites Beth/brother at trail junction, no slow escort or return turn-in. Seven new stable recording-ready lines (Beth 4, brother 3), distinct fitted human NPC palettes. Existing lines unchanged.
New quest-only shepherd dog: articulated browser-native low-poly coat, muzzle, ears, paws, collar/tag, moving legs/head/jaw/tail and SVG icon; base 9 damage / 1.55 seconds with existing level/class scaling. Hidden in normal shop/selection until earned, cannot buy/sell; cheats/all-loadout arena remain explicit unlock bypasses. Shared reward recipients get provisional G.pendingCompanions, banked to petOwned at existing completed-half boundary; no companion menu access until bank. Not auto-equipped, does not replace chosen companion.
Validation: 11 rescue/reward/rollback checks and 17 movement waypoints including repaired return walk; completed-half reload retains companion. Nine controlled two-context co-op checks cover shared rescue geometry, host beast guard, both-player pending/banked reward and duplicate snapshot protection (not live WebRTC). Dog independently dealt damage in focused combat smoke test, and shop/equip/trade behavior passed. Story reducer/authority/Voice API passed, old-save/checkpoint suite 11 passed, Black Woods shard traversal 11 passed. Reviewed two screenshots; no page errors in art or traversal. Beasts frozen/killed by test harness for route/transaction checks, so combat difficulty and broader scenery polish are still not signed off.
Next: Brute orchard arena and its charge/stagger/finite-handler mechanics, then Rift Hall assembly/access migration. Briar and entire campaign remain partial. Raw user archive remains private outside repository.


## [Codex | 2026-09-20] Beth rescue production verification
24d6c86 deployed successfully (Cloudflare 0bf3bfc6-dbd1-4b02-8310-ddb3293517dd). Read-only production browser confirmed 1.999, all seven new Beth/brother Voice Studio lines, shepherd module served, eighteen gallery images loaded and no horizontal overflow at 390px. No production save/recording modified. Private archive 2026-09-20-beth-rescue stores 143 user-role messages, zero unparsed lines, valid references.


## [Codex | 2026-09-20] Usage efficiency without reduced quality
User reports high weekly Pro usage and asks to reduce overhead while preserving all approved depth/quality. Explicitly does not want a weaker model; retain Astra/current chosen reasoning. No scope reduction authorized.
Workflow going forward: group related implementation into coherent playable milestones rather than deploying every small addition; retain small local commits. Reuse tested quest/checkpoint/co-op/voice systems while keeping authored environments and mechanics unique. Keep a compact current-task code/test map with links to full canonical requirements, preserving original sources. Use narrow reads and concise pass/fail outputs; inspect full logs on failure. Run focused checks during edits and appropriate broader/save/co-op/visual checks at release boundaries; repeat only for relevant changes or unresolved risks. Batch release documentation and archives at milestone boundaries. Avoid a large refactor solely for hoped-for savings. No guaranteed savings percentage, no model/settings/plugin changes, and no claim that later levels will be cheap. Next milestone remains Brute encounter, followed by Rift Hall.


## [Codex | 2026-09-20] Brute orchard encounter — 2.000
Implemented the approved Briar campaign boss encounter as a complete layout/combat/co-op milestone. Broad adjoining floor with barn and orchard side loops, shallow terraces, four solid reusable charge targets, broken fence details, fruit crowns and existing Blender foliage kit. Collision and walking routes checked; no random phase-two rubble. Existing Brute model enlarged modestly and given brace, charging run and stagger clips that retain existing arm/weapon poses; animation viewer exposes these motions. Other modes retain their existing Brute mechanics.
Charge: 1.15s tell, aim locks for last .45s, 620 units/s for at most 1.05s. Cart/stone collision creates 3s stagger with existing 1.6x damage bonus. Every third attack can be a .95s warned ground slam when close; its 24-unit hit clearance supports a timed short hop as well as held jump. Two finite two-enemy handler waves at 70% and 35% HP, with 1.5s arrival warnings. Exit and HUD wait for surviving handlers. Host controls boss state, wave creation and enemy HP; clients receive explicit phase/direction and de-duplicated damaging slam rings. No class-specific switches.
Validation: isolated controller timing/direction/collision/wave-cap tests; browser 15 encounter/checkpoint assertions and 13 real movement waypoints; held jump and timed short tap avoid damage while standing still takes damage; nine controlled two-context co-op checks including exactly-once stagger damage, shared waves and exit. Existing 11 save/legacy/checkpoint/trial checks and story reducer/authority tests passed. Three new clips load with finite bones in preview; original/revised and other-enemy switching passed. Two screenshots reviewed, no page errors. Instanced orchard scenery counts 15,024 triangles (not the complete frame). Route/mechanic tests use controlled boss states and invulnerability except the explicit dodge check: overall combat balance still needs ordinary player playtesting. Controlled co-op relay is not an internet WebRTC soak test.
Private archive 2026-09-20-brute-orchard preserves 145 user-role messages, zero unparsed lines and valid source references. User confirmed the usage-efficient milestone workflow; no model or scope reduction. Next: Rift Hall five-shard assembly, class-mentor/access migration and recording-ready Keeper dialogue. Briar/environment polish and the remaining campaign remain partial. Existing secret access stays until its replacement is ready. Music, capes/trails, weapon-fit and broader approved queue are not declared complete by this milestone.


## [Codex | 2026-09-20] Brute production verification
66a9db8 is deployed successfully (Cloudflare 6e653ce9-5512-4362-8e71-6f1f1a7338e9). Read-only production browser confirmed 2.000, controller and motion modules served, all twenty gallery images loaded without phone-width overflow, and BruteRush plays with finite bone transforms in the live animation viewer. No production gameplay save or recording modified. This verification note is held for the next milestone documentation commit to avoid a second deployment containing only a release receipt. Next: Rift Hall.


## [Codex | 2026-09-20] Longer implementation batches
User explicitly welcomes longer consecutive work sessions when they reduce overhead. Continue coherent milestones with targeted checks and one release, without reducing approved depth, model quality, or requirements. Grounded current plan: `docs/IMPLEMENTATION_RIFT_HALL_2026-09-20.md`.


## [Codex | 2026-09-20] Rift Hall and seven class mentors — 2.001
Separate navigable Hall replaces scattered hub side portals, with one entrance/travel link, eight labeled crystalline frames and personal banked X/5 counts. Keeper assembles complete saved sets without consuming IDs or granting the class automatically. Existing discoveries migrate by the CLASS they earned, including legacy Necromancer access; NEW Duskmoor shard assembly requires castle completion. Pyromancer frame is visibly unavailable until its class exists. Briar first-shard card/journal now point to the actual Hall.

Keeper has eight stable recording-ready lines. Seven implemented rift classes each have four unique mentor lines (28), teaching before combat and at the exit after the unchanged trial combat target. Spoken final teaching opens the exit; existing class reward/protected-loadout logic applies. Fitted character kits use existing class body palettes while keeping natural head materials; Paladin uses ivory/light gold. Mentor placement seeks clear supported ground, avoiding props/moving platforms/hazards; fallback uses actual surface height. Fixed misplaced medal accessories. Removed an early Bladeborn reveal from starter onboarding and obsolete Reaper shop-unlock announcement. All 54 previous dialogue records unchanged; catalog now 90 lines. No existing voice takes altered.

Validation: 12 Hall browser assertions and 25 movement waypoints; nine controlled two-context co-op checks for room changes, owner decisions, shared close and independent assembly/duplicate protection; seven class reward/loadout/mentor checks and 14 local mentor approaches with fitted face/mouth meshes. Existing 11 campaign/legacy/checkpoint/trial checks passed. Pure shard/access/story/authority/Voice API suites passed. Reviewed actual WebGL Hall, portal, Keeper and mentor screenshots; phone dialogue fits 390px. Hall scenery reports 14,268 triangles, 1,199 instances and 75 draw calls, excluding actors/other passes. Six screenshots added to phone gallery. Controlled co-op relay is not an internet WebRTC soak; controlled trial completion is not a combat balance playthrough.

Limits: Hall/conversations support co-op, but existing trials lack synchronized trial identity and personal eligibility. Hall entry explicitly keeps training solo until that work ships. No trial arena/encounter redesign or Pyromancer implementation is claimed. Other seven regions retain old single-secret discovery until their five authored shard routes are built. RIFT-05/06 and the wider campaign therefore remain partial. Next: expanded Hollow Pass terrain, routes, puzzles, NPC quests, five shards and its unique boss arena, while tracking trial arena/co-op and Pyromancer dependency work. Existing music, cape/trail, equipment-fit and broader queue remain open where not previously verified.

Private source archive `../../decision-archive/2026-09-20-rift-hall`: 147 user-role messages, zero unparsed lines, valid source references. User's longer-session preference preserved. This is one coherent release, not intermediate deployments.


## [Codex | 2026-09-20] Rift Hall production verification
ba01376 deployed successfully (Cloudflare e881e69c-11ab-4d8c-a4b9-cecf46164328). Read-only production browser confirmed version 2.001, all 36 new authored and catalog lines, 90 total Voice Studio lines with Keeper/seven mentor filters, all 26 gallery images loaded and no phone overflow at 390px. No production gameplay save or voice recording changed. This receipt stays queued for the next implementation commit to avoid a docs-only deployment. Next milestone: Hollow Pass expansion; the broader campaign, trial arena/co-op and Pyromancer work remain partial as listed above.


## [Codex | 2026-09-20] Winding Cliffs — 2.002

2.002 implements Winding Cliffs, Hollow Pass part one: eight named areas, split routes, bridge weights/brakes, Skip’s rope/ridge/javelin reward, HP-01/02, seeded support-count chest, shielded patrol or upper-rope approach, shared windbreak and limited pads. 13 Caleb/Skip recording lines; 103 total. Existing 90 lines unchanged. New modules: hollow-cliffs.js and story/hollow-cliffs.json. Integration still uses briar* shared story APIs; configureCliffCode derives the authored lock sequence from runSeed. New resetPuzzle effect supports the wrong brake. New geometry uses current sandstone art kit and highest-surface footprint subtraction.

Validated 112 elevation-aware movement waypoints, 12 progression checks, ten controlled co-op checks, four shard rollback/banking/echo checks, three patrol/shield/wind checks, plus existing 11 checkpoint/legacy/trial checks and pure story/authority/puzzle/Voice API suites. Five real-renderer gallery shots; 390px dialogue fits. Controlled tests are not a balance certification or internet co-op soak. See ../IMPLEMENTATION_WINDING_CLIFFS_2026-09-20.md.

Next: Lost Canyon's Ward/Ruth, cage rescues, alarm, wagon cave, freight puzzle and HP-03/04; then Marksman arena and HP-05. Part two has its approved name but still old gameplay; the boss is unchanged. Legacy Ninja access retained. Rest of approved queue remains open. Private archive ../../decision-archive/2026-09-20-winding-cliffs: 148 messages, zero unparsed, valid refs. Raw archives remain outside git.

## [Codex | 2026-09-20] Winding Cliffs production verification
ac37e04 deployed successfully (Cloudflare 59c39a57-6e4c-4df3-a0a3-9e49c3d2a01a). Read-only production browser verified 2.002.0-winding-cliffs, 13 new authored/catalog lines, 103 total Voice Studio lines with Caleb/Skip available, and all 31 gallery images including five new screenshots, without horizontal overflow at 390px. No production gameplay save or voice take was changed. This receipt is queued for the next implementation commit to avoid a docs-only deployment. Next: Lost Canyon and the Marksman, as listed above.


## [Codex | 2026-09-20] Lost Canyon — 2.003

Implemented Hollow Pass part two: Ward/Ruth, alternate entrances, cage rescues, finite alarm response, moving prisoners/shelter shortcut, wagon cave loop, freight puzzle and HP-03/04. 16 new VO lines; 119 total. Verified 253 route waypoints, quest/co-op/checkpoint/alarm checks and phone dialogue. See docs/IMPLEMENTATION_LOST_CANYON_2026-09-20.md for complete evidence and limits. Private archive ../../decision-archive/2026-09-20-lost-canyon preserves 149 messages with valid references. Marksman/HP-05 next; broader approved queue remains open.


## [Codex | 2026-09-20] Lost Canyon production verification
92d3cb7 deployed successfully (Cloudflare d9ff5ebf-ac48-472f-9bea-8aab11ef7bbb). Read-only production browser confirmed 2.003.0-lost-canyon, all 16 new authored/catalog lines, 119 total Voice Studio lines with Captain Ward/Ruth, and all 36 gallery images including five new previews; no horizontal overflow at 390px. No production save or recording was changed. Receipt queued for next implementation commit to avoid a docs-only deployment. Next: Marksman arena and HP-05; remaining campaign/approved queue remains open.


## [Codex | 2026-09-20] Marksman crossing — 2.004
Campaign Hollow Marksman: split canyon, climbable nests, locked aim, physical cover, single protected glide/guard pair, safe landing recovery, rear-stair HP-05 saved on individual claim. All five Hollow Pass shards are now collectable in one run. 181 movement waypoints, 15 fight checks, ten controlled co-op checks and five-shard banking flow verified. See docs/IMPLEMENTATION_MARKSMAN_2026-09-20.md for scope and test limits. Existing 119 VO lines unchanged. Private archive preserves 150 messages with valid references. Next Ruined Keep; trial/co-op training and wider campaign/approved queue remain open.


## [Codex | 2026-09-20] Marksman production verification
c44e757 deployed successfully (Cloudflare 1758d0f9-2971-4f4d-9454-ceded99a15e3). Read-only production browser verified 2.004.0-marksman-crossing, unchanged 119-line Voice Studio catalog with all 16 Ward/Ruth lines, and all 39 gallery images including three Marksman screenshots; no horizontal overflow at 390px. No production save or voice take changed. Receipt queued for next implementation commit to avoid a docs-only deployment. Next: Ruined Keep Broken Walls terrain, Grant/Felix, breach defense and first two Reaper shard routes, then The Dungeons (Walter/Sly) and The Fallen.

## [Codex | 2026-09-20] Broken Walls — 2.005

Continued the approved landscape-first campaign plan. Ruined Keep part one now has Grant/Felix, breach defense, two dungeon-entry mechanisms, timed workshop/tool return/rare Lockpick, tower and independent chamber routes, and RK-01/02. Ten new recording lines; 129 total. 264 controller route samples, 16 runtime checks, 12 controlled co-op checks, five Keep checkpoint checks and 11 existing campaign checkpoint checks passed, plus story/authority/shard/Voice API/content tests. Camera cutaways and disjoint terrain surfaces address this layout's overlap/visibility issues. See docs/IMPLEMENTATION_BROKEN_WALLS_2026-09-20.md for scope, evidence and limits. Next: The Dungeons/Walter/Sly/remaining Reaper shards, then The Fallen. Wider approved work remains open. Private archive ../../decision-archive/2026-09-20-broken-walls preserves 151 user messages, zero unparsed lines and valid source references.

## [Codex | 2026-09-20] Broken Walls production verification

e6bfffc deployed successfully (Cloudflare 451bf2f2-612f-41f9-972d-16a9c6c52504). Read-only production browser verified 2.005.0-broken-walls, all ten Grant/Felix authored/catalog lines, 129 total Voice Studio lines, and all 44 gallery images including five new screenshots; no horizontal overflow at 390px. No production save or voice take changed. Receipt queued for next implementation commit to avoid a docs-only deployment. Next: The Dungeons, Walter/Sly, lift/remaining three Reaper shards, then The Fallen. Wider queue remains open.

## [Codex | 2026-09-20] The Dungeons — 2.006

Continued the approved landscape-first campaign expansion. Ruined Keep part two now has Walter/Sly, hidden captives/papers, a shared working rescue lift, optional lower weights and drain maze, rare armor cache and RK-03/04/05. All five Keep shards can be banked before its boss. Sixteen new recording lines; 145 total. 344 controller route samples, 14 runtime checks, ten controlled co-op checks, four Dungeons checkpoint checks and eleven existing campaign checkpoint checks passed. Broken Walls regression also passed (264 samples/16 checks); content/story/authority/shard/hall/Voice API suites passed. See docs/IMPLEMENTATION_DUNGEONS_2026-09-20.md for evidence and limits. Next: The Fallen, then Frostfell. Wider approved requirements remain open. Private archive ../../decision-archive/2026-09-20-dungeons preserves 152 user messages, zero unparsed lines and valid source references.


## [Codex | 2026-09-20] Dungeons production receipt
Main commit 5eda2d7 deployed successfully through Cloudflare Pages deployment 051cb19e-7ac5-4cca-a49a-98ae5563be92. Read-only production browser verification: 2.006.0-dungeons, 16 authored/new catalog lines, 145 total lines, Walter/Sly visible in Voice Studio, 49 decoded gallery images including five new previews, no 390px overflow. Next batch: The Fallen indoor pillar/feint duel, followed by Frostfell. No production saves or recordings changed.

## [Codex | 2026-09-21] The Fallen — 2.007

Implemented the approved compact indoor Hollowed-champion duel, four physical pillars, locked thrusts, separately warned feint/sweep, recovery windows, solo second phase and northward Ellis clue. Removed this boss's former-Bladeborn text. Found/fixed mismatched enemy-renderer module imports causing legacy fallback overlap and split caches; browser checked actor ownership across five area transitions. 94 movement samples/13 fight checks, six controlled co-op checks, four Keep shard checkpoint checks and eleven existing campaign/legacy checks passed, plus encounter/import/story/authority/shard/Voice API suites. Three reviewed previews. 145 VO lines unchanged. See docs/IMPLEMENTATION_FALLEN_2026-09-21.md for scope and limits. Next Frostfell terrain/NPCs/Ellis rescue, then its boss; wider queue remains open. Private archive ../../decision-archive/2026-09-21-fallen preserves 154 user messages with zero unparsed lines and valid references.


## [Codex | 2026-09-21] Fallen production receipt
Main commit 21d2e28 deployed successfully through Cloudflare Pages 640f1eb1-fbdd-4638-99d3-3439e8923303. Read-only live browser verified 2.007.0-fallen-duel, encounter module, shared renderer import, unchanged 145-line Voice Studio catalog and all 52 gallery images (three new) at 390px without overflow. No production saves or recordings changed. Next: Frostfell mountain route and ice-cave Ellis rescue, then its three-officer boss.

## [Codex | 2026-09-21] Snowbound Peaks implemented — 2.008

Frostfell part one now uses authored climbing routes, a sheltered bypass around the exposed lift-house crossing, a heater delivery to Heath, a repair that lowers the main crossing, a shape-based signal puzzle and a buried camp marker puzzle. FF-01 requires a narrow jumping route behind the shelter flag; FF-02 appears at the camp chest and remains a personal pickup. The winter cloak and collected shards become permanent at the cave boundary, not on discovery. The return winch lowers a stepped shortcut; it is labeled return steps rather than pretending to be a moving lift.

Heath is the only mountain NPC and has ten stable recording IDs. Voice Studio now has 155 lines. His blunt conversation branch rejoins the required quest; conversations resume and pause both co-op players. Clues are shown on discovery and kept in the Frostfell journal. No new Bladeborn, Sunspire or final-cut revelations. Ellis's freshly captured laboratory rescue belongs in the next part.

Validation: story transaction/voice graph tests, voice API regression, shared enemy module cache test, classic inline syntax; browser 50 walking/jumping waypoint checks and eight runtime progression assertions; four death/checkpoint assertions; seven two-context co-op assertions. Both clients receive repair/puzzle changes and the banked cloak, but physically collect their own shards. No captured browser errors. 390px dialogue has no horizontal overflow. Frost scenery is about 25,628 triangles total with spatial chunk culling; this is not a device performance benchmark. Combat difficulty was not balanced by these invulnerable route tests.

Five new browser screenshots are in the public campaign gallery (57 total). Private conversation archive updated outside Git: ../../decision-archive/2026-09-21-snowbound — 155 user messages, zero unparsed lines, valid references. Existing approvals remain authoritative; this batch does not complete the campaign or wider queue. Next: Deep Ice Caves terrain, Ellis's capture/rescue, Hugo, environmental machinery, remaining three Chronomancer shards, then the coordinated three-officer boss.

## [Codex | 2026-09-21] Snowbound production receipt
Commit 9cf38ba is on main. Cloudflare deployment ad20ab6f-9ba9-4441-9c82-d5da91728072 succeeded. Read-only production browser checks confirmed 2.008.0-snowbound-peaks, all 10 Heath lines in the 155-line voice catalog, Heath in Voice Studio, and 57 gallery images decoding with five new previews and no 390px overflow. Next: Deep Ice Caves and Ellis rescue; then three-officer boss. Keep this receipt for the next implementation commit.

## [Codex | 2026-09-21] Deep Ice Caves implemented — 2.009

Frostfell part two now has a descending entrance, two laboratory approaches, a lower research pack, separate waterworks basins, an optional rescue route, a raised frozen-waterfall loop and narrow shard ledges. Defeat Ellis's guards, release him, recover and return his sealed notes, then complete the fill/freeze/drain crossing. His notes point to Emberdeep's arms supply. The firm dialogue route rejoins the required objective. No timed capture failure, underwater breathing, early Bladeborn reveal or final-cut spoiler.

Hugo's optional rescue requires securing the frame and recovering rope before lowering it. He walks to the dry junction. FF-03 is a shared NPC reward; FF-04 is a personal pickup behind the optional drain/fill/freeze cycle; FF-05 is a personal waterfall climbing reward. Wrong cycles safely reset, completed crossings stay open, and falling into the basins returns the player to dry controls. Four limited healing pads serve the longer routes. Ellis has ten new voice nodes and Hugo eight; stable IDs are in the public catalog, totaling 173 lines. The obsolete Rime Shelf HUD label is replaced with Deep Ice Caves.

Validation: story/authority/shard/voice API/cache regression tests passed; authored cave graph and all reward/puzzle gates passed. Browser tests passed 63 controller walking/jumping waypoints, 11 runtime progression assertions, four death/banking assertions and nine two-context co-op assertions through actual multiplayer handlers with a controlled packet relay. Both clients pause for dialogue and receive puzzle bridges/Hugo's reward; physical shards stay personal. Cave death rolls back cave discoveries, mountain shards remain, and boss entry banks all five Frostfell shards. No captured browser errors. Six new reviewed browser screenshots (63 gallery images); Hugo dialogue fits 390px. Cave scenery is 40,904 triangles with spatial chunk culling; this is not a device benchmark. Combat balance and real-network latency still require human playtesting.

Private conversation archive: ../../decision-archive/2026-09-21-ice-caves — 156 user messages, zero unparsed lines, valid source references. Existing approvals remain tracked. This batch completes the cave section, not the entire Frostfell redesign or wider queue. The legacy Frost Sorcerer remains playable temporarily; NEXT is the approved coordinated three-officer boss and high/low cavern arena, bringing the encounter into line with Ellis's recording-ready dialogue. Then Emberdeep's expanded forge campaign.

## [Codex | 2026-09-21] Deep Ice Caves production receipt
Commit aaf9c43 pushed to main. Cloudflare deployment 23f0deab-5e18-49f9-9e18-992225932256 succeeded. Read-only live browser verification confirmed 2.009.0-deep-ice-caves, all 18 new Ellis/Hugo nodes in the 173-line voice catalog, both NPCs available in Voice Studio, and all 63 gallery images decoded at 390px without horizontal overflow (six new cave previews). Next: coordinated three-officer Frostfell encounter and its high/low cavern arena; the legacy boss is still present. No production save mutations during verification.

## [Codex | 2026-09-21] Frostfell officers implemented — 2.010

Replaced the main-campaign Frost Sorcerer with a caster, shield officer and spear officer in a cavern with two raised shelves, walkable ramps, eight tested jump landings and a high exit. One major attack at a time; locked ground circles, jumpable shield waves and bounded spear lanes match damage geometry. Survivors change priorities, with no reinforcements or surprise death burst. Custom shield/spear GLBs and upper-body animation tracks retain the existing low-poly kit. Three individual health bars plus shared health/remaining count; all three must fall before one boss credit, boss loot and exit. Other modes retain their existing encounters. Boss retries rebuild the trio and retain banked shards.

Validation: encounter scheduler and elevated pursuit tests, renderer import identity, Fallen and Voice API regressions passed. Browser: 84 controller ramp waypoints, eight shortcut landings, 12 combat/progression checks, seven controlled two-context co-op checks and five retry/death-order checks. Reviewed five browser previews, including staged attack warnings and a 390px phone view; corrected phone HUD overlap. Scenery has 9,416 triangles, spatially culled; shield/spear meshes have 674/682 triangles. These checks establish functionality, not human combat balance or device performance. Gallery now has 68 images. Voice catalog remains 173 lines.

Stereo Voice Studio hotfix cbb5237 was already deployed successfully (Cloudflare f42b0d72-4e34-4ad5-afef-87915131f9f1). Browser MediaRecorder/decode checks verified two-channel output, preserved stereo separation and centered mono. Existing takes and approvals were not changed. Private archive ../../decision-archive/2026-09-21-officers-stereo contains 159 user messages, zero unparsed lines, valid references.

Next: Emberdeep Iron Halls terrain, safe machinery shutdown, Flint/Jack dialogue and optional work; then Great Furnace, Colossus and the remaining campaign. The wider queue is not complete.

## [Codex | 2026-09-21] Frostfell officers production receipt
Commit 0dc1359 is live on main. Cloudflare deployment 0cd3dbd3-0251-4b0b-a249-fc7bc83a16c5 succeeded. Read-only browser checks confirmed 2.010.0-frost-officers, both officer GLBs and module HTTP 200, unchanged 173-line catalog and 68 decoded gallery images at 390px without overflow. No production saves or recordings changed.

## [Codex | 2026-09-21] Iron Halls implemented — 2.011

Emberdeep part one is now an authored forge district: receiving yard, worker station, broad lower floor, raised stamping route, western stores, seized-work loft, jumping return ledges, control hall, casting room and service-cart crossing. Existing Emberdeep art is extended with instanced iron frames, workbenches, racks, pipes, lamps and supply crates. Three limited healing pads. Flint and Jack have aprons/tools and distinct existing character bases. Workers visibly walk into shelter after the station guards are cleared. Main progression is safe shelter, handle delivery/cart repair, then feed/pressure/hammer shutdown; wrong orders reset with a safe steam warning. Press warnings precede hits by 1.4 seconds; shutdown disables them. Optional routes never gate the main exit.

Flint's optional recovered blade blank grants a chosen fixed rare Forgeguard sword, javelin, wand or chest armor, plus shared ED-02. ED-01 is an individual pickup inside a casting mold that can only open after shutdown. Both and the equipment remain provisional until the next half. Seventeen stable voice IDs for Flint/Jack are recording-ready (190 catalog lines total); established text and takes were not rewritten. Seven new browser previews bring the gallery to 75. Jack's initial position caused conversation-camera obstruction under the upper approach; relocated him to the clear western side of the cart junction and reviewed the result.

Validation: story branches, safe order, delivery gates, four reward choices, voice graph, story/authority/shard tests, Voice API regression and shared renderer identity passed. Browser: 41 movement waypoints including the jumping return, nine quest/progression assertions, seven machinery damage/clock checks, nine controlled two-context co-op assertions, four death/banking checks. Shared dialogue pauses both worlds; cart and machinery synchronize; repeated snapshots cannot duplicate gear or shards; physical shard pickup remains individual. Main completion does not need the optional reward. No captured browser errors; full revealed dialogue fits 390px. Scenery totals 149,640 triangles with spatial culling (15,468 visible in one reviewed view); these are geometry counts, not measured device performance. Human difficulty/feel testing remains necessary.

Private archive ../../decision-archive/2026-09-21-iron-halls: 160 user messages, zero unparsed lines, valid source references. This completes Iron Halls, not the whole Emberdeep region. The current second half and boss still use their earlier implementation. Next: Great Furnace terrain, Pike/Martin, patrol diversion, evacuation/cooling routes, captive fire companion, remaining shard paths and confiscated Sunspire writings; then the large Colossus encounter. Preserve story reveal order and do not imply this entire queue is complete.

## [Codex | 2026-09-21] Iron Halls production receipt
Commit 070c968 is live on main. Cloudflare deployment 990750da-5d71-4ae7-a403-f18f0aa11c17 succeeded. Read-only production browser verified 2.011.0-iron-halls, the module HTTP 200, all 17 new lines in the 190-line catalog, Flint and Jack available in Voice Studio with the stereo selector intact, and 75 decoded gallery images including seven new previews at 390px without horizontal overflow. No production saves, takes or approvals changed during verification. Next is Great Furnace part two, then the Colossus arena. This receipt is left for the next implementation commit to avoid a documentation-only redeploy.

## [Codex | 2026-09-21] Priority combat, tracker and journal repairs — 2.012

Paused Great Furnace work at Oliver's request. Confirmed/fixed three authored bosses bypassing the activation branch (zero spawn delay, inactive), Chronomancer Stopped Clock never expiring, absolute rather than relative enemy step height, and quest HUD cache ignoring changes to objective wording. Zero-delay combat bosses now enter the ordinary wake/intro path; Marksman's long arena uses a suitable activation radius. Inert puzzle walls are untouched. Freeze expires once per active gameplay frame, paused during dialogue/menus. Small steps on high platforms are traversable; large walls remain solid.

Tracker compares rendered content, shares discovered optional tasks with the journal, updates hold/hunt progress and boss completion, and shows shard counts rather than the obsolete single-rift objective in redesigned halves. Optional tasks can collapse and the tracker scrolls. New journal notes slide into a side panel: minimum ten seconds, 140-word-per-minute allowance plus three seconds, hover/focus hold, close and full-journal buttons. Menus/conversations pause presentation; queued updates deduplicate and restored notes are seeded silently. Quest-item/world feedback also reaches co-op peers. No voice lines, takes, save schemas or rewards were rewritten.

Validation: natural update-loop encounters in all 16 campaign halves and eight boss rooms showed active attacks and actual damage without forcing activation or stunning enemies. Ordinary chosen enemies pursued; Marksman and frost caster correctly attacked from their posts. Separate real skill test proves time stop holds then expires; relative-step fixture checks both climbable and blocking heights. Browser checks cover authored tracker changes, nine optional tasks shared with journal, real clue and root interactions, snapshot dedupe and restored-state silence. Controlled two-context Iron Halls co-op has 11 checks including guest tracker/notes/pickups. Pre-change 2.011 checkpoint loaded in 2.012 with gold, class state and clue intact and no replayed notice. Queue unit, story state/authority, shards, Voice API and shared renderer tests pass. Desktop/390px previews checked; 77 gallery images. Browser errors absent. This does not claim full human difficulty testing or completion of the campaign redesign.

Private source archive ../../decision-archive/2026-09-21-combat-journal contains 162 user messages, zero unparsed lines, valid source references. Next after this repair release: resume Great Furnace and Colossus work.

## [Codex | 2026-09-21] Combat/journal repair production receipt
Commit 16c2cd6 is live on main. Cloudflare deployment fa90906e-2c94-4ff3-b0a3-59e60362f052 succeeded. Read-only production browser requests confirmed 2.012.0-combat-journal and HTTP 200 for the new JS, CSS and both journal previews. Actual UI buttons tested locally: optional-task collapse remains collapsed, full journal opens/closes, notice dismisses. No production saves or voice recordings were changed. Main implementation can resume with Great Furnace after this priority repair. Receipt left for the next implementation commit to avoid a docs-only redeploy.

## [Codex | 2026-09-22] Supplied music integrated — 2.013

Imported all 40 original stereo MP3s (171 MB total) byte-for-byte from Desktop/BladeFall Music, plus the two placement guides. Hash/duration/placement manifest lives at public/music/bladefall/manifest.json; docs/audio/APPLIED_SOUNDTRACK.md is the human-readable map. Desktop files untouched. The Wayfarer’s Hearth hub edit uses source 41.997–186.704s, a 68-BPM interpretation of the measured 136 pulse and one-bar 3.529s wrapped crossfade. Its 141.177s MP3 is the runtime loop; equivalent Opus edit retained. Original remains available. No generated filename adds new lore.

Lazy streamed music now distinguishes every region half and boss. Main hub gets the requested loop, Rift Hall gets Archive of Violet Portals, class combat gets Crystalline Trials and mentors/secret rooms get Hall of the Violet Discipline. Final Duskmoor boss switches Crown of Ashes to Iron Oath at phase two. Ellis relief/knowledge conversations get their assigned score and restore the cave music when closed; NPC dialogue ducks music to 45% without altering preferences. Victory stays on Watchful Greenwood during post-boss menus. Restoring music from zero volume now selects the actual current scene.

Ship crossing/arrival, hydra/release and full Void/Ian/charge/cut cues have named mappings but are reserved until those scenes exist. Storm Coast sea tracks are assigned under the future storm region key; current old Abyss geometry retains Black Procession/Iron Causeway/Paradox, not premature sea music. Alternate Waystation take B is saved, not randomly substituted for the requested hub loop. Existing short victory fanfare and SFX stay intact. Listening page: /3d/audio-planning/music.html.

Validation: original hashes, stereo and per-file deployment sizes; routing tests across halves/bosses, future cue names, final phases and hub/trials; real browser 23 route/transition checks, actual final-boss phase change, all 41 runtime tracks reaching canplay, no custom music fetched at muted startup, mute/unmute and native end-to-start hub wrap. MP3 decoded loop has no silent seam frames and peak 0.857; no subjective audition claim. The first Opus candidate played but reported infinite duration over the local non-range server, so MP3 is the verified runtime choice. Listening page fits 390px and loads zero audio until requested. Pre-change checkpoint preserved gold/class/clue without replaying a notice. Shared renderer identity intact; no voice lines/takes edited.

Private archive ../../decision-archive/2026-09-22-music: 166 user messages, zero unparsed lines and valid references. Next main implementation remains Great Furnace, then Colossus, with future soundtrack hooks ready.

## [Codex | 2026-09-22] Soundtrack production receipt
- Commit f87779c pushed to main; Cloudflare Pages check completed successfully (deployment ffc7f3b8-a49a-4edb-a8e7-c720d10b3e4c).
- Production read-only browser check confirms v2.013, manifest with 40 originals, listening page with 41 audio entries, finite hub MP3 duration 141.177354 seconds and successful native loop wrap.
- Range request returned HTTP 200 (full file), not 206; browser playback and seeking still passed. No production save or voice take was modified.
- Source placement notes remain byte-for-byte copies, including original whitespace. Commit whitespace check reported those source spaces and one extra EOF blank in the QA script; these do not affect runtime.
- Future Storm Coast ship/hydra and expanded Void ending tracks are mapped/reserved, not claimed as implemented scenes. Next campaign work remains Great Furnace part 2 and its Colossus encounter.


## [Codex | 2026-09-22] Great Furnace and Colossus implemented — 2.014

U167 continues the approved campaign queue. Great Furnace replaces the old second-half route with a worker floor around the furnace, separate transport and gallery routes, a command-office climb, high pressure loop and lower return. Pike accepts the genuine fault/schedule or raises the gate fight. Martin supports direct or quiet evacuation. Workers move to shelter, restore a working up/down service lift and open a crossing. Cooling controls raise the main bridge; a separate reversed-shape puzzle reveals ED-04. Upper pressure work opens ED-03 and disables the second boss vent. Free Cinder by safely disconnecting its cage; the new quest-only fire companion appears at the Beastkeeper only after it is banked. Cinder uses the existing fire-creature rig with a warm recolor; this is not a newly sculpted model. Seized writings reveal Sunspire/orb; Martin learns from the papers and supplies practical sailor contacts, without an early Bladeborn/final-cut reveal. Sixteen new stable Pike/Martin recording lines bring the catalog to 206. Existing takes unchanged.

The Colossus is six player-heights tall, with a raised horseshoe, ground-accessible cooling valves, optional jumping shortcuts and a safe lower floor. Turn a valve for a 13-second damage window; tanks refill over 18 seconds. Locked slam circles, marked vents and a low sweep share warning/hit geometry. Upper shelves avoid the sweep. One two-person repair crew appears below 55% health; repairs cap at 8% maximum HP. No legacy crystal-shield phase. ED-05 is hidden behind a cooled rear pipe after victory and banks immediately. The overhead camera widens for this encounter; close camera modes remain player-controlled. Enemy/faction identifiers preserved.

Validation: four story paths and their prerequisites, optional independence, wrong-order resets, companion dedupe, voice graph, Colossus geometry/timing/repair caps; story/authority/shard/Voice API/music/shared-renderer regressions. Real browser: 54 furnace controller waypoints, 10 progression assertions, actual service-lift ascent/descent; natural gate patrol pursuit and 125 damage; 98 arena movement samples, 14 combat/progression checks including real valve use, actual damage/dodge and fifth-shard banking; 11 controlled two-context co-op checks; five death/checkpoint assertions. A pre-change 2.013 save retains gold, class state and saved clue without replaying notices. No captured browser errors. Eleven new browser previews, 88 gallery images, phone dialogue fits 390px. Approximate scenery geometry: 192,016 furnace triangles with spatial culling; 61,788 arena triangles. These counts and invulnerable movement checks do not establish device performance or human difficulty balance. No global z-fighting audit is claimed.

Private archive: ../../decision-archive/2026-09-22-great-furnace contains 167 user messages, zero unparsed lines and valid source references. This finishes this Emberdeep content batch, not the entire approved update. Pyromancer implementation/trial remains pending; all five Emberdeep shards are now collectible. Next campaign batch: Storm Coast Shipwreck Shore, ship preparation/crossing, then Thunder Cliffs and chained hydra. The old Abyss still occupies that campaign slot until the replacement is built.

## [Codex | 2026-09-22] Great Furnace production receipt
Commit 24ff462 is on main. Cloudflare Pages deployment bc19c3b4-3256-48ce-840e-2fdb0468a12e succeeded. Read-only production browser verification confirmed 2.014.0-great-furnace, both modules and Cinder icon HTTP 200, all 16 new authored lines in the 206-line catalog, Pike/Martin visible in Voice Studio with stereo selection intact, and all 88 gallery images decoding (11 new) at 390px without overflow. No production save, voice take or approval was changed. Next: Storm Coast replacement, beginning Shipwreck Shore and ship preparation/crossing, then Thunder Cliffs/hydra. Keep this receipt for the next implementation commit; wider requirements remain open.


## [Codex | 2026-09-22] Storm Coast crossing foundation — 2.014.1

U168 continues the approved campaign queue. Built a host-owned voyage state machine and reusable low-poly longboat asset, plus an isolated browser preview at /3d/ship-preview/. Course alternates steering, two normal-combat handoff states, a sheltered one-use repair/role-swap stop and landing. It includes stale-input expiry, host-only wave completion, no client-supplied kills/arrival, pause, disconnect/dead-crew handling, deterministic obstacle placement and a long-hull collision capsule. Landing is emitted once; this module itself writes no saves or rewards. Static meshes are batched. Three new preview images are linked from the campaign gallery.

Validation: 80 seeded courses cleared without damage by a steering controller; collision dedupe, failure/arrival exclusion, wave gates, repair cap, solo/role swap, disconnects, pause, fixed-step determinism and stale snapshot rejection pass. Real Chromium browser: actual keyboard and pointer steering, pause/resume, two-player-role simulation, both ready buttons, repair button, 390px layout, no JavaScript errors and unchanged localStorage. Reviewed desktop/phone boat views and corrected phone framing. A pre-change 2.014 save retained gold/class/checkpoint clue without a replayed journal notice. This is not real network QA or normal-weapon deck-combat QA. Recorded preview views use roughly 2.8–4.2k triangles; device performance is not established.

IMPORTANT: this is an isolated development preview, not the completed Storm Coast replacement. Main campaign slot 5 still uses its legacy level. No shore quests, NPC voice lines, shards, hydra or normal combat were claimed as integrated. Next: build Shipwreck Shore routes, Otto/Rose quests and puzzles, connect the crossing to actual game combat/co-op/checkpoint systems, then Thunder Cliffs and hydra. Existing 206 Voice Studio lines/takes remain unchanged. Full queue remains open.

Private archive ../../decision-archive/2026-09-22-storm-crossing has 168 user messages, zero unparsed lines and valid source references. Implementation plan/evidence: docs/IMPLEMENTATION_STORM_CROSSING_2026-09-22.md.

## [Codex | 2026-09-22] Sailing preview production receipt
Commit aec967d is on main; Cloudflare deployment 9e0da17e-c898-49e8-bcd7-dc07d8c2e5af succeeded. Production browser verified 2.014.1-ship-preview, actual WebGL boat rendering, module/image HTTP 200 and all 91 gallery images decoding at 390px without overflow. Gallery QA must set lazy images to eager before awaiting decode; the first attempt waited on offscreen lazy images and was replaced with that corrected check. No live game saves or Voice Studio takes changed. This ships only the isolated crossing/model preview, not the Storm Coast campaign replacement. Next is Shipwreck Shore terrain/quests and actual combat/co-op/checkpoint integration.

## [Codex | 2026-09-22] Shipwreck Shore and campaign crossing — 2.015.0

U169 continuation implemented the first half of Storm Coast (legacy numeric slot 5 / abyss save ID preserved). Authored connected beach, upper wreck, lower hatch, lookout, cave, Rose wreck and memorial routes; three limited healing pads; guarded sailcloth; drain/latch puzzle; weighted hatch; seeded count-code chest with rare Stormshot crossbow. Otto takes three recovered boat parts separately or together and the boat visibly repairs. Male Captain Rose offers bell/crew-record dialogue with kind, honest, repairable offense and closed optional branches. Main progress never depends on Rose. SC-01 is a personal physical discovery; SC-02 is a shared NPC reward. Eighteen new stable voice lines bring the catalog to 224 without changing recorded takes.

The shore now leads into the real campaign voyage: host-owned steering, normal-weapon deck combat, two boarding waves, one sheltered repair/role swap, shared readiness and disconnect fallback. Landing alone banks shards and advances the half checkpoint. Hull failure restarts the shore and discards provisional progress. No mid-crossing checkpoint. Sailing uses a long-range overview and closer deck-combat camera. Browser review caught and fixed an accidental use of the Marksman boss type for shore enemies, replacing those with normal casters, and corrected sailing far-plane clipping.

Evidence: test-shipwreck-shore (four Rose routes, main independence, deliveries, puzzles, reward dedupe, 500 code seeds); test-ship-crossing (80 courses and authority); real browser qa-shipwreck-shore (43 controller waypoints, six story/world checks), qa-campaign-voyage (natural pursuit/damage, real weapon hits, two waves, landing/banking/checkpoint), qa-shore-coop (11 controlled two-context shared dialogue/reward/steering/ready/disconnect checks), qa-shore-checkpoint (hull failure whole-half reset). Previous-build save retained gold, class rank and checkpoint clue without duplicate notice. Voice API and shared mob import tests pass. Eight new screenshots, including 390px dialogue without overflow. Shore static scenery counts 17,208 triangles / 1,206 instances; not a device performance benchmark. Scripted pilot/invulnerability used for traversal QA; human balance and real-network latency remain unproven.

Scope: Thunder Cliffs and hydra are NOT implemented yet. Arrival still enters the legacy second half and its old boss remains pending replacement. Next: authored Thunder Cliffs terrain/quests, remaining SC-03..05, chained hydra mercy encounter and distinct arena, then Sunspire. Existing larger queue remains open. Private source archive: ../../decision-archive/2026-09-22-shipwreck-shore (169 messages, zero unparsed, reference validation passed).

## [Codex | 2026-09-22] Voice catalog loading follow-up — 2.015.1
Initial deployment d0ae5c9 succeeded (5ab50262-cbc1-4bf1-a45b-e325fb6b9682). Production read-only QA hit the 30-second timeout reading the catalog. Changed catalog/game metadata loading from sequential reads to six bounded workers, preserving authored order and all approval/write semantics. No stored recordings or text changed.

## [Codex | 2026-09-22] Shipwreck production receipt
Main b79ee57 deployed successfully as 8a98b1d5-8bce-4910-bf2e-12d320c75c86. Read-only production Chromium verified 2.015.1-shipwreck-shore, shore modules/story HTTP 200, catalog 224 lines within request timeout, and all 99 gallery images decoded at 390px without overflow. No production save or recording mutations. Next: Thunder Cliffs and chained hydra; legacy second-half/boss are still present.

## [Codex | 2026-09-22] Thunder Cliffs and hydra — 2.016.0

U170 continuation completes the Storm Coast campaign replacement: Thunder Cliffs branching ascent, repairable cargo lift, personal wind climb, tidal-sequence grotto, Dash cooperation/race cave, optional sailcloth cape and SC-03/04/05. Abe explains the captive hydra and the route to Sunspire. Twelve stable new VO lines bring the catalog to 236; no existing takes edited. Slot 5 / abyss remains an internal compatibility identifier. Its campaign boss is now the chained sea hydra, not an early Abyss King.

The three-head encounter has melee/ranged-accessible restraints, locked bite warnings, a low sweep avoided on the raised shelf, cover-blocked water blasts, and a recovery window exposing one restraint. Breaking each removes its head from attacks. Breaking all three frees the animal, stops attacks and opens the ascent. No corpse or King kill credit; rewards deduplicated. Shared phase/health/mercy state is host-owned. Distinct stone bridges, cover and upper paths replace the old arena. Added a walkable return from the optional wind safety ledge and repaired a cross-ledge gap found by controller QA.

Evidence: test-thunder-hydra plus story state/authority, shard ledger, score, shared mob imports and Voice API all pass. Actual browser qa-thunder-cliffs passes 11 checks and 47 controller waypoints; qa-thunder-routes completes Dash race and visits all restraint ledges, rear refuge and exit; qa-hydra-combat passes 10 checks including real sword/bow hits, naturally timed damage, mercy/reward/retreat. Controlled two-browser co-op passes seven shared/personal/guest-attack/stale-state checks. Half death rolls back its provisional shard; boss arrival banks all five and cape; boss death resets three restraints while retaining banked rewards. Existing voyage regression passes all nine checks. Pre-change save retains gold, rank and checkpoint clue, without replaying the note. Thirteen new WebGL previews include 390px dialogue without overflow.

Limits: scripted movement/invulnerability and controlled packet delivery are not human balance, mobile performance or real-network latency testing. Static Thunder art reports 39,912 triangles / 2,132 instances; not a frame-rate benchmark. Final boss/end sequence and remaining Sunspire/Castle redesign remain open. Next: Sunspire Palace terrain and knowledge-library quest progression, followed by its distinct boss; preserve late Bladeborn reveal and keep the orb from spoiling the final cut. Full approved queue is not complete.

Source preservation: ../../decision-archive/2026-09-22-thunder-cliffs, 170 messages, zero unparsed lines, valid references. Grounded plan: docs/IMPLEMENTATION_THUNDER_CLIFFS_2026-09-22.md. Production confirmation is recorded separately after deployment.

## [Codex | 2026-09-22] Thunder Cliffs production receipt
Main 1f05b1b deployed successfully as 397600e4-6046-47f0-bcdf-434a95182755. Read-only production Chromium verified 2.016.0-thunder-cliffs, all five new module/story URLs HTTP 200, 236 Voice Studio catalog lines, and all 112 gallery images decoded at 390px without horizontal overflow. No live save or voice-take mutations. Next: Sunspire Palace, following latest canon overrides at the top of CAMPAIGN_EXPANSION_PLAN.md and requirements register (orb vision, no final-cut spoiler).

## [Codex | 2026-09-23] Palace Courtyard — 2.017.0

U171 continuation replaces Sunspire half one only. Broad marble entry and fountain courts connect west waterworks, lower garden paths, two occupied balconies, east greenhouse, mirror terrace and an optional memorial roof. Grace introduces the occupation and a field task restores the rare unlimited pad. Victor explains combat versus lower water-control approaches; either/mixed defense route works without another mandatory NPC turn-in. A fixed three-mirror/sun-mark puzzle opens the library. Harmless wrong turns, visible beams and shaped receivers remain usable with particles off. Main progression is independent of the optional garden/roof routes.

Optional greenhouse channel plus seed tin returns to Grace for shared SP-02 and a cosmetic Refuge garden, secured at the half boundary. SP-01 remains a personal physical rooftop find via three ordinary jumps; a lower catch has a walking return. Eighteen new stable Grace/Victor voice lines bring the catalog to 254. New entries only; existing recorded takes untouched. Grace uses the existing Ranger body with book detail; Victor uses Warrior with medal. Existing palace GLB, ivory/gold/green theme and chunk culling retained. New arches, greenhouse frame, benches, mosaic, planted edges and hanging greenery. Sunspire half-two/boss remain legacy content pending the next implementation batch.

Verification: story unit test covers four defense combinations, rude/apology and garden routes, atomic seed delivery and deduplication, mirror state, guards, shard IDs and VO graph. Browser courtyard test passes eight checks and 47 real controller waypoints. Combat/jump test verifies natural guard pursuit/damage, actual weapon hit, three normal jumps and shard collection. Co-op seven checks through actual message handlers: shared paused conversation, restored court/barriers, automatic NPC reward for guest, personal roof shard, guest mirror action, shared exit and banking. Checkpoint five checks: first-half death resets provisional reward/garden, infinite pad heals without draining, upper combat route works, entering next half banks both shards/garden, next-half death keeps them. Final browser runs disable HTTP cache after a stale visual module was caught. Route QA caught and fixed a greenhouse wall crossing and tiny stair increments; roof gaps shortened to fit ordinary jumps. NPC/control heights corrected; courtyard walls explicitly resolve their raised tops.

Shared story/authority, Rift ledger/Hall, music score, mob-module identity and Voice API regression tests pass. Real WebGL rendering checked in Emberdeep, legacy Sunspire half two, Duskmoor and Abyssal Descent after sharing the updated deep-art module URL. A pre-change save retained gold, class rank and checkpoint note with no duplicate notice. Ten new desktop/390px screenshots; phone has no horizontal overflow. Fully restored courtyard static art: 159,428 triangles / 3,426 instances in 89 chunks; sampled visible counts vary by viewpoint. This is not a hardware frame-rate benchmark. Human balance, mobile frame time and real-network latency remain to be playtested.

Preservation: private archive ../../decision-archive/2026-09-22-palace-courtyard has 171 messages, zero unparsed. Archive initially flagged U170 because its source file lacked the required heading; appended that heading, then validated all register references. No source wording removed. Date changed during session; grounded plan/source filenames retain September 22.

Next: Sky Library routes/rotating shelves, Hugh and Simon, crystalline rift history, remaining three Paladin shards, guardian challenge, then distinct Marble Colossus arena and post-boss orb vision. Follow latest canonical orb question and reveal limits; never use the superseded viewing-frame/eye-vision proposal. Do not claim the full approved queue complete.

## [Codex | 2026-09-23] Palace Courtyard production receipt
Main 307e230 deployed successfully as f5feba18-3378-4fbe-b348-ad6efb041dc9. Read-only production Chromium verified 2.017.0-palace-courtyard, courtyard modules/story HTTP 200, 254 Voice Studio catalog lines and all 122 gallery images decoded at 390px without horizontal overflow. No production saves or recorded takes changed. Next: Sky Library half two, remaining Paladin shards, Marble Colossus redesign and post-boss orb scene; those remain legacy/pending.

## [Codex | 2026-09-23] Sky Library

Sky Library implemented as 2.018.0; see IMPLEMENTATION_SKY_LIBRARY_2026-09-23.md for scope and tests. Next: Marble Colossus circular reading hall with protective screens and armor seals, followed by the orb’s one question, soul vision and Castle Duskmoor directions. No final-cut/Ian spoilers. Then Castle’s two halves and finale; dragon remains pending. Private archive ../../decision-archive/2026-09-23-sky-library has 173 entries, zero unparsed; U172 environment metadata, U173 continuation. Ten new preview images, 268 voice lines. Do not claim campaign overhaul complete.

## [Codex | 2026-09-23] Sky Library production receipt
Main c3dcfa3 deployed successfully as e7a2bfd7-70db-4921-9463-21a3daffb9cd. Read-only live Chromium verified 2.018.0-sky-library, library assets/story HTTP 200, 268 voice catalog lines and all 132 gallery images decoded at 390px without overflow. No production saves or approved takes changed. Next: Marble Colossus arena/combat and post-boss orb scene, then Castle Duskmoor. Current library half is authored; boss and orb remain pending.

## [Codex | 2026-09-23] Marble guardian and orb

2.019.0-sunspire-guardian: both Sunspire halves, five shards, custom boss and orb scene now authored. See IMPLEMENTATION_MARBLE_ORB_2026-09-23.md for evidence and limits. New modules marble-guardian.js / marble-guardian-art.js; story/sunspire-orb.json. Eight new VO lines (276 total), ten screenshots (142 gallery). Next: Castle Duskmoor half one, then spiral ascent half two, King phase logic and ending. Preserve Ian/final cut surprise; current orb identifies necessary linked-soul target without claiming his death alone restores everyone. New art uses shared deep-art.js?v=2017 identity; hero/world/npc versions2019. Archive ../../decision-archive/2026-09-23-marble-orb has174 entries. Current changed continuity may include previous production receipt.

Production receipt: ae85236 pushed to origin/main; Cloudflare Pages completed successfully. Read-only live browser verification confirmed 2.019.0-sunspire-guardian, all three new assets HTTP 200, 276 Voice Studio lines and 142 gallery images decoded with no 390px horizontal overflow. Next: Castle Duskmoor infiltration/disguise first half, then spiral tower ascent. Full campaign queue remains unfinished.

## [Codex | 2026-09-23] Castle Gates

2.020.0-castle-gates authored. New castle-gates.js / castle-gates-art.js and story/castle-gates.json; scene key castleScene, shared deep-art cache stays ?v=2017, hero/world/npc versions2020. Eleven new previews, 292 VO lines. Latest requirements and full remaining scope stay in register. Next: Long Ascent (Miles, epic central spiral, optional service vault/rescue, CD-03..05), then final King and ending. First-half entrance reward 180 gold on either route; optional return CD-01 or keep rare chest; CD-02 physical. Existing second half/finale still legacy. See implementation doc for tests and limits; no blanket campaign-completion claim.

## [Codex | 2026-09-23] Castle Gates production receipt
Main 58b33e7 deployed successfully as 95961ab1-18a4-4044-9906-8f883e2d4637. Read-only production Chromium confirmed 2.020.0-castle-gates, all three new assets HTTP 200, 292 Voice Studio lines and all 153 gallery images decoded at 390px without horizontal overflow. No production save or recorded take modified. Next: Long Ascent with Miles, central spiral, service vault/rescue and CD-03..05; final King and ending follow. Remaining full requirements stay open as documented.

## [Codex | 2026-09-23] Long Ascent
2.021.0-long-ascent authored. New long-ascent.js/art/story JSON; castleScene prefix ascent:. World/npc cache2021; shared deep-art cache remains2017. Nine Miles lines,301 total. Ten previews,163 gallery total. CD-04 shared independent rescue,CD-03 vault physical,CD-05 memorial physical. Refuge ramparts at boss-entry checkpoint. New stacked-storey seating narrowly gated by G.ascent. Main route260 checkpoints,combat9,co-op8,checkpoint3,pre-change save and regressions passed. Plan/evidence docs/IMPLEMENTATION_LONG_ASCENT_2026-09-23.md. Latest continuation U176 private archive checked. Next final King/ending; dragon and larger queue still pending.

## [Codex | 2026-09-23] Long Ascent production receipt
Main 8d68cdd deployed as 21e652e3-0775-4c63-b546-e6087d34a77e. Read-only production Chromium confirmed 2.021.0-long-ascent, new module/art/story HTTP 200,301 Voice Studio lines,163 gallery images decoded at390px with no horizontal overflow. No production save or recorded take modified. Next final King arena/phases and Ian/Space-charge/restoration ending; single summit Hollow Gate presentation belongs to that batch.


## [Codex | 2026-09-23] Final King and restoration
2.022.0-final-king authored. New final-king.js/art/story JSON, hero/world/mob/NPC/prop/companion cache2022 consistently. Shared deep-art stays2017. Twelve new lines,313 catalog total. Six finale browser previews (spoilers). Tests and limits in IMPLEMENTATION_FINAL_KING_2026-09-23.md. Main campaign now has the authored finale; do not call the whole queue finished. Next audit remaining approved optional rewards/dragon, hub return dialogue and end-to-end campaign balance/navigation. Never skip unfinished register items. Exact continuation U177 archived; U176 source heading corrected (content was present).


## [Codex | 2026-09-23] Final King production receipt
Main b6054ae deployed as 458aea55-71c7-4118-ba6f-893fe44440e0. Read-only production Chromium verified 2.022.0-final-king, all three finale assets HTTP200,313 Voice Studio lines and169 gallery images decoded at390px without horizontal overflow. No production save or voice take changed. Main campaign finale is authored; optional dragon/rewards, broader equipment/cosmetic audits and complete campaign human balance/navigation QA remain open as recorded.


## [Codex | 2026-09-23] Return visits — implementation and verification
Version 2.023.0-return-visits. Smith: Tools for Tomorrow in Iron Halls after Emberdeep; cool box, release clamp, recover pattern. Quartermaster: Food for the Refuge in Broken Walls after Keep; use marked weights to lower supplies. Objects exist only for accepted requests. Recoveries bank on half completion, deliveries save immediately and pay once; tool rack/supply stacks show the result. Requests use shared conversation authority, services stay directly accessible. Hub news follows Keep/Emberdeep/restoration; introductions are save-local with old-save migration. 27 new stable voice IDs, 340 catalog lines, six browser previews (175 total). Existing recorded lines unchanged.
Validation: solo browser 14 checks; controlled two-page co-op relay 7 checks (not a live WebRTC session); actual UI/reload/new-save checks 7; all nine field objects reached by local controller movement, not a full level traversal; pre-change b6054ae save fixture retained progress and introductions. Pure quest graph/idempotency, story-state, authority, Voice API, Iron Halls, inline syntax and diff checks passed. Phone 390px has no horizontal overflow or page errors. Recovery rewards do not occupy bag slots. Corrected duplicate generic prop drawing and unintended emissive materials. Full campaign balance and human multiplayer playtesting remain open.
Next: remaining approved companion/dragon rewards and related side adventures; keep the broader register open. Dragon mounted-player attacks remain an unanswered optional design question; no dependent behavior implemented.


## [Codex | 2026-09-23] Return visits production receipt
Main e92f6df deployed as 832c5af4-2790-4da5-b007-acda8e49abc1. Read-only production Chromium verified 2.023.0-return-visits, new assets HTTP200, 340 Voice Studio lines and 175 gallery images decoded at390px without overflow. Production saves and recorded takes untouched. Roadmap receipt consolidated into the existing root UPDATE_ROADMAP.md by byte append; accidental duplicate docs/UPDATE_ROADMAP.md removed. Remaining companion/dragon rewards are next; mounted attack question pending.


## [Codex | 2026-09-23] Sunspire nesting rescue — 2.024
Implemented Wings Above the Clouds: western terrace climb, lower supply branch, guarded winch, support-beam/net release puzzle, food/trust interaction and return crossing. Simon has four new optional lines; environmental notice permits discovery without him. No main objective or shard depends on rescue. Sunspire Dragon is a hidden quest-only ground companion, shared rescue reward provisional until Sky Library completion, no automatic equip or repeated reward. New articulated browser-native mesh has 4,163 triangles; static pieces merged within joints/materials. Short directional fire breath winds up, hits up to three nearby enemies once, respects height/walls and player scaling. Peer dragon model and breath pose data use existing multiplayer snapshots. Existing recorded text is unchanged. Voice catalog344; seven new gallery images,182 total. Interactive phone-friendly /3d/dragon-preview.html shows rest/walk/trapped/breath poses.

Evidence: pure rescue ordering/idempotency/optional independence and breath delay/cone/height/wall tests; 11 browser rescue/death/bank/equip/reload checks; 69 controller waypoints over four new routes; real handler pursuit/attack and independent dragon damage (12 player damage/118 enemy damage in focused fixture, not balance sign-off); ten controlled two-context multiplayer-handler checks including guest interaction, both rewards, duplicate safety and remote model. Pre-change 28b43c0 save retains companions, return ledger, class/gold and checkpoint clue. Existing library regression12 checks/41 waypoints and all shard routes pass; story reducer/authority/Voice API/inline syntax checks pass. No captured page errors. UI fits390px. Review gallery for staged browser views; model viewer is an isolated rig preview, not an in-game camera.

Explicitly unfinished: mount button, rider stance, limited flight, mounted combat choice and gate-bypass protections. COMP-03 remains open. Existing companion follow movement remains inherited; this is not a global companion navigation fix. Human combat balance, actual WebRTC latency and low-end device performance remain unverified. Next independent approved work: Beastkeeper tracking return adventure and Thomas keepsake; mounted behavior still needs the pending user preference. Do not silently infer its answer from a continuation request.


## [Codex | 2026-09-23] Dragon rescue production receipt
Main 1e1aedb deployed as 031ccbd6-89bb-46b4-96e4-efae46735b4e. Read-only production Chromium verified 2.024.0-dragon-rescue, all new assets200,344 Voice Studio lines,182 gallery images decoded at390px without overflow. Public dragon viewer responds to Walk, reports4163 model triangles and fits390px. No production save or recorded take touched. COMP-03 mount/flight remains open; next independent tasks Beastkeeper tracking and Thomas keepsake.


## [Codex | 2026-09-23] Home and animal tracks — 2.025
Implemented the remaining approved Beastkeeper/Thomas return hooks. A Kinder Trail unlocks after earning a secret companion; follow tracks west of the Black Woods grove, release both animals in either order, finish the half and report back. Care shelter adds 10% companion maximum HP with a visible hub shelter and explicit menu stat. A Small Piece of Home unlocks after Ruined Keep; Thomas appears in the Waystation with optional pride/worry dialogue, asks for a carved bird hidden behind the southwest Homefields house, and displays it beside his bench after delivery. Base reward 250 gold. Both use shared quest authority and half-boundary banking, stay optional, and introduce no adoption/Bladeborn spoilers. These reward values are implementation tuning, not new user decisions.

Evidence: 14 live-browser quest/death/bank/reload checks; 11 two-context multiplayer-handler checks including guest without unlocks, owner authority, shared rescue/delivery and duplicate protection; 9 woodland controller waypoints with walking/jumping plus 5 Homefields approach points. Existing Black Woods main objectives and shard routes pass (11 checks). Pre-change d77d693 save retains class/gold, pet ownership, return ledger, hub introduction and checkpoint clue. Pure quest/reducer/authority/Voice API and inline syntax checks pass. All existing return dialogue nodes remain byte-equivalent as parsed data; 15 new lines, catalog359. Six browser gallery previews,188 total, phone dialogue fits390px. Fixed missing Thomas fallback marker color and moved keepsake out of roof camera occlusion.

Limits: controlled handler relay is not real WebRTC latency QA; no claim of whole-campaign balance or low-end performance sign-off. Rescue animals reuse the existing shepherd rig and remain local scenery after release. Mounting, rider pose, limited flight and mounted-combat decision remain OPEN. Next independent work: audit remaining requirements and full campaign navigation/combat regressions, with equipment/cape/trail issues still tracked. Exact U180 preserved in USER_SOURCE_2026-09-23_HOME_TRAILS.md; private archive has180 messages,zero parse errors,valid source references.


## [Codex | 2026-09-23] Home/tracks production receipt
Main97333f5 deployed as73601893-eca8-4969-830e-c8dfcb59d383. Read-only production Chromium verified2.025.0-home-trails, all new assetsHTTP200,359 Voice Studio lines and188 gallery images decoded at390px without overflow. No production save or voice take modified. Next: reconcile the remaining trial/Pyromancer, mount and equipment/cosmetic work against its approved design boundaries; do not count these as completed.


## [Codex | 2026-09-23] Party trials — 2.026
Implemented shared entry and completion for the seven existing earned class trials. Every participant requires personal Rift access and must gather in the Hall. Guest requests are host-validated; mentor dialogue, enemy progress and teaching sync under a dedicated session identity. Existing party HP scaling applies. Local equipment escrow, duplicate/stale message protection, completion receipts, abandonment, disconnect and existing hardcore wipe semantics are preserved. Starter tutorials remain solo.

Evidence: 34 two-context multiplayer handler checks, seven solo mentor/reward/loadout checks, nine Hall co-op checks, eleven return-adventure co-op checks, hardcore exit, pre-change save preservation, story/Rift/authority/Voice API tests and inline syntax passed. Three staged browser previews; gallery191. Voice Studio remains359 lines; no recorded text changed. Controlled relay is not an internet WebRTC soak test or combat balance certification. Trial arenas, Pyromancer kit, mounts/flight and remaining equipment/cape/trail audit remain open. Exact U181 archived with181 messages,zero parse errors and valid source references.


## [Codex | 2026-09-23] Party trials production receipt
Main 7e4537e deployed as 36d3a8d6-1bb0-4af1-9259-82f6eef0a826. Read-only production Chromium verified 2.026.0-party-trials, HTTP200 runtime assets,359 Voice Studio lines and191 gallery images decoded at390px without horizontal overflow. No production save or voice recording modified. Remaining trial encounter design/Pyromancer, mounts and equipment/cosmetic work remain open.


## [Codex | 2026-09-23] Cloth and motion cosmetics — 2.027
Implemented VISUAL-COSMETICS-01 cape/trail visual batch. Seven existing capes now use 117-vertex/192-triangle constrained cloth with animated shoulder/hip/leg clearance, garment clearance, woven texture, distinct emblems/hems and class-colored trim. Five trails use bounded actual-movement samples: soft dust, rising embers, frost stars, paired void ribbons and ghost wisps. Trails fade, clear on teleport/scene change, and obey particles-off. Existing cosmetic IDs, unlock rules and saves retained. Appearance now travels through peer presence; separate rigs, mirror and dash pose copies show their cape. Old voxel fallback retained. Standalone cosmetic-preview.html uses the same renderer on six original bodies, eight motions, phone controls, and never reads/writes saves.

Evidence: 48 body/motion checks, seven cape swaps, five trail checks and stop fade; all16 class palettes/capes in the live game mirror; peer packet/rig isolation, invalid IDs, particles-off, teleport and scene clear, cleanup, equipped cosmetic reload and pre-change campaign save all passed. 34 co-op trial regressions passed. Local old/new hub median frame time16.6/16.7ms, p9517.2/17.3ms (90 frames each); added384 rendered triangles in this view includes the reflected cape. Isolated cloth/trail update averaged0.10ms over300 calls. These are local measurements, not low-end hardware certification. Browser screenshots inspected across all body types, selected moving/casting/jump poses, all cape/trail designs. Gallery198; Voice Studio359 unchanged.

Limits: bounded cloth approximation, not full garment/weapon/environment collision. No claim of zero clipping in every weapon/skill pose; weapon fitting remains its own audit. Wider level z-fighting remains open, as do exact earned-trial scripts/Pyromancer and mounting/flight. This batch does not change combat difficulty or settle those designs. U182 archived:182 messages,zero parse errors,valid references in private cloth-motion-verified snapshot. U181 heading corrected for validator without changing its original text.


## [Codex | 2026-09-23] Cloth motion production receipt
Main9052ac7 deployed as c4946e69-2d1e-46a0-8e68-da636e48e4c6. Read-only production Chromium verified2.027.0-cloth-motion, new assetsHTTP200,359 Voice Studio lines and198 gallery images decoded at390px without overflow. Public cosmetic preview loads models, animates Run with Frost Trail, has finite192-triangle cloth and fits390px. No production save or voice take touched. Next focused independent work: remaining weapon-fit/animation audit; exact trial scripts/Pyromancer, mounts and wider level surface audit remain open.

## [Codex | 2026-09-23] Weapon release and teammate motion — 2.028
Charged dagger now uses a short blade projectile, the existing thrown-weapon hide/recovery lifecycle, and the existing forward release clip in both the main picker and combat effects pose layer. Every accepted charge release advances its swing serial exactly once, including fallback/peer paths; rejected off-class releases do not. Damage/range/access and anatomical grip offsets are unchanged.

Peer presence now carries sanitized render-only velocity, grounded state and casting pose through host relay. Teammates show casts, running and jumps rather than always-grounded placeholder walking. Cast timers age between packets; old packets without motion retain previous fallback behavior. No movement/damage authority change.

Verified: 64 asset/body fits and448 poses without grip failures;30 repeated charge releases across10 weapons; dagger mesh hide/restore and packet roundtrip for Ranger/Ninja/Pirate; off-class rejection; seven Pirate hand/muzzle poses; three javelin two-hand release cases;11 two-browser motion checks including actual rig clips, relay, expiry, invalid fields and legacy packets;34 two-browser party-trial regressions with zero page errors. Pre-change save retained class rank, gold, companions, dialogue intro state, return-visit state, checkpoint and journal clue. Syntax checks passed. Local Python server lacks voice-api/game (expected404); this is not a production voice failure. Screenshots inspected locally.

Limits: controlled browser relay, not internet latency/packet-loss soak testing. Existing imported clips reused, no new animation asset authored. Crossbow still uses a bow asset and needs a deliberate model/pose correction; wider skill/weapon contact poses remain an audit, not a blanket zero-clipping claim. Exact trial scripts/Pyromancer, mounts/flight and wider level surface audit remain open. U183 private archive has183 messages,zero parse errors,valid references.

## [Codex | 2026-09-23] Weapon motion production receipt
Main ac39108 deployed as6dd493c6-1def-4414-aea1-61b89c1e4a4a. Public read-only Chromium verified2.028.0-weapon-release, updated hero/combat-art assetsHTTP200, dagger and motion code present, hero ready without renderer error. No live save or voice recording modified. Next equipment work: crossbow model/pose mismatch and remaining moving grip interactions. Trials/Pyromancer, mounts and wider surface audit remain open.

## [Codex | 2026-09-23] Crossbow identity and grips — 2.029
Replaced the cross archetype's incorrect longbow stand-in with a wood/iron crossbow based on its existing icon. Compact stock clears the torso better; trigger palm and under-stock support use existing anatomical anchors/IK. Aiming, moving fire, string release, recoil and bolt hide/reload replace bow-draw gestures. Full-body skill/jump clips retain freedom to release the support hand. Element tint affects metal while preserving wood. Model uses300 triangles, two merged vertex-colored meshes and one string (three draw primitives). Equipment swaps dispose all three owned geometries/materials. Preferred existing player/weapon assets, damage, range, shot count, inventory IDs and class access unchanged.

Also fixed WeaponPalmGrip and CrossbowBolt visibility on mirror/pose copies, so thrown weapons and bolts hide and return along with the source rather than retaining clone-time visibility.

Evidence:48 crossbow poses across Ranger/Ninja/Pirate/Skylancer/Bladedancer/Beastmaster; palm containment zero measured offset outside hand bounds, support error below0.000001 rig units in supported poses, forward axis>.98 during shooting. Real charged dispatch emits its projectile without a conflicting heavy swing. Existing64 asset/body fits and448 pose checks pass. Peer firing support, mirror bolt/throw recovery, disposal and three-primitive checks pass. Seven element/neutral palettes preserve wood and restore neutral color. Pre-change campaign save preserves rank, gold, companions, dialogue introduction, return state, checkpoint and clue. Syntax and diff checks pass. Seven new browser previews visually inspected across bodies/moving poses; weapon gallery74 images decode at390px without overflow.

Limits: sampled poses and existing imported full-body clips, not a claim of zero clipping in every possible skill frame. No internet latency soak test or low-end device performance certification. The300-triangle/three-primitive budget is a model count, not total scene cost. U184 archived privately with184 messages,zero parse errors and valid source references.

Next independent approved batch: FX-02/global level surface and z-fighting audit (both halves and boss arenas, moving/near/far views). Earned-trial scripts/Pyromancer and mounts/flight still have unresolved design details and remain open. Do not silently invent those designs.

## [Codex | 2026-09-23] Crossbow production receipt
Main d8131e8 deployed as996293f5-ec5d-4eaf-88b9-df0238391637. Read-only production Chromium verified2.029.0-crossbow; hero/grips/crossbow/combat-art assetsHTTP200; hero ready without renderer error. Weapon gallery74/74 images decoded, including seven crossbow screenshots, at390px with no overflow. No live save or recorded voice modified. Next: global level surface/flickering audit.

## [Codex | 2026-09-23] U186 — weapon scale direction and music email
Approved for next weapon visual pass: slightly oversized silhouettes for most weapons, bounded by body clearance and secure hand grips. Keep daggers clearly smaller than swords and greatswords much larger; give spellblades a distinct intermediate visual identity. Exact multipliers not locked. Preserve preferred assets, enlarge blade/head portions where possible rather than blindly scaling handles/support anchors. Verify moving, attack, charge and skill poses across supported bodies. Make every elemental weapon visually color-coded. Review potential elemental-system improvements; do not treat this exploratory request as approval to change existing damage/status balance or add affinities.

Current inspected system: Fire/Frost, Poison/Arcane, Holy/Void opposition pairs; matching-element damage0.6, opposing1.5. Existing renderer has element tints; consistency/readability across models remains the audit. Storm/lightning are migration aliases to Arcane, not new active affinities.

Music list emailed to the explicitly requested recipient through Gmail; SENT receipt1a0d0ce62699de5c. Includes all14 recommendations, the six-piece priority batch, current coverage and creation notes. All40 desktop MP3s verified exact and tracked; live music router matches repository after newline normalization. Alternate Waystation Refuge remains unused; edited Wayfarer's Hearth is the hub theme. No runtime changes in this decision-recording turn. Weapon scale pass is queued alongside the existing global surface audit; neither is claimed complete.


## 2026-09-23 � 2.030 weapon presence (U186/U187)
Implemented family-specific blade/head growth while preserving hand/support zones and rear shafts. Greatsword ~2.10 normalized units, sword ~1.39, dagger ~0.69, spellblade ~1.57. Pirate saber/barrel and crossbow forward limbs increased modestly. No additional triangles or combat range/damage changes.
Unified six-element colors and legacy storm/lightning aliases. Fixed missing mirror recoloring, saturated/gold surfaces and textured staff-head coloring; natural grip colors remain. Signature materials now retain their ownership during transitional recoloring, fixing disposal on equipment swaps.
Validation: 64 asset/body fits across 448 poses; 96 protected geometry samples; Pirate seven-pose containment/forward aim; crossbow 48 pose checks; 23 imported models x six elements (138 checks) plus 23 aliases; crossbow disposal (3 geometries/3 materials), mirror visibility and peer support; pre-change save retained pets, rank, gold, hub introduction, return state, checkpoint and journal clue. Syntax and diff checks passed. New phone gallery has 15 current screenshots alongside 74 historical images. Screenshots are sampled poses, not a guarantee of zero clipping at every animation frame.
Remaining separate work: global level surface/z-fighting review; outstanding trial/Pyromancer and mount decisions remain outside this batch. Production receipt follows after deployment verification.

### Production receipt — 2026-09-23, 2.030
Main 7e701fc deployed as 318557df-7171-4cca-a2e2-a4cb39b1b1cb. Read-only production Chromium confirmed 2.030.0-weapon-presence, all four changed module URLs HTTP200, hero ready without renderer error. Phone gallery: 89/89 images decoded, no horizontal overflow at390px. Additional local repeated-equip check: all five owned Claymore geometries disposed on each of three swaps, stable1528 vertices. No production saves or voice recordings modified. Next: global surface/flickering audit.


## 2.031 validation and scope
Shared fallback ground now splits partial segment overlaps before tiling. Keep roof crossbeams were emitted once per supporting post (two copies per beam); both the upper Keep and prison loops now emit each beam once. Frost mountain supports now deduplicate identical x/z/size/top bodies while retaining every collision obstacle.

Browser inspection covered 24 campaign scenes (two halves and boss per eight zones), with no page errors. Refined instance scan ignores unused capacity and zero-scale occlusion instances. Six duplicate Frost peak meshes and four duplicate Keep beams were found; corrected Frost and Keep part1 passed the full scan, and targeted prison recheck returned zero duplicates after its final correction. Stored JSON is the scan before the final two prison beam fixes, deliberately retained as evidence. Exact-transform scans do not detect every partial intersection.

Shared floor fixture:253 rendered instances in one draw call. Rectangle test verifies11100 units of union area, no positive-area overlap and sampled coverage. Pre-change save retained gold, rank, companions, return state, hub introduction, checkpoint and clue. Syntax/diff checks passed. No gameplay, collision, dialogue or progression changes.

Remaining: near/far moving-camera review of decorative intersections, transparent layers and boss effects. This batch is not a claim that every flicker across the game has been eliminated.

### Production receipt - 2.031
Main4fdaeb2 deployed as fde1113e-f5ca-4dfe-a582-45c3efc1d6c1. Read-only Chromium confirms2.031.0-floor-surfaces; hero/world/keep/frost modules HTTP200 and renderer ready without error. Existing89-image phone gallery still decodes without overflow. No live save or VO data modified. User archive188 messages,zero parse errors,valid references. Remaining global moving-camera/transparent-surface audit is explicitly open.


## [Codex | 2026-09-23] 2.032 adventure feedback (U189)
Journal now prioritizes the next main task and three recent current-half clues, with older clues, prior-half notes, optional tasks, items, shards and completed work in folded sections. Existing notes remain intact. Story objects remain inspectable before prerequisites; Briar roots, dressings and tools can be collected early. Collected objects use existing consumed flags; notices/toasts acknowledge actions and repeatable puzzle interactions. No-effect conversation loops now offer Leave conversation and preserve the cursor for reopening.

Added 16 story-related optional combat tasks, one per campaign half. Selected ordinary ground patrol slots replenish after 25 seconds when players are nearby but not standing on the spawn. Quest guards remain finite. Keep halves and the final ascent have finite quotas; other halves have one to three refill slots. Four suitable first-half areas receive named elites (Briar, Emberdeep, Storm Coast, castle approach). Existing elite renderer and behavior retained. Campaign player XP is 1.5x and class XP is 3x its prior rate; other modes retain their rates. Fixed quick-loot armor bypass of shared rarity levels1/5/12/20/30. These initial rates still need full campaign balance playtesting.

Validation:13 browser UI/progression checks,9 live patrol/reward/checkpoint checks,11 co-op story checks, combat/journal regression,16-half spawn audit, pure story/authority/journal/combat tests and syntax passed. Pre-change save retained rank, gold, pets, introductions, return progress, checkpoint and clue. Six face models rendered with optional faceDetail=1; gallery /3d/art-previews/faces/ provides comparison. Faces are a modest detail preview, not a global replacement or complete remodel. Static local server lacks voice-api/game, causing expected HTTP404 audio-catalog requests during mirror previews; no JavaScript exception was observed. Source archive189 messages,zero parse errors,valid references.

Voice catalog audited read-only:359 lines,48 speakers,10441 words,55491 characters,about75 minutes at140wpm,0 approvals,2 stored takes untouched. Concise ElevenLabs email sent to isaac2055@gmail.com (Gmail SENT1a0d0efec0035c50). No paid generation initiated. Full campaign pacing, dedicated miniboss mechanics, a full face redesign and remaining global moving-camera z-fighting review are still open; this batch does not claim completion of the entire production queue.


## Production receipt - 2.032
Main39604d1 deployed as31973a90-1be4-40a3-abb0-a875acf555bc. Read-only Chromium confirms2.032.0-adventure-feedback, patrol module present, renderer ready with no renderer error. Six face preview images decode at390px without horizontal overflow. Live saves and voice recordings untouched.


## [Codex | 2026-09-24] U191 — default NPC speech and continuation
User approves the face detail improvement and requests default device text-to-speech for existing lines without recordings, varied voices and male/female differentiation where available, followed by unfinished approved work in an efficient long session. Approved recordings remain primary; no paid generation or publishing of unapproved takes. Explicit existing speech-off preference remains respected. Plan: shared stable speaker voice selection, delayed voice discovery, safe cancellation/error recovery, settings default-on, approved face detail default-on, browser lifecycle/co-op/save regression; then continue the outstanding surface audit.


## [Codex | 2026-09-24] 2.033 — character voices and transparent effects
Default device speech now covers unrecorded hub/campaign/trial/finale dialogue through the shared presenter. Approved audio remains first; audio failure falls back once. Explicit speech-off preference and sound-effects mute/volume remain respected. Stable speaker hashing chooses English system voices, preferring recognized male/female voice names; mild delivery differences reflect character tone. Device APIs have no gender field and available voices vary. Delayed voice discovery, cancellation on exit/line change, errors, and an end watchdog keep subtitles and mouth state usable. No paid voices generated; no stored takes changed. Approved face detail is default; faceDetail=0 remains a comparison option.

Continuation: Hydra translucent jet and Rift Hall label planes no longer write depth, preventing their translucent fragments from hiding later transparent effects. Depth testing remains enabled. No combat or collision changes.

Validation:18 browser speech lifecycle checks (controlled voices),11 co-op story checks, pre-change save preservation including explicit speech-off, pure story/authority/Hydra/Rift Hall tests and syntax checks passed. Native browser exposes speech APIs but no named voices in this test context: acoustic quality and actual male/female availability are not certified.48 sampled near/far views across24 campaign scenes rendered without page/renderer errors; active Hydra blast and all8 Rift labels pass material assertions and screenshots. These are sampled views, not an exhaustive moving traversal or proof that all flicker is gone. SourceU191 recorded verbatim.

Next: broader route-by-route visual/combat playtesting and progression balance; dedicated miniboss mechanics and the unresolved earned-trial/Pyromancer/mount design work remain open. No claim that the whole production queue is complete.


## Production receipt - 2.033
Main15a23ac is live. Read-only Chromium confirms2.033.0-character-voices, speech selector loaded, renderer ready without error, and all five changed speech/face/effect modules HTTP200. Face detail defaults on. Live saves and recordings untouched. Source references validated; private archive191 messages includes U190 environment and U191 exact user instruction, zero unparsed lines.


## [Codex | 2026-09-24] U192 — progression/combat continuation
User: Go ahead with a long work session. Don’t waste usage
Grounded continuation of U189: initial roster plus two combat tasks per level and Hydra rescue projects one rank10 class by finale under2.4 class XP/raw XP, rank7 by Frostfell. Player progression projects level10 by Frostfell and15 by finale; keep player rate1.5. Increase campaign class award to4/raw XP, retain other modes. Verify through actual gainXp with per-award class switching at10. This budget excludes dynamic quest waves, repeat farming and optional discoveries; not a timed human playthrough.
Found concrete co-op defects: noteKill runs before Bones resurrection, incorrectly advertising a death; guest applying host kill can resurrect its local Bones and loses later kill packets. Guest recreated elite uses its local base XP instead of host kill packet XP. Correct death authority and test both clients. Patrol re-spawns leave every old dead object in G.enemies; prune only retired patrol corpses after the existing fade, keeping authored story enemies.


## [Codex | 2026-09-24] 2.034 validation and remaining work
Campaign class XP per raw XP increases from 2.4 to 4; player XP remains 1.5. Actual per-award gainXp simulation reaches player levels 5/7/8/10/11/13/14/15 by campaign zone, first class ranks 5/7/8/9/10 then second class ranks 6/8/9 in the final three zones. This is a reward-budget projection, not a timed natural playthrough; dynamic waves, repeat farming and optional discoveries are excluded.
Verified combat in all 16 level halves; Furnace guards activate after their intended alarm. Two-client Bones resurrection/final death/duplicate packets and recreated elite XP pass. 900 patrol refills retain bounded body objects and death fades. All four named elite plates render at full HP, including phone viewport. Existing 2.033 save fixture retains progression, journal, intro state and explicit speech-off setting. Adventure feedback (13 checks), patrol runtime (9), story state/authority, syntax and diff checks pass.
Remaining: distinct elite/miniboss movesets and broader natural-route visual/playability audit. No claim that the whole approved queue is complete.


## [Codex | 2026-09-24] Production receipt
Commit c355f0a pushed to main. Read-only Chromium fetch from https://bladefall.pages.dev/3d/ confirms 2.034.0-campaign-training, campaign class rate 4, named elite bars and updated patrol retirement module (HTTP 200). Local regression results above; production check does not alter saves or recordings. Private source archive contains 192 user messages with zero unparsed records and valid requirements references.


## [Codex | 2026-09-24] U193 — named elite encounter continuation
Continue U189 optional miniboss requirements: four existing named ground elites get distinct attacks, readable danger shapes, locked aim, recovery windows, existing obstacle/edge checks, host-selected attacks and per-player damage checks. No new main-story, loot or class decisions. Plan: Raid leader directional sweep; Forge captain expanding jumpable ground pulse; Shore raider three aimed lanes with gaps; Tower captain cross-shaped strike with diagonal safe spaces. Existing authored positions/HP/rewards stay. Replace random base role (including exploding role) on these named units so identity is reliable. Verify damage bounds, warning/recovery, co-op state/dedupe, pause/stun/death, terrain support, rendered cues and save compatibility before main. These are implementation choices under approved miniboss scope, not newly attributed user decisions.


## [Codex | 2026-09-24] 2.035 implementation and validation
Four existing named campaign elites now use distinct host-owned encounters: Raid leader front sweep (.95s warning), Forge captain expanding jumpable pulse (1.2s), Shore raider three locked shot lanes (1.15s), Tower captain crossing lanes (1.25s). Each has a 1.15-1.5s recovery opening. Random base roles and their speed bonuses are removed from these named bodies. Health/reward budgets unchanged. Existing heavy knight, archer and royal spellcaster models/animation families match forge/shore/tower attacks; no new model files.
Shore raider moved from the narrow sloped wreck approach to the existing wide work beach (-180,-1100,y30), away from Otto and Rose. The initially tested upper wreck position was rejected after screenshots showed timber occlusion. Named spawn heights settle to their supported surface; warning marks follow nearby terrain. Solid props, walls and closed doors block hits. Warning shapes are independent of particles settings. One hit per player/pet per attack serial; dodge, vertical clearance, death, stun and pause remain respected. Guests use host phase snapshots and cannot receive a catch-up strike when they missed its warning.
Validation:22 pure phase/geometry/cover checks; four actual positioned elite encounters (warning, stun, damage, recovery);12 browser defense/lifecycle/chase checks;16 two-context co-op phase/replay/missed-warning checks; seven existing co-op kill/reward checks; corrected sixteen-half combat smoke test; previous save keeps gold, class rank, pets, return quests, hub intro, checkpoint, clue and explicit speech-off preference. Story authority, patrol/refill tests and syntax/diff checks pass. Screenshot review across four warning shapes plus phone view; /3d/art-previews/encounters/ has four decoded images with no390px overflow.
Evidence correction: the earlier half-combat harness used nextArea and silently remained at Castle Gates for its Long Ascent row because the story gate was incomplete. This batch explicitly loads and asserts each requested scene; the actual Long Ascent passes. Earlier progression budget scripts already used explicit scene loading, so their estimates are unaffected. These are targeted simulation/scene checks, not a full natural campaign playthrough or internet latency soak.
Remaining: broader natural-route puzzle/shortcut/quest playability and moving-camera visual audit. Trial/Pyromancer kit and mounted combat/flight decisions remain open. This batch does not complete the entire approved queue.

Final integration check: weapon knockback remains active and strong knockback interrupts a locked strike, preventing damage from the abandoned attack origin. Guest bodies face the shared aim during warnings/strikes. Defense suite now13 checks.


## [Codex | 2026-09-24] 2.035 production receipt
Main b496a5a deployed. Read-only production Chromium confirms2.035.0-named-encounters, all four encounter kits, renderer ready with no error and three runtime module URLs plus preview page HTTP200. Live phone gallery decodes all4 images with no390px overflow. Live saves and recordings untouched. Private source archive193 user messages,zero unparsed records,valid requirements references. Next: broader natural-route puzzle/shortcut/quest-transition/camera audit; unresolved trial/Pyromancer and riding decisions remain separately open.


## [Codex | 2026-09-25] U195 — co-op combat visibility
User explicitly requests visible teammate skills, all weapon attacks and projectiles. Inspection: presence already carries body/cast poses, but cfx only relays basic projectile arrays and shockwaves. New combatArt identity effects are never relayed; persistent defense presentation only reads the local player. Implement bounded visual-only effect transfer, persistent teammate defenses, retained projectile styles, shockwave height/timing, scene isolation and duplicate suppression. Never execute remote SKILL_FX or duplicate combat damage. Verify all configured skill profiles, basic/charge weapon families, body poses, relay/echo and scene changes in real browsers; preserve saves.


## [Codex | 2026-09-25] Co-op combat presentation — 2.036
Added visual-only relay for all 128 configured class skill identities and basic/charged weapon effects; persistent peer shields/guards; projectile spin and elevated/delayed shockwaves. Capture shots before collision removal. Scene checks and bounded duplicate suppression avoid replay across scenes. Browser two-context serialized host/guest relay: 8 checks passed (128 skills, 28 weapon effects, 15 projectile styles, poses/defenses, no damage replay, other-guest relay, dedupe, stale scene rejection). Existing co-op kill/reward regression: 7 passed. Pre-change save fixture preserved checkpoint/clue, pets, rank, gold, hub intro, return visits and disabled speech. This is controlled browser relay testing, not a two-device internet latency soak.


## [Codex | 2026-09-25] U196 — party travel and navigation
Approved interruptible held teleport, teammate cycling and distant-party hint; gold main-objective arrows and cyan friend arrows; Mac movement input investigation. Exact source: requirements/USER_SOURCE_2026-09-25_PARTY_NAV.md. Grounded plan: IMPLEMENTATION_PARTY_NAV_2026-09-25.md. Teleport uses T for three seconds, Y cycles; both rebindable. Same scene only, no PvP/ship/finale scene skips; supported landing; movement/hits/release/menu/focus loss interrupt. Independent saved arrow toggles. Keyboard code fallback and held-key focus cleanup preserve existing bindings; exact Mac symptom not reproduced on the development PC.


## [Codex | 2026-09-25] 2.037 validation
Three-second hold T teleports beside selected same-scene teammate; Y cycles. Hits, motion, release, lost target, menus and focus loss cancel, and hit cancellation requires release before retry. No safe floor / airborne target rejects arrival. Rising violet rings and cast pose replicate; completion serial snaps remote models. Gold main-task arrows across sixteen halves, cyan party arrows including downed friends; independently saved settings. Explicit quest targets follow progression and collected-item turn-ins, leaving optional secrets hidden.
Browser checks:43 channel/input/presence/initial-target assertions;61 later-state destinations and turn-ins;settings persist after reload;previous-save checkpoint/clue/rank/gold/pet/intro/voice-off regression passes;128-skill/28-weapon/15-projectile co-op relay regression passes. Reviewed local charge and objective-marker screenshot; inset edge markers away from right-side controls. Syntax checks pass. Keyboard fallback tested with absent/Unidentified code and uppercase keys; exact remote Mac failure not reproduced; Mac browser clarification pending. WebKit executable unavailable locally. No claim of native Mac or internet-latency verification.


## [Codex | 2026-09-25] U197-U198 — selected co-op saves, hub services, Brave input
Exact source: docs/requirements/USER_SOURCE_2026-09-25_PARTY_SAVES.md. Host and Join must offer saved characters and enter directly with that character's level, class rank and equipment. Hub quests must not block services; Beastkeeper purchases require the Black Woods two-animal rescue. Friend uses Brave on Mac; A/S/D still fail in open space. No permission to reset saves. Private archive contains 198 user messages with zero unparsed records and valid source references.

Implemented 2.038.0-party-saves: select save slot/mode before opening transport; slot changes reload safely because storage prefixes are boot constants. Host resumes selected checkpoint or hub; guest loads its own character before handshake. Hub story interaction routes to service landing, with separate return-quest choice and direct service access during introductions. Pet purchase gate checks completed rescue; rescue eligibility no longer requires an existing pet. Keyboard handlers run in window capture, leaving editor/menu/text input ownership intact; closing overlays clears lingering form focus; digital movement overrides analog on the same axis; blur clears axes. Key Bindings includes a live received-key/action diagnostic.

Validation: real Chromium save-picker host/join with controlled transport callbacks preserved distinct levels31/17, ranks9/7, gold1234 and other slot. Five hub service routes, rescue availability without pets, locked/unlocked purchases, W/A/S/D under a swallowing document handler, opposing analog input, blur and key diagnostic passed. Pre-change save preserved checkpoint/clue, pets, class rank, gold, hub introduction, return quests and disabled speech. Syntax/diff checks pass. Exact Brave/Mac failure was not reproduced; these are input robustness fixes plus a diagnostic, requiring the friend's device confirmation. No live saves/recordings modified.


## [Codex | 2026-09-25] 2.038 production receipt
Main 47b3dfd deployed. Read-only production Chromium confirms version 2.038.0-party-saves, renderer ready and save-picker API present. Live saves and recordings untouched. Exact source retains original user whitespace; runtime diffs and test cleanup pass diff checks. Brave/Mac confirmation remains outstanding; Settings > Key Bindings reports the received key and mapped action.


## [Codex | 2026-09-26] 2.039 campaign guidance, journal access and first puzzle redesign
Sources U200/U201: requirements/USER_SOURCE_2026-09-26_PUZZLES.md. Private source archive:201 messages, zero unparsed records, valid references.

Journal: discovered nearby puzzle clue shown above latest discoveries; main-puzzle fallback when not nearby. Open-journal notification and journal hotkey while a clue notice is present open that exact saved note. Search covers every collected note in the current region, including both halves; all notes also have one browsable list. Typed journal shortcut letters no longer close the search. No undiscovered clues shown. Repeat puzzle feedback replaces itself instead of queuing minutes of stale steps. Real clues keep reading time; internal attempt counters no longer masquerade as pickups for these puzzle events.

Navigation: consumed clue destinations advance to neutral control groups in six retained main puzzles; balanced Canyon weights guide to the brake area, prison rescue tracks the lift. Seven authored required guard groups get a clear-guards marker until the interaction is usable. Snowbound/ice instructions advance after the clue is read. No correct code/sequence input is revealed.

Iron Halls: first replacement of a repeated sequence with a physical shutdown. West feed -> visible pressure gauge safe band -> safety cable -> timed hammer lock, with distinct placements, tank/gauge and moving press. Eight lights/eight seconds; missed cable leaves prior steps complete and allows free retries. A normal walking route tested at6.128 seconds. Existing quest/loot/shard outcomes and completed saves remain. Host validates pressure/window; deadline and clock replicate. Flint reminder and machine-plate note now explain this design; one existing VO line changes wording and uses the established matching-recording fallback, no recordings modified.

Validation:19 browser guidance assertions using actual clue/puzzle transactions and real scene guards;15 forge timing/movement/snapshot checks;41 Iron Halls and41 Sky Library route waypoints,54 Furnace and260 Long Ascent waypoints;9 controlled two-context Iron Halls co-op checks;7 existing press warning/damage checks; phone journal relevance/search/exact-notification/typing/overflow checks. Pure puzzle feedback/queue/clue/timing, story state/authority, journal and Iron Halls graph suites pass. Pre-change save preserves checkpoint/clue, pets, return quests, gold, class rank, hub intro and speech-off. Reviewed phone journal and shoulder-view gauge screenshot; moved gauge ahead of tank face to remove occlusion. Syntax and runtime diff checks pass. Exact source transcription retains original trailing whitespace.

Testing limits: route suites walk authored segments after preparing quest state, suppressing enemies; they are not a full natural campaign playthrough or a combat balance verdict. Old route harnesses needed max-rank preparation after faster XP introduced upgrade pauses; terminal-dialogue test now reopens the conversation after leaving, matching shipped behavior. Co-op uses controlled browser packet relay, not a two-device internet soak. Exact Brave/Mac keyboard confirmation remains outstanding.

Next: continue U201 puzzle variety through spatial light routing in Sunspire and physical ice/water route manipulation in Frostfell; inspect existing hints/voice lines before authoring. These are proposed implementation directions under approved variety scope, not completed designs. Broader campaign moving-camera/playability audit, unresolved Pyromancer/trials and mounts remain open. Do not mark the whole queue or all puzzles complete.


## [Codex | 2026-09-26] 2.039 production receipt
Main ac4a9dd deployed. Read-only production Chromium confirms 2.039.0-campaign-guidance, renderer ready, and journal-clue, machinery and puzzle-feedback modules loaded. No live save or recording edits. Next: further distinct environmental puzzle designs and route review; this release redesigns Iron Halls only, not every campaign puzzle.

## [Codex | 2026-09-26] User direction: combat, traversal and opening-story quality

User confirms friend's keyboard issue fixed (possibly browser-related); close outstanding device confirmation. Hold SFX work: user will handle it.

User feedback/required direction: combat underwhelming; enemies too similar visually and behaviorally, animations lackluster. More story-relevant defeat-count quests targeting named enemy types in specific areas, with repeat respawns bounded by population caps, to convey fighting a large Hollowed Legion. Massive new-character opening cutscene rework using simple canonical story and multiple illustrative PNGs. Parkour must become central: moderate required main-route challenges and difficult optional routes for Rift Shards, side quests and rare gear. Expand meaningful exotic armor/equippables. Research three established adventure puzzle games and adapt proven mechanical frameworks instead of repeatedly inventing switch sequences.

Exploratory, not final balance approval: replace elemental effectiveness chart with six distinct secondary effects (Fire, Ice, Void, Poison, Arcane, Holy), preserve appreciated weapon recolors. User floats poison DOT, burn damage reduction, ice mild slow, holy defense gain, void attack gain, undecided arcane. Exact effects, trigger rules, caps and PvP balance remain proposals. Do not silently lock illustrative effects as approved mechanics.

Response proposals: distinct enemy roles/animated tells and squad combinations; geographically bounded reinforcement camps with optional shutdown; fair traversal retries and universal base movement access; behavior-changing exotic rewards; six-card spoiler-safe intro; puzzle references Zelda Tears of the Kingdom, Immortals Fenyx Rising, Uncharted Lost Legacy. No runtime implementation or deployment in this discussion turn.

## [Codex | 2026-09-26] Tracking correction — latest enemy/gear feedback preserved

Latest enemy size/anatomy/color, enemy-reference research, enjoyable grinding, exotic gear and equipment-impact requests now have individual pending requirements in REQUIREMENTS_REGISTER (COMBAT-IDENTITY-01/02, COMBAT-GRIND-01, GEAR-IDENTITY-01, GEAR-IMPACT-01). Verbatim latest messages: USER_SOURCE_2026-09-26_ENEMY_GEAR.md. Previous reply supplied image prompts but had not persisted this latest feedback; this entry closes that documentation gap. No claim that all historic messages have been freshly audited or that these updates are implemented. Continue preserving source and reconciling each new user correction before implementation; do not rely on conversation memory alone.

## [Codex | 2026-09-26] Visual identity prototype priority

User supplies three concept images and explicitly prioritizes cohesive visual identity before further large gameplay changes. Requests critique, new variations, and one high-detail but browser-conscious Blender character inspired by the three-character equipment image; wants to assess improvement over rejected earlier prototype. This authorizes isolated exploration, not wholesale replacement of existing characters. Prototype source, concept variation, actual renders and measured budget are in prototypes/holy-guardian/. Gold/ivory knight chosen as test subject. Clearly distinguish generated concept art from Blender geometry. Static model is not production rigging/animation or a proven browser crowd-performance result.

## [Codex | 2026-09-27] Character creator clarity

User explicitly requests larger uncropped centered character preview, obvious character naming, functional eye colors after face upgrade, clearer class explanations and starting weapons. Implemented in 2.040.0-character-creator; see IMPLEMENTATION_CHARACTER_CREATOR_2026-09-27.md. Existing art direction remains undecided and replacement modeling tabled. SFX remains held for user. Opening-story rewrite/illustrations and new-player first-session audit remain next work, not included in this creator batch.

## [Codex | 2026-09-27] New-player first steps

User asks for immediate new-player improvements. 2.041.0 implements accurate rebound-control practice instructions, skip confirmation, focused hub guidance, plain-language contextual tips, direct pause Help with search, and review/confirm for class skill/passive choices. Evidence: docs/IMPLEMENTATION_FIRST_STEPS_2026-09-27.md; scripts/qa-first-steps.cjs and existing-save regression. Opening illustration sequence remains pending, no visual-identity commitment or SFX work.

## [Codex | 2026-09-27] Illustrated opening
2.042.0: supplied five opening illustrations integrated, canonical spoiler-safe text, manual navigation and creator handoff. Tests and scope: docs/IMPLEMENTATION_OPENING_2026-09-27.md. Other legacy story entries still need a separate canon audit.

## [Codex | 2026-09-27] Briar adventure refinement
2.043.0: western farm target-specific hunt/roles and capped refills, real single-jump store/orchard traversal, nearby Briar clues and actionable pickup feedback. Preserves existing art and prior quest progress. Evidence and limits: docs/IMPLEMENTATION_BRIAR_REFINEMENT_2026-09-27.md. Wider campaign redesign remains pending.

## [Codex | 2026-09-27] Remaining campaign refinement
2.044.0: all remaining 15 halves gain specific capped hunting groups, explicit soldier roles, height-aware refills and co-op identities. Expanded discovered-clue access and pickup explanations; real gaps on Keep bell/ Lost Canyon roof routes. Saves preserved. Evidence, baseline test limitations and remaining scope: docs/IMPLEMENTATION_CAMPAIGN_REFINEMENT_2026-09-27.md. Broader art/enemy/puzzle overhaul remains unfinished.

## [Codex | 2026-09-27] Puzzle variety and parkour
2.045.0: Ice Caves water-depth/freezing and pipe-routing puzzles; Sky Library linked gears/reset and single-jump shard crossing; two Long Ascent gaps with catch ledges. Existing completed puzzle flags preserved. Real-browser traversal, fall recovery, controlled co-op and pre-change save checks passed. Evidence and limitations: docs/IMPLEMENTATION_PUZZLE_PARKOUR_2026-09-27.md. Wider campaign overhaul remains ongoing.

## [Codex | 2026-09-27] Dungeon balance and drain parkour
2.046.0: replaced the duplicate optional lower weight-total puzzle with a visible two-pan balance beam; three raised drain stepping-stone stretches with safe water recovery. Main rescue unchanged, discovered clues migrated, old completed locks preserved. Browser routes, co-op, checkpoint and save checks passed. Scope and limits: docs/IMPLEMENTATION_DUNGEON_PUZZLES_2026-09-27.md. Campaign-wide puzzle work remains ongoing.

## [Codex | 2026-09-27] Sunspire light and rooftop continuation
2.047.0: courtyard mirrors relay one continuous reflected beam; wrong turns break downstream lighting. Optical feedback, discovered-clue migration and four rising optional roof jumps with recovery ledges. Existing solved flags, dialogue recordings and rewards preserved. Browser routes, co-op, recovery and save checks pass. Details: docs/IMPLEMENTATION_SUNSPIRE_RELAY_2026-09-27.md. Wider puzzle work remains ongoing.

## [Codex | 2026-09-27] Emberdeep cooling and parkour
2.048.0: Great Furnace guard-controlled water cooling, visible heat gauge, safe drain threshold, two main crossing gaps and six optional high-route stepping platforms. Clues and fall recovery updated; existing dialogue and solved progress preserved. Browser, controlled co-op, save and story checks pass. Scope/evidence: docs/IMPLEMENTATION_EMBERDEEP_COOLING_2026-09-27.md. Wider campaign overhaul remains ongoing.

## [Codex | 2026-09-27] Storm Coast traversal
2.049.0: cargo/beam feedback and inner hatch ramp, broken wreck decking, required upper-cliff and optional wind jumps with recovery, raised Hydra flank stepping routes. Story, boat crossing and mercy outcome preserved. Browser routes, combat, controlled co-op and pre-change save pass. Evidence/limits: docs/IMPLEMENTATION_STORM_TRAVERSAL_2026-09-27.md. Broader overhaul remains ongoing.

## [Codex | 2026-09-27] Duskmoor ascent continuation
2.050.0: second upper exposed flight/two new gaps, memorial stepping stones, bridge chain and vault bolt/target feedback, discovered clue updates. Browser single-jump paths/recovery, story, co-op and save tests pass. Scope/limits: docs/IMPLEMENTATION_DUSKMOOR_ASCENT_2026-09-27.md. Finale unchanged; broader campaign testing remains outstanding.

## [Codex | 2026-09-27] Campaign audit and difficulty steering
User approved campaign-wide testing and added: "my guess is that the difficultyl is slightly too easy right now." Diagnostic pass found ordinary enemy damage unchanged across regions while HP scales; 61 navigation transitions and 15 half-level movement/attack probes pass. No balance changes yet. Exact limits, repetition candidates and proposed controlled difficulty experiment: docs/CAMPAIGN_AUDIT_2026-09-27.md. Full natural fresh-save playthrough remains outstanding.


## [Codex | 2026-09-27] Campaign balance and co-op HP
2.051.0: regular-enemy damage grows after Briar (+10% per region, +3 points in part two); existing 1.6x/2.2x/2.8x co-op HP now reconciles late joins/departures while preserving health fraction, boss phase state and Hydra chains. No new boss damage or solo HP inflation. Browser curve, 20 join/leave cycles, host/guest health, 15-section combat and pre-change save checks pass. Scope and limits: docs/IMPLEMENTATION_CAMPAIGN_BALANCE_2026-09-27.md. Natural full-campaign balance playtesting remains outstanding.


## [Codex | 2026-09-27] Tutorial completion save fix
2.052.0: direct New Game previously entered creation with MODE=null, preventing character writes despite tutorial completion. Creation now initializes the Normal character store before name/trial; skipping first practice establishes a durable hero snapshot too. Real-browser UI reproduction on pre-change index confirms no character save; fixed completion and skip survive title/Continue and full reload, preserving name/class and separate slots. Existing pre-change campaign save fixture passes. Evidence: docs/qa/tutorial-save-2026-09-27.json; scripts/qa-tutorial-save.cjs. Completion test invokes the real trial-completion handler rather than replaying combat. Previously unwritten progress cannot be reconstructed after closing the tab.


## [Codex | 2026-09-27] Multiplayer in Esc menu
2.053.0: Multiplayer pause entry opens existing host/join save selection with contextual Back through picker/lobby to pause. Connected room shows code and Leave Room. New SVG party icon. Browser Esc navigation, host/join pickers, Back/Resume retaining campaign checkpoint, connected-room UI/leave, and pre-change save fixture pass. This pass tests UI routing, not an external PeerJS connection. Evidence: docs/qa/pause-multiplayer-2026-09-27.json; scripts/qa-pause-multiplayer.cjs. Includes 2.052 tutorial persistence fix.


## [Codex | 2026-09-27] Current-character multiplayer
2.054.0: Esc multiplayer automatically uses current SLOT/MODE for host/join, with no save picker; title entry retains picker. Existing connection flow and checkpoint behavior preserved. Browser UI tests intercept connection endpoints and confirm name, level 12 and slot reach both host/join without a picker; title picker remains. Existing-save fixture and syntax pass. Evidence: docs/qa/current-save-coop-2026-09-27.json; scripts/qa-current-save-coop.cjs. No external network handshake claimed. Supersedes pause picker expectations in the 2.053 QA script.


## [Codex | 2026-09-27] Character slot continuation
2.055.0: empty-slot Create now carries a consumed-once creation intent across slot reload and opens story/creator directly; same-slot creation launches immediately. Existing-slot Play uses continuation rather than stopping at title. Occupied slots protected from creation. Browser UI creates and saves second character without modifying original save, verifies intent removal and returning to first character; pre-change campaign save fixture and syntax pass. Evidence: docs/qa/character-slot-flow-2026-09-27.json; scripts/qa-character-slot-flow.cjs.


## [Codex | 2026-09-27] Save and multiplayer regression release
2.056.0: reproduced/fixed deleted-save resurrection and phantom occupied slots; generation guard plus stale-tab notice, legacy reset marker, checked deletion errors. Fixed async connection exception handling, failure Back context and missing-save intent validation. Broad browser suite passes including native PeerJS host/join, different character levels, reload/rejoin, disconnect, cross-slot Hardcore host, successful retry, PvP save protection, all-slot delete/recreate/stale-writer checks and prior tutorial/creation/save regressions. Exact evidence/limits: docs/SAVE_FLOW_AUDIT_2026-09-27.md and docs/qa/save-flow-audit-2026-09-27.json. Refresh both clients; friend-specific Mac/Brave/network environment not directly reproduced.


## [Codex | 2026-09-28] Briar combat roles — 2.057.0
Both Briar campaign halves now give ordinary human troops a committed narrow-lane lunge, slower frontal guard sweep, or locked ground hex. Shapes match hit tests; one hit per attack, recoveries, interruption, collision/height checks, and brief once-per-role hints. Raiders/guards/casters differ in size, proportions and palette using existing models. Patrol replacements inherit roles; finite quest troops stay finite. Co-op carries role/phase/appearance and wakes these troops near either player. Existing camps, quests, Brute, save IDs and balance multipliers preserved. No custom SFX or art redesign.
Validation: real-browser attacks in both halves, dodge/locked-aim/wall/height checks, 10/12-kill camp completion and capped replenishment, native PeerJS two-browser role/phase sync with separate level 13/7 characters, pre-change save, syntax and visual screenshot. Evidence: docs/qa/briar-combat-2026-09-28.json; scripts/qa-briar-combat-*.cjs. Probes isolate enemies and use enlarged player health; human playtest still needed for overall difficulty.


## [Codex | 2026-09-28] Journal/loot layout — 2.058.0
Journal notices move beside visible loot cards at widths >=1050px, with clearance for their entrance animation. Narrower screens defer the note and freeze reading time until loot clears. Browser bounding-box checks pass at 1440/1050/1024/700/390px; pre-change save fixture passes. No save schema changes. Evidence: docs/qa/notice-layout-2026-09-28.json.


## [Codex | 2026-09-28] Briar portal and solid props — 2.059.0
Removed legacy Thornwood secret portal/trigger from Homefields builder. Added final collision pass for 70 ground-level authored solid prop pieces, including crates, fences, posts and orchard trunks. Leaves/crops, terrain banks and overhead trim excluded; existing matching colliders reused. Actual movement probes confirm no phasing through four representative props (low obstacles can be stepped onto), isolated shape checks pass for all additions, granary traversal and old-save fixture pass. Existing orchard/store-window scripted route failures reproduced identically before this change; do not claim full traversal completion. Evidence: docs/qa/briar-solids-2026-09-28.json. Broader campaign collision audit remains outstanding.


## [Codex | 2026-09-28] Bag categories and companion previews — 2.060.0
Bag now has collapsed Weapons and Armor roots. Weapons groups Physical, Ranged and Magical using the existing combat family classification; Armor includes slot groups for rings and amulets. Expansion survives sorting and selling. Pulled portrait/mirror cameras back, gave bag portrait separate space from equipment cards, and connected real companion art to isolated preview actors. Normal world companion rendering restores on exit. Browser category/sell/sort checks, visual bag/mirror inspection, world return and pre-change save fixture passed; syntax/diff checks passed. Evidence: docs/qa/bag-categories-2026-09-28.json. No full pet roster visual audit.


## [Codex | 2026-09-28] Hub quest markers — 2.061.0
New and ready-to-turn-in hub return requests show a dedicated yellow exclamation above the NPC nameplate, visible within 650 world units rather than the ordinary 230. Independent of service-dialogue registration, so story-only givers are included. Accepted/completed requests clear the quest marker. Shops and other dialogue states unchanged. Browser available/accepted/ready/done marker transitions, yellow color, and pre-change save passed. Evidence: docs/qa/hub-quest-markers-2026-09-28.json.


## [Codex | 2026-09-28] First tutorial retry — 2.062.0
First starter-trial deaths offer Retry tutorial instead of class selection or bank-loss messaging. Respawns a fresh player state at the tutorial start, restores health/mana, grants 3 seconds protection, preserves class/name and trial progress. Restricted to beginner trials without an existing hero or unlocked class; later death flows unchanged. Real browser Warrior/Ranger/Mage death-and-button-retry checks and old-save fixture passed. Evidence: docs/qa/tutorial-retry-2026-09-28.json.


## [Codex | 2026-09-28] Tutorial bonus portal — 2.063.0
Removed shared-generator Treasure Sprint portal from beginner trials. Browser checks confirm no bonus portal and retained completion exit for Warrior/Ranger/Mage; hub Sprint remains available. Pre-change save fixture and syntax pass. Evidence: docs/qa/tutorial-portal-2026-09-28.json.


## [Codex | 2026-09-28] Guided onboarding and minimap — 2.064.0
New characters receive 18 short lessons after starting tutorial practice: four movement directions, held jump (>=0.3s), dodge, attack, interaction/bag/journal/pause keys, highlighted health/mana, quest goal, character level vs class rank, skills and minimap. Reading/waiting freezes simulation; action practice briefly resumes with protection. Skip lessons remains available. First unlocked skill follow-up waits for a real cooldown-producing cast and permits movement/aiming with protection. Six-kill exit reminder explains exploration. New local north-up circular map shows nearby ground/enemies/open exit, no secrets or distant objectives. Mouse capture disabled during guide to keep Continue usable. Browser full sequence, tap rejected/hold accepted, actual Skill 1 cast, six kill-event exit trigger, pre-change save and syntax checks passed. Evidence: docs/qa/guided-tutorial-2026-09-28.json. Physical touch/controller devices and full beginner combat playthrough remain for human testing.


## [Codex | 2026-09-28] Compact shard discovery — 2.065.0
First-shard explanation moved from centered 400px/18s card to right-side 280px card, expires after 6 wall-clock seconds. Short goal/save reminder and configured journal key; full journal help unchanged. Narrow screens use a short lower strip. Browser measured right-side card and expiry; old-save fixture and syntax passed. Evidence: docs/qa/shard-notice-2026-09-28.json.


## [Codex | 2026-09-28] Co-op nameplate spacing — 2.066.0
Removed duplicate in-view friend navigation caption; edge guidance retained. Peer class/level, name, wider HP bar and ping use separated DPR-scaled rows. Browser synthetic-peer rendering confirms one name position and visible half-health bar; old-save fixture and syntax passed. No networking changes. Evidence: docs/qa/party-nameplates-2026-09-28.json.


## [Codex | 2026-09-28] Heading-up minimap — 2.067.0
Map rotates with character facing using shortest-angle exponential smoothing; arrow stays upward and north marker rotates around rim. Terrain and markers share the same transform. Tutorial/accessibility wording updated. Browser canvas transform checks confirm forward enemies appear above player at four cardinal headings; old-save fixture and syntax passed. Evidence: docs/qa/heading-map-2026-09-28.json.


## [Codex | 2026-09-28] Organized menus — 2.068.0
Pause Records tile removed; records expand inside Achievements using shared records content. Pause Settings grouped into five accordions (controls/camera, graphics/appearance, audio/voices, accessibility/guidance, help/tutorial), retaining current section after setting toggles. Bag category icons use existing assets; all five gear slots remain present with zero counts when empty. Browser Records expansion/back, settings toggle retention and audio slider, ten bag groups/icons, screenshots and old-save fixture passed. Evidence: docs/qa/menu-organization-2026-09-28.json.


## [Codex | 2026-09-28] Hub entrances and eight-button pause — 2.069.0
Removed Postings. Sparring entrance now occupies (610,245), with its fallback pavilion and nearby dummy relocated consistently. Rift Hall moved to southwest activity row at (-610,710), clear of the Stylist sign, with matching collision pillars. Pause has Gear/Bag/Classes/Achievements above Settings/Multiplayer/Quit to Hub/Title Screen. Browser verified exact button order, both destination entries, clear entrance approaches, and pre-change save persistence; syntax passed. Class rank appearance variants remain pending. Evidence: docs/qa/hub-entrances-2026-09-28.json.


## [Codex | 2026-09-28] Prominent NPC services — 2.070.0
All five hub service NPCs now show larger gold-bordered main buttons with matching icons and explicit service labels, both on landing menus and dialogue shortcuts. Browser measured 73px service buttons versus 47px conversation options and verified both click routes for every NPC. Service access logic unchanged. Pre-change save and syntax checks passed. Evidence: docs/qa/npc-services-2026-09-28.json.


## [Codex | 2026-09-28] Moving combat and emotes — 2.071.0
Locomotion overlay now includes Root/Body/Hips with leg tracks so moving attack legs share their parent pose. Added M directional mouse wheel with Wave/Point/Cheer/Bow/Dance; click selection, keyboard 1–5/Tab/arrows/Enter, M/Esc cancel. Four-second procedural rig emotes cancel on movement/actions/damage/death; shared through validated co-op motion state with remote elapsed time. Existing class rigs use shared bone names. Browser verified M/click, all five packet-to-peer round trips, movement/damage/expiry cancellation, lower-body overlay parent coverage, visible wheel screenshot, and pre-change saves. Real two-person animation playtest and subjective animation polish remain to verify; no claim of exhaustive class-by-class visual QA. Evidence: docs/qa/emotes-2026-09-28.json.


## [Codex | 2026-09-28] Crystal Waystone — 2.072.0
Replaced the small hub centerpiece with a 197-unit tall faceted blue crystal, six floating satellite shards, tilted gold orbital rings, luminous facet seams, crown prongs, engraved base and drifting motes. Roughly 3,898 mesh triangles, no additional dynamic lights; reduced motion freezes decorative movement, low quality/particles-off hides motes. Ground footprint and E range preserved; center collider height matches larger landmark. Browser render inspected, geometry/settings validated, actual E travel menu opened, and pre-change save passed. Evidence: docs/qa/waystone-2026-09-28.json.


## [Codex | 2026-09-28] Isolated bag portrait — 2.073.0
Replaced main WebGL canvas capture, gl.finish and pixel readback/keying with a dedicated on-demand inventory scene. Cloned equipped character reset to Idle; separate companion clone staged at side/behind, smaller than hero. Scene contains only preview actors and lights, with cleanup on canvas removal. Drag uses pointer capture and frame-coalesced redraw instead of leaked window listeners. Wider equipment column and 56%-width portrait. Browser verified still frame count across idle interval, redraw on drag, separate scene content and pet placement; screenshot inspected; pre-change save and syntax passed. Evidence: docs/qa/bag-portrait-2026-09-28.json.

## [Codex | 2026-09-28] Solid walkable surfaces — 2.074.0
Fixed camera cutaway height convention and added shared 3D sightline intersection across campaign renderers and fallback renderer. Surfaces at or below player feet remain opaque, including jumping above them; intervening walls still cut away. Removed coplanar facade trim/base faces, overlapping roof slab ends, and overlapping same-height Briar/Black Woods platform regions without changing collision. Kept deep-art module cache versions consistent across palace/castle builders.
Validation: all 16 campaign parts passed support checks with no renderer errors; 57 actual Black Woods platform groups passed 12 camera/height combinations each; positive wall/FPS checks passed. Briar district exact duplicate triangles: zero; mimic terrace same-height cap overlaps: zero. Prechange save regression, inline syntax and diff checks passed. House/terrace screenshots reviewed. These checks address shared causes and reported areas, not a claim of exhaustive visual inspection of every asset in every level.


## [Codex | 2026-09-28] Class clarity, healing and PvP repair pass

2.075.0-clear-class-choices: reviewed 16 class trees, wired 23 missing passive effects, corrected descriptions and selected balance problems. Fractional/projectile lifesteal, Healing Light, shared PvP defenses and confirmed hit healing are repaired. Browser: 128 skill-handler smoke checks, 27 targeted assertions, old-save preservation passed. See docs/CLASS_AUDIT_2026-09-28.md and docs/qa/class-audit-2026-09-28.json. Exhaustive per-passive behavioral coverage and real remote PvP balance remain follow-up work; do not claim all matchups fully validated.

## [Codex | 2026-09-28] Rift Hall — 2.076.0
Portals now run counterclockwise from Briar at entrance-right, up right wall and down left. Shared frame coordinates drive art, collisions, interactions. Complete saved sets grant access immediately without Keeper assembly; hall entry persists restored sets. Keeper now explains automatic opening. Castle ending prerequisite retained. Existing Pyromancer trial remains unavailable (not implemented); frame stays in sequence. Browser verified eight coordinates, automatic access without conversation, castle prerequisite and pre-change save preservation.

## [Codex | 2026-09-28] Safe Unseen Strike — 2.077.0
Ninja basic Unseen rear blink validates map bounds, full footprint support, target-height support and body clearance, rejecting spike fields. Tries rear arc alternatives; no safe destination means strike without relocating. Successful blink snaps to support, clears velocity and updates lastSafe/warp serial. Browser checks: rear landing, edge rejection, void fallback, elevated platform, solid wall; pre-change save preserved.

## [Codex | 2026-09-28] Boss-free trials — 2.078.0
Trial stage generation strips inherited boss/miniboss template settings. Shared enemy spawn substitutes regular grunts for boss archetypes while G.trial is active. All 10 implemented tutorials/class trials browser-checked for no bosses, sufficient targets, and forced boss-spawn substitution. Campaign boss spawning and pre-change saves pass.

## [Codex | 2026-09-28] Hub tour and concise dialogue — 2.079.0
First-visit hub has skippable camera tour: overhead, Waystone, all 14 currently present services/activities and 8 campaign entrances, then Briar next step. 25 stops, back/next/select, replay in Help, saved completion/skip, reduced-motion support, movement pause with party networking active. Shortened 320 of 359 authored dialogue nodes: 10,452 to 4,991 words; retained short remaining lines. IDs, effects, conditions and transitions unchanged by automated comparison. Immediate full text/choices; shop landing service-first; selected non-state-changing lore questions optional. Current script no longer overwritten by outdated recorded takes. Desktop/390px browser tests, story/authority/prison/Gus/voice-api tests, pre-change save passed. Stat creation/player-level allocation remains next work; one point per level proposed, not yet implemented.

## [Codex | 2026-09-28] Controller setup — 2.080.0
Added Settings controller panel: Xbox/PlayStation auto/manual labels, persistent gameplay button swaps, reset bindings, deadzone, camera sensitivity/invert, swap sticks and manual axis indices, live input diagnostics. Controller drives visible menu focus/select/back; gameplay supports bag/journal/party teleport. Release controller-owned inputs on loss/disable/menu transitions; suppress held button edges across contexts. D-pad/menu confirm/back remain fixed. Browser simulated labels/rebinding/disconnect and pre-change save regression passed; setup screenshot inspected, syntax/diff checks passed. Physical controllers, specialized minigames/tutorial prompts and complete controller-only end-to-end flows still need testing; do not claim universal hardware or complete keyboard-free coverage. Standard API reference: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

## [Codex | 2026-09-28] Pyromancer and character stats — 2.081.0
Implemented Pyromancer as Emberdeep's earned magic/ranged class: five shards open its Rift Hall trial, a dedicated mentor teaches it, eight skill alternatives and eight passive alternatives progress through rank 10. Warm class palette, Wizard model, fire staff, icons and shared combat effects are wired. Fixed modern Rift Hall trial-region routing. Boss-free trial and unlock flow verified.
Character creation now offers ten equal-budget points with class-biased dice rolls across Health, Attack, Defense, Speed and Mana. One additional point per player level, 20 per stat/100 total; Bag → Character Stats spends points, Drillmaster reassigns them freely. Starter foundations follow equipped class. Adjusted future automatic growth to leave room for allocation; existing saves retain earned raw stats and receive their level's unspent budget. No automatic new lifesteal. Snapshot/trial/class-switch persistence verified; campaign checkpoint rollback remains intentional.
Validation: 136 skill handlers, 11 boss-free trials, 18 Pyromancer effects checks, confirmed PvP reward and duplicate-receipt checks, 307 stat assertions, actual creation/spend/reload/class-swap flow, pre-change save regression, story/state/voice tests, JS syntax and diff checks. Desktop and 390px menus inspected. Physical multiplayer soak and natural campaign balance remain playtest work. This completes these two queued systems, not the entire historic backlog.

## [Codex | 2026-09-28] Tutorial pacing and Waystation presentation — 2.082.0
Replaced 18 lessons with one WASD movement lesson, jump, mouse/keyboard attack and dodge practice, and concise non-blocking information tips. Hostile AI remains frozen continuously during core practice; only core input waits pause the world. HUD callouts move near their highlighted target and draw an arrow. E continues informational pages, Q skips; bag/journal work normally. Mouse controls are recognized through game-surface overlays. Pointer aiming resumes during non-blocking tips. Starter trial XP is held below rank 2 until kill three, then grants the remaining class XP; repeat/high-rank characters retain progress. Inline skill selection keeps both choices visible with E confirm/Q cancel and an accidental-click guard. Shortened initial and skill-unlocked explanations.
Hub tour: 17 stops instead of 25, one spoiler-free campaign stop points to Briar Town. Explicit station front-facing cameras, brighter/distant fog, narrow-screen framing, E/Q tour navigation. Descent explains gold/XP/items; Endless Dungeons explains separate challenge mode. Sparring art/colliders/approach now align with adjacent shops. Removed duplicate Rift Hall generic stall and built one signed animated violet entrance. Removed redundant floating name/role tags; retained quest exclamations, raised interaction prompts and added orange service text. Richer station canopy colors, trim, distinct supply counter and training weapon rack/map table, Stylist fabrics, actual Shepherd/Cinder display pens, greener garden canopies/flowers and decorated activity arches. Shared companion models are reused and display resources disposed on leaving.
Verified: browser keyboard/mouse tutorial actions, no hostile movement during practice, informational game-time progression, E/Q, third-kill rank 2, inline choice cancel/confirm, visible front views, 390px framing, clear authored hub approaches, old-save currency/class/pets/clue/checkpoint preservation, 11 boss-free trials, 136 skill handlers, story state/authority, syntax and diff checks. Expected local voice API 404s only. No physical controller or internet party soak in this pass; combat balance remains playtest-driven. User owns SFX work.


## [Codex | 2026-09-28] Four-step creator and graphics recovery — 2.083.0
Character creation now presents Class, Face, Starting Stats, then Name in separate steps with persistent side preview, prominent orange Next/start, Back preserving edits, and blank name Nameless. Added saved mouth and eyebrow choices; preview reflects eyes/face immediately. Stats are mandatory to view but optional to change; existing allocation rules retained.
Reproduced old creator WebGL exhaustion after 25 eye changes (11 context-limit warnings, main context lost). Reuses one preview canvas and renderer per session and explicitly disposes/releases it on exit. Main graphics-context loss now stops simulation and rendering and presents reload recovery; loading no longer resumes combat after an arbitrary 12 seconds before world readiness. This fixes a reproduced failure consistent with the white-screen report, not proof of the user's exact intermittent cause.
Verified in browser: 25 eye changes without loss, canvas identity, Back/name retention, Nameless tutorial start, mouth/brow persistence across reload, stat creation/spend/reload/class swap, injected main context loss freezes HP and game time, pre-change campaign save retains pets/class/currency/clue/checkpoint. Desktop and 390px layouts inspected, short-screen Next remains visible; syntax and diff checks passed. Local voice API 404s expected. Physical device/remote co-op soak not performed.


## [Codex | 2026-09-28] Rank-earned class appearances — 2.084.0
Implemented 17 classes x default/rank-5/rank-10 (51 appearances, 34 new palettes/detail sets). Stylist Wardrobe owns Class appearances; removed remaining title/legacy-pause skin entry points. Preview locked looks, rotate model, equip only at required class rank; selected tier stored per class per save. Unlocks derive from current class rank, including rank-10-all cheat; no new combat modifiers and no changes to legacy saved stat-bearing skin state.
Catalog/design details: CLASS_APPEARANCES_2026-09-28.md. Distinct colors and modeled details include galaxy Mage halo/stars, Warrior crest/plates, Ranger feathers, Paladin gold sunbursts, Chronomancer animated clock/gears, Pyromancer ember vents/flames, Pirate compass chains and class-specific bone/horn/cloth ornaments. Bounded geometry (48–1,259 additional triangles for earned variants), no dynamic lights. Reduced motion freezes ornament animation. Local, peer, mirror and cloned bag appearance use equipped details; castle disguise suppresses them. Co-op packets validate and relay cosmetic tier.
Browser verified all 51 previews, zero context loss, all 17 selected tiers reload, rank4/5/10 gates, unchanged player stats, actual local application, validated peer packet round trip and rendered peer ornaments. Pre-change save preserved class/pets/currency/clue/checkpoint; desktop and 390px layouts inspected; JS syntax and diff checks passed. Fixed preview teardown ownership so an old modal observer cannot lose the new modal's WebGL context. Full per-class motion/cape clipping and real-network device performance remain playtest work; do not claim exhaustive animation clearance.


## [Codex | 2026-09-28] Default controls audit — 2.085.0
Defaults: Left Shift/right-click dodge; Tab/B bag; V auto-loot cycle; M remappable emotes. WASD/arrows, Space, left-click/J attack, 1–4 skills, E interact, F equip drop/R bag drop/Q sell drop, N journal, G ping, T teleport/Y friend selection, L auto-fight unchanged. Menu Tab still navigates focus; Escape and editor/browser function keys reserved. Recognized old defaults migrate only when destination keys are free; custom assignments are preserved and new actions take only free keys. Per-action reset transfers its default keys cleanly; lookup removes duplicate/reserved entries.
Added actual shared action routing for Bag, integrated emote rebinding, prevent gameplay toggles in menus and browser modifier shortcuts, removed J/K destructive loot-popup shortcuts, retain both keyboard/mouse held states until all released. Beginner help and tutorial hints updated; dynamic bag/journal/current-control labels respect rebinding.
Browser QA passed unique defaults, old-default migration, custom V/Tab preservation, per-action reset, actual Tab bag opening/Escape return, Tab focus, Shift/mouse combined hold/release and M emote/rebind. Pre-change campaign save preservation, JS syntax/diff checks passed. This audits gameplay defaults and scoped menu/tutorial inputs; physical controller testing remains separate.


## [Codex | 2026-09-28] Pyromancer icon set — 2.086.0
Imported the corrected semi-pixelated 19-image set from the pinned Bladefall icons chat: 8 active skills, 8 selectable passives, innate, capstone and class emblem. Original transparent PNGs and SHA-256 mapping manifest are preserved in assets/source/pyromancer-icons; runtime copies are 256px (1.66 MB total). Standard renderers cover skill bar, rank choices, class tree and class badges. No gameplay/save identifier changes.
Real Chrome test passed 19 image decodes, all 8 skill-bar variants, all 8 rank-choice pairs, 10 passive tree images, class emblem and pre-change save preservation (class/rank/choices/gold/name/pets); class-tree screenshot inspected. Syntax/diff checks passed. Browser logs included unrelated GLTF texture-load errors around iframe navigation; do not claim an error-free whole-game session. Test source: scripts/qa-pyromancer-icons.html, served temporarily in public/3d alongside previous index as _qa-prechange.html, using isolated localhost port 4332. Fixtures removed after testing.

## [Codex | 2026-09-29] 2.087.0 — Approved UI icon artwork
Imported 33 new subjects plus four refreshed destinations from the pinned Bladefall icons chat. Selected consistent alternate settings/emotes; archived 44 original images/sheets, source hashes and crop mapping. Exported 37 transparent 256px PNGs with even padding (1.96 MB combined runtime assets). Applied to travel and entry cards, journal/clues/tasks/shards, five settings groups, six voyage HUD cues, five emotes, stat allocation, class appearances, party teleport and three signature weapon portraits. Labels remain readable beside icons. Fixed duplicate empty nav-card ID that prevented Rift Hall travel handler binding.
Validation: inline/module syntax and diff checks; all 37 PNG alpha/dimension checks; Chrome real-game QA passed image decoding, travel menu, settings, emotes, signature weapons, stats, appearances, journal and six voyage HUD images. Previous-build save retained class/rank/choices/gold/name/pets. Destination layout visually reviewed. This was an artwork rollout, not a multiplayer gameplay retest.

## [Codex | 2026-09-29] 2.088.0 — Stylist face and name
Added Face & name above wardrobe cosmetics: 25 gold flat for any combination of eight eye colors, five mouth shapes, four eyebrow shapes and name. Live equipped-class preview defaults to face close-up, with full-body/rotate controls. Draft-only until Save changes; no charge on cancel/no-op/invalid data/insufficient funds, single charge on repeated stale clicks. Blank names become Nameless. Existing per-character appearance fields and name persist. Mirror shortcut routes to this paid hub service; removed the old free rename handler.
Validation: Chrome real-game QA passed pre-change save, draft isolation, cancel, no-op, 25g deduction, double-click protection, insufficient gold, blank name, all changed fields on save reload and actual preview render. Desktop visual inspected. Unit checks passed invalid styles, too-long names and exact-funds purchase; JS syntax/diff checks passed. QA scripts/qa-stylist.html uses the same isolated-origin/previous-index fixture setup as qa-ui-icons; never run against player-save origins. No mechanics or class power changes.

## [Codex | 2026-09-29] 2.089.0 — Face options, offsets and randomization
Added No eyebrows to creator/Stylist and save validation. Existing five mouths and eyebrow styles apply across all 17 classes/six base models. Wizard Face had sculpted eyebrow islands beneath the fitted brows: a cached derived geometry excludes only their 168 triangles (of 2620), preserving hair/beard and source asset. Shared fitted brows now own the selected style.
Added shared BFFaceOptions normalization/controls: left-right, lower-higher and tilt for eye pair and mouth; bounded to +/-5% head dimensions and +/-20 degrees. Randomize face changes color, mouth, brow and gentle offsets (+/-2.5%, +/-10 degrees); never name/class/stats. Reset position & tilt clears offsets. Existing saves default to zero; faceAdjust persists per character. Stylist keeps draft isolation and same 25g total charge.
Chrome QA: 425 rendered combinations (17x5x5), actual eyebrow mesh counts and selected mouth shapes, removal of native Wizard eyebrows, creator selection, Stylist none purchase/reload, offset persistence, actual eye/mouth position and quaternion change, randomization/free draft/reset, pre-change save retention. Screenshot confirmed no-eyebrow Wizard. Unit normalization/random bounds and Stylist purchase checks, JS syntax and diff checks passed. Not an exhaustive animation or multiplayer-face audit. Test scripts/qa-face-options.html uses prior index plus prior hero3d.js fixtures on isolated local origin; remove public fixtures after running.


## [Codex | 2026-09-29] Controller invert default
Implemented the requested controller camera behavior: missing controller settings now default to inverted right-stick Y camera movement, while an explicitly saved false setting remains false. The setup checkbox reflects that effective state.


## [Codex | 2026-09-29] Independent controller camera inversion
The setup UI exposes separate left/right and up/down inversion controls. New defaults are horizontal off and vertical on.


## [Codex | 2026-10-03] 2.092.0 — Pyromancer crash and emote repair
Reproduced the reported Pyromancer crash in Chrome: combat-art motif attempted points.length for the missing flame shape. Added fire outline plus safe fallback; the failure was independent of cheat progression. Preserved bow motion, replaced other emote arm rotations with shared two-bone hand-target solving and outward elbow hints, eased entry/exit, grounded dance without twisting legs. Skip weapon grip overlays for these gestures. Hide attached/native weapons during all emotes and restore original visibility before the next pose, including cancellation and peer rigs.
Validation: real Chrome on isolated localhost passed pre-change save fields, cheat unlock/rank10 basic and charged attacks, all eight skill choices through update/render/hero flush with target damage and shield state; 40 emote/class combinations across all six body rigs plus Pirate/Reaper, six time samples each, finite bones, hand-height checks, hidden/restored weapons, expiry, movement/attack/damage/jump cancellation, and co-op packet round-trip. Screenshot poses reviewed. No page exceptions in the regression; localhost voice API 404s remain expected. Physical two-device co-op and exhaustive mesh intersection clearance were not tested. Test: scripts/qa-pyromancer-emotes.cjs.


## [Codex | 2026-10-03] Class audit shipped — 2.093.0-class-audit
Audited 17 classes (136 skill choices, 136 passive choices). Fixed failed-cast rewards, companion cooldown/mana bypass, Mage echo scaling and temporary attunement, Chronomancer projectile designation, Warlock/Paladin confirmed-damage healing, double PvP mark/curse timers, Burning Light PvP targeting, and Bone Legion damage mismatch. Updated misleading descriptions. Real Chrome: 136 runtime casts, 45 focused assertions, existing choice/healing/Pyromancer-PvP tests and prior-version save checks passed. Full details and reproducible scripts: docs/CLASS_AUDIT_2026-10-03.md. Actual two-device latency testing and full mixed-build balance remain playtest work. Co-op guest PvE healing still uses the existing local estimate; do not claim receipt-confirmed PvE. No SFX work.


## [Codex | 2026-10-03] Projectile art - 2.094.0-projectile-art
Replaced striped candy-like sphere shots with shared instanced faceted bodies and tapered energy wakes. Mage skills use orbiting blades and a longer lance; staff basics remain simple. Class variants include fire heads, storm forks, clock rings, dark prongs, holy cross/halo, arrows, spinning Ninja stars and cannonballs. Removed duplicate generic orbit overlays when the new renderer owns a projectile. Delayed Ninja bursts retain their visual identity.
Axe/dagger/javelin/scythe charge throws copy the equipped asset through its existing model/grip/palette loader, including element and rarity appearance; fallback uses the weapon art snapshot. Co-op packets retain class/skill and thrown-weapon metadata with backwards-compatible absent fields. No damage, hitbox, timing or progression changes. No SFX changes.
Chrome checks: 10 class projectile casts, all four real thrown models, co-op packet round-trip, cleanup, low-quality 40-shot cap, prior-version save across 17 classes, and 45 existing class assertions passed with no page exceptions. Inspected WebGL gallery and in-game Mage/staff screenshot. Syntax parse and diff checks passed. Physical two-device play and low-end hardware performance remain untested. Tests: scripts/qa-projectile-art.cjs and scripts/qa-projectile-save.cjs (requires previous index at _qa-prechange.html, never deploy that temporary file).


## [Codex | 2026-10-03] Enclosed camera groundwork - 2.095.0-camera-interiors
Fixed FPS bypassing the modern renderer: queue the real hero/world instead of legacy voxel hand when Three is ready; local head scaled out only during that draw and restored immediately. First-person eye stays near actual head. Added padded segment collision for shoulder/overhead against walls, closed doors, obstacles and future explicit roof cameraSolids; leaves open space and supporting ground alone, respects editor/hub camera paths.
Real Chrome: 10 assertions passed (FPS queue/live renderer/head restoration, open space, wall/ceiling constraints, shoulder/overhead render, support floor and open door); screenshot inspected, prior-version save across 17 classes preserved, syntax/diff passed. Actual complete enclosed dungeon layouts and physical co-op not tested; no new generator shipped. docs/ENDLESS_DUNGEON_REWORK.md captures locked roguelite direction, proposed connected room templates, visibility/ceiling rules, encounters, co-op authority and staged acceptance. Next: implement small enclosed room set and validate traversal/camera before full seeded generator/economy.

Validation note: the first previous-version save comparison reported a mismatch. A diagnostic repeat and then the original strict assertion both passed for all 17 class records. No save code changed in this patch. The initial harness mismatch was not isolated, so this is repeat-pass evidence rather than a claim of exhaustive save coverage.


## [Codex | 2026-10-03] Approved: health attrition defines dungeon runs
User approves the dungeon plan and makes HP management central over a long run. Early equipment offers limited protection; mistakes take meaningful chunks of health and healing opportunities are scarce. Better armor improves how many hits can be survived, while better weapons reduce exposure by killing enemies faster. A skilled fresh character must still be able to progress substantially through avoiding attacks, rather than encountering mandatory upgrade checks.
Implementation implications: carry health between floors; replace/rebalance the current automatic 20-percent floor heal rather than retaining it by accident. Healing frequency, damage amounts and upgrade strength remain playtest-tuned, not locked numeric values. Preserve readable attack warnings and escape windows; avoid unavoidable damage and spawn-on-player hits. Audit healing/lifesteal builds and co-op recovery so they do not trivially erase attrition, without silently removing class identities. These implications guide the proposed rework; no combat/economy changes implemented in this documentation update.


## [Codex | 2026-10-03] Approved direction: roguelite endpoint and harder progression
User requires an endpoint for the roguelite and suggests NG+ or graduation to a harder, different tier afterward. This applies only to the dungeon roguelite; campaign NG+ remains removed. Exact floor count, tier names/count, scaling and unlock details are not yet locked.
Proposed design for review: a finite expedition through multiple regions ending in a final boss and victory/results screen. Winning unlocks a selectable higher difficulty tier without removing access to the earlier tier. Retain earned gold, purchased classes/upgrades and achievement/quest progress; begin each attempt with its normal fresh run equipment/temporary-power reset. Higher tiers change encounter compositions, room variants, hazards and boss mechanics, alongside restrained numeric scaling. Preserve avoidable damage and viable fresh-build skill expression; do not make progression an unlimited enemy-HP treadmill. Victory should be at least as valid a banking endpoint as death or voluntary checkpoint exit. This is a plan only, not an implemented mode change.


## [Codex | 2026-10-03] Prison Break initial playable slice - 2.096.0-prison-break
Implemented the approved roguelite in the existing Endless Dungeon entrance (G.delve), preserving Abyssal Descent. Three sections, each with six enclosed rooms: cells, combat hall, required broken crossing, two-wave watch, boss checkpoint, and optional elite store with elevated seal. Seeded side branch/cover/crossing offsets; three tiers add health/damage pressure, numbers and shielded guards. Native voxel architecture, solid ceilings and conservative roof camera collision retain current character rendering. This is an initial room kit, not the full procedural variety or final art pass.
Separate per-save prisonProfile wallet, capped permanent health/armor/starting-weapon upgrades, and tier-specific purchase qualifications (initial tunable offers: Berserker/8 optional elites, Ninja/3 Tier-2+ seals, Reaper/Tier-3 escape). Gold is awarded per room/discovery/escape with persistent receipts; gold/qualifications/purchases survive death, campaign character fields restore from escrow. Fresh attempts reset temporary gear/classes/levels; host checkpoint stores health, inventory, loose loot, room states and revivals. No free floor/level-up healing; one optional 25-percent spring on section 2; one ally revival at 25-percent HP per attempt. Existing healing abilities still function.
Co-op: host owns room spawning and progression; approximately +60-percent enemy health per ally captured per encounter/wave, no added co-op damage multiplier. Host can suspend/resume solo. Guests retain their own checkpoint and earned wallet; host disconnect returns guests to hub. Room-clear chest rewards available to guests. Stale floor/state packets rejected; repeated gold receipts do not repay.
Validation: real Chrome startup/render, enemy movement in combat/wave/elite/boss rooms, all three camera modes below ceilings, starter jump crossing across four seeds (both offsets), escrow restoration, damage-preserving resume, victory/tier unlock, death, starting upgrade application, persisted reload, simulated co-op scaling/fixed active fight HP/guest checkpoint isolation/dedup rewards. Pure tests: 300 connected deterministic layouts, economy caps/qualification gates/receipt dedup. Previous-version save preserved across 17 classes. Syntax gate and diff checks passed. Physical two-device latency/rejoin tests and a full unassisted balance run remain outstanding.
Next: expand topology and room templates beyond the repeated initial six-room route, tier-specific boss mechanics, richer architecture/art, more optional challenges and shop presentation, verify healing-build balance and real co-op play. Do not label this the entire completed dungeon rework.


## [Codex | 2026-10-03] Dungeon save selection - 2.097.0-dungeon-saves
Endless Dungeon entrance now shows three independent save slots per campaign character/mode, with wallet/tier/classes/upgrades and suspended-run summary, How it works, and Back to hub. Responsive cards and persistent footer. Selection opens preparation/shop; changing saves never starts a run. Existing prisonProfile migrates to slot 1; prisonSaves is the canonical store, with a legacy active-profile alias. Empty/deleted slots stay null across reload; deletion and replacement of an unfinished run require confirmation. Failed slot/shop writes roll back memory and display an error. Invalid checkpoints are discarded while preserving permanent progress.
Dungeon fields excluded from campaign checkpoint snapshots, and persistence overlays current dungeon data after campaign checkpoint restoration. Prison escrow preserves the full library; active run records its local slot. Co-op guests choose a slot before entering; pending host state updates while choosing, host disconnect/cancel returns safely, and guest rewards target the selected slot without overwriting its solo checkpoint.
Validation: real Chrome click-through migration from pre-change runtime, all three slots, help, shop isolation, saved HP/class restoration, replace/cancel, delete/cancel/reload, simulated quota failure on delete/selection, campaign wallet isolation, selected guest reward isolation and repeated receipt protection, host-to-solo regression, main-character namespace isolation, delete-all reload, cancel guest join, desktop/mobile visual inspection. Existing run/death/upgrade tests and previous-version 17-class save check passed; pure migration/tombstone/invalid-checkpoint tests and syntax gate passed. Co-op tested via actual packet handlers in Chrome, not physical two-device network testing. No dungeon generation/combat rebalance in this change.


## [Codex | 2026-10-03] Shipped 2.098.0 — Dungeon room expansion
- New runs use layout revision 2: seven enclosed rooms per section, a left/right turning final route, two optional elite branches, three mandatory crossing profiles, and a four-step optional gold climb. Boss rooms have cover pillars. Patrol, crossfire and charge formations vary enemies and wave positions.
- Saves and co-op packets carry layoutVersion; existing checkpoints without it keep revision 1 geometry. Exit/bounds derive from the plan. Reward receipts prevent duplicate gold on resume/network replay. Campaign-only boss narration and zone-count banner no longer leak into Prison Break; room HUD explains optional risks and guard-room progress.
- Validation: 900 deterministic connected section/tier layouts, real Chrome enemy movement for all five encounter rooms, required jumps, optional climb and horizontal passages in both orientations, old and new checkpoint resumes, prior-version campaign save with 17 classes, death/escape/upgrades, three camera modes, simulated co-op HP scaling and guest checkpoint isolation. Screenshot reviewed. Gate and whitespace checks passed. Physical two-device co-op still needs a human session.
- Remaining: broader architectural room templates and visual dressing, more distinct dungeon boss encounters, full-run pacing/HP economy playtesting. This is an incremental room pass, not completion of the entire roguelite.


## [Codex | 2026-10-03] Shipped 2.099.0 — Original Prison Break enemies and bosses
- Three original ordinary enemies: Pike Watcher (committed spear lane), Chain Hound (crouch/rush/recovery), Cinder Vessel (delayed marked blast). Three section bosses: Bell Keeper (arm sweep and bell ring with safe center), Iron Maw (rush, maul, stomp), The Unbound (cross beams, targeted marks, ring). Boss sequences vary below half health. Original procedural articulated voxel models; no campaign asset/name aliases. New roster restricted to Prison Break; campaign redesign remains separate work.
- Shared pure prison-combat.js holds move geometry, state machine, poses and snapshots. Direction/target locks at wind-up; no contact-only damage. Per-room aggression budget allows two simultaneous attacks. Recovery windows use a pale-green visual cue. Existing dodge, cover, status, hit/kill and co-op reward paths remain in use. Host selects nearest living party member in its dungeon zone; guest damage requires having observed the warning, preventing invisible catch-up hits.
- Boss HP tuned to 325/472/646 for solo Tier 1 sections, before player damage scaling; normal enemy counts reduced by one to suit more deliberate fights. Existing co-op multiplier retained. Reaper qualification still final Tier 3 completion, player-facing text says final boss rather than warden.
- Fixed dungeon overhead camera collapsing into the character near rear walls; steeper enclosed framing with forward view. Native dungeon architecture now replays depth alongside native actors after Three, so solid walls actually occlude them. Added complete renderFrame QA hook (old render+flushHero3D omitted the deferred actor pass). Boss bar moved away from desktop player panel; first-encounter hints go into the side tracker.
- Validation: pure state/geometry/art finite-matrix tests; Chrome all six attack cycles, damage, one-hit-per-strike, dodge immunity, cover, two-attacker cap without starvation, co-op snapshot/missed-warning protection, all three actual boss kills unlocking exits; simulated 1.6x co-op health, guest checkpoint and receipt isolation; campaign pre-change 17-class save, death/escape/upgrade regression; 900 generated layouts; FPS/shoulder/overhead checks; reviewed boss screenshots. Pixel occlusion test: 0 changed enemy pixels behind a solid wall versus 27,134 when exposed (crop excludes moving first-person weapon). Syntax gate and whitespace checks passed.
- Remaining: human full-run difficulty/HP economy playtest and real two-device co-op; more varied boss arena architecture and further model/art polish. Use results to choose which combat principles migrate into the campaign; no blanket campaign roster rewrite has shipped.


## [Codex | 2026-10-04] Shipped 2.100.0-prison-arenas
Distinct revision-3 interiors: Bell Keeper four narrow shelter pillars; Iron Maw broad charge lanes and jumpable low rubble; Unbound shallow stepped terraces below attack height limits. Boss reward chest moved into clear center-side space for host and guest. Prior layout revisions 1/2 retained exactly.
Validation: 900 deterministic layouts, 90 arena spawn/exit/reward checks, old geometry comparison; real-browser three boss completions, campaign pre-change save, run escrow/resume/death, camera bounds and simulated co-op save isolation passed. Reviewed rendered final arena. Physical multiplayer and hands-on difficulty/flow still require playtesting. Next: playtest boss positioning/terrain and expand room encounter variation. No SFX changes.


## [Codex | 2026-10-04] Shipped 2.101.0-dungeon-encounters
Revision 4 adds Split Gallery, Chain Kennels and Guard Barricades interior templates with seeded mixed encounter schedules and safe authored spawn points. Original Shield Guard has committed bash, visible shield, 60% frontal damage reduction and full damage from flanks/recovery/stun; guest hit handling reduces damage once at host, with matching local prediction. Corrected zero-valued guest attack coordinates. Two-wave rooms allow three seconds of breathing room. Broken Treasury has a bank-to-platform jump and four ascending gaps, 128-unit final ledge, and 100*tier gold vs former70; no extra healing.
Validation: 540 legacy plans identical (revisions1-3), 540 new plans safe across tiers/waves; 900 deterministic layout/economy checks; all foe state/pose tests; Chrome normal-input required crossings and optional climb, wave pause, old dungeon checkpoint HP/layout restoration, 17-class campaign save, room enemy movement/attack, all boss exits, run death/escape/upgrade escrow and simulated co-op 1.6x HP/guest save isolation. Shield front/flank/recovery and host-applied guest hits checked. Room screenshot reviewed; syntax gate passed.
Remaining: human full-run difficulty/HP pacing and physical two-device playtest; broader connected floor footprints and more elaborate architectural assets remain future work. This pass varies interior layouts, not room outer dimensions. No SFX changes.


## [Codex | 2026-10-04] Shipped 2.102.0-adventure-clarity
All six approved usability areas reviewed. Journal now supports this-level/all-visited-level search, level/part labels, and monotonic discovery order; latest notes no longer limited to the current half. Generic world/item feedback uses next unfinished objective instead of first task. Loot comparisons use numeric attack-delay comparisons, explicit delay/base-damage/defense-point labels, actual projectile range and equipped affixes; new affixes are not automatically green upgrades. Class viewer explains skills/passives/stacks/levels and labels cooldowns.
Controller menus are scoped to the active overlay; first backward navigation starts at the last control; sliders send both input/change so camera/audio settings apply; defaults restore axes/sensitivity/inversion as well as bindings. Added persistent Standard/Larger/Largest reading text to accessibility; existing shake/reduced-motion/particles controls retained. Small-screen class header scrolls separately so large text cannot squeeze out the skill tree or Back button.
Validation: real Chrome all-level search, newest ordering, exact clue notification, earlier-half search, 390px layout, largest-text persistence, simulated controller slider/reset, equipment comparisons and current bonuses. 24 DISTINCT campaign section checkpoint resumes (including castle entrance/ascent/final arena), pickup feedback/removal, 15 nonopening patrol areas hunt completion/reward dedup/respawn/co-op identity, two optional campaign routes, Ice Caves water/flow puzzles, Sky Library shelf puzzle/7-jump route. Pure journal/controller-invert/puzzle tests and syntax gate passed; pre-change 17-class save preserved. Screenshots reviewed and mobile header corrected.
Test limitations: older generic puzzle QA assumed obsolete sequence controls; current water/gear suite used instead. Older checkpoint test repeated Castle entrance; new explicit-route regression fixes coverage. Old save fixture required clearing a pre-existing active checkpoint before authoring fixture metadata; no production save regression found. Physical controller/two-device co-op and complete human campaign playthrough still unverified. No balance, art-direction, or SFX changes.


## [Codex | 2026-10-04] Shipped 2.103.0-enemy-pursuit
Ground walkers, caster repositioning and pre-charge approach now use bounded local obstacle routes (96 search nodes, two searches/update, short retry cache), swept collision and footprint support. Honors 44-unit climb limit and prevents unsupported ledge pursuit; custom boss/elite state machines retained. Caster seeks a clear line instead of firing indefinitely into cover. Ordinary contact damage now tests 3D solid cover for player and pet, while low floors/overhead structures remain clear.
Ordinary nonspecial walking enemies select nearest living same-area co-op player. Host snapshots now carry melee warning/active timers and attack serial; guests follow host movement and require 0.4s of observed warning before taking that strike. Remote HP loss triggers hit flash. Specialized encounter protocols remain unchanged.
Animation starter pass: heavy/beast strike timing differentiated, directional cosmetic torso-root recoil, fading material hit highlight; reduced-motion disables added recoil. No collider displacement, new SFX, roster replacement or art-direction change.
Validation: Chrome all 16 campaign halves show active movement/attack/damage from valid accessible combat positions; prior smoke test positioned a target behind a Keep structure and on an unsafe Palace edge, so corrected target selection is saved as qa-campaign-pursuit.cjs. Pure and browser detour/cover/ledge/step tests; simulated co-op nearest-target/warning/cover/HP cue checks; seven Prison Break foes actual wind/strike/recovery/damage, dodge, warning protection and aggression cap; Fallen/Marksman/Frost officer state regressions; 80 rendered animation samples across grunt/brute/caster/jackal with finite bones, pose screenshots reviewed; actual mob renderer flash decreases from .48 to .0533. Prior-version save preserves all 17 classes. Syntax gate and whitespace checks pass.
Limits/next: local routing is not a full multistory navigation mesh and cannot solve distant maze detours. Broader unique enemy animation choreography is still pending; this starts feedback/timing polish. Human campaign feel and physical two-device co-op remain unverified. Existing unrelated scripts/qa-prison-coop.cjs newline change left unstaged.


## [Codex | 2026-10-04] Shipped 2.104.0-enemy-choreography
Nine existing enemy types now have separate authored bind-local wind-up/attack/recovery poses: grunt sword slash, sentinel shield shove, revenant overhand cut, caster supporting-staff/palm cast, frostlobber left-hand ice throw, sunpriest open-palm invocation, dustjackal snap, thornboar tusk shove and cragspitter braced spit. Existing meshes, hand-parented equipment, movement, damage and SFX retained. Short cosmetic recovery settles the pose; no extra gameplay recovery or balance change.
Fixed clip restarts losing the previous animation reference, which left old weighted poses underneath later clips. Explicit projectile-release timer now drives shot animation; cancelled structured wind-ups no longer imply strikes. Furnace/Marble boss animation reads authoritative phase, so cooling/countering does not play a false attack. Kept legitimate legacy slam/volley releases and existing authored boss clips. Time-freeze now holds the animation mixer and cosmetic timers. Preview displays motion labels and includes recovery clips; debug getter exposes active clip weights/time for tests.
Validation: pure nine-profile distinctness, rotation bounds and phase continuity; 22 articulated rigs with finite weighted vertices across all generated clips; real-browser 45 clips/225 samples across all nine types, selected rendered shield/caster/thrower/beast frames reviewed and shield/head poses refined. Actual renderer verifies cancelled wind-up safety, only current attack weighted after blend, recovery-to-idle, freeze, and real projectile emission/release. All 16 campaign halves remain active and deal damage; simulated co-op warning/cover/hit feedback tests, existing Fallen/Frost officer/Marksman regressions, prior-version 17-class save, syntax gate and whitespace checks pass.
Remaining: further roster-specific choreography/art beyond these nine, human combat-feel feedback, and physical two-device co-op testing. No broad enemy model redesign or SFX work performed. Unrelated qa-prison-coop.cjs newline change remains unstaged.


## [Codex | 2026-10-04] 2.105 dungeon playtest correction pass
Implemented: stable dungeon camera target/FOV across collision transitions, smooth boom release, corrected roof collision bounds (removed invisible 24-unit ceiling extension); automatic ground equipment bagging, overflow sales and pickup checkpointing; new layout revision 5 with nine 750-unit rooms, five required encounters, extra refectory/cistern arrangements, more precise jump landings; two reward chests per floor, explicit chest grades and conservative common loot; prison attacks ~24% faster tells, ~22% shorter strikes/recovery, +18% movement speed. No added SFX.
Dedicated merged Three architecture now supplies textured stone masonry, beveled platforms, cylindrical pillars/bars, curved arches and lanterns in all dungeon camera modes. ~18k environment triangles / 8 draw calls in inspected floor. Native rendering remains fallback. This is an environment upgrade, not a completed high-detail enemy model replacement. Broader bespoke rooms/enemy art and human difficulty/visual acceptance remain follow-up work; do not describe the requested graphical ambition as fully achieved.
Old layout revisions 1-4 remain byte-for-byte identical; new rooms require a new attempt. Active old attempts resume safely. Chest balance and pickup behavior apply immediately. Overflow gold is credited only to the collecting player's dungeon save, with receipt deduplication.
Validation: syntax gate; 900 generated new plans and 3600 old-plan comparisons; 12 actual physics jump transitions; all three floor exits and two-chest limits; all equipment pickup types and full-bag sale; 600 chest rolls; 1260 camera samples across three modes (3-unit movement produced no >3-unit camera jumps in tested corridor traversal), eased obstruction release; seven foe live damage/dodge/cover/recovery tests; co-op ~1.6 HP scaling, guest checkpoint isolation and reward dedup; previous-version checkpoint with HP/layout preserved; pixel test hidden enemy 0 changed pixels behind wall, visible positive control >28k. These are automated browser checks, not a substitute for user combat playtesting or two-device network testing.


## [Codex | 2026-10-04] Shipped 2.106.0-quest-topics
Available side quests remain reachable after core dialogue. Marked 29 audited campaign/Rift Hall topic menus and added an authoritative Other questions / quests action from later lines. Authored returns to those menus no longer become forced conversation exits. Saved cursors recover their previous topic menus without replaying effects. Hub service conversations expose the same route back to services and available requests. Existing authored prerequisite/refusal/reward conditions and co-op conversation ownership stay enforced; Leave conversation remains available. No voice line text changed.
Validation: 29-menu state regression including old cursor histories, no-effect navigation, Simon dragon-side-quest access after core dialogue, Roland refusal preservation and invalid navigation rejection; existing story/authority/Gus/prison tests; actual browser Heath core-to-side-topic, close/reopen and hub return button; previous-version 17-class save; syntax gate. Escort gameplay and broad campaign layout/quest redesign remain pending; this patch addresses dialogue access.


## [Codex | 2026-10-04]
2.107.0-forge-levels: single and batch forge upgrades now respect canonical character-level equipment requirements (1/5/12/20/30). Locked pairs remain visible; Forge All skips them. Compact color-coded guide shows current level and unlocked/locked tiers. Browser QA passed 12 category/tier boundary cases, single merge, mixed batch and cascade cap; previous-version save preserved across 17 classes. JS gate passed.


## [Codex | 2026-10-04]
Shipped 2.108.0-hammer-carry: dedicated lower forward hammer ready pose clears Warrior face instead of using upright heavy-weapon carry. Palm anchors, support-hand IK and authored attacks retained. Browser: all three hammer models, 21 idle/walk/run/charge/attack pose checks passed, support grip errors within .04 rig units; screenshot visually reviewed. Syntax gate and prior-version 17-class save check passed.


## [Codex | 2026-10-04]
2.109.0-weapon-glows: all five cosmetic glows now use isolated emissive materials and depth-tested edge highlights on current 3D weapons, including pirate pair. Shared player/mirror/peer rendering and isolated bag portrait hooked up. Validated glow ID added to co-op appearance snapshots. Weapon disposal cleans outline resources. Browser checks: 36 color/removal checks across hammer/sword/bow/staff/scythe/pirate; independent actor materials and restored original emission; previous save intact (17 classes); syntax gate passed. Visual hammer screenshot reviewed. Full two-client co-op not re-run for this cosmetic patch.


## [Codex | 2026-10-04]
2.110.0-dungeon-identity: differentiated dining tables/benches and tableware, kennel wall bars, gallery banners, cistern overhead pipes/drains, broken crossing joists, suspended Bell Keeper bell, Iron Maw wall braces and final chamber seal. Uses existing collision footprints and saved layouts. Removed duplicate native obstacle boxes over Three prison architecture (retains fallback). Shared chestRarity/addRoomChest now gives hosts/guests identical room rewards; replay/resume cannot regenerate opened rewards.
Validation: 900 layouts and 3600 unchanged legacy layouts; actual browser 12 physics jumps, all three floors gated by five required encounters/two chests, pickups and overflow; guest packet replay and opened-chest resume; finite merged art ~20-21k triangles/8 draw calls per floor; visual dining hall check; wall pixel occlusion passed; prior-version 17-class save and JS gate passed. Physical co-op/full-run difficulty testing remains outstanding. Further procedural topology, bespoke enemy art and campaign escort quests remain pending; this is a focused continuation, not completion of the entire redesign.


## [Codex | 2026-10-04]
2.111.0-dungeon-routes: new Prison Break runs use revision 6 with ten rooms, six mirrored/turning arrangements and a second required five-step raised crossing. Encounter compositions/clear-floor spawn positions vary deterministically; no enemies placed inside authored cover. Five combat rooms and two chests per floor retained. Deep masonry shafts beneath both crossings replace visible sky/floating platforms. Revisions 1-5 keep exact saved geometry.
Validation: 1350 deterministic nonoverlapping connected new plans, 6750 legacy comparisons; browser 60 measured jumps, 162 doorway traversals, all three section completion/chest tests; new checkpoint preserves topology and HP, guest receives matching topology, revision-5 resume remains nine rooms; previous-version campaign save (17 classes); visual shaft screenshot and syntax gate. Further irregular room footprints, bespoke enemy art, campaign escort quests and human balance/physical co-op playtests remain pending.


## [Codex | 2026-10-04] Ruined Keep isolated beta design packet
User approved map-first design packet before new construction. Created docs/design/ruined-keep-beta/design-packet.html plus overhead.svg and elevation.svg. Inspected current keep/prison story and confirmed Walter directs player to competing eastern stairs. Packet proposes a separated lift/service route, counterweight bridge puzzle, short damageable-captive escort, purposeful asset placement and gated playtesting. These specific designs remain proposals for review, not new canon or implemented gameplay. No playable level/save changes. HTML desktop/mobile overflow checks passed; overhead map visually reviewed.


## [Codex | 2026-10-04]
2.112.0-dev-previews: title-screen Dev Previews menu links public Ruined Keep packet, overhead map and elevation; no character load required. Packet has Back to Bladefall link. Phone-sized browser navigation/overflow, prior-save and syntax checks passed.


## [Codex | 2026-10-04] 2.113.0-keep-beta
Playable isolated Ruined Keep Lift Rescue prototype under title > Dev Previews. Disposable in-memory storage is installed before game modules on ?devkeep=1; exiting reloads the normal game. Select all 17 classes, level 1-50, rank 1-10, gear rarity, skill branch, enemy strength, camera and player invulnerability. Reset and loadout controls stay available through pause. Campaign maps/saves are not replaced.
Authored intake/guard/cell/loading spaces, three-stop opposed lift/counterweight puzzle, six required maintenance jumps, three optional shard jumps, visible repair snag, damageable captive and guards using actual attack geometry, escort wait/resume and retry resource restoration. Captives ride the lift and walk across the upper dock; no competing stairway. Short Walter ending points to Ellis/Frostfell; beta ends before The Fallen. Optional locket and shard are test-only.
Validation: real browser complete puzzle/rescue path; lift boarding/weight-cage lock and broken-chain gate; six required and three optional measured physics jumps; actual captive strike damage and retry; all 17 class rank-10 skill/basic-attack smoke tests; mobile 390px setup/no horizontal overflow; prior-version 17-class save check and real-storage sentinel/full key equality across dev entry/reset/exit; syntax gate. The first prior-save comparison failed transiently, then diagnostic and original repeated runs passed; no persistence code changed outside explicit dev isolation. This is a SOLO layout prototype with preliminary blockout art, not a finished campaign level, co-op implementation, or a verified 15-25 minute session. Human pacing/clarity/difficulty feedback is next.


## [Codex | 2026-10-05] 2.114.0-campaign-review
Added title > Dev Previews > Campaign review & Frostfell maps. Source-grounded review of all 16 campaign parts and two schematic Frostfell proposals; no playable campaign or beta changes. Captured initial area inventory in isolated memory storage; all inspected coordinates finite. Do not infer reachability or quality from this.
User corrected the initial review's over-crediting of code-level puzzle variety. Revised packet and agent instructions classify player actions instead: three-button water/weight/shelf configurations may be the same experience, even with different solver logic. Frostfell now proposes spatial stream/platform/freezing-area interactions rather than keeping the fill/freeze/drain console. All are proposals, not verified improvements. Require ordinary-camera interaction evidence and human playtest before multiplying designs.
Checks: mobile390/desktop1365 document navigation, 18 expandable sections, both SVG assets and actual title-menu link passed. Syntax gate passed (69 pre-existing duplicate names). Prior-version 17-class save equality initially failed; diagnostic rerun and original rerun passed, matching the prior session's transient behavior. No persistence code changed; do not interpret this limited check as exhaustive save QA.


## [Codex | 2026-10-05] 2.115.0-briar-beta
Implemented isolated Homefields + Black Woods remake under title > Dev Previews. Main campaign maps/quests untouched. New layout with 19 required and 14 optional tested jumps; Mara supply climb/healing; movable grain crate/plate stopping mill wheel, climb/release lowering crossing; three-villager defense with two waves/shared safety and retry; forest signal ascent, captive/dog rescues, capped six-kill patrol, five beta shards, Legion warbeast, transport order toward Hollow Pass. All-class/level/rank/gear/camera/difficulty setup, concise clues, maps, disposable storage; solo, XP frozen.
Plan: docs/design/briar-beta-plan.md. Evidence/limits: docs/design/briar-beta-qa.md. Browser: continuous movement-input completion with invulnerability, 33 jumps, recovery/attack damage, 17-class smoke, storage equality, valid previous-version save, Keep rescue regression, phone setup, three cameras. Initial old-save mismatch diagnosed as invalid fixture missing starter unlock; corrected fixture, no persistence patch. Visual render-order defect fixed. Art initial, not finished campaign polish; human difficulty/fun unproven. Await beta approval before main portal integration.


## [Codex | 2026-10-05] 2.116.0-social-play
Implemented live menus with retained damage feedback/audio and controller navigation; local co-op NPC cameras with explicit read-only listeners and owner-only choices/close; shared progress and visible activity labels; larger smoothed minimap with objectives, party and pings. Quartermaster Chess Table (1,000 gold): host ownership, session board/seat persistence, chess.js legal rules and draw/resign controls, physical pieces and seated poses. Briar beta has isolated cursor-driven torn-map/painting inspections tied to existing optional routes; main campaign layouts unchanged.
QA: 25 two-page handler-based co-op checks, actual enemies damaging through pause, direct menu warning, 12 inspection checks, mobile/UI/minimap checks, chess rules fixtures, valid previous-version 17-class save, syntax gate. Details/limits in docs/design/social-play-qa.md. Still needs real co-op latency, sitting across classes/gear, camera/menu fairness and puzzle fun playtests. Inspection art is prototype; disconnected chess seat ownership remains session-bound; no chess AI. Do not call this fully human-playtested.

Release follow-up: disconnected chess seats now release without resetting the board, and the returning player/new visitor can claim the free color. The co-op check count is 26.


## [Codex | 2026-10-05] 2.117.0-chess-clock
Chess now uses a dedicated oblique 3D board camera, clickable projected squares and a compact side panel, with a flat board fallback and phone overhead camera. Seated players reach for, lift and place pieces, then use the same arm to tap the optional physical analog clock; weapons are hidden during seating. Castling moves king then rook; captures, en passant and promotion preserve the legal board. Host-authoritative configurable 15-second to 180-minute clocks, 0-120-second increment, both-player ready confirmation, untimed default, timeout results, and disconnect suspension. Animation time is free; remaining time transfers after choreography exactly once. Leaving the table keeps an active clock running.
QA: 13 two-page clock/board checks plus 26 social regressions; legal chess and special-move presentation fixtures; injected monotonic clock tests; 40 far-corner hand-reach samples across Warrior/Ranger/Wizard/Cleric/Rogue rigs; desktop/phone screenshots, measured piece and clock contacts; previous-release 17-class save preserved; syntax checks passed. Real internet latency and human animation/camera comfort remain untested. No campaign changes.


## [Codex | 2026-10-06] 2.118.0-class-audit
Fixed Dev Preview button contrast: ordinary accent link CSS now excludes button links. Verified all eight actions, desktop/phone screenshots and hover.
Class audit fixes: PvP melee includes weapon life steal; Warlock basic health cost refunds only after confirmed positive PvP damage; guest healing and Harvest use host-confirmed damage receipts, capped to actual HP lost, with duplicate/stale-player/world protection; dead/downed class regeneration and kill hooks are guarded. Swift Steel retains +10% attack speed and +25% fourth basic-hit damage, removing the additional free fourth attack. Clarified Ambusher, Death's Favor and Chronomancer Echo descriptions without changing saved IDs.
QA: catalog covers 17 classes, 136 skills and 136 passives (source-reader coverage only). Baseline 136-skill browser smoke passed; 45 behavioral regressions passed after changes; 18 new focused checks and five two-page handler/transport checks passed. Previous 2.117 save retained all 17 class choices, name and gold. Inline syntax and diff checks passed.
Remaining audit work: guest early-return in hitEnemy bypasses several attacker-owned class hooks; status-damage authority also needs a dedicated co-op pass. Do not claim all class combinations or balance verified. Existing life-steal attenuation policy remains unchanged. Real internet latency and human balance testing remain outstanding. No campaign layout changes.


## [Codex | 2026-10-06] Briar beta human playtest feedback and scale direction
Actual user playtest: mill puzzle was enjoyable and satisfying; moving a heavy box onto a pressure plate, reasoning from visible machinery, and seeing the environment respond worked. This validates this specific interaction, not all beta puzzles. Beta is far too small relative to desired main-level scale; rift shards too easy. Keep and expand parkour with varied rhythms, concentrated traversal sections and challenging optional shard routes. User prefers existing campaign enemies over new beta enemies; improve existing enemies rather than replace the roster.
Desired quest variety: longer vulnerable escort routes (people/dogs/prisoners), visible escort health bars, enemy targeting and attacks, recurring ambush pressure, death fails the quest with retry; hold-area/breach encounters requiring presence and survival under waves (30-60 seconds suggested, not locked); localized respawning creature hunts with roughly 10/15/20 kills as examples; traditional fetch tasks; visually understandable environmental puzzles; difficult traversal to a requested relic; optional NPCs becoming strong hostile class-based opponents (ninja/pirate/mage examples), with actual combat rather than merely renamed interactions. Do not assume all NPC fights are nonlethal: user explicitly mentioned killing. Specific characters and canon consequences remain to be designed.
World: retain the sense of scale of current main campaign levels while filling empty traversal meaningfully. Rolling terrain and hills should shape sightlines and fights, not merely platforms on a flat plane. Props must look appropriate, have intentional placement and correct collisions. Environmentally justified spawns/ambushes; alternate pressure and recovery without enemy spam or long cleared dash-only stretches. Preserve mill clarity: uncomplicated observable logic, visible environmental consequences and working presentation.
User asks whether to adjust existing maps or remake at their scale; this is a strategy discussion, not approval to replace main campaign maps. Codex recommendation: rebuild beta terrain/connectivity to campaign scale in connected districts, retaining validated mill interactions, existing story/assets/enemies and reusable systems; preserve live campaign until replacement is tested. Do not stretch the compact beta or replicate the mill puzzle under other names. Pending co-op class audit remains outstanding.


## [Codex | 2026-10-06] 2.119.0-chess-thomas
Solo chess now seats the existing Thomas NPC opposite the player; no ghost. Easy/Medium/Hard use lazy single-thread Stockfish.js 18 in a worker, legal move validation, bounded thinking, stale request cancellation, and visible retry on engine failure. Targets are 500/1200/1900 Elo, explicitly uncalibrated; Easy/Medium add deliberate legal mistakes, Hard uses engine strength limiting. Difficulty locks after play begins. Leaving solo pauses its clock/animation and cancels thinking; reopening resumes the saved session position. Co-op retains human opponents and live clocks. Crossing solo/co-op session boundaries resets the session board. Thomas returns to his normal NPC position on leaving.
Board camera follows the seated color, with own ranks at bottom. Detailed lathed pieces replace boxes when Three is active (castellated rooks, carved horses, bishop slit, queen crown, king cross), with box fallback and shared legal square projection. Whole-body 41-degree/lateral lunges replaced by capped 14-degree forward lean and small translation; seated Thomas uses longer arm proportions for far-square reach, restored on leaving. Camera displays only the local reaching arm during own move, preventing own head/torso from blocking the board; other players still see the complete avatar. Fixed table collision pushing seated players backward during live menus.
QA: 15 solo browser checks including actual Stockfish move, selectable modes, clock readiness, projected input, piece/clock contact, Thomas return, position persistence, forced engine failure/retry and cancelled stale replies; 16 two-page co-op checks including both camera orientations, no solo bot in co-op, clocks and timeout; 40 player far-corner reach samples across five rigs, four Thomas far-corner samples, chess rules/clock/special-move unit fixtures; previous-version 17-class save preserved. Desktop/phone screenshots inspected. Syntax/diff gates passed. Strength is not a measured Elo rating; human comfort of the revised seated animations and real internet latency still need playtesting. Engine license, source archive, matching network and build instructions ship beside binaries.
Pending: co-op guest offensive class hooks/status-damage authority from prior audit; full-scale Briar beta expansion remains at strategy/feedback stage, live campaign unchanged.


## [Codex | 2026-10-06] Approved full-scale Briar beta rebuild
User approves the five-step map/terrain/activity/verification/art sequence now, preserving the live campaign. Match the existing campaign's approximate traversal scale; retain the human-approved physical mill puzzle. Reuse good existing trees and other campaign assets after visual inspection; do not substitute simpler low-detail assets merely because they are newly generated. New terrain must support real traversal and intentionally placed districts, not a stretched flat prototype. This approval supersedes waiting for approval to expand the beta, but does not authorize replacing the main portal.


## [Codex | 2026-10-06] Keep earned campaign progression on early exit or death
Latest user decision: preserve earned character XP/levels, class XP/ranks/selected skills, gold, and completed hub-NPC quest work when leaving a campaign level early or dying. No quit confirmation or gold penalty. A hub request completed in either half may be turned in immediately without defeating the boss. Supersedes prior unfinished-half XP/gold rollback. Do not change separate Prison Break run progression, temporary class-trial escrow, arena state or explicit permadeath contracts. Gear and rift-shard rollback were not explicitly changed in this request.


## [Codex | 2026-10-06] 2.120.0-briar-ground
First full-scale terrain/layout pass in isolated Briar beta: endpoints now -4250 Homefields/-4620 Woods, curving orchard/farm escape and northern woodland. Shared triangulated hills drive render, player support, enemy support and dropped-object grounding. Approved mill geometry unchanged. Existing complete Nature Kit trees reused in authored rows/edges (bare Blender trunk rejected after visual inspection); existing campaign soldier/sentinel/thornboar models reused over beta telegraphed combat. Escort has individual villager HP, four distance-triggered ambushes, proximity waiting, and retry. Added four optional bank-route jumps; localized patrol contract now twelve kills with two-active cap.
Normal campaign now retains XP/levels/stat allocation, class ranks/choices, gold and completed return requests on death/retry/early hub/reload. Shepherd rescue available without clearing the half. Runtime checkpoint identity prevents stale worlds overwriting another save. Unsecured gear/Rift Shards retain prior completion rules; permadeath and separate trial/Prison Break contracts unchanged.
Validation: continuous expanded beta input walk completed both parts with no falls (invulnerable QA, not human difficulty); six optional route jumps after fixing one unreachable gap; actual escort strike, blocked/duplicate damage, failure/retry, crate reset, capped hunt and reward-once; campaign storage isolation, previous-version 17-class save; earnings across retry/hub/reload and eight two-page co-op handler checks including independent rewards/restart/disconnect/permadeath. Screenshots inspected for reused models, slope/path visibility. Syntax gate passed.
NOT COMPLETE: this is the first terrain pass, not the final five-step remake. Expanded areas still need richer purposeful district dressing, stronger optional route variety, distinct hold-area/class-opponent activities, and full normal-camera animation/error/recovery review of new encounters. Flat original village/forest workspaces remain; do not describe every map tile as rebuilt. Enemy mechanics still use beta combat timing, not a complete native campaign behavior transplant. Physical co-op and human fun/balance unverified. Main campaign maps untouched. Next: enrich district layout/activities without empty filler, preserve mill, then finish visual QA and request human beta playtest before any main portal replacement.


## [Codex | 2026-10-06] Waystation purchased upgrade presentation
User requests remaking purchasable Waystation upgrades (braziers, banners and all others) for the current hub: each must be a clear cosmetic improvement, visually obvious after purchase, attractive and non-obstructive. Move the lamppost intersecting a chess chair. Grounded finding: braziers currently spawn lamp models at x=270,z=395, almost inside west chess seat x=279,z=390. Plan: shared fixture coordinates; replace lamps with detailed fire bowls at safe courtyard positions, larger heraldic wall banners, full northern parapet/caps, richer golden Waystone fittings. Keep prices/ownership IDs/save behavior and chess rules. Verify before/after in real browser, purchasing/reload, route clearance and chess seating.

## [Codex | 2026-10-06] Waystation upgrade implementation verified

Implemented 2.121.0-hub-upgrades: four fire bowls, four heraldic banners, north-wall battlements, golden crystal/crown. Removed old purchase lamp intersecting chess chair. Decoration collision locations share the rendering layout and refresh immediately upon purchase. Browser purchase/reload, unchanged previous-version save (17 classes), approach clearance, and visual review passed; no page exceptions. Beta terrain expansion remains separate and unfinished. QA: scripts/qa-hub-upgrades.cjs (4339 local test server, manually pumped renderer).
User requests remaking purchasable Waystation upgrades (braziers, banners and all others) for the current hub: each must be a clear cosmetic improvement, visually obvious after purchase, attractive and non-obstructive. Move the lamppost intersecting a chess chair. Grounded finding: braziers currently spawn lamp models at x=270,z=395, almost inside west chess seat x=279,z=390. Plan: shared fixture coordinates; replace lamps with detailed fire bowls at safe courtyard positions, larger heraldic wall banners, full northern parapet/caps, richer golden Waystone fittings. Keep prices/ownership IDs/save behavior and chess rules. Verify before/after in real browser, purchasing/reload, route clearance and chess seating.

## [Codex | 2026-10-06] Chest rarity, models, and reward reveal
User approves the attached chest brief as implementation input, plus progressively larger/more detailed rarity-colored chest assets, hinged opening animation, exactly one equipment item per chest, and an upper-screen scrolling case-style reveal skippable with E. Source preserved in CHEST_RARITY_SOURCE_2026-10-06.txt. Treat supplied numerical tables as the initial implementation values, subject to playtesting, not proven balance. Common 92/8; middle tiers 2/90/8; Legendary guaranteed; designated challenge rewards 92/8 minimum. Descent: one reward chest after each combat floor, depth bands 1-5,6-10,11-20,21-30,31+ with the source weights. Campaign: preserve authored locations, fixed region/effort-appropriate grades; optional random discovery guideline is not a mandatory per-chest 80/20 roll. No random progression pieces or class signature equipment. Preserve personal co-op loot, claim once, and retain generated outcomes across reconnect/reload.
Grounded plan: replace openChest's existing 1/2 drop loop and inconsistent odds; replace the shared wooden prop with five code-built chest variants; keep mimic tells and the no-reward practice sprint exception. Replace Descent's pre-combat third/sixth-floor caches with one clear reward. Persist chest records per save/run/area before opening, award equipment to bag (overflow sale) once before the cosmetic reel, and store secured chest rewards in the campaign checkpoint. Preserve Prison Break's distinct run/checkpoint rules. Verify exact probability intervals, saved reward identity, duplicate opens, full bag, save isolation, co-op personal claims, all models/lids, mobile/desktop reel, skip and reduced motion in a real browser. Campaign optional placement expansion remains part of level redesign rather than scattering new chests blindly.

## [Codex | 2026-10-06] Chest update implemented — 2.122.0
Five progressively larger colored/detail chest models, hinged lids, one equipment reward, direct bag/overflow sale, upper-screen reel with E skip/continue and reduced motion. Exact supplied contents/depth tables; protected authored climb/bonus rewards. One post-clear Abyssal Descent chest per combat floor. Fixed campaign positions retained with region grades; no random scattering/new 80/20 placement system. Persisted per-save/run claim/outcome records; campaign chest equipment and claim checkpoint together; Prison Break profile owns its own chest records. Personal co-op claims preserved, repeated clear/rejoin tested.
QA: scripts/test-chest-rules.cjs, qa-chest-rewards.cjs, qa-chest-coop.cjs, qa-chest-prison.cjs, qa-chest-visual.cjs; 200,000 probability samples, previous-version 17-class save, browser desktop/mobile/reduced-motion/lids. No exceptions in reward QA. Balancing/fun not human validated. Main beta terrain/district remake remains unfinished and separate. Full ship notes are in root UPDATE_ROADMAP.md.

## [Codex | 2026-10-07] Restart recovery and current beta state

The PC restart interrupted an in-progress chess/Briar task but did not erase local edits. Version 2.125.0 contains the chess usability pass and an isolated second Briar beta pass. New focused browser checks cover flat/world moves, camera, host/co-op clocks, audio cues, checkmate, farm jumps, actual wagon damage and Ranger duel. The continuous two-chapter Briar route still completes with test invulnerability. Live campaign map not replaced. Future work: human blind playtest, terrain/environment art refinement and difficulty tuning before considering promotion to main portal. Full notes in UPDATE_ROADMAP and docs/design/briar-beta-qa.md.

## [Codex | 2026-10-07] Sparring Room improvement

Version 2.130.0 rebuilds the Sparring Room as a detailed training hall, with a clear arrival, training desk and exit, searchable unlocked-opponent selection, chosen bout size, real practice damage and knockback, safe defeat reset, and a live results panel. Existing campaign progression and rewards remain separate. A prior-version save, camera modes, phone layout, normal foes, seven bosses, dummy damage, victory/defeat and exit were checked in Chrome. See docs/design/SPARRING_ROOM_2026-10-07.md. Human combat feel and visual preference still need review.

## [Codex | 2026-10-07] Abyssal Descent floor rebuild

Version 2.131.0 replaces Descent's repeated square with four authored floor shapes, safe encounter pads, differentiated pressure, three-wave pacing, a post-fight crumbling crossing, restrained theme-aware architecture, a safe overhead camera, and a clearer phone tracker. Descent remains the campaign XP/gold/gear grind, separate from the Prison Break roguelite. Prior pacts, depth difficulty, single post-clear chest, retained rewards and co-op host authority stay intact. Browser tests checked eight floors, spawn grounding, three complete encounters, portal crossing, guest sync and a previous-version save. Human pacing/difficulty and art judgement remain open. Details: docs/design/ABYSSAL_DESCENT_REBUILD_2026-10-07.md.

## [Codex | 2026-10-07] Treasure Sprint rebuild shipped

Version 2.132.0 rebuilds hub and campaign Treasure Sprint as a deterministic three-section parkour course with slim suspended stone, readable dynamic hazards, section checkpoints, next-landing guidance, movement-start timer and non-HP fall recovery. Solo hub runs have result/retry and continue to award no loot; the campaign vault still awards one item plus gold. The previously unsaved personal best now persists globally. Browser QA: 100 seeds, baseline jumps, fall/result/chest flows, prior-version save, camera/phone and co-op seed reconstruction. Remaining gate is Oliver's human pacing and visual feedback. Details: docs/design/TREASURE_SPRINT_REBUILD_2026-10-07.md.

## [Codex | 2026-10-07] Endless Dungeon quality pass shipped

Version 2.133.0 improves the separate Prison Break roguelite with revision-7 room layouts, distinct environmental workspaces and enemy packs, a Tier-2+ Watch Captain, route/art cues, and preparation/run UI. Older checkpoint revisions and the campaign/Descent modes are preserved. Tested 1,080 generated plans, 6,480 historical-plan hashes, 43,200 spawn sockets, 60 real jumps, full three-section escape, old-build checkpoint resume, co-op scaling and reward isolation. Human playtesting remains needed for difficulty, duration and visual quality. See docs/design/ENDLESS_DUNGEON_QUALITY_2026-10-07.md.

## [Codex | 2026-10-07] Endless Dungeon revision-8 extension

Version 2.134.0 adds an optional five-jump side room to each section of fresh Prison Break runs. The visible cache grants one persistent gold reward and, from Tier 2 onward, a class qualification seal. Main rooms, two chests per section, co-op ownership and revisions 1-7 are preserved. Browser tests completed 108 jumps and a full three-section run; old-layout jump/resume and co-op checks passed. Human playtesting still decides challenge, pacing and final art quality. See docs/design/ENDLESS_DUNGEON_QUALITY_2026-10-07.md.

## [Codex | 2026-10-07] Endless Dungeon art follow-up

Version 2.135.0 improves revision-8 cache-room stepping-stone art: tapered supports, iron collars, section-specific tops and warm edge cues. Collision, rewards and previous checkpoint geometry are unchanged. Browser traversal and one-time reward tests passed; visual acceptance still needs Oliver's playtest.

## [Codex | 2026-10-07] Sparring bestiary shipped

Version 2.136.0 adds 52 entries and 51 distinct model screenshot crops (one portrait is shared by an officer variant). It covers the campaign, special encounters and Prison Break, with searchable locations and combat tells. Bestiary stands are by the Sparring Room and inside it. Existing sparring practice remains separate. Browser checks passed for catalog interactions, all asset requests, desktop/phone layouts, and a previous-build save with its name/gold/zone retained. User visual judgment remains open.

## [Codex | 2026-10-07] Waystation hub quality

Oliver requested a broad hub improvement without losing existing services. Version 2.137.0 strengthens the current Lantern Court with district-colored flat paving, inlaid floor seals and compass, forecourt gardens, reused Briar trees and flowers, more distinct stations, a framed challenge edge, campaign signs, brighter sky and more useful minimap landmarks. Lamp art/colliders move together. All 24 interaction approaches remain reachable and labeled; purchases/reload, tour, desktop/phone and old-save checks passed. No gameplay/save progression rules changed. Final visual acceptance awaits Oliver's playtest. Details: docs/design/WAYSTATION_QUALITY_2026-10-07.md.

## [Codex | 2026-10-07] New Endless Dungeon direction

Oliver wants a much larger, more varied Prison Break roguelite and a mix of recognizable campaign enemies in it. Earlier original-only wording is superseded. Existing saves and three-section/three-tier progression remain. The brighter new Waystation is the preferred direction for future level art: colorful AQW-inspired readability rather than a uniformly dark-fantasy treatment. A revisioned expansion is being developed; record shipped scope and verification separately when complete.

## [Codex | 2026-10-07] Endless Dungeon expansion shipped

Version 2.138.0 expands fresh Prison Break attempts from 11 to 16 rooms per section with two required combat rooms, a seven-step main crossing, an optional elite store and a seven-step cache path. Original prison bosses remain; about half of ordinary encounter spawns now use real campaign foes and their existing combat behavior. New rooms have section-specific roles and a brighter sandstone/aqua/lavender palette. The bestiary includes these foes' dungeon location. Prison falls now say THE DROP and recover from the most recently cleared room. Old checkpoint revisions remain byte-identical in layout. Verified 1,080 fresh plans, 8,640 prior-layout comparisons, 64,800 safe spawn positions, 192 physical browser jumps, full three-section clear, one-time optional rewards, co-op scaling/isolation and a true prior-build save resume. Art is about 35-38k triangles and 9-10 draw calls per section. Human pacing, difficulty and visual review remain open; no SFX work.

## [Codex | 2026-10-07] Endless Dungeon objective pass shipped

Version 2.139.0 gives fresh Prison Break runs revision-10 workrooms and yards. Two visible ward crystals reinforce the workroom on a capped timer until broken; the yard requires holding a visible circle through three enemy groups. Host-owned progress supports either co-op player and unfinished rooms restart cleanly after a checkpoint. Earlier revision-1-to-9 plans remain unchanged. Browser checks covered real melee against a ward, reinforcement start/stop, hold pause/resume and partner occupancy, all three sections, rewards, co-op scaling/isolation, rendered desktop/phone views and a pre-change revision-9 save. Human playtesting still determines pacing and whether these encounters feel sufficiently distinct.

## [Codex | 2026-10-08] Existing campaign map pass

Version 2.143.0 makes six forward-route and environmental-logic repairs in the live full-size maps: cycling Keep lift with no parallel stair bypass, optional Thunder Cliffs cargo lift, Ellis notes that reveal the lead without an NPC return trip, forward Snowbound coil installation, direct Iron Halls cart repair, and Shipwreck's visible boat-part workbench. Navigation, quest copy and notices were updated with these paths. Old flags and alternate NPC help still function. Browser route/boat/co-op, level regressions, visual checks and a pre-change save load passed. The cart's short procedural roll is functional but visually modest; all-level pacing, puzzle enjoyment and final art quality remain open to Oliver's playtest. Next work should prioritize specific long empty segments and repetitive inputs in the existing maps, using normal-speed observation before adding content. See docs/design/CAMPAIGN_EXISTING_LEVEL_PASS_2026-10-08.md.

## [Codex | 2026-10-08] Spatial Frostfell crossing

Version 2.144.0 revises the live Deep Ice Caves main waterworks while preserving its save flags. The pump raises a float, the player jumps to its freeze valve, crosses a temporary ice sheet, and releases the far drain to make the bridge permanent. An overflow sluice on the near bank resets overfill and old wrong-height frozen states. Objective arrows, notes, interaction prompts, feedback and short Ellis explanation agree with the spatial route. Browser testing completed the jump and traverse at normal movement speed, verified wrong-state recovery, and confirmed host/guest crossing state. The older lower-channel optional puzzle is unchanged. Human playtesting remains necessary for fun and difficulty. See docs/design/CAMPAIGN_EXISTING_LEVEL_PASS_2026-10-08.md.

## [Codex | 2026-10-08] Ruined Keep escort defense

Version 2.145.0 makes Broken Walls' existing breach sequence a real protection task. Three prisoners have individual health bars and advance across the court; melee Legion attackers target them while a caster pressures the player. A fallen prisoner causes a brief retreat and safe retry. The spent bell prompt closes, the objective arrow follows the group from a useful distance, and co-op receives the same health and attack focus from the host. Story IDs and the optional chamber remain unchanged. Browser tests cover natural attacks, one-hit accounting, retry, success, and co-op state. Escort difficulty and pacing remain for Oliver to playtest. See docs/design/CAMPAIGN_EXISTING_LEVEL_PASS_2026-10-08.md.
## [Codex | 2026-10-09] Live Lost Canyon spatial follow-up

Version 2.146.0 replaces the optional freight-store direction sequence with an actual scaffold climb and high brake. The loaded cart starts at the store doorway, follows the rail bends to clear it, and reveals the same HP-04 shard. The main prisoner rescue and old lc.rail.open save flag remain. Browser tests physically crossed every deck, recovered from a fall, completed the normal route, checked co-op ownership, death/checkpoint behavior, all five regional shards, and a revision-2003 save. Static gate and unit checks passed. Shoulder-camera before/after images show the store opening. Oliver still needs to judge the route's difficulty and look in normal play. See docs/design/LOST_CANYON_FREIGHT_CLIMB_2026-10-09.md. Broader campaign quality work remains.

## [Codex | 2026-10-10] Thunder Cliffs tide route and campaign hunt notices

Version 2.147.0 replaces the optional Thunder Cliffs adjacent three-stone lock with a visible tide crossing and low-water release. Four separated rocks require jumps; narrow stones are hazardous during surges, the wide last landing is safe, and a low ledge recovers misses. The same SC-05 shard, tc.tide.open flag, main route, co-op story sharing and old saves remain. A full Thunder route, physical crossing, race, checkpoint, hydra, co-op and revision-2003 save passed browser QA; story and static gate passed. The systemic campaign patrol discovery panel is now a short hunt toast, preserving tracker/journal details and kill progression; browser QA passed. Human judgment is still needed for tide timing, art and overall pacing. See docs/design/THUNDER_CLIFFS_TIDE_PASS_2026-10-09.md and docs/design/CAMPAIGN_HUNT_NOTICE_2026-10-09.md.

## [Codex | 2026-10-10] Co-op combat authority follow-up

Version 2.148.0 repairs the host/guest class-identity split on enemy hits. The guest sends class, offensive passive, weapon buildup timing and designated-hit context; the host keeps enemy damage, reactions, DoT deaths and kill rewards authoritative. The guest receives actual-damage healing receipts. Warded basic hits refund spent Mage mana or Warlock HP and do not mark the rejected target. Two browser pages verified several classes, elemental buildup, Rune/Corruption payoff, companion/projectile hits and status snapshots. Existing PvP/class, co-op kill reward, Thunder Cliffs and old-save tests passed. This is not a class balance change; real-network timing and feel still need playtesting. See docs/design/COOP_ATTACK_OWNERSHIP_2026-10-10.md.

## [Codex | 2026-10-10] Snowbound camp ridge continuity

The Snowbound Peaks optional buried camp is now a physical survey-ridge climb. Its notebook, Heath's hint, seven ledges, high release, Winter Cloak chest and FF-02 shard all refer to the same site. Prior ff.camp.found, ff.camp.open and ff.cache flags remain valid; old partial marker entries are ignored and old notebook text is refreshed. Co-op shares the release and chest state, while each player takes FF-02 separately. The main crossing and signal route are unchanged. Verified with browser traversal, co-op, checkpoint and prior-save tests; Oliver's hands-on judgment of pacing and art is pending.

## [Codex | 2026-10-10] Great Furnace Cinder rescue

Version 2.150.0 replaces the optional cage's adjacent three-control code with a hot-feed shutdown, a host-owned guard response, and a final cage release after the bay is safe. Pipe/cage visuals and lock prompts expose cause and effect. The cage clue remains journaled without a reading panel over the fight. `gf.cage`, `gf.pet.open` and `gf.cinder` remain the durable identifiers; retired partial control progress is ignored, while an old completed rescue remains complete. Main story gates and Colossus-entry reward banking are unchanged. Full route, checkpoint, co-op and old-save browser checks passed. Human playtesting still decides the encounter's challenge and art quality. See docs/design/GREAT_FURNACE_CINDER_RESCUE_2026-10-10.md.

## [Codex | 2026-10-10] Great Furnace cooling-box gantry

Version 2.151.0 replaces the optional cooling-box shape sequence with a four-deck moving counterweight climb powered by the main cooled crossing. The lower grate and two steps return a missed jump. The upper chest has collision, a separate standing lane, a sliding lid and the existing ED-04 shard. The plate is an optional route clue. Prior partial button progress is ignored; `gf.cache.open` and ED-04 retain their previous meaning, including an old save whose box was already open. Co-op shares box state and host-clock platform timing while each player collects the shard personally. Browser checks covered physical traversal and failure recovery, under-landing interaction rejection, old-save reload, full route, death/checkpoint banking, co-op and normal-camera visuals. Human playtesting still decides timing and aesthetic quality. See docs/design/GREAT_FURNACE_COUNTERWEIGHT_2026-10-10.md.

## [Codex | 2026-10-10] Sky Library reflector

Version 2.152.0 replaces the optional sun-wing-sword button sequence with a rail-mounted reflector. The player grips it with E, walks sideways to sweep the beam, and holds it on the sword seal to open the display wall and reach the same SP-04 shard. The main route, shelf and archive branches are unchanged. The host owns the reflector and opening; either co-op player may operate it, and each claims the shard separately. Old partial button saves resume at the new fixture, while old completed displays remain open. Full Sky Library, checkpoint, co-op, prior-state reload, normal-movement, normal-camera and static/story checks passed. Human playtesting still decides the puzzle's clarity and visual appeal. See docs/design/SKY_LIBRARY_REFLECTOR_2026-10-10.md.
## [Codex | 2026-10-10] Homefields watchtower defense

Version 2.153.0 replaces the optional three-bell order on the live eastern Homefields tower with a warning-bell defense. Ringing it draws three small Legion waves; the final Watch Captain drops the key to the existing 180-gold chest. The west notice, north bell and east chest keep the roof approach clear, and a short tracker line reports the current wave. Host-owned enemy and story state, guest damage, old completed saves, mid-alarm reload and one-time reward were checked in muted browser QA. Physical stair traversal, ordinary interaction prompts, natural enemy pursuit and attack, the neighboring granary and static/story tests passed. Human playtesting still decides difficulty and visual appeal. See docs/design/HOMEFIELDS_WARNING_BELL_2026-10-10.md.

## [Codex | 2026-10-10] Black Woods split-tree root trail

Version 2.154.0 retires the optional bird-deer-wolf button order. The animal tracks now lead to a six-perch root climb; releasing the high binding opens the lower hollow and the existing personal BR-04 shard. The shared `woods.tracks.open` flag, Black Woods signal, Beth rescue, checkpoint and completed-save meaning remain intact. Old partial button progress is harmless. The new low-poly root art is batched into four materials and has generic 3D and voxel fallbacks. Muted browser QA covered a physical climb, intentional miss/recovery, ground interaction rejection, normal prompt, opening animation, both camera modes, full Black Woods routes, Beth, co-op guest release, old-save reloads, story-state tests and static gate. Human playtesting remains for difficulty and visual appeal. See docs/design/BLACK_WOODS_TRACK_ROUTE_2026-10-10.md.

## [Codex | 2026-10-10] Shipwreck Shore ballista chest - v2.155.0

Following the approved existing-campaign quality pass, replaced the optional sc.code numbered chest at the Lantern Wreck with a physical Rose Wreck ballista. Aiming and firing at the visible clasp opens the chest; returning to claim grants the existing Stormshot reward. The tracker waits for the claim. Kept sc.code.open, sc.code.note, sc.stormshot, main boat/voyage, old partial and completed saves, and host-owned co-op state. Retired old numbered controls and labels. Static/story tests, full shore route, miss and retry, physical return, old-save reload and two-page co-op QA passed. Human playtesting remains for aim challenge and visual quality. No custom SFX. See docs/design/SHIPWRECK_BALLISTA_2026-10-10.md.

## [Codex | 2026-10-10] Co-op class-effect ownership

Version 2.156.0 repairs a focused set of co-op skill effects whose status was previously guest-only. Host-owned enemies now receive class control, companion Roar, Beastmaster mark, Soul Tether/Conduit links, Death's Door and Final Curse timers, and Execution intent. Enemy snapshots carry the visible ongoing state. The host owns delayed HP changes and executes against current HP; guest mirrors do not duplicate damage. No persistent save fields changed. A 28-check two-page browser relay, prior-save reload, and co-op hit/healing/PvP/reward regressions passed. Real-network timing and combat feel remain unverified; specialized boss AI still follows its authored targeting rules. See docs/design/COOP_SKILL_EFFECTS_2026-10-10.md.

## [Codex | 2026-10-10] Winding Cliffs cargo chest

Version 2.157.0 replaces the optional three-number cliff chest lock with a six-bracket parkour climb. A high cable release raises cargo from the chest below; the lower trail catches a missed jump. The main freight bridge, lookout, Skip route, shard positions and reward stay intact. Old hp.code.open, hp.code.claimed and hp.cliffcache states retain their meaning; partial numeric progress is harmless, and old clue text refreshes. Muted browser QA covered normal-camera visuals, physical ascent, deliberate miss, once-only claim, full level route, partial/completed old-save reloads and a co-op guest release/claim. Human playtesting remains for challenge and visual appeal. See docs/design/HOLLOW_CLIFFS_CARGO_RELEASE_2026-10-10.md.
## [Codex | 2026-10-10] Great Furnace worker escort

Version 2.158.0 replaces the required two-bell order with a three-worker evacuation. The work bell starts the attempt after the passage opens; workers travel visibly on the foundry floor with health bars while three enemy waves try to stop them. The transport brake keeps its quiet-route advantage by reducing wave size. Failure resets the escort and permits a retry; reaching shelter and clearing pursuers sets the existing gf.evacuated flag. The shelter bell is now a landmark. The host owns encounter progress and mirrors worker status to guests. Prior partial bell input becomes harmless; completed saves stay complete. Muted browser QA passed the route, damage/failure/retry, full progression and checkpoint, prior-save, and two-page co-op checks. Human playtesting remains for feel. See docs/design/GREAT_FURNACE_WORKER_ESCORT_2026-10-10.md.

## [Codex | 2026-10-10] Palace Courtyard route choice

Version 2.159.0 makes the live courtyard's west and east balconies alternatives instead of requiring both before the mirrors work. Each existing upper patrol release and lower garden control now opens its side and a shared route flag; the unused side remains optional. Victor, notes, tracker, objective arrow, beam and library gate agree. A pre-existing one-balcony save derives the shared flag during sync. The fallback courtyard sky's oversized white sunburst was reduced after normal-camera screenshot review. Muted browser QA passed all four single-route combinations, physical traversal on west lower and east upper with the other barrier closed, old partial/completed saves, co-op guest release and mirror solve, full courtyard route, checkpoint banking and next-half retry. Human playtesting is still needed for route preference, visual polish and combat feel. The broader guidance scripts currently stop on separate stale Frostfell and Storm Coast expectations; the dialogue logic script stops on an older Great Furnace mismatch. See docs/design/PALACE_COURTYARD_ROUTE_CHOICE_2026-10-10.md.

## [Codex | 2026-10-10] Winding Cliffs bridge and lookout — v2.161.0

Gameplay commit 4cba252 was pushed to main from branch codex/approved-queue-20260917. The freight bridge now lowers over 1.5 seconds after the existing weight solve; old open-state flags display it fully lowered on build. The Legion Lookout has a named Cliff warden with a telegraphed cleave and recovery window instead of one ordinary shielder. Main route, upper rope bypass, NPC, shard and chest IDs were preserved. The static gate, story unit, 118-waypoint physical level route, new set-piece and visual test, two-page co-op phase/bridge checks, checkpoint and old-save tests passed. The new source, decision and register notes are tracked in this documentation batch. Human playtesting still determines whether the encounter and art feel right; the larger campaign quality backlog remains active. Pre-existing unrelated dirty art and prison QA files in this checkout were left untouched.

## [Codex | 2026-10-10] Lost Canyon signal pressure

Version 2.162.0 replaces the continuous alarm cable staircase with a short, recoverable bracket climb and makes the first noisy cage rescue activate visible signal posts. The host sends capped, recurring patrol pairs near party members in the holding yard until the cable is cut; cutting before a cage preserves the quiet route. Signal guards' attack reach is mirrored to co-op guests. All existing rescue, reward, shard and checkpoint identifiers remain. Static/story tests and muted browser checks passed the physical climb, miss/retry, chase and actual player damage, wave cap/refill/cut, full route, prior saves, checkpoint and two-page guest interaction. Human playtesting remains for difficulty, pacing and art. See docs/design/LOST_CANYON_SIGNAL_PRESSURE_2026-10-10.md. Custom SFX work remains on hold.

## [Codex | 2026-10-10] Campaign foot-soldier first-swing fix

Version 2.163.0 addresses a measured first-hit whiff in ordinary campaign foot soldiers. Grunts and watch sentinels use eight units of matching wind-up and hit reach so the first announced swing can damage a stationary player while a timed dodge or cover still prevents it. Tutorial trials, side modes, specialized enemies, bosses, attack timing and damage values are unchanged. Host enemy snapshots mirror reach; the Lost Canyon opening signal pair uses fixed plain-guard behavior. Muted browser first-hit/dodge/cover/trial checks passed three runs; prior co-op melee, campaign pursuit, Briar combat-role and canyon alarm/co-op checks passed. The broad natural-combat sweep has a separate Galewisp failure at an elevated Lost Canyon sample and remains open for diagnosis. Human difficulty playtesting remains. See docs/design/CAMPAIGN_MELEE_REACH_2026-10-10.md. No custom SFX work.

## [Codex | 2026-10-10] Galewisp combat consistency

Version 2.164.0 keeps the Lost Canyon Galewisp at the edge of a raised platform when a player shelters beneath it, requires physical clearance before its melee wind-up, and lets its warned dive descend to contact height. The generic role roll no longer gives this signature-diving enemy the exploder behavior that could end the attack in a self-destructing blast. Other flyers, damage, timing, saves, trials and custom SFX are unchanged. A fixed-slice muted-browser cover/hit/dodge regression passed 20 consecutive runs; static gate, Lost Canyon route/climb/checkpoint/old-save/co-op, campaign pursuit, Briar role and enemy navigation checks passed. One co-op guest bootstrap check initially failed on missing script globals and passed when rerun independently. The broad natural-combat sweep still asks a Galewisp to hit through the canyon bracket at an artificial under-cover test point; that is not a valid strike expectation. Human playtesting remains necessary for the feel and pacing of this encounter and for the wider campaign. See docs/design/GALEWISP_COVER_DIVE_2026-10-10.md.

## [Codex | 2026-10-10] Ruined Keep arrow-post sightline

Version 2.165.0 lowers only the eastern fortress wall beneath the arrow-post deck so the wall continues to block ground passage but no longer rises through the 150-unit fighting surface. The caster can kite, fire and damage an exposed player from that post. The western wall, arrow mechanism, quest, save and co-op identifiers are unchanged. The module script URL was bumped so existing browser caches load the corrected geometry. A focused muted-browser check passed three runs for ground collision/cover, upper sightline and player damage; the full Keep route, checkpoint reload, two-page co-op, escort defense, content unit and static checks passed. Normal-camera screenshots show the deck without wall blocks through it. Human playtesting remains for difficulty and aesthetics. See docs/design/RUINED_KEEP_ARROW_POST_SIGHTLINE_2026-10-10.md. No custom SFX work.

## [Codex | 2026-10-11] Winding Cliffs freight cart

Version 2.166.0 replaces the required bridge's nearby weight-combination inputs with a loaded cart, visible rail/plate and separate bridge winch. The cart and collider travel together; the plate sinks and lights; the bridge keeps its lowering animation and walkable deck. An existing cliff pillar was moved clear of the siding after normal-camera review. `hp.weight.open` is retained as an internal old-save readiness alias, with `hp.bridge` and every route/reward identifier unchanged. Muted browser QA passed direct E interactions and premature feedback, the 118-waypoint full route, cargo climb, combat/quiet lookout paths, two-page co-op including guest push and winch, checkpoint and old partial/ready/completed bridge saves. Story authority, state, guidance and dialogue logic checks passed. Broad campaign quality remains PARTIAL and human playtesting remains for feel and art. See docs/design/WINDING_CLIFFS_FREIGHT_CART_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Long Ascent stair consequence and detailed art — v2.167.0

Two lower/upper catches now retract barred, collision-backed openings on the following spiral flights, with a short camera glance, clearer journal notes and old-save compatibility through unchanged la.lower/la.upper flags. A local camera angle and thinner north-side shaft supports keep the player visible. Six castle/palace wrappers now share the loaded deep-art module, ending a verified generic-voxel fallback. Muted browser checks passed closed/open gate traversal, 259-waypoint Long Ascent route, combat, checkpoint, two-page co-op sharing and all six affected detailed-art builds. Older Guardian Hall and Palace Courtyard preview-capture scripts expect a retired Show full line UI label; their gameplay checks passed. Human playtesting remains for pacing, missed-jump recovery and art. See docs/design/LONG_ASCENT_STAIR_CATCHES_2026-10-11.md. No custom SFX work.
## [Codex | 2026-10-11] Sky Library shelf crossing, v2.168.0

Optional SP-03 shelf branch changed from clustered linkedRotate knobs to two staged cranks and six physical folding shelves. The lower catch row recovers missed jumps. Relevant files: public/3d/sky-library.js, story/sky-library.json, puzzle-feedback.js, index.html. Muted Chromium passed direct route, fall/return, main-path independence, old completed and partial story state, two-page co-op, plus inline syntax guard and node story tests. User playtest still needed for feel and discoverability. No custom SFX added. Continue the broader level-quality pass; do not claim all campaign levels are finished.

## [Codex | 2026-10-11] Deep Ice Caves service-ledge crossing — v2.169.0

The optional lower-channel FF-04 route now uses five climbable ledges and a hanging spill-plug release instead of three adjacent toggles. Dropping the plug visibly reroutes spring water to the chiller and freezes the existing bridge. The release was moved aside after normal-camera review so it does not hide the hero. The tracker remains open until the shard is collected. Main waterworks, reward, save and co-op identifiers remain. Muted browser checks passed movement, miss/recovery, floor gating, old complete/partial states, checkpoint, full cave route, main float crossing and two-page co-op. Human playtesting remains for difficulty and art; continue the broader campaign-quality backlog. No custom SFX work. See docs/design/DEEP_ICE_SIDE_SPILL_2026-10-11.md.

## [Codex | 2026-10-11] Homefields granary, v2.170.0

The optional granary now asks for a lower trough alignment and an upper hopper release rather than a three-handle weight sum. Grain visibly misses or reaches the hanging basket; the basket descends and the collision-backed store door rises over 1.5 seconds. A framed hopper replaces the first oversized blockout. The barn's exterior roof trim hides only while the player is inside, fixing the far-camera obstruction. Journal notices move below a concurrent chest reveal and clear of the minimap. Story flags home.grain.open and home.grain.cache remain stable; old completed saves render the door open, and old partial weights do not solve it. Muted browser QA passed the loft route and interaction height, both gate states, reward, checkpoint rollback with retained gold, co-op action split and duplicate snapshot; node story checks and dialogue logic passed. Human playtesting still determines whether the optional puzzle and art feel satisfying. Continue the campaign-wide level pass. See docs/design/HOMEFIELDS_GRANARY_CHUTE_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Broken Walls supply-hoist return quest, v2.171.0

Food for the Refuge now uses four staggered service ledges leading to an upper brake instead of three nearby number weights. Releasing the brake raises a counterweight, lowers the food basket and changes the tracker to floor collection. Missed jumps recover safely. Keep rv.supplies.balance.open, the food reward and accepted/ready/done states; collected food is saved immediately and may be delivered without finishing Broken Walls. Old partial weight values remain unsolved, completed hoists stay open, and ready/done revisits do not show food again. Muted browser checks covered route/miss/retry, floor gating, collection, legacy-shaped save reload, two-page co-op, the entire Broken Walls route and its separate shard trial. Static and story checks passed. Human feel and art remain unverified; this is one scoped step in the larger campaign-quality pass. See docs/design/RUINED_KEEP_SUPPLY_HOIST_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Ruined Keep dungeon lift winch, v2.172.0

The required lift's three nearby weight toggles are replaced by a physical winch on the platform. Walking around its handle visibly raises the lift and rescued group; reversing cannot farm progress, and release or falling lowers it for another try. The host owns completion, guests can operate it, and a disconnected operator releases the handle. `kd.lift.open`/`kd.transfer`, old completed saves, late-rider cycling, Sly, lower works, shards and boss route remain. The quest tracker and journal use direct action wording. Muted browser solo, two-client, old-save, checkpoint, optional and full-route checks passed, with a normal-camera visual review. A transient story-file request now retries so one network miss does not erase every dialogue book. Human feel and visual-quality playtest remains. See docs/design/RUINED_KEEP_LIFT_WINCH_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Ruined Keep lower works, v2.173.0

The lower RK-03 branch now has three phased physical presses, safe gaps and a brake after the third press; the two earlier weight-answer banks and latch have been retired. The brake opens `kd.deep.open` and the same shard gate. A caught player takes modest damage and is knocked back, with no softlock. The side brake has collision so the hero cannot stand inside its model. Muted browser QA passed press phases, actual movement crossing, deliberate hit, accessible brake, gate/shard, full dungeon, checkpoint, old partial/completed saves and two-page co-op. Camera/art were inspected after correcting a near-camera obstruction. Human challenge and final art feel remain open. No custom SFX work. See docs/design/RUINED_KEEP_LOWER_WORKS_2026-10-11.md.

## [Codex | 2026-10-11] Lost Canyon north prisoner crossing, v2.174.0

The previously identical cage releases now diverge in actual play: south opens directly; north requires escorting two damageable prisoners across an exposed lane while clearing two pursuer waves. A live signal creates more pressure; cutting it first reduces each wave. A failed crossing resets at the open cage. The old `lc.north` completion flag is retained and prior completed saves stay complete. Host-owned crossing state and guest proximity work in co-op. Full Lost Canyon, alarm, shard, older-save and two-client checks passed in muted browser QA. The two prisoners use distinct civilian models after normal-camera inspection. Oliver's human playtest remains necessary; do not claim broader campaign polish complete. No custom SFX work.

## [Codex | 2026-10-11] Castle Gates crossing, v2.175.0

The Castle Gates required bridge approach is now a short broken-drain parkour route. One far brake lowers a return walkway; the nearby wheel lowers a real colliding bridge. The old east catch is inactive but loadable, while old completed bridge flags remain valid. Unit, real-input, miss/retry, legacy-state, full-route, combat, disguise, checkpoint, navigation and co-op browser checks passed. The broader campaign quality pass is still in progress, and Oliver has not yet playtested this change. See docs/design/CASTLE_GATES_DRAIN_CROSSING_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Shipwreck Shore hull cargo, v2.176.0

The optional SC-01 lower hatch now opens by timing the release of a swinging cargo cage over a marked brace, replacing the three 1/2/4 weight switches. An early pull gives a brief cue and is retryable; the cargo strikes the brace, lifts the hatch and exposes the existing lower ramp and shard. sc.hull.open remains the save and co-op truth. Old partial weight data is inert, and old completed saves load open. Muted browser checks passed normal E input, miss/retry, the complete shore and boat voyage, checkpoint, old partial/completed states, lower-path access denial and guest-operated release. Static story checks passed. Oliver has not yet judged feel or final visual quality. The campaign-wide level-design work remains open. No custom SFX work. See docs/design/SHIPWRECK_HULL_CARGO_RELEASE_2026-10-11.md.

## [Codex | 2026-10-11] Palace Courtyard sunbeam, v2.177.0

The main Palace mirror path is now visible as a warm ray and dark-edged floor projection, with rotating reflective faces, lit-hit pedestals, moving direction points, edge impacts and a sun receiver that lights the library threshold. `pc.light.mask` and `pc.light.open` remain the story/save truth; old completed saves without a stored mask display the solved alignment. Browser screenshots for initial, wrong, partial, solved and legacy-open states were visually reviewed. Full courtyard, checkpoint and two-client co-op checks passed, as did node story validation. Oliver's human judgment of puzzle feel and art remains open; the wider campaign-quality goal is not complete. No custom SFX work. See docs/design/PALACE_SUNBEAM_READABILITY_2026-10-11.md.

## [Codex | 2026-10-11] Great Furnace cooling pedal, v2.178.0

The mandatory three-control cooling sequence is replaced with a floor pedal and three attack waves. Holding it lowers heat and shows flowing water; stepping away reheats the crossing. Completion keeps `gf.cool.open`, the broken bridge and counterweights. Host authority accepts a guest standing on the pedal. Legacy partial values are inert; previously complete flags restore the bridge. Main route, quest guidance, checkpoint, guest/host, old-complete and normal-camera browser checks passed. Oliver has not yet evaluated encounter feel or final visuals. Campaign quality remains partial. No custom SFX work. See docs/design/GREAT_FURNACE_COOLING_PEDAL_2026-10-11.md.

## [Codex | 2026-10-11] Long Ascent service vault climb, v2.180.0

The optional service vault now has six staggered, collision-backed rack ledges, a lower recovery shelf and a high brake. The entrance and masonry were revised so the climb is visible from the linen room. Releasing the brake visibly retracts the bars and preserves `la.vault.open` and CD-03; old complete saves reopen the vault, and partial wheel values are ignored. Main rescue, lift and summit progression remain. Voice manifest requests now share one in-flight fetch and a short cache, with retry after failure. Muted-browser physical traversal, miss/retry, old-save, two-client and checkpoint checks passed; human feel and art review remain. The full campaign quality goal is still open. See docs/design/LONG_ASCENT_VAULT_BRAKE_2026-10-11.md. No custom SFX work.
## [Codex | 2026-10-12] Black Woods signal canopy, v2.181.0

Replaced the continuous eastern signal walkway with 21 spaced, tree-supported timber perches, a recognizable horn belfry and the optional BR-03 loft spur. A missing floor connection below the descent now leads back to the north trail. The ground crank, upper cable, story flags and reward identities remain intact. Muted real-browser checks passed the full climb and descent, optional shard, deliberate miss/retry, ground route, banked-shard reload, older partial/completed save, two-client co-op, generic 3D and voxel fallbacks, story tests and syntax. Start, middle and signal-deck frames were inspected for visible footing and controls. Human challenge and final art assessment remain open; the campaign-wide quality pass remains in progress. No custom SFX work. See docs/design/BLACK_WOODS_SIGNAL_CANOPY_2026-10-11.md.

## [Codex | 2026-10-12] Campaign surfaces and readiness, v2.182.0

Shared campaign kits now use cached world-scaled surface detail, brighter regional lighting, established nature trees, coastal beveled geometry, pillar trim/fluting and furnace/window ornament. Corrected Ward/Martin clipping, a Thunder Cliffs camera-blocking overhang and stale/unreadable area intro text. All 24 campaign scenes rendered in three camera modes without page/shader errors. Fresh-player creator/tutorial, an actual pre-change save, 24 distinct checkpoints, earned-progress preservation, route/guidance, local two-client co-op, solid-wall pixels, low quality and renderer fallback checks passed. Detailed evidence: docs/art-validation/campaign-readiness-2026-10-12.json and docs/design/CAMPAIGN_PLAYTEST_READINESS_2026-10-12.md. Human playtest, real-network and lower-end-device verification remain open. Not every asset was remodeled; wider campaign quality is not declared complete. No custom SFX work. Preserve unrelated preexisting work in companion3d.js, prop3d.js and articulated-rigs.json.

## [Codex | 2026-10-12] Campaign footing and healing sites, v2.183.0

Continued the approved core campaign pass across all eight regions. Grounded authored enemies and their repeating patrols using bounded deterministic placement; explicitly corrected off-path guards. Repositioned 20 finite healing sites from unsupported/obstructed/stair locations onto adjacent clear floor. Added regional rest-site meshes, charge indicators and local reachable-only instructions. Rest charge and quest locks remain unchanged. Fixed the missing lower Thunder Cliffs lift dock, the inaccessible Lost Canyon cache and missing fallback scenery colors that could halt rendering. Updated misleading hub tips about campaign entry and kept progress.

Muted browser checks passed: 206 ground enemies across 16 halves, 39 patrol refills, 57 rest-site floor checks and actual healing at every unlocked finite site, eight regional visual samples, finite/spent/locked/unlimited healing, two real movement-and-E approaches, 134 Thunder Cliffs waypoints, class disguise behavior, 24 scenes in three camera modes, fresh creation, a pre-change save, 24 checkpoints and 11 local two-client progression checks. Pause and renderer fallback hide the contextual rest hint. See docs/art-validation/campaign-footing-2026-10-12.json and docs/design/CAMPAIGN_ENCOUNTERS_AND_REST_2026-10-12.md. Human playtest, real-network co-op and low-end performance remain unverified. This does not close the broader campaign quality goal. No custom SFX work. Preserve unrelated companion3d.js, prop3d.js and articulated-rigs.json edits.


## [Codex | 2026-10-12] Chest reference redesign — approved

Exact user request: "Btw you made the chests all one of color of their rarity, I want them redesigned to look more like these"
Reference: attached 1-Photo-1.jpg (1B511883-7627-4B56-84C8-C2344F5F1732), five chests from common to legendary. Visible brown timber throughout; plain iron, green patinated metal/leaves, silver and blue gems, violet ceremonial panels/crystals, then elaborate gold/red sun ornament. Progressively larger and more ornate. This corrects the existing monochrome rarity treatment; it does not change chest odds, rewards or placements. Preserve hinged lids, mimic breathing, one equipment item, the skippable reveal, personal co-op claims and saved outcomes. Grounded plan: docs/design/CHEST_REFERENCE_REDESIGN_2026-10-12.md.


## [Codex | 2026-10-12] Chest reference redesign, v2.184.0

Implemented all five shared rarity chests using brown timber, curved plank lids, riveted metal frames, true interiors, gemstone settings and tier-specific ornament: patinated leafwork, silver/sapphire fittings, violet banners/crystals, then gold sunburst/lion-like bosses/burgundy cloth/crown fins. Geometry is cached and merged: 7,216-11,763 triangles and 8-13 material meshes per chest; bodies and lids remain separate for opening and mimic breathing. Existing rarity scales, reward odds, locations and personal claims are unchanged. Title > Dev previews now links to a phone-friendly model workshop with rotate/zoom, all five tiers, opening and mimic views. User reference and two validation screenshots are preserved in the repository.

Muted real-browser checks passed every tier closed/open, finite geometry/bounds, shared caches, ground contact, opening/mimic/saved-open state, three camera modes, three campaign lighting samples, low detail, renderer fallback, desktop/phone/E/reduced-motion reveal, one item and duplicate/overflow handling, dungeon checkpoint and old campaign save, and local two-client reward/reconnect checks. Existing chest probability tests passed all 200,000 interval samples. Evidence: docs/art-validation/chest-craft-2026-10-12.json. These are implementation/visual checks; user aesthetic acceptance and physical network co-op are not claimed. No custom SFX work.


## [Codex | 2026-10-12] Return to campaign improvements — requested

Exact user request: "Ok once you finish making the chests look awesome, please get back to improving all the campaign levels all the way around". The chest redesign shipped as v2.184.0. Continue existing campaign improvements, using inspected shortcomings and normal-camera checks, while preserving current story, quests, save contracts and the custom-SFX hold. The next bounded pass addresses indistinct clue/pickup props across the campaign, interaction through solid walls, and stale quest wording about retaining earned progress. Scope and verification: docs/design/CAMPAIGN_OBJECTS_AND_INTERACTION_2026-10-12.md. The general campaign quality objective remains open.


## [Codex | 2026-10-12] Campaign object detail and interaction correctness, v2.185.0

Implemented 62 crafted clue/pickup props in all 16 campaign halves with 20 reusable models plus two supports. Corrected 17 unsupported, buried or obstructed placements. Solid-wall reach now applies both to local prompts and host story authority; coastal wall collisions match drawn height. Readables remain after reading; physical items disappear from persistent/shared pickup state. Fixed two misleading earned-progress journal messages, wind-caption placement and Shipwreck Shore cargo/chain obscuring the rudder pickup view.

Verified all mapped props, 18 pickup/save/deduplication flows, 238 state-appropriate interaction approaches, older save, 24 campaign checkpoints, 184 coastal movement waypoints, 12 guidance checks, 11 cooperative route checks and seven new cooperative clue/pickup checks. Representative normal-camera frames inspected in each half; selected evidence saved. See docs/design/CAMPAIGN_OBJECTS_AND_INTERACTION_2026-10-12.md and docs/art-validation/campaign-objects-2026-10-12.json. Co-op uses local browser packet relays, not public-network testing. Human feel, aesthetic acceptance and slower-device performance remain open; the broader campaign improvement request is not closed. No custom SFX. Unrelated companion3d.js and articulated-rigs.json edits excluded.


## [Codex | 2026-10-12] Custom 3D asset shortlist — requested, recommendations only

Exact user request: "Please also help come u with a list of assets that we should create detailed custom 3d models for that would significantly improve the  graphics". Created docs/design/CUSTOM_3D_ASSET_PRIORITIES_2026-10-12.md from current renderer/source and screenshot inspection. Proposed priority: natural terrain silhouettes, village/fortress architecture, traversal structures, functional machinery, then regional landmarks and purposeful dressing. Reuse good existing trees, preserve the latest chest/prop work and brighter color direction. The list and suggested first comparison batch are proposals, not evidence of user approval or implementation. No gameplay changed by this planning step.


## [Codex | 2026-10-12] Full campaign asset shortlist — approved for implementation

Exact user request: “I’d like you to improve every single asset you listed in every single level ! Do it now”. This explicitly approves all nine model families and all eight regional landmark groups in docs/design/CUSTOM_3D_ASSET_PRIORITIES_2026-10-12.md. The earlier recommended comparison batch is no longer a scope limit. Apply appropriate families throughout the existing campaign, preserving layouts, collision, parkour, stateful machinery, story, saves, co-op and the custom-SFX hold. Reuse the established higher-quality trees. Continue the brighter colorful stylized fantasy direction. Implementation and evidence are tracked in docs/design/CAMPAIGN_CRAFT_IMPLEMENTATION_2026-10-12.md; do not equate automatic coverage checks with human aesthetic acceptance.


## [Codex | 2026-10-12] Full campaign environment shortlist implemented — v2.186.0

All nine approved environmental model families now have appropriate upgrades across all eight campaign regions. Added a 59-model reusable procedural library, fitted kit replacements and 678 authored components across 24 campaign scene snapshots, including cottages/mill/barn, cliffs/caves, bridges/cages, rescue lift, laboratory, furnace/presses, wrecks/crane/ballista, palace fountain/mirrors/library, and castle gate/stair/lift/throne surroundings. Retained good mature trees, working ship, and existing detailed machinery where appropriate. Four standalone library variants (door, scaffold, perch, shelf) are not blindly inserted; their campaign roles use integrated cottage detail and fitted improvements to existing route structures.

Geometry is cached, merged, instanced and distance culled. Moving parts follow the existing gameplay state; story, loot, saves and route collisions remain intact. Title > Dev previews > Campaign environment opens the model workshop. Verified 24 campaign scenes, 59 workshop models, 12 mechanism assertions, unchanged imported-kit bounds, 238 reachable interactions at the appropriate puzzle state, prop footing, 24 checkpoints, pre-change save, seven local co-op clue/pickup checks, and 184 coastal waypoints. Visual review corrected duplicate furnace bodies, dark lantern casings, canopy/camera obstructions, rock artifacts and workshop phone framing. See docs/design/CAMPAIGN_CRAFT_IMPLEMENTATION_2026-10-12.md and docs/art-validation/campaign-craft-2026-10-12.json. Human aesthetic acceptance and low-end/public-network testing remain open. Broader campaign improvement goal remains open. No custom SFX work. Excludes unrelated companion3d.js/articulated-rigs.json edits.


## [Codex | 2026-10-12] Campaign geography, materials and blueprints — v2.187.0

Implemented U-GEO-20261012 and follow-ups B/C/D: purposeful terrain/boundaries across all eight campaign regions, connected Keep courts/dungeons, Sunspire garden axis and library rooms, and contextual recovery on ordinary ground. All 24 scene bounds retain their previous scale. Deliberate mill/lift/shelf/lava/moat gaps and route alternatives remain. Seven Keep/Sunspire route connections were physically checked; moved the records bookshelf out of its walking lane. Shared 512px painted surfaces add floor/wall definition without tessellation; large walls use textured relief rather than grids of tiny brick meshes.

Title > Dev previews > Campaign blueprints opens sixteen interactive plans with previous/updated footprints, actual routes, height slices/profiles, real objective markers and authored branch purposes. The latest request arrived mid-build: plans review this pass before publication; subsequent layout changes begin with blueprint updates. Correctly mark Thunder's lift and the library records as optional.

Validated 123 geography assertions, 238 state-appropriate interaction approaches, 24 scene renders, 24 checkpoint restores, pre-change save, twelve mechanism behaviors, palace alternative routes, prison repeated lift travel, seven local co-op pickup/clue assertions, targeted movement/climbs and 55 desktop/phone blueprint checks. Repaired the old Thunder route-only test fixture so a legitimate rank-up choice no longer stalls its movement; race/hydra traversal passes. Scope/results: docs/design/CAMPAIGN_GEOGRAPHY_2026-10-12.md and docs/art-validation/campaign-geography-2026-10-12.json. Human pacing/aesthetic acceptance and slower-device/public-network tests remain open. No custom SFX work. General campaign quality objective remains open. Unrelated companion3d.js/articulated-rigs.json changes excluded.


## [Codex | 2026-10-12] Geography release verified live

Commit 849622db pushed to main. Cloudflare Pages succeeded. Fresh production browser confirmed v2.187.0, the actual title > Dev previews > Campaign blueprints link, all sixteen plans and the updated Keep geometry/render with no page or WebGL errors. Live: https://bladefall.pages.dev/design/campaign-geography/ . Detailed production evidence added to the geography QA report.


## [Codex | 2026-10-12] Briar player journey — v2.188.0

Implemented the first region of the approved sequential campaign finishing pass. Live Homefields/Black Woods retain their large bounds, optional granary/orchard/canopy/root routes, rewards and existing detailed assets. Joined trails and nine destination boards clarify navigation. The mill now uses a movable grain crate and pressure plate, with a visible sluice, interrupted water, jammed wheel and lowering bridge. One co-op operator owns the crate; reset/disconnect and old partial/completed states remain safe. Mara activates the escape task on delivery. Two signal defenders now occupy their intended ground storey, and superseded mill notices clear from the overlay without deleting journal entries.

Validation passed: 20 main-route assertions across 69 physical movement waypoints to the Brute checkpoint; seven existing optional-route/combat regressions; seven two-client co-op checks; four saves created by the v2.187 main HTML preserving gold, character/class XP, equipment and name; uncut normal-camera mill interaction with mistake/recovery; actual attacks by both corrected ground guards; 55 desktop/phone blueprint checks; story, authority, Briar and syntax tests. Navigation fixtures stun enemies; combat probes are separate. Co-op transport is a local relay. Human pacing/art judgment, real-network behavior and low-end performance remain open.

See docs/design/BRIAR_JOURNEY_2026-10-12.md and docs/art-validation/briar-journey-2026-10-12.json. The broader campaign pass is still in progress; Hollow Cliffs is next. No custom SFX work. Unrelated companion3d.js and articulated-rigs.json edits are excluded.


## [Codex | 2026-10-12] Briar release verified live

Commit fc785605 pushed to main. Fresh production browser confirmed v2.188.0, the title > Dev previews > Campaign blueprints link, all sixteen updated plans, the mill plate marker, full-sized Homefields, the new rendered mill and correct completed bridge collision. Detailed, world-fallback and voxel rendering retain the appropriate puzzle props with no page/WebGL errors. Production results are recorded in docs/art-validation/briar-journey-2026-10-12.json.


## [Codex | 2026-10-12] U-HUD-PREVIEWS-20261012 — visual choices before rollout

User requests a less busy HUD and several visual alternatives to choose between before applying. Exact source and grounded plan: requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md (relative to docs/). Build an isolated, interactive comparison of Classic Compact, Adventure Focus and Combat Focus using actual game scenery and existing icons. Include exploration, combat, reading and co-op states. Add access from Dev Previews. No gameplay HUD replacement, preferences or saves change until a direction is selected. Broader campaign finishing remains open. Status: in progress.


## [Codex | 2026-10-12] HUD comparison previews — v2.189.0

Built three isolated choices: Classic Compact (familiar corners), Adventure Focus (map and objective together), and Combat Focus (health/mana with skills). Access: title > Dev Previews > HUD designs, or /design/hud-preview/. Real Briar scenery and existing icon art, five illustrative states (exploration, combat, reading, co-op, beginner), actual current-HUD comparison, desktop/laptop framing, full-size phone panning and fullscreen. Clickable skill cooldowns and clue dismissal/reopening demonstrate behavior. Optional gear/gold stays available. The preview never loads the game or reads/writes saved characters and settings.

Verified 60 layout/state/detail combinations without intersecting primary panels or escaped bounds; assets, cooldowns, clue controls, deep links, comparison, fullscreen and phone overflow checks pass. Visual inspection covered A/B/C and phone. An actual v2.188-generated save retains character/class XP, gold, equipment, name and story flag after loading v2.189. Main-game changes are only version, preview-menu wording, and its link. Report: docs/art-validation/hud-previews-2026-10-12.json; source/plan: docs/requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md. A fixture correction was needed to persist the story flag through the authoritative campaign save object.

Status: previews ready for choice; no new gameplay HUD applied. Selection and any combined layout remain for Oliver. The approved sequential campaign pass remains open with Hollow Cliffs next. Unrelated companion3d.js/articulated-rigs.json edits excluded.


## [Codex | 2026-10-12] HUD preview readability — v2.189.1

Before delivery, enlarged health/mana numbers and adjusted companion spacing in A/B. Rechecked all 60 preview combinations, phone fit/full-size, fullscreen, and interactive controls. The gameplay HUD remains unchanged. Final publication and selection are tracked with the same HUD preview report.


## [Codex | 2026-10-12] HUD previews verified live

Commits 02da2aa0 and dbd3881a published. Fresh production browser confirmed v2.189.1, actual title > Dev Previews access, all three layouts with their artwork and clue panels, and switching layouts in fullscreen without page errors. Review URL: https://bladefall.pages.dev/design/hud-preview/ . Gameplay HUD selection remains pending; no rollout has occurred.


## [Codex | 2026-10-12] HUD preview feedback — preferences, no rollout

User favors an upper-corner minimap and the paper-style clue cards. HP/mana placement remains undecided. They flag missing equipment comparisons and ask about Skyrim-like navigation/settings and further ideas. Exact feedback and inspected pickup behavior appended to requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md (under docs/). Keep immediate bagging; comparison presentation must not duplicate inventory actions. Recommendation: restore useful loot comparisons, preview independently selectable vitals placement and map/compass modes, and preserve readable notes. These recommendations are not approval for a particular new gameplay HUD. Existing preview and game are unchanged by this discussion. Campaign finishing remains open.

## [Codex | 2026-10-12] U-HUD-BAG-20261012 — visible bag capacity (preview)

User reports unclear overflow sales and proposes a HUD bag icon/capacity count. Add a clearer preview of normal, nearly-full and full states with explicit auto-sale wording and a simulated pickup outcome. Exact source and acceptance checks: requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md (under docs/). Status: preview in progress; live HUD selection remains open. Preserve instant bagging and existing full-bag auto-sale behavior; no new loss-protection policy inferred. Larger HUD redesign and campaign finishing remain open.

## [Codex | 2026-10-12] Bag capacity HUD previews — v2.189.2

Implemented U-HUD-BAG-20261012 in the isolated HUD comparison. All three designs now include a persistent bag icon, labeled used/capacity count, free-slot text, amber near-full warning and explicit red full/auto-sale warning. A bag-state selector and simulated equipment pickup demonstrate the last free slot, overflow sale and gold feedback; the item outcome always distinguishes kept from sold. Clicking the bag (or B) explains the rule; Escape closes that explanation. Current-game comparison disables these sample controls.

Browser verification: 54 layout/screen/situation/capacity combinations, six help-panel layouts, last-slot and repeated-overflow transitions, keyboard help, phone width/full-size scrolling and screenshots. Fixed a laptop spacing overlap. No remaining tested panel overlaps, missing images or preview page errors. Evidence: docs/art-validation/hud-bag-preview-2026-10-12.json and .jpg. Main-game source is byte-equivalent after normalizing VERSION3D; no inventory, save, sale-policy or gameplay HUD implementation changed. A fresh first-tutorial character in the old build did not establish a saved mode, so that attempted old-save check is not counted as a successful compatibility test.

Preview ready for review at /design/hud-preview/?design=b&scene=clue&bag=full. Full HUD rollout, equipment comparison redesign and navigation/vitals selection remain open; earlier proposals have not been silently applied. A buyback/recovery safeguard for overflow items would require a separate policy decision. Campaign finishing remains open. Unrelated companion3d.js and articulated-rigs.json changes excluded.

## [Codex | 2026-10-12] U-CLASS-SKINS-20261012 — next after HUD

User requests a major improvement to unlockable class skins, reporting widespread clipping and weak visuals, explicitly after finishing the HUD update. Queue a full earned-appearance quality pass across every class/tier next, ahead of returning to campaign finishing. Exact request and acceptance scope: requirements/USER_SOURCE_2026-10-12_CLASS_SKIN_REWORK.md (under docs/). Preserve rank-5/rank-10 unlocks, distinctive class palettes/details, cosmetic-only behavior, Stylist access, per-class saved selection and rank-10 cheat unlocks. Review motion, weapons/capes, previews and co-op appearances; previous static/gallery verification did not prove full animation clearance. Status: approved/queued, not implemented. HUD selection/rollout remains unfinished and takes precedence.


## [Codex | 2026-10-12] Adventure HUD applied — v2.190.0

U-HUD-ADVENTURE-20261012 implemented: compact upper-left health/mana and companion, upper-right map/next objective, bottom-center skills/character XP/class rank, persistent bottom-left bag capacity and Auto-sell ON/OFF, plus queued equipment comparisons above the bag. Notes use the approved paper appearance and remain readable until dismissed. Short screens defer loot while reading; card position follows the bag's actual height. Optional tasks are collapsed initially but remain available in the tracker/journal.

Auto-sell is a saved explicit preference, default OFF for new and legacy profiles. OFF immediately bags equipment only when a slot exists; a full bag leaves ground gear untouched and chests unopened. ON sells new equipment, including chest gear, with clear sale feedback. Quest items stay separate. Comparison cards never grant or sell an item, show stat gains/losses and equipment restrictions, and can be reopened using Loot. Existing prison currency handling remains in its own grant path.

Mana badges sit at each skill's upper-left and respond to passive cost changes. Shared prompts now use current keyboard/controller mappings (including secondary-only and unbound states), covering hotbar, bag, journal, interaction, travel, tutorial/confirmation and chest skip controls. Fixed the objective-panel journal button's camera-input obstruction. Original concept pages are marked as an archive rather than claiming the live HUD is unchanged.

Validation: thirteen inventory/binding browser assertions, actual collision pickup preservation/collection, unopened/full chest then exactly-once grant and explicit sale, saved preference/rebinding reload, mana-cost rendering for all seventeen classes including the Mage health-dependent reduction, real Settings rebinding and class confirmation/cancel, paper/loot queuing, companion rendering, 1440x900, 1280x720, 1024x768 and 390x844 layouts. A v2.189.2-created save preserves name, 654 gold, character level 8 / XP 77, Warrior rank 7 / XP 123, rare armor and completed tutorial; auto-sell defaults OFF. Syntax, journal queue and story-authority checks passed. Evidence: docs/art-validation/adventure-hud-2026-10-12.json and three screenshots. Physical controller and physical phone testing remain open; screenshots use an isolated local fixture, not a human gameplay verdict.

Next authorized task: improve all earned class skins (U-CLASS-SKINS-20261012). Not started in this HUD pass. Campaign finishing still open. Unrelated companion3d.js and articulated-rigs.json changes excluded.


## [Codex | 2026-10-12] Adventure HUD verified live

Commit d7cc86fe pushed to main. Cloudflare Pages reports success. Fresh production browser confirms v2.190.0-adventure-hud and no page errors. Local screenshots and detailed verification are in docs/art-validation/adventure-hud-2026-10-12.json. HUD implementation is complete; class-skin work is next, followed by the remaining campaign pass.


## [Codex | 2026-10-12] U-CLASS-SKINS-20261012 implementation underway

HUD is complete. Latest user explicitly requests the earned class-skin overhaul now and an accessible preview when finished. Preserve all rank gates, per-class saved choices, Stylist-only equipping and cosmetic-only stats. Grounded renderer/design plan: docs/design/CLASS_SKINS_2026-10-12.md. Source: docs/requirements/USER_SOURCE_2026-10-12_CLASS_SKIN_REWORK.md. No implementation or visual acceptance claimed yet.


## [Codex | 2026-10-12] Earned class wardrobe complete locally — v2.191.0

U-CLASS-SKINS-20261012: rebuilt all 34 earned appearances across 17 classes. Default appearances, rank 5/10 gates, Stylist-only equipping, per-class saved selection and cosmetic-only stats remain. Fitted armor now follows the appropriate torso, arm, leg and head bones from bind-pose matrices. Added shaped layered plates, veined leaves, curved horns, embroidered fabric, metal inlay and class-specific ornaments; separate broad armor and trim palettes preserve color variety. Mage retains orbiting stars; Paladin stays ivory/light gold. Batched detail costs at most 5,576 extra triangles and 36 meshes per outfit, with no added lights.

The real-model wardrobe is at /3d/class-skins.html, linked first in title > Dev Previews and from the Stylist. Compare Default / Rank 5 / Rank 10, focus an outfit, rotate/zoom, try animations, weapons and capes, switch lighting or freeze ornaments. The gallery does not load or change character saves. Actual in-game preview testing caught and fixed cloned emissive-color metadata turning Stylist bodies black; default material/pad restoration was also verified.

Verification: 51 class/tier combinations, 13 sampled animations each (3,978 frames), 129 state/Stylist checks, 51 simulated-peer render checks, old-save compatibility, bag/Stylist visual inspection, and 390px responsive gallery verification. Evidence and explicit limitations: docs/art-validation/class-wardrobe-2026-10-12/summary.json. No live second-device network or physical phone session; representative weapon/cape views are not an exhaustive no-clipping guarantee. Visual acceptance by Oliver remains open. This completes the skin implementation pass, not the outstanding campaign finishing work. Unrelated companion3d.js and articulated-rigs.json changes are excluded. Commit/deployment verification follows.


## [Codex | 2026-10-12] Class wardrobe verified live

Implementation commit 40a99823 is on main. Cloudflare Pages reports success. A fresh production browser confirms v2.191.0-class-wardrobe; title > Dev Previews > Class wardrobe reaches the live gallery. All 17 class buttons, three real model previews and icon images load without browser errors. Preview: https://bladefall.pages.dev/3d/class-skins.html. Completed local fixture pages were removed; only their reusable builder/check scripts are committed. The gallery is ready for Oliver's visual review. Broader campaign finishing remains open.


## [Codex | 2026-10-12] Tutorial and HUD guidance refreshed — v2.192.0

U-TUTORIAL-HUD-20261012 implemented. The beginner guide now explains the current Adventure HUD, explicit Auto-sell OFF/ON, protected full bags, pickup comparisons, persistent paper clues, skill mana/cooldowns, player stats versus class ranks, navigation and menus that leave combat running. Help and the Waystation tour reflect the Forge, Stylist rank 5/10 looks, bestiary and separate dungeon progression. Prompts follow current keyboard/controller bindings.

Replaced the old center-pointing arrows with a persistent measured SVG layer: highlighted target outlines, fine rounded leaders routed to the outside edge, compact movable cards, viewport bounds and automatic menu hiding/resume. First-skill practice resumes any unfinished HUD tips instead of discarding them; redundant legacy notices wait behind the guide. Four safe control lessons remain action-gated; later HUD tips are optional and nonblocking. A jump must land before the next lesson, including short-hop retries.

Real character creation exposed the beginner rear-wall spawn pushing the camera into the character's head. Beginner trials now start at the empty entry-room center with a matching recovery/follow point. Earned-trial placement and difficulty are unchanged.

Verification: keyboard and actual left/right mouse controls; safe practice and active-world information tips; short/held jumps; menu hide/resume; first-skill interruption/resume; rebound keys; simulated Xbox/PlayStation labels and guide buttons; all three starters rank 2 after three kills; six-kill exit and saved completion; pre-change save compatibility; real title/creator/start flow; 36 HUD steps across 1280×720, 820×700, 390×844 and 844×390 with cards within the viewport and clear of their targets. Both chase cameras have full initial clearance for all three starters. Syntax, journal-notice and story-authority checks passed. Evidence: docs/art-validation/tutorial-hud-2026-10-12/summary.json and screenshots.

Limitations: responsive checks use browser iframe sizes; controller input is simulated, not physical hardware. This verifies behavior and presentation, not novice comprehension or fun. No campaign geometry, story, cosmetic art or unrelated companion changes included. Deployment confirmation follows.


## [Codex | 2026-10-12] Tutorial update verified live

Implementation bba06f09 is on main. Cloudflare deployment a4271fa9 reports success; production HTML and a fresh browser title confirm v2.192.0-tutorial-hud with no browser errors. The tutorial stylesheet and versioned scripts load. Temporary QA pages were removed and the two test servers stopped. Reusable QA scripts and evidence remain in the repository.


## [Codex | 2026-10-13] Campaign finishing resumes: Winding Cliffs

Latest user: “Ok what’s next? Keep working”. Resume U-GEO-20261012 after the completed HUD/wardrobe/tutorial priorities. Inspected source-grounded scope and acceptance plan: docs/design/HOLLOW_JOURNEY_2026-10-13.md. Preserve map scale and existing rewards/story; improve the freight-road readability, bridge approach/animation collision, real winch placement and current objective guidance. Lost Canyon and later stages remain open. Implementation in progress; not verified or shipped.


## [Codex | 2026-10-13] Winding Cliffs finishing pass — v2.193.0

Implemented the next campaign pass after Briar. Winding Cliffs keeps its 4,490 × 5,650 map bounds, original elevations, cargo climb, ridge/rope route, encounters and rewards. Added a joined worn freight road and five destination signs; reused the detailed wagon model, removed loose bridge-approach blocks and moved a supply crate out of the route between controls. The detailed winch is at its functional handle. A newly lowered bridge gains collision when its animation settles; previously completed saves restore it immediately.

Early-found transport orders now start the trail. The tracker reports remaining lookout guards and then the available lift; navigation points at the required guards while preserving the quiet high-route option. Transient obsolete cart/winch messages clear without removing journal clues. Refreshed the corresponding blueprint from actual initial-state geometry.

Also fixed a shared renderer ownership bug: multiple scenery imports used different cache keys for the crafted-model module, so an idle copy could overwrite the active has-model API and cause primitive fallback geometry to draw over detailed models. The active scene now publishes its own registry. Verified ownership in all eight campaign entry regions.

Checks: main route plus 91 optional-route waypoints using actual movement/collision; a rendered continuous bridge mistake/recovery/crossing sequence; ten host/guest assertions using the real handlers over a local relay; pre-change partial/complete bridge saves with character/class XP and gold retained; story, bridge timing, navigation and syntax checks. Evidence and limitations: docs/art-validation/hollow-journey-2026-10-13/summary.json. Enemies were stunned during route verification; no full combat playthrough, public-network session, low-end performance claim or human fun/novice-comprehension verdict.

Next: Lost Canyon and the remaining campaign finishing sequence. No custom SFX or unrelated companion changes. Deployment confirmation follows.


## [Codex | 2026-10-13] Winding Cliffs verified live

Implementation 3af439d5 is on main. Cloudflare deployment c1a3a80e succeeded; production HTML and a fresh browser title both report v2.193.0-hollow-journey. The new road/sign module returns HTTP 200, and the live title has no browser errors. Generated QA pages were removed, owned test tabs closed and the local server stopped. Lost Canyon remains the next campaign finishing pass.


## [Codex | 2026-10-14] Lost Canyon finishing pass authorized

Latest user: “Go ahead” (repeated), approving the announced next campaign pass. Grounded plan: docs/design/LOST_CANYON_JOURNEY_2026-10-14.md. Preserve existing large scale, entry choices, signal/freight climbs, north escort and rewards; improve actual navigation, route readability, cage solidity and gate access. Source baseline 10ba0309. Implementation and visual verification pending; not full campaign completion.


## [Codex | 2026-10-14] Lost Canyon finishing pass — v2.194.0

Implemented the authorized next campaign pass at its original 5,890 x 6,160 scale. Joined service roads and six signs connect the yards. Detailed barred cages now have solid sides; roads approach their doors, the north escort clears its turn, and the cave return meets the road before the escape gate. Forced-entry guards spawn on the accessible ramp. Guidance follows Ward, blocking guards, the scaffold entrance, escort proximity/combat and the escape route. The signal uses a detailed winch, a clear standing space, a visibly cut cable and stateful lanterns. Fixed sign-post overlap with text. The corresponding blueprint captures final initial-state collision and the actual climb/escort paths.

Verified physical entry routes and branches, both optional climbs, a continuous normal-camera missed-jump/recovery/retry, live prisoner damage and escort failure/retry, final gate traversal, a genuine 10ba0309 partial save with character/class XP and gold preserved, and 16 host/guest assertions over a local relay. Winding Cliffs art still mounts correctly. Relevant unit/syntax checks pass; browser error logs are empty. Evidence and limitations: docs/art-validation/canyon-journey-20261014/summary.json. This is not a full combat or public-network playtest and does not establish human enjoyment.

Next campaign finishing area: Ruined Keep — Broken Walls, then the remaining campaign sequence. No custom SFX or unrelated companion edits. Deployment confirmation follows.


## [Codex | 2026-10-14] Lost Canyon verified live

Implementation 5a627c3c is on main. Cloudflare deployment 846ed895-ae5a-455c-8582-6cea4271ceda succeeded; production HTML and a fresh browser title confirm v2.194.0-canyon-journey with no browser errors. No production save was opened. Generated local QA pages were removed, owned test tabs closed, and the local server stopped. Exact verification is saved in docs/art-validation/canyon-journey-20261014/deployment.json. Broken Walls is the next campaign finishing pass.


## [Codex | 2026-10-14] Broken Walls finishing pass authorized

Latest user: “Okay go ahead and work on that.” Continue the announced next campaign finishing area: Ruined Keep — Broken Walls. Preserve scale, current story/rewards and meaningful optional routes. Grounded scope and verification plan: docs/design/BROKEN_WALLS_JOURNEY_2026-10-14.md. Implementation in progress, not verified or shipped. Later campaign stages remain open.


## [Codex | 2026-10-14] Broken Walls finishing pass — v2.195.0

Retained the 4,290 x 5,580 fortress and its existing story, enemies, rewards and optional climbs. Added joined stone route paving, six destination signs, an escape lane, a bronze bell, a corded ballista, a gate wheel and a workshop dial whose green sector matches the real latch window. Guidance now identifies the arrow stair and living guards, rescue retreat/remaining attackers, and both prison-entry choices. Wave markers use the actual next spawn. Gate/latch feedback describes the result, and superseded transient notices clear while journal clues remain.

Six decorative towers now have collision. Physical testing exposed a tower inside the battlement stair; moved the matching pair from X +/-720 to +/-930. Normal-camera inspection also moved supply props out of the walking lane and decorative columns clear of the ballista and wheel. Refreshed only blueprint 2-0 from captured initial geometry; all other maps and the historical footprint remain intact.

Verified 40 main-route and 136 optional-route waypoints plus chamber traversal, live prisoner damage/failure/retreat/retry, both key/wheel exits, five continuous workshop checks, six tower collisions, 13 host/guest assertions using real handlers over a local relay, and a genuine b4fbfa47 partial save preserving name, gold and both XP systems. Relevant source/syntax regressions pass. Evidence and precise limits: docs/art-validation/keep-journey-20261014/summary.json. This is not a human fun/novice-comprehension verdict, Internet session or full combat/performance playtest.

Next: Ruined Keep — Dungeons, then remaining campaign halves. No custom SFX or unrelated companion edits. Deployment confirmation follows.


## [Codex | 2026-10-14] Broken Walls verified live

Implementation 483f70a7 is on main. Cloudflare deployment 8af9bf7c-7f70-43ef-bd88-bdbe50f9e7fb succeeded. Production HTML and a fresh browser title show v2.195.0-keep-journey; the new art module returns HTTP 200, and browser errors are empty. No production save was opened. Local QA pages were removed, owned tabs closed, and the local server stopped. Verification: docs/art-validation/keep-journey-20261014/deployment.json. Next: Ruined Keep — Dungeons. Preexisting companion3d.js and articulated-rigs.json edits remain unstaged and untouched.


## [Codex | 2026-10-14] Dungeons finishing pass authorized

Latest user: “Go on.” Continue the announced next campaign finishing area: Ruined Keep — The Dungeons. Preserve the 4,600 x 5,850 footprint, current story/rewards and optional press/drain routes. Grounded scope and verification: docs/design/DUNGEONS_JOURNEY_2026-10-14.md. Implementation in progress; not verified or shipped.


## [Codex | 2026-10-14] Dungeons finishing pass — v2.196.0

Retained the 4,600 x 5,850 level, story/reward IDs and optional press/drain routes. Added floor-aware guidance, four framed signs, clipped stone route inlays, a covered hinged service door, detailed gates, a visible cell-lock lever/keepsake bundle and the existing rare chest model. The release gate now meets full-height side walls; a barred eastern holding-room exit opens with the existing cell lock. Prisoner arrival paths avoid the drum and unsupported corners. A deliberate initial turn selects winch direction instead of tiny approach inertia. Independent host conversations no longer stop the shared rescue/lift. Removed the extra hardcoded E and clear superseded transient clues while retaining journal notes.

Verified 55 main-route waypoints, 86 drain waypoints, 40 lower-works waypoints, live press damage/brake/water recovery, five release-gate lanes, the holding exit before/after release, 3,204 supported prisoner positions without collision, a continuous normal-camera lift mistake/lowering/retry/ascent, and 18 host/guest assertions through a local relay. A genuine 6360c7df partial save retains name, 983 gold, character level 12 / XP 87, Warrior rank 7 / XP 169 and quest flags. Relevant unit and syntax checks pass; final browser errors are empty. Only blueprint 2-1 was refreshed; other 15 maps and historical footprints are unchanged.

Evidence and precise limits: docs/art-validation/prison-journey-20261014/summary.json. Automated traversal is not a human fun/novice-comprehension or full combat/performance verdict; the co-op test is local, not an Internet session. Next campaign area: Frostfell — Snowbound Peaks. Deployment confirmation follows. Preexisting companion/articulated-rig work remains untouched.


## [Codex | 2026-10-14] Dungeons verified live

Implementation 4933d50d is on main. Cloudflare deployment 2b76f2bc-d1d3-4821-8a47-030dfa6cd0cf succeeded. Production HTML and a fresh browser title show v2.196.0-prison-journey, the new art module returns HTTP 200, the blueprint data reports the same release, and production browser errors are empty. No production save was opened. Generated QA pages were removed, owned tabs closed and the local server stopped. Evidence: docs/art-validation/prison-journey-20261014/deployment.json and production-browser.json. Next: Frostfell — Snowbound Peaks. Preexisting companion3d.js and articulated-rigs.json edits remain unstaged and untouched.


## [Codex | 2026-10-14] Finish every remaining campaign area

Latest user: “Don’t stop till you’ve done this process for all the remaining levels.”
Continue the established campaign journey finishing pass across both halves of Frostfell, Emberdeep, Storm Coast, Sunspire and Castle Duskmoor (ten halves). Preserve original bounds, story/reward identifiers, optional routes, meaningful hazard gaps and detailed existing assets. Improve authored wayfinding, route presentation, mechanism access and any defects exposed by actual traversal. Verify each area, saved progress and local co-op; do not stop after a single half. Source baseline fc6e6e24. Grounded plan: docs/design/REMAINING_CAMPAIGN_JOURNEY_2026-10-14.md. Work in progress; no completion or playtest claim.


## [Codex | 2026-10-14] All remaining campaign journeys finished — v2.197.0

Completed the pass across Snowbound Peaks, Deep Ice Caves, Iron Halls, Great Furnace, Shipwreck Shore, Thunder Cliffs, Palace Courtyard, Sky Library, Castle Gates and Long Ascent. Added 48 fitted, framed, double-sided destination signs and floor-clipped regional route surfaces; kept existing full-size maps, story/rewards, detailed assets and deliberate hazards. Guidance follows the tower’s current storey and required cornice ledges, identifies the lower library latch and remaining required guards. The ice crossing now describes its concrete result. The blueprint coil location is corrected to Heath’s shelter.

Physical/visual checks moved new posts away from the ice rescue return, castle store return, unsupported cliff/terrace edges, Otto’s boat and Abe’s shelter. All new posts have supported footing and clear wall access. Unified the shared rendering module versions after a clean reload caught a split asset pool. Refreshed only the last ten initial-state blueprints; first six records, all bounds and historical footprints remain unchanged.

Verified 808 route waypoints, six cornice landings, 92 returned quest assertions, five continuous normal-camera mistake/recovery sequences, two coastal entrance walks, 61 host/guest assertions through a local serialized relay, and ten genuine fc6e6e24 saves preserving names, 983 gold, character level 12 / XP 87, Warrior rank 7 / XP 169 and quest flags. Fifteen logic suites and 24 source/import-map syntax checks passed. Inspected ten rendered junctions. Scope, evidence, resolved failures and browser caveat: docs/art-validation/remaining-journey-20261014/summary.json.

This finishes the remaining-area process requested in this turn. Automated traversal is not a human pacing/fun/novice-comprehension, full combat or low-end performance verdict; local relay testing is not an Internet session. No new custom SFX. Unrelated companion and articulated-rig edits remain untouched and unstaged. Deployment confirmation follows.


## [Codex | 2026-10-14] Remaining campaign pass verified live

Implementation 367957bee99b7803d0e96563e29dd641537eaec4 is on main. Cloudflare deployment d875a56a-10bc-4839-a6b3-8335746e7715 succeeded. Production HTML and a fresh browser title show v2.197.0-campaign-journeys; the new journey modules, shared deep art, castle art and blueprints return HTTP 200. The settled production title screen reports no browser warnings/errors. No production save was opened. Generated public QA pages were removed, owned test tabs closed and the owned local server stopped. Evidence: docs/art-validation/remaining-journey-20261014/deployment.json and production-browser.json. All ten remaining campaign halves are shipped. Existing companion3d.js and articulated-rigs.json changes remain unstaged and untouched.


## [Codex | 2026-10-14] Campaign combat and boss readiness authorized

Latest user: "Ok keep building", accepting the proposed next combat/boss readiness pass, followed by campaign progression, performance and co-op checks. Begin with all eight campaign boss encounters at normal health and representative legal starter-class gear. Inspect actual attack/warning geometry, attackability, special mechanics, defeat/retry and reward/exit flow. Preserve current story, difficulty intentions and full-size campaign geography. Fix demonstrated defects; do not infer fun or difficulty acceptance from automation. No custom SFX or unrelated companion changes. Grounded implementation and verification plan: docs/design/CAMPAIGN_COMBAT_READINESS_2026-10-14.md. Baseline 969ce1a9. In progress, not shipped.


## [Codex | 2026-10-14] Campaign boss readiness — v2.198.0

Fixed reproduced co-op targeting errors in the Brute, Marksman, Ember Colossus and Hydra using a shared same-area living-player selector across all eight authored encounters. Dormant bosses now wake for a guest who arrives before the host; the Brute, Marksman and Fallen previously waited for the host. Hydra attacks now follow the existing regional/difficulty boss damage curve rather than inheriting ordinary restraint-entity damage; no extra co-op damage multiplier, HP change or attack-timing change was added.

Verification: 24 ordinary-health first-hit cases, 24 active-target starter-weapon reach cases, 48 party targeting cases, 15 guest-arrival cases, eight actual death-screen retries retaining earned growth/gold, 41 staged completion/reward assertions, 40 local serialized host/guest assertions and a genuine 969ce1a9 save reload. All eight encounter suites plus 146 pure target cases pass. The Hydra sample hit rose from 10–12 to 54–55 against normal level-20 gear/health. Brute and Hydra normal-camera attack sequences were observed. The final orb gate and both King phases remain intact; Ian’s Blade never replaces the equipped weapon.

Evidence and testing limits: docs/art-validation/combat-readiness-20261014/summary.json. These are staged encounter/regression checks, not a full fresh campaign combat run, human fun verdict or public-network/hardware benchmark. Next: ordinary campaign combat and fresh-save progression. Preexisting companion3d.js and articulated-rigs.json edits are untouched. Deployment confirmation follows.


## [Codex | 2026-10-14] Campaign combat pass verified live

Implementation a99ff9fb416b3ebbc930ef15b9abee77bed31554 is on main. Cloudflare deployment 3fc6090d-03ed-4409-9b00-9904464a5374 succeeded. Production HTML and a fresh browser title show v2.198.0-campaign-combat; hydra.js?v=2198 returns HTTP 200 with the new damage field. Settled production browser warnings/errors are empty. No production save was opened. Owned QA tabs and server were closed, generated public QA pages removed, and unrelated companion/rig edits remain unstaged. Evidence: docs/art-validation/combat-readiness-20261014/deployment.json and production-browser.json.

Next: ordinary campaign combat and progression from a fresh character, including pacing, equipment/class unlocks, and first-player readability. One presentation follow-up from this pass: the Brute's generic lore card and tactical toast can occupy the central view together on entry; separate or consolidate these during the readability pass. Do not treat the present automated boss checks as a complete campaign or hardware/network playtest.


## [Codex | 2026-10-14] Fresh-character combat and progression continuation

Latest user: "OK keep going please." Continue the announced ordinary-combat and new-character progression pass after v2.198.0. Inspect all three starter tutorials, earned skill choices, early campaign enemies/rewards, return/reload behavior and boss-entry readability. Preserve established difficulty, story and geography; fix demonstrated defects rather than adding new systems. No custom SFX or unrelated companion/rig changes. Grounded plan: docs/design/FRESH_CHARACTER_READINESS_2026-10-14.md. Baseline d260c6d9. In progress.


## [Codex | 2026-10-14] Fresh-player progression readiness - v2.199.0

Recovered missing earned class choices after reload, prevented stale choices after class switches, and kept queued upgrades from interrupting live menus or downed/dead state. Invalid legacy choice IDs can be chosen again; stored skills/passives require their earned rank. Multi-rank rewards now retain the first-skill lesson. Healthy checkpoints restore effective HP from the protected loadout and earned growth. Boss intros and tactical advice use one side-journal note, with concise existing canonical encounter facts instead of superseded dream/sleeper text.

Verified all three starters against six isolated authored tutorial foes each, third-kill rank 2, retained skills at the hub, 24 ordinary campaign damage exchanges, interrupted/multi-rank/class-switch/menu/retry paths, a genuine pre-change save, 8 local host/guest assertions and 2,873 rank/choice checks across 17 classes. Relevant boss, journal, story and syntax regressions pass. Rendered the recovered choice screen and unobstructed boss-entry advice. Evidence and exact limits: docs/art-validation/fresh-progression-20261014/summary.json. Staged combat does not establish a full fresh campaign, human fun/pacing or Internet/hardware performance. No global difficulty changes.

Next: equipment/reward clarity and full-inventory interactions, followed by continuous early-campaign play and performance. Deployment confirmation follows. Preexisting companion3d.js and articulated-rigs.json changes remain untouched.


## [Codex | 2026-10-14] Fresh-player progression verified live

Implementation e4039768a7f1853f641f7a89bb764009089e6974 is on main. Cloudflare deployment 25dd3a36-9a6e-4b96-8143-b12ddc6d4e6c succeeded. The production browser displays v2.199.0-player-progression and settled warnings/errors are empty. A direct Python HTML probe returned 403; browser verification succeeded. No production save was opened. Generated local QA pages were removed, owned tabs closed and the owned local server stopped. Evidence: docs/art-validation/fresh-progression-20261014/deployment.json and production-browser.json.

Next: equipment/reward clarity and full-inventory interactions, then continuous early-campaign play and performance. Existing companion3d.js and articulated-rigs.json changes remain unstaged and untouched.


## [Codex | 2026-10-15] Loot, inventory and early-player continuation

Latest user: "Continue", following v2.199.0 and the announced loot/full-bag then early-campaign checks. Inspect and fix demonstrated loss, transaction, feedback and save defects. Preserve U-HUD-ADVENTURE-20261012: default-OFF explicit auto-sell, immediate bagging, untouched ground equipment at full capacity, quest pickups independent of gear capacity, and current binding prompts. Keep campaign geography, difficulty, story outcomes and custom SFX unchanged. Baseline 4d8637bd. Grounded plan: docs/design/LOOT_READINESS_2026-10-15.md. In progress.


## [Codex | 2026-10-15] Loot safety candidate prepared; browser verification pending

Local candidate v2.200.0 unifies Quartermaster direct/Compare purchases around bag delivery, validates before spending, preserves the existing paid relic claim and checks replacement storage before purchase/reforge. Added bag access/capacity to shopping, named blocked-ground-loot comparisons, and immediate notice updates after collecting the same item. Chest warnings leave unopened contents hidden. The prior comparison loss was reproduced with the actual transaction functions under a DOM adapter.

Passed 22 transaction/pickup/chest checks, 6 presentation queue checks, the existing 200,000-sample chest-table suite and six syntax checks. These are not browser or full-engine integration results. Browser selection reported "No browser is available"; documented troubleshooting returned no connections. Asked the user to open a Browser tab while continuing independent implementation. The app queued the local preview for this thread. No live deployment was made; production remains the last verified v2.199.0.

Resume from docs/art-validation/loot-readiness-20261015/summary.json and docs/design/LOOT_READINESS_2026-10-15.md. Real-browser visuals, genuine pre-change save, co-op loot checks and continuous early play remain. Local preview: http://127.0.0.1:4358/3d/.qa-loot-current.html. Owned server PID 20456 is intentionally retained for that queued preview; generated QA pages are untracked and must not ship. Preexisting companion3d.js/articulated-rigs.json changes remain untouched.


## [Codex | 2026-10-15] Browser restored; loot safety verified - v2.200.0

Recovered the in-app browser by activating this chat through the app navigation tool. No user presence, plugin repair or settings change was needed. Chrome was also reopened, but did not reconnect.

Real-browser tests reproduce the old Compare purchase loss and verify safe full/last-slot purchases, bag-management return/retry, genuine v2.199 save loading, blocked/collected/sold feedback, mixed pickups and chest capacity/retry. Ten local host/guest assertions pass for independent inventory, auto-sell and personal chest claims. A short campaign/menu/save smoke found the Pause button covered by the camera-drag layer; raised it above controls and verified mouse operation at 1280x800, 960x640 and 390x844. Return to Hub / Title / Continue preserves the saved hero.

Evidence: docs/art-validation/loot-readiness-20261015/summary.json. Earlier 28 logic checks and chest rarity sampling remain valid. Captures are low resolution, so this is layout/function verification, not art approval or a full fresh campaign. Local relay co-op is not Internet latency testing. One parent-harness observer error is documented; individual game collectors and standalone gameplay were clean. Ready for publication; deployment confirmation follows. Unrelated companion3d.js/articulated-rigs.json edits untouched.


## [Codex | 2026-10-15] Loot safety deployed - v2.200.0

Published gameplay commit 36738c0c to main. Cloudflare Pages reports success; the production browser displays v2.200.0-loot-safety with adventure-hud.css?v=2200 and no warning/error entries. No production save was opened. Deployment evidence: docs/art-validation/loot-readiness-20261015/deployment.json and production-browser.json. Owned local server and five generated QA files are removed, temporary viewport reset, and the surviving browser tab points to the live release. Unrelated companion/rig changes remain untouched.


## [Codex | 2026-10-15] Continuous first-session test authorized

User: "OK try that out." Run ordinary controls from fresh character creation through tutorial, hub, Briar Town and the first boss, then save/return. Investigate clarity, progression, actual performance and relevant co-op continuity; fix demonstrated defects. Plan: docs/design/FIRST_SESSION_JOURNEY_2026-10-15.md. Baseline 1cfb5534. Keep a continuous run distinct from staged tests, retain difficulty/story/map scale, and preserve unrelated companion/rig changes. In progress.


## [Codex | 2026-10-15] Continuous first-session findings - v2.201.0

Ran a fresh Warrior with ordinary keyboard/mouse controls through creation, tutorial, hub tour/reload, both Briar halves, the physical mill puzzle, ground signal route and two Brute attempts. No teleports, boosted stats, enemy disabling or direct simulation calls in the continuous run. Both boss attempts ended in death; retry and hub/title/reload retained level 2, rank 3, Cleave, Heavy Hand, 270 gold and the allocated Attack point. Boss victory, novice balance and full-campaign readiness remain unverified.

Fixed two demonstrated issues: persistent journal cards kept obsolete task text in front of newer discoveries, and the one-time skill lesson flag was not serialized, repeating Cleave after reload. Current notes now revise in place; newest arrivals appear immediately with an explicit Next note button for earlier unread cards. Superseded Briar supply instructions leave the HUD queue without deleting journal history. Existing skill/dash lesson flags now persist with tutorial settings.

Verified rendered request/delivery and exact-entry journal access, genuine old-character loading, real lesson-flag reload and staged later skill/passive selection. Seven production story-packet receiver checks cover late join, revised notes, duplicates, stale revisions and independent reading in two local worlds. Journal, mill, puzzle and class regressions pass, including 2,873 class checks and actual settings serialization. Evidence: docs/art-validation/first-session-20261015/summary.json. Observer frame p95 samples were about 5.7-16.6 ms; an unexplained 1,050 ms outlier prevents a blanket hitch-free claim. No geography, difficulty, story outcomes or SFX changed. Unrelated companion/rig edits untouched. Deployment confirmation follows.


## [Codex | 2026-10-15] First-session fixes verified live - v2.201.0

Gameplay commit 2b2ca8dd is on main. Cloudflare deployment 9a30ca86-cc7e-4d80-97de-5715c8548b16 succeeded; the production browser displays v2.201.0-first-journey and the updated journal/Briar/HUD asset versions, with no warning/error entries. No production save was opened. Owned local test server and both generated QA pages are removed; owned test tabs are closed. Evidence: docs/art-validation/first-session-20261015/deployment.json and production-browser.json.

The continuous normal-difficulty run finished both Briar halves but did not defeat the Brute in two attempts. Next review should examine the first boss and early equipment/reward experience using earned builds, distinguishing automated input limitations from demonstrated tuning problems. Human novice pacing/fun and target-device performance remain open. Existing companion3d.js/articulated-rigs.json changes remain untouched.


## [Codex | 2026-10-15] First boss and early equipment review authorized

U-FIRST-BOSS-20261015. Exact user message: "Go ahead with that next review". Review the Brute fight and the equipment reachable before it; fix demonstrated balance/guidance problems and test. Affected requirements: EQ-09, FX-02, BOSS-01/02, loot safety and retained campaign earnings. Plan: docs/design/FIRST_BOSS_REVIEW_2026-10-15.md. Preserve the real v2.201-era character, normal combat and existing story/map/tutorial scope. Automated failure alone is not evidence for a boss nerf. In progress.


## [Codex | 2026-10-15] First-boss and early-equipment review - v2.202.0

Corrected an actual early-shop downgrade: common stock is now 96% base damage versus the free starter's 88%, while ordinary common drops remain stronger. Starter-family comparisons are Warrior 10.6 -> 11.5, Ranger 7.9 -> 8.6, Mage 17.6 -> 19.2. Cost remains 60 gold; higher rarity power/gates and already-owned equipment stay intact.

The Brute now shows its full charge-body corridor, clipped at the first blocking cart/stone, plus one short attack/recovery cue with the player's current bindings. Ground-wave deaths name the attack and offer a short retry hint. Area changes clear this advice, including the Hydra's separate boss HUD. No boss-stat, timing, loot-rate, story, geography or SFX changes.

Real-browser review: 15 isolated damage/recovery checks, an unmodified real-time charge from a staged position into cover, purchase/actual reload, retained level-2/rank-3/270-gold retry, and 11 local host/guest warning checks pass. Corrected camera-aimed scripted fights clear the full encounter and handlers with all three starter classes (23/50/34 simulated seconds). The genuine Warrior save is preserved; alternate classes are representative staged builds. These perfect-state-reading probes are not human novice difficulty or pacing tests. Normal earned level-up healing remains active.

Production logic checks cover 15 stock families, 22 loot transactions, 146 boss-combat scope cases, existing Brute behavior, 28 swept-preview/frame-rate cases, bindings and syntax. See docs/art-validation/first-boss-20261015/summary.json and docs/design/FIRST_BOSS_REVIEW_2026-10-15.md. Initial fixed-camera, inactive-boss and artificial-stun fixture mistakes are recorded separately from product findings. Internet latency, target-device performance and novice fun remain unverified. Unrelated companion3d.js/articulated-rigs.json changes remain untouched. Ready for publication; deployment confirmation follows.


## [Codex | 2026-10-15] First-boss review verified live - v2.202.0

Gameplay commit c65a1ff7 is on main. Cloudflare deployment 7c65879f-03f1-4fa2-a0fa-0253a5bbfd67 succeeded. Production displays v2.202.0-first-boss with brute-encounter.js?v=2202 and no warning/error entries. No production save was opened. Evidence: docs/art-validation/first-boss-20261015/deployment.json and production-browser.json. Owned local review tab, server and generated QA page have been cleaned up. Existing companion/rig edits remain untouched.

The first boss is mechanically feasible with all three starting builds in scripted tests; a novice human difficulty verdict remains open. For the next continuous review, use ordinary controls after a real Brute win and inspect the transition into Hollow Pass, objective/reward discovery and first higher-rarity upgrade. Keep staged encounter probes distinct from an uncut human-style journey.


## [Codex | 2026-10-15] Hollow Pass new-player review authorized

U-HOLLOW-REVIEW-20261015. Exact user request: "Ok keep going with the next review into Hollow Pass. Do a long work session and fix anything that could confuse or frustrate new players. Don't waste usage." Review the earned Brute victory/exit, hub unlock, Winding Cliffs, Lost Canyon and the Marksman approach. Preserve the existing large layout and canon. Use real-browser movement/interactions and relevant save/co-op regressions; distinguish map-assisted or staged probes from human novice playtesting. Plan: docs/design/HOLLOW_PASS_REVIEW_2026-10-15.md. Baseline 7beba2d0. Unrelated companion3d.js/articulated-rigs.json edits stay untouched. In progress.


## [Codex | 2026-10-15] Promotional screenshot pack

U-PROMO-20261015. Captured eight 1600x900 images from v2.202.0-first-boss: title screen, Waystation, mill, Sunspire, Brute, Hydra, Hollow freight crossing and Mage wardrobe. Built a 1280x2276 JPEG portrait poster from four of those captures, an approximately 1 MiB ZIP, and a responsive gallery at public/showcase/2026-10-15/. Source/layout builders: scripts/build-promo-capture.py, scripts/qa-promo-capture.js and scripts/build-promo-gallery.py. Cameras and actors were staged in a localhost copy; HUD hidden; no generated or repainted gameplay. Original title illustration is labeled as the title screen. All file formats/dimensions and ZIP CRC verified; browser layout checked at desktop and 390px phone width.

The earlier Hollow review is still pending implementation. Its source-grounded plan and findings are in docs/design/HOLLOW_PASS_REVIEW_2026-10-15.md. No quest or gameplay fixes are claimed by this poster delivery. The unrelated companion/rig edits remain untouched.

## [Codex | 2026-10-15] Hollow review resumed after poster

User: "Ok continue on what you were doing before the poster". Resume U-HOLLOW-REVIEW-20261015 using the existing grounded plan. Poster/gallery verified live; this is gameplay review again. Earned Brute victory, normal exit and hub unlock succeeded. A test-driver camera-space error caused an off-route fall; recorded separately from product behavior and corrected before route review. Demonstrated candidates: Waystone approach interaction radius, canyon fall incorrectly named lava, mandatory alarm wording, and stale or poorly linked quest clues. No broad difficulty or map replacement. In progress.


## [Codex | 2026-10-16] Hollow guidance bounded release - v2.203.0

Implemented cart/bridge timing and clue guidance, completed rope-note repair, required alarm/player escort explanations, locked-object feedback, Waystone reach and canyon fall attribution. Targeted logic/syntax checks pass. Prior rendered fixtures cover gate/cage collision, all alarm/freight jumps, continuous missed-jump recovery, live prisoner damage/failure/retry, 16 local host/guest checks and an old partial-save load (level 10, rank 6, 913 gold and flags retained).

The earned Warrior reached north escort wave 1, then rank-5 passive selection paused the driver at 20% rescue progress. Last persisted evidence: canyon-alarm-earned.json. Full scope, fixture corrections and test limits: docs/art-validation/hollow-review-20261015/summary.json. Browser discovery currently returns no available browser. Remaining: earned escort/Marksman approach, rendered Waystone front interaction and final production browser smoke check. Do not claim the entire review complete or infer novice fun/difficulty. Unrelated companion/rig changes remain untouched. Deployment confirmation follows.


## [Codex | 2026-10-16] Evidence export correction

Final file validation found a truncated alarm export and corrupted aggregate fixture artifact. Their replacement metadata explicitly identifies the issue; completed staged results were reconstructed from the visible browser outputs. The last complete restorable earned export is canyon-arrival-before.json, not canyon-alarm-earned.json. All review JSON artifacts now parse. No gameplay source changed.


## [Codex | 2026-10-16] Hollow guidance deployed

Gameplay commit 66b1fc66 passed the Cloudflare Pages deployment check. Evidence corrections are in 5a6a60e0. Version v2.203.0-hollow-guidance; deployment evidence: docs/art-validation/hollow-review-20261015/deployment.json. No production browser smoke claim: browser discovery was empty and direct HTTP fetch returned 403. Generated review pages were removed; unrelated companion/rig changes remain untouched. Continue earned escort/rank-5 choice, Marksman approach and rendered Waystone checks when browser reconnects.

## [Codex | 2026-10-16] Progression celebrations and isolated audio release candidate

U-PROGRESSION-CELEBRATION-20261016 implemented as v2.208.0. Gold player-level banner/pulse/sparks never pauses or adds slow motion; purple class-rank rune/banner holds the existing local upgrade pause for 850 visible milliseconds before a 200ms choice entrance. Rank choice confirmation no longer repeats rank-up audio. Tutorial explains both and the first skill choice. Already-generated paid player/class sounds are distinct; zero new API credits spent.

Browser connection recovered. Staged rank-2, rank-3 passive, simultaneous notifications, player-only running simulation, E confirmation and reduced-motion paths checked; fixed menu host removal and reduced-motion rune specificity during verification. 43 state checks + 580 audio tests + inline syntax pass. Actual old save retained level 4, rank 4, 1,145 gold, 52 XP and all three existing choices. All 64 custom sounds decode in real WebAudio. Browser muted: no subjective listening claim.

Isolated release checkout ../bladefall-audio-release starts at production ab457fa9 and contains ONLY paid SFX/progression changes. No pending wardrobe/Reaper/Keep candidate imported. Browser fixtures use in-memory storage and do not alter real saves. Production deployment follows verification; evidence docs/art-validation/progression-20261016/summary.json.

## [Codex | 2026-10-16] v2.208.0 production confirmed

Isolated commit cfa8671d pushed to main from ../bladefall-audio-release. Cloudflare succeeded (52f523ad-e519-41a7-92bf-330dacda2ddb), and the real production browser shows v2.208.0-progression-celebrations with progression JS/CSS and priority SFX scripts present. Live: https://bladefall.pages.dev/3d/ . Includes the 64 paid SFX and the level/rank celebrations; zero extra generation credits. Title smoke plus staged gameplay/old-save/decoding checks are recorded; subjective listening and live co-op remain unclaimed. Pending wardrobe, Reaper and Keep work remain excluded.

The development branch remains divergent and must not be pushed wholesale to main. Production main is now cfa8671d (later documentation-only commits may follow). Independent release checkout preserves the tested subset.


## [Codex | 2026-10-16] U-REFERENCE-SKINS-20261016

User approves remaking all three skins for every actual class from the supplied class progression sheet, preserving the six base rigs. There are 17 classes / 51 looks; Rogue is not a class. Use the sheet's red Rogue progression for Ninja. Correct Warrior and Bladedancer defaults into simpler versions of their earned outfits. Warlock must differ from blue Mage and bone/jade Necromancer at every rank: black cherry, rose-copper and ruby pact motifs, no skull crown or green souls. Monk's final is psychic/Buddha-like with saffron wraps, beads and a lavender lotus mandala, not Paladin plate. The Beastmaster wolf is the existing separate companion, never outfit geometry. Other reference designs approved. Preserve rank gates, stored per-class choices, faces, weapons, combat stats and cheat unlocks. This later direction supersedes older preservation of default colors and Rank 5 geometry.

Grounded plan: replace palette catalog for all 51 looks; add compact class-specific starter fittings; reshape earned silhouettes with tier-specific crowns, horns, wings and cloth using the existing bone-fitted renderer. Keep Rank 10 depth-tested bounded auras distinct and reduced-motion aware. Validate real rigs, transitions, gates, budgets and actual browser gallery for all 17 before publishing. A reference interpretation on existing browser rigs cannot reproduce painted illustration detail pixel for pixel. No gameplay or campaign changes in this pass.

## [Codex | 2026-10-16] Reference wardrobe release verification

All 51 outfits pass actual GPU rendering in both development and isolated production-base candidate (13 motions / 3,978 sampled frames). 129 Stylist/save/rank/stat/cheat checks pass in both. 51 simulated peer appearances pass; no live two-client claim. At 390px, gallery is loaded with no horizontal overflow. Existing level-4/rank-4 save retains 1,145 gold, 52 XP and all three choices. Added geometry remains below 10k triangles / 50 meshes (max 9,998 / 46). Main release excludes pending Keep guidance and Reaper grip. User aesthetic acceptance and exhaustive all-gear clipping remain unclaimed.

## [Codex | 2026-10-16] v2.209.0 reference wardrobe is live

Production commit 83e89eb1 deployed successfully (26c50335-97d1-4024-9fc3-762dc5bc6918). Real browser confirms new public gallery names and v2209 scripts; immutable game shows v2.209.0-reference-wardrobe. Gallery: https://bladefall.pages.dev/3d/class-skins?class=warlock&v=2209 . All 51 outfits implemented as reference adaptations on existing rigs, including every requested correction. Rank gates, saved choices, cheat unlocks and stat neutrality verified. Production excludes pending Keep/Reaper changes. Development branch remains divergent: never push it wholesale to main. Unrelated companion3d.js and articulated-rigs.json changes untouched.


## [Codex | 2026-10-16] U-SFX-PRESERVE-20261016

User reports several generated replacements are worse than the originals and cannot audition the whole batch now. Preserve all old and generated files. Restore the existing file/procedural defaults rather than choosing favorites without human listening. Stop blanket replacement. Future authored audio targets distinct missing weapon, class-skill, enemy/boss and interactable event identities; generic fallback coverage is not unique coverage. Technical checks establish valid audio, not artistic superiority. Replacement of an existing favored cue requires a specific listening decision. No additional API spend for this preservation pass. Keep level/rank celebration animations; restore their prior distinct sounds with the other defaults. Inspect actual sound bindings before authoring new named cues.

## [Codex | 2026-10-16] Original SFX candidate verified

Restored all 56 file slots and all eight procedural defaults. All 64 paid takes/masters remain intact and inactive. Real muted browser decodes 105 original slots, zero candidate slots; progression animation module still present. 255 audio assertions and 43 progression assertions pass. Original audio bytes match their backups. No API credits spent. Future direction is distinct new event identities with old fallback, not blanket replacement. docs/audio/SFX_PRESERVATION_AND_GAPS.md and source inventory record 17 classes/136 skill choices/30 campaign voice mappings; boss/dungeon/interactable audit remains to be completed before a new generation budget. Production release follows.

## [Codex | 2026-10-16] v2.210 SFX preservation deployed

Production 7acbdca5 is active (657608d2-e93e-46b1-a9ac-3d4df047f56a); real browser confirms v2.210.0-preserve-original-sfx and priority-sfx?v2210 on the immutable release. Old file/procedural defaults restored, all 64 takes kept inactive, zero new credits. New event-identity generation remains the next audio work after completing the source-bound boss/dungeon/interactable inventory. Main remains isolated from pending campaign/Reaper work.


## [Codex | 2026-10-16] U-CREATOR-VIEW-20261016

User requests a full-character / face close-up choice in the creator, full-character default, lower and centered face framing, and vertical as well as horizontal dragging. Source: draw() forcibly resets face mode/yaw on every edit; toggle handlers do not update pressed state; face framing uses whole-body/weapon bounds; pointer drag tracks only X. Preserve chosen view, yaw and pitch through edits and steps, default full body on open, update accessible toggle states immediately, and allow bounded vertical camera orbit. Fit close-up to the actual stored head frame transformed by the current head bone, independent of weapon/crown bounds. Hide fitted headgear and held weapon only in face preview so facial customization remains visible; restore in full view. Preserve six rigs, facial placement data, saves and gameplay cameras. Verify all starter classes plus UI edits, transitions, mouse/touch cancellation and mobile presentation in the real browser.

## [Codex | 2026-10-16] Creator camera candidate verified

U-CREATOR-VIEW-20261016 implemented. Browser confirmed centered Warrior/Ranger/Mage close-ups, full-view retention after choosing green eyes/smile, and immediate pressed-state updates. Face view hides preview fittings attached to Head and held weapon, restored in full body. 14 creator event-handler assertions test edits/step preservation, two-axis deltas, capture release, other-touch rejection and pitch limits. Direct phone viewport 390px/310px card, no overflow. An iframe fixture failed before creator initialization; do not count that as a passing phone test. Native pointer drag automation unsupported; no claim of a native gesture test. Original SFX and progression tests still pass. Production-safe checkout receives only creator camera/UI changes.

## [Codex | 2026-10-16] v2.211 creator camera production confirmed

Commit b7a88928 deployed successfully (7ba3d989-9596-4e60-ae19-dbbc2485c0a7). Public browser shows v2.211.0-creator-camera and creator/hero scripts v2211. Full body default, persistent toggles, centered head framing and bounded vertical drag are live. Three starter models and direct phone-width layout visually verified; 14 event-handler checks pass. No real saves touched by fixtures. Native drag gestures remain outside automated browser coverage; pointer deltas/cancel/capture guards tested by event harness. Unrelated companion/rig changes and pending Keep/Reaper work remain excluded.


## [Codex | 2026-10-16] U-ESC-PAUSE-20261016

User retracts live Esc menus: single-player Esc freezes time. In co-op the paused player remains visible, invulnerable and grey to friends while the shared world continues. Protection lasts through nested pause menus and ends on resume; it is transient, never saved. Earlier live-pause direction is superseded. PvP retains live unprotected menus to avoid extending co-op protection into competitive play. Conversations and directly opened panels retain their existing behavior.

Grounded plan: track the pause session by world identity, stop solo updates before world/social ticks, guard incoming damage and fall hazards, hold the co-op avatar in place, send Paused presence through the existing protocol and desaturate only that rendered actor with temporary material overrides. Preserve saves and normal peer visibility. Test solo/co-op/submenu/resume/world changes, existing saves and actual rendered appearance before release.


## [Codex | 2026-10-16] v2.212.0 — Esc pauses again

U-ESC-PAUSE-20261016: Esc freezes solo simulation and world animation; nested pause menus retain the pause. Co-op continues shared time, holds the paused avatar in place, rejects incoming damage/fall effects and relays Paused presence. Peers remain visible and opaque with temporarily desaturated materials; original colors return immediately on resume. No saved invulnerability or appearance changes. Competitive PvP stays live/unprotected; directly opened panels and conversations retain prior behavior. Updated pause captions, Help and tutorial guidance.

25 targeted regression checks; actual browser solo/Settings/co-op simulation, presence relay, damage/resume and grey/color rendering checks passed. Existing level-4/rank-4 Warrior save loaded with 1145 gold, 1015 class XP and all three choices intact. Creator 14, progression 43 and audio preservation 255 checks remain passing. Evidence: docs/art-validation/esc-pause-20261016. Simulated peer coverage is not a two-device live co-op test. Production deployment pending confirmation.


## [Codex | 2026-10-16] v2.212 pause production confirmed

Functional commit 7695cfad deployed successfully as c7872571-ac8c-4580-add2-963de0f5544f (deploy stage success). Public browser reports v2.212.0-esc-pause and hero/tutorial scripts v2212, with no console errors. Solo, nested Settings, co-op protection/presence and grey/full-color restoration verified locally in the actual renderer. A real two-device co-op session remains untested. No save-schema changes; old-save compatibility verified.


## [Codex | 2026-10-16] U-FIRST-ARRIVAL-20261016

User reports tutorial exit audio repeatedly glitching, the old hub flashing before new art, and stale combat/shop messages after the hub tour. Requests the current illustrated opening only after tutorial completion (or skipping practice), removing the old pre-hub story segment; more colorful, beautiful fantasy HUD styling retaining all current features; bestiary inside the Sparring Room.

Source diagnosis: nextStage invokes warp audio again from live background completion menus; loading.js disables its cover in hubtour mode; beginCharacterCreation currently plays origin before class creation while openHub plays a second intro; queued teaching messages carry no world identity, and older hub tips duplicate the new tour. Plan: guard portal transitions outside active play/completed trials; keep loading cover through hubtour until current art is ready; move illustrated origin to first hub arrival and retire the extra intro; discard stale contextual tips and suppress duplicate hub teaching; remove outside bestiary duplicate while preserving its interior desk; add a CSS-only colorful navy/teal/gold fantasy finish without changing HUD geometry or controls. Verify an isolated new-character flow, old save, loading gates, sound dispatch counts, notes, bestiary, desktop/phone HUD and pause regressions in browser.


## [Codex | 2026-10-16] v2.213.0 — first arrival and fantasy HUD

U-FIRST-ARRIVAL-20261016: tutorial exit cannot replay warp audio from its completion menu. Creator/practice now precedes the current five illustrated opening pages; skipping practice follows the same story path. Removed the old extra STORY.intro and changed the final illustrated action to Enter the Waystation. Hub tour keeps the loading cover until current detailed hub art is ready. Contextual tips belong to their source world, unread tips are not silently consumed, and the old duplicate hub/shop lessons no longer fire. Bestiary remains inside the Sparring Room; removed its outside duplicate. Added navy/teal/gold HUD frames, jewel-toned vitals and distinct gold/purple progression bars while retaining controls and content.

20 targeted source/loading checks; real browser recorded exactly one exit sound dispatch across repeated completion-menu updates, five story pages after practice, covered hub entry, zero observed premature hub exposures, no post-tour storycard tips, skip-practice/story path and interior bestiary service. Verified desktop styling and actual 390px phone viewport with no horizontal overflow. Older level-4/rank-4 save retains 1145 gold, 1015 class XP and skill choices. Pause 25, creator 14, progression 43 and audio preservation 255 checks pass. Evidence: docs/art-validation/first-arrival-20261016. Test exit was arranged, not an earned novice playthrough; audio remained muted; no two-device co-op story test. An unexported-method fixture error was corrected and rerun. Deployment confirmation pending.


## [Codex | 2026-10-16] v2.213 first-arrival production confirmed

Functional commit 0ce6082d deployed successfully as 94a249c7-f120-4334-a79b-64cc34d95fbf (deploy stage success). Public browser confirms v2.213.0-first-arrival with loading.js and adventure-hud.css v2213. No production console errors on launch. All scope-specific tests and limitations remain recorded in docs/art-validation/first-arrival-20261016/summary.json.


## [Codex | 2026-10-16] U-HUB-QUEST-CHOICES-20261016

User: "also when npcs in the hub have quests, there should be a ! icon next to the dialouge ioptions that progerss the quest". Add a yellow exclamation badge to available request/turn-in entry buttons and actual accepting/completing dialogue choices. Derive choice marking from authored return_accept/return_finish effects, preserving choice IDs, text, timing, saves and spectator restrictions. Shop actions, lore/news, decline/later and active-quest reminders are not progress choices and stay unmarked. Inspect source metadata before styling; verify the actual hub conversation states in-browser.


## [Codex | 2026-10-16] v2.214.0 — hub quest-choice markers

Added a yellow exclamation badge and accessible Quest label to new/ready return-request entries and authored accept/finish dialogue choices. Classification uses actual return_accept/return_finish reward effects; service, news, optional/later choices, active reminders and exit controls remain unmarked. Preserved callbacks, choice IDs, text, 250ms arming window and spectator restrictions. Real browser verified Quartermaster offer/decline, successful acceptance, marked delivery entry and completion, and original 300-gold payout (1145 to 1445) on an isolated older level-4 save. UI screenshot and completion evidence: docs/art-validation/quest-markers-20261016. Syntax, pause 25 and first-arrival 20 checks pass. Initial fixture omitted NPC interaction distance; corrected character position and reran the actual quest path successfully. No two-device co-op conversation test. Deployment confirmation pending.


## [Codex | 2026-10-16] v2.214 quest-marker production confirmed

Functional commit ffe22d54 deployed successfully as 8e70ed65-d95c-4021-8fb6-e3c4d8d997d2. Public browser confirms v2.214.0-quest-choice-markers and hub-dialogue CSS/JS v2214 with no launch console errors. Local actual quest offer, acceptance and delivery verified on isolated older-save state.


## [Codex | 2026-10-16] U-LOOT-REEL-20261016

User requests a less visually invasive slot-machine loot reveal with SFX. Current overlay is up to 720px wide with 140px cards, 3.3s spin and 4.2s result. Plan: compact upper-center ribbon on desktop, tiny strip beneath vitals on phone, shorter 2.1s roll, collapsed result, retained skip/rebound controls and screen-reader result. Add quiet procedural reel ticks on card crossings; move the original chest reward chime to actual reveal instead of layering another replacement. Preserve chest art, old audio assets, probabilities, already-granted item, stash/auto-sell logic and gameplay timing. Ensure skips/queue/world clear stop tick scheduling, reveal sounds once and reduced motion skips rolling. Verify actual chest reward, keyboard skip, reduced motion, mute/volume routing, mobile bounds and old save in browser.


## [Codex | 2026-10-16] v2.215.0 — compact loot reel and sound

U-LOOT-REEL-20261016: desktop reel now 440px wide / 141px tall at 1280px, collapses to a 60px result strip after a 2.1s roll, then closes after 2.1s. Phone strip is 233x45px at (12,132), between vitals and XP and left of the minimap at 390px. Preserved comparison feed, bag outcomes and bound skip action. Removed redundant ordinary-chest center toast; collapsed result includes chest gold. New quiet procedural ticks follow card crossings with a 65ms limit; original reward chime now plays once on reveal rather than on opening. Audio uses existing SFX mute/volume routing. Skip, close, queue clear and reduced motion stop tick scheduling; reduced motion goes directly to the result. Winner centering uses the supplied index instead of hardcoded 20.

Real browser: one item awarded despite duplicate open; selected name matches reward; 11 ticks / one natural reveal; auto-dismiss, skip/repeated close, queued cancellation and zero rolling ticks in reduced motion checked. Older level-4 save loaded and retained progression before fixture chest rewards. Final phone geometry and no center chest toast confirmed. Pause 25, first arrival 20, progression 43, audio-preservation 255 and 200,000 chest table samples pass. Audio tests muted; no subjective listening or native keyboard/controller/two-device co-op claim. Evidence: docs/art-validation/compact-loot-20261016. Deployment pending confirmation.


## [Codex | 2026-10-16] v2.215 compact loot production confirmed

Functional commit 0c58a871 deployed successfully as 36135c0f-1184-4ba1-8c6a-15f52605c461. Public browser confirms v2.215.0-compact-loot-reel and chest-reveal CSS/JS v2215 with no launch console errors. Browser evidence covers actual rewards, sound dispatch/cancellation, reduced motion and desktop/phone presentation; muted testing does not establish subjective sound quality.


## [Codex | 2026-10-16] U-BRIAR-PERFORMANCE-20261016

User reports severe frame drops in Briar Town first half, Black Woods smoother; settings are defaults. Source diagnosis: all rigged enemies bypass mesh frustum culling and animate across the entire map; world3d imports clearMobs from a different module URL than the renderer, so world transitions do not clear the owning actor pool. Outskirts and craft visibility also parse hundreds of constant chunk strings every frame. Baseline default shoulder view submits 346 Three draw calls / 211,782 triangles at Briar entry in the test browser; this is comparative instrumentation, not a reproduction of the user's hardware FPS. Plan: conservative camera-frustum presentation culling with generous full-height/weapon margins and near-player protection; retain all gameplay enemies/AI/quests, correctly suppress legacy fallback for deliberately hidden models, resume current animation state on return and retain corpse cleanup. Share the owning mob module for scene cleanup. Precompute static chunk bounds and reuse nearest-lamp buffers, preserving draw distance/detail/collision. Verify before/after same views, old-save load, near/far/return, pause and transition behavior in real WebGL. Preserve pending Keep/Reaper work outside the production-safe checkout.


## [Codex | 2026-10-16] v2.216.0 — Briar render performance

U-BRIAR-PERFORMANCE-20261016: added conservative whole-actor camera culling and suspended offscreen animation, preserving nearby combat, tall/weapon margins, current-state animation return, hidden fallback suppression and death cleanup. Shared mob module between renderer/world cleanup fixes old actor pool surviving area rebuilds. Cached static Outskirts visibility bounds and reused nearest-light buffers. No scenery, map, collision, save schema, AI, enemy count or settings downgrade. Default entry draw calls 346→249 / triangles 211,782→139,810; village 334→235 / 215,368→144,540. Local mean main CPU/render submission 6.88→5.29ms entry, 6.54→5.57ms village; hardware-specific FPS not inferred. Woods also improves. Real WebGL camera/transition and old-save checks plus relevant regression suites recorded in docs/art-validation/briar-performance-20261016. Production release pending confirmation.


## [Codex | 2026-10-16] v2.216 performance release confirmed

Functional commit 3674bc0c deployed successfully as 44ca70ec-a145-45a9-a84e-adb6e0e559fd (Cloudflare deploy stage success). Public browser confirms v2.216.0-briar-render-performance / hero3d v2216 and no launch errors. Retest on Oliver's hardware still needed to establish experienced frame pacing; local measurements establish lower rendering work, not universal FPS guarantees.


## [Codex | 2026-10-16] U-CAMPAIGN-THREAT-20261016

User: every nearby enemy needs an intuitive red HP bar; basic Mage attacks one-shot Briar and Hollow enemies, and the Briar boss is too easy. Audit of actual Normal damage pipeline: level-3 common-staff Mage hit 39 versus 20-HP grunt; level-6 hit 44 versus 24 HP; starter Warrior/Ranger differ substantially. Existing bars only show damaged enemies except a few named roles. Plan: always show nearby living hostile meters, including full health and bosses; preserve friendly/prisoner bars, make elite fill red, use height-aware cached camera occlusion so markers do not reveal enemies through walls. Keep the renderer performance improvements. Add fixed authored campaign-only health multipliers that rise by zone/half (no player/equipment auto-scaling), modest campaign damage progression and extra early-boss durability. Preserve tutorial/earned trials, sparring, PvP and separate modes; retain 1.6x two-player HP and fraction-preserving party changes. Test actual Normal starter-class breakpoints across campaign, fresh starters, rare gear benefits, boss windows, health-bar wall/height/range cases and old saves. Balance measurements are technical evidence; fun and perceived challenge still require playtesting.


## [Codex | 2026-10-16] v2.217.0 — campaign threat and enemy health readability

U-CAMPAIGN-THREAT-20261016: all nearby living enemies show full-health red meters; elite fill red, friendly/prisoner colors retained, neutral training targets. Cached height-aware camera/solid ray checks hide meters through walls; canvas reused. Tutorial attack page mentions red bars. Added authored campaign-only health curve and modest regional damage progression; Brute health 684→1129 (+65%), Hollow Marksman 1318→1713 (+30%) on Normal solo. Reference common-staff Mage's ordinary hits unchanged (39 Briar / 44 Hollow), grunt HP 20→59 / 24→77. All 24 class/zone damage samples unchanged; no Mage ordinary-soldier one-shots at reference gear. Strong gear, skills and crits still reward progression; no per-player auto-scaling. All real campaign exclusions tested, party 1.6× and current HP fraction retained, old character/class save preserved. Source tests and real WebGL evidence: docs/art-validation/campaign-durability-20261016. Real player challenge still needs playtest. Production deployment pending.


## [Codex | 2026-10-16] v2.217 campaign threat production confirmed

Functional commit 3882ad97 deployed as 97ac8065-7e7c-4fe3-97d3-919be818445c; Cloudflare deploy stage success. Public browser confirms v2.217.0-campaign-threat-readability, campaign-threat/enemy-health/guided-tutorial v2217 and no launch errors. Local real WebGL proof and 24 deterministic class/zone damage comparisons are recorded; experienced combat challenge still awaits user playtest. Optional question about user's character level/rank/weapon remains unanswered and does not block this fixed campaign curve.


## [Codex | 2026-10-16] U-MENU-CANCEL-20261016

User requests Tab to open/close the bag and Q as universal cancel/exit. Source: bag action only handles play; main Escape menu close searches four IDs and misses Settings/controls/creator and other Back buttons; independent dialogue/inspection/chess/tutorial handlers already support Escape. Q is currently ground-item sell. Plan: early Q→Escape input bridge through the focused target, respecting text entry/modifiers/editor and key-repeat; reserve Q and migrate old Q-only loot-sell binding to free X/Delete, update visible control guidance. Bag action closes the active bag through its existing Back callback, preserving opening context, rebound action support and focus traversal elsewhere. General menu cancel finds visible, non-destructive Back/Close/Cancel/Done buttons without guessing purchases, deletion, quit or retry. Verify bag/pause/nested settings/controls, text input, rebind cancellation, repeat, old bindings and independent modal Escape handling.


## [Codex | 2026-10-16] v2.218 — Bag toggle and universal Q cancel

U-MENU-CANCEL-20261016: Bag binding now closes its active screen through existing Back callback; pause-origin bag returns to Pause. Early Q→Escape bridge reuses modal cleanup, preserves text entry/modifiers/composition/editor, prevents key-repeat cascades and skips loot reels first. Reserved Q and moved default ground-sell to X; old Q sell migrates to free X/Delete without overwriting custom mappings. Broader visible safe Back/Cancel/Close/Done detection; Settings mode fixed so it returns to Pause. Class choice can cancel confirmation then choose later without losing rank/unanswered option. UI control copy updated. Real WebGL/DOM 26 checks and 18 source/policy/migration checks pass; other relevant regression suites pass. Evidence: docs/art-validation/menu-shortcuts-20261016. Synthetic keyboard events verified actual DOM callbacks; native hardware/two-device co-op not claimed. Deployment pending.


## [Codex | 2026-10-16] v2.218 menu shortcuts production confirmed

Functional commit 13a0621d deployed successfully as d1486ac7-21db-4797-a867-fc60f19d42bf. Public browser confirms v2.218.0-menu-shortcuts and menu-shortcuts v2218 with no launch errors. Additional old-save load retains level 4 / XP 52 / rank 4 / class XP 1015 / gold 1145. DOM propagation fixture passed 26 actual menu callbacks, with separate policy/migration regressions; native hardware and two-device co-op remain outside these checks.


## [Codex | 2026-10-16] U-CAMERA-LOCAL-VIEW-20261016

User requests local first-person body invisible except equipped weapon; allies must still see full character. Also adjustable FOV and wheel FOV in first-person, zoom in both other views within bounds. Source: hero3d hides head by scaling bone only; body/class cosmetics remain visible. FOV slider already exists at 70–115 but wheel handler is absent. Plan: draw-local renderable visibility mask preserving weapon attachments/bones and restoring in finally; no replicated/persistent visibility change, portraits/inspection/chess retain full bodies. Legacy fallback must omit hand/arm geometry. Shared bounded camera controls: first-person 70–115°, shoulder zoom .75–1.4, overhead .7–1.5, separate saved settings/default 1. Use optical zoom for third-person, preserving collision-safe camera positions and authored room framing; skip special dialogue/tour/chess/editor/ballista/cinematic views. Wheel only over gameplay, no menu scrolling or browser modifiers, debounced persistence; settings expose active-view zoom/FOV. Verify all modes, bounds, save, body/weapon/peer restoration and old-save load in real WebGL.


## [Codex | 2026-10-16] v2.219 — first-person weapon-only view and wheel zoom

U-CAMERA-LOCAL-VIEW-20261016: renderer-local body/cosmetic hiding with finally restore, preserving stock/equipped weapon attachments and full co-op rigs. Removed fallback arm/fist geometry. Wheel on gameplay canvas adjusts first-person FOV 70–115°, shoulder optical zoom 75–140%, overhead 70–150%; independent saved settings, debounced persistence, normalized wheel deltas, modifiers/menus/special cameras preserved. Optical zoom leaves camera positioning/collision intact. Active-view Settings slider and Help updated. Real WebGL 17 checks each for Warrior, Mage, rank-10 Mage: local body 0, weapon rendered, 62 legendary renderables restored, synthetic co-op body visible, actual zoom projection and settings persistence. Older level-4/rank-4 save retained. Camera/appearance 23 and relevant regressions pass. Evidence docs/art-validation/camera-controls-20261016. No native hardware/two-device co-op claim. Deployment pending.


## [Codex | 2026-10-16] v2.219 camera release production confirmed

Functional commit 1ef3e4f0 deployed successfully as c1c6b8e8-ed6d-404b-8283-fe291bb38452. Public browser confirms v2.219.0-local-camera-controls, camera-controls v2219 and hero3d v2219 without launch errors. Real WebGL local-draw visibility, synthetic peer, settings/wheel and old-save evidence recorded; no native wheel hardware or two-device multiplayer claim.


## [Codex | 2026-10-16] U-MINIMAP-INSTANT-20261016

User reports delayed/clunky minimap direction and requests real-time turning. Source: guided-tutorial map already draws after the world each animation frame, but applies exponential heading smoothing plus 3.5 rad/sec slew limit. Preserve current camera-relative shoulder/first-person heading and player-relative overhead heading. Read navigation once per draw and use its current finite heading directly; retain marker geometry, player arrow relative heading and edge indicators. No extra throttle, save fields or gameplay changes. Verify actual canvas transforms for abrupt turns, angle wrap, missing heading, peers/objectives and pause/resume; run real WebGL and old-save load.


## [Codex | 2026-10-16] v2.220 — immediate minimap direction

Removed secondary heading smoothing and angular speed cap. Map samples current navigation once per animation frame, retaining relative player arrow, objective and teammate markers. Actual canvas regression: 38 checks; browser WebGL: 31 checks across all three views, abrupt turns and angle wrap, plus older save level 4 / XP 52 / Warrior rank 4 / gold 1145 retained. Camera regressions: 23 passed. Evidence docs/art-validation/minimap-20261016. These are direction/render checks, not a hardware playtest.


## [Codex | 2026-10-16] v2.220 production confirmed

Functional af645876 deployed successfully as 2c155abc-7de9-49cd-99e8-2079a5a06f43. Public browser confirms v2.220.0-instant-minimap and guided-tutorial v2220 with no launch errors. Real WebGL direction and old-save checks passed; hardware feel awaits player feedback.


## [Codex | 2026-10-16] U-HUB-TRANSITION-20261016

User reports hub floor becoming out of bounds, damage and enemies after Hollow Canyon; title temporarily resolves it. Reproduced in real WebGL: queue portal warp then return to hub before its 190ms callback. Unguarded nextArea runs on the NEW hub, loads stage 1 into hub:true, replaces continuous floor (four missing sampled floors), sets bramble, spawns 10 hostiles and loses 34 HP; hub art remains. Normal boss-clear returns were clean. Plan: bind pending portal warp to its original world, portal and district; cancel on hub/area entry, reject stale/dead/menu callbacks; guard hub against nextStage, nextArea and loadArea/loadStage. Check delayed co-op state for cross-scene enemy contamination as adjacent boundary risk. Verify repeated clear/quit/restart flows, pending-warp cancellation, valid portal advancement, old-save/progress preservation and hub walkable footprint/no damage in real browser. Do not alter campaign difficulty or hub art to hide the bug.

Adjacent co-op reproduction: a saved Hollow state packet delivered after hub entry spawns 8 hostile mirrors because state/enemy reconciliation has no world identity check. Add additive scene stamp normalized for shared hub/arena/sprint (their independently generated character-world seeds are not authoritative); validate before any state mutation, legacy fallback checks host zone/area/hall. Campaign/trial/floor/run stamp rejects stale same-zone attempts as well. Preserve matching room snapshots and legitimate sparring enemies; ordinary hub enemy reconciliation must never import hostiles.


## [Codex | 2026-10-16] v2.221 — safe hub returns

Reproduced and repaired delayed portal callback contaminating the hub: old state replaced its continuous floor, enabled bramble and spawned 10 hostiles, costing 34 HP. Warp is now scoped to source world/portal/area/stage, cancelled on hub/area entry and rejects death/downed/menu/stale callbacks. Hub cannot run level builders/advancement. Separately reproduced 8 hostile mirrors from stale co-op world snapshot; stamped world identity now rejects mismatches before state mutation, normal hub rejects enemy import, matching room HP updates still work. Hub/arena/sprint independent seeds preserved; legacy zone/area/hall fallback. Real WebGL repeated staged Hollow/boss-clear/Return to Hub, legitimate Canyon→Marksman portal, actual Pause→Quit to Hub during pending warp, delayed co-op replay, old level4/XP52/rank4 save and 437 ground samples pass; no hub damage or hostiles after fix. 32 portal/network, 20 first-arrival, 25 pause, 23 camera, 60 threat, 38 minimap checks and 146 boss target cases pass. Evidence docs/art-validation/hub-return-20261016. Simulated packet delivery, not two-device co-op or a full human campaign playthrough.


## [Codex | 2026-10-16] v2.221 production confirmed

Functional 0e913bd0 deployed successfully as 6921ce87-7d45-45c9-99f4-298d7703208c. Public browser confirms v2.221.0-safe-hub-return with no launch errors. Exact hub corruption and delayed co-op state reproductions now pass; matching enemy updates, valid portal, pause quit, repeated clear returns, old save and full hub footprint verified locally in WebGL. User single/co-op clarification was optional and not required to fix both reproduced paths.


## [Codex | 2026-10-16] U-ARMOR-EQUIP-LOSS-20261016

User reports certain armor disappears from inventory without equipping. Real WebGL reproduction: open hub bag from active play, advance to actual 8-second background autosave, then click Equip. openBag captured meta.hero; autosaveRun replaces meta.hero with snapOf(G.p), so handler edits stale HR, splices stash, then fails both HR===meta.hero and HR===G.p synchronization. Item is absent from live, saved and displayed gear. Plan: inventory displays current live actor; equip resolves current actor and selected entry identity at click, rejects changed worlds/invalid slots/rarity/class before mutation, stages cloned loadout and recomputed stats before committing bag and actor together, immediately snapshots hub hero. Apply same live-source correction to Use Class Default. Preserve old-item return/full-bag swap, campaign checkpoint and separate-mode save contracts. Test every equipment slot, weapon/default, delayed autosave, stale entry/index and world change, full bag, locked gear, hub resume/reload, active campaign, co-op and old save. No invented recovery of unknown previously lost items.


## [Codex | 2026-10-16] v2.222 — equipment swap item-loss fix

Reproduced actual hub background-autosave replacing captured meta.hero while Bag stays open: Equip consumed chest item but changed only obsolete snapshot, leaving live/saved/UI slots empty. Bag now renders live actor; each equip resolves current actor, checks selected entry identity/world/slot/level/class, stages cloned gear/stats/snapshot before consuming selected entry, returns replaced item and snapshots hub hero together. Use Class Default also targets current actor. Real WebGL original race now equips correctly; 78 matrix checks cover five slots, full-bag swaps/old-piece return, immediate persisted slots, equipped panel, weapon/default, rarity rejection, actual save/load, unchanged old level4/XP52/rank4/gold1145, synthetic co-op paused autosave, campaign equip and checkpoint-retry item ownership. 100 unit conservation/race cases, 18 menu, 23 camera, 25 pause and 32 hub transition regressions pass. Evidence docs/art-validation/bag-equip-20261016. No two-device test or recovery of unknown previously lost gear is claimed.


## [Codex | 2026-10-16] v2.222 production confirmed

Functional 6e4f43f6 deployed successfully as 12e873dc-c1bd-4b84-bab6-54f4ddbfb802. Public browser confirms v2.222.0-safe-equipment-swap without launch errors. Original actual-autosave item-loss reproduction now succeeds; 78 real-WebGL interaction checks and 100 conservation/race checks recorded. Previously lost unidentified items were not restored.


## [Codex | 2026-10-16] U-INTERACTION-AUDIT-20261016

User requests thorough major-bug audit after multiple severe new-update regressions. Review actual transaction ownership, saved/live state, timers crossing worlds, menu/pause progression, co-op state and class skill execution. Initial source risks: perk purchase changes only meta.hero while hub autosave overwrites it; refund reconstructs hero without allocation/tunedLevels; forge/gamble rewards arrive only in delayed animation callbacks; death fade is not cleared on ordinary hub return. Build isolated real-WebGL reproductions before changing each. Correct current actor ownership and conservation, commit rewards before decorative animations, cancel disconnected UI callbacks and bind death UI to source world. Run existing save/inventory/menu/tutorial checks, class/skill smoke tests, old save reload and repeated scene flows. Distinguish obsolete test assumptions from game failures. Keep current art/content/balance and separate-mode checkpoint contracts; audit findings and evidence go in docs/art-validation/interaction-audit-20261016. No claim that automated checks prove the entire game bug-free.


## [Codex | 2026-10-16] v2.223 — major interaction safety audit

U-INTERACTION-AUDIT-20261016. Five reproduced defects fixed: purchased perk erased by hub autosave; refund reset allocated character build; forge result not saved until animation despite removed inputs; paid Fortune’s Bag reward similarly delayed; death fade remained opaque after hub return. Perks use current live actor, refund preserves allocation/level/gear, forge/payment/reward commit before decoration, detached reel timers cannot mutate new UI/save, scene creation/entry clears death fade/timer and delayed death/PvP respawn is world/player-bound. Full Fortune bag purchase rejected without gold loss. Existing tutorial retry remains correct. Final 90 CJS/MJS suites pass; 136 skill casts across all 17 classes/both branches throw no runtime exception. Browser evidence covers each before/after defect, isolated save deletion/stale writes, unnamed creator and tutorial retry, 26 menu callbacks and 78 inventory checks. Updated six obsolete test assumptions/adapters with approved behavior, no quest/art changes made to satisfy tests. Scope/limits and evidence: docs/art-validation/interaction-audit-20261016/summary.json. No full human playthrough, two-device co-op or universal bug-free claim. External voice API test excluded; no spending.


## [Codex | 2026-10-16] v2.223 audit release production confirmed

Functional 7cd8702d deployed successfully as 9b318823-8054-4bfc-98f8-1d9be1c427f0. Public browser confirms v2.223.0-interaction-safety without launch errors. Five reproduced save/reward/fade issues repaired; final 90 suites pass, 136 class casts no exceptions, browser interaction/save/tutorial checks recorded. Evidence/limits in interaction-audit summary. Real multi-device and complete campaign playthrough remain unverified.


## [Codex | 2026-10-16] U-SHOP-CHESTS-20261016

User requests chest purchase rarity unlocked by character level, with significantly increasing prices and appropriate scaling. Source: gear requirements are Common 1, Uncommon 5, Rare 12, Epic 20, Legendary 30; shop weapons cost 60/220/650/1600, Fortune bag 480, socks 1200, secret sense 30000. Plan: Quartermaster chest subpage, visible five-tier color-coded guide; fixed 150/600/2400/9600/38400 gold (4x each tier) using existing rarity level requirements. One random gear item directly into bag, existing BFChestRules odds shown explicitly, bonus higher-rarity gear may need its own equip level. Legendary 100% Legendary. Validate current save generation/world, live character level, capacity and funds at click; reject full bag even with auto-sell on; generate before spending and save gold/reward before reel. Reject detached/repeated purchase buttons; return to shop/bag through existing callbacks, no saved schema changes. Verify boundaries, current/old saved state, no-charge failures, conservation, stale callbacks and real browser desktop/phone. No world chest odds, difficulty, art or existing gold changed.


## [Codex | 2026-10-16] v2.224 chest shop verified locally

Implemented U-SHOP-CHESTS-20261016. Level gates1/5/12/20/30; gold150/600/2400/9600/38400. Existing chest odds reused and disclosed. Reward/payment conserved before reveal, no paid auto-sell, save-write rollback, live level and scene/generation guards. 38 unit checks plus 27 browser checks, old save reload, narrow/desktop visual review and adjacent regressions pass. Public deployment confirmation pending. No user save mutated; no two-device/pacing claim.


## [Codex | 2026-10-16] v2.224 production confirmed

Functional d1fdb9cc deployed successfully as ac8a9010-298f-41bb-8118-59611648e675. Fresh public browser shows v2.224.0-shop-chests with no launch errors. Purchase/reload integration remains verified against local identical production source with isolated pre-change save; no real player save touched.


## [Codex | 2026-10-16] U-DRAGON-RIDE-20261016

User explicitly requests dragon mount and flight. COMP-03 previously approved same-input mount/dismount, strong limited flight, companion fights only dismounted; mounted rider combat unanswered. Asked optional travel-only versus combat question; implement conservative travel-only unless user chooses combat. Source: Sunspire quest-only sunwing owned/equipped companion, existing pet breath, controller Interact, remappable keyboard actions, normal collision/floor, local and replicated 3D rigs. Plan: earned active healthy sunwing only; H remappable mounting plus context E/controller Interact mount/land; Jump hold ascend, release glide, Dodge hold descend, usual move/camera. Eight-second flight stamina, ground recharge, bounded height; grounded safe mounting/dismounting, land-before-interaction, recover to last solid ground if exhausted over void. Outdoor hub/campaign travel only; forbid arenas/trials/challenge modes, caves/library/tower interiors. Preserve walls/closed doors as horizontal flight barriers, normal obstacle/ceiling collision and solid landing. No attacking pet while ridden, no rider attacks pending answer. Distinct seated/reins pose, weapon attachment hiding restored, dragon enlarged only while ridden, flapping and shared peer pose. Riding is transient; save existing growth/loadout only, clear ride on scene changes, death, pet loss/switch, teleport and disallow menu/tour actions from initiating. HUD shows rebound keys/controller hints. Verify stamina/landing/blocked gates, actual inputs/camera/models, old saves and actual multiplayer serialization through controlled handlers; no claim of internet co-op/hardware controller playtest.


## [Codex | 2026-10-16] v2.225 dragon flight verified locally

U-DRAGON-RIDE-20261016 and COMP-03 travel implemented. Riding/limited flight now exists; rider-combat question remains unanswered and conservatively disabled, not inferred approved. Active owned sunwing, outdoor campaign/hub only; H or contextual controller/keyboard Interact, Jump ascent, release glide, Dodge descent. Fuel8s, height180, grounded recharge2/s. Saves omit transient mount state; walls/doors/ceilings and safe landing preserved, co-op protected pause holds fuel/pose and mounted companion safety. Actual peer snapshots/rendering fixed for hub/area scoping. Local first-person dragon hidden for every render pass, restored after draw; peers unaffected. 51 pure checks, 20 hub and 24 campaign browser assertions, 92 offline suites pass. Camera/seat proof and limits in dragon-riding summary. No human/hardware-controller/two-device claim, no production saves touched. Deployment pending.


## [Codex | 2026-10-16] v2.225 production confirmed

Functional 5f37b2d4 deployed successfully as d938b880-8e7b-4a54-83ae-6c73929ddbee. Fresh public browser confirms v2.225.0-dragon-flight with no launch errors. Full flight/pause/peer checks remain against isolated local production source and genuine pre-change save; no real player save changed. Travel-only default retained pending optional mounted-combat preference.


## [Codex | 2026-10-16] U-CHESS-SEATING-HISTORY-20261016

User requests chairs and players moved considerably back from table; both players visible and transparent only when blocking board; companion parked beside chair. Flat board must support piece drag/drop, show opponent's previous move and allow live history browsing. Source: human seats at +/-11 overlap 25-wide tabletop, Thomas at21; local chess actor and Thomas fade unconditionally; flat squares use click-only data-flat while pointerDown rejects socialBoard; chess state has no move log. Plan: shared +/-30 seat layout for human/Thomas/chairs, room for knees, wider/higher board camera; camera-to-board ray checks against human torso/head volumes, temporary draw-local alpha only on obstruction, both local/peer actors and Thomas handled without network visibility mutation. Park companion outside chair/table bounds while seated (idle/sit clip where available), restore follow on exit and sync pose. Host-owned compact move log with SAN/color/from/to/FEN and match serial in session snapshot; local history cursor affects only own 3D/flat preview, live clock/game continue; disable moves in review, visible Live return and updates notice, reset on new game. Highlight opponent's most recent origin/destination in flat and world board; reviewed move highlighted during replay. Share flat/world pointer drag path, legal validation/promotion/turn/revision and one click suppression after drag; cancellation, outside drops and updates must not duplicate moves or grab camera on panel. Verify actual human/Thomas seating, board-obstruction views, companion clearance, legal/illegal drags, black perspective, live history while opponent moves, reset/leave/rejoin, castling/en-passant/promotion, clock/pause/co-op and old save. No undo of live match, reward/story or engine strength changes.


## [Codex | 2026-10-16] v2.226 — chess seating, visibility and live history

U-CHESS-SEATING-HISTORY-20261016 implemented. Human/Thomas/chair centers now +/-34 from tabletop center (previous human11/Thomas21); hips align to seat height14 without stretching bones. Wider camera shows both players. Torso/head-to-board sight lines fade only actual blockers; a matching chair-back check preserves board visibility at low angles. Fixed manual-camera matrix mutation found in real WebGL verification. Companions park beside/behind seats, idle/sit and resume following on exit; standard quadrupeds fold rear legs and dragon has a rest pose. Flat and world squares share legal drag/drop; click movement remains. Last opponent origin/destination highlighted; Start/Previous/Next/Live and clickable move list review session history locally while live clock/opponent continue. Moves disabled in review, compact host SAN history reconstructed on guest, no live undo or durable save-schema change.

Verified genuine pre-change save, 28 real-browser interaction assertions including both colors, guest history, invalid/outside drops, leave/resume/reset, concurrent opponent move and live clock during review; 33 focused layout/visibility/replay/rest checks, 93 offline suites and inline parser pass. Actual human and Thomas default/angled/low/reverse camera screenshots inspected. Evidence: docs/art-validation/chess-experience-20261016. Browser drag tests use synthetic PointerEvents through real UI handlers, guest delivery uses actual snapshot/apply with a stub transport; no native hardware drag or two-device network claim. Publication pending.


## [Codex | 2026-10-16] v2.226 production confirmed

Functional cde36e16 deployed successfully as 29791293-a0df-4987-8e89-2d890ee4f158. Fresh public browser confirms v2.226.0-chess-experience with no warning/error logs. 28 isolated real-browser interaction assertions, 33 focused checks, all93 offline suites and inline parser pass. Ordinary UI click move received a legal Thomas reply. Real two-device/network latency and hardware mouse dragging remain playtest checks; no player save altered by QA.


## [Codex | 2026-10-16] U-THOMAS-HARD-CAPE-20261016

User requests a black-and-white checkerboard cape unlocked only by defeating Thomas on Hard in chess. Plan grounded in existing solo chess authority, class-independent cosmetic wardrobe and cloth renderer: add Checkmate Cape with crisp checker fabric and matching wardrobe icon; locked hint names Thomas/Hard. Award once to active character after a legitimate solo Hard checkmate or time victory against Thomas, either player color. No reward for draws, losses, easier settings, human co-op wins or reviewing a winning position; difficulty already locked after first move. Save through existing character persistence, expose reward hint on Thomas chess panel, preserve existing cape/equipment without auto-equipping. Verify actual checkmate handler, exclusion cases, repeat/reload persistence, wardrobe equip and cloth render from old save.


## [Codex | 2026-10-16] v2.227 — Checkmate Cape

U-THOMAS-HARD-CAPE-20261016 implemented. Black-and-white checkerboard cloth cape with monochrome stitched edging and matching wardrobe SVG. Cosmetic only, no automatic equip. Defeating solo Thomas on Hard by checkmate or a legitimate time victory awards it once, either color; losses, draws, Easy/Medium, human co-op opponents and history review cannot award. Existing pre-move difficulty lock retained. Slot-profile cosmetic flag is written and read back immediately, rollback/retry if storage fails. Thomas chess panel explains the condition and confirms the earned reward; equip at the Stylist. Existing cosmetic ownership and equipped cape preserved. Stateless preview supports ?cape=checkmate.

Verified 30 isolated real-browser assertions with genuine pre-change save: actual legal moves reaching checkmate, Hard loss, Easy/Medium wins, Hard win, visible confirmation, durable profile record, Stylist equip, mode reload, live cloth renderer and unchanged gold. Engine worker deliberately silent for scripted legal opponent moves; this is reward integration QA, not a claim to have beaten the actual Hard AI. 20 focused eligibility/save-failure/idempotency checks plus existing chess regression checks pass; 94 offline suites passed. Preview screenshots inspected on Warrior/Wizard; no production saves touched. Evidence: docs/art-validation/chess-cape-20261016. Publication pending.


## [Codex | 2026-10-16] v2.227 production confirmed

Functional edd64871 deployed successfully as d25dbf1c-74b5-4211-8214-59dbba4d06e0. Fresh public title confirms v2.227.0-checkmate-cape; public stateless preview confirms Checkmate Cape,192 cloth triangles, no launch/preview warnings or errors. Reward integration evidence remains isolated QA with scripted legal bot moves, no production save touched.


## [Codex | 2026-10-16] U-RELIC-DICE-RANDOMIZE-20261016

User supplies Desktop/Ancient Golden-Pip Relic Dice.png and requests it for all randomize features. Found transparent RGBA1254-square original. Source audit finds seven active3D controls: creator face/stats, Stylist face, Arena bot class roll/random bot selection/loadout/random respec. Plan copy exact supplied PNG once, use shared-sized decorative image on all seven, retain visible labels and randomization handlers, add accessible label to icon-only bot-class button. Preserve asset alpha and avoid resynthesis or gameplay changes; verify actual menu rendering/clicks plus creator/style regressions and parser.


## [Codex | 2026-10-16] v2.228 — relic dice randomize artwork

U-RELIC-DICE-RANDOMIZE-20261016 implemented. Exact supplied transparent PNG reused for all seven active randomize controls: character face/stat rolls, Stylist face, Arena bot-class roll/random class/loadout/random respec. Shared30px decorative image,26px icon-only roll, accessible bot-class label, existing visible text and handlers preserved. Old dice emoji removed from randomization toasts. No random-generation/economy/save behavior changes. Original and copied SHA256 match FC646ADFB8BDCC17D368EB4ECB1EBE52FF9A1F9374816E689EE3700F0E054BD9.

Actual browser menus from isolated pre-change save: all seven images complete/natural width1254, all seven buttons clicked; Random Respec confirmation retained. Creator14-handler checks, face option bounds/randomization, Stylist purchase validations and game inline parser pass. Screenshots inspected. Evidence: docs/art-validation/relic-dice-20261016. Publication pending.


## [Codex | 2026-10-16] v2.228 production confirmed

Functional df1aa23b deployed successfully as 2bb4a5c4-8957-4d78-9eb7-d4e4c3ef9dd0. Public browser confirms v2.228.0-relic-dice and the supplied PNG renders at1254x1254. No launch errors. Exact local original/copy SHA256 match recorded above; direct CLI image download was403 while real browser image loads successfully. Seven actual menu controls verified locally with isolated storage.


## [Codex | 2026-10-17] U-LEGACY-SAVE-LOCKOUT-20261017

User reports opening a very old level100 save locks the game and refresh cannot recover; explicitly authorizes deleting current saves if needed. Priority hotfix before pending campaign quests/dialogue/stairs. Do not assume level100 itself is invalid: retain legitimate high-level snapshots, normalize malformed container/numeric data before slot previews and mode migration; remove null/nonobject stash entries. Add engine-independent save recovery page and startup-error escape, no dependence on crashed game. Recovery clears only Bladefall saves on that browser, including legacy keys, invalidates all three slot generations so old tabs cannot restore wiped data, no server-wide wipe of other players. Verify malformed JSON/null/primitive/wrong-shaped profiles, bad numeric snapshots, validlevel100, refresh/title and creating new character after reset. The requested farming/dialogue/stair work remains active after hotfix.


## [Codex | 2026-10-17] v2.229 — legacy save recovery

U-LEGACY-SAVE-LOCKOUT-20261017 implemented. Normalize malformed save roots, containers, null inventory entries, item affixes, class records and nonfinite player numbers before slot previews and migration; retain legitimate level100 characters. Unknown class falls back safely. Standalone /3d/recover.html clears this browser's Bladefall character/dungeon/legacy saves and invalidates stale-tab generations. Title and startup-error recovery links do not require a running game. No global player wipe.

95 offline regression suites passed, including24 new save normalization/reset checks. Real browser reproduced null-stash crash on a modified genuine pre-change level100 save; repaired same fixture loads into hub with finite HP and level100 intact. Standalone reset verified only against isolated disposable storage. Exact user save was not inspected; recovery link covers other malformed legacy states. Evidence: docs/art-validation/save-recovery-20261017. Publication pending.
