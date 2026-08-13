# What a co-op guest actually sees — 2026-08-11

Sub-project D, Task 2. Every number below is a measurement taken by
`harness/probes/mp-drift.probe.js` against the live game at `--scene 0` (The Outskirts, 41 enemies),
not a reading of the source.

```bash
node _shot/shot.js --scene 0 --eval @harness/probes/mp-drift.probe.js
```

## The verdict

**Yes — a guest can be hit by an enemy that is visibly somewhere else on their screen.** The plan
that commissioned this audit allowed for it to end in "no change needed". It does not.

> ## ⚠ THAT SENTENCE IS FALSE, AND IT WAS MEASURED FALSE ON 2026-08-12
>
> **`harness/probes/mp-whohits.probe.js`. Verdict: `LOCAL copy hits the guest`.** A guest is hit by
> exactly the enemy it can see, where it can see it. Everything else in this section is a
> measurement and stands; this one line was an *inference* from "position is never reconciled", and
> it only follows if a host's copy decides a guest's damage. It does not — which is why it read like
> a measurement and survived a day at the top of `docs/BACKLOG.md`.
>
> | trial | the guest's own copy | every host snapshot says | HP lost in 3s |
> |---|---|---|---|
> | A | on top of the guest | 500 units away | **261** |
> | B | 500 units away | on top of the guest | **0** |
> | C — control | 500 units away | 500 units away | **0** |
>
> Snapshots go through `MP.applyEnemies` — the real receive path — once per frame, four times a real
> host's 14 Hz, so the host's picture cannot be called stale. The control reading zero is what makes
> A and B mean anything.
>
> Enumerated afterwards, and it agrees: `hurtPlayer` has thirteen call sites (hazards 8841–8945, the
> arena bot 12902, boss telegraphs 13327/13332/13335, melee contact 13471, a projectile 13504, a beam
> 13806) and every one tests the LOCAL `G.p` against a LOCAL body. The host→guest message set
> (`onGuestData`, 12232–12268) is hello/place/arena/teams/state/revive/wipe/pdmg/petdmg/score/cfx/
> mark/ping/pong, and the only one that damages the receiver is `pdmg`, which is PvP.
>
> **The desync is still real and still worth fixing — for a different and larger reason.** What it
> costs is that co-op is two solo games in one room: health bars belong to bodies somewhere else,
> the two players cannot fight the same monster or warn each other about one, and the world ping
> points at empty ground. See `docs/superpowers/plans/2026-08-12-guest-enemy-positions.md`, which is
> built on this correction.
>
> *The probe was wrong twice before the game was, and both faults are worth keeping.* Its first two
> runs came back with the subject on top of the player in **all three trials, including the both-far
> control** — every trial "conclusive" and the verdict meaningless. The cause is the edge guard at
> 13463: an enemy standing where `highestSurfaceAt` returns nothing is put back at `e.sx/e.sz`, its
> last safe spot, so a subject teleported diagonally onto a hazard silently RETURNED to where trial A
> had left it. The far spot is now chosen by scanning sixteen bearings for one with a floor, and
> `e.sx/e.sz` is restaged with it. The fix came from making the probe **print the subject's position
> every 45 frames** rather than from a third guess about it — the Dead Aim lesson in a new place: a
> bar that fails tells you *that* something is wrong and never *what*.

The reason is simpler and larger than the drift-versus-latency question it expected to weigh:

> **Enemy position is never reconciled at all.** The host puts `x` and `z` in every snapshot and the
> guest throws them away for any enemy it already has.

So this is not a question of how far a guest's picture lags the host's. Nothing pulls the two
pictures back together, ever, for the entire length of a run.

## 1. Does a host snapshot move a guest's enemies? No — and it moves their HP

Asked by DOING it rather than by reading `applyEnemies`: a snapshot was built from the 41 live
enemies with **every x and z shifted 500 units**, the game was put into guest mode for exactly the
length of that one call, and the enemies were measured afterwards.

| | result |
|---|---|
| enemies in the snapshot | 41 |
| moved by the 500-unit shift | **0** |
| adopted the snapshot's HP | **41** |
| the call threw | no |

