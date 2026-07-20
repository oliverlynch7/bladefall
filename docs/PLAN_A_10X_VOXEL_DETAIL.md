# BLADEFALL PLAN A — 10X VOXEL DETAIL PRODUCTION PLAN

**Status:** implementation plan; no gameplay redesign authorized by this document  
**Owner:** Bladefall browser build / Plan A  
**Parallel track:** Rocky's conventional 3D rebuild / Plan C  
**Primary target:** `public/3d/index.html` and its existing raw-WebGL instanced-cube renderer

## 1. Goal

Make the current browser version look like a deliberately modeled high-detail voxel action RPG. Improve every visible family—Wardens, skins, NPCs, pets, mobs, bosses, weapons, armor, portals, Waystation architecture, zone structures, foliage, terrain dressing, interactables, loot, hazards, and effects—without changing the approved voxel identity or breaking gameplay, saves, collision, readability, or browser performance.

“10X detail” is a visual target, not permission to multiply every object by ten cubes. Detail must improve silhouette, layering, material separation, animation, landmarks, and close-range craftsmanship. Hidden polygons and noisy micro-cubes do not count.

## 2. Relationship to Plan C

Plan A and Plan C share art direction but not implementation files.

- Plan A remains the shippable raw-WebGL browser game and uses procedural voxel assemblies.
- Plan C may use conventional meshes, textures, skeletal rigs, and an external engine.
- Share concept sheets, palettes, proportions, turnarounds, naming, and animation intent.
- Do not make Plan A depend on Plan C exports or tooling.
- Keep a neutral asset manifest so Rocky can reuse decisions without copying browser-specific code.
- When a design changes, update the manifest first; each track then implements that decision in its own medium.

## 3. Current Technical Baseline

Bladefall currently draws a unit cube with `ANGLE_instanced_arrays`. Each visible box is an instance record containing transform, scale, color/alpha, and emissive values. Most models are direct sequences of `bx(...)`, `box(...)`, `vcol(...)`, `vplat(...)`, and `vseg(...)` calls.

This has four consequences:

1. Thousands of additional cubes are affordable only while they remain instanced and batched.
2. Repeated hand-written box lists will become impossible to maintain.
3. Collision must remain simple even when the visual model becomes intricate.
4. Distance culling and level-of-detail selection must happen before submitting instances.

The safest strategy is therefore a procedural voxel-kit layer above the existing renderer—not a renderer replacement.

## 4. Locked Principles

1. **Voxel identity stays.** No smooth realistic mesh replacement in Plan A.
2. **Gameplay collision stays simple.** Decorative detail never silently changes traversal or hitboxes.
3. **Silhouette first.** A model must read at gameplay distance before receiving micro-detail.
4. **Three-scale rule.** Every important asset needs primary mass, secondary forms, and restrained tertiary accents.
5. **Materials must separate.** Stone, wood, cloth, bone, skin, metal, ice, corruption, foliage, lava, and magic need distinct palette/lighting behavior.
6. **Animation supports identity.** Detail must not be static clutter; equipment, cloth blocks, ears, tails, flames, and magical pieces should move where appropriate.
7. **No generic universal upgrade.** Each zone, faction, boss, NPC, skin, and weapon family keeps its own design language.
8. **Performance is a feature.** A beautiful scene that misses frame targets does not pass.
9. **One family at a time.** Finish, test, and ship coherent sets instead of leaving every category half-upgraded.
10. **Old saves remain valid.** Visual detail fields are derived from existing IDs and require no destructive migration.

## 5. New Rendering and Authoring Foundation

Build these systems before remodeling the full catalog.

### 5.1 Voxel assembly API

Add a small model-authoring layer:

- `part(name, transform, size, material, flags)` for named semantic pieces.
- `assembly(id, builder)` for reusable hierarchical models.
- local parent transforms for limbs, doors, lids, weapon parts, banners, and moving ornaments.
- mirror/repeat helpers for paired limbs, windows, crenellations, ribs, branches, and armor plates.
- deterministic variation seeds for damage, age, color drift, foliage, rubble, and asymmetric wear.
- named sockets such as `handR`, `handL`, `head`, `back`, `petHarness`, `weaponTip`, and `fxOrigin`.

Avoid allocating objects every frame. Compile static assemblies into compact typed-array-friendly part definitions and reuse them.

### 5.2 Material vocabulary

Create named material presets rather than raw colors everywhere:

