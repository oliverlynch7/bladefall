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

## [Codex | 2026-09-21] Apply supplied desktop soundtrack
Oliver authorizes importing Desktop/BladeFall Music tracks and both placement text files, choosing sensible placements where suggestions overlap. Preserve copies of the music in Git. The round-two note explicitly selects The Wayfarer’s Hearth as the main hub theme, beginning eight bars before the flute around 1:10 and ending around 3:07 with a smooth loop. Preserve the original and create a derived loop. Use exact scene-specific choices over broad alternatives; retain unimplemented ship/hydra/finale cues for their intended future scenes.

## [Codex | 2026-09-22] Continued implementation authorization
User: "Ok continue. Do a long update session and don’t waste usage"
Continue the approved queue from Great Furnace, then Colossus; reuse shared systems and perform focused verification. No requirements removed or assumed complete. Grounded plan: IMPLEMENTATION_GREAT_FURNACE_2026-09-22.md.


## [Codex | 2026-09-22] 2.014 implementation evidence
Great Furnace and Colossus campaign batch complete with 16 new VO nodes, two rescue paths, cooling/pressure puzzles, three remaining Emberdeep shards, Cinder and shared machinery/boss state. See IMPLEMENTATION_GREAT_FURNACE_2026-09-22.md for exact scope, tests and limitations. Pyromancer/trial, Storm Coast and the wider approved queue remain open. U167 preserved separately; no older approvals removed.


## [Codex | 2026-09-22] Storm Coast crossing foundation — 2.014.1

U168 continues the approved campaign queue. Built a host-owned voyage state machine and reusable low-poly longboat asset, plus an isolated browser preview at /3d/ship-preview/. Course alternates steering, two normal-combat handoff states, a sheltered one-use repair/role-swap stop and landing. It includes stale-input expiry, host-only wave completion, no client-supplied kills/arrival, pause, disconnect/dead-crew handling, deterministic obstacle placement and a long-hull collision capsule. Landing is emitted once; this module itself writes no saves or rewards. Static meshes are batched. Three new preview images are linked from the campaign gallery.

Validation: 80 seeded courses cleared without damage by a steering controller; collision dedupe, failure/arrival exclusion, wave gates, repair cap, solo/role swap, disconnects, pause, fixed-step determinism and stale snapshot rejection pass. Real Chromium browser: actual keyboard and pointer steering, pause/resume, two-player-role simulation, both ready buttons, repair button, 390px layout, no JavaScript errors and unchanged localStorage. Reviewed desktop/phone boat views and corrected phone framing. A pre-change 2.014 save retained gold/class/checkpoint clue without a replayed journal notice. This is not real network QA or normal-weapon deck-combat QA. Recorded preview views use roughly 2.8–4.2k triangles; device performance is not established.

IMPORTANT: this is an isolated development preview, not the completed Storm Coast replacement. Main campaign slot 5 still uses its legacy level. No shore quests, NPC voice lines, shards, hydra or normal combat were claimed as integrated. Next: build Shipwreck Shore routes, Otto/Rose quests and puzzles, connect the crossing to actual game combat/co-op/checkpoint systems, then Thunder Cliffs and hydra. Existing 206 Voice Studio lines/takes remain unchanged. Full queue remains open.

Private archive ../../decision-archive/2026-09-22-storm-crossing has 168 user messages, zero unparsed lines and valid source references. Implementation plan/evidence: docs/IMPLEMENTATION_STORM_CROSSING_2026-09-22.md.

## [Codex | 2026-09-22] Shipwreck Shore and campaign crossing — 2.015.0

U169 continuation implemented the first half of Storm Coast (legacy numeric slot 5 / abyss save ID preserved). Authored connected beach, upper wreck, lower hatch, lookout, cave, Rose wreck and memorial routes; three limited healing pads; guarded sailcloth; drain/latch puzzle; weighted hatch; seeded count-code chest with rare Stormshot crossbow. Otto takes three recovered boat parts separately or together and the boat visibly repairs. Male Captain Rose offers bell/crew-record dialogue with kind, honest, repairable offense and closed optional branches. Main progress never depends on Rose. SC-01 is a personal physical discovery; SC-02 is a shared NPC reward. Eighteen new stable voice lines bring the catalog to 224 without changing recorded takes.

The shore now leads into the real campaign voyage: host-owned steering, normal-weapon deck combat, two boarding waves, one sheltered repair/role swap, shared readiness and disconnect fallback. Landing alone banks shards and advances the half checkpoint. Hull failure restarts the shore and discards provisional progress. No mid-crossing checkpoint. Sailing uses a long-range overview and closer deck-combat camera. Browser review caught and fixed an accidental use of the Marksman boss type for shore enemies, replacing those with normal casters, and corrected sailing far-plane clipping.

Evidence: test-shipwreck-shore (four Rose routes, main independence, deliveries, puzzles, reward dedupe, 500 code seeds); test-ship-crossing (80 courses and authority); real browser qa-shipwreck-shore (43 controller waypoints, six story/world checks), qa-campaign-voyage (natural pursuit/damage, real weapon hits, two waves, landing/banking/checkpoint), qa-shore-coop (11 controlled two-context shared dialogue/reward/steering/ready/disconnect checks), qa-shore-checkpoint (hull failure whole-half reset). Previous-build save retained gold, class rank and checkpoint clue without duplicate notice. Voice API and shared mob import tests pass. Eight new screenshots, including 390px dialogue without overflow. Shore static scenery counts 17,208 triangles / 1,206 instances; not a device performance benchmark. Scripted pilot/invulnerability used for traversal QA; human balance and real-network latency remain unproven.

Scope: Thunder Cliffs and hydra are NOT implemented yet. Arrival still enters the legacy second half and its old boss remains pending replacement. Next: authored Thunder Cliffs terrain/quests, remaining SC-03..05, chained hydra mercy encounter and distinct arena, then Sunspire. Existing larger queue remains open. Private source archive: ../../decision-archive/2026-09-22-shipwreck-shore (169 messages, zero unparsed, reference validation passed).

## [Codex | 2026-09-22] U170 implementation checkpoint
Thunder Cliffs and chained hydra implemented in 2.016.0; completes Storm Coast halves/boss and five Pirate shards. Twelve Abe/Dash voice lines added (236 total). Existing approvals unchanged; not a new canon decision. Detailed scope, tests and limitations in IMPLEMENTATION_THUNDER_CLIFFS_2026-09-22.md and requirements/CONTINUITY.md. Sunspire and Castle remain pending.

## [Codex | 2026-09-23] U171 implementation checkpoint
Palace Courtyard (Sunspire half one) implemented as 2.017.0: two defense approaches, mirror door, Grace/Victor, garden delivery and cosmetic Refuge reward, rooftop parkour, SP-01/02, eighteen VO lines (254 total). Details and browser evidence in IMPLEMENTATION_PALACE_COURTYARD_2026-09-22.md / requirements/CONTINUITY.md. Sky Library, orb and Marble Colossus redesign still pending. No new canon decisions.

## [Codex | 2026-09-23] Sky Library

U173 continuation: Sky Library half two implemented as 2.018.0. Main access alternatives, raised/low routes, Hugh/Simon, shelf/display puzzles, archive defense, SP-03/04/05 and fourteen VO lines. Evidence: IMPLEMENTATION_SKY_LIBRARY_2026-09-23.md. Boss/orb/dragon still pending; no new canon.

## [Codex | 2026-09-23] Marble guardian and orb

U174: campaign Sunspire Marble Colossus arena/mechanics and post-boss orb reveal implemented in 2.019.0. Eight new VO lines, 276 total. Scope/tests/limits: IMPLEMENTATION_MARBLE_ORB_2026-09-23.md. Castle and finale still pending; no final-reveal spoilers introduced.

## [Codex | 2026-09-23] Castle Gates work begins
U175 continues approved MAP-08, LV-01..11, DLG, MP and shard work; no new canon. Grounded plan: IMPLEMENTATION_CASTLE_GATES_2026-09-23.md. Not yet shipped.

## [Codex | 2026-09-23] Castle Gates

U175: Castle Gates half one authored in 2.020.0. MAP-08 first-half infiltration/assault, Roland/Cross dialogue, two shard routes, appearance-only uniform and checkpoint behavior implemented/tested. Sixteen new VO lines, 292 total. See IMPLEMENTATION_CASTLE_GATES_2026-09-23.md. Long Ascent, last three shards, finale remain pending.


## [Codex | 2026-09-23] U176 Long Ascent continuation
Continue the approved Castle half-two scope in CAMPAIGN_EXPANSION_PLAN. Implementation plan: docs/IMPLEMENTATION_LONG_ASCENT_2026-09-23.md. Exact continuation archived in USER_SOURCE_2026-09-23_LONG_ASCENT.md. Final boss/ending remain pending.

## [Codex | 2026-09-23] U177 final encounter batch
Continue STORY-12 through STORY-21 and Castle finale plan. New implementation document records attack/charge defaults and checks. Preserve all unresolved ancestry/cosmology, cutscene-only Blade, and no victory before restoration.


## [Codex | 2026-09-23] Final King and restoration
U177: Castle final boss and restoration ending authored as 2.022.0. STORY finale sequence, single Gate, cutscene-only Blade, retry/skip charge, shared co-op contribution and twelve VO lines implemented. Evidence and playtesting limitations: IMPLEMENTATION_FINAL_KING_2026-09-23.md. Other remaining requirements stay open.


## [Codex | 2026-09-23] U178 return visits
Continue approved hub return adventures and per-save introductions. Grounded plan IMPLEMENTATION_RETURN_VISITS_2026-09-23.md. Source U178 archived. Dragon rider combat remains an explicit pending question, independent work continues.


## [Codex | 2026-09-23] Return visit checkpoint
Implemented the two approved Smith/Quartermaster return hooks, hub campaign news and save-local introductions. Evidence and exact scope: docs/IMPLEMENTATION_RETURN_VISITS_2026-09-23.md. This does not close the remaining companion/dragon or wider equipment/cosmetic queue. No new user design decisions inferred.


## [Codex | 2026-09-23] Dragon rescue work start
Latest continuation asks to continue efficiently. Next scoped work: approved Sunspire nesting rescue and ground companion; plan IMPLEMENTATION_DRAGON_RESCUE_2026-09-23.md. Mounted flight/combat not resolved or marked complete. Exact new message retained in USER_SOURCE_2026-09-23_DRAGON_RESCUE.md.


## [Codex | 2026-09-23] Sunspire dragon rescue checkpoint
U179 continuation implemented as 2.024.0-dragon-rescue: optional nesting route and rescue, ground companion/model/breath and four stable Simon lines. Evidence and limitations: IMPLEMENTATION_DRAGON_RESCUE_2026-09-23.md. COMP-03 riding/limited flight remains OPEN; no answer inferred to mounted-combat question. Original voice text preserved.


## [Codex | 2026-09-23] Home and tracks work start
U180 continues approved queue. Grounded plan: IMPLEMENTATION_HOME_TRAILS_2026-09-23.md. Two remaining return hooks; no new central lore or mounted-combat decision inferred.


## [Codex | 2026-09-23] Home/tracks checkpoint
U180 implemented as 2.025.0-home-trails: optional Thomas keepsake and Beastkeeper rescue/care shelter. Fifteen new voice lines; original dialogue unchanged. Scope, evidence and limits in IMPLEMENTATION_HOME_TRAILS_2026-09-23.md. No new central canon; COMP-03 mount/flight remains open.


## [Codex | 2026-09-23] Party trial work start
U181 continuation archived. Implement existing earned-trial multiplayer identity, personal eligibility and protected completion. Grounded plan IMPLEMENTATION_PARTY_TRIALS_2026-09-23.md. Encounter redesign and Pyromancer kit remain separate.


## [Codex | 2026-09-23] Party trials — 2.026
Implemented shared entry and completion for the seven existing earned class trials. Every participant requires personal Rift access and must gather in the Hall. Guest requests are host-validated; mentor dialogue, enemy progress and teaching sync under a dedicated session identity. Existing party HP scaling applies. Local equipment escrow, duplicate/stale message protection, completion receipts, abandonment, disconnect and existing hardcore wipe semantics are preserved. Starter tutorials remain solo.

Evidence: 34 two-context multiplayer handler checks, seven solo mentor/reward/loadout checks, nine Hall co-op checks, eleven return-adventure co-op checks, hardcore exit, pre-change save preservation, story/Rift/authority/Voice API tests and inline syntax passed. Three staged browser previews; gallery191. Voice Studio remains359 lines; no recorded text changed. Controlled relay is not an internet WebRTC soak test or combat balance certification. Trial arenas, Pyromancer kit, mounts/flight and remaining equipment/cape/trail audit remain open. Exact U181 archived with181 messages,zero parse errors and valid source references.


## [Codex | 2026-09-23] U182 work start
Continue VISUAL-COSMETICS-01 cape/trail overhaul; grounded scope in IMPLEMENTATION_CLOTH_MOTION_2026-09-23.md. Trial kits/scripts remain open. Corrected U181 source heading to the archive validator format; original text unchanged.


## [Codex | 2026-09-23] Cloth and motion cosmetics — 2.027
Implemented VISUAL-COSMETICS-01 cape/trail visual batch. Seven existing capes now use 117-vertex/192-triangle constrained cloth with animated shoulder/hip/leg clearance, garment clearance, woven texture, distinct emblems/hems and class-colored trim. Five trails use bounded actual-movement samples: soft dust, rising embers, frost stars, paired void ribbons and ghost wisps. Trails fade, clear on teleport/scene change, and obey particles-off. Existing cosmetic IDs, unlock rules and saves retained. Appearance now travels through peer presence; separate rigs, mirror and dash pose copies show their cape. Old voxel fallback retained. Standalone cosmetic-preview.html uses the same renderer on six original bodies, eight motions, phone controls, and never reads/writes saves.

Evidence: 48 body/motion checks, seven cape swaps, five trail checks and stop fade; all16 class palettes/capes in the live game mirror; peer packet/rig isolation, invalid IDs, particles-off, teleport and scene clear, cleanup, equipped cosmetic reload and pre-change campaign save all passed. 34 co-op trial regressions passed. Local old/new hub median frame time16.6/16.7ms, p9517.2/17.3ms (90 frames each); added384 rendered triangles in this view includes the reflected cape. Isolated cloth/trail update averaged0.10ms over300 calls. These are local measurements, not low-end hardware certification. Browser screenshots inspected across all body types, selected moving/casting/jump poses, all cape/trail designs. Gallery198; Voice Studio359 unchanged.

Limits: bounded cloth approximation, not full garment/weapon/environment collision. No claim of zero clipping in every weapon/skill pose; weapon fitting remains its own audit. Wider level z-fighting remains open, as do exact earned-trial scripts/Pyromancer and mounting/flight. This batch does not change combat difficulty or settle those designs. U182 archived:182 messages,zero parse errors,valid references in private cloth-motion-verified snapshot. U181 heading corrected for validator without changing its original text.

## [Codex | 2026-09-23] Weapon release motion work started
U183 continues approved equipment animation audit. Grounded scope: docs/IMPLEMENTATION_WEAPON_MOTION_2026-09-23.md. Charge serial restart and dagger release identity/lifecycle are demonstrated code gaps; prior static grip checks remain valid evidence, not proof of every moving pose.

## [Codex | 2026-09-23] Weapon motion validation
EQ-10 / VISUAL-REVIEW-03/04/05 release and co-op motion subset verified for2.028. See implementation report for tests and limits. Existing grip anchors retained; crossbow identity and remaining interaction poses remain open.

## [Codex | 2026-09-23] Crossbow correction started
U184 continuation: replace demonstrated crossbow-as-longbow mismatch with icon-aligned lightweight model and two-hand aiming pose. Scope and validation in IMPLEMENTATION_CROSSBOW_2026-09-23.md; combat rules unchanged.

## [Codex | 2026-09-23] Crossbow verification
Crossbow mismatch corrected in2.029 underEQ-10/VISUAL-REVIEW-03/04.48 crossbow poses,448 existing grip poses, peer/mirror/equip lifecycle, element colors and pre-change save checks passed. See IMPLEMENTATION_CROSSBOW_2026-09-23.md for scope/limits. Global surface/flicker audit remains next; trials/Pyromancer and mounts remain open.

## [Codex | 2026-09-23] U186 — weapon scale direction and music email
Approved for next weapon visual pass: slightly oversized silhouettes for most weapons, bounded by body clearance and secure hand grips. Keep daggers clearly smaller than swords and greatswords much larger; give spellblades a distinct intermediate visual identity. Exact multipliers not locked. Preserve preferred assets, enlarge blade/head portions where possible rather than blindly scaling handles/support anchors. Verify moving, attack, charge and skill poses across supported bodies. Make every elemental weapon visually color-coded. Review potential elemental-system improvements; do not treat this exploratory request as approval to change existing damage/status balance or add affinities.

Current inspected system: Fire/Frost, Poison/Arcane, Holy/Void opposition pairs; matching-element damage0.6, opposing1.5. Existing renderer has element tints; consistency/readability across models remains the audit. Storm/lightning are migration aliases to Arcane, not new active affinities.

Music list emailed to the explicitly requested recipient through Gmail; SENT receipt1a0d0ce62699de5c. Includes all14 recommendations, the six-piece priority batch, current coverage and creation notes. All40 desktop MP3s verified exact and tracked; live music router matches repository after newline normalization. Alternate Waystation Refuge remains unused; edited Wayfarer's Hearth is the hub theme. No runtime changes in this decision-recording turn. Weapon scale pass is queued alongside the existing global surface audit; neither is claimed complete.

## [Codex | 2026-09-23] Weapon presence work started
U187 implements U186. Grounded family-specific geometry pass documented in IMPLEMENTATION_WEAPON_PRESENCE_2026-09-23.md. Hand/support regions and rear pole shafts protected; no combat scaling or element balance changes.

U186/U187 weapon presence implemented in 2.030: family-specific distal sizing, protected grips, six-element visual consistency, mirror tint fix; validation and remaining work in docs/IMPLEMENTATION_WEAPON_PRESENCE_2026-09-23.md. Damage/element balance unchanged.

## [Codex | 2026-09-23] Shared surface audit started
FX-02 continuation: inspected partial overlap in shared ground tiling. Plan and limits: docs/IMPLEMENTATION_SURFACES_2026-09-23.md.

## [Codex | 2026-09-23] U189 playtest priorities
Approved journal/feedback, early pickups, kill quests/respawn pockets/elites, faster progression/shared rarity requirements, terminal dialogue exits and face review. Full reconciled scope and voice audit: requirements/USER_SOURCE_2026-09-23_PLAYTEST.md. Supersedes prior slower class-XP balance.


## [Codex | 2026-09-24] U191 — default NPC speech and continuation
User approves the face detail improvement and requests default device text-to-speech for existing lines without recordings, varied voices and male/female differentiation where available, followed by unfinished approved work in an efficient long session. Approved recordings remain primary; no paid generation or publishing of unapproved takes. Explicit existing speech-off preference remains respected. Plan: shared stable speaker voice selection, delayed voice discovery, safe cancellation/error recovery, settings default-on, approved face detail default-on, browser lifecycle/co-op/save regression; then continue the outstanding surface audit.


## [Codex | 2026-09-24] U192 — progression/combat continuation
User: Go ahead with a long work session. Don’t waste usage
Grounded continuation of U189: initial roster plus two combat tasks per level and Hydra rescue projects one rank10 class by finale under2.4 class XP/raw XP, rank7 by Frostfell. Player progression projects level10 by Frostfell and15 by finale; keep player rate1.5. Increase campaign class award to4/raw XP, retain other modes. Verify through actual gainXp with per-award class switching at10. This budget excludes dynamic quest waves, repeat farming and optional discoveries; not a timed human playthrough.
Found concrete co-op defects: noteKill runs before Bones resurrection, incorrectly advertising a death; guest applying host kill can resurrect its local Bones and loses later kill packets. Guest recreated elite uses its local base XP instead of host kill packet XP. Correct death authority and test both clients. Patrol re-spawns leave every old dead object in G.enemies; prune only retired patrol corpses after the existing fade, keeping authored story enemies.


## [Codex | 2026-09-24] U193 — named elite encounter continuation
Continue U189 optional miniboss requirements: four existing named ground elites get distinct attacks, readable danger shapes, locked aim, recovery windows, existing obstacle/edge checks, host-selected attacks and per-player damage checks. No new main-story, loot or class decisions. Plan: Raid leader directional sweep; Forge captain expanding jumpable ground pulse; Shore raider three aimed lanes with gaps; Tower captain cross-shaped strike with diagonal safe spaces. Existing authored positions/HP/rewards stay. Replace random base role (including exploding role) on these named units so identity is reliable. Verify damage bounds, warning/recovery, co-op state/dedupe, pause/stun/death, terrain support, rendered cues and save compatibility before main. These are implementation choices under approved miniboss scope, not newly attributed user decisions.


## [Codex | 2026-09-25] U195 — co-op combat visibility
User explicitly requests visible teammate skills, all weapon attacks and projectiles. Inspection: presence already carries body/cast poses, but cfx only relays basic projectile arrays and shockwaves. New combatArt identity effects are never relayed; persistent defense presentation only reads the local player. Implement bounded visual-only effect transfer, persistent teammate defenses, retained projectile styles, shockwave height/timing, scene isolation and duplicate suppression. Never execute remote SKILL_FX or duplicate combat damage. Verify all configured skill profiles, basic/charge weapon families, body poses, relay/echo and scene changes in real browsers; preserve saves.


## [Codex | 2026-09-25] U196 — party travel and navigation
Approved interruptible held teleport, teammate cycling and distant-party hint; gold main-objective arrows and cyan friend arrows; Mac movement input investigation. Exact source: requirements/USER_SOURCE_2026-09-25_PARTY_NAV.md. Grounded plan: IMPLEMENTATION_PARTY_NAV_2026-09-25.md. Teleport uses T for three seconds, Y cycles; both rebindable. Same scene only, no PvP/ship/finale scene skips; supported landing; movement/hits/release/menu/focus loss interrupt. Independent saved arrow toggles. Keyboard code fallback and held-key focus cleanup preserve existing bindings; exact Mac symptom not reproduced on the development PC.


## [Codex | 2026-09-25] U197-U198 — selected co-op saves, hub services, Brave input
Exact source: docs/requirements/USER_SOURCE_2026-09-25_PARTY_SAVES.md. Host and Join must offer saved characters and enter directly with that character's level, class rank and equipment. Hub quests must not block services; Beastkeeper purchases require the Black Woods two-animal rescue. Friend uses Brave on Mac; A/S/D still fail in open space. No permission to reset saves. Private archive contains 198 user messages with zero unparsed records and valid source references.

Implemented 2.038.0-party-saves: select save slot/mode before opening transport; slot changes reload safely because storage prefixes are boot constants. Host resumes selected checkpoint or hub; guest loads its own character before handshake. Hub story interaction routes to service landing, with separate return-quest choice and direct service access during introductions. Pet purchase gate checks completed rescue; rescue eligibility no longer requires an existing pet. Keyboard handlers run in window capture, leaving editor/menu/text input ownership intact; closing overlays clears lingering form focus; digital movement overrides analog on the same axis; blur clears axes. Key Bindings includes a live received-key/action diagnostic.

Validation: real Chromium save-picker host/join with controlled transport callbacks preserved distinct levels31/17, ranks9/7, gold1234 and other slot. Five hub service routes, rescue availability without pets, locked/unlocked purchases, W/A/S/D under a swallowing document handler, opposing analog input, blur and key diagnostic passed. Pre-change save preserved checkpoint/clue, pets, class rank, gold, hub introduction, return quests and disabled speech. Syntax/diff checks pass. Exact Brave/Mac failure was not reproduced; these are input robustness fixes plus a diagnostic, requiring the friend's device confirmation. No live saves/recordings modified.


## [Codex | 2026-09-26] Puzzle variety and journal steering
User: “I will say that a lot of puzzles were quite boring and all the same. Wish there was more variety and ingenuity. Also a lot of clues were hard to find in the journal after collecting still. Wasn’t intuitive”
Approved correction: replace repetitive puzzle interactions with varied environmental mechanics; prioritize discovered relevant clues and make every found regional clue searchable. Current batch starts with a physical timed machine shutdown in Iron Halls rather than another three-button memorization sequence. Other puzzle redesigns remain queued; do not claim campaign-wide variety is complete. Preserve quest outcomes, secret ownership, co-op authority and saves.

## [Codex | 2026-09-26] Enemy identity, grinding and equipment impact — pending implementation

Source: [verbatim user messages](requirements/USER_SOURCE_2026-09-26_ENEMY_GEAR.md), ENEMY-GEAR-01 and TRACKING-01/02. This supplements the combat/parkour/opening-story direction recorded in CONTINUITY; does not mark any gameplay work shipped.

| ID | Decision | Requirement / acceptance condition |
|---|---|---|
| COMBAT-IDENTITY-01 | A | Enemies need substantial size, bulk, color, shape and anatomy variation; avoid uniformly small toy-soldier humanoids. Entirely distinct designs permitted within existing art/performance constraints. |
| COMBAT-IDENTITY-02 | A | Research successful enemy rosters and adapt proven visual/behavior/encounter principles before the redesign. Prior puzzle research alone does not fulfill this enemy-research request. |
| COMBAT-GRIND-01 | A | Grinding must be enjoyable in itself and reward character XP, class XP and loot; combine this with previously requested area/type-specific defeat quests and capped respawning populations. |
| GEAR-IDENTITY-01 | A | Develop behavior-changing equipment bonuses with tradeoffs across armor, amulets, rings and weapons, beyond ordinary stat affinities. Airborne damage is a user example, not a locked item or numeric effect. |
| GEAR-IMPACT-01 | A | Audit equipment contribution relative to player/class scaling; ordinary weapon and armor upgrades should feel consequential and rewarding. Exotic effects alone do not fulfill this. Exact formulas remain to be designed and tested. |
| GOV-TRACKING-20260926 | A | Preserve every update idea, correction and decision in project records. Separate verbatim user source, approved direction, exploratory ideas, assistant proposals, implementation and verified completion. |

Related decisions: friend keyboard issue resolved by user confirmation; SFX work held for user. Element secondary-effect mapping remains exploratory. Assistant enemy roster, six-card intro, exotic set names and exact mechanics are suggestions, not approved specifications. Three requested image prompts were delivered; user questioned the combat-scene choice, so it must not be treated as a required art deliverable.

## [Codex | 2026-09-27] Character creation usability

Approved: larger full character preview; unmistakable naming; repair eye color; clearer class playstyle explanations; show actual starting weapons. Implementation evidence: [creator report](IMPLEMENTATION_CHARACTER_CREATOR_2026-09-27.md). Existing model replacement remains tabled; visual references are exploratory, not approved production designs.

## [Codex | 2026-09-27] Immediate new-player experience improvements

User: What else can we improve for a new players experience? Make some clear improvements now. Implemented focused instructions/help and class-choice confirmation; evidence: IMPLEMENTATION_FIRST_STEPS_2026-09-27.md. Full natural-route first-session playtest and illustrated opening remain unfinished.


## [Codex | 2026-09-27] Supplied opening illustrations
User: “Here are the 5 pngs for opening scene”. Five supplied files are JPEGs; preserve originals and integrate in provided order. Manual readable story cards, no late-game spoilers; canonical Ian death of old age and Briar defense. Runtime art direction otherwise remains undecided.

## [Codex | 2026-09-27] Approved Briar refinement pass
User approved combat/exploration improvements while away: distinct enemy roles, area-specific capped reinforcement hunt, meaningful safe-retry jumps, clear interaction results, nearby clue retrieval, and local canon cleanup. Grounded plan: refine existing western farm enemies/patrol system instead of adding duplicate quests; reuse existing telegraphs and raid elite; strengthen store-entry and orchard traversal; include Briar puzzle notes in clue lookup. Preserve larger art/element decisions as pending.

## [Codex | 2026-09-27] Remaining campaign refinement authorized
User: “Go ahead and make this improvement pass on the rest of the levels. Do a long work session don’t waste usage”. Extend Briar’s combat, traversal, interaction feedback and clue-access refinement across the remaining campaign halves. Preserve established art, finite story guards, saves and boss objectives; custom SFX remains deferred.
Grounded plan: replace generic kill counting with geographically authored hunt groups; preserve combat.* IDs/rewards; use reserved groups where every original enemy is a quest guard; prevent reinforcement discovery/spawns across tower storeys; expand discovered-only clue lookup; distinguish puzzle counters from picked-up items; strengthen selected existing optional traversal paths and verify existing specialized routes.

## [Codex | 2026-09-27] Puzzle overhaul and more parkour
User: “Keep going with the puzzle overhaul. And you could probably add more parkour”. Grounded batch: replace Ice Caves' main sequence with water depth/freezing/drain state; replace the optional side sequence with visible inlet/spill/chiller routing; shared-gear library shelf controls with a reset, visible target marks and a longer optional jumping crossing; two real gaps with catch ledges on Long Ascent's broken flight. Preserve completed open flags, existing reward IDs, main-story gates, host authority and recorded dialogue IDs. Required tower jumps use one ordinary jump; optional library route is harder.

## [Codex | 2026-09-27] Continue puzzle and parkour overhaul
User: “Continue” after the 2.045 puzzle batch. Grounded next batch: retain the Dungeons main rescue lift and its safety bank; replace the duplicate optional lower total-of-eight lock with a visible two-sided balance beam using the existing 2/3/5 weights. Each control cycles its weight through rack/left/right; all weights must be hanging with equal loads. Preserve kd.deep.open and RK-03, migrate discovered clue text, leave recorded dialogue unchanged. Raise the existing optional drain route and add three stepping-stone stretches; keep scratch navigation, RK-05 and the dry store reward, with safe water recovery. Verify single jumps, main rescue, co-op and saves.

## [Codex | 2026-09-27] Sunspire relay and roof continuation
User: “Keep on” after dungeon puzzle batch. Grounded plan: change courtyard mirror presentation from independent receivers to one spatial sunbeam relay with three real reflection points and a final door receiver; retain mask/open flags and existing two-position controls, but draw only reached mirrors as lit and replace weight feedback with light-path feedback. Expand optional roof ascent with single-jump rising stones and catch ledges. Preserve main route, NPC recordings, solved saves and SP-01.

## [Codex | 2026-09-27] Emberdeep physical cooling and traversal
User approved the proposed Emberdeep machinery/puzzle/parkour pass. Grounded scope after inspection: retain Iron Halls pressure/timed hammer shutdown; enhance Great Furnace staged cooling with actual declining heat, water/steam/gauge feedback and a guard controlling channel access. Drain must wait for the safe heat band, validated by host and replicated to guests. Preserve current shape order/recorded Martin directions and solved flags. Add two modest gaps to cooled crossing with catch/recovery, and rising jumps/catch ledges on optional upper pressure path. Preserve workers, Sunspire papers, ED shard IDs and main-story gates.

## [Codex | 2026-09-27] Storm Coast traversal and machinery
User approved Storm Coast next. Inspected existing boat repair/crossing, counterweight hatch, cliff lift/race/wind route and merciful Hydra. Scope: visible cargo/beam response and a lowered hatch-access ramp using existing solved flag; broken wreck decking; required upper-cliff gaps and narrower optional wind stepping stones with catch ledges; raised Hydra flank jumping route above low sweep. Preserve story, recordings, class shards, boat minigame and restrained-animal outcome. Validate single-jump routes, recovery, co-op and saves. Tide sequence is unchanged in this batch.

## [Codex | 2026-09-27] Duskmoor traversal continuation
User: Continue after Storm Coast. Grounded batch: preserve disguise challenge/finite assault and finale. Add second exposed upper spiral stretch with two single-jump gaps/catches; optional memorial shard stepping route; improve existing bridge catch and vault wheel physical feedback using current flags/settings and no new recorded lines. Preserve solved flags and shard IDs. Verify routes, story branches, co-op and saves.

## [Codex | 2026-09-27] Campaign audit and difficulty steering
User approved campaign-wide testing and added: "my guess is that the difficultyl is slightly too easy right now." Diagnostic pass found ordinary enemy damage unchanged across regions while HP scales; 61 navigation transitions and 15 half-level movement/attack probes pass. No balance changes yet. Exact limits, repetition candidates and proposed controlled difficulty experiment: docs/CAMPAIGN_AUDIT_2026-09-27.md. Full natural fresh-save playthrough remains outstanding.

## [Codex | 2026-09-27] Approved progression and co-op rebalance
User authorizes logical progression rebalance and co-op enemy HP below 2x for two players. Inspection: existing +60% HP per ally applies only at spawn. Plan: retain 1/1.6/2.2/2.8 curve, reconcile existing campaign enemies on host when party size changes, preserve HP fraction and special boss base HP. Regular campaign half-level enemy damage +10% per region, +3% second half outside Briar; no extra enemy HP or boss damage scaling. Preserve beginner trials/PvP/side-mode tuning and existing difficulty presets. Verify late join/leave/no compounding, boss base HP, damage curve and saves.


## [Codex | 2026-09-27] Tutorial completion persistence
User reports completed starter tutorial reopens class selection after returning to title/reloading. Inspection: title resets MODE=null; direct New Game -> openCharCreate never loads a mode, so persist skips character storage. Plan: initialize Normal save before character creation when no mode is active; preserve selected name/appearance and completed trial flags/loadout; ensure skipping first practice also establishes hero snapshot. Verify actual new-character UI, complete/skip, title/reload and separate slots; do not use global tutDone as completion evidence.


## [Codex | 2026-09-27] Pause-menu multiplayer access
User requests multiplayer from the in-game Esc pause menu. Grounded plan: add a Multiplayer entry, preserve the existing host/join save selection, carry a contextual Back action through lobby and save picker, and show current-room code/leave controls when connected. Opening/backing out must retain current world and checkpoint.