The HP column is what makes this conclusive rather than a null result. The same call, on the same
enemies, in the same instant, applied one field and ignored the other — so the snapshot arrived, was
parsed, and was acted on. Position was simply not among the things it acts on.

Confirmed against the code once the measurement pointed at it: `MP.enemySnap()` (index.html:11722)
emits `[mid, typeId, x, z, hp, maxHp]`, and `MP.applyEnemies` (11733) reads `a[2]`/`a[3]` **only in
the branch that spawns an enemy the guest has never seen**. For an enemy it already holds it writes
`maxHp` and `hp` and nothing else. The data has been on the wire the whole time.

## 2. How far apart can the two pictures get? Roughly 1000–1700 units in thirty seconds

> ### ⚠ THE ORIGINAL FIGURE IN THIS SECTION WAS 380–562, AND IT WAS SEVEN SECONDS CALLED THIRTY
>
> Corrected 2026-08-12. **The lap that produced the table below stopped after 7.3 of its 30
> seconds and nobody could tell**, because a stopped game and a quiet one produce the same
> table. `harness/probes/mp-mode.probe.js`: at tick 438 the player reaches x −17, z 489 and the
> Warden's Shade raises its card, `mode` goes to `'menu'`, and `update()` returns at its third
> line for the remaining 1362 ticks (index.html:13038). The observer was alive throughout —
> two earlier runs fixed a death that was never the cause.
>
> `mp-drift.probe.js` now knocks on that card's own `#shadeGo` button (whose onclick *is*
> `resumePlay`, 1300) and reports `playTicks` so the failure can never be silent again:
> **1800 of 1800, one door press.** Re-measured on a lap that actually runs for 30 seconds, same
> level, same 41 enemies:
>
> | enemy | radius | travelled | net displacement |
> |---|---|---|---|
> | thornboar | 18 | **2018** | 987 |
> | grunt | 15 | 1711 | 1517 |
> | thornboar | 18 | 1690 | **1641** |
> | thornboar | 18 | 1591 | 1547 |
> | flyer | 15 | 1560 | 1558 |
> | caster | 13 | 1036 | 1034 |
> | thornboar | 21 | 888 | 887 |
>
> **The disagreement is about three times larger than this document has been claiming**, so every
> conclusion below holds a fortiori. Section 3's ratio becomes roughly **8 to 13 times reach**, not
> three to four and a half.
>
> **RE-RUN INDEPENDENTLY on a second launch (2026-08-12, the recovery run), and the split between
> what reproduced and what did not is itself the finding.** Reproduced to the unit: `playTicks 1800
> of 1800`, `doorsUsed {shadeGo:1}`, `doorFailed 0` — the lap really does run for its full thirty
> seconds now — and most of the travel table (`1591/1547`, `1560/1558`, `1036/1034`, `888/887` all
> came back identical). **What did NOT reproduce is the top of the table**: the second launch's
> longest net displacement was **1730** over 1778 travelled, against 1641 over 1690 here, and the
> largest travelled row was 1778 rather than 2018. The level is deterministic; the handful of mobs
> actually engaging the player are not, because their AI branches on where the observer happens to
> be when they wake. **So quote this as "roughly 1000–1700 units", not as a reproducible 987–1641** —
> a later run that reads 1730 has not found a regression. The order-of-magnitude conclusion (an
> order over reach, not a fraction of it) is unaffected, which is the only thing section 3 leans on.

With nothing correcting position, the size of the disagreement is bounded only by how far a mob can
travel while the two simulations disagree. Measured over 30 simulated seconds of a real engagement —
enemies woken through their own `active`/`dropT` fields, the player walking a wide circle through the
game's own input channel so the mobs are led rather than parked on (**the table immediately below is
the superseded 7.3-second reading, kept so the correction above can be checked**):

| enemy | radius | travelled | net displacement |
|---|---|---|---|
| thornboar | 18 | **562** | 562 |
| thornboar | 18 | 481 | 457 |
| thornboar | 18 | 454 | 453 |
| grunt | 15 | 454 | 454 |
| flyer | 18 | 411 | 411 |
| caster | 13 | 390 | 390 |
| flyer | 15 | 380 | 380 |

41 of 41 still alive at the end, so nothing here is a survivor-selection artefact.

