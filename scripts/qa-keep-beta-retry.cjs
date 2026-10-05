async page=>{
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:4338/3d/?devkeep=1&mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});await page.locator('#kstart').click();
 const result=await page.evaluate(()=>{const b=__BF3,g=b.G,s=g.devKeep,p=g.p,check=(v,m)=>{if(!v)throw Error(m);};for(const e of g.enemies)e.dead=true;
 Object.assign(p,{x:70,z:-175,y:0});b.updateInteract();b.doInteract();s.snag=true;Object.assign(p,{x:s.actors[0].x,z:s.actors[0].z,y:0});b.updateInteract();b.doInteract();document.getElementById('kb0').click();const startHp=p.hp,startingGold=b.meta.gold;
 const e=b.spawnEnemy('prison_pike',s.actors[1].x,s.actors[1].z+85);e.betaWave=true;e.active=true;e.dropT=0;e.role=null;p.x=380;p.z=-300;p.invuln=999;
 for(let i=0;i<1500&&s.escort!=='failed';i++)b.update(1/60);check(s.hp<100,'Actual strikes never hit captive');
 s.hp=0;b.update(1/60);check(s.escort==='failed','No failure screen');b.meta.gold+=75;p.hp=1;document.getElementById('kb0').click();check(s.escort==='waiting'&&s.snag&&s.cells&&s.hp===100,'Retry state');check(b.G.p.hp===startHp&&b.meta.gold===startingGold,'Retry resources');check(!g.enemies.some(e=>e.betaWave),'Reinforcements not reset');
 b.meta.camMode='far';Object.assign(b.G.p,{x:330,z:-190,y:0});g.cam={x:330,z:-190,y:0};b.renderFrame();return {actualEnemyHits:true,retryRestoresResources:true,puzzlePreserved:true};});await page.screenshot({path:'output/playwright/keep-beta-overview.png'});return result;
}
