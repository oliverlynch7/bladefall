/* Local, explicitly staged regression controls. Separate from the continuous run. */
(()=>{'use strict';
if(!['localhost','127.0.0.1'].includes(location.hostname))return;
const errors=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const panel=document.createElement('aside');panel.style.cssText='position:fixed;bottom:5px;right:5px;z-index:10000;background:#142836;color:white;padding:8px;font:12px system-ui;max-width:380px';
panel.innerHTML='<b>Staged first-session regressions</b><div id="journeyFixButtons"></div><textarea aria-label="Regression results" style="width:365px;height:70px"></textarea>';document.body.append(panel);
const out=v=>panel.querySelector('textarea').value=JSON.stringify({...v,errors});
async function until(fn){const end=Date.now()+20000;while(!fn()){if(Date.now()>end)throw Error('Timed out');await wait(50);}}
function button(name,fn){const e=document.createElement('button');e.textContent=name;e.onclick=async()=>{try{out(await fn());}catch(e){out({error:e.stack});}};panel.querySelector('div').append(e);}
async function ready(){await until(()=>window.__BF3);await __BF3.briarReady;return __BF3;}
const state=b=>({mode:b.mode,level:b.G?.p?.level,xp:b.G?.p?.xp,gold:b.meta.gold,rank:b.classState(b.meta.classId).rank,choices:b.classState(b.meta.classId).ch,tut:b.meta.tut,heroName:b.meta.heroName,notice:BFJournalNotice.queue.current,pending:BFJournalNotice.queue.pending});
button('Load genuine pre-change character',async()=>{const b=await ready();if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));b.loadMode('rl');Object.assign(b.meta,JSON.parse(JSON.stringify(window.firstSessionBaseline)));b.openHub();await until(()=>!BF_LOADING.active);b.persist();return state(b);});
button('Read after reload',async()=>{const b=await ready();if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));b.loadMode('rl');if(b.meta.run)b.continueRun();else b.openHub();await until(()=>!BF_LOADING.active);return state(b);});
button('Stage earned rank 4 and 5 choices',async()=>{const b=await ready();b.gainClassXp(b.RANK_XP(3)+b.RANK_XP(4)-b.classState(b.meta.classId).xp);return state(b);});
button('Read current result',async()=>state(await ready()));
button('Stage Mara supply request',async()=>{const b=await ready();b.enterZone(0);await until(()=>!BF_LOADING.active);
const talk=(npc,choices)=>{const n=b.G.storyNpcs.find(n=>n.id===npc);Object.assign(b.G.p,{x:n.x,z:n.z+65,y:n.y||0});b.briarRequest('open',{npc});for(const choice of choices)b.briarRequest('choose',{line:b.G.storyState.conversation?.node,choice});b.briarRequest('close');};
talk('thomas',['protect','prepare']);talk('mara',['help','accept']);return state(b);});
button('Stage supplies and delivery',async()=>{const b=await ready();for(const key of ['briar.root.1','briar.root.2','briar.root.3','briar.dressings']){const o=b.G.storyObjects.find(o=>o.key===key);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y||0});b.briarRequest('world',{key});}
const n=b.G.storyNpcs.find(n=>n.id==='mara');Object.assign(b.G.p,{x:n.x,z:n.z+65,y:n.y||0});b.briarRequest('open',{npc:'mara'});b.briarRequest('choose',{line:b.G.storyState.conversation?.node,choice:'deliver'});b.briarRequest('close');return {...state(b),flags:b.G.storyState.flags,notes:b.G.storyState.notes};});
button('Stage pinned signal revision',async()=>{const b=await ready();b.addJournalNote('qa.signal','Silence the signal','Stop the horn at its ground crank.');return state(b);});
button('Complete pinned signal revision',async()=>{const b=await ready();b.addJournalNote('qa.signal','The horn is silent','Reach the northern shelter.');return state(b);});
button('Check shared journal packets',async()=>{
 const h=await ready(),frame=document.createElement('iframe'),checks=[];let g;
 const ok=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw Error(name);};
 frame.title='Local guest journal regression';frame.style.cssText='position:fixed;left:0;top:0;width:320px;height:240px;z-index:9999';frame.src='/3d/?mute=1';document.body.append(frame);
 try{
  await until(()=>frame.contentWindow.__BF3);g=frame.contentWindow.__BF3;await g.briarReady;
  g.loadMode('rl');Object.assign(g.meta,JSON.parse(JSON.stringify(window.firstSessionBaseline)));g.openHub();g.enterZone(0);await until(()=>!frame.contentWindow.BF_LOADING.active);
  Object.assign(g.MP,{active:true,isHost:false,myId:'local-journal-guest',hostConn:{open:true,send(){}}});g.G.runSeed=h.G.runSeed;
  const clone=v=>JSON.parse(JSON.stringify(v)),q=frame.contentWindow.BFJournalNotice.queue;
  h.addJournalNote('qa.shared','Shared route','Find the signal crank.');const before=clone(h.briarPacket());g.briarApply(before,true);
  ok('Late join seeds history silently',!q.current&&q.pending===0);
  h.addJournalNote('qa.shared','Shared route opened','Reach the northern shelter.');const after=clone(h.briarPacket());g.briarApply(after);
  ok('Live guest card shows revised instruction',q.current?.text==='Reach the northern shelter.');
  const pending=q.pending;g.briarApply(after);ok('Duplicate packet adds no unread copies',q.pending===pending);
  // addJournalNote changes note order without advancing the authored quest revision.
  // Make this explicitly an older quest packet to exercise the receiver's stale guard.
  const stale=clone(before);stale.state.revision=after.state.revision-1;g.briarApply(stale);ok('Older revision cannot restore obsolete text',q.current?.text==='Reach the northern shelter.');
  q.dismiss();ok('Guest dismissal does not dismiss host note',BFJournalNotice.queue.current?.id==='qa.shared');
  q.push({id:'guest.clue',title:'Guest clue',text:'Keep this unread clue.'});
  h.addJournalNote('qa.shared','Shared route complete','The neighbors reached shelter.');g.briarApply(clone(h.briarPacket()));
  ok('Another update appears immediately',q.current?.text==='The neighbors reached shelter.');q.dismiss();q.tick(0,true);
  ok('Guest unread clue survives shared update',q.current?.id==='guest.clue');
  return {checks,transport:'Production story packet creation/application in two local browser worlds; staged initial guest placement, no Internet transport claim.'};
 }finally{if(g)g.MP.active=false;frame.remove();}
});
})();
