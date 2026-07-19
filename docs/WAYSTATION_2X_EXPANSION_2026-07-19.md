# BLADEFALL — 2× Waystation Expansion and Portal Concourse

**Owner direction:** The Waystation is too cramped, especially the portal row. Expand it to roughly twice the usable walkable footprint and redesign circulation so spaces breathe and flow. Do not merely multiply every coordinate or add empty floor.

## Locked outcomes

- Increase meaningful, navigable hub floor area by approximately 2× while keeping travel between common services brisk.
- Replace the single compressed portal lineup with a dedicated portal concourse.
- Physically separate eight Main Level portals from seven Trial Chamber portals. Main gates are the primary architectural focus; Trial Chambers occupy a clearly distinct secondary wing/arcade.
- Give each portal enough lateral and forward clearance that its frame, art, label, lock/clear state, and interaction prompt can be read without overlapping neighboring portals, NPCs, particles, lamps, or the player.
- Preserve every portal ID, unlock/discovery condition, difficulty record, interaction behavior, save field, and destination.
- Preserve all hub NPCs and services, but group them into legible functional districts with intentional approach paths and sightlines.

## Spatial plan

Build a readable central arrival court with four connected districts:

1. **Main Level Concourse** — eight large gates in campaign order with strong axial sightlines and generous spacing.
2. **Trial Chamber Arcade** — seven more mysterious gates in a separate wing, unlocked/discovered states visually readable from the threshold.
3. **Craft and Commerce Court** — Quartermaster, Smith/Forge, Pack, and Beastkeeper/Pet Yard positioned around a practical shared work court without prop collisions.
4. **Warden Hall** — Drillmaster, Keeper/Wardrobe, Mirror, Postings, Sparring/Bestiary, and Abyss access arranged as distinct stations with clear circulation.

Use thresholds, floor materials, arches, banners, lighting temperature, landmark silhouettes, and vertical framing to distinguish districts. Avoid tall opaque partitions that block orientation. From arrival, the player should immediately understand where Main Levels are and see at least two other district landmarks.

## Portal standards

- Target at least 1.5 portal-frame widths between neighboring frames and a clear interaction apron in front of each gate.
- Ground every gate with a base/threshold and architectural support; no floating frames, black rectangles, floating labels, or disconnected icon slabs.
- Portal labels and interaction prompts must not overlap. Show one consolidated contextual prompt for the nearest valid target.
- Main gates display “Level 1” through “Level 8,” never “Tier.” Trial gates are labeled as Trial Chambers.
- Locked gates remain architecturally present but unmistakably sealed. Cleared and difficulty-beaten states are readable without excessive particle clutter.
- Ensure portal effects do not wash out labels, NPCs, or nearby props.

## Circulation and comfort

- Common loops—arrival to Main Levels, Shop, Bag, Mirror, and Postings—must remain direct despite the larger footprint.
- Add subtle fast-flow assistance only if measured travel becomes tedious: broad unobstructed paths, diagonal connections, and return shortcuts before considering teleport pads.
- Remove collision pinch points and camera traps. Minimum primary walkway width should comfortably fit the player, pet, and an approaching NPC/prop silhouette without visual collision.
- Reposition NPC home-facing targets after layout changes and verify their normal approach direction.
- Rebalance lights so doubling the footprint does not create either overexposed torch clusters or dead black expanses.

## Lava pools and safety rails

- Reassess every existing hub lava pool during the rebuild. Remove pools that do not materially improve the Waystation's identity, lighting, or spatial composition.
- Any lava pool retained beside walkable space must have a short, continuous, intentional fence/guardrail around exposed edges. Do not leave raw floor-to-lava drop-offs along normal circulation.
- Rails should read as sturdy Waystation construction—dark forged posts with warm metal/stone accents—and must follow the pool shape cleanly rather than appearing as repeated floating bars.
- Keep rails low enough to jump over with the normal base jump; Magic Socks must not be required. Target a collision height comfortably below the player's reliable jump arc while still visibly discouraging accidental walk-ins.
- Provide deliberate openings only at bridges, maintenance steps, or authored access points. Frame those openings so they cannot be mistaken for missing fence segments.
- Keep posts/rails clear of interaction aprons, portal approaches, NPC stations, and primary diagonal movement paths. Prevent tiny snag gaps between rail collision and adjacent walls/props.
- Pets should not path into lava or become trapped behind rails. If lava is hazardous, pet movement must safely ignore/recover from it without visible repeated falling.
- Verify the rail remains readable from both camera modes and does not disappear into lava bloom or torch glare.

## Required QA

- Record old/new walkable footprint and representative travel times from arrival to every service and portal wing.
- Verify all 15 portal interactions and all hub NPC/service interactions from a legacy save and fresh saves with different unlock states.
- Inspect at 1920×1080, 1600×900, and 1366×768 using normal and over-the-shoulder camera modes.
- Verify no prompt overlap, prop collision, wall-facing NPC, camera occlusion, inaccessible station, out-of-bounds escape, floating geometry, or portal effect obscuring labels.
- Walk and sprint every retained lava perimeter; verify all exposed edges are fenced, normal movement does not accidentally cross the rail, every rail is base-jumpable by choice, openings are intentional, and collision never snags the player or camera.
- Confirm pets navigate/appear correctly throughout the enlarged hub.
- Test performance while viewing the full portal concourse; gate effects outside the useful view should be cheap or dormant.
