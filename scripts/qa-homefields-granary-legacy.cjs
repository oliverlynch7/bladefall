async page=>{
 const checks=[],ok=(name,pass)=>{if(!pass)throw Error(name);checks.push(name)};
 for(const completed of [false,true]){
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async completed=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;b.openHub();b.enterZone(0);const s=b.meta.run.campaign.storyState;s.items['home.grain']=completed?5:3;s.items['home.grain.mask']=completed?5:3;if(completed)s.flags['home.grain.open']=true;b.persist();},completed);
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun()});await page.waitForFunction(()=>!BF_LOADING.active);
  const state=await page.evaluate(()=>({open:__BF3.G.granary.open,door:__BF3.G.walls.some(w=>w.grainDoor),spout:__BF3.G.granary.spout,hopper:__BF3.G.granary.hopper,controls:__BF3.briarObjects().filter(o=>['home.grain.spout','home.grain.hopper'].includes(o.key)).length}));
  ok(completed?'old solved save starts open':'old partial weights do not solve the new route',completed?state.open&&!state.door&&state.spout&&state.hopper&&state.controls===0:!state.open&&state.door&&!state.spout&&!state.hopper&&state.controls===2);
 }
 return checks;
}
