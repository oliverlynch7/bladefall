# Shared floor overlap correction

Continuation authorization: user requested another long efficient implementation session; FX-02 remains approved. Inspection found buildGround in world3d.js only discards tiles fully buried by earlier segments. Partially intersecting segment tiles still overlap at identical elevation. Newer themed builders already use surface-regions.claimSurface.

Plan: use the existing disjoint rectangle helper before shared ground tiling. Preserve collision segments, floor elevation, theme, texture selection and draw batching. Verify area coverage and no positive-area coplanar overlap for crossing/contained/touching rectangles, then browser-check campaign scene construction and fallback mode rendering. This is a bounded shared-floor correction; do not call the entire global near/far/moving-surface review complete.


## 2.031 validation and scope
Shared fallback ground now splits partial segment overlaps before tiling. Keep roof crossbeams were emitted once per supporting post (two copies per beam); both the upper Keep and prison loops now emit each beam once. Frost mountain supports now deduplicate identical x/z/size/top bodies while retaining every collision obstacle.

Browser inspection covered 24 campaign scenes (two halves and boss per eight zones), with no page errors. Refined instance scan ignores unused capacity and zero-scale occlusion instances. Six duplicate Frost peak meshes and four duplicate Keep beams were found; corrected Frost and Keep part1 passed the full scan, and targeted prison recheck returned zero duplicates after its final correction. Stored JSON is the scan before the final two prison beam fixes, deliberately retained as evidence. Exact-transform scans do not detect every partial intersection.

Shared floor fixture:253 rendered instances in one draw call. Rectangle test verifies11100 units of union area, no positive-area overlap and sampled coverage. Pre-change save retained gold, rank, companions, return state, hub introduction, checkpoint and clue. Syntax/diff checks passed. No gameplay, collision, dialogue or progression changes.

Remaining: near/far moving-camera review of decorative intersections, transparent layers and boss effects. This batch is not a claim that every flicker across the game has been eliminated.
