# One Shared World: Guest Enemy Positions (sub-project E)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two people in a co-op run are looking at the same monsters in the same places, instead of
running two independent simulations that agree only about who is dead.

**Architecture:** No new netcode and no new packet. The host's enemy snapshot already carries every
enemy's position; the guest throws it away. This plan makes the guest use it, gated on one new bit
that says whether the host is actually simulating that enemy, and applied through the interpolation
idiom `MP.tick` already uses for peers.

**Tech Stack:** `public/3d/index.html` (the `MP` object, ~12116, and the enemy update loop, ~13381).
Harness runners under `harness/`. Node 26, no npm install.

---

## Why this exists — and the reason in `docs/BACKLOG.md` is NOT the reason

`docs/BACKLOG.md` item 1 and `docs/MP_AUDIT.md` both justify this work with one sentence:

> *"in co-op a guest can be hit by an enemy visibly elsewhere on their screen."*

**That sentence is false, and it was measured false on 2026-08-12 before this plan was written**
(`harness/probes/mp-whohits.probe.js`). It was never a measurement — every other number in that
audit is, which is exactly why it read as one. It is an inference from *"position is never
reconciled"*, and it only follows if a host's copy is what decides a guest's damage. It is not.

Three trials, one launch, in the only arrangement that can come out one way. The subject is pinned,
every other mob is parked 12000 units away, and host snapshots are applied through `MP.applyEnemies`
— the real receive path — **once per frame, four times a real host's rate**, so the host's picture
cannot be called stale:

| trial | the guest's own copy | every host snapshot says | HP the guest lost in 3s |
|---|---|---|---|
| **A** | on top of the guest | 500 units away | **261** |
| **B** | 500 units away | on top of the guest | **0** |
| **C** — control | 500 units away | 500 units away | **0** |

`verdict: LOCAL copy hits the guest`. A guest is hit by exactly the enemy it can see, where it can
see it. The control reading zero is what makes A and B mean anything.

**So nobody is dying unfairly, and this work is still worth doing — for the reason `docs/VISION.md`
puts first.** What the desync actually costs is that co-op is two solo games in one room:

1. **Health bars belong to bodies somewhere else.** HP is host-authoritative and position is local —
   measured in `mp-drift.probe.js`: a snapshot with every enemy moved 500 units changed **0 of 41**
   positions while **41 of 41** adopted its HP. So on a guest's screen a mob standing in front of
   them drops dead untouched, and a full-health one is actually nearly dead on the host's.
2. **The two players cannot fight the same monster, or warn each other about one.** A guest runs a
   complete independent AI simulation: in guest mode with **not one snapshot applied**, 39 of 41
   mobs moved, a mean of **52 units in a single second** (`mp-pos.probe.js`). Over 30s the two
   pictures separate **380–562 units** (`mp-drift.probe.js`).
3. **The ping added in sub-project D Task 5 points at nothing.** A world mark is sent as `{x,z}`.
   Marking the monster about to hit you puts the marker on empty ground on your friend's screen.

That is `docs/VISION.md` priority #1 — *"multiplayer that is actually fun"* — and the same shape as
the aggro finding at the foot of `MP_AUDIT.md`: the largest thing standing between this and co-op is
that the two clients are not sharing a world.

## What was measured before this plan was written

Every number below came from a command, on 2026-08-12, at `--scene 0` (The Outskirts, 41 enemies).
Nothing here is read off the source.

```bash
node _shot/shot.js --scene 0 --eval @harness/probes/mp-pos.probe.js
node _shot/shot.js --scene 0 --eval @harness/probes/mp-engaged.probe.js
node _shot/shot.js --scene 0 --eval @harness/probes/mp-whohits.probe.js
```

**1. The position is already on the wire, so "bandwidth" is not a reason to be selective.** This
retires the second half of BACKLOG item 1's stated fix shape. `enemySnap()` was read rather than
described — the real array, the real JSON length, costed at `MP.tick`'s own send gate:

| | measured |
|---|---|
| row format | `[1, 18, 1300, -1840, 31, 31]` = `[mid, typeId, x, z, hp, maxHp]` |
| rows sent | 41 of 41 live (the 60-row cap is not reached) |
| **rows whose x,z match the live enemy** | **41 of 41** |
| enemy half of the packet | **989 bytes** |
| whole `{t:'state'}` message | 1370 bytes |
| send rate | **14 Hz** (`_sendT >= 0.07`, 12355) |
| enemy bytes per second | **13.8 kB/s** |

**Using the position the host already sends costs zero additional bytes.**

