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
falling to exactly that 0.19 under the known-bad flag.

**ALL FOUR TASKS ARE NOW CLOSED. 2026-08-13.** Task 4 (the world ping) was closed by `d79b45a` and
this line said otherwise until today. Task 2 Step 6 — the two-simulation lap — is measured:
`harness/probes/mp-twoworlds.probe.js` rebuilds the level a second time at the same `runSeed` through
the game's own guest path (`enterZone` adopts `MP.rseed`, 4215) and replays the host's recorded
packets into it.

> **Over a 30-second lap the two pictures now end 2 units apart on average, worst body 10. With the
> one array slot stripped and nothing else changed: 82 average, worst 1017.** The uncorrected
> separation climbs all lap (`1 → 65 → 102 → 134 → 175 → 227 → 234` at five-second marks); the
> corrected one is flat at 1–4 and never trends. Watched to fail under the shipped `?nopossync=1`:
> worst corrected body **401**.

*Two numbers above this paragraph are wrong and the corrections make the case stronger.* The rate is
**12 Hz, not 14** — `_sendT>=0.07` resets to zero rather than subtracting (12439), so at a locked
1/60 it fires every fifth frame; measured 360 packets in 30.0 s. And the reach a campaign mob damages
you at is the radius sum at 13573, **26–34 units**, not the ~90–125 quoted here — that formula lives
at 12947 **inside `botAI`**, which campaign mobs `continue` past (13476). See `MP_AUDIT.md` section 3.

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
*(2026-08-13: that particular reading is retired as a detector. Part 1 of that probe sends a
**six-slot** row and measures without ticking, while the shipped correction lives in the enemy update
and is gated on slot 6 — so its 0 is the fail-safe path working, and it reads the same on a build
with the feature deleted. The live known-bad is `?nopossync=1`.)*

### 1b. Two clients build the same map and disagree about what is standing on it — FIXED 2026-08-13
Found by `harness/probes/mp-twoworlds.probe.js` on 2026-08-13 while proving item 1, and it is a
separate defect with a separate cause.

Two clients handed the same `runSeed` build the same level: **41 of 41 mids matched and 41 of 41
spawn points matched within 1 unit**, three builds in a row. They then disagree about what **5 to 12
of the 41 creatures** ARE — measured `sameType` 29, 32, 33, 36 of 41 across four runs. The cause is
read off the file rather than guessed: `saltMob` (index.html:4716) picks the minority mob with
unseeded `Math.random`, and the role roll at 7690 does the same for shielder/healer/exploder/flanker.
`G.runSeed` never reaches either.

Why it matters beyond looking wrong: the mismatch is usually a **flyer against a walker**, and a
flyer goes places a walker cannot. Those bodies are the only ones the position correction from item 1
does not hold together — worst run, mean **358** apart and worst **1294**, against 2 and 10 for the
bodies both clients agree on. **Why they fail to converge is not established**, and the obvious answer
was measured wrong: the edge guard's target-floor test read `targetFloored: true` on the two worst.
That is the thing to measure first, not the thing to assume.

**FIXED.** Both rolls now come off `G.runSeed`, through the file's own `mulberry` idiom. Measured on
the instrument that found it, `harness/probes/mp-twoworlds.probe.js`, same command as above:

| `sameType`, of 41 | | | | | | | |
|---|---|---|---|---|---|---|---|
| before, 3 runs | 35 | 33 | 35 | | | | |
| after, 7 runs | **41** | **41** | **41** | **41** | **41** | **41** | **41** |

`bodiesTheBuildsDisagreedAbout` went 6 / 8 / 6 → **0**, seven times. `separationMoversSaltedApart` —
the cut this entry exists for, mean 358 and worst 1294 at its worst — is now `null`, because there
are no bodies left in it.

