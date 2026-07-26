# Necromancer Summon PvE Authority Fix — 2026-07-25

Branch: `bladefall-autopilot`
Version: `1.380.0-autopilot`

## Root cause

Necromancer minions already acquired active PvE mobs and called `hitEnemy`, but multiplayer guests only relayed hits to the authoritative host when the damage source was exactly the player object. Minions and pets intentionally identify their source as `{pet:true}`. Their damage therefore happened only in the guest's local copy, then the next host enemy snapshot restored the mob's HP.

This made guest-owned summons look ineffective against shared mobs while the separate PvP pseudo-target route could still work.

## Fix

- Guest-owned minion and pet hits now use the established `MP.sendHit` host-authority path.
- PvP player targeting remains unchanged and continues through `MP.sendPvp`.
- Host/single-player PvE damage remains unchanged.
- Added `MP`, `spawnMinion`, and `minionUpdate` to the existing debug-only `window.__BF3` surface so this authority path can be regression-tested directly.

## Verification

- [x] Single-player summon acquired and killed an active 22-HP mob (30 damage over the test window).
- [x] Guest simulation sent an authoritative `{t:'hit', m:77, d:25}` packet for a minion strike.
- [x] Guest simulation left shared mob HP unchanged locally at 1000.
- [x] Applying that packet as host reduced authoritative mob HP from 1000 to 975.
- [x] PvP targeting remained present and sent one 17-damage hit to the opposing peer.
- [x] JavaScript syntax and muted real-browser console passed with zero errors/warnings.
