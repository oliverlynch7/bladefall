async page => {
  const context=await page.context().browser().newContext({viewport:{width:1280,height:800}}),p=await context.newPage(),errors=[],checks=[];
  p.on('pageerror',e=>errors.push(e.message));
  try {
    const url='http://127.0.0.1:4332/3d/?mute=1&qa=lift-legacy';
    const enter=async()=>{await p.goto(url);await p.waitForFunction(()=>window.__BF3&&window.BFPrison&&window.BFStoryState);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();b.enterZone(2);b.nextArea();b.meta.tutOff=true;b.meta.camMode='far';b.G.p.invuln=999;});await p.waitForFunction(()=>__BF3.G.prison&&!BF_LOADING.active);};
    const resume=async()=>{await p.reload();await p.waitForFunction(()=>window.__BF3&&window.BFPrison&&window.BFStoryState);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.resumeSavedAdventure();b.meta.tutOff=true;});await p.waitForFunction(()=>__BF3.G.prison&&!BF_LOADING.active);};
    await enter();
    await p.evaluate(()=>{const b=__BF3,s=BFStoryState.create();Object.assign(s.flags,{'kd.roster':true,'kd.hidden':true,'kd.free':true,'kd.papers':true});s.items['kd.lift.mask']=5;s.items['kd.lift']=4;s.notes['kd.lift']={region:'keep',title:'Lift weights',text:'Set the old weights to four.'};b.meta.run.campaign.storyState=s;b.persist();});
    await resume();
    const partial=await p.evaluate(()=>{const b=__BF3,G=b.G;for(let i=0;i<520;i++)b.update(.016);return {area:G.area,mask:G.storyState.items['kd.lift.mask'],open:!!G.storyState.flags['kd.lift.open'],handle:!!G.storyObjects.find(o=>o.key==='kd.lift.winch'),lift:G.movers.find(m=>m.prisonLift).h,note:G.storyState.notes['kd.lift']?.text};});
    if(partial.area!==1||partial.mask!==5||partial.open||!partial.handle||partial.lift!==180||!partial.note?.includes('Walk around'))throw Error('Old partial lift save '+JSON.stringify(partial));checks.push('old partial weight save loads with winch available and no skipped progression');
    await p.evaluate(()=>{const b=__BF3,s=BFStoryState.create();Object.assign(s.flags,{'kd.roster':true,'kd.hidden':true,'kd.free':true,'kd.papers':true,'kd.lift.open':true});s.items['kd.lift.mask']=5;s.notes['kd.lift']={region:'keep',title:'Lift weights',text:'Old lift copy'};b.meta.run.campaign.storyState=s;b.persist();});
    await resume();
    const completed=await p.evaluate(()=>{const b=__BF3,G=b.G;for(let i=0;i<1650;i++)b.update(.016);return {area:G.area,open:!!G.storyState.flags['kd.lift.open'],transfer:!!G.storyState.flags['kd.transfer'],portal:!!G.portal,handleVisible:b.briarObjects().some(o=>o.key==='kd.lift.winch'),lift:G.movers.find(m=>m.prisonLift).h};});
    if(completed.area!==1||!completed.open||!completed.transfer||!completed.portal||completed.handleVisible)throw Error('Old completed lift save '+JSON.stringify(completed));checks.push('old completed lift save reaches release hall without replaying winch');
    if(errors.length)throw Error(JSON.stringify(errors));return {checks,partial,completed,errors};
  } finally {await context.close();}
}
