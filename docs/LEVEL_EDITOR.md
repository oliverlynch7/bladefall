# The level editor

Press **F2** in the game. Everything below happens live, in the real game, on the real level.

## Keys

| key | does |
|---|---|
| `F2` | open / close edit mode |
| right click | select the nearest object - its name appears on it |
| right drag | move it along the ground |
| **while holding right-click** | `space` raise · `shift` lower · `R` turn · `wheel` resize |
| arrows | nudge 10 units (`shift` = 50) |
| `PgUp` / `PgDn` | raise / lower |
| `alt` + those | **resize** instead of move (`[` `]` for a healing pad's radius) |
| `R` | rotate 1/16 turn (`shift` reverses) |
| `ctrl`+`D` | duplicate, and select the copy - so ctrl+D ctrl+D builds a row |
| `K` | toggle collision on the selected object |
| `C` | collision overlay |
| `Del` | delete |
| `Ctrl+Z` / `Ctrl+Y` | undo / redo |
| `Esc` | stop placing, or deselect |

## Every binding, once

No key does two jobs. Camera keys are bare-key only, so `ctrl`+anything always reaches the editor
command rather than flying the view.

**Camera** - drag, `WASD`, `Q`/`E`, `Z`/`X`, wheel, `shift`+wheel, `G`
**Selected object** - arrows, `alt`+arrows, `PgUp`/`PgDn`, `[`/`]`, `R`, `ctrl`+`D`, `K`, `Del`
**Session** - `ctrl`+`Z`, `ctrl`+`Y`, `C`, `Esc`, `F2`

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

## Hub furniture

The Waystation's stalls, anvil, barber's booth, beast cages, notice board, mirror and the four
activity gates are all editable - select, move, delete, undo. They are drawn from their own list
rather than from the level's props, which is why nothing could touch them before.

Deleting one removes what it DOES as well as how it looks (the shop, the Drillmaster, a portal), so
the message names it. `Ctrl+Z` and **Revert area** both put it back.

Moving the gates is the fix for spires overlapping the portals - the gates themselves are entries
in this list.

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

## The camera

**F2 releases you from the character** into a free-flying camera. **F2 again drops you straight back
into the hero, where he was standing**, so you can playtest what you just built without a reload.

| key | camera |
|---|---|
| **left** drag | turn the camera |
| **right** click / drag | select and move an object |
| `WASD` | move horizontally, like walking, at any height |
| `space` / `shift` | up / down (`E`/`Q` also work) |
| `Z` / `X`, or wheel | zoom in / out along the way you are looking |
| `shift`+wheel | fly speed |
| `G` | jump back to the hero when you have flown off and lost him |

Clicking an asset in the palette **adds it where the camera is looking** and selects it, so you
nudge it into place from there. No arming, no second click hunting for a ground pixel.

Dragging empty space turns the camera; dragging an OBJECT still moves the object. One button, no
modifier - the editor works out which you meant from whether the cursor grabbed something.

Flying forward while looking down takes you toward the ground, so you can get close to what you are
editing. Strafing stays horizontal so you can sidestep along a wall without drifting into it.

**Still to come:** explicit Build and Transform modes. Right now selecting an object gives you the
move/resize/rotate keys directly; Oliver wants a distinct transform mode with handles.

## Superseded: the old note about this being next

Oliver's design, and the right one: F2 should RELEASE you from the character into a free overhead
camera you can pan and zoom, place things in front of where you are looking, and F2 again drops you
straight back into the hero to playtest what you just built. That is the standard editor shape and
the fast edit-test loop every tool write-up argues for.

Landed so far: edit mode now OWNS the keyboard, so nudging a platform no longer walks the hero
across the level. The free camera itself is the next piece of work - it needs an editor branch in
the camera code (~13958) and a movement skip in update(), neither of which should be half-done.

## What it cannot do yet

- **`Pillar` is still greyed out in the hub only.** The hub draws a TOWER where a pillar stands, so
  placing one there gives you architecture rather than the pillar prop you asked for. Everything
  else in the palette now works in the hub and the zones alike.
- **Default asset sizes are rough.** They are each set's working size, not a measured fit, so some
  land large. Resize with `alt`+arrows.
- **No quest spawners (dens).** Every den carries a `questId` binding it to a quest's kill counter,
  and what a den without one does was never established. Placing one would be a guess.
- **Class trials, side zones and boss arenas are read-only.** They re-roll every run, so an edit
  has nothing stable to attach to. The panel says so rather than letting the work evaporate.
  Boss arenas become editable once G1 pins them.
