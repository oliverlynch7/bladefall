async page=>{
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.tutDone=false;b.meta.tutOff=false;b.meta.keybinds.attack=['KeyZ'];b.meta.keybinds.jump=['KeyX'];b.meta.keybinds.interact=['KeyV'];b.startTrial('warrior');});
 const text=await page.locator('#ovcard').innerText();if(!text.includes('Attack: Z')||!text.includes('Jump: X')||!text.includes('Talk / use: V'))throw Error('Stale controls');
 await page.locator('#tutSkip').click();if(!await page.locator('#skipNo').count())throw Error('Skip missing confirmation');await page.locator('#skipNo').click();await page.locator('#tutGo').click();
 await page.evaluate(()=>{const b=__BF3;b.G.enemies.forEach(e=>e.dead=true);b.meta.classes.warrior={rank:2,xp:0,ch:{},v2:1};b.openClassChoice(2);});
 await page.waitForTimeout(600);await page.locator('.c2opt').first().click();
 if(await page.evaluate(()=>!!__BF3.meta.classes.warrior.ch[2]))throw Error('Committed before review');
 await page.keyboard.press('j');if(await page.evaluate(()=>!!__BF3.meta.classes.warrior.ch[2]))throw Error('Attack key confirmed');
 await page.locator('#classChoiceBack').click();await page.waitForTimeout(600);await page.locator('.c2opt').last().click();await page.screenshot({path:'output/playwright/first-steps-choice.png'});await page.waitForTimeout(600);await page.locator('#classChoiceConfirm').click();
 if(!await page.evaluate(()=>!!__BF3.meta.classes.warrior.ch[2]))throw Error('Confirm failed');
 await page.evaluate(()=>__BF3.openPause());await page.locator('#helpBtn').click();await page.locator('#helpSearch').fill('healing');if(!await page.locator('#helpResults').innerText().then(t=>t.includes('Healing pads')&&!t.includes('The Forge')))throw Error('Search failed');await page.locator('#helpSearch').fill('nonsensezz');if(!await page.locator('#helpResults').innerText().then(t=>t.includes('No matching')))throw Error('Missing empty state');await page.locator('#helpSearch').fill('clue');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/playwright/first-steps-help-phone.png'});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow');
 if(errors.length)throw Error(errors.join('\n'));return {reboundControls:true,skipConfirmation:true,choiceReviewAndCancel:true,attackKeyDoesNotConfirm:true,helpSearch:true,phoneOverflow:false};
}
