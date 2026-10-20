# Homefields district rebuild — 2.342.0

Implemented in the regular Briar campaign, not a replacement of its beta. Scope is Homefields village, farms, optional loops and mill approach. Black Woods and the Brute retain their existing layout and mechanics.

## What changed

- An explicit village-to-mill field lane, with a raider at its fork, a guard beside physical wagon cover, and authored supply-raid/pasture groups. The existing28 initial enemies and5 authored gear chests remain; no new spawn/loot spam, damage/XP tuning or trial changes.
- Connected western supply/workshop/orchard circuit and eastern granary/pasture/watchtower circuit. A separate24-tread west stair returns the bell ridge to the mill-side fields;14 shallow front treads replace the old7 large steps.
- Six visible planted-hill enclosures and continuous farm boundaries close misleading empty destinations, retaining the exact[-3030,2850]×[-4820,1100] map bounds. A gate preserves the original watchpost stair. These are actual colliders and models, not minimap-only guidance.
- Three varied elevated picking-deck jumps reach one relocated existing orchard chest. Misses land on ordinary ground. The original reward key is assigned before moving the chest, preserving its personal roll/claimed receipt.
- Older enemy-drop chests restored inside a newly enclosed plot are projected to a nearby authored road without changing their reward key. Transient/personal loot cannot determine physical field boundaries.
- Reused existing cottages, trees, workshop, granary, bell ruins, props, mechanisms and material system. A new merged timber stair asset has actual treads, diagonal stringers, trestles, ropes and fittings. No extra tree population, lights or ambient particles.
- Straight collision spans are merged:79 added colliders rather than197 per-panel boxes. Existing soil already supports the new lanes, so no extra overlapping ground segments are required; safety shoulders cannot fill the protected millrace. Large new assets use their actual bounds for culling. Stair flights stay opaque. The fallback renderer retains stairs, picking decks, boundary rails and wagon cover.
- Existing quest IDs, all371 approved voice recordings, mill logic, five-shard objectives, boss progression, chest counts and save format retained. Renderer imports received coherent cache keys; other regions' layouts were not rebuilt by those import-line edits.

## Verification

`before.json` and `after.json`: actual isolated Chrome captures. Final after capture records a staged level-one Warrior, with existing account class progression; combat is held. This is not a naturally earned new-save combat/balance run.

213 staged actual-game movement/interaction observations:45 new road legs,67 tower stair/top/return legs,28 workshop-to-orchard access legs,6 jump/takeoff/miss observations,22 original watchpost legs,4 adverse-turn/return checks and41 main quest/mill checks. `district*.json` and `main-quest.json` contain the results. Wrong-turn tests intentionally expect blocking; their health result is not a damage-safety test because the fixture is invulnerable.

The main interaction check uses actual Thomas/Mara dialogue events, roots, the front store doorway, supply delivery, crate movement/weight, wheel release, delayed bridge collision and crossing. Navigation uses real input state/update/collision with actors held; no direct pose changes occur within an individual tested walk. Route starting positions are staged and simulation time is pumped. This does not constitute an uninterrupted normal-input playthrough.

`native-stairs.json`, `native-return.json`, `shoulder-camera.json`: ordinary held keyboard controls inspect the actual front descent/ascent, west return and shoulder-camera field bend from staged starting positions. Screenshots show actual game rendering. A deliberately unrelated early capture was named incorrectly during collection, corrected and excluded from the published evidence set.

`restored-loot.json`: an old enemy chest staged inside a closed plot is moved by the actual running reconciliation to the road, preserving its reward key and record.

`legacy-save.json`: preserved pre-change level100/gold1145 fixture loads and enters district2342 with both values retained. User saves were never opened or changed; testing uses a separate localhost origin. `regressions.json`:13 focused suites pass, including2943 district assertions, existing co-op chest authority/receipt checks and all371 recording hashes. Syntax checks pass. No unresolved encounter footing in the actual scene.

## Limits and corrected failures

The first west road intersected a real hay shelter; it was rerouted. The first jump check accepted ground-level arrival; it now requires the intended platform height. A new field fence crossed the old watchpost stair; a physical gate was cut and the full climb retested. Per-panel collider duplication and over-wide path safety shoulders were removed before shipping.

The first baseline exporter serialized a circular enemy/room reference; it was fixed in the local-only harness. A cache-consistency regression caught two copies of the shared scene module; import keys now agree. These were not unexplained game crashes.

No new human fun/discovery verdict, two-human Internet co-op session, full campaign completion or hardware FPS certification is claimed. The previously reported severe Orchard stutter is not declared fixed. The rest of Briar and the other campaign regions still warrant layout work and playtesting.

## Publication

Released as `141a93eeebfb0f703f138b92bdeffbff0a0eaa35`; Cloudflare Pages succeeded. `deployment.json` confirms the seven public game/model/preview files match committed Git blobs. `live-startup.json` records the muted public v2.342 title screen, loaded district helper, no renderer error and no warning/error logs. The preview was checked at390px width with both images loaded and no horizontal overflow. This public startup check is not a second full campaign run.

Live game: https://bladefall.pages.dev/3d/?mute=1&verify=2342-district
Preview: https://bladefall.pages.dev/design/campaign-geography/briar-district.html
