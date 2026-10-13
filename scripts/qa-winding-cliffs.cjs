async page=>{
if(!page.url().startsWith('http://127.0.0.1:'))throw Error('Local isolated QA only');
const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.stash=[];b.openHub();b.enterZone(1);b.meta.camMode='far';b.meta.tutOff=true;for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;});
await page.waitForFunction(()=>__world3d().counts.hollowArt&&!BF_LOADING.active);
const result=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,checks=[],walks=[];const ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
function act(key){const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key});}
function talk(n,choice){const o=G.storyNpcs.find(o=>o.id===n);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('open',{npc:n});b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');}
function walk(x,z,jump=false,expectedY=0){for(let i=0;i<950;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<16)break;b.input.jx=dx/d;b.input.jz=dz/d;if(jump&&i%28===0)b.input.jumpEdge=true;b.update(.016)}b.input.jx=b.input.jz=0;walks.push({to:[x,z],at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],expectedY,ok:Math.hypot(p.x-x,p.z-z)<25&&p.y>=expectedY-48});}
talk('caleb','help');ok('Caleb begins trail',G.storyState.flags['hp.trail']);
Object.assign(p,{x:0,z:300,y:0});for(const q of BFHollowCliffs.paths.approach)walk(q[0],q[1]);
act('hp.orders');act('hp.brake.right');ok('unweighted plate cannot open bridge',!G.storyState.flags['hp.bridge']);
act('hp.cart.push');ok('cart starts moving toward the plate',G.storyState.flags['hp.weight.open']&&BFHollowCliffs.cartProgress(G)<.1);
act('hp.brake.right');ok('winch waits for cart to dock',!G.storyState.flags['hp.bridge']);
for(let i=0;i<150;i++)b.update(.016);
ok('cart docks with matching collision',BFHollowCliffs.cartProgress(G)===1&&Math.abs(G.cliffs.cartCollider.x-BFHollowCliffs.freight.endX)<1);
act('hp.brake.right');ok('lowering bridge has no early floor',!G.segments.some(s=>s.bridge));for(let i=0;i<100;i++)b.update(.016);ok('settled bridge adds real walkable ground',G.cliffs.bridge&&G.segments.some(s=>s.bridge));
Object.assign(p,{x:0,z:-2470,y:0});walk(0,-3100);act('hp.lift');ok('live patrol blocks lower lift',!G.storyState.flags['hp.descent']);
Object.assign(p,{x:150,z:-3200,y:0});for(const q of G.cliffs.walks.quiet)walk(q[0],q[1],true,q[2]);act('hp.quiet');act('hp.lift');ok('quiet rope opens descent with patrol alive',G.portal&&G.enemies.some(e=>e.cliffGuard&&!e.dead));
Object.assign(p,{x:0,z:-400,y:0});for(const q of G.cliffs.walks.shelves)walk(q[0],q[1],true,q[2]);
Object.assign(p,{x:720,z:-870,y:110});for(const q of G.cliffs.walks.rope)walk(q[0],q[1],true,q[2]);act('hp.rope');talk('skip','rope');talk('skip','return');ok('return gives fixed uncommon javelin',b.meta.stash.some(i=>i.weapon?.name==='Cliff Runner'&&i.weapon.rarity==='uncommon'));
const count=b.meta.stash.length;b.briarSync();ok('reward cannot repeat',b.meta.stash.length===count);
Object.assign(p,{x:900,z:-1670,y:200});for(const q of G.cliffs.ridgeSteps)walk(q[0],q[1],true,q[2]);ok('ridge reached at shard height',p.y>=390);ok('upper shard collectible',b.takeWorldRiftShard('HP-02')==='collected'||G.pendingRiftShards?.found.includes('HP-02'));
Object.assign(p,{x:-850,z:-1230,y:0});for(const q of G.cliffs.walks.cloth)walk(q[0],q[1]);Object.assign(p,{x:-1770,z:-1630,y:0});b.takeWorldRiftShard('HP-01');ok('two distinct physical shards remain unbanked',G.pendingRiftShards.found.length===2&&!b.meta.riftShards.length);
Object.assign(p,{x:-1700,z:-2280,y:0,vy:0,onGround:true});
for(const q of BFHollowCliffs.cargoSteps){let idle=0;for(let i=0;i<360;i++){const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz),onStep=p.onGround&&p.y>=q.y-4&&Math.abs(dx)<q.w/2-6&&Math.abs(dz)<q.d/2-6;if(onStep&&(d<20||idle>15))break;const oldX=p.x,oldZ=p.z;b.input.jx=dx/d;b.input.jz=dz/d;if(p.onGround&&p.y<q.y-8)b.input.jumpEdge=true;b.update(.016);idle=onStep&&Math.hypot(p.x-oldX,p.z-oldZ)<.2?idle+1:0;}b.input.jx=b.input.jz=0;walks.push({to:[q.x,q.z],at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],expectedY:q.y,ok:p.onGround&&p.y>=q.y-4&&Math.abs(q.x-p.x)<q.w/2-6&&Math.abs(q.z-p.z)<q.d/2-6});}
ok('cargo release is reachable by normal jumps',p.y>=176&&Math.hypot(p.x+1770,p.z+2390)<35);
act('hp.code.release');ok('hoist opens the chest',G.storyState.flags['hp.code.open']);
act('hp.code.claim');ok('cargo chest grants once',G.storyState.flags['hp.code.claimed']);
Object.assign(p,{x:-1545,z:-2365,y:58,vy:0,onGround:true});for(let i=0;i<90;i++){b.input.jx=-1;b.input.jz=0;if(i===1)b.input.jumpEdge=true;b.update(.016);}b.input.jx=b.input.jz=0;ok('missed bracket lands on lower trail',p.onGround&&p.y===0&&p.x>-1900);
return {checks,walks,errors:[],counts:__world3d().counts};});
await page.evaluate(()=>{Object.assign(__BF3.G.p,{x:850,z:-1500,y:200});});await page.waitForTimeout(650);await page.screenshot({path:'output/playwright/winding-cliffs-route.png'});
if(errors.length||result.walks.some(w=>!w.ok))throw Error(JSON.stringify({errors,failedWalks:result.walks.filter(w=>!w.ok)}));return {...result,walks:undefined,waypoints:result.walks.length,failedWalks:result.walks.filter(w=>!w.ok),errors};
}
