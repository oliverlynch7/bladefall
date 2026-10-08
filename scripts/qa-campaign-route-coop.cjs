async page => {
  const checks=[], errors=[], context=await page.context().browser().newContext(), guest=await context.newPage();
  const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
  for(const p of [page,guest])p.on('pageerror',e=>errors.push(e.message));
  try{
    for(const p of [page,guest]){
      await p.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2153');
      await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
      await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();window.qaPackets=[];});
    }
    await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
    await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
    const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
    await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));
    await flush();
    const load=async(zone,area=0)=>{
      await page.evaluate(({zone,area})=>{const b=__BF3;b.enterZone(zone);if(area)b.nextArea();},{zone,area});
      for(let attempt=0;attempt<25;attempt++){
        await flush();
        if(await guest.evaluate(({zone,area})=>__BF3.G.zone===zone&&__BF3.G.area===area,{zone,area}))break;
        await page.waitForTimeout(120);
      }
      for(const [i,p] of [page,guest].entries())try{await p.waitForFunction(({zone,area})=>__BF3.G.zone===zone&&__BF3.G.area===area&&!BF_LOADING.active,{zone,area},{timeout:8000});}
      catch(e){throw Error('load '+zone+':'+area+' player '+i+' '+JSON.stringify(await p.evaluate(()=>({zone:__BF3.G?.zone,area:__BF3.G?.area,loading:BF_LOADING.active,packets:qaPackets.length,mode:__BF3.mode}))));}
      await page.evaluate(()=>{__BF3.G.p.invuln=999;for(const e of __BF3.G.enemies)e.stunT=999;});
    };
    const act=async keys=>page.evaluate(keys=>{const b=__BF3,G=b.G;for(const key of keys){const o=G.storyObjects.find(o=>o.key===key);if(!o)throw Error('Missing '+key);Object.assign(G.p,{x:o.x,y:o.y,z:o.z,vy:0});b.briarRequest('world',{key});}},keys);
    await load(3);
    await act(['ff.trail','ff.part','ff.heater']);await flush();
    ok('direct winch repair reaches guest',await guest.evaluate(()=>__BF3.G.storyState.flags['ff.heater']&&__BF3.G.peaks.crossing));
    await load(3,1);
    await page.evaluate(()=>{for(const e of __BF3.G.enemies){e.hp=0;e.dead=true;}});
    await act(['ic.pages','ic.free']);
    await page.evaluate(()=>{const b=__BF3,p=b.G.p,n=b.G.storyNpcs.find(n=>n.id==='ellis');Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:'ellis'});for(const choice of ['press','firm'])b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');});
    await act(['ic.notes','ic.lock.clue','ic.lock.1','ic.lock.1']);await flush();
    ok('raised ice float reaches guest',await guest.evaluate(()=>{const b=__BF3;for(let i=0;i<180;i++)b.update(.016);return b.G.storyState.items['ic.lock.level']===2&&b.G.iceCaves.float.h>180;}));
    await act(['ic.lock.2']);await flush();
    ok('frozen crossing reaches guest',await guest.evaluate(()=>{const b=__BF3;for(let i=0;i<15;i++)b.update(.016);return !!b.G.storyState.flags['ic.lock.frozen']&&b.G.iceCaves.sheet.h>180;}));
    await act(['ic.lock.3']);await flush();
    ok('permanent ice bridge reaches guest',await guest.evaluate(()=>__BF3.G.storyState.flags['ic.lock.open']&&__BF3.G.iceCaves['ic.lock.open']));
    await load(4);
    await page.evaluate(()=>{for(const e of __BF3.G.enemies){e.hp=0;e.dead=true;}const b=__BF3,p=b.G.p,n=b.G.storyNpcs.find(n=>n.id==='flint');Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:'flint'});for(const choice of ['smash','agree','ready'])b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');});
    await act(['ih.workers','ih.handles','ih.cart']);await flush();
    ok('direct cart repair reaches guest',await guest.evaluate(()=>__BF3.G.storyState.flags['ih.cart']&&__BF3.G.iron.cart));
    await load(5);
    await page.evaluate(()=>{const b=__BF3,p=b.G.p,n=b.G.storyNpcs.find(n=>n.id==='otto');Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:'otto'});for(const choice of ['palace','work'])b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');});
    await act(['sc.rudder','sc.fit']);await flush();
    ok('fitted boat part reaches guest',await guest.evaluate(()=>__BF3.G.storyState.flags['sc.installed.rudder']&&__BF3.G.shore.parts[0]));
    await load(2,1);
    await page.evaluate(()=>{for(const e of __BF3.G.enemies){e.hp=0;e.dead=true;}});
    await act(['kd.roster','kd.marks','kd.hidden','kd.free','kd.papers','kd.lift.0','kd.lift.2']);
    await page.evaluate(()=>{for(let i=0;i<1550;i++)__BF3.update(.016);});await flush();
    ok('prisoner transfer reaches guest',await guest.evaluate(()=>__BF3.G.storyState.flags['kd.transfer']));
    const lift=await page.evaluate(()=>{const b=__BF3,m=b.G.movers.find(m=>m.prisonLift);for(let i=0;i<900&&m.h>180.01;i++)b.update(.016);return {x:m.x,z:m.z,h:m.h};});
    await guest.evaluate(lift=>{const b=__BF3,m=b.G.movers.find(m=>m.prisonLift);Object.assign(m,{h:lift.h});Object.assign(b.G.p,{x:lift.x,z:lift.z,y:lift.h,vy:0,onGround:true});},lift);
    const status=await page.evaluate(()=>__BF3.briarPacket());
    await guest.evaluate(packet=>__BF3.briarApply(packet),status);
    ok('late guest can wait on returned lift',await guest.evaluate(()=>{const b=__BF3,m=b.G.movers.find(m=>m.prisonLift);return Math.abs(b.G.p.y-m.h)<4&&b.G.storyState.flags['kd.transfer'];}));
    await page.evaluate(()=>{const b=__BF3,m=b.G.movers.find(m=>m.prisonLift);for(let i=0;i<900&&m.h<320;i++)b.update(.016);});
    await guest.evaluate(packet=>__BF3.briarApply(packet),await page.evaluate(()=>__BF3.briarPacket()));
    ok('returned lift carries guest toward exit',await guest.evaluate(()=>{const b=__BF3,m=b.G.movers.find(m=>m.prisonLift);return m.h>320&&Math.abs(b.G.p.y-m.h)<5;}));
    if(errors.length)throw Error(JSON.stringify(errors));
    return {checks,pageErrors:errors};
  }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
