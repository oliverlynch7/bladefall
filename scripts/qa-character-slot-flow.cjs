async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const seed=await page.evaluate(()=>localStorage.getItem(__BF3.MKEY('rl')));if(!JSON.parse(seed)?.hero)throw Error('existing save fixture missing');
 const ctx=await page.context().browser().newContext(),p=await ctx.newPage();try{
 await p.addInitScript(seed=>{if(!sessionStorage.getItem('qaSeeded')){localStorage.setItem('bladefall3d_rl',seed);localStorage.setItem('bladefall3d_global',JSON.stringify({introSeen:true,originSeen:true,hubTutDone:true}));sessionStorage.setItem('qaSeeded','1');}},seed);
 await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.locator('#tbegin').click();await p.locator('#mmNew').click();await p.locator('[data-sel="1"]').click();await p.locator('#openingSkip').click();await p.locator('#ccName').fill('Second Hero');await p.locator('#ccBegin').click();await p.locator('#tutSkip').click();await p.locator('#skipYes').click();if(await p.locator('#storyskip').isVisible())await p.locator('#storyskip').click();await p.waitForFunction(()=>__BF3.G?.hub);
 const saved=await p.evaluate(()=>({slot:__BF3.SLOT,name:__BF3.meta.heroName,original:localStorage.getItem('bladefall3d_rl'),intent:sessionStorage.getItem('bf3_create_after_slot')}));if(saved.slot!==1||saved.name!=='Second Hero'||saved.original!==seed||saved.intent!==null)throw Error('slot save safety');
 await p.evaluate(()=>__BF3.openPause());await p.locator('#titleBtnP').click();await p.locator('#tbegin').click();await p.locator('#mmLoad').click();await p.locator('[data-sel="0"]').click();await p.locator('[data-d="normal"]').click();await p.waitForFunction(()=>__BF3.G?.p&&!__BF3.G.trial);if(await p.evaluate(()=>__BF3.SLOT)!==0)throw Error('resume wrong slot');
 return {newSlotOpensCreation:true,newCharacterSaved:true,previousSaveUntouched:true,intentConsumed:true,existingSlotPlayResumes:true};
 }finally{await ctx.close();}
}
