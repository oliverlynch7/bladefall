# Canon migration audit — 2026-09-19

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
| ZONES abyss / castle | king at stage 12; tyrant at stage 16, separated by Palace/Castle progression | User decision needed on earlier encounter; final two-phase fight must occur at Duskmoor |
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

## Clarifications to request

- Is a shared ancestor / collateral family branch acceptable for the player’s connection to infertile Ian, or should this remain unanswered for now?
- The earlier stage-12 Abyss King encounter needs a role compatible with a single final two-phase confrontation. Do not silently create an illusion, proxy or escaped King.
- Clarify ordinary Hollowing passage versus the final physical plunge into the Void; do not imply ordinary recruits could escape the soul prison.
- Set retry and accessible input behavior for the timed final charge. A hard challenge must not silently become permanent save loss or force replay of the whole campaign.

## Guard-route design constraints

Approved disguise quest leads to an alternate Duskmoor gate entry. Build clues into discoverable orders, procedures or credentials. The Hollowed guard follows standing orders and can be deceived using incomplete information, not persuaded into free-willed betrayal. A failed deception triggers the requested difficult horde; it remains a winnable progression path. Preserve underlying equipped gear and stats if disguise is implemented as a temporary appearance layer; exact gear behavior still needs design.
