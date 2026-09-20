# Bladefall — complete campaign expansion draft

September 19, 2026. Requested by U105; names and personalities accepted in U103, interaction defaults in U104, half-checkpoint quit/disconnect rule in U105. This is a reviewable design draft, not implemented gameplay. It replaces CAMPAIGN_STORY_OUTLINE.md as the current proposed campaign plan. REQUIREMENTS_REGISTER.md remains authority for approved constraints. New quest titles, rewards, boss mechanics and scene details below are creative proposals within that brief, not new user-authored canon.

## Campaign shape and shared rules

Defend Briar -> follow prisoner movements through Hollow Pass -> free Ruined Keep and learn a researcher fled north -> find the researcher in Frostfell -> stop the weapon industry at Emberdeep -> seek passage at Storm Coast -> reclaim Sunspire and consult its one-question orb -> find and infiltrate Castle Duskmoor -> defeat King and perform restoration ending.

Every region has two substantial halves and a distinct boss space. Each half has a changing main route, optional branches, at least one meaningful discovery without an NPC assignment, authored encounters and a shortcut back to a useful junction. Size comes from varied connected spaces, not uniformly scaling all distances. Stage presentation names below are working labels; accepted region names and Storm Coast half names remain fixed.

Quests are marked **delivery** (return goods for a reason), **field** (complete where action occurs, no forced return), or **discovery** (player notices a problem/opportunity). Main objectives unlock stepwise. Optional quests do not count toward opening the required exit. Dialogue choices reflect what player actually says; reactions can surprise, wording cannot mislead. Leave conversation without auto-selecting; reveal-skip and response-select use separate input edges. Quest items live in journal storage outside equipment capacity and cannot be sold.

Major puzzles fixed and authored; a few three-digit optional chests have generated solutions with matching environmental clues. Code and clues persist together for the same attempt/checkpoint; no client-specific answers. All puzzles solo-solvable. Co-op can split tasks but never requires simultaneous bodies on distant switches. No clue relies exclusively on audio or color. Harder optional puzzles may have no NPC hint. Required puzzles communicate progress visually and permit a safe reset.

### Checkpoints and completion contracts

- Entering each half stores character, class, inventory, currency and shared-world baseline. Finishing it banks earned changes and unique shard IDs together, then establishes the next baseline. Death, quit, refresh or disconnect discards current uncommitted progress and resumes at that half's start. U105 resolves the previous quit ambiguity.
- Finishing half two banks its gains at boss entry. Proposed boss retry baseline: boss entrance; no redoing half two after a boss defeat. Final charge failure retries only the charge, with optional skip after five consecutive failures. Exact boss-entry behavior should be validated against the agreed checkpoint intent before coding death routing.
- Within one visit, dialogue resumes where left. Restarting an unfinished half restores that half's starting conversations/world, while completed-half facts remain. Explicit replay starts a fresh world/choice attempt but retains permanently earned shards/classes/items.
- Before a one-way boundary, show a quiet opportunity to keep exploring, without announcing undiscovered secrets or revealing the total optional tasks. Every shard in that half is reachable before the boundary on at least one valid route. Moving to next half never requires an optional shard.
- Physical shards are separate per-player pickups. NPC quest shard rewards are shared automatically among participating party members. Environmental interaction/puzzles/dialogue are shared; repeated events cannot duplicate rewards. A disconnected player resumes their saved checkpoint; shared-party reconciliation must not invent gains for missed content.
- Reward values/rarities are authored targets until playtesting. Propose all newly earned item/companion/appearance rewards in the half remain provisional until banking, visibly labeled; this extends the save rule consistently and requires explicit implementation coverage.
- Safe rest is not a big infinite pad in every level. Mara's restored pad is the primary early example; ordinary limited pads are placed near major junctions and before long challenges. Actual charges/spacing tuned by measured routes.

### Approved cast reference

| Region | Part one | Part two |
|---|---|---|
| Briar Town | Thomas (dad), Mara (medic), Gus (mill worker) | Lewis (scout), Beth (shepherd) |
| Hollow Pass | Caleb (escaped prisoner), Skip (climber) | Captain Ward (Hollowed officer), Ruth (prisoner organizer) |
| Ruined Keep | Grant (guard), Felix (locksmith) | Walter (stoneworker), Sly (prisoner) |
| Frostfell | Heath (guide) | Professor Ellis (former researcher), Hugo (explorer) |
| Emberdeep | Flint (smith), Jack (furnace worker) | Foreman Pike (Hollowed overseer), Martin (worker organizer) |
| Storm Coast | Otto (boatbuilder), Captain Rose (male sailor) | Abe (fisher), Dash (scavenger) |
| Sunspire | Sister Grace (caretaker), Sergeant Victor (defender) | Master Hugh (senior keeper), Simon (junior keeper) |
| Duskmoor | Roland (armor maker), Gate Captain Cross (Hollowed) | Miles (living servant), Abyss King |

Names and broad personalities approved. Do not revert to Bram/Pell/Nell/Tomas/Orren and earlier sound-alike drafts. Class mentors are separate trial characters, with names deferred until their smaller roster is designed. Dead Bladeborn spirits do not automatically equal all class mentors.

## 1. Briar Town — Homefields / Black Woods

