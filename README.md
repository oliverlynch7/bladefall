# BLADEFALL

A 2D action-RPG built for Caleb — installs as an iPhone home-screen web app, same as
Oliver's "The Work" PWA. Single self-contained canvas game; no build step, no dependencies.

- **Live (2.5D):** https://bladefall.netlify.app — `public/index.html` (single file)
- **Live (TRUE 3D):** https://bladefall.netlify.app/3d/ — `public/3d/index.html` (single file,
  raw WebGL, zero dependencies; own PWA manifest so it installs as a separate home-screen app).
  **v1.5+ is a procedurally-generated dungeon crawler:** seeded rooms, locking combat doors that
  slam shut during encounters, key & 3-plate puzzles, hard parkour bridges (crumbling tiles /
  moving platforms / geysers) over the drop, one guarded chest per dungeon, and a distinct bestiary
  (skeletons, splitting slimes, hooded casters, charging beetles, treasure goblins). Enemies are
  edge-aware and never fall into the hazard. Skins/achievements import from the 2D save; god cheat identical.
- **Netlify site:** `bladefall`, on Oliver's **second** Netlify account.

> ⚠️ **Account rule:** BLADEFALL must ONLY live on the second Netlify account, never on the
> `theantianxietyacademy@gmail.com` account (that account is for The Work + coacholiverlynch.com).
> `deploy.ps1` aborts if the CLI is signed into the antianxietyacademy account. The old
> `bladefall-caleb` site on that account was deleted and must not be recreated.

## Install on iPhone
Open the Live URL in **Safari** → Share → **Add to Home Screen**. Launches full-screen, no browser chrome.

## Gameplay
**v4: full 2.5D depth movement** — a virtual joystick moves you in every direction on the ground
plane (left/right along the level **and up/down in depth**, beat-'em-up style) plus **JUMP** (height).
Enemies flank you in depth; ranged shots travel in your depth lane, so line up your shots; boss
projectiles aim across all three axes. **SLASH/FIRE** (hold to combo), **DODGE** (i-frame dash in any
direction). Kill monsters → XP → level up → pick an upgrade. 14 stages, ranged bosses, the Abyss
King and the Void Tyrant. Rarity loot (common→legendary) — physical & magical, melee & ranged
weapons + 3-slot **armor**; rarer drops deeper in. **New Game+** keeps your gear/stats while enemies
scale ~1.12× past your power. **Achievements unlock skins** (pause menu or title). Ambient weather
per zone, combo counter, stage progress bar. Progress saves to the phone (Continue on title).

**Keyboard (desktop):** WASD/arrows move (up/down = depth) · **Space jump** · **J attack** ·
**K or Shift dodge** · **L auto-attack** · Enter/Backspace equip/keep loot · **Esc pause**.
On phone: joystick + on-screen buttons (AUTO and KEEP toggles on the right edge).

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
