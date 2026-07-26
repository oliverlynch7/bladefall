# BLADEFALL — Current State and Session Handoff

## [Codex | 2026-07-25]

This note is the canonical handoff for the recent Bladefall work. It is intended to let a new Codex or Claude session resume without relying on chat history.

## Start here

- Repository: `C:\Users\Oliver\Documents\PraxisBrain\_automation\bladefall`
- Remote: `https://github.com/oliverlynch7/bladefall.git`
- Primary game file: `public/3d/index.html`
- Live site: `https://bladefall.pages.dev/3d/`
- Review preview: `https://bladefall-autopilot.bladefall.pages.dev/3d/`
- Current review branch: `bladefall-autopilot`
- Review HEAD at handoff: `fd232a2`
- `origin/main` at handoff: `a2b8048` (`Merge branch 'bladefall-autopilot'`)
- Current build string in both branches: `1.375.0-autopilot`
- The worktree was clean when this handoff was created.
- Git history and the source are authoritative if this note becomes stale.

Important branch rule: routine autonomous improvements belong on `bladefall-autopilot`. Oliver reviews the branch preview and merges it into `main`. Do not force-push, erase unrelated changes, or quietly bypass the review flow. Read `AUTOPILOT.md` before running autonomous work.

## Highest-priority pending request

### Purchasable arcade machine — revised direction, not implemented

The old hidden-easter-egg plan in `docs/ARCADE_GAMECEPTION_EASTER_EGG.md` is obsolete in one important respect. The arcade cabinet should **not** be hidden or automatically placed.

Approved current direction:

- Completing Normal Mode reveals an **Arcade Machine** permanent upgrade in the appropriate Waystation shop.
- Price: **100,000 gold**.
- Before a Normal Mode clear, the shop must not reveal or spoil it.
- Buying it permanently installs a physical arcade cabinet in the hub.
- It must persist across reloads, runs, characters, and difficulty changes.
- It must not be purchasable twice.
- If bought while already in the hub, it should appear immediately.
- The shop row becomes `Owned`.
- The cabinet receives a proximity-based `Arcade Machine` label and interaction prompt.
- Reuse the existing Normal Mode completion flag rather than adding a duplicate flag.
- Add a dedicated ownership field to the correct global/mode save scope after examining how other permanent Waystation upgrades persist.
- Safely migrate any older arcade/easter-egg ownership field if one exists.
- Preserve the original “Gameception” end goal: interacting with the cabinet eventually runs Isaac’s browser-playable 2D Bladefall inside a polished cabinet overlay while freezing and later restoring the 3D game’s simulation, input, audio, pointer state, and HUD.
- Isaac’s playable URL/build has not been supplied. Until it is available and embedding/storage behavior is audited, a polished `Coming Soon` arcade panel is acceptable, provided the purchase, cabinet, and interaction architecture are production-ready.
- A unique arcade icon may still need to be generated. Use a clearly marked temporary fallback only if no suitable icon exists.

Acceptance cases:

1. No Normal clear: shop row completely hidden.
2. Normal clear and under 100,000g: visible but unaffordable.
3. Exactly 100,000g: succeeds and leaves 0g.
4. More than 100,000g: deducts exactly 100,000g.
5. Cabinet spawns immediately in the current hub.
6. Cabinet persists after reload.
7. Unqualified/unowned saves never show the cabinet.
8. Duplicate purchase is impossible.
9. Desktop/mobile shop layouts remain usable.
10. Hub collision, camera, labels, and nearby interactions remain clean.

Update or supersede `docs/ARCADE_GAMECEPTION_EASTER_EGG.md` when this is built so another session does not follow the outdated “hidden cabinet” direction.

## Major systems shipped recently

### Class progression overhaul

The original four classes were converted to the complete v2 class system in v1.243.0, commit `60d35ae`, then audited and cleaned again in v1.308.0.

Universal structure:

- Rank 1: innate trait and basic attack only
- Rank 2: Skill 1, one of two choices
- Rank 3: passive, one of two choices
- Rank 4: Skill 2, one of two choices
- Rank 5: passive, one of two choices
- Rank 6: Skill 3, one of two choices
- Rank 7: passive, one of two choices
- Rank 8: Skill 4, one of two choices
- Rank 9: final passive, one of two choices
- Rank 10: capstone

The Pause → Classes viewer and Drillmaster Respec tree both conceal future names, icons, and descriptions until their ranks are reached. Rank 1 provides tutorial breathing room before Skill 1 unlocks at rank 2.

The original four classes have full skills/passives and real art:

- Warrior
- Ranger
- Mage
- Reaper

The expanded roster currently present in `CLASSES` and `CLASS2` is:

- Warrior, Ranger, Mage, Reaper
- Paladin, Necromancer, Ninja
- Berserker, Pirate, Chronomancer
- Monk, Stormcaller

Paladin, Necromancer, Ninja, Berserker, Pirate, and Chronomancer have class trials/unlock wiring and dedicated art passes. Monk and Stormcaller were added later as shop-unlocked classes and currently use emoji class crests in the definitions; they need a deliberate final-art audit.

