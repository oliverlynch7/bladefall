/* Ground-accessible cooling valves; shared locked warnings and hit geometry. */
(function(root){'use strict';
const paths={west:[[-400,720,0],[-790,400,120],[-790,-250,120],[-700,-850,220],[0,-1030,220]],east:[[400,720,0],[790,400,120],[790,-250,120],[700,-850,220],[0,-1030,220]],stations:[[-350,100,0],[0,300,0],[350,100,0]],rear:[[-350,100,0],[-400,-650,0],[0,-760,0],[400,-650,0],[350,100,0]]};
const fields=['furnaceColossus','fcState','fcClock','fcKind','fcSeq','fcX','fcZ','fcY','fcDX','fcDZ','fcExposed','fcValveCd','fcVent','fcRepair','fcBeat','yaw','y','h','r','boss','kind','label','slamW','atkT'];
const alive=e=>e&&!e.dead&&e.hp>0;
function build({G,seg,plat,spawn}){
 G.colossusArena={relieved:!!G.storyState?.flags['gf.pressure']};G.haz=null;G.vertical=true;G._scapeTable='FURNACE_COLOSSUS';seg(0,-50,2260,2650);
 for(const p of Object.values(paths))for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/80,Math.abs(b[2]-a[2])/12));for(let i=0;i<=n;i++)plat(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,a[2]+(b[2]-a[2])*i/n,250,250,{slab:24,checkpoint:true});}
 for(const sign of [-1,1]){plat(sign*790,-280,120,420,620,{slab:24,checkpoint:true});for(let j=1;j<=3;j++)plat(sign*(340+j*110),-150,30*j,85,100,{slab:18,checkpoint:true});}
 plat(0,-1030,220,1100,320,{slab:30,checkpoint:true});
 for(const [x,z,w,d,h]of [[-1190,-80,80,2820,880],[1190,-80,80,2820,950],[0,-1460,2460,90,1000]])G.walls.push({x,z,y0:0,w,d,h,caveWall:true,c:'#3f3530'});
 for(const side of [-1,1])for(const z of [900,0,-900])G.deco.push({kind:'forgeFrame',x:side*980,z,y0:0,w:190,d:80,h:680,c:'#564639'});
 G.deco.push({kind:'forgeFrame',x:0,z:-1200,y0:220,w:1400,d:85,h:920,c:'#675442'});
 // Recessed hot machinery is scenery, not an unannounced damage floor.
 for(const x of [-1090,1090])G.deco.push({kind:'forgePipe',x,z:-380,y0:0,w:130,d:1800,h:320,c:'#624834'});
 G.rooms=[{name:'The Colossus Furnace',x:0,z:-80,y:0,w:2260,d:2650,monsters:[],cleared:true,encounter:false}];
 G.storyNpcs=[];G.storyObjects=[[-350,80],[350,80],[0,-790]].map(([x,z],i)=>({key:'fc.valve.'+i,label:'Turn the cooling valve',blockedLabel:'Cooling tank refilling',blockedText:'The cooling tank is refilling. Try another attack window shortly.',x,z,y:0,range:112}));
 G.bounds={minX:-1120,maxX:1120,minZ:-1390,maxZ:1260};G.startPos={x:0,z:990,y:0};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-1030,y:220};G.goalPos={...G.portalPos};G.progressEnd=-1310;
 const e=spawn('colossus',0,-330,null);Object.assign(e,{furnaceColossus:true,boss:true,kind:'boss',h:360,r:135,y:0,sx:0,sz:-330,active:true,dropT:0,immobile:true,role:null,spec:null,home:null,label:'Ember Colossus',fcState:'recover',fcClock:2,fcSeq:0,fcExposed:0,fcValveCd:0,fcRepair:false,fcBeat:0,fcVent:!G.colossusArena.relieved});e._fcCool=G.storyState?.items['fc.cool']||0;G.boss=e;
 Object.assign(G.p,{...G.startPos,vy:0,vx:0,vz:0,onGround:true});G.camYaw=Math.PI;G.camPitch=.15;
}
function available(G){return alive(G.boss)&&!(G.boss.fcValveCd>0);}
function cool(e,count,cue){if(!alive(e)||!count||count===(e._fcCool||0))return;e._fcCool=count;e.fcExposed=13;e.fcValveCd=18;e.fcState='recover';e.fcClock=2;e.slamW=0;cue?.('cool');}
function step(e,dt,p,a){if(!alive(e))return;dt=Math.min(.05,Math.max(0,dt));e.fcClock=Math.max(0,e.fcClock-dt);e.fcExposed=Math.max(0,e.fcExposed-dt);e.fcValveCd=Math.max(0,e.fcValveCd-dt);e.atkT=Math.max(0,(e.atkT||0)-dt);
 if(!e.fcRepair&&e.hp<e.maxHp*.55){e.fcRepair=true;a.repair?.();}
 // One limited crew can repair at most eight percent of maximum health in total.
 if(e.fcRepair&&(e._fcHealed||0)<e.maxHp*.08&&a.enemies.some(q=>q.furnaceRepair&&alive(q))){const d=Math.min(e.maxHp*.003*dt,e.maxHp*.08-(e._fcHealed||0));e.hp=Math.min(e.maxHp,e.hp+d);e._fcHealed=(e._fcHealed||0)+d;}
 if(e.fcClock)return;
 if(e.fcState==='recover'){
  e.fcBeat++;e.fcKind=e.fcBeat%3===0?'sweep':e.fcBeat%3===1?'slam':'vents';e.fcState='wind';e.fcClock=e.fcKind==='sweep'?1.8:1.5;e.fcX=p.x;e.fcZ=p.z;e.fcY=p.y;const d=Math.hypot(p.x-e.x,p.z-e.z)||1;e.fcDX=(p.x-e.x)/d;e.fcDZ=(p.z-e.z)/d;e.yaw=Math.atan2(e.fcDX,e.fcDZ);e.slamW=e.fcClock;a.cue?.('wind');return;
 }
 if(e.fcState==='wind'){e.fcState='strike';e.fcClock=.45;e.fcSeq++;e.slamW=0;e.atkT=.45;a.cue?.('strike');return;}
 e.fcState='recover';e.fcClock=e.fcExposed>0?2.4:1.8;
}
function inAttack(e,p){if(!alive(e)||e.fcState!=='strike'||p.hp<=0||p.downed)return false;const r=p.r||16;
 if(e.fcKind==='slam')return Math.abs(p.y-e.fcY)<80&&Math.hypot(p.x-e.fcX,p.z-e.fcZ)<145+r;
 if(e.fcKind==='vents')return Math.abs(p.y-e.fcY)<80&&(Math.hypot(p.x-e.fcX,p.z-e.fcZ)<110+r||(e.fcVent&&Math.hypot(p.x-e.fcX-280,p.z-e.fcZ)<110+r));
 const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);return p.y<70&&d<760+r&&(dx*e.fcDX+dz*e.fcDZ)>Math.cos(1.6)*d;
}
function shards(G){return G.boss?.dead?[{id:'ED-05',x:-990,z:-1350,y:0}]:[];}
function draw({G,bx,ring},t){const e=G.boss;if(!e?.furnaceColossus)return;
 for(const o of G.storyObjects||[]){const ready=available(G);bx(o.x,30,o.z,60,60,55,'#555d5b');for(let j=0;j<8;j++){const a=j*Math.PI/4;bx(o.x+Math.cos(a)*29,70+Math.sin(a)*29,o.z,12,12,8,ready?'#8bdbe2':'#9b7957');}bx(o.x,70,o.z,50,6,7,'#bbd5cf');if(e.fcExposed>0){const d=Math.hypot(e.x-o.x,e.z-o.z);for(let j=0;j<8;j++){const u=j/8;bx(o.x+(e.x-o.x)*u,35+u*60,o.z+(e.z-o.z)*u,14,9,14,'#91c9cd','#b8e8e8',.55);}}}
 // Pale joint bands communicate the actual damage window on the same model.
 if(e.fcExposed>0){for(const dx of [-65,65])ring(e.x+dx,38,e.z,36,'#b6f3ed',.9);ring(e.x,140,e.z,80,'#b6f3ed',.8);}
 if(alive(e)&&['wind','strike'].includes(e.fcState)){const hit=e.fcState==='strike',c=hit?'#ffe4a7':'#efb05e';if(e.fcKind==='sweep')ring(e.x,5,e.z,760,c,.9,1.6,e.fcDX,e.fcDZ);else for(const dx of e.fcKind==='vents'&&e.fcVent?[0,280]:[0]){const radius=e.fcKind==='slam'?145:110;ring(e.fcX+dx,e.fcY+5,e.fcZ,radius,c,.9);if(hit)for(let j=0;j<8;j++){const a=j*Math.PI/4;bx(e.fcX+dx+Math.cos(a)*radius*.55,e.fcY+60,e.fcZ+Math.sin(a)*radius*.55,16,120,16,'#ffb665','#ff8133',.85);}}}
 // Victory cools the concealed pipe pocket instead of placing a shard on the main exit.
 bx(-990,52,-1270,115,100,70,e.dead?'#64868b':'#b67840');if(!e.dead)bx(-990,112,-1270,85,10,70,'#ec9b43','#ec9b43',.5);
}
const api={paths,fields,build,available,cool,step,inAttack,shards,draw,snapshot:e=>Object.fromEntries(fields.map(k=>[k,e[k]??0]))};root.BFFurnaceColossus=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
