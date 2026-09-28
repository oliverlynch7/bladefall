# Campaign audit — build 2.050.0

User suspects difficulty is slightly too easy. This report is a diagnostic pass, not a completed fresh-save campaign playthrough. No balance settings changed.

## Verified findings
- 61 scripted objective-state/navigation transitions passed. These set story flags; they do not independently solve each quest.
- Enemy movement/attack checks passed in 15 campaign halves (Briar's opening excluded by the existing fixture). Other enemies were stunned and the player given large HP. This proves basic pressure exists, not that full encounters are balanced.
- Base grunt damage was 8.496 in every region; base caster damage was 10.62. Grunt health increased from 20 in Briar to 50 in Duskmoor. Named elites receive additional modifiers.
- Code confirms normal enemies receive stage health scaling but not stage damage scaling. Player level adds 13 maximum HP each level, before equipment/perks. Thus the same ordinary hit becomes less costly as the campaign progresses. This is a concrete contributor to perceived ease, not proof that every fight is too easy.
- Sampled starting populations are often only 9–16 enemies per half after Briar. Some areas add waves or refill designated slots, so these are not total encounter counts. Large maps may have low combat density; this needs timed route sampling.
- The Hydra has an eight-second recovery/exposure window, unusually generous beside its 1.6–2-second windups. That window also provides travel time to the correct restraint; shortening it without travel tests could punish melee classes unfairly.

## Remaining puzzle repetition
Serialized mechanic counts: {"sequence": 14, "counterweight": 7, "waterworks": 1, "flowSwitch": 1, "rotatePuzzle": 1, "balanceBeam": 1, "linkedRotate": 1}. These are implementation categories, not distinct player experiences: palace mirrors reuse counterweight state; furnace and Iron Halls add physical/timing rules on sequences; ship/cliff codes are seeded at runtime; the Thunder route sequence is a race. Clear repetition candidates remain the Thunder tide stones, Furnace cache and pet controls, Snowbound camp pattern, and Library display pattern.

## Recommended next balance experiment
Keep Briar and beginner trials unchanged. Test a small progressive ordinary-enemy damage increase in later campaign regions, paired with encounter composition and recovery-window checks. Do not apply boss scaling wholesale to normal troops, add health across the board, or change PvP/Descent/trials. Compare the same rank/gear/player level in identical seeded encounters with and without dodging. Include Warrior and Ranger, a fresh-save progression run and co-op before claiming improved overall difficulty.

## Pacing limitations
The reward inventory lists raw starting-enemy XP and an older estimated combat-bonus column. It is not a total XP forecast: quests, repeated hunting, boss-specific payouts and route choice need accounting. Do not derive an XP rebalance from this table. Full completion times, natural gear acquisition, deaths and subjective puzzle difficulty remain unmeasured.

Evidence: docs/qa/campaign-audit-2026-09-27.json; scripts/qa-campaign-damage-audit.cjs plus existing reward-budget/navigation/refinement-combat probes.
