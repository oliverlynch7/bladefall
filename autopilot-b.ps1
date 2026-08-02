# BLADEFALL autopilot runner
#
# Fires one headless Claude session that reads docs/VISION.md and AUTOPILOT.md, does ONE chunk of
# work from the backlog, verifies it, commits to the autopilot-b branch, and only pings
# Telegram if it actually shipped something.
#
# Registered as the Windows Scheduled Task "Bladefall Autopilot B" (hourly, 08:00-23:00), matching
# how the other PraxisBrain automations are wired.
#
# Deliberately branch-only: it never commits to main, so a bad autonomous run cannot break the
# live game. Oliver reviews the branch preview and merges when he is happy.

$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\Oliver\Documents\PraxisBrain\_automation\bladefall-wt-b'
$log  = Join-Path $repo '_autopilot.log'
$claude = 'C:\Users\Oliver\.local\bin\claude.exe'

function Log($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m" | Out-File -FilePath $log -Append -Encoding utf8 }

# Only run during waking hours. The scheduled task already bounds this, but a machine that was
# asleep can fire a missed trigger at any hour, and a 4am Telegram ping is not welcome.
$h = (Get-Date).Hour
if ($h -lt 8 -or $h -gt 22) { Log "skipped (hour $h outside 08-22)"; exit 0 }

Set-Location $repo

# A run that hits the task time limit is KILLED mid-edit, leaving a dirty tree. The next run then
# saw "tracked files modified" and skipped, and so did the one after - so a single timeout cost
# every following cycle until someone cleaned up by hand. That was wasting roughly half of them.
#
# $marker distinguishes the two cases precisely. It is written when a run starts and removed when
# one ends cleanly, so if it still exists the previous run was killed and the dirty tree is the
# autopilot's OWN wreckage, not Oliver's work.
#
# Killed-run leftovers are STASHED, never discarded: committed work is already safe, and stashing
# keeps the partial edits recoverable via `git stash list` instead of destroying them. A dirty tree
# with no marker is supervised work and still blocks, exactly as before.
$marker = Join-Path $repo '_autopilot_running'
$dirty  = (git status --porcelain) | Where-Object { $_ -notmatch '^\?\?' }

if ($dirty -and (Test-Path $marker)) {
  Log "previous run was killed mid-edit; stashing its leftovers and continuing: $($dirty -join '; ')"
  # $ErrorActionPreference is 'Stop' at the top of this script, and PowerShell turns a native
  # command's STDERR into a terminating error under that setting. git writes harmless "LF will be
  # replaced by CRLF" warnings to stderr, so the stash was killing the script mid-guard - it logged
  # its intent and then died, leaving the tree dirty and the next run skipping anyway.
  # Relaxed just around this call, and deliberately NOT redirecting stderr, which causes the same
  # class of problem.
  $prevEAP = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  git stash push -u -m "autopilot killed-run leftovers $(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-Null
  $ErrorActionPreference = $prevEAP
  $dirty = (git status --porcelain) | Where-Object { $_ -notmatch '^\?\?' }
}
if ($dirty) {
  Log "skipped (tracked files modified - supervised work in progress): $($dirty -join '; ')"
  exit 0
}
Remove-Item $marker -ErrorAction SilentlyContinue
New-Item -ItemType File -Path $marker -Force | Out-Null

Log 'run start'

$prompt = @'
You are the BLADEFALL autopilot running unattended. Oliver is not watching this run.

Read these two files FIRST, in this order, and follow them exactly:
  1. docs/VISION.md      - what the game is, priorities, what you may decide alone
  2. AUTOPILOT.md        - workflow, verification gate, branch rules, Telegram format

You are WORKER B. Worker A runs in a separate checkout at the same time and takes the backlog
from the TOP. You take it from the BOTTOM - start at the LAST unchecked item and work upward - so
the two of you never build the same thing twice. If only one item remains, leave it to A and pick
any well-defined improvement that does not overlap: asset integration, a tooling or harness fix,
or a documented cleanup.

Commit to `autopilot-b` and push to `autopilot-b`. NEVER main, never bladefall-autopilot.

Then work the AUTOPILOT.md backlog. Do as MUCH as you can verify properly in this run - Oliver
wants real throughput, not a token trickle, so keep going through backlog items until you run low
on context rather than stopping after one. Commit after EACH item so a later failure never
discards earlier verified work.

Depth over speed on each item: it is better to finish and verify three things than to half-do
eight. Verified work only - unverified work is worse than no work.

Non-negotiable:
- Work on the autopilot-b branch only. NEVER commit to main.
- Run the syntax gate before any commit. Never commit code that fails it.
- Verify visually with the _shot/ harness and actually LOOK at the PNG. Reading source is not proof.
- If a change does not appear to take effect, confirm WHICH definition your edit landed in before
  changing the logic - duplicate function bodies have burned three sessions.
- If you cannot verify it, revert it and note the item blocked. Never commit unverified work.
- Only send the Telegram digest if you actually shipped a commit. Silence is correct otherwise.
- If the top item needs a decision only Oliver can make (fun, tone, art direction, money, balance),
  skip it, note why, and take the next actionable item.
'@

try {
  $out = & $claude -p $prompt --permission-mode acceptEdits 2>&1
  $out | Out-File -FilePath $log -Append -Encoding utf8

  # A failing autopilot must be LOUD. Ten runs in a row died on an expired auth token, exiting in
     #   five seconds each, and the only evidence was a log nobody was reading - Oliver reasonably
     #   assumed work was happening overnight when nothing was. Auth failure now pings Telegram once
     #   per day, so a broken automation announces itself instead of quietly doing nothing. 
  if ($out -match 'Failed to authenticate|401|OAuth access token has expired') {
    $stamp = Join-Path $repo '_autopilot_authwarn'
    $today = (Get-Date -Format 'yyyy-MM-dd')
    $last  = if (Test-Path $stamp) { Get-Content $stamp -Raw } else { '' }
    if ($last.Trim() -ne $today) {
      $today | Out-File -FilePath $stamp -Encoding utf8 -NoNewline
      $body = '{"action":"tgPing","password":"oliverNCA2026","text":"BLADEFALL autopilot is DOWN - Claude could not authenticate, so no work is happening. Fix: open a terminal and run claude, then log in. It will resume on its own after that."}'
      try { Invoke-RestMethod -Uri 'https://thework.pages.dev/state' -Method Post -ContentType 'application/json' -Body $body | Out-Null } catch {}
    }
    Remove-Item $marker -ErrorAction SilentlyContinue
    Log 'run end (AUTH FAILURE - no work done)'
    exit 0
  }
  Remove-Item $marker -ErrorAction SilentlyContinue
  Log 'run end'
} catch {
  Log "FAILED: $_"
  exit 1
}
