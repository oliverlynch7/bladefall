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

## 2. How far apart can the two pictures get? 380–562 units in thirty seconds

With nothing correcting position, the size of the disagreement is bounded only by how far a mob can
travel while the two simulations disagree. Measured over 30 simulated seconds of a real engagement —
enemies woken through their own `active`/`dropT` fields, the player walking a wide circle through the
game's own input channel so the mobs are led rather than parked on:

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

> **Drift available: 380–562 units. Reach: at most ~125.** Three to four and a half times over,
> inside half a minute, and the conclusion does not depend on the one term that was not measured
> (`p.r`) — even a generous value for it leaves the gap decisive.

That is precisely the "unfair death" shape the research names: on the guest's screen the thornboar is
across the clearing; on the host's it is on top of them, and the host's is the copy that decides
whether they were hit.

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

Two things to carry into it:

- **Snap or lerp, not both halves of a fight.** The peers themselves are already interpolated
  (`MP.tick`, 11659, `k = min(1, dt*12)`), so the idiom exists in this file and an enemy correction
  should use it rather than teleporting a charging boar across a clearing.
- **It is verifiable here, in the same way its absence was.** The probe above is the known-bad
  already: apply a shifted snapshot as a guest and assert the in-combat enemies DID move and the idle
  ones did not. Today's behaviour — `movedBySnapshot: 0` out of 41 — is a permanent, reproducible
  failing case, so the assertion can be watched to fail before it is believed.

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
