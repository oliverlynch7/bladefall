/* Campaign-only tactical defenses. Direct hits, companions and status damage share the same limits. */
(function(root){'use strict';
const live=e=>e&&!e.dead&&e.hp>0;
function rule(G,e,src,kind='direct'){
 const r={factor:1,floor:0,hint:'',key:null,limit:0};if(!live(e)||e._peer||e.bot||e.practice||e.dummy)return r;
 const close=src&&Math.abs((src.y||0)-(e.y||0))<95&&Math.hypot(src.x-e.x,src.z-e.z)<340;
 if(e.bruteOrchard){r.factor=e.bruteState==='stagger'?1.3:e.bruteState==='recover'?1:.16;r.floor=e.bruteStaggers?0:.4;r.hint=e.bruteState==='stagger'?'Staggered — attack now':e.bruteState==='recover'?'Recovering — attack now':'Bait a charge into a cart or stone';}
 else if(e.marksmanCrossing){const opening=e.markExposed>0||(kind==='direct'&&close);r.factor=opening?1:e.markState==='recover'?.32:.12;r.floor=!e.markMoved?.55:(!e.markTacticDone&&!opening?.2:0);r.hint=opening?'Bow exposed — attack now':'Use stone cover or climb to her nest';}
 else if(e.fallenDuel){r.factor=e.fallState==='stagger'?1.35:e.fallState==='recover'?1:.24;r.floor=(e.fallTurn||0)<2?.35:0;r.hint=e.fallState==='stagger'?'Blade caught — attack now':e.fallState==='recover'?'Opening — attack now':'Dodge the blade; pillars stop the thrust';}
 else if(e.frostOfficer){const protector=(G.enemies||[]).find(q=>q.frostOfficer==='shield'&&live(q));if(e.frostOfficer==='caster'&&protector&&Math.hypot(e.x-protector.x,e.z-protector.z)<1000){r.factor=.15;r.hint='Shield protects caster — separate the officers';}else if(e.frostOfficer==='shield'&&e.offState!=='recover'){const dx=(src?.x??e.x)-e.x,dz=(src?.z??e.z)-e.z,d=Math.hypot(dx,dz);r.factor=kind==='status'?.4:d>0&&(dx*Math.sin(e.yaw||0)+dz*Math.cos(e.yaw||0))/d>.15?.18:1;r.hint='Flank the shield or strike after its wave';}else{r.hint='Officer exposed — attack';}}
 else if(e.furnaceColossus){const open=e.fcExposed>0;r.factor=open?1:.04;r.floor=open?0:Math.max(e._fcCool?0:.35,(e._bossClosedFloor||0)/e.maxHp);r.key=open?'cool:'+e._fcCool:null;r.limit=open?.55:0;r.hint=open?'Armor cooled — strike the joints':'Turn a cooling valve to open the armor';}
 else if(e.marbleGuardian){const open=e.mcExposed>0;r.factor=open?1:0;r.key=open?'screen:'+e.mcSeq:null;r.limit=open?.55:0;r.hint=open?'Armor seal open — attack':'Turn a screen; reflect the heavy strike';}
 else if(e.hydraChain){r.factor=G.hydraArena?.state==='recover'&&G.hydraArena.head===e.hydraIndex?1:0;r.hint=r.factor?'Pale joint — break this restraint':'Dodge, then strike the resting head’s pale joint';}
 else if(e.finalKing){r.factor=e.akState==='adds'?0:e.akState==='recover'?1:.22;r.floor=e.phase===2&&!e.akSummoned?.55:e.phase!==2&&(e.akBeat||0)<2?.35:0;r.hint=e.akState==='adds'?'Defeat the summoned guards':e.akState==='recover'?'Opening — attack now':'Use pillars for the beam; jump the ground wave';}
 return r;
}
function damage(G,e,src,dmg,kind='direct'){
 if(!Number.isFinite(dmg)||dmg<=0)return 0;const r=rule(G,e,src,kind);
 if(!r.hint)return dmg;if(e.untargetable||r.factor<=0)return 0;
 let n=Math.max(1,Math.round(dmg*r.factor));n=Math.min(n,Math.max(0,e.hp-Math.ceil(e.maxHp*r.floor)));
 if(r.key){
  if(e._bossBudgetKey!==r.key){e._bossBudgetKey=r.key;e._bossBudgetSpent=0;e._bossWindowFloor=Math.max(0,e.hp-Math.ceil(e.maxHp*r.limit));e._bossClosedFloor=0;}
  n=Math.min(n,Math.max(0,Math.ceil(e.maxHp*r.limit)-(e._bossBudgetSpent||0)));e._bossBudgetSpent=(e._bossBudgetSpent||0)+n;
  if(e._bossBudgetSpent>=Math.ceil(e.maxHp*r.limit)){
   if(e.furnaceColossus){e.fcExposed=0;e._bossClosedFloor=e._bossWindowFloor;}
   if(e.marbleGuardian){e.mcExposed=0;e.mcClock=Math.min(e.mcClock||0,.9);}
  }
 }
 if(e.marksmanCrossing&&kind==='direct'&&n>0&&(e.markExposed>0||src&&Math.abs((src.y||0)-(e.y||0))<95&&Math.hypot(src.x-e.x,src.z-e.z)<340))e.markTacticDone=true;
 return n;
}
root.BFBossTactics={rule,damage};if(typeof module!=='undefined')module.exports=root.BFBossTactics;
})(typeof window!=='undefined'?window:globalThis);
