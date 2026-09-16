/* Cosmetic combat events. Gameplay remains owned by index.html. */
(function(root){
'use strict';
const themes={
 warrior:['#f1bd68','#fff0cd','steel'],ranger:['#9ed882','#efffcd','leaf'],mage:['#c18aff','#e5dbff','rune'],reaper:['#a778ea','#dfccff','soul'],
 paladin:['#ffd36c','#fff8d3','sun'],necromancer:['#9bd196','#ebebcb','bone'],ninja:['#bd9fdd','#f2e6ff','star'],berserker:['#ed6545','#ffc787','fang'],
 pirate:['#ffb365','#fff0c4','powder'],chronomancer:['#65dbcc','#fff0b5','clock'],monk:['#edc784','#ffffdf','flow'],stormcaller:['#78c9ff','#e4fbff','bolt'],
 warlock:['#cd648f','#f4b3df','rift'],skylancer:['#87dcca','#f4ffe8','feather'],bladedancer:['#eca1d0','#fff0fc','twin'],beastmaster:['#c5ad6b','#e7f5b7','claw']
};
// Each row follows the actual a/b choices in slots 1,2,3,4; no name-based guessing.
const forms={warrior:'slash bash dash spiral ward quake roar execute',ranger:'fan lance dash slash trap smoke mark mark',mage:'bolt beam blink nova vortex ward crown nova',reaper:'slash slash blink ghost vortex tether siphon vortex',paladin:'bash execute roar heal ward nova ward execute',necromancer:'summon bolt summon nova wall tether summon storm',ninja:'slash fan blink smoke mark lance spiral ghost',berserker:'slash bash dash quake spiral execute roar ward',pirate:'lance fan slash dash smoke crown storm trap',chronomancer:'bolt beam nova blink vortex ward storm vortex',monk:'flurry bash ward dash spiral bash flurry dash',stormcaller:'bolt beam blink nova orb ward storm nova',warlock:'bolt beam nova siphon blink orb storm mark',skylancer:'rise lance dive rise dash storm dive vortex',bladedancer:'ward cross slash dash ward cross spiral ward',beastmaster:'claw cross ward dash heal roar storm crown'};
const profiles={}; let serial=0;
function configure(classes){
 for(const [cls,c] of Object.entries(classes)){
  let n=0;
  for(const rank of ['r2','r4','r6','r8'])for(const side of ['a','b']){
   const s=c[rank][side]; profiles[s.fx]={id:s.fx,name:s.n,cls,form:forms[cls].split(' ')[n++],slot:c[rank].slot,side};
  }
 }
 return profiles;
}
function emit(g,id,p,origin,radius){
 const profile=profiles[id]; if(!profile)return;
 const list=g.combatArt||(g.combatArt=[]);
 const life=profile.slot===3?1.05:.65;
 list.push({profile,x:p.x,y:p.y||0,z:p.z,yaw:p.yaw||0,origin,radius,t:0,life,serial:++serial});
 if(list.length>18)list.splice(0,list.length-18);
}
function pose(p,id){
 const f=profiles[id].form;
 if(["dash","blink","ghost","dive","rise"].includes(f))return;
 const clips={slash:'Sword_Attack',cross:'Sword_Attack2',spiral:'Attack2',execute:'Attack',flurry:'Punch',bash:'Punch',claw:'Sword_Attack',lance:profiles[id].cls==='ranger'||profiles[id].cls==='pirate'?'Bow_Shoot':'Staff_Attack',fan:'Bow_Shoot',quake:'Attack',roar:'Attacking_Idle',trap:'PickUp'};
 p.combatPose={serial:++serial,clip:clips[f]||(['ward','wall','heal','summon'].includes(f)?'Spell2':'Spell1'),remaining:.42};
}
function weapon(g,p,cls,charged){
 if(p.combatPose)p.combatPose.remaining=0;
 const w=p.weapon,art=w.art,forms={sword:'slash',spellblade:'slash',dagger:'cross',great:'slash',hammer:'execute',axe:'execute',scythe:'spiral',fist:'bash',bow:'lance',cross:'fan',javelin:'lance',flintlock:'bash',staff:'bolt',wand:'bolt'};
 const chargeForms={quake:'quake',spin:'spiral',spellsweep:'slash',hurl:'execute',javelin:'lance',powershot:'lance',scythethrow:'spiral',bolt:'bolt'};
 if(charged)p.combatPose={serial:++serial,clip:({bow:'Bow_Shoot',javelin:'Staff_Attack',staff:'Staff_Attack',wand:'Spell2',spellblade:'Sword_Attack2'})[art]||'Attack2',remaining:.45};
 const profile={id:w.arche,cls:cls||'warrior',form:charged?(chargeForms[w.chg]||'bolt'):(forms[art]||'slash'),slot:charged?2:-1,weapon:true,element:w.el};
 const list=g.combatArt||(g.combatArt=[]);
 list.push({profile,x:p.x,y:p.y||0,z:p.z,yaw:p.yaw||0,t:0,life:charged?.55:Math.max(.16,p.atkTimer||.24),radius:w.range||48,serial:++serial});
 if(list.length>18)list.splice(0,list.length-18);
}
function tick(g,dt){if(g.p?.combatPose)g.p.combatPose.remaining=Math.max(0,g.p.combatPose.remaining-dt);if(g.combatArt)g.combatArt=g.combatArt.filter(e=>(e.t+=dt)<e.life);}
function render(g,d){
 const {pushM,popM,mv,rotY,rotX,box}=d;
 let budget=d.strokeBudget??(d.quality==='low'?300:900);
 function line(a,b,width,col,alpha){
  if(--budget<0)return;
  if(d.ribbon){d.ribbon(a,b,width,col,alpha);return;}
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);if(len<.01)return;
  pushM();mv((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);rotY(Math.atan2(dx,dz));rotX(-Math.atan2(dy,Math.hypot(dx,dz)));box(width,width,len,col,col,alpha);popM();
 }
 function arc(r,y,start,end,col,alpha,width=2,segments=16){
  for(let i=0;i<segments;i++){let a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments;line([Math.sin(a)*r,y,Math.cos(a)*r],[Math.sin(b)*r,y,Math.cos(b)*r],width,col,alpha);}
 }
 function motif(kind,r,y,angle,col,alpha){
  const x=Math.sin(angle)*r,z=Math.cos(angle)*r;
  pushM();mv(x,y,z);rotY(angle);
  const shapes={steel:[[-5,-6,0],[0,8,0],[5,-6,0]],leaf:[[-5,0,0],[0,8,5],[5,0,0],[0,-4,-5],[-5,0,0]],rune:[[-6,-6,0],[-6,6,0],[5,6,0],[0,0,0],[5,-6,0]],soul:[[-5,0,0],[0,13,0],[5,0,0],[0,-8,0]],sun:[[-8,0,0],[8,0,0],[0,0,0],[0,12,0],[0,-8,0]],bone:[[-4,-8,0],[0,-5,0],[0,7,0],[4,10,0]],star:[[0,9,0],[3,2,0],[10,0,0],[3,-2,0],[0,-9,0],[-3,-2,0],[-10,0,0],[-3,2,0],[0,9,0]],fang:[[-6,8,0],[0,-10,0],[6,8,0]],powder:[[-8,0,0],[0,10,0],[8,0,0]],clock:[[0,0,0],[0,10,0],[0,0,0],[8,0,0]],flow:[[-9,-4,0],[-3,4,0],[3,-4,0],[9,4,0]],bolt:[[-5,10,0],[3,2,0],[-2,-1,0],[5,-10,0]],rift:[[-4,10,0],[3,3,0],[-3,-3,0],[4,-10,0]],feather:[[-6,-8,0],[0,0,0],[6,10,0]],twin:[[-6,-8,0],[2,9,0],[-2,9,0],[6,-8,0]],claw:[[-6,-8,0],[-3,9,0],[0,-8,0],[3,9,0],[6,-8,0]]};
  const points=shapes[kind];for(let i=1;i<points.length;i++)line(points[i-1],points[i],1.7,col,alpha);popM();
 }
 // Persistent defenses use real gameplay state, not an arbitrary animation duration.
 const p=g.p;if(p&&(p.shieldHp>0||p.guardT>0)){
  const [col,hot,kind]=themes[d.classId]||themes.warrior;
  pushM();mv(p.x,p.y+4,p.z);rotY(p.yaw||0);
  for(let j=0;j<6;j++)motif(kind,31,23,j*Math.PI/3,col,.65);
  arc(31,7,0,Math.PI*2,hot,.4,1.3,24);popM();
 }
 for(const e of (g.combatArt||[]).slice().reverse()){
  const q=e.t/e.life,a=Math.sin(Math.PI*Math.min(1,q*1.4))*(1-q*.6),v=1-Math.pow(1-q,3);
  const pr=e.profile,theme=themes[pr.cls],kind=theme[2],hot=theme[1],col=({fire:'#ff8845',ice:'#87ddff',arcane:'#cd9bff',poison:'#a9df69',void:'#b48be8',holy:'#ffe6a1'})[pr.element]||theme[0],ultimate=pr.slot===3,scale=ultimate?1.35:1,r=e.radius?(12+v*(e.radius-12)):(24+v*48)*scale;
  pushM();mv(e.x,e.y+4,e.z);rotY(e.yaw);
  const f=pr.form;
  if(['slash','cross','spiral','execute','claw','flurry'].includes(f)){
   const count=f==='flurry'?5:f==='cross'?2:f==='spiral'?3:1;
   for(let j=0;j<count;j++){
    pushM(); if(f==='cross')rotX(j?-.6:.6); else if(f==='execute')rotX(Math.PI/2);
    const start=f==='spiral'?q*8+j*2:-1.5+q*.6+j*.12;
    arc(r,22+j*5,start,start+(f==='spiral'?3.7:2.2)*v,col,a,3.2,18);
    arc(r-5,22+j*5,start+.15,start+2*v,hot,a*.7,1,14);popM();
   }
  }else if(['beam','lance','bolt','fan','bash'].includes(f)){
   const count=f==='fan'?5:1;
   for(let j=0;j<count;j++){pushM();rotY((j-(count-1)/2)*.22);
    const len=f==='bash'?35:70;
    line([-7,25,14],[-2,25,14+len*v],2.5,col,a);line([7,25,14],[2,25,14+len*v],2.5,hot,a);
    motif(kind,14+len*v,25,0,col,a);popM();}
  }else if(['dash','blink','ghost','dive','rise'].includes(f)){
   const up=['rise','dive'].includes(f);
   for(let j=0;j<4;j++){const h=up?(f==='dive'?1-v:v)*100:18+j*5;arc(18+j*4,h,-1.2,1.2,col,a*(1-j*.16),2,9);}
   if(e.origin){ // Absolute displacement links departure to arrival, never invents movement.
    popM();pushM();line([e.origin.x,e.origin.y+20,e.origin.z],[e.x,e.y+20,e.z],2,col,a*.65);
   }
  }else if(['ward','wall'].includes(f)){
   for(let j=0;j<(f==='wall'?5:8);j++){let ang=f==='wall'?(j-2)*.35:j*Math.PI/4;motif(kind,38,18+v*18,ang,col,a);}
   arc(38,6,0,Math.PI*2,hot,a*.45,1,24);
  }else if(['heal','siphon','tether','summon'].includes(f)){
   for(let j=0;j<6;j++){const angle=j*Math.PI/3+q*2,rr=f==='siphon'?r*(1-q):r*.65;motif(kind,rr,10+v*45,angle,col,a);}
   if(f==='heal'){line([-12,30,0],[12,30,0],3,hot,a);line([0,18,0],[0,42,0],3,hot,a);}
  }else if(['mark','trap'].includes(f)){
   for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2);line([18,3,18],[18,3,8],2,col,a);line([18,3,18],[8,3,18],2,col,a);popM();}
   motif(kind,0,35,0,hot,a);
  }else{
   // Open spirals keep the ground and enemy telegraphs visible.
   const inward=['vortex','orb'].includes(f);
   for(let j=0;j<3;j++)arc(inward?r*(1-q*.6):r,5+j*9,j*2.094+q*3,j*2.094+q*3+1.5,col,a,2,12);
   for(let j=0;j<6;j++)motif(kind,r,12+(f==='storm'?60*(1-v):v*18),j*Math.PI/3+q,hot,a*.8);
  }
  // Class signatures have distinct silhouettes, not just different tint values.
  if(!pr.weapon && (ultimate || ['ward','summon','vortex','storm','crown'].includes(f))){
   const R=Math.min(r*.7,90),h=18+v*25;
   if(kind==='clock'){
    arc(R,8,0,Math.PI*2,col,a*.7,1,32);
    for(let j=0;j<12;j++){const an=j*Math.PI/6;line([Math.sin(an)*R,8,Math.cos(an)*R],[Math.sin(an)*(R-7),8,Math.cos(an)*(R-7)],1.5,hot,a);}
    for(let j=0;j<2;j++){const an=(j?1:-1)*q*6+j;line([0,8,0],[Math.sin(an)*R*(j?.8:.55),8,Math.cos(an)*R*(j?.8:.55)],2,col,a);}
   }else if(kind==='bone'){
    for(let j=0;j<5;j++){pushM();rotY((j-2)*.6);line([R,0,0],[R*.8,h+24,0],3,hot,a);line([R*.8,h+24,0],[R*.35,h+36,0],2.5,hot,a);popM();}
   }else if(kind==='bolt'){
    for(let j=0;j<5;j++){const an=j*1.256;let prev=[Math.sin(an)*R,8,Math.cos(an)*R];for(let k=1;k<=5;k++){const next=[prev[0]+Math.sin(k*7+j+Math.floor(q*10))*12,8+k*17*v,prev[2]+Math.cos(k*5+j)*9];line(prev,next,k===5?1:2,col,a);prev=next;}}
   }else if(kind==='sun'||kind==='feather'){
    for(const sign of [-1,1])for(let j=0;j<6;j++)line([sign*10,26,0],[sign*(35+j*8)*v,35+(5-j)*9*v,-j*4],3-j*.3,j%2?col:hot,a);
   }else if(kind==='rift'){
    for(const sign of [-1,1]){let prev=[sign*12,4,0];for(let j=1;j<6;j++){const next=[sign*(10+Math.sin(j*1.5)*8),j*13*v,0];line(prev,next,3,col,a);prev=next;}}
   }else if(kind==='twin'){
    for(let j=0;j<6;j++){pushM();rotY(j*Math.PI/3+q*3);line([R*.4,10,0],[R,48*v,0],3,hot,a);line([R*.55,15,-6],[R*.55,15,6],2,col,a);popM();}
   }else if(kind==='claw'){
    // Angular spectral wolf head: ears, brow, long muzzle and separated lower jaw.
    const pts=[[-24,35,0],[-21,65,0],[-7,48,0],[7,48,0],[21,65,0],[24,35,0],[10,20,15],[0,16,24],[-10,20,15],[-24,35,0]];
    for(let j=1;j<pts.length;j++)line(pts[j-1],pts[j],2.2,col,a);
    line([-10,39,3],[-4,36,8],2,hot,a);line([10,39,3],[4,36,8],2,hot,a);
   }else if(kind==='powder'){
    for(let j=0;j<4;j++){pushM();rotY((j-1.5)*.65);for(let k=0;k<3;k++)arc(8+k*7,16+k*8,0,Math.PI*2,col,a*(1-k*.22),2,12);popM();}
   }else if(kind==='rune'){
    for(let j=0;j<3;j++){pushM();rotY(q+j*2.094);rotX(.6);const rr=R*(.6+j*.15);for(let k=0;k<4;k++){const an=k*Math.PI/2;line([Math.sin(an)*rr,24,Math.cos(an)*rr],[Math.sin(an+Math.PI/2)*rr,24,Math.cos(an+Math.PI/2)*rr],2,col,a);}popM();}
   }else if(kind==='flow'){
    for(let j=0;j<2;j++){pushM();rotY(j*Math.PI);arc(R*.55,22,q*4,q*4+Math.PI*1.4,j?col:hot,a,3,20);popM();}
   }else if(kind==='star'){
    for(let j=0;j<4;j++){pushM();rotY(q*5+j*Math.PI/2);motif('star',R,32,0,hot,a);popM();}
   }else if(kind==='leaf'){
    for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2);line([R,2,0],[R*.8,44*v,0],2,col,a);motif('leaf',R*.8,30*v,0,col,a);popM();}
   }else if(kind==='soul'){
    for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2-q*3);rotX(.4);arc(R,22,-1,1.2,col,a,3,16);popM();}
   }else{
    for(let j=0;j<6;j++)motif(kind,R,h,j*Math.PI/3,hot,a);
   }
  }
  if(ultimate)for(let j=0;j<8;j++)motif(kind,25+v*65,14+Math.sin(q*Math.PI)*30,j*Math.PI/4,hot,a*.7);
  popM();
 }
 // Projectile trails follow velocity and height; they are never collision volumes.
 let projectileCount=0;
 for(const pr of (d.particles===false?[]:g.projectiles)||[]){
  if(pr.owner!=='player'||++projectileCount>32)continue;
  const speed=Math.hypot(pr.vx,pr.vy||0,pr.vz);if(speed<1)continue;
  const length=Math.min(58,speed*.055),col=pr.color||'#ffe2af',size=Math.max(1,Math.min(5,(pr.size||4)*.32));
  const start=[pr.x,pr.y,pr.z],end=[pr.x-pr.vx/speed*length,pr.y-(pr.vy||0)/speed*length,pr.z-pr.vz/speed*length];
  line(start,end,size,col,.65);
  if(['fireball','glob','orb','runeorb','spark','shard','light'].includes(pr.shape)){
   pushM();mv(pr.x,pr.y,pr.z);rotY(Math.atan2(pr.vx,pr.vz));
   if(pr.shape==='spark')for(let j=0;j<3;j++)line([0,0,-j*8],[Math.sin((g.time||0)*40+j)*8,Math.cos(j*7)*5,-(j+1)*8],1.5,col,.8);
   else if(pr.shape==='fireball')for(let j=0;j<4;j++){const an=j*Math.PI/2;line([Math.cos(an)*5,Math.sin(an)*5,5],[Math.cos(an+1)*9,Math.sin(an+1)*9,-18],3,col,.7);line([Math.cos(an+1)*9,Math.sin(an+1)*9,-18],[0,0,-35],1.5,col,.35);}
   else if(pr.shape==='light'){line([-10,0,0],[10,0,0],2,col,.8);line([0,-10,0],[0,10,0],2,col,.8);}
   else if(pr.shape==='shard')for(const sign of [-1,1])line([0,0,8],[sign*5,0,-10],1.3,col,.75);
   else for(let j=0;j<2;j++){pushM();rotX(j*Math.PI/2);arc((pr.size||5)*1.3,0,(g.time||0)*4,(g.time||0)*4+Math.PI*1.5,col,.5,1,12);popM();}
   popM();
  }
 }

}
root.BF_COMBAT_ART={configure,profiles,emit,pose,weapon,tick,render,themes};
})(window);
