async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[];
 try{
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.openHub();b.enterZone(0);b.captureCampaignCheckpoint();const s=b.meta.run.campaign.storyState;s.items['home.bells']=2;s.flags['event.home.bell.sun']=true;s.flags['event.home.bell.water']=true;s.notes['home.bells']={region:'outskirts',title:'The farm bells',text:'First sun, then water, then wheat.'};b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const partial=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState;return {zone:b.G.zone,area:b.G.area,oldCount:s.items['home.bells'],oldSun:!!s.flags['event.home.bell.sun'],newBell:b.briarObjects().some(o=>o.key==='home.bell.alarm'),oldBells:b.G.storyObjects.filter(o=>/^home\.bell\.(sun|water|wheat)$/.test(o.key)).length,open:!!s.flags['home.bells.open'],note:s.notes['home.bells']?.text};});
  if(partial.zone!==0||partial.area!==0||partial.oldCount!==2||!partial.oldSun||!partial.newBell||partial.oldBells||partial.open||!partial.note?.includes('warning bell'))throw Error('Partial old save: '+JSON.stringify(partial));
  await page.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='home.bell.alarm');Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});b.update(.016);if(b.G.homeBell.wave!==1)throw Error('Old partial save did not start new encounter');b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const resumed=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();b.update(.016);const far=b.G.homeBell?.wave;Object.assign(b.G.p,{x:2350,y:168,z:-1810});b.update(.016);return {alarm:!!b.G.storyState.flags['home.bell.alarm'],open:!!b.G.storyState.flags['home.bells.open'],far,wave:b.G.homeBell?.wave,foes:BFHomeBellDefense.foes(b.G,1).length};});
  if(!resumed.alarm||resumed.open||resumed.far!==0||resumed.wave!==1||resumed.foes!==2)throw Error('Alarm resume: '+JSON.stringify(resumed));
  const retry=await page.evaluate(()=>{const b=__BF3;if(!b.restartCampaignCheckpoint())throw Error('Campaign checkpoint unavailable');const atVillage=b.G.homeBell.wave===0&&b.G.storyState.flags['home.bell.alarm'];Object.assign(b.G.p,{x:2350,y:168,z:-1810});b.update(.016);return {atVillage,wave:b.G.homeBell.wave,foes:BFHomeBellDefense.foes(b.G,1).length};});
  if(!retry.atVillage||retry.wave!==1||retry.foes!==2)throw Error('Checkpoint retry: '+JSON.stringify(retry));
  await page.evaluate(()=>{const b=__BF3,s=b.meta.run.campaign.storyState;s.flags['home.bells.open']=true;s.flags['event.home.bell.wheat']=true;b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const opened=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState;return {open:!!s.flags['home.bells.open'],alarm:b.briarObjects().some(o=>o.key==='home.bell.alarm'),chest:b.briarObjects().some(o=>o.key==='home.bell.cache'),note:s.notes['home.bells']?.text,wave:b.G.homeBell?.wave};});
  if(!opened.open||opened.alarm||!opened.chest||!opened.note?.includes('chest key')||opened.wave!==0)throw Error('Opened old save: '+JSON.stringify(opened));
  if(errors.length)throw Error('Page errors: '+JSON.stringify(errors));
  return {partial,resumed,retry,opened};
 }finally{await context.close();}
}
