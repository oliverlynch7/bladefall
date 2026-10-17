/* Bag browsing is presentation-only. Equipping remains an atomic game transaction. */
(function(root){'use strict';
const item=entry=>entry?.weapon||entry?.armor||entry?.trinket;
function list(stash,view,api){
 const rows=(stash||[]).map((entry,index)=>({entry,index,item:item(entry)})).filter(r=>r.item);
 return rows.filter(r=>{
  const weapon=!!r.entry.weapon;
  if(view.slot&&!(view.slot==='weapon'?weapon:!weapon&&r.item.slot===view.slot))return false;
  if(view.category==='weapons'&&!weapon||view.category==='armor'&&weapon)return false;
  if(view.weaponType!=='all'&&view.category==='weapons'&&api.weaponType(r.item)!==view.weaponType)return false;
  return !view.readyOnly||api.ready(r.entry,r.item);
 }).sort((a,b)=>view.sort==='recent'?b.index-a.index:(api.tier(b.item)-api.tier(a.item))||b.index-a.index);
}
const api={item,list};root.BFBagBrowser=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
