# Class functionality and clarity audit — 2026-09-28

Version: 2.075.0-clear-class-choices.

## Implemented

- Reviewed all 16 class choice trees; retained saved choice identifiers. Added implementations for 23 previously unread passive IDs. Static wiring now reports 128/128, which is not a behavioral proof.
- Replaced opaque resource descriptions with triggers, percentages, durations and caps. Rebalanced several penalties and competing choices.
- Fractional lifesteal survives rounding. Personal projectiles enter player-class hit effects. Healing Light heals on successful casting.
- PvP uses shared incoming defenses and attacker calculations. Confirmed damage receipts drive lifesteal and elemental buildup; repeated packets cannot grant repeated healing. PvP sustain is reduced and control duration/immunity is bounded.

## Verification and limits

- Real browser: 128 skill handlers executed without exceptions/non-finite state; 16 targeted class assertions and 11 PvP/healing assertions passed.
- Pre-change save preserved class choice/rank, pets, currency, story clue/checkpoint and voice preference.
- PvP protocol tests used a local captured transport, not two real remote players. Latency, all individual passive interactions, all summons/status combinations and long-session PvP balance still need broader behavioral coverage. Do not mark those as exhaustively verified.
- Skill-handler smoke coverage does not establish correct damage, animation or targeting for every individual skill. The accompanying JSON identifies the concrete assertions.
- Browser local voice-api 404s are expected from the static test server.

## Current choice descriptions

### warrior

- Rank 2 — **Cleave** (`w_cleave`): A quick sweep hits nearby enemies. Short cooldown and low damage per cast.
- Rank 2 — **Shield Bash** (`w_bash`): Drive forward for 1.7x damage, stun the first target, and briefly brace.
- Rank 3 — **Heavy Hand** (`w_heavy`): Basic attacks deal 20% more damage.
- Rank 3 — **Swift Steel** (`w_swift`): Attack 10% faster. Every fourth basic attack lets you attack again immediately; every fourth basic hit deals 25% more damage.
- Rank 4 — **Charge** (`w_charge`): Rush through enemies for 1.6x damage and stun them.
- Rank 4 — **Whirlwind** (`w_whirl`): A full-circle sweep deals 2.2 times weapon damage to nearby enemies.
- Rank 5 — **Second Wind** (`w_second`): Dropping below 35% HP restores 12% max HP once every 30s.
- Rank 5 — **Unyielding** (`w_unyield`): Take 18% less damage while below half health.
- Rank 6 — **Iron Guard** (`w_guard`): Brace for 3s, reducing incoming damage by 60%.
- Rank 6 — **Shockwave Stomp** (`w_stomp`): Slam the ground for 1.5x damage and heavy knockback all around.
- Rank 7 — **Bloodlust** (`w_bloodlust`): Defeating an enemy grants 12% more damage and 12% faster attacks for 6 seconds. Another kill refreshes the duration.
- Rank 7 — **Tactical Guard** (`w_tactical`): After dodging, gain 20% damage reduction for 2s.
- Rank 8 — **Warcry** (`w_berserk`): Draw nearby enemies toward you for 6 seconds, helping protect your allies.
- Rank 8 — **Execution** (`w_execute`): A crushing 4x strike that executes normal enemies below 20% HP.
- Rank 9 — **Weapon Master** (`w_master`): Compatible weapons deal 10% more damage; skills cost 10% less mana. Stagger the same enemy every second basic hit instead of every third.
- Rank 9 — **Juggernaut** (`w_juggernaut`): +15% knockback resistance and +8% damage reduction while moving.

### ranger

