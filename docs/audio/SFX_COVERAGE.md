# Bladefall SFX coverage audit

Game snapshot: 64da686 / 1.986. Registry coverage, not proof that new sound events are implemented.

## All current skill choices

| Class | Slot | Choice A | Choice B |
|---|---|---|---|
| Warrior | 1 | Cleave (`w_cleave`) | Shield Bash (`w_bash`) |
| Warrior | 2 | Charge (`w_charge`) | Whirlwind (`w_whirl`) |
| Warrior | 3 | Iron Guard (`w_guard`) | Shockwave Stomp (`w_stomp`) |
| Warrior | 4 | Warcry (`w_berserk`) | Execution (`w_execute`) |
| Ranger | 1 | Volley (`r_volley`) | Piercing Shot (`r_pierce`) |
| Ranger | 2 | Tumble (`r_tumble`) | Shadowstrike (`r_shadow`) |
| Ranger | 3 | Spike Trap (`r_spike`) | Smoke Bomb (`r_smoke`) |
| Ranger | 4 | Hunter's Mark (`r_mark`) | Death Mark (`r_deathmark`) |
| Mage | 1 | Elemental Bolt (`m_bolt`) | Elemental Beam (`m_beam`) |
| Mage | 2 | Blink (`m_blink`) | Nova (`m_nova`) |
| Mage | 3 | Gravity Well (`m_gravity`) | Rune Barrier (`m_barrier`) |
| Mage | 4 | Attunement (`m_tempest`) | Elemental Overload (`m_overload`) |
| Reaper | 1 | Reap (`x_reap`) | Soul Cleave (`x_cleave`) |
| Reaper | 2 | Shadow Step (`x_step`) | Wraith Form (`x_wraith`) |
| Reaper | 3 | Void Pull (`x_pull`) | Soul Tether (`x_bind`) |
| Reaper | 4 | Soul Siphon (`x_siphon`) | Death Vortex (`x_vortex`) |
| Paladin | 1 | Shield Bash (`pal_bash`) | Smite (`pal_smite`) |
| Paladin | 2 | Taunt (`pal_taunt`) | Holy Ground (`pal_ground`) |
| Paladin | 3 | Guard Up (`pal_guard`) | Light Burst (`pal_burst`) |
| Paladin | 4 | Last Stand (`pal_laststand`) | Sky Hammer (`pal_sky`) |
| Necromancer | 1 | Summon Skeletons (`necro_summon`) | Plague Bolt (`necro_bolt`) |
| Necromancer | 2 | Raise the Dead (`necro_raise`) | Corpse Nova (`necro_nova`) |
| Necromancer | 3 | Bone Wall (`necro_wall`) | Death Grip (`necro_grip`) |
| Necromancer | 4 | Army of the Dead (`necro_army`) | Death Storm (`necro_storm`) |
| Ninja | 1 | Shadow Strike (`nin_strike`) | Shuriken Barrage (`nin_barrage`) |
| Ninja | 2 | Shadow Step (`nin_step`) | Smoke Bomb (`nin_smoke`) |
| Ninja | 3 | Death Mark (`nin_mark`) | Piercing Star (`nin_pierce`) |
| Ninja | 4 | Blade Fury (`nin_fury`) | Vanish (`nin_storm`) |
| Berserker | 1 | Cleave (`bsk_cleave`) | Headbutt (`bsk_bash`) |
| Berserker | 2 | Charge (`bsk_charge`) | Shockwave (`bsk_stomp`) |
| Berserker | 3 | Whirlwind (`bsk_whirl`) | Execute (`bsk_execute`) |
| Berserker | 4 | Berserk (`bsk_berserk`) | Bloodguard (`bsk_guard`) |
| Pirate | 1 | Aimed Shot (`pir_pierce`) | Broadside (`pir_volley`) |
| Pirate | 2 | Boarding Strike (`pir_shadow`) | Roll (`pir_tumble`) |
| Pirate | 3 | Powder Smoke (`pir_smoke`) | Gold Rush (`pir_goldrush`) |
| Pirate | 4 | Cannonade (`pir_deathmark`) | Powder Keg (`pir_spike`) |
| Chronomancer | 1 | Time Bolt (`chr_bolt`) | Time Lance (`chr_beam`) |
| Chronomancer | 2 | Slow Field (`chr_nova`) | Rewind (`chr_blink`) |
| Chronomancer | 3 | Time Warp (`chr_gravity`) | Aegis (`chr_barrier`) |
| Chronomancer | 4 | Time Storm (`chr_tempest`) | Singularity (`chr_overload`) |
| Monk | 1 | Flurry (`mon_flurry`) | Palm Strike (`mon_palm`) |
| Monk | 2 | Deflect (`mon_deflect`) | Roll (`mon_roll`) |
| Monk | 3 | Whirl Kick (`mon_whirl`) | Stunning Palm (`mon_stun`) |
| Monk | 4 | Thousand Fists (`mon_thousand`) | Dragon Kick (`mon_dragon`) |
| Stormcaller | 1 | Chain Bolt (`st_bolt`) | Lightning Lance (`st_lance`) |
| Stormcaller | 2 | Thunder Step (`st_step`) | Static Field (`st_nova`) |
| Stormcaller | 3 | Ball Lightning (`st_orb`) | Storm Barrier (`st_barrier`) |
| Stormcaller | 4 | Thunderstorm (`st_storm`) | Chain Reaction (`st_overload`) |
| Warlock | 1 | Shadow Bolt (`war_bolt`) | Blood Lance (`war_lance`) |
| Warlock | 2 | Curse Circle (`war_curse`) | Life Drain (`war_drain`) |
| Warlock | 3 | Rift Step (`war_step`) | Doom Orb (`war_orb`) |
| Warlock | 4 | Dark Storm (`war_storm`) | Final Curse (`war_final`) |
| Skylancer | 1 | Rising Spear (`sky_rise`) | Gale Shot (`sky_gale`) |
| Skylancer | 2 | Dive Strike (`sky_dive`) | Wind Lift (`sky_lift`) |
| Skylancer | 3 | Sky Dash (`sky_dash`) | Spear Rain (`sky_rain`) |
| Skylancer | 4 | Thunder Dive (`sky_crash`) | Updraft (`sky_cyclone`) |
| Bladedancer | 1 | Counter Stance (`bd_counter`) | Twin Cut (`bd_twin`) |
| Bladedancer | 2 | Riposte (`bd_riposte`) | Dance Step (`bd_step`) |
| Bladedancer | 3 | Mirror Guard (`bd_mirror`) | Cross Slash (`bd_cross`) |
| Bladedancer | 4 | Dance of Steel (`bd_steel`) | Perfect Counter (`bd_perfect`) |
| Beastmaster | 1 | Sic 'Em (`bst_sic`) | Coordinated Strike (`bst_coordinated`) |
| Beastmaster | 2 | Guardian Bond (`bst_guardian`) | Pack Step (`bst_step`) |
| Beastmaster | 3 | Mend the Pack (`bst_mend`) | Alpha Roar (`bst_roar`) |
| Beastmaster | 4 | Stampede (`bst_stampede`) | Apex Unleashed (`bst_apex`) |

