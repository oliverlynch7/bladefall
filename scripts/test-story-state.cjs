const assert=require('node:assert/strict'),fs=require('node:fs');
const engine=require('../public/3d/story-state.js'),book=JSON.parse(fs.readFileSync('public/3d/story/briar-foundation.json','utf8'));
let state=engine.create(),n=0;
function act(type,fields={}){const r=engine.transact(state,book,{type,id:'test-'+(++n),...fields});state=r.state;return r.changed}
function choose(choice){return act('choose',{line:state.conversation.node,choice})}
assert.equal(act('open',{npc:'mara'}),false,'Mara unlocks after Thomas');
assert(act('open',{npc:'thomas'}));assert(choose('afraid'));assert(choose('prepare'));assert(state.flags['thomas.ready']);assert(act('close'));
assert(act('open',{npc:'mara'}));assert(choose('why'));assert(choose('help'));assert(choose('accept'));
const waiting=state.conversation.node;assert.equal(choose('deliver'),false,'no turn-in without supplies');assert(act('close'));assert(act('open',{npc:'mara'}));assert.equal(state.conversation.node,waiting,'exit resumes');assert(act('close'));
const baseline=engine.restore(state);
for(const key of Object.keys(book.events).filter(k=>k.startsWith('briar.root.')||k==='briar.dressings')){assert(act('world',{key}));assert.equal(act('world',{key}),false,'same pickup with new event ID still deduped')}
assert.equal(state.items.tangle_root,3);assert(act('open',{npc:'mara'}));assert(choose('deliver'));assert(state.flags['mara.healing']);assert.equal(state.items.tangle_root,0);assert.equal(Object.keys(state.rewards).length,1);assert(choose('next'));assert(act('close'));
assert.equal(engine.restore(baseline).flags['mara.healing'],undefined,'rollback removes unfinished reward');
assert.equal(engine.restore(state).quests['briar.escape'],'active','completed checkpoint preserves progression');
const before=JSON.stringify(state);assert.equal(act('world',{key:'unknown'}),false);assert.equal(JSON.stringify(state),before);
assert.equal(engine.transact(state,book,{id:'stale',type:'open',npc:'thomas',revision:0}).changed,false);
const first=engine.transact(engine.create(),book,{id:'same',type:'open',npc:'thomas'});assert.equal(engine.transact(first.state,book,{id:'same',type:'open',npc:'thomas'}).changed,false);
const broken=structuredClone(book);broken.events.bad={effects:[{type:'flag',id:'leak'},{type:'item',id:'absent',amount:-1}]};assert.equal(engine.transact(state,broken,{id:'bad',type:'world',key:'bad'}).changed,false);assert(!state.flags.leak,'failed transaction must not partly apply');
for(const [id,node]of Object.entries(book.nodes)){for(const c of node.choices){assert(book.nodes[c.next],id+' missing target');assert(c.text.length>0)}}
for(const answer of ['protect','afraid','joke']){state=engine.create();act('open',{npc:'thomas'});assert(choose(answer));assert(choose('prepare'));assert(state.flags['thomas.ready'],'all father replies preserve main path')}
console.log('Story state passed: all Thomas branches, quest gating, leave/resume, atomic delivery, once-only pickups/reward, rollback, stale/duplicate input, graph links.');