- Rank 2 — **Volley** (`r_volley`): Fan of arrows — up to 5 enemies, 1.4x each. Applies your element once each.
- Rank 2 — **Piercing Shot** (`r_pierce`): One shot through a line — 2.2x first (−10% its armor), 1.5x rest.
- Rank 3 — **Longshot** (`r_longshot`): Deal 12% more damage to enemies at least 7 metres away.
- Rank 3 — **Close-Quarters Archer** (`r_closeq`): Basic hits push enemies within 4 metres farther away. Bosses resist the push.
- Rank 4 — **Tumble** (`r_tumble`): Roll backward with brief invulnerability and fire a parting shot for 75% weapon damage.
- Rank 4 — **Shadowstrike** (`r_shadow`): Dash through a target (2.0x) and appear behind it; tap again within 1s to return.
- Rank 5 — **Escape Artist** (`r_escape`): After dodging or using a movement skill, take 15% less damage for 2 seconds.
- Rank 5 — **Ambusher** (`r_ambush`): After Tumble/Shadowstrike: next click within 3s +20% (once per 6s).
- Rank 6 — **Spike Trap** (`r_spike`): Place a trap for 5 seconds that repeatedly damages and slows enemies inside.
- Rank 6 — **Smoke Bomb** (`r_smoke`): Become briefly invulnerable and slow nearby enemies with smoke.
- Rank 7 — **Patient Hunter** (`r_patient`): After 3 seconds without taking damage, your damage bonus rises from 10% to 18%.
- Rank 7 — **Quickdraw** (`r_quick`): Your 10% damage bonus activates after 2 seconds without taking damage instead of 3.
- Rank 8 — **Hunter's Mark** (`r_mark`): Mark one enemy: you deal +18% and +10% crit to it for 8s.
- Rank 8 — **Death Mark** (`r_deathmark`): Mark up to 5 enemies — they explode for 1.8x on death.
- Rank 9 — **Elemental Archer** (`r_elem`): Deal 12% more damage while using an elemental weapon.
- Rank 9 — **Bounty Hunter** (`r_bounty`): Marked enemies deal −8% to you; killing one heals 4% HP and gives +10% gold.

### mage

- Rank 2 — **Elemental Bolt** (`m_bolt`): Fire a quick elemental bolt. Short cooldown and low damage per cast.
- Rank 2 — **Elemental Beam** (`m_beam`): Fire a piercing elemental lance for 2x damage through every target.
- Rank 3 — **Potent Casting** (`m_potent`): Empowered basic hits deal 55% extra damage instead of 35%, for the same 6 mana. Magic skills deal 12% more damage.
- Rank 3 — **Efficient Casting** (`m_efficient`): Skills cost 15% less mana.
- Rank 4 — **Blink** (`m_blink`): Teleport forward and become untouchable during the displacement.
- Rank 4 — **Nova** (`m_nova`): Detonate a 1.4x freezing burst that slows nearby enemies.
- Rank 5 — **Last Reserve** (`m_glass`): Below half health, skills cost 40% less mana.
- Rank 5 — **Arcane Ward** (`m_ward`): Casting a skill grants a shield equal to 4% max HP for 3s.
- Rank 6 — **Gravity Well** (`m_gravity`): Create an implosion that pulls enemies inward and deals 1.3x damage.
- Rank 6 — **Rune Barrier** (`m_barrier`): Create a shield that absorbs 35% of max HP.
- Rank 7 — **Elemental Savant** (`m_savant`): Basic hits empowered by spending 6 mana also apply your weapon element.
- Rank 7 — **Temporal Focus** (`m_temporal`): After standing still for 1.5 seconds, skills you cast have 15% shorter cooldowns. Moving ends the bonus.
- Rank 8 — **Attunement** (`m_tempest`): Create a damaging storm for 4 seconds. For 10 seconds, casting skills cycles your weapon element.
- Rank 8 — **Elemental Overload** (`m_overload`): Release a massive 3.4x elemental explosion around your target.
- Rank 9 — **Spell Echo** (`m_echo`): Every fourth skill repeats at 35% power without extra mana.
- Rank 9 — **Manafont** (`m_manafont`): +30% mana regeneration and +10 maximum mana.

### reaper

