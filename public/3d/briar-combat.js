/* Authored Briar encounters. Finite patrols, readable pressure, no player-stat scaling. */
(function(root){'use strict';
const encounters={
 0:[{id:'millrace-patrol',name:'Millrace patrol',members:[['grunt',20,-2570,'runner'],['caster',-110,-2810,'hex']]}],
 1:[{id:'forest-searchers',name:'Forest searchers',members:[['grunt',65,-690,'runner'],['caster',-165,-930,'hex']]}]
};
function active(G){return !!G&&G.zone===0&&(G.area===0||G.area===1)&&!G.bonusActive&&!G.sprintFun&&!G.sparringRoom&&!G.hub&&!G.side&&!G.trial&&!G.endless&&!G.delve&&!G.arena&&!G.devBriar&&!G.devKeep;}
function build(G,api){
 if(!active(G)||G.briarCombat)return;
 G.briarCombat={revision:1};
 if(G.area===0){
  // First meet one mobile raider, then a guard. Leave the homes and mill puzzle quiet.
  const opening=G.enemies.filter(e=>e.type==='grunt'&&!e.elite&&!e.homeRaid&&e.z>-650).sort((a,b)=>a.mid-b.mid).slice(0,2);
  for(const [i,e]of opening.entries())Object.assign(e,{x:i?230:110,z:i?-910:-520,sx:i?230:110,sz:i?-910:-520,briarRoleHint:i?'guard':'runner',briarEncounter:'village-watch'});
 }
 for(const group of encounters[G.area]||[])for(const [type,x,z,role]of group.members){
  const e=api.spawn(type,x,z,false);if(!e)continue;
  const y=api.support(e);
  if(!Number.isFinite(y)||y<-1e8){G.enemies.splice(G.enemies.indexOf(e),1);continue;}
  Object.assign(e,{y,sy:y,sx:x,sz:z,briarRoleHint:role,briarEncounter:group.id,dropT:.7});
 }
}
function allowAttack(G,e,target,clear,players=1){
 if(!target||!clear)return false;if(!active(G))return true;
 const busy=G.enemies.filter(q=>q!==e&&!q.dead&&q.hp>0&&Math.abs((q.ceY??q.y??0)-(target.y||0))<100&&((q.ceKind&&['wind','strike'].includes(q.ceState))||(q.kind==='charger'&&(q.windT>0||q.chargeT>0)))&&Math.hypot(q.x-target.x,q.z-target.z)<620).length;
 return busy<(players>1?3:2);
}
function decision(G,e,target,clear,players=1){
 if(!active(G)||!e.briarRole)return {target,attack:allowAttack(G,e,target,clear,players)};
 if(e.briarHomeX==null){e.briarHomeX=e.sx??e.x;e.briarHomeZ=e.sz??e.z;e.briarHomeY=e.sy??e.y;}
 if(!target)return {target:null,attack:false};
 const distance=Math.hypot(target.x-e.briarHomeX,target.z-e.briarHomeZ);
 // Finish a committed tell. Return only during hunt; no sudden attack cancellation.
 if(e.ceState==='hunt'&&distance>900)return {target:{x:e.briarHomeX,z:e.briarHomeZ,y:e.briarHomeY,hp:1},attack:false};
 return {target,attack:allowAttack(G,e,target,clear,players)};
}
function damage(e,amount){return e.briarRole&&e.ceState==='recover'?amount*1.15:amount;}
function hit(e,dealt){
 if(e.dead||e.hp<=0||!e.briarRole||dealt<=0)return null;
 // A substantial hit interrupts a hex. Small repeated hits cannot stunlock a guard.
 if(e.briarRole==='hex'&&e.ceState==='wind'&&dealt>=e.maxHp*.3){
  Object.assign(e,{ceState:'recover',ceClock:1.15,ceSerial:e.ceSerial+1,meleeW:0,meleeActive:0});return 'CAST INTERRUPTED';
 }
 if(e.ceState==='recover'&&e._briarPunishSerial!==e.ceSerial){e._briarPunishSerial=e.ceSerial;return 'OPENING';}
 return null;
}
const api={active,build,decision,allowAttack,damage,hit,encounters};root.BFBriarCombat=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
