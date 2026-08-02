# AUTOPILOT BLOCKED AGAIN — 2026-08-02, and this time it is self-inflicted

Written by the autopilot run of **2026-08-02**. Untracked on purpose, so it cannot dirty the
tree and deadlock later runs. **Delete once the fix is in.**

The 2026-08-01 fix in `AUTOPILOT_BLOCKED.md` WORKED — commits ran through 17:12 that day.
It has since been undone. `_automation/bladefall/.claude/` does not exist any more.

## Measured this run (not assumed)

| Command | Result |
|---|---|
| `ls`, `grep`, `git status`, `git log`, `git show`, `node --version` | allowed |
| `node tools/gate.js` — the syntax gate | **DENIED** |
| `node _shot/shot.js` — the screenshot harness | **DENIED** |
| `git fetch origin` | **DENIED** |

`ls -a` shows no `.claude` in this checkout, and `git ls-files .claude` is empty (it was never
tracked). So both verification gates and the whole commit/push path are gone. Every hour from
now produces a run that reads the backlog and ships nothing — silently, because
`autopilot.ps1`'s pre-flight only checks workspace TRUST, not whether the allowlist file exists.

## Root cause of the recurrence — `git stash push -u` eats `.claude/`

`autopilot.ps1:101` (and the same line in `autopilot-b.ps1`) recovers a killed run with:

```powershell
git stash push -u -m "autopilot killed-run leftovers ..."
```

`-u` includes **untracked** files. `.claude/` is untracked and **not** in `.gitignore`, so the
killed-run guard stashes away the autopilot's own permissions. Proof — `stash@{0}`, created on
branch `autopilot-b` at 12:24 today, contains exactly:

```
.claude/
autopilot-b.ps1
```

and `git show "stash@{0}^3:.claude/settings.json"` returns a full, intact allowlist.

Two consequences:

1. **Worker B is now dead too, by its own hand.** `autopilot-b.ps1:14` points at
   `_automation\bladefall-wt-b`, so that stash captured *that* worktree's `.claude/`. (Stashes
   are shared across worktrees, which is why it shows up in this repo's `git stash list`.)
   Worker B's next run will hit the same wall this one did.
2. It will happen again to whichever worker is next killed mid-edit, forever, until `.claude/`
   is hidden from `-u`.

**Worker A's own loss is NOT explained by a stash** — `stash@{1}` (08:44, bladefall-autopilot)
has an empty untracked tree. My `.claude/` went missing some other way; the most likely
candidate is that it was *moved* rather than copied when the `bladefall-wt-b` worktree was set
up, since the stashed copy is branch-scoped to `autopilot-b`. I could not verify that, so I am
flagging it as unexplained rather than inventing a cause.

## The fix — three things, all small

**1. Stop git from ever sweeping it again.** Local-only, no commit needed — append to
`.git/info/exclude` (do this in BOTH `_automation/bladefall` and `_automation/bladefall-wt-b`):

```
.claude/
```

Or commit `.claude/` to `.gitignore` if you'd rather it be shared. Either way `stash -u` will
skip it. Do this FIRST, or the next killed run undoes everything below.

**2. Restore worker B's file** (it is intact, just parked):

```
cd _automation\bladefall-wt-b
git checkout "stash@{0}^3" -- .claude/settings.json
```

**3. Recreate worker A's file** at `_automation/bladefall/.claude/settings.json`. This is the
worker-B copy with the branch names swapped back to `bladefall-autopilot`, plus the deny list
from `AUTOPILOT_BLOCKED.md`:

```json
{
  "permissions": {
    "allow": [
      "Bash(node tools/gate.js)",
      "Bash(node _shot/shot.js:*)",
      "Bash(node _shot/slice.js:*)",
      "Bash(node --check:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git show:*)",
      "Bash(git stash list)",
      "Bash(git branch --show-current)",
      "Bash(git rev-parse:*)",
      "Bash(git check-ignore:*)",
      "Bash(git fetch:*)",
      "Bash(git checkout bladefall-autopilot)",
      "Bash(git merge origin/main --no-edit)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push)",
      "Bash(git push origin bladefall-autopilot)",
      "Bash(curl -s -X POST https://thework.pages.dev/state:*)"
    ],
    "deny": [
      "Bash(git checkout main)",
      "Bash(git switch main)",
      "Bash(git push origin main:*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git reset --hard:*)",
      "Bash(git branch -D:*)",
      "Bash(git branch -d:*)",
      "Bash(git push origin autopilot-b:*)",
      "Bash(git checkout autopilot-b)"
    ]
  }
}
```

I did not write this file myself. Self-granting permissions is blocked by the harness by
design, and it should stay that way.

## Worth adding to the runner (a run can do it once unblocked)

`autopilot.ps1`'s pre-flight checks `hasTrustDialogAccepted` but not
`Test-Path "$repo\.claude\settings.json"`. Add that check and route it into the existing
`AlertOncePerDay '_autopilot_toolchainwarn' ...` helper. This exact failure — allowlist gone,
run looks healthy from the outside, ships nothing — is the third time it has cost a day, and it
is a one-line test.

## Re-confirmed by a LATER run the same day (2026-08-02)

