/* Service conversations share exact stable line IDs with the private Voice Studio. */
(function(){
 'use strict';
 let book=null,active=null,generation=0,audio=null,utterance=null,timer=0,frame=0,speaking=false;
 const ready=fetch('./story/hub-dialogue.json?v=1989').then(r=>{if(!r.ok)throw Error('Dialogue unavailable');return r.json()}).then(async b=>{book=await BFVoiceContent.apply(b);return book}).catch(()=>null);
 const el=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function state(a,id){const all=a.meta.hubDialogue||(a.meta.hubDialogue={});return all[id]||(all[id]={introduced:false,newsSeen:false,cursor:null})}
 function hasNews(n,a){return !!book?.npcs[n.id]&&Object.values(a.meta.zoneDone||{}).filter(Boolean).length>=book.npcs[n.id].newsAfterCompletedRegions&&!state(a,n.id).newsSeen}
 function stopVoice(){clearTimeout(timer);cancelAnimationFrame(frame);speaking=false;if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null}if(utterance){speechSynthesis.cancel();utterance=null}}
 function close(service=false,remote=false){if(!active)return;if(active.external&&!remote){active.a.requestClose();return;}generation++;stopVoice();const {n,a}=active;active=null;el('hubDialogue')?.remove();document.body.classList.remove('npc-conversation');a.leave(service);if(service)n.open()}
 function commit(){active.a.save()}
 function landing(){
  if(!active)return;stopVoice();const {n,a}=active,s=state(a,n.id),def=book.npcs[n.id];s.cursor=null;commit();
  shell(`<p class="hub-dialogue-welcome">${esc(def.role)}</p><div class="hub-dialogue-options"><button id="hubService">${esc(def.service)}</button><button id="hubAbout">Tell me about yourself.</button>${hasNews(n,a)?'<button id="hubNews">◆ What has changed?</button>':''}<button id="hubHelp">Remind me how this works.</button></div>`);
  el('hubService').onclick=()=>close(true);el('hubAbout').onclick=()=>line(def.about,'Tell me about yourself.','about');el('hubHelp').onclick=()=>line('hub.'+n.id+'.guide','Remind me how this works.','help');if(el('hubNews'))el('hubNews').onclick=()=>line(def.news,'What has changed?','news');
 }
 function shell(content){
  const {n}=active;let root=el('hubDialogue');if(!root){root=document.createElement('section');root.id='hubDialogue';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','hubSpeaker');document.body.append(root)}
  root.innerHTML=`<div class="hub-dialogue-panel"><p class="hub-dialogue-label">${active.external?esc(active.a.location||'BRIAR TOWN'):'WAYSTATION'}</p><h2 id="hubSpeaker">${esc(n.name)}</h2>${content}<footer><button id="hubLeave">Leave conversation <small>Esc</small></button></footer></div>`;
  el('hubLeave').onclick=()=>close();el('hubLeave').focus({preventScroll:true});
 }
 function line(id,lastChoice='',topic='intro'){
  const {n,a}=active,s=state(a,n.id),node=book.nodes[id];if(!node){landing();return}
  s.cursor={id,lastChoice,topic};commit();
  showLine(id,node,lastChoice,choice=>line(choice.next,choice.text,topic),()=>{if(topic==='intro'){s.introduced=true;s.cursor=null;commit();close(true)}else{if(topic==='news')s.newsSeen=true;landing()}},topic==='intro'?'Show me.':'Back to services');
 }
 function showLine(id,node,lastChoice,choose,finish,finishLabel,canChoose=true){
  stopVoice();const token=++generation,{a}=active;active.lineId=id;active.started=performance.now();
  shell(`${lastChoice?'<p class="hub-dialogue-reply">'+(active.external?'Chosen reply':'You')+': “'+esc(lastChoice)+'”</p>':''}<p id="hubLine" class="hub-dialogue-line"></p><button id="hubReveal">Show full line</button><p id="hubVoiceStatus" class="hub-dialogue-label"></p>${!canChoose?'<p class="hub-dialogue-label">Your teammate is choosing. You can both leave at any time.</p>':''}<div id="hubChoices" class="hub-dialogue-options"></div>`);
  const choices=el('hubChoices');let revealed=false;
  function unlock(){if(token!==generation||!active||revealed)return;revealed=true;cancelAnimationFrame(frame);el('hubLine').textContent=node.text;el('hubReveal').hidden=true;
   for(const choice of node.choices){const btn=document.createElement('button');btn.textContent=choice.text;btn.onclick=()=>{for(const b of choices.children)b.disabled=true;choose(choice)};choices.append(btn)}
   if(!node.choices.length){const btn=document.createElement('button');btn.textContent=finishLabel;btn.onclick=finish;choices.append(btn)}
   // A text-skip click cannot become a response click; all choices have a short arming window.
   for(const btn of choices.children)btn.disabled=true;timer=setTimeout(()=>{if(token===generation)for(const btn of choices.children)btn.disabled=!canChoose&&!!node.choices.length},250);
  }
  el('hubReveal').onclick=unlock;
  const began=performance.now();function reveal(now){if(token!==generation||revealed)return;let count=Math.floor((now-began)/26);if(speaking&&audio&&Number.isFinite(audio.duration)&&audio.duration>0)count=Math.floor(node.text.length*audio.currentTime/audio.duration);el('hubLine').textContent=node.text.slice(0,count);if(count>=node.text.length)unlock();else frame=requestAnimationFrame(reveal)}frame=requestAnimationFrame(reveal);
  const allowed=a.meta.soundOn!==false;
  function tts(){if(token!==generation||!allowed||!a.meta.dialogueTTS||!('speechSynthesis'in window))return;utterance=new SpeechSynthesisUtterance(node.text);utterance.volume=Math.max(0,Math.min(1,a.meta.sfxVol??1));utterance.rate=.96;utterance.onstart=()=>{if(token===generation)speaking=true};utterance.onend=utterance.onerror=()=>{if(token===generation){speaking=false;unlock()}};speechSynthesis.speak(utterance)}
  if(allowed&&a.meta.dialogueVoice!==false&&node.recordedAudio){audio=new Audio(node.recordedAudio);audio.volume=Math.max(0,Math.min(1,a.meta.sfxVol??1));audio.onplaying=()=>{if(token===generation)speaking=true};audio.onpause=audio.onwaiting=()=>{if(token===generation)speaking=false};audio.onended=()=>{if(token===generation){speaking=false;unlock()}};audio.onerror=()=>{if(token===generation){speaking=false;audio=null;tts()}};audio.play().catch(()=>{if(token===generation){audio=null;speaking=false;el('hubVoiceStatus').textContent='Voice could not play. Subtitles are still available.';tts()}})}else tts();
 }
 async function open(n,a){
  if(active)close();const token=++generation;active={n,a,lineId:null,start:performance.now(),eye:a.eye()};a.enter();document.body.classList.add('npc-conversation');shell('<p>Opening conversation…</p>');
  await ready;if(token!==generation||!active)return;if(!book?.npcs[n.id]){close(true);return}
  const s=state(a,n.id);if(s.cursor&&book.nodes[s.cursor.id])line(s.cursor.id,s.cursor.lastChoice,s.cursor.topic);else if(!s.introduced)line(book.npcs[n.id].start);else landing();
 }
 function present(n,a,source,view,canChoose){
  if(!view){if(active?.external)close(false,true);return;}
  if(!active?.external||active.n.id!==n.id){if(active)close(false,true);active={n,a,external:true,lineId:null,start:performance.now(),eye:a.eye()};a.enter();document.body.classList.add('npc-conversation');}
  const signature=JSON.stringify([view,canChoose]);if(active.signature===signature)return;active.signature=signature;
  showLine(view.lineId,{...source.nodes[view.lineId],text:view.text,choices:view.choices},view.lastChoice,choice=>a.choose(view.lineId,choice.id),()=>close(),a.leaveLabel||'Return to the path',canChoose);
 }
 function focus(){if(!active)return null;const {n,a}=active,p=a.player();const x=n.x+(n.x<0?-13:13),z=n.z+(n.id==='anvil'?22:0),len=Math.hypot(p.x-x,p.z-z)||1;return {x,y:n.y||0,z,dx:(p.x-x)/len,dz:(p.z-z)/len,blend:a.meta.reduceMotion?1:Math.min(1,(performance.now()-active.start)/550),from:active.eye}}
 document.addEventListener('keydown',e=>{if(!active)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}else if(e.code==='Tab'){const buttons=[...el('hubDialogue').querySelectorAll('button:not(:disabled):not([hidden])')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}},true);
 window.BFHubDialogue={open,close,present,focus,ready,hasNews,known:id=>!!book?.npcs[id],get active(){return active},get speaking(){return speaking}};
})();