## [Codex | 2026-09-27] Use active save for in-game multiplayer
User clarifies that multiplayer opened inside a save should not ask for a save again. Supersedes prior pause-picker requirement. Plan: distinguish pause entry via its existing Back callback, save using normal checkpoint rules, automatically pass current SLOT/MODE to the existing connection flow. Title-screen multiplayer retains picker. Do not connect an unfinished starter with no saved hero; explain completing/skipping practice.


## [Codex | 2026-09-27] New character slot navigation
User reports Create for another character reloads to title. Inspection: slot Create and Play both call selectSlot, which reloads without a follow-up action. Plan: carry a one-shot create intent for an empty selected slot, start opening/creation after reload, immediately create for current empty slot, route occupied Play through continueSlot. Guard existing saves against creation and keep deletion behavior unchanged. Verify browser slot-switch creation, saved-slot resume and prior-save preservation.


## [Codex | 2026-09-27] Save/multiplayer regression audit
User reports deletion failed and requests rigorous audit after disrupted friend playtest. Reproduced: active slot deletion removes mode file but unload rewrites global achievements; slotSummary treats achievements as character, leaving phantom occupied slot. Plan: per-slot generation invalidates stale writers (including other tabs), blank global record prevents legacy resurrection, slot occupancy based on real save data, checked deletion errors. Audit create/complete/skip/reload, three slots, active/inactive/cancel deletion, stale writers, legacy imports, host/join selection, success/failure/retry/cancel and controlled two-browser room transitions. Inspect/fix additional evidenced defects; distinguish simulated transport from real remote network testing.


## [Codex | 2026-09-28] Briar combat revamp approved
User: "ok lets revamp briar now then. i can playtest when u done". Scope: both Briar campaign halves. Inspection finds existing hunting tasks, replenishing camps, farm raid leader and authored Brute; ordinary soldiers still share basic AI. Implement three readable ordinary troop roles (committed runner lunge, slower guard sweep, aimed ground hex), consistent respawns and host-owned co-op attack snapshots. Preserve quest/save IDs, current art direction, finite story guards, beasts, terrain, parkour, and boss encounter. Keep introductory warnings generous and punish through avoidable attacks rather than increased health. No custom SFX work. Verify actual browser combat, dodge geometry, camp replenishment, co-op synchronization and pre-change save.


## [Codex | 2026-09-28] Journal and loot overlap
User reports journal notes overlap item-drop UI and requests repositioning. Inspection: both occupy left side around 175px/31% height. Plan: place journal beside visible loot on wide screens; defer journal display without consuming reading time on narrow screens. Preserve all notes and loot actions. Verify simultaneous panels at desktop/laptop/mobile sizes.


## [Codex | 2026-09-28] Briar obsolete portal and solid props
User requests removal of leftover purple portal in Briar first half and collision on solid objects. Inspection confirms legacy G.secret thornwood portal survives new opening builder, and authored nocol crates/fences/posts/trunks bypass old large-mass auto collision. Plan: clear only Briar legacy secret/trigger; preserve Rift Hall/shards. Add final Briar solid-prop pass for ground-level wooden/stone boxes and fences, excluding vegetation, terrain banks and overhead details; retain existing colliders where already present. Verify physical blocking and authored access routes in browser. Broader campaign collision audit remains separate from this focused Briar fix.


## [Codex | 2026-09-28] Bag hierarchy and companion framing
User requests two top-level bag categories: Weapons and Armor (including rings/amulets); Weapons has Physical, Ranged, Magical rather than individual weapon types. Character previews should zoom out to show the pet. Plan: nested collapsed groups using existing weapCat family classification, retain armor slot subgroups, preserve expansion on equip/sell/sort. Pull back shared bag/inspect portrait camera and center framing on hero plus companion. Verify grouping and item actions in browser.


## [Codex | 2026-09-28] Hub quest exclamation indicators
User requests yellow exclamation indicators when hub NPC questlines become available. Existing labels use a small diamond and require a known service dialogue, hiding Thomas requests. Plan: dedicated yellow ! above nameplates for new/ready return quests, independent of service dialogue; show these farther across plaza. Keep introduction/news indicators and shop access unchanged; accepted/completed quests clear quest marker.


## [Codex | 2026-09-28] First tutorial death retry
User requests that a new player dying in their first tutorial retries and respawns without choosing a class again. Plan: dedicated first starter-trial death screen with Retry tutorial; respawn at its start with restored health and mana, keeping chosen class and tutorial progress. No character wipe during this onboarding, including challenge-mode onboarding; later campaign/challenge deaths unchanged.


## [Codex | 2026-09-28] Remove tutorial Treasure Sprint portal
User requests no Treasure Sprint portal in tutorial trials. Generator currently adds bonus portals at shared stage indices even during beginner trials. Guard this generation with !inBeginnerTrial(); keep normal exits and hub sprint.


## [Codex | 2026-09-28] Guided tutorial and local minimap
User requests comprehensive action-gated onboarding: movement, jump, dash, first skill, enemy danger, six kills then exploration for exit; HUD health/mana, quest tracker, character level versus class rank; small circular minimap. Plan: paused bite-size lessons with actual bound control prompts and brief action practice, highlighted HUD explanations, first-skill follow-up after unlock, skip-guide option, and north-up local terrain/enemy/open-exit radar. No hidden secret markers. Keep existing trial difficulty and six-kill goal.


## [Codex | 2026-09-28] Held jump lesson clarification
User specifically requests press-and-hold jump instruction. Guided jump practice requires at least 0.3 seconds held; a tap demonstrates a short jump but does not complete the lesson.


## [Codex | 2026-09-28] Compact first Rift Shard notice
User says first-shard explanation lasts too long and blocks the character. Replace centered 18-second card with a compact side notice lasting 6 real-time seconds, brief essentials and bound Journal key. Full existing journal explanation retained; narrow screens use a short lower strip.


## [Codex | 2026-09-28] Co-op name and health overlap
User reports friend names blocking health bars. Found duplicate friend navigation caption near the existing overhead nameplate, plus unscaled peer text/bar offsets. Suppress navigation marker when peer is inside the view, retain edge guidance, and give name/class/HP/ping distinct DPR-scaled rows.


## [Codex | 2026-09-28] Heading-up minimap
User requests minimap follow player facing rather than north-up. Rotate terrain/enemies/exit together around a fixed upward player arrow, smoothly follow shortest-angle turns, and move the N compass marker around the rim. Update tutorial wording.


## [Codex | 2026-09-28] Menu organization and bag consistency
User requests Records as a dropdown within Achievements and removal of pause Records tile; Settings logically grouped; icons on Weapons/Armor and Physical/Ranged/Magical; all armor/jewelry categories visible even at zero items. Plan: reusable records content in a details section, organized settings accordions retaining selected section through toggles, existing icon assets and all GEARSLOTS populated.


## [Codex | 2026-09-28] Hub entrance cleanup
User requests remove Postings, relocate Sparring Room to its former place, and move Rift Hall to an uncluttered southwest position near Abyssal Descent. Plan: remove board interaction/render record, move sparring fixture to (610,245) and its fallback pavilion/dummy consistently; place Rift Hall at (-610,710) with aligned pillars and clear approach, away from Stylist sign. Preserve all destination functionality.


## [Codex | 2026-09-28] Pause grid and class appearance requirements
User specifies four top buttons: Gear, Bag, Classes, Achievements; four bottom buttons: Settings, Multiplayer, Quit to Hub, Title Screen. Remove pause Skins access; Stylist remains appearance entry. Earlier approved class appearance overhaul remains pending: default/rank-5/rank-10 variants for every class, increasing visual richness, cosmetic-only, customize only equipped class, remember each class selection. This hub/menu cleanup does not claim the rank palettes are implemented.


## [Codex | 2026-09-28] Prominent NPC services
User requests larger main hub service buttons with matching icons. Apply shared prominent service button to landing and in-conversation shortcut for all five service NPCs, using the actual service label; preserve quests and service gates. Verify size, icons and click behavior in browser.


## [Codex | 2026-09-28] Moving attack legs and shared emotes
User reports bowed/glitched legs while moving and attacking; requests M mouse-direction wheel of 4–5 universal emotes visible in co-op. Grounded plan: include locomotion parent bones in lower-body overlay; add Wave/Point/Cheer/Bow/Dance wheel, cancel on action/damage, synchronize validated visual-only state through existing motion packets. Test browser input, rig transforms, peer snapshots and saves.


## [Codex | 2026-09-28] Crystal Waystone centerpiece
User requests a much larger, intricate, epic and ethereal hub Waystone resembling a sorcerer’s transportation crystal. Plan: replace the tiny octahedron/old pillar with a faceted floating central crystal, smaller satellite crystals, luminous etched rings and restrained particles over an ornate stone-and-gold base. Preserve its interaction, healing/banking/travel and clear approach; retain reduced-motion and low-quality support.


## [Codex | 2026-09-28] Isolated inventory portrait
User reports lag, moving world character and NPC contamination in bag preview. Requests independent still equipped hero/pet, companion behind and to side, centered hero, wider equipment area. Plan: replace main-canvas capture/readback with dedicated on-demand renderer and cloned idle rig; independent companion clone; deterministic staging and resource cleanup. Expand equipment column and verify no world/NPC content, pose stability, drag and saves.


## [Codex | 2026-09-28] Persistent walkable surfaces and facade flicker
User reports vertical house-side flicker, first mimic terrace flicker, and Black Woods canopy platforms disappearing underfoot; requests global fix. Inspection: Outskirts cutaway double-counts plat y0+h and uses XZ-only rays, unlike other region renderers. Plan: shared height-aware camera-to-torso AABB occlusion with top-under-feet immunity, used by all regional/voxel cutaways; separate coplanar trim/base and roof layers; browser sweep actual campaign surfaces, explicit canopy support and occluding wall positive controls, geometry audit and saves.

## [Codex | 2026-09-28] Class choice clarity and balance audit
User requests rigorous audit of all class skills/passive choices: remove unexplained named resources such as Momentum; retain understandable stacking bonuses with explicit trigger, amount, cap and duration; correct unequal choices and avoid hidden penalties. Specific report: Warrior rank 7 Bloodlust is unclear versus Tactical Guard. Grounded plan: inventory live class definitions and effect handlers, reconcile text with mechanics, simplify obsolete resource-dependent passives, rebalance punitive or ineffective options, preserve save IDs, verify representative runtime effects plus all-class choice integrity in browser and old-save regression. Numeric balance remains subject to playtesting.

## [Codex | 2026-09-28] Functional class audit includes healing and PvP
User explicitly adds runtime verification of every class choice, especially healing/lifesteal, and consistent enemy/player targeting in PvP with sensible PvP limits. Inspection found projectile sources bypassing class and lifesteal hooks, PvP early-return bypassing attacker passives, and incoming PvP subtracting HP directly without shields/defensive passives. Extend audit to shared damage handling, confirmed-hit lifesteal, healing triggers, and multiplayer damage/receipt tests.

## [Codex | 2026-09-28] Automatic ordered Rift Hall
User requests portals in campaign order counterclockwise, Briar Town first at entrance; five matching shards automatically open the portal. Keeper is optional lore/information only. Preserve saved-shard rules and Necromancer ending prerequisite. Plan: share frame coordinates across interaction/collision/art; derive access from saved sets; remove assembly action.

## [Codex | 2026-09-28] Safe Ninja Unseen landing
User requires Unseen Strike never teleport off-map and always land on solid ground. Plan: validate footprint, bounds, height and blocking geometry; try nearby rear positions; keep original position when none is safe.

## [Codex | 2026-09-28] No trial bosses
User requires tutorials and class trials never spawn bosses. Plan: strip inherited boss/miniboss stage type in trial generation; substitute regular enemy at shared spawn boundary for boss archetypes. Verify all trials retain sufficient kill targets and campaign boss spawning survives.

## [Codex | 2026-09-28] Guided hub tour and less reading
User requests mandatory first-visit hub camera tour with always-available skip, overhead overview followed by each shop/NPC/portal/interactable; minimal text explaining purpose and when useful. Also requests concise dialogue throughout game, fewer cumbersome options, reduced reading fatigue while preserving lore and mechanics. Plan: actual hub-position tour, completion/skip persistence and replay, instant dialogue visibility, services first, editorial shortening without changing effects or puzzle solutions.

## [Codex | 2026-09-28] Player-level stat allocation
User wants additional player-level stat points for meaningful customization, balanced to avoid overpowering or lengthy interruptions. Interpreted “too many” as “not too many” from explicit stated intent. Proposed, not yet tuned: one point per character level using proposed Health/Attack/Defense/Speed/Mana choices; allow spending later and rebalance automatic growth instead of stacking extra power. Preserve as queued work while completing active hub/dialogue task.

## [Codex | 2026-09-28] Controller setup
User: "could we also add controller compatability to the settings for pc player who perfer contrller tyo play. Make it an easy to setup and universally adaptable controller mapping for both ps and Xbox controllers. It should be easy for a controller player to rebind buttons if needed. Feel free to copy another successful game around this setup or do any research online you need to do it right the first time."
Plan: extend existing standard Gamepad API controls with persistent button rebinding, automatic/manual labels, stick/deadzone settings and live diagnostics. Release owned inputs on disconnect. Add controller menu navigation. Browser simulation plus pre-change save verification; physical device compatibility remains hardware-dependent.

## [Codex | 2026-09-28] Pyromancer and queued character customization
User: "Have you designed and added in pyromancer yet? If not please do so And then after that begin working on the proposed updates we recently discussed that you created. A framework for but haven’t implemented yet. DOA long work session and don’t waste usage"
Implementation plan: complete reserved Emberdeep Pyromancer as Magic/Ranged class with eight skill alternatives, eight passive alternatives, rank-10 bonus, concise descriptions, existing model with warm class palette, mentor and boss-free earned trial. Use shared combat paths for PvP/co-op. No named heat resource. These are implementation choices under this request, not previously approved kit numbers. Then implement proposed five-stat character creation allocation, class foundations and one spend-later point per player level, with bounded bonuses and save-safe state. Keep SFX generation deferred. Preserve unrelated queued work.

## [Codex | 2026-09-28] Pyromancer and character stats — 2.081.0
Implemented Pyromancer as Emberdeep's earned magic/ranged class: five shards open its Rift Hall trial, a dedicated mentor teaches it, eight skill alternatives and eight passive alternatives progress through rank 10. Warm class palette, Wizard model, fire staff, icons and shared combat effects are wired. Fixed modern Rift Hall trial-region routing. Boss-free trial and unlock flow verified.
Character creation now offers ten equal-budget points with class-biased dice rolls across Health, Attack, Defense, Speed and Mana. One additional point per player level, 20 per stat/100 total; Bag → Character Stats spends points, Drillmaster reassigns them freely. Starter foundations follow equipped class. Adjusted future automatic growth to leave room for allocation; existing saves retain earned raw stats and receive their level's unspent budget. No automatic new lifesteal. Snapshot/trial/class-switch persistence verified; campaign checkpoint rollback remains intentional.
Validation: 136 skill handlers, 11 boss-free trials, 18 Pyromancer effects checks, confirmed PvP reward and duplicate-receipt checks, 307 stat assertions, actual creation/spend/reload/class-swap flow, pre-change save regression, story/state/voice tests, JS syntax and diff checks. Desktop and 390px menus inspected. Physical multiplayer soak and natural campaign balance remain playtest work. This completes these two queued systems, not the entire historic backlog.

## [Codex | 2026-09-28] Tutorial and Waystation revision request
User decisions: combine WASD into one lesson; pause only for basic movement/jump/attack/dodge until input, not bag/journal informational lessons; prevent enemies creeping closer between practice pauses; move text above the center; recognize mouse attack/dodge; place HUD explanations beside their target with an arrow; E continues and Q skips. Reach class rank 2 after the first three tutorial enemies so the remaining three teach Skill 1. Simplify skill confirmation, keyboard E confirm/Q cancel. Improve the foggy overview; camera previews must face readable fronts. Sparring entrance must align with adjacent Beastkeeper/Mirror. Explain Descent as gold/XP/items grinding and Endless Dungeons as a separate challenge. Rebuild the tangled/backward Rift Hall entrance with one sign. Explain campaign entrances as a group, pointing to Briar as the first main adventure, without individual level spoilers. Upgrade every hub station, color and detail; give Quartermaster and Drillmaster distinct furnishings; display actual sold companion models in Beastkeeper pens. Remove duplicate floating name/role tags while retaining quest availability; put orange service text next to the interaction prompt and raise prompts above heads (especially Drillmaster, Stylist, Smith, Quartermaster).
Grounded plan: replace guided tutorial pacing/input state machine, freeze hostile AI during core practice, streamline choice confirmation inline, guarantee starter trial class training after kill three. Use shared station-facing metadata for art, colliders and camera; remove duplicate Rift Hall generic stall; brighten hub fog/light and add distinct station props/companion displays. Verify inputs, progression, camera stops, approaches and old saves in browser. Broader backlog remains preserved.

## [Codex | 2026-09-28] Tutorial pacing and Waystation presentation — 2.082.0
Replaced 18 lessons with one WASD movement lesson, jump, mouse/keyboard attack and dodge practice, and concise non-blocking information tips. Hostile AI remains frozen continuously during core practice; only core input waits pause the world. HUD callouts move near their highlighted target and draw an arrow. E continues informational pages, Q skips; bag/journal work normally. Mouse controls are recognized through game-surface overlays. Pointer aiming resumes during non-blocking tips. Starter trial XP is held below rank 2 until kill three, then grants the remaining class XP; repeat/high-rank characters retain progress. Inline skill selection keeps both choices visible with E confirm/Q cancel and an accidental-click guard. Shortened initial and skill-unlocked explanations.
Hub tour: 17 stops instead of 25, one spoiler-free campaign stop points to Briar Town. Explicit station front-facing cameras, brighter/distant fog, narrow-screen framing, E/Q tour navigation. Descent explains gold/XP/items; Endless Dungeons explains separate challenge mode. Sparring art/colliders/approach now align with adjacent shops. Removed duplicate Rift Hall generic stall and built one signed animated violet entrance. Removed redundant floating name/role tags; retained quest exclamations, raised interaction prompts and added orange service text. Richer station canopy colors, trim, distinct supply counter and training weapon rack/map table, Stylist fabrics, actual Shepherd/Cinder display pens, greener garden canopies/flowers and decorated activity arches. Shared companion models are reused and display resources disposed on leaving.
Verified: browser keyboard/mouse tutorial actions, no hostile movement during practice, informational game-time progression, E/Q, third-kill rank 2, inline choice cancel/confirm, visible front views, 390px framing, clear authored hub approaches, old-save currency/class/pets/clue/checkpoint preservation, 11 boss-free trials, 136 skill handlers, story state/authority, syntax and diff checks. Expected local voice API 404s only. No physical controller or internet party soak in this pass; combat balance remains playtest-driven. User owns SFX work.

## [Codex | 2026-09-28] Four-step character creation and white-screen report
User: starting stats must be prominent, not an optional dropdown. Latest preferred flow is one full-screen task at a time: class, face/eyes (restore mouth choices and add eyebrow choices), starting stats, then name and start the selected class tutorial. Persistent side preview reflects choices and displays chosen name. Large orange Next, Back to previous steps, preserve edits; blank name becomes Nameless. Reported entirely white screen while taking damage on new character load; follow-up says it did not recur and HUD visibility uncertain.
Plan: implement a four-step creator with a single persistent preview canvas, explicit teardown on exit, saved fitted mouth/brow options and visible stat allocation. Investigate preview WebGL context churn and loading/graphics safety. Current loader resumes combat after 12 seconds even when not ready; replace with a protected retry state. Do not claim the intermittent incident's cause without evidence.


## [Codex | 2026-09-28] Four-step creator and graphics recovery — 2.083.0
Character creation now presents Class, Face, Starting Stats, then Name in separate steps with persistent side preview, prominent orange Next/start, Back preserving edits, and blank name Nameless. Added saved mouth and eyebrow choices; preview reflects eyes/face immediately. Stats are mandatory to view but optional to change; existing allocation rules retained.
Reproduced old creator WebGL exhaustion after 25 eye changes (11 context-limit warnings, main context lost). Reuses one preview canvas and renderer per session and explicitly disposes/releases it on exit. Main graphics-context loss now stops simulation and rendering and presents reload recovery; loading no longer resumes combat after an arbitrary 12 seconds before world readiness. This fixes a reproduced failure consistent with the white-screen report, not proof of the user's exact intermittent cause.
Verified in browser: 25 eye changes without loss, canvas identity, Back/name retention, Nameless tutorial start, mouth/brow persistence across reload, stat creation/spend/reload/class swap, injected main context loss freezes HP and game time, pre-change campaign save retains pets/class/currency/clue/checkpoint. Desktop and 390px layouts inspected, short-screen Next remains visible; syntax and diff checks passed. Local voice API 404s expected. Physical device/remote co-op soak not performed.


## [Codex | 2026-09-28] Rank-earned class skins — approved expansion
Implement all classes with default/rank-5/rank-10 cosmetic appearances through Stylist only, per-class saved selection. User approves varied colors beyond base hues while retaining class distinction and requests unique modeled/animated embellishments, especially rank 10 (galaxy Mage with stellar orbit is explicitly welcomed). Avoid repeating overhead halos across classes. Rank-10-all cheat must naturally unlock all appearances. No combat benefits. Grounded plan: separate appearance catalog/state from legacy stat-bearing skins; shared palette/attachment renderer for player, peers and previews; rank-derived unlocks; persistent per-save selections. Preserve default class looks, gear, equipped capes, disguise and saves.


## [Codex | 2026-09-28] Rank-earned class appearances — 2.084.0
Implemented 17 classes x default/rank-5/rank-10 (51 appearances, 34 new palettes/detail sets). Stylist Wardrobe owns Class appearances; removed remaining title/legacy-pause skin entry points. Preview locked looks, rotate model, equip only at required class rank; selected tier stored per class per save. Unlocks derive from current class rank, including rank-10-all cheat; no new combat modifiers and no changes to legacy saved stat-bearing skin state.
Catalog/design details: CLASS_APPEARANCES_2026-09-28.md. Distinct colors and modeled details include galaxy Mage halo/stars, Warrior crest/plates, Ranger feathers, Paladin gold sunbursts, Chronomancer animated clock/gears, Pyromancer ember vents/flames, Pirate compass chains and class-specific bone/horn/cloth ornaments. Bounded geometry (48–1,259 additional triangles for earned variants), no dynamic lights. Reduced motion freezes ornament animation. Local, peer, mirror and cloned bag appearance use equipped details; castle disguise suppresses them. Co-op packets validate and relay cosmetic tier.
Browser verified all 51 previews, zero context loss, all 17 selected tiers reload, rank4/5/10 gates, unchanged player stats, actual local application, validated peer packet round trip and rendered peer ornaments. Pre-change save preserved class/pets/currency/clue/checkpoint; desktop and 390px layouts inspected; JS syntax and diff checks passed. Fixed preview teardown ownership so an old modal observer cannot lose the new modal's WebGL context. Full per-class motion/cape clipping and real-network device performance remain playtest work; do not claim exhaustive animation clearance.


## [Codex | 2026-09-28] Default binding audit
User requests resolving concerning overlaps and making Tab/Left Shift useful for frequent actions. Grounded plan: Tab/B Bag, Left Shift/right-click dodge, V auto-loot cycle, remappable M emotes; retain E/F/R/Q/1-4/G/T/Y/N/L. Preserve custom bindings; migrate only recognized old defaults when destination free, fill new actions without stealing keys. Fix duplicate-producing per-action reset, context guards, rebind capture versus emote wheel, and keyboard/mouse hold overlap. Tab retains menu focus navigation; E/Q tutorial shortcuts remain contextual.


## [Codex | 2026-09-28] Default controls audit — 2.085.0
Defaults: Left Shift/right-click dodge; Tab/B bag; V auto-loot cycle; M remappable emotes. WASD/arrows, Space, left-click/J attack, 1–4 skills, E interact, F equip drop/R bag drop/Q sell drop, N journal, G ping, T teleport/Y friend selection, L auto-fight unchanged. Menu Tab still navigates focus; Escape and editor/browser function keys reserved. Recognized old defaults migrate only when destination keys are free; custom assignments are preserved and new actions take only free keys. Per-action reset transfers its default keys cleanly; lookup removes duplicate/reserved entries.
Added actual shared action routing for Bag, integrated emote rebinding, prevent gameplay toggles in menus and browser modifier shortcuts, removed J/K destructive loot-popup shortcuts, retain both keyboard/mouse held states until all released. Beginner help and tutorial hints updated; dynamic bag/journal/current-control labels respect rebinding.
Browser QA passed unique defaults, old-default migration, custom V/Tab preservation, per-action reset, actual Tab bag opening/Escape return, Tab focus, Shift/mouse combined hold/release and M emote/rebind. Pre-change campaign save preservation, JS syntax/diff checks passed. This audits gameplay defaults and scoped menu/tutorial inputs; physical controller testing remains separate.


## [Codex | 2026-09-28] Pyromancer icons
Approved: install the corrected semi-pixelated 19-image set from pinned ChatGPT Bladefall icons; ignore the rejected first pass. Preserve exact skill/passive mapping and original files.


## [Codex | 2026-09-28] Pyromancer icon set — 2.086.0
Imported the corrected semi-pixelated 19-image set from the pinned Bladefall icons chat: 8 active skills, 8 selectable passives, innate, capstone and class emblem. Original transparent PNGs and SHA-256 mapping manifest are preserved in assets/source/pyromancer-icons; runtime copies are 256px (1.66 MB total). Standard renderers cover skill bar, rank choices, class tree and class badges. No gameplay/save identifier changes.
Real Chrome test passed 19 image decodes, all 8 skill-bar variants, all 8 rank-choice pairs, 10 passive tree images, class emblem and pre-change save preservation (class/rank/choices/gold/name/pets); class-tree screenshot inspected. Syntax/diff checks passed. Browser logs included unrelated GLTF texture-load errors around iframe navigation; do not claim an error-free whole-game session. Test source: scripts/qa-pyromancer-icons.html, served temporarily in public/3d alongside previous index as _qa-prechange.html, using isolated localhost port 4332. Fixtures removed after testing.


## [Codex | 2026-09-29] Approved UI icon rollout
User: "Gpt finished the new icons. Please download them in the same bladefall icons pinned chat and apply them tot rhbgame". Scope: 33 subjects plus 4 optional destination refreshes; settings/emote repeats are alternatives.
Plan: preserve original images and mapping, split transparent sheets into individual icons, normalize padding, select coherent alternatives. Wire all 37 to existing destinations, voyage HUD, journal/quests, settings sections, emotes, class appearances, stat allocation, co-op teleport and built-in equipment portraits. No mechanics or save-ID changes. Verify real browser rendering, images and pre-change save compatibility.

## [Codex | 2026-09-29] Stylist facial customization
User: "We should be able to change our eye color, or face, or mouth shape rather, and our name for a small amount of gold at the stylist as well."
Implementation plan: 25 gold flat per confirmed makeover, combining eye color, mouth, eyebrows and name. Reuse character-creator options, preview the equipped class/look, keep edits in a draft until explicit purchase, no charge on unchanged/cancelled/invalid edits or insufficient funds. Store through existing per-character fields; route Mirror rename through the same paid hub service. Test old-save loading, exact charges, cancel/no-op/insufficient funds, persistence and preview cleanup.

## [Codex | 2026-09-29] All-model face options and no eyebrows
User requests mouth/eyebrow variations across character models, including No eyebrows in character creation. Shared fitted-face renderer already supports the five selectable mouths and four eyebrow poses on all six base models (17 classes). Add none to both UI option lists and saved-value validation; omit eyebrow meshes entirely for none. Validate actual rendered meshes/textures across classes, purchase/save reload and creator choice.

## [Codex | 2026-09-29] Facial position, tilt and randomization
User: "You should also add the ability for the player to adjust the position and tilt of mouth and eyes for more customization. And add a randomize feature too for fun."
Add shared optional position/tilt sliders (horizontal, vertical, tilt for eyes and mouth), bounded relative to each fitted model. Randomize face changes only eye color, mouth, eyebrows and gentle offsets; never name/class/stats. Creator and Stylist share the controls, reset and normalization. Persist faceAdjust per character, zero defaults for existing saves, same 25g total Stylist fee.


## [Codex | 2026-09-29] Controller invert default
User reports the controller right-stick invert toggle does not actually invert the camera and requests invert be enabled by default. Use an explicit sign branch for the right-stick Y camera delta; migrate missing settings to `invert: true` while preserving an existing false choice. Keep the setting persistent and visible in Controller setup.


## [Codex | 2026-09-29] Independent controller camera inversion
User requests separate controller setup toggles for right-stick horizontal and vertical camera inversion. Preserve legacy Y inversion choices, default new/missing settings to Y inverted and X non-inverted, and persist both axes independently.


## [Codex | 2026-09-29] Pyromancer crash and human emotes
User reports every Pyromancer attack/skill crashes, possibly following cheat unlock. Browser reproduction identifies missing flame motif in combat-art.js. Fix the actual renderer and test basic/charged/all eight skills with cheat unlock and normal unlock state. User approves hiding weapons during emotes and requires restoration on finish/cancel; preserve the good bow motion, rework wave/point/cheer/dance with anatomical limb targets, verify local and peer rigs.


## [Codex | 2026-10-03] Class audit execution
Approved: audit all class skills/passives for working effects, clear descriptions, healing/lifesteal and PvP. Grounded fixes: prevent rejected/refunded casts from triggering bonuses; scale Mage echoes relative to their original cast; remove duplicate PvP mark/curse countdowns. Preserve choice IDs. Run existing healing/choice regressions and all-class browser runtime smoke coverage; report untested conditional/network cases honestly.


## [Codex | 2026-10-03] Projectile visual overhaul approved
User requests distinct, attractive Mage skill projectiles; replacement of candy-like staff shots; improved projectiles across classes and relevant skills; thrown charge weapons must visibly match the equipped weapon. Grounded plan: replace striped orb shader with directional faceted spell bodies/trails and class skill signatures; propagate cosmetic identifiers through skill dispatch and co-op packets; render real equipped weapon assets for dagger/javelin/axe/scythe throws using existing weapon loader/palette. Preserve hitboxes, damage, speed, cooldowns and SFX. Browser-check appearance, throws, co-op packet round-trip, low quality and previous saves.


## [Codex | 2026-10-03] Endless roguelite and enclosed cameras
Approved direction: preserve Abyssal Descent as campaign grinding. Build roguelite on Endless Dungeons, separate progression; retain all earned gold across death and spend between attempts. Buy classes directly or qualify through dungeon achievements/quests before purchase. User wants enclosed ceilings, no seeing over walls into adjacent rooms, richer procedural topology/verticality, required parkour, varied waves/encounters/minibosses/bosses, and co-op. Current request includes fixing first-person legacy hand/world rendering and making shoulder/overhead cameras handle enclosed spaces.
Grounded audit: loadEndlessArena currently builds one 940-unit square; this needs a new connected room generator, not decoration alone. Immediate camera fix: queue the actual 3D hero/world in FPS, suppress legacy viewmodel when ready, temporarily hide local head in FPS; ray-sweep third-person camera against solid architecture and explicit future ceiling volumes. Preserve platform opacity and restore head for other views/peers. Document the larger generator and co-op plan separately; do not claim roguelite implemented.


## [Codex | 2026-10-03] Approved: health attrition defines dungeon runs
User approves the dungeon plan and makes HP management central over a long run. Early equipment offers limited protection; mistakes take meaningful chunks of health and healing opportunities are scarce. Better armor improves how many hits can be survived, while better weapons reduce exposure by killing enemies faster. A skilled fresh character must still be able to progress substantially through avoiding attacks, rather than encountering mandatory upgrade checks.
Implementation implications: carry health between floors; replace/rebalance the current automatic 20-percent floor heal rather than retaining it by accident. Healing frequency, damage amounts and upgrade strength remain playtest-tuned, not locked numeric values. Preserve readable attack warnings and escape windows; avoid unavoidable damage and spawn-on-player hits. Audit healing/lifesteal builds and co-op recovery so they do not trivially erase attrition, without silently removing class identities. These implications guide the proposed rework; no combat/economy changes implemented in this documentation update.


## [Codex | 2026-10-03] Approved direction: roguelite endpoint and harder progression
User requires an endpoint for the roguelite and suggests NG+ or graduation to a harder, different tier afterward. This applies only to the dungeon roguelite; campaign NG+ remains removed. Exact floor count, tier names/count, scaling and unlock details are not yet locked.
Proposed design for review: a finite expedition through multiple regions ending in a final boss and victory/results screen. Winning unlocks a selectable higher difficulty tier without removing access to the earlier tier. Retain earned gold, purchased classes/upgrades and achievement/quest progress; begin each attempt with its normal fresh run equipment/temporary-power reset. Higher tiers change encounter compositions, room variants, hazards and boss mechanics, alongside restrained numeric scaling. Preserve avoidable damage and viable fresh-build skill expression; do not make progression an unlimited enemy-HP treadmill. Victory should be at least as valid a banking endpoint as death or voluntary checkpoint exit. This is a plan only, not an implemented mode change.


## [Codex | 2026-10-03] Prison-break roguelite implementation authorized
Approved: first dungeon is a minimal-story prison escape through a large dungeon complex; multiple tiers of the same dungeon, later dungeons for further scaling; a new class qualification per tier through optional risky quests/discoveries, then gold purchase. Gold persists; upgrades bought between runs. Host can resume own checkpoint solo/co-op; guests retain their own solo checkpoint. Increased co-op enemy health (~1.6x for two as initial tuning), no automatic damage doubling.
Implementation correction: actual Endless Dungeon is G.delve/startDelve and already uses campaign escrow and branching rooms. G.endless/startEndless is Abyssal Descent and must remain unchanged. Earlier notes attributing the boxed arena to the target mode were wrong. Build new prison module and integrate only the Delve entry/runtime; use protected per-character mode profile and stable room reward receipts. Initial slice has three sections and three tiers, seeded enclosed room templates, optional discovery, required bridge crossing, encounters/warden exit, permanent shop and checkpoints. Exact class offers and numeric costs are initial tunable content, not story canon.