**2. A lerp beats the local AI decisively, so nothing has to be teleported.** The peer idiom is
`k = min(1, dt*12)` (`MP.tick`, 12342). Against the AI it would be correcting:

| | per frame at 60fps |
|---|---|
| the guest AI's fastest step | **8.45 units** |
| its mean step | 0.87 units |
| what `k = 0.2` closes on a 450-unit gap | **90 units** |
| frames to halve that gap | **4** |

Ten times the AI's best frame. A hard snap is not needed and would be visible.

**3. The engaged set is tiny, but that is not what should gate the correction.** Over a 30s lap with
every mob woken (`mp-engaged.probe.js`), sampled twice a second: **within 640 units of the player,
max 1, mean 0.8**; within 300, and within 125, **zero at every one of 60 samples**, while all 41
stayed alive and all 41 stayed in the snapshot. A distance gate would therefore be choosing a number
to select almost nothing. **Task 1 gates on the host's own wake flag instead, which is a field the
game already owns.**

## The trap this plan exists to avoid, named up front

**A guest must still be able to fight something the host has not woken.** Enemies spawn asleep and
the game wakes them when a player comes within 640 units (13384) — but `enemySnap()` does **not**
filter on `active`: measured at the entrance, **0 of 41 enemies were awake and all 41 were sent
anyway**, each at its untouched spawn point.

So a guest who walks ahead wakes mobs locally that the host is still nowhere near, and for those
mobs the host's position is not a correction — it is a stale spawn point. Adopting it would drag
every monster a guest engages alone straight back to where it started, and **a guest could never
fight anything the host was not also fighting.** That would be a far worse bug than the one being
fixed, and it would look exactly like rubber-banding.

This is what BACKLOG item 1's *"only enemies in combat with any player"* was really protecting, for
a reason it did not state. The fix is not a distance threshold; it is to send the one bit that says
whether the host is simulating that enemy at all.

## Global Constraints

- Work on branch `autopilot-merged`. Never `main`.
- Any change to `public/3d/index.html` must pass `node tools/gate.js` (ends in `GATE OK`).
- **Tasks 1 and 2 change how the game PLAYS in co-op.** They land as separate commits so either can
  be reverted alone after Oliver plays a match.
- **No number may be invented.** The interpolation constant is `MP.tick`'s own `min(1, dt*12)`; the
  wake flag is the game's own `e.active`; the wake radius is the game's own 640. If a task needs a
  value the file does not already have, stop and put it to Oliver.
- Every assertion must be watched to FAIL before it is believed. Today's
  `reconcile.movedBySnapshot: 0 of 41` in `mp-drift.probe.js` is a permanent, reproducible known-bad
  and is the first thing each task's proof turns green.
- **Two real machines remain the final check.** Nothing here holds a session or crosses a wire; it
  measures what a guest's own code does with a host snapshot, which is the half that lives in this
  repo.
- `harness/` is ESM. Use `import`/`export`.

---

### Task 1: Tell the guest which enemies the host is actually simulating

One integer per enemy, and it is what makes the whole thing safe. Without it Task 2 cannot tell a
correction from a stale spawn point.

**Files:**
- Modify: `public/3d/index.html` — `MP.enemySnap()` (12405)
- Modify: `harness/probes/mp-pos.probe.js` — report slot 6 and the new byte cost

**TASK 1 IS DONE, 2026-08-12.** Every number below is from two launches of the same probe, before and
after, at the same destination (`--scene 0`, The Outskirts, 41 enemies):

| | rowFormat | enemy bytes | at 14 Hz | whole message | flags set, asleep → awake |
|---|---|---|---|---|---|
| before | `[1,18,1300,-1840,31,31]` | 988 | 13.8 kB/s | 1369 | — (no slot) |
| after | `[1,18,1300,-1840,31,31,0]` | 1070 | 15.0 kB/s | 1451 | **0 of 41 → 41 of 41** |

**+82 bytes over 41 rows is exactly 2 bytes per row**, which is what Step 4 predicted, so nothing has
to be rounded away or explained. The awake reading is the one that matters: Step 5 exists because at
the entrance *every* mob is asleep, so an all-zero column is correct there and a flag hard-wired to 0
would read identically — and would let Task 2 pass its own tests while correcting nothing.

- [x] **Step 1: Watch the probe report a 6-slot row** — done. `rowFormat` six long, `enemyBytes` 988,
      `positionsCarried` 41 of 41, `population.active` 0 of 41. The known-bad reproduces.

```bash
node _shot/shot.js --scene 0 --eval @harness/probes/mp-pos.probe.js
```

Expected, and this is the known-bad: `rowFormat` is six long and `enemyBytes` is ~989.

