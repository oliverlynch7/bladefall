const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const C=require('../public/3d/hollow-cliffs.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('public/3d/party-navigation.js','utf8'),context);
const nav=context.window.BFPartyNavigation.target;
function fixture(){const G={p:{x:0,z:-3200},zone:1,area:0,time:0};C.build({G,seg:()=>{},plat:()=>{},solid:()=>{},spawn:()=>({})});G.storyState={flags:{},notes:{}};return G;}
function sync(G){C.sync({G,state:G.storyState,seg:(x,z,w,d,props)=>G.segments.push({x,z,w,d,...props}),plat:()=>{},openWay:()=>{}});}
function tick(G,dt){G.time+=dt;C.tick(G,()=>{},(x,z,w,d,props)=>G.segments.push({x,z,w,d,...props}));}
const G=fixture();sync(G);Object.assign(G.storyState.flags,{'hp.orders':true,'hp.trail':true,'hp.weight.open':true});sync(G);
assert(!C.available('hp.brake.right',G.storyState,G));tick(G,2.3);assert(C.available('hp.brake.right',G.storyState,G));
G.storyState.flags['hp.bridge']=true;sync(G);assert.equal(C.bridgeProgress(G),0);assert(!G.cliffs.bridgeWalkable);assert.equal(G.segments.length,0);
tick(G,.75);assert(C.bridgeProgress(G)>.49&&C.bridgeProgress(G)<.51);assert.equal(G.segments.length,0);
tick(G,.76);assert(G.cliffs.bridgeWalkable);assert.equal(G.segments.length,1);sync(G);tick(G,30);assert.equal(G.segments.length,1);
const legacy=fixture();Object.assign(legacy.storyState.flags,{'hp.bridge':true});sync(legacy);assert.equal(C.bridgeProgress(legacy),1);assert(legacy.cliffs.bridgeWalkable);assert.equal(legacy.segments.length,1);
G.enemies=[{x:-450,z:-3600,hp:25,cliffGuard:true},{x:-380,z:-4200,hp:30,cliffGuard:true},{x:10,z:-3200,hp:15}];
assert.equal(nav(G).navLabel,'Clear the guards');assert(C.quest(G.storyState,G).includes('2 left'));
G.enemies[0].dead=true;assert.equal(nav(G).z,-4200);assert(C.quest(G.storyState,G).includes('1 left'));
G.storyState.flags['hp.quiet']=true;assert.equal(nav(G).key,'hp.lift');assert.equal(C.quest(G.storyState,G),'Release the canyon lift');
G.storyState.flags['hp.quiet']=false;G.enemies[1].hp=0;assert.equal(nav(G).key,'hp.lift');assert.equal(C.quest(G.storyState,G),'Release the canyon lift');
G._cliffGuards=2;assert.equal(nav(G).navLabel,'Lookout patrol');assert(C.quest(G.storyState,G,G._cliffGuards).includes('2 left'));
console.log('Hollow journey: cart gate, delayed bridge collision, idempotence, completed save, patrol/quiet-route guidance and remote guard count passed.');
