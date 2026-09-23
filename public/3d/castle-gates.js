/* Castle Gates: one shared infiltration, optional personal discovery, finite assault. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['cg.'+k];
const paths={landing:[[0,650,0],[0,-150,80],[-470,-660,120],[-780,-1050,120]],yard:[[-780,-1050,120],[-1200,-1430,120],[-1200,-2140,160],[-540,-2490,200],[0,-2780,200]],supply:[[-780,-1050,120],[-140,-1270,120],[700,-1480,120],[1310,-1620,120],[1310,-1970,160],[1050,-2530,200],[0,-2780,200]],drain:[[0,-2780,200],[-700,-3000,100],[-960,-3430,100],[-460,-3610,180]],bridge:[[0,-2780,200],[0,-3250,240],[0,-3840,240]],court:[[0,-3840,240],[0,-4500,280],[0,-5040,280],[0,-5580,280]],store:[[1310,-1970,160],[1790,-2050,160],[1960,-2460,220],[1630,-2880,240]],returnStore:[[1630,-2880,240],[1220,-3180,240],[680,-2780,200],[0,-2780,200]],roof:[[-1200,-2140,160],[-1740,-2270,270],[-1930,-2740,390],[-1860,-3000,410]],catchReturn:[[-1720,-3490,310],[-2160,-3350,310],[-2260,-2810,390],[-1930,-2740,390]]};
const flagReady=s=>f(s,'entry');
function status(G){return {wave:G.castleGates?.wave||0,remaining:G.enemies.filter(e=>e.castleWave&&!e.dead&&e.hp>0).length,supply:G.enemies.filter(e=>e.castleGuard==='supply'&&!e.dead&&e.hp>0).length,store:G.enemies.filter(e=>e.castleGuard==='store'&&!e.dead&&e.hp>0).length};}
function quest(s,a={}){return f(s,'entry')?'Enter the tower when you are ready':f(s,'alarm')?(a.wave===3&&!a.remaining?'Raise the inner gate with the court wheel':'Break through the gate guard: wave '+(a.wave||1)+'/3'+(a.remaining?' · '+a.remaining+' left':'')):!f(s,'met')?'Find the repair yard above the western landing':!f(s,'bridge.open')?'Release both bridge catches, then lower the bridge':!f(s,'disguise')?'Recover a coat, helmet and papers for Roland — or confront Cross':!f(s,'orders')||!f(s,'bells')?'Learn the supply crew’s orders before speaking to Cross':'Speak to Captain Cross at the castle gate';}
function available(key,G,a){a=a||status(G);if(key==='cg.coat')return !a.supply;if(key==='cg.personal')return !a.store;if(key==='cg.release')return a.wave===3&&!a.remaining;return true;}
function visualKey(s){return ['bridge.open','entry','alarm','disguise','return'].map(k=>+f(s,k)).join('');}
function build({G,plat,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
 Object.assign(G,{boss:null,haz:null,canyonWind:null,npc:null,secret:null,secretTrigger:null,waystone:null,beam:null,collapse:[],optionalMissions:[],portal:null,bonusPortal:null,bonusActive:false,vertical:true,thorns:[],vents:[],phasers:[],debris:[],lights:[]});G.castleGates={wave:0,wait:0};
 const floor=(x,z,y,w,d,extra={})=>plat(x,z,y,w,d,{slab:38,checkpoint:true,...extra});
 const route=(ps,width=260)=>{for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/95,Math.abs(b[2]-a[2])/10));for(let i=0;i<=n;i++)floor(...a.map((v,k)=>k===2?Math.round((v+(b[k]-v)*i/n)/10)*10:v+(b[k]-v)*i/n),width,width);}};
 for(const [id,ps]of Object.entries(paths))route(ps,['roof','catchReturn'].includes(id)?145:id==='court'?380:260);
 const rooms=[['Western landing',0,510,0,660,500],['Repair yard',-850,-1010,120,900,660],['Armor wash',-1300,-1800,140,650,600],['Supply yard',840,-1880,120,1120,960],['Bell post',0,-2710,200,900,650],['Drain controls',-870,-3240,100,520,740],['Confiscation room',1810,-2520,220,680,820],['Gate court',0,-4530,280,1580,1500],['Tower entrance',0,-5530,280,750,580],['Hidden supply balcony',-1770,-3450,510,420,340]];
 for(const [name,x,z,y,w,d]of rooms){floor(x,z,y,w,d);G.rooms.push({name,x,z,y,w,d,encounter:false,cleared:true,monsters:[]});}
 floor(-1810,-3300,310,920,920);G.castleGates.jumps=[[-1860,-3000,410],[-1740,-3080,440],[-1800,-3220,475],[-1770,-3370,510]];for(const p of G.castleGates.jumps.slice(1,-1))floor(...p,115,110);
 const wall=(x,z,y,w,d,h,tag,c='#464853')=>G.walls.push({x,z,y0:y,w,d,h,c,castleTag:tag,courtWall:true});
 wall(0,-3000,220,440,52,150,'bridge');wall(0,-5230,280,970,75,540,'gate');G.walls.at(-1).invisible=true;
 // Camera-friendly open-front interiors. Architecture at the edges has matching solids.
 wall(-1280,-930,120,50,650,230);wall(-670,-1350,120,220,45,170);wall(2180,-2520,220,55,850,260);wall(2020,-2950,220,310,45,220);
 for(const side of [-1,1]){wall(side*880,-4860,280,180,950,650);wall(side*1380,-5260,280,990,180,890);}
 const part=(name,x,y,z,w,h,d=w,c='#555461')=>G.deco.push({portalPart:name,x,y0:y,z,w,h,d,c});
 const post=(x,z,y,h=220)=>{part('pillar',x,y+h/2,z,55,h,55);wall(x,z,y,46,46,h);};
 // Western sea wall, broken landing and ropes tell how the player reached this hidden shore.
 for(const x of [-280,280]){post(x,580,0,95);part('stone',x,53,280,42,106,180,'#5f5a60');}
 for(let i=0;i<8;i++)part('rubble',-380-i*42,-15,550-i*110,180,120,150,'#424851');
 for(const [x,z,y]of [[-1050,-1050,120],[-670,-1120,120]]){part('stone',x,y+27,z,140,54,65,'#635343');part('cap',x,y+58,z,160,12,80,'#968269');}
 part('stone',-930,143,-910,90,46,80,'#343941');part('cap',-930,175,-910,140,16,75,'#858589');part('furnace',-1190,170,-1210,115,110,100,'#6e5144');
 for(const x of [-1550,-1070])for(const z of [-1680,-1920]){part('stone',x,176,z,80,72,105,'#625a4d');part('cap',x,216,z,88,8,112,'#858078');}
 // Supply wagon, sheltered racks and matching red cloth distinguish it from the prison path.
 part('stone',810,179,-1810,220,38,350,'#6d5341');wall(810,-1810,120,220,350,88);G.walls.at(-1).invisible=true;for(const x of [710,910])part('stone',x,210,-1810,12,48,350,'#84715b');for(const z of [-1970,-1640])part('stone',810,210,z,220,48,12,'#84715b');for(const x of [735,885])part('stone',x,163,-1535,12,12,210,'#84715b');for(const [x,z]of [[760,-1870],[850,-1760]]){part('stone',x,230,z,80,68,90,'#797078');part('cap',x,266,z,84,6,94,'#ad9e83');}
 for(const x of [610,1010])for(const z of [-2030,-1580])post(x,z,120,210);
 for(let i=0;i<5;i++){part('pillar',450+i*60,185,-2240,14,130,14,'#6b6e76');part('cap',450+i*60,244,-2240,46,50,16,'#8e949c');}
 for(const x of [-350,350]){post(x,-2710,200,220);}
 // Three carved bell marks are a visual clue too; text explicitly describes them.
 for(let i=0;i<3;i++)part('cap',-100+i*100,208,-2770,25,7,100,'#b29d75');
 for(const x of [-150,150])for(let j=0;j<6;j++)part('stone',x,245,-3040-j*90,24,10,60,'#787783');
 for(let i=0;i<6;i++){part('stone',-1080,118,-3020-i*65,45,36,42,'#586366');part('cap',-815,103,-3040-i*85,70,5,70,'#627979');}
 // A far gatehouse frames the destination; no black portal appears at ground level.
 for(const side of [-1,1]){const x=side*880;part('stone',x,625,-5010,270,690,510,'#484853');for(let j=0;j<4;j++)part('stone',x+(j-1.5)*75,998,-5010,42,72,520,'#66616d');part('furnace',x,665,-4745,110,260,7,'#462f3b');part('cap',x,684,-4737,18,120,8,'#afa59c');}
 part('stone',0,900,-5260,1510,120,170,'#54525d');part('cap',0,973,-5260,1560,26,190,'#77717c');
 for(const x of [-1100,1100]){part('stone',x,900,-5970,520,1300,760,'#373844');part('pillar',x,1670,-5970,140,260,140,'#625765');}
 // Iron gatehouse: readable bars, raised stone joints, narrow windows and hanging cloth.
 for(const side of [-1,1]){
  const x=side*880;
  for(let row=0;row<6;row++){part('cap',x,337+row*105,-4747,284,12,19,'#77717c');for(const dx of [-106,106])part('stone',x+dx,382+row*105,-4747,24,82,22,'#716b75');}
  for(const y of [490,765]){part('stone',x,y,-4738,86,158,14,'#252934');part('stone',x,y+85,-4728,124,15,28,'#8b8089');part('stone',x,y-84,-4728,124,15,28,'#8b8089');part('glow',x,y,-4726,6,94,7,'#b99c7b');}
  part('cap',side*675,721,-5000,145,14,45,'#948991');part('furnace',side*675,605,-4984,124,230,8,'#643b47');part('cap',side*675,618,-4974,18,105,8,'#baaba0');part('cap',side*675,645,-4973,70,14,8,'#baaba0');

 }
 for(const x of [-510,510]){part('pillar',x,550,-5220,80,540,90,'#776f7b');part('cap',x,833,-5220,125,25,125,'#9a8994');}
 // The long approach has a pale center seam and dark border, not a high-contrast checkerboard.
 for(let j=0;j<16;j++){const z=-4020-j*74;for(const x of [-190,190])part('cap',x,282.7,z,18,2,56,'#847a7f');if(j%3===0)part('cap',0,283,z,85,2,24,'#726a73');}
 for(const side of [-1,1])for(let j=0;j<7;j++){part('stone',side*760,312,-4090-j*135,42,64,100,'#6f6872');if(j%2===0)part('pillar',side*760,377,-4090-j*135,30,100,30,'#827581');}
 // Stacked supplies, hanging repair pieces and riveted racks add use and history to the yards.
 for(const [x,z,y]of [[-1060,-1160,120],[1210,-1790,120],[1450,-2180,160],[2010,-2780,220]]){
  for(let i=0;i<3;i++){const xx=x+(i-1)*60;part('stone',xx,y+32,z+(i%2)*45,56,64,60,'#776252');for(const dy of [12,53])part('cap',xx,y+dy,z+(i%2)*45,60,7,64,'#383d47');}
 }
 for(const x of [-1210,-1040]){part('pillar',x,264,-1280,12,288,12,'#80756e');part('cap',x,285,-1280,62,50,20,'#90909a');part('stone',x,247,-1280,44,56,16,'#636674');}
 for(let i=0;i<8;i++)part('cap',1750+i*40,242,-2700,16,7,85,'#a69a86');
 // Dark rock supports continue below the stone paths, tying the stronghold to its sea cliff.
 for(const [x,z,y,w,d]of [[-850,-1010,120,840,610],[840,-1880,120,1060,900],[0,-2710,200,840,590],[1810,-2520,220,620,760],[0,-4530,280,1520,1430]]){
  part('stone',x,y-185,z,w-60,290,d-60,'#343a45');for(const side of [-1,1])part('rubble',x+side*(w*.45),y-250,z+side*d*.2,160,380,220,'#41434e');
 }
 // Low cover is useful during the assault without enclosing a circle-strafe box.
 for(const [x,z,w]of [[-490,-4200,280],[460,-4670,250],[-460,-4890,230]]){wall(x,z,280,w,75,80);part('cap',x,366,z,w+10,12,84,'#77727a');}
 for(const [x,z,y]of [[-560,-4050,280],[560,-4050,280],[-610,-5100,280],[610,-5100,280],[-1500,-2190,160],[2040,-2480,220]]){part('pillar',x,y+74,z,24,148,24,'#464750');part('glow',x,y+157,z,20,25,20,'#d6a76f');}
 // Balcony relic is concealed behind the back of the supply roof, not on a main lane.
 wall(-1800,-3610,510,510,40,220);part('stone',-1800,537,-3520,150,54,75,'#675d69');
 G.storyNpcs=[{id:'roland',name:'Roland',x:-760,z:-910,y:120},{id:'cross',name:'Captain Cross',x:150,z:-4940,y:280}];
 const o=(k,label,x,z,y,kind='lever',more={})=>({key:'cg.'+k,label,x,z,y,kind,...more});
 G.storyObjects=[o('coat','Take the matching coat',980,-2080,120,'armor',{blockedLabel:'Clear the supply patrol first'}),o('helmet','Take the repaired helmet',-1290,-1930,140,'helmet'),o('papers','Read and take the supply papers',1040,-1810,120,'book'),o('orders','Read the gate roster',-300,-2650,200,'book'),o('bells','Read the bell notice',310,-2700,200,'book'),o('catch.west','Release the west bridge catch',-980,-3220,100,'wheel'),o('catch.east','Release the east bridge catch',-760,-3430,100,'wheel'),o('bridge','Lower the crossing bridge',-420,-3590,180,'wheel'),o('personal','Recover Roland’s old armor',1970,-2670,220,'armor',{blockedLabel:'Clear the store guards first'}),o('store.note','Read the seized goods list',1620,-2310,200,'book'),o('break','Sound the challenge — fight the gate guard',-270,-4890,280,'bell'),o('release','Raise the inner gate',-350,-5150,280,'wheel',{blockedLabel:'Defeat the gate guard first'}),o('balcony.note','Read the loose supply tag',-1570,-2240,240,'book')];
 G.healpads=[{x:-1000,z:-790,y:120,r:36,charge:1,_acc:0},{x:1410,z:-2860,y:240,r:33,charge:1,_acc:0},{x:440,z:-3840,y:240,r:34,charge:1,_acc:0},{x:260,z:-5490,y:280,r:36,charge:1,_acc:0}];
 for(const [type,x,z,y,guard]of [['grunt',630,-1960,120,'supply'],['caster',1110,-2020,120,'supply'],['grunt',940,-1510,120,'supply'],['grunt',-1360,-1700,140],['royalarcanist',-1060,-2260,180],['grunt',1870,-2570,220,'store'],['caster',1710,-2720,220,'store'],['grunt',-840,-3310,100],['royalarcanist',-470,-3660,180]]){const e=spawn(type,x,z,false);Object.assign(e,{y,sx:x,sz:z,castleGuard:guard||null});}
 G.bounds={minX:-2530,maxX:2480,minZ:-6320,maxZ:1050};G.progressEnd=-5620;G.startPos={x:0,z:610,y:0};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-5590,y:280};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function sync({G,state:s,openWay}){for(const [flag,tag]of [['bridge.open','bridge'],['entry','gate']])if(f(s,flag))G.walls=G.walls.filter(w=>w.castleTag!==tag);G.storyNpcs=G.storyNpcs.filter(n=>n.id!=='cross'||!f(s,'alarm')||s.conversation?.npc==='cross');

 if(flagReady(s)){G.qs['cg.gates']=1;openWay();}
}
function tick(G,s,dt,host,spawn,toast){if(!host||!f(s,'alarm')||f(s,'entry'))return;const c=G.castleGates,a=status(G);if(a.remaining){c.wait=0;return;}if(c.wave>=3)return;c.wait+=dt;if(c.wait<(c.wave?3:1.4))return;c.wait=0;c.wave++;const types=c.wave===1?['grunt','grunt','royalarcanist','grunt','caster']:c.wave===2?['grunt','royalarcanist','grunt','caster','grunt','royalarcanist']:['siegeknight','grunt','caster','royalarcanist','grunt','caster','grunt'];
 for(let i=0;i<types.length;i++){const x=(i%2?1:-1)*(260+(i%3)*105),z=-4350-Math.floor(i/2)*190,e=spawn(types[i],x,z,false);Object.assign(e,{y:280,sx:x,sz:z,castleWave:c.wave,active:true,aggro:999});}toast('Gate guard · wave '+c.wave+'/3');}
function shards(){return [{id:'CD-02',x:-1770,z:-3530,y:510}];}
function draw({G,state:s,bx,ring},t){for(const o of G.storyObjects){if(s.flags['event.'+o.key]||o.key==='cg.release'&&!f(s,'alarm')||o.key==='cg.break'&&(f(s,'alarm')||f(s,'entry')))continue;const y=o.y;bx(o.x,y+18,o.z,52,36,46,'#55535e');if(o.kind==='book')bx(o.x,y+39,o.z,52,5,36,'#c7b28d');else if(o.kind==='armor'){bx(o.x,y+65,o.z,48,52,24,'#8b8992');for(const sign of [-1,1])bx(o.x+sign*30,y+82,o.z,20,18,32,'#9c9396');bx(o.x,y+62,o.z+14,12,30,3,'#5d343d');}else if(o.kind==='helmet'){bx(o.x,y+61,o.z,36,32,32,'#9b9297');bx(o.x,y+58,o.z+18,27,7,3,'#292d36');}else if(o.kind==='wheel'){ring(o.x,y+54,o.z,38,'#b59c79');bx(o.x,y+57,o.z,74,8,8,'#b59c79');}else{bx(o.x,y+55,o.z,28,36,28,'#b19c73');}}
 if(f(s,'bridge.open'))for(let j=0;j<8;j++)bx(0,243,-2990-j*75,300,6,35,'#777480');
 if(!f(s,'entry')){for(let i=-7;i<=7;i++)bx(i*62,540,-5230,15,520,20,'#73717d');for(const y of [340,520,710])bx(0,y,-5230,955,18,30,'#8d8089');}
 if(f(s,'entry')){for(const x of [-430,430])bx(x,450,-5230,36,340,45,'#79737d');}
}
const api={paths,build,status,quest,available,visualKey,ready:flagReady,sync,tick,shards,draw};root.BFCastleGates=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
