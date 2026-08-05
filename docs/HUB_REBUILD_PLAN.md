# The Waystation rebuild — handoff

**Start a FRESH session with this file. Run at high effort.**

Everything a new session needs is here, so nothing below has to be re-derived. Read this first,
then `docs/HUB_PLAN_NOTES.md` if it exists.

---

## 0. Why the last attempt failed (read this before writing any code)

An attempt shipped on 2026-08-05 and was removed the same day. Oliver: *"the hub loooks.... AWFUL."*
He was right. The causes were process, not reasoning:

1. **Coordinates were typed blind.** Positions were invented for a space that had never been looked
   at. That is not design, it is guessing with a straight face.
2. **A modular kit was stretched.** The 176 `village/` pieces are built to snap together at fixed
   sizes. Each was scaled to arbitrary `w/h/d`, which destroys the entire point of a kit and is the
   single biggest reason it read as junk rather than as buildings.
3. **Nothing was measured.** The real size of a wall piece was never established. It still has not
   been - an attempt to measure one failed and that failure is the honest state of knowledge.
4. **It was looked at once, at the end.** Same failure as five earlier level passes.
5. **The whole hub was replaced at once**, so there was never a step small enough to judge.

There was also a hard bug worth remembering: **every deco entry needs a `c` colour field**, because
`col3()` calls `hex.replace('#','')`. An entry without one throws inside the deco draw LOOP, which
kills the rest of the frame - the symptom is the ENTIRE hub rendering as empty ground, not just the
new props going missing. It cost three rounds of bisecting; the exception was in the console the
whole time. **Read the page error log first, always.**

---

## 1. What the hub must contain

Nothing here may be lost. Positions are the CURRENT ones, given only as reference - the new layout
is free to place them anywhere.

### Zone portals (8) — tier order matters, left to right today
| # | Zone | Current pos |
|---|---|---|
| 1 | The Outskirts | −812, −517 |
| 2 | Hollow Pass | −580, −523 |
| 3 | Ruined Keep | −348, −528 |
| 4 | Frostfell | −116, −533 |
| 5 | Emberdeep | 116, −533 |
| 6 | The Abyss | 348, −528 |
| 7 | Sunspire Palace | 580, −523 |
| 8 | Castle Duskmoor | 812, −517 |

### Keepers & services (9)
| Name | Function | Current pos |
|---|---|---|
| Quartermaster | Shop | −795, −78 |
| The Smith | Fuse/upgrade gear | −795, 195 |
| The Stylist | Style & appearance | −507, 52 |
| Drillmaster | Classes, Trials, **class swap** | 795, −78 |
| Beastkeeper | Companions | 795, 195 |
| Postings | Quest board | −718, 445 |
| The Mirror | Inspect yourself | 580, 650 |
| Your Bag | Storage | −880, 59 |
| Sparring Room | Entrance to training room | 812, 650 |

### Optional trials (5 + 1 conditional)
| Name | Function | Current pos |
|---|---|---|
| Abyssal Descent | Endless survival | −341, 858 |
| The Endless Dungeon | Endless exploration | −138, 858 |
| Treasure Sprint | Time-trial parkour | 341, 858 |
| The Arena | Battleground, solo/PvP | 0, 1040 |
| The Gauntlet | Boss rush | 268, 1040 |
| Isaac's Arcade | only if `meta.arcadeOwned` | −340, 800 |

### Non-NPC interactables — easy to forget
- **The Waystone**, centre (0, 30) — heal, bank, travel. The landmark.
- **The Tinkerer's bench**, (−806, 644), labelled `???` — hidden cheat menu, SW corner box pile.
- **The gold stash** — hidden behind the Pet Yard crates.
- **Player spawn** — (0, 247), facing north toward the gates.

### NOT in the Waystation
`arenamaster` / `arenaexit` and `sparringcontrol` / `sparringexit` belong to sub-rooms. Do not place.

---

## 2. Dimensions and scale

- **Bounds today:** X −957 → +957 (1,914 wide), Z −585 → +1,105 (1,690 deep)
- **Floor plates:** main plaza 2030×1846 @ (0,273) · north court 1885×1092 @ (0,−52) ·
  south annex 957×650 @ (0,780) · SE court 522×195 @ (682,592)
- **Scale reference:** player ~40 units wide · jump reach ~95 vertical · interact radius ~110 ·
  run speed ~220/s. The hub is ~47 player-widths across; spawn to gates is ~800 units, ~4s of running.

Oliver has said size and shape are UNCONSTRAINED for the rebuild.

---

## 3. The asset library