- Rank 2 — **Reap** (`x_reap`): A quick scythe sweep damages nearby enemies and restores health when it hits.
- Rank 2 — **Soul Cleave** (`x_cleave`): Send a spectral scythe wave outward for 2.1x damage.
- Rank 3 — **Harvested Strength** (`x_strength`): Defeating an enemy makes your next skill cost no mana. Stores one free cast at a time.
- Rank 3 — **Lingering Doom** (`x_doom`): Your damage-over-time marks last 20% longer.
- Rank 4 — **Shadow Step** (`x_step`): Dash through shadow and become briefly untouchable.
- Rank 4 — **Wraith Form** (`x_wraith`): Become spectral for 3s: faster movement and 65% damage reduction.
- Rank 5 — **Soul Armor** (`x_armor`): Collecting a kill grants a 3% max-HP shield for 5s.
- Rank 5 — **Wraithwalk** (`x_wraithwalk`): After using mobility, gain +18% move speed for 2.5s.
- Rank 6 — **Void Pull** (`x_pull`): Implode nearby enemies toward a central point and stagger them.
- Rank 6 — **Soul Tether** (`x_bind`): Bind enemies in front of you, rooting them for 2.5s.
- Rank 7 — **Crimson Harvest** (`x_crimson`): Defeating an enemy while below half health restores 5% of your maximum health (at least 3 HP).
- Rank 7 — **Grave Chill** (`x_chill`): Enemies affected by your void weapon effect move 18% slower.
- Rank 8 — **Soul Siphon** (`x_siphon`): A powerful draining sweep damages nearby enemies and heals 5% of your maximum health per enemy damaged. Healing is halved against players.
- Rank 8 — **Death Vortex** (`x_vortex`): Create a persistent soul storm that damages and corrupts enemies.
- Rank 9 — **Corruption Mastery** (`x_corrupt`): Your void weapon effect builds 25% faster. When a charged attack or skill bursts a fully affected target, the burst deals 15% more damage and spreads the effect to nearby enemies.
- Rank 9 — **Death's Favor** (`x_favor`): Elite and boss hits restore 1 mana; elite kills restore 8% HP.

### paladin

- Rank 2 — **Shield Bash** (`pal_bash`): Drive forward for 1.7x damage, stun the first foe, and brace behind your shield.
- Rank 2 — **Smite** (`pal_smite`): Call a holy thunderbolt down on the toughest enemy nearby, with a holy splash — great against bosses and elites.
- Rank 3 — **Thick Armor** (`pal_thick`): Ignore an incoming hit after 5 seconds without being hit.
- Rank 3 — **Holy Power** (`pal_holypow`): Skills deal double damage to the first enemy you hit in a fight, until that enemy dies.
- Rank 4 — **Taunt** (`pal_taunt`): Pull nearby foes to you and brace behind a shield.
- Rank 4 — **Holy Ground** (`pal_ground`): Scorch every foe around you with holy light for 2.2x damage.
- Rank 5 — **Second Wind** (`pal_second`): Dropping below 35% HP heals you for 12% max HP (every 30s).
- Rank 5 — **Burning Light** (`pal_burn`): Defeating the first enemy you hit in a fight spreads fire to nearby enemies.
- Rank 6 — **Guard Up** (`pal_guard`): Raise a holy shield that absorbs up to 50% of your max HP. Briefly plant your feet (0.3s); dodge to cancel the stance.
- Rank 6 — **Light Burst** (`pal_burst`): A radiant burst: damage and slow every nearby foe.
- Rank 7 — **Bounce Back** (`pal_bounce`): Damage you block is returned to whoever dealt it.
- Rank 7 — **Healing Light** (`pal_heal`): Casting a skill restores 4% of your maximum health.
- Rank 8 — **Last Stand** (`pal_laststand`): Brace for 4 seconds, reducing incoming damage and reflecting nearby hits. Immediately restore 15% of your maximum health.
- Rank 8 — **Sky Hammer** (`pal_sky`): Call a pillar of light down: heavy damage and knockback all around you.
- Rank 9 — **Guardian's Will** (`pal_will`): Take 15% less damage while below half HP.
- Rank 9 — **Blessed Blade** (`pal_blessed`): Your basic attack can select your first target before it hits, immediately granting your protection from other enemies.

### necromancer

