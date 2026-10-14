const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../public/3d/lost-canyon.js');
const ctx={window:{BFLostCanyon:C}};vm.runInNewContext(fs.readFileSync('public/3d/party-navigation.js','utf8'),ctx);
function fixture(flags={}){
 const G={p:{x:0,z:330,y:220,hp:110},zone:1,area:1,time:0,qs:{}};
 const a={G,seg:(x,z,w,d,props)=>G.segments.push({x,z,w,d,...props}),plat:(x,z,h,w,d,props)=>G.obstacles.push({kind:'plat',x,z,h,w,d,...props}),solid:()=>{},spawn:(type,x,z)=>{const e={type,x,z,y:0,hp:40};G.enemies.push(e);return e;},openWay:()=>{},toast:()=>{},host:true};
 C.build(a);G.storyState={flags:{...flags}};a.state=G.storyState;C.sync(a);return a;
}
const a=fixture(),G=a.G,nav=ctx.window.BFPartyNavigation.target;
assert.equal(nav(G).id,'ward');G.storyState.flags['lc.gate.fight']=true;C.sync(a);
assert.equal(G.enemies.filter(e=>e.canyonGuard==='gate').length,3);
assert(G.enemies.filter(e=>e.canyonGuard==='gate').every(e=>e.z>-900&&e.y>70));
assert.equal(nav(G).navLabel,'Clear the gate guards');
for(const e of G.enemies)if(e.canyonGuard==='gate')e.dead=true;
assert.equal(nav(G).key,'lc.gate');assert.equal(C.quest(G.storyState,G),'Open the front gate');
const restored=fixture({'lc.gate.fight':true,'lc.entry':true});assert.equal(restored.G.enemies.filter(e=>e.canyonGuard==='gate').length,0);
assert(!restored.G.obstacles.some(o=>o.lcBlock==='gate'));
Object.assign(G.storyState.flags,{'lc.entry':true,'lc.rescue':true,'lc.north.open':true});C.sync(a);
const sides=G.obstacles.filter(o=>o.cageWall==='north');assert.equal(sides.length,3);assert(!G.obstacles.some(o=>o.lcBlock==='north'));
G.canyon.northActive=true;
for(let t=0;t<=20;t+=.025){G.canyon.northT=t;C.actors(G,G.storyState);for(const n of G.canyonPrisoners.filter(n=>n.escortIndex!=null))assert(!sides.some(o=>Math.abs(n.x-o.x)<o.w/2+n.r&&Math.abs(n.z-o.z)<o.d/2+n.r),'Prisoner clips barred side at '+t);}
for(const waiting of ['follow','fight']){G.canyon.northWaiting=waiting;C.actors(G,G.storyState);assert(G.canyonPrisoners.filter(n=>n.escortIndex!=null).every(n=>!n.walking));assert(C.quest(G.storyState,G).includes(waiting==='follow'?'Stay near':'Defeat the pursuers'));}
const remote=fixture({'lc.entry':true,'lc.rescue':true,'lc.north.open':true}).G;
remote.canyon.remote={northActive:true,northT:5,northWaiting:'fight',northHp:[80,110]};C.actors(remote,remote.storyState,remote.canyon.remote);
assert(C.quest(remote.storyState,remote).includes('25%'));assert(C.quest(remote.storyState,remote).includes('Defeat'));
assert.equal(remote.canyonPrisoners.find(n=>n.group==='north').hp,80);
const signal=fixture({'lc.entry':true,'lc.rescue':true,'lc.alarm.called':true}).G;signal.p.y=0;assert.equal(nav(signal).navLabel,'Signal scaffold · climb here');signal.p.y=180;assert.equal(nav(signal).key,'lc.alarm');
console.log('Canyon journey: useful entry/guard guidance, restored completion, cage-door collision, two-prisoner clearance at every turn, paused walking, shared status and scaffold approach passed.');