- [x] **Step 2: Add the wake flag as slot 6** — done at index.html:12409, with the format comment
      above it rewritten to say why sleeping mobs keep being sent whole. `enemySnap` has exactly one
      definition in the file (grep), so the duplicate-body hazard does not apply here.

In `enemySnap()`, append `e.active?1:0` to the pushed row. Nothing else in that function changes,
and no enemy is filtered out — a guest that has never seen an enemy still needs the spawn branch to
be able to create it, which is what slots 2 and 3 are for and why they must keep being sent for
sleeping mobs too.

- [x] **Step 3: Gate it** — `GATE OK`, VERSION3D bumped 1.949.1 → 1.950.0-autopilot.

- [x] **Step 4: Measure what it cost, do not estimate it** — 988 → **1070** bytes, +82 over 41 rows,
      exactly 2 bytes per row; 13832 → **14980** bytes/s at the file's own 14 Hz. Whole state message
      1369 → 1451. Nothing rounded away: the prediction and the measurement agree to the byte.

Re-run the probe. Expected: `rowFormat` seven long with a 0 or 1 in slot 6, and `enemyBytes` up by
roughly two bytes per row (~82 on 41 enemies, ~1.1 kB/s at 14 Hz against the existing 13.8). Record
the real figure in the commit message. If it is materially larger than that, say so rather than
rounding it away.

- [x] **Step 5: Prove the flag is not a constant** — done in ONE launch, which is the only way the
      two readings are comparable: `wakeFlag.asleep {activeEnemies:0, rows:41, flagsSet:0}` then
      `wakeFlag.awake {activeEnemies:41, rows:41, flagsSet:41}`, row `[…,0]` becoming `[…,1]` on the
      same enemy. All 41 rows keep being sent in both states, so no guest loses the ability to spawn
      a mob it has never seen. The probe carries this as its own section 1b.

The probe already reports `population.active`. At the entrance every enemy is asleep, so a snapshot
of all-zeroes is *correct there* and proves nothing. Take the reading in both states in one launch:
report the row set before waking and again after `e.active = true; e.dropT = 0`. Expected: 0 flags
set, then 41. **A flag that is always 0 would let Task 2 pass its own tests while never correcting
anything.**

- [x] **Step 6: Commit** — shipped as its own commit, ahead of Task 2, so Oliver can revert either
      half alone after a match.

```bash
git add public/3d/index.html harness/probes/mp-pos.probe.js
git commit -m "co-op: the enemy snapshot says which enemies the host is simulating

enemySnap appends e.active as slot 6. Position was already in every row; without this
a guest cannot tell a correction from a sleeping mob's untouched spawn point.

Measured: <n> bytes/packet before, <n> after, at 14 Hz. Flag reads 0 of 41 asleep and
41 of 41 awake in one launch."
```

---

### Task 2: The guest adopts the host's positions, for the enemies the host is awake to

**Files:**
- Modify: `public/3d/index.html` — `MP.applyEnemies` (12416) and the enemy update loop (13381)
- Modify: `harness/probes/mp-drift.probe.js` — assert the correction, and assert the sleeping case

- [ ] **Step 1: Watch the known-bad fail**

```bash
node _shot/shot.js --scene 0 --eval @harness/probes/mp-drift.probe.js
```

Expected: `reconcile: { enemies: 41, movedBySnapshot: 0, hpAdoptedFromSnapshot: 41 }`. The HP column
is what makes it conclusive rather than a null result — the snapshot arrived and was acted on.

- [ ] **Step 2: Store the host's position as a TARGET, never as a teleport**

In `applyEnemies`, the existing-enemy branch (12421) currently writes `maxHp` and `hp` and nothing
else. Add, only when slot 6 says the host has it awake:

```js
if(a[6]) { e.mx = a[2]; e.mz = a[3]; }
```

`a[6]` undefined — an older peer, or a packet from before Task 1 — must leave `e.mx` alone, so the
behaviour **fails safe to exactly today's**. State that in the code comment; it is the property that
makes this survivable in a mixed party.

Do not write `e.x`/`e.z` here. A snapshot lands between frames and a 14 Hz teleport of a charging
body is visible; the interpolation belongs in the update, where `dt` exists.

- [ ] **Step 3: Consume the target in the enemy update**

**The line goes immediately before 13459**, `if(e.kind!=='fly'&&e.kind!=='goblin'){` — that is,
after every movement branch (walk 13441, ranged 13446, charge 13452, fly 13438, boss 13458) and
before the obstacle/edge resolution that follows:

