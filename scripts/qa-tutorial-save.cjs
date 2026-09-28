async page=>{
 const browser=page.context().browser(),results=[];
 for(const scenario of [{old:true,skip:false,slot:0},{old:false,skip:false,slot:0},{old:false,skip:true,slot:1}]){
 const ctx=await browser.newContext(),p=await ctx.newPage();try{
 await p.addInitScript(({slot})=>{localStorage.setItem('bf3_slot',String(slot));sessionStorage.setItem('bf3_upd','2.052.0-tutorial-save');},scenario);
 const url='http://127.0.0.1:4331/3d/'+(scenario.old?'_qa-prechange.html':'')+'?mute=1';await p.goto(url);await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await p.locator('#tbegin').click();await p.locator('#mmNew').click();await p.locator('#openingSkip').click();await p.locator('#ccName').fill('Tutorial Tester');await p.locator('[data-cls="ranger"]').click();await p.locator('#ccBegin').click();
 await p.waitForFunction(()=>__BF3.G?.trial==='ranger');
 if(scenario.skip){await p.locator('#tutSkip').click();await p.locator('#skipYes').click();}
 else{await p.locator('#tutGo').click();await p.evaluate(()=>__BF3.trialComplete());}
 const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem(__BF3.MKEY('rl'))||'null'));
 if(scenario.old){if(stored?.trialsDone?.ranger)throw Error('old bug not reproduced');results.push({scenario,bugReproduced:!stored});continue;}
 if(!stored?.trialsDone?.ranger||!stored.classUnlocked.ranger||!stored.hero?.gear||stored.heroName!=='Tutorial Tester'||stored.classId!=='ranger')throw Error('completion not durable');
 if(!scenario.skip)await p.locator('#hubBtn').click();
 if(await p.locator('#storyskip').isVisible())await p.locator('#storyskip').click();
 await p.waitForFunction(()=>__BF3.G?.hub);await p.evaluate(()=>__BF3.openPause());await p.locator('#titleBtnP').click();
 await p.locator('#tbegin').click();await p.locator('#mmCont').click();if(await p.locator('[data-d="normal"]').isVisible())await p.locator('[data-d="normal"]').click();await p.waitForFunction(()=>__BF3.G?.hub&&!document.getElementById('ccBegin'));
 await p.reload();await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.locator('#tbegin').click();await p.locator('#mmCont').click();if(await p.locator('[data-d="normal"]').isVisible())await p.locator('[data-d="normal"]').click();await p.waitForFunction(()=>__BF3.G?.hub);
 const loaded=await p.evaluate(()=>({cls:__BF3.meta.classId,name:__BF3.meta.heroName,complete:__BF3.meta.trialsDone.ranger,hub:__BF3.G.hub,other:__BF3.slotSummary(__BF3.SLOT===0?1:0).empty}));if(!loaded.complete||loaded.cls!=='ranger'||!loaded.other)throw Error(JSON.stringify(loaded));results.push({scenario,loaded});
 }finally{await ctx.close();}}
 return results;
}
