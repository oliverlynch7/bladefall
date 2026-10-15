/* Local test observer: no movement, combat, quest or save mutations. */
(()=>{'use strict';
 if(!['127.0.0.1','localhost'].includes(location.hostname))return;
 const errors=[],events=[],frames=[];let last=0,prev='',n=0;
 addEventListener('error',e=>errors.push(e.message));
 addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 const box=document.createElement('details');box.id='sessionObserver';box.style.cssText='position:fixed;bottom:3px;right:3px;z-index:1000;background:#152b39;color:white;font:11px system-ui;max-width:390px;padding:5px';
 box.innerHTML='<summary>Session evidence</summary><button id="sessionCapture">Capture session</button><pre id="sessionLive" style="max-height:150px;overflow:auto;white-space:pre-wrap"></pre><textarea aria-label="Session evidence JSON" id="sessionEvidence" style="width:360px;height:36px"></textarea>';
 document.body.append(box);
 const clean=o=>JSON.parse(JSON.stringify(o));
 const near=(a,p)=>a.filter(x=>!x.dead).map(x=>({id:x.id||x.key||x.type,label:x.label||x.name,type:x.type,hp:x.hp,x:Math.round(x.x),y:Math.round(x.y||0),z:Math.round(x.z),d:Math.round(Math.hypot(x.x-p.x,x.z-p.z))})).sort((a,b)=>a.d-b.d).slice(0,8);
 function state(){const b=window.__BF3,g=b?.G,p=g?.p;if(!b)return {loading:true};return {mode:b.mode,trial:g?.trial,area:g?.area,zone:g?.zone,areaName:g?.areaName,position:p&&[p.x,p.y,p.z].map(Math.round),yaw:p?.yaw,camera:b.meta.camMode,camYaw:g?.camYaw,hp:p?.hp,maxHp:p&&b.effMaxHp(p),level:p?.level,xp:p?.xp,class:b.meta.classId,classState:b.meta.classes?.[b.meta.classId],weapon:p?.weapon.name,gold:b.meta.gold,bag:b.meta.stash?.length,kills:g?.trialKills,portal:g?.portal&&{x:g.portal.x,y:g.portal.y,z:g.portal.z},objective:document.querySelector('#questbox')?.innerText,lesson:window.BFGuidedTutorial?.state,nearEnemies:p?near(g.enemies||[],p):[],nearNpcs:p?near(g.storyNpcs||[],p):[],nearObjects:p?near(g.storyObjects||[],p):[],flags:g?.storyState?.flags,items:g?.storyState?.items};}
 function tick(t){if(last){frames.push(t-last);if(frames.length>3600)frames.shift();}last=t;if(++n%30===0){const s=state(),sig=JSON.stringify([s.mode,s.trial,s.area,s.zone,s.kills,s.level,s.classState?.rank,s.lesson?.id,s.flags]);if(sig!==prev){events.push({time:performance.now(),state:s});prev=sig;}if(box.open)document.getElementById('sessionLive').textContent=JSON.stringify(s,null,1);}requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
 document.getElementById('sessionCapture').onclick=()=>{const sorted=frames.slice().sort((a,b)=>a-b),b=window.__BF3;document.getElementById('sessionEvidence').value=JSON.stringify({state:state(),events,errors,frameMs:{count:sorted.length,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1),visibility:document.visibilityState},save:b&&clean(b.meta)});};
})();
