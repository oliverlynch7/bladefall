# Marble Colossus — Sunspire guardian

This is the second distinct boss model in the enemy-roster upgrade. It uses the
existing Marble Colossus skeleton and combat. Its split stone chest, exposed
joints, engraved sun, open hands and damaged crown identify it as a former
Sunspire guardian rather than a recolored Forge Colossus.

Run `blender --background --factory-startup --python build.py` from this folder
or pass this script's path from the repository root. `build.py` imports the old
articulated rig, generates and rigidly weights new geometry, exports
`marble-colossus-rigged.glb`, saves an editable `.blend`, and renders front,
side and back PNGs. The production copy is
`public/3d/enemy-assets/articulated/marblecolossus-v2126.glb`; the original
`marblecolossus.glb` is retained for comparison/fallback.

Current budget: 10,984 triangles, eight skinned meshes/materials, 14 bones,
968 KB GLB. The six core clips loaded with finite transforms at three sampled
phases in a real browser. The synthetic Palace Courtyard visual check confirmed
the renderer selects this model. Human assessment of silhouette, attack reads
and mobile frame rate in the authored boss encounter is still needed before
using this boss as the quality target for the rest of the roster.
