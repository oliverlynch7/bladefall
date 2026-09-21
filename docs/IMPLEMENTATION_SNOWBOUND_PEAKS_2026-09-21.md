# Snowbound Peaks implementation

## [Codex | 2026-09-21] Approved scope

Source: CAMPAIGN_EXPANSION_PLAN section 4 and requirements STORY-18. Build Frostfell part one around Heath, the trail to Ellis, a heater repair, a signal reflector, and a buried explorer camp. Ellis has just been captured in his secret ice laboratory; his rescue is part two, not an encounter on the mountain. No early Bladeborn confirmation or Sunspire revelations.

The mountain has a broad lower basin, climbing switchbacks, a separate exposed lift-house branch, a sheltered alternative, a high camp and a final snow bowl. Raised routes use real collision and recovery shelves. Reuse the Frostfell kit with outdoor lighting, timber shelters and deliberately placed landmarks. No global cold timer or unlimited healing. Wind only affects a marked exposed crossing and has a quiet interval before each gust.

Heath introduces the trail and accepts the recovered heater part. Repair visibly warms his shelter and lowers its crossing. A reflector puzzle uses recognizable carved shapes; a separate optional marker puzzle rewards the winter cloak and access to FF-02. FF-01 is behind a broken flag on the shelter roof, reached by a side climb. Both are individual physical pickups; they bank only on entering part two. The cloak also becomes permanent at that boundary.

Integrate shared story transactions, journal clues, objective tracking, conversation pause, fixed voice IDs and the voice studio catalog. Main progress cannot be blocked by a rude dialogue choice. Validate puzzle gates, retry behavior, controller routes, rendered scenery, catalog and production deployment. The caves and three-officer boss remain the next batch.

## [Codex | 2026-09-21] Snowbound Peaks implemented — 2.008

Frostfell part one now uses authored climbing routes, a sheltered bypass around the exposed lift-house crossing, a heater delivery to Heath, a repair that lowers the main crossing, a shape-based signal puzzle and a buried camp marker puzzle. FF-01 requires a narrow jumping route behind the shelter flag; FF-02 appears at the camp chest and remains a personal pickup. The winter cloak and collected shards become permanent at the cave boundary, not on discovery. The return winch lowers a stepped shortcut; it is labeled return steps rather than pretending to be a moving lift.

Heath is the only mountain NPC and has ten stable recording IDs. Voice Studio now has 155 lines. His blunt conversation branch rejoins the required quest; conversations resume and pause both co-op players. Clues are shown on discovery and kept in the Frostfell journal. No new Bladeborn, Sunspire or final-cut revelations. Ellis's freshly captured laboratory rescue belongs in the next part.

Validation: story transaction/voice graph tests, voice API regression, shared enemy module cache test, classic inline syntax; browser 50 walking/jumping waypoint checks and eight runtime progression assertions; four death/checkpoint assertions; seven two-context co-op assertions. Both clients receive repair/puzzle changes and the banked cloak, but physically collect their own shards. No captured browser errors. 390px dialogue has no horizontal overflow. Frost scenery is about 25,628 triangles total with spatial chunk culling; this is not a device performance benchmark. Combat difficulty was not balanced by these invulnerable route tests.

Five new browser screenshots are in the public campaign gallery (57 total). Private conversation archive updated outside Git: ../../decision-archive/2026-09-21-snowbound — 155 user messages, zero unparsed lines, valid references. Existing approvals remain authoritative; this batch does not complete the campaign or wider queue. Next: Deep Ice Caves terrain, Ellis's capture/rescue, Hugo, environmental machinery, remaining three Chronomancer shards, then the coordinated three-officer boss.
