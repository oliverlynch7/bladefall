/* Shared by the dialogue preview and future in-world NPC presentation.
   Only server-approved, current-wording lines are exposed by this endpoint. */
window.BFVoiceContent={async apply(book){
 try{
  const r=await fetch('/voice-api/game',{cache:'no-store',signal:AbortSignal.timeout(3000)});if(!r.ok)return book;
  const data=await r.json();
  for(const [id,line]of Object.entries(data.lines||{})){
   if(!Object.prototype.hasOwnProperty.call(book.nodes,id)||typeof line.text!=='string'||!line.audio?.startsWith('/voice-api/published/'))continue;
   book.nodes[id].text=line.text;book.nodes[id].recordedAudio=line.audio;book.nodes[id].voiceRevision=line.revision;
  }
 }catch(_){/* Text-only play remains available when audio storage is offline. */}
 return book;
}};
