# BLADEFALL autopilot runner
#
# Fires one headless Claude session that reads docs/VISION.md and AUTOPILOT.md, does ONE chunk of
# work from the backlog, verifies it, commits to the autopilot-merged branch, and only pings
# Telegram if it actually shipped something.
#
# Registered as the Windows Scheduled Task "Bladefall Autopilot" (hourly, 08:00-23:00), matching
# how the other PraxisBrain automations are wired.
#
# Deliberately branch-only: it never commits to main, so a bad autonomous run cannot break the
# live game. Oliver reviews the branch preview and merges when he is happy.

$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\Oliver\Documents\PraxisBrain\_automation\bladefall'
$log  = Join-Path $repo '_autopilot.log'
$claude = 'C:\Users\Oliver\.local\bin\claude.exe'

function Log($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m" | Out-File -FilePath $log -Append -Encoding utf8 }

# One Telegram alert per day about a BROKEN TOOLCHAIN, so a dead autopilot announces itself.
# Same shape as the auth warning below, with its own stamp file so neither can silence the other.
function AlertOncePerDay($stampName, $text) {
  try {
    $stamp = Join-Path $repo $stampName
    $today = (Get-Date -Format 'yyyy-MM-dd')
    # Cast through a string: Get-Content -Raw on an EMPTY stamp returns $null, and $null.Trim()
    # throws straight into the catch below - which would swallow the alert this exists to send.
    $last  = if (Test-Path $stamp) { Get-Content $stamp -Raw } else { '' }
    if ("$last".Trim() -eq $today) { return }
    $today | Out-File -FilePath $stamp -Encoding utf8 -NoNewline
    $body = '{"action":"tgPing","password":"oliverNCA2026","text":"' + $text + '"}'
    Invoke-RestMethod -Uri 'https://thework.pages.dev/state' -Method Post -ContentType 'application/json' -Body $body | Out-Null
  } catch {}
}

# Only run during waking hours. The scheduled task already bounds this, but a machine that was
# asleep can fire a missed trigger at any hour, and a 4am Telegram ping is not welcome.
$h = (Get-Date).Hour
if ($h -lt 8 -or $h -gt 22) { Log "skipped (hour $h outside 08-22)"; exit 0 }

# Never start a run on top of MODIFIED TRACKED files - that would sweep a supervised session's
# in-progress edits into an autonomous commit.
#
# Untracked files (??) deliberately do NOT block. The first test of this guard tripped on a stray
# Playwright console log, which would have blocked every future run forever. Stray artefacts are
# not in-progress work.
Set-Location $repo

# PRE-FLIGHT: is this folder a TRUSTED workspace? If it is not, Claude ignores every
# permissions.allow entry in .claude/settings.json, and the single most important consequence is
# that the session cannot run `node`. That is BOTH verification gates at once - the syntax check
# and the _shot/ screenshot harness - so a correctly-behaved run is required to ship nothing at
# all. It still logs "run start" / "run end" and looks perfectly healthy from the outside.
#
# This cost every run on 2026-08-01: ten died outright with "this workspace has not been trusted",
# and the two after that started cleanly, did the reading, picked the right backlog item and then
# had to stop at the gate. Scraping $out for the warning does NOT catch the second kind - the
# message never reached the captured output - so the state is checked directly and up front.
#
# Read-only ON PURPOSE. Writing the flag would mean an unattended script editing Claude's own
# config, which is a one-line manual fix for Oliver and an unrecoverable mess if it goes wrong.
# Fails OPEN: any error reading the config counts as trusted, so a bug in this check can never be
# the thing that stops the autopilot.
$trusted = $true
try {
  $cfg = Get-Content (Join-Path $env:USERPROFILE '.claude.json') -Raw -ErrorAction Stop | ConvertFrom-Json
  $key = $repo -replace '\\', '/'
  $prj = $cfg.projects.PSObject.Properties[$key]
  $trusted = [bool]($prj -and $prj.Value.hasTrustDialogAccepted)
} catch { $trusted = $true }
if (-not $trusted) {
  Log 'skipped (WORKSPACE NOT TRUSTED - allowlist ignored, node unavailable, so nothing can be verified or shipped)'
  AlertOncePerDay '_autopilot_trustwarn' 'BLADEFALL autopilot is DOWN - this folder is not a trusted workspace, so Claude ignores its allowlist and cannot run node. That kills both checks (syntax gate + screenshot harness), so every hourly run reads the backlog and then ships nothing. Fix: open a terminal in _automation\\bladefall, run claude once, and accept the trust dialog. It resumes on its own after that.'
  exit 0
}

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
  # ':(exclude).claude/' is not optional. `-u` sweeps UNTRACKED files, and .claude/settings.json
  # is the permission allowlist this script depends on - so the killed-run guard was stashing away
  # the autopilot's own permissions and disabling it for every subsequent run. It took the
  # autopilot down for ~14 consecutive runs before it diagnosed itself. Same `-u` that deleted
  # worker B's runner earlier; the lesson did not generalise the first time.
  git stash push -u -m "autopilot killed-run leftovers $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -- . ':(exclude).claude/' | Out-Null
  $ErrorActionPreference = $prevEAP
  $dirty = (git status --porcelain) | Where-Object { $_ -notmatch '^\?\?' }
}
if ($dirty) {
  Log "skipped (tracked files modified - supervised work in progress): $($dirty -join '; ')"
  exit 0
}
Remove-Item $marker -ErrorAction SilentlyContinue
New-Item -ItemType File -Path $marker -Force | Out-Null

