# HUD design choices — October 12, 2026

## Exact user requests

“I’d also like for us to look at our HUD and see if there are any ways to make it smarter or less busy without making the player experience worse. Any ideas?”

“Can you design me a preview or a few variations of new ones that I can choose between before applying”

## Scope

Create accessible visual previews for comparison. Do not apply a replacement gameplay HUD until the user chooses a direction. Current campaign work remains open; this is a requested design-review detour. Use actual Bladefall scenery and existing icon artwork, with clearly identified sample HUD values. No save, gameplay, class, quest, or input changes.

## Grounded design plan

The current desktop HUD reserves a 680px player panel, a separate wide pair of XP panels, a 636px skill frame, a 300px quest frame, and independent note, loot, companion and navigation overlays. In the inspected mill scene, instructions are repeated in several locations. Preserve readable health, mana, cooldowns, progression and guidance while reducing framing and duplicate text.

Build three layouts at the same reference viewport and scenario state:

1. **Classic Compact** — familiar corner positions, smaller player panel, paired thin XP tracks near the hotbar; most conservative transition.
2. **Adventure Focus** — group minimap and the next objective together, small horizontal vitals, lighter hotbar and a reserved reading lane; prioritize seeing and navigating the world.
3. **Combat Focus** — group vitals, resources and skills at the bottom center, leave identity and party in the upper left, and map/objective on the right; prioritize combat scanning.

Provide exploration, combat, clue-reading and co-op samples, each with the same data across all three layouts. Show a compact companion, a pinned optional objective, distinct character/class XP, cooldowns, a low-health state, and shared progress without overwhelming the default view. Include quiet locked skill placeholders in a beginner sample. Keep scene transitions user-controlled and avoid moving combat-critical information between modes. Comparison controls, a full-size view, and phone panning help the user inspect the real size of text. Mock interactions must be explicitly labeled; they never write game preferences or saved characters.

Validate actual browser rendering, readable control contrast, no overlapping primary HUD panels at supported preview sizes, keyboard access and mobile review. Add a title > Dev Previews link, leaving live HUD code/styles unchanged. Save screenshots and a short verification record. Aesthetic preference is still the user's decision.
