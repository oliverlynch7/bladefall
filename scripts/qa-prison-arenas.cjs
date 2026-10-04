const fs=require('fs'),vm=require('vm'),assert=require('assert');global.window={};require('../public/3d/prison-dungeon.js');const D=window.BFPrisonDungeon;
const legacy={window:{}};vm.createContext(legacy);vm.runInContext(require('child_process').execFileSync('git',['show','3226f25:public/3d/prison-dungeon.js'],{encoding:'utf8'}),legacy);
for(const revision of [1,2])for(const section of [1,2,3])assert.equal(JSON.stringify(D.layout(31,section,1,revision)),JSON.stringify(legacy.window.BFPrisonDungeon.layout(31,section,1,revision)));
for(let seed=0;seed<30;seed++)for(let section=1;section<=3;section++){
 const p=D.layout(seed,section,1),r=p.rooms[4],solid=p.plats.filter(o=>o.room===4);
 assert.equal(r.arena,['shelter','charge','steps'][section-1]);
 for(const point of [{x:r.x,z:r.z-70},{x:r.x,z:r.z+190},p.exit,{x:r.x+70,z:r.z+180}])assert(!solid.some(o=>Math.abs(point.x-o.x)<o.w/2+15&&Math.abs(point.z-o.z)<o.d/2+15),'Spawn/exit/reward overlaps solid');
 if(section>1)assert(solid.every(o=>o.h<=36),'No invulnerable high perch');
}
console.log('Legacy geometry identical; 90 arenas keep spawns, exits, rewards clear and terraces in attack reach.');
