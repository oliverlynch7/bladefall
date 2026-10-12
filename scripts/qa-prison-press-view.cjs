async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.camMode='far';
    b.openHub();b.enterZone(2);b.nextArea();
  });
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.prison&&__world3d().counts.keepArt);
  const before=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;G.storyState.flags['kd.lift.open']=true;
    for(const e of G.enemies)e.stunT=999;
    Object.assign(p,{x:0,z:-3230,y:0,yaw:Math.PI,vy:0,vx:0,vz:0,onGround:true,invuln:999});
    Object.assign(G.cam,{x:p.x,y:p.y,z:p.z});delete G._cameraBoom;
    G.prison.pressClock=.45;for(let i=0;i<3;i++)b.update(.016);
    return {p:{x:p.x,y:p.y,z:p.z,yaw:p.yaw},presses:G.prison.presses.map(q=>({z:q.z,bottom:q.bottom,warning:q.warning,down:q.down})),scene:__world3d().counts};
  });
  await page.waitForTimeout(100);
  await page.screenshot({path:'output/playwright/prison-press-normal-camera.png'});
  const warning=await page.evaluate(()=>{const b=__BF3;b.G.prison.pressClock=2.2;b.update(.016);return b.G.prison.presses.map(q=>({bottom:q.bottom,warning:q.warning}));});
  await page.screenshot({path:'output/playwright/prison-press-warning.png'});
  const down=await page.evaluate(()=>{const b=__BF3;b.G.prison.pressClock=3;b.update(.016);return b.G.prison.presses.map(q=>({bottom:q.bottom,down:q.down}));});
  await page.screenshot({path:'output/playwright/prison-press-down.png'});
  const strike=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:0,z:-3120,y:0,vy:0,onGround:true,invuln:0,hp:Math.max(p.hp,100)});
    G.prison.pressClock=2.98;G.prison.pressHitUntil=0;const hp=p.hp;
    b.update(.016);return {hpBefore:hp,hpAfter:p.hp,x:p.x,z:p.z,y:p.y,press:G.prison.presses[0].bottom,hitUntil:G.prison.pressHitUntil};
  });
  await page.screenshot({path:'output/playwright/prison-press-hit.png'});
  const brake=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:-135,z:-2760,y:0,vy:0,onGround:true});
    b.briarRequest('world',{key:'kd.press.brake'});for(let i=0;i<3;i++)b.update(.016);
    return {open:!!G.storyState.flags['kd.deep.open'],presses:G.prison.presses.map(q=>q.bottom),depthBlock:G.obstacles.some(o=>o.prisonBlock==='depth'),shard:b.worldRiftShards().some(q=>q.id==='RK-03')};
  });
  await page.screenshot({path:'output/playwright/prison-press-brake.png'});
  if(errors.length||strike.hpAfter>=strike.hpBefore||strike.z>=-3120||!brake.open||brake.depthBlock||!brake.shard)throw Error(JSON.stringify({before,strike,brake,errors}));
  return {before,warning,down,strike,brake,errors};
}