## [Codex | 2026-10-03] Prison Break first playable slice
Implemented initial Delve-only roguelite, campaign escrow, permanent wallet/shop, three tiers, optional class qualifications, enclosed room kit, checkpoints and co-op authority. Full implementation/validation limits and remaining room/encounter expansion recorded in ENDLESS_DUNGEON_REWORK.md and requirements/CONTINUITY.md.


## [Codex | 2026-10-03] Endless Dungeon save selection approved
User requests entrance interface with three save slots, a How it works button, and Back to hub; verify save logic. Implement three independent dungeon profiles per current campaign character/mode, migrate existing single profile to slot 1, independent wallet/upgrades/classes/checkpoint, explicit delete and replace-run confirmation. Co-op guests choose their local dungeon profile before joining; host checkpoint ownership remains unchanged. Verify migration, reload, slot isolation, delete/cancel, failed writes, campaign escrow and co-op selection.


## [Codex | 2026-10-03] Dungeon room expansion
Continue approved enclosed roguelite variety: branching optional elite chambers, turning routes, distinct encounter formations and traversable parkour. Preserve existing checkpoints with an explicit layout revision; verify campaign/save isolation and co-op synchronization. No SFX changes.


## [Codex | 2026-10-03] Original dungeon combat roster approved
User grants total creative freedom for new dungeon bosses unrelated to the main story and explicitly wants original enemies made from scratch. Wants a Dark Souls feeling, informed by successful enemy/fight design research; campaign combat remains a broader dissatisfaction. Implement dungeon-first original silhouettes, readable committed attacks, dodge/positioning responses, recovery openings and limited simultaneous aggression; do not silently replace campaign lore bosses. No new SFX work.
Grounded pass: three ordinary enemies (Pike Watcher, Chain Hound, Cinder Vessel) and three section bosses (Bell Keeper, Iron Maw, Unbound), original procedural models and pose animation, authoritative co-op tells with missed-warning protection. Keep existing geometry/save revisions and campaign escrow intact.
Research: PlayStation Demon’s Souls beginner guide (2020-11-12) emphasizes learning enemy patterns; Santa Monica Your Greatest Challenges: Valkyries emphasizes fair response tests. Adapt principles, no copied characters/assets.


## [Codex | 2026-10-04] Distinct Prison Break boss arenas
Continue approved original dungeon combat: Bell Keeper shelter pillars, Iron Maw open charge lanes with low rubble, and Unbound stepped chamber. New geometry revision 3; existing checkpoints retain revisions 1/2. Preserve campaign, scarce healing, co-op and save isolation.


## [Codex | 2026-10-04] Approved inter-boss dungeon pass
User approved varied encounters, room layouts/traversal, optional risk rewards, fair scarce-healing pacing and full-run/save checks. Implement revision 4 room templates, original shield guard, authored mixed encounter positions, wave breathing room, optional elevated gold route. Preserve revisions 1-3 and campaign isolation; no SFX changes.


## [Codex | 2026-10-04] General usability/reliability pass approved
User approved all six proposed areas: journal/clue clarity, quest interaction feedback, class/equipment explanations, controller usability, campaign progression checks, accessibility settings. Audit existing implementations first; fix concrete gaps without changing combat balance or final art direction. Grounded changes: journal all-level scope/location labels, accurate next-task feedback, numeric equipment comparisons, controller slider/focus fixes, adjustable reading text, and campaign regression coverage.


## [Codex | 2026-10-04] Approved enemy reliability and feedback pass
User approved campaign pursuit/cover/recovery review, followed by enemy animation and hit feedback. Implement bounded local ground routing and cover-aware melee first; preserve authored boss movement, safe ledges, saves, and existing SFX. Improve readable attack timing and restrained hit reactions without a roster/art redesign. Verify actual browser combat and report remaining co-op/boss limitations honestly.


## [Codex | 2026-10-04] Approved distinct enemy choreography
User approved continuing from 2.103 into distinctive enemy attack animations. Grounded pass: differentiated sword/shield/caster/thrower/beast poses on existing rigs, explicit visual recovery, and eliminate false release animation after interrupted structured wind-ups. Preserve authored boss clips, weapon attachments, damage/balance, saves and SFX. Browser pose/phase checks and prior-save regression before shipping.


## [Codex | 2026-10-04] Dungeon playtest corrections
User requests stable close dungeon camera near walls; immediate equipment bagging (sell only when full); harder parkour and faster, more challenging enemies; larger, more varied and longer floors; fewer chests with explicit rarity and conservative common rewards; substantial dungeon visual upgrade. Preserve existing saved runs and campaign grinding mode. Camera/pickup correctness first, then versioned layout and presentation improvements; human difficulty/art acceptance remains playtest-dependent.


## [Codex | 2026-10-04] Side quests remain accessible after core dialogue
User: "if there are side quests that are available with an NPC, if I click on their main dialogue, I shouldn’t then be blocked out from the side quest. I should still be able to ask them about that even if I’ve gone through the core dialogue with them." Plan: mark audited quest-giver topic menus; add validated return-to-topics navigation from later lines and saved cursors. Keep authored conditions, refusal consequences, unique rewards, co-op speaker ownership and Leave conversation. Prior campaign/escort feedback is also retained as pending design work: protect a human/animal with its own damageable health bar; purposeful campaign layouts and less tedious, more varied quests. Ellis escort remains a proposal, not implemented.


## [Codex | 2026-10-04]
Forge: prevent single and batch merges above the active character equipment rarity requirement. Show a compact color-coded rarity/character-level guide, including locked tiers. Use the same requirements as equipping gear.


## [Codex | 2026-10-04]
User: Warrior warhammer blocks the face. Give hammers a lower forward ready carry, keeping palm grip and two-handed support through movement/attacks.


## [Codex | 2026-10-04]
Apply all five weapon glow cosmetics to current 3D weapons, previews and co-op; preserve weapon detail and restore materials when removed.


## [Codex | 2026-10-04]
Continue approved dungeon pass: give existing room templates functional visual identity (dining furniture, kennel partitions, waterworks, distinct boss landmarks), preserving routes and saved layouts. Correct guest chest rewards to share host rarity/count policy. Further large topology/enemy art and campaign escort work remain pending.


## [Codex | 2026-10-04]
Continue dungeon layout pass: versioned new-run route variants, an additional required raised crossing, and distinct encounter formations. Preserve revision 1-5 checkpoints exactly; keep current chest frequency and co-op encounter scaling. Validate reachability with actual jump physics.


## [Codex | 2026-10-04] Ruined Keep isolated beta design packet
User approved map-first design packet before new construction. Created docs/design/ruined-keep-beta/design-packet.html plus overhead.svg and elevation.svg. Inspected current keep/prison story and confirmed Walter directs player to competing eastern stairs. Packet proposes a separated lift/service route, counterweight bridge puzzle, short damageable-captive escort, purposeful asset placement and gated playtesting. These specific designs remain proposals for review, not new canon or implemented gameplay. No playable level/save changes. HTML desktop/mobile overflow checks passed; overhead map visually reviewed.


## [Codex | 2026-10-04]
User requests title-screen Dev button to access design documents on phone. Add a save-independent preview menu linking published Ruined Keep packet and maps.


## [Codex | 2026-10-04] Playable isolated Ruined Keep beta approved
User approves generating the map-first design as a playable level reachable from Dev Previews, with selectable character level, class and related test loadout. Implement a disposable solo test session, explicit reset/exit, lift/counterweight traversal and prisoner rescue. Do not replace campaign geometry or persist beta rewards into campaign saves. This is a playtest slice, not a finished campaign replacement.


## [Codex | 2026-10-05] Campaign audit and next map-first packet
User authorizes a long, usage-conscious session auditing current campaign environmental contradictions, repeated quests/puzzles and reward placement; draft the next level overhead plan. Keep current campaign levels and Ruined Keep beta unchanged pending human playtest. Produce source-grounded findings, distinguish confirmed code facts from design risks and proposals, and make the audit/next plan reachable from Dev Previews.


## [Codex | 2026-10-05] Puzzle variety means different player actions
User correction: differently named/story-framed puzzles still feel identical when they reduce to guessing three buttons in order. Current visual feedback does not distinguish them enough. Audit must classify the actual player interaction, information available before acting, visible physical result and reasoning required; do not count code/state differences as experiential variety. Prioritize spatial, traversal, observation and physical manipulation over reskinned sequence guessing. Revise Frostfell proposal accordingly; not approval to replace campaign before beta feedback.


## [Codex | 2026-10-05] Evidence standard for experiential design
User identifies recurring failure: code/story descriptions made Codex treat substantially identical, unfun player interactions as differentiated. Adopt a player-action audit with story nouns removed, explicit similarity classification, normal-camera interaction recordings and human playtest gates. Separate implemented/code-inspected, visually verified and human-playtested; do not claim clarity, variety or fun from code alone. Treat user's observed sameness and weak visual feedback as primary experiential evidence. Prototype one interaction before multiplying it across levels.


## [Codex | 2026-10-05] Briar Town / Outskirts complete isolated remake
User authorizes an in-depth plan then execution of a from-scratch Outskirts/Briar Town beta, generally preserving the core storyline and improving quests, side quests, parkour, layouts, combat, feedback and environmental logic. Cover Homefields and Black Woods. Keep main portal and existing campaign unchanged until user likes beta. Latest approval supersedes waiting for Keep feedback for this isolated prototype only. Use player-action/normal-camera evidence standards; no claims of proven fun from code. Selectable class/level/rank retained; isolated solo test storage, reset/retry/exit. Research successful design principles, document failure modes and validate actual controls/physics.


## [Codex | 2026-10-05] Live menus, local conversations, inspection and social hub
User authorizes implementation: menus continue time/combat (solo and co-op), no forced menu/inspection exit on damage; subtle red warning without mandatory HP HUD. Conversation camera is local; another player explicitly interacting with same NPC joins current line read-only, initiator retains choices; shared quest updates/rewards remain authoritative and idempotent. Keep menu/talking players visibly present with status. Host-owned Quartermaster chess purchase; board/chairs in hub, full legal chess, session-only position retained when leaving table, visible world pieces reflect position, seated characters. Larger smoothly rotating minimap with objective and teammate direction plus shared pings. Shared progress notices and visible consequences. Torn transport map and visual clue inspection prototypes approved; do not replace existing campaign designs awaiting playtest. No claim these changes need zero validation: automated and browser verification required, subjective testing remains later.


## [Codex | 2026-10-05] Chess camera, hands and optional clocks
User requests clear board view while seeing opponent physically reach, grasp and move the chosen piece, then tap their own side of a working analog chess clock with the same arm. Provide adjustable starting time and increment and retain untimed games. Preserve host ownership, session board, legal move validation and co-op synchronization. Plan: dedicated oblique board camera with projected square hit targets and compact side controls; smaller reachable tabletop; shared host-authored move choreography for hands/pieces (including capture, castling and promotion); dual analog dial clock with exact digital remaining time, host-monotonic countdown, both-player ready confirmation, optional untimed default. Animation time is excluded from thinking time; increment and clock handover occur once per accepted completed move. Clock settings lock during active games. Verify clocks with injected time, two-page transport, real browser projected clicks and visual grasp/tap poses; no claims of all-model quality without evidence.


## [Codex | 2026-10-05] Chess enhancement delivery
Implemented in 2.117.0-chess-clock. See docs/design/social-play-qa.md for verification and remaining human playtest limits.


## [Codex | 2026-10-06] Class functionality and choice audit
User approves auditing all class skills/passives against actual behavior, especially healing/life steal and PvP, simplifying unclear descriptions and correcting clearly inferior choices. Preserve existing choices/save identifiers and prior fixes; verify behavior rather than count source references. Grounded pass: inventory all 17 classes (136 skills, 136 passives); rerun runtime/quantitative baselines; probe confirmed missing weapon life steal in PvP melee, co-op healing before host confirmation, Harvest guest healing and dead/downed healing paths; make targeted fixes with regression evidence. Document limitations and avoid claiming every conditional build combination is proven balanced. Campaign/Briar layout playtests remain pending.


## [Codex | 2026-10-06] Design preview button contrast
User reports unreadable text matching button backgrounds in Dev Design Previews. Prioritize immediately: ordinary link accent styling must exclude button links so primary actions retain dark text and secondary actions retain light text. Verify actual menu states before returning to the class audit.


## [Codex | 2026-10-06] Briar beta human playtest feedback and scale direction
Actual user playtest: mill puzzle was enjoyable and satisfying; moving a heavy box onto a pressure plate, reasoning from visible machinery, and seeing the environment respond worked. This validates this specific interaction, not all beta puzzles. Beta is far too small relative to desired main-level scale; rift shards too easy. Keep and expand parkour with varied rhythms, concentrated traversal sections and challenging optional shard routes. User prefers existing campaign enemies over new beta enemies; improve existing enemies rather than replace the roster.
Desired quest variety: longer vulnerable escort routes (people/dogs/prisoners), visible escort health bars, enemy targeting and attacks, recurring ambush pressure, death fails the quest with retry; hold-area/breach encounters requiring presence and survival under waves (30-60 seconds suggested, not locked); localized respawning creature hunts with roughly 10/15/20 kills as examples; traditional fetch tasks; visually understandable environmental puzzles; difficult traversal to a requested relic; optional NPCs becoming strong hostile class-based opponents (ninja/pirate/mage examples), with actual combat rather than merely renamed interactions. Do not assume all NPC fights are nonlethal: user explicitly mentioned killing. Specific characters and canon consequences remain to be designed.
World: retain the sense of scale of current main campaign levels while filling empty traversal meaningfully. Rolling terrain and hills should shape sightlines and fights, not merely platforms on a flat plane. Props must look appropriate, have intentional placement and correct collisions. Environmentally justified spawns/ambushes; alternate pressure and recovery without enemy spam or long cleared dash-only stretches. Preserve mill clarity: uncomplicated observable logic, visible environmental consequences and working presentation.
User asks whether to adjust existing maps or remake at their scale; this is a strategy discussion, not approval to replace main campaign maps. Codex recommendation: rebuild beta terrain/connectivity to campaign scale in connected districts, retaining validated mill interactions, existing story/assets/enemies and reusable systems; preserve live campaign until replacement is tested. Do not stretch the compact beta or replicate the mill puzzle under other names. Pending co-op class audit remains outstanding.


## [Codex | 2026-10-06] Chess presentation correction and solo Warden
User reports whole-character/head lean over board is unnatural. Replace with slight forward lean and reaching arm; preserve hidden weapons and clock tap. Camera must look from the seated player's side with their pieces at bottom toward opponent. Make all six pieces visually recognizable with more detailed geometry. Solo (not a co-op room): ghost of the Warden takes opposite seat with Easy/Medium/Hard bots, target strengths approximately 500/1200/1800-2000 Elo; these are desired targets, not measured ratings.
Plan: correct camera along board rank axis, constrain body movement and verify reachable board/clock contacts; improve piece silhouettes; integrate pinned single-thread Stockfish worker with legal-move validation, stale-reply cancellation, bounded thinking, selectable difficulty, and ghost actor using shared sitting/reach. Keep bot out of co-op, retain session state, legal chess rules and clocks; verify both player viewpoints, worker failure/retry, solo moves and co-op regressions. No save schema changes.


## [Codex | 2026-10-06] Solo chess opponent correction
User supersedes ghost of Warden with Thomas, already in the hub. Seat the existing Thomas model at the table only during solo chess; restore him to his normal location on leaving. Keep three difficulty targets; no ghost or new character canon.


## [Codex | 2026-10-06] Approved full-scale Briar beta rebuild
User approves the five-step map/terrain/activity/verification/art sequence now, preserving the live campaign. Match the existing campaign's approximate traversal scale; retain the human-approved physical mill puzzle. Reuse good existing trees and other campaign assets after visual inspection; do not substitute simpler low-detail assets merely because they are newly generated. New terrain must support real traversal and intentionally placed districts, not a stretched flat prototype. This approval supersedes waiting for approval to expand the beta, but does not authorize replacing the main portal.


## [Codex | 2026-10-06] Keep earned campaign progression on early exit or death
Latest user decision: preserve earned character XP/levels, class XP/ranks/selected skills, gold, and completed hub-NPC quest work when leaving a campaign level early or dying. No quit confirmation or gold penalty. A hub request completed in either half may be turned in immediately without defeating the boss. Supersedes prior unfinished-half XP/gold rollback. Do not change separate Prison Break run progression, temporary class-trial escrow, arena state or explicit permadeath contracts. Gear and rift-shard rollback were not explicitly changed in this request.


## [Codex | 2026-10-06] Waystation purchased upgrade presentation
User requests remaking purchasable Waystation upgrades (braziers, banners and all others) for the current hub: each must be a clear cosmetic improvement, visually obvious after purchase, attractive and non-obstructive. Move the lamppost intersecting a chess chair. Grounded finding: braziers currently spawn lamp models at x=270,z=395, almost inside west chess seat x=279,z=390. Plan: shared fixture coordinates; replace lamps with detailed fire bowls at safe courtyard positions, larger heraldic wall banners, full northern parapet/caps, richer golden Waystone fittings. Keep prices/ownership IDs/save behavior and chess rules. Verify before/after in real browser, purchasing/reload, route clearance and chess seating.

## [Codex | 2026-10-06] Chest rarity, models, and reward reveal
User approves the attached chest brief as implementation input, plus progressively larger/more detailed rarity-colored chest assets, hinged opening animation, exactly one equipment item per chest, and an upper-screen scrolling case-style reveal skippable with E. Source preserved in CHEST_RARITY_SOURCE_2026-10-06.txt. Treat supplied numerical tables as the initial implementation values, subject to playtesting, not proven balance. Common 92/8; middle tiers 2/90/8; Legendary guaranteed; designated challenge rewards 92/8 minimum. Descent: one reward chest after each combat floor, depth bands 1-5,6-10,11-20,21-30,31+ with the source weights. Campaign: preserve authored locations, fixed region/effort-appropriate grades; optional random discovery guideline is not a mandatory per-chest 80/20 roll. No random progression pieces or class signature equipment. Preserve personal co-op loot, claim once, and retain generated outcomes across reconnect/reload.
Grounded plan: replace openChest's existing 1/2 drop loop and inconsistent odds; replace the shared wooden prop with five code-built chest variants; keep mimic tells and the no-reward practice sprint exception. Replace Descent's pre-combat third/sixth-floor caches with one clear reward. Persist chest records per save/run/area before opening, award equipment to bag (overflow sale) once before the cosmetic reel, and store secured chest rewards in the campaign checkpoint. Preserve Prison Break's distinct run/checkpoint rules. Verify exact probability intervals, saved reward identity, duplicate opens, full bag, save isolation, co-op personal claims, all models/lids, mobile/desktop reel, skip and reduced motion in a real browser. Campaign optional placement expansion remains part of level redesign rather than scattering new chests blindly.

## [Codex | 2026-10-07] Chess usability and second Briar beta pass

Chess: drag the camera with the mouse to choose an angle; fade a player model when it obstructs the board; move pieces by drag/drop or click; optional flat-board view and optional clock on the right panel; natural reaching-arm piece move and clock tap without head overreach; mark check and animate checkmate; provide separate move, capture, check, mate and illegal-move sounds; choose player color before the game; a1 is dark. Thomas remains the solo opponent from the most recent correction.

Briar: continue the approved large isolated beta second pass after interrupted work. Use existing detailed trees and recognizable campaign enemies; keep the approved mill. Provide more meaningful farm/orchard and north-woods activities including optional traversal, a defended wagon that enemies truly attack, and a class-based opponent. Treat this as a beta candidate needing human evaluation, not approval to replace the main campaign portal. The user's PC restart did not cancel these instructions.

## [Codex | 2026-10-07] Enemy roster visual upgrade active

Latest user authorization: begin the existing enemy-roster upgrade plan now. Scope is visual-model quality across bosses, elites, common enemies and summons, with distinct silhouettes and performance-conscious Blender assets. This is an active multi-asset effort; only Forge Colossus and the first Marble Colossus production pass are integrated as of v2.126.0. Existing combat, story, rewards, collision and saves remain authoritative. See docs/design/ENEMY_MODEL_UPGRADE_2026-10-06.md and docs/requirements/DECISION_LOG.md.

## [Codex | 2026-10-07] Complete visual roster authorization

Oliver explicitly asks to fulfill the graphical improvement for **all** enemies and to work through the whole roster. Include every production enemy appearance, the Frost officers, and the separate Hydra, retaining existing mechanics, collision, rewards, and save IDs. Use docs/design/ENEMY_ROSTER_RELEASE_2026-10-07.md as the grounded implementation and release plan; report visual QA and any remaining limits honestly.
## [Codex | 2026-10-07] Finish Briar beta to a publication-standard review candidate

Oliver asked to finish the full-scale Briar Town beta thoroughly, as if preparing it for publication. Preserve the approved mill, current campaign story, larger terrain, varied quest types, existing stronger tree/enemy assets, five shard routes and separate Dev preview. Resolve visible terrain seams, empty stretches, impractical encounter placement, misleading wayfinding and stale preview maps; verify gameplay, saves and visuals in a real browser. The prior explicit direction to keep the main campaign portal intact pending Oliver's beta review still applies. Automated checks support a review candidate, not proof of fun, broad class balance or final visual approval.

## [Codex | 2026-10-07] High-effort Briar beta completion pass

Oliver now asks for a fully built, very high-quality Briar Town level. Continue improving the isolated full-scale Homefields and Black Woods beta, keeping the approved mill and campaign portal unchanged until his playtest. Close experiential gaps with distinct, readable environmental cause/effect, purposeful art and collision, stronger boss-arena identity, clear guidance and actual browser-controlled verification. Do not multiply quests that only rename the same button sequence. The recent complete enemy-model upgrades are available to the beta; prefer them to simpler replacement models. Report the implementation and human-review boundary honestly.
## [Codex | 2026-10-07] Sparring Room full improvement

Oliver requests a comprehensive improvement to every part of the Sparring Room. Preserve its role as a stakes-free place to practice with unlocked campaign foes and study their tells. Grounded audit found a rear decorative door between the default shoulder camera and player, a phantom Waystone prompt in the ring, a long unfiltered roster, flat box-like art, no bout feedback, practice foes bolted against knockback, and hub sanctuary damage immunity preventing real defensive practice. Rebuild the room as a legible detailed training hall; improve foe selection, controlled bout setup/reset and useful live feedback; allow authentic damage and movement with an immediate no-penalty reset on defeat. Keep campaign save, XP, gold and loot unchanged. Verify desktop and narrow browser views, combat, defeat, and a prior save before shipping.

## [Codex | 2026-10-07] Abyssal Descent floor rebuild

Oliver requests a comprehensive improvement of the Abyssal Descent levels. Keep this as the campaign gold/XP/equipment grind, separate from the Endless Dungeon roguelite. Grounded finding: current floors repeat the same boxed arena and random trickle spawns despite themed colors and scaling. Approved scope is to rebuild floor layouts, tactical cover, paced enemy waves, varied existing bestiary pressure, visual identity and route feedback while preserving the established chest reward, pact, death retention, co-op host authority and difficulty curve. See docs/design/ABYSSAL_DESCENT_REBUILD_2026-10-07.md. Verify representative floors and prior saves in a browser; do not claim human fun/balance proof from automation.

## [Codex | 2026-10-07] Treasure Sprint quality rebuild

User requests that the Treasure Sprint levels be much better in every way. Rebuild the shared hub time-trial and campaign bonus course for readable, varied, physically reachable parkour; improve visual identity, timer/objective guidance, recovery and result flow. Preserve the hub's no-loot/no-gold contract, campaign bonus reward chest, co-op deterministic seed and old saves. Detailed grounded plan: docs/design/TREASURE_SPRINT_REBUILD_2026-10-07.md.

## [Codex | 2026-10-07] Endless Dungeon quality pass

Oliver requests the Endless Dungeon mode be substantially improved throughout. This is Prison Break (`G.escape` / `BFPrisonDungeon`), not Abyssal Descent. Preserve its three independent saves, permanent gold/upgrades/class unlocks, scarce healing, versioned checkpoint layouts, co-op ownership and one-time rewards. Grounded gaps: ten-room floors still repeat the same fixed encounter sequence and mostly rectangular rooms, the in-run HUD gives little route/health context, and room art does not sufficiently reveal each space's purpose. Improve architectural and tactical room identity, route/optional reward readability, encounter pacing and run feedback without introducing SFX work. New runs may use a new layout revision; older checkpoints must retain their exact layouts. Automated/browser checks support stability, not proof of human enjoyment or final balance.

## [Codex | 2026-10-07] Endless Dungeon quality pass shipped

Version 2.133.0 introduces revision-7 floors for fresh Prison Break attempts: six new role-specific main rooms across the three sections, additional seeded guard-room variants, distinct cover and enemy packs, a Tier-2+ Watch Captain, stronger art/route cues and a clearer preparation/run HUD. It preserves old checkpoint plans, three save slots, permanent economy, sparse chest rewards, scarce healing and co-op packet ownership. Pure tests: 1,080 new plans, 6,480 historical-plan hash checks and 43,200 safe spawn points. Browser tests: 60 physical jumps, complete three-section clear and tier unlock, gold/health/chest persistence, prior-build save resume, co-op scaling/reward/checkpoint isolation and desktop/phone/camera/art inspection. Human run pacing, encounter feel and final visual preference remain open. See docs/design/ENDLESS_DUNGEON_QUALITY_2026-10-07.md.

## [Codex | 2026-10-07] Endless Dungeon optional parkour extension

Version 2.134.0 adds an optional five-jump side route to each section of new revision-8 Prison Break runs. Reaching its cache gives one persistent gold reward; Tier 2+ also gives a class qualification seal. Preserve revisions 1-7 for existing checkpoints, maintain the main-route progression and two-chest-per-section economy, and keep rewards host-authoritative in co-op. The route is grounded in a separate physical gap and visible stepping stones, not a three-button combination. Automated/browser reachability and save/co-op checks passed; human difficulty and art judgment remain open.

## [Codex | 2026-10-07] Endless Dungeon cache-room art

Version 2.135.0 improves the optional room's visible supports and step materials without changing collision, rewards or old checkpoint layouts. Narrow pier and edge details keep the floor gap readable. Browser jumps and art budget passed; human art evaluation remains open.

## [Codex | 2026-10-07] Full Sparring Room bestiary

Oliver requests a full bestiary beside the Sparring Room, with a real enemy-face screenshot on each portrait card, where to encounter each foe, and their stats. Extend the existing small training entry into a separate searchable catalog accessible at the Waystation entrance and inside the hall. Ground locations and baseline numbers in the current campaign/Prison Break registries, label scaled combat values honestly, and use crops from actual in-game model renders rather than invented face art. Include bosses, special encounters and the distinct Prison Break roster. Preserve old saves and retain the sparring bout selector as its own quick flow.

## [Codex | 2026-10-07] Waystation quality pass
Oliver requests improving the current hub world broadly. Preserve services, campaigns, Rift Hall, chess, purchased upgrades, progression and authored interactions. Grounded visual audit: oversized uniform floor, weak district cues, crude garden tree clumps, dark sanctuary sky and unframed challenge edge. Implement an authored paving/architecture/planting/navigation/lighting pass using existing detailed assets, with collider and browser QA. Plan: docs/design/WAYSTATION_QUALITY_2026-10-07.md.

## [Codex | 2026-10-07] Endless Dungeon expansion and color direction

Oliver requests a much larger, better Endless Dungeon roguelite, with enemies from the main campaign added to its encounters. This applies to Prison Break (G.escape), while Abyssal Descent remains the campaign grind. Keep original Prison Break foes and bosses where useful, and mix in distinct campaign enemies with their actual combat behavior. Fresh attempts may use a new layout revision; existing checkpoint geometry, independent saves, permanent gold/upgrades, sparse healing and co-op ownership must remain compatible. The brighter, colorful new hub is Oliver's preferred visual direction for future level design, inspired by AQW. Use clear, varied palettes rather than making every area uniformly dark; this does not request a retroactive recolor of every existing level.

## [Codex | 2026-10-07] Further Endless Dungeon improvement

Oliver asks to improve the expanded Prison Break mode further. Prioritize mechanical variety and visible cause/effect, not renamed versions of clearing enemy packs. Preserve the three-section roguelite contract, old save layouts, co-op authority, sparse healing and the colorful, readable environment direction. This pass adds destructible reinforcement wards and a hold-the-circle encounter to the new wing on fresh revision-10 runs. See docs/design/ENDLESS_DUNGEON_OBJECTIVES_2026-10-07.md.

## [Codex | 2026-10-07] Normal-speed Prison Break pacing

Oliver approved a normal-speed playthrough and fixes before further expansion (source U-2026-10-07-PRISON-PACING). Browser evidence showed a player could pass the first required guard room as its enemies spawned, leaving the objective pointing backward. For fresh attempts, start encounters at the room approach and visibly block the outgoing route until that required room clears. Preserve historical checkpoint layouts and host-authoritative co-op state. See docs/design/ENDLESS_DUNGEON_PACING_2026-10-07.md. **Verified for implementation:** revision-11 deterministic layout test (1,080 plans, 6,480 gates, 10,800 older layouts unchanged), normal-speed browser gate collision/open/resume, three-section clear, revision-10 browser resume, guest state changes and desktop/phone rendering. Human fun/balance review remains open.

## [Codex | 2026-10-08] Complete enemy appearance and animation upgrade

Oliver asks for every enemy skin and every enemy animation to be redone/improved, with accurate, more lifelike movement and a sustained work session. The v2.128 41-appearance pass exists but is only a first visual pass; seven Prison Break types still use block-style rendering, many attacks share generic motion, and idle/move/death are basic. Scope: the full active cast, bosses and special enemies, preserving mechanics, identifiers, saves and co-op. See source U-2026-10-08-ENEMY-ART and docs/design/ENEMY_ART_MOTION_PASS_2026-10-08.md. **Status: in progress; no completion claim until roster-wide art and motion checks pass.**

## [Codex | 2026-10-08] Enemy art and motion verification

Implemented in version 2.141.0. All 48 standard/Frost/Prison Break appearances are rebuilt as new GLBs with unique palettes, the two dedicated Colossi retain their bespoke art with differentiated attack motion, and the Hydra's head and jaw motion is smoothed. All 50 skinned appearances passed browser load, finite-transform and clip-change checks; the seven Prison Break enemies now render through the model layer and follow their live combat state. A prior-version save loaded unchanged. The user should judge visual taste and motion feel in play; the current art remains stylized rather than fully realistic. See the design pass and contact sheet for the exact scope and evidence.

## [Codex | 2026-10-08] Further enemy art and animation refinement

Oliver asks to spend more time making the newly upgraded enemy roster better (source U-2026-10-08-ENEMY-ART-FOLLOWUP). Improve the whole cast's readable silhouettes, material response, gait and attack follow-through within the current browser budget; preserve the 2.141 files as rollback, gameplay timing, identifiers, saves and co-op. Version 2.142 adds role-shaped beast heads and armored contours, material values compatible with the actual game lighting, planted idle feet and body weight travel, and move-specific boss recoveries. All 48 versioned appearances and 50 skinned animation sets passed automated/browser checks; art and combat feel still require Oliver's playtest. See docs/design/ENEMY_ART_MOTION_SECOND_PASS_2026-10-08.md.

## [Codex | 2026-10-08] Improve the existing campaign levels

Oliver approves a substantial campaign playability/reliability pass and now prefers adjusting the existing full-scale levels over replacing them. Prioritize observed player-action repetition, nonsensical geography, empty travel and progression failures. Use the separate Briar/Keep betas as tested design references, retaining approved interactions, story and strong existing assets. First grounded fixes and their verification contract are in docs/design/CAMPAIGN_EXISTING_LEVEL_PASS_2026-10-08.md. This authorizes live-map changes but does not turn automated evidence into a claim of fun or justify a one-shot replacement of every level.

The same existing-level pass extends to Snowbound Peaks' compulsory heater-part return: keep the optional western lift-house loop, put the needed coil at the forward crossing winch, and allow player installation with an immediate visible result. Preserve previous-save flags and Heath's optional guidance/repair route. See the updated campaign pass packet.

Iron Halls' insulated handles should likewise work as an object found on the west-stores route and installed at the service cart ahead; Jack's conversation remains available and can repair it too. This preserves the worker safety and machine shutdown story while removing the forced meet-fetch-return pattern. See the same campaign pass packet.

The Shipwreck Shore supplies should visibly complete Otto's boat without requiring another conversation for each part or a separate verbal approval once all three are fitted. The player may fit carried parts at Otto's workbench, while Otto's existing help remains usable for older saves and players who prefer speaking to him. Keep the three distinct retrieval routes, the sea crossing, co-op authority, and existing quest item/flag IDs.

## [Codex | 2026-10-08] Spatial waterworks puzzle in the existing Frostfell cave

Oliver's recurring complaint is that differently named three-button puzzles still feel like the same input game. The existing Deep Ice Caves main crossing now uses its full basin: pump water to raise a float, jump aboard, freeze from that platform, cross the temporary sheet, and drain at the far bank. A near-bank sluice recovers from overfilling or old partial states frozen at the wrong height. Keep the original puzzle flags, optional lower pipe puzzle, Hugo rescue, Ellis quest, and co-op sharing. Browser traversal proves the route is mechanically usable, not that it is enjoyable; Oliver's playtest remains decisive. See docs/design/CAMPAIGN_EXISTING_LEVEL_PASS_2026-10-08.md.

## [Codex | 2026-10-08] Ruined Keep prisoners need a real protection objective

