# First steps — 2.041.0, 2026-09-27

User requests concrete improvements for an inexperienced new player ahead of family playtesting.

Implemented:
- Short, accurate starter practice introduction with current rebound controls, mouse/touch support, one goal, pause/camera advice and clear skill-unlock expectations.
- Explicit confirmation before skipping practice; explains that chosen class is retained.
- Concise Waystation introduction prioritizes Briar Town instead of a long shop list.
- Tutorial proximity tips use actual bindings and plain language.
- Main pause menu exposes Help & controls directly. Searchable help, current control list, context-sensitive next step, objective-marker/clue/healing guidance. Removed obsolete element-status and class-path explanations from displayed help rather than promising unimplemented proposed element changes.
- Every class skill/passive choice opens a separate review step before commit. Compare-again cancels without saving. Keyboard attack-choice shortcuts cannot confirm the review; confirmation retains the existing input-arm delay and single-commit guard.

Validation: real Chromium tests for rebound attack/jump/interact, skip/back, skill review/cancel/commit, attack-key non-confirmation, help search/empty results and 390px overflow. Existing pre-change save loaded and retained checkpoint/clue, class/rank/choice, gold, pets, hub introductions, return quests and disabled speech. Expected local voice-api 404s, no page exceptions in test. Phone screenshot reviewed; reduced nested padding. No save schema changes.

Limits: this is focused onboarding work, not a full first-time campaign playthrough. Illustrated opening cutscene still awaits art and implementation; no SFX or character art replacement.
