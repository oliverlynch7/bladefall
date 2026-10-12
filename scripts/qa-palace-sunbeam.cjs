async page=>{
 const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{timeout:60000});
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.tutOff=true;b.openHub();b.enterZone(6);});
 await page.waitForFunction(()=>window.__BF3?.G?.court&&!window.BF_LOADING.active,null,{timeout:60000});
 await page.evaluate(()=>{
  const b=__BF3,G=b.G;G.p.invuln=999;
  window.qaAct=k=>{const o=G.storyObjects.find(o=>o.key==='pc.'+k);Object.assign(G.p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key:o.key});};
  const n=G.storyNpcs.find(o=>o.id==='grace');Object.assign(G.p,{x:n.x,z:n.z,y:n.y});b.briarRequest('open',{npc:'grace'});
  for(const choice of ['help','go'])b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');
  qaAct('clamp');qaAct('water');qaAct('west.lower');
 });
 const atVantage=()=>page.evaluate(()=>{const b=__BF3,G=b.G;Object.assign(G.p,{x:80,z:-3710,y:420,vy:0});b.meta.camMode='far';G.cam.x=80;G.cam.z=-3710;G.cam.y=420;G.camYaw=Math.PI;G.camPitch=-.12;b.update(.016);});
 const shot=async(name)=>{await atVantage();await page.evaluate(()=>{const notice=document.getElementById('journalNotice');if(notice)notice.style.visibility='hidden';});await page.waitForTimeout(750);await page.screenshot({path:'output/playwright/palace-sunbeam-'+name+'.png'});};
 const state=()=>page.evaluate(()=>{const G=__BF3.G,r=BFPalaceCourtyard.lightPath(G.storyState.items['pc.light.mask']||0);return {mask:G.storyState.items['pc.light.mask']||0,hits:r.hits,solved:r.solved,door:!!G.storyState.flags['pc.light.open']};});
 if(!await page.evaluate(()=>__BF3.G.storyState.flags['pc.route.open']))throw Error('Balcony route did not power the sunbeam');
 await shot('initial');checks.push(['initial',await state()]);
 await page.evaluate(()=>qaAct('mirror.1'));await shot('wrong-middle');checks.push(['wrong-middle',await state()]);
 await page.evaluate(()=>{qaAct('mirror.1');qaAct('mirror.0');});await shot('first-reflection');checks.push(['first-reflection',await state()]);
 await page.evaluate(()=>qaAct('mirror.2'));await shot('solved');checks.push(['solved',await state()]);
 if(checks[0][1].mask!==0||checks[0][1].hits.length!==1||checks[0][1].door)throw Error('Initial beam state');
 if(checks[1][1].mask!==2||checks[1][1].hits.length!==1||checks[1][1].door)throw Error('Wrong middle turn changed progress');
 if(checks[2][1].mask!==1||checks[2][1].hits.length!==3||checks[2][1].door)throw Error('First turn did not expose the long route');
 if(checks[3][1].mask!==5||!checks[3][1].solved||!checks[3][1].door)throw Error('Receiver or door failed');
 await page.evaluate(()=>{const b=__BF3;b.openHub();b.enterZone(6);});
 await page.waitForFunction(()=>window.__BF3?.G?.court&&!window.BF_LOADING.active,null,{timeout:60000});
 const legacy=await page.evaluate(()=>{
  const b=__BF3,G=b.G;
  G.storyState=BFStoryState.restore({version:1,flags:{'pc.met':true,'pc.clamp':true,'pc.court':true,'pc.west':true,'pc.light.open':true,'pc.ready':true},items:{},quests:{},notes:{},cursors:{},rewards:{},events:{}});
  b.briarSync();return {mask:G.storyState.items['pc.light.mask']||0,route:!!G.storyState.flags['pc.route.open'],door:!!G.storyState.flags['pc.light.open'],wall:G.walls.some(w=>w.courtTag==='library'),portal:!!G.portal};
 });
 await shot('legacy-open');
 if(legacy.mask||!legacy.route||!legacy.door||legacy.wall||!legacy.portal)throw Error('Completed legacy state failed '+JSON.stringify(legacy));
 if(errors.length)throw Error('Browser errors: '+errors.join('; '));
 return {checks,legacy,errors};
}
