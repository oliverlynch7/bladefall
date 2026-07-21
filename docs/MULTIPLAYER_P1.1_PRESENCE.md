# BLADEFALL — Multiplayer Phase 1.1: in-game lobby + presence (work order)

> Co-op step 1 INSIDE the game: two players connect and SEE EACH OTHER move through the same
> zone. Builds on the proven `public/mp-lab/` connection layer. Follow `AGENTS.md`.
> **Single-player must remain byte-for-byte unaffected.**

## HARD GUARANTEES (non-negotiable — this is why Oliver can trust it won't hurt single-player)
1. **Multiplayer is fully OPT-IN.** Single-player is the default and untouched. If the player
   never enters multiplayer, the game runs exactly as today.
2. **All netcode is ISOLATED** in one `MP` object/namespace. The single-player update/render
   loop is not rewritten — presence is an additive overlay that only does anything when
   `MP.active`.
3. **PeerJS is LAZY-LOADED** — injected via a `<script>` only when the player enters
   multiplayer. Single-player NEVER loads it → zero size/perf/offline impact on the base game.
   (This resolves the CDN-vs-inline question: on-demand CDN load, so the single-file game stays
   dependency-free until you opt into MP, which needs internet anyway.)
4. **No save-schema change.** MP state is runtime-only (`G`-level / `MP`), never persisted.

## SCOPE OF P1.1 (presence only — NOT shared enemies yet)
- A **Multiplayer menu** (from the Title screen and/or pause): **Host** (generates a room code)
  and **Join** (enter code). Reuse mp-lab's PeerJS logic: `Peer('bladefall-mp-'+code)`, free
  cloud signaling, host = star hub, guests connect to host.
- On Host: the host picks a zone and starts it; the room code shows; guests who join **load the
  SAME zone with the SAME seed** (host sends `{zone, seed}` on connect) so everyone is in an
  identical space.
- **Presence sync:** each client sends its character state (x, z, y, yaw, anim/skin, hp) to the
  host ~12-15x/sec; the host relays everyone's state to all; each client **renders the OTHER
  players' characters** as live ghosts (reuse `drawHero3`), with a name label.
- **Out of scope for P1.1 (later phases):** shared enemies (each client still runs its own
  local enemies — P1.2 makes the host authoritative for enemies/projectiles/hazards), shared
  loot/quest/death (P1.3). P1.1 = "we can see each other run through the same level."

## BUILD NOTES
- Put ALL of it behind an `MP` module: `MP.host(zone)`, `MP.join(code)`, `MP.send(state)`,
  `MP.onState(cb)`, `MP.peers` (id -> {x,z,y,yaw,skin,name,hp,t}), `MP.active`.
- Interpolate remote players between updates (lerp toward the latest position) so ~12 Hz sync
  looks smooth. Drop stale peers after ~3s of silence.
- Load PeerJS on first MP entry: inject `https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`
  (add SRI `integrity`), await it, then open the lobby. If it fails to load (offline), show a
  clean "Multiplayer needs an internet connection" and return to single-player.
- The render hook: in the zone render, after drawing the local hero, loop `MP.peers` and draw
  each remote hero at its interpolated transform. Guard the whole thing with `if(MP.active)`.
- Reuse the mp-lab message shapes (hello/pos/state/ping-pong). Keep messages tiny.

## VERIFY (two browsers / two devices)
- Single-player: enter a zone normally — PeerJS is NOT loaded (check network tab), behaviour
  is identical to before. THE BASE GAME IS UNAFFECTED.
- Host a co-op zone on one client, Join with the code on another → both are in the same zone
  and **see each other's character move in real time**, smoothly interpolated, with names.
- A guest leaving removes its ghost within a few seconds; the host leaving returns guests
  cleanly to single-player with a message.
- Bump VERSION3D, verify in-browser, push, log in the roadmap.

## NEXT (not this order): P1.2 shared enemies (host-authoritative), P1.3 shared loot/quests/
## death-revive, P1.4 polish (join/leave, host-migration-or-graceful-fail, lag smoothing).
