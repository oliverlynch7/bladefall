async page=>{
 if(!page.url().startsWith('http://127.0.0.1:'))throw Error('Local QA only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.meta.riftShards=[];b.enterZone(1);});await page.waitForFunction(()=>!BF_LOADING.active);
 await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-1770,z:-1630,y:0});b.takeWorldRiftShard('HP-01');b.autosaveRun();});await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{await __BF3.briarReady;__BF3.loadMode('rl');__BF3.continueRun();});await page.waitForFunction(()=>!BF_LOADING.active);
 ok('reload loses only unfinished shard and restores part one',await page.evaluate(()=>__BF3.G.zone===1&&__BF3.G.area===0&&!__BF3.meta.riftShards.includes('HP-01')&&!__BF3.G.pendingRiftShards?.found?.length));
 await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-1770,z:-1630,y:0});b.takeWorldRiftShard('HP-01');b.nextArea();});await page.waitForFunction(()=>!BF_LOADING.active);
 ok('half transition banks personal shard',await page.evaluate(()=>__BF3.G.area===1&&__BF3.meta.riftShards.includes('HP-01')&&__BF3.campaignCheckpoint().state.riftShards.includes('HP-01')));
 await page.evaluate(()=>{__BF3.die();});await page.getByRole('button',{name:'Retry this part',exact:true}).click();await page.waitForFunction(()=>!BF_LOADING.active);
 ok('second-half death retains banked shard',await page.evaluate(()=>__BF3.G.area===1&&__BF3.meta.riftShards.includes('HP-01')));
 await page.evaluate(()=>{__BF3.openHub();__BF3.enterZone(1);});await page.waitForFunction(()=>!BF_LOADING.active);
 const gold=await page.evaluate(()=>__BF3.meta.gold);const echo=await page.evaluate(()=>{Object.assign(__BF3.G.p,{x:-1770,z:-1630,y:0});__BF3.takeWorldRiftShard('HP-01');const first=__BF3.meta.gold;__BF3.takeWorldRiftShard('HP-01');return {first,second:__BF3.meta.gold};});
 ok('saved physical shard gives only one gold echo per attempt',echo.first>gold&&echo.second===echo.first);return checks;
}
