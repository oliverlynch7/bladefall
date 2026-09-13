# Campaign layout redesign

## [Codex | 2026-09-13]

Secondary scenery is live at preview version 1.967. Oliver authorized the next phase: replace the main level layouts while retaining the recent iconographic scenery and enemy art.

Code inspection found sixteen exploration areas dispatched through EXPANDED_SCAPES, eight separate boss arenas, and seven side entrances that lead to class trials. Several exploration generators return through terrain builders, then receive additional topology, verticality, encounter and scatter passes. This makes the final route difficult to author coherently. The replacement campaign branch will own its complete geometry and encounter placement, without those additive passes. Trials, the hub and secondary modes remain on their existing generators.

Each exploration area will have an explicit graph of named districts, broad fight spaces, quieter connecting routes, at least one alternative route, reward overlooks and a visible final landmark. Height changes use overlapping stairs with conservative rises; critical traversal never depends on a class ability. Optional challenge crossings must have a stable alternative. Required quest IDs, rewards, inventory and progression remain unchanged. Existing optional mission IDs survive with updated location hints. Kill objectives retain replenishing dens, and every placed objective is checked against actual collision surfaces.

World identities: Outskirts circles a central mill; Black Woods loops around a moonwell. Hollow separates a protected wash from exposed shelves; Dry Wash returns through a shrine circuit. Keep links breach, prison and ramparts around a court; Undercroft folds cell galleries around its escape shaft. Frostfell traverses sheltered ice chambers; Rime Shelf alternates broad terraces and bridges. Emberdeep follows furnace islands with a maintenance bypass; Cinder Vents uses offset vent courts. Abyss routes form broken rings with stable inner paths. Palace uses formal courts and twin balconies; Gardens climb offset terraces. Duskmoor crosses successive gate courts, then makes a non-overlapping rising circuit around the throne approach.

Validate every main area for spawn-to-goal and quest access, finite geometry, base jump margins, enemy support, actual browser rendering, mode transitions, and a pre-change save. Render phone-accessible Blender overviews. Boss arenas receive a separate layout pass after the exploration routes, retaining their combat mechanics. Do not describe the layout phase as complete until that work is validated.

## Validation and preview release

Version 1.968.0-campaign-routes implements all sixteen exploration areas and eight boss layouts. The first complete layout pass uses 284 directed connections; the real movement update traversed all of them in both directions without a jump, fall or stuck state. Collision-surface reach checks cover 130 placed targets, including bosses' exits. Every area loaded in Chrome/WebGL and was checked at high and low scenery quality. All eight bosses entered phase two in the browser. Ten trial geometry/enemy fixtures and 34 secondary-mode geometry fixtures are unchanged.

A 1.967 palace save exposed the old stage-only resume bug. New campaign autosaves preserve world, sub-area and quest progress; Continue rebuilds the correct map at its entry and reopens already-earned exits. Legacy saves infer their world from the stage. Where both areas shared a stage, the old format cannot identify which area it was: it resumes the first matching area. Gear and gold are preserved. Tests include old palace gear/gold, a partial Black Woods quest, completed Hanging Gardens and a boss resume.

All 24 Blender overviews and the exploration route maps are in /3d/art-previews/layouts/. They are static scenery previews, with cave roofs removed for inspection and approximate offline lighting. The older world gallery is labeled as earlier layout art studies. Images are loaded only in the preview gallery, not by gameplay; the existing scenery GLBs are reused.

These checks establish render and traversal correctness, not a full human balance review. This is the complete first layout pass for Oliver's preview playtest; combat pacing and route feel should be judged in the playable build.
