async page=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
    b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;
    b.meta.zoneDone={keep:true};b.meta.returnVisits={supplies:'accepted'};
    b.openHub();b.enterZone(2);b.meta.camMode='far';
    for(const e of b.G.enemies)e.stunT=999;
    b.G.p.invuln=999;
    Object.assign(b.G.p,{x:-1815,z:-3390,y:80,vy:0});
  });
  await page.waitForFunction(()=>!BF_LOADING.active);
  const result=await page.evaluate(()=>{
    const b=__BF3,p=b.G.p,trace=[];
    const tick=n=>{for(let i=0;i<n;i++)b.update(.016)};
    function walk(x,z,{jump=false,height=null}={}){
      let i=0;
      for(;i<850;i++){
        const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);
        if(d<20&&(height===null||Math.abs(p.y-height)<12))break;
        b.input.jx=dx/d;b.input.jz=dz/d;
        if(jump&&i%42===0)b.input.jumpEdge=true;
        b.input.jump=jump&&i%42<20;
        b.update(.016);
      }
      b.input.jx=b.input.jz=0;b.input.jump=false;tick(20);
      trace.push({target:[x,z],at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],steps:i});
      if(i===850)throw Error('Route timed out at '+x+','+z);
    }
    const first=b.G.returnSupply.ledges[0];
    walk(first.x,first.z,{jump:true,height:first.h});
    if(Math.abs(p.y-first.h)>12)throw Error('First service ledge was not landed');
    walk(-1600,-3480);tick(90);
    if(p.y>85||b.G.storyState.flags['rv.supplies.balance.open'])throw Error('Miss did not return to the floor safely');
    walk(-1815,-3390);
    for(const q of b.G.returnSupply.ledges)walk(q.x,q.z,{jump:true,height:q.h});
    if(Math.abs(p.y-244)>12)throw Error('Upper brake perch could not be landed');
    const brake=b.briarInteract();
    if(brake?.label!=='Free the jammed hoist brake')throw Error('Brake prompt missing at top');
    brake.act();
    if(!b.G.storyState.flags['rv.supplies.balance.open'])throw Error('Brake did not release');
    if(!BFReturnVisits.tasks(b.G,b.meta,b.G.storyState).some(t=>t.progress.includes('collect it on the chamber floor')))throw Error('Tracker did not follow the lowered basket');
    tick(100);
    if(!b.G.returnSupply.open)throw Error('Hoist did not animate open');
    walk(-1580,-3815);tick(90);
    if(p.y>85)throw Error('Could not return to chamber floor');
    walk(-1630,-3800);
    const load=b.briarInteract();
    if(load?.label!=='Collect the lowered supplies')throw Error('Lowered food prompt missing');
    load.act();
    if(b.meta.returnVisits.supplies!=='ready')throw Error('Food was not saved on collection');
    const count=Object.keys(b.G.storyState.rewards).filter(k=>k==='rv.item.supplies').length;
    b.briarRequest('world',{key:'rv.supplies.take'});
    if(count!==1||Object.keys(b.G.storyState.rewards).filter(k=>k==='rv.item.supplies').length!==1)throw Error('Food reward duplicated');
    return {trace,open:b.G.returnSupply.open,status:b.meta.returnVisits.supplies,rewards:count};
  });
  await page.screenshot({path:'output/playwright/return-hoist-route.png'});
  if(errors.length)throw Error(errors.join('; '));
  return {result,errors};
}
