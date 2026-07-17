# BLADEFALL

A voxel action-RPG by **Oliver Lynch**. Single self-contained HTML files — no build step,
no dependencies — installable as an iPhone home-screen web app.

- **Live (main game, TRUE 3D):** https://bladefall.pages.dev/3d/ — `public/3d/index.html`
  (raw WebGL, zero dependencies; own PWA manifest so it installs as its own home-screen app).
- **Live (2D classic):** https://bladefall.pages.dev/2d/ — `public/2d/index.html`
- **Weapon design QA board:** https://bladefall.pages.dev/weapons/
- **Hosting:** Cloudflare Pages, project `bladefall`, deployed from
  `github.com/oliverlynch7/bladefall` — **`git push` to `main` IS the deploy** (~30s).

> ⚠️ **Account rule:** BLADEFALL must never be deployed on the
> `theantianxietyacademy@gmail.com` Netlify account (that account is for The Work +
> coacholiverlynch.com). Netlify is retired for this project entirely — Cloudflare only.

## The game (Classes & Quests era, v1.24+)

- **Classes:** Warrior / Ranger / Mage starters (unlocked via themed, skippable tutorial
  trials) + the earned **Reaper**. 4 skills each on cooldowns (keys 1–4), class ranks 1–10,
  subclass choice at rank 3, off-family weapons at 0.6×. The Ranger is a mixed-style
  attacker: shots at range, a knife swipe point-blank.
- **World:** a 7-zone chain (Outskirts → The Apex), each zone = quest-gated areas + a boss
  arena, with respawning spawner dens, hidden side zones behind parkour, a lore-giving
  **Warden's Shade** at every zone mouth, per-zone signature hazards, and zone-tier loot
  bands. Zones grow bigger and harder as the chain deepens.
- **Economy:** the hub is the save point — die and you lose only that attempt. Bag/stash,
  shop weapon ladder, armor sets, achievement cosmetics. Difficulty ladder:
  Normal → Hardcore → Hitless.
- **Music:** 17 CC-BY tracks (per-zone + per-boss, Dark Descent on the Void Tyrant) with a
  mandatory in-game credits screen.
- **Story:** the last Warden descends to break the Abyss King's cycle.

**Desktop keys:** WASD move · Space jump (tap = short hop, hold = full) · J attack ·
K/Shift dodge · 1–4 skills · L auto-attack · Esc pause.
Phone: joystick + on-screen buttons.

## Edit & redeploy

```powershell
git add -A ; git commit -m "..." ; git push
```

Cloudflare Pages builds from `main` automatically. Verify with the version string:
`curl https://bladefall.pages.dev/3d/ | grep VERSION3D`.

## Testing

Headless harnesses live in the Claude session scratchpad (`harness2b.js`, `zone.js`,
`phase3/4.js`, `canyon.js`, `combatfeel.js`, `music.js`, `uivol.js`, `conn.js` and friends) —
they boot the game in Node with a stubbed DOM/GL and assert systems end-to-end. The game
exposes `window.__BF3` as the debug/testing hook. UI must additionally be verified against
the real page DOM (stub canvases lie about rendering).

## Icons

`public/icon.svg` is the source. Regenerate PNGs: `python make_icon.py`.
