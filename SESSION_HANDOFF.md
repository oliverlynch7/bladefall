# BLADEFALL — Session Handoff

_Last updated: 2026-07-24 · live build `1.375.0-autopilot`_

This is a running "where we left off" doc for BLADEFALL so a fresh Claude Code session can pick up without re-deriving everything. Read this first, then `AUTOPILOT.md` / `UPDATE_ROADMAP.md` for older context.

---

## The essentials (how the project works)

- **What it is:** Oliver's own single-file 3D dark-fantasy action-roguelite (raw WebGL voxels, no engine). NOT Kaleb's game.
- **The whole game is one file:** `public/3d/index.html` (~13k lines, one big `<script>`). Almost all edits happen here.
- **Repo:** git submodule `oliverlynch7/bladefall` (this folder is its own repo, separate from the PraxisBrain vault).
- **Deploy:** Cloudflare Pages, **git-push auto-deploy**. `main` → https://bladefall.pages.dev . The branch `bladefall-autopilot` → a preview URL. **The Netlify `deploy.ps1` is legacy — ignore it; Cloudflare is live.**
- **Working branch:** commit on `bladefall-autopilot`, then merge to `main` when the user says it's working. Merge sequence used every time:
  ```
  git checkout main && git merge bladefall-autopilot --no-edit && git push origin main && git checkout bladefall-autopilot
  ```
- **Version:** bump `const VERSION3D='X.Y.Z-autopilot';` (near line 974) on every change. It shows in-game and in the MP lobby (build stamp).
- **Syntax gate (ALWAYS run before committing):**
  ```
  node -e "const fs=require('fs');const s=fs.readFileSync('public/3d/index.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('SYNTAX OK')"
  ```
- **`window.__BF3`** exposes a debug API (G, update, enterZone, enterArena, useSkill, spawnEnemy, playerAttack, ARENA_LOADOUT, cheatUnlockClasses, cheatRank10All, etc.). Most game functions are closure-local and NOT reachable from the console — drive tests through `__BF3`.
- **Testing pattern:** preview server runs on `localhost:4310`; load `http://localhost:4310/3d/?fresh=<tag>` (the query param busts cache — there is **no service worker**, cache is plain HTTP). Then drive via `__BF3` + `update(dt)` ticks.
- **Local-only harnesses** (gitignored `/_*`): `_shot/` (headless-Chrome screenshots), `_balance/` (DPS profiler), `_duel/` (bot-vs-bot PvP win-matrix). Reuse `_shot/node_modules/puppeteer-core`.

---

## What we shipped THIS session (newest first)

All merged to `main` and live.

