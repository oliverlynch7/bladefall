## [Codex | 2026-10-17] v2.239 Keep stutter and visible optional objectives

Actual default shoulder/high disposable old-level100 browser profiling covered Keep courtyard, prison entry, flooded drain (1950,-3700,y80), water movement/dash and lamp boundary (310,-940,y180). Stationary water alone did not reproduce severe drops. Including initial transition frames reproduced1081.1ms lamp-boundary frame: threeRender1071.3ms, shader programs100->118, plus98.4ms frame later. Keep varied visible point-light count while approaching braziers, compiling different NUM_POINT_LIGHTS variants in play. Same pattern existed in Frostfell, deep-region art and hub.

Added shared allocation-free nearest-light pool. All three point-light nodes remain visible; only intensity/position changes, including intensity0 outside range/low quality. Existing colors/ranges/powers, fixtures and geometry remain intact. Bounded nearest selection removes map/sort churn. Updated every deep-art wrapper/cache key to retain one scene-owning module instance. Identical after-run: lamp-boundary median6.6ms/p958.5/worst12.5 with zero>30ms frames; water/moving samples worst12.7/13.6ms. Load-time shader preparation stays behind curtain. This proves the reproduced transition fix, not universal sustained FPS or exact user-PC performance.

Shared camera occlusion/sweep now uses scalar slabs plus conservative XZ broad phase instead of many per-obstacle arrays.6000 randomized parity cases pass; sparse1800-box/1000-sweep microbenchmark about1242ms->36ms (synthetic, not game FPS). Direct enemy step support now narrows collision candidates once per movement and reuses them; existing bounded A* unchanged.60 actual old/new movement cases and prior collision tests pass.

HUD active optional objectives are a visible section under main objective, with title and next step/count, no dropdown. Completed history remains in Journal. Progress included in signature; tracker has bounded scroll on crowded/short screens. Actual Sly family-picture quest fixture verifies initial visible row, changed return-to-Sly instruction and completed row removal; no hidden details, no captured errors. Screenshot inspected.

106 offline suites pass. Existing scenes, puzzles, water collision, rewards and saves preserved; pre-change save loaded. No production save changes, physical mobile/controller or two-device co-op test claimed. Evidence before/after/comparison/optional-HUD JSON and screenshot in this directory. Publication pending.


## [Codex | 2026-10-17] v2.239 production confirmed

Functional commitfd1210bd deployed successfully as5ed85a15-58be-43db-b69a-80166d1f1b3b. Actual public browser confirmsv2.239.0-keep-performance, normal main-menu boot and2239 camera/hero/HUD asset references. Local106-suite,6000 camera/60 movement parity cases, old-save, reproduced lighting-transition before/after and visible optional progress evidence recorded in docs/art-validation/keep-performance-20261017. Profile artifacts omit repeated decorative item records while retaining counts and timings. No production character/save changes.
