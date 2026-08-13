# Endless Dungeon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Endless Dungeon worth running twice — a mode with its own identity, rather than campaign levels with the interesting parts switched off.

**Architecture:** No new mode. Every task changes what `loadDelveFloor` (index.html:14305) does with the level it already builds.

**Tech Stack:** `public/3d/index.html`. Verified with `harness/test-levels.js` and the walker.

## Why this exists

Oliver: *"endless dungeon mode needs a lot of work."*

Read from the code rather than guessed, three things stand out. One correction to an earlier claim of mine: there **is** persistence — `meta.delveBest` records your deepest floor and the death screen shows it (14353, 14361). It is thin, but "no meta-progression at all" was wrong.

| what | where | why it matters |
|---|---|---|
| **`G.haz = null` on every floor** | 14309 | The signature hazards — gloom, rime, phasing, gusts, lava, collapse — are the single thing that makes zones play differently. Switched off, every floor is the same fight in a different palette. This is the big one. |
| **Floors are campaign levels** | `loadArea()` at 14311 runs the zone's own generator | A campaign area is ~4,500 units built for a ten-minute traversal with quests. A roguelite floor wants one to three minutes. The pacing fights the genre. |
| **Depth is the only reward** | `meta.delveBest` | A number is a reason to run twice. It is not a reason to run twenty times. |

## Global Constraints

- Work on branch `autopilot-merged`. Never `main`.
- Any `public/3d/index.html` change must pass `node tools/gate.js`.
- **Do not break the campaign.** The delve borrows campaign generators, so anything changed inside a generator changes the campaign too. Prefer changing what `loadDelveFloor` does AFTER `loadArea()` returns over editing a generator.
- The delve escrows everything (`bankNow()` at 13509) and returns it on death. Nothing added here may leak out of a run — that is the mode's whole promise: *"Nothing you find here leaves with you — only how deep you went."*
- Verify each task with the walker. A floor that cannot be finished is worse than a boring one.
- **Tasks 2 and 3 change how the mode plays.** One commit each, so Oliver can revert any single one after playing.

---

### Task 1: Turn the hazards back on — **CLOSED 2026-08-12 WITHOUT BEING CARRIED OUT. THE HAZARDS WERE NEVER OFF.**

The premise is false and the measurement is not close. **Every delve floor has its borrowed zone's
hazard, and every hazard is furnished** — `harness/probes/delve-haz.probe.js`, floors 1 to 34 in one
launch, `zoneHaz` against the live `G.haz` after the floor builds:

```
 1 The Outskirts       bramble  bramble   8 rooms   4 thorn patches
 5 Hollow Pass         gusts    gusts    11 rooms   (needs none)
 7 Ruined Keep         rubble   rubble    8 rooms   clock armed
 9 Frostfell           slick    slick    12 rooms   (needs none)
11 Emberdeep           lava     lava     10 rooms   6 vents
13 The Abyss           phase    phase    13 rooms   2 phasers
15 The Sunspire Palace glare    glare    11 rooms   sweep placed
17 Castle Duskmoor     gloom    gloom    12 rooms  36 lights
```

All eight hazards, from floor 1 up, with no gaps in the rotation.

**Why the plan read the code the other way.** It says "the delve sets `G.haz = null` immediately
AFTER `loadArea()`". The assignment is at index.html:14367 and the `loadArea()` is at 14373 — it is
BEFORE, and it is dead for this purpose, because `hazSetup` (8950) opens by ASSIGNING the field:
`G.haz = (G.side||G.trial) ? null : (Z.haz||null)`. A delve floor always reaches it: the
`EXPANDED_SCAPES` and `SCAPES` dispatches at 7297/7304 are both guarded on `!G.delve`, so the delve
deliberately takes the shared maze below them, and that path calls `hazSetup` at 7540. One line's
worth of ordering, and it sent a whole task after a bug that does not exist.

*The line is kept, not deleted*, with a comment at the site recording all of the above: `G` survives
from floor to floor, so clearing the previous floor's weather before the next one builds is correct
defensively even though nothing currently depends on it.

