async root=>{
 const ctx=await root.context().browser().newContext({viewport:{width:1280,height:720}}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|WebGL|GLSL/.test(m.text()))errors.push(m.text());});
 try{
  await page.goto('http://127.0.0.1:4345/3d/?mute=1&qa=campaign-readiness-2182f');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await page.evaluate(async()=>{await __BF3.briarReady;});
  const scenes=[];
  for(let zone=0;zone<8;zone++)for(const area of [0,1,-1]){
   const state=await page.evaluate(({zone,area})=>{
    const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.camMode='far';b.meta.petActive=null;b.openHub();b.enterZone(zone);b.G.area=area;b.loadArea();const g=b.G;g.p.invuln=999;for(const e of g.enemies)e.stunT=999;
    const overlaps=[];for(const n of g.storyNpcs||[])for(const o of [...g.obstacles,...g.walls.map(w=>({...w,h:(w.y0||0)+w.h}))]){if(o.disabled||o.invisible)continue;if(Math.abs(n.x-o.x)<o.w/2+8&&Math.abs(n.z-o.z)<o.d/2+8&&(o.y0||0)<(n.y||0)+48&&o.h>(n.y||0)+12)overlaps.push(n.id);}
    if(overlaps.length)throw Error('NPC collision '+zone+'/'+area+': '+overlaps.join(','));
    return {zone,area,name:g.areaName,npcs:g.storyNpcs?.length||0};
   },{zone,area});await page.waitForFunction(()=>!BF_LOADING.active);await page.waitForTimeout(160);
   for(const mode of ['far','fps','shoulder']){await page.evaluate(mode=>__BF3.meta.camMode=mode,mode);await page.waitForTimeout(90);const v=await page.evaluate(()=>__BF_RENDER_STATS);if(!v.triangles||!Number.isFinite(v.triangles))throw Error('Invalid renderer '+zone+'/'+area+'/'+mode);if(mode==='shoulder')await page.screenshot({path:'output/playwright/readiness-shoulder-z'+zone+'-a'+area+'.png'});}
   await page.evaluate(()=>__BF3.meta.camMode='far');await page.waitForTimeout(100);state.render=await page.evaluate(()=>__BF_RENDER_STATS);await page.screenshot({path:'output/playwright/readiness-verified-z'+zone+'-a'+area+'.png'});scenes.push(state);
  }
  const occlusion=await page.evaluate(async()=>{
   const T=await import('./three.module.js'),m=await import('./campaign-scene.js?v=2182f'),list=[],geo=new T.BoxGeometry(80,80,80),mat=new T.MeshStandardMaterial(),mesh=new T.InstancedMesh(geo,mat,1),matrix=new T.Matrix4().makeTranslation(0,70,55);mesh.setMatrixAt(0,matrix);m.trackCampaignOccluder(list,mesh,0,matrix);__BF3.meta.camMode='far';
   const world={p:{x:0,y:0,z:0},eye:{x:0,y:120,z:120}};const obscuring=m.updateCampaignOccluders(list,world);if(obscuring!==1)throw Error('Tall foreground never clears');world.p.y=110;if(m.updateCampaignOccluders(list,world)!==0)throw Error('Platform hidden beneath feet');__BF3.meta.camMode='fps';world.p.y=0;if(m.updateCampaignOccluders(list,world)!==0)throw Error('First-person wall became transparent');mesh.dispose();geo.dispose();mat.dispose();return {foregroundClears:true,supportStaysSolid:true,firstPersonSolid:true};
  });
  await page.evaluate(()=>{const b=__BF3;b.openHub();b.enterZone(5);b.nextArea();b.meta.quality='low';b.meta.camMode='far';Object.assign(b.G.p,{x:-1560,y:300,z:-4710,vy:0});b.G.p.invuln=999;});await page.waitForTimeout(500);const low=await page.evaluate(()=>__BF_RENDER_STATS);if(low.shadows)throw Error('Low detail still uses shadows');await page.screenshot({path:'output/playwright/readiness-coast-occlusion-low.png'});
  if(errors.length)throw Error(errors.join(';'));return {scenes,occlusion,lowQuality:low,errors};
 }finally{await ctx.close();}
}