Loaded from `../slice3d/assets/` (see `PROPS` in world3d.js). Placement is a deco entry:

```js
G.deco.push({ kind:'asset', set:'<PROP_SETS key>', x, z, y0, w, h, d, ry, c:'#hex', lead:true });
```

`c` IS MANDATORY (see section 0). New sets are added to `PROP_SETS` in world3d.js, which is also
flattened into the preload list.

### `village/` — 176 modular architecture pieces. **Snap on a grid. Never stretch.**
Walls (plaster + uneven brick; straight, door, window variants, arches, bases) · Doors and frames
(8 styles, flat and round) · Roofs (round-tile 2×1 through 8×14, wooden, dormers, tower roofs,
gables, supports) · Overhangs and awnings (long/short, corner, side — ideal for stalls) · Stairs
(exterior straight, platform, 45°, U, side-platform; interior simple/solid/railed) · Balconies ·
Floors (brick, red brick, uneven brick, light/dark wood, halves, overhang corners) · Windows and
shutters · Details (chimneys ×2, vines ×6, wooden fence, ornamental + simple metal fence, exterior
borders, loose bricks, crate, **wagon**, supports)

### `qprops/` — 42 hand props
Smithing: Anvil, Anvil_Log, Workbench, WeaponStand, Sword_Bronze, Axe_Bronze, Shield_Wooden ·
Storage: Barrel, Barrel_Holder, Crate_Wooden, Crate_Metal, Pot_1, Vase_2, Vase_4, Bucket, Bag,
Chest_Wood · Furniture: Bench, Stool, Chair_1, Table_Large, Bookcase_2, Book_Stack_1 · Light:
Torch_Metal, Lantern_Wall, Chandelier, CandleStick_Triple · Alchemy: Cauldron, Potion_1/2/4,
Scroll_1 · Training: Dummy, Cage_Small, Chain_Coil *(a FLOOR coil — standing it up made a row of
gallows last time)* · Treasure: Coin, Coin_Pile, Coin_Pile_2, Key_Gold · Banner_1, Banner_2

---

## 4. The plan

### Phase 0 — Facts before design
1. **Measure every kit piece.** Load each model, record true w/h/d and module size. Commit the table.
2. **Measure every interactable's drawn footprint** — what box the game actually draws for each NPC
   `prop` and for a portal.
Neither exists today. Until both do, every coordinate is a guess.

### Phase 1 — The reservation map
Each interactable claims: visual footprint + 110 interact radius + clearance. One `reserved(x,z,r)`
predicate that EVERY asset placement must pass, plus an audit that fails the build on overlap.
**This is how "don't make a mistake" becomes mechanical rather than a promise.**

### Phase 2 — Layout on paper, at real scale
Render a top-down debug map (footprints, reservations, sightlines) as an image. Oliver approves the
PLAN, before a single model is placed.

### Phase 3 — One component at a time
`makeStall()`, `makeGatehouse()`, `makeTower()`, `makeTerrace()`. Each built alone, screenshotted,
fixed until it genuinely looks good, then frozen with a known footprint.

### Phase 4 — Compose
Place only proven components, only through the reservation test. Audit: no overlaps, every
interactable reachable, nothing blocking the Mirror's glass, spawn has sight of the portals.

### Phase 5 — Dress last
Lighting, banners, vines. Never before the structure reads.

### Phase 6 — Judge
Screenshots from spawn and from each district, against the old hub.

---

## 5. The concept to pitch

**A fortress built over the mouth of the descent.**

The centre is not a plaza — it is a **great open shaft** dropping into the dark, ringed by a stone
lip. The Waystone stands at its edge. The eight portals are **standing gates around that ring** in
tier order, so the hub is literally a circle around the thing you are about to enter. Services
occupy the surviving wings of a ruined fortress; the optional trials are down the first flight of
stairs INTO the shaft. One tall broken tower carries the skyline.

Radial beats the current linear sprawl: everything is equidistant from spawn, the centre means
something, and it says what the place is — the last floor before you fall.

---

## 6. Ground rules

- `HUB_REDESIGN`-style flag from day one; the old hub stays one flag away until the new one wins.
- Read the page error log after every build. It named the last blocker instantly and went unread.
- Screenshot every component. Do not proceed on an unverified piece.
- `--scene hub` loads the Waystation. `--pre` DEFAULTS to the scene loader — passing your own
  `--pre` silently replaces it and nothing loads. Use `--eval` instead.
- `--scene` takes a ZONE INDEX 0-7, not a stage number.
- The harness has no GPU: frame times are meaningful only as a RATIO against another scene measured
  the same way.