- Rank 2 — **Summon Skeletons** (`necro_summon`): Raise a pack of skeletons that hunt down nearby enemies.
- Rank 2 — **Plague Bolt** (`necro_bolt`): Rapid-fire bolts of necrotic plague (~2s, softer each).
- Rank 3 — **Bone Legion** (`necro_legion`): Summon one extra skeleton and your minions hit 20% harder.
- Rank 3 — **Withering Magic** (`necro_wither`): Your own attacks and skills deal 12% more damage.
- Rank 4 — **Raise the Dead** (`necro_raise`): Raise your most recently slain nearby enemy as an undead ally.
- Rank 4 — **Corpse Nova** (`necro_nova`): Detonate a burst of bone shards that slows nearby enemies.
- Rank 5 — **Grave Bond** (`necro_bond`): Each minion attack restores 0.6% of your maximum health (at least 1 HP).
- Rank 5 — **Plague** (`necro_plague`): Defeating an enemy poisons nearby enemies. The poison refreshes instead of stacking without limit.
- Rank 6 — **Bone Wall** (`necro_wall`): Raise a shield of bone that absorbs up to 35% of your max HP. Briefly plant your feet (0.3s); dodge to cancel the stance.
- Rank 6 — **Death Grip** (`necro_grip`): A skeletal grip implodes enemies inward and deals damage.
- Rank 7 — **Undying** (`necro_undying`): Take 12% less damage. A lethal hit sacrifices one of your minions to save you, if one is available.
- Rank 7 — **Soul Harvest** (`necro_harvest`): Kills restore an extra 8% of your max mana.
- Rank 8 — **Army of the Dead** (`necro_army`): Raise a whole undead host at once to overwhelm the field. Briefly plant your feet (0.3s); dodge to cancel the stance.
- Rank 8 — **Death Storm** (`necro_storm`): A storm of decay rages around you for 4s.
- Rank 9 — **Master of Death** (`necro_master`): Keep 6 more minions. Newly summoned minions deal 25% more damage.
- Rank 9 — **Pestilence** (`necro_pest`): Your own attacks and skills deal 20% more damage to poisoned enemies.

### ninja

- Rank 2 — **Shadow Strike** (`nin_strike`): Blink to the nearest enemy and strike for heavy damage.
- Rank 2 — **Shuriken Barrage** (`nin_barrage`): Fire three back-to-back shotgun bursts of stars — shreds packs of enemies.
- Rank 3 — **Swift** (`nin_swift`): Stand still for only 0.5 seconds instead of 1 to prepare your next basic hit: teleport behind the target and deal 50% extra damage.
- Rank 3 — **Deadly Precision** (`nin_deadly`): After standing still for 1 second, your next basic hit finishes a normal enemy below one-third health. Bosses and players take 25% extra damage instead.
- Rank 4 — **Shadow Step** (`nin_step`): Dash through shadow and become briefly untouchable.
- Rank 4 — **Smoke Bomb** (`nin_smoke`): Vanish in smoke (briefly invulnerable) and slow nearby foes.
- Rank 5 — **Evasion** (`nin_evasive`): Gain 12 percentage points of automatic evasion and take 10% less damage.
- Rank 5 — **Combo Edge** (`nin_combo`): A kill with your prepared teleporting basic hit immediately prepares another, without needing to stand still.
- Rank 6 — **Death Mark** (`nin_mark`): Mark a target: it takes extra damage from you.
- Rank 6 — **Piercing Star** (`nin_pierce`): Hurl one massive shuriken that pierces straight through — huge single-target damage for bosses.
- Rank 7 — **Ghostwalk** (`nin_ghost`): +8% dodge chance and take 10% less damage — slip through crowds.
- Rank 7 — **Bleeding Edge** (`nin_bleed`): +10% damage — your cuts run deep.
- Rank 8 — **Blade Fury** (`nin_fury`): +35% damage and attack speed for 6s.
- Rank 8 — **Vanish** (`nin_storm`): Become invulnerable for 4 seconds and prepare your next teleporting basic hit immediately.
- Rank 9 — **Shadow Form** (`nin_shadowform`): Take 18% less damage while below half health.
- Rank 9 — **Assassinate** (`nin_assassin`): +12% damage.

### berserker

- Rank 2 — **Blood Sweep** (`bsk_cleave`): Spend 10% of your maximum health to sweep nearby enemies for 2.6 times weapon damage. Cannot be used if the cost would leave you below 2 HP.
- Rank 2 — **Headbutt** (`bsk_bash`): Strike nearby enemies for 2.2 times weapon damage and stun them for 2.2 seconds. On a hit, spend 6% maximum health and pause for 0.5 seconds.
- Rank 3 — **Steady Fighter** (`bsk_heavy`): Take 12% less damage and resist enemy knockback. You can still dodge.
- Rank 3 — **Growing Rage** (`bsk_reckless`): Each kill grants 4% more damage, up to 20%. The bonus ends after 6 seconds without a kill.
- Rank 4 — **Charge** (`bsk_charge`): Rush forward, damaging and stunning in your path.
- Rank 4 — **Shockwave** (`bsk_stomp`): Slam the ground for damage and heavy knockback.
- Rank 5 — **Thick Hide** (`bsk_thick`): Survive a lethal hit at 1 HP. Rearms after 5 seconds without taking damage.
- Rank 5 — **Bloodthirst** (`bsk_blood`): Each kill restores 4% of your maximum health.
- Rank 6 — **Whirlwind** (`bsk_whirl`): Sweep all nearby enemies for 2.2 times weapon damage.
- Rank 6 — **Execute** (`bsk_execute`): A brutal strike that finishes low-HP foes.
- Rank 7 — **Rage** (`bsk_rage`): Basic attacks deal 50% more damage while below half health. Healing still works.
- Rank 7 — **Frenzy** (`bsk_frenzy`): Attack faster as health falls, up to 50% faster near zero health.
- Rank 8 — **Berserk** (`bsk_berserk`): +35% damage and attack speed for 6s.
- Rank 8 — **Bloodguard** (`bsk_guard`): Raise a guard: heavy damage reduction and pull foes in.
- Rank 9 — **Unbreakable** (`bsk_tough`): Take 20% less damage while below half health.
- Rank 9 — **Brutal** (`bsk_brutal`): Basic hits finish normal enemies below one-quarter health. Bosses and players take 25% extra damage below that threshold.

