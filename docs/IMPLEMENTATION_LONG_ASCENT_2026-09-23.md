# Long Ascent implementation plan

Baseline 58b33e7 / 2.020.0. Castle Duskmoor half two replaces the legacy stairs. Two great turns around a central tower, broad defended landings, an outside broken-stair bypass and concealed service branches. Explicit storey heights must survive spawning, loot seating and movement. Reuse castle kit with open camera views. Required two latching controls work sequentially solo; optional Miles/worker rescue opens service passage and vault access. Independent captive controls preserve the main path and CD-04 without speaking to Miles. CD-03 mechanical service vault, CD-05 hidden upper memorial. Boss entry banks all pending shards.

Story reveals the King's preparations, not the Bladeborn reveal, second transformation or ending. Miles is a living servant, dry and practical. Few meaningful choices and optional clues; recording-ready voice metadata. The final King and restoration remain a separate batch.

Verification: actual controller ascent and outside traversal; enemies and drops stay on their floor; required catches, independent rescue and vault puzzle; pause/resume dialogue, journal/tracker, co-op authority, checkpoint rollback, old save, desktop/phone WebGL previews. Publish only after those checks. No claim of final boss completion.

## Implemented and verified

2.021.0-long-ascent. Castle half two now has two spiral turns climbing 2,000 world units, distinct flat landings, exposed broken-flight detour, service rooms, prisoner landing, returning vertical service lift, two independently latching required catches, a four-mark wheel vault and hidden upper memorial. Six limited healing pads, sixteen ordinary guards with melee/caster/heavy variety. Miles is optional; cell release works without meeting him. Rescue opens the lift and service-wheel puzzle. CD-04 is a shared rescue reward; CD-03 and CD-05 require individual physical collection. Boss entry secures all three and the existing Refuge ramparts upgrade. This uses the established visible ramparts reward; no new combat stat bonus was invented.

Nine new Miles lines (301 catalog total), with recording direction, leave/resume, refusal/apology and humor. New clues use the existing journal notice and optional tracker. Ten WebGL previews include phone dialogue. Existing recordings remain untouched.

Validation: 260 actual-controller waypoints; nine browser combat/lift/rescue assertions; eight two-context co-op checks; three death/checkpoint/boss-entry checks; pre-update save retained gold/rank/clue without a duplicate notice; all story/authority/shard/Hall/music/cache/voice tests passed. Emberdeep, Sky Library, Castle Gates and Descent WebGL smoke checks passed. Phone dialogue had no horizontal overflow. Controlled co-op transport is not real network-latency testing; difficulty still needs human playtesting.

QA corrections: stacked-floor seating for enemies, chests and loot; flat landing transitions and narrower step collision; guarded spawn heights resolved against the actual nearby floor; no generic decorative purple arch in the tower; camera-obstructing outer supports removed; repeated architecture instanced. Final architecture has 67,084 shared-kit triangles plus 8,760 custom triangles, with 24 additional batched draw calls. Stair collision tiles are hidden and replaced by inexpensive instanced visual steps. Not a full mobile performance certification.

Remaining: the new final King arena, partial/full Void phases, single imposing central Gate presentation, Ian/Space-charge/restoration ending, dragon reward and broader campaign polish. The boss entry still leads to the existing final encounter until its dedicated batch. This ship does not finish the entire approved queue.
