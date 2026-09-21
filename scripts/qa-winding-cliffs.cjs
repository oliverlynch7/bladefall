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
act('hp.orders');act('hp.brake.right');ok('wrong weight cannot open bridge',!G.storyState.flags['hp.bridge']);act('hp.weight.2');act('hp.weight.5');act('hp.brake.wrong');ok('cart brake resets weights safely',!G.storyState.flags['hp.weight.open']);act('hp.weight.2');act('hp.weight.5');act('hp.brake.right');ok('bridge adds real walkable ground',G.cliffs.bridge&&G.segments.some(s=>s.bridge));
Object.assign(p,{x:0,z:-2470,y:0});walk(0,-3100);act('hp.lift');ok('live patrol blocks lower lift',!G.storyState.flags['hp.descent']);
Object.assign(p,{x:150,z:-3200,y:0});for(const q of G.cliffs.walks.quiet)walk(q[0],q[1],true,q[2]);act('hp.quiet');act('hp.lift');ok('quiet rope opens descent with patrol alive',G.portal&&G.enemies.some(e=>e.cliffGuard&&!e.dead));
Object.assign(p,{x:0,z:-400,y:0});for(const q of G.cliffs.walks.shelves)walk(q[0],q[1],true,q[2]);
Object.assign(p,{x:720,z:-870,y:110});for(const q of G.cliffs.walks.rope)walk(q[0],q[1],true,q[2]);act('hp.rope');talk('skip','rope');talk('skip','return');ok('return gives fixed uncommon javelin',b.meta.stash.some(i=>i.weapon?.name==='Cliff Runner'&&i.weapon.rarity==='uncommon'));
const count=b.meta.stash.length;b.briarSync();ok('reward cannot repeat',b.meta.stash.length===count);
Object.assign(p,{x:900,z:-1670,y:200});for(const q of G.cliffs.ridgeSteps)walk(q[0],q[1],true,q[2]);ok('ridge reached at shard height',p.y>=390);ok('upper shard collectible',b.takeWorldRiftShard('HP-02')==='collected'||G.pendingRiftShards?.found.includes('HP-02'));
Object.assign(p,{x:-850,z:-1230,y:0});for(const q of G.cliffs.walks.cloth)walk(q[0],q[1]);Object.assign(p,{x:-1770,z:-1630,y:0});b.takeWorldRiftShard('HP-01');ok('two distinct physical shards remain unbanked',G.pendingRiftShards.found.length===2&&!b.meta.riftShards.length);
for(const n of G.cliffs.code)act('hp.code.'+n);act('hp.code.claim');ok('code chest grants once',G.storyState.flags['hp.code.claimed']);
return {checks,walks,errors:[],code:G.cliffs.code,counts:__world3d().counts};});
await page.evaluate(()=>{Object.assign(__BF3.G.p,{x:850,z:-1500,y:200});});await page.waitForTimeout(650);await page.screenshot({path:'output/playwright/winding-cliffs-route.png'});
if(errors.length||result.walks.some(w=>!w.ok))throw Error(JSON.stringify({errors,failedWalks:result.walks.filter(w=>!w.ok)}));return {...result,walks:undefined,waypoints:result.walks.length,failedWalks:result.walks.filter(w=>!w.ok),errors};
}