### pirate

- Rank 2 — **Aimed Shot** (`pir_pierce`): Rapid piercing pistol shots (~2s, softer each) — a gunslinger's rhythm.
- Rank 2 — **Broadside** (`pir_volley`): A spread of shots across your front.
- Rank 3 — **Dead Aim** (`pir_deadly`): Basic attacks deal 15% more damage, including your built-in pistol.
- Rank 3 — **Quick Hands** (`pir_swift`): Attack 15% faster with any compatible weapon, including your built-in pistol.
- Rank 4 — **Boarding Strike** (`pir_shadow`): Dash to a foe and strike hard.
- Rank 4 — **Roll** (`pir_tumble`): Roll back with a parting shot and snare.
- Rank 5 — **Sea Legs** (`pir_tough`): Take 12% less damage.
- Rank 5 — **Swagger** (`pir_swagger`): Move 12% faster, with any compatible weapon.
- Rank 6 — **Powder Smoke** (`pir_smoke`): Vanish in smoke and slow nearby foes.
- Rank 6 — **Gold Rush** (`pir_goldrush`): For 12s, every kill drops gold straight into your purse — and a killstreak stacks the payout higher and higher. The pirate's farming tool.
- Rank 7 — **Slippery** (`pir_evasive`): Dodge cooldown is 20% shorter.
- Rank 7 — **Lucky** (`pir_luck`): Earn 25% more gold from defeated enemies and other gold rewards. Selling items is unchanged.
- Rank 8 — **Cannonade** (`pir_deathmark`): Mark foes — they explode on death.
- Rank 8 — **Powder Keg** (`pir_spike`): Drop a trap that damages and snares.
- Rank 9 — **Cutthroat** (`pir_brutal`): Deal 20% more damage to enemies below half health.
- Rank 9 — **Greed** (`pir_greed`): Deal 12% more damage with any compatible weapon. You do not need to hoard gold.

### chronomancer

- Rank 2 — **Time Bolt** (`chr_bolt`): Rapid-fire bolts of temporal energy (~2s, softer each).
- Rank 2 — **Time Lance** (`chr_beam`): A piercing lance through every foe.
- Rank 3 — **Potent** (`chr_potent`): When a lethal hit triggers your automatic rewind, also restore the mana you had 3 seconds earlier, if it was higher.
- Rank 3 — **Haste** (`chr_haste`): Skills have 10% shorter cooldowns. Your automatic death-saving rewind also refreshes every skill.
- Rank 4 — **Slow Field** (`chr_nova`): A burst that slows nearby foes.
- Rank 4 — **Time Step** (`chr_blink`): Teleport forward with brief invulnerability. Your automatic death-saving rewind is a separate class ability.
- Rank 5 — **Time Ward** (`chr_ward`): Take 12% less damage. After your automatic death-saving rewind, become invulnerable for 3 seconds instead of 1.2.
- Rank 5 — **Second Chance** (`chr_glass`): Your automatic rewind can save you from death twice per area instead of once.
- Rank 6 — **Time Warp** (`chr_gravity`): Implode foes inward and deal damage.
- Rank 6 — **Aegis** (`chr_barrier`): A shield that absorbs up to 35% of your max HP.
- Rank 7 — **Temporal Flow** (`chr_temporal`): All skills have 10% shorter cooldowns.
- Rank 7 — **Weak Point** (`chr_slow`): Deal 20% more damage to slowed enemies.
- Rank 8 — **Stop Time** (`chr_tempest`): Stop enemies for 3 seconds. In PvP, slow opponents by 25% for up to 1.5 seconds instead of freezing their controls.
- Rank 8 — **Singularity** (`chr_overload`): A massive temporal explosion.
- Rank 9 — **Echo** (`chr_echo`): Your last skill fires again, by itself, three seconds later.
- Rank 9 — **Deep Chill** (`chr_freeze`): Your skill hits slow enemies for 1.5 seconds. Bosses may resist slowing.

