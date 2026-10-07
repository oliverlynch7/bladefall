# Sparring Room bestiary

## [Codex | 2026-10-07] Grounded implementation plan

The current training menu offers one static entry at a time. `BESTIARY_INFO` supplies short tells and lore, while `ENEMY` supplies base stats, and `ZONES`/`STAGES`/`THEMEMOBS` define campaign encounters. Its portrait is one shared CSS face. The existing enemy render sheet already has portraits of the model roster; the release will crop actual model screenshots to head-centered cards and create the missing special-encounter portraits from game renders. Prison Break uses its own seven-foe `BFPrisonCombat.roster` and must not be mistaken for Abyssal Descent.

1. Place a distinct bestiary stand beside the Sparring Room at the Waystation and a matching stand inside the hall. Keep the training desk separate.
2. Make a searchable, filterable catalog with a portrait row, selected foe details, encounter locations, base HP/damage/speed/XP, attack type/element, tell and short lore. Say plainly that stats scale with difficulty, level and co-op. The requested complete catalog is browsable immediately; discovery gating was not requested.
3. Derive campaign locations from the actual stage/theme/zone tables; use explicit sources for special encounters and Prison Break. Avoid invented weaknesses or drop rates.
4. Generate and check each portrait crop from an actual model/game screenshot. Keep images small, lazy-load lists and preserve alt text.
5. Verify catalog completeness, every asset request, responsive browsing, selection/search/filter/back navigation, Sparring Room interaction, prior-save loading and no disruption to practice bouts in a real browser. Automated checks cannot prove subjective portrait/art quality.

## [Codex | 2026-10-07] Implementation and QA

Version 2.136.0 adds a lectern by the Waystation's Sparring Room and inside the hall. The catalog lists 52 roster and special-encounter entries with face/upper-body captures from their actual game models, including seven Prison Break foes. It derives ordinary encounter areas from the campaign's stage/theme tables and marks base combat stats as scaled values. The old practice-bout menu still opens separately and its full-entry button now shows the same portrait and detail.

Real-browser checks: hub and hall access, 52-row catalog, search/filter/selection/back, all 53 visible portrait requests, desktop and phone layout, and no page errors. A save written by the pre-change build loaded with the same name, gold and zone progress. Portrait composition and encounter balance still benefit from human review.
