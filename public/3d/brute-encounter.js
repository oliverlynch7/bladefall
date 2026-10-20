(function(root){
'use strict';
const fields=['bruteOrchard','bruteState','bruteStaggers','bruteClock','bruteTurns','bruteWaves','bruteWaveWarn','bruteWaveSide','windT','windMax','teleX','teleZ','lunge','slamW','staggerT','phase','yaw'];
const CHARGE_SPEED=620,CHARGE_TIME=1.05,LOCK_TIME=.45;
function impactAt(e,x,z,props){return props.find(p=>Math.abs(x-p.x)<p.w/2+e.r&&Math.abs(z-p.z)<p.d/2+e.r);}
// Preview the same swept body and first blocking prop as the real charge. Small
// steps match step()'s collision resolution (at most 10 units), including corners.
function chargePreview(e,props=[],walkable){
 const distance=CHARGE_SPEED*CHARGE_TIME,steps=Math.ceil(distance/5);
 for(let i=1;i<=steps;i++){
  const d=distance*i/steps,x=e.x+e.teleX*d,z=e.z+e.teleZ*d,hit=impactAt(e,x,z,props);
  if(hit)return {distance:d,width:e.r*2,hit:hit.id};
  if(walkable&&!walkable(x,z))return {distance:Math.max(0,d-distance/steps),width:e.r*2,hit:null,edge:true};
 }
 return {distance,width:e.r*2,hit:null};
}
function cue(e,{jump='Jump',dodge='Dodge'}={}){
 if(!e?.active||e.dead||e.hp<=0)return null;
 if(e.bruteState==='wind')return {text:e.windT<=LOCK_TIME?'Charge locked · '+dodge+' sideways':'Charge aiming · step aside',safe:false};
 if(e.bruteState==='charge')return {text:'Charging · stay clear',safe:false};
 if(e.bruteState==='slam')return {text:'Ground wave · '+jump+' to jump',safe:false};
 if(e.bruteState==='stagger')return {text:'Staggered · attack now',safe:true};
 if(e.bruteState==='recover')return {text:'Line up another charge into a cart or stone',safe:false};
 return null;
}
function retryAdvice(attack){
 if(attack==='a ground wave'||attack==='a sweeping blow')return 'Jump over the expanding ground ring. Move back in after it passes.';
 if(attack==='a crushing lunge')return 'Step sideways when the charge line locks. A cart or stone stops the Brute and leaves it open to attack.';
 return 'Clear the handlers when they arrive. Bait each charge into a cart or stone, then attack the staggered Brute.';
}
function enter(e,state,time){e.bruteState=state;e.bruteClock=time;e.windT=0;e.lunge=0;e.slamW=0;e.staggerT=0;}
function step(e,dt,target,env){
 if(e.dead||e.hp<=0)return;dt=Math.min(.05,Math.max(0,dt));
 if(!e.bruteState){enter(e,'hunt',1.4);e.bruteTurns=0;e.bruteWaves=0;}
 const dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;
 e.phase=e.hp/e.maxHp<.35?3:e.hp/e.maxHp<.7?2:1;
 if(e.bruteWaveWarn>0){e.bruteWaveWarn=Math.max(0,e.bruteWaveWarn-dt);if(e.bruteWaveWarn===0){e.bruteWaves++;env.handlers(e.bruteWaves);}}
 else if((e.bruteWaves===0&&e.hp/e.maxHp<=.7)||(e.bruteWaves===1&&e.hp/e.maxHp<=.35)){e.bruteWaveWarn=1.5;e.bruteWaveSide=e.bruteWaves===0?-1:1;env.tell('Legion handlers are coming!');}
 e.bruteClock=Math.max(0,e.bruteClock-dt);
 if(e.bruteState==='hunt'){
  if(d>115){const v=Math.min(d-115,(env.speed||90)*dt);e.x+=ux*v;e.z+=uz*v;}
  if(e.bruteClock===0&&d<760){e.bruteTurns++;if(e.bruteTurns%3===0&&d<(e.phase>=2?420:280)){enter(e,'slam',.95);e.slamW=.95;env.tell('Jump the ground wave!');}else{const wind=e.phase===3?.9:e.phase===2?1.02:1.15;enter(e,'wind',wind);e.windMax=wind;e.windT=wind;e.teleX=ux;e.teleZ=uz;env.tell('Bait the charge into a cart or stone!');}}
 }else if(e.bruteState==='wind'){
  e.windT=e.bruteClock;if(e.bruteClock>LOCK_TIME){e.teleX=ux;e.teleZ=uz;}e.yaw=Math.atan2(e.teleX,e.teleZ);
  if(e.bruteClock===0){enter(e,'charge',CHARGE_TIME);e.lunge=CHARGE_TIME;}
 }else if(e.bruteState==='charge'){
  e.yaw=Math.atan2(e.teleX,e.teleZ);e.lunge=e.bruteClock;const travel=CHARGE_SPEED*dt,n=Math.ceil(travel/10);
  for(let i=0;i<n;i++){const x=e.x+e.teleX*travel/n,z=e.z+e.teleZ*travel/n;const hit=impactAt(e,x,z,env.props);
   if(hit){e.bruteStaggers=(e.bruteStaggers||0)+1;enter(e,'stagger',3);e.staggerT=3;env.impact(hit);return;}
   if(env.walkable&&!env.walkable(x,z)){enter(e,'recover',1.4);return;}e.x=x;e.z=z;}
  if(e.bruteClock===0)enter(e,'recover',1.4);
 }else if(e.bruteState==='slam'){
  e.slamW=e.bruteClock;if(e.bruteClock===0){env.slam();enter(e,'recover',1.1);}
 }else if(e.bruteState==='stagger'){e.staggerT=e.bruteClock;if(e.bruteClock===0)enter(e,'hunt',1.15);}
 else if(e.bruteClock===0)enter(e,'hunt',e.phase>=2?.6:.85);
}
function snapshot(e){return Object.fromEntries(fields.map(k=>[k,e[k]??0]));}
root.BFBruteEncounter={step,snapshot,fields,chargePreview,cue,retryAdvice};if(typeof module!=='undefined')module.exports=root.BFBruteEncounter;
})(typeof window!=='undefined'?window:globalThis);
