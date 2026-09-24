# Campaign progression and co-op combat


## [Codex | 2026-09-24] U192 — progression/combat continuation
User: Go ahead with a long work session. Don’t waste usage
Grounded continuation of U189: initial roster plus two combat tasks per level and Hydra rescue projects one rank10 class by finale under2.4 class XP/raw XP, rank7 by Frostfell. Player progression projects level10 by Frostfell and15 by finale; keep player rate1.5. Increase campaign class award to4/raw XP, retain other modes. Verify through actual gainXp with per-award class switching at10. This budget excludes dynamic quest waves, repeat farming and optional discoveries; not a timed human playthrough.
Found concrete co-op defects: noteKill runs before Bones resurrection, incorrectly advertising a death; guest applying host kill can resurrect its local Bones and loses later kill packets. Guest recreated elite uses its local base XP instead of host kill packet XP. Correct death authority and test both clients. Patrol re-spawns leave every old dead object in G.enemies; prune only retired patrol corpses after the existing fade, keeping authored story enemies.

Named campaign elites now have a gold nameplate and wider health bar, visible nearby before taking damage. Status pips move above the label. Existing combat behavior retained; this is readability, not a new miniboss moveset.


## [Codex | 2026-09-24] 2.034 validation and remaining work
Campaign class XP per raw XP increases from 2.4 to 4; player XP remains 1.5. Actual per-award gainXp simulation reaches player levels 5/7/8/10/11/13/14/15 by campaign zone, first class ranks 5/7/8/9/10 then second class ranks 6/8/9 in the final three zones. This is a reward-budget projection, not a timed natural playthrough; dynamic waves, repeat farming and optional discoveries are excluded.
Verified combat in all 16 level halves; Furnace guards activate after their intended alarm. Two-client Bones resurrection/final death/duplicate packets and recreated elite XP pass. 900 patrol refills retain bounded body objects and death fades. All four named elite plates render at full HP, including phone viewport. Existing 2.033 save fixture retains progression, journal, intro state and explicit speech-off setting. Adventure feedback (13 checks), patrol runtime (9), story state/authority, syntax and diff checks pass.
Remaining: distinct elite/miniboss movesets and broader natural-route visual/playability audit. No claim that the whole approved queue is complete.
