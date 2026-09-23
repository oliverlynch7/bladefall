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
