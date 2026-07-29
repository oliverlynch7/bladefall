# Bladefall 3D — Asset Library

Every pack is **CC0** (public domain): free for commercial use, no attribution required, modification allowed.

Raw downloads stay in `Downloads/`; this folder is the extracted, organised, web-ready library.
`_assetlab/` is gitignored — only assets copied into `public/slice3d/assets/` ship.

## Contents

| Folder | Pack | glTF | GLB | MB | Purpose |
|---|---|---:|---:|---:|---|
| `characters/base` | Universal Base Characters | 2 | 0 | 33 | PRIMARY hero rig |
| `characters/outfits` | Modular Character Outfits - Fantasy | 24 | 0 | 83 | Class outfits |
| `characters/hair` | UBC Hairstyles | 8 | 0 | 12 | Character customisation |
| `characters/rpg` | RPG Character Pack | 6 | 0 | 17 | Secondary / NPCs |
| `animations` | Universal Animation Library 1+2 | 0 | 2 | 15 | PRIMARY animation source |
| `monsters` | Ultimate Monsters | 0 | 24 | 6 | Mobs + bosses |
| `weapons/medieval` | Medieval Weapons Pack | 0 | 24 | 2 | Weapon archetypes |
| `weapons/rpg-items` | Ultimate RPG Items | 0 | 106 | 8 | Loot + weapons |
| `props/fantasy-mega` | Fantasy Props MegaKit | 94 | 0 | 42 | Dungeon dressing |
| `environment/dungeon` | Modular Dungeon Kit | 0 | 39 | 7 | Dungeon zones |
| `environment/graveyard` | Graveyard Kit | 0 | 91 | 3 | Crypt/abyss zones |
| `environment/ruins` | Ultimate Modular Ruins | 0 | 92 | 14 | Ruined Keep, Castle |
| `environment/nature-kenney` | Nature Kit | 0 | 329 | 3 | Outskirts, Thornwood |
| `environment/nature-mega` | Stylized Nature MegaKit | 68 | 0 | 47 | Thornwood, Sunken Wash |
| `environment/nature-q` | Ultimate Nature Pack | 0 | 150 | 19 | Outdoor zones |
| | **TOTAL** | **202** | **857** | **313** | |

## Format notes

- Packs shipped **OBJ-only** were batch-converted to GLB into a `glb/` subfolder
  (`weapons/medieval`, `weapons/rpg-items`, `environment/ruins`, `environment/nature-q`).
  Converter: `python -m trimesh` load + export, 372/372 succeeded. Re-run any time; it skips existing files.
- Some Quaternius glTF reference **external `.bin` + textures** — keep files together when copying.
- **Import trimming is mandatory:** drop `*_Normal`, `*_Roughness`, `*_ORM` and duplicate `*_png.png` maps
  (the Lambert pipeline never samples them) and downscale base colour to 1024.
  Precedent: Fantasy Props 37MB->2.8MB, Base Characters 49MB->20MB, Outfits 84MB->7.5MB.

## Also downloaded (audio, not yet wired)

- `Essential Game Design and Animation Sound Package` - 425 WAV
- `Walking, Running, and Various FootSteps` - 50 sounds
- `Tones & Notes - Short, Instrumental` - 75 tracks

## Known gaps

- **Heavy armour outfits** (Warrior/Paladin) - Standard tier ships Peasant + Ranger only.
  Mitigation: procedural geometry attachment (pauldrons/capes/helms) already proven.
- **Portals** - no pack. Building procedurally from the VFX toolkit instead.
- **Ice / lava / marble / void biomes** - no dedicated packs; covered by procedural surface reskinning.