Each ID has a dedicated `skill.<id>.cast` brief. Persistent phases and delayed outcomes have additional rows. No selectable skill is omitted.

## Ordinary enemies and interactive combat targets

| Code type | Identity | Cue count | Attack actions |
|---|---|---|---|
| grunt | Grunt | 5 | melee |
| flyer | Flyer | 6 | swoop |
| emberling | Emberling | 7 | claw, ignite |
| frostling | Frostling | 7 | claw, chill |
| toxling | Toxling | 7 | melee, volatile |
| shadeling | Shadeling | 8 | melee, fade |
| sparkling | Sparkling | 5 | contact |
| goblin | Treasure Goblin | 5 | Interactive target / non-attacker |
| bones | Skeleton | 8 | strike, rise |
| slime | Slime | 8 | hop, split |
| slimelet | Slimelet | 6 | hop |
| caster | Caster | 5 | orb |
| charger | Charger | 5 | ram |
| mimic | Mimic | 9 | reveal, bite, lunge |
| dustjackal | Dust Jackal | 6 | pounce |
| cragspitter | Crag Spitter | 5 | rock |
| galewisp | Gale Wisp | 5 | dive |
| thornboar | Thorn Boar | 6 | charge |
| sporeback | Sporeback | 8 | swipe, death_burst |
| sentinel | Animated Sentinel | 7 | strike |
| revenant | Revenant | 6 | lunge |
| dummy | dummy | 1 | Interactive target / non-attacker |
| bosscrystal | bosscrystal | 2 | Interactive target / non-attacker |
| frostshell | Frostshell | 6 | strike |
| frostlobber | Frost Lobber | 5 | shard |
| magmaskit | Magma Skitter | 8 | rush, trail |
| embertotem | Ember Totem | 5 | eruption |
| blinkstalker | Blink Stalker | 7 | blink, claw |
| voidtether | Void Tether | 7 | link |
| sunpriest | Sun Priest | 7 | bolt, heal |
| marblestatue | Marble Statue | 7 | strike |
| siegeknight | Siege Knight | 7 | strike, crush |
| royalarcanist | Royal Arcanist | 5 | volley |

