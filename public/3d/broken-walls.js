/* Ruined Keep part one: protect the escaping prisoners through the breach. */
(function(root){'use strict';
const paths={arrival:[[0,450,0],[0,-250,0],[0,-900,0],[0,-1450,0]],arrow:[[0,-250,0],[850,-250,0],[850,-800,150],[700,-1050,150]],west:[[0,-1450,0],[-650,-1800,0],[-650,-2450,0],[0,-3000,0]],east:[[0,-1450,0],[650,-1800,0],[650,-2450,0],[0,-3000,0]],exit:[[0,-3000,0],[0,-3650,0],[0,-4500,0]],wall:[[650,-2450,0],[1030,-3200,180],[650,-3650,200],[180,-4020,0]],workshop:[[650,-1800,0],[1450,-1800,0],[1450,-2650,0],[1450,-3000,0]],bell:[[-650,-1800,0],[-1300,-1900,0],[-1850,-1850,110],[-1850,-1400,220],[-1550,-1400,320],[-1700,-1600,320]],oldwall:[[-1850,-1850,110],[-2180,-2300,170],[-2100,-2920,170],[-1750,-3240,80],[-1480,-3500,80]],chamber:[[0,-3000,0],[-650,-3080,0],[-1050,-3400,80],[-1480,-3500,80]]};
const ESCORT_HP=90;
const towers=[[-540,420,0],[540,420,0],[-930,-2640,0],[930,-2640,0],[-1860,-3750,80],[420,-4360,0]];
const latchReady=clock=>{let t=clock%5;if(t<0)t+=5;return t>.15&&t<2.25;};
// One definition for the warning and the actual spawn, including its side and height.
function waveEntry(wave){const time=[0,1.5,11,21][wave]||0,side=wave%2?-1:1,z=Math.max(-2900,Math.min(-1850,-1650-time/30*1250-250));return {side,z,x:side*430};}
function warning(k){if(!k||k.retryT>0||k.away>.1)return null;const wave=(k.waves||0)+1,at=[0,1.5,11,21][wave];return at!=null&&k.elapsed>=at-1.5&&k.elapsed<at?{wave,...waveEntry(wave)}:null;}
function destination(G){
 const f=G.storyState?.flags||{},k=G.keep?.remote||status(G),p=G.p,ob=key=>G.storyObjects.find(o=>o.key===key),near=a=>a.filter(Boolean).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
 const guards=group=>near(G.enemies.filter(e=>e.keepGuard===group&&!e.dead&&e.hp>0));
 if(!f['rk.help'])return G.storyNpcs.find(n=>n.id==='grant');
 if(!f['rk.arrow']){if(p.y<100&&p.z>-1200)return {x:850,z:-350,y:28,navLabel:'Stairs to the arrow post'};const e=guards('arrow');return e?{x:e.x,z:e.z,y:e.y,navLabel:'Clear the arrow-post guards'}:ob('rk.arrow');}
 if(!f['rk.gate'])return ob('rk.gate');
 if(!f['rk.breach.start'])return ob('rk.breach');
 if(!f['rk.breach.done']){if(k.retryT>0||k.away>0)return {x:0,z:-1900,y:0,navLabel:'Return to protect the prisoners'};if(k.elapsed>=30){const e=guards('breach');if(e)return {x:e.x,z:e.z,y:e.y,navLabel:'Clear the remaining attackers'};}const z=-1650-Math.min(1,(k.elapsed||0)/30)*1250;return Math.hypot(p.x,p.z-z)>360?{x:0,z,y:0,navLabel:'Protect the escaping group'}:null;}
 if(!f['rk.cells']){
  const wheel=ob('rk.wheel');if(p.y>120&&p.x>350)return wheel;
  const key=ob('rk.key'),approach={x:760,z:-2700,y:60,navLabel:'Battlement stairs · gate wheel'};
  if(near([key,approach])===approach)return approach;
  const e=guards('post');return e?{x:e.x,z:e.z,y:e.y,navLabel:'Guard post · jail key'}:key;
 }
 return G.portal||G.goalPos;
}
const live=(G,group)=>(G.enemies||[]).filter(e=>e.keepGuard===group&&!e.dead&&e.hp>0).length;
function status(G){const k=G.keep||{};return {clock:k.clock,elapsed:k.elapsed,away:k.away,waves:k.waves,escortHp:[...(k.escortHp||[ESCORT_HP,ESCORT_HP,ESCORT_HP])],retryT:k.retryT||0,escortHitT:k.escortHitT||0,arrow:live(G,'arrow'),post:live(G,'post'),breach:live(G,'breach'),trial:live(G,'trial'),trialSpawned:k.trialSpawned,trialWarn:k.trialWarn||0};}
function available(key,G,remote){const s=remote||status(G);if(key==='rk.arrow')return !s.arrow;if(key==='rk.key')return !s.post;if(key==='rk.timing')return latchReady(s.clock);return true;}
function ready(s){return s.flags['rk.breach.done']&&s.flags['rk.cells'];}
function quest(s,k){const f=s.flags;return !f['rk.help']?'Speak to Grant in the outer court':!f['rk.arrow']?'Clear the upper arrow post'+(k?.arrow>0?' · '+k.arrow+' guards remain':' and cut its bow cord'):!f['rk.gate']?'Open Grant’s side gate below the arrow post':!f['rk.breach.start']?'Ring the breach bell when you are ready':!f['rk.breach.done']?(k?.retryT>0?'The group retreated. Return to the bell to try again':k?.away>.1?'Stay in the breach court to protect the group':(k?.elapsed||0)>=30?'Clear the remaining attackers · '+(k?.breach||0)+' left':'Protect all three prisoners · '+Math.floor(k?.elapsed||0)+' / 30 seconds'):!f['rk.cells']?'Open the dungeon gate: guard-post key or east battlement wheel':'Go through the dungeon gate and down to the cells';}

function target(G,e,fallback){
 if(!e.keepEscort||!G.storyState?.flags?.['rk.breach.start']||G.storyState.flags['rk.breach.done']||(G.keep?.remote||G.keep)?.retryT>0)return fallback;
 let chosen=null,dist=900;
 for(const n of G.keepPrisoners||[]){if((n.hp||0)<=0)continue;const d=Math.hypot(n.x-e.x,n.z-e.z);if(d<dist){dist=d;chosen=n;}}
 return chosen||fallback;
}
function hitEscort(G,e){
 const n=target(G,e,null),k=G.keep;
 if(!n||!k||e._escortHitSerial===e.meleeSerial||Math.abs((e.y||0)-n.y)>85||Math.hypot(e.x-n.x,e.z-n.z)>e.r+(n.r||18)+40)return false;
 e._escortHitSerial=e.meleeSerial;k.escortHp[n.escortIndex]=Math.max(0,k.escortHp[n.escortIndex]-Math.max(14,Math.round((e.dmg||10)*1.1)));n.hp=k.escortHp[n.escortIndex];k.escortHitT=.35;
 return true;
}
function build(a){const {G,seg,plat,solid,spawn}=a;for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];Object.assign(G,{haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
G.keep={clock:0,elapsed:0,away:0,waves:0,escortHp:[ESCORT_HP,ESCORT_HP,ESCORT_HP],retryT:0,escortHitT:0,trialSpawned:false,walks:{},paths};G.keepPrisoners=[0,1,2].map(i=>({id:'keep_escape'+i,name:'Freed prisoner',escortIndex:i,x:-340-i*48,z:-1650,y:0,r:18,h:105,hp:ESCORT_HP,maxHp:ESCORT_HP}));
G.areaName='Ruined Keep · Broken Walls';G.campaignLayout={revision:2195,zone:'keep',area:0};
for(const [name,x,z,w,d,y]of [['Outer Wall',0,150,900,900,0],['Grant’s Corner',-260,-450,700,450,0],['Arrow Post',700,-1000,530,470,150],['Breach Court',0,-2150,1650,1400,0],['Seized Workshop',1430,-2930,620,660,0],['Old Bell Tower',-1680,-1600,850,900,0],['Bell Lookout',-1700,-1600,260,270,320],['Prison Gate',0,-3710,1100,850,0],['Upper Wheel',650,-3650,480,480,200],['Sealed Chamber',-1480,-3630,860,780,80],['Cell Stairs',0,-4510,780,650,0]]){G.rooms.push({name,x,z,w,d,y,encounter:false,cleared:true,monsters:[]});if(y)plat(x,z,y,w,d,{checkpoint:true});else seg(x,z,w,d);}
for(const [name,p]of Object.entries(paths)){const out=[];for(let j=1;j<p.length;j++){const u=p[j-1],v=p[j],jump=name==='bell'&&j>=2,n=Math.ceil(Math.max(Math.hypot(v[0]-u[0],v[1]-u[1])/(jump?140:95),Math.abs(v[2]-u[2])/(jump?42:16)));for(let i=0;i<=n;i++){const q=u.map((x,k)=>x+(v[k]-x)*i/n),width=name==='bell'?(jump?90:155):name==='oldwall'?210:330;if(q[2])plat(q[0],q[1],q[2],width,width,{checkpoint:true});else seg(q[0],q[1],width,width);out.push(q);}}G.keep.walks[name]=out;}
// Fortress walls frame broad gaps. The eastern arrow-post wall supports the 150-high post from
// below; rising through its floor would let actors walk there while falsely blocking their shots.
for(const [x,z,w,d,h]of [[-530,-900,430,80,240],[530,-900,430,80,138],[-370,-2240,300,85,170],[370,-2240,300,85,170],[-870,-2290,70,550,230],[870,-2290,70,550,210],[-560,-3830,80,430,230],[560,-4010,80,350,220],[-1950,-3650,70,850,250]])solid(x,z,0,w,h,d,'#4c524b');
const block=(id,x,z,y,w,d,h)=>G.obstacles.push({kind:'col',x,z,y0:y,h:y+h,w,d,invisible:true,keepBlock:id});block('gate',0,-930,0,440,24,180);block('cells',0,-4100,0,450,24,220);block('workshop',1450,-2770,0,300,20,150);block('chamber',-1050,-3400,80,28,310,160);
for(const [x,z,y]of [[-510,80,0],[530,90,0],[540,-1145,150],[-1740,-1470,320],[860,-3820,200],[-1760,-3780,80]]){G.deco.push({x,z,y0:y,w:60,h:140,d:60,c:'#65665c',theme:'ruins'});}
for(const [x,z]of [[-570,-1850],[570,-2450],[-160,-3550],[1260,-3150]])solid(x,z,0,90,55,60,'#49392e');
G.storyNpcs=[{id:'grant',name:'Grant',x:-260,z:-440,y:0},{id:'felix',name:'Felix',x:700,z:-1750,y:0}];
const o=(key,label,x,z,y=0,kind='lever')=>({key,label,x,z,y,kind});G.storyObjects=[o('rk.arrow','Cut the arrow-post bow cord',730,-1030,150,'bow'),o('rk.gate','Open Grant’s side gate',0,-830,0,'gate'),o('rk.breach','Ring the breach bell',-210,-1850,0,'bell'),o('rk.key','Take the jail key',-320,-3650,0,'key'),o('rk.wheel','Turn the dungeon gate wheel',650,-3650,200,'wheel'),o('rk.timing','Release the latch while the notch is green',1450,-2680,0,'timing'),o('rk.tools','Take Felix’s tools',1500,-3020,0,'tools'),o('rk.wall','Unbar the chamber from the old wall',-1730,-3310,80,'bar'),o('rk.trial','Lift the sealed chamber’s shield',-1440,-3520,80,'shield')];
for(const [x,z]of [[-300,-1450],[320,-3340],[1350,-2360]])G.healpads.push({x,z,y:0,r:32,charge:1,_acc:0});
for(const [type,x,z,y,group]of [['caster',660,-980,150,'arrow'],['grunt',850,-950,150,'arrow'],['grunt',-340,-3580,0,'post'],['caster',-520,-3770,0,'post'],['grunt',1250,-2190,0,'workshop'],['grunt',-1350,-1850,0,'tower'],['bones',-2120,-2630,170,'wall']]){const e=spawn(type,x,z,false);e.y=y;e.keepGuard=group;}
// Match the existing decorative towers; their narrow footprints stay off the authored paths.
for(const [x,z,y]of towers)G.obstacles.push({kind:'col',x,z,y0:y,w:112,d:112,h:y+268,invisible:true,keepTower:true});
G.bounds={minX:-2440,maxX:1850,minZ:-4900,maxZ:680};G.progressEnd=-4800;G.startPos={x:0,z:450};G.lastSafe={x:0,z:450,y:0};G.portalPos={x:0,z:-4630,y:0};G.goalPos={...G.portalPos};Object.assign(G.p,{x:0,z:450,y:0,vy:0});
}
function sync(a){const {G,state:s,openWay}=a,f=s.flags,k=G.keep;if(!k)return;const opened={gate:f['rk.gate'],cells:f['rk.cells'],workshop:f['rk.workshop'],chamber:f['rk.chamber']};G.obstacles=G.obstacles.filter(o=>!o.keepBlock||!opened[o.keepBlock]);if(f['rk.gate'])Object.assign(G.storyNpcs.find(n=>n.id==='grant'),{x:-180,z:f['rk.breach.done']?-3100:-1760,y:0});
 const counts=k.remote||status(G),feedback=(key,text)=>{const o=G.storyObjects.find(o=>o.key===key);if(o)o.blockedText=text;};
 feedback('rk.arrow','Defeat the guards on the upper arrow post, then cut the bow cord.');
 feedback('rk.gate','Clear the upper arrow post and cut its bow cord before raising this side gate.');
 feedback('rk.breach',!f['rk.help']?'Speak to Grant in the outer court first.':"Open Grant's side gate before ringing the breach bell.");
 feedback('rk.key',counts.post?'Defeat the guards at the lower guard post before taking the jail key.':"Protect Grant's three prisoners at the breach first. Then use this key or the east battlement wheel.");
 feedback('rk.wheel',"Protect Grant's three prisoners at the breach first. Then turn this wheel to open the dungeon gate.");
 feedback('rk.tools',"Open the east workshop: use its latch when the notch turns green. The tools are inside.");
 feedback('rk.trial',"Open the west chamber by returning Felix's tools or unbarring it from the old wall.");
 const rescue=s.notes?.['rk.rescue'];if(rescue)rescue.text=f['rk.cells']?'The dungeon gate is open. Go down the stairs beyond the lower guard post to search the cells.':f['rk.breach.done']?"Grant's group reached cover. Open the dungeon gate with the guard-post jail key or the east battlement wheel.":f['rk.breach.start']?'Protect all three prisoners for thirty seconds, then clear the attackers. Stay in the breach court; the group can retry if it retreats.':f['rk.gate']?'Ring the breach bell when ready, then protect the three prisoners as they cross the court.':f['rk.arrow']?"The bow cord is cut. Open Grant's side gate below the arrow post.":'Clear the raised arrow post and cut its bow cord. Open the side gate, then meet Grant at the breach. The stairs begin east of the entrance.';
 const tools=s.notes?.['rk.tools'];if(tools)tools.text=f['rk.felix.returned']?"Felix has his tools. The west chamber is open, and he gave you the Lockpick dagger.":f['rk.tools']?'Return the tools to Felix beside the east workshop approach.':f['rk.workshop']?'Take the tools inside the east workshop, then return them to Felix.':"Recover Felix's tools from the east workshop. Use its latch when the notch turns green.";
 if(ready(s)){G.qs['rk.keep']=1;openWay();}}
function tick(a,dt){const {G,state:s,host,spawn,complete,toast,players}=a,k=G.keep;if(!k)return;k.clock+=dt;if(!host){if(k.remote){k.remote.clock=k.clock;k.remote.trialWarn=Math.max(0,(k.remote.trialWarn||0)-dt);}return;}const f=s.flags;
k.escortHp ||= [ESCORT_HP,ESCORT_HP,ESCORT_HP];k.escortHitT=Math.max(0,(k.escortHitT||0)-dt);
if(f['rk.breach.start']&&!f['rk.breach.done']){
 if(k.retryT<=0&&k.escortHp.some(h=>h<=0)){
  k.retryT=3;k.elapsed=0;k.away=0;k.waves=0;
  for(const e of G.enemies)if(e.keepGuard==='breach')e.dead=true;
  toast('A prisoner was hurt. The group has retreated to cover. Try the breach again.');
 }
 if(k.retryT>0){k.retryT=Math.max(0,k.retryT-dt);if(k.retryT===0)k.escortHp.fill(ESCORT_HP);}
 else {
  const inside=players.some(p=>p.hp>0&&!p.downed&&Math.hypot(p.x,p.z+2150)<800);k.away=inside?0:k.away+dt;
  if(k.away>4&&(k.elapsed>0||k.waves>0)){k.away=0;k.elapsed=0;k.waves=0;k.escortHp.fill(ESCORT_HP);k.retryT=2;for(const e of G.enemies)if(e.keepGuard==='breach')e.dead=true;toast('The group pulled back to cover. Return to the breach to try again.');}
  else if(inside){
   k.elapsed=Math.min(30,k.elapsed+dt);const wave=k.elapsed>=21?3:k.elapsed>=11?2:k.elapsed>=1.5?1:0;
   if(wave>k.waves){k.waves=wave;const {side,z:entryZ}=waveEntry(wave);
    for(let i=0;i<(wave===1?3:2);i++){const e=spawn(i===1?'caster':'grunt',side*(360+i*70),entryZ-i*32,false);e.keepGuard='breach';e.keepEscort=i!==1;e.active=true;e.dropT=0;}
    toast('Attackers at the '+(side<0?'west':'east')+' gap! Protect the group.');
   }
   if(k.elapsed>=30&&!live(G,'breach'))complete('rk.breach.complete');
  }
 }
}
if(f['rk.trial.start']&&!f['rk.trial.done']&&!k.trialSpawned){k.trialSpawned=true;k.trialWarn=1.5;toast('The chamber guards are waking. Make room to dodge.');}if(k.trialWarn>0){k.trialWarn-=dt;if(k.trialWarn<=0)for(const [i,type]of ['siegeknight','caster','grunt','caster'].entries()){const e=spawn(type,-1720+i*160,-3770,false);e.y=80;e.keepGuard='trial';e.active=true;e.dropT=0;}}else if(k.trialSpawned&&!f['rk.trial.done']&&!live(G,'trial'))complete('rk.trial.complete');
}
function actors(G,s,remote){const k=remote||G.keep,f=s.flags,t=f['rk.breach.done']?1:k.retryT>0?0:Math.min(1,(k.elapsed||0)/30);for(const [i,n]of G.keepPrisoners.entries()){n.x=-60+i*60;n.z=-1650-t*1250;n.walking=t>0&&t<1;n._yaw=Math.PI;n.hp=(k.escortHp||[])[i]??ESCORT_HP;n.maxHp=ESCORT_HP;}}
function shards(s){return [{id:'RK-01',x:-1710,z:-1640,y:320},...(s.flags['rk.trial.done']?[{id:'RK-02',x:-1470,z:-3890,y:80}]:[])];}
function draw(a,t){const {G,state:s,bx,remote}=a;if(!G.keep)return;const f=s.flags,k=remote||G.keep;for(const [id,x,z,y,w,h]of [['gate',0,-930,0,440,180],['cells',0,-4100,0,450,220],['workshop',1450,-2770,0,300,150]]){for(const dx of [-w/2,w/2])bx(x+dx,y+h/2,z,18,h,20,'#565b50');bx(x,y+h,z,w+20,14,25,'#b5a17c');if(!f['rk.'+(id==='gate'?'gate':id)]&&!root.BFCampaignCraft?.has('keep-portcullis-'+id))for(let i=0;i<10;i++)bx(x-w/2+20+i*(w-40)/9,y+h/2,z,8,h,8,'#50574e');}
if(!f['rk.chamber']){for(let i=0;i<9;i++)bx(-1050,160,-3540+i*35,8,160,8,'#50574e');bx(-1050,244,-3400,24,16,330,'#b5a17c');}
for(const o of G.storyObjects){if(root.__KEEP_JOURNEY_ART?.objects?.has(o.key))continue;if(root.BFCampaignObjects?.drawn(o))continue;if(o.returnObject)continue;const y=o.y;if(o.kind==='timing'){bx(o.x,y+30,o.z,70,60,65,'#665943');const phase=(k.clock||0)%5,green=latchReady(k.clock||0);bx(o.x+Math.sin(phase*Math.PI*.4)*25,y+66,o.z,12,10,12,green?'#93ccad':'#bd9270');}
else if(o.kind==='tools'){if(!f['rk.tools']){bx(o.x,y+18,o.z,65,36,35,'#87704f');for(let j=0;j<4;j++)bx(o.x-22+j*14,y+43,o.z,5,23,5,'#d4ceab');}}
else if(o.kind==='bell'){for(const dx of [-45,45])bx(o.x+dx,y+70,o.z,12,140,12,'#755e42');bx(o.x,y+140,o.z,110,12,16,'#ae9267');bx(o.x,y+108,o.z,40,40,30,'#b5a374');bx(o.x,y+82,o.z,65,12,42,'#9a8050');}
else if(o.kind==='shield'){bx(o.x,y+24,o.z,45,48,38,'#636554');if(!f['rk.trial.start']){bx(o.x,y+65,o.z,48,60,9,'#967c4b');bx(o.x,y+62,o.z+6,34,48,5,'#4a354c');bx(o.x,y+61,o.z+10,7,38,4,'#c7af78');}}else if(o.kind==='wheel'){bx(o.x,y+45,o.z,16,90,16,'#635440');for(const [dx,dy]of [[0,30],[0,-30],[30,0],[-30,0]])bx(o.x+dx,y+75+dy,o.z,dx?10:48,dy?10:48,8,'#b29e79');}else if(o.kind==='bow'){bx(o.x,y+32,o.z,110,12,16,'#75613e');bx(o.x,y+25,o.z,18,50,65,'#5b5041');if(!f['rk.arrow'])bx(o.x,y+39,o.z+15,105,2,2,'#cfbf92');}else{bx(o.x,y+20,o.z,60,40,45,'#696a58');bx(o.x,y+44,o.z,35,8,12,'#b8ad87');}}
if(f['rk.breach.start']&&!f['rk.breach.done']&&!root.__KEEP_JOURNEY_ART){const alert=warning(k);if(alert)bx(alert.x,4,alert.z,160,5,90,'#d4ab68');}
if(k.trialWarn>0)for(let i=0;i<4;i++)bx(-1720+i*160,84,-3770,75,5,75,'#bc9074');
for(const n of G.storyNpcs){const active=n.id==='grant'?!f['rk.help']||f['rk.gate']&&!f['rk.breach.start']:!f['rk.felix.returned'];if(active){bx(n.x,n.y+86,n.z,5,15,5,'#ddc185');bx(n.x,n.y+74,n.z,5,4,5,'#ddc185');}}
}
root.BFBrokenWalls={build,sync,tick,status,available,actors,ready,quest,shards,draw,target,hitEscort,paths,destination,latchReady,warning,waveEntry,towers};if(typeof module!=='undefined')module.exports=root.BFBrokenWalls;
})(typeof window!=='undefined'?window:globalThis);