The existing Broken Walls hold-the-breach task should make the escaping group vulnerable, fulfilling Oliver's request for an escort with health and attackers that target the people being rescued. Each of the three prisoners has a visible health bar. Some waves chase them, while the caster still pressures the player. A fallen prisoner causes a short retreat and retry without discarding the larger quest. Both co-op players see the same health and enemy focus; the host remains authoritative. The existing thirty-second hold, final enemy clear, optional chamber, and save flags remain. See docs/design/CAMPAIGN_EXISTING_LEVEL_PASS_2026-10-08.md.

## [Codex | 2026-10-09] Replace Lost Canyon's optional order lock with traversal

The live Lost Canyon's HP-04 side reward currently asks for north, west, south and east handles in a fixed sequence. This is the very input family Oliver identified as repetitive despite different story dressing. Preserve the existing freight store, shard ID, open flag, main rescue, co-op sharing and previous saves, but let players climb the freight scaffold to release a physical cart brake. The cart should visibly roll aside and expose the same reward. Include a readable failed-jump recovery and check the route by normal movement in a real browser. Do not count the new labels or a scripted completion as proof of satisfying parkour; Oliver's playtest decides that.

## [Codex | 2026-10-09] Live campaign quality continuation

Oliver requests further all-around improvement to Bladefall. Continue the already-approved existing-map passes, prioritizing player-visible action variety, purposeful paths and reliable feedback over adding superficially different content. The immediate grounded target is Thunder Cliffs' optional inland shard: replace the adjacent three-stone order with an observable tidal crossing and a far-side release, preserving its reward, main hydra route, co-op authority, saved `tc.tide.open` flag and older saves. Keep normal-camera verification and human-playtest limits explicit. See docs/design/THUNDER_CLIFFS_TIDE_PASS_2026-10-09.md. SFX creation remains on hold by Oliver's request.

## [Codex | 2026-10-09] Campaign hunt discovery readability

During normal-camera verification, the automatic combat-camp journal notice obscured the route for many seconds. The user's standing preference is concise guidance and minimal reading fatigue while playing. Preserve the optional kill quests, respawns, tracker, journal access and rewards; announce first camp discovery with a short toast rather than a large timed reading panel. See docs/design/CAMPAIGN_HUNT_NOTICE_2026-10-09.md. This does not change the user's hold on custom SFX.

## [Codex | 2026-10-10] Co-op attack ownership follow-up

Oliver requests continued all-around Bladefall improvements; his earlier class/PvP/co-op audit requires player and skill effects to work when either friend hosts. The outstanding audit notes guest offensive class hooks and status damage authority. Preserve host-owned enemy HP/death and receipt-based guest healing while making guest basic identities and elemental/designated effects belong to the attacker rather than the host's class/weapon. Do not change PvP or skill balance as a side effect. See docs/design/COOP_ATTACK_OWNERSHIP_2026-10-10.md. Custom SFX creation remains on hold.

## [Codex | 2026-10-10] Snowbound optional camp action variety

Oliver requests further all-around improvement to Bladefall, with earlier explicit direction that campaign puzzles should differ in player actions, show physical cause and effect, and offer demanding optional Rift Shard parkour. The live Snowbound camp's 1-3-2 marker sequence is another short combination puzzle. Replace its live input with an uneven, recoverable ridge climb to a visible rig release and the same Winter Cloak/FF-02 reward. Keep prior story flags, save compatibility, main route and co-op sharing. Implementation/verification contract: docs/design/SNOWBOUND_CAMP_RIDGE_2026-10-10.md. Human difficulty and art acceptance remain open.

## [Codex | 2026-10-10] Great Furnace Cinder rescue action variety

Under Oliver's continuing authorization to improve existing campaign levels, replace the live Cinder cage's adjacent three-control order with a visible heat-feed shutdown, a short cage-guard fight, and a final safe release. Keep the companion, story completion and save identifiers, main progression and co-op authority. A previous completed rescue stays completed; partial old switch progress can restart at the new feed. See docs/design/GREAT_FURNACE_CINDER_RESCUE_2026-10-10.md. Custom SFX creation remains on hold.

## [Codex | 2026-10-10] Great Furnace cooling-box action variety

Under Oliver's continuing direction to remove repetitive combination puzzles and make optional Rift Shards worth exploring, replace the live cooling box's adjacent triangle-square-circle presses. The cooled waterworks should power a visible side gantry with moving counterweights. The player crosses it to open the cooling box and find the same ED-04 shard. The plate gives a short route clue but is not a mandatory quest pickup. Preserve `gf.cache.open`, the personal shard ID, main route, co-op and old saves; old partial button progress can restart at the gantry. Verify actual jumps, a miss/recovery, the opening visual, checkpoint and co-op in a muted browser. See docs/design/GREAT_FURNACE_COUNTERWEIGHT_2026-10-10.md. Custom SFX remain on hold.

## [Codex | 2026-10-10] Sky Library display action variety

Under Oliver's continuing request to improve Bladefall's existing full-scale campaign levels, the live Sky Library hidden display's sun-wing-sword presses should become a physical light-reflector interaction. Slide the reflector along a visible rail so its beam reaches the sword seal and the wall opens. Preserve the optional SP-04 shard, `sl.display.open`, main route, separate shelf and archive branches, co-op authority and older saves; old incomplete button progress may restart at the new fixture. Verify real movement, visible cause and effect, failure/recovery, co-op and checkpoint behavior in a muted browser. See docs/design/SKY_LIBRARY_REFLECTOR_2026-10-10.md. No custom SFX work.

## [Codex | 2026-10-10] Homefields warning-bell combat variety

Oliver continues to request concrete improvements to existing campaign play, especially less repeated three-button puzzles, more purposeful combat quests and environmental logic. The optional eastern Homefields tower currently has a sun-water-wheat press order. Replace it with a warning bell that draws a short, readable Legion response; defeat its captain to get the chest key. Preserve the existing chest reward, `home.bells.open`, main route, other optional paths, co-op and older saves. Old partial bell presses may restart at the new encounter. Test actual attack/pathing, wave progression, checkpoint and old save behavior, and normal-camera clarity. See docs/design/HOMEFIELDS_WARNING_BELL_2026-10-10.md. Custom SFX work remains on hold.
## [Codex | 2026-10-10] Black Woods animal-track route

Under Oliver's continuing direction to replace repetitive adjacent-button puzzles with readable environmental action and meaningful optional parkour, revise the live Black Woods BR-04 grove. Retire the bird-deer-wolf stone presses in favor of following the existing animal tracks to a split-tree root climb. Release the high binding to uncover the lower hollow and existing personal shard. Keep woods.tracks.open, BR-04, main signal path, Beth rescue, co-op sharing, checkpoint rules and old completed saves. Old partial stone input may restart at the physical route. Validate the actual climb, miss/retry, visible release, normal prompt, co-op and prior saves in a muted browser. See docs/design/BLACK_WOODS_TRACK_ROUTE_2026-10-10.md. No custom SFX work.

## [Codex | 2026-10-10] Shipwreck Shore optional chest action

Under Oliver's continuing direction to improve existing levels and retire repeated button-order puzzles, replace the Lantern Wreck number-entry chest with a fixed ballista on Rose's Wreck. Aim at the visible iron clasp, fire, recover from a miss and watch the binding break. Preserve the optional Stormshot reward, `sc.code.open`/`sc.code.note`, old completed saves, host-shared opening and the main boat/voyage. See docs/design/SHIPWRECK_BALLISTA_2026-10-10.md. No custom SFX work.

## [Codex | 2026-10-10] Co-op class-effect parity continuation

Oliver's continuing all-around quality request includes his standing requirement that class skills act on enemies in co-op as they do in solo play. Source inspection found guest-only stun/slow/taunt, Death's Door and Final Curse delayed effects, plus a guest-only Execution kill. Preserve host enemy authority, existing class tuning, solo/PvP behavior and saves. Plan and verification: docs/design/COOP_SKILL_EFFECTS_2026-10-10.md. This focused transport fix does not certify every class combination or real-network timing.

## [Codex | 2026-10-10] Winding Cliffs optional chest action variety

Continuing Oliver's approved live-campaign quality pass and later instruction to remove reskinned order-guessing puzzles, replace the Winding Cliffs optional three-number chest lock with a physically traversed cargo-hoist release. Preserve the existing chest reward and flags (`hp.code.open`, `hp.code.claimed`, `hp.cliffcache`), main freight bridge, Skip route, shard locations, co-op story sharing, and completed saves. Old partial code inputs can be ignored. Inspect the normal-camera player action, fall recovery, chest reveal and old-save behavior before claiming the work shipped. See docs/design/HOLLOW_CLIFFS_CARGO_RELEASE_2026-10-10.md.

## [Codex | 2026-10-10] Winding Cliffs bridge and lookout evidence

U-2026-10-10-CONTINUE-CLIFF is a continuation instruction, not a new design approval. GOV-02, LV-02, LV-11, MAP-02 and FX-02 remain PARTIAL. Version 2.161.0 gives the existing seven-weight freight bridge a visible 1.5-second lowering motion and lit plate marks. One ordinary lookout guard is replaced by a named, larger Cliff warden with a telegraphed cone cleave and recovery opening; the upper rope bypass remains. Bridge, lift, chest, shard and story IDs are unchanged. Solo browser traversal, set-piece state and visual checks, two-page co-op phase/bridge mirroring, checkpoint and old-save checks passed. Human playtesting is still needed for the encounter's difficulty, pacing and art quality.

## [Codex | 2026-10-10] Lost Canyon signal pressure — planned

The same continuation authority supports a scoped Lost Canyon improvement under GOV-02, LV-02, LV-04, LV-11 and MAP-02. The one-time alarm guards currently appear too far from the freed south cage to fight; the cable path is a continuous staircase. Plan: a recoverable, collision-backed scaffold climb; a visibly active signal with capped, recurring host-owned reinforcements near the rescue yard until the cable is cut; quiet entry if cut first. Preserve all existing story, shard and save flags. Acceptance includes physical jump/miss recovery, normal-camera visual review, real enemy combat, full route, old save and co-op guest checks. Status: PLANNED, not shipped or human-playtested. See docs/design/LOST_CANYON_SIGNAL_PRESSURE_2026-10-10.md.

## [Codex | 2026-10-10] Lost Canyon signal pressure — verified implementation

Version 2.162.0 implements the scoped signal-tower climb and rescue alarm without changing story or reward IDs. Real jump/miss/recovery, guard pursuit and player damage, capped repeat waves, cut/quiet paths, full level route, old partial/completed saves, checkpoint, and two-page co-op state passed muted browser QA; static and story checks passed. The earlier PLANNED note above records the pre-implementation state. GOV-02, LV-02, LV-04, LV-11 and MAP-02 remain PARTIAL for the broader campaign; this is not a full-level or human-playtested signoff. See docs/design/LOST_CANYON_SIGNAL_PRESSURE_2026-10-10.md.

## [Codex | 2026-10-10] Campaign foot-soldier melee reach — planned

Under Oliver's continuing direction to make ordinary combat more engaging, correct the first-swing whiff found in the shared grunt and sentinel AI: its wind-up begins outside its actual hit range. Use one modest reach for both phases on standard campaign walkers, preserving wind-up, avoidance, cover, tutorial trial difficulty, special bosses and other modes. Co-op enemy snapshots must carry the reach. Audit evidence and acceptance: docs/design/CAMPAIGN_MELEE_REACH_2026-10-10.md. Status: PLANNED, not shipped or balance-playtested.

## [Codex | 2026-10-10] Campaign foot-soldier melee reach — verified implementation

Version 2.163.0 gives standard campaign walkers and the watch sentinel eight units of consistent wind-up/hit reach, while preserving timing, damage, dodge, cover, trial and side-mode tuning. Muted browser first-hit, dodge, wall, snapshot and trial tests passed three times, with prior co-op melee, campaign pursuit, Briar combat roles and canyon alarm/co-op checks passing. The earlier PLANNED note records the pre-implementation state. The broad natural-combat sweep has a separate Galewisp failure in Lost Canyon that remains unconfirmed as a gameplay defect; investigate independently. Global combat quality and balance remain PARTIAL pending human playtesting. See docs/design/CAMPAIGN_MELEE_REACH_2026-10-10.md.

## [Codex | 2026-10-10] Galewisp cover and dive — planned

The Lost Canyon Galewisp audit found two concrete player-visible defects: it gets stuck directly over a sheltered player beneath a raised bracket, and in open ground its wind-up freezes it above actual contact height, causing early attacks to miss. Under the approved enemy reliability/combat-quality work, give this campaign flyer a stable edge-of-cover hover and a visible descent during its warned attack. Preserve cover safety, dodge, damage, trial tuning, other flyers, saves and existing SFX. Verify in a muted browser; status PLANNED, not balance-playtested. See docs/design/GALEWISP_COVER_DIVE_2026-10-10.md.

## [Codex | 2026-10-10] Galewisp cover and dive — verified implementation

Version 2.164.0 gives this campaign flyer an edge-of-cover perch, a raised-platform strike-clearance check, and a visible descent to contact height through its warned attack. A generic random role had sometimes turned Galewisps into self-destructing exploders; Galewisps now consistently keep their dive. The original PLANNED note above records the pre-implementation state. A 20-run muted browser cover/hit/dodge check, static gate, Lost Canyon route/checkpoint/climb/old-save/co-op checks, campaign pursuit, Briar combat roles and enemy navigation passed. The broad natural-combat sweep's under-platform Galewisp coordinate remains an invalid attack expectation because the platform is cover. Overall combat quality remains PARTIAL pending human playtesting. See docs/design/GALEWISP_COVER_DIVE_2026-10-10.md.

## [Codex | 2026-10-10] Ruined Keep arrow-post wall and caster — planned

The upper arrow-post caster can walk into a player on the same platform without firing because the eastern fortress wall physically overlaps that platform and blocks line of sight despite the platform being traversable. Lower that single wall below the post floor so it remains a ground barrier and architectural support without dividing the upper fight. Preserve the western wall, post quest, routes, rewards, save and co-op identifiers. Verify real player damage, ground collision, visual readability and regressions; status PLANNED, not playtested. See docs/design/RUINED_KEEP_ARROW_POST_SIGHTLINE_2026-10-10.md.

## [Codex | 2026-10-10] Ruined Keep arrow-post wall and caster — verified implementation

Version 2.165.0 lowers only the eastern wall below the 150-unit arrow-post platform, preserving its ground-level barrier and the western wall. The caster now has a clear upper sightline, releases projectiles and damages an exposed player instead of walking into them silently. A three-run muted browser check verified ground collision, ground cover and upper sightline; normal-camera art, full Keep route, checkpoint reload, co-op, escort-defense, unit content and static gate checks passed. The earlier PLANNED note is retained as pre-implementation history. The broader campaign terrain and enemy-quality requirements remain PARTIAL pending human playtesting. See docs/design/RUINED_KEEP_ARROW_POST_SIGHTLINE_2026-10-10.md.

## [Codex | 2026-10-10] Great Furnace worker escort

Oliver's ongoing campaign-quality direction favors visible, purposeful combat and escorts with vulnerable NPCs over repeated nearby-button orders. The required Great Furnace evacuation currently asks for two bell presses in one of two orders, then moves invulnerable workers automatically. Replace that input pattern with a worker escort along the existing lower-floor-to-break-room route. The work bell begins the attempt; Legion attackers pursue individual workers, whose health is visible. A fallen worker causes a clear reset and retry, with no loss of the rest of the level. Stopping the western transport chain before starting retains the quiet route's reduced enemy response. Preserve `gf.evacuated`, other quest and reward identifiers, prior completed saves, main cooling/office route, host-owned co-op enemy and escort authority. Old partial `gf.bells` state may be ignored. See docs/design/GREAT_FURNACE_WORKER_ESCORT_2026-10-10.md. Custom SFX remain on hold.
## [Codex | 2026-10-10] Palace Courtyard balcony route choice

Oliver's standing campaign-quality direction calls for purposeful alternate paths and fewer serial interactions. The live Palace Courtyard currently requires both west and east balcony locks before the visible sunbeam works, although either balcony physically leads to the mirror terrace. Let either balcony release enable the main light puzzle after the fountain is restored. Keep the second balcony explorable as an optional shortcut, with its guard or garden approach intact. Preserve Grace/Victor, the mirror puzzle and door, rooftop and garden rewards, existing west/east/open save flags, co-op authority and completed saves. Old saves with either balcony already open must enable the beam. Verify both single-balcony routes physically, main progression, optional second lock, old saves and guest interaction in a muted browser. See docs/design/PALACE_COURTYARD_ROUTE_CHOICE_2026-10-10.md. Custom SFX remain on hold.

## [Codex | 2026-10-11] Winding Cliffs freight bridge — planned

Oliver's standing campaign-quality direction rejects repeated adjacent-button combinations. The required Winding Cliffs bridge still uses a 2/3/5 weight sum and a wrong/right brake. Replace that player action with a visible loaded cart rolling onto a pressure plate, then release the bridge winch. Preserve the real bridge crossing, optional cargo climb, route, dialogue IDs, hp.bridge, old solved/finished saves, host-owned co-op progress, and all rewards. Verify normal-camera causality, the premature-brake response, cart collision, physical traversal, old saves and a guest push. This is PLANNED, not shipped or human-playtested. See docs/design/WINDING_CLIFFS_FREIGHT_CART_2026-10-11.md. Custom SFX remain on hold.

## [Codex | 2026-10-11] Winding Cliffs freight bridge — verified implementation

Version 2.166.0 retires the player-facing 2/3/5 weight bank and wrong-brake guess. A loaded rail cart now rolls from a clear left siding onto a sinking, lighting floor plate; the player then releases the far bridge winch. The old `hp.weight.open` flag remains as a save-compatible internal readiness alias; `hp.bridge`, route, rewards, optional cargo climb and lookout branches keep their meanings. An old partial weight mask does not count as ready, while old ready/completed saves load the cart docked. Muted browser QA passed normal E prompts and blocked/ready winch, cart collision and motion, 118-waypoint physical route, both lookout approaches, optional cargo chest, guest-owned co-op push/winch, checkpoint and old partial/ready/completed saves; story, guidance and dialogue logic checks passed. GOV-02, LV-02, LV-11 and MAP-02 remain PARTIAL for the full campaign. Human playtesting is still needed for puzzle feel and art. See docs/design/WINDING_CLIFFS_FREIGHT_CART_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Long Ascent stair-catch consequence — planned

Oliver’s standing Castle Duskmoor direction calls for a massive, purposeful ascent with visible consequences for the player’s actions. The live lower and upper stair catches are required story flags but do not affect the staircase until the summit gate, so they play like remote checklist switches. Add collision-backed, visibly retracting bars shortly beyond each catch; retain `la.lower`, `la.upper`, all routes, shards, prisoner rescue, vault, boss entry, co-op authority and prior saves. Remove duplicated broken-flight instructions. See docs/design/LONG_ASCENT_STAIR_CATCHES_2026-10-11.md. Status: PLANNED; browser route, co-op and save QA remain required. No custom SFX.
## [Codex | 2026-10-11] Castle and palace detailed scenery loader — planned

Fresh browser QA of the Long Ascent catch work exposed a shared rendering failure: `world3d.js` loads the detailed scenery kit from `deep-art.js?v=2135`, while six castle/palace art wrappers import a distinct `?v=2074` module instance and fail at `kit.get(name)`. The renderer falls back to generic voxels. Align the wrapper imports with the kit loader, refresh their `world3d.js` module URLs, and verify the affected scenes actually build their detailed art. Preserve geometry/gameplay and unrelated pending file edits. See docs/design/LONG_ASCENT_STAIR_CATCHES_2026-10-11.md. Status: PLANNED pending browser checks.
## [Codex | 2026-10-11] Long Ascent stair catches and castle/palace art — verified implementation

Version 2.167.0 makes each existing lower/upper catch retract a collision-backed barred opening on the next spiral flight. Old la.lower/la.upper flags start the matching bars open; host and guest share the change. A brief camera glance shows the grilles moving, while a closer overview keeps the player in view through the tower. The duplicated stair note is shortened. Six castle/palace art wrappers now import the same loaded deep-art module, fixing the generic-voxel fallback without altering story or rewards. Muted browser QA passed both gate collisions and interactions, old partial save, full Long Ascent route, combat, checkpoint, two-page co-op and six-scene art build. Human playtesting still determines gate readability, pacing and visual quality. The broader campaign-quality requirements remain PARTIAL. See docs/design/LONG_ASCENT_STAIR_CATCHES_2026-10-11.md. No custom SFX work.
## [Codex | 2026-10-11] Sky Library optional crossing work begins

The approved campaign-puzzle and parkour overhaul applies to the SP-03 shelf branch. The current clustered three-handle `[1,2,3]` combination is a verified instance of the repetitive interaction pattern Oliver reported. Replace it with two separated mechanisms that visibly unfold a physical, recoverable shelf route. Preserve Simon, the optional reward, the independent main path, co-op shared state, and completed saves. Grounded plan: `docs/design/SKY_LIBRARY_SHELF_CROSSING_2026-10-11.md`. This is an implementation slice, not a claim that the whole campaign is redesigned.

## [Codex | 2026-10-11] Sky Library shelf crossing — verified implementation

Version 2.168.0 replaces the optional SP-03 three-handle combination with a two-stage folding-shelf crossing. The near crank opens two shelves; the far crank opens four more, and the player must traverse the changing route. A missed jump lands on lower catch shelves and can return to the near landing. Simon, the shard, the independent main route, and old completed saves remain intact. Browser QA covered physical traversal, failure/recovery, checkpoint-story states, co-op sharing, and normal-camera frames. Human playtesting remains open; campaign-wide puzzle/level quality remains PARTIAL. No custom SFX work. See docs/design/SKY_LIBRARY_SHELF_CROSSING_2026-10-11.md.
## [Codex | 2026-10-11] Deep Ice Caves side-channel spill — planned

Oliver's approved puzzle-variety and optional Rift Shard direction applies to the remaining three-toggle FF-04 channel. The actual player action is still cycling adjacent controls to mask 5. Replace it with an elevated maintenance climb to release a visible hanging plug into the spill, diverting water through the chiller and freezing the existing side bridge. Preserve the independent main float crossing, `ic.channel.clue`, `ic.channel.open`, FF-04, old completed saves, host-owned co-op state, and the basin's dry recovery. Old incomplete mask values may be ignored. Verify physical traversal, missed-jump recovery, inaccessible release from the floor, visible cause/effect, prior saves and co-op in a muted browser. See docs/design/DEEP_ICE_SIDE_SPILL_2026-10-11.md. This is PLANNED, not shipped or human-playtested. No custom SFX work.

## [Codex | 2026-10-11] Deep Ice Caves side-channel spill — locally verified

Version 2.169.0 implements the approved optional FF-04 action replacement: climb five service ledges, release the hanging plug, see spring water divert through the chiller, then cross the frozen side bridge. The main float route, Professor Ellis and Hugo quests, shard identity, and host-owned co-op story state remain intact. The optional tracker now stays active until FF-04 is collected. Old completed flags recreate the open crossing; old partial mask input is harmless. Muted browser checks passed physical climb, miss/recovery, floor-distance gating, open bridge, shard pickup, prior states, checkpoint, full cave route, main float route and two-page co-op. Human playtesting is still needed for challenge, visuals and camera feel. Campaign-wide quality remains PARTIAL. No custom SFX work. See docs/design/DEEP_ICE_SIDE_SPILL_2026-10-11.md.
## [Codex | 2026-10-11] Homefields granary interaction replacement — planned

Oliver's standing campaign-quality direction rejects adjacent combination inputs with only different story dressing. The optional Homefields granary still uses precisely that pattern (1/2/4 handles, target 5). The approved existing-level improvement work supports replacing it with a visible grain path from the climbable loft to a hanging basket and store-room pulley. Preserve the open-door flag, cache/reward, notes, co-op authority and old saves. The far camera must also leave the barn interior legible. This is a scoped implementation of the existing direction, not a new user-authored lore decision or a claim that Homefields is finished. See docs/design/HOMEFIELDS_GRANARY_CHUTE_2026-10-11.md.

## [Codex | 2026-10-11] Homefields granary route — locally verified

Version 2.170.0 replaces the three weight toggles with a loft hopper, aimable trough, visible grain flow and a hanging basket that lifts the physical store-room door. Releasing grain before aiming the trough visibly spills it and still permits a solve; the lower and upper controls work in either order. The classic camera no longer fills with roof trim inside the barn. The existing open/cache flags, reward, note ID and co-op authority remain; old completed saves start open and old partial weights are ignored. Muted browser QA passed the physical loft approach, floor-height gating, before/after door collision, checkpoint reload, two-page co-op and once-only claim, alongside story-state tests. The journal notice also moves clear of a simultaneous chest reveal and minimap. This remains one optional Homefields improvement; campaign-wide quality and human puzzle feel remain PARTIAL. See docs/design/HOMEFIELDS_GRANARY_CHUTE_2026-10-11.md. No custom SFX work.
## [Codex | 2026-10-11] Broken Walls return-request hoist — planned

Oliver's standing request for varied, physical campaign puzzles also applies to the Quartermaster's Food for the Refuge side quest. Its live 3/5/7 nearby-weight sum is another repeat of the rejected interaction pattern. Replace it with an optional, recoverable service-ledge climb to an upper hoist brake and a visible food-basket descent, while keeping the existing quest/reward/save IDs, the independent chamber trial and the main prison route. Grounded plan and acceptance: docs/design/RUINED_KEEP_SUPPLY_HOIST_2026-10-11.md. This is a scoped quality pass; human playtest remains necessary. No custom SFX work.

## [Codex | 2026-10-11] Broken Walls return-request hoist — locally verified

Version 2.171.0 implements that physical climb and visible hoist. The normal-prompt brake release is height gated, missed jumps return to the chamber floor, the tracker follows the lowered basket, and food collection becomes durable ready progress immediately. Old partial weight values stay unsolved; old open saves stay open with an updated clue. Ready/done saves show an opened, empty hoist. Quest/reward identifiers, the chamber shield trial and main route remain. Muted browser route, return-quest flow, legacy-shaped save reload, two-page co-op, full Keep route, static/story and dialogue checks passed. Human difficulty and visual feel remain unverified. See docs/design/RUINED_KEEP_SUPPLY_HOIST_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Ruined Keep lift winch — planned

The ongoing approved campaign-quality work applies to the required dungeon lift: retire the adjacent three-weight sum, use a moving-platform winch driven by the player's walk around the handle, visibly raise the rescued group with the player, and allow retry after release or fall. Preserve kd.lift.open/kd.transfer, checkpoint compatibility, co-op control and late-rider cycling. See docs/design/RUINED_KEEP_LIFT_WINCH_2026-10-11.md. Human playtest remains outstanding; no custom SFX work.
## [Codex | 2026-10-11] Ruined Keep lift winch — locally verified

Version 2.172.0 implements the approved physical lift action, readable rig and live tracker. Solo movement, release/reversal, two-client co-op and disconnect, checkpoint and old completed/partial saves, the full dungeon route and its optional branches passed muted browser QA. `kd.lift.open`/`kd.transfer` retain their meaning. A transient story-file request now retries to protect campaign dialogue loading. Human puzzle feel and final art remain unverified. This does not claim the campaign-wide redesign is finished. No custom SFX work. See docs/design/RUINED_KEEP_LIFT_WINCH_2026-10-11.md.

## [Codex | 2026-10-11] Ruined Keep lower works press crossing — planned

Oliver's later puzzle-variety direction rejects repeated nearby combination controls. The optional lower works still has two consecutive weight-answer banks. Replace those controls with a visible, staggered press corridor and a reachable emergency brake beyond it. Hits should cost some health and return the player to safe floor; stopping the machine opens the existing `kd.deep.open` gate and RK-03. Preserve old completed saves, main rescue, optional drain, co-op authority and rewards. See docs/design/RUINED_KEEP_LOWER_WORKS_2026-10-11.md. This is planned until browser verification. No custom SFX work.

## [Codex | 2026-10-11] Ruined Keep lower works press crossing - locally verified

Version 2.173.0 replaces the two optional lower-works weight-answer banks with three staggered, visible counterweight presses and a side-mounted emergency brake. Warning lamps, moving plates and safe waiting floor make the interaction spatial; a hit costs modest health and knocks the player back before the press. The brake stops the machine, opens the existing `kd.deep.open` gate and exposes RK-03. The obsolete weight and latch inputs are inactive. Old completed saves keep the gate open; old partial bank values cannot bypass the crossing. Main rescue, Sly, drain, rewards and host-owned co-op actions remain. Node/static checks plus muted browser traversal, deliberate hit, visual states, full route, checkpoint, two-client co-op and legacy save checks passed. Human challenge and art judgment remain open. No custom SFX work. See docs/design/RUINED_KEEP_LOWER_WORKS_2026-10-11.md.
## [Codex | 2026-10-11] Lost Canyon north crossing — planned

Continue Oliver's approved campaign quest-variety work: the exposed north cage becomes a damageable two-prisoner crossing with meaningful enemy targeting, visible health, ambushes and retry; the sheltered south release stays a faster contrast. Cutting the existing signal cable first reduces pressure. Preserve `lc.north` as the durable safe-at-shelter completion, make old completed saves remain complete, and preserve all other story, shard and co-op outcomes. See docs/design/LOST_CANYON_NORTH_CROSSING_2026-10-11.md. This is scoped work, not a claim that the campaign is fully polished. No custom SFX.

## [Codex | 2026-10-11] Lost Canyon north crossing — locally verified

Version 2.174.0 makes the exposed north release a 20-second, two-prisoner escort with visible health, two ambush waves, live enemy targeting, a walkable evacuation lane, retreat/retry on failure and a quiet-route advantage for cutting the alarm cable first. The south cage stays a quick sheltered release. `lc.north.open` separates the open cage from the existing durable `lc.north` safe-at-shelter completion. Old completed and partial saves reload; all five Hollow Pass shards, Ruth's reward, alarm patrols, full canyon route and two-client story state remain. The prisoners use visually distinct civilian models. Static and muted browser QA passed. Human pacing, difficulty and art remain unverified; campaign-wide quality remains PARTIAL. No custom SFX work. See docs/design/LOST_CANYON_NORTH_CROSSING_2026-10-11.md.

## [Codex | 2026-10-11] Castle Gates broken drain crossing — planned

Continue Oliver's approved puzzle-variety and purposeful-parkour direction without replacing the Castle Gates map or altering its disguise/assault choice. The two adjacent bridge catches and wheel currently repeat one button interaction. Replace the middle drain floor with an offset masonry traversal to one far-bank brake, retain `cg.catch.west` as the durable release flag, and make the existing wheel lower a visibly moving bridge. Keep `cg.catch.east` loadable as a retired partial-save flag; keep `cg.bridge.open`, all rewards and story outcomes. See docs/design/CASTLE_GATES_DRAIN_CROSSING_2026-10-11.md. This is a scoped implementation, awaiting browser and human playtesting; no custom SFX work.

## [Codex | 2026-10-11] Castle Gates route correction during browser QA

The first normal-camera check showed the far drain bank still led directly toward the court, making the bridge requirement artificial. Remove that outlet. The brake instead lowers a return walkway to the near-bank wheel, and the lowered bridge becomes the actual court crossing. This refines the planned scoped change in CASTLE_GATES_DRAIN_CROSSING_2026-10-11.md before release; the infiltration and assault choice remains unchanged.

## [Codex | 2026-10-11] Castle Gates drain crossing — locally verified

Version 2.175.0 replaces the two adjacent bridge catches with offset, collision-backed masonry jumps to one brake. The brake creates a walkable return route to the near-bank wheel; that wheel lowers the only walkable bridge into the court. A miss incurs the existing fall toll and returns to solid ground. `cg.catch.west`, `cg.bridge.open`, reward IDs, Roland's infiltration/assault branches, and legacy `cg.catch.east` save data remain. Static and muted-browser movement, E-key, route, combat, disguise, checkpoint, old-state, navigation and two-client checks passed, with raised/lowered normal-camera inspection. Oliver's human playtest still decides feel and final art. Campaign-wide quality remains partial. No custom SFX work. See docs/design/CASTLE_GATES_DRAIN_CROSSING_2026-10-11.md.

## [Codex | 2026-10-11] Shipwreck Shore hull cargo release — planned

Continue Oliver's approved campaign puzzle-variety direction on the optional SC-01 hatch. The live three adjacent numbered weights repeat the interaction pattern he rejected. Replace them with a visible suspended cargo cage and timed release against a marked beam. Preserve `sc.hull.open`, the lower ramp and shard, all main voyage/story outcomes, host-owned co-op state and old saves. Old partial weight values must become inert while completed saves keep the hatch open. See docs/design/SHIPWRECK_HULL_CARGO_RELEASE_2026-10-11.md. This is a scoped implementation pending browser and human playtesting; no custom SFX work.

## [Codex | 2026-10-11] Shipwreck Shore cargo release — locally verified

Version 2.176.0 replaces the three numbered weight toggles with one timed, visible cargo-cage release. A missed pull keeps the hatch shut; a correct pull moves the beam and opens the same lower ramp to SC-01. The lever was moved aside after a normal-camera check so the swinging cargo and mark remain visible. Existing `sc.hull.open`, shard, boat and story rewards remain stable; old partial weights are inert and completed saves load with the hatch open. Static, normal E-key, full shore, voyage, checkpoint, old-save and host/guest browser checks passed. Human playtesting still decides timing feel, clarity and visual quality. The larger campaign-quality effort is not complete. No custom SFX work.

## [Codex | 2026-10-11] Palace Courtyard mirror cause and effect — locally verified

Continue Oliver's approved puzzle-readability and level-quality direction. The Palace already simulated a spatial sunbeam, but normal-camera presentation was too faint to understand by observation. Version 2.177.0 makes each face turn, projects the active ray onto the marble, marks its direction and misses, and lights the library receiver and threshold on success. Keep `pc.light.mask`, `pc.light.open`, routes, reward IDs and co-op story authority. Old complete states lacking a mask render a solved beam. Muted-browser initial, mistaken, partial, solved and old-complete visuals; full courtyard, checkpoint and two-client checks; and node story checks passed. Human puzzle feel remains unverified. The campaign-wide quality pass remains partial; no custom SFX work. See docs/design/PALACE_SUNBEAM_READABILITY_2026-10-11.md.
## [Codex | 2026-10-11] Great Furnace cooling room — scoped plan

