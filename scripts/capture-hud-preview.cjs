// Capture real scenery in disposable storage; no user saves are read or changed.
async root=>{
 const c=await root.context().browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:1}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('http://127.0.0.1:4345/3d/?mute=1');
  await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(()=>__BF3.briarReady);
  await p.evaluate(()=>{const b=__BF3;b.loadMode('rl');Object.assign(b.meta,{classId:'warrior',run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,autoAttack:false,petActive:null,dialogueTTS:false,camMode:'far'});b.openHub();b.enterZone(0);Object.assign(b.G.storyState.flags,{'thomas.ready':true,'mara.healing':true});b.G.storyState.quests['briar.escape']='active';b.briarSync();Object.assign(b.G.p,{x:0,z:-1670,y:0,invuln:99999});for(const e of b.G.enemies)e.stunT=99999;b.G.camYaw=Math.PI;});
  await p.waitForFunction(()=>!BF_LOADING.active);await p.waitForTimeout(2200);
  await p.screenshot({path:'output/playwright/hud189-current.png'});
  await p.screenshot({path:'public/design/hud-preview/current-hud.jpg',type:'jpeg',quality:88});
  const canvases=await p.evaluate(()=>[...document.querySelectorAll('canvas')].map(e=>({id:e.id,parent:e.parentElement.id,display:getComputedStyle(e).display,z:getComputedStyle(e).zIndex})));
  await p.evaluate(()=>{__BF3.meta.objectiveArrows=false;__BF3.meta.friendArrows=false;});
  await p.addStyleTag({content:'body > :not(#gl):not(script):not(style):not(link), canvas:not(#gl) { visibility:hidden !important } #gl { visibility:visible !important }'});
  await p.waitForTimeout(100);
  await p.screenshot({path:'public/design/hud-preview/briar-scene.jpg',type:'jpeg',quality:92});
  return{canvases,errors};
 }finally{await c.close();}
}
