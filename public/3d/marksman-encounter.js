/* Campaign Hollow Marksman: reachable nests, locked aim and one protected relocation. */
(function(root){'use strict';
const nests=[{x:-700,z:-450,y:140},{x:680,z:-1550,y:220}];
const paths={west:[[0,650,0],[-700,450,0],[-1050,0,0],[-1050,-450,140],[-700,-450,140]],east:[[0,650,0],[820,400,0],[1180,-200,0],[1180,-1050,0],[1080,-1550,220],[680,-1550,220]],lower:[[-1050,150,0],[-1330,150,0],[-1330,-1050,0],[-350,-1200,0],[150,-1100,0],[1180,-850,0]],rear:[[1180,-850,0],[1450,-950,0],[1450,-1800,0],[900,-1920,0],[680,-1670,0]],exit:[[680,-1550,220],[300,-1660,220],[0,-1900,220]]};
const fields=['marksmanCrossing','markState','markClock','markMoved','markFromX','markFromZ','markFromY','markX','markZ','markY','markH','markTurns','markAttack','phase','y','yaw','untargetable'];
function enter(e,s,t){e.markState=s;e.markClock=t;}
function step(e,dt,p,a){if(e.dead||e.hp<=0)return;dt=Math.min(.05,Math.max(0,dt));if(!e.markState){enter(e,'recover',1.8);e.markTurns=0;e.markMoved=false;}e.markClock=Math.max(0,e.markClock-dt);e.markAttack=Math.max(0,(e.markAttack||0)-dt);
 if(e.markState==='glide'){const t=1-e.markClock/2.4,n=nests[1];e.x=e.markFromX+(n.x-e.markFromX)*t;e.z=e.markFromZ+(n.z-e.markFromZ)*t;e.y=e.markFromY+(n.y-e.markFromY)*t+Math.sin(t*Math.PI)*180;if(!e.markClock){e.untargetable=false;enter(e,'recover',3.2);}return;}
 const n=nests[e.markMoved?1:0];e.x=n.x;e.z=n.z;e.y=n.y;e.yaw=Math.atan2(p.x-e.x,p.z-e.z);
 if(e.markState==='relocate'){if(!e.markClock){e.markFromX=e.x;e.markFromZ=e.z;e.markFromY=e.y;e.markMoved=true;e.phase=2;e.untargetable=true;a.reinforce();enter(e,'glide',2.4);}return;}
 if(e.markState==='aim'){if(e.markClock>.6){e.markX=p.x;e.markZ=p.z;e.markY=p.y;e.markH=p.h||54;}e.yaw=Math.atan2(e.markX-e.x,e.markZ-e.z);if(!e.markClock){e.markAttack=.28;a.fire({x:e.markX,z:e.markZ,y:e.markY,h:e.markH});enter(e,'recover',e.markMoved?1.8:2.2);}return;}
 if(!e.markMoved&&e.hp/e.maxHp<=.55){enter(e,'relocate',1.5);a.tell('She is moving to the rear nest. Guards are coming up the east path!');return;}
 if(!e.markClock){e.markTurns++;e.markX=p.x;e.markZ=p.z;e.markY=p.y;e.markH=p.h||54;enter(e,'aim',1.25);a.cue();}
}
function snapshot(e){return Object.fromEntries(fields.map(k=>[k,e[k]??0]));}
function build(a){const {G,seg,plat,col,spawn}=a;G._scapeTable='MARKSMAN_CROSSING';G.vertical=true;G.haz=null;G.spireRY=null;G.marksmanArena={walks:{},cover:[],supports:[],seen:false};
 const deck=(x,z,y,w,d)=>{if(y)plat(x,z,y,w,d,{checkpoint:true,bridge:true,slab:16});else seg(x,z,w,d);};
 for(const [x,z,y,w,d]of [[0,650,0,1100,500],[-700,-450,140,600,480],[680,-1550,220,650,520],[0,-1900,220,440,380],[-350,-1200,0,650,460],[680,-1670,0,300,450]])deck(x,z,y,w,d);
 for(const [id,p]of Object.entries(paths)){const out=[];for(let j=1;j<p.length;j++){const u=p[j-1],v=p[j],n=Math.ceil(Math.max(Math.hypot(v[0]-u[0],v[1]-u[1])/90,Math.abs(v[2]-u[2])/15));for(let k=0;k<=n;k++){const q=u.map((x,i)=>x+(v[i]-x)*k/n);deck(q[0],q[1],q[2],id==='rear'?210:280,id==='rear'?210:280);out.push(q);}}G.marksmanArena.walks[id]=out;}
 for(const n of nests)for(const dx of [-250,250])for(const dz of [-180,180]){const o=col(n.x+dx,n.z+dz,20,20,n.y);o.y0=-300;o.autoCol=true;G.marksmanArena.supports.push(o);}
 // Optional broken-span jumps; the outside paths always provide a continuous alternative.
 for(const [x,z,y]of [[-490,220,40],[-500,40,70],[-530,-150,110],[250,-1200,65],[430,-1330,130]])deck(x,z,y,110,110);
 for(const [x,z,y,w,d,h]of [[-780,210,0,110,70,120],[800,200,0,110,70,125],[-1490,-760,0,85,110,125],[-350,-1080,0,140,70,135],[1110,-750,0,85,110,140],[-820,-330,140,100,65,90],[870,-1410,220,100,65,95]]){const o=col(x,z,w,d,y+h);o.y0=y;G.marksmanArena.cover.push(o);}
 for(const [x,z,h]of [[-1630,-400,470],[1650,-600,600],[-650,-1600,470],[150,-550,380]])plat(x,z,h,180,240,{canyonCliff:true});
 G.bounds={minX:-1700,maxX:1720,minZ:-2200,maxZ:1000};G.progressEnd=-2100;G.startPos={x:0,z:780};G.lastSafe={x:0,z:780,y:0};G.portalPos={x:0,z:-2000,y:220};G.goalPos={...G.portalPos};G.rooms=[{name:'The Last Crossing',x:0,z:-550,w:2700,d:3100,y:0,cleared:true,encounter:false,monsters:[]}];G.campaignLayout={revision:2004,zone:'hollow',area:-1};
 const e=spawn('archer',nests[0].x,nests[0].z,null);Object.assign(e,{marksmanCrossing:true,y:140,sx:nests[0].x,sz:nests[0].z,dropT:0,home:{x:0,z:-500,hw:1450,hd:1600}});e.shot={count:1,spread:0,speed:650,size:6,color:'#edc78c',shape:'arrow',glow:1};G.boss=e;Object.assign(G.p,{x:0,z:780,y:0,vy:0,vx:0,vz:0,onGround:true});G.camYaw=Math.PI;G.camPitch=.12;
}
function draw(a,t){const {G,bx}=a;if(!G.marksmanArena)return;const e=G.boss;
 for(const q of G.marksmanArena.supports)bx(q.x,(q.h-300)/2,q.z,20,q.h+300,20,'#69533b');
 for(const n of nests){for(const x of [-270,270]){bx(n.x+x,n.y+60,n.z-170,18,120,18,'#6c5138');bx(n.x+x,n.y+120,n.z-170,28,10,28,'#bd9965');}for(const z of [-120,-65,0,65,120])bx(n.x,n.y+2,n.z+z,460,3,5,'#8d704d');}
 // The intact rear stair is overhead here; the shard is tucked under its back edge.
 for(const x of [550,810])bx(x,102,-1660,18,204,18,'#765b3e');
 for(const q of G.marksmanArena.cover){bx(q.x,q.h+3,q.z,q.w+8,6,q.d+8,'#d7b47d');for(const dx of [-20,20])bx(q.x+dx,q.h+7,q.z,7,3,24,'#9c815a');}
 if(e&&!e.dead&&e.markState==='aim'){const oy=e.y+e.h*.62,ty=e.markY+(e.markH||54)*.5,dx=e.markX-e.x,dz=e.markZ-e.z,n=Math.ceil(Math.hypot(dx,dz)/24),locked=e.markClock<=.6;for(let k=1;k<=n;k++){const f=k/n;bx(e.x+dx*f,oy+(ty-oy)*f,e.z+dz*f,locked?5:3,locked?5:3,12,locked?'#ffac76':'#e7cf93',locked?'#a74622':null,.85);}bx(e.markX,e.markY+3,e.markZ,58,3,5,'#ffc28b');bx(e.markX,e.markY+3,e.markZ,5,3,58,'#ffc28b');}
 if(e&&!e.dead&&e.markState==='relocate')for(const x of [1110,1210])bx(x,3,-800,70,4,100,'#e0b574');
}
root.BFMarksman={build,step,snapshot,fields,paths,nests,draw};if(typeof module!=='undefined')module.exports=root.BFMarksman;
})(typeof window!=='undefined'?window:globalThis);
