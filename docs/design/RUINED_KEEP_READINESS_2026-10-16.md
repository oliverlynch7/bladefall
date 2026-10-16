# Ruined Keep new-player review

Authority: U-KEEP-READINESS-20261016. Baseline ab457fa9 / v2.203.0. Preserve unrelated companion/rig edits.

## Grounded findings and plan

1. Broken Walls uses arrow-post guards/cord, a side gate, a three-prisoner breach defense, then either the jail key or battlement wheel. Optional workshop tools and old-wall chamber are independent of that journey. The current generic blocked text claims guards remain even after they are dead when the real requirement is the unfinished breach. Trace actual transaction conditions and use the same guard/remote state as availability.
2. Broken Walls rescue and tools notes retain their original tasks after their goals change or finish. Update existing notes in place to reflect gate, rescue and return state; keep journal history and reward identifiers.
3. The Dungeons requires roster, service door, cleared cell guards, release, confiscated papers, a physical winch turn and shelter transfer. The papers are mandatory before gripping the winch, but older rescue notes merely say to read them before leaving. Explain the immediate prerequisite and provide specific feedback at premature interactions.
4. Dungeons sync unconditionally reinstates active lift/press directions even after completion. Refresh saved notes according to completed flags without granting progress, extra rewards or solving optional machinery.
5. Add targeted regression checks using actual story transactions, guard clearances, restore and shared remote status. Reuse route, escort, winch, press, story and boss suites. Run rendered late-stage rescue/interaction/save/co-op tests when browser returns; no claim of visual verification or new publication until then.

No map shrink, terrain change, story outcome change, SFX or difficulty adjustment. Geometry/camera quality and human pacing remain unassessed in this source-only pass.


## [Codex | 2026-10-16] Ruined Keep readiness implemented locally

Candidate v2.204.0-keep-guidance updates rescue/tools/lift/press notes as goals change, gives actual missing-prerequisite feedback, uses shared guard clearance for guest feedback, and explains the required papers before operating the lift. Note identities/order and story/reward locks are preserved. New readiness suite failed before implementation and now passes 28 checks; existing Keep, prison story/journey/press/routes, Fallen, topic/journal and syntax suites pass. Evidence: docs/art-validation/keep-readiness-20261016/summary.json.

Not published: AGENTS.md's production checklist requires real-browser verification. Browser discovery returned no clients; opening the local review page was queued without restoring a connection. Finish rendered checks before pushing this gameplay candidate to main. Production remains v2.203.0. The Hollow earned escort/Marksman and Waystone checks remain open; restore from the valid canyon-arrival-before.json export. No geometry/difficulty/SFX changes; unrelated companion/rig edits remain untouched.
