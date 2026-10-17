

## [Codex | 2026-10-17] v2.248 ready quest hand-in priority

Explicitly marked28 authored hand-in/progression choices across11 campaign/hub-return books. When requirements match and effects add actual progress, shared story view offers only those choices, no repeated reminder/lore/topic detours. Hidden stale choices and topic requests rejected by transaction validation. Real reward/outcome choices preserved (Flint reward types, Roland return/keep); duplicate Rose flavor turn-in consolidated to primary ready response. Ordinary incomplete/refusal/apology routes remain available before requirements complete. New open resolves saved reminders to a reachable ready node through navigation that changes no flags/items/quests/rewards; never auto-consumes or grants rewards.

Ready Waystation return requests go directly from keeper interaction to delivery dialogue, skipping services/questions until turn-in. Ready choice receives yellow quest badge and existing keyboard selector. Closing remains allowed. No story prose, quest conditions, rewards, stable IDs or co-op ownership protocol changed. Current-story and state/UI cache keys advanced.

111 offline suites pass. New154checks cover28 hand-ins, ready-only filtering, missing items, stale requests, atomic/once-only effects and old saved reminder redirects. Castle/Rose tests now exercise refusal/apology before all requirements, explicitly test suppressed stale ready responses while retaining meaningful outcome/reward tests. Actual browser disposable level100 save verifies Mara incomplete/ready/delivery/receipt and Smith ready request skipping services;9checks pass, screenshot reviewed. No production saves modified or physical two-device claim.
