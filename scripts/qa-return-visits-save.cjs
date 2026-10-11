async page=>{
  const errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const previouslyOpen of [false,true]){
    await page.goto('http://127.0.0.1:4331/3d/?mute=1');
    await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
    const before=await page.evaluate(async previouslyOpen=>{
      const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
      b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;
      b.meta.zoneDone={keep:true};b.meta.returnVisits={supplies:'accepted'};
      b.meta.hubDialogue={anvil:{introduced:true,newsSeen:true,cursor:null}};
      b.openHub();b.enterZone(2);b.G.p.invuln=999;
      const s=b.G.storyState;
      s.items['rv.supplies.balance.mask']=3;
      s.flags['rv.supplies.balance.open']=previouslyOpen;
      s.notes['rv.supplies.clue']={region:'keep',title:'Food for the Refuge',text:'The loaded basket needs 8 on the other side.'};
      b.captureCampaignCheckpoint();b.autosaveRun();
      return {gold:b.meta.gold,rank:b.meta.classes.warrior,run:!!b.meta.run,storedMask:b.meta.run?.campaign?.storyState?.items?.['rv.supplies.balance.mask'],storedOpen:b.meta.run?.campaign?.storyState?.flags?.['rv.supplies.balance.open']};
    },previouslyOpen);
    if(!before.run||before.storedMask!==3||!!before.storedOpen!==previouslyOpen)throw Error('Legacy fixture did not persist');
    await page.reload();
    await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
    const after=await page.evaluate(async()=>{
      const b=__BF3;await b.briarReady;b.loadMode('rl');const saved=!!b.meta.run;
      b.resumeSavedAdventure();
      return {saved,gold:b.meta.gold,rank:b.meta.classes.warrior,introduced:b.meta.hubDialogue.anvil?.introduced,mask:b.G.storyState?.items?.['rv.supplies.balance.mask'],open:!!b.G.storyState?.flags?.['rv.supplies.balance.open'],rigOpen:b.G.returnSupply?.open,clue:b.G.storyState?.notes?.['rv.supplies.clue']?.text,clueMatch:b.G.storyState?.notes?.['rv.supplies.clue']?.text===BFReturnVisits.SUPPLY_CLUE,ledges:b.G.returnSupply?.ledges?.length,queued:BFJournalNotice.queue.pending};
    });
    if(!after.saved||!after.introduced||before.gold!==after.gold||JSON.stringify(before.rank)!==JSON.stringify(after.rank)||after.mask!==3||after.open!==previouslyOpen||after.rigOpen!==previouslyOpen||!after.clueMatch||after.ledges!==4||after.queued)throw Error(JSON.stringify({previouslyOpen,before,after}));
    checks.push(previouslyOpen?'completed old hoist save reloads open':'partial old weight save reloads unsolved');
  }
  if(errors.length)throw Error(errors.join('; '));
  return {checks,errors};
}