**Purpose and feel:** protect your family and neighbors as the Legion finally reaches home. Warm farm light, patchwork defenses, then mossy forest and dark occupied clearings. A figure-eight village route feeds into branching woods. First level teaches systems gently; deeper secrets remain worthwhile.

### Part one: Homefields

1. **Before You Go — Thomas, field.** Start with Thomas preparing practical gear, not a prophecy. "I know that look. Fine. Let me fix that strap first." Player can reassure him, admit fear, or make a small joke. All lead to preparation with different emotional replies, not hidden stat advantages. Legion noise interrupts the quiet; clear a nearby lane so Mara can receive wounded people.
2. **Room for the Wounded — Mara, delivery.** Bring tangle roots from an overgrown garden and clean dressings from a shuttered store. Roots require cutting a path around fallen fencing; dressings require reaching a rear window, not killing another quota. Mara treats people and restores the grand unlimited healing pad; explains finite smaller pads. Use quest inventory and clear turn-in.
3. **Keep the Mill Turning — discovery, field.** A stuck water wheel prevents a farm crossing from lowering. Learn an environmental puzzle by tracing a jam, closing the feed briefly and clearing it safely. Sound, wheel motion and bridge movement show progress. Gus can comment if found, but is not required to authorize the task.
4. **A Way Out — field.** Clear the evacuation route and open its wagon gate. Completion is witnessed by villagers actually moving. Thomas stays with them, carrying supplies rather than becoming an invincible follower. Exit leads toward Lewis in the woods; first-half bank.

Optional **Gus's Good Tools**, delivery: recover his tool roll from the loft. Help earns a shard and opens a workshop shortcut. Mock his fear and he withdraws the reward offer; a repair is hinted by his concern for a damaged village sign, not a kill-five demand. Repairing it reopens help; continued cruelty can close his optional reward for the run. Required bridge remains solvable unaided.

### Part two: Black Woods

1. **Find the Safe Path — Lewis, field.** Inspect two routes: ground path through a guarded camp or upper roots/old hunting platforms. Both lead to the same blocking signal post. Scouts' orders establish prisoners moving through Hollow Pass, not location of secret Duskmoor.
2. **Silence the Signal — field.** Disable the alarm mechanism using either its exposed upper cable or a protected ground crank. A brief alarm is a combat complication, never permanent failure. Saved villagers can then advance to a sheltered clearing.
3. **Nobody Left Behind — Beth, optional discovery/field.** Follow tracks to her missing brother. A broken footbridge and independent beasts make a rescue route with its own short story. Beth meets him at a junction; player need not walk him slowly through cleared terrain. Reward: shepherd-dog companion, hidden in Beastmaster selection until banked.
4. Reach the Brute threatening the final escape lane. Lewis and the refugees remain safely outside the boss boundary; no mandatory fragile escort AI during the fight.

**Boss: Brute.** Outdoor broken orchard and barn approach, broad uneven footprint with reliable walking floor. Charges telegraph with lowered head/feet; bait a charge into a sturdy cart or stone barrier to stagger it. Low fences change lanes but cannot trap player. Two finite waves of Legion handlers, not endless reinforcements. No class-specific ranged switch required. This encounter establishes evade -> opening -> punish.

**Five Berserker shards:** BR-01 half1 easy purple fragment beside Mara's reopened route, explicitly teaches system; BR-02 half1 Gus optional delivery reward; BR-03 half2 loft/roots parkour overlooked by main path; BR-04 half2 unassigned forest-stone puzzle using carved animal tracks and matching tracks nearby; BR-05 half2 hidden camp supply nook reached behind the signal platform. Two before/three after. Each has a separate stable ID; no boss shard here.

**Healing and return:** Mara infinite; small pad forest fork and limited rest before Brute. Rope ladder opens a return to forest fork. Later hub request can reveal a keepsake cache at the abandoned home, not replace existing shards. Story ends with townspeople alive and a reason to pursue prisoner movements.

## 2. Hollow Pass — Winding Cliffs / Lost Canyon

**Purpose and feel:** stop prisoners disappearing into Legion territory. Sandstone, wind-scoured cloth, long drops, narrow shelves and a lower canyon you can see before entering. Route resembles a climbing switchback above a hidden basin, not a straight hallway.

### Part one: Winding Cliffs

1. **The Ones Behind Me — Caleb, field.** Caleb gives a landmark and escort timing, not an exact objective pin for every prisoner. Follow torn cloth and wheel tracks to a guarded lookout. Learn transport destination is Ruined Keep, not the hidden King's castle.
2. **Across the Gap — main environmental puzzle.** Set a counterweight and release the correct brake to lower a freight bridge. Weight has visible markings and position; failed setup safely resets. Either approach reaches controls solo. Optional upper ledges let skilled players approach controls from behind, but don't skip essential story state.
3. **Open the Descent — field.** Capture lookout and release a lift into Lost Canyon, banking half one. Choose quiet rope route or direct shielded patrol encounter. No universal stealth system required: authored sight lanes/alarms in this encounter.

Optional **Skip's Missing Rope**, delivery: recover a rope coil hung below a broken platform. Return unlocks a demanding ridge traversal and a fixed uncommon javelin, **Cliff Runner**, illustrating longer thrust reach. Skip jokes about the drop without ridiculing player failure. A small alternate chest uses a changing three-digit code: count marked supports in three symbol-labeled alcoves; symbols establish order.

### Part two: Lost Canyon

