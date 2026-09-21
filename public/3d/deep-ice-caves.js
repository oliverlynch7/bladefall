/* Deep Ice Caves: authored rescue, waterworks and optional climbing routes. */
(function(root){'use strict';
const paths={
 entry:[[0,300,340],[0,-300,340],[-200,-900,240],[0,-1400,240]],
 laboratory:[[0,-1400,240],[-520,-1660,270],[-850,-2080,300],[-1350,-2250,300]],
 west:[[-200,-1100,240],[-1000,-1100,240],[-1700,-1500,240],[-2000,-2100,300],[-1700,-2250,300],[-1350,-2250,300]],
 notes:[[-1700,-2250,300],[-2150,-2510,240],[-2250,-2800,200]],
 descent:[[-1350,-2250,300],[-850,-2600,300],[-500,-3100,180],[0,-3400,180],[0,-3780,180]],
 hugo:[[0,-1400,240],[650,-1600,190],[1100,-1900,100],[1450,-2130,100],[1450,-2600,100]],
 rope:[[1450,-2600,100],[1450,-3280,140],[800,-3500,140],[0,-3500,180]],
 channels:[[-300,-3500,180],[-700,-3720,120],[-1100,-4070,80],[-1350,-4300,80]],
 lower:[[-1350,-4960,80],[-1350,-5310,80]],
 waterfall:[[800,-3500,140],[1620,-3740,200],[2020,-4200,290],[1680,-4650,380],[1300,-4900,440],[1050,-4900,440]],
 ledge:[[1050,-4900,440],[940,-5080,470],[740,-5140,500],[540,-5100,520]],
 recovery:[[1050,-4900,360],[850,-4730,300],[550,-4720,230],[0,-4860,180]],
 exit:[[0,-4450,180],[0,-4900,180],[0,-5460,180]]
};
const flag=(s,k)=>!!s.flags[k],ready=s=>flag(s,'ic.ellis.lead')&&flag(s,'ic.lock.open');
function quest(s){return !flag(s,'ic.pages')?'Follow the dropped pages into the caves':!flag(s,'ic.free')?'Reach the hidden laboratory and release Ellis':!flag(s,'ic.ellis.met')?'Speak to Professor Ellis in the laboratory':!flag(s,'ic.notes')?'Recover Ellis’s sealed notes from the fallen research pack':!flag(s,'ic.ellis.lead')?'Bring the sealed notes back to Ellis':!flag(s,'ic.lock.open')?'Read the waterworks plate and open the ice crossing':'Reach the north cavern — three Legion officers guard the exit';}
function status(G){return {guards:G.enemies.filter(e=>e.iceGuard&&!e.dead&&e.hp>0).length,rescueT:G.iceCaves.rescueT};}
function available(key,G,remote){return key!=='ic.free'||!(remote||status(G)).guards;}
function build({G,seg,plat,solid,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
 Object.assign(G,{haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
 G.iceCaves={walks:{},rescueT:0,water:0,sideWater:0,wet:0};G.areaName='Frostfell · Deep Ice Caves';G.campaignLayout={revision:2009,zone:'frost',area:1};
 const floor=(x,z,y,w,d)=>plat(x,z,y,w,d,{slab:24,checkpoint:true,iceCaveFloor:true});
 for(const [id,p]of Object.entries(paths)){const walk=[];for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/(id==='ledge'?145:85),Math.abs(b[2]-a[2])/(id==='ledge'?35:13)));for(let k=0;k<=n;k++){const q=a.map((v,i)=>v+(b[i]-v)*k/n);floor(q[0],q[1],q[2],id==='ledge'?100:id==='channels'?200:270,id==='ledge'?100:id==='channels'?200:270);walk.push(q);}}G.iceCaves.walks[id]=walk;}
 const rooms=[['Cave Mouth',0,240,340,720,700],['Crystal Junction',0,-1400,240,780,600],['Hidden Laboratory',-1350,-2240,300,1050,650],['Fallen Research Pack',-2250,-2820,200,540,430],['Broken Ice Shelf',1450,-2490,100,560,650],['Waterworks',0,-3570,180,860,700],['Lower Controls',-1350,-4210,80,590,430],['Sealed Channel',-1350,-5320,80,620,560],['North Junction',0,-4790,180,740,860],['Officer Approach',0,-5470,180,760,450]];
 for(const [name,x,z,y,w,d]of rooms){G.rooms.push({name,x,z,y,w,d,monsters:[],encounter:false,cleared:true});floor(x,z,y,w,d);}
 // True cave walls and a few high roofs frame rooms; the renderer handles camera occlusion.
 for(const [x,z,y,w,d,h]of [[-540,200,200,260,850,540],[530,40,200,280,800,600],[-420,-680,70,170,480,620],[610,-990,100,300,320,650],[-1430,-760,100,850,250,600],[-2320,-1710,150,340,750,550],[-1580,-2810,70,550,200,730],[-540,-2220,150,240,480,610],[1920,-2340,0,260,930,740],[1020,-2410,0,220,480,670],[-860,-3180,0,350,380,680],[-1970,-4040,0,320,900,850],[-1950,-5250,0,360,650,860],[600,-4120,0,280,820,780],[-550,-4770,0,200,780,820],[2540,-4240,0,330,850,870],[2050,-4980,100,400,650,930],[-590,-5540,0,230,580,830]])G.walls.push({x,z,y0:y,w,d,h,caveWall:true});
 for(const [x,z,y,w,d]of [[0,220,900,900,660],[-1350,-2240,950,1150,800],[1450,-2490,900,770,660],[0,-3570,1080,950,700],[-1350,-5310,950,840,600]])G.deco.push({kind:'caveroof',x,z,y0:y,w,d,h:65,c:'#86b9cb'});
 for(const [x,z,y,w,h]of [[-350,-1440,240,60,130],[280,-1300,240,50,95],[-1860,-2430,300,70,180],[1700,-2560,100,65,150],[-1630,-4180,80,80,150],[2100,-4440,340,65,120],[210,-4800,180,55,135]])G.deco.push({theme:'frost',x,z,y0:y,w,d:w,h,c:'#81b5cc'});
 for(let i=0;i<8;i++)G.deco.push({theme:'frost',x:1800+i*29,z:-4540+(i%3)*17,y0:20,w:47,d:62,h:450-i*22});
 // Workbenches and shelves are placed off the two lab approaches.
 for(const [x,z,w,d,h]of [[-1220,-2420,210,85,48],[-1580,-2420,180,65,50],[-1660,-2080,200,45,125]])G.deco.push({kind:'iceResearch',x,z,y0:300,w,d,h,c:'#796b55'});
 const obj=(key,label,x,z,y,kind='lever')=>({key,label,x,z,y,kind});
 G.storyNpcs=[{id:'ellis',name:'Professor Ellis',x:-1330,z:-2230,y:300},{id:'hugo',name:'Hugo',x:1450,z:-2680,y:100}];
 G.storyObjects=[obj('ic.pages','Read the dropped research page',-80,-1020,240,'paper'),obj('ic.free','Release Professor Ellis',-1210,-2210,300,'lock'),obj('ic.notes','Recover the sealed notes',-2250,-2820,200,'pack'),obj('ic.lock.clue','Read the waterworks plate',-170,-3670,180,'plate'),obj('ic.hugo.find','Call into the broken ice shelf',1450,-2490,100,'call'),obj('ic.hugo.brace','Secure the rescue frame',1330,-2540,100,'brace'),obj('ic.rope','Take the spare rope',1450,-3260,140,'rope'),obj('ic.hugo.rope','Lower the rescue rope',1500,-2580,100,'rope'),obj('ic.channel.clue','Read the lower channel marks',-1430,-4210,80,'plate')];
 for(const [prefix,x,z,y]of [['ic.lock',0,-3850,180],['ic.channel',-1350,-4380,80]])for(const [i,name]of ['Fill','Freeze','Drain'].entries())G.storyObjects.push(obj(prefix+'.'+(i+1),name+' the '+(prefix==='ic.lock'?'main':'lower')+' channel',x-160+i*160,z,y,['fill','freeze','drain'][i]));
 for(const [x,z,y]of [[190,-1280,240],[-990,-2300,300],[230,-3450,180],[180,-4750,180]])G.healpads.push({x,z,y,r:31,charge:1,_acc:0});
 for(const [type,x,z,y,guard]of [['frostling',-100,-630,280],['frostling',200,-1380,240],['frostling',-1100,-1200,240],['grunt',-1250,-2310,300,true],['caster',-1570,-2300,300,true],['grunt',-1100,-2100,300,true],['frostling',-2120,-2620,220],['frostling',1100,-2010,100],['frostling',1670,-2410,100],['frostlobber',1430,-3130,130],['grunt',-100,-3500,180],['caster',140,-3680,180],['frostling',-1310,-4130,80],['frostling',1800,-4000,255],['frostlobber',1750,-4530,350],['grunt',120,-5020,180]]){const e=spawn(type,x,z,false);e.y=y;e.iceGuard=!!guard;}
 seg(0,-4200,500,640,{icePool:true});seg(-1350,-4680,400,590,{icePool:true});
 G.bounds={minX:-2660,maxX:2750,minZ:-5800,maxZ:700};G.progressEnd=-5610;G.startPos={x:0,z:300,y:340};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-5550,y:180};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function actors(G,s){const h=G.storyNpcs.find(n=>n.id==='hugo');if(!h)return;if(!flag(s,'ic.hugo.free')){Object.assign(h,{x:1450,z:-2680,y:100,walking:false});return;}const p=[[1450,-2680,100],...paths.rope],lengths=p.slice(1).map((q,i)=>Math.hypot(q[0]-p[i][0],q[1]-p[i][1])),total=lengths.reduce((a,b)=>a+b,0);let distance=Math.min(total,G.iceCaves.rescueT*155);for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const t=distance/lengths[i],a=p[i],b=p[i+1];Object.assign(h,{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,y:a[2]+(b[2]-a[2])*t,walking:G.iceCaves.rescueT*155<total,_yaw:Math.atan2(b[0]-a[0],b[1]-a[1])});break;}distance-=lengths[i];}}
