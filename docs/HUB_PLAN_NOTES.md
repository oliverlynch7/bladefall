# The Waystation rebuild — working notes

Companion to `HUB_REBUILD_PLAN.md`. That file is the brief; this is the state of the work.
**Phases 0, 1 and 2 are done and Oliver has approved the layout.** Phase 3 has not started.

---

## Decisions Oliver made (2026-08-05) — LOCKED

1. **The radial concept is approved.** A fortress over the mouth of the descent: open shaft in the
   middle, eight portals ringing it in tier order, keepers in two wings, trials down in the shaft.
   He chose this over "keep the current shape, rebuild the art" and over a shaft with no hole.
2. **The plaza gets raised rather than the shaft dug.** See "The engine has no basement" below.
   He chose this over a visual-only pit and over sinking just the trial pads.

---

## What now exists

| Artifact | What it is |
|---|---|
| `tools/measurekit.js` | Measures every kit piece offline from the glTF accessors. No GPU. |
| `docs/KIT_MEASUREMENTS.md` | The readable table — 218 pieces, 0 failures. |
| `docs/kit_measurements.json` | **The machine-readable table placement code must read.** |
| `tools/hubplan.js` | The layout, as data, plus the reservation audit and the plan drawing. |
| `docs/hub_plan.svg` / `.png` | The approved layout, to scale. |
| `docs/hub_plan.json` | Every interactable's final x/z/facing/claim — what the build reads. |

`node tools/hubplan.js` re-audits and re-draws. **It exits non-zero if the layout breaks a rule**,
so it belongs in front of any change to positions.

To look at the drawing (MCP screenshots fail on this machine):
```bash
cd _automation/bladefall && cp docs/hub_plan.svg public/_t.svg && node _shot/shot.js --url "/_t.svg?x=1" --size 2120x1680 --wait 1000 --out docs/hub_plan.png && rm public/_t.svg
```

---

## Facts established (these replace the guesses the last attempt ran on)

- **One kit cell = 68 game units, exactly.** Measured off 12 wall pieces and every full floor tile;
  they agree to 3 decimal places. `VIL_GRID = 2.0` in world3d.js was right after all.
- **A wall is 106 tall, not 102.** `VIL_STOREY` deliberately says 3.0 (=102) so the trim overlaps by
  4 units. That is correct, not a bug — do not "fix" it.
- **Roof names lie.** `Roof_RoundTiles_4x4` is 2.76 x 2.78 cells, not 4 x 4. Every roof carries its
  overhang in its size. Pick roofs from the measured table, never from the name.
- **Exterior stairs are exactly one cell on plan and rise exactly 34.** This is why the shaft is 136
  deep: four flights, no piece stretched.
- **Interact radii are not all 110.** NPCs/trials 110, portals 96, the Waystone 72, the bench 70.
- **There is a facing bonus of 90.** `updateInteract` shaves up to 90 units off an object's distance
  when you look at it, so two interactables need ~200 between them or they trade prompts. The audit
  enforces this; it is why the trials sit on an even hexagon and the wings are at x ±820.

### The engine has no basement
`floorAt()` (index.html:6871) returns `0` for any point inside a `G.segments` rect and then only
stacks **upward** — `stand` walls, movers, `plat` obstacles. A point in no segment returns
`-Infinity`, which is void, not a lower floor. **Ground below zero does not exist in this game.**

So the shaft is built inverted: the shaft floor **is** the engine's natural ground (y=0) and carries
the six trials, and the whole fortress plaza rides on `plat` obstacles at **y = 136**. The player
walks down four flights into the dark exactly as designed, and no engine change is needed.

---

## The approved layout

Numbers are final and live in `docs/hub_plan.json`. Audit: 0 problems, 0 tight pairs.

- **Shaft** r=290, **lip** to r=360, **trial terrace** r=210, drop 136.
- **Portals** on an ellipse a=620 b=470, across a 156° north arc, tier 1 west → 8 east.
  The ellipse is a deliberate correction: a true circle put the middle portals 7.4s from spawn
  against the current hub's ~4s. Flattened, every portal is 4.3–4.9s away, spread only 148 units.
- **Keepers** in two wings at x ±820, four each at z −40 / 170 / 380 / 590.
- **Postings** on the spawn walk at (−300, 640) — the one service a new player must not miss.
- **Trials** on an even hexagon at r=210 on the shaft floor; the two endless modes adjacent, the
  Arena beside the Gauntlet, Isaac's Arcade in the reserved north slot.
- **Waystone** on the lip at (0, 325), at the head of the spawn walk. **Spawn** (0, 620) facing north.
- **Secrets** tucked behind the last keeper of each wing at (±820, 790).

---

## Phase 3 — next, and not started

Build ONE component at a time, screenshot it alone, fix it until it genuinely looks good, then
freeze it with a known footprint. Do not compose until the pieces are proven.

Suggested order, easiest to judge first:
1. `makeGatehouse()` — a portal standing on the ring. `Wall_Arch` (68×102×2) is the opening;
   flank with `Wall_*_Straight` and cap with a tower roof. Eight of these carry the whole hub.
2. `makeStair()` — 4 × `Stairs_Exterior_*` down the shaft wall. Snaps exactly; prove it once.
3. `makeLip()` — the plaza edge: `plat` obstacles approximating the annulus, `Prop_MetalFence_*`
   as the railing so nobody walks off by accident.
4. `makeWing()` — the keeper terraces. `Overhang_*_Long` (exactly 1 cell) makes real stalls.
5. `makeTower()` — one tall broken tower for the skyline. `Roof_Tower_RoundTiles` is 192×250×185.

### Rules that are not optional
- **Never scale a kit piece to an arbitrary size.** Snap to whole cells. This is what killed the
  last attempt. Read sizes from `docs/kit_measurements.json`.
- **Every deco entry needs a `c` colour field.** `col3()` does `hex.replace('#','')`, so one entry
  without it throws inside the deco draw loop and the ENTIRE hub renders as empty ground. This cost
  three rounds of bisecting last time, with the exception sitting in the console unread.
- **Read the page error log after every build.** `_shot/shot.js` prints it.
- Ship behind a `HUB_REDESIGN` flag; the old hub stays one flag away until the new one wins.
- Screenshot every component. Do not proceed on an unverified piece.
- `--scene hub` loads the Waystation. `--pre` defaults to the scene loader — pass `--eval`, not your
  own `--pre`, or nothing loads. `--size WxH` sets the viewport; `--out` the file.
