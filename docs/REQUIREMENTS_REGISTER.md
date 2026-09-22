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


## [Codex | 2026-09-20] MAP-01/GOV-02 farm/orchard increment
Added field-discovered supply recovery, mixed farm enemies, orchard beasts and a deployable raised lookout route with return descent and shared stash. Checkpoint-tested; full expansion remains OPEN. See IMPLEMENTATION_HOMEFIELDS_FARMS_2026-09-20.md.


## [Codex | 2026-09-20] RIFT-02/MP-02 first world pickup increment
BR-01 is now individually collectible after Mara, with faceted art, nonblocking explanation, personal journal saved/carried counts, gray echoes and checkpoint/co-op tests. RIFT-02 remains PARTIAL because Hall location guidance requires the actual room; five placements and Hall access remain OPEN. See IMPLEMENTATION_FIRST_RIFT_SHARD_2026-09-20.md.


## [Codex | 2026-09-20] Black Woods playable terrain and shards — 1.998
Rebuilt Briar half 2 with seven connected clearings, ground camp approach and elevated hunting platforms, safer recovery ground, finite mixed encounters and limited healing pads. Lewis introduces the required signal sabotage: ground crank or upper cable, then northern shelter. Five new recording-ready Lewis lines include context and acting notes. Required exit stays locked until signal completion. Added BR-03 loft, BR-04 animal-track sequence puzzle and BR-05 screened supply nook. Puzzle symbols are shape-based; clue enters journal. Shared conversation/world-state routing now supports both Briar halves; physical shards remain personal.
Validated: 11 upper route/puzzle/shard/rollback checks with actual traversal including loft return; 9 ground-route waypoints with crank, Lewis relocation and boss-entry bank/reload; 6 controlled two-context co-op checks for shared dialogue/signal/puzzle, personal shard and retry. This uses a controlled packet relay, not real WebRTC. Existing 14 opening and 11 campaign/legacy checkpoint checks passed. Story, shard and Voice API tests passed. Reviewed both gallery screenshots. Traversal tests freeze enemies, so they are not combat-balance approval.
Still OPEN: Beth rescue and hidden companion, Brute orchard arena, Rift Hall assembly/mentor/access migration, more scenery and encounter polish. Existing legacy secret access remains until replacement is ready. This is NOT completion of Briar or the wider campaign. Next implement Beth’s rescue around the now-established woods routes, then Brute/Rift Hall.


## [Codex | 2026-09-20] Beth rescue and secret companion — 1.999
Continued approved Black Woods optional Nobody Left Behind. Eastern boot-print trail, broken-beam climb with safe ground beneath, independent thornboars and rope lift. Host rejects release while rescue beasts live; releasing tree restores a walkable crossing and reunites Beth/brother at trail junction, no slow escort or return turn-in. Seven new stable recording-ready lines (Beth 4, brother 3), distinct fitted human NPC palettes. Existing lines unchanged.
New quest-only shepherd dog: articulated browser-native low-poly coat, muzzle, ears, paws, collar/tag, moving legs/head/jaw/tail and SVG icon; base 9 damage / 1.55 seconds with existing level/class scaling. Hidden in normal shop/selection until earned, cannot buy/sell; cheats/all-loadout arena remain explicit unlock bypasses. Shared reward recipients get provisional G.pendingCompanions, banked to petOwned at existing completed-half boundary; no companion menu access until bank. Not auto-equipped, does not replace chosen companion.
Validation: 11 rescue/reward/rollback checks and 17 movement waypoints including repaired return walk; completed-half reload retains companion. Nine controlled two-context co-op checks cover shared rescue geometry, host beast guard, both-player pending/banked reward and duplicate snapshot protection (not live WebRTC). Dog independently dealt damage in focused combat smoke test, and shop/equip/trade behavior passed. Story reducer/authority/Voice API passed, old-save/checkpoint suite 11 passed, Black Woods shard traversal 11 passed. Reviewed two screenshots; no page errors in art or traversal. Beasts frozen/killed by test harness for route/transaction checks, so combat difficulty and broader scenery polish are still not signed off.
Next: Brute orchard arena and its charge/stagger/finite-handler mechanics, then Rift Hall assembly/access migration. Briar and entire campaign remain partial. Raw user archive remains private outside repository.


