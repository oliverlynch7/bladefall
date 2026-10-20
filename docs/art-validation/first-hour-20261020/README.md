# First-hour readiness — 2.340.0

This is a bounded defect-repair pass. The full first-hour campaign review remains in progress.

## Repairs

- First-time Warrior/Ranger/Mage practice now saves its seed, defeated stable enemy IDs, kill count, hero growth and current lesson. Continue resumes it directly. Earned and party trials keep their existing rules. Completion or explicit skip clears this optional record.
- Fixed the actual reload defect where earned tutorial gold triggered legacy class-unlock migration and silently bypassed unfinished practice. A character with zero kills and zero gold now counts as an occupied save slot.
- Boss-bar status reads the same phase floors and opening budget as damage. Marksman relocation and King's guard threshold no longer invite hits that cannot deal damage. The compact badge shows guarded/open/ended/changing state and remaining opening time. Frost Officer status follows the officer being aimed toward; another officer's danger warning remains visible.
- HUD portrait follows the equipped class. Tutorial Retry clears stale floating damage text while retaining progression. Interactive controls no longer request camera pointer lock.

No enemy damage, opening durations, tutorial difficulty, campaign layout, dialogue, voice recordings or network/save identifiers were replaced. No performance optimization is claimed in this release.

## Verification and its limits

- `regressions.json`: 43 focused suites. Includes first-hour callbacks, 37 starter persistence/validation/migration checks and 102 boss cue/damage/timer checks.
- Normal UI/input fresh Mage creation, controls, death/retry, three kills, mandatory rank-2 choice and a mana-spending learned skill were exercised. `mage-practice-before.json`, `mage-third-kill-skill.json` and `tutorial-retry.png` record this work.
- `starter-after-real-reload.json`, `warrior-zero-kill-reload.json`, `ranger-three-kill-reload.json`, `mage-six-kill-reload.json` and `unfinished-direct-continue.json` use actual reloads on a disposable separate local origin. Kill counts beyond the initial Mage run were staged through real damage/reward handlers. Existing earned XP/gold/choice and defeated IDs survive; filtering defeated IDs does not issue kill rewards.
- `tutorial-exit-completed.json`, `completed-tutorial-hub.json`, `completed-tutorial-real-reload.json`: stage the player at the earned exit, then use the real portal/completion and story/hub paths. Marker clears, hub resources fill, completed save reloads in hub. This is not a natural unassisted traversal.
- Three `*-real-attack-exchanges.json` fixtures use the real starter weapon, actual stats, attacks and a learned mana-spending skill against six tutorial foes. Positions and presentation clock are controlled. They establish functionality, not tutorial pacing or fun.
- `legacy-and-completed-starters.json`: all three completed starters and a pre-change level-100, 1,145-gold save load. `reward-save-integration.json`: actual host/fallback guest kill handlers, duplicate protection, party health, bag protection and earned reward reload. These are controlled local handlers, not a two-human Internet co-op playtest.
- `boss-opening-browser.json`: actual generated actors from all eight boss rooms (12 actors including officers/Hydra joints), staged counters, damage budgets, phase thresholds and UI. Not eight naturally played boss fights.
- `story-final-slide.png`: final story action is Enter the Waystation; Skip is hidden. No story rewrite was required.

## Performance evidence

`route-diagnostics.json` records 900 native animation-frame samples after the current world warm-up curtain completed, with the document visible. Shoulder camera/high quality, movement and dashes, five points: Briar entry, Orchard, Black Woods, Keep courtyard and Keep water. Per-point p95 frame intervals were 18.5–23.4 ms, maximum 34.2 ms in this short final sample. Shader-program counts did not grow during each sample. CPU phase/Three render timings are included; they are not GPU timings.

Keep these earlier observations rather than hiding them:

- `initial-profile-loading-overlap.json` includes loading/build/compile work and is rejected as an in-game frame-rate benchmark. The fixture now awaits the current warm-up identity and ready state.
- `loaded-route-before.json` includes a 993 ms isolated Orchard frame gap without a matching measured CPU-phase stall. It was not reproduced in the final fully instrumented sample. Its source is unresolved; short stable samples do not prove this hitch fixed or establish low-end performance.
- `ranger-placement-rejected.json` used a target across obstructing geometry. The later fixture requires the actual aim/line-of-sight test and realistic height bounds. This failed harness run is not evidence of a game regression.
- `boss-opening-layout-before.png` was captured before the test fixture activated the boss bar. Use `boss-opening-final.png` for final layout evidence.

## Reproduction

Run `python scripts/build-first-hour-qa.py` and `python scripts/build-boss-opening-qa.py`. Serve `public/` locally. Generated `.qa-*` pages are local-only and must never ship. The profile and boss fixtures use memory-backed storage; the resume fixture uses disposable browser storage and should use its own origin/port (4374 in this review). Never run its Stage button on production.

Next work: an uninterrupted fresh Briar → Black Woods → Brute → hub run, natural gear/XP pacing and a longer Orchard/water performance trace. Preserve the existing colorful effects, voiced text and beginner trial tuning.
