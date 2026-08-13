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

### 1. Guests and hosts are not looking at the same monsters — PLANNED 2026-08-12, CODE SHIPPED
Measured: enemy positions were never reconciled on a guest. A snapshot with every enemy moved 500
units changed **0 of 41** positions while updating **41 of 41** HP bars. Over 30s of real combat the
two simulations drift **roughly 1000–1700 units** apart; attack reach is **~90–125**. (Two
independent launches gave 987–1641 and 990–1730 — the range is a size, not a fixture.)

*(That drift figure read **380–562** here until 2026-08-12. It was a **7.3-second** measurement
labelled as thirty: the probe's lap walked into the Warden's Shade card at tick 438, which takes the
game out of play mode, and `update()` then returned at its third line for the remaining 1362 ticks.
The bench now knocks on the card's own button and reports `playTicks 1800 of 1800`. The error
understated the problem by about 3×. Full correction in `docs/MP_AUDIT.md` section 2.)*

**Tasks 1, 2 and 3 of the plan are shipped** (`a12b178`, `cb47393`, and the guard): the snapshot
carries the host's wake flag as slot 6, a guest lerps its enemies toward the host's position for any
enemy the host has awake, and three assertions in the mp suite hold it there behind the known-bad
`?nopossync=1`. Verified `targetsStored 0 / 0 / 41 / 41` across sleeping / pre-flag / awake trials on
a live world; a corrected body converges `141.8 → 2.0` units per frame over twenty frames; and in the
aggregate gate the awake trial closes **0.90** of the gap against an AI-only control of **0.19**,
falling to exactly that 0.19 under the known-bad flag. What is left is the plan's Task 4 (the world
ping, which may need no code at all) and Step 6's two-simulation lap.

**This item's original title and both its stated premises were wrong, and all three were disproved
by measurement before the plan was written. Kept here rather than rewritten away, because the
corrections are the useful part:**

- *"So a guest can be hit by an enemy visibly elsewhere on their screen"* — **false.**
  `harness/probes/mp-whohits.probe.js`: local copy on top / host says far = **261 HP**; local far /
  host says on top = **0**; both far = **0**. Verdict `LOCAL copy hits the guest`. Nobody is dying
  unfairly. It was the one sentence in `MP_AUDIT.md` that was an inference rather than a reading.
- *"the existing design deliberately avoids per-frame position sync for bandwidth"* — **retired.**
  `harness/probes/mp-pos.probe.js`: 41 of 41 rows already carry x and z, 989 bytes at 14 Hz. Using
  them costs **zero additional bytes**.
- *"sync only enemies in combat with any player"* — right instinct, wrong gate. The real hazard is
  that `enemySnap()` does not filter on `active` (**0 of 41 awake at the entrance, all 41 sent**), so
  adopting the host's position for a mob it has not woken would drag back every monster a guest
  fights alone. The gate is the host's own wake flag, not a distance.

**What it actually costs is `VISION.md` priority #1:** co-op is two solo games in one room. Health
bars belong to bodies somewhere else, the two players cannot fight the same monster or warn each
other about one, and the world ping added in sub-project D points at empty ground.

Planned in `docs/superpowers/plans/2026-08-12-guest-enemy-positions.md`.
`harness/probes/mp-drift.probe.js` is the known-bad: today's `movedBySnapshot: 0 of 41` is a
permanent reproducible failing case, so the fix can be watched to fail before it is believed.

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

### 3. A stray push nearly reached the live game — hardened, but the class of hazard stands
On 2026-08-12 something in this repo attempted `main -> main` twice during an ordinary commit. It was
rejected, and `origin/main` is untouched — but only because local `main` is stale. Had it been
current, the live game would have deployed unreviewed.

Mitigated by `remote.origin.push = refs/heads/autopilot-merged:refs/heads/autopilot-merged`, so a
bare `git push` can now only ever move the working branch (proved with `--dry-run`). Still open, and
worth a run: **find what issued it.** No hook exists in `.git/hooks`, no `core.hooksPath` is set
globally or locally, and no autopilot run held the lock at the time. Something ran a push with a
refspec that included `main` and it has not been identified. Until it is, the config is a seatbelt
over an unknown driver.

### 4. Characters render through walls
`flushHero3D` clears the depth buffer before drawing the 3D layer, so by the code's own admission the
layer "always draws OVER the voxel world and cannot be occluded by it… it is the reason a
half-converted scene can show a character through a voxel wall." Visible in every zone in normal
play.

### 5. A save-compatibility test
"Never break saves" is a standing rule enforced only by care. A runner that loads a corpus of old
saves and asserts nothing is lost would protect every change in every other plan. Cheap, and it only
gets more valuable.

### 6. Frame-budget assertions
One missing `terrain:true` tag put 64 enemies and a tower of chests into Castle Duskmoor via
`highGround()`. Per-zone assertions on obstacle, enemy and chest counts catch that class of
regression anywhere it recurs.

### 7. The three stale skill cards — needs Oliver first
`mage/Attunement`, `ranger/Tumble` and `berserker/Charge` describe skills the redesign replaced. The
code change is small; **which way it goes is a design call and belongs to Oliver.** Do not guess.
Same for the three classes that promise aggro control in a game with no aggro model.

### 8. Endless Dungeon — planned
See `docs/superpowers/plans/2026-08-11-endless-dungeon.md`.

## When the list runs out

If every item here is DONE, the next run adds items rather than idling. Good sources, in order:
the `NOT yet done` sections of `SESSION_HANDOFF.md`; `docs/VISION.md`'s priorities measured against
what the game currently does; and `harness/report.json`'s `unproven` entries, which are the things
the harness knows it cannot currently see.

Add them here with the same evidence standard: a number, a file and a line, not an opinion.
