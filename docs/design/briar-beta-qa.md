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
