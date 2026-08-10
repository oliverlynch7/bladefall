# BLADEFALL — verification-first programme

Design agreed with Oliver 2026-08-10. This spec covers the whole goal set, decomposed into
sub-projects, and defines the autopilot contract that lets work continue between sessions.

## Why this exists

Two things prompted it.

**Oliver, on PvP:** "there was a bunch of skills that didn't do what they said. Some of them said
they would do damage and then didn't, or some of them said they would heal you and then didn't."

**And the session before it:** Castle Duskmoor was built, lit, populated and reported verified
across four commits — and was impossible to climb. Every platform in the engine is solid to the
ground, so a spiral that passes over itself ejects the player on the first frame. The verification
that missed it was *geometric* ("is there a surface near this height") when the question was
*kinematic* ("can a body walk there").

The pattern behind both: the game has no automated way to answer "does this actually work when
played". Everything below is arranged around fixing that first.

## Decisions taken

| decision | choice | rationale |
|---|---|---|
| Autopilot scope | **Fix + verify only. No new content.** | Unattended content authoring is what produced an unplayable zone. New zones wait for Oliver. |
| Skill correctness bar | **Effect smoke test**, not numeric contracts | Catches exactly the reported failure across every skill with no hand-authoring. Numbers are a later phase. |
| Autopilot cadence | **Long runs, few of them** (6-hourly) with a limit guard | On 2026-08-03 it fired every 20 minutes and every run died on the session limit — roughly 200 dead starts that shipped nothing and burned quota. |

`docs/VISION.md` outranks this document. Its priority order — multiplayer that is fun, class
distinctiveness, then bigger zones — is why skills and multiplayer sit above new zone work here.

## Sub-projects

Order: **A → (B ∥ C ∥ D) → E → F.**

### A. Verification harness — *blocks everything*

Three runners over one shared driver, all under `harness/` (committed; `_shot/` is gitignored and
a fresh checkout does not have it).

```
harness/drive.js          boot the game headless, expose __BF3, run a scenario, report
harness/test-skills.js    16 classes x every skill -> claim vs effect
harness/test-levels.js    every zone/area -> walkable + completable
harness/test-mp.js        two peers in one page -> both render, damage routes
harness/run-all.js        runs all three, writes harness/report.json, exit 1 on any failure
```

The driver extends the existing `harness/shot.js` approach: no npm install, drives installed Chrome
over the DevTools Protocol using Node's built-in WebSocket, serves `public/` itself.

**`run-all.js`'s exit code is the gate.** Autopilot may not commit unless it is 0.

Feasibility is confirmed, not assumed. `__BF3` already exposes `useSkill`, `curSkills`, `CLASSES`
(16), `classState`, `skillUnlocked`, `spawnEnemy`, `cheatUnlockClasses`, `cheatRank10All`, `meta`,
`surfaceHeightAt` and `areaQuests`. No new game code is required to test skills.

### B. Skill and passive correctness

For each of the 16 classes: `cheatUnlockClasses()`, `cheatRank10All()`, enter a fixed arena, spawn
a dummy at a known distance. For each skill, parse its own `d` description into a claim set and
assert a non-zero effect.

| claim in the text | assertion |
|---|---|
| `damage`, `Nx damage` | target HP must drop |
| `heal`, `restore` | own HP must rise from a damaged state |
| `shield`, `absorb` | shield/armour value must rise |
| `stun`, `slow`, `root` | target speed or state must change |
| `summon`, `raise` | minion count must rise |
| `+N% <stat> for Ns` | that stat must differ during the window |

A skill claiming an effect that produces a zero delta is a failure, recorded with class, skill name
and claim. Passives use the same rule via before/after stat snapshots.

Scale, measured rather than estimated: 75 skill-shaped definitions plus 128 rank-choice entries
(skills and passives) across 16 classes.

Known limitation, accepted: this catches wrong-or-absent behaviour, not wrong numbers.

Leading suspect for the root cause: there are two dispatchers, `useSkill` and `useSkillLegacy`.
The class-v2 rewrite converted Ranger and left the rest on the legacy bridge, so descriptions can
come from the v2 tables while behaviour comes from the legacy path. To be confirmed by the tester,
not assumed.

### C. Level completability

Per zone and per area:

- **Walkable** — the kinematic walker: start to exit under real physics, jump-limited, no teleports.
- **Quest-satisfiable** — for every `k:'kill'` quest, assert that at least the required count of that
  named mob actually spawns. Duskmoor asked for 10 siege knights and spawned 3.
- **Objectives reachable** — `kindle` / `fetch` / `find` marks exist and stand on reachable ground.

### D. Multiplayer correctness