This is the honest number to compare against, and it is worth being explicit about why: two clients
run the same AI, but they chase **different players**. The instant a mob picks the host on one screen
and the guest on the other, the pictures start separating at the mob's full running speed and never
converge.

## 3. Against reach

An enemy's melee reach is `((e.weapon && e.weapon.range) || 60) + e.r + p.r` (index.html:12168), and
the hit lands if the player is inside `reach + 16` when the telegraph resolves (12218). With the
radii measured above, that is roughly **90–110 units**, and it is **at most ~125** for any plausible
player radius.

> **Drift available: ~1000–1700 units. Reach: at most ~125.** Eight to thirteen times over, inside
> half a minute, and the conclusion does not depend on the one term that was not measured
> (`p.r`) — even a generous value for it leaves the gap decisive.
> *(Originally written as 380–562 and "three to four and a half times over", from a lap that ran
> for 7.3 seconds rather than 30 — see the correction in section 2. The direction of the error is
> toward understating the problem.)*

That is precisely the "unfair death" shape the research names: on the guest's screen the thornboar is
across the clearing; on the host's it is on top of them, and the host's is the copy that decides
whether they were hit.

### ⚠ THAT REACH FORMULA IS THE ARENA BOT'S, AND CAMPAIGN MOBS NEVER RUN IT — corrected 2026-08-13

`((e.weapon && e.weapon.range) || 60) + e.r + p.r` now lives at **12947**, and `reach + 16` at
**12997**. Both are inside **`botAI`** — the player-like combat AI used by Arena bots and duel bots.
The campaign enemy loop `continue`s past it on its second line (13476, `if(e.bot){ botAI(e,dt);
continue; }`), so **no campaign monster has ever used this number.**

What a campaign mob actually damages you on is the radius sum in the enemy update, **13573**:
`dXZ(e.x,e.z,p.x,p.z) < (e.r + p.r)`. Measured on the 41 bodies of The Outskirts by
`harness/probes/mp-twoworlds.probe.js`: **26 minimum, 34 maximum, 29 mean** — roughly a quarter of
the 90–125 this section claimed.

**The conclusion does not change; it gets sharper.** Drift available ~1000–1700 against a contact
reach of 26–34 is thirty to sixty times over, not eight to thirteen. The 90–125 figure is left above
rather than deleted because it is the number every other document in this repo was written against,
and a reader who finds only one of the two will not know which they have.

### The separation is now measured against a real second picture, not inferred

Everything above infers the separation between two clients from how far a single mob *travels*, which
is an upper bound. `harness/probes/mp-twoworlds.probe.js` (2026-08-13) builds the level twice at the
same `runSeed` through the game's own guest path and replays one build's packets into the other:

| over a 30s lap | mean separation | worst body |
|---|---|---|
| slot 6 stripped — the pre-flag packet | **82** | **1017** |
| slot 6 sent — shipped | **2** | **10** |

It also corrects the send rate this document quotes. `_sendT >= 0.07` **resets to zero rather than
subtracting** (12439), so at a locked `dt` of 1/60 the gate fires on every fifth frame: **360 packets
in 30.0 seconds — 12 Hz, not 14**, in every lap of every run.

## What this is NOT

No session was held and no packet crossed a wire. This measures **what the guest's own code does with
a host snapshot**, which is the half that lives in this repo. Latency, jitter and packet loss are not
measured here and cannot be — **two real machines remain the final check**, and this audit makes that
check cheaper rather than replacing it, because the thing it found does not need a network to
reproduce.

Nor is it a claim about how bad it feels in practice. It says the mechanism is present and the
magnitude is large. Whether it is the thing that makes a co-op run feel unfair is Oliver's to judge
from a match.

## The fix, and the one thing to get right

Task 2 Step 3 already states the shape and the measurement above supports it unchanged:

> sync position for enemies currently **in combat with any player**, not for all enemies — the
> existing design deliberately avoids per-frame position sync for bandwidth, and that reasoning stays
> valid for idle mobs.

**AND THE "FOR BANDWIDTH" HALF OF THAT IS ALSO RETIRED, measured 2026-08-12** by
`harness/probes/mp-pos.probe.js`: `enemySnap()` sends **41 of 41** live enemies and **41 of 41** rows
carry the enemy's real x and z, in **989 bytes** at **14 Hz** — 13.8 kB/s that is already being paid.
Using the position the host already sends costs **zero additional bytes**, so bandwidth is not a
reason to be selective about which enemies are corrected.

