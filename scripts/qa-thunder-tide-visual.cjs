async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(5);b.nextArea();b.meta.tutOff=true;b.meta.camMode='far';for(const e of b.G.enemies)e.stunT=999;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.thunder);
 const views=[['approach',-790,-4410,-2.2,0],['midpoint',-1090,-4600,-2.7,6],['landing',-1160,-4800,-1.55,12]];
 for(const [name,x,z,yaw,clock]of views){await page.evaluate(({x,z,yaw,clock})=>{const b=__BF3,p=b.G.p;Object.assign(p,{x,z,y:300,yaw,vy:0,vx:0,vz:0,onGround:true});b.G.thunder.clock=clock;for(let i=0;i<12;i++)b.update(.016);},{x,z,yaw,clock});await page.waitForTimeout(120);await page.screenshot({path:'output/thunder-tide-'+name+'.png'});}
 return views.map(v=>v[0]);
}
