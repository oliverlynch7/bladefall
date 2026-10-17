

## [Codex | 2026-10-17] v2.247 weapon identity and companion levels

Equipped weapon now always visible inline under class/gold, rarity color retained, full-name tooltip and wrapping; hidden-details toggle removed from view. HUD ResizeObserver measures identity/companion stack so quest tracker follows without overlap, including wrapping labels. Companion HUD uses separate non-wrapping Lv badge, custom name ellipsis/full tooltip, projected nameplates and co-op name packets include level.

Existing5 paid training increments now displayLv1..6 with no new save field/XP or pricing/power rebalance. Legacy trained ranks map immediately; malformed/out-of-range rank sanitized. Beastkeeper shows current/max level, five upgrade pips, next-level cost and Max state. Training validates owned pet at hub, updates live maxHP while preserving missingHP, refreshes HUD and saves.

Disposable pre-change level100 browser:13checks pass (weapon visibility/change, companionLv1, paidLv2/cost/HP, trained reload, Lv6/cap, identity/pet/quest stacking). Screenshot inspected; no production save changes.110 offline suites pass, including new companion tests for all5 purchases/exact costs/cap/legacy ranks/guards; two minimal DOM stubs extended for after/resize geometry, previous assertions unchanged. Physical mobile/two-device co-op not claimed.
