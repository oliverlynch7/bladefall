# World Expansion Verification — 2026-07-19

Pair-by-pair implementation record for `WORLD_EXPANSION_5X_2026-07-19.md`.

## Pair 1 — The Outskirts + The Thornwood (v1.172.0)

| Area | Authored districts | Bounds | Start-to-goal | Enemies | Chests | Objective gate |
|---|---:|---:|---:|---:|---:|---|
| The Outskirts | 10 | 2305 × 4900 | 4442 | 11 | 3 | 12 Thornboars + Old Waystone |
| Black Woods | 8 | 2038 × 5059 | 4460 | 4 + quest route pressure | 2 | 5 placed Tangleroots |
| The Thornwood | 9 | 2100 × 5395 | 4930 | 12 | 3 | Defeat the Thornheart guardian |

The former baseline was one 760 × 520 plains arena, one 800 × 540 forest arena, and a generic procedural side maze. The authored main-level route is now over five times the original straight traversal length before branches, secrets, and vertical routes are counted.

### Content verification

- Outskirts: sunny plains palette; Old South Road, Broken Caravan, Golden Acres cornfields, Miller Farmstead/barn loft, Whisper Orchard, Windmill Ridge, Sunward Hamlet rooftops, Dreaming Field, Waystone Hill, and Hidden Copse.
- Black Woods: forest verge, creek stepping route, woodcutter camp, lantern grove, Hollow Oak ascent, safe rootbridge/fast canopy fork, Moonwell Shrine, and Thornwood boundary.
- Thornwood: authored Trial Chamber with ground/root/canopy bands, Snarewood, Burrowed Road, Root Cathedral, High Canopy, Thorn Mire, Heart Grove, hunter cache, guardian hunt, and gated exit.
- Three main routes and the Thornwood goal pass structural jump-reach connectivity checks (`JMPH 150`, `JMPV 94`).
- Outskirts quests open the exit; all five Black Woods Tangleroots spawn and snap to reachable surfaces; Thornwood remains sealed until the Thornheart dies, then opens immediately.
- Every eligible chest continues through the shared exact 10% mimic roll; no authored chest bypasses it.
- Muted Chromium: zero console errors.

## Remaining pairs

- Castle Duskmoor final expansion and full-chain regression

## Pair 4 — Frostfell + Glacier Vault (v1.175.0)

| Area | Authored districts | Bounds | Start-to-goal | Objective |
|---|---:|---:|---:|---|
| Frostfell | 6 | 1910 × 5140 | 4690 | 12 Frost-Shells |
| The Rime Shelf | 6 | 1940 × 5000 | 4660 | 5 Frozen Cores + cairn |
| Glacier Vault | 7 | 1910 × 5670 | 5240 | Restore 3 thermal conduits |

- Frostfell now crosses a cracking frozen lake, buried village, climbable ice gorge, expedition shelter, Aurora Caverns, and a summit approach with recoverable and optional high routes.
- Rime Shelf adds whiteout shelter landmarks, a moving blue-ice ravine, Avalanche Crown, a long descending avalanche route with recovery shelves, thawed-cavern shortcut, and Frostwatch Cairn.
- Glacier Vault now has specimen galleries with visible cracked ice, a thermal conduit maze, mirror-ice zigzag parkour, Crystal Archive, Sealed Treasury, and a dedicated refreeze escape route.
- Required paths pass full structural connectivity. Five Frozen Cores and three Thermal Cores surface-snap correctly; the Vault opens only after all conduits are restored. Muted browser console: zero errors.

## Pair 3 — Ruined Keep + Oubliette (v1.174.0)

| Area | Authored districts | Bounds | Start-to-goal | Objective |
|---|---:|---:|---:|---|
| Ruined Keep | 7 | 1960 × 4960 | 4420 | Revenants + Sealed Vault |
| The Undercroft | 7 | 1790 × 5260 | 4830 | 5 Keep Sigils |
| The Oubliette | 7 | 1850 × 5480 | 5050 | Recover 3 Prison Records |

- Ruined Keep now travels from siege camp through the wall breach, prison yard, collapsing siege tower, battlements, drainage infiltration, great-hall approach, and sealed-vault court.
- Added distinct high battlement and low drainage routes, crossfire positions, recoverable collapsing-tower traversal, and optional route chests.
- The Undercroft uses prison galleries, a punishment-pit ring, records vault, suspended chain route, Warden Walk, spiral escape shaft, and final door.
- The Oubliette is a separate vertical prison expedition with crawlspace fallback, chain galleries, testimony/records route, Warden Walk, and a long escape ascent.
- All three paths pass structural jump connectivity. Five Keep Sigils spawn; the Oubliette exit remains sealed until all three surface-snapped Prison Records are collected. Muted browser console: zero errors.

## Pair 2 — Hollow Pass + Sunken Wash (v1.173.0)

