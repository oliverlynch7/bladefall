(function(root){'use strict';
 const valid=new Set(['yes','no']);
 function clean(raw,catalog){
  if(!raw||raw.schema!==1||raw.revision!==catalog.revision||!raw.characters||typeof raw.characters!=='object')throw Error('This review belongs to a different audition set. Keep your original file.');
  const characters={};
  for(const c of catalog.characters){const r=raw.characters[c.id];if(!r||typeof r!=='object')continue;const votes={};
   for(const p of c.options){const v=r.votes?.[p.option];if(v&&valid.has(v.decision)&&v.sha256===p.sha256)votes[p.option]={decision:v.decision,sha256:p.sha256};}
   characters[c.id]={votes,notes:typeof r.notes==='string'?r.notes.slice(0,2000):''};
  }
  return {schema:1,revision:catalog.revision,characters};
 }
 function state(row,c){const v=row?.votes||{};return c.options.some(p=>v[p.option]?.decision==='yes')?'approved':c.options.every(p=>v[p.option]?.decision==='no')?'rejected':'pending';}
 function summary(review,catalog){return ['BLADEFALL NPC VOICE REVIEW',catalog.revision,'Green lights are casting feedback, not authorization to generate every line.','',...catalog.characters.filter(c=>review.characters[c.id]&&(Object.keys(review.characters[c.id].votes||{}).length||review.characters[c.id].notes)).map(c=>{const r=review.characters[c.id];return `${c.name}: ${c.options.map(p=>`${p.option} ${r.votes[p.option]?.decision==='yes'?'GREEN':r.votes[p.option]?.decision==='no'?'RED':'undecided'}`).join(' · ')}${r.notes?'\nNotes: '+r.notes:''}`;})].join('\n');}
 function restore(raw,approved,catalog){
  const base=clean(approved,catalog);
  if(raw?.baselineRevision===approved.submittedRevision){const local=clean(raw,catalog);base.characters={...base.characters,...local.characters};}
  return {...base,baselineRevision:approved.submittedRevision};
 }
 const api={clean,state,summary,restore};root.BFNPCReview=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
