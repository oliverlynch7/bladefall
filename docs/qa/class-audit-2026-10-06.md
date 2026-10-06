# Class audit verification


## [Codex | 2026-10-06] 2.118.0-class-audit
Fixed Dev Preview button contrast: ordinary accent link CSS now excludes button links. Verified all eight actions, desktop/phone screenshots and hover.
Class audit fixes: PvP melee includes weapon life steal; Warlock basic health cost refunds only after confirmed positive PvP damage; guest healing and Harvest use host-confirmed damage receipts, capped to actual HP lost, with duplicate/stale-player/world protection; dead/downed class regeneration and kill hooks are guarded. Swift Steel retains +10% attack speed and +25% fourth basic-hit damage, removing the additional free fourth attack. Clarified Ambusher, Death's Favor and Chronomancer Echo descriptions without changing saved IDs.
QA: catalog covers 17 classes, 136 skills and 136 passives (source-reader coverage only). Baseline 136-skill browser smoke passed; 45 behavioral regressions passed after changes; 18 new focused checks and five two-page handler/transport checks passed. Previous 2.117 save retained all 17 class choices, name and gold. Inline syntax and diff checks passed.
Remaining audit work: guest early-return in hitEnemy bypasses several attacker-owned class hooks; status-damage authority also needs a dedicated co-op pass. Do not claim all class combinations or balance verified. Existing life-steal attenuation policy remains unchanged. Real internet latency and human balance testing remain outstanding. No campaign layout changes.
