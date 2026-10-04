const assert=require('node:assert/strict');
const N=require('../public/3d/enemy-navigation.js');
const box={x:0,z:0,w:30,d:100,h:100};
assert(N.blocked({x:-40,y:22,z:0},{x:40,y:22,z:0},[box]));
assert(!N.blocked({x:-40,y:120,z:0},{x:40,y:120,z:0},[box]));
assert(!N.blocked({x:-40,y:22,z:0},{x:40,y:22,z:0},[{...box,open:true}]));
assert(!N.blocked({x:-40,y:22,z:0},{x:40,y:22,z:0},[{...box,y0:60}]));
let probes=0;
const route=N.route({x:-144,z:0,y:0},{x:144,z:0},(a,b)=>{
 probes++;return N.blocked({...a,y:22},{...b,y:22},[{...box,w:60,d:140}])?null:b;
});
assert(route.length>0);assert(Math.hypot(route.at(-1).x-144,route.at(-1).z)<40);
assert(route.some(n=>Math.abs(n.z)>=96));assert(probes<=96*8);
assert.deepEqual(N.route({x:0,z:0,y:0},{x:300,z:0},()=>null),[]);
console.log('PASS: cover height, closed/open barriers, bounded detour and unreachable target');
