# Campaign refinement — 2026-09-27

Release: 2.044.0-campaign-adventure. Extends the approved Briar pass to all remaining 15 campaign halves. This is a combat/clarity and selected traversal refinement, not a replacement of every level or completion of the broader art/puzzle/enemy backlog.

## What changed

Each half has a geographically authored hunt instead of counting unrelated kills. Existing combat.* IDs, saved counters, completion flags and reward claims remain valid. Groups use two or three replenishing slots, a 25-second delay, nearby-player checks, and a no-spawn radius around players. Discovery and refills also check height so the tower's upper floors cannot activate lower reinforcements. Split tide slimes hold their parent slot until the slimelets are defeated, preventing accumulating broods. Dead refill bodies retire after their death fade.

Ordinary soldiers have explicit shield/frontline, flanking runner and spellcaster jobs. Shield guards are larger and slower; runners smaller and faster; casters retain ranged attacks with a readable firing interval. Existing beast and specialist behavior is preserved. Nearby hunt enemies have labels; co-op packets carry group, role, size and split-parent data. Story guards—including the furnace's deliberately inactive inspection guards—remain finite. The selected tower landing is a deliberate reinforcement encounter; cell and summit guards remain finite.

| Part | Hunting location | Slots | Other refinement |
|---|---|---:|---|
| Black Woods | Forest signal path | 3 | Signal/rescue clue links |
| Winding Cliffs | Lower cliff paths | 3 | Existing bridge/code clue access retained |
| Lost Canyon | Hidden canyon floor | 2 | Rail/water clues; roof route has spaced platforms and lower catch shelf |
| Broken Walls | Old bell tower yard | 3 | New group separate from every story guard; bell tower ascent has real gaps |
| Dungeons | Lower prison works | 3 | New group separate from cell guards; hidden entrance clue link |
| Snowbound Peaks | Mountain lift house | 3 | Accurate enemy floor placement; existing reflectors/climb retained |
| Deep Ice Caves | Cave waterworks | 2 | Search patrol; lab rescue guards remain finite |
| Iron Halls | Machine control floor | 2 | Puzzle attempt counters no longer presented as collected items |
| Great Furnace | Worker floor | 2 | Inspection/office guards excluded; pressure/passage clue links; title encoding fixed |
| Shipwreck Shore | Upper shipwreck | 3 | Hull/code/memorial clues; boat-part messages name Otto and their purpose |
| Thunder Cliffs | Lower tide pools | 2 parents | Split brood cap; wind/cave/hydra clues |
| Palace Courtyard | Western garden | 2 | New group separate from clamp guards; existing roof parkour verified |
| Sky Library | Sealed display hall | 2 | New patrol separate from main/nest guards; each vow points to its own discovered inscription |
| Castle Gates | Western approach | 2 | Side-specific bridge clues and disguise pickup messages |
| Long Ascent | First high landing | 2 | Height-aware reinforcement behavior; both spiral turns and side routes verified |

Journal lookup now contains 50 explicit links to real authored notes, plus nearby exact-note matching for readable objects. It still never creates or reveals an undiscovered clue. Existing exact-note notification opening and journal search remain. Pickups with authored journal notes retain those specific notes; items without them now have purpose-specific messages. Attempt counters and cooling-valve counters are not inventory pickups.

## Verification

- Real browser matrix: all 15 halves pass 10 checks each, including floor support, excluding finite guards, unrelated kill rejection, completion/reward deduplication, wrong-storey prevention, respawn identity, and guest packet application.
- Live AI simulation: a designated enemy in every half approaches and damages the player. This uses controlled placement and isolated enemies, not a full human campaign playthrough.
- Single-jump traversal: all 36 bell-route and 28 roof-route waypoints reached. Enemies stunned for movement isolation. Existing palace rooftop jumps/shard pickup and 260 tower/side-route waypoints pass.
- Six representative pickups: appropriate text and no remaining available pickup. Rope prerequisites supplied in the harness; puzzle gameplay itself is unchanged.
- Mobile journal: relevant clue survives later unrelated notes, searches previous-part notes, exact notification opening works, no horizontal overflow.
- Pre-change HTML save reload preserves currency, class progress/choices, pets, NPC state, speech preference, checkpoint and clue. Auxiliary modules are current in this regression fixture; not an archived full deployed bundle.
- Node checks pass: campaign refinement, Briar refinement, 900-refill retirement, playtest feedback, puzzle guidance, Broken Walls, prison, snowbound, ice caves, Iron Halls, furnace boss, Thunder/Hydra, library and Long Ascent.
- Four legacy dialogue tests (lost-canyon, shipwreck-shore, palace-courtyard, castle-gates) fail against unchanged HEAD as well. Confirmed using module source loaded from git HEAD. Their conversation assumptions require separate maintenance; no dialogue engine or authored dialogue JSON changes in this pass.
- Existing Thunder routes harness completes Dash's race, then its separate hydra-arena section pauses on an earned upgrade screen. Do not interpret that stopped movement as a terrain failure or a passed arena test.

Structured evidence: [QA results](qa/CAMPAIGN_REFINEMENT_2026-09-27.json). Browser scripts: qa-campaign-refinement, qa-campaign-refinement-combat, qa-campaign-refinement-routes and qa-campaign-refinement-feedback. Unit checks: test-campaign-refinement.

## Remaining scope

No wholesale art replacement, new boss mechanics, custom SFX, full new puzzle set, new map expansion, or complete natural-play campaign balance certification. Existing biome routes are retained except the two explicitly strengthened paths. Broader enemy anatomy/animation, exotic equipment, elemental effects and remaining level-design ambitions remain open.
