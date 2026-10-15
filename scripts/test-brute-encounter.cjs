const assert=require('node:assert/strict'),{step,snapshot}=require('../public/3d/brute-encounter.js');
let calls=[],target={x:0,z:500};const env={props:[],speed:90,tell:t=>calls.push(t),impact:p=>calls.push('impact'),slam:()=>calls.push('slam'),handlers:n=>calls.push('wave'+n)};
const make=()=>({x:0,z:0,y:0,r:30,hp:100,maxHp:100,bruteOrchard:true});
let e=make();for(let i=0;i<29;i++)step(e,.05,target,env);assert.equal(e.bruteState,'wind');assert(e.lunge===0);
for(let i=0;i<15;i++)step(e,.05,target,env);const locked=[e.teleX,e.teleZ];target={x:500,z:0};step(e,.05,target,env);assert.deepEqual([e.teleX,e.teleZ],locked,'last .45s locks direction');
while(e.bruteState==='wind')step(e,.05,target,env);env.props=[{x:e.x,z:e.z+80,w:140,d:40}];while(e.bruteState==='charge')step(e,.05,target,env);assert.equal(e.bruteState,'stagger');assert.equal(e.staggerT,3);assert.equal(e.lunge,0);assert.equal(calls.filter(x=>x==='impact').length,1);
for(let i=0;i<59;i++)step(e,.05,target,env);assert(e.staggerT>0);for(let i=0;i<3;i++)step(e,.05,target,env);assert.equal(e.bruteState,'hunt');
e=make();e.hp=20;env.props=[];target={x:0,z:500};for(let i=0;i<400;i++)step(e,.05,target,env);assert.deepEqual(calls.filter(x=>x.startsWith('wave')),['wave1','wave2'],'two finite waves even if both thresholds crossed together');
e=make();Object.assign(e,{bruteState:'hunt',bruteClock:0,bruteTurns:2,bruteWaves:0});target={x:0,z:100};step(e,.05,target,env);assert.equal(e.bruteState,'slam');assert(!calls.includes('slam'));for(let i=0;i<20;i++)step(e,.05,target,env);assert.equal(calls.filter(x=>x==='slam').length,1);
const copy=snapshot(e);assert.equal(copy.bruteState,'recover');assert.equal(copy.bruteOrchard,true);e.dead=true;const prior=JSON.stringify(e);step(e,.05,target,env);assert.equal(JSON.stringify(e),prior);
console.log('Brute: locked aim, warning safety, impact, 3s stagger, finite waves, slam, snapshot and death checks passed');

const {chargePreview,cue,retryAdvice}=require('../public/3d/brute-encounter.js');
let previews=0;
for(const angle of [0,.3,.8,1.6,2.6,3.8,5.2])for(const fps of [20,30,60,120]){
 const q=Object.assign(make(),{r:44,teleX:Math.sin(angle),teleZ:Math.cos(angle),bruteState:'charge',bruteClock:1.05,lunge:1.05,bruteWaves:0});
 const obstacle={id:'cart',x:q.teleX*330,z:q.teleZ*330,w:150,d:80};
 const props=[{...obstacle,id:'far',x:q.teleX*550,z:q.teleZ*550},obstacle];
 const preview=chargePreview(q,props);assert.equal(preview.width,88);assert.equal(preview.hit,'cart','nearest collision, not array order');
 const local={...env,props,impact(){}};
 for(let n=0;n<200&&q.bruteState==='charge';n++)step(q,1/fps,{x:0,z:600},local);
 assert.equal(q.bruteState,'stagger');assert(Math.abs(Math.hypot(q.x,q.z)-preview.distance)<=15,'preview matches swept collision to one substep');previews++;
}
assert.equal(chargePreview({...make(),teleX:0,teleZ:1}).distance,651);
assert.equal(chargePreview({...make(),teleX:0,teleZ:1},[{id:'behind',x:0,z:-300,w:100,d:100}]).hit,null);
const active={...make(),active:true,bruteState:'wind',windT:.3};
assert(cue(active,{dodge:'F'}).text.includes('F sideways'));assert.equal(cue({...active,active:false}),null);assert.equal(cue({...active,dead:true}),null);
assert.equal(cue({...active,bruteState:'stagger'}).safe,true);assert.equal(cue({...active,bruteState:'recover'}).safe,true);
assert(cue({...active,bruteState:'slam'},{jump:'RB'}).text.includes('RB'));
assert.match(retryAdvice('a ground wave'),/Jump/);assert.match(retryAdvice('a crushing lunge'),/sideways/);
console.log(`${previews} swept-preview/frame-rate checks plus remapped cue/death advice checks passed.`);
