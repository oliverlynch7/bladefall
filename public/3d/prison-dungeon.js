/* Pure dungeon content and progression. No campaign state and no network side effects. */
(()=>{'use strict';
const VERSION=1,BASE=['warrior','ranger','mage'];
const offers=[{id:'berserker',tier:1,cost:300,goal:8,key:'elites',name:'Break the guards',desc:'Defeat 8 optional prison elites across runs.'},{id:'ninja',tier:2,cost:600,goal:3,key:'seals',name:'Hidden routes',desc:'Recover 3 hidden seals in Tier 2 or higher.'},{id:'reaper',tier:3,cost:1000,goal:1,key:'warden',name:'Last gate',desc:'Defeat the final Tier 3 boss.'}];
const upgrades=[{id:'health',name:'Endurance',desc:'+6 starting health',base:60,cap:10},{id:'armor',name:'Reinforced armor',desc:'+1% damage reduction',base:80,cap:10},{id:'weapon',name:'Weapon training',desc:'+4% starting weapon damage',base:90,cap:10}];
const copy=x=>JSON.parse(JSON.stringify(x));
function validCheckpoint(c){return !!(c&&c.version===VERSION&&typeof c.id==='string'&&Number.isFinite(c.seed)&&[1,2,3].includes(c.section)&&[1,2,3].includes(c.tier)&&[...BASE,...offers.map(o=>o.id)].includes(c.cid)&&c.p&&Number.isFinite(c.p.hp)&&c.p.hp>0&&c.p.gear&&c.p.stats&&c.p.weapon&&c.classes&&c.states&&c.safe&&Number.isFinite(c.safe.x)&&Number.isFinite(c.safe.z));}
function profile(v={}){v=v&&typeof v==='object'?v:{};const n=(x,max)=>Math.max(0,Math.min(max,Math.floor(Number(x)||0)));return {version:VERSION,chestRecords:v.chestRecords&&typeof v.chestRecords==='object'?Object.fromEntries(Object.entries(v.chestRecords).slice(-2048)): {},gold:n(v.gold,1e9),tier:Math.max(1,n(v.tier,3)),classes:[...new Set([...BASE,...(Array.isArray(v.classes)?v.classes:[]).filter(x=>offers.some(o=>o.id===x))])],upgrades:Object.fromEntries(upgrades.map(u=>[u.id,n(v.upgrades?.[u.id],u.cap)])),progress:{elites:n(v.progress?.elites,1e6),seals:n(v.progress?.seals,1e6),warden:n(v.progress?.warden,1e6)},receipts:Array.isArray(v.receipts)?v.receipts.filter(x=>typeof x==='string').slice(-1500):[],checkpoint:validCheckpoint(v.checkpoint)?copy(v.checkpoint):null};}
function saves(v,legacy){
 if(v&&v.version===1&&Array.isArray(v.slots))return {version:1,active:[0,1,2].includes(v.active)?v.active:0,slots:Array.from({length:3},(_,i)=>v.slots[i]&&typeof v.slots[i]==='object'?profile(v.slots[i]):null)};
 return {version:1,active:0,slots:[legacy&&typeof legacy==='object'?profile(legacy):null,null,null]};
}
function credit(p,id,gold,kind){if(p.receipts.includes(id))return false;p.receipts.push(id);if(p.receipts.length>1500)p.receipts.shift();p.gold+=Math.max(0,Math.floor(gold));if(kind&&kind in p.progress)p.progress[kind]++;return true;}
function price(p,id){const u=upgrades.find(u=>u.id===id);return u?u.base*(1+p.upgrades[id]):offers.find(o=>o.id===id)?.cost||0;}
function buy(p,id){const u=upgrades.find(u=>u.id===id),o=offers.find(o=>o.id===id),cost=price(p,id);if(!cost||p.gold<cost)return false;if(u){if(p.upgrades[id]>=u.cap)return false;p.upgrades[id]++;}else{if(!o||p.classes.includes(id)||p.tier<o.tier||p.progress[o.key]<o.goal)return false;p.classes.push(id);}p.gold-=cost;return true;}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function layout(seed,section,tier,revision=6){
 const random=rng(seed+section*997+tier*71),side=random()<.5?-1:1;
 const names=[['Cell block','Guard hall','Broken crossing','Watch post','Cell keeper','Hidden store'],['Lower cells','Supply hall','Drain crossing','Barracks','Iron checkpoint','Sealed store'],['Gate cells','Patrol hall','Broken stairwell','Last watch','Outer gate','Warden’s store']][section-1]||['Cell block','Guard hall','Broken crossing','Watch post','Outer gate','Hidden store'];
 const rooms=names.map((name,i)=>({id:i,name,x:i===5?side*720:0,z:i===5?-720:-i*720,w:600,d:600,h:i===2?300:240,kind:['start','fight','bridge','waves','boss','vault'][i],optional:i===5}));
 if(revision>=2){
  rooms[4].x=side*720;rooms[4].z=-2160;rooms[4].name=['Bell chamber','Iron den','Last seal'][section-1];
  rooms.push({id:6,name:['Guard armory','Forgotten workshop','Sealed treasury'][section-1],x:-side*720,z:-2160,w:600,d:600,h:300,kind:'vault',optional:true});
  rooms[1].formation=['patrol','crossfire','charge'][(seed+section)%3];
  rooms[3].formation=['crossfire','charge','patrol'][(seed+section+1)%3];
 }
 if(revision>=4){
  for(const id of [1,3]){const r=rooms[id];r.template=['gallery','kennels','barricades'][(seed+section+id)%3];r.name={gallery:'Split gallery',kennels:'Chain kennels',barricades:'Guard barricades'}[r.template];}
  rooms[6].name='Broken treasury';rooms[6].cache={x:125,z:-205,y:128};
 }
 if(revision>=5){
  rooms[4].x=side*2160;
  rooms.push({id:7,name:'Prison refectory',x:side*720,z:-2160,w:600,d:600,h:300,kind:'fight',template:'refectory'}, {id:8,name:'Flooded watch gallery',x:side*1440,z:-2160,w:600,d:600,h:320,kind:'waves',template:'cistern'});
  for(const r of rooms)r.h+=60;
 }
 if(revision>=6){
  // Orthogonal route variants preserve the first crossing's north/south approach.
  const route=(seed+section)%3;
  rooms[7].x=route===2?0:side*720;rooms[7].z=route===2?-2880:-2160;
  rooms.push({id:9,name:['Broken service stair','Drain shaft crossing','Shattered gate walk'][section-1],x:rooms[7].x,z:rooms[7].z-720,w:600,d:600,h:400,kind:'bridge',crossingStyle:'raised',optional:false});
  rooms[8].x=rooms[7].x;rooms[8].z=rooms[7].z-1440;
  rooms[4].x=rooms[8].x+(route===1?-side:side)*720;rooms[4].z=rooms[8].z;
 }
 if(revision>=7){
  // Each section now has a different work space on the main route. The room graph,
  // entrances and required jump spans stay the same, so solo/co-op paths remain valid.
  const work=['refectory','liftbay','armory'][section-1],last=['cistern','watchpost','infirmary'][section-1];
  const titles={refectory:'Prison refectory',liftbay:'Chain-lift bay',armory:'Confiscated armory',cistern:'Flooded watch gallery',watchpost:'High guard post',infirmary:'Abandoned infirmary'};
  rooms[7].template=work;rooms[7].name=titles[work];rooms[8].template=last;rooms[8].name=titles[last];
  if((seed+section)%2===0){rooms[1].template='armory';rooms[1].name='Shield store';}
  else {rooms[3].template='watchpost';rooms[3].name='High guard post';}
 }
 if(revision>=8){
  const sign=rooms[7].x===0?side:Math.sign(rooms[7].x);
  rooms.push({id:10,name:['Broken rafters','Pipe gantry','Sealed catwalk'][section-1],x:rooms[7].x+sign*720,z:rooms[7].z,w:600,d:600,h:480,kind:'cache',optional:true,approachSign:sign});
 }
 if(revision>=9){
  // A new connected wing follows the old final watch. The earlier rooms and
  // every revision-8 checkpoint keep their exact positions and geometry.
  const last=rooms[8],direction=Math.sign(rooms[4].x-last.x)||side,bend=(seed+section)%2===1;
  // Alternate between a deep straight wing and a side-turn wing. The new
  // crossing always has a north/south approach, matching its physical steps.
  const wingX=last.x+(bend?direction*720:0),wingZ=last.z-(bend?0:720);
  rooms[4].x=wingX+direction*720;rooms[4].z=wingZ-1440;
  rooms.push(
   {id:11,name:['Registry hall','Copper pump house','Beacon workshop'][section-1],x:wingX,z:wingZ,w:600,d:600,h:340,kind:'fight',template:['registry','pumps','beacon'][section-1],dungeonSection:section},
   {id:12,name:['Collapsed gallery','Waterwheel gap','Broken crane walk'][section-1],x:wingX,z:wingZ-720,w:600,d:600,h:470,kind:'bridge',crossingStyle:'expedition'},
   {id:13,name:['Holding yard','Drain depot','Final guard muster'][section-1],x:wingX,z:wingZ-1440,w:600,d:600,h:340,kind:'waves',template:['yard','depot','muster'][section-1],dungeonSection:section},
   {id:14,name:['Confiscated stores','Locked supply bay','Sealed reliquary'][section-1],x:wingX+(bend?direction:-direction)*720,z:wingZ,w:600,d:600,h:340,kind:'vault',optional:true,template:'stores',dungeonSection:section},
   {id:15,name:['High cell walk','Floodgate gantry','Beacon rafters'][section-1],x:wingX-direction*720,z:wingZ-1440,w:600,d:600,h:480,kind:'cache',optional:true,approachSign:-direction,challenge:true}
  );
  for(const r of rooms)if(['fight','waves','vault'].includes(r.kind))r.dungeonSection=section;
 }
 if(revision>=10){
  // These rooms have different player inputs, not merely different enemy names.
  rooms[11].mechanic='wards';rooms[11].wardSockets=[[-95,-140],[95,-140]];
  rooms[13].mechanic='hold';rooms[13].holdRadius=145;rooms[13].holdSeconds=18;
 }
 const links=[[0,1],[1,2],[2,3],...(revision>=5?[[3,7],...(revision>=6?[[7,9],[9,8]]:[[7,8]]),...(revision>=9?[[8,11],[11,12],[12,13],[13,4]]:[[8,4]])]:[[3,4]]),[1,5],...(revision>=2?[[3,6]]:[]),...(revision>=8?[[7,10]]:[]),...(revision>=9?[[11,14],[13,15]]:[])],walls=[],floors=[],plats=[],roofs=[],decor=[];
 const box=(x,z,w,d,y0,h,extra={})=>({x,z,w,d,y0,h,...extra});
 for(const r of rooms){
  const dirs=new Set(links.filter(l=>l.includes(r.id)).map(l=>{const q=rooms[l.find(i=>i!==r.id)];return Math.abs(q.x-r.x)>10?(q.x>r.x?'E':'W'):(q.z>r.z?'S':'N');}));
  for(const dir of ['N','S','E','W']){const ns=dir==='N'||dir==='S',sign=dir==='N'||dir==='W'?-1:1;
   for(const [offset,length] of dirs.has(dir)?[[-195,210],[195,210]]:[[0,600]])walls.push(box(r.x+(ns?offset:sign*300),r.z+(ns?sign*300:offset),ns?length:24,ns?24:length,0,r.h,{room:r.id}));
  }
  roofs.push(box(r.x,r.z,624,624,r.h,r.h+18,{room:r.id}));
  if(r.kind==='cache'){
   const s=r.approachSign;
   floors.push(box(r.x-s*235,r.z,130,576,-20,0),box(r.x+s*235,r.z,130,576,-20,0));
   const xs=r.challenge?[-175,-115,-55,5,65,125,185]:[-155,-78,0,78,155],zs=r.challenge?[-40,42,-35,42,-35,42,-40]:[-45,32,-28,35,-30],heights=r.challenge?[24,46,72,94,72,46,24]:[25,55,84,55,25];
   for(let i=0;i<xs.length;i++)plats.push(box(r.x+s*xs[i],r.z+zs[i],r.challenge?70:82,r.challenge?66:72,0,heights[i],{room:r.id,cacheStep:true}));
   r.waypoints=[{x:r.x-s*250,z:r.z,y:0},...xs.map((x,i)=>({x:r.x+s*x,z:r.z+zs[i],y:heights[i]})),{x:r.x+s*250,z:r.z,y:0}];
   r.cacheGoal={x:r.x+s*245,z:r.z,y:0};
  }else if(r.kind==='bridge'){
   floors.push(box(r.x,r.z+235,576,130,-20,0),box(r.x,r.z-235,576,130,-20,0));
   const variant=revision>=2?(seed+section)%3:0;
   for(let k=0;k<3;k++)plats.push(box(r.x+(variant===2?(k===1?-side*45:side*30):(k===1?side*55:0)),r.z+125-k*125,variant===1?140:110,variant===1?95:85,0,k===1?(variant===1?62:44):18,{room:r.id}));
   if(r.crossingStyle==='raised'||r.crossingStyle==='expedition'){
    for(let i=plats.length-1;i>=0;i--)if(plats[i].room===r.id)plats.splice(i,1);
    const heights=r.crossingStyle==='expedition'?[24,52,80,102,80,52,24]:[22,52,84,52,22],offsets=r.crossingStyle==='expedition'?[-65,50,-60,55,-50,45,-55]:[-45,30,-35,35,-25];
    for(let k=0;k<heights.length;k++)plats.push(box(r.x+side*offsets[k],r.z+(r.crossingStyle==='expedition'?205-k*68:180-k*90),r.crossingStyle==='expedition'?72:80,66,0,heights[k],{room:r.id,raisedCrossing:true}));
   }
   r.crossing=variant;r.waypoints=[{x:r.x,z:r.z+225,y:0},...plats.filter(p=>p.room===r.id).map(p=>({x:p.x,z:p.z,y:p.h})),{x:r.x,z:r.z-225,y:0}];
  }else if(revision>=4&&r.id===6)floors.push(box(r.x,r.z+85,576,406,-20,0));
  else floors.push(box(r.x,r.z,576,576,-20,0));
  if(r.kind==='vault'&&r.id===5)for(let k=0;k<3;k++)plats.push(box(r.x-120+k*70,r.z-80,70,95,0,28+k*28,{room:r.id}));
  if(revision<4&&(r.kind==='fight'||r.kind==='waves'))for(const s of [-1,1])plats.push(box(r.x+s*(170+Math.floor(random()*35)),r.z+(random()<.5?-60:60),44,74,0,100,{room:r.id}));
  if(revision>=2&&r.id===6){
   for(let k=0;k<4;k++)plats.push(box(r.x-175+k*100,r.z-(revision>=4?205:170),65,85,0,(revision>=4?32:24)*(k+1),{room:r.id,cacheStep:true}));
  }
  if(revision>=4&&r.template){
   const solid=(x,z,w,d,h,color)=>plats.push(box(r.x+x,r.z+z,w,d,0,h,{room:r.id,color}));
   if(r.template==='gallery'){
    // Two columns split sightlines without sealing either flank or the center route.
    for(const x of [-155,155]){solid(x,-45,42,110,140,'#637580');solid(x,115,110,55,22,'#626872');}
   }else if(r.template==='kennels'){
    // Low raised runs let charging beasts and players traverse the same terrain.
    for(const x of [-205,205]){solid(x,-75,105,190,24,'#756452');solid(x,-75,65,110,42,'#87755e');}
   }else if(r.template==='refectory'){
    // Long dining tables create parallel lanes and jumpable cross routes.
    for(const x of [-165,165]){solid(x,0,85,280,42,'#766047');solid(x+Math.sign(x)*66,0,25,260,21,'#554434');}
   }else if(r.template==='cistern'){
    // Three staggered low islands interrupt straight charges without sealing a lane.
    for(const [x,z] of [[-155,-110],[155,30],[-110,155]])solid(x,z,135,100,28,'#547a79');
    for(const x of [-250,250])solid(x,-165,32,70,160,'#5d9391');
   }else if(r.template==='armory'){
    // Shield racks are low enough to vault; the central fighting lane stays open.
    for(const x of [-205,205]){solid(x,-105,72,165,45,'#72675c');solid(x,125,58,88,32,'#615b56');}
   }else if(r.template==='liftbay'){
    // Two accessible loading platforms make a flank, not an impassable lift puzzle.
    for(const x of [-205,205]){solid(x,10,105,190,40,'#736551');solid(x,-115,66,85,66,'#60574d');}
   }else if(r.template==='watchpost'){
    for(const x of [-185,185]){solid(x,-105,100,100,48,'#707176');solid(x,115,85,100,22,'#5c6368');}
   }else if(r.template==='infirmary'){
    for(const x of [-200,200]){solid(x,-95,90,170,30,'#726d6a');solid(x,145,60,75,45,'#77736e');}
   }else if(r.template==='registry'){
    for(const x of [-190,190]){solid(x,-90,92,160,46,'#a47750');solid(x,135,68,90,26,'#c7ad78');}
   }else if(r.template==='pumps'){
    for(const x of [-190,190]){solid(x,-95,96,145,52,'#548f98');solid(x,120,70,100,32,'#9c8157');}
   }else if(r.template==='beacon'){
    for(const x of [-190,190]){solid(x,-95,90,170,48,'#8f7eae');solid(x,135,82,95,30,'#d3aa67');}
   }else if(r.template==='yard'){
    for(const x of [-210,210]){solid(x,-75,95,190,32,'#9da883');solid(x,150,70,92,25,'#b3986d');}
   }else if(r.template==='depot'){
    for(const x of [-205,205]){solid(x,-85,90,170,42,'#5b8790');solid(x,145,86,90,28,'#ba8e60');}
   }else if(r.template==='muster'){
    for(const x of [-205,205]){solid(x,-95,85,165,45,'#837699');solid(x,135,80,105,32,'#c2a770');}
   }else if(r.template==='stores'){
    for(const x of [-190,190]){solid(x,-95,85,160,40,'#a88761');solid(x,130,75,90,35,'#776d78');}
   }else{
    for(const x of [-170,170]){solid(x,40,65,95,32,'#807162');solid(x,-125,38,48,120,'#66616d');}
   }
   // Clear threshold markings identify encounters before the player commits.
   decor.push(box(r.x,r.z+245,140,5,.6,1.2,{room:r.id,color:r.optional?'#d3a451':'#a3aab8'}));
  }
  if(revision===2&&r.kind==='boss')for(const s of [-1,1])plats.push(box(r.x+s*185,r.z-150,65,65,0,110,{room:r.id}));
  if(revision>=3&&r.kind==='boss'){
   r.arena=['shelter','charge','steps'][section-1];
   const solid=(x,z,w,d,h,color)=>plats.push(box(r.x+x,r.z+z,w,d,0,h,{room:r.id,color,arena:true}));
   if(section===1){
    // Four narrow shelters leave the middle and side entrance open for circling.
    for(const x of [-180,180])for(const z of [-130,130]){
     solid(x,z,44,52,150,'#8b7860');
     decor.push(box(r.x+x,r.z+z,54,62,150,162,{room:r.id,color:'#b29865'}));
    }
   }else if(section===2){
    // Broad unobstructed charging lane; low rubble can be jumped, never a safe perch.
    for(const x of [-218,218])for(const z of [-165,165])solid(x,z,70,110,24,'#635a50');
    for(const x of [-110,110])decor.push(box(r.x+x,r.z,5,470,.6,1.2,{room:r.id,color:'#ab7845'}));
   }else{
    // Shallow terraces vary movement while remaining inside every attack's height range.
    for(const x of [-190,190])for(const z of [-150,150]){
     solid(x,z,130,130,18,'#635d79');
     solid(x,z,90,90,36,'#847599');
    }
    for(const x of [-265,265])decor.push(box(r.x+x,r.z-240,18,18,0,190,{room:r.id,color:'#ac8ed2'}));
   }
  }
  for(const s of [-1,1])decor.push(box(r.x+s*260,r.z-260,24,24,0,r.h,{room:r.id,pillar:true}));
  if(r.kind==='start')for(const s of [-1,1]){
   for(let k=0;k<8;k++)decor.push(box(r.x+s*210,r.z-130+k*28,8,8,0,160,{room:r.id,bar:true}));
   plats.push(box(r.x+s*250,r.z+115,65,80,0,24,{room:r.id}));
   walls.push(box(r.x+s*210,r.z-32,8,204,0,160,{room:r.id,collisionOnly:true}));
  }
 }
 for(const [a,b] of links){const r=rooms[a],q=rooms[b],horizontal=r.x!==q.x,x=(r.x+q.x)/2,z=(r.z+q.z)/2;
  floors.push(box(x,z,horizontal?144:180,horizontal?180:144,-20,0));roofs.push(box(x,z,horizontal?144:204,horizontal?204:144,200,218));
  for(const s of [-1,1])walls.push(box(x+(horizontal?0:s*90),z+(horizontal?s*90:0),horizontal?144:24,horizontal?24:144,0,200));
 }
 if(revision>=5){
  // Scale the architecture, not the hero or attack ranges. Old revisions remain exact.
  for(const group of [rooms,walls,floors,plats,roofs,decor])for(const o of group){
   o.x*=1.25;o.z*=1.25;o.w*=1.25;o.d*=1.25;
   if(o.waypoints)for(const pt of o.waypoints){pt.x*=1.25;pt.z*=1.25;}
   if(o.cache){o.cache.x*=1.25;o.cache.z*=1.25;}
   if(o.cacheGoal){o.cacheGoal.x*=1.25;o.cacheGoal.z*=1.25;}
  }
  for(const o of plats){
   if(o.room===2){o.x=rooms[2].x+(o.x-rooms[2].x)*.5;o.w=78;o.d=66;o.h=o.h>30?56:24;}
   if(o.cacheStep){o.w=58;o.d=68;}
  }
  const bridge=rooms[2];bridge.waypoints=[{x:bridge.x,z:bridge.z+281,y:0},...plats.filter(o=>o.room===2).map(o=>({x:o.x,z:o.z,y:o.h})),{x:bridge.x,z:bridge.z-281,y:0}];
 }
 if(revision>=6){const bridge=rooms[9];bridge.waypoints=[{x:bridge.x,z:bridge.z+281,y:0},...plats.filter(o=>o.room===9).map(o=>({x:o.x,z:o.z,y:o.h})),{x:bridge.x,z:bridge.z-281,y:0}];}
 if(revision>=9){const bridge=rooms[12];bridge.waypoints=[{x:bridge.x,z:bridge.z+281,y:0},...plats.filter(o=>o.room===12).map(o=>({x:o.x,z:o.z,y:o.h})),{x:bridge.x,z:bridge.z-281,y:0}];}

 if(revision>=6){
  for(const room of rooms.filter(r=>['fight','waves','vault'].includes(r.kind))){
   room.encounterVariant=(seed+section+room.id)%3;
   // Pick actual clear floor positions after scaling the architecture. Never spawn inside cover.
   const candidates=[[-250,-210],[250,-210],[0,-230],[-245,120],[245,120],[0,110],[-80,-65],[80,-65],[0,0]];
   const clear=candidates.filter(([x,z])=>!plats.some(o=>Math.abs(room.x+x-o.x)<o.w/2+35&&Math.abs(room.z+z-o.z)<o.d/2+35));
   const offset=room.encounterVariant%clear.length;
   room.spawnPoints=clear.slice(offset).concat(clear.slice(0,offset));
  }
 }

 const exit={x:rooms[4].x,z:rooms[4].z-170,y:0};
 const bounds={minX:Math.min(...rooms.map(r=>r.x-r.w/2-20)),maxX:Math.max(...rooms.map(r=>r.x+r.w/2+20)),minZ:Math.min(...rooms.map(r=>r.z-r.d/2-20)),maxZ:revision>=5?395:320};
 // Only fresh runs get the encounter gates. Old checkpoint geometry is immutable.
 const barriers=revision>=11?[[1,2],[3,7],[7,9],[8,11],[11,12],[13,4]].map(([from,to])=>{
  const a=rooms[from],b=rooms[to],alongX=Math.abs(a.x-b.x)>10;
  return {from,to,x:(a.x+b.x)/2,z:(a.z+b.z)/2,w:alongX?24:225,d:alongX?225:24,h:220,ori:alongX?'z':'x',type:'combat'};
 }):null;
 return {version:VERSION,revision,exit,bounds,seed,section,tier,rooms,links,walls,floors,plats,roofs,decor,side,...(revision>=9?{mainRoute:[1,3,7,8,11,13,4]}:{}),...(barriers?{barriers}:{}),title:['Prison cells','The underworks','Escape gate'][section-1]||'Prison'};
}
function encounter(room,tier,wave=0){
 if(room.dungeonSection){
  // Familiar campaign enemies keep their normal AI and silhouettes. The
  // prison guards remain the connective tissue rather than a sole roster.
  const sections={
   1:{default:[['prison_guard','revenant','prison_pike'],['sentinel','prison_hound','bones']],registry:[['caster','prison_pike','revenant'],['prison_guard','sentinel','caster']],yard:[['prison_hound','dustjackal','prison_guard'],['sentinel','revenant','prison_pike']],stores:[['prison_pike','revenant'],['prison_guard','sentinel']]},
   2:{default:[['prison_vessel','frostlobber','prison_hound'],['magmaskit','prison_guard','frostshell']],pumps:[['magmaskit','prison_pike','frostlobber'],['prison_guard','frostshell','prison_vessel']],depot:[['prison_hound','magmaskit','frostshell'],['frostlobber','prison_guard','prison_vessel']],stores:[['prison_pike','frostshell'],['prison_hound','magmaskit']]},
   3:{default:[['prison_guard','blinkstalker','prison_pike'],['royalarcanist','prison_hound','prison_vessel']],beacon:[['sunpriest','prison_pike','blinkstalker'],['prison_guard','royalarcanist','prison_hound']],muster:[['siegeknight','prison_vessel','prison_hound'],['royalarcanist','blinkstalker','prison_guard']],stores:[['prison_pike','blinkstalker'],['prison_guard','siegeknight']]}
  };
  const groups=sections[room.dungeonSection],pack=(groups[room.template]||groups.default)[(wave+(room.encounterVariant||0))%2];
  const count=room.kind==='vault'?2:2+tier,positions=room.spawnPoints?.length>=count?room.spawnPoints:[[-245,-185],[245,-185],[-235,115],[235,115],[0,-210],[0,115]];
  return Array.from({length:count},(_,i)=>({type:pack[i%pack.length],x:positions[i][0],z:positions[i][1]}));
 }
 const packs={gallery:[['prison_guard','prison_vessel','prison_pike'],['prison_vessel','prison_hound','prison_pike']],kennels:[['prison_hound','prison_hound','prison_pike'],['prison_guard','prison_hound','prison_hound']],barricades:[['prison_guard','prison_pike','prison_vessel'],['prison_hound','prison_vessel','prison_guard']]};
 packs.refectory=packs.barricades;packs.cistern=[['prison_vessel','prison_pike','prison_hound'],['prison_hound','prison_guard','prison_vessel']];
 packs.armory=[['prison_guard','prison_pike','prison_guard'],['prison_hound','prison_pike','prison_vessel']];
 packs.liftbay=[['prison_pike','prison_vessel','prison_hound'],['prison_hound','prison_hound','prison_guard']];
 packs.watchpost=[['prison_pike','prison_pike','prison_vessel'],['prison_hound','prison_guard','prison_pike']];
 packs.infirmary=[['prison_vessel','prison_vessel','prison_guard'],['prison_hound','prison_pike','prison_vessel']];
 const pack=(packs[room.template]||packs.barricades)[(wave+(room.encounterVariant||0))%2],count=room.kind==='vault'?2:2+tier;
 const positions=room.spawnPoints?.length>=count?room.spawnPoints:room.kind==='vault'?[[-80,60],[90,70]]:[[-75,-35],[85,-170],[65,95],[-80,-190],[0,140]];
 return Array.from({length:count},(_,i)=>({type:pack[i%pack.length],x:positions[i][0],z:positions[i][1]}));
}
function chestRarity(room,revision){if(room.kind==='boss')return 'uncommon';if(revision>=5)return room.id===3?'common':null;return ['fight','waves'].includes(room.kind)?'common':null;}
function roomAdvice(room){if(room.mechanic==='wards')return 'Destroy both glowing wards to stop the guards arriving.';if(room.mechanic==='hold')return 'Stand in the marked circle to charge the gate. Guard waves will interrupt you.';return {registry:'Use the record desks as cover from casters.',pumps:'The pumps split the room into two lanes.',beacon:'Arcane guards and fast stalkers share this room.',yard:'Sidestep chargers and use the low barriers.',depot:'The supply racks make cover between waves.',muster:'The heavy guard is slow; circle around it.',stores:'An optional elite guards the supplies.',armory:'Shield racks break the guards’ line of attack.',liftbay:'Use the loading platforms to flank the guards.',watchpost:'Pike guards watch the long lane. Use the side cover.',infirmary:'Vessels set the floor alight. Keep moving.',cistern:'The islands interrupt a straight charge.',refectory:'Tables divide the room into two fighting lanes.',kennels:'Hounds rush in a straight line. Step aside.',gallery:'The split gallery has more than one approach.',barricades:'Use the barricades to break line of sight.'}[room.template]||'Watch each enemy before you commit.';}
function roomAt(plan,p){return plan.rooms.find(r=>Math.abs(p.x-r.x)<r.w/2&&Math.abs(p.z-r.z)<r.d/2);}
window.BFPrisonDungeon={VERSION,BASE,offers,upgrades,profile,saves,validCheckpoint,credit,price,buy,layout,encounter,chestRarity,roomAdvice,roomAt,copy};
})();
