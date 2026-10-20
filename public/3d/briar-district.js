/* Homefields spatial authorship. Stable quest IDs and chest order survive the new routes. */
(function(root){'use strict';
const roads=[
 {id:'villageMill',main:true,width:140,points:[[0,470],[0,120],[120,-420],[120,-650],[280,-830],[280,-1090],[120,-1280],[120,-1450],[200,-1560],[200,-1900],[80,-2030]]},
 {id:'westSupply',width:125,points:[[-180,-400],[-900,-520],[-1450,-640],[-1730,-490],[-2200,-490],[-2510,-550]]},
 {id:'supplyWorkshop',width:125,points:[[-2510,-550],[-2380,-520],[-2250,-700],[-2160,-880],[-1860,-780],[-1460,-790]]},
 {id:'workshopOrchard',width:120,points:[[-1460,-790],[-1170,-850],[-1170,-1440],[-1670,-1440],[-2210,-1340],[-2700,-1380],[-2700,-1450]]},
 {id:'orchardMill',width:125,points:[[-2300,-1340],[-2100,-1510],[-1600,-1600],[-900,-1710],[-460,-1520],[120,-1450]]},
 {id:'granaryFront',width:120,points:[[440,350],[760,360],[1150,360],[1150,230]]},
 {id:'pastureTower',width:125,points:[[1150,360],[1500,360],[1550,-300],[1800,-530],[2030,-760],[2350,-960]]},
 {id:'towerMill',width:125,points:[[1408,-1810],[1000,-1600],[500,-1420],[120,-1450]]},
 {id:'millSouth',width:140,points:[[180,-2310],[80,-2450],[20,-2570],[50,-2700]]}
];
// These are planted/wooded ground, not tempting empty lawns. No destination is removed.
const banks=[
 {id:'southwest',x:-1990,z:560,w:1980,d:960,h:260},
 {id:'southeast',x:2250,z:690,w:1170,d:700,h:250},
 {id:'westHomeFields',x:-1950,z:-180,w:1440,d:300,h:185},
 {id:'eastHomeFields',x:2190,z:-20,w:1020,d:500,h:205},
 {id:'westernWood',x:-2510,z:-3370,w:760,d:1020,h:310},
 {id:'easternWood',x:2090,z:-3450,w:690,d:890,h:300}
];
const fences=[
 {id:'westFieldNorth',a:[-80,-720],b:[-80,-965],height:92},
 {id:'westFieldSouth',a:[-80,-1155],b:[-80,-1190],height:92},
 {id:'eastField',a:[490,-700],b:[490,-1190],height:92},
 {id:'westCommons',a:[-920,870],b:[-920,60],height:94},
 {id:'eastCommons',a:[840,840],b:[840,440],height:94},
 {id:'orchardEdge',a:[-2860,-1250],b:[-2860,-2570],height:110},
 {id:'towerEdge',a:[2710,-1000],b:[2710,-2070],height:110}
];
const jumps=[
 {x:-2210,z:-1840,y:164,w:230,d:240,start:true},
 {x:-1990,z:-1840,y:192,w:120,d:110},
 {x:-1810,z:-1950,y:224,w:150,d:120},
 {x:-1630,z:-1840,y:252,w:170,d:170,reward:true}
];
const plan={revision:2342,roads,banks,fences,jumps,
 encounters:[{id:'field-lane',purpose:'A lone raider at the fork, then a guard beside wagon cover.',at:[120,-550]},{id:'supply-raid',purpose:'Raiders occupy the stolen wagon; the caster stays behind the melee pair.',at:[-2380,-820]},{id:'pasture-watch',purpose:'A visible road guard and an airborne flank before the tower ascent.',at:[2100,-820]},{id:'orchard-ground',purpose:'Wildlife below the picking decks; the elevated reward is a traversal challenge.',at:[-2480,-2130]}],
 districts:['Village commons','Raided field lane','Workshop and supply loop','Orchard picking decks','Granary and bell ridge','Mill working yard'],
 intent:'Keep the large landscape; replace empty invitations with visible planted boundaries, two purposeful loops, a quiet working mill and an optional varied roof/deck crossing. Existing quests and recorded dialogue remain.'};
function active(g){return !!g&&g.zone===0&&g.area===0&&!['hub','side','trial','endless','delve','arena','bonusActive','sprintFun','devBriar','devKeep','bossRush'].some(k=>g[k]);}
function inside(o,b,margin=0){return Math.abs(o.x-b.x)<b.w/2+margin&&Math.abs(o.z-b.z)<b.d/2+margin;}
function lineDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
function routeNear(o,margin=0){return roads.some(r=>r.points.some((b,i)=>i&&lineDistance(o.x,o.z,r.points[i-1],b)<r.width/2+margin));}
function install(g,api={}){
 if(!active(g)||g.briarDistrict)return false;
 const craft=(model,x,z,y,w,h,d,options={})=>{const {rot=0,...rest}=options;g.deco.push({kind:'craft',model,x,z,y0:y,w,h,d,rot,options:{w,h,d,...rest},district:true,...(model==='farm-stair'?{craftId:'briar-district-stair-'+(options.steps===14?'approach':'return')}:{})});};
 const solid=(x,z,y,w,d,h,extra={})=>g.obstacles.push({kind:'col',x,z,y0:y,w,d,h,invisible:true,district:true,...extra});
 const ground=(x,z,w,d)=>{
  // Even a path's safety shoulder must stop at the real water, not bridge it.
  if(z-d/2<-2070&&z+d/2>-2280){if(z>=-2070)d=Math.min(d,2*(z+2070));else if(z<=-2280)d=Math.min(d,2*(-2280-z));else return;}
  if(d<8||g.segments.some(s=>!s.nofloor&&Math.abs(x-s.x)+w/2<=s.w/2&&Math.abs(z-s.z)+d/2<=s.d/2))return;
  g.segments.push({x,z,w,d,meadow:true,district:true});
 };
 const platform=(x,z,y,w,d,extra={})=>g.obstacles.push({kind:'plat',x,z,h:y,y0:y-12,w,d,slab:12,checkpoint:true,district:true,...extra});
 // Clear just new ground lanes, retaining authored structures, all quest props and raised routes.
 const protectedPoint=o=>(g.storyObjects||[]).some(p=>Math.hypot(p.x-o.x,p.z-o.z)<150)||(g.storyNpcs||[]).some(p=>Math.hypot(p.x-o.x,p.z-o.z)<170);
 const clearable=o=>!o.district&&!o.structure&&!o.craftOwned&&!o.interactionKey&&!o.geography&&!o.geographyBoundary&&!o.watchStair&&!o.granaryStair&&!o.orchardStair&&!o.millFrame&&!o.millGate&&!o.millCrate&&o.kind!=='plat'&&!protectedPoint(o)&&routeNear(o,36)&&((o.treeCol||o.autoCol)||['tree','bush','corn','flower','rock'].includes(o.kind));
 g.obstacles=g.obstacles.filter(o=>!clearable(o));g.deco=g.deco.filter(o=>!clearable(o));
 // New loops use continuous soil. The millrace itself is never covered.
 for(const r of roads)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/100);
  for(let k=0;k<=n;k++){const t=k/n;ground(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r.width+90,r.width+90);}
 }
 // The bank's central core stays within the visible mound. Trees reuse the current asset family.
 const blocked=[];
 for(const b of banks){
  const occupied=[...(g.storyObjects||[]),...(g.storyNpcs||[]),...(g.chests||[]).filter(o=>!o.enemyReward&&!o._coopChest),...(g.healpads||[])].some(o=>inside(o,b,110));
  if(occupied){blocked.push(b.id);continue;}
  craft('bank',b.x,b.z,-8,b.w,b.h,b.d,{grass:true});
  solid(b.x,b.z,0,b.w*.58,b.d*.58,b.h*.62,{districtBank:b.id});
  // Enclosed planted land has a continuous visible boundary, not invisible corner blockers.
  for(const vertical of [false,true])for(const side of [-1,1]){const len=vertical?b.d:b.w,n=Math.ceil(len/220);
   solid(b.x+(vertical?side*b.w/2:0),b.z+(vertical?0:side*b.d/2),0,vertical?16:len,vertical?len:16,122,{districtField:b.id});
   for(let k=0;k<n;k++){const t=(k+.5)/n-.5,x=b.x+(vertical?side*b.w/2:t*b.w),z=b.z+(vertical?t*b.d:side*b.d/2);
    craft('barricade',x,z,0,len/n,122,26,{rot:vertical?Math.PI/2:0});}
  }
 }
 // Continuous rails define working farm lanes rather than a corridor of floating platforms.
 for(const f of fences){const [x1,z1]=f.a,[x2,z2]=f.b,vertical=x1===x2,len=Math.hypot(x2-x1,z2-z1),n=Math.ceil(len/190);
  solid((x1+x2)/2,(z1+z2)/2,0,vertical?16:len,vertical?len:16,f.height,{districtFence:f.id});
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t,w=vertical?16:len/n,d=vertical?len/n:16;
   craft('barricade',x,z,0,len/n,f.height,26,{rot:vertical?Math.PI/2:0});}
 }
 // Widened watchtower stairs replace the large discontinuous approach steps.
 g.obstacles=g.obstacles.filter(o=>!(o.kind==='plat'&&o.x===2350&&o.terrace&&o.w===200&&o.z<=-1080&&o.z>=-1680));
 for(let i=1;i<=14;i++){const y=i*12,z=-1000-i*50;platform(2350,z,y,190,52,{districtTowerStair:true,invisible:true});}
 craft('farm-stair',2350,-1000,0,190,168,700,{steps:14,rot:Math.PI});
 // A different stair descends west: optional exploration genuinely rejoins the mill approach.
 for(let i=1;i<=24;i++){const x=2080-i*28,y=168-i*7;platform(x,-1810,y,30,144,{districtTowerReturn:true,invisible:true});}
 craft('farm-stair',1408,-1810,0,144,168,672,{steps:24,rot:Math.PI/2});
 ground(1408,-1810,250,250);
 // Relocate one EXISTING gear chest onto a short, varied elevated picking-deck route.
 const chest=g.chests.find(o=>o.x===-2210&&o.z===-1840&&o.y===164);
 if(chest){api.chestKey?.(chest);const end=jumps.at(-1);chest.x=end.x;chest.z=end.z;chest.y=end.y;}
 for(const p of jumps.slice(1)){platform(p.x,p.z,p.y,p.w,p.d,{districtJump:true,invisible:true});craft('scaffold',p.x,p.z,p.y-7,p.w,p.y-12,p.d,{rails:false});}
 // Clear the approach to the new orchard landings; never place a ground enemy on their tops.
 g.deco=g.deco.filter(o=>o.district||!['tree','rock'].includes(o.kind)||!jumps.slice(1).some(p=>Math.abs(o.x-p.x)<p.w/2+90&&Math.abs(o.z-p.z)<p.d/2+90));
 g.obstacles=g.obstacles.filter(o=>o.district||!o.treeCol||!jumps.slice(1).some(p=>Math.abs(o.x-p.x)<p.w/2+50&&Math.abs(o.z-p.z)<p.d/2+50));
 // A timber wagon at the lane's edge is physical cover, not scenery across the road.
 craft('wagon',440,-1040,0,110,95,85,{freight:true});solid(440,-1040,0,112,86,78,{districtCover:true});
 g.briarJourney.paths=g.briarJourney.paths.filter(p=>p.points.some(q=>q[1]<-2040));
 g.briarJourney.paths.push(...roads.map(r=>({width:r.width,points:r.points.map(p=>[...p,0])})));
 // Keep actual stairs on the plan as elevation-aware lines; no dirt painted through their steps.
 const stairUp=Array.from({length:15},(_,i)=>[2350,-1000-i*50,i*12]);
 const stairDown=Array.from({length:25},(_,i)=>[2080-i*28,-1810,168-i*7]);
 g.briarDistrict={revision:plan.revision,blockedBanks:blocked,roads:roads.map(r=>({...r,points:r.points.map(p=>[...p,0])})),stairUp,stairDown,jumps:jumps.map(p=>({...p})),chestMoved:!!chest};
 g.homefieldsExploration.revision=plan.revision;
 // Authored lane positions. Preserve every existing enemy, quest guard and refill identity.
 const first=g.enemies.filter(e=>e.type==='grunt'&&!e.elite&&!e.homeRaid&&e.z>-650).sort((a,b)=>a.mid-b.mid).slice(0,2);
 for(const [i,e]of first.entries())Object.assign(e,{x:i?300:120,z:i?-1120:-550,sx:i?300:120,sz:i?-1120:-550,briarRoleHint:i?'guard':'runner',briarEncounter:'field-lane'});
 const seat=(e,x,z,id)=>{if(e)Object.assign(e,{x,z,sx:x,sz:z,briarEncounter:id});};
 const raiders=g.enemies.filter(e=>e.homeRaid==='runner');seat(raiders[0],-2410,-790,'supply-raid');seat(raiders[1],-2440,-1060,'supply-raid');
 seat(g.enemies.find(e=>e.homeRaid==='caster'),-2190,-980,'supply-raid');seat(g.enemies.find(e=>e.homeRaid==='heavy'),-2060,-730,'supply-raid');
 for(const e of g.enemies.filter(e=>e.homefieldsWing&&e.x>1800))seat(e,e.type==='flyer'?2160:2100,e.type==='flyer'?-620:-820,'pasture-watch');
 for(const e of g.enemies.filter(e=>e.homefieldsOrchard))e.briarEncounter='orchard-ground';
 for(const e of g.enemies){if(e.type==='caster')e.briarRoleHint='hex';else if(e.type==='grunt'&&!e.briarRoleHint)e.briarRoleHint=e.homeRaid==='runner'||e.x>1800?'runner':'guard';}
 g._obsDirty=true;return true;
}
function recoverLoot(g,ch){
 if(!active(g)||!g.briarDistrict||!ch?.enemyReward||!banks.some(b=>!g.briarDistrict.blockedBanks.includes(b.id)&&inside(ch,b,28)))return false;
 let best=null,distance=Infinity;
 for(const r of roads)for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((ch.x-a[0])*dx+(ch.z-a[1])*dz)/(dx*dx+dz*dz||1))),x=a[0]+dx*t,z=a[1]+dz*t,d=Math.hypot(ch.x-x,ch.z-z);if(d<distance){distance=d;best={x,z,y:0};}}
 if(!best)return false;Object.assign(ch,best);return true; // retain rewardKey and the original personal roll
}
function fallback(g,bx){
 if(!active(g)||!g.briarDistrict)return;
 const w=root.__world3d?.();if(root.HERO3D?.on&&root.HERO3D?.ready&&w?.on&&w?.ready&&root.BFCampaignCraft?.has('briar-district-stair-approach'))return;
 for(const b of banks)for(let i=0;i<3;i++)bx(b.x,b.h*(i+.5)/3-8,b.z,b.w*(1-i*.29),b.h/3,b.d*(1-i*.29),i===2?'#80a355':'#657d45');
 for(const o of g.obstacles.filter(o=>o.district===true)){
  if(o.kind==='plat'){bx(o.x,o.h-6,o.z,o.w,12,o.d,'#a57546');if(o.districtJump)for(const x of [-o.w*.38,o.w*.38])for(const z of [-o.d*.38,o.d*.38])bx(o.x+x,(o.h-12)/2,o.z+z,8,o.h-12,8,'#60472e');}
  else if(o.districtField||o.districtFence){const vertical=o.d>o.w,len=vertical?o.d:o.w,n=Math.ceil(len/130);for(let i=0;i<=n;i++){const u=i/n-.5;bx(o.x+(vertical?0:u*o.w),o.h/2,o.z+(vertical?u*o.d:0),8,o.h,8,'#805a36');}for(const y of [.3,.68])bx(o.x,o.h*y,o.z,vertical?7:o.w,7,vertical?o.d:7,'#a77749');}
  else if(o.districtCover){bx(o.x,36,o.z,110,55,80,'#8c633c');for(const x of [-45,45])for(const z of [-32,32])bx(o.x+x,20,o.z+z,10,40,40,'#493c2e');}
 }
}
const api={plan,active,install,inside,lineDistance,routeNear,recoverLoot,fallback};root.BFBriarDistrict=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
