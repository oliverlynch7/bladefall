# BLADEFALL

A 2D action-RPG built for Caleb — installs as an iPhone home-screen web app, same as
Oliver's "The Work" PWA. Single self-contained canvas game; no build step, no dependencies.

- **Live:** https://bladefall-caleb.netlify.app
- **Netlify site:** `bladefall-caleb` (id `3cd4cef1-15e8-4b91-a589-50ec69235f88`)
- **Game code:** [`public/index.html`](public/index.html) — everything (HTML/CSS/JS) is in this one file.

## Install on iPhone
Open the Live URL in **Safari** → Share → **Add to Home Screen**. Launches full-screen, no browser chrome.

## Gameplay
Run ◀▶, **JUMP**, **DODGE** (i-frame dash), **SLASH** (hold to combo). Kill monsters → XP →
level up → pick an upgrade. 6 stages, 2 minibosses, the Abyss King boss, then New Game+
(harder, keep your build, unlock the Abyss skin). Progress saves to the phone (Continue on title).

## Edit & redeploy
Edit `public/index.html`, then from this folder:

```powershell
./deploy.ps1
```

Manual equivalent (if the script ever fails). PowerShell needs the inner quotes `\"`-escaped:

```powershell
netlify deploy --dir public            # prints a draft URL + deploy id
netlify api restoreSiteDeploy --data '{\"site_id\":\"3cd4cef1-15e8-4b91-a589-50ec69235f88\",\"deploy_id\":\"<DEPLOY_ID>\"}'
```

(In a bash shell, drop the backslashes and use normal single-quoted JSON.)

> `netlify deploy --prod` currently returns **403 Forbidden** for this site. The draft-upload +
> `restoreSiteDeploy` two-step is the working path and is what `deploy.ps1` does.

## Icons
`public/icon.svg` is the source. Regenerate the PNG icons (`apple-touch-icon.png`, `icon-512.png`):

```powershell
python make_icon.py
```

## Local preview
Served by the `bladefall` config in `../../.claude/launch.json` (python http.server on port 4310),
or any static server pointed at `public/`. The game exposes a `window.__BF` debug hook for headless testing.