**The size of it was not the seven-to-twelve bodies. It was what those bodies were doing to
everything else.** The probe's control lap — two clients simulating one level with the position
correction stripped, which is the thing the whole of item 1 exists to fix — used to separate by an
all-bodies mean of **142 / 338 / 141**, worst body **1188 / 1367 / 1553**. On the fixed build, across
seven runs: **77 / 33 / 14 / 5 / 0 / 0 / 7**, worst **1188 / 1287 / 203 / 187 / 0 / 0 / 280**. Twice
it was exactly zero — two unsynced simulations of one level, thirty seconds apart, agreeing to the
unit on every body. The bestiary mismatch was not a defect sitting beside co-op enemy drift; it was
most of it.

**That has a cost, and it lands on the bench rather than on the game.** `mp-twoworlds.probe.js`
stands its second simulation up by rebuilding in the same page, so its control could only diverge on
whatever the rebuild got wrong — which was, mostly, this. With that gone, item 1's verdict line
(`control worst > 10 × corrected worst`) reads **red on 3 of 7 runs**, including both runs where the
control was 0 and there was nothing left to beat. Item 1's result stands as measured on 2026-08-13;
what no longer works is this probe's way of producing a diverging second picture. Two real clients
still diverge — they run on different machines with different frame timing, which a same-page rebuild
does not model at all — so the honest next step is to re-measure item 1 on `harness/mp2/coop.js`,
which has two actual Chrome processes, rather than to relax this bar.

The residual: the runs that still diverge do it through the last unseeded rolls in `spawnEnemy`,
`y:a.kind==='fly'?40+Math.random()*50:0` and `bob` / `dropT` on the two lines above the role roll. A
flyer starts at a different height on each client. Not fixed here — this commit is the two rolls the
entry names — but it is now the whole of what is left, and it is why the control is 0 on some runs
and 280 on others.

Three things worth keeping, because each of them was a guess that had to be measured:

- **The fix shape guessed above was the wrong one.** Drawing from the level's own `rnd` would have
  worked for co-op and re-shaped every level: `rnd`/`srnd` are shared with `zoneFlavour`,
  `encounterPass`, `scatterPass` and the rest, so one extra draw shifts every later one — including
  in the areas the comment at "MAIN LEVELS ARE STATIC" promises are the same hand-tuned layout every
  time, and that the level editor pins saved edits to. Both rolls are keyed on the spawn counter
  (`G._midSeq` / the body's own `mid`) instead and consume nothing. Watched, not asserted: the
  terrain hash of The Outskirts and Black Woods — rooms, segments, walls, obstacles, deco, geysers,
  chests, torches — is **bit-identical before and after** (`3004761347` and `2613452314`).
- **Three draws, nine wrong bodies.** Wrapping `Math.random` for one Outskirts build recorded only
  three `saltMob` draws in the entire level. `encounterPass` and `scatterPass` pick from a pool built
  out of the types already standing on the ground, so a salted pick changes what everything after it
  can be. That cascade, not the salt count, is the size of the defect.
- **The role roll is invisible to `sameType` and was broken worse.** It does not change what a
  creature is, so the probe above never saw it; a rebuild comparison that reads `e.role` measured
  `sameRole` **29 and 27 of 41** before, **41 and 41** after. It is not cosmetic — `exploder` and
  `flanker` multiply `e.speed`, so the two clients walked the same body at different speeds.

The maze generator's `saltMob` call site (the one campaign zones never reach, because they dispatch
to a scape table and return) was checked separately through `loadArea()` rebuilds, which keep
`G.delve` / `G.trial` set: delve floor 5 **21, 22 of 24 → 24, 24**; Trial of the Blade **18, 17 of 21
→ 17, 17 of 17**. The known-bad `?nopossync=1` still fails item 1's bar on the fixed build (worst
corrected body 581 against a contact reach of 26), so agreeing about the bestiary did not turn that
bench into a rubber stamp.

`harness/probes/mp-twoworlds.probe.js` was deliberately left untouched, so the before and after runs
are the same instrument byte for byte. Three prose blocks inside it (around its `sameType` field, its
`rebuilt` comparison and `separateDefect_bestiaryMismatch`) still describe this defect as live, and
are now stale.

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
