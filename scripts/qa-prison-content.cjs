const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/3d/prison-dungeon.js','utf8'),ctx);const D=ctx.window.BFPrisonDungeon;
for(let seed=0;seed<100;seed++)for(let floor=1;floor<=3;floor++){
 const a=D.layout(seed,floor,1);assert.equal(JSON.stringify(a),JSON.stringify(D.layout(seed,floor,1)));assert.equal(a.rooms.length,6);
 const seen=new Set([0]);for(let i=0;i<6;i++)for(const [x,y]of a.links){if(seen.has(x))seen.add(y);if(seen.has(y))seen.add(x);}assert.equal(seen.size,6);
 assert(a.roofs.length>=a.rooms.length);assert(a.plats.filter(o=>o.room===2).length===3);
}
const p=D.profile();assert(!D.buy(p,'reaper'));D.credit(p,'a',500);assert(!D.credit(p,'a',500));assert.equal(p.gold,500);assert(D.buy(p,'health'));assert.equal(p.upgrades.health,1);assert.equal(p.gold,440);
for(let i=0;i<8;i++)D.credit(p,'elite'+i,0,'elites');assert(D.buy(p,'berserker'));assert(p.classes.includes('berserker'));assert(!D.buy(p,'berserker'));
assert.equal(D.profile({tier:99,upgrades:{armor:99}}).upgrades.armor,10);assert.equal(D.profile({tier:99}).tier,3);
console.log('300 deterministic connected layouts; economy, class qualification, duplicate receipts and caps passed.');
const legacy=D.profile({gold:123,tier:2,classes:['ninja']});const book=D.saves(null,legacy);assert.equal(book.slots.length,3);assert.equal(book.slots[0].gold,123);assert.equal(book.slots[1],null);book.slots[0]=null;assert.equal(D.saves(book,legacy).slots[0],null);assert.equal(D.saves({version:1,active:90,slots:[null,null,null]}).active,0);
assert.equal(D.profile({gold:99,checkpoint:{version:1,p:{}}}).gold,99);assert.equal(D.profile({gold:99,checkpoint:{version:1,p:{}}}).checkpoint,null);assert.equal(D.profile(null).gold,0);
console.log('Save migration, empty-slot tombstones and malformed checkpoint fallback passed.');
