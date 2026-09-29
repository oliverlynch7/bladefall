# BLADEFALL — brainstorming handoff
Updated September 29, 2026. Latest code pushed to main: v2.089.0.

## Your role
You are helping the creator brainstorm BLADEFALL. Treat this as context, not a request to rebuild the game or change canon. Suggest clear, practical ideas that build on the existing game. Distinguish proposals from approved decisions. Ask before changing major lore or direction. The creator is low on coding-agent usage and wants to develop ideas here for later implementation.

This is a compact overview, not a complete implementation audit. “Implemented” does not mean every interaction is bug-free or fully polished. Ask for current screenshots or a playtest description before assuming a specific visual or behavior.

## What kind of game is it?
BLADEFALL is a browser-based 3D dark-fantasy action RPG with class progression, loot, exploration, parkour, quests, puzzles, bosses and online co-op. It also has repeatable challenge content and PvP. It began with a smaller action-roguelite scope and is becoming a much larger adventure RPG.

The world is **Aerth**. Voice transcription sometimes writes Earth or other spellings; Aerth is correct. The castle is **Castle Duskmoor**.

The desired experience: exciting combat, rewarding equipment and class unlocks, distinct regions that feel like new worlds, worthwhile exploration and memorable bosses. Inspiration includes AdventureQuest Worlds for classes, grinding and collectible gear; adventure games such as Zelda for puzzle structures; and the variety of enemies, boss scale and unusual equipment effects found in Elden Ring. These are inspirations, not directions to copy specific art or characters.

## Visual identity
Current game: stylized low-poly/voxel roots, readable fantasy characters, oversized weapons, colorful elemental effects, and dark-fantasy environments. Regional themes include forests, ruined stone, frost, molten forges, stormy seas, luminous marble and black/violet magic.

The creator is still exploring the long-term visual identity. Approved concept references range from grounded armored fantasy to brighter AQW-inspired heroes and expressive, strongly differentiated monsters. No wholesale replacement style is locked. Do not assume realistic concept illustrations are already playable 3D assets.

Equipment should look desirable. Classes need recognizable silhouettes and color palettes. Paladin should convey light gold and holy light. Enemy size, shape, animation and behavior need strong variety, rather than many small similar humanoids.

## Core play loop
Create a character → learn controls in a tutorial → reach the Waystation hub → explore campaign regions → complete main and optional objectives → fight bosses → unlock further regions and classes → improve equipment and builds → pursue repeatable/endgame challenges.

Campaign regions generally have two substantial exploration parts and a boss encounter. Levels contain NPCs, branching paths, clues, interactables, puzzles, rift shards, side quests, combat pockets and parkour. Main objectives should advance the central story; side quests can tell smaller stories. Some quests require returning to an NPC, some complete in the field, and some arise from discoveries.

The creator wants mandatory moderate parkour in main routes and harder optional parkour for valuable gear, side objectives and shards. Puzzles should vary mechanically and have understandable, occasionally cryptic clues. Avoid repetitive switch/code tasks and long, poetic instructions.

## Combat, classes and progression
- Real-time movement, basic attacks, charged attacks, jumping/held jumps, dodging and class skills. Co-op should show teammates’ attacks and skill effects.
- Player level and class rank are separate. Player leveling improves overall character power and grants a small amount of allocatable stats. Classes progress to rank 10 and offer skill/passive choices.
- Character creation includes class choice, facial appearance, starting stat allocation/random rolls and an optional name (blank becomes Nameless).
- Main allocation stats: Health, Attack, Defense, Speed and Mana. Avoid splitting base damage into class-specific stats that become useless when switching classes.
- Starting classes: Warrior, Ranger and Mage.
- Current class roster: Warrior, Ranger, Mage, Berserker, Bladedancer, Ninja, Reaper, Paladin, Monk, Pirate, Beastmaster, Skylancer, Pyromancer, Stormcaller, Warlock, Necromancer and Chronomancer.
- Pyromancer has been implemented, with custom skill/passive/class icons. Do not invent an exact skill list; request the current class data if discussing specific numbers or abilities.
- Equipment uses broad Physical, Ranged and Magical weapon families, with hybrids allowed. Daggers belong to ranged and use a thrown charge attack; javelins have greater reach and slower attacks.
- Pirate’s built-in flintlock/saber, Monk’s fists and Reaper’s scythe are class signature weapons rather than ordinary bag drops. Their class scaling caps at rank 10; player level still contributes overall power.
- Gear includes weapons, armor, rings, amulets and cosmetic equips. Rarity progression and meaningful upgrades matter. The bag uses collapsible categories.
- Elemental weapon colors exist. The creator favors distinct secondary effects over a confusing elemental matchup chart. Exact elemental/status balance and unusual equipment bonuses should be verified before treating proposals as shipped.

