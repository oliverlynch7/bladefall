// Run with playwright-cli run-code --filename scripts/qa-chest-craft.cjs.
async root=>{
 const ctx=await root.context().browser().newContext({viewport:{width:1440,height:900}}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|Shader|GLSL/.test(m.text()))errors.push(m.text());});
 try{
  await page.goto('http://127.0.0.1:4345/prototypes/chest-craft/preview.html');await page.waitForFunction(()=>window.__chestWorkshop);
  const models=await page.evaluate(async()=>{
   const T=await import('/3d/three.module.js'),{createChestActor,animateChest}=await import('/3d/chest-art.js?v=2184'),w=__chestWorkshop,results=[];let previousWidth=0,previousHeight=0;
   for(const original of w.actors){
    const a=createChestActor(original.root.userData.rarity),b=createChestActor(original.root.userData.rarity);a.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(a.root),size=box.getSize(new T.Vector3());
    if(box.min.y<-.01||size.x<=previousWidth||size.y<=previousHeight)throw Error('Invalid grounding or rarity scale');previousWidth=size.x;previousHeight=size.y;
    const meshes=[];a.root.traverse(o=>{if(o.isMesh){meshes.push(o);for(const attr of ['position','normal'])for(const value of o.geometry.attributes[attr].array)if(!Number.isFinite(value))throw Error('Invalid geometry');}});
    const others=[];b.root.traverse(o=>{if(o.isMesh)others.push(o)});if(meshes.some((m,i)=>m.geometry!==others[i].geometry||m.material!==others[i].material))throw Error('Instances do not share resources');
    if(a.root.userData.drawCalls>14||a.root.userData.triangles>14000)throw Error('Chest rendering budget');
    const baseMesh=meshes.find(m=>m.parent===a.root),base=baseMesh.getWorldPosition(new T.Vector3());
    const steps=[];for(let i=0;i<11;i++){animateChest(a,{x:0,y:0,z:0,opened:true},.065);a.root.updateMatrixWorld(true);steps.push(a.opening);}
    if(a.opening!==1||a.lid.rotation.x>-1.8||steps.some((v,i)=>i&&v<steps[i-1]))throw Error('Lid animation');
    const openBounds=new T.Box3().setFromObject(a.root);if(openBounds.min.y<-.01||baseMesh.getWorldPosition(new T.Vector3()).distanceTo(base)>.001)throw Error('Opening moves base or clips floor');
    animateChest(a,{x:0,y:0,z:0,opened:false,_br:1.1},.016);if(a.lid.rotation.x>=0)throw Error('Mimic tell missing');
    results.push({...a.root.userData,width:size.x,height:size.y,sharedResources:true,finiteGeometry:true,hingedOpening:true,mimic:true});
   }
   return results;
  });
  await page.screenshot({path:'output/playwright/chest-craft-lineup.png'});
  for(let tier=0;tier<5;tier++){
   await page.evaluate(t=>{__chestWorkshop.select(t);__chestWorkshop.open(false)},tier);await page.waitForTimeout(90);await page.screenshot({path:'output/playwright/chest-craft-'+tier+'-closed.png'});
   await page.locator('#open').click();await page.waitForTimeout(760);await page.screenshot({path:'output/playwright/chest-craft-'+tier+'-open.png'});
   await page.locator('#open').click();
  }
  // The preview is usable on the phone too, including actual touch-sized controls.
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>__chestWorkshop.select(4));await page.waitForTimeout(100);await page.screenshot({path:'output/playwright/chest-craft-phone.png'});
  const phone=await page.locator('.controls').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom}});if(phone.left<0||phone.right>390||phone.bottom>844)throw Error('Preview controls off phone');
  await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4345/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.chestRecords={};b.meta.stash=[];b.meta.camMode='shoulder';b.meta.petActive=null;b.openHub();const g=b.G;
   g.chests=BFChestRules.order.map((rarity,i)=>({x:(i-2)*65,z:365,y:0,rarity,opened:false,bob:0}));Object.assign(g.p,{x:0,y:0,z:530,yaw:Math.PI,vx:0,vy:0,vz:0,onGround:true});g.cam={x:0,y:0,z:530};g.camYaw=Math.PI;g.camPitch=.23;});
  await page.waitForFunction(()=>!BF_LOADING.active);await page.screenshot({path:'output/playwright/chest-craft-game.png'});
  const cameras=[];for(const mode of ['far','shoulder','fps']){
   await page.evaluate(m=>__BF3.meta.camMode=m,mode);await page.waitForTimeout(130);const r=await page.evaluate(()=>({renderer:__BF_RENDER_STATS,props:__prop3d(),places:__prop3dChestPlaces()}));
   if(!r.renderer.triangles||r.props.err||r.props.chests!==5)throw Error('Camera lost chest art '+mode);cameras.push({mode,chests:r.props.chests});await page.screenshot({path:'output/playwright/chest-craft-game-'+mode+'.png'});
  }
  await page.evaluate(()=>{__BF3.meta.camMode='shoulder';__BF3.openChest(__BF3.G.chests[4])});
  await page.locator('#chest-reveal').waitFor();await page.waitForTimeout(760);const opened=await page.evaluate(()=>__prop3dPoses()[4]);if(opened.opening!==1||opened.lidAngle>-1.8)throw Error('Game lid did not open');
  await page.keyboard.press('e');await page.keyboard.press('e');await page.waitForTimeout(100);if(await page.locator('#chest-reveal').count())throw Error('E did not dismiss');
  const reward=await page.evaluate(()=>{const b=__BF3,n=b.meta.stash.length;b.openChest(b.G.chests[4]);if(n!==1||b.meta.stash.length!==1)throw Error('Model caused extra loot');return {oneItem:true,repeatSafe:true};});
  // Loaded opened actors must start fully open, not play the opening from closed.
  await page.evaluate(()=>{const b=__BF3;b.G.chests=b.G.chests.map(ch=>({...ch}));});await page.waitForTimeout(80);if((await page.evaluate(()=>__prop3dPoses()[4])).opening!==1)throw Error('Saved open chest reset animation');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{__BF3.meta.reduceMotion=true;__BF3.openChest(__BF3.G.chests[2])});await page.waitForTimeout(130);await page.screenshot({path:'output/playwright/chest-craft-phone-reveal.png'});
  const reveal=await page.locator('#chest-reveal').evaluate(e=>({left:e.getBoundingClientRect().left,width:e.getBoundingClientRect().width,settled:e.classList.contains('settled')}));if(!reveal.settled||reveal.left<0||reveal.width>390)throw Error('Phone reveal or reduced motion');await page.keyboard.press('e');
  await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>{__BF3.meta.quality='low';});await page.waitForTimeout(100);const low=await page.evaluate(()=>({stats:__BF_RENDER_STATS,props:__prop3d()}));if(low.stats.shadows||low.props.err)throw Error('Low quality');
  await page.evaluate(()=>{HERO3D.on=false;__BF3.renderFrame()});await page.waitForTimeout(100);await page.screenshot({path:'output/playwright/chest-craft-fallback.png'});await page.evaluate(()=>HERO3D.on=true);
  if(errors.length)throw Error(errors.join('\n'));return {models,cameras,opening:opened,reward,phone,reveal,lowQuality:true,fallback:true,errors};
 }finally{await ctx.close();}
}
