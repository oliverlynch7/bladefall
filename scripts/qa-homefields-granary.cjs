async page=>{
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local QA saves only');
await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;b.openHub();b.enterZone(0);b.meta.camMode='far';for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;});await page.waitForFunction(()=>!BF_LOADING.active);
const result=await page.evaluate(()=>{const b=__BF3,p=b.G.p,walks=[],checks=[];function walk(x,z,jump=false){let i=0;for(;i<1000;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<16)break;b.input.jx=dx/d;b.input.jz=dz/d;if(jump&&i%30===0)b.input.jumpEdge=true;b.update(.016)}b.input.jx=b.input.jz=0;walks.push({to:[x,z],at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],ok:Math.hypot(x-p.x,z-p.z)<25})}
function world(key){const o=b.G.storyObjects.find(o=>o.key==='home.grain.'+key);if(!o)throw Error('Missing granary object '+key+': '+b.G.storyObjects.filter(o=>o.key?.startsWith('home.grain.')).map(o=>o.key));Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key})}
walk(180,340);walk(650,340);walk(1000,380);walk(1150,270);walk(1260,255);b.briarRequest('world',{key:'home.grain.clue'});checks.push(!!b.G.storyState.notes['home.grain']);
walk(1150,220);walk(960,250,true);walk(960,150,true);walk(960,50,true);walk(960,-55,true);walk(1100,-55,true);walk(1160,-55,true);
checks.push(b.briarInteract()?.label.includes('loft hopper'));Object.assign(p,{x:1160,z:-55,y:0});checks.push(!b.briarInteract()?.label.includes('loft hopper'));
Object.assign(p,{x:1150,z:75,y:0});walk(1150,-95);const start=walks.length;walk(1150,-240);const blocked=walks.pop();checks.push(!blocked.ok&&p.z>-155);
world('hopper');checks.push(b.G.granary.hopper&&!b.G.granary.open&&b.G.granary.spilled);world('spout');checks.push(b.G.granary.open&&!b.G.walls.some(w=>w.grainDoor));
Object.assign(p,{x:1150,z:30,y:0});walk(1150,-260);const gold=b.meta.gold;b.briarRequest('world',{key:'home.grain.cache'});checks.push(b.meta.gold>gold&&b.G.storyClaims['home.grain.cache']);const after=b.meta.gold;b.briarRequest('world',{key:'home.grain.cache'});checks.push(b.meta.gold===after);walk(1150,245);walk(1150,380);walk(1520,380);walk(1550,-350);return {walks,checks,blocked};});
await page.waitForFunction(()=>!BF_LOADING.active);await page.evaluate(()=>Object.assign(__BF3.G.p,{x:1150,z:240,y:0}));await page.waitForTimeout(1000);await page.screenshot({path:'output/playwright/homefields-granary.png'});
if(result.walks.some(w=>!w.ok)||result.checks.some(c=>!c))throw Error(JSON.stringify(result));return result;
}
