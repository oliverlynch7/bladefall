# Proposed custom 3D asset priorities

## Request and status

Exact user request: "Please also help come u with a list of assets that we should create detailed custom 3d models for that would significantly improve the  graphics"

This is a recommendation, not approval of every listed model or a new art-style commitment. Continue Oliver's preference for brighter, colorful stylized fantasy; keep useful existing assets. The five rarity chests and the 62 campaign clue/pickup objects have just been upgraded and are lower priority for another rebuild.

## Basis

Inspected the current world renderer, Storm Coast renderer, Ruined Keep kit and machinery, Castle Gates renderer, current campaign-object screenshots, and recent verified campaign work. The existing game already has imported scenery and character art; this is not a claim that those systems are absent. The strongest remaining opportunities are large shapes, coherent architecture and readable functional machinery. The coastal wrecks and machinery, for example, still assemble many rectangular pieces; the palace mirror has a plain frame, and the new detailed furnace book stands against large plain structural surfaces. Current screenshots support these examples, not a claim to have inspected every asset anew.

## Shared model families, in production priority order

| Priority | Asset family | Specific pieces | Intended visual gain |
|---|---|---|---|
| 1 | Natural cliffs and terrain edges | Layered cliff walls, rounded hill/ledge transitions, rock shelves, overhangs, riverbanks, cave mouths | Break the large rectangular silhouettes and connect walkable surfaces to believable landforms. |
| 2 | Village architecture | Cottage, barn, workshop, roof/window/door/chimney components, damaged variants | Give the opening region strong silhouettes, convincing thickness and an inhabited appearance. |
| 3 | Bridges and traversal structures | Timber bridge, rope bridge, stone arch bridge, stairs with landings, treetop perch, scaffold | Make routes look constructed and connected; clearly show every usable landing. |
| 4 | Fortress and dungeon architecture | Arched doorways, wall corners, buttresses, broken masonry, prison cell fronts, gatehouse sections | Replace oversized plain surfaces and improve interior/exterior continuity. |
| 5 | Animated machinery | Waterwheel, winch, crane, pulley, counterweight, portcullis, lift platform, pressure mechanism | Show what moves, what connects and why the player's action changes the environment. |
| 6 | Regional signature structures | The landmark shortlist below | Give each campaign region memorable visual anchors. |
| 7 | Encampment and transport kit | Supply wagon, prisoner cart, tents, barricades, weapon racks, bundled supplies | Make enemy positions and story activity legible through purposeful placement. |
| 8 | Environmental framing | Distinctive landmark tree, exposed roots, fallen trunk, rock clusters, dense foliage patches | Frame routes and vistas. Reuse the established better tree models for ordinary vegetation. |
| 9 | Lighting and interior fittings | Lanterns, braziers, wall sconces, bookshelves, benches, workstations | Improve repeated close views and strengthen regional material/color identity. |

## Region-specific shortlist

| Region | Custom models to prioritize |
|---|---|
| Briar Town / Black Woods | Watermill building and working wheel; recognizable barn; timber signal belfry; tree-supported canopy platforms. |
| Hollow Pass | Layered canyon formations; freight crane/cart; suspended bridge; believable prisoner holding enclosure. |
| Ruined Keep | Ruined gatehouse; prison cell fronts; integrated rescue lift/hoist; lower-workshop machinery refinements. |
| Frostfell | Sculpted ice-cave entrance and interior formations; snow-capped rock shelves; Ellis's laboratory bench/instruments; frozen waterworks mechanism. |
| Emberdeep | Main furnace with a recognizable fire chamber; bellows and exhausts; connected pipes/valves; forge presses and cooling channels. |
| Stormcoast | Curved broken ship hulls with ribs and torn planking; salvage crane; refined ballista; dock and rope fittings. Preserve the existing functional boat. |
| Sunspire | Ornate arches and balustrades; courtyard fountain; rotating sun-mirror frames and receiver; tall library shelves with visible hinges. |
| Final castle | Monumental entrance; spiral stair architecture with continuous supports/landings; service lift housing; throne and Hollow Gate surroundings. Preserve story reveals. |

## Recommended first comparison batch

1. One reusable cliff-and-ledge family.
2. One Briar cottage and matching barn family.
3. A timber/rope/stone bridge family.
4. The Briar watermill, including its working wheel and connected mechanism.
5. One Stormcoast wreck hull and salvage crane.

Capture each at the normal gameplay camera beside its old version before spreading the approach. These groups cover large screen areas, repeat across the campaign or anchor a required interaction. Exact production order is a recommendation; no new model is implemented by this document.

## Model and placement acceptance

- Colorful stylized materials, distinct large forms and deliberate wear. Keep timber, metal, cloth and stone visibly different; the chest reference is useful for material separation and layered construction.
- Give detail to silhouettes, corners, joints and focal features. Use material detail for fine scratches and grain. No fixed polygon count is a performance guarantee.
- Build reusable pieces and lighter distant versions. Share materials where practical; check a populated gameplay scene, not only an isolated viewer.
- Match visible walkable surfaces and clearances to collision. Test doors, jumps, player/companion clearance and camera views; roofs or structure must not erase supporting floors.
- Separate and correctly pivot moving parts. An open gate, raised lift or released brake must look physically different and agree with saved/co-op state.
- Every placement needs a purpose: supporting a structure, indicating a route, explaining activity or framing a view. Do not scatter more props merely to fill space.
- Models improve presentation; they do not by themselves solve pacing, empty travel or repetitive quest/puzzle decisions.

Enemy/boss bodies, player equipment and the hub also matter, but several have already received large passes. Revisit specific remaining weak models after reviewing them in motion, rather than automatically restarting the entire roster before addressing the environment.


## [Codex | 2026-10-12] Full campaign asset shortlist — approved for implementation

Exact user request: “I’d like you to improve every single asset you listed in every single level ! Do it now”. This explicitly approves all nine model families and all eight regional landmark groups in docs/design/CUSTOM_3D_ASSET_PRIORITIES_2026-10-12.md. The earlier recommended comparison batch is no longer a scope limit. Apply appropriate families throughout the existing campaign, preserving layouts, collision, parkour, stateful machinery, story, saves, co-op and the custom-SFX hold. Reuse the established higher-quality trees. Continue the brighter colorful stylized fantasy direction. Implementation and evidence are tracked in docs/design/CAMPAIGN_CRAFT_IMPLEMENTATION_2026-10-12.md; do not equate automatic coverage checks with human aesthetic acceptance.
