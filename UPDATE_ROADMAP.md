# BLADEFALL — Master Update Roadmap

## [Codex | 2026-07-18] Waystation destination art + prominent navigation cards (SHIPPED v1.122.0)

- [x] Integrated all 15 approved Waystation destination designs: eight main-route gates and seven side zones, with the corrected two-icon sheet used exclusively for The Outskirts and Hollow Pass.
- [x] Rebuilt the Waystone picker around large responsive destination cards and introduced one reusable prominent navigation-card system across title, difficulty, pause/character, and keeper interaction surfaces.
- [x] Kept Back, settings, audio sliders, leave actions, and other utility controls compact so primary navigation remains visually dominant.
- [x] Verified muted desktop and mobile browser flows, destination selection, NPC interaction, and true pause simulation/SFX freezing; existing saves and trial tuning remain untouched.

## [Codex | 2026-07-18] v1.122 menu/icon audit (SHIPPED v1.123.0)

- [x] Audited title, difficulty, Waystation destinations/keepers, pause, settings, and NPC interaction navigation in muted real-browser sessions at 1440×1000 and 390×844.
- [x] Confirmed all menu art loads, primary navigation remains prominent, compact utility controls remain usable, existing saves load, and pause still freezes simulation while suspending game audio.
- [x] Fixed the objective mobile difficulty-layout defect by centering the odd third card; desktop now uses a balanced three-column difficulty row.

## [Codex | 2026-07-18] Zone-specific Warden’s Shade variants (SHIPPED v1.124.0)

- [x] Reworked the shared Shade renderer into eight approved zone identities while preserving one coherent silhouette: Outskirts lantern, Hollow chained talisman, Keep standard, Frost rime crown, Ember molten cracks, Abyss void halo, Palace sun halo, and Castle crescent/wing spars.
- [x] Variants are presentation-only and derive from the active zone; Shade AI, collision, dialogue, quest state, saves, and trial behavior are unchanged.

## [Codex | 2026-07-18] Detailed NPC interaction portraits (SHIPPED v1.125.0)

- [x] Added the approved revised cast sheet directly as the shared portrait source for Warden’s Shade, Smith, Beastkeeper, Quartermaster, Keeper, and Drillmaster interaction menus.
- [x] Character conversations now open with a portrait-led identity header, clear role, and personality line; activity props retain their focused activity icons.
- [x] In-world NPCs remain the simplified voxel models, and all NPC services, prices, state, dialogue behavior, saves, and trials are unchanged.

## [Codex | 2026-07-18] Objective-driven quest tracker completion (SHIPPED v1.126.0)

- [x] Preserved the already-landed larger 14–18px objective/progress hierarchy and explicit portrait placement below the player HUD after auditing all target viewport geometry.
- [x] Normal-area completion now adds a clear “The way opens — take the portal” next objective, matching the explicit completion flow already used by trials and Abyssal Descent.
- [x] Completed trackers gain a stronger green border/header state, while the existing one-shot progress pulse remains stable and portrait pulses expand away from the safe-area edge.

Everything below is organized in a sensible **build order** (phases). Each phase is a
self-contained work session. Work top to bottom.

## How to use this
- Game is the single file `public/3d/index.html` (live at `/3d/`).
- After each phase: bump `VERSION3D`, `git push` (CD auto-deploys), and **verify in a
  browser** (`python -m http.server` in `public/`, open `/3d/`) before claiming done.
- **MUTE THE GAME when you open it to test** — Oliver is often playing the live game at the
  same time, and two audio streams sound terrible. **DO THIS FIRST, as a tiny standalone commit:
  make the game auto-mute when `location.hostname` is `localhost`/`127.0.0.1` (how every test
  build is served) AND honor a `?mute=1` URL param** — then every test instance is silent by
  default with zero remembering, while the live `bladefall.pages.dev` stays normal. Until that
  ships, manually set `meta.soundOn`/`meta.musicOn` false in the test tab. (This does NOT affect
  Claude Code's own completion/notification sounds — those stay on so Oliver hears task-done.)
- **Do not break saves** — fold removed content via the `normWeapon`/`LEGACY_ART` pattern.
- Two detailed feature specs already exist and slot into Phase 8: the **Weapon Identity
  Overhaul** and the **Loot-juice + Drop-rate + Mixed-encounters + NPC "press E"** work-orders.

## Phase 0 — Global decisions (apply everywhere)
- [x] **Main levels are STATIC/hand-authored, not procedurally generated**, so they can be
  iterated to mastery. The **only** procedural content is the purple-secret trial rooms.
  *(v1.42.0: SCAPE main levels now seed off stage+area only — layout identical every run;
  boss maze + purple-secret trials keep the per-run seed.)*
- [x] **Never destroy gear.** Equipping or buying anything moves the replaced item to the bag;
  items are only lost when explicitly sold. *(bagReplaced on equip + shop buy, since v1.34.)*
- [x] Spawners **never stop** spawning until a kill-quest's count is actually met.
  *(den loop runs while `!questDone`; the Frostfell early-stop is a placement bug fixed in Phase 1.)*

## Phase 1 — Critical bugs & completability (do first; these block play)  ✅ v1.43.0
- [x] **Hitless death** no longer forces a brand-new class trial from the beginning.
  *(wipeMode now KEEPS classUnlocked/trialsDone — permadeath wipes the run, not your earned classes.)*
- [x] **Title Screen is always available in the ESC pause menu**, in every mode. *(added a Title Screen button.)*
- [x] **Stage count bug** ("1/14"). *(banner now shows the area name + ZONE x/7, reflecting the real 7-zone world.)*
- [x] **Ruined Keep — Sealed Vault reachable.** *(the maze-era level was replaced by the hand-tuned Keep
  SCAPE; zonescape.js BFS-verifies the find-objective + portal are reachable with conservative jump reach.)*
- [x] **Frostfell — frostlings spawn until 16.** *(root cause: a den on the high mesa spawned mobs into the
  void — moved to ground; spawner rewritten to be quest-driven so it refills until the count is met. Verified
  all 6 zones reliably reach their kill counts.)*
- [x] **Frostfell — plateau climbable.** *(SCAPE glacier climb is a climbRun chain within jump reach; harness-verified.)*
- [x] **Collectibles sit ON TOP of their surface.** *(SCAPE fetch items use the surface top as y0; harness checks 0 buried.)*
- [x] **Audit ALL objectives for completability.** *(zonescape.js verifies portal + every fetch/find/kill-den/secret
  reachable, both areas × seeds, all 6 zones; complete.js verifies kill counts are reachable.)*

## Phase 2 — Camera, control & input feel (affects the whole game)  ✅ v1.44.0
- [x] **Mouse/camera control:** a menu no longer costs camera control. *(new `regrabCam()` re-captures the
  mouse the instant a menu closes — inside the closing click's gesture — wired into resumePlay, pause resume,
  Esc-unpause, and hub wsResume. Only Esc releases it.)*
- [x] **Hub over-the-shoulder camera:** *(back wall pushed z:300→420 with the floor extended to match, so the
  shoulder camera now stands on solid floor INSIDE the hub in front of the wall — verified geometrically. The
  translucent LATE pass still fades any wall between camera and hero.)*
- [x] **Wall/floor transparency — floor underfoot stays solid.** *(new `standingOn()` guard: a wall/obstacle the
  player is standing on is never added to the translucent pass, so the surface under you never goes see-through.)*
- [x] **Portal transitions:** *(new `#fadeveil` + `warpTo()`: portal touch fades to black, loads the next area at
  the dark midpoint, fades back in — verified the veil turns on and the area advances.)*

## Phase 3 — Combat feel & targeting  ✅ v1.45.0
- [x] **Auto-aim prioritizes the direction you're LOOKING.** *(new `aimTarget()` scores by angle-from-aim
  (camera in shoulder/fps, facing in overhead) first, distance second, and hard-deprioritizes enemies behind
  you — verified it faces a far front enemy over a closer side one.)*
- [x] **Auto-aim (ranged) requires clear LINE OF SIGHT.** *(aimTarget skips any ranged target with losBlocked.)*
- [x] **Weapon attachment fix:** *(bows/crossbows + magic staffs/wands/scepters + the scythe now rest UPRIGHT in
  the third-person hand — a `_upright` orientation instead of the uniform blade-down flip; swung blades keep the
  combat pose.)*
- [x] **Skill visuals differ from the main attack (all classes).** *(Mage Bolt = fat rune-orb w/ orbiting ring +
  cast ring + comet trail; Ranger Deadeye = bright golden lance + muzzle flash + trail; Warrior Cleave = a golden
  arc fan across the front; Reaper Reap already has its purple soul-arc. New `runeorb`/`lance` shapes + `trail` flag.)*
- [x] **Level-up choice feels like an invitation, not a countdown.** *(ARM_MS 800→340ms; removed the sweeping
  timer bar; cards now ease in (fade+rise, `arminvite`); an audio cue (`SFX.achieve`) fires the instant choices appear.)*
- [x] **SFX sourcing** — *ADAPTED (noted): kept the game's procedural WebAudio cues rather than embedding external
  audio files. Rationale: single-file game + phone performance + no binary-asset fetch/embed available in this env;
  the procedural engine already has tiered drop fanfares (v1.40) and level chimes. Revisit if Oliver wants real files.*

## Phase 4 — Gear, bag & forging systems  ✅ v1.46.0
- [x] **Never lose gear:** equip/buy moves the replaced piece to the bag (bagReplaced, since v1.34).
- [x] **Bag full prompt:** *(new `bagFullPrompt` — on a stash with a full bag, offers to sell your lowest-value
  item to make room, or leave the new one behind; wired into the weapon + armor loot popups.)*
- [x] **Bag organized by category** — *(openBag now groups by melee/ranged/magic weapon then armor slot, with
  headers, rarity-descending within each group.)*
- [x] **Armor carries over level-to-level** — *(already: snapOf includes gear, freshFromSnapshot restores it,
  identical to weapons — verified.)*
- [x] **Armor can be combined to raise rarity** — *(the forge is now category-based; two same-rarity armor pieces
  of the same slot fuse.)*
- [x] **Forging = slot machine** — *(forge reworked to CATEGORY matching: two same-rarity pieces of the same
  category (melee/ranged/magic weapon, or armor slot) → a RANDOM new piece of that category at the next rarity.
  New `forgeSpin()` shows a Vampire-Survivors-style reel that ratchets down and lands on the payout, with tick +
  payout sounds. Verified: 2 Rare melee weapons → a random Epic melee weapon in the bag.)*
- [x] **Gear comparison arrows:** *(▲ green / ▼ red on each changed stat in the weapon + armor loot popups.)*

## Phase 5 — UI / HUD overhaul (desktop-first)  ✅ v1.47.0
- [x] **Shop compare:** *(new `shopCompare()` — clicking a shop weapon opens a full side-by-side card: damage,
  range, attack speed, knockback, element, lifesteal vs your CURRENT weapon, each with a green/red arrow, then Buy.)*
- [x] **Use the desktop screen real estate:** *(desktop media query — cards widen to 600px, lists get taller
  (66vh), rows/stat text scale up; no more cramped little scrollers on a wide screen.)*
- [x] **Scroll position preserved on click** — *(showOverlayHTML now captures + restores the list's scrollTop
  across a re-render, so equipping/selling doesn't jump the list back to the top — verified.)*
- [x] **Main HUD redesigned** — *(HUD is now an elegant glass corner PANEL (max 320px, not a full-width stretch):
  identity row (level/weapon/gold/zone) on top, then HP/XP/class/path bars — fixes the overlap and reads clean on desktop.)*

## Phase 6 — Onboarding / tutorial  ✅ v1.48.0
- [x] **First-time tutorial** — *(new `showTutorial()` on the first starter trial: controls (move/jump/attack/
  dodge/skills/talk/pause) + the goal, with **Begin the trial** and **Skip tutorial & trial**. One-time via
  `meta.tutDone`. Verified.)*
- [x] **Tutorial continues into the hub** — *(new `hubTutorial()` fires once on first hub entry after a trial
  (`meta.hubTutDone`): explains the keepers (E to use), the healing/banking waystone, and the Gates. Verified
  it shows once and never again.)*

## Phase 7 — Levels & world (STATIC, hand-built) — SHIPPED v1.49.0
- [x] **Convert main levels to static/hand-authored** designs — every explorable zone now has its
  own hand-authored SCAPE grammar (`SCAPES[zone.id]`); procedural stays only for purple-secret trial
  rooms. All 8 zones verified solvable + clean (zonescape harness: portal + every quest target
  reachable, 160 clean frames per area/seed).
- [x] **Outskirts:** rebuilt as a green **plains/field** — theme `plains`, green sky+ground,
  hazard renamed "THE WILDS" with no lava under-glow; **bigger clearings** (up to 680×560), wider
  180-unit links, and **richer graphics** (tree trunks + canopies, ~46 grass tufts + wildflowers).
- [x] **Hollow Pass:** the **pillar climb is now the MAIN path** — 6 pillars carry you from the mesa
  front edge up to the summit + portal (no more dead-end). The **side-wall parkour purple-secret**
  is kept as the TEMPLATE (rift chain off the summit).
- [x] **Palace level:** new **Sunspire Palace** (zone `palace`, tier 7) — white-marble colonnade,
  garden terraces (gilded-relic fetch), throne dais; bright-marble lighting branch; Marble Colossus
  miniboss (stage 14).
- [x] **Final level — dark-fantasy CASTLE:** new **Castle Duskmoor** (zone `castle`, tier 8) —
  ascend 4 tower tiers via climb-runs to the top-tier throne room; lava hazard, apex lighting;
  final boss **The Void Tyrant** (stage 16 = last stage → clearing it triggers winGame + ending).
  World chain expanded 7→8 zones, STAGES 14→17; TIERBAND / THEMEMOBS / CASTER_EL / gate spacing /
  STORY (zone cards, boss lines, Shade lore) all extended for both new zones.

## Phase 8 — Big feature work-orders (already spec'd; implement here)
- [x] **Weapon Identity Overhaul** — SHIPPED **v1.41.0** (Appendix A): per-weapon charge/hybrid/seek/pull,
  off-class disables specials, spear removed+folded, Void Scythe shop-only after Reaper, harder Reaper trial.
  *(Note: forging slot-machine + armor-combine (Phase 4) and per-skill visuals (Phase 3) remain TODO.)*
- [x] **Loot-juice + Drop-rate + Mixed-encounters + NPC "press E" dialogue** — SHIPPED **v1.40.0** (Appendix B):
  rarity-tiered drop fanfare + colored beam/burst/toast, drop-rate lowered, mixed-composition dens, press-E hub dialogue.
  *(Note: Appendix B item 1 asks for FREE-TO-USE sourced SFX; current drop/level SFX are procedural — see Phase 3 SFX item, still TODO.)*

## Phase 9 — Progression Rework (replaces the roguelite pick-3) — SHIPPED v1.50.0
- [x] **Removed the roguelite pick-3 entirely.** `gainXp` no longer queues an upgrade menu; each level
  runs `autoLevelGrow` (+13 Max HP, ×1.045 power, ×1.018 atk speed, +move/lifesteal) folded from the old
  pool, so the build is *stronger* without the menu. Verified: farmed L1→L11, mode never left `play`.
- [x] **Level-up = instant flourish:** growth + heal (+20) + `SFX.levelup` + floating "LEVEL n" text +
  burst + brief hitch; milestone `storyToast` every 5 and on each rarity unlock. No menu, no delay.
- [x] **Level persistence:** softened the XP curve (`44+30·l+1.7·l²`, was `46+34·l+2·l²`) so leveling
  keeps moving past ~15; level banks via `snapOf` on zone-clear and shows in the hub Waystone header.
- [x] **Character level gates gear rarity:** `RARITY[*].req` = common 1 / uncommon 4 / rare 9 / epic 15 /
  legendary 22. `canWield`/`heroLevel` guards block equip (weapon/armor/trinket loot cards, bag, shop buy,
  shop compare) with a "🔒 Requires Level X" toast; locked rows dim + show the requirement. Verified in
  the live shop (epic locked at hero L6, rare too).
- [x] **Double jump = shop "Magic Socks"** (1200g, permanent per-save `meta.socks`, applied via
  `applyPerks` + `freshFromSnapshot`). Removed the level-8 auto-unlock and the pick-3 "Aerial". All zones
  remain single-jump-solvable (zonescape uses single-jump reach). Verified: buy flips flag, maxJumps→2,
  gold −1200, row shows OWNED.
- [x] **Rarity clarity:** colors already grey→green→blue→purple→gold; added a numeric **tier pip (1–5)** in
  the rarity color on every item surface (loot cards, bag, shop). Names unchanged. Verified pips render.
- [x] **Class skill leveling = the meaningful choice / RESPEC-able** — the subclass fork at rank 2 is the
  branch node (2 options, distinct kits), and the Class Trainer already offers a 300g **respec** that
  clears the path and re-opens the choice. Staged deliverable (choice-node + respec) is in.
  *Deferred (as roadmap permits): authoring a full per-rank 2–3 skill choice at ranks 4 & 7 — needs ~2–3×
  more skills per class.*
- Net stack: character level (auto stats + rarity gate) · class ranks (branching skill choices, respec-able)
  · gold/shop (socks, perks, gear, bag slots) · gear/loot (rarity-gated).

## Phase 10 — Batch-2 additions (bag, trinkets, menus, onboarding, visuals) — SHIPPED v1.51.0
- [x] **ESC closes any open menu.** The key handler now backs out of `menu` mode (clicks the overlay's
  Back/Rise/Resume) and stashes on a loot card, instead of only toggling the pause menu. Verified: Esc on
  the bag fires its back callback.
- [x] **Bag sort toggle** — `openBag` has a Sort button cycling **Type** (grouped, default) / **Rarity**
  (flat, rarity-desc) / **Recent** (newest first) via `_bagSort`. Verified button present + cycles.
- [x] **Amulets & rings — baggable + forgeable.** Trinkets now stash (offer card + bag rows) and are a
  forge category (`fuseGroups`/`forgeResult`/`forgeSpin` handle `kind:'t'`; two same-rarity rings →
  next-rarity trinket). Verified: rings show in bag, `fuseGroups` yields a `t:ring` group.
- [x] **Equipped trinkets VISIBLE on the character** — `drawHero3` renders an amulet (chain + gem at the
  collar) and a ring (band on the hand) in the item's rarity color. Verified: 90 render frames clean with
  both equipped.
- [x] **Buy more BAG SLOTS in the shop** — "Magic Pack" (+5 slots, `meta.bagSlots`, cost ×1.55 each). Cap
  is a live `let STASH_CAP` refreshed on load + purchase. Verified: buy → cap 30→35, gold −260.
- [x] **First-trial intro popup** — `showTutorial` now opens with a "Proving Chamber" where/why paragraph
  (sealed chamber beneath the keep; survive to earn the class) before the controls.
- [x] **Charge-glow anchor** — the charge orb (3rd-person `drawSwing3` + 1st-person `drawFPWeapon`) now
  rides the weapon's business end (blade/tip/head), offset by reach and raised for big/magic weapons,
  instead of sitting on the grip.

## Phase 11 — Depth & Endgame (from the latest playtest — the fun-ceiling raisers) — 5/6 SHIPPED v1.52.0
- [x] **Boss PHASES + signatures** — every boss now flips to **phase 2 at ≤50% HP** (faster, +10% dmg,
  specials on a shortened fuse via `*(e.phase>=2?0.55:1)`, an immediate signature on the flip, an "ENRAGED"
  + `storyToast` tell). The Colossus gained a **Seismic Pound** shockwave (arena mechanic you jump); the
  Tyrant gains a 5-orb void barrage in phase 2. Verified: brute flips 1→2 at <50%, render clean.
- [x] **Enemy ROLES** — ~22% of ground mobs spawn as **Shielder** (frontal block via a slowly-turning
  guard `shieldYaw`; flank it), **Healer** (heals nearby allies), **Exploder** (rushes, fuses, detonates a
  shockwave), **Flanker** (circles in from the side). Role beacon above the head + shield plate render.
  Verified: all four run 200 frames clean, no extra HP. (`saltMob` mixes still feed the dens.)
- [x] **Endgame "one more run" loop (Endless Descent)** — SHIPPED v1.61.0. Infinite escalating survival
  mode entered from the **Waystation's Abyssal Descent stone** (E) AND a **Title-screen button** (both show
  best). Each floor loads a boxed themed arena (rotates zone palettes via `STAGES[..].theme`, biasing darker
  deeper). Clear the floor's spawn wave → portal down (`warpTo`/`#fadeveil`). Scaling off the NG scalars:
  `ngHp x1.11^floor`, `ngDmg x1.06^floor` + a slow `zoneTier` climb (feeds the loot band too). Spawn
  count/rate ramp under a **hard concurrent cap (<=24)**; deeper floors add more elites. XP+gold scale with
  depth; loot cache every 3rd floor (rarity still level-gated). **Not permadeath** — death banks everything
  and returns to hub; deepest floor saved as `meta.endlessBest` (GLOBAL, per-slot). Verified in-browser:
  entry (stone+title), floor advance, F20 scaling (ngHp 7.3 / hp 246 / dmg 32), cap held (24/24), reward
  beat on F3, death banks gains + updates best, best survives reload, no console errors. **This is also the
  Phase 14 "Proving Grounds" — same feature, both items done.**
