# BLADEFALL

A 2D action-RPG built for Caleb — installs as an iPhone home-screen web app, same as
Oliver's "The Work" PWA. Single self-contained canvas game; no build step, no dependencies.

- **Live:** https://bladefall.netlify.app
- **Netlify site:** `bladefall`, on Oliver's **second** Netlify account.
- **Game code:** [`public/index.html`](public/index.html) — everything (HTML/CSS/JS) is in this one file.

> ⚠️ **Account rule:** BLADEFALL must ONLY live on the second Netlify account, never on the
> `theantianxietyacademy@gmail.com` account (that account is for The Work + coacholiverlynch.com).
> `deploy.ps1` aborts if the CLI is signed into the antianxietyacademy account. The old
> `bladefall-caleb` site on that account was deleted and must not be recreated.

## Install on iPhone
Open the Live URL in **Safari** → Share → **Add to Home Screen**. Launches full-screen, no browser chrome.

## Gameplay
Run ◀▶, **JUMP**, **SLASH/FIRE** (hold to combo), **DODGE** (i-frame dash). Kill monsters → XP →
level up → pick an upgrade. 14 stages, ranged bosses, the Abyss King and the Void Tyrant.
Rarity loot (common→legendary) — physical & magical, melee & ranged weapons + **armor** (defense +
bonus stats); rarer drops deeper in. **New Game+** keeps your weapon/armor/stats while enemies
scale ~1.12× past your power on both axes. **Achievements unlock skins** (pick them in the pause
menu or title). Progress saves to the phone (Continue on title).

**Keyboard (desktop):** A/D or ←/→ move · W/Space/↑ jump · **J attack** · **K or Shift dodge** ·
**Esc pause**. On phone, use the on-screen buttons.

## Edit & redeploy
First make sure the Netlify CLI is signed into the **second** account (the one that owns
`bladefall.netlify.app`) — `netlify logout` then `netlify login` and pick it. Then from this folder:

```powershell
./deploy.ps1
```

`deploy.ps1` refuses to run if the CLI is signed into the antianxietyacademy account, resolves the
`bladefall` site on the signed-in account, uploads a draft, and publishes it via
`netlify api restoreSiteDeploy` (the draft+restore two-step avoids the `--prod` 403 seen on the old
site). It writes the resolved site id into `.netlify/state.json`.

## Icons
`public/icon.svg` is the source. Regenerate the PNG icons (`apple-touch-icon.png`, `icon-512.png`):

```powershell
python make_icon.py
```

## Local preview
Served by the `bladefall` config in `../../.claude/launch.json` (python http.server on port 4310),
or any static server pointed at `public/`. The game exposes a `window.__BF` debug hook for headless testing.
