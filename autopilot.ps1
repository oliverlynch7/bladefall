# BLADEFALL autopilot runner
#
# Fires one headless Claude session that reads docs/VISION.md and AUTOPILOT.md, does ONE chunk of
# work from the backlog, verifies it, commits to the bladefall-autopilot branch, and only pings
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
$dirty = (git status --porcelain) | Where-Object { $_ -notmatch '^\?\?' }
if ($dirty) {
  Log "skipped (tracked files modified - supervised work in progress): $($dirty -join '; ')"
  exit 0
}

Log 'run start'

$prompt = @'
You are the BLADEFALL autopilot running unattended. Oliver is not watching this run.

Read these two files FIRST, in this order, and follow them exactly:
  1. docs/VISION.md      - what the game is, priorities, what you may decide alone
  2. AUTOPILOT.md        - workflow, verification gate, branch rules, Telegram format

Then do ONE meaningful chunk from the AUTOPILOT.md backlog. One chunk, not three.

Non-negotiable:
- Work on the bladefall-autopilot branch only. NEVER commit to main.
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
    Log 'run end (AUTH FAILURE - no work done)'
    exit 0
  }
  Log 'run end'
} catch {
  Log "FAILED: $_"
  exit 1
}
