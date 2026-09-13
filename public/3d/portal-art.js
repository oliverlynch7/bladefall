// Secondary modes share the authored architecture, but have their own art identity.
import {wantsDeep,deepReady,loadDeep,buildDeep} from './deep-art.js?v=1967';
const accents={plains:'#abc77c',forest:'#91bd8a',badlands:'#e1a96c',canyon:'#dbbc83',ruins:'#d88169',dungeon:'#b98a79',frost:'#9adfee',volcano:'#ff994d',void:'#c397f1',marble:'#edce86',apex:'#bca0e1'};
export function portalMode(w){return w.endless?'descent':w.bossRush?'gauntlet':w.arena?'arena':w.bonus&&w.sprintFun?'sprint':null;}
function adapt(w){
 const mode=portalMode(w),zone=mode==='descent'?'abyss':mode==='sprint'?'palace':w.arenaLava?'ember':'castle';
 const lamp=mode==='sprint'?'#ffdc83':accents[w.theme]||'#dd976c';
 const names={descent:'Abyssal Descent · The Sunken Orrery',gauntlet:'The Gauntlet · Court of Crowns',arena:'The Arena · The Ashen Lists',sprint:'Treasure Sprint · The Gilded Run'};
 return {...w,zone,hub:false,trial:false,arena:false,bonus:false,delve:false,endless:false,bossRush:false,portalMode:mode,
  portalProfile:{name:names[mode],lamp,sun:mode==='descent'?'#cfbfe8':mode==='sprint'?'#fff0cc':'#dfd3d6'},
  // The arena's y=0 segment is lava, not a safe stone platform.
  segments:w.arenaLava?[]:w.segments};
}
export const wantsPortal=w=>!!portalMode(w)&&!w.hub&&wantsDeep(adapt(w));
export const portalReady=w=>deepReady(adapt(w));
export const loadPortal=w=>loadDeep(adapt(w));
export function buildPortal(scene,w){
 const a=adapt(w),mode=a.portalMode,b=w.bounds||{minX:-470,maxX:470,minZ:-470,maxZ:470};
 const deco=(mode==='descent'||mode==='gauntlet'?[]:w.deco||[]).slice();
 const part=(name,x,y,z,ww,hh,dd=ww,c)=>deco.push({portalPart:name,x,y0:y,z,w:ww,h:hh,d:dd,c});
 if(mode==='descent'||mode==='gauntlet'||mode==='arena'){
  const cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2,rx=(b.maxX-b.minX)/2+150,rz=(b.maxZ-b.minZ)/2+150;
  for(let i=0;i<12;i++){
   const theta=i*Math.PI/6,x=cx+Math.sin(theta)*rx,z=cz+Math.cos(theta)*rz;
   part('pillar',x,-24,z,65,270,65);
   part('glow',x,235,z,30,13,30,a.portalProfile.lamp);
   if(mode==='descent')part('crag',x,310+(i%3)*22,z,34,70,34);
   else part('furnace',x,150,z,34,64,20);
  }
  // Suspended coronas stay above the combat silhouette and beyond the north wall.
  part('ring',cx,480,b.minZ-180,220,220,220);
  part('rune',cx,480,b.minZ-180,220,220,220,a.portalProfile.lamp);
  for(const wall of w.walls||[]){
   if(wall.invisible)continue;
   part('glow',wall.x,(wall.y0||0)+(wall.h||120)+3,wall.z,Math.max(4,wall.w-8),3,Math.max(4,wall.d-8),a.portalProfile.lamp);deco[deco.length-1].portalObstacle=wall;
  }
 }else if(mode==='sprint'){
  // Distant guide pylons follow the course. Moving platforms, timers and rewards stay owned by gameplay.
  const platforms=(w.obstacles||[]).filter(o=>o.kind==='plat'&&!o.invisible);
  for(let i=0;i<platforms.length;i+=Math.max(1,Math.ceil(platforms.length/14))){const p=platforms[i],x=p.x+(i%2?1:-1)*((p.w||80)/2+100),y=(p.h||0)-160;
   part('pillar',x,y,p.z,24,150,24);part('glow',x,y+146,p.z,24,7,24,'#ffdf92');}
 }
 a.deco=deco;const result=buildDeep(scene,a);result.counts.portalArt=mode;return result;
}
