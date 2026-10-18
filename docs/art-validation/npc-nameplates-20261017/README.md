

## [Codex | 2026-10-17] NPC identity and interaction clarity - v2.262.0

Nearby campaign NPCs now have small readable names above their local rendered models, with a gold outline for the current interaction target. Covers campaign/trial/beta NPCs, named rescue actors and the legacy Shade; existing hub station signs stay authoritative to avoid duplicate hub text. Names hide behind walls, offscreen, on scene changes and in menus/dialogue; overlapping labels prefer the focused/nearer NPC. Reused DOM and short cached visibility checks avoid rebuilding names every frame.

The jumping world-space E pill is replaced by one stable clickable action dock above the skill bar: current binding, target/action, and service/quest cue where applicable. Uses the original reachable target and interaction callback, preserves touch/controller controls, never changes quest or co-op authority. Nearby objective arrow is suppressed only when that same target is already presented by the dock.

Verified:81 actual-browser old-save checks across18 host/guest-role x graphics x camera combinations, current rendered-head projection, stable action placement, rebinding, camera turns, menu/dialogue hiding and click-to-talk. No console errors. Targeted checks:17 nameplate/occlusion/crowding/lifecycle,117 DPR/anchor/role checks,21 onboarding,18 menu keyboard plus focused-E,42 pause,94 dialogue paths and inline script syntax all pass. No saves or network packets changed. Evidence: docs/art-validation/npc-nameplates-20261017/.
