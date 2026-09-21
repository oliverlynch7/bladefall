# Bladefall — reconciled requirements register

Baseline: September 19, 2026 (America/Los_Angeles). Owner: Oliver. Source range: U002–U105 in [the original source record](requirements/USER_SOURCE_2026-09-19.md) and [its continuation](requirements/USER_SOURCE_2026-09-19_CONTINUED.md). Current creative draft: [complete campaign expansion plan](CAMPAIGN_EXPANSION_PLAN.md). This is the primary implementation checklist, not a claim that the features are shipped.

## Authority and status

Oliver's latest explicit instruction wins. This register reconciles the available conversation; the verbatim messages remain authoritative if a paraphrase omits detail. Read the full 100-section lore brief in U079 for story work. Do not promote an assistant suggestion into approval just because it appeared in a table. Read [the continuity workflow](requirements/CONTINUITY.md) before editing.

Decision labels: **A** approved requirement; **P** proposal/preference awaiting a precise design decision; **O** unresolved; **S** superseded. Implementation status for every requirement below is **UNVERIFIED** unless a later evidence entry explicitly proves otherwise. Some earlier work was reported shipped; that is not a substitute for checking current code and testing. Planning documents alone never count as implementation.

## Preservation and scope

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| GOV-01 | A | Preserve original user wording, source IDs, corrections and rejected ideas. Maintain one current register plus append-only decisions and verification evidence. No silent deletion of requirements. | U098–U099 |
| GOV-02 | A | Every main level gets a substantial redesign, not just Briar Town or a visual pass: both halves, landscape, routes, people, quests, puzzles, secrets, interactables and encounters. Discuss level/NPC purpose outlines before building all content in one pass. | U069–U070,U097 |
| GOV-03 | A | Core campaign comes before secondary portal modes such as Abyssal Descent; retain those modes as later scope rather than forgetting them. | U025 |
| GOV-04 | A | Browser performance is a hard constraint. Keep the icon-inspired voxel/low-poly direction, distinctive level palettes and silhouettes; do not pursue realism or excessive polygons. | U004–U005,U009,U039,U079 §74 |
| GOV-05 | A | Preserve preferred existing player models, animations, weapon models and hand-adjusted fitting; fix fit and equipped-model selection. Experimental Warrior replacement was preview-only and not adopted. | U036,U059–U061 |
| GOV-06 | A | Provide mobile-viewable screenshots of worlds/enemies and animation previews for QA. Explain completed work and what comes next. Main production target is bladefall.pages.dev; earlier autopilot preview was an earlier target. | U008,U012–U013,U029,U035,U051,U054 |
| GOV-07 | A | Draft all remaining campaign levels before the back-to-back implementation run. Do not require a fresh broad design approval between every level once plans are settled. Continue validation per batch; user review may steer work without requiring a stop after Briar. | U105 |

## Equipment, classes and progression

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| EQ-01 | A | Class access should use broad weapon families rather than narrowly restricting individual weapon types. Keep distinct models/basic/charge behavior. Hybrid access counts toward each family. Paladin = Mage + Warrior; Ninja = Ranger + Warrior; Reaper its own category. | U091–U094 |
| EQ-02 | A | Daggers belong to Ranged access: fast short-reach normal strikes and a charged ranged throw. Javelins have slower, longer-reach normal attacks and a charged throw. | U093 |
| EQ-03 | A | Guns are Pirate-exclusive; Pirate can equip other Ranged weapons. Empty Pirate weapon slot activates flintlock plus off-hand saber. Auto fires high-damage cannonball-like projectile at moderate speed; charge is strong saber swing. Combo is intrinsic, not a bag/rarity item. | U093 |
| EQ-04 | A | Monk fists are intrinsic Monk equipment, not general loot; use the same power-progression principle as Pirate. Do not remove Monk now: possible future removal is undecided. | U093 |
| EQ-05 | A | Reaper scythe is intrinsic, not a regular drop/rarity upgrade. Remove existing inventory/equipped scythe loot safely and use intrinsic scythe for Reaper. No compensation necessary. Preserve unrelated save state; no corruption. | U094–U095 |
| EQ-06 | A | Intrinsic class-weapon upgrades cap at class rank 10. Player level continues globally increasing stats and damage across all classes and combat through multiplicative scaling. Audit derived hits/summons/status effects to avoid missing or double-applied scaling. Exact curves come from playtesting. | U094,U097 |
| EQ-07 | A | Grant All Weapons cheat reflects current valid bag weapons; excludes intrinsic Pirate combo, Monk fists, Reaper scythes and retired entries. Include new valid dagger behavior. | U095 |
| EQ-08 | A | Bag groups weapon types and armor/equipment types into neat collapsible sections, all collapsed whenever the bag is newly opened. | U093 |
| EQ-09 | A | Prevent off-class equips; class change equips a compatible owned weapon or a compatible fallback. Regular-class fallbacks are considerably weaker than most loot; intrinsic Pirate/Monk/Reaper equipment follows later progression rules instead. Fix trials labeling their own defaults off-class. | U061,U093–U094 |
| EQ-10 | A | Match weapon appearance/color to item icon and element, retain fitted attachments and show the selected weapon rather than always the class default. Remove white icon backgrounds. | U036,U061 |
| EQ-11 | A | Player/class level-up have distinct triumphant audio and visible celebrations. Player level-up shows stat increases and newly available gear explicitly. Prevent attack-clicks accidentally choosing skill/passive upgrades. | U084 |
| EQ-12 | P | Upgrade-choice confirmation and/or brief input-safe entrance animation are proposed solutions. Preserve deliberate selection without arbitrary extra friction. Armor rarity becomes available too early relative to weapons: tune closer together after XP/expanded-level tests. | U084 |
| EQ-13 | A | Add cheat to lower player level, minimum zero. Hub state/cheat changes save reliably. | U073 |
| EQ-14 | A | NG+ resets main-campaign level locks/progression and scales difficulty while keeping money, player/class levels, classes and items. Older NG+ removal instruction is superseded. New shard/quest reset details need explicit treatment. | U061 |
| EQ-15 | A | Pyromancer is the approved Emberdeep class name. Reject Firebinder. | U090–U092 |
| EQ-16 | P | Pyromancer Magic + Ranged hybrid direction is supported by the discussion, but its exact four skills, subclasses, heat system and numerical tuning are not approved designs. Do not copy an assistant kit as locked content. | U092 |

