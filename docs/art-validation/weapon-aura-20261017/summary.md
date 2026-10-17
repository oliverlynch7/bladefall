

## [Codex | 2026-10-17] v2.245 weapon aura and cosmetic icon repair

Cosmetic weapon glow no longer changes source color or emissive paint. Replaced repaint/strong edge lines with separate normal-expanded BackSide rim aura, additive transparent/depth-tested, no depth/shadow writes or point lights. Subtle silhouette energy uses shared base geometry and separately owned shader materials. Toggling/color switching isolated per actor, off hides shell; clearWeapon disposes shell material without disposing shared asset geometry. Elemental paint traversal skips shader shells. Existing intrinsic/dual weapons and bag portrait use shared path. Hero/module cache keys advanced.

Browser old-level100 fixture verifies36 weapon/glow/off combinations across hammer/sword/bow/staff/scythe/pirate, exact material/color/emission preservation, no captured errors. Independent shared-material actor/geometry test passes; screenshot inspected and intensity tuned for visible restrained rim.108 existing offline suites plus focused aura suite pass (109 total). Wardrobe18/18images load. Confirmed missing custom art cape-winter.png and glow-gauntlet.png receive existing suitable fallback icons; fixed literal image-path audit finds no other missing assets. Icon briefs recorded in icon-audit.json. No production save manipulation or physical two-device test claimed.
