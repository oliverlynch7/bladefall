# Abyssal Descent floor rebuild

## Source findings

The current Descent repeats a single 940 x 940 square floor with four walls, six torches, twenty random edge rocks, a fixed opposite-edge portal, and randomly placed trickle spawns. Floor number changes the borrowed campaign theme, enemy scale and quantity, but not the player's route or tactical decisions. The Three.js portal art replaces edge rocks with the same twelve-pillar orrery on every floor. The mode is the campaign gold/XP/equipment grind; it is distinct from the separate Endless Dungeon roguelite.

## Implementation plan

1. Keep the existing run, pacts, reward chest, death retention, co-op host authority, floor difficulty curve and personal best. Replace the one square with four deliberately authored archetypes: an open cross court with side wings, a cover-rich stone court, a long staggered gauntlet, and a broken-span fight floor with a short required post-clear crossing to its exit. Every archetype has a valid spawn area, safe starting position and reachable chest/portal.
2. Place combat cover and hazards for specific decisions, not random clutter. Keep the first floor readable; introduce periodic vents on deeper floors. No hazard at the arrival, chest, or portal. The broken span's combat occurs on stable ground; the crossing begins after the fighting, so enemy pathfinding cannot strand the clear objective.
3. Spawn from authored safe pads and rotate encounter emphasis between mixed pressure, rushers, ranged threats and armored pressure using each theme's existing bestiary. Group enemies into short waves with a breather rather than an endless stream. Keep concurrent cap and total reward opportunities.
4. Give each archetype a distinct 3D silhouette and palette through the existing instanced portal art. Show floor name and wave progress in the objective tracker so the player understands the fight and exit.
5. Browser-check multiple floors/layouts, geometry, enemy activation and wave completion, reward exactly once, parkour crossing, all camera views, prior save, phone HUD and co-op host/guest handling. Human playtesting must still judge challenge, pacing and fun.

## Implementation and verification

Version 2.131.0 adds four repeating authored combat layouts, their own stone/portal silhouettes and subdued theme palettes, stable enemy spawn pads, three-wave clears with a short breather, and a reachable portal on each floor. The fourth layout requires a short crumbling-stone crossing after the combat. Court pillars, cross wings, march barriers and vents, and the broken crossing create different spaces rather than only changing floor color and enemy health. The post-clear chest, every-fifth-floor pact and every-seventh-floor elite rule remain. The overhead camera uses a steeper, shorter Descent boom so it stays clear of rear walls. The mobile HUD shows the floor name in the objective tracker without a duplicate tag over the health bars.

Real-browser checks: floors 1-8 built with grounded start/exit/spawn positions; 560 sampled enemy spawns landed on combat ground, outside cover and away from the arrival; floors 1, 4 and 7 completed all three waves, opened one reward chest and one exit; all 18 foes on the seventh-floor sample were elite; keyboard-equivalent movement cleared the broken crossing without death; the repaired overhead/shoulder views avoided rear-wall camera retraction; a guest received floor and clear packets without spawning host-owned enemies; a version 2.130.0 save retained level 8, 417 gold, prior best floor and weapon in 2.131.0. Desktop/phone captures were inspected. Static syntax and diff checks passed. This is functional and visual QA, not a human judgement of combat pacing, difficulty or art preference.
