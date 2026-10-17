(function(root){'use strict';
 const record=v=>!!v&&typeof v==='object'&&!Array.isArray(v),num=(v,d,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):d;
 const maps=['achievements','cosmetics','cosEquipped','classes','classLooks','classUnlocked','trialsDone','zoneDone','zoneSeen','shadeSeen','perks','hubUpgrades','hubDialogue','legacyHubDialogue','optionalDone','optionalProgress','petNames','petTrain','keybinds','controller','returnVisits','chestRecords','sideFound','sideDone'];
 const lists=['unlockedSkins','riftOpen','riftShards','petOwned','iansShards'];
 function item(v){if(!record(v))return null;v={...v};if(!['common','uncommon','rare','epic','legendary'].includes(v.rarity))v.rarity='common';v.affixes=Array.isArray(v.affixes)?v.affixes.filter(a=>record(a)&&typeof a.stat==='string'&&Number.isFinite(Number(a.val))).map(a=>({...a,val:Number(a.val)})):[];if('defense'in v)v.defense=num(v.defense,0,0,1e6);return v;}
 function snapshot(p){if(!record(p))return null;p={...p};p.level=Math.floor(num(p.level,1,1,1000));p.xp=num(p.xp,0,0,1e9);p.xpNext=135+p.level*90+p.level*p.level*5;p.maxHp=num(p.maxHp,100,1,1e8);p.maxMana=num(p.maxMana,100,1,1e7);p.hp=num(p.hp,p.maxHp,0,p.maxHp);p.mana=num(p.mana,p.maxMana,0,p.maxMana);p.maxJumps=Math.floor(num(p.maxJumps,1,1,10));p.gear=record(p.gear)?Object.fromEntries(Object.entries(p.gear).filter(([,v])=>record(v)).map(([k,v])=>[k,item(v)])):{};p.weapon=item(p.weapon);p.stats=record(p.stats)?Object.fromEntries(Object.entries(p.stats).filter(([,v])=>(typeof v==='number'||typeof v==='string')&&v!==''&&Number.isFinite(Number(v))).map(([k,v])=>[k,num(v,0,-1e6,1e6)])):{};return p;}
 function stash(v){return Array.isArray(v)?v.filter(x=>record(x)&&['weapon','armor','trinket'].some(k=>record(x[k]))).slice(0,2000).map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,['weapon','armor','trinket'].includes(k)?item(v):v]))):[];}
 function normalize(v){if(!record(v))return null;v={...v};for(const k of maps)if(k in v&&!record(v[k]))v[k]={};for(const k of lists)if(k in v&&!Array.isArray(v[k]))v[k]=[];if('stash'in v)v.stash=stash(v.stash);for(const k of ['hero','p','base'])if(k in v)v[k]=snapshot(v[k]);
  if('gold'in v)v.gold=num(v.gold,0,0,1e12);if('bagSlots'in v)v.bagSlots=Math.floor(num(v.bagSlots,0,0,100));
  if(v.classes)for(const [id,c]of Object.entries(v.classes)){if(!record(c)){delete v.classes[id];continue;}v.classes[id]={...c,rank:Math.floor(num(c.rank,1,1,10)),xp:num(c.xp,0,0,1e8)};}
  if('run'in v){v.run=record(v.run)?normalize(v.run):null;if(v.run&&!v.run.p)v.run=null;}
  if('bank'in v){v.bank=record(v.bank)?normalize(v.bank):null;}
  if(v.checkpoint?.state&&record(v.checkpoint.state))v.checkpoint={...v.checkpoint,state:normalize(v.checkpoint.state)};
  return v;
 }
 function parse(raw){if(typeof raw!=='string'||raw.length>4e6)return null;try{return normalize(JSON.parse(raw,(k,v)=>['__proto__','constructor','prototype'].includes(k)?undefined:v));}catch{return null;}}
 const api={parse,normalize,snapshot};root.BFSaveSafety=api;if(typeof module!=='undefined')module.exports=api;
 if(typeof window!=='undefined'){let shown=false;window.addEventListener('error',e=>{if(!e.message||shown)return;shown=true;const show=()=>{const a=document.createElement('a');a.href='./recover.html';a.textContent='Game stuck? Open save recovery';a.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483647;background:#241a16;color:#ffe0a2;border:2px solid #dfa33b;padding:14px;border-radius:10px;font:16px system-ui';document.body.append(a);};document.body?show():document.addEventListener('DOMContentLoaded',show,{once:true});});}
})(typeof window!=='undefined'?window:globalThis);