### monk

- Rank 2 — **Flurry** (`mon_flurry`): Deliver rapid punches. Each connecting hit builds your temporary damage bonus.
- Rank 2 — **Palm Strike** (`mon_palm`): Dash in with a heavy palm that staggers the first foe.
- Rank 3 — **Iron Body** (`mon_iron`): Take 12% less damage while your dodge is ready.
- Rank 3 — **Inner Fire** (`mon_fire`): Dodging restores 5 mana.
- Rank 4 — **Deflect** (`mon_deflect`): A parry stance: for a moment take almost nothing and throw blows straight back.
- Rank 4 — **Roll** (`mon_roll`): Roll aside with brief i-frames and a parting strike.
- Rank 5 — **Flow** (`mon_flow`): Each basic hit removes 0.7 seconds from your remaining dodge cooldown instead of 0.35.
- Rank 5 — **Focused Mind** (`mon_focused`): Each hit builds 8% extra damage instead of 6%, up to 40% (56% at rank 10). The bonus ends after 5 seconds without a hit instead of 4.
- Rank 6 — **Whirl Kick** (`mon_whirl`): A spinning kick that strikes everything around you.
- Rank 6 — **Stunning Palm** (`mon_stun`): A shockwave palm that dazes and slows nearby foes.
- Rank 7 — **Meditation** (`mon_med`): Restore 1.2% of your maximum health each second.
- Rank 7 — **Killer Focus** (`mon_killer`): The first strike after a dodge hits for triple.
- Rank 8 — **Stillness** (`mon_thousand`): For 6 seconds, standing still reflects double incoming damage back to attackers. You still take damage.
- Rank 8 — **Dragon Kick** (`mon_dragon`): A soaring kick that erupts on impact, blasting everything around.
- Rank 9 — **Still Water** (`mon_still`): After standing still for 1.5 seconds, restore 2% of your maximum health each second until you move.
- Rank 9 — **Master Striker** (`mon_master`): Every fourth hit within your temporary damage-bonus window also strikes nearby enemies. Waiting more than 4 seconds between hits breaks the chain (5 with Focused Mind).

### stormcaller

- Rank 2 — **Chain Bolt** (`st_bolt`): Fire a quick lightning bolt with a short cooldown.
- Rank 2 — **Lightning Lance** (`st_lance`): A piercing bolt through every foe in a line.
- Rank 3 — **Conductor** (`st_conductor`): Lightning from basic hits deals 50% damage to the nearby enemy instead of 34%.
- Rank 3 — **Overcharge** (`st_overcharge`): Your lightning arcs to a third enemy as well as a second.
- Rank 4 — **Thunder Step** (`st_step`): Blink in a crack of lightning, briefly untouchable.
- Rank 4 — **Static Field** (`st_nova`): A shock burst that slows nearby foes.
- Rank 5 — **Gathering Speed** (`st_momentum`): Each hit grants 4.5% attack speed and 4% move speed, up to 22.5% and 20%. Bonuses end after 4 seconds without a hit.
- Rank 5 — **Storm Ward** (`st_ward`): Casting a skill grants a shield worth 4% of your maximum health for at least 3 seconds. Repeated casts refresh it, not add shields.
- Rank 6 — **Ball Lightning** (`st_orb`): A crackling orb that pulls foes in and zaps them.
- Rank 6 — **Storm Barrier** (`st_barrier`): A shield that absorbs up to 35% of your max HP.
- Rank 7 — **Charged** (`st_charged`): Your chain jumps twice as far between targets.
- Rank 7 — **Amped** (`st_amped`): Lightning from basic hits deals 50% more damage to secondary enemies.
- Rank 8 — **Linked Lightning** (`st_storm`): Link nearby enemies for 8 seconds. Hitting one also damages the others.
- Rank 8 — **Chain Reaction** (`st_overload`): A massive electric explosion around your target.
- Rank 9 — **Stunning Lightning** (`st_master`): Lightning from basic hits briefly stuns secondary enemies for 0.4 seconds. Bosses and players are excluded.
- Rank 9 — **Galvanize** (`st_galvanize`): When no secondary enemy is in range, lightning strikes your original target for an extra 34% damage.

