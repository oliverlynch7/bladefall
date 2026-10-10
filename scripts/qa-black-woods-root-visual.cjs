async page=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];
  b.openHub();b.enterZone(0);b.nextArea();b.meta.camMode='far';b.meta.tutOff=true;
  for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;
  Object.assign(b.G.p,{x:-1950,z:-2280,y:0,vy:0});b.resize();
 });
 await page.waitForFunction(()=>!BF_LOADING.active);
 await page.waitForTimeout(400);
 const art=await page.evaluate(()=>({active:!!window.__WOODS_ROOT_3D_ACTIVE,world:window.__world3d?.()?.counts?.outskirtsArt}));
 if(!art.active||!art.world)throw Error('Root art is absent from the live Black Woods renderer: '+JSON.stringify(art));
 await page.screenshot({path:'tmp/qa-black-woods-root-ground.png'});
 await page.evaluate(()=>{__BF3.meta.camMode='shoulder';__BF3.resize();});
 await page.waitForTimeout(400);
 await page.screenshot({path:'tmp/qa-black-woods-root-shoulder.png'});
 await page.evaluate(()=>{__BF3.meta.camMode='far';__BF3.resize();});
 await page.evaluate(()=>Object.assign(__BF3.G.p,{x:-1950,z:-2480,y:0,vy:0}));
 await page.waitForTimeout(400);
 await page.screenshot({path:'tmp/qa-black-woods-root-seal-closed.png'});
 await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-2140,z:-2650,y:138,vy:0});});
 await page.waitForTimeout(400);
 await page.screenshot({path:'tmp/qa-black-woods-root-top.png'});
 await page.evaluate(()=>{const b=__BF3;b.briarRequest('world',{key:'woods.tracks.release'});Object.assign(b.G.p,{x:-1950,z:-2480,y:0,vy:0});});
 await page.waitForTimeout(1100);
 await page.screenshot({path:'tmp/qa-black-woods-root-open.png'});
 return 'captured custom root art in far and shoulder cameras, high perch, and released hollow';
}
