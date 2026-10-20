const assert=require('node:assert/strict'),fs=require('node:fs');
const D=require('../public/3d/briar-district.js');
const before=JSON.parse(fs.readFileSync('docs/art-validation/briar-district-20261020/before.json','utf8'));
function fixture(){return {...structuredClone(before),zone:0,area:0,briarJourney:{paths:[],signs:[]},storyObjects:structuredClone(before.objects),storyNpcs:structuredClone(before.npcs),homefieldsExploration:{revision:3}};}
let checks=0;function check(ok,msg){checks++;assert(ok,msg);}
for(const flag of ['hub','side','trial','endless','delve','arena','bonusActive','sprintFun','devBriar','devKeep','bossRush'])check(!D.active({zone:0,area:0,[flag]:true}),'scene isolation '+flag);
check(!D.active({zone:0,area:1}),'Black Woods remains separate');
let g=fixture();const chestCount=g.chests.length,enemyCount=g.enemies.length,keys=g.storyObjects.map(o=>o.key),bounds={...g.bounds};
check(D.install(g),'installs');check(!D.install(g),'idempotent');
check(g.chests.length===chestCount,'no extra loot');check(g.enemies.length===enemyCount,'no enemy spam');
assert.deepEqual(g.bounds,bounds);assert.deepEqual(g.storyObjects.map(o=>o.key),keys);checks+=2;
check(g.briarDistrict.blockedBanks.length===0,'no destinations buried by proposed banks: '+g.briarDistrict.blockedBanks);
check(g.chests.some(o=>o.x===-1630&&o.z===-1840&&o.y===252),'existing reward moved onto optional deck');
check(g.obstacles.filter(o=>o.districtTowerStair).length===14,'shallow tower approach');
check(g.obstacles.filter(o=>o.districtTowerReturn).length===24,'separate tower return');
for(const p of [...g.briarDistrict.stairUp,...g.briarDistrict.stairDown])check(p.every(Number.isFinite),'finite stair');
for(const r of D.plan.roads)for(let i=1;i<r.points.length;i++){
 const a=r.points[i-1],b=r.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20);
 for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;
  const blocker=g.obstacles.find(o=>(o.districtFence||o.districtField||o.districtBank||o.districtCover)&&o.h>8&&Math.abs(x-o.x)<o.w/2+18&&Math.abs(z-o.z)<o.d/2+18);
  check(!blocker,r.id+' blocked by '+JSON.stringify(blocker));
  check(g.segments.some(s=>Math.abs(x-s.x)<s.w/2&&Math.abs(z-s.z)<s.d/2),'supported road '+r.id);
  check(!(z<-2070&&z>-2280),'roads cannot fill millrace');
 }
}
for(const f of g.obstacles.filter(o=>o.districtTowerStair||o.districtTowerReturn))check(f.slab===12&&f.y0===f.h-12,'stair top and underside coherent');
for(let i=0;i<=20;i++){const x=100-i*28,z=-1060,y=i*7;check(!g.obstacles.some(o=>o.districtFence&&o.h>y+2&&Math.abs(x-o.x)<o.w/2+18&&Math.abs(z-o.z)<o.d/2+18),'existing watchpost stair gate remains open');}
for(const o of g.deco.filter(o=>o.district===true&&o.kind==='craft'))check(o.options.w===o.w&&o.options.h===o.h&&o.options.d===o.d,'model dimensions match authoring');
for(const e of g.enemies.filter(e=>e.type==='grunt'||e.type==='caster'))check(['guard','runner','hex'].includes(e.briarRoleHint),'explicit troop role');
check(g.obstacles.filter(o=>o.district===true).length<95,'merge straight boundaries instead of per-panel colliders');
for(const o of g.segments.filter(o=>o.district===true))check(!(o.z-o.d/2<-2070&&o.z+o.d/2>-2280),'new safety ground cannot enter millrace');
let original;g=fixture();const retained=g.chests.find(o=>o.x===-2210&&o.z===-1840);D.install(g,{chestKey(ch){original=[ch.x,ch.z];ch.rewardKey='campaign:old-expedition:-2210,-1840';}});
assert.deepEqual(original,[-2210,-1840]);checks++;check(retained.rewardKey==='campaign:old-expedition:-2210,-1840','moving a chest retains its existing reward receipt');
const second=fixture();D.install(second,{chestKey(ch){ch.rewardKey='campaign:old-expedition:-2210,-1840';}});assert.deepEqual(g.briarDistrict,second.briarDistrict);checks++;
assert.deepEqual(JSON.parse(fs.readFileSync('public/design/campaign-geography/briar-district-plan.json','utf8')),D.plan);checks++;
for(const b of D.plan.banks){const ch={x:b.x,z:b.z,y:0,enemyReward:true,rewardKey:'kept:'+b.id};check(D.recoverLoot(g,ch),'old enemy chest rescued from '+b.id);check(ch.rewardKey==='kept:'+b.id,'personal roll identity retained');check(!D.recoverLoot(g,ch),'safe landing is stable');check(!D.plan.banks.some(b=>D.inside(ch,b,28)),'restored loot stays outside enclosures');}
const authored={x:D.plan.banks[0].x,z:D.plan.banks[0].z};check(!D.recoverLoot(g,authored),'authored props are never silently relocated');
let boxes=0;D.fallback(g,()=>boxes++);check(boxes>40,'fallback retains visible steps, planted boundaries and cover');
global.HERO3D={on:true,ready:true};global.__world3d=()=>({on:true,ready:true});global.BFCampaignCraft={has:id=>id==='briar-district-stair-approach'};boxes=0;D.fallback(g,()=>boxes++);check(boxes===0,'detailed renderer suppresses duplicate fallback');global.HERO3D.on=false;D.fallback(g,()=>boxes++);check(boxes>40,'changing renderer mid-level retains geometry');delete global.HERO3D;delete global.__world3d;delete global.BFCampaignCraft;
check(!g.deco.some(o=>o.district&&o.kind==='tree'),'no added heavy tree population');
const text=fs.readFileSync('public/3d/index.html','utf8');check(text.indexOf('BFCampaignGeography.apply(G,Z.id);BFCampaignJourney.install(G);BFBriarDistrict.install(G,{chestKey:chestRewardKey});')>0,'install after geography, before patrol construction');
check(text.includes('G.briarDistrict=null;G.returnActive=null;'),'world handoff resets district');
console.log(JSON.stringify({checks,addedColliders:g.obstacles.filter(o=>o.district===true).length,addedModels:g.deco.filter(o=>o.district===true).length,retainedChests:chestCount,retainedEnemies:enemyCount,pass:true}));
