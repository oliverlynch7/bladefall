/* Campaign release-hall duel. Host advances; peers share the locked attack geometry. */
(function(root){'use strict';
const pillars=[{x:-220,z:-230,w:90,d:90,h:240},{x:220,z:-230,w:90,d:90,h:240},{x:-220,z:220,w:90,d:90,h:240},{x:220,z:220,w:90,d:90,h:240}];
const fields=['fallenDuel','fallState','fallClock','fallTurn','fallSeq','fallKind','fallX','fallZ','fallDX','fallDZ','fallRange','fallTravel','fallAttack','phase','yaw','h','r'];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function blocked(x,z,tx,tz,pad=0){const n=Math.ceil(Math.hypot(tx-x,tz-z)/8);for(let i=1;i<=n;i++){const f=i/n;for(const p of pillars)if(Math.abs(x+(tx-x)*f-p.x)<p.w/2+pad&&Math.abs(z+(tz-z)*f-p.z)<p.d/2+pad)return true;}return false;}
function enter(e,s,t){e.fallState=s;e.fallClock=t;}
function aim(e,p){const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1;e.fallDX=dx/d;e.fallDZ=dz/d;e.yaw=Math.atan2(e.fallDX,e.fallDZ);}
function step(e,dt,p,a){if(e.dead||e.hp<=0)return;dt=clamp(dt,0,.05);if(!e.fallState){enter(e,'hunt',1.5);e.fallTurn=0;e.fallSeq=0;}e.fallClock=Math.max(0,e.fallClock-dt);e.fallAttack=Math.max(0,(e.fallAttack||0)-dt);e.phase=e.hp/e.maxHp<.5?2:1;
 if(e.fallState==='hunt'){
  aim(e,p);const d=Math.hypot(p.x-e.x,p.z-e.z),speed=a.speed||150;if(d>135){let dx=e.fallDX,dz=e.fallDZ;if(blocked(e.x,e.z,e.x+dx*90,e.z+dz*90,e.r+8)){const side=e.x<=0?-1:1;dx=side*Math.abs(e.fallDZ);dz=-side*e.fallDX;}
   const x=clamp(e.x+dx*speed*dt,-490,490),z=clamp(e.z+dz*speed*dt,-650,650);if(!blocked(e.x,e.z,x,z,e.r)){e.x=x;e.z=z;}}
  if(!e.fallClock&&d<700){e.fallTurn++;e.fallKind=e.fallTurn%3===0?'sweep':'thrust';enter(e,e.fallKind==='sweep'?'feint':'thrust',e.fallKind==='sweep'?.55:1.05);a.cue?.(e.fallKind==='sweep'?'feint':'thrust');}return;
 }
 if(e.fallState==='feint'){if(!e.fallClock){aim(e,p);enter(e,'sweep',.85);a.cue?.('sweep');}return;}
 if(e.fallState==='thrust'||e.fallState==='sweep'){
  if(e.fallState==='thrust'&&e.fallClock>.65)aim(e,p);
  if(!e.fallClock){e.fallX=e.x;e.fallZ=e.z;e.fallRange=e.fallKind==='sweep'?190:440;
   if(e.fallKind==='thrust'){let length=0;for(let d=8;d<=440;d+=8){const x=e.x+e.fallDX*d,z=e.z+e.fallDZ*d;if(Math.abs(x)>490||Math.abs(z)>650||blocked(e.x,e.z,x,z,e.r)){break;}length=d;}e.fallRange=length;}
   e.fallTravel=0;e.fallSeq++;e.fallAttack=.32;enter(e,'strike',.32);a.cue?.('strike');}return;
 }
 if(e.fallState==='strike'){if(e.fallKind==='thrust'){e.fallTravel=e.fallRange*(1-e.fallClock/.32);e.x=e.fallX+e.fallDX*e.fallTravel;e.z=e.fallZ+e.fallDZ*e.fallTravel;}if(!e.fallClock){const stopped=e.fallKind==='thrust'&&e.fallRange<400;enter(e,stopped?'stagger':'recover',stopped?2.2:e.fallKind==='sweep'?1.65:1.25);if(stopped)a.cue?.('stagger');}return;}
 if(!e.fallClock)enter(e,'hunt',e.phase===2?.8:1.2);
}
function inAttack(e,p){if(e.dead||e.hp<=0||!(e.fallAttack>0)||p.hp<=0||p.downed||Math.abs((p.y||0)-(e.y||0))>75)return false;
 const dx=p.x-e.fallX,dz=p.z-e.fallZ,d=Math.hypot(dx,dz),forward=dx*e.fallDX+dz*e.fallDZ,side=Math.abs(dx*e.fallDZ-dz*e.fallDX),r=p.r||16;
 const inside=e.fallKind==='sweep'?d<190+r&&forward>-.18*d:forward>=-r&&forward<=(e.fallTravel||0)+r&&side<25+r;
 return inside&&!blocked(e.fallX,e.fallZ,p.x,p.z);
}
function snapshot(e){return Object.fromEntries(fields.map(k=>[k,e[k]??0]));}
function build(a){const {G,seg,col,spawn}=a;G.fallenArena={pillars};G.haz=null;G.spireRY=null;G.vertical=true;G._scapeTable='FALLEN_RELEASE_HALL';
 seg(0,0,1100,1500);seg(-610,0,220,480);seg(610,0,220,480);
 for(const p of pillars)col(p.x,p.z,p.w,p.d,p.h);
 for(const [x,z,w,d,h]of [[-570,-480,35,580,250],[570,-480,35,580,250],[-570,480,35,580,250],[570,480,35,580,250],[0,-780,1170,35,260],[0,780,1170,35,260],[-735,0,30,520,230],[735,0,30,520,230]])col(x,z,w,d,h);
 G.rooms=[{name:'The Release Hall',x:0,z:0,y:0,w:1100,d:1500,monsters:[],encounter:false,cleared:true}];G.bounds={minX:-760,maxX:760,minZ:-820,maxZ:820};G.startPos={x:0,z:650};G.lastSafe={x:0,z:650,y:0};G.portalPos={x:0,z:-650,y:0};G.goalPos={...G.portalPos};G.progressEnd=-750;G.campaignLayout={revision:2007,zone:'keep',area:-1};
 const e=spawn('warden',0,-440,null);Object.assign(e,{fallenDuel:true,h:58,r:20,dropT:0,home:{x:0,z:0,hw:500,hd:680}});G.boss=e;Object.assign(G.p,{x:0,z:650,y:0,vy:0,vx:0,vz:0,onGround:true});G.camYaw=Math.PI;G.camPitch=.12;
}
function draw({G,bx},t){if(!G.fallenArena)return;const e=G.boss;if(!e||e.dead)return;
 const wind=['thrust','sweep','feint'].includes(e.fallState),hit=e.fallAttack>0;if(!wind&&!hit)return;const x=hit?e.fallX:e.x,z=hit?e.fallZ:e.z,dx=e.fallDX||0,dz=e.fallDZ||1;
 const color=hit?'#fff0ce':e.fallState==='feint'?'#acbad0':'#efb06d';
 if(e.fallKind==='sweep'){const angle=Math.atan2(dx,dz);for(let i=0;i<=28;i++){const a=angle-1.75+i*3.5/28;bx(x+Math.sin(a)*190,4,z+Math.cos(a)*190,9,4,9,color,color,.55);}if(e.fallState==='feint')for(const s of [-1,1])bx(e.x+s*23,e.y+e.h+16,e.z,5,12,5,color);}
 else for(let d=25;d<(hit?e.fallRange:440);d+=22){const tx=x+dx*d,tz=z+dz*d;if(blocked(x,z,tx,tz))break;for(const s of [-1,1])bx(tx+dz*s*25,4,tz-dx*s*25,6,4,9,color,color,.55);}
}
root.BFFallen={pillars,fields,blocked,step,inAttack,snapshot,build,draw};if(typeof module!=='undefined')module.exports=root.BFFallen;
})(typeof window!=='undefined'?window:globalThis);
