const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../public/3d/story-state.js'),P=require('../public/3d/prison-dungeons.js'),book=JSON.parse(fs.readFileSync('public/3d/story/prison-dungeons.json'));
let s,n=0;const reset=()=>s=E.create(),act=(type,x={})=>{const r=E.transact(s,book,{id:'prison-'+ ++n,type,...x});s=r.state;return r.changed},world=key=>act('world',{key}),pick=choice=>act('choose',{line:s.conversation.node,choice}),talk=()=>act('open',{npc:'sly'});
const rescue=()=>{for(const key of ['kd.roster','kd.hidden','kd.free','kd.papers','kd.lift.0','kd.lift.2','kd.transfer'])assert(world(key),key);};
for(const branch of ['quiet','open','keep']){
 reset();talk();assert(pick('ask'));assert(pick(branch));assert(!pick(branch==='keep'?'repair':'returned'),'no early reward');act('close');rescue();assert(P.ready(s),'optional choices cannot block rescue');assert(world('kd.return'));talk();
 if(branch==='keep'){assert(pick('repair'));assert(pick('accept'));}else assert(pick('returned'));
 assert.equal(s.rewards['kd.sly.RK-04'].kind,'rift_shard');assert(!pick('returned'));assert.equal(Object.keys(s.rewards).length,1);act('close');talk();assert(!pick('returned'));act('close');assert.equal(E.restore(s).conversation,null);
}
reset();assert(!world('kd.hidden'));world('kd.roster');world('kd.hidden');world('kd.free');world('kd.papers');world('kd.lift.1');assert(!s.flags['kd.lift.open']);world('kd.lift.1');world('kd.lift.0');world('kd.lift.2');assert(s.flags['kd.lift.open']);world('kd.transfer');assert(P.ready(s));assert(!s.flags['kd.walter.met']);assert(!s.flags['kd.sly.reward']);
assert(!world('kd.deep.1'));assert(!world('kd.latch'));world('kd.brace.2');assert(world('kd.latch'));world('kd.deep.1');world('kd.deep.2');assert(s.flags['kd.deep.open']);assert.deepEqual(P.shards(s).map(x=>x.id),['RK-03','RK-05']);world('kd.cache');assert(!world('kd.cache'));assert.equal(s.rewards['kd.drain.armor'].kind,'keep_armor');
for(const [id,line]of Object.entries(book.nodes)){assert(line.voice.speaker&&line.voice.context,id);for(const c of line.choices||[])if(c.next)assert(book.nodes[c.next],`${id} -> ${c.next}`);}
assert.equal(P.liftHeight(0),180);assert.equal(P.liftHeight(12),270);assert.equal(P.liftHeight(30),360);
console.log('Prison story passed: all three Sly routes, repair, reward gates and deduplication, NPC-independent rescue, load puzzles, shard placement, voice graph and lift bounds.');
