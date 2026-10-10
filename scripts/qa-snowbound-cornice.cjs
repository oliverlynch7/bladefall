async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.openHub();b.enterZone(3);b.meta.tutOff=true;
  const G=b.G,p=G.p,qs=G.peaks?.corniceRidge,landings=[],checks=[];
  if(!qs)throw Error('Snowbound scene missing cornice: '+JSON.stringify({zone:G.zone,area:G.area,peaks:G.peaks&&Object.keys(G.peaks),script:BFSnowbound.build.toString().includes('corniceRidge')}));
  G.enemies.forEach(e=>e.stunT=9999);p.invuln=9999;
  Object.assign(p,{x:0,z:-4770,y:740,vy:0,vx:0,vz:0,onGround:true});
  for(const [index,q]of qs.entries()){
   let reached=false;
   for(let step=0;step<650;step++){
    const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
    if(d<22&&Math.abs(p.y-q.y)<48&&p.onGround){reached=true;break;}
    b.input.jx=dx/Math.max(d,1);b.input.jz=dz/Math.max(d,1);
    if(p.onGround&&d>48){b.input.jumpEdge=true;b.input.jump=true;}
    b.update(.016);
   }
   b.input.jx=b.input.jz=0;b.input.jump=false;
   landings.push({index,goal:[q.x,q.z,q.y],at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],reached});
   if(!reached)break;
  }
  if(landings.length!==qs.length||landings.some(q=>!q.reached))throw Error('Cornice jump line fails: '+JSON.stringify(landings));
  checks.push('all six ledges reachable with ordinary jump input');
  const anchor=G.storyObjects.find(o=>o.key==='ff.reflect.3');
  if(Math.hypot(p.x-anchor.x,p.z-anchor.z)>115||Math.abs(p.y-anchor.y)>65)throw Error('Anchor out of interaction range');
  checks.push('last landing is within anchor reach');
  const fresh=BFStoryState.create();for(const key of ['ff.trail','ff.part','ff.heath','ff.heater','ff.reflect.clue','event.ff.reflect.clue'])fresh.flags[key]=true;G.storyState=fresh;
  const guidance=BFPartyNavigation.target(G);
  if(guidance?.navLabel!=='Cornice ledges'||guidance.key)throw Error('Main objective does not point to the cornice ledges');
  checks.push('main objective points to the reachable cornice ledges');
  b.briarRequest('world',{key:'ff.reflect.3'});
  if(!G.storyState.flags['ff.reflect.open'])throw Error('Reachable anchor did not open cave');
  checks.push('anchor release opens cave in real scene');
  return {checks,landings,triangles:__world3d().counts.totalTriangles};
 });
 if(errors.length)throw Error(JSON.stringify(errors));return result;
}
