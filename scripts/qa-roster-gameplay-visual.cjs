async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?devbriar=1&mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&document.getElementById('bstart'));
 await page.locator('#bi').check();await page.locator('#bstart').click();
 await page.waitForFunction(()=>window.__BF3?.G?.devBriar&&window.__BF3?.G?.p&&document.getElementById('bstart').offsetParent===null);
 const sets=[['grunt','caster','thornboar'],['archer','warden','brute'],['emberling','frostling','toxling']];
 const samples=[];
 for(let index=0;index<sets.length;index++){
  const names=sets[index];
  await page.evaluate(names=>{
   const b=__BF3,g=b.G,p=g.p;
   g.enemies=[];Object.assign(p,{x:0,z:310,y:g.devBriar.terrain.height(0,310),yaw:Math.PI,onGround:true});
   g.camYaw=Math.PI;g.cam={x:p.x,y:p.y,z:p.z};
   names.forEach((name,i)=>b.spawnEnemy(name,(i-1)*80,165,false));
   for(let i=0;i<8;i++)b.renderFrame();
  },names);
  await page.waitForTimeout(550);await page.evaluate(()=>{for(let i=0;i<7;i++)__BF3.renderFrame();});
  const state=await page.evaluate(()=>({missing:__mob3d().missing,models:__mob3d().models,actors:__mob3d().actors.map(x=>x.type),error:__mob3d().err}));
  await page.screenshot({path:'output/enemy-roster-upgrade/game-'+index+'.png'});
  samples.push({names,state});
 }
 if(errors.length||samples.some(x=>x.state.error||x.state.missing.length))throw Error(JSON.stringify({errors,samples}));
 return {samples,errors};
}