Treasure Goblin flees rather than attacks. Dummy and boss crystal are impact/break targets. Corpses raised by Necromancer reuse the source creature action plus a restrained undead accent. Normal enemies use shared material impacts rather than a new body-hit file per weapon/species pairing.

## Current boss registry and planned replacements

| Runtime type | Catalog target | Treatment |
|---|---|---|
| brute | brute | Current plus new barrier-stagger arena |
| archer | marksman | Current plus planned nest relocation |
| warden | fallen | Human-sized Hollowed champion; old Bladeborn identity rejected |
| sorcerer | frost_caster | Current caster joins planned three-officer encounter |
| colossus | ember_colossus / marble_colossus | Separate material identity by region; shared code type does not mean shared sound |
| king | king_half / legion_commander | Do not preserve old early King story; replacement design pending |
| tyrant | king_full | Final full-Void form, not separate villain |

Hydra, Frost shield/spear officers, new arena devices and revised King narrative have planned rows. Legacy generic raid mechanics are tagged separately.

## Weapon archetype routing

| Runtime archetype | Core cue family | Element layer | Charge |
|---|---|---|
| sword | weapon.sword | none | none in registry |
| saber | weapon.sword | none | none in registry |
| dagger | weapon.dagger | none | none in registry |
| axe | weapon.axe | none | hurl |
| great | weapon.great | none | spin |
| hammer | weapon.hammer | none | quake |
| scythe | weapon.scythe | none | scythethrow |
| fist | weapon.fist | none | none in registry |
| flameblade | weapon.spellblade | fire | spellsweep |
| frostbrand | weapon.spellblade | ice | spellsweep |
| runeblade | weapon.spellblade | arcane | spellsweep |
| venomedge | weapon.spellblade | poison | spellsweep |
| umbrablade | weapon.spellblade | void | spellsweep |
| sunblade | weapon.spellblade | holy | spellsweep |
| lightbringer | weapon.spellblade | holy | spellsweep |
| voidscythe | weapon.scythe | void | scythethrow |
| iansblade | weapon.sword | holy | none in registry |
| bow | weapon.bow | none | powershot |
| crossbow | weapon.cross | none | none in registry |
| knives | weapon.dagger | none | daggerthrow |
| javelin | weapon.javelin | none | javelin |
| flintlock | weapon.pirate | none | none in registry |
| firestaff | weapon.staff | fire | bolt |
| frostwand | weapon.wand | ice | none in registry |
| arcaneorb | weapon.wand | arcane | none in registry |
| stormrod | weapon.wand | arcane | none in registry |
| plaguestaff | weapon.staff | poison | bolt |
| holyscepter | weapon.wand | holy | none in registry |

Pirate intrinsic weapon overrides charge to `sabersweep`; Monk fists do not currently have a charge. Retired saber/dagger IDs are aliases, and Reaper scythes are intrinsic, not loot. Do not generate unsupported sword/crossbow/wand/fist charge sounds. Ian's Blade gets an additional sacred signature; its ending use is a separate cutscene cue, never a free equipment award.

## Passives, innate traits and capstones

These are all inspected. Always-on numeric effects are deliberately silent. A discrete proc may use the listed small shared accent only when it communicates a real state change; do not add a sound per stat tick.

