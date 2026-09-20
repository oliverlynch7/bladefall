/* Save-local Rift Shards. Physical pickups call collect only for the local player;
   story rewards call it once for each eligible player's personal receipt. */
(function(root){
 'use strict';
 const regions=Object.freeze([
  {id:'briar',prefix:'BR',classId:'berserker'},
  {id:'hollow',prefix:'HP',classId:'ninja'},
  {id:'keep',prefix:'RK',classId:'reaper'},
  {id:'frost',prefix:'FF',classId:'chronomancer'},
  {id:'ember',prefix:'ED',classId:'pyromancer'},
  {id:'storm',prefix:'SC',classId:'pirate'},
  {id:'sunspire',prefix:'SP',classId:'paladin'},
  {id:'duskmoor',prefix:'CD',classId:'necromancer'}].map(Object.freeze));
 const ids=new Set(regions.flatMap(r=>[1,2,3,4,5].map(i=>r.prefix+'-0'+i)));
 const valid=id=>typeof id==='string'&&ids.has(id);
 function normalize(value){return [...new Set((Array.isArray(value)?value:[]).filter(valid))].sort()}
 function pending(value){return {found:normalize(value?.found),echoes:normalize(value?.echoes)}}
 function collect(saved,attempt,id){
  const next=pending(attempt);if(!valid(id))return {outcome:'invalid',pending:next};
  if(next.found.includes(id)||next.echoes.includes(id))return {outcome:'already',pending:next};
  if(normalize(saved).includes(id)){next.echoes.push(id);return {outcome:'echo',pending:next}}
  next.found.push(id);return {outcome:'found',pending:next};
 }
 function bank(saved,attempt){return normalize([...normalize(saved),...pending(attempt).found])}
 function progress(saved,attempt,region){const r=regions.find(r=>r.id===region);if(!r)return null;
  const permanent=normalize(saved).filter(id=>id.startsWith(r.prefix+'-'));
  const provisional=pending(attempt).found.filter(id=>id.startsWith(r.prefix+'-')&&!permanent.includes(id));
  return {banked:permanent.length,pending:provisional.length,total:5,ready:permanent.length===5,classId:r.classId};
 }
 const api={regions,valid,normalize,pending,collect,bank,progress};root.BFRiftShards=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