- forged iron, polished steel, tarnished brass, royal gold
- oak, charred timber, pale farm wood
- cut stone, ruined stone, marble, basalt
- leather, cloth, fur, bone, skin
- grass, leaf, crop, snow, ice, crystal
- lava, ember, holy, arcane, void, corruption

Each preset defines base, light, shadow, edge/accent, emissive behavior, and optional controlled color variance. Continue using the current shader initially; add material flags only when a proven visual need justifies the instance-format cost.

### 5.3 Three LOD tiers

- **Hero LOD / near:** full authored detail for the player, nearby NPC, boss, inspected item, Mirror, menus, and photo mode.
- **Combat LOD / middle:** strong silhouette plus major armor/material forms; removes rivets, tiny trim, minor particles, and hidden rear pieces.
- **Crowd LOD / far:** iconic color blocks, weapon silhouette, head/shoulder identity, and essential emissive markers only.

LOD changes should use hysteresis so models do not flicker between tiers. Menu portraits and Mirror previews always force Hero LOD.

### 5.4 Visibility and budgets

Add per-frame counters to `window.__BF3`:

- submitted instances
- visible instances by family
- culled assemblies
- active emissive pieces and particles
- frame CPU time and GPU approximation where available
- LOD distribution

Initial desktop budgets at 1920×1080:

- target 60 FPS on the current reference PC
- 16.7 ms total frame target; no sustained frame above 25 ms
- normal exploration: target ≤ 12,000 visible cube instances
- heavy combat: target ≤ 16,000 visible cube instances
- boss spectacle peak: hard ceiling 20,000 visible cube instances for short bursts
- transparent/emissive instances capped separately because overdraw is more expensive than opaque cubes

The exact budgets may be revised after the foundation benchmark, but never removed.

### 5.5 Visual-only geometry contract

Every assembly declares one of:

- `visualOnly`: never enters collision or targeting.
- `simpleCollider`: uses an existing box/capsule footprint.
- `authoredCollider`: rare structures whose gameplay requires a deliberate compound collider.

Weapons retain their current combat definitions. More blade cubes must not alter hit range. Character and enemy detail must not alter hurtboxes unless separately approved as a balance change.

## 6. Art Bible and Shared Manifest

Create `docs/art/PLAN_A_ASSET_MANIFEST.json` plus a human-readable art bible. Each asset entry records:

- stable ID and player-facing name
- category, faction, zone, and rarity
- silhouette statement
- primary/secondary/accent palette
- materials
- required sockets
- near/mid/far detail expectations
- animation hooks
- gameplay collider reference
- concept image references
- Plan A status and Plan C status as independent fields
- screenshot angles and acceptance checklist

Never use one status field for both plans. Plan A completion cannot imply Rocky's asset is finished, and vice versa.

## 7. Production Order

### Phase 0 — Benchmark and foundation

1. Capture current instance counts and frame timings in the Waystation, each Main Level, a dense mob fight, every boss, Mirror, Bag portrait, and Treasure Sprint.
2. Implement assembly, material, socket, LOD, variation, and metrics systems.
3. Rebuild one test prop, one weapon, one humanoid, and one monster through the new pipeline.
4. Prove that collision, saves, screenshots, and gameplay remain unchanged.

**Exit gate:** the test set looks materially richer, switches LOD cleanly, and stays within budget.

### Phase 1 — Player, four classes, armor, and twelve skins

The player is the highest-frequency visual and establishes the quality bar.

- Build one articulated high-detail base body with hands, feet, face planes, hair sockets, and readable proportions.
- Create modular armor regions: boots, greaves, knees, thighs, waist, torso, shoulders, forearms, gloves, neck, and head.
- Rebuild each skin as a genuine armor/material configuration, not a color swap.
- Preserve class readability through stance, equipment placement, silhouette, and class accents.
- Add controlled idle motion, breathing, cloth/ornament lag, head tracking, and improved locomotion articulation.
- Ensure first-person hands and weapons share the same material/detail source as third-person models.

**Exit gate:** Mirror, Bag paper doll, gameplay camera, and first person all show the same approved character identity.

### Phase 2 — Weapons and wearable equipment

Process weapons by shared family so animation and sockets remain consistent:

1. swords/daggers/greatswords
2. axes/hammers/scythes
3. spears/javelins
4. bows/crossbows
5. staffs/rods/scepters/wands/orbs

For every family add bevel-like stepped edges, grips, guards, bindings, readable material changes, damage wear, elemental channels, rarity accents, and correct hand placement. Then upgrade helmets, chestplates, leggings, amulets, rings, capes, trails, and weapon glows.

