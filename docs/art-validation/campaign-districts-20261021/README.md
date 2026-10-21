# Campaign districts and optional shard expeditions — 2.357.0

The owner approved extending the planned Briar restructuring to every campaign level while protecting all existing quests and making shards harder to reach. The authored plan precedes construction in the continuity record and `public/design/campaign-geography/restructure-plan.json`.

## Built

All 16 halves have an explicit route/space plan. Homefields keeps its prior completed district. This pass adds 38 fitted terrain/building footprints, replaces actual empty-space boundary contours in Black Woods, Hollow freight banks, Keep outer wards and the siege front, and adds low planted-bed walls in the palace. Existing themed craft kits and forest trees are reused; no extra ambient particle system or broad scattering pass. Palace walls use 20 textured spans rather than 100-plus decorative segments.

Nine existing exposed shards now sit on individually authored optional climbing routes; one existing dungeon shard moves into a turning inspection recess. Paths change direction, footprint and height rather than repeat a uniform staircase. Ground/pier supports match the visible kit. These are stable existing shard IDs with unchanged unlock conditions. Earned giver/puzzle/boss rewards remain intact.

Main/side quests, hunt definitions, hub-return requests, NPC coordinates, dialogue/recordings, campaign bounds and save schema are unchanged. New geometry is identical across personal quest histories. Special modes and boss arenas are excluded. The original forest-bank replacement is removed before its new contour is built.

## Evidence

- `before.json`, `after.json`, `anchors.json`: actual native game captures and strict protected-placement/bounds comparison. Homefields chest rewardKey contains a different pre-existing random seed between captures; all chest positions/count/other fields match.
- `rendered.json`: all16 sections reach actual loading readiness; every expected district model is present and native console is clear. Counters are captured observations, not frame-rate benchmarks.
- `main-walks.json`: selected staged-open main/branch routes in every half, normal movement/jump physics; final spiral samples its first24 authored points plus service route, not all241 points.
- `shard-walks.json`: all9 new climbs, 39 landings, completed using held single jumps and a short run-up; no double jump or dash. Debug placement only at each route start, enemies cleared.
- `landing-safety.json`: final landings remain grounded without environmental damage for180 updates with invulnerability turned off.
- `recess-save.json`: all3 inspection-corridor legs, duplicate collection rejection, boss transition excludes districts, hub banking and reload. Existing level4 / XP52 / gold1145 retained.
- `return-requests.json`: tracks5 / keepsake3 / pattern4 / supplies3 accepted interactions exist with zero collision push. `dog-route.json`: both real dog paths traversed with normal movement and jumps.
- `regressions.json`: 22 relevant suites plus inline syntax pass; district suite1148 checks includes original enemy-spawn clearance.
- `traversal-functions.js`: native CUA/CDP physics helpers, isolated QA storage only. No terminal browser automation.
- Screenshot previews in `public/design/campaign-geography/restructure-shots/`; mobile plan checked at390×844 with no horizontal overflow.

## Honest limits

Physical journey tests stage quest gates open and clear enemies; they do not establish full quest completion, combat pacing or fun. Existing quest/hunt/return/shard/story suites cover state preservation. Shared geometry and authority checks pass, but no live Internet co-op playtest was performed. Human playtesting remains necessary for pacing, discovery difficulty and aesthetic judgment. The initial browser frame wait stalled; explicitly driving real frames/loading in a fresh isolated tab resolved the QA wait without stubbing WebGL or bypassing loading. Existing coast/cage route annotation height discrepancies are documented in browser.json.

## Publication

Code 7cd6d036 deployed successfully as bc77d8be. Eleven public resources match exact committed blobs. Fresh native muted public title reports2.357.0/16plans and both2357modules with no errors. Published blueprint selector renders correctly; all16 local selector entries also render. See production.json/public-browser.json/plan-controls.json. Mirror code baa4cf15.
