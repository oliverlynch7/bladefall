const O=require('../public/3d/frost-officers.js');
const A=require('node:assert/strict'),T=require('../public/3d/boss-tactics.js'),B=require('../public/3d/brute-encounter.js'),M=require('../public/3d/marksman-encounter.js'),F=require('../public/3d/fallen-encounter.js'),C=require('../public/3d/furnace-colossus.js'),S=require('../public/3d/marble-guardian.js'),H=require('../public/3d/hydra.js'),K=require('../public/3d/final-king.js');
let checks=0;const ok=(v,m)=>{A(v,m);checks++},foe=o=>({x:0,y:0,z:0,r:20,h:80,hp:1000,maxHp:1000,active:true,...o}),p={x:0,y:0,z:100,r:16,hp:100};const results=[];
function hit(G,e,src=p){const before=e.hp,n=T.damage(G,e,src,1e8);e.hp-=n;if(e.hp<=0)e.dead=true;ok(n<=e.maxHp*.55+1,'Burst bounded');return before-e.hp;}
{const e=foe({finalKing:true,akStage:'fight2',akState:'strike',akKind:'wave',akSeq:900}),jumper={x:200,y:95,z:0,hp:100,onGround:false};ok(K.trackWaveJump(e,jumper),'Actual airborne wave clearance records this actor');jumper.y=0;jumper.onGround=true;ok(!K.inAttack(e,jumper),'Same wave cannot hit on landing after successful clearance');ok(K.inAttack(e,{x:200,y:0,z:0,hp:100}),'Teammates must evade independently');ok(K.inAttack({...e},jumper),'A fresh encounter cannot inherit an old wave clearance');e.akSeq=901;ok(K.inAttack(e,jumper),'Next wave does not inherit immunity');ok(!K.trackWaveJump(e,{...jumper,y:95,busy:true,onGround:false}),'Menu actors cannot invent a wave jump');ok(!K.trackWaveJump(e,{...jumper,y:95,onGround:true}),'Standing on a raised surface is not a wave jump');}
for(const fps of [20,30,60,120]){
 let e=foe({bruteOrchard:true}),events=0;
 for(let i=0;i<3;i++){Object.assign(e,{x:0,z:0,bruteState:'charge',bruteClock:1.05,teleX:0,teleZ:1});for(let n=0;n<fps*2&&e.bruteState==='charge';n++)B.step(e,1/fps,p,{props:[{id:'cart',x:0,z:100,w:70,d:70}],impact(){events++},handlers(){},tell(){},slam(){}});ok(e.bruteState==='stagger','Real swept cart collision opens Brute');hit({},e);if(!e.dead)ok(T.damage({},e,p,1e8)===0,'Spent cart window stays closed');}
 ok(e.dead&&events===3,'Brute needs and accepts repeated collisions at '+fps);results.push({boss:'Brute',fps,events});
 e=foe({fallenDuel:true,speed:100,fallSeq:0,fallTurn:0});events=0;
 for(let i=0;i<3;i++){Object.assign(e,{x:-220,z:-600,fallState:'hunt',fallClock:0});for(let n=0;n<fps*10&&e.fallState!=='stagger';n++)F.step(e,1/fps,{...p,x:-220,z:0},{speed:100,cue(k){if(k==='stagger')events++}});ok(e.fallState==='stagger'&&e.fallRange<400,'Actual pillar catches thrust');hit({},e);}
 if(!e.dead||events!==3)console.log({hp:e.hp,events,seq:e.fallSeq,state:e.fallState,key:e._bossBudgetKey,spent:e._bossBudgetSpent});ok(e.dead&&events===3,'Fallen repeated physical pillar catches at '+fps);results.push({boss:'Fallen',fps,events});
}
{const e=foe({marksmanCrossing:true,markState:'recover',markTurns:1,markMoved:true});M.expose(e);hit({},e);e.markState='recover';ok(T.damage({},e,{...p,y:e.y},1e8)===0,'A nest approach cannot renew the same covered-shot opening');e.markTurns=2;e.markState='aim';e.markExposed=2;ok(T.damage({},e,p,1e8)===0,'Starting another aim cannot renew the prior covered-shot budget');}
let e=foe({marksmanCrossing:true}),shots=0,relocated=false;
for(let n=0;n<5000&&!e.dead;n++){
 M.step(e,.05,p,{reinforce(){relocated=true},tell(){},cue(){},fire(aim){const cover={x:(e.x+aim.x)/2,z:(e.z+aim.z)/2,w:100,d:100,y0:0,h:500};ok(M.coverBlock(e,aim,[cover]),'Real shot intersects stone');M.expose(e);shots++;}});
 if(e.markExposed>0&&e.markState==='recover')hit({},e);
}
ok(e.dead&&relocated&&shots>=3,'Marksman finishes only across cover windows and relocation');results.push({boss:'Marksman',shots,relocated});
e=foe({furnaceColossus:true,fcClock:0,fcState:'recover',fcBeat:0,fcValveCd:0});const G={boss:e};
for(let i=1;i<=3;i++){for(let n=0;n<600&&!C.available(G);n++)C.step(e,.05,p,{enemies:[]});ok(C.available(G),'Cooling actually refills');C.cool(e,i);ok(e.fcExposed>0,'Real valve opens armor');hit({},e);if(!e.dead)ok(!C.available(G)&&e.fcExposed===0,'Cannot instantly reuse cooling');}ok(e.dead,'Colossus finishes via three actual cooling events');results.push({boss:'Ember Colossus',events:3});
e=foe({marbleGuardian:true,mcState:'recover',mcClock:0,mcBeat:0,mcSeq:0,mcExposed:0,mcScreens:[1,0,0],mcUsed:[0,0,0]});let reflections=0;
for(let n=0;n<5000&&!e.dead;n++){S.step(e,.05,{...p,x:-650,z:0},()=>{});if(e.mcExposed>0){reflections++;hit({},e);e.mcScreens[0]+=2;}}
ok(e.dead&&reflections===3,'Three actual oriented screen reflections finish Marble');results.push({boss:'Marble Colossus',reflections});
const hydra={hydraArena:{clock:0,state:'recover',kind:'bite',head:0,seq:0,beat:0,revision:0,elapsed:0,freed:false},enemies:[0,1,2].map(i=>foe({hydraChain:true,hydraIndex:i}))};const seen=new Set();let windows=0;
for(let n=0;n<5000&&!hydra.hydraArena.freed;n++){H.step(hydra,.05,p);const h=hydra.hydraArena;if(h.state==='recover'&&h.seq>0&&!seen.has(h.seq)){seen.add(h.seq);windows++;hit(hydra,hydra.enemies.find(q=>q.hydraIndex===h.head));}}
{const host={hydraArena:{revision:2,state:'recover',head:0,seq:4,broken:[]},enemies:[foe({hydraChain:true,hydraIndex:0,_bossBudgetKey:'joint:4',_bossBudgetSpent:550})]},guest={hydraArena:{revision:1},enemies:[foe({hydraChain:true,hydraIndex:0})]};ok(H.apply(guest,H.snapshot(host,'room'),'room'),'Actual Hydra snapshot applies');ok(guest.enemies[0]._bossBudgetKey==='joint:4'&&guest.enemies[0]._bossBudgetSpent===550,'Dedicated Hydra stream retains spent joint budget');ok(!H.exposed(guest,guest.enemies[0]),'Guest cuff cannot glow after the host spends this joint opening');}
ok(hydra.hydraArena.freed&&windows===6,'All three restraints need two actual attack/rest cycles');results.push({boss:'Hydra',windows});
const officers={enemies:[],walls:[],deco:[],p:{}};O.build({G:officers,seg(){},plat(){},col(){},spawn(type,x,z){const e=foe({type,x,z,dmg:20});officers.enemies.push(e);return e;}});
const officerEvents={};
for(const role of ['caster','shield','spear']){const actor=officers.enemies.find(e=>e.frostOfficer===role);officerEvents[role]=0;for(let cycle=0;cycle<3;cycle++){
 const previous=actor.offSeq||0,player={...p,x:actor.x,z:actor.z+150,y:actor.y};for(let n=0;n<1000&&!(actor.offState==='recover'&&actor.offSeq>previous);n++)O.step(actor,.05,player,{arena:officers.frostOfficers,enemies:officers.enemies,speed:actor.speed});
 ok(actor.offState==='recover'&&actor.offSeq>previous,'Actual '+role+' attack creates new recovery');officerEvents[role]++;
 if(role==='caster'&&cycle===0){ok(T.damage(officers,actor,player,1e8)===0,'Authored initial caster is really protected');const shield=officers.enemies.find(e=>e.frostOfficer==='shield');Object.assign(shield,{x:-600,z:520,y:O.floor(-600,520,officers.frostOfficers)});}
 const attack=role==='shield'?{...player,x:actor.x-Math.sin(actor.yaw)*100,z:actor.z-Math.cos(actor.yaw)*100}:player;hit(officers,actor,attack);
 }ok(actor.dead,'Three actual '+role+' cycles can finish');}results.push({boss:'Officers',events:officerEvents});
