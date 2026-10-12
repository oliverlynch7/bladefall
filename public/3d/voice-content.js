/* Shared by the dialogue preview and future in-world NPC presentation.
   Only server-approved, current-wording lines are exposed by this endpoint. */
let manifestPromise=null,manifestUntil=0;
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
  const data=await manifest();if(!data)return book;
  for(const [id,line]of Object.entries(data.lines||{})){
   if(!Object.prototype.hasOwnProperty.call(book.nodes,id)||typeof line.text!=='string'||!line.audio?.startsWith('/voice-api/published/'))continue;
   if(book.nodes[id].text.trim()!==line.text.trim())continue;book.nodes[id].recordedAudio=line.audio;book.nodes[id].voiceRevision=line.revision;
  }
 }catch(_){/* Text-only play remains available when audio storage is offline. */}
 return book;
}};
