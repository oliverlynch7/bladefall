async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{__BF3.loadMode('rl');__BF3.meta.heroName='';__BF3.openCharCreate();});
 await page.locator('#ccBegin').click();if(!await page.locator('#ccNameError').innerText())throw Error('No name guidance');
 await page.locator('#ccName').fill('Rowan Test');
 const results=[];
 for(const [cls,model,weapon] of [['warrior','Warrior','Rusty Sword'],['ranger','Rogue','Cracked Shortbow'],['mage','Wizard','Splintered Staff']]){
  await page.locator('[data-cls='+cls+']').click();await page.locator('#ccFull').click();await page.waitForTimeout(1400);
  const state=await page.evaluate(()=>__creatorPreviewState);
  if(!await page.locator('.ccweapon').innerText().then(t=>t.includes(weapon)))throw Error('Wrong weapon');
  if(await page.locator('#ccName').inputValue()!=='Rowan Test')throw Error('Name lost');
  results.push(state);await page.screenshot({path:'output/playwright/creator-'+cls+'.png'});
 }
 await page.getByRole('button',{name:'Green eyes',exact:true}).click();await page.waitForTimeout(600);
 if((await page.evaluate(()=>__creatorPreviewState.eye))!=='#4be08a')throw Error('Eye selection lost');
 await page.setViewportSize({width:390,height:844});await page.locator('#ccFull').click();await page.waitForTimeout(500);
 const overflow=await page.evaluate(()=>({body:document.documentElement.scrollWidth>innerWidth+1,card:document.querySelector('.cc').scrollWidth>document.querySelector('.cc').clientWidth+1}));
 if(overflow.body||overflow.card)throw Error('Phone overflow '+JSON.stringify(overflow));
 await page.locator('#ccPrev').scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/creator-phone.png'});
 await page.locator('#ccBegin').click();await page.waitForTimeout(600);
 const saved=await page.evaluate(()=>({name:__BF3.meta.heroName,eye:__BF3.meta.eyeColor,cls:__BF3.meta.classId}));
 if(saved.name!=='Rowan Test'||saved.eye!=='#4be08a'||saved.cls!=='mage')throw Error('Tutorial selection lost '+JSON.stringify(saved));
 await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const restored=await page.evaluate(()=>{__BF3.loadMode('rl');return {name:__BF3.meta.heroName,eye:__BF3.meta.eyeColor};});
 if(restored.name!==saved.name||restored.eye!==saved.eye)throw Error('Persistence failed');
 if(errors.length)throw Error(errors.join('\n'));
 return {results,overflow,saved,restored};
}
