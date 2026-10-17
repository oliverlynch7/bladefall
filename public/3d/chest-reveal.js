(function(){
let queue=[],active=null;
function stop(a){clearTimeout(a.timer);cancelAnimationFrame(a.tickFrame);a.animation?.cancel();}
function close(){if(!active)return;const a=active;active=null;stop(a);a.root.remove();if(queue.length)show(queue.shift());}
function center(a){const width=a.reel.children[0].getBoundingClientRect().width,step=width+10;return a.root.querySelector('.cr-window').clientWidth/2-(a.winner*step+width/2);}
function finish(){
 if(!active)return;const a=active;if(a.done){close();return;}a.done=true;stop(a);
 a.reel.style.transform='translateX('+center(a)+'px)';a.root.classList.add('settled');a.title.textContent=a.name;a.title.title=a.name;a.status.textContent=a.result;a.button.textContent=(window.__BF3?.controlKey('interact')||'Interact')+' · Close';
 try{a.onReveal?.();}catch(_){}a.timer=setTimeout(close,2100);
}
function ticks(a){
 if(active!==a||a.done)return;
 const progress=a.animation?.effect?.getComputedTiming().progress,now=performance.now();
 if(progress!=null&&!document.hidden){const index=Math.floor(-a.distance*progress/a.step);if(index!==a.lastCard&&now-a.lastTick>=65){a.lastCard=index;a.lastTick=now;try{a.onTick?.();}catch(_){}}}
 a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
function show(data){
 if(!data?.cards?.length)return;if(active){queue.push(data);return;}
 const root=document.createElement('section');root.id='chest-reveal';root.setAttribute('aria-label','Chest reward');root.innerHTML='<div class="cr-head"><span class="cr-title"></span><button type="button">Skip</button></div><div class="cr-window"><div class="cr-marker"></div><div class="cr-reel"></div></div><div class="cr-result" role="status" aria-live="polite">One equipment reward</div>';
 const reel=root.querySelector('.cr-reel');root.querySelector('.cr-title').textContent='Opening '+data.grade+' chest';
 for(const d of data.cards){const card=document.createElement('div');card.className='cr-card';card.style.setProperty('--rarity',d.color);const img=document.createElement('img');img.src=d.icon||'';img.alt='';const label=document.createElement('span');label.textContent=d.name;const rarity=document.createElement('small');rarity.textContent=d.rarity;card.append(img,label,rarity);reel.append(card);}
 document.body.append(root);const a=active={root,reel,title:root.querySelector('.cr-title'),button:root.querySelector('button'),status:root.querySelector('.cr-result'),name:data.name,result:data.result,winner:Number.isInteger(data.winner)?Math.max(0,Math.min(data.cards.length-1,data.winner)):0,onTick:data.onTick,onReveal:data.onReveal,lastCard:0,lastTick:0,done:false};
 a.step=reel.children[0].getBoundingClientRect().width+10;a.distance=center(a);a.animation=reel.animate([{transform:'translateX(0)'},{transform:'translateX('+a.distance+'px)'}],{duration:data.reduceMotion?1:2100,easing:'cubic-bezier(.08,.65,.1,1)',fill:'forwards'});
 a.animation.onfinish=()=>{if(active===a&&!a.done)finish();};a.button.textContent=(window.__BF3?.controlKey('interact')||'Interact')+' · Skip';a.button.onclick=finish;
 if(data.reduceMotion)finish();else a.tickFrame=requestAnimationFrame(()=>ticks(a));
}
// Skip consumes the interaction, rather than activating another nearby object.
window.addEventListener('keydown',e=>{if(active&&window.__BF3?.keyAction(e.code)==='interact'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)finish();}},true);
window.addEventListener('pointerdown',e=>{if(active&&e.pointerType==='mouse'&&!active.root.contains(e.target)&&window.__BF3?.keyAction('Mouse'+e.button)==='interact'){e.preventDefault();e.stopImmediatePropagation();finish();}},true);
window.addEventListener('resize',()=>{if(active?.done)active.reel.style.transform='translateX('+center(active)+'px)';});
window.BFChestReveal={show,close,clear(){queue=[];close();},skip:finish,get active(){return !!active;}};
})();