1. **Orders at the Gate — Captain Ward, conversation or field.** Inspect transport orders to convincingly redirect a holding-yard work detail. Correct information creates a quieter entrance. Bluff without support triggers guards; combat route remains open. Ward cannot freely change allegiance.
2. **Break the Cages — Ruth, field.** Release cage locks from different approaches; freed prisoners take sheltered routes under Ruth's leadership. Open escape gate and disable a visible alarm winch. Choose what to secure first; no arbitrary real-time timer starts while exploring/dialoguing.
3. **A Different Way Out — discovery.** A wagon visibly blocks a narrow cave. Moving its load opens an optional canyon floor loop with a climbing return. This is not assigned by Ruth.
4. Marksman commands the last crossing. Defeating it lets Ruth's group escape and reveals the Keep's holding records.

**Boss: Hollow Marksman.** Wide open canyon split by broken spans, covered lower crossings and reachable upper nests. Marked aim line and audible wind-up (also visual) precede shots. Player can use cover and climb to each perch; boss does not require ranged weapons. One reposition phase uses a short glide between nests, giving an aerial behavior without a second full flying commander. Finite reinforcement pair during a protected relocation; no overlapping unavoidable sniper shot on landing. Longer safe crossing always exists beside optional fast jumps.

**Five Ninja shards:** HP-01 half1 wind-sheltered side passage behind hanging cloth with distinct moving edge; HP-02 half1 upper Skip route precision climb; HP-03 half2 shared Ruth reward for optional cage group, before exit; HP-04 half2 freight-rail direction puzzle without NPC clue; HP-05 boss space hidden under an intact stair at the rear nest, available safely after victory before leaving. Three-digit chest is gear, not sixth shard. Boss shard banks on claim after defeated boss with completion transaction.

**Healing/reward:** limited pads near bridge and holding-yard junction. Rescue opens a useful shelter/shortcut; exploration chest and javelin provide non-shard reasons to detour. Palette and wind hazards avoid the old green square overlays.

## 3. Ruined Keep — Broken Walls / The Dungeons

**Purpose and feel:** free the captives and obtain a lead on the missing researcher. Broken battlements and enclosed brick passages above a layered prison. Routes wrap around a visible central breach, then branch into lower rooms. This is the deliberately harder Reaper shard hunt, not an equally hard main route.

### Part one: Broken Walls

1. **Make an Opening — Grant, field.** Reach the captured guard through a damaged outer wall. Disable an arrow position and open a side gate. Grant's escape plan becomes visible as prisoners collect in cover.
2. **Hold the Breach — field.** Intentional return of the praised 30-second defense: hold a broad broken wall while prisoners cross behind cover. Two approaches let player push attackers back or control a narrow lane. Timer pauses with shared dialogue; no offscreen losses. Failure resets encounter state fairly rather than permanently killing a quest NPC.
3. **Down to the Cells — field.** Obtain the jail access key from guard post or operate a wheel from the battlements. Felix provides an optional lock route. Main progress does not require trusting Sly later.

Optional **Felix's Last Pick**, delivery: retrieve tools from a seized workshop through a timing-based gate. Return opens a shortcut to a harder sealed side chamber; reward is a fixed rare dagger, **Lockpick**, plus his assistance, not all shard solutions. Felix's panic gets one joke and then useful information, not repeated nervous chatter.

### Part two: The Dungeons

1. **Find the Missing Names — discovery/field.** A visible list of occupied cells disagrees with empty rooms. Trace service markings to hidden captives and their confiscated papers. Walter can explain old construction, but the physical clue exists without talking to him.
2. **Open the Prison — Grant's plan, field.** Redirect a lift with visibly marked counterweights to move people up safely. Required puzzle is approachable; optional descending route below its normal stop is much harder.
3. **What Sly Took — optional conversation/delivery.** Sly stole a prisoner's family keepsake along with a shard. Offer to return the keepsake and conceal the theft if he makes amends, or demand he return it openly. Both honest-resolution routes can yield the shard through different reactions. Threatening to keep the keepsake closes his shard cooperation for that run; never closes release controls. A remorse hint allows repair before the last departure, without looping rewards.
4. Free prisoners reveal Professor Ellis escaped north, pursued for knowledge of the King's early work. The Fallen blocks the final release chamber.

**Boss: The Fallen.** Close indoor hall, flat readable floor, stone pillars that affect line-of-sight rather than ticking hazard tiles. Human-sized Hollowed champion, disciplined feints with distinct tells and punish windows; no reinforcements. No former Bladeborn identity. Supports melee parry/dodge and ranged spacing without requiring one class. Optional lore after defeat humanizes the imprisoned people without revealing the ending's restoration early.

**Five Reaper shards:** RK-01 half1 ruined bell tower climb with a recoverable fall; RK-02 half1 optional sealed chamber combat trial following Felix's route or independently discovered wall access; RK-03 half2 hidden floor below lift with multi-step weight puzzle; RK-04 half2 Sly restitution branch shared reward; RK-05 half2 flooded drain maze with raised dry paths and matching wall scratches, no NPC solution. Two/three split, all before boss. Hints support deduction, no mandatory pixel hunting or class movement ability.

**Healing/reward:** limited pads before breach and at central lower landing. Lift loops to lower junction. Optional chest contains a fixed rare armor piece, not scythe loot. A returning hub quest can rebuild a safe shelter from recovered tools. Reaper power earned through optional difficulty while main rescue stays accessible.

