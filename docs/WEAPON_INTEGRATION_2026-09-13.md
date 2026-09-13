# Weapon integration repair

Preserve existing character meshes, clips, weapon meshes, and authored fit values.

Confirmed defects: runtime archetype filtering substitutes the class default for equipped off-class weapons; saved fits load before the final mesh is selected and are skipped on swaps; saved bf_weapframe measurements are ignored; transient local holders lose live adjustment state; class equips bypass the queue and diagnostics report the default rather than actual mesh.

Implementation: resolve the actual equipped mesh first, resolve an independent fit snapshot for that body and mesh, apply saved frames through the same transform path as live tuning, retain a holder per local rig, queue class/debug swaps and update actual-weapon diagnostics. Explicit fists clear the held mesh. Preserve unsupported-art fallback and existing rarity mapping. Do not guess replacements for old mesh names or overwrite browser tuning.

Validation: real Chrome/WebGL, cross-class weapons, repeated swaps, multiple rarity meshes, bare fists, per-body saved fit fixtures including locked frames and reload, pre-change save resume. Inspect visible weapon placement and errors before publishing.

## Validation

Real Chrome/WebGL: 42 equip checks (seven weapons/rarities including fists across Warrior, Rogue, Ranger, Cleric, Wizard, Monk bodies); pre-change saved Scythe resumed with campaign identity unchanged. Saved-fit fixtures cover Body|Weapon and legacy Body objects, per-body overrides, locked file/stock frames, switching away/back, live nudge parity, and full slice export import. Fixtures restored after testing. Existing multiplayer render probe reported no render errors; both independent peer rigs finished arming.

No asset geometry or animation clips changed. Unsupported weapon art with no mapped asset retains the class fallback. Existing named rarity mapping is unchanged. Browser-local fits on other origins/devices require the original slice export; this change does not claim to recover unavailable data or assign one mesh's fit to a different mesh.

Release: 1.969.0-weapon-fits. Hero module cache key updated so existing browsers receive the fix.
