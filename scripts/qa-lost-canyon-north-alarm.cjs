async page=>{
 const checks=[],errors=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n);};
 page.on('pageerror',e=>errors.push(e.message));
 for(const quiet of [true,false]){
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const result=await page.evaluate(async quiet=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.meta.tutOff=true;b.openHub();b.enterZone(1);b.nextArea();const G=b.G,p=G.p;p.invuln=999;
   const act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,y:o.y,z:o.z,vx:0,vz:0,vy:0});b.briarRequest('world',{key});};
   const talk=(id,choice)=>{const n=G.storyNpcs.find(n=>n.id===id);Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:id});b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};
   act('lc.orders');talk('ward','orders');talk('ruth','help');if(quiet)act('lc.alarm');for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.cage.north');
   for(let i=0;i<400&&G.canyon.northWave<1;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z,vx:0,vz:0,vy:0});b.update(.016);}
   return {quiet,called:!!G.storyState.flags['lc.alarm.called'],cut:!!G.storyState.flags['lc.alarm'],wave:G.canyon.northWave,pursuers:G.enemies.filter(e=>e.canyonEscortWave===1&&!e.dead).length,alarm:G.enemies.filter(e=>e.canyonAlarm&&!e.dead).length};
  },quiet);
  ok(quiet?'quiet route gives one pursuer':'live alarm gives two pursuers',result.wave===1&&result.pursuers===(quiet?1:2)&&result.cut===quiet&&result.called===!quiet);
 }
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
}
