# Treasure Sprint finish pass — 2026-10-17

Version 2.255.0-sprint-finish. Browser verification uses an isolated pre-change level100 save with in-memory storage; no production saves modified.

## Verified causes and repairs

- Reproduced hub entry stuck after world renderer was ready: loading still required hub art because reused G.hubArt remained attached. Mode-aware readiness and clean sprint scene state repair it.
- Loading identity/reset now includes course seed and attempt, including same-course retry.
- Practice finish chest uses an ephemeral claim, so it never inherits a saved opened chest or writes a loot record; no gold/gear reward in hub practice. Campaign reward chest remains intact.
- Practice autosave does not replace campaign resume. Character is persisted before leaving hub.
- Scoring includes three seconds per fall; idle/load/menu time excluded. Per-course bests are bounded and validated, legacy global best preserved.
- Co-op results are local, held/protected/visible. Host explicitly restarts a shared attempt or returns the party. Same-seed retries get a new round identity; duplicate and stale packets cannot reset the active round.
- Moving target guidance uses current platform location/height. Existing riders are carried once before integration; no accumulating lift-height error. Phase changes invalidate collision index even if obstacle count remains equal.

## Presentation and play

Bright blue/ivory/gold palace-kit course, physical slab colliders matching the visible thin platforms, larger launch with clear first gap, expanded lift crossing, colored timed-platform outlines and amber disappearing warning. Stable checkpoints, local recovery, current jump/dash hints, progress meter, contextual platform tips. Results show running time, falls and scored penalty, with same-course retry / new course / hub choices. Cleared stale loot/clue overlays on entry.

## Evidence and limits

119 regression suites pass, plus focused checks after final HUD cleanup. 500 seeds cover all ten active families and 10,806 consecutive route hops; numeric clearance/height checks are not a substitute for physical traversal.

Actual browser integration exercises portal entry and GPU readiness, old save, idle timer, fall/checkpoint/no-HP-loss, Esc and bag freeze, no-reward practice finish, same-seed keyboard retry, timeout/new course/Q return, simulated host/guest reconstruction and round handling, rider stability at30Hz, phase collision toggling, campaign chest + gold + exit, and a complete seed68 run using level1 base movement/jump without falls (22 route transitions, no teleport between them). State setup/finish/failure tests use explicit fixture controls; the traversal uses game physics. Co-op tests use real packet methods with a simulated guest, not a second physical Internet client. Browser JSON and screenshots included. Human playtesting still determines pacing/challenge/fun.


Final HUD checks: shoulder, overhead and first-person screenshots inspected; 390px-wide embedded viewport checked with timer below the character card and above controls. Final loot-feed cleanup preserves manual recent-loot recall while dismissing stale automatic notices on course entry.
