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

- Ruined Keep + Oubliette
- Frostfell + Glacier Vault
- Emberdeep + Magma Core
- The Abyss + Reaper's Gate
- Sunspire Palace + Sealed Reliquary
- Castle Duskmoor final expansion and full-chain regression

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
