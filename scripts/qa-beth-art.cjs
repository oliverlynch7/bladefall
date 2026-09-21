async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.openHub();b.meta.petOwned=['shepherd'];b.petEquip('shepherd');b.enterZone(0);b.nextArea();for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;b.meta.camMode='far';b.meta.tutOff=true;Object.assign(b.G.p,{x:1330,z:-760,y:0,yaw:Math.PI});});await page.waitForTimeout(2200);await page.screenshot({path:'public/3d/art-previews/briar-story/beth-trail.png'});
 const stats=await page.evaluate(()=>({pet:__BF3.G.pet?.id,art:window.__companionStats,npcs:window.__npcArtStats}));
 await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:2480,z:-1500,y:0,yaw:Math.PI});});await page.waitForTimeout(1200);await page.screenshot({path:'public/3d/art-previews/briar-story/beth-rescue.png'});
 if(errors.length)throw Error(errors.join(';'));return stats;
}
