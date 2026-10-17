# Campaign threat and enemy meters — v2.217

User observed basic Mage attacks killing nearly everything in Briar and Hollow in one hit, plus an easy Brute. Actual pre-change Normal health was 20 HP for a first-area grunt versus 39 damage from a level-3 common Fire Staff Mage. The old stage curve added only 22% per tier.

Fixed health multipliers by zone: 3.0, 3.2, 3.5, 3.8, 4.1, 4.4, 4.7, 5.0; second halves add 8%. Applied once at spawn after existing difficulty/region/party factors. Early boss multipliers: 1.65, 1.30, 1.15, 1.10, 1.05; later bosses retain their established HP. Boss-type health and ordinary units are separate. Hydra restraints use ordinary spawn HP before their authored multiplier; the complete encounter has multiple restraints and guarded exposure windows. Frost officers derive their squad health from the boss caster. Raw boss HP / ordinary attack rows are comparison figures, not measured boss time-to-kill.

Ordinary campaign damage multiplier is 1.10 + zone-index×0.12 + 0.04 for second half. No boss damage increase or shortened dodge tells. Tutorial, earned trials, sparring, PvP, side modes and isolated beta excluded using real campaign predicate tests. Two-player HP stays 1.6×, with remaining-health percentage preserved on join/leave. Fixed region curve, no scaling to player gear/level, preserving earned power and easy revisits.

24 real-browser damage-pipeline samples, all three starter classes across eight zones, deterministic affixes, expected levels 3–24 and common/uncommon/rare gear. No offensive nerfs: outgoing basic damage identical in all 24 before/after samples. Ordinary Mage hits are now two rather than one at these reference builds. Slow heavy weapons, skills, crits and better-than-reference gear can still kill weak targets quickly. Warrior/Ranger early soldiers take four/five hits rather than two, then five/six in Hollow. Specialized higher-HP enemies preserve their durability ratios.

| Zone | Class | Level | Basic damage (unchanged) | Soldier HP | Basic hits |
|---|---|---:|---:|---:|---:|
| 1 | warrior | 3 | 18 | 20 → 59 | 2 → 4 |
| 1 | ranger | 3 | 12 | 20 → 59 | 2 → 5 |
| 1 | mage | 3 | 39 | 20 → 59 | 1 → 2 |
| 2 | warrior | 6 | 19 | 24 → 77 | 2 → 5 |
| 2 | ranger | 6 | 13 | 24 → 77 | 2 → 6 |
| 2 | mage | 6 | 44 | 24 → 77 | 1 → 2 |
| 3 | warrior | 9 | 37 | 29 → 100 | 1 → 3 |
| 3 | ranger | 9 | 23 | 29 → 100 | 2 → 5 |
| 3 | mage | 9 | 64 | 29 → 100 | 1 → 2 |
| 4 | warrior | 12 | 40 | 33 → 125 | 1 → 4 |
| 4 | ranger | 12 | 26 | 33 → 125 | 2 → 5 |
| 4 | mage | 12 | 71 | 33 → 125 | 1 → 2 |
| 5 | warrior | 15 | 45 | 37 → 153 | 1 → 4 |
| 5 | ranger | 15 | 29 | 37 → 153 | 2 → 6 |
| 5 | mage | 15 | 79 | 37 → 153 | 1 → 2 |
| 6 | warrior | 18 | 65 | 42 → 183 | 1 → 3 |
| 6 | ranger | 18 | 42 | 42 → 183 | 1 → 5 |
| 6 | mage | 18 | 113 | 42 → 183 | 1 → 2 |
| 7 | warrior | 21 | 73 | 46 → 216 | 1 → 3 |
| 7 | ranger | 21 | 47 | 46 → 216 | 1 → 5 |
| 7 | mage | 21 | 125 | 46 → 216 | 1 → 2 |
| 8 | warrior | 24 | 81 | 50 → 251 | 1 → 4 |
| 8 | ranger | 24 | 51 | 50 → 251 | 1 → 5 |
| 8 | mage | 24 | 139 | 50 → 251 | 1 → 2 |

Nearby full-health enemies show red meters (780-unit normal range, longer for bosses/damaged/elite targets), with neutral training meters and friendly green bars preserved. Width increased from 32 to 46 CSS pixels. Elite gold frame/title retained with red HP fill. Height-aware segment-vs-solid occlusion caches for 120ms maximum and invalidates with camera/actor movement. No through-wall markers, no per-frame canvas resize, no new WebGL draw calls. Tutorial attack lesson names the red bars.

Real WebGL proof: two full-health 59/59 guards have red bars; adding a solid wall hides the central guard bar while an unobstructed guard remains marked. Synthetic host party case: solo 59 → duo 94 with 37% health retained → solo 59 with 37% retained. Old save retains level 4 / XP 52 / Warrior rank 4 / class XP 1015 / gold 1145. Near-combat render sample: 235 Three draw calls, mean main CPU/render submission 3.59ms in this test runtime, no model errors. This is not a user-hardware FPS guarantee. No native two-device co-op or complete natural boss fight / fun claim.

Tests: 60 campaign threat/occlusion/scope checks; 146 boss target cases and encounter/Hydra damage replication; pause 25; enemy culling 15; first arrival 20; creator camera 14; progression 43; audio preservation 255. Build local before/current pages with `python scripts/build-campaign-durability-qa.py`; add `scenario=near|wall|coop|save` to current fixture for focused checks. Storage is in-memory and cannot overwrite real saves.
