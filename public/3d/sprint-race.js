/* Sprint timing is independent of world age; menus/loading cannot consume a run. */
(function(root){'use strict';
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const create=(seed,budget)=>({seed:seed>>>0,budget:Math.max(1,budget),elapsed:0,penalty:0,falls:0,started:false,finished:false});
 const remaining=r=>Math.max(0,r.budget-r.elapsed-r.penalty);
 function step(r,dt,moving,paused=false){if(r.finished||paused)return false;const began=!r.started&&moving;if(began)r.started=true;if(r.started&&finite(dt))r.elapsed+=Math.max(0,dt);return began;}
 function fall(r){if(r.finished)return; r.started=true;r.falls++;r.penalty+=3;}
 const result=r=>({seed:r.seed,time:r.elapsed+r.penalty,running:r.elapsed,penalty:r.penalty,falls:r.falls});
 function records(v){return Object.fromEntries(Object.entries(v&&typeof v==='object'?v:{}).filter(([k,n])=>/^v2:\d{1,10}$/.test(k)&&finite(n)&&n>0&&n<36000).slice(-30));}
 const key=seed=>'v2:'+(seed>>>0);
 function record(v,seed,time){const next=records(v),id=key(seed),prev=next[id]||0,best=finite(time)&&time>0&&(!prev||time<prev);if(best){delete next[id];next[id]=+time.toFixed(2);}return {records:records(next),best,previous:prev,value:next[id]||0};}
 root.BFSprintRace={create,step,fall,remaining,result,records,key,record};if(typeof module!=='undefined')module.exports=root.BFSprintRace;
})(typeof window!=='undefined'?window:globalThis);