**AND THE RISK THIS PLAN CARRIED FORWARD IS MEASURED ABSENT.** The Self-Review's one named danger was
gloom: *"if a delve floor builds rooms after `hazSetup`, gloom will be dark with no safe ground — the
walker must be run on a gloom floor specifically."* Every gloom floor in the rotation was probed —
17, 18, 20, 25, 30 — and they carry **36, 39, 36, 30 and 33 lights** against 10–13 rooms. Lit.

**What is left of this task is a DESIGN CALL and belongs to Oliver.** Step 2's other half — "not from
floor 1… the first floor should teach the room, not the weather" — would today mean ADDING a
suppression that does not exist, i.e. making floors 1–2 easier than the mode has ever been. Its
stated justification (hazards are off, so introduce them gradually) is exactly the thing that turned
out to be untrue, so an autopilot run implementing it would be shipping a difficulty change on a
falsified argument. Queued for him instead, in one question: *should the delve's first two floors be
hazard-free, given they are not today?*

**Next actionable task in this plan: Task 2** — and note its own Step 1 has a skip branch, so measure
the floor length before changing anything.

- [x] **Step 1: Confirm hazards are off and that they would otherwise work** — done, and they are ON.
      Committed as `harness/probes/delve-haz.probe.js` so the next run reads numbers rather than
      re-deriving them: `node _shot/shot.js --scene hub --eval @harness/probes/delve-haz.probe.js`.
      The command below was the plan's; it measures a CAMPAIGN zone, which was never the question.

- [x] **Step 2: Let the floor keep its theme's hazard** — **already true, nothing to do.** See above.
- [x] **Step 3: Prove a floor is still finishable with the hazard live** — the floors have always run
      with these hazards live, so this is the mode's existing state rather than a change to verify.
      The gloom lighting check the step exists for was run and passed (36 lights, 12 rooms).
- [x] **Step 4: Commit** — the probe, the source comment, and this closure. No behaviour change.

<details>
<summary>The task as originally written</summary>

- [ ] **Step 1: Confirm hazards are off and that they would otherwise work**

```bash
node _shot/shot.js --scene 1 --wait 12000 --eval "(function(){ __BF3.enterZone(1); return JSON.stringify({campaignHaz: __BF3.G.haz}); })()"
```

Expected: a hazard id for a campaign zone (Hollow Pass is `gusts`). The delve sets `G.haz = null` immediately after `loadArea()`, discarding whatever the borrowed zone set.

- [ ] **Step 2: Let the floor keep its theme's hazard**

Remove the unconditional `G.haz = null` and let the borrowed stage's hazard stand — but **not from floor 1**. The mode starts you at level 1 with no gear, so the first floor should teach the room, not the weather. Turn hazards on from floor 3, which is also where `zoneTier` first rises.

`hazSetup` must run for the hazard to have furniture (braziers, vents, thorns). Confirm it is reached on a delve floor; if `loadArea` skips it for the delve, call it explicitly after the floor builds.

- [ ] **Step 3: Prove a floor is still finishable with the hazard live**

```bash
node harness/test-levels.js
```

Expected: no new failures. Then walk three delve floors specifically — 3, 6 and 9 — and confirm each reaches its stairs. A gloom floor with no braziers is unwinnable, which is exactly the class of bug the level tester exists to catch.

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html
git commit -m "delve: floors keep their theme's hazard from floor 3, so depth changes how you play and not just the palette"
```

</details>

---

### Task 2: Floors sized for a roguelite — **CLOSED 2026-08-12 WITHOUT BEING CARRIED OUT. THE FLOORS ARE ALREADY A THIRD OF A CAMPAIGN AREA.**

Step 1 exists to decide this task and it decided it, in the direction its own skip branch names.
The premise is false twice over, and the second half is false in exactly the way Task 1's was.

**The numbers, measured rather than read** — `harness/probes/delve-size.probe.js`, route distance
over the level's own walkable surface with the maze walls subtracted, converted to seconds with a
top speed measured on the real body in the same launch:

```
                        route (units)   walk (s)   rooms   mobs
