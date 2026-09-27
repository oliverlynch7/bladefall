# Sunspire light relay and roof ascent

Version 2.047.0-sunspire-light — 2026-09-27.

## Implemented
- The courtyard now shows a single cardinal sunbeam reflected through three spatially arranged mirrors into the library receiver. Wrong angles send the beam to the terrace edge; mirrors beyond the break stay unlit. Reflection geometry, lit mirrors and receiver state agree with the existing mask-5 solution.
- Two-position mirror controls, prior solved flags and main defense gates remain compatible. This is an optical routing presentation/interaction overhaul, not a new four-position mirror system.
- Correct light-specific feedback replaces misleading attached-weight messages. Discovered clues migrate to the new wording. Sun marks remain at the receiving mirrors and final receiver, keeping Victor's existing recorded directions applicable; no NPC wording or voice IDs changed.
- The optional memorial roof approach gains four rising jumps, before the existing final roof jumps. Lower catch ledges permit retreat to the previous step and another attempt. The main route and SP-01 reward are unchanged.
- Corrected a stale palace unit-test assumption: after a dialogue loop closes, Grace resumes at her repair choice. The game dialogue behavior itself is unchanged.

## Verification
- Node: all eight optical states and 24 switch transitions, ray continuity and receiver consistency, saved solved state, light feedback; palace's four defense combinations and garden reward/repair; generic story authority/state and puzzle guidance pass.
- Chromium/WebGL: 50 campaign route waypoints, restored healing pad, upper guard gates/lower bypasses, mirror exit and garden reward pass. Roof uses one ordinary jump.
- Three deliberate falls land on catch ledges and recover via previous steps. Direct jumping through the underside of a platform is blocked as expected.
- Controlled two-browser packet relay: guest mirror action, shared exit, separate roof shard, garden reward and transition banking pass. This is not an internet latency test.
- Pre-change HEAD HTML creates a save; current HTML resumes currency, class rank, pets, NPC state, speech preference and clue. Auxiliary modules are current, not a full archived build.
- Visual screenshots reviewed for complete reflected beam and rising stones. Syntax and whitespace checks pass.

Evidence: qa/SUNSPIRE_RELAY_2026-09-27.json. Traversal tests isolate terrain from enemies; novice difficulty and combat balance still need human playtesting. Wider campaign puzzle overhaul remains ongoing.
