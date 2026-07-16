# BLADEFALL: Classes & Quests — Major Update Design
**Date:** 2026-07-15 · **Status:** ✅ ALL 4 PHASES SHIPPED (v1.18.0 → v1.21.0, live on bladefall.pages.dev) · **Supersedes:** the roguelite/hardcore mode structure from `2026-07-07-hardcore-roguelike-design.md` (its hub/gold/shop/perks foundations carry forward)

## Build log
| Phase | Version | Shipped |
|---|---|---|
| 1 · Combat core | v1.18.0 | 4-skill bar, 3 class kits, ranks 1-10, rank-3 subclasses, hybrid off-family penalty |
| 2 · World | v1.19.0 | 7-zone chain, 16 quests + gating, elites, tier scaling + loot bands, armor sets, hub-snapshot save |
| 3 · Secrets & classes | v1.20.0 | orb/rod retired, Reaper, starter tutorials + earned trials, 6 hidden side zones, trainer + shop ladder |
| 4 · Hazards & ladder | v1.21.0 | 4 signature hazards, Normal→Hardcore→Hitless, 14 achievement cosmetics + wardrobe |

**Deferred (deliberately, with reasons):**
- **Walkable hub** — the menu hub delivers every function (shop, trainer, wardrobe, quest board, portal row). Walking between them is presentation, not capability; it can land any time without touching systems.
- **Full enemy-telegraph pass** — moved from Phase 1 to a future pass so every monster gets authored wind-ups at once rather than being retrofitted twice. The Brute slam + Emberfall vents are the existing pattern.
- **Full-set armor bonuses** — sets have distinct stat pools and defense multipliers; a wear-3-pieces bonus is still open.

## Vision
Turn BLADEFALL from a run-based dungeon crawler into a zone-based action-RPG adventure: AQW-simple class combat (4 skills on cooldowns), themed zones with quests and bosses, hidden side zones, hard vertical platforming, and a walkable hub — with a Normal → Hardcore → Hitless difficulty ladder as the endgame.

## Pillar decisions (locked)
1. **Adventure becomes THE game.** The roguelite/hardcore mode select goes away; the game just starts. Hardcore returns later as an unlockable difficulty (see Ladder).
2. **Hybrid class↔weapon with teeth.** Each class owns a weapon family. Off-family weapons are playable but heavily nerfed: **−40% damage and abilities lose their bonus effects.**
3. **3 starter classes at launch** (Warrior / Ranger / Mage), a growing catalog of classes **earned via challenging unlock quests/trials**, and **per-class AQW-style ranks** that unlock abilities.
4. **World = linear main zone chain + hidden side zones** discovered inside main zones — secret, harder than their parent, carrying the best rewards (including class trials).

## A · Combat: the 4-skill bar
- Basic attack + dodge unchanged. Added: **4 class skills, each with its own cooldown** (~4s / 8s / 14s / 24s tiers). **No mana** — cooldowns only.
- Mobile: 4 skill buttons arced above SLASH. Desktop: keys **1–4**.
- **Enemy telegraphs everywhere** (Dark Souls influence): wind-ups with visible danger zones on all monsters, extending the Brute-slam pattern. Skill timing and dodging are the skill expression.
- **Elites**: each zone spawns elite versions of its monsters — minibosses: bigger, stronger, better drops. (Optional later spice: affix modifiers, e.g. "Frost-touched" = attacks slow.)

### Launch class kits (opener → AoE → mobility/utility → finisher)
- ⚔️ **Warrior** — family: blades, axes, hammers, spears
  - Cleave · Shockwave Stomp · Charge (gap-close + brief stun) · Berserk (damage+speed burst)
- 🏹 **Ranger** — family: bows, crossbows, daggers (thrown & melee)
  - Deadeye (high-damage precision strike) · Volley (projectile AoE) · Tumble (reposition + snare) · Hunter's Mark (target takes bonus damage) — names deliberately weapon-agnostic (no arrow-only flavor)
