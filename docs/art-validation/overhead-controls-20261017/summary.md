

## [Codex | 2026-10-17] v2.240 overhead controls and movement clarity

Mouse attack/dodge now route canvas and transparent look/joystick surfaces through the same binding handler, avoiding blocked overhead clicks without firing on HUD/menu controls. J retained; K is a compatibility dodge alias only for the conventional Shift/Mouse2 mapping when K has no explicit binding; customized mappings win. Dash model afterimages now default off globally; Graphics & appearance offers persisted Dash afterimages toggle, clearing existing echoes immediately, with Reduce motion overriding on. Overhead minimap heading derives from rendered camera view, keeping map aligned while player turns; shoulder/FPS still follow camera yaw.

Browser disposable pre-change level100 save:30 checks pass for six mouse press/release pairs, HUD exclusion, J/K, fixed overhead direction, shoulder/FPS headings, default-off/opt-in/clear trails and actual settings toggle.106 existing offline suites plus new focused overhead suite pass; inline parses. No production saves modified. Publication pending.
