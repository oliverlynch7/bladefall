# Earned wardrobe escalation

Authority: U-LEGENDARY-WARDROBE-20261016. Existing Class Looks IDs and progression stay intact.

## Construction approach

Rank 5 inherits the current Rank 10 fitted construction: full class headdress where appropriate, layered shoulders/limbs, embroidered panels and existing class signatures, retaining its current alternate palette. Rank 10 builds on that craft with a unique additional focal feature and fine, contrasting inlay. No uniform head halo, universal orbit effect or whole-body scale increase. Default remains untouched.

| Class | Additional Rank 10 signature |
|---|---|
| Warrior | Fluted royal shoulder shield, gilt laurel breastwork and articulated-looking crown trim |
| Ranger | Carved leaf collar and branch tracery, fitted woodland compass |
| Mage | Expanded celestial armillary, a crescent focal gem and distinct slow orbital planes |
| Reaper | Vaulted bone reliquary over the ribs, violet soul-glass interior |
| Paladin | Sculpted solar relief with layered gold rays and ivory wing filigree |
| Necromancer | Bone reliquary keywork and additional cage detail around the existing souls |
| Ninja | Folded silver origami fox seals and close-fitting claw inlays; restrained glow |
| Berserker | Asymmetric beast-jaw trophy pauldron and heavy forged victory chain |
| Pirate | Detailed plume on the tricorn, pearl braid and navigational medal cluster |
| Chronomancer | Cased hourglass breastwork, counter-turning nested movement |
| Monk | Opening lotus shoulder petals and gilt bead ferrules |
| Stormcaller | Small caged storm cores and branching silver conductor inlay |
| Warlock | Split eclipse chest seal, black-cherry facets and counter-turning crescent |
| Skylancer | Layered swept flight vanes and an inset wind instrument |
| Bladedancer | Filigree ceremonial shoulder fan and jewelled fan-tip details |
| Beastmaster | Carved great-beast crest, amber trophy inset and reinforced antler ferrules |
| Pyromancer | Black-glass furnace core, luminous vent cuts and layered flame grilles |

## Quality and limits

Keep additions on existing bone fittings, away from face centre, wrists and cape attachment space. Static meshes merge by bone/material; no dynamic lights, free particles or cloth simulation. Aim below 10,000 extra triangles and 50 meshes per outfit, matching the existing renderer's validation ceiling. Keep textures at 256x512; improve their drawing instead of increasing memory.

Capture baseline per-class tier construction before edits. Use actual character rigs to verify all 51 combinations, attachment invariance across shared animations, finite transforms, resource budgets, default restoration, reduced-motion stability and independent actors. Compare upgraded Rank 5 to previous Rank 10 construction. Run state/ID/rank/save assertions. These do not establish beauty or absence of triangle clipping: require browser inspection of the real wardrobe, motion, capes, weapons and game/peer appearances before publication.

The Reaper diagonal-grip and Ruined Keep candidates remain unpublished and must not be swept into a release without their pending rendered checks.


## [Codex | 2026-10-16] Legendary wardrobe design preview prepared

All 17 Rank 5 outfits now inherit their former Rank 10 fitted construction while retaining existing colors and IDs. Every Rank 10 outfit has an additional named class-specific finish; cloth glyphs/borders are richer at unchanged texture resolution. Defaults and unlock/save rules remain intact. Actual-model geometry checks cover 51 combinations, 4,080 animation frames and 204 gate assertions; worst outfit is 7,356 added triangles/40 meshes, below existing 10,000/50 ceilings. These are rig/budget tests with mocked Canvas drawing, not visual acceptance. See docs/art-validation/legendary-wardrobe-20261016/summary.json.

Publish ONLY to a separate wardrobe-preview-20261016 branch for visual comparison, linked directly to /3d/class-skins.html?preview=1. This avoids applying unverified changes to production. The preview also contains the pending Reaper grip and Keep guidance candidates; the gallery neither loads nor alters character saves. Browser remains unavailable; GPU appearance, cape/weapon clearance, real game/peer rendering and user aesthetic approval remain open. Do not push this branch wholesale to main until those checks finish. Production remains v2.203.0.
