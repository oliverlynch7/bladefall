# Endless Dungeon quality pass — grounded plan

## [Codex | 2026-10-07]

`BFPrisonDungeon.layout` currently makes a ten-room floor with two required crossings and two optional vaults. Its seeded route is connected and already contains three boss arena styles. `BFPrisonRun.tick` owns encounters, reward receipts and checkpoints. `buildPrisonArt` merges one static mesh per material. These are sound systems to extend, while `G.endless` belongs to Abyssal Descent and is out of scope.

The quality gap is experiential: most rooms share a rectangular shell, the same activation/clear pattern, and similar material silhouettes. The current narrow HUD compresses navigation, health and reward intent into one line. This pass should make the prison readable as a place and each encounter's spatial decision different.

1. Introduce layout revision 7 for new attempts only. Keep revisions 1–6 layout/physics compatible for checkpoint resumes. Vary safe cover and tactical routes within the current connected graph. Every main passage remains class-neutral and traversable; collision and visual geometry derive from the same plan.
2. Give selected rooms a clear environmental job: an armory with shield cover, a chain-lift bay with a raised flank, a guard post with multiple sightlines, and an underworks cistern/refectory. Tie enemy packs and spawn sockets to that job. Keep wave count controlled and the one-chest policy intact; do not solve difficulty with HP inflation alone.
3. Add authored art on top of collision: prison fixtures, railings, pipes, banners, door thresholds and deliberate lighting accents. Keep draw calls and triangle count bounded. No invisible collision or false platforms.
4. Replace the compressed prison HUD with readable section, objective, progress and optional-reward cues. Avoid obscuring combat. Preserve the standard minimap and objective systems where they work.
5. Verify generated seeds and old revisions, safe spawn points, jump distances, roof/camera modes, co-op packet parity, checkpoint/reward isolation and previous-version save loading in a real browser. Capture representative views and leave human pacing/balance explicitly open.

## Implemented and checked

Revision 7 gives sections distinct refectory/cistern, chain-lift/watch-post, and armory/infirmary room pairs. Seeded entry rooms also alternate shield-store and guard-post variants. Each layout has corresponding collision, furnishings and enemy packs. Tier 2+ adds a Watch Captain to the last watch wave. Side vaults, sparse chest policy, the three boss arenas, persistent gold, class qualifications and 1.6x co-op health rule remain. Entrance posts replace the floating half-ring art in new runs; optional entrances get warm trim. Preparation now presents the three-section route, clear starting class/tier and permanent economy. A compact run HUD shows the current room, next objective, progress, HP, gold and nearby side route; the minimap/objective arrow follows the next required encounter.

Evidence: 1,080 deterministic revision-7 plans, 43,200 clear spawn sockets, six historical revision hashes, 60 actual browser-controlled jumps, three-section completion (two chests and 260 room gold per section), reward deduplication, health carry, victory/tier unlock, Tier-2 Watch Captain, campaign gold isolation, previous-build checkpoint/gold/HP resume and browser co-op packet/HP/checkpoint tests. Art builds at 9–10 draw calls and about 18–20k triangles for ten rooms; desktop and phone views inspected. The local static server's voice API requests return 404, unrelated to this gameplay pass. The older `qa-prison-routes-v6.cjs` has a stale pre-chest-update assertion expecting a chest pickup rather than the current direct-bag flow; the new focused run/jump tests cover current behavior.

Limits: these tests verify stability and physical reachability. They cannot establish the ideal run duration, difficulty, enemy feel or final art quality; Oliver's blind playtest remains the acceptance check. No SFX were added.

## [Codex | 2026-10-07] Optional traversal route, revision 8

Fresh runs now add a connected eleventh room off the late guard route in each section. Its broken floor requires five visible, physical jumps across a side gap; the route is optional and awards one persistent 120 x tier gold cache. On Tier 2 or higher it also contributes a class qualification seal. The three sections use distinct broken-rafters, pipe-gantry and sealed-catwalk names and materials. The HUD names the side route from the adjacent guard room and explains the cache objective inside it. A distant pickup marker disappears once claimed.

Revision 8 is new-run only. Existing revision-7 and older checkpoints retain their layout, art and path data. The main path, sparse chest economy and co-op host reward receipts are unchanged. There is no sound-effects work.

Evidence: 1,080 deterministic revision-8 layouts with connected side room and no geometry overlap; revision-7 golden hash unchanged; 108 real browser-controlled jumps across 18 seed/section combinations; one-time cache claims; 11-room art at 9-10 draw calls and about 20-22k triangles. A fresh revision-8 run completed all three sections, carried health, preserved campaign gold, unlocked Tier 2, and spawned the Watch Captain. Revision-7 run/jump/resume and co-op scaling/guest reward/checkpoint checks passed in the current browser build. The optional route screenshot was inspected at desktop size; visual richness and challenge still need a human playtest.
