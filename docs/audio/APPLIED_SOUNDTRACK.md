# Applied Bladefall soundtrack

All 40 original MP3s are copied byte-for-byte into `public/music/bladefall/`. The two desktop guides are preserved in `docs/audio/music-source-notes/`. Runtime music is streamed lazily, with crossfades; it is not all loaded at startup.

The original Wayfarer’s Hearth is preserved. Main hub uses a derived stereo loop: source 0:41.997–3:06.704, interpreted at 68 BPM, with a 3.529-second wrapped crossfade. Loop length is 2:21.177. Runtime uses the gapless MP3 edit; an alternate Opus edit is also preserved. Eight bars precede the flute entrance near 1:10. This is an estimated musical meter based on the original prompt and detected pulse; user listening feedback can refine it.

| Track | Placement |
|---|---|
| Archives of the Archmage | Sunspire Palace part 2 |
| Chains of the Deep | Reserved: chained hydra boss |
| Crystalline Trials | Class trial combat |
| Hall of the Violet Discipline | Class mentor conversations; secret chamber exploration |
| Navigating the Red Wake | Reserved: ship crossing |
| Passing the Flame | Reserved: Ian spirit scene |
| Safe Harbor | Reserved: successful ship arrival |
| The Archive of Violet Portals | Rift Hall |
| The Breaking of the Keeps | Reserved: successful final cut |
| The Fallen Champion Duel | The Fallen boss |
| The Last Spark of Darrow | Reserved: final charge; filename does not establish a new lore name |
| The Shore of Broken Ships | Reserved: Storm Coast part 1 / Shipwreck Shore |
| The Wayfarers Hearth | Original source preserved; derived trimmed loop is the main hub theme |
| The Waystation Refuge | Alternate hub take preserved, not automatic rotation |
| Through the Void Breach | Reserved: final Void arrival |
| Towering Sea Cliffs | Reserved: Storm Coast part 2 / Thunder Cliffs |
| Unburdening the Colossus | Reserved: hydra release, despite generated filename |
| Village Vigil | Briar Town part 1; title screen |
| White Marble Palace above the Clouds | Sunspire Palace part 1 |
| A Crown of Ashes | Castle Duskmoor final boss phase 1 |
| Canyon Updrafts | Hollow Pass part 1 / Winding Cliffs |
| Chamber of Inverted Gravity | Castle Duskmoor part 1 |
| Crosshairs in the Dark | Hollow Marksman boss |
| Crosshairs over Open Ground | Hollow Pass part 2 / Lost Canyon |
| Forge of the Molten Colossus | Ember Colossus boss |
| Glaciated Court of Glass | Ellis rescue conversation / positive story cue |
| Hearthfire in the Frost | Frostfell part 1 / Snowbound Peaks |
| Iron Gavel Descent | Castle Duskmoor part 2 / Long Ascent; arena and sparring |
| Iron Juggernaut | Brute boss; Marble Colossus boss |
| Iron Oath of the Night Attack | Castle Duskmoor final boss phases 2+ |
| Midnight Field | Briar Town part 2 / Black Woods |
| Paradox Void Assault | Hollowed Officers boss; legacy Abyss boss |
| Sentence of the Shield Warden | Ruined Keep part 2 / The Dungeons |
| Stony Whispers of the Keep | Ellis knowledge conversation; future confiscated writings cue |
| The Black Procession | Current Abyss part 1; future Legion procession cue |
| The Eternal Furnace | Emberdeep part 1 / Iron Halls |
| The Iron Causeway | Ruined Keep part 1 / Broken Walls; current Abyss part 2; Abyssal Descent |
| The Obsidian Foundry | Emberdeep part 2 / current Cinder Vents, future Great Furnace |
| The Sorcerers Hall of Mirrors | Frostfell part 2 / Deep Ice Caves |
| Watchful Greenwood | Current campaign victory ending/results; future restoration montage |
| The Wayfarer’s Hearth — hub loop | Main hub / Waystation |

Current implementation deliberately retains dark score for the old Abyss region. Storm Coast’s sea tracks and hydra score activate when that region is implemented. Ship/minigame and full Void/Ian/cut cues have named `musicCue()` mappings but are not triggered by unrelated existing scenes. Current campaign victory uses Watchful Greenwood. Alternate hub take is preserved, not shuffled into the user-selected hub loop. The retained legacy short victory fanfare is separate from this supplied music bank.

Final boss: A Crown of Ashes on entering its arena; Iron Oath of the Night Attack at the existing second-phase transition. Later phases keep Iron Oath rather than restarting it. The later planned narrative transformation should call the same scene routing.

Ellis conversations use Glaciated Court of Glass for relief and Stony Whispers of the Keep for the knowledge exchange. Closing the conversation restores the current level-half track. NPC dialogue lowers background music to 45% of its normal mix; it does not change the player’s slider setting.
