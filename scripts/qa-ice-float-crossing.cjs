async page => {
  const errors=[], checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
  await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2160');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
    b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;
    b.openHub();b.enterZone(3);b.nextArea();b.meta.tutOff=true;b.meta.camMode='far';
    b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;
  });
  await page.waitForFunction(()=>!BF_LOADING.active&&!!__BF3.G.iceCaves);
  const setup=await page.evaluate(()=>{
    const b=__BF3,G=b.G,s=G.storyState,p=G.p;
    s.flags['ic.ellis.lead']=true;s.flags['ic.lock.clue']=true;s.flags['event.ic.lock.clue']=true;
    Object.assign(p,{x:-160,z:-3850,y:180,vy:0,onGround:true});b.briarSync();
    const objects=Object.fromEntries(G.storyObjects.filter(o=>o.key.startsWith('ic.lock.')).map(o=>[o.key,[o.x,o.z,o.y]]));
    return {objects,arrow:BFPartyNavigation.target(G)?.key};
  });
  ok('controls occupy three sides of the actual pool',setup.objects['ic.lock.1'][1]>-4000&&setup.objects['ic.lock.2'][1]<-4050&&setup.objects['ic.lock.3'][1]<-4400);
  ok('guide starts at the pump',setup.arrow==='ic.lock.1');
  await page.screenshot({path:'output/playwright/ice-float-empty.png'});
  const pumped=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;
    for(let i=0;i<2;i++)b.briarRequest('world',{key:'ic.lock.1'});
    for(let i=0;i<190;i++)b.update(.016);
    return {level:G.storyState.items['ic.lock.level'],float:G.iceCaves.float.h,arrow:BFPartyNavigation.target(G)?.key};
  });
  ok('two pump pulls visibly raise a solid float',pumped.level===2&&pumped.float>168&&pumped.arrow==='ic.lock.2');
  await page.screenshot({path:'output/playwright/ice-float-raised.png'});
  const crossing=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;
    Object.assign(p,{x:0,z:-3890,y:180,vy:0,onGround:true});
    b.input.jz=-1;b.input.jumpEdge=true;b.input.jump=true;
    let reached=false,minY=Infinity;const path=[];
    for(let i=0;i<180;i++){b.update(.016);minY=Math.min(minY,p.y);if(i%10===0)path.push([i,Math.round(p.z),Math.round(p.y),p.onGround]);if(p.z<-4070&&p.y>150&&p.onGround){reached=true;break;}}
    b.input.jz=0;b.input.jump=false;
    for(let i=0;i<40;i++)b.update(.016);
    return {reached,x:p.x,z:p.z,y:p.y,minY,onGround:p.onGround,path};
  });
  ok('normal jump reaches and lands on the raised float',crossing.reached&&crossing.z<-4070&&crossing.y>150&&crossing.onGround);
  const frozen=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;
    b.briarRequest('world',{key:'ic.lock.2'});
    for(let i=0;i<35;i++)b.update(.016);
    return {frozen:G.storyState.flags['ic.lock.frozen'],sheet:G.iceCaves.sheet.h,arrow:BFPartyNavigation.target(G)?.key,at:[p.x,p.z,p.y]};
  });
  ok('freeze from the float makes a traversable sheet',frozen.frozen&&frozen.sheet>170&&frozen.arrow==='ic.lock.3');
  await page.screenshot({path:'output/playwright/ice-float-frozen.png'});
  const far=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;
    b.input.jz=-1;let crossed=false,minY=Infinity;
    for(let i=0;i<180;i++){b.update(.016);minY=Math.min(minY,p.y);if(p.z<-4480&&p.y>150){crossed=true;break;}}
    b.input.jz=0;b.input.jx=1;
    for(let i=0;i<30;i++)b.update(.016);
    b.input.jx=0;
    return {crossed,x:p.x,z:p.z,y:p.y,minY,onGround:p.onGround};
  });
  ok('player crosses the actual frozen span to the far bank',far.crossed&&far.y>150&&far.onGround);
  const drained=await page.evaluate(()=>{
    const b=__BF3,G=b.G;
    b.briarRequest('world',{key:'ic.lock.3'});
    return {open:G.storyState.flags['ic.lock.open'],bridge:G.iceCaves['ic.lock.open'],portal:!!G.portal,staleControls:b.briarObjects().filter(o=>/^ic\.lock\.(?:[123]|reset)$/.test(o.key)).map(o=>o.key)};
  });
  ok('far drain locks in the permanent bridge '+JSON.stringify(drained),drained.open&&drained.bridge&&drained.portal&&drained.staleControls.length===0);
  await page.screenshot({path:'output/playwright/ice-float-complete.png'});
  await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2160');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
    b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();b.enterZone(3);b.nextArea();
    b.meta.tutOff=true;b.meta.camMode='far';b.G.p.invuln=999;
    Object.assign(b.G.storyState.flags,{'ic.ellis.lead':true,'ic.lock.clue':true,'event.ic.lock.clue':true});
    b.briarSync();
  });
  await page.waitForFunction(()=>!BF_LOADING.active&&!!__BF3.G.iceCaves);
  const recovery=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p,pump=G.storyObjects.find(o=>o.key==='ic.lock.1'),reset=G.storyObjects.find(o=>o.key==='ic.lock.reset');
    Object.assign(p,{x:pump.x,z:pump.z,y:pump.y});
    for(let i=0;i<3;i++)b.briarRequest('world',{key:pump.key});
    const overfill={level:G.storyState.items['ic.lock.level'],arrow:BFPartyNavigation.target(G)?.key,freezeAllowed:BFIceCaves.available('ic.lock.2',G),resetVisible:b.briarObjects().some(o=>o.key===reset.key)};
    Object.assign(p,{x:reset.x,z:reset.z,y:reset.y});b.briarRequest('world',{key:reset.key});
    const cleared={level:G.storyState.items['ic.lock.level'],frozen:G.storyState.flags['ic.lock.frozen'],arrow:BFPartyNavigation.target(G)?.key};
    G.storyState.items['ic.lock.level']=1;G.storyState.flags['ic.lock.frozen']=true;b.briarSync();
    const oldVisible=b.briarObjects().some(o=>o.key===reset.key);
    b.briarRequest('world',{key:reset.key});
    return {overfill,cleared,oldVisible,oldCleared:G.storyState.items['ic.lock.level']===0&&!G.storyState.flags['ic.lock.frozen']};
  });
  ok('overfill has a visible, reachable reset',recovery.overfill.level===3&&recovery.overfill.arrow==='ic.lock.reset'&&!recovery.overfill.freezeAllowed&&recovery.overfill.resetVisible&&recovery.cleared.level===0&&recovery.cleared.arrow==='ic.lock.1');
  ok('older wrongly frozen partial state can recover',recovery.oldVisible&&recovery.oldCleared);
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,setup,pumped,crossing,frozen,far,drained,recovery,pageErrors:errors};
}
