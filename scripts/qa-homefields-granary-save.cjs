async page=>{
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local QA only');
await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(0);b.meta.camMode='far';b.meta.tutOff=true;for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;Object.assign(b.G.p,{x:350,z:750,y:0})});
await page.waitForFunction(()=>!BF_LOADING.active);await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(1400);await page.screenshot({path:'public/3d/art-previews/briar-story/village.png'});
await page.evaluate(()=>Object.assign(__BF3.G.p,{x:1150,z:245,y:0}));await page.waitForTimeout(1200);await page.screenshot({path:'public/3d/art-previews/briar-story/granary.png'});
const checks=await page.evaluate(()=>{const b=__BF3;const initial=b.meta.gold;const apply=key=>{const o=b.G.storyObjects.find(o=>o.key==='home.grain.'+key);Object.assign(b.G.p,{x:o.x,y:0,z:o.z});b.briarRequest('world',{key:o.key})};apply('weight.0');apply('weight.2');apply('cache');b.autosaveRun();const saved=JSON.parse(localStorage.getItem(b.MKEY('rl')));return {initial,provisionalGold:b.meta.gold,savedGold:saved.gold}});
if(checks.savedGold!==checks.initial||checks.provisionalGold<=checks.initial)throw Error(JSON.stringify(checks));
await page.reload();await page.waitForFunction(()=>window.__BF3);await page.evaluate(async()=>{await __BF3.briarReady;__BF3.loadMode('rl');__BF3.continueRun()});
if(!await page.evaluate(()=>!__BF3.G.granary.open&&__BF3.G.walls.some(w=>w.grainDoor)))throw Error('Unfinished gate leaked into reload');
await page.evaluate(()=>{const b=__BF3;for(const key of ['weight.0','weight.2','cache']){const o=b.G.storyObjects.find(o=>o.key==='home.grain.'+key);Object.assign(b.G.p,{x:o.x,z:o.z,y:0});b.briarRequest('world',{key:o.key})}b.nextArea();b.openPause()});
await page.reload();await page.waitForFunction(()=>window.__BF3);await page.evaluate(()=>{__BF3.loadMode('rl');__BF3.continueRun();__BF3.openPause()});
if(!await page.evaluate(()=>__BF3.G.area===1&&__BF3.G.storyState.flags['home.grain.open']&&__BF3.G.storyClaims['home.grain.cache']))throw Error('Completed puzzle did not bank');
return {checks,rollback:true,banked:true,images:2};
}
