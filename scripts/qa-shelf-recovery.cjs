async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.camMode='far';b.openHub();b.enterZone(6);b.G.area=1;b.loadArea();});
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.library);
  const fallen=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;for(const e of G.enemies)e.dead=true;
    const crank=G.storyObjects.find(o=>o.key==='sl.shelf.0');Object.assign(p,{x:crank.x,z:crank.z,y:crank.y,vy:0});b.briarRequest('world',{key:crank.key});
    Object.assign(p,{x:1850,z:-3980,y:360,vy:-1,vx:0,vz:0,onGround:false});
    for(let i=0;i<200&&!p.onGround;i++)b.update(.016);
    Object.assign(G.cam,{x:p.x,z:p.z,y:p.y});
    return [+p.x.toFixed(1),+p.z.toFixed(1),+p.y.toFixed(1),p.onGround];
  });
  await page.waitForTimeout(250);
  await page.screenshot({path:'output/playwright/sky-library-shelves-recovery-2168.png'});
  const back=await page.evaluate(()=>{
    const b=__BF3,p=b.G.p;
    const travel=q=>{let steps=0;for(;steps<900;steps++){const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<25&&Math.abs(p.y-q[2])<35&&p.onGround)break;b.input.jx=d>1?dx/d:0;b.input.jz=d>1?dz/d:0;b.input.jump=d>55;if(p.onGround&&d>55)b.input.jumpEdge=true;b.update(.016);}b.input.jx=b.input.jz=0;b.input.jump=false;b.input.jumpEdge=false;return {steps,pos:[+p.x.toFixed(1),+p.z.toFixed(1),+p.y.toFixed(1)],onGround:p.onGround};};
    return travel([1640,-3800,360]);
  });
  if(errors.length||fallen[2]!==280||back.steps>=900)throw Error(JSON.stringify({fallen,back,errors}));
  return {fallen,back,errors};
}