The Outskirts, area 0        6958           37       17     41     <- the campaign control
delve floor 1                2175           22       10     21
delve floor 3                1200           12        7     13
delve floor 5                1888           19       11     25
delve floor 10               1891           20       12     32
delve floor 15               2037           21       11     41
delve floor 20               2942           30       13     41
```

**A delve floor is 12 to 30 seconds of walking against a campaign area's 37.** The plan's stated
target — "roughly a third of campaign length" — is where the mode already is.

**THE RULER WAS CROSS-CHECKED BEFORE IT WAS BELIEVED, and this is the reason to trust the table.**
The probe is its own control: pointed at anything that is not a delve floor it measures that level
once, in the same units, so the comparison is not made across two instruments. Pointed at The
Outskirts it says **37 seconds**. `harness/test-levels.js` has independently recorded that same
level at **2305, 2308 and 2317 ticks** with a completely different method — a planner plus the real
body, driven tick by tick — which is **38.4 seconds**. Two instruments that share no code agree
within 4%.

**Why the plan read it the other way, and it is Task 1's fault line again.** The table at the top of
this file says *"Floors are campaign levels — `loadArea()` at 14311 runs the zone's own generator"*
and prices one at *"~4,500 units built for a ten-minute traversal"*. Three things wrong:

1. **A delve floor is not a campaign level.** The two scape dispatches are both guarded on
   `!G.delve` (index.html:7297 and 7304), so the delve deliberately falls through to the shared
   grid-graph maze — the same one the class trials use. It borrows a zone's *stage* for the palette
   and its *hazard*, and nothing else. This is the identical misreading that sent Task 1 after a
   `G.haz = null` that was never the assignment that decided anything.
2. **A campaign area is 6958 units, not ~4,500.**
3. **It is 37 seconds, not ten minutes.** Nothing in this repo has ever measured ten.

**And shortening the floors would UNDO a deliberate decision that is already in the source.**
index.html:7346 has carried this since `3ab7556` on 2026-08-03, eight days before this plan was
written:

> THE ENDLESS DUNGEON is WIDE and BRANCHING, which is what separates it from the Abyssal Descent.
> That mode is about combat endurance in one arena after another; this one is about exploration,
> routing and map-reading, and neither of those exists in a corridor.

The grid grows with depth on purpose (GX 6→9, GZ 5→8, plus `TSCALE` 1.2). **An autopilot run
that shortened these floors would be reverting a stated design intent on a falsified argument**,
which is what Task 1 refused to do and for the same reason.

**RE-MEASURED ON RECOVERY, 2026-08-12, AND ONE LINE OF THE ABOVE DID NOT SURVIVE IT.** This work was
recovered from a stash no commit contained (see the commit message), so it was re-run rather than
trusted. The conclusion holds and is now measured twice on two different maze seeds; one supporting
sub-claim does not, and it was this paragraph's:

| | floor 1 | 3 | 5 | 10 | 15 | 20 | control |
|---|---|---|---|---|---|---|---|
| first run, sec | 22 | 12 | 19 | 20 | 21 | 30 | 37 |
| recovery run, sec | 18 | 15 | 28 | 20 | 22 | **16** | 37 |

**The delve mazes are generated per run, so a per-floor route length is a SAMPLE, not a property of
the depth.** The original text read "floor 20 is 13 rooms and 2942 units against floor 1's 10 and
2175" as the grid growth showing up in the route; on the second seed floor 20 came back **10 rooms
and 1557 units against floor 1's 10 and 1740** — shorter than floor 1, and the ordering reversed.
The grid dimensions do grow (that is in the source and not in doubt); the WALKED ROUTE is dominated
by maze randomness and does not grow monotonically with depth. Do not quote a single floor's
distance as evidence of anything.

**What reproduced exactly is the control, and that is what makes the ruler trustworthy.** The
Outskirts is a hand-authored scape, so it is deterministic, and the recovery run returned the same
numbers to the digit: **route 6958, line 6725, 17 rooms, 41 mobs, 3150 cells, speed 3.13, 37s.** The
delve body's measured speed also reproduced exactly at **1.62**. So the instrument is stable and the
spread in the table above is the levels changing, not the ruler drifting.

**The task's verdict is unchanged and is now better supported than when it was written:** across
twelve floor measurements on two seeds, every single one falls between 12 and 30 seconds against the
campaign area's 37. Nothing measured is anywhere near the "ten-minute floor" the task was written to
fix.

**What is honestly left here is Oliver's, and it is one question:** the numbers above are TRAVERSAL
only — no combat, no dead ends taken and backed out of, no locked door. A floor also holds 13 to 41
mobs. Whether a floor *plays* long is a pacing judgement about fighting, not a distance this or any
probe can settle, and `docs/VISION.md` puts "whether something is FUN" on the list a run may not
answer for itself. Put to him as: *the floors are a third of a campaign area to cross and hold up to
41 enemies — does a run of twenty of them drag?*

- [x] **Step 1: Measure what a floor currently costs** — done 2026-08-12, and it triggers this
      task's own skip branch. Committed as `harness/probes/delve-size.probe.js` so the next run
      reads numbers rather than re-deriving them, and it doubles as the campaign control.

**THE LEVEL WALKER CANNOT BE POINTED AT A DELVE FLOOR, and that is a limit of the navigator rather
than a fact about the mode — worth recording because the step as written asks for it by name.**
`harness/probes/level.probe.js` plans over `surfaceHeightAt()`, which does not report a maze wall
at all — index.html:8104 only considers a wall carrying `stand`, and the maze's `h:96` walls have
no such flag — while the body collides with every one of them (8749 concats `G.walls` into the
solid list). So the planner routes straight through the walls, the body is stopped by the first,
the takeoff cell is struck off, and after fourteen re-plans the floor comes back as one the body
could not follow. That is a false negative about a level a player finishes, which is exactly what
`test-levels.js` routes to `unproven` rather than to a verdict.

*Two things the probe got wrong first, both silently, and both fixed by measurement:*
- **its first version reported NO ROUTE AT ALL on floors 10, 15 and 20.** It stepped one 60-unit
  cell at a time, and about 60% of this maze's corridors are built as parkour bridges
  (index.html:7426) — stepping stones with real gaps. A measure that cannot jump cannot leave the
  entry room of a floor whose corridors all rolled parkour. It now takes edges up to the walker's
  own 260-unit reach, charges each its true length, and refuses any edge whose straight line passes
  through a wall — without that last test a 260-unit hop clears a 14-thick wall and measures a route
  no player can take, which is the geometric-answer-to-a-kinematic-question that shipped Castle
  Duskmoor unclimbable.
- **it reported a top speed of exactly 0**, twice. The delve's entry room is walled, so a body
  driven in one direction for two seconds is pinned against a wall long before the window closes and
  an average over it is an average of zeroes. The bar is now the fastest single tick, driven both
  ways. The speed it finds is worth its own line: **1.62 units/tick in the delve against 3.13 in The
  Outskirts** — the delve hands out a fresh level-1 body with a starter weapon, so it walks at half
  the campaign hero's pace. Any comparison made in UNITS rather than seconds would have been wrong
  by a factor of two in the direction that makes the delve look short.

- [x] **Step 2: Shorten the floor** — **REFUSED, measured.** The floors are already a third of a
      campaign area, and the width is a stated design decision from `3ab7556`. See above.
- [x] **Step 3: Prove every floor still completes** — nothing was changed, so there is nothing to
      re-prove. The floors' own completability is unmeasured for a different reason (the walker
      cannot route a maze), which is recorded above rather than glossed and is the real next piece
      of work in this area.
- [x] **Step 4: Commit** — the probe, the `--scene delve:<floor>` destination it needed, and this
      closure. No behaviour change.

<details>
<summary>The task as originally written</summary>

- [ ] **Step 1: Measure what a floor currently costs**

Walk floors 1, 5 and 10 with the level walker and record ticks-to-exit for each. Convert to seconds at 60 ticks/second. That number is the argument for or against this task — if a floor already takes two minutes, skip the task and record why.

- [ ] **Step 2: Shorten the floor**

The generators take a z-span. Rather than editing a generator, set the delve's own span before `loadArea()` so the same generator emits a shorter level. Target roughly a third of campaign length.

If the span is not reachable from `loadDelveFloor`, the fallback is to move the exit portal closer after the level builds — but only to a point the walker can still reach, verified, not assumed.

- [ ] **Step 3: Prove every floor still completes**

```bash
node harness/test-levels.js
```

Plus the walker on floors 1, 5, 10 and 15. Record the new ticks-to-exit beside the old.

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html
git commit -m "delve: floors are a roguelite floor long, not a campaign area long

Before: <n>s to the stairs on floor 5. After: <n>s."
```

