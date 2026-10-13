# Earned class appearances — implementation plan

## [Codex | 2026-10-12] Scope and inspection

All seventeen classes retain Default, rank 5 and rank 10. Existing tier IDs/selections survive. No combat bonuses. Equip through the Stylist for the current class; the preview gallery is read-only.

The old renderer uses a head-derived frame for nearly all torso ornaments and adds shoulder decorations to Body rather than the moving arms. It creates new materials/draw calls for every primitive. Rank-10 forms are mostly box plates or straight cones. Rings in nested scaled meshes distort child decorations. Most detail is clustered at the neck, leaving the rest of the outfit unchanged. These are code findings; they do not by themselves establish how every motion looks.

Build fitted attachments from the skeleton's rest matrices, independent of the pose when a skin loads. Shoulder caps follow upper arms; chest insignia follow Torso; cuffs follow forearms; knee/boot details follow legs. Keep the face and hands clear. Use shaped, beveled plates, curved leaves/horns, engraved fabric panels, metal inlay and restrained emissive gems. Batch static pieces by attachment/material; share bounded texture atlases; no dynamic lights. Retain original class bodies and default palettes.

## Per-class defects and direction

| Class | Rank-5 repair/design | Rank-10 repair/design |
|---|---|---|
| Warrior | Flat shoulder blocks become riveted crimson/copper lamellar guards and fitted greaves. | Cobalt enamel, brass swept pauldrons, gilded breast sigil and a compact swept officer crest; no face-height spike wall. |
| Ranger | Straight cone feathers become veined copper leaves, autumn chest clasp and bracers. | Ivory/jade layered leaf pauldrons and a carved woodland crest; bow draw corridor stays open. |
| Mage | Floating collar ring becomes embroidered amethyst stole, jewel clasps and sleeve trims. | Galaxy-patterned cloth, a fitted astrolabe above the hat and small orbiting stars; keep the admired stellar identity. |
| Reaper | Box ribs become shaped ash-silver rib guards and a burgundy sash. | Pale curved bone shoulders, violet soul inlays and a narrow hood crest; remove swinging chest stones. |
| Paladin | Box shoulders become light-gold engraved shell plates, ivory tabard and sun brooch. | Sculpted sun-wing pauldrons, ivory/gold greaves and radiant chest emblem; preserve holy light and an open face. |
| Necromancer | Box ribs become verdigris reliquary collar and bone fasteners. | Bone/jade fitted ribs and caged soul lanterns on outer shoulders, clear of arms and cape. |
| Ninja | Flat slabs become copper-edged segmented sleeves and quiet dark cloth. | Silver/indigo fox crest, layered forearm guards and fitted waist scales; remove crossed blades that pass through capes. |
| Berserker | Bronze scale shoulders, oxblood inlays and studded cuffs. | Curved asymmetric ivory tusks and heavy forged plates; keep horns away from face and raised arms. |
| Pirate | Flat coat details become braided red/gold epaulettes and compass buckle. | Teal/wine naval regalia, shaped tricorn silhouette and compact shoulder tassels; no dangling chains in saber path. |
| Chronomancer | Brass/teal clockmaker medallion and inset gear guards. | Engraved ivory/brass clockwork, visibly rotating chest hands and inset shoulder gears rather than floating disks. |
| Monk | Tiny gem beads become a readable jade prayer necklace and wrapped cuffs. | Saffron/cream lotus mantle, amber beads and fitted petal bracers; keep punches unobstructed. |
| Stormcaller | Cone fins become silver lightning-cut guards and cobalt inlays. | White/navy storm mantle with forked shoulder conductors and restrained cyan pulses; no repeated mage halo. |
| Warlock | Single gem becomes wine/ruby pact embroidery and split collar. | Black cherry/rose ritual armor, curved split horns and bounded animated seals. |
| Skylancer | Cone feathers become copper/sky vanes with real layered profiles. | Silver/azure swept shoulder wings, gold inlay and flight greaves; compact span keeps javelin support hand clear. |
| Bladedancer | Cone fans become rose-silver overlapping fan plates. | Sea-silk/champagne asymmetric fans, jewel clasp and short hip accents; remove long rigid thigh-clipping ribbons. |
| Beastmaster | Straight antlers become carved amber horn guards and tooth clasps. | Moss/ivory branching antler shoulders and embossed hide; branching stays above/outside arms without covering face. |
| Pyromancer | Plain blocks become blue furnace/copper vent plates and ember-lined stole. | Obsidian/crimson layered forge plates, lava inlay and bounded flame-shaped shoulder crowns. |

## Sequence and verification

1. Implement a shared fitted/batched ornament renderer and real-model gallery; inspect the first plate, cloth and agile body cases before completing the roster.
2. Rework all 34 earned designs, palettes and descriptions. The gallery compares all three tiers in identical lighting and lets the user rotate, zoom, change animation, weapon and cape. Add direct access from Dev Previews.
3. Review all classes in motion at gameplay and close-up scales, including selected cape, heavy/two-handed/ranged weapons and emotes. Record actual images and mesh budgets. Fix observed visual issues before delivery.
4. Exercise rank 4/5/9/10 gates, same-body class switching, save/reload, an old-save fixture, cheat unlock, stat neutrality, bag/Stylist rendering and remote representation. Ensure resources dispose and reduced-motion freezes ornamental effects.
5. Ship only verified scope, with evidence and explicit limits. Browser inspection is not the user's final aesthetic verdict, and representative weapon/cape coverage is not an exhaustive no-clipping guarantee.


## [Codex | 2026-10-12] Delivery and repeatable checks

All 34 designs implemented. Evidence: `../art-validation/class-wardrobe-2026-10-12/summary.json`, per-class comparisons, Stylist/bag captures, rendered-frame, state, peer and old-save reports. The gallery and production renderer share the same fitted geometry. The shared palette path now preserves real Color objects when cloning materials, preventing the black-preview regression found during this pass.

To repeat safely: run `python scripts/build-class-wardrobe-qa.py`, serve `public/` on an isolated localhost port, open `/3d/.qa-class-before.html?mute=1` and press Create old save, then open `.qa-class-state.html` and use Load old save, Test skin rules and Test co-op appearances. `.qa-class-render.html` runs the 51-outfit animation sweep. `.qa-class-mobile.html` embeds the actual gallery at 390x844 and provides a visible layout check. These fixture files are temporary and must be removed before a release. Scripts remain in the repo. Never run the state fixture against a user's saved-character origin.

Local checks passed. Aesthetic acceptance remains for Oliver; attachment math, test counts and screenshots cannot establish a zero-clipping guarantee in every combat/gear/cape combination.
