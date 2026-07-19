# BLADEFALL v1.126.0 balance and completability audit

Run: `1.126.0-2026-07-19T06-11-56-514Z.json` (full configuration: four classes, eight zones, three Descent trials, twelve-floor ceiling).

## Confirmed results

- All 24 quest objectives across both areas of all eight zones completed through the exported objective API. Every boss spawned.
- The stationary representative-loadout sample recorded no class deaths across the eight opening areas. Maximum sampled HP loss was Warrior 51, Ranger 28, Mage 7, Reaper 0. This is a coarse bot profile, not an organic traversal clear.
- Common-weapon theoretical DPS spans 29.412–50 (1.70x). Knives and Stormrod lead at 50; Greatsword is lowest at 29.412. Charged/combo on-hit and off-class readings remain too RNG- and timing-sensitive for direct tuning.
- All seven level-up upgrades mutate a live combat state. Second Wind is situationally dead only at full HP; no permanently dead upgrade was found.
- Reward gates are internally coherent: rarity unlocks at levels 1/4/9/15/22, zone tiers cap rarity, Descent XP/gold rises 14% per floor, caches occur every third floor, shrines every fifth, and hoards every sixth.
- Difficulty curves are monotonic in source: normal zones add 22% per tier plus 5% in area two; Descent adds 16% HP and 10% damage per floor, with faster cadence and rising concurrent counts.

## Objective harness corrections

The audit found and corrected driver defects without changing the game file:

- combat samples no longer zero enemy damage;
- charged weapons now release their attacks in combat bots;
- boss checks target the boss instead of the first surviving add;
- Descent no longer revives inside the death loop;
- damage taken uses minimum observed HP and cannot become negative;
- floor reached counts cleared floors rather than the last attempted floor;
- Descent telemetry now records death and step-limit termination explicitly.

## Limits and subjective tuning opportunities for Oliver

- The corrected boss bot kills the first four bosses with a legendary Greatsword, but dies against Emberdeep through Castle Duskmoor. That demonstrates a late-game difficulty step for a stationary bot, not an objective boss-completability failure; deciding whether to soften it is subjective.
- Descent produced one verified Floor 1 clear with the rare Greatsword and two modal/step-limit stalls. The fresh Common Sword did not verify a clear. A supported non-UI overlay resolver and seeded RNG are still required for a trustworthy multi-floor distribution.
- The 1.70x weapon spread may be intentional because charge, multi-hit, range, status, and safety are not captured by theoretical DPS. Knives/Stormrod and Greatsword are candidates for human feel-testing, not automatic numerical changes.
- Reward pacing is structurally consistent, but whether +14% per Descent floor and the 3/5/6 reward cadence feel generous enough remains a player-experience call.

## Shipping decision

No game balance values were changed. The run confirmed no objective quest wiring bug, permanently dead upgrade, non-monotonic progression scalar, or low-risk numerical correction strong enough to justify a production balance patch.
