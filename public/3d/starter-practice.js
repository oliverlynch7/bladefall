/* Only the first, unfinished starter tutorial. Earned class trials keep their escrow rules. */
(function(root){'use strict';
 function normalize(v,snapshot){
  if(!v||v.v!==1||!['warrior','ranger','mage'].includes(v.cid)||typeof snapshot!=='function')return null;
  const p=snapshot(v.p);if(!p?.weapon?.cls||!p.gear||!Number.isInteger(v.runSeed)||!Number.isInteger(v.kills)||v.kills<0||v.kills>6)return null;
  const defeated=[...new Set((Array.isArray(v.defeated)?v.defeated:[]).filter(n=>Number.isSafeInteger(n)&&n>0))].slice(0,500);
  if(defeated.length<v.kills)return null;
  return {v:1,cid:v.cid,p,runSeed:v.runSeed>>>0,kills:v.kills,defeated,lesson:typeof v.lesson==='string'?v.lesson.slice(0,40):'welcome'};
 }
 root.BFStarterPractice={normalize};if(typeof module!=='undefined')module.exports=root.BFStarterPractice;
})(typeof window!=='undefined'?window:globalThis);
