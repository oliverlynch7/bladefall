const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('public/3d/prison-dungeon.js','utf8'),context);const D=context.window.BFPrisonDungeon;
const oldHash='d7dd34e9dc7cdad21f2eb34bcea534db3f76b8c76883eb4217b15b8bd138be38',old=crypto.createHash('sha256');let plans=0;
for(let seed=0;seed<120;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 old.update(JSON.stringify(D.layout(seed,section,tier,7))+'\n');
 const p=D.layout(seed,section,tier,8),q=p.rooms[10];assert.equal(p.rooms.length,11);assert(q.optional&&q.kind==='cache');assert.equal(JSON.stringify(p),JSON.stringify(D.layout(seed,section,tier,8)));
 const seen=new Set([0]);for(let i=0;i<11;i++)for(const [a,b] of p.links){if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);const x=p.rooms[a],y=p.rooms[b];assert.equal(Math.abs(x.x-y.x)+Math.abs(x.z-y.z),900);}assert.equal(seen.size,11);
 for(const x of p.rooms)for(const y of p.rooms)if(x.id<y.id)assert(Math.abs(x.x-y.x)>=(x.w+y.w)/2||Math.abs(x.z-y.z)>=(x.d+y.d)/2,'overlapping rooms');
 assert.equal(q.waypoints.length,7);assert.equal(p.plats.filter(v=>v.room===10).length,5);assert(Math.hypot(q.cacheGoal.x-q.waypoints[6].x,q.cacheGoal.z-q.waypoints[6].z)<15);
 assert(q.waypoints.every(v=>v.y<q.h-50));assert.equal(p.rooms.filter(r=>D.chestRarity(r,8)).length,2);
 plans++;
}
assert.equal(old.digest('hex'),oldHash,'revision-7 checkpoint geometry changed');console.log({newPlans:plans,oldRevision7Preserved:true,optionalRafterRoom:true});
