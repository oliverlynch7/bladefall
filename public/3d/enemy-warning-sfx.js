/* Ordinary creature wind-ups: local observation of shared animation state, no network replay. */
(function(root){'use strict';
const ids=Object.freeze(["dustjackal", "toxling", "slime", "slimelet", "cragspitter", "sporeback", "shadeling", "blinkstalker", "voidtether", "galewisp", "flyer", "revenant", "bones", "grunt", "emberling", "magmaskit", "embertotem", "frostling", "sparkling", "frostlobber", "frostshell", "sentinel", "siegeknight", "marblestatue", "caster", "sunpriest", "royalarcanist"]);
const definitions=Object.freeze(Object.fromEntries(ids.map(id=>['enemywarn_'+id,{f:'custom/enemy-warnings-20261018/enemywarn_'+id+'_v01',v:.3,lazy:true}])));
const types=new Set(ids);
const fields=['meleeW','shotW','eruptW','knightW','blinkFx','fuseT'];
let states=new WeakMap(),recent=[];
function apply(registry){for(const [id,def]of Object.entries(definitions))if(!Object.hasOwn(registry,id))registry[id]={...def};}
function eligible(e){return !!e&&!e.dead&&!e.boss&&!e.bot&&!e.dummy&&types.has(e.type);}
function distance(e,p){if(!p)return Infinity;return Math.hypot(e.x-p.x,(e.y-(p.y||0))*.6,e.z-p.z);}
function warm(e,p,queue){if(eligible(e)&&distance(e,p)<1300)queue('enemywarn_'+e.type);}
function emit(e,p,now,play){if(!eligible(e)||!e.active||!Number.isFinite(now))return false;const d=distance(e,p);if(!Number.isFinite(d)||d>=1200)return false;
 const old=states.get(e)||{mask:0,last:-Infinity};if(now-old.last<.9)return false;old.last=now;states.set(e,old);
 recent=recent.filter(t=>now-t<.3);if(recent.length>=3)return false;const gain=Math.max(0,Math.min(1,(1200-d)/900));let played=false;try{played=!!play('enemywarn_'+e.type,gain);}catch(_){}if(played)recent.push(now);return played;}
function tick(e,p,now,play){if(!eligible(e))return false;const old=states.get(e)||{mask:0,last:-Infinity},mask=fields.reduce((n,k,i)=>n|((e[k]>0?1:0)<<i),0),rising=mask&~old.mask;old.mask=mask;states.set(e,old);return !!rising&&emit(e,p,now,play);}
function reset(){states=new WeakMap();recent=[];}
const api={ids,definitions,apply,warm,emit,tick,reset};root.BFEnemyWarnings=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
