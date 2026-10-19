'use strict';
const $=id=>document.getElementById(id),R=window.BFNPCReview;let catalog,review,current,key,visible=[];
const status=text=>{$('status').textContent=text;};
function save(){try{localStorage.setItem(key,JSON.stringify(review));$('storage').textContent='Saved on this device. Export or copy your review to send it back.';}catch(_){$('storage').textContent='Browser storage unavailable. Export your review before leaving.';}}
function record(){return review.characters[current.id]||(review.characters[current.id]={votes:{},notes:''});}
function stop(){document.querySelectorAll('audio').forEach(a=>{a.pause();});}
function refresh(){
 const search=$('search').value.toLowerCase(),group=$('group').value,filter=$('filter').value;
 visible=catalog.characters.filter(c=>(!group||c.group===group)&&(`${c.name} ${c.role} ${c.group}`.toLowerCase().includes(search))&&(filter==='all'||R.state(review.characters[c.id],c)===filter));
 const approved=catalog.characters.filter(c=>R.state(review.characters[c.id],c)==='approved').length,rejected=catalog.characters.filter(c=>R.state(review.characters[c.id],c)==='rejected').length;
 $('progress').textContent=`${approved} green-lit · ${rejected} need a new voice · ${catalog.characters.length-approved-rejected} undecided`;
 $('roster').replaceChildren();$('character').replaceChildren();
 for(const c of visible){const s=R.state(review.characters[c.id],c),prefix=s==='approved'?'✓ ':s==='rejected'?'✕ ':'○ ',b=document.createElement('button');b.textContent=prefix+c.name;b.className=c.id===current?.id?'active':'';b.setAttribute('aria-current',c.id===current?.id?'true':'false');const small=document.createElement('small');small.textContent=c.group;b.append(small);b.onclick=()=>select(c);$('roster').append(b);$('character').append(new Option(prefix+c.name,c.id));}
 if(current&&visible.some(c=>c.id===current.id))$('character').value=current.id;
 else if(visible.length)select(visible[0]);
 else{$('detail').hidden=true;$('roster').textContent='No characters match these filters.';}
}
function select(c){
 stop();current=c;const url=new URL(location.href);url.hash=c.id;history.replaceState(null,'',url);$('detail').hidden=false;
 $('name').textContent=c.name;$('role').textContent=c.role;$('location').textContent=c.group;$('monogram').textContent=c.name.split(/\s+/).slice(0,2).map(s=>s[0]).join('');$('context').textContent=c.context;$('direction').textContent=c.direction;$('line').textContent=c.text;$('notes').value=review.characters[c.id]?.notes||'';
 $('options').replaceChildren();
 for(const p of c.options){const box=document.createElement('section');box.className='option';box.dataset.option=p.option;
  const head=document.createElement('div');head.className='optionheader';const title=document.createElement('strong');title.textContent='Option '+p.option;const sub=document.createElement('small');sub.textContent=Math.round(p.duration||0)+' seconds';head.append(title,sub);
  const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.muted=$('mute').checked;audio.src=p.file;audio.setAttribute('aria-label',c.name+' option '+p.option);audio.onplay=()=>{document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();});};audio.onerror=()=>status('Audio could not load. Try the other options or refresh; your decisions are kept.');
  const votes=document.createElement('div');votes.className='votes';
  for(const [v,label] of [['yes','✓ Green light'],['no','✕ Red light'],['','Undecided']]){const b=document.createElement('button');b.className=v||'undo';b.textContent=label;b.dataset.vote=v;b.setAttribute('aria-label',`${label} ${c.name} option ${p.option}`);b.onclick=()=>{const r=record();if(v)r.votes[p.option]={decision:v,sha256:p.sha256};else delete r.votes[p.option];save();paintVotes();refresh();};votes.append(b);}
  box.append(head,audio,votes);$('options').append(box);
 }
 paintVotes();refresh();
}
function paintVotes(){
 const r=review.characters[current.id];for(const box of $('options').children){const v=r?.votes?.[box.dataset.option]?.decision||'';box.className='option '+v;for(const b of box.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.vote===v));}
 const s=R.state(r,current);$('decision').textContent=s==='approved'?'Green light saved. You can still compare or approve another option.':s==='rejected'?'All three red-lit. Add notes so the next casting fits better.':'No final casting choice yet. Listen at your own pace.';
}
function move(delta){const at=visible.findIndex(c=>c.id===current?.id);if(visible.length)select(visible[(at+delta+visible.length)%visible.length]);}
function download(){const payload={...review,exportedAt:new Date().toISOString()},blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='bladefall-npc-voice-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status('Review exported. Send that file in our chat when ready.');}
function importText(text){try{if(text.length>500000)throw Error('Review file is too large.');const imported=R.clean(JSON.parse(text),catalog);review.characters={...review.characters,...imported.characters};save();if(current)select(current);else refresh();status('Review imported and merged by character. Matching audio versions only.');}catch(e){status('Import not applied: '+e.message);}}
async function init(){
 const response=await fetch('auditions.json?v=1',{cache:'no-store'});if(!response.ok)throw Error('Auditions could not load. Refresh to try again.');catalog=await response.json();if(!catalog.characters?.length)throw Error('No auditions are ready yet.');key='bladefall-npc-voice-review:'+catalog.revision;
 review={schema:1,revision:catalog.revision,characters:{}};try{const saved=localStorage.getItem(key);if(saved)review=R.clean(JSON.parse(saved),catalog);}catch(_){$('storage').textContent='Could not restore this browser’s review. Import your last exported file.';}
 for(const group of [...new Set(catalog.characters.map(c=>c.group))])$('group').append(new Option(group,group));$('qa').textContent=catalog.dialogueQA;
 $('search').oninput=refresh;$('group').onchange=refresh;$('filter').onchange=refresh;$('character').onchange=()=>select(catalog.characters.find(c=>c.id===$('character').value));
 $('mute').onchange=()=>document.querySelectorAll('audio').forEach(a=>{a.muted=$('mute').checked;});
 $('notes').oninput=()=>{record().notes=$('notes').value;save();};$('previous').onclick=()=>move(-1);$('following').onclick=()=>move(1);$('next').onclick=()=>{const start=catalog.characters.findIndex(c=>c.id===current?.id);const next=Array.from({length:catalog.characters.length},(_,i)=>catalog.characters[(start+1+i)%catalog.characters.length]).find(c=>R.state(review.characters[c.id],c)==='pending');if(next){$('search').value='';$('group').value='';$('filter').value='all';select(next);}else status('Every character has a casting decision. Export the review when ready.');};
 $('export').onclick=download;$('copy').onclick=async()=>{const text=R.summary(review,catalog);try{await navigator.clipboard.writeText(text);status('Decisions copied. Paste them in our chat.');}catch(_){$('fallback').hidden=false;$('fallback').value=text;$('fallback').select();status('Select and copy this summary, or export the JSON review.');}};
 $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>500000)throw Error('Review file is too large.');importText(await file.text());}catch(e){status('Import not applied: '+e.message);}finally{$('import').value='';}};
 $('applyBackup').onclick=()=>importText($('backup').value);
 select(catalog.characters.find(c=>c.id===location.hash.slice(1))||catalog.characters[0]);
}
init().catch(e=>{$('progress').textContent='Unable to load auditions';status(e.message);});
