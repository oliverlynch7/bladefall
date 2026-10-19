# Repeatable campaign hunts

Implemented sixteen NPC-owned contracts. Accept, defeat designated camp enemies or recover their quest supplies, return for payment, then accept again. Three replenishing slots per section;25s cooldown,110-unit exclusion around living players and1.2s arrival stun. Split-creature offspring must clear before their parent slot refills. Existing enemy assets, AI and campaign level scaling remain in use.

Hunt progress appears in the core optional tracker and journal. Orange Hunt marker points to the camp; green Turn in marker points to the NPC. Quest collections are automatic and use no equipment-bag capacity. Clear main quest turn-ins retain priority. NPC availability still follows story conditions.

| Region / section | NPC | Contract | Goal | Gold | Actual campaign XP |
|---|---|---|---|---:|---:|
| Briar Town / 1 | Gus | Supplies for Briar | 10 stolen supply bundles at western supply wagon | 120 | 270 |
| Briar Town / 2 | Lewis | Keep the escape route clear | 10 designated enemies at forest signal path | 150 | 321 |
| Hollow Pass / 1 | Caleb | Safe passage | 10 designated enemies at lower cliff paths | 190 | 380 |
| Hollow Pass / 2 | Ruth | A safer shelter | 10 designated enemies at hidden canyon floor | 220 | 430 |
| Ruined Keep / 1 | Grant | Break the siege patrol | 12 designated enemies at old bell tower yard | 260 | 489 |
| Ruined Keep / 2 | Walter | Keep the works clear | 12 designated enemies at lower prison works | 290 | 540 |
| Frostfell / 1 | Heath | Keep the shelter route open | 12 designated enemies at mountain lift house | 330 | 599 |
| Frostfell / 2 | Professor Ellis | Recover the samples | 12 sealed sample packets at cave waterworks | 360 | 650 |
| Emberdeep / 1 | Flint | Metal worth saving | 12 usable metal scraps at weapon-line drive floor | 400 | 709 |
| Emberdeep / 2 | Martin | Keep the worker floor clear | 12 designated enemies at furnace worker floor | 430 | 759 |
| Storm Coast / 1 | Otto | Protect the salvage | 15 designated enemies at upper shipwreck | 470 | 818 |
| Storm Coast / 2 | Abe | Clear the tide pools | 15 designated enemies at lower tide pools | 500 | 869 |
| Sunspire / 1 | Sister Grace | Room to recover | 15 designated enemies at western palace garden | 540 | 928 |
| Sunspire / 2 | Master Hugh | Protect the collection | 15 designated enemies at sealed display hall | 570 | 979 |
| Castle Duskmoor / 1 | Roland | Thin the castle patrol | 15 designated enemies at western castle approach | 610 | 1038 |
| Castle Duskmoor / 2 | Miles | Keep the landing clear | 15 designated enemies at first high tower landing | 640 | 1088 |

Rewards use160–645 base XP with the existing1.6875 campaign multiplier; offers show the resulting270–1088 XP. Gold120–640 scales by region/section. No entry fee, forced participation or boss-clear requirement for paid earnings.

Host owns acceptance, shared kills and turn-in. Existing story request/ack transport distributes progress and per-round receipts to eligible same-scene party members. Requests validate scene epoch, revision, owner, living actor, real NPC, story conditions, distance and reachability. Duplicate corpses and receipts cannot pay again.

Normal campaign checkpoint earnings preserve hunt counters/rounds/rewards/claimed receipts while leaving main-story flags and encounters under existing retry rules. A retry can still require redoing an introductory/rescue prerequisite before that NPC can be approached. Previously earned automatic patrol rewards remain; unfinished legacy patrol counters migrate once to active hunt progress. New visits offer fresh work.

Verification:2567 focused Node checks,20 regression suites,258 actual browser checks across all16 maps and32 completed cycles;48 supported/collision-clear camp slots. Actual save/reload checks preserve3/10 progress, then paid round state, prevent duplicate payment through reload/repeated story sync and retain gold on hub return. Simulated host/guest authority checks are not a new two-human network playtest. Browser tests use isolated in-memory old100/1145 save and controlled teleport/combat/time advancement; they do not establish traversal pacing or subjective fun.
