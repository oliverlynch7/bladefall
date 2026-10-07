# Enemy roster visual release plan

The production roster has 41 base appearance IDs, two Frost officer variants, and a separately drawn Hydra. Ember and Marble Colossus already have new dedicated Blender models. The other 39 base GLBs were mostly 172–1,008 triangles and many humanoids shared toy-like proportions. Their current combat code, hitboxes, identifiers, saves, and animation clips remain authoritative.

1. Rebuild the remaining appearances on their existing skeletons. Change the large shapes before surface ornament: longer Legion bodies, broad heavy armor, different caster/head profiles, longer four-legged creatures, and distinct floating/object forms. Give each type an attack-readable weapon or body part. Retain the original GLBs as fallbacks.
2. Author materials and model geometry by enemy family, then type-specific pieces. Keep ordinary units near a few thousand triangles and reserve more for bosses. Export versioned GLBs and keep the Blender builder as reproducible source. Do not copy the Forge or Marble silhouettes onto unrelated enemies.
3. Give the two officer forms their own armor/weapon read and improve the Hydra's existing three-head mesh without changing its merciful chain mechanics.
4. Render a full roster contact sheet and normal-game-camera captures. Reject obvious identical silhouettes, floating parts, invisible faces, clipping weapons, unreadable attacks, or disproportionate geometry. Check all clips and browser load, several-enemy memory/frame behavior, prior-save loading, and campaign progression. Bump the game version and document measured limits before shipping.

This work is visual only. Automated render and animation checks cannot certify every pose, device, or human judgement of the art direction.

## [Codex | 2026-10-07] Implemented visual pass

- Replaced all 39 remaining base appearances and the two Frost officer variants with versioned Blender-built, rigged GLBs. The existing bespoke Forge and Marble Colossi remain assigned. The separate three-headed Hydra gained plated jaws, horns, teeth, fins, flank plating and sixty instanced neck scales; its chain-release encounter logic is unchanged.
- Family silhouettes now split into armored soldiers, exposed-bone undead, lean elemental creatures, four-legged beasts, flying/void forms, and small object or summon types. Bosses and elites add individual weapons, headpieces, mantles, shields and readable elemental accents. Original assets remain on disk for rollback.
- A render review caught a Blender evaluation defect that exported the last primitive at default size and could hide a creature beneath a giant part. The builder now refreshes evaluated transforms before mesh batching and export; every final GLB was regenerated. Palette values were also darkened to avoid pale plastic under game lighting.
- **Measured:** 41 new appearances, 17.0 MB total, maximum 5,716 triangles per appearance, six existing clips per model, 10–16 bones. They load on demand; none of the 41 is preloaded solely for this change.
- **Verified:** complete static GLB manifest, all 41 imported and animated in Chrome with finite bone matrices, normal-camera screenshots for Legion/beast, boss/elite and elemental groups, Hydra's seven representative states, prior-version 17-class save, and JavaScript syntax. The browser reported no missing models or page errors in these checks. The images at `output/enemy-roster-upgrade/` were used for art QA; the contact sheet is saved in `docs/art-validation/enemy-roster-v2128.jpg` for review.

This is a full roster **first art pass**, not a claim that procedural modeling matches hand-authored concept illustration or that every encounter has been human-playtested. The style is still faceted and some armored enemies share a family construction. Oliver's in-game art judgement, animation comfort, and performance on low-end browsers remain the next review gates; those are not established by automated checks.
