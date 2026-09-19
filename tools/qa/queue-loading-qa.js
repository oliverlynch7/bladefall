async(page)=>{
 let intercepted=0;await page.route('**/hub-assets/waystation-kit.glb',async route=>{intercepted++;await page.waitForTimeout(2200);await route.continue();});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&queue=cold1981s');await page.waitForFunction(()=>window.HERO3D?.ready);
 await page.evaluate(()=>{__BF3.loadMode('rl');__BF3.meta.bank=null;__BF3.meta.introSeen=true;__BF3.enterHub();});
 await page.waitForTimeout(250);const during=await page.evaluate(()=>({active:BF_LOADING.active,time:__BF3.G.time,ready:__world3d().ready}));
 await page.waitForTimeout(450);const later=await page.evaluate(()=>({active:BF_LOADING.active,time:__BF3.G.time}));
 if(!during.active||!later.active||during.time!==later.time)throw Error('Loading did not protect simulation '+JSON.stringify({during,later}));
 await page.waitForFunction(()=>!BF_LOADING.active,{},{timeout:15000});const after=await page.evaluate(()=>({ready:__world3d().ready,err:HERO3D.err}));await page.unroute('**/hub-assets/waystation-kit.glb');return {intercepted,during,later,after};
}
