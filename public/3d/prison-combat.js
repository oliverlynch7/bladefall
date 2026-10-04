/* Original Prison Break roster. Pure attack geometry/state; rendering never deals damage. */
(()=>{'use strict';
const moves={
 bash:{shape:'cone',reach:100,wind:.95,strike:.25,recover:1.45,range:95},
 thrust:{shape:'lane',reach:145,width:18,wind:.85,strike:.22,recover:1.05,range:135},
 rush:{shape:'rush',reach:230,width:23,wind:.95,strike:.65,recover:1.4,range:260},
 ember:{shape:'disk',reach:68,wind:1.2,strike:.3,recover:1.6,range:340,target:true},
 sweep:{shape:'cone',reach:150,wind:1.0,strike:.32,recover:1.25,range:145},
 toll:{shape:'ring',reach:210,inner:85,wind:1.25,strike:.35,recover:1.6,range:250},
 maul:{shape:'cone',reach:120,wind:.85,strike:.3,recover:1.1,range:130},
 crush:{shape:'disk',reach:125,wind:1.1,strike:.3,recover:1.5,range:150},
 cross:{shape:'cross',reach:240,width:22,wind:1.15,strike:.35,recover:1.4,range:290},
 mark:{shape:'disk',reach:90,wind:1.25,strike:.3,recover:1.5,range:360,target:true}
};
const roster={
 prison_pike:{label:'Pike Watcher',hp:32,dmg:12,speed:67,r:18,h:78,color:'#708d9b',kind:'prison',xp:24,sequence:['thrust'],hint:'Step beside the spear. Strike while it pulls back.'},
 prison_hound:{label:'Chain Hound',hp:26,dmg:14,speed:85,r:23,h:37,color:'#b36e46',kind:'prison',xp:24,sequence:['rush'],hint:'Its crouch warns of a straight rush. Move sideways.'},
 prison_vessel:{label:'Cinder Vessel',hp:28,dmg:13,speed:43,r:23,h:48,color:'#aa5938',kind:'prison',xp:26,sequence:['ember'],hint:'Leave the glowing circle before it bursts.'},
 prison_bell:{label:'BELL KEEPER',hp:48,dmg:20,speed:50,r:38,h:130,color:'#ae9257',kind:'prison',xp:140,boss:true,sequence:['sweep','toll','sweep'],second:['sweep','toll','toll'],hint:'Dodge the arm sweep. The bell ring has a safe center.'},
 prison_maw:{label:'IRON MAW',hp:58,dmg:22,speed:63,r:42,h:64,color:'#7a807e',kind:'prison',xp:170,boss:true,sequence:['rush','maul','crush'],second:['rush','crush','maul','rush'],hint:'Sidestep its rush, then punish the recovery. Back away from its stomp.'},
 prison_unbound:{label:'THE UNBOUND',hp:66,dmg:23,speed:48,r:29,h:105,color:'#8b79b7',kind:'prison',xp:210,boss:true,sequence:['cross','mark','toll'],second:['mark','cross','mark','toll'],hint:'Stand between the cross beams. Move out of marked circles.'},
 prison_guard:{label:'Shield Guard',hp:38,dmg:12,speed:52,r:22,h:78,color:'#99805b',kind:'prison',xp:30,sequence:['bash'],hint:'Flank the shield, or strike after its bash.'}
};
// Faster commitments, with readable tells and a punish window after every strike.
for(const m of Object.values(moves)){m.wind=+(m.wind*.76).toFixed(3);m.strike=+(m.strike*.78).toFixed(3);m.recover=+(m.recover*.78).toFixed(3);}
for(const k of Object.values(roster))k.speed=Math.round(k.speed*1.18);
function setup(e){const k=roster[e.type];if(!k)return;e.prisonFoe=e.type;e.pcState='approach';e.pcClock=.55;e.pcSerial=0;e.pcCount=0;e.pcMove=k.sequence[0];e.role=null;e.spec=null;e.shot=null;e.speed=k.speed;e.label=k.label;}
function step(e,dt,target,speed,canAttack=true){
 const k=roster[e.prisonFoe];if(!k||!target||e.dead)return;const m=moves[e.pcMove];
 e.pcClock=Math.max(0,(e.pcClock||0)-dt);
 if(e.pcState==='wind'){
  // Facing and ground target lock at the start: no last-frame homing attacks.
  if(!e.pcClock){e.pcState='strike';e.pcClock=m.strike;}return;
 }
 if(e.pcState==='strike'){
  if(m.shape==='rush'){e.x+=e.pcDX*m.reach/m.strike*dt;e.z+=e.pcDZ*m.reach/m.strike*dt;}
  if(!e.pcClock){e.pcState='recover';e.pcClock=m.recover;}return;
 }
 if(e.pcState==='recover'){if(!e.pcClock){e.pcState='approach';e.pcClock=.18;}return;}
 const seq=e.hp<e.maxHp*.5&&k.second?k.second:k.sequence,next=seq[e.pcCount%seq.length],a=moves[next];
 const dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz)||1;e.yaw=Math.atan2(dx,dz);
 if(d>a.range){e.x+=dx/d*speed*dt;e.z+=dz/d*speed*dt;}
 else if(!e.pcClock&&canAttack){
  e.pcMove=next;e.pcState='wind';e.pcClock=a.wind;e.pcSerial++;e.pcCount++;
  e.pcDX=dx/d;e.pcDZ=dz/d;e.pcX=a.target?target.x:e.x;e.pcZ=a.target?target.z:e.z;e.pcY=e.y;
 }
}
function contains(e,p){
 const m=moves[e.pcMove];if(!m||e.pcState!=='strike'||e.dead||p.dead||p.downed||p.hp<=0)return false;
 const height=p.y-e.pcY;if(height>65||height< -45)return false;
 const dx=p.x-e.pcX,dz=p.z-e.pcZ,d=Math.hypot(dx,dz),r=Math.min(20,p.r||12),f=dx*e.pcDX+dz*e.pcDZ,s=dx*e.pcDZ-dz*e.pcDX;
 if(m.shape==='disk')return d<=m.reach+r;
 if(m.shape==='ring')return d>=m.inner-r&&d<=m.reach+r;
 if(m.shape==='cone')return d<=m.reach+r&&(d<r||f/(d||1)>=Math.cos(1.05));
 if(m.shape==='cross')return (Math.abs(f)<m.reach+r&&Math.abs(s)<m.width+r)||(Math.abs(s)<m.reach+r&&Math.abs(f)<m.width+r);
 return f>=-r&&f<=m.reach+r&&Math.abs(s)<=m.width+r&&(m.shape!=='rush'||Math.hypot(p.x-e.x,p.z-e.z)<=e.r+r+18);
}
function guardDamage(e,src,dmg){
 if(e.prisonFoe!=='prison_guard'||!src||e.pcState==='recover'||e.stunT>0||e.staggerT>0)return dmg;
 const dx=src.x-e.x,dz=src.z-e.z,d=Math.hypot(dx,dz);
 return d>0&&(dx*Math.sin(e.yaw)+dz*Math.cos(e.yaw))/d>.5?dmg*.4:dmg;
}
function snapshot(e){const o={};for(const k of ['prisonFoe','pcState','pcClock','pcSerial','pcCount','pcMove','pcDX','pcDZ','pcX','pcY','pcZ','label','stunT','y','r','h','dmg','speed','elite','boss','prisonRoom'])if(e[k]!=null)o[k]=e[k];return o;}
function danger(e,api){
 if(!['wind','strike'].includes(e.pcState))return;const m=moves[e.pcMove],c=e.pcState==='strike'?'#fff1c4':'#f3a353',x=e.pcX,z=e.pcZ;
 const mark=(x,z)=>api.mark(x,e.pcY,z,c),point=(f,s)=>[x+e.pcDX*f+e.pcDZ*s,z+e.pcDZ*f-e.pcDX*s];
 const line=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/18);for(let i=0;i<=n;i++)mark(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n);};
 const ring=(r,arc=Math.PI)=>{const base=Math.atan2(e.pcDZ,e.pcDX),n=Math.ceil(r*arc*2/18);for(let i=0;i<=n;i++){const a=base-arc+arc*2*i/n;mark(x+Math.cos(a)*r,z+Math.sin(a)*r);}};
 if(m.shape==='disk')ring(m.reach);
 else if(m.shape==='ring'){ring(m.reach);ring(m.inner);}
 else if(m.shape==='cone'){ring(m.reach,1.05);for(const s of [-1,1])line([x,z],point(Math.cos(1.05)*m.reach,s*Math.sin(1.05)*m.reach));}
 else if(m.shape==='cross')for(const s of [-1,1]){line(point(-m.reach,s*m.width),point(m.reach,s*m.width));line(point(s*m.width,-m.reach),point(s*m.width,m.reach));}
 else for(const s of [-1,1])line(point(0,s*m.width),point(m.reach,s*m.width));
}
// Articulated, original silhouettes. Body pivots match the attack state and stay grounded.
function draw(e,t,a){
 const {push,pop,mv,rx,ry,rz,bx}=a,k=roster[e.prisonFoe],m=moves[e.pcMove];if(!k)return;
 const wind=e.pcState==='wind',strike=e.pcState==='strike',recover=e.pcState==='recover';
 const phase=wind?1-e.pcClock/m.wind:strike?1-e.pcClock/m.strike:0;
 const gait=e.pcState==='approach'?Math.sin(t*(e.boss?4:7)):0,flash=e.hitFlash>0;
 const metal=flash?'#ffffff':k.color,dark=flash?'#ffffff':'#292e38',trim='#d1bea0',glow=recover?'#8de3bc':wind?'#ffb358':'#d6c9f3';
 const part=(x,y,z,w,h,d,c)=>bx(x,y,z,w,h,d,c,c===glow?glow:null);
 const limb=(x,y,z,angle,len,w,c)=>{push();mv(x,y,z);rx(angle);part(0,-len/2,0,w,len,w,c);pop();};
 push();mv(e.x,e.y,e.z);ry(e.yaw);if(e.elite)a.scale(1.12,1.12,1.12);
 if(e.type==='prison_pike'||e.type==='prison_guard'){
  limb(-9,32,0,gait*.45,30,9,dark);limb(9,32,0,-gait*.45,30,9,dark);
  part(0,48,0,25,33,16,metal);part(0,53,9,19,17,4,trim);part(0,33,0,29,5,20,dark);part(0,69,0,16,18,16,dark);part(0,70,9,12,3,2,glow);part(0,80,-2,4,13,8,trim);
  const arm=wind?-.45-phase*.35:strike?-1.5:recover?-1.1:-.65;
  limb(-18,59,0,arm,25,8,metal);limb(18,59,0,arm,25,8,metal);
  if(e.type==='prison_guard'){
   push();mv(-13,44,recover?-3:18);rz(recover?-.6:0);part(0,0,0,29,48,8,metal);part(0,0,5,5,39,3,trim);pop();
   part(18,40,strike?35:16,8,8,35,dark);part(18,40,strike?52:33,15,14,12,trim);
  }else{push();mv(15,40,wind?-10:strike?42:12);part(0,0,24,4,4,80,trim);part(0,0,69,8,3,16,metal);pop();
  part(-19,47,7,9,25,5,trim);}
 }else if(e.type==='prison_hound'||e.type==='prison_maw'){
  const big=e.boss,S=big?1.65:1;push();a.scale(S,S,S);
  const crouch=wind?phase*5:0;part(0,24-crouch,0,30,23,53,metal);part(0,33-crouch,-8,24,9,36,dark);
  for(const side of [-1,1])for(let j=0;j<(big?3:2);j++){const z=big?-21+j*21:-18+j*36;limb(side*19,23-crouch,z,(strike?.8:gait*.5)*(j%2?1:-1)*side,22,7,dark);part(side*19,3,z+5,10,6,14,trim);}
  push();mv(0,25-crouch,32);rx(wind?-.25:strike?.25:0);part(0,0,0,27,19,27,dark);part(0,-8,9,26,5,24,metal);for(const side of [-1,1]){part(side*10,3,14,5,4,3,glow);part(side*9,-2,18,4,9,4,trim);}pop();
  for(const side of [-1,1])for(let j=0;j<3;j++){push();mv(side*16,32,-17+j*15);rz(side*.45);part(0,0,0,10,8,17,metal);pop();}
  for(let j=0;j<5;j++){push();mv(0,39-crouch,-24+j*11);rz(.7);part(0,0,0,7,14,7,trim);pop();}
  for(const side of [-1,1])for(let j=0;j<5;j++)part(side*17,25-j*3,-17+j*9,5,5,5,trim);pop();
 }else if(e.type==='prison_vessel'){
  for(const side of [-1,1])limb(side*14,14,0,side*gait*.5,13,8,dark);
  part(0,29,0,38,30,32,metal);part(0,15,0,42,7,35,dark);part(0,44,0,30,5,26,trim);
  for(const side of [-1,1])part(side*21,29,0,5,20,18,dark);
  for(let j=0;j<3;j++)part(-10+j*10,wind?42+phase*12:36,17,4,15,3,glow);
  push();mv(0,48,0);rz(wind?phase*.4:0);part(0,0,0,35,6,29,dark);pop();
 }else if(e.type==='prison_bell'){
  for(const side of [-1,1]){limb(side*22,40,0,gait*side*.25,36,17,dark);part(side*22,5,9,25,10,30,metal);}
  for(let j=0;j<4;j++){part(0,53+j*17,0,82-j*12,18,52-j*5,metal);push();mv(0,53+j*17,0);ry(Math.PI/4);part(0,0,0,(82-j*12)*.73,18,(52-j*5)*.94,metal);pop();}
  for(const side of [-1,1]){part(side*27,75,26,6,45,6,dark);for(let j=0;j<4;j++)part(side*27,55+j*12,30,4,4,4,trim);}
  part(0,45,0,88,9,58,dark);part(0,105,0,32,12,30,dark);part(0,122,0,12,23,12,trim);part(0,70,29,14,27,3,glow);
  for(const side of [-1,1]){push();mv(side*43,88,0);rz(side*(wind?.3+phase*.7:strike?-1.0:.12));limb(0,0,0,0,40,15,dark);part(0,-40,8,24,19,29,metal);pop();}
  for(let j=0;j<5;j++)part(-28+j*14,48,30,7,8,3,trim);
 }else{
  const hover=12+Math.sin(t*2)*4;push();mv(0,hover,0);
  for(let j=0;j<4;j++){push();mv(0,30+j*14,0);ry(t*.15*(j%2?1:-1));part(0,0,0,55-j*9,12,29-j*4,j%2?metal:dark);pop();}
  part(0,51,0,12,23,12,glow);part(0,84,0,25,26,16,trim);part(0,85,9,5,15,3,dark);
  for(const side of [-1,1]){push();mv(side*30,63,0);rz(side*(wind?.4+phase*.8:.3));part(0,-15,0,10,30,12,metal);part(0,-35,4,13,9,13,glow);pop();}
  for(let j=0;j<5;j++){const ang=j*Math.PI*2/5+t*.5;push();mv(Math.cos(ang)*38,90+Math.sin(ang)*17,Math.sin(ang)*14);rz(ang);part(0,0,0,8,15,6,metal);pop();}pop();
 }
 pop();
}
window.BFPrisonCombat={roster,moves,setup,step,contains,snapshot,guardDamage,danger,draw};
})();
