# BLADEFALL debug-hook map

Inspected against `public/3d/index.html` version **1.81.1** on 2026-07-18. The game file was read only.

## Runtime

- `window.__BF3.G` is a getter for live state; never retain it across `enterZone`, `openHub`, or `startEndless` because those replace `G`.
- `update(dt)` advances only while internal `mode === 'play'`. The driver pumps `1/60` second steps.
- `input` has keyboard booleans and controller axes (`left/right/up/down/jump/attack/dodge`, edge flags, `jx/jz`).
- `G.p` contains position/velocity, `hp/maxHp`, cooldowns, class stats, weapon, gear, status and death state.
- `G.enemies` includes live enemies and lingering corpses. Active filter: `!dead && hp > 0 && !dummy && !practice`.
- `G.time`, `floor`, `ngHp`, `ngDmg`, `endTarget`, `endCap`, `endBatch`, `endInt`, `endSpawned`, `floorCleared`, and `portal` provide simulation/endless telemetry.

## Exported controls used

- Combat: `giveWeapon`, `makeWeapon`, `playerAttack`, `isChargeWeapon`, `chargeRelease`, `hitEnemy`, `spawnEnemy`, `makeElite`, `estat`, `classFamilyOk`.
- Progression: `openHub`, `enterZone`, `nextArea`, `questBump`, `questKill`, `startEndless`, `loadEndlessArena`, `endlessTick`, `endlessDescend`.
- Tables: `ZONES`, `ARCHES`, `ARCHEIDS`, `DROP_ARCHES`, `ENEMY`, `RARITY`, `RORDER`, `melee` (the source `MELEE` table), `WEAK`, `EL_STAT`, `STCAP`, `TIERBAND`, `PETS`, `CLASSES`.
- Constants/snapshot: `MIMIC_RATE`, `snap()`. `VERSION3D` is returned as `snap().version` rather than exported directly.
- Meta: `meta` getter plus `classState`, `loadMode`, `addGold`, and related helpers.

## Confirmed mechanics

- Off-class direct damage multiplier is `0.6`; `classFamilyOk` checks `curClass().family` against weapon `art`.
- Element match resists at `0.6`; the opposed element in `WEAK` deals `1.5`.
- Status meters live at `e.st`; `estat(e)` initializes all six meters. Dummies are status-exempt.
- Charge-capable weapons only charge when on-class. A press performs a quick attack; holding then calls `chargeRelease(p,w,amount)`.
- Endless scaling: HP `1.16^(floor-1)`, damage `1.10^(floor-1)`, wave target `min(70,8+round(3*floor))`, concurrent cap `min(28,10+floor(1.2*floor))`, spawn interval `max(.25,1.2-.06*floor)`.
- Zone entry rebuilds `G`; quests are in `ZONES[zone].areas[area].quests`. Boss area is `area === -1`.

## Limitations / requested hooks

- Seeded RNG control or injectable RNG (needed for deterministic regression baselines).
- A supported class setter/reset-run helper (the harness currently updates `meta.classId`, an exposed mutable object).
- Read-only combat event telemetry (`damage`, source, crit, element multiplier, status applied) to avoid inferring damage from HP deltas.
- A supported overlay resolver or non-UI loot choice API for unattended runs.
- A quest-objective locator API for organic pathfinding to placed fetch items, shrines, and boss portals.