## 4. Frostfell — Snowbound Peaks / Deep Ice Caves

**Purpose and feel:** reach Ellis before the Legion erases a witness. Wide mountain ascent, wind pockets, then quiet luminous blue caves. Terrain moves upward outside and folds downward inside. Isolation matters: three NPCs total, only Heath in first half.

### Part one: Snowbound Peaks

1. **A Trail in the Snow — Heath, field.** Follow Ellis's signs between shelters. Calm pockets let player inspect tracks; gusts have visible buildup and shelter lines. No persistent cold meter proposed: atmosphere and specific exposure zones avoid a constant survival chore.
2. **Shelter Before the Storm — delivery.** Bring a damaged heater part from an abandoned lift house to Heath's shelter. Repair opens resting space and a crossing route; no infinite heal unless explicitly added later. A scenic alternate climb bypasses an encounter but reconnects at shelter.
3. **Find the Cave Mouth — main environment.** Redirect a broken signal reflector to reveal an ice-hidden entrance. Alignment indicated by carvings/shadow shape, not color alone. Bank on entering the protected cave network.

Optional discovery **Something Under the Snow**: uncover a buried explorer camp, solve its fixed trail marker puzzle, recover a cosmetic winter cloak. No new quest giver needed. Side climb demonstrates more demanding ledge spacing with safe recovery shelves.

### Part two: Deep Ice Caves

1. **Reach Ellis — field.** Follow dropped research pages to an isolated shelf. Hollowed officers occupy the exit route. Ellis initially asks for papers before admitting their meaning; player can press him firmly or offer help. Neither reveals the Bladeborn identity.
2. **What He Helped Build — delivery/conversation.** Recover sealed notes from a collapsing research pack (authored stable environment, not a surprise timer). Ellis explains the immortality motive, unexpected obedience and his part in the work. He identifies Emberdeep as the arms source supporting the region's hunting parties. Exact original rank/title not canonized.
3. **Break the Ice Lock — field puzzle.** Set water flow through channels and freeze controls provided by machinery/environment, not requiring a Frost class. Visible water height opens a cave route. Failure drains/reset safely without drowning softlock.
4. Optional **Hugo's Brilliant Mistake**: discover explorer calling from behind ice; environmental rescue via lever and dropped rope. He meets player at the exit junction and offers shard reward plus a second optional cave lead.

**Boss: three Hollowed officers.** Existing Frost Sorcerer as caster, shield-bearing officer, mobile spear officer. One large cavern with high/low shelves connected by ramps and optional leaps. Readable role attacks, shared global cap on major concurrent telegraphs. Defeating one changes the surviving pair's priorities, not an unavoidable full-screen burst. No extra adds: the trio is the threat. No mandatory color-matching or per-class attacks.

**Five Chronomancer shards:** FF-01 half1 shelter roof route behind a visible broken flag; FF-02 half1 fixed marker-shadow puzzle in buried camp; FF-03 half2 Hugo rescue shared reward; FF-04 half2 optional ice-channel chamber requiring full cycle understanding; FF-05 half2 high cave ledge reached by a looping frozen waterfall path. Two/three split. No underwater breathing mechanic required.

**Healing/reward:** limited pads at shelter and cave junction; dry safe platforms near puzzle. Lift unlocked from above shortens failed-climb recovery. Ellis's dialogue rewards curiosity but every player obtains the Emberdeep lead even after angering him.

## 5. Emberdeep — Iron Halls / The Great Furnace

**Purpose and feel:** weaken the Legion by stopping weapon manufacture while helping captive workers escape. Black iron, forge amber, sparks and controlled lava glimpses. Moving industrial routes above a connected worker floor; no Hollow Gate construction here.

### Part one: Iron Halls

1. **Weapons for the Enemy — Flint, field.** Inspect the line and cut its feed power after removing workers from a dangerous station. Flint makes the stakes clear: wrecking everything carelessly can hurt the people trapped here.
2. **A Safe Way Through — Jack, delivery.** Retrieve protective handles and repair a service cart. The cart creates a crossing and carries supplies, avoiding an escort at walking speed. Choose an overhead route through timed stamping machinery or a floor route with patrols.
3. **Stop the Line — main puzzle.** Work out the safe order from visible belts, gauges and exhaust: cut feed, release trapped pressure, stop hammer. Wrong order produces a recoverable steam warning and reset, not unseen instant death. Workers visibly abandon stations once stopped. Bank into main furnace district.

Optional **Flint's Own Work**, delivery: recover a confiscated blade blank and return it; fixed rare **Forgeguard** sword or a compatible same-tier reward choice if current class cannot use it. Class access rules remain broad. Flint's work becomes a recognizable later hub improvement hook.

### Part two: The Great Furnace

1. **The Foreman's Orders — Pike, conversation.** Use a genuine maintenance fault and found work schedule to divert patrols. Blunt insistence without proof triggers a combat entrance, not a main lock. Pike remains programmed, not morally persuaded.
2. **Get Them Out — Martin, field.** Open worker passages and set signal bells in one of two sequences: early evacuation leaves more enemies on your approach; quietly stopping transport reduces patrols but requires optional navigation. Both protect required NPCs without random escort deaths.
3. **Cool the Heart — main machinery encounter.** Redirect cooling channels to expose the Colossus platform. This changes safe routes visibly. An optional pressure branch opens a concealed maintenance loop; completing it weakens one arena hazard without trivializing boss.
4. **A Cage That Moves — optional discovery.** A small fire creature powers a work cage. Disconnect heat pipes in correct order to free it and unlock a secret combat companion. No dialogue claims it is a Hollowed soul. Exact creature model/name is a content choice, not new central magic law.