## Campaign story and progression
**Ian** was Aerth’s famous previous Bladeborn protector. He succeeded throughout a long life and died naturally of old age. He was not killed by the villain. He was infertile; do not invent a secret direct descendant of Ian.

**Bladeborn** power is hereditary and can remain dormant. The player starts as an ordinary person who chooses to protect others. Recessive inheritance and awakening under intense circumstances with a protective heart are the intended direction; do not invent a precise scientific mechanism. The player was raised by **Thomas**, their adoptive father, and does not initially know their origins.

The future **Abyss King** began as a wealthy lord genuinely seeking immortality. His mages created a black **Eternal Gate**. Passing through stops natural aging but separates the living person’s soul from their body. The soul is trapped in the **Abyssal Void**; the body emerges functional, ageless and bound to the King’s commands. These victims are **Hollowed**. Their enslaved army is the **Hollowed Legion**.

He discovered control after pursuing immortality, then exploited Ian’s absence to conquer. Hollowed can retain skills, memories and convincing social behavior, but cannot choose to disobey. They are victims, not willing evil followers. They are not ordinary resurrected corpses. Their eyes can seem subtly vacant.

Later canon specifies **one central Hollow Gate at Castle Duskmoor**. Eternal Gate is its original hopeful propaganda name; Hollow Gate is the name that reflects the truth. Ordinary people walk through like a doorway; their bodies immediately emerge. The King’s later full plunge and escape are an exceptional feat powered by soul energy he has already harnessed.

Campaign route and purposes:
1. **Briar Town**: the Legion finally reaches the player’s home. Defend farmers and townspeople, help Mara the medic and Thomas, and discover the threat’s scale. Part two extends into the woods.
2. **Hollow Pass**: the conflict expands beyond home through canyon territory. Preserve current quest details rather than inventing a new major plot from this summary.
3. **Ruined Keep**: occupied fortifications, prisoners and rescue objectives. Reaper’s powerful class trial should require particularly challenging shard collection.
4. **Frostfell**: snowy mountain approach and ice caves. Rescue Professor Ellis from his hidden laboratory just after the Legion finds him, before he is transported to be Hollowed.
5. **Emberdeep**: disrupt the Legion’s weapons production. Confiscated/abandoned writings point toward Sunspire and its secret knowledge; rescued allies help connect the journey onward.
6. **Storm Coast**: Shipwreck Shore and Thunder Cliffs. Gather boat supplies, survive a playable crossing with steering, obstacles and boarders, then ascend toward remote Sunspire. Co-op can share steering/fighting roles. A chained hydra encounter has a merciful approach: attack its restraints to free it.
7. **Sunspire Palace**: a grand, elevated marble palace/library of sacred knowledge, occupied by the Legion. Reclaim access to forbidden knowledge and a conscious oracle orb. Its one-question encounter provides direction toward the King and evidence of trapped souls. It must not spoil the final cut or ending surprise.
8. **Castle Duskmoor**: infiltration/disguise preparation and a dialogue challenge offer an alternative to a brutal gate fight. Part two is an enormous, epic tower ascent toward the King. The central Hollow Gate is part of the final encounter’s setting.

Finale: partially Void-infused King → recognition that the player is Bladeborn → desperate full infusion → defeat. The overloaded Gate draws the player and defeated King into the Void. Ian’s spirit appears and the player uses **Ian’s Blade** in a cinematic final cut to sever the binding, free the souls and restore the Hollowed, including bodies previously destroyed. The King’s death alone does not restore everyone. The ending is hopeful.

Ian’s Blade is used in a cutscene/button-mashing sequence, not permanently awarded or equipped as a campaign reward. Space-bar charge attempts retry only the charge; offer a skip after five failures. Permanent ownership belongs to the separate difficult endgame unlock path.

Dead Bladeborn continue as spirits together, sharing wisdom and sustaining the legacy. Do not confuse this spiritual realm with souls forcibly imprisoned by the Hollowing.

## Secret rifts and classes
Secret class-trial rifts are different from the black Hollow Gate. They are crystalline magical structures made to preserve fighting disciplines. During Sunspire’s fall, a scholar cast them away to keep that knowledge from the Legion; they shattered and scattered.

Find five shards for a region’s rift. The **Rift Hall** displays region-linked progress and automatically opens the trial once all five are secured. The Rift Keeper explains the lore; talking to him is not required to assemble a rift. Portals are arranged in campaign order counterclockwise.