Still blocked. Re-measured from scratch rather than trusted:

| Command | Result |
|---|---|
| `ls -a` — is `.claude/` back? | **still absent** |
| `node tools/gate.js` | **DENIED** |
| `git rev-parse --short HEAD` | allowed (`07d7d18`) |
| `git add --dry-run AUTOPILOT.md` | **DENIED** |

So read-only git still works and everything else does not: no syntax gate, no `_shot/` harness,
no `git add`, therefore **no commit path at all**. Nothing under `public/` was touched.

**Oliver has never been told, and a run cannot tell him.** There is no `_autopilot_trustwarn`,
`_autopilot_toolchainwarn` or any other allowlist stamp file in the repo — the pre-flight only
tests workspace TRUST, so `AlertOncePerDay` has never fired for this fault. From the outside every
hourly run logs `run start` / `run end` and looks perfectly healthy.

This run tried to raise the alarm itself and **both channels failed**, so assume Oliver still knows
nothing:

- desktop/phone push — returned "Remote Control inactive", i.e. nowhere to deliver.
- the Telegram relay the runner uses — `Invoke-RestMethod` to `thework.pages.dev/state` is not in
  the (missing) allowlist, so it was denied like everything else. The same allowlist that stops the
  work also stops the report that the work stopped.

The message is written out ready to go in `_tgalert.json` (gitignored). Any run that regains
permissions should post it first thing, in one command:
`Invoke-RestMethod -Uri 'https://thework.pages.dev/state' -Method Post -ContentType 'application/json' -InFile '_tgalert.json'`
`_autopilot_allowlistwarn` deliberately holds `NOT-SENT` rather than a date, so the alert is still
treated as owing.

**Fix step 1 is also Oliver's now.** I tried to append `.claude/` to `.git/info/exclude` myself —
it needs no commit and grants no permissions — and the harness refused the write because anything
under `.git/` is protected. So all three numbered steps below require a human. Note that step 1
must also be done in `_automation\bladefall-wt-b` (worker B's worktree), which is outside this
checkout and outside what an autopilot run can reach.

**The runner fix cannot be shipped from here either.** `autopilot.ps1` is a tracked file, so
editing it without a commit path just leaves the tree dirty — which the guard at
`autopilot.ps1:112` then stashes away on the next killed run, losing the edit and burning cycles.
Deliberately not attempted. Two changes are wanted, both small, whenever a run can commit again:

1. Pre-flight `Test-Path "$repo\.claude\settings.json"` alongside the trust check, routed into
   `AlertOncePerDay '_autopilot_toolchainwarn' ...`. Third day lost to this; it is a one-line test.
2. Stop `git stash push -u` (line 101) from eating `.claude/` — the `.git/info/exclude` entry above
   is the fix, but doing it in the runner makes it self-healing on any new worktree.

## Third confirmation, same day (2026-08-02, later still)

Re-measured, not trusted. `.claude/` still absent; `node --version` allowed, `node tools/gate.js`
**DENIED**; `git status/log/stash list` allowed. HEAD `07d7d18`, tree clean apart from this file.

**Both alert channels re-tested and both are still dead** — do not spend another run on them:

| Channel | Result |
|---|---|
| `curl -X POST .../state --data-binary @_tgalert.json` (Bash) | **DENIED** — so it is not just `Invoke-RestMethod`; the relay is unreachable by any shell |
| `PushNotification` tool | not delivered ("terminal is active, notification would be redundant") |

`_autopilot_allowlistwarn` stays `NOT-SENT`. **Oliver still has not been told.**

### One open question CLOSED (source-read, not a render)

The 08-01 (d) desk research was **right** and the 08-01 (c) note is **wrong**: the activity pads are
NOT dropped by the ≤3-unit rule, so paving the annex needs no tagging pass. Chain of evidence:

- index.html:12043 is the *only* ≤3 rule — `(d.y0||0)+(d.h||0)<=3` (grepped for duplicate
  definitions; there is one).
- index.html:10193 pushes each pad at `y0:2, h:1.6` → **3.6 > 3**, so it survives.
- The space pass cannot change that: index.html:10259 documents that it scales **x/z and w/d over
  60 units** only — it never touches `y0` or `h`. `HUB_SX/HUB_SZ` (10077) are X/Z scales.

This is literal-value arithmetic plus a documented invariant, so it is about as strong as reading
gets — but it is still *reading*, and this repo has burned sessions on that. Confirm with one shot
before building on it.

**Gotcha the same read turned up:** the annex *approach walk* (index.html:10187) is `y0:0, h:1.4`
= 1.4, which **is** under the threshold and does vanish in the 3D pass. So the annex job is: pave
the three `nofloor:true` `G.segments` (not `G.rooms` — stale), leave the pads alone, and account
for the approach walk being gone rather than assuming the paving inherits it.

## Backlog state

**Untouched and correct.** Top item is still **Hub buildings** (the annex floor: check first
whether the activity pads really are dropped by the ≤3-unit rule — the 08-01 (d) desk research
argues they are not, which would turn it into a one-part job; then pave from the three
`nofloor:true` `G.segments`, not `G.rooms`). It needs a rendered PNG to verify, which needs
`node`. Nothing was written under `public/`.
