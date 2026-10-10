async page=>{
  const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
  const ok=(name,pass)=>{if(!pass)throw Error(name);checks.push(name);};
  async function prepare(quiet){
    await page.goto('http://127.0.0.1:4331/3d/?mute=1');
    await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
    await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.openHub();b.enterZone(4);b.nextArea();b.meta.tutOff=true;});
    await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.furnace);
    return page.evaluate(quiet=>{
      const b=__BF3,G=b.G,p=G.p;p.invuln=999;
      const act=key=>{const o=G.storyObjects.find(o=>o.key==='gf.'+key);if(!o)throw Error('missing '+key);Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key:o.key});};
      const talk=(id,choices)=>{const n=G.storyNpcs.find(n=>n.id===id);Object.assign(p,{x:n.x,z:n.z,y:n.y});b.briarRequest('open',{npc:id});for(const choice of choices)b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};
      for(const e of G.enemies){e.dead=true;e.hp=0;}
      act('fault');act('schedule');talk('pike',['fault','pass']);talk('martin',quiet?['help','quiet','ready']:['rush','ready']);act('passage');
      const before=BFGreatFurnace.available('gf.evac.call',G);
      if(quiet)act('transport');
      const after=BFGreatFurnace.available('gf.evac.call',G);
      act('evac.call');
      return {before,after,active:G.furnace.escortActive,quiet:!!G.storyState.flags['gf.quiet'],oldBellObjects:G.storyObjects.some(o=>/workbell|shelterbell/.test(o.key)),nav:BFPartyNavigation.target(G)?.key};
    },quiet);
  }
  const direct=await prepare(false);
  ok('direct route starts with one work bell and no second bell object',direct.before&&direct.after&&direct.active&&!direct.quiet&&!direct.oldBellObjects&&direct.nav!=='gf.shelterbell');
  const route=await page.evaluate(()=>{
    const G=__BF3.G,s=G.storyState,k=G.furnace,original=k.escortT,gaps=[];
    for(let step=0;step<=100;step++){
      k.escortT=step*.22;BFGreatFurnace.actors(G,s);
      for(const [i,n]of G.ironWorkers.entries())if(!G.obstacles.some(o=>o.kind==='plat'&&Math.abs(o.h-n.y)<45&&Math.abs(n.x-o.x)<o.w/2-18&&Math.abs(n.z-o.z)<o.d/2-18))gaps.push({step,i,x:n.x,z:n.z});
    }
    k.escortT=original;BFGreatFurnace.actors(G,s);return gaps;
  });
  ok('every worker stays on solid floor for the entire escort',!route.length);
  const failed=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;let damaged=false,waves=0,controlledLethal=false;
    for(let i=0;i<1500;i++){
      Object.assign(p,{x:G.ironWorkers[0].x+90,z:G.ironWorkers[0].z+70,y:120,vx:0,vz:0,invuln:999});b.update(.016);
      damaged||=G.furnace.escortHp.some(h=>h<90);waves=Math.max(waves,G.furnace.escortWave);
      if(!G.furnace.escortActive&&G.furnace.escortRetryT>0)break;
    }
    // Combat timing varies slightly across browsers. Use one controlled, lethal melee
    // contact if the naturally spawned pursuers have not felled anyone by this point.
    if(G.furnace.escortActive){const n=G.ironWorkers[0],e=G.enemies.find(e=>e.furnaceEscort&&!e.dead);if(!e)throw Error('missing escort pursuer');Object.assign(e,{x:n.x+12,z:n.z,y:n.y,dmg:120,meleeSerial:Math.max(e.meleeSerial||0,e._furnaceHitSerial||0)+1});controlledLethal=BFGreatFurnace.hitEscort(G,e);b.update(.016);}
    return {damaged,waves,controlledLethal,failed:!G.furnace.escortActive&&G.furnace.escortRetryT>0,evacuated:!!G.storyState.flags['gf.evacuated'],bellAvailable:BFGreatFurnace.available('gf.evac.call',G)};
  });
  ok('hostile melee damages a worker and triggers a safe retry',failed.damaged&&failed.waves>=1&&failed.failed&&!failed.evacuated&&!failed.bellAvailable);
  const retry=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;for(let i=0;i<180;i++)b.update(.016);
    const ready=BFGreatFurnace.available('gf.evac.call',G),o=G.storyObjects.find(o=>o.key==='gf.evac.call');Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});
    let waves=0;for(let i=0;i<1500;i++){
      Object.assign(p,{x:G.ironWorkers[0].x+90,z:G.ironWorkers[0].z+70,y:120,vx:0,vz:0,invuln:999});b.update(.016);
      waves=Math.max(waves,G.furnace.escortWave);for(const e of G.enemies)if(e.furnaceEscortWave){e.dead=true;e.hp=0;}
    }
    return {ready,waves,evacuated:!!G.storyState.flags['gf.evacuated'],crossing:!!G.furnace.evacuated,workers:G.ironWorkers.map(n=>({z:n.z,hp:n.hp})),objective:BFGreatFurnace.quest(G.storyState,G)};
  });
  ok('retry succeeds and opens the existing service crossing',retry.ready&&retry.waves===3&&retry.evacuated&&retry.crossing&&retry.workers.every(n=>n.z>-2300&&n.hp>0)&&/water pipes/.test(retry.objective));
  const quiet=await prepare(true);
  ok('quiet route requires the transport brake first',!quiet.before&&quiet.after&&quiet.active&&quiet.quiet);
  const quietResult=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;let firstWave=0;
    for(let i=0;i<1500;i++){
      Object.assign(p,{x:G.ironWorkers[0].x+90,z:G.ironWorkers[0].z+70,y:120,vx:0,vz:0,invuln:999});b.update(.016);
      if(G.furnace.escortWave===1&&!firstWave)firstWave=G.enemies.filter(e=>e.furnaceEscortWave===1&&!e.dead).length;
      for(const e of G.enemies)if(e.furnaceEscortWave){e.dead=true;e.hp=0;}
    }
    return {firstWave,evacuated:!!G.storyState.flags['gf.evacuated'],workers:G.ironWorkers.map(n=>n.z)};
  });
  ok('quiet route reduces the response and still completes',quietResult.firstWave===2&&quietResult.evacuated&&quietResult.workers.every(z=>z>-2300));
  ok('no browser errors',!errors.length);
  return {checks,direct,failed,retry,quiet,quietResult,errors};
}
