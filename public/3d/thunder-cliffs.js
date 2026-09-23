/* Thunder Cliffs: shared mechanisms, personal discoveries and a returning cargo lift. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['tc.'+k];
const paths={catchReturn:[[1200,-3200,590],[1230,-3070,640],[1470,-3150,720]],ascent:[[0,550,40],[0,-500,40],[620,-650,120],[1050,-1200,220],[650,-1820,340],[-300,-1780,340],[-300,-650,340]],upper:[[-300,-1780,340],[-950,-2350,430],[-500,-3000,540],[450,-3390,650],[900,-4100,740],[300,-4700,850]],arch:[[-300,-1780,340],[-1120,-1640,340],[-1630,-2150,390],[-2100,-2780,450]],cave:[[-2100,-2780,450],[-2360,-3300,390],[-2100,-3880,340]],wind:[[450,-3390,650],[1470,-3150,720],[2030,-3580,800],[1830,-4220,890],[1260,-4530,950]],return:[[1260,-4530,950],[2470,-4510,950],[2640,-3380,720],[2340,-2860,720],[1470,-3150,720]],tide:[[-500,-3000,540],[-900,-3370,470],[-1100,-3970,360],[-590,-4350,300],[0,-4090,360],[0,-3850,360],[-250,-3500,480],[-500,-3300,540],[-500,-3000,540]],grotto:[[-590,-4350,300],[-1050,-4660,300],[-1510,-4750,300]]};
function ready(s){return f(s,'approach');}
function quest(s){return !f(s,'brake')?'Fit the brake wheel at the broken cargo lift':!f(s,'lift')?'Climb the eastern steps and release the lift catch':!f(s,'shackle')?'Inspect the discarded neck shackle on the middle ledge':!f(s,'approach')?'Climb to the upper barrier and open the path':'Enter the hydra ledges when you are ready';}
function build({G,plat,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
 Object.assign(G,{boss:null,haz:null,canyonWind:null,npc:null,secret:null,secretTrigger:null,waystone:null,beam:null,collapse:[],optionalMissions:[],portal:null,bonusPortal:null,bonusActive:false,vertical:true,thorns:[],vents:[],phasers:[],debris:[],lights:[]});
 G.thunder={clock:0,walks:{},raceAt:0,raceAttempt:0};
 const floor=(x,z,y,w,d,extra={})=>plat(x,z,y,w,d,{slab:28,checkpoint:true,...extra});
 for(const [id,ps]of Object.entries(paths)){const walk=[];for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/85,Math.abs(b[2]-a[2])/10));for(let i=0;i<=n;i++){const p=a.map((v,k)=>v+(b[k]-v)*i/n);floor(...p,id==='wind'?170:270,id==='wind'?170:270);walk.push(p);}}G.thunder.walks[id]=walk;}
 // Wide rests, distinct junctions, low catches beneath the risky side climb.
 for(const [name,x,z,y,w,d]of [['Landing',0,200,40,750,1000],['Middle ledge',-300,-1680,340,750,650],['Dash’s arch',-2070,-2750,450,620,540],['Wreck cave',-2140,-3830,340,650,570],['Tide circle',-590,-4350,300,650,440],['Inland grotto',-1560,-4780,300,520,480],['High wind rest',1260,-4530,950,500,450],['Upper approach',300,-4700,850,720,560]]){floor(x,z,y,w,d);G.rooms.push({name,x,z,y,w,d,encounter:false,cleared:true,monsters:[]});}
 floor(1660,-3710,590,1150,1500,{thunderCatch:true});
 G.thunder.jumps=[[1640,-3090,720],[1850,-3200,760],[2040,-3350,800]];for(const p of G.thunder.jumps)floor(...p,135,130);
 for(const [x,z,y,w,d,h,tag]of [[-2440,-3860,340,100,740,360,'cave'],[-1780,-3950,340,90,540,320,'cave'],[-2130,-4140,340,770,100,330,'cave'],[-1660,-5000,300,650,90,380,'grotto'],[-1860,-4740,300,90,610,350,'grotto'],[-2130,-3560,340,540,65,240,'caveGate'],[-1280,-4730,300,70,440,220,'tideGate'],[300,-4900,850,650,60,180,'approach']])G.walls.push({x,z,y0:y,w,d,h,c:'#435764',thunderTag:tag});
 for(let i=0;i<21;i++)G.deco.push({kind:'thunderSpire',x:(i%2?1:-1)*(2500+(i%4)*140),z:450-i*270,y0:-110,w:230+i%3*120,d:290,h:600+i%5*140,c:'#3c5561'});
 for(const [x,z,y,w,h]of [[-1380,-1970,300,460,440],[700,-2820,430,240,400],[250,-650,40,180,500]])G.deco.push({kind:'thunderArch',x,z,y0:y,w,d:100,h,c:'#6c8182'});
 G.storyNpcs=[{id:'abe',name:'Abe',x:190,z:180,y:40},{id:'dash',name:'Dash',x:-1980,z:-2710,y:450}];
 const o=(k,label,x,z,y,kind='lever')=>({key:'tc.'+k,label,x,z,y,kind});
 G.storyObjects=[o('brake','Fit the spare brake wheel',-230,-640,40),o('lift','Release the upper lift catch',-240,-760,340),o('shackle','Inspect the worn shackle',-420,-1660,340,'shackle'),o('approach','Open the upper barrier',300,-4750,850),o('brace','Brace the lower cave catch',-2200,-3020,420),o('cave.help','Turn the upper cave wheel',-2300,-3400,390),o('race.finish','Ring Dash’s route bell',-2240,-3320,390,'bell'),o('sail','Take the sailcloth cape',-2180,-3980,340,'cape'),o('tide.note','Read the tide carving',-440,-4240,300,'book'),o('wind.note','Read the wind shelter sign',1360,-3090,720,'book')];
 for(const [i,x,z,y]of [[1,-1430,-1890,360],[2,-1000,-2520,460],[3,-1850,-2830,450]])G.storyObjects.push(o('race.'+i,'Touch route flag '+i,x,z,y,'flag'+i));
 for(let i=1;i<=3;i++)G.storyObjects.push(o('tide.'+i,'Press the '+i+'-wave stone',-850+i*140,-4410,300,'wave'+i));
 // Connect race flags by an ordinary safe path; the arch route is an optional jump shortcut.
 const ps=[[-2070,-2750,450],[-1430,-1890,360],[-1000,-2520,460],[-1850,-2830,450],[-2240,-3320,390]];G.thunder.race=ps;for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/85,Math.abs(b[2]-a[2])/10));for(let i=0;i<=n;i++)floor(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,a[2]+(b[2]-a[2])*i/n,180,180);}
 for(const [x,z,y]of [[230,350,40],[-130,-1560,340],[410,-4530,850]])G.healpads.push({x,z,y,r:31,charge:1,_acc:0});
 for(const [type,x,z,y]of [['grunt',870,-1080,205],['caster',580,-1670,330],['grunt',-980,-2290,425],['grunt',-450,-2950,540],['caster',460,-3360,650],['grunt',-2310,-3370,390],['slime',-710,-4260,300],['slime',-50,-4090,350],['grunt',870,-4000,730],['caster',410,-4590,850]]){const e=spawn(type,x,z,false);Object.assign(e,{y,sx:x,sz:z});}
 G.bounds={minX:-2800,maxX:3000,minZ:-5350,maxZ:950};G.progressEnd=-5000;G.startPos={x:0,z:550,y:40};G.lastSafe={...G.startPos};G.portalPos={x:300,z:-4870,y:850};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function available(k,G){if(k==='tc.race.finish')return G.thunder.raceAt>0&&G.thunder.clock-G.thunder.raceAt<=120;return true;}
function sync({G,state:s,openWay,toast}){const t=G.thunder;
 for(const [flag,tag]of [['cave.open','caveGate'],['tide.open','tideGate'],['approach','approach']])if(f(s,flag)&&!t[flag]){t[flag]=true;G.walls=G.walls.filter(w=>w.thunderTag!==tag);toast?.(flag==='approach'?'The upper path is open.':flag==='tide.open'?'The inland rock door slides open.':'The wreck cave is open.');}
 t.lift=f(s,'lift');const attempt=s.items['tc.race.attempt']||0;if(attempt!==t.raceAttempt){t.raceAttempt=attempt;t.raceAt=t.clock||.001;}
 if(f(s,'cave.open'))s.cursors.dash={npc:'dash',node:'tc.dash.done',lastChoice:''};if(ready(s)){G.qs['tc.ascent']=1;openWay();}
}
function wind(clock){const t=clock%10;return t<5?'calm':t<7?'warning':'gust';}
function tick(G,dt){const t=G.thunder;t.clock+=dt;const p=G.p;if(p.x>1520&&p.x<2300&&p.z<-3100&&p.z>-4330&&p.y>690&&wind(t.clock)==='gust')p.x+=38*dt;
 if(t.ride){const r=t.ride;r.t=Math.min(1,r.t+dt/2.2);const u=r.t*r.t*(3-2*r.t);Object.assign(p,{x:-300,z:-650,y:r.from+(r.to-r.from)*u,vy:0,vx:0,vz:0,onGround:true});if(r.t===1){p.z=-590;t.ride=null;G.lastSafe={x:p.x,y:p.y,z:p.z};}}
}
function ride(G,up){if(!G.thunder.lift)return;G.thunder.ride={from:up?40:340,to:up?340:40,t:0};}
function shards(s){return [...(f(s,'cave.open')?[{id:'SC-03',x:-2260,z:-3870,y:340}]:[]),{id:'SC-04',x:1220,z:-4620,y:950},...(f(s,'tide.open')?[{id:'SC-05',x:-1640,z:-4790,y:300}]:[])];}
function draw({G,state:s,bx,ring},t){for(const o of G.storyObjects){if(s.flags['event.'+o.key]&&!['shackle','book'].includes(o.kind))continue;const y=o.y;bx(o.x,y+22,o.z,48,44,42,'#526b71');if(o.kind==='shackle'){for(const dx of [-24,24])bx(o.x+dx,y+55,o.z,8,45,55,'#a8b7b0');bx(o.x,y+35,o.z,55,8,55,'#bdc6b5');}else if(o.kind==='book'){bx(o.x,y+47,o.z,60,5,38,'#d0c59c');}else if(o.kind==='cape'){bx(o.x,y+48,o.z,55,8,65,'#dfd4b0');bx(o.x,y+54,o.z,10,4,65,'#2f6877');}else if(o.kind.startsWith('wave')){for(let i=0;i<+o.kind.slice(4);i++)bx(o.x,y+12+i*12,o.z+23,32,3,3,'#c3e7dd');}else if(o.kind.startsWith('flag')){bx(o.x,y+68,o.z,7,90,7,'#987a4c');for(let i=0;i<+o.kind.slice(4);i++)bx(o.x+20,y+98-i*13,o.z,28,7,5,'#e0c67b');}else{bx(o.x,y+56,o.z,70,8,10,'#c1aa73');}}
 const phase=wind(G.thunder.clock);for(let i=0;i<9;i++){const x=1600+i%3*190,z=-3290-Math.floor(i/3)*290;if(phase!=='calm')bx(x+Math.sin(t*2+i)*20,820,z,phase==='gust'?110:45,3,5,phase==='gust'?'#d1efef':'#e7c789');}
 for(const y of [40,340]){bx(-300,y+5,-650,160,10,170,'#8b7657');for(const x of [-390,-210])bx(x,205,-650,13,340,13,'#596671');}if(G.thunder.ride)bx(-300,G.p.y-5,-650,160,10,170,'#b39463');
}
const api={build,ready,quest,available,sync,tick,ride,shards,draw,paths,wind};root.BFThunderCliffs=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
