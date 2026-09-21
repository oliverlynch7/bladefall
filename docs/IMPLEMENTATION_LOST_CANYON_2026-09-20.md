# Lost Canyon implementation

Authority: approved Campaign Expansion Plan section 2 and current requirements/canon. Scope: Hollow Pass part two. The Marksman arena/HP-05 remains the next batch; do not claim full region completion.

Inspected loadArea, briar* shared story/authority/reward/checkpoint flow, hollow-cliffs geometry and hollow-art footprint subtraction, NPC kit renderer and Voice API catalogs. Existing Lost Canyon still uses the old bone/shrine collection objectives. Replace those with an authored holding basin. Reuse sandstone art, character kits, host-owned story events, personal shard ledger and half checkpoint boundary.

Terrain first: elevated arrival and records side room, front gate, roof approach, broad holding yard, two required cage groups, raised alarm winch, Ruth's shelter, optional western cage, freight rail puzzle and wagon-blocked eastern cave loop with climbing return. Limited healing at junctions. Required paths remain reachable without a class-specific skill. Freed groups visibly walk to shelter and unlock a shortcut. A finite alarm response has a visible warning and cannot spawn during conversation pause.

Ward follows standing orders: inspected paperwork enables a redirect, unsupported bluff triggers a finite guard response, and combat/side paths prevent a softlock. Ruth supplies rescue purpose, optional consequences and an understandable way to repair a curt first exchange. HP-03 is a shared optional rescue reward; HP-04 is a personal physical rail-puzzle shard. No premature King location, Bladeborn confirmation or soul metaphysics.

Write stable voiced lines only for this playable content. Test main/alternate routes, dialogue consequences/repair, alarm guards, movement/height, personal versus shared rewards, duplicate packets, late shared state, half restart/banking, and phone dialogue. Publish once after checks and real rendered previews. Do not alter production saves or recordings during verification.


## [Codex | 2026-09-20] Lost Canyon — 2.003

Implemented the approved second-half holding basin: elevated arrival, records branch and guarded front gate, upper bypass, two required cage yards, raised alarm winch, shelter/escape gate, optional old cage, rail-direction puzzle and wagon-clearing cave loop with a high return. Four limited pads, placed guards and wildlife, a finite two-guard alarm response. Six prisoners visibly leave through opened doors and walk to shelter; rescue opens a shortcut. Ward follows standing orders (paperwork, failed bluff, combat or side route). Ruth has a curt-response consequence with water-based repair; required progress never locks. HP-03 is the shared optional rescue reward; HP-04 is individually collected behind the rail puzzle. No premature lore revelation.

16 stable Ward/Ruth lines with recording direction in story/lost-canyon.json, merged into Voice Studio (119 total). Existing line IDs/takes are unchanged. New conditional story effect keeps alarm choice atomic. Shared snapshots include guard availability, prisoner positions and alarm warning time. Existing half-boundary save rules retained.

Validation: 253 elevation-aware movement waypoints; ten quest/world checks; ten controlled two-browser co-op checks; six checkpoint/reload/banking/echo checks; six bluff/alarm checks; pure Lost Canyon, story-state, authority and Voice API tests. Removed a supply prop blocking the east approach. Five actual renderer screenshots, including 390px dialogue without overflow. Initial visible scenery: 34,060 triangles / 40 chunk draw calls (not a whole-game performance benchmark). Controlled traversal uses invulnerability/frozen enemies; this is not a combat balance certification or internet co-op soak.

Private source archive ../../decision-archive/2026-09-20-lost-canyon: 149 user-role messages, zero unparsed lines, valid source references. Latest user requested another long efficient session. One coherent release. Next: Marksman split-crossing arena and HP-05; legacy Ninja access remains until all five shards are converted. Broader campaign, trial arena/co-op, Pyromancer, music, cosmetics and remaining queue stay open. No claim of full Hollow Pass or campaign completion.

Visual review also found the legacy obstacle pass drawing collision-only cage slabs. It now honors `invisible`, revealing the bars and prisoners while retaining collision. Cage routes lead through the open front doors before following escape paths.
