# Fresh-character combat and progression readiness

Baseline: d260c6d9 / v2.198.0. Authorization: continue the announced campaign readiness pass.

## Grounded scope

- Tutorial kill counting explicitly grants rank 2 on the third kill. Test the real basic-attack and skill path for Warrior, Ranger and Mage at normal starting health and equipment. Record character/class progress per kill and successful completion into the hub. Test death/early return/reload with earned progress retained.
- Class choices currently depend on a queued numeric rank; the queue is not tied to a character/class and is not rebuilt after reload. Investigate interrupted and multi-rank choices, including skill tutorial delivery, before changing anything.
- Campaign enemies and rewards use region scaling and separate character/class XP multipliers. Sample actual attacks, return hits and drops with ordinary gear; do not tune global difficulty from staged tests alone.
- Previous rendered evidence shows simultaneous centered boss lore and tactical messages on Brute activation. Consolidate presentation so health and attack warnings remain legible. Preserve canonical information and journal access.

## Execution and failure checks

1. Build local visible test controls, exercise baseline behavior, save genuine pre-change fixtures and capture specific failures.
2. Correct only demonstrated combat/progression/readability defects. No map geometry, story outcome, custom SFX or unrelated asset edits.
3. Repeat failed paths, inspect actual rendered UI, test earned XP/gold/choices through save/reload, and test co-op handlers where shared combat is affected.
4. Run appropriate existing regression suites, version, publish to main and verify production.

## Evidence limits

Combat samples may stage positions to isolate a foe, but must keep normal HP, gear, enemy health and attack timings. Distinguish real damage from staged reward assertions. These tests do not establish a full fresh campaign completion, novice comprehension, fun, Internet co-op quality or low-end hardware performance.

## Implementation and verification

Implemented the reproduced choice, lesson, retry-health and boss-message defects. All three starter tutorials, 24 regional damage exchanges, old-save transitions and eight local co-op assertions pass. Exact evidence, fixture corrections and limits are in `../art-validation/fresh-progression-20261014/summary.json`. No difficulty adjustment is inferred from these staged checks. Deployment pending.

## Deployment

Published e4039768 to main. Cloudflare succeeded and the real production browser confirms v2.199.0 with no warnings/errors. See deployment.json and production-browser.json in the evidence directory.
