# Campaign story foundation — September 20, 2026

Scope: first implementation batch for DLG-02/08, UI-01/05 and SAVE-05. Not the complete Briar rebuild or co-op dialogue release.

Inspection found that current quests are numeric counters on G.qs, all exposed at area entry. The existing Shade menu has no branching state. Completed-half checkpoints already own a route snapshot. N is unused; J is the existing keyboard attack binding, so the journal defaults to N and is remappable rather than taking away attack.

Implementation:

1. Add a data-driven, deterministic story reducer with stable line/choice/event IDs, conditional choices, atomic turn-in, quest items outside the bag, journal notes, world flags and once-only rewards. Authored content controls effects; network input must never supply arbitrary effects.
2. Author the Thomas preparation and Mara delivery chain without early ancestry or soul-prison spoilers. Test it in a clearly labeled interactive preview; do not pretend the current map already contains the new NPCs, store, gardens or healing station.
3. Ship the current-level journal into the game, reading real objectives and discovered optional tasks. Store story state alongside the campaign route checkpoint so unfinished notes/items/choices reset together and completed-half state survives. Keep notes filtered to current region.
4. Validate branching, incomplete turn-in, repeat events, exit/resume, progression, current-half rollback, reload, browser input and narrow layout.

Next: bind this authored chain to detailed NPCs, camera/speech, shared host-authoritative dialogue and visible Briar world changes. Those systems must ship together before this preview becomes a live campaign quest. No co-op synchronization or cinematic-camera completion claimed in this batch.


## Verification

Candidate 1.987.0-story-journal-foundation. Node reducer checks passed for all three Thomas responses, Mara gating/delivery, duplicate events and pickups, transaction rollback, stale revision rejection, checkpoint restoration and graph links. Real-browser QA passed 13 checks in scripts/qa-story-journal.cjs: N/Escape, local pause, current notes/items, completed-half banking/reload, fresh-region reset, reveal input guard, selected response, leave/resume, turn-in and phone-width overflow. Existing 11-check campaign checkpoint regression also passed, including actual death/retry, legacy resume, hub save and trial isolation. Mobile screenshots inspected; journal no longer receives the level-entry toast over its text.

Live journal reads existing objectives; new narrative note hooks and quest-item state are ready but only the separate preview currently runs Thomas/Mara content. Preview world buttons simulate garden/store pickups and the pad change. No claim of in-world NPC models, camera framing, voice playback, multiplayer story authority, new map layout, or final quest integration. Current old story text and level naming are not all migrated by this foundation release.
