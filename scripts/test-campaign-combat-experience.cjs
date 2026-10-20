const assert=require('node:assert/strict'),E=require('../public/3d/campaign-elites.js'),B=require('../public/3d/boss-tactics.js');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++},foe=(type='grunt')=>({mid:1,type,x:0,y:0,z:0,hp:100,maxHp:100,speed:100,r:18,h:50,dmg:15,xp:13,active:true}),world=(zone=1,area=0)=>({zone,area,time:10,enemies:[]});
for(let zone=1;zone<8;zone++)for(let area=0;area<2;area++)for(const type of ['grunt','caster']){
 const G=world(zone,area),e=foe(type);E.campaign(G,e);ok(e.campaignRole,'ordinary troop upgraded '+zone+'/'+area+'/'+type);ok(e.hp===100&&e.maxHp===100&&e.xp===13&&e.dmg===15,'no hidden stat inflation');
 const before=JSON.stringify(e);E.campaign(G,e);ok(JSON.stringify(e)===before,'idempotent assignment');
 const k=E.kits[e.ceKind],p={x:0,y:0,z:100,hp:100,r:12};e.ceClock=0;
 E.step(e,.016,p,0,true);ok(e.ceState==='wind','tells before strike');const aim=[e.ceX,e.ceZ,e.ceDX,e.ceDZ];
 while(e.ceState==='wind'){ok(!E.contains(e,p),'wind cannot hit');E.step(e,.01,{...p,x:500},0,false);}
 assert.deepEqual([e.ceX,e.ceZ,e.ceDX,e.ceDZ],aim);checks++;
 const snap=E.snapshot(e);ok(snap.campaignRole===e.campaignRole&&snap.ceKind===e.ceKind&&snap.ceState==='strike','phase identity survives co-op');
 for(const q of [{...p,x:900,z:900},{...p,y:150},{...p,hp:0}])ok(!E.contains(e,q),'clear evade/death/vertical escape');
 while(e.ceState==='strike')E.step(e,.01,p,0);ok(e.ceState==='recover'&&!E.contains(e,p)&&E.damage(e,100)>100,'real punish window');
}
for(const flags of [{trial:'mage'},{hub:true},{endless:true},{delve:true},{arena:true},{bonusActive:true},{side:true},{sparringRoom:true},{devBriar:true},{devKeep:true},{area:-1}]){const G={...world(),...flags},e=foe();E.campaign(G,e);ok(!e.ceKind,'special mode unchanged '+JSON.stringify(flags));}
for(const flags of [{boss:true},{elite:true},{spec:'blink'},{keepEscort:true},{canyonAlarm:true},{furnaceEscort:true},{libraryGuard:true},{prisonFoe:'knight'},{hydraChain:true},{dummy:true},{bot:true}]){const e={...foe(),...flags};E.campaign(world(),e);ok(!e.ceKind,'specialist/scripted fight unchanged '+JSON.stringify(flags));}
const p={x:0,y:0,z:120,hp:100,r:12};
function strike(kind,clock){return {...foe(),campaignRole:'caster',ceKind:kind,ceState:'strike',ceClock:clock??E.kits[kind].strike,ceX:0,ceY:0,ceZ:0,ceDX:0,ceDZ:1};}
ok(E.contains(strike('keep_lance'),{...p,z:90})&&!E.contains(strike('keep_lance'),{...p,x:70,z:90}),'thrust exact hit/miss');
ok(!E.contains(strike('keep_lance'),{...p,z:145}),'short weapon cannot hit the end of its thrust lane before stepping into reach');
ok(E.contains(strike('ember_fan'),p)&&!E.contains(strike('ember_fan'),{...p,z:-120}),'cleave front/rear');
ok(E.contains(strike('frost_ring',.325),p)&&!E.contains(strike('frost_ring',.325),{...p,y:50}),'ring can be jumped');
ok(E.contains(strike('dusk_curse'),{...p,z:50})&&!E.contains(strike('dusk_curse'),{...p,z:150}),'ground mark finite');
ok(E.contains(strike('palace_cross'),p)&&!E.contains(strike('palace_cross'),{...p,x:120}),'cross has diagonal safe pockets');
ok(E.contains(strike('coast_volley'),{...p,z:300})&&!E.contains(strike('coast_volley'),{...p,x:48,z:300}),'volley has actual safe lanes');
{const e=foe('caster');E.campaign(world(2),e);e.ceClock=0;E.step(e,.016,{...p,y:50},0);ok(e.ceY===0,'jumping does not suspend a ground curse invisibly in the air');}
let e=strike('dusk_curse');e.ceState='wind';ok(E.hit(e,24)===null&&e.ceState==='wind','tiny hits cannot stunlock');ok(E.hit(e,25)==='CAST INTERRUPTED'&&e.ceState==='recover'&&!E.contains(e,p),'strong cast interrupt harmless');
e=foe();E.campaign(world(),e);e.ceClock=0;const G=world();G.enemies=[e,...[1,2].map(i=>({...strike('keep_lance'),mid:i+1,ceState:'wind'}))];ok(!E.decision(G,e,p,true,1).attack,'solo pressure budget');ok(E.decision(G,e,p,true,2).attack,'duo has extra pressure');G.enemies[1].ceStartedAt=9.9;ok(!E.decision(G,e,p,true,2).attack,'separate warnings instead of simultaneous spike');G.enemies[1].y=G.enemies[1].ceY=500;ok(E.decision(G,e,p,true,2).attack,'other storey does not consume slots');ok(!E.decision(G,e,p,false,2).attack,'cover blocks initiation');
const hp=e.hp-30;e.hp=hp;const home=E.decision(G,e,{...p,z:1400},true);ok(home.returning&&!home.attack&&home.target.z===0&&e.hp===hp,'finite pursuit without free health refill');e.ceState='wind';ok(!E.decision(G,e,{...p,z:1400},true).returning,'committed attacks do not cancel');
e={...foe(),ceKind:'cliff_lunge',ceState:'strike',ceClock:.34,ceX:0,ceY:0,ceZ:0,ceDX:0,ceDZ:1};for(let i=0;i<40;i++)E.step(e,.01,p,100,true,()=>{});ok(e.x===0&&e.z===0&&!E.contains(e,{...p,z:180}),'blocked rush cannot warp or hit beyond attacker');
for(const [actor,expected]of [[{marksmanCrossing:true,markState:'aim',markClock:.4},'cover'],[{fallenDuel:true,fallState:'feint'},'Feint'],[{frostOfficer:'shield'},'flank'],[{furnaceColossus:true,fcExposed:2},'attack'],[{marbleGuardian:true,mcState:'wind',mcKind:'sweep'},'JUMP'],[{hydraChain:true,hydraIndex:0},'pale joint'],[{finalKing:true,akStage:'fight2',akState:'wind',akKind:'wave'},'JUMP']]){const cue=B.cue({enemies:[],hydraArena:{state:'recover',head:0,seq:1}},{...foe(),...actor},{jump:'JUMP',dodge:'DODGE'});ok(cue?.text.includes(expected),'boss cue matches real phase '+JSON.stringify(actor));}
ok(B.cue({}, {...foe(),finalKing:true,akStage:'intro'})===null,'no combat cue during finale dialogue');
console.log(checks+' campaign tactics, geometry, counterplay, scope, co-op, pursuit and boss cue checks passed.');
