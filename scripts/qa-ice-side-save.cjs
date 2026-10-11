async page=>{
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
  const setup=async()=>{
    await page.goto('http://127.0.0.1:4331/3d/?mute=1&iceSpillSave=2169');
    await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
    await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(3);b.nextArea();});
    await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.iceCaves);
  };
  await setup();
  const completed=await page.evaluate(()=>{
    const b=__BF3,G=b.G,s=G.storyState;s.flags['ic.channel.clue']=true;s.flags['ic.channel.open']=true;s.items['ic.channel.mask']=5;
    G.iceCaves.channelKnown=false;b.briarSync();
    return {open:!!G.iceCaves['ic.channel.open'],drop:G.iceCaves.channelDrop,bridge:G.obstacles.some(p=>p.iceBridge&&Math.abs(p.x+1350)<5&&Math.abs(p.z+4680)<5),shard:b.worldRiftShards().some(x=>x.id==='FF-04'),controls:G.storyObjects.filter(o=>/^ic\.channel\.[123]$/.test(o.key)).length};
  });
  ok('completed old side-channel save retains frozen crossing '+JSON.stringify(completed),completed.open&&completed.drop===1&&completed.bridge&&completed.shard&&completed.controls===0);
  await setup();
  const partial=await page.evaluate(()=>{
    const b=__BF3,G=b.G,s=G.storyState,p=G.p;s.flags['ic.channel.clue']=true;delete s.flags['ic.channel.open'];s.items['ic.channel.mask']=5;
    G.iceCaves.channelKnown=false;b.briarSync();
    const before={open:!!G.iceCaves['ic.channel.open'],bridge:G.obstacles.some(q=>q.iceBridge&&Math.abs(q.x+1350)<5&&Math.abs(q.z+4680)<5),controls:G.storyObjects.filter(o=>/^ic\.channel\.[123]$/.test(o.key)).length};
    const o=G.storyObjects.find(o=>o.key==='ic.channel.plug');Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0,onGround:true});b.briarRequest('world',{key:o.key});
    return {...before,released:!!G.storyState.flags['ic.channel.open']};
  });
  ok('partial old switch mask does not open the new crossing but release remains available '+JSON.stringify(partial),!partial.open&&!partial.bridge&&partial.controls===0&&partial.released);
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,completed,partial,errors};
}