**Boss: Ember Colossus.** Very large construct/creature affiliation to be confirmed from existing assets; sustained by forge machinery, not a new Gate. Multi-height industrial horseshoe around main furnace, with ramps and risky quick jumps. Cooling its armor exposes attackable joints at ground-accessible stations. Broad sweeps and heat vents have clear tells; finite repair crews create a mid-fight priority change. Falling returns player to lower safe recovery with a penalty tuned later, not unavoidable death. No attack requires owning a fire/ice weapon.

**Five Pyromancer shards:** ED-01 half1 side casting mold reached when line stops; ED-02 half1 Flint optional work reward (separate from sword, same completed branch); ED-03 half2 difficult overhead pressure route; ED-04 half2 fixed cooling-pattern puzzle with gauges/shapes; ED-05 boss area hidden service pocket behind a cooled pipe, accessible after victory. Not randomly sprinkled in lava.

**Healing/story:** limited pads at worker break room and boss approach. Freed workers restore a service lift. Martin's recovered cargo papers mention confiscated Sunspire writings; Flint remembers sailors talking about its question-answering orb. This establishes a hopeful rumor and coastal route, not an early oracle answer. King's orders now single out the troublesome fighter, without confirming ancestry.

## 6. Storm Coast — Shipwreck Shore / Thunder Cliffs

**Purpose and feel:** reach remote Sunspire through the only usable sea approach. Teal water, silver rain, orange ship timbers, dark cliffs. Explore looping wrecks and beach caves, sail a focused obstacle course, then ascend switchback cliffs with glimpses back to arrival bay.

### Part one: Shipwreck Shore

1. **Something That Floats — Otto, delivery chain.** Repair a small wrecked vessel: rudder inside a tilted hull with changing walking angles; sailcloth from a contested lookout; rope from a tide-exposed storage cave. Each is a different route/interaction, not three identical fetch camps. Otto visibly installs returns as they arrive, no extra long walk per individual material.
2. **Rose's Last Voyage — optional delivery/conversation.** Captain Rose asks for a ship's bell from his former vessel. Explore it and discover a crew record. Return with honesty about what happened, tactful reassurance, or dismissive mockery. Respectful routes award a shard and useful crossing advice. Dismissiveness closes reward until a hinted act of respect at the wreck memorial; continued hostility can forfeit this shard for the run. Boat departure remains available.
3. **Survive the Crossing — field mini-game.** Start with forgiving steering among buoys and wreckage, then a short boarding fight while vessel moves along a safe broad lane, then storm obstacle approach. In co-op helm and combat roles swap at a sheltered lull if length supports it, with clear ready interaction. Solo alternates demands; no simultaneous precision steering and essential aiming. Standard weapon combat on stable deck during boarding, no separate mandatory gun item.
4. Land at Thunder Cliffs and bank first-half rewards. Failure before landing restarts first half under approved checkpoint rule; to avoid punishing reconstruction excessively, build route shortcuts and tune voyage forgivingly. No extra voyage checkpoint silently added. A generous repair opportunity within voyage is not a permanent checkpoint.

Optional code chest: three engraved ship symbols order counts of intact lanterns visible around one wreck. Generated counts and code agree, persist per attempt; destroyed props cannot erase clue state.

### Part two: Thunder Cliffs

1. **The Path Above the Sea — discovery/field.** Reach a broken cliff lift, repair its mechanical brake and climb an alternative ladder to release it. Lifts then connect lower beach and middle ledge. No mandatory wait for randomly timed weather.
2. **What Holds It Here — Abe, field.** Abe describes the hydra struggling against its chains. Player inspects a broken shackle and sees rub marks/anchors. This establishes a merciful objective before boss, without a speech during incoming attacks.
3. **Dash's Claim — optional encounter.** Find Dash beyond a challenging rock arch; he boasts of a wreck cave he cannot open. Player may cooperate and split its ordinary treasure, challenge him to a safe route race, or leave. Two routes open the puzzle chamber, neither needs Pirate. Shard physically in cave, individually collected, not transferred from another player.
4. Open the upper approach to the hydra. A visible stair beyond shows why getting past it leads toward the palace.

**Boss: chained sea hydra.** Three heads, enormous body mostly below water; reuse shared skeleton/materials with distinct head timing. Arena of stone ledges, tidal pools and broad connecting paths. Bite anchors neck briefly, sweep invites horizontal retreat, water blast demands cover. Break exposed neck restraints/anchors during recovery; ordinary damage to heads can stagger but is not required to kill it. Each restraint removed changes attack distribution and relieves tension visibly. No adds. Freed creature retreats into sea and exposes climb; no deceptive last attack after victory. Coop restraint progress shared; melee and ranged both reach targets.

