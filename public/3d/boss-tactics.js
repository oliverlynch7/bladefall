/* Campaign-only tactical defenses. Direct hits, companions and status damage share the same limits. */
(function(root){'use strict';
const live=e=>e&&!e.dead&&e.hp>0;
function rule(G,e,src,kind='direct'){
 const r={factor:1,floor:0,hint:'',key:null,limit:0};if(!live(e)||e._peer||e.bot||e.practice||e.dummy)return r;
 const close=src&&Math.abs((src.y||0)-(e.y||0))<95&&Math.hypot(src.x-e.x,src.z-e.z)<340;
 if(e.bruteOrchard){const open=e.bruteState==='stagger';r.factor=open?3:0;r.key=open?'cart:'+e.bruteStaggers:null;r.limit=.38;r.hint=open?'Charge stopped — attack now':'Bait another charge into a cart or stone';}
 else if(e.marksmanCrossing){const opening=e.markExposed>0||(e.markState==='recover'&&!(e.markAttack>0)&&((kind==='direct'&&close)||(Number.isInteger(e.markNestSeq)&&e.markNestSeq===e.markTurns)));r.factor=opening?1.75:0;r.floor=!e.markMoved?.55:0;r.key=opening?'marksman:'+(e.markWindowSeq||0):null;r.limit=.34;r.hint=opening?'Bow exposed — attack now':'Block a shot with stone cover, or reach her nest during reload';}
 else if(e.fallenDuel){const open=e.fallState==='stagger';r.factor=open?3:0;r.key=open?'pillar:'+e.fallSeq:null;r.limit=.38;r.hint=open?'Blade caught — attack now':'Lead the thrust into a pillar; ordinary recovery stays guarded';}
 else if(e.frostOfficer){const protector=(G.enemies||[]).find(q=>q.frostOfficer==='shield'&&live(q));const separated=!protector||Math.hypot(e.x-protector.x,e.z-protector.z)>1000;
  const dx=(src?.x??e.x)-e.x,dz=(src?.z??e.z)-e.z,d=Math.hypot(dx,dz),rear=kind==='direct'&&src&&d>0&&(dx*Math.sin(e.yaw||0)+dz*Math.cos(e.yaw||0))/d<-.15;
  const open=(e.offSeq||0)>0&&e.offState==='recover'&&(e.frostOfficer==='caster'?separated:e.frostOfficer==='shield'?(rear||e.offFlankedSeq===e.offSeq):true);
  r.factor=open?1.75:0;r.key=open?'officer:'+e.offSeq:null;r.limit=.4;r.hint=open?'Officer exposed — attack':e.frostOfficer==='caster'?'Draw the shield officer away from the caster':e.frostOfficer==='shield'?'Jump the wave, then strike the shield from behind':'Sidestep the rush, then close in while the spear recovers';}
 else if(e.furnaceColossus){const open=e.fcExposed>0;r.factor=open?2.5:0;r.key=open?'cool:'+e._fcCool:null;r.limit=.34;r.hint=open?'Armor cooled — strike the joints':e.fcValveCd>0?'Cooling refills in '+Math.ceil(e.fcValveCd)+'s — avoid its attacks':'Turn a cooling valve to open the armor';}
 else if(e.marbleGuardian){const open=e.mcExposed>0;r.factor=open?2.5:0;r.key=open?'screen:'+e.mcSeq:null;r.limit=.34;r.hint=open?'Armor seal open — attack':'Turn a screen; reflect the heavy strike';}
 else if(e.hydraChain){const h=G.hydraArena,open=h?.state==='recover'&&h.head===e.hydraIndex&&(h.seq||0)>0;r.factor=open?2.5:0;r.key=open?'joint:'+h.seq:null;r.limit=.55;r.hint=open?'Pale joint — break this restraint':'Use the ledges and stone cover; strike after the head attacks';}
 else if(e.finalKing){const open=e.akState==='recover'&&e.akEnvSeq>0&&e.akEnvSeq===e.akSeq&&e.akEnvPhase===e.phase;r.factor=open?3:0;r.floor=e.phase===2&&!e.akSummoned?.55:0;r.key=open?'king:'+e.phase+':'+e.akSeq:null;r.limit=.38;r.hint=e.akState==='adds'?'Defeat the summoned guards':open?'Royal ward broken — attack now':'Block the beam with a pillar or jump the ground wave';}
 if(r.key&&e._bossBudgetKey===r.key&&(e._bossBudgetSpent||0)>=Math.ceil(e.maxHp*r.limit)){r.factor=0;r.ended=true;r.hint='Opening ended — prepare the next counter';}
 // A phase threshold already blocks damage. Its cue must not invite another hit.
 if(r.hint&&r.floor>0&&e.hp<=Math.ceil(e.maxHp*r.floor)){r.factor=0;r.transition=true;r.hint=e.marksmanCrossing?'Changing nests — follow the outside paths':'Royal guards arriving — defeat them next';}
 if(r.hint&&e.untargetable){r.factor=0;r.transition=true;r.hint=e.marksmanCrossing?'Changing nests — follow the outside paths':'Repositioning — wait for the next opening';}

 return r;
}
function closeEnough(e,src){return src&&Math.abs((src.y||0)-(e.y||0))<95&&Math.hypot(src.x-e.x,src.z-e.z)<340;}
function focus(G,e,yaw){
 if(!e?.frostOfficer||!G?.p)return e;
 let best=e,score=Infinity;const p=G.p,angle=Number.isFinite(yaw)?yaw:p.yaw||0;
 for(const q of G.enemies||[]){if(!q.frostOfficer||!live(q))continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz),dot=d>1?(dx*Math.sin(angle)+dz*Math.cos(angle))/d:1;
  const value=d*.35+Math.acos(Math.max(-1,Math.min(1,dot)))*180;if(value<score){score=value;best=q;}
 }return best;
}
// This view reads the damage rule; it never starts, extends or resets an opening.
function view(G,e,src){
 const r=rule(G,e,src);if(!r.hint)return null;
 const open=r.factor>0;
 const nest=e.marksmanCrossing&&e.markState==='recover'&&!(e.markAttack>0)&&(closeEnough(e,src)||Number.isInteger(e.markNestSeq)&&e.markNestSeq===e.markTurns);
 const clock=e.bruteOrchard?e.bruteClock:e.marksmanCrossing?Math.max(e.markExposed||0,nest?e.markClock||0:0):e.fallenDuel?e.fallClock:e.frostOfficer?e.offClock:e.furnaceColossus?e.fcExposed:e.marbleGuardian?e.mcExposed:e.hydraChain?G.hydraArena?.clock:e.finalKing?e.akClock:0;
 return {state:open?'open':r.transition?'transition':r.ended?'ended':'guarded',label:open?'ATTACK NOW':r.transition?'PHASE CHANGING':r.ended?'OPENING ENDED':'GUARDED',hint:r.hint,seconds:open&&Number.isFinite(clock)?Math.max(0,clock):0};
}
function damage(G,e,src,dmg,kind='direct'){
 if(!Number.isFinite(dmg)||dmg<=0)return 0;
 if(e?.marksmanCrossing){const turn=e.markTurns||0;
  // One shared opportunity per actual shot/reload; switching between cover and nest cannot renew it.
  if(e.markExposed>0&&e.markWindowTurn==null)e.markWindowTurn=turn;
  if(kind==='direct'&&closeEnough(e,src)&&e.markState==='recover'&&!(e.markAttack>0)&&!(e.markExposed>0)&&e.markWindowTurn!==turn){e.markWindowSeq=(e.markWindowSeq||0)+1;e.markWindowTurn=turn;e.markNestSeq=turn;}
 }
 const r=rule(G,e,src,kind);
 if(!r.hint)return dmg;if(e.untargetable||r.factor<=0)return 0;
 let n=Math.max(1,Math.round(dmg*r.factor));n=Math.min(n,Math.max(0,e.hp-Math.ceil(e.maxHp*r.floor)));
 if(r.key){
  if(e._bossBudgetKey!==r.key){e._bossBudgetKey=r.key;e._bossBudgetSpent=0;e._bossWindowFloor=Math.max(0,e.hp-Math.ceil(e.maxHp*r.limit));e._bossClosedFloor=0;}
  n=Math.min(n,Math.max(0,Math.ceil(e.maxHp*r.limit)-(e._bossBudgetSpent||0)));e._bossBudgetSpent=(e._bossBudgetSpent||0)+n;
  if(e._bossBudgetSpent>=Math.ceil(e.maxHp*r.limit)){
   if(e.furnaceColossus){e.fcExposed=0;e._bossClosedFloor=e._bossWindowFloor;}
   if(e.marbleGuardian){e.mcExposed=0;e.mcClock=Math.min(e.mcClock||0,.9);}
   if(e.bruteOrchard){e.bruteState='recover';e.bruteClock=.6;e.staggerT=0;}
   if(e.fallenDuel){e.fallState='recover';e.fallClock=.6;e.fallAttack=0;}
   if(e.marksmanCrossing){e.markExposed=0;e.markClock=Math.min(e.markClock||0,.6);}
   if(e.frostOfficer){e.offClock=Math.min(e.offClock||0,.6);}
   if(e.hydraChain&&G.hydraArena)G.hydraArena.clock=Math.min(G.hydraArena.clock,.5);
   if(e.finalKing)e.akClock=Math.min(e.akClock||0,.6);
  }
 }
 if(e.frostOfficer==='shield'&&kind==='direct'&&n>0)e.offFlankedSeq=e.offSeq;
 if(e.marksmanCrossing&&kind==='direct'&&n>0&&(e.markExposed>0||src&&Math.abs((src.y||0)-(e.y||0))<95&&Math.hypot(src.x-e.x,src.z-e.z)<340)){e.markTacticDone=true;if(closeEnough(e,src))e.markNestSeq=e.markTurns;}
 return n;
}

// Phase cues describe the active attack, while the existing tactic line explains the arena.
function cue(G,e,keys={}){
 if(!live(e))return null;
 const jump=keys.jump||'Space',dodge=keys.dodge||'Right click',out=(text,safe=false)=>({text,safe});
 const r=rule(G,e,G.p);if(r.transition||r.ended)return out(r.hint);
 if(e.marksmanCrossing){if(e.markState==='aim')return out(e.markClock>.6?'Aiming — move toward stone cover':'Shot locked — stay behind cover');if(['relocate','glide'].includes(e.markState))return out('Changing nests — watch the approach for guards');if(e.markExposed>0&&rule(G,e,G.p).factor>0)return out('Bow exposed — attack now',true);return out('Reloading — advance toward her nest');}
 if(e.fallenDuel){if(e.fallState==='feint')return out('Feint — wait for the real sweep');if(e.fallState==='thrust')return out('Thrust — sidestep or put a pillar in its path');if(e.fallState==='sweep')return out('Sweep — '+dodge+' to move behind the blade');if(e.fallState==='stagger')return out('Blade caught — attack now',true);if(e.fallState==='recover')return out('Blade guarded — line up another pillar counter');}
 if(e.frostOfficer){const threats=(G.enemies||[]).filter(q=>q.frostOfficer&&live(q)&&['wind','strike'].includes(q.offState));const t=threats.find(q=>q.offState==='strike')||threats[0];if(t)return out(t.frostOfficer==='shield'?'Shield wave — '+jump+' to jump':t.frostOfficer==='spear'?'Spear rush — sidestep the lane':'Ice marks — move out of the circles');return out('Use the ramps to split the officers; flank the recovering shield');}
 if(e.furnaceColossus){if(e.fcExposed>0)return out('Cooled armor — attack the joints',true);if(['wind','strike'].includes(e.fcState))return out(e.fcKind==='sweep'?'Wide sweep — '+dodge+' behind the Colossus':e.fcKind==='vents'?'Vents erupting — leave the marked circles':'Ground slam — leave the marked circle');return out('Reach a cooling valve while it recovers');}
 if(e.marbleGuardian){if(e.mcExposed>0)return out('Armor seal broken — attack now',true);if(['wind','strike'].includes(e.mcState))return out(e.mcKind==='hammer'?'Heavy strike — stand behind a screen facing the boss':e.mcKind==='sweep'?'Low sweep — '+jump+' to jump':'Falling stone — leave the marked circle');return out('Turn a screen toward the boss');}
 if(e.hydraChain){const h=G.hydraArena;if(!h||h.freed)return null;if(h.state==='recover')return out(rule(G,e,G.p).factor>0?'Head resting — strike the pale joint':'Head withdrawing — prepare for its next attack',rule(G,e,G.p).factor>0);return out(h.kind==='blast'?'Water blast — get behind a stone block':h.kind==='sweep'?'Neck sweep — climb onto the high ledges':'Bite — leave the marked circle');}
 if(e.finalKing){if(!['fight1','fight2'].includes(e.akStage))return null;if(e.akState==='adds')return out('Royal guards — defeat them to reach the King');if(e.akState==='recover')return out(rule(G,e,G.p).factor>0?'Royal ward broken — attack now':'Royal ward intact — prepare a pillar block or wave jump',rule(G,e,G.p).factor>0);return out(e.akKind==='line'?'Royal beam — put a pillar between you and the King':e.akKind==='wave'?'Ground wave — '+jump+' to jump':e.akKind==='burst'?'Void burst — leave the marked circle':'Blade sweep — '+dodge+' behind the King');}
 return null;
}

function snapshot(e){const out={};for(const key of ['_bossBudgetKey','_bossBudgetSpent','_fcCool','akEnvSeq','akEnvPhase','offFlankedSeq','markNestSeq','markCoverSeq','markWindowSeq','markWindowTurn'])if(e[key]!=null)out[key]=e[key];return out;}
root.BFBossTactics={rule,damage,cue,snapshot,view,focus};if(typeof module!=='undefined')module.exports=root.BFBossTactics;
})(typeof window!=='undefined'?window:globalThis);
