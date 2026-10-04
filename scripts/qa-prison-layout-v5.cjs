const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function load(src){const ctx={window:{}};vm.createContext(ctx);vm.runInContext(src,ctx);return ctx.window.BFPrisonDungeon;}
const before=load(cp.execFileSync('git',['show','HEAD:public/3d/prison-dungeon.js'],{encoding:'utf8'})),after=load(fs.readFileSync('public/3d/prison-dungeon.js','utf8'));
for(let seed=0;seed<100;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 for(let rev=1;rev<=4;rev++)assert.equal(JSON.stringify(before.layout(seed,section,tier,rev)),JSON.stringify(after.layout(seed,section,tier,rev)),'legacy layout');
 const p=after.layout(seed,section,tier,5);assert.equal(p.rooms.length,9);const visited=new Set([0]);for(let k=0;k<9;k++)for(const [a,b]of p.links){if(visited.has(a))visited.add(b);if(visited.has(b))visited.add(a);}assert.equal(visited.size,9);
 for(const array of [p.walls,p.floors,p.plats,p.roofs,p.decor])for(const o of array)for(const key of ['x','z','w','d','h','y0'])assert(Number.isFinite(o[key]),key);
}
console.log('900 new floor plans connected and finite; all 3600 legacy plans exactly unchanged.');
