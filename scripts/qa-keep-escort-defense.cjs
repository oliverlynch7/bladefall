async page=>{
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
  await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2161');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
    b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;
    b.openHub();b.enterZone(2);b.meta.tutOff=true;b.meta.camMode='far';
  });
  await page.waitForFunction(()=>!BF_LOADING.active&&!!__BF3.G.keep);
  const setup=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;
    Object.assign(G.storyState.flags,{'rk.help':true,'rk.arrow':true,'rk.gate':true,'rk.breach.start':true});
    b.briarSync();for(const e of G.enemies){e.dead=true;e.hp=0;}
    Object.assign(p,{x:0,z:-2150,y:0,vy:0,onGround:true,invuln:999});
    for(let i=0;i<110;i++)b.update(.016);
    const hunters=G.enemies.filter(e=>!e.dead&&e.keepEscort),bait=hunters[0];
    return {hunters:hunters.length,group:G.keepPrisoners.map(n=>({hp:n.hp,x:n.x,z:n.z})),target:bait?BFBrokenWalls.target(G,bait,p).id:null,elapsed:G.keep.elapsed,guide:BFPartyNavigation.target(G)?.navLabel,bellPrompt:b.briarObjects().some(o=>o.key==='rk.breach')};
  });
  ok('the breach spawns enemies that actually select escaping prisoners',setup.hunters>=2&&setup.target?.startsWith('keep_escape'));
  ok('the three prisoners have independent full health',setup.group.length===3&&setup.group.every(n=>n.hp===90));
  ok('the guide follows the group and the spent bell prompt closes',setup.guide==='Protect the escaping group'&&!setup.bellPrompt);
  await page.waitForTimeout(450);
  await page.screenshot({path:'output/playwright/keep-escort-start.png'});
  const hit=await page.evaluate(()=>{
    const b=__BF3,G=b.G,e=G.enemies.find(e=>!e.dead&&e.keepEscort),n=G.keepPrisoners.find(n=>n.id===BFBrokenWalls.target(G,e,G.p).id);
    Object.assign(e,{x:n.x+e.r+n.r-4,z:n.z,y:n.y,speed:0,meleeW:0,meleeCd:2,meleeActive:.18,meleeSerial:17});
    b.update(.016);const first=G.keep.escortHp[n.escortIndex];b.update(.016);
    return {first,second:G.keep.escortHp[n.escortIndex],other:G.keep.escortHp.filter((_,i)=>i!==n.escortIndex),serial:e._escortHitSerial};
  });
  ok('a real enemy strike removes health from one prisoner exactly once',hit.first<90&&hit.first===hit.second&&hit.other.every(h=>h===90)&&hit.serial===17);
  await page.evaluate(()=>{const b=__BF3;b.G.p.z=-1900;b.G.camYaw=0;});
  await page.waitForTimeout(650);
  await page.screenshot({path:'output/playwright/keep-escort-damaged.png'});
  await page.evaluate(()=>{__BF3.G.p.z=-2150;});
  const failure=await page.evaluate(()=>{
    const b=__BF3,G=b.G;G.keep.escortHp[0]=0;b.update(.016);
    const retreat={elapsed:G.keep.elapsed,waves:G.keep.waves,retryT:G.keep.retryT,groupZ:G.keepPrisoners.map(n=>n.z),enemies:G.enemies.filter(e=>e.keepGuard==='breach'&&!e.dead).length};
    for(let i=0;i<200;i++)b.update(.016);
    return {retreat,recovered:[...G.keep.escortHp],elapsed:G.keep.elapsed};
  });
  ok('a fallen prisoner retreats the group and clears the attack wave',failure.retreat.elapsed===0&&failure.retreat.waves===0&&failure.retreat.retryT>0&&failure.retreat.enemies===0&&failure.retreat.groupZ.every(z=>z===-1650));
  ok('the breach can be attempted again with restored prisoner health',failure.recovered.every(h=>h===90)&&failure.elapsed>0);
  const natural=await page.evaluate(()=>{
    const b=__BF3,G=b.G;let low=90,strikes=0;
    for(let i=0;i<1800;i++){b.update(.016);low=Math.min(low,...G.keep.escortHp);strikes=Math.max(strikes,G.enemies.filter(e=>e.keepEscort&&e._escortHitSerial>0).length);}
    return {low,strikes,elapsed:G.keep.elapsed,retryT:G.keep.retryT,group:G.keepPrisoners.map(n=>[n.x,n.z,n.hp]),enemies:G.enemies.filter(e=>e.keepEscort&&!e.dead).map(e=>[Math.round(e.x),Math.round(e.z),e.meleeSerial||0])};
  });
  ok('unassisted Legion attackers naturally reach and strike the convoy',natural.low<90&&natural.strikes>0);
  const defended=await page.evaluate(()=>{
    const b=__BF3,G=b.G,k=G.keep;k.escortHp.fill(90);k.retryT=0;k.elapsed=0;k.waves=0;k.away=0;
    Object.assign(G.p,{x:0,z:-2150,y:0,invuln:999});
    for(let i=0;i<2100&&!G.storyState.flags['rk.breach.done'];i++){
      for(const e of G.enemies)if(e.keepGuard==='breach'){e.hp=0;e.dead=true;}
      b.update(.016);
    }
    return {done:!!G.storyState.flags['rk.breach.done'],health:[...k.escortHp],elapsed:k.elapsed};
  });
  ok('defending all waves completes the rescue with the prisoners alive',defended.done&&defended.health.every(h=>h>0));
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,setup,hit,failure,natural,defended,pageErrors:errors};
}