```js
if(MP.guest() && e.mx != null){ const mk = Math.min(1, dt*12); e.x += (e.mx-e.x)*mk; e.z += (e.mz-e.z)*mk; }
```

That exact position was chosen for three reasons, and each is a thing to confirm still holds rather
than to take on trust:

- **`resolveObstacles` and the edge guard then VALIDATE the correction.** 13460–13468 pushes an
  enemy out of columns and walls and, if `enemySupport` finds nothing under it, restores `e.sx/e.sz`
  — its last safe spot. Correcting before that block means a correction onto a hazard is caught by
  the game's own guard, and a good one updates `e.sx/e.sz` at 13464 so the guard's memory stays
  right. **The host's position is floored by construction** (both clients build the same level from
  the same seed) so this should never fire; if it does, that is a finding, not a nuisance. It cost
  this plan's own probe two launches when the *probe* teleported a subject onto a hazard.
- **The melee contact test at 13469–13471 is after it**, so the position the damage test reads is
  the corrected one. Note the guard block is gated on `e.kind!=='fly'&&e.kind!=='goblin'`, so
  flyers and goblins are corrected and simply not floor-checked — which matches how they already
  move.
- **There is no `G.bounds` clamp on this path.** That clamp is `botAI`'s (12897) and does not apply
  here; do not go looking for it.

Two more, both cheap to get wrong:

- **Arena bots `continue` before any of this** (13383, `if(e.bot){ botAI(e,dt); continue; }`), so
  they are excluded by construction. Verify that is still true at the line you pick.
- **`MP.guest()` and not `MP.active`.** A host must never correct itself against its own snapshot.

- [ ] **Step 4: Gate it**

```bash
node tools/gate.js
```

Expected: `GATE OK`.

- [ ] **Step 5: Prove BOTH directions, in one launch**

Extend `mp-drift.probe.js` so part 1 applies two snapshots rather than one, because the awake case
alone would pass with the flag ignored entirely:

| the snapshot says | expected after |
|---|---|
| every enemy shifted 500, **awake** | `movedBySnapshot` is 41 of 41 — the correction lands |
| every enemy shifted 500, **asleep** | `movedBySnapshot` is **0** of 41 — a guest keeps the mobs it woke alone |

The second row is the whole safety argument and it is the one that must be watched to fail: **write
it first against a build where Step 2's `if(a[6])` is `if(true)`, confirm it reads 41, then restore
the guard and confirm it reads 0.** A test that only ever sees the correct build is not a test.

Snapshots are applied through `MP.applyEnemies` and the enemies are then ticked, because the pull
now lives in the update — a probe that applies a snapshot and measures immediately will read
`moved: 0` against a working fix. Tick at least 5 frames (four halve the gap; the probe should
report the residual rather than assert a hard equality, since a lerp never exactly arrives).

- [ ] **Step 6: Prove the drift it exists to remove is gone**

Part 2 of the same probe already walks the player a 30s lap and reports each mob's net
displacement — 380–562 units today. Re-run it with a host snapshot applied at the real 14 Hz from a
second simulation of the same level. Expected: net displacement between the two pictures collapses
to the residual of a lerp that is being fed 14 times a second, i.e. far inside the ~90–125 unit
melee reach. **State the number; do not claim "fixed" without it.**

If standing up a second simulation in one page proves impractical, say so in the task and fall back
to the honest weaker claim — a single applied snapshot converges the gap to under X units in Y
frames — rather than reporting a number that was not measured.

- [ ] **Step 7: LOOK at it, because rubber-banding is a picture, not a number**

A correction arriving at 14 Hz against an AI that pushes the other way every frame can converge
perfectly and still read as jitter. Numbers cannot answer that.

```bash
node _shot/shot.js --scene 0 --pre @harness/probes/guestsync.pre.js --out _shot/out/guestsync.png
```

Also report, from the probe, the **per-frame correction magnitude** once converged. If a settled mob
is being moved more than its own AI step (8.45 units at the top end) every frame, it is fighting the
correction and the reader is entitled to know before Oliver plays it.

- [ ] **Step 8: Commit**

```bash
git add public/3d/index.html harness/probes/mp-drift.probe.js
git commit -m "co-op: a guest sees monsters where the host sees them

applyEnemies stores the host's x,z as a target for any enemy the host has awake;
the enemy update lerps to it with MP.tick's own peer constant. A mob the host has
not woken is left to the guest's own simulation, so a guest can still fight ahead.

Verified with mp-drift.probe.js: movedBySnapshot 0 of 41 before, 41 of 41 after,
and 0 of 41 when the snapshot says asleep."
```

---

### Task 3: Guard it so it cannot quietly regress

