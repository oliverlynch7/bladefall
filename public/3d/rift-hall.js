/* Personal Hall access. World conversations never transfer another player's shards. */
(function(root){
 'use strict';
 const names=['Briar Town','Hollow Pass','Ruined Keep','Frostfell','Emberdeep','Storm Coast','Sunspire Palace','Castle Duskmoor'];
 const classes=['Berserker','Ninja','Reaper','Chronomancer','Pyromancer','Pirate','Paladin','Necromancer'];
 function normalize(value){return [...new Set((Array.isArray(value)?value:[]).filter(id=>root.BFRiftShards.regions.some(r=>r.id===id)))].sort()}
 function frames(meta,zones,trials){return root.BFRiftShards.regions.map((r,i)=>{
  const progress=root.BFRiftShards.progress(meta.riftShards,null,r.id);
  const legacy=zones.some(z=>z.side?.trial===r.classId&&meta.sideFound?.[z.side.id]);
  const learned=!!meta.classUnlocked?.[r.classId],assembled=normalize(meta.riftOpen).includes(r.id),available=!!trials[r.classId];
  const ending=r.id!=='duskmoor'||!!meta.zoneDone?.castle||learned;
  const open=available&&(learned||legacy||ending&&assembled);
  return {...r,name:names[i],className:classes[i],index:i,banked:progress.banked,ready:progress.ready,legacy,learned,assembled,available,ending,open,
   status:!available?'Discipline being prepared':open?(learned?'Practice this class':assembled?'Trial ready':'Previously opened'):!ending?'Complete Castle Duskmoor':progress.ready?'Ask the Rift Keeper to assemble':'Find five matching shards'};
 })}
 function assemble(meta,zones,trials){const opened=normalize(meta.riftOpen),added=frames(meta,zones,trials).filter(f=>f.ready&&f.available&&f.ending&&!opened.includes(f.id)).map(f=>f.id);return {opened:normalize([...opened,...added]),added}}
 const api={normalize,frames,assemble};root.BFRiftHall=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
