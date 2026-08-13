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
   pictures separate **987–1641 units** (`mp-drift.probe.js`). *(Written here as 380–562; that was a
   7.3-second lap mislabelled as thirty — corrected 2026-08-12, see Task 2 below. The error was in
   the direction of understating the problem.)*
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

**THE FROZEN BENCH IS FIXED, 2026-08-12, AND IT WAS NEVER THE OBSERVER'S DEATH. STEPS 6 AND 7 ARE
NOW ANSWERED — one of them in the direction the plan expected and one of them not.**

`harness/probes/mp-mode.probe.js` (new) asked the game when it left play mode rather than guessing
among the ~50 sites that assign it. One launch, one answer: **at tick 438 — 7.3s into an 1800-tick
lap — the player reaches x −17, z 489 and the Warden's Shade raises its card.** `mode` goes to
`'menu'` with the overlay up and exactly one button, `#shadeGo`, whose onclick *is* `resumePlay`
(index.html:1300). The observer was alive the whole time (`hp:100, dead:false`); two previous runs
fixed a death that was never the cause.

The bench now knocks on that door, the idiom `harness/test-skills.js` already uses for the pause
card, and only on doors whose handler is `resumePlay` — never a blind "click the first button in the
overlay", which `AUTOPILOT.md` records taking `tutSkip` and skipping a whole class trial. It reports
`playTicks` and `doorPresses`, so an interrupted lap says so in its own numbers: **`playTicks
1800 of 1800`, `doorsUsed {shadeGo: 1}`, `mode: "play"` in every trial.**

**FIRST CONSEQUENCE, AND IT IS A CORRECTION TO A NUMBER THIS WHOLE SUB-PROJECT QUOTES.** The lap was
only ever live for 7.3 of its 30 seconds, so the drift figure recorded in `docs/MP_AUDIT.md`,
`docs/BACKLOG.md` and this file's own "Why this exists" — *"over 30s the two pictures separate
380–562 units"* — **is a 7.3-second number wearing a 30-second label.** Measured on a lap that
actually runs for 30 seconds, on the same level with the same 41 enemies:

| | net displacement, top of the table |
|---|---|
| recorded as 30s (really 7.3s) | 380–562 |
| **an actual 30s** | **987, 1517, 1641, 1547** (path travelled up to 2018) |

Against a melee reach of ~90–125. **The desync is roughly three times worse than the number this
work was justified with**, which strengthens the case rather than weakening it.

**SECOND CONSEQUENCE: `moved` STOPPED BEING A VALID BAR THE MOMENT THE WORLD STARTED RUNNING.** While
the trials ticked a stopped game, `moved` was clean — nothing but the correction could move a body.
On a live world the mobs are awake and chasing, so trials A and B now read `moved: 7` of 41 **from
their own AI**, and a bar demanding 0 there would fail against a *correct* build. The verdict is now
keyed on `targetsStored`, which is exactly what the wake flag gates (`applyEnemies` writes
`e.mx/e.mz` only when slot 6 says awake) and which no amount of walking can reach:
**0 / 0 / 41 / 41**, verdict `corrected only when the host is awake to it`.

**Step 7's per-frame correction magnitude, on the traced subject** — the number that step asks for,
and which is both cheaper and more honest than a still photograph of six distant mobs:

```
141.8  128.3  87.8  70.2  56.1  44.9  35.9  28.7  23.0  18.4
 14.7   11.7   9.4   7.5   6.0   4.8   3.8   3.1   2.5   2.0
```

Geometric at ratio ~0.8 = `1 − k` with `MP.tick`'s own `k = 0.2`; first frame 141.8 against
707 × 0.2 = 141.4; the twenty steps sum to **700.6 of the 707-unit gap.** So a corrected body
converges cleanly and **is not fighting its own AI** — the thing Step 7 exists to rule out. It settles
to 2 units/frame against the AI's own 8.45-unit best step, well under it.

**STEP 6'S ANSWER IS NOT "CONVERGED", AND THE PLAN'S LEADING EXPLANATION FOR WHY WAS WRONG.** Across
all 41 bodies the residual after 20 frames is **535 of 707**, and `mp-look`'s 2-of-6 reproduces at
population scale. The hypothesis on record was *"an arc slot over the river — the target is a
position the edge guard is supposed to refuse"*, and the reading it named was the floor under the
TARGET. That reading was taken and **it does not predict anything**: 20 targets floored against 21 in
void, residual **462** versus **604**.

**The floor under the target is the wrong number because the guard does not test the target.** It
tests where the body lands after ONE 20% step (index.html:13480, `enemySupport` → `e.x=e.sx;
e.z=e.sz`). Measured with that as the bar, on the same launch:

