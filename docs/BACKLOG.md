# BLADEFALL backlog — what to plan next when the plans run out

The autopilot must never idle. When every plan in `docs/superpowers/plans/` has all its steps ticked,
the next run does not stop and does not invent work from nothing: it takes the **top unclaimed item
here**, writes a plan for it into `docs/superpowers/plans/YYYY-MM-DD-<slug>.md`, commits that plan,
and stops. The run after that executes it.

Writing a plan is a whole run's work. Doing it properly beats doing it and one task badly.

## Rules for writing the next plan

1. **Measure before you plan.** Every claim in the plan must come from a command that was run, not
   from reading the code. A plan built on assumption produces work built on assumption — the level
   walker, the skill bench and the multiplayer probe each shipped a confident wrong answer first.
2. **Follow the existing plan format**: goal, architecture, global constraints, numbered tasks with
   exact files, exact commands and expected output, then a self-review.
3. **Every task ends in something testable.** If the harness cannot see it, say so in the task rather
   than pretending it can.
4. **One commit per bug or per change**, so any single one can be reverted after Oliver plays it.
5. **Anything that changes how the game PLAYS is flagged in the plan** and lands as its own commit.
   Oliver has approved that class of change; he still needs to be able to undo one.
6. **Never author the three unbuilt zones** — Sunspire Palace, Ruined Keep, The Outskirts. Improving
   levels that already exist is in scope; creating those three is Oliver's.
7. When a plan is finished, mark its backlog item `DONE <commit>` here.

## The list, highest value first

### 1. Guests are hit by enemies that are somewhere else — `MP_AUDIT.md`
Measured: enemy positions are never reconciled on a guest. A snapshot with every enemy moved 500
units changed **0 of 41** positions while updating **41 of 41** HP bars. Over 30s of real combat the
two simulations drift **380–562 units** apart; attack reach is **~90–125**. So in co-op a guest can
be hit by an enemy visibly elsewhere on their screen.

The fix is to sync position for enemies **currently in combat with any player** — not for all
enemies, because the existing design deliberately avoids per-frame position sync for bandwidth and
that reasoning still holds for idle mobs. `harness/probes/mp-drift.probe.js` is already the
known-bad: today's `movedBySnapshot: 0 of 41` is a permanent reproducible failing case, so the fix
can be watched to fail before it is believed.

VISION.md priority #1. Take this first.

### 2. Level design — make the existing zones better to play
Oliver: *"we should also have it look to improve the level designs too."*

Scope is the eight zones that exist, not the three unbuilt ones. Start by MEASURING what a zone is,
because nobody has: walk each area and record length, time-to-exit, number of forced fights, number
of optional routes, how much of the floor area is actually reachable, and how long the player spends
not being asked to do anything. Those numbers are the plan; a level-design plan written without them
is taste with extra steps.

Known specifics to fold in:
- `ZONE_VERBS.md` gives each zone one verb. Four zones ship a generator built around theirs; the
  other four do not, so their verb is currently aspiration rather than design.
- The reachability audit re-homes objectives silently (`G._reachMoved`). A zone with a high count is
  a zone whose layout is fighting its own objectives.
- Off-theme mob salting was measured at Emberdeep spawning 10 `caster`, 9 `royalarcanist`, 4
  `frostlobber`, 4 `cragspitter` and 4 `sunpriest` alongside its natives. Deliberate, but the ratio
  works against zone identity.

### 3. Characters render through walls
`flushHero3D` clears the depth buffer before drawing the 3D layer, so by the code's own admission the
layer "always draws OVER the voxel world and cannot be occluded by it… it is the reason a
half-converted scene can show a character through a voxel wall." Visible in every zone in normal
play.

### 4. A save-compatibility test
"Never break saves" is a standing rule enforced only by care. A runner that loads a corpus of old
saves and asserts nothing is lost would protect every change in every other plan. Cheap, and it only
gets more valuable.

### 5. Frame-budget assertions
One missing `terrain:true` tag put 64 enemies and a tower of chests into Castle Duskmoor via
`highGround()`. Per-zone assertions on obstacle, enemy and chest counts catch that class of
regression anywhere it recurs.

### 6. The three stale skill cards — needs Oliver first
`mage/Attunement`, `ranger/Tumble` and `berserker/Charge` describe skills the redesign replaced. The
code change is small; **which way it goes is a design call and belongs to Oliver.** Do not guess.
Same for the three classes that promise aggro control in a game with no aggro model.

### 7. Endless Dungeon — planned
See `docs/superpowers/plans/2026-08-11-endless-dungeon.md`.

## When the list runs out

If every item here is DONE, the next run adds items rather than idling. Good sources, in order:
the `NOT yet done` sections of `SESSION_HANDOFF.md`; `docs/VISION.md`'s priorities measured against
what the game currently does; and `harness/report.json`'s `unproven` entries, which are the things
the harness knows it cannot currently see.

Add them here with the same evidence standard: a number, a file and a line, not an opinion.
