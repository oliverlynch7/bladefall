/* The Dungeons: readable rescue upstairs, optional service works below. */
(function(root){'use strict';
const paths={entry:[[0,300,300],[0,-200,300],[0,-650,180],[0,-1250,180],[0,-1850,180]],west:[[0,-900,180],[-700,-900,180],[-1000,-1200,180]],east:[[0,-900,180],[740,-900,180],[780,-1550,180],[420,-1950,180]],hidden:[[-1000,-1200,180],[-1300,-1200,180],[-1300,-1750,180],[-1000,-1900,180],[-600,-1750,180],[0,-1950,180]],ringWest:[[0,-1950,180],[-420,-2110,180],[-420,-3000,180],[0,-3160,180]],ringEast:[[0,-1950,180],[420,-2110,180],[420,-3000,180],[0,-3160,180]],exit:[[0,-2850,360],[0,-3500,360],[0,-4100,360],[0,-4650,360]],lower:[[420,-3000,180],[1050,-3180,160],[1050,-3550,80],[450,-3640,0],[0,-3200,0],[0,-2980,0],[0,-2600,0]],drain:[[780,-1550,180],[1350,-2200,180],[1550,-2800,90],[1500,-3350,40],[1950,-3350,40],[1950,-3700,40],[1650,-3700,40],[1650,-4050,40],[2250,-4050,40],[2250,-4400,40],[1950,-4400,40],[1950,-4780,40]],deadDrain:[[1950,-3350,40],[2420,-3350,40],[2420,-3650,40]],deadDrain2:[[1650,-4050,40],[1350,-4050,40],[1350,-4430,40]]};
for(const name of ['drain','deadDrain','deadDrain2'])for(const p of paths[name])if(p[2]===40)p[2]=80;
const drainJumpSegments=[6,8,10];
const WINCH={x:0,z:-2500,r:88};
const SIGNS=[{x:-205,z:-560,y:180,lines:['CELL BLOCK','West cells ←']},{x:-315,z:-2140,y:180,lines:['PRISONER LIFT','Board · turn the handle']},{x:-300,z:-3370,y:360,lines:['UPPER SHELTER','Release hall ahead']},{x:560,z:-3020,y:180,lines:['LOWER WORKS','Service stairs →']}];
const PRESS_Z=[-3120,-2990,-2860],PRESS_PERIOD=4.6,PRESS_OFFSET=[0,1.5,3];
function pressState(clock,i,open=false){
 if(open)return {bottom:134,warning:false,down:false};
 const phase=(clock+PRESS_OFFSET[i])%PRESS_PERIOD;
 const bottom=phase<2.45?134:phase<2.7?134-(phase-2.45)*128/.25:phase<3.45?6:phase<3.65?6+(phase-3.45)*128/.2:134;
 return {bottom,warning:phase>=2&&phase<2.45,down:bottom<54};
}
const flag=(s,k)=>!!s.flags[k],live=(G,g)=>(G.enemies||[]).filter(e=>e.prisonGuard===g&&!e.dead&&e.hp>0).length;
function ready(s){return ['kd.free','kd.papers','kd.transfer'].every(k=>flag(s,k));}
function quest(s,k){const owner=k?.winchOwner??k?.winch?.owner,progress=k?.winchProgress??k?.winch?.progress??0;return !flag(s,'kd.roster')?'Read the cell list at the entrance':!flag(s,'kd.hidden')?'Follow the service marks behind the empty west cells':!flag(s,'kd.free')?(k?.guards>0?'Clear the holding-room guards · '+k.guards+' remain':'Release the prisoners at the cell lock'):!flag(s,'kd.papers')?'Read the papers taken from the prisoners':!flag(s,'kd.lift.open')?(k?.rescueT<8?'Meet the prisoners at the central lift':owner?'Walk around the winch drum · '+Math.round(progress*100)+'% raised':'Board the lift and grip its winch handle'):!flag(s,'kd.transfer')?'Follow the group onto the upper shelter':'Follow the upper hall to The Fallen';}
function status(G){const k=G.prison||{},w=k.winch||{};return {rescueT:k.rescueT||0,guards:live(G,'cells'),winchProgress:w.progress||0,winchOwner:w.owner||null,winchDirection:w.direction||0,winchAngle:w.angle||0,pressClock:k.pressClock||0};}
function destination(G){
 const f=G.storyState?.flags||{},p=G.p,k=G.prison?.remote||status(G),ob=key=>(G.storyObjects||[]).find(o=>o.key===key),at=(x,z,y,navLabel)=>({x,z,y,navLabel});
 // Return along the authored low routes, rather than pointing through their ceilings.
 const back=(name,label)=>{const a=G.prison?.walks?.[name]||[];if(!a.length)return null;let i=0,best=Infinity;for(let j=0;j<a.length;j++){const q=a[j],d=Math.hypot(q[0]-p.x,q[1]-p.z,(q[2]-p.y)*3);if(d<best){best=d;i=j;}}const q=a[Math.max(0,i-2)];return at(...q,label);};
 if(p.x>2150&&p.z>-3800)return back('deadDrain','Dry store walkway · back to the drain');
 if(p.x<1510&&p.x>1200&&p.z<-3900)return back('deadDrain2','Service ledge · back to the drain');
 if(p.x>1230&&p.z<-1750)return back('drain','Dry ledges · back to the cells');
 if(p.y<135||p.x>760&&p.z<-3000)return back('lower','Service stair · back to the lift');
 if(!f['kd.roster'])return ob('kd.roster');
 if(!f['kd.hidden']){if(p.x>-640&&p.z<-1300)return at(0,-1100,180,'Return through the cell block');if(p.x>-930)return at(-1000,-1200,180,'West cells · old service marks');return ob('kd.hidden');}
 if(!f['kd.free']||!f['kd.papers']){
  if(!f['kd.free']&&p.x>-640)return p.z<-1300?at(0,-1100,180,'Return through the cell block'):at(-1000,-1200,180,'West cells · service entrance');
  if(p.z>-1510)return at(-1300,-1630,180,'Through the service door');
  if(p.x>-640)return at(-760,-1850,180,'Holding-room doorway');
  if(!f['kd.free']){const e=(G.enemies||[]).filter(e=>e.prisonGuard==='cells'&&!e.dead&&e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];return e?at(e.x,e.z,e.y,'Clear the holding-room guards'):ob('kd.free');}
  return ob('kd.papers');
 }
 if(p.y>=315&&f['kd.lift.open']){if(p.z>-2910)return at(0,-2910,360,'Upper landing');if(!f['kd.transfer'])return at(0,-3410,360,'Follow the prisoners to shelter');return p.z>-4030?at(0,-3960,360,'Release hall'):G.portal||G.goalPos;}
 if(p.x<-640)return at(-760,-1850,180,'Leave through the holding-room doorway');
 if(p.z<-2830&&Math.abs(p.x)<250)return at(p.x<0?-420:420,-3000,180,'Gallery around the lift shaft');
 if(Math.abs(p.x)>250&&p.z<-2180)return at(p.x<0?-420:420,-2080,180,'Lower boarding dock');
 if(p.z>-2310||Math.abs(p.x)>160)return at(0,-2270,180,f['kd.lift.open']?'Wait at the lower dock for the returning lift':'Board the prisoner lift');
 return f['kd.lift.open']?at(0,-2270,180,'Wait for the lift at the lower dock'):ob('kd.lift.winch');
}
function available(key,G,remote){if(key==='kd.free')return !(remote||status(G)).guards;if(key==='kd.lift.winch')return flag(G.storyState,'kd.free')&&flag(G.storyState,'kd.papers')&&!flag(G.storyState,'kd.lift.open')&&(remote||status(G)).rescueT>=7.99;if(key==='kd.press.brake')return flag(G.storyState,'kd.lift.open')&&!flag(G.storyState,'kd.deep.open');return true;}
// After the rescue the freight lift cycles, so a late player or co-op partner can still ascend.
const liftHeight=t=>{
 if(t<=24)return 180+180*Math.max(0,Math.min(1,(t-8)/8));
 const phase=(t-24)%14;
 return phase<3?360:phase<7?360-180*(phase-3)/4:phase<10?180:180+180*(phase-10)/4;
};
function moveLift(G,m){if(!m||!G.prison)return;const y=liftHeight(G.prison.rescueT),p=G.p;if(p.onGround&&Math.abs(p.y-m.h)<4&&Math.abs(p.x-m.x)<m.w/2+p.r*.4&&Math.abs(p.z-m.z)<m.d/2+p.r*.4)p.y+=y-m.h;m.px=m.x;m.py=m.h;m.h=y;const drum=G.obstacles.find(o=>o.prisonWinch);if(drum){drum.y0=y;drum.h=y+65;}const handle=G.storyObjects?.find(o=>o.key==='kd.lift.winch');if(handle){const w=G.prison.winch,angle=w.angle;handle.x=WINCH.x+Math.cos(angle)*WINCH.r;handle.z=WINCH.z+Math.sin(angle)*WINCH.r;handle.y=y;handle.label=w.owner?'Release the winch handle':'Grip the winch handle · walk around the drum';}}
function apply(G,p){G.prison.remote=p;G.prison.rescueT=p.rescueT;G.prison.winch.progress=p.winchProgress||0;G.prison.winch.owner=p.winchOwner||null;G.prison.winch.direction=p.winchDirection||0;G.prison.winch.angle=p.winchAngle||0;G.prison.pressClock=p.pressClock||0;moveLift(G,G.movers.find(m=>m.prisonLift));}
function grip(G,actor,position){const k=G.prison,w=k.winch;if(flag(G.storyState,'kd.lift.open')||k.rescueT<7.99||w.owner&&w.owner!==actor)return false;if(w.owner){w.owner=null;w.lastAngle=null;return true;}w.owner=actor;w.pendingAngle=0;w.lastAngle=Math.atan2(position.z-WINCH.z,position.x-WINCH.x);w.angle=w.lastAngle;w.travel=w.progress*Math.PI*2;return true;}
function release(G,actor){if(G.prison?.winch?.owner===actor){G.prison.winch.owner=null;G.prison.winch.lastAngle=null;}}
function build(a){const {G,seg,plat,solid,spawn}=a;for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];Object.assign(G,{haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
G.prison={rescueT:0,wet:0,walks:{},paths,pressClock:0,presses:[],pressHitUntil:0,winch:{progress:0,owner:null,lastAngle:null,direction:0,travel:0,angle:0}};G.keepPrisoners=[];G.areaName='Ruined Keep · The Dungeons';G.campaignLayout={revision:2196,zone:'keep',area:1};
const floor=(x,z,y,w,d,layer='upper')=>y?plat(x,z,y,w,d,{checkpoint:true,slab:24,prisonLayer:layer}):seg(x,z,w,d,{prisonLayer:layer});
for(const [name,x,z,y,w,d,layer]of [['Stair Landing',0,220,300,680,560],['Cell List',0,-650,180,650,600],['Empty Cells',-750,-950,180,780,600],['East Cells',780,-1100,180,660,700],['Hidden Holding Room',-1040,-1940,180,700,650],['Lift Controls',0,-1900,180,1100,380],['West Gallery',-420,-2550,180,360,1150],['East Gallery',420,-2550,180,360,1150],['North Landing',0,-3160,180,1100,360],['Upper Shelter',0,-3440,360,780,700],['Release Hall Approach',0,-4530,360,850,620],['Lower Works',0,-2930,0,800,860,'lower']]){G.rooms.push({name,x,z,y,w,d,encounter:false,cleared:true,monsters:[]});floor(x,z,y,w,d,layer);}
for(const [name,p]of Object.entries(paths)){const out=[],low=name==='lower'||/Drain|drain/.test(name),width=/Drain|drain/.test(name)?115:low?220:280;for(let j=1;j<p.length;j++){const u=p[j-1],v=p[j],jump=name==='drain'&&drainJumpSegments.includes(j),n=Math.ceil(Math.max(Math.hypot(v[0]-u[0],v[1]-u[1])/(jump?150:90),Math.abs(v[2]-u[2])/14));for(let i=0;i<=n;i++){const q=u.map((x,k)=>x+(v[k]-x)*i/n);floor(q[0],q[1],q[2],jump?70:width,jump?70:width,low?'lower':'upper');out.push(q);}}G.prison.walks[name]=out;}
floor(0,-2230,180,270,330);floor(0,-2770,360,270,330);seg(1890,-4090,1370,1820,{prisonLayer:'lower',water:true});
G.movers.push({prisonLift:true,x:0,x0:0,z:-2500,w:310,d:310,h:180,px:0,py:180,amp:0,sp:0,ph:0});
G.obstacles.push({kind:'col',x:WINCH.x,z:WINCH.z,y0:180,h:245,w:65,d:65,invisible:true,prisonWinch:true});
for(const s of SIGNS)G.obstacles.push({kind:'col',x:s.x,z:s.z,y0:s.y,h:s.y+76,w:14,d:12,invisible:true,cameraSolid:false,prisonSign:true});
G.obstacles.push({kind:'col',x:-1050,z:-1930,y0:180,h:257,w:46,d:32,invisible:true,cameraSolid:false,interactionKey:'kd.free',prisonLock:true});
// Interior walls use real underside heights, leaving the lower passages clear.
const wall=(x,z,y,w,d,h=140)=>{solid(x,z,y,w,h,d,'#484c48');G.obstacles.at(-1).y0=y;};
for(const [x,z,y,w,d,h]of [[-380,-650,180,45,450,160],[380,-650,180,45,450,160],[-900,-630,180,1000,40,145],[-1550,-1900,180,45,900,150],[1090,-1080,180,40,760,150],[-650,-2550,180,45,900,155],[650,-2500,180,45,600,155],[-500,-4350,360,50,900,180],[500,-4350,360,50,900,180],[-420,-3000,0,35,650,120]])wall(x,z,y,w,d,h);
// The lower route is a real press corridor. Its north bulkhead prevents walking around the shard gate.
for(const x of [-285,285])wall(x,-2990,0,30,590,165);
for(const x of [-285,285])wall(x,-2730,0,230,30,165);
for(const [i,z]of PRESS_Z.entries()){
 // The press is a gameplay obstacle, but its moving art fades behind the
 // camera after passage; including it in the static camera sweep pins the
 // lens inside the hero at the emergency brake.
 const collider={kind:'col',x:0,z,y0:134,h:160,w:540,d:62,invisible:true,cameraSolid:false,prisonPress:i};
 G.obstacles.push(collider);G.prison.presses.push({z,collider,bottom:134,warning:false,down:false});
}
// The brake is a physical pedestal, so the player reaches for it from the
// walkway instead of disappearing into its model at interaction range.
G.obstacles.push({kind:'col',x:-205,z:-2760,y0:0,h:90,w:70,d:60,invisible:true,cameraSolid:false,prisonBrake:true,interactionKey:'kd.press.brake'});
// The old east service stair is visibly broken. The lift is the only intact ascent.
for(const [x,z,y,w,d]of [[730,-3235,145,95,125],[850,-3430,185,110,120],[835,-3720,285,85,110]])G.deco.push({kind:'prisonRubble',x,z,y0:y,w,d,h:35,c:'#696e67',nocol:true});
const block=(id,x,z,y,w,d,h)=>G.obstacles.push({kind:'col',x,z,y0:y,h:y+h,w,d,invisible:true,prisonBlock:id});block('hidden',-1300,-1440,180,330,20,160);block('release',0,-4030,360,330,24,170);block('depth',0,-2730,0,340,20,120);
block('holdingExit',-580,-1850,180,24,350,190);
G.storyNpcs=[{id:'walter',name:'Walter',x:-670,z:-980,y:180},{id:'sly',name:'Sly',x:770,z:-1280,y:180}];
const o=(key,label,x,z,y=180,kind='lever',extra={})=>({key,label,x,z,y,kind,...extra});G.storyObjects=[o('kd.roster','Read the cell list',240,-750,180,'paper'),o('kd.marks','Read the old service marks',-1020,-1190,180,'mark'),o('kd.hidden','Push the loose service door',-1300,-1370,180,'door'),o('kd.free','Free the hidden prisoners',-1050,-1930,180,'key'),o('kd.papers','Read the confiscated papers',-1120,-2110,180,'paper'),o('kd.lift.note','Read the lift’s winch plate',-175,-2150,180,'paper'),o('kd.lift.winch','Grip the winch handle · walk around the drum',WINCH.x+WINCH.r,WINCH.z,180,'winch'),o('kd.depth.note','Read the press warning plate',210,-3220,0,'paper'),o('kd.press.brake','Pull the emergency brake',-205,-2760,0,'brake'),o('kd.return','Return the family keepsake',-920,-2010,180,'keepsake'),o('kd.drain.note','Read the marks beside the drain',1540,-3340,80,'mark'),o('kd.cache','Open the dry store chest',2420,-3620,80,'chest')];
for(const [x,z,y]of [[80,-1480,180],[450,-3160,180],[1515,-3033,86]])G.healpads.push({x,z,y,r:32,charge:1,_acc:0});
for(const [type,x,z,y,group]of [['grunt',-970,-1980,180,'cells'],['caster',-1220,-2110,180,'cells'],['grunt',-900,-2150,180,'cells'],['bones',500,-2700,180,'patrol'],['caster',-80,-3520,360,'upper'],['siegeknight',70,-3710,360,'upper'],['bones',1050,-3400,120,'lower'],['bones',2330,-3450,80,'drain'],['caster',2190,-4090,80,'drain']]){const e=spawn(type,x,z,false);e.y=y;e.prisonGuard=group;}
G.bounds={minX:-1800,maxX:2800,minZ:-5150,maxZ:700};G.progressEnd=-4900;G.startPos={x:0,z:300};G.lastSafe={x:0,z:300,y:300};G.portalPos={x:0,z:-4700,y:360};G.goalPos={...G.portalPos};Object.assign(G.p,{x:0,z:300,y:300,vy:0});
}
function sync(a){const {G,state:s,openWay}=a,f=s.flags;
 if(G.prison)for(const [flag,ids]of [['kd.hidden',['kd.roster','kd.marks','inspect.kd.hidden']],['kd.free',['inspect.kd.free']],['kd.lift.open',['kd.rescue','kd.lift','inspect.kd.lift.winch']],['kd.deep.open',['kd.depth','inspect.kd.press.brake']]])if(f[flag]&&!G.prison['notice.'+flag]){G.prison['notice.'+flag]=true;for(const id of ids)root.BFJournalNotice?.queue.dismiss(id);}
 if(s.notes['kd.rescue'])s.notes['kd.rescue'].text='The hidden prisoners are free. The old stair has collapsed. Meet them on the central lift, grip its winch handle, and walk around the drum to raise everyone to shelter. Read their confiscated papers before leaving.';
 if(s.notes['kd.lift'])Object.assign(s.notes['kd.lift'],{title:'Lift winch plate',text:'Grip the handle on the lift. Walk around the drum while holding it; one full turn raises the platform. Letting go lowers it for another try. The lift cycles after the group reaches shelter.'});
 if(s.notes['kd.depth'])Object.assign(s.notes['kd.depth'],{title:'Counterweight press warning',text:'The old presses drop in turns. Watch each warning lamp, cross when its plate rises, and wait in the clear floor between them. The emergency brake past the third press stops the machine and opens the shard gate.'});
 if(s.notes['kd.drain'])s.notes['kd.drain'].text='Pairs of scratches follow the old dry route. Three scratches mark unused turns. Jump between the raised stones where the walkway is broken. If you fall, the current returns you to the drain entrance.';
 G.obstacles=G.obstacles.filter(o=>!o.prisonBlock||!({hidden:f['kd.hidden'],holdingExit:f['kd.free'],release:ready(s),depth:f['kd.deep.open']}[o.prisonBlock]));
 if(f['kd.transfer']){G.prison.rescueT=Math.max(24,G.prison.rescueT);Object.assign(G.storyNpcs.find(n=>n.id==='walter'),{x:-230,z:-3410,y:360});if(f['kd.returned'])Object.assign(G.storyNpcs.find(n=>n.id==='sly'),{x:230,z:-3410,y:360});}
 if(ready(s)){G.qs['kd.rescue']=1;openWay();}
}
function tick(a,dt){const {G,state:s,host,complete,toast,operator,hurt}=a,k=G.prison,w=k.winch;
 if(host&&flag(s,'kd.free')){
  if(k.rescueT<8)k.rescueT=Math.min(8,k.rescueT+dt);
  else if(!flag(s,'kd.lift.open')){
   if(w.owner){const p=operator,r=p&&Math.hypot(p.x-WINCH.x,p.z-WINCH.z),angle=p&&Math.atan2(p.z-WINCH.z,p.x-WINCH.x),lift=G.movers.find(m=>m.prisonLift),handle=G.storyObjects.find(o=>o.key==='kd.lift.winch');
    if(!p||p.dead||p.downed||p.hp<=0||r<56||r>122||Math.abs((p.y||0)-lift.h)>50||Math.hypot(p.x-handle.x,p.z-handle.z)>55){w.owner=null;w.lastAngle=null;toast('The handle slips free. The lift lowers so you can try again.');}
    else {let delta=angle-w.lastAngle;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;w.lastAngle=angle;
     if(Math.abs(delta)<.25){w.angle=angle;
      // Ignore the few centimetres of approach inertia before choosing a winding direction.
      if(!w.direction){w.pendingAngle=(w.pendingAngle||0)+delta;if(Math.abs(w.pendingAngle)>=.16){w.direction=Math.sign(w.pendingAngle);w.travel+=Math.abs(w.pendingAngle);w.pendingAngle=0;}}
      else w.travel=Math.max(0,w.travel+w.direction*delta);
      w.progress=Math.max(w.progress,Math.min(1,w.travel/(Math.PI*2)));
     }
    }
   }
   if(!w.owner){w.progress=Math.max(0,w.progress-dt*.32);w.travel=w.progress*Math.PI*2;w.angle=(w.direction||1)*w.travel;if(w.progress===0)w.direction=0;}
   k.rescueT=8+8*w.progress;
   if(w.progress>=1){w.owner=null;w.lastAngle=null;complete('kd.lift.wound');toast('The lift reaches the upper shelter. Follow the prisoners out.');}
  }else {w.progress=1;w.owner=null;k.rescueT=flag(s,'kd.transfer')?k.rescueT+dt:Math.min(24,k.rescueT+dt);if(k.rescueT>=24&&!flag(s,'kd.transfer'))complete('kd.transfer');}
 }
 if(host||k.remote)k.pressClock+=dt;
 const p=G.p,stopped=flag(s,'kd.deep.open');
 for(const [i,press]of k.presses.entries()){
  const q=pressState(k.pressClock,i,stopped);Object.assign(press,q);press.collider.y0=q.bottom;
  if(!stopped&&q.down&&p.hp>0&&!p.downed&&p.y<80&&Math.abs(p.x)<268&&Math.abs(p.z-press.z)<45&&G.time>=k.pressHitUntil){
   k.pressHitUntil=G.time+.8;
   Object.assign(p,{z:press.z-83,vy:0,vz:0,onGround:true});
   hurt?.(Math.max(7,Math.round((p.maxHp||100)*.10)),{x:0,z:press.z,name:'the lower-works press',attack:'a counterweight strike'});
   toast('The press knocks you back. Watch the warning lamp and try the next opening.');
  }
 }
 const wet=p.x>1205&&p.x<2575&&p.z<-3180&&p.z>-5000&&p.y<18&&p.hp>0&&!p.downed;k.wet=wet?k.wet+dt:0;if(wet&&k.wet===dt)toast('Deep water — climb back onto the dry stones.');if(k.wet>1.2){Object.assign(p,{x:1500,z:-3350,y:80,vy:0,vx:0,vz:0,onGround:true});k.wet=0;toast('The current carried you back to the drain entrance.');}
actors(G,s);}
function prisonerPath(i){const side=i<2?-1:1;return [[-1100+i*40,-1900,180],[-1050,-1780+i*15,180],[-730,-1850+i*15,180],[-420,-1910+i*12,180],[side*110,-2110,180],[side*110,-2290,180],[side*110,-2620,180],[(-1.5+i)*44,-2620,180]];}
function actors(G,s){const t=G.prison.rescueT;G.keepPrisoners=[0,1,2,3].map(i=>{const points=prisonerPath(i);let x,y,z,walking=false,yaw=Math.PI;if(!flag(s,'kd.free'))[x,z,y]=points[0];else if(t<8){const progress=t/8*(points.length-1),step=Math.min(points.length-2,Math.floor(progress)),f=progress-step,u=points[step],v=points[step+1];[x,z,y]=u.map((a,j)=>a+(v[j]-a)*f);walking=true;yaw=Math.atan2(v[0]-u[0],v[1]-u[1]);}else if(t<16){x=(-1.5+i)*44;z=-2620;y=liftHeight(t);}else{const u=Math.min(1,(t-16)/8);x=(-1.5+i)*44;z=-2620-u*850;y=360;walking=u<1;}return {id:'prison_escape'+i,name:'Freed prisoner',x,z,y,walking,_yaw:yaw};});}
function shards(s){return [...(flag(s,'kd.deep.open')?[{id:'RK-03',x:0,z:-2500,y:0}]:[]),{id:'RK-05',x:1950,z:-4780,y:80}];}
function draw(a,t){const {G,state:s,bx}=a,f=s.flags;if(!G.prison)return;
if(!root.__PRISON_JOURNEY_ART)for(const [id,x,z,y,w,h]of [['hidden',-1300,-1440,180,330,160],['release',0,-4030,360,330,170],['depth',0,-2730,0,340,120]]){const open=id==='release'?ready(s):f[id==='depth'?'kd.deep.open':'kd.hidden'];for(const dx of [-w/2,w/2])bx(x+dx,y+h/2,z,16,h,20,'#747064');bx(x,y+h,z,w+20,12,24,'#9a8d70');if(!open)for(let i=0;i<9;i++)bx(x-w/2+20+i*(w-40)/8,y+h/2,z,9,h,9,'#555b58');}
if(!root.__PRISON_JOURNEY_ART&&!f['kd.free']){for(let i=0;i<9;i++)bx(-580,275,-2005+i*39,9,190,9,'#667d83');bx(-580,375,-1850,26,15,375,'#aaa086');}
for(const o of G.storyObjects){if(root.BFCampaignObjects?.drawn(o)||root.__PRISON_JOURNEY_ART?.objects.has(o.key))continue;const y=o.y;if(o.kind==='winch'||o.kind==='brake'&&root.__KEEP_ART_ACTIVE)continue;if(o.kind==='brake'){bx(o.x,y+42,o.z,48,84,44,'#5c665f');bx(o.x,y+84,o.z,62,10,58,f['kd.deep.open']?'#9fdbaf':'#d5aa5e');bx(o.x,y+100,o.z+(f['kd.deep.open']?15:-12),12,38,12,'#e2c47e');}else if(o.kind==='paper'||o.kind==='mark'){bx(o.x,y+25,o.z,12,50,12,'#5b4c35');bx(o.x,y+55,o.z,64,38,6,'#c7b98c');for(let j=0;j<3;j++)bx(o.x,y+46+j*8,o.z+4,42-j*7,2,2,'#645945');}else if(o.kind==='chest'){bx(o.x,y+20,o.z,58,40,42,'#6c674e');for(const dx of [-20,20])bx(o.x+dx,y+21,o.z,7,43,44,'#a69863');}else{bx(o.x,y+20,o.z,42,40,38,'#636858');bx(o.x,y+43,o.z,36,8,10,'#bbae88');}}
if(!root.__KEEP_ART_ACTIVE)for(const press of G.prison.presses){
 bx(0,2,press.z,540,4,64,'#7e7160');
 bx(0,(press.bottom+160)/2,press.z,540,160-press.bottom,56,'#67747a');
 for(const x of [-245,245]){bx(x,164,press.z,12,20,62,'#d9b672');bx(x,177,press.z,20,8,20,f['kd.deep.open']?'#9fe6b6':press.warning?'#ffd15a':press.down?'#ec7962':'#8aa5a7');}
}
// Paired scratch marks continue through the correct dry route; three marks identify old dead ends.
for(const [x,z,n]of [[1930,-3370,2],[1930,-3680,2],[1670,-3690,2],[1670,-4030,2],[2230,-4070,2],[2230,-4380,2],[1970,-4420,2],[2380,-3350,3],[1400,-4050,3]])for(let i=0;i<n;i++)bx(x+i*9,83,z,4,3,22,'#d5c9a3');
const m=G.movers.find(m=>m.prisonLift);if(m){for(const dx of [-135,135])for(const dz of [-135,135])bx(dx,(m.h+510)/2,m.z+dz,5,510-m.h,5,'#85765b');for(const dx of [-152,152])bx(dx,m.h+25,m.z,8,50,220,'#6a573c');
 if(!root.__KEEP_ART_ACTIVE){const w=G.prison.winch,angle=w.angle;
 bx(WINCH.x,m.h+30,WINCH.z,66,60,66,'#52636a');bx(WINCH.x,m.h+63,WINCH.z,78,8,78,'#d0ae6c');bx(WINCH.x,m.h+70,WINCH.z,27,13,27,'#f0d799');
 for(let i=0;i<24;i++){const a=i*Math.PI/12,x=WINCH.x+Math.cos(a)*WINCH.r,z=WINCH.z+Math.sin(a)*WINCH.r;bx(x,m.h+3,z,10,5,10,i/24<=w.progress?'#b6e5be':'#766a57');}
 for(let i=1;i<=6;i++){const t=i/6;bx(WINCH.x+Math.cos(angle)*WINCH.r*t,m.h+51,WINCH.z+Math.sin(angle)*WINCH.r*t,13,9,13,'#b99256');}
 bx(WINCH.x+Math.cos(angle)*WINCH.r,m.h+62,WINCH.z+Math.sin(angle)*WINCH.r,15,45,15,w.owner?'#f7d782':'#d3b378');
 for(const dx of [222,264])bx(dx,350,-2500,9,350,9,'#8d7e65');bx(243,525,-2500,70,14,58,'#c3a36b');bx(243,435-(m.h-180),-2500,64,78,59,'#7c7263');for(const dx of [228,258])bx(dx,435-(m.h-180),-2468,5,64,3,'#d9b972');}
 }
for(const n of G.storyNpcs){const pending=n.id==='walter'?!f['kd.walter.met']:!f['kd.sly.reward'];if(pending){bx(n.x,n.y+86,n.z,5,15,5,'#ddc185');bx(n.x,n.y+74,n.z,5,4,5,'#ddc185');}}
}
root.BFPrison={paths,drainJumpSegments,build,ready,quest,status,destination,available,sync,tick,actors,prisonerPath,shards,draw,moveLift,apply,grip,release,liftHeight,WINCH,pressState,PRESS_Z,SIGNS};if(typeof module!=='undefined')module.exports=root.BFPrison;
})(typeof window!=='undefined'?window:globalThis);
