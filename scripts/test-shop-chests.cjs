const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n');
let checks=0;const ok=(x,m)=>{assert(x,m);checks++;};
const rarity={common:1,uncommon:5,rare:12,epic:20,legendary:30};
const c={window:{},G:{hub:true,p:{level:1}},mode:'menu',IN_ARENA:false,meta:{gold:1000000,stash:[]},STASH_CAP:30,saveGenerationCurrent:()=>true,rarityReq:r=>rarity[r],heroLevel:()=>1,toast(){},Math,Number,Object,randomLoot:r=>({armor:{rarity:r,slot:'helmet'}}),persist(){c.stored=JSON.parse(JSON.stringify(c.meta));}};vm.createContext(c);
vm.runInContext(fs.readFileSync('public/3d/chest-rules.js','utf8'),c);c.BFChestRules=c.window.BFChestRules;
const start=s.indexOf('const SHOP_CHEST_COSTS='),end=s.indexOf('function openChestShop(',start);
vm.runInContext(s.slice(start,end)+'\nthis.costs=SHOP_CHEST_COSTS;',c);
for(const [rid,level] of Object.entries(rarity)){
 c.G.p.level=level-1;c.meta.stash=[];c.meta.gold=1000000;let before=JSON.stringify(c.meta);
 if(level>1)ok(c.purchaseShopChest(rid)===null&&JSON.stringify(c.meta)===before,rid+' below-level rejection');
 c.G.p.level=level;c.meta.gold=c.costs[rid]-1;before=JSON.stringify(c.meta);
 ok(c.purchaseShopChest(rid)===null&&JSON.stringify(c.meta)===before,rid+' insufficient funds');
 c.meta.gold=c.costs[rid];const item=c.purchaseShopChest(rid);
 ok(item&&c.meta.gold===0&&c.meta.stash.length===1,rid+' exact-level exact-funds purchase');
 ok(c.stored.gold===0&&c.stored.stash.length===1,rid+' persisted before reveal');
 c.meta.gold=1000000;c.meta.stash=Array.from({length:30},()=>({armor:{}}));c.meta.autoSellEquipment=true;before=JSON.stringify(c.meta);
 ok(c.purchaseShopChest(rid)===null&&JSON.stringify(c.meta)===before,rid+' full bag rejects even with autosell');
}
c.G.p.level=30;c.meta.stash=[];c.meta.gold=1000000;
for(const rid of ['bogus','__proto__','constructor'])ok(c.purchaseShopChest(rid)===null,'invalid rarity '+rid);
let before=JSON.stringify(c.meta);ok(c.purchaseShopChest('common',{})===null&&JSON.stringify(c.meta)===before,'stale world');
c.saveGenerationCurrent=()=>false;ok(c.purchaseShopChest('common')===null,'stale save');c.saveGenerationCurrent=()=>true;
for(const context of [{hub:false},{hub:true}]){c.G=context;c.IN_ARENA=context.hub;ok(c.purchaseShopChest('common')===null,'non-hub or arena blocked');}c.IN_ARENA=false;
c.G={hub:true,p:{level:30}};c.mode='play';ok(c.purchaseShopChest('common')===null,'not a shop menu');c.mode='menu';
for(const gold of [NaN,Infinity,-2]){c.meta.gold=gold;ok(c.purchaseShopChest('common')===null,'invalid wallet');}
c.meta.gold=10000;c.randomLoot=()=>{throw Error('generation failure');};before=JSON.stringify(c.meta);assert.throws(()=>c.purchaseShopChest('rare'));ok(JSON.stringify(c.meta)===before,'generation failure never takes gold');
c.randomLoot=r=>({armor:{rarity:r}});c.persist=()=>{c.window.__saveStatus={ok:false};};before=JSON.stringify(c.meta);ok(c.purchaseShopChest('common')===null&&JSON.stringify(c.meta)===before,'failed storage rolls back payment and reward');
const costs=Object.values(c.costs);ok(costs.every((v,i)=>!i||v===costs[i-1]*4),'each higher rarity costs four times more');
console.log(checks+' chest purchase conservation and gate checks passed.');
