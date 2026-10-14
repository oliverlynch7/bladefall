const assert=require('node:assert/strict');
const P=require('../public/3d/prison-dungeons.js');
const E=require('../public/3d/story-state.js');
function world(){
 const G={p:{x:0,z:0,y:0,r:13,hp:110,maxHp:110,onGround:true},storyState:E.create(),time:0,qs:{}};
 P.build({G,seg:(x,z,w,d,extra={})=>G.segments.push({x,z,w,d,...extra}),plat:(x,z,h,w,d,extra={})=>G.obstacles.push({kind:'plat',x,z,h,w,d,y0:h-(extra.slab||24),...extra}),solid:(x,z,y,w,h,d)=>G.obstacles.push({kind:'col',x,z,y0:y,h:y+h,w,d}),spawn:(type,x,z)=>{const e={type,x,z,y:180,hp:40};G.enemies.push(e);return e;}});return G;
}
assert.doesNotThrow(()=>P.status({enemies:[]}),'scene teardown must not throw');
let G=world();Object.assign(G.storyState.flags,{'kd.roster':true});Object.assign(G.p,{x:0,z:-1900,y:180});assert.equal(P.destination(G).x,0);assert(P.destination(G).z>-1300,'lower gallery routes back through cell block before west cells');
Object.assign(G.storyState.flags,{'kd.hidden':true,'kd.free':true,'kd.papers':true,'kd.lift.open':true});Object.assign(G.p,{x:88,z:-2500,y:360});assert(P.destination(G).z<-2800&&P.destination(G).y===360,'upper rider is guided off the deck, not down to its handle');
G.storyState.flags['kd.transfer']=true;Object.assign(G.p,{x:0,z:-2200,y:180});assert(P.destination(G).y===180&&P.destination(G).z>-2400,'late player is guided to the lower dock');
Object.assign(G.p,{x:2420,z:-3650,y:80});assert(P.destination(G).x>2300,'dry-store return uses its branch before the main drain');
Object.assign(G.p,{x:1350,z:-4430,y:80});assert(P.destination(G).x<1510,'western dead-end return stays on its own ledge');
let opened=0;P.sync({G,state:G.storyState,openWay:()=>opened++});assert(!G.obstacles.some(o=>o.prisonBlock==='hidden'||o.prisonBlock==='holdingExit'||o.prisonBlock==='release'));const count=G.obstacles.length;P.sync({G,state:G.storyState,openWay:()=>opened++});assert.equal(G.obstacles.length,count,'repeated restore cannot create geometry');assert(G.obstacles.some(o=>o.prisonBlock==='depth'),'rescue completion must not grant optional press reward');
// Coasting into the handle must not choose the opposite winding direction.
for(const direction of [1,-1]){
 G=world();Object.assign(G.storyState.flags,{'kd.free':true,'kd.papers':true});G.storyState.conversation={owner:'other',npc:'walter'};G.prison.rescueT=8;Object.assign(G.p,{x:88,z:-2500,y:180});assert(P.grip(G,'operator',G.p));
 const move=angle=>{Object.assign(G.p,{x:Math.cos(angle)*88,z:-2500+Math.sin(angle)*88});P.tick({G,state:G.storyState,host:true,operator:G.p,complete:()=>{},toast:()=>{}},.016);P.moveLift(G,G.movers[0]);};
 move(-.03*direction);move(-.065*direction);assert.equal(G.prison.winch.direction,0,'tiny approach inertia is ignored');
 for(let i=1;i<=12;i++)move(i*.1*direction);assert.equal(G.prison.winch.direction,direction);assert(G.prison.winch.progress>.14,'deliberate turning works while another player talks');
 const best=G.prison.winch.progress;move(1.1*direction);move(1.2*direction);assert(Math.abs(G.prison.winch.progress-best)<.0001,'backtracking cannot farm progress');
 P.release(G,'operator');for(let i=0;i<80;i++){P.tick({G,state:G.storyState,host:true,operator:null,complete:()=>{},toast:()=>{}},.016);P.moveLift(G,G.movers[0]);}assert.equal(G.prison.winch.progress,0);assert.equal(G.p.y,180,'release carries rider safely back down');
}
console.log('Dungeons journey passed: lifecycle, floor-aware guidance, branch returns, restored gates, both winding directions, approach inertia, conversation independence and retry.');
