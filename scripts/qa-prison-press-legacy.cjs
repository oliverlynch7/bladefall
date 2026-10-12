async page=>{
  const context=await page.context().browser().newContext({viewport:{width:1280,height:800}}),p=await context.newPage(),errors=[],checks=[];
  p.on('pageerror',e=>errors.push(e.message));
  try{
    const url='http://127.0.0.1:4331/3d/?mute=1&qa=press-legacy';
    const ready=async()=>{await p.waitForFunction(()=>window.__BF3&&window.BFPrison&&window.BFStoryState&&HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.tutOff=true;});};
    await p.goto(url);await ready();await p.evaluate(()=>{const b=__BF3;b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(2);b.nextArea();});
    await p.waitForFunction(()=>__BF3.G.prison&&!BF_LOADING.active);
    const oldState=completed=>p.evaluate(completed=>{
      const b=__BF3,s=BFStoryState.create();Object.assign(s.flags,{'kd.roster':true,'kd.hidden':true,'kd.free':true,'kd.papers':true,'kd.lift.open':true,'kd.transfer':true});
      if(completed)s.flags['kd.deep.open']=true;
      s.items['kd.brace.mask']=4;s.items['kd.deep.side.0']=1;s.items['kd.deep.side.1']=1;s.items['kd.deep.side.2']=2;
      s.notes['kd.depth']={region:'keep',title:'Old weight bank',text:'Balance the old beams.'};
      b.meta.run.campaign.storyState=s;b.persist();
    },completed);
    const resume=async()=>{await p.reload();await ready();await p.evaluate(()=>__BF3.resumeSavedAdventure());await p.waitForFunction(()=>__BF3.G.prison&&!BF_LOADING.active);};
    await oldState(false);await resume();
    const partial=await p.evaluate(()=>{const b=__BF3,G=b.G;for(let i=0;i<190;i++)b.update(.016);return {open:!!G.storyState.flags['kd.deep.open'],brake:b.briarObjects().some(o=>o.key==='kd.press.brake'),gate:G.obstacles.some(o=>o.prisonBlock==='depth'),down:G.prison.presses.some(q=>q.down),note:G.storyState.notes['kd.depth']?.text,shard:b.worldRiftShards().some(q=>q.id==='RK-03')};});
    if(partial.open||!partial.brake||!partial.gate||!partial.down||partial.shard||!partial.note?.includes('emergency brake'))throw Error('Old partial lower works save '+JSON.stringify(partial));
    checks.push('old partial weight-bank save loads with live presses and no skipped shard');
    await oldState(true);await resume();
    const complete=await p.evaluate(()=>{const b=__BF3,G=b.G;for(let i=0;i<190;i++)b.update(.016);return {open:!!G.storyState.flags['kd.deep.open'],brake:b.briarObjects().some(o=>o.key==='kd.press.brake'),gate:G.obstacles.some(o=>o.prisonBlock==='depth'),stopped:G.prison.presses.every(q=>!q.down&&q.bottom>130),shard:b.worldRiftShards().some(q=>q.id==='RK-03')};});
    if(!complete.open||complete.brake||complete.gate||!complete.stopped||!complete.shard)throw Error('Old completed lower works save '+JSON.stringify(complete));
    checks.push('old completed lower works save keeps gate open, presses stopped and RK-03 available');
    if(errors.length)throw Error(JSON.stringify(errors));return {checks,partial,complete,errors};
  }finally{await context.close();}
}