One source must drive gameplay model, Mirror view, studio view, equipment paper doll, and generated thumbnail framing.

**Exit gate:** no weapon clips through the hand/body in standard idle, attack, charged throw, casting, dodge, or studio views.

### Phase 3 — Hub cast and pets

- Rebuild the six base Waystation NPCs with distinct bodies, faces, clothing construction, tools, workstation interaction poses, and idle personality.
- Rebuild all six pets with species-specific anatomy, harness/armor upgrade stages, locomotion, idle, attack, hurt, defeated, and vertical-follow animations.
- Preserve the approved Beastkeeper direction and the male/female/personality mix.
- Upgrade the Warden's Shade base design and its eight zone variants with shared spectral construction but zone-specific relics and damage.

**Exit gate:** every NPC is identifiable in silhouette without its label; every pet reads at gameplay distance and in the Pet Yard portrait.

### Phase 4 — Mobs by faction kit

Do not remodel 31 mobs independently. Build reusable anatomical/faction kits, then author distinct variants:

- plains corruption and beasts
- canyon scavengers and ranged watchers
- undead keep faction
- frost creatures
- ember/forge creatures
- void/abyss creatures
- Sunspire constructs
- Duskmoor royal/siege faction

Each mob receives a silhouette hook, locomotion hook, attack anticipation shape, hit reaction, death treatment, material breakup, and LOD set. Shared parts may reduce production cost, but no two mobs may differ only by palette.

**Exit gate:** silhouettes pass a blacked-out identification test and attacks remain readable under four-enemy combat.

### Phase 5 — Eight bosses

Bosses receive the highest detail and animation budget after the player.

- Unique anatomy and proportions
- layered armor/material construction
- animated weak points and phase changes
- signature weapon or body mechanism
- bespoke entrance, idle, attack anticipation, stagger, phase transition, death, and victory silhouette
- boss-specific arena lighting accents that do not wash out gameplay

Boss LOD may remain higher than ordinary mobs, but distant and off-camera pieces still cull.

**Exit gate:** each boss reads as a premium centerpiece in gameplay and a static turntable capture; no phase causes sustained budget failure.

### Phase 6 — Interactables and universal props

Upgrade shared high-frequency objects once, then propagate everywhere:

- treasure chest and mimic transformation
- portals and Waystation destination monuments
- waystones and checkpoints
- torches, braziers, lanterns, banners, signs
- doors, gates, fences, ladders, bridges, lifts
- altars, quest markers, shrines, nests/spawners
- loot pickups, resource nodes, breakables, training dummy

Every interactable needs a clear inactive/available/active/complete/locked visual state where applicable.

**Exit gate:** interaction remains readable without relying solely on floating text.

### Phase 7 — Waystation architectural rebuild

Create modular architectural kits for:

- foundation and floor courses
- wall bays, corners, arches, columns, trims, beams
- roofs, awnings, railings, stairs, doorframes
- counters, shelves, crates, racks, cages, forge equipment
- portal monuments and district landmarks

Replace flat monolithic blocks with layered construction while preserving the approved spacious macro layout and simple navigation collision. Use detail density gradients: highest at stations and landmarks, lower on transit surfaces.

**Exit gate:** every service district reads from across the hub, navigation remains uncluttered, and hub performance meets the normal-exploration budget.

### Phase 8 — Zone environment kits

Process one Main Level and its Trial Chamber together. For each pair build a unique kit covering terrain edges, structures, foliage/geology, traversal pieces, landmarks, secrets, chests, enemy nests, and goal architecture.

Recommended order:

1. Outskirts + Thornwood
2. Hollow Pass + Sunken Wash
3. Ruined Keep + Oubliette
4. Frostfell + Glacier Vault
5. Emberdeep + Magma Core
6. The Abyss + Reaper's Gate
7. Sunspire Palace + Sealed Reliquary
8. Castle Duskmoor + its final associated content

Do not scatter micro-detail evenly. Concentrate it around authored landmarks, route decisions, combat arenas, secrets, and close traversal. Distant boundary scenery uses low-cost silhouettes.

**Exit gate per pair:** macro readability is at least as good as before, all traversal remains solvable, secrets remain reachable, chests and enemies are grounded, and performance passes both quiet and combat routes.

### Phase 9 — Effects and final cohesion

