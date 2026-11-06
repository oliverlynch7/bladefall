const assert=require('node:assert/strict'),F=require('../public/3d/enemy-facing.js'),King=require('../public/3d/final-king.js');
const fs=require('node:fs'),vm=require('node:vm'),ctx={window:{BFEnemyFacing:F},console};vm.runInNewContext(fs.readFileSync('public/3d/prison-combat.js','utf8'),ctx);const Prison=ctx.window.BFPrisonCombat;
const delta=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
let checks=0;function ok(v,msg){assert(v,msg);checks++;}
function tick(e,p,dt=.016,ai=()=>{}){const frame=F.begin(e,p,dt);ai();F.finish(e,dt,frame);return frame;}
for(const dt of [1/120,1/60,1/30,.05,.2])for(const props of [{role:'shielder'},{boss:true},{kind:'charger'},{kind:'fly'},{}]){const e={x:0,z:0,yaw:Math.PI-.02,...props};tick(e,{x:0,z:100},dt,()=>e.yaw=0);ok(delta(e.yaw,Math.PI-.02)<=F.rate(e)*Math.min(.05,dt)+1e-8,'no snap even when AI overwrites yaw');}
ok(delta(F.angle(Math.PI-.01,-Math.PI+.01,.016,1),Math.PI-.01)<.017,'wrap takes short arc');
const guard={x:0,z:0,yaw:0,role:'shielder',meleeW:.5,meleeSerial:1};
for(let i=0;i<30;i++)tick(guard,{x:0,z:-80},.016,()=>guard.yaw=Math.PI);
ok(delta(guard.yaw,0)<1e-8,'melee body and shield remain committed');ok(guard.shieldYaw===guard.yaw,'shield agrees with body');ok(!F.contact(guard,{x:0,z:-20}),'no ordinary melee contact behind');ok(F.contact(guard,{x:0,z:20}),'forward melee still works');
tick(guard,{x:0,z:-80},.016,()=>guard.meleeW=0);for(let i=0;i<35;i++)tick(guard,{x:0,z:-80});ok(delta(guard.yaw,0)<1e-8,'heavy recovery gives a real rear opening');for(let i=0;i<150;i++)tick(guard,{x:0,z:-80});ok(delta(guard.yaw,Math.PI)<.1,'guard eventually reacquires player');
const held={x:0,z:0,yaw:0,staggerT:1};tick(held,{x:0,z:-100},.05,()=>held.yaw=Math.PI);ok(held.yaw===0,'stagger cannot rotate');
for(const attack of [{meleeW:.5},{meleeActive:.1},{knightW:.6}]){
 const committed={x:0,z:0,yaw:0,role:'shielder',...attack};
 ok(!F.brace(committed)&&!F.bracing(committed),'a frontal block does not interrupt or overlap an existing attack');
}
const braced={x:0,z:0,yaw:0,role:'shielder'};
ok(F.brace(braced)&&F.bracing(braced),'a frontal block can start a shield brace');
for(let i=0;i<15;i++)tick(braced,{x:0,z:-100},.05,()=>braced.yaw=Math.PI);
ok(braced.yaw===0&&braced.shieldYaw===0,'body and shield stay planted late in the brace');
ok(!F.brace(braced),'blocking again does not refresh the brace');
for(let i=0;i<7;i++)tick(braced,{x:0,z:-100},.05);
ok(!F.bracing(braced)&&delta(braced.yaw,0)>.2,'shield bearer resumes bounded turning');
ok(!F.brace(braced),'the same opponent cannot immediately restart the brace');
for(let i=0;i<30;i++)tick(braced,{x:0,z:-100},.05);
ok(F.brace(braced),'another block can brace after cooldown');
for(const [flags,phase,x,z] of [[{finalKing:true,akState:'wind'},'ak',0,1],[{frostOfficer:'shield',offState:'strike'},'off',1,0],[{marbleGuardian:true,mcState:'wind'},'mc',-1,0],[{furnaceColossus:true,fcState:'strike'},'fc',0,-1],[{fallenDuel:true,fallState:'thrust'},'fall',1,0],[{ceKind:'guard',ceState:'wind'},'ce',0,1],[{prisonFoe:'prison_guard',pcState:'strike'},'pc',1,0]]){const yaw=Math.atan2(x,z),e={x:0,z:0,yaw,...flags,[phase+'DX']:x,[phase+'DZ']:z};for(let i=0;i<80;i++)tick(e,{x:-x*100,z:-z*100},.016,()=>e.yaw=yaw+Math.PI);ok(delta(e.yaw,yaw)<1e-8,'authored '+phase+' commitment survives target switch');}
const king={finalKing:true,boss:true,x:0,z:0,y:0,yaw:0,hp:100,maxHp:100,akStage:'fight1',akState:'recover',akClock:.01,akBeat:0,akSeq:0,phase:1},front={x:0,z:150,y:0,hp:100,r:16},rear={...front,z:-150};tick(king,front,.016,()=>King.step(king,.016,front));ok(king.akState==='wind','king begins its normal attack');for(let i=0;i<100&&king.akState!=='strike';i++)tick(king,rear,.016,()=>King.step(king,.016,rear));ok(king.akState==='strike','king completes windup');ok(King.inAttack(king,front),'committed sweep hits front');ok(!King.inAttack(king,rear),'king rear is safe from front sweep');ok(delta(king.yaw,0)<1e-8,'king visual sweep stays aligned');
const late={...king,akState:'recover',akClock:0,yaw:0};tick(late,rear,.016,()=>King.step(late,.016,rear));ok(late.akState==='approach','king waits to turn before new attack');
const normalRecovery={...king,akState:'recover',akClock:2.2,yaw:0,akEnvSeq:0};
const distantRear={...rear,z:-450};
for(let i=0;i<40;i++)tick(normalRecovery,distantRear,.05,()=>King.step(normalRecovery,.05,distantRear));
ok(normalRecovery.akState==='recover'&&normalRecovery.yaw===0&&normalRecovery.z===0,'normal King recovery holds body and position');
for(let i=0;i<10;i++)tick(normalRecovery,distantRear,.05,()=>King.step(normalRecovery,.05,distantRear));
ok(normalRecovery.akState==='approach'&&delta(normalRecovery.yaw,0)>.2&&normalRecovery.z===0,'King turns in place to find the player after normal recovery');
for(let i=0;i<15;i++)tick(normalRecovery,distantRear,.05,()=>King.step(normalRecovery,.05,distantRear));
ok(normalRecovery.z<0,'King advances when the player is back in front');
const summoningKing={...king,akStage:'fight2',phase:2,akState:'approach',akClock:0,akBeat:3,akSummoned:false};
let royalGuards=0;
const summonedTick=p=>tick(summoningKing,p,.05,()=>King.step(summoningKing,.05,p,{
 adds:royalGuards,summon:()=>royalGuards=2
}));
summonedTick(front);
ok(summoningKing.akState==='adds'&&royalGuards===2,'King starts the royal guard stance');
for(let i=0;i<32;i++)summonedTick(distantRear);
ok(summoningKing.akState==='adds'&&delta(summoningKing.yaw,0)<1e-8&&summoningKing.z===0,'royal guard stance holds heading and position');
royalGuards=0;
for(let i=0;i<35;i++)summonedTick(distantRear);
ok(summoningKing.akState==='recover'&&delta(summoningKing.yaw,0)<1e-8,'King stays planted through recovery after the guards fall');
for(let i=0;i<10;i++)summonedTick(distantRear);
ok(summoningKing.akState==='approach'&&delta(summoningKing.yaw,0)>.2&&summoningKing.z===0,'King pivots toward the player once the stance and recovery end');
for(let i=0;i<15;i++)summonedTick(distantRear);
ok(summoningKing.z<0,'King resumes forward pursuit after the stance');
const pg={type:'prison_guard',x:0,z:0,y:0,yaw:0,hp:100};Prison.setup(pg);pg.pcClock=0;for(let i=0;i<10;i++)tick(pg,rear,.016,()=>Prison.step(pg,.016,rear,0));ok(pg.pcState==='approach','prison guard cannot instantly bash behind itself');
for(const data of [{chargeT:1,cdx:1,cdz:0},{windT:1,teleX:1,teleZ:0},{cleaveW:1,cleaveX:1,cleaveZ:0},{shotW:1,shotAim:{x:100,z:0}},{marksmanCrossing:true,markState:'aim',markClock:.4,markX:100,markZ:0},{bruteOrchard:true,bruteState:'charge',teleX:1,teleZ:0}]){const e={x:0,z:0,yaw:Math.PI/2,...data};for(let i=0;i<40;i++)tick(e,{x:-100,z:0});ok(delta(e.yaw,Math.PI/2)<1e-8,'charge/projectile vectors stay committed');}
const mirrored={x:0,z:0,yaw:0,facingYaw:1.2,shieldYaw:1.2,role:'shielder'};ok(F.mirror(mirrored)&&mirrored.yaw===1.2&&mirrored.shieldYaw===1.2,'guest uses host facing');ok(!F.mirror({}),'legacy snapshots tolerated');
for(const props of [{kind:'charger'},{boss:true}]){
 const e={x:0,z:0,yaw:0,...props};
 ok(!F.contact(e,{x:0,z:-30})&&F.contact(e,{x:0,z:30}),'directional charge contact cannot hit behind');
}
const sideways={x:70,y:0,z:150,hp:100,r:16};
const angledKing={...king,akState:'recover',akClock:.01,akBeat:0,yaw:0};
tick(angledKing,sideways,.016,()=>King.step(angledKing,.016,sideways));
ok(angledKing.akState==='wind'&&delta(angledKing.yaw,Math.atan2(angledKing.akDX,angledKing.akDZ))<1e-8,'sweep aim agrees with the body on its first frame');
const start=angledKing.yaw;
for(let i=0;i<100&&angledKing.akState!=='strike';i++)tick(angledKing,rear,.016,()=>King.step(angledKing,.016,rear));
ok(delta(start,angledKing.yaw)<1e-8,'off-axis sweep stays fixed after the target crosses behind');
const hunting={x:0,z:0,yaw:0,boss:true};
tick(hunting,{x:100,z:0},.016,()=>{F.turn(hunting,100,0,.016);F.turn(hunting,100,0,.016);ok(Math.abs(hunting.yaw-F.rate(hunting)*.016)<1e-8,'AI helpers share the same turn allowance');});
const Officers=require('../public/3d/frost-officers.js'),Tactics=require('../public/3d/boss-tactics.js');
const officer={x:0,y:0,z:0,yaw:0,hp:1000,maxHp:1000,boss:true,frostOfficer:'shield',offState:'hunt',offClock:0,offSeq:0};
const cavern={enemies:[officer],arena:{surfaces:[]},speed:125};
const officerTick=p=>tick(officer,p,.05,()=>Officers.step(officer,.05,p,cavern));
officerTick(front);
ok(officer.offState==='wind','shield officer commits toward the approaching player');
for(let i=0;i<60&&officer.offState!=='recover';i++)officerTick(rear);
ok(officer.offState==='recover','shield attack reaches authored recovery');
ok(Tactics.damage(cavern,officer,front,10)===0,'front blocked at opening');
ok(Tactics.damage(cavern,officer,rear,10)===18,'rear hit damages recovering officer');
ok(Tactics.damage(cavern,officer,rear,5,'status')===9,'status from unlocked opening still ticks');
for(let i=0;i<32;i++)officerTick(rear);
ok(officer.offState==='recover'&&delta(officer.yaw,0)<1e-8,'shield stays planted late in recovery');
ok(Tactics.damage(cavern,officer,front,10)===0,'front stays blocked after a rear hit');
ok(Tactics.damage(cavern,officer,rear,10)===18,'rear remains open late in recovery');
for(let i=0;i<15;i++)officerTick(rear);
ok(officer.offState==='hunt'&&delta(officer.yaw,0)>.2,'shield reacquires the target while hunting');
for(const [guardRole,state,next] of [
 [{prisonFoe:'prison_guard'},'pcState','approach'],
 [{ceKind:'briar_guard',briarRole:'guard'},'ceState','hunt'],
 [{ceKind:'keep_lance',campaignRole:'guard'},'ceState','hunt']
]){
 const e={x:0,z:0,yaw:0,...guardRole,[state]:'recover'};
 for(let i=0;i<22;i++)tick(e,rear,.05);
 ok(delta(e.yaw,0)<1e-8,'guard keeps its direction throughout recovery');
 e[state]=next;tick(e,rear,.05);
 ok(delta(e.yaw,0)>.05,'guard turns again after recovery');
}
const exposed={...king,x:0,y:0,z:0,yaw:0,akKind:'line',akState:'strike',akClock:.01,akSeq:10,akEnvSeq:10,akEnvPhase:1};
const farRear={...rear,z:-550};
const exposedTick=()=>tick(exposed,farRear,.05,()=>King.step(exposed,.05,farRear));
exposedTick();
for(let i=0;i<75;i++)exposedTick();
ok(exposed.akState==='recover'&&exposed.z===0&&delta(exposed.yaw,0)<1e-8,'countered king stays planted for the long punish window');
ok(Tactics.rule({},exposed,farRear).factor===3,'counter still opens the royal ward');
for(let i=0;i<12&&exposed.akState==='recover';i++)exposedTick();
ok(exposed.akState==='approach'&&Tactics.rule({},exposed,farRear).factor===0,'ward closes before reacquisition');
exposedTick();
ok(exposed.z===0&&delta(exposed.yaw,0)>.05,'king pivots in place after the opening');
for(let i=0;i<17;i++)exposedTick();
ok(exposed.z<0,'king advances once he faces the player again');
for(let i=0;i<40&&exposed.akState==='approach';i++)exposedTick();
ok(exposed.akState==='wind','king eventually lines up and starts the next attack');
const planted={x:0,z:0,yaw:0,role:'shielder',meleeActive:.02,meleeSerial:1};
const recoveryFrame=tick(planted,rear,.02,()=>planted.meleeActive=0);
ok(recoveryFrame.busy&&F.guardPlanted(planted),'a finished shield swing begins a planted recovery');
for(let i=0;i<40;i++){
 const frame=tick(planted,rear,1/60);
 assert(frame.guardPlanted&&planted.yaw===0,'shield stays planted through the full recovery window');
}
ok(F.guardPlanted(planted),'shield recovery remains active just before expiry');
for(let i=0;i<20;i++)tick(planted,rear,1/60);
ok(!F.guardPlanted(planted)&&Math.abs(planted.yaw)>.2,'shield can pursue again after recovery');
const CampaignEncounters=require('../public/3d/campaign-encounters.js');
const battlefield={zone:2,area:0};
const leashGuard={role:'shielder',kind:'walk',x:0,y:0,z:240,yaw:0,encHome:{x:0,y:0,z:0},encLeash:200};
const outsideLeash={x:0,y:0,z:300,hp:100};
let retreatSteps=0;
const retreat=()=>CampaignEncounters.retreat(battlefield,leashGuard,[outsideLeash],.05,()=>retreatSteps++);
ok(F.brace(leashGuard)&&!retreat(),'a guard outside its leash finishes its brace before retreating');
for(let i=0;i<18;i++)tick(leashGuard,outsideLeash,.05);
ok(retreat()&&retreatSteps===1,'retreat resumes once the brace expires');
leashGuard.meleeW=.3;
ok(F.guardPlanted(leashGuard)&&!retreat()&&!leashGuard.encReturning&&retreatSteps===1,'even a guard already returning holds position through a swing');
const unshielded={x:0,z:0,yaw:0,meleeActive:.02,meleeSerial:1};
tick(unshielded,rear,.02,()=>unshielded.meleeActive=0);
ok(!F.guardPlanted(unshielded),'ordinary melee keeps its existing recovery movement');
const borderGuard={...leashGuard,role:null,ceKind:'keep_lance',campaignRole:'guard',ceState:'recover',
 ceClock:1.15,ceDX:0,ceDZ:1,meleeW:0,encReturning:true};