## [Codex | 2026-09-20] Brute orchard encounter — 2.000
Implemented the approved Briar campaign boss encounter as a complete layout/combat/co-op milestone. Broad adjoining floor with barn and orchard side loops, shallow terraces, four solid reusable charge targets, broken fence details, fruit crowns and existing Blender foliage kit. Collision and walking routes checked; no random phase-two rubble. Existing Brute model enlarged modestly and given brace, charging run and stagger clips that retain existing arm/weapon poses; animation viewer exposes these motions. Other modes retain their existing Brute mechanics.
Charge: 1.15s tell, aim locks for last .45s, 620 units/s for at most 1.05s. Cart/stone collision creates 3s stagger with existing 1.6x damage bonus. Every third attack can be a .95s warned ground slam when close; its 24-unit hit clearance supports a timed short hop as well as held jump. Two finite two-enemy handler waves at 70% and 35% HP, with 1.5s arrival warnings. Exit and HUD wait for surviving handlers. Host controls boss state, wave creation and enemy HP; clients receive explicit phase/direction and de-duplicated damaging slam rings. No class-specific switches.
Validation: isolated controller timing/direction/collision/wave-cap tests; browser 15 encounter/checkpoint assertions and 13 real movement waypoints; held jump and timed short tap avoid damage while standing still takes damage; nine controlled two-context co-op checks including exactly-once stagger damage, shared waves and exit. Existing 11 save/legacy/checkpoint/trial checks and story reducer/authority tests passed. Three new clips load with finite bones in preview; original/revised and other-enemy switching passed. Two screenshots reviewed, no page errors. Instanced orchard scenery counts 15,024 triangles (not the complete frame). Route/mechanic tests use controlled boss states and invulnerability except the explicit dodge check: overall combat balance still needs ordinary player playtesting. Controlled co-op relay is not an internet WebRTC soak test.
Private archive 2026-09-20-brute-orchard preserves 145 user-role messages, zero unparsed lines and valid source references. User confirmed the usage-efficient milestone workflow; no model or scope reduction. Next: Rift Hall five-shard assembly, class-mentor/access migration and recording-ready Keeper dialogue. Briar/environment polish and the remaining campaign remain partial. Existing secret access stays until its replacement is ready. Music, capes/trails, weapon-fit and broader approved queue are not declared complete by this milestone.


### Implementation evidence — 2.001 Rift Hall and mentors
RIFT-03 room/labels/assembly live in this release; RIFT-02 introduction now points to Hall. RIFT-05 partial: seven role-named class-specific teachers and 28 recording-ready lines, eight Keeper lines; trial encounters remain their existing designs. RIFT-06 frame mapping follows approved classes; later-region shard placement and Pyromancer remain open. Save-safe legacy access is carried by its original class, not reinterpreted as a new region reward. Co-op Hall/shared dialogue and personal assembly verified with controlled packets; trial combat explicitly remains solo pending correct party eligibility/synchronization. Full evidence: `IMPLEMENTATION_RIFT_HALL_2026-09-20.md` and `requirements/CONTINUITY.md`. No claim that the whole campaign expansion is complete.


## [Codex | 2026-09-20] Winding Cliffs — 2.002

Partial implementation evidence for GOV-02, campaign exploration, NPC/VO, puzzle, co-op and Rift Shard requirements: Hollow Pass part one now has the authored Winding Cliffs journey, Caleb/Skip, bridge/rope/code puzzles and HP-01/02. 13 new recording lines; 103 catalog total. See [implementation and verification](IMPLEMENTATION_WINDING_CLIFFS_2026-09-20.md). Lost Canyon, its remaining shards and the Marksman redesign remain pending. This is not completion of the broader campaign or entire approved queue.


## [Codex | 2026-09-20] Lost Canyon — 2.003

Implemented Hollow Pass part two: Ward/Ruth, alternate entrances, cage rescues, finite alarm response, moving prisoners/shelter shortcut, wagon cave loop, freight puzzle and HP-03/04. 16 new VO lines; 119 total. Verified 253 route waypoints, quest/co-op/checkpoint/alarm checks and phone dialogue. See docs/IMPLEMENTATION_LOST_CANYON_2026-09-20.md for complete evidence and limits. Private archive ../../decision-archive/2026-09-20-lost-canyon preserves 149 messages with valid references. Marksman/HP-05 next; broader approved queue remains open.


