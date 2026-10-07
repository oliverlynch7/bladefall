# Briar Town beta remake — implementation contract

October 5, 2026. Approved scope: separate playable beta of Homefields and Black Woods. The main campaign portal, saves and canon remain intact. Proposed content below is implemented and revised against test results, not a claim of enjoyment before playtesting.

## Experience and story

You are a local person protecting your home, not an announced Bladeborn. Thomas reluctantly helps you prepare. Mara needs medical supplies; the mill crossing is the village's escape route. Lewis receives the evacuees in the Black Woods. The Legion signal exposes the refuge, captives and two dogs need help, and a large Legion-controlled warbeast blocks the way onward. Evidence of prisoner movements leads toward Hollow Pass. No Hollow Gate here, no early soul/Bladeborn revelations, no accidental replacement of the final ending.

The level should alternate safety, short readable fights, elevated traversal, physical investigation, a defended crossing, a quiet forest arrival, optional branching rescues, infiltration and a boss. Each major destination should be visible before its objective is assigned. Dialogue explains need; the environment explains method.

## Design references and practical application

- Nintendo's developer interview for Echoes of Wisdom, chapter 2: distinct remembered functions, intuitive visible responses, consistent interactions and support for plausible alternate solutions. Application: a heavy movable grain crate and the player's weight operate the same sluice plate. Water visibly changes direction. The player reasons about weight and location, not a hidden sequence. https://www.nintendo.com/au/news-and-articles/ask-the-developer-vol-13-the-legend-of-zelda-echoes-of-wisdom-chapter-2/
- Dan Taylor's GDC session, Ten Principles for Good Level Design, is a general design reference; the public session overview alone is not detailed evidence for specific rules. Our project-specific checks below—not an appeal to that talk—are the acceptance contract. https://www.gdcvault.com/play/1017803/Ten-Principles-for-Good-Level

## Map-first structure

### Homefields

South: Thomas and the home lane → village square and Mara's medical station. East: damaged granary loft reached by crates, awning and roof beams; medical satchel at the loft. West: mill courtyard, sluice plate and movable grain crate. North: mill scaffold leads above the water to a jammed timber catch. Central north: broken crossing over a visible river. Far bank: guard position and a wagon gate to the woods.

Two optional loops: a harder granary ridge jump sequence leads to a visible shard; a mill-bank discovery opens after the crossing is restored. Buildings are placed as usable homes/workplaces facing the lane, not evenly scattered blocks. Orchards have rows, fences define yards, supplies sit at stations, water has banks and a destination. No random prop distribution on walkways.

### Black Woods

South: Lewis and the safe refuge. Central: stream ravine with a required broken timber walk and lower catch ledges. West: logging camp, captive pen and optional finite kill contract. East: dog enclosure and climbable watch platforms. North: signal tower on raised supports, reached by a mandatory multi-jump scaffold. Its cable is cut at the actual signal apparatus; the signal visibly stops. Beyond: broad logging clearing with distinct cover and room for a large charging foe. Defeat the blocker and read a transport order leading to Hollow Pass.

Main route is readable; optional loops reconnect. No objective requires reading a long journal. Five beta-only shards total across two parts, with visible rewards and physical access. No trial portal appears in the level. Beta completion reports exploration and failures without adding campaign unlocks.

## Quest and interaction contract

