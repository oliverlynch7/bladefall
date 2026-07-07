# BLADEFALL 3D — Hardcore Roguelike Design Spec

**Date:** 2026-07-07
**Status:** Approved direction (Oliver), pending final spec review before Phase 1.
**Baseline:** v1.5.1 (procedural room-based dungeon crawler). This spec turns it into a
ranked-gate, vertical-floor, permadeath-optional roguelike inspired by *Solo Leveling*,
in BLADEFALL's existing voxel / amber-on-dark style.

---

## 1. Vision

BLADEFALL becomes a **hardcore dungeon-crawler roguelike**. You stand in a **Hub** (the
"System" lobby), gear up at a **shop**, and enter **Gates** — themed, ranked dungeons of
randomly-sized **vertical floors** (towers that climb, or basements that descend). You fight
down/up through branching halls, lockdown mini-fights, optional minor bosses, and treasure
vaults, then face the **dungeon boss** to **clear** it. On clearing you choose: **bank** your
haul back at the Hub, or **descend deeper** into a harder continuation for more loot/XP —
knowing a death forfeits the run's unsecured spoils (Roguelite) or wipes your save entirely
(Hardcore).

The 14-stage linear "campaign" is **retired** (preserved in git history; restorable anytime).

---

## 2. Modes (separate saves)

The title screen opens on a **Mode Select**. Each mode has its **own save file** so progress
never mixes.

| | **Roguelite** | **Hardcore** |
|---|---|---|
| Save key | `bladefall3d_rl` | `bladefall3d_hc` |
| Character | Persists across runs (level, equipped gear, banked gold) | Persists **only until death** |
| Death | Return to Hub; **lose the current dive's unsecured loot & gold**; keep your character | **Save wiped to zero** — fresh character |
| Difficulty | Standard scaling | Higher base scaling; one life |
| Shop | Growth engine across runs | Spend-it-or-lose-it within one life |

"Unsecured" = loot/gold gathered on the current dive but not yet banked at the Hub (see §4).

**Skins & achievements** remain global (shared across modes, as today), imported from the
existing `bladefall3d_v1` save on first run so nothing Caleb unlocked is lost.

---

## 3. Gates (dungeons)

A **Gate** is one dungeon. Gates are presented in the Hub as glowing rank-sigil portals.

- **Theme** — each gate has its own biome (reuse/extend the existing themes: plains, forest,
  badlands, canyon, ruins, dungeon, frost, volcano, void, apex).
- **Rank (E → D → C → B → A → S)** — drives floor count, enemy scaling, and loot rarity floor.
  Higher rank = deeper, deadlier, richer. This is the primary "which risk do I take" choice.
- **Vertical orientation** — a gate is either a **descent** (basement floors going down) or an
  **ascent** (tower floors going up). Cosmetic + framing; floors themselves reuse the 3D dungeon
  generator. **Between floors:** the player enters a **staircase** (up or down) which triggers a
  **directional fade-to-black wipe** (downward wipe = descending, upward = ascending), then the
  next floor loads fresh and the player appears on it. Only one floor is loaded at a time
  (confirmed with Oliver — keeps rendering light; no literal stacked-in-3D geometry).
- **Floor count** — **finite but randomized** per entry (e.g., E: 2–3 floors … S: 6–9),
  so the same gate is never the same layout twice, but it always ends and can be fully cleared.

**Clear metric:** reach the **final floor** and defeat the **dungeon boss** (the gate's
"master"). Minor bosses on intermediate floors are **optional** (extra loot, extra risk).
Keys/puzzles gate **optional treasure vaults**, never the main path (this also sidesteps the
solvability risk we fixed in v1.5.1 — the main path never depends on a puzzle).

---

## 4. Core loop & the descend-deeper risk/reward

```
Hub (shop, gear, gate select)
   │  enter a Gate
   ▼
Floor 1 ── Floor 2 ── … ── Final Floor (dungeon boss)
   (branching halls, lockdown mini-fights, chests, optional minor bosses, optional vaults)
   │  beat the boss  → GATE CLEARED
   ▼
CHOICE:  ┌── BANK  → return to Hub, secure all dive loot & gold  (safe)
         └── DESCEND DEEPER → a fresh, harder gate continuation   (greedy)
```

- **Limited healing between floors** — you do **not** fully heal on the stairs. Healing comes
  from springs, shop potions, and lifesteal. Chipping down as you go is the intra-gate tension.
- **Descend deeper** — after a clear, choosing to descend starts another gate immediately at a
  **stacking difficulty multiplier** (mobs get *slightly* harder each descent, e.g. ×1.10 HP &
  damage per descent level), with **loot/XP/gold scaled up to match**. Your HP carries over
  (still not full) — so the deeper you chain without banking, the richer and deadlier it gets.
- **Banking** secures everything gathered so far into your persistent character (Roguelite) or
  just continues your one life (Hardcore). **Dying before you bank** forfeits the unsecured
  dive rewards (Roguelite) or wipes the save (Hardcore).

Depth scaling reuses the existing two-axis pattern (`stageScale` / `computeNgScales` style):
`enemyHP *= descentMul`, `enemyDmg *= descentMul`, `dropRarityLuck += descent`, so it slots
into the current combat math cleanly.

---

## 5. Economy: gold, loot, shop