## Campaign structure and exploration

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| LV-01 | A | Expand every level substantially, roughly five times as an ambition rather than a uniform quota. No repeated filler structures, tedious empty walks or identical layouts. Both halves must feel full and varied. | U039,U069–U072,U097 |
| LV-02 | A | Distinct colors, obstacles, assets, hazards, mechanics and navigation per level. Fit verticality to theme; use parkour, alternate routes, shortcuts and rewarding exploration. Provide enough healing for long routes. Difficulty can be tuned later. | U039,U069–U070 |
| LV-03 | A | Secret areas may use hidden tunnels, convincing false walls, mazes, side portals with entry animation and return access, and routes opened through dialogue/puzzles. Mix approaches rather than repeat one template. | U072 |
| LV-04 | A | Main quests, bosses and named leaders serve the central struggle; optional quests may be personal side stories. NPC objectives must have understandable purpose, not arbitrary checkboxes. | U077,U082,U084 |
| LV-05 | A | Vary quests: meaningful fetch/delivery with return; NPC-assigned missions completed in the field without return; player-initiated objectives discovered in the world. Quest chains reveal progressively rather than all unlocked at entry. | U071,U098 |
| LV-06 | A | Preserve the successful hold-the-breach concept and reuse sparingly. Add genuinely different quest mechanics rather than making every objective a timed defense. | U069 |
| LV-07 | A | Some puzzles gate required main passages; most are optional for side quests, valuable distinctive gear, shards and secrets. Hints only sometimes from NPCs; harder puzzles can rely on environment alone. Cryptic but actionable, never useless poetry or automatic answers. | U071,U078,U098 |
| LV-08 | A | Chest tiers common through legendary bias drops toward their tier with occasional lower/higher results. Some chests require three-digit codes inferred from puzzles/counting/environmental clues. | U078 |
| LV-09 | A | Big healing pads are exceptionally rare, grander and unlimited to full health. Small pads are limited and may be scattered along routes. Mara's early quest restores a big pad and teaches this distinction. | U078,U085 |
| LV-10 | A | Fixed major puzzles plus a small number of changing optional code puzzles. Clues and generated answer always agree. Required puzzles test understanding, not obscure guessing; no required clue depends only on color or audio. | U104, approved defaults preserved in continuation |
| LV-11 | A | Environmental interactions have consistent readable cues; puzzle progress visibly changes mechanisms/routes. All co-op puzzles are solo-solvable; extra players can improve coordination without being required. | U104 |

### Region-by-region decisions (all implementation UNVERIFIED)

| ID / region | Approved anchor | Proposed details still needing a level outline |
|---|---|---|
| MAP-01 Briar Town (replaces Outskirts) | Home threatened by approaching Legion; ordinary farmers, local people, Mara, scrappy spear defenders, adoptive father. Father reluctantly helps because player will not back down. Berserker fits emotional response. Sources U084–U085,U090,U098. | Homefields / Black Woods naming pair; injured scout/local defender roles and exact quests. |
| MAP-02 Hollow Pass | Maintain distinct terrain and purposeful story progression; Ninja trial remains working mapping. Sources U084–U085,U097. | Winding Cliffs / Lost Canyon; prisoner transport interception; escaped prisoner, climber and officer encounter. |
| MAP-03 Ruined Keep | Reaper trial belongs here; shard collection should be especially challenging because class is powerful. Sources U090. | Broken Walls / The Dungeons; prisoner escape, locksmith, captive guard and old passages; harder optional puzzles/fights rather than obscure random placements. |
| MAP-04 Frostfell | First half mountain climb, second ice cave exploration; keep elemental variety. Source U085. | Snowbound Peaks / Deep Ice Caves; rescuing former Gate researcher, guide, link to Emberdeep; Chronomancer mapping retained pending full outline. |
| MAP-05 Emberdeep | Legion weapon production; shut it down to limit arms. Pyromancer unlock. Sources U085,U090,U092. | Iron Halls / The Great Furnace; captive smith/workers, machinery routes and escape plan. Not Gate-frame production. |
| MAP-06 Storm Coast | Replaces old Abyss level. Shipwreck Shore / Thunder Cliffs accepted. Seek remote Sunspire and its rumored orb: boat crossing to island, climb cliffs to palace. Pirate trial. Build ship from supplies, steer playable obstacle/combat crossing at end of first half. Sources U088–U089. | Boatbuilder, sailor, cliff resident; exact supply encounters, sailing controls and duration. Co-op rotates steering/fighting if sequence has room, never force bloat. U097. |
| MAP-07 Sunspire Palace | Beautiful elevated marble palace/library of sacred wisdom, seized by Legion for knowledge. Retake it and access formerly restricted magical orb allowed one question; seek King's location/how to reach and stop him. Paladin unlock. Sources U086–U087,U090. | Palace Courtyard / The Sky Library; caretaker/record keeper/defender; exact single-question wording and answer scope. Do not silently promise multiple omniscient answers or reveal player early. |
| MAP-08 Castle Duskmoor | Hidden distant castle, revealed through Sunspire. Disguise set quest and guard dialogue can avoid extremely hard horde. Part two: massive intense spiral staircase ascending to tower peak and Abyss King, epic scale. Single central Hollow Gate visible from summit final arena. Necromancer unlock after castle. Sources U079,U085,U090,U107. | Castle Gates / Long Ascent; servant/armor maker, exact infiltration clues and varied spiral landings/detours. Trial available after ending was a proposed default broadly accepted during planning, not yet implemented. |

