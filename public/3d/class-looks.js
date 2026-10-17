/* Reference-sheet wardrobe: cosmetic only; IDs and rank gates remain stable. */
(()=>{
const catalog={
 "warrior": [
  {
   "name": "Vanguard Recruit",
   "rank": 1,
   "id": "c_warrior",
   "metal": "#a9b6c2",
   "cloth": "#31527c",
   "leather": "#584332",
   "armor": "#64788e",
   "accent": "#84baff",
   "inlay": "#84baff",
   "lift": 1.15,
   "detail": "Simple cobalt steel, leather straps and a compact knight helm."
  },
  {
   "name": "Cobalt Knight",
   "rank": 5,
   "id": "rank_warrior_1",
   "metal": "#d9b869",
   "cloth": "#244e90",
   "leather": "#43382f",
   "armor": "#526e9a",
   "accent": "#a8d6ff",
   "inlay": "#a8d6ff",
   "lift": 1.15,
   "detail": "Layered cobalt plate, gold borders and a swept knight crest."
  },
  {
   "name": "Royal Vanguard",
   "rank": 10,
   "id": "rank_warrior_2",
   "metal": "#f2c664",
   "cloth": "#203f79",
   "leather": "#3d302b",
   "armor": "#284b8b",
   "accent": "#ffdc83",
   "inlay": "#ffdc83",
   "lift": 1.15,
   "detail": "Royal gold crown, heraldic armor and luminous command pennants."
  }
 ],
 "berserker": [
  {
   "name": "Wild Fighter",
   "rank": 1,
   "id": "c_berserker",
   "metal": "#ac855d",
   "cloth": "#74412c",
   "leather": "#4d3629",
   "armor": "#8a563c",
   "accent": "#e2a76c",
   "inlay": "#e2a76c",
   "lift": 1.15,
   "detail": "Weathered hide, bronze cuffs and short horns."
  },
  {
   "name": "Bloodhorn Ravager",
   "rank": 5,
   "id": "rank_berserker_1",
   "metal": "#c4a174",
   "cloth": "#702829",
   "leather": "#302123",
   "armor": "#78342d",
   "accent": "#ff885c",
   "inlay": "#ff885c",
   "lift": 1.15,
   "detail": "Oxblood armor, ivory shoulder teeth and a horned war crown."
  },
  {
   "name": "Infernal Warchief",
   "rank": 10,
   "id": "rank_berserker_2",
   "metal": "#e1c08c",
   "cloth": "#922c25",
   "leather": "#241d1e",
   "armor": "#692821",
   "accent": "#ff6545",
   "inlay": "#ff6545",
   "lift": 1.15,
   "detail": "Great horns, beast-jaw trophies and scarlet rage flares."
  }
 ],
 "pirate": [
  {
   "name": "Freebooter",
   "rank": 1,
   "id": "c_pirate",
   "metal": "#b49a69",
   "cloth": "#e6d6af",
   "leather": "#513b29",
   "armor": "#61544a",
   "accent": "#e1c98a",
   "inlay": "#e1c98a",
   "lift": 1.15,
   "detail": "Ivory shirt, brown tricorn and a simple sailors buckle."
  },
  {
   "name": "Tide Captain",
   "rank": 5,
   "id": "rank_pirate_1",
   "metal": "#d5b767",
   "cloth": "#225e68",
   "leather": "#3c312a",
   "armor": "#244d59",
   "accent": "#65d1d3",
   "inlay": "#65d1d3",
   "lift": 1.15,
   "detail": "Teal naval coat, gold braid and an embellished tricorn."
  },
  {
   "name": "Grand Admiral",
   "rank": 10,
   "id": "rank_pirate_2",
   "metal": "#f1c767",
   "cloth": "#182d40",
   "leather": "#562d32",
   "armor": "#253748",
   "accent": "#ffe09b",
   "inlay": "#ffe09b",
   "lift": 1.15,
   "detail": "Grand navy admiral coat, red plume, navigation medals and tidal light."
  }
 ],
 "ninja": [
  {
   "name": "Scarlet Initiate",
   "rank": 1,
   "id": "c_ninja",
   "metal": "#967453",
   "cloth": "#78282d",
   "leather": "#35242a",
   "armor": "#633036",
   "accent": "#e75b55",
   "inlay": "#e75b55",
   "lift": 1.15,
   "detail": "Burgundy hood, fitted leather and a red face wrap."
  },
  {
   "name": "Crimson Shadow",
   "rank": 5,
   "id": "rank_ninja_1",
   "metal": "#c79d60",
   "cloth": "#862b34",
   "leather": "#251f28",
   "armor": "#4f2531",
   "accent": "#ff8270",
   "inlay": "#ff8270",
   "lift": 1.15,
   "detail": "Layered crimson guards, gold edging and pointed shoulder blades."
  },
  {
   "name": "Ruby Nightblade",
   "rank": 10,
   "id": "rank_ninja_2",
   "metal": "#e4b26a",
   "cloth": "#a42634",
   "leather": "#211c28",
   "armor": "#732134",
   "accent": "#ff5268",
   "inlay": "#ff5268",
   "lift": 1.15,
   "detail": "Ruby-black assassin regalia, swept red blades and scarlet afterimages."
  }
 ],
 "bladedancer": [
  {
   "name": "Tide Duelist",
   "rank": 1,
   "id": "c_bladedancer",
   "metal": "#b6a37c",
   "cloth": "#386d70",
   "leather": "#3b4547",
   "armor": "#568589",
   "accent": "#8aceca",
   "inlay": "#8aceca",
   "lift": 1.15,
   "detail": "Teal hood, light champagne trim and simple split cloth panels."
  },
  {
   "name": "Silken Blade",
   "rank": 5,
   "id": "rank_bladedancer_1",
   "metal": "#ddc79d",
   "cloth": "#28676c",
   "leather": "#34464b",
   "armor": "#57959a",
   "accent": "#bcf1df",
   "inlay": "#bcf1df",
   "lift": 1.15,
   "detail": "Ivory-teal fan armor, flowing silk panels and paired hip blades."
  },
  {
   "name": "Silk Tempest",
   "rank": 10,
   "id": "rank_bladedancer_2",
   "metal": "#f2dbb1",
   "cloth": "#235b60",
   "leather": "#3c474b",
   "armor": "#65a4a5",
   "accent": "#d6fff0",
   "inlay": "#d6fff0",
   "lift": 1.15,
   "detail": "Champagne filigree fans, pearl inlays and sweeping sea-silk energy."
  }
 ],
 "reaper": [
  {
   "name": "Dusk Harvester",
   "rank": 1,
   "id": "c_reaper",
   "metal": "#87748e",
   "cloth": "#51316d",
   "leather": "#282231",
   "armor": "#665270",
   "accent": "#b78bfa",
   "inlay": "#b78bfa",
   "lift": 1.15,
   "detail": "Violet hood and dark curved shoulder hooks."
  },
  {
   "name": "Soul Reaper",
   "rank": 5,
   "id": "rank_reaper_1",
   "metal": "#b5a1c5",
   "cloth": "#3c2357",
   "leather": "#25202e",
   "armor": "#80618e",
   "accent": "#cf9bff",
   "inlay": "#cf9bff",
   "lift": 1.15,
   "detail": "Carved pale ribs, violet soul clasp and a pointed hood crown."
  },
  {
   "name": "Veil Sovereign",
   "rank": 10,
   "id": "rank_reaper_2",
   "metal": "#d5c3dc",
   "cloth": "#291b3f",
   "leather": "#211b2b",
   "armor": "#9a77bc",
   "accent": "#c987ff",
   "inlay": "#c987ff",
   "lift": 1.15,
   "detail": "Crowned soul reliquary, violet soul mantle and sweeping bone hooks."
  }
 ],
 "paladin": [
  {
   "name": "Dawn Initiate",
   "rank": 1,
   "id": "c_paladin",
   "metal": "#bfa56d",
   "cloth": "#d9cfb0",
   "leather": "#76603d",
   "armor": "#c5c3ae",
   "accent": "#ffe5a2",
   "inlay": "#ffe5a2",
   "lift": 1.15,
   "detail": "Ivory armor, warm gold trim and a modest sun brooch."
  },
  {
   "name": "Sun Guardian",
   "rank": 5,
   "id": "rank_paladin_1",
   "metal": "#dfbe71",
   "cloth": "#f0e4c6",
   "leather": "#8b693d",
   "armor": "#ded5b5",
   "accent": "#fff1bd",
   "inlay": "#fff1bd",
   "lift": 1.15,
   "detail": "Radiant sun plate, gilded head wings and an ivory tabard."
  },
  {
   "name": "Radiant Champion",
   "rank": 10,
   "id": "rank_paladin_2",
   "metal": "#f1ce7b",
   "cloth": "#fff2d3",
   "leather": "#917043",
   "armor": "#f6ecd2",
   "accent": "#fff7cd",
   "inlay": "#fff7cd",
   "lift": 1.15,
   "detail": "Solar crown, layered sun wings and luminous golden rays."
  }
 ],
 "monk": [
  {
   "name": "Temple Novice",
   "rank": 1,
   "id": "c_monk",
   "metal": "#a98b55",
   "cloth": "#c49655",
   "leather": "#5b442d",
   "armor": "#9b7544",
   "accent": "#d9c28a",
   "inlay": "#d9c28a",
   "lift": 1.15,
   "detail": "Simple saffron wraps, wooden prayer beads and bare shoulders."
  },
  {
   "name": "Saffron Adept",
   "rank": 5,
   "id": "rank_monk_1",
   "metal": "#cca767",
   "cloth": "#d29b47",
   "leather": "#62442e",
   "armor": "#ae753c",
   "accent": "#eed1a0",
   "inlay": "#eed1a0",
   "lift": 1.15,
   "detail": "Layered saffron cloth, prayer-bead bracelets and a lotus sash."
  },
  {
   "name": "Awakened Sage",
   "rank": 10,
   "id": "rank_monk_2",
   "metal": "#d8b888",
   "cloth": "#bb874a",
   "leather": "#63433c",
   "armor": "#aa7b57",
   "accent": "#d6b0ff",
   "inlay": "#d6b0ff",
   "lift": 1.15,
   "detail": "Psychic lotus mandala, lavender mind-light and floating prayer jewels; no heavy plate."
  }
 ],
 "ranger": [
  {
   "name": "Woodland Scout",
   "rank": 1,
   "id": "c_ranger",
   "metal": "#af9a5f",
   "cloth": "#426c3b",
   "leather": "#4d3c29",
   "armor": "#55784c",
   "accent": "#acd38a",
   "inlay": "#acd38a",
   "lift": 1.15,
   "detail": "Green scout hood, brown leather and a small leaf clasp."
  },
  {
   "name": "Verdant Hunter",
   "rank": 5,
   "id": "rank_ranger_1",
   "metal": "#c1a46a",
   "cloth": "#355e39",
   "leather": "#403727",
   "armor": "#527744",
   "accent": "#c0eb9f",
   "inlay": "#c0eb9f",
   "lift": 1.15,
   "detail": "Layered forest leaves, gold hood branches and fitted scout guards."
  },
  {
   "name": "Wildwood Warden",
   "rank": 10,
   "id": "rank_ranger_2",
   "metal": "#dbb970",
   "cloth": "#264c35",
   "leather": "#3b3625",
   "armor": "#466b36",
   "accent": "#b5f38b",
   "inlay": "#b5f38b",
   "lift": 1.15,
   "detail": "Great leaf mantle, woodland compass and emerald crescent wisps."
  }
 ],
 "beastmaster": [
  {
   "name": "Wild Tracker",
   "rank": 1,
   "id": "c_beastmaster",
   "metal": "#b9a17d",
   "cloth": "#596044",
   "leather": "#57402b",
   "armor": "#766444",
   "accent": "#d4b07b",
   "inlay": "#d4b07b",
   "lift": 1.15,
   "detail": "Hide straps, moss cloth and small tooth clasps."
  },
  {
   "name": "Horned Keeper",
   "rank": 5,
   "id": "rank_beastmaster_1",
   "metal": "#d1bc93",
   "cloth": "#4d553c",
   "leather": "#49392a",
   "armor": "#857050",
   "accent": "#ebcf96",
   "inlay": "#ebcf96",
   "lift": 1.15,
   "detail": "Ivory horned mantle, a carved beast crest and layered hides."
  },
  {
   "name": "Greatbeast Warden",
   "rank": 10,
   "id": "rank_beastmaster_2",
   "metal": "#e3cd9e",
   "cloth": "#394d35",
   "leather": "#483425",
   "armor": "#9b845d",
   "accent": "#f1d08b",
   "inlay": "#f1d08b",
   "lift": 1.15,
   "detail": "Great branching antlers, bone trophies and amber spirit light. Companion remains separate."
  }
 ],
 "skylancer": [
  {
   "name": "Sky Initiate",
   "rank": 1,
   "id": "c_skylancer",
   "metal": "#c5ad6c",
   "cloth": "#4776ac",
   "leather": "#404c62",
   "armor": "#d5dce0",
   "accent": "#acdfff",
   "inlay": "#acdfff",
   "lift": 1.15,
   "detail": "White-azure flight armor and small feather guards."
  },
  {
   "name": "Azure Wingguard",
   "rank": 5,
   "id": "rank_skylancer_1",
   "metal": "#ddc080",
   "cloth": "#315f9b",
   "leather": "#36445d",
   "armor": "#dce7ef",
   "accent": "#c4e8ff",
   "inlay": "#c4e8ff",
   "lift": 1.15,
   "detail": "Layered feather wings, golden spars and a swept flight crown."
  },
  {
   "name": "Celestial Lancer",
   "rank": 10,
   "id": "rank_skylancer_2",
   "metal": "#f1ce7b",
   "cloth": "#214c85",
   "leather": "#35425d",
   "armor": "#ecf2fa",
   "accent": "#94d5ff",
   "inlay": "#94d5ff",
   "lift": 1.15,
   "detail": "Great white flight wings, ice-blue crest and azure slipstream light."
  }
 ],
 "mage": [
  {
   "name": "Azure Apprentice",
   "rank": 1,
   "id": "c_mage",
   "metal": "#c6a966",
   "cloth": "#2b4e99",
   "leather": "#353448",
   "armor": "#526ca2",
   "accent": "#8ab9ff",
   "inlay": "#8ab9ff",
   "lift": 1.15,
   "detail": "Blue apprentice robes, gold bands and a sapphire clasp."
  },
  {
   "name": "Crystal Magister",
   "rank": 5,
   "id": "rank_mage_1",
   "metal": "#dfbe73",
   "cloth": "#213c87",
   "leather": "#2c3045",
   "armor": "#3b59a0",
   "accent": "#9dceff",
   "inlay": "#9dceff",
   "lift": 1.15,
   "detail": "Gold-trimmed blue robes, crystal crown and sapphire shoulders."
  },
  {
   "name": "Sapphire Archmage",
   "rank": 10,
   "id": "rank_mage_2",
   "metal": "#f0cb7e",
   "cloth": "#192e72",
   "leather": "#282c40",
   "armor": "#29478d",
   "accent": "#a3e6ff",
   "inlay": "#a3e6ff",
   "lift": 1.15,
   "detail": "Grand sapphire crystal crown, orbiting crystals and blue constellation light."
  }
 ],
 "pyromancer": [
  {
   "name": "Ember Apprentice",
   "rank": 1,
   "id": "c_pyromancer",
   "metal": "#bba05e",
   "cloth": "#9d3429",
   "leather": "#49302b",
   "armor": "#79372d",
   "accent": "#ff9a47",
   "inlay": "#ff9a47",
   "lift": 1.15,
   "detail": "Red robes, bronze flame cuts and an ember clasp."
  },
  {
   "name": "Flame Adept",
   "rank": 5,
   "id": "rank_pyromancer_1",
   "metal": "#dfaf62",
   "cloth": "#92251e",
   "leather": "#302325",
   "armor": "#702c26",
   "accent": "#ffc15b",
   "inlay": "#ffc15b",
   "lift": 1.15,
   "detail": "Crimson-black robes, gold flame crown and burning shoulders."
  },
  {
   "name": "Phoenix Sovereign",
   "rank": 10,
   "id": "rank_pyromancer_2",
   "metal": "#f2bd62",
   "cloth": "#6d1b20",
   "leather": "#251d24",
   "armor": "#4d2527",
   "accent": "#ffad37",
   "inlay": "#ffad37",
   "lift": 1.15,
   "detail": "Living flame crown, obsidian furnace heart and a mantle of fire."
  }
 ],
 "stormcaller": [
  {
   "name": "Storm Adept",
   "rank": 1,
   "id": "c_stormcaller",
   "metal": "#b6a7d8",
   "cloth": "#645195",
   "leather": "#353045",
   "armor": "#756295",
   "accent": "#bda9ff",
   "inlay": "#bda9ff",
   "lift": 1.15,
   "detail": "Lavender storm robes and small silver conductors."
  },
  {
   "name": "Thunder Herald",
   "rank": 5,
   "id": "rank_stormcaller_1",
   "metal": "#d4bcf3",
   "cloth": "#403778",
   "leather": "#302b43",
   "armor": "#5e4b9e",
   "accent": "#b8d5ff",
   "inlay": "#b8d5ff",
   "lift": 1.15,
   "detail": "Violet-cobalt armor, forked crown and electric shoulder conductors."
  },
  {
   "name": "Tempest Crown",
   "rank": 10,
   "id": "rank_stormcaller_2",
   "metal": "#e4cfb1",
   "cloth": "#282d68",
   "leather": "#29293d",
   "armor": "#4d499c",
   "accent": "#9bdcff",
   "inlay": "#9bdcff",
   "lift": 1.15,
   "detail": "Great lightning crown, caged storm cores and branching cyan-violet arcs."
  }
 ],
 "warlock": [
  {
   "name": "Ruby Pactbinder",
   "rank": 1,
   "id": "c_warlock",
   "metal": "#ac7c72",
   "cloth": "#5d2338",
   "leather": "#302129",
   "armor": "#623445",
   "accent": "#f28a9d",
   "inlay": "#f28a9d",
   "lift": 1.15,
   "detail": "Wine-red robes, rose-copper collar and a ruby pact clasp."
  },
  {
   "name": "Crimson Covenant",
   "rank": 5,
   "id": "rank_warlock_1",
   "metal": "#d3978b",
   "cloth": "#4a1c31",
   "leather": "#291e27",
   "armor": "#823749",
   "accent": "#ff8caa",
   "inlay": "#ff8caa",
   "lift": 1.15,
   "detail": "Black-cherry vestments, split rose horns and rotating ruby seals."
  },
  {
   "name": "Eclipse Sovereign",
   "rank": 10,
   "id": "rank_warlock_2",
   "metal": "#e9b2a0",
   "cloth": "#2f1627",
   "leather": "#241c25",
   "armor": "#6d2c43",
   "accent": "#ff729d",
   "inlay": "#ff729d",
   "lift": 1.15,
   "detail": "Faceted eclipse crown, black-cherry armor and rose-red pact energy. No bones or green souls."
  }
 ],
 "necromancer": [
  {
   "name": "Bone Scholar",
   "rank": 1,
   "id": "c_necromancer",
   "metal": "#c7bda1",
   "cloth": "#383a32",
   "leather": "#38332c",
   "armor": "#a39f89",
   "accent": "#9dd7b0",
   "inlay": "#9dd7b0",
   "lift": 1.15,
   "detail": "Bone-rib mantle over black-green cloth."
  },
  {
   "name": "Grave Sovereign",
   "rank": 5,
   "id": "rank_necromancer_1",
   "metal": "#dbd0af",
   "cloth": "#293b33",
   "leather": "#302f28",
   "armor": "#b8af8d",
   "accent": "#95efbb",
   "inlay": "#95efbb",
   "lift": 1.15,
   "detail": "Ivory horn crown, carved ribs and caged jade souls."
  },
  {
   "name": "Soul Shepherd",
   "rank": 10,
   "id": "rank_necromancer_2",
   "metal": "#eee3bf",
   "cloth": "#1c302a",
   "leather": "#302f27",
   "armor": "#cfc5a5",
   "accent": "#9dffbe",
   "inlay": "#9dffbe",
   "lift": 1.15,
   "detail": "Great skeletal crown, mortuary keywork and a green soul procession."
  }
 ],
 "chronomancer": [
  {
   "name": "Hour Keeper",
   "rank": 1,
   "id": "c_chronomancer",
   "metal": "#c5a164",
   "cloth": "#2b716f",
   "leather": "#403b30",
   "armor": "#548c84",
   "accent": "#8be4e0",
   "inlay": "#8be4e0",
   "lift": 1.15,
   "detail": "Teal robes, brass trim and a working clock clasp."
  },
  {
   "name": "Clockwork Seer",
   "rank": 5,
   "id": "rank_chronomancer_1",
   "metal": "#dfbc72",
   "cloth": "#245d61",
   "leather": "#39382e",
   "armor": "#398583",
   "accent": "#a0f2e8",
   "inlay": "#a0f2e8",
   "lift": 1.15,
   "detail": "Gold clockwork guards, shoulder gears and a turquoise time jewel."
  },
  {
   "name": "Master of Hours",
   "rank": 10,
   "id": "rank_chronomancer_2",
   "metal": "#f4cf7f",
   "cloth": "#19494f",
   "leather": "#3a382b",
   "armor": "#367672",
   "accent": "#a1f8ff",
   "inlay": "#a1f8ff",
   "lift": 1.15,
   "detail": "Great clock halo, hourglass movement and floating cyan time crystals."
  }
 ]
};
const css=document.createElement('style');css.textContent='@media(max-width:650px){.class-look-card #lookPreview{height:220px!important}.class-look-card{padding:14px!important}.class-look-card #lookChoices .bigbtn{padding:10px!important}}';document.head.appendChild(css);
const valid=v=>v===1||v===2?v:0;
function tier(meta,c){const n=valid(meta?.classLooks?.[c]);return (meta?.classes?.[c]?.rank||1)>=(catalog[c]?.[n]?.rank||1)?n:0;}
window.BFClassLooks={catalog,valid,tier,palette:(c,n)=>catalog[c]?.[valid(n)]};
})();
