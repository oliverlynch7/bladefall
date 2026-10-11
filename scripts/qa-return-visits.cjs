async page=>{
  const errors=[],checks=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
  page.on('pageerror',e=>errors.push(e.message));
  await (await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;await BFHubDialogue.ready;
    b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;
    b.meta.tutOff=true;b.meta.hubTutDone=true;b.meta.returnVisits={};
    b.meta.zoneDone={keep:true,ember:true};b.meta.autoAttack=false;b.meta.petActive=null;
    b.openHub();
    window.qaReq=(npc,choice)=>{
      const n=b.G.storyNpcs.find(n=>n.id===npc);
      Object.assign(b.G.p,{x:n.x,y:n.y||0,z:n.z});
      b.openReturnRequest(n);
      if(choice)b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});
    };
    window.qaObj=key=>{
      const o=b.G.storyObjects.find(o=>o.key===key);
      if(!o)throw Error('Missing world object '+key);
      Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});
      b.briarRequest('world',{key});
    };
  });
  await page.evaluate(()=>__BF3.enterZone(4));
  ok('no forge return objects before accepting',await page.evaluate(()=>!__BF3.G.storyObjects.some(o=>o.returnObject)));
  await page.evaluate(()=>{__BF3.openHub();qaReq('anvil','help');});
  ok('forge request accepted',await page.evaluate(()=>__BF3.meta.returnVisits.pattern==='accepted'));
  await page.evaluate(()=>{__BF3.briarRequest('close');__BF3.enterZone(4);__BF3.G.p.invuln=999;});
  ok('four forge objects appear',await page.evaluate(()=>__BF3.G.storyObjects.filter(o=>o.returnObject).length===4));
  await page.evaluate(()=>qaObj('rv.pattern.take'));
  ok('clamped pattern remains inaccessible',await page.evaluate(()=>__BF3.meta.returnVisits.pattern==='accepted'));
  for(const key of ['note','cool','clamp','take'])await page.evaluate(key=>qaObj('rv.pattern.'+key),key);
  ok('forge pattern secured immediately',await page.evaluate(()=>__BF3.meta.returnVisits.pattern==='ready'));
  await page.evaluate(()=>{__BF3.openHub();qaReq('anvil','give');});
  ok('forge delivery completed',await page.evaluate(()=>__BF3.meta.returnVisits.pattern==='done'&&__BF3.meta.hubUpgrades.returnForge));
  const forgeGold=await page.evaluate(()=>__BF3.meta.gold);
  await page.evaluate(()=>{__BF3.briarRequest('close');__BF3.openHub();qaReq('anvil');});
  ok('forge payment only once',forgeGold===await page.evaluate(()=>__BF3.meta.gold));
  await page.evaluate(()=>{__BF3.briarRequest('close');qaReq('quartermaster','help');});
  ok('food request accepted',await page.evaluate(()=>__BF3.meta.returnVisits.supplies==='accepted'));
  await page.evaluate(()=>{__BF3.briarRequest('close');__BF3.enterZone(2);__BF3.G.p.invuln=999;});
  ok('three food objects and four service ledges',await page.evaluate(()=>__BF3.G.storyObjects.filter(o=>o.key?.startsWith('rv.supplies.')).length===3&&__BF3.G.returnSupply.ledges.length===4));
  await page.evaluate(()=>qaObj('rv.supplies.note'));
  await page.evaluate(()=>qaObj('rv.supplies.take'));
  ok('raised food cannot be collected',await page.evaluate(()=>__BF3.meta.returnVisits.supplies==='accepted'));
  await page.evaluate(()=>{
    const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='rv.supplies.release');
    Object.assign(b.G.p,{x:o.x,y:80,z:o.z});
    b.briarRequest('world',{key:o.key});
  });
  ok('floor-level brake reach rejected',await page.evaluate(()=>!__BF3.G.storyState.flags['rv.supplies.balance.open']));
  await page.evaluate(()=>qaObj('rv.supplies.release'));
  ok('upper brake lowers food',await page.evaluate(()=>__BF3.G.storyState.flags['rv.supplies.balance.open']&&__BF3.G.returnSupply.open));
  await page.evaluate(()=>qaObj('rv.supplies.take'));
  ok('food secured immediately',await page.evaluate(()=>__BF3.meta.returnVisits.supplies==='ready'));
  await page.evaluate(()=>{__BF3.openHub();qaReq('quartermaster','give');});
  ok('food delivery improves hub',await page.evaluate(()=>__BF3.meta.returnVisits.supplies==='done'&&__BF3.meta.hubUpgrades.returnSupplies));
  if(errors.length)throw Error(errors.join('; '));
  return {checks,errors};
}
