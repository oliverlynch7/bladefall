# Class audit — October 3, 2026

Build: `2.093.0-class-audit`. Scope: actual skills/passives, healing, damage, cooldowns, and enemy/PvP consistency. Existing choice IDs and save format remain intact. No SFX or visual redesign.

## Confirmed fixes

- Failed/no-target casts no longer grant Warrior capstone healing, Mage shields, cast-count rewards, or echoes. Refunds restore the original resource payment, including Reaper's stored free cast.
- Beastmaster cannot reset its companion's attack timer by pressing a skill during cooldown or without enough mana.
- Mage Attunement only advances on an accepted skill attempt and uses a temporary spell weapon copy. It cannot permanently overwrite the equipped item's element or change it through cooldown spam.
- Mage Spell Echo uses 35% of the original skill's damage multiplier, including rapid skills with reduced per-cast damage. Its description distinguishes damage from utility effects.
- Chronomancer's delayed projectile echoes retain the skill-hit marker used by rune/corruption reactions. Both echo paths restore the previous combat context afterward.
- Warlock Life Drain and Paladin holy-weapon healing use damage actually removed from enemy health. Blocked hits and excess overkill do not generate healing. PvP healing waits for the damage receipt and cannot trigger twice from a duplicate receipt.
- PvP marks, Warlock curses, and Beastmaster marks count down once, rather than twice, each frame.
- Paladin Burning Light can spread to nearby hostile players, rather than only enemy NPCs.
- Bone Legion's normal skeleton damage now increases by its stated 20%, matching the other summon types; previously it increased about 31%. The extra skeleton remains.
- Berserk/Blade Fury descriptions accurately state 35% damage and 30% attack speed. Deep Curse states the total cursed-target bonus rises from 15% to 30%. These wording changes preserve existing balance.

## Coverage and repeatable checks

- `scripts/audit-class-catalog.mjs`: reads all 17 classes, 136 skill options, and 136 passive options, including Pyromancer's JSON-formatted entries. Every passive has a direct code reader. This is an inventory check, not proof of every conditional behavior.
- `scripts/qa-class-runtime.cjs`: real Chrome, all 136 skills, both sides of all choices, rank-10 builds, multiple targets, seven seconds of simulated updates, rendering and hero-renderer flushes. Real-time burst callbacks run before changing the tested hero. Checks cast success, finite state, renderer health, and page errors. It does not assert that every damage amount or utility effect is balanced.
- `scripts/qa-class-audit-regressions.cjs`: focused assertions for failed casts, mana/cooldown gating, echo scaling and skill markers, temporary elements, healing amounts, blocked hits, duplicate PvP receipts, status durations, summon bonuses, and several passive stat multipliers.
- Existing `qa-class-choices.cjs`, `qa-class-healing-pvp.cjs`, and `qa-pyromancer-pvp.cjs` retain their earlier coverage. Run localhost copies with port 4338 substituted for 4331.
- `scripts/qa-class-save.cjs`: loads the previous committed version's saved name, gold, class ranks, choices, and unlocks in the updated version. Requires a temporary `_qa-prechange.html` made from the previous committed index; remove it afterward.

The prior-version regression run reproduced failures in cast rewards, companion gating, echoes, and PvP durations before the fixes. The full runtime sweep passed without crashes before the changes as well: those were behavioral defects that a crash-only test would miss.

Final results: 136/136 runtime skill cases passed; 45/45 focused assertions passed with zero page exceptions; existing choice and healing/PvP suites passed; Pyromancer PvP kill rewards and duplicate protection passed; previous-version save fields were preserved. Inline classic/module JavaScript parsed successfully. Local voice-service HTTP errors are expected on the static test server and are separate from gameplay exceptions.

## Practical limits and next playtest

This is not a claim that every mixed build, enemy, terrain configuration, and network condition has been exhaustively tested. PvP coverage uses the game's real packet handlers with simulated peers; a two-device duel under real latency remains necessary.

Co-op guest enemy-hit healing still follows the existing local estimate of host damage. It is capped by the last known enemy HP and checks visible wards, but is not receipt-confirmed like PvP. Improving host confirmation is a separate networking task; do not describe it as verified authoritative healing.

Prioritize short equal-gear tests of sustain builds versus damage builds, ranged versus melee duels, and Necromancer crowds versus single bosses. Check whether defensive choices actually prevent a death and whether mana-saving choices allow another cast during a normal fight. Those are better balance signals than counting how many buffs each card lists.

Visual identity, SFX, and unrelated campaign work remain outside this audit.
