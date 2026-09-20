async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test only');
 await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D.ready);await page.setViewportSize({width:1280,height:800});
 await page.evaluate(async()=>{await __BF3.briarReady;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.meta.introSeen=true;b.meta.soundOn=false;b.openHub();b.enterZone(0);b.G.p.invuln=999;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__npcArtStats?.ids.includes('thomas')&&__npcArtStats?.ids.includes('mara'));
 const talk=async id=>{await page.evaluate(id=>{const b=__BF3,n=b.G.storyNpcs.find(n=>n.id===id);Object.assign(b.G.p,{x:n.x+60,z:n.z+60,y:n.y});b.updateInteract();b.doInteract();},id);await page.locator('#hubReveal').click();await page.waitForTimeout(600)};
 await talk('thomas');await page.screenshot({path:'public/3d/art-previews/briar-story/thomas.png'});
 await page.getByRole('button',{name:'Someone has to keep them away from home.',exact:true}).click();await page.locator('#hubReveal').click();await page.waitForTimeout(300);await page.evaluate(()=>{const b=__BF3;b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice:'prepare'});});await page.keyboard.press('Escape');
 await talk('mara');await page.screenshot({path:'public/3d/art-previews/briar-story/mara.png'});
 await page.evaluate(()=>{const b=__BF3;for(const choice of ['help','accept'])b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');for(const key of ['briar.root.1','briar.root.2','briar.root.3','briar.dressings']){const o=b.G.storyObjects.find(o=>o.key===key);Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});b.briarRequest('world',{key});}const n=b.G.storyNpcs[1];Object.assign(b.G.p,{x:n.x+60,y:0,z:n.z+60});b.briarRequest('open',{npc:'mara'});b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice:'deliver'});});
 await page.setViewportSize({width:390,height:844});await page.locator('#hubReveal').click();await page.waitForTimeout(600);await page.screenshot({path:'public/3d/art-previews/briar-story/phone.png'});
 await page.keyboard.press('Escape');await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>{__BF3.meta.camMode='far';Object.assign(__BF3.G.p,{x:-140,y:0,z:110});__BF3.G.p.invuln=999;});await page.waitForTimeout(1800);await page.screenshot({path:'public/3d/art-previews/briar-story/healing.png'});
 return {error:await page.evaluate(()=>HERO3D.err),images:4};
}
