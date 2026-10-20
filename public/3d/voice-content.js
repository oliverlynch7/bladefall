/* Approved NPC cast plus published studio recordings.
   Attach a take only when its wording still matches the live dialogue. */
let manifestPromise=null,manifestUntil=0;
let castPromise=null;
function castManifest(){
 if(!castPromise)castPromise=fetch('./npc-voices/manifest.json?v=2334')
  .then(r=>r.ok?r.json():null).catch(()=>{castPromise=null;return null});
 return castPromise;
}
function manifest(){
 const now=Date.now();
 if(manifestPromise&&now<manifestUntil)return manifestPromise;
 // Every dialogue book uses the same published-line manifest. Share its in-flight
 // request and result; a failed endpoint may recover without reloading the game.
 manifestUntil=now+30000;
 manifestPromise=fetch('/voice-api/game',{cache:'no-store',signal:AbortSignal.timeout(3000)})
  .then(async r=>r.ok?await r.json():null)
  .then(data=>{if(!data)manifestUntil=Date.now()+5000;return data})
  .catch(()=>{manifestUntil=Date.now()+5000;return null});
 return manifestPromise;
}
window.BFVoiceContent={async apply(book){
 try{
  const [cast,data]=await Promise.all([castManifest(),manifest()]);
  for(const [id,line]of Object.entries(cast?.lines||{})){
   const node=book.nodes[id];
   if(!node||node.text.trim()!==line.text?.trim()||node.voice?.speaker!==line.speaker)continue;
   if(!/^\.\/npc-voices\/[a-zA-Z0-9_.-]+\.mp3$/.test(line.audio||''))continue;
   node.recordedAudio=line.audio;node.voiceRevision=cast.revision;node.voiceCast=line.option;
  }
  if(!data)return book;
  for(const [id,line]of Object.entries(data.lines||{})){
   if(!Object.prototype.hasOwnProperty.call(book.nodes,id)||typeof line.text!=='string'||!line.audio?.startsWith('/voice-api/published/'))continue;
   if(book.nodes[id].text.trim()!==line.text.trim())continue;book.nodes[id].recordedAudio=line.audio;book.nodes[id].voiceRevision=line.revision;
  }
 }catch(_){/* Text-only play remains available when audio storage is offline. */}
 return book;
}};