- Per-peer rigs so allies show their own model and weapon. Today there is one shared rig, so allies
  render as copies of the local player and the weapon hot-swap is guarded to the local player to
  avoid an async reload thrash.
- A two-peer render test: both bodies drawn in one frame, damage routed through the PvP channel.

Stated limitation: this proves rendering and damage routing, not connection behaviour. Two real
machines remain the final check.

### E. Remaining zones — Palace, Keep, Outskirts

Blocked on A and C. **Autopilot may not do these.** Each needs the walker green before it counts as
built. Ruined Keep's "collapsed floors as vertical shortcuts" depends on the `y0` underside
primitive added on 2026-08-10.

### F. Release

Live `main` is at `VERSION3D 1.399.0`; the branch is 205 commits ahead at 1.903. Five reworked
zones are finished and unreleased. Gated on A–C passing.

## Non-goals

- The level editor's remaining gaps (asset sizes, quest spawners, read-only trial areas). Backlog.
- Finishing the voxel-to-3D world conversion. Backlog.
- Numeric skill balance. Phase two of B, after the smoke test is green.

Neither editor nor graphics blocks anything in A–F, and neither is in VISION's top three.

## Autopilot contract

Re-enable the `Bladefall Autopilot` scheduled task, currently Disabled, with three changes to
`autopilot.ps1`:

1. **Limit guard.** If the run output contains the session-limit string, log `skipped: limit` and
   exit without consuming the slot or retrying. This is the 2026-08-03 failure mode.
2. **Green gate.** A run may only commit when `node harness/run-all.js` exits 0. Otherwise revert
   the working tree and write the reason to the run log.
3. **Scope guard.** Sub-projects A–D only. New zones are refused and logged.

Cadence 6-hourly. Existing rules stand: work happens on **`autopilot-merged`**, never `main`;
Oliver merges to main himself, which is what deploys live.

`AUTOPILOT_BLOCKED.md` and `_AUTOPILOT_BLOCKED.md` are both stale — `.claude/settings.json` and
`tools/gate.js` exist, so the permission blocker they describe was fixed. Delete both.

## Scope of the implementation plan that follows

This spec is the **programme**. The implementation plan written from it covers **sub-project A
only** — the harness. B, C and D each get their own plan once A is green, because none of them can
be verified before it exists. E and F are not planned yet by design.

## Session shape

Session 1 builds A and ships **no gameplay change at all**. That is the accepted cost of the
verification-first order. Sessions 2+ take one factor each and must end green and playable.

Every session ends at something Oliver can play in under two minutes. The Duskmoor failure was not
too much work in one session — it was four commits of work before he ever loaded it.

## Candidate additions — spare autopilot capacity

Oliver asked what else is worth the extra usage. These are the ones with actual evidence behind
them, not guesses. All fit the fix-and-verify boundary. None are scheduled yet.

1. **Characters render through walls.** `flushHero3D` clears the depth buffer before drawing the
   3D layer, so by the code's own admission "the 3D layer now always draws OVER the voxel world and
   cannot be occluded by it... it is the reason a half-converted scene can show a character through
   a voxel wall." This affects every zone and is visible in normal play. Strongest candidate.

2. **A save-compatibility test.** "Never break saves" is a standing rule enforced only by care.
   A runner that loads a corpus of old saves and asserts no crash and no lost gear would protect
   every future change, including everything in B and C.

3. **A frame-budget test.** `highGround()` silently put 64 enemies and a tower of chests into
   Duskmoor from one missing tag. A per-zone assertion on obstacle, enemy and chest counts would
   catch that class of regression anywhere it recurs.

4. **Zone mob-identity audit.** Measured during regression: Emberdeep spawns 10 `caster`, 9
   `royalarcanist`, 4 `frostlobber`, 4 `cragspitter` and 4 `sunpriest` alongside its own natives.
   Off-theme salting is deliberate, but that ratio works against VISION's zone and class identity
   goal. Worth measuring across all zones and putting a number on it before changing anything.

5. **Sweep the single-storey assumption.** Four instances found so far — row emitter, gloom light
   reach, room surface resolution, and platform collision. A systematic search would establish
   whether more remain. This is the assumption that made Duskmoor unplayable.

## Risks

| risk | mitigation |
|---|---|
| Description parsing misreads a claim and reports a false failure | Every failure records the exact text it parsed, so a bad parse is visible as a bad quote rather than a mystery |
| The harness itself is wrong, as the geometric audit was | Each runner is validated against a known-good and a known-bad case before its output is trusted |
| Autopilot burns quota again | Limit guard, plus 6-hourly cadence |
| Overnight run conflicts with a live session on `index.html` | Autopilot works the review branch only and stashes on start; do not run both at once |