## [Codex | 2026-09-20] Marksman crossing — 2.004
Campaign Hollow Marksman: split canyon, climbable nests, locked aim, physical cover, single protected glide/guard pair, safe landing recovery, rear-stair HP-05 saved on individual claim. All five Hollow Pass shards are now collectable in one run. 181 movement waypoints, 15 fight checks, ten controlled co-op checks and five-shard banking flow verified. See docs/IMPLEMENTATION_MARKSMAN_2026-09-20.md for scope and test limits. Existing 119 VO lines unchanged. Private archive preserves 150 messages with valid references. Next Ruined Keep; trial/co-op training and wider campaign/approved queue remain open.

## [Codex | 2026-09-20] Broken Walls — 2.005

Continued the approved landscape-first campaign plan. Ruined Keep part one now has Grant/Felix, breach defense, two dungeon-entry mechanisms, timed workshop/tool return/rare Lockpick, tower and independent chamber routes, and RK-01/02. Ten new recording lines; 129 total. 264 controller route samples, 16 runtime checks, 12 controlled co-op checks, five Keep checkpoint checks and 11 existing campaign checkpoint checks passed, plus story/authority/shard/Voice API/content tests. Camera cutaways and disjoint terrain surfaces address this layout's overlap/visibility issues. See docs/IMPLEMENTATION_BROKEN_WALLS_2026-09-20.md for scope, evidence and limits. Next: The Dungeons/Walter/Sly/remaining Reaper shards, then The Fallen. Wider approved work remains open. Private archive ../../decision-archive/2026-09-20-broken-walls preserves 151 user messages, zero unparsed lines and valid source references.

## [Codex | 2026-09-20] The Dungeons — 2.006

Continued the approved landscape-first campaign expansion. Ruined Keep part two now has Walter/Sly, hidden captives/papers, a shared working rescue lift, optional lower weights and drain maze, rare armor cache and RK-03/04/05. All five Keep shards can be banked before its boss. Sixteen new recording lines; 145 total. 344 controller route samples, 14 runtime checks, ten controlled co-op checks, four Dungeons checkpoint checks and eleven existing campaign checkpoint checks passed. Broken Walls regression also passed (264 samples/16 checks); content/story/authority/shard/hall/Voice API suites passed. See docs/IMPLEMENTATION_DUNGEONS_2026-09-20.md for evidence and limits. Next: The Fallen, then Frostfell. Wider approved requirements remain open. Private archive ../../decision-archive/2026-09-20-dungeons preserves 152 user messages, zero unparsed lines and valid source references.

## [Codex | 2026-09-21] The Fallen — 2.007

Implemented the approved compact indoor Hollowed-champion duel, four physical pillars, locked thrusts, separately warned feint/sweep, recovery windows, solo second phase and northward Ellis clue. Removed this boss's former-Bladeborn text. Found/fixed mismatched enemy-renderer module imports causing legacy fallback overlap and split caches; browser checked actor ownership across five area transitions. 94 movement samples/13 fight checks, six controlled co-op checks, four Keep shard checkpoint checks and eleven existing campaign/legacy checks passed, plus encounter/import/story/authority/shard/Voice API suites. Three reviewed previews. 145 VO lines unchanged. See docs/IMPLEMENTATION_FALLEN_2026-09-21.md for scope and limits. Next Frostfell terrain/NPCs/Ellis rescue, then its boss; wider queue remains open. Private archive ../../decision-archive/2026-09-21-fallen preserves 154 user messages with zero unparsed lines and valid references.

## [Codex | 2026-09-21] Snowbound Peaks implemented — 2.008

Frostfell part one now uses authored climbing routes, a sheltered bypass around the exposed lift-house crossing, a heater delivery to Heath, a repair that lowers the main crossing, a shape-based signal puzzle and a buried camp marker puzzle. FF-01 requires a narrow jumping route behind the shelter flag; FF-02 appears at the camp chest and remains a personal pickup. The winter cloak and collected shards become permanent at the cave boundary, not on discovery. The return winch lowers a stepped shortcut; it is labeled return steps rather than pretending to be a moving lift.

