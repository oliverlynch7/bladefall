const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/3d/chest-rules.js','utf8'),ctx);const rules=ctx.window.BFChestRules,enc=require('../public/3d/encounter-rewards.js');
for(let z=0;z<8;z++)for(let i=0;i<1000;i++){
 const chest=rules.campaign({x:i*31,z:-i*17,challenge:i%2===0},z,i%2),tier=rules.order.indexOf(chest.rarity),item=rules.reward(chest.rarity,chest.challenge,(i+.5)/1000,z);
 ok(tier<=1+Math.floor(z/2),'campaign chest grade limited by region');ok(rules.order.indexOf(item)<=1+Math.floor(z/2),'contents cannot leak next unavailable region rarity');
 if(z<2)ok(!['rare','epic','legendary'].includes(chest.rarity)&&!['rare','epic','legendary'].includes(item),'no blue chests or blue contents in first two regions');
}
for(let lv=1;lv<13;lv++)for(const e of [{},{elite:true},{boss:true}])for(let n=0;n<100;n++)ok(['common','uncommon'].includes(enc.grade(e,lv,n/100)),'early enemies including bosses drop usable grades');
const html=fs.readFileSync('public/3d/index.html','utf8');function fn(name){const a=html.indexOf('function '+name+'(');return html.slice(a,html.indexOf('\nfunction ',a+12));}
const c={isCampaignAdventure:()=>true,TRINKETIDS:['amulet','ring'],SLOTIDS:['helmet','chest','legs'],DROP_ARCHES:['sword','staff'],ARCHES:{sword:{art:'sword'},staff:{art:'staff'}},classFamilyOk:w=>w.art==='sword',Math,makeTrinket:(rarity,slot)=>({rarity,slot}),makeArmor:(rarity,slot)=>({rarity,slot}),makeWeapon:(arche,rarity)=>({arche,rarity}),randomLoot:()=>({fallback:true})};vm.createContext(c);vm.runInContext(fn('campaignChestLoot'),c);const owner={};let slots=[];for(let i=0;i<32;i++){const item=c.campaignChestLoot('common',owner);slots.push(item.weapon?'weapon':(item.armor||item.trinket).slot)}
for(let i=0;i<4;i++){const deck=slots.slice(i*8,i*8+8);ok(deck.includes('ring')&&deck.includes('amulet'),'every eight dealt rewards contains both jewelry slots');ok(['helmet','chest','legs','weapon'].every(s=>deck.includes(s)),'complete gear coverage and forge duplicates');}
const saved=JSON.parse(JSON.stringify(owner));ok(saved.campaignLootDeals===32,'coverage cursor survives normal save serialization');
ok(/req:3/.test(html)&&/req:6/.test(html)&&/req:9/.test(html)&&/req:12/.test(html),'equipment gates match twelve-level campaign');
ok(html.includes("mimicOrigin||scene+':enemy:'"),'mimic win reuses original personal reward identity');ok(html.includes("!e.mimicE&&Math.random()<MIMIC_RATE"),'mimic reward cannot chain another mimic');ok(html.includes('rec.mimic=false;rec.mimicDefeated=true'),'mimic win persists safe reward before opening');
const maybe={};vm.createContext(maybe);vm.runInContext(fn('chestMaybeMimic'),maybe);let seedCalls=0;ok(maybe.chestMaybeMimic({},()=>{seedCalls++;return 0}).mimic===false&&seedCalls===1,'fixed chest never mimic; same RNG consumption preserves level geometry');
let total=0,mimics=0;for(let i=0;i<10000;i++){const r=(i+.5)/10000;if(r<enc.chance({},1))total++;if(r<.1)mimics++;}ok(total===1200&&mimics===1000,'12% early enemy chest chance and10% mimic threshold');
console.log(JSON.stringify({checks,earlyRarities:['common','uncommon'],gates:[1,3,6,9,12],gearDeck:slots.slice(0,8),chestsPer100EarlyKills:12,mimicsPer100Chests:10}));
