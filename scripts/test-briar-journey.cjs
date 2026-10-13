const assert=require('node:assert/strict');
const J=require('../public/3d/briar-journey.js');
const S=require('../public/3d/story-state.js');
const book=require('../public/3d/story/briar-foundation.json');
function fixture(flags={}){const g={zone:0,area:0,runSeed:188,time:0,rooms:[],obstacles:[],walls:[{storyBridge:true,x:395,z:-2150,w:190,d:190,h:112}],briarBridge:{closed:true},storyObjects:['briar.water','briar.jam','briar.bridge'].map(key=>({key})),storyState:S.create()};Object.assign(g.storyState.flags,flags);g.storyState.quests['briar.escape']='active';J.build(g);return g;}
let g=fixture(),p={id:'a',...J.CRATE,z:J.CRATE.z+55,y:0,hp:100};
const tick=(players,n=1)=>{for(let i=0;i<n;i++){g.time+=.016;J.tick(g,.016,true,players,key=>{const r=S.transact(g.storyState,book,{id:'weight',type:'world',key});g.storyState=r.state;});}};
assert.equal(J.available(g,'briar.jam'),false);
tick([{...p,...J.PLATE}],40);assert(g.briarMill.water<.02);assert(J.available(g,'briar.jam'));
tick([p],40);assert(g.briarMill.water>.98);
assert(J.grip(g,'a',p));assert.equal(J.grip(g,'b',p),false);assert.equal(J.reset(g,'b'),false);
g.obstacles.push({x:130,z:-1730,w:70,d:20,h:95});
for(let i=0;i<70;i++){p.z-=3;tick([p]);}assert(g.briarMill.z>-1690,'crate must stop at an obstacle');
assert(J.reset(g,'a'));assert.equal(g.briarMill.z,J.CRATE.z);
g.obstacles.pop();p={id:'a',x:130,z:-1545,y:0,hp:100};J.grip(g,'a',p);tick([]);assert.equal(g.briarMill.owner,null,'disconnect releases the crate');
J.grip(g,'a',p);tick([{...p,y:30}]);assert.equal(g.briarMill.owner,null,'jump releases the crate');
p.y=0;J.grip(g,'a',p);for(let i=0;i<93;i++){p.z-=3;tick([p]);}tick([p],50);
assert(g.storyState.flags['briar.water']);assert(g.briarMill.latched);assert.equal(g.briarMill.owner,null);assert.equal(J.grip(g,'a',p),false);
assert.equal(J.reset(g,'a'),false);const q=J.status(g);J.apply(g,{...q,run:999,x:999});assert.equal(g.briarMill.x,130);
g.storyState.flags['briar.bridge']=true;J.sync(g);assert(g.walls.some(w=>w.storyBridge));tick([p],110);assert.equal(g.briarMill.bridge,1);assert(!g.walls.some(w=>w.storyBridge));
for(const flags of [{'briar.water':true},{'briar.jam':true},{'briar.bridge':true}]){g=fixture(flags);assert(g.briarMill.latched);assert.equal(g.briarMill.z,J.PLATE.z);if(flags['briar.bridge']){assert.equal(g.briarMill.bridge,1);assert(!g.walls.some(w=>w.storyBridge));}}
g=fixture();const c={id:'a',x:130,z:-1510,y:0,hp:100};J.grip(g,'a',c);for(let i=0;i<100;i++){c.x-=3;tick([c]);}assert(g.briarMill.x>=55,'crate stays in its recoverable working lane');
console.log('Briar mill: pressure/release, real obstacle blocking, owner arbitration, reset, disconnect/jump, weight completion, stale snapshot, delayed bridge collision, legacy states and lane bounds passed.');

const C=require('../public/3d/journal-clues.js');g=fixture();g.p={x:130,z:-1610,y:0};assert.equal(C.related(g),null);g.storyState=S.transact(g.storyState,book,{id:'sketch',type:'world',key:'briar.mill.note'}).state;assert.equal(C.related(g),'briar.mill.sketch');console.log('Mill sketch appears as a related clue only after discovery.');

const notices=require('../public/3d/journal-notice.js').createQueue();notices.reset('mill');notices.push({id:'inspect.briar.jam',text:'Hold the plate first.'});notices.tick(0,true);g.briarMill.water=0;J.refreshNotices(g,notices);assert.equal(notices.current,null);
g.storyState.notes['briar.mill']={title:'Mill',text:'The wheel is clear. Lower the bridge.'};notices.push({id:'briar.mill',text:'Free the wheel.'});notices.tick(0,true);J.refreshNotices(g,notices);notices.tick(0,true);assert.equal(notices.current.text,g.storyState.notes['briar.mill'].text);
g.storyState.flags['briar.bridge']=true;notices.push({id:'briar.mill.sketch',text:'The discovered sketch.'});J.refreshNotices(g,notices);notices.tick(0,true);assert.equal(notices.current.id,'briar.mill.sketch');assert(g.storyState.notes['briar.mill']);console.log('Superseded mill notices clear; discovered clues and permanent journal entries remain.');

global.__BRIAR_MILL_3D_ACTIVE=true;global.HERO3D={on:false,ready:true};global.__world3d=()=>({on:true,ready:true});let boxes=0;J.fallback(g,()=>boxes++);assert(boxes>0,'switching off the 3D renderer retains the mill');global.HERO3D.on=true;boxes=0;J.fallback(g,()=>boxes++);assert.equal(boxes,0,'active detailed art does not render duplicate fallback');global.__world3d=()=>({on:false,ready:true});J.fallback(g,()=>boxes++);assert(boxes>0,'generic world retains visible puzzle props');delete global.__BRIAR_MILL_3D_ACTIVE;delete global.HERO3D;delete global.__world3d;console.log('Mill fallback follows the active renderer, including a mid-level graphics switch.');