Heath is the only mountain NPC and has ten stable recording IDs. Voice Studio now has 155 lines. His blunt conversation branch rejoins the required quest; conversations resume and pause both co-op players. Clues are shown on discovery and kept in the Frostfell journal. No new Bladeborn, Sunspire or final-cut revelations. Ellis's freshly captured laboratory rescue belongs in the next part.

Validation: story transaction/voice graph tests, voice API regression, shared enemy module cache test, classic inline syntax; browser 50 walking/jumping waypoint checks and eight runtime progression assertions; four death/checkpoint assertions; seven two-context co-op assertions. Both clients receive repair/puzzle changes and the banked cloak, but physically collect their own shards. No captured browser errors. 390px dialogue has no horizontal overflow. Frost scenery is about 25,628 triangles total with spatial chunk culling; this is not a device performance benchmark. Combat difficulty was not balanced by these invulnerable route tests.

Five new browser screenshots are in the public campaign gallery (57 total). Private conversation archive updated outside Git: ../../decision-archive/2026-09-21-snowbound — 155 user messages, zero unparsed lines, valid references. Existing approvals remain authoritative; this batch does not complete the campaign or wider queue. Next: Deep Ice Caves terrain, Ellis's capture/rescue, Hugo, environmental machinery, remaining three Chronomancer shards, then the coordinated three-officer boss.

## [Codex | 2026-09-21] Deep Ice Caves implemented — 2.009

Frostfell part two now has a descending entrance, two laboratory approaches, a lower research pack, separate waterworks basins, an optional rescue route, a raised frozen-waterfall loop and narrow shard ledges. Defeat Ellis's guards, release him, recover and return his sealed notes, then complete the fill/freeze/drain crossing. His notes point to Emberdeep's arms supply. The firm dialogue route rejoins the required objective. No timed capture failure, underwater breathing, early Bladeborn reveal or final-cut spoiler.

Hugo's optional rescue requires securing the frame and recovering rope before lowering it. He walks to the dry junction. FF-03 is a shared NPC reward; FF-04 is a personal pickup behind the optional drain/fill/freeze cycle; FF-05 is a personal waterfall climbing reward. Wrong cycles safely reset, completed crossings stay open, and falling into the basins returns the player to dry controls. Four limited healing pads serve the longer routes. Ellis has ten new voice nodes and Hugo eight; stable IDs are in the public catalog, totaling 173 lines. The obsolete Rime Shelf HUD label is replaced with Deep Ice Caves.

Validation: story/authority/shard/voice API/cache regression tests passed; authored cave graph and all reward/puzzle gates passed. Browser tests passed 63 controller walking/jumping waypoints, 11 runtime progression assertions, four death/banking assertions and nine two-context co-op assertions through actual multiplayer handlers with a controlled packet relay. Both clients pause for dialogue and receive puzzle bridges/Hugo's reward; physical shards stay personal. Cave death rolls back cave discoveries, mountain shards remain, and boss entry banks all five Frostfell shards. No captured browser errors. Six new reviewed browser screenshots (63 gallery images); Hugo dialogue fits 390px. Cave scenery is 40,904 triangles with spatial chunk culling; this is not a device benchmark. Combat balance and real-network latency still require human playtesting.

Private conversation archive: ../../decision-archive/2026-09-21-ice-caves — 156 user messages, zero unparsed lines, valid source references. Existing approvals remain tracked. This batch completes the cave section, not the entire Frostfell redesign or wider queue. The legacy Frost Sorcerer remains playable temporarily; NEXT is the approved coordinated three-officer boss and high/low cavern arena, bringing the encounter into line with Ellis's recording-ready dialogue. Then Emberdeep's expanded forge campaign.

## [Codex | 2026-09-21] Frostfell officers implemented — 2.010

Replaced the main-campaign Frost Sorcerer with a caster, shield officer and spear officer in a cavern with two raised shelves, walkable ramps, eight tested jump landings and a high exit. One major attack at a time; locked ground circles, jumpable shield waves and bounded spear lanes match damage geometry. Survivors change priorities, with no reinforcements or surprise death burst. Custom shield/spear GLBs and upper-body animation tracks retain the existing low-poly kit. Three individual health bars plus shared health/remaining count; all three must fall before one boss credit, boss loot and exit. Other modes retain their existing encounters. Boss retries rebuild the trio and retain banked shards.

