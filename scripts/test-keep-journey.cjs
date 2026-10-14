const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const K=require('../public/3d/broken-walls.js'),S=require('../public/3d/story-state.js'),book=require('../public/3d/story/broken-walls.json');
const ctx={window:{BFBrokenWalls:K}};vm.runInNewContext(fs.readFileSync('public/3d/party-navigation.js','utf8'),ctx);const nav=ctx.window.BFPartyNavigation.target;
function fixture(flags={}){
 const G={p:{x:0,z:400,y:0,hp:110},zone:2,area:0,time:0,qs:{}};
 const a={G,seg:(x,z,w,d)=>G.segments.push({x,z,w,d}),plat:(x,z,h,w,d)=>G.obstacles.push({kind:'plat',x,z,h,w,d}),solid:()=>{},spawn:(type,x,z)=>{const e={type,x,z,y:0,hp:40};G.enemies.push(e);return e;},openWay:()=>G.opened=true,host:true,toast:()=>{},players:[G.p]};
 K.build(a);G.storyState=S.create();Object.assign(G.storyState.flags,flags);a.state=G.storyState;let seq=0;
 a.complete=key=>{G.storyState=S.transact(G.storyState,book,{id:'complete'+ ++seq,type:'world',key}).state;a.state=G.storyState;K.sync(a);};K.sync(a);return a;
}
assert.doesNotThrow(()=>K.status({keep:null,enemies:[]}),'quest construction can precede scene construction');
const a=fixture(),G=a.G,f=G.storyState.flags;assert.equal(nav(G).id,'grant');f['rk.help']=true;
assert.match(nav(G).navLabel,/Stairs/);G.p.y=150;assert.match(nav(G).navLabel,/guards/);assert.match(K.quest(G.storyState,K.status(G)),/2 guards/);
for(const e of G.enemies)if(e.keepGuard==='arrow')e.dead=true;assert.equal(nav(G).key,'rk.arrow');
Object.assign(f,{'rk.arrow':true,'rk.gate':true,'rk.breach.start':true,'rk.breach.done':true});Object.assign(G.p,{x:-300,z:-3400,y:0});assert.match(nav(G).navLabel,/jail key/);
Object.assign(G.p,{x:650,z:-3600,y:200});assert.equal(nav(G).key,'rk.wheel');Object.assign(G.p,{x:740,z:-2550,y:60});assert.match(nav(G).navLabel,/Battlement/);
for(const t of [-5,-.01,0,.15,2.25,4.999])assert.equal(K.latchReady(t),false,'closed timing boundary '+t);
for(const t of [.151,1,2.249,5.5])assert(K.latchReady(t));
for(const wave of [1,2,3]){const time=[0,1.5,11,21][wave],warn=K.warning({elapsed:time-.5,waves:wave-1,retryT:0,away:0});assert.deepEqual(warn,{wave,...K.waveEntry(wave)});assert.equal(K.warning({elapsed:time,waves:wave,retryT:1}),null);}
const restored=fixture({'rk.help':true,'rk.gate':true,'rk.cells':true,'rk.workshop':true,'rk.chamber':true,'rk.breach.done':true});assert(restored.G.opened);assert(!restored.G.obstacles.some(o=>o.keepBlock));const count=restored.G.obstacles.length;K.sync(restored);assert.equal(restored.G.obstacles.length,count);
const rescue=fixture({'rk.help':true,'rk.gate':true,'rk.breach.start':true});Object.assign(rescue.G.p,{x:0,z:-1850,y:0});K.tick(rescue,1.51);K.actors(rescue.G,rescue.state);const e=rescue.G.enemies.find(e=>e.keepEscort),n=rescue.G.keepPrisoners[0];Object.assign(e,{x:n.x+20,y:0,z:n.z,meleeSerial:1,r:20,dmg:15});assert(K.hitEscort(rescue.G,e));const hp=n.hp;assert(!K.hitEscort(rescue.G,e));assert.equal(n.hp,hp);
rescue.G.keep.escortHp[0]=0;K.tick(rescue,.016);assert(rescue.G.keep.retryT>0);assert.equal(rescue.G.keep.elapsed,0);K.tick(rescue,3);assert(rescue.G.keep.escortHp.every(h=>h===90));
rescue.G.keep.elapsed=10;rescue.G.keep.waves=1;Object.assign(rescue.G.p,{x:0,z:400});K.tick(rescue,4.1);assert.equal(rescue.G.keep.elapsed,0);assert(rescue.G.keep.retryT>0);
const before=JSON.stringify(rescue.G.keep.escortHp);K.tick({...rescue,host:false},1);assert.equal(JSON.stringify(rescue.G.keep.escortHp),before);
const bell=G.storyObjects.find(o=>o.key==='rk.breach');assert(Math.abs(bell.x)>160,'bell stays out of prisoner lane');assert.equal(G.obstacles.filter(o=>o.keepTower).length,6);
// Every raising stair sample clears the restored decorative tower footprints.
for(const q of G.keep.walks.wall)assert(!G.obstacles.some(o=>o.keepTower&&q[2]<o.h&&Math.abs(q[0]-o.x)<o.w/2+18&&Math.abs(q[1]-o.z)<o.d/2+18));
assert.deepEqual(G.bounds,{minX:-2440,maxX:1850,minZ:-4900,maxZ:680});
const P=require('../public/3d/puzzle-feedback.js'),beforeLatch=S.create(),afterLatch=S.transact(beforeLatch,book,{id:'latch',type:'world',key:'rk.timing'}).state;
assert.equal(P.notice(book.events['rk.timing'],beforeLatch,afterLatch,{key:'rk.timing'},'latch').title,'Workshop gate opened');
assert.equal(P.notice(book.events['rk.timing'],afterLatch,afterLatch,{key:'rk.timing'},'again'),null,'repeated state must not reannounce a completed latch');
console.log('Broken Walls: lifecycle-safe status, both route choices, guard guidance, exact timing boundaries, matching wave warning/spawn, restored gates, host-owned health/retry, tower clearance and original scale passed.');
