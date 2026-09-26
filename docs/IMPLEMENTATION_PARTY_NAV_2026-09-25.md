# Party travel, guidance and keyboard reliability

## [Codex | 2026-09-25] Approved request and grounded plan
User requests a held, several-second co-op teleport to a selected friend, interrupted by attacks; a distant-friend prompt and cycling multiple teammates; main-objective arrows and differently colored friend arrows; investigation of Mac A/S/D movement failing while W works despite default bindings.

Implement three-second hold T, Y cycles eligible teammates. Same live scene only, no PvP, ship crossing, airborne target or downed target. Validate supported, unobstructed landing near the selected player. Damage, movement, key release, lost focus, menus, disconnect and scene changes cancel; cancellation requires a fresh press. Violet rising-ring charge and departure/arrival pulse, shared with teammates. No invulnerability or cross-level progress skips.

Replace pickup-only guidance with explicit current-main-story targets across the sixteen halves. Gold main objective, cyan party marker; settings toggles, no automatic secret locations or puzzle answers. These are directional markers, not a generated walkable route. Keyboard investigation found code-only dispatch and no fallback for absent code; add canonical key fallback, per-held-key release tracking and focus cleanup without overwriting custom bindings. Do not claim the exact Mac hardware issue reproduced without that evidence.

Validation: real-browser input, channel completion/cancellation, safe arrival, multiplayer presentation, quest-state target changes, settings and old-save compatibility; publish main with version bump. No other backlog changes in this batch.


## [Codex | 2026-09-25] 2.037 validation
Three-second hold T teleports beside selected same-scene teammate; Y cycles. Hits, motion, release, lost target, menus and focus loss cancel, and hit cancellation requires release before retry. No safe floor / airborne target rejects arrival. Rising violet rings and cast pose replicate; completion serial snaps remote models. Gold main-task arrows across sixteen halves, cyan party arrows including downed friends; independently saved settings. Explicit quest targets follow progression and collected-item turn-ins, leaving optional secrets hidden.
Browser checks:43 channel/input/presence/initial-target assertions;61 later-state destinations and turn-ins;settings persist after reload;previous-save checkpoint/clue/rank/gold/pet/intro/voice-off regression passes;128-skill/28-weapon/15-projectile co-op relay regression passes. Reviewed local charge and objective-marker screenshot; inset edge markers away from right-side controls. Syntax checks pass. Keyboard fallback tested with absent/Unidentified code and uppercase keys; exact remote Mac failure not reproduced; Mac browser clarification pending. WebKit executable unavailable locally. No claim of native Mac or internet-latency verification.
