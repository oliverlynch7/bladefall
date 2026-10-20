# Boss environmental mastery - 20 October 2026

Version 2.338.0-boss-mastery. User explicitly requests substantially harder campaign bosses that rely on their arenas.

## Encounter changes

| Encounter | Required strategy | Exposed damage | Maximum damage per opening |
| --- | --- | --- | --- |
| Brute | Bait its swept charge into a cart or stone | 3x | 38% maximum HP |
| Marksman | Block a shot with stone cover, or reach her nest during reload | 1.75x | 34%, preserving first-perch relocation |
| Fallen | Catch a thrust on a pillar or arena obstruction | 3x | 38% |
| Officers | Separate caster from shield; flank shield after its wave; punish spear recovery | 1.75x | 40% of each officer |
| Ember Colossus | Refill and use cooling valves; deal with repair crew | 2.5x | 34% |
| Marble Colossus | Orient a screen and reflect its actual heavy strike | 2.5x | 34% |
| Sea Hydra | Use cover/ledges and attack the resting head's restraint after its attack | 2.5x | 55% of that restraint; two openings per chain |
| Abyss King | Put a pillar in his real beam lane, or actually jump his phase-two ground wave | 3x, 4.2-second recovery | 38%, preserving phase-two guard summon |

Closed defenses now block damage instead of allowing a powerful build to bleed through them. A full opening cap is shared across direct hits, damage-over-time, companions and co-op attacks. Modest reductions to idle/reload time retain all attack warning durations. Total HP, base damage, loot, XP, saves, trial difficulty and non-campaign modes retain their existing rules.

The King's body now stops before the pillars instead of walking through the required cover. A living active player must be in the actual blocked beam lane or airborne above the wave inside its radius; distant, downed and menu-busy actors cannot grant the counter. Host owns that decision. Recorded peer motion supports descending jumps. Opening/phase/budget IDs propagate through the existing enemy stream, with joint budgets also carried by the dedicated Hydra snapshot so guest cuff glows close when the host spends an opening. A covered-shot ID comes from an actual cover impact rather than the Marksman merely starting her next aim. One shot/reload grants one shared window: switching from cover to a close nest approach cannot create a second budget. A real nest approach or shield flank also opens that same window for status damage, preserving class viability.

HUD cues, retry advice and bestiary combat descriptions match the gates. The Hydra's pale cuff/ring now follows actual exposure, including initial idle and spent windows. Authored dialogue, NPC voices and all audio recordings remain unchanged; no paid generation.

## Verification

- `arena-events.json`: actual encounter state machines, collision/screen/cover functions and damage policy. Brute/Fallen physical counters at20/30/60/120Hz; Marksman cover impacts plus relocation; refilling cooling valves; three actual screen reflections; six Hydra attack/rest windows; all three officers through attack/recovery; both King phases with the guard summon. Burst inputs deliberately enormous to test bypasses, not representative player builds. Counter positions are staged; does not prove a human can find them without guidance.
- `engine-bosses.json`: muted isolated Chrome loads all eight boss rooms/twelve actors; actual hitEnemy and hostApplyHit/duplicate receipts check closed armor, bounded successful opening, no refresh from repeated hits and replicated budget metadata. A pre-change level100/gold1145 save still loads. These are staged states and simulated packets, not a two-human Internet playtest or natural boss kills.
- `royal-counter.json`: actual game update uses pillar cover and the ordinary held-jump input to evade the King's attacks and open his ward; held review screenshot captures the result.
- `regressions.json`:34 relevant suites, including every changed encounter module, combat, quest, co-op, save, progression and all371approved NPC recordings.
- `console.json`: browser warning/error capture.

The final real-browser audit also found the King could recognize an airborne wave counter but hit that same player while landing before the lingering strike expired. A transient per-actor/per-boss clearance now prevents only that same wave from hitting late, on host and guest. Other players and subsequent waves remain dangerous; a fresh encounter cannot inherit clearance. The actual held-jump test now continues through landing into the real recovery window.

The final real-browser audit caught a cover-to-nest Marksman budget bypass. The opening key is now shared across both methods and repeated actual hitEnemy calls and guest receipts verify the correction.

An unchanged combined Thunder/Hydra test still expected an interaction to be locked until a clue was read. Only that obsolete assertion was updated to match the user's existing no-mandatory-reading requirement; the game quest/story file was not altered. The complete suite then passed. Initial local fixture failures involved missing initial serial counters and using a private function name rather than the already exported debug API; corrected fixtures reran through real encounter transitions.

Human playtesting remains necessary for difficulty, fight length, readability under pressure and real network timing. Technical tests establish mechanics/compatibility, not subjective fun or full campaign completion. No FPS claim.
