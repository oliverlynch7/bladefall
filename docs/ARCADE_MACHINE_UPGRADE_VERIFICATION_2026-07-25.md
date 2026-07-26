# Arcade Machine Upgrade — Preview Verification

Branch: `bladefall-autopilot`
Version: `1.379.0-autopilot`
Scope: approved purchasable Waystation arcade upgrade; no embedded Isaac build yet.

## Implemented

- Quartermaster row stays hidden until Normal has been cleared.
- The permanent purchase costs exactly 100,000 gold.
- Ownership is stored in the global profile and shared across characters/difficulties.
- Legacy per-mode prototype flags migrate to global ownership.
- Duplicate purchase is impossible and the row becomes `OWNED`.
- Purchase rebuilds the current Waystation immediately so the cabinet appears without a reload.
- A grounded, collidable voxel cabinet and dedicated activity-annex pad sit opposite the Gauntlet, beside the Arena.
- The cabinet has a nearby projected label and normal `E` interaction.
- Interaction freezes game audio/UI and opens a polished Coming Soon screen; Leave restores the Waystation.

## Deferred dependency

Isaac's public URL or exported web build has not been supplied. The future embed must be inspected for iframe/CSP, input, audio, pause, and save-isolation behavior before replacing the Coming Soon panel.

## Acceptance checks

- [x] Browser: pre-clear shop row absent.
- [x] Browser: post-Normal row visible under and at 100,000 gold.
- [x] Browser: purchase deducts exactly 100,000 gold (100,000 → 0); 99,999 is rejected.
- [x] Browser: cabinet appears immediately and row reads `OWNED`.
- [x] Browser: ownership survives reload and a different mode/save.
- [x] Browser: grounded cabinet has walkable floor and one matching collision volume; Coming Soon and Leave restore play/HUD.
- [x] Browser: muted run and zero unexpected console errors after clean reload. (The harness produced one expected pointer-lock rejection when automating a UI click before reload.)

Verified at 1920×1080. Screenshot: `output/playwright/arcade-coming-soon.png` (local QA artifact, not shipped).
