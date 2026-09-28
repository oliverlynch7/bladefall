async page=>{
 const context=await page.context().browser().newContext(),guest=await context.newPage(),errors=[],checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};for(const p of [page,guest])p.on('pageerror',e=>errors.push(e.message));
 try{
 for(const p of [page,guest]){await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;b.meta.classes.warrior={rank:10,xp:0,v2:1,ch:{}};b.openHub();window.qaPackets=[];window.qaAct=k=>{const o=b.G.storyObjects.find(o=>o.key==='tc.'+k);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});};window.qaTalk=(npc,choices)=>{const o=b.G.storyNpcs.find(o=>o.id===npc);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('open',{npc});for(const choice of choices)b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');};});}
 await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
 await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
 const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
 await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();await page.evaluate(()=>__BF3.enterZone(4));await flush();
 await page.evaluate(()=>{const b=__BF3;b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;});
 await guest.evaluate(()=>qaPackets.push({t:'pos',p:__BF3.MP.selfState()}));await flush();
 await page.evaluate(()=>{__BF3.syncCampaignPartyHealth();__BF3.MP.broadcast();});await flush();
 const host=await page.evaluate(()=>({mul:__BF3.partyHpMul(),hp:__BF3.G.enemies.map(e=>[e.hp,e.maxHp])})),mirror=await guest.evaluate(()=>__BF3.G.enemies.map(e=>[e.hp,e.maxHp]));
 ok('two player health multiplier',host.mul===1.6);ok('guest receives authoritative health',JSON.stringify(host.hp)===JSON.stringify(mirror));
 if(errors.length)throw Error(errors.join(';'));return {checks,enemies:host.hp.length,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
