async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await (await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.openHub();});
 const results=[];
 for(const [zone,area,name] of [[6,0,'Palace Courtyard'],[6,1,'Sky Library'],[6,-1,'Guardian Hall'],[7,0,'Castle Gates'],[7,1,'Long Ascent'],[7,-1,'The King’s Hall']]){
   await page.evaluate(({zone,area})=>{const b=__BF3;b.enterZone(zone);b.G.area=area;b.loadArea();b.G.p.invuln=999;}, {zone,area});
   await page.waitForFunction(expected=>!BF_LOADING.active&&__world3d().counts.name===expected,name);
   const status=await page.evaluate(()=>({name:__world3d().counts.name,deepArt:__world3d().counts.deepArt,triangles:__world3d().counts.totalTriangles,error:__world3d().err}));
   if(!status.deepArt||status.error||status.triangles<1000)throw Error(JSON.stringify({zone,area,status}));
   results.push(status);
 }
 if(errors.length)throw Error(errors.join(';'));
 return {results,errors};
}
