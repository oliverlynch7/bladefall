const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('../public/3d/story-state.js'),C=require('../public/3d/hollow-cliffs.js');
const book=JSON.parse(fs.readFileSync('public/3d/story/hollow-cliffs.json','utf8'));let s=S.create(),seq=0;
function doEvent(type,fields){const r=S.transact(s,book,{id:'test-'+ ++seq,type,...fields});s=r.state;return r.changed;}
function world(key){return doEvent('world',{key});}function choose(id){return doEvent('choose',{line:s.conversation.node,choice:id});}
assert(!world('hp.orders'));doEvent('open',{npc:'caleb'});choose('blame');choose('repair');assert(s.flags['hp.trail']);doEvent('close');assert(world('hp.orders'));
assert(!world('hp.brake.right'));assert(world('hp.cart.push'));assert(s.flags['hp.weight.open']);assert(!world('hp.cart.push'));assert(world('hp.brake.right'));assert(s.flags['hp.bridge']);
const G={p:{}};C.build({G,seg:()=>{},plat:()=>{},solid:()=>{},spawn:()=>({})});assert(G.storyObjects.some(o=>o.key==='hp.cart.push'));assert(!G.storyObjects.some(o=>/^hp\.weight\.|^hp\.brake\.wrong$/.test(o.key)));
const oldBridge=S.restore({version:1,flags:{'hp.bridge':true}}),oldReady=S.restore({version:1,flags:{'hp.weight.open':true}}),oldPartialWeights=S.restore({version:1,items:{'hp.weight.mask':1,'hp.weight':2}});
assert(!C.available('hp.cart.push',oldBridge));assert(C.available('hp.brake.right',oldReady));assert(C.available('hp.cart.push',oldPartialWeights));
G.time=0;C.sync({G,state:oldReady,seg:()=>{},plat:()=>{},openWay:()=>{}});assert.equal(C.cartProgress(G),1);assert.equal(C.cartX(G),C.freight.endX);
doEvent('open',{npc:'skip'});choose('rope');assert(!choose('return'));doEvent('close');world('hp.rope');doEvent('open',{npc:'skip'});assert(choose('return'));assert(s.flags['hp.skip.returned']);assert.equal(Object.keys(s.rewards).length,1);doEvent('close');assert(!world('hp.rope'));assert(C.shards(s).some(x=>x.id==='HP-02'));
assert.equal(C.cargoSteps.length,6);for(let i=1;i<C.cargoSteps.length;i++){const a=C.cargoSteps[i-1],b=C.cargoSteps[i];assert(b.y>a.y&&b.y-a.y<45,'climb height');assert(Math.hypot(b.x-a.x,b.z-a.z)<185,'climb gap');}
s=S.create();assert(!C.available('hp.code.claim',s));assert(world('hp.code.release'));assert(s.flags['hp.code.open']);assert(!C.available('hp.code.release',s));assert(C.available('hp.code.claim',s));assert(world('hp.code.claim'));assert(!world('hp.code.claim'));assert(!C.available('hp.code.claim',s));
const oldPartial=S.restore({version:1,flags:{},items:{'hp.code':2},notes:{'hp.code':{region:'hollow',title:'Old code',text:'Press three numbers.'}}});assert(C.available('hp.code.release',oldPartial));
const oldComplete=S.restore({version:1,flags:{'hp.code.open':true,'hp.code.claimed':true},rewards:{'hp.cliffcache':{kind:'cliff_cache',amount:1,claimed:true}}});assert(!C.available('hp.code.release',oldComplete));assert(!C.available('hp.code.claim',oldComplete));
for(const [id,n]of Object.entries(book.nodes)){assert(n.voice.speaker in book.npcs);assert(n.voice.context&&n.voice.direction);for(const c of n.choices)assert(c.next in book.nodes,id+': missing '+c.next);}
console.log('Winding Cliffs: freight cart, legacy bridge saves, rope, cargo release, once-only rewards, and dialogue links passed.');
