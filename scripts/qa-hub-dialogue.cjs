async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 const checks=[],ok=(n,t)=>{if(!t)throw Error(n);checks.push(n)};
 await page.route('**/voice-api/game',r=>r.fulfill({json:{lines:{}}}));
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{await BFHubDialogue.ready;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubDialogue={};b.meta.hubTutDone=true;b.meta.classUnlocked.warrior=true;b.meta.introSeen=true;b.meta.zoneDone={};b.openHub()});
 const open=async id=>{await page.evaluate(id=>{const b=__BF3,n=b.G.hubNpcs.find(n=>n.id===id);b.G.p.x=n.x+90;b.G.p.z=n.z+90;b.openNpcTalk(n)},id);await page.waitForSelector('#hubReveal')};
 const reveal=async()=>{await page.locator('#hubReveal').click();await page.waitForTimeout(300)};
 await open('quartermaster');ok('progressive text starts without response buttons',await page.locator('#hubChoices button').count()===0);
 const time=await page.evaluate(()=>__BF3.G.time);await page.evaluate(()=>__BF3.update(.5));ok('conversation pauses local simulation',await page.evaluate(t=>__BF3.G.time===t,time));
 await reveal();await page.getByRole('button',{name:'How can you help me?',exact:true}).click();ok('selected response retained',await page.locator('.hub-dialogue-reply').innerText()==='You: “How can you help me?”');
 await page.keyboard.press('Escape');ok('Escape exits without completing introduction',await page.evaluate(()=>__BF3.mode==='play'&&!__BF3.meta.hubDialogue.quartermaster.introduced&&!BFHubDialogue.active));
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{await BFHubDialogue.ready;__BF3.loadMode('rl');__BF3.openHub()});await open('quartermaster');
 ok('interrupted line survives reload',await page.evaluate(()=>BFHubDialogue.active.lineId==='hub.quartermaster.guide'));await reveal();await page.getByRole('button',{name:'Show me.',exact:true}).click();
 ok('service opens and camera is released',await page.evaluate(()=>__BF3.mode==='menu'&&!BFHubDialogue.focus()&&__BF3.meta.hubDialogue.quartermaster.introduced));
 for(const id of ['anvil','keeper','drillmaster','beastkeeper']){await page.evaluate(()=>__BF3.openHub());await open(id);await reveal();await page.getByRole('button',{name:'How can you help me?',exact:true}).click();await reveal();await page.getByRole('button',{name:'Show me.',exact:true}).click();ok(id+' introduction opens existing service',await page.evaluate(id=>__BF3.meta.hubDialogue[id].introduced&&!BFHubDialogue.active,id))}
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{await BFHubDialogue.ready;__BF3.loadMode('rl');__BF3.openHub();__BF3.openNpcTalk(__BF3.G.hubNpcs.find(n=>n.id==='quartermaster'))});await page.waitForSelector('#hubService');
 ok('completed intro does not replay after reload',await page.locator('#hubReveal').count()===0);ok('news hidden before a campaign victory',await page.locator('#hubNews').count()===0);
 await page.keyboard.press('Escape');await page.evaluate(()=>{__BF3.meta.zoneDone.outskirts=true;__BF3.openNpcTalk(__BF3.G.hubNpcs.find(n=>n.id==='quartermaster'))});await page.waitForSelector('#hubNews');await page.locator('#hubService').click();
 ok('shopping does not consume optional news',await page.evaluate(()=>!__BF3.meta.hubDialogue.quartermaster.newsSeen));
 await page.evaluate(()=>{__BF3.openHub();__BF3.openNpcTalk(__BF3.G.hubNpcs.find(n=>n.id==='quartermaster'))});await page.waitForSelector('#hubNews');await page.locator('#hubNews').click();await reveal();await page.getByRole('button',{name:'Back to services',exact:true}).click();ok('acknowledged news removes marker',await page.locator('#hubNews').count()===0);
 await page.locator('#hubAbout').click();await reveal();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);await page.screenshot({path:'output/playwright/hub-conversation-mobile.png'});
 ok('mobile panel fits width',await page.locator('.hub-dialogue-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1&&e.getBoundingClientRect().right<=innerWidth));
 await page.keyboard.press('Escape');ok('leave clears presentation and restores play',await page.evaluate(()=>__BF3.mode==='play'&&!document.getElementById('hubDialogue')&&!BFHubDialogue.focus()));
 await page.evaluate(()=>__BF3.persist());const context=await page.context().browser().newContext();const other=await context.newPage();await other.goto(page.url());await other.waitForFunction(()=>window.__BF3);ok('new save has no inherited introductions',await other.evaluate(()=>!__BF3.meta.hubDialogue));await context.close();
 return checks;
}
