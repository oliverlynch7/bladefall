# Sound direction: preserve first, add identities

## [Codex | 2026-10-16]

The original file and procedural sounds are authoritative again. All 64 generated takes and their masters remain available for later listening. None is active as an automatic replacement. Signal level, decoding and lack of clipping cannot establish that a take sounds better. No further credits spent on this preservation pass.

Future work adds a named cue for a genuinely distinct event while retaining the existing generic fallback. Do not replace an existing slot as a shortcut. A new cue should run instead of its generic fallback for that event, not double both layers automatically. Keep existing good material reusable elsewhere. Require a specific listening choice before promoting replacement takes.

Initial source inventory covers 17 classes / 136 skill choices (two alternatives at four active-skill ranks), 30 authored campaign enemy voice/death mappings and 14 shared enemy cue groups. These counts are not a count of all sounds the game needs. Generic coverage is not silence. Bosses, dungeon-specific creatures and interactables need a separate source-bound audit before calculating a generation budget.

Priority: distinctive skill casts/impacts where identity matters; weapon actions currently using generic swings/releases; enemy attack warnings, attacks and reactions that share generic audio; boss signature warnings/phases; physical puzzle and interactable responses. Preserve existing UI, loot, chest, movement and reward defaults. Reuse a fitting candidate as a new specific cue when possible before generating more.

Every new entry needs event ID, actual source trigger, existing fallback, candidate reuse decision, length, cooldown/overlap rule and licensing/provenance. Combat warnings must match the animation timing; repeated rapid attacks need restrained tails; distance/volume/mute remain consistent. Avoid emitting every event from every creature at once. Technical validation and listening acceptance remain separate.


## [Codex | 2026-10-18] Missing skill identities and creature warnings - v2.277.0

Generated128 short named skill casts for16 classes other than Pyromancer, whose8 paid cues remain. All17 current classes/136 active choices now have individual identities. Added27 ordinary-enemy wind-up identities at actual visible state edges, per-actor0.9second/global3starts per0.3second bounds and distance attenuation. Dust Jackal, Revenant and Magma Skitter use charger-start callback with original generic warning as fallback; other species use melee/shot/special wind-up edges. Base Charger/Thornboar keep existing warning; Goblin does not attack. No boss mechanics or balance changed.

Existing sound files and registry slots preserved, including preferred originals. New decoded casts replace synchronous generic cast layers for that event; absent buffers retain originals. Original hit/death feedback and later impacts remain audible. Refunded/cooldown-blocked skills do not play/send a signature. Ally whitelist expanded, one signature survives crowded capture, lower ally gain/mute/scene/rate controls retained, missing remote cue uses class-matched original fallback. Lazy loading decodes at most3 new buffers concurrently and fetches chosen skills/nearby creature types, avoiding an eager155-file startup burst. No delayed warning replay.

Paid Starter generation:1280+162=1442 billed credits. Settled balance39368 to37926. Raw masters/prompts/hashes and no-uncertain-retry ledgers preserved. Concurrent batch account usage deltas overlap: consolidated report uses response charges and settled difference. Subjective listening pending. Preview:https://bladefall.pages.dev/3d/audio-preview/ includes136 skill identities+27 warnings, filter/volume/stop, no autoplay.

Verified138 regression suites,1553 focused skill checks,206 warning checks. Muted Chrome loads isolated old level100 save, decodes136+27 MP3s, attempts136 real skill handlers:123 accepted casts send one signature each,13 target-limited/refunded.403 main browser checks, no captured console errors. Actual enemy AI update for27 species:28 checks, each starts a warned attack. No fresh two-human Internet session or listening-quality claim. Evidence:docs/art-validation/class-casts-20261018/.

Remaining: current boss attack/phase callbacks and world/puzzle/interactable/sustain lifecycles need separate source audits. Historical1296-brief wishlist includes covered, proposed and superseded events and was not blindly generated. This release completes current class cast identities and27 creature warnings, not every historical audio brief.
