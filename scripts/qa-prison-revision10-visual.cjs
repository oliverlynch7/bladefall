async page=>{
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');const g=b.G,q=g.escape.plan.rooms[11];Object.assign(g.p,{x:q.x,y:0,z:q.z+185,invuln:999});g.camYaw=Math.PI;BFPrisonRun.tick(.016);});
 await page.waitForTimeout(850);await page.screenshot({path:'output/playwright/dungeon10-ward.png'});
 const ward=await page.evaluate(()=>({art:window.__world3d?.().counts,room:__BF3.G.escape.states[11],hud:document.getElementById('prisonhud')?.innerText}));
 await page.evaluate(()=>{const g=__BF3.G,q=g.escape.plan.rooms[13];Object.assign(g.p,{x:q.x,y:0,z:q.z+195,invuln:999});g.camYaw=Math.PI;BFPrisonRun.tick(.016);});
 await page.waitForTimeout(850);await page.screenshot({path:'output/playwright/dungeon10-hold.png'});
 const hold=await page.evaluate(()=>({art:window.__world3d?.().counts,hud:document.getElementById('prisonhud')?.innerText}));
 return {ward,hold};
}
