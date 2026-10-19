/* Co-op rescue/travel presentation and bounded packet helpers. No gameplay mutations here. */
(function(root){'use strict';
const DURATION=2.5,RANGE=72;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
function progress(value){return clamp(value,0,1);}
function rescue(value){if(!value||typeof value.id!=='string'||value.id.length>100)return null;return {id:value.id,progress:progress(value.progress)};}
function eligible(helper,target,c,clear=()=>true){return !!helper&&!!target&&!c.hub&&!c.pvp&&helper.hp>0&&!helper.dead&&!helper.downed&&!!target.downed&&target.zone===c.zone&&target.area===c.area&&!!target.hall===!!c.hall&&(target.last??0)<1&&!c.exhausted&&[helper.x,helper.z,target.x,target.z].every(Number.isFinite)&&Math.hypot(helper.x-target.x,helper.z-target.z)<RANGE&&Math.abs((helper.y||0)-(target.y||0))<38&&clear(helper,target);}
let el=null,signature='',noticeState=null,world=null,seen=new Map(),warps=new Map();
function notice(kind,title,text,context){noticeState={kind,title,text,context,until:performance.now()+2600};}
function card(m){
 if(!el){el=document.createElement('aside');el.id='partyAction';el.hidden=true;el.innerHTML='<div class="partyAction-icon" aria-hidden="true"></div><div class="partyAction-copy"><div data-party-status role="status" aria-live="polite" aria-atomic="true"></div><div data-party-detail></div><div class="partyAction-meter" role="progressbar" aria-label="Action progress" aria-valuemin="0" aria-valuemax="100"><i></i></div><div data-party-foot></div></div>';document.body.append(el);}
 el.hidden=!m;if(!m){signature='';document.body.classList.remove('party-arrived');return;}
 const key=m.kind+'|'+m.title+'|'+(m.key||'');el.dataset.kind=m.kind;
 if(key!==signature){signature=key;el.querySelector('[data-party-status]').textContent=m.title;el.querySelector('.partyAction-icon').textContent=({down:'✚',revive:'✚',help:'✚',teleport:'↗',arrived:'✓',cancel:'!',ready:'↗',success:'✓'})[m.kind]||'✚';}
 el.querySelector('[data-party-detail]').textContent=m.detail||'';el.querySelector('[data-party-foot]').textContent=m.foot||'';
 const meter=el.querySelector('.partyAction-meter');meter.hidden=m.progress==null;meter.setAttribute('aria-valuenow',String(Math.round(progress(m.progress)*100)));meter.querySelector('i').style.transform='scaleX('+progress(m.progress)+')';
 document.body.classList.toggle('party-arrived',m.kind==='arrived');
}
function render(c){
 if(c.world!==world){world=c.world;seen.clear();warps.clear();noticeState=null;}
 if(!c.active){seen.clear();warps.clear();noticeState=null;card(null);return;}
 if(c.pvp||c.mode!=='play'||c.background||!c.p||c.hidden){card(null);return;}
 const peers=c.peers||[],p=c.p;
 for(const q of peers){if(seen.get(q.id)===true&&!q.downed)notice('success',(q.name||'Teammate')+' is back up','Ready to fight together.',world);seen.set(q.id,!!q.downed);const prev=warps.get(q.id);if(prev?.to===c.myId&&q.tw!==prev.serial)notice('arrived',(q.name||'Your teammate')+' has arrived','Your teammate teleported beside you.',world);warps.set(q.id,{to:q.travelTo,serial:q.tw});}
 const down=peers.filter(q=>q.downed).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
 const helping=peers.find(q=>q._rev>0),helper=peers.filter(q=>q.hp>0&&!q.downed&&q.rescue?.id===c.myId&&q.last<1).sort((a,b)=>b.rescue.progress-a.rescue.progress)[0];
 if(p.downed&&c.escape&&c.revives>=1){card({kind:'down',title:'You are down — no rescues left',detail:'You can only be revived once per dungeon run.',foot:Math.max(0,Math.ceil(p.downT||0))+'s until you return to the hub',progress:Math.max(0,(p.downT||0)/60)});return;}
 if(p.downed){const left=Math.max(0,Math.ceil(p.downT||0));card({kind:'down',title:helper?(helper.name||'Your teammate')+' is reviving you':'You are down — help is possible',detail:helper?'Stay here. Your teammate is helping you back up.':'Your teammate needs to stand beside you for 2.5 seconds.',foot:left+'s until you return to the hub',progress:helper?helper.rescue.progress:Math.max(0,(p.downT||0)/60)});return;}
 if(helping){card({kind:'revive',title:'Reviving '+(helping.name||'your teammate'),detail:helping._revPending?'Finishing rescue…':'Stay beside them until the bar fills.',foot:helping._revPending?'Waiting for your teammate to get up':Math.max(0,DURATION-helping._rev).toFixed(1)+'s remaining',progress:helping._rev/DURATION});return;}
 if(c.channel){const time=Math.max(0,3-c.channel.t);card({kind:'teleport',title:'Teleporting to '+(c.friend?.name||'your teammate'),detail:'Keep holding ['+c.key+'] · Stay still',foot:time.toFixed(1)+'s · Moving, damage or skills cancel',progress:c.channel.t/3});return;}
 const arriving=peers.find(q=>q.travelTo===c.myId&&q.def?.warp>0&&!q.downed);if(arriving){card({kind:'teleport',title:(arriving.name||'Your teammate')+' is teleporting to you',detail:'They will appear beside you.',foot:'Teleport in progress',progress:arriving.def.warp/3});return;}
 if(noticeState&&noticeState.context===world&&performance.now()<noticeState.until){card({kind:noticeState.kind,title:noticeState.title,detail:noticeState.text});return;}
 if(down){const exhausted=c.escape&&down.prisonRevives>=1;card({kind:'help',title:(down.name||'Your teammate')+' needs help',detail:exhausted?'Their one rescue this run has already been used.':'Go to them, then stand beside them for 2.5 seconds.',foot:Math.round(Math.hypot(down.x-p.x,down.z-p.z)/100)+'m away · '+(down.downLeft==null?'Downed':Math.ceil(down.downLeft)+'s remaining')});return;}
 if(c.friend&&Math.hypot(c.friend.x-p.x,c.friend.z-p.z)>850){card({kind:'ready',title:'Catch up to '+(c.friend.name||'your teammate'),detail:'Hold ['+c.key+'] for 3 seconds to teleport beside them.',foot:'Stand still · Hits cancel'+(c.count>1?' · ['+c.nextKey+'] changes teammate':'')});return;}
 card(null);
}
const api={DURATION,RANGE,clamp,progress,rescue,eligible,render,notice};root.BFPartyFeedback=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
