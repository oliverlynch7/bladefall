# Secondary portal graphics — implementation plan

Oliver authorized continuing the remaining graphics and level-design sequence after the enemy screenshots. Complete secondary graphics first, then redesign the campaign layouts.

Inspection: Descent and Gauntlet each build a 940-unit square arena with four existing walls, six torches and twenty decorative stones. Descent rotates stage themes but keeps a special zone index, so the campaign art selector cannot reliably identify it. Endless Dungeon explicitly excludes itself from the campaign art modules. Arena maps include a lava floor, and Treasure Sprint contains moving platforms: those surfaces must retain their hazard/motion presentation.

Add explicit read-only mode metadata to the renderer bridge. Build Descent and Gauntlet scenery using the original instanced Blender architecture with distinct palettes, perimeter structures and distant crowns. Keep all new structure outside playable bounds or above existing walls. Give Arena and Sprint matching architecture without covering lava, gaps or moving platforms. Adapt the saved Dungeon pass rather than merging its obsolete version/import changes. Rebuild on mode, floor and theme changes.

Validate unchanged collision geometry, all theme rotations, mode transitions, hazard visibility, interactables, existing saves and high/low quality in real WebGL. Provide Blender overview images in the phone gallery and deploy to autopilot-merged. Only then begin the separate campaign topology redesign.

## Validation and release

Implemented all five portal-mode scenery passes, including the Arena's flat, parkour and lava maps and the full Dungeon biome rotation. Existing authored kits are shared, adding no new scenery-model downloads. Distinct floor mosaics, masonry courses, perimeter columns, suspended crowns and theme accents preserve open combat space. Sprint retains its moving, collapsing and phasing surfaces; lava receives no stone cap.

34 seeded before/after fixtures match exactly for collision geometry, spawn/goal points, hazards and scaling. Real Chrome/WebGL checked ten Descent floors, ten Dungeon floors, all seven Gauntlet rounds, all three Arena maps, Sprint phasing stability and high/low quality. Unit checks confirm read-only inputs, phase exclusion and lava exclusion. A 1.966 save loaded into 1.967 with its gold, weapon and stage intact. Blender overviews are in the existing phone gallery. Evidence is in docs/art-validation/secondary-*.json.

Campaign layout redesign follows this graphics release; secondary-mode collision layouts were intentionally preserved.