</details>

---

### The Endless Dungeon has been photographed, and that is new

`--scene delve:<floor>` (`harness/shot.js`, 2026-08-12) is the mode's first camera. Until it went in
the delve had never been in front of one, and it is the place in the game where that cost the most:
every other destination lands on a hand-authored scape, so **nothing any zone render has ever shown
says anything about a delve floor**. The maze underneath was reachable only through `--scene trial`,
which is one hand-sized arena.

The floor argument is not cosmetic — the grid grows with depth and the stage rotation re-themes
every two floors, so `delve:1` and `delve:20` are two different levels, and this follows `abyss` and
`arena` in taking the thing that changes the level as its argument.

**It had to learn to dismiss a card, and the first render is why.** Every floor load raises the area
briefing over the level (`shadeGo`, index.html:1299), and the run-up's own dismiss whitelist cannot
reach it — that interval is cleared in the same `setTimeout` that enters the destination, so it has
already stopped by the time the floor exists. The first delve render came back a perfectly composed,
correctly-lit **photograph of a page of text**, with `ready ✓`, `at → The Endless Dungeon · floor 1`
and world3d built: the exact "complete, plausible, WRONG picture" this harness's own header warns
about, arriving from a direction it had not covered. The destination now clicks it on a short
interval and the ready test requires the card to be gone.

