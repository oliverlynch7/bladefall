async page=>{
 const checks=[],errors=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2163');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
  b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.openHub();b.enterZone(1);b.nextArea();
 });
 await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.canyon);
 const loud=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p;
  const act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key});};
  Object.assign(p,{x:-90,z:-630,y:140});b.briarRequest('open',{npc:'ward'});
  const time=G.time;b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'bluff'});
  for(let i=0;i<60;i++)b.update(.016);
  if(G.time!==time)throw Error('dialogue failed to pause the exposed-bluff attack');
  b.briarRequest('close');act('lc.gate');
  if(G.storyState.flags['lc.entry'])throw Error('gate opened while guards still lived');
  for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.gate');
  Object.assign(p,{x:-440,z:-1450,y:0});b.briarRequest('open',{npc:'ruth'});
  b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'help'});b.briarRequest('close');
  act('lc.cage.south');Object.assign(p,{x:-780,z:-2120,y:0,vy:0,invuln:999});
  const warning=G.canyon.alarmAt>G.time&&BFLostCanyon.quest(G.storyState).includes('Cut the signal cable');
  for(let i=0;i<175;i++)b.update(.016);
  const first=G.enemies.filter(e=>e.canyonAlarm&&!e.dead),firstPositions=first.map(e=>({x:e.x,z:e.z,active:e.active,label:e.label}));
  const start=Math.min(...first.map(e=>Math.hypot(e.x-p.x,e.z-p.z)));
  const hpBefore=p.hp;p.invuln=0;
  for(let i=0;i<800&&p.hp>=hpBefore;i++)b.update(.016);
  const close=Math.min(...first.map(e=>Math.hypot(e.x-p.x,e.z-p.z)));
  const fighting=first.some(e=>(e.meleeSerial||0)>0||(e.meleeActive||0)>0),damage=p.hp<hpBefore;
  p.invuln=999;
  const wave1=G.canyon.alarmWave;
  for(let i=0;i<1250&&G.canyon.alarmWave<2;i++)b.update(.016);
  const capped=G.enemies.filter(e=>e.canyonAlarm&&!e.dead&&e.hp>0).length;
  const wave2=G.canyon.alarmWave;
  for(let i=0;i<1080;i++)b.update(.016);
  const noOverflow=G.enemies.filter(e=>e.canyonAlarm&&!e.dead&&e.hp>0).length;
  const beforeRecycle=G.canyon.alarmWave;
  for(const e of G.enemies.filter(e=>e.canyonAlarm&&!e.dead).slice(0,2)){e.dead=true;e.hp=0;e.defeatedAt=G.time;}
  const afterKill=G.enemies.filter(e=>e.canyonAlarm&&!e.dead&&e.hp>0).length;
  for(let i=0;i<280&&G.canyon.alarmWave===beforeRecycle;i++)b.update(.016);
  const afterRefill=G.enemies.filter(e=>e.canyonAlarm&&!e.dead&&e.hp>0).length;
  const refilled=G.canyon.alarmWave>beforeRecycle&&afterRefill>afterKill&&afterRefill<=4;
  act('lc.alarm');const cut=G.storyState.flags['lc.alarm']&&G.canyon.alarmAt===0;
  for(const e of G.enemies.filter(e=>e.canyonAlarm)){e.dead=true;e.hp=0;e.defeatedAt=G.time;}
  const seq=G._midSeq;for(let i=0;i<2200;i++)b.update(.016);
  return {warning,firstPositions,start,close,fighting,damage,wave1,wave2,capped,noOverflow,refilled,afterKill,afterRefill,cut,afterCut:seq===G._midSeq,activeFlag:G.storyState.flags['lc.alarm.called']};
 });
 ok('loud cage rescue warns and points to cable',loud.warning&&loud.activeFlag);
 ok('two guards spawn from a staffed post near the cage',loud.firstPositions.length===2&&loud.firstPositions.every(e=>e.active&&e.label==='Alarm guard'&&Math.hypot(e.x+780,e.z+2120)<700));
 ok('guards close distance and damage the player',loud.close<loud.start-140&&loud.fighting&&loud.damage);
 ok('new wave responds after respite',loud.wave1===1&&loud.wave2===2&&loud.capped>=3&&loud.capped<=4);
 ok('active reinforcement cap prevents overflow',loud.noOverflow>=3&&loud.noOverflow<=4);
 ok('killing guards permits another wave',loud.refilled);
 ok('cutting cable stops all further waves',loud.cut&&loud.afterCut);
 const quiet=await page.evaluate(()=>{
  const b=__BF3;b.openHub();b.enterZone(1);b.nextArea();const G=b.G,p=G.p;
  const act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key});};
  act('lc.orders');Object.assign(p,{x:-90,z:-630,y:140});b.briarRequest('open',{npc:'ward'});
  b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'orders'});b.briarRequest('close');
  Object.assign(p,{x:-440,z:-1450,y:0});b.briarRequest('open',{npc:'ruth'});
  b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'help'});b.briarRequest('close');
  act('lc.alarm');for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.cage.south');
  Object.assign(p,{x:-780,z:-2120,y:0,invuln:999});for(let i=0;i<1800;i++)b.update(.016);
  return {quiet:!G.storyState.flags['lc.alarm.called'],count:G.enemies.filter(e=>e.canyonAlarm&&!e.dead).length};
 });
 ok('cutting cable first preserves a quiet rescue',quiet.quiet&&quiet.count===0);
 if(errors.length)throw Error(JSON.stringify(errors));
 return {checks,loud,quiet,errors};
}
