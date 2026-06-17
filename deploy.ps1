# Deploy BLADEFALL to https://bladefall.netlify.app  (Oliver's SECOND Netlify account).
#
# HARD RULE: BLADEFALL must NEVER be deployed to the 'theantianxietyacademy' account
# (that account hosts The Work + coacholiverlynch.com). The guard below enforces it.
# Sign the CLI into the second account first:  netlify logout ; netlify login
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# 1) Guard — abort if signed into the antianxietyacademy account.
$accts = netlify api listAccountsForUser | ConvertFrom-Json
$slugs = @($accts | ForEach-Object { $_.slug })
if ($slugs -contains 'theantianxietyacademy') {
  Write-Host "ABORT: the Netlify CLI is signed into 'theantianxietyacademy'." -ForegroundColor Red
  Write-Host "BLADEFALL only lives on your second account. Run:  netlify logout ; netlify login" -ForegroundColor Yellow
  Write-Host "...sign into the account that owns bladefall.netlify.app, then re-run ./deploy.ps1"
  exit 1
}

# 2) Resolve the 'bladefall' site on the signed-in (second) account.
$site = ((netlify api listSites | ConvertFrom-Json) | Where-Object { $_.name -eq 'bladefall' }).id
if (-not $site) {
  Write-Host "No site named 'bladefall' on this account." -ForegroundColor Red
  Write-Host "Create it once:  netlify sites:create --name bladefall   (on this second account)"
  exit 1
}
'{ "siteId": "' + $site + '" }' | Set-Content -Encoding utf8 ".netlify/state.json"

# 3) Upload a draft, then publish it (draft+restore avoids the --prod 403 seen on the old site).
Write-Host "Uploading draft to bladefall ($site)..."
$json = netlify deploy --dir public --site $site --json | Out-String
$id = ($json | ConvertFrom-Json).deploy_id
if (-not $id) { throw "Could not read deploy_id from netlify output:`n$json" }

Write-Host "Publishing deploy $id..."
$body = '{\"site_id\":\"' + $site + '\",\"deploy_id\":\"' + $id + '\"}'
netlify api restoreSiteDeploy --data $body | Out-Null

Write-Host "Live: https://bladefall.netlify.app  (deploy $id)" -ForegroundColor Green
