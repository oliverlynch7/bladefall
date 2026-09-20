# Hub dialogue and recording batch

Scope: DLG-01/02/04/05/08, VO-01/03, SAVE-05; continuation of approved VO-PRIORITY-01. No new lore decisions.

Grounded plan: replace the five existing human service keepers' repeated NPCVOICE strings with one shared authored JSON book, imported by the private Voice Studio API and loaded by the game. Preserve the existing Smith, Quartermaster, Stylist, Drillmaster and Beastkeeper identities and shop callbacks. Props such as the board are not speaking characters.

First introductions persist per save slot, including an interrupted line cursor. Later visits offer direct service access and optional questions; campaign completion unlocks a visible optional update without interrupting shopping. Keep these hub service interactions personal; campaign shared conversations and quest rewards remain a separate required integration.

Presentation: progressive subtitles, visible chosen reply, safe response input, Escape/Leave at any point, approved recording playback with optional device speech fallback, and a temporary NPC camera that preserves the gameplay camera preference. Never publish unapproved recordings. No new expensive NPC meshes in this batch.

Acceptance: all five service paths; once-only introductions and interrupted resumption across reload; save-slot isolation; no consumption of optional updates by shopping; exact chosen reply; unavailable recording fallback; speech stops on exit; mobile layout; existing story and recording API regressions. Networked campaign framing remains open until verified.

## Verification and release scope

- 17 real-browser hub checks: all five services, interrupted-line reload, first-intro completion, save isolation, progressive text and reply, pause/resume, optional-news gating and shopping independence, mobile bounds.
- Five controlled browser voice checks: approved wording and published audio selection, voice cancellation, TTS cancellation, mute, animated mouth returns to rest. Audio events were stubbed for deterministic in-game timing; real device voices still vary.
- 13 real-browser Studio regression checks passed with 32 lines, including synthetic MediaRecorder capture, playback, approval, backup, stale wording, failed upload recovery and mobile layout. No synthetic audio sent to production.
- Existing story reducer and Voice API suites pass; Pages Functions build succeeds; syntax and diff checks pass.
- Reviewed screenshots of all five conversation cameras and phone layout. Local hero/cape hidden during dialogue to avoid blocking NPC; model and camera preference restored on exit. Reused existing fitted face data, preserving player presets.

Hub scripts intentionally avoid unimplemented reward promises, personal-name changes, early Bladeborn reveals, multiple Hollow Gates or permanent Ian's Blade claims. Optional first-victory lines describe encouragement only. First introductions are shared across modes within a save slot, like other hub onboarding, but never across separate slots.

Remaining: actual campaign NPC placement and co-op synchronized conversations; broader NPC redesign; per-region reactions/side quests; richer facial animation. The hooded Quartermaster's mouth remains covered. No claim that the whole campaign overhaul is done.


## Production verification - September 20

42d280c pushed to main; Cloudflare Pages deployment 55261125-5d9d-400d-adc0-4ba55c71872e succeeded. Live browser verified version 1.989.0-hub-conversations, 20 new hub lines, six screenshot images and private catalog rejecting unauthenticated reads (401). All original Thomas/Mara IDs remain intact.