### warlock

- Rank 2 — **Shadow Bolt** (`war_bolt`): Fire a fast void bolt that pierces one extra foe.
- Rank 2 — **Blood Lance** (`war_lance`): Hurl a heavy crimson lance through every foe in a line.
- Rank 3 — **Dark Power** (`war_frail`): Deal 15% more damage. Maximum health is unchanged.
- Rank 3 — **Soul Shield** (`war_shield`): Casting a skill grants a shield worth 4% of your maximum health for at least 3 seconds. Repeated casts refresh it, not add shields.
- Rank 4 — **Curse Circle** (`war_curse`): Mark nearby foes for 7 seconds. Your damage against them is increased.
- Rank 4 — **Life Drain** (`war_drain`): Rip health from the strongest nearby foe and heal yourself.
- Rank 5 — **Deep Curse** (`war_deep`): Deal 15% more damage to cursed enemies.
- Rank 5 — **Dark Step** (`war_swift`): Casting a skill grants +12% move speed for 2.5 seconds.
- Rank 6 — **Rift Step** (`war_step`): Blink forward and detonate shadow at your starting point and destination.
- Rank 6 — **Doom Orb** (`war_orb`): Collapse a slow void orb on your target, damaging and pulling nearby foes.
- Rank 7 — **Blood Pact** (`war_pact`): Deal +18% damage while below half HP.
- Rank 7 — **Careful Casting** (`war_safe`): Skills sacrifice 35% less health. Does not reduce the separate health cost of basic attacks or Blood Offering.
- Rank 8 — **Blood Offering** (`war_storm`): Spend half your current health to deal that much damage to every nearby enemy. Normal skill health cost also applies.
- Rank 8 — **Final Curse** (`war_final`): Condemn the strongest nearby foe with a massive delayed shadow blast.
- Rank 9 — **Soul Feast** (`war_feast`): Defeating a cursed foe restores 5% max HP and 6 mana.
- Rank 9 — **Last Breath** (`war_last`): Below 30% HP, gain 15% damage reduction.

### skylancer

- Rank 2 — **Rising Spear** (`sky_rise`): Sweep nearby enemies and launch high into the air.
- Rank 2 — **Gale Shot** (`sky_gale`): Fire a fast wind spear that grows stronger while airborne.
- Rank 3 — **High Ground** (`sky_high`): Deal 15% more damage while airborne.
- Rank 3 — **Soft Landing** (`sky_soft`): Take 15% less damage in the air and for 2 seconds after landing.
- Rank 4 — **Dive Strike** (`sky_dive`): Dive forward. Your next landing damages nearby enemies.
- Rank 4 — **Wind Lift** (`sky_lift`): Create a rising wind that damages foes and launches you upward.
- Rank 5 — **Tailwind** (`sky_tail`): Landing grants +15% move speed for 3 seconds.
- Rank 5 — **Cloud Guard** (`sky_guard`): Using a skill in the air grants a shield equal to 6% max HP.
- Rank 6 — **Sky Dash** (`sky_dash`): Dash through the air, damaging every enemy in your path.
- Rank 6 — **Spear Rain** (`sky_rain`): Call down five wind spears around your target.
- Rank 7 — **Long Flight** (`sky_float`): Fall 45% slower instead of 20% slower.
- Rank 7 — **Hunter’s Eye** (`sky_eye`): Attacking while falling drives you down onto the target.
- Rank 8 — **Thunder Dive** (`sky_crash`): Drop like lightning. Your next landing creates a large shockwave.
- Rank 8 — **Updraft** (`sky_cyclone`): Lift nearby normal enemies for 3.2 seconds and strike with a ring of wind blades.
- Rank 9 — **Second Wind** (`sky_reset`): An airborne kill restores one air jump and removes 1.5 seconds from your dodge cooldown.
- Rank 9 — **Sky Armor** (`sky_armor`): Become invulnerable for 0.18 seconds after jumping.