Validation: encounter scheduler and elevated pursuit tests, renderer import identity, Fallen and Voice API regressions passed. Browser: 84 controller ramp waypoints, eight shortcut landings, 12 combat/progression checks, seven controlled two-context co-op checks and five retry/death-order checks. Reviewed five browser previews, including staged attack warnings and a 390px phone view; corrected phone HUD overlap. Scenery has 9,416 triangles, spatially culled; shield/spear meshes have 674/682 triangles. These checks establish functionality, not human combat balance or device performance. Gallery now has 68 images. Voice catalog remains 173 lines.

Stereo Voice Studio hotfix cbb5237 was already deployed successfully (Cloudflare f42b0d72-4e34-4ad5-afef-87915131f9f1). Browser MediaRecorder/decode checks verified two-channel output, preserved stereo separation and centered mono. Existing takes and approvals were not changed. Private archive ../../decision-archive/2026-09-21-officers-stereo contains 159 user messages, zero unparsed lines, valid references.

Next: Emberdeep Iron Halls terrain, safe machinery shutdown, Flint/Jack dialogue and optional work; then Great Furnace, Colossus and the remaining campaign. The wider queue is not complete.

## [Codex | 2026-09-21] Iron Halls implemented — 2.011

Emberdeep part one is now an authored forge district: receiving yard, worker station, broad lower floor, raised stamping route, western stores, seized-work loft, jumping return ledges, control hall, casting room and service-cart crossing. Existing Emberdeep art is extended with instanced iron frames, workbenches, racks, pipes, lamps and supply crates. Three limited healing pads. Flint and Jack have aprons/tools and distinct existing character bases. Workers visibly walk into shelter after the station guards are cleared. Main progression is safe shelter, handle delivery/cart repair, then feed/pressure/hammer shutdown; wrong orders reset with a safe steam warning. Press warnings precede hits by 1.4 seconds; shutdown disables them. Optional routes never gate the main exit.

Flint's optional recovered blade blank grants a chosen fixed rare Forgeguard sword, javelin, wand or chest armor, plus shared ED-02. ED-01 is an individual pickup inside a casting mold that can only open after shutdown. Both and the equipment remain provisional until the next half. Seventeen stable voice IDs for Flint/Jack are recording-ready (190 catalog lines total); established text and takes were not rewritten. Seven new browser previews bring the gallery to 75. Jack's initial position caused conversation-camera obstruction under the upper approach; relocated him to the clear western side of the cart junction and reviewed the result.

Validation: story branches, safe order, delivery gates, four reward choices, voice graph, story/authority/shard tests, Voice API regression and shared renderer identity passed. Browser: 41 movement waypoints including the jumping return, nine quest/progression assertions, seven machinery damage/clock checks, nine controlled two-context co-op assertions, four death/banking checks. Shared dialogue pauses both worlds; cart and machinery synchronize; repeated snapshots cannot duplicate gear or shards; physical shard pickup remains individual. Main completion does not need the optional reward. No captured browser errors; full revealed dialogue fits 390px. Scenery totals 149,640 triangles with spatial culling (15,468 visible in one reviewed view); these are geometry counts, not measured device performance. Human difficulty/feel testing remains necessary.

Private archive ../../decision-archive/2026-09-21-iron-halls: 160 user messages, zero unparsed lines, valid source references. This completes Iron Halls, not the whole Emberdeep region. The current second half and boss still use their earlier implementation. Next: Great Furnace terrain, Pike/Martin, patrol diversion, evacuation/cooling routes, captive fire companion, remaining shard paths and confiscated Sunspire writings; then the large Colossus encounter. Preserve story reveal order and do not imply this entire queue is complete.

## [Codex | 2026-09-21] Immediate gameplay repair priority
Oliver reports frozen enemies and bosses, absent visual feedback for world interactions, and quest trackers stuck on first objectives across levels. Pause campaign expansion. Restore natural combat activation and expiring crowd control; correct elevated traversal. Show each newly added journal clue in an animated side panel for a length-sensitive reading interval. Keep current main and discovered optional tasks synchronized across authored and legacy levels. Validate real update-loop combat without forced activation, plus world interaction and peer updates.
