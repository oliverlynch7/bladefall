const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function load(src){const c={window:{}};vm.createContext(c);vm.runInContext(src,c);return c.window.BFPrisonDungeon;}
const current=load(fs.readFileSync('public/3d/prison-dungeon.js','utf8'));
const prior=load(cp.execFileSync('git',['show','HEAD:public/3d/prison-dungeon.js'],{encoding:'utf8'}));
const campaign=new Set(['revenant','sentinel','bones','caster','dustjackal','frostlobber','frostshell','magmaskit','blinkstalker','sunpriest','royalarcanist','siegeknight']);
let plans=0,spawns=0,campaignSpawns=0;const wingShapes=new Set();
for(let seed=0;seed<120;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 for(let rev=1;rev<=8;rev++)assert.equal(JSON.stringify(current.layout(seed,section,tier,rev)),JSON.stringify(prior.layout(seed,section,tier,rev)),`revision ${rev} changed`);
 const p=current.layout(seed,section,tier,9);
 assert.equal(JSON.stringify(p),JSON.stringify(current.layout(seed,section,tier,9)),'nondeterministic plan');
 assert.equal(p.rooms.length,16);
 wingShapes.add(`${section}:${p.rooms[11].x-p.rooms[8].x},${p.rooms[11].z-p.rooms[8].z}`);
 assert.equal(p.rooms.filter(r=>current.chestRarity(r,9)).length,2);
 assert.deepEqual([...p.mainRoute],[1,3,7,8,11,13,4]);
 const seen=new Set([0]);for(let i=0;i<p.rooms.length;i++)for(const [a,b]of p.links){const r=p.rooms[a],q=p.rooms[b];assert.equal(Math.abs(r.x-q.x)+Math.abs(r.z-q.z),900,'bad link');if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);}
 assert.equal(seen.size,16,'disconnected room');
 for(const r of p.rooms)for(const q of p.rooms)if(r.id<q.id)assert(Math.abs(r.x-q.x)>=(r.w+q.w)/2||Math.abs(r.z-q.z)>=(r.d+q.d)/2,`room overlap ${r.id}/${q.id}`);
 for(const id of [2,9,12]){const b=p.rooms[id];assert.equal(b.waypoints.length,id===12?9:id===9?7:5);assert(b.waypoints.every(v=>v.y<b.h-50));}
 assert.equal(p.rooms[15].waypoints.length,9);
 for(const list of [p.walls,p.floors,p.plats,p.roofs,p.decor])for(const o of list)for(const k of ['x','z','w','d','h','y0'])assert(Number.isFinite(o[k]),k);
 for(const room of p.rooms.filter(r=>r.spawnPoints))for(let wave=0;wave<2;wave++)for(const mob of current.encounter(room,tier,wave)){
  assert(!p.plats.some(o=>Math.abs(room.x+mob.x-o.x)<o.w/2+35&&Math.abs(room.z+mob.z-o.z)<o.d/2+35),`spawn in cover ${room.id}`);
  assert(Math.abs(mob.x)<room.w/2-25&&Math.abs(mob.z)<room.d/2-25,'spawn outside room');
  spawns++;if(campaign.has(mob.type))campaignSpawns++;
 }
 plans++;
}
assert(campaignSpawns>spawns*.25,'campaign enemies insufficiently represented');
assert(wingShapes.size>=6,'missing section route variants');
console.log({plans,oldLayoutsUnchanged:plans*8,wingShapes:wingShapes.size,spawns,campaignSpawns,campaignShare:+(campaignSpawns/spawns).toFixed(2)});
