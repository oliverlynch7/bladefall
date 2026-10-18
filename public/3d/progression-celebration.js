/* Cosmetic progress notifications and a guarded, short pre-choice transition. */
(function(root){'use strict';
function createClock(now=()=>performance.now()){
 let pending=null;
 return {get active(){return !!pending;},begin(valid,done,cancel,duration=900,ready){if(pending)return false;pending={valid,done,cancel,duration,ready,elapsed:0,last:now()};return true;},
 tick(hidden=false){const p=pending;if(!p)return;if(!p.valid()){pending=null;p.cancel?.();return;}const t=now(),delta=Math.max(0,Math.min(100,t-p.last));p.last=t;if(hidden)return;p.elapsed+=delta;if(p.elapsed>=p.duration&&(p.ready?.()!==false||p.elapsed>=p.duration+800)){pending=null;p.done();}},
 clear(){const p=pending;pending=null;p?.cancel?.();}};
}
let host=null,events={},clock=createClock(),lastWorld=null;
function ensure(){if(host)return;host=document.createElement('div');host.id='progressCelebrations';host.setAttribute('aria-live','polite');host.setAttribute('aria-atomic','false');document.body.append(host);}
function notify(kind,world,info){if(!world?.p)return;ensure();const old=events[kind];old?.card.remove();old?.flare.remove();
 const card=document.createElement('section');card.className='progress-celebration '+kind;card.setAttribute('role','status');
 const crest=document.createElement('span');crest.className='progress-crest';crest.textContent=kind==='class'?'✦':'↑';
 const copy=document.createElement('div'),label=document.createElement('small'),title=document.createElement('strong'),detail=document.createElement('p');
 label.textContent=kind==='class'?'CLASS RANK UP':'PLAYER LEVEL UP';title.textContent=kind==='class'?info.name+' · Rank '+info.value:'Level '+info.value;detail.textContent=info.detail||'';
 copy.append(label,title,detail);card.append(crest,copy);host.append(card);
 const flare=document.createElement('div');flare.className='progress-flare '+kind;flare.setAttribute('aria-hidden','true');flare.append(document.createElement('i'),document.createElement('i'),document.createElement('i'));host.append(flare);
 events[kind]={world,player:world.p,card,flare,info,elapsed:0,last:performance.now()};lastWorld=world;
}
function beforeChoice(valid,done,cancel,info){
 if(clock.active)return false;
 const e=events.class;if(e){e.elapsed=0;e.last=performance.now();e.card.classList.add('opening');e.card.querySelector('p').textContent=info.detail;const next=document.createElement('small');next.className='progress-next';next.textContent='Choose your upgrade next';e.card.querySelector('div').append(next);}
 const remove=()=>{if(events.class===e){e?.card.remove();e?.flare.remove();delete events.class;}};
 return clock.begin(valid,()=>{remove();done();},()=>{remove();cancel?.();},900,info.ready);
}
function tick(world,mode,project,opts={}){
 document.body.classList.toggle('progress-reduced',!!opts.reduceMotion);
 clock.tick(!!opts.hidden||mode!=='play'||!!root.BF_LOADING?.active);
 if(clock.active&&world?.p&&!world.p.dead&&!world.p.downed&&world.p.hp>0&&mode!=='play'){for(const e of Object.values(events)){e.card.hidden=true;e.flare.hidden=true;e.last=performance.now();}return;}
 if(lastWorld!==world||!world?.p||world.p.dead||world.p.downed||world.p.hp<=0||['title','dead','menu','pause','npc','journal','mirror','studio','chess','inspection'].includes(mode)){
  for(const e of Object.values(events)){e.card.remove();e.flare.remove();}events={};lastWorld=world;return;
 }
 const now=performance.now();
 for(const [kind,e] of Object.entries(events)){
  if(e.world!==world||e.player!==world.p){e.card.remove();e.flare.remove();delete events[kind];continue;}
  const delta=Math.max(0,Math.min(100,now-e.last));e.last=now;if(!opts.hidden)e.elapsed+=delta;
  e.card.hidden=false;
  e.card.classList.toggle('reduced',!!opts.reduceMotion);e.flare.classList.toggle('reduced',!!opts.reduceMotion);
  const at=project?.(world.p.x,(world.p.y||0)+8,world.p.z);
  e.flare.hidden=!at||opts.particles===false||mode!=='play'&&!clock.active;
  if(at){e.flare.style.left=at[0]+'px';e.flare.style.top=at[1]+'px';}
  if(e.elapsed>(kind==='class'?3200:2600)&&!clock.active){e.card.remove();e.flare.remove();delete events[kind];}
 }
}
const api={createClock,notify,beforeChoice,tick,get active(){return clock.active;}};root.BFProgressCelebration=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
