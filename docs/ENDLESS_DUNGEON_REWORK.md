# Endless Dungeons: enclosed roguelite plan

## [Codex | 2026-10-03]

Status: approved direction, proposed implementation details below. The new roguelite and room generator are NOT implemented yet. Camera repair is a separate immediate change.

### Locked direction

- Keep Abyssal Descent for campaign gold/XP/item grinding.
- Use Endless Dungeons for separate roguelite progression. Keep earned gold on death; spend between attempts. Purchased upgrades/classes persist; temporary run equipment and powers reset.
- Classes may be available for gold immediately or require dungeon achievements/quests to qualify for purchase.
- Enclosed rooms with ceilings; cannot look over walls into neighboring rooms.
- Required parkour, optional harder routes, varied enemy setups/waves, minibosses/bosses, topology and verticality.
- Co-op support is part of the design, not a later retrofit.

### What exists

`loadEndlessArena` creates one 940-unit square, surrounding walls, themed decoration, escalating spawn quotas and periodic caches/shrines. `MP.enterSpecial`, `requestSpecialAdvance` and host-led floor transitions already support the mode. They do not constitute seeded room generation or authoritative room encounters. Reuse useful combat/traversal systems, replace arena layout and floor-wide spawn scheduling.

### Floor structure

Start with 6–9 meaningful rooms per floor, including entrance and exit, then tune duration through playtesting. Generate a connected graph before placing geometry. Give it a readable main route, 1–2 optional branches and occasional loops with unlockable shortcuts. Do not turn every floor into a maze or every doorway into a locked wave encounter.

Use authored room templates with compatible door sockets, floor elevations, ceiling bounds, traversal anchors, encounter spawn sockets and reward sockets. Rotate/mirror only validated variants. Randomize connections and approved encounter arrangements, not arbitrary jump distances or puzzle answers with no solution.

Room proposals:

| Room | Main interaction | Variants |
| --- | --- | --- |
| Broken bridge | Required moderate jumps above a recoverable drop | Lower detour; upper treasure ledge; bridge repaired from far side |
| Split-level guardroom | Fight across stairs and balconies | Ranged defenders above; melee pressure below; flank route |
| Flooded chamber | Islands, raised walkways and timing | Rising water warning; rotating safe routes; optional underwater-looking vault without mandatory swimming |
| Lift shaft | Ascend around a working central lift | Resting landings; side caches; shortcut unlocked at the top |
| Furnace crossing | Timed vents and moving platforms | Safe observation platform; visible hazard rhythm; optional difficult side route |
| Siege room | Defend an objective against distinct waves | Breach doors; activate defenses; prevent enemies reaching a mechanism |
| Hunting chamber | Fight one elite with support enemies | Cover changes tactics; multiple entrances; recognizable elite tells |
| Quiet discovery room | Explore without combat pressure | Short puzzle; lore; quest step; unusual run upgrade |
| Boss chamber | A designed arena matched to its boss | Compact duel, broad creature arena, pillars, multiple heights |

Alternate pressure and relief. Do not combine blind jumping, enemies shooting from offscreen and lethal floors on the compulsory early route. Mandatory jumps need visible landing surfaces and nearby recovery; hard branches can demand more. No class-specific movement ability required for the main route.

### Enclosure and camera rules

Build actual wall and ceiling geometry plus explicit camera collision volumes. Tall chambers allow jump arcs without ceiling collisions. Corridors must accommodate the largest playable body and party traffic.

First person uses modern character/weapon/world rendering, suppressing the local head only during its own draw. Shoulder camera shortens its boom at walls/ceilings. Overhead uses a closer interior framing; where a room cannot support that angle, hide only the current room's roof section with an opaque outer mask so adjacent rooms remain concealed. This room-aware roof masking is future work, not the current camera sweep.

Never fade the platform under the player. Exploration visibility is separate from camera collision: doors, bends, room visibility rules and fog-of-war prevent looking into unexplored rooms. Camera angle must not reveal secret rewards behind walls. Validate all room templates in all three camera modes before admitting them to the generator.

### Encounters and rewards

