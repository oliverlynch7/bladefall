async parent=>{
  const checks=[],errors=[],ok=(name,pass)=>{if(!pass)throw Error(name);checks.push(name);};
  const context=await parent.context().browser().newContext(),host=await context.newPage(),guest=await context.newPage();
  host.on('pageerror',e=>errors.push('host: '+e.message));
  guest.on('pageerror',e=>errors.push('guest: '+e.message));
  try{
    for(const p of [host,guest]){
      await p.goto('http://127.0.0.1:4331/3d/?mute=1');
      await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&window.BFReturnVisits&&window.BFController);
      await p.evaluate(async()=>{
        const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
        b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;
        b.meta.zoneDone={ember:true};b.meta.returnVisits={pattern:'accepted'};b.openHub();
        window.qaPackets=[];
      });
    }
    await host.evaluate(()=>{
      const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];
      window.qaListeners={};
      m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});
      qaListeners.open();
    });
    await guest.evaluate(()=>{
      const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';
      m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};
    });
    const flush=async()=>{for(let i=0;i<2;i++){
      for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await host.evaluate(d=>qaListeners.data(d),d);
      for(const d of await host.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);
    }};
    await host.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));
    await flush();
    await host.evaluate(()=>__BF3.enterZone(4));await flush();
    for(const p of [host,guest])await p.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.storyObjects?.some(o=>o.key==='rv.pattern.take'));
    ok('both see forge pattern',await host.evaluate(()=>__BF3.G.storyObjects.some(o=>o.key==='rv.pattern.take'))&&await guest.evaluate(()=>__BF3.G.storyObjects.some(o=>o.key==='rv.pattern.take')));
    const act=async key=>{
      await guest.evaluate(key=>{
        const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='rv.pattern.'+key);
        Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});
        b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});
        b.briarRequest('world',{key:o.key});
      },key);
      await flush();
    };
    await act('clamp');
    ok('uncooled clamp stays locked',await host.evaluate(()=>!__BF3.G.storyState.flags['rv.pattern.clamp']));
    await act('cool');await act('clamp');
    ok('guest cool and clamp shared',await host.evaluate(()=>__BF3.G.storyState.flags['rv.pattern.cool']&&__BF3.G.storyState.flags['rv.pattern.clamp'])&&await guest.evaluate(()=>__BF3.G.storyState.flags['rv.pattern.clamp']));
    await act('take');
    ok('both saves secure pattern immediately',await host.evaluate(()=>__BF3.meta.returnVisits.pattern==='ready')&&await guest.evaluate(()=>__BF3.meta.returnVisits.pattern==='ready'));
    const packet=await host.evaluate(()=>__BF3.briarPacket());
    await guest.evaluate(p=>{__BF3.briarApply(p);__BF3.briarApply(p);},packet);
    ok('replayed packet does not unset recovery',await guest.evaluate(()=>__BF3.meta.returnVisits.pattern==='ready'));
    if(errors.length)throw Error(errors.join('; '));
    return {checks,errors};
  }finally{await context.close();}
}
