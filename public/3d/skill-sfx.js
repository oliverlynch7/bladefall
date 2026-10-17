/* Additive cast identities: no original slots or SFX methods are replaced. */
(function(root){'use strict';
const ids=Object.freeze(['py_bolt','py_fan','py_blast','py_ward','py_lance','py_nova','py_inferno','py_sun']);
const volumes=[.34,.35,.40,.30,.36,.43,.44,.46];
const definitions=Object.freeze(Object.fromEntries(ids.map((id,i)=>['skillcast_'+id,Object.freeze({f:'custom/pyromancer-20261017/'+id+'_v01',v:volumes[i]})])));
function apply(registry){for(const [id,def]of Object.entries(definitions))if(!Object.prototype.hasOwnProperty.call(registry,id))registry[id]={...def};}
function cast(id,play){if(!ids.includes(id))return false;try{return !!(play('skillcast_'+id)||play('cast1',.65));}catch{return false;}}
const api={ids,definitions,apply,cast};root.BFSkillSfx=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
