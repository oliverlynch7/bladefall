const assert=require('node:assert/strict'),F=require('../public/3d/enemy-facing.js'),King=require('../public/3d/final-king.js');
const fs=require('node:fs'),vm=require('node:vm'),ctx={window:{BFEnemyFacing:F},console};vm.runInNewContext(fs.readFileSync('public/3d/prison-combat.js','utf8'),ctx);const Prison=ctx.window.BFPrisonCombat;
const delta=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
let checks=0;function ok(v,msg){assert(v,msg);checks++;}
function tick(e,p,dt=.016,ai=()=>{}){const frame=F.begin(e,p,dt);ai();F.finish(e,dt,frame);}
for(const dt of [1/120,1/60,1/30,.05,.2])for(const props of [{role:'shielder'},{boss:true},{kind:'charger'},{kind:'fly'},{}]){const e={x:0,z:0,yaw:Math.PI-.02,...props};tick(e,{x:0,z:100},dt,()=>e.yaw=0);ok(delta(e.yaw,Math.PI-.02)<=F.rate(e)*Math.min(.05,dt)+1e-8,'no snap even when AI overwrites yaw');}
ok(delta(F.angle(Math.PI-.01,-Math.PI+.01,.016,1),Math.PI-.01)<.017,'wrap takes short arc');
const guard={x:0,z:0,yaw:0,role:'shielder',meleeW:.5,meleeSerial:1};
for(let i=0;i<30;i++)tick(guard,{x:0,z:-80},.016,()=>guard.yaw=Math.PI);
ok(delta(guard.yaw,0)<1e-8,'melee body and shield remain committed');ok(guard.shieldYaw===guard.yaw,'shield agrees with body');ok(!F.contact(guard,{x:0,z:-20}),'no ordinary melee contact behind');ok(F.contact(guard,{x:0,z:20}),'forward melee still works');
tick(guard,{x:0,z:-80},.016,()=>guard.meleeW=0);for(let i=0;i<35;i++)tick(guard,{x:0,z:-80});ok(delta(guard.yaw,0)<1e-8,'heavy recovery gives a real rear opening');for(let i=0;i<150;i++)tick(guard,{x:0,z:-80});ok(delta(guard.yaw,Math.PI)<.1,'guard eventually reacquires player');
const held={x:0,z:0,yaw:0,staggerT:1};tick(held,{x:0,z:-100},.05,()=>held.yaw=Math.PI);ok(held.yaw===0,'stagger cannot rotate');
for(const [flags,phase,x,z] of [[{finalKing:true,akState:'wind'},'ak',0,1],[{frostOfficer:'shield',offState:'strike'},'off',1,0],[{marbleGuardian:true,mcState:'wind'},'mc',-1,0],[{furnaceColossus:true,fcState:'strike'},'fc',0,-1],[{fallenDuel:true,fallState:'thrust'},'fall',1,0],[{ceKind:'guard',ceState:'wind'},'ce',0,1],[{prisonFoe:'prison_guard',pcState:'strike'},'pc',1,0]]){const yaw=Math.atan2(x,z),e={x:0,z:0,yaw,...flags,[phase+'DX']:x,[phase+'DZ']:z};for(let i=0;i<80;i++)tick(e,{x:-x*100,z:-z*100},.016,()=>e.yaw=yaw+Math.PI);ok(delta(e.yaw,yaw)<1e-8,'authored '+phase+' commitment survives target switch');}
const king={finalKing:true,boss:true,x:0,z:0,y:0,yaw:0,hp:100,maxHp:100,akStage:'fight1',akState:'recover',akClock:.01,akBeat:0,akSeq:0,phase:1},front={x:0,z:150,y:0,hp:100,r:16},rear={...front,z:-150};tick(king,front,.016,()=>King.step(king,.016,front));ok(king.akState==='wind','king begins its normal attack');for(let i=0;i<100&&king.akState!=='strike';i++)tick(king,rear,.016,()=>King.step(king,.016,rear));ok(king.akState==='strike','king completes windup');ok(King.inAttack(king,front),'committed sweep hits front');ok(!King.inAttack(king,rear),'king rear is safe from front sweep');ok(delta(king.yaw,0)<1e-8,'king visual sweep stays aligned');
const late={...king,akState:'recover',akClock:0,yaw:0};tick(late,rear,.016,()=>King.step(late,.016,rear));ok(late.akState==='recover','king waits to turn before new attack');
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
console.log(`Enemy facing: ${checks} checks passed (rates, wrap, locks, recovery, rear contact, authored boss directions, live King cycle, prison gate and guest mirror).`);