**Five Pirate shards:** SC-01 half1 tilted-hull crawlspace puzzle; SC-02 half1 Rose bell/memorial shared reward; SC-03 half2 Dash cave physical pickup; SC-04 half2 thunder-cliff side climb with stable wind warning; SC-05 half2 tidal-stone sequence opens inland grotto, optional no NPC hint. All five available before hydra, none during a one-shot sailing pass.

**Healing/reward:** limited pads beach work area and middle cliff ledge. Safe boat prep space, no infinite refill mid-boss. Optional fixed rare crossbow **Stormshot** from code chest, appearance sail-pattern reward from Dash cave. On return Abe can acknowledge freed hydra. Storm Coast's victory is freedom, not a monster corpse.

## 7. Sunspire Palace — Palace Courtyard / The Sky Library

**Purpose and feel:** reclaim a palace of knowledge and ask the orb how to reach the King. Sunlit white marble, tarnished gold, hanging greenery and occupied balconies. Garden loops beneath elevated reading halls; later rotate walkways through a central library, not another lost scholar city.

### Part one: Palace Courtyard

1. **A Place to Stand — Sister Grace, field.** Reopen a sheltered court for survivors. Remove Legion control from a water/door mechanism, not a kill-everything quota. Grace cares for people while asking player to preserve useful structures.
2. **The Defender's Route — Victor, field.** Disable two occupied defensive positions through one of two approaches: open balcony combat or lower garden mechanisms. Lift bridges connect the routes, giving different traversal without separate mandatory questlines.
3. **Light the Way — fixed required puzzle.** Align marked shutters and mirrors so an emblem forms across a sealed entrance. Shapes and beam endpoints support color-blind/low-particle settings. Incorrect alignment harmless. Opening the library banks half one.

Optional **The Garden Still Lives**, discovery/delivery to Grace: restore an irrigation path and bring undamaged seeds from greenhouse. Visible flowers/water return; reward a refuge garden upgrade (cosmetic/social utility, exact passive bonus undecided). A guardian's memorial niche rewards optional precise climbing, not required Paladin ownership.

### Part two: The Sky Library

1. **Knowledge Under Guard — Master Hugh, field.** Reclaim access permissions held by occupying troops. Hugh initially insists on protocol. Player can persuade him through practical evidence that people are in danger, accept a short demonstration of care for records, or take an independently readable maintenance route. Main access cannot be permanently denied for being rude.
2. **The Frames That Fell — field/story.** Broken display mounts and preserved notes establish a scholar deliberately cast crystalline training rifts away to keep their disciplines from the Legion. Avoid naming original creators or inventing new Bladeborn mechanics. Lore reinforces Rift Hall, not requiring every secret class for campaign completion.
3. **Where the Souls Went — proposed evidence scene.** Hugh's records describe a way to briefly see the trapped souls through a captured Hollowed soldier's vacant eyes. A restored viewing frame could make this visible to whole party. THIS IS A PROPOSAL for the explicitly open soul-viewing mechanism; do not code it as canon without resolving that choice. Must show real souls before finale and not free them prematurely. The orb's one question is not spent on this.
4. **One Question — after defeating Colossus.** Reach orb in its protected chamber. Proposed fixed campaign question: "How can I reach the Abyss King?" It shows Castle Duskmoor's location and usable approach. Optional reflective dialogue before asking can vary tone, but no joke option wastes the only required answer. King/binding knowledge comes from records/evidence, not a second question disguised as one.

Optional **Simon's Restricted Shelf**: rotating shelves and moving walkway form a navigable spatial puzzle. Simon can offer one clue if asked, but player can solve unaided. His humorous account of palace rules has a sincere reason: knowledge was protected from everyone, including those who needed it. A separate rescue route on high nesting terraces begins a limited-flight dragon companion reward; confirm model/control scope before treating as a small extra.

**Boss: Marble Colossus.** Huge circular reading hall broken into curved balconies, broad ground aisles and a central plinth. Redirect movable protective screens so its own heavy attack opens armor seals. Safe floor; environmental interaction necessary but no constant burn tiles. Solo boss, long clear tells, telegraphed falling books/stone only at authored moments. Full fight possible on ground with alternate upper shortcuts. Its occupation/control method must be consistent with existing guardian identity, not silently classify a construct as living Hollowed.

**Five Paladin shards:** SP-01 half1 garden roof route; SP-02 half1 Grace optional garden/shared reward; SP-03 half2 Simon shelf puzzle physical pickup; SP-04 half2 damaged display room hidden passage using missing-frame shapes; SP-05 half2 optional guardian-vow challenge with a noncombat objective (protect three archive stands during one short encounter), before boss. This repeats defense once with a different objective, not another 30-second breach.

**Healing/reward:** proposed second rare large pad restored in safe courtyard through main liberation; limited pad lower library. Dragon/appearance/unique gear are optional and bank only with completed half. Exact dragon quest stays a separate companion task; five shards never depend on flight or owning Paladin. Story leaves player with proof, destination and hope, not explicit Bladeborn confirmation.

## 8. Castle Duskmoor — Castle Gates / Long Ascent

**Purpose and feel:** get inside prepared enemy headquarters and end the King's rule. Imposing stone/black iron exterior, narrow living service spaces, then a massive spiral staircase rising through an immense tower to the King's summit arena. U107 explicitly approves an intense, large, epic ascent. Broad combat landings, damaged stair sections, side chambers and short exterior detours vary the climb while repeatedly returning to the same unmistakable spiral. Show the height above and distance climbed below; do not replace its central identity with unrelated rooms. The only Hollow Gate stands at the summit final arena.

