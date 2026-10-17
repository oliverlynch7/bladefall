const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rules=require('../public/3d/encounter-rewards.js');let checks=0;function ok(v,m){assert(v,m);checks++;}
for(let l=1;l<=100;l++){
 const ordinary=rules.chance({},l),elite=rules.chance({elite:true},l);
 ok(ordinary>=.015&&ordinary<=.03,'ordinary rate bounded');ok(elite>=.08&&elite<=.12,'elite rate bounded');ok(elite>ordinary,'stronger foe has better odds');
 for(const e of [{},{elite:true},{boss:true}]){let total=0;for(let i=0;i<1000;i++){const r=rules.grade(e,l,i/1000);ok(['common','uncommon','rare','epic','legendary'].includes(r),'valid chest');total+=['common','uncommon','rare','epic','legendary'].indexOf(r);}e.mean=total/1000;}
}
ok(rules.chance({practice:true,boss:true},30)===0,'practice never rewards');ok(rules.chance({boss:true},1)===1,'boss chest guaranteed');
let prev=0;for(const z of [0,1,2,3,4,5,6,7]){const level=rules.level({zone:z,area:0},{});ok(level>prev,'later zones have higher encounter level');prev=level;}
ok(rules.level({zone:0,area:0,p:{level:100}}, {})===1,'player level cannot raise early foes');
ok(rules.gold(1234)==='1,234'&&rules.gold(999999999999).length<9,'large gold remains compact');
const html=fs.readFileSync('public/3d/index.html','utf8');
const start=html.indexOf('function enemyEncounterLevel('),end=html.indexOf('// Phase 9: no more roguelite',start),source=html.slice(start,end);
const mock={G:{zone:0,area:0,stageIndex:0,runSeed:123,time:10,chests:[]},meta:{},BFEncounterRewards:rules,Math,randomLoot:r=>({armor:{name:r+' Armor',rarity:r}}),makeWeapon:(a,r,n)=>({arche:a,rarity:r,name:n}),makeArmor:r=>({rarity:r,name:'armor'}),floorAt:()=>0,prepareChest:c=>{c._record=mock.meta.chestRecords[c.rewardKey];c.rarity=c._record.rarity;},SFX:{drop(){}},RARITY:Object.fromEntries(['common','uncommon','rare','epic','legendary'].map((r,i)=>[r,{tier:i,color:'#fff'}])),burst(){},persist(){},BFChestRules:{reward:r=>r}};
vm.createContext(mock);vm.runInContext(source,mock);
mock.rollDrop({mid:10,type:'grunt',x:40,z:60,y:0});ok(mock.G.chests.length===1,'drop is chest');ok(!mock.G.pickups,'never creates loose gear');const first=mock.G.chests[0],key=first.rewardKey;ok(first.enemyReward&&first.dropReadyAt===10.8,'distinct chest presentation before auto-open');
mock.rollDrop({mid:10,type:'grunt',x:40,z:60});ok(mock.G.chests.length===1,'same enemy cannot duplicate');
mock.meta.chestRecords[key].claimed=true;mock.G.chests=[];mock.rollDrop({mid:10,type:'grunt',x:80,z:90});ok(mock.G.chests.length===0,'claimed enemy cannot reroll');
mock.meta.chestRecords[key].claimed=false;mock.restoreEnemyChests();ok(mock.G.chests.length===1&&mock.G.chests[0].rewardKey===key,'unclaimed chest restored from saved record');mock.restoreEnemyChests();ok(mock.G.chests.length===1,'restore idempotent');
mock.rollDrop({mid:11,type:'king',boss:true,x:200,z:60});ok(mock.G.chests.length===3,'named king relics each get a chest');ok(Object.values(mock.meta.chestRecords).some(r=>r.item.weapon?.name==='Abyss Blade'),'unique relic retained');
for(const flags of [{hub:true},{trial:'warrior'},{arena:true}]){const old=mock.G.chests.length;Object.assign(mock.G,flags);mock.rollDrop({mid:12,type:'grunt',x:0,z:0});ok(mock.G.chests.length===old,'no combat loot in safe/training/PvP');for(const k of Object.keys(flags))delete mock.G[k];}
ok(!html.includes('classChoiceLater'),'no choose later button');ok(html.includes("mode==='upgrade'&&document.querySelector('.classpick')"),'Escape cannot dismiss unmade choice');
const kill=html.slice(html.indexOf('function killEnemy('),html.indexOf('function prepareChest('));ok(!kill.includes('pushLoot('),'all enemy kill gear uses chests');
console.log(JSON.stringify({checks,normalRate:[.015,.03],eliteRate:[.08,.12],personalChests:true,saveRestoration:true,requiredChoice:true}));
// Actual guest kill-packet handler: replayed authoritative kills are credited once;
// fallback chest identity survives a reconnect even without a local enemy model.
{
 const a=html.indexOf('  applyEnemies(en,ek){'),b=html.indexOf('// ================= P1.3 DOWNED',a);
 const peerCode='globalThis.peer={guest:()=>true,byMid:()=>null,ekey:()=>"grunt",_killed:{},'+html.slice(a,b)+'};';
 let xp=0,quests=0;const isolatedMath=Object.create(Math);isolatedMath.random=()=>0;
 Object.assign(mock,{Math:isolatedMath,ENEMY:{grunt:{kind:'walk'}},gainXp:n=>xp+=n,questKill:()=>quests++});mock.G.enemies=[];mock.G.p={x:0,z:0};mock.G.chests=[];mock.meta.chestRecords={};
 vm.runInContext(peerCode,mock);const packet=[[700,0,false,false,10]];mock.peer.applyEnemies([],packet);mock.peer.applyEnemies([],packet);
 ok(xp===10&&quests===1,'repeated host packet cannot credit twice');ok(mock.G.chests.length===1,'missing local mob still yields personal chest');ok(mock.G.chests[0].rewardKey.includes(':enemy:700:'),'host enemy id used in saved reward key');
 const record=mock.meta.chestRecords[mock.G.chests[0].rewardKey];record.claimed=true;mock.G.chests=[];mock.peer._killed={};mock.peer.applyEnemies([],packet);ok(mock.G.chests.length===0,'reconnect packet cannot recreate an already claimed chest');
 console.log('4 actual co-op kill-packet / reconnect reward checks passed.');
}
