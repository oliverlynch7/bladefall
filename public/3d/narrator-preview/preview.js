(()=>{'use strict';
 const root=document.getElementById('choices'),status=document.getElementById('status'),volume=document.getElementById('volume'),players=[];
 let chosen='';try{chosen=localStorage.getItem('bladefall-narrator-audition-pick')||'';}catch{}
 function stop(){for(const p of players){p.pause();p.currentTime=0;}}
 function select(id){chosen=id;try{if(id)localStorage.setItem('bladefall-narrator-audition-pick',id);else localStorage.removeItem('bladefall-narrator-audition-pick');}catch{}for(const c of root.children){const active=c.dataset.id===id;c.classList.toggle('chosen',active);const b=c.querySelector('button');b.setAttribute('aria-pressed',String(active));b.textContent=active?'My pick · '+id:'Choose '+c.dataset.id;}status.textContent=id?'Your pick: '+id+'. Tell me in the chat when you are ready.':'No voice selected. Listen, then choose A, B or C.';}
 volume.oninput=()=>{for(const p of players)p.volume=+volume.value;};document.getElementById('stop').onclick=()=>{stop();status.textContent='Playback stopped.';};document.getElementById('clear').onclick=()=>select('');
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const p of players)p.pause();});window.addEventListener('pagehide',stop);
 fetch('audition.json').then(r=>{if(!r.ok)throw Error('catalogue');return r.json();}).then(data=>{
  if(!Array.isArray(data.options)||data.options.length!==3)throw Error('options');document.getElementById('transcript').textContent=data.text;
  for(const option of data.options){if(!['A','B','C'].includes(option.id)||!/^voice-[abc]\.mp3$/.test(option.file))throw Error('asset');const card=document.createElement('article');card.className='voice';card.dataset.id=option.id;
   const head=document.createElement('div'),badge=document.createElement('span'),title=document.createElement('h2'),copy=document.createElement('p');badge.className='option';badge.textContent=option.id;title.textContent='Voice '+option.id;copy.textContent='Controls · practice · lore';head.append(badge,title,copy);
   const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=option.file;audio.volume=+volume.value;audio.setAttribute('aria-label','Listen to narrator '+option.id);players.push(audio);
   audio.onplay=()=>{for(const other of players)if(other!==audio)other.pause();status.textContent='Playing voice '+option.id+'.';};audio.onended=()=>{status.textContent='Voice '+option.id+' finished. Choose it or compare another.';};audio.onerror=()=>{status.textContent='Voice '+option.id+' could not load. Try its Download link or refresh.';};
   const pick=document.createElement('button');pick.type='button';pick.onclick=()=>select(option.id);const download=document.createElement('a');download.className='download';download.href=option.file;download.download='Bladefall-narrator-'+option.id+'.mp3';download.textContent='Download MP3';card.append(head,audio,pick,download);root.append(card);
  }select(['A','B','C'].includes(chosen)?chosen:'');
 }).catch(()=>{status.textContent='The auditions could not load. Refresh this page to try again.';});
})();
