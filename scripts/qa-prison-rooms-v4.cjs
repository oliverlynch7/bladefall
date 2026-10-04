const assert=require('assert'),vm=require('vm'),cp=require('child_process');global.window={};require('../public/3d/prison-dungeon.js');const D=window.BFPrisonDungeon;
const old={window:{}};vm.createContext(old);vm.runInContext(cp.execFileSync('git',['show','989d6ad:public/3d/prison-dungeon.js'],{encoding:'utf8'}),old);
for(let seed=0;seed<60;seed++)for(let section=1;section<=3;section++){
 for(const revision of [1,2,3])assert.equal(JSON.stringify(D.layout(seed,section,2,revision)),JSON.stringify(old.window.BFPrisonDungeon.layout(seed,section,2,revision)));
 for(let tier=1;tier<=3;tier++){
 const p=D.layout(seed,section,tier);for(const id of [1,3,5,6])for(const wave of [0,1])for(const e of D.encounter(p.rooms[id],tier,wave)){
 const r=p.rooms[id],x=r.x+e.x,z=r.z+e.z;assert(!p.plats.some(o=>Math.abs(x-o.x)<o.w/2+24&&Math.abs(z-o.z)<o.d/2+24),'Blocked spawn '+[seed,section,id,e.x,e.z]);
 assert(p.floors.some(o=>Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2),'Spawn in pit');
 }
 }
}
console.log('540 legacy plans identical; 540 new layouts have safe encounter spawns across tiers/waves.');
