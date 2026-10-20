const assert=require('node:assert/strict'),C=require('../public/3d/briar-combat.js'),E=require('../public/3d/campaign-elites.js'),B=require('../public/3d/brute-encounter.js'),T=require('../public/3d/boss-tactics.js');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
const world=()=>({zone:0,area:0,enemies:[]});
for(const outside of [{zone:1},{area:-1},{area:2},{bonusActive:true},{sprintFun:true},{sparringRoom:true},{hub:true},{side:true},{trial:true},{endless:true},{delve:true},{arena:true},{devBriar:true},{devKeep:true}])ok(!C.active({...world(),...outside}),'exclude '+JSON.stringify(outside));
let serial=0;function foe(role){const e={mid:++serial,type:role==='hex'?'caster':'grunt',briarRoleHint:role,speed:50,hp:60,maxHp:60,x:0,y:0,z:0,r:17,h:50,sx:0,sz:0};E.briar(e);return e;}
{const injured=foe('guard');injured.briarRole=null;injured.ceKind=null;injured.maxHp=60;injured.hp=30;E.briar(injured);ok(injured.hp/injured.maxHp===.5,'tuning preserves wounded health fraction');}
for(const role of ['runner','guard','hex']){
 const e=foe(role),hp=e.hp,speed=e.speed;E.briar(e);ok(e.hp===hp&&e.speed===speed,'role tuning only once');ok(hp>=70&&hp<=84,'modest fixed durability');
 const k=E.kits[e.ceKind];ok(k.wind>=.7&&k.recover>=.9,'readable tell and punish');
 const p={x:0,z:100,y:0,hp:100,r:13};e.ceClock=0;E.step(e,.05,p,0,false);ok(e.ceState==='hunt','no hidden attack through cover');E.step(e,.05,p,0,true);ok(e.ceState==='wind','visible attack starts');
 const aim=[e.ceDX,e.ceDZ,e.ceX,e.ceZ];for(let i=0;i<200&&e.ceState==='wind';i++)E.step(e,.01,{...p,x:300},0,false);ok(e.ceState==='strike','committed attack completes even after LOS changes');assert.deepEqual([e.ceDX,e.ceDZ,e.ceX,e.ceZ],aim);
 ok(!E.contains(e,{...p,x:600,z:600}),'sidestepping escapes actual hit geometry');
 while(e.ceState==='strike')E.step(e,.01,p,0);ok(Math.abs(C.damage(e,100)-115)<1e-9,'recovery bonus');
 e.ceState='hunt';ok(C.damage(e,100)===100,'ordinary damage unchanged');
 const snap=E.snapshot(e);ok(snap.briarRole===role&&snap.ceSerial===1,'host snapshot retains geometry');
}
let G=world(),e=foe('runner'),p={x:0,y:0,z:100,hp:100};G.enemies=[e,...[0,1].map(i=>({...foe('guard'),ceState:'wind',ceY:0,x:i*60}))];
ok(!C.decision(G,e,p,true).attack,'two simultaneous tells maximum solo');ok(C.decision(G,e,p,true,2).attack,'co-op allows third');ok(!C.decision(G,e,p,false,2).attack,'cover still blocks co-op tell');
G.enemies[1].ceKind=null;G.enemies[1].kind='charger';G.enemies[1].windT=.7;ok(!C.allowAttack(G,e,p,true),'boar warnings share pressure budget');G.enemies[1].windT=0;G.enemies[1].chargeT=.5;ok(!C.allowAttack(G,e,p,true),'active rams share pressure budget');G.enemies[1].ceY=220;ok(C.decision(G,e,p,true).attack,'different storey does not consume attack budget');
const home=C.decision(G,e,{...p,z:1200},true);ok(!home.attack&&home.target.z===0,'no unlimited pursuit');ok(e.hp===e.maxHp,'leash does not refill HP');
e.hp-=10;C.decision(G,e,{...p,z:1400},true);ok(e.hp===e.maxHp-10,'wounded enemy stays wounded');e.ceState='wind';ok(C.decision(G,e,{...p,z:1400},true).target.z===1400,'leash does not cancel committed tell');
e=foe('hex');e.ceState='wind';ok(C.hit(e,10)===null,'small hits cannot cancel casts');ok(C.hit(e,e.maxHp*.31)==='CAST INTERRUPTED'&&e.ceState==='recover'&&e.ceClock>=1,'strong hit interrupts');ok(!E.contains(e,p),'interrupted cast cannot deal ghost damage');
e=foe('guard');e.ceState='wind';ok(C.hit(e,50)===null&&e.ceState==='wind','ordinary guards cannot be stunlocked by hit policy');e.ceState='recover';ok(C.hit(e,1)==='OPENING','one opening cue');ok(C.hit(e,1)===null,'no repeated cue spam');
G=world();G.enemies=[{mid:1,type:'grunt',x:270,z:-220,hp:60},{mid:2,type:'grunt',x:10,z:-220,hp:60}];let spawns=0;const api={spawn(type,x,z){const q={mid:++serial,type,x,z};G.enemies.push(q);spawns++;return q},support(){return 0}};C.build(G,api);ok(G.enemies[0].briarRoleHint==='runner'&&G.enemies[1].briarRoleHint==='guard','first fight differentiates roles');ok(spawns===2,'only two finite extra main-route enemies');C.build(G,api);ok(spawns===2,'build idempotent');
G={...world(),area:1,enemies:[]};C.build(G,api);ok(spawns===4,'two forest approach searchers');
for(const fps of [20,30,60,120]){
 e={x:0,y:0,z:0,hp:100,maxHp:100,r:44,bruteState:'charge',bruteClock:1.05,teleX:0,teleZ:1,bruteWaves:0};
 const preview=B.chargePreview(e,[],(x,z)=>z<200);ok(preview.edge&&preview.distance<200,'edge preview stops on actual floor');
 const env={props:[],walkable:(x,z)=>z<200,speed:90,tell(){},impact(){throw Error('edge must not grant cart stagger')},slam(){},handlers(){}};
 while(e.bruteState==='charge')B.step(e,1/fps,{x:0,z:900},env);ok(e.z<200&&e.bruteState==='recover','boss stops before arena edge at '+fps+'fps');
}
e={hp:1000,maxHp:1000,bruteOrchard:true,bruteStaggers:1,bruteState:'recover'};ok(T.damage({},e,p,100)===0,'ordinary recovery cannot bypass cart strategy');e.bruteState='hunt';ok(T.damage({},e,p,100)===0,'cart guard blocks damage outside a stagger');
console.log(checks+' Briar role, LOS, warning, cover, pressure, pursuit, interruption, reward, finite placement, boss edge and recovery checks passed.');

for(const [health,state,wind]of [[100,'wind',1.15],[60,'slam',0],[20,'slam',0]]){const boss={x:0,z:0,y:0,r:44,hp:health,maxHp:100,bruteState:'hunt',bruteClock:0,bruteTurns:2,bruteWaves:2};B.step(boss,.016,{x:0,z:350},{props:[],speed:90,tell(){},impact(){},handlers(){},slam(){}});assert.equal(boss.bruteState,state);if(wind)assert.equal(boss.windMax,wind);}
console.log('Brute phase 2/3 ground-wave variation and first-phase charge preserved.');