There is a real reason to be selective and it is a different one. `enemySnap()` does not filter on
`active`, and at the entrance **0 of 41 enemies are awake while all 41 are sent anyway**, each at its
untouched spawn point. So for a mob the host has not woken, the host's position is not a correction —
it is a stale spawn point, and adopting it would drag every monster a guest engages alone back to
where it started. The gate belongs on the host's own wake flag, not on a distance somebody chose.

Two things to carry into it:

- **Snap or lerp, not both halves of a fight.** The peers themselves are already interpolated
  (`MP.tick`, 11659, `k = min(1, dt*12)`), so the idiom exists in this file and an enemy correction
  should use it rather than teleporting a charging boar across a clearing.
- **It is verifiable here, in the same way its absence was.** The probe above is the known-bad
  already: apply a shifted snapshot as a guest and assert the in-combat enemies DID move and the idle
  ones did not. Today's behaviour — `movedBySnapshot: 0` out of 41 — is a permanent, reproducible
  failing case, so the assertion can be watched to fail before it is believed.

## Shipped, and guarded so it cannot quietly regress

**The fix landed 2026-08-12** in two commits kept separate so either can be reverted alone: the
snapshot carries the host's wake flag as slot 6 (`a12b178`, +82 bytes over 41 rows), and a guest
lerps each enemy the host has AWAKE toward where the host says it is, at `MP.tick`'s own `k = 0.2`
(`cb47393`). A corrected body converges `141.8 → 2.0` units per frame over twenty frames — settling
well under the AI's own 8.45-unit best step, so it is not fighting its own movement.

**Three assertions in `harness/test-mp.js`, and its known-bad is `?nopossync=1`** — added under the
same rule the `?sharedloot=1` note above declines: a flag is justified when it disables a behaviour
this repo wrote, and position sync now is one. It gates the STORE (`e.mx`), which is the whole
behaviour, so it fails to exactly the pre-flag code path.

**The bar is the AI, not zero, and that is the part worth copying.** `harness/probes/possync.probe.js`
puts the target 90 units toward the PLAYER, so the mobs that are chasing close some of it themselves;
the asleep trial computes the identical target, sends it with the wake flag clear, and reports how
much the AI closed alone. Measured in the aggregate gate:

| | targets stored | fraction of the gap closed |
|---|---|---|
| asleep — the AI-only control | 0 of 41 | 0.19 |
| awake | **41 of 41** | **0.90** |
| awake under `?nopossync=1` | 0 of 41 | **0.19** |

With the flag on the awake trial closes *exactly* the control's 0.19 — the same number, not merely a
smaller one — so nothing but the AI moved. A suite that asked only "did the enemies move" would have
passed against a build with the correction deleted.

Two things the probe does on purpose. The target is short and toward the player because it is then
floored at both ends, and the game's edge guard refuses any pull whose first 20% step lands over void
— on the +500 diagonal `mp-drift` uses, that is 28 of 41 bodies. And bodies that fail the floor check
are *reported* as `skippedOverVoid` (4 and 5 of 41 here) rather than averaged in, so a trial that
scored almost nothing cannot look like a clean pass.

---

# Is loot shared? No — it already belongs to each player — 2026-08-11

Sub-project D, Task 4. Measured by `harness/probes/loot.probe.js` against the live game at
`--scene 0`, and it is a **correction to the plan that commissioned it**: the research table row
said "No per-player loot ownership" and listed personal loot as missing. It is not missing. It has
been there all along, arrived at from the other direction.

```bash
node _shot/shot.js --scene 0 --eval @harness/probes/loot.probe.js
```

## The verdict

**Every client already rolls its own item from the same corpse, and no pickup is ever transmitted.**

The plan expected the fix to be "on the host, roll one instance per living player and tag each with
the peer id". The game reaches the same end without any ownership tag, because the host never
distributes loot at all:

> The host's packet is `{en, ek}` — an enemy snapshot of `[mid,type,x,z,hp,maxHp]` and a kill list of
> `[mid,type,elite,boss,xp]` (11573, 11625). **There is no item in it.** A guest that receives a kill
> runs its own `killEnemy` under `_authKill` (11775), or `creditKill` (11776) when it never saw the
> body, and both reach `rollDrop` with the guest's own `Math.random()`. `G.pickups` is local, always.

