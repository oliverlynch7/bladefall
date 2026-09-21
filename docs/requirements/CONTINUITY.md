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
