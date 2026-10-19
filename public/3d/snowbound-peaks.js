/* Snowbound Peaks: mountain routes shared by collision, scenery and route QA. */
(function(root){
 'use strict';
 const paths={
  climb:[[0,300,0],[-250,-350,40],[-800,-750,130],[-1120,-1350,230],[-660,-1830,330],[0,-2020,380]],
  liftHouse:[[-800,-750,130],[-1600,-800,160],[-2040,-1300,220],[-2030,-1920,300],[-1470,-2240,380],[0,-2020,380]],
  sheltered:[[-2040,-1300,220],[-1600,-1460,260],[-1120,-1350,230]],
  summit:[[0,-2620,380],[560,-2920,440],[1120,-3300,510],[1180,-3910,590],[520,-4300,680],[0,-4720,740]],
  camp:[[560,-2920,440],[180,-3230,480],[-420,-3600,540],[-920,-3950,580]],
  campReturn:[[-920,-3950,580],[-920,-4350,580],[-620,-4690,680],[0,-4720,740]],
  roof:[[-660,-1830,330],[-480,-1620,380],[-160,-1620,450],[160,-1750,510],[0,-2000,550]],
  recovery:[[-520,-1600,310],[-120,-1510,350],[370,-1740,370],[0,-2020,380]],
  cave:[[0,-4720,740],[-260,-5030,740],[-260,-5400,740]]
 };
 // Uneven, separate landings make the optional camp reward a physical climb.
const campRidge=[
  {x:-1105,z:-3850,y:605,w:112,d:108,checkpoint:true},
  {x:-1250,z:-3780,y:650,w:96,d:100},
  {x:-1180,z:-3635,y:690,w:82,d:94},
  {x:-1060,z:-3515,y:725,w:92,d:88,checkpoint:true},
  {x:-935,z:-3440,y:760,w:82,d:96},
  {x:-805,z:-3460,y:790,w:82,d:92},
 {x:-600,z:-3530,y:810,w:260,d:180,checkpoint:true}
];
// The cave is below this broken cornice. Its staggered stone shelves require
// deliberate jumps; the broad summit and cave path remain safe recovery routes.
const corniceRidge=[
 {x:110,z:-4880,y:775,w:130,d:120,checkpoint:true},
 {x:245,z:-4990,y:810,w:98,d:100},
 {x:180,z:-5130,y:845,w:88,d:94},
 {x:65,z:-5190,y:885,w:96,d:86,checkpoint:true},
 {x:-50,z:-5115,y:925,w:84,d:96},
 {x:-185,z:-5200,y:965,w:215,d:160,checkpoint:true}
];
 function build({G,seg,plat,solid,spawn}){
  for(const key of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates','pads','shockwaves','trails'])G[key]=[];
  Object.assign(G,{haz:'gusts',thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true,canyonWind:null});
  G.peaks={revision:2010,walks:{},crossing:false,lift:false,campRidge,corniceRidge};
  G.areaName='Frostfell · Snowbound Peaks';G.campaignLayout={revision:2010,experience:{title:'Snowbound Peaks',objectives:['Follow Ellis’s trail','Repair Heath’s shelter','Climb above the buried cave']}};
  function route(id,width=270){const p=paths[id],walk=[];for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/95,Math.abs(b[2]-a[2])/15));for(let k=0;k<=n;k++){const v=a.map((x,i)=>x+(b[i]-x)*k/n);if(v[2]<1)seg(v[0],v[1],width,width);else plat(v[0],v[1],v[2],width,width,{slab:26,checkpoint:true,mountainPath:true});walk.push(v);}}G.peaks.walks[id]=walk;}
  for(const id of Object.keys(paths))if(id!=='roof')route(id,id==='sheltered'?220:280);
  G.peaks.walks.roof=[];
  for(let j=1;j<paths.roof.length;j++){const a=paths.roof[j-1],b=paths.roof[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/150,Math.abs(b[2]-a[2])/40));for(let k=0;k<=n;k++){const v=a.map((x,i)=>x+(b[i]-x)*k/n);plat(v[0],v[1],v[2],95,95,{slab:22,checkpoint:true});G.peaks.walks.roof.push(v);}}
  for(const [i,q]of campRidge.entries()){
   plat(q.x,q.z,q.y,q.w,q.d,{slab:30,checkpoint:!!q.checkpoint,campRidge:true});
   // The frost art layer renders these existing rock and survey-timber forms;
   // their collision tops agree with the white landing surfaces.
   G.deco.push({kind:'mountainBoulder',x:q.x,z:q.z,y0:q.y-73,w:q.w*1.24,h:73,d:q.d*1.2,c:'#758c9a'});
   if(i>0&&i<campRidge.length-1)G.deco.push({kind:'mountainTimber',x:q.x+q.w*.32,z:q.z,y0:q.y-47,w:10,h:55,d:12,c:'#7a6855'});
  }
  for(const [i,q]of corniceRidge.entries()){
   plat(q.x,q.z,q.y,q.w,q.d,{slab:30,checkpoint:!!q.checkpoint,corniceRidge:true});
   G.deco.push({kind:'mountainBoulder',x:q.x,z:q.z,y0:q.y-73,w:q.w*1.22,h:73,d:q.d*1.2,c:i===corniceRidge.length-1?'#688497':'#849baa'});
  }
  const rooms=[['Mountain Foot',0,250,0,760,750],['Trail Shelter',-800,-750,130,590,490],['Abandoned Lift House',-2040,-1300,220,600,640],['Heath’s Shelter',0,-2020,380,720,660],['Far Landing',0,-2670,380,550,430],['Snow Bowl',1120,-3500,540,640,700],['Buried Camp',-920,-3950,580,680,650],['Signal Crown',0,-4720,740,900,640],['Cave Mouth',-260,-5380,740,500,440]];
  for(const [name,x,z,y,w,d]of rooms){G.rooms.push({name,x,z,y,w,d,monsters:[],encounter:false,cleared:true});if(y)plat(x,z,y,w,d,{slab:28,checkpoint:true,mountainPath:true});else seg(x,z,w,d);}
  // Rock shoulders frame the climb, away from walking lines. No global ice maze.
  for(const [x,z,y,w,d]of [[550,150,430,330,750],[-650,420,300,240,430],[-170,-1100,560,460,730],[-2670,-1300,640,350,1100],[-2160,-2320,670,400,480],[650,-2110,810,300,650],[-750,-2870,800,440,460],[1650,-3160,1020,320,650],[1750,-4160,1180,400,600],[-1600,-4050,980,400,760],[850,-4910,1210,420,700],[-970,-5190,1120,340,730]])plat(x,z,y,w,d,{terrain:true});
  function shelter(x,z,y,w=290,d=250){for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])G.deco.push({x:x+dx,z:z+dz,y0:y,w:16,h:136,d:16,c:'#725b42',kind:'mountainTimber'});G.deco.push({x,z,y0:y+136,w:w+30,h:16,d:d+40,c:'#ad9c7f',kind:'mountainAwning',underPlayerOnly:true});}
  shelter(-800,-790,130);shelter(-2040,-1370,220,360,310);shelter(0,-2070,380,340,300);
  // The roof reward sits behind the torn flag, reached along the outside ridge.
  plat(0,-2020,550,270,240,{slab:16,checkpoint:true,roofShard:true});
  for(const [x,z,y]of [[-500,-360,70],[-1230,-1420,250],[-1620,-2150,380],[730,-3070,470],[1220,-3910,590],[-620,-4380,650]])G.deco.push({x,z,y0:y,w:18,h:110,d:18,c:'#8d7355',kind:'mountainTimber'});
  for(const [x,z,y]of [[-300,230,0],[-1080,-690,130],[-2300,-1390,220],[300,-2030,380],[-1020,-3700,580],[-1170,-4000,580],[1400,-3540,540],[230,-4770,740]])G.deco.push({kind:'snowPine',x,z,y0:y,w:80,h:170,d:80,c:'#9bb1ad'});
  // The retired marker frame used to cross the normal camera directly above
  // the notebook. Keep a low broken survey fence beside the first landing.
  for(const [x,z]of [[-1150,-3970],[-1070,-3970]])G.deco.push({kind:'mountainTimber',x,z,y0:580,w:12,h:52,d:12,c:'#8b7154'});
  G.deco.push({kind:'mountainTimber',x:-1110,z:-3970,y0:617,w:93,h:9,d:12,c:'#96816a'});
  for(const [x,z,y]of [[-800,-710,130],[95,-2010,380],[-1010,-4000,580]])G.deco.push({kind:'mountainCamp',x,z,y0:y,w:180,h:55,d:190,c:'#86715a'});
  // Hand-placed boulders mark safe shelf edges without covering clues or the walking line.
  for(const [x,z,y,w,h]of [[-100,320,0,100,50],[-490,-440,70,90,65],[-990,-910,170,100,70],[-1270,-1200,220,110,80],[-1790,-850,175,100,55],[-2260,-1680,260,110,90],[-400,-1840,365,130,80],[280,-2160,380,90,60],[330,-2820,400,110,80],[930,-3070,480,100,70],[1380,-3700,540,130,80],[800,-4220,630,95,65],[-700,-3710,570,100,70],[-1250,-4240,580,120,80],[-320,-4690,740,130,70],[260,-4940,740,110,70]])G.deco.push({kind:'mountainBoulder',x,z,y0:y,w,h,d:w*.85,c:'#8a9ca6'});
  G.storyNpcs=[{id:'heath',name:'Heath',x:0,z:-1960,y:380}];
  const obj=(key,label,x,z,y,kind='sign')=>({key,label,x,z,y,kind});
  G.storyObjects=[obj('ff.trail','Read the scratched trail sign',-790,-640,133),obj('ff.part','Take the loose heater coil',-150,-2110,380,'part'),obj('ff.heater','Fit the coil to the crossing winch',115,-2120,380,'heater'),obj('ff.lift','Lower the return steps',-1470,-2190,380,'lever'),obj('ff.reflect.clue','Read the cornice marker',0,-4570,740),obj('ff.reflect.3','Release the cornice anchor',-185,-5200,965,'anchor'),obj('ff.cave','Enter the exposed ice cave',-260,-5280,740,'entrance'),obj('ff.camp','Read the explorer’s notebook',-930,-3800,580),obj('ff.camp.release','Release the survey rig above the camp',-500,-3530,810,'lever'),obj('ff.cache','Open the explorer’s exposed chest',-680,-3530,810,'chest')];
  G.peaks.trailMarks=[[-300,-430,55],[-940,-1050,170],[-1040,-1530,270],[-540,-1870,350]];
  G.canyonWind={time:0,vanes:[{x:-2250,z:-1850,y:290,until:0}],zones:[{x:-2050,z:-1800,y:290,r:250}]};G.canyonWind.zones[0].vane=0;
  for(const [x,z,y]of [[-690,-640,130],[180,-1900,380],[1100,-3730,579]])G.healpads.push({x,z,y,r:32,charge:1,_acc:0,locked:x===180});
  for(const [type,x,z,y]of [['frostling',-290,-340,40],['frostling',-350,-450,55],['grunt',-2200,-1210,220],['frostling',-2020,-1870,290],['frostling',-940,-3810,580],['frostling',900,-3400,535],['grunt',-200,-4550,740],['frostling',-1110,-1250,215],['grunt',-1960,-1160,220],['caster',-2150,-1470,220],['frostling',1050,-3320,520],['frostling',1180,-3560,540],['caster',1060,-3660,540],['grunt',250,-4450,700],['caster',-150,-4750,740]]){const e=spawn(type,x,z,false);if(e){e.y=y;e.homeY=y;}}
  G.bounds={minX:-2900,maxX:2080,minZ:-5680,maxZ:730};G.progressEnd=-5500;G.portalPos={x:-260,z:-5480,y:740};G.goalPos={...G.portalPos};G.startPos={x:0,z:350};G.lastSafe={x:0,z:350,y:0};Object.assign(G.p,{x:0,z:350,y:0,vy:0});
 }
 const ready=s=>!!s.flags['ff.cave'];
 function sync({G,state:s,plat,openWay,toast,sound}){if(!G.peaks)return;const f=s.flags,p=G.peaks;
  // A pre-ridge save can retain the old post-order clue. Keep its discovery,
  // but point the player at the route that now exists.
  const ridgeNote='The notebook says: “Our chest is under the rig’s snow cover. Reach the anchor above camp and let the cover fall.” The broken ledges climb toward it.';
  if(f['ff.camp.found']&&s.notes?.['ff.camp']&&s.notes['ff.camp'].text!==ridgeNote)s.notes['ff.camp'].text=ridgeNote;
  const corniceNote='The cave mouth is buried beneath an unstable snow cornice. Follow the broken stone shelves above the entrance and release the brass anchor. The snow will slide away below you.';
  if(f['ff.reflect.clue']&&s.notes?.['ff.reflect']&&s.notes['ff.reflect'].text!==corniceNote)s.notes['ff.reflect'].text=corniceNote;
  if(s.notes?.['ff.signal']&&s.notes['ff.signal'].text!==corniceNote)s.notes['ff.signal'].text=corniceNote;
  if(p.corniceWasOpen===undefined)p.corniceWasOpen=!!f['ff.reflect.open'];
  else if(f['ff.reflect.open']&&!p.corniceWasOpen)p.corniceReleaseAt=G.time;
  p.corniceWasOpen=!!f['ff.reflect.open'];
  if(p.coverWasOpen===undefined)p.coverWasOpen=!!f['ff.camp.open'];
  else if(f['ff.camp.open']&&!p.coverWasOpen)p.coverReleaseAt=G.time;
  p.coverWasOpen=!!f['ff.camp.open'];
  if(f['ff.heater']&&!p.crossing){p.crossing=true;plat(0,-2370,380,260,620,{slab:20,bridge:true,checkpoint:true});}
  if(f['ff.lift']&&!p.lift){p.lift=true;const n=22;for(let j=0;j<=n;j++)plat(-1470+670*j/n,-2240+1490*j/n,380-250*j/n,180,180,{slab:18,checkpoint:true});}
  const heal=G.healpads.find(x=>x.x===180);if(heal)heal.locked=!f['ff.heater'];
  for(const [id,msg]of [['ff.trail','Scratched arrows lead uphill to Heath’s shelter. Clue added to your journal.'],['ff.part','Heater coil recovered. Fit it into the empty socket on the crossing winch.'],['ff.reflect.clue','The cave is below the unstable cornice. Climb the broken shelves to release its anchor.'],['ff.camp.found','The old survey ledges lead above the camp. Release the anchor at the top.']])if(f[id]&&!p[id]){p[id]=true;toast?.(msg);}
  for(const [id,msg]of [['ff.heater','Shelter repaired. The crossing is down; the small healing pad has a limited charge.'],['ff.lift','Return steps lowered. A short path now leads down to the trail shelter.'],['ff.reflect.open','The anchor gives way. The cornice slides off the cave entrance below.'],['ff.camp.open','The rig snaps free. Its snow cover slides off the chest above the camp.'],['ff.cache','Winter cloak found. Reach Deep Ice Caves to keep it.']])if(f[id]&&!p[id]){p[id]=true;toast?.(msg);sound?.('lever');}
  if(ready(s)){G.qs['ff.peaks']=1;openWay();}
 }
 function quest(s){const f=s.flags;return !f['ff.part']?'Find the loose heater coil beside the frozen crossing':!f['ff.heater']?'Fit the coil into the crossing winch by Heath’s shelter':!f['ff.reflect.open']?'Jump up the stone shelves and release the cornice anchor':!f['ff.cave']?'Enter the cave now that the snow has fallen away':'Enter Deep Ice Caves to find Ellis';}
 function shards(s){return [{id:'FF-01',x:0,z:-2110,y:550},...(s.flags['ff.cache']?[{id:'FF-02',x:-680,z:-3485,y:810}]:[])];}
 function wind(time){const t=((time%12)+12)%12;return t<5?{push:0,phase:'calm'}:t<7?{push:0,phase:'warning'}:{push:Math.sin((t-7)/5*Math.PI)*.9,phase:'gust'};}
 function draw({G,state:s,bx,pushM,mv,rotY,rotX,popM},t){if(!G.peaks)return;const f=s.flags;
  for(const [x,z,y]of G.peaks.trailMarks){for(const dx of [-17,17])for(let j=0;j<4;j++)bx(x+dx,y+3,z-j*24,7,3,14,'#557788');}
  for(const o of G.storyObjects){if(root.BFCampaignObjects?.drawn(o)&&o.kind!=='chest')continue;const y=o.y;
   if(o.kind==='part'){if(!f['ff.part']){bx(o.x,y+18,o.z,86,30,65,'#695c50');for(let j=0;j<4;j++)bx(o.x-27+j*18,y+41,o.z,10,18,32,'#bea06b');bx(o.x,y+54,o.z,60,5,35,'#d9bd79');}}
   else if(o.kind==='heater')continue;
   else if(o.kind==='chest'){
    if(!root.BFCampaignObjects?.drawn(o)){bx(o.x,y+21,o.z,107,42,66,'#655b50');bx(o.x,y+(f['ff.cache']?68:47),o.z,112,11,72,'#c0c9c4');
    for(const dx of [-37,37])bx(o.x+dx,y+23,o.z+34,7,45,4,'#9bafbd');}
    const drop=f['ff.camp.open']?(G.peaks.coverReleaseAt===undefined?1:Math.min(1,Math.max(0,(G.time-G.peaks.coverReleaseAt)/.8))):0;
    if(drop<1){const ox=o.x+drop*96,oy=y-drop*90,oz=o.z+drop*36;bx(ox,oy+92,oz,132,13,88,'#d4e3e4');bx(ox,oy+101,oz,126,7,82,'#e8efed');for(const dx of [-51,51])bx(ox+dx,oy+92,oz+46,8,20,5,'#8ca6aa');}
   }
   else if(o.key==='ff.camp.release'){bx(o.x,y+26,o.z,26,52,22,'#73634f');bx(o.x,y+57,o.z,70,15,34,f['ff.camp.open']?'#8b9ca0':'#c7a66c');bx(o.x,y+72,o.z,16,25,14,'#d3c294');}
   else if(o.key==='ff.camp'){bx(o.x,y+15,o.z,45,30,38,'#70604d');bx(o.x,y+32,o.z,50,4,40,'#94775b');bx(o.x,y+38,o.z,28,3,25,'#e8ddbb');bx(o.x,y+40,o.z,3,2,24,'#9b6854');}
   else if(o.kind==='anchor'){
    bx(o.x,y+22,o.z,116,42,85,'#4e687a');for(const dx of [-42,42]){bx(o.x+dx,y+54,o.z,13,42,14,'#6c5d4c');bx(o.x+dx,y+78,o.z,24,9,23,'#d3af6c');}
    bx(o.x,y+76,o.z,82,13,26,f['ff.reflect.open']?'#697b81':'#d0ad66');
    bx(o.x,y+96,o.z,25,31,20,'#a48150');bx(o.x,y+114,o.z,56,8,16,'#e0c78b');
   }
   else if(o.kind==='entrance'){
    bx(o.x,y+62,o.z-6,270,135,60,'#627e90');bx(o.x,y+55,o.z+27,158,108,5,'#102a3a');
    if(!root.__FROST_ART_ACTIVE&&(!f['ff.reflect.open']||G.peaks.corniceReleaseAt!==undefined&&G.time-G.peaks.corniceReleaseAt<.9)){
     const drop=f['ff.reflect.open']?Math.max(0,Math.min(1,(G.time-G.peaks.corniceReleaseAt)/.9)):0;
     const sx=o.x+drop*210,sy=y+58-drop*125,sz=o.z+35+drop*25;
     bx(sx,sy,sz,270,125,63,'#d6e7ec');bx(sx-72,sy+58,sz+12,118,34,48,'#eef4f1');bx(sx+73,sy+53,sz+5,105,30,44,'#f1f5f0');
    }
   }
   else {bx(o.x,y+30,o.z,16,60,16,'#796851');bx(o.x,y+68,o.z,94,44,10,'#c2b28f');for(let j=0;j<3;j++)bx(o.x,y+57+j*9,o.z+7,65-j*14,3,2,'#465965');}
  }
  // Real repaired crossing, with rails below eye height and no transparent floor layers.
  for(const z of [-2210,-2560])for(const x of [-150,150])bx(x,423,z,14,86,14,'#7b6b53');
  if(f['ff.heater'])for(let j=0;j<19;j++)bx(0,383,-2120-j*28,255,4,24,'#9b8865');
  else for(let j=0;j<14;j++)bx(0,390+j*15,-2210,255,12,16,'#7b6b53');
  bx(115,412,-2120,78,64,65,'#53606a');bx(115,418,-2086,49,35,3,f['ff.heater']?'#f6b657':'#172b35');
  for(const dx of [-16,0,16])bx(115+dx,418,-2082,9,28,5,f['ff.heater']?'#ffdc9b':'#47606a');
  bx(65,610,-2110,10,120,10,'#776a59');for(let j=0;j<6;j++)bx(34-j*12,651-j%2*7,-2110+Math.sin(t*1.4+j*.4)*5,13,31,3,'#9ba8a5');
  // The old survey posts and one continuous rope point to the next landing.
  for(const [i,q]of campRidge.entries()){
   bx(q.x+q.w*.35,q.y+21,q.z,10,42,10,'#796853');bx(q.x+q.w*.35,q.y+43,q.z,23,8,21,'#c5aa76');
   if(i<campRidge.length-1){const next=campRidge[i+1],points=[[q.x+q.w*.35,q.y+43,q.z]];
    // Turn around the reward chest, rather than running a rope through its lid.
    if(i===campRidge.length-2){const x=next.x+40,z=q.z;bx(x,next.y+21,z,10,42,10,'#796853');bx(x,next.y+43,z,23,8,21,'#c5aa76');points.push([x,next.y+43,z]);}
    points.push([next.x+next.w*.35,next.y+43,next.z]);
    for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],dx=b[0]-a[0],dz=b[2]-a[2],dy=b[1]-a[1],h=Math.hypot(dx,dz);pushM();mv((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);rotY(Math.atan2(dx,dz));rotX(-Math.atan2(dy,h));bx(0,0,0,3,3,Math.hypot(h,dy),'#7d6c55');popM();}
   }
  }
  // Rock lip, timber pegs and one continuous safety rope make the jump line
  // legible from the summit without laying down an invisible ground ramp.
  for(const [i,q]of corniceRidge.entries()){
   for(const dx of [-q.w*.31,q.w*.31])bx(q.x+dx,q.y+12,q.z,13,25,13,'#5a6870');
   bx(q.x+q.w*.32,q.y+39,q.z,10,55,10,'#806951');bx(q.x+q.w*.32,q.y+68,q.z,24,8,21,'#d5b679');
   if(i<corniceRidge.length-1){const next=corniceRidge[i+1],dx=next.x-q.x,dz=next.z-q.z,dy=next.y-q.y,h=Math.hypot(dx,dz);pushM();mv((q.x+next.x)/2+q.w*.32,(q.y+next.y)/2+70,(q.z+next.z)/2);rotY(Math.atan2(dx,dz));rotX(-Math.atan2(dy,h));bx(0,0,0,3,3,Math.hypot(h,dy),'#b39970');popM();}
  }
  if(!f['ff.reflect.open'])for(let j=0;j<11;j++){const a=j/10;bx(-185+a*(-260+185),1000-a*205,-5200+a*(-5280+5200),5,6,5,'#c9aa75');}
  const w=wind(G.time);for(let j=0;j<5;j++)bx(-2200+j*22,370+Math.sin(t*2+j*.3)*3,-1750+(w.phase==='calm'?3:w.phase==='warning'?14:32)*j/5,25,13,3,'#cbb998');
  if(!f['ff.heater']){bx(0,467+Math.sin(t*2)*2,-1960,5,13,5,f['ff.part']?'#b4e5ad':'#efce86');bx(0,455+Math.sin(t*2)*2,-1960,5,4,5,'#efce86');}
 }
 const api={build,sync,quest,shards,ready,wind,draw,paths};root.BFSnowbound=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
