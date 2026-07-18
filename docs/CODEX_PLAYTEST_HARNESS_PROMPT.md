# BLADEFALL — Automated Playtest Harness (Codex work order)

> For **Codex**, to run IN PARALLEL with Claude's game work. Builds an automated playtest /
> balance harness that drives BLADEFALL and dumps data. Grounded two-stage: (1) inspect the
> game's debug hook, (2) build the harness.

## ⛔ THE ONE HARD RULE (protects the dev flow)
**You must NEVER edit `public/3d/index.html`.** That single file IS the game, and a
game-editing session (Claude) may be working it at the same time — two writers on that file
clobber each other. You may **read** it freely. ALL your code and output go in a NEW
directory: **`_automation/bladefall/harness/`**. If the harness needs a debug hook the game
doesn't expose, **do not add it** — list it in your report as "requested hooks" for a game
session to add later, and work around it if you can.

- `git pull` before a run so you test the latest game.
- You do not push game changes (you make none). You may commit your own `harness/` files.

## GOAL
An automated harness that boots the real game, drives a bot through content, and produces
**balance + QA reports** — so tuning decisions become data-driven instead of vibes. It
replaces hand-driving the game in a browser (which is slow and flaky).

## STAGE 1 — INSPECT (read `public/3d/index.html`)
Map the debug hook `window.__BF3` and confirm the exact shapes before building. Do NOT
assume — read the source. Key surface (verified 2026-07-18, but re-confirm):
- `__BF3.G` = live game state. `G.p` = player. `G.enemies` = array.
- `__BF3.update(dt)` = advance one sim step. **The render loop does NOT auto-run in a
  background/headless tab** (no requestAnimationFrame) — you MUST call `update(0.016)` in a
  loop to advance time. `G.time` accumulates.
