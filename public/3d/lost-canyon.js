/* Lost Canyon: a holding basin, rescue routes and visibly changing world state. */
(function(root){
 'use strict';
 const paths={
  arrival:[[0,330,220],[0,-300,220],[0,-600,140],[0,-1000,60],[0,-1450,0]],
  records:[[0,-300,220],[-420,-380,180],[-680,-650,120]],
  roof:[[120,-400,190],[600,-540,230],[1050,-950,220],[1000,-1350,150],[650,-1770,0]],
  west:[[-450,-1450,0],[-950,-2100,0],[-1000,-2800,0],[-650,-3400,0],[0,-3900,0]],
  east:[[650,-1770,0],[1100,-2250,0],[1000,-2900,0],[650,-3550,0],[0,-3900,0]],
  alarm:[[1000,-2350,0],[750,-2600,90],[400,-2670,180],[0,-2550,180]],
  oldCage:[[-1000,-2800,0],[-1500,-2780,40],[-2000,-2600,90],[-2200,-2300,90]],
  freight:[[-1500,-2780,40],[-1700,-3130,0],[-2200,-3480,0],[-2300,-3830,0]],
  cave:[[1140,-2450,0],[1700,-2460,0],[2150,-2800,0],[2400,-3420,0]],
  return:[[2400,-3420,0],[2500,-3980,100],[2050,-4360,220],[1250,-4500,180],[600,-4600,60],[0,-4620,0]],
  exit:[[0,-3900,0],[0,-4620,0],[0,-5100,0]]
 };
 const cages={south:{x:-780,z:-2120,y:0},north:{x:640,z:-3550,y:0},extra:{x:-2200,z:-2300,y:90}};
 function ready(s){return ['lc.rescue','lc.south','lc.north','lc.alarm','lc.escape'].every(k=>s.flags[k]);}
 function quest(s){const f=s.flags;return !f['lc.entry']?'Enter the holding yard: orders, force, or the upper side path':!f['lc.rescue']?'Speak to Ruth by the first cage yard':!f['lc.south']||!f['lc.north']?'Free both prisoner groups · '+Number(!!f['lc.south'])+' south / '+Number(!!f['lc.north'])+' north':!f['lc.alarm']?'Stop the alarm winch above the yard':!f['lc.escape']?'Open the escape gate beyond the shelter':'Follow the prisoners toward the last crossing';}
 function build(a){const {G,seg,plat,solid,spawn}=a;
  for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
  Object.assign(G,{haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,vertical:true});
  G.canyon={revision:2003,walks:{},cages,gateSpawned:false,alarmSpawned:false,prisoners:{},seen:{}};G.canyonPrisoners=[];
  G.areaName='Hollow Pass · Lost Canyon';G.campaignLayout={revision:2003,experience:{title:'Lost Canyon',objectives:['Enter the holding yard','Free the prisoners','Open their escape route']}};
  const rooms=[['Lift Landing',0,220,750,650,220],['Gate Records',-650,-630,480,480,120],['South Holding Yard',0,-1920,2200,1350,0],['North Cages',640,-3540,900,820,0],['Ruth’s Shelter',0,-3990,900,720,0],['Old Cage',-2200,-2300,580,570,90],['Freight Store',-2050,-3580,900,900,0],['Hidden Canyon Floor',2350,-3310,850,900,0],['High Return',2000,-4380,720,480,220],['Last Crossing Approach',0,-5000,780,680,0]];
  for(const [name,x,z,w,d,y]of rooms){G.rooms.push({name,x,z,w,d,y,monsters:[],encounter:false,cleared:true});if(y)plat(x,z,y,w,d,{checkpoint:true});else seg(x,z,w,d);}
  function route(p,width=300){const out=[];for(let j=1;j<p.length;j++){const u=p[j-1],v=p[j],n=Math.ceil(Math.max(Math.hypot(v[0]-u[0],v[1]-u[1])/110,Math.abs(v[2]-u[2])/18));for(let k=0;k<=n;k++){const q=u.map((x,i)=>x+(v[i]-x)*k/n);if(q[2]>0)plat(q[0],q[1],q[2],width,width,{checkpoint:true});else seg(q[0],q[1],width,width);out.push(q);}}return out;}
  for(const [id,p]of Object.entries(paths))G.canyon.walks[id]=route(p,id==='roof'?210:id==='oldCage'?260:360);
  plat(0,-2550,180,520,380,{slab:18,checkpoint:true});
  // The prison is spread around a large rock spine. Circling either side is a real route choice.
  for(const [x,z,w,d,h]of [[-520,70,170,620,480],[520,80,180,620,530],[-1050,-650,190,580,440],[350,-850,170,550,460],[-1450,-1780,210,650,530],[100,-3190,420,590,550],[-450,-3060,210,400,410],[1440,-3250,170,600,530],[-2600,-3490,230,900,600],[-1900,-4070,400,160,400],[2740,-3240,220,800,550],[2820,-4210,230,700,660],[-650,-4620,210,570,580],[600,-5110,210,500,610]])plat(x,z,h,w,d,{canyonCliff:true});
  const block=(id,x,z,y,w,d,h=170)=>G.obstacles.push({kind:'col',x,z,y0:y,h:y+h,w,d,invisible:true,lcBlock:id});
  block('gate',0,-940,70,400,28);block('wagon',1420,-2460,0,40,340);block('rail',-2280,-3830,0,330,22);block('escape',0,-4610,0,400,28);
  for(const [id,c]of Object.entries(cages))block(id,c.x,c.z+95,c.y,170,15,140);
  // Small shelters, wheels and rails have clear usable space around them.
  for(const [x,z]of [[-570,-1670],[890,-1830],[-760,-2700],[1150,-3170],[-350,-4070]])solid(x,z,0,100,62,80,'#6f5239');
  for(const x of [-220,220])for(const z of [-3940,-4220])solid(x,z,0,14,130,14,'#775b3c');
  G.deco.push({x:0,z:-4090,y0:130,w:500,h:16,d:340,c:'#587a72',nocol:true});
  // Side cave walls stay outside its walkable center; ceiling is rendered separately.
  for(const z of [-2340,-2580])solid(1580,z,0,440,145,55,'#a27b4f');
  G.obstacles.push({kind:'plat',x:1580,z:-2460,y0:143,h:159,w:440,d:300,invisible:true});
  // The arrival lift, supply tents and abandoned personal belongings give each yard a purpose.
  const detail=(x,z,y,w,h,d,c)=>G.deco.push({x,z,y0:y,w,h,d,c,kind:'campdetail',nocol:true});
  detail(0,330,222,430,4,350,'#98784e');
  for(const x of [-215,215])for(const z of [155,505])detail(x,z,220,15,150,15,'#6b5139');detail(0,155,368,450,16,20,'#b39768');
  for(const [x,z,y]of [[-320,-90,220],[-910,-700,120],[760,-1950,0],[-1200,-2500,0],[310,-4150,0],[2470,-3180,0]]){
   detail(x,z,y,64,32,48,'#71533c');detail(x+60,z+15,y,48,25,38,'#a58b61');detail(x+15,z-60,y+2,82,6,36,'#6f8980');for(const dx of [-23,23])detail(x+dx,z,y+33,5,3,49,'#b19a70');detail(x,z,y+35,59,3,4,'#b19a70');
  }
  for(const [x,z]of [[-680,-1770],[780,-2160]]){for(const dx of [-100,100])for(const dz of [-75,75])detail(x+dx,z+dz,0,12,105,12,'#776044');detail(x,z,106,225,8,180,'#53646b');detail(x,z-65,18,150,5,35,'#8f754e');}
  for(const [x,z,y]of [[-220,-900,70],[1180,-1950,0],[-2460,-2300,90]]){detail(x,z,y,10,170,10,'#65523e');detail(x+32,z,y+105,58,55,4,'#595264');detail(x+32,z+3,y+120,9,30,3,'#b5a188');}
  G.storyNpcs=[{id:'ward',name:'Captain Ward',x:-90,z:-630,y:140},{id:'ruth',name:'Ruth',x:-440,z:-1450,y:0}];
  const o=(key,label,x,z,y=0,kind='lever')=>({key,label,x,z,y,kind});
  G.storyObjects=[o('lc.orders','Read the shift orders',-650,-650,120,'orders'),o('lc.force','Pull the locked gate chain',50,-860,90,'chain'),o('lc.gate','Open the front gate',80,-880,85),o('lc.side','Lower the side ladder',820,-1520,80,'rope'),
   ...Object.entries(cages).map(([id,c])=>({...o('lc.cage.'+id,'Release the '+(id==='extra'?'old':id)+' cage',c.x,c.z+135,c.y,'lock'),guardGroup:id,blockedLabel:'Drive off the cage guards first',blockedText:'The guards are too close to the cage door.'})),
   o('lc.alarm','Cut the alarm cable',0,-2550,180,'winch'),o('lc.escape','Open the escape gate',90,-4520,0,'chain'),o('lc.wagon','Unload the blocking wagon',1350,-2460,0,'wagon'),o('lc.water','Fill a clean water flask',2200,-3040,0,'water'),
   o('lc.rail.clue','Inspect the loaded cart',-1750,-3100,0,'cart'),...['north','west','south','east'].map((d,i)=>o('lc.rail.'+d,'Turn the cart '+d,-2080+i*95,-3700,0,'rail')),o('lc.cache','Open the cave supply chest',2500,-3510,0,'chest')];
  for(const [x,z]of [[450,-1750],[-650,-3260],[320,-4050],[2240,-3250]])G.healpads.push({x,z,y:0,r:32,charge:1,_acc:0});
  const roster=[['grunt',-720,-1920,'south'],['caster',-1080,-2140,'south'],['grunt',710,-3320,'north'],['grunt',900,-3610,'north'],['grunt',-2020,-2240,'extra'],['caster',-2380,-2390,'extra'],['galewisp',400,-2570,null],['dustjackal',2320,-3180,null],['cragspitter',2540,-3700,null]];
  for(const [type,x,z,group]of roster){const e=spawn(type,x,z,false);if(group)e.canyonGuard=group;if(group==='extra')e.y=90;}
  G.bounds={minX:-2880,maxX:3010,minZ:-5500,maxZ:660};G.progressEnd=-5450;G.portalPos={x:0,z:-5250,y:0};G.goalPos={...G.portalPos};G.startPos={x:0,z:330};G.lastSafe={x:0,z:330,y:220};Object.assign(G.p,{x:0,z:330,y:220,vy:0});
 }
 function guards(G){const result={gate:0,south:0,north:0,extra:0};for(const e of G.enemies||[])if(e.canyonGuard&&!e.dead&&e.hp>0)result[e.canyonGuard]++;return result;}
 function available(key,G,s,counts=guards(G)){if(key==='lc.gate')return !!s.flags['lc.gate.fight']&&!counts.gate;const group=key.startsWith('lc.cage.')&&key.slice(8);return !group||!counts[group];}
 function sync(a){const {G,state:s,seg,openWay,spawn,host,toast}=a,f=s.flags,c=G.canyon;if(!c)return;
  const open={gate:f['lc.entry'],wagon:f['lc.wagon'],rail:f['lc.rail.open'],escape:f['lc.escape'],south:f['lc.south'],north:f['lc.north'],extra:f['lc.extra']};
  G.obstacles=G.obstacles.filter(o=>!o.lcBlock||!open[o.lcBlock]);
  if(f['lc.gate.fight']&&!c.gateSpawned){c.gateSpawned=true;if(host){for(const [x,z]of [[-110,-1100],[120,-1180],[0,-1380]]){const e=spawn('grunt',x,z,false);e.canyonGuard='gate';}}}
  if(f['lc.alarm.called']&&!c.alarmSpawned){c.alarmSpawned=true;c.alarmAt=G.time+2;toast('The alarm rings. Two guards are coming down the east steps!');}
  if(f['lc.south']&&f['lc.north']&&!c.shortcut){c.shortcut=true;seg(-590,-3080,270,1060,{bridge:true});toast('Both cage groups are free. The prisoners have laid a shortcut beside the rock spine.');}
  if(f['lc.south']&&f['lc.north']){const ruth=G.storyNpcs.find(n=>n.id==='ruth');Object.assign(ruth,{x:40,z:-3950,y:0});}
  for(const [id,cell]of Object.entries(cages)){
   if(!c.prisoners[id]){const n={id:'canyon_'+id,name:id==='extra'?'Freed worker':'Prisoner',x:cell.x-25,z:cell.z,y:cell.y,group:id};c.prisoners[id]=n;G.canyonPrisoners.push(n,{id:n.id+'_b',name:'Prisoner',x:n.x+45,z:n.z+25,y:n.y,follow:id});}
   const n=c.prisoners[id];if(f['lc.'+id]&&!n.route){n.route=id==='south'?[[cell.x,cell.z,cell.y],[-950,-2500,0],[-1000,-2800,0],[-650,-3400,0],[-140,-4060,0]]:id==='north'?[[cell.x,cell.z,cell.y],[600,-3850,0],[100,-4150,0]]:[[cell.x,cell.z,cell.y],[-2000,-2600,90],[-1500,-2780,40],[-1000,-2800,0],[-650,-3400,0],[170,-4050,0]];n.route.splice(1,0,[cell.x,cell.z+175,cell.y],[cell.x+170,cell.z+175,cell.y],[cell.x+170,cell.z-170,cell.y]);n.step=1;n.walking=true;}
  }
  for(const [key,message]of [['lc.entry','The holding yard is open. Find Ruth beside the south cages.'],['lc.wagon','The cave passage is clear. A lower trail loops around the prison.'],['lc.rail.open','The freight cart rolls aside, revealing a hidden store.']])if(f[key]&&!c.seen[key]){c.seen[key]=true;toast(message);}
  if(ready(s)){G.qs['lc.rescue']=1;openWay();}
 }
 function tick(a,dt){const {G,spawn,host}=a,c=G.canyon;if(!c)return;
  if(c.alarmAt&&G.time>=c.alarmAt){c.alarmAt=0;if(host)for(const [x,z]of [[1070,-2600],[1100,-2780]])spawn('grunt',x,z,false);}
  for(const n of G.canyonPrisoners){if(n.follow){const leader=c.prisoners[n.follow];Object.assign(n,{x:leader.x+45,z:leader.z+25,y:leader.y,walking:leader.walking,_yaw:leader._yaw});continue;}if(!n.walking)continue;const p=n.route[n.step],dx=p[0]-n.x,dz=p[1]-n.z,d=Math.hypot(dx,dz),q=Math.min(1,dt*100/Math.max(1,d));n.x+=dx*q;n.z+=dz*q;n.y=a.height?a.height(n.x,n.z,12):n.y+(p[2]-n.y)*q;n._yaw=Math.atan2(dx,dz);if(d<4){n.step++;if(n.step>=n.route.length)n.walking=false;}}
 }
 function shards(s){return s.flags['lc.rail.open']?[{id:'HP-04',x:-2280,z:-3890,y:0}]:[];}
 function visualKey(s){return ['lc.entry','lc.wagon','lc.rail.open','lc.south','lc.north','lc.extra','lc.escape'].map(k=>Number(!!s.flags[k])).join('');}
 function draw(a,t){const {G,state:s,bx}=a,f=s.flags;if(!G.canyon)return;
  for(const [id,c]of Object.entries(cages)){const open=f['lc.'+id];for(const dx of [-105,105])for(const dz of [-95,95])bx(c.x+dx,c.y+75,c.z+dz,14,150,14,'#68563d');for(const dz of [-95,95])bx(c.x,c.y+150,c.z+dz,226,12,18,'#94744a');for(let i=-3;i<=3;i++){bx(c.x+i*27,c.y+70,c.z-95,7,140,7,'#635e53');if(!open)bx(c.x+i*27,c.y+70,c.z+95,7,140,7,'#635e53');}for(const dx of [-105,105])for(let i=-2;i<=2;i++)bx(c.x+dx,c.y+70,c.z+i*30,7,140,7,'#635e53');if(open)bx(c.x+120,c.y+70,c.z+40,12,130,110,'#786d51');}
  const gates=[['lc.entry',0,-940,70,390],['lc.escape',0,-4610,0,390],['lc.rail.open',-2280,-3830,0,320]];
  for(const [flag,x,z,y,w]of gates){for(const dx of [-w/2,w/2])bx(x+dx,y+90,z,18,180,18,'#73543b');bx(x,y+184,z,w+24,16,20,'#ab895b');if(!f[flag])for(let j=0;j<9;j++)bx(x-w/2+20+j*(w-40)/8,y+80,z,10,160,10,'#73644b');}
  for(const o of G.storyObjects){const y=o.y||0;
   if(o.kind==='orders'){bx(o.x,y+27,o.z,95,54,65,'#7f5937');bx(o.x,y+56,o.z,58,3,40,'#e3cfaa');for(let k=0;k<4;k++)bx(o.x,y+59,o.z-12+k*7,34,2,2,'#584e40');}
   else if(o.kind==='lock'){if(!f['lc.'+o.key.slice(8)]){bx(o.x,y+54,o.z-15,22,28,10,'#bb985e');bx(o.x,y+73,o.z-15,15,12,8,'#6a6253');}}
   else if(o.kind==='wagon'){const x=f['lc.wagon']?1550:1420,z=f['lc.wagon']?-2290:-2460;bx(x,40,z,150,55,170,'#795632');for(const dx of [-83,83])for(const dz of [-55,55])bx(x+dx,24,z+dz,12,48,48,'#433d32');if(!f['lc.wagon'])for(const dx of [-35,35])bx(x+dx,92,z,54,52,120,'#b19767');}
   else if(o.kind==='water'){bx(o.x,9,o.z,120,18,95,'#766e56');bx(o.x,20,o.z,100,3,75,'#739b9a');if(!f['lc.water'])bx(o.x+44,34,o.z+20,13,26,13,'#acaf93');}
   else if(o.kind==='chest'){bx(o.x,26,o.z,90,52,58,'#8a683e');bx(o.x,f['lc.cache']?77:54,o.z,94,12,60,'#bd9b5c');}
   else if(o.kind==='winch'){bx(o.x,y+25,o.z,60,50,45,'#826849');for(const x of [-75,75])bx(x,y+85,o.z,14,170,14,'#70533a');bx(o.x,y+170,o.z,180,14,18,'#b7925c');if(!f['lc.alarm'])bx(o.x,y+105,o.z,3,105,3,'#d5c295');for(let k=0;k<4;k++)bx(o.x,y+145,o.z-18-k*12,18+k*13,20+k*5,14,'#b69251');}
   else if(o.kind==='rail'){bx(o.x,22,o.z,55,44,45,'#8a6b42');const dirs={north:[0,-1],west:[-1,0],south:[0,1],east:[1,0]},v=dirs[o.key.split('.').pop()];bx(o.x,48,o.z,Math.abs(v[0])?34:5,5,Math.abs(v[1])?34:5,'#e5c891');bx(o.x+v[0]*18,49,o.z+v[1]*18,12,5,12,'#e5c891');}
   else if(o.kind!=='cart'){bx(o.x,y+25,o.z,16,50,16,'#745334');bx(o.x,y+52,o.z,50,7,12,'#c7a777');}
  }
  // Follow the actual track bends from the loaded cart: north, west, south, east.
  const rail=[[-1750,-3100],[-1750,-3480],[-2200,-3480],[-2200,-3130],[-1950,-3130]];
  for(let i=1;i<rail.length;i++){const p=rail[i-1],q=rail[i],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/40);for(let k=0;k<=n;k++){const x=p[0]+(q[0]-p[0])*k/n,z=p[1]+(q[1]-p[1])*k/n;bx(x,3,z,40,4,40,'#927448');bx(x,6,z,5,3,40,'#b2a280');}}
  bx(f['lc.rail.open']?-1950:-1750,35,f['lc.rail.open']?-3130:-3100,75,64,90,'#665439');
  bx(1580,151,-2460,440,16,300,'#b18d5f');
  if(G.canyon.alarmAt>G.time){for(const x of [1070,1100])bx(x,4,-2680,110+Math.sin(t*12)*15,5,110,'#d79058');}
  for(const n of G.storyNpcs){const on=n.id==='ruth'?!f['lc.rescue']||f['lc.extra']&&!f['lc.reward']:!f['lc.entry'];if(on){const c=n.id==='ruth'&&f['lc.extra']?'#ace0b5':'#e6c483';bx(n.x,n.y+84,n.z,5,13,5,c);bx(n.x,n.y+73,n.z,5,4,5,c);}}
 }
 const api={build,sync,tick,draw,guards,available,quest,ready,shards,visualKey,paths};root.BFLostCanyon=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