Continue Oliver's approved campaign puzzle-variety, combat and visible-causality direction. Replace the required three nearby round/square/triangle cooling inputs with a physical emergency pedal: stand on it to drive water and defend it from Legion attackers; stepping off pauses and reverses cooling. Preserve the existing `gf.cool.open` save truth, broken bridge, all optional branches, workers, writings, rewards and host-owned co-op state. Old partial sequence values are inert; completed saves stay complete. See docs/design/GREAT_FURNACE_COOLING_PEDAL_2026-10-11.md. This is a scoped implementation pending browser and human playtesting. No custom SFX work.

## [Codex | 2026-10-11] Great Furnace cooling room — locally verified

Version 2.178.0 replaces the three-input bank with a held floor pedal that moves visible cooling water and lowers the heat gauge during three Legion attack waves. Leaving the pedal reheats the crossing; anyone in the co-op party may hold while the host owns completion. Existing `gf.cool.open`, bridge, writings, shards, Cinder and other branches remain. Old partial values are inert; old completed saves rebuild the bridge. Node and muted-browser normal-movement, full-route, checkpoint, guidance and host/guest checks passed. Oliver has not yet playtested combat feel or final art, and the campaign-wide redesign remains open. No custom SFX work. See docs/design/GREAT_FURNACE_COOLING_PEDAL_2026-10-11.md.
## [Codex | 2026-10-11] Iron Halls weapon-line shutdown — scoped plan

Oliver's later requirement for varied, physical puzzles with visible consequences supersedes the old three-control input sequence in Iron Halls. Keep the earlier timed-hammer requirement by making the hammer affect a pushable drive sled. Retain `ih.line.open`, the worker/cart prerequisites, story and rewards, old completed saves and host-owned co-op state. This is a scoped improvement under the standing campaign-quality approval; it is not a claim that the whole level is complete. See docs/design/IRON_HALLS_DRIVE_SLED_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Iron Halls physical shutdown — locally verified

Version 2.179.0 replaces the required three-control sequence with a pushable scrap sled, warning hammer and visible drive-gear stop. Worker shelter and cart repair remain prerequisites; `ih.line.open` stays the save and co-op completion truth. Legacy partial control values are inert; old completed saves reopen the route. Muted-browser idle, hit/retry, complete route, checkpoint, old-save, journal and guest-operated co-op checks passed. The parked hammer was raised after visual inspection showed it obstructing the camera. Oliver has not yet judged the challenge or final art in a playtest. Campaign-wide quality remains partial. No custom SFX work.
## [Codex | 2026-10-11] Long Ascent service vault brake — planned

Under Oliver's continuing campaign-quality direction, replace the optional two-wheel four-mark service-vault combination with a supported overhead rack climb and one brake release. Preserve `la.vault.open`, CD-03, the worker rescue, service lift, summit route, old completed saves and co-op sharing. Old partial wheel positions may be ignored. The route needs visible cable-and-bar consequences and a safe missed-jump return. Verify real traversal, normal-camera presentation, checkpoint and prior saves before marking this shipped. See docs/design/LONG_ASCENT_VAULT_BRAKE_2026-10-11.md. Custom SFX remain on hold.

## [Codex | 2026-10-11] Long Ascent service vault brake — locally verified

Version 2.180.0 replaces the adjacent two-wheel combination with six supported rack ledges above the linen room, a recovery shelf and one high brake. Pulling the brake retracts the bars and retains `la.vault.open` and CD-03; old partial wheel values are inert, and old completed saves load with the vault open. The player can see the cable and bars respond. The service-vault entrance has a clear masonry opening and the beds no longer obscure it. The voice manifest is now fetched once per shared in-flight request, with bounded success caching and retry after failure, instead of once for every dialogue book. Node and muted-browser checks covered the physical climb, miss/retry, old partial/completed saves, two-client co-op, checkpoint and full ascent route. Human playtesting remains for challenge and visual quality. See docs/design/LONG_ASCENT_VAULT_BRAKE_2026-10-11.md. No custom SFX work.

## [Codex | 2026-10-11] Black Woods upper signal route — planned

Oliver's approved early-campaign parkour, meaningful route-choice and environmental-clarity requirements apply to Black Woods. The live upper cable approach is currently a continuous raised walkway of 34 overlapping slabs, despite Lewis describing it as a climb. Replace that walkway with separated, supported timber perches and a visible route toward the existing horn, while keeping the ground crank, upper cable, BR-03 loft, Beth rescue, animal-track secret, flags, co-op and prior saves. The normal camera must show solid footing and a believable signal landmark. See docs/design/BLACK_WOODS_SIGNAL_CANOPY_2026-10-11.md. This is planned until real traversal and visual checks pass; no custom SFX work.

## [Codex | 2026-10-12] Black Woods signal canopy, v2.181.0

Replaced the continuous eastern signal walkway with 21 spaced, tree-supported timber perches, a recognizable horn belfry and the optional BR-03 loft spur. A missing floor connection below the descent now leads back to the north trail. The ground crank, upper cable, story flags and reward identities remain intact. Muted real-browser checks passed the full climb and descent, optional shard, deliberate miss/retry, ground route, banked-shard reload, older partial/completed save, two-client co-op, generic 3D and voxel fallbacks, story tests and syntax. Start, middle and signal-deck frames were inspected for visible footing and controls. Human challenge and final art assessment remain open; the campaign-wide quality pass remains in progress. No custom SFX work. See docs/design/BLACK_WOODS_SIGNAL_CANOPY_2026-10-11.md.

## [Codex | 2026-10-12] Campaign-wide independent-playtest pass - requested

Oliver requested: "Please make one big final push across so levels to get it really ready for new players to play test. Do a massive graphical upgrade to all assets to increase detail and look for any visual issues like assets clipping and fix. And any other issues you may find along the way please fix". Apply this to the existing campaign and current approved story. Begin with the shared scenery/material weaknesses confirmed in a browser sweep of all 16 halves, inspect asset placement and collision, and run fresh-player progression/save/co-op checks. Preserve the colorful adventure preference and custom-SFX hold. See docs/design/CAMPAIGN_PLAYTEST_READINESS_2026-10-12.md; do not mark the wider game fully polished solely from automated checks.
## [Codex | 2026-10-12] Campaign readiness pass - implemented and verified

v2.182.0 applies the requested push to shared scenery in all eight campaign destinations, with brighter regional lighting, material detail, targeted architectural geometry, established nature assets, two corrected NPC placements, coastal/deep camera obstruction fixes and readable scene introductions. v2.181.0 also fixed and physically checked the Black Woods climb/descent. Fresh creation, an actual pre-change save, 24 checkpoints, 24 scene renders, local two-client progression, route and fallback checks passed. See docs/design/CAMPAIGN_PLAYTEST_READINESS_2026-10-12.md and docs/art-validation/campaign-readiness-2026-10-12.json. The broad aspiration for a fully polished game remains open; automated verification does not replace outside human playtesting or mean every asset was rebuilt.

## [Codex | 2026-10-12] Further campaign core-improvement pass - requested

Oliver requested: "Ok we have a. Lot of usage left so do another round of these core improvements on the camp gain levels all around". Continue the approved campaign quality work on current levels after v2.182.0, inspecting actual play and scenery before choosing changes. Preserve story, earned progress, old saves and the custom-SFX hold; use measurable route/combat checks plus normal-camera visual review. Additional usage is not itself a reason to multiply cosmetic variants or repeat tests without a new risk.

## [Codex | 2026-10-12] Campaign footing and healing sites, v2.183.0

Continued the approved core campaign pass across all eight regions. Grounded authored enemies and their repeating patrols using bounded deterministic placement; explicitly corrected off-path guards. Repositioned 20 finite healing sites from unsupported/obstructed/stair locations onto adjacent clear floor. Added regional rest-site meshes, charge indicators and local reachable-only instructions. Rest charge and quest locks remain unchanged. Fixed the missing lower Thunder Cliffs lift dock, the inaccessible Lost Canyon cache and missing fallback scenery colors that could halt rendering. Updated misleading hub tips about campaign entry and kept progress.

Muted browser checks passed: 206 ground enemies across 16 halves, 39 patrol refills, 57 rest-site floor checks and actual healing at every unlocked finite site, eight regional visual samples, finite/spent/locked/unlimited healing, two real movement-and-E approaches, 134 Thunder Cliffs waypoints, class disguise behavior, 24 scenes in three camera modes, fresh creation, a pre-change save, 24 checkpoints and 11 local two-client progression checks. Pause and renderer fallback hide the contextual rest hint. See docs/art-validation/campaign-footing-2026-10-12.json and docs/design/CAMPAIGN_ENCOUNTERS_AND_REST_2026-10-12.md. Human playtest, real-network co-op and low-end performance remain unverified. This does not close the broader campaign quality goal. No custom SFX work. Preserve unrelated companion3d.js, prop3d.js and articulated-rigs.json edits.


## [Codex | 2026-10-12] Chest reference redesign — approved

Exact user request: "Btw you made the chests all one of color of their rarity, I want them redesigned to look more like these"
Reference: attached 1-Photo-1.jpg (1B511883-7627-4B56-84C8-C2344F5F1732), five chests from common to legendary. Visible brown timber throughout; plain iron, green patinated metal/leaves, silver and blue gems, violet ceremonial panels/crystals, then elaborate gold/red sun ornament. Progressively larger and more ornate. This corrects the existing monochrome rarity treatment; it does not change chest odds, rewards or placements. Preserve hinged lids, mimic breathing, one equipment item, the skippable reveal, personal co-op claims and saved outcomes. Grounded plan: docs/design/CHEST_REFERENCE_REDESIGN_2026-10-12.md.


## [Codex | 2026-10-12] Chest reference redesign — implementation evidence

All five shared rarity models implemented in v2.184.0; mixed timber/metal and increasing ornament replace the monochrome treatment. Existing loot/save contracts preserved. See docs/design/CHEST_REFERENCE_REDESIGN_2026-10-12.md and docs/art-validation/chest-craft-2026-10-12.json for bounded browser evidence. Human aesthetic acceptance remains open.


## [Codex | 2026-10-12] Return to campaign improvements — requested

Exact user request: "Ok once you finish making the chests look awesome, please get back to improving all the campaign levels all the way around". The chest redesign shipped as v2.184.0. Continue existing campaign improvements, using inspected shortcomings and normal-camera checks, while preserving current story, quests, save contracts and the custom-SFX hold. The next bounded pass addresses indistinct clue/pickup props across the campaign, interaction through solid walls, and stale quest wording about retaining earned progress. Scope and verification: docs/design/CAMPAIGN_OBJECTS_AND_INTERACTION_2026-10-12.md. The general campaign quality objective remains open.


## [Codex | 2026-10-12] Campaign object detail and interaction correctness, v2.185.0

Implemented 62 crafted clue/pickup props in all 16 campaign halves with 20 reusable models plus two supports. Corrected 17 unsupported, buried or obstructed placements. Solid-wall reach now applies both to local prompts and host story authority; coastal wall collisions match drawn height. Readables remain after reading; physical items disappear from persistent/shared pickup state. Fixed two misleading earned-progress journal messages, wind-caption placement and Shipwreck Shore cargo/chain obscuring the rudder pickup view.

Verified all mapped props, 18 pickup/save/deduplication flows, 238 state-appropriate interaction approaches, older save, 24 campaign checkpoints, 184 coastal movement waypoints, 12 guidance checks, 11 cooperative route checks and seven new cooperative clue/pickup checks. Representative normal-camera frames inspected in each half; selected evidence saved. See docs/design/CAMPAIGN_OBJECTS_AND_INTERACTION_2026-10-12.md and docs/art-validation/campaign-objects-2026-10-12.json. Co-op uses local browser packet relays, not public-network testing. Human feel, aesthetic acceptance and slower-device performance remain open; the broader campaign improvement request is not closed. No custom SFX. Unrelated companion3d.js and articulated-rigs.json edits excluded.


## [Codex | 2026-10-12] Custom 3D asset shortlist — requested, recommendations only

Exact user request: "Please also help come u with a list of assets that we should create detailed custom 3d models for that would significantly improve the  graphics". Created docs/design/CUSTOM_3D_ASSET_PRIORITIES_2026-10-12.md from current renderer/source and screenshot inspection. Proposed priority: natural terrain silhouettes, village/fortress architecture, traversal structures, functional machinery, then regional landmarks and purposeful dressing. Reuse good existing trees, preserve the latest chest/prop work and brighter color direction. The list and suggested first comparison batch are proposals, not evidence of user approval or implementation. No gameplay changed by this planning step.


## [Codex | 2026-10-12] Full campaign asset shortlist — approved for implementation

Exact user request: “I’d like you to improve every single asset you listed in every single level ! Do it now”. This explicitly approves all nine model families and all eight regional landmark groups in docs/design/CUSTOM_3D_ASSET_PRIORITIES_2026-10-12.md. The earlier recommended comparison batch is no longer a scope limit. Apply appropriate families throughout the existing campaign, preserving layouts, collision, parkour, stateful machinery, story, saves, co-op and the custom-SFX hold. Reuse the established higher-quality trees. Continue the brighter colorful stylized fantasy direction. Implementation and evidence are tracked in docs/design/CAMPAIGN_CRAFT_IMPLEMENTATION_2026-10-12.md; do not equate automatic coverage checks with human aesthetic acceptance.


## [Codex | 2026-10-12] Full campaign environment shortlist implemented — v2.186.0

All nine approved environmental model families now have appropriate upgrades across all eight campaign regions. Added a 59-model reusable procedural library, fitted kit replacements and 678 authored components across 24 campaign scene snapshots, including cottages/mill/barn, cliffs/caves, bridges/cages, rescue lift, laboratory, furnace/presses, wrecks/crane/ballista, palace fountain/mirrors/library, and castle gate/stair/lift/throne surroundings. Retained good mature trees, working ship, and existing detailed machinery where appropriate. Four standalone library variants (door, scaffold, perch, shelf) are not blindly inserted; their campaign roles use integrated cottage detail and fitted improvements to existing route structures.

Geometry is cached, merged, instanced and distance culled. Moving parts follow the existing gameplay state; story, loot, saves and route collisions remain intact. Title > Dev previews > Campaign environment opens the model workshop. Verified 24 campaign scenes, 59 workshop models, 12 mechanism assertions, unchanged imported-kit bounds, 238 reachable interactions at the appropriate puzzle state, prop footing, 24 checkpoints, pre-change save, seven local co-op clue/pickup checks, and 184 coastal waypoints. Visual review corrected duplicate furnace bodies, dark lantern casings, canopy/camera obstructions, rock artifacts and workshop phone framing. See docs/design/CAMPAIGN_CRAFT_IMPLEMENTATION_2026-10-12.md and docs/art-validation/campaign-craft-2026-10-12.json. Human aesthetic acceptance and low-end/public-network testing remain open. Broader campaign improvement goal remains open. No custom SFX work. Excludes unrelated companion3d.js/articulated-rigs.json edits.

## [Codex | 2026-10-12] Coherent campaign geography and contextual falls

U-GEO-20261012 approves revising existing campaign terrain/layout to read as real environments, not floating paths above arbitrary hazards. Enclose Ruined Keep courts/dungeons; use wooded/fenced Briar borders; preserve real mountain, lava, coast and tower risks; connect Sunspire gardens/ascent to a monumental palace/library with meaningful side patios and routes. Preserve quests, secrets, parkour, saves and co-op. This supersedes the previous art pass's no-layout-change constraint for this request. Exact source: docs/requirements/USER_SOURCE_2026-10-12_GEOGRAPHY.md. Grounded plan/evidence: docs/design/CAMPAIGN_GEOGRAPHY_2026-10-12.md. Status: PLANNED/IN PROGRESS, not shipped. Suggested Duskmoor grab/throw enemies are deferred combat design, not silently implemented.

## [Codex | 2026-10-12] Intentional route connections

U-GEO-20261012-B adds explicit emphasis on how paths connect and navigate, beyond exterior boundaries. Apply purposeful primary routes, readable junctions, structurally plausible stairs and destination-led branches; do not merely wrap the existing fragmented strips in walls. Exact follow-up preserved in USER_SOURCE_2026-10-12_GEOGRAPHY.md. Implementation belongs to the same geography pass.

## [Codex | 2026-10-12] Preserve scale; improve materials

U-GEO-20261012-C: retain the large footprint and exploration scale of existing campaign levels. Improve plain walls/floors through region-appropriate texture and material definition, prioritizing shared tiled textures over additional polygon detail. See preserved exact source. Part of the ongoing geography pass.

## [Codex | 2026-10-12] Visual blueprints before further layout buildout

U-GEO-20261012-D requests intelligent overhead designs to inform the work. Produce reviewable plans for all sixteen campaign halves, preserving existing scale and exposing vertical layers, route purposes, optional loops, gates and intended hazards. Compare previous and updated geography, review before publishing and make accessible from title > Dev previews. Use plans before subsequent layout changes; preserve source-grounded verification and human-playtest limits.


## [Codex | 2026-10-12] Campaign geography, materials and blueprints — v2.187.0

Implemented U-GEO-20261012 and follow-ups B/C/D: purposeful terrain/boundaries across all eight campaign regions, connected Keep courts/dungeons, Sunspire garden axis and library rooms, and contextual recovery on ordinary ground. All 24 scene bounds retain their previous scale. Deliberate mill/lift/shelf/lava/moat gaps and route alternatives remain. Seven Keep/Sunspire route connections were physically checked; moved the records bookshelf out of its walking lane. Shared 512px painted surfaces add floor/wall definition without tessellation; large walls use textured relief rather than grids of tiny brick meshes.

Title > Dev previews > Campaign blueprints opens sixteen interactive plans with previous/updated footprints, actual routes, height slices/profiles, real objective markers and authored branch purposes. The latest request arrived mid-build: plans review this pass before publication; subsequent layout changes begin with blueprint updates. Correctly mark Thunder's lift and the library records as optional.

Validated 123 geography assertions, 238 state-appropriate interaction approaches, 24 scene renders, 24 checkpoint restores, pre-change save, twelve mechanism behaviors, palace alternative routes, prison repeated lift travel, seven local co-op pickup/clue assertions, targeted movement/climbs and 55 desktop/phone blueprint checks. Repaired the old Thunder route-only test fixture so a legitimate rank-up choice no longer stalls its movement; race/hydra traversal passes. Scope/results: docs/design/CAMPAIGN_GEOGRAPHY_2026-10-12.md and docs/art-validation/campaign-geography-2026-10-12.json. Human pacing/aesthetic acceptance and slower-device/public-network tests remain open. No custom SFX work. General campaign quality objective remains open. Unrelated companion3d.js/articulated-rigs.json changes excluded.


## [Codex | 2026-10-12] U-BRIAR-JOURNEY-20261012 — approved sequential finishing pass

User approves the preceding plan: finish current campaign levels one at a time, starting with Briar’s new-player journey. Preserve full scale and existing progress; review actual navigation, combat, puzzles, optional routes and presentation, followed by browser/save/co-op checks. Source: requirements/USER_SOURCE_2026-10-12_BRIAR_JOURNEY.md; grounded plan: design/BRIAR_JOURNEY_2026-10-12.md. Affects GOV-02/03/07, LV-01/02/04/05/07 and U-GEO-20261012. Status: in progress. No claim of full campaign completion or human acceptance.


## [Codex | 2026-10-12] Briar player journey — v2.188.0

Implemented the first region of the approved sequential campaign finishing pass. Live Homefields/Black Woods retain their large bounds, optional granary/orchard/canopy/root routes, rewards and existing detailed assets. Joined trails and nine destination boards clarify navigation. The mill now uses a movable grain crate and pressure plate, with a visible sluice, interrupted water, jammed wheel and lowering bridge. One co-op operator owns the crate; reset/disconnect and old partial/completed states remain safe. Mara activates the escape task on delivery. Two signal defenders now occupy their intended ground storey, and superseded mill notices clear from the overlay without deleting journal entries.

Validation passed: 20 main-route assertions across 69 physical movement waypoints to the Brute checkpoint; seven existing optional-route/combat regressions; seven two-client co-op checks; four saves created by the v2.187 main HTML preserving gold, character/class XP, equipment and name; uncut normal-camera mill interaction with mistake/recovery; actual attacks by both corrected ground guards; 55 desktop/phone blueprint checks; story, authority, Briar and syntax tests. Navigation fixtures stun enemies; combat probes are separate. Co-op transport is a local relay. Human pacing/art judgment, real-network behavior and low-end performance remain open.

See docs/design/BRIAR_JOURNEY_2026-10-12.md and docs/art-validation/briar-journey-2026-10-12.json. The broader campaign pass is still in progress; Hollow Cliffs is next. No custom SFX work. Unrelated companion3d.js and articulated-rigs.json edits are excluded.


## [Codex | 2026-10-12] U-HUD-PREVIEWS-20261012 — visual choices before rollout

User requests a less busy HUD and several visual alternatives to choose between before applying. Exact source and grounded plan: requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md (relative to docs/). Build an isolated, interactive comparison of Classic Compact, Adventure Focus and Combat Focus using actual game scenery and existing icons. Include exploration, combat, reading and co-op states. Add access from Dev Previews. No gameplay HUD replacement, preferences or saves change until a direction is selected. Broader campaign finishing remains open. Status: in progress.


## [Codex | 2026-10-12] HUD comparison previews — v2.189.0

Built three isolated choices: Classic Compact (familiar corners), Adventure Focus (map and objective together), and Combat Focus (health/mana with skills). Access: title > Dev Previews > HUD designs, or /design/hud-preview/. Real Briar scenery and existing icon art, five illustrative states (exploration, combat, reading, co-op, beginner), actual current-HUD comparison, desktop/laptop framing, full-size phone panning and fullscreen. Clickable skill cooldowns and clue dismissal/reopening demonstrate behavior. Optional gear/gold stays available. The preview never loads the game or reads/writes saved characters and settings.

Verified 60 layout/state/detail combinations without intersecting primary panels or escaped bounds; assets, cooldowns, clue controls, deep links, comparison, fullscreen and phone overflow checks pass. Visual inspection covered A/B/C and phone. An actual v2.188-generated save retains character/class XP, gold, equipment, name and story flag after loading v2.189. Main-game changes are only version, preview-menu wording, and its link. Report: docs/art-validation/hud-previews-2026-10-12.json; source/plan: docs/requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md. A fixture correction was needed to persist the story flag through the authoritative campaign save object.

Status: previews ready for choice; no new gameplay HUD applied. Selection and any combined layout remain for Oliver. The approved sequential campaign pass remains open with Hollow Cliffs next. Unrelated companion3d.js/articulated-rigs.json edits excluded.


## [Codex | 2026-10-12] HUD preview feedback — preferences, no rollout

User favors an upper-corner minimap and the paper-style clue cards. HP/mana placement remains undecided. They flag missing equipment comparisons and ask about Skyrim-like navigation/settings and further ideas. Exact feedback and inspected pickup behavior appended to requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md (under docs/). Keep immediate bagging; comparison presentation must not duplicate inventory actions. Recommendation: restore useful loot comparisons, preview independently selectable vitals placement and map/compass modes, and preserve readable notes. These recommendations are not approval for a particular new gameplay HUD. Existing preview and game are unchanged by this discussion. Campaign finishing remains open.

## [Codex | 2026-10-12] U-HUD-BAG-20261012 — visible bag capacity (preview)

User reports unclear overflow sales and proposes a HUD bag icon/capacity count. Add a clearer preview of normal, nearly-full and full states with explicit auto-sale wording and a simulated pickup outcome. Exact source and acceptance checks: requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md (under docs/). Status: preview in progress; live HUD selection remains open. Preserve instant bagging and existing full-bag auto-sale behavior; no new loss-protection policy inferred. Larger HUD redesign and campaign finishing remain open.

## [Codex | 2026-10-12] Bag capacity HUD previews — v2.189.2

Implemented U-HUD-BAG-20261012 in the isolated HUD comparison. All three designs now include a persistent bag icon, labeled used/capacity count, free-slot text, amber near-full warning and explicit red full/auto-sale warning. A bag-state selector and simulated equipment pickup demonstrate the last free slot, overflow sale and gold feedback; the item outcome always distinguishes kept from sold. Clicking the bag (or B) explains the rule; Escape closes that explanation. Current-game comparison disables these sample controls.

Browser verification: 54 layout/screen/situation/capacity combinations, six help-panel layouts, last-slot and repeated-overflow transitions, keyboard help, phone width/full-size scrolling and screenshots. Fixed a laptop spacing overlap. No remaining tested panel overlaps, missing images or preview page errors. Evidence: docs/art-validation/hud-bag-preview-2026-10-12.json and .jpg. Main-game source is byte-equivalent after normalizing VERSION3D; no inventory, save, sale-policy or gameplay HUD implementation changed. A fresh first-tutorial character in the old build did not establish a saved mode, so that attempted old-save check is not counted as a successful compatibility test.

Preview ready for review at /design/hud-preview/?design=b&scene=clue&bag=full. Full HUD rollout, equipment comparison redesign and navigation/vitals selection remain open; earlier proposals have not been silently applied. A buyback/recovery safeguard for overflow items would require a separate policy decision. Campaign finishing remains open. Unrelated companion3d.js and articulated-rigs.json changes excluded.

## [Codex | 2026-10-12] U-CLASS-SKINS-20261012 — next after HUD

User requests a major improvement to unlockable class skins, reporting widespread clipping and weak visuals, explicitly after finishing the HUD update. Queue a full earned-appearance quality pass across every class/tier next, ahead of returning to campaign finishing. Exact request and acceptance scope: requirements/USER_SOURCE_2026-10-12_CLASS_SKIN_REWORK.md (under docs/). Preserve rank-5/rank-10 unlocks, distinctive class palettes/details, cosmetic-only behavior, Stylist access, per-class saved selection and rank-10 cheat unlocks. Review motion, weapons/capes, previews and co-op appearances; previous static/gallery verification did not prove full animation clearance. Status: approved/queued, not implemented. HUD selection/rollout remains unfinished and takes precedence.

## [Codex | 2026-10-12] Adventure HUD selected — U-HUD-ADVENTURE-20261012

Apply Adventure Focus to the live game with bottom-left bag/loot, explicit auto-sell OFF/ON, protected full-bag ground loot, top-left skill mana costs and current binding prompts. This supersedes preview-only scope and unconditional overflow sales. Exact requests and source-grounded implementation/validation plan are appended to requirements/USER_SOURCE_2026-10-12_HUD_PREVIEWS.md. Status: implementing. Skin overhaul remains next; broader campaign work remains open.


## [Codex | 2026-10-12] U-HUD-ADVENTURE-20261012 complete

Adventure Focus is applied in v2.190.0 with bottom-left bag/equipment comparisons, explicit default-OFF auto-sell and full-bag loss protection, paper notes, upper-left mana costs and current binding labels. Local browser, old-save, inventory/chest boundary and all-class mana checks passed. See docs/requirements/CONTINUITY.md and docs/art-validation/adventure-hud-2026-10-12.json (repository paths) for scope and limitations. Earned-skin overhaul remains next; this does not mark that art work complete.


## [Codex | 2026-10-12] U-CLASS-SKINS-20261012 implementation underway

HUD is complete. Latest user explicitly requests the earned class-skin overhaul now and an accessible preview when finished. Preserve all rank gates, per-class saved choices, Stylist-only equipping and cosmetic-only stats. Grounded renderer/design plan: docs/design/CLASS_SKINS_2026-10-12.md. Source: docs/requirements/USER_SOURCE_2026-10-12_CLASS_SKIN_REWORK.md. No implementation or visual acceptance claimed yet.


## [Codex | 2026-10-12] Earned class wardrobe complete locally — v2.191.0

U-CLASS-SKINS-20261012: rebuilt all 34 earned appearances across 17 classes. Default appearances, rank 5/10 gates, Stylist-only equipping, per-class saved selection and cosmetic-only stats remain. Fitted armor now follows the appropriate torso, arm, leg and head bones from bind-pose matrices. Added shaped layered plates, veined leaves, curved horns, embroidered fabric, metal inlay and class-specific ornaments; separate broad armor and trim palettes preserve color variety. Mage retains orbiting stars; Paladin stays ivory/light gold. Batched detail costs at most 5,576 extra triangles and 36 meshes per outfit, with no added lights.

The real-model wardrobe is at /3d/class-skins.html, linked first in title > Dev Previews and from the Stylist. Compare Default / Rank 5 / Rank 10, focus an outfit, rotate/zoom, try animations, weapons and capes, switch lighting or freeze ornaments. The gallery does not load or change character saves. Actual in-game preview testing caught and fixed cloned emissive-color metadata turning Stylist bodies black; default material/pad restoration was also verified.

Verification: 51 class/tier combinations, 13 sampled animations each (3,978 frames), 129 state/Stylist checks, 51 simulated-peer render checks, old-save compatibility, bag/Stylist visual inspection, and 390px responsive gallery verification. Evidence and explicit limitations: docs/art-validation/class-wardrobe-2026-10-12/summary.json. No live second-device network or physical phone session; representative weapon/cape views are not an exhaustive no-clipping guarantee. Visual acceptance by Oliver remains open. This completes the skin implementation pass, not the outstanding campaign finishing work. Unrelated companion3d.js and articulated-rigs.json changes are excluded. Commit/deployment verification follows.

# U-TUTORIAL-HUD-20261012 — refresh onboarding after HUD/wardrobe changes

Update beginner tutorials and reference help to current controls, mechanics and Adventure HUD. Replace sloppy HUD arrows with accurate, readable, responsive callouts. Preserve safe core-control practice, nonblocking information, skips and completed tutorial saves. Exact source and inspected plan: `requirements/USER_SOURCE_2026-10-12_TUTORIAL_HUD.md`. Implemented in v2.192.0; behavioral and visual verification recorded in `art-validation/tutorial-hud-2026-10-12/summary.json`. Physical controller and novice playtests remain open.


## [Codex | 2026-10-13] Campaign finishing resumes: Winding Cliffs

Latest user: “Ok what’s next? Keep working”. Resume U-GEO-20261012 after the completed HUD/wardrobe/tutorial priorities. Inspected source-grounded scope and acceptance plan: docs/design/HOLLOW_JOURNEY_2026-10-13.md. Preserve map scale and existing rewards/story; improve the freight-road readability, bridge approach/animation collision, real winch placement and current objective guidance. Lost Canyon and later stages remain open. Implementation in progress; not verified or shipped.


## [Codex | 2026-10-13] Winding Cliffs finishing pass — v2.193.0

Implemented the next campaign pass after Briar. Winding Cliffs keeps its 4,490 × 5,650 map bounds, original elevations, cargo climb, ridge/rope route, encounters and rewards. Added a joined worn freight road and five destination signs; reused the detailed wagon model, removed loose bridge-approach blocks and moved a supply crate out of the route between controls. The detailed winch is at its functional handle. A newly lowered bridge gains collision when its animation settles; previously completed saves restore it immediately.

Early-found transport orders now start the trail. The tracker reports remaining lookout guards and then the available lift; navigation points at the required guards while preserving the quiet high-route option. Transient obsolete cart/winch messages clear without removing journal clues. Refreshed the corresponding blueprint from actual initial-state geometry.

Also fixed a shared renderer ownership bug: multiple scenery imports used different cache keys for the crafted-model module, so an idle copy could overwrite the active has-model API and cause primitive fallback geometry to draw over detailed models. The active scene now publishes its own registry. Verified ownership in all eight campaign entry regions.

Checks: main route plus 91 optional-route waypoints using actual movement/collision; a rendered continuous bridge mistake/recovery/crossing sequence; ten host/guest assertions using the real handlers over a local relay; pre-change partial/complete bridge saves with character/class XP and gold retained; story, bridge timing, navigation and syntax checks. Evidence and limitations: docs/art-validation/hollow-journey-2026-10-13/summary.json. Enemies were stunned during route verification; no full combat playthrough, public-network session, low-end performance claim or human fun/novice-comprehension verdict.

Next: Lost Canyon and the remaining campaign finishing sequence. No custom SFX or unrelated companion changes. Deployment confirmation follows.


## [Codex | 2026-10-14] Lost Canyon finishing pass authorized

Latest user: “Go ahead” (repeated), approving the announced next campaign pass. Grounded plan: docs/design/LOST_CANYON_JOURNEY_2026-10-14.md. Preserve existing large scale, entry choices, signal/freight climbs, north escort and rewards; improve actual navigation, route readability, cage solidity and gate access. Source baseline 10ba0309. Implementation and visual verification pending; not full campaign completion.


## [Codex | 2026-10-14] Lost Canyon finishing pass — v2.194.0

Implemented the authorized next campaign pass at its original 5,890 x 6,160 scale. Joined service roads and six signs connect the yards. Detailed barred cages now have solid sides; roads approach their doors, the north escort clears its turn, and the cave return meets the road before the escape gate. Forced-entry guards spawn on the accessible ramp. Guidance follows Ward, blocking guards, the scaffold entrance, escort proximity/combat and the escape route. The signal uses a detailed winch, a clear standing space, a visibly cut cable and stateful lanterns. Fixed sign-post overlap with text. The corresponding blueprint captures final initial-state collision and the actual climb/escort paths.

Verified physical entry routes and branches, both optional climbs, a continuous normal-camera missed-jump/recovery/retry, live prisoner damage and escort failure/retry, final gate traversal, a genuine 10ba0309 partial save with character/class XP and gold preserved, and 16 host/guest assertions over a local relay. Winding Cliffs art still mounts correctly. Relevant unit/syntax checks pass; browser error logs are empty. Evidence and limitations: docs/art-validation/canyon-journey-20261014/summary.json. This is not a full combat or public-network playtest and does not establish human enjoyment.

