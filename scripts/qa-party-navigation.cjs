async page=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);const result=await page.evaluate(async()=>{
const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.dialogueTTS=false;b.openHub();const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n);};
const targets=[];for(let zone=0;zone<8;zone++)for(const area of [0,1]){b.openHub();b.enterZone(zone);b.G.area=area;b.loadArea();const t=BFPartyNavigation.target(b.G);ok('main target '+zone+':'+area,!!t);targets.push({zone,area,target:t.key||t.id});}
b.openHub();b.enterZone(0);const g=b.G,p=g.p;g.enemies=[];p.onGround=true;
for(const [code,key,act]of [['KeyW','w','up'],['KeyA','a','left'],['KeyS','s','down'],['KeyD','d','right'],['','A','left'],['Unidentified','s','down']]){dispatchEvent(new KeyboardEvent('keydown',{code,key,bubbles:true}));ok('key down '+(code||key),b.input[act]);dispatchEvent(new KeyboardEvent('keyup',{code,key,bubbles:true}));ok('key up '+(code||key),!b.input[act]);}
dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD'}));dispatchEvent(new Event('blur'));ok('blur releases keyboard',!b.input.right);
const q={id:'friend',name:'Friend',zone:0,area:0,x:p.x+100,z:p.z,y:p.y,hp:100,hpm:100,last:0,motion:{ground:true}},q2={...q,id:'friend2',name:'Other friend',x:p.x-100};Object.assign(b.MP,{active:true,pvp:false,zone:0,myId:'local',isHost:true,conns:[],peers:{friend:q,friend2:q2}});
const press=code=>dispatchEvent(new KeyboardEvent('keydown',{code})),release=code=>dispatchEvent(new KeyboardEvent('keyup',{code})),tick=n=>{for(let j=0;j<n;j++)b.partyTravel.tick(.1);};
press('KeyY');ok('cycle second friend',b.partyTravel.selected().id==='friend2');press('KeyY');ok('cycle wraps',b.partyTravel.selected().id==='friend');
const start={x:p.x,z:p.z};press('KeyT');tick(10);ok('three-second charge cannot finish early',p.x===start.x&&!!b.partyTravel.channel&&p.warp>0);release('KeyT');ok('release cancels',!b.partyTravel.channel&&!p.warp);
press('KeyT');tick(3);p.invuln=0;b.hurtPlayer(1,p.x+20,p.z,'QA');ok('hit cancels',!b.partyTravel.channel);tick(40);ok('held key cannot retry after hit',!b.partyTravel.channel&&p.x===start.x);release('KeyT');
press('KeyT');tick(3);b.input.left=true;tick(1);b.input.left=false;ok('movement cancels',!b.partyTravel.channel);release('KeyT');
press('KeyT');tick(3);q.last=5;tick(1);ok('disconnect cancels',!b.partyTravel.channel);release('KeyT');q.last=0;
q.motion.ground=false;ok('airborne target cannot receive teleport',!b.partyTravel.landing(q));q.motion.ground=true;
p.onGround=true;const land=b.partyTravel.landing(q);ok('supported landing exists',!!land);press('KeyT');tick(35);ok('completed teleport reaches safe spot',Math.hypot(p.x-land.x,p.z-land.z)<1&&!b.partyTravel.channel&&!p.warp);release('KeyT');
const state=b.MP.selfState(),peer=b.MP.mkPeer({...state,id:'relay',x:0,z:0});b.MP.applyPos(peer,{...state,tw:state.tw+1,x:500,z:600,def:{warp:1.5}});ok('teleport snaps peer instead of sliding through walls',peer.x===500&&peer.z===600&&b.MP.snap(peer).tw===state.tw+1);ok('charge effect survives presence relay',b.MP.snap(peer).def.warp===1.5);
b.MP.pvp=true;ok('PvP has no teleport targets',b.partyTravel.friends().length===0);b.MP.active=false;
return {checks,targets};});if(errors.length)throw Error(errors.join('\n'));return result;}
