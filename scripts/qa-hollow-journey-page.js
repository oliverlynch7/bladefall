/* Visible localhost-only controls, using the actual game simulation and save code. */
(()=>{
 if(!['localhost','127.0.0.1'].includes(location.hostname))return;
 const panel=document.createElement('section');panel.id='hollowQA';panel.style.cssText='position:fixed;z-index:99999;right:8px;bottom:8px;max-width:470px;padding:8px;background:#162b39;color:#fff;font:12px system-ui';
 panel.innerHTML='<div id="qaActions"></div><pre id="qaResult" style="max-height:170px;overflow:auto;white-space:pre-wrap">Loading game…</pre><a href=".qa-hollow-current.html?mute=1" style="color:#8de">Updated game</a>';
 document.body.append(panel);
 const out=v=>document.getElementById('qaResult').textContent=typeof v==='string'?v:JSON.stringify(v,null,2),wait=ms=>new Promise(r=>setTimeout(r,ms));
 const ready=async()=>{while(!window.__BF3||!window.HERO3D?.ready)await wait(100);await __BF3.briarReady;return __BF3;};
 const pump=(b,n=1)=>{for(let i=0;i<n;i++)b.update(1/60);b.render(1);};
 const button=(id,label,fn)=>{const e=document.createElement('button');e.id=id;e.textContent=label;e.onclick=async()=>{out('Running…');try{out(await fn(await ready()));}catch(e){out('FAIL '+e.stack);}};document.getElementById('qaActions').append(e);};
 const ok=(name,value)=>{if(!value)throw Error(name);return name;};
 async function fresh(b){b.MP.active=false;b.MP.conns=[];b.loadMode('rl');Object.assign(b.meta,{hero:null,run:null,bank:null,introSeen:true,introV2Seen:true,hubTutDone:true,classId:'warrior',tutOff:true,camMode:'far',autoAttack:false,autoSellEquipment:false,riftShards:[],stash:[]});b.openHub();b.enterZone(1);b.G.p.invuln=99999;for(const e of b.G.enemies)e.stunT=99999;while(window.BF_LOADING?.active)await wait(100);pump(b);}
 function place(b,x,z,y=0,yaw=Math.PI){Object.assign(b.G.p,{x,z,y,vx:0,vz:0,vy:0,onGround:true});Object.assign(b.G.cam,{x,y,z});delete b.G._cameraBoom;b.camYaw=yaw;b.G.stageBanner=0;pump(b,2);return {position:{x:b.G.p.x,y:b.G.p.y,z:b.G.p.z},camera:b.G.eye,counts:window.__world3d?.().counts};}
 function act(b,key){const o=b.G.storyObjects.find(o=>o.key===key);if(!o)throw Error(key);place(b,o.x,o.z,o.y);b.briarRequest('world',{key});pump(b);}
 button('qaStart','Start Winding Cliffs',async b=>{await fresh(b);return place(b,0,330);});
 for(const [id,x,z,y,yaw]of [['Refuge',0,330,0,Math.PI],['Split',0,-250,0,Math.PI],['Wagon',-870,-1320,0,Math.PI],['Bridge',0,-2350,0,Math.PI],['Cart',-540,-2500,0,Math.PI],['Lookout',-450,-3420,0,Math.PI],['Ridge',850,-1500,200,Math.PI]])button('qa'+id,id,b=>place(b,x,z,y,yaw));
 button('qaPush','Push cart',b=>{act(b,'hp.cart.push');return {progress:BFHollowCliffs.cartProgress(b.G),flags:b.G.storyState.flags};});
 button('qaWinch','Release winch',b=>{act(b,'hp.brake.right');return {bridge:b.G.cliffs.bridge,flags:b.G.storyState.flags};});
 button('qaTick','Advance 3 seconds',b=>{pump(b,180);return {player:b.G.p.y,progress:BFHollowCliffs.cartProgress(b.G)};});
 button('qaSave','Save previous-build character',async b=>{await fresh(b);Object.assign(b.meta,{heroName:'Hollow compatibility',gold:827});b.G.p.level=9;b.G.p.xp=67;b.meta.hero=b.snapOf(b.G.p);const c=b.G.storyNpcs.find(n=>n.id==='caleb');place(b,c.x,c.z);b.briarRequest('open',{npc:'caleb'});b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice:'help'});b.briarRequest('close');Object.assign(b.classState('warrior'),{rank:7,xp:124});act(b,'hp.orders');act(b,'hp.cart.push');pump(b,180);b.captureCampaignCheckpoint();b.autosaveRun();return {saved:!!b.meta.run,zone:b.G.zone,flags:b.G.storyState.flags,gold:b.meta.gold};});
 button('qaLoad','Load saved character',b=>{b.loadMode('rl');b.continueRun();return {name:b.meta.heroName,gold:b.meta.gold,level:b.G.p.level,xp:b.G.p.xp,class:b.classState('warrior'),zone:b.G.zone,flags:b.G.storyState.flags,cart:BFHollowCliffs.cartProgress(b.G),bridge:!!b.G.cliffs.bridge,walkable:!!b.G.cliffs.bridgeWalkable,deckCount:b.G.segments.filter(s=>s.bridge).length};});

 const walk=(b,x,z,y=0,jump=false)=>{
  const p=b.G.p;let n=0;
  for(;n<1000;n++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<15&&p.y>=y-12)break;b.input.jx=dx/Math.max(d,1);b.input.jz=dz/Math.max(d,1);if(jump&&p.onGround&&p.y<y-5)b.input.jumpEdge=true;b.update(1/60);}
  b.input.jx=b.input.jz=0;pump(b,3);
  const row={to:[x,z,y],at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],frames:n};
  ok('Walk '+JSON.stringify(row),Math.hypot(p.x-x,p.z-z)<28&&p.y>=y-48);return row;
 };
 button('qaRoute','Test main journey',async b=>{
  await fresh(b);const checks=[],walks=[],G=b.G,p=G.p;
  for(const v of BFHollowCliffs.paths.approach.slice(0,4))walks.push(walk(b,...v));
  act(b,'hp.orders');checks.push(ok('Early orders start the trail',G.storyState.flags['hp.trail']&&G.storyState.flags['hp.orders']));
  for(const v of BFHollowCliffs.paths.approach.slice(4))walks.push(walk(b,...v));
  act(b,'hp.brake.right');checks.push(ok('Unloaded winch stays closed',!G.storyState.flags['hp.bridge']));
  act(b,'hp.cart.push');act(b,'hp.brake.right');checks.push(ok('Moving cart cannot release bridge',!G.storyState.flags['hp.bridge']));pump(b,150);
  checks.push(ok('Cart and collision dock together',BFHollowCliffs.cartProgress(G)===1&&G.cliffs.cartCollider.x===BFHollowCliffs.freight.endX));
  act(b,'hp.brake.right');checks.push(ok('No invisible floor during lowering',G.cliffs.bridge&&!G.cliffs.bridgeWalkable&&!G.segments.some(s=>s.bridge)));
  checks.push(ok('Tracker explains lowering',BFHollowCliffs.quest(G.storyState,G).includes('lower')));pump(b,40);
  checks.push(ok('Half-lowered bridge still has no floor',!G.segments.some(s=>s.bridge)));pump(b,60);
  checks.push(ok('Settled bridge gets one floor',G.cliffs.bridgeWalkable&&G.segments.filter(s=>s.bridge).length===1));
  b.briarSync();pump(b,100);checks.push(ok('Repeated sync does not duplicate deck',G.segments.filter(s=>s.bridge).length===1));
  place(b,0,-2460);walks.push(walk(b,0,-3130));
  const target=BFPartyNavigation.target(G);checks.push(ok('Navigation targets the remaining patrol',target?.navLabel==='Clear the guards'));
  for(const v of BFHollowCliffs.paths.lookout)walks.push(walk(b,...v));act(b,'hp.lift');checks.push(ok('Living guards keep lift locked',!G.storyState.flags['hp.descent']));
  for(const e of G.enemies.filter(e=>e.cliffGuard)){e.hp=0;e.dead=true;}b.briarSync();pump(b);
  checks.push(ok('Cleared patrol directs to lift',BFPartyNavigation.target(G)?.key==='hp.lift'&&BFHollowCliffs.quest(G.storyState,G)==='Release the canyon lift'));
  act(b,'hp.lift');checks.push(ok('Lift opens after patrol',G.storyState.flags['hp.descent']&&G.portal));
  for(let i=0;i<80&&!window.__HOLLOW_JOURNEY_ART;i++){await wait(100);pump(b);}const pos=window.__HOLLOW_JOURNEY_ART?.pathMesh.geometry.attributes.position;
  checks.push(ok('Painted road stops at ravine '+JSON.stringify({loaded:!!pos,area:G.area,bad:pos?Array.from({length:pos.count},(_,i)=>pos.getZ(i)).filter(z=>z< -2676&&z> -3051).slice(0,8):null}),pos&&Array.from({length:pos.count},(_,i)=>pos.getZ(i)).every(z=>z>=-2676||z<=-3051)));
  return {checks,walks,triangles:window.__HOLLOW_JOURNEY_ART?.triangles,bounds:G.bounds};
 });
 button('qaOptional','Test alternate routes',async b=>{
  await fresh(b);const G=b.G,p=G.p,checks=[],walks=[];act(b,'hp.orders');act(b,'hp.cart.push');pump(b,160);act(b,'hp.brake.right');pump(b,100);
  place(b,150,-3200);for(const v of G.cliffs.walks.quiet)walks.push(walk(b,v[0],v[1],v[2],true));act(b,'hp.quiet');act(b,'hp.lift');checks.push(ok('High approach opens lift with living patrol',G.portal&&G.enemies.some(e=>e.cliffGuard&&!e.dead)));
  place(b,0,-400);for(const v of G.cliffs.walks.shelves)walks.push(walk(b,v[0],v[1],v[2],true));
  place(b,720,-870,110);for(const v of G.cliffs.walks.rope)walks.push(walk(b,v[0],v[1],v[2],true));act(b,'hp.rope');
  const n=G.storyNpcs.find(n=>n.id==='skip');place(b,n.x,n.z,n.y);b.briarRequest('open',{npc:'skip'});b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'rope'});b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'return'});b.briarRequest('close');
  checks.push(ok('Skip grants the ridge and reward',G.storyState.flags['hp.skip.returned']&&b.meta.stash.some(i=>i.weapon?.name==='Cliff Runner')));
  place(b,900,-1670,200);for(const v of G.cliffs.ridgeSteps)walks.push(walk(b,v[0],v[1],v[2],true));checks.push(ok('Ridge reaches upper shard',p.y>=390));
  place(b,-1700,-2280);for(const q of BFHollowCliffs.cargoSteps){let idle=0;for(let i=0;i<360;i++){const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz),landed=p.onGround&&p.y>=q.y-4&&Math.abs(dx)<q.w/2-6&&Math.abs(dz)<q.d/2-6;if(landed&&(d<20||idle>15))break;const x=p.x,z=p.z;b.input.jx=dx/Math.max(d,1);b.input.jz=dz/Math.max(d,1);if(p.onGround&&p.y<q.y-8)b.input.jumpEdge=true;b.update(.016);idle=landed&&Math.hypot(p.x-x,p.z-z)<.2?idle+1:0;}b.input.jx=b.input.jz=0;ok('Cargo step '+q.y,p.onGround&&p.y>=q.y-4);}
  act(b,'hp.code.release');act(b,'hp.code.claim');const rewards=JSON.stringify(G.storyState.rewards);act(b,'hp.code.claim');checks.push(ok('Cargo release and once-only reward',G.storyState.flags['hp.code.claimed']&&JSON.stringify(G.storyState.rewards)===rewards));
  place(b,-1545,-2365,58);for(let i=0;i<90;i++){b.input.jx=-1;if(i===1)b.input.jumpEdge=true;b.update(.016);}b.input.jx=0;checks.push(ok('Missed bracket returns to lower trail',p.onGround&&p.y===0));
  return {checks,waypoints:walks.length};
 });
 button('qaGeometry','Export current blueprint geometry',b=>{
  const g=b.G;if(!g.cliffs)throw Error('Start Winding Cliffs first');
  const row={zone:1,area:0,name:g.areaName,bounds:g.bounds,rooms:g.rooms.map(({name,x,z,y,w,d})=>({name,x,z,y,w,d})),segments:g.segments.filter(s=>!s.bridge),plats:g.obstacles.filter(o=>o.kind==='plat'&&!o.bridge),walls:g.walls,obstacles:g.obstacles.filter(o=>o.kind!=='plat'),objects:g.storyObjects,npcs:g.storyNpcs,start:g.startPos,portal:g.portalPos,paths:BFHollowCliffs.paths,geography:g.geography,enemies:g.enemies.map(({type,x,z,y})=>({type,x,z,y}))};
  const area=document.createElement('textarea');area.id='geometryJSON';area.value=JSON.stringify(row);panel.append(area);return {geometryInTextArea:true,signs:g.cliffs.signs.length};
 });

 button('qaCompleteSave','Save completed bridge',b=>{act(b,'hp.brake.right');pump(b,150);b.captureCampaignCheckpoint();b.autosaveRun();return {saved:!!b.meta.run,bridge:b.G.cliffs.bridge,flags:b.G.storyState.flags};});
 button('qaExamine','Inspect scene details',b=>({version:document.getElementById('version')?.textContent,eye:b.G.eye,clearance:b.G._cameraBoom?.fraction,bridge:b.G.cliffs.bridge,walkable:b.G.cliffs.bridgeWalkable,progress:BFHollowCliffs.bridgeProgress?.(b.G),floor:b.G.segments.filter(s=>s.bridge).length,road:window.__HOLLOW_JOURNEY_ART?.triangles,ownsWinch:window.BFCampaignCraft?.has('freight-winch'),ownsBridge:window.BFCampaignCraft?.has('cliff-bridge'),art:window.__world3d?.().counts,mode:b.mode}));
 // Exposed only by this localhost fixture for the visible two-client relay page.
 window.hollowQA={ready,fresh,place,act,pump,wait,ok};

 button('qaRenderRegions','Check active scenery registry',async b=>{
  await fresh(b);const rows=[];
  for(const zone of [0,1,2,3,4,5,6,7]){b.enterZone(zone);for(let k=0;k<40;k++){await wait(100);pump(b);if(window.BFCampaignCraft?.snapshot()?.theme===['briar','hollow','keep','frost','ember','coast','palace','castle'][zone])break;}const craft=window.BFCampaignCraft?.snapshot();ok('Active registry zone '+zone,craft?.models>0);ok('Active registry owns its first model '+zone,window.BFCampaignCraft.has(craft.items[0].id));rows.push({zone,models:craft.models,firstModel:craft.items[0].id});}
  return {rows};
 });
 button('qaBridgeDemo','Prepare bridge walkthrough',async b=>{await fresh(b);act(b,'hp.orders');place(b,230,-2550);b.G.p.invuln=99999;for(const id of Object.keys(b.G.storyState.notes))window.BFJournalNotice?.queue.dismiss(id);return 'Walk north to the winch and press your interact key. Cart is still unloaded.';});
 button('qaCartApproach','Walk to cart',async b=>{const rows=[];for(const p of [[230,-2420],[-535,-2420],[-535,-2610]])rows.push(walk(b,p[0],p[1]));return {walks:rows,prompt:b.G.interact?.label};});
 button('qaWinchApproach','Walk to winch',async b=>{const rows=[];for(const p of [[-535,-2430],[220,-2430],[220,-2660]])rows.push(walk(b,p[0],p[1]));return {walks:rows,prompt:b.G.interact?.label};});

 button('qaRenderedDemo','Play the bridge walkthrough',async b=>{
  await fresh(b);act(b,'hp.orders');place(b,220,-2560);const log=[];
  const liveWalk=async(x,z)=>{for(let i=0;i<600;i++){const p=b.G.p,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<16)break;b.input.jx=dx/d;b.input.jz=dz/d;pump(b);await wait(16);}b.input.jx=b.input.jz=0;pump(b);ok('Rendered walk '+x+','+z,Math.hypot(b.G.p.x-x,b.G.p.z-z)<28);};
  const interact=()=>{b.doInteract();pump(b);};
  await liveWalk(220,-2650);interact();log.push(ok('Early handle explains missing cart',!b.G.storyState.flags['hp.bridge']));out('Winch is still locked. Walking to the cart…');await wait(700);
  for(const p of [[220,-2420],[-535,-2420],[-535,-2610]])await liveWalk(...p);
  interact();log.push(ok('Ordinary interact rolls the cart',b.G.storyState.flags['hp.weight.open']));out('Cart released. Returning to the working winch…');
  for(const p of [[-535,-2430],[220,-2430],[220,-2650]])await liveWalk(...p);
  interact();log.push(ok('Ordinary interact releases the bridge',b.G.storyState.flags['hp.bridge']));
  for(let i=0;i<110;i++){pump(b);await wait(16);}log.push(ok('Deck settles before crossing',b.G.cliffs.bridgeWalkable));
  await liveWalk(0,-2520);await liveWalk(0,-3090);
  return {checks:log,mode:'Rendered normal-camera sequence; stunned enemies; no reset between attempted winch, cart and crossing.'};
 });
 button('qaHide','Hide test panel',()=>{panel.hidden=true;return 'Hidden';});
 ready().then(()=>out('Ready. Use the local test controls.'));
})();
