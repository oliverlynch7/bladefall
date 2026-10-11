async parent=>{
  const checks=[],errors=[],ok=(name,pass)=>{if(!pass)throw Error(name);checks.push(name);};
  const context=await parent.context().browser().newContext(),page=await context.newPage(),guest=await context.newPage();
  page.on('pageerror',e=>errors.push('host: '+e.message));
  guest.on('pageerror',e=>errors.push('guest: '+e.message));
  try{
    for(const p of [page,guest]){
      await p.goto('http://127.0.0.1:4331/3d/?mute=1');
      await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&window.BFReturnVisits&&window.BFController);
      await p.evaluate(async()=>{
        const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
        b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;
        b.meta.zoneDone={keep:true};b.meta.returnVisits={supplies:'accepted'};b.openHub();
        window.qaPackets=[];document.body.classList.remove('t-attract','t-title');
      });
    }
    await page.evaluate(()=>{
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
      for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);
      for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);
    }};
    await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));
    await flush();
    await page.evaluate(()=>__BF3.enterZone(2));
    await flush();
    for(const p of [page,guest])await p.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.storyObjects?.some(o=>o.key==='rv.supplies.release'));
    ok('both see suspended food',await page.evaluate(()=>!__BF3.G.returnSupply.open)&&await guest.evaluate(()=>!__BF3.G.returnSupply.open));
    const act=async(p,key,y)=>{
      await p.evaluate(({key,y})=>{
        const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='rv.supplies.'+key);
        Object.assign(b.G.p,{x:o.x,z:o.z,y:y??o.y});
        if(!b.MP.isHost)b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});
        b.briarRequest('world',{key:o.key});
      },{key,y});
      await flush();
    };
    await act(guest,'release',80);
    ok('guest floor spoof rejected',await page.evaluate(()=>!__BF3.G.returnSupply.open)&&await guest.evaluate(()=>!__BF3.G.returnSupply.open));
    await act(guest,'release');
    ok('guest upper release shared with host',await page.evaluate(()=>__BF3.G.returnSupply.open)&&await guest.evaluate(()=>__BF3.G.returnSupply.open));
    await act(guest,'take');
    ok('each save secures supplies once',await page.evaluate(()=>__BF3.meta.returnVisits.supplies==='ready')&&await guest.evaluate(()=>__BF3.meta.returnVisits.supplies==='ready'));
    const packet=await page.evaluate(()=>__BF3.briarPacket());
    await guest.evaluate(p=>{__BF3.briarApply(p);__BF3.briarApply(p);},packet);
    ok('replayed packet preserves ready status',await guest.evaluate(()=>__BF3.meta.returnVisits.supplies==='ready'));
    if(errors.length)throw Error(errors.join('; '));
    return {checks,errors};
  }finally{
    await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];__BF3.openHub();});
    await context.close();
  }
}