| Class | Choice/trait | Description | Audio policy |
|---|---|---|
| Warrior | Battle Ready | Basic attacks deal +8% damage and gain +15% interrupt resistance while attacking. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warrior | Unbroken Champion | Gain +10% damage, +10% attack speed, and 15% damage reduction. Skill hits restore 2% max HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warrior | Heavy Hand | Your basic attacks cannot be interrupted — and you cannot cancel them either. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warrior | Swift Steel | Every fourth basic attack is free and instant, ignoring your attack timer. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Warrior | Second Wind | Dropping below 35% HP restores 12% max HP once every 30s. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Warrior | Unyielding | You cannot be staggered, knocked back, or moved by anything. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warrior | Bloodlust | A kill keeps your Momentum stacks instead of resetting them. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warrior | Tactical Guard | After dodging, gain 20% damage reduction for 2s. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Warrior | Weapon Master | Warrior-family weapons deal +10% damage and skills cost 10% less mana. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warrior | Juggernaut | +15% knockback resistance and +8% damage reduction while moving. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Clear Aim | After 3s without taking direct damage: +10% damage and +10% ability range. A hit disables it until you avoid damage for 3s again. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Perfect Hunt | Clear Aim becomes Perfect Aim: +3% more damage, survives a 0.75s grace after a hit, and a kill while active cuts skill cooldowns by 0.5s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Longshot | +8% damage to enemies 7m+ away. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Close-Quarters Archer | Enemies within 4m are knocked back by every shot. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Escape Artist | After Tumble/Shadowstrike: −15% damage taken & −30% slows for 1.5s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Ambusher | After Tumble/Shadowstrike: next click within 3s +20% (once per 6s). | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Patient Hunter | Clear Aim 10%→14% damage, but needs 3.5s without a hit. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Quickdraw | Clear Aim activates after 2s instead of 3s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Elemental Archer | Your arrows carry the element of the ground they fly over. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ranger | Bounty Hunter | Marked enemies deal −8% to you; killing one heals 4% HP and gives +10% gold. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Arcane Attunement | Magic weapons deal +8% damage and restore 2 mana whenever a basic attack hits. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Archmage | +12% magic damage, +10% cooldown reduction, and every third skill refunds half its mana cost. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Potent Weave | Overcharge costs double mana and hits twice as hard. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Efficient Casting | Skills cost 15% less mana. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Glass Cannon | Below a quarter health your skills cost no mana at all. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Arcane Ward | Casting a skill grants a shield equal to 4% max HP for 3s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Elemental Savant | Overcharged attacks apply your weapon’s element instantly. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Temporal Focus | Standing still for 1.5s grants 15% cooldown recovery until you move. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Mage | Spell Echo | Every fourth skill repeats at 35% power without extra mana. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Mage | Manafont | +30% mana regeneration and +10 maximum mana. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Soul Hunger | Scythe damage heals 3% of damage dealt and slain enemies restore 2 mana. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Avatar of Death | +12% damage and lifesteal. Killing a marked or corrupted enemy reduces every cooldown by 0.75s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Harvested Strength | Souls you collect are spent on your next skill, making it free. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Lingering Doom | Marked enemies that die spread their mark to the nearest foe. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Soul Armor | Collecting a kill grants a 3% max-HP shield for 5s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Wraithwalk | After using mobility, gain +18% move speed for 2.5s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Crimson Harvest | Below half health, every soul you collect heals you outright. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Grave Chill | Corrupted enemies cannot flee — they walk toward you instead. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Corruption Mastery | Rupturing a corrupted enemy corrupts everything near it. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Reaper | Death's Favor | Elite and boss hits restore 1 mana; elite kills restore 8% HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Holy Warrior | While wielding a holy weapon, deal +12% damage and heal for 2% of the damage you deal. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Avatar of Light | Take 18% less damage and deal +10% damage. Holy weapons heal you for an extra 1% of the damage you deal. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Thick Armor | The first hit of every fight deals no damage at all. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Holy Power | Your Sworn target takes double damage from your skills. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Second Wind | Dropping below 35% HP heals you for 12% max HP (every 30s). | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Paladin | Burning Light | Killing your Sworn target sets every enemy near it alight. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Bounce Back | Damage you block is returned to whoever dealt it. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Healing Light | Every skill you cast heals the ally nearest you, or you if alone. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Guardian's Will | Take 15% less damage while below half HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Paladin | Blessed Blade | Your oath can be sworn at any range — mark without closing. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Death's Embrace | Magic weapons deal +8% damage, and every kill restores 3 mana and leaves a corpse you can raise. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Lich | +12% damage. Your Summon Skeletons and Army of the Dead minions never expire, and you may keep more of them at once. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Bone Legion | Summon one extra skeleton and your minions hit 20% harder. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Withering | Enemies standing on a corpse cannot heal and rot slowly. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Grave Bond | Each hit your minions land heals you a little. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Plague | An enemy that dies while rotting infects everything near it. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Undying | A killing blow instead consumes a minion, if you have one. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Soul Harvest | Kills restore an extra 8% of your max mana. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Master of Death | Keep more minions at once and they hit even harder. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Necromancer | Pestilence | Your minions leave a rotting trail wherever they walk. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Killer Instinct | Daggers and swords deal +8% damage and you move 8% faster. You can EVADE attacks entirely (they MISS) — and every dodge stacks +9% damage (up to 5), fading if you stop dodging. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Phantom | +12% damage, +10% attack speed, take 12% less damage, and evade even more often. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Swift | Unseen rearms in half the time — strike from behind twice as often. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Deadly Precision | An Unseen strike on an enemy below a third HP kills it outright. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Evasion | +12% chance to dodge attacks entirely (MISS), and take 10% less damage. Each dodge also stacks your damage. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Combo Edge | Killing with Unseen instantly rearms it — chain from body to body. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Ghostwalk | +8% dodge chance and take 10% less damage — slip through crowds. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Bleeding Edge | +10% damage — your cuts run deep. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Shadow Form | Take 12% less damage while below half HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Ninja | Assassinate | +12% damage. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Bloodrage | Deal +8% damage, and +15% more while below half HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Undying Rage | +12% damage, +10% attack speed, and +8% lifesteal. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Heavy Hands | You cannot dodge — but nothing can knock you back or stagger you. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Reckless | Every swing costs you a sliver of health, hit or miss. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Thick Hide | Damage that would drop you below 1 HP leaves you at 1 instead, once per fight. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Bloodthirst | Kills heal you — but only while you are below half health. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Rage | Below a quarter health you cannot be healed, and your damage doubles. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Frenzy | Your attack speed rises as your health falls, to double at a sliver. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Unbreakable | While below half health you cannot be stunned, slowed or feared. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Berserker | Brutal | Enemies below a quarter health die to any hit you land. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Plunder | Deal +8% damage and find more gold. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Dread Captain | +12% damage and +10% move speed. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Dead Aim | The pistol pierces every enemy in a line. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Quick Hands | Opening a chest reloads your pistol. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Sea Legs | You cannot be knocked off ledges or moving platforms. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Swagger | While your pistol is loaded you move noticeably faster. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Slippery | Firing the pistol pushes you back out of melee range. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Lucky | A pistol kill sometimes drops gold on the spot. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Cutthroat | Your sword hits harder while the pistol is spent. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Pirate | Greed | Every 500 gold you carry sharpens your blade a little further. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Chronomancer | Time Attunement | Magic weapons deal +8% damage, cooldowns recover 5% faster, and each kill loops a little mana back. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Chronomancer | Timelord | +12% damage and +10% cooldown reduction. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Chronomancer | Potent | Rewinding also restores the mana you had three seconds ago. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Chronomancer | Haste | Rewinding resets every skill cooldown. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Chronomancer | Time Ward | For three seconds after a Rewind you cannot be harmed. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Chronomancer | Focus | You may Rewind twice per area instead of once. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Chronomancer | Temporal Flow | Standing still rewinds your cooldowns rather than merely pausing them. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Chronomancer | Entropy | Enemies you slow keep aging — they weaken the longer they are held. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Chronomancer | Echo | Your last skill fires again, by itself, three seconds later. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Chronomancer | Deep Freeze | A frozen enemy shatters instantly if you strike it from behind. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Focus | Fists are your true weapon: +15% damage and faster strikes bare-handed. Every hit you land builds a Focus stack (up to 5) — each adds +6% damage — fading if you stop attacking. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Grandmaster | +12% damage, +10% attack speed, and your Focus stacks hit harder and linger longer. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Iron Body | While your dodge is ready, you cannot be stunned or knocked back. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Inner Fire | Dodging refunds mana instead of spending your rhythm. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Flow | Each hit shortens your dodge twice as much. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Focused Mind | Focus stacks build faster and your Focus damage is stronger. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Meditation | Slowly heal while you fight — a calm center. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Killer Focus | The first strike after a dodge hits for triple. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Still Water | Standing still for a moment restores health, and quickly. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Monk | Master Striker | Every fourth unbroken strike hits everything around you. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Stormcaller | Static Charge | Magic weapons deal +8% damage. Every hit you land builds a Static stack (up to 5) — each one makes you strike and move faster — fading if you stop attacking. The longer you fight, the faster the storm. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Storm Lord | +12% damage, +10% cooldown reduction, and your lightning arcs to more enemies. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Conductor | Wet, frozen or shocked enemies chain to everything near them. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Overcharge | Your lightning arcs to a third enemy as well as a second. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Momentum | Static stacks give even more attack and move speed. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Storm Ward | Casting a skill grants a shield equal to 4% max HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Charged | Your chain jumps twice as far between targets. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Amped | Each jump in a chain hits harder than the last, not weaker. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Static Master | A chained enemy is briefly stunned by the jolt. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Stormcaller | Galvanize | Chains that find no second target strike the first one twice. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Dark Bargain | Magic weapons deal +12% damage. Every skill sacrifices 3% max HP, but the sacrifice can never defeat you. Power always has a price. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Dark Ascension | +12% damage. Dark Bargain costs only 1.5% max HP, and defeating a cursed foe cuts every skill cooldown by 1 second. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Frail Power | +15% damage, but -10% maximum HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Soul Shield | Casting a skill grants a shield equal to 4% max HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Deep Curse | Deal 15% more damage to cursed enemies. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Dark Step | Casting a skill grants +12% move speed for 2.5 seconds. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Blood Pact | Deal +18% damage while below half HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Careful Casting | Dark Bargain sacrifices 35% less health. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Soul Feast | Defeating a cursed foe restores 5% max HP and 6 mana. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Warlock | Last Breath | Below 30% HP, gain 15% damage reduction. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Born to Fly | Ranged weapons deal +10% damage. While airborne, you fall 20% slower and deal 10% more damage. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Sky Master | +12% damage. Using a skill in the air renews one air jump and briefly holds you aloft. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | High Ground | The higher you are when you strike, the harder you land it. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Soft Landing | Take 15% less damage in the air and for 2 seconds after landing. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Tailwind | Landing grants +15% move speed for 3 seconds. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Cloud Guard | Using a skill in the air grants a shield equal to 6% max HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Long Flight | Fall 25% slower and gain more control in the air. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Hunter’s Eye | Attacking while falling drives you down onto the target. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Second Wind | Defeating an enemy in the air renews your air jump and trims dodge cooldown. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Skylancer | Sky Armor | Nothing can hit you in the first moment after a jump. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Bladedancer | Perfect Timing | Blade weapons deal +10% damage. A successful parry stores one Riposte charge for your counterattacks. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Bladedancer | Endless Dance | +12% damage. A successful parry refreshes your second skill and grants one second of speed and damage protection. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Bladedancer | Sharp Counter | A stored Riposte deals 35% more damage. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Bladedancer | Light Feet | Dodging through an enemy parries their next attack automatically. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Bladedancer | Patient Guard | Parry windows last 0.2 seconds longer. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Bladedancer | Fast Hands | A parry refunds the time your attack would have taken. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Bladedancer | Healing Counter | A successful parry restores 5% max HP. | Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle. |
| Bladedancer | Keep Moving | You cannot be hit while moving between two parries. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Bladedancer | Last Step | Below 35% HP, dodge cooldown is 20% shorter. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Bladedancer | Duelist Guard | Take 10% less damage from nearby enemies. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Bonded Companion | Your companion gains +25% max HP and +15% damage or healing, and catches up quickly across climbs. Without an equipped pet, a spectral wolf answers your commands. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | One Pack | +10% damage for you and your companion. Once per level, a lethal hit leaves your companion at 1 HP, briefly untargetable and shielded. Commands empower your next basic attack; basic attacks empower your companion. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Heavy Collar | +25% companion HP and +15% damage, but 10% slower attacks. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Swift Paws | +18% companion attack and movement speed; commands recover 12% faster. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Shared Vitality | Healing either partner also heals the other for 30% of that amount. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Predator's Rhythm | Basic attacks reduce all Beastmaster command cooldowns by 0.25s. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Blood Scent | +20% companion damage against marked, elite, boss, or wounded targets. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Wildkeeper | +20% companion healing and 12% damage reduction while it is below half HP. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Alpha's Authority | Companion attacks gain occasional splash damage and commands are 15% stronger. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |
| Beastmaster | Master Handler | Commands cost 15% less mana, recover 12% faster, and briefly speed you up. | Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone. |