- 🔮 **Mage** — family: staves, wands, scepters
  - Elemental Bolt (uses weapon's element) · Nova (AoE slow) · Blink · Arcane Tempest (channelled storm)

### Class ranks & subclasses
- **Ranks 1–10 per class**; class XP from kills/quests while that class is equipped. Skills unlock at ranks **1 / 2 / 4 / 7**; **capstone passive at 10**.
- **Rank 3: choose 1 of 2 subclasses** — re-flavors/upgrades the kit and sets the capstone:
  - Mage → **Sorcerer** (destruction/burst) or **Wizard** (control/utility)
  - Warrior → **Berserker** (offense) or **Guardian** (defense/control)
  - Ranger → **Sniper** (precision/range) or **Assassin** (mobility/burst)
- **Respec** at the hub class trainer for gold, any time — but **locked while inside a zone** (the choice matters for the run, never permanently).

### Class acquisition
- **New save:** pick a starter class → play its **class-themed tutorial level** (teaches movement, combat, dodge, and that class's kit) → completing it unlocks the class and starts the game. The other two starters can be unlocked later the same way (their tutorial levels become their trials).
- **Trials are always skippable.** A skip button is always available, and a save that has already completed (or skipped) a trial is never forced through it again — in particular, Hardcore/Hitless deaths never replay the tutorial.
- **Earned classes:** unlocked by completing **class trials** hidden in side zones (first earned class: **Reaper** — scythes, dark powers). Trials are challenging, themed gauntlets.

## B · World: zones & quests
- **Main chain** (order-locked): Outskirts → Ember Depths → Frost Hollow → Storm Peaks → Void Rift → … Each zone: themed monster set, elites, 3–5 main quests, sub-areas, and a **zone boss**. Layouts remain procedurally generated per visit; theme/quests/boss are authored.
- **Quest gating:** main quests gate the zone's sub-areas; completing **all main quests grants the final quest**, which **unlocks the boss room**. Beating the boss completes the zone and unlocks the next.
- **Quest types:** kill N themed monsters · fetch/collect items · find/reach a location. Picked up at the hub quest board and/or auto-granted on zone entry; tracked on-screen; handed in for gold + XP + class XP.
- **Hidden side zones:** 1 per main zone (at launch), entered via a reasonably-hidden secret (cracked wall, ceiling-line parkour route, behind a lava fall). **One tier harder than the parent zone**, best-in-tier loot, and home to class trials. Their portals appear in the hub once discovered.
- **Scaling:** one curve drives monster stats and loot level by zone tier, so difficulty and reward ramp together across the whole game. Side zone = parent tier + 1.

## C · Platforming: vertical
- Multi-level rooms, real climbs, **elevation-gated secrets** (loot you can see before you can reach).
- **One signature hazard per zone:** ice you slide on (Frost Hollow), wind gusts mid-jump (Storm Peaks), phasing platforms (Void Rift), rising lava pulses (Ember Depths).
- Difficulty of parkour ramps with zone tier. Camera aids (occlusion silhouette, translucent walls) stay.

## D · Hub world
Walkable hub containing:
- **Shop** — gear + perks; **always stocks at least one starter weapon per class family** so you can immediately equip your class's ideal weapon type.
- **Class trainer** — switch class, view ranks/kits, choose/respec subclass (gold cost).
- **Wardrobe** — skins + achievement cosmetics.
- **Training dummies** — test weapons/builds safely.
- **Quest board** — pick up and hand in quests.
- **Portal row** — main-zone portals light up as unlocked; discovered side-zone portals appear.

## E · Loot & weapons
- **Chest pacing:** significantly fewer chests than earlier BLADEFALL. Chests keep randomness **within a rarity band set by zone tier** — early zones cap at low rarities; legendaries are late-game/side-zone territory. No legendary after zone 1.
- **Weapon roster change (CONFIRMED):** **orb and rod are retired.** Magic family = **staff, wand, scepter** (Demon Eye concept survives as a scepter head). All other arts stay: dagger, sword, greatsword, axe, hammer, spear, scythe, bow, crossbow.
- **Hub shop weapon ladder:** the shop stocks **one basic weapon per class family at every rarity except legendary** — deliberately plain, with **below-average stats for their rarity**. They exist as bad-luck protection (a guaranteed base upgrade), never as the best-in-tier option.
- **Armor stays, reworked into sets:** at each rarity tier there are a handful of **armor set families aligned to playstyles/classes** — e.g. **Heavy** (Warrior: defense, knockback resist), **Swift** (Ranger: speed, dodge), **Mystic** (Mage: ability cooldown/power). Pieces (helmet/chest/legs) roll within their set's stat identity; a full-set bonus is optional later. Built in Phase 2 with the loot bands.
- Rarity, elements, trinkets, gold, perks all carry forward unchanged.

## F · Cosmetics & achievements
- Achievements unlock **aesthetic customizables** — capes, weapon glow variants, trails, skins (extends the existing achievements→skins system). Titles possible on top, cosmetics are the priority.

## G · Difficulty ladder & save model
- **Normal (default):** the hub is the save point. Entering a zone snapshots your save; everything earned in-zone (loot, gold, XP, class XP) is provisional. **Die → respawn at hub, revert to the snapshot** — you keep all prior progress, losing only that attempt's earnings. **Clear the zone → everything banks** and a new save point is set.
- **Hardcore (unlocked by beating Normal):** death = full wipe, back to the very beginning (hub before zone 1, nothing saved).
- **Hitless (unlocked by beating Hardcore):** you have effectively **1 HP** — any hit **or any fall** kills, and death resets like Hardcore. Pure dodge mastery.

## H · Build phases
1. **Combat core** — skill bar + cooldowns, 3 class kits, class XP/ranks, subclass choice at rank 3, hybrid off-family penalty, enemy telegraphs. Playable inside current dungeons immediately.
2. **World** — zone chain with quest gating, sub-areas, elites, zone bosses, tier scaling, chest/rarity bands, death→hub snapshot model, quest board.
3. **Secrets & classes** — hidden side zones, starter tutorial trials, Reaper + its trial, weapon roster change (orb/rod retirement), shop starter weapons.
4. **Hub world & polish** — walkable hub (trainer/wardrobe/dummies/portal row), zone signature hazards, achievement cosmetics, Hardcore + Hitless unlocks, balance pass.

## Implementation notes (what the build settled)
- **Zones** are 2 sub-areas + a boss room each (The Apex is boss-only). Areas reuse the existing generator with a per-area seed, so layouts differ every visit while the theme/enemy table stays authored.
- **Quest gating** is per-area: the exit portal stays sealed until that area's quests are done. Because you must clear every area to reach the boss room, "all main quests → final quest" falls out naturally.
- **Hazard/zone map:** Outskirts none (it's the tutorial zone) · Hollow Pass Gales · Ruined Keep Phasing · Frostfell Rime · Emberdeep Emberfall · The Abyss Phasing · The Apex Emberfall. Only mid-bridge stepping stones may phase — never a landing stoop — and no tile stays gone >3.5s, so nothing can strand you.
- **Difficulty authority:** the rules derive from `MODE` (the loaded save key: `rl`/`hc`/`hl`), not from the global `meta.diff`, so the two can never desync into a hardcore save playing by Normal's rules.
- **Trial skip rule (as built):** starter tutorials are skippable *and skipping still unlocks* — they teach, they don't gate. Earned trials (the Reaper's) refuse the skip; you can only leave. No trial is ever replayed once done or skipped.
- **Legacy saves:** orb→scepter and rod→wand normalize on load, so no existing weapon becomes permanently off-class. A save with prior progress is never re-gated behind the starter picker.

## Resolved (2026-07-15, second pass)
1. **Rod + orb retired** — confirmed (rod not differentiated enough vs staff/wand/scepter).
2. **Subclass names locked** — Sorcerer/Wizard, Berserker/Guardian, Sniper/Assassin.
3. **Kits locked as proposed** (Oliver will playtest + iterate); Ranger skills renamed weapon-agnostic (Deadeye/Volley/Tumble/Hunter's Mark).
4. **Trials always skippable**; never replayed on Hardcore/Hitless resets.
5. **Armor kept + set rework** (class-aligned set families per rarity tier, Phase 2).
6. **Shop weapon ladder** (basic below-par weapon per family per rarity, no legendary).
Zone names/order remain placeholders until Phase 2 authoring.
