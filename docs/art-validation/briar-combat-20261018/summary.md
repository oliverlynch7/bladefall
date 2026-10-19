# Briar Town combat pass


## [Codex | 2026-10-18] Briar combat pass — v2.289.0

U-BRIAR-COMBAT-20261018 implemented in the live campaign (not beta): authored opening raider then guard; two finite enemies at Millrace Ford and two on the Black Woods approach. No terrain/quest layout, starter trial, PvP or other-region tuning changes. Fixed role health (runner1.22/guard1.4/hex1.18, once only, preserving HP fraction), faster role movement and shorter recoveries. Troop attack starts require line of sight and share a local pressure budget (two solo, three co-op; nearby existing boar winds/rams count toward it); generic wildlife AI remains unchanged. Ordinary troops return toward their spawn when pursued beyond900 units without healing; committed attacks still finish. Recovery hits +15%, one opening cue per attack, substantial surviving hex hits interrupt the cast. Amber/purple warnings retain their colors instead of washing white; green recovery marks show openings.

Brute recovery now takes full damage to match the attack-now cue; cart guard/stagger and finite two handler waves remain. Later phases mix in ground waves at greater range; ring warning matches250/310 reach. Charge preview and real charge share cart, physical collision and supported-foot checks; cached preview avoids repeated static scans. Wall/edge stops recover without granting a free cart stagger.

Validation:23 targeted suites pass, including75 Briar policy/geometry checks plus three phase variants,28 swept charge previews/frame rates, existing boss tactics, party transitions, farming/progression/mana/sound/loot/onboarding tests. Actual muted WebGL Chrome: warrior/ranger/mage basic attacks defeat the opening raider; every role cycles wind/strike/recover, standing receives16/20/22 damage across the probe while sidestepping receives0; cover prevents a hex wind (serial0). All new/moved patrol footprints supported and no unresolved placements in either half. Cart charge produces stagger; arena-wall charge stops in recover with maximum observed step9.92 units (no teleport). Level100 legacy save enters the new campaign without reset. No console errors observed. Controlled tests are not a human novice balance/fun verdict or two-human network soak; existing co-op scaling/authority retained.

## Encounter intent

| Beat | Intent | Placement |
| --- | --- | --- |
| Village watch | Meet a mobile raider, then a guard | (110,-520), (230,-910), ground |
| Mill | Keep the crate and water puzzle readable | No extra enemies at its controls |
| Millrace patrol | Mix melee pressure with a caster after the crossing | (20,-2570), (-110,-2810), ground |
| Forest searchers | First fight earlier on the forest approach | (65,-690), (-165,-930), ground |
| Optional farms | Preserve grind and raid leader | Existing slots and25-second replenishment unchanged |
| Brute | Bait cart impacts, punish recovery, jump wider later rings | Existing Trampled Orchard arena |

The additions use existing models and SFX. No new particle layers or per-frame scene rebuild. This is not an FPS benchmark. Screenshots use a controlled warning setup; browser action probes use real update/damage code with other enemies held still to isolate the measured attack. Defense test sidestep uses ordinary right-movement input. Legacy test uses isolated Map-backed storage; user saves are untouched. Starter damage probes are input smoke checks, not a complete earned-equipment campaign simulation.
