// Two isolated browser clients, using the game's real host/guest packet handlers.
async root=>{
 const ctx=await root.context().browser().newContext(),host=await ctx.newPage(),guest=await ctx.newPage(),checks=[],errors=[];
 const ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 try{
 for(const p of [host,guest]){p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4345/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,{run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,autoAttack:false,petActive:null,dialogueTTS:false,classId:'warrior'});b.openHub();window.qaPackets=[];});}
 await host.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
 await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
 const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await host.evaluate(d=>qaListeners.data(d),d);for(const d of await host.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
 await host.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();await host.evaluate(()=>__BF3.enterZone(0));await flush();
 for(const p of [host,guest])await p.waitForFunction(()=>!BF_LOADING.active&&!!__BF3.G.briarMill);
 await host.evaluate(()=>{const b=__BF3;Object.assign(b.G.storyState.flags,{'thomas.ready':true,'mara.healing':true});b.G.storyState.quests['briar.escape']='active';b.briarSync();for(const c of b.MP.conns)c.send({t:'story',story:b.briarPacket()});});await flush();
 for(const p of [host,guest])await p.evaluate(()=>{__BF3.G.p.invuln=9999;for(const e of __BF3.G.enemies)e.stunT=9999;});
 const act=async(p,key,x,z)=>{await p.evaluate(({key,x,z})=>{const b=__BF3;Object.assign(b.G.p,{x,z,y:0,vy:0});if(!b.MP.isHost)b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key});},{key,x,z});await flush();};
 await act(guest,'briar.water',130,-1510);
 ok('guest owns crate on both clients',await host.evaluate(()=>__BF3.G.briarMill.owner==='g')&&await guest.evaluate(()=>__BF3.G.briarMill.owner==='g'));
 await act(host,'briar.water',210,-1600);ok('host cannot steal an occupied crate',await host.evaluate(()=>__BF3.G.briarMill.owner==='g'));
 await act(host,'briar.mill.reset',5,-1730);ok('second player cannot reset occupied crate',await host.evaluate(()=>__BF3.G.briarMill.owner==='g'));
 // Simulate loss of the connection through the same live roster used by the game.
 await host.evaluate(()=>{window.qaConnection=__BF3.MP.conns[0];qaConnection.open=false;__BF3.update(.016);});
 ok('disconnect releases crate ownership',await host.evaluate(()=>!__BF3.G.briarMill.owner));await host.evaluate(()=>qaConnection.open=true);
 await act(guest,'briar.water',130,-1510);
 for(let z=-1530;z>=-1790;z-=20){await guest.evaluate(z=>{const b=__BF3;Object.assign(b.G.p,{x:130,z,y:0});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});},z);await flush();await host.evaluate(()=>__BF3.update(.05));}
 await host.evaluate(()=>{for(let i=0;i<70;i++)__BF3.update(.016);});await flush();
 ok('host accepts guest movement and shares weighted plate',await host.evaluate(()=>__BF3.G.storyState.flags['briar.water']&&__BF3.G.briarMill.z===-1880)&&await guest.evaluate(()=>__BF3.G.storyState.flags['briar.water']&&__BF3.G.briarMill.z===-1880));
 await act(guest,'briar.jam',210,-1740);await act(host,'briar.bridge',0,-2040);await host.evaluate(()=>{for(let i=0;i<105;i++)__BF3.update(.016);});await flush();
 const packet=await host.evaluate(()=>__BF3.briarPacket());await guest.evaluate(p=>__BF3.briarApply(p),packet);
 ok('lowered bridge and collision agree',await host.evaluate(()=>__BF3.G.briarMill.bridge===1&&!__BF3.G.walls.some(w=>w.storyBridge))&&await guest.evaluate(()=>__BF3.G.briarMill.bridge===1&&!__BF3.G.walls.some(w=>w.storyBridge)));
 const before=await guest.evaluate(()=>__BF3.meta.gold);await guest.evaluate(p=>{__BF3.briarApply(p);__BF3.briarApply(p);BFBriarJourney.apply(__BF3.G,{...p.millStatus,run:'stale',x:900});},packet);
 ok('replayed and old-run packets do not reset or pay again',await guest.evaluate(gold=>__BF3.meta.gold===gold&&__BF3.G.briarMill.x===130&&__BF3.G.briarMill.bridge===1,before));
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors,transport:'two-client host/guest handler relay; not a remote internet session'};
 }finally{await ctx.close();}
}
