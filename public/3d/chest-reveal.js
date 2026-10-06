(function(){
let queue=[],active=null,serial=0;
function close(){if(!active)return;clearTimeout(active.timer);active.animation?.cancel();active.root.remove();active=null;if(queue.length)show(queue.shift());}
function finish(){if(!active)return;const a=active;if(a.done){close();return;}a.done=true;clearTimeout(a.timer);a.animation?.cancel();const step=a.reel.children[0].getBoundingClientRect().width+10;a.reel.style.transform="translateX("+(a.root.querySelector(".cr-window").clientWidth/2-(20*step+(step-10)/2))+"px)";a.root.classList.add('settled');a.title.textContent=a.name;a.status.textContent=a.result;a.button.textContent='E · Continue';a.timer=setTimeout(close,4200);}
function show(data){
 if(active){queue.push(data);return;}
 const root=document.createElement('section');root.id='chest-reveal';root.setAttribute('aria-label','Chest reward');root.innerHTML='<div class="cr-head"><span class="cr-title">Opening '+data.grade+' chest</span><button type="button">E · Skip</button></div><div class="cr-window"><div class="cr-marker"></div><div class="cr-reel"></div></div><div class="cr-result" role="status" aria-live="polite">One equipment reward · already secured</div>';
 const reel=root.querySelector('.cr-reel'),win=root.querySelector('.cr-window');
 for(const d of data.cards){const card=document.createElement('div');card.className='cr-card';card.style.setProperty('--rarity',d.color);const img=document.createElement('img');img.src=d.icon||'';img.alt='';const label=document.createElement('span');label.textContent=d.name;const rarity=document.createElement('small');rarity.textContent=d.rarity;card.append(img,label,rarity);reel.append(card);}
 document.body.append(root);const a=active={root,reel,title:root.querySelector('.cr-title'),button:root.querySelector('button'),status:root.querySelector('.cr-result'),name:data.name,result:data.result,done:false,id:++serial};
 const step=reel.children[0].getBoundingClientRect().width+10;const x=win.clientWidth/2-(data.winner*step+(step-10)/2);a.animation=reel.animate([{transform:'translateX(0)'},{transform:'translateX('+x+'px)'}],{duration:data.reduceMotion?1:3300,easing:'cubic-bezier(.08,.65,.1,1)',fill:'forwards'});a.animation.onfinish=()=>{if(active===a&&!a.done)finish();};a.button.onclick=finish;if(data.reduceMotion)finish();
}
// Capture before the game's interact binding: skipping cannot also trigger nearby objects.
window.addEventListener('keydown',e=>{if(active&&e.code==='KeyE'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)finish();}},true);
window.BFChestReveal={show,close,clear(){queue=[];close();},skip:finish,get active(){return !!active;}};
})();
