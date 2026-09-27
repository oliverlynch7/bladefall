# Duskmoor ascent continuation — 2.050.0

Added a second outward-bending upper flight with two missing steps and catch ledges. The spiral now contains four required gaps. Added four narrow rising stones on the optional memorial route. Kept the tower height, broad combat landings, disguise questions, assault waves and finale unchanged.

Bridge catches now show released chains and a raised bridge panel before lowering. Vault wheels show pale target marks, gold position pointers and withdrawing bolts. Existing two/three-turn solution and completed flags remain; this is physical feedback, not a new puzzle algorithm. Notes update both on discovery and for existing discovered entries. No recorded dialogue changed.

Validation: Node ascent and castle story suites pass (quiet, recovery, assault, optional branches, reward parity and finite waves). Browser: 259 ascent waypoints with single jumps, 43 castle waypoints, both new gap recoveries, gates/patrols/disguise/shards pass. Controlled two-browser co-op passes shared rescue, individual physical shard, vault/lift, guest catch, throne doors and checkpoint rewards. Pre-change HTML save preserves rank/gold/pets/hub state/clue/checkpoint; current auxiliary modules were used. Syntax and visual checks passed.

Traversal tests disable enemies and do not establish natural combat difficulty. Co-op uses controlled relay, not internet latency. Existing test helpers were updated to reopen conversations after the approved leave-conversation behavior. Evidence: docs/qa/duskmoor-ascent-2026-09-27.json. Broad campaign playtesting, other puzzle variety and deferred art remain outstanding; no custom SFX changes.