| Build | Change |
|---|---|
| 1.375 | **Particles on/off graphics toggle** (`meta.particles`, persisted, in both pause settings menus). Off = `burst()` early-returns, update loop drops stragglers, draw loop skipped. |
| 1.374 | **Shared mobs in co-op.** Root cause: `newG()` rolls a fresh random `runSeed` per zone entry, never synced → each client built different dungeons/mobs → the host-authoritative HP/death mirror synced onto the wrong local mobs. Fix: host broadcasts `runSeed` in the zone message (`onEnter`/`placeMsg`); guests store `MP.rseed` and override the fresh seed in `enterZone` before the dungeon+mobs build. Verified: same seed → identical mob list (type, pos, `mid`). |
| 1.373 | **Combat visuals synced.** Allies now see each other's swings/casts (synced `atkTimer`/`swingCombo`/`dodge`, replayed via `drawHero3`, decayed smoothly between packets), projectiles (diffed by `_mp` flag, broadcast as damage-free `visual:true` / `owner:'peerfx'` copies), and skill shockwave rings (broadcast; copies use `hitPlayer:true` so they render but deal 0 damage). Host relays a guest's FX to other guests. Damage stays authoritative via the PvP channel — verified visual copies do 0 damage. |
| 1.372 | **Ping indicators** (host now pings too, symmetric ping/pong; shown as a coloured dot + `Nms` under each ally's HP bar) + **networked summons** (owner broadcasts a compact `[x,z,y,yaw]` minion snapshot; peers reconstruct + render with `drawPet3`, so a friend sees your necromancer skeletons). |
| 1.371 | **Necromancer minions attack the rival in PvP** (they only scanned `G.enemies`; now build pseudo-targets from opposing peers and route hits through `MP.sendPvp`). |
| 1.370 | **Allies show real skin + equipped weapon + a named HP bar** (peers were a blocky placeholder; now rendered via `drawHero3`). |
| 1.369 | **Real TURN relay via Cloudflare** (see the dedicated section below). All free public TURN servers are dead. |
| 1.368 | MP lobby **build stamp + live "Connecting… Xs" countdown** (so an endless connect is provably a stale cached page). |
| 1.367 | **Host PvP drops you straight into the arena lobby**; the friend auto-joins into it once they enter the room code. |
| 1.366 | **Aimable Blink** (Dishonored-style, aims where you look) + **MP join 22s timeout** (no more endless "Connecting…"). |
| 1.365 | A guest with **no character** now auto-provisions a Warrior (`ensureGuestReady`) so they load into the host's world instead of bouncing to the class picker. |
| 1.356–1.364 | Flintlock (pirate signature: slower fire, mini-cannonball projectiles), loot HUD card shows item icon, Ember zone missing-secret fix, hub trophies moved to the wall, bare-fists rarity-less + Monk-only strong, "Rank 10 ALL classes" cheat, Ninja wields warrior+ranger weapons, arena bots stay defeated until loadout re-applied. |

Earlier this session (pre-MP push): **MONK + full bare-fists system**, **STORMCALLER** class, PvP self-play harness + melee-vs-ranged balance fix, arena bots using real class skills.

---

## Cloudflare TURN relay (multiplayer connectivity) — IMPORTANT

Cross-network multiplayer needs a TURN relay; every free public one is dead. We set up **Cloudflare Realtime TURN**:

- **Account:** `theantianxietyacademy@gmail.com` (Account ID `4ee6e0769c54163e373dee3dd31de1d0`) — same account hosting bladefall/thework/coacholiverlynch Pages. Realtime subscription enrolled (free tier 1,000 GB/mo — effectively always $0 for a 2-player game).
- **TURN Server app** named `bladefall` (dashboard → Realtime → TURN). Its Turn Key ID + API Token are stored as **Pages secrets** on the `bladefall` project: `TURN_KEY_ID` and `TURN_TOKEN`. **Not in the repo/vault.** Set via `wrangler pages secret put ... --project-name bladefall`. Changing them needs a redeploy to take effect (push any commit to `main`).
- **`functions/turn.js`** = a Cloudflare Pages Function at route `/turn` that mints short-lived ICE credentials from those secrets. In-game `MP.ensureIce()` fetches `/turn` once per session and merges the relay onto a STUN fallback (STUN-only if `/turn` is unreachable — same-network still works).
- **Verified live:** `bladefall.pages.dev/turn` returns `turn.cloudflare.com` servers; an RTCPeerConnection gathered **relay: 10** candidates (was 0 with the dead free server).
- To rotate: create a new TURN app + re-run the two `wrangler pages secret put` commands + redeploy.

See vault memory `bladefall-turn-relay` for the same info.

---

## Multiplayer architecture cheat-sheet (so you don't relearn it)

- **`MP` object** (in `index.html`, ~line 7177) — closure-local, NOT on `window`/`__BF3`. PeerJS 1.5.4 from unpkg, P2P WebRTC, public PeerJS broker for signaling, 4-char room codes.
- **Presence:** ~14 Hz. Host `broadcast()` sends all player states + an enemy snapshot; guests send `{t:'pos'}`. `selfState()` is the packet builder — it now carries skin, weapon, hp/hpm, hair, downed, `at`/`sc`/`dg` (attack anim), and `mn` (minion snapshot).
- **Enemies are host-authoritative for HP/existence/death only.** Each client runs its own enemy AI locally (so mobs threaten the local player). `enemySnap()` (host) → `applyEnemies()` (guest) reconciles by `mid`. **This only works if both clients generated the same mobs — which is why the `runSeed` sync (1.374) was essential.** Guest enemy positions are NOT per-frame synced (they simulate locally from the same seed); a fast mob may not be pixel-identical on both screens, but it's the same mob with shared HP/death.
- **PvP damage** is host-routed: `MP.sendPvp(id, dmg, sx, sz)` → `pdmg` message → `routePvp`/`takePvpDamage`. Melee swings use `MP.pvpMelee`; minions now use `sendPvp` too.
- **Combat FX** (1.373): `sendCombat()` diffs new player projectiles (`_mp` flag) + shockwaves and broadcasts compact spawn data; `recvCombat()` spawns damage-free `visual:true` copies. Projectile update skips all collision for `pr.visual`; shockwave copies use `hitPlayer:true`.
- **Guest provisioning:** `ensureGuestReady()` gives a menu-joined guest a starter Warrior so they don't bounce to the class picker.

---

## NOT yet done / open work

### Class build-out — DONE (verified 2026-07-24)
The 6-class plan is **complete**. All 16 classes (incl. Monk, Stormcaller, Warlock, Beastmaster, Skylancer, Bladedancer) are fully built: `CLASSES` entry + full rank 1-10 `CLASS2` tree + 8 genuinely-unique `SKILL_FX` functions each + weapon family + unlock trial + shop charter cost + class portrait icon + 8 skill-icon PNGs (261 icons total in `public/3d/icons/`). Skill FX are real, not reskins (Skylancer = thunder-dive/cyclone air combat `sky_*`; Bladedancer = parry-window/riposte `bd_*`; Warlock = void/curse/drain `war_*`; Beastmaster = pack/pet `bst_*`). The harness task list that showed these "pending" was STALE — closed 2026-07-24. Likely finished by Codex in parallel. **Do not rebuild these.** (Open sub-item if desired: a balance pass across the newer classes.)

### Multiplayer polish (nice-to-haves, not blocking)
- **Enemy position lockstep** — mobs are the same now (shared seed + shared HP/death) but each client simulates their movement; positions can drift. True per-frame position mirroring is a further step (careful: guests need local enemy AI for threat/damage, so don't just hard-override).
- **Equipped-armor overlay on peers** — allies show skin + weapon, but the separate armor-plate overlay (`p.gear` + `meta.showArmor`) isn't synced. Weapon-in-hand is the main visible gear.
- **Area-progression sync** — the `runSeed`/zone sync fires on zone entry; moving between AREAS within a zone isn't explicitly synced.
- **Non-projectile/non-ring skill FX** — auras, beams, screen flashes aren't individually synced (projectiles + shockwaves cover the majority of visible combat).
- MP still only tested by Oliver + one friend; larger lobbies unproven.

### Other standing items
- BLADEFALL has deeper roadmaps in `UPDATE_ROADMAP.md` and `STORY_BIBLE.md` (story v2: Bladeborn, brother Ian, Abyss King Awakened = final boss; endgame TODO: Ian's Blade legendary, Castle Duskmoor vertical fortress, Codex balance pass).
- True-3D-mesh POC exists at `bladefall.pages.dev/poc3d/` (Oliver considering a switch from voxels; bottleneck is 3D-art production, not code).

---

## Conventions / gotchas

- **No em dashes** in Oliver's public copy — but in-game code/comments are fine.
- **Telegram digest** on request: `curl POST https://thework.pages.dev/state` with `{"action":"tgPing","password":"oliverNCA2026","text":"..."}` — bullet-point changelog + playtest link.
- **Don't commit `.wrangler/`** (local cache; gitignored). Wrangler is logged into the theantianxietyacademy account.
- Response style for Oliver: full technical narration, then a clearly-headed plain-English **Summary**.
- Verify before claiming done — drive `__BF3` in the preview and show evidence.
