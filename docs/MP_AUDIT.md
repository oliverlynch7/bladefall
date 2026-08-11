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
