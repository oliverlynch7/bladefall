# Progression celebrations — October 16, 2026

Two real progression events need separate cues. A player level grants health/power and stat opportunities without interrupting combat. Class rank opens a skill/passive choice, so it needs an advance signal rather than an abrupt modal.

## Authored flow

Player: gold upward crest, concise level/stat banner, expanding rings and existing golden sparks. No mode change or added slow motion. Coalesce multiple levels earned in one XP transaction into one final-level announcement and accurate point count. Keep meaningful gear eligibility messages.

Class: purple star crest and rune pulse. Before an earned skill/passive menu, stop the local simulation using its existing upgrade mode, release held input and clear only the contents of the preserved menu card. Keep the HUD/world visible for 850 visible milliseconds, then slide/fade the choice card in over 200ms. The first rank-2 message explicitly says the first skill is ready. Existing confirmation and click arming remain. Choosing an option plays a quieter selection cue rather than replaying the rank-up fanfare. Rank 10 without an unmade choice stays nonblocking.

Use the already-generated paid player and class cues; no API generation. Marked UI is cosmetic, unsaved and pointer-transparent. Guard transitions against world/player/class changes, death, downing and stale choice ranks. Hidden tabs do not consume the heads-up time. Prefer reduced-motion static effects; particles-off hides world pulses but preserves readable text. Convert projected render pixels to CSS pixels at any DPR.

## Verification

Node state tests use the actual XP/transition functions and clock. Separate local QA is explicitly staged, has in-memory storage, and never modifies the player save. Browser tests check rank-2, passive choices, simultaneous rewards, player-only time/movement and motion settings. Technical decoding of paid SFX is separate from subjective listening approval. Do not infer campaign difficulty or normal earned play from staged rank grants.
