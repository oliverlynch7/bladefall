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
 const signs=[]; // Terrain, architecture and quest guidance carry navigation here.
 function bridgeProgress(G){const c=G?.cliffs;if(!c?.bridge)return 0;return Math.max(0,Math.min(1,((G.time||0)-c.bridgeLowerAt)/1.5));}
 function settleBridge(G,seg){const c=G?.cliffs;if(c?.bridge&&!c.bridgeWalkable&&bridgeProgress(G)>=1&&seg){seg(0,-2820,260,560,{bridge:true});c.bridgeWalkable=true;return true;}return false;}
 function guards(G,remote){return Number.isFinite(remote)?remote:(G?.enemies||[]).filter(e=>e.cliffGuard&&!e.dead&&e.hp>0).length;}
 // These brackets are a separate optional climb above the safe alcove trail. Their
 // spacing stays within the game's real jump height and a fall returns to that trail.
 const cargoSteps=[
  {x:-1670,z:-2280,y:28,w:155,d:118},
  {x:-1545,z:-2365,y:58,w:123,d:105},
  {x:-1660,z:-2450,y:91,w:116,d:106},
  {x:-1540,z:-2535,y:123,w:133,d:100},
  {x:-1690,z:-2490,y:155,w:135,d:113},
  {x:-1770,z:-2390,y:186,w:173,d:130}
 ];
 const freight={startX:-430,endX:-175,z:-2610,duration:2.15};
 function cartProgress(G){
  const c=G?.cliffs;if(!c?.cartReady)return 0;
  if(c.cartMoveAt===-Infinity)return 1;
  return Math.max(0,Math.min(1,((G.time||0)-c.cartMoveAt)/freight.duration));
 }
 function cartX(G){const p=cartProgress(G);return freight.startX+(freight.endX-freight.startX)*p*p*(3-2*p);}
 function build(a){
  const {G,seg,plat,solid,spawn}=a;
  for(const key of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[key]=[];
  Object.assign(G,{haz:'gusts',thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,vertical:true,canyonWind:{vanes:[],zones:[],time:0}});
  G.cliffs={revision:2193,paths,signs,bridge:false,bridgeWalkable:false,bridgeInitialized:false,bridgeLowerAt:-Infinity,ridge:false,cargoSteps,cargoOpen:false,cargoReleaseAt:-Infinity,cartReady:false,cartInitialized:false,cartMoveAt:Infinity};
  G.areaName='Hollow Pass · Winding Cliffs';G.campaignLayout={revision:2004,experience:{title:'Winding Cliffs',objectives:['Follow the prisoner trail','Lower the freight bridge','Open the canyon lift']}};
  const rooms=[['Cliff Refuge',0,180,700,750],['Split Trail',0,-400,750,520],['Broken Cart',-1000,-1450,620,850],['Climber’s Rest',850,-1150,560,500],['Bridge Works',0,-2450,850,600],['Far Landing',0,-3150,650,420],['Legion Lookout',-450,-3900,850,760],['Canyon Lift',0,-4600,850,550]];
  for(const [name,x,z,w,d]of rooms){G.rooms.push({name,x,z,w,d,y:0,monsters:[],encounter:false,cleared:true});if(name!=='Climber’s Rest')seg(x,z,w,d);}
  // A short rail siding remains on the near bank; the loaded cart never blocks
  // the 250-unit bridge deck when it reaches its pressure plate.
  seg(-455,freight.z,340,280,{freightSiding:true});
  G.cliffs.cartCollider={kind:'col',x:freight.startX,z:freight.z,w:94,d:76,h:57,invisible:true,freightCart:true};
  G.obstacles.push(G.cliffs.cartCollider);
  function route(route,width=240){const points=[];for(let j=1;j<route.length;j++){const p=route[j-1],q=route[j],n=Math.ceil(Math.max(Math.hypot(q[0]-p[0],q[1]-p[1])/100,Math.abs(q[2]-p[2])/18));for(let k=0;k<=n;k++){const r=p.map((v,i)=>v+(q[i]-v)*k/n);if(r[2]<1)seg(r[0],r[1],width,width);else plat(r[0],r[1],r[2],width,width,{slab:20,checkpoint:true});points.push(r);}}return points;}
  G.cliffs.walks={};for(const [id,p]of Object.entries(paths))if(id!=='ridge')G.cliffs.walks[id]=route(p,id==='quiet'?190:id==='cloth'?185:260);
  // The high route has real gaps; a lower recovery shelf avoids repeated long falls.
  G.cliffs.ridgeSteps=[];G.cliffs.ropeSteps=[];for(let j=1;j<paths.ridge.length;j++){const p=paths.ridge[j-1],q=paths.ridge[j],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/155);for(let k=0;k<=n;k++){const r=p.map((v,i)=>v+(q[i]-v)*k/n);if(j===1&&k>0&&k<n)G.cliffs.ropeSteps.push(r);else plat(r[0],r[1],r[2],115,115,{slab:24,checkpoint:true});G.cliffs.ridgeSteps.push(r);}}
  route([[1140,-1780,190],[1480,-2000,240],[1770,-2210,310]],270);route([[1770,-2210,310],[1950,-2000,240],[1650,-1500,0]],240);
  plat(850,-1150,150,560,500,{slab:25,checkpoint:true});plat(1730,-2210,400,240,230,{slab:22,checkpoint:true});
  for(const step of cargoSteps)plat(step.x,step.z,step.y,step.w,step.d,{slab:14,checkpoint:true,cargoBracket:true});
  // Tall columns remain outside route widths. They frame landmarks without hiding controls.
  for(const [x,z,w,d,h]of [[-500,270,160,500,370],[500,200,180,430,440],[-350,-1180,230,460,620],[360,-1450,200,750,560],[-1320,-850,150,230,390],[-2050,-1460,240,500,570],[-2000,-2290,210,650,620],[1200,-560,220,420,470],[1850,-1120,220,500,490],[2090,-2340,180,340,690],[450,-2720,130,260,500],[-760,-2810,160,200,300],[-1000,-3550,260,600,550],[-1000,-4350,230,480,640],[1200,-3920,260,600,670],[610,-4700,180,270,460],[-600,-4800,210,360,580]])plat(x,z,h,w,d,{canyonCliff:true});
  // Cart, supply stacks, shade posts and sandstone arches are individually placed landmarks.
  G.deco.push({kind:'craft',craftId:'abandoned-wagon',model:'wagon',x:-1160,z:-1500,y0:0,rot:Math.PI/2,scale:1.2,options:{}});
  G.obstacles.push({kind:'col',x:-1160,z:-1500,w:88,d:127,h:117,invisible:true,freightWreck:true});
  for(const [x,z]of [[-720,-370],[-630,-2350],[350,-3200],[-680,-4010],[-210,-3630]])solid(x,z,0,85,60,70,'#715439');
  for(const [x,z,h]of [[-100,-500,160],[160,-500,180],[-1600,-1240,145],[-1640,-1430,165],[740,-1120,265],[1060,-1120,265]]){solid(x,z,0,14,h,14,'#705035');}
  for(const [x,z,y,w]of [[30,-500,180,280],[-1620,-1340,170,150],[900,-1120,267,350]])G.deco.push({x,z,y0:y,w,h:14,d:34,c:'#caa874',nocol:true});
  // Keep the approach clear: supplies belong beside the siding, not in the lane.
  for(const s of signs)G.obstacles.push({kind:'col',x:s.x,z:s.z,w:18,d:18,h:138,invisible:true,cliffSign:true});
  G.storyNpcs=[{id:'caleb',name:'Caleb',x:-100,z:210,y:0},{id:'skip',name:'Skip',x:940,z:-1140,y:150}];
  const obj=(key,label,x,z,y=0,kind='lever')=>({key,label,x,z,y,kind});
  G.storyObjects=[obj('hp.orders','Read the transport orders',-1060,-1510,0,'orders'),obj('hp.rope','Take the lost rope',1510,-1300,6,'rope'),obj('hp.bridge.clue','Read the freight plate',-110,-2400,0,'plate'),
   {...obj('hp.cart.push','Push the loaded cart onto the plate',-530,freight.z,0,'cartpush'),blockedText:'The loaded cart is already moving toward the plate.'},
   {...obj('hp.brake.right','Release the bridge winch',230,-2680,0,'bridgebrake'),blockedText:'The plate needs the loaded cart. Push it along the left rail and wait for it to dock.'},
   obj('hp.windbreak','Tie the windbreak shut',570,-880,90),obj('hp.quiet','Tie the lookout rope',790,-3900,180,'rope'),obj('hp.lift','Release the canyon lift',40,-4600),obj('hp.code.clue','Read the cargo plate',-1610,-2110,0,'plate'),
   obj('hp.code.release','Pull the cargo release',-1770,-2390,186,'release'),obj('hp.code.claim','Open the cliff chest',-1550,-2160,0,'chest')];
  for(const [x,z]of [[-35,-2223],[-180,-3330],[341,-4476]])G.healpads.push({x,z,y:0,r:32,charge:1,_acc:0});
  for(const [type,x,z]of [['dustjackal',-630,-920],['dustjackal',-800,-1030],['cragspitter',-900,-1780],['galewisp',910,-1700],['dustjackal',1510,-1300],['bones',-1680,-2230],['grunt',-660,-3850],['caster',-380,-4100]]){const e=spawn(type,x,z,false);if(z<-3400)e.cliffGuard=true;}
  // The last guard stands on the broad lookout, where a dodge has room to land.
  // Its long, readable cleave is a distinct final fight before the canyon lift.
  const warden=spawn('siegeknight',-280,-3740,false);
  if(warden){Object.assign(warden,{cliffGuard:true,elite:true,campaignElite:true,label:'Cliff warden',color:'#638c91',hp:Math.round(warden.hp*1.12),dmg:Math.round(warden.dmg*.9),xp:Math.round(warden.xp*2),r:warden.r*1.12,h:warden.h*1.18,speed:warden.speed*1.08});warden.maxHp=warden.hp;root.BFCampaignElites?.setup(warden,1);}
  // Wind only affects this exposed shelf. Main lower routes and puzzle controls are sheltered.
  G.canyonWind.vanes=[{x:570,z:-880,y:90,until:0}];G.canyonWind.zones=[{x:850,z:-1710,y:200,r:280,vane:0}];G.deco.push({x:570,z:-880,y0:90,w:20,h:70,d:20,c:'#a58355',kind:'windbreak'});
  G.bounds={minX:-2240,maxX:2250,minZ:-5000,maxZ:650};G.progressEnd=-4900;G.portalPos={x:0,z:-4780,y:0};G.goalPos={...G.portalPos};G.startPos={x:0,z:330};G.lastSafe={x:0,z:330,y:0};Object.assign(G.p,{x:0,z:330,y:0,vy:0});
 }
 function sync(a){const {G,state:s,seg,plat,openWay}=a,f=s.flags;if(!G.cliffs)return;
  const cartReady=!!(f['hp.weight.open']||f['hp.bridge']);
  if(!G.cliffs.cartInitialized){G.cliffs.cartInitialized=true;G.cliffs.cartReady=cartReady;G.cliffs.cartMoveAt=cartReady?-Infinity:Infinity;}
  else if(cartReady&&!G.cliffs.cartReady){G.cliffs.cartReady=true;G.cliffs.cartMoveAt=G.time||0;root.BFJournalNotice?.queue.dismiss('inspect.hp.brake.right');a.sound?.('lever');a.toast?.('The loaded cart rolls toward the floor plate.');}
  G.cliffs.cartCollider.x=cartX(G);
  if(f['hp.bridge']&&!G.cliffs.bridge){if(G.cliffs.bridgeInitialized)G.cliffs.bridgeLowerAt=G.time||0;G.cliffs.bridge=true;}
  G.cliffs.bridgeInitialized=true;settleBridge(G,seg);
  if(f['hp.skip.returned']&&!G.cliffs.ridge){G.cliffs.ridge=true;for(const p of G.cliffs.ropeSteps)plat(p[0],p[1],p[2],115,115,{slab:14,bridge:true,checkpoint:true});}
  if(f['hp.wind.safe'])G.canyonWind.vanes[0].until=Number.MAX_SAFE_INTEGER;
  for(const [id,message]of [['hp.orders','The orders name Ruined Keep. Open the canyon lift to reach the prisoners.'],['hp.rope',f['hp.skip.returned']?null:'Rope recovered. Bring it back to Skip at the high rest spot.'],['hp.bridge',G.cliffs.bridgeWalkable?'The freight bridge is open. Cross to the lookout.':'The bridge is lowering. Wait for the deck to settle.'],['hp.wind.safe','Windbreak tied shut. The upper crossing is sheltered.']])if(f[id]&&!G.cliffs['seen.'+id]){G.cliffs['seen.'+id]=true;if(message)a.toast?.(message);}
  const ropeNote=s.notes['hp.rope'];if(ropeNote&&f['hp.skip.returned']){ropeNote.title="Skip's rope returned";ropeNote.text='Skip has his rope. His high ridge crossing is open, and Cliff Runner is yours.';}
  const winch=G.storyObjects.find(o=>o.key==='hp.brake.right');if(winch)winch.blockedText=cartReady?'The cart is still rolling. Wait for it to settle on the plate.':'The plate needs the loaded cart. Push it along the left rail and wait for it to dock.';
  if(f['hp.bridge'])for(const id of ['inspect.hp.brake.right','hp.cart'])root.BFJournalNotice?.queue.dismiss(id);
  const bridgeNote=s.notes['hp.bridge'];if(bridgeNote){bridgeNote.title='Freight bridge';bridgeNote.text=f['hp.bridge']?'The bridge is released. Once its deck settles, cross to the lookout.':cartReady?'The cart is on its way to the plate. Once it settles, release the bridge winch across the works.':'Push the loaded cart along the left rail onto the plate. When the cable pulls tight, release the bridge winch across the works.';}
  const cartNote=s.notes['hp.cart'];if(cartNote&&f['hp.bridge'])cartNote.text='The cart loaded the plate and the bridge lowered. Cross to the lookout.';
  if(!G.cliffs.cargoInitialized){G.cliffs.cargoInitialized=true;G.cliffs.cargoOpen=!!f['hp.code.open'];}
  else if(f['hp.code.open']&&!G.cliffs.cargoOpen){G.cliffs.cargoOpen=true;G.cliffs.cargoReleaseAt=G.time||0;a.sound?.('lever');a.toast?.('The hoist lifts clear of the chest below.');}
  const note=s.notes['hp.code'];if(note){note.title='The cliff cargo chest';note.text=f['hp.code.open']?'The cargo has lifted. Return to the chest beneath the brackets.':'A cable holds cargo over the cliff chest. Follow the uneven brackets from the lower alcove to its high release pin.';}
  if(f['hp.descent']){G.qs['hp.cliffs']=1;openWay();}
 }
 function tick(G,toast,seg){const settled=settleBridge(G,seg);if(settled)toast?.('Bridge ready. Cross to the lookout.');const c=G?.cliffs;if(!c?.cartCollider)return;c.cartCollider.x=cartX(G);if(c.cartReady&&c.cartMoveAt!==-Infinity&&!c.cartDockNoticed&&cartProgress(G)>=1){c.cartDockNoticed=true;root.BFJournalNotice?.queue.dismiss('inspect.hp.brake.right');toast?.('The cart settles on the plate. The bridge winch is ready.');}return settled;}
 function quest(s,G,remote){const f=s.flags;return !f['hp.trail']?'Speak to Caleb at the cliff refuge':!f['hp.bridge']?f['hp.weight.open']?(G?.cliffs&&cartProgress(G)<1?'Wait for the cart to reach the plate':'Release the bridge winch on the right'):'Push the loaded cart onto the plate':G?.cliffs&&!G.cliffs.bridgeWalkable?'Wait for the bridge to lower':!f['hp.descent']?f['hp.quiet']||!guards(G,remote)?'Release the canyon lift':`Clear the lookout (${guards(G,remote)} left) or take the high rope route`:'Take the lift down into Lost Canyon';}
 function shards(s){return [{id:'HP-01',x:-1770,z:-1630,y:0},...(s.flags['hp.skip.returned']?[{id:'HP-02',x:1730,z:-2210,y:400}]:[])];}
 function available(key,s,G){if(key==='hp.code.release')return !s.flags['hp.code.open'];if(key==='hp.code.claim')return !!s.flags['hp.code.open']&&!s.flags['hp.code.claimed'];if(key==='hp.cart.push')return !s.flags['hp.weight.open']&&!s.flags['hp.bridge'];if(key==='hp.brake.right')return !!s.flags['hp.weight.open']&&(!G?.cliffs||cartProgress(G)>=1);return true;}
 function draw(a,t){const {G,state:s,bx,pushM,popM,mv,rotY,rotX,box}=a;if(!G.cliffs)return;const f=s.flags;
  // Teal torn cloth hides the sheltered opening; its fluttering edge is a fair visual clue.
  for(let j=0;j<7;j++)bx(-1550,80+j*9,-1280+Math.sin(t*1.5+j*.4)*8,12,10,120,'#587b77');
  for(const o of G.storyObjects){if(root.BFCampaignObjects?.drawn(o))continue;const y=o.y||0;
   if(o.kind==='orders'||o.kind==='plate'){bx(o.x,y+26,o.z,62,52,20,'#725338');bx(o.x,y+50,o.z+12,54,30,2,'#d8c59b');for(let j=0;j<3;j++)bx(o.x,y+43+j*7,o.z+14,36-j*6,2,2,'#534832');}
   else if(o.kind==='cartpush'){bx(o.x,y+30,o.z,16,60,16,'#735338');bx(o.x,y+64,o.z,36,8,12,'#d6ad6e');}
   else if(o.kind==='rope'){if(o.key==='hp.rope'&&f['hp.rope'])continue;for(let j=0;j<7;j++){pushM();mv(o.x,y+7+j*3,o.z);rotY(j*.6);box(37,3,28,'#c5aa76');popM();}}
   else if(o.kind==='release'){bx(o.x,y+8,o.z,50,16,52,'#655847');bx(o.x,y+27,o.z,12,30,12,'#cba873');bx(o.x,y+44,o.z-18,43,7,10,f['hp.code.open']?'#5d675f':'#e6c67e');}
   else if(o.kind==='chest'){bx(o.x,y+22,o.z,90,44,55,'#a47c3f');bx(o.x,y+(f['hp.code.claimed']?65:48),o.z,94,12,58,'#d7b36e');}
   else if(o.kind==='bridgebrake'&&root.BFCampaignCraft?.has('freight-winch'))continue;
   else {bx(o.x,y+25,o.z,16,50,16,'#79603e');bx(o.x,y+49,o.z,52,7,9,'#d2b675');}
  }
  // Rail ties and a loaded cart tell the bridge story without a number lock.
  for(let x=-505;x<=-115;x+=43)bx(x,3,freight.z,13,5,155,'#77583b');
  for(const dz of [-49,49])bx(-305,7,freight.z+dz,405,8,8,'#808b88');
  const docked=cartProgress(G),cx=cartX(G),plateColor=docked>=1?'#e4c77e':'#51636a';
  if(!root.BFCampaignCraft?.has('freight-pressure')){bx(freight.endX,8,freight.z,138,12,128,'#46545a');bx(freight.endX,15-docked*5,freight.z,112,3,104,plateColor);
  for(const dx of [-42,42])for(const dz of [-37,37])bx(freight.endX+dx,20-docked*5,freight.z+dz,8,4,8,docked>=1?'#f6dda4':'#8d9c99');}
  if(!root.BFCampaignCraft?.has('freight-cart')){for(const dz of [-35,35])for(const dx of [-37,37])bx(cx+dx,23,freight.z+dz,20,25,17,'#42494b');
  bx(cx,37,freight.z,112,19,83,'#775237');bx(cx,49,freight.z,104,5,77,'#bb9362');
  for(const dz of [-42,42])bx(cx,51,freight.z+dz,103,10,6,'#39797a');
  for(const dx of [-36,0,36])bx(cx+dx,55,freight.z+45,4,15,3,'#dbbf83');
  for(const dx of [-45,45])bx(cx+dx,60,freight.z,8,24,80,'#4d5557');
  for(const dx of [-25,25]){bx(cx+dx,75,freight.z,37,31,55,'#68645b');bx(cx+dx,93,freight.z,41,5,59,'#b7a376');}
  bx(cx,109,freight.z,28,4,18,'#d0bd92');}
  // The plate tugs a clearly continuous cable toward the winch on the other bank.
  bx(-100,110,-2570,6,203,6,docked>=1?'#d8b872':'#706456');
  bx(65,210,-2570,335,7,7,docked>=1?'#e2c27e':'#6d655c');
  if(!root.BFCampaignCraft?.has('freight-crane')){bx(-340,90,-2470,16,180,16,'#705035');bx(330,90,-2570,16,180,16,'#705035');bx(20,181,-2570,640,16,20,'#95754c');}
  for(const x of [-155,155]){bx(x,110,-2750,20,220,20,'#806044');bx(x,75,-3030,18,150,18,'#806044');}
  // A single hinged deck lowers from the near bank. The saved-open state starts
  // fully down; only a newly solved bridge plays the short lowering motion.
  const elapsed=(G.time||0)-G.cliffs.bridgeLowerAt,progress=f['hp.bridge']?Math.max(0,Math.min(1,elapsed/1.5)):0;
  const eased=progress*progress*(3-2*progress),angle=(1-eased)*1.24;
  if(!root.BFCampaignCraft?.has('cliff-bridge')){pushM();mv(0,5,-2540);rotX(angle);
  for(let j=0;j<19;j++){const zz=-15-j*29;bx(0,0,zz,250,8,25,j%3===0?'#c29b5d':'#ad8751');bx(0,5,zz,251,2,3,'#684d31');}
  for(const side of [-1,1]){bx(side*127,24,-279,8,42,540,'#735738');for(let j=0;j<8;j++)bx(side*127,13,-35-j*72,9,26,9,'#d0ac69');}
  popM();}
  for(const x of [-145,145])bx(x,12,-2540,24,24,34,'#8c704a');
  // The far winch is distinct from the cart and remains on the safe bank.
  if(!root.BFCampaignCraft?.has('freight-winch')){bx(230,46,-2690,30,6,70,'#cab480');bx(230,32,-2700,60,50,13,'#67523d');}
  // Brackets have visible stone undersides, iron edge rails and staggered approach marks.
  // The actual walking slabs are the matching plat obstacles built above.
  for(let i=0;i<cargoSteps.length;i++){const p=cargoSteps[i];bx(p.x,p.y-13,p.z,p.w-7,13,p.d-8,'#625447');bx(p.x,p.y+2.4,p.z,p.w-13,2,p.d-14,i===cargoSteps.length-1?'#b9a174':'#a8916e');
   bx(p.x-p.w*.39,p.y+5,p.z,5,5,p.d*.74,'#5c625e');bx(p.x+p.w*.39,p.y+5,p.z,5,5,p.d*.74,'#5c625e');
   bx(p.x,p.y+6,p.z-p.d*.37,p.w*.45,3,6,'#e4c98e');
   if(i===0||i===3||i===5){bx(p.x-p.w*.32,p.y-13- Math.min(42,p.y*.27),p.z,13,Math.min(84,p.y*.54),14,'#766551');bx(p.x+p.w*.32,p.y-13-Math.min(42,p.y*.27),p.z,13,Math.min(84,p.y*.54),14,'#766551');}
  }
  const lift=f['hp.code.open']?Math.min(1,Math.max(0,((G.time||0)-G.cliffs.cargoReleaseAt)/1.2)):0;
  // One cable runs from the high release to the pulley over the chest; its slung
  // iron cargo visibly rises when the pin is pulled, revealing the chest below.
  bx(-1550,269,-2160,13,42,13,'#665748');bx(-1550,291,-2160,54,8,14,'#8e785b');
  {const dx=220,dy=22,dz=230,run=Math.hypot(dx,dz);pushM();mv(-1660,278,-2275);rotY(Math.atan2(dx,dz));rotX(-Math.atan2(dy,run));box(5,5,Math.hypot(run,dy),'#d4be88');popM();}
  bx(-1550,167+lift*64,-2160,5,194-lift*128,5,'#d4be88');
  bx(-1550,72+lift*96,-2160,121,11,85,'#514a42');
  for(const dx of [-55,55]){bx(-1550+dx,49+lift*96,-2160,8,45,8,'#8d7151');bx(-1550+dx,49+lift*96,-2118,8,45,8,'#8d7151');}
  bx(-1550,28+lift*96,-2118,126,7,6,'#ccaa6f');
  if(!f['hp.code.open'])bx(-1550,58,-2160,38,9,9,'#efce87');
  // Tracks and hanging scraps lead to evidence, not to the optional shard alcoves.
  for(const p of paths.approach.slice(1))for(let j=0;j<3;j++)for(const dx of [-28,28])bx(p[0]+dx,2,p[1]+j*30,5,2,22,'#8b6a47');
  for(const x of [-120,120])bx(x,75,-4730,12,150,12,'#795638');bx(0,155,-4730,265,15,20,'#be965c');
  for(const n of G.storyNpcs){const ready=n.id==='caleb'?!f['hp.trail']:!f['hp.skip.returned'];if(ready){const col=n.id==='skip'&&f['hp.rope']?'#9ee0b3':'#eac582';bx(n.x,n.y+83+Math.sin(t*2)*2,n.z,5,12,5,col);bx(n.x,n.y+72+Math.sin(t*2)*2,n.z,5,4,5,col);}}
 }
 const api={build,sync,tick,quest,shards,available,draw,paths,signs,cargoSteps,cartProgress,cartX,freight,bridgeProgress,guards};root.BFHollowCliffs=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
