async page=>{
await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);b.meta.camMode='far';b.meta.tutOff=true;for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;});await page.waitForFunction(()=>__world3d().counts.hollowArt&&!BF_LOADING.active);await page.waitForTimeout(500);
const out='public/3d/art-previews/briar-story/';
await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:0,z:-2470,y:0});b.G.camYaw=3.4;b.G.stageBanner=0;document.getElementById('toast')?.classList.remove('show');});await page.waitForTimeout(800);await page.screenshot({path:out+'cliffs-freight-bridge.png'});
await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:790,z:-1170,y:150});b.G.camYaw=2.6;});await page.waitForTimeout(800);await page.screenshot({path:out+'cliffs-upper-route.png'});
await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:895,z:-1080,y:150});b.briarRequest('open',{npc:'skip'});document.getElementById('hubReveal')?.click();});await page.waitForTimeout(650);await page.screenshot({path:out+'skip-dialogue.png'});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:out+'skip-phone.png'});
const phone=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,line:BFHubDialogue.active?.lineId}));await page.setViewportSize({width:1440,height:900});await page.keyboard.press('Escape');
await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-100,z:290,y:0});b.briarRequest('open',{npc:'caleb'});document.getElementById('hubReveal')?.click();});await page.waitForTimeout(550);await page.screenshot({path:out+'caleb-dialogue.png'});
if(phone.width!==phone.scroll)throw Error(JSON.stringify(phone));return phone;
}
