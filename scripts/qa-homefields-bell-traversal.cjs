async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const route=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.openHub();b.enterZone(0);b.meta.camMode='far';const p=b.G.p;Object.assign(p,{x:2350,z:-940,y:0,vx:0,vy:0,vz:0,onGround:true,invuln:999});const steps=[];b.input.jz=-1;b.input.jump=true;for(let i=0;i<420;i++){if(i%25===0&&p.onGround)b.input.jumpEdge=true;b.update(.016);if(i%40===0)steps.push([Math.round(p.z),Math.round(p.y)]);if(p.z< -1830&&p.y>=168)break;}b.input.jz=0;b.input.jump=false;for(let i=0;i<100;i++)b.update(.016);return {steps,at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],roof:p.y>=168&&p.z< -1800,objects:b.G.storyObjects.filter(o=>o.key.startsWith('home.bell.')).map(o=>o.key)};});
  if(!route.roof||route.objects.length!==3)throw Error('Tower traversal: '+JSON.stringify(route));
  await page.waitForFunction(()=>!BF_LOADING.active);
  await page.screenshot({path:'output/playwright/homefields-warning-bell-traversal.png'});
  return route;
 }finally{await context.close();}
}
