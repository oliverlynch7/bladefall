# Campaign formations - 2.359.0

## Implemented

All16 campaign halves have authored encounter groups (57 groups /136 assigned actors).27 existing actors moved to collision-checked positions. No additional actors, scenery, particles, rewards, quest conditions, NPC/object anchors, map bounds or save schemas added. Source finite guards stay finite; hunt slots retain parent IDs, refill behavior and authored jobs. Scripted escort, alarm, wave, officer and boss fights are excluded from territory returns.

Intact ground troops need nearby same-floor sight before waking. A valid hit still provokes them. Troops return on actual navigation/collision to their district, keep their damaged HP and finish visible attacks before disengaging. Co-op uses living local/remote players for wake and territory decisions; normal ground specialists now target the nearest player too. Host snapshots own sleep/return and specialist melee warning timing; guests do not independently reawaken dormant host bodies. Trials, side rooms, hub, other modes and bosses retain their existing systems.

## Actual native verification

- before.json / after.json:16 scenes ready,57 groups resolved, no unmatched actors/rejected placements; all NPC/object anchors and enemy counts match the baseline.27 moves have center/body clearance; four stepped-floor positions have <=12 units of ordinary step variation, no unsupported feet.
- Fresh isolated warrior: default starter sword, no gear/stat/level/HP cheats, no stun/kill/quest-flag edits. Intro/trial skipped for campaign testing. Thomas -> Mara -> roots and front-door dressings -> real turn-in -> player/crate mill pressure -> jam/bridge -> actual departure guard kills -> Woods conversation/search party -> real ground signal -> Brute.
- Earned rank2 Cleave and rank3 Heavy Hand via real choice/confirm menus. First attempt died while the diagnostic harness was being prepared; retry started the half normally. Boss attempt then died to a ground wave with56HP. Normal boss retry restored121HP. Adjusted bot jump/prop navigation, baited real collisions, killed the1949HP Brute through actual stagger openings, cleared both handler waves and used the real exit. Native zone-clear screen banked level3 and unlocked Hollow Pass. Completed-half quest flags and earned choices survived death/retry. No claims of human-tested fun or realistic novice input: automated movement/attacks use the actual input/update handlers at accelerated simulation speed and pause between batches.
- fresh-briar-opening.json / fresh-briar-through-woods.json / fresh-brute-attempt.json / fresh-brute-won.json / fresh-briar-completed.json preserve those states, actions, attempted paths and save data. Blocked bot waypoints remain in evidence; an obsolete route approached the storehouse back wall. The working front doorway was not altered.
- Native tower probe: first-landing guard at y240 retained its full drop timer with the player below at y0; awakened normally on the same landing. Native guest handler retained host dormancy and suppressed return attacks. native-coop.json additionally exercises actual update + enemySnap with a complete simulated peer record: a predator1539 units from the host woke and pursued the nearby peer. These are packet/handler probes, not two live clients.
- native-return.json: actual update/input/navigation/footing drove a pursuing raider back to within30 units of its original home, then dormant. Visible attacks completed before disengagement; HP remained87 throughout. legacy-restore.json: actual save/continue preserved level4, rank4, gold1145, zone/area/quest flags and recreated the expected formations.
- performance.json: four comparable foreground Chrome locations with saved high-quality overhead settings. Debug positioning/invulnerability used ONLY in performance fixture, not fresh playthrough. Median intervals roughly5.5-8.5ms; noisy samples do not establish a general performance speedup. Tower: previously3 upper-storey foes woke at the ground entrance; now0. No render/particle budget increase. Renderer geometry count is a lifetime cache count, not per-scene allocation.

## Remaining verification

The other14 halves received native scene/placement checks and existing quest/hunt/interaction/authority regression suites. They have NOT all received a fresh-character full quest/combat playthrough in this pass. Human pacing/fun, full remote co-op, low-end hardware, controller and other camera views remain playtest work. Do not describe this evidence as a full eight-zone campaign playthrough.

## Reviewable plan

public/design/campaign-geography/encounter-plan.json mirrors the in-code authored formations. No terrain or route blueprint geometry changed in this pass.

## Production verification

Game commit41bf38df; mirror97a5bb8b. Cloudflare112c9a1e completed successfully. public-hashes.json: all5 changed public resources match committed SHA256. public-native.json: deployed Briar and Long Ascent ready, all expected formations, no rejected/unmatched actors; upper landing guard cannot wake from below and can wake on its landing. Native console captured no errors/warnings. Public checks use the new unique deployment origin so the player's production saves are untouched.
