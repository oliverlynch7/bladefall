# Waystation first impressions — v2.233

Requirement: U-HUB-FIRST-IMPRESSION-20261017.

The five existing opening illustrations now carry a cause-and-effect account: Ian protects Aerth, dies naturally, the lord pursues immortality, discovers unexpected obedience after creating the single Eternal Gate, uses returning travelers to recruit others and builds the Legion, which threatens Briar. No early soul/anchor/player-identity reveal. Final slide hides Skip story; Enter the Waystation remains the primary action. No additional illustrations needed.

The actual hub tour introduces a portal as a doorway, then Waystone fast travel, Briar as the first campaign destination, subsequent campaign portals as one continuing route, then services and activities. Purpose-first copy defines equipment and companions; forge details stay inside the forge. Bag and first campaign interaction display current rebound controls. Merchant camera framing is lower and closer; merchant render orientation uses the viewed face and tour camera. Human hub merchants are 74 units tall, Quartermaster 80, without changing campaign/chess actors.

The fake avatar at the hub mirror was removed. A Three r160 planar reflection uses projective texture coordinates and an oblique clipping plane, confined to the glass. A 384px reflection target updates at most 20Hz, only when near and viewed from the front; it is disposed with the hub. Local first-person body visibility is restored for the reflected pass and then hidden again. Existing outfit-inspection functionality remains separate. Vendored Reflector retains Three MIT attribution/license.

Activity entrances retain their original interaction footprints and services, with new silhouettes: braced mine entrance, barred prison gate, arena columns/pennants, checkered race lintel, boss-mouth gateway. No progression or collision route changed.

Training dummy now uses a cached procedural straw-and-burlap scarecrow with rope, timber support, straw tufts, painted target, and hat. The colored concentric floating ring model is no longer requested. Native model has 1,515 vertices. Fixed spawn heading faces the hub center, no tracking; 10,000 base HP scales for higher-level damage testing. Red bar explicitly reads Training Dummy / Lv 0. Existing harmless, resettable, zero-XP/loot behavior retained.

Performance: game imports canonicalize mob rendering, helper loading and teardown to the same module/cache. Offscreen enemy rigs are allocated while loading. Local animation bindings, dash afterimage clones, shader compilation, textures and the first skinned afterimage GPU draw are prepared under the loading curtain. Bone-copy pairs are cached instead of recursively finding each bone for every afterimage every frame. The loading gate accepts preparation only for the current world, not an old asynchronous completion; voxel fallback remains available.

## Verification

- 99 offline suites pass, including new actual Three geometry/reflection bounds/tour order/rebound-key tests, plus updated loading readiness/stale-world checks. Parser, changed module syntax and diff checks pass. Focused suites were rerun after final camera-only adjustments.
- Real browser, disposable Map storage seeded with a genuine pre-change level-100 save: successful hub load, retained level, no hero/mob exception, current-world shader preparation ready. No production storage read or reset.
- Actual story opening: final Enter the Waystation label, Skip computed display:none; five supplied image references retained. Screenshots saved.
- Actual tour invoked through hubTutorial(): expected order, correctly hidden normal HUD, readable service explanation, larger Quartermaster above counter. Screenshots saved. Tour camera orientation uses current stop rather than player position.
- Actual mirror from plaza: player and scene reflected within glass; no always-present protruding clone. Standard reflection math and front/distance rejection also checked offline. Screenshot saved.
- Dummy heading unchanged after player moves from one side to the other; level-100 test has356,500 HP, explicit level0/name, red bar and straw model. Screenshot saved.
- Actual mapped Shift dashes exercised (126 sampled frames with dodge active in final GPU-primed hub trace). In this browser run median frame7.9ms, p95 10.8ms, worst183.4ms. No hero/mob error. Earlier first-use measurements were worse, but these are separate short samples, not a controlled hardware benchmark. Occasional spikes remain: DO NOT claim all stutter is fixed or performance on Oliver's hardware is verified. Trial entry and dashes also exercised without render exceptions; loading completed.

The first-use changes address proven work in the movement path. Remaining intermittent stalls still need a focused frame-profile capture on the affected hardware. No claim of a complete new-player playtest or live two-device co-op validation.

Final visual follow-up: the Quartermaster now uses an unhooded human merchant model so his face is readable above the counter. A 390x844 embedded browser view confirms the longest lore slide and its controls fit without cropping. Cosmetic-only change and final framing were checked in the actual browser and focused checks rerun.

Production confirmed:45e211b9, Cloudflare deployment e74efc40-f379-4d97-ae76-833582a0a410 succeeded. Actual public browser displaysv2.233 and the current renderer/tour/loading assets.
