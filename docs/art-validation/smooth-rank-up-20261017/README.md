

## [Codex | 2026-10-17] Nonblocking rank-up - v2.264.0

Removed the2800ms frozen announcement plus300ms fade. A compact rank/reward banner now plays for900ms while movement, attacks, HUD and controller input remain live. It allows a bounded800ms landing window, then opens the existing mandatory protected skill/passive choice immediately. Choice header explicitly states earned rank and reward type. Chained rewards do not repeat the wait. Player level-up presentation and distinct SFX remain.

Pause/menu/loading/hidden-tab activity suspends the prelude; world/player/class/death and pending-rank guards prevent stale modals, with interrupted rewards requeued. Input clearing, solo freeze, co-op grey presence/invulnerability still begin at the actual choice through beginPause. No choose-later or skip path was added. Retains reduced-motion and one rank sound per XP transaction.

Verified:125/125 regression suites.24 actual-browser old-save checks cover movement and attacks during banner, real controller polling, usable HUD, rank context, forced selection/confirmation, manual pause/resume, co-op world/presence/damage protection and chained rewards. Progression tests cover short clock, hidden/menu suspension, stale/dead/downed/class transitions, bounded landing wait and distinct player/class notifications. No browser errors. Evidence: docs/art-validation/smooth-rank-up-20261017/.
