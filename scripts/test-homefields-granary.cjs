const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../public/3d/story-state.js'),b=JSON.parse(fs.readFileSync('public/3d/story/briar-foundation.json'));
let s=E.create(),i=0;function world(key){const r=E.transact(s,b,{id:'grain-'+ ++i,type:'world',key:'home.grain.'+key});s=r.state;return r.changed}
assert(!world('cache'));assert(world('clue'));assert(s.notes['home.grain']);const checkpoint=E.restore(s);
assert(world('hopper'));assert(s.flags['home.grain.hopper']);assert(!s.flags['home.grain.open']);assert(!world('cache'),'premature cache is blocked');
assert(world('spout'));assert(s.flags['home.grain.open']);assert(!world('hopper'),'hopper does not replay');assert(world('cache'));assert(!world('cache'));assert.equal(s.rewards['home.grain.cache'].amount,160);assert(E.restore(s).flags['home.grain.open']);assert(!checkpoint.flags['home.grain.open']);
s=E.create();assert(world('spout'));assert(!s.flags['home.grain.open']);assert(world('hopper'));assert(s.flags['home.grain.open'],'either action order fills the basket');
s=E.restore({version:1,revision:2,flags:{'home.grain.open':true},items:{'home.grain.mask':5,'home.grain':5}});assert(s.flags['home.grain.open'],'old completed latch survives');
s=E.restore({version:1,revision:2,flags:{},items:{'home.grain.mask':6,'home.grain':6}});assert(world('hopper'));assert(!s.flags['home.grain.open']);assert(world('spout'));assert(s.flags['home.grain.open'],'old partial totals do not block new route');
console.log('Granary passed: clue, both action orders, blocked early cache, one-time reward, old completed/partial saves and checkpoint rollback.');
