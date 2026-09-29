/* Cosmetic ranks only: this catalog never modifies player combat statistics. */
(()=>{const rows={
warrior:[['Crimson Officer','#cd6b4d','#922b39','#3f2930','Bronze shoulder plates and a short helmet crest.'],['Royal Vanguard','#e5b967','#243e87','#372b35','Cobalt armor, gold layered shoulders and a tall officer crest.']],
ranger:[['Autumn Scout','#cc9d59','#a44d28','#3c3020','Copper leaf clasps and an autumn feather mantle.'],['Whitewood Hunter','#ded9aa','#477f70','#37493e','Ivory and deep jade with a broad swept feather mantle.']],
mage:[['Amethyst Scholar','#e4b991','#71349e','#302849','Amethyst robes and a crystal-set collar.'],['Galaxy Archmage','#c0aeff','#241b55','#302644','Midnight violet, a tilted celestial halo and orbiting stars.']],
reaper:[['Ash Reaper','#ad9eaf','#4a2737','#271d29','Ash-silver bone ribs over burgundy cloth.'],['Pale Harvester','#dfd1b9','#201b26','#45323f','Pale bone collar, hooked ribs and hanging soul stones.']],
paladin:[['Dawn Guardian','#f5d889','#fff0c6','#b78a47','Light gold armor and a radiant sun clasp.'],['Radiant Champion','#fff0a5','#fff9df','#c79a50','Ivory and luminous gold with sculpted sunburst shoulders.']],
necromancer:[['Grave Scholar','#bfc3a7','#365144','#34332e','Bone collar and jade spirit lanterns.'],['Soul Shepherd','#e4dfc4','#172f2b','#556052','Ivory ribs and two gently drifting green soul lanterns.']],
ninja:[['Copper Shadow','#c09075','#29302d','#252329','Copper-edged arm guards and layered shoulder blades.'],['Night Fox','#c8d3d5','#263443','#111d26','Silver-blue armor, swept fox-ear crest and crossed back blades.']],
berserker:[['Iron Fury','#bc7652','#742e25','#38271e','Heavy bronze shoulder teeth.'],['Wild Champion','#e4c298','#4d201c','#5c3327','Bone and oxblood with huge uneven tusked pauldrons.']],
pirate:[['Redcoat Captain','#c9a465','#a73242','#352c39','Red coat, gold epaulettes and a compass medallion.'],['Admiral of Tides','#f1c673','#213f53','#582c3b','Deep teal and wine-red with a captain crest and dangling compass chains.']],
chronomancer:[['Clockmaker','#d3ae6e','#315d61','#423329','Brass collar, clock face and tiny side gears.'],['Keeper of Hours','#efdbad','#253c3b','#715837','Ivory-brass clockwork with a rotating chest dial and shoulder gears.']],
monk:[['Jade Disciple','#83b9a0','#d5c594','#584637','Jade prayer beads and broad wrist bands.'],['Lotus Master','#dbac67','#e9d7b5','#684b34','Saffron and cream with lotus shoulder petals and amber prayer beads.']],
stormcaller:[['Thunder Herald','#cad5e7','#384b76','#303849','Steel-blue lightning-shaped shoulder fins.'],['Tempest Crown','#e5ecff','#253a63','#776134','White and navy with a jagged lightning crest and flickering shoulder arcs.']],
warlock:[['Crimson Pact','#c5889d','#6c234e','#352337','Ruby collar and dark ritual seals.'],['Eclipse Sovereign','#ae79bc','#31182e','#702f45','Black cherry and rose metal with a split horn crown and pulsing pact seals.']],
skylancer:[['Copper Kestrel','#cf9d72','#648b9f','#354756','Copper and sky blue with swept feather pauldrons.'],['Sky Sovereign','#e2ebf1','#405a90','#a78250','Silver and azure with long wing-shaped shoulder vanes.']],
bladedancer:[['Rose Duelist','#d3a3ac','#7b3456','#48323e','Rose-silver shoulder fans and a jeweled chest clasp.'],['Silk Tempest','#f1cea9','#3f817e','#65455d','Sea silk and champagne with asymmetric fan blades and moving hip ribbons.']],
beastmaster:[['Copper Tracker','#bc9366','#69573a','#383529','Carved horn shoulders and amber animal charms.'],['Wildwarden','#ddc29c','#475537','#5c3b26','Moss and tawny bone with antler shoulders and a fang necklace.']],
pyromancer:[['Blue Furnace','#cb8352','#294553','#452e38','Copper and charcoal-blue with furnace-vent shoulders.'],['Living Ember','#f3bc75','#631f2b','#2c2633','Obsidian and crimson with cracked ember plates and animated shoulder flames.']]
};
const css=document.createElement('style');css.textContent='@media(max-width:650px){.class-look-card #lookPreview{height:220px!important}.class-look-card{padding:14px!important}.class-look-card #lookChoices .bigbtn{padding:10px!important}}';document.head.appendChild(css);
const catalog=Object.fromEntries(Object.entries(rows).map(([c,r])=>[c,[{name:'Original',rank:1,detail:'Your original class appearance.'},...r.map((a,i)=>({name:a[0],rank:i?10:5,metal:a[1],cloth:a[2],leather:a[3],detail:a[4],id:'rank_'+c+'_'+(i+1),lift:1.28}))]]));
const valid=v=>v===1||v===2?v:0;
function tier(meta,c){const n=valid(meta?.classLooks?.[c]);return (meta?.classes?.[c]?.rank||1)>=(catalog[c]?.[n]?.rank||1)?n:0;}
window.BFClassLooks={catalog,valid,tier,palette:(c,n)=>catalog[c]?.[valid(n)]};
})();