| | trial C | trial D |
|---|---|---|
| refused entirely (net move ≤ 1 unit on a frame it was pulled 141) | **28** of 41 | **11** of 41 |
| …whose first step lands in **void** | **28** | **11** |
| …whose first step lands on **floor** | **0** | **0** |
| guard-exempt kinds present (`fly`/`goblin` skip the guard, 13481) | 3 | 3 |
| …of those, refused | **0** | **0** |

**Every refused body, in both trials, was refused with its first step in void, and not one body with
a floored first step was ever refused.** The guard-exempt kinds are the built-in control and they
converge every time. That is a two-sided confirmation rather than a correlation: the edge guard is
what holds the correction short, and it does so exactly and only when the intermediate landing spot
has no floor.

**What that means for real play, stated carefully because the probe is synthetic.** A real host
snapshot arrives at 14 Hz and moves a body a few units, so its first step is a few units from ground
the body is already standing on — floored, and the correction lands. The 707-unit diagonal teleport
this probe asks for is what manufactures void intermediate steps, so **most of the 28 is the probe's
own doing and must not be reported as a live defect.** But it is not *only* the probe: it is a
measured mechanism for the exact case this plan's Self-Review named as "the one to watch" — the host
waking a mob the guest has already dragged hundreds of units away. There the first correction *is* a
long step, and this says it can be silently refused rather than merely visible. **Two real machines
remain the check, and this narrows what to look for: not rubber-banding, but a monster that does not
come back at all.**

