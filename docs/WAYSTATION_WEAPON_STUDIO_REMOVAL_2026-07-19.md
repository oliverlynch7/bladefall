# Waystation Weapon Studio Removal — 2026-07-19

## [Codex | 2026-07-19]

Shipped in `VERSION3D 1.185.0`:

- Removed the Weapon Studio card from the Waystation menu.
- Removed its menu click binding.
- Preserved the underlying studio implementation to avoid unnecessary system or save churn.
- Muted browser QA confirmed six remaining keeper cards, no Weapon Studio text/button, and zero console errors or warnings.

`UPDATE_ROADMAP.md` remains unsafe to patch because its existing bytes are not valid UTF-8, so this append-only note records the shipment.
