async page => {
  const checks = [], errors = [], ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
  const context = await page.context().browser().newContext({viewport:{width:1280,height:800}}), guest = await context.newPage();
  for (const p of [page, guest]) {p.on('pageerror', e => errors.push(e.message));p.on('requestfailed',r=>{if(r.url().includes('/story/'))errors.push((p===page?'host ':'guest ')+'story request failed '+r.url()+' '+r.failure()?.errorText);});p.on('response',r=>{if(r.status()>=400&&r.url().includes('/story/'))errors.push((p===page?'host ':'guest ')+'story response '+r.status()+' '+r.url());});}
  try {
    for (const p of [page, guest]) {
      await p.goto('http://127.0.0.1:4332/3d/?mute=1&qa=lift-winch-coop');
      try { await p.waitForFunction(() => document.readyState==='complete' && window.__BF3 && window.BFPrison && window.BFHubDialogue && window.BFStoryAuthority && window.BFShipwreckShore, null, {timeout:12000}); }
      catch(e) { throw Error('initial game load '+(p===page?'host':'guest')+' '+JSON.stringify(await p.evaluate(() => ({ready:!!window.__BF3,hero:!!window.HERO3D?.ready,prison:!!window.BFPrison,loading:window.BF_LOADING?.active,href:location.href})))); }
      try {await p.evaluate(async () => { const b = __BF3,book=await b.briarReady;if(!book?.events?.['kd.lift.winch'])throw Error('Dungeon story book did not load'); b.loadMode('rl'); b.meta.run = null; b.meta.bank = null; b.meta.introSeen = true; b.meta.classId = 'warrior'; b.meta.riftShards = []; b.openHub(); window.qaPackets = []; });}
      catch(e){throw Error((p===page?'host ':'guest ')+e.message+' console '+JSON.stringify(errors.filter(x=>!x.includes('Failed to load resource')).slice(-15)));}
    }
    await page.evaluate(() => { const m = __BF3.MP; m.active = true; m.isHost = true; m.myId = 'h'; m.conns = []; window.qaListeners = {}; m.wireGuest({open:true,send:d => qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f) => qaListeners[k] = f}); qaListeners.open(); });
    await guest.evaluate(() => { const m = __BF3.MP; m.active = true; m.isHost = false; m.myId = 'g'; m.hostConn = {open:true,send:d => qaPackets.push(JSON.parse(JSON.stringify(d)))}; });
    const flush = async () => { for (let i=0;i<2;i++) { for (const d of await guest.evaluate(() => qaPackets.splice(0))) await page.evaluate(d => qaListeners.data(d),d); for (const d of await page.evaluate(() => qaPackets.splice(0))) await guest.evaluate(d => __BF3.MP.onGuestData(d),d); } };
    await page.evaluate(d => qaListeners.data(d), await guest.evaluate(() => ({t:'hello',p:__BF3.MP.selfState()})));
    await flush();
    await page.evaluate(() => { __BF3.enterZone(2); __BF3.nextArea(); });
    for (let i=0;i<15;i++) { await flush(); if (await guest.evaluate(() => __BF3.G.prison && __BF3.G.area === 1)) break; await page.waitForTimeout(80); }
    for (const p of [page,guest]) try { await p.waitForFunction(() => __BF3.G.prison && __BF3.mode==='play', null, {timeout:12000}); }
    catch(e) {throw Error('dungeon load '+(p===page?'host':'guest')+' '+JSON.stringify(await p.evaluate(() => ({zone:__BF3.G?.zone,area:__BF3.G?.area,prison:!!__BF3.G?.prison,loading:BF_LOADING,hero:window.HERO3D?.ready,mode:__BF3.mode}))));}
    await page.evaluate(() => { const b=__BF3,G=b.G,p=G.p; p.invuln=999; for(const e of G.enemies){e.dead=true;e.hp=0;} for(const key of ['kd.roster','kd.marks','kd.hidden','kd.free','kd.papers']){const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key});} for(let i=0;i<520;i++)b.update(.016); b.MP.broadcast(); });
    await flush();
    ok('guest sees freed prisoners and closed lift', await guest.evaluate(() => __BF3.G.storyState.flags['kd.free'] && !__BF3.G.storyState.flags['kd.lift.open'] && __BF3.G.prison.remote?.rescueT >= 7.99));
    await guest.evaluate(() => { const b=__BF3,G=b.G,p=G.p,o=G.storyObjects.find(o=>o.key==='kd.lift.winch');Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0,vx:0,vz:0,onGround:true}); });
    await flush();
    await page.evaluate(d => qaListeners.data(d), await guest.evaluate(() => ({t:'pos',p:__BF3.MP.selfState()})));
    await guest.evaluate(() => __BF3.briarRequest('world',{key:'kd.lift.winch'}));
    await flush();
    ok('guest grips host-authoritative handle', await page.evaluate(() => __BF3.G.prison.winch.owner === 'g'));
    await page.evaluate(() => {const b=__BF3,p=b.G.p,o=b.G.storyObjects.find(o=>o.key==='kd.lift.winch');Object.assign(p,{x:o.x,z:o.z,y:o.y,onGround:true});b.briarRequest('world',{key:'kd.lift.winch'});});
    ok('second player cannot steal handle', await page.evaluate(() => __BF3.G.prison.winch.owner === 'g'));
    const walkBatch = async angle => {
      const states=await guest.evaluate(angle => {const b=__BF3,p=b.G.p,target={x:BFPrison.WINCH.x+Math.cos(angle)*BFPrison.WINCH.r,z:BFPrison.WINCH.z+Math.sin(angle)*BFPrison.WINCH.r},out=[];let i=0;while(Math.hypot(target.x-p.x,target.z-p.z)>7&&i++<90){const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz)||1;b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);out.push(b.MP.selfState());}b.input.jx=0;b.input.jz=0;return out;},angle);
      await page.evaluate(states => {const b=__BF3;for(const state of states){qaListeners.data({t:'pos',p:state});b.update(.016);}b.MP.broadcast();},states);
      await flush();
    };
    for(let i=1;i<=6;i++) await walkBatch(i*Math.PI/15);
    const partial=await page.evaluate(() => ({progress:__BF3.G.prison.winch.progress,lift:__BF3.G.movers.find(m=>m.prisonLift).h,owner:__BF3.G.prison.winch.owner}));
    ok('guest movement raises host lift', partial.progress>.12 && partial.lift>200 && partial.owner==='g');
    ok('guest receives moving lift and rides it', await guest.evaluate(() => Math.abs(__BF3.G.p.y-__BF3.G.movers.find(m=>m.prisonLift).h)<6 && __BF3.G.prison.remote?.winchProgress>.12));
    await page.evaluate(()=>qaListeners.close());
    ok('disconnect releases winch grip',await page.evaluate(()=>!__BF3.G.prison.winch.owner));
    await page.evaluate(()=>qaListeners.open());
    await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));
    await flush();
    await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'pos',p:__BF3.MP.selfState()})));
    await guest.evaluate(() => __BF3.briarRequest('world',{key:'kd.lift.winch'}));
    await flush();
    ok('reconnected guest can take handle again',await page.evaluate(()=>__BF3.G.prison.winch.owner==='g'));
    await guest.evaluate(() => __BF3.briarRequest('world',{key:'kd.lift.winch'}));
    await flush();
    ok('guest can release handle', await page.evaluate(() => !__BF3.G.prison.winch.owner));
    await page.evaluate(() => {for(let i=0;i<240;i++)__BF3.update(.016);__BF3.MP.broadcast();});
    await flush();
    ok('both clients see lowered retry', await page.evaluate(() => __BF3.G.prison.winch.progress===0) && await guest.evaluate(() => __BF3.G.prison.remote?.winchProgress===0));
    await guest.evaluate(() => {const b=__BF3,G=b.G,p=G.p,o=G.storyObjects.find(o=>o.key==='kd.lift.winch');Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0,vx:0,vz:0,onGround:true});});
    await flush();
    await page.evaluate(d => qaListeners.data(d), await guest.evaluate(() => ({t:'pos',p:__BF3.MP.selfState()})));
    await guest.evaluate(() => __BF3.briarRequest('world',{key:'kd.lift.winch'}));
    await flush();
    ok('guest regrips after retry', await page.evaluate(() => __BF3.G.prison.winch.owner==='g'));
    for(let i=1;i<=34;i++){if(await page.evaluate(() => !!__BF3.G.storyState.flags['kd.lift.open']))break;await walkBatch(i*Math.PI/15);}
    await flush();
    ok('guest completes turn for both players', await page.evaluate(() => !!__BF3.G.storyState.flags['kd.lift.open']) && await guest.evaluate(() => !!__BF3.G.storyState.flags['kd.lift.open']));
    await page.evaluate(() => {for(let i=0;i<560;i++)__BF3.update(.016);__BF3.MP.broadcast();});
    await flush();
    ok('transfer and exit open for both players', await page.evaluate(() => !!__BF3.G.storyState.flags['kd.transfer'] && !!__BF3.G.portal) && await guest.evaluate(() => !!__BF3.G.storyState.flags['kd.transfer'] && !!__BF3.G.portal));
    if(errors.length)throw Error(JSON.stringify(errors));
    return {checks,partial,errors};
  } finally { await page.evaluate(() => { __BF3.MP.active=false; __BF3.MP.conns=[]; }); await context.close(); }
}