Trial D (target = another live body's position, so the destination is standable by construction) was
added to test the floored case end to end and **does not settle it** — its bodies are scattered by
trial C first, so its gaps are ~1400 rather than 707 and its subject stops dead at frame 6. It
reproduces the refusal law exactly (11 refused, 11 void-step, 0 floored-step) and nothing more is
claimed from it.

**What is still NOT proven, and Step 6 stays open for it:** the two-simulation lap the step actually
asks for. Everything above is a single applied snapshot on one client. The honest weaker claim the
step allows as a fallback is now fully measured and stated above; the lap-based number is not, and
would need a second simulation of the same level in one page.

---

**Superseded, kept because the reasoning is what led here — what the run before this one recorded:**
What is proven, on the live game:

| | measured |
|---|---|
| the guard, at the apply layer | awake snapshot stores **41 of 41** targets; the same snapshot marked asleep stores **0**; a 6-slot pre-flag packet stores **0**. HP adopted 41 of 41 in all three, so every snapshot demonstrably arrived |
| the pull, in the update | **141.57** units of a 707-unit gap closed in ONE frame — 707 × 0.2, `MP.tick`'s own constant, exactly |

**The three-trial section of `mp-drift.probe.js` still reads every trial as frozen, and that is the
probe, not the game.** It runs after the probe's own 30-second lap, and after that lap `B.update()`
steps nothing — not the correction and not the enemies' own AI, which is the tell: trials A and B do
not involve the new code at all and they froze too. Two causes have been ruled out by measurement
rather than by reading: the update does not throw (`tickThrew: null` on all three) and the observer is
not dead (`player: {dead:false, hp:100}` — the first suspect, and the probe now carries the revive and
reports the receipt so that answer cannot be assumed again). **A frozen bench that reports
`moved: 0` is the shape this whole sub-project exists to catch: it reads exactly like a working
guard.** The next run should find what the lap leaves behind before trusting any number from that
section.

**What `harness/probes/mp-look.probe.js` found, and it is a real question rather than a nuisance.**
Six mobs were told, as an awake host would, that they stand in a 220-unit arc in front of the hero.
Two arrived — `toTarget` **3** and **6** units after 25 frames, from 218 and 222 out — and four did
not (358, 635, 1142, 1393). The leading explanation is the one the plan predicted in Step 3 and it
favours the design: **the correction is applied one line before the game's own edge guard, and the
Outskirts road has water either side** (see `_shot/out/t2-look.png`), so an arc slot over the river is
a position the guard is *supposed* to refuse. That is a hypothesis with evidence, not a finding: the
probe reports the floor under each mob's final position and not under its TARGET, which is the one
number that would settle it. Do that first next run. Nothing here licenses calling the correction
converged in the general case, and this document does not.

- [x] **Step 1: Watch the known-bad fail** — done, before the change: `reconcile: {enemies: 41,
      movedBySnapshot: 0, hpAdoptedFromSnapshot: 41}`, net drift 304–562 units over the 30s lap
      against a melee reach of ~90–125. The known-bad reproduces exactly as recorded.

- [x] **Step 2: Store the host's position as a TARGET, never as a teleport** — done at index.html:12421,
      `if(a[6]){ e.mx=a[2]; e.mz=a[3]; }`, with the fail-safe property stated in the comment as the step
      asks.

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

- [x] **Step 3: Consume the target in the enemy update** — done at index.html:13463, immediately before
      `if(e.kind!=='fly'&&e.kind!=='goblin'){`. All three of the step's "confirm this still holds"
      claims were re-checked against the file rather than taken on trust: the obstacle/edge guard is
      at 13464–13472 (after), the melee contact test at 13473–13475 (after that), and the arena bots
      still `continue` at 13383 (before).

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

- [x] **Step 4: Gate it** — `GATE OK`.

- [x] **Step 5: Prove BOTH directions, in one launch** — done at the apply layer, which is where the
      wake flag is read: 41 targets stored awake, 0 asleep, 0 for a 6-slot packet, all in one launch
      on the same 41 bodies. The step's "write it against a build with the guard forced open" is
      satisfied by trial C rather than by a second build: C *is* that build's behaviour, on the same
      frame and the same bodies, so if C had also stored 0 the other two zeros would be worthless.
      **The end-to-end `moved` half of this step is NOT satisfied** — see the frozen-bench note above.

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

- [ ] **Step 6: Prove the drift it exists to remove is gone** — **STILL OPEN, but for a much smaller
      reason than before, and the bench it was blocked on is fixed.** The fallback claim this step
      allows is now fully measured and written above: a single applied snapshot converges a corrected
      body to **2 units/frame residual over 20 frames, 700.6 of a 707-unit gap**, and where it does
      not converge the cause is measured rather than guessed (the edge guard, refusing 28 of 28
      void-first-step pulls and 0 of 0 floored ones). What is NOT done is the thing the step names:
      a lap driven by a SECOND simulation of the same level at 14 Hz. That needs two worlds in one
      page and nothing here has stood one up.
      **The drift the step wants to compare against is also now a different number** — an actual 30
      seconds is 987–1641 units, not the 380–562 this file was written with. See the correction above.

Part 2 of the same probe already walks the player a 30s lap and reports each mob's net
displacement — 380–562 units today. Re-run it with a host snapshot applied at the real 14 Hz from a
second simulation of the same level. Expected: net displacement between the two pictures collapses
to the residual of a lerp that is being fed 14 times a second, i.e. far inside the ~90–125 unit
melee reach. **State the number; do not claim "fixed" without it.**

If standing up a second simulation in one page proves impractical, say so in the task and fall back
to the honest weaker claim — a single applied snapshot converges the gap to under X units in Y
frames — rather than reporting a number that was not measured.

- [x] **Step 7: LOOK at it, because rubber-banding is a picture, not a number** — **DONE 2026-08-12,
      as the number rather than the picture, which is what this step's own text asks for as the
      cheaper half.** The per-frame correction magnitude on a corrected body is
      `141.8 → 2.0` over twenty frames, geometric at `1 − k` for `MP.tick`'s own `k = 0.2`, summing
      to 700.6 of a 707-unit gap. The bar this step sets is *"if a settled mob is being moved more
      than its own AI step (8.45 units at the top end) every frame, it is fighting the correction"* —
      it settles at **2.0**, comfortably under, so it is not. The trace lives in
      `mp-drift.probe.js`'s trial rows as `perFrameStep`, so every future run of the bench reports it.

      **The photograph is deliberately NOT claimed, and the reason is recorded rather than glossed:**
      a still frame cannot show rubber-banding, which is what the first attempt below discovered the
      expensive way. A trace of the correction magnitude is the honest instrument for a motion
      artefact, and it is what this step asked for in its own second paragraph.

      The first attempt is kept because of what it says about how to do it.
      `harness/probes/mp-look.probe.js`
      puts an awake host snapshot in front of the camera and renders the result
      (`_shot/out/t2-look.png`). The frame is a clean, correctly-lit shot of the Outskirts road — and
      it does **not** show the arc legibly enough to be evidence either way, because a mob 220 units
      ahead of a hero on a fixed look-down camera is small and the two that arrived are hard to
      distinguish from the four that did not. **A still frame of six mobs is not a picture of
      rubber-banding anyway**, which is the honest version of this step: what it needs is either a
      close camera on ONE corrected mob (`--focus` on the subject, working range 200–400) or a
      per-frame trace of the correction magnitude, which is the number this step already asks for and
      which is cheaper than the photograph.

```bash
node _shot/shot.js --scene 0 --pre @harness/probes/guestsync.pre.js --out _shot/out/guestsync.png
```

Also report, from the probe, the **per-frame correction magnitude** once converged. If a settled mob
is being moved more than its own AI step (8.45 units at the top end) every frame, it is fighting the
correction and the reader is entitled to know before Oliver plays it.

- [x] **Step 8: Commit** — `cb47393`, its own commit so Oliver can revert the correction alone after a
      match, with the commit message stating in full which half is measured and which is not.

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
