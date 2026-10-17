const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const threat=require('../public/3d/campaign-threat.js'),health=require('../public/3d/enemy-health.js');let checks=0;
const ok=(v,m)=>{assert(v,m);checks++;};
const src=fs.readFileSync('public/3d/index.html','utf8');
const slice=n=>{const at=src.indexOf('function '+n+'(');return src.slice(at,src.indexOf('\n}',at)+2);};
let campaign=true,party=1;
const ctx={G:{zone:0,area:0,ngHp:1,ngDmg:1,enemies:[],runSeed:1},BFCampaignThreat:threat,isCampaignAdventure:()=>campaign,DIFFICULTY:1,stageScale:()=>1+ctx.G.zone*.22,partyHpMul:()=>party,tEnemyHp:()=>.9,tEnemyDmg:()=>.9,dtune:()=>({boss:.8}),ENEMY:{grunt:{hp:22,dmg:8,speed:62,r:15,h:38,xp:13,kind:'walk'},brute:{hp:190,dmg:18,speed:46,r:30,h:74,xp:140,boss:true,kind:'boss'},dummy:{hp:400,dmg:0,speed:0,r:14,h:54,xp:0,kind:'walk'}},window:{},mulberry:()=>()=>1,TRIALS:{},trainingDummyHp:()=>400,snapEnemyToSurface(){}};
vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf('function campaignEnemyDamageMul('),src.indexOf('function syncCampaignPartyHealth('))+slice('scaledEnemyDamage')+slice('spawnEnemy'),ctx);
for(let z=0;z<8;z++){
 ctx.G.zone=z;ctx.G.area=0;const a=ctx.spawnEnemy('grunt',0,0);ok(a.maxHp===Math.round(22*.9*(1+z*.22)*threat.hp(z,0,false)),'campaign spawn uses authored curve');
 ctx.G.area=1;const b=ctx.spawnEnemy('grunt',0,0);ok(b.maxHp>=a.maxHp,'second half progresses');ok(b.dmg>=a.dmg,'damage progresses');
 party=1.6;const c=ctx.spawnEnemy('grunt',0,0);ok(c.maxHp===Math.round(22*.9*(1+z*.22)*threat.hp(z,1,false)*1.6),'party multiplier applied once');party=1;
}
ctx.G.zone=0;ctx.G.area=-1;const boss=ctx.spawnEnemy('brute',0,0);ok(boss.maxHp===Math.round(190*.9*5*.8*1.65),'Briar boss health increased separately');
ok(ctx.campaignEnemyDamageMul()===1,'boss damage remains on existing boss curve');
campaign=false;ctx.G.area=0;ok(ctx.spawnEnemy('grunt',0,0).maxHp===20,'separate modes retain original HP');ok(ctx.campaignEnemyDamageMul()===1,'separate modes retain damage');
campaign=true;ctx.G.briarBeta=true;ok(ctx.spawnEnemy('grunt',0,0).maxHp===20,'isolated beta remains isolated');ctx.G.briarBeta=false;
ok(ctx.spawnEnemy('dummy',0,0).maxHp===400,'training dummy HP unchanged');
ctx.IN_ARENA=false;ctx.ZONES=Array(8).fill({});
vm.runInContext(src.match(/^function isCampaignAdventure\(\).*$/m)[0],ctx);
for(const flag of ['hub','side','trial','arena','endless','delve','bossRush','bonusActive','devKeep','briarBeta']){ctx.G[flag]=true;ok(ctx.spawnEnemy('grunt',0,0).maxHp===20,flag+' excluded using real campaign predicate');delete ctx.G[flag];}
const world={p:{x:0,y:0,z:0},eye:{x:0,y:40,z:0},obstacles:[],walls:[],doors:[]},e={x:0,y:0,z:200,h:50,hp:100,maxHp:100};
ok(health.visible(world,e,0),'full-health enemy shown');e.dead=true;ok(!health.visible(world,e,.1),'dead hidden');e.dead=false;e.z=900;ok(!health.visible(world,e,.2),'undamaged far enemy hidden');e.hp=70;ok(health.visible(world,e,.3),'damaged enemy longer range');e.z=200;
world.walls=[{x:0,z:100,w:80,d:20,h:100}];ok(!health.visible(world,e,.5),'wall blocks bar');world.walls=[];world.doors=[{x:0,z:100,w:80,d:20,h:100,open:false}];ok(!health.visible(world,e,.7),'closed door blocks');world.doors[0].open=true;ok(health.visible(world,e,.9),'open door reveals');
world.obstacles=[{x:0,z:100,w:80,d:20,h:8}];ok(health.visible(world,e,1.1),'low platform does not hide tall foe');world.obstacles=[{x:0,z:100,w:80,d:20,y0:120,h:60}];ok(health.visible(world,e,1.3),'overhead structure does not block sight below it');
world.obstacles=[{x:0,z:100,w:80,d:20,h:100}];ok(!health.visible(world,e,1.5),'solid prop blocks bar');world.eye.x=200;ok(health.visible(world,e,1.51),'moving camera invalidates cached occlusion');
for(const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);ok(true,'inline scripts compile');
console.log(`${checks} campaign threat and health visibility checks passed.`);
