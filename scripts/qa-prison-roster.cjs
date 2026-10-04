const fs=require('fs'),vm=require('vm'),assert=require('assert');const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/3d/prison-combat.js','utf8'),ctx);const C=ctx.window.BFPrisonCombat;
for(const type of Object.keys(C.roster)){
 const e={type,x:0,y:0,z:0,hp:100,maxHp:100};C.setup(e);const p={x:0,y:0,z:80,hp:100,r:12};C.step(e,.6,p,60,true);assert.equal(e.pcState,'wind');const locked=[e.pcDX,e.pcDZ,e.pcX,e.pcZ];p.x=120;for(let i=0;i<20;i++)C.step(e,.02,p,60,true);assert.deepEqual([e.pcDX,e.pcDZ,e.pcX,e.pcZ],locked);assert.equal(e.pcState,'wind');assert(!C.contains(e,p));
 for(let i=0;i<100;i++)C.step(e,.02,p,60,true);assert(['recover','approach','wind'].includes(e.pcState));
 e.hp=40;let moves=new Set();for(let i=0;i<1500;i++){C.step(e,.02,{...p,x:e.x,z:e.z+80},60,true);moves.add(e.pcMove);}if(C.roster[type].boss)assert(moves.size>=2);
 const keys=C.snapshot(e);assert.equal(keys.prisonFoe,type);
 for(const state of ['approach','wind','strike','recover']){e.pcState=state;e.pcClock=.2;let depth=0,n=0;const check=(...v)=>{for(const q of v)if(typeof q==='number')assert(Number.isFinite(q));};C.draw(e,2,{push:()=>depth++,pop:()=>depth--,mv:check,rx:check,ry:check,rz:check,scale:check,bx:(...v)=>{check(...v);n++;}});assert.equal(depth,0);assert(n>0);}
}
const e={pcState:'strike',pcX:0,pcY:0,pcZ:0,pcDX:0,pcDZ:1,x:0,z:0,r:20},p={x:0,y:0,z:100,hp:100,r:12};e.pcMove='thrust';assert(C.contains(e,p));assert(!C.contains(e,{...p,x:80}));assert(!C.contains(e,{...p,z:-50}));e.pcMove='toll';assert(!C.contains(e,{...p,z:0}));assert(C.contains(e,p));e.pcMove='cross';assert(C.contains(e,p));assert(!C.contains(e,{...p,x:100}));assert(!C.contains(e,{...p,y:90}));
console.log('All original foes: committed tells, recovery, boss move variation, finite articulated poses, snapshots and attack hit geometry passed.');

const guard={prisonFoe:'prison_guard',x:0,z:0,yaw:0,pcState:'wind'};assert.equal(C.guardDamage(guard,{x:0,z:100},100),40);assert.equal(C.guardDamage(guard,{x:100,z:0},100),100);guard.pcState='recover';assert.equal(C.guardDamage(guard,{x:0,z:100},100),100);
