async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.meta.tutOff=true;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Castle Gates');
 const result=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p;for(const e of G.enemies)e.dead=true;
  Object.assign(p,{x:-700,z:-3000,y:100,vx:0,vy:0,vz:0,onGround:true,invuln:0});
  G.lastSafe={x:p.x,z:p.z,y:p.y};const hp=p.hp;
  let fell=false;for(let i=0;i<260;i++){
   b.input.jx=0;b.input.jz=-1;b.input.jump=false;b.update(.016);
   if(p.hp<hp){fell=true;break;}
  }
  b.input.jx=b.input.jz=0;
  if(!fell)throw Error('walking into the gap did not cause a fall');
  if(b.mode!=='play'||p.dead||Math.hypot(p.x-G.lastSafe.x,p.z-G.lastSafe.z)>5||p.hp<=0)throw Error('fall did not recover at the last safe ledge '+JSON.stringify({p:{x:p.x,z:p.z,y:p.y,hp:p.hp},safe:G.lastSafe,mode:b.mode}));
  const after={x:p.x,z:p.z,y:p.y,hp:p.hp,hpLost:hp-p.hp,mode:b.mode};
  for(let i=0;i<90;i++)b.update(.016);
  if(!p.onGround||Math.hypot(p.x-G.lastSafe.x,p.z-G.lastSafe.z)>5)throw Error('player could not settle and retry '+JSON.stringify({p:{x:p.x,z:p.z,y:p.y},safe:G.lastSafe}));
  return {after,settled:{x:p.x,z:p.z,y:p.y,onGround:p.onGround},returnOpen:!!G.storyState.flags['cg.catch.west']};
 });
 if(errors.length)throw Error(errors.join(';'));return {...result,errors};
}