| Beat | Actual player action | Visible consequence | Failure/recovery |
|---|---|---|---|
| Mara's supplies | Climb damaged granary, fight through raiders, take satchel, deliver once | Satchel disappears, quest changes, medical pad lights | Can collect before dialogue; death cannot delete it |
| Mill water | Move grain crate onto broad pressure plate, or stand on it | Plate lowers; sluice closes; waterwheel slows and stops | Crate constrained to safe ground, reset available nearby |
| Crossing | Climb scaffold and free timber while the waterwheel is stopped | Log shifts, bridge lowers and becomes walkable | No guessing; water pressure explains failed release; fall returns locally |
| Escape | Clear far-bank guards, then protect three walking villagers against four paced flanking ambushes along the full escape lane | Villagers travel through orchard and farm bends; each has visible HP and responds to real attack volumes | Overrun offers a crossing retry; supplies, bridge repair and discoveries remain done |
| Forest traversal | Jump uneven fallen timber and scaffold landings | Access to new vantage and the signal | Actual jump physics; catch ledges and local checkpoints |
| Captive / dogs | Defeat enclosure guards, open pen, return optionally | Occupants leave confinement; side objective completes | Topics remain available, no hostage softlock |
| Hunting | Defeat twelve at the designated logging camp | Explicit count and test reward | Two-active cap, bounded respawn, no infinite quest reward |
| Signal | Reach apparatus and sever its cable | Beam stops; refuge is no longer marked | Not another three-button lock |
| Blocker | Dodge committed rush, move behind the attacker, punish recovery | Telegraph, hit feedback, boss health, exit cleared | Nearby retry retains exploration, restores encounter fairly |

## Parkour specification

Required routes are repeated spatial judgments, not decorative stairs. Granary ascent teaches rising jumps over a safe yard. Mill scaffold applies turning jumps. Forest crossing combines horizontal gaps and elevation, followed by signal-tower ascent. Optional ridge/shard routes are narrower and farther apart. All classes use the same basic movement; no class skill, double-jump unlock or dash exploit is required. Floor surfaces never fade underfoot. Landings use contrasting timber/stone edges rather than arbitrary colored cubes.

Measure every required jump with the real controller simulation. Record start, target, whether the player left the ground, landing height and recovery behavior. Separately traverse complete links to check collisions and misleading shortcuts. Teleported interaction tests are state tests only.

## Combat and pacing

Use established functional combat behaviors with visibly different silhouettes: a spear threat that rewards sidestepping, a low rushing beast, a shield carrier that rewards flanking, and a large blocker combining a rush and close attack. Reuse reliable attack geometry; never count different labels as new mechanics. Begin with separated introductions, then paired threats. Keep enemies off the first landing and out of the medical safe area. Activate by room proximity rather than dragging the entire map into combat.

Beta loadout selection includes all classes, level, rank, gear, camera and relaxed/standard/hard. Default starter-scale setup. Test invulnerability is explicit and off by default. Beta XP is frozen so rank-up menus do not invalidate encounter comparisons; report that limitation in setup. Optional test rewards remain in disposable storage.

## Presentation contract

Warm plaster/timber homes, stone foundations, sloped roofs, framed windows, porch details and solid boundaries; layered rounded tree canopies and roots rather than flat green slabs. Individual assets serve architecture, work, habitation or navigation. Keep a shared palette and material vocabulary. New art must match collision, with no invisible solid props and no unsupported floor. Dynamic mechanisms are drawn at their collision position. Use existing character models and effects; no new SFX production.

HUD: one current main objective, compact optional counts and readable interaction prompt. Short dialogue panels with a clear leave option. Per-action feedback is on-screen and reflected physically. Health-pad explanation: large unlimited, small limited. An in-beta route map and reset/checkpoint controls support testing. Normal HUD/controls continue to work.

## Failure matrix

- Persistence: seed real localStorage; enter beta, earn/spend, die, reset, switch class, exit. Every original key/value must match. No beta reward crosses the boundary.
- Entry: title link, direct URL and mobile setup; missing isolation must fail back to title. Existing Keep beta still loads.
- Ordering: collect supplies/shards before talking; move crate before quest; revisit every NPC after main progress; side content still works.
- Mechanism: body and crate both depress plate; leaving releases it; crate cannot leave map, enter houses or jam irretrievably; release catch requires water diverted; bridge collision follows its visible opening.
- Traversal: every required and optional jump verified; falls never land below invisible floor or restart the entire map. No class-specific requirement.
- Death: retry restores health and correct enemy group, preserves earned quest progress, does not duplicate optional reward, drops carried crate safely.
- Transition: both chapter starts safe; no previous enemies/projectiles/geometry leak; inventory/quest states intentionally carry; return/restart controls explicit.
- Combat: normal attacks damage each type; each type attacks the player; boss activates and can finish; no global pursuit from spawn; only defense patrols can damage villagers, once per attack; blocked hits cannot damage them.
- Camera/art: shoulder, overhead and first-person inspection; no NPC/prop clipping through route; no distant terrain filling the river gap; no overhead canopy masking required landings.
- Performance: inspect draw/mesh counts and frame behavior; no rebuild each tick; dispose old chapter geometry.
- Accessibility: brief prompts; interactions keyboard/controller-compatible through existing input; no compulsory tiny target clicking or hidden sequence memorization.

