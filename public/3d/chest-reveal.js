(function(){
let queue=[],active=null;
function stop(a){clearTimeout(a.timer);cancelAnimationFrame(a.tickFrame);}
function motionReduced(preference,systemPreference){return typeof preference==='boolean'?preference:!!systemPreference;}
function skip(){return false;} // Reward reveals cannot be accidentally skipped by interaction input.
function close(){if(!active)return;const a=active;active=null;stop(a);a.root.remove();if(queue.length)show(queue.shift());}
function center(a){const width=a.reel.children[0].getBoundingClientRect().width,step=width+10;return a.root.querySelector('.cr-window').clientWidth/2-(a.winner*step+width/2);}
function finish(){
 if(!active)return;const a=active;if(a.done)return;a.done=true;stop(a);
 a.reel.style.transform='translateX('+center(a)+'px)';a.root.classList.add('settled');a.title.textContent=a.name;a.title.title=a.name;a.status.textContent=a.result;
 const card=document.createElement('div');card.className='cr-summary';
 const img=document.createElement('img');img.src=a.icon||'';img.alt='';
 const body=document.createElement('div'),rarity=document.createElement('b');rarity.textContent=a.rarity;rarity.style.color=a.color||'#e2cea0';
 const stats=document.createElement('div');stats.className='cr-stats';stats.innerHTML=a.summary||'';
 const usage=document.createElement('small');usage.textContent=a.usability||'';
 body.append(rarity,stats,usage);card.append(img,body);a.status.before(card);
 try{a.onReveal?.();}catch(_){}a.timer=setTimeout(close,3500);
}
function ticks(a){
 if(active!==a||a.done)return;
 const now=performance.now(),dt=Math.max(0,Math.min(100,now-a.lastFrame));a.lastFrame=now;
 if(!document.hidden){
  a.elapsed+=dt;const progress=1-Math.pow(1-Math.min(1,a.elapsed/2100),4);
  a.reel.style.transform='translateX('+(a.distance*progress)+'px)';
  const index=Math.floor(-a.distance*progress/a.step);if(index!==a.lastCard&&now-a.lastTick>=65){a.lastCard=index;a.lastTick=now;try{a.onTick?.();}catch(_){}}
  if(a.elapsed>=2100){finish();return;}
 }
 a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
function show(data){
 if(!data?.cards?.length)return;if(active){queue.push(data);return;}
 const root=document.createElement('section');root.id='chest-reveal';root.style.setProperty('--loot-color',data.color||'#bea064');root.setAttribute('aria-label','Chest reward');root.innerHTML='<div class="cr-head"><span class="cr-title"></span><span class="cr-auto">One item</span></div><div class="cr-window"><div class="cr-marker"></div><div class="cr-reel"></div></div><div class="cr-result" role="status" aria-live="polite">One equipment reward</div>';
 const reel=root.querySelector('.cr-reel');root.querySelector('.cr-title').textContent='Opening '+data.grade+' chest';
 for(const d of data.cards){const card=document.createElement('div');card.className='cr-card';card.style.setProperty('--rarity',d.color);const img=document.createElement('img');img.src=d.icon||'';img.alt='';const label=document.createElement('span');label.textContent=d.name;const rarity=document.createElement('small');rarity.textContent=d.rarity;card.append(img,label,rarity);reel.append(card);}
 document.body.append(root);const now=performance.now(),a=active={root,reel,title:root.querySelector('.cr-title'),status:root.querySelector('.cr-result'),name:data.name,result:data.result,summary:data.summary,icon:data.icon,rarity:data.rarity,color:data.color,usability:data.usability,winner:Number.isInteger(data.winner)?Math.max(0,Math.min(data.cards.length-1,data.winner)):0,onTick:data.onTick,onReveal:data.onReveal,lastCard:0,lastTick:0,openedAt:now,lastFrame:now,elapsed:0,done:false};
 a.step=reel.children[0].getBoundingClientRect().width+10;a.distance=center(a);a.reel.style.transform='translateX(0px)';

 if(data.reduceMotion)finish();else a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
window.addEventListener('resize',()=>{if(active?.done)active.reel.style.transform='translateX('+center(active)+'px)';});
window.BFChestReveal={show,close,clear(){queue=[];close();},skip,motionReduced,get active(){return !!active;}};
})();