- `__BF3.input` = `{left,right,up,down,jump,attack,dodge,jumpEdge,dodgeEdge,jx,jz}`.
- Helpers you'll use: `giveWeapon(arche,rarity)`, `makeWeapon(arche,rid)`, `spawnEnemy(type,
  x,z)`, `enterZone(zi)`, `openHub()`, `startEndless()`, `startTrial(cls)`, `skipTrial(cls)`,
  `playerAttack()`, `isChargeWeapon(w)`, `estat(e)`, `classFamilyOk(w)`, `addGold(n)`.
- Tables: `ZONES`, `ARCHES`, `ARCHEIDS`, `ENEMY`, `RARITY`, `RORDER`, `MELEE`, `WEAK`,
  `EL_STAT`, `STCAP`, `TIERBAND`, `PETS`. Constants: `VERSION3D`, `MIMIC_RATE`.
Write your findings as `harness/HOOK_MAP.md` before coding.

## STAGE 2 — BUILD (in `_automation/bladefall/harness/`)
Structure: a **core driver** (pure sim-driving logic, no I/O) + a **runner** + **reporters**.

### Execution model — support both, primary = headless
1. **Primary — headless (Playwright/Chromium):** boot a local static server serving
   `public/`, load `/3d/?mute=1`, wait for `window.__BF3`, inject the core driver, run the
   suites, save reports to `harness/out/`. WebGL in headless works via Chromium's SwiftShader
   (`--use-gl=swiftshader` / `--enable-unsafe-swiftshader` as needed) — the harness only needs
   the game to INITIALIZE the context; it computes by pumping `update()`, not by rendering.
2. **Fallback — console bookmarklet:** a single `harness/console-run.js` the user can paste
   into the live game's devtools; it runs a suite and triggers a JSON download. Same core.

### Suites to implement (this is the value)
1. **Weapon DPS matrix.** For every active `ARCHE` at a fixed rarity, ON-class and OFF-class:
   glue the player adjacent to a standardized tanky dummy, swing on cooldown for T seconds,
   measure damage/sec. Handle charge weapons via their charge path (don't count a held charge
   as a swing). Output a ranked table → surface dominant / dead weapons and the true off-class
   penalty. Also record status build per element (burn/chill/venom/rune/radiance/corrupt per
   hit) and the weakness-chart multipliers (`WEAK`: fire↔frost, poison↔arcane, holy↔void) by
   swinging a matching/oppo­site-element weapon at affinity-tagged enemies and reading actual
   damage mods.
2. **Class × zone clear profile.** Each class (warrior/ranger/mage/reaper) with a
   representative on-class loadout, run each of the 8 zones: time-to-clear-quests, deaths,
   damage taken, DPS uptime. Flag difficulty spikes / trivially-easy zones.
3. **Descent scaling curve (the big one).** Run `startEndless()` to death with a "good but not
   godmode" bot, over N trials. Per floor log: enemy HP, damage, attack cadence, spawn
   interval, concurrent count, elite %, player TTK, and whether the floor was cleared. Output
   the per-floor curve + a floor-reached distribution. This validates the design mandate
   ("a fresh rusty-sword player barely clears Floor 1; scales hard and fast"). Run one trial
   with a deliberately WEAK loadout (rusty sword, base stats) to measure exactly how far
   floor 1 pushes a fresh player.
4. **Completability sweep.** For every zone + both areas, confirm quest objectives are
   satisfiable and the boss is killable by the bot (complements the existing geometric
   zonescape check with a combat-level one). Report any objective the bot cannot complete.
5. **Regression mode.** Persist each run's numbers as JSON; on re-run after a game update,
   diff against the last baseline and flag any metric that moved >X% (configurable). This is
   what makes the harness pay off every future balance batch.

### Reporting
- `harness/out/<VERSION3D>-<runid>.json` (machine-readable) + a human `REPORT.md` (ranked
  tables, the Descent curve, flagged outliers, completability failures, requested hooks).
- Stamp `VERSION3D` in every report. Since driving uses no wall-clock RNG control, run
  multi-trial suites N times and report distributions (mean/median/spread), not single points.

## THE DRIVING COOKBOOK (hard-won today — saves you hours)
- **Advance time:** loop `__BF3.update(0.016)`. Nothing moves otherwise in a headless tab.
- **Reliable damage:** driving via `input` alone is flaky. Instead, for a controlled hit:
  set `p.x/p.z` adjacent to the target, `p.yaw=Math.atan2(t.x-p.x, t.z-p.z)` (and `p.face` if
  present), `p.atkCd=0`, call `playerAttack()`, then pump ~20 `update()` steps and read
  `target.hp` delta. For traversal in a real run, set `input.jx/jz` (stick) + `input.up`.
- **Charge weapons** (`isChargeWeapon(w)` true — greatsword/hammer/etc.): `playerAttack()`
  starts a CHARGE, not a swing. Use their release path or exclude them from raw-swing DPS and
  measure separately.
- **Melee needs grounded targets** (`y≈0`). Flyers sit at `y≈60` — use ranged, or skip.
- **Off-class = 0.6×** (`classFamilyOk` false). Families: warrior=sword/great/axe/hammer,
  ranger=bow/crossbow/knives/javelin, mage=staff/wand + spellblade(`art`), reaper=scythe.
- **Status** lives in `e.st` via `estat(e)` = `{burn,chill,venom,rune,radiance,corrupt}`.
  **Dummies are status-exempt** — use real spawned mobs (`spawnEnemy`) to test statuses.
- **Zone entry only works from the hub:** `openHub()` → pump ~40 → `enterZone(zi)` → pump
  ~240. Recover from death/void-fall by resetting `p.dead=false; p.hp=p.maxHp;` and, if
  `p.y<-10`, snapping to `G.waystone`.
- **Descent floors advance** by touching `G.portal` (`dist<52`). A floor clears when
  `G.endSpawned>=G.endTarget && alive===0` → portal spawns. Read `G.floor`, `G.ngHp`,
  `G.ngDmg`, `G.endTarget`, `meta.endlessBest`. "alive" excludes `dead/dummy/practice`.
- **Overlays pause combat.** Loot cards, level-up, and the rank-2 subclass fork block the
  sim — detect a visible `#overlay` and click its stash/continue/first button to proceed, or
  the bot stalls (this caused false "0 kills" today).
- **Corpses linger** in `G.enemies` with `dead=true` and sometimes positive hp — always
  filter `!e.dead && e.hp>0 && !e.dummy && !e.practice`.

## DELIVERABLE
`harness/` with: `HOOK_MAP.md`, the core driver, the headless runner + console fallback, the
five suites, `out/` reports, and a `README.md` on how to run each. Final message: a summary
of the first baseline run (top weapon-balance outliers, the Descent curve, any completability
failures) + the list of requested game hooks (if any) for a future game session to add.
