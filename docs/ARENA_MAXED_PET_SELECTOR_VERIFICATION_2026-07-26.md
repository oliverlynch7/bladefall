# Arena Maxed Pet Selector Verification — 2026-07-26

Branch: `bladefall-autopilot`

Build: `1.390.0-autopilot`

## Shipped behavior

- Added a Companion section to the Arena/PvP loadout menu.
- Players can choose any of the six pets or choose **No Pet**.
- Every Arena companion is temporarily owned and fully trained at 5/5.
- Pet level scaling follows the selected Arena character level.
- Changing the companion and pressing Apply Loadout immediately rebuilds the Arena
  with the newly selected pet.
- Pet ownership, active pet, custom names, and training are included in the Arena
  backup and restored exactly on exit.
- Selecting a pet before entering the Arena changes only `ARENA_LOADOUT`, so campaign
  pet data is not mutated while browsing the menu.

## Verification

- Extracted JavaScript syntax check passed.
- `git diff --check` passed.
- Real Chromium at 1600×900:
  - seven options rendered: No Pet plus six companions;
  - every pet card displayed MAX 5/5;
  - selecting Grave Wraith before entry left campaign pet data unchanged;
  - Arena entry granted all six temporary pets at training 5/5;
  - Grave Wraith spawned with full runtime HP;
  - switching to Mending Sprite and applying rebuilt the Arena with that pet;
  - No Pet produced no active or runtime companion;
  - leaving restored the original campaign pet state byte-for-byte;
  - zero console and page errors.
