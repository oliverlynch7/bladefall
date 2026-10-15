# Campaign combat and boss readiness

Baseline: 969ce1a9. The completed journey pass verified routes and mechanisms, frequently with enemies disabled/invulnerable players. Existing qa-natural-combat and specialist checks use 5,000–100,000 HP or forced damage; retain their useful narrow contracts but do not call them ordinary combat playthroughs.

## Plan

1. Inspect all eight campaign arena builders and actual damage/update paths: Brute, Marksman, Fallen, Officers, Ember Colossus, Hydra, Marble Colossus, final King. Build an isolated local visible fixture with ordinary Warrior/Ranger/Mage stats and legal gear. Stage encounter entry explicitly; do not label it a fresh campaign run.
2. Record natural activity, first hit and basic-attack reach with real health. Test each special damage window and safe alternative: dodge/cover/movement, cooling, deflection and chain release. Inspect normal-camera screenshots and continuous attack sequences. Diagnose failures before modifying timing/balance.
3. Fix reproduced gameplay/presentation defects with shared rules where appropriate, preserving other modes. Add regression tests for behavioral failure cases. Verify death/retry/quit, reward idempotence, prior-version saves and real host/guest handlers for affected behavior.
4. Run relevant existing regressions and source checks. Record coverage and remaining limits accurately. Publish versioned changes with deployment verification. Full fresh-character campaign progression and public-network/hardware performance remain distinct from this staged encounter pass unless actually exercised.

Do not alter level geometry without the required blueprint update. Keep trial difficulty, story reveal/ending, earned XP/gold retention, chest behavior and unrelated companion/rig edits intact.

## Outcome

The scoped boss pass is implemented and tested. See `../art-validation/combat-readiness-20261014/summary.json` for exact evidence, fixture corrections and exclusions. Core encounter damage, targeting, arrival, retry, reward and story gates were covered. Visual observation focused on the Brute and Hydra; broad camera/performance certification and a full campaign combat playthrough remain separate work.