### Part one: Castle Gates

1. **Look the Part — Roland, delivery.** Recover matching Legion armor pieces and credentials from maintenance/supply routes. Proposed disguise as temporary appearance layer, preserving actual equipment stats/fittings; exact equipment presentation needs review. Roland helps fit it, providing visible before/after without deleting gear.
2. **Know the Orders — discovery.** Guard lists, work bells and a routed supply wagon reveal enough information to answer Cross. Journal records concise factual clues without labeling correct dialogue choices.
3. **At the Gate — Captain Cross.** Two or three choices per step, usually two rounds. Correct disguise plus consistent answers grants a quiet entry; inconsistency prompts a recoverable follow-up where evidence can help. Continued failure starts the explicitly difficult horde. No random success roll pretending to test reasoning; personality tone may change his response but facts matter. Player may deliberately choose assault instead of disguise.
4. Either entry route opens interior checkpoint and banks half one. Enemy/reward tuning avoids making failed stealth the only lucrative route; both receive main completion rewards once.

Optional **The Armor He Kept**: Roland wants an old personal piece recovered from a confiscation room. Choice to return or keep valuable gear changes his optional help; returning it earns shard reward. Threatening him can close that reward but never blocks a direct assault. Hidden supply-balcony parkour offers another shard. No need for any particular class to wear disguise.

### Part two: Long Ascent

1. **Below Their Notice — Miles, optional discovery.** Find living servant hiding in service rooms. A safe route exists without him; helping move trapped workers opens a dumbwaiter shortcut and a side vault. His humor is brief relief: "They don't sleep. Somehow they still need bedrooms cleaned."
2. **Climb the Tower — field.** Ascend the massive central spiral through defended landings, a broken stretch requiring a short exterior crossing, and a final exposed upper climb. Side routes rejoin rather than bypass the entire staircase. A required door mechanism uses two latching controls reachable sequentially solo; co-op can split naturally. Unlock a service lift back to a useful lower landing to shorten optional backtracking. Maintain intensity with authored fight/traversal escalation and brief safe recovery pockets, not uninterrupted enemy spam or repeated identical flights.
3. **The King's Preparations — environmental story.** Observe equipment and commands about soul-energy infusion. A black view of the central Gate appears near top, not friendly purple glow. Do not reveal full second phase or player's ancestry in a convenient diary.
4. **No One Left Below — optional field.** Free remaining living captives before entering throne approach. Miles can comment in person if helped; otherwise environmental signs support discovering it. Reward a strong refuge upgrade and an optional shard branch, without making all five depend on his survival as an escort.

**Boss: Abyss King.** Large enclosed throne hall with open roof damage and the one enormous black Gate physically present. Phase one: half-infused body, readable heavy melee versus soul-energy attacks, pillars interrupt some attacks but not permanent safety. Fight stays mainly flat with connected raised side walks; camera always shows ground tells. Short dialogue beats pause combat for whole party. Recognition occurs only during fight.

Phase transition: King fully plunges and uses power already harnessed to barely return. Phase two changes attack cadence, space distortion and finite summoned threats while keeping visual hierarchy. Safe regions always reachable; no simultaneous unreactable attack patterns. His power borrows souls, never destroys them. Defeat destabilizes binding, pulls party into Void; no campaign-complete popup before restoration.

**Five Necromancer shards:** CD-01 half1 Roland return/shared reward; CD-02 half1 supply-balcony route; CD-03 half2 service vault fixed mechanical puzzle; CD-04 half2 captive-release shared reward through Miles or independent controls; CD-05 half2 hidden upper memorial chamber, no pickup during unrepeatable ending. Two/three split, all bank at latest boss entry. Trial portal remains unavailable until campaign ending succeeds; show "Finish the campaign" alongside 5/5, not lost shards.

**Ending sequence:** enter Void -> Ian spirit confirms Bladeborn and can reveal adoption without inventing exact parentage -> temporary Ian's Blade -> timed repeated Space charging -> sever binding -> all souls return, even killed Hollowed reconstructed -> player escapes -> hopeful world changes. Five failed charges offer skip; retry charge only. Ian explains deceased Bladeborn legacy realm without resolving all cosmology. Temporary blade restoration must return original equipment and not grant permanent ownership. Exact explanation why blade not retained remains an explicit lore decision, not an implementation accident.

**Healing/rewards:** limited supply-room pad and pre-boss rest. Optional legendary chest uses a fixed multi-step environmental puzzle; no mandatory grind before boss. Postgame hub shows rescued people/changed dialogue and Necromancer trial availability, preserves demanding permanent Ian's Blade path. NG+ explicitly reopens campaign with retained character progression.

## Hub, Rift Hall and optional return visits

