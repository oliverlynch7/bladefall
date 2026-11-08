const assert=require('node:assert/strict'),F=require('../public/3d/frost-officers.js');
const G={p:{},walls:[],deco:[],enemies:[]};F.build({G,seg(){},plat(){},col(){},spawn(type,x,z){const e={type,x,z,y:0,hp:1000,maxHp:1000,dmg:30};G.enemies.push(e);return e;}});
const target={x:0,z:100,y:0,hp:100,r:16},ctx={arena:G.frostOfficers,enemies:G.enemies,speed:125};let strikes=new Set();
for(let i=0;i<16000;i++){for(const e of G.enemies){F.step(e,.016,target,ctx);if(e.offState==='strike')strikes.add(e.frostOfficer);}assert(G.enemies.filter(F.busy).length<=1,'shared major attack cap');}
assert.equal(strikes.size,3,'each role gets turns');
for(const role of ['caster','shield','spear']){const e=G.enemies.find(e=>e.frostOfficer===role);Object.assign(e,{offState:'wind',offClock:.5,offX:0,offZ:0,offY:0,offDX:0,offDZ:1,offRange:400,offTravel:400,offAttack:0,offTwin:false});assert(!F.inAttack(e,target),'no warning damage');const old=[e.offX,e.offZ,e.offDX,e.offDZ];F.step(e,.016,{...target,x:200},ctx);assert.deepEqual([e.offX,e.offZ,e.offDX,e.offDZ],old,'locked attack');Object.assign(e,{offState:'strike',offClock:role==='shield'?.7:.2,offAttack:.2});assert(F.inAttack(e,target),role+' active hit');assert(!F.inAttack(e,{...target,y:200}),'height dodge');e.dead=true;assert(!F.inAttack(e,target),'death cancels hit');e.dead=false;e.offState='recover';e.offClock=2;}
// Survivor-pattern fixture begins facing its target rather than assuming an instant about-face.
const shield=G.enemies.find(e=>e.frostOfficer==='shield');shield.dead=true;const c=G.enemies[0];Object.assign(c,{x:0,z:200,y:0,yaw:Math.PI,offState:'hunt',offClock:0});F.step(c,.016,target,ctx);assert(c.offTwin,'caster changes pattern when shield falls');assert.equal(F.snapshot(c).offTwin,true);assert.equal(G.enemies.length,3);
console.log('Officers passed: all three roles, single major attack cap across 256 seconds, locked warnings, no early hits, height dodges, death cancellation and survivor tactic.');
for(const target of [{x:-600,z:-300,y:100,hp:100},{x:600,z:-350,y:180,hp:100},{x:0,z:-740,y:160,hp:100}]){for(const e of G.enemies)Object.assign(e,{x:0,z:500,y:0,dead:false,offState:'hunt',offClock:0,_offRoute:null,offTurn:0});for(let i=0;i<18000;i++)for(const e of G.enemies)F.step(e,.016,target,ctx);assert(G.enemies.every(e=>e.offTurn>0),'all roles pursue shelf '+JSON.stringify({target,enemies:G.enemies.map(e=>({role:e.frostOfficer,x:e.x,z:e.z,y:e.y,turn:e.offTurn}))}));}
console.log('All three officers pursue players onto both shelves and the high northern exit.');

const RampFacing=require('../public/3d/enemy-facing.js');
const rampGuard={x:0,z:0,y:0,yaw:0,hp:100,frostOfficer:'shield',offState:'hunt',offClock:5};
const rampTarget={x:0,z:320,y:100,hp:100};
const ramp={arena:{nodes:[[0,0,0],[220,0,0],[220,320,100],[0,320,100]],edges:[[1],[0,2],[1,3],[2]],surfaces:[]},enemies:[rampGuard],speed:125};
for(let i=0;i<100;i++){
 const dt=1/60,{x,z}=rampGuard;
 const frame=RampFacing.begin(rampGuard,null,dt);
 F.step(rampGuard,dt,rampTarget,ramp);
 RampFacing.finish(rampGuard,dt,frame);
 const dx=rampGuard.x-x,dz=rampGuard.z-z,step=Math.hypot(dx,dz);
 if(i<24)assert.equal(step,0,'the Shield Officer plants before walking toward a side ramp');
 if(step>0)assert(RampFacing.aligned(rampGuard,{x:rampGuard.x+dx,z:rampGuard.z+dz},.26+1e-6),'each ramp step follows the shield heading');
}
assert(rampGuard.x>50,'the Shield Officer pursues after turning toward the ramp');
console.log('Shield Officer turns in place before walking onto a ramp.');