## Existing file samples: replacement routing

The old registry is a migration checklist. Do not rename new files to misleading old filenames. Route context to new semantic events, and remove old/procedural layers one family at a time after testing.

| Existing key | Existing filename | Replacement direction |
|---|---|---|
| quest | fanfare-announcement-arrival.mp3 | reward.quest_complete |
| levelcheer | fanfare-celebration.mp3 | reward.player_level |
| footstep | footsteps-pair-soft-loopable.mp3 | move.foot.* surface one-shots; remove old generic loop |
| mobknock | bamboo-knock-loopable.mp3 | combat.hit.wood |
| forgeopen | blade-sharpening-loopable.mp3 | shop.forge.start |
| bookflip | book-flip-page.mp3 | ui.journal.page |
| chestopen | box-open.mp3 | chest.wood.open |
| wallbreak | break-object-small.mp3 | world.break.* |
| click | button-press.mp3 | ui.confirm |
| equip | cape-and-hood-drawn.mp3 | shop.equip.* |
| shopopen | cash-register-open-till.mp3 | npc.shop.direct |
| wallslide | chair-pull-up-2.mp3 | move.wall.slide |
| bigreveal | clanging-pipes-loopable.mp3 | quest.route.open or specific story cue |
| forgespin | coin-double-flip.mp3 | shop.forge.loop |
| dice | dice-rolling.mp3 | shop.gamble |
| doorslam | door-slam-heavy.mp3 | world.door.iron.close |
| dooropen | doorknock-heavy.mp3 | world.door.wood.open |
| drink | drink-2.mp3 | combat.heal + appropriate vessel action |
| electric | fence-electric-hum-loopable.mp3 | element.lightning.sustain |
| fireshot | fire-ignition-combustible-powder.mp3 | element.fire.release |
| firecharge | fire-launch-jet.mp3 | element.fire.release + weapon charge core |
| fireball | fireball-launched.mp3 | element.fire.release |
| heartbeat | heartbeat-rapid.mp3 | combat.lowhp.loop |
| frostclink | ice-clinking-in-glass.mp3 | combat.hit.ice |
| bigland | jump-soft-landing.mp3 | move.land.* |
| train | lifting-double-weight.mp3 | shop.train |
| bag | pickpocket-snatch-soft.mp3 | ui.bag.open |
| rain | rain-with-trickle-loopable.mp3 | env.rain |
| bonesdie | rocks-cliff-face-collapse.mp3 | enemy.bones.death |
| frostdie | snowball-hitting-surface-and-falling.mp3 | enemy.frostling.death |
| lever | switch-push.mp3 | world.lever |
| axeswing | axeswing.mp3 | weapon.axe.basic |
| swordswing | swordswing.mp3 | weapon.sword.basic |
| spearswing | spearswing.mp3 | weapon.javelin.basic |
| gruntdie | gruntdie.mp3 | enemy.grunt.death |
| forgedone | forgedone.mp3 | shop.forge.finish |
| warskill1 | warskill1.mp3 | skill.w_cleave.cast |
| warcharge | warcharge.mp3 | skill.w_charge.cast |
| rustyhit | rustyhit.mp3 | combat.hit.plate |
| portalopen | portalopen.mp3 | rift.open / world.waystone / gate.hollow.* by portal kind |
| stabkill | stabkill.mp3 | combat.hit.flesh + death once |
| heavyhit | heavyhit.mp3 | combat.hit.* by material |
| arcaneskill | arcaneskill.mp3 | specific skill.*.cast |
| secretget | secretget.mp3 | rift.shard.pickup |
| wandcharge | wandcharge.mp3 | only weapon with a real charge + element layer |
| wandfire | wandfire.mp3 | weapon.wand.basic + element layer |
| sell | sell.mp3 | shop.sell |
| lootpickup | lootpickup.mp3 | reward.loot |
| buy | buy.mp3 | shop.buy |
| mobvoice1 | mobvoice1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| mobvoice2 | mobvoice2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| bossroar1 | bossroar1.mp3 | boss.<identity>.entrance / defeat; named humanoids use human performance |
| bossroar2 | bossroar2.mp3 | boss.<identity>.entrance / defeat; named humanoids use human performance |
| bossroar3 | bossroar3.mp3 | boss.<identity>.entrance / defeat; named humanoids use human performance |
| bossdie | bossdie.mp3 | boss.<identity>.entrance / defeat; named humanoids use human performance |
| m_axe | m_axe.mp3 | combat.hit.* + weapon.axe.basic |
| m_gsmetal | m_gsmetal.mp3 | combat.hit.plate |
| m_gsplate | m_gsplate.mp3 | combat.hit.plate |
| m_gspunch | m_gspunch.mp3 | combat.hit.flesh |
| m_scythe | m_scythe.mp3 | combat.hit.* + weapon.scythe.basic |
| m_knives | m_knives.mp3 | combat.hit.* + weapon.dagger.basic |
| xbowclick | xbowclick.mp3 | weapon.cross.basic |
| xbowlatch | xbowlatch.mp3 | weapon.cross.reload |
| cast1 | cast1.mp3 | specific skill / enemy action warn + release |
| cast2 | cast2.mp3 | specific skill / enemy action warn + release |
| cast3 | cast3.mp3 | specific skill / enemy action warn + release |
| cast4 | cast4.mp3 | specific skill / enemy action warn + release |
| cast5 | cast5.mp3 | specific skill / enemy action warn + release |
| cast6 | cast6.mp3 | specific skill / enemy action warn + release |
| cast7 | cast7.mp3 | specific skill / enemy action warn + release |
| die1 | die1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| die2 | die2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| die3 | die3.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| die4 | die4.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| hurt1 | hurt1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| hurt2 | hurt2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| shatter | shatter.mp3 | combat.hit.ice or enemy.frostshell.crack |
| v_boargrunt | v_boargrunt.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_boarroar | v_boarroar.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_jackalbark | v_jackalbark.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_jackalhowl | v_jackalhowl.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_slime1 | v_slime1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_slime2 | v_slime2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_spit | v_spit.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_burble | v_burble.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_ghost1 | v_ghost1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_ghost2 | v_ghost2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_breath | v_breath.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_undead1 | v_undead1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_undead2 | v_undead2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_goblin | v_goblin.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_troll | v_troll.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_small1 | v_small1.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_small2 | v_small2.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_deep | v_deep.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_bossroar1 | v_bossroar1.mp3 | boss.<identity>.entrance / defeat; named humanoids use human performance |
| v_bossroar2 | v_bossroar2.mp3 | boss.<identity>.entrance / defeat; named humanoids use human performance |
| v_clank | v_clank.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| v_stone | v_stone.mp3 | enemy.<identity>.alert / hurt / death, not shared zombie voice |
| atk1 | atk1.mp3 | specific skill / enemy action warn + release |
| atk2 | atk2.mp3 | specific skill / enemy action warn + release |
| ma_stomp | ma_stomp.mp3 | specific enemy/boss warning, never generic for every species |
| mimicroar | mimicroar.mp3 | enemy.mimic.reveal.release |
| chestthunk | chestthunk.mp3 | enemy.mimic.bite.release |
| gamblecoins | gamblecoins.mp3 | shop.gamble |