- All current service NPCs get once-per-save introductions, short new-story markers, direct shop access and optional What changed? dialogue. Do not interrupt shopping every visit.
- Repurpose old recurring Shade as ethereal Rift Hall guide; working title **Rift Keeper**, no personal name fixed. Separate room with eight clearly labeled frames, region name, banked X/5, brilliant completed purple portal. Current-half provisional count appears distinctly, not as banked progress. Necromancer frame also indicates ending requirement.
- Mentors live in their own practice spaces and teach class identity through challenges, not generic kill quotas alone. Berserker controlled aggression; Ninja routes/timing; Reaper sustain and openings; Chronomancer timing; Pyromancer prepared ignition; Pirate mixed weapons; Paladin protection; Necromancer command/positioning. Exact skill kits and trial scripts separate design pass before implementation; no automatic difficulty hike outside requested Reaper shard hunt.
- Return quests should expose genuinely new small content: Smith wants a forge pattern after Emberdeep; Beastkeeper follows tracks after a companion rescue; Quartermaster restores supplies after Keep; Thomas reacts to reports and later asks for one family keepsake. New objects only appear after relevant hook; journal clearly distinguishes these from a replay of main story. No mandatory backtracking to stretch campaign.
- Optional ground mount proposal: a freed pack animal in Hollow Pass/Keep return adventure. Dragon proposal: late Sunspire nesting rescue. Mount button toggles, movement restricted to supported surfaces/flight budget, no bypass of required world-state gates. Rider attacks remain unresolved; do not let mount scope silently grow.

## Dialogue and puzzle authoring contract

Each authored scene will have stable scene/line IDs, speaker, short actor context, emotional tone, entry condition, choices, visible consequence, exit/resume state and quest/world effects. Main path normally 2–3 options that reconverge, with a few authored optional closures and repair routes. Script text at this stage is illustrative, not final recording copy. Voice Studio exposes scene order and edits with approval/version tracking.

Each puzzle will define its clue objects, inferred rule, solo solution, co-op shared state, failure/reset behavior, reward and checkpoint lifetime. Dynamic code locks are limited to a few optional chests; codes generated with clues and stored in the authoritative attempt seed. Late joiners see existing values. No changing solution on menu reopen or mid-puzzle disconnect recovery.

NPC and puzzle markers: brief readable intent icons, one E target selected by distance plus view direction; ignore occluded/noninteractive scenery. Quest markers distinguish available conversation, turn-in and new news; don't plaster exclamation marks on every NPC. Optional objective arrows show known tasks, never unseen shard coordinates. Journal summarizes discovered clues without solving them.

## Grounded implementation order and checks

Inspected current public/3d/index.html: ZONES near 2677 holds areas/sides; areaQuests/questBump near 2821–2840 currently expose all area quests and auto-award completion; enterZone/loadArea near 4236 currently bank once at entry; autosaveRun near 1114 writes live-run state; startTrial and enterSide use old direct side-to-trial mapping. These must change together. Do not bolt dialogue onto the existing all-objectives gate and accidentally make optional quests mandatory.

1. Finalize cross-level plan and explicit open decisions below; record accepted revisions. Prepare content schemas for quest activation, physical versus shared rewards, dialogue scenes, puzzles, IDs and graph validation.
2. Implement equipment/progression batch and save foundations first. Add versioned half baseline plus provisional transactions; persist enough shared state for co-op restore without granting duplicate rewards. Do not overwrite legacy snapshots until migration validates.
3. Implement NPC conversation/quest/journal/puzzle systems, voice-ready line data, interaction targeting, settings and Rift Hall foundations. Then author Briar as first complete content slice with automated route validation and real browser QA.
4. Proceed Hollow -> Keep -> Frost -> Ember -> Storm -> Sunspire -> Duskmoor, back-to-back once plans settled. Each region includes both halves, NPC branches, five shard paths, boss, art/collision/camera/telegraph checks and preview screenshots. Continue autonomously through routine decisions; do not stop for a new approval between every completed batch.
5. Build sailing and final ending as isolated testable sequences; synchronize pause/roles and shared scene decisions. Integrate companion/mount and Voice Studio tasks in dependency order, not as forgotten polish.
6. Test every required path under each dialogue outcome, all five shards in one valid run, missed-shard replay, every physical pickup by each player, shared NPC rewards once, repeated turn-ins, falling/puzzle resets, interrupted conversations, reconnect, banked/unbanked state, boss retry and five-charge-failure skip.
7. Measure frame time/draw calls/texture memory before and after each larger region on representative browser hardware. Reuse mesh/material resources without repeating entire spaces, load by region, keep distant NPCs simple, avoid stacked coplanar surfaces, cap transparent effects and simultaneous high-cost attacks. No numerical performance claim without measurement.
8. Balance XP, rarity requirements, intrinsic rank-10 weapons, player multipliers, companions and difficulty after content routes work. Use fixed representative gear and solo/co-op runs, not god-mode success as evidence.

## Explicit remaining choices (do not silently make major canon)

- Proposed soul evidence: a Sunspire viewing frame showing actual imprisoned souls through a Hollowed person's eyes. This preserves one-question orb; user has not yet chosen this precise mechanism.
- Exact genealogy and why Ian's temporary Blade is not retained remain open; finale writing must avoid invented direct descent or permanent award.
- Exact disguise equipment presentation, mount rider attacks, multiplayer final-charge contributions, conversation-vote timeout and special hardcore/hitless save behavior require scoped implementation designs. Standard campaign checkpoint rule is now settled.
- New item names, rarities, companion models and exact puzzle layouts are editable content proposals. No requirement to adopt every illustrative reward if it conflicts with actual item schema; preserve reward purpose and document substitution.
- All named NPCs approved; their individual branching lines and the designs in this draft can be revised during review. Do not reopen approved names or ask broad creative questions already answered.
