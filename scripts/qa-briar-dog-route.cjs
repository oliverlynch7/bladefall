async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4339/3d/?devbriar=1&mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&document.getElementById('bstart'));
 await page.locator('#bi').check();await page.locator('#bstart').click();
 const result=await page.evaluate(()=>{
  const b=__BF3,pr=BFBriarBeta.progress;Object.assign(pr,{medicine:true,healing:true,bridge:true,evacuated:true});
  Object.assign(b.G.p,{x:0,z:-4250,y:0,onGround:true});b.updateInteract();b.doInteract();
  const g=b.G,s=g.devBriar,p=g.p,guard=s.groups.find(q=>q.id==='dogs');guard.spawned=true;
  Object.assign(p,{x:690,z:-1410,y:s.terrain.height(690,-1410),onGround:true});
  b.updateInteract();if(g.interact?.label!=='Release the two dogs')throw Error('Dogs unavailable: '+g.interact?.label);
  const before=s.dogs.map(d=>({x:d.x,z:d.z})),charges=pr.smallHeals;b.doInteract();
  for(let i=0;i<180;i++)b.update(1/60);
  const after=s.dogs.map(d=>({x:d.x,z:d.z,route:d.route}));
  return {before,after,rescued:pr.dogs,chargesGained:pr.smallHeals-charges,nearPerch:after.every(d=>Math.hypot(d.x-500,d.z+1580)<40)};
 });
 if(!result.rescued||result.chargesGained!==1||!result.nearPerch||errors.length)throw Error(JSON.stringify({result,errors}));
 return {result,errors};
}