Working half names remain proposals where not explicitly accepted. U103 approves the revised NPC names and broad personalities: Thomas/Mara/Gus/Lewis/Beth; Caleb/Skip/Captain Ward/Ruth; Grant/Felix/Walter/Sly; Heath/Professor Ellis/Hugo; Flint/Jack/Foreman Pike/Martin; Otto/Captain Rose/Abe/Dash; Sister Grace/Sergeant Victor/Master Hugh/Simon; Roland/Gate Captain Cross/Miles/Abyss King. Thomas is dad. See the preserved assistant naming proposal referenced by U103 and CAMPAIGN_EXPANSION_PLAN.md for roles. Do not give every region equal NPC counts. Unknown creators, relatives, magic rules and connections stay open.

## Boss and combat presentation overhaul

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| BOSS-01 | A | Major redesign of every boss and arena is authorized. Bosses obstruct objectives, not arbitrary end-of-level decorations. Person-like leaders generally Hollowed; independent beasts or controlled animals allowed. | U080,U084–U085,U097 |
| BOSS-02 | A | Vary size, number, grounded/flying styles, solo/add fights, interior/exterior, large/small arena, flat/vertical/horizontal parkour and environmental tools. Not every arena a flat square circle-strafe fight; not every arena needs hazards. | U084–U085 |
| BOSS-03 | A | Storm Coast massive multi-headed hydra blocks ascent. It is chained, provoked, defending itself; victory attacks neck restraints and frees it mercifully rather than killing it. | U088–U089 |
| BOSS-04 | P | Working lineup: Brute town defenses; Marksman canyon cover; Fallen compact indoor duel; three Frost officers on cavern elevations; enormous Ember Colossus forge machinery; Marble Colossus environmental openings. User approved varied direction, not every exact mechanic/name/phase. | U084–U085,U097 |
| BOSS-05 | A | Remove early Abyss King fight. Earlier commander replacement was superseded in that region by Storm Coast/hydra. Keep partial and fully infused King together at final castle. | U080,U088–U089 |
| FX-01 | A | Audit all class 1–4 skills, all weapons' basic/charged attacks, all enemy/boss attacks and body animations. Unique satisfying effects that clearly communicate attack/defense/utility; not recolored shared AOEs or shield cubes. Paladin Smite golden lightning from sky. | U041,U044,U046,U054,U061 |
| FX-02 | A | Every damaging enemy/boss attack readable and skill-dodgeable. Death spore burst needs warning/delay for melee escape. Redesign green translucent square hazards, use sparingly in sensible locations. Fix overlapping-asset flicker globally. | U042 |
| FX-03 | A | Strong obvious deaths: immediate fade and possible red hit flash; approved death look should be preserved. Particle-off setting must work. | U055–U056 |
| FX-04 | A | Rounded higher-definition elemental/spiritual projectiles. Paladin natural fitting recolor. Better detailed NPC/companion models without losing browser performance. | U061 |
| FX-05 | A | Keep walking while attacking/casting when player moves. Select short rooted casts only where intuitive and useful for balance. Dash trail matches current character. Loading screen hides old art and reduces initial stutter. | U061 |

## Rift Shards and trial lore

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| RIFT-01 | A | Five unique shards per region, distributed across both halves; optional hidden boss-room corner sometimes. Mix physical secrets, puzzles, NPC reward and clue-led discoveries. Possible to earn all five in one successful playthrough; choices may close optional shard access for that run. | U071–U072 |
| RIFT-02 | A | Strong purple crystalline presentation and upgraded pickup assets. First Briar shard intentionally easy; animation/audio explains what it is, five needed, purpose and where to use them. Never confuse with huge black Hollow Gate. | U073,U084–U087 |
| RIFT-03 | A | Separate Rift Hall room declutters hub. Each region clearly labeled with permanently collected X/5; complete frame brightly lights and opens its class trial. Hub NPC assembles shards. | U072,U085 |
| RIFT-04 | A | Rifts are themselves crystalline magical portal structures, not crystals holding separate portals. Palace scholar deliberately threw them out during takeover to preserve fighting knowledge; fall shattered/scattered them. Creators remain unresolved. | U086–U087 |
| RIFT-05 | A | Unique class-specific mentor in each trial teaches discipline after player proves worthy. Remove repeated campaign Shade role; repurpose ethereal guide in Rift Hall explaining lore and shards. New guide name not locked. | U085–U087 |
| RIFT-06 | A | Final mapping: Briar Berserker; Hollow Pass Ninja; Keep Reaper (harder shards); Frostfell Chronomancer; Emberdeep Pyromancer; Storm Coast Pirate; Sunspire Paladin; Duskmoor Necromancer. Do not use older Paladin/Ember or Necromancer/Palace mapping. | U088–U092, retained existing Ninja/Chronomancer assignments |

