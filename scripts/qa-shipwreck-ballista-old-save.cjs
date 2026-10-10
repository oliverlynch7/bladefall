async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(5);const c=b.meta.run.campaign,s=c.storyState;c.revision=2015;s.items['sc.code']=2;s.flags['event.sc.code.1']=true;s.flags['sc.code.note']=true;s.notes['sc.code']={region:'storm',title:'The ship chest',text:'Count lanterns, then enter numbers.'};b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const partial=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState;return {area:b.G.area,oldCount:s.items['sc.code'],open:!!s.flags['sc.code.open'],oldPads:b.G.storyObjects.filter(o=>/^sc\.code\.[1-4]$/.test(o.key)).length,ballista:b.briarObjects().some(o=>o.key==='sc.ballista'),note:s.notes['sc.code']?.text};});
  if(partial.area!==0||partial.oldCount!==2||partial.open||partial.oldPads||!partial.ballista||!partial.note?.includes('ballista'))throw Error('Old partial Shore save: '+JSON.stringify(partial));
  await page.evaluate(()=>{const b=__BF3,s=b.meta.run.campaign.storyState;s.flags['sc.code.open']=true;s.flags['event.sc.code.3']=true;s.rewards['sc.stormshot']={kind:'stormshot',amount:1,claimed:true,recipients:['solo']};b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const opened=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState;return {open:!!s.flags['sc.code.open'],ballista:b.briarObjects().some(o=>o.key==='sc.ballista'),claim:b.briarObjects().some(o=>o.key==='sc.code.claim'),note:b.briarObjects().some(o=>o.key==='sc.code.note'),reward:!!s.rewards['sc.stormshot']};});
  if(!opened.open||opened.ballista||opened.claim||opened.note||!opened.reward||errors.length)throw Error(JSON.stringify({opened,errors}));
  return {partial,opened,errors};
 }finally{await context.close();}
}
