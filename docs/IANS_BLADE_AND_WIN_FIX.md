# BLADEFALL — Ian's Blade unlock + Castle Duskmoor win-clear fix (work order)

> Follow `AGENTS.md`. Two focused fixes. Save-safe, stays voxel. Line refs are approximate
> (v1.172) — locate by the described code, don't trust exact numbers.

## FIX 1 — Beating Castle Duskmoor doesn't register as "cleared" (BUG)
**Repro:** clear the final zone (Castle Duskmoor / the last stage). Credits + "VICTORY"
play, but the castle never shows as cleared — no boss trophy in the hub, the castle gate
never flips to "done."

**Root cause:** `meta.zoneDone[Z.id]=true` is set ONLY inside `zoneClear()`. But the FINAL
stage doesn't route through `zoneClear()` — clearing the last stage calls **`winGame()`
directly** (the `if(G.stageIndex===STAGES.length-1){ winGame(); return; }` path). `winGame()`
sets `meta.hero`, the difficulty-rung flag (`meta['beat'+D.id]`), etc., but **never sets
`meta.zoneDone` for the final zone**. So Castle Duskmoor's clear flag is never written.

**Fix:** in `winGame()` (before its `persist(); persistGlobal();`), mark the final zone
cleared and the world complete:
```
meta.zoneDone[curZone().id] = true;                                  // the castle IS cleared
meta.zoneMax = Math.max(meta.zoneMax||0, ZONES.length-1);            // all gates open
```
(Optionally also `meta.zonesCleared=(meta.zonesCleared||0)+1` if that stat should count the
final zone — check it isn't already counted elsewhere to avoid double-count.)

**Verify:** beat the final boss → after the VICTORY card, return to hub and confirm the
**Castle Duskmoor gate shows "done"** and its **boss trophy appears** on the hub wall. Load
an old save that had already "won" — it won't retroactively fix (that's fine), but a fresh
win now registers. `git diff --check` clean.

## FIX 2 — Ian's Blade: purchasable after Castle Duskmoor for 1,000,000 gold
Ian's Blade currently exists ONLY as story lore — there is NO weapon or shop entry. Create it.

**The weapon (a true capstone legendary):**
- Add `iansblade` to the weapon data (ARCHES or a special-item def). Family/art: a sword so
  it renders in-hand (`art:'sword'`), rarity legendary, **best-in-slot stats** (clearly the
  strongest weapon in the game — it's the final reward).
- **Build-agnostic**, per the locked design: it **ignores the off-class multiplier** — EVERY
  class wields it at full power (special-case it in `classFamilyOk`/`offclassMul`, or flag
  `w.anyClass=true` and honor it there). Give it a **signature effect** with real presence
  (e.g. a bright holy/gold on-hit burst or an execute proc) and a distinct radiant look + a
  boss-tier drop/equip fanfare. It is "the last Bladeborn's" relic — it should feel mythic.

**The shop gate (mirror the Void Scythe special-row pattern in `openShop` ~6847 + the
`.wbuy` handler ~6900):**
- Ian's Blade appears as a special shop row **only when `meta.zoneDone['castle']` is true**
  (Castle Duskmoor cleared — which Fix 1 now correctly sets).
- Price: **1,000,000 gold**. Buying deducts 1,000,000 and grants the weapon like any purchase
  (respect bag-full handling; it's legendary so level-gating already allows it at endgame —
  but since it's post-final-boss, the player is max-ish anyway).
- **Announce it:** when the castle is cleared, fire a toast/storyToast — "Ian's Blade now
  waits in the Shop" — same pattern as the Void Scythe `meta._scytheNotify` notify.
- Save-safe: `meta.zoneDone['castle']` already persists; no new schema needed.

**Verify:** before beating the castle, Ian's Blade is NOT in the shop. Beat the castle (Fix 1
makes zoneDone.castle true) → the notify fires and Ian's Blade appears in the shop at
1,000,000g. With <1,000,000 it's unaffordable; with ≥1,000,000 buying it deducts the gold,
grants the weapon, and it wields at full power on ALL four classes (no off-class penalty).
Bump `VERSION3D`, push, log in `UPDATE_ROADMAP.md`.
