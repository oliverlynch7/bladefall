/* Sunspire's first half: shared mechanisms, personal roof discovery, ordinary combat. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['pc.'+k];
const mirrorPoints=[[-330,-3890],[330,-3890],[330,-4120]],sunSource=[-330,-4210],sunReceiver=[0,-4120];
// Cardinal rays reflect from / or backslash mirrors. A wrong turn ends at the terrace edge.
function lightPath(mask){let at=sunSource.slice(),dir=[0,1];const segments=[],hits=[],seen=new Set();let solved=false;
 for(let step=0;step<12;step++){let distance=dir[0]>0?(560-at[0]):dir[0]<0?(at[0]+560):dir[1]>0?(-3400-at[1]):(at[1]+4300),hit=-1;
  [...mirrorPoints,sunReceiver].forEach((q,i)=>{const dx=q[0]-at[0],dz=q[1]-at[1],along=dx*dir[0]+dz*dir[1],across=dx*dir[1]-dz*dir[0];if(Math.abs(across)<.01&&along>.01&&along<distance){distance=along;hit=i;}});
  const end=[at[0]+dir[0]*distance,at[1]+dir[1]*distance];segments.push([at,end]);if(hit<0)break;if(hit===3){solved=true;break;}hits.push(hit);const key=hit+':'+dir.join(',');if(seen.has(key))break;seen.add(key);dir=mask&(1<<hit)?[dir[1],dir[0]]:[-dir[1],-dir[0]];at=end;
 }return {segments,hits,solved};}

const paths={entry:[[0,560,120],[0,-480,120],[-500,-760,160],[0,-1400,200]],water:[[-500,-760,160],[-1080,-620,80],[-1280,-1260,80],[-800,-1550,160],[0,-1400,200]],eastGarden:[[0,-1400,200],[800,-1100,160],[1550,-850,160],[1840,-1440,160],[1270,-1440,160],[1220,-1930,180],[650,-2270,200]],westGarden:[[0,-1400,200],[-800,-1550,160],[-1420,-1910,180],[-1250,-2550,200],[-500,-2860,300],[0,-3200,360]],eastBalcony:[[0,-1400,200],[530,-1600,240],[1050,-2070,340],[650,-2620,340],[0,-3200,360]],westBalcony:[[-800,-1550,160],[-650,-2050,260],[-1050,-2450,340],[-500,-2860,300]],eastReturn:[[650,-2270,200],[1100,-2760,260],[500,-3180,360],[0,-3200,360]],mirror:[[0,-3200,360],[0,-3650,420],[0,-4170,420],[0,-4500,460]],roof:[[-1420,-1910,180],[-1950,-1740,300],[-2060,-2350,460],[-1860,-2550,460]],catchReturn:[[-1930,-3000,360],[-2230,-2920,360],[-2300,-2460,410],[-2060,-2350,460]]};
function ready(s){return f(s,'ready');}
function quest(s){return !f(s,'met')?'Speak to Sister Grace at the fountain court':!f(s,'clamp')?'Remove the iron clamp at the west waterworks':!f(s,'court')?'Open the waterworks wheel':!f(s,'west')||!f(s,'east')?'Release the balcony locks: west '+(+f(s,'west'))+'/1, east '+(+f(s,'east'))+'/1':!f(s,'light.open')?'Guide the sunbeam through the mirrors to the library seal':!f(s,'ready')?'Open the library door':'Enter the Sky Library when you are ready';}
function status(G){return Object.fromEntries(['west','east'].map(k=>[k,G.enemies.filter(e=>e.courtGuard===k&&!e.dead&&e.hp>0).length]));}
function available(key,G,remote){const m=key.match(/^pc\.(west|east)\.upper$/);return !m||!(remote||status(G))[m[1]];}
function visualKey(s){return ['court','west','east','garden.water','garden.done','light.open'].map(k=>+f(s,k)).join('')+':'+(s.items['pc.light.mask']||0);}
function build({G,plat,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
 Object.assign(G,{boss:null,haz:null,canyonWind:null,npc:null,secret:null,secretTrigger:null,waystone:null,beam:null,collapse:[],optionalMissions:[],portal:null,bonusPortal:null,bonusActive:false,vertical:true,thorns:[],vents:[],phasers:[],debris:[],lights:[]});G.court={walks:{},roofAscent:[]};
 const floor=(x,z,y,w,d,extra={})=>plat(x,z,y,w,d,{slab:34,checkpoint:true,...extra});
 const route=(ps,width=240,id='')=>{for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],jump=id==='roof'&&j===2,n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/(jump?160:100),Math.abs(b[2]-a[2])/(jump?50:10)));for(let i=0;i<=n;i++){const q=a.map((v,k)=>k===2?Math.round((v+(b[k]-v)*i/n)/10)*10:v+(b[k]-v)*i/n);floor(...q,jump?90:width,jump?90:width);if(jump){G.court.roofAscent.push(q);floor(q[0],q[1],q[2]-85,185,185,{courtCatch:true});}}}};
 for(const [id,ps]of Object.entries(paths)){route(ps,id==='roof'||id==='catchReturn'?150:260,id);G.court.walks[id]=ps;}
 const rooms=[['Entry terrace',0,70,120,1100,1300],['Fountain court',0,-1400,200,1000,750],['West waterworks',-1260,-900,80,520,800],['Greenhouse',1670,-1190,160,750,900],['West garden',-1400,-2140,180,500,570],['East lock garden',740,-2250,200,520,400],['West balcony',-1050,-2450,340,680,450],['East balcony',1050,-2070,340,680,500],['Mirror terrace',0,-3850,420,1160,920],['Library door',0,-4500,460,800,480],['Memorial roof',-1820,-3030,540,390,340]];
 for(const [name,x,z,y,w,d]of rooms){floor(x,z,y,w,d);G.rooms.push({name,x,z,y,w,d,encounter:false,cleared:true,monsters:[]});}
 floor(-1880,-2830,360,850,850,{courtCatch:true});G.court.jumps=[[-1860,-2550,460],[-1710,-2660,490],[-1820,-2780,515],[-1820,-2990,540]];for(const p of G.court.jumps.slice(0,-1))floor(...p,115,110);
 // Two raised bridge gates share a sun-shaped seal. Water controls sit below.
 for(const [x,z,y,w,d,h,tag]of [[-490,-2860,300,360,48,150,'west'],[510,-3140,360,360,48,150,'east'],[0,-4320,420,780,65,340,'library']])G.walls.push({x,z,y0:y,w,d,h,c:'#aa966a',courtTag:tag});
 // The waterworks and greenhouse have open fronts for camera and player access.
 for(const [x,z,y,w,d,h]of [[-1530,-910,80,65,720,180],[1970,-1200,160,55,870,215],[1670,-1630,160,650,55,210],[-1720,-3200,540,480,45,240]])G.walls.push({x,z,y0:y,w,d,h,c:'#d6d0ba'});
 // Reuse the authored palace kit; broad courts and open garden structures have matching solids.
 const part=(name,x,y,z,w,h,d=w,c='#d7cfb6')=>G.deco.push({portalPart:name,x,y0:y,z,w,h,d,c});
 const column=(x,z,y,h=260)=>{part('pillar',x,y,z,55,h,55);G.walls.push({x,z,y0:y,w:45,d:45,h,invisible:true});};
 for(const [x,z,y,h]of [[-470,-1210,200,265],[470,-1210,200,265],[-470,-1680,200,265],[470,-1680,200,265],[-420,440,120,220],[420,440,120,220],[-1420,-2440,340,235],[1420,-2070,340,235]])column(x,z,y,h);
 for(const [x,z,y,w]of [[0,430,120,840],[0,-1730,200,940],[0,-4330,420,970]]){for(const sign of [-1,1])column(x+sign*w/2,z,y,290);part('stone',x,y+300,z,w+100,45,90,'#d7cfb6');part('cap',x,y+329,z,w+160,15,110,'#b59a55');for(let i=-3;i<=3;i++)part('stone',x+i*w/9,y+285,z,24,32,112,'#c6ae6a');}
 // Entry mosaic, low edging and planted corners break up the large marble landing.
 for(const x of [-495,495])for(let j=0;j<9;j++)part('stone',x,130,480-j*120,32,20,90,'#c7ba8b');
 for(const x of [-230,230])for(let j=0;j<8;j++)part('cap',x,123,400-j*110,12,3,72,'#b49b5b');
 part('ring',0,123,-180,140,4,140);part('rune',0,125,-180,120,1,120,'#b79b51');
 for(const [x,z]of [[-360,280],[360,280],[-360,-400],[360,-400]]){part('stone',x,131,z,125,22,130,'#bbb28e');part('stone',x,143,z,108,3,112,'#637b55');for(let j=0;j<7;j++)part('rubble',x+(j%3-1)*25,152,z+(Math.floor(j/3)-1)*25,30,45,30,'#79965d');}
 // Rest benches face the fountain; roofless arches keep sightlines open.
 for(const x of [-350,350]){part('stone',x,227,-1190,140,20,45,'#c8bfa3');for(const dx of [-50,50])part('stone',x+dx,211,-1190,15,22,38,'#a79b7c');}
 // Fountain ring leaves Grace and the large pad clearly visible on its south side.
 part('ring',0,207,-1470,100,15,100);part('pillar',0,207,-1470,36,100,36);part('cap',0,305,-1470,75,10,75,'#cbb277');
 for(const [x,z,y]of [[-680,-790,160],[700,-1230,180],[-1360,-2040,180],[1570,-1000,160],[1840,-1210,160],[280,-3800,420]]){part('stone',x,y+9,z,160,18,120,'#cfc5a3');part('stone',x,y+20,z,144,5,105,'#627353');for(let j=0;j<7;j++)part('rubble',x-55+j*18,y+26,z+(j%2?18:-18),30,25,26,'#6e8b59');}
 // Greenhouse frame: no opaque roof hiding the seed tin or enemy.
 for(const x of [1380,1950])for(const z of [-870,-1180,-1500]){column(x,z,160,195);part('stone',x,363,z,36,15,50,'#b69d62');}
 for(const z of [-870,-1180,-1500])part('stone',1665,370,z,610,16,22,'#b6a16c');
 for(const x of [1450,1665,1880])part('stone',x,380,-1185,14,14,650,'#c9b985');
 for(const [x,z,y]of [[-1500,-780,80],[-1500,-1010,80]])part('furnace',x,y+80,z,55,100,40,'#b4bcb0');
 for(const side of [-1,1]){const x=side*1050,z=side<0?-2450:-2070;part('stone',x,365,z-80,95,50,100,'#555963');part('stone',x,405,z-80,130,14,65,'#9b8a66');part('stone',x,438,z-80,18,85,18,'#555963');part('cap',x,435,z-78,70,70,4,'#64526d');}
 // Hanging greenery follows the terrace edge, clear of the walking surface.
 for(const [x,z,y]of [[-520,100,120],[520,-200,120],[-1500,-2180,180],[1960,-1170,160],[-1160,-2640,340],[1190,-2320,340]])for(let j=0;j<7;j++){part('rubble',x+Math.sin(j*1.7)*15,y-j*21,z,26,30,28,j%2?'#7e9b69':'#66855e');}
 // Memorial can only be seen from the west roof, behind the library-facing wall.
 part('pillar',-1800,540,-3120,55,150,55);part('ring',-1800,696,-3120,45,45,45);part('rubble',-1870,547,-3160,80,55,50,'#bfb89e');
 for(const x of [-720,720]){part('stone',x,710,-4660,360,480,450,'#d7d1c0');part('furnace',x,790,-4418,110,205,5,'#b9a465');part('ring',x,980,-4660,140,70,140);part('stone',x,1060,-4660,50,130,50,'#d8c990');}
 G.storyNpcs=[{id:'grace',name:'Sister Grace',x:-220,z:-1320,y:200},{id:'victor',name:'Sergeant Victor',x:290,z:-1660,y:230}];
 const o=(k,label,x,z,y,kind='lever')=>({key:'pc.'+k,label,x,z,y,kind});
 G.storyObjects=[o('clamp','Remove the iron clamp',-1320,-720,80,'clamp'),o('water','Open the court water wheel',-1200,-1070,80,'wheel'),o('west.lower','Drain the west lock',-1390,-2370,200,'wheel'),o('east.lower','Drain the east lock',770,-2280,200,'wheel'),o('west.upper','Release the west balcony',-1000,-2530,340),o('east.upper','Release the east balcony',1090,-2150,340),o('garden.water','Open the garden channel',1320,-1000,160,'wheel'),o('seeds','Take the dry seed tin',1770,-1420,160,'seeds'),o('memorial','Read the garden keeper’s stone',-1930,-2000,370,'book'),o('mirror.note','Read the sun marks',-420,-3650,420,'book'),o('enter','Open the library door',0,-4240,440,'door')];
 for(let i=0;i<3;i++)G.storyObjects.push(o('mirror.'+i,'Turn '+['left','middle','right'][i]+' mirror',mirrorPoints[i][0],mirrorPoints[i][1],420,'mirror'+i));
 for(const ob of G.storyObjects)if(ob.key.endsWith('.upper')){ob.blockedLabel='Defeat this balcony patrol first';ob.blockedText='The patrol controls this release. The lower garden offers another way.';}
 G.healpads=[{x:0,z:-1280,y:200,r:85,charge:1,infinite:true,locked:true,courtPad:true,_acc:0},{x:1540,z:-870,y:160,r:31,charge:1,_acc:0},{x:-260,z:-3590,y:420,r:31,charge:1,_acc:0}];
 for(const [type,x,z,y,guard]of [['grunt',-920,-2380,340,'west'],['caster',-1160,-2520,340,'west'],['grunt',960,-1930,340,'east'],['caster',1200,-2170,340,'east'],['grunt',600,-1050,160],['grunt',-1330,-1900,180],['caster',1200,-2730,260],['slime',1630,-1470,160],['grunt',-1730,-1730,270],['caster',-200,-3410,390]]){const e=spawn(type,x,z,false);Object.assign(e,{y,sx:x,sz:z,courtGuard:guard||null});}
 for(const wall of G.walls)wall.courtWall=true;
 G.bounds={minX:-2570,maxX:2290,minZ:-4880,maxZ:850};G.progressEnd=-4600;G.startPos={x:0,z:520,y:120};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-4520,y:460};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function sync({G,state:s,openWay}){const c=G.court;if(s.notes['pc.mirrors'])s.notes['pc.mirrors'].text="One sunbeam feeds the library seal. Follow the light from the tall source to the first mirror, then guide it through the other mirrors toward the sun-shaped receiver. Only mirrors reached by the beam will shine. Each handle switches its mirror between two angles.";for(const [flag,tag]of [['west','west'],['east','east'],['light.open','library']])if(f(s,flag))G.walls=G.walls.filter(w=>w.courtTag!==tag);const pad=G.healpads.find(p=>p.courtPad);if(pad)pad.locked=!f(s,'court');
 if(f(s,'court')&&!c.restored){c.restored=true;if(!s.conversation)s.cursors.grace={npc:'grace',node:'pc.grace.restored',lastChoice:''};}
 if(f(s,'garden.done')&&!s.conversation)s.cursors.grace={npc:'grace',node:'pc.grace.thanks',lastChoice:''};
 if(ready(s)){G.qs['pc.courtyard']=1;openWay();}
}
function shards(){return [{id:'SP-01',x:-1810,z:-3100,y:540}];}
function draw({G,state:s,bx,ring},t){for(const o of G.storyObjects){if(s.flags['event.'+o.key]&&o.kind!=='book')continue;const y=o.y;
 if(o.kind.startsWith('mirror')){const i=+o.kind.slice(6),on=!!((s.items['pc.light.mask']||0)&(1<<i)),lit=lightPath(s.items['pc.light.mask']||0).hits.includes(i)&&f(s,'west')&&f(s,'east');bx(o.x,y+25,o.z,70,50,55,'#d4cdb5');bx(o.x,y+55,o.z,9,60,9,'#b49a56');for(let j=-3;j<=3;j++){bx(o.x+j*8,y+76,o.z+(on?j:-j)*8,13,60,13,'#b49a56');bx(o.x+j*8,y+76,o.z+(on?j:-j)*8,9,52,9,lit?'#fff4c7':'#94aaa9');}continue;}
 bx(o.x,y+20,o.z,45,40,42,'#d4ccaf');if(o.kind==='book')bx(o.x,y+43,o.z,56,6,38,'#dec687');else if(o.kind==='seeds'){bx(o.x,y+49,o.z,32,20,28,'#a5b29d');bx(o.x,y+60,o.z,36,4,32,'#c6ba85');}else if(o.kind==='clamp'){bx(o.x,y+55,o.z,15,30,62,'#50565b');}else if(o.kind==='wheel'){ring(o.x,y+48,o.z,36,'#bba062');bx(o.x,y+51,o.z,72,8,8,'#bba062');}else bx(o.x,y+57,o.z,55,8,9,'#b49a56');}
 const active=f(s,'west')&&f(s,'east'),r=lightPath(s.items['pc.light.mask']||0);bx(sunSource[0],475,sunSource[1],36,110,36,'#b8a36c');bx(sunReceiver[0],458,sunReceiver[1],18,76,18,'#b8a36c');bx(sunReceiver[0],496,sunReceiver[1],38,38,14,r.solved&&active?'#fff2b0':'#b99b55');ring(sunReceiver[0],424,sunReceiver[1],32,r.solved&&active?'#fff2b0':'#b99b55');bx(sunReceiver[0],433,sunReceiver[1],60,5,8,'#cfad58');bx(sunReceiver[0],433,sunReceiver[1],8,5,60,'#cfad58');
 for(const q of mirrorPoints.slice(1)){ring(q[0],424,q[1],29,'#cbb369');bx(q[0],425,q[1],8,3,65,'#b99b55');bx(q[0],425,q[1],65,3,8,'#b99b55');}
 if(active)for(const [a,b]of r.segments){const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,w=Math.abs(b[0]-a[0]),d=Math.abs(b[1]-a[1]);bx(x,496,z,Math.max(9,w),5,Math.max(9,d),'#ffe7a1','#ffe7a1',.85);bx(x,499,z,Math.max(3,w),2,Math.max(3,d),'#fff8d9','#fff8d9',1);}
 if(f(s,'court')){for(let i=0;i<10;i++){const a=i*.628;bx(Math.cos(a)*76,239+Math.sin(t*3+i)*4,-1470+Math.sin(a)*76,6,5,6,'#bbded7');}bx(0,205,-1470,150,5,140,'#a4c9c5');}
}
const api={lightPath,mirrorPoints,sunSource,sunReceiver,paths,build,quest,ready,status,available,visualKey,sync,shards,draw};root.BFPalaceCourtyard=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