## Saving, co-op and state

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| SAVE-01 | A | Verify player levels, class ranks and all character state persist correctly. Hub auto-saves gains, spending, cheats and mode rewards continuously at meaningful transactions. | U061,U073 |
| SAVE-02 | A | Collected shards only become permanent on completing their half. First-half completion banks those even if second half/boss later fails. Second-half entry to boss banks second-half shards. Unbanked shards lost on failed half; banked duplicates gray out or award gold. | U073 |
| SAVE-03 | A | Death restarts beginning of the current half and undoes that half's progress, not the entire level. Keep earlier banked half. | U075 |
| SAVE-04 | A | RESOLVED: quit/disconnect keeps completed halves and their banked progress, discards unfinished-half gains, resumes at current half's beginning, matching death checkpoints. Preserve completed-half character state, XP/gold and shards; hub auto-save remains. This supersedes original whole-level quit rollback. | U073,U075,U105 |
| SAVE-05 | A/O | Dialogue/world progress resets for replay/restart, while leaving an NPC conversation alone resumes at the same point that run. Hub first introductions once per save. Exact checkpoint snapshot/reset treatment for shared world and optional rewards needs tests and a defined contract. | U072,U075,U078 |
| MP-01 | A | Shared campaign quests, dialogue, puzzles, unlocks/environment changes, enemies and enemy health synchronized. NPC interaction pauses all players and frames same NPC/dialogue for everyone. | U072,U075–U076 |
| MP-02 | A | Environmental shards require each player to physically collect them. NPC quest progress and rewards apply together without making every player repeat conversation or turn-in. | U075–U076 |
| MP-03 | A/P | Conversation initiator chooses by default. Optional voting proposed: majority wins, tie random among tied options; both see same resolved line. Exact timeout/disconnect handling remains design work. | U073 |
| MP-04 | A | Teammates show actual current class/full model, character name, health bar and small class label; subtle and toggleable. | U075 |
| MP-05 | A | Sailing has steering/combat roles; swap if there is enough meaningful room in the sequence. Solo must remain playable. Do not stretch crossing just for a swap. | U089,U097 |

## Dialogue, journal, clues, UI and voice studio

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| DLG-01 | A | ALL game wording middle-school-readable, including menus, lore and directions. Cleverness and depth welcome; avoid obscure vocabulary, unclear poetic instructions and exposition overload. Voice-typed Earth/Erith means Aerth. | U071,U077–U079,U087 |
| DLG-02 | A | Conversations zoom neatly to centered NPC, side menu for quests/options, pause fighting, exit anytime, resume at same position this run. NPC text reveals progressively; selected player response remains in smaller text during answer. | U071–U073 |
| DLG-03 | A | Meaningful choices affect assistance, access, quests/rewards or reactions. Humor, surprise, emotion, serious characters and mixed personalities. Can upset NPC/close optional opportunity, but never required campaign softlock. Hinted natural ways to repair relationships, not blunt arbitrary chore demands. | U071–U072,U078 |
| DLG-04 | A | Manage branching and recording workload: choices should feel real without exponential options or overwhelming fear of missing paths. Discovered NPCs need not be marked main objectives. Vary count across regions. | U071,U078 |
| DLG-05 | A | All hub NPCs introduce themselves and services once per new save, never repeatedly. Campaign milestones add visible new dialogue, clues, side quests and return trips with newly appearing objectives. Separate shopping from optional What changed? dialogue. | U077–U078 |
| DLG-06 | A | Visible world consequences: restored pads, moved/open routes, assistance, spawns and useful NPC overhead state markers. No purely invisible completion. Marker icon vocabulary still design work. | U078 |
| DLG-07 | A | Names familiar, distinct across whole cast, suited to personality/role. Avoid tongue-twisting fantasy names and similar names such as Pell/Nell except intentional relatives. Revised cast approved, Thomas for father. | U102–U103 |
| DLG-08 | A | Choices accurately convey player's intended speech; no good/bad labels or surprise harsher wording. Leaving never selects an option; resume position retained during visit. Skipping text reveal cannot accidentally select next response. | U104 |
| UI-01 | A | Simple journal of relevant current-level tasks/clues, not every remark. Keyboard shortcut (J proposed). Bag shortcut B approved. | U078 |
| UI-02 | A | Optional directional objective arrows; subtle horizontal rotating cardinal compass. | U071 |
| UI-03 | A | Rebuild buggy E prompts with smart target selection/readable interaction. Widen upper-left HUD to avoid overlap; unique main-menu icons; logically organized settings. | U061,U078 |
| UI-04 | A | Fix the hub mirror regression and verify appearance changes, preview and return to gameplay remain functional. | U061 |
| UI-05 | A | Quest items are tracked in a small journal section, outside gear bag capacity, and required items cannot be accidentally sold. | U104 |
| VO-01 | A | Device TTS optional in settings; simple mouth motion only while speech plays. No precise lip sync required. Unrecorded lines may use optional TTS or silence. Player-response voice unresolved; do not force it. | U072–U073,U079 |
| VO-02 | A | Private voice studio subpage, Oliver only account, usable phone and desktop. Wife records at his setup. Prefer fewer female roles due available performers, not zero female characters. | U077–U079 |
| VO-03 | A | Organize by character/scene/order. Show script plus scene context, emotional direction and notes; record, playback, retake, edit wording, and explicitly Approve/Save as official line. Distinct contexts for recurring NPC conversations. | U077–U079 |
| VO-04 | P | Stable line IDs, approved-take preservation, text-change/stale-audio tracking and backup/export are implementation safeguards; exact storage/auth provider undecided. | U077–U079 |

## Companions and additional rewards

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| COMP-01 | A | Improve companion and standard Necromancer summon models. Reviving latest killed foe produces an undead version of that actual enemy as fighting ally. Make companions' combat impact visible and meaningful. | U061,U072 |
| COMP-02 | A | Optional adventures can unlock stronger secret companions, hidden from Beastmaster selection until discovered. Also appearance rewards, useful shortcuts, home/refuge upgrades and small adventures. | U072–U073 |
| COMP-03 | A/P | Later major quest can reward ground mount or small rideable dragon with strong but limited flight. Same input mounts/dismounts; companion fights when dismounted and does not independently attack while ridden. Rider weapon/skill use while mounted undecided. | U072–U073 |
| COMP-04 | P | Rare class-specific NPC quests/rewards, gear or changes to skill behavior are desired possibilities, not a finalized item/skill list. | U072 |
| COMP-05 | A/O | Some optional quests grant specified weapons/rarities rather than purely random loot. Permanent companion/cosmetic reward banking should follow the agreed checkpoint contract; precise handling of every non-shard reward still needs definition rather than an assumed universal rule. | U071–U073 |

