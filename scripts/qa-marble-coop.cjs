async page=>{
 const context=await page.context().browser().newContext(),guest=await context.newPage(),errors=[],checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};for(const p of [page,guest])p.on('pageerror',e=>errors.push(e.message));
 try{
 for(const p of [page,guest]){await (await p.context().newCDPSession(p)).send('Network.setCacheDisabled',{cacheDisabled:true});await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;b.meta.classes.warrior={rank:10,xp:0,v2:1,ch:{}};b.openHub();window.qaPackets=[];window.qaAct=k=>{const o=b.G.storyObjects.find(o=>o.key==='mc.'+k);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});};window.qaTalk=(npc,choices)=>{const o=b.G.storyNpcs.find(o=>o.id===npc);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('open',{npc});for(const choice of choices)b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');};});}
 await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
 await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
 const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
 await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();await page.evaluate(()=>{const b=__BF3;b.enterZone(6);b.G.area=-1;b.loadArea();b.MP.onEnter(6);});await flush();for(const p of [page,guest]){await p.waitForFunction(()=>__BF3.G.marbleArena&&!BF_LOADING.active);await p.evaluate(()=>{__BF3.G.p.invuln=999;__BF3.G.p.level=50;});}




 await page.evaluate(()=>{__BF3.G.boss.mcClock=999;});
 await guest.evaluate(()=>{const b=__BF3,o=b.G.storyObjects[1];Object.assign(b.G.p,{x:o.x,z:o.z,y:0});qaPackets.push({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key:o.key});});await flush();ok('guest screen turn authoritative',await page.evaluate(()=>__BF3.G.boss.mcScreens[1]===1));
 await page.evaluate(()=>{const b=__BF3,e=b.G.boss;Object.assign(b.G.p,{x:650,z:0,y:0});e.mcClock=0;e.mcBeat=0;e.mcState='recover';for(let i=0;i<150;i++)b.update(.016);b.MP.broadcast();});await flush();ok('exposure and attack state shared',await guest.evaluate(()=>__BF3.G.boss.mcExposed>0&&__BF3.G.boss.mcUsed[1]===1));
 await page.evaluate(()=>{const b=__BF3;b.G.boss.mcExposed=30;b.hitEnemy(b.G.boss,999999,b.G.p,0,0);b.update(.016);b.MP.broadcast();});await flush();ok('shared victory opens chamber but not campaign exit',await guest.evaluate(()=>__BF3.G.storyState.flags['mc.defeated']&&!__BF3.G.portal&&__BF3.G.storyNpcs.some(n=>n.id==='sunspire_orb')));
 await guest.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:0,z:-1730,y:220});qaPackets.push({t:'pos',p:b.MP.selfState()});b.briarRequest('open',{npc:'sunspire_orb'});});await flush();ok('guest-owned orb conversation pauses host',await page.evaluate(()=>__BF3.mode==='npc'&&__BF3.G.storyState.conversation.npc==='sunspire_orb'));
 await page.evaluate(()=>__BF3.briarRequest('choose',{line:__BF3.G.storyState.conversation.node,choice:'ask'}));await flush();ok('non-owner cannot choose',await page.evaluate(()=>__BF3.G.storyState.conversation.node==='mc.orb.hello'));
 for(const choice of ['ask','listen','listen','remember']){await guest.evaluate(choice=>__BF3.briarRequest('choose',{line:__BF3.G.storyState.conversation.node,choice}),choice);await flush();if(choice==='ask')ok('soul vision shared',await page.evaluate(()=>__BF3.G.storyState.conversation.node==='mc.orb.souls'));}
 await guest.evaluate(()=>__BF3.briarRequest('close'));await flush();ok('answer and exit shared',await page.evaluate(()=>__BF3.G.storyState.flags['mc.answer']&&!!__BF3.G.portal&&__BF3.mode==='play'));
 if(errors.length)throw Error(errors.join(';'));return {checks,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
