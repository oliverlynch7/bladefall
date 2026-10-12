const assert=require('node:assert/strict');
const {seat,settle}=require('../public/3d/campaign-placement.js');
const enemy=(extra={})=>({type:'grunt',mid:1,x:0,y:0,z:0,r:15,...extra});
const flat={floor:()=>0,resolve:()=>{}};
let e=enemy({y:30});assert.equal(seat(e,flat).moved,true);assert.equal(e.y,0);
e=enemy();const gap=seat(e,{...flat,floor:()=>-Infinity});assert.equal(gap.unresolved,true);assert.equal(e.x,0);
e=enemy();const high=seat(e,{...flat,floor:()=>300});assert.equal(high.unresolved,true);assert.equal(e.y,0);
// The destination has to support the feet, not merely the point between them.
e=enemy();const lip=seat(e,{...flat,floor:(x,z)=>Math.abs(x)<5&&Math.abs(z)<5?0:-Infinity});assert.equal(lip.unresolved,true);
// A wall can force a short move along the same floor, but never a long warp.
const wall={...flat,resolve:q=>{if(Math.abs(q.x)<20&&Math.abs(q.z)<20)q.x=25;}};
e=enemy();const moved=seat(e,wall);assert.equal(moved.moved,true);assert.ok(Math.hypot(e.x,e.z)<=96);assert.ok(Math.abs(e.x)>=20||Math.abs(e.z)>=20);
e=enemy();assert.equal(seat(e,{...flat,resolve:q=>q.x+=100}).unresolved,true);
// Low ceiling: valid support alone cannot place a torso inside a slab.
e=enemy();assert.equal(seat(e,{...flat,resolve:q=>{if(q.hh>40)q.z+=20;}}).unresolved,true);
for(const extra of [{crackWall:true},{kind:'fly'},{boss:true},{authoredStorey:true},{dead:true}]){e=enemy({...extra,y:300});assert.equal(seat(e,flat).skipped,true);assert.equal(e.y,300);}
const g={enemies:[enemy({y:12})],patrolWork:{slots:[{mid:1,x:0,y:12,z:0}]}};
const r=settle(g,flat);assert.equal(r.unresolved.length,0);assert.equal(g.patrolWork.slots[0].y,0);assert.equal(g.enemies.length,1);assert.equal(g.enemies[0].mid,1);
const one=enemy(),two=enemy();seat(one,wall);seat(two,wall);assert.deepEqual(one,two);
console.log('Campaign footing: supported feet, nearby clearance, stacked floors, unresolved preservation, exemptions and stable patrol slots passed.');
