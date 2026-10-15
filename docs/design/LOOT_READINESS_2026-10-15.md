# Loot and early-player readiness

Baseline: 4d8637bd / v2.199.0. User: Continue the announced loot/full-bag and early-player readiness pass.

## Source-grounded plan

1. Reproduce ground weapon, armor and trinket collection at capacity boundaries, explicit auto-sell, same-frame multiple pickups, quest pickups, unopened chests, save/reload and co-op individual loot. Normal pickups currently preserve full-bag items.
2. Reproduce the Quartermaster comparison purchase: unlike the main buy button, it auto-equips and calls bagReplaced, which can discard the old weapon at capacity. Unify both purchase entry points around established bag delivery, validate before spending, and keep existing paid relic entitlement intact. Check bag swaps and default-weapon handling for related loss.
3. Improve blocked-ground-item feedback using the existing comparison panel. Identify the item and actual outcome, deduplicate repeated proximity notices, update the notice if that item is later collected, and preserve the journal reading lane. Do not reveal unopened chest contents.
4. Verify a genuine pre-change save and a continuous early-player path through actual UI controls. Treat staged probes as focused checks, not a full campaign playthrough, difficulty acceptance or Internet co-op/performance evidence.
5. Run relevant regressions and syntax checks, capture rendered evidence, version and publish main, verify production, clean owned local test resources.

No new currency rules, reward tables, story, world geometry or global balancing. Preserve unrelated companion/rig work.

## Initial outcome - browser disconnected

Implemented the reproduced purchase loss and feedback improvements. 28 transaction/presentation checks and relevant chest/syntax checks pass. Browser connection is unavailable; no visual, genuine old-save reload, co-op integration or continuous early-play claim. Publication is pending the required real-browser checks. Evidence and exact resume procedure: `../art-validation/loot-readiness-20261015/summary.json`.

## Browser recovery and additional finding

Activated the existing chat through the app navigation tool; the in-app testing browser then connected without the user returning to the PC. Real-browser transaction/save checks and ten local host/guest loot assertions pass. During the early campaign UI flow, the Pause button's center hit `#lookzone`: `#pausebtn` and the later `#controls` stacking context both have z-index 7. Escape still opens the menu. Raise only the pause button above camera controls while keeping it below modal overlays. Verify pointer hit targets and actual clicks at desktop/laptop/phone sizes, and retain keyboard/menu return behavior. No new mechanic or balancing change.

## Verified outcome

Browser connection restored remotely. Fifteen evidence checks, covering ten individual co-op assertions, pass. Short campaign/menu/save smoke completed; full fresh campaign/performance assessment remains separate. See summary.json for exact evidence, limits and deployment status.
