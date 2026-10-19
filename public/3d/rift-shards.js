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
 // Compile reward ownership once per immutable story book, not every HUD tick.
 const rewardBooks=new WeakMap();
 function shardRewards(book){
  if(!book)return [];if(rewardBooks.has(book))return rewardBooks.get(book);
  const out=[];
  const scan=(v,anchor,kind)=>{if(!v||typeof v!=='object')return;
   if(v.type==='reward'&&v.kind==='rift_shard'){const id=String(v.id||'').match(/(?:^|\.)([A-Z]{2}-0[1-5])$/)?.[1];if(valid(id))out.push({id,anchor,kind});}
   for(const x of Object.values(v))if(x&&typeof x==='object')scan(x,anchor,kind);
  };
  for(const node of Object.values(book.nodes||{}))scan(node,node.voice?.speaker,'npc');
  for(const [key,event]of Object.entries(book.events||{}))scan(event,key,'event');
  rewardBooks.set(book,out);return out;
 }
 function senseTargets(saved,attempt,all,visible,npcs,objects,book,prefix){
  const found=new Set([...normalize(saved),...pending(attempt).found,...pending(attempt).echoes]);
  const shown=new Set(visible.map(o=>o.id)),targets=new Map();
  const add=(o,kind)=>{if(valid(o.id)&&o.id.startsWith(prefix+'-')&&!found.has(o.id)&&[o.x,o.y??0,o.z].every(Number.isFinite)&&!targets.has(o.id))targets.set(o.id,{...o,y:o.y??0,kind});};
  for(const o of all)add(o,shown.has(o.id)?'Rift Shard':'Sealed shard');
  for(const r of shardRewards(book)){const anchor=(r.kind==='npc'?npcs:objects).find(o=>(r.kind==='npc'?o.id:o.key)===r.anchor);if(anchor)add({...anchor,id:r.id},'Quest reward');}
  return [...targets.values()];
 }
 function nearestShard(p,targets){return targets.reduce((best,o)=>{const distance=Math.hypot(p.x-o.x,(p.y||0)-(o.y||0),p.z-o.z);return !best||distance<best.distance?{...o,distance}:best;},null);}
 const api={regions,valid,normalize,pending,collect,bank,progress,shardRewards,senseTargets,nearestShard};root.BFRiftShards=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
