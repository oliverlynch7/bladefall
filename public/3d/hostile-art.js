/* Hostile visual art reads combat state; it never schedules damage or changes AI. */
(function(root){'use strict';
const groups={stone:'grunt goblin slime slimelet thornboar sporeback brute dustjackal cragspitter mimic',steel:'bones charger sentinel revenant siegeknight warden archer',frost:'frostling frostshell frostlobber sorcerer',fire:'emberling magmaskit embertotem colossus',void:'shadeling caster blinkstalker voidtether king tyrant',wind:'flyer galewisp sparkling',poison:'toxling sporeback',holy:'sunpriest marblestatue royalarcanist marblecolossus'};
const types={};for(const [style,list]of Object.entries(groups))for(const type of list.split(' '))types[type]=style;
const colors={stone:'#e5aa72',steel:'#dce8fb',frost:'#87e1ff',fire:'#ff8846',void:'#bf85f4',wind:'#97e5d1',poison:'#b5dc64',holy:'#ffe4a4'};
function style(type,el){return ({fire:'fire',ice:'frost',poison:'poison',void:'void',holy:'holy',arcane:'void'})[el]||types[type]||'steel';}
function impact(g,pr){if(pr.owner!=='enemy'||pr._impactArt)return;pr._impactArt=true;const events=g.hostileArt||(g.hostileArt=[]);events.push({x:pr.x,y:pr.y,z:pr.z,style:style(pr.src?.type,pr.el),t:0,life:.32});if(events.length>12)events.shift();}
function tick(g,dt){if(g.hostileArt)g.hostileArt=g.hostileArt.filter(e=>(e.t+=dt)<e.life);}
function replacesWave(g,sw,quality){
 if(!sw.fxType||!(sw.dmg>0)||sw.hitPlayer||sw.delay>0)return false;
 const eligible=(g.shockwaves||[]).filter(w=>w.fxType&&w.dmg>0&&!w.hitPlayer&&!(w.delay>0));
 const index=eligible.indexOf(sw);return index>=0&&index<(quality==='low'?1:3);
}
function render(g,d){
 let budget=d.quality==='low'?120:300,count=0;
 const {pushM,popM,mv,rotY,rotX}=d;
 function line(a,b,w,c,alpha=1){if(budget--<=0)return;d.ribbon(a,b,w,c,alpha);count++;}
 function ring(r,y,c,start=0,span=Math.PI*2,n=16,w=1.4,alpha=.7){for(let i=0;i<n;i++){const a=start+span*i/n,b=start+span*(i+1)/n;line([Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y,Math.sin(b)*r],w,c,alpha);}}
 function diamond(x,y,z,r,c){line([x,y+r,z],[x+r,y,z],1.7,c);line([x+r,y,z],[x,y-r,z],1.7,c);line([x,y-r,z],[x-r,y,z],1.7,c);line([x-r,y,z],[x,y+r,z],1.7,c);}
 function crown(r,y,c,broken){for(let j=0;j<5;j++){const x=(j-2)*r*.35,h=j%2?7:18;line([x-r*.17,y,0],[x,y+h,broken?j*3:0],2,c,.8);line([x,y+h,broken?j*3:0],[x+r*.17,y,0],2,c,.8);}}
 const t=g.time||0;
 // Collision blooms are short, directional shards; no expanding damage-like boundary.
 for(const e of (d.particles===false?[]:g.hostileArt||[]).slice(-4)){
  const q=e.t/e.life,c=colors[e.style];pushM();mv(e.x,e.y,e.z);
  for(let j=0;j<6;j++){const a=j*Math.PI/3,r=4+q*22;line([Math.cos(a)*r*.4,Math.sin(a)*r*.4,0],[Math.cos(a)*r,Math.sin(a)*r,Math.sin(j)*8*q],e.style==='fire'?3:1.5,c,1-q);}
  popM();
 }
 // Every active front stays on its authoritative radius and committed cone direction.
 let waves=0;
 for(const sw of g.shockwaves||[]){
  if(!replacesWave(g,sw,d.quality))continue;
  const type=sw.fxType==='colossus'&&d.theme==='marble'?'marblecolossus':sw.fxType||'',st=style(type),c=colors[st],r=sw.r,y=(sw.y||0)+5;
  const span=sw.arc?sw.arc*2:Math.PI*2,base=sw.arc?Math.atan2(sw.dirZ,sw.dirX)-sw.arc:0;
  pushM();mv(sw.x,y,sw.z);
  ring(r,4,c,base,span,sw.arc?18:24,sw.arc?3:2,.8);
  const N=sw.arc?7:12;
  for(let j=0;j<N;j++){
   const a=base+span*(j+.5)/N,x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(st==='frost'){line([x-Math.cos(a)*7,0,z-Math.sin(a)*7],[x,28,z],2,c,.85);line([x,28,z],[x+Math.cos(a)*6,0,z+Math.sin(a)*6],1.5,c,.7);}
   else if(st==='fire'){line([x,0,z],[x+Math.sin(j+t*12)*5,23+Math.sin(j*2+t*8)*12,z],3,c,.8);}
   else if(sw.arc){line([x*.93,2,z*.93],[x,15*Math.sin(j/N*Math.PI),z],2,c,.8);}
   else{line([x*.93,0,z*.93],[x,7,z],2,c,.75);line([x,7,z],[x*1.035,0,z*1.035],1.2,c,.7);}
  }
  popM();
 }
 // Boss silhouettes sell anticipation above the warning, without covering its border.
 const foes=(g.enemies||[]).filter(e=>!e.dead&&e.boss).slice(0,2);
 for(const e of foes){
  let type=e.type;if(type==='colossus'&&d.theme==='marble')type='marblecolossus';
  const c=colors[style(type)],h=e.h||70,r=e.r||35;
  pushM();mv(e.x,(e.y||0)+h*.5,e.z);rotY(e.yaw||0);
  const preparing=Math.max(e.windT||0,e.slamW||0,e.cleaveW||0,e.novaW||0,e.poundW||0,e.shotW||0,e.pinT||0);
  if(preparing>0){
   if(type==='brute')for(const sign of [-1,1]){line([sign*r,0,0],[sign*r*1.3,h*.25,0],4,c);line([sign*r*1.3,h*.25,0],[sign*r*.7,h*.4,0],2,c);}
   else if(type==='warden'){line([r,0,0],[r*.2,h*.8,0],4,c);line([r*.1,h*.55,-12],[r*.5,h*.55,12],2,c);}
   else if(type==='sorcerer')for(let j=0;j<6;j++){const a=j*Math.PI/3;diamond(Math.cos(a)*r,8+Math.sin(a)*r,0,7,c);}
   else if(type==='colossus')for(let j=0;j<4;j++){const x=(j-1.5)*r*.5;line([x,0,0],[x+5,22,0],3,c);line([x+5,22,0],[x,40,0],1.5,c);}
   else if(type==='marblecolossus'){ring(r,10,c,0,Math.PI*2,16);for(const sign of [-1,1])line([0,5,0],[sign*r,30,0],2,c);}
   else if(type==='archer'){diamond(0,15,15,18,c);line([-25,15,15],[25,15,15],1,c,.8);}
   else crown(r,h*.3,c,type==='tyrant');
  }
  if(e.courtWard&&type==='king')crown(r,h*.6,c,false);
  popM();
  if(type==='king'&&e.courtWard)for(const ally of (e._court||[]).slice(0,2))if(!ally.dead){line([e.x,(e.y||0)+h*.5,e.z],[ally.x,(ally.y||0)+(ally.h||35)*.7,ally.z],1.2,c,.5);}
  if(type==='archer'&&e.pinT>0){for(const point of [{x:e.pinX,z:e.pinZ},...(e._pin2||[])]){if(!Number.isFinite(point.x))continue;line([e.x,(e.y||0)+h*.65,e.z],[point.x,8,point.z],1,c,.3);pushM();mv(point.x,8,point.z);for(let j=0;j<4;j++){rotY(Math.PI/2);line([0,0,18],[0,0,38],2,c,.9);}popM();}}
 }
 // Light and collapse accents mirror the live beam/tile fields, including their preparation.
 const b=g.beam;if(b&&!root.BF_FIELD_ART?.replaces(g,b,d.quality)){const c='#fff0c8',dx=Math.cos(b.ang),dz=Math.sin(b.ang);line([b.ex+dx*40,9,b.ez+dz*40],[b.ex+dx*640,9,b.ez+dz*640],b.warn>0?1:4,c,b.warn>0?.3:.7);}
 for(const tile of (g.collapse||[]).slice(0,4)){if(root.BF_FIELD_ART?.replaces(g,tile,d.quality)||!Number.isFinite(tile.x)||!Number.isFinite(tile.z))continue;pushM();mv(tile.x,6,tile.z);const r=(tile.r||54)*.8;for(const sign of [-1,1]){line([-r,0,sign*r],[0,3,sign*9],2,'#c785ed',.75);line([0,3,sign*9],[r,0,-sign*r],1.5,'#c785ed',.7);}if(tile.open>0)crown(22,8,'#c785ed',true);popM();}
 // Species-shaped shells surround the existing collision core. Never hide a projectile if capped.
 let shots=0;
 for(const pr of (d.particles===false?[]:g.projectiles)||[]){
  if(pr.owner!=='enemy'||++shots>(d.quality==='low'?8:16))continue;
  const st=style(pr.src?.type,pr.el),c=colors[st],s=Math.max(3,Math.min(12,pr.size||5));
  pushM();mv(pr.x,pr.y,pr.z);rotY(Math.atan2(pr.vx,pr.vz));rotX(-Math.atan2(pr.vy||0,Math.hypot(pr.vx,pr.vz)));
  if(st==='frost'){line([0,0,s*2],[-s,0,-s],1.7,c);line([0,0,s*2],[s,0,-s],1.7,c);line([-s,0,-s],[s,0,-s],1,c,.6);}
  else if(st==='fire'){for(const sign of [-1,1]){line([0,0,s],[sign*s,2,-s],3,c,.85);line([sign*s,2,-s],[0,5,-s*4],1.7,c,.4);}}
  else if(st==='void'){diamond(0,0,0,s,c);line([0,0,0],[Math.sin(t*12)*s,Math.cos(t*12)*s,-s*4],1.4,c,.65);}
  else if(st==='holy'){line([-s*1.6,0,0],[s*1.6,0,0],1.5,c);line([0,-s*1.6,0],[0,s*1.6,0],1.5,c);line([0,0,0],[0,0,-s*4],2,c,.5);}
  else if(st==='poison'){for(let j=0;j<3;j++)diamond(Math.sin(t*5+j*2)*s,Math.cos(t*5+j*2)*s,-j*5,3,c);}
  else if(st==='wind'){for(let j=0;j<3;j++)line([-s,j*3,-j*7],[s,j*3,-j*7-6],1.2,c,.6);}
  else{line([0,0,s],[0,0,-s*4],1.2,c,.6);for(const sign of [-1,1])line([0,0,-s*2],[sign*s*.6,0,-s*3],1,c,.6);}
  popM();
 }
 return count;
}
root.BF_HOSTILE_ART={render,impact,tick,types,colors,replacesWave};
})(window);
