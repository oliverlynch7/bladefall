# Opened chest cleanup

v2.351.0. Visual-only change; reward records and independent co-op claims unchanged.

Shared chest-exit helper leaves .9 visual seconds for lid opening/hold, then shrinks over .4s and hides the actor. Captures original per-instance scale, never changes shared template materials. First-seen preclaimed models hide immediately. Normal prop sync counts visible chests, retains hidden actor records until scene removal to avoid rebuilding them each frame. Gold coffers, authored chest bodies and bespoke prison chest share the exit; authored supports/mechanisms remain. Fallback omits claimed shells. Import map refreshes all four dependent renderer modules, including cached hero import specifiers.

Checks:60 actual model/prop synchronizer/fallback checks across all5 rarities and coin coffers;133 authored chest mapping/renderer checks across11 assignments;44 isolated actual co-op chest claim cases plus mimic persistence test;22 loot transaction cases including full bags. Syntax and diff checks passed. Co-op tests are isolated player contexts, not live WebRTC.

Real muted Chrome test uses build-compact-loot-qa.py and pre-change First Journey QA level4/gold1145 with in-memory storage. Staged5 closed rarity models and one preclaimed chest. All5 closed visible, preclaimed hidden. Opened common/rare/legendary: bag gained3 once; repeated open calls did not duplicate. On completion all3 newly opened models hidden,2 unopened neighboring models remain full-size, restored claim stays hidden. No captured browser errors. Browser background throttling made visual-clock animation take longer in wall time, so completion verified by actor state rather than a fixed screenshot delay. No user saves changed.

before.png and browser.json record actor state. Public screenshot /design/chests/opened-cleanup-2351.png shows only the2 unopened neighbors remaining.