## What was measured

Driving MP's own `applyEnemies` — the real receive path, not an imitation of it — and counting what
lands in the guest's own pickup list. **A shared pool would give 0 in the first two rows.**

| trial | kills | drops | reads as |
|---|---|---|---|
| credited kills — the guest never saw the body | 600 | **31** | ~5.2%, against a designed 5.3% |
| mirrored kills — the guest holds the body and runs its own death | 60 elite | **21** | ~35%, against a designed 33% |
| enemy snapshot with no kills in it | 30 | **0** | no item rides the wire |
| the same call with the guest flag off — negative control | 200 | **0** | the counter can read zero |

All 60 mirrored bodies were dead afterwards, so those drops came from completed kills rather than
from a half-applied event.

## Why this is BETTER than the plan's design, not merely equivalent

A tagged instance is rolled once, by the host, from the host's tables. Here the guest rolls from its
**own** `rarityCap` and its own level, so a lower-level friend is not handed drops banded for the
host's character. It also cannot desync: there is no ownership field to disagree about, because
there is no shared object to own.

## What this does NOT say

No session is held and no peer is real; this is the receive path exercised in one browser, and it
says nothing about a packet arriving. Two real machines remain the final check. Gold, chests and
quest pickups were not measured, though all three are local by the same mechanism — `awardGold`,
`openChest` and the `G.pickups` placed at level build are none of them in any message.

## Guarded, so it cannot quietly regress

Five assertions in `harness/test-mp.js` (mp suite 37 → 42 pass). Deliberately loose: the claim is
"a guest that never landed a hit still earns its own loot", never a drop RATE, because a rate is
Oliver's to tune and a tight interval would turn a balance change into a red gate.

**No `?sharedloot=1` flag was added**, unlike `?breakgap` / `?heroslot` / `?heroonerig` / `?noparty`.
Each of those disables a behaviour this repo wrote. Personal loot here is a property of the packet
never carrying an item, so faking its absence would mean adding a code path to the game that exists
only to be wrong. The negative control in the fourth row does that job honestly instead.

---

# Nobody can take a hit for anybody — there is no aggro model

**Recorded 2026-08-12 from a static sweep in the skill-correctness pass, not from a co-op session.**
It belongs here rather than only in `docs/SKILL_TRIAGE.md` (section K, with the full table) because
its consequence is a party one: **a Paladin cannot pull a monster off a friend, and neither can a
Warrior, because an enemy in this game never chooses whom to attack.**

