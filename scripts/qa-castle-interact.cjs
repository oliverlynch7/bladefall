async page=>{
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.meta.tutOff=true;b.meta.camMode='far';for(const e of b.G.enemies)e.dead=true;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Castle Gates');
 const move=async key=>{await page.evaluate(key=>{const b=__BF3,G=b.G,o=G.storyObjects.find(o=>o.key==='cg.'+key);Object.assign(G.p,{x:o.x,z:o.z,y:o.y,vx:0,vy:0,vz:0,onGround:true});},key);await page.waitForTimeout(100);};
 await move('bridge');await page.keyboard.press('e');await page.waitForTimeout(100);
 if(await page.evaluate(()=>!!__BF3.G.storyState.flags['cg.bridge.open']))throw Error('wheel bypasses brake');
 await move('catch.west');await page.keyboard.press('e');await page.waitForTimeout(100);
 if(!await page.evaluate(()=>!!__BF3.G.storyState.flags['cg.catch.west']))throw Error('E did not release drain brake');
 await move('bridge');await page.keyboard.press('e');await page.waitForTimeout(100);
 if(!await page.evaluate(()=>!!__BF3.G.storyState.flags['cg.bridge.open']))throw Error('E did not lower bridge');
 return {checks:['early E blocked','brake E opens return walkway','wheel E lowers bridge']};
}
