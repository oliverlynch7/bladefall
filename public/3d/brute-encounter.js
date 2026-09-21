(function(root){
'use strict';
const fields=['bruteOrchard','bruteState','bruteClock','bruteTurns','bruteWaves','bruteWaveWarn','bruteWaveSide','windT','windMax','teleX','teleZ','lunge','slamW','staggerT','phase','yaw'];
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
  if(e.bruteClock===0&&d<760){e.bruteTurns++;if(e.bruteTurns%3===0&&d<260){enter(e,'slam',.95);e.slamW=.95;env.tell('Jump the ground wave!');}else{enter(e,'wind',1.15);e.windMax=1.15;e.windT=1.15;e.teleX=ux;e.teleZ=uz;env.tell('Bait the charge into a cart or stone!');}}
 }else if(e.bruteState==='wind'){
  e.windT=e.bruteClock;if(e.bruteClock>.45){e.teleX=ux;e.teleZ=uz;}e.yaw=Math.atan2(e.teleX,e.teleZ);
  if(e.bruteClock===0){enter(e,'charge',1.05);e.lunge=1.05;}
 }else if(e.bruteState==='charge'){
  e.yaw=Math.atan2(e.teleX,e.teleZ);e.lunge=e.bruteClock;const travel=620*dt,n=Math.ceil(travel/10);
  for(let i=0;i<n;i++){const x=e.x+e.teleX*travel/n,z=e.z+e.teleZ*travel/n;const hit=env.props.find(p=>Math.abs(x-p.x)<p.w/2+e.r&&Math.abs(z-p.z)<p.d/2+e.r);
   if(hit){enter(e,'stagger',3);e.staggerT=3;env.impact(hit);return;}e.x=x;e.z=z;}
  if(e.bruteClock===0)enter(e,'recover',1.15);
 }else if(e.bruteState==='slam'){
  e.slamW=e.bruteClock;if(e.bruteClock===0){env.slam();enter(e,'recover',1.1);}
 }else if(e.bruteState==='stagger'){e.staggerT=e.bruteClock;if(e.bruteClock===0)enter(e,'hunt',1.15);}
 else if(e.bruteClock===0)enter(e,'hunt',e.phase>=2?.7:1.05);
}
function snapshot(e){return Object.fromEntries(fields.map(k=>[k,e[k]??0]));}
root.BFBruteEncounter={step,snapshot,fields};if(typeof module!=='undefined')module.exports=root.BFBruteEncounter;
})(typeof window!=='undefined'?window:globalThis);
