# Sustained farming audit - 2.361.0

## Result

Keep the five-enemy/six-second pacing, existing enemy stats, mana rules, hunt quotas and reward amounts. Fix the reproduced guest reward-loss window and immediate persistence of shared hunt progress. No terrain, story, paid audio, character build or save-schema changes.

A guest hunt claim previously produced live gold360 but saved gold100, with the paid receipt already saved. Hunt and legacy combat-task gold now enter the same earnings commit as their claim/XP. Accepted/partial/finished hunt packet state is persisted when its small quest/count/round stamp changes. Duplicate packets and unrelated conversation revisions do not write the hunt again.

## Actual combat and economy measurements

baseline.json contains all16 native camp rosters, fixed encounter HP/damage/XP, hunt payouts, NPC distance and mean-mix quota rewards. Reward estimates include kill gold/XP and one hand-in, exclude gold-find perks, random chest gold/gear, slime offspring and travel time. These are not measured gold/XP per minute and do not justify an exact affordability claim. All16 quota rewards rise through the campaign. The early quota is about210gold/550characterXP; final about1195gold/2789XP. The1000gold chess table is roughly five early quotas before other sources; the20000gold class-switch seal is an extended goal. Do not equate this with a stopwatch estimate.

Three ~40-second staged Keep pilots use level6/rank4, uncommon class-appropriate weapons, basic attacks with charge releases, skill1, normal collision/AI and an automated dodge/steering policy. No lethal damage, stun, invulnerability or HP-reset cheats in these pilots. Warrior:13total kills/12hunt counts,12casts, minimum33.1/75mana,151killgold (~229killgold/min excluding turn-in); Ranger:4/3,8casts, minimum52.3/90mana,47killgold; Mage:8/7,18casts, minimum~0/140mana,87killgold. The AI has imperfect ranged aim/navigation and reacts mechanically to warnings. These are diagnostic bot outcomes, not balanced class DPS benchmarks or human difficulty/fun evidence. Earlier helper attempts used an unavailable staff identifier/closure-local globals and held charge attacks indefinitely; those were helper errors, corrected before the recorded pilots. Do not tune classes from those failures.

stationary-pressure.json: same staged Keep warrior without attacks/dodges first took damage at3.1s and died at11.78s from165HP. This confirms meaningful camp danger and avoidable, noninstant arrival pressure, not novice survivability. The earlier active bot avoided damage; do not infer that a human never needs healing. No blanket difficulty/mana/reward increase was warranted by this limited evidence. A longer late-game human farming/return-trip test remains useful.

## Co-op and persistence verification

- guest-after.json: real native story packet application, independent serialized packets, isolated storage. Offer acceptance immediately saved; count7 immediately saved; unchanged packet0writes. Reward gold360/claim/receipt all saved together. Repeat packet0extra writes and no duplicate reward. Actual continue retained the gold, round1 and five slots.
- network.json: TWO actual independently loaded Chrome clients connected through the existing PeerJS/WebRTC room, with isolated in-memory storage. Same Keep scene/run and five-slot camp; existing1.6HP multiplier applied to initial and refilled enemies. Real host dialogue acceptance reached and saved on the guest. Three diagnostic lethal/refill waves reached shared counts5,10,12, including saved guest12. Host's real turn-in button paid +260gold to EACH client, saved immediately on both, with one shared receipt naming both recipients. Guest disconnected and continued solo:1415gold, completed round1/claim retained, next offer available.
- The accelerated refill waves explicitly advanced the clock before sending their transient kill events, so those waves validate quest counts/spawn scaling, not guest kill XP. Separate immediate network kill: raw XP13 -> fixed-world XP18; guest gained30characterXP,58classXP,10gold exactly once. No reward multiplier from party HP. Immediate host snapshot after guest.leave was captured before the asynchronous close event; it is not a disconnect-scaling timing test.
- Staged network positions, lethal diagnostic damage and explicit refill-clock changes were used for lifecycle coverage. This is a real same-machine two-client network test, not two remote human players, latency testing, a full normal-combat co-op run or a whole campaign playthrough. Tests never touched primary production saves. Native consoles captured no warnings/errors after the patched reload.

## Regression coverage

scripts/test-campaign-farming.cjs runs the actual extracted story/gain-XP handlers:93 atomic receipt/gold, shared progress, duplicate/stale/wrong-epoch packet, save stamp and legacy-task checks. Existing compatibility fixture now loads the actual Hunts dependency. Hunts2583checks (three rounds/all16 sections), compatibility33, replay103, mana537, hub-recovery257, combat-progression135, formations37, refinement/56clues and party-transitions58+7 passed; inline source parses. A mistakenly named test-campaign-recovery file does not exist; the actual replay/hub-recovery suites were used. No failures hidden as successful checks.

## Expected mean-mix quota rewards

| Section | Mean-mix gold per quota | Character XP per quota |
|---|---:|---:|
| 0.0 | 210 | 550 |
| 0.1 | 250 | 625 |
| 1.0 | 344 | 842 |
| 1.1 | 378 | 916 |
| 2.0 | 414 | 959 |
| 2.1 | 448 | 1038 |
| 3.0 | 527 | 1198 |
| 3.1 | 542 | 1217 |
| 4.0 | 599 | 1325 |
| 4.1 | 641 | 1403 |
| 5.0 | 755 | 1684 |
| 5.1 | 815 | 1831 |
| 6.0 | 852 | 1875 |
| 6.1 | 891 | 1951 |
| 7.0 | 1033 | 2324 |
| 7.1 | 1195 | 2789 |

## Published verification

Game597a49eb / mirror85040631. Cloudflare88fbab72 completed successfully. public-hashes.json verifies both changed public resources on deployment and production against committed SHA256. public-native.json repeats guest acceptance/partial-count/atomic-gold/duplicate/reload checks on the deployed real WebGL game, with no console warnings/errors. Public handler probe uses a unique deployment origin; primary production saves untouched. Real two-client network checks were performed locally as documented above.
