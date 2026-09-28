async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);const seed=await page.evaluate(()=>localStorage.getItem(__BF3.MKEY('rl')));if(!JSON.parse(seed)?.hero?.gear)throw Error('fixture missing');const results=[];
 for(const target of [0,1,2]){
 const ctx=await page.context().browser().newContext(),p=await ctx.newPage(),stale=await ctx.newPage();try{
 await ctx.addInitScript(seed=>{if(!localStorage.getItem('qaSeed')){localStorage.setItem('qaSeed','yes');for(let sl=0;sl<3;sl++){const k='bladefall3d_'+(sl?'s'+sl+'_':'');for(const mode of ['rl','hc','hl']){const v=JSON.parse(seed);v.heroName='Hero '+sl;v.gold=123+sl;localStorage.setItem(k+mode,JSON.stringify(v));}localStorage.setItem(k+'global',JSON.stringify({achievements:{firstKill:true},introSeen:true,originSeen:true,hubTutDone:true}));}localStorage.setItem('bladefall3d_v1',JSON.stringify({achievements:{legacy:true}}));}},seed);
 const url='http://127.0.0.1:4331/3d/?mute=1';await p.goto(url);await p.waitForFunction(()=>window.__BF3);
 // Open a second tab on the slot about to be deleted, then leave the deletion tab at slot zero.
 await p.evaluate(target=>localStorage.setItem('bf3_slot',String(target)),target);await stale.goto(url);await stale.waitForFunction(()=>window.__BF3);await stale.evaluate(()=>__BF3.loadMode('rl'));await p.evaluate(()=>localStorage.setItem('bf3_slot','0'));
 const before=await p.evaluate(()=>Object.fromEntries([0,1,2].map(sl=>[sl,localStorage.getItem('bladefall3d_'+(sl?'s'+sl+'_':'')+'rl')])));
 await p.locator('#tbegin').click();await p.locator('#mmLoad').click();await p.locator(`[data-del="${target}"]`).click();await p.locator('#delNo').click();if(await p.evaluate(t=>__BF3.slotSummary(t).empty,target))throw Error('cancel deleted');await p.locator(`[data-del="${target}"]`).click();await p.locator('#delYes').click();if(target===0){await p.waitForLoadState('load');await p.waitForFunction(()=>window.__BF3);}else await p.reload();await p.waitForFunction(()=>window.__BF3);
 await stale.locator('#deletedSaveReload').waitFor();
 await stale.evaluate(()=>{__BF3.meta.gold=99999;__BF3.persist();__BF3.autosaveRun();});
 const after=await p.evaluate(target=>{const k='bladefall3d_'+(target?'s'+target+'_':'');return {empty:__BF3.slotSummary(target).empty,modes:['rl','hc','hl'].map(m=>localStorage.getItem(k+m)),profile:JSON.parse(localStorage.getItem(k+'global')),survivors:Object.fromEntries([0,1,2].filter(s=>s!==target).map(sl=>[sl,localStorage.getItem('bladefall3d_'+(sl?'s'+sl+'_':'')+'rl')]))};},target);
 if(!after.empty||after.modes.some(Boolean)||Object.keys(after.profile.achievements||{}).length||Object.entries(after.survivors).some(([sl,v])=>v!==before[sl]))throw Error(JSON.stringify({target,after}));await p.locator('#tbegin').click();await p.locator('#mmLoad').click();await p.locator(`[data-sel="${target}"]`).click();await p.locator('#openingSkip').click();await p.locator('#ccName').fill('Replacement '+target);await p.locator('#ccBegin').click();await p.locator('#tutSkip').click();await p.locator('#skipYes').click();
 const replacement=await p.evaluate(()=>localStorage.getItem(__BF3.MKEY('rl')));await stale.evaluate(()=>{__BF3.persist();__BF3.autosaveRun();});if(await p.evaluate(()=>localStorage.getItem(__BF3.MKEY('rl')))!==replacement||JSON.parse(replacement).heroName!=='Replacement '+target)throw Error('recreated save overwritten');
 results.push({target,cancelPreserved:true,deletedAllModes:true,emptyAfterReload:true,legacyNotRestored:true,staleTabBlocked:true,staleTabNotified:true,otherSlotsUntouched:true,recreatedSlotSaves:true,staleTabCannotOverwriteReplacement:true});
 }finally{await ctx.close();}}
 return results;
}
