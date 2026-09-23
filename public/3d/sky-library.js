/* Sunspire half two: authored routes, readable machinery and personal discoveries. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['sl.'+k];
const paths={main:[[0,380,120],[0,-600,120],[0,-1250,200],[0,-1900,200],[0,-2500,300],[0,-3250,300],[0,-3900,400],[0,-4700,400],[0,-5200,400]],maintenance:[[0,-600,120],[-750,-750,60],[-1150,-1350,60],[-850,-2050,120],[-800,-2400,240],[-650,-2350,300],[0,-2350,300],[0,-2500,300]],records:[[0,-1250,200],[680,-1400,240],[1150,-1900,320],[700,-2450,340],[0,-2500,300]],shelves:[[0,-3250,300],[650,-3200,300],[1100,-3500,360],[1450,-3650,360]],display:[[0,-3900,400],[-850,-3720,440],[-1450,-4000,440],[-1500,-4450,480]],archive:[[0,-4700,400],[650,-4550,400],[1250,-4500,400]],return:[[-850,-3720,440],[-1050,-3100,400],[0,-3250,300]]};
function ready(s){return f(s,'ready');}
function quest(s){return !f(s,'access')?'Reach the reading halls: speak to Hugh or explore the lower passage':!f(s,'orders')?'Find the Legion orders in the central reading hall':!f(s,'ready')?'Release the reading hall seal and reach the guardian door':'Enter the guardian hall when you are ready';}
function status(G){return {guards:G.enemies.filter(e=>e.libraryGuard==='main'&&!e.dead&&e.hp>0).length,active:G.library.active??-1,left:Math.max(0,G.library.left||0),vow:G.enemies.filter(e=>e.libraryGuard==='vow'&&!e.dead&&e.hp>0).length};}
function available(key,G,remote){const a=remote||status(G);if(key==='sl.release')return !a.guards;if(key.startsWith('sl.vow.'))return a.active<0||a.left<=0;if(key.startsWith('sl.seal.'))return a.active===+key.split('.').pop()&&a.left>0&&!a.vow;return true;}
function visualKey(s){return 'library:'+['access','shelf.open','display.open','ready','vow.0','vow.1','vow.2'].map(k=>+f(s,k)).join('')+':'+(s.items['sl.shelf.turns']||0);}
function build({G,plat,spawn}){
for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
Object.assign(G,{boss:null,haz:null,canyonWind:null,npc:null,secret:null,secretTrigger:null,waystone:null,beam:null,collapse:[],optionalMissions:[],portal:null,bonusPortal:null,bonusActive:false,vertical:true,thorns:[],vents:[],phasers:[],debris:[],lights:[]});G.library={active:-1,left:0,attempts:{}};
const floor=(x,z,y,w,d,extra={})=>plat(x,z,y,w,d,{slab:32,checkpoint:true,...extra});
for(const [id,ps]of Object.entries(paths))for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/100,Math.abs(b[2]-a[2])/10));for(let i=0;i<=n;i++)floor(...a.map((v,k)=>k===2?Math.round((v+(b[k]-v)*i/n)/10)*10:v+(b[k]-v)*i/n),id==='maintenance'?210:270,id==='maintenance'?210:270);}
const rooms=[['Quiet entrance',0,50,120,950,1050],['Keeper desk',0,-1200,200,850,620],['Lower passage',-1130,-1400,60,400,550],['Damaged records',1120,-1870,320,620,740],['Reading hall',0,-2800,300,1050,1050],['Shelf controls',1490,-3640,360,580,660],['Restricted shelf',2040,-4190,420,520,380],['Empty displays',-1330,-4000,440,930,660],['Hidden room',-1520,-4600,480,560,520],['Guardian approach',0,-4810,400,950,1000],['Archive stands',1320,-4600,400,1080,1000]];
for(const [name,x,z,y,w,d]of rooms){floor(x,z,y,w,d);G.rooms.push({name,x,z,y,w,d,encounter:false,cleared:true,monsters:[]});}
const wall=(x,z,y,w,d,h,tag)=>G.walls.push({x,z,y0:y,w,d,h,c:'#bdb49b',courtWall:true,libraryTag:tag});
wall(0,-1650,200,740,55,260,'access');wall(-1500,-4340,440,520,45,210,'display');wall(0,-5060,400,750,60,290,'exit');
const part=(n,x,y,z,w,h,d=w,c='#d8d1b8')=>G.deco.push({portalPart:n,x,y0:y,z,w,h,d,c});
const shelf=(x,z,y,w=180,d=55)=>{wall(x,z,y,w,d,155);part('stone',x,y+80,z,w,160,d,'#9a8969');for(let row=0;row<3;row++){part('cap',x,y+22+row*50,z,w+8,8,d+9,'#cbb88b');for(let b=0;b<6;b++)part('stone',x-w*.4+b*w*.16,y+42+row*50,z+4,w*.12,29,d+4,['#777e7b','#a18c67','#776b7d'][b%3]);}};
// Books and desks are solid; the central reading aisle stays clear.
for(const side of [-1,1])for(const z of [-2520,-2780,-3040]){shelf(side*420,z,300);part('stone',side*270,337,z,100,65,90,'#b9a780');part('cap',side*270,374,z,125,10,110,'#ddd1b1');}
for(const z of [-750,-1050,-1350])for(const side of [-1,1]){part('pillar',side*390,120,z,45,320,45);wall(side*390,z,120,40,40,320);part('cap',side*390,445,z,70,15,70,'#c9a65c');}
for(const [x,z,y]of [[1120,-2130,320],[-1660,-3830,440],[-1050,-4160,440],[1520,-3360,360],[2200,-4320,420]])shelf(x,z,y,200);
for(const [x,z,y,w]of [[0,380,120,820],[0,-3470,300,700],[0,-5080,400,800]]){for(const side of [-1,1]){part('pillar',x+side*w/2,y,z,55,300,55);wall(x+side*w/2,z,y,48,48,300);}part('stone',x,y+310,z,w+100,45,65);part('cap',x,y+340,z,w+140,15,90,'#bba163');}
// Open skyline above tall book walls, without opaque roofs hiding the player.
for(const side of [-1,1]){wall(side*530,-2880,300,50,650,340);part('stone',side*560,550,-2880,55,500,650);for(let j=0;j<5;j++)part('furnace',side*525,630,-3100+j*170,20,180,95,'#c7b579');}
for(const [x,z,y]of [[-1220,-3910,440],[-1430,-4070,440],[-1120,-4070,440]]){part('stone',x,y+25,z,85,50,75);part('ring',x,y+100,z,58,70,58,'#aa97c4');}
part('rubble',-1530,450,-4150,100,60,85,'#c2b4cf');
for(const [x,z,y]of [[-380,160,120],[370,-250,120],[-1650,-4570,480],[1600,-4910,400],[1840,-4170,420]]){part('stone',x,y+14,z,120,28,100);for(let j=0;j<5;j++)part('rubble',x+j*17-34,y+35,z,25,40,25,'#7e976a');}
for(let i=0;i<3;i++){const x=1000+i*300;part('pillar',x,400,-4740,48,80,48);part('cap',x,483,-4740,82,12,68,'#d7bd79');}
G.storyNpcs=[{id:'hugh',name:'Master Hugh',x:-220,z:-1250,y:200},{id:'simon',name:'Simon',x:1470,z:-3510,y:360}];
const o=(k,label,x,z,y,kind='lever')=>({key:'sl.'+k,label,x,z,y,kind});
G.storyObjects=[o('maintenance','Open the service latch',-1110,-1600,60),o('records','Lift the fallen records onto a dry desk',1130,-1850,320,'book'),o('orders','Read the Legion orders',-220,-2930,300,'book'),o('release','Release the reading hall seal',0,-4870,400),o('history','Read the scholar’s last note',-1300,-3860,440,'book'),o('display.clue','Inspect the broken display mounts',-1060,-3980,440,'book'),o('shelf.clue','Read the shelf handles',1460,-3810,360,'book')];
for(let i=0;i<3;i++){G.storyObjects.push(o('shelf.'+i,'Turn shelf '+(i+1),1320+i*170,-3650,360,'shelf'+i));G.storyObjects.push(o('display.'+i,'Press the '+['sun','wing','sword'][i]+' mark',-1430+i*160,-4210,440,'mark'+i));G.storyObjects.push(o('vow.'+i,'Defend archive stand '+(i+1),1000+i*300,-4610,400,'stand'+i));G.storyObjects.push(o('seal.'+i,'Secure archive stand '+(i+1),1000+i*300,-4610,400,'seal'+i));}
for(const o of G.storyObjects)if(o.key==='sl.release'){o.blockedLabel='Defeat the reading hall patrol first';o.blockedText='The occupied reading hall controls this seal.';}
G.healpads=[{x:280,z:-900,y:160,r:31,charge:1,_acc:0},{x:-720,z:-3610,y:430,r:31,charge:1,_acc:0},{x:700,z:-4860,y:400,r:31,charge:1,_acc:0}];
for(const [type,x,z,y,guard]of [['grunt',-1110,-1230,60],['caster',1150,-1950,320],['grunt',-260,-2640,300,'main'],['caster',290,-2940,300,'main'],['grunt',100,-3150,300,'main'],['grunt',-1070,-3290,420],['caster',-1420,-4050,440],['grunt',500,-4500,400]]){const e=spawn(type,x,z,false);Object.assign(e,{y,sx:x,sz:z,libraryGuard:guard||null});}
G.bounds={minX:-1990,maxX:2420,minZ:-5550,maxZ:850};G.progressEnd=-5260;G.startPos={x:0,z:430,y:120};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-5260,y:400};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function sync({G,state:s,plat,spawn,host,openWay}){const l=G.library;for(const [flag,tag]of [['access','access'],['display.open','display'],['ready','exit']])if(f(s,flag))G.walls=G.walls.filter(w=>w.libraryTag!==tag);
const turn=s.items['sl.shelf.turns']||0;if(l.turn!==turn){l.turn=turn;G.walls=G.walls.filter(w=>!w.libraryShelf);for(let i=0;i<3;i++){const v=s.items['sl.shelf.'+i]||0;G.walls.push({x:1650+i*130,z:-3790-i*50,y0:360,w:v%2?40:125,d:v%2?125:40,h:80,courtWall:true,libraryShelf:true,invisible:true});}}
if(f(s,'shelf.open')&&!l.bridge){l.bridge=true;for(let i=0;i<8;i++)plat(1660+i*48,-3900-i*34,360+Math.round(i*.8)*10,145,145,{slab:25,checkpoint:true});}
for(let i=0;i<3;i++){const attempt=s.items['sl.attempt.'+i]||0;if(attempt!==(l.attempts[i]||0)){l.attempts[i]=attempt;l.active=i;l.left=40;for(const e of G.enemies)if(e.libraryGuard==='vow')e.dead=true;if(host){for(let j=0;j<3;j++){const x=1000+i*300+(j-1)*150,z=-4270;const e=spawn(j===1?'caster':'grunt',x,z,false);Object.assign(e,{y:400,sx:x,sz:z,libraryGuard:'vow'});}}}if(f(s,'vow.'+i)&&l.active===i){l.active=-1;l.left=0;}}
if(ready(s)){G.qs['sl.library']=1;openWay();}}
function tick(G,dt,host){if(host&&G.library.active>=0)G.library.left=Math.max(0,G.library.left-dt);}
function shards(s){const a=[];if(f(s,'shelf.open'))a.push({id:'SP-03',x:2050,z:-4200,y:420});if(f(s,'display.open'))a.push({id:'SP-04',x:-1600,z:-4710,y:480});if([0,1,2].every(i=>f(s,'vow.'+i)))a.push({id:'SP-05',x:1480,z:-4900,y:400});return a;}
function draw({G,state:s,bx,ring},t){for(const o of G.storyObjects){if(o.kind.startsWith('seal'))continue;if(s.flags['event.'+o.key]&&o.kind!=='book')continue;bx(o.x,o.y+20,o.z,45,40,42,'#c9bfa4');if(o.kind==='book')bx(o.x,o.y+44,o.z,58,8,40,'#e5d39f');else if(o.kind.startsWith('shelf')){const i=+o.kind.slice(5),v=(s.items['sl.shelf.'+i]||0)%4;const dx=[0,32,0,-32][v],dz=[-32,0,32,0][v];bx(o.x+dx,o.y+54,o.z+dz,12,8,12,'#f6d47c');bx(o.x,o.y+52,o.z,30,8,30,'#887753');}else if(o.kind.startsWith('mark')){const i=+o.kind.slice(4);if(i===0){ring(o.x,o.y+47,o.z,15,'#dfba68');for(let j=0;j<8;j++)bx(o.x+Math.sin(j*Math.PI/4)*25,o.y+49,o.z+Math.cos(j*Math.PI/4)*25,7,6,7,'#dfba68');}else if(i===1){for(let j=0;j<4;j++)bx(o.x-18+j*12,o.y+49,o.z+j*6,8,6,35-j*6,'#b3c9dc');}else{bx(o.x,o.y+49,o.z,6,6,47,'#d7dce0');bx(o.x,o.y+50,o.z+9,25,6,6,'#cbb26e');}}else bx(o.x,o.y+50,o.z,55,8,10,'#baa268');}
const a=G.library.remote||status(G);if(a.active>=0){const x=1000+a.active*300,c=a.left>0?'#e9c86d':'#c26767';ring(x,404,-4740,90,c);for(let j=0;j<Math.ceil(a.left/4);j++)bx(x-45+j*10,515,-4740,7,8,12,c);for(const e of G.enemies)if(e.libraryGuard==='vow'&&!e.dead&&e.hp>0)for(let j=0;j<10;j++){const u=j/10;bx(e.x+(x-e.x)*u,450,e.z+(-4740-e.z)*u,5,5,5,'#ad89bb');}}
for(let i=0;i<3;i++)if(f(s,'vow.'+i))ring(1000+i*300,493,-4740,35,'#cfe1a4');
// The shelves themselves turn with their handles; opened crossings stay stable.
for(let i=0;i<3;i++){const v=s.items['sl.shelf.'+i]||0,x=1650+i*130,z=-3790-i*50;bx(x,397,z,v%2?40:125,65,v%2?125:40,'#a49373');bx(x,435,z,v%2?46:140,10,v%2?140:46,'#d7c299');}
}
const api={paths,build,quest,ready,status,available,visualKey,sync,tick,shards,draw};root.BFSkyLibrary=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