- Rebuild elemental effects as authored voxel particles with controlled shape language.
- Give status effects, impacts, trails, death bursts, boss signatures, portals, and loot rarity distinct forms—not just colors.
- Tune bloom, fog, torch intensity, emissive limits, shadows, and palette response after geometry is final.
- Add selective ambient animation to flags, foliage, machinery, lava, water, corruption, chains, and portal runes.

**Exit gate:** effects clarify action and materials without obscuring enemies, terrain, or HUD.

## 8. Definition of Done Per Asset

An asset is not complete until it passes all applicable checks:

1. Recognizable silhouette at far and combat distance.
2. Primary, secondary, and tertiary forms visible at near distance.
3. Materials read without needing labels.
4. Intentional asymmetry or wear where appropriate.
5. Correct scale relative to player and environment.
6. Sockets align in every relevant animation.
7. No collision or hitbox regression.
8. Near/mid/far LOD screenshots approved.
9. Frame/instance budget passes in its worst expected scene.
10. Works in gameplay, Mirror/studio/menu portrait where applicable.
11. Colorblind/readability state remains functional.
12. Save/load and existing IDs remain compatible.

## 9. QA Matrix

For every shipped batch:

- muted Chromium at 1920×1080, 1600×900, and 1366×768
- third-person near/far and over-the-shoulder views
- first-person where weapons are visible
- idle, movement, attack, hit, dodge, death, and special animation states
- light and dark zones, high bloom and low bloom diagnostics
- one ordinary fight, one dense fight, and relevant boss phase
- Mirror, Bag, studio, shop/Pet Yard/Bestiary portrait as applicable
- previous-save load and new-save smoke test
- instance count, frame-time sampling, console errors, and WebGL errors
- screenshot comparison against approved concept/reference

## 10. Batch and Release Strategy

- Keep batches small enough to review: normally one shared system or 3–6 related assets.
- Never mix renderer-foundation changes with a large content batch.
- Ship one version per coherent family after browser QA.
- Maintain a before/after gallery and manifest status tally.
- If a batch exceeds budget, optimize or reduce hidden detail before moving on.
- Do not delete old builders until their replacements pass and all call sites have migrated.
- Keep compatibility wrappers during migration so unfinished categories continue to render.

## 11. Priority Tiers

### Tier A — seen constantly

Player body, equipped weapon/armor, four class silhouettes, twelve skins, core mobs, Waystation NPCs, pets, chest, portal, torch, main architectural kit.

### Tier B — centerpiece content

Eight bosses, Warden's Shade variants, zone landmarks, Trial Chamber landmarks, rare/legendary gear, class effects.

### Tier C — environmental depth

Secondary props, foliage/geology variants, rubble, shelves, tools, minor breakables, distant silhouettes.

Tier A must reach its quality bar before Tier C receives broad micro-detail.

## 12. First Implementation Sprint

The first sprint should prove the entire pipeline with a vertical slice rather than beginning all categories:

1. Instrument current instance/frame metrics.
2. Implement assembly, materials, sockets, deterministic variation, and three LOD levels.
3. Rebuild the Knight player at all LODs.
4. Rebuild the Rust Sword and one armor set.
5. Rebuild the Quartermaster, Coin Sprite, Thornboar, Abyss Brute, chest/mimic, torch, and portal.
6. Rebuild one Outskirts farmhouse/field kit and one Waystation service bay.
7. Verify gameplay, Mirror, Bag, NPC menu portrait, Pet Yard, boss fight, and Outskirts in-browser.
8. Compare performance and screenshots against baseline.

This vertical slice touches every major technical problem while keeping the review set small. Only after it passes should production expand to the full catalog.

## 13. Explicit Non-Goals

- No Unreal/Unity migration in Plan A.
- No replacement of save IDs, combat stats, loot balance, or trial difficulty.
- No automatic conversion of concept images into unchecked geometry.
- No uncontrolled per-frame object allocation.
- No high-detail collision meshes for decorative art.
- No equal-detail-everywhere approach.
- No claiming Plan C compatibility without the shared manifest entry.

## 14. Completion Milestones

1. Foundation and vertical slice approved.
2. Player/classes/skins/equipment complete.
3. Hub cast/pets/Shades complete.
4. All mobs complete.
5. All bosses complete.
6. Universal interactables complete.
7. Waystation architecture complete.
8. Eight Main Level + Trial Chamber environment pairs complete.
9. Effects/lighting cohesion complete.
10. Full-game performance and visual acceptance pass complete.

Plan A is complete only when every manifest asset has passed its definition of done and the full game remains within the agreed performance budgets.
