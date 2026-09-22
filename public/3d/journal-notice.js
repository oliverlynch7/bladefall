/* New clues are queued, never a modal. Save restoration seeds the baseline silently. */
(function(root){'use strict';
const readingTime=text=>Math.max(10,3+String(text).trim().split(/\s+/).filter(Boolean).length*60/140);
function createQueue(){let scene=null,seen=new Map(),waiting=[],current=null,left=0;
 return {
  reset(key,notes={}){scene=key;seen=new Map(Object.entries(notes).map(([id,n])=>[id,JSON.stringify(n)]));waiting=[];current=null;left=0;},
  observe(key,notes={},region){if(key!==scene){this.reset(key,notes);return;}for(const [id,n]of Object.entries(notes)){const sig=JSON.stringify(n);if(seen.get(id)!==sig){seen.set(id,sig);if(n.region===region)this.push({id,title:n.title,text:n.text,kind:'Journal updated'});}}},
  push(note){if(!note?.text)return;const n={...note};if(current?.id===n.id&&current.text===n.text||waiting.some(q=>q.id===n.id&&q.text===n.text))return;const existing=waiting.findIndex(q=>q.id===n.id);if(existing>=0)waiting[existing]=n;else waiting.push(n);},
  tick(dt,visible,held=false){if(!visible)return current;if(!current&&waiting.length){current=waiting.shift();left=readingTime(current.title+' '+current.text);}else if(current&&!held){left=Math.max(0,left-Math.max(0,dt));if(!left)current=null;}return current;},
  dismiss(){current=null;left=0;},get current(){return current;},get remaining(){return left;},get pending(){return waiting.length;}
 };
}
const queue=createQueue();let panel=null,shown=null,held=false,openJournal=()=>{},sceneOwner=null,sceneKey='';
function mount(){if(panel||!root.document)return;panel=document.createElement('aside');panel.id='journalNotice';panel.hidden=true;panel.setAttribute('aria-label','New journal entry');panel.innerHTML='<div class="jn-top"><span class="jn-kind"></span><button class="jn-close" aria-label="Dismiss journal entry">×</button></div><div class="jn-reading" role="status" aria-live="polite" aria-atomic="true"><h3></h3><p></p></div><div class="jn-bottom"><button class="jn-open">Open journal</button><span class="jn-count"></span></div><div class="jn-time"><i></i></div>';document.body.append(panel);
 panel.addEventListener('pointerenter',()=>held=true);panel.addEventListener('pointerleave',()=>held=false);for(const type of ['pointerdown','mousedown','click','touchstart'])panel.addEventListener(type,e=>e.stopPropagation());
 panel.querySelector('.jn-close').onclick=()=>{queue.dismiss();shown=null;panel.hidden=true;};panel.querySelector('.jn-open').onclick=()=>openJournal();
}
function observe(G,key,notes,region,seed=false){if(sceneOwner!==G||sceneKey!==key||seed){sceneOwner=G;sceneKey=key;queue.reset(key,notes);shown=null;if(panel)panel.hidden=true;}queue.observe(key,notes,region);}
function tick(dt,visible){mount();if(!panel)return;const n=queue.tick(dt,visible,held||panel.contains(document.activeElement));panel.hidden=!visible||!n;if(!visible||!n)return;if(n!==shown){shown=n;panel.querySelector('.jn-kind').textContent=n.kind||'Journal updated';panel.querySelector('h3').textContent=n.title;panel.querySelector('p').textContent=n.text;panel.querySelector('.jn-reading').scrollTop=0;panel.classList.remove('jn-arrive');void panel.offsetWidth;panel.classList.add('jn-arrive');}
 panel.querySelector('.jn-count').textContent=queue.pending?queue.pending+' more':'';panel.querySelector('.jn-time i').style.width=(100*queue.remaining/readingTime(n.title+' '+n.text))+'%';
}
const api={createQueue,readingTime,observe,tick,push:n=>queue.push(n),configure:fn=>openJournal=fn,queue};root.BFJournalNotice=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
