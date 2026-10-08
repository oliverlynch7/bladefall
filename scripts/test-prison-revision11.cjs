const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('public/3d/prison-dungeon.js','utf8'),context);
const D=context.window.BFPrisonDungeon,legacy=crypto.createHash('sha256');let plans=0,gates=0;
for(let seed=0;seed<120;seed++)for(let section=1;section<=3;section++)for(let tier=1;tier<=3;tier++){
 for(let rev=1;rev<=10;rev++)legacy.update(JSON.stringify(D.layout(seed,section,tier,rev))+'\n');
 const p=D.layout(seed,section,tier,11);assert.equal(p.barriers.length,6);
 assert.equal(JSON.stringify(p),JSON.stringify(D.layout(seed,section,tier,11)),'layout is not deterministic');
 for(const g of p.barriers){
  const a=p.rooms[g.from],b=p.rooms[g.to],alongX=Math.abs(a.x-b.x)>10;
  assert(p.links.some(l=>l.includes(g.from)&&l.includes(g.to)),'gate lacks route link');
  assert.equal(g.x,(a.x+b.x)/2);assert.equal(g.z,(a.z+b.z)/2);
  assert.equal(alongX?g.d:g.w,225);assert.equal(alongX?g.w:g.d,24);
  assert.equal(g.h,220);assert(!a.optional&&!b.optional,'gate obstructs an optional route');
  gates++;
 }
 plans++;
}
assert.equal(legacy.digest('hex'),'e79498a9de6f1c6217b0f09cee83d0d3bbb81c44de96fd67faa253bcc8eb665d','older saved layout changed');
console.log({plans,gates,olderLayoutsUnchanged:plans*10});
