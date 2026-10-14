async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.meta.tutOff=true;b.openHub();b.enterZone(1);b.nextArea();b.G.p.invuln=999;});await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.canyon);
 const result=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,y:o.y,z:o.z,vx:0,vz:0,vy:0});b.briarRequest('world',{key});},talk=(id,choice)=>{const n=G.storyNpcs.find(n=>n.id===id);Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:id});b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};
  act('lc.orders');talk('ward','orders');talk('ruth','help');act('lc.alarm');for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.cage.north');
  for(let i=0;i<600&&G.canyon.northWave<1;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z,vx:0,vz:0,vy:0});b.update(.016);}
  if(G.canyon.northWave!==1)throw Error('first wave did not appear');const first=G.enemies.find(e=>e.canyonEscortWave===1&&!e.dead);const initial=G.canyon.northHp.reduce((a,b)=>a+b,0),trace=[];
  for(let i=0;i<450&&G.canyon.northActive&&G.canyon.northHp.reduce((a,b)=>a+b,0)===initial;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z,vx:0,vz:0,vy:0});b.update(.016);if(i%50===0)trace.push({i,enemy:[Math.round(first.x),Math.round(first.z)],prisoner:[Math.round(n.x),Math.round(n.z)],wind:first.meleeW,active:first.meleeActive,serial:first.meleeSerial});}
  if(G.canyon.northHp.reduce((a,b)=>a+b,0)>=initial)throw Error(JSON.stringify({reason:'first live AI did not hit prisoner',trace,status:BFLostCanyon.status(G)}));
  const firstAfter=G.canyon.northHp.reduce((a,b)=>a+b,0);first.hp=0;first.dead=true;
  for(let i=0;i<900&&G.canyon.northWave<2;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z,vx:0,vz:0,vy:0});b.update(.016);}
  if(G.canyon.northWave!==2)throw Error(JSON.stringify({reason:'second wave did not appear',status:BFLostCanyon.status(G)}));
  const second=G.enemies.find(e=>e.canyonEscortWave===2&&!e.dead);if(!second||!G.segments.some(s=>Math.abs(second.x-s.x)<s.w/2&&Math.abs(second.z-s.z)<s.d/2))throw Error('second pursuer spawned off the walkable yard');
  for(let i=0;i<500&&G.canyon.northActive&&G.canyon.northHp.reduce((a,b)=>a+b,0)===firstAfter;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z,vx:0,vz:0,vy:0});b.update(.016);if(i%50===0)trace.push({wave:2,i,enemy:[Math.round(second.x),Math.round(second.z)],prisoner:[Math.round(n.x),Math.round(n.z)],wind:second.meleeW,active:second.meleeActive,serial:second.meleeSerial});}
  if(G.canyon.northHp.reduce((a,b)=>a+b,0)>=firstAfter)throw Error(JSON.stringify({reason:'second live AI did not hit prisoner',trace,status:BFLostCanyon.status(G)}));
  return {initial,firstAfter,after:G.canyon.northHp.reduce((a,b)=>a+b,0),trace,enemy:[second.x,second.z],prisoner:[G.canyonPrisoners.find(n=>n.group==='north').x,G.canyonPrisoners.find(n=>n.group==='north').z]};
 });if(errors.length)throw Error(JSON.stringify(errors));return {...result,errors};
}
