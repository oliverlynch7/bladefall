const $=id=>document.getElementById(id),API='/voice-api/';
let catalog=[],selected=null,recording=null,stream=null,busy=false,tick=null,objectURL=null;
const say=text=>{$('status').textContent=text;};
const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
async function api(path,options={}){
 const r=await fetch(API+path,{credentials:'same-origin',cache:'no-store',...options});let data;try{data=await r.json()}catch(_){throw Error('The server could not be reached. Your pending recording is still kept locally.')}
 if(!r.ok)throw Error(data.error||'Request failed.');return data;
}
const post=(path,body)=>api(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('bladefall-voice-recovery',1);r.onupgradeneeded=()=>r.result.createObjectStore('pending',{keyPath:'take'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function pendingStore(action,value){const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction('pending',action==='getAll'?'readonly':'readwrite'),r=tx.objectStore('pending')[action](value);tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Local storage is full.'))})}finally{d.close()}}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function refreshList(){
 const speaker=$('speaker').value,search=$('search').value.toLowerCase(),pending=$('unfinished').checked;
 const list=catalog.filter(l=>(!speaker||l.speaker===speaker)&&(!pending||!l.currentApproval)&&(`${l.id} ${l.scene} ${l.text}`.toLowerCase().includes(search)));
 $('progress').textContent=`${catalog.filter(l=>l.currentApproval).length} / ${catalog.length} lines approved for current wording`;
 $('lines').replaceChildren();for(const l of list){const b=document.createElement('button');b.className=l.id===selected?.id?'active':'';b.textContent=(l.currentApproval?'✓ ':'')+l.speakerName+' · '+l.id.split('.').at(-1);const sub=document.createElement('small');sub.textContent=l.scene+' · '+l.takes.length+' takes';b.append(sub);b.onclick=()=>select(l);$('lines').append(b)}
}
function select(line,force=false){
 if(recording||busy&&!force)return;
 if(!force&&selected&&$('text').value!==selected.text&&!confirm('Leave without saving the wording you edited?'))return;
 selected=line;$('editor').hidden=false;$('scene').textContent=line.scene+' · '+line.status;$('lineTitle').textContent=line.speakerName;$('identity').textContent=line.role+' · '+line.id;
 $('context').textContent=line.context;$('direction').textContent=line.direction;$('text').value=line.text;$('wording').textContent='Saved wording · '+line.revision.slice(0,8);
 $('choices').replaceChildren();for(const text of line.choices){const li=document.createElement('li');li.textContent=text;$('choices').append(li)}
 $('takes').replaceChildren();for(const t of [...line.takes].reverse()){const o=document.createElement('option');o.value=t.id;o.textContent=new Date(t.date).toLocaleString()+' · '+Math.round(t.duration)+'s'+(t.revision!==line.revision?' · older wording':'')+(line.approval?.take===t.id?' · approved':'');$('takes').append(o)}
 updateTake();refreshList();
}
function updateTake(){
 $('player').pause();if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null}
 const t=selected?.takes.find(t=>t.id===$('takes').value);$('player').removeAttribute('src');$('player').load();
 if(t)$('player').src=API+'audio/'+t.id;
 $('takeInfo').textContent=t?`${t.mime} · ${(t.bytes/1024).toFixed(0)} KB · Recorded wording: “${t.text}”`:'No takes yet. Record one or upload an existing file.';
 $('approve').disabled=!t||t.revision!==selected.revision||!!recording||busy;$('download').disabled=!t;
 $('approval').textContent=selected?.currentApproval?'Official take saved and available to game playback.':selected?.approval?'Wording changed. Earlier approval is preserved but will not play until a matching take is approved.':'No official take yet.';
}
async function refresh(keep=true){
 const old=selected?.id,{lines}=await api('catalog');catalog=lines;
 const speaker=$('speaker').value;$('speaker').replaceChildren(new Option('All characters',''));for(const name of [...new Set(lines.map(l=>l.speaker))])$('speaker').append(new Option(lines.find(l=>l.speaker===name).speakerName,name));$('speaker').value=speaker;
 if(keep&&old){selected=null;select(lines.find(l=>l.id===old)||lines[0],true)}else {selected=null;select(lines[0],true)}refreshList();
}
async function recovery(){
 const rows=await pendingStore('getAll');$('recovery').hidden=!rows.length;$('pending').replaceChildren();
 for(const row of rows){const p=document.createElement('p');p.textContent=row.id+' · '+new Date(row.created).toLocaleString()+' ';const retry=document.createElement('button');retry.textContent='Retry upload';retry.onclick=()=>work(async()=>{await uploadPending(row);await refresh();await recovery();say('Recording saved online.')});const save=document.createElement('button');save.textContent='Download unsynced take';save.onclick=()=>download(row.blob,row.id+'-'+row.take+extension(row.blob.type));p.append(retry,save);$('pending').append(p)}
}
function extension(mime){return mime.includes('mp4')?'.m4a':mime.includes('wav')?'.wav':mime.includes('mpeg')?'.mp3':mime.includes('ogg')?'.ogg':'.webm'}
async function uploadPending(row){
 const form=new FormData();form.set('metadata',JSON.stringify({id:row.id,take:row.take,text:row.text,revision:row.revision,duration:row.duration}));form.set('audio',row.blob,row.take+extension(row.blob.type));
 const result=await api('take',{method:'POST',body:form});await pendingStore('delete',row.take);return result;
}
async function saveRecording(blob,line,duration,takeId){
 const row={take:takeId||crypto.randomUUID(),id:line.id,text:line.text,revision:line.revision,duration,blob,created:Date.now()};
 try{await pendingStore('put',row)}catch(e){download(blob,line.id+'-recovery'+extension(blob.type));throw Error('Local recovery storage failed. A recovery download was started; keep that file before leaving.')}
 say('Take kept on this device. Uploading…');try{await uploadPending(row);await refresh();say('Take saved online. Listen, retake, or approve it.')}finally{await recovery()}
}
async function work(fn){if(busy||recording)return;busy=true;lock();try{await fn()}catch(e){say(e.message)}finally{busy=false;lock()}}
function lock(){
 for(const id of ['record','saveText','text','speaker','search','unfinished','refresh','restore','upload','next','backup'])$(id).disabled=busy||!!recording;
 $('stop').disabled=!recording||recording.state!=='recording';$('approve').disabled=busy||!!recording||!selected?.takes.some(t=>t.id===$('takes').value&&t.revision===selected.revision);
 $('takes').disabled=busy||!!recording;for(const b of $('lines').children)b.disabled=busy||!!recording;
}
async function startRecording(){
 if(busy||recording||!selected)return;if($('text').value!==selected.text){say('Save the wording before recording so the take matches it.');return}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){say('This browser cannot record here. Try a current browser, or upload an existing recording.');return}
 busy=true;lock();$('player').pause();const line={...selected};
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
  const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));
  recording=new MediaRecorder(stream,mime?{mimeType:mime}:{});let chunks=[],started=Date.now(),failed=false,localQueue=Promise.resolve(),takeId=crypto.randomUUID();
  recording.ondataavailable=e=>{if(!e.data.size)return;chunks.push(e.data);const row={take:takeId,id:line.id,text:line.text,revision:line.revision,duration:(Date.now()-started)/1000,blob:new Blob(chunks,{type:recording.mimeType}),created:started};localQueue=localQueue.then(()=>pendingStore('put',row)).catch(()=>say('Local recovery storage is unavailable. Stop and download this take before leaving.'));};
  recording.onerror=()=>{failed=true;say('The microphone stopped unexpectedly. Any captured audio will be saved.')};
  recording.onstop=async()=>{
   clearInterval(tick);const type=recording.mimeType;recording=null;for(const t of stream?.getTracks()||[])t.stop();stream=null;busy=true;lock();
   try{const blob=new Blob(chunks,{type});if(blob.size<32)throw Error('No audio was captured. Check your microphone and try again.');await localQueue;await saveRecording(blob,line,(Date.now()-started)/1000,takeId);if(failed)say('Interrupted take saved. Please listen before approving.')}catch(e){say(e.message)}finally{busy=false;lock()}
  };
  for(const track of stream.getAudioTracks())track.onended=()=>{if(recording?.state==='recording')recording.stop()};
  recording.start(1000);tick=setInterval(()=>{const sec=Math.floor((Date.now()-started)/1000);$('clock').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');if(sec>=180&&recording?.state==='recording')recording.stop()},250);say('Recording. Stop when you finish the line.');
 }catch(e){for(const t of stream?.getTracks()||[])t.stop();stream=null;recording=null;say(e.name==='NotAllowedError'?'Microphone access was denied. Allow it in your browser settings, then try again.':e.message)}finally{busy=false;lock()}
}
async function audioBlob(t){const r=await fetch(API+'audio/'+t.id,{cache:'no-store'});if(!r.ok)throw Error('Could not download this take. Check your connection and retry.');return r.blob()}
const base64=buffer=>{let text='';const a=new Uint8Array(buffer);for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(text)};
async function backup(){
 const line=structuredClone(selected);if(line.takes.reduce((n,t)=>n+t.bytes,0)>48*1024*1024)throw Error('This line has over 48 MB of takes. Download the originals individually before continuing.');
 const takes=[];for(const t of line.takes){const blob=await audioBlob(t);takes.push({...t,data:base64(await blob.arrayBuffer())})}
 download(new Blob([JSON.stringify({format:'bladefall-voice-backup',version:1,line,takes},null,2)],{type:'application/json'}),line.id+'-voice-backup.json');say('Backup downloaded with all takes and their exact wording.');
}
async function restoreBackup(file){
 if(file.size>70*1024*1024)throw Error('This backup is too large. Use a single-line backup.');const b=JSON.parse(await file.text());
 if(b.format!=='bladefall-voice-backup'||b.version!==1||!catalog.some(l=>l.id===b.line?.id)||!Array.isArray(b.takes)||b.takes.length>200)throw Error('Not a supported line backup.');
 for(const t of b.takes){if(typeof t.data!=='string'||t.data.length>17*1024*1024||typeof t.text!=='string'||await hash(t.text)!==t.revision)throw Error('Backup text check failed.');const bytes=Uint8Array.from(atob(t.data),c=>c.charCodeAt(0));const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');if(sha!==t.sha)throw Error('Backup audio check failed.');const row={id:b.line.id,take:t.id,text:t.text,revision:t.revision,duration:t.duration,blob:new Blob([bytes],{type:t.mime}),created:Date.now()};await pendingStore('put',row);await uploadPending(row)}
 await refresh();say('Backup takes restored. Current wording and official selection were kept. To use older wording, copy it from the take details, save it, then approve that take.');await recovery();
}
async function enter(){await refresh(false);$('studio').hidden=false;await recovery();say('Select a line to begin.');}
for(const id of ['speaker','search','unfinished'])$(id).oninput=refreshList;
$('refresh').onclick=()=>work(async()=>{if(selected&&$('text').value!==selected.text&&!confirm('Refresh and discard unsaved wording?'))return;await refresh();await recovery();say('Library refreshed.')});
$('saveText').onclick=()=>work(async()=>{await post('line',{id:selected.id,version:selected.version,text:$('text').value});await refresh();say('Wording saved. Older takes are preserved; only matching wording can be approved.')});
$('record').onclick=startRecording;$('stop').onclick=()=>{if(recording?.state==='recording'){recording.stop();$('stop').disabled=true;say('Saving captured audio…')}};
$('upload').onchange=()=>{const file=$('upload').files[0];if(file)work(async()=>{if($('text').value!==selected.text)throw Error('Save the wording before importing a take.');await saveRecording(file,{...selected},0);$('upload').value=''})};
$('takes').onchange=updateTake;
$('approve').onclick=()=>work(async()=>{const take=$('takes').value;await post('approve',{id:selected.id,version:selected.version,take});await refresh();$('takes').value=take;updateTake();say('Official take approved and published for this line.')});
$('download').onclick=()=>work(async()=>{const t=selected.takes.find(t=>t.id===$('takes').value);download(await audioBlob(t),selected.id+'-'+t.id+extension(t.mime))});
$('backup').onclick=()=>work(backup);$('restore').onchange=()=>{const f=$('restore').files[0];if(f)work(async()=>{await restoreBackup(f);$('restore').value=''})};
$('next').onclick=()=>{const list=catalog.filter(l=>l.speaker===selected.speaker),i=list.findIndex(l=>l.id===selected.id);select(list[(i+1)%list.length])};
addEventListener('beforeunload',e=>{if(recording||busy||(selected&&$('text').value!==selected.text)){e.preventDefault();e.returnValue=''}});
api('status').then(enter).catch(e=>say(e.message));
