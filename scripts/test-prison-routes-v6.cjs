const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function load(src){const c={window:{}};vm.createContext(c);vm.runInContext(src,c);return c.window.BFPrisonDungeon;}
const before=load(cp.execFileSync('git',['show','HEAD:public/3d/prison-dungeon.js'],{encoding:'utf8'})),after=load(fs.readFileSync('public/3d/prison-dungeon.js','utf8'));let tested=0;const shapes=new Set();
for(let seed=0;seed<150;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 for(let rev=1;rev<=5;rev++)assert.equal(JSON.stringify(before.layout(seed,section,tier,rev)),JSON.stringify(after.layout(seed,section,tier,rev)),'legacy geometry');
 const p=after.layout(seed,section,tier);assert.equal(p.rooms.length,10);assert.equal(JSON.stringify(p),JSON.stringify(after.layout(seed,section,tier)));
 const seen=new Set([0]);for(let i=0;i<10;i++)for(const [a,b]of p.links){const r=p.rooms[a],q=p.rooms[b];assert(Math.abs(r.x-q.x)+Math.abs(r.z-q.z)===900,'orthogonal adjacent link');if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);}assert.equal(seen.size,10);
 for(const r of p.rooms)for(const q of p.rooms)if(r.id<q.id)assert(Math.abs(r.x-q.x)>=(r.w+q.w)/2||Math.abs(r.z-q.z)>=(r.d+q.d)/2,'overlapping rooms');
 assert.equal(p.rooms.filter(r=>after.chestRarity(r,6)).length,2);
 for(const list of [p.walls,p.floors,p.plats,p.roofs,p.decor])for(const o of list)for(const k of ['x','z','w','d','h','y0'])assert(Number.isFinite(o[k]),k);
 for(const room of p.rooms.filter(r=>r.spawnPoints)){for(const mob of after.encounter(room,tier,0)){assert(!p.plats.some(o=>Math.abs(room.x+mob.x-o.x)<o.w/2+35&&Math.abs(room.z+mob.z-o.z)<o.d/2+35),'spawn in cover');}}
 const b=p.rooms[9];assert.equal(b.waypoints.length,7);assert(b.waypoints.every(v=>v.y<b.h-50));
 shapes.add(p.rooms.map(r=>r.x+','+r.z).join('|'));tested++;
}
console.log({tested,legacyPlans:tested*5,routeShapes:shapes.size});
