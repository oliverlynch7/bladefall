# Waystation Training and Input Verification — 2026-07-19

## [Codex | 2026-07-19]

Shipped in `VERSION3D 1.181.0`:

- Enlarged all 11 Quartermaster permanent-perk icons to 70px artwork inside 82px frames, with 92px rows.
- Renamed the hub storage interaction to **Your Bag** / **Open your bag** and made it open the Bag directly.
- Changed class respec pricing to **300 gold per changed skill or passive**, with live change count and total cost.
- Added full-window pointer-lock reacquisition for shoulder camera mode and restored HUD state after window focus/visibility changes.
- Replaced the outdoor mob-spawning post with an enclosed **Sparring Room** entered directly through its hub door.
- Kept one straw training dummy in the main Waystation as a damage-number checker.
- Confined spawned practice enemies to the sealed Sparring Room and added direct controls plus a Waystation exit.

## Browser QA

- Muted local browser, 1280×720.
- Hub Bag prompt opens the Bag without an intermediate NPC dialogue.
- One respec change costs 300g; two changes cost 600g.
- Sparring Room reports four enclosing walls and all spawned enemies remain inside its bounds.
- Main hub contains one training dummy.
- Window focus restores a hidden HUD.
- Browser console: 0 errors, 0 warnings.
- JavaScript syntax check and `git diff --check`: passed.

Pointer lock itself cannot be asserted in the automated headless browser because the browser suppresses the API without an interactive desktop gesture. The capture-phase full-window pointer handler was verified structurally and exercised without console errors.

`UPDATE_ROADMAP.md` could not be safely appended because the existing file is not valid UTF-8, so this append-only verification note records the shipment instead.
