# The level editor

Press **F2** in the game. Everything below happens live, in the real game, on the real level.

## Keys

| key | does |
|---|---|
| `F2` | open / close edit mode |
| click | select the nearest object |
| drag | move it along the ground |
| arrows | nudge 10 units (`shift` = 50) |
| `PgUp` / `PgDn` | raise / lower |
| `alt` + those | **resize** instead of move (`[` `]` for a healing pad's radius) |
| `R` | rotate 1/16 turn (`shift` reverses) |
| `D` | duplicate, and select the copy - so `D D D` builds a row |
| `K` | toggle collision on the selected object |
| `C` | collision overlay |
| `Del` | delete |
| `Ctrl+Z` / `Ctrl+Y` | undo / redo |
| `Esc` | stop placing, or deselect |

## The palette

- **Structures and assets** - wall, gateway, tower base/mid/roof, flag, fountain, cart, stall,
  hedge, banner, anvil, bush, grass, stone and grass floor tiles. These are the model kits
  themselves, so anything in them can be placed.
- **Props** - tree, rock, fence, gravestone, pillar, column, lantern, flower, standing stone, crop.
- **Terrain** - platform, floor, plateau, parkour column, step. A step duplicated and raised
  (`D` then `PgUp`, repeatedly) builds stairs and ramps.
- **Gameplay** - healing pad, moving platform, mobs.

The palette is grouped - **Terrain, Structures, Town, Floors, Nature, Props, Gameplay** - one group
open at a time, with a count on each. Click a group header to open it, click it again to close.
The open group survives clicking around in the world.

Pick one, then click the ground. Every size is a starting point: `alt`+arrows resizes anything and
the collider follows.

Placed props get **collision sized to them automatically**, linked to the prop - move, resize,
duplicate or delete the prop and its collider follows. `K` turns it off for things you should walk
over, and turns it ON for an existing walk-through prop, which is how E1 gets fixed by hand.

Mobs are placed with the game's own spawner, so they are real enemies with correct stats. The
button offers whatever the current level already spawns and cycles that roster on repeat presses.

## The collision overlay

`C` draws what is solid: **red** blocks you and you can stand on top, **green** is movers and
healing pads, **magenta** is scenery you can see and walk straight through. Magenta is the one to
hunt - the hub's first reading was 105 of 162 nearby props with no collider at all. Props are
checked within 1400 units of you, and the panel says so, so it is not a level-wide audit.

## Saving

**Save** keeps edits in this browser. **Export file** writes `bladefall.edits.json`; commit it as
`public/3d/edits.json` and it ships to players - the game fetches it at boot.

Two layers, deliberately: the shipped file underneath, your browser's working copy on top. Your
in-progress edits always win on your own machine, so a deploy can never overwrite work you have not
exported yet. **Revert area** clears YOUR edit for that area and falls back to the shipped one.

Edits are stored as a LIST of changes replayed over the generated level, not as a copy of it, so
an area you have not touched behaves exactly as it does today, and the diffs are readable.

## What it cannot do yet

- **In the hub, the ten generator PROP kinds (tree, rock, fence...) still place as plain boxes** and
  are greyed out there. Everything from Wall onward - the whole kit library - works in the hub and
  the zones alike. Finishing the last ten means giving each its own entry in the hub's build pass
  and the matching exclusion in `index.html` (~12345), which must be done on both sides at once or
  you draw the model AND the box it replaces.
- **Default asset sizes are rough.** They are each set's working size, not a measured fit, so some
  land large. Resize with `alt`+arrows.
- **No quest spawners (dens).** Every den carries a `questId` binding it to a quest's kill counter,
  and what a den without one does was never established. Placing one would be a guess.
- **Class trials, side zones and boss arenas are read-only.** They re-roll every run, so an edit
  has nothing stable to attach to. The panel says so rather than letting the work evaporate.
  Boss arenas become editable once G1 pins them.
