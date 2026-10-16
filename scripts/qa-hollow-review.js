/* Map-assisted ordinary-input review, not a human novice/balance claim. */
(()=>{'use strict';
if(!['localhost','127.0.0.1'].includes(location.hostname))return;
const rows=[],errors=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
const panel=document.createElement('details');panel.open=true;panel.id='hollowReview';
panel.style.cssText='position:fixed;top:8px;left:8px;z-index:999999;background:#132b38;color:#fff;padding:8px;font:12px system-ui;max-width:410px';
panel.innerHTML='<summary>Earned Hollow journey · map-assisted</summary><label>Waypoints x,z,y (one per line)<textarea id="hollowPath" aria-label="Review waypoints" style="display:block;width:380px;height:45px">0,330,0</textarea></label><div id="hollowActions"></div><pre id="hollowReadout" style="max-height:160px;overflow:auto;white-space:pre-wrap"></pre><textarea id="hollowEvidence" aria-label="Hollow review evidence" style="width:380px;height:30px"></textarea>';
document.body.append(panel);
addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const b=()=>window.__BF3,clean=v=>JSON.parse(JSON.stringify(v));
function state(){const a=b(),g=a?.G,p=g?.p;return {mode:a?.mode,zone:g?.zone,area:g?.area,hub:g?.hub,name:g?.areaName,position:p&&[p.x,p.z,p.y].map(x=>+x.toFixed(1)),hp:p?.hp,maxHp:p&&a.effMaxHp(p),level:p?.level,xp:p?.xp,class:a?.meta.classes?.[a.meta.classId],gold:a?.meta.gold,zoneMax:a?.meta.zoneMax,zoneDone:a?.meta.zoneDone,portal:g?.portal&&{x:g.portal.x,z:g.portal.z,y:g.portal.y},prompt:g?.interact?.label,objective:document.getElementById('questbox')?.innerText,nav:g&&window.BFPartyNavigation?.target(g),flags:g?.storyState?.flags,notes:g?.storyState?.notes,canyon:g?.canyon&&BFLostCanyon.status(g),enemies:g?.enemies?.filter(e=>!e.dead&&e.hp>0).map(e=>({type:e.type,label:e.label,hp:e.hp,x:Math.round(e.x),z:Math.round(e.z),y:Math.round(e.y),d:p&&Math.round(Math.hypot(e.x-p.x,e.z-p.z))}))};}
function out(v){document.getElementById('hollowReadout').textContent=JSON.stringify(v,null,1);document.getElementById('hollowEvidence').value=JSON.stringify({method:'Earned baseline staged at Brute entry; map-assisted normal-input traversal thereafter, accelerated simulation, no stat boosts/enemy disabling.',rows,errors,state:state(),save:b()?.meta});}
function button(name,fn){const el=document.createElement('button');el.textContent=name;el.onclick=async()=>{try{const result=await fn();rows.push({action:name,result:clean(result??null),state:state()});out(result??state());}catch(e){rows.push({action:name,error:e.stack,state:state()});out({error:e.stack});}};document.getElementById('hollowActions').append(el);}
function release(){const i=b().input;for(const key of Object.keys(i))i[key]=typeof i[key]==='boolean'?false:0;}
function move(dx,dz){const a=b(),d=Math.hypot(dx,dz)||1,yaw=a.G.camYaw??Math.PI,wx=dx/d,wz=dz/d;if(a.meta.camMode==='far'){a.input.jx=wx;a.input.jz=wz;}else{a.input.jx=-wx*Math.cos(yaw)+wz*Math.sin(yaw);a.input.jz=-(wx*Math.sin(yaw)+wz*Math.cos(yaw));}}
function look(dx,dz){const a=b(),want=Math.atan2(dx,dz),angle=Math.atan2(Math.sin(want-a.G.camYaw),Math.cos(want-a.G.camYaw));a.applyCameraLook(-angle,0,1,1);}
async function travel(points,fighting=false){const a=b(),g=a.G,p=g.p,start=state(),trace=[];a.meta.autoAttack=true;let lastNote='';
 for(const [x,z,y=0]of points){let done=false;
  for(let i=0;i<60*35;i++){
   if(a.G!==g||a.mode!=='play'||p.hp<=0){release();return {start,end:state(),trace,stopped:'scene/mode/health'};}
   release();const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);
   const foe=g.enemies.filter(e=>!e.dead&&e.hp>0&&!e.dummy&&Math.abs(e.y-p.y)<130).sort((e,f)=>Math.hypot(e.x-p.x,e.z-p.z)-Math.hypot(f.x-p.x,f.z-p.z))[0];
   const fd=foe?Math.hypot(foe.x-p.x,foe.z-p.z):Infinity;
   if(fd<210){look(foe.x-p.x,foe.z-p.z);if(fd<145&&p.skillCd[0]<=0)a.useSkill(0);}
   else look(dx,dz);
   if(fighting&&fd<550){if(fd>68)move(foe.x-p.x,foe.z-p.z);if(foe.meleeW>0&&foe.meleeW<.25&&fd<110&&p.dodgeCdT<=0){move(p.x-foe.x,p.z-foe.z);a.input.dodgeEdge=true;}}
   else {if(d<18&&p.y>=y-20){done=true;break;}move(dx,dz);if(y>p.y+20&&p.onGround){a.input.jumpEdge=true;a.input.jump=true;}}
   if(p.varJump&&p.vy>0)a.input.jump=true;
   a.update(1/60);
   const note=[Math.round(p.hp),g.interact?.label,document.getElementById('questbox')?.innerText].join('|');
   if(note!==lastNote){trace.push({to:[x,z,y],frame:i,pos:[p.x,p.z,p.y].map(Math.round),hp:p.hp,prompt:g.interact?.label,objective:document.getElementById('questbox')?.innerText});lastNote=note;}
   if(i%90===0){out({walking:[x,z,y],position:[p.x,p.z,p.y].map(Math.round),hp:p.hp,foe:foe?.label});await wait(0);}
  }
  release();if(!done)return {start,end:state(),trace,stopped:'target not reached',target:[x,z,y]};
 }
 release();return {start,end:state(),trace,complete:true};
}
button('Read journey',()=>state());
button('Walk route',()=>travel(document.getElementById('hollowPath').value.trim().split('\n').map(s=>s.split(',').map(Number))));
button('Fight along route',()=>travel(document.getElementById('hollowPath').value.trim().split('\n').map(s=>s.split(',').map(Number)),true));
button('Jump route',async()=>{
 const a=b(),g=a.G,p=g.p,rows=[];
 for(const q of document.getElementById('hollowPath').value.trim().split('\n').map(s=>s.split(',').map(Number))){
  for(let i=0;i<200;i++){
   if(a.G!==g||a.mode!=='play'||p.hp<=0){release();return {stopped:'scene/mode/health',rows};}
   release();const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);
   if(d>13)move(dx,dz);if(i===0)a.input.jumpEdge=true;a.input.jump=i<23;
   a.update(1/60);if(i>8&&p.onGround&&d<18&&Math.abs(p.y-q[2])<12)break;
   if(i%60===0)await wait(0);
  }
  release();rows.push({target:q,position:[p.x,p.z,p.y],landed:p.onGround});
  if(!p.onGround||Math.hypot(q[0]-p.x,q[1]-p.z)>25||Math.abs(p.y-q[2])>12)return {stopped:'missed landing',rows};
 }
 return {complete:true,rows};
});
button('Interact normally',()=>{b().doInteract();return state();});
button('Walk to exit',()=>{const p=b().G.portal;if(!p)throw Error('No earned exit');return travel([[p.x,p.z,p.y||0]]);});
button('Save journey',()=>{b().autosaveRun();b().persist();return state();});
button('Resume saved journey',async()=>{const a=b();await a.briarReady;if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));a.loadMode('rl');a.continueRun();return state();});
button('Restore exported earned checkpoint',async()=>{const a=b();await a.briarReady;if(!window.hollowEarnedBaseline)throw Error('No exported earned checkpoint');if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));a.loadMode('rl');Object.assign(a.meta,clean(window.hollowEarnedBaseline));a.persist();a.continueRun();return state();});
button('Restore test bindings',()=>{b().meta.keybinds=clean(window.firstBossBaseline.keybinds);b().persist();return 'Original character bindings restored';});
button('Hide boss probes',()=>{for(const a of document.querySelectorAll('aside'))if(a.textContent.includes('Staged first-boss review'))a.hidden=true;return 'Hidden';});
button('Set normal camera',()=>{b().G.camPitch=.45;b().meta.camMode='far';return state();});
button('Hide review for 8 seconds',()=>{panel.hidden=true;setTimeout(()=>panel.hidden=false,8000);return 'Hidden';});
})();
