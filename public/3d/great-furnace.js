/* Great Furnace: an occupied factory, rescue choices and readable cooling machinery. */
(function(root){'use strict';
const f=(s,id)=>!!s.flags['gf.'+id];
const paths={lowerReturn:[[-1780,-4080,220],[-2310,-4210,220],[-2310,-4980,45],[-1950,-5480,45],[-850,-5690,45]],entry:[[0,300,120],[0,-650,120],[0,-1150,120]],fault:[[-200,-500,120],[-900,-650,120],[-1100,-1200,160],[-600,-1500,160],[0,-1700,120]],main:[[0,-1700,120],[0,-2200,120],[-700,-2700,120],[-1050,-3450,120],[-750,-4120,120],[0,-4520,120]],transport:[[-700,-2700,120],[-1650,-2670,160],[-1950,-3320,220],[-1780,-4080,220],[-750,-4120,120]],east:[[0,-2200,120],[780,-2470,180],[1320,-3100,260],[1300,-4020,260],[850,-4450,180],[0,-4520,120]],cage:[[1320,-3100,260],[1970,-3090,200],[2300,-3590,140]],office:[[1300,-4020,260],[1910,-4390,360],[2160,-4870,400]],cooling:[[0,-4520,120],[-260,-4940,120],[0,-5370,120]],upper:[[-1780,-4080,220],[-2000,-4580,340],[-1500,-5050,450],[-1140,-5250,480]],exit:[[0,-6050,220],[0,-6670,260]]};
const coolingSafe=heat=>Number.isFinite(heat)&&heat<=20;
const COOL_PEDAL={x:0,z:-5150,y:120,r:145},COOL_HOLD_SECONDS=12;
const bridgeSteps=Array.from({length:11},(_,i)=>[0,-5370-i*68,120+i*10]).filter((_,i)=>i!==3&&i!==7);
const cachePistons=[[690,-5350,165,108,88,32,.72,0],[830,-5250,210,96,84,35,.94,1.6],[970,-5360,250,92,82,42,.78,3.2],[930,-5520,280,92,82,35,.87,4.1]];
const ESCORT_HP=90,ESCORT_SECONDS=22;
// This route stays on the existing worker-floor, main-walkway and break-room platforms.
const ESCORT_ROUTE=[[-990,-3430],[-880,-3000],[-690,-2700],[-350,-2450],[-150,-2220]];
const escortLive=G=>G.enemies.filter(e=>e.furnaceEscortWave&&!e.dead&&e.hp>0).length;
const ready=s=>f(s,'evacuated')&&f(s,'cool.open')&&f(s,'writings')&&f(s,'route');
const quest=(s,G)=>{const k=G?.furnace?.remote||G?.furnace||{};return !f(s,'access')?(f(s,'alarm')?'Clear the gate guards, then raise the worker gate':'Find a way past Foreman Pike'):!f(s,'martin.met')?'Speak to Martin in the break room':!f(s,'evacuated')?(!f(s,'passage')?'Open the worker passage on the lower floor':f(s,'quiet')&&!f(s,'transport')?'Stop the transport chain on the western route':k.escortRetryT>0?'The workers are regrouping. Stay near the work bell':k.escortActive?((k.escortT||0)>=ESCORT_SECONDS?'Defeat the last pursuers near the shelter':'Stay with the workers and protect them · '+Math.floor(k.escortT||0)+' / '+ESCORT_SECONDS+' seconds'):'Ring the work bell to start the worker escort'):!f(s,'cool.open')?'Hold the cooling pedal and defend it · '+Math.round(100-(k.heat??100))+'% cooled':!f(s,'writings')?'Search the command office for the seized writings':!f(s,'route')?'Show Martin the writings about Sunspire':'Cross the cooled bridge to the Colossus';};
function status(G){const k=G.furnace;return {office:G.enemies.filter(e=>e.furnaceOffice&&!e.dead&&e.hp>0).length,guards:G.enemies.filter(e=>e.furnaceGate&&!e.dead&&e.hp>0).length,coolingGuards:G.enemies.filter(e=>e.furnaceCooling&&!e.dead&&e.hp>0).length,cageGuards:G.enemies.filter(e=>e.furnaceCage&&!e.dead&&e.hp>0).length,heat:k.heat??100,pedalHeld:!!k.pedalHeld,holdSeconds:k.holdSeconds||0,coolWave:k.coolWave||0,clock:k.clock,workersT:k.workersT,escortT:k.escortT||0,escortActive:!!k.escortActive,escortRetryT:k.escortRetryT||0,escortHp:[...(k.escortHp||[ESCORT_HP,ESCORT_HP,ESCORT_HP])],escortHitT:k.escortHitT||0,escortWave:k.escortWave||0};}
function available(key,G,remote){const st=remote||status(G);if(key==='gf.evac.call')return f(G.storyState,'passage')&&!f(G.storyState,'evacuated')&&!st.escortActive&&st.escortRetryT<=0&&(!f(G.storyState,'quiet')||f(G.storyState,'transport'));if(key==='gf.cache.release')return f(G.storyState,'cool.open')&&!f(G.storyState,'cache.open');if(key==='gf.pet.release')return f(G.storyState,'pet.feed.closed')&&!st.cageGuards;return key==='gf.gate'?!st.guards:key==='gf.writings'?!st.office:true;}
function target(G,e,fallback){if(!e.furnaceEscort||!G.furnace?.escortActive||f(G.storyState,'evacuated'))return fallback;let chosen=null,distance=950;for(const n of G.ironWorkers){if(n.hp<=0)continue;const d=Math.hypot(n.x-e.x,n.z-e.z);if(d<distance){chosen=n;distance=d;}}return chosen||fallback;}
function hitEscort(G,e){const n=target(G,e,null),k=G.furnace;if(!n||e._furnaceHitSerial===e.meleeSerial||Math.abs((e.y||0)-n.y)>85||Math.hypot(e.x-n.x,e.z-n.z)>e.r+(n.r||18)+40)return false;e._furnaceHitSerial=e.meleeSerial;k.escortHp[n.escortIndex]=Math.max(0,k.escortHp[n.escortIndex]-Math.max(14,Math.round((e.dmg||10)*1.1)));n.hp=k.escortHp[n.escortIndex];k.escortHitT=.38;return true;}
function build({G,plat,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
 Object.assign(G,{haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
 G.furnace={clock:0,workersT:0,heat:100,pedalHeld:false,holdSeconds:0,coolWave:0,walks:{},upperJumps:[],escortT:0,escortActive:false,escortRetryT:0,escortHp:[ESCORT_HP,ESCORT_HP,ESCORT_HP],escortHitT:0,escortWave:0,escortCallSeen:null};G.areaName='Emberdeep · The Great Furnace';G.campaignLayout={revision:2178,zone:'ember',area:1};
 const floor=(x,z,y,w,d)=>plat(x,z,y,w,d,{slab:30,checkpoint:true});
 for(const [id,p]of Object.entries(paths)){const walk=[];for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],jump=id==='upper'&&j===2,n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/(jump?155:100),Math.abs(b[2]-a[2])/(jump?45:13)));for(let i=0;i<=n;i++){const q=a.map((v,k)=>v+(b[k]-v)*i/n);if(id!=='cooling'&&!(id==='main'&&q[1]<-4400))floor(...q,jump?90:id==='upper'?155:280,jump?90:id==='upper'?155:280);if(jump){G.furnace.upperJumps.push(q);floor(q[0],q[1],q[2]-85,185,185);}walk.push(q);}}G.furnace.walks[id]=walk;}
 for(const [name,x,z,y,w,d]of [['Inspection Gate',0,-850,120,800,1600],['Maintenance Bay',-1040,-1020,150,540,700],['Break Room',0,-2220,120,1050,650],['Worker Floor',-940,-3410,120,750,1350],['Transport Brake',-1940,-3450,220,620,700],['East Gallery',1320,-3630,260,650,1100],['Heat Cage',2320,-3610,140,650,620],['Command Office',2150,-4930,400,650,650],['Cooling Controls',0,-4910,120,1000,1080],['Pressure Head',-1140,-5250,480,480,380],['Furnace Door',0,-6570,260,900,820]]){floor(x,z,y,w,d);G.rooms.push({name,x,z,y,w,d,monsters:[],cleared:true,encounter:false});}
 // The open center is a deep furnace. Broad lower routes remain walkable throughout.
 for(const [x,z,y,w,d,h]of [[-520,-1080,120,90,900,340],[520,-1080,120,90,900,340],[0,-1640,120,1030,75,320],[-1450,-3440,80,90,1100,560],[-2410,-3420,140,90,1150,650],[850,-3550,100,90,750,700],[1770,-3980,180,80,430,470],[2640,-5000,250,80,750,550],[-610,-4940,20,90,900,480],[650,-6660,100,100,900,850],[-650,-6660,100,100,900,850]])G.walls.push({x,z,y0:y,w,d,h,caveWall:true,c:'#413b36',furnaceGate:z===-1640});
 G.furnace.gate=G.walls.find(w=>w.furnaceGate);floor(600,-2040,120,220,160);floor(760,-2010,120,200,200);floor(760,-2280,180,180,140);G.movers.push({furnaceLift:true,x:760,x0:760,z:-2140,w:180,d:200,h:120,px:760,py:120,amp:0,sp:0,ph:0});floor(520,-5470,120,260,260);
 // The optional box sits above a lower catch grate. Two low steps return a missed jump to its entry.
 plat(850,-5410,35,850,500,{slab:20});plat(740,-5490,65,100,100,{slab:20});plat(680,-5490,100,100,100,{slab:20});
 floor(760,-5580,305,260,190);
 // Keep the raised chest solid without turning the space below its landing into a wall.
 G.obstacles.push({kind:'col',x:690,z:-5580,y0:305,w:140,d:110,h:365,invisible:true});
 for(const [x,z,h,w,d,cacheAmp,sp,ph]of cachePistons)G.movers.push({furnaceCache:true,x0:x,x,z,w,d,h,px:x,py:h,cacheAmp,amp:0,sp,ph});
 // A low catch floor prevents the optional narrow pressure loop from becoming a death trap.
 floor(-1310,-5090,45,1700,1100);
 for(let i=0;i<5;i++)floor(-840+i*175,-5340-i*26,480-i*36,110,115);
 G.furnace.ledges=Array.from({length:5},(_,i)=>[-840+i*175,-5340-i*26,480-i*36]);
 for(const [kind,x,z,y,w,d,h]of [['forgeFrame',0,-780,120,910,70,570],['forgeFrame',0,-2180,120,1050,70,650],['forgeFrame',0,-6480,260,1000,80,900],['forgePipe',-590,-3210,120,100,900,210],['forgePipe',1050,-3540,260,100,850,250],['forgePipe',-330,-4860,120,95,650,190],['forgeBench',1800,-4930,400,170,85,70],['forgeRack',2410,-4800,400,150,70,140],['forgeCrates',-2050,-3240,220,120,100,100],['forgeBench',330,-2310,120,150,70,60],['forgeLamp',-290,-2180,120,35,35,155],['forgeLamp',1620,-3100,260,35,35,150],['forgeLamp',-1180,-4110,120,35,35,170]])G.deco.push({kind,x,z,y0:y,w,d,h,c:'#77614b'});
 // Furnace body stays below and away from all playable walkways.
 G.deco.push({theme:'ember',x:160,z:-3470,y0:-220,w:760,d:1080,h:380,c:'#332c29'});
 G.storyNpcs=[{id:'pike',name:'Foreman Pike',x:220,z:-1310,y:120},{id:'martin',name:'Martin',x:210,z:-2120,y:120}];
 G.ironWorkers=[0,1,2].map(i=>({id:'iron_worker'+i,name:'Worker',escortIndex:i,x:-1060+i*70,z:-3430,y:120,r:18,h:105,hp:ESCORT_HP,maxHp:ESCORT_HP}));
 const obj=(key,label,x,z,y,kind)=>({key:'gf.'+key,label,x,z,y,kind});
 G.storyObjects=[obj('fault','Inspect the leaking pressure pipe',-1090,-1150,160,'fault'),obj('schedule','Read the maintenance schedule',-870,-730,150,'paper'),obj('gate','Raise the worker gate',230,-1580,120,'gate'),obj('passage','Open the worker passage',-1190,-2880,120,'lever'),obj('transport','Stop the transport chain',-2040,-3510,220,'brake'),obj('evac.call','Ring the work bell to lead the workers out',-1130,-3740,120,'bell'),obj('pipes','Read the cooling diagram',260,-4750,120,'paper'),obj('writings','Read the confiscated Sunspire writings',2290,-5080,400,'book'),obj('pressure','Release the upper pressure valve',-1150,-5310,480,'valve'),obj('cache','Read the sealed cooling-box plate',420,-5040,120,'paper'),obj('cage','Inspect the shaking work cage',2300,-3650,140,'cage')];
 G.storyObjects.find(o=>o.key==='gf.evac.call').blockedText='Open the worker passage first. If Martin chose the quiet route, stop the western transport chain before ringing the bell. Wait for the workers to regroup before retrying.';
 const coolingBox=obj('cache.release','Open the cooling box',850,-5580,305,'cachebox');coolingBox.boxX=690;G.storyObjects.push(coolingBox);
 G.storyObjects.push(obj('pet.feed','Shut the cage heat feed',2050,-3410,140,'petfeed'),obj('pet.release','Open Cinder’s cage lock',2375,-3690,140,'petlock'));
 for(const o of G.storyObjects){if(o.key==='gf.cache.release'){o.blockedLabel='Cool the crossing to drive the gantry';o.blockedText='The box is sealed. Stand on the cooling pedal to drive cold water through the furnace crossing.';}if(o.key==='gf.pet.release'){o.blockedLabel='Shut the heat feed and clear the cage guards';o.blockedText='The cage is still hot or its guards are too close. Shut the feed at the bay entrance and defeat the cage guards.';}}
 for(const [x,z,y]of [[-250,-200,120],[320,-2070,120],[1480,-4100,260],[-260,-6440,260]])G.healpads.push({x,z,y,r:31,charge:1,_acc:0});
 for(const [type,x,z,y,tag]of [['grunt',-50,-1500,120,'gate'],['caster',90,-1460,120,'gate'],['grunt',-150,-1320,120,'gate'],['magmaskit',-880,-2700,120],['grunt',-1000,-3370,120,'patrol'],['caster',-980,-3910,120,'patrol'],['grunt',-1790,-3020,190],['emberling',-1830,-4050,220],['grunt',1180,-2910,240],['caster',1250,-3810,260],['magmaskit',2200,-3450,140],['grunt',2170,-4730,400,'office'],['caster',2340,-4880,400,'office'],['emberling',-1730,-4830,400],['magmaskit',100,-4690,120],['grunt',300,-5010,120,'cooling']]){const e=spawn(type,x,z,false);e.y=y;e.furnaceGate=tag==='gate';e.furnacePatrol=tag==='patrol';e.furnaceOffice=tag==='office';e.furnaceCooling=tag==='cooling';if(e.furnaceGate)e.stunT=999999;}
 G.bounds={minX:-2630,maxX:2860,minZ:-7180,maxZ:850};G.progressEnd=-6900;G.startPos={x:0,z:350,y:120};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-6840,y:260};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function actors(G,s,remote){const k=remote||G.furnace,t=f(s,'evacuated')?1:k.escortRetryT>0?0:k.escortActive?Math.min(1,(k.escortT||0)/ESCORT_SECONDS):0;for(const [i,n]of G.ironWorkers.entries()){const at=t*(ESCORT_ROUTE.length-1),j=Math.min(ESCORT_ROUTE.length-2,Math.floor(at)),u=at-j,a=ESCORT_ROUTE[j],b=ESCORT_ROUTE[j+1];n.x=a[0]+(b[0]-a[0])*u+(i-1)*70;n.z=a[1]+(b[1]-a[1])*u;n.walking=!!k.escortActive&&k.escortRetryT<=0&&t<1;n._yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);n.y=120;n.hp=(k.escortHp||[])[i]??ESCORT_HP;n.maxHp=ESCORT_HP;}const p=G.storyNpcs.find(n=>n.id==='pike');if(p&&f(s,'access')){p.x=-900;p.z=-850;p.y=150;}}
