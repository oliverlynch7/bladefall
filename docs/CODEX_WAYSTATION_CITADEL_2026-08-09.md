# Waystation Citadel preview verification

Version: `1.903.0-hub-citadel-autopilot`

- Re-authored the Waystation as a 1,840 x 1,540 continuous citadel instead of preserving the cramped legacy ring.
- Established a direct arrival-to-campaign axis, an eight-gate campaign cloister, Market Lane, Warden Court, and a separate activity undercroft.
- Preserved all keeper, gate, unlock, save, and activity behavior while relocating services into readable districts.
- Added district paving, benches, lanterns, banners, trees, activity arches, curated kit props, and a restrained castle shell built from existing free assets.
- Added `?hub=legacy` as an A/B escape hatch on the preview deployment. The Citadel remains preview-only until Oliver approves promotion.

Browser QA:

- Citadel schema and all 14 required interactables verified.
- Eight main campaign gates verified.
- 3D build completed with zero missing modular-building pieces at 1920x1080 and 1366x768.
- The only page exception was the expected headless-browser pointer-lock denial.

`UPDATE_ROADMAP.md` was not modified because the checked-out file contains non-UTF-8 bytes and cannot be safely patched without a separate encoding migration.
