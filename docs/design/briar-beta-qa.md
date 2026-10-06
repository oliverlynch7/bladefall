# Briar beta verification — 2.115.0

October 5, 2026. Isolated solo two-chapter replacement candidate. See [plan](briar-beta-plan.md), [machine results](briar-beta-evidence/results.json), and public `/design/briar-beta/` maps.

## Verified

- `qa-briar-beta-flow.cjs`: 33 physics jumps (19 required, 14 optional), chapter transition, medical delivery, five shards, signal and rescues. Individual jump starts positioned directly; not natural discovery or difficulty evidence.
- `qa-briar-beta-walk.cjs`: continuous movement/attack/skill-input route from spawn to transport order; no position or quest-flag assignments. Exploration invulnerability enabled. 5,884 frames, about 98 simulated seconds, zero recovery falls. Optimized automated route, NOT expected human playtime or combat-balance evidence.
- `qa-briar-beta-recovery.cjs`: failed release without weight; plate activation/release; crate reset; real strike-volume civilian damage once per attack; blocked strikes; defense loss/retry; fall return; two-active patrol cap; six-kill cap; single reward. State fixtures isolate these conditions.
- `qa-briar-beta-combat.cjs`: reused pike/guard/hound/maw dealt and received damage through combat; controlled fixture damage, not standard-loadout balance.
- `qa-briar-beta-classes.cjs`: 17 classes rank10/level30/legendary, four skill slots and basic attack; no script errors/nonfinite state. Smoke test only.
- `qa-briar-beta-isolation.cjs`: full real-storage key/value equality across beta entry, persist, retry, reset and return. Captures at document start to exclude normal-title initialization writes.
- `qa-briar-beta-old-save.cjs`: fresh browser context creates valid 17-class save using pre-change index, then compares name/gold/classes/unlocks after new load. Passed. Initial failure diagnosed: older fixture had no starter unlock (`{}`), normal loading added `{warrior:true}`. Fixture corrected to include valid starter unlock. No persistence code changed to conceal the difference.
- Existing Keep beta flow: lift, six jumps, three-prisoner rescue still complete.
- Presentation: 390px plan/setup no horizontal overflow; selected viewpoints in shoulder/overhead/first-person, both chapters, no page errors. Not exhaustive camera coverage. Fixed test fixture's stale interaction by updating interaction after positioning.
- Syntax gate passed (69 pre-existing duplicate names).

## Visual evidence

[Keyboard crate interaction](briar-beta-evidence/briar-sluice-final.webm): E/A/W/D, deliberate misplacement, release, correction, sustained plate weight. Starts at crate in normal overhead camera; initial idle retained. Not whole-level footage. [Mechanism frame](briar-beta-evidence/briar-mill-after.png), [Homefields](briar-beta-evidence/briar-home-shoulder.png), [Black Woods](briar-beta-evidence/briar-woods-shoulder.png).

Fixed static geometry painting over moving mechanisms by correcting deferred rendering. Shortened two optional canopy gaps after physics failures. Moved wheel into water channel. Reduced signs and added scaffold braces. Recording precedes those cosmetic sign/brace changes; interaction geometry unchanged.

## Limits

Layout, quests, physical mechanism, defense, optional loops and traversal implemented. Art remains an initial low-poly pass: simplified grounds, dogs and work structures. Existing enemy behaviors reused, not bespoke new AI/animations. Not every visual detail has production collision polish. No controller-hardware, co-op or long-session performance certification. XP frozen; reload discards beta progress.

Human testing still needed for enjoyment, blind navigation, reading burden, jump forgiveness, standard difficulty and whether both halves feel substantial enough. Do not promote to main portal or duplicate formula before Oliver approves. Passing scripts do not prove fun.

Old-save reproduction: save the pre-change committed index as `public/3d/_qa-prechange.html`, run localhost4338, execute CLI script, remove fixture. Other scripts also use Playwright CLI run-code.


## [Codex | 2026-10-06] 2.120.0-briar-ground
First full-scale terrain/layout pass in isolated Briar beta: endpoints now -4250 Homefields/-4620 Woods, curving orchard/farm escape and northern woodland. Shared triangulated hills drive render, player support, enemy support and dropped-object grounding. Approved mill geometry unchanged. Existing complete Nature Kit trees reused in authored rows/edges (bare Blender trunk rejected after visual inspection); existing campaign soldier/sentinel/thornboar models reused over beta telegraphed combat. Escort has individual villager HP, four distance-triggered ambushes, proximity waiting, and retry. Added four optional bank-route jumps; localized patrol contract now twelve kills with two-active cap.
Normal campaign now retains XP/levels/stat allocation, class ranks/choices, gold and completed return requests on death/retry/early hub/reload. Shepherd rescue available without clearing the half. Runtime checkpoint identity prevents stale worlds overwriting another save. Unsecured gear/Rift Shards retain prior completion rules; permadeath and separate trial/Prison Break contracts unchanged.
Validation: continuous expanded beta input walk completed both parts with no falls (invulnerable QA, not human difficulty); six optional route jumps after fixing one unreachable gap; actual escort strike, blocked/duplicate damage, failure/retry, crate reset, capped hunt and reward-once; campaign storage isolation, previous-version 17-class save; earnings across retry/hub/reload and eight two-page co-op handler checks including independent rewards/restart/disconnect/permadeath. Screenshots inspected for reused models, slope/path visibility. Syntax gate passed.
NOT COMPLETE: this is the first terrain pass, not the final five-step remake. Expanded areas still need richer purposeful district dressing, stronger optional route variety, distinct hold-area/class-opponent activities, and full normal-camera animation/error/recovery review of new encounters. Flat original village/forest workspaces remain; do not describe every map tile as rebuilt. Enemy mechanics still use beta combat timing, not a complete native campaign behavior transplant. Physical co-op and human fun/balance unverified. Main campaign maps untouched. Next: enrich district layout/activities without empty filler, preserve mill, then finish visual QA and request human beta playtest before any main portal replacement.