## Narrative canon — detailed source remains mandatory

The entire 100-section brief is preserved verbatim in U079, including open questions and every negative constraint. The following are the reconciled narrative checks, not permission to ignore that source.

| ID | Decision | Requirement / acceptance condition | Source |
|---|---|---|---|
| STORY-01 | A | Aerth; Bladeborn; Ian; Abyss King; Eternal Gate propaganda / Hollow Gate truth; Hollowing; Hollowed; Hollowed Legion; Abyssal Void; Ian's Blade. No Hollow Court/Hollowborne/Shadowing replacements. Exact Aerth geographic scale open. | U079 §§1,77–78,97 |
| STORY-02 | A | Ian famous successful protector, long life, natural old-age death, infertile. Not murdered, defeated, secretly failed, creator of King or a death conspiracy. | U079 §§3,68–69,94 |
| STORY-03 | A/P | Bladeborn hereditary dormant potential; proposed recessive awakening through intense protective intent/pure heart, not fixed scientific formula. Player orphan raised unknowingly by adoptive father; Ian may reveal adoption at ending. Exact ancestry/connection to Ian unresolved, no infertile direct-descendant invention. Father reluctantly prepares player. | U079 §§2,38,70,100;U080,U085,U098 |
| STORY-04 | A | Dead Bladeborn are eternal spirits together in their own spiritual realm, learning/teaching and preserving legacy; Ian describes eventual joining. Do not equate their realm with imprisonment of Hollowed souls or bodily resurrect Ian. | U087 |
| STORY-05 | A | King's understandable immortality research precedes surprise control discovery, then recognition of Ian's absence, covert recruitment, militarization and conquest. He did not plan enslavement from day one. Original name/title unresolved. | U079 §§4–10,16–34,65–66,92–94 |
| STORY-06 | A | ONE central imposing black Hollow Gate at Castle Duskmoor, created with mages/ritual/rare resources and King's soul anchor. Later one-Gate choice supersedes original network/multiple construction sites. Purple training rifts remain entirely separate. | U079 §§6–11;U084–U085 |
| STORY-07 | A | Crossing strips living soul to timeless Void; body immediately exits door-like, ageless but destructible, complex retained skills/memory/social imitation, no free will, follows standing orders. Empty eyes may be subtle. Soul unaware of body's actions, identity/sanity fading. Not ordinary necromancy. | U079 §§12–20,27–31,71–73;U080 |
| STORY-08 | A | Victims' hopes/families exploited, recruitment by familiar Hollowed loved ones. Later forced enter-or-die. Legion organized under King, scouts track player. Not all creatures are Legion or Hollowed; recognizable beasts and people, not universal zombies/skeletons. | U079 §§25–36,79–80,91 |
| STORY-09 | A | Unknown local nobody fights for home before certainty, growing impossible victories gradually draw King's dismissal/curiosity/anger/fear. Hints grow; explicit Bladeborn reveal only final fight, Ian confirmation in Void. | U079 §§37–45,67,87–89 |
| STORY-10 | A/O | Show credible imprisoned-soul evidence before finale; exact device/encounter remains open. Historical ads, letters, testimony, ruins and environment reveal story, not only NPC lectures. | U079 §§22,86–88 |
| STORY-11 | A | Sunspire orb provides one question; its answer enables reaching hidden castle. Disguise and guard deception optional entrance, failure difficult winnable horde. Hollowed guard deception exploits standing orders, not free-willed betrayal. | U079 addition;U086–U087 |
| STORY-12 | A | Final phase one half Void-infused King channels souls without destroying them; realizes Bladeborn, plunges fully, uses already harnessed energy to barely escape forces, returns fully infused for phase two. Exception unavailable to ordinary people. | U079 §§42–48,83–84;U080 |
| STORY-13 | A | King's death removes anchor but does NOT rescue souls alone. Binding destabilizes, huge rift consumes player/battlefield, Ian spirit meets/affirms/gives temporary Blade; charged cut severs binding, frees all souls, reconstructs killed bodies healthy pre-Gate, restores free will/mortality, player escapes and saves Aerth. | U079 §§49–63,85,90,96 |
| STORY-14 | A | Timed difficult final charge uses repeated Space presses. Failure retries charge only; five consecutive failures unlock optional skip to successful ending. No automatic boss replay. Exact multiplayer/touch/controller behavior open. | U079 §56;U080 |
| STORY-15 | A | Ian's Blade massive black iron, tarnished gold sacred guard, ember holy core; strongest relic. TEMPORARY ending use, no free permanent completion award. Permanent version remains substantial existing endgame/shop grind. Why temporary version not retained open. | U079 §§54–55,82,95 |
| STORY-16 | O | King's original name/title; exact awakening; family tree; soul-viewing method; Void's full metaphysics; restored memories; temporary Blade explanation; Aerth scale; Waystone/Gate relationship. No silent canon answers. | U079 §100 plus later changes |
| STORY-17 | A/P | Secret confiscated writings at Emberdeep reveal Sunspire/orb; rescued people supply practical directions and contacts, forming a growing support network. Papers left during King's forge setup is a proposed provenance. Sunspire books explain soul imprisonment and possibility of release; exact witnessing method stays open. Ellis captive versus found just before hunters remains open. | U108 |
| STORY-18 | A | Ellis was hiding in a secret laboratory inside the ice caves. Legion has just captured him; player rescues him before transport to be Hollowed. Supersedes shelter/captivity-versus-pursuit alternatives in STORY-17 and older drafts. | U110 |
| STORY-19 | A/P | Conscious higher-consciousness Sunspire orb visually reveals the many trapped souls and says the linked soul must be killed for release. Preserve one-question constraint. Reconcile with established ending by explaining killing King's anchor is necessary but not sufficient: it makes severing the binding possible; final cut still frees souls. This wording reconciliation is an interpretation, not explicit approval of a changed ending. Do not claim King death alone restores everyone. Orb replaces proposed viewing frame mechanism. | U110; U079 ending |
| STORY-20 | A | Ian's Blade appears only in the interactive button-mashing ending cutscene; never equip it as ordinary gameplay gear or grant inventory ownership. It is not retained after level. Supersedes proposed temporary equipment swap/restore and removes need to invent a spiritual-replica explanation. Existing permanent endgame weapon progression remains separate. | U110 |
| STORY-21 | A | Orb question is "How can we stop the Abyss King?" Its answer must not spoil final cut, Ian/Blade solution, or being pulled into Void. Ending portal is overwhelmed by the combined power involving player and King; both fall in after King defeat. This physical overload supplements/supersedes anchor-failure-only collapse wording; King death still breaks control and final cut still frees souls. | U111 |

