# Enemy Surface Placement Verification — 2026-07-19

## [Codex | 2026-07-19]

Shipped in `VERSION3D 1.182.0`:

- Ground enemies now initialize on the highest walkable surface beneath their authored spawn footprint.
- End-of-build placement catches enemies created before their destination platform or plateau was added.
- Runtime/dynamic spawns use the same resolver.
- Enemies already standing on tall structures retain that structure as support without gaining the ability to climb the same structure from below.
- Elevated crumble platforms and standable wall tops are recognized as enemy support.

## Browser QA

- Muted real-browser test on **Abyss Approach**: all 16 ground enemies matched their intended support heights across the 0, 120, 250, and 390 elevation bands.
- After 180 simulation frames: 0 enemies below their supporting surface.
- All eight Main Level entrances tested for 60 frames each: 81 elevated ground enemies, 0 below support.
- Browser console: 0 errors, 0 warnings.
- JavaScript syntax and `git diff --check`: passed.

`UPDATE_ROADMAP.md` remains unsafe to modify with the patch workflow because its existing bytes are not valid UTF-8, so this append-only verification note records the shipment.
