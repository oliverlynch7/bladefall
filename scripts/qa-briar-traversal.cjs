async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D.ready);await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.openHub();b.enterZone(0);b.meta.camMode='far';b.meta.tutOff=true;for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;});
 const walks=await page.evaluate(()=>{const b=__BF3,p=b.G.p,results=[];function walk(x,z,jump=false){if(jump)b.input.jumpEdge=true;let i=0;for(;i<650;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<12)break;b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);}b.input.jx=b.input.jz=0;results.push({target:[x,z],at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],steps:i,ok:Math.hypot(x-p.x,z-p.z)<20});}
 walk(-130,160);walk(-340,-65);walk(-410,-130);walk(-505,-245);walk(-370,-335);walk(-180,-480);walk(230,-480);walk(440,-390);walk(440,-345);walk(440,-260,true);
 walk(440,-335,true);walk(440,-410);walk(180,-650);walk(-180,-860);
 for(const q of b.G.campaignLayout.edges.find(e=>e.a===2&&e.b===4).points)walk(q.x,q.z);
 walk(120,-1660);walk(475,-1635);walk(300,-1700);walk(175,-1720);walk(175,-1990);walk(310,-2030);
 // Validate the opened route without replaying the dialogue test; collision changes are real.
 b.G.storyState.flags['briar.bridge']=true;b.briarSync();walk(120,-1920);
 for(const [a,c]of [[4,8],[8,10],[10,12]]){for(const q of b.G.campaignLayout.edges.find(e=>e.a===a&&e.b===c).points)walk(q.x,q.z);const r=b.G.rooms[c];walk(r.x,r.z);}
 walk(-210,-4240);return results;});
 await page.setViewportSize({width:1280,height:800});await page.waitForFunction(()=>!BF_LOADING.active);await page.waitForTimeout(300);await page.screenshot({path:'output/playwright/briar-departure-route.png'});if(walks.some(w=>!w.ok))throw Error(JSON.stringify(walks));return {walks,error:await page.evaluate(()=>HERO3D.err)};
}
