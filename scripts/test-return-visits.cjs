require('../public/3d/return-adventures.js');
const assert=require('node:assert/strict'),fs=require('node:fs');const S=require('../public/3d/story-state.js'),R=require('../public/3d/return-visits.js'),book=JSON.parse(fs.readFileSync('public/3d/story/return-visits.json','utf8'));let seq=0;
for(const [id,q]of Object.entries(R.defs).filter(([id])=>['pattern','supplies'].includes(id))){let s=S.create();const event=(type,more)=>{const r=S.transact(s,book,{id:'qa'+(++seq),type,...more});s=r.state;return r.changed};assert.equal(event('open',{npc:q.npc}),false);R.seedHub(s,{zoneDone:{[q.region]:true},returnVisits:{}});assert(event('open',{npc:q.npc}));event('choose',{line:s.conversation.node,choice:'later'});assert(!s.flags['rv.accepted.'+id]);event('choose',{line:s.conversation.node,choice:'help'});assert(s.rewards['rv.accept.'+id]);event('close',{});s.flags['rv.active.'+id]=true;assert.equal(event('world',{key:'rv.'+id+'.take'}),false);if(id==='pattern'){event('world',{key:'rv.pattern.clamp'});assert(!s.flags['rv.pattern.clamp']);event('world',{key:'rv.pattern.cool'});event('world',{key:'rv.pattern.clamp'});}else{s.items['rv.supplies.balance.mask']=3;assert(!s.flags['rv.supplies.balance.open']);assert(!book.events['rv.supplies.weight.0']);assert(event('world',{key:'rv.supplies.release'}));assert(s.flags['rv.supplies.balance.open']);assert.equal(event('world',{key:'rv.supplies.release'}),false);}assert(event('world',{key:'rv.'+id+'.take'}));assert.equal(event('world',{key:'rv.'+id+'.take'}),false);assert(s.rewards['rv.item.'+id]);let hub=R.seedHub(S.create(),{zoneDone:{[q.region]:true},returnVisits:{[id]:'ready'}});hub=S.transact(hub,book,{id:'open',type:'open',npc:q.npc}).state;hub=S.transact(hub,book,{id:'give',type:'choose',line:hub.conversation.node,choice:'give'}).state;assert(hub.flags['rv.done.'+id]);assert(hub.rewards['rv.finish.'+id]);}
for(const [id,n]of Object.entries(book.nodes)){assert(n.voice.speaker&&n.voice.context&&n.voice.direction,id);for(const c of n.choices)assert(book.nodes[c.next],c.next);}assert.deepEqual(R.normalize({pattern:'ready',supplies:'corrupt',extra:'done'}),{pattern:'ready'});console.log('Return quests: eligibility, decline/rejoin, puzzle gates, collection/delivery idempotency, graph and save normalization passed.');

assert(R.info({id:'anvil'},{zoneDone:{},returnVisits:{pattern:'ready'}}));

const oldNote='The loaded basket needs 8 on the other side.';
for(const previouslyOpen of [false,true]){
  const G={keep:{},time:8},s=S.create();
  s.flags['rv.supplies.balance.open']=previouslyOpen;
  s.items['rv.supplies.balance.mask']=3;
  s.notes['rv.supplies.clue']={title:'Food for the Refuge',text:oldNote,region:'keep'};
  R.sync({G,s,plat:(x,z,h,w,d,extra)=>({x,z,h,w,d,...extra})});
  assert.equal(G.returnSupply.ledges.length,4);
  assert.equal(G.returnSupply.open,previouslyOpen);
  assert.equal(G.returnSupply.openedAt,previouslyOpen?-Infinity:null);
  assert.equal(s.notes['rv.supplies.clue'].text,R.SUPPLY_CLUE);
  assert.equal(R.available('rv.supplies.release',s),!previouslyOpen);
}
for(const status of ['ready','done']){
  const G={keep:{},time:8},s=S.create();
  R.sync({G,s,meta:{returnVisits:{supplies:status}},plat:(x,z,h,w,d,extra)=>({x,z,h,w,d,...extra})});
  assert.equal(G.returnSupply.open,true);
  assert.equal(G.returnSupply.collected,true);
}