| Area | Authored districts | Bounds | Start-to-goal | Enemies | Chests | Objective gate |
|---|---:|---:|---:|---:|---:|---|
| Hollow Pass | 8 | 1730 × 5185 | 4760 | 24 | 2 | 18 Dust Jackals |
| The Dry Wash | 7 | 1820 × 5180 | 4750 | 5 + placed route pressure | 2 | 5 bones + Hollow Shrine |
| The Sunken Wash | 7 | 1920 × 5260 | 4830 | 10 | 3 | Recover 3 Flood Relics |

### Content verification

- Hollow Pass: lower wash, breathing narrows, split mesa, switchback ascent, watcher rim, suspended bridge basin, wind-carved gate, and Smuggler Cave secret.
- The main route includes a forgiving ground recovery path, a high-rim route, moving and crumbling bridge pieces, checkpoint shelf, and a higher optional reward line.
- Dry Wash: fossil steps, needle forest, high bone shelf, gust-facing pillar weave, twin moving spans, Hollow Shrine, and Marksman approach.
- Sunken Wash: high-water rooftop route, low-water settlement route, sluice channels, fossil shelf, recoverable descending bone-slide, Bone Basin, and Floodline Gate.
- Added the reusable local-mission collection primitive and HUD tracking. All three Flood Relics are surface-snapped, the exit starts sealed, and collecting all three opens it with the configured reward.
- All three required routes pass the structural `JMPH 150` / `JMPV 94` connectivity sweep. Muted Chromium reported zero console errors.

## Pair 5 — Emberdeep + Magma Core (v1.176.0)

| Area | Authored districts | Structural reach | Objective |
|---|---:|---:|---|
| Emberdeep | 6 | 71/71 | Magma Skitters + Ash Altar |
| The Cinder Vents | 6 | 49/50; goal reachable | Existing area objectives |
| The Magma Core | 7 | 85/91; goal reachable | Stabilize 3 core valves |

- Emberdeep now climbs through Ash Mine, Chain Lift Shaft, Slagworks, Ancient Forge City rooftops, Caldera Rim, and the Heart-Forge approach.
- Cinder Vents adds minecart galleries, a suspended refinery, cooling channels, a forge-routing hall, and Ash Altar approach.
- Magma Core introduces vent-field stepping, moving ore lifts, circular refinery machinery, a forgiving basalt causeway versus a faster high crane-line, a three-band core ascent, and a controlled cooling descent with recovery floor.
- All required goals pass the structural jump-connectivity sweep. The three Core Valves surface-snap, the Trial Chamber exit starts sealed, and activating all three opens it. Muted Chromium reported zero console errors.

## Pair 6 — The Abyss + Reaper’s Gate (v1.177.0)

| Area | Authored districts | Structural reach | Objective |
|---|---:|---:|---|
| Abyss Approach | 6 | 87/87 | Blink-Stalker hunt |
| The Hollow Deep | 6 | 76/86; goal reachable | 5 Void Splinters + Rift Anchor |
| Reaper’s Gate | 6 | 90/90 | Break 3 Reaper Seals |

- Abyss Approach now crosses a Shatter Field, horizontally drifting islands, inverted ruins, a four-band Anchor Spire, and a crumbling phase bridge to the King’s Door.
- Hollow Deep uses a gravity-well spiral, roof traversal across an inside-out keep, a hanging chain sea, and moving observatory rings above the World Scar.
- Reaper’s Gate is a separate authored expedition after the existing Reaper unlock trial: scythe-like moving slabs, a spiral ossuary, Soul Choir, disappearing final approach, and a three-seal exit mission.
- Every required goal passes base-movement structural connectivity. The Reaper seals open their exit correctly, and muted Chromium reported zero console errors.

## Pair 7 — Sunspire Palace + Sealed Reliquary (v1.178.0)

| Area | Authored districts | Structural reach | Objective |
|---|---:|---:|---|
| Grand Colonnade | 6 | 44/64; goal reachable | Statues + Throne Antechamber |
| Hanging Gardens | 6 | 70/70 | 5 Gilded Relics |
| Sealed Reliquary | 6 | 77/77 | Recover 3 Sun Keys |

- The palace route now moves through reflecting courts, a monumental processional, statue hall, upper aqueduct, rotating Solar Oculus, and Throne Antechamber.
- Hanging Gardens adds citrus terraces, waterfall stairs, gilded aviary perches, stained-glass rooftop traversal, and Garden Crown.
- Sealed Reliquary descends through royal ledgers, opposed counterweight lifts, a prismatic treasury, circular Sun-Lock mechanism, and a three-key vault mission.
- All required goals pass the base-movement structural sweep; unreachable Colonnade pieces are intentionally optional upper beams. The Reliquary gate works and muted Chromium reported zero console errors.
