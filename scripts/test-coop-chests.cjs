// Actual chest transactions in isolated player contexts; no WebRTC/visual claims.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n');
const clone=o=>JSON.parse(JSON.stringify(o));let checks=0;
const ok=(v,m)=>{assert(v,m);checks++;};
function fn(n){const a=source.indexOf('function '+n+'('),b=source.indexOf('\nfunction ',a+12);assert(a>=0);return source.slice(a,b);}
function player(host){
 let serial=0;const c={MIMIC_RATE:0,isCampaignAdventure:()=>false,campaignChestLoot:r=>c.randomLoot(r),window:{},console,Math,Set,Map,Number,Object,Array,
  G:{zone:0,area:0,runSeed:123,stageIndex:0,floor:0,time:10,shake:0,chests:[],p:{x:-500,y:0,z:500,gear:{}}},
  meta:{classId:'warrior',chestRecords:{},stash:[],gold:0},STASH_CAP:3,RORDER:['common','uncommon','rare','epic','legendary'],
  MP:{active:true,isHost:host,guest:()=>!host},persist(){},floorAt:()=>0,enemyEncounterLevel:()=>2,
  randomLoot:r=>({armor:{slot:'chest',name:(host?'Host':'Guest')+' reward '+ ++serial,rarity:r}}),
  makeWeapon:(a,r,n)=>({arche:a,rarity:r,name:n}),makeArmor:r=>({rarity:r,name:'Armor'}),
  BFEncounterRewards:{grade:()=> 'rare'},BFPrisonRun:{profile:()=>c.profile,checkpoint(){},overflow:()=>10},profile:{},
  RARITY:Object.fromEntries(['common','uncommon','rare','epic','legendary'].map((r,i)=>[r,{tier:i,color:'#fff'}])),
  SFX:{pickup(){},drop(){}},burst(){},playFx(){},addText(){},hudUpdate(){},campaignCheckpoint:()=>null,
  checkpointClone:clone,fullBagNotice:()=>c.blocked=true,sellItem:()=>{c.meta.gold+=10;return 10;},
  awardGold:n=>{c.meta.gold+=n;return n;},equipmentNotice(){},revealChestReward:()=>c.reveals=(c.reveals||0)+1,
  finishHubSprint:()=>c.finished=true};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/3d/chest-rules.js','utf8'),c);c.BFChestRules=c.window.BFChestRules;
 for(const n of ['chestRewardKey','coopChestSnapshot','applyCoopChests','prepareChest','openChest','enemyChestScene','restoreEnemyChests','rollDrop'])vm.runInContext(fn(n),c);
 return c;
}
const share=(h,g)=>{const p=clone(h.coopChestSnapshot());g.applyCoopChests(p);return p;};
for(const hostFirst of [true,false]){
 const h=player(true),g=player(false);h.rollDrop({type:'grunt',mid:7,x:60,z:85,y:0});
 const p=share(h,g),hc=h.G.chests[0],gc=g.G.chests[0];
 ok(gc.x===60&&gc.z===103&&gc.rarity===hc.rarity,'same chest position and rarity, not guest position');
 ok(hc.rewardKey===gc.rewardKey,'same stable chest identity');
 ok(!JSON.stringify(p).includes('claimed')&&!JSON.stringify(p).includes('item')&&!JSON.stringify(p).includes('opened'),'network carries no inventory or personal claims');
 h.G.time=g.G.time=11;
 const first=hostFirst?h:g,second=hostFirst?g:h;first.openChest(first.G.chests[0]);
 ok(first.meta.stash.length===1&&!second.G.chests[0].opened,'first claim is personal');
 share(h,g);second.openChest(second.G.chests[0]);share(h,g);
 ok(h.meta.stash.length===1&&g.meta.stash.length===1,'both receive gear independently');
 ok(h.reveals===1&&g.reveals===1,'both see their own reveal');
 ok(h.meta.stash[0].armor.name!==g.meta.stash[0].armor.name,'personal item rolls retained');
 for(let i=0;i<20;i++){share(h,g);h.openChest(hc);g.openChest(gc);}
 ok(h.meta.stash.length===1&&g.meta.stash.length===1,'replayed manifests never duplicate either reward');
 const old=clone(p);old.entries=[];g.applyCoopChests(old);ok(g.G.chests.length===1,'stale revision ignored');
}
{
 const h=player(true),g=player(false);h.rollDrop({type:'grunt',mid:8,x:40,z:20});share(h,g);h.G.time=g.G.time=11;
 g.meta.stash=[1,2,3];g.openChest(g.G.chests[0]);h.openChest(h.G.chests[0]);share(h,g);
 ok(g.blocked&&!g.G.chests[0].opened&&h.meta.stash.length===1,'full bag does not block friend or consume claim');
 g.meta.stash.pop();g.openChest(g.G.chests[0]);ok(g.meta.stash.length===3&&g.G.chests[0].opened,'claim survives until room available');
}
{
 const h=player(true),g=player(false);h.rollDrop({type:'grunt',mid:9,x:40,z:20});share(h,g);g.G.time=11;g.meta.autoSellEquipment=true;g.openChest(g.G.chests[0]);
 ok(g.meta.gold===10&&g.meta.stash.length===0&&!h.G.chests[0].opened,'auto-sell remains personal');
 h.G.time=11;h.openChest(h.G.chests[0]);h.G.chests=[];delete h.G._enemyChestScene;h.restoreEnemyChests();
 ok(h.G.chests.length===1&&h.G.chests[0].opened,'host preserves closed claim descriptor for late join');
 const late=player(false);share(h,late);ok(late.G.chests.length===1&&!late.G.chests[0].opened,'late join sees chest after host claim');
 const saved=clone(g.meta.chestRecords);g.G.chests=[];g.meta.chestRecords=saved;share(h,g);g.openChest(g.G.chests[0]);
 ok(g.G.chests[0].opened&&g.meta.gold===10,'saved personal claim cannot reroll on reconnect');
 h.MP._chestStream='replacement-host';h.MP._chestRevision=0;share(h,g);ok(g.G._coopChestRevision===1,'new host stream resets network revision safely');
}
{
 const h=player(true),g=player(false);h.G.chests=[{x:300,z:400,y:20,rarity:'epic',opened:false}];
 share(h,g);ok(g.G.chests.length===1,'placed chest synchronized');g.G.chests.push({...g.G.chests[0]});share(h,g);ok(g.G.chests.length===1,'room creation/snapshot duplicates collapse');
 h.G.time=g.G.time=20;g.openChest(g.G.chests[0]);share(h,g);ok(g.G.chests[0].opened&&!h.G.chests[0].opened,'guest placed-chest claim does not affect host');
 h.G.chests=[{x:20,z:30,y:0,mimic:true}];share(h,g);ok(g.G.chests.some(c=>c.mimic),'mimic shared as threat');h.G.chests=[];share(h,g);ok(!g.G.chests.some(c=>c.mimic),'revealed mimic chest removed on guest');
}
{
 const h=player(true),g=player(false);g.rollDrop({type:'king',mid:9,x:20,z:30});ok(!g.G.chests.length,'guests cannot roll their own boss drops');
 h.rollDrop({type:'king',mid:9,x:20,z:30});share(h,g);ok(g.G.chests.length===2,'both final king reward chests mirrored');ok(g.meta.chestRecords[g.G.chests[0].rewardKey].item.weapon?.name==='Abyss Blade'&&!!g.meta.chestRecords[g.G.chests[1].rewardKey].item.armor,'guaranteed unique king weapon and armor preserved for guest');
 const p=clone(h.coopChestSnapshot());p.scene+='old';g.G.chests=[];g.applyCoopChests(p);ok(!g.G.chests.length,'wrong scene ignored');
 p.scene=h.enemyChestScene();p.entries[0].x=NaN;g.applyCoopChests(p);ok(!g.G.chests.length,'malformed manifest rejected atomically');
 for(const flags of [{hub:true},{trial:'warrior'},{arena:true},{sprintFun:true}]){Object.assign(h.G,flags);ok(h.coopChestSnapshot()===null,'no reward syncing in safe/training/PvP/practice');for(const k in flags)delete h.G[k];}
 h.G.endless=true;h.G.chests=[];h.rollDrop({type:'king',mid:10,x:20,z:30});share(h,g);ok(!g.G.chests.length,'special-mode scene mismatch rejected');g.G.endless=true;share(h,g);ok(g.G.chests.length===2,'Endless chest mirror uses its own scene');
 h.G.escape={};g.G.escape={remote:true};h.G.endless=g.G.endless=false;h.G.chests=[];g.G.chests=[];h.rollDrop({type:'king',mid:11,x:20,z:30});share(h,g);ok(Object.keys(g.profile.chestRecords||{}).length===2,'Prison rewards use personal prison profile');
}
ok(source.includes('if(d.chests)applyCoopChests(d.chests)'),'accepted host state wired to mirror');
ok(source.includes('const chests=coopChestSnapshot();if(chests)msg.chests=chests'),'host broadcast wired to manifest');
for(const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
console.log(JSON.stringify({checks,passed:true,scope:'Actual isolated chest functions and save records; browser rendering and Internet transport not covered by this suite.'}));
// A revealed mimic keeps its original chest ID and both players' personal item rolls.
{
 const h=player(true),g=player(false);h.rollDrop({type:'grunt',mid:93,x:80,z:80,y:0});let hc=h.G.chests[0],rec=h.meta.chestRecords[hc.rewardKey];hc.mimic=true;rec.mimic=true;share(h,g);const gc=g.G.chests[0],hItem=JSON.stringify(rec.item),gItem=JSON.stringify(gc._rewardRecord.item),key=hc.rewardKey;
 ok(gc.mimic&&g.meta.chestRecords[key].mimic,'guest persists shared mimic encounter');
 h.G.chests=[];rec.mimic=false;rec.mimicDefeated=true;h.rollDrop({type:'mimic',mimicE:true,mimicOrigin:key,mimicRarity:'common',mid:94,x:80,z:80});
 share(h,g);hc=h.G.chests[0];ok(hc.rewardKey===key&&!hc.mimic&&!gc.mimic,'defeat replaces shared mimic with safe original chest');ok(JSON.stringify(rec.item)===hItem&&JSON.stringify(gc._rewardRecord.item)===gItem,'neither personal item rerolls after mimic');
 h.G.time=g.G.time=20;h.openChest(hc);g.openChest(gc);ok(h.meta.stash.length===1&&g.meta.stash.length===1,'each player can collect one independent mimic prize');
 h.openChest(hc);g.openChest(gc);ok(h.meta.stash.length===1&&g.meta.stash.length===1,'replayed mimic collection cannot duplicate');
 console.log('Mimic personal co-op reward identity, guest persistence and one-time collection pass.');
}
