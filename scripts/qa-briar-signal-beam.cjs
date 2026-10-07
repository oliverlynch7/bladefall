async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4339/3d/?devbriar=1&mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&document.getElementById('bstart'));
 await page.locator('#bi').check();await page.locator('#bstart').click();
 await page.evaluate(()=>{const b=__BF3,pr=BFBriarBeta.progress;Object.assign(pr,{medicine:true,healing:true,bridge:true,evacuated:true});Object.assign(b.G.p,{x:0,z:-4250,y:0,onGround:true});b.updateInteract();b.doInteract();const g=b.G,s=g.devBriar;Object.assign(g.p,{x:0,z:225,y:s.terrain.height(0,225),onGround:true,yaw:Math.PI});g.camYaw=Math.PI;b.update(1/60);});
 await page.waitForFunction(()=>__BF3.G?.devBriar?.snarePosts?.[0]?.art,null,{timeout:15000});
 const before=await page.evaluate(()=>{const s=__BF3.G.devBriar,rig=s.snarePosts[0].art.parent.userData.signalBeam;return {beam:!s.signalOff,visible:rig?.visible===true,mesh:!!rig};});
 await page.screenshot({path:'output/playwright/briar-signal-before.png'});
 await page.evaluate(()=>{const b=__BF3,g=b.G,s=g.devBriar;Object.assign(g.p,{x:s.signal.x,z:s.signal.z,y:s.signal.y,onGround:true});b.updateInteract();if(g.interact?.label!=='Cut the signal cable')throw Error('Cable interaction unavailable: '+g.interact?.label);b.doInteract();});
 await page.waitForTimeout(200);
 const after=await page.evaluate(()=>{const s=__BF3.G.devBriar;return {signal:BFBriarBeta.progress.signal,off:s.signalOff,visible:s.snarePosts[0].art.parent.userData.signalBeam?.visible,events:s.events.filter(e=>e.kind==='signal').length};});
 if(!before.beam||!before.visible||!before.mesh||!after.signal||!after.off||after.visible||after.events!==1||errors.length)throw Error(JSON.stringify({before,after,errors}));
 return {before,after,errors};
}