### bladedancer

- Rank 2 — **Counter Stance** (`bd_counter`): Open a short parry window. A hit during it deals no damage and stores a Riposte.
- Rank 2 — **Twin Cut** (`bd_twin`): Cut twice in a wide arc. The second cut pushes enemies back.
- Rank 3 — **Sharp Counter** (`bd_sharp`): After a successful parry, Riposte hits for 4.4 times weapon damage instead of 3.3. Requires the Riposte skill.
- Rank 3 — **Light Feet** (`bd_feet`): Move 10% faster. Dodging through an enemy opens a 0.65-second parry window.
- Rank 4 — **Riposte** (`bd_riposte`): Lunge and slash. A stored Riposte greatly increases its damage and reach.
- Rank 4 — **Dance Step** (`bd_step`): Dash through enemies and turn to face them for your next attack.
- Rank 5 — **Patient Guard** (`bd_patient`): Parry windows last 0.2 seconds longer.
- Rank 5 — **Fast Hands** (`bd_fast`): Attack 12% faster. A successful parry also lets you attack again immediately.
- Rank 6 — **Mirror Guard** (`bd_mirror`): Open a parry window that releases a shockwave when it catches an attack.
- Rank 6 — **Cross Slash** (`bd_cross`): Cut an X ahead of you and leave enemies briefly stunned.
- Rank 7 — **Healing Counter** (`bd_heal`): A successful parry restores 5% max HP.
- Rank 7 — **Keep Moving** (`bd_flow`): A successful parry grants 20% damage reduction for 3 seconds.
- Rank 8 — **Perfect Guard** (`bd_steel`): Prepare a parry for up to 3 seconds. The first incoming hit is blocked and prepares an empowered Riposte.
- Rank 8 — **Perfect Counter** (`bd_perfect`): Hold a long parry stance. Catching a hit unleashes a massive counterattack.
- Rank 9 — **Last Step** (`bd_last`): Below 35% HP, dodge cooldown is 20% shorter.
- Rank 9 — **Duelist Guard** (`bd_guard`): Take 10% less damage from attackers within 6 metres.

### beastmaster

- Rank 2 — **Sic 'Em** (`bst_sic`): Your companion lunges for 1.6x damage and briefly stuns.
- Rank 2 — **Coordinated Strike** (`bst_coordinated`): You and your companion strike together; the target is marked for increased companion damage.
- Rank 3 — **Heavy Collar** (`bst_heavy`): Your companion gains 25% more maximum health and deals 15% more damage.
- Rank 3 — **Swift Paws** (`bst_swift`): Your companion moves 18% faster and attacks 18% more often. Commands have 12% shorter cooldowns.
- Rank 4 — **Guardian Bond** (`bst_guardian`): For 4s your companion intercepts part of incoming damage and gains a shield.
- Rank 4 — **Pack Step** (`bst_step`): You and your companion dash to opposite sides of the target with brief dodge protection.
- Rank 5 — **Shared Vitality** (`bst_vitality`): Healing either partner also heals the other for 30% of that amount.
- Rank 5 — **Predator's Rhythm** (`bst_rhythm`): Basic attacks reduce all Beastmaster command cooldowns by 0.25s.
- Rank 6 — **Mend the Pack** (`bst_mend`): Restore 30% companion HP and 10% player HP over time.
- Rank 6 — **Alpha Roar** (`bst_roar`): A damaging roar slows nearby foes and turns their attention toward your companion.
- Rank 7 — **Blood Scent** (`bst_scent`): Companion damage increases 20% against marked enemies, bosses, elites, and enemies below 35% health.
- Rank 7 — **Wildkeeper** (`bst_wildkeeper`): +20% companion healing and 12% damage reduction while it is below half HP.
- Rank 8 — **Stampede** (`bst_stampede`): Call a spectral herd through a wide lane, striking and knocking enemies aside.
- Rank 8 — **Apex Unleashed** (`bst_apex`): For 8s your companion gains +35% damage/healing, +30% speed, and relentless pursuit.
- Rank 9 — **Alpha's Authority** (`bst_authority`): Commands deal 15% more damage. Companion hits have a 28% chance to splash 35% damage onto nearby enemies.
- Rank 9 — **Master Handler** (`bst_handler`): Commands cost 15% less mana and have 12% shorter cooldowns. Casting one grants 10% move speed for 2 seconds.
