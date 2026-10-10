# Snowbound camp ridge — grounded change plan

The optional buried-camp reward currently asks the player to read a notebook and press three adjacent markers in the order 1, 3, 2. From the player's hands, this is the same short combination task as many other campaign puzzles. The notebook, chest, Winter Cloak, and FF-02 Rift Shard are worth keeping; the input is not.

Replace the live markers with a visible, climbable line of existing mountain rock and weathered survey timber. The notebook points to the old rig above the camp in one short sentence. A player follows uneven ledges around the ridge, with a lower catch shelf and a recovery path after a missed jump. Reaching the high anchor and releasing it pulls the cover off the nearby cache. The chest and FF-02 sit at the top so the climb itself earns the reward, without another trip back to the NPC or a button-order guess. The cover visibly changes and the chest opens through its current interaction.

Keep `ff.camp.found`, `ff.camp.open`, `ff.cache`, `FF-02`, and Winter Cloak identifiers. Old `ff.marker.*` inputs are retired; old partial sequence values in saves are ignored. A previous save with the camp already opened or chest claimed must remain usable. The main Snowbound crossing and signal route do not change. Co-op uses the existing host-authoritative world-action flag and separate personal Rift Shard collection.

Verify from the normal camera: notebook clue, exposed route, several real jumps, a failed jump and climb recovery, the release's visible effect, chest/shard, previous save, and host/guest flag sharing. Browser reachability is not a claim that the route's challenge or visual quality is final; Oliver's playtest remains the acceptance gate.

## [Codex | 2026-10-10] Implementation and verification

The live optional camp now has seven uneven landings built with the mountain's existing rock and survey-timber forms. The notebook and Heath describe the climb. A final release makes the visible cover slide off; the same Winter Cloak chest and FF-02 are on the reward shelf. The release is no longer offered after opening, including on prior saves. Existing partial marker progress is ignored, and an older notebook entry is refreshed with the ridge clue.

Browser QA completed all seven landings with held jumps, deliberately missed a landing and recovered, then released the rig, opened the chest, and picked up the shard. The full Snowbound route, co-op story sharing with personal shard collection, death/checkpoint banking, and older partial/open save reloads passed. Normal-camera views were checked at the notebook, middle ridge, and reward shelf; the shelf was widened and the old overhead marker frame removed after early screenshots showed blocked sightlines. The procedural rock and chest art are functional but are still subject to Oliver's judgment of visual quality and difficulty in play.