## Supersessions and rejected directions

- Multiple Hollow Gates, regional Gate-frame factories and Gate-building quests -> one castle Gate; Emberdeep manufactures weapons. U085 overrides U079 network opportunity.
- Old Abyss region / early King / interim commander -> Storm Coast, crossing and merciful hydra. True Abyssal Void retained for ending.
- Paladin at Emberdeep -> Sunspire. Necromancer at Palace -> after Duskmoor. Pirate at Keep -> Storm Coast. Reaper old Abyss -> Keep. Warlock-at-castle assistant idea not adopted.
- Firebinder rejected -> Pyromancer. Reaper scythe 'maybe intrinsic' -> committed intrinsic; compensation proposal -> delete old scythes safely, no compensation.
- Earlier each-player NPC turn-in -> shared NPC progression/reward. Physical environmental shards remain individual.
- Original whole-level death/quit rollback -> current-half restart; U105 explicitly settles quit/disconnect to match completed-half banking.
- Trial portals as crystals containing portals / clumsy accidental Legion destruction -> crystalline rifts themselves deliberately thrown by scholar to save disciplines.
- Direct Ian descendant/brother/failed Ian/secret Ian name/ancient dream King in old drafts -> current canonical story. Adoption does not cause genetics.
- Reject confusing names: Dry Wash, Rime Shelf, Caravan Trail, Prison Below, Black Scar, Broken Lands, King's Vaults, Colonnade, Weapon Forge, Silent City. Avoid 'sluice' in player directions. U071,U085–U087.
- Old AGENTS no art work/NG+ removal/unobtainable-only Ian teaser are superseded by later art, NG+ and earnable endgame Blade requirements.
- Full player model replacement not approved after preview. Existing preferred player/weapon assets remain baseline.

## Required implementation and verification sequence

1. Preserve/reconcile sources and decision register (this documentation task). Resolve only ambiguities needed for the next batch; do not stall unrelated approved work.
2. Equipment/progression: family mapping, intrinsic weapons, safe removal, cheat, bag, scaling. Test representative saves, every class-family pair and weapon basic/charge behavior. No double scaling.
3. Adventure foundations: persistence/half snapshots, shared state, quests/dialogue/journal/compass, shards, inventory rewards, prompts, settings. Establish stable voice IDs now. Test death, quit, refresh, disconnect, duplicate rewards, replay and co-op ordering.
4. Draft the whole campaign before the back-to-back implementation run (U105); then implement Briar full two-half slice and verify main routes, optional choices, visuals and performance before extending its shared systems.
5. Implement EVERY remaining planned region, both halves and every boss/arena, with dialogue, environmental puzzles, discoveries and five distinct shard routes. Include sailing, hydra mercy, palace orb, infiltration, King phases and restorative ending. Do not impose mandatory user QA pauses between every level; keep previews and progress available.
6. Rift Hall/mentors/Pyromancer/Necromancer gate alongside their dependency regions, not forgotten until after level content. Companion/mount and return-visit side content scheduled explicitly.
7. Voice studio, recordings, hub intros and reactions, final polish, progression playtesting, browser/phone-preview/co-op QA. Secondary modes remain later backlog.

No row may be marked implemented merely because a predecessor was shipped. Add evidence links, code revision, test result and limitations to the decision/evidence log. This baseline does not deploy gameplay changes.

## Implementation evidence — September 20, 2026

Equipment foundation batch 1.982.0: see [scope, checks and limitations](IMPLEMENTATION_EQUIPMENT_2026-09-20.md). EQ-02/04/05/07/08 implemented with browser checks. EQ-01/03/09 implemented with representative coverage; full class/skin/co-op integration remains open. EQ-06 partial: rank-cap scaling and Necromancer level factor, full damage audit still pending. Every other requirement retains its previous status. U113 authorizes main implementation; U114 requests continuation.

### U115 correction — required before visual sign-off

EQ-03/GOV-05 grip fit remains OPEN: user rejected screenshot holding positions. Add ART-CLASS-01: distinct class-specific recolor for every model/class combination, including all shared mage models; retain existing geometry and natural faces. Default pack colors do not satisfy this.

### MUSIC-01 | A/P | U116–U117

Inventory supplied Desktop/BladeFall Music tracks, propose each placement and remaining music coverage, with coherent theme directions/copy-ready ElevenLabs briefs. Planning deliverables: SOUNDTRACK_PLAN_2026-09-20.md and ELEVENLABS_MUSIC_BRIEFS_2026-09-20.md. Placement recommendations remain proposals, no runtime routing/audio publication yet. Reserved recommendations: Crown phase one/Iron Oath phase two; Watchful Greenwood restoration; distinct music for both halves and ship/hydra/orb/Ian/final-cut states.

