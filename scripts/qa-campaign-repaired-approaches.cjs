async root=>{
 const c=await root.context().browser().newContext({viewport:{width:1280,height:720}}),page=await c.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
 try{await page.goto('http://127.0.0.1:4345/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await page.evaluate(()=>__BF3.briarReady);const rows=[];
 for(const test of [{zone:5,start:[0,-430,40],path:[[-80,-520],[-170,-590],[-230,-620]],key:'tc.brake'},{zone:1,start:[2150,-2800,0],path:[[2220,-3050],[2300,-3230],[2350,-3270]],key:'lc.cache'}]){
  await page.evaluate(t=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.petActive=null;b.meta.camMode='shoulder';b.openHub();b.enterZone(t.zone);b.G.area=1;b.loadArea();Object.assign(b.G.p,{x:t.start[0],z:t.start[1],y:t.start[2],vy:0,vx:0,vz:0,invuln:999,onGround:true});for(const e of b.G.enemies)e.stunT=999;},test);
  await page.waitForFunction(()=>!BF_LOADING.active);const movement=await page.evaluate(t=>{const b=__BF3,p=b.G.p,out=[];for(const [x,z]of t.path){for(let i=0;i<1000;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<8)break;b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);}b.input.jx=b.input.jz=0;if(Math.hypot(x-p.x,z-p.z)>15||Math.abs(p.y-t.start[2])>8)throw Error('Broken approach '+JSON.stringify({key:t.key,target:[x,z],at:[p.x,p.y,p.z]}));out.push([p.x,p.y,p.z]);}return out;},test);
  await page.evaluate(()=>document.getElementById('storycard').classList.remove('show'));await page.waitForTimeout(150);await page.screenshot({path:'output/playwright/campaign-approach-'+test.key+'.png'});await page.keyboard.press('KeyE');await page.waitForFunction(key=>__BF3.G.storyState.flags[key],test.key);rows.push({key:test.key,movement,keyboardInteraction:true});
 }
 if(errors.length)throw Error(errors.join(';'));return {rows,errors};}finally{await c.close();}
}
