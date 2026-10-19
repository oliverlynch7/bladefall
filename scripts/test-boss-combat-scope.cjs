// Exercise the shipped helpers without a renderer; browser QA covers all eight callers.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/3d/index.html','utf8');
const functionSource=name=>{const start=source.indexOf('function '+name+'(');assert(start>=0,name);const end=source.indexOf('\n}',start);assert(end>start,name);return source.slice(start,end+2);};
const threat=require('../public/3d/campaign-threat.js');
const ctx={BFCampaignThreat:threat,G:{zone:0,area:-1,ngDmg:1},MP:{active:true,peers:{}},isCampaignAdventure:()=>true,dXZ:(a,b,c,d)=>Math.hypot(c-a,d-b),DIFFICULTY:1,stageScale:()=>1+ctx.G.zone*.22,campaignEnemyDamageMul:()=>1,tEnemyDmg:()=>1,dtune:()=>({boss:1})};
vm.createContext(ctx);vm.runInContext(functionSource('bossPartyTarget')+'\n'+functionSource('scaledEnemyDamage'),ctx);
const origin={x:0,z:0},p={x:500,z:0,y:0,hp:100},peer={x:40,z:0,y:0,hp:100,zone:0,area:-1};
let cases=0;
for(let zone=0;zone<8;zone++){
 ctx.G.zone=zone;const friend={...peer,zone};ctx.MP.peers={friend};assert.equal(ctx.bossPartyTarget(origin,p),friend);cases++;
 for(const change of [{area:0},{zone:zone+1},{downed:true},{dead:true},{hp:0},{x:NaN},{z:NaN},{y:Infinity}]){
  ctx.MP.peers={friend:{...friend,...change}};assert.equal(ctx.bossPartyTarget(origin,p),p);
  assert.equal(ctx.bossPartyTarget(origin,{...p,downed:true}),null);cases+=2;
 }
 ctx.MP.peers={friend};assert.equal(ctx.bossPartyTarget(origin,{...p,hp:0}),friend);cases++;
}
ctx.MP.active=false;assert.equal(ctx.bossPartyTarget(origin,p),p);assert.equal(ctx.bossPartyTarget(origin,{...p,dead:true}),null);cases+=2;
// The restraint's ordinary 8-point base is preserved; the animal receives the
// same regional boss scaling as other bosses, without a co-op damage multiplier.
ctx.G.zone=5;const solo=ctx.scaledEnemyDamage(8,true)*1.8;
assert(Math.abs(solo-92.77632*threat.bossDamage(5,-1))<1e-6);ctx.MP.active=true;assert.equal(ctx.scaledEnemyDamage(8,true)*1.8,solo);
ctx.G.ngDmg=1.4;assert(Math.abs(ctx.scaledEnemyDamage(8,true)*1.8-solo*1.4)<1e-6);
ctx.G.ngDmg=1;ctx.dtune=()=>({boss:.7});assert(Math.abs(ctx.scaledEnemyDamage(8,true)*1.8-solo*.7)<1e-6);
// Factoring the existing enemy formula must not change ordinary soldiers or trials.
ctx.campaignEnemyDamageMul=()=>1.3;assert.equal(ctx.scaledEnemyDamage(8,false),8*1.18*1.3);
assert.equal(ctx.scaledEnemyDamage(8,false,true),8*1.18*1.3*1.25);
const H=require('../public/3d/hydra.js'),G={hydraArena:{revision:3,attackDamage:solo,broken:[]},enemies:[]},remote={hydraArena:{revision:0},enemies:[]};
assert(H.apply(remote,H.snapshot(G,'room'), 'room'));assert.equal(remote.hydraArena.attackDamage,solo);assert(!H.apply(remote,H.snapshot(G,'old-room'),'room'));
console.log(`${cases} boss target cases, encounter damage scaling, unchanged soldier/trial damage and Hydra damage replication passed.`);
