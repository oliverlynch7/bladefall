# BLADEFALL — Quest completability: fix the placed-climb-fetch quests (work order)

> Follow `AGENTS.md`. Data/UX fix, stays voxel, no new systems.

## PLAYTEST RESULT (all 8 zones audited live, v1.81+)
GOOD NEWS: **every quest in every zone has its completion targets present** — kill dens
spawn their mob, drop-fetch mobs exist, find-objectives are placed. Nothing is missing.

THE ONE PROBLEM: the two **placed climb-fetch** quests feel uncompletable:
- **`hp2` Hollow Pass — "Recover 5 Sun-Bleached Bones from the rims"**: 5 bones are placed,
  but on top of an ascending pillar staircase up to **y=380** (pillars at y 323/342/361/380
  off a y=304 base ledge), deep north (z≈-1790), in a zone whose hazard is **gusts**.
- **`pl3` Sunspire Palace — "Gather 5 Gilded Relics from the terraces"**: same pattern,
  relics on garden planters at height.
Both are technically on a climb, but there are **no markers on the items, the climb is tall
and unexplained, and the gust hazard can knock the player off** — so players (rightly) think
it's broken. Verify the climb is actually intact end-to-end AND make it legible.

## FIXES
1. **Beacon every PLACED fetch item.** Add a bright vertical pillar-of-light / floating glow
   mote on each placed quest item, visible from across the area (color = zone accent). This is
   the single biggest fix — right now they're invisible dots on distant high pillars. (Only
   `placed:true` items — drop-fetch items don't need it.)
2. **Guarantee + verify the climb to each.** Every placed item must have a `climbRun` chain
   from the area's main walkable ground up to it, each step ≤ JMPV (94). Run the zonescape /
   reachability harness for the bones AND relics; confirm the **ground → base-ledge ascent is
   intact** (the y=0 → y=304 portion, not just the pillar staircase above it). Fix any gap so
   base-stats + single jump reaches all 5.
3. **Make the climb fair + front-loaded.** Put the **lowest 1-2 items at low/near-ground
   height** so progress starts immediately and the player understands the mechanic; cap the
   highest at a sane height. Ensure the **gust hazard has safe footing on the climb** (don't
   knock the player into a pit mid-climb — gusts should threaten, not hard-fail a required
   objective).
4. **Track it on the HUD.** Show placed-fetch progress clearly (e.g. "Bones 2/5") and a
   directional arrow / on-screen ping toward the nearest uncollected placed item, so the
   player always knows where to go.

## VERIFY (in a real browser via __BF3)
- Re-run the placed-fetch probe: in Hollow "The Dry Wash" and Palace "The Hanging Gardens",
  every placed item has a climb chain from ground (each hop ≤ JMPV) and the bot can collect
  all 5 on base stats + single jump.
- Beacons render on each placed item; the HUD progress + pointer work; gusts don't knock the
  player off a required ledge into a pit.
- Spot-check the other zones' quests still complete (kill dens refill to count, drop-fetch
  items drop, find-objectives reachable) — they passed the audit, just confirm no regressions.
- Bump `VERSION3D`, push, log in `UPDATE_ROADMAP.md`.

## REPORT
Confirm all placed items reach-verified with the climb chains, the beacons + HUD pointer
added, and the gust-fairness fix. Note any quest that still can't be completed.
