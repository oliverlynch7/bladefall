# Forge Brute — Sol-medium Blender quality test

2026-10-06. Isolated visual prototype based on Oliver's Hollow Legion Forge Brute / Ashen Executor references. It does **not** replace any production model.

- `build.py`: reproducible Blender 4.5 source.
- `sol-forge-brute.blend`: editable model and studio.
- `sol-forge-brute.glb`: game-oriented static export.
- `front.png`, `back.png`, `detail.png`: actual Blender Cycles renders.
- `preview.html`: browser GLB viewer; drag to rotate.
- `metrics.json`: mesh budget.

The authored silhouette uses a furnace-cage head, stepped pauldrons, articulated gauntlets and boots, an asymmetrical chest chain, layered plates, charred cloth, a rear vent and a grounded hammer. Repeated rivets and links are consolidated by material during export. Eight meshes, eight materials and 23,076 triangles; GLB is about 1.49 MB. No external texture assets.

Visual assessment: silhouette and head identity read better than the earlier Holy Guardian test. The result still looks geometric and clean compared with the supplied painterly concept; hands, cloth tailoring, worn metal variation and surface texture need specialist art/UV work to get substantially closer. This is a static test with no skeleton, animation, deformation or crowd profiling, so triangle count and one browser load do not establish production readiness.
