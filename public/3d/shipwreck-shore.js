/* Shipwreck Shore: shared story progression, individual discoveries, authored terrain. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['sc.'+k];
const paths={beach:[[0,500,30],[0,-350,30],[0,-1400,30],[0,-2550,30]],wreck:[[-100,-500,30],[-800,-650,50],[-1350,-1250,110],[-1750,-1820,240],[-1370,-2320,300],[-760,-2320,130],[0,-2200,30]],lookout:[[0,-800,30],[850,-650,100],[1400,-1150,220],[1350,-1900,350],[950,-2440,200],[0,-2550,30]],cave:[[850,-650,100],[1840,-440,30],[2350,-1100,0],[2230,-1950,0],[1780,-2250,200],[950,-2440,200]],rose:[[0,-2550,30],[-750,-2820,50],[-1320,-3400,130],[-850,-3970,80],[0,-4050,30],[0,-2550,30]],cache:[[-1320,-3400,130],[-2130,-3540,200],[-2370,-2870,100],[-1750,-1820,240]]};
function code(seed){return [1+(seed>>>0)%4,1+((seed>>>3)%4),1+((seed>>>7)%4)];}
function quest(s){return !f(s,'met')?'Speak to Otto beside the boat':!f(s,'boat.ready')?'Repair the boat: rudder '+(+f(s,'installed.rudder'))+'/1, sail '+(+f(s,'installed.sail'))+'/1, rope '+(+f(s,'installed.rope'))+'/1':!f(s,'depart')?'Finish exploring, then board beside Otto':'Survive the crossing to Thunder Cliffs';}
function status(G){return {guards:G.enemies.filter(e=>e.shoreLookout&&!e.dead&&e.hp>0).length,clock:G.shore.clock};}
function available(key,G,remote){return key!=='sc.sail'||!(remote||status(G)).guards;}
function build({G,plat,spawn}){
 for(const key of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[key]=[];
 Object.assign(G,{boss:null,haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
 G.shore={clock:0,walks:{},code:code(G.runSeed)};G.areaName='Storm Coast - Shipwreck Shore';G.campaignLayout={revision:2015,zone:'storm',area:0};
 const floor=(x,z,y,w,d,extra={})=>plat(x,z,y,w,d,{slab:40,checkpoint:true,...extra});
 for(const [id,points]of Object.entries(paths)){const walk=[];for(let j=1;j<points.length;j++){
  const a=points[j-1],b=points[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/105,Math.abs(b[2]-a[2])/12));
  for(let i=0;i<=n;i++){const p=a.map((v,k)=>v+(b[k]-v)*i/n);floor(...p,id==='cache'?180:300,id==='cache'?180:300,{shoreTimber:id==='wreck'});walk.push(p);}
 }G.shore.walks[id]=walk;}
 for(const [name,x,z,y,w,d]of [['Work beach',0,-450,30,820,1900],['Broken hull',-1510,-1830,240,500,500],['Rudder deck',-1370,-2320,300,520,520],['Occupied lookout',1350,-1900,350,620,600],['Dry storage cave',2300,-1380,0,650,1550],['Lower hatch',-1860,-1220,40,500,500],['Rose\'s wreck',-1320,-3400,130,750,650],['Lantern wreck',-2130,-3540,200,630,660],['Crew memorial',0,-4050,30,650,480]]){floor(x,z,y,w,d,{shoreTimber:name==='Broken hull'||name==='Rudder deck'});G.rooms.push({name,x,z,y,w,d,monsters:[],encounter:false,cleared:true});}
 // Lower crawlspace has its own route under the leaning hull, not an invisible pickup.
 G.shore.walks.hatch=[[0,-1500,30],[-700,-1550,30],[-1250,-1800,40],[-1860,-1720,40],[-1860,-1250,40]];
 for(let j=1;j<G.shore.walks.hatch.length;j++){const a=G.shore.walks.hatch[j-1],b=G.shore.walks.hatch[j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/90);for(let i=0;i<=n;i++)floor(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,a[2]+(b[2]-a[2])*i/n,150,170);}
 // Short jumping return from the upper wreck, with a broad low catch beach.
 floor(-790,-1760,20,900,550);G.shore.jumps=[];
 for(let i=0;i<5;i++){const p=[-1090+i*150,-1880,260-i*42];floor(...p,110,120);G.shore.jumps.push(p);}
 for(const [x,z,y,w,d,h]of [[-2700,-2850,-80,200,2300,500],[2820,-1430,-80,180,2200,600],[2630,-2280,0,300,100,420],[1890,-1220,0,110,800,330],[2750,-1150,0,110,1050,380],[1400,-2210,300,650,90,130],[-1750,-3890,130,70,300,180]])G.walls.push({x,z,y0:y,w,d,h,c:'#405158',caveWall:true});
 G.shore.hatch={x:-1860,z:-1460,y0:40,w:500,d:70,h:150,shoreHatch:true,c:'#67482f'};G.walls.push(G.shore.hatch);
 for(const [x,z,y,w,d,h]of [[-1500,-1850,240,570,950,180],[-1320,-3400,130,820,700,170],[-2140,-3510,200,530,670,120]])G.deco.push({kind:'shoreWreck',x,z,y0:y,w,d,h});
 for(const [x,z,y]of [[1350,-1900,350],[250,-450,30]])G.deco.push({kind:'shoreShelter',x,z,y0:y,w:260,d:240,h:180});
 for(let i=0;i<30;i++)G.deco.push({kind:'shoreRock',x:(i%2?-1:1)*(2800+(i%4)*100),z:400-i*180,y0:-80,w:180+i%3*100,d:220,h:160+i%5*80});
 for(const d of G.deco)d.c=d.kind==='shoreRock'?'#405359':'#98734c';
 G.storyNpcs=[{id:'otto',name:'Otto',x:170,z:-300,y:30},{id:'rose',name:'Captain Rose',x:-160,z:-2680,y:30}];
 const obj=(key,label,x,z,y,kind)=>({key:'sc.'+key,label,x,z,y,kind});
 G.storyObjects=[obj('rudder','Take the rudder',-1390,-2420,300,'rudder'),obj('sail','Take the sailcloth',1480,-1900,350,'sail'),obj('drain','Open the outside drain',2230,-690,0,'lever'),obj('latch','Lift the dry-room latch',2390,-1190,0,'lever'),obj('rope','Take the dry rope',2370,-1640,0,'rope'),obj('bell','Take the ship bell',-1320,-3430,130,'bell'),obj('record','Read the last crew entry',-1120,-3600,130,'book'),obj('memorial','Set the crew board upright',100,-4100,30,'memorial'),obj('hull.note','Read the hull repair marks',-1220,-2130,300,'book'),obj('code.note','Read the ship chest lid',-2140,-3400,200,'chest'),obj('board','Board the repaired boat',-180,-210,30,'board')];
 for(let i=0;i<3;i++)G.storyObjects.push(obj('weight.'+(i+1),'Move the '+[1,2,4][i]+' weight',-1540+i*125,-2150,300,'weight'+i));
 for(let i=1;i<=4;i++)G.storyObjects.push(obj('code.'+i,'Enter '+i,-2310+i*95,-3680,200,'code'+i));
 G.storyObjects.find(o=>o.key==='sc.sail').blockedLabel='Clear the lookout patrol first';G.storyObjects.find(o=>o.key==='sc.sail').blockedText='The patrol still controls the sailcloth.';
 for(const [x,z,y]of [[-210,-550,30],[1050,-720,125],[-250,-2780,30]])G.healpads.push({x,z,y,r:31,charge:1,_acc:0});
 for(const [type,x,z,y,guard]of [['grunt',-950,-850,65],['caster',-1670,-1800,240],['grunt',-720,-2200,120],['grunt',1390,-1700,350,true],['caster',1210,-1840,350,true],['grunt',1550,-2040,350,true],['slime',2350,-1030,0],['slime',2250,-1810,0],['grunt',-1060,-3190,115],['caster',-2050,-3480,200],['grunt',0,-3830,30]]){const e=spawn(type,x,z,false);e.y=y;e.shoreLookout=!!guard;}
 G.bounds={minX:-2900,maxX:2950,minZ:-4400,maxZ:900};G.progressEnd=-4300;G.startPos={x:0,z:490,y:30};G.lastSafe={...G.startPos};G.portalPos={x:-180,z:-210,y:30};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function sync({G,state:s,plat}){
 if(f(s,'hull.open')&&!G.shore.hatchOpen){G.shore.hatchOpen=true;G.walls=G.walls.filter(w=>!w.shoreHatch);}
 for(const [part,x,z,y]of [['rudder',-600,-1350,45],['sail',650,-1300,45],['rope',1500,-700,70]])if(s.items['sc.'+part]&&!G.shore[part+'return']){G.shore[part+'return']=true;for(let i=0;i<=6;i++)plat(x*(1-i/6),z+(i/6)*(-850-z),y+(30-y)*i/6,170,190,{slab:28,checkpoint:true});}
 G.shore.parts=['rudder','sail','rope'].map(k=>f(s,'installed.'+k));
}
function shards(s){return f(s,'hull.open')?[{id:'SC-01',x:-1930,z:-1230,y:40}]:[];}
function draw({G,state:s,bx},t){
 for(const o of G.storyObjects){if(s.flags['event.'+o.key]&&!['memorial'].includes(o.kind))continue;const y=o.y;
  if(o.kind==='book'){bx(o.x,y+24,o.z,70,45,50,'#64513b');bx(o.x,y+49,o.z,60,4,40,'#ddcca3');}
  else if(o.kind==='rope'){for(let i=0;i<3;i++){bx(o.x,y+10+i*9,o.z,60-i*5,7,48-i*5,'#c3a775');}}
  else if(o.kind==='sail'){bx(o.x,y+16,o.z,90,25,55,'#dbcca8');for(const x of [-30,30])bx(o.x+x,y+30,o.z,8,5,57,'#5a695e');}
  else if(o.kind==='rudder'){bx(o.x,y+20,o.z,35,15,100,'#96643d');bx(o.x,y+20,o.z-80,12,14,80,'#6f5037');}
  else if(o.kind==='bell'){bx(o.x,y+32,o.z,38,50,38,'#ad8d4f');bx(o.x,y+10,o.z,54,12,48,'#c3a965');}
  else if(o.kind==='memorial'){bx(o.x,y+52,o.z,100,80,12,'#876444');for(let j=0;j<4;j++)bx(o.x,y+70-j*12,o.z+8,65-j*7,3,2,'#ded4b5');}
  else if(o.kind==='chest'){bx(o.x,y+30,o.z,95,55,60,f(s,'code.open')?'#6b806e':'#96663e');for(const x of [-30,30])bx(o.x+x,y+30,o.z,9,58,64,'#566775');}
  else if(o.kind!=='board'){bx(o.x,y+25,o.z,48,50,48,'#4d5d60');bx(o.x,y+63,o.z,8,35,8,'#cab780');if(o.kind.startsWith('weight')){const n=[1,2,4][+o.kind.slice(-1)];for(let i=0;i<n;i++)bx(o.x-15+(i%2)*20,y+20+Math.floor(i/2)*17,o.z+26,8,8,3,'#e0d1a1');}else if(o.kind.startsWith('code'))for(let i=0;i<+o.kind.slice(-1);i++)bx(o.x-16+i*10,y+30,o.z+25,5,15,3,'#efddb0');}
 }
 // Lantern counts remain physical, indestructible clues. Rows carry anchor/wheel/sail marks.
 for(let row=0;row<3;row++)for(let i=0;i<G.shore.code[row];i++){const x=-2350+row*205,z=-3270+i*55;bx(x,270,z,10,140,10,'#635344');bx(x,330,z,30,35,30,'#e5bb70');}
}
const api={build,sync,status,available,quest,shards,code,paths,draw};root.BFShipwreckShore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
