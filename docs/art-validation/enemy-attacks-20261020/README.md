# Enemy attack performance - 20 October 2026

Version 2.339.0-enemy-attacks. User requests improved attack animations for all bosses and mobs.

The production rig roster covers 49 enemy appearances (the non-attacking straw dummy is deliberately unchanged), plus the procedural Sea Hydra. Existing creature/armor models and colored combat effects remain. This pass changes visual movement and clip selection, not combat hit volumes, attack clocks, damage, difficulty, boss counter rules, rewards, saves, NPC dialogue or audio.

## Changes

- Every rigged attack now has anticipation, a held readable wind-up, accelerated release, follow-through and an eased return. Small root-bone weight shifts leave the outer actor/collider position unchanged. Slimes compress and stretch; lunge legs brace in the sagittal plane without sideways bowing; ground pulses include a foot plant.
- Actual move IDs now route to matching clips: campaign troop thrust/sweep/ring/mark/volley/cross; Fallen thrust and sweep; shield/spear/caster officers; royal beam, ground wave, burst and sweep. Furnace/Marble and prison variants retain their distinct choreography. Recovery uses live authoritative recovery clocks, including co-op snapshots. Interrupted casts cannot invent a release.
- Brute/Fallen two-handed weapon constraints cover their new move variants, keep the support hand on the haft and retain root-position tracks. IK quaternion tracks are normalized. Officer weapons are constrained without overwriting the new body and shield choreography.
- Production procedural mimic now opens its lid once, braces its legs, snaps once and settles, rather than oscillating its jaw and cycling running legs throughout the bite.
- Hydra bite, sweep and water blast have separate clock-driven preparation poses. Sweep winds back toward the correct side; lower-jaw geometry actually articulates; the jet originates at the moving mouth and still ends at the existing cover limit. Existing neck smoothing, restraints and colored water effects remain.
- Hero rendering, world cleanup, props, NPCs and companion model loading resolve to one shared enemy-renderer module/cache. Cache-version changes reach the world/coast/Hydra chain too.
- Existing public animation preview gains a complete attack-sequence button, correct production mimic/officer paths and a full-roster render check. It remains a body-motion preview, not a substitute for gameplay effects.

## Evidence and limits

- `rigs.json`: actual GLB/procedural production models, 49 appearances, 303 attack-phase clips, 7,575 sampled poses. Finite world matrices, unit bone rotations, valid clips, unchanged outer actor position and required variants. This does not prove collision-free silhouettes from every viewing angle.
- `browser-roster.json`: Chrome WebGL render samples across the complete roster. No browser errors. Final counts are recorded in the file.
- `live-routing.json`: actual game renderer selects 34 staged boss clips across seven boss rooms; old level100/gold1145 save remains loadable. Includes Brute, Marksman, Fallen, all officers, both Colossi and all four King attacks.
- `hydra-live.json`: all nine wind/strike/recovery combinations rendered in its real arena; finite matrices and actual lower-jaw angle variation.
- `regressions.json`: 40 relevant suites, including rig/semantic/cancellation/continuity tests, culling, boss mechanics, campaign combat, saves, co-op and approved voice recordings.
- Screenshots: Brute anticipation/impact, King beam and real Hydra arena. Representative poses were visually inspected; the automated full roster checks do not establish subjective realism, fun, every-angle clipping or real-network timing.

The live-routing fixture initially called only the game's voxel render function and therefore inspected a stale Three.js frame. It now calls the existing exported renderFrame path, including postprocessing, batched draws, Three.js flush and deferred occluders, with separate frame timestamps. The Hydra check also asserts actual jaw variation so static finite geometry cannot pass as animation.

Human playtesting remains useful for how attacks read at speed and from different camera views. No FPS claim or paid generation.
