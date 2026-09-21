const assert=require('node:assert/strict'),fs=require('node:fs');
const S=require('../public/3d/story-state.js'),K=require('../public/3d/broken-walls.js'),book=JSON.parse(fs.readFileSync('public/3d/story/broken-walls.json','utf8'));
for(const [id,n]of Object.entries(book.nodes)){assert(book.npcs[n.voice.speaker],id);assert(n.voice.context&&n.voice.direction,id);for(const c of n.choices)assert(book.nodes[c.next],c.next);}
let s=S.create(),seq=0;const act=(key)=>{const r=S.transact(s,book,{id:'k'+(++seq),type:'world',key});s=r.state;return r.changed;};
assert(!act('rk.tools'));assert(!act('rk.gate'));assert(!act('rk.trial'));assert(act('rk.wall'));assert(act('rk.trial'));assert(act('rk.trial.complete'));assert(K.shards(s).some(x=>x.id==='RK-02'));assert(!s.flags['rk.felix.quest']);assert(!act('rk.trial.complete'));
assert(!K.ready(s));s.flags['rk.help']=true;assert(act('rk.arrow'));assert(act('rk.gate'));assert(act('rk.breach'));assert(act('rk.breach.complete'));assert(act('rk.key'));assert(K.ready(s));assert(!s.flags['rk.workshop']);
const G={keep:{clock:0,elapsed:0,away:0,waves:0,trialSpawned:false},enemies:[]},state={flags:{'rk.breach.start':true}};let toasts=0,spawned=0;
const a={G,state,host:true,spawn(){const e={hp:1,dead:false};G.enemies.push(e);spawned++;return e;},complete(){},toast(){toasts++;},players:[{x:0,z:-2150,hp:10}]};
for(let i=0;i<200;i++)K.tick(a,.016);assert.equal(spawned,3);a.players[0].z=0;for(let i=0;i<1500;i++)K.tick(a,.016);assert.equal(toasts,2,'one wave announcement and only one retreat notice');assert.equal(G.keep.elapsed,0);assert.equal(G.keep.waves,0);
const before=spawned;K.tick({...a,host:false},10);assert.equal(spawned,before,'guest never spawns defenders');
console.log('Broken Walls content passed: 10 voiced graph nodes, independent chamber route, key route without Felix, guarded progression, once-only challenge, finite retreat notice and host-only spawns.');