**Files:**
- Modify: `harness/test-mp.js`
- Modify: `public/3d/index.html` — the known-bad flag

- [ ] **Step 1: Add a permanent known-bad flag**

`?nopossync=1`, in the shape of the existing `?breakgap` / `?heroslot` / `?heroonerig` / `?noparty`.
`MP_AUDIT.md` sets the rule these follow and it applies here: a flag is justified when it disables
**a behaviour this repo wrote**, which position sync now is. It makes the assertion in Step 2
falsifiable forever, rather than only on the day it was written.

- [ ] **Step 2: Assert both directions in the suite**

Three assertions, no more: an awake snapshot moves the guest's enemies; an asleep one does not; and
with `?nopossync=1` neither does. Deliberately loose on the residual — assert the gap closed by most
of the way, never an exact position, because a lerp is tick-quantised and an exact bar would flap.
`harness/test/passives.test.js`'s tolerance note and the Swagger row both record what that costs.

- [ ] **Step 3: Run the aggregate gate**

```bash
node harness/run-all.js
```

Expected: `GATE: PASS`, exit 0, and the mp suite up by three. Exit 1 is a regression — revert. Exit 2
is a crashed suite and is a fault in the harness or the machine, **not evidence about this change**;
read the `CRASHED —` line.

- [ ] **Step 4: Commit**

```bash
git add harness/test-mp.js public/3d/index.html
git commit -m "co-op: guard guest position sync in the mp suite"
```

---

### Task 4: Make the world ping point at the monster it was aimed at

Only worth doing after Tasks 1–2, and cheap once they are in. Sub-project D Task 5 sends a mark as
`{t:'mark',by,n,x,z,y}` — a POSITION, with nothing identifying a body — so before this plan, marking
a monster marked bare ground on the other screen. **This task is here to be CHECKED, not assumed**
— it may well need no code at all.

- [ ] **Step 1: Ask whether it is already fixed**

With positions shared, a mark placed on a monster now lands on that monster. Measure it with
`harness/probes/ping.probe.js` rather than reasoning about it: place a mark on an enemy, apply a
host snapshot, and compare the mark's position with that enemy's.

- [ ] **Step 2: If it is, record the negative finding and stop**

A task that ends in "no change needed" is a real outcome here — sub-project D Task 4 ended that way
and the finding was worth more than the code would have been. Write it into `docs/MP_AUDIT.md` with
the numbers and commit the doc.

- [ ] **Step 3: If it is not, mark the enemy rather than the ground**

Send the mid alongside the position and let the receiver track the body. Do not invent a leash
distance; if one is needed, that is Oliver's.

---

## Self-Review

**Spec coverage.** This is `docs/BACKLOG.md` item 1, and it deliberately does not implement item 1
as written. The item's stated consequence (unfair deaths) is disproved above by measurement, and its
stated fix shape (be selective *for bandwidth*) rests on a premise the packet measurement retires.
Both corrections are carried into `MP_AUDIT.md` and `BACKLOG.md` in the same commit as this plan, so
the next reader does not re-derive them.

**Placeholder scan.** Every task names exact files, exact line numbers as of 2026-08-12, exact
commands and expected output. Task 4 may legitimately end in "no change needed"; that is written in
as a valid outcome rather than left ambiguous. Task 2 Step 6 names its own fallback if the two-
simulation measurement proves impractical, so it cannot quietly degrade into an unmeasured claim.

**Type consistency.** `enemySnap` rows are plain integer arrays and slot 6 follows the existing
`e.elite?1:0` idiom already used in the kill list (12410). `e.mx`/`e.mz` are new fields on the enemy
and are checked absent elsewhere before use — `harness/audit-fields.js` will see them written and
read, which is the state it wants. `MP.guest()` already exists (12399) and is not re-derived.

**Risk carried forward, and it is the one to watch.** The wake flag makes a guest's solo engagement
safe, but it does not make the *transition* safe: the moment the host wakes an enemy the guest has
already dragged 400 units away, the flag flips and the correction pulls it back at 90 units a frame.
That is correct — the host is authoritative — and it will look like a monster being yanked. Task 2
Step 7 is what surfaces it, and if it is bad the honest fix is a slower constant for the first
correction after a flag flip, which is a number and therefore Oliver's.

**A second risk, stated because no task will catch it.** Everything here is measured in one browser
against a synthetic snapshot. Latency and jitter are not simulated anywhere in this harness, and a
correction that converges cleanly against a 14 Hz local loop can still fight a real connection's
arrival pattern. **Two real machines remain the final check** and this plan makes that check cheaper
rather than replacing it.