## Evidence and delivery gates

1. Plan and overhead map before construction.
2. Build and inspect the crate/plate/water interaction before multiplying content.
3. Assemble both routes and verify jumps with actual movement.
4. State/retry/storage tests plus normal-control traversal and combat evidence.
5. Normal-camera screenshots/interaction trace; critique against the contract and repair issues found.
6. Ship only as Dev Previews beta. Report implemented vs tested vs pending honestly. Co-op, full campaign progression migration, polished bespoke character art and a proven target duration are outside this isolated solo beta; they are not silently claimed complete.

## Implementation review

The source plan was drafted before construction. The published SVGs below are coordinate diagrams reconciled to the implemented geometry, not a claim that the original drawings predicted every change. Platform labels show height. Tests shortened two optional canopy gaps; presentation testing fixed moving objects being painted over by static art and moved the wheel to meet its water channel. Village defense now includes two finite patrol waves and a recoverable shared civilian health bar. See briar-beta-qa.md for evidence and limitations.


## [Codex | 2026-10-06] Full-scale terrain pass
Grounded dimensions: live Homefields reaches approximately z=-4240; live Black Woods reaches z=-4400. Compact beta ended at -1770/-2820. New beta endpoints target -4250/-4620, retaining the proven mill workspace rather than scaling its jump distances.

Homefields: village and granary → working mill → far-bank staging area → curving orchard escape lane → stone-walled farm bend → woodland gate. The escape follows the road, not a straight empty sprint. Orchard trees belong to cultivation rows; boundary trees frame bends and hide incoming patrol approaches. Four distance-triggered ambushes, capped until prior attackers are defeated, create a longer escort with recovery opportunities.

Black Woods: refuge → broken stream crossing → logging/captive and dog branches → signal climb → winding northern woodland → defended choke → broad warbeast clearing → transport order. Optional paths return to main clearings. Keep the current climbing mechanisms while stronger optional traversal is built and measured separately.

Terrain: shared triangulated height grid used by collision and rendered ground. Flat constrained workspaces protect the validated mill; hills on expanded land shape sightlines. No ground beneath river gaps. Terrain under all props/enemies/escorts must agree; slopes cannot turn into invisible steps or allow unsupported objects.

Art: inspect campaign Blender tree kit in browser; reuse its geometry/material with authored positions and shared instances. Preserve fallback if loading fails. Do not dispose shared kit geometry during beta resets. Existing beta buildings remain provisional; do not claim all art is finished.

Verification: actual movement up/down slopes, crossing-gap unchanged, beginning-to-end route walk, escort route and fail/retry, combat terrain support, tree render and trunk collision, asset failure fallback, storage isolation and previous save. This pass is not evidence of fun or finished overall campaign replacement. Future work includes class-opponent side fights, individually damageable escorts and deeper optional traversal/puzzles; report those plainly.

Current status: individual escort HP is implemented. Hold-area and class-opponent quests remain pending. Tree selection uses the complete existing Nature Kit assets, not the bare Blender tree from the outskirts kit. This first pass retains original southern workspaces and expands northern terrain.
## [Codex | 2026-10-07] Current review candidate

The initial table above is the interaction contract. The playable full-scale beta now extends both chapters to campaign-length routes, adds four escort ambushes with individual villager HP, a twelve-kill capped logging patrol, a defended lumber wagon, a Ranger duel, a guarded northern ridge, a six-jump farm supply climb and a six-jump old-watch shard climb. The previously approved crate/plate mill is unchanged. The published expansion maps are north-up diagrams of the current routes. See briar-beta-qa.md for verification and outstanding human review. No beta progress writes to campaign saves; no live campaign portal was replaced.