# Clear the marker ONLY if the tree is genuinely clean.
#
# The killed-run guard assumed a run that ENDS cleanly leaves nothing behind. Worker A disproved
# that overnight: it finished normally, but left AUTOPILOT.md and both runner scripts modified and
# uncommitted. The marker was removed, so every later run saw a dirty tree with NO marker, read it
# as supervised work, and skipped - four hours of cycles lost to a run that thought it succeeded.
#
# Leaving the marker in place when the tree is dirty routes that state into the recovery path that
# is already tested: the next run sees dirty+marker, stashes the leftovers, and continues.
function ClearMarkerIfClean {
  $left = (git status --porcelain) | Where-Object { $_ -notmatch '^\?\?' }
  if ($left) { Log "run left the tree dirty; keeping the marker so the next run recovers it: $($left -join '; ')" }
  else { Remove-Item $marker -ErrorAction SilentlyContinue }
}

Log 'run start'

$prompt = @'
You are the BLADEFALL autopilot running unattended. Oliver is not watching this run.

Read these two files FIRST, in this order, and follow them exactly:
  1. docs/VISION.md      - what the game is, priorities, what you may decide alone
  2. AUTOPILOT.md        - workflow, verification gate, branch rules, Telegram format

Then work the AUTOPILOT.md backlog. Do as MUCH as you can verify properly in this run - Oliver
wants real throughput, not a token trickle, so keep going through backlog items until you run low
on context rather than stopping after one. Commit after EACH item so a later failure never
discards earlier verified work.

Depth over speed on each item: it is better to finish and verify three things than to half-do
eight. Verified work only - unverified work is worse than no work.

Non-negotiable:
- Work on the autopilot-merged branch only. NEVER commit to main.
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
    ClearMarkerIfClean
    Log 'run end (AUTH FAILURE - no work done)'
    exit 0
  }
  ClearMarkerIfClean
  Log 'run end'
} catch {
  Log "FAILED: $_"
  # The OTHER shape of the same fault: Claude refuses to start at all and the trust message comes
  # back as a terminating error. The pre-flight above fails open, so this is the backstop.
  if ("$_" -match 'has not been trusted|hasTrustDialogAccepted') {
    AlertOncePerDay '_autopilot_trustwarn' 'BLADEFALL autopilot is DOWN - Claude will not start because this folder is not a trusted workspace. Fix: open a terminal in _automation\\bladefall, run claude once, and accept the trust dialog. It resumes on its own after that.'
  }
  exit 1
}
