# BLADEFALL — where everything is, 2026-08-13

Written at the end of the last session before Oliver's Claude plan lapses. Everything below is
**pushed to GitHub**. Nothing of value lives only on this machine.

If you are a future session, a different tool, or Oliver in six months: start here.

## 1. Where the work is

| what | where | notes |
|---|---|---|
| All the work | branch **`autopilot-merged`** on `github.com/oliverlynch7/bladefall` | ~360 commits ahead of `main` |
| Playable build | **https://preview-2026-08-13.bladefall.pages.dev/3d/** | branch `preview-2026-08-13`, same tip |
| The live game | `bladefall.pages.dev` | branch `main`, **still `VERSION3D 1.399.0`** — untouched all week |
| 51 parked stashes | tags **`archive/stash-0` … `archive/stash-50`** | see §3, this is the part that was nearly lost |
| Old preview tip | tag/branch `archive-bladefall-autopilot-2026-08-02` | superseded, kept anyway |

**The branch is `1.956.0`. The live game is `1.399.0`.** That gap is a decision nobody has taken,
not an accident — see §5.

## 2. The autopilot is PAUSED, deliberately

Scheduled task `Bladefall Autopilot` is **Disabled**. Lock and marker files cleared.

Leave it that way unless someone is watching it. With no Claude plan behind it, every 20-minute tick
would fail on auth, and the once-per-day Telegram alert is the only thing that would say so.

To restart it later: `Enable-ScheduledTask -TaskName 'Bladefall Autopilot'`. It is already configured
correctly — 20-minute interval, 24-hour repetition, 3-hour execution cap, and the guards in §4.

## 3. The 51 stashes, and why they are tags now

`git stash` refs live **only in `.git` on this machine**. `git push` never sends them. There were 51,
several holding real finished work, and a re-clone or a dead disk would have taken all of it.

Every one is now a tag and every tag is on GitHub:

```bash
git ls-remote --tags origin 'archive/stash-*'   # 51
git show archive/stash-0                        # read one
git stash apply archive/stash-0                 # or apply it
```

They accumulated because of the bug in §4 — runs did good work, failed to commit it, and the next
run stashed it. That bug is fixed, so the pile should stop growing.

## 4. What the automation is and what was wrong with it

`autopilot.ps1`, driven by a Windows scheduled task, runs a fresh Claude session against
`AUTOPILOT.md` and the plans in `docs/superpowers/plans/`.

Four guards were added this week, each after a measured failure:

- **Overlap lock, keyed on a live PID.** A clock cannot tell a slow run from a dead one, and a
  harness pass legitimately exceeds an hour. Proved itself the first hour by standing three runs down.
- **Session-limit guard.** On 2026-08-03 it fired every 20 minutes and every run died on the session
  limit — ~200 dead starts. A limited run now exits clean and touches nothing.
- **Green gate.** No commit unless `node harness/run-all.js` exits 0. A red gate **stashes** rather
  than `git checkout -- .`, which used to delete verified work when the gate flapped.
- **Commit-on-green.** *The churn fix.* Each run did a few minutes of work, backgrounded the 20–45
  minute gate, and ended its turn to wait — but `claude -p` is one-shot, so ending the turn exits the
  process and the commit never happened. The runner then ran the same gate, it passed, and it walked
  away from finished work anyway. 39 `run left the tree dirty` lines, every one with `GATE: PASS`
  immediately above it. Now the runner commits what the gate just proved.

## 5. The one decision nobody has taken

**Should the branch go live?** It merges into `main` with **zero conflicts**. Merging deploys
`bladefall.pages.dev` from 1.399 to 1.956 in one step.

Arguments for waiting are real: most of it has never been played by a human. Castle Duskmoor was
bot-walked, not played. Party scaling, personal loot, pings, per-peer ally rigs and ~30 skill fixes
are all unplayed. The preview URL exists precisely so that can be fixed without risk.

Nothing expires. This decision keeps.

## 6. What is actually finished

- **A verification harness that did not exist a week ago.** `harness/` — a skill/passive bench across
  all 16 classes, a kinematic level walker, a multiplayer suite, and `run-all.js` as a
  regression-gated baseline. It has caught its own errors repeatedly, which is the point.