Literal `playFx` keys absent from FXDEF in this snapshot: **firewhoosh, loot, shoot**. These are coverage risks to resolve in the integration pass, not newly introduced bugs. They may currently fall through silently.

Procedural call families also needing contextual routing: achieve, boss, classup, dodge, drop, enemyDie, god, growl, hit, hurt, jump, land, levelup, magic, pickup, shoot, slash, wand, win.

## NPC roster

| NPC / role | Region | Purpose |
|---|---|---|
| Thomas | Briar Town | dad reluctantly prepares you |
| Mara | Briar Town | medic treats villagers |
| Gus | Briar Town | mill worker supplies |
| Lewis | Briar Town | injured scout |
| Beth | Briar Town | shepherd and animal rescue |
| Caleb | Hollow Pass | escaped prisoner |
| Skip | Hollow Pass | climber |
| Captain Ward | Hollow Pass | Hollowed officer |
| Ruth | Hollow Pass | prisoner organizer |
| Grant | Ruined Keep | guard |
| Felix | Ruined Keep | locksmith |
| Walter | Ruined Keep | stoneworker |
| Sly | Ruined Keep | prisoner and optional restitution |
| Heath | Frostfell | mountain guide |
| Professor Ellis | Frostfell | rescued researcher |
| Hugo | Frostfell | explorer |
| Flint | Emberdeep | smith |
| Jack | Emberdeep | furnace worker |
| Foreman Pike | Emberdeep | Hollowed overseer |
| Martin | Emberdeep | worker organizer |
| Otto | Storm Coast | boatbuilder |
| Captain Rose | Storm Coast | male sailor |
| Abe | Storm Coast | fisher and hydra clue |
| Dash | Storm Coast | scavenger |
| Sister Grace | Sunspire | caretaker |
| Sergeant Victor | Sunspire | defender |
| Master Hugh | Sunspire | senior keeper |
| Simon | Sunspire | junior keeper |
| Roland | Duskmoor | armor maker and disguise |
| Gate Captain Cross | Duskmoor | Hollowed gate guard |
| Miles | Duskmoor | living servant and captive release |
| Quartermaster | Waystation | shopkeeper |
| The Smith | Waystation | forge services |
| Beastkeeper | Waystation | companions |
| Keeper | Waystation | appearance services |
| Drillmaster | Waystation | training |
| Rift guide | Rift Hall | repurposed Shade, final name unresolved |

All speech remains a separate line-by-line human/TTS recording workflow. The Rift guide name and individual trial mentor names remain unresolved.

## Deliberately silent or shared cases

- Repeated proximity prompt refreshes: no sound until meaningful target change, with cooldown.
- HP/XP numbers changing every frame: no tick spam.
- Always-on passive stat multipliers: silent.
- Continuous compass rotation: silent.
- Every corpse fading or red damage flash: no extra death layer unless it adds useful feedback.
- Every particle and every projectile in a dense volley: group/throttle source sounds.
- Paused enemy/hazard loops: suspend; NPC speech continues on its own bus.
- Secret shard sonar across the entire map: not allowed; near-field optional shimmer only.
- Armor rarity does not need a different footstep bank; add a restrained armor layer.
- Enemy skin/color variants can reuse the same biological family; meaningful elemental differences use overlays.
