async page=>{
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.run=null;b.meta.bank=null;b.meta.chestRecords={};b.meta.stash=[];b.meta.camMode='shoulder';b.openHub();b.G.chests=BFChestRules.order.map((rarity,i)=>({x:(i-2)*65,z:345,y:0,rarity,opened:false,bob:0}));b.G.camPitch=.5;});
 for(let i=0;i<30;i++){await page.evaluate(()=>{__BF3.update(.016);__BF3.renderFrame()});await page.waitForTimeout(50);}
 const closed=await page.evaluate(()=>__prop3dPoses());await page.evaluate(()=>__BF3.openChest(__BF3.G.chests[4]));await page.waitForTimeout(400);
 for(let i=0;i<20;i++){await page.evaluate(()=>{__BF3.update(.016);__BF3.renderFrame()});await page.waitForTimeout(20);}
 const middle=await page.evaluate(()=>__prop3dPoses()[4]);
 for(let i=0;i<45;i++){await page.evaluate(()=>{__BF3.update(.016);__BF3.renderFrame()});await page.waitForTimeout(20);}
 const opened=await page.evaluate(()=>__prop3dPoses()[4]);await page.keyboard.press('e');await page.keyboard.press('e');await page.screenshot({path:'output/playwright/chest-lid-open.png'});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{__BF3.meta.reduceMotion=true;__BF3.openChest(__BF3.G.chests[2]);__BF3.renderFrame();});for(let i=0;i<12;i++){await page.evaluate(()=>__BF3.renderFrame());await page.waitForTimeout(30);}await page.screenshot({path:'output/playwright/chest-mobile-reveal.png'});
 const mobile=await page.locator('#chest-reveal').evaluate(e=>({width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left,settled:e.classList.contains('settled')}));
 if(!mobile.settled||mobile.left<0||mobile.width>390)throw Error('Mobile/reduced motion');if(!(middle.opening>0&&opened.opening===1&&opened.lidAngle<-1.8))throw Error('Lid failed '+JSON.stringify({middle,opened}));
 await page.keyboard.press('e');if(await page.locator('#chest-reveal').count())throw Error('E failed');await page.setViewportSize({width:1280,height:720});return {closed,middle,opened,mobile};
}