### MUSIC-02 | Approved, pending implementation | MUSIC-SOURCE-02

Commit and push copies of soundtrack audio files into the Bladefall Git repository when integrating the music. Preserve supplied originals and any needed browser derivatives, with no desktop-path dependency. Verify tracked files and remote commit, not only local file existence. Desktop originals remain untouched.

### Visual correction evidence — 1.983.0

ART-CLASS-01 verified for the 16 existing classes through browser palette checks and screenshots. EQ-03 Pirate grip/pose corrections and peer state implemented; broader GOV-05 all-weapon fit coverage remains open. See CLASS_PALETTES_AND_GRIPS_2026-09-20.md for tests and limits.

### Checkpoint evidence — 1.984.0

SAVE-03/04 implemented for existing normal campaign with browser reload/death/route tests; SAVE-01 checkpoint consistency verified for player/class growth, inventory and hub transactions tested. SAVE-02 foundation banks existing secret pickup at half boundaries; new five-shard collection remains pending. Co-op individual state/transition/retry tested through controlled two-browser message relay; live WebRTC and future quest/dialogue synchronization still open. See IMPLEMENTATION_CHECKPOINTS_2026-09-20.md.

### VISUAL-REVIEW-02 correction

Paladin palette must be light gold/holy light. All other class colors accepted. Pirate handling still OPEN: user rejects pistol and saber direction; measure forward muzzle axis and anatomical cross-palm grip, not attachment distance alone.


## September 20 — VISUAL-REVIEW-03

GOV-05 / EQ-03 expanded acceptance: all supported weapon/body fits require an anatomical grip throughout animations. Parent-distance and forward-axis checks alone are insufficient. Source VISUAL-REVIEW-03; pending comprehensive visual audit.


## September 20 — VISUAL-REVIEW-04

User explicitly prioritizes all classes and weapon types: handles within fist, sensible up/forward carry for hammers/scythes rather than sideways, hand-relative anatomical logic throughout motion. Current audit found 31 supported body/art pairs. Replace faulty inherited placement with authored grip anchors and weapon-specific ready poses; retain original tuning as reference, not as a reason to keep visibly incorrect fits. Check every runtime asset variant and all supported classes, motion and peer rendering. Full pass not yet complete.


## September 20 - VISUAL-REVIEW-05 and grip verification

Javelin must sit correctly in BOTH hands, including basic thrust and charge; release hands on throw. Implemented with the broader VISUAL-REVIEW-03/04 pass. EQ-03 sampled visual/pose acceptance verified across 64 active asset/body fits and 16 classes; source model variants, support reach, closed fingers, forward carry, moving attacks and charge checked. Evidence: IMPLEMENTATION_WEAPON_GRIPS_2026-09-20.md. Real-world playtesting remains valuable; this does not certify every possible animation frame.


## September 20 — AUDIO-SFX-01

Approved: complete context-specific custom SFX plan with ElevenLabs-ready prompts; current free assets may be replaced. Planning delivered in docs/audio/SFX_PRODUCTION_GUIDE.md, SFX_CATALOG.json, ELEVENLABS_SFX_ALL_PROMPTS.md and SFX_COVERAGE.md. Catalog covers 128 current selectable skills, all current enemy registry entries including nonattacking targets, weapon families/actual charges, new campaign and later modes. Implementation, generation, auditioning and replacing old audio remain OPEN. Unresolved Pyromancer/boss details remain labeled rather than silently approved.


## [Codex | 2026-09-20] VISUAL-COSMETICS-01 — queued cape, trail and level surface overhaul

Status: OPEN / QUEUED. Source: VISUAL-COSMETICS-01.

- Massively improve cape and trail cosmetic assets, detail, materials and character-compatible coloration.
- Capes need convincing cloth-like motion and body-aware collision/clearance, avoiding persistent clipping. Implementation approach is not prescribed; maintain browser performance.
- Verify equipped cosmetics across supported character models, idle, running, turns, jumps, dash, basic/charged attacks and skills; include peer appearance where applicable. Trails should follow actual motion and suit the equipped character/cosmetic. These checks operationalize the visual request rather than add new cosmetic systems.
- Integrate a z-fighting inspection and correction into EVERY level redesign, both halves and boss arenas. Inspect overlapping floors, terrain, trims, decals, platforms and transparent effects from moving/near/far camera views; fix duplicate/coplanar surfaces at source rather than simply hiding symptoms.
- Capture before/after visual evidence and compare browser performance. Do not mark complete based only on static images or numerical attachment checks.


## [Codex | 2026-09-20] Journal and story-state foundation evidence

UI-01 current-level journal implemented (N default, HUD button, remappable; J attack preserved). UI-05 quest-item state kept outside equipment bag. SAVE-05 route snapshot now includes story notes/items/cursors/flags/reward ledger; completed-half preservation and unfinished-half rollback tested. DLG-02/08 reducer and readable/reveal-safe dialogue UI implemented in /3d/story/preview.html only; cinematic NPC camera, voice/mouth timing, world placement and shared multiplayer dialogue remain OPEN. Thomas/Mara authored chain has main-path-safe father replies, gated supply delivery and once-only reward state. Not completion of the full Briar slice.


## [Codex | 2026-09-20] VO-PRIORITY-01 — early independent voice production

VO-05 / GOV-08 — APPROVED priority change. Deliver the private, independently usable recording workflow early enough for Oliver to record during gaps in Codex availability. NPC/dialogue/Voice Studio work now precedes the full remaining-level rollout once stable dialogue IDs, text versions and safe storage are ready. This supersedes the older step 7 placing Voice Studio near final polish. Maintain one authoritative script source and all prior VO-01–04 privacy, editing, playback, retake, approval, cross-device and fallback requirements. Recording-ready content should arrive in coherent batches; later story/gameplay work continues using the same data. Status: QUEUED, not operational.


