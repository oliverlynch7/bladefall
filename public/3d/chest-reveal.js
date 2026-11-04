(function(){
const timings=Object.freeze({roll:2800,winner:1000,result:6000});
let queue=[],active=null;
function stop(a){clearTimeout(a.timer);cancelAnimationFrame(a.tickFrame);}
function motionReduced(preference,systemPreference){return typeof preference==='boolean'?preference:!!systemPreference;}
function skip(){return false;} // Reward reveals cannot be accidentally skipped by interaction input.
function close(){if(!active)return;const a=active;active=null;stop(a);a.root.remove();if(queue.length)show(queue.shift());}
function center(a){const width=a.reel.children[0].getBoundingClientRect().width,step=width+10;return a.root.querySelector('.cr-window').clientWidth/2-(a.winner*step+width/2);}
function notify(a){if(a.revealed)return;a.revealed=true;try{a.onReveal?.();}catch(_){}}
function equipStatus(a){
 if(!a.equipButton)return;
 const state=a.equipped?{allowed:false,reason:'Equipped'}:a.equipState?.()||{allowed:false,reason:'Open bag to inspect'};
 a.equipButton.disabled=!state.allowed||a.equipping;
 a.equipKey.textContent=window.__BF3?.controlKey?.('lootEquip')||'F';
 a.equipLabel.textContent=a.equipped?'Equipped':state.allowed?'Equip now':state.reason;
 if(a.usage&&!a.equipped)a.usage.textContent=state.allowed?'Ready to equip':state.reason;
}
function quickEquip(){
 const a=active;if(!a)return false;
 // Consume this action during the reel too: it cannot equip an older legacy pickup.
 if(a.phase!=='summary'||!a.bagged||a.equipped||a.equipping)return true;
 if(!a.equipState?.().allowed){equipStatus(a);return true;}
 a.equipping=true;let equipped=false;
 try{equipped=a.onEquip?.()===true;}finally{a.equipping=false;}
 if(active!==a)return true;
 if(equipped){a.equipped=true;a.root.classList.add('cr-equipped');a.status.textContent=a.result.replace('Added to bag','Equipped');a.usage.textContent='Equipped to your character';a.elapsed=Math.max(0,timings.result-2500);}
 equipStatus(a);return true;
}
function land(a){
 a.phase='winner';a.elapsed=0;a.root.classList.add('landed');
 a.reel.style.transform='translateX('+center(a)+'px)';a.reel.children[a.winner].classList.add('cr-winner');
 a.title.textContent='You found '+a.name;a.status.textContent=(a.rarity||'')+' · '+a.result;notify(a);
}
function finish(){
 if(!active)return;const a=active;if(a.done)return;a.done=true;a.phase='summary';a.elapsed=0;stop(a);
 a.reel.style.transform='translateX('+center(a)+'px)';a.root.classList.add('settled');a.title.textContent=a.name;a.title.title=a.name;a.status.textContent=a.result;
 const card=document.createElement('div');card.className='cr-summary';
 const img=document.createElement('img');img.src=a.icon||'';img.alt='';
 const body=document.createElement('div'),rarity=document.createElement('b');rarity.textContent=a.rarity;rarity.style.color=a.color||'#e2cea0';
 const stats=document.createElement('div');stats.className='cr-stats';stats.innerHTML=(typeof a.summary==='function'?a.summary():a.summary)||'';
 const usage=a.usage=document.createElement('small');usage.textContent=a.usability||'';
 body.append(rarity,stats,usage);card.append(img,body);a.status.before(card);
 if(a.bagged){
  const actions=document.createElement('div');actions.className='cr-actions';
  if(a.equipState&&a.onEquip){const button=a.equipButton=document.createElement('button');button.type='button';button.className='cr-equip';const icon=document.createElement('img');icon.src='icons/action_equip.png';icon.alt='';a.equipKey=document.createElement('kbd');a.equipLabel=document.createElement('span');button.append(icon,a.equipKey,a.equipLabel);button.onclick=()=>{if(active===a)quickEquip();};actions.append(button);equipStatus(a);}
  const button=document.createElement('button');button.type='button';button.className='cr-open-bag';const icon=document.createElement('img');icon.src='icons/action_bag_stash.png';icon.alt='';const key=document.createElement('kbd');key.textContent=window.__BF3?.controlKey?.('bag')||'B';const label=document.createElement('span');label.textContent='Open bag';button.append(icon,key,label);button.onclick=()=>{if(active!==a)return;a.onOpenBag?.();};actions.append(button);a.root.append(actions);
 }
 notify(a);a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
function ticks(a){
 if(active!==a)return;
 const now=performance.now(),dt=document.hidden||a.wasHidden?0:Math.max(0,now-a.lastFrame);a.lastFrame=now;a.wasHidden=document.hidden;
 if(!document.hidden){
  a.elapsed+=dt;
  if(a.phase==='rolling'){
   const progress=1-Math.pow(1-Math.min(1,a.elapsed/timings.roll),3);
   a.reel.style.transform='translateX('+(a.distance*progress)+'px)';
   const index=Math.floor(-a.distance*progress/a.step);if(index!==a.lastCard&&now-a.lastTick>=65){a.lastCard=index;a.lastTick=now;try{a.onTick?.();}catch(_){}}
   if(a.elapsed>=timings.roll)land(a);
  }else if(a.phase==='winner'&&a.elapsed>=timings.winner){finish();return;}
  else if(a.phase==='summary'){equipStatus(a);if(a.elapsed>=timings.result){close();return;}}

 }
 a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
function show(data){
 if(!data?.cards?.length)return;if(active){queue.push(data);return;}
 const root=document.createElement('section');root.id='chest-reveal';root.style.setProperty('--loot-color',data.color||'#bea064');root.setAttribute('aria-label','Chest reward');root.innerHTML='<div class="cr-head"><span class="cr-title"></span><span class="cr-auto">One item</span></div><div class="cr-window"><div class="cr-marker"></div><div class="cr-reel"></div></div><div class="cr-result" role="status" aria-live="polite">One equipment reward</div>';
 const reel=root.querySelector('.cr-reel');root.querySelector('.cr-title').textContent='Opening '+data.grade+' chest';
 for(const d of data.cards){const card=document.createElement('div');card.className='cr-card';card.style.setProperty('--rarity',d.color);const img=document.createElement('img');img.src=d.icon||'';img.alt='';const label=document.createElement('span');label.textContent=d.name;const rarity=document.createElement('small');rarity.textContent=d.rarity;card.append(img,label,rarity);reel.append(card);}
 document.body.append(root);const now=performance.now(),a=active={root,reel,title:root.querySelector('.cr-title'),status:root.querySelector('.cr-result'),name:data.name,result:data.result,summary:data.summary,icon:data.icon,rarity:data.rarity,color:data.color,usability:data.usability,bagged:data.bagged===true,onOpenBag:data.onOpenBag,equipState:data.equipState,onEquip:data.onEquip,winner:Number.isInteger(data.winner)?Math.max(0,Math.min(data.cards.length-1,data.winner)):0,onTick:data.onTick,onReveal:data.onReveal,lastCard:0,lastTick:0,openedAt:now,lastFrame:now,elapsed:0,wasHidden:document.hidden,phase:'rolling',done:false};
 a.step=reel.children[0].getBoundingClientRect().width+10;a.distance=center(a);a.reel.style.transform='translateX(0px)';

 if(data.reduceMotion)finish();else a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
document.addEventListener('visibilitychange',()=>{if(active){active.lastFrame=performance.now();active.wasHidden=document.hidden;}});
window.addEventListener('resize',()=>{if(active&&active.phase!=='rolling')active.reel.style.transform='translateX('+center(active)+'px)';});
window.BFChestReveal={show,close,timings,clear(){queue=[];close();},skip,quickEquip,motionReduced,get active(){return !!active;}};
})();