Class mentors/trials let the player prove themselves and learn a discipline. Approved associations include Berserker with Briar Town, Reaper with Ruined Keep, Pyromancer with Emberdeep, Pirate with Storm Coast, Paladin with Sunspire, and Necromancer after Castle Duskmoor. Consult the live registry for the complete mapping; this summary intentionally does not guess missing entries.

## Hub and supporting systems
The **Waystation** is the central hub, with a large magical crystal Waystone, campaign travel, Rift Hall, shops/services and training/challenge areas.

Services include the Smith/forge, Quartermaster, Drillmaster/class services, Beastkeeper/pets and Stylist. The Beastkeeper’s early pet unlock is tied to rescuing two dogs. Shop access should remain clear alongside quest dialogue. Yellow exclamation indicators identify newly available quests.

Repeatable activities include Abyssal Descent for gold/XP/items, Endless Dungeons as a separate challenge, sparring and PvP. Do not confuse these with the campaign or the actual story Void.

Other systems: quest tracker, journal and collected clues, objective arrows, rotating minimap, healing pads, companions, achievements/records, controller mapping, co-op friend navigation and a held teleport that cancels when hit. Large unlimited healing pads should be rare; smaller limited pads appear more often.

Tutorial and first-hub tour are meant to teach controls and services with minimal reading and a skip option. Dialogue should be concise, with obvious service buttons and a clear Leave conversation option. The creator strongly dislikes excessive reading and loops.

## Recently completed work (verified locally, pushed to main)
- Rank-based class appearances: default, rank 5 and rank 10; distinct colors and class-specific cosmetic details, selected at the Stylist and remembered per class. These give no stat bonus.
- Default key-binding conflict audit, including Tab/B for bag, Left Shift/right-click dodge and M emotes.
- Pyromancer artwork: 19 corrected pixel-styled icons imported.
- UI artwork: 33 new icons plus four destination refreshes, including voyage, journal/quests, settings, emotes and signature equipment. Originals/alternatives are saved in the repository.
- Stylist **Face & name** service: 25 gold total per confirmed makeover; free previews, no charge for cancel/no changes. Eye colors, five mouth shapes, eyebrows, name.
- Latest update: **No eyebrows**, eye/mouth horizontal and vertical positioning and tilt, **Randomize face**, and reset controls in both character creation and the Stylist. Bounded adjustments persist per character. Randomization does not alter class, stats or name. Verified 425 class/mouth/eyebrow combinations and save behavior; removed native Wizard eyebrows that conflicted with these choices.

## Ongoing priorities and brainstorming opportunities
The campaign expansion has had many implementation passes, but it is not appropriate to declare the whole game finished. The most useful discussions now are:
- Memorable enemy combat roles, silhouettes and animations, with varied sizes and encounter combinations.
- Boss arenas that genuinely change how fights play: vertical/horizontal traversal, large or intimate spaces, indoor/outdoor settings, meaningful environmental interactions and varied add waves.
- Combat that is enjoyable to repeat, with story-relevant kill quests and designated respawning enemy areas alongside permanent-clear encounters.
- More rewarding, noticeable gear upgrades and unusual equipment bonuses that alter playstyle rather than only adding generic stats.
- A coherent eventual visual identity, without prematurely replacing every asset.
- Clear first-time-player onboarding, readable UI, short dialogue and accessible clue organization.
- Puzzle variety and rewarding parkour integrated into the environment.
- Playtesting progression, difficulty, co-op reliability, collisions, transparency/occlusion, clipping and performance.

Do not assume every earlier reported bug is still present or that every requested improvement is fully complete. The code and latest playtest are the authority for implementation status.

## Audio and production constraints
Custom music has been assigned/imported in prior work; exact coverage should be checked against the asset registry. A voice studio exists for recording dialogue, with fallback text-to-speech requested for unrecorded lines. The creator wants to work on voice production between coding sessions. They are handling custom SFX; do not resume SFX production without asking.

The game must run well in a browser, including ordinary laptops. Prefer ideas with a clear gameplay payoff and manageable art/runtime cost. Preserve saves and co-op behavior. Avoid silently inventing major lore, changing class identity, or promising features as already built.

## Suggested first response
Briefly reflect your understanding of BLADEFALL, then ask which area the creator wants to brainstorm. When proposing ideas, give a small number of concrete options, explain how each affects the player’s experience, and identify whether it is a small polish change or a substantial new system. Keep a running list of approved decisions for the next coding handoff.
