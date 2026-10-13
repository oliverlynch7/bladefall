# Class skin quality rework — October 12, 2026

## [Codex | 2026-10-12] U-CLASS-SKINS-20261012 — exact user request

> Also after we finish the hud update we should improve the unlock able skins for classes. Right now a lot of them have clipping problems or just don’t look that good. Needs massive imrprovmtn.

Source: current Bladefall conversation, following the HUD bag-capacity preview review. Precise message timestamp unavailable.

## Priority and status

Approved work queued immediately after completing the HUD update. This is a substantial quality rework of the earned class appearances across every class, not a claim that any skin was repaired during this documentation step. The HUD is still at preview review; do not bypass it or silently select its remaining layout decisions. Existing campaign finishing work remains open behind these user-prioritized tasks.

## Preserved decisions

- Keep default, rank-5 and rank-10 progression. Earned appearances stay cosmetic-only, selected through the Stylist for the equipped class and remembered independently per class/save.
- Rank-5 should visibly improve on the default; rank-10 should feel distinctly more elaborate and rewarding.
- Use varied, coherent palettes and class-specific silhouettes/details. Avoid turning every upgrade into a recolor or giving every class the same halo/orbit effect. Preserve class readability, the light-gold holy Paladin direction, and the welcomed stellar Mage concept where they work visually.
- Rank-derived unlocks, including the rank-10-all cheat, existing selections, gear and co-op appearance must remain compatible.

## Scope and acceptance for the later implementation

1. Inspect the current appearance catalog/renderer and create a per-class, per-tier defect list. Earlier browser checks did not establish exhaustive motion/cape clearance; the user's reported clipping is current evidence requiring review.
2. Rework poor shapes, attachment placement, materials, color balance and ornament animation. Improve the actual appearance, not just its description or triangle count. Retain successful details rather than replacing them indiscriminately.
3. Visually inspect idle, movement/turns, jump, dodge, basic/charged attacks, skills and emotes with representative supported weapons, armor and capes. Check shoulders, hood/hair, face, hands, torso and legs for intersections. Attach ornaments to the appropriate moving body parts and maintain weapon clearance.
4. Inspect at normal gameplay distance as well as close-up; earned detail must remain legible without hiding the face, weapon action or enemy telegraphs. Check the real bag/Stylist previews and remote co-op model, not just a static showcase.
5. Verify unlock boundaries, class switching, saved selection reload, pre-change saves, cosmetic-only stats and reduced-motion/quality behavior. Keep geometry/effect budgets practical for browser play and measure representative loaded scenes.
6. Keep evidence separate: code checks, rendered motion review, and user aesthetic acceptance. Do not claim every combination is clipping-free based solely on automated coverage or still images.

Detailed new designs and implementation plan will follow inspection after the HUD work; they are not invented or locked by this queue entry.
