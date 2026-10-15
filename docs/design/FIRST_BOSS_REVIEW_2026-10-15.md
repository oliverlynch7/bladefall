# First boss and equipment review

User approval U-FIRST-BOSS-20261015: "Go ahead with that next review". This accepts the proposed review of the Brute and early equipment after the continuous first-session run. Baseline: 3b972f6b, v2.201.0. Preserve the genuine level-2 / rank-3 Warrior save in first-session-20261015/return-after-boss.json. Keep unrelated companion/rig edits untouched.

## Source-grounded plan

- Separate automated input limits from encounter defects. Inspect and measure warning duration, charge direction lock, actual collision/damage, jumpable ground waves, stagger/recovery safety, finite handlers, retry and exit. Run the actual game in a browser with ordinary earned stats; label staged placement and scripted input explicitly. Never call boosted-health or disabled-enemy probes a balance test.
- Review all three starter weapons, affordable shop alternatives, rarity gates, early armor sources and reward discovery. The actual common shop weapon uses 82% base damage while the free starter uses 88%: the first purchasable same-family weapon is a downgrade. Correct this bounded progression mismatch while keeping looted equivalents stronger and higher rarity costs/gates intact. Test all regular class stock and existing transactions/saves.
- The main Briar route has no guaranteed equipment reward; ordinary foes have a 5.3% gear-drop chance and current optional rewards include coins. Assess this against real combat results before changing drop rates or adding rewards. Favor a small, visible, reliable preparation opportunity over global loot inflation if needed.
- Improve concise pre-fight/attack advice only where it matches tested mechanics. Preserve campaign story and geography, tutorial difficulty, existing equipment choices and co-op HP-only scaling. No custom SFX.
- Verify genuine prior-save loading, failed/retried fights, successful encounter completion if achievable with normal stats, and relevant shared multiplayer paths. Keep human novice difficulty/fun and Internet latency separate from source/automated evidence.

## Acceptance

The first paid common weapon must improve on the corresponding free starter, remain below an ordinary common drop, and not silently alter owned equipment. Boss warnings must match hit geometry and allow the taught response; stagger windows must be safe to use. Any added reward must be usable at its earned level, optional to equip, protected against duplicate/full-bag/save/co-op loss, and require the actual quest completion. Publish only after real-browser verification and versioned save checks.

## Findings and bounded implementation

Browser baseline confirms all three paid common starter-family weapons are downgrades (Warrior 10.6 to 9.8; Ranger 7.9 to 7.4; Mage 17.6 to 16.4). Use 96% base for common shop stock, retaining 82% for higher rarities. Existing owned weapons stay unchanged.

All 15 isolated response probes pass: ordinary contact during stagger is harmless, all three classes can damage the staggered boss, standing in the ground wave hurts, and a timed jump or dodge avoids it. The earned Warrior defeats the complete encounter in roughly 23 simulated seconds with scripted reaction input. Initial ranged probes aim the camera in a fixed direction, so their outcomes must not be used to rebalance ranged classes. No boss-stat, loot-rate or guaranteed-reward changes are warranted by these tests.

The current charge indicator consists of 18-unit dots, although the boss has a 44-unit radius; it also continues through the carts that stop the charge. Draw the full 88-unit body corridor and clip it at the first actual impact target using the encounter's same travel/collision rules. Mark that stopping target. Add one short attack/recovery cue beneath the existing boss health bar, using current input bindings; hide it for other bosses. Give a cause-specific retry hint and name the ground wave correctly. Expand the existing entry advice to explain the cover/stagger response directly. Do not add a new modal or inflate the main quest rewards.

## Verification outcome

Corrected an actual early-shop downgrade: common stock is now 96% base damage versus the free starter's 88%, while ordinary common drops remain stronger. Starter-family comparisons are Warrior 10.6 -> 11.5, Ranger 7.9 -> 8.6, Mage 17.6 -> 19.2. Cost remains 60 gold; higher rarity power/gates and already-owned equipment stay intact.

The Brute now shows its full charge-body corridor, clipped at the first blocking cart/stone, plus one short attack/recovery cue with the player's current bindings. Ground-wave deaths name the attack and offer a short retry hint. Area changes clear this advice, including the Hydra's separate boss HUD. No boss-stat, timing, loot-rate, story, geography or SFX changes.

Real-browser review: 15 isolated damage/recovery checks, an unmodified real-time charge from a staged position into cover, purchase/actual reload, retained level-2/rank-3/270-gold retry, and 11 local host/guest warning checks pass. Corrected camera-aimed scripted fights clear the full encounter and handlers with all three starter classes (23/50/34 simulated seconds). The genuine Warrior save is preserved; alternate classes are representative staged builds. These perfect-state-reading probes are not human novice difficulty or pacing tests. Normal earned level-up healing remains active.

Production logic checks cover 15 stock families, 22 loot transactions, 146 boss-combat scope cases, existing Brute behavior, 28 swept-preview/frame-rate cases, bindings and syntax. See docs/art-validation/first-boss-20261015/summary.json and docs/design/FIRST_BOSS_REVIEW_2026-10-15.md. Initial fixed-camera, inactive-boss and artificial-stun fixture mistakes are recorded separately from product findings. Internet latency, target-device performance and novice fun remain unverified. Unrelated companion3d.js/articulated-rigs.json changes remain untouched. Ready for publication; deployment confirmation follows.
