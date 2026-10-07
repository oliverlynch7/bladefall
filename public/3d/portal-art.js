// Secondary modes share the authored architecture, but have their own art identity.
import {wantsDeep,deepReady,loadDeep,buildDeep} from './deep-art.js?v=2135';
const accents={plains:'#abc77c',forest:'#91bd8a',badlands:'#e1a96c',canyon:'#dbbc83',ruins:'#d88169',dungeon:'#b98a79',frost:'#9adfee',volcano:'#ff994d',void:'#c397f1',marble:'#edce86',apex:'#bca0e1'};
const descentStone={
 plains:['#55565c','#595b61','#51535a','#5d5e63'],forest:['#4b5554','#515c58','#48514f','#57615b'],
 canyon:['#625c59','#675f5a','#5e5857','#6b625b'],ruins:['#58525d','#5d5661','#554f5b','#625966'],
 frost:['#50606e','#566573','#4c5b69','#5a6a76'],volcano:['#5e4d4d','#624f4d','#59494c','#695552'],
 void:['#514c60','#574f66','#4e495c','#5c526a'],marble:['#64646e','#6b6b74','#60616b','#70707a'],
 apex:['#474451','#4c4856','#43404e','#514b5b']
};
export function portalMode(w){return w.endless?'descent':w.bossRush?'gauntlet':w.arena?'arena':w.bonus?'sprint':null;}
function adapt(w){
 const mode=portalMode(w),zone=mode==='descent'?'abyss':mode==='sprint'?'palace':w.arenaLava?'ember':'castle';
 const lamp=mode==='sprint'?'#ffdc83':accents[w.theme]||'#dd976c';
 const names={descent:'Abyssal Descent · The Sunken Orrery',gauntlet:'The Gauntlet · Court of Crowns',arena:'The Arena · The Ashen Lists',sprint:'Treasure Sprint · The Gilded Run'};
 return {...w,zone,hub:false,trial:false,arena:false,bonus:false,delve:false,endless:false,bossRush:false,portalMode:mode,
  portalProfile:{name:names[mode],lamp,sun:mode==='descent'?'#cfbfe8':mode==='sprint'?'#f4d69a':'#dfd3d6',
   ...(mode==='descent'?{palette:descentStone[w.theme]||descentStone.void,body:'#4c4854',hazard:['#080711','#291a3b']}:{}),
   ...(mode==='sprint'?{palette:['#6a656b','#777178','#5c5963','#898078'],body:'#46414e',fog:'#24263d',sky:[.12,.14,.23],sunGlow:[.11,.08,.05],hazard:['#14152b','#303054'],emissive:'#080914'}:{})},
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
 if(mode==='descent'){
  const layout=w.endlessLayout||'court',bx=(b.minX+b.maxX)/2,bz=(b.minZ+b.maxZ)/2;
  let posts=[];
  if(layout==='cross')posts=[[-660,-400],[660,-400],[-660,350],[660,350],[-260,-540],[260,-540]];
  else if(layout==='march')posts=[[-470,-520],[470,-520],[-470,-190],[470,-190],[-470,180],[470,180],[-470,520],[470,520]];
  else if(layout==='span')posts=[[-550,-220],[550,-220],[-550,390],[550,390],[-280,-610],[280,-610],[-260,-350],[260,-350]];
  else posts=[[-585,-375],[585,-375],[-585,375],[585,375],[0,-525]];
  for(const [x,z] of posts){part('pillar',x,-18,z,52,245,52);part('glow',x,229,z,27,11,27,a.portalProfile.lamp);part('crag',x,300,z,38,68,38);}
  for(const o of w.obstacles||[])if(o.descentCover){
   const long=Math.max(o.w,o.d),alongX=o.w>=o.d,n=Math.max(1,Math.ceil(long/54)),step=long/n;
   for(let i=0;i<n;i++){
    const offset=-long/2+(i+.5)*step,x=o.x+(alongX?offset:0),z=o.z+(alongX?0:offset);
    const h=(o.h||90)*(n===1?1:.88+(i%3)*.05),ww=alongX?step-1:o.w,dd=alongX?o.d:step-1;
    part('pillar',x,h/2,z,ww,h,dd);
    part('cap',x,h+5,z,ww+6,8,dd+6);
   }
   part('rune',o.x,(o.h||90)*.65,o.z+(o.d||40)/2+3,Math.min(34,o.w*.55),31,5,a.portalProfile.lamp);
  }
  if(layout==='span')for(const z of [-310,-420])for(const x of [-255,255]){
   part('stone',x,105,z,38,170,38);part('rune',x,207,z,45,45,45,a.portalProfile.lamp);
  }
  if(layout==='court'){
   for(const x of [-440,440])for(const z of [-270,0,270])part('rubble',x,12,z,64,35,58);
   for(const x of [-220,220])for(const z of [-95,95])part('ring',x,265,z,82,82,82);
  }
  if(layout==='cross')for(const x of [-590,590]){part('ring',x,285,0,108,108,108);part('rune',x,285,0,108,108,108,a.portalProfile.lamp);}
  if(layout==='march')for(const z of [-340,0,340]){
   for(const x of [-480,480])part('rune',x,155,z,58,58,58,a.portalProfile.lamp);
   part('stone',0,252,z,770,24,30);part('glow',0,265,z,520,5,8,a.portalProfile.lamp);
  }
  const gate=w.portalPos||{x:bx,z:b.minZ+105};
  part('ring',gate.x,370,gate.z-125,180,180,180);
  part('rune',gate.x,370,gate.z-125,180,180,180,a.portalProfile.lamp);
  for(const wall of w.walls||[])if(!wall.invisible){part('glow',wall.x,(wall.y0||0)+(wall.h||120)+3,wall.z,Math.max(4,wall.w-8),3,Math.max(4,wall.d-8),a.portalProfile.lamp);deco[deco.length-1].portalObstacle=wall;}
 }else if(mode==='gauntlet'||mode==='arena'){
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
  // Every safe landing gets a visible gilded edge. The gold path is a navigational language;
  // moving, crumbling and phase platforms retain their native animation and never get false static rails.
  const path=w.course||[],staticSteps=path.filter(p=>!p.mover&&!p.crumble&&!p.phase);
  for(let i=0;i<staticSteps.length;i++){
   const p=staticSteps[i],top=p.y+1.8,wid=p.w-8,dep=p.d-8;
   for(const sx of [-1,1])part('glow',p.x+sx*(p.w/2-5),top,p.z,5,3,dep,'#d5a652');
   for(const sz of [-1,1])part('glow',p.x,top,p.z+sz*(p.d/2-5),wid,3,5,'#d5a652');
   if(i%3===0||p.checkpoint){part('rune',p.x,p.y+2,p.z,Math.min(46,p.w*.42),2,Math.min(46,p.d*.42),p.checkpoint?'#fff0b9':'#b38a50');}
   if(p.checkpoint){const x=p.x+p.w/2+27;part('pillar',x,p.y-34,p.z,16,68,16);part('glow',x,p.y+9,p.z,21,8,21,'#ffe6a0');}
  }
  const peak=staticSteps.reduce((a,p)=>Math.max(a,p.y),0),center=(b.minX+b.maxX)/2;
  // A paired gateway at each section transition makes the climb, hazard crossing and descent
  // readable from a distance without enclosing the route or putting collision in the landing.
  for(const [index,section] of (w.sprintSections||[]).entries()){
   if(index===0)continue; // keep the launch view open and the first jump visible
   const p=path[section.from],previous=path[Math.max(0,section.from-1)];if(!p)continue;
   const z=(p.z+previous.z)/2,span=Math.max(190,p.w+80),color=['#f4d781','#bd9cf5','#80d3dc'][index];
   for(const side of [-1,1]){const x=p.x+side*span/2;part('pillar',x,p.y-80,z,26,150,26);part('glow',x,p.y+1,z,35,9,35,color);}
   part('rune',p.x,p.y+135,z,88,88,88,color);
  }
  for(const x of [b.minX+48,b.maxX-48])for(const z of [b.minZ+220,(b.minZ+b.maxZ)/2,b.maxZ-190]){
   part('pillar',x,peak*.35-210,z,34,420,34);part('glow',x,peak*.35+6,z,30,9,30,'#e8c781');part('crag',x,peak*.35+42,z,42,68,42);
  }
  part('ring',center,peak+135,b.minZ-75,145,145,145);part('rune',center,peak+135,b.minZ-75,145,145,145,'#f3d47a');
 }
 a.deco=deco;const result=buildDeep(scene,a);result.counts.portalArt=mode;return result;
}