**What the first clean picture shows** (`_shot/out/delve5.png`, floor 5, zone 2/8): the maze reads as
a place — 3D cobbled floor, torchlight, the Shade standing by. **And its walls are untextured flat
boxes.** The floor is converted and the walls are not, which is a 3D-conversion gap nobody could have
found before there was a way to look at it. Not chased here — it is a conversion item, not an
Endless Dungeon one — but it is now a thing that has been seen rather than a thing nobody had
checked.

---

### Task 3: A reason to run it twice — **BLOCKED ON OLIVER 2026-08-12. THE REWARD IT SPECIFIES DOES NOT EXIST, AND SKINS ARE NOT COSMETIC.**

`meta.delveBest` is a number on a death screen. The mode needs something that changes the NEXT run.
That framing still stands. **Step 2 as written cannot be carried out**, for two reasons, both read
off the source rather than guessed, and the second one falsifies the task's own justification.

**1. The mechanism already exists — for the OTHER mode — so this is a missing reward, not missing
wiring.** `ACHIEVEMENTS` (index.html:2610–2619) ends with exactly the shape Step 2 describes:

```js
{id:'ascended',name:'Ascended',desc:'Reach Floor 12 of the Abyssal Descent — the deeper you fall,
 the higher you rise',icon:'⬢',skin:'celestial',check:m=>(m.endlessBest||0)>=12}
```

A depth-gated permanent skin unlock, keyed on `m.endlessBest`. The delve's twin of that field is
`meta.delveBest`, and the grant path (2628) is one line. **The engineering here is a single table
row.** Nothing needs inventing except the reward itself.

**2. And there is no reward left to hand out.** `SKINS` (2577) holds **twelve** entries. Ten are
already claimed by an achievement — `ranger`, `emerald`, `frost`, `gold`, `arcane`, `shadow`,
`crimson`, `abyss`, `void`, `celestial`. The other two are `knight`, the starting default, and
`god`, the cheat. **Every non-default skin in the game is spoken for.** Step 2 says to "reuse the
existing skin unlock path rather than inventing a reward system"; that path has an empty hand. A new
skin is new ART, which `AUTOPILOT.md` forbids an autopilot run from authoring.

**3. THE PLAN'S REASONING IS FALSE ANYWAY, AND THIS IS THE PART THAT MATTERS.** Step 2's whole
argument is *"Cosmetic on purpose… Power would break both the promise and the campaign's ownership
of progression."* **Skins in this game are not cosmetic.** `SKINPASS` (2593) attaches a stat line to
ten of the twelve:

| skin | what wearing it does |
|---|---|
| ranger | +5% move speed |
| frost | −8% dodge cooldown |
| emerald | +5% attack speed |
| gold | +4% damage |
| arcane | +7% magic weapon damage |
| shadow | +7% ranged weapon damage |
| abyss | +4% lifesteal |
| void | **+8% damage** |
| celestial | **+6% damage & +6% speed** |
| crimson | a challenge skin: −12% HP, −10% damage, −8% speed, +12% dodge CD |

