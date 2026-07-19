# Ian's Blade and Castle Win Fix Verification — 2026-07-19

## [Codex | 2026-07-19]

Implemented `docs/IANS_BLADE_AND_WIN_FIX.md` in `VERSION3D 1.183.0`.

- `winGame()` now authoritatively and idempotently marks Castle Duskmoor cleared and opens every campaign gate.
- The first qualifying victory queues the hub announcement: **“Ian's Blade now waits in the Shop.”**
- Ian's Blade is a legendary, non-dropping, shop-only sword unlocked by `meta.zoneDone.castle`.
- Price is exactly **1,000,000 gold**.
- The weapon is build-agnostic and receives no off-class penalty on Warrior, Ranger, Mage, or Reaper.
- Its 114 legendary damage, 0.38-second cadence, radiant presentation, and 15%-health non-boss execute make it the strongest capstone weapon.
- Existing weapon normalization restores the new special flags safely when saves reload.

## Browser QA

- Before Castle clear: shop row absent.
- After Castle clear: shop row visible at 1,000,000g.
- At 999,999g: purchase refused with no deduction or equipment change.
- At 1,000,100g and a valid endgame level: purchase leaves exactly 100g and equips Ian's Blade.
- All four classes: `classFamilyOk=true`, `offclassMul=1`.
- Execute test: a non-boss target at 20/100 HP was killed by a nominal 10-damage hit and emitted the radiant effect.
- Direct final-win test: `zoneDone.castle=true`, `zoneMax=7`, difficulty completion set, announcement queued and consumed in the Waystation.
- Ian's Blade excluded from organic drop archetypes.
- Browser console: 0 errors, 0 warnings.
- JavaScript syntax and `git diff --check`: passed.

`UPDATE_ROADMAP.md` still contains invalid UTF-8 bytes, so this append-only verification note records the shipment without rewriting that historical file.
