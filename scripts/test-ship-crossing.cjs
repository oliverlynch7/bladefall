const assert=require('node:assert/strict'),C=require('../public/3d/ship-crossing.js');
const crew=[{id:'alice'},{id:'bob'}];
let serial=0;
function make(ids=crew){const s=C.create({epoch:'voyage-'+(++serial),seed:42,crew:ids,initiator:'alice'});C.command(s,s.helm,{epoch:s.epoch,type:'start'});return s;}
const cmd=(s,actor,type,extra={})=>C.command(s,actor,{epoch:s.epoch,type,...extra});
function pilot(s,dt=1/60){
 const o=C.obstacles(s.seed,s.stage).find(o=>o.z>s.distance-8);
 const target=o?-Math.sign(o.x)*17:0;
 cmd(s,s.helm,'steer',{seq:s.tick+100,value:Math.max(-1,Math.min(1,(target-s.x)*.5))});
 C.advance(s,dt);
}
function reach(s,stage){let frames=0;while(s.stage<stage&&!s.failed&&frames++<50000){
 const kind=C.current(s).kind;
 if(kind==='steer')pilot(s);
 else if(kind==='fight'){C.clearWave(s,C.current(s).wave,0);C.advance(s,1/60);}
 else if(kind==='rest'){for(const id of s.crew)cmd(s,id,'ready');C.advance(s,1/60);}
 }assert.equal(s.stage,stage);assert(!s.failed);}
// Every authored approach is clearable, and the same hazard shape drives the warning.
for(let seed=0;seed<80;seed++){
 const s=make();s.seed=seed;reach(s,6);assert.equal(s.hull,100,'safe corridor seed '+seed);
 const events=C.drain(s);assert.equal(events.filter(e=>e.type==='landed').length,1);
 assert.deepEqual(events.filter(e=>e.type==='boarding').map(e=>e.wave),[1,2]);
 assert.equal(s.helm,'bob');assert.equal(C.drain(s).length,0);
 C.advance(s,10);assert.equal(C.drain(s).length,0);
}
let s=make();assert(!cmd(s,'bob','steer',{value:1,seq:1}));
assert(!C.command(s,'alice',{epoch:'old',type:'steer',seq:2,value:1}));
assert(!cmd(s,'alice','steer',{value:NaN,seq:1}));
assert(!cmd(s,'alice','landed'));assert(!cmd(s,'alice','clearWave'));
assert(cmd(s,'alice','steer',{value:99,seq:1}));assert.equal(s.input,1);
assert(!cmd(s,'alice','steer',{value:-1,seq:1}));
assert(!cmd(s,'alice','steer',{value:-1,seq:0}));
for(let i=0;i<120;i++)C.advance(s,1/60);assert(Math.abs(s.vx)<.01,'lost input decays');
// Exactly one contact per hazard, not continuous frame-by-frame damage.
s=make();const rock=C.obstacles(s.seed,0)[0];s.x=rock.x;s.distance=rock.z-2;
for(let i=0;i<70;i++)C.advance(s,1/60);assert.equal(s.hull,82);
assert.equal(C.drain(s).filter(e=>e.type==='hull-hit').length,1);
// Failure cannot race the transition into an arrival or an award.
s=make();s.stage=5;s.distance=C.stages[5].length-.1;C.damage(s,100,'test');C.advance(s,1);
assert(s.failed);assert(!C.drain(s).some(e=>e.type==='landed'));assert(!cmd(s,'alice','repair'));
// Combat completion comes from host enemy evidence, never the steering client.
s=make();reach(s,1);for(let i=0;i<4000;i++)C.advance(s,1/60);
assert.equal(s.stage,1);assert(!C.clearWave(s,2,0));assert(!C.clearWave(s,1,1));
assert(C.clearWave(s,1,0));assert(!C.clearWave(s,1,0));C.advance(s,1/60);assert.equal(s.stage,2);
assert.equal(s.helm,'bob');s.hull=40;assert(cmd(s,'alice','repair'));assert.equal(s.hull,85);
assert(!cmd(s,'bob','repair'));assert(cmd(s,'alice','ready'));C.advance(s,1);assert.equal(s.stage,2);
C.reconcileCrew(s,[{id:'alice'},{id:'bob',connected:false}]);assert.equal(s.helm,'alice');
C.advance(s,1/60);assert.equal(s.stage,3);
// No crew freezes progress, reconnect restores a usable helm. Dead players don't veto ready.
C.reconcileCrew(s,[]);const before=s.distance;C.advance(s,5);assert.equal(s.distance,before);
C.reconcileCrew(s,[{id:'charlie'},{id:'bob',alive:false}]);assert.equal(s.helm,'charlie');
assert(!cmd(s,'bob','steer',{value:1,seq:1}));
// Pause includes collision and timers. Returning from a suspended tab cannot skip a leg.
s=make();C.pause(s,true);const paused=C.snapshot(s);C.advance(s,999);assert.deepEqual(C.snapshot(s),paused);
assert(!cmd(s,'alice','steer',{value:1,seq:10}));C.pause(s,false);C.advance(s,999);
assert(s.distance<=4.01);
// Two frame rates give identical deterministic simulation under held input packets.
const a=make(),b=make();for(let i=0;i<300;i++){
 cmd(a,a.helm,'steer',{seq:i,value:.2});cmd(b,b.helm,'steer',{seq:i,value:.2});
 C.advance(a,1/30);C.advance(b,1/60);C.advance(b,1/60);
}assert.equal(a.x,b.x);assert.equal(a.distance,b.distance);assert.equal(a.hull,b.hull);
// Snapshots cannot replay events, overwrite newer state or cross scenes.
s=make();C.advance(s,.1);const packet=C.snapshot(s),guest=C.acceptSnapshot(null,packet,s.epoch);
assert(guest);assert(!('events'in guest));assert.equal(C.acceptSnapshot(guest,packet,s.epoch),guest);
assert.equal(C.acceptSnapshot(guest,{...packet,seq:packet.seq+1,x:NaN},s.epoch),guest);
assert.equal(C.acceptSnapshot(guest,{...packet,seq:packet.seq+1},'different'),guest);
assert.equal(C.acceptSnapshot(guest,{...packet,stage:99,seq:packet.seq+1},s.epoch),guest);
packet.crew.push('not-shared');assert(!guest.crew.includes('not-shared'));
// Solo has steering and fighting separated, with no unavailable second-player ready gate.
s=make([{id:'alice'}]);reach(s,2);assert.equal(s.helm,'alice');cmd(s,'alice','ready');C.advance(s,1/60);reach(s,6);
console.log('Ship crossing passed: 80 safe course seeds, collisions, two waves, role swap, repair cap, disconnect/death, solo, pause, fixed steps, authority and stale snapshots.');
