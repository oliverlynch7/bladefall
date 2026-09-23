/* Supplied original score. Scene names are cues, not additions to game canon. */
(function(root){'use strict';
const tracks={
  "archives_of_the_archmage": {
    "title": "Archives of the Archmage",
    "url": "/music/bladefall/Archives_of_the_Archmage.mp3"
  },
  "chains_of_the_deep": {
    "title": "Chains of the Deep",
    "url": "/music/bladefall/Chains_of_the_Deep.mp3"
  },
  "crystalline_trials": {
    "title": "Crystalline Trials",
    "url": "/music/bladefall/Crystalline_Trials.mp3"
  },
  "hall_of_the_violet_discipline": {
    "title": "Hall of the Violet Discipline",
    "url": "/music/bladefall/Hall_of_the_Violet_Discipline.mp3"
  },
  "navigating_the_red_wake": {
    "title": "Navigating the Red Wake",
    "url": "/music/bladefall/Navigating_the_Red_Wake.mp3"
  },
  "passing_the_flame": {
    "title": "Passing the Flame",
    "url": "/music/bladefall/Passing_the_Flame.mp3"
  },
  "safe_harbor": {
    "title": "Safe Harbor",
    "url": "/music/bladefall/Safe_Harbor.mp3"
  },
  "the_archive_of_violet_portals": {
    "title": "The Archive of Violet Portals",
    "url": "/music/bladefall/The_Archive_of_Violet_Portals.mp3"
  },
  "the_breaking_of_the_keeps": {
    "title": "The Breaking of the Keeps",
    "url": "/music/bladefall/The_Breaking_of_the_Keeps.mp3"
  },
  "the_fallen_champion_duel": {
    "title": "The Fallen Champion Duel",
    "url": "/music/bladefall/The_Fallen_Champion_Duel.mp3"
  },
  "the_last_spark_of_darrow": {
    "title": "The Last Spark of Darrow",
    "url": "/music/bladefall/The_Last_Spark_of_Darrow.mp3"
  },
  "the_shore_of_broken_ships": {
    "title": "The Shore of Broken Ships",
    "url": "/music/bladefall/The_Shore_of_Broken_Ships.mp3"
  },
  "the_wayfarers_hearth": {
    "title": "The Wayfarers Hearth",
    "url": "/music/bladefall/The_Wayfarers_Hearth.mp3"
  },
  "the_waystation_refuge": {
    "title": "The Waystation Refuge",
    "url": "/music/bladefall/The_Waystation_Refuge.mp3"
  },
  "through_the_void_breach": {
    "title": "Through the Void Breach",
    "url": "/music/bladefall/Through_the_Void_Breach.mp3"
  },
  "towering_sea_cliffs": {
    "title": "Towering Sea Cliffs",
    "url": "/music/bladefall/Towering_Sea_Cliffs.mp3"
  },
  "unburdening_the_colossus": {
    "title": "Unburdening the Colossus",
    "url": "/music/bladefall/Unburdening_the_Colossus.mp3"
  },
  "village_vigil": {
    "title": "Village Vigil",
    "url": "/music/bladefall/Village_Vigil.mp3"
  },
  "white_marble_palace_above_the_clouds": {
    "title": "White Marble Palace above the Clouds",
    "url": "/music/bladefall/White_Marble_Palace_above_the_Clouds.mp3"
  },
  "a_crown_of_ashes": {
    "title": "A Crown of Ashes",
    "url": "/music/bladefall/A_Crown_of_Ashes.mp3"
  },
  "canyon_updrafts": {
    "title": "Canyon Updrafts",
    "url": "/music/bladefall/Canyon_Updrafts.mp3"
  },
  "chamber_of_inverted_gravity": {
    "title": "Chamber of Inverted Gravity",
    "url": "/music/bladefall/Chamber_of_Inverted_Gravity.mp3"
  },
  "crosshairs_in_the_dark": {
    "title": "Crosshairs in the Dark",
    "url": "/music/bladefall/Crosshairs_in_the_Dark.mp3"
  },
  "crosshairs_over_open_ground": {
    "title": "Crosshairs over Open Ground",
    "url": "/music/bladefall/Crosshairs_over_Open_Ground.mp3"
  },
  "forge_of_the_molten_colossus": {
    "title": "Forge of the Molten Colossus",
    "url": "/music/bladefall/Forge_of_the_Molten_Colossus.mp3"
  },
  "glaciated_court_of_glass": {
    "title": "Glaciated Court of Glass",
    "url": "/music/bladefall/Glaciated_Court_of_Glass.mp3"
  },
  "hearthfire_in_the_frost": {
    "title": "Hearthfire in the Frost",
    "url": "/music/bladefall/Hearthfire_in_the_Frost.mp3"
  },
  "iron_gavel_descent": {
    "title": "Iron Gavel Descent",
    "url": "/music/bladefall/Iron_Gavel_Descent.mp3"
  },
  "iron_juggernaut": {
    "title": "Iron Juggernaut",
    "url": "/music/bladefall/Iron_Juggernaut.mp3"
  },
  "iron_oath_of_the_night_attack": {
    "title": "Iron Oath of the Night Attack",
    "url": "/music/bladefall/Iron_Oath_of_the_Night_Attack.mp3"
  },
  "midnight_field": {
    "title": "Midnight Field",
    "url": "/music/bladefall/Midnight_Field.mp3"
  },
  "paradox_void_assault": {
    "title": "Paradox Void Assault",
    "url": "/music/bladefall/Paradox_Void_Assault.mp3"
  },
  "sentence_of_the_shield_warden": {
    "title": "Sentence of the Shield Warden",
    "url": "/music/bladefall/Sentence_of_the_Shield_Warden.mp3"
  },
  "stony_whispers_of_the_keep": {
    "title": "Stony Whispers of the Keep",
    "url": "/music/bladefall/Stony_Whispers_of_the_Keep.mp3"
  },
  "the_black_procession": {
    "title": "The Black Procession",
    "url": "/music/bladefall/The_Black_Procession.mp3"
  },
  "the_eternal_furnace": {
    "title": "The Eternal Furnace",
    "url": "/music/bladefall/The_Eternal_Furnace.mp3"
  },
  "the_iron_causeway": {
    "title": "The Iron Causeway",
    "url": "/music/bladefall/The_Iron_Causeway.mp3"
  },
  "the_obsidian_foundry": {
    "title": "The Obsidian Foundry",
    "url": "/music/bladefall/The_Obsidian_Foundry.mp3"
  },
  "the_sorcerers_hall_of_mirrors": {
    "title": "The Sorcerers Hall of Mirrors",
    "url": "/music/bladefall/The_Sorcerers_Hall_of_Mirrors.mp3"
  },
  "watchful_greenwood": {
    "title": "Watchful Greenwood",
    "url": "/music/bladefall/Watchful_Greenwood.mp3"
  },
  "wayfarers_hearth_loop": {
    "title": "The Wayfarer’s Hearth — hub loop",
    "url": "/music/bladefall/wayfarers-hearth-loop.mp3"
  }
};
const regions={
 outskirts:['village_vigil','midnight_field','iron_juggernaut'],
 hollow:['canyon_updrafts','crosshairs_over_open_ground','crosshairs_in_the_dark'],
 keep:['the_iron_causeway','iron_gavel_descent','the_fallen_champion_duel'],
 frost:['hearthfire_in_the_frost','the_sorcerers_hall_of_mirrors','paradox_void_assault'],
 ember:['the_eternal_furnace','the_obsidian_foundry','forge_of_the_molten_colossus'],
 abyss:['the_black_procession','the_iron_causeway','paradox_void_assault'],
 storm:['the_shore_of_broken_ships','towering_sea_cliffs','chains_of_the_deep'],
 palace:['white_marble_palace_above_the_clouds','archives_of_the_archmage','iron_juggernaut'],
 castle:['chamber_of_inverted_gravity','sentence_of_the_shield_warden','a_crown_of_ashes']
};
const aliases={hub:'wayfarers_hearth_loop',outskirts:'village_vigil',hollow:'canyon_updrafts',keep:'the_iron_causeway',frost:'hearthfire_in_the_frost',ember:'the_eternal_furnace',abyss:'the_black_procession',apex_darkdescent:'the_black_procession',secret:'hall_of_the_violet_discipline',trial_chamber:'crystalline_trials',boss_brute:'iron_juggernaut',boss_marksman:'crosshairs_in_the_dark',boss_warden:'the_fallen_champion_duel',boss_sorcerer:'paradox_void_assault',boss_colossus:'forge_of_the_molten_colossus',boss_king:'paradox_void_assault'};
const cues={ship_crossing:{track:'navigating_the_red_wake'},ship_arrival:{track:'safe_harbor',once:true},hydra_battle:{track:'chains_of_the_deep'},hydra_release:{track:'unburdening_the_colossus',once:true},void_arrival:{track:'through_the_void_breach'},ian_spirit:{track:'passing_the_flame'},void_charge:{track:'the_last_spark_of_darrow'},void_cut:{track:'the_breaking_of_the_keeps',once:true},restoration:{track:'watchful_greenwood'},confiscated_writings:{track:'stony_whispers_of_the_keep'},rescue_relief:{track:'glaciated_court_of_glass'},legion_procession:{track:'the_black_procession'}};
const canonical=key=>aliases[key]||key;
function scene(c={}){
 if(c.victory)return 'watchful_greenwood';
 if(c.riftHall)return 'the_archive_of_violet_portals';
 if(c.hub)return c.sparring?'iron_gavel_descent':'wayfarers_hearth_loop';
 if(c.trial)return c.mode==='npc'?'hall_of_the_violet_discipline':'crystalline_trials';
 if(c.side)return 'hall_of_the_violet_discipline';
 if(c.mode==='npc'&&c.npc==='ellis')return ['ic.ellis.truth','ic.ellis.guilt','ic.ellis.lead','ic.ellis.unknown'].includes(c.line)?'stony_whispers_of_the_keep':'glaciated_court_of_glass';
 if(c.arena)return 'iron_gavel_descent';
 if(c.bossRush)return c.bossType==='tyrant'?(c.phase>=2?'iron_oath_of_the_night_attack':'a_crown_of_ashes'):({brute:'iron_juggernaut',archer:'crosshairs_in_the_dark',warden:'the_fallen_champion_duel',sorcerer:'paradox_void_assault',colossus:'forge_of_the_molten_colossus',king:'paradox_void_assault'}[c.bossType]||'iron_juggernaut');
 if(c.endless||c.delve)return c.area<0?'paradox_void_assault':'the_iron_causeway';
 const zone=c.zone==='sunspire'?'palace':c.zone==='duskmoor'?'castle':c.zone;
 const r=regions[zone];if(!r)return 'wayfarers_hearth_loop';
 if(c.area<0)return zone==='castle'&&c.phase>=2?'iron_oath_of_the_night_attack':r[2];
 return r[c.area===1?1:0];
}
const api={tracks,regions,aliases,cues,canonical,scene};root.BFMusicScore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
