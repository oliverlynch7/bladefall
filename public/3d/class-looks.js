/* Cosmetic ranks only: this catalog never modifies player combat statistics. */
(()=>{const rows={
warrior:[['Crimson Officer','#cd6b4d','#922b39','#3f2930','Riveted crimson and copper armor, layered shoulder guards and fitted greaves.'],['Royal Vanguard','#e5b967','#243e87','#372b35','Cobalt enamel and gold, swept pauldrons, a gilded breast jewel and an officer crest.']],
ranger:[['Autumn Scout','#cc9d59','#a44d28','#3c3020','Autumn cloth, veined copper leaf shoulders and fitted scout bracers.'],['Whitewood Hunter','#ded9aa','#477f70','#37493e','Ivory and deep jade, overlapping woodland leaves and a carved hood crest.']],
mage:[['Amethyst Scholar','#e4b991','#71349e','#302849','Amethyst embroidery, crystal shoulder clasps and a jewel-set stole.'],['Galaxy Archmage','#c0aeff','#241b55','#302644','Constellation embroidery, a celestial astrolabe and five slowly orbiting stars.']],
reaper:[['Ash Reaper','#ad9eaf','#4a2737','#271d29','Ash-silver curved ribs and shoulder hooks over burgundy cloth.'],['Pale Harvester','#dfd1b9','#201b26','#45323f','Pale curved bone armor, violet soul inlays and a narrow hood crest.']],
paladin:[['Dawn Guardian','#f5d889','#fff0c6','#b78a47','Engraved light-gold armor, an ivory tabard and a radiant sun brooch.'],['Radiant Champion','#fff0a5','#fff9df','#c79a50','Ivory and luminous gold, sculpted sun-wing shoulders and holy-light inlays.']],
necromancer:[['Grave Scholar','#bfc3a7','#365144','#34332e','Verdigris embroidery, carved bone ribs and jade clasps.'],['Soul Shepherd','#e4dfc4','#172f2b','#556052','Ivory ribs and two caged, softly glowing soul lanterns mounted on the shoulders.']],
ninja:[['Copper Shadow','#c09075','#29302d','#252329','Copper-edged layered sleeves, dark cloth and a fitted chest seal.'],['Night Fox','#c8d3d5','#263443','#111d26','Silver and indigo fox crest, segmented guards and an ice-blue brow jewel.']],
berserker:[['Iron Fury','#bc7652','#742e25','#38271e','Forged bronze armor, oxblood inlays and curved shoulder teeth.'],['Wild Champion','#e4c298','#4d201c','#5c3327','Heavy oxblood plates, carved ivory tusks and asymmetric shoulder armor.']],
pirate:[['Redcoat Captain','#c9a465','#a73242','#352c39','Red coat embroidery, braided gold epaulettes and a compass buckle.'],['Admiral of Tides','#f1c673','#213f53','#582c3b','Teal and wine naval regalia, a gold-edged tricorn and compact braided epaulettes.']],
chronomancer:[['Clockmaker','#d3ae6e','#315d61','#423329','Brass and teal embroidery, inset guards and a working clock medallion.'],['Keeper of Hours','#efdbad','#253c3b','#715837','Ivory-brass clockwork with moving chest hands and inset rotating shoulder gears.']],
monk:[['Jade Disciple','#83b9a0','#d5c594','#584637','Cream and jade prayer beads, fitted wraps and petal shoulder guards.'],['Lotus Master','#dbac67','#e9d7b5','#684b34','Saffron and cream lotus mantle, amber prayer beads and layered petal bracers.']],
stormcaller:[['Thunder Herald','#cad5e7','#384b76','#303849','Cobalt robes, silver forked conductors and lightning-cut guards.'],['Tempest Crown','#e5ecff','#253a63','#776134','White and navy storm armor, forked silver conductors and subtle cyan pulses.']],
warlock:[['Crimson Pact','#c5889d','#6c234e','#352337','Ruby embroidery, rose-metal guards and a dark pact clasp.'],['Eclipse Sovereign','#ae79bc','#31182e','#702f45','Black cherry and rose armor, curved split horns and slowly turning pact seals.']],
skylancer:[['Copper Kestrel','#cf9d72','#648b9f','#354756','Sky-blue and copper, layered flight vanes and carved bracers.'],['Sky Sovereign','#e2ebf1','#405a90','#a78250','Silver and azure swept shoulder wings, gold inlay and flight greaves.']],
bladedancer:[['Rose Duelist','#d3a3ac','#7b3456','#48323e','Rose-silver fan armor and a jeweled chest clasp.'],['Silk Tempest','#f1cea9','#3f817e','#65455d','Sea silk and champagne, asymmetric shoulder fans and fitted hip ornaments.']],
beastmaster:[['Copper Tracker','#bc9366','#69573a','#383529','Amber horn guards, embossed hide and carved tooth clasps.'],['Wildwarden','#ddc29c','#475537','#5c3b26','Moss and ivory, branching antler shoulders and a carved fang necklace.']],
pyromancer:[['Blue Furnace','#cb8352','#294553','#452e38','Copper and blue furnace armor, glowing vents and an embroidered stole.'],['Living Ember','#f3bc75','#631f2b','#2c2633','Obsidian and crimson forge plates, ember inlays and animated flame crowns.']]
};
const css=document.createElement('style');css.textContent='@media(max-width:650px){.class-look-card #lookPreview{height:220px!important}.class-look-card{padding:14px!important}.class-look-card #lookChoices .bigbtn{padding:10px!important}}';document.head.appendChild(css);
const catalog=Object.fromEntries(Object.entries(rows).map(([c,r])=>[c,[{name:'Original',rank:1,detail:'Your original class appearance.'},...r.map((a,i)=>({name:a[0],rank:i?10:5,metal:a[1],cloth:a[2],leather:a[3],detail:a[4],id:'rank_'+c+'_'+(i+1),accent:({mage:'#bca3ff',pyromancer:'#ff923f',necromancer:'#73ffc0',paladin:'#ffe9a3',stormcaller:'#9eeaff',warlock:'#ff7dcc',reaper:'#cdbaff',ninja:'#abd9e7',ranger:'#9fe0bd',chronomancer:'#f7dda0',bladedancer:'#ade8dd',beastmaster:'#f6bb70'})[c]||a[1],lift:1.24}))]]));
// Large armor fields and small metal trim use separate colors, so gold trim does not dye an entire suit gold.
const armor={warrior:['#a54235','#35549a'],paladin:['#eed590','#f8e9b4'],berserker:['#9f4435','#662c29'],pirate:['#9c3348','#245361'],ninja:['#424c48','#405268'],bladedancer:['#a76080','#538f8d'],reaper:['#7b6677','#cfc2a8'],beastmaster:['#8c7150','#78925a'],ranger:['#a66e3e','#cdd9b8']};
for(const [c,a] of Object.entries(armor))a.forEach((v,i)=>catalog[c][i+1].armor=v);
// Stable names, IDs and unlocks; richer fitted construction and class-specific finishes.
const finishes={
 warrior:['Crimson and copper officer armor, full crest, swept shoulders and layered fitted guards.','Cobalt royal armor with a fluted heraldic shield, gilt laurel breastwork and sculpted crest.','#ffdf9e'],
 ranger:['Autumn copper leaves, carved hood crest, overlapping shoulders and fitted woodland guards.','Ivory-jade leaf collar, fine branch tracery and an inset woodland compass.','#92ceae'],
 mage:['Amethyst embroidery, crystal shoulders, a celestial astrolabe and five orbiting stars.','Constellation silk, nested moving armillary rings and a luminous crescent at their centre.','#86daf1'],
 reaper:['Ash-silver bone ribs, curved shoulder hooks and a fitted burgundy hood crest.','Pale bone vaults enclose a violet soul reliquary, framed by carved ribs and silver inlay.','#b89ddb'],
 paladin:['Light gold and ivory, sun-wing shoulders, fitted holy armor and a sculpted sun brooch.','Luminous ivory-gold solar relief, twelve layered rays and intricate wing filigree.','#fffbe0'],
 necromancer:['Verdigris robes, full bone ribs and two caged jade souls on carved shoulder supports.','Ivory reliquary armor, ornate cage fittings and fine mortuary keywork over deep jade.','#9bd5b3'],
 ninja:['Copper fox crest, layered shadow armor and close-fitting segmented guards.','Folded silver fox seals, claw-cut inlays and restrained ice-blue details on indigo.','#c0e7ed'],
 berserker:['Oxblood and bronze, carved ivory tusks and full asymmetric shoulder armor.','A sculpted beast-jaw trophy pauldron, forged victory chain and heavy oxblood inlays.','#d5aa75'],
 pirate:['Crimson captain regalia, gold-edged tricorn, braided epaulettes and fitted naval guards.','Teal-wine admiral regalia, layered tricorn plume, pearl braid and navigators medals.','#ffe6ac'],
 chronomancer:['Brass-teal clockwork, moving chest hands and inset rotating shoulder gears.','An ornate hourglass movement, ivory-brass casing and a slowly counter-turning mechanism.','#d5eddd'],
 monk:['Jade-cream lotus mantle, layered petal guards and full prayer-bead fittings.','Saffron-gold lotus petals open gently above gilt prayer beads and fitted ceremonial wraps.','#ffdf97'],
 stormcaller:['Cobalt-silver storm crown, forked conductors and fitted lightning-cut guards.','Caged storm cores glow inside silver conductors, with branching cyan and gold inlays.','#c6e9ff'],
 warlock:['Rose-metal split horns, rotating pact seals and layered crimson-cherry armor.','A split eclipse turns around the pact jewel, framed by black-cherry facets and rose inlay.','#f7b2d3'],
 skylancer:['Copper-sky flight armor, full swept vanes, head pinions and carved flight greaves.','Silver-azure layered flight vanes, fine gold spars and a slowly turning wind instrument.','#f1d6a1'],
 bladedancer:['Rose-silver asymmetric fan armor, fitted guards and jewelled hip ornaments.','A seven-blade ceremonial filigree fan, sea-silk enamel and small jewels along every tip.','#f8ddc5'],
 beastmaster:['Amber-hide armor, full branching antlers, ivory tooth clasps and fitted woodland guards.','A carved great-beast crest, amber trophy inset and gilded ferrules on the antler mantle.','#e7c68b'],
 pyromancer:['Copper-blue furnace armor, full vented shoulders and animated flame crowns.','A luminous furnace heart inside black-glass grilles, layered flame cuts and ember inlay.','#ffe1a2']
};
for(const [c,[rank5,rank10,inlay]]of Object.entries(finishes)){catalog[c][1].detail=rank5;Object.assign(catalog[c][2],{detail:rank10,inlay});}
const valid=v=>v===1||v===2?v:0;
function tier(meta,c){const n=valid(meta?.classLooks?.[c]);return (meta?.classes?.[c]?.rank||1)>=(catalog[c]?.[n]?.rank||1)?n:0;}
window.BFClassLooks={catalog,valid,tier,palette:(c,n)=>catalog[c]?.[valid(n)]};
})();
