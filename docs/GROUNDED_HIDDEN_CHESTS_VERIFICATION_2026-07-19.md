# Grounded and Hidden Chests Verification — 2026-07-19

## [Codex | 2026-07-19]

Shipped in `VERSION3D 1.184.0`:

- Chest height reconciliation now seats chests at the exact highest supporting surface, allowing incorrect heights to move downward as well as upward.
- Unsupported authored coordinates relocate to the nearest safe surface instead of leaving a chest suspended over empty space.
- Runtime reconciliation prevents later terrain/platform state changes from leaving unopened chests floating.
- Campaign chests outside the Outskirts receive asymmetric, zone-themed concealment such as ruined stone, ice shards, basalt, and void pillars.
- The approved Outskirts chest routes remain unchanged, including the farmhouse/tree concealment and upgrade-gated revisit route.
- Treasure Sprint, Abyssal Descent, hub, and Trial Chamber presentation are not given the campaign concealment treatment.

## Browser QA

- Muted real-browser audit of all 16 Main Level areas and all seven Trial Chambers.
- 52 authored chests checked for horizontal support and exact vertical contact.
- Unsupported or vertically mismatched chests: **0**.
- Forced-height regression: a chest raised 200 world units snapped back to its supporting surface on the next simulation frame.
- Visual review: Abyss Approach chest is grounded and partially concealed behind its local void-stone/crystal landmark.
- Browser console: 0 errors, 0 warnings.
- JavaScript syntax and `git diff --check`: passed.

`UPDATE_ROADMAP.md` still contains invalid UTF-8 bytes, so this append-only verification note records the shipment without rewriting that historical file.
