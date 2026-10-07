async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4339/3d/?devbriar=1&mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&document.getElementById('bstart'));
 await page.locator('#bi').check();await page.locator('#bstart').click();
 const result=await page.evaluate(()=>{
  const b=__BF3,pr=BFBriarBeta.progress;
  Object.assign(pr,{medicine:true,healing:true,bridge:true,evacuated:true});
  const home=b.G;Object.assign(home.p,{x:0,z:-4250,y:0,onGround:true});b.updateInteract();b.doInteract();
  const g=b.G,s=g.devBriar,p=g.p;pr.signal=true;
  for(const q of s.groups)if(q.id!=='boss')q.spawned=true;
  Object.assign(p,{x:-170,z:-4265,y:s.terrain.height(-170,-4265),hp:100000,invuln:99,onGround:true,vx:0,vz:0});
  const log=[];let beast;
  for(let i=0;i<120;i++){b.update(1/60);beast=g.enemies.find(e=>e.betaId==='boss:0');if(beast?.pcState==='wind'){log.push({phase:'wind',x:beast.x,z:beast.z,dx:beast.pcDX,dz:beast.pcDZ});break;}}
  if(!beast||!log.length)throw Error('Warbeast did not start a telegraphed attack');
  Object.assign(p,{x:-335,z:-4315,y:s.terrain.height(-335,-4315),vx:0,vz:0});
  for(let i=0;i<170&&!s.snarePosts[0].used;i++){b.update(1/60);if(i%12===0)log.push({phase:beast.pcState,x:Math.round(beast.x),z:Math.round(beast.z),clock:+(beast.pcClock||0).toFixed(2)});}
  return {postUsed:s.snarePosts[0].used,otherUnused:!s.snarePosts[1].used,armor:beast.betaArmor,stagger:beast.staggerT,wallGone:!g.walls.includes(s.snarePosts[0].wall),events:s.events.filter(e=>e.kind==='snare').length,log};
 });
 await page.waitForFunction(()=>__BF3.G?.devBriar?.snarePosts?.[0]?.art,null,{timeout:15000});
 await page.evaluate(()=>__BF3.G.devBriar.snarePosts[0].art.parent.userData.tick(__BF3.G.p));
 await page.waitForTimeout(100);
 result.artHidden=await page.evaluate(()=>__BF3.G.devBriar.snarePosts[0].art?.visible===false);
 if(!result.postUsed||!result.otherUnused||!result.armor||result.stagger<=0||!result.wallGone||!result.artHidden||result.events!==1||errors.length)throw Error(JSON.stringify({result,errors}));
 return {result,errors};
}
