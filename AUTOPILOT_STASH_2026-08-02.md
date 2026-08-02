# The killed-run guard ate the allowlist AGAIN — and this time it ate live work too

Written by the autopilot run of **2026-08-02** (single worker, `autopilot-merged`). Untracked on
purpose so it cannot dirty the tree. **Delete once the fix is in.**

## What happened, in order

1. The run started HEALTHY. `.claude/settings.json` was present, `node tools/gate.js` returned
   `GATE OK`, `_shot/shot.js` rendered. One backlog item was finished, verified and shipped:
   **`0d0d59c` — "The hub's activity annex had no 3D floor"**, pushed to `origin/autopilot-merged`.
   That commit is safe and needs nothing.
2. Partway through the SECOND item, a **concurrent runner** ran its killed-run guard
   (`git stash push -u`) in this same checkout at **15:24**. It swept away, in one stash:
   - `.claude/settings.json` — the permission allowlist
   - `AUTOPILOT_BLOCKED_2026-08-02.md` — the previous run's note about this exact fault
   - **`public/3d/index.html` — this run's in-flight, already-gate-passed edit**
3. From that moment `node tools/gate.js`, `node _shot/shot.js`, `git add`, `git commit` and the
   Telegram `curl` were all DENIED. Both verification gates and the whole commit path, gone
   mid-edit. No further code was written — correctly, per AUTOPILOT.md.

`git status` came back **clean**, which is the nastiest part: from the outside the run looks like
it simply had nothing more to do.

## Everything is in `stash@{0}` — do not drop it

```
stash@{0}: On autopilot-merged: autopilot killed-run leftovers 2026-08-02 15:24
```

- `git stash show --name-only "stash@{0}"`   → `public/3d/index.html`
- `git show --name-only --format= "stash@{0}^3"` → `.claude/settings.json`, `AUTOPILOT_BLOCKED_2026-08-02.md`

Recovery, in this order:

```
git checkout "stash@{0}^3" -- .claude/settings.json     # gates back first
git checkout "stash@{0}"   -- public/3d/index.html      # then the work
```

## The work that is sitting in the stash

**"The Waystation's own deco was drawn by nobody."** Found and measured this run; the edit is
written, it passed `node tools/gate.js`, and it was rendered twice and looks right. It is NOT
committed because the regression checks were not finished before the gates died.

The bug: `drawCourse`'s deco guard is

```js
const _w3dDrawing = !!(three3DLive() && _w3d && _w3d.on && _w3d.ready);
if(!_w3dDrawing) for(const d of G.deco){ ... }
```

Its own comment three lines above already promises "**also re-enabled when world3d has SKIPPED
this level (the hub)**" — and the code never tests for it. When that comment was written world3d
skipped the hub outright, so `ready` stayed false there and the guard fell open by luck. `buildHub`
then landed and set `ready` in the hub too, and the guard has been reading "world3d is drawing" as
"world3d is drawing THIS". In the hub it is not: `buildHub` reads `G.deco` for the BUILDING specs
and ignores every other entry.

Measured, not inferred — the hub's `G.deco` is 165 entries and world3d consumes 8 of them:

| what | count | drawn by world3d? |
|---|---|---|
| activity PADS (`342x1.6x268`, `y0:2`) | 4 | no |
| benches | 6 (+6 seats) | no |
| planters + flowers | 4 + 30 (+60 stems) | no |
| rampart dividers (`kind:'pillar'`) | 7 (+7 caps) | no |
| void-theme crystal scenery | 8 | no |
| walkway floor paint (`h:1.4`) | 6 | replaced by the paving |
| buildings (`kind:'building'`) | 8 | **yes** |

The four pads are the ones that matter: the violet Abyss, gold Sprint and crimson Arena floor
markings are the only thing telling you which platform is which, and in 3D there was nothing there
at all.

The fix in the stash:

```js
const _hubDeco = !!(_w3dDrawing && _w3d.counts && _w3d.counts.hub);
if(_hubDeco) deferOn();
if(!_w3dDrawing || _hubDeco)
for(const d of G.deco){ if(cull(d.x,d.z)) continue;
  if(_hubDeco && (d.kind === 'building' || (d.y0||0) + (d.h||0) <= 3)) continue;
  ...
}
if(_hubDeco) deferOff();      // at the end of the loop, before drawCourse's closing brace
```

DEFERRED because these are entities standing on ground the 3D pass covers completely; drawn inline
they would be painted straight back out. `deferOn()` no-ops when the Three layer will not run this
frame, so first-person and `?world3d=0` keep the exact path they have now.

Two exclusions, both because world3d DOES replace them: `kind:'building'` (a flat box inside each
assembled house) and floor paint with top ≤ 3 (the walkway strips the cobbles now are). The pads
survive that test on purpose — `y0` 2 + `h` 1.6 = 3.6.

**Rendered and correct:** `_shot/out/m2-dais-after.png` — the Abyssal Descent pad's violet apron,
its crystal shards on their plinths and the Arena's crimson pad beyond, all composited on the new
cobbles, against `m1-dais-after.png` where the same camera showed none of it.
`_shot/out/m2-hub-plaza.png` — the plaza fountain basin and its teal water are back around the
waystone obelisk, and the buildings are NOT doubled.

**Still owed before it can be committed** (all three should pass; two are unreachable by
construction, which is reading rather than proof and is exactly why they are still owed):
`?world3d=0` at one camera, first-person, and the Outskirts counts baseline.

## The fix, which is still Oliver's and is still three small things

Unchanged from `AUTOPILOT_BLOCKED_2026-08-02.md` (itself now in `stash@{0}^3`). The root cause is
`autopilot*.ps1`'s `git stash push -u`: `-u` includes untracked files, `.claude/` is untracked and
not in `.gitignore`, so the guard stashes the autopilot's own permissions.

1. **Append `.claude/` to `.git/info/exclude`** (needs no commit; a run cannot do it, the harness
   protects everything under `.git/`). Do this FIRST or the next killed run undoes the rest.
2. Restore the allowlist from the stash — the two `git checkout` lines above.
3. Pre-flight `Test-Path "$repo\.claude\settings.json"` in the runner alongside the trust check,
   routed into `AlertOncePerDay`. Fourth day lost to this; it is a one-line test.

**And one more, new this run and worse than the allowlist loss:** two autopilot processes are still
live in the SAME checkout. The 15:24 stash was created while this run held verified, gate-passed
edits in the working tree. The killed-run guard cannot tell live work from wreckage. Either give
every runner its own worktree for real, or have the guard refuse to stash a tree whose files were
modified in the last few minutes.

## Alert channels — both still dead, do not spend another run on them

| Channel | Result |
|---|---|
| `curl -X POST https://thework.pages.dev/state --data-binary @file` | **DENIED** (allowlist gone) |
| `PushNotification` tool | not delivered |

The digest for the commit that DID ship is written out ready to send at `_shot/tg1.json`
(gitignored). Any run that regains permissions should post it first thing:

```
curl -s -X POST https://thework.pages.dev/state -H "Content-Type: application/json" --data-binary @_shot/tg1.json
```

## Backlog state

`AUTOPILOT.md` is committed and current as of `0d0d59c`: the **Hub buildings** item carries the
annex-floor progress note and ends by pointing at the pads. Nothing else was touched.