let borderMoves=0;
const borderRetreat=()=>CampaignEncounters.retreat(battlefield,borderGuard,[outsideLeash],.05,()=>borderMoves++);
ok(!borderRetreat()&&!borderGuard.encReturning&&borderMoves===0,'campaign guard finishes recovery even beyond its patrol leash');
borderGuard.ceState='hunt';
ok(borderRetreat()&&borderMoves===1,'campaign guard can return home after its recovery');
// Exercise the actual game warning geometry and projectile release together.
const main=fs.readFileSync('public/3d/index.html','utf8');
const rings=[],markers=[],projectiles=[];
const warningContext={
 BFEnemyFacing:F,G:{p:{r:16},projectiles},dangerRing:(...args)=>rings.push(args),
 bx:(x,y,z)=>markers.push({x,z}),SFX:{shoot:()=>{}},foeName:()=>'test archer',dXZ:(x,z,a,b)=>Math.hypot(a-x,b-z)
};
vm.runInNewContext(main.slice(main.indexOf('function drawEnemyDanger('),main.indexOf('function specBehavior(')),warningContext);
const melee={x:0,y:0,z:0,r:18,yaw:Math.PI/2,meleeReach:12,meleeW:.65};
warningContext.drawEnemyDanger(melee);
ok(rings.length===2&&rings[0][3]===46&&rings[0][6]===F.meleeArc&&rings[0][7]===1&&Math.abs(rings[0][8])<1e-8,'melee tell draws the committed forward arc and actual reach');
const caster={x:0,z:0,yaw:0,shot:{},meleeActive:.02,meleeSerial:1};
tick(caster,front,.05,()=>{
 caster.meleeActive=0;
 ok(!warningContext.bossShoot(caster,front)&&!caster.shotW,'caster cannot cast on its melee release frame');
});
for(let i=0;i<9;i++)tick(caster,front,.05,()=>{
 assert(!warningContext.bossShoot(caster,front),'caster waits out melee recovery');
});
tick(caster,front,.05,()=>{
 ok(warningContext.bossShoot(caster,front)&&caster.shotW===.7,'caster commits a fresh shot after recovery');
 ok(!F.canCommit(caster),'another attack cannot replace the warned shot');
});
const raider={x:0,z:0,yaw:0,boss:true,windT:.02,teleX:0,teleZ:1};
tick(raider,front,.05,()=>{
 raider.windT=0;raider.lunge=.45;
 ok(!F.canCommit(raider),'boss cannot replace a windup with another move on the release frame');
});
tick(raider,rear,.05,()=>raider.lunge=0);
ok(!F.canCommit(raider)&&raider.yaw===0,'boss waits after its lunge without tracking the flank');
for(let i=0;i<16;i++)tick(raider,rear,.05);
ok(F.canCommit(raider)&&delta(raider.yaw,0)>.05,'boss can turn and choose a new move after recovery');
const bow={x:0,y:0,z:0,r:15,h:40,dmg:10,shotW:.7,shotAim:{x:0,y:0,z:120,h:40,yaw:.4},shot:{count:3,spread:.2,speed:240}};
warningContext.drawEnemyDanger(bow);
warningContext.releaseEnemyShot(bow,bow.shotAim);
for(let i=0;i<projectiles.length;i++){
 const m=markers[i*7],p=projectiles[i];
 ok(delta(Math.atan2(m.x,m.z),Math.atan2(p.vx,p.vz))<1e-8,'each shot lane follows its first warning');
}
const knightArena={shockwaves:[],shake:0}, warnings=[];
let guest=false;
const knightContext={BFEnemyFacing:F,G:knightArena,MP:{guest:()=>guest},addText:(...args)=>warnings.push(args),playFx:()=>{}};
vm.runInNewContext(main.slice(main.indexOf('function releaseKnightCrush('),main.indexOf('function beamBlocked(')),knightContext);
const knight={x:10,y:20,z:30,h:46,yaw:0,dmg:16,spec:'knightslam',role:'shielder',type:'siegeknight',slamCd:0};
const crushStep=(e,d=40,planted=false)=>knightContext.specBehavior(e,.05,front,0,1,d,planted);
crushStep(knight,40,true);
ok(!knight.knightW,'a planted knight cannot begin a crush');
crushStep(knight);
ok(knight.knightW===.6&&knight.knightSerial===1,'host starts one crush warning');
const warningPacket={hostCrush:true,knightW:knight.knightW,knightSerial:knight.knightSerial,knightStrike:null};
for(let i=0;i<14;i++)crushStep(knight,200);
ok(knightArena.shockwaves.length===1&&knight.knightW===0,'host releases despite the target leaving the warning');
const strikePacket={...warningPacket,knightW:0,knightStrike:knight.knightStrike};
guest=true;
const replica={...knight,x:60,y:0,z:-50,slamCd:0,knightStrike:null};
for(let i=0;i<20;i++)crushStep(replica);
ok(!replica.knightW&&knightArena.shockwaves.length===1,'a guest cannot begin its own warning');
Object.assign(replica,warningPacket);
for(let i=0;i<14;i++)crushStep(replica);
ok(knightArena.shockwaves.length===1,'guest cannot release before the host confirms the strike');
for(let i=0;i<3;i++){Object.assign(replica,strikePacket);crushStep(replica);}
const [hostWave,guestWave]=knightArena.shockwaves;
ok(knightArena.shockwaves.length===2&&JSON.stringify(hostWave)===JSON.stringify(guestWave),'duplicate packets replay one wave at the host strike position');
const lateGuest={...knight,...strikePacket};
crushStep(lateGuest);
ok(knightArena.shockwaves.length===2,'a guest who missed the warning does not take an untelegraphed wave');
console.log(`Enemy facing: ${checks} checks passed (rates, wrap, locks, recovery, rear contact, authored boss directions, live King cycle, prison gate and guest mirror).`);
