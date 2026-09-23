(function(root){'use strict';
const stations=[{x:-470,z:0},{x:470,z:0},{x:0,z:470}],fields=['marbleGuardian','mcState','mcClock','mcKind','mcSeq','mcX','mcZ','mcY','mcDX','mcDZ','mcExposed','mcBeat','mcBlock','mcUsed','mcScreens','yaw','y','h','r','boss','kind','label','slamW','atkT'];
const alive=e=>e&&!e.dead&&e.hp>0;
const paths={west:[[-500,700,0],[-800,500,100],[-940,100,180],[-880,-430,180],[-530,-840,220],[0,-1000,220]],east:[[500,700,0],[800,500,100],[940,100,180],[880,-430,180],[530,-840,220],[0,-1000,220]],orb:[[0,-1000,220],[0,-1380,220],[0,-1730,220]]};
function build({G,plat,spawn}){for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
Object.assign(G,{marbleArena:{intro:false},boss:null,haz:null,npc:null,secret:null,secretTrigger:null,waystone:null,beam:null,collapse:[],optionalMissions:[],portal:null,bonusPortal:null,bonusActive:false,vertical:true,thorns:[],vents:[],phasers:[],debris:[],lights:[]});
const floor=(x,z,y,w,d)=>plat(x,z,y,w,d,{slab:35,checkpoint:true});
// Overlapping rectangles approximate a round floor; no damaging ground below it.
for(let i=-9;i<=9;i++){const z=i*100,w=2*Math.sqrt(1000*1000-z*z);floor(0,z,0,w,110);}
for(const ps of Object.values(paths))for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/80,Math.abs(b[2]-a[2])/10));for(let i=0;i<=n;i++)floor(...a.map((v,k)=>k===2?Math.round((v+(b[k]-v)*i/n)/10)*10:v+(b[k]-v)*i/n),230,230);}
floor(0,-1650,220,820,650);floor(0,-1000,220,520,250);
const part=(n,x,y,z,w,h,d=w,c='#d6cfb9')=>G.deco.push({portalPart:n,x,y0:y,z,w,h,d,c});
for(let i=0;i<19;i++){const a=Math.PI*.1+i*Math.PI*1.8/18,x=Math.sin(a)*1100,z=Math.cos(a)*1100;if(z<-940&&Math.abs(x)<400)continue;part('pillar',x,0,z,72,640,72);part('cap',x,645,z,110,25,110,'#bba46b');G.walls.push({x,z,y0:0,w:66,d:66,h:640,courtWall:true,invisible:true});}
for(const side of [-1,1])for(const z of [-500,-180,140]){const x=side*1080;part('stone',x,280,z,85,500,270);for(let j=0;j<4;j++)part('furnace',x-side*47,210+j*90,z,10,55,220,'#a69574');}
part('ring',0,2,0,230,5,230,'#b4a071');for(let i=0;i<12;i++){const a=i*Math.PI/6;part('cap',Math.sin(a)*260,3,Math.cos(a)*260,35,4,35,'#b7a16b');}
for(const side of [-1,1]){part('pillar',side*330,220,-1460,55,350,55);part('stone',side*460,220,-1640,60,380,660);part('cap',side*330,575,-1460,90,18,90,'#bba15c');}
part('stone',0,580,-1460,740,45,85);part('cap',0,610,-1460,800,20,105,'#baa05d');part('pillar',0,220,-1780,65,85,65);part('ring',0,308,-1780,95,12,95,'#b7a06a');
G.walls.push({x:0,z:-1200,y0:160,w:650,d:55,h:400,courtWall:true,marbleGate:true,c:'#b5a37d'});
G.storyObjects=stations.map((p,i)=>({key:'mc.screen.'+i,label:'Turn the protective screen',x:p.x+(i===0?-115:i===1?115:0),z:p.z+(i===2?115:0),y:0,kind:'screen',blockedLabel:'Screen moving — wait a moment'}));
G.storyObjects.push({key:'mc.guide',label:'Read the screen instructions',x:-230,z:730,y:0,kind:'book'});G.storyNpcs=[];
G.rooms=[{name:'The Guardian Hall',x:0,z:0,y:0,w:2000,d:2000,cleared:true,encounter:false,monsters:[]},{name:'The Orb Chamber',x:0,z:-1650,y:220,w:820,d:650,cleared:true,encounter:false,monsters:[]}];
G.bounds={minX:-1200,maxX:1200,minZ:-2100,maxZ:1170};G.startPos={x:0,z:830,y:0};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-1900,y:220};G.goalPos={...G.portalPos};G.progressEnd=-1980;
const e=spawn('colossus',0,0,false);Object.assign(e,{marbleGuardian:true,boss:true,kind:'boss',h:390,r:145,y:0,sx:0,sz:0,active:true,dropT:0,immobile:true,role:null,spec:null,home:null,ranged:false,shot:null,label:'Marble Colossus',mcState:'recover',mcClock:3,mcKind:'hammer',mcSeq:0,mcBeat:0,mcExposed:0,mcBlock:-1,mcUsed:[0,0,0],mcScreens:[0,0,0]});G.boss=e;
Object.assign(G.p,{...G.startPos,vy:0,vx:0,vz:0,onGround:true});
}
function available(key,G){if(key.startsWith('mc.screen.'))return alive(G.boss)&&!(G.marbleArena.screenCd>0);return true;}
function sync(G,s,openWay){const e=G.boss;for(let i=0;i<3;i++){const n=s.items['mc.screen.'+i]||0;if(e.mcScreens[i]!==n){e.mcScreens[i]=n;G.marbleArena.screenCd=.4;}}
G.walls=G.walls.filter(w=>!w.marbleScreen);for(let i=0;i<3;i++){const q=stations[i],on=e.mcScreens[i]%2===1,side=i<2;G.walls.push({x:q.x,z:q.z,y0:0,w:side?(on?30:170):(on?170:30),d:side?(on?170:30):(on?30:170),h:215,courtWall:true,invisible:true,marbleScreen:true});}
if(s.flags['mc.defeated']){G.walls=G.walls.filter(w=>!w.marbleGate);G.storyNpcs=[{id:'sunspire_orb',name:'The Sunspire Orb',x:0,z:-1780,y:280}];if(s.flags['mc.answer'])openWay();}}
function deflector(e){if(e.mcKind!=='hammer')return -1;const len=Math.hypot(e.mcX-e.x,e.mcZ-e.z);return stations.findIndex((q,i)=>{const dx=q.x-e.x,dz=q.z-e.z,along=dx*e.mcDX+dz*e.mcDZ;return e.mcScreens[i]%2===1&&e.mcUsed[i]!==e.mcScreens[i]&&along>0&&along<len&&Math.abs(dx*e.mcDZ-dz*e.mcDX)<95;});}
function step(e,dt,p,cue){if(!alive(e))return;dt=Math.min(.05,Math.max(0,dt));e.mcClock=Math.max(0,e.mcClock-dt);e.mcExposed=Math.max(0,e.mcExposed-dt);e.atkT=Math.max(0,(e.atkT||0)-dt);e.slamW=e.mcState==='wind'?e.mcClock:0;if(e.mcClock)return;
if(e.mcState==='recover'){e.mcKind=['hammer','sweep','hammer','fall'][e.mcBeat++%4];e.mcState='wind';e.mcClock=e.mcKind==='hammer'?2.2:1.9;e.mcX=p.x;e.mcZ=p.z;e.mcY=p.y;const d=Math.hypot(p.x-e.x,p.z-e.z)||1;e.mcDX=(p.x-e.x)/d;e.mcDZ=(p.z-e.z)/d;e.yaw=Math.atan2(e.mcDX,e.mcDZ);e.slamW=e.mcClock;e.mcBlock=-1;cue?.('wind');return;}
if(e.mcState==='wind'){const k=deflector(e);e.slamW=0;e.atkT=.5;e.mcSeq++;if(k>=0){e.mcUsed[k]=e.mcScreens[k];e.mcBlock=k;e.mcExposed=12;e.mcState='recover';e.mcClock=12;cue?.('break');return;}e.mcState='strike';e.mcClock=.45;cue?.('strike');return;}
e.mcState='recover';e.mcClock=2;
}
function inAttack(e,p){if(!alive(e)||e.mcState!=='strike'||p.hp<=0||p.downed)return false;const dx=p.x-e.x,dz=p.z-e.z,r=p.r||16;if(e.mcKind==='hammer'){const along=dx*e.mcDX+dz*e.mcDZ;return along>0&&along<1100+r&&Math.abs(dx*e.mcDZ-dz*e.mcDX)<100+r&&Math.abs(p.y-e.mcY)<85;}if(e.mcKind==='sweep')return p.y<85&&Math.hypot(dx,dz)<720+r;return Math.abs(p.y-e.mcY)<90&&Math.hypot(p.x-e.mcX,p.z-e.mcZ)<155+r;}
function quest(G,s){const e=G.boss;return s.flags['mc.answer']?'The way to Castle Duskmoor is known. Take the exit.':s.flags['mc.defeated']?'Consult the orb in the northern chamber':e.mcExposed>0?'Armor seal broken — attack the Colossus':e.mcKind==='hammer'&&e.mcState==='wind'?'Lead the marked heavy strike through a screen facing the boss':'Face a screen toward the boss, then stand behind it for the heavy strike';}
function draw({G,state:s,bx,ring},t){const e=G.boss;if(!e)return;
for(let i=0;i<3;i++){const q=stations[i],on=e.mcScreens[i]%2===1,spent=e.mcUsed[i]===e.mcScreens[i],c=on&&!spent?'#f0d58c':'#8b8678';bx(q.x,45,q.z,110,90,100,'#c9c2aa');const side=i<2;bx(q.x,132,q.z,side?(on?30:170):(on?170:30),165,side?(on?170:30):(on?30:170),c);ring(q.x,3,q.z,100,c);const o=G.storyObjects[i];bx(o.x,35,o.z,32,70,30,'#b4a071');bx(o.x,73,o.z,65,9,10,c);}
if(e.mcExposed>0){ring(e.x,20,e.z,165,'#f7e4a2');for(const sign of [-1,1])bx(e.x+sign*95,100,e.z,24,130,28,'#fff0bb','#ffde7a',.8);}
if(alive(e)&&['wind','strike'].includes(e.mcState)){const c=e.mcState==='wind'?'#eab95e':'#fff0c6';if(e.mcKind==='hammer'){for(let j=1;j<=22;j++)for(const side of [-1,1])bx(e.x+e.mcDX*j*50+e.mcDZ*side*100,e.mcY+5,e.z+e.mcDZ*j*50-e.mcDX*side*100,12,4,12,c,c,.85);if(e.mcState==='strike')for(let j=1;j<12;j++)bx(e.x+e.mcDX*j*85,e.mcY+50,e.z+e.mcDZ*j*85,60,100,60,'#d9c492');}else if(e.mcKind==='sweep')ring(e.x,4,e.z,720,c,.9);else{ring(e.mcX,e.mcY+5,e.mcZ,155,c,.9);if(e.mcState==='strike')for(let j=0;j<7;j++)bx(e.mcX+Math.sin(j)*90,e.mcY+80,e.mcZ+Math.cos(j)*90,32,150,38,'#d0c7b0');}}
const line=s.conversation?.node||'',vision=line==='mc.orb.souls',route=line==='mc.orb.route';
// Layered faceted orb, visibly separate from black Hollow Gates and purple training rifts.


if(route){bx(0,344,-1870,260,16,95,'#72818d');for(const side of [-1,1]){bx(side*45,385,-1870,75,78,40,'#718492');for(const dx of [-20,0,20])bx(side*45+dx,430,-1870,12,16,43,'#bac7cb');}for(let i=0;i<16;i++){const x=Math.sin(i*.4)*90,z=-1780+i*15;bx(x,335,z,9,5,9,'#ead99c');}for(const x of [-90,0,90]){const top=x===0?505:475;bx(x,(352+top)/2,-1870,45,top-352,45,'#637786');for(let j=0;j<3;j++)bx(x,top+7+j*13,-1870,60-j*16,14,60-j*16,'#8399a8');bx(x,top-35,-1846,9,20,4,'#d4c285');}}
}
const api={stations,paths,fields,build,available,sync,step,deflector,inAttack,quest,draw,snapshot:e=>Object.fromEntries(fields.map(k=>[k,e[k]??0]))};root.BFMarbleGuardian=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
