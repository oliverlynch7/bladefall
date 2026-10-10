async page=>{
 const context=await page.context().browser().newContext(),p=await context.newPage();
 try{
  await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  return await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.classId='warrior';b.openHub();b.enterZone(0);const G=b.G;Object.assign(G.p,{x:2350,y:168,z:-1890,invuln:999});b.briarRequest('world',{key:'home.bell.alarm'});for(let i=0;i<5;i++)b.update(.016);const first=BFHomeBellDefense.foes(G,1).map(e=>({id:e.mid,x:e.x,z:e.z,y:e.y,d:Math.hypot(e.x-G.p.x,e.z-G.p.z)}));for(let i=0;i<480;i++)b.update(.016);const after=first.map(a=>{const e=G.enemies.find(e=>e.mid===a.id);return {id:a.id,x:e.x,z:e.z,y:e.y,d:Math.hypot(e.x-G.p.x,e.z-G.p.z),attack:!!(e.meleeSerial||e.shootCd>0),fallen:e.y<80};});if(!after.some((a,i)=>a.d<first[i].d-45))throw Error('Tower patrol did not advance: '+JSON.stringify({first,after}));if(after.some(a=>a.fallen))throw Error('Tower patrol fell from roof: '+JSON.stringify({first,after}));return {first,after};});
 }finally{await context.close();}
}
