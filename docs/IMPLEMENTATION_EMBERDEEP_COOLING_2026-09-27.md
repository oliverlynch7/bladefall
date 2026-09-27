# Emberdeep cooling and traversal — 2.048.0

The Great Furnace retains its established round-tank, square-channel, triangle-drain order and Martin dialogue. Opening the channel now requires defeating its guard, then water lowers a physical heat gauge. The drain stays blocked until the pale safe band is reached (about 4.45 seconds). Wrong-order attempts still reset safely. Discovered pipe notes receive current instructions; completed puzzle flags remain valid.

The cooled main crossing has two broken sections for modest jumps, with a lower catch platform and automatic return after a missed jump. The optional high pressure route has six narrower stepping platforms with catch ledges. Iron Halls already has timed pressure/hammer machinery and is unchanged.

## Validation
- Story-engine regression: four main paths, rescue prerequisites, safe resets and optional rewards passed.
- Real browser: 80 route waypoints with single-jump movement, main/optional quest completion and provisional rewards passed.
- Focused browser: live guard gating, early drain rejection, gradual heat reduction, remote heat gating, safe completion, fall return and dead-player recovery exclusion passed.
- Two-browser controlled co-op relay: shared cooling/exit, dialogue pause, reward dedupe, personal shards and boss-boundary rewards passed. This is not a real-network latency test.
- Pre-change HTML save fixture retained rank, gold, pets, hub state, clue, checkpoint and speech settings. Auxiliary modules were current, not an archived deployment.
- Syntax checks passed. Inspected gauge and bridge screenshots; corrected gauge height and made it readable from both sides.

Evidence: docs/qa/emberdeep-cooling-2026-09-27.json. Terrain tests isolate traversal by disabling/stunning enemies and do not establish natural combat difficulty. Broader campaign overhaul remains ongoing; art overhaul and custom SFX are deferred.