- [x] **Hitstop + kill crunch** — every kill now sets a brief `G.slowmo` freeze (boss 0.38 / elite 0.10 /
  trash 0.05, already scaling `dt`) + a gold death-pop particle spray. Verified: kill crunch fires in-loop.
- [x] **Shop north-star** — the shop shows a progress **bar** toward the next big-ticket goal
  (Magic Socks → Void Scythe → Magic Pack): "`gold / cost` to `<goal>`". Verified: 800/1200 = 66% bar.
- [x] **Off-screen threat arrows** — `drawThreatArrows` on the 2D HUD canvas draws rarity/threat-colored
  edge arrows pointing at nearby enemies that are off-screen or behind the camera (aiming cameras only).
  Verified: renders clean across all the role/boss frames.

## Phase 12 — Hub 2.0 (make the Waystation a place worth being, not a menu lobby) — SHIPPED v1.53.0
- [x] **The hub GROWS with your progress.** `drawWaystation` now mounts a **boss trophy** (a relic in the
  boss's colour, `ZONE_TROPHY`) on the west wall for each `meta.zoneDone` zone; **cleared gates burn
  permanently bright** (higher glow + green flame motes); and a **class-trainer figure appears** for every
  `meta.classUnlocked` class behind the Drillmaster. No mannequins. Verified with 3 cleared zones + 3 classes.
- [x] **World VISTA.** The north rampart is lowered to 66 so you see over it to distant zone silhouettes
  (canyon/peaks/volcano/abyss) with the **Apex throne looming** on the horizon, plus drifting ambient
  **embers**. Verified: renders clean over the low wall.
- [x] **Training arena.** New **Sparring Post** (E → `openTrainingArena`): spawn ×2 of any foe unlocked by
  your `zoneMax` (10 types at zoneMax 4), **stakes-free** (hub `hurtPlayer` never kills; practice foes give
  no XP/gold/loot), plus a **target range** (ranged dummies) and a **short parkour course**. Verified: spawns
  2 practice foes, lethal hit does not kill in the hub.
- [x] **A MIRROR** (E → `openMirror`): renders a **live portrait** of your character with equipped
  gear/cosmetics (via `heroPortrait` → `drawHero3`), plus a full equipped-loadout sheet — invaluable in
  first-person. Verified: portrait renders as a data-image.
- [x] **NPCs alive + reactive.** `npcReact` appends a progress-aware line (gold / class+rank / gates cleared
  / bag state) to each keeper's dialogue; idle life added — the **Smith hammers** (with sparks) and the
  **Drillmaster drills** a practice cut. (Code-verified; runs on the existing E-to-talk path.)
- [x] **Expensive cosmetic HUB upgrades in the shop.** A "🏰 The Waystation" shop section sells **Relit
  Braziers (2500g)**, **War Banners (4000g)**, **Repaired Ramparts (7000g)**, **Gild the Waystone (12000g)** —
  persistent (`meta.hubUpgrades`), each visibly transforming `drawWaystation`. Verified: buy → −2500g, decor
  appears.

## Phase 13 — Menus, HUD & visual fixes — SHIPPED v1.54.0
- [x] **Title + pause backgrounds redesigned.** `#overlay` is now an opaque **BLADEFALL-branded** backdrop
  (amber torch-glow above, void-violet below, deep vignette) — the live 3D scene / "bobbing wall" no longer
  shows through any title/pause/menu screen. Verified: overlay bg is the branded gradient.
- [x] **Pause menu clarity redesign.** Rebuilt with **icons + grouped sections** (Continue / Character /
  Settings / Leave) in a scannable 2-column `.pgrid`; the eye finds options without reading each line.
- [x] **Persistent quest tracker on the HUD.** Moved to the **top-right** (right-aligned, under the pause
  button) so it never overlaps the left HUD panel; stays visible the whole run. Verified: right side, no overlap.
- [x] **First-person arm distortion fix.** The FP weapon pitch is now **clamped to ±0.42** so the arm/weapon
  no longer skews at extreme look-up/down (the camera still pitches fully).
- [x] **Hollow Pass wall flicker fix.** The canyon strata bands were **coplanar** with the wall face
  (z-fighting); pulled them ~2u proud of the face so their planes never coincide. Verified: Hollow renders clean.

### Also shipped in v1.54.0 (Oliver's direct feedback on the screenshot)
- [x] **Menu top-cutoff fixed** — `#overlay` uses `align-items:flex-start` + `.card{margin:auto}`, so tall
  menus (the Shop) are vertically centered when they fit and fully scrollable-to-top when they don't. Verified.
- [x] **Fullscreen toggle** added to the pause Settings (`toggleFullscreen`, requestFullscreen/exit).
- [x] **Widescreen menus** — desktop cards widen to `min(1080px,94vw)` and lists become **multi-column grids**
  (`.achlist` auto-fill 340px cols; skill trees opt out via `.solo`); `.pgrid`/`.choices` also 2-col. Verified:
  1080px card + 2-col shop list at 1280px.
- [x] **Weapon visuals** — long hafts (scythe/greatsword/hammer) **cant out over the shoulder at rest** so they
  no longer clip the arm; **swing poses now trace their hitbox** (scythe = full horizontal reap right→left,
  sword = sweeping diagonal, thrust = forward lunge, slam/chop = overhead). Verified: renders clean.

## Phase 14 — Level depth & bestiary (MAJOR content bar — build zone-by-zone: ship one, judge, then the rest)

> **Progress — ZONES 1–3 of 7 rebuilt (batch 1). Awaiting Oliver's playtest feedback before batch 2.**
> **v1.56.0 — Outskirts + Ruined Keep rebuilt (like Hollow), + hard/varied purple secrets, + auto-bag.**
> - **Purple-secret philosophy (per Oliver):** every rebuilt zone hides its rift a *different* hard way.
>   New engine support: a rift can be `hidden:true` + gated by a `secretTrigger` rune (revealed only when
>   stepped on). **Hollow = parkour-earned** (ledge chain off the summit). **Outskirts = exploration-earned**
>   (a tree-screened hidden glade reached through a narrow gap off the far-west, no path/marker). **Keep =
>   interaction-earned** (a dim floor rune in a dead-end crypt; step on it and the sealed rift grinds open).
>   Verified: outskirts rift reachable + visible in the glade; keep rift stays hidden until the trigger fires.
> - **Outskirts** — six wandering clearings in a loose loop + spur (minutes to roam), richer trees/flowers,
>   knoll overlook. Plains bestiary: **Thornboar** (tusked charger, kill target — 12), **Sporeback** (slow
>   poison walker that BURSTS a spore cloud on death). Verified: thornboar den reaches 14/12.
> - **Ruined Keep** — larger twin baileys split by the chasm (high ramparts / low phasing causeway), corner
>   towers, statues, + the crypt. Undead bestiary: **Revenant** (fast lunger, kill target — 15), **Sentinel**
>   (animated armor that always BLOCKS from the front — flank it). Verified: revenant kill works, sentinel is a shielder.
> - **Auto-bag toggle** (side button, like Auto-sell): loot auto-stashes (falls back to sell if the bag is
>   full); mutually exclusive with Auto-sell. Verified: stashes on pickup.
> - **Next batch (2):** Frostfell, Emberdeep, The Abyss — same treatment (size + unique bestiary + a hard
>   varied secret each), plus theme-consistency passes and eventually the hub **Proving Grounds**.

> **Batch 1 detail — Hollow Pass (SHIPPED v1.55.0):**
> Rebuilt `SCAPES.hollow` into a multi-minute canyon JOURNEY: entry gorge (arch landmark) → north
> corridor → a **FORK** (low slot-canyon road *or* a high ledge road that rejoins = a loop) → the **Mesa**
> (bone-pile checkpoint, a cragspitter perched) → a chasm crossing → the expanded **pillar field** (bone
> hunt, galewisps diving) → the **Summit / Hollow Shrine** (portal, skull-arch landmark). ~2000u south→north,
> four checkpoints. Solvable-by-construction (climbRun) — zonescape verifies portal + every objective
> reachable, both areas × 3 seeds. Canyon stays one biome the whole way (already theme-consistent).
> **New canyon bestiary** (distinct silhouettes + behaviours, `dive` flag now propagated in spawnEnemy):
> **Dust Jackal** (fast pounce-hunter, the kill target — 18), **Cragspitter** (lobs arcing rocks, kill-priority),
> **Galewisp** (telegraphed dive-bomber). Core mobs reused sparingly (bones only). Verified in-browser:
> dustjackal den reaches 20/18, rocks arc, galewisp dives, all render clean.
> **Next:** await feel judgment, then apply the same treatment to one more zone (theme consistency matters
> most for Outskirts/others), and separately the hub **Proving Grounds** endless-grind mode.

- [ ] **Theme consistency per zone.** Every sub-area of a zone keeps ONE biome the whole way through —
  no breaks like Outskirts (plains) dropping into a lava dungeon. Fix the theme→color/hazard mapping so a
  zone reads coherently start to finish.
- [ ] **Levels much LARGER + more intricate.** Kill the "cross it in ~20 seconds" problem (most levels are
  one interesting layout copy-pasted). Each explorable area should take **at least a few minutes** to fully
  navigate and stay interesting throughout — branching paths, verticality, loops, landmarks, varied
  navigation. Real content, not repetition.
- [ ] **Per-zone unique bestiary.** Each zone gets its OWN set of unique monsters (distinct attack styles,
  abilities, HP, behavior). Only SOME core mobs are reused, **sparingly**, and only where they fit the
  zone's theme; vary which/when core mobs reappear.
- [x] **Hub "Proving Grounds" — endless escalating grind zone** — SHIPPED v1.61.0 **as Endless Descent**
  (see Phase 11 item above; built once, both items done). All criteria met: hub entry, super-strong mobs,
  spawn rate ramps under hard caps, HP+dmg scale so it's useful at any level, fresh players die fast while
  veterans get deep but are always eventually outscaled. Original notes kept below for reference.
  <!-- ORIGINAL SPEC: distinct from Phase 12's stakes-free
  practice arena; may be a second mode of it). From the hub, for grinding XP + gold without replaying
  low-spawn old missions. All mobs SUPER strong; **spawn rate ramps exponentially** over time (hard caps
  to prevent overcrowding/crashes); mob HP + damage scale up so it stays useful at ANY level. A fresh
  player dies fast; a geared veteran lasts much longer but is ALWAYS eventually outscaled and overwhelmed.
  Reward XP/gold scaled to survival time.

---
### Conventions recap (every phase)
Single file `public/3d/index.html` · bump `VERSION3D` · `git push` · verify in browser ·
never break saves · main levels static (purple-secret trials procedural).

---

## Appendix A — Weapon Identity Overhaul (the Phase 8 detail)

Stay data-driven: extend the existing `ARCHES` / `MELEE` / `proj` tables and reuse the
`isChargeWeapon` (tap = base, hold = charge) pattern as the shared charge mechanic.

**Global rule — off-class disables specials:** every charge/hybrid/seek/pull below works ONLY
for the weapon's own class family. Off-class users get the plain base attack only (no charge,
no throw, no seek, no pull), on top of the existing `OFFCLASS_MUL` penalty. Class families:
warrior = sword/axe/hammer/greatsword; ranger = bow/crossbow/knives/javelin; mage =
staffs/wands/scepters; reaper = void scythe.

**WARRIOR**
- Sword: UNCHANGED (clean baseline).
- Axe: hybrid — tap = melee arc swing; hold = charge and HURL the axe (heavy phys projectile,
  pierces, RETURNS to the player). Warrior's melee+ranged option.
- Hammer: convert slam to HOLD-TO-CHARGE — release = radial AoE shockwave (slam shape) with
  knockback + brief stun; longer hold = bigger radius/damage (capped).
- Greatsword: hold to charge a spinning cleave (wide arc, big damage, big windup).
- Spear: REMOVE from ARCHES/MELEE + shop/drop pools; fold saved spears into javelin/sword.

**RANGER**
- Longbow: UNCHANGED (baseline).
- Crossbow: keep the 3-arrow spread; ADD close-range damage bonus (more per-pellet the nearer
  the target, falloff with distance) — the up-close shotgun.
- Throwing Knives: hybrid — target in melee reach → fast STAB (thrust, bonus dmg); else the
  rapid double-throw. Light & fast.
- Javelin: hybrid — tap = melee STAB (thrust, short reach); hold = charge a heavy ranged throw
  (slow fire rate, heavy single-target, pierces, arcs). The heavy lancer.

**MAGE — three archetypes by art**
- STAFF (firestaff, plaguestaff): tap = small elemental shot; hold = charge a LARGER projectile
  (bigger size, damage scaled to charge). Slow, heavy, high burst.
- WAND (frostwand, stormrod): RAPID-FIRE — fast, small thin projectiles, low per-hit, NO charge.
  Sustained-DPS / kiting caster.
- SCEPTER (arcaneorb/Demon Eye, holyscepter): projectiles SEEK (home toward nearest enemy) and
  pierce; keep/boost status. NO charge. Tactical smart-missiles.
- Style every caster projectile to its element (fire=fireball, frost=shard, storm=bolt/spark,
  poison=glob, arcane=orb, holy=light, void=dark).

**REAPER**
- Void Scythe (voidscythe): swing PULLS nearby enemies inward (gravity yank) to cluster them,
  then reaps; kills RESTORE HP (harvest, on top of lifesteal).
- Availability: SHOP-PURCHASE ONLY, and only appears in the shop AFTER the Reaper is unlocked
  (remove from drop pools). On Reaper unlock (trial completed), show a pop-up/toast: "The Void
  Scythe is now available in the Shop."
