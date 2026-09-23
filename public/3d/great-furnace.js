/* Great Furnace: an occupied factory, rescue choices and readable cooling machinery. */
(function(root){'use strict';
const f=(s,id)=>!!s.flags['gf.'+id];
const paths={lowerReturn:[[-1780,-4080,220],[-2310,-4210,220],[-2310,-4980,45],[-1950,-5480,45],[-850,-5690,45]],entry:[[0,300,120],[0,-650,120],[0,-1150,120]],fault:[[-200,-500,120],[-900,-650,120],[-1100,-1200,160],[-600,-1500,160],[0,-1700,120]],main:[[0,-1700,120],[0,-2200,120],[-700,-2700,120],[-1050,-3450,120],[-750,-4120,120],[0,-4520,120]],transport:[[-700,-2700,120],[-1650,-2670,160],[-1950,-3320,220],[-1780,-4080,220],[-750,-4120,120]],east:[[0,-2200,120],[780,-2470,180],[1320,-3100,260],[1300,-4020,260],[850,-4450,180],[0,-4520,120]],cage:[[1320,-3100,260],[1970,-3090,200],[2300,-3590,140]],office:[[1300,-4020,260],[1910,-4390,360],[2160,-4870,400]],cooling:[[0,-4520,120],[-260,-4940,120],[0,-5370,120]],upper:[[-1780,-4080,220],[-2000,-4580,340],[-1500,-5050,450],[-1140,-5250,480]],exit:[[0,-6050,220],[0,-6670,260]]};
const ready=s=>f(s,'evacuated')&&f(s,'cool.open')&&f(s,'writings')&&f(s,'route');
const quest=s=>!f(s,'access')?(f(s,'alarm')?'Clear the gate guards, then raise the worker gate':'Find a way past Foreman Pike'):!f(s,'martin.met')?'Speak to Martin in the break room':!f(s,'evacuated')?(f(s,'quiet')&&!f(s,'transport')?'Stop the transport chain on the western route':f(s,'quiet')?'Ring the shelter bell, then the work bell':'Open the worker passage, then ring work bell and shelter bell'):!f(s,'cool.open')?'Trace the water pipes and cool the furnace crossing':!f(s,'writings')?'Search the command office for the seized writings':!f(s,'route')?'Show Martin the writings about Sunspire':'Cross the cooled bridge to the Colossus';
function status(G){return {office:G.enemies.filter(e=>e.furnaceOffice&&!e.dead&&e.hp>0).length,guards:G.enemies.filter(e=>e.furnaceGate&&!e.dead&&e.hp>0).length,clock:G.furnace.clock,workersT:G.furnace.workersT};}
function available(key,G,remote){const st=remote||status(G);return key==='gf.gate'?!st.guards:key==='gf.writings'?!st.office:true;}
function build({G,plat,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
 Object.assign(G,{haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
 G.furnace={clock:0,workersT:0,walks:{}};G.areaName='Emberdeep Ã‚· The Great Furnace';G.campaignLayout={revision:2014,zone:'ember',area:1};
 const floor=(x,z,y,w,d)=>plat(x,z,y,w,d,{slab:30,checkpoint:true});
 for(const [id,p]of Object.entries(paths)){const walk=[];for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/100,Math.abs(b[2]-a[2])/13));for(let i=0;i<=n;i++){const q=a.map((v,k)=>v+(b[k]-v)*i/n);floor(...q,id==='upper'?155:280,id==='upper'?155:280);walk.push(q);}}G.furnace.walks[id]=walk;}
 for(const [name,x,z,y,w,d]of [['Inspection Gate',0,-850,120,800,1600],['Maintenance Bay',-1040,-1020,150,540,700],['Break Room',0,-2220,120,1050,650],['Worker Floor',-940,-3410,120,750,1350],['Transport Brake',-1940,-3450,220,620,700],['East Gallery',1320,-3630,260,650,1100],['Heat Cage',2320,-3610,140,650,620],['Command Office',2150,-4930,400,650,650],['Cooling Controls',0,-4910,120,1000,1080],['Pressure Head',-1140,-5250,480,480,380],['Furnace Door',0,-6570,260,900,820]]){floor(x,z,y,w,d);G.rooms.push({name,x,z,y,w,d,monsters:[],cleared:true,encounter:false});}
 // The open center is a deep furnace. Broad lower routes remain walkable throughout.
 for(const [x,z,y,w,d,h]of [[-520,-1080,120,90,900,340],[520,-1080,120,90,900,340],[0,-1640,120,1030,75,320],[-1450,-3440,80,90,1100,560],[-2410,-3420,140,90,1150,650],[850,-3550,100,90,750,700],[1770,-3980,180,80,430,470],[2640,-5000,250,80,750,550],[-610,-4940,20,90,900,480],[650,-6660,100,100,900,850],[-650,-6660,100,100,900,850]])G.walls.push({x,z,y0:y,w,d,h,caveWall:true,c:'#413b36',furnaceGate:z===-1640});
 G.furnace.gate=G.walls.find(w=>w.furnaceGate);floor(600,-2040,120,220,160);floor(760,-2010,120,200,200);floor(760,-2280,180,180,140);G.movers.push({furnaceLift:true,x:760,x0:760,z:-2140,w:180,d:200,h:120,px:760,py:120,amp:0,sp:0,ph:0});floor(520,-5470,120,260,260);
 // A low catch floor prevents the optional narrow pressure loop from becoming a death trap.
 floor(-1310,-5090,45,1700,1100);
 for(let i=0;i<5;i++)floor(-840+i*175,-5340-i*26,480-i*36,110,115);
 G.furnace.ledges=Array.from({length:5},(_,i)=>[-840+i*175,-5340-i*26,480-i*36]);
 for(const [kind,x,z,y,w,d,h]of [['forgeFrame',0,-780,120,910,70,570],['forgeFrame',0,-2180,120,1050,70,650],['forgeFrame',0,-6480,260,1000,80,900],['forgePipe',-590,-3210,120,100,900,210],['forgePipe',1050,-3540,260,100,850,250],['forgePipe',-330,-4860,120,95,650,190],['forgeBench',1800,-4930,400,170,85,70],['forgeRack',2410,-4800,400,150,70,140],['forgeCrates',-2050,-3240,220,120,100,100],['forgeBench',330,-2310,120,150,70,60],['forgeLamp',-290,-2180,120,35,35,155],['forgeLamp',1620,-3100,260,35,35,150],['forgeLamp',-1180,-4110,120,35,35,170]])G.deco.push({kind,x,z,y0:y,w,d,h,c:'#77614b'});
 // Furnace body stays below and away from all playable walkways.
 G.deco.push({theme:'ember',x:160,z:-3470,y0:-220,w:760,d:1080,h:380,c:'#332c29'});
 G.storyNpcs=[{id:'pike',name:'Foreman Pike',x:220,z:-1310,y:120},{id:'martin',name:'Martin',x:210,z:-2120,y:120}];
 G.ironWorkers=[0,1,2].map(i=>({id:'iron_worker'+i,name:'Worker',x:-1060+i*110,z:-3430,y:120}));
 const obj=(key,label,x,z,y,kind)=>({key:'gf.'+key,label,x,z,y,kind});
 G.storyObjects=[obj('fault','Inspect the leaking pressure pipe',-1090,-1150,160,'fault'),obj('schedule','Read the maintenance schedule',-870,-730,150,'paper'),obj('gate','Raise the worker gate',230,-1580,120,'gate'),obj('passage','Open the worker passage',-1190,-2880,120,'lever'),obj('transport','Stop the transport chain',-2040,-3510,220,'brake'),obj('workbell','Ring the work bell',-1130,-3740,120,'bell'),obj('shelterbell','Ring the shelter bell',-240,-2220,120,'bell'),obj('pipes','Read the cooling diagram',260,-4750,120,'paper'),obj('writings','Read the confiscated Sunspire writings',2290,-5080,400,'book'),obj('pressure','Release the upper pressure valve',-1150,-5310,480,'valve'),obj('cache','Read the sealed cooling-box plate',420,-5040,120,'paper'),obj('cage','Inspect the shaking work cage',2300,-3650,140,'cage')];
 for(const [i,label]of ['Fill the round tank','Open the square channel','Drain the triangle tray'].entries())G.storyObjects.push(obj('cool.'+(i+1),label,-230+i*230,-5160,120,'cool'+i));
 for(const [i,label]of ['Circle','Square','Triangle'].entries())G.storyObjects.push(obj('cache.'+(i+1),'Press '+label.toLowerCase(),310+i*105,-5260,120,'shape'+i));
 for(const [i,label]of ['Close the heat feed','Open the small air vent','Release the cage lock'].entries())G.storyObjects.push(obj('pet.'+(i+1),label,2070+i*160,-3830,140,'pet'+i));
 for(const [x,z,y]of [[-250,-200,120],[320,-2070,120],[1480,-4100,260],[-260,-6440,260]])G.healpads.push({x,z,y,r:31,charge:1,_acc:0});
 for(const [type,x,z,y,tag]of [['grunt',-50,-1500,120,'gate'],['caster',90,-1460,120,'gate'],['grunt',-150,-1320,120,'gate'],['magmaskit',-880,-2700,120],['grunt',-1000,-3370,120,'patrol'],['caster',-980,-3910,120,'patrol'],['grunt',-1790,-3020,190],['emberling',-1830,-4050,220],['grunt',1180,-2910,240],['caster',1250,-3810,260],['magmaskit',2200,-3450,140],['grunt',2170,-4730,400,'office'],['caster',2340,-4880,400,'office'],['emberling',-1730,-4830,400],['magmaskit',100,-4690,120],['grunt',180,-6330,250]]){const e=spawn(type,x,z,false);e.y=y;e.furnaceGate=tag==='gate';e.furnacePatrol=tag==='patrol';e.furnaceOffice=tag==='office';if(e.furnaceGate)e.stunT=999999;}
 G.bounds={minX:-2630,maxX:2860,minZ:-7180,maxZ:850};G.progressEnd=-6900;G.startPos={x:0,z:350,y:120};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-6840,y:260};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function actors(G,s){const t=Math.min(1,G.furnace.workersT/7);for(const [i,n]of G.ironWorkers.entries()){const route=[[-1060+i*70,-3430],[-1050+i*70,-2700],[-700+i*70,-2500],[-180+i*95,-2220]],at=f(s,'evacuated')?t*3:0,j=Math.min(2,Math.floor(at)),u=at-j;n.x=route[j][0]+(route[j+1][0]-route[j][0])*u;n.z=route[j][1]+(route[j+1][1]-route[j][1])*u;n.walking=f(s,'evacuated')&&t<1;n._yaw=.66;n.y=120;}const p=G.storyNpcs.find(n=>n.id==='pike');if(p&&f(s,'access')){p.x=-900;p.z=-850;p.y=150;}}
function sync({G,state:s,plat,openWay,toast}){const k=G.furnace;
 if(f(s,'alarm')&&!k.alarm){k.alarm=true;for(const e of G.enemies.filter(e=>e.furnaceGate))e.stunT=0;}
 if(f(s,'access')&&!k.access){k.access=true;G.walls=G.walls.filter(w=>!w.furnaceGate);if(!f(s,'alarm'))for(const e of G.enemies.filter(e=>e.furnaceGate)){e.x=-1000;e.z=-1000;e.y=150;e.furnaceGate=false;e.stunT=999999;e.dummy=true;e.practice=true;}toast?.(f(s,'alarm')?'The worker gate is open.':'Pike sends the gate patrol to the faulty pipe. The passage is clear.');}
 if(f(s,'transport')&&!k.transport){k.transport=true;for(const e of G.enemies.filter(e=>e.furnacePatrol)){e.x=-2040;e.z=-3370;e.y=220;}toast?.('Transport stopped. The patrols turn back toward the brake.');}
 if(f(s,'evacuated')&&!k.evacuated){k.evacuated=true;for(let i=0;i<=14;i++)plat(-1040+i*68,-2520,120,150,220,{slab:25,checkpoint:true});toast?.('The workers leave their stations. The workers restore the service lift beside the break room and open a direct crossing.');}
 if(f(s,'cool.open')&&!k.cooled){k.cooled=true;for(let i=0;i<=10;i++)plat(0,-5370-i*68,120+i*10,300,170,{slab:30,checkpoint:true});toast?.('Water fills the channels. The furnace crossing cools and rises into place.');}
 if(f(s,'pressure')&&!k.pressure){k.pressure=true;for(let i=0;i<=7;i++)plat(-850+i*95,-5690,45+i*10,170,200,{slab:25,checkpoint:true});toast?.('Pressure released. A maintenance passage opens below the high walkway.');}
 const attempt=s.items['gf.cool.tries']||0;if(k.attempt!==undefined&&attempt!==k.attempt&&!f(s,'cool.open')&&(s.items['gf.cool']||0)===0)toast?.('The safety drain empties the tanks. Trace the pipes from the round tank.');k.attempt=attempt;
 actors(G,s);if(ready(s)){G.qs['gf.furnace']=1;openWay();}
}
function moveLift(G,m){const t=G.furnace.evacuated?G.furnace.clock%14:0,y=120+(t<3?0:t<6?(t-3)*20:t<9?60:t<12?(12-t)*20:0),p=G.p;if(p.onGround&&Math.abs(p.y-m.h)<4&&Math.abs(p.x-m.x)<m.w/2+p.r*.4&&Math.abs(p.z-m.z)<m.d/2+p.r*.4)p.y+=y-m.h;m.px=m.x;m.py=m.h;m.h=y;}
function phase(clock){const t=clock%6;return {warn:t>=3&&t<4.5,hit:t>=4.5&&t<4.85};}
function tick({G,state:s,hurt},dt){const k=G.furnace;k.clock+=dt;if(f(s,'evacuated'))k.workersT=Math.min(7,k.workersT+dt);actors(G,s);const p=G.p,h=phase(k.clock),seq=Math.floor(k.clock/6);if(!f(s,'pressure')&&h.hit&&Math.abs(p.x+1610)<105&&Math.abs(p.z+4960)<85&&p.y>360&&k.hit!==seq){k.hit=seq;hurt?.(Math.max(5,p.maxHp*.08),{x:-1610,z:-4960,name:'pressure vent'});}}
function apply(G,p,s){G.furnace.remote=p;G.furnace.clock=p.clock;G.furnace.workersT=p.workersT;const m=G.movers.find(m=>m.furnaceLift);if(m)moveLift(G,m);actors(G,s);}
function shards(s){return [...(f(s,'pressure')?[{id:'ED-03',x:-850,z:-5690,y:45}]:[]),...(f(s,'cache.open')?[{id:'ED-04',x:520,z:-5480,y:120}]:[])];}
function draw({G,state:s,bx},t){const k=G.furnace,h=phase(k.clock);
 // Gridded molten core is clearly below the routes, with a dark rim rather than a floor overlay.
 bx(160,-30,-3470,710,12,1020,'#c54e17','#ff7a21',.7);for(const x of [-210,530])bx(x,170,-3470,35,40,1100,'#514941');
 for(const o of G.storyObjects){const y=o.y;if(o.kind==='paper'||o.kind==='book'){bx(o.x,y+35,o.z,85,68,55,'#514236');bx(o.x,y+71,o.z,75,5,45,'#d4c49d');for(let i=0;i<3;i++)bx(o.x,y+75,o.z-12+i*11,45-i*8,2,2,'#504a41');}
 else if(o.kind==='bell'){bx(o.x-40,y+65,o.z,12,130,15,'#52473a');bx(o.x,y+135,o.z,95,12,20,'#52473a');bx(o.x,y+95+Math.sin(t*4)*(f(s,'evacuated')?1:0),o.z,50,55,45,'#b99a60');bx(o.x,y+55,o.z,6,35,6,'#bcb094');}
 else if(o.kind==='cage'){if(f(s,'pet.open'))continue;for(const dx of [-80,80])for(const dz of [-70,70])bx(o.x+dx,y+95,o.z+dz,12,190,12,'#5b6061');bx(o.x,y+195,o.z,180,15,165,'#5c5550');for(let j=-2;j<=2;j++)bx(o.x+j*30,y+95,o.z+75,7,180,7,'#8b8070');bx(o.x,y+28,o.z,85,42,38,'#ad4926');bx(o.x+35,y+47,o.z,28,30,27,'#edb04e');for(const dx of [-22,22])for(const dz of [-18,18])bx(o.x+dx,y+10,o.z+dz,10,22,10,'#443736');}
 else {const done=(o.kind.startsWith('cool')&&f(s,'cool.open'))||(o.kind.startsWith('pet')&&f(s,'pet.open'));bx(o.x,y+30,o.z,55,60,50,'#4d5050');bx(o.x,y+70,o.z,58,8,25,done?'#8eb9bc':'#c69454');bx(o.x,y+88,o.z,7,28,7,'#b7a586');if(o.kind.startsWith('cool')||o.kind.startsWith('shape')){const i=+o.kind.slice(-1);for(let j=0;j<=i;j++)bx(o.x-12+j*12,y+38,o.z+27,6,18,3,'#f0d99d');}}
 }
 // Visible pipe diagram: round tank -> square channel -> triangular drain, echoed by numbered controls.
 for(let i=0;i<3;i++){const x=-250+i*250,c=f(s,'cool.open')?'#65878b':'#876546';
   bx(x,158,-4870,90,70,70,c);bx(x,158,-4870,64,70,102,c);for(const y of [126,181]){bx(x,y,-4870,98,8,76,'#a59a82');bx(x,y,-4870,70,8,110,'#a59a82');}
   bx(x,199,-4870,14,25,14,'#5c6666');bx(x,213,-4870,48,6,48,'#cbb477');bx(x,157,-4817,27,31,3,'#ded3ac');bx(x+(f(s,'cool.open')?5:-5),158,-4814,3,19,3,'#4d5150');
   for(const dx of [-34,34])for(const y of [133,175])bx(x+dx,y,-4831,4,4,3,'#c2b79c');
   if(i<2){bx(x+125,148,-4870,160,16,18,'#818e8c');for(const dx of [59,188])bx(x+dx,148,-4870,8,28,28,'#b6a985');}
 }
 // Shape marks face the player at both the diagram and the control stands.
 const mark=(x,y,z,i)=>{if(i===0)for(let j=0;j<12;j++){const a=j*Math.PI/6;bx(x+Math.cos(a)*16,y+Math.sin(a)*16,z,7,7,3,'#f0d99d');}else if(i===1){for(const d of [-16,16]){bx(x+d,y,z,5,34,3,'#f0d99d');bx(x,y+d,z,34,5,3,'#f0d99d');}}else{bx(x,y-15,z,36,5,3,'#f0d99d');for(let j=0;j<6;j++)for(const d of [-1,1])bx(x+d*j*3,y+15-j*6,z,6,7,3,'#f0d99d');}};
 for(let i=0;i<3;i++){mark(-230+i*230,157,-5132,i);mark(310+i*105,157,-5232,i);}
 for(const x of [-470,470]){for(let j=0;j<6;j++)bx(x,149,-4630-j*115,12,60,12,'#605b50');bx(x,181,-4920,10,10,640,'#9c8867');}

 const warning=!f(s,'pressure')&&(h.warn||h.hit);bx(-1610,434,-4960,130,12,100,'#504c46');if(warning){for(const x of [-1715,-1505])bx(x,443,-4960,5,4,170,h.hit?'#ffb463':'#ffdf95');if(h.hit)for(let i=0;i<4;i++)bx(-1610,490+i*40,-4960,70+i*20,25,70+i*20,'#d7c0a1','#d7c0a1',.35);}
 const rise=k.cooled?0:Math.sin(t*.3)*6;bx(0,180+rise,-5740,290,40,510,k.cooled?'#789093':'#a96331');
 if(f(s,'cache.open')){bx(520,142,-5480,120,44,80,'#685744');bx(580,173,-5480,120,12,85,'#9c8b62');}
 for(const n of G.storyNpcs)if(n.id==='martin'?!f(s,'route'):!f(s,'access')){bx(n.x,n.y+85+Math.sin(t*2)*2,n.z,5,14,5,'#f3d597');bx(n.x,n.y+73,n.z,5,4,5,'#f3d597');}
}
const api={paths,quest,ready,status,available,build,sync,tick,moveLift,phase,apply,actors,shards,draw};root.BFGreatFurnace=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
