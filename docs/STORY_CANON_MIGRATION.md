# Canon migration audit — 2026-09-19

> Historical audit. REQUIREMENTS_REGISTER.md supersedes multiple Gate/construction-site
> assumptions and the interim early-boss commander proposal: one castle Gate, Storm Coast
> and merciful hydra are now approved. Review current source decisions before code migration.

Status: inspected and documented only. Live story, quests, saves and boss logic are not rewritten in this change.

## Inspected sources

- docs/STORY_BIBLE_v2.md: older cyclical dream-monster story, fallen Ian, secret name and brother reveal.
- docs/STORY_DROP_IN_LINES_v2.md and docs/2026-07-15-bladefall-story.md: old dialogue/history references; retained with supersession notices.
- public/3d/index.html: STORY intro/origin/zone/boss/reveal/ending/npc, story formatting, Ian fragment collection/forge/shop, STAGES and ZONES, enemy definitions, boss phase checks, kill counters and ending callback.
- docs/CAMPAIGN_IDENTITIES_2026-09-14.md and docs/OUTSKIRTS_ADVENTURE_2026-09-14.md: layout mechanics/reference, not authority for new metaphysics.

## Conflicts and required follow-up

| Existing source | Conflict | Migration direction |
|---|---|---|
| STORY intro/origin | Ian fell before finishing a fight; repeated containment of ancient King | Ian succeeded, died naturally; a mortal lord later exploited his absence |
| STORY reveal / forge fragments | Secret Ian name and close family reveal before ending | Ian is famous; keep family connection unresolved and Bladeborn confirmation at finale |
| STORY ending | Player spends all inherited power, fallen family rests; no universal restoration | Implement King defeat, Void collapse, Ian, temporary Blade, final cut and restoration in order |
| STORY npc / warden lore | All Shades and Fallen described through old doomed lineage cycle | Preserve names and functions; review identities individually without silently making new ancestry canon |
| Story text fallback | Unnamed player called “the last Bladeborn” | Replace spoiler label with a neutral player reference in future text migration |
| ZONES abyss / castle | king at stage 12; tyrant at stage 16, separated by Palace/Castle progression | Approved: replace earlier encounter with a Legion commander; keep final two-phase King fight at Duskmoor |
| Ian’s Blade mechanics | Existing five blade fragments, level-100 / 250k forge and 1M shop path | Preserve identifiers and earned progress; separate from new per-level Rift Shards; no campaign-completion free permanent award |
| Existing monster roster | Mixed wildlife, elemental and undead enemies | Assign affiliations individually, never blanket Hollowing |

## Grounded implementation order

1. Resolve the few canon/presentation questions with Oliver, then write a campaign reveal outline and one complete first-area dialogue chain.
2. Move authored dialogue into stable line/scene IDs suitable for journals, save state, voting, recordings and text revisions. Preserve legacy intro/quest completion flags through migration.
3. Implement checkpoint and dialogue state foundations before content depends on them; hub introductions persist per save, level conversations reset according to approved half-restart rules.
4. Build and playtest Outskirts / Black Woods with objectives justified by civilian needs and Legion activity. Gate construction is an available plot mechanism; Waystones are not automatically anti-Gate seals.
5. Extend story reveals across existing levels. Keep early encounters and optional lore from spoiling the final identity confirmation.
6. Migrate final encounter and ending as a separate tested sequence, including temporary equipment restoration, retry behavior and multiplayer synchronization.
7. Validate old saves, every required quest path, adverse dialogue choices, subtitle/voice timing, recording revisions, main-path accessibility, and the inability to soft-lock progression.

## Clarifications received

- Recessive inheritance and awakening through intense circumstances plus a sincere wish to protect are Oliver’s proposed direction. The exact family connection to Ian remains open; do not turn the older direct-descendant or brother claim into canon.
- The earlier King encounter will become a Legion commander. Boss and arena redesign is explicitly authorized for gameplay and story improvements.
- Ordinary Hollowing is a door-like crossing with immediate bodily emergence. The King alone barely escapes the Void by fighting its forces using energy already gained through partial infusion. No invented alternate portal passage is required.
- Final charge uses repeated Space presses. Retry the charge alone after failure; show a skip option after five consecutive failures. Continue the successful story ending when skipped. Input tuning and co-op handling remain implementation design work.

Documentation records these decisions; the boss replacement and charge sequence are not yet implemented.

## Guard-route design constraints

Approved disguise quest leads to an alternate Duskmoor gate entry. Build clues into discoverable orders, procedures or credentials. The Hollowed guard follows standing orders and can be deceived using incomplete information, not persuaded into free-willed betrayal. A failed deception triggers the requested difficult horde; it remains a winnable progression path. Preserve underlying equipped gear and stats if disguise is implemented as a temporary appearance layer; exact gear behavior still needs design.