function sync({G,state:s,plat,spawn,host=true,openWay,toast}){const k=G.furnace;if(s.notes['gf.pipes'])s.notes['gf.pipes'].text='The workers restored the pump. Stand on the wide blue pedal to drive water through the furnace pipes. Defend it while the heat gauge falls. Stepping away stops the flow; step back to try again. The cooled crossing has two broken sections to jump.';if(s.notes['gf.cool'])s.notes['gf.cool'].text='Stand on the wide blue pedal in the cooling room. Keep it pressed while fighting the guards. Cold water lowers the heat gauge and raises the crossing.';if(s.notes['gf.cache'])s.notes['gf.cache'].text='Cold water drives the moving counterweights east of the cooling room. Cross them to open the box above. The lower grate leads back if you fall.';if(s.notes['gf.cage'])s.notes['gf.cage'].text='The heat feed enters the cage bay from the east gallery. Shut it off, defeat the guards drawn to the broken line, then open the cage lock. Martin may know more.';
 if(s.notes['gf.workers'])s.notes['gf.workers'].text=f(s,'quiet')?'Stop the western transport chain, then ring the work bell. Stay close to the workers and defend them on the way to the break room. If someone falls, ring again after they regroup.':'Open the worker passage, then ring the work bell. Stay close to the workers and defend them on the way to the break room. If someone falls, ring again after they regroup.';
 if(s.notes['gf.passage'])s.notes['gf.passage'].text='Ring the work bell to begin the escort. Stay with the workers and protect them until they reach the break room.';
 const calls=s.items['gf.evac.calls']||0;
 if(k.escortCallSeen===null)k.escortCallSeen=calls;
 else if(calls>k.escortCallSeen){k.escortCallSeen=calls;if(host&&!f(s,'evacuated')){for(const e of G.enemies)if(e.furnaceEscortWave)e.dead=true;k.escortActive=true;k.escortT=0;k.escortWave=0;k.escortRetryT=0;k.escortHp.fill(ESCORT_HP);k.escortHitT=0;toast?.('The workers are moving. Stay near them and keep the Legion off each person.');}}
 if(f(s,'alarm')&&!k.alarm){k.alarm=true;for(const e of G.enemies.filter(e=>e.furnaceGate))e.stunT=0;}
 if(f(s,'access')&&!k.access){k.access=true;G.walls=G.walls.filter(w=>!w.furnaceGate);if(!f(s,'alarm'))for(const e of G.enemies.filter(e=>e.furnaceGate)){e.x=-1000;e.z=-1000;e.y=150;e.furnaceGate=false;e.stunT=999999;e.dummy=true;e.practice=true;}toast?.(f(s,'alarm')?'The worker gate is open.':'Pike sends the gate patrol to the faulty pipe. The passage is clear.');}
 if(f(s,'transport')&&!k.transport){k.transport=true;for(const e of G.enemies.filter(e=>e.furnacePatrol)){e.x=-2040;e.z=-3370;e.y=220;}toast?.('Transport stopped. The patrols turn back toward the brake.');}
 if(f(s,'evacuated')&&!k.evacuated){k.evacuated=true;k.escortActive=false;k.escortT=ESCORT_SECONDS;k.escortHp.fill(ESCORT_HP);for(let i=0;i<=14;i++)plat(-1040+i*68,-2520,120,150,220,{slab:25,checkpoint:true});toast?.('All three workers reached shelter. They restore the service lift and open a direct crossing.');}
 if(f(s,'cool.open')&&!k.cooled){k.cooled=true;k.heat=0;for(const q of bridgeSteps)plat(...q,300,75,{slab:30,checkpoint:true});plat(0,-5750,45,460,850,{slab:20});toast?.('The crossing is cool. Jump across its two broken sections; safety steps below return you to the controls.');}
 if(f(s,'cool.open')&&!k.cachePistonsLive){k.cachePistonsLive=true;toast?.('Cold water starts the counterweights east of the cooling room.');}
 if(f(s,'pressure')&&!k.pressure){k.pressure=true;for(let i=0;i<=7;i++)plat(-850+i*95,-5690,45+i*10,170,200,{slab:25,checkpoint:true});toast?.('Pressure released. A maintenance passage opens below the high walkway.');}
 if(f(s,'cache.open')&&!k.cacheOpened){k.cacheOpened=true;toast?.('The cooling box opens. ED-04 is inside.');}
 if(f(s,'pet.feed.closed')&&!k.cageFeedClosed){k.cageFeedClosed=true;toast?.('The cage heat feed is shut. Skitters rush the broken line—clear them before opening the lock.');}
 if(k.cageFeedClosed&&!f(s,'pet.open')&&!k.cageGuardSummoned&&host&&spawn){k.cageGuardSummoned=true;for(const [x,z]of [[2280,-3380],[2520,-3500],[2490,-3830]]){const e=spawn('magmaskit',x,z,false);e.y=140;e.furnaceCage=true;e.active=true;e.dropT=0;e.label='Cage Skitter';}}
 if(f(s,'pet.open')&&!k.cageReleased){k.cageReleased=true;G.storyObjects=G.storyObjects.filter(o=>o.key!=='gf.pet.feed'&&o.key!=='gf.pet.release');toast?.('The cage opens. Cinder is free.');}
 actors(G,s);if(ready(s)){G.qs['gf.furnace']=1;openWay();}
}
function moveLift(G,m){const t=G.furnace.evacuated?G.furnace.clock%14:0,y=120+(t<3?0:t<6?(t-3)*20:t<9?60:t<12?(12-t)*20:0),p=G.p;if(p.onGround&&Math.abs(p.y-m.h)<4&&Math.abs(p.x-m.x)<m.w/2+p.r*.4&&Math.abs(p.z-m.z)<m.d/2+p.r*.4)p.y+=y-m.h;m.px=m.x;m.py=m.h;m.h=y;}
function moveCache(G,m){m.px=m.x;m.py=m.h;m.x=m.x0+Math.sin(G.furnace.clock*m.sp+m.ph)*(G.furnace.cachePistonsLive?m.cacheAmp:0);}
function phase(clock){const t=clock%6;return {warn:t>=3&&t<4.5,hit:t>=4.5&&t<4.85};}
function tick({G,state:s,host=true,spawn,complete,players,toast,hurt},dt){const k=G.furnace;k.clock+=dt;
 if(host&&!f(s,'cool.open')){
  const onPedal=(players||[G.p]).some(p=>p&&p.hp>0&&!p.downed&&Math.hypot(p.x-COOL_PEDAL.x,p.z-COOL_PEDAL.z)<=COOL_PEDAL.r&&Math.abs((p.y??COOL_PEDAL.y)-COOL_PEDAL.y)<85);
  const held=f(s,'evacuated')&&onPedal;
  if(onPedal&&!f(s,'evacuated')&&!k.pedalHinted){k.pedalHinted=true;toast?.('The pedal has no water yet. Help Martin get the workers out so they can restart the pump.');}
  if(held&&!k.pedalHeld&&!k.pedalStarted){k.pedalStarted=true;toast?.('Cold water surges through the pipes. Hold this pedal and defend the room.');}
  if(!held&&k.pedalHeld&&k.heat<90&&!k.pedalLeftHinted){k.pedalLeftHinted=true;toast?.('The water slows. Return to the cooling pedal before the furnace reheats.');}
  k.pedalHeld=held;
  k.heat=held?Math.max(0,k.heat-100/COOL_HOLD_SECONDS*dt):Math.min(100,k.heat+14*dt);
  if(held){k.holdSeconds+=dt;const next=k.holdSeconds>=8.5?3:k.holdSeconds>=4.5?2:k.holdSeconds>=.4?1:0;
   if(next>k.coolWave&&spawn){k.coolWave=next;const sites=[[-390,-4920],[390,-4930],[-370,-5340]],types=[['grunt','emberling'],['caster','grunt'],['magmaskit','grunt']];const [x,z]=sites[next-1];
    for(let i=0;i<2;i++){const e=spawn(types[next-1][i],x+i*90,z-i*25,false);if(!e)continue;e.y=120;e.active=true;e.dropT=0;e.furnaceCoolingWave=next;e.label=next===3?'Cooling Enforcer':'Legion Saboteur';}
    toast?.(next===1?'Legion guards rush the cooling room!':'Another Legion squad enters the cooling room!');
   }
  }
  if(k.heat<=0&&k.coolWave>=3)complete?.('gf.cool.complete');
 }else if(f(s,'cool.open')){k.heat=0;k.pedalHeld=false;}
 const fallen=k.cooled&&G.p.hp>0&&!G.p.downed&&G.p.y<65&&Math.abs(G.p.x)<260&&G.p.z<-5460&&G.p.z>-6200;k.bridgeFall=fallen?(k.bridgeFall||0)+dt:0;if(k.bridgeFall>1){Object.assign(G.p,{x:0,z:-5330,y:120,vy:0,vx:0,vz:0,onGround:true});k.bridgeFall=0;toast?.('The safety steps return you to the cooled crossing.');}
 if(host&&!f(s,'evacuated')){
  k.escortHitT=Math.max(0,k.escortHitT-dt);
  if(k.escortActive&&k.escortHp.some(h=>h<=0)){
   k.escortActive=false;k.escortRetryT=2.5;k.escortT=0;k.escortWave=0;
   for(const e of G.enemies)if(e.furnaceEscortWave)e.dead=true;
   toast?.('A worker fell. The group retreats to cover. Ring the work bell after they regroup.');
  }
  if(k.escortRetryT>0){k.escortRetryT=Math.max(0,k.escortRetryT-dt);if(k.escortRetryT===0){k.escortHp.fill(ESCORT_HP);toast?.('The workers are ready. Ring the work bell to try again.');}}
  if(k.escortActive){
   const near=(players||[G.p]).some(p=>p&&p.hp>0&&!p.downed&&G.ironWorkers.some(n=>Math.hypot(p.x-n.x,p.z-n.z)<620));
   if(near)k.escortT=Math.min(ESCORT_SECONDS,k.escortT+dt);
   const wave=k.escortT>=14?3:k.escortT>=8?2:k.escortT>=2?1:0;
   if(wave>k.escortWave&&spawn){k.escortWave=wave;const [x,z]=[[-1200,-3090],[-650,-2650],[-350,-2360]][wave-1],quiet=f(s,'quiet')&&f(s,'transport');
    for(let i=0;i<(quiet?2:3);i++){const e=spawn(i===1?'caster':'grunt',x+i*95,z-i*40,false);if(!e)continue;e.y=120;e.furnaceEscortWave=wave;e.furnaceEscort=i!==1;e.active=true;e.dropT=0;e.label=i===1?'Legion Disruptor':'Legion Pursuer';}
    toast?.('Legion attackers at the '+(wave===1?'lower work floor':wave===2?'service bend':'break-room approach')+'! Protect the workers.');
   }
   if(k.escortT>=ESCORT_SECONDS&&!escortLive(G))complete?.('gf.evac.complete');
  }
 }
 if(f(s,'evacuated'))k.workersT=Math.min(7,k.workersT+dt);actors(G,s,host?null:k.remote);const p=G.p,h=phase(k.clock),seq=Math.floor(k.clock/6);if(!f(s,'pressure')&&h.hit&&Math.abs(p.x+1610)<105&&Math.abs(p.z+4960)<85&&p.y>360&&k.hit!==seq){k.hit=seq;hurt?.(Math.max(5,p.maxHp*.08),{x:-1610,z:-4960,name:'pressure vent'});}}
