# Forge Brute — Sol-medium Blender quality test

2026-10-06. Visual prototype based on Oliver's Hollow Legion Forge Brute / Ashen Executor references. Its rigged version is now used for the Ember Colossus boss; the original static GLB remains an isolated art test.

- `build.py`: reproducible Blender 4.5 source.
- `sol-forge-brute.blend`: editable model and studio.
- `sol-forge-brute.glb`: game-oriented static export.
- `front.png`, `back.png`, `detail.png`: actual Blender Cycles renders.
- `preview.html`: browser GLB viewer; drag to rotate.
- `metrics.json`: mesh budget.

The authored silhouette uses a furnace-cage head, stepped pauldrons, articulated gauntlets and boots, an asymmetrical chest chain, layered plates, charred cloth, a rear vent and a grounded hammer. Repeated rivets and links are consolidated by material during export. Eight meshes, eight materials and 23,076 triangles; GLB is about 1.49 MB. No external texture assets.

`rig-colossus.py` rigid-weights each disconnected armor plate and hammer component to the existing 14-bone Colossus skeleton. It exports `forge-colossus-rigged.glb` and an editable `.blend`; `preview.html?rigged=1` shows the game's revised animation clips. Production uses `public/3d/enemy-assets/articulated/forge-colossus-v2125.glb` only for the Ember Colossus. The Marble Colossus keeps its own model. The boss retains its existing collider, health, attacks, and rewards.

Visual assessment: silhouette and head identity read better than the earlier Holy Guardian test. The result remains geometric compared with the supplied painterly concept; hands, cloth tailoring, worn metal variation, and surface texture still need specialist art/UV work to get closer. This boss is an art-direction benchmark, not a generic template to recolor across the roster. Other enemies need distinct silhouettes and geometry suited to their story, size, movement and attack role. Crowd performance and human playtesting remain open.