Melee contact damage goes straight to the local player — `index.html:13244` guards only on
`dXZ(e.x, e.z, p.x, p.z)` and `p` is `G.p`. There is no target-selection step, so there is nothing a
taunt could change. The four fields that carry the idea are all written and read by nothing:
`e.taunt` (set by the Paladin's Taunt, whose own comment says `// pull aggro`), `e._taunt` and
`p.warcryT` (the Warrior's Warcry), and `e.target` (set by Warcry, cleared by the Ninja's Vanish —
and a grep for `.target` in the whole file returns twelve hits of which **ten are DOM events**).

So three classes advertise control over aggro and one of them, Warcry, is a rank-8 climax pick whose
entire shipped effect is a floating text and a ring.

**Not fixed, and deliberately not by an autopilot run:** giving enemies a target to choose is a new
mechanic that changes how every fight in the game behaves, which is far past the bar this repo holds
unattended work to. Put to Oliver as a co-op design question — *should a party have a tank?* — rather
than as a bug list. If the answer is yes it is the largest single thing that would make co-op play
differently from two people soloing in the same room, which is what `docs/VISION.md`'s first priority
asks for.

---

# The world ping named a patch of ground, not the monster — 2026-08-13

Sub-project D's guest-position plan, Task 4. The task was written to be **checked rather than
assumed**, with "no change needed" listed as a real outcome. Half of it was exactly that. The other
half was a defect nobody had looked for, in a different place from where the task expected it.

```bash
node _shot/shot.js --scene 0 --eval @harness/probes/pingtgt.probe.js     # the numbers
node _shot/shot.js --scene 0 --eval @harness/probes/pingpic.probe.js     # the picture
```

## The half that was already fixed — and it is a negative finding worth keeping

The task's premise was that a mark travels as `{x,z,y}` with nothing identifying a body, so **marking
a monster marked bare ground on the other screen**. That was true before Tasks 1–2, and those tasks
retired it without ever being about pings: a guest now adopts the host's enemy positions, so the
sender's coordinates and the receiver's copy of that body are the same place.

Measured rather than reasoned about, both arms in one launch, differing only in the host's wake flag:

| arm | marker-to-body, before the snapshot | after |
|---|---|---|
| host says AWAKE | 90 | **9.8** |
| host says ASLEEP — the control | 90 | 71.2 |

The control is what the guest's own AI closes on its own. **So the multiplayer half of Task 4 needed
no code**, and Step 3's proposed fix — send the mid so the receiver can find the body — would have
been solving a problem two earlier commits had already removed.

## The half that was real, and it was never a multiplayer bug

A mark is its coordinates and **nothing ages them**. `updateMarks` advanced `m.t` and filtered
expired marks; it never touched `m.x`/`m.z`. So the marker stood still for its whole `PING_LIFE` of 5
seconds while the monster it named walked away — **on the sender's own screen exactly as much as on
anybody else's.** Both clients agreed, correctly, about a body no longer under the mark.

The population, over one marker's life in The Outskirts (41 bodies, of which 25 were moving):

| t | movers' median walk | bodies past the 90–125 melee reach |
|---|---|---|
| 1s | 52 | 0 of 25 |
| 2s | 104 | 4 |
| 3s | 156 | 15 |
| 5s | **260** | **20** |

**Read the movers row, not the population median.** Most of a level's bodies are nowhere near anyone
and never take a step, so a median over all 41 measures how much of the level is idle — it came back
0 on one launch and 98 on the next while the movers' number barely moved. The only body anyone pings
is one that is coming for somebody.

**One subject nearly produced the opposite answer.** The first run of trial C drew a `caster`, which
walks to its preferred range and stops: its gap rose to 95 and went flat for three seconds, inside
melee reach, reading as "the marker stays on the body". That is why the probe measures the whole
population as well as the one body the game's own `aimTarget` picked.

## The fix

`addMark` and the `mark` message carry `mid` — the same stable id `applyEnemies` is already keyed
on, so nothing new has to agree between two clients — and `updateMarks` moves a mark that names a
body to wherever that body is. A ground ping (`HERE`) carries no mid and does not move.

**No leash distance was invented**, per the task's own instruction. `MP.byMid` returns nothing for a
dead body, so a marker whose monster dies simply stays where it was and ages out on the same clock.

## Proven both ways in one launch, through MP's own `recvMark`

Two marks dropped on the same body, differing in exactly one field. **The no-mid arm is the behaviour
that shipped before**, which is why this needed no new `?flag`: the negative control is a message the
game still has to handle.

| arm | gap to the body after 4.5s |
|---|---|
| names the body (`mid: 7`) | **0** |
| names no body — the known-bad | **171** |

The body walked **171** units under its own AI in that time, and that number is asserted before
either arm is read: a control that stands still and a test that stands still are the same reading
twice. The probe's first attempt hit exactly that — the player killed the subject inside the 4.5
seconds and both arms read 0 against a corpse — and the trial reported itself inconclusive rather
than passing. The subject is now pinned alive and the intervention is reported.

**And it is a picture as well as a number** (`_shot/out/yb-pingpic.png`): two markers on one
thornboar, 132 units apart — the tracked one standing on the animal, the untracked one back on the
empty grass it was called out from.

## Guarded

Six assertions in `harness/test-mp.js` (mp suite **57 → 63 pass**), including the body's own walk as
a precondition and a `playTicks == ticksAsked` receipt, because a probe that drives the player for
more than a few seconds can have the game stop under it and report a run's worth of plausible zeroes.

## What this does NOT say

No session is held and no packet crosses a wire; this is the receive path exercised in one browser.
Two real machines remain the final check. The extra field is one integer per ping — a message sent at
most once per 0.6s per player — so no bandwidth measurement was thought necessary, and none was made.
