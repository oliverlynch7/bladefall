/* Visible localhost-only test controls; no generated fixture ships. */
(()=>{
 if(!['localhost','127.0.0.1'].includes(location.hostname))return;
 const panel=document.createElement('section');panel.id='keepQA';panel.style.cssText='position:fixed;z-index:99999;right:8px;bottom:8px;max-width:440px;padding:8px;background:#162b39;color:#fff;font:12px system-ui';
 panel.innerHTML='<div id="qaActions"></div><pre id="qaResult" style="max-height:160px;overflow:auto;white-space:pre-wrap">Loading game...</pre>';
 document.body.append(panel);
 const out=v=>document.getElementById('qaResult').textContent=typeof v==='string'?v:JSON.stringify(v,null,2),wait=ms=>new Promise(r=>setTimeout(r,ms));
 const ready=async()=>{while(!window.__BF3)await wait(100);await __BF3.briarReady;return __BF3;};
 const pump=(b,n=1)=>{for(let i=0;i<n;i++)b.update(1/60);b.render(1);};
 const ok=(n,v)=>{if(!v)throw Error(n);return n;};
 const button=(label,fn)=>{const e=document.createElement('button');e.textContent=label;e.onclick=async()=>{out('Running...');try{out(await fn(await ready()));}catch(e){out('FAIL '+e.stack);}};document.getElementById('qaActions').append(e);};
 async function fresh(b){b.MP.active=false;b.MP.conns=[];b.loadMode('rl');Object.assign(b.meta,{hero:null,run:null,bank:null,introSeen:true,introV2Seen:true,hubTutDone:true,classId:'warrior',tutOff:true,camMode:'far',autoAttack:false,riftShards:[],stash:[]});b.openHub();b.enterZone(2);b.G.p.invuln=99999;for(const e of b.G.enemies)e.stunT=99999;while(window.BF_LOADING?.active)await wait(100);pump(b);while(!window.HERO3D?.ready)await wait(100);b.G.stageBanner=0;}
 function place(b,x,z,y=0,yaw=Math.PI){Object.assign(b.G.p,{x,z,y,vx:0,vz:0,vy:0,onGround:true});Object.assign(b.G.cam,{x,y,z});delete b.G._cameraBoom;b.camYaw=yaw;b.G.stageBanner=0;pump(b,2);return {position:{x:b.G.p.x,y:b.G.p.y,z:b.G.p.z},target:window.BFPartyNavigation.target(b.G),quest:BFBrokenWalls.quest(b.G.storyState,b.G.keep)};}
 function act(b,key){const o=b.G.storyObjects.find(o=>o.key===key);if(!o)throw Error(key);place(b,o.x,o.z,Math.max(o.y,b.highestSurfaceAt(o.x,o.z,8)));b.briarRequest('world',{key});pump(b);}
 function talk(b,id,choice){const n=b.G.storyNpcs.find(n=>n.id===id);place(b,n.x,n.z,Math.max(n.y,b.highestSurfaceAt(n.x,n.z,8)));b.briarRequest('open',{npc:id});b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');pump(b);}
 function walk(b,x,z,y=0,jump=false){const p=b.G.p;let frames=0;for(;frames<1100;frames++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<15&&p.y>=y-12)break;b.input.jx=dx/Math.max(d,1);b.input.jz=dz/Math.max(d,1);if(jump&&p.onGround&&p.y<y-5)b.input.jumpEdge=true;b.update(1/60);}b.input.jx=b.input.jz=0;pump(b,3);const row={to:[x,z,y],at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],frames};ok('Walk '+JSON.stringify(row),Math.hypot(p.x-x,p.z-z)<28&&p.y>=y-48);return row;}

 button('Start Broken Walls',async b=>{await fresh(b);return place(b,0,400,0);});
 button('Preview bell',async b=>{await fresh(b);return place(b,-210,-1670,0);});
 button('Preview ballista',async b=>{await fresh(b);return place(b,730,-870,150);});
 for(const [id,x,z,y]of [['Arrow post',730,-870,150],['Breach',-210,-1670,0],['Workshop',1450,-2470,0],['Bell climb',-1300,-1850,0],['Gate wheel',650,-3480,200],['Dungeon gate',0,-3910,0],['Chamber',-1480,-3500,80]])button(id,b=>place(b,x,z,y));
 button('Start rescue',b=>{talk(b,'grant','help');for(const e of b.G.enemies)if(e.keepGuard==='arrow'){e.hp=0;e.dead=true;}act(b,'rk.arrow');act(b,'rk.gate');act(b,'rk.breach');return b.G.storyState.flags;});
 button('Inspect scene',b=>({hero3D:window.HERO3D&&{on:HERO3D.on,ready:HERO3D.ready,error:HERO3D.err},flags:b.G.storyState.flags,blocks:b.G.obstacles.filter(o=>o.keepBlock),craft:window.BFCampaignCraft?.snapshot()?.animated,journey:window.__KEEP_JOURNEY_ART?.snapshot(),quest:BFBrokenWalls.quest(b.G.storyState,b.G.keep),target:BFPartyNavigation.target(b.G)}));
 button('Save old partial character',async b=>{await fresh(b);Object.assign(b.meta,{heroName:'Keep compatibility',gold:927});b.G.p.level=11;b.G.p.xp=82;b.meta.hero=b.snapOf(b.G.p);Object.assign(b.classState('warrior'),{rank:7,xp:161});talk(b,'grant','help');for(const e of b.G.enemies)if(e.keepGuard==='arrow'){e.hp=0;e.dead=true;}act(b,'rk.arrow');act(b,'rk.gate');b.captureCampaignCheckpoint();b.autosaveRun();return {saved:!!b.meta.run,gold:b.meta.gold,flags:b.G.storyState.flags};});
 button('Load saved character',b=>{b.loadMode('rl');b.continueRun();return {name:b.meta.heroName,gold:b.meta.gold,level:b.G.p.level,xp:b.G.p.xp,class:b.classState('warrior'),area:b.G.area,flags:b.G.storyState.flags,blocks:b.G.obstacles.filter(o=>o.keepBlock).map(o=>o.keepBlock)};});
 function jump(b,q){q=[q[0],q[1],b.highestSurfaceAt(q[0],q[1],8)];const p=b.G.p;let i=0;for(;i<170;i++){const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);b.input.jx=d>13?dx/d:0;b.input.jz=d>13?dz/d:0;if(!i)b.input.jumpEdge=true;b.input.jump=i<23;b.update(.016);if(i>8&&p.onGround&&d<18&&Math.abs(p.y-q[2])<8)break;}b.input.jx=b.input.jz=0;b.input.jump=false;pump(b,2);ok('Jump '+JSON.stringify({q,at:[p.x,p.z,p.y]}),i<170);return {to:q,frames:i};}

 const clear=(b,group)=>{for(const e of b.G.enemies)if(!group||e.keepGuard===group){e.hp=0;e.dead=true;}pump(b);};
 button('Check main route',async b=>{
  await fresh(b);const rows=[],checks=[],G=b.G;rows.push(walk(b,0,-250));rows.push(walk(b,-260,-380));talk(b,'grant','help');checks.push(ok('Guidance finds stairs before elevated target',BFPartyNavigation.target(G)?.navLabel==='Stairs to the arrow post'));
  rows.push(walk(b,0,-250));for(const q of G.keep.walks.arrow)rows.push(walk(b,...q,true));clear(b,'arrow');rows.push(walk(b,730,-1030,150));b.briarRequest('world',{key:'rk.arrow'});pump(b);checks.push(ok('Physically reached and cut bow cord',G.storyState.flags['rk.arrow']));
  for(const q of [...G.keep.walks.arrow].reverse())walk(b,...q,true);rows.push(walk(b,0,-830));b.input.jz=-1;pump(b,80);b.input.jz=0;checks.push(ok('Gate blocks walking before release',G.p.z>-930));b.briarRequest('world',{key:'rk.gate'});pump(b);rows.push(walk(b,0,-1450));rows.push(walk(b,-210,-1850));b.briarRequest('world',{key:'rk.breach'});pump(b);checks.push(ok('Breach starts at its visible bell',G.storyState.flags['rk.breach.start']));
  for(let i=0;i<2100&&!G.storyState.flags['rk.breach.done'];i++){for(const e of G.enemies)if(e.keepGuard==='breach'){e.dead=true;e.hp=0;}b.update(1/60);}checks.push(ok('30-second defense completes after attackers clear',G.storyState.flags['rk.breach.done']));
  rows.push(walk(b,0,-1850));rows.push(walk(b,0,-3000));rows.push(walk(b,0,-3500));clear(b,'post');rows.push(walk(b,-320,-3650));b.briarRequest('world',{key:'rk.key'});pump(b);checks.push(ok('Jail key opens dungeon gate',G.storyState.flags['rk.cells']&&!G.obstacles.some(o=>o.keepBlock==='cells')));
  rows.push(walk(b,0,-3650));rows.push(walk(b,0,-4000));rows.push(walk(b,0,-4460));checks.push(ok('Walking through dungeon gate is possible',!!G.portal&&G.p.z<-4400));return {checks,rows};
 });
 button('Check optional routes',async b=>{
  await fresh(b);clear(b);const checks=[],routes=[];act(b,'rk.arrow');act(b,'rk.gate');
  for(const name of ['west','east','wall','bell','oldwall']){const points=b.G.keep.walks[name];place(b,...points[0]);let count=0;for(const q of points.slice(1)){if(name==='bell'&&q[2]>b.G.p.y+8)jump(b,q);else walk(b,...q,true);count++;}routes.push({route:name,count,end:[b.G.p.x,b.G.p.z,b.G.p.y]});}
  act(b,'rk.wall');checks.push(ok('Old wall unbars chamber',b.G.storyState.flags['rk.chamber']));const points=b.G.keep.walks.chamber;place(b,...points[0]);for(const q of points.slice(1))walk(b,...q,true);checks.push('Physical chamber shortcut is traversable');
  act(b,'rk.trial');pump(b,100);checks.push(ok('Chamber challenge spawns all four guards',b.G.enemies.filter(e=>e.keepGuard==='trial').length===4));clear(b,'trial');checks.push(ok('Challenge completion reveals the same shard',BFBrokenWalls.shards(b.G.storyState).some(s=>s.id==='RK-02')));
  const o=b.G.storyObjects.find(o=>o.key==='rk.timing');place(b,o.x,o.z,0);b.G.keep.clock=3;b.briarRequest('world',{key:o.key});pump(b);checks.push(ok('Mistimed latch does not open',!b.G.storyState.flags['rk.workshop']));b.G.keep.clock=1;b.briarRequest('world',{key:o.key});pump(b);checks.push(ok('Green latch opens the workshop',b.G.storyState.flags['rk.workshop']));walk(b,1450,-2910);walk(b,1500,-3020);b.briarRequest('world',{key:'rk.tools'});pump(b);talk(b,'felix','help');talk(b,'felix','return');checks.push(ok('Tools remain redeemable for the existing dagger',b.G.storyState.flags['rk.felix.returned']));return {checks,routes};
 });
 button('Check live breach combat',async b=>{
  await fresh(b);talk(b,'grant','help');clear(b);act(b,'rk.arrow');act(b,'rk.gate');act(b,'rk.breach');const G=b.G,k=G.keep,checks=[];place(b,500,-1960,0);
  for(let i=0;i<600&&k.escortHp.every(h=>h===90);i++)b.update(1/60);const first=k.escortHp.slice();checks.push(ok('Actual moving attackers damage prisoners',first.some(h=>h<90)));
  for(let i=0;i<3000&&!k.retryT;i++)b.update(1/60);checks.push(ok('Unprotected prisoner defeat triggers retreat',k.retryT>0&&!G.storyState.flags['rk.breach.done']));place(b,0,-1450,0);pump(b,190);checks.push(ok('Retry restores all prisoner health',k.escortHp.every(h=>h===90)));
  place(b,-210,-1850,0);pump(b,140);place(b,0,-400,0);pump(b,270);checks.push(ok('Leaving the court resets progress',k.elapsed===0&&k.waves===0));place(b,-210,-1850);pump(b,3);
  const entries=[];for(let i=0;i<2100&&!G.storyState.flags['rk.breach.done'];i++){for(const e of G.enemies)if(e.keepGuard==='breach'&&!e.dead){entries.push({x:e.x,z:e.z});e.dead=true;e.hp=0;}b.update(1/60);}checks.push(ok('Return supports a complete retry',G.storyState.flags['rk.breach.done']));
  // Wheel alternative must work with the lower post still alive.
  act(b,'rk.wheel');checks.push(ok('Battlement wheel opens dungeon exit',G.storyState.flags['rk.cells']&&!!G.portal));return {checks,firstDamage:first,entries};
 });
 button('Check tower collision',async b=>{await fresh(b);const checks=[];for(const [x,z,y]of BFBrokenWalls.towers){place(b,x,z+150,y);b.input.jz=-1;pump(b,90);b.input.jz=0;checks.push(ok('Tower solid at '+[x,z],b.G.p.z>=z+60));}return checks;});
 button('Watch workshop interaction',async b=>{
  await fresh(b);clear(b);place(b,1450,-2530,0);const p=b.G.p,checks=[];await wait(700);b.input.jz=-1;for(let i=0;i<600&&p.z>-2630;i++)await wait(16);b.input.jz=0;checks.push(ok('Walk into latch interaction range',p.z<-2615));
  while(BFBrokenWalls.latchReady(b.G.keep.clock))await wait(30);b.briarRequest('world',{key:'rk.timing'});checks.push(ok('Mistimed attempt leaves the door closed',!b.G.storyState.flags['rk.workshop']));out('Mistimed attempt: the pointer is outside the green sector.');await wait(400);
  while(!BFBrokenWalls.latchReady(b.G.keep.clock)||b.G.keep.clock%5>1.6)await wait(30);b.briarRequest('world',{key:'rk.timing'});checks.push(ok('Green sector releases the visible workshop gate',b.G.storyState.flags['rk.workshop']));out('Latch released. Walking through the open doorway.');await wait(700);
  for(let i=0;i<330&&p.z>-3005;i++){b.input.jz=-1;await wait(16);}b.input.jz=0;checks.push(ok('Continuous walking reaches the tools',p.z<-2980));b.briarRequest('world',{key:'rk.tools'});checks.push(ok('Tools collected from workshop',b.G.storyState.flags['rk.tools']));return {checks,at:[p.x,p.y,p.z]};
 });
 button('Export geometry',b=>{const G=b.G,r={zone:G.zone,area:G.area,bounds:G.bounds,segments:G.segments,plats:G.obstacles.filter(o=>o.kind==='plat'),walls:G.walls,obstacles:G.obstacles.filter(o=>o.kind!=='plat'),objects:G.storyObjects,npcs:G.storyNpcs,rooms:G.rooms,paths:BFBrokenWalls.paths,geography:G.geography,enemies:G.enemies.map(e=>({type:e.type,x:e.x,z:e.z,y:e.y})),portal:G.portalPos};let a=document.getElementById('geometryJSON');if(!a){a=document.createElement('textarea');a.id='geometryJSON';panel.append(a);}a.value=JSON.stringify(r);return {bounds:G.bounds,obstacles:G.obstacles.length};});
 button('Hide test panel',()=>{panel.style.display='none';return 'Hidden';});
 window.keepQA={ready,fresh,place,act,talk,walk,wait,pump,ok,button,jump,clear};
})();
