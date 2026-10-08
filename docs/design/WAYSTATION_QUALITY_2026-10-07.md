# Waystation quality pass — 2026-10-07

Oliver asks for a broad improvement to the current hub. Preserve its established services, eight campaign gates, separate Rift Hall, chess table, purchased upgrades, hub tour, save fields, and interaction coordinates. This is an authored pass over the current Lantern Court, not another layout replacement.

## Grounded baseline

Real-browser views from the arrival, market, Warden, and challenge lanes show a strong central Waystone but an extremely large, nearly uniform tiled floor. Stations are readable up close but too small and similar against the open plaza. Four garden trees are visibly crude polygon clumps despite more detailed tree assets already shipped for Briar. The challenge gates have little shared architectural frame; the sky is dark and olive for a sanctuary. The hub currently renders about 153k triangles and 82 draw calls before purchases, with 24 authored interaction approaches and no page exceptions.

## Pass

1. Rework the paving palette and joints into readable campaign, market, Warden, and challenge districts while leaving the physical floor flat. Add narrow inlaid borders and a central stone compass so the large court has structure without creating new trip hazards.
2. Reuse the shipped Briar tree and flower assets for planted corners and the exterior skyline. Remove the blocky garden foliage. Keep playable lanes open and colliders aligned with planted beds.
3. Give the campaign and challenge edges a stronger common architectural frame and simple, readable direction signs. Add individual destination accent colors and threshold details without hiding their established icons, names, or unlock state.
4. Improve station visual identities and the ambient hub lighting/sky. Move or remove sightline-blocking lamps only when the art and collider records move together.
5. Browser-verify arrival and each district at normal camera and narrow viewport, all authored approaches, Waystone/portal/shop access, chess and purchased upgrades, a previous-version save, errors, and approximate render cost. Do not call visual taste or fun human-playtested.

Failure risks: decorative geometry may falsely imply collision, signs may face away from their routes, new trees may cover interaction prompts, art changes may regress performance, and upgrades may intersect new furnishings. All added walk-height geometry will either share a collider or stay flush with the ground; screenshot and distance checks will catch the rest.

## Implemented and checked

Version 2.137.0 adds district paving, flush floor seals, a central compass, framed challenge gates, campaign and first-gate labels, more distinct station fascia/detail, real planted forecourt beds, and the existing detailed Briar tree/flower assets in the gardens. The hub sky/fog/ambient balance is brighter, the two center lamp pairs move out of the main sightlines with matching collision, and the map has six useful Waystation landmarks. The light changes are restored when the hub scene is disposed.

Real-browser desktop, 390px mobile and first-visit overhead tour views were inspected. All 24 authored approaches were clear and produced the expected interaction prompt. Five purchased upgrades still buy/reload with 13,500g remaining from 40,000g and eight fixture colliders, with no blocked approach. A 2.136.0 character save kept its name, gold and owned upgrades in 2.137.0. No page exceptions were observed. Approximate model cost with all upgrades: 178k triangles and 120 draw calls. The art direction and subjective sense of place still need Oliver's playtest.