The July 24 commit labels call Monk “new class 1/6” and Stormcaller “new class 2/6.” No commits for classes 3–6 appear in the current history. Do not invent the remaining four without recovering or confirming Oliver’s intended class list and designs.

The old legacy subclass overlay/data remains inert. Combat conditionals were removed in v1.308, but harmless display/fallback data still exists. A future cleanup can remove it after regression testing.

### Drillmaster’s Seal

- Permanent 20,000g Drillmaster purchase after mastering Warrior, Ranger, and Mage at rank 10.
- Lets the player switch class and respec directly from Pause → Classes, including mid-run.
- Ownership fields: `masterSeal` and `masterSealSeen`.
- Icon art exists.

### New class and combat work

- Necromancer minion system, corpse tracking, summons, and multiplayer-visible summons.
- Ninja mobility/evasion and broader Warrior/Ranger weapon access.
- Paladin holy combat.
- Pirate flintlock combat, slower/heavier cannonball shots, Pirate Gold Rush, and a breakable-wall vault.
- Chronomancer time/frost control.
- Berserker rage kit.
- Monk bare-fist weapon system; fists are rarity-less and strongest for Monk.
- Stormcaller lightning/static-speed mechanics.
- Per-class mana pools, regeneration, costs, sustain, and fast repeatable damage skills.
- Arena bots use real class kits, gear tiers, signature skills, and class-aware balance.

### Icons and interface

Recent sessions added or integrated:

- Class, skill, passive, innate, and capstone art for the established ten-class roster.
- Class-family-changing basic-attack HUD icons plus dodge icon/RMB presentation.
- Beastkeeper, Drillmaster/classes, title-screen exit, action, stat, equipment-rarity, armor-set, weapon, achievement, difficulty, destination, and hub-interactable icon work.
- Ian’s Blade and Hitless Mode icons.
- Gear inspector, Records screen, class viewer, respec tree, menu separation, and mobile/desktop polish.
- Loot 2.0 non-blocking item card with item art and dynamic keys.

Do not assume every new class has final art: specifically audit Monk and Stormcaller.

### World and level design

- The eight main zones and their paired area variants were greatly enlarged and deepened.
- Every main area variant now has a required, fair jump-plus-dash gate near its exit.
- The Outskirts teaches the mid-air dash with a contextual tutorial and reusable signpost.
- Secret rifts were moved to hidden/elevated/risk-reward locations.
- Secret discovery is provisional until the player survives to the level exit.
- `propGroundAt(x,z)` grounds natural props on terrain.
- `clearPortalArea(x,z)` keeps exits from being hidden inside props.
- `vsolid(...)` and `autoSolidify()` prevent players walking through large scenery.
- Low ledges use automatic step-up; meaningful climbs still require jumping.
- Hub floor, arena floor, portal placement, annex z-fighting, buried props, and building collision received systemic fixes.

Remaining level-design direction:

- `docs/WORLD_REBUILD_PROGRAM_2026-07-20.md` still calls for more authored Outskirts farm/village architecture and usable interiors.
- Continue human playtesting for navigation, traversal feel, and secret fairness; geometry tests do not replace a real playthrough.
- Any new world prop should use `propGroundAt`.
- Any new portal/exit/interactable should use `clearPortalArea`.

### Waystation and activities

- Waystation expanded substantially and was reorganized into clear plazas/bays.
- Trial chambers sit beside their parent gates.
- Arena has its own room, Arena Master, exit, loadout protection, bots, teams, rounds, powerups, and PvP.
- Treasure Sprint entry and timer behavior were fixed.
- The Gauntlet boss rush supports Normal/Brutal, splits, best times, and a first-clear glow reward.
- Mirror is a silvered live reflection with character naming and live stats.
- Training area and bestiary work, proximity titles, hub collision, trophies, postings, bags, NPC stations, and portals received repeated polish.
- Ian’s Blade now has a five-shard questline, hidden identity, reveal cutscene, forging path, shop shortcut, and persistent shard state.
- The Abyssal Heart is a 30,000g proximity secret detector.

### Multiplayer

The game now includes:

- In-game lobby/presence
- WebRTC/PeerJS connection flow
- TURN credentials from a Cloudflare Pages Function
- Shared host seed and shared mobs
- Shared hub, revive, PvP, arena flow, teams, scoreboard, and powerups
- Remote player name, skin, weapon, and HP display
- Synced swings, casts, projectiles, skill rings, pings, and summons
- Join timeout and guest-without-character fixes

Still treat multiplayer as needing real cross-network playtests. Confirm whether loot, quests, boss state, late join/rejoin, disconnect recovery, and long-session drift are fully authoritative before calling co-op complete. Older multiplayer documents describe earlier phases and may be stale; source and recent commits win.

### Tutorials, controls, accessibility, and settings

- Just-in-time first-trial teaching for movement, attack, dodge, progress, and portal use.
- Opening story setup plus first-open explainers for major hub systems.
- Rank-choice and first-skill tutorials.
- Full remappable keyboard bindings.
- Gamepad support.
- Graphics quality and render-distance controls.
- Screen-shake, reduce-motion, and particle toggles.
- Default over-the-shoulder camera, camera help, aimable Blink, and several camera fixes.

