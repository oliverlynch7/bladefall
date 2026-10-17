# Bag and class-choice protection — 2026-10-17

v2.257.0-upgrade-protection. Rank-up celebration, skill/passive choice/review, first-skill tutorial, dash lesson and legacy upgrade entry use the same world-scoped pause session as Esc and bag. Upgrade mode joins protected pause and live co-op background simulation. Existing PvP exception remains the same as Esc.

Actual browser with isolated pre-change level100 save: 21 checks pass, zero browser errors. Covers direct bag and Tab open/close, damage and fall calls, solo freeze, co-op live world/held player/Paused peer presence, actual 2800ms rank transition, skill and passive confirmation, first-skill lesson, persisted selected options and vulnerability on resume. Screenshot shows actual passive UI with active protection status.

Focused suites: 42 pause checks, 62 celebration checks plus11 staged transition checks, 2873 class progression checks. Full regression result recorded separately. Co-op presence/ownership policy is verified locally; no new Internet signaling behavior or transport change.
