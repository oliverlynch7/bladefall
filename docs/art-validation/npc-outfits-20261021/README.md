# NPC outfits — v2.344.1-npc-wardrobe

Source approval: `docs/requirements/USER_SOURCE_2026-10-21_NPC_APPEARANCES.md`.

Implemented 48 named appearances (including eight mentors and the regional Shade) plus 16 escort variants. The separately rendered Abyss King and Sunspire Orb retain their dedicated models. All 50 approved cast identities are therefore accounted for, not all replaced by humanoids.

The existing six body rigs remain. Each named appearance has a distinct model/palette/detail combination grounded in the approved character roles: medic apron and dressings, carpenter measuring rule, smith apron and belt tools, climber rope and bedroll, quartermaster ledger/purses, stylist tape/shears, officer tabs/keys, library books and researcher spectacles. Class mentors retain themed, restrained fittings rather than copied legendary player armor. Hair/beard tones, eye colors and some expressions vary. Civilian Rogue faces are exposed while retaining their outer hoods; captains replace the hood with a fitted hat. Cleric-based citizens have a natural fitted face instead of the source metal plate. Ninja/Reaper mentor masks remain.

Costumes follow inverse-bind bone anchors at the torso, hips and head, including walking escorts and seated chess visitors. All changed materials and modified geometries belong to the clone. Source weapons are detached before repainting so the shared kit is neither recolored nor disposed. Fittings merge by bone/material, with at most ten fitting batches and 4,864 added fitting triangles per appearance in the technical roster test. Source-face material groups are additional to that fitting-only count. NPC palette/garment/hair maps are capped at 512px; original exposed skin and source shading are retained. There are no new lights, particles, per-frame fitting rebuilds or gameplay colliders.

The public gallery `/3d/npc-wardrobe.html` calls the same `buildNpcActor` factory as gameplay. It offers regional groups, individual/group inspection, front/back rotation, mouse/touch zoom, standing/walking/seated poses and pause. A link is in title → Dev → Design Previews. Gallery state never writes saves.

## Verification

- Eleven focused regression suites pass: new costume/real bind-rig checks, NPC scene ownership, labels/names, face options, chess choreography/social behavior, hub recovery, save safety, renderer warmup and all 371 approved recording/source hashes.
- All new modules, hero renderer and index classic scripts pass syntax checks; import-map JSON parses.
- `browser-roster.json`: 64 actual loaded GLTF bodies, 12 pose samples each across idle/walk/seated, finite transforms, fitted faces, ghost consistency, private materials, unchanged source objects and zero shared-resource disposal. 21,244 assertions pass. These are staged model checks, not 64 natural gameplay encounters.
- `world-transitions.json`: actual isolated pre-change level-100/1,145-gold save loads into the hub, then Briar and Ruined Keep, and returns with level/gold retained. Correct new NPC profiles replace the old scene's actors. Thomas campaign dialogue and Stylist hub dialogue were opened and visually inspected. No captured browser errors.
- Regional lineups and selected front/back/walking/seated poses were visually inspected. The screenshots are evidence of representative angles, not a guarantee of no clipping from every angle. The last captain adjustment lowers the hat onto the head; earlier coastal screenshots precede that minor fitting adjustment.

No dialogue, recordings, voice casting, quests, save schema, enemy balance or level layout changes. No paid audio requests. Appearance data is deterministic on each client; real two-human Internet co-op and subjective character likeness/fun are not certified by these checks. Existing intermittent campaign FPS reports remain unresolved by this cosmetic task.

Production: https://c5a035e0.bladefall.pages.dev (code c8d4dbb4), live at https://bladefall.pages.dev/3d/. Cloudflare check completed successfully. Eight public assets match committed Git blobs exactly, including the gallery and shared actor modules. Fresh muted public startup shows v2.344.1 and one explicit hero3d.js?v=2344 entry; the public Mara gallery renders with no captured errors. See public-hashes.json, live-startup.json and public-gallery.png. Task patches are mirrored in the local queue. Unrelated premium-progression and articulated-rig regression dirt was preserved.

Public startup initially exposed the old hero query URL: import maps apply to imports, not HTML script-src entries. Corrected the actual index entry to hero3d.js?v=2344, added a direct-entry regression and bumped to v2.344.1 so current clients update. The actor code and verified outfits are unchanged.