- Reaper trial: make it SIGNIFICANTLY HARDER than the warrior/ranger/mage trials (currently
  trivial) — more/tougher enemies, a real fight.

## Appendix B — Loot juice + drop-rate + mixed encounters + NPC dialogue (Phase 8 detail)

**1) Rarity-scaled loot drop juice.** Today `rollDrop(e)` pushes items to `G.pickups` with a
`bob` and a uniform `SFX.pickup()` bell — a legendary drops like a common. Make rarity an
escalating EVENT across RARITY/RORDER tiers:
- Audio: rarity-tiered drop/pickup sounds (reuse tone()/noise()) — common = soft bell, each
  tier richer, legendary = a full triumphant fanfare. Obvious BY EAR which rarity dropped.
- Visual: on drop, a rarity-COLORED light beam/pillar (taller/brighter per tier) + a `burst()`;
  rare+ adds `G.shake`; legendary adds a bigger beam, a ring shockwave, sparkles, and a brief
  slow-mo if feasible. The grounded pickup stays rarity-glow-coded so you SEE it across the room.
- Announce rare+ with a rarity-colored `toast()` ("✦ LEGENDARY — Abyss Blade"); keep
  common/uncommon silent so the good ones stand out.

**2) Fewer, more meaningful drops.** Non-boss armor drop is `Math.random()<0.45` — carpets the
floor. Lower base drop frequency (try ~0.20, tune by feel) so each drop is earned. Do NOT change
hunt length or spawn counts. Bosses/elites keep boosted drops.

**3) Mixed-composition encounters.** When spawning groups (incl. spawner-nest dens), salt in 1–2
complementary enemy types (a ranged/kiter beside the melee mob, etc.) so no two fights feel
identical. Keep the kill-quest mob as the majority.

**4) Press E to talk to NPCs.** In-range NPC (hub especially) → show a floating "Press E" prompt
(on mobile, an on-screen INTERACT button that only appears in range). Pressing E / the button
opens the NPC's dialogue (reuse storycard/storyToast); each hub NPC explains who they are and
what they do, in BLADEFALL's grim/terse voice. Wire E into the existing key handling
(WASD/Space/J/K/L/Esc) with no conflicts.

