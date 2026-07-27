# Arena Random Respec Verification — 2026-07-26

Branch: `bladefall-autopilot`

Build: `1.389.0-autopilot`

## Shipped behavior

- Added **Random Respec** to the Arena/PvP loadout menu.
- The roll is class-aware and chooses one of the two options at all eight class
  decision ranks: four skills and four passives.
- Each class keeps its latest temporary random roll while browsing other classes.
- The highlighted check mark confirms that the selected class has a queued build.
- Enter Arena / Apply Loadout installs the queued build on the temporary arena hero.
- Manual Free Respec takes control again and clears the queued random override.
- The random build is stored only in `ARENA_LOADOUT`; it does not touch campaign
  class records before entry and the arena backup restores those records on exit.

## Verification

- Extracted JavaScript: syntax check passed.
- `git diff --check` passed.
- Real Chromium at 1600×900:
  - button rendered with the selected class name;
  - one roll produced eight valid Beastmaster choices;
  - a repeated roll produced a different build;
  - campaign class data was byte-for-byte unchanged before arena entry;
  - the queued build was applied after entering the arena;
  - campaign class data was restored byte-for-byte after leaving;
  - all 16 classes produced four randomized skill choices and four randomized
    passive choices;
  - zero console or page errors.
