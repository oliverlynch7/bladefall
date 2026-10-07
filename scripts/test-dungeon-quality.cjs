const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
function load(source){const context={window:{}};vm.createContext(context);vm.runInContext(source,context);return context.window.BFPrisonDungeon;}
const D=load(fs.readFileSync('public/3d/prison-dungeon.js','utf8'));
// Snapshot of revision 1–6 plans from the shipped 2.132.0 build. This stays
// meaningful after the new source has been committed and HEAD has changed.
const legacyHash='e6698a6c615f2f9ab32f9a0ff8fbc4d90105c229b1184f4bff9d5ab1e3185a72';
const legacy=crypto.createHash('sha256'),templates=new Set();let plans=0,spawns=0;
for(let seed=0;seed<120;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 for(let rev=1;rev<=6;rev++)legacy.update(JSON.stringify(D.layout(seed,section,tier,rev))+'\n');
 const p=D.layout(seed,section,tier,7);assert.equal(p.rooms.length,10);
 assert.equal(JSON.stringify(p),JSON.stringify(D.layout(seed,section,tier,7)),'non-deterministic floor');
 const seen=new Set([0]);for(let i=0;i<10;i++)for(const [a,b] of p.links){if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);const x=p.rooms[a],y=p.rooms[b];assert.equal(Math.abs(x.x-y.x)+Math.abs(x.z-y.z),900,'unreachable doorway');}assert.equal(seen.size,10);
 assert.equal(p.rooms.filter(r=>D.chestRarity(r,7)).length,2,'chest economy changed');
 for(const r of p.rooms){if(r.template)templates.add(r.template);if(!r.spawnPoints)continue;for(const wave of [0,1])for(const e of D.encounter(r,tier,wave)){
  const x=r.x+e.x,z=r.z+e.z;assert(Math.abs(x-r.x)<r.w/2-30&&Math.abs(z-r.z)<r.d/2-30,'spawn beyond room');
  assert(!p.plats.some(o=>Math.abs(x-o.x)<o.w/2+35&&Math.abs(z-o.z)<o.d/2+35),'spawn inside cover');spawns++;
 }}
 for(const bridge of p.rooms.filter(r=>r.kind==='bridge')){assert(bridge.waypoints.length>=5);assert(bridge.waypoints.every(v=>v.y<bridge.h-50));}
 plans++;
}
assert.equal(legacy.digest('hex'),legacyHash,'legacy checkpoint geometry changed');
for(const t of ['refectory','liftbay','armory','cistern','watchpost','infirmary'])assert(templates.has(t),`missing ${t}`);
console.log({plans,legacyPlans:plans*6,templates:[...templates].sort(),safeSpawns:spawns});