## Phase 15 — Pets / Companions (SHIPPED v1.63.0)
- [x] **Pet / companion system** — a new hub NPC, the **Beastkeeper**, sells / buys-back / trains
  companions. **ONE active pet at a time**, equipped/swapped **only in the hub** (it's a hub NPC,
  so it can't change mid-run). Pets **carry across levels like gear** and persist per save-slot.
  - **Roster (6, started small):** Ember Pup + Stone Whelp (melee attacker, common), Pale Wisp
    (homing ranged attacker, uncommon), **Mending Sprite** (passive healer — Oliver's requested
    type, uncommon), Coin Sprite (loot-vacuum utility, rare), Grave Wraith (stronger ranged, rare).
    Each has a distinct voxel silhouette, rarity glow, a name + flavor line; price scales with strength.
  - **Balance — help, never carry:** attackers do chip damage on a slow cadence (~1.5–2.3s), homing
    bolts / melee darts, damage scaled mildly by player level and by a **capped** training curve
    (+5%/level, 5 levels). Healer trickles a few HP every ~3.4s. Utility pulls nearby drops. Pets deal
    **plain damage** (no elemental status, so no stack-spam exploit).
  - **UI:** name your pet (text input), toggle a floating rarity-colored name label on/off, train
    (diminishing gold sink `base*1.7^lvl`, capped), buy/sell/equip/stow — all at the Beastkeeper.
  - **Save:** new `meta.petOwned / petActive / petNames / petTrain / petLabel` behind the load/migrate
    path; **old saves (no pet fields) load clean** to empty-menagerie defaults.
  - **Hitless decision:** in Hitless the pet still **follows** (cosmetic — you earned it) but does
    **not** attack or heal, so the earned no-hit mode stays pure player skill.
  - **Perf:** enemy scans happen only on the pet's attack cadence, one pooled DOM label node, no
    per-frame allocation.
  - Verified in-browser: buy/equip (one-at-a-time)/sell/train/rename/label-toggle; attacker chip
    (~5 hits/10s) + healer trickle (+4/pulse); persistence round-trip + old-save load + Hitless gate
    (0 pet damage); no console errors. Live at `/3d/`.

## Phase 16 — Weapon / Damage / Element / Affinity / Status Overhaul (SHIPPED v1.64.0 + v1.65.0)
Shipped in two rollback-safe batches (structural first, then the status layer).

### Batch A — families + affinities + migrations (v1.64.0)
- [x] **Finalized weapon families** enforced in generation: Warrior=Sword/Greatsword/Battle Axe/Warhammer,
  Ranger=Throwing Knives/Longbow/Crossbow/Javelins, Mage=Staff/Wand/Spellblade, Reaper=Scythe.
  - **Daggers merged into Throwing Knives** (melee `dagger` arche retired; art `dagger` now = knives only).
  - **Saber retired** (→ sword) — not an active family.
  - **Scepters folded into Wand**: `arcaneorb`/`holyscepter` art→`wand` (unique names kept, e.g. "Demon Eye
    Scepter"); their homing moved to `proj.seek`.
  - **Spellblade formalized as a Mage family**: `flameblade`/`frostbrand`/`runeblade` art→`spellblade`
    (magic melee), removed from Warrior. Renders on the sword model fallback (no new art).
  - **Scythe stays Reaper-exclusive.**
- [x] **Damage type (physical/magic = `sch`) now cleanly separate from affinity (`el`)** in tooltips
  (Family · Class · Physical/Magic · affinity icon+name · status).
- [x] **6 affinities in locked opposition pairs**: Fire↔Frost, Poison↔Arcane, Holy↔Void. Removed the old
  Void flat-1.15 special case. **Storm retired → Arcane** (weapons + sparkling/galewisp enemies + canyon
  caster); survives only as a migration alias (`EL_ALIAS`).
- [x] **Save migration**: `LEGACY_ARCHE` saber→sword, dagger→knives; `LEGACY_ART` scepter/orb/rod→wand;
  `normWeapon` re-derives art/class/damage-type + normalizes affinity — old items migrate, never deleted.
  Verified: every legacy identifier resolves to a finalized family/affinity.

### Batch B — six-status stack system + Scythe specialization (v1.65.0)
- [x] **Unified per-enemy status meters** (float meters, integer stacks), adapting the old burn/slow:
  Fire→**Burn** (DoT, max=Ignite burst+splash), Frost→**Chill** (−10% move/stack, max freezes normals with
  a 3s freeze-immunity; bosses deep-slow+stagger, never full-freeze), Poison→**Venom** (DoT, ≥3 halves enemy
  healing), Arcane→**Rune Marks** (setup, consumed by designated attacks for mark-scaled burst),
  Holy→**Radiance** (max purifies + Exposed +25% Holy; on-kill heal mote with 1s cooldown), Void→**Corruption**
  (max primes → Reaper/charged-scythe/void attack Ruptures for burst + heal).
- [x] **Scythe specialization**: buildup normalized by attack speed × a 2.2 Scythe multiplier → Reaper is the
  best stack-applier without the highest direct damage (measured scythe ~5.5 buildup/s vs sword/wand ~2.5).
- [x] **Safeguards**: per-(enemy,status) 0.12s buildup cooldown stops persistent/rapid multi-hits from stacking
  every frame; bosses build at half rate; no infinite heal/CC loops. Pooled phone-readable stack pips on the
  existing HP-bar overlay; no per-frame allocation.
- [x] Verified in-browser: family generation, migrations, opposition pairs, all six payoffs, boss no-freeze,
  DoT ticks, statusless-enemy safety, no console errors.

**Deferred (future, clearly separated):** the full 6-affinity + Physical Scythe roster (Gravehook/Cinder
Reaper/Hoarfang/Pestilent Harvester/Runic Crescent/Dawn Reaper) is design-referenced only — not added this
pass (system supports them; only Scythe + Void Scythe ship today). Distinct per-Scythe silhouettes would be
a new-art task.

## Phase 17 — Zone Identity Overhaul: ALL remaining levels (SHIPPED v1.66.0 → v1.71.0)
Executed from `docs/ZONE_OVERHAUL_PROMPT.md` in six ship-per-batch deploys; every batch
BFS-verified in-browser (portal + every quest objective/den/fetch/find/secret/chest
reachable) before pushing, with regression sweeps of all prior zones each time.

- [x] **v1.66.0 — FROSTFELL** rebuilt to the Hollow Pass bar: Shorefall Camp (frozen dead
  Wardens) → the Frozen Lake **fork** (drifting floe-line vs the shore road, looped by a
  ridge island) → Icefall terraces → **THE CRYSTAL GALLERY** (enclosed ice-cave hall — banded
  walls, roof-slab light slits, glowing crystals, a pinned rime-caster; the Glacier Vault
  hides through a wall gap) → Frostwatch Summit: cairn + portal under a 3-band **aurora**.
  PLUS the new **boss-arena system** (`bossFinish` + `BOSS_ARENAS` dispatch; portals open on
  the boss's death) with all five late arenas: Sorcerer's Cracked Ring, Colossus's Crucible,
  King's Throne Ring, Marble Colossus's Rotunda, Tyrant's Summit of Duskmoor.
- [x] **v1.67.0 — EMBERDEEP**: caldera descent — Rim under a banded **magma-fall** (Magma Core
  rift hidden BEHIND the falls) → switchback causeways → **fork**: the Vent Gauntlet (three
  chambers breathing Emberfall fire) vs the Spire Climb (six basalt pillar-hops) → the Black
  Bridge past the **Collapsed Titan** → Ash Sanctum (altar find, monolith ring) → Furnace Gate.
- [x] **v1.68.0 — THE ABYSS**: floating shards — Last Shore → Shatter Field **fork** (phasing
  causeway vs the elevated **drift path** across three swaying islands) → the **INVERTED RUIN**
  (arch, hanging tower, chains into the void) → Anchor Spire (Rift Anchor find on its crown)
  → the King's Door. Five splinter satellites, each one brave jump off the route.
- [x] **v1.69.0 — SUNSPIRE PALACE**: ceremonial axis — Sun Court (gold-rimmed reflecting
  pools, twin colossi) → Processional colonnade with **god-ray light shafts** + hanging-garden
  planters → the one broken symmetry: intact West Gallery (chest) vs the **CORRUPTED EAST
  WING** (crumbling checkerboard over the fall; Sealed Reliquary + second chest at the dead
  end) → Grand Stair → Throne Antechamber.
- [x] **v1.70.0 — CASTLE DUSKMOOR**: the siege ascent — THE BREACH → Courtyard War → **fork**:
  the crenellated Rampart Run above vs the murder-hole road below → the **BROKEN TOWER**
  spiral (8 hanging steps, 390 up) → the Last Bridge (two swaying spans) → the Keep Door:
  throne, burning windows, the void banded across the sky.
- [x] **v1.71.0 — early arenas + polish + sweep**: Brute's Trampled Field, Marksman's
  Shooting Gallery, Warden's Yard (every boss now on a custom set-piece); Outskirts gains
  the Waystone **henge**/pond/fallen-log walk/scarecrow; Keep gains gargoyles/banners/chapel
  ruin/rubble; full-game sweep — **24 layouts, zero failures**, sides + trials intact.

All within perf budget (deco ≤ ~90/zone vs Hollow's bar; combat on y=0 per engine rules;
solvability by construction with JMPV/JMPH). Future (separated): side-zone interior identity
pass; unique boss-fight MECHANICS per arena (geometry shipped, behaviors unchanged).

## Phase 18 — Risk/Reward: Mimic Chests + Shop Gamble (SHIPPED v1.72.0 → v1.74.0)
Executed from `docs/RISK_REWARD_PROMPT.md` in three rollback-safe deploys.

- [x] **v1.72.0 — Charger restyle (mimic precondition).** The base charger was a squat
  brown-gold box with a bright top strip — nearly the chest's silhouette + palette. Rebuilt
  as a rust-red (#a84a2a) siege beetle: tucked abdomen + wedge thorax, dark carapace saddle,
  two-segment ram horn, twitching antennae, six skittering legs; the wind-up now REARS UP
  with a pulsing body-glow over the existing red ground telegraph. Chests own their look again.
- [x] **v1.73.0 — Mimic chests.** ~1 in 6 chests (MIMIC_RATE=0.17, one constant) are lying —
  decided AT SPAWN from the level's seeded rnd, so the same chest is the mimic across reloads
  of the same run (the seed is the save: no new fields; resolved mimics regenerate exactly as
  chests regenerate closed — existing behavior; bonus-vault chest exempt). Reach for it and it
  SNAPS into a chest-skull monster (lid agape on fangs, tongue, gold eyes, spider legs) with
  charger lunge AI at ~3.9x HP / ~1.8x damage vs the zone's own mobs — it can kill an unready
  player. The risk pays: TWO elite-band drops + 150+tier*50 gold (vs a chest's one band-0 roll
  + 70g). Fair-ish tell up close: the lid breathes, a rare shudder, the lock burns warmer.
  Verified: rate 0.166/6k, deterministic across attempts, hoard +533g/+2 drops at tier 7.
- [x] **v1.74.0 — Shop Gamble ("Fortune's Bag").** 480g a pull (~8x a common shop buy). Odds
  junk-heavy by design: 52/30/13/4.2/0.8 (EV ~280g of shop value — the house wins), with a
  real-but-thin tail vs the natural table. forgeSpin-style ratcheting reel reveal (triumph
  audio on rare+, a thud on junk, slowmo toast on epic+); gold up front; item to the BAG via
  the forge-payout pattern; above-level rarities sit locked (canWield gates equip, not owning).
  Verified through the real UI incl. a 40k-roll odds sim matching the table exactly.

Tuning knobs left for Oliver (single constants): MIMIC_RATE (0.17), mimic base stats
(ENEMY.mimic 70hp/16dmg), hoard formula (150+tier*50, 2x bandedRarity(1)), GAMBLE_COST (480),
GAMBLE_ODDS table.

## Phase 19 — Oliver's playtest feedback batch (SHIPPED v1.75.0 → v1.77.0)
- [x] **v1.75.0 — Hero always visible (the Hollow spawn bug, root-caused TWICE over):** the occlusion
  ray started at `G.cam`, the smoothed follow-point AT the hero — a near-zero-length ray — so deco
  (canyon strata bands etc.) never faded. Every camera now stores its TRUE eye (`G.eye`); the wall
  LATE pass + a new 3D `occRay` (XZ + height band) cast from it; crossing deco goes ghost; obstacle
  fade threshold 90→40; fps exempt by design. Proven by manual `render()` driving (the test pane
  throttles RAF): crossers === ghosted in shoulder/buried/overhead at the exact reported spot.
  PLUS: Abyssal Descent scales much faster (hp ×1.16^n, dmg ×1.10^n, NEW speed ×1+0.025n, waves
  8+3n, cap→28, denser elites, rewards ×1+0.14n); damage numbers 19px / CRIT 32px golden shout
  (crit threaded through sweeps, finishers, projectiles) / heals 22px ♥ + ring on pet heals, with a
  Settings toggle; overhead cam: left-click anywhere = attack, right-click = dodge.
- [x] **v1.76.0 — a real mirror + pets that look like themselves:** mirror goes phantom when orbited
  behind; from the front a true REFLECTION (double beyond smoked glass, reflection-first draw
  order); lingering talk-prompt hidden; clickable top-left "ESC — leave" chip; RENAME your character
  (18 chars, `meta.heroName` per-slot); stats+loadout as a pull-down. All six pets rebuilt to match
  their descriptions (pup with wagging tail + ember mouth, cairn-backed whelp, tapering flame wisp,
  winged sprite with its cross, fat grinning coin with winglets, hooded wraith with chain).
- [x] **v1.77.0 — the Waystation reborn:** a fortress QUARTER — plaza with waystone pool/lanterns/
  paths + five themed wings (Market Garden, Forge Yard, walled Sparring Arena, Menagerie Nook,
  Mirror Pavilion) + the Dark Grotto for the Abyss stone; 2000×1270 bounds. Arena confines practice
  mobs (post-movement clamp; 0 XP/gold/drops), dummies = bolted 400hp skeleton sponges that reset
  (dps checker). SECRET STASH behind the Menagerie crates: E → +1000g with rotating cheeky lines.
  New trial-chamber music: 'Silent Descent' (Mixkit Free License). Full 24-layout regression GREEN.

## Phase 20 — Full-game playtest work order (SHIPPED v1.79.0 → v1.86.0)
One session from `docs/MASTER_UPDATE_2026-07-18.md`, shipped batch by batch (each verified in a real browser, VERSION3D bumped, pushed, confirmed live).

- [x] **Batch 0 (verify-only):** mimic takes damage + pet follows into runs — both already correct (lazy-spawn), no change.
- [x] **Batch 1 — v1.79.0 — New Game+ removed:** stripped the dead NG+ plumbing (HUD suffix, beginRun writes, luck term, mentions); kept `ngHp`/`ngDmg` as the generic enemy scalars. Re-gated the celestial 'ascended' achievement from "Reach NG+3" to the Abyssal Descent (later re-tuned to Floor 12 in Batch 3). Old saves with `meta.ngPlus>0` load clean.
- [x] **Batch 2 — v1.82.0 — unique bestiary for zones 4-8:** 10 new mobs, 2 per zone, each a distinct silhouette + one readable behavior + a role. Frostfell: frostshell (ice shell blocks frontal hits until chill/shatter cracks it) + frostlobber (arcing Chill shards). Emberdeep: magmaskit (burning trail patches, new `G.trails`) + embertotem (stationary vent, periodic fire ring). The Abyss: blinkstalker (telegraphed teleport behind you) + voidtether (wards nearby allies until it dies). Sunspire Palace: marblestatue (heavy marble shielder) + sunpriest (radiance healer-caster). Castle Duskmoor: siegeknight (shield + telegraphed overhead crush) + royalarcanist (arcane volleys). Wired into THEMEMOBS + each zone's kill-quest retargeted to a signature mob.
- [x] **Batch 3 — v1.83.0 — Abyssal Descent much harder + spice:** floor 1 is now a real fight (target ~13, batch 2, 0.8s interval, spawns bias toward the player as you fall); kept the steep hp/dmg curves + added caster attack-speed scaling (capped so telegraphs stay readable). Elite chance scales with floor; every 7th floor is ALL-ELITE; every 6th is a mimic HOARD. Boon/bane SHRINES every 5th floor — choose 1 of 2 random pacts, each a boon WITH a bane; they stack, persist the rest of the descent, show as HUD chips, reset on death (7 data-driven pacts through central `eff*` multipliers). Ascended gate re-tuned to Floor 12.
- [x] **Batch 4 — v1.84.0 — boss signature mechanics:** Ember Colossus (Crucible) marching quake rings; Marble Colossus (Rotunda) sweeping radiant light beam with pillar line-of-sight cover; Frost Sorcerer (Cracked Ring) blinks between pillars; Abyss King / Void Tyrant summon capped shades at phase 2; Void Tyrant (Summit) telegraphed collapsing floor tiles. New shockwave `delay` + `G.beam` + `G.collapse` systems.
- [x] **Batch 5 — v1.85.0 — Treasure Sprint overhaul:** rebuilt from 9 flat stage-seeded hops into a 12-platform VERTICAL course — true randomization (runSeed ^ stageIndex ^ per-visit counter), a ground dash-gauntlet, an ascending spiral tower (with a vertical-bob mover you ride up), and a drop-down to the chest. Physics-derived dash-gaps (170-205u, jump + mid-air dash; air-dash confirmed not ground-gated), normal gaps <=140, never two dash-gaps in a row. Timer computed from course length (~20-21s). Checkpoints on the tower so a fall resets to the last shelf. Geometric solvability harness: 0 fails across 30+ seeds.
- [x] **Batch 6 — v1.86.0 — small fixes:** Endless stage banner shows "FLOOR n" instead of the fake "ZONE 12/8"; corpse culling (dead non-boss enemies are spliced each frame so they can't pile up over a long Descent); death-screen button label is contextual ("Choose your class" when a class-less death routes to class select, else "Return to Hub").

Deliberately deferred: the three early bosses (Brute/Marksman/Warden) already have distinct signatures (slam/cleave/aimed volleys), so no lighter-version pass was needed. A full human-input traversal of the Treasure Sprint tower wasn't auto-verified (a naive autopilot can't ride the vertical mover) — solvability is proven geometrically instead.

## [Codex | 2026-07-18] Menu navigation icon handoff (SHIPPED v1.95.0)

- [x] Continued from Claude's clean v1.94.0 checkpoint after its usage cutoff; no partial game-file edit or generated asset needed reconciliation.
- [x] Sliced the supplied 10-icon voxel sheet into transparent, caption-free 256px assets: Resume, Pause, Settings, Sound On/Off, Music, Fullscreen, Back, Title/Leave, and Character Sheet.
- [x] Wired the icons into the title menu, HUD pause control, pause menu, audio settings, character entry, fullscreen, leave actions, and recurring Back controls while retaining clear text labels and existing behavior.
- [x] Sound Effects switches between the on/off artwork at 0%; browser-tested at 1920px desktop and 390px mobile with no clipping or lost hit targets; inline JavaScript syntax and `git diff --check` pass.

## [Codex | 2026-07-18] True pause audio freeze (SHIPPED v1.96.0)

- [x] Pause now suspends the Web Audio context, freezing procedural combat sounds, sourced weapon swings, and looped effects at the same instant as simulation state.
- [x] Streamed music and active stings pause at their current playback positions; Resume restores them, while leaving for the Hub/title discards obsolete combat audio.
- [x] Audio-setting interactions remain silent while paused, including the edge case where the audio context is first created from the pause menu.
- [x] Real-browser verification: context transitioned `running → suspended → running`; `G.time` remained bit-for-bit unchanged across multiple paused seconds; inline JavaScript syntax and `git diff --check` pass.

## [Codex | 2026-07-18] Status-effect + rarity icon set (SHIPPED v1.97.0)

- [x] Identified the correct 11 downloaded files and preserved the unrelated five armor-piece downloads; removed their baked checkerboards and normalized each requested emblem to a transparent 256×256 PNG.
- [x] Added Burn, Chill, Venom, Rune Mark, Radiance, and Corruption icons to affinity/status descriptions and the in-world enemy status-stack renderer.
- [x] Added Common, Uncommon, Rare, Epic, and Legendary icons to the shared rarity badge helper, automatically covering item rows, pickup comparisons, gear details, and the test bench.
- [x] Real-browser verification confirmed the rarity emblem renders at menu scale and all six status images preload for the canvas overlay; inline JavaScript syntax and `git diff --check` pass.

## [Codex | 2026-07-18] Equipment-slot icon set (SHIPPED v1.98.0)

- [x] Mapped the five downloaded files in the supplied order to Helmet, Chestplate, Leggings, Amulet, and Ring; removed baked checkerboards and normalized them to transparent 256×256 PNGs.
- [x] Added one shared `slotIcon()` helper and wired it into the Gear screen, bag category headings, armor/trinket pickup comparisons, and mirror/loadout panel.
- [x] Expanded the Gear slot label column for a readable 34px emblem while keeping the existing item information and hit targets intact.
- [x] Real-browser verification passed at desktop and 390×844 mobile widths with all five icons visible, correctly ordered, and unclipped; inline JavaScript syntax and `git diff --check` pass.

## [Codex | 2026-07-18] Event + reward icon set (SHIPPED v1.99.0)

- [x] Mapped the ten-file 2:57 PM download batch in the supplied order; preserved the separate 3:01 PM batch; removed baked checkerboards and normalized all artwork to transparent 256×256 PNGs.
- [x] Added Treasure Chest, Mimic, Secret Rift, Boss Skull, Trophy, Quest Marker, Magic Socks, Bag Slots Pack, Level Up, and Achievement Badge icons through one shared `eventIcon()` helper.
- [x] Wired the set into chest/mimic/secret/quest/level/achievement notifications, the quest tracker, boss health display, Treasure Sprint timer, Victory and Achievements screens, HUD XP label, and Quartermaster upgrade rows.
- [x] Extended `toast()` with a safe optional icon node while retaining text-node rendering for all messages; real-browser HUD verification passed, all ten assets returned HTTP 200, and inline JavaScript syntax plus `git diff --check` pass.

## [Codex | 2026-07-18] Damage-type icon set (SHIPPED v1.100.0)

- [x] Mapped the preserved three-file 3:01 PM batch in the supplied order to Physical, Ranged, and Magic; removed baked checkerboards and normalized each to a transparent 256×256 PNG.
- [x] Added save-safe shared `damageTypeId()`, `damageTypeIcon()`, and `damageTypeHTML()` display helpers; combat calculations and stored weapon schemas are unchanged.
- [x] Damage presentation now consistently distinguishes magic weapons, ranged physical weapons, and melee physical weapons across bag rows, comparisons, pickup details, Gear, shop details, and mirror stats.
- [x] Real-browser verification passed with Rusty Sword → Physical, Longbow → Ranged, and Frost Wand → Magic; inline JavaScript syntax and `git diff --check` pass.

## [Codex | 2026-07-18] Soul Essence, key, and class emblems (SHIPPED v1.101.0)

- [x] Mapped the six-file 3:07 PM download batch to Soul Essence, Key, Warrior, Ranger, Mage, and Reaper; removed the baked checkerboards and normalized each to a transparent 256×256 PNG.
- [x] Replaced the HUD XP emblem with Soul Essence, added the current class emblem to the class-rank bar, and replaced Ancient Key text emoji in pickup, unlock, and rarity-unlock notifications.
- [x] Replaced the four class emoji identities throughout shared class presentation with the new voxel emblems, covering class selection, class tabs, save summaries, rank screens, trials, and Waystation displays.
- [x] Real-browser verification passed at 1440×900 and 390×844: all six assets returned HTTP 200, HUD icons stayed inside their labels, all four class tabs rendered without horizontal overflow, no browser errors occurred, and `git diff --check` passed.

## [Codex | 2026-07-18] Warrior + Ranger skill icon batch (SHIPPED v1.102.0)

- [x] Mapped the eight-file 3:11 PM download batch in supplied order to Cleave, Shockwave Stomp, Charge, Berserk, Deadeye, Volley, Tumble, and Hunter's Mark; removed baked checkerboards and normalized each to a transparent 256×256 PNG.
- [x] Replaced the eight legacy skill emojis across the class tree and combat skill buttons, retaining numeric cooldowns and lock states over the artwork.
- [x] Wired Volley, Piercing Shot/Deadeye, Tumble, and Hunter's Mark artwork into Ranger's current rank-choice engine and its live HUD; skill-choice cards now show the matching voxel emblem too.
- [x] Fixed class-unlock and class-switch toasts to pass the recently added class artwork as an icon rather than rendering its trusted HTML helper as literal text.
- [x] Real-browser verification passed at 1440×900 and 390×844: all eight assets returned HTTP 200, every Warrior icon and the matching active Ranger icons rendered in 50px combat buttons, class-tree icons stayed readable without horizontal overflow, no browser errors occurred, and `git diff --check` passed.

## [Codex | 2026-07-18] Mage + Reaper skill icon batch (SHIPPED v1.103.0)

- [x] Double-checked the twelve-file 3:24–3:25 PM download batch visually and mapped it in supplied order to Elemental Bolt, Nova, Blink, Arcane Tempest, Reap, Soul Cleave, Wraith Form, Void Pull, Soul Siphon, Gravebind, Shadow Step, and Death Vortex.
- [x] Removed baked checkerboards, normalized the art to transparent 256×256 PNGs, and honored the requested underscore filenames; the newer Wraith Form and Death Vortex files are the retained replacement versions.
- [x] Replaced all four live Mage skill emojis. Reap and Shadowstep use their exact matching art, while the current life-draining Soul Harvest uses Soul Siphon artwork because its implemented damage-and-heal behavior matches that concept.
- [x] Bundled Soul Cleave, Wraith Form, Void Pull, Gravebind, and Death Vortex for the planned expanded Reaper kit without incorrectly assigning them to unrelated current mechanics; in particular, Death Vortex remains distinct from pulling behavior.
- [x] Real-browser verification passed: all twelve PNGs returned HTTP 200, the seven live mappings resolved to their intended icon classes, the full contact sheet was visually checked, no browser errors occurred, and `git diff --check` passed.

## [Codex | 2026-07-18] Missing Warrior, Ranger, and Mage skill icons (SHIPPED v1.104.0)

- [x] Distinguished the requested twelve-image 3:32 PM class-skill batch from the separate ten-image 3:36 PM item/UI batch, then visually confirmed the supplied Warrior → Ranger → Mage ordering.
- [x] Removed baked checkerboards, normalized all twelve images to transparent 256×256 PNGs, and saved them under the exact requested underscore filenames.
- [x] Wired the four mechanically matching concepts into current skills: Iron Guard artwork on Guardian Bulwark, Snare Trap on Spike Trap, Camouflage on Smoke Bomb, and Rune Barrier on Wizard Barrier.
- [x] Bundled Shield Bash, Whirlwind, Execution, Quickshot, Rapid Fire, Elemental Beam, Gravity Well, and Elemental Overload for their planned class-kit skills without misassigning them to unrelated current abilities.
- [x] Real-browser verification passed: all twelve assets returned HTTP 200, the four live mappings resolved correctly, the normalized contact sheet was visually checked, no browser errors occurred, and `git diff --check` passed.

## [Codex | 2026-07-18] Item-action icon set (SHIPPED v1.105.0)

- [x] Visually confirmed the separate ten-image 3:36 PM batch in supplied order as Equip, Sell, Bag/Stash, Buy, Forge/Fuse, Fortune's Bag/Gamble, Respec, Compare, Auto-sell/Auto-bag, and Sort.
- [x] Removed baked checkerboards, normalized all ten icons to transparent 256×256 PNGs, and added a shared `actionIcon()` presentation helper.
- [x] Wired the action artwork into loot decisions, bag equip/sell/sort rows, hub bag and forge controls, forge actions, Fortune's Bag, class equip/respec, shop purchase and compare affordances, and combat auto-sell/auto-bag toggles.
- [x] Real-browser verification passed: every PNG returned HTTP 200, all ten CSS classes and UI references resolved, the normalized contact sheet was visually checked, no browser errors occurred, and `git diff --check` passed.

## [Codex | 2026-07-18] Canonical All Stats icon panel (SHIPPED v1.106.0)

- [x] Audited the newest download batch and found ten new stat images rather than eleven: the missing artwork was Magic Damage. Visually mapped the remaining files without shifting their canonical order.
- [x] Removed baked checkerboards and normalized Max HP, Damage/Power, Attack Speed, Move Speed, Critical Chance, Lifesteal, Defense, Dodge Cooldown, Skill Cooldown Reduction, and Gold Find to transparent 256×256 PNGs.
- [x] Reused Bladefall's existing Magic Damage emblem for the missing eleventh slot and added one shared `statIcon()` presentation helper for the full set.
- [x] Corrected All Stats to always render all eleven canonical rows in the supplied order, including zero-value Magic Damage and Skill Cooldown Reduction rows that were previously hidden.
- [x] Real-browser verification passed: all eleven displayed assets returned HTTP 200, every label/icon mapping resolved in canonical order, the completed panel was visually checked, no browser errors occurred, and `git diff --check` passed.

## [Codex | 2026-07-18] Weapon Compare icon replacement (SHIPPED v1.107.0)

- [x] Confirmed the newest 3:55 PM download as the improved comparison artwork: two weapon cards with explicit green upgrade and red downgrade arrows.
- [x] Removed the baked checkerboard, normalized the replacement to a transparent 256×256 PNG, and replaced only `action_compare.png`; all compare interactions and references remain unchanged.
- [x] Real-browser asset verification and `git diff --check` passed.

## [Codex | 2026-07-18] Hub bag equip synchronization fix (SHIPPED v1.108.0)

- [x] Fixed Pause → Bag equipment swaps at the Waystation updating only `meta.hero` while leaving the live `G.p` hub character on its previous weapon/gear.
- [x] Hub equips now copy the banked weapon and gear into the live player immediately, recompute armor/HP, persist normally, and remain correct after closing the bag or resuming play.
- [x] Verified the hub equip regression in a real browser and passed `git diff --check`.

## [Codex | 2026-07-18] Caster grip and equipped-weapon color fixes (SHIPPED v1.109.0)

- [x] Separated cosmetic edge-glow color from the weapon's base blade/material color, fixing neutral swords and axes incorrectly rendering as red on the live hub character while appearing correct in the Mirror.
- [x] Added dedicated held poses for staffs, legacy rods/scepters, wands, and orbs: long focuses stay upright ahead of a bent gripping arm, while compact focuses point outward instead of extending backward through the forearm.
- [x] Verified neutral melee color plus staff, scepter, and wand idle/attack poses in the real browser; `git diff --check` passed.

## [Codex | 2026-07-18] Mirror controls, live stats, and character naming (SHIPPED v1.110.0)

- [x] Release pointer lock immediately when entering the Mirror so the mouse is available for its controls without an extra click or Escape press.
- [x] Add a clear Mirror View dropdown with a dedicated All Live Stats & Loadout option covering the canonical eleven live stats and equipped gear.
- [x] Promote character renaming into a labeled Save Name control with Enter-key support and persistent save behavior.
- [x] Substitute the saved character name into player-specific story narration, with a lore-friendly fallback for unnamed saves.

## [Codex | 2026-07-18] Proximity-based Waystation title cards (SHIPPED v1.111.0)

- [x] Hide floating hub interactable title cards outside a 230-unit discovery radius instead of displaying every label across the Waystation at once.
- [x] Preserve the stronger highlighted state inside close interaction range and immediately hide stale highlights when the player walks away.

## [Codex | 2026-07-18] Camera snap-spike guard (SHIPPED v1.112.0)

- [x] Route desktop pointer-lock and mobile drag camera input through one finite, per-event angular guard so malformed or heavily coalesced deltas cannot abruptly whip the view.
- [x] Discard the first mouse delta after pointer-lock acquisition, which browsers can report from the stale pre-lock cursor position.
- [x] Preserve continuous fast turning and existing sensitivity settings without adding camera-follow latency.

## [Codex | 2026-07-18] Hub side-control cleanup and icon assignments (SHIPPED v1.113.0)

- [x] Hide Auto-sell and Auto-bag side controls while walking around the Waystation; restore both automatically in dungeon gameplay.
- [x] Define distinct, filename-ready icon assignments for all ten hub NPCs and activities without conflating Mirror, wardrobe, training, or descent concepts.

## [Codex | 2026-07-18] Pet Yard naming and Training Bestiary (SHIPPED v1.114.0)

- [x] Replace the unclear “Menagerie” name with the simpler “Pet Yard” in all player-facing Waystation text and current internal labels.
- [x] Expand the Sparring Post into Training & Bestiary: every zone-discovered regular enemy and boss has a separate Info action while spawning remains available.
- [x] Bestiary popups show a creature portrait emblem, base health/damage/speed, attack range, element, weakness, combat tell, and short lore entry.
- [x] Preserve stakes-free practice behavior, including no death penalty, XP, gold, or loot, and spawn bosses singly instead of in pairs.

## [Claude | 2026-07-18] Voxel-art Batch 2 — six base hub NPCs (SHIPPED v1.115.0)

- [x] Added shared `hubNpcModel(n,t)` helper — one distinct voxel model per approved NPC, no palette-swap reuse.
- [x] Quartermaster: gold diamond tabard, held ledger + gold key-ring, scroll backpack, white spiky hair (sharp/skeptical).
- [x] Keeper: white mask, layered purple/black robe + gold hem, shoulder mantle, scissors + draped cloth (elegant/eccentric).
- [x] Drillmaster: dark-red + gold cuirass, pauldrons, crossed arms, dark hair+beard, sheathed sword at the hip (stern).
- [x] Smith: now a real figure beside the forge — white hair+beard, orange scarf, leather apron, glowing ember gauntlet, hammer over the shoulder (warm/boisterous).
- [x] Beastkeeper: dreadlocks, gold circlet, fur mantle, tall golden crook, with a black panther at her side (glamorous/dangerous).
- [x] Warden's Shade base: mournful spectral knight-woman — tattered purple gown/cuirass, glowing visor, dissolving cloak fragments, silver sword point-down (replaces the old generic hooded box).
- No changes to AI, dialogue, quests, drops, IDs, or save schema. Parse-clean; drawWaystation + run/update pump verified error-free in-browser (WebGL screenshots time out headless).
- Next: Batch 3 pets, Batch 4 bosses, Batches 5-6 mobs. Shade zone variants (Batch 7) still pending art.

## [Claude | 2026-07-18] Voxel-art Batch 3 — six pets aligned to approved art (SHIPPED v1.116.0)

- [x] Ember Pup: charcoal body with glowing lava veins, TALL pointed ears (ember-lit), ember maw, gold collar-tag, flame tail (was floppy-eared plain pup).
- [x] Stone Whelp: layered plated stone back, small back horns, teal glowing eyes, gold collar-tag (eyes were warm/orange).
- [x] Pale Wisp: rebuilt as the hooded blue spirit-LANTERN it is in art + flavor ("lantern-light") — caged blue flame, finial, watching eyes, ghost-fire (was a generic flame taper).
- [x] Mending Sprite: now a green leaf-fairy — leaf cap, fairy ears, satchel + potion vial, a cupped healing spark (dropped the medical-cross reinterpretation).
- [x] Coin Sprite: rebuilt as a hooded coin-golem — blue eyes, coin-crescent staff, coin purse, orbiting coins (was a coin-with-a-face).
- [x] Grave Wraith: added the pale SKULL face + a swinging soul-censer + purple tendril wings (was a faceless hooded wisp with a chain).
- Palettes still driven by each pet's data body/accent; rarity aura + shadow + label logic untouched. No stat/AI/save changes. All six drawPet3 branches render error-free in-browser.

## [Claude | 2026-07-18] Voxel-art Batch 4 — eight bosses aligned to concept art (SHIPPED v1.117.0)

- [x] The Brute: red-iron plate, huge pauldrons, and the signature chiselled STONE SLAB greatsword over the shoulder.
- [x] The Fallen (type key 'warden'): now a tragic corrupted Bladeborn — black-and-gold plate, purple corruption fire off the sword shoulder, spiked gilt crown-helm, blade held point-DOWN.
- [x] Hollow Marksman (type key 'archer'): ornate GOLDEN recurve longbow, gilt breastplate/hood band, a full quiver sheaf.
- [x] Frost Sorcerer: wizard hat replaced with a jagged ICE-CRYSTAL crown; faceted crystal staff.
- [x] Ember Colossus + Marble Colossus split — they shared the 'colossus' key and rendered identically. Ember is now a basalt FURNACE SIEGE ENGINE (black rock, molten seams, furnace maw, shoulder smokestacks); Marble is a radiant white-and-gold PALACE GUARDIAN with column-shoulders, a glowing gold core, and a sunburst halo — never an ember recolor (branches on stage theme).
- [x] Abyss King: added long reaching clawed arms + a cloak dissolving into motes.
- [x] The Abyss King, Awakened (type key 'tyrant'): fully redesigned from the old eldritch tentacle-mass into the ASCENDED king — a black-hole void heart with an accretion ring, a radiant gold+void sun-crown, six floating blades orbiting, and purple lightning. Now visually related to the Abyss King and clearly surpasses every other boss.
- Hitboxes (r/h), AI, shot data, type keys, save/music compat all unchanged — visual only. hitFlash feedback preserved on the colossus split. All eight branches render error-free in-browser.

## [Claude | 2026-07-18] Voxel-art Batch 5 — core mobs aligned to concept art (SHIPPED v1.118.0)

- [x] Gave distinct `look` models to the seven core mobs that previously shared the generic recolored-brute / winged-blob fallback:
  - Grunt → helmeted footsoldier with sword + round wooden shield.
  - Emberling → flaming rock imp, fire-crowned head, dragging chain.
  - Frostling → low ice beast on all fours with crystal spines + glowing eyes + fangs.
  - Toxling → hunched swamp beast with a glowing poison belly-sac + mushroom back.
  - Shadeling → purple skeletal wraith, glowing ribs, reaching claws, tattering to nothing.
  - Sparkling → floating faceted arcane diamond with radiating crystal shards.
  - Flyer → fanged purple bat-demon with broad membrane wings.
- Bones, Slime, and the Treasure Goblin already had faithful distinct models (unchanged). Element/status/AI/stats/save untouched — visual only via a new `look` field. All ten core mobs render error-free in-browser.
- Note: the 21 zone-specific mobs (mob sheets 2-3) ALREADY have unique per-mob look models from the earlier bestiary work (jackal, spitter, boar, spore, sentinel, revenant, frostshell, lobber, skitter, totem, stalker, tether, priest, statue, knight, arcanist, mimic, wraith, caster, slimelet). Batch 6 will spot-check those against the concept sheets rather than rebuild.

## [Claude | 2026-07-18] Design Studio — in-game review turntable for every voxel model (SHIPPED v1.119.0)

- [x] New Pause → Character → "🎨 Design Studio": a turntable (reuses the Weapon Studio pedestal/camera) that spins any approved model on a plinth, with a grouped picker (Cast / Pets / Bosses / Mobs), Prev/Next, and a Spin toggle.
- [x] Covers all 50 in-world designs: 6 hub NPCs (incl. the Warden's Shade, whose body was factored into reusable `drawShadeModel`), 6 pets, 8 bosses (Ember + Marble Colossus shown separately via a temporary stage-theme override), and 31 mobs.
- [x] Per-group camera framing (pets close, bosses pulled back). No save/AI/balance impact — pure viewer. Exposed `openDesignStudio`/`designSet`/`DESIGNS` on `__BF3`. All 50 entries render error-free.

## [Claude | 2026-07-18] Folded Design Studio into the Weapon Studio QA page (SHIPPED v1.120.0)

- [x] Per Oliver: the standalone Design Studio button is gone; the Weapon Studio (Pause → Character → "🗡 Weapons & Designs") now has a category tab row — Weapons / Cast / Pets / Bosses / Mobs.
- [x] Weapons tab keeps the full weapon turntable (Swing/Auto/Spin). The four design tabs swap the same plinth to spin any NPC/pet/boss/mob model, with Prev/Next + Spin, reusing one QA surface.
- [x] Removed the dead buildDesignPanel/openDesignStudio-panel path; openDesignStudio is now a thin alias (opens the studio on a design category, used by __BF3 tooling). Verified all category switches render error-free.

## [Codex | 2026-07-19] v1.135.0 � desktop navigation, complete perks, and equipment/pet art
- Shipped wide desktop Pause layout (zero overlay scroll at 1600x900), centered Mirror stats, focused-input J/K/L protection, intentional NPC facing, and separate Main Levels / Trial Chambers Waystation navigation with player-facing Level numbering.
- Expanded permanent shop perks to all 11 live character stats, standardized ten ranks, added numerical rank-10 capstones and stat icons, enforced existing safety caps, and migrated/refunded legacy over-cap purchases.
- Integrated 31 approved weapon icons, 33 armor icons, and all 6 pet portraits into Bag/Shop/Forge/Pet Yard paths with legacy runtime-render fallbacks.
- Browser QA: WebGL compiled with the concurrent v1.134 lighting overhaul preserved; no console errors; name input, 11 perk rows, rank cap, +50% Arcana, legacy refund, asset HTTP responses, and pet natural dimensions verified.


## [Codex | 2026-07-19] v1.136.0 — Treasure Sprint modular parkour director
- Replaced the fixed dash/spiral/drop recipe with 11 authored section families, selecting 5–7 unique families per visit plus two treasure-tower finales.
- Added multi-band vertical routes, ascents/descents, recovery shelves, safe/fast forks, elevated spring chains, moving elevators, elevated crumbles, phasing platforms, checkpoints, and section-derived timers.
- Added recent-run opener avoidance and deterministic course telemetry (seed, family order, finale, peak, bands, budget).
- Real-browser muted QA: 20/20 samples had unique in-run families, 3+ elevation bands, 5–7 sections, and no consecutive repeated opener/finale pair; observed peak range 427–1351. Elevated pads, vertical mover carry, and phase on/off states verified in the active update loop. Console: 0 errors, 0 warnings.

## [Codex | 2026-07-19] v1.142.0 — selected-Warden title action
- Removed the direct Abyssal Descent shortcut from the title screen; the endless mode remains available from its in-world Waystation monument.
- Promoted ENTER THE ABYSS into the largest, animated primary title action.
- The primary action now identifies the selected save slot, Warden name, character level, and equipped class; corrected slot summaries to read the class from the selected mode save.
- Preserved and completed the queued gradient-sky/sun shader work already present in the game file.
- Real-browser muted QA covered populated/empty save summaries, title hierarchy, absent Descent shortcut, gameplay render, WebGL, and console health at 1600×900.

## [Codex | 2026-07-19] v1.145.0 — Hitless difficulty identity
- Renamed “Choose your risk” to “Choose Your Difficulty.”
- Replaced the reused Hitless trophy with a dedicated transparent 512px violet void-skull: horned obsidian crown, predatory fangs, third-eye rune, and purple energy fractures, deliberately more threatening than Hardcore.
- Added a restrained purple final-tier card treatment for Hitless while preserving locked/selected behavior.
- Real-browser muted QA at 1600×900: all three cards render, Hitless remains readable at UI scale, WebGL active, console 0 errors/warnings.

## [Codex | 2026-07-19] v1.146.0 — full-screen title reveal
- The entire opening title screen now responds to pointer/touch input; players no longer need to hit the prompt itself. Keyboard reveal remains supported.
- Replaced the bordered prompt pill with larger unboxed “CLICK ANYWHERE TO BEGIN” typography, using a warm text glow, breathing scale, and pulsing luminosity.
- Real-browser muted QA verified a pointer event in the upper corner reveals the menu, computed border/background are absent, WebGL remains active, and console reports no errors/warnings.

## [Codex | 2026-07-19] v1.147.0 — restrained torch lighting
- Reduced torch point-light energy to roughly one quarter of its previous peak and narrowed flicker amplitude, preventing stacked nearby torches from bleaching material colors.
- Shrunk additive flame halos from radius 22 to 10, reduced bloom opacity by 80%, and darkened emissive flame cores while preserving warm navigation readability.
- Real-browser muted QA in the 18-torch Waystation view verified local colors remain visible, flames still read clearly, WebGL stays active, and console reports no errors/warnings.

## [Codex | 2026-07-19] v1.148.0 — Pet Yard visual rebuild
- Replaced the generic item-row layout with a dedicated Pet Yard: large rarity-lit active-companion hero panel, full portrait, species/rarity identity, flavor text, role/stat badges, five-step training track, and grouped actions.
- Rebuilt owned and purchasable companions as spacious responsive cards with full unclipped names, readable combat roles and cadence, rarity accents, complete portraits, flavor, training progress, and aligned Equip/Sell/Buy controls.
- Centered incomplete collection rows, separated Name Tags/Back into a balanced footer, and confined overflow to the collection pane when needed.
- Real-browser muted QA at 1600×900 with all six pets owned and fully trained: 0 clipped names, balanced 3+2 collection, zero page scroll, all actions present, WebGL active, console 0 errors/warnings.

## [Codex | 2026-07-19] v1.149.0 - forward weapon carry poses
- Corrected the shared third-person hand transform so idle swords, daggers, axes, mauls, wands, orbs, staffs, rods, and scepters project their business end in front of the Warden instead of behind the body.
- Kept long casting implements on a readable forward/upward lean and preserved the established bow, scythe, first-person, and active attack-animation rigs.
- Real-browser muted QA covered sword, axe, greatblade, hammer, staff, rod/scepter-family, wand/orb-family, and bow states; all attack timers completed normally and player transforms remained finite.

## [Codex | 2026-07-19] v1.150.0 - Class Trainer respec skill trees
- Replaced the destructive one-click Respec flow with a dedicated full-screen RPG skill-tree builder featuring connected rank nodes, class-colored branches, selected alternatives, future-rank locks, innate roots, and capstone endpoints.
- Ranger now exposes all 16 rank 2-9 skill/passive options in one staged build screen; Warrior, Mage, and Reaper show both complete combat paths and every ability contained in each path.
- Respec choices are staged without changing saves or spending gold; one 300g charge applies only on final confirmation, while Back leaves the existing build untouched. Ranger's previously missing Respec entry now appears correctly.
- Muted real-browser QA at 1600x900 and 1366x768 verified no page scrolling, persistent footer actions, all four class trees, locked/selected states, free preview/back behavior, single-charge confirmation, and save-compatible class-state updates.

## [Codex | 2026-07-19] v1.151.0 - physical thrown-weapon handoff
- Charged javelins, battle axes, and scythes now visibly leave both third-person and first-person hands at release instead of remaining duplicated on the Warden.
- Returning axes and scythes stay absent until their matching projectile reaches the player; javelins ready a replacement after 0.36s so their thrown spear can remain visible in flight without blocking continued play.
- Added a dedicated full-length javelin projectile model (shaft, spearhead, and fletching) instead of reusing the small arrow mesh, and blocked ghost attacks during each empty-hand interval.
- Muted real-browser QA verified all three charge families, return-token synchronization, fixed javelin re-equip timing while its projectile remains airborne, first/third-person empty-hand rendering, and normal attack availability after recovery.

## [Codex | 2026-07-19] v1.152.0 - cinematic class rank-choice cards
- Rebuilt the rank-up skill/passive choice overlay as a wide, class-colored two-card comparison screen instead of two sparse text rows.
- Increased approved skill artwork from 30px inline marks to 112px illuminated emblems inside dedicated 132px portrait frames, with clearer names, roles, cooldowns, combat-bar slots, descriptions, and choice affordances.
- Added stronger hierarchy, class crest/rank framing, responsive hover depth, side-by-side desktop comparison, stacked compact layout below 820px, and J/K keyboard labels plus functional J/K selection.
- Muted real-browser QA at 1600x900 and 1366x768 verified skill and passive variants, exact icon sizing, two-card layout, zero overlay/page scrolling, and responsive fit.

## [Codex | 2026-07-19] v1.153.0 � Compact HUD + combat-earned mana
- Shipped the approved compact dark-fantasy HUD: prominent HP and mana bars, with character XP and class-rank XP balanced side-by-side in distinct cyan and violet/amber treatments.
- Added a save-safe 100-point mana system. Skill slots cost 20/30/40/50 mana; insufficient mana blocks use and is shown on the skill controls.
- Mana never regenerates from waiting. Ordinary weapon hits restore 4 mana and weapon kills restore an additional 12; skill/designated attacks and training targets cannot farm it.
- Verified in a real muted browser at 1600x900 and 1366x768, including skill spending, insufficient-mana blocking, hit/kill recovery, no idle regeneration, and old-save migration.

## [Codex | 2026-07-19] v1.154.0 - Hardcore difficulty identity
- Added a deep red background, border, glow, hover treatment, and title color to the Hardcore difficulty card while preserving Hitless as the more intense purple final tier.
- Verified the complete Normal / Hardcore / Hitless visual progression in a real muted browser at 1600x900.

## [Codex | 2026-07-19] v1.158.0 - Illustrated Wardrobe overhaul
- Rebuilt the Wardrobe as three spacious illustrated galleries for Capes, Trails, and Weapon Glows, with clear equipped, wear, remove, locked, and unlock-goal states.
- Generated, background-extracted, optimized, and integrated 14 distinct premium voxel cosmetic icons: five capes, five trails, and four weapon glows. Hitless Edge remains the visual apex with a white-violet skull-and-lightning treatment.
- Verified all assets load, equip/remove persists, locked rewards cannot be selected, and the complete menu needs no scrolling at 1600x900 or 1366x768 in a real muted browser.

## [Codex | 2026-07-19] v1.159.0 - Unified RPG menu design system
- Applied a forged Bladefall frame, semantic color themes, stronger typography and section hierarchy, ornamented controls, clearer selected/locked/disabled states, and consistent hover/focus feedback to every overlay menu.
- Preserved bespoke title, Mirror, and studio identities while normalizing Pause, Bag, Gear, Shop, Forge, Wardrobe, Achievements, Classes, Trainer, Quest Board, Pet Yard, Bestiary, Waystation, save/difficulty, Credits, and dialogs.
- Made Pause Resume a full-width primary action and confined long Shop and Waystation content to dedicated internal panes rather than scrolling the whole page.
- Verified representative menu families in a muted real browser at 1920x1080, 1600x900, and 1366x768 with no console errors or save/gameplay logic changes.

## [Codex | 2026-07-19] v1.160.0 - Illustrated class passive progression
- Generated and integrated 16 individual transparent voxel passive icons grounded in the real class definitions: two Warrior paths, ten Ranger innate/branch/capstone upgrades, two Mage paths, and two Reaper paths.
- Replaced generic passive diamonds and stars in rank-up choices and Drillmaster trees with readable, class-colored gameplay emblems; rank-10 legacy path upgrades intentionally retain the same learned path identity.
- Optimized all masters to 256px transparent PNGs (about 1.2 MB total) and verified every asset loads in its correct node at 1600x900 and 1366x768 with no console errors.

## [Codex | 2026-07-19] v1.161.0 - Bag equipment paper-doll
- Rebuilt Bag as a two-pane equipment screen: inventory on the left, current Warden and vertically aligned equipped slots on the right.
- Added a voxel paper-doll assembled from the actual equipped weapon, helmet, chestplate, and leggings art, plus correct weapon/armor/amulet/ring slot icons and names; Inspect Character opens the full 3D Mirror model.
- Removed bag item-name ellipsis and enabled clean multi-line wrapping. Verified six equipped slots, all art loads, a 74-item long-name stress test has zero clipped names, and 1600x900 / 1366x768 produce no console errors.

## [Codex | 2026-07-19] v1.162.0 - Companion stakes, presentation, and save safety
- Added vertically aware companion following, independent scalable pet HP, enemy/projectile damage against pets, and expedition-long pet defeat that clears only after returning to the Waystation. Each Pet Yard training rank now improves companion HP as well as its role stat.
- Shortened the thrown axe's outbound range and increased its flight speed so it visibly returns to the hand much faster.
- Added a polished right-edge Mirror control that independently hides or restores the character menu, leaving the full model unobstructed when desired.
- Made the sun world-relative with a slow orbit instead of pinning it to the camera, preserved all surviving trial gear on the transition into the Waystation, and replaced the Spore creature's mismatched sword-kill accent with a toxic collapse sound.
- Rewrote the opening setup in direct language: the Abyss King's corruption, the danger to humanity, Ian as the last fallen Bladeborn and humanity's former final hope, and the player's goal are now explicit.
- Generated and integrated twelve transparent illustrated skin emblems, used Knight as the global change-your-look icon, expanded the skin gallery, and refined the HUD's forged frame while preserving its side-by-side character/class progression and mana system.
- Verified transparent assets, skin layout, trial-gear banking, vertical pet catch-up, pet defeat persistence and hub revival, Mirror toggle behavior, syntax, and muted desktop presentation at 1600x900.

## [Codex | 2026-07-19] v1.166.0 - Achievement icon suite
- Generated and integrated 11 unique transparent voxel achievement emblems: First Blood, Boss Hunter, Veteran, Untouchable, Arsenal, Archmage, Deadeye, Slayer, Kingslayer, World's End, and Ascended.
- Rebuilt achievement cards around 76px artwork with locked grayscale treatment, compact lock badges, clearer typography, and responsive two-column presentation.
- QA: muted real Chromium at desktop viewport; verified 0/11 and 11/11 states, all image loads, menu scrolling, and zero console errors.


## [Codex | 2026-07-19] v1.167.0 - Organic mob loot economy
- Reduced ordinary enemy gear-drop chance from 16% to 5.3% and elite drop chance from guaranteed to 33%, including Abyssal Descent.
- Added a steeper organic rarity curve (~82.3% Common / 15.1% Uncommon / 2.4% Rare / 0.24% Epic in a 100k-roll baseline QA sample).
- Organic regular/elite kills are hard-capped at Epic and can never drop Legendary; bosses, chests, mimics, treasure goblins, and authored rewards retain their distinct reward tables.
- QA: muted real Chromium, v1.167.0 loaded, 100,000 organic rarity rolls produced zero Legendary results, zero console errors.


## [Codex | 2026-07-19] v1.169.0 - Per-skill mana balance
- Replaced slot-based 20/30/40/50 mana costs with individual 8-26 mana costs based on each ability's damage, cooldown, mobility, control, sustain, immunity, and encounter impact.
- Balanced every current Warrior, Ranger, Mage, and Reaper ability, all legacy alternate-path skills, and all eight Ranger v2 skill-tree choices.
- Added mana costs to skill-choice cards, class skill descriptions, combat tooltips, and both modern and legacy respec trees so tradeoffs are visible before committing a build.
- Reference principle: AQW-style cheap repeatable attacks, moderate control/sustain, premium major defenses and finishers, translated to Bladefall's 100-mana pool and regeneration model.
- QA: muted real Chromium; verified full cost matrix, Ranger tree labels, an actual Volley cast consuming exactly 11 mana and starting its 5s cooldown, and zero console errors.


## [Codex | 2026-07-19] v1.170.0 - Waystation label head clearance
- Raised every nearby Waystation NPC/station label above its visible head or prop silhouette instead of projecting from a low generic origin.
- Added prop-aware height anchors for boards, chests, mirrors, sparring posts, the Abyss monument, and the Beastkeeper; the Smith label now follows the Smith's actual offset position beside the anvil.
- Added extra screen-space clearance so labels do not visually cover faces, tools, or workstation art.
- QA: muted real Chromium at the Smith/Exchange cluster; verified label anchors and zero console errors.


## [Codex | 2026-07-19] v1.171.0 - Exact 10% mimic rule
- Set every eligible world chest to an exact 10% mimic chance; bonus sprint reward chests remain protected.
- QA: muted real Chromium verified 0.099 becomes a mimic, the 0.100 boundary does not, bonus chests never convert, and zero console errors.


## [Codex | 2026-07-20] v1.206.0 - Eight-zone navigation and combat-space pass
- Executed the locked level critique and design principles across all eight Main Levels and both campaign areas per zone: combat now lives on broad, stable, readable floors, while movers, phasing shards, crumbling runs, spirals, floes, aqueduct beams, and similar traversal tests are combat-free.
- Re-authored pacing around warmups, three escalating arena beats where appropriate, quiet traversal gaps, and protected pre-boss breathers. The only deliberate edge-combat set-pieces are Ruined Keep's widened Broken West Span and Castle Duskmoor's broad Last Bridge sanctuary.
- Strengthened golden-path readability and destinations: The Outskirts remains an open sunny meadow with a worn Sunward Trail, exactly three escalating dens, and a dramatically taller Old Waystone; The Abyss gained lit beacons, three large rimmed combat islands, and traversal-only drifting/anchor sequences.
- Expanded or clarified signature arenas and safe approaches throughout Hollow Pass, Ruined Keep, Frostfell, Emberdeep, The Sunspire Palace, and Castle Duskmoor without changing tutorial/class-trial difficulty or save data.
- QA: muted real Chromium generated and inspected all 16 campaign area variants. Every enemy is room-assigned, no traversal-hazard room retains enemies, required arena widths are generally 780-1140 units, and the browser reports zero console errors or warnings.

## [Codex | 2026-07-20] v1.207.0 - Outskirts macro-layout rebuild
- Replaced the preserved Outskirts room graph with a new 11-district branching valley: central Sunward Prairie, distant West Cornlands and Eastwood Orchard routes, a major Miller River crossing, North Bank combat commons, separate Riverside Hamlet and Windmill Rise skylines, the Dreaming Expanse, and a three-tier Old Waystone Crown.
- Increased the authored traversal network from 31 to 127 connected floor segments, roughly 3,400 units of lateral spread and 5,700 units of forward travel. Added a safe ford plus optional stepping-stone line, farm-loft and windmill climbs, an orchard canopy route, and the hidden Foxglove Copse.
- Kept exactly three escalating dens on broad safe floors. The river, orchard canopy, windmill climb, and side glade are traversal/exploration spaces without required combat.
- QA: muted real Chromium verified all 11 rooms, all 3 dens, 5 chests, 127 segments, no enemies in traversal-hazard districts, and zero console errors or warnings.

## [Codex | 2026-07-20] Plan A voxel-detail foundation + vertical slice - shipped v1.215.0

- Added semantic material registry, reusable instanced voxel assemblies, deterministic variation, three-distance LOD, and live geometry/draw-call metrics.
- Rebuilt shared torches, chests/mimics, and portals through the assembly pipeline.
- Upgraded the Knight, Rusty Sword, Coin Sprite, Quartermaster, Thornboar, Abyss Brute, and an Outskirts farmhouse as the first end-to-end production slice.
- Kept collision/gameplay/save structures unchanged; muted browser QA passed with no console errors.

## [Codex | 2026-07-20] Armor rarity icon families - shipped v1.216.0

- Added 25 transparent voxel equipment icons: helmet, chestplate, leggings, amulet, and ring across Common, Uncommon, Rare, Epic, and Legendary rarities.
- Established a consistent visual progression from plain gray steel through green, blue, and purple trim to elaborate gold Legendary equipment.
- Keyed equipment artwork only to slot and rarity, so stat affixes retain their gameplay identity without producing inconsistent item thumbnails.
- Wired the new artwork through the shared item-avatar resolver so inventory, equipped gear, loot, shops, comparisons, and reward displays use the same canonical icons.

## [Codex | 2026-07-20] Uncommon helmet progression revision - shipped v1.217.0

- Rebuilt the Uncommon helmet with substantially stronger green coverage, layered cheek guards, a raised green crown stripe, and an emerald centerpiece.
- Preserved the gray steel equipment family while creating a clearer visual step above Common and below the more elaborate blue Rare helmet.
- Added the game version to rarity-icon URLs so returning players receive replacement artwork immediately instead of a cached older icon.

## [Codex | 2026-07-20] Basic Attack and Dodge HUD icons - shipped v1.219.0

- Added transparent voxel HUD artwork for the universal Basic Attack and Dodge actions, matching the existing class-skill icon style.
- Replaced the weapon-dependent attack emoji and running-person dodge emoji in the desktop skill rail with the canonical new icons.
- Corrected the Dodge input label from SPACE to RMB to match right-click dodge controls; Space remains Jump.
- Versioned both icon requests so updated artwork bypasses stale browser caches.

## [Codex | 2026-07-20] Class-family Basic Attack icons - shipped v1.221.0

- Replaced the abstract universal Basic Attack emblem with four simple class-family variants: Warrior sword slash, Ranger arrow shot, Mage arcane bolt, and Reaper scythe sweep.
- Added an explicit `attackStyle` field to class definitions so future classes can inherit one of the four core HUD identities without new HUD branching logic.
- Updated the LMB slot live whenever the active class changes while preserving RMB Dodge as the universal right-side action.

## [Codex | 2026-07-20] Beastkeeper menu icon restoration - shipped v1.222.0

- Recovered the previously designed black-and-gold spiked collar and bone-paw Beastkeeper artwork from the downloaded hub-interactable icon batch.
- Removed its baked checkerboard background and exported a clean transparent 256x256 game asset.
- Replaced the generic pet-collar placeholder on the Beastkeeper hub action card and added the approved artwork prominently to the Pet Yard menu header.

## [Codex | 2026-07-20] Three core classes emblem - shipped v1.223.0

- Added a unified transparent voxel crest representing the three starting classes: Warrior sword, Ranger bow and arrow, and Mage staff with arcane orb.
- Replaced the placeholder artwork on both pause-menu Classes buttons and the Drillmaster hub interaction card.
- Added the emblem prominently to the Class Trainer menu header, with versioned URLs to prevent stale cached artwork.

## [Codex | 2026-07-20] Read-only class build showcase - shipped v1.226.0

- Rebuilt the pause-menu Classes viewer with a full two-choice progression tree inspired by, but visually distinct from, the Drillmaster respec screen.
- Highlighted every chosen skill and passive, dimmed the rejected alternative, marked pending choices, and grayed future-rank nodes for every class.
- Added complete Ranger rank 1-10 skill/passive visualization and equivalent discipline, skill-slot, passive, and capstone treatment for Warrior, Mage, and Reaper.
- Kept the entire viewer read-only: it contains no equip, respec, cost, stat-edit, or confirmation controls; build changes remain exclusive to the Drillmaster.

## [Codex | 2026-07-20] Pause-menu duplicate icon cleanup - shipped v1.242.0

- Preserved the approved pause-menu layout and large artwork.
- Hid only the redundant decorator icons above Gear, Settings, and Quit to Hub.
- Muted browser QA passed with all three duplicates hidden and zero console errors.

## [Codex | 2026-07-20] Pause icon restoration and sizing - shipped v1.244.0

- Restored the framed knight `character-sheet.png` Gear artwork from the approved pause-menu design.
- Standardized all eight pause-card artwork boxes to 88x88 desktop and 68x68 narrow-screen.
- Preserved the menu structure, cards, labels, spacing, and duplicate-icon cleanup.
- Muted browser QA confirmed all eight computed sizes and zero console errors.

## [Codex | 2026-07-20] World rebuild Phase 1: optional quests and Outskirts slice - shipped v1.245.0

- Added a save-safe multi-optional-quest foundation for Main Levels, including discovery, persistent progress, HUD tracking, one-time completion, and unique curated rewards.
- Authored two optional Outskirts adventures across existing districts: scattered caravan signals and lost watermill gearworks, with distinct routes, guardians, vertical objectives, and no main-path gating.
- Added the unique Caravaner's Compass (+11% move speed) and Millwright's Signet (+8% attack speed); full bags cannot silently destroy either reward.
- Wrote `docs/WORLD_REBUILD_PROGRAM_2026-07-20.md` as the authoritative zone-pair rollout for rebuilding all eight Main Levels and seven Trial Chambers without empty traversal or copy-paste padding.
- Muted browser QA verified discovery, HUD presentation, save persistence, completion cleanup, both rewards, all eleven named Outskirts districts, and zero console errors.

## [Codex | 2026-07-20] Outskirts + Thornwood world-quality pair pass - shipped v1.246.0

- Expanded the Outskirts journey with a telegraphed Thornboar stampede, repaired-watermill world state, river overlook, high-risk Foxglove shortcut, and corrected West Cornlands encounter footing.
- Rebuilt Black Woods activity density with an authored woodcutters refuge and loft, district-specific encounter compositions, a Moonwell vista, and a mastered canopy shortcut.
- Deepened Thornwood with the optional four-part Lost Hunters' Memories route, the unique rare Warding Thornheart Charm, named Briar Cantor and Last Snarekeeper elites, mire pressure, and a canopy-to-heart return line.
- Added explicit supports under two previously floating campaign objective markers and validated every active enemy, chest, and quest object across all three spaces against authored surfaces.
- Muted real-browser QA passed at 1920x1080, 1600x900, and 1366x768 with WebGL active, persistent one-time rewards, independent guardian/optional-quest completion, and zero console errors.

## [Codex | 2026-07-20] Hollow Pass + Sunken Wash world-quality pair pass - shipped v1.247.0

- Added two save-safe Hollow Pass optional routes: three lost survey beacons for the rare Surveyor's Eye (+9% Crit), and three Marksman field orders for the uncommon Windrunner Cord (-9% Dodge CD).
- Deepened Hollow's lower and upper expeditions with a readable rockfall traversal event, wind shelters, exposed mastered routes, the Rattlecrest elite, and corrected terrace footing for Watcher Rim and High Bone Shelf encounters.
- Expanded Sunken Wash with a Drowned Bell Shrine branch, a rooftop-to-sluice shortcut, three optional warning bells, the named Floodline Scavenger elite, and the rare Floodwarden Seal (+33% Gold Find).
- Kept the optional drowned-bell route independent from the required Flood Relics; completion persists once and cannot bypass chamber progression.
- Muted real-browser QA validated every enemy, chest, and objective against authored supports at 1920x1080, 1600x900, and 1366x768 with WebGL active and zero console errors.

## [Codex | 2026-07-20] Ruined Keep + Oubliette world-quality pair pass - shipped v1.248.0

- Added three save-safe exploration routes: fallen siege standards, discarded warden seals, and hidden witness testimonies.
- Added unique supported rewards: Siegebreaker Badge (+13% Damage), Warden's Key (-8% Skill CD), and Witness Chain (+39 Max HP).
- Deepened the Keep with a broken-parapet mastered shortcut, shaft recovery line, and named Gaol Captain elite.
- Deepened the Oubliette with testimony-cell exploration and the named Nameless Jailer encounter while preserving all required prisoner records.
- Muted WebGL QA validated zero unsupported placements, optional/required objective independence, and 1920x1080, 1600x900, and 1366x768 renders with zero console errors.


## [Codex | 2026-07-20] HUD player identity and action cooldown wheels - finalized in v1.250.0
- The top-left HUD now displays the chosen character name in larger white type, followed by a dot and the equipped class; unnamed characters safely fall back to `Player`.
- Basic Attack and Dodge now reuse the Skills 1-4 radial cooldown wheel and decimal countdown treatment, while preserving each action's existing gameplay cooldown.
- Browser QA passed muted at 1920x1080, 1600x900, and 1366x768: identity stayed inside the HUD, Attack and Dodge fractions visibly counted down, and the console reported zero errors.


## [Codex | 2026-07-20] Title Continue quick save switch - shipped v1.252.0
- Added dedicated left and right edge controls to Continue that cycle smoothly through occupied Warden slots and wrap at either end.
- The Continue subtitle updates immediately with slot, name, level, and class; center-clicking resumes the previewed save, including a save-safe automatic handoff when switching slots.
- Empty slots are skipped, single-save players see no unnecessary arrows, keyboard Left/Right is supported, and Load Character remains unchanged.
- Muted browser QA verified three-slot cycling, unchanged active storage during preview, cross-slot automatic continuation, 1920x1080 and 1366x768 geometry, and zero console errors.


## [Codex | 2026-07-20] Gameplay HUD restoration invariant - shipped v1.254.0
- Fixed the shared menu-to-game return path so active gameplay always restores the player HUD, progression bars, controls, pause button, skill bar, quest tracker, and live pet panel.
- Routed class skill/passive choices, the first-skill tutorial, pause resume, hub tutorial, and Waystation service returns through the same authoritative restoration path.
- Muted browser QA reproduced the Ranger rank-up choice flow and verified both tutorial and later passive returns restore every gameplay UI surface with zero console errors.


## [Codex | 2026-07-20] Class-trial equipment escrow - shipped v1.255.0
- Class trials now carry character level and permanent stat growth into the chamber while temporarily stripping all armor, amulets, and rings and issuing only the tested class's starter weapon.
- Existing equipped weapon and all five equipment slots are protected before the trial and restored exactly on completion with the newly earned class equipped.
- Genuine equipment found during the trial is preserved in the bag, even when the normal bag capacity has already been reached; first-ever class trials retain their normal starter-loadout behavior.
- Muted browser QA verified a full five-slot Warrior loadout through Ranger and Mage trials, retained level/stat gains, trial-loot preservation, first-save behavior, and zero console errors.


## [Codex | 2026-07-20] Hollow Pass area-2 opening crossing fix - shipped v1.256.0
- Removed the solid canyon-wall collision that sealed the intended west-road exit from the Dry Wash and replaced it with a clearly readable 220-unit gateway.
- Added three broad, level recovery shelves across the direct lava gap so one normal jump reaches a continuous safe crossing into Fossil Steps; no movement stats or global jump physics changed.
- Muted browser QA loaded Hollow Pass area 2, verified both authored routes geometrically, and physically crossed the new shelves from z -250 to z -594 with base movement, full health, and zero console errors.


## [Codex | 2026-07-20] Drillmaster loadout preservation - shipped v1.257.0
- Switching classes at the Drillmaster now banks the authoritative live Waystation hero before changing class, preventing the menu return path from restoring an older weapon or armor snapshot.
- Equipped weapon, helmet, chestplate, leggings, amulet, ring, and active pet remain unchanged; only the active class and its skill bar change.
- Muted browser QA switched a deliberately stale save snapshot through Ranger, Mage, Reaper, and Warrior, then returned to gameplay with the full live and saved loadouts identical, the HUD visible, and zero console errors.


## [Codex | 2026-07-20] Warhammer charge-scaled shockwave - shipped v1.258.0
- The Warhammer's charged quake now scales its visible and damaging AoE linearly with charge duration instead of giving short charges most of the full radius.
- Quick, half, and full charges use 84, 166, and 248-unit radii respectively; the prior 248-unit full-charge maximum is unchanged.
- Muted browser QA verified matching ring and hit boundaries at all three charge levels with zero console errors.


## [Codex | 2026-07-20] Q loot-mode cycle - shipped v1.259.0
- Added a gameplay-only Q shortcut that cycles Off -> Auto Sell -> Auto Bag -> Off while preserving the existing mutually exclusive saved settings and drop behavior.
- Added compact Q key badges beside both loot-mode HUD controls and retained clear active-state highlighting.
- Muted browser QA verified all three keyboard transitions, pause-menu isolation, persistence after reload, clean desktop layout, and zero console errors.


## [Codex | 2026-07-20] Mirror entry and rename UX - shipped v1.260.0
- The Mirror now opens at a rear three-quarter camera angle so the character's back remains primary while the face is visible in the reflection.
- Rebuilt Rename Character as a compact prompt with a top-left cancel control, full-width name field, 2-20 character guidance, and a full-width Save button that remains disabled until the trimmed name is valid.
- Saving by click or Enter now refreshes the Mirror character card and gameplay HUD immediately; cancel and Escape discard edits without leaving the Mirror.
- Muted browser QA verified camera composition, validation, click/keyboard save, cancel behavior, immediate name refresh, and zero console errors.


## [Codex | 2026-07-20] Slower character and class progression - shipped v1.261.0
- Replaced the extremely short character curve with a materially longer level-scaled XP curve and raised normal class-rank requirements by 2.5x.
- Preserved class-trial onboarding with trial-only class XP pacing that still reaches Rank 2 after the intended six enemies; trial difficulty and layout remain unchanged.
- Spread gear gates to Common 1, Uncommon 5, Rare 12, Epic 20, and Legendary 30 so powerful drops become future goals instead of immediate equipment.
- Existing levels and class ranks remain intact, partial character XP now survives snapshot reconstruction, and old stored thresholds migrate automatically to the new curve.
- Muted browser QA verified normal-versus-trial XP, the Rank-2 trial outcome, Level-3 snapshot migration, Epic Level-20 bag locking, and zero console errors.


## [Codex | 2026-07-20] Level-scaled training dummy health - shipped v1.262.0
- Training dummies now silently gain 35% of their 400 base HP per character level while retaining their nonlethal damage-checker behavior.
- Verified maxima are 400 HP at Level 1, 1,660 at Level 10, 3,060 at Level 20, and 4,460 at Level 30.
- Muted browser QA verified scaled spawning, full-health reset after depletion, no death or progression toast, and zero console errors.


## [Codex | 2026-07-20] HUD bag capacity readout - shipped v1.263.0
- Added a compact bag icon and live used / total slot count to the open space beneath the class portrait in the top-left gameplay HUD.
- The count refreshes with inventory and capacity changes, and gains a restrained red full-state treatment when every slot is occupied.


## [Codex | 2026-07-20] Emberdeep Chain Lift ascent fix - shipped v1.264.0
- Replaced the ambiguous four-slab opening climb with a grounded six-step basalt switchback leading clearly onto the Chain Lift plateau.
- Required hops are now only 97 units horizontally and 20 units vertically, with 116x100 recovery landings and ember guide posts; the optional moving-lift spectacle remains intact.


## [Codex | 2026-07-20] Equipped-skin HUD portrait - shipped v1.265.0
- The top-left HUD portrait now shows the player's equipped skin artwork instead of the current class icon, with Knight as a safe missing-art fallback.
- Skin changes refresh the portrait immediately while class identity remains visible in text beside it.


## [Codex | 2026-07-20] Waystation repeatable-activity annex - shipped v1.266.0
- Added a dedicated south annex behind the unobstructed Mirror Pavilion, expanding the hub with a wide connected hall for repeatable activities.
- Moved Abyssal Descent and Treasure Sprint onto paired violet/gold dais and removed them from the campaign portal concourse.
- Relocated every discovered exploration Trial Chamber into a scalable annex row; one chamber centers itself and up to all seven spread evenly without overlapping the eight Main Level gates.
- Muted browser QA verified the one- and seven-chamber layouts, annex connectivity, wide portal separation, 1600x900 and 1366x768 rendering, and zero console errors.


## [Codex | 2026-07-20] Stylist wardrobe action icon - shipped v1.267.0
- Generated and integrated a dedicated transparent voxel tailoring-scissors icon for the Stylist's Open Wardrobe action.
- The dark-steel, gold-filigree, and violet-gem treatment replaces the unrelated mage-class artwork while matching Bladefall's approved action-icon language.

## [Codex | 2026-07-20] Cinder Vents Forge plateau ascent - shipped v1.268.0
- Replaced the hidden, unreachable Forge-Routing Hall climb with a broad grounded basalt stair on the plateau's west face.
- The five approach landings remain outside the solid plateau wall; the final landing crosses onto the plateau only at its full 220-unit height.
- Muted browser QA verified every hop against base movement limits, all five Ember Shards, the completion portal at the Ash Altar, 1600x900 presentation, and zero console errors.

## [Claude | 2026-07-21] Multiplayer P1.1 — in-game lobby + presence co-op — shipped v1.284.0
- New "Multiplayer (BETA)" main-menu entry → lobby overlay (Host a game / Join with code). Builds on the proven mp-lab WebRTC/PeerJS layer, now inside the game.
- Host generates a 4-char room code; when the host enters any zone it broadcasts {zone,seed} so guests auto-load the SAME zone (static seeds = identical layout). Guests render as live voxel allies with a per-player id beacon, position interpolated ~14 Hz, host = star relay.
- HARD ISOLATION (all verified in a real browser): single-player NEVER loads PeerJS — confirmed peerLoaded:false on the title screen and even after opening the lobby; the script injects only on Host/Join click. All netcode lives in one `MP` object; update()/render()/enterZone() only touch it behind `if(MP.active)`. No save-schema change. Verified: v1.284.0 title has 0 console errors, mmMP button renders, lobby opens, Host lazy-loaded PeerJS and produced code KR2Z with signaling connected.
- SCOPE: presence only. Each client still runs its own local enemies/loot. NEXT: P1.2 host-authoritative shared enemies, P1.3 shared loot/quests/death-revive, P1.4 join/leave polish + lag smoothing + nametags.


## [Claude | 2026-07-21] Oliver batch fixes — shipped v1.285.0
- **Shop scroll-jump FIXED (the recurring one).** Root cause: the shop has THREE separate `.achlist` scroll boxes (weapons / perks / hub upgrades) but `showOverlayHTML` only saved & restored the FIRST one's scrollTop on re-render. Buying a perk or hub upgrade (2nd/3rd list) re-rendered and snapped that list to the top. Now every `.achlist` is preserved by index. Verified the preservation algorithm restores all lists by index (saved===restored).
- **Your Bag moved** from the SE court (x:200,z:322) to the WEST wall between the Quartermaster (z:-60) and the Smith (z:150) at x:-548,z:45 — both model + collision box moved.
- **Abyssal Descent damage ramps much harder.** Per-floor damage 1.10→1.135 base with an accelerating kicker past floor 10 (×1.065^(n-10)). Floor 10 ~3.1x (was 2.4x), Floor 20 ~21x (was ~6x) — deep floors now hit like a truck. HP curve unchanged.
- **Drillmaster banner insignia now double-sided.** The sword/staff/bow class marks render on BOTH banner faces (front z-6 and back z-10), readable from either side of the hall.


## [Claude | 2026-07-21] Scroll-preservation made GLOBAL (all menus) — shipped v1.286.0
- The v1.285.0 shop fix only preserved `.achlist` boxes. Other menus scroll on their OWN containers
  and still snapped to the top: `.buildscroll` (Drillmaster skill/respec — the one Oliver flagged),
  `.petgrid` (Beastkeeper), `.wardrobe-body` (Stylist), `.wslist`, `.menu-waystation`, `.msbody`.
- Fix generalized in `showOverlayHTML`: snapshot the scroll offset of EVERY descendant by document-
  order index before innerHTML, restore after. Same-menu re-renders reproduce identical node order so
  index maps back to the same box; setting scrollTop on a non-scroll node is a harmless no-op. This
  covers every current AND future menu — no per-class enumeration to keep in sync.
- Verified in-browser: a mixed .buildscroll + .petgrid menu preserved both scroll positions exactly
  across a re-render (buildscroll_preserved:true, petgrid_preserved:true); real game loads 0 errors.


## [Claude | 2026-07-21] Multiplayer P1.2 — shared enemies (host-authoritative) — shipped v1.287.0
- Enemies are now SHARED in co-op: same foes, same HP, they die together, and BOTH players earn XP/loot.
- Model: host is authoritative for enemy existence, HP, and death; each client still simulates enemy
  movement/attacks locally (so each player gets chased & hit via its own hurtPlayer — no divergence
  that matters). Enemy identity via a stable `mid` assigned in spawnEnemy (host & guest spawn in the
  same seeded order, so initial ids align; host-driven dynamic spawns get new ids the guest mirrors).
- Guest combat: hitEnemy RELAYS the hit to the host (shows a local number + own lifesteal) instead of
  reducing HP; the host applies it authoritatively and drives death. killEnemy is blocked on the guest
  except when applying a host-sanctioned kill (MP._authKill). Guest dynamic spawns (slime split, boss
  summon, mimic reveal, ward crystals) are suppressed and arrive via the host mirror.
- Rewards are INSTANCED: on a host kill event the guest kills that enemy locally and runs its OWN xp +
  loot roll + questKill — no loot contention, both players progress the quest in parallel.
- Netcode: the presence 'state' message now also carries `en` (compact live-enemy snapshot [mid,type,
  x,z,hp,maxHp], capped 60) and `ek` (recent kills, kept in a 1.5s window so a dropped packet is still
  caught). Guest reconciles by mid: overwrite HP, create host-only enemies, cull despawned after grace.
- SAFETY: single-player & the HOST are byte-for-byte unchanged (every guest path guards on
  MP.active&&!MP.isHost). Verified: v1.287.0 loads 0 console errors, PeerJS NOT loaded in single-player,
  and a loopback reconciliation test passed all assertions (HP overwrite, mirrored split, kill+XP, cull).
- NEXT: P1.3 shared world loot pickups + downed/revive; then shared hub (Phase 2) and PvP (Phase 3).


## [Claude | 2026-07-21] Multiplayer Phase 2 + P1.3 + Phase 3 — shipped v1.288.0
Three phases in one pass (all guarded by MP.active; single-player & host byte-for-byte unchanged):
- **Phase 2 — Shared Hub.** The Waystation is now a shared space: allies appear and walk it together.
  Hub uses a sentinel zone id (MP.HUB=-100); guests follow the host into the hub (openHub) and back into
  zones. Peer draw now keyed on the MP zone (works for hub + real zones). Connect-time zone guard fixed
  to allow the hub (hasZone()).
- **P1.3 — Downed / Revive / Joint-clear.** In co-op, dropping to 0 HP no longer kills you if an ally is
  still up — you go DOWN (locked out of move/attack/skill/dodge, drawn collapsed with a pulsing red
  distress beacon). An ally standing near for ~2.5s revives you to 50% HP; clearing the zone (openWay)
  lifts you too; bleed out after 60s -> hub. If EVERY player is down at once, the host calls a wipe for
  all. Revive is routed host<->guest (peer id <-> connection map). Presence packet carries a `dn` flag.
- **Phase 3 — PvP Duel (melee MVP).** New "Host PvP Duel" lobby button. The host's zone becomes an
  enemy-free arena (enemies cleared each frame); the same melee swing that hits foes also strikes rival
  players in front/in reach. Damage relayed host<->guest (0.6 PvP scalar + defense so duels last), a
  frag respawns you after 2s at a random arena spot, the host is the sole scorekeeper and broadcasts
  absolute scores; first to 5 downs wins. Co-op downed/wipe logic is disabled in PvP.
- VERIFIED: v1.288.0 loads 0 console errors; PeerJS NOT loaded in single-player even after opening the
  lobby; lobby shows Co-op / PvP / Join; loopback logic tests pass (down->revive->50%hp, die-when-alone,
  PvP host-scorekeeper to 5, 0.6 dmg scalar). Live 2-device tuning still recommended for feel.
- Multiplayer roadmap COMPLETE: P1.1 presence, P1.2 shared enemies, Phase 2 hub, P1.3 revive, Phase 3 PvP.


## [Claude | 2026-07-21] The Arena — save-protected loadout sandbox (Increment 1) — shipped v1.289.0
A custom-loadout battleground, solo-accessible from the hub (new "⚔️ The Arena" gate at x0,z720) and
the foundation for PvP. Increment 1 of a multi-part build.
- **SAVE PROTECTION (verified):** entering snapshots meta (classId, hero, classes, perks, gold, stash,
  run, bank, classUnlocked) and FREEZES persist() while inside (IN_ARENA); exiting restores everything.
  Verified in-browser: localStorage stays byte-identical through enter->exit, player builds correctly,
  0 console errors. You keep nothing you set and lose nothing from your campaign.
- **Loadout menu (openArenaSetup):** pick MAP, CLASS (all 4, sandbox-unlocked), LEVEL 1-60 (default 30),
  CLASS RANK 1-10 (default 10, skills auto-filled to a valid build), WEAPON (every archetype) + rarity,
  ARMOR rarity. Buttons: ⚖️ Fair Mode (standard loadout for everyone), 🎲 Randomize, ✨ Free Respec
  (arena gives temp gold so the Drillmaster respec is free). Re-openable in-arena via Pause.
- **3 MAPS:** Proving Ground (flat), The Gauntlet (parkour platforms/ledges), Cinder Pit (islands over a
  lava sea — falling burns you, respawn). Own sky/ground palette per map (ARENA_STAGE render hook).
- **No real death inside:** die() -> arenaRespawn (full HP at spawn); lava/hazard damage -> respawn.
  In co-op the arena flags MP.pvp. Pause menu gets "Arena Loadout" + "Leave Arena" (routes exitArena
  so the save is always restored).
- Debug hooks on __BF3: enterArena, exitArena, openArenaSetup, ARENA_LOADOUT, get inArena.
- NEXT increments: AI bots w/ difficulty settings (Oliver wants these improvable), MP arena sync so
  co-op/PvP share the arena, scoreboard+rounds, team modes (2v2), arena pickups/powerups.


## [Claude | 2026-07-21] Arena AI bots (Increment 2) — shipped v1.290.0
Player-like AI practice opponents for the Arena, with difficulty settings built to keep improving.
- **BOT_DIFF table** = the tuning knobs (Easy/Normal/Hard/Brutal): hp, dmg, move speed, attack cadence,
  reaction delay, dodge chance + cooldown, flee-when-low, weapon+rarity, colour. Easy to iterate.
- **botAI:** chase to weapon range, orbit-strafe, keep spacing, reactively DODGE the player's swings
  (chance/cooldown scale with difficulty), flee when low HP (except Brutal), telegraph→land melee hits
  via hurtPlayer. Bots ride the existing enemy pipeline so every weapon/skill damages them normally.
- **Rendering:** humanoid voxel fighter tinted by difficulty, sword arm swings on attack, HP bar.
- **Respawn, not death:** a defeated bot bursts, scores a KO (G.arenaScore.p, toast), and respawns after
  1.8s — endless sparring. Bots never truly die or drop loot/xp.
- **Setup UI:** Practice Bots — Count (0-4) slider + Easy/Normal/Hard/Brutal picker. Applying a loadout
  in-arena refreshes the bots. The PvP-duel enemy-clear now KEEPS bots.
- VERIFIED in-browser: 2 Hard bots spawn, move and approach the player (AI runs), a kill scores +1 and
  schedules respawn, exit is clean, 0 console errors. Debug hooks: __BF3.botInfo(), botKillFirst().
- NEXT: MP arena sync (share map + fair-mode + bots in co-op/PvP), scoreboard+rounds UI, team modes, pickups.


## [Claude | 2026-07-21] Arena Increments 3-6 (scoreboard, MP sync, teams, powerups) — shipped v1.291.0
The Arena feature set is now COMPLETE.
- **Increment 3 — Scoreboard + rounds:** a live top-centre HUD. Solo: KOs / target / Deaths. PvP: per-player
  frags (or team totals). Reaching the target (10 KOs solo / 5 frags PvP) wins the round and resets for a
  rematch. Verified: HUD shows/updates on KO, removed on exit; bots killed the player 5x in a 10s sim
  (full combat->death->respawn->score loop works).
- **Increment 4 — MP arena sync:** host entering The Arena broadcasts the map (+ Fair Mode standardized
  loadout) so guests auto-load the SAME arena (MP.ARENA sentinel zone, presence works). Late joiners land
  in it too (placeMsg). Fair Mode is now a persistent toggle standardizing level/rank/gear/stats (class
  stays your choice). Bots are solo-only (MP arena = player duel). PvP lobby hint now points to the Arena gate.
- **Increment 5 — Team modes (2v2):** host toggle; host assigns alternating teams and broadcasts the map;
  NO friendly fire between teammates (pvpMelee + takePvpDamage both check teams); team-coloured ally beacons
  (blue/red); team-total scoreboard. Verified via loopback: friendly fire blocks teammates, team scores tally.
- **Increment 6 — Powerups:** optional toggle; health / damage / speed orbs spawn around the arena (cap 5,
  ~5-9s cadence), float+bob, apply on pickup (heal 40%, +50% dmg/speed for 9s). Verified spawning + 0 errors.
- MULTIPLAYER + ARENA now fully complete: presence, shared enemies, shared hub, revive, PvP, arena sandbox,
  3 maps, custom/fair/random loadouts, free respec, AI bots (4 difficulties), scoreboard/rounds, 2v2, powerups.


## [Claude | 2026-07-21] Deeper SFX pass — curated pack wired in — shipped v1.292.0
Brought the ~50 curated CC0 sounds (from the SFX review page) into the game as real audio, replacing
generic procedural cues with per-weapon and per-mob character.
- Copied 50 curated mp3s into public/sfx/ (game now 105 sounds); registered all in FXDEF with RMS auto-level.
- **Per-mob aggro voices** on wake: MOBSND map routes each of 33 enemy types to a fitting voice (boar grunt,
  jackal bark, slime squelch, ghost moan, undead groan, goblin chitter, troll grunt, metal clank, stone
  impact, small-elemental, etc.); bosses keep their roars.
- **Per-mob death sounds:** die1-4 / hurt / shatter (frost & shell) / squelch / undead by type — replaces
  the single generic enemyDie.
- **Heavy-weapon melee IMPACTS** on landed hits: axe→chop, greatsword→metal, warhammer→blunt, scythe→slice
  (gated to heavy weapons so fast light weapons don't clutter; skips the old generic heavyhit when one plays).
- **Per-element magic cast layer** in SFX.magic (fire/ice/poison/arcane/void/holy → cast1-7), throttled 120ms
  so rapid wands don't stack. **Crossbow** gets its mechanical click. **Enemy attack telegraph** (atk1/2, or
  stomp for chargers/siege/statues) at wind-up start. **Mimic reveal** = chest thunk + roar. **Gamble** = coin shuffle.
- VERIFIED: all 18 sampled new files serve 200 at /sfx/, syntax OK, game loads 0 console errors.
- NEXT (Oliver's ask): flesh out the tutorial level.


## [Claude | 2026-07-21] Tutorial level fleshed out — just-in-time teaching — shipped v1.293.0
Replaced the front-loaded tip on the first class trial (the tutorial level) with SEQUENCED, contextual
teaching that introduces each core verb the moment it first matters (via the existing teachOnce primitive).
- `trialTeachTick(dt)` (runs only in the first-time trial, honors the Tutorials toggle):
  1) MOVE on gaining control, 2) ATTACK when the first foe closes in, 3) DODGE the first time an enemy
  winds up a blow near you (learn the danger safely — the Barnacle principle), 4) progress nudge on first
  kill, 5) PORTAL prompt when the way opens. Each fires once, non-blocking.
- Removed the redundant front-loaded tips[0] toast on the first-time path (JIT covers it); earned/replay
  trials keep their tip line.
- First real level: added first-loot and first-rarity teachOnce triggers on the first weapon drop card
  (compare ▲/▼ → equip/stash/sell; rarity colours + level lock).
- VERIFIED: syntax OK, new-game→char-create path intact, 0 console errors.
- NOTE: fires during an actual playthrough (needs char-create → class pick → trial to see live).


## [Claude | 2026-07-21] Deep tutorial pass — onboarding for a total newcomer — shipped v1.294.0
Taught every major system so a brand-new player learns the game seamlessly.
- **Opening cutscene (STORY.origin):** New Game now plays a straightforward, non-flowery setup BEFORE class
  select — the Abyss King's corruption, the Bladeborn, Ian the last Bladeborn falling years ago, the
  bloodline seemingly lost, and YOU as an ordinary town guardian stepping up because no one else will.
  Aligned STORY.intro so it no longer prematurely spoils the you-are-Bladeborn reveal. `originSeen` flag,
  plays once. Verified in-browser: fresh save → cutscene cycles → class select.
- **Per-interactable first-open explainers** via a new `menuTip(id,body)` primitive (queues a one-time
  banner that showOverlayHTML injects into the menu — guaranteed visible, shown once, honors the tutorial
  toggle): Quartermaster/Shop, Forge, Drillmaster (classes + respec), Pack/Bag, Beastkeeper, Postings,
  Mirror, Keeper/Wardrobe. Verified: opening the shop injects its banner.
- **Rank-up CHOICE teaching:** first time openClassChoice fires (rank 2, reached fast in the trial), a banner
  explains each rank gives a skill-or-passive choice, it's how you build your Warden, and any choice is
  re-pickable at the Drillmaster.
- **Skill teaching enriched:** openSkillTutorial now explains WHY (skills are your biggest tools — save for
  tough foes/crowds/escapes), the COST (cooldown + mana for casters), and PREFRAMES filling slots 1-4 as you rank.
- **First hub return** (hubTutorial) rewritten: what the Waystation is, the keepers + press E, the Waystone
  heals+banks, the Gates are zones, and the core loop (dive → clear → return → upgrade → dive deeper).
- VERIFIED: syntax OK, opening cutscene + menu-tip injection work in-browser, 0 console errors.


## [Claude | 2026-07-21] Hub layout rework — room to breathe — shipped v1.295.0
Reorganized the Waystation per Oliver's feedback so nothing feels cramped.
- **Trial Chambers (purple secrets) moved OUT of the floor row** — each discovered secret now sits RIGHT
  BESIDE its parent zone's portal (a small purple rift tucked forward-right in the same bay), so it clearly
  belongs to that level instead of floating in the annex.
- **Gate bays widened + wall CUTOUTS:** a short forward-jutting divider (solid wall + stone) between each
  pair of main portals, so every portal gets its own alcove in the rampart. Base gate span widened.
- **PvP/Arena portal redesigned:** was visually identical to the gold Treasure Sprint gate (shared prop).
  New dedicated `arenagate` prop — a menacing CRIMSON hardcore portal: iron-red riveted pillars, a
  blood-iron lintel, a bleached SKULL crest with eye sockets, a seething red core, rising embers, and
  threshold spikes. Now unmistakably different from the Sprint.
- **Annex split into THREE distinct plazas** (Abyss west, Treasure Sprint east, Arena deep-centre), each
  with its own platform + pillars, instead of cramped together.
- **SPACE PASS:** the whole hub is now ~45% wider and ~30% deeper (bounds ±660→±957, depth -450..850 →
  -585..1105). One programmatic pass scales every position; large floors + the perimeter walls stretch to
  enclose the bigger bowl while collision footprints keep their size. NPC bays spread out to fill it.
- VERIFIED in-browser: hub builds with 0 console errors, screenshot shows a roomier plaza, and a geometry
  probe confirms bounds scaled, 8 main gates span -812..812, arena prop='arenagate', annex plazas spread,
  and everything sits inside bounds. Debug: __BF3.hubInfo().


## [Claude | 2026-07-21] CRITICAL floor fixes (hub + arena) — shipped v1.296.0
- **Hub floor was broken by the v1.295 space pass:** the walkable floor uses G.segments, but the space pass
  scaled everything EXCEPT segments — so the scaled-out gates (±812) and annex (z:858+) sat off the plaza
  floor and you'd fall walking to them. Fix: the space pass now scales G.segments (position + extent) too.
- **Arena maps had NO floor** (G.segments was empty) → nothing to stand on → fall & die (the "Proving Ground
  is just lava", "Gauntlet spawns you on lava" reports). Fix: enterArena now pushes a solid 1560×1560 floor;
  lava map = that floor IS the lava surface (islands are plats above it); spawn drops onto safe ground/island.
- VERIFIED: floor probe returns solid ground (0) at hub spawn + both end gates + the arena gate, and at
  center/off-center on all three arena maps; 0 console errors.


## [Claude | 2026-07-21] Arena = separate room + NPC/door + bulletproof save-protection + bot fixes — shipped v1.297.0
- **The Arena is now a proper SEPARATE ROOM** (modeled on the Sparring Room). The hub portal teleports you
  straight in (no menu gate). Inside: an **⚔️ Arena Master NPC** (press E → loadout/map/bots menu) and a
  **🚪 exit door** (press E → back to the Waystation). A hazard-free ENTRANCE PLATFORM (south) is where you
  spawn and both NPCs live; bots spawn at the combat centre away from you. Interaction now works in G.arena
  (updateInteract extended); a small drawArenaProps renders the master podium + door.
- **Save-protection LEAK fixed:** enterArena refactored into enter (snapshot + freeze persist, never
  double-enters) + buildArenaRoom (rebuild for a new map/loadout). "Apply Loadout" now rebuilds the room so
  a new MAP takes effect. SAFETY NET: enterWaystation force-restores the campaign snapshot if we ever reach
  the hub while still flagged in-arena — so an arena loadout can NEVER leak into the campaign. Verified:
  campaign localStorage byte-identical through enter→exit.
- **Bot AI fixed:** (1) no longer flees off the map — when low or on lava it heads to a reachable safe island/
  centre and is clamped 70u inside bounds; (2) takes LAVA damage like the player and respawns on land
  (botRespawn, no player KO); (3) hops toward islands to escape lava; (4) at low HP it TURTLES — 45% damage
  reduction + slow self-heal (stands in for defensive/healing skills) instead of kiting forever.
- VERIFIED: enter lava arena w/ 2 hard bots, 3s sim — bots stay in the combat area, 0 console errors, save
  protected, clean exit.


## [Claude | 2026-07-21] Realistic mirror surface — shipped v1.298.0
The hub Mirror's surface read like a glowing portal (bright emissive glass bands). Reworked it to look like
a real silvered mirror.
- Removed the emissive GLOW (the cause of the "ton of light / portal" look). The glass is now a matte
  translucent SILVERED pane (subtle cool tint + top gradient + faint dark edge vignette + one very soft
  diagonal sheen) so you see the reflection THROUGH lightly-tinted glass, not a shining panel.
- The live reflection is more realistic: it tracks your horizontal position more strongly, rises when you
  jump, and MIRRORS your facing (mh.yaw = π − your yaw) so turning turns your reflection — true mirror behavior.
- VERIFIED: hub builds with 0 console errors. (Visual — review in the SE court by walking up to the Mirror.)


## [Claude | 2026-07-21] Hub polish batch (Oliver's list) — shipped v1.299.0
- **Floor now reaches the walls everywhere** — the space-passed hub left bare gaps at the perimeter (the
  floor is drawn per walkable segment, and only 3 rectangles existed). Added a big base floor segment that
  scales with the hub + widened HUB_STAGE's ground plane. Verified floor is solid at all walls/corners.
- **Secret (purple) portals show number pips** on the top bar — like the main gates' tier pips, scaled to
  the smaller trial-chamber frame, indicating which secret it is.
- **Void crystals moved to ring the Abyssal Descent portal** (were scattered around Sprint/PvP); kept
  together as its signature and scale with the annex.
- **XP-bar ruler ticks now layer ON TOP of the fill** (pseudo-element overlay) so segment marks stay
  visible as the bar fills past them.
- **Player name never truncates** (removed ellipsis). Restructured the HUD meta row: name alone on the left
  (full room), the CLASS badge moved to the right where armor% was, and armor% moved to sit after the
  location text ("THE WAYSTATION") — verified name overflow is no longer clipped.
- **Your Bag chest** now rotates to face the hub centre (gold clasp on the front toward the plaza).
- **Postings board** moved flush against the south-west wall, posters facing the room.
- **Hub-upgrade decor no longer floats:** the per-frame render was using UN-scaled coords after the space
  pass. Made the hub scale a shared global (HUB_SX/HUB_SZ) and scaled all upgrade decor; the order banners
  now hang FLUSH high on the west wall behind the shop/smith/bag.
- VERIFIED: hub builds with 0 console errors; screenshot confirms the floor reaches the walls and the HUD
  name has room. (Spatial placements — bag/postings/banners — worth a quick in-game look to fine-tune.)


## [Claude | 2026-07-21] Sparring-ring ropes re-coloured red/blue — shipped v1.300.0
The boxing-ring perimeter ropes had been drawn with alpha 0 (base colour transparent, only a faint emissive)
so they washed out and blended into the warm floor. Restored them to BOLD SOLID red/blue/red stacked ropes
(alpha 1 + a matching emissive glow), slightly thicker, so they read clearly against the floor. 0 console errors.


## [Claude | 2026-07-21] Annex flicker (z-fighting) fix + playtest camera hook — shipped v1.301.0
- **Flickering around the Abyss/Sprint/Arena portals FIXED.** Root cause = z-fighting: (a) my big base
  floor segment overlapped the old plaza/annex/court segments, so multiple coplanar floor slabs rendered
  on top of each other; and (b) the dark annex tint decals sat exactly on the floor. Fix: the base floor
  is now the ONLY slab that renders (redundant sub-segments flagged `nofloor`, kept for collision), and
  each activity plaza gets a SOLID themed floor pad in its portal's colour (Abyss violet / Sprint gold /
  Arena crimson) raised just above the base floor so nothing is coplanar. Verified: floor renders clean.
- **Playtest camera hook** `__BF3.look(x,z,yaw,pitch)` — teleports the hero to a vantage point, aims the
  overhead camera, and forces a render, so an automated harness (or a person in DevTools) can screenshot
  any spot for visual verification. Mirrors how Codex's Playwright harness drives the game via __BF3.
  Used it to confirm the bag sits on the west wall between shop & smith, banners hang behind them, and the
  floor is clean.


## [Claude | 2026-07-21] Required jump+dash chasm + mid-air-dash tutorial in the Outskirts — shipped v1.303.0
Taught the mid-air dash as a REQUIRED traversal in the first level, before the secret-hiding pass.
- Measured the real reach via the sim harness: **single jump ~164u, jump + mid-air dash ~235u**.
- Placed a **required ~195u dash chasm** on the Outskirts golden path — the exit portal now sits on a
  landing island across the ravine, just past the Old Waystone Crown (edited the LIVE EXPANDED_SCAPES.outskirts,
  not the dead legacy SCAPES one). A single jump falls ~31u short (impassible alone); a jump+dash clears it
  with ~40u margin (easily done, not tight). Missing just drops you back to safe ground.
- New **`openDashTutorial()`** popup fires once as you approach the edge — cleanly explains: run + JUMP, then
  at the top DASH (K / Shift / right-click) in your movement direction to fly across. Honors the tutorial toggle.
- VERIFIED in-harness: exit on the landing (solid), the gap is void, launch edge solid, single-jump<gap<dash,
  tutorial fires with heading "The Mid-Air Dash", 0 console errors.
- NEXT (deferred per Oliver): the creative secret-hiding pass (place trial-chamber secrets in hidden/hard,
  single-jump-reachable spots), starting with the too-open Outskirts & Ruined Keep.