function apply(G,p,s){G.furnace.remote=p;G.furnace.clock=p.clock;G.furnace.workersT=p.workersT;G.furnace.heat=Number.isFinite(p.heat)?p.heat:100;G.furnace.pedalHeld=!!p.pedalHeld;G.furnace.holdSeconds=p.holdSeconds||0;G.furnace.coolWave=p.coolWave||0;const m=G.movers.find(m=>m.furnaceLift);if(m)moveLift(G,m);for(const deck of G.movers)if(deck.furnaceCache)moveCache(G,deck);actors(G,s,p);}
function shards(s){return [...(f(s,'pressure')?[{id:'ED-03',x:-850,z:-5690,y:45}]:[]),...(f(s,'cache.open')?[{id:'ED-04',x:790,z:-5580,y:305}]:[])];}
function draw({G,state:s,bx},t){const k=G.furnace,h=phase(k.clock);
 // Gridded molten core is clearly below the routes, with a dark rim rather than a floor overlay.
 bx(160,-30,-3470,710,12,1020,'#c54e17','#ff7a21',.7);for(const x of [-210,530])bx(x,170,-3470,35,40,1100,'#514941');
 for(const o of G.storyObjects){const y=o.y;if(o.kind==='paper'||o.kind==='book'){bx(o.x,y+35,o.z,85,68,55,'#514236');bx(o.x,y+71,o.z,75,5,45,'#d4c49d');for(let i=0;i<3;i++)bx(o.x,y+75,o.z-12+i*11,45-i*8,2,2,'#504a41');}
 else if(o.kind==='bell'){bx(o.x-40,y+65,o.z,12,130,15,'#52473a');bx(o.x,y+135,o.z,95,12,20,'#52473a');bx(o.x,y+95+Math.sin(t*4)*(f(s,'evacuated')?1:0),o.z,50,55,45,'#b99a60');bx(o.x,y+55,o.z,6,35,6,'#bcb094');}
 else if(o.kind==='cachebox'){const open=f(s,'cache.open'),c=open?'#82cfda':'#a9b8ad',x=o.boxX??o.x;bx(x,y+18,o.z,134,36,104,'#38464a');for(const dx of [-58,58])bx(x+dx,y+41,o.z,12,15,110,'#bca66b');for(const dz of [-40,40])bx(x,y+42,o.z+dz,132,12,10,'#a69a7a');bx(x+(open?-84:0),y+(open?51:48),o.z,126,12,98,open?'#648889':'#617779');bx(x+(open?-84:0),y+(open?58:55),o.z,88,2,57,c,c,open?.45:.85);if(open)bx(x+55,y+28,o.z,55,3,46,'#a9e5e3','#a9e5e3',.6);}
 else if(o.kind==='cage'){const freed=f(s,'pet.open'),cooled=f(s,'pet.feed.closed');for(const dx of [-80,80])for(const dz of [-70,70])bx(o.x+dx,y+95,o.z+dz,12,190,12,'#5b6061');bx(o.x,y+195,o.z,180,15,165,'#5c5550');for(let j=-2;j<=2;j++)if(!freed||j<0)bx(o.x+j*30,y+95,o.z+75,7,180,7,'#8b8070');if(!freed){bx(o.x,y+28,o.z,85,42,38,cooled?'#b47d42':'#ad4926');bx(o.x+35,y+47+Math.sin(t*4)*2,o.z,28,30,27,cooled?'#ffce79':'#edb04e');for(const dx of [-22,22])for(const dz of [-18,18])bx(o.x+dx,y+10,o.z+dz,10,22,10,'#443736');}else{bx(o.x,y+20,o.z+70,145,8,25,'#b69a69');bx(o.x+24,y+42,o.z+110,34,40,32,'#f6ba58','#ef8d39');}}
 else if(o.kind==='petfeed'||o.kind==='petlock'){const cooled=f(s,'pet.feed.closed'),freed=f(s,'pet.open'),c=o.kind==='petfeed'?(cooled?'#75b8bb':'#e87537'):(freed?'#8abf9d':'#c49a55');bx(o.x,y+45,o.z,82,90,65,'#484f51');bx(o.x,y+91,o.z,95,14,74,c);bx(o.x,y+114,o.z,24,31,24,'#b3a180');for(const dx of [-30,30])bx(o.x+dx,y+50,o.z+34,10,52,10,'#b7ab86');}
 else {const done=(o.kind.startsWith('cool')&&f(s,'cool.open'))||(o.kind.startsWith('pet')&&f(s,'pet.open'));bx(o.x,y+30,o.z,55,60,50,'#4d5050');bx(o.x,y+70,o.z,58,8,25,done?'#8eb9bc':'#c69454');bx(o.x,y+88,o.z,7,28,7,'#b7a586');if(o.kind.startsWith('cool')||o.kind.startsWith('shape')){const i=+o.kind.slice(-1);for(let j=0;j<=i;j++)bx(o.x-12+j*12,y+38,o.z+27,6,18,3,'#f0d99d');}}
 }
 // The shelter bell marks the destination, without requiring another ordered input.
 bx(-220,185,-2240,12,130,15,'#52473a');bx(-180,255,-2240,95,12,20,'#52473a');bx(-180,215,-2240,50,55,45,'#b99a60');bx(-180,175,-2240,6,35,6,'#bcb094');
 // One readable circuit: cistern, overhead pipe, floor pedal, heat gauge and cooled crossing.
 const heat=k.heat??100,flow=!!k.pedalHeld||k.cooled,water=flow?'#79d4dd':'#5b7779';
 bx(-280,182,-4840,180,124,138,'#435c61');for(const y of [133,178,229])bx(-280,y,-4840,190,8,146,'#baa46f');
 bx(-280,248,-4840,110,8,100,'#d1bd80');bx(-280,253,-4840,70,3,64,water,water,.65);
 bx(0,143,-4840,410,19,34,'#465a5b');bx(260,143,-4950,30,19,250,'#465a5b');bx(125,143,-5070,280,19,30,'#465a5b');
 if(flow){bx(0,154,-4840,390,4,12,water,water,.65);bx(260,154,-4950,7,4,230,water,water,.65);bx(125,154,-5070,260,4,10,water,water,.65);}
 for(const x of [-200,200])for(const z of [-5350,-4950])bx(x,130,z,18,22,18,'#bcaa79');
 bx(0,121,-5150,332,5,332,'#283f42');for(const v of [-161,161]){bx(v,128,-5150,9,14,332,'#bfad79');bx(0,128,-5150+v,332,14,9,'#bfad79');}
 bx(0,k.pedalHeld?123:130,-5150,250,10,250,k.cooled?'#75b8bd':k.pedalHeld?'#4aa4b3':'#436a72');
 for(const x of [-98,-33,33,98])bx(x,k.pedalHeld?130:137,-5150,11,3,235,k.pedalHeld||k.cooled?'#d2efe7':'#a9c3c2');
 for(const z of [-5234,-5180,-5120,-5066])bx(0,k.pedalHeld?130:137,z,235,3,10,k.pedalHeld||k.cooled?'#d2efe7':'#a9c3c2');
 for(const x of [-143,143])for(const z of [-5293,-5007]){bx(x,139,z,16,35,16,'#a79572');bx(x,159,z,32,7,32,k.pedalHeld?'#99dae0':'#b78c54');}
 // Ten heat marks are readable from the entrance, even when the wall gauge is side-on.
 bx(0,146,-5291,262,12,24,'#2d4143');for(let i=0;i<10;i++)bx(-108+i*24,154,-5291,18,5,10,heat<=90-i*10?'#a2e2de':'#d79258');
 // The pointer descends toward a broad pale safe band; flow and steam respond to weight.
 bx(-350,199,-5170,106,187,20,'#263a3e');bx(-350,199,-5157,92,168,5,'#7e6550');bx(-350,159,-5152,84,28,4,'#79bdc6');
 for(const side of [-1,1]){bx(-350,199,-5170+side*17,82,151,3,'#4f5d5e');for(const x of [-393,-307])bx(x,199,-5170+side*21,5,156,4,'#dccba0');bx(-350,158+heat*1.25,-5170+side*25,78,9,4,heat<=20?'#c6f6f2':'#ffe5a1');}
 bx(0,180,-5280,36,32,250,'#435a5d');if(flow){bx(0,183,-5280,12,5,220,water,water,.75);bx(0,129,-5370,190,5,28,water,water,.7);if(heat>20)for(let j=0;j<4;j++)bx(-80+j*55,150+((t*36+j*19)%90),-5390,22,14,22,'#d9e7e5',null,.4);}
 for(const x of [-470,470]){for(let j=0;j<6;j++)bx(x,149,-4630-j*115,12,60,12,'#605b50');bx(x,181,-4920,10,10,640,'#9c8867');}
 // The lower grate catches a missed jump; the two broad steps lead back to the entry ledge.
 for(let j=0;j<8;j++)bx(850,39,-5625+j*61,820,3,7,j%2?'#7c7770':'#8a826d');
 for(const [x,z,y]of [[740,-5490,65],[680,-5490,100]]){bx(x,y+3,z,84,4,10,'#80acb1');bx(x,y+3,z+36,84,4,10,'#80acb1');}
 const live=f(s,'cool.open');for(const [x,z,y,w,d,amp]of cachePistons){bx(x,y-26,z,w+amp*2+16,8,14,'#525f62');for(const dx of [-w/2-amp,w/2+amp])bx(x+dx,y-38,z,11,34,26,'#6f736c');bx(x,y-14,z-d/2-10,34,6,8,live?'#93d5db':'#b16e46');}
 for(const dz of [-72,72])bx(690,309,-5580+dz,182,4,8,'#b39a6a');for(const dx of [-92,92])bx(690+dx,309,-5580,8,4,152,'#b39a6a');
 // The rescue pipe visibly changes from hot to safe; the cage bars open after the guard fight.
 const feedOff=f(s,'pet.feed.closed'),pipeColor=feedOff?'#71a9ad':'#cf642f';
 for(const [x,z,w,d]of [[2140,-3410,180,30],[2240,-3500,28,190],[2300,-3590,120,28]]){bx(x,194,z,w,24,d,'#3f4648');bx(x,195,z,w*.65,9,d*.65,pipeColor);}
 for(let j=0;j<5;j++)bx(2260+j*25,196,-3600,8,22,34,'#9d927c');

 const warning=!f(s,'pressure')&&(h.warn||h.hit);bx(-1610,434,-4960,130,12,100,'#504c46');if(warning){for(const x of [-1715,-1505])bx(x,443,-4960,5,4,170,h.hit?'#ffb463':'#ffdf95');if(h.hit)for(let i=0;i<4;i++)bx(-1610,490+i*40,-4960,70+i*20,25,70+i*20,'#d7c0a1','#d7c0a1',.35);}
 if(!k.cooled)bx(0,180+Math.sin(t*.3)*6,-5740,290,40,510,'#a96331');
 for(const n of G.storyNpcs)if(n.id==='martin'?!f(s,'route'):!f(s,'access')){bx(n.x,n.y+85+Math.sin(t*2)*2,n.z,5,14,5,'#f3d597');bx(n.x,n.y+73,n.z,5,4,5,'#f3d597');}
}
const api={coolingSafe,bridgeSteps,cachePistons,paths,quest,ready,status,available,target,hitEscort,build,sync,tick,moveLift,moveCache,phase,apply,actors,shards,draw};root.BFGreatFurnace=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
