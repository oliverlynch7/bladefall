/* Authored geography around the campaign's mechanical routes.
 * Walls, foundations and floors are gameplay data, not a cosmetic backdrop.
 * Never extend a floor through a named puzzle gap or a lower occupied storey. */
(function(root){'use strict';
const REV=2356;
const colors={outskirts:['#698447','#b0a277'],hollow:['#9d7453','#d7b783'],keep:['#656e70','#aaa086'],frost:['#91b1c4','#d9e9e8'],ember:['#57585b','#a98864'],abyss:['#607c85','#c8bf9a'],palace:['#c6d4d9','#e9cc82'],castle:['#777784','#c2af86']};
function apply(G,zone){
 if(!G||G.hub||G.trial||G.side||G.delve||G.endless||G.arena||G.bonusActive||G.devBriar||G.devKeep||G.bossRush||G.voyage||!colors[zone]||G.geography?.revision===REV)return false;
 const a=G.area,b=G.bounds,c=colors[zone],geo=G.geography={revision:REV,zone,area:a,features:[],rooms:[],hazards:[],routes:[],fall:zone==='outskirts'?'recover':zone==='keep'&&a!==1?'recover':'damage'};
 const feature=(type,id,data)=>{const f={type,id,...data};geo.features.push(f);return f;};
 const floor=(id,x,z,y,w,d,extra={})=>{
  const row={x,z,w,d,geography:id,...extra};
  if(y===0)G.segments.push({...row,meadow:zone==='outskirts'});
  else G.obstacles.push({...row,kind:'plat',h:y,y0:y-32,slab:32,checkpoint:true});
  feature('floor',id,{x,z,y,w,d});return row;
 };
 const wall=(id,x,z,y,w,d,h,extra={})=>{
  const o={x,z,y0:y,w,d,h,c:c[0],courtWall:true,geography:id,...extra};G.walls.push(o);feature('wall',id,{x,z,y,w,d,h});return o;
 };
 const model=(id,model,x,z,y,w,h,d,extra={})=>G.deco.push({kind:'craft',craftId:'geo-'+id,model,x,z,y0:y,w,h,d,...extra});
 const line=(id,x1,z1,x2,z2,y,h=300,thick=64,style='wall')=>{
  // Layout plans use cardinal walls. They meet exactly at corners.
  if(x1!==x2&&z1!==z2)throw Error('Geography wall must be cardinal: '+id);
  const along=x1!==x2,len=Math.abs(along?x2-x1:z2-z1),count=Math.ceil(len/400),step=len/count;
  for(let i=0;i<count;i++){
   const t=(i+.5)/count,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t;
   const o=wall(id+'-'+i,x,z,y,along?step:thick,along?thick:step,h,{invisible:true});
   // Detailed body replaces a hidden physics box, with an exact full-width face.
   model(id+'-'+i,style,x,z,y,along?step:thick,h,along?thick:step,['wall','ice'].includes(style)?{options:{w:along?step:thick,h,d:along?thick:step,surfaceDetail:'painted',fullHeight:style==='ice'}}:{});
   G.deco.push({x,z,y0:y,w:along?step:thick,h,d:along?thick:step,c:c[0],craftHidden:true,geographyFallback:id+'-'+i,nocol:true});
   if(style==='wall'&&i%2===0){model(id+'-pier-'+i,'buttress',x,z,y,along?34:thick+24,h+24,along?thick+24:34);}
   o.geographyBoundary=true;
  }
 };
 const perimeter=(id,points,y,h=380,style='wall',thick=70)=>{
  for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];line(id+'-'+i,...p,...q,y,h,thick,style);}
 };
 const rect=(id,x,z,y,w,d,h=320,doors={})=>{
  geo.rooms.push({id,x,z,y,w,d});
  for(const [edge,axis,at,lo,hi]of [['west','z',x-w/2,z-d/2,z+d/2],['east','z',x+w/2,z-d/2,z+d/2],['north','x',z-d/2,x-w/2,x+w/2],['south','x',z+d/2,x-w/2,x+w/2]]){
   const gaps=(doors[edge]||[]).map(([p,size=360])=>[p-size/2,p+size/2]).sort((a,b)=>a[0]-b[0]);let cursor=lo;
   for(const [start,end]of [...gaps,[hi,hi]]){const stop=Math.min(hi,start);if(stop>cursor+2)axis==='x'?line(id+'-'+edge+'-'+cursor,cursor,at,stop,at,y,h,40):line(id+'-'+edge+'-'+cursor,at,cursor,at,stop,y,h,40);cursor=Math.max(cursor,end);}
  }
 };
 const arch=(id,x,z,y,w,h=380,rot=0)=>model(id,'arch',x,z,y,w,h,54,{rot});
 const rail=(id,x1,z1,x2,z2,y)=>line(id,x1,z1,x2,z2,y,76,22,'balustrade');
 const originalFloors=[...(G.segments||[]).map(o=>({...o,h:0})),...(G.obstacles||[]).filter(o=>o.kind==='plat')];
 const support=(o,base=-190)=>{
  if(o.kind!=='plat'||o.invisible||o.shelfJump||o.shelfCatch||o.ascentCatch||o.water||o.bridge||o.courtCatch||o.vaultRack)return;
  // Preserve any real lower passage beneath this slab.
  const bottom=o.y0??o.h-25;
  if(originalFloors.some(q=>q!==o&&q.h<bottom-58&&q.h>=base&&Math.abs(q.x-o.x)<(q.w+o.w)/2-4&&Math.abs(q.z-o.z)<(q.d+o.d)/2-4))return;
  // Individual path steps become solid stairs/landings; no new walkable top.
  o.y0=Math.min(o.y0??0,base);delete o.slab;o.geographyFoundation=true;
 };
 const rim=(id,y,h=420,style='cliff')=>perimeter(id,[[b.minX-50,b.maxZ+70],[b.maxX+50,b.maxZ+70],[b.maxX+50,b.minZ-70],[b.minX-50,b.minZ-70]],y,h,style,100);
 const route=(id,points,width=330)=>{geo.routes.push({id,points,width});};
 const hazard=(id,box)=>geo.hazards.push({id,...box});
 // Floors shared with a live crossing are never filled here.
 if(zone==='outskirts'){
  const wooded=(id,points)=>{
   perimeter(id,points,-18,230,'bank',150);
   for(let i=0;i<points.length;i++){
    const u=points[i],v=points[(i+1)%points.length],n=Math.ceil(Math.hypot(v[0]-u[0],v[1]-u[1])/170);
    for(let k=0;k<n;k++){const t=(k+.5)/n,x=u[0]+(v[0]-u[0])*t,z=u[1]+(v[1]-u[1])*t,h=210+(k%3)*32;G.deco.push({kind:'tree',lead:true,x,z,y0:160+h,trunkH:h,w:155,h:125,d:155,theme:'forest',c:'#47764b'});}
   }
  };
  if(a===0){
   // The millrace is an actual channel, not a line cut through an endless abyss.
   for(const [id,x,z,w,d]of [['village-and-fields',-90,-470,5830,2880],['mill-south-bank',-70,-3150,5100,1670],['gate-hill-foot',-250,-4350,2070,780]])floor(id,x,z,0,w,d);
   wooded('farm-edge',[[-3090,1120],[2910,1120],[2910,-2290],[2540,-2290],[2540,-3990],[840,-3990],[840,-4820],[-1290,-4820],[-1290,-3990],[-3090,-3990]]);
   hazard('millrace',{x:250,z:-2190,w:5200,d:330});
   // Fence the bank except the real mill crossing and existing western ford.
   line('mill-bank-west',-2910,-2070,-350,-2070,0,106,22,'barricade');
   line('mill-bank-east',690,-2070,2680,-2070,0,106,22,'barricade');
   route('Village road → mill → wagon gate',[[0,700],[0,-800],[120,-1660],[395,-2150],[230,-3490],[-210,-4350]]);
  }else if(a===1){
   floor('forest-soil-west',-900,-2110,0,3440,5480);floor('forest-soil-east',1980,-1530,0,2400,2510);floor('northwood-soil',220,-3670,0,1950,2440);
   // Enclose the existing dog-rescue clearing instead of walling off its trail.
   wooded('woods-edge',[[-2640,700],[1550,700],[1550,-250],[3230,-250],[3230,-2850],[1260,-2850],[1260,-4980],[-2640,-4980],[-2640,-2430],[-3770,-2430],[-3770,-1190],[-2640,-1190]]);
   route('Clearing trail',[[0,300],[0,-650],[-650,-1850],[0,-3100],[0,-4680]]);
  }else{floor('orchard-soil',0,-80,0,2550,2200);wooded('orchard-edge',[[-1310,1060],[1310,1060],[1310,-1210],[-1310,-1210]]);}
 }
 if(zone==='keep'){
  if(a===0){
   floor('outer-court',0,-130,0,2180,1700);floor('breach-ward',-150,-2270,0,4100,2440);floor('inner-ward',40,-3740,0,2240,830);floor('cell-gate-approach',0,-4525,0,1180,810);
   perimeter('curtain-wall',[[-1200,720],[1840,720],[1840,-3320],[1210,-3320],[1210,-4900],[-2030,-4900],[-2030,-3320],[-2440,-3320],[-2440,-1050],[-1200,-1050]],-35,520);
   // Cross-walls join the active portcullis, leaving its existing opening.
   line('outer-gate-west',-1165,-930,-222,-930,0,330);
   line('outer-gate-east',975,-930,1805,-930,0,330);
   line('arrow-post-retaining',222,-930,975,-930,0,138);
   line('cell-gate-west',-1995,-4100,-226,-4100,0,400);
   line('cell-gate-east',226,-4100,1175,-4100,0,400);
   // The workshop is a building with a front door, not a box on a spur.
   rect('workshop',1430,-2980,0,680,750,350,{south:[[1450,305]]});
   line('workshop-lock-west',1090,-2770,1298,-2770,0,320,32);
   line('workshop-lock-east',1602,-2770,1770,-2770,0,320,32);
   // No new floor/top through the sealed chamber; reinforce its outer shell.
   rect('sealed-chamber',-1500,-3650,80,940,890,360,{south:[[-1730,390]],east:[[-3400,315]]});
   for(const o of G.obstacles)if(!o.geography)support(o,-40);
   arch('keep-entry',0,610,0,930,450);arch('inner-ward-entry',0,-3340,0,1040,390);
   route('Castle approach and inner ward',[[0,450],[0,-830],[0,-1450],[0,-2150],[0,-3000],[0,-3710],[0,-4630]]);
  }else if(a===1){
   // A cell block and a lift atrium, with the real lower works left below.
   floor('cell-block-floor',0,-1100,180,2250,1720);floor('west-service-floor',-1225,-1370,180,260,740);
   floor('hidden-room-floor',-1050,-1920,180,790,750);
   floor('upper-shelter-floor',0,-3640,360,1000,1180);floor('release-corridor',0,-4490,360,970,1280);
   rect('cell-block',0,-1170,180,2390,2100,445,{south:[[0,520]],north:[[0,1110]],west:[[-1350,420],[-1840,440]],east:[[-1970,690]]});
   rect('hidden-holding',-1080,-1940,180,1000,880,400,{south:[[-1300,332]],east:[[-1850,350]]});
   // Existing loose door separates the holding room from the service corridor.
   line('holding-north-west',-1580,-1440,-1467,-1440,180,400);
   line('holding-north-east',-1133,-1440,-580,-1440,180,400);
   line('lift-atrium-west',-690,-2110,-690,-3070,0,760);
   line('lift-atrium-east',690,-2140,690,-2950,0,760);
   rect('upper-hall',0,-4150,360,1140,1760,500,{south:[[0,820]]});
   // The release gate closes the full corridor; its side gaps are masonry, not bypasses.
   line('release-bulkhead-west',-570,-4030,-165,-4030,360,500,50);
   line('release-bulkhead-east',165,-4030,570,-4030,360,500,50);
   // Cover around the drain is masonry, not an invisible map edge.
   rect('drain-cistern',1890,-4080,0,1660,2010,720,{south:[[1530,560]],west:[[-3340,500]]});
   hazard('lift-shaft',{x:0,z:-2500,w:390,d:670});hazard('flooded-drain',{x:1890,z:-4090,w:1370,d:1820});
   arch('cell-vault',0,-650,180,700,370);arch('lift-vault',0,-2440,180,1330,610);arch('upper-vault',0,-3630,360,1060,480);
   route('Prison rescue',[[0,300],[0,-650],[-750,-950],[-1300,-1370],[-1050,-1930],[0,-2200],[0,-2500],[0,-3440],[0,-4700]]);
  }else{
   floor('release-hall-floor',0,0,0,1260,1660);rect('release-hall',0,0,0,1390,1820,570);arch('release-vault',0,-610,0,1280,560);
  }
 }
 if(zone==='palace'){
  if(a===0){
   // A continuous low garden island supports terraces; the height-gated routes stay above it.
   floor('garden-island',-50,-1930,35,4150,5500);geo.fall='recover';
   floor('forecourt',0,60,120,1390,1350);floor('fountain-square',0,-1440,200,780,600);
   floor('west-garden-patio',-1340,-2110,180,640,650);floor('east-garden-patio',1600,-1200,160,850,1100);
   floor('sun-terrace',0,-3820,420,1320,680);floor('palace-threshold',0,-4590,460,1090,360);
   for(const o of G.obstacles)if(!o.courtCatch&&!o.geography)support(o,8);
   perimeter('island-retaining-wall',[[-2550,820],[2260,820],[2260,-1970],[1720,-1970],[1720,-3260],[830,-3260],[830,-4860],[-2440,-4860],[-2440,-3260],[-2550,-3260]],-320,410,'wall',90);
   // A recognizable palace front is the destination of the ascending garden axis.
   line('palace-facade-west',-2390,-4650,-560,-4650,420,960);
   line('palace-facade-east',560,-4650,1630,-4650,420,960);
   line('palace-seal-west',-2390,-4320,-391,-4320,400,470,55);
   line('palace-seal-east',391,-4320,1630,-4320,400,470,55);
   arch('palace-grand-door',0,-4650,460,1120,860);
   for(const x of [-1840,-1120,1120])model('facade-window-'+x,'window',x,-4602,920,200,360,22);
   rail('entry-west',-660,670,-660,-420,120);rail('entry-east',660,670,660,-420,120);
   rail('sun-terrace-west',-630,-3450,-630,-4250,420);rail('sun-terrace-east',630,-3450,630,-4250,420);
   arch('processional-arch',0,-3190,360,820,420);
   route('Fountain → balcony choice → sun terrace → palace',[[0,560],[0,-480],[0,-1400],[1050,-2070],[0,-3200],[0,-3850],[0,-4500]]);
  }else if(a===1){
   for(const o of G.obstacles)if(!o.shelfCatch&&!o.shelfJump&&!o.geography)support(o,-260);
   // Nave and wings are real room volumes. Exterior nesting terraces stay outside.
   floor('vestibule-floor',0,20,120,1080,1150);floor('keeper-floor',0,-1360,200,1000,500);
   floor('reading-nave',0,-2880,300,1170,1070);floor('records-wing',1130,-1870,320,760,480);
   floor('guardian-gallery',0,-4550,400,1150,1630);floor('archive-wing',1320,-4630,400,1210,1160);
   floor('display-wing',-1330,-4000,440,1030,720);floor('hidden-study',-1500,-4650,480,650,640);
   // Each annex opening is aligned with the route that actually enters it.
   rect('vestibule',0,-110,120,1240,1350,600,{north:[[0,590]],west:[[-600,440]]});
   rect('keeper-hall',0,-1240,200,1070,800,650,{south:[[0,600]],north:[[0,760]],east:[[-1350,470]]});
   rect('records-wing',1130,-1900,320,860,1020,650,{north:[[1130,420]],south:[[1130,470]],west:[[-2410,300]]});
   rect('reading-nave',0,-2800,300,1320,1320,760,{south:[[0,830],[-630,280],[980,440]],north:[[0,820]],west:[[-3260,440],[-2350,480]],east:[[-3200,450],[-2450,440]]});
   rect('sanctum-gallery',0,-4560,400,1340,1770,790,{south:[[0,690]],west:[[-3890,500]],east:[[-4550,620]]});
   rect('archive-wing',1320,-4590,400,1420,1340,690,{west:[[-4550,670]],north:[[1800,700]]});
   rect('display-wing',-1370,-4020,440,1110,830,700,{east:[[-3900,500]],south:[[-850,470]],north:[[-1500,525]],west:[[-3880,550]]});
   rect('hidden-study',-1500,-4650,480,790,750,570,{south:[[-1500,525]]});
   // Enclosed connecting galleries make the library one building. Their
   // side openings preserve the records and lower-maintenance approaches.
   for(const x of [-420,420]){
    line('entry-gallery-'+x,x,-790,x,-835,120,660,40);
    line('reading-connector-'+x,x,-1660,x,-2090,200,700,40);
    line('sanctum-connector-'+x,x,-3470,x,-3640,300,760,40);
   }
   for(const [id,z,y,d]of [['entry',-810,880,110],['reading',-1890,940,620],['sanctum',-3525,1100,420]])model('connector-roof-'+id,'roof',0,z,y,880,120,d);
   line('sanctum-seal-west',-650,-5060,-377,-5060,400,700,40);
   line('sanctum-seal-east',377,-5060,650,-5060,400,700,40);
   // Wall around the mechanism gallery, not across the shelf crossing itself.
   line('shelf-gallery-east',2660,-3300,2660,-4780,260,810);
   line('shelf-gallery-north',1480,-3230,2660,-3230,260,810);
   arch('vestibule-vault',0,270,120,1120,590);arch('nave-vault-south',0,-2260,300,1210,750);arch('nave-vault-north',0,-3310,300,1210,750);arch('sanctum-vault',0,-4350,400,1220,740);
   for(const z of [-2530,-3030])for(const x of [-610,610])model('nave-bookwall-'+x+z,'bookshelf',x,z,300,44,550,290,{rot:Math.PI/2});
   // Ceiling ribs/high roof panels establish an interior without a low camera lid.
   for(const [id,x,z,y,w,d]of [['vestibule',0,-100,120,1190,1330],['nave',0,-2800,300,1240,1270],['sanctum',0,-4520,400,1240,1670],['records',1130,-1900,320,800,950],['archive',1320,-4580,400,1350,1260]]){
    model(id+'-roof','roof',x,z,y+790,w,220,d);
    feature('roof',id,{x,z,y:y+790,w,d,h:220});
   }
   hazard('folding-shelf-gallery',{x:2060,z:-4140,w:840,d:800});hazard('nesting-terraces',{x:-3060,z:-3630,w:1800,d:1500});
   route('Library central nave',[[0,430],[0,-1250],[0,-2500],[0,-3250],[0,-3900],[0,-5260]]);
  }else{
   rect('guardian-hall',0,0,0,2150,2220,1000,{north:[[0,870]]});rect('orb-sanctuary',0,-1690,220,1080,830,700,{south:[[0,860]]});arch('guardian-hall-vault',0,700,0,2040,960);
  }
 }
 if(zone==='hollow'){
  if(a===0){
   // Canyon has two land masses separated by the freight-bridge ravine.
   for(const [id,x,z,w,d]of [['south-canyon',0,-1080,3810,3160],['north-canyon',0,-4030,3370,1910]])floor(id,x,z,0,w,d);
   perimeter('south-canyon-face',[[-2210,700],[2210,700],[2210,-2640],[-2210,-2640]],-160,640,'cliff',130);
   // Open the two ravine faces again: leave the actual 260-wide crossing unobstructed.
   G.walls=G.walls.filter(o=>!o.geography?.startsWith('south-canyon-face-2'));G.deco=G.deco.filter(o=>!o.craftId?.startsWith('geo-south-canyon-face-2')&&!o.geographyFallback?.startsWith('south-canyon-face-2'));geo.features=geo.features.filter(o=>!o.id.startsWith('south-canyon-face-2'));
   line('north-canyon-west',-1830,-3070,-1830,-5070,-160,720,150,'cliff');line('north-canyon-east',1830,-3070,1830,-5070,-160,720,150,'cliff');line('north-canyon-end',-1830,-5070,1830,-5070,-160,720,150,'cliff');
   hazard('freight-ravine',{x:0,z:-2830,w:4400,d:480});
   route('Freight road through the pass',[[0,300],[-1000,-1450],[0,-2450],[0,-3150],[-450,-3900],[0,-4780]]);
  }else if(a===1){
   // Holding yards occupy the canyon floor; rock spines keep their separate approaches.
   floor('south-holding-ground',-50,-1900,0,2540,1610);floor('north-yard-ground',450,-3810,0,1740,1710);floor('freight-yard-ground',-2010,-3520,0,1120,1300);
   rim('canyon-rim',-100,720);route('Canyon yard road',[[0,220],[0,-1920],[640,-3540],[0,-3990],[0,-5250]]);
  }else{rim('marksman-canyon',-100,650);}
 }
 if(zone==='frost'){
  if(a===0){
   // Natural ledges are part of the mountain mass; keep all bridge/cornice gaps.
   for(const o of G.obstacles)if(o.mountainPath&&!o.bridge)support(o,-180);
   line('mountain-west',b.minX-100,b.maxZ,b.minX-100,b.minZ,-180,1450,280,'cliff');
   line('summit-back',b.minX-100,b.minZ-110,b.maxX+40,b.minZ-110,-100,1520,230,'ice');
   hazard('exposed-mountain',{x:1640,z:-2800,w:850,d:4800});route('Mountain switchback to cave',[[0,350],[-800,-750],[-2040,-1300],[0,-2020],[0,-2620],[1180,-3910],[-260,-5480]]);
  }else if(a===1){rim('ice-cave-shell',-170,1250,'ice');
   for(const [id,x,z,y,w,d]of [['cave-exit',0,-5480,180,780,430]])floor(id,x,z,y,w,d);
   arch('ice-cavern-rib',-1250,-3860,180,990,630);route('Cavern chambers',[[0,300],[-1300,-2150],[-1330,-3730],[0,-4200],[0,-5550]]);
  }else{rim('officers-ice-face',-80,520,'ice');}
 }
 if(zone==='ember'){
  // Built factory shell surrounds actual molten voids. No full floor under lava.
  rim('foundry-shell',-100,a<0?780:1100,'wall');
  if(a===0){floor('receiving-hall',0,100,100,1230,1350);floor('assembly-floor',-510,-2310,100,1040,1880);floor('west-store-floor',-1720,-2550,160,700,780);
   for(const [x,z,y]of [[0,300,100],[-520,-1730,100],[-520,-3100,100],[0,-5940,180]])arch('foundry-span-'+x+z,x,z,y,1090,670);
   hazard('casting-channel',{x:0,z:-4820,w:1300,d:390});route('Receiving → assembly → casting → furnace',[[0,390],[0,-1400],[-650,-2600],[0,-3520],[220,-4080],[0,-5060],[0,-6200]]);
  }else if(a===1){floor('workers-bay',-920,-3400,120,920,1530);floor('east-service-gallery',1320,-3580,260,440,1040);floor('office-room',2150,-4910,400,700,720);
   rect('command-office',2150,-4910,400,860,880,520,{south:[[2120,460]],west:[[-4600,450]]});
   for(const z of [-2190,-4400])arch('furnace-gantry-'+z,0,z,120,1700,920);
   hazard('central-furnace',{x:160,z:-3470,w:830,d:1300});hazard('cooling-crossing',{x:0,z:-5700,w:800,d:640});
   route('Worker evacuation and cooling line',[[0,300],[0,-2220],[-940,-3410],[0,-4910],[0,-6050],[0,-6670]]);
  }
 }
 if(zone==='abyss'){
  if(a===0){
   floor('continuous-work-beach',0,-1460,30,1110,4060);floor('memorial-beach',-260,-3890,30,1250,700);
   // Landside cliff continues behind salvage and lookout routes, sea remains open.
   line('western-headland',-2840,700,-2840,-4290,-170,740,220,'cliff');line('eastern-headland',2910,700,2910,-4290,-170,850,220,'cliff');
   route('Beach, salvage loops and launch',[[0,490],[0,-500],[0,-1400],[0,-2550],[0,-4050]]);hazard('surf',{x:0,z:850,w:5700,d:400});
  }else if(a===1){
   for(const o of G.obstacles)if(o.kind==='plat'&&!o.tideGate&&!o.bridge&&!o.geography&&o.w>=180&&o.d>=180)support(o,-280);
   line('cliff-mass-west',b.minX-70,b.maxZ,b.minX-70,b.minZ,-300,1650,200,'cliff');
   line('palace-island-face',b.minX-70,b.minZ-90,b.maxX+70,b.minZ-90,-300,1780,200,'cliff');
   route('Landing → cargo ledge → upper approach',[[0,550],[1050,-1200],[-300,-1780],[-500,-3000],[900,-4100],[300,-4870]]);hazard('ocean-cliffs',{x:2900,z:-2400,w:450,d:5500});
  }else{line('hydra-headland',-1180,-1460,1180,-1460,-100,680,120,'cliff');}
 }
 if(zone==='castle'){
  if(a===0){
   for(const o of G.obstacles)if(o.kind==='plat'&&!o.castleBridge&&!o.castleDrain&&!o.castleCatch&&!o.geography&&o.z>-2740)support(o,-230);
   floor('siege-camp-ground',0,-1490,40,4100,2590);floor('inner-gate-court',0,-4470,240,1300,1170);
   line('west-castle-curtain',b.minX-40,650,b.minX-40,-5920,-120,1030);
   line('east-castle-curtain',b.maxX+40,650,b.maxX+40,-5920,-120,1030);
   hazard('castle-moat',{x:0,z:-3290,w:1700,d:760});route('Siege quarters → drawbridge → royal gate',[[0,610],[-780,-1050],[0,-2780],[0,-3840],[0,-5040],[0,-5590]]);
  }else if(a===1){
   // Support the spiral from its inner masonry drum; no fill through another storey.
   for(const [i,p]of (root.BFLongAscent?.path||[]).entries())if(i%12===0){const angle=i/120*Math.PI*2;model('tower-rib-'+i,'buttress',Math.sin(angle)*705,Math.cos(angle)*705,Math.max(-140,p[2]-430),110,520,125,{rot:angle});}
   // Large side rooms look built into the tower, not tacked-on floating squares.
   rect('linen-annex',1400,-185,250,590,730,310,{west:[[-30,380]],east:[[-250,390]]});
   rect('worker-annex',-1300,-180,750,800,800,360,{east:[[-180,920]],south:[[-1300,430],[-940,320]]});
   hazard('broken-tower-flights',{x:0,z:0,w:2900,d:2900});route('Two-storey spiral to the summit',(root.BFLongAscent?.path||[]).filter((_,i)=>i%15===0).map(p=>p.slice(0,2)));
  }else if(!G.kingFinal?.void){line('throne-west',-1260,1000,-1260,-1510,-80,1000);line('throne-east',1260,1000,1260,-1510,-80,1000);}
 }
 G._obsDirty=true;return true;
}
root.BFCampaignGeography={apply,REV};if(typeof module!=='undefined')module.exports=root.BFCampaignGeography;
})(typeof window!=='undefined'?window:globalThis);
