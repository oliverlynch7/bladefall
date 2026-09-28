async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);const seed=await page.evaluate(()=>localStorage.getItem(__BF3.MKEY('rl')));
 const browser=page.context().browser(),contexts=[],pages=[];try{
 for(const [name,level] of [['Host Audit',13],['Guest Audit',7]]){const ctx=await browser.newContext();contexts.push(ctx);const p=await ctx.newPage();pages.push(p);await p.addInitScript(({seed,name,level})=>{if(!localStorage.getItem('qaSeed')){const v=JSON.parse(seed);v.heroName=name;v.hero.level=level;v.run=null;v.bank=null;localStorage.setItem('bladefall3d_rl',JSON.stringify(v));localStorage.setItem('bladefall3d_global',JSON.stringify({introSeen:true,originSeen:true,hubTutDone:true,tutOff:true}));localStorage.setItem('qaSeed','1');}},{seed,name,level});await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.openHub();b.openPause();});}
 const [host,guest]=pages;await host.locator('#multiplayerBtnP').click();await host.locator('#mpHost').click();
 await host.waitForFunction(()=>__BF3.MP.active||!!document.getElementById('partyRetry'),null,{timeout:45000});
 if(!await host.evaluate(()=>__BF3.MP.active))return {transport:'native PeerJS',available:false,reason:await host.locator('#ovcard').innerText()};
 const code=await host.evaluate(()=>__BF3.MP.code);await guest.locator('#multiplayerBtnP').click();await guest.locator('#mpJoinCode').fill(code);await guest.locator('#mpJoin').click();await guest.waitForFunction(()=>__BF3.MP.active||!!document.getElementById('partyRetry'),null,{timeout:45000});
 if(!await guest.evaluate(()=>__BF3.MP.active))return {transport:'native PeerJS',available:false,hostOpened:true,reason:await guest.locator('#ovcard').innerText()};
 await host.waitForFunction(()=>Object.keys(__BF3.MP.peers).length===1);await host.evaluate(()=>__BF3.enterZone(0));await guest.waitForFunction(()=>!__BF3.G.hub&&__BF3.G.zone===0,null,{timeout:20000});
 const players=await Promise.all(pages.map(p=>p.evaluate(()=>({name:__BF3.meta.heroName,level:__BF3.G.p.level,zone:__BF3.G.zone,active:__BF3.MP.active}))));if(players[0].level!==13||players[1].level!==7)throw Error('character replaced');
 await guest.reload();await guest.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await host.waitForFunction(()=>Object.keys(__BF3.MP.peers).length===0);
 await guest.locator('#tbegin').click();await guest.locator('#mmMP').click();await guest.locator('#mpJoinCode').fill(code);await guest.locator('#mpJoin').click();await guest.locator('[data-party-save]').first().click();await guest.waitForFunction(()=>__BF3.MP.active&&!__BF3.G.hub&&__BF3.G.zone===0,null,{timeout:45000});
 if(await guest.evaluate(()=>__BF3.G.p.level)!==7)throw Error('reload/rejoin lost level');
 await host.evaluate(()=>__BF3.MP.leave('Test room closed'));await guest.waitForFunction(()=>!__BF3.MP.active);const saved=await guest.evaluate(()=>{__BF3.autosaveRun();return JSON.parse(localStorage.getItem(__BF3.MKEY('rl')));});if(saved.heroName!=='Guest Audit'||saved.hero.level!==7)throw Error('disconnect save changed character');
 return {transport:'native PeerJS',available:true,players,guestFollowsHostToBriar:true,hostDisconnectHandled:true,guestSavePreserved:true,guestReloadAndTitleRejoin:true};
 }finally{for(const p of pages)try{await p.evaluate(()=>__BF3.MP.leave());}catch{}for(const ctx of contexts)await ctx.close();}
}
