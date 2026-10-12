# Chest reference redesign

## Grounded scope

The shared production model is `public/3d/chest-art.js`, called by `prop3d.js` in every mode. It currently tints the wooden shell by rarity, makes each small fitting a separate draw call, and has sparse ornament. Its rear lid pivot and `animateChest` contract already support persistent opened state and mimic breathing. The loot/reveal modules are independent.

Use the user's five-chest reference as the direction for actual game models. Keep the current base footprint and rarity scale progression, brown wood at every tier, and a real hollow interior. Rebuild as merged material groups with a separate lid; no hundreds-of-mesh cost per chest. Preserve existing third-person depth/occlusion rules.

## Five designs

1. Common: weathered oak planks, barrel lid, iron rails/straps, hammered rivets, corner shoes and a physical keyhole.
2. Uncommon: walnut, green patinated bronze fittings, leaf-shaped inlays/curving vine detail, emerald lock, ring handles.
3. Rare: walnut with contrasting silver ribs and dark blue inset trim, sapphire diamond clasp, angular corner shields and smaller gems.
4. Epic: dark wood, silver/violet Gothic ribs, hanging purple cloth, engraved rune-like geometric marks, crowned center setting and crystal-tipped finials.
5. Legendary: warm dark timber, layered golden rails, burgundy cloth, sculpted lion-like corner bosses, sunburst clasp, swept gold crown fins and amber crystal finials.

Use actual layered geometry, restrained emissive facets and distinct silhouettes. Timber grain/plank seams remain visible. Ornament follows construction: straps wrap around lids, feet carry the frame, cloth hangs from rails. Everything attached to the lid moves with the rear hinge. Keep ornament clear of the opening seam and interior. Preserve closed-model placement, stable outcome/save identifiers, one-item reveals and E skip. No new sound effects or economy changes.

## Failure checks

- Inspect all five at close and gameplay distance, from front/side/back and fully open; avoid isolated ornaments, intersecting lids, missing end caps, coplanar shimmer and overexposed gems.
- Match material and size progression without recoloring the entire body. Plain oak must still read as a chest, while legendary reads clearly at small size.
- Cache geometry/materials across clones; merge per material/body/lid. Check finite normals/bounds and a practical triangle/draw-call budget, plus multiple chest instances.
- Check opening and mimic movement, saved-open spawn, fallback render, one-item grant/duplicate protection, co-op personal rewards, old save and reveal on desktop/phone.
- Version/cache bump the dependency chain, run muted real-browser verification, then publish to main and confirm production.

## Evidence

Implemented in v2.184.0. Preserved reference: [user image](references/chest-rarity-reference.jpg). Rendered [lineup](../art-validation/chest-craft-lineup-2026-10-12.png) and [game camera](../art-validation/chest-craft-game-2026-10-12.png).

All five cached models use 7,216-11,763 triangles and 8-13 material meshes. Closed/open, side/back, phone and three game cameras were rendered and inspected. Geometry/bounds/grounding, resource sharing, opening/mimic/loaded-open behavior, three campaign lighting samples, low quality and fallback passed. The existing 200,000-sample probability checks, one-item grant/overflow/duplicate/reload, local co-op personal claims/reconnect, Prison Break checkpoint and a pre-change campaign save passed. Phone reveal stays within the viewport and supports reduced motion and E dismissal. Full machine-readable evidence: [validation](../art-validation/chest-craft-2026-10-12.json).

The workshop is reachable from Title > Dev previews > Chest models, or `/prototypes/chest-craft/preview.html`. It uses the actual shared production module. No loot or placement changes. Existing unrelated companion/art-validation work was preserved; prop3d had only an unchanged-content line-ending status at baseline, and its only semantic edit here is the chest module version.

Automated checks and rendered inspection do not establish the user's aesthetic approval, real-network co-op behavior, or performance on a low-end device. Those remain human/device checks.
