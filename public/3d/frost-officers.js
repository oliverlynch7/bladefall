/* One shared attack slot; locked geometry is also the visible warning and hit test. */
(function(root){'use strict';
const paths={west:[[-600,520,0],[-600,0,100],[-600,-500,100],[-320,-740,160],[0,-740,160]],east:[[600,520,0],[600,-80,180],[600,-520,180],[320,-740,160],[0,-740,160]],south:[[-600,520,0],[0,520,0],[600,520,0]],center:[[0,520,0],[0,-300,0]]};
const fields=['frostOfficer','offState','offClock','offSeq','offX','offZ','offY','offDX','offDZ','offRange','offTravel','offTwin','offAttack','offTurn','yaw','y','h','r','boss','kind','label'];
const alive=e=>!e.dead&&e.hp>0,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),busy=e=>alive(e)&&['wind','strike'].includes(e.offState);
function floor(x,z,arena){let y=0;for(const p of arena.surfaces)if(Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2)y=Math.max(y,p.y);return y;}
function nav(arena,e,p){const nodes=arena.nodes,nearest=q=>nodes.reduce((best,n,i)=>Math.hypot(q.x-n[0],q.z-n[1])+Math.abs(q.y-n[2])*6<best.d?{i,d:Math.hypot(q.x-n[0],q.z-n[1])+Math.abs(q.y-n[2])*6}:best,{i:0,d:Infinity}).i;
 const start=nearest(e),end=nearest(p),dist=nodes.map(()=>Infinity),prev=[],used=new Set();dist[start]=0;for(let j=0;j<nodes.length;j++){let u=-1;for(let i=0;i<nodes.length;i++)if(!used.has(i)&&(u<0||dist[i]<dist[u]))u=i;if(u===end||u<0)break;used.add(u);for(const v of arena.edges[u]){const d=dist[u]+Math.hypot(nodes[u][0]-nodes[v][0],nodes[u][1]-nodes[v][1]);if(d<dist[v]){dist[v]=d;prev[v]=u;}}}
 if(!e._offRoute||e._offEnd!==end){const route=[end];let v=end;while(prev[v]!=null){v=prev[v];route.unshift(v);}e._offRoute=route;e._offEnd=end;}
 while(e._offRoute.length){const n=nodes[e._offRoute[0]];if(Math.hypot(e.x-n[0],e.z-n[1])<40&&Math.abs(e.y-floor(n[0],n[1],arena))<45)e._offRoute.shift();else return n;}return [p.x,p.z,p.y];
}
function move(e,p,arena,dt,speed){let q=[p.x,p.z,p.y];if(Math.abs(e.y-p.y)>28||e._offRoute?.length)q=nav(arena,e,p);let dx=q[0]-e.x,dz=q[1]-e.z,d=Math.hypot(dx,dz)||1;const length=Math.min(d,speed*dt);let x=clamp(e.x+dx/d*length,-800,800),z=clamp(e.z+dz/d*length,-810,760),y=floor(x,z,arena);
 if(y-e.y>50){q=nav(arena,e,p);dx=q[0]-e.x;dz=q[1]-e.z;d=Math.hypot(dx,dz)||1;x=e.x+dx/d*length;z=e.z+dz/d*length;y=floor(x,z,arena);}
 if(y-e.y<=50){e.x=x;e.z=z;e.y=y;e.yaw=Math.atan2(dx,dz);} }
function step(e,dt,p,a){if(!alive(e))return;dt=clamp(dt,0,.05);const group=a.enemies.filter(q=>q.frostOfficer&&alive(q)),shield=group.some(q=>q.frostOfficer==='shield'),caster=group.some(q=>q.frostOfficer==='caster');
 if(!e.offState){e.offState='hunt';e.offClock={caster:2,shield:3.4,spear:4.6}[e.frostOfficer];e.offSeq=0;}e.offClock=Math.max(0,e.offClock-dt);e.offAttack=Math.max(0,(e.offAttack||0)-dt);
 if(e.offState==='hunt'){
  const distance=Math.hypot(p.x-e.x,p.z-e.z),reach=e.frostOfficer==='caster'?450:e.frostOfficer==='shield'?230:480;
  if(distance>(e.frostOfficer==='caster'?300:140)||Math.abs(e.y-p.y)>45){let target=p;if(e.frostOfficer==='shield'&&caster){const c=group.find(q=>q.frostOfficer==='caster');if(distance>500&&Math.abs(c.y-p.y)<20&&Math.abs(e.y-p.y)<20)target={x:(c.x+p.x)/2,z:(c.z+p.z)/2,y:c.y};}move(e,target,a.arena,dt,a.speed*(e.frostOfficer==='spear'?(shield?1.4:1.8):e.frostOfficer==='shield'?(caster?.85:1.25):.8));}
  if(e.offClock||distance>reach||a.enemies.some(q=>q!==e&&busy(q))||(e.frostOfficer!=='caster'&&Math.abs(e.y-p.y)>40))return;
  e.offTurn=(e.offTurn||0)+1;e.offState='wind';e.offClock=e.frostOfficer==='caster'?1.35:e.frostOfficer==='shield'?1.15:1.05;e.offX=e.x;e.offZ=e.z;e.offY=e.y;const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1;e.offDX=dx/d;e.offDZ=dz/d;e.yaw=Math.atan2(e.offDX,e.offDZ);e.offTwin=e.frostOfficer==='caster'&&!shield;
  if(e.frostOfficer==='caster'){e.offX=p.x;e.offZ=p.z;e.offY=floor(p.x,p.z,a.arena);e.offRange=115;}
  else if(e.frostOfficer==='spear'){e.offRange=0;for(let r=8;r<=420;r+=8){const x=e.x+e.offDX*r,z=e.z+e.offDZ*r;if(Math.abs(x)>800||z< -810||z>760||Math.abs(floor(x,z,a.arena)-e.y)>28)break;e.offRange=r;}}
  else e.offRange=330;a.cue?.('wind',e);return;
 }
 if(e.offState==='wind'){e.yaw=Math.atan2(e.offDX,e.offDZ);if(!e.offClock){e.offSeq++;e.offTravel=0;e.offState='strike';e.offClock=e.frostOfficer==='shield'?.9:e.frostOfficer==='caster'?.35:.4;e.offAttack=e.offClock;a.cue?.('strike',e);}return;}
 if(e.offState==='strike'){if(e.frostOfficer==='spear'){e.offTravel=e.offRange*(1-e.offClock/.4);e.x=e.offX+e.offDX*e.offTravel;e.z=e.offZ+e.offDZ*e.offTravel;}if(!e.offClock){e.offState='recover';e.offClock=e.frostOfficer==='spear'?1.7:2.0;}return;}
 if(!e.offClock){e.offState='hunt';e.offClock=group.length===1?.65:1.1;}
}
function inAttack(e,p){if(!alive(e)||e.offState!=='strike'||!(e.offAttack>0)||p.hp<=0||p.downed)return false;const dx=p.x-e.offX,dz=p.z-e.offZ,r=p.r||16,d=Math.hypot(dx,dz),forward=dx*e.offDX+dz*e.offDZ,side=Math.abs(dx*e.offDZ-dz*e.offDX),dy=Math.abs(p.y-e.offY);
 if(e.frostOfficer==='caster')return dy<75&&(d<115+r||(e.offTwin&&Math.hypot(dx-240,dz)<115+r));
 if(e.frostOfficer==='shield')return dy<25&&Math.abs(d-(35+295*(1-e.offClock/.9)))<23+r&&forward>Math.cos(1.7)*d;
 return dy<65&&forward>=-r&&forward<=e.offTravel+r&&side<24+r;
}
function build({G,seg,plat,col,spawn}){const arena=G.frostOfficers={surfaces:[],nodes:[],edges:[]};G.haz=null;G.vertical=true;G._scapeTable='FROST_OFFICERS';seg(0,0,1760,1800);
 const surface=(x,z,y,w,d)=>{arena.surfaces.push({x,z,y,w,d});plat(x,z,y,w,d,{slab:24,checkpoint:true});};
 for(const p of Object.values(paths)){let prev=null;for(const q of p){let i=arena.nodes.findIndex(n=>n.every((v,k)=>v===q[k]));if(i<0){i=arena.nodes.push(q)-1;arena.edges[i]=[];}if(prev!=null){arena.edges[i].push(prev);arena.edges[prev].push(i);}prev=i;}
  for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/70,Math.abs(b[2]-a[2])/12));for(let i=0;i<=n;i++)surface(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,a[2]+(b[2]-a[2])*i/n,260,260);}}
 surface(-600,-270,100,410,570);surface(600,-350,180,410,520);surface(0,-740,160,650,260);
 // Optional narrow jumping shortcuts; the full floor below catches missed jumps.
 for(const side of [-1,1])for(let i=1;i<=4;i++)surface(side*(90+i*110),-270,side<0?i*20:i*35,85,95);
 for(const [x,z,w,d,h]of [[-915,0,60,1860,600],[915,0,60,1860,680],[0,-945,1890,60,720],[0,945,1890,60,470]])G.walls.push({x,z,y0:0,w,d,h,caveWall:true});
 for(const side of [-1,1])for(const z of [-760,-330,170,690])G.deco.push({theme:'frost',x:side*850,z,y0:0,w:70,d:75,h:180+(z+760)/10,c:'#86b9cb'});
 for(const x of [-760,760])G.deco.push({kind:'officerBanner',x,z:-750,y0:180,w:110,d:25,h:240,c:'#314653'});
 G.deco.push({kind:'caveroof',x:0,z:-800,y0:790,w:1760,d:300,h:80,c:'#86b9cb'});
 G.rooms=[{name:'The Officers’ Cavern',x:0,z:0,y:0,w:1760,d:1800,monsters:[],encounter:false,cleared:true}];G.bounds={minX:-870,maxX:870,minZ:-900,maxZ:890};G.startPos={x:0,z:720,y:0};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-740,y:160};G.goalPos={...G.portalPos};G.progressEnd=-880;G.campaignLayout={revision:2010,zone:'frost',area:-1};
 const c=spawn('sorcerer',600,-420,null),base=c.maxHp,damage=c.dmg;for(const [e,role,x,z,y,weight]of [[c,'caster',600,-420,180,.5],[spawn('warden',-150,-100,null),'shield',-150,-100,0,.6],[spawn('sentinel',-600,-310,null),'spear',-600,-310,100,.45]])Object.assign(e,{frostOfficer:role,boss:true,kind:'boss',active:true,dropT:0,h:role==='caster'?78:70,r:22,x,z,y,sx:x,sz:z,hp:base*weight,maxHp:base*weight,dmg:damage*(role==='spear'?.8:.9),xp:Math.round(250*weight/1.55),speed:125,role:null,spec:null,lunge:0,home:null,label:{caster:'Frost Sorcerer',shield:'Shield Officer',spear:'Spear Officer'}[role]});
 G.boss=c;Object.assign(G.p,{...G.startPos,vy:0,vx:0,vz:0,onGround:true});G.camYaw=Math.PI;G.camPitch=.12;
}
function draw({G,bx,ring},t){for(const e of G.enemies){if(!e.frostOfficer||!busy(e))continue;const strike=e.offState==='strike',color=strike?'#e9fcff':e.frostOfficer==='caster'?'#75cde3':e.frostOfficer==='shield'?'#e6c47c':'#f0a478',y=e.offY+5;
 if(e.frostOfficer==='caster'){for(const offset of e.offTwin?[0,240]:[0]){ring(e.offX+offset,y,e.offZ,115,color,.9);if(strike)for(let i=0;i<7;i++){const a=i*Math.PI*2/7;bx(e.offX+offset+Math.cos(a)*70,y+40,e.offZ+Math.sin(a)*70,15,80,15,color);}}}
 else if(e.frostOfficer==='shield'){ring(e.offX,y,e.offZ,strike?35+295*(1-e.offClock/.9):330,color,.9,1.7,e.offDX,e.offDZ);}
 else for(let d=0;d<=e.offRange;d+=24)for(const side of [-1,1])bx(e.offX+e.offDX*d+e.offDZ*side*24,y,e.offZ+e.offDZ*d-e.offDX*side*24,7,3,9,color,color,.8);
}}
const api={paths,fields,alive,busy,floor,nav,step,inAttack,build,draw,snapshot:e=>Object.fromEntries(fields.map(k=>[k,e[k]??0]))};root.BFFrostOfficers=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
