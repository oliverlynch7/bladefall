# Frostfell — three Hollowed officers

## [Codex | 2026-09-21] Grounded plan before implementation

Authority: approved campaign expansion Frostfell boss section. Replace only the main campaign Frost Sorcerer encounter. Preserve trials, boss rush and other modes. Three enemies: existing caster, shield officer and mobile spear officer; no adds, ward crystals or legacy nova. A shared scheduler allows one major wind-up/strike at a time. Each officer has a distinct locked shape, at least 0.9 seconds of warning, and a punishable recovery. Death interrupts an attack and changes surviving roles without a surprise burst.

Build a broad cave floor, west and east shelves at different heights, stepped ramps accessible to all classes, optional short jumping shortcuts, and a high northern exit. The caster marks the target's actual floor; shield waves can be jumped or avoided on higher shelves; spear lines stop at ledge faces. Movement follows authored ramp connections so melee classes can reach every officer and enemies can pursue elevated players. Keep the Frostfell art kit, affordable instancing and roof occlusion.

Integrate host-authoritative attack state, full position/height snapshots, per-attack local hit receipts, party scaling and existing damage/parry/dodge logic. Display group health plus remaining officers, and open the exit only after all three die. Award the boss-clear fanfare, achievement count and boss loot once, on the last officer. Preserve individually banked five-shard progress on retry. Add role-readable equipment and synchronize body wind-ups with gameplay timers.

Validate scheduler overlap and death orders, warning locks/height/dodge, route traversal, no reinforcements, peer state, clear/retry rewards, rendered fight and phone previews. Publish to main after checks; next campaign work is Emberdeep.

## [Codex | 2026-09-21] Frostfell officers implemented — 2.010

Replaced the main-campaign Frost Sorcerer with a caster, shield officer and spear officer in a cavern with two raised shelves, walkable ramps, eight tested jump landings and a high exit. One major attack at a time; locked ground circles, jumpable shield waves and bounded spear lanes match damage geometry. Survivors change priorities, with no reinforcements or surprise death burst. Custom shield/spear GLBs and upper-body animation tracks retain the existing low-poly kit. Three individual health bars plus shared health/remaining count; all three must fall before one boss credit, boss loot and exit. Other modes retain their existing encounters. Boss retries rebuild the trio and retain banked shards.

Validation: encounter scheduler and elevated pursuit tests, renderer import identity, Fallen and Voice API regressions passed. Browser: 84 controller ramp waypoints, eight shortcut landings, 12 combat/progression checks, seven controlled two-context co-op checks and five retry/death-order checks. Reviewed five browser previews, including staged attack warnings and a 390px phone view; corrected phone HUD overlap. Scenery has 9,416 triangles, spatially culled; shield/spear meshes have 674/682 triangles. These checks establish functionality, not human combat balance or device performance. Gallery now has 68 images. Voice catalog remains 173 lines.

Stereo Voice Studio hotfix cbb5237 was already deployed successfully (Cloudflare f42b0d72-4e34-4ad5-afef-87915131f9f1). Browser MediaRecorder/decode checks verified two-channel output, preserved stereo separation and centered mono. Existing takes and approvals were not changed. Private archive ../../decision-archive/2026-09-21-officers-stereo contains 159 user messages, zero unparsed lines, valid references.

Next: Emberdeep Iron Halls terrain, safe machinery shutdown, Flint/Jack dialogue and optional work; then Great Furnace, Colossus and the remaining campaign. The wider queue is not complete.