Room triggers own their waves, cap, spawn sockets and completion state. Spawn beyond immediate melee range with clear warnings; do not spawn enemies inside a player's body or sealed inaccessible geometry. Mix shield holders, pursuers, ranged attackers, support units and beasts. Vary composition before increasing health. Assign minibosses to appropriate rooms and bosses to authored arenas.

Give exploration temporary build choices and gold, with occasional permanent class-qualification progress. Important unlock quests need scheduled/guaranteed opportunities or visible progress, not a single rare random room. Persist gold/quest credit once per event; prevent duplicated rewards on reconnect or floor reload.

### Co-op

Host owns seed, generator version, room states, enemy waves, doors, rewards and floor transitions. Guests receive the same layout manifest; never independently call random generation. Late joins restore cleared rooms and mechanisms. Existing party health scaling remains the starting point.

Main traversal must be solo-solvable; optional two-player shortcuts may accelerate it. Reusable lifts and platforms return so nobody is stranded. Start locked encounters only after ready players are inside, or provide a safe regroup entry. Teleport destinations must be legal current-room ground, not a bypass into unopened reward rooms. Decide party-wipe/revive and personal-vs-shared gold details before implementing economy; these are not silently settled here.

### Delivery sequence and acceptance

1. Separate dungeon profile/save schema and gold/class-unlock rules; preserve campaign and Descent saves.
2. Build one enclosed template each for traversal, combat and boss; validate camera/clearance first.
3. Seeded graph generator, connections, collision and reachability validation; reject invalid seeds.
4. Room encounter director, temporary rewards, preparation room and permanent purchases.
5. Co-op authority, reconnect/late join, duplicate-reward protection and party traversal testing.
6. Add region/template variety after the small complete loop is enjoyable.

Automated checks: seeded reproducibility, connected exit, reachable doors/rewards, valid jump bounds, ceiling clearance, safe spawns, one-time rewards and save round trips. Browser checks: every camera, actual jumps, boss mechanics, split-party doors, death/rejoin and low-quality rendering. Stress-test many seeds; use room visibility to avoid drawing an entire floor. Do not claim every layout is fun from connectivity checks alone—playtest representative seeds.


## [Codex | 2026-10-03] Approved: health attrition defines dungeon runs
User approves the dungeon plan and makes HP management central over a long run. Early equipment offers limited protection; mistakes take meaningful chunks of health and healing opportunities are scarce. Better armor improves how many hits can be survived, while better weapons reduce exposure by killing enemies faster. A skilled fresh character must still be able to progress substantially through avoiding attacks, rather than encountering mandatory upgrade checks.
Implementation implications: carry health between floors; replace/rebalance the current automatic 20-percent floor heal rather than retaining it by accident. Healing frequency, damage amounts and upgrade strength remain playtest-tuned, not locked numeric values. Preserve readable attack warnings and escape windows; avoid unavoidable damage and spawn-on-player hits. Audit healing/lifesteal builds and co-op recovery so they do not trivially erase attrition, without silently removing class identities. These implications guide the proposed rework; no combat/economy changes implemented in this documentation update.


## [Codex | 2026-10-03] Approved direction: roguelite endpoint and harder progression
User requires an endpoint for the roguelite and suggests NG+ or graduation to a harder, different tier afterward. This applies only to the dungeon roguelite; campaign NG+ remains removed. Exact floor count, tier names/count, scaling and unlock details are not yet locked.
Proposed design for review: a finite expedition through multiple regions ending in a final boss and victory/results screen. Winning unlocks a selectable higher difficulty tier without removing access to the earlier tier. Retain earned gold, purchased classes/upgrades and achievement/quest progress; begin each attempt with its normal fresh run equipment/temporary-power reset. Higher tiers change encounter compositions, room variants, hazards and boss mechanics, alongside restrained numeric scaling. Preserve avoidable damage and viable fresh-build skill expression; do not make progression an unlimited enemy-HP treadmill. Victory should be at least as valid a banking endpoint as death or voluntary checkpoint exit. This is a plan only, not an implemented mode change.
