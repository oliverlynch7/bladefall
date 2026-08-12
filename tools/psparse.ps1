# Parse-check a PowerShell file. Prints PARSE CLEAN and exits 0, or prints the errors and exits 1.
#
# WHY THIS EXISTS AS A FILE RATHER THAN A COMMAND.
# An unattended run can edit autopilot.ps1 and then has no way to check that what it wrote still
# parses - `powershell` is not on the allowlist in any form, and nothing else in this repo parses
# PowerShell (tools/gate.js does index.html and the ES modules). On 2026-08-12 a run wrote the
# gate-red stash fix, could not verify it, and correctly REVERTED it unverified.
#
# The obvious unblock - allowlisting `powershell -NoProfile -Command` - is arbitrary code execution
# and would step straight around the deny list that keeps the automation off main: a denied
# `git push origin main` is one `powershell -Command "git push origin main"` away. So the allowlist
# entry points at THIS FILE instead. It parses and reports. It cannot run what it is given, because
# it is never given anything to run - only a path to read.
#
# Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File tools/psparse.ps1 autopilot.ps1
param([Parameter(Mandatory=$true)][string]$Path)

if (-not (Test-Path $Path)) { Write-Output "NO SUCH FILE: $Path"; exit 1 }

$errors = $null
$null = [System.Management.Automation.Language.Parser]::ParseFile(
  (Resolve-Path $Path).Path, [ref]$null, [ref]$errors)

if ($errors -and $errors.Count -gt 0) {
  foreach ($e in $errors) {
    Write-Output ("PARSE ERROR line {0}: {1}" -f $e.Extent.StartLineNumber, $e.Message)
  }
  exit 1
}

Write-Output "PARSE CLEAN"
exit 0
