async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.camMode='far';b.openHub();b.enterZone(2);b.nextArea();});
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.prison&&__world3d().counts.keepArt);
  const result=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p,legs=[];G.storyState.flags['kd.lift.open']=true;for(const e of G.enemies){e.dead=true;e.hp=0;}
    Object.assign(p,{x:0,z:-3230,y:0,vy:0,vx:0,vz:0,onGround:true,invuln:0,hp:110});G.prison.pressClock=0;
    const phase=i=>(G.prison.pressClock+[0,1.5,3][i])%4.6;
    const step=()=>b.update(.016);
    for(let i=0;i<3;i++){
      let wait=0;while(phase(i)>.35&&wait++<600)step();if(wait>=600)throw Error('wait did not reach opening '+i);
      const start={z:p.z,hp:p.hp,t:G.prison.pressClock},target=BFPrison.PRESS_Z[i]+70;
      let steps=0;while(p.z<target-17&&steps++<240){b.input.jx=0;b.input.jz=1;step();if(p.hp<start.hp)throw Error('hit while crossing press '+i+' at '+JSON.stringify({z:p.z,t:G.prison.pressClock,phase:phase(i)}));}
      b.input.jx=b.input.jz=0;
      if(steps>=240||p.z<target-20)throw Error('could not pass press '+i+' at '+p.z);
      legs.push({press:i,wait,steps,start,end:{z:p.z,hp:p.hp,t:G.prison.pressClock},phase:phase(i)});
    }
    let approach=0;while(Math.hypot(p.x+205,p.z+2760)>75&&approach++<240){const dx=-205-p.x,dz=-2760-p.z,d=Math.hypot(dx,dz);b.input.jx=dx/d;b.input.jz=dz/d;step();}b.input.jx=b.input.jz=0;
    if(approach>=240)throw Error('brake unreachable after presses '+JSON.stringify({x:p.x,z:p.z}));
    b.briarRequest('world',{key:'kd.press.brake'});if(!G.storyState.flags['kd.deep.open'])throw Error('reachable brake did not open gate');
    // Manual fixed-step traversal outruns RAF rendering. Snap the test camera
    // to the position it would have reached during real-time keyboard play.
    Object.assign(G.cam,{x:p.x,y:p.y,z:p.z});delete G._cameraBoom;
    return {legs,approach,brake:{x:p.x,z:p.z},open:!!G.storyState.flags['kd.deep.open'],hp:p.hp};
  });
  await page.waitForTimeout(250);
  const frame=await page.evaluate(()=>({p:{x:__BF3.G.p.x,y:__BF3.G.p.y,z:__BF3.G.p.z,vx:__BF3.G.p.vx,vz:__BF3.G.p.vz},eye:__BF3.G.eye,obstruction:__BF3.G.cameraObstruction}));
  await page.screenshot({path:'output/playwright/prison-press-traversed.png'});
  if(errors.length)throw Error(JSON.stringify(errors));
  return {...result,frame,errors};
}
