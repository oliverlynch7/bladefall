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

 await host.waitForFunction(()=>!window.BF_LOADING?.active);await guest.waitForFunction(()=>!window.BF_LOADING?.active);
 for(let i=0;i<15;i++){await host.evaluate(()=>__BF3.update(.05));await guest.evaluate(()=>__BF3.update(.05));await host.waitForTimeout(80);}
 const roles=await Promise.all(pages.map(p=>p.evaluate(()=>__BF3.G.enemies.filter(e=>e.briarRole).map(e=>({mid:e.mid,role:e.briarRole,h:e.h,color:e.color})))));
 if(roles[0].length<5||JSON.stringify(roles[0])!==JSON.stringify(roles[1]))throw Error('role sync mismatch '+JSON.stringify(roles));
 const mid=await host.evaluate(()=>{const b=__BF3,G=b.G,e=G.enemies.find(e=>e.briarRole==='hex');for(const q of G.enemies)q.stunT=q===e?0:999;Object.assign(G.p,{x:e.x+250,z:e.z,y:e.y,hp:10000,maxHp:10000,invuln:999});Object.assign(e,{active:true,dropT:0,ceState:'hunt',ceClock:0});return e.mid;});
 await guest.evaluate(mid=>{const b=__BF3,e=b.MP.byMid(mid);Object.assign(b.G.p,{x:e.x+260,z:e.z,y:e.y,hp:10000,maxHp:10000,invuln:999});},mid);
 const phases=new Set();for(let i=0;i<55;i++){await host.evaluate(()=>__BF3.update(.05));await guest.evaluate(()=>__BF3.update(.05));phases.add(await guest.evaluate(mid=>__BF3.MP.byMid(mid)?.ceState,mid));await guest.waitForTimeout(100);}
 if(!phases.has('wind')||!phases.has('strike')||!phases.has('recover'))throw Error('missing remote phases '+JSON.stringify([...phases]));
 return {transport:'native PeerJS',available:true,players,rolesMatched:roles[0].length,remotePhases:[...phases]};

 }finally{for(const p of pages)try{await p.evaluate(()=>__BF3.MP.leave());}catch{}for(const ctx of contexts)await ctx.close();}
}