Next campaign finishing area: Ruined Keep — Broken Walls, then the remaining campaign sequence. No custom SFX or unrelated companion edits. Deployment confirmation follows.


## [Codex | 2026-10-14] Broken Walls finishing pass authorized

Latest user: “Okay go ahead and work on that.” Continue the announced next campaign finishing area: Ruined Keep — Broken Walls. Preserve scale, current story/rewards and meaningful optional routes. Grounded scope and verification plan: docs/design/BROKEN_WALLS_JOURNEY_2026-10-14.md. Implementation in progress, not verified or shipped. Later campaign stages remain open.


## [Codex | 2026-10-14] Broken Walls finishing pass — v2.195.0

Retained the 4,290 x 5,580 fortress and its existing story, enemies, rewards and optional climbs. Added joined stone route paving, six destination signs, an escape lane, a bronze bell, a corded ballista, a gate wheel and a workshop dial whose green sector matches the real latch window. Guidance now identifies the arrow stair and living guards, rescue retreat/remaining attackers, and both prison-entry choices. Wave markers use the actual next spawn. Gate/latch feedback describes the result, and superseded transient notices clear while journal clues remain.

Six decorative towers now have collision. Physical testing exposed a tower inside the battlement stair; moved the matching pair from X +/-720 to +/-930. Normal-camera inspection also moved supply props out of the walking lane and decorative columns clear of the ballista and wheel. Refreshed only blueprint 2-0 from captured initial geometry; all other maps and the historical footprint remain intact.

Verified 40 main-route and 136 optional-route waypoints plus chamber traversal, live prisoner damage/failure/retreat/retry, both key/wheel exits, five continuous workshop checks, six tower collisions, 13 host/guest assertions using real handlers over a local relay, and a genuine b4fbfa47 partial save preserving name, gold and both XP systems. Relevant source/syntax regressions pass. Evidence and precise limits: docs/art-validation/keep-journey-20261014/summary.json. This is not a human fun/novice-comprehension verdict, Internet session or full combat/performance playtest.

Next: Ruined Keep — Dungeons, then remaining campaign halves. No custom SFX or unrelated companion edits. Deployment confirmation follows.


## [Codex | 2026-10-14] Dungeons finishing pass authorized

Latest user: “Go on.” Continue the announced next campaign finishing area: Ruined Keep — The Dungeons. Preserve the 4,600 x 5,850 footprint, current story/rewards and optional press/drain routes. Grounded scope and verification: docs/design/DUNGEONS_JOURNEY_2026-10-14.md. Implementation in progress; not verified or shipped.


## [Codex | 2026-10-14] Dungeons finishing pass — v2.196.0

Retained the 4,600 x 5,850 level, story/reward IDs and optional press/drain routes. Added floor-aware guidance, four framed signs, clipped stone route inlays, a covered hinged service door, detailed gates, a visible cell-lock lever/keepsake bundle and the existing rare chest model. The release gate now meets full-height side walls; a barred eastern holding-room exit opens with the existing cell lock. Prisoner arrival paths avoid the drum and unsupported corners. A deliberate initial turn selects winch direction instead of tiny approach inertia. Independent host conversations no longer stop the shared rescue/lift. Removed the extra hardcoded E and clear superseded transient clues while retaining journal notes.

Verified 55 main-route waypoints, 86 drain waypoints, 40 lower-works waypoints, live press damage/brake/water recovery, five release-gate lanes, the holding exit before/after release, 3,204 supported prisoner positions without collision, a continuous normal-camera lift mistake/lowering/retry/ascent, and 18 host/guest assertions through a local relay. A genuine 6360c7df partial save retains name, 983 gold, character level 12 / XP 87, Warrior rank 7 / XP 169 and quest flags. Relevant unit and syntax checks pass; final browser errors are empty. Only blueprint 2-1 was refreshed; other 15 maps and historical footprints are unchanged.

Evidence and precise limits: docs/art-validation/prison-journey-20261014/summary.json. Automated traversal is not a human fun/novice-comprehension or full combat/performance verdict; the co-op test is local, not an Internet session. Next campaign area: Frostfell — Snowbound Peaks. Deployment confirmation follows. Preexisting companion/articulated-rig work remains untouched.


## [Codex | 2026-10-14] Finish every remaining campaign area

Latest user: “Don’t stop till you’ve done this process for all the remaining levels.”
Continue the established campaign journey finishing pass across both halves of Frostfell, Emberdeep, Storm Coast, Sunspire and Castle Duskmoor (ten halves). Preserve original bounds, story/reward identifiers, optional routes, meaningful hazard gaps and detailed existing assets. Improve authored wayfinding, route presentation, mechanism access and any defects exposed by actual traversal. Verify each area, saved progress and local co-op; do not stop after a single half. Source baseline fc6e6e24. Grounded plan: docs/design/REMAINING_CAMPAIGN_JOURNEY_2026-10-14.md. Work in progress; no completion or playtest claim.


## [Codex | 2026-10-14] All remaining campaign journeys finished — v2.197.0

Completed the pass across Snowbound Peaks, Deep Ice Caves, Iron Halls, Great Furnace, Shipwreck Shore, Thunder Cliffs, Palace Courtyard, Sky Library, Castle Gates and Long Ascent. Added 48 fitted, framed, double-sided destination signs and floor-clipped regional route surfaces; kept existing full-size maps, story/rewards, detailed assets and deliberate hazards. Guidance follows the tower’s current storey and required cornice ledges, identifies the lower library latch and remaining required guards. The ice crossing now describes its concrete result. The blueprint coil location is corrected to Heath’s shelter.

Physical/visual checks moved new posts away from the ice rescue return, castle store return, unsupported cliff/terrace edges, Otto’s boat and Abe’s shelter. All new posts have supported footing and clear wall access. Unified the shared rendering module versions after a clean reload caught a split asset pool. Refreshed only the last ten initial-state blueprints; first six records, all bounds and historical footprints remain unchanged.

Verified 808 route waypoints, six cornice landings, 92 returned quest assertions, five continuous normal-camera mistake/recovery sequences, two coastal entrance walks, 61 host/guest assertions through a local serialized relay, and ten genuine fc6e6e24 saves preserving names, 983 gold, character level 12 / XP 87, Warrior rank 7 / XP 169 and quest flags. Fifteen logic suites and 24 source/import-map syntax checks passed. Inspected ten rendered junctions. Scope, evidence, resolved failures and browser caveat: docs/art-validation/remaining-journey-20261014/summary.json.

This finishes the remaining-area process requested in this turn. Automated traversal is not a human pacing/fun/novice-comprehension, full combat or low-end performance verdict; local relay testing is not an Internet session. No new custom SFX. Unrelated companion and articulated-rig edits remain untouched and unstaged. Deployment confirmation follows.


## [Codex | 2026-10-14] Campaign combat and boss readiness authorized

Latest user: "Ok keep building", accepting the proposed next combat/boss readiness pass, followed by campaign progression, performance and co-op checks. Begin with all eight campaign boss encounters at normal health and representative legal starter-class gear. Inspect actual attack/warning geometry, attackability, special mechanics, defeat/retry and reward/exit flow. Preserve current story, difficulty intentions and full-size campaign geography. Fix demonstrated defects; do not infer fun or difficulty acceptance from automation. No custom SFX or unrelated companion changes. Grounded implementation and verification plan: docs/design/CAMPAIGN_COMBAT_READINESS_2026-10-14.md. Baseline 969ce1a9. In progress, not shipped.


## [Codex | 2026-10-14] Campaign boss readiness — v2.198.0

Fixed reproduced co-op targeting errors in the Brute, Marksman, Ember Colossus and Hydra using a shared same-area living-player selector across all eight authored encounters. Dormant bosses now wake for a guest who arrives before the host; the Brute, Marksman and Fallen previously waited for the host. Hydra attacks now follow the existing regional/difficulty boss damage curve rather than inheriting ordinary restraint-entity damage; no extra co-op damage multiplier, HP change or attack-timing change was added.

Verification: 24 ordinary-health first-hit cases, 24 active-target starter-weapon reach cases, 48 party targeting cases, 15 guest-arrival cases, eight actual death-screen retries retaining earned growth/gold, 41 staged completion/reward assertions, 40 local serialized host/guest assertions and a genuine 969ce1a9 save reload. All eight encounter suites plus 146 pure target cases pass. The Hydra sample hit rose from 10–12 to 54–55 against normal level-20 gear/health. Brute and Hydra normal-camera attack sequences were observed. The final orb gate and both King phases remain intact; Ian’s Blade never replaces the equipped weapon.

Evidence and testing limits: docs/art-validation/combat-readiness-20261014/summary.json. These are staged encounter/regression checks, not a full fresh campaign combat run, human fun verdict or public-network/hardware benchmark. Next: ordinary campaign combat and fresh-save progression. Preexisting companion3d.js and articulated-rigs.json edits are untouched. Deployment confirmation follows.


## [Codex | 2026-10-14] Fresh-character combat and progression continuation

Latest user: "OK keep going please." Continue the announced ordinary-combat and new-character progression pass after v2.198.0. Inspect all three starter tutorials, earned skill choices, early campaign enemies/rewards, return/reload behavior and boss-entry readability. Preserve established difficulty, story and geography; fix demonstrated defects rather than adding new systems. No custom SFX or unrelated companion/rig changes. Grounded plan: docs/design/FRESH_CHARACTER_READINESS_2026-10-14.md. Baseline d260c6d9. In progress.


## [Codex | 2026-10-14] Fresh-player progression readiness - v2.199.0

Recovered missing earned class choices after reload, prevented stale choices after class switches, and kept queued upgrades from interrupting live menus or downed/dead state. Invalid legacy choice IDs can be chosen again; stored skills/passives require their earned rank. Multi-rank rewards now retain the first-skill lesson. Healthy checkpoints restore effective HP from the protected loadout and earned growth. Boss intros and tactical advice use one side-journal note, with concise existing canonical encounter facts instead of superseded dream/sleeper text.

Verified all three starters against six isolated authored tutorial foes each, third-kill rank 2, retained skills at the hub, 24 ordinary campaign damage exchanges, interrupted/multi-rank/class-switch/menu/retry paths, a genuine pre-change save, 8 local host/guest assertions and 2,873 rank/choice checks across 17 classes. Relevant boss, journal, story and syntax regressions pass. Rendered the recovered choice screen and unobstructed boss-entry advice. Evidence and exact limits: docs/art-validation/fresh-progression-20261014/summary.json. Staged combat does not establish a full fresh campaign, human fun/pacing or Internet/hardware performance. No global difficulty changes.

Next: equipment/reward clarity and full-inventory interactions, followed by continuous early-campaign play and performance. Deployment confirmation follows. Preexisting companion3d.js and articulated-rigs.json changes remain untouched.


## [Codex | 2026-10-15] Loot, inventory and early-player continuation

Latest user: "Continue", following v2.199.0 and the announced loot/full-bag then early-campaign checks. Inspect and fix demonstrated loss, transaction, feedback and save defects. Preserve U-HUD-ADVENTURE-20261012: default-OFF explicit auto-sell, immediate bagging, untouched ground equipment at full capacity, quest pickups independent of gear capacity, and current binding prompts. Keep campaign geography, difficulty, story outcomes and custom SFX unchanged. Baseline 4d8637bd. Grounded plan: docs/design/LOOT_READINESS_2026-10-15.md. In progress.


## [Codex | 2026-10-15] Loot safety candidate prepared; browser verification pending

Local candidate v2.200.0 unifies Quartermaster direct/Compare purchases around bag delivery, validates before spending, preserves the existing paid relic claim and checks replacement storage before purchase/reforge. Added bag access/capacity to shopping, named blocked-ground-loot comparisons, and immediate notice updates after collecting the same item. Chest warnings leave unopened contents hidden. The prior comparison loss was reproduced with the actual transaction functions under a DOM adapter.

Passed 22 transaction/pickup/chest checks, 6 presentation queue checks, the existing 200,000-sample chest-table suite and six syntax checks. These are not browser or full-engine integration results. Browser selection reported "No browser is available"; documented troubleshooting returned no connections. Asked the user to open a Browser tab while continuing independent implementation. The app queued the local preview for this thread. No live deployment was made; production remains the last verified v2.199.0.

Resume from docs/art-validation/loot-readiness-20261015/summary.json and docs/design/LOOT_READINESS_2026-10-15.md. Real-browser visuals, genuine pre-change save, co-op loot checks and continuous early play remain. Local preview: http://127.0.0.1:4358/3d/.qa-loot-current.html. Owned server PID 20456 is intentionally retained for that queued preview; generated QA pages are untracked and must not ship. Preexisting companion3d.js/articulated-rigs.json changes remain untouched.


## [Codex | 2026-10-15] Browser restored; loot safety verified - v2.200.0

Recovered the in-app browser by activating this chat through the app navigation tool. No user presence, plugin repair or settings change was needed. Chrome was also reopened, but did not reconnect.

Real-browser tests reproduce the old Compare purchase loss and verify safe full/last-slot purchases, bag-management return/retry, genuine v2.199 save loading, blocked/collected/sold feedback, mixed pickups and chest capacity/retry. Ten local host/guest assertions pass for independent inventory, auto-sell and personal chest claims. A short campaign/menu/save smoke found the Pause button covered by the camera-drag layer; raised it above controls and verified mouse operation at 1280x800, 960x640 and 390x844. Return to Hub / Title / Continue preserves the saved hero.

Evidence: docs/art-validation/loot-readiness-20261015/summary.json. Earlier 28 logic checks and chest rarity sampling remain valid. Captures are low resolution, so this is layout/function verification, not art approval or a full fresh campaign. Local relay co-op is not Internet latency testing. One parent-harness observer error is documented; individual game collectors and standalone gameplay were clean. Ready for publication; deployment confirmation follows. Unrelated companion3d.js/articulated-rigs.json edits untouched.


## [Codex | 2026-10-15] Loot safety deployed - v2.200.0

Published gameplay commit 36738c0c to main. Cloudflare Pages reports success; the production browser displays v2.200.0-loot-safety with adventure-hud.css?v=2200 and no warning/error entries. No production save was opened. Deployment evidence: docs/art-validation/loot-readiness-20261015/deployment.json and production-browser.json. Owned local server and five generated QA files are removed, temporary viewport reset, and the surviving browser tab points to the live release. Unrelated companion/rig changes remain untouched.


## [Codex | 2026-10-15] Continuous first-session test authorized

User: "OK try that out." Run ordinary controls from fresh character creation through tutorial, hub, Briar Town and the first boss, then save/return. Investigate clarity, progression, actual performance and relevant co-op continuity; fix demonstrated defects. Plan: docs/design/FIRST_SESSION_JOURNEY_2026-10-15.md. Baseline 1cfb5534. Keep a continuous run distinct from staged tests, retain difficulty/story/map scale, and preserve unrelated companion/rig changes. In progress.


## [Codex | 2026-10-15] Continuous first-session findings - v2.201.0

Ran a fresh Warrior with ordinary keyboard/mouse controls through creation, tutorial, hub tour/reload, both Briar halves, the physical mill puzzle, ground signal route and two Brute attempts. No teleports, boosted stats, enemy disabling or direct simulation calls in the continuous run. Both boss attempts ended in death; retry and hub/title/reload retained level 2, rank 3, Cleave, Heavy Hand, 270 gold and the allocated Attack point. Boss victory, novice balance and full-campaign readiness remain unverified.

Fixed two demonstrated issues: persistent journal cards kept obsolete task text in front of newer discoveries, and the one-time skill lesson flag was not serialized, repeating Cleave after reload. Current notes now revise in place; newest arrivals appear immediately with an explicit Next note button for earlier unread cards. Superseded Briar supply instructions leave the HUD queue without deleting journal history. Existing skill/dash lesson flags now persist with tutorial settings.

Verified rendered request/delivery and exact-entry journal access, genuine old-character loading, real lesson-flag reload and staged later skill/passive selection. Seven production story-packet receiver checks cover late join, revised notes, duplicates, stale revisions and independent reading in two local worlds. Journal, mill, puzzle and class regressions pass, including 2,873 class checks and actual settings serialization. Evidence: docs/art-validation/first-session-20261015/summary.json. Observer frame p95 samples were about 5.7-16.6 ms; an unexplained 1,050 ms outlier prevents a blanket hitch-free claim. No geography, difficulty, story outcomes or SFX changed. Unrelated companion/rig edits untouched. Deployment confirmation follows.


## [Codex | 2026-10-15] First-session fixes verified live - v2.201.0

Gameplay commit 2b2ca8dd is on main. Cloudflare deployment 9a30ca86-cc7e-4d80-97de-5715c8548b16 succeeded; the production browser displays v2.201.0-first-journey and the updated journal/Briar/HUD asset versions, with no warning/error entries. No production save was opened. Owned local test server and both generated QA pages are removed; owned test tabs are closed. Evidence: docs/art-validation/first-session-20261015/deployment.json and production-browser.json.

The continuous normal-difficulty run finished both Briar halves but did not defeat the Brute in two attempts. Next review should examine the first boss and early equipment/reward experience using earned builds, distinguishing automated input limitations from demonstrated tuning problems. Human novice pacing/fun and target-device performance remain open. Existing companion3d.js/articulated-rigs.json changes remain untouched.


## [Codex | 2026-10-15] First boss and early equipment review authorized

U-FIRST-BOSS-20261015. Exact user message: "Go ahead with that next review". Review the Brute fight and the equipment reachable before it; fix demonstrated balance/guidance problems and test. Affected requirements: EQ-09, FX-02, BOSS-01/02, loot safety and retained campaign earnings. Plan: docs/design/FIRST_BOSS_REVIEW_2026-10-15.md. Preserve the real v2.201-era character, normal combat and existing story/map/tutorial scope. Automated failure alone is not evidence for a boss nerf. In progress.


## [Codex | 2026-10-15] First-boss and early-equipment review - v2.202.0

U-FIRST-BOSS-20261015 implemented and locally verified: paid common starter-family upgrades; accurate cover-stopping charge marker; current-binding attack cues; ground-wave retry advice; isolated boss HUD state. Evidence and limits: docs/art-validation/first-boss-20261015/summary.json. No boss stat nerf or new mandatory reward. Human novice balance remains open. Deployment confirmation follows.


## [Codex | 2026-10-15] U-FIRST-BOSS-20261015 published

Verified live as v2.202.0-first-boss, gameplay commit c65a1ff7. Deployment and browser evidence are recorded in docs/art-validation/first-boss-20261015/. Human novice balance and remote latency remain outside this verified scope.


## [Codex | 2026-10-15] Hollow Pass new-player review authorized

U-HOLLOW-REVIEW-20261015. Exact user request: "Ok keep going with the next review into Hollow Pass. Do a long work session and fix anything that could confuse or frustrate new players. Don't waste usage." Review the earned Brute victory/exit, hub unlock, Winding Cliffs, Lost Canyon and the Marksman approach. Preserve the existing large layout and canon. Use real-browser movement/interactions and relevant save/co-op regressions; distinguish map-assisted or staged probes from human novice playtesting. Plan: docs/design/HOLLOW_PASS_REVIEW_2026-10-15.md. Baseline 7beba2d0. Unrelated companion3d.js/articulated-rigs.json edits stay untouched. In progress.


## [Codex | 2026-10-15] U-PROMO-20261015 — shareable current-build poster

User: "Please create a set of screenshots as if it were a piece of promotional material for the game. I want to show it off in its current state to a friend"
Follow-up: "Yeah, and if you can put the screenshots together as if it was like a promotional piece, like pamphlet or brochure. I don't know if that's the right terminology, or poster for the game, with just like a description of, basic description of the game. I don't know, something like that, which would be cool. Something I could just text him over in a screenshot."

Create a single portrait image with authentic current-game screenshots, a short accurate description and play link; also supply the original captures and a phone-friendly gallery. Camera staging and hiding the HUD are photographic preparation, not new assets or evidence of gameplay balance. Do not replace gameplay images with generated concept art. This interrupts the Hollow Pass review for a shareable deliverable; that review remains in progress, not completed.

## [Codex | 2026-10-15] Hollow review resumed after poster

User: "Ok continue on what you were doing before the poster". Resume U-HOLLOW-REVIEW-20261015 using the existing grounded plan. Poster/gallery verified live; this is gameplay review again. Earned Brute victory, normal exit and hub unlock succeeded. A test-driver camera-space error caused an off-route fall; recorded separately from product behavior and corrected before route review. Demonstrated candidates: Waystone approach interaction radius, canyon fall incorrectly named lava, mandatory alarm wording, and stale or poorly linked quest clues. No broad difficulty or map replacement. In progress.


## [Codex | 2026-10-16] Hollow guidance bounded release - v2.203.0

Implemented cart/bridge timing and clue guidance, completed rope-note repair, required alarm/player escort explanations, locked-object feedback, Waystone reach and canyon fall attribution. Targeted logic/syntax checks pass. Prior rendered fixtures cover gate/cage collision, all alarm/freight jumps, continuous missed-jump recovery, live prisoner damage/failure/retry, 16 local host/guest checks and an old partial-save load (level 10, rank 6, 913 gold and flags retained).

The earned Warrior reached north escort wave 1, then rank-5 passive selection paused the driver at 20% rescue progress. Last persisted evidence: canyon-alarm-earned.json. Full scope, fixture corrections and test limits: docs/art-validation/hollow-review-20261015/summary.json. Browser discovery currently returns no available browser. Remaining: earned escort/Marksman approach, rendered Waystone front interaction and final production browser smoke check. Do not claim the entire review complete or infer novice fun/difficulty. Unrelated companion/rig changes remain untouched. Deployment confirmation follows.

## [Codex | 2026-10-16] U-SFX-STARTER-20261016

User: "Ok I upgraded to Starter. Please check the credits and then generate the most important SFX and put them into the game, replacing the old ones."

Verified Starter, 40,000 credits remaining. Authorized paid SFX generation and game slot replacement; first batch capped at 10,000 credits, no overages or unknown-outcome retries. Preserve originals and generation/license records in repo. Prioritize real existing weapon/mob/reward slots plus selected procedural player cues; preserve saves, volume/mute and fallback. Evidence must separate decoded/signal checks from subjective listening and browser tests.


## [Codex | 2026-10-16] U-PROGRESSION-CELEBRATION-20261016

User: "i also still need you to create some sort of level up animation for class rank up and for player level up, right now its not obvious when either happen, its too sudden of a jolt whent he passive or skill rnak up option come on screen, espcially in the tutorial there was no heads up that that was going to happen, it hsould be visually obivous that our class ranked up and it should trnasition nicely to the option screen  without taking too long. and when the player levels up there should an obivuios visual expericne of it without stoppping gameplay. both kinds of leveling up should have unqwiue sfx"

Approved: distinct short class-rank and player-level celebrations. Class-rank celebration precedes the existing paused choice with a smooth short transition; explain the first choice in the tutorial. Player-level celebration never pauses or slows gameplay. Use the two distinct paid sounds already generated; no further API credits needed. Preserve upgrade choice arming/confirmation and saved progression. Guard stale world/class/death transitions, simultaneous and multi-level rewards, reduced motion, controls and non-interactive HUD overlays. Source checks and interactive preview are not rendered acceptance; production verification gate remains.


## [Codex | 2026-10-16] U-REFERENCE-SKINS-20261016

User approves remaking all three skins for every actual class from the supplied class progression sheet, preserving the six base rigs. There are 17 classes / 51 looks; Rogue is not a class. Use the sheet's red Rogue progression for Ninja. Correct Warrior and Bladedancer defaults into simpler versions of their earned outfits. Warlock must differ from blue Mage and bone/jade Necromancer at every rank: black cherry, rose-copper and ruby pact motifs, no skull crown or green souls. Monk's final is psychic/Buddha-like with saffron wraps, beads and a lavender lotus mandala, not Paladin plate. The Beastmaster wolf is the existing separate companion, never outfit geometry. Other reference designs approved. Preserve rank gates, stored per-class choices, faces, weapons, combat stats and cheat unlocks. This later direction supersedes older preservation of default colors and Rank 5 geometry.

Grounded plan: replace palette catalog for all 51 looks; add compact class-specific starter fittings; reshape earned silhouettes with tier-specific crowns, horns, wings and cloth using the existing bone-fitted renderer. Keep Rank 10 depth-tested bounded auras distinct and reduced-motion aware. Validate real rigs, transitions, gates, budgets and actual browser gallery for all 17 before publishing. A reference interpretation on existing browser rigs cannot reproduce painted illustration detail pixel for pixel. No gameplay or campaign changes in this pass.


## [Codex | 2026-10-16] U-REFERENCE-SKINS-20261016

User approves remaking all three skins for every actual class from the supplied class progression sheet, preserving the six base rigs. There are 17 classes / 51 looks; Rogue is not a class. Use the sheet's red Rogue progression for Ninja. Correct Warrior and Bladedancer defaults into simpler versions of their earned outfits. Warlock must differ from blue Mage and bone/jade Necromancer at every rank: black cherry, rose-copper and ruby pact motifs, no skull crown or green souls. Monk's final is psychic/Buddha-like with saffron wraps, beads and a lavender lotus mandala, not Paladin plate. The Beastmaster wolf is the existing separate companion, never outfit geometry. Other reference designs approved. Preserve rank gates, stored per-class choices, faces, weapons, combat stats and cheat unlocks. This later direction supersedes older preservation of default colors and Rank 5 geometry.

Grounded plan: replace palette catalog for all 51 looks; add compact class-specific starter fittings; reshape earned silhouettes with tier-specific crowns, horns, wings and cloth using the existing bone-fitted renderer. Keep Rank 10 depth-tested bounded auras distinct and reduced-motion aware. Validate real rigs, transitions, gates, budgets and actual browser gallery for all 17 before publishing. A reference interpretation on existing browser rigs cannot reproduce painted illustration detail pixel for pixel. No gameplay or campaign changes in this pass.


## [Codex | 2026-10-16] U-SFX-PRESERVE-20261016

User reports several generated replacements are worse than the originals and cannot audition the whole batch now. Preserve all old and generated files. Restore the existing file/procedural defaults rather than choosing favorites without human listening. Stop blanket replacement. Future authored audio targets distinct missing weapon, class-skill, enemy/boss and interactable event identities; generic fallback coverage is not unique coverage. Technical checks establish valid audio, not artistic superiority. Replacement of an existing favored cue requires a specific listening decision. No additional API spend for this preservation pass. Keep level/rank celebration animations; restore their prior distinct sounds with the other defaults. Inspect actual sound bindings before authoring new named cues.


## [Codex | 2026-10-16] U-CREATOR-VIEW-20261016

User requests a full-character / face close-up choice in the creator, full-character default, lower and centered face framing, and vertical as well as horizontal dragging. Source: draw() forcibly resets face mode/yaw on every edit; toggle handlers do not update pressed state; face framing uses whole-body/weapon bounds; pointer drag tracks only X. Preserve chosen view, yaw and pitch through edits and steps, default full body on open, update accessible toggle states immediately, and allow bounded vertical camera orbit. Fit close-up to the actual stored head frame transformed by the current head bone, independent of weapon/crown bounds. Hide fitted headgear and held weapon only in face preview so facial customization remains visible; restore in full view. Preserve six rigs, facial placement data, saves and gameplay cameras. Verify all starter classes plus UI edits, transitions, mouse/touch cancellation and mobile presentation in the real browser.


## [Codex | 2026-10-16] U-ESC-PAUSE-20261016

User retracts live Esc menus: single-player Esc freezes time. In co-op the paused player remains visible, invulnerable and grey to friends while the shared world continues. Protection lasts through nested pause menus and ends on resume; it is transient, never saved. Earlier live-pause direction is superseded. PvP retains live unprotected menus to avoid extending co-op protection into competitive play. Conversations and directly opened panels retain their existing behavior.

Grounded plan: track the pause session by world identity, stop solo updates before world/social ticks, guard incoming damage and fall hazards, hold the co-op avatar in place, send Paused presence through the existing protocol and desaturate only that rendered actor with temporary material overrides. Preserve saves and normal peer visibility. Test solo/co-op/submenu/resume/world changes, existing saves and actual rendered appearance before release.


## [Codex | 2026-10-16] U-FIRST-ARRIVAL-20261016

User reports tutorial exit audio repeatedly glitching, the old hub flashing before new art, and stale combat/shop messages after the hub tour. Requests the current illustrated opening only after tutorial completion (or skipping practice), removing the old pre-hub story segment; more colorful, beautiful fantasy HUD styling retaining all current features; bestiary inside the Sparring Room.

Source diagnosis: nextStage invokes warp audio again from live background completion menus; loading.js disables its cover in hubtour mode; beginCharacterCreation currently plays origin before class creation while openHub plays a second intro; queued teaching messages carry no world identity, and older hub tips duplicate the new tour. Plan: guard portal transitions outside active play/completed trials; keep loading cover through hubtour until current art is ready; move illustrated origin to first hub arrival and retire the extra intro; discard stale contextual tips and suppress duplicate hub teaching; remove outside bestiary duplicate while preserving its interior desk; add a CSS-only colorful navy/teal/gold fantasy finish without changing HUD geometry or controls. Verify an isolated new-character flow, old save, loading gates, sound dispatch counts, notes, bestiary, desktop/phone HUD and pause regressions in browser.


## [Codex | 2026-10-16] U-HUB-QUEST-CHOICES-20261016

User: "also when npcs in the hub have quests, there should be a ! icon next to the dialouge ioptions that progerss the quest". Add a yellow exclamation badge to available request/turn-in entry buttons and actual accepting/completing dialogue choices. Derive choice marking from authored return_accept/return_finish effects, preserving choice IDs, text, timing, saves and spectator restrictions. Shop actions, lore/news, decline/later and active-quest reminders are not progress choices and stay unmarked. Inspect source metadata before styling; verify the actual hub conversation states in-browser.


## [Codex | 2026-10-16] U-LOOT-REEL-20261016

User requests a less visually invasive slot-machine loot reveal with SFX. Current overlay is up to 720px wide with 140px cards, 3.3s spin and 4.2s result. Plan: compact upper-center ribbon on desktop, tiny strip beneath vitals on phone, shorter 2.1s roll, collapsed result, retained skip/rebound controls and screen-reader result. Add quiet procedural reel ticks on card crossings; move the original chest reward chime to actual reveal instead of layering another replacement. Preserve chest art, old audio assets, probabilities, already-granted item, stash/auto-sell logic and gameplay timing. Ensure skips/queue/world clear stop tick scheduling, reveal sounds once and reduced motion skips rolling. Verify actual chest reward, keyboard skip, reduced motion, mute/volume routing, mobile bounds and old save in browser.


## [Codex | 2026-10-16] U-BRIAR-PERFORMANCE-20261016

User reports severe frame drops in Briar Town first half, Black Woods smoother; settings are defaults. Source diagnosis: all rigged enemies bypass mesh frustum culling and animate across the entire map; world3d imports clearMobs from a different module URL than the renderer, so world transitions do not clear the owning actor pool. Outskirts and craft visibility also parse hundreds of constant chunk strings every frame. Baseline default shoulder view submits 346 Three draw calls / 211,782 triangles at Briar entry in the test browser; this is comparative instrumentation, not a reproduction of the user's hardware FPS. Plan: conservative camera-frustum presentation culling with generous full-height/weapon margins and near-player protection; retain all gameplay enemies/AI/quests, correctly suppress legacy fallback for deliberately hidden models, resume current animation state on return and retain corpse cleanup. Share the owning mob module for scene cleanup. Precompute static chunk bounds and reuse nearest-lamp buffers, preserving draw distance/detail/collision. Verify before/after same views, old-save load, near/far/return, pause and transition behavior in real WebGL. Preserve pending Keep/Reaper work outside the production-safe checkout.


## [Codex | 2026-10-16] U-CAMPAIGN-THREAT-20261016

User: every nearby enemy needs an intuitive red HP bar; basic Mage attacks one-shot Briar and Hollow enemies, and the Briar boss is too easy. Audit of actual Normal damage pipeline: level-3 common-staff Mage hit 39 versus 20-HP grunt; level-6 hit 44 versus 24 HP; starter Warrior/Ranger differ substantially. Existing bars only show damaged enemies except a few named roles. Plan: always show nearby living hostile meters, including full health and bosses; preserve friendly/prisoner bars, make elite fill red, use height-aware cached camera occlusion so markers do not reveal enemies through walls. Keep the renderer performance improvements. Add fixed authored campaign-only health multipliers that rise by zone/half (no player/equipment auto-scaling), modest campaign damage progression and extra early-boss durability. Preserve tutorial/earned trials, sparring, PvP and separate modes; retain 1.6x two-player HP and fraction-preserving party changes. Test actual Normal starter-class breakpoints across campaign, fresh starters, rare gear benefits, boss windows, health-bar wall/height/range cases and old saves. Balance measurements are technical evidence; fun and perceived challenge still require playtesting.


## [Codex | 2026-10-16] U-MENU-CANCEL-20261016

User requests Tab to open/close the bag and Q as universal cancel/exit. Source: bag action only handles play; main Escape menu close searches four IDs and misses Settings/controls/creator and other Back buttons; independent dialogue/inspection/chess/tutorial handlers already support Escape. Q is currently ground-item sell. Plan: early Q→Escape input bridge through the focused target, respecting text entry/modifiers/editor and key-repeat; reserve Q and migrate old Q-only loot-sell binding to free X/Delete, update visible control guidance. Bag action closes the active bag through its existing Back callback, preserving opening context, rebound action support and focus traversal elsewhere. General menu cancel finds visible, non-destructive Back/Close/Cancel/Done buttons without guessing purchases, deletion, quit or retry. Verify bag/pause/nested settings/controls, text input, rebind cancellation, repeat, old bindings and independent modal Escape handling.


## [Codex | 2026-10-16] U-CAMERA-LOCAL-VIEW-20261016

