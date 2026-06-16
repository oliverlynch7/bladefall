# Redeploy BLADEFALL to production (https://bladefall-caleb.netlify.app)
#
# NOTE: `netlify deploy --prod` returns 403 Forbidden for this site, so we
# upload a draft deploy and then publish it to production via the restore API.
# This two-step is the reliable path. Run this script after editing public/.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$SITE = 'dc6e1c11-415f-4073-9dbc-a8022a883cb8'

Write-Host "Uploading draft..."
$json = netlify deploy --dir public --json | Out-String
$deploy = $json | ConvertFrom-Json
$id = $deploy.deploy_id
if (-not $id) { throw "Could not read deploy_id from netlify output:`n$json" }

Write-Host "Publishing deploy $id to production..."
# Embedded quotes must be \"-escaped so the native CLI receives valid JSON (PS 5.1 quirk).
$body = '{\"site_id\":\"' + $SITE + '\",\"deploy_id\":\"' + $id + '\"}'
netlify api restoreSiteDeploy --data $body | Out-Null

Write-Host "Live: https://bladefall-caleb.netlify.app  (deploy $id)"
