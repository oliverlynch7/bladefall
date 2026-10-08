const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
function load(src){const c={window:{}};vm.createContext(c);vm.runInContext(src,c);return c.window.BFPrisonDungeon;}
const current=load(fs.readFileSync('public/3d/prison-dungeon.js','utf8'));
const legacyHash=crypto.createHash('sha256');let plans=0,sockets=0,spawns=0;
for(let seed=0;seed<120;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 for(let rev=1;rev<=9;rev++)legacyHash.update(JSON.stringify(current.layout(seed,section,tier,rev))+'\n');
 const p=current.layout(seed,section,tier,10),ward=p.rooms[11],hold=p.rooms[13];
 assert.equal(JSON.stringify(p),JSON.stringify(current.layout(seed,section,tier,10)),'nondeterministic layout');
 assert.equal(p.rooms.length,16);assert.equal(ward.mechanic,'wards');assert.equal(hold.mechanic,'hold');assert.equal(hold.holdSeconds,18);
 assert.equal(p.rooms.filter(r=>current.chestRarity(r,10)).length,2);
 for(const [dx,dz] of ward.wardSockets){
  assert(Math.abs(dx)<ward.w/2-45&&Math.abs(dz)<ward.d/2-45,'ward outside room');
  assert(!p.plats.some(o=>Math.abs(ward.x+dx-o.x)<o.w/2+18&&Math.abs(ward.z+dz-o.z)<o.d/2+18),'ward in cover');sockets++;
 }
 for(const room of [ward,hold])for(let wave=0;wave<3;wave++)for(const mob of current.encounter(room,tier,wave)){
  assert(!p.plats.some(o=>Math.abs(room.x+mob.x-o.x)<o.w/2+35&&Math.abs(room.z+mob.z-o.z)<o.d/2+35),'enemy in cover');spawns++;
 }
 plans++;
}
assert.equal(legacyHash.digest('hex'),'c379aa7a80d8e21461c459a3602e5fb3f887da25f987517e3b1d7776bc8b0e3e','a saved layout revision changed');
console.log({plans,oldLayoutsUnchanged:plans*9,sockets,spawns});
