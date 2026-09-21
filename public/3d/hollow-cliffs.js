/* Winding Cliffs: authored geometry shared by collision, scenery and route QA. */
(function(root){
 'use strict';
 const paths={
  approach:[[0,300,0],[0,-400,0],[-650,-900,0],[-1000,-1450,0],[-650,-2050,0],[0,-2450,0]],
  shelves:[[0,-400,0],[420,-700,60],[850,-1150,150],[850,-1700,200],[450,-2200,100],[0,-2450,0]],
  lookout:[[0,-3050,0],[-450,-3450,0],[-450,-3900,0],[0,-4200,0],[0,-4600,0]],
  quiet:[[150,-3200,0],[650,-3400,80],[850,-3900,180],[430,-4220,120],[0,-4500,0]],
  cloth:[[-850,-1230,0],[-1550,-1230,0],[-1770,-1630,0]],
  rope:[[720,-870,110],[1250,-920,30],[1530,-1300,0]],
  alcoves:[[-1000,-1510,0],[-1500,-1920,0],[-1700,-2280,0],[-1350,-2620,0],[-650,-2550,0],[0,-2450,0]],
  ridge:[[900,-1670,200],[1230,-1770,270],[1530,-1930,340],[1730,-2210,400]]
 };
 function code(seed){let n=2166136261;for(const ch of String(seed))n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return [1+n%3,1+(n>>>5)%3,1+(n>>>10)%3];}
 function build(a){
  const {G,seg,plat,solid,spawn}=a;
  for(const key of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[key]=[];
  Object.assign(G,{haz:'gusts',thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,vertical:true,canyonWind:{vanes:[],zones:[],time:0}});
  G.cliffs={revision:2002,paths,code:code(G.runSeed),bridge:false,ridge:false};
  G.areaName='Hollow Pass · Winding Cliffs';G.campaignLayout={revision:2002,experience:{title:'Winding Cliffs',objectives:['Follow the prisoner trail','Lower the freight bridge','Open the canyon lift']}};
  const rooms=[['Cliff Refuge',0,180,700,750],['Split Trail',0,-400,750,520],['Broken Cart',-1000,-1450,620,850],['Climber’s Rest',850,-1150,560,500],['Bridge Works',0,-2450,850,600],['Far Landing',0,-3150,650,420],['Legion Lookout',-450,-3900,850,760],['Canyon Lift',0,-4600,850,550]];
  for(const [name,x,z,w,d]of rooms){G.rooms.push({name,x,z,w,d,y:0,monsters:[],encounter:false,cleared:true});if(name!=='Climber’s Rest')seg(x,z,w,d);}
  function route(route,width=240){const points=[];for(let j=1;j<route.length;j++){const p=route[j-1],q=route[j],n=Math.ceil(Math.max(Math.hypot(q[0]-p[0],q[1]-p[1])/100,Math.abs(q[2]-p[2])/18));for(let k=0;k<=n;k++){const r=p.map((v,i)=>v+(q[i]-v)*k/n);if(r[2]<1)seg(r[0],r[1],width,width);else plat(r[0],r[1],r[2],width,width,{slab:20,checkpoint:true});points.push(r);}}return points;}
  G.cliffs.walks={};for(const [id,p]of Object.entries(paths))if(id!=='ridge')G.cliffs.walks[id]=route(p,id==='quiet'?190:id==='cloth'?185:260);
  // The high route has real gaps; a lower recovery shelf avoids repeated long falls.
  G.cliffs.ridgeSteps=[];G.cliffs.ropeSteps=[];for(let j=1;j<paths.ridge.length;j++){const p=paths.ridge[j-1],q=paths.ridge[j],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/155);for(let k=0;k<=n;k++){const r=p.map((v,i)=>v+(q[i]-v)*k/n);if(j===1&&k>0&&k<n)G.cliffs.ropeSteps.push(r);else plat(r[0],r[1],r[2],115,115,{slab:24,checkpoint:true});G.cliffs.ridgeSteps.push(r);}}
  route([[1140,-1780,190],[1480,-2000,240],[1770,-2210,310]],270);route([[1770,-2210,310],[1950,-2000,240],[1650,-1500,0]],240);
  plat(850,-1150,150,560,500,{slab:25,checkpoint:true});plat(1730,-2210,400,240,230,{slab:22,checkpoint:true});
  // Tall columns remain outside route widths. They frame landmarks without hiding controls.
  for(const [x,z,w,d,h]of [[-500,270,160,500,370],[500,200,180,430,440],[-350,-1180,230,460,620],[360,-1450,200,750,560],[-1320,-850,150,230,390],[-2050,-1460,240,500,570],[-2000,-2290,210,650,620],[1200,-560,220,420,470],[1850,-1120,220,500,490],[2090,-2340,180,340,690],[450,-2720,130,260,500],[-500,-2740,170,240,530],[-1000,-3550,260,600,550],[-1000,-4350,230,480,640],[1200,-3920,260,600,670],[610,-4700,180,270,460],[-600,-4800,210,360,580]])plat(x,z,h,w,d,{canyonCliff:true});
  // Cart, supply stacks, shade posts and sandstone arches are individually placed landmarks.
  solid(-1160,-1500,0,100,64,145,'#775238');solid(-1150,-1430,68,110,12,165,'#9d7850');
  for(const [x,z]of [[-720,-370],[-270,-2410],[350,-3200],[-680,-4010],[-210,-3630]])solid(x,z,0,85,60,70,'#715439');
  for(const [x,z,h]of [[-100,-500,160],[160,-500,180],[-1600,-1240,145],[-1640,-1430,165],[740,-1120,265],[1060,-1120,265]]){solid(x,z,0,14,h,14,'#705035');}
  for(const [x,z,y,w]of [[30,-500,180,280],[-1620,-1340,170,150],[900,-1120,267,350]])G.deco.push({x,z,y0:y,w,h:14,d:34,c:'#caa874',nocol:true});
  for(let j=0;j<5;j++)G.deco.push({x:-80+j*42,z:-2350,y0:0,w:28,h:30+j%2*18,d:24,c:'#98724b',nocol:true});
  G.storyNpcs=[{id:'caleb',name:'Caleb',x:-100,z:210,y:0},{id:'skip',name:'Skip',x:940,z:-1140,y:150}];
  const obj=(key,label,x,z,y=0,kind='lever')=>({key,label,x,z,y,kind});
  G.storyObjects=[obj('hp.orders','Read the transport orders',-1060,-1510,0,'orders'),obj('hp.rope','Take the lost rope',1510,-1300,0,'rope'),obj('hp.bridge.clue','Read the freight plate',-110,-2400,0,'plate'),
   ...[2,3,5].map((n,i)=>obj('hp.weight.'+n,'Attach or remove the '+n+'-mark weight',-170+i*150,-2570,0,'weight')),
   obj('hp.brake.wrong','Release the cart brake',-230,-2680),obj('hp.brake.right','Release the bridge brake',230,-2680),
   obj('hp.windbreak','Tie the windbreak shut',570,-880,90),obj('hp.quiet','Tie the lookout rope',790,-3900,180,'rope'),obj('hp.lift','Release the canyon lift',40,-4600),obj('hp.code.clue','Read the chest lid',-1420,-2520,0,'plate'),
   ...[1,2,3].map((n,i)=>obj('hp.code.'+n,'Press '+n+' on the chest lock',-1475+i*65,-2630,0,'dial')),obj('hp.code.claim','Open the cliff chest',-1410,-2720,0,'chest')];
  for(const [x,z]of [[150,-2300],[-180,-3330],[230,-4430]])G.healpads.push({x,z,y:0,r:32,charge:1,_acc:0});
  for(const [type,x,z]of [['dustjackal',-630,-920],['dustjackal',-800,-1030],['cragspitter',-900,-1780],['galewisp',910,-1700],['dustjackal',1460,-1450],['bones',-1800,-2140],['grunt',-430,-3570],['grunt',-660,-3850],['caster',-380,-4100]]){const e=spawn(type,x,z,false);if(z<-3400)e.cliffGuard=true;if(z===-3570){e.role='shielder';e.roleCol='#8fb7ff';e.shieldYaw=0;}}
  // Wind only affects this exposed shelf. Main lower routes and puzzle controls are sheltered.
  G.canyonWind.vanes=[{x:570,z:-880,y:90,until:0}];G.canyonWind.zones=[{x:850,z:-1710,y:200,r:280,vane:0}];G.deco.push({x:570,z:-880,y0:90,w:20,h:70,d:20,kind:'windbreak'});
  G.bounds={minX:-2240,maxX:2250,minZ:-5000,maxZ:650};G.progressEnd=-4900;G.portalPos={x:0,z:-4780,y:0};G.goalPos={...G.portalPos};G.startPos={x:0,z:330};G.lastSafe={x:0,z:330,y:0};Object.assign(G.p,{x:0,z:330,y:0,vy:0});
 }
 function sync(a){const {G,state:s,seg,plat,openWay}=a,f=s.flags;if(!G.cliffs)return;
  if(f['hp.bridge']&&!G.cliffs.bridge){G.cliffs.bridge=true;seg(0,-2820,260,560,{bridge:true});}
  if(f['hp.skip.returned']&&!G.cliffs.ridge){G.cliffs.ridge=true;for(const p of G.cliffs.ropeSteps)plat(p[0],p[1],p[2],115,115,{slab:14,bridge:true,checkpoint:true});}
  if(f['hp.wind.safe'])G.canyonWind.vanes[0].until=Number.MAX_SAFE_INTEGER;
  for(const [id,message]of [['hp.orders','The orders name Ruined Keep. Open the canyon lift to reach the prisoners.'],['hp.rope','Rope recovered. Bring it back to Skip at the high rest spot.'],['hp.bridge','Freight bridge lowered. Both lookout approaches are open.'],['hp.wind.safe','Windbreak tied shut. The upper crossing is sheltered.']])if(f[id]&&!G.cliffs['seen.'+id]){G.cliffs['seen.'+id]=true;a.toast?.(message);}
  const mask=s.items['hp.weight.mask']||0;if(G.cliffs.lastWeight!==undefined&&G.cliffs.lastWeight!==mask){a.sound?.('lever');a.toast?.('Hanging weight: '+(s.items['hp.weight']||0)+' / 7 marks');}G.cliffs.lastWeight=mask;
  const digits=s.items['hp.code']||0;if(G.cliffs.lastCode!==undefined&&G.cliffs.lastCode!==digits){a.sound?.('lever');a.toast?.(f['hp.code.open']?'The chest lock clicks open.':digits?'Lock: '+digits+' / 3 numbers set':'The lock resets. Check the marked supports.');}G.cliffs.lastCode=digits;
  if(f['hp.descent']){G.qs['hp.cliffs']=1;openWay();}
 }
 function quest(s){const f=s.flags;return !f['hp.trail']?'Speak to Caleb at the cliff refuge':!f['hp.orders']?'Follow the cart tracks to the broken wagon':!f['hp.bridge']?'Set the freight weights and lower the bridge':!f['hp.descent']?'Reach the lookout — clear its guards or use the upper rope':'Take the lift down into Lost Canyon';}
 function shards(s){return [{id:'HP-01',x:-1770,z:-1630,y:0},...(s.flags['hp.skip.returned']?[{id:'HP-02',x:1730,z:-2210,y:400}]:[])];}
 function draw(a,t){const {G,state:s,bx,pushM,popM,mv,rotY,box}=a;if(!G.cliffs)return;const f=s.flags;
  // Teal torn cloth hides the sheltered opening; its fluttering edge is a fair visual clue.
  for(let j=0;j<7;j++)bx(-1550,80+j*9,-1280+Math.sin(t*1.5+j*.4)*8,12,10,120,'#587b77');
  for(const o of G.storyObjects){const y=o.y||0;
   if(o.kind==='orders'||o.kind==='plate'){bx(o.x,y+26,o.z,62,52,20,'#725338');bx(o.x,y+50,o.z+12,54,30,2,'#d8c59b');for(let j=0;j<3;j++)bx(o.x,y+43+j*7,o.z+14,36-j*6,2,2,'#534832');}
   else if(o.kind==='weight'){const i=[2,3,5].indexOf(Number(o.key.split('.').pop())),on=(s.items['hp.weight.mask']||0)&(1<<i),n=[2,3,5][i];bx(o.x,y+(on?58:20),o.z,48,40,48,on?'#ba985d':'#766757');for(let k=0;k<n;k++)bx(o.x-16+k*8,y+(on?62:24),o.z+25,3,18,2,'#f0dcae');bx(o.x,y+(on?118:98),o.z,3,on?120:155,3,'#544635');}
   else if(o.kind==='rope'){if(o.key==='hp.rope'&&f['hp.rope'])continue;for(let j=0;j<7;j++){pushM();mv(o.x,y+7+j*3,o.z);rotY(j*.6);box(37,3,28,'#c5aa76');popM();}}
   else if(o.kind==='dial'){bx(o.x,y+16,o.z,42,32,40,'#8f7755');for(let j=0;j<Number(o.key.slice(-1));j++)bx(o.x-10+j*10,y+34,o.z,4,3,18,'#e5cf9a');}
   else if(o.kind==='chest'){bx(o.x,y+22,o.z,90,44,55,'#a47c3f');bx(o.x,y+(f['hp.code.claimed']?65:48),o.z,94,12,58,'#d7b36e');}
   else {bx(o.x,y+25,o.z,16,50,16,'#79603e');bx(o.x,y+49,o.z,52,7,9,'#d2b675');}
  }
  // Seven marks on the bridge plate, paired with the hanging weights and dedicated brake.
  for(let j=0;j<7;j++)bx(-132+j*7,61,-2388,3,12,2,'#332d27');
  for(const x of [-290,330])bx(x,90,-2570,16,180,16,'#705035');bx(20,181,-2570,640,16,20,'#95754c');
  for(const x of [-155,155]){bx(x,110,-2750,20,220,20,'#806044');bx(x,75,-3030,18,150,18,'#806044');}
  if(!f['hp.bridge']){for(let j=0;j<12;j++)bx(0,12+j*20,-2730,255,17,18,'#a98550');}
  else for(let j=0;j<18;j++)bx(0,4,-2580-j*28,250,6,24,'#ab8853');
  // Arrow points from the bridge winch to its brake; the cart brake is attached to a wheel.
  bx(230,46,-2690,30,6,70,'#cab480');bx(-230,32,-2700,60,50,13,'#67523d');
  const places=[[-1580,-1920],[-1800,-2280],[-1330,-2530]];
  places.forEach(([x,z],i)=>{for(let j=0;j<G.cliffs.code[i];j++){bx(x+j*32,38,z,13,76,15,'#a58e62');bx(x+j*32,66,z+9,7,20,2,'#e5d6b4');}for(let j=0;j<=i;j++)bx(x-35+j*9,98,z,5,8,4,'#c9aee0');});
  // Tracks and hanging scraps lead to evidence, not to the optional shard alcoves.
  for(const p of paths.approach.slice(1))for(let j=0;j<3;j++)for(const dx of [-28,28])bx(p[0]+dx,2,p[1]+j*30,5,2,22,'#8b6a47');
  for(const x of [-120,120])bx(x,75,-4730,12,150,12,'#795638');bx(0,155,-4730,265,15,20,'#be965c');
  for(const n of G.storyNpcs){const ready=n.id==='caleb'?!f['hp.trail']:!f['hp.skip.returned'];if(ready){const col=n.id==='skip'&&f['hp.rope']?'#9ee0b3':'#eac582';bx(n.x,n.y+83+Math.sin(t*2)*2,n.z,5,12,5,col);bx(n.x,n.y+72+Math.sin(t*2)*2,n.z,5,4,5,col);}}
 }
 const api={build,sync,quest,shards,draw,code,paths};root.BFHollowCliffs=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