- **Gold** — new currency. Enemies and chests drop gold; **selling** unwanted loot at the shop
  yields gold. Shown in the HUD and Hub.
- **Loot stays diegetic** — the existing drop system (rarity, elements, weapons, armor) is
  unchanged; drops still appear in dungeons.
- **Shop (Hub)** — buy weapons / armor / **amulets / rings** / **consumables** (potions,
  revives?) / **permanent stat upgrades**; **sell** loot for gold; **reroll** stock for a fee.
  Roguelite: the between-run growth engine. Hardcore: mid-life spending only.
- **Passive items** — some chest/shop items are **passive relics** that boost stats or can be
  resold (per Oliver's ask). Modeled as amulet/ring/relic entries.

---

## 6. Equipment: amulets, rings, abilities

Adds a **5th and 6th equip slot** to the existing weapon + 3-armor loadout:

- **Amulet** & **Ring** — each carries **passives** (crit chance, cooldown reduction,
  elemental damage, gold find, lifesteal, etc.).
- **Active abilities** — an amulet (or ring) may grant one **active ability** bound to a new
  **ability button** (mobile) / key (desktop): e.g. **Dash Nova** (AoE burst), **Mend**
  (self-heal), **Time-Slow**, **Shadow Strike**. Cooldown-based, reads as the "skill" the
  player equips. Start with a small curated set; expand later.

Gear model extends `recomputeArmor` / `eff*` stat pipeline with two more slots and an
ability registry.

---

## 7. Solo Leveling flavor (our style)

- **Gates as portals** with a **rank sigil** (E–S), glowing in our amber palette.
- **"System" notifications** — level-ups, gate clears, rank reveals, and loot rendered as
  framed "System" windows (the SL status-window motif), but styled in BLADEFALL's
  amber-on-dark voxel aesthetic, **not** SL's blue, so it still reads as ours.
- **Boss = the gate's "monarch/master."** Optional minor bosses = "named" elites.
- Restraint: we borrow the *structure and UI language* (gates, ranks, System windows), not the
  literal art. No blue neon, no direct asset lifts.

---

## 8. What's retired / migration

- The **14-stage linear campaign** loop (`STAGES` as an ordered act list, `Continue`/`NG+`
  title flow) is removed from the play path. The `STAGES` **theme data is reused** as the gate
  biome pool. Old code stays in git history (all versions are commits; will be tagged).
- Existing **saves**: skins/achievements import once into the new global store; per-mode run
  saves start fresh.

---

## 9. Phased build (each phase ships & deploys)

1. **Phase 1 — Foundation.** ✅ **SHIPPED as v1.6.0 (2026-07-07).** Mode Select (Roguelite +
   Hardcore) with separate per-mode saves + a shared global store (skins/achievements migrated
   from the old save); the **Hub** screen; **gold** currency (kills/chests/selling loot); the
   **shop** selling **permanent per-mode perks** (Vigor/Might/Haste/Swiftness/Keen Edge/Greed) as
   the growth engine; **amulet + ring** slots with passives folded into the stat pipeline; Hardcore
   death wipes the save, Roguelite keeps gold+perks.
   *Scoping:* the shop sells perks this phase — **buying gear items + a persistent bank/inventory
   are deferred to Phase 2** (they pair with descend). Loot resale is a "Sell" button on drop
   popups. "Enter Dungeon" launches the existing v1.5 dungeon as the stand-in gate until Phase 2.
2. **Phase 2 — Gates & vertical floors.** Ranked themed gates; multi-floor procedural dungeons
   (ascent/descent) with finite random floor counts; limited-HP-between-floors; optional minor
   bosses; dungeon-boss-clears-the-gate; **descend-deeper** with stacking difficulty.
3. **Phase 3 — Stakes & flavor.** Hardcore permadeath + Roguelite bank/forfeit rules; **active
   abilities** + ability button; the **System** notification UI; passive relics; balance +
   headless validation sweep.

Each phase bumps `VERSION3D`, commits, pushes (auto-deploys via CD), and the in-app
self-updater refreshes Caleb's phone.

---

## 10. Testing & validation

Continue using the `window.__BF3` headless hook (extend `snap()` for hub/shop/gate/floor
state). Per phase: a solvability + reachability sweep across many seeds and ranks (like the
v1.5.1 key-softlock sweep), end-to-end "enter gate → clear → bank/descend → shop" simulation,
and a play smoke test for crashes/console errors before each deploy.

---

## 11. Locked decisions

- Campaign **retired**; modes = **Roguelite + Hardcore**, separate saves. ✔
- Gates: themed, **ranked E–S**, **finite random vertical floors**, fully clearable via boss. ✔
- Clear → **bank or descend deeper**; **deeper = stacking harder mobs** + richer rewards. ✔
- Add **amulet + ring** slots with passives and active abilities. ✔
- Shop with gold (buy/sell/resell); loot drops stay. ✔
- Solo Leveling *structure/UI* flavor, BLADEFALL art. ✔

## 12. Open / to confirm during build

- Exact rank → (floor count, scaling, rarity) tuning tables.
- Whether **revives** exist in the shop (and if Hardcore forbids them).
- Ability roster & cooldowns (start small).
- Hub presentation: single "System" panel vs. a small walkable hub room.
