async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:720});
 for(const [query,file]of [['outskirtsart=0','tmp/qa-black-woods-generic-root.png'],['world3d=0','tmp/qa-black-woods-voxel-root.png']]){
  await page.goto('http://127.0.0.1:4331/3d/?mute=1&'+query);await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(0);b.nextArea();b.meta.camMode='far';b.meta.tutOff=true;Object.assign(b.G.p,{x:-1950,z:-2280,y:0,vy:0});b.resize();});
  await page.waitForFunction(()=>!BF_LOADING.active);await page.waitForTimeout(300);
  const condition=await page.evaluate(()=>({perches:__BF3.G.obstacles.filter(o=>o.woodsRootPerch).length,art:!!window.__WOODS_ROOT_3D_ACTIVE,three:window.__world3d?.()?.on}));
  if(condition.perches!==6||(query==='outskirtsart=0'&&!condition.art)||(query==='world3d=0'&&condition.three))throw Error(query+': '+JSON.stringify(condition));
  await page.screenshot({path:file});
 }
 if(errors.length)throw Error(errors.join(';'));
 return 'generic 3D and voxel root routes both render without errors';
}