User requests local first-person body invisible except equipped weapon; allies must still see full character. Also adjustable FOV and wheel FOV in first-person, zoom in both other views within bounds. Source: hero3d hides head by scaling bone only; body/class cosmetics remain visible. FOV slider already exists at 70–115 but wheel handler is absent. Plan: draw-local renderable visibility mask preserving weapon attachments/bones and restoring in finally; no replicated/persistent visibility change, portraits/inspection/chess retain full bodies. Legacy fallback must omit hand/arm geometry. Shared bounded camera controls: first-person 70–115°, shoulder zoom .75–1.4, overhead .7–1.5, separate saved settings/default 1. Use optical zoom for third-person, preserving collision-safe camera positions and authored room framing; skip special dialogue/tour/chess/editor/ballista/cinematic views. Wheel only over gameplay, no menu scrolling or browser modifiers, debounced persistence; settings expose active-view zoom/FOV. Verify all modes, bounds, save, body/weapon/peer restoration and old-save load in real WebGL.


## [Codex | 2026-10-16] U-MINIMAP-INSTANT-20261016

User reports delayed/clunky minimap direction and requests real-time turning. Source: guided-tutorial map already draws after the world each animation frame, but applies exponential heading smoothing plus 3.5 rad/sec slew limit. Preserve current camera-relative shoulder/first-person heading and player-relative overhead heading. Read navigation once per draw and use its current finite heading directly; retain marker geometry, player arrow relative heading and edge indicators. No extra throttle, save fields or gameplay changes. Verify actual canvas transforms for abrupt turns, angle wrap, missing heading, peers/objectives and pause/resume; run real WebGL and old-save load.


## [Codex | 2026-10-16] U-HUB-TRANSITION-20261016

User reports hub floor becoming out of bounds, damage and enemies after Hollow Canyon; title temporarily resolves it. Reproduced in real WebGL: queue portal warp then return to hub before its 190ms callback. Unguarded nextArea runs on the NEW hub, loads stage 1 into hub:true, replaces continuous floor (four missing sampled floors), sets bramble, spawns 10 hostiles and loses 34 HP; hub art remains. Normal boss-clear returns were clean. Plan: bind pending portal warp to its original world, portal and district; cancel on hub/area entry, reject stale/dead/menu callbacks; guard hub against nextStage, nextArea and loadArea/loadStage. Check delayed co-op state for cross-scene enemy contamination as adjacent boundary risk. Verify repeated clear/quit/restart flows, pending-warp cancellation, valid portal advancement, old-save/progress preservation and hub walkable footprint/no damage in real browser. Do not alter campaign difficulty or hub art to hide the bug.


## [Codex | 2026-10-16] U-ARMOR-EQUIP-LOSS-20261016

User reports certain armor disappears from inventory without equipping. Real WebGL reproduction: open hub bag from active play, advance to actual 8-second background autosave, then click Equip. openBag captured meta.hero; autosaveRun replaces meta.hero with snapOf(G.p), so handler edits stale HR, splices stash, then fails both HR===meta.hero and HR===G.p synchronization. Item is absent from live, saved and displayed gear. Plan: inventory displays current live actor; equip resolves current actor and selected entry identity at click, rejects changed worlds/invalid slots/rarity/class before mutation, stages cloned loadout and recomputed stats before committing bag and actor together, immediately snapshots hub hero. Apply same live-source correction to Use Class Default. Preserve old-item return/full-bag swap, campaign checkpoint and separate-mode save contracts. Test every equipment slot, weapon/default, delayed autosave, stale entry/index and world change, full bag, locked gear, hub resume/reload, active campaign, co-op and old save. No invented recovery of unknown previously lost items.


## [Codex | 2026-10-16] U-INTERACTION-AUDIT-20261016

User requests thorough major-bug audit after multiple severe new-update regressions. Review actual transaction ownership, saved/live state, timers crossing worlds, menu/pause progression, co-op state and class skill execution. Initial source risks: perk purchase changes only meta.hero while hub autosave overwrites it; refund reconstructs hero without allocation/tunedLevels; forge/gamble rewards arrive only in delayed animation callbacks; death fade is not cleared on ordinary hub return. Build isolated real-WebGL reproductions before changing each. Correct current actor ownership and conservation, commit rewards before decorative animations, cancel disconnected UI callbacks and bind death UI to source world. Run existing save/inventory/menu/tutorial checks, class/skill smoke tests, old save reload and repeated scene flows. Distinguish obsolete test assumptions from game failures. Keep current art/content/balance and separate-mode checkpoint contracts; audit findings and evidence go in docs/art-validation/interaction-audit-20261016. No claim that automated checks prove the entire game bug-free.


## [Codex | 2026-10-16] U-SHOP-CHESTS-20261016

User requests chest purchase rarity unlocked by character level, with significantly increasing prices and appropriate scaling. Source: gear requirements are Common 1, Uncommon 5, Rare 12, Epic 20, Legendary 30; shop weapons cost 60/220/650/1600, Fortune bag 480, socks 1200, secret sense 30000. Plan: Quartermaster chest subpage, visible five-tier color-coded guide; fixed 150/600/2400/9600/38400 gold (4x each tier) using existing rarity level requirements. One random gear item directly into bag, existing BFChestRules odds shown explicitly, bonus higher-rarity gear may need its own equip level. Legendary 100% Legendary. Validate current save generation/world, live character level, capacity and funds at click; reject full bag even with auto-sell on; generate before spending and save gold/reward before reel. Reject detached/repeated purchase buttons; return to shop/bag through existing callbacks, no saved schema changes. Verify boundaries, current/old saved state, no-charge failures, conservation, stale callbacks and real browser desktop/phone. No world chest odds, difficulty, art or existing gold changed.


## [Codex | 2026-10-16] U-DRAGON-RIDE-20261016

User explicitly requests dragon mount and flight. COMP-03 previously approved same-input mount/dismount, strong limited flight, companion fights only dismounted; mounted rider combat unanswered. Asked optional travel-only versus combat question; implement conservative travel-only unless user chooses combat. Source: Sunspire quest-only sunwing owned/equipped companion, existing pet breath, controller Interact, remappable keyboard actions, normal collision/floor, local and replicated 3D rigs. Plan: earned active healthy sunwing only; H remappable mounting plus context E/controller Interact mount/land; Jump hold ascend, release glide, Dodge hold descend, usual move/camera. Eight-second flight stamina, ground recharge, bounded height; grounded safe mounting/dismounting, land-before-interaction, recover to last solid ground if exhausted over void. Outdoor hub/campaign travel only; forbid arenas/trials/challenge modes, caves/library/tower interiors. Preserve walls/closed doors as horizontal flight barriers, normal obstacle/ceiling collision and solid landing. No attacking pet while ridden, no rider attacks pending answer. Distinct seated/reins pose, weapon attachment hiding restored, dragon enlarged only while ridden, flapping and shared peer pose. Riding is transient; save existing growth/loadout only, clear ride on scene changes, death, pet loss/switch, teleport and disallow menu/tour actions from initiating. HUD shows rebound keys/controller hints. Verify stamina/landing/blocked gates, actual inputs/camera/models, old saves and actual multiplayer serialization through controlled handlers; no claim of internet co-op/hardware controller playtest.


## [Codex | 2026-10-16] U-CHESS-SEATING-HISTORY-20261016

User requests chairs and players moved considerably back from table; both players visible and transparent only when blocking board; companion parked beside chair. Flat board must support piece drag/drop, show opponent's previous move and allow live history browsing. Source: human seats at +/-11 overlap 25-wide tabletop, Thomas at21; local chess actor and Thomas fade unconditionally; flat squares use click-only data-flat while pointerDown rejects socialBoard; chess state has no move log. Plan: shared +/-30 seat layout for human/Thomas/chairs, room for knees, wider/higher board camera; camera-to-board ray checks against human torso/head volumes, temporary draw-local alpha only on obstruction, both local/peer actors and Thomas handled without network visibility mutation. Park companion outside chair/table bounds while seated (idle/sit clip where available), restore follow on exit and sync pose. Host-owned compact move log with SAN/color/from/to/FEN and match serial in session snapshot; local history cursor affects only own 3D/flat preview, live clock/game continue; disable moves in review, visible Live return and updates notice, reset on new game. Highlight opponent's most recent origin/destination in flat and world board; reviewed move highlighted during replay. Share flat/world pointer drag path, legal validation/promotion/turn/revision and one click suppression after drag; cancellation, outside drops and updates must not duplicate moves or grab camera on panel. Verify actual human/Thomas seating, board-obstruction views, companion clearance, legal/illegal drags, black perspective, live history while opponent moves, reset/leave/rejoin, castling/en-passant/promotion, clock/pause/co-op and old save. No undo of live match, reward/story or engine strength changes.


## [Codex | 2026-10-16] U-CHESS-SEATING-HISTORY-20261016 verified

Implemented in v2.226.0-chess-experience: +/-34 seats, conditional actor/chair visibility, parked companions, flat drag/drop and click, opponent move highlights and live session-history review. 28 browser assertions, 33 focused checks and 93 offline suites pass. Evidence and testing limits: docs/art-validation/chess-experience-20261016/summary.md. Publication pending.


## [Codex | 2026-10-16] U-THOMAS-HARD-CAPE-20261016

User requests a black-and-white checkerboard cape unlocked only by defeating Thomas on Hard in chess. Plan grounded in existing solo chess authority, class-independent cosmetic wardrobe and cloth renderer: add Checkmate Cape with crisp checker fabric and matching wardrobe icon; locked hint names Thomas/Hard. Award once to active character after a legitimate solo Hard checkmate or time victory against Thomas, either player color. No reward for draws, losses, easier settings, human co-op wins or reviewing a winning position; difficulty already locked after first move. Save through existing character persistence, expose reward hint on Thomas chess panel, preserve existing cape/equipment without auto-equipping. Verify actual checkmate handler, exclusion cases, repeat/reload persistence, wardrobe equip and cloth render from old save.


## [Codex | 2026-10-16] v2.227 — Checkmate Cape

U-THOMAS-HARD-CAPE-20261016 implemented. Black-and-white checkerboard cloth cape with monochrome stitched edging and matching wardrobe SVG. Cosmetic only, no automatic equip. Defeating solo Thomas on Hard by checkmate or a legitimate time victory awards it once, either color; losses, draws, Easy/Medium, human co-op opponents and history review cannot award. Existing pre-move difficulty lock retained. Slot-profile cosmetic flag is written and read back immediately, rollback/retry if storage fails. Thomas chess panel explains the condition and confirms the earned reward; equip at the Stylist. Existing cosmetic ownership and equipped cape preserved. Stateless preview supports ?cape=checkmate.

Verified 30 isolated real-browser assertions with genuine pre-change save: actual legal moves reaching checkmate, Hard loss, Easy/Medium wins, Hard win, visible confirmation, durable profile record, Stylist equip, mode reload, live cloth renderer and unchanged gold. Engine worker deliberately silent for scripted legal opponent moves; this is reward integration QA, not a claim to have beaten the actual Hard AI. 20 focused eligibility/save-failure/idempotency checks plus existing chess regression checks pass; 94 offline suites passed. Preview screenshots inspected on Warrior/Wizard; no production saves touched. Evidence: docs/art-validation/chess-cape-20261016. Publication pending.


## [Codex | 2026-10-16] U-RELIC-DICE-RANDOMIZE-20261016

User supplies Desktop/Ancient Golden-Pip Relic Dice.png and requests it for all randomize features. Found transparent RGBA1254-square original. Source audit finds seven active3D controls: creator face/stats, Stylist face, Arena bot class roll/random bot selection/loadout/random respec. Plan copy exact supplied PNG once, use shared-sized decorative image on all seven, retain visible labels and randomization handlers, add accessible label to icon-only bot-class button. Preserve asset alpha and avoid resynthesis or gameplay changes; verify actual menu rendering/clicks plus creator/style regressions and parser.


## [Codex | 2026-10-16] v2.228 — relic dice randomize artwork

U-RELIC-DICE-RANDOMIZE-20261016 implemented. Exact supplied transparent PNG reused for all seven active randomize controls: character face/stat rolls, Stylist face, Arena bot-class roll/random class/loadout/random respec. Shared30px decorative image,26px icon-only roll, accessible bot-class label, existing visible text and handlers preserved. Old dice emoji removed from randomization toasts. No random-generation/economy/save behavior changes. Original and copied SHA256 match FC646ADFB8BDCC17D368EB4ECB1EBE52FF9A1F9374816E689EE3700F0E054BD9.

Actual browser menus from isolated pre-change save: all seven images complete/natural width1254, all seven buttons clicked; Random Respec confirmation retained. Creator14-handler checks, face option bounds/randomization, Stylist purchase validations and game inline parser pass. Screenshots inspected. Evidence: docs/art-validation/relic-dice-20261016. Publication pending.


## [Codex | 2026-10-17] U-LEGACY-SAVE-LOCKOUT-20261017

User reports opening a very old level100 save locks the game and refresh cannot recover; explicitly authorizes deleting current saves if needed. Priority hotfix before pending campaign quests/dialogue/stairs. Do not assume level100 itself is invalid: retain legitimate high-level snapshots, normalize malformed container/numeric data before slot previews and mode migration; remove null/nonobject stash entries. Add engine-independent save recovery page and startup-error escape, no dependence on crashed game. Recovery clears only Bladefall saves on that browser, including legacy keys, invalidates all three slot generations so old tabs cannot restore wiped data, no server-wide wipe of other players. Verify malformed JSON/null/primitive/wrong-shaped profiles, bad numeric snapshots, validlevel100, refresh/title and creating new character after reset. The requested farming/dialogue/stair work remains active after hotfix.


## [Codex | 2026-10-17] v2.229 — legacy save recovery

U-LEGACY-SAVE-LOCKOUT-20261017 implemented. Normalize malformed save roots, containers, null inventory entries, item affixes, class records and nonfinite player numbers before slot previews and migration; retain legitimate level100 characters. Unknown class falls back safely. Standalone /3d/recover.html clears this browser's Bladefall character/dungeon/legacy saves and invalidates stale-tab generations. Title and startup-error recovery links do not require a running game. No global player wipe.

95 offline regression suites passed, including24 new save normalization/reset checks. Real browser reproduced null-stash crash on a modified genuine pre-change level100 save; repaired same fixture loads into hub with finite HP and level100 intact. Standalone reset verified only against isolated disposable storage. Exact user save was not inspected; recovery link covers other malformed legacy states. Evidence: docs/art-validation/save-recovery-20261017. Publication pending.


## [Codex | 2026-10-17] U-ADDITIVE-SFX-20261017

User authorizes further ElevenLabs credit use for missing game sound effects. Preserve the Oct16 correction: keep all existing original audio, add distinct absent event cues, no unreviewed replacement bank. Source audit: Pyromancer's8 dedicated SKILL_FX implementations and pyroShot/pyroArea have no cast audio. Generate8 short isolated nonlooping identity cues, one per actual skill ID (py_bolt,py_fan,py_blast,py_ward,py_lance,py_nova,py_inferno,py_sun). No original candidate matches the specific eight identities; generic fire files remain unchanged. Route once after successful root useSkill refund gate, no sound on rejected, cooldown-blocked or unlearned casts; fan emits once rather than per projectile and Inferno once rather than per pulse. Use existing effects bus/mute/normalizer; short tails and restrained volumes. Preserve raw masters, request cost/provenance, processed derivatives and audition page. Hard local generation cap2000 credits; no unknown-outcome paid retries or overage. Check paid plan/balance, finite signal/decoding/onset/peaks, loader failures and actual browser cast routes with pre-change save. Listening taste remains unverified by signal tests.


## [Codex | 2026-10-17] v2.230 — eight missing Pyromancer cast cues

U-ADDITIVE-SFX-20261017 implemented for Firebolt, Cinder Fan, Backdraft, Ember Shield, Flame Lance, Flame Ring, Inferno and Sunburst. Eight new named slots; all old files/definitions/procedural methods untouched. Cast dispatch is after the successful root refund gate: fan one cue rather than3, Inferno one rather than repeated pulses, rejected/cooldown/invalid casts silent. New files use existing effects bus, mute, level normalization, restrained prominence and existing fire fallback if unavailable.8 runtime files total7.56 seconds, max measured peak.739; untouched provider masters and provenance retained, separate mobile audition page.

Starter verified,39,443 available reported before generation;8 response billing headers total75 credits. Subscription count had not updated at final query, so balance is a delayed provider reading, not assumed zero cost. No overage or purchases.96 offline suites pass including66 new identity/cast/asset checks and255 original-sound preservation checks. Real browser from isolated pre-change level100 save decodes all8 and executes each actual skill with exactly one routed cue/cooldown (controlled unobstructed target); prior blocked-Sunburst test had0 cue and0 cooldown as intended. Browser testing muted, no claim of subjective sound quality or two-device co-op verification. Evidence docs/art-validation/pyromancer-audio-20261017; listen at /sfx/custom/pyromancer-20261017/. Publication pending.


## [Codex | 2026-10-17] U-HEADWEAR-TUNING-20261017

User approves body armors and themed auras, requests localized headwear correction: Warrior/Paladin default bare heads; Ranger all tiers preserve original detailed hood, remove overlapping round back-shell on Ranger/Ninja/Warlock/Bladedancer/Reaper; preserve liked masks, Necromancer skull/bones, Beastmaster antlers, Stormcaller lightning, Chronomancer clock. Reduce repeated generic spikes; Paladin halos, Skylancer actual feathers, cleaner Archmage halo, recognizably fiery Pyromancer crown. Fix lower Pirate hats and floating Berserker horns. Source: class-look3d.js unconditionally calls additive hood for five classes, helmet for Warrior/Paladin all tiers, shared spike crown on ten classes, duplicate Archmage rings, tubular Pirate brim for first2 tiers; head fittings ignore source mesh silhouette. Plan preserve underlying models/body palettes/geometry and rank/save IDs. Remove duplicate hood geometry; strip generic crown on Ranger/Bladedancer/Mage/Paladin/Pyromancer/Skylancer; retain deliberate appropriate horns elsewhere. Open Paladin earned face with side guards and luminous halo; base heads no fitting. Connected single pair of Berserker temple-mounted horns; filled shaped Pirate brims/crowns for first2 tiers, keep liked Admiral hat. Replace Pyromancer metal horns with curved layered emissive flame tongues. Simplify Mage halo and remove duplicate armillary. Review front/side/back in real browser, all51 fits and13 animations for finite/stable anchors, disposal/reduced motion, geometry budgets, pre-change save and live gallery. No gameplay/stat/unlock/economy changes.


## [Codex | 2026-10-17] v2.231 — class headwear tuning

U-HEADWEAR-TUNING-20261017 implemented. Removed the overlapping added hood shell on Ranger/Ninja/Reaper/Bladedancer/Warlock. Ranger/Bladedancer now have no added head geometry at any tier; original sculpted hoods preserved. Warrior default uncovered; earned bulky cap/visor replaced by fitted royal circlets. Warlock's ill-fitting shield mask and duplicate floating crown blades removed, natural face retained with the existing Rank10 pact horns. Ninja/Reaper cloth face wraps retained. Paladin default bareheaded; source Cleric's built-in painted metal plate and inner head surfaces selectively masked, fitted bare head/nose retains white hair and editable face; earned golden halos replace helm/spikes. Source geometry/material overrides restore on clear and palette changes clear fittings before repaint. Generic crown removed from Mage/Paladin/Pyromancer/Ranger/Bladedancer/Skylancer. Archmage single ring/two small stars, no duplicate armillary. Pyromancer crossed curved orange/gold flame sheets visible from side, one shared flame pivot; Skylancer feather vanes/quills, rooted Berserker horn mounts; first2 Pirate hats now fitted felt domes and filled curled tricorn brims. Liked Rank10 Admiral hat, Necromancer skull, Beastmaster antlers, Chronomancer clock and Stormcaller lightning retained. Body fitting hashes match pre-change geometry/material colors across all51 looks; stats/rank IDs/save rules unchanged.

Verification:96 offline regression suites,51 body hash/source-restoration cases,51 outfit geometry audit/4080 sampled frames/204 rank gates, max9974 added triangles/45 meshes. Real browser renders51 looks across13 animation modes (3978 frames), stable bind anchors/rebuilds/reduced motion/disposal; localized front/side/back9-view screenshots inspected for11 classes. Existing level100 save enters hub, finite HP; no production storage touched. Visual inspection required several fitting corrections, not accepted from mesh counts alone. Evidence docs/art-validation/headwear-20261017. Both gallery and runtime import versions updated consistently; production pending.


## [Codex | 2026-10-17] U-PROGRESSION-CHEST-HUD-20261017

User requests readable class rank-up before mandatory skill/passive selection (remove Choose later), moderately slower class progression and no rank3 during starter tutorial; replace enemy loose gear with rarer chest drops whose rate/grade reflect encounter difficulty. Keep XP/gold/quest credit. Move gold to identity class row, expand progression bars/labels with ten divisions, larger rounded-square minimap, quest tracker below identity, nonoverlapping lower journal notices, enemy type and encounter level above nearby red HP bars, optional FPS counter off by default.

Grounded plan: extend active-time celebration850ms to2800ms plus smooth departure, retain protected choice and inline confirm/cancel-selection only. Reduce class award multiplier campaign4 to3.2, tutorial2.5 to1; preserve guaranteed rank2 at third beginner kill, avoid tutorial rank3. No characterXP reduction. Rare personal enemy chests use existing chest mesh/open/reveal and saved reward records: ordinary1.5%-3%, elite8%-12% by encounter level; bosses/treasure enemies guaranteed authored reward chests, one item each, keep named relics. No loot in practice/PvP. Co-op keeps existing personal kill-credit/reward ownership; no shared chest claims introduced. Stable encounter level from zone/depth/trial strength, not player's level; reuse existing stat scaling, no second multiplier. Move existing gold node (no duplicate counter), responsive bar/map/tracker layout, labels through existing bestiary names; FPS sampled from actual render frames, setting persisted globally. Verify actual starter choice timing/cancel, chest/bag-full/reload/co-op credit paths, legacy save, desktop and narrow HUD bounds, renderer labels, settings default/persistence and existing regressions. Do not reset production storage. This pass does not claim human-tested balance/fun.


## [Codex | 2026-10-17] v2.232 — progression, chest rewards and HUD

U-PROGRESSION-CHEST-HUD-20261017 implemented:2800ms class celebration plus300ms departure, larger readable notice, protected HUD/controller transition, mandatory choice/no Choose later. Campaign classXP20% slower, tutorial multiplier removed, guaranteed third-defeatRank2 and no starter tutorialRank3. Enemy gear only through rare personal chest drops (normal1.5%-3%, elite8%-12%, better grades with encounter strength; boss/treasure/mimic guarantees; unique relics retained). Cached personal chest rewards restore across reload, host-ID fallback prevents guest reconnect duplicates. KillXP/gold and quest pickups retained. Gold moved to identity class row with bounded compact display; larger rounded-square map, quests under identity/companion, lower journal notices, bigger ten-tick XP tracks/labels. All nearby enemy bars show name and encounter level without adding another stat multiplier. Off-by-default Graphics FPS toggle uses real render frames.

98 offline suites, parser and changed module syntax pass. Actual browser verifies legacylevel100 hub entry, first class choice+Q/Esc/confirm, six tutorial defeats endRank2, enemy chest/no loose gear/full bag/same reward/claim once, unchanged unopened reward after reload, FPS toggle, desktop and390px HUD fit. No production storage touched. Co-op kill/replay/reconnect tested through actual packet handler in isolation; no two-device live test or claim of human-approved balance. Evidence docs/art-validation/progression-hud-20261017/summary.md. Production pending.


## [Codex | 2026-10-17] U-HUB-FIRST-IMPRESSION-20261017

User requests cause-and-effect five-slide opening with concise additional context, final slide only Enter the Waystation (hide Skip), no extra art unless needed. Beginner hub tour must define functions before jargon, Waystone then Briar then connected campaign gates then shops/activities; mention live rebound Bag key, simple forge purpose, correct Stylist versus Drillmaster roles. Enlarge hub people so Quartermaster visible. Replace fake always-present mirror avatar with physically confined viewpoint reflection. Distinct themed activity portal silhouettes. Investigate/fix cold first movement/dash stutters, no unsupported claim all performance solved. Training dummy: fixed orientation, straw/hay target appearance, explicit Training Dummy/name and level0, redHP and much more health, harmless/resettable.

Grounded plan: preserve canon research->surprise obedience->conquest and one central Gate, no early soul/Bladeborn spoilers; five supplied images remain. Revise copy and order in hub-tour.js with live control hints. Enlarge only human hub actors within stall roof/sign clearances; align interaction labels. Remove hub's duplicate actor-mirror call; use bounded, distance/front-gated low-resolution planar reflection from existing Three scene, preserve separate equipment inspection. Replace dummy's current GLB through shared cached procedural straw model, stationary game yaw and highHP/red named level0 bar, no XP/loot. Theme activity entrances within existing service footprints/interaction logic. Profile actual cold/warm frames and shader/resource creation; prepare rendering under loading screen and remove proven per-frame waste, without degrading all graphics or claiming hardware-specific guarantee. Verify story controls, tour ordering/copy/rebound keys, real mirror front/side/away and geometry confinement, NPC/sign/target fits, harmless dummy, render timing, old save and regressions. Publish only verified changes; record any unresolved measurement limits.


## [Codex | 2026-10-17] U-HUB-FIRST-IMPRESSION-20261017 implemented, v2.233

Five-slide cause-and-effect opening, final Skip hidden; purpose-first hub tour ordered Waystone/Briar/continuing campaign/services, live Bag and Interact hints, larger merchants and lower tour framing. Replaced fake mirror actor with confined front/distance-gated planar reflection; themed activity entrances. Straw target dummy with fixed heading, named red Lv0 HP bar and10,000 base HP. Canonical shared mob module/cache, loading-time rig/shader/texture/animation/dash-ghost preparation and cached bone-copy pairs.

99 offline suites pass; focused suites, parser and module syntax rechecked after final tour framing. Actual browser verifies old level100 save, correct story final action, actual tour entry/HUD, mirror, dummy, successful hub/trial loading and real mapped dashes. No production storage touched. Frame trace median7.9ms/p95 10.8ms but183.4ms maximum: intermittent stutters are improved at known first-use paths, not declared solved. Evidence docs/art-validation/welcome-hub-20261017/summary.md. Production pending.


## [Codex | 2026-10-17] U-BRIAR-PLAYTEST-PERFORMANCE-20261017

User reports serious sustained default-setting Briar/Orchard Walkway lag on a strong PC, poorly functioning transparent dressing store requiring window jumps, unexplained Mara shard appearing on floor, weak first-shard explanation, stone/tree-like noncolliding scenery, another bad chest staircase, gold-only quest chests resembling equipment chests, and missing explicit optional charge-attack teaching. Prior first-use warm-up did not solve Briar performance.

Grounded implementation plan: capture default fresh-starter actual-browser village/east-orchard/west-orchard frame timing, draw calls/triangles and source phase timings before/after; inspect spatial batching, decorative geometry and real simulation costs, remove Briar ambient sky particles, preserve gameplay cues and authored combat/terrain. Replace store window/crates with level doorway and opaque floor/walls; cut away only a roof that actually occludes. Audit orchard remnants/collision ownership and stairs against visible geometry. Make Mara explicitly hand over a physical shard and introduce its five-per-region/class-trial purpose through a short locally safe Rift Keeper spirit encounter; preserve personal co-op receipts, banking rules, canon/no spoilers and skip/revisit safety. Distinct modest wood/iron coin coffer with visible coins/coin emblem for gold-only rewards, hinged opening, gold gain UI+existing appropriate SFX, no rarity gem/crown or item roulette. Add an informative charge lesson, weapon-aware and never progression-required for a starter sword/nonchargeable weapon. Regression tests, actual old-save/browser interactions and documented measured limits before publication.


## [Codex | 2026-10-17] U-DIALOGUE-ENDINGS-20261017

User reiterates that exhausted main dialogue must end in a clear primary Leave conversation action, not loop back through the same lines indefinitely. Talking again may replay information. Preserve access to genuine side quests and optional lore, keep required quest/combat effects and co-op speaker authority intact, and retain intentional gameplay retries. Plan: audit campaign and service conversation engines; replace return-to-visited-dialogue continuations with endings, track all visited nodes within the current conversation (including explicit optional-topic navigation), expose remaining questions separately, use Leave conversation for ordinary terminal lines, prevent stale/replayed choices executing twice; verify real NPC paths, legacy cursors and shared authority before publishing.


## [Codex | 2026-10-17] U-WORLD-SIGNS-20261017

Remove campaign signs revealing puzzle controls, keys, secrets or tactical routes unless plausible in-world signage. Preserve town destinations and selected workplace/library labels. Audit shared authored sign arrays and Keep boards; remove associated collision through the same source arrays. Preserve routes, mechanics, HUD guidance, map scale and saves. Verify source contracts, syntax and browser before publication.


## [Codex | 2026-10-17] U-PALM-FLAME-20261017

User replaces Pyromancer magic/ranged equipment with intrinsic bare-handed fire combat: displaced weapon goes safely into bag, short-range basic palm flame burst, charged wider/longer and stronger flame fan. Warlock gains both ranged and magic weapon groups. Plan: use existing intrinsic class weapon/save/network conventions, rank-scaled fire weapon, shared target/LOS/damage path for PvE/PvP, bounded cosmetic flame ribbons and spell poses without a held model; preserve gear on switch/full bag/legacy reload, update class descriptions, verify attack reach/walls/charge/gear switching and browser presentation.


## [Codex | 2026-10-17] U-BAG-REWORK-20261017

User rejects nested bag dropdowns and authorizes an intelligent major redesign. Click equipment slots to browse compatible replacements, highest rarity first, retain a separate whole-bag browsing path. Companion slot remains unavailable until buying a permanent Beastkeeper field-equip item, analogous to Drillmaster Seal. Grounded plan: retain transactional equip backend and independent portrait; replace details with persistent category/type tabs, slot filters, explicit locked-item states and immediate current-vs-candidate comparisons. Use identity-safe sell/equip callbacks, preserve filter/scroll on updates, always show empty categories. Add Beastkeeper Whistle purchase (7500g), save/load/checkpoint field, owned-only field companion picker (no remote shop/training); guard stale world, riding and fallen-pet states and preserve pet vitals on swapping. Verify fixtures for every slot/category, full bag, key dismissal, purchase/reload/gating and browser layout.


## [Codex | 2026-10-17] U-KEEP-PERFORMANCE-OPTIONALS-20261017

User reports significant Ruined Keep frame drops, especially near water, suspects shared level costs. Active optional objectives must be directly visible in core HUD tracker, not hidden in a dropdown. Plan: measure actual default-camera Keep entry/water/movement CPU and render phases in disposable old-save browser fixture before changing performance code; inspect AI collision/pathing, camera occlusion, chunk/shadow work and water geometry, fix evidenced hot paths with reusable bounded caches/broadphase where appropriate. Preserve layout, collision, visuals and combat rules. Replace HUD optional fold with visible active rows, retain completed history in Journal, include optional progress in tracker signatures. Verify browser before/after timings, objectives/progress/no-overlap and offline regressions; report hardware/scene limits honestly.


## [Codex | 2026-10-17] U-OVERHEAD-INPUT-20261017

User requires mouse attack/dodge alongside keyboard in overhead, fixed camera-aligned minimap in that view, and no movement blur by default. Plan: route mouse events from canvas and transparent touch surfaces through shared binding handler (exclude actual HUD/buttons); retain touch and pointer-lock rules. Add persisted default-off dash afterimage setting with immediate trail clearing, retain combat effects. Set overhead map heading from rendered view direction, preserve shoulder/FPS heading. Verify inputs, rebindings, menu exclusion, trail switch and map orientation.


## [Codex | 2026-10-17] U-SETTINGS-GROUP-CONTRAST-20261017

User wants expanded Game options groups clearly separated from neighboring headings, with bolder option borders. Plan: scope visual-only CSS to Game options card, strengthen expanded amber outer boundary, header divider and inset blue contents, give buttons/sliders distinct borders and focus indication; preserve accordion/input behavior and records styling. Verify real browser expanded controls/graphics and compact layout.


## [Codex | 2026-10-17] U-FULLSCREEN-SHORTCUT-20261017

User requests0 fullscreen shortcut. Add rebindable Toggle fullscreen action default Digit0/Numpad0, fill only free bindings on existing saves, handle once per press outside typing/rebinding/editor/modifier combinations. Show assigned shortcut in fullscreen settings button, update actual state on fullscreenchange, catch rejected browser requests. Verify routing and browser fullscreen with a real gesture where permitted.


## [Codex | 2026-10-17] U-DIALOGUE-KEYBOARD-20261017

User requires obvious yellow dialogue selection, W/S or Up/Down browsing and E confirmation. Plan: shared visible/enabled dialogue focus selection for hub/campaign/Rift Keeper and legacy Shade, wrap navigation, auto-select first main choice after arming, include optional question summaries and footer exits, visible keyboard hint; respect rebound interact, typing/modifiers, disabled spectator choices and held-E arming guard. Preserve mouse, Tab, Escape/Q, quest authority and dialogue endings. Verify actual browser conversation paths and regression suites.


## [Codex | 2026-10-17] U-CAMPAIGN-REPLAY-ENTRY-20261017

User requests after completing each campaign region three replay starts: first district, second district, boss, from gate or travel selection; first clear must still follow normal order. Plan: add completed-only shared replay picker on portal/Waystone UI paths; preserve low-level enterZone for new runs/network, accept validated target area only after zoneDone (authoritative guest sync exception). Load selected authored area directly before checkpoint/party broadcast, not by simulating quest completions. Guard stale/double menu callbacks, preserve hero/gold/optional progress, cancel without entering, test all8regions×3areas and incomplete gating, boss/checkpoint states and existing authority/save suites.


## [Codex | 2026-10-17] U-WEAPON-AURA-ICONS-20261017

