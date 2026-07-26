# Beastmaster Preview Verification — 2026-07-25

## Build

- Version: `1.378.0-autopilot`
- Branch: `bladefall-autopilot`
- Scope: additive CLASS2 Beastmaster implementation; no existing class balance changed.

## Implemented

- Rank 1 Bonded Companion innate.
- Rank 2–9: eight one-of-two skill/passive choices.
- Rank 10 One Pack capstone.
- Bow, javelin, and battle axe weapon families.
- Eight active commands and eight build passives.
- Existing equipped-pet preservation and a save-neutral fallback companion.
- Pet scaling, vertical catch-up, command marks, healing links, interception, Apex state, and once-per-level death protection.

## Browser QA

- Muted local Chromium load: passed.
- Full A-side build: all four skills cast and produced their expected combat state.
- Full B-side build: all four skills cast and produced their expected combat state.
- No-pet fallback spawned without changing `meta.petActive`.
- Equipped Stone Whelp remained the selected pet.
- One Pack stopped the first lethal pet hit at 1 HP with shield/invulnerability; the second lethal hit removed the pet for the level.
- Beastmaster class tree rendered correctly.
- Browser console errors: 0.
- JavaScript syntax: passed.
- `git diff --check`: passed.

## Art Hook Status

The class and abilities currently use readable temporary glyphs. The finished Beastmaster raster art was not present in Downloads or in the latest rendered portion of the existing Chrome “Bladefall icons” conversation. Asset hooks are isolated so approved art can replace the glyphs without changing gameplay.