## [Codex | 2026-09-20] Early Voice Studio implementation

VO-02/03/04/05 first implementation: private owner-key studio, twelve Thomas/Mara recording-ready lines sourced from the shared graph, context/direction, recording/upload, listen/retake, text edits, explicit approval, private R2 take retention, local pending recovery, per-line backup/restore. Approved current-wording audio consumed by dialogue preview. Full game NPC playback/mouth animation, TTS fallback, hub/campaign script expansion still OPEN. Real-device microphone QA remains. See IMPLEMENTATION_VOICE_STUDIO_2026-09-20.md.


## Implementation evidence — Hub conversations 1.989

DLG-05 partial: first introductions, service instructions, optional personal questions and one campaign-victory reaction for five existing human hub service keepers. Persists per save slot; objects such as boards open directly. DLG-02/08 and VO-01/03 implemented for these hub conversations: camera/subtitles/leave/resume/input guard, matching approved voice playback, optional device speech and basic mouth motion. The five service NPCs retain existing body assets with fitted eyes/mouth added. This is not the complete new NPC art/campaign/quest/co-op overhaul. See IMPLEMENTATION_HUB_DIALOGUE_2026-09-20.md for tests and limits.


## [Codex | 2026-09-20] Briar opening integration 1.990

Continued approved implementation; no new design decision. MAP-01, DLG-02/06/07/08, MP-01/02/03, SAVE-03/04/05 and VO-PRIORITY-01 are PARTIAL with new live evidence: Thomas/Mara in Homefields; garden/store supplies; unlimited restored healing pad; ordered mill repair and guard-gated departure; shared host-authoritative dialogue/world/rewards and completed-half story/receipt checkpoints. See IMPLEMENTATION_BRIAR_LIVE_2026-09-20.md for exact tests and limits. Existing 32 recording lines remain unchanged. Wider Briar expansion, optional cast, five individual shards, Black Woods/boss and other regions remain OPEN. Next implementation should extend those content branches and recording-ready scripts using this live shared foundation. Private archive decision-archive/2026-09-20-briar-opening stores 130 user-role messages with zero unparsed lines and valid requirement source references. Older untracked draft dialogue files remain unrelated.


## [Codex | 2026-09-20] Gus recording-ready optional quest

Continued approved DLG-03/04 and VO-PRIORITY-01: ten new stable Gus lines in the private Voice Studio (42 total), with performance notes. Separate rehearsal supports tool delivery, once-only BR-02 reward/shortcut, insult, sign-repair apology, final refusal, leave/resume and retry. No new user design decisions. All original Thomas/Mara/hub lines unchanged. Gus remains rehearsal-only: live placement, physical five-shard collection/banking and Rift Hall integration remain OPEN, alongside Black Woods, remaining regions/bosses and the broader requirements register. See IMPLEMENTATION_GUS_VOICE_2026-09-20.md.


## [Codex | 2026-09-20] Explicit access change

User: “You can remove the password protection for the voice studio for now. No need. And then continue building”. Supersedes the earlier owner-only Voice Studio requirement for now. Studio reads, edits, recordings and approvals are available without login. Keep take preservation, version checks and same-origin write protections. No secrets are published.


## [Codex | 2026-09-20] Landscape-first scope reinforced

User approves beginning substantial Homefields expansion with discoverable puzzles and abundant engaging content. Terrain, branches, topography and playability should precede final location-dependent NPC scripts. Each level should feel like entering a unique open world, with optional navigation assistance that does not reveal secrets. Longer levels are welcome; avoid empty length or repeated structures. This reinforces GOV-02/MAP requirements, not a reduction to NPC and shard placement.


## [Codex | 2026-09-20] Ground-up layout permission

User explicitly permits replacing any existing level layout from the ground up. Preserve established assets/theming where useful, and author new assets/details as needed for coherent, beautiful environments. This applies to all levels. Existing footprint is not a constraint; current Homefields wings are a first playable terrain iteration, not approval to retain the old core permanently.


## [Codex | 2026-09-20] Village reconstruction and granary — 1.994

Continued approved landscape-first MAP-01/GOV-02 work. Replaced central village scenery with four detailed timber homes, shared yard, household details and open routes. Added an enterable eastern granary with loft climb/chest, a separate locked rear store room and return route to eastern fields. New optional hanging-weight puzzle (1/2/4, target 5) has discoverable journal clue, numbered weights, visible total, reversible mistakes, latched door collision removal and once-only shared gold reward. No new spoken lines; all 42 recording lines unchanged. Five-shard placements, live Gus, Rift Hall, Black Woods/boss and rest of campaign remain OPEN. This is another playable iteration, not the completed region/art pass.

Validation: new reducer puzzle tests, existing story/bell/Gus/authority/voice API tests passed. Browser granary QA passed 17 movement waypoints plus closed-door block, correct opening, once-only reward; 33 exploration and 51 main-route waypoints passed. Controlled two-context co-op QA passed 17 checks including shared wrong total, door collision and rewards; not a real WebRTC session. Browser save checks confirmed provisional rewards do not autosave, reload recloses unfinished puzzle, completing half banks gate/reward receipts. Existing opening/save QA passed 14 checks. Initial loft landing gap and missing annex/eastern ground strips fixed before passing movement tests. Movement tests stun enemies; combat balance and device performance remain unverified. Screenshot gallery updated with village/granary images; earlier dialogue images retain old build labels.


## [Codex | 2026-09-20] MAP-01/GOV-02 optional workshop increment
Gus workshop/loft/sign and shared quest shortcut are implemented with checkpoint-banked BR-02; existing spoken script preserved. See IMPLEMENTATION_GUS_WORKSHOP_2026-09-20.md for scope and checks. Region expansion and Rift Hall remain partial; no requirement closed merely because one quest shipped.