Only `knight` and `god` carry none. So "unlock a skin at floor 5/10/15/20" **is** carrying power out
of the delve — the exact thing the task forbids in the sentence that justifies it, and the exact
thing the mode's own opening line forbids (*"Nothing you find here leaves with you — only how deep
you went"*). An autopilot run that implemented Step 2 literally would have shipped a progression
reward while quoting a comment saying it must not.

**What is left is one question, and it is Oliver's**, because every answer is art, tone or balance:

- a **new skin** for the delve — art, his by rule; and it would need a `SKINPASS` line, which is a
  balance number, or be the first skin since `knight` deliberately carrying none;
- a **title / nameplate** — no such system exists, so this is a new feature, not a reward hookup;
- accept that the reward carries **power**, which is a balance call and contradicts the mode's
  stated promise;
- or give the delve **`knight`-style flat cosmetics** by adding a no-passive skin tier.

Put to him as: *the Endless Dungeon has no reward for going deeper because every skin is already
claimed by an achievement and skins carry stat bonuses anyway — do you want a new delve skin, a
title system, or should depth stay a number on the death screen?*

**Steps 1, 3 and 4 are left unticked deliberately.** Step 1 (read how the delve grants a class) was
done and is folded into the note above; Steps 2–4 depend on a decision that has not been made, and
ticking them would say this task was finished when it was declined.

**Files:**
- Modify: `public/3d/index.html`

- [x] **Step 1: Read how the delve already grants a class** — done 2026-08-12. `delveMaybeDropClass`
      (13556) restricts class drops to classes already unlocked in the campaign, and that restriction
      is deliberate and stated. Left alone, as the step asks. The finding that matters came from
      reading one table further: `ACHIEVEMENTS` already does depth-gated skin unlocking for the
      Abyssal Descent, and `SKINPASS` means skins are not cosmetic. See the closure above.

`delveMaybeDropClass` (13556) drops a class as loot, restricted to classes already unlocked in the campaign, with guaranteed floors plus a small roll elsewhere. That restriction is deliberate and stated: finding an unearned class would give the delve a progression the campaign owns.

- [ ] **Step 2: Add a depth-gated cosmetic unlock, and nothing else**

Reaching a new deepest floor unlocks a cosmetic — a skin or a title — permanently, in `meta`. Cosmetic on purpose: it survives the mode's promise that nothing you FIND leaves with you, because it is not something you found, it is something you did. Power would break both the promise and the campaign's ownership of progression.

Gate at floors 5, 10, 15, 20. Reuse the existing skin unlock path (`meta.unlockedSkins`) rather than inventing a reward system.

- [ ] **Step 3: Prove it persists and cannot be farmed**

Assertion: reaching floor 5 sets the unlock; dying and re-running does not grant it twice; the escrow still returns gold, hero and stash exactly as before. That last one is the one to watch fail — the delve's whole contract is that a run cannot cost you anything.

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html
git commit -m "delve: going deeper than you ever have leaves a mark, and nothing else does"
```

---

## What this deliberately does not do

- **No new generator.** The mode's variety problem is hazards being off, not the levels being wrong. Writing a delve-specific generator before turning the hazards back on would be building a second thing to test.
- **No power carried out.** Every temptation here breaks the one sentence the mode opens with.

## Self-Review

**Spec coverage.** The three findings in the table map to Tasks 1, 2 and 3. The fourth observation — class-as-loot limited to unlocked classes — is explicitly left alone in Task 3 Step 1, with the reason quoted from the code.

**Placeholder scan.** Task 2 Step 1 measures before it changes anything and has an explicit "skip this task" branch. Commit messages carry `<n>` placeholders that the measurement fills in — those are outputs, not unresolved decisions.

**Risk carried forward.** Task 1 turns on hazards the delve has never run with. Gloom in particular needs braziers placed, and `hazTopUp` historically furnished only the rooms that existed when it ran. If a delve floor builds rooms after `hazSetup`, gloom will be dark with no safe ground — the walker must be run on a gloom floor specifically, not just on floor 3.