User requires weapon glow cosmetics preserve weapon color, emit subtle visible surrounding aura, and requests missing icon list. Plan: replace emissive repaint/bright edge lines with separate depth-tested transparent normal-expanded aura shell, preserve source materials/shared geometry, isolate actors/IDs, dispose owned shell materials on weapon swap. Audit actual cosmetic filenames and live UI icon paths, use explicit existing fallback images for missing custom art, supply precise missing artwork names. Verify weapon types/unequip/material preservation and visible browser results.


## [Codex | 2026-10-17] U-TUTORIAL-MENU-KEYS-20261017

User requires tutorial clearly teach E select/continue and Q back/close for menus/dialogue. Plan: early short safe lesson with current Interact binding plus reservedQ and yellow-selector navigation, visible keycaps, accurate Q/Esc tip-dismiss captions. Ensure E activates focused enabled buttons/summaries in ordinary menu/pause without selecting arbitrary actions or typing/repeat side effects. Preserve dialogue owner/arming and existing Q cleanup. Update map tip to reflect fixed overhead orientation.


## [Codex | 2026-10-17] U-HUD-WEAPON-PET-LEVEL-20261017

User requires equipped weapon always visible in upper-left name card, companion level on HUD/nameplate tied to paid training. Existing training has5 upgrades; derive displayLv1+training (1..6) with no new XP/save field, retain current prices/stat multipliers, clamp malformed legacy training. Show level/next level/max in Beastkeeper, preserve custom names, update current pet maxHP after training while preserving missingHP. Restore weapon line inline below class/gold, remove hidden-details toggle and use measured HUD/companion heights to avoid tracker overlap. Verify weapon changes, trained save reload, all five purchases/max/cost/HP and browser layout.


## [Codex | 2026-10-17] U-READY-QUEST-TURNIN-20261017

User wants ready NPC quest hand-ins replace stale reminder/question branches, with only turn-in/progression choices while requirements are met. Plan: explicitly mark audited authored hand-in choices (not guess from prose), filter ready choices in shared state view and reject hidden stale choices, suppress topic detours until hand-in; restore saved conversation to a reachable ready node through effect-free/already-applied navigation only. Prioritize ready hub return requests before service/lore landing. Preserve reward-type/real outcome choices, partial deliveries, unmet requirements, unrelated side quests after hand-in, once-only rewards, co-op authority and closing. Verify cross-book hand-ins and actual browser incomplete/ready/after flows.


## [Codex | 2026-10-17] U-BAG-PAUSE-20261017

Opening the bag must use main-menu pause protection: solo simulation freezes; co-op world continues while the visible player is protected and peers see paused presence. Initialize existing pause session at the shared openBag entry, including direct keyboard/HUD access and nested equipment panels. Resume clears protection; preserve competitive-play exception and saves. Verify actual bag entry, nested panels, damage, resume and world replacement.


## [Codex | 2026-10-17] U-CHESS-WHEEL-ZOOM-20261017

User requests broad scroll-wheel zoom while seated at the 3D chessboard. Plan: local orbit radius bounded32..240 world units (current default132 desktop/140mobile), normalize pixel/line/page wheel units and clamp extreme deltas. Wheel over world/hit layers zooms toward board center, while side-panel/flat-board scrolling and browser Ctrl/Meta zoom remain untouched. Preserve orbit angle, seat orientation, move drag and gameplay camera preferences. Verify zoom bounds, both directions, actual board visibility and UI exclusions.


## [Codex | 2026-10-17] U-CHESS-PREMOVES-20261017

User requests pre-moves on 3D and flat boards. Plan: one private local queued move via clicks or drag, purple origin/destination indicators, cancel button/right click, replaceable while waiting. Queue geometric candidate moves including pawn capture onto currently empty squares; execute only after authoritative opponent animation completes, turn/seat/round still match, clock started and engine confirms legality. Clear before send to avoid duplicate requests; cancel on illegal reply, game end, history review, leaving, new game/seat change. No protocol or save schema change; host retains move validation. Verify host/guest, legal/invalidated/cancel/promotion and both UI paths.


## [Codex | 2026-10-17] U-CHESS-LOBBY-HISTORY-20261017

User requests A/D plus arrow move-history navigation and co-op options to play Thomas independently, spectate friend, or play each other. Plan: host-authoritative isolated chess sessions (one retained Thomas match per player plus shared friend match), lobby with explicit challenge/accept and watch/resume choices, read-only spectators, per-game revisions/clock/bot/animation/history, pause private match when owner leaves/watches. Keep existing chess rules/controls, host-owned furniture and hard-Thomas reward eligibility for the actual winning player. Keyboard history uses A/Left and D/Right, guards text/select inputs/modifiers and clamps ends; reaching latest returns Live. Verify isolation, unauthorized commands, invite/accept, simultaneous bot turns, guest updates, disconnect/rejoin, clocks, premoves, spectator safety and browser controls.


## [Codex | 2026-10-17] U-TITLE-CURRENT-SETTINGS-20261017

User requests title Settings match current in-game settings. Route title entry through the same grouped settings renderer; preserve title origin through toggles, camera refreshes, key bindings and help. Back/Q/Esc must return to title, while pause-origin Settings returns to pause. Hide trial-exit controls on title even if an old world remains in memory. Keep preferences persistent and avoid loading/writing a character just to adjust options.


## [Codex | 2026-10-17] U-ONBOARDING-COOP-FACES-20261017

User reports E/Q tutorial unclear, Skill 1 value unclear, journal prompt missing key, quest tracker flashing during dialogue, blank face on friend and some textures permanently missing on guest. Grounded plan: prominent separate Choose/Back tutorial key cards with current bindings, concise combat benefit and journal shortcut; prevent quest renderer from reappearing during background dialogue simulation. Send bounded normalized face settings in initial/update/relay packets; build independent fitted peer faces and release only owned resources. Texture audit finds all referenced base-color images present; GLTFLoader currently silently caches a null texture after one load/decode error. Add bounded retries with ordinary image-decoder fallback, preserving sampler/orientation/cache and exposing failure diagnostics; this addresses that failure path, not yet proof of the friend's specific cause. Verify malformed/old packets, relay/live face updates, all six base rigs, rebinding, real browser dialogue ticks, cold assets and pre-change save. Preserve saves.


## [Codex | 2026-10-17] U-TREASURE-SPRINT-FINISH-20261017

User requests finish and improve broken Treasure Sprint; confirms hub entry stalls loading, recovery button reloads title, save survived. Inspection: loadBonus mutates hub world but leaves hubArt; loading readiness requires active hub renderer whenever hubArt exists, even outside hub. Retry changes course without changing loading identity; stale scene/camera/collision/story fields can survive. Plan: clean Sprint scene state, mode-aware loading key/readiness, explicit successful scene warmup, stable start/camera. Preserve hub no-gold/no-loot rule and campaign reward vault, character saves and deterministic co-op seed. Audit physical jumps and dynamic support, guide/checkpoints/falls, timer pause and penalties, chest/exit/result/retry/hub return. Improve deliberate three-section route readability, safe checkpoint landings, visible progress and contextual controls, same-course retry/new-course option and useful result feedback. Keep brighter colorful art, use existing detailed stone/crystal assets and avoid particle overload. Update blueprint/design packet before geometry changes. Verify actual portal entry and old save, real physics traversal/mistake/recovery, camera modes, forced timeout/completion/retry, no rewards in hub, campaign chest, seeded network entry and full regressions. Fun remains for human playtest, not guaranteed by tests.


## [Codex | 2026-10-17] U-COOP-INDEPENDENT-CHESTS-20261017

User: "chest drops should be mirrored in coop and we should both be abl to collec the same chest indiependetly. so we both get grear at the same time"

Inspection found guest kill replay and unseen-enemy credit roll separate random drops, and host world snapshots omit chests. Plan: host rolls enemy chest existence/location/rarity once; periodic scene-scoped chest manifests mirror placed/dynamic/enemy chests without sharing opened/claimed flags or reward inventory. Each save retains its own once-only reward record, capacity/auto-sell decision and reveal. Host-opened chests remain available to friends; late/repeated snapshots cannot reopen personal claims. Preserve claimed host drop descriptors across reloads for late join; shared mimic combat remains host-authoritative. Verify two isolated host/guest game instances, either opening order, full bag, duplicates/stale scenes, enemy location/rarity, late join, saved claim reload and special modes. No changes to drop rates or hub Sprint reward rules.


## [Codex | 2026-10-17] U-UPGRADE-BAG-PROTECTION-20261017

User: "also i should be invulvnerbale when im choosing my nexst skil or passive or open my bag. just like going to the menu"

Inspection: bag already starts beginPause, but upgrade mode is absent from pause protection and the live co-op menu wrapper; class celebration/choice/tutorial entries do not start pause sessions. Plan: route rank-up celebration, skill/passive selection/review, first-skill lesson and legacy upgrade entries through the same world-scoped pause session as bag/Esc. Solo freezes; co-op world continues with held visible grey protected player. Preserve required choices, chained choices, controller/keyboard input, actual unlock transitions and resume cleanup; keep existing competitive PvP exception identical to the main menu. Verify incoming hits/falls, bag direct entry/nested panels, choice transition/confirmation, background updates/presence and old-save/browser behavior.


## [Codex | 2026-10-17] U-COOP-NPC-LABEL-ALIGNMENT-20261017

User: "the exclam features above characteras as well as the e to interact features are not connecting well tot he nocs for my friend as they are for me. please fix"

Inspection: project() returns CSS viewport pixels, but interaction prompts and hub quest marks divide by render DPR again. Guests with different display scaling, render quality or resolution get different offsets. Prompt positioning also occurs during update before the current render camera, while 3D NPC bodies include authored offsets and size changes. Plan: respect CSS projection coordinates, refresh interaction prompt after the current camera setup, and use world-scoped rendered NPC top anchors for hub/campaign NPCs with current fallback for unloaded models/props. Apply the same CSS-coordinate correction to closely related DOM world labels/adapters; do not change physics or network coordinates. Verify guest/host roles across low/high/non-unit DPR, camera turn/zoom, model loading/stale-world fallback, quest markers, current interaction binding and old saves in an actual browser.


## [Codex | 2026-10-17] U-COOP-PET-MODELS-20261017

User: "i cant see my ftriends shepard dog it looks like a white cube please fix. make sure all the pets look perpolery in coop"

Inspection: syncCompanions selects remote pets only when id===sunwing. All other peer pets bypass their detailed models, and legacy drawing lacks shepherd/cinder branches. Plan: include all living same-scene peer companions in the canonical detailed renderer, preserve stable per-peer actor identity/material ownership and exclude other zones/halves/Rift Hall/dead pets. Canonicalize old companion module aliases so shop/live rendering shares one registry/cache. Validate peer pet IDs/coordinates and preserve old packet compatibility; append attack animation timing while retaining existing dragon/sitting fields. Add dog/pup legacy fallbacks. Verify all10 defined pets, especially cold-load peer-only models, local/remote material/mesh independence, switch/death/disconnect/world cleanup, movement/sitting/dragon flags, screenshots and old saves. No inventory, combat power, shop price or save-format changes.


## [Codex | 2026-10-17] Class trainer glows

User: "please add background color glows to the other classes in the class trainer just like the start calssesw and reaper have. add that to al the toehrs int he same style"

Inspection/plan: openTrainer only defines five class accents; the other twelve fall back to gold. Extend its accent map to all 17 classes, retaining the existing card gradient, icon glow, hover and equipped styling. Preserve existing five colors, locked states, class behavior and saves. Verify the actual trainer in a browser and run syntax/class progression checks.


## [Codex | 2026-10-17] Universal menu close buttons

User: "also generally you should add a red x exit button in the top right of every menu screen as a way to exit the menu"

Inspection/plan: most menus use showOverlayHTML and existing Back/Cancel/Resume controls; dialogue, chess and mirror use separate panels. Add a shared accessible red X that delegates to those existing safe controls without synthesizing destructive actions or bypassing required rank choices. Refresh when subpanels change. Keep top-right visible while scrolling, reserve header space, verify keyboard/touch, nested close, pause protection and representative old-save menus. Main title has no parent to exit to; mandatory choices retain their locked completion rule.


## [Codex | 2026-10-17] Campaign NPC names and stable interaction prompt

User: "also the npcs in the level should have their names above their model so you know whos who, the current press e to interact floating texct things its a semi bnroken system. please come up with somehting better to still help d the player know what to do"

Inspection/plan: campaign NPCs have rendered-head anchors but no persistent name labels. Current interaction pill projects over their heads and can cover them or jump around. Separate identity from action: nearby campaign NPC nameplates follow each local rendered head, hide offscreen/behind walls/in menus, limit overlaps; a single stable bottom-center action prompt shows the current bound key, target/action and relevant quest/service cue. Preserve hub signs and quest marks (avoid duplicate hub names), original target selection/reachability/actions and co-op authority. Make the prompt clickable/accessibly labeled, keep touch controls and hide it cleanly during loading/dialogue. Reuse DOM nodes and throttle static visibility checks. Verify old-save campaign/hub, camera/quality/guest cases, rebinding and actual interaction.


## [Codex | 2026-10-17] Companion pad healing and stale death health

User: "healing pads should also heal companions ionf they step on it. also my friend pet died but then it still showed it had 10hp"

Inspection/plan: pad update only checks the player; hurtPet changes/removes G.pet without refreshing HUD, leaving its prior HP visible. Extend pads to owner-authoritative living player/companion occupants with height/radius checks, shared finite charge and existing heal cadence; preserve locked/infinite behavior and never revive fallen pets or mutate peer proxies. Refresh companion HUD on damage/death and present Fallen/0 HP until hub return. Normalize contradictory dead peer packets to0 HP. Verify player-full/pet-injured, pet-only contact, simultaneous/finite/infinite/locked/height/death, owner/peer packet cleanup and Beastmaster last stand. Preserve saves and no new network authority.


## [Codex | 2026-10-17] Smooth nonblocking class rank-up

User: "now the classs rank up animation freezes the charcer for too long, please come up wtha  new ideadfor this that s way smoother and clear"

Inspection/plan: beginProgressChoice enters protected upgrade mode, clears inputs, and beforeChoice makes the HUD inert for2800ms plus300ms fade. Replace the frozen prelude with a compact900ms rank/reward banner while gameplay and all controls continue, then enter the existing protected mandatory choice. Briefly wait for landing (bounded) to avoid cutting off jumps; suspend the lead-in during menus/loading/hidden tabs. Retain world/player/class/rank validity guards, requeue interrupted rewards, avoid repeating the announcement for chained choices at one earned rank, and label the choice itself with the earned rank. Preserve distinct SFX, reduced-motion support, mandatory selection and co-op choice protection. Verify movement/controller, pause/resume, stale/death/class/scene transitions, chained choices and old-save tutorial.


## [Codex | 2026-10-17] Meaningful mana pacing

User: "also alsmot no classses ever run out of mana, so its a system that feels not impactful, skills should maybe cost more mana and or it should be sltighyl harder or take longer to recoever it so its not just poure skill spam, bu three some straggy to it"

Inspection/plan: baseline regeneration is3.5%max/sec during casting; each basic target hit refunds4 and basic kills refund12, making area attacks nearly free.53 of136 current skill choices lack explicit costs and fall back to12, including ultimates. Set explicit costs for all17 classes, raise cheap repeatable attacks, reduce baseline hit recovery to1 per0.65s rather than per target, remove the generic12 kill refund while preserving class sustain perks. Mana regenerates at1.25%max/sec for4s after a skill, then returns to3.5%; basic attacks remain usable while conserving mana. Mage magic-hit bonus joins the same recovery cadence, and empowered basics reserve25%max mana for skills. Fix Manafont max-pool mismatch. Verify actual skill-cost selectors, all class paths, low-mana prevention/refunds, timed recovery/pause, area-hit batching, confirmed guest/PvP receipts and old-save load; keep damage/cooldowns/save formats intact. Teach the recovery rule briefly.


## [Codex | 2026-10-17] Reliable co-op chest scrolling

User: "the chest loot scrolling aniomaton isnt working for my friend on coop"

Inspection: current two-instance WebRTC reproduction grants independent rewards and the guest reel does scroll through host snapshots; the friend's exact failure is not yet reproduced. Found presentation edge cases: OS reduced-motion always overrides an explicit in-game Off; scrolling relies entirely on Element.animate; and an interaction edge in the opening frame can immediately skip it. Plan: respect explicit in-game motion preference, drive the small reel with requestAnimationFrame with hidden-tab elapsed-time protection, and arm manual skip after a short opening grace period. Preserve reduced-motion instant result, winner/reward identity, queue/scene cleanup, bound interact key, SFX and independent claim records. Refresh asset URLs; verify actual guest reel movement/landing plus preference and input edge cases, without claiming two-person remote validation.


## [Codex | 2026-10-17] Remove legacy overhead teammate cubes

User: "we dont need the little boxes that float above your coop frinds head anymore that was an old feature"

Inspection/plan: MP.drawPeer still emits a5x5 team/id cube above every living teammate and a pulsing6x6 red cube above downed allies. Remove those legacy floating markers; keep the actual character/downed body, modern name/HP/class labels, downed/revive information, team label colors, paused grey model and companion/summon rendering. Verify peer render branches and old-save browser appearance; no save or network change.


## [Codex | 2026-10-17] Clear gold balances in spending menus

User: "any menu in which you can spdn gold should cleanly display your godl amount *drill master menu* for ex"

Inspection/plan: Drillmaster has charter/Seal purchases but no visible balance. Quartermaster and Pet Yard use different balances, weapon comparison and Fortune's Bag lack one, Stylist only shows it after editing, respec puts it below a long tree. Add an explicit shared gold-wallet row near the top of every spending screen: trainer, respec, shop, equipment comparison/chests, Fortune's Bag, Beastkeeper, Stylist wardrobe/makeover and dungeon preparation. Keep it sticky/readable with long amounts and clear of the red close button. Update from the current balance on menu render and HUD updates without resetting staged choices; dungeon preparation must read its selected dungeon profile rather than campaign gold. Consolidate duplicate balance headings. Preserve prices/purchase/save logic and verify real purchases, nested navigation, zero/large balances and old-save loading.


## [Codex | 2026-10-17] Quieter co-op attack and skill audio

User: "i wan tto be able to hear the sfx of my coop friends attacks and skill sbut the volume shoul dbe a bit lower so it doesnt get confuses with youtr own"

Inspection/plan: sendCombat/recvCombat share visuals only. Add bounded audio-only events from accepted basic/charged attacks and successful skill casts, capturing their existing approved combat SFX recipes rather than running remote skill effects or replacing sounds. Scope replay gain to55% near the listener with distance falloff; preserve recipient mute/SFX slider and local/music loudness. Use sender identity from host connection, shared world scene, sequence duplicate protection, whitelisted finite recipes and rate limits. Work even if sender is muted; avoid transmitting UI/loot/progression sounds and omit failed/refunded casts. Preserve existing visuals, damage, saves and older packets. Verify capture/mix/filters, actual host-to-guest and guest-to-host/relay transport, hub/campaign scenes, old saves and regression suites in muted browser tests.


## [Codex | 2026-10-17] Slightly more enemy chest drops

User: "make chest drops frmo enemiew slgihtyk mroe common"

Inspection/plan: ordinary enemies currently roll1.5%-3% and elites8%-12%, scaled by encounter level; bosses/mimics/goblins guarantee rewards. Increase only non-guaranteed probabilities by25% (ordinary1.875%-3.75%, elites10%-15%). Keep rarity weights, unique guaranteed rewards, exclusions, host authority and independent co-op claim logic unchanged. Bump asset URL/version; verify exact progression probabilities, excluded mobs, chest persistence/co-op tests and old-save browser load.


## [Codex | 2026-10-17] Local hero disappears in co-op Rift Hall

User: "when entering the rift hall in coop i turn invisible but not my friend same for hhim"

Inspection/plan: Rift Hall sets Three scene.background to a Color. Three WebGLBackground forces a color/depth clear for Color backgrounds even though renderer.autoClear=false. flushHero3D draws local first then each peer; each later peer clears the previous hero. Pass explicit first-pass flag from the queue flush; suppress scene background on subsequent hero passes only and restore it in finally. Preserve first-pass room background, world depth, local-first queue, peer rigs, FP weapon-only view and separate mirror previews. Verify both clients entering/leaving/re-entering hall, actual screenshot before/after, normal hub, source render regression and old saves.


## [Codex | 2026-10-17] Rift Hall portal icon facing

User: "the icons for th rift hall portals are facing the wrong way"

Inspection/plan: icons are DoubleSide PlaneGeometry children of side-wall portal frames, so they become edge-on along the approach and can be seen mirrored from behind. Replace only icon quads with camera-facing SpriteMaterial/Sprite using existing class textures, scale and opacity; mount just in front of portal surface so an opened rift does not veil the icon. Keep portal arch geometry, placement/order, labels, class mapping and interactions unchanged. Refresh imported asset chain and verify both rows and aisle view plus saved Hall progression tests.


## [Codex | 2026-10-17] Appropriate weapons on PvP class change

User: "in pvp, when i pick a new class to try, it shoudl autaomtaiclaly equip a proprer weapon for that class"

Inspection/plan: Arena class buttons only set classId, leaving previous wArch; buildArenaPlayer equips it without family validation. Fair Mode forces sword regardless of class. Only Pyromancer currently receives its intrinsic weapon. Add deterministic class-compatible archetype resolution and class selection default, filter Arena weapon options by class, honor all four intrinsic class weapons. Validate in buildArenaPlayer even for stale/random/Fair configs; randomization selects an allowed family weapon. Preserve compatible manual choices and rarity, class builds, Apply flow, temporary Arena escrow and campaign equipment. Verify all17 classes, normal/Fair/stale/invalid configs, real class-selection UI, equipped attacks, and campaign restoration.


## [Codex | 2026-10-18] PvP setup clarity and Arena station art

User: "Also the PvP selector menu is a mess please improve it. Also please improve the red equip station and th exit portal assets"

Inspection/plan: openArenaSetup is one long undifferentiated list of map/class sliders, weapons, every pet, bots and toggles. Keep existing config/purchase-free sandbox/Apply handlers and class-weapon resolver; author responsive Fighter/Arena & Rules/Practice Bots tabs with selected-loadout summary and persistent footer. Group classes, gear and progression, keep companion optional in a clearly titled section. Explain Fair Mode and host/solo restrictions; prevent misleading bot controls in multiplayer. Preserve random loadout/builds/respec, team/powerup settings, all companions, keyboard close and campaign escrow.

Current arena props are inline cubes: tiny crimson podium/cube attendant and generic sparringdoor. Add a bounded original Three armory station (red cloth, brass/steel frame, actual weapon/armor displays, detailed console) and distinct cyan/green Waystation arch (stone courses, inlays, flowing portal, clear sign). Anchor at existing interactables and staging height, add fitted colliders without obstructing approach, retain voxel fallback if Three unavailable. Own/dispose scene resources on Arena replacement/exit; respect reduced motion; no expensive new lighting or external asset dependencies. Verify geometry budgets, placement/colliders, menu flows at desktop/phone width, classes/Fair/bots/pets/randomize/Apply/exit and old-save preservation in muted browser.


## [Codex | 2026-10-18] Co-op transition and campaign catch-up audit

User approved the proposed full co-op transition audit: entering/changing levels, death/hub return, shared quests/chests/companions, reconnecting and menu/class changes. Preserve earned campaign XP/class upgrades/gold/hub requests, independent chest claims and each player's own save.

Inspection: guest Arena packets update config but never rebuild an already-entered room; Fair Off and powerups are not fully transmitted/applied. Arena fallback hub exit restores fewer fields than explicit exit (omits all companion fields). Late-join placeMsg omits generic quest counters; even onEnter counters are only applied during an area mismatch, not initial campaign entry. Special-mode catch-up compares floor/index but ignores a changed run seed on the same floor/index.

Plan: centralize complete Arena escrow restoration across explicit/fallback hub exits; rebuild guests only when shared Arena rules/map actually change and distinguish map snapshots; carry and install campaign counters before authored room construction/checkpoint creation; restart special-mode guests on changed run identity. Verify actual extracted handlers with distinct host/guest saves and stale/duplicate packets, regress existing chest/pet/death/save coverage, then muted old-save browser transition scenarios. Do not claim Internet or human co-op validation from local fixtures. No new gameplay/economy/design changes.


Audit follow-up: Sparring entry never notifies multiplayer, while normal hub and practice room share zone/area coordinates. Use a dedicated SPARRING scene sentinel, host-authoritative entrance/exit requests validated against the peer's actual room, health and proximity; follow existing host room packets, keep legacy hall/hub IDs unchanged, and spawn the chosen companion immediately. This prevents phantom allies/enemies across hub/practice and supports reconnect catch-up without new save fields.


## [Codex | 2026-10-18] Campaign boss tactics and difficulty

User: "Right now the bosses are all too easy. And I think we should in some way, make the environmental strategies partly necessary to defeat them. Marksman is way too easy". Approved scope: campaign boss difficulty/mechanic pass, prioritizing Marksman. Preserve earned progression, distinct encounters, existing layouts/story and cooperative host authority; no trial/PvP rebalance.

Inspection: Marksman has no approach defense and can lose the entire first perch to burst before its55% relocation check runs. Brute/cart and Fallen/pillar stagger offer little practical advantage over direct damage. Furnace has only12% hot-armor damage and13-second exposure; Marble exposes for12 seconds. Hydra already requires three restraint windows. Officers have no actual protective shield relationship. statusDamage directly subtracts HP, bypassing all normal armor/exposure protections. Host guest-execute handling fails to exclude bosses. Those bypasses undermine the authored strategies independently of HP tuning.

Plan: one campaign-only damage policy shared by direct hits and status damage, with real vulnerability windows and encounter-specific bounds: Brute cart stagger; Marksman defended perches, guaranteed relocation and covered-shot/flank opening; Fallen recovery and pillar stagger; Officers shield-facing/proximity protection so separating/flanking matters; Furnace cooling windows; Hydra existing three restraint openings; Marble reflected-screen openings; King's recovery/add phases. Keep cover/climb alternatives and reachable ground paths, clear short hints/status text, no generic combination puzzle. Moderate fixed regional boss HP increase, no scaling to the player's current gear. Fix guest height and boss execution authority. Validate huge bursts, status/pet/guest paths, all mechanics, co-op snapshots, normal starter combat and old saves in muted browser; numerical checks do not establish novice fun or subjective difficulty.


## [Codex | 2026-10-18] U-AUDIO-20261018 Missing sound identities

User authorizes ElevenLabs generation for remaining missing SFX. Preserve original audio and existing Pyromancer identities. Ground this pass in current CLASS2/SKILL_FX: 128 other active skill choices lack a named signature cue. Audit the historical 1,296-row wishlist before further spending; it includes already covered and superseded events. First implement every current class cast identity, one short take per skill, paid-plan check, no automatic paid retries after uncertain outcomes, conservative 8,000-credit batch cap and no overage. Retain provenance and raw masters. Suppress only synchronous generic cast layers when a new decoded cue is ready; missing files keep originals. Preserve later impacts/echoes and mana/cooldown/refund gates. Lazy-load new clips by equipped skills instead of decoding the whole pack on scene load, preserve co-op recipe whitelist and ally attenuation. Verify source routing, assets, decoding and old-save browser behavior; subjective listening remains pending.


## [Codex | 2026-10-18] Missing enemy wind-up warnings

Source-bound follow-up within authorized missing-SFX pass: 27 ordinary enemy types have silent melee/shot/special wind-up edges. Add a short species-specific warning at the actual rising wind-up state, without replacing existing aggro, death, release or hit audio. Exclude treasure goblin (does not attack) and charger/thornboar (existing file telegraph). Reuse bounded lazy decoding; per-body cooldown and global density limit, distance attenuation and mute, no delayed warning replay. Local observation of shared attack snapshots avoids duplicate network audio. 2,000-credit conservative cap, paid plan and provenance as above.


## [Codex | 2026-10-18] U-PROGRESSION-PREMIUM-20261018

User approves the proposed premium player-level/class-rank experiences. Player level remains nonblocking: golden character pulse, visible old-to-new number, fill/rollover bar and persistent unspent-point affordance. Class rank retains a short900ms live heads-up, existing airborne grace and mandatory protected choice; carry class emblem/new rank into the upgrade screen instead of extending a frozen celebration. Improve readable two-choice presentation, keyboard yellow focus, inline confirmation, illustrative motion previews, and an earned icon-to-HUD handoff. Label effect illustrations accurately; they are not recordings or simulated damage. Rank5/10 show an actual cosmetic model thumbnail and Stylist guidance, without auto-equipping a skin. Combine simultaneous level/rank awards, collapse bulk awards, protect stale owner/class/death/menu and rebind paths, retain low-motion/low-particle settings. No XP/stat/rank/economy rebalance or new dismissal/later option.

Generate two compact ElevenLabs sound candidates under a conservative500-credit cap with paid plan/provenance; preserve preferred originals in production pending listening, offer both candidates on the preview page. Build a save-free public preview using shared celebration/decorator code and current class/skill/skin data, then verify actual old-save award/choice/confirmation/stat/skin/co-op protection paths in muted Chrome and meaningful automated regressions. Inspect visual screenshots before release. Keep all saved IDs and choice authority unchanged.


## [Codex | 2026-10-18] U-ONBOARDING-AUDIO-FOLLOWUP-20261018

User approves unfinished items1/2/3: first-time stat-point introduction, remaining source-audited custom audio, and sound selection. Also approves clearer menu/Bag/Interact/Back tutorial after correcting A to Esc (A remains movement). Keep player stat upgrades optional and nonblocking, one-time guidance with direct stat screen, real before/after values and draft confirmation; preserve class required choices. Teach actual current bindings with Bag open/close practice and Esc menu; retain tutorial skip and safe practice. Add explicit original/new reward sound choices and audition in Settings rather than guessing user taste or replacing originals by default. Audit boss state transitions, weapon charges and physical story mechanisms before paid generation; preserve existing good audio/fallbacks, lazy bounded load, current mute/volume/co-op behavior and provenance. Conservative4000-credit cap for this batch, paid plan check, no uncertain paid retries. No balance, XP, class model, quest or save reset changes.


## [Codex | 2026-10-18] U-READINESS-REVIEW-20261018

User approves the next performance, beginner-journey, co-op regression and normal-gear combat review. Start with measured default shoulder/high profiling in Briar start/village/Orchard and Ruined Keep courtyard/prison water, preserving authored detail and map scale. Use isolated old-save and fresh-character browser fixtures. Target expensive work shown by traces; do not lower visual quality blindly or claim machine-wide FPS guarantees from local samples. Review creation/tutorial/story/hub/campaign/reload boundaries and connected local host/guest prompt/pet/chest/menu/transition paths. Check ordinary-enemy and boss pacing with normal starter gear; preserve intentionally forgiving beginner trial and existing boss environmental strategies. Fix reproduced issues, add meaningful regressions, verify current saves, and publish with measured evidence and explicit limits. No new campaign layout, class or audio-generation scope inferred.


## [Codex | 2026-10-18] U-COMBAT-AUDIO-GAPS-20261018

User authorizes filling missing skill-impact and enemy/boss SFX while keeping good originals. User removes the provisional4,000-credit cap and permits use of available credits; fresh paid Starter API balance37,634. Do not spend credits just to exhaust them. Source-audit actual damage/release/reaction events and exclude non-damaging buffs from impact generation. Add effect-only skill impact accents at confirmed damage, species attack releases/hurt vocal reactions and boss attack releases, preserving all original contact/weapon/death/win/UI files, registry IDs and fallback methods. No automatic replacement of the64 preserved candidates. Keep event ownership, confirmed guest receipts, distance/mute/volume, density limits, weak references/no save-schema changes and lazy3-concurrent decoding. No speculative damage audio from misses, cancelled casts, warded hits or expired projectiles. Add a simple detail toggle for the new effect layer, with a save-free audition library and provenance. Technical checks do not establish listening taste. Use a resumable generation ledger and stop on uncertain paid outcomes; per-run operational guard35,000 (below current balance) is a safeguard, not a target. No gameplay balance, damage or ability changes.


## [Codex | 2026-10-18] Additive combat sound detail — v2.281.0-combat-sound-detail

Oliver authorizes the available ElevenLabs credits to fill combat gaps, while preserving preferred originals. Added 182 event slots: 103 skill effect impacts, 29 creature attack-release voices/material sounds, 29 hurt reactions and 21 authored boss attack releases. 181 new paid Starter takes; Cinder Fan deliberately reuses Firebolt after an uncertain request was not retried. Total settled billed usage 1,070 credits; 36,564 remaining. Untouched raw takes, prompts, provider IDs, hashes, preparation metrics and billing reconciliation retained in audio-source/sfx/combat-detail-20261018 and docs/audio/combat-detail-batch-20261018.json.

Original cast, contact, weapon, death, victory, UI and reward selections remain intact. New impact accents follow confirmed positive damage, never misses, refunds or blocked targets. WeakMaps carry delayed projectile/field/minion/counter metadata outside saves; guest and PvP receipts gate confirmed impacts. Once per cast, nearby only, with crowd limits and spaced hurt reactions; delayed eruptions wait for release. Skill-impact audio recipes support the existing quieter co-op sound relay even when the sender is muted. An independent saved Sound setting disables only the new detail layer. Buff/setup casts retain their existing cast audio and get no invented impact.

Validation: 142 regression suites pass; new detail suite covers 794 event/lifecycle/preservation/media cases. Muted actual Chrome verifies an old level100 save, real Nova positive/untargetable hits, delayed projectile metadata, misses, confirmed guest receipts and duplicate rejection, all136 finalized current skill handlers callable, shared audio setting and all182 files decoded. Local save-free audition at /3d/combat-sound-preview/. Technical checks do not establish subjective sound quality, every skill's natural combat timing, or a two-human Internet session. Full natural campaign/Hollow traversal remains the separate outstanding task.
