async page=>{
 await page.goto('http://127.0.0.1:4339/3d/?devbriar=1&mute=1&qa='+Date.now());
 await page.waitForFunction(()=>window.__BF3&&document.getElementById('bstart'),null,{polling:100});
 await page.locator('#bi').check();await page.locator('#bstart').click();
 return page.evaluate(()=>{
  const b=__BF3,pr=BFBriarBeta.progress;
  Object.assign(pr,{medicine:true,healing:true,bridge:true,evacuated:true});
  const h=b.G;Object.assign(h.p,{x:0,z:-4250,y:0,onGround:true});b.updateInteract();
  if(h.interact?.label!=='Enter the Black Woods')throw Error('Chapter fixture failed');b.doInteract();
  const g=b.G,p=g.p,s=g.devBriar,log=[];g.enemies=[];for(const q of s.groups)q.spawned=true;
  const step=()=>{b.update(1/60);if(b.mode!=='play')throw Error('Left play mode');};
  const walk=(x,z,n=550)=>{b.releaseKeyboard();for(let i=0;i<n;i++){
   const d=Math.hypot(x-p.x,z-p.z);if(d<12){b.releaseKeyboard();return;}
   g.camYaw=Math.atan2(x-p.x,z-p.z);b.input.up=true;step();
  }throw Error('Walk stuck at '+JSON.stringify([p.x,p.y,p.z]));};
  function jump(id){const q=s.plats.find(q=>q.id===id);if(!q)throw Error('Missing '+id);
   const a=Math.atan2(q.x-p.x,q.z-p.z);walk(p.x+Math.sin(a)*24,p.z+Math.cos(a)*24,60);
   b.input.jump=true;b.input.jumpEdge=true;let left=false;
   for(let i=0;i<150;i++){g.camYaw=Math.atan2(q.x-p.x,q.z-p.z);b.input.up=Math.hypot(q.x-p.x,q.z-p.z)>5;step();
    if(!p.onGround)left=true;if(left&&p.onGround){b.releaseKeyboard();if(Math.abs(p.y-q.h)>3)throw Error('Missed '+id+' at '+JSON.stringify([p.x,p.y,p.z]));walk(q.x,q.z,90);log.push({id,x:Math.round(p.x),y:Math.round(p.y),z:Math.round(p.z)});return;}
   }throw Error('Jump timeout '+id);
  }
  // This one teleport is a test fixture to isolate the northern side route.
  Object.assign(p,{x:250,z:-3070,y:s.terrain.height(250,-3070),onGround:true,vx:0,vy:0,vz:0});
  walk(380,-3150);
  for(const id of ['watch0','watch1','watch2','watch3','watch4','watch-top'])jump(id);
  b.updateInteract();if(g.interact?.label!=='Collect Rift Shard')throw Error('Shard not reachable');b.doInteract();
  return {log,shards:pr.shards,falls:pr.falls,method:'Continuous movement and jump inputs on the north watch; chapter/setup and segment start are fixtures.'};
 });
}