function sync({G,state:s,plat,openWay,toast,sound}){const k=G.iceCaves,f=s.flags;if(!k)return;
 for(const [id,x,z,y,w,d]of [['ic.lock.open',0,-4180,180,270,730],['ic.channel.open',-1350,-4680,80,250,680]])if(f[id]&&!k[id]){k[id]=true;plat(x,z,y,w,d,{slab:26,checkpoint:true,iceBridge:true});}
 for(const [id,msg]of [['ic.pages','The page names Ellis’s laboratory to the west. A boot print cuts across the writing. Clue added to your journal.'],['ic.free','Ellis is free. Speak to him before leaving the laboratory.'],['ic.notes','Sealed notes recovered. Bring them back to Ellis.'],['ic.lock.clue','Fill to the marked line. Freeze the surface. Drain the water beneath. The crossing will stay solid.'],['ic.channel.clue','Drain the old water first. Fill with fresh water, then freeze. The side chamber will open.'],['ic.hugo.brace','Rescue frame secured. Find rope before lowering it.'],['ic.rope','Spare rope recovered. Return to the broken ice shelf.'],['ic.hugo.free','Hugo is climbing out. He will meet you at the waterworks junction.'],['ic.lock.open','The main ice crossing is stable. The north cavern is open.'],['ic.channel.open','The side channel is frozen. Follow it to the sealed chamber.']])if(f[id]&&!k[id+'.seen']){k[id+'.seen']=true;toast?.(msg);}
 for(const id of ['ic.lock','ic.channel']){const n=s.items[id]||0;if(k[id+'.step']!==undefined&&k[id+'.step']!==n){sound?.('lever');if(!f[id+'.open'])toast?.(n?'Waterworks step '+n+' of 3 set.':'The unfinished cycle drains safely. Check the plate and try again.');}k[id+'.step']=n;}
 actors(G,s);if(ready(s)){G.qs['ic.caves']=1;openWay();}
}
function tick({G,state:s,host,toast},dt){const k=G.iceCaves;if(flag(s,'ic.hugo.free'))k.rescueT=Math.min(30,k.rescueT+dt);actors(G,s);
 const main=flag(s,'ic.lock.open')?0:(s.items['ic.lock']||0)>0?148:0,side=flag(s,'ic.channel.open')?0:(s.items['ic.channel']||0)>1?52:0;k.water+=(main-k.water)*Math.min(1,dt*2);k.sideWater+=(side-k.sideWater)*Math.min(1,dt*2);
 const p=G.p,wet=p.hp>0&&!p.downed&&p.y<35&&((Math.abs(p.x)<250&&p.z<-3900&&p.z>-4470)||(Math.abs(p.x+1350)<200&&p.z<-4410&&p.z>-4970));k.wet=wet?k.wet+dt:0;
 if(k.wet>1){const side=p.x<-600;Object.assign(p,{x:side?-1350:0,z:side?-4200:-3620,y:side?80:180,vy:0,vx:0,vz:0,onGround:true});k.wet=0;toast?.('The safety steps bring you back to the dry controls.');}
}
function apply(G,p,s){G.iceCaves.remote=p;G.iceCaves.rescueT=p.rescueT;actors(G,s);}
function shards(s){return [...(flag(s,'ic.channel.open')?[{id:'FF-04',x:-1350,z:-5400,y:80}]:[]),{id:'FF-05',x:540,z:-5100,y:520}];}
function draw({G,state:s,bx},t){const k=G.iceCaves;if(!k)return;const f=s.flags;
 // Basins have opaque floors, a visible changing waterline and dry controls.
 for(const [x,z,width,h,step,done]of [[0,-4200,450,k.water,s.items['ic.lock']||0,f['ic.lock.open']],[-1350,-4680,360,k.sideWater,s.items['ic.channel']||0,f['ic.channel.open']]]){if(!done){bx(x,4+h,z,width,5,570,step===2?'#9cdae5':'#28576a');for(let i=0;i<5;i++)bx(x-width*.35+i*width*.17,8+h,z+Math.sin(t+i)*5,30,2,160,'#568fa2');}for(const dx of [-width/2,width/2])bx(x+dx,32,z,14,64,590,'#648c9a');}
 for(const o of G.storyObjects){const y=o.y;
  if(['fill','freeze','drain'].includes(o.kind)){bx(o.x,y+26,o.z,52,52,48,'#596f75');bx(o.x,y+59,o.z,56,10,54,'#bab79a');const count=['fill','freeze','drain'].indexOf(o.kind)+1;for(let i=0;i<count;i++)bx(o.x-12+i*12,y+31,o.z+26,5,25,3,'#efe4b9');bx(o.x,y+78,o.z,8,30,8,'#a8864d');if(o.kind==='fill'){bx(o.x-38,y+36,o.z,15,72,15,'#8b9c9e');bx(o.x-24,y+76,o.z,43,12,15,'#8b9c9e');bx(o.x-2,y+66,o.z,12,20,12,'#629fb5');}else if(o.kind==='freeze'){for(const dx of [-14,0,14])bx(o.x+dx,y+86-Math.abs(dx)*.6,o.z,8,40-Math.abs(dx),8,'#c5e8f0');}else{bx(o.x,y+86,o.z,62,7,12,'#a8864d');for(const dx of [-27,27])bx(o.x+dx,y+78,o.z,7,23,12,'#a8864d');}}
  else if(o.kind==='paper'||o.kind==='plate'){bx(o.x,y+30,o.z,14,60,14,'#665644');bx(o.x,y+65,o.z,92,48,8,'#c9c1a2');for(let i=0;i<3;i++)bx(o.x,y+53+i*10,o.z+6,61-i*10,3,2,'#4b5660');}
  else if(o.kind==='pack'){if(!f['ic.notes']){bx(o.x,y+20,o.z,58,40,43,'#796553');bx(o.x,y+42,o.z,34,5,28,'#ddd0ac');bx(o.x,y+46,o.z,11,4,9,'#a84f3f');}}
  else if(o.kind==='rope'){if(o.key==='ic.rope'&&f['ic.rope'])continue;for(let i=0;i<6;i++)bx(o.x,y+6+i*4,o.z,42-i%2*8,4,30+i%2*8,'#bcaa7b');}
  else {bx(o.x,y+24,o.z,45,48,35,'#59717a');bx(o.x,y+51,o.z,65,8,12,'#bdac80');}
 }
 const h=G.storyNpcs.find(n=>n.id==='hugo');if(!f['ic.hugo.free']){for(const dx of [-100,100])bx(1450+dx,176,-2680,25,152,22,'#8cc7d9');bx(1450,244,-2680,225,18,30,'#a3d5e0');}else{for(let j=0;j<7;j++)bx(1360+j*28,104,-2680+j%2*18,23,8,32,'#a3d5e0');}
 if(f['ic.hugo.brace']){for(const dx of [-85,85])bx(1450+dx,160,-2560,12,120,12,'#8b7755');bx(1450,225,-2560,200,14,20,'#b59a68');}if(f['ic.hugo.free'])bx(1450,164,-2580,6,120,6,'#c7b48d');
 if(!f['ic.free']){for(const dx of [-22,22])bx(-1330+dx,326,-2230,9,12,10,'#59626b');bx(-1330,325,-2217,40,5,5,'#879399');}
 // The frozen waterfall bends around the ledges; narrow shelves remain visible.
 // Faceted waterfall crystals are instanced by the Frostfell renderer.
 for(const [x,z,y]of [[-20,-650,290],[-560,-1680,270],[-1000,-2120,300]])for(let j=0;j<3;j++)bx(x+j*15,y+3,z+j*22,14,2,20,'#d4cfb8');
 for(const n of G.storyNpcs){if(n.id==='ellis'?!f['ic.ellis.lead']:(f['ic.hugo.found']&&!f['ic.hugo.reward'])){bx(n.x,n.y+83+Math.sin(t*2)*2,n.z,5,13,5,f['ic.notes']||f['ic.hugo.free']?'#b8e2b2':'#e3cb8b');bx(n.x,n.y+72,n.z,5,4,5,'#e3cb8b');}}
}
const api={build,paths,ready,quest,status,available,sync,tick,actors,apply,shards,draw};root.BFIceCaves=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