// The King's body must not phase through the cover his new ward requires.
{const e=foe({finalKing:true,akStage:'fight1',phase:1,akState:'recover',akClock:10,akSeq:1,x:-430,z:-400,r:43});for(let i=0;i<100;i++)K.step(e,.05,{...p,x:-430,z:400});ok(e.z<=-258,'King stops his body before the real pillar');}
// Exact environmental geometry, including false positives that would make the ward trivial.
let king=foe({finalKing:true,akStage:'fight1',phase:1,akState:'strike',akKind:'line',akSeq:1,akDX:1,akDZ:0,x:-700,z:-170});
ok(K.environmentalCounter(king,[{...p,x:0,z:-170}]),'Actual beam blocked by left pillar');ok(!K.inAttack(king,{...p,x:0,z:-170}),'Same pillar truly prevents damage');
for(const player of [{...p,x:0,z:300},{...p,x:-500,z:-170},{...p,x:0,z:-170,downed:true},{...p,x:0,z:-170,busy:'bag'}])ok(!K.environmentalCounter({...king,akEnvSeq:null},[player]),'No counter for an uninvolved, downed or paused actor');
king={...king,akKind:'wave',x:0,z:0,akSeq:2};ok(K.environmentalCounter(king,[{...p,y:100,onGround:false}]),'Real wave cleared by airborne hero');ok(K.environmentalCounter({...king,akEnvSeq:null},[{...p,y:100,motion:{ground:false,vy:-30}}]),'Remote descending jump counts via synced motion');ok(!K.environmentalCounter({...king,akEnvSeq:null},[{...p,y:130,onGround:true}]),'Standing on raised ground cannot pretend to jump');
for(const phase of [1,2]){e=foe({finalKing:true,akBaseHP:1000,akSeq:0});K.startFight(e,phase);let counters=0,adds=0,summoned=false;const used=new Set();for(let n=0;n<12000&&!e.dead;n++){
 const pillar=K.pillars[0];let player={...p,x:e.x+(pillar.x-e.x)*1.5,z:e.z+(pillar.z-e.z)*1.5};
 if(e.akKind==='wave'&&['wind','strike'].includes(e.akState))player={...p,x:e.x+250,z:e.z,y:100,onGround:false};
 K.step(e,.05,player,{adds,summon(){adds=3;summoned=true;}});if(e.akState==='adds'){ok(T.damage({},e,p,1e8)===0,'Summoned guards cannot be skipped');adds=0;}
 if(K.environmentalCounter(e,[player]))counters++;
 if(e.akState==='recover'&&e.akEnvSeq===e.akSeq&&!used.has(e.akSeq)){used.add(e.akSeq);hit({},e);}
 }
 ok(e.dead&&counters>=3,'Actual King attack cycles finish phase '+phase);if(phase===2)ok(summoned,'Phase2 still summons guards');results.push({boss:'King',phase,counters,summoned});}
console.log(JSON.stringify({checks,results},null,2));
