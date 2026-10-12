async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(7);b.G.area=1;b.loadArea();b.meta.tutOff=true;b.meta.camMode='shoulder';b.G.camYaw=Math.PI;b.G.camPitch=.14;for(const e of b.G.enemies)e.dead=true;Object.assign(b.G.p,{x:1450,z:-380,y:250,vx:0,vz:0,vy:0,invuln:999});});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Long Ascent');
 await page.waitForTimeout(350);
 await page.screenshot({path:'output/playwright/ascent-vault-closed.png'});
 await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;for(const key of ['la.cells','la.vault.brake']){const o=G.storyObjects.find(q=>q.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key});}Object.assign(p,{x:1450,z:-380,y:250,vx:0,vz:0,vy:0});G.camYaw=Math.PI;G.camPitch=.14;});
 await page.waitForTimeout(1700);
 await page.screenshot({path:'output/playwright/ascent-vault-open.png'});
 return {art:await page.evaluate(()=>__world3d().counts.deepArt),open:await page.evaluate(()=>!!__BF3.G.storyState.flags['la.vault.open'])};
}