## Known pending or follow-up work

Priority order should be confirmed with Oliver, but these are the clearest open items:

1. **Build the revised 100,000g post-Normal arcade-machine shop upgrade.**
2. **Recover/confirm the remaining four classes** implied by the “1/6” and “2/6” Monk/Stormcaller batch before designing them.
3. **Create/audit final Monk and Stormcaller icon suites** if they still use placeholders.
4. **Holy spellblade and affinity-icon hook** from `AUTOPILOT.md`: ensure `venomedge`, `umbrablade`, and `lightbringer` never render blank; confirm whether Oliver wants a dedicated slim holy spellblade.
5. **Finish the Outskirts authored-settlement/interior pass** described in the world rebuild program.
6. **Run full human playthroughs** of newer trials, traversal gates, class unlocks, Gauntlet, Ian’s Blade, and cross-network multiplayer.
7. **Multiplayer authority audit** for loot/quests/bosses/reconnects and state drift.
8. **Remove dead legacy subclass UI/data** only after targeted save and class-menu regression tests.
9. **Resolve stale documentation:** `AUTOPILOT.md` contains outdated notes saying some classes still need art even though later commits supplied it. Update it carefully when the next supervised backlog pass happens.

Do not revive old “TODO” notes blindly. Many earlier roadmap items were completed later but their original text remains for history. Verify every proposed task against the current source and Git log.

## Save-system notes

The save schema is split:

- `GLOBAL_FIELDS`: settings, cross-mode records/unlocks, and other shared state.
- `MODE_FIELDS`: character/run-mode progression and inventories.
- `loadMode()` must explicitly load any new mode field.
- `persist()`/`persistGlobal()` must be used through established paths.

Before adding arcade ownership, determine whether it belongs globally or per save slot/mode based on Oliver’s “permanent hub upgrade across characters and difficulty changes” requirement. The requirement strongly suggests global ownership, but inspect how slots and Waystation upgrades currently behave before deciding. Add safe defaults and migration; never Reset user saves.

## Verification expectations

For every meaningful change:

1. Check the worktree and preserve unrelated edits.
2. Read the applicable roadmap/design note and the current implementation.
3. Parse the JavaScript extracted from `public/3d/index.html`.
4. Use a real browser and `window.__BF3` for focused smoke tests.
5. Test desktop and mobile UI when menus/HUD are changed.
6. Check console errors and image load failures.
7. Test old-save/default-value behavior for persistence changes.
8. Bump `VERSION3D`.
9. Commit focused files only.
10. Push to the correct branch.
11. Confirm the correct preview/live deployment before reporting success.

Useful debug surface: `window.__BF3` exposes game state, class helpers, world loading, combat utilities, test cheats, and camera/playtest hooks. `__BF3.look(x,z,yaw,pitch)` provides authored screenshot viewpoints.

## Supporting documents

Read these selectively:

- `AUTOPILOT.md` — branch workflow and current autonomous backlog
- `UPDATE_ROADMAP.md` — chronological implementation history
- `STORY_BIBLE.md` and `docs/STORY_BIBLE_v2.md` — canonical story direction
- `docs/WORLD_REBUILD_PROGRAM_2026-07-20.md` — current world-quality program
- `docs/LEVEL_DESIGN_PRINCIPLES.md` — navigation and level-design standards
- `docs/ARCADE_GAMECEPTION_EASTER_EGG.md` — original arcade integration architecture; purchase/unlock premise is now superseded
- `docs/MULTIPLAYER_P1.1_PRESENCE.md` — early multiplayer design context, not current completion truth
- `docs/TUTORIAL_SYSTEM_PLAN.md` — tutorial philosophy and coverage
- `docs/HUB_INTERACTABLE_ICON_ASSIGNMENTS.md` — hub icon mapping
- `docs/PLAN_A_10X_VOXEL_DETAIL.md` — visual-detail direction

## Product and writing preferences

- Use simple, immediately understandable language. Avoid obscure terms such as “Menagerie.”
- New class and ability names should be interesting but understandable by a middle-school reader.
- Keep the voxel/dark-fantasy identity.
- Icons need genuine transparency; reject white/checkerboard backgrounds and white-fringe artifacts.
- Hub floating labels should appear only at reasonable physical proximity.
- Do not cover gameplay with modal loot decisions when a non-blocking treatment works.
- Preserve old saves and avoid destructive migrations.
- Oliver prefers complete, polished systems and explicit playtesting over partial scaffolding presented as finished.

## Bottom line

Bladefall is no longer the small four-class prototype reflected in older notes. It is currently a large single-file WebGL action RPG with twelve class definitions, expanded worlds, class trials, multiple hub activities, boss rush, arena/PvP, co-op infrastructure, deep persistence, extensive custom art, and a large debug surface. The next session should begin by validating the branch/version, then implement the revised arcade-machine purchase or ask Oliver which of the other listed follow-ups takes priority.
