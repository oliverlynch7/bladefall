async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4338/3d/?devbriar=1&mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&document.getElementById('bstart'));
 await page.locator('#bi').check();await page.locator('#bstart').click();
 await page.waitForFunction(()=>__BF3.G?.devBriar&&!BF_LOADING.active);
 const types=['grunt','caster','thornboar','goblin','sentinel','sporeback','frostling','emberling','dustjackal','shadeling','mimic','brute'];
 await page.evaluate(types=>{
  const b=__BF3,g=b.G,p=g.p;g.enemies=[];Object.assign(p,{x:0,z:310,y:g.devBriar.terrain.height(0,310),yaw:Math.PI,onGround:true,invuln:999});g.camYaw=Math.PI;
  types.forEach((type,i)=>{const e=b.spawnEnemy(type,(i%4-1.5)*74,140-Math.floor(i/4)*60,false);e.stunT=999;e.dropT=0;});
 },types);
 await page.waitForFunction(n=>__mob3d().actors.length>=n,types.length,{timeout:10000});
 const result=await page.evaluate(()=>{const b=__BF3,frames=[];for(let i=0;i<30;i++){const s=performance.now();b.renderFrame();frames.push(performance.now()-s);}frames.sort((a,b)=>a-b);return {actors:__mob3d().actors.length,missing:__mob3d().missing,error:__mob3d().err,medianRenderMs:Math.round(frames[15]*10)/10,p90RenderMs:Math.round(frames[27]*10)/10,overflow:document.documentElement.scrollWidth>innerWidth};});
 await page.screenshot({path:'output/playwright/enemy-roster-phone-v2141.png'});
 if(result.actors!==types.length||result.missing.length||result.error||result.overflow||errors.length)throw Error(JSON.stringify({result,errors}));
 return {...result,errors};
}
