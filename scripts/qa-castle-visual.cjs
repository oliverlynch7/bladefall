async page=>{
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.meta.tutOff=true;b.meta.camMode='far';});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Castle Gates');
 await page.evaluate(()=>{const b=__BF3,G=b.G;for(const e of G.enemies)e.dead=true;Object.assign(G.p,{x:-120,z:-2770,y:200,vx:0,vy:0,vz:0,onGround:true,yaw:2.9,invuln:999});G.camYaw=2.9;G.camPitch=.22;});
 await page.waitForTimeout(400);
 await page.screenshot({path:'output/playwright/castle-wheel-near-bank-v3.png'});
 const pre=await page.evaluate(()=>({flags:__BF3.G.storyState.flags,bridgeWall:__BF3.G.walls.some(w=>w.castleTag==='bridge'),planks:__BF3.G.obstacles.filter(o=>o.castleBridgeDeck).length}));
 await page.evaluate(()=>{const b=__BF3,G=b.G;for(const k of ['catch.west','bridge']){const o=G.storyObjects.find(o=>o.key==='cg.'+k);Object.assign(G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});}Object.assign(G.p,{x:-120,z:-2770,y:200,vx:0,vy:0,vz:0,onGround:true,yaw:2.9});G.camYaw=2.9;});
 await page.waitForTimeout(1600);
 await page.screenshot({path:'output/playwright/castle-wheel-lowered-v3.png'});
 const post=await page.evaluate(()=>({flags:__BF3.G.storyState.flags,bridgeWall:__BF3.G.walls.some(w=>w.castleTag==='bridge'),planks:__BF3.G.obstacles.filter(o=>o.castleBridgeDeck).length,bridgeT:__BF3.G.castleGates.bridgeT}));
 return {pre,post};
}
