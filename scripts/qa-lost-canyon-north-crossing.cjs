async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.meta.tutOff=true;b.openHub();b.enterZone(1);b.nextArea();b.G.p.invuln=999;});await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.canyon);
 const result=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,checks=[],ok=(name,v)=>{if(!v)throw Error(name);checks.push(name);};
  const act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,y:o.y,z:o.z,vx:0,vz:0,vy:0});b.briarRequest('world',{key});};
  const talk=(id,choice)=>{const n=G.storyNpcs.find(n=>n.id===id);Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:id});b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};
  act('lc.orders');talk('ward','orders');talk('ruth','help');act('lc.alarm');for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.cage.south');act('lc.cage.north');
  ok('open cage is not a completed rescue',G.storyState.flags['lc.north.open']&&!G.storyState.flags['lc.north']);ok('north cage is physically open',!G.obstacles.some(o=>o.lcBlock==='north'));ok('open lock no longer prompts for a second release',!b.briarObjects().some(o=>o.key==='lc.cage.north'));
  ok('both prisoners stay on walkable ground',Array.from({length:81},(_,i)=>i/4).every(t=>{const a=BFLostCanyon.northAt(t),side=[a,{x:a.x+Math.cos(a.yaw)*BFLostCanyon.northSpacing,z:a.z-Math.sin(a.yaw)*BFLostCanyon.northSpacing}];return side.every(q=>G.segments.some(s=>Math.abs(q.x-s.x)<s.w/2+6&&Math.abs(q.z-s.z)<s.d/2+6));}));
  for(let i=0;i<400&&G.canyon.northWave<1;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z,vx:0,vz:0,vy:0});b.update(.016);}
  ok('moving group reaches east-bend ambush',G.canyon.northActive&&G.canyon.northWave===1&&G.canyon.northT>=4);const first=G.enemies.find(e=>e.canyonEscortWave===1&&!e.dead);ok('pursuer targets a prisoner',first&&BFLostCanyon.target(G,first,p).escortIndex!=null);
  const n=G.canyonPrisoners.find(n=>n.group==='north');first.x=n.x+22;first.z=n.z;first.y=n.y;for(let serial=1;serial<=10;serial++){first.meleeSerial=serial;BFLostCanyon.hitEscort(G,first);}ok('pursuer damages visible prisoner health',n.hp<=0&&G.canyon.northHp[0]<=0);
  b.update(.016);ok('fallen prisoner resets crossing',!G.canyon.northActive&&G.canyon.northRetryT>0&&G.canyon.northT===0&&!G.storyState.flags['lc.north']);
  for(let i=0;i<175;i++)b.update(.016);ok('group heals for retry',G.canyon.northRetryT===0&&G.canyon.northHp.every(h=>h===110));
  Object.assign(p,{x:640,y:0,z:-3550,vx:0,vz:0,vy:0});b.update(.016);ok('returning to open cage restarts escort',G.canyon.northActive);
  for(let i=0;i<1800&&!G.storyState.flags['lc.north'];i++){const leader=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:leader.x,y:leader.y,z:leader.z,vx:0,vz:0,vy:0});for(const e of G.enemies)if(e.canyonEscortWave&&!e.dead){e.hp=0;e.dead=true;}b.update(.016);}
  ok('north group reaches shelter',G.storyState.flags['lc.north']&&G.canyonPrisoners.filter(n=>n.group==='north'||n.follow==='north').every(n=>n.z<-3900));ok('shortcut follows both rescues',G.canyon.shortcut);
  return {checks,northStatus:BFLostCanyon.status(G),quest:BFLostCanyon.quest(G.storyState,G),errors:[]};
 });if(errors.length)throw Error(JSON.stringify(errors));return {...result,errors};
}