- **~30 skills and passives now do what their card says**, including a berserker hard-lock.
- **Castle Duskmoor**, and the engine primitive it needed: platforms have an underside (`y0`), so
  they can be raised, walked under, and rendered with the gap they actually have. That also fixed the
  level editor's raise/lower and props vanishing inside plateaus.
- **Multiplayer**: you can see yourself again (the 3D layer drew one hero per frame), allies render
  as themselves, guests adopt the host's enemy positions, party scaling, personal loot, world pings.
- **The first two-client test this project has ever had** — `harness/mp2/`, two real Chrome processes
  with a real PeerJS session between them. 7 of 8 runs connected.

## 7. What is known-broken, with evidence, and not fixed

Ranked. Each has a measurement behind it, not a suspicion.

1. **A co-op guest's projectiles may deal no damage at all.** The relay guard
   (`index.html:10890`) accepts `src===G.p` or `src.pet`; a projectile passes a bare position literal
   (`13624`), so the relay never fires, damage applies locally, and the host's next snapshot undoes
   it. If it reads as the source says: **nine of sixteen classes deal nothing with their basic attack
   in co-op**, and every projectile skill on all sixteen is the same. Patch written out in
   `docs/MP_AUDIT.md`; the static test is parked in `harness/live/relay.test.js` with one assertion
   **watched to fail**. NOT measured live — two launches died on Chrome contention.
   **Caution the patch does not carry:** it proposes the marker `shot:true`, justified as "nothing
   else reads a `.shot` field". That is false — `.shot` is the ranged config on enemy definitions.
   No enemy is currently passed as a damage `src`, so it is safe by luck rather than by that reason.
   **Use a distinct marker name.** And widen the RELAY guard only: `src===G.p` also dispatches
   `CLASS_BASIC`, and turning that on for projectiles is the largest balance change in the game.
2. **Two clients disagree about what 5–12 of 41 monsters ARE.** Same seed, same level, same mids and
   spawn points — but `saltMob` (`index.html:4716`) and the role roll (`7690`) use unseeded
   `Math.random`. Usually a flyer against a walker, and those are the only bodies the position
   correction cannot hold together (mean 358 apart, worst 1294, against 2 and 10 for the rest).
3. **`MP.host()` has no timeout** while `join()` has 22s. Watched: the callback never fired,
   `MP.active` stayed false, nothing surfaced. A player gets one button and no retry, forever.
4. **Host-before-enter is a silent dead session.** Both clients report active with populated peer
   lists in both directions and an open socket, while `MP.zone` is `-1`. Every health signal green
   and the guest is nowhere.
5. **`shot.js` guesses its debug port** (`9200 + httpPort % 300`). On collision the second Chrome
   binds nothing and the harness drives the *first* browser's page — a plausible screenshot of the
   wrong game. `harness/mp2/two.js` already solves it (`--remote-debugging-port=0` +
   `DevToolsActivePort`); the fix just needs porting to `harness/shot.js`.
6. **Three skill cards describe skills the redesign replaced** — `mage/Attunement`, `ranger/Tumble`,
   `berserker/Charge`. Small code change; **which way it goes is a design call and is Oliver's.**
   Same for three classes that promise aggro control in a game with no aggro model.

`docs/BACKLOG.md` is the ranked queue and carries the evidence. `docs/SKILL_TRIAGE.md` is the
per-skill record.

## 8. If you pick this up again

Read in this order: `docs/VISION.md` (Oliver's own priorities, outranks everything), this file,
`docs/BACKLOG.md`, then the plan you intend to work.

The one rule this repo learned the hard way, over and over, and which is worth more than any of the
code above:

> **An assertion nobody has watched FAIL is an assertion nobody should believe.**

A geometric audit passed an unwalkable tower. A skill bench read one list and cast from another, so
62 passes and 4 failures were equally meaningless. A multiplayer probe asserted on a value it had
just assigned. Each looked like verification and was not. Measure, and watch the measurement fail
before you trust it.
