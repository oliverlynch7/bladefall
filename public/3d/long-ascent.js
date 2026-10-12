/* Long Ascent: authored storeys, finite landing guards, optional living workers. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['la.'+k],TAU=Math.PI*2;
function stairHeight(t){const q=Math.floor(t*4)/4,u=t-q;return (q+(u<.045?0:u>.205?.25:(u-.045)*.25/.16))*1000;}
function point(t,r=940){const a=t*TAU;return [Math.round(Math.sin(a)*r),Math.round(Math.cos(a)*r),Math.round(stairHeight(t)/10)*10];}
const path=Array.from({length:241},(_,i)=>point(i/120));
// A broken flight becomes a short exposed ledge, then returns to the same staircase.
for(let i=129;i<=147;i++){const u=(i-129)/18;path[i]=point(i/120,940+Math.sin(u*Math.PI)*360);}
for(let i=213;i<=229;i++){const u=(i-213)/16;path[i]=point(i/120,940+Math.sin(u*Math.PI)*300);}
 const gaps=[135,143,219,225];
 const anchors={entry:point(0),service:point(.25),cells:point(.75),lower:point(.5),upper:point(1.5),memorial:point(1.75),summit:point(2)};
 const stairGates=[{id:'lower',p:point(.55)},{id:'upper',p:point(1.55)}];
const ready=s=>f(s,'summit');
const vaultSteps=[
 [1450,-445,282,130,120],[1540,-530,318,105,105],
 [1665,-585,354,108,100],[1795,-555,390,110,108],
 [1880,-460,425,112,104],[1910,-345,460,145,125]
];
function status(G){return {cells:G.enemies.filter(e=>e.ascentGuard==='cells'&&!e.dead&&e.hp>0).length,summit:G.enemies.filter(e=>e.ascentGuard==='summit'&&!e.dead&&e.hp>0).length};}
function quest(s){return !f(s,'lower')?'Climb the spiral and release the lower stair catch':!f(s,'upper')?'Cross the broken flight and release the upper stair catch':!f(s,'summit')?'Reach the top and open the throne doors':'Enter the throne room when you are ready';}
function available(k,G,a){a=a||status(G);if(k==='la.vault.brake')return !!G.storyState?.flags['la.cells']&&!G.storyState?.flags['la.vault.open'];return k==='la.cells'?a.cells===0:k==='la.summit'?a.summit===0&&!!G.storyState?.flags['la.lower']&&!!G.storyState?.flags['la.upper']:true;}
function visualKey(s){return ['lower','upper','cells','vault.open','summit'].map(k=>+f(s,k)).join('');}
function build({G,plat,spawn}){
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[k]=[];
  Object.assign(G,{boss:null,haz:null,canyonWind:null,npc:null,secret:null,secretTrigger:null,waystone:null,beam:null,collapse:[],optionalMissions:[],portal:null,bonusPortal:null,bonusActive:false,vertical:true,thorns:[],vents:[],phasers:[],debris:[],lights:[],spireRY:true,ascent:{gateSeen:{lower:null,upper:null},gateAt:{lower:-Infinity,upper:-Infinity},vaultSeen:null,vaultAt:-Infinity,vaultSteps}});
 const floor=(p,w=260,d=w)=>plat(p[0],p[1],p[2],w,d,{slab:32,checkpoint:true});
 const route=(ps,w=200)=>{for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/75,Math.abs(b[2]-a[2])/10));for(let i=0;i<=n;i++)floor(a.map((v,k)=>v+(b[k]-v)*i/n),w);}};
 for(const [i,p]of path.entries()){if(gaps.includes(i))continue;const a=i/120*TAU;for(let j=-2;j<=2;j++)plat(p[0]+Math.sin(a)*j*48,p[1]+Math.cos(a)*j*48,p[2],76,76,{slab:24,checkpoint:true,invisible:true});}
 for(const i of gaps){const p=path[i];plat(p[0],p[1],p[2]-70,220,220,{slab:20,ascentCatch:true});}
 const side={service:[anchors.service,[1270,0,250],[1460,-250,250]],cells:[anchors.cells,[-1310,0,750],[-1460,-310,750]],vault:[[1460,-250,250],[1740,-250,250],[1860,90,250]],memorial:[anchors.memorial,[-1240,0,1750],[-1440,350,1800],[-1730,350,1800]],liftUpper:[point(1.25),[1420,-170,1250]],upperCatch:[anchors.upper,[350,-1190,1500]],lowerCatch:[anchors.lower,[-350,-1190,500]]};
 for(const [id,ps]of Object.entries(side)){if(id!=='memorial'){route(ps,190);continue;}const steps=[ps[0],ps[1]];route(steps,190);const a=ps[1],b=ps[2],n=4;for(let i=1;i<=n;i++){const q=a.map((v,k)=>v+(b[k]-v)*i/n);floor(q,75,85);floor([q[0],q[1],q[2]-80],190,190);steps.push(q);}route([ps[2],ps[3]],190);steps.push(ps[3]);side.memorial=steps;}
 G.ascent.routes={spiral:path.filter((_,i)=>!gaps.includes(i)),...side};
 const room=(name,p,w,d)=>{floor(p,w,d);G.rooms.push({name,x:p[0],z:p[1],y:p[2],w,d,encounter:false,cleared:true,monsters:[]});};
 room('Tower foot',anchors.entry,600,500);room('Service landing',anchors.service,540,520);room('Lower stair catch',anchors.lower,620,490);room('Locked workers',[-1300,-180,750],740,730);room('Broken flight',point(1),600,500);room('Upper stair catch',anchors.upper,650,520);room('Throne approach',anchors.summit,760,620);room('Linen room',[1390,-190,250],520,650);room('Service vault',[1810,30,250],410,450);room('Old memorial',[-1630,350,1800],460,400);
 // The damaged rack is a separate, visible climb. A lower service shelf catches
 // misses so the player can return to the linen room without a long fall.
 for(const [x,z,y,w,d]of vaultSteps)plat(x,z,y,w,d,{slab:18,checkpoint:true,vaultRack:true});
 plat(1690,-460,220,410,210,{slab:20,ascentCatch:true});
  const wall=(p,w,d,h,tag)=>G.walls.push({x:p[0],z:p[1],y0:p[2],w,d,h,c:'#494851',courtWall:true,ascentTag:tag});
 wall([-1490,-150,750],24,330,180,'cells');G.walls.at(-1).invisible=true;wall([1640,-240,250],28,230,170,'vault');G.walls.at(-1).invisible=true;wall([0,1170,2000],760,35,360,'summit');G.walls.at(-1).invisible=true;
 // Match the detailed linen wall's broken bay; the central gap is the rack approach.
 G.walls.push({x:1255,z:-480,y0:250,w:201,d:28,h:201,courtWall:true,invisible:true});
 G.walls.push({x:1591,z:-480,y0:250,w:67,d:28,h:201,courtWall:true,invisible:true});
 G.walls.push({x:1700,z:-715,y0:250,w:770,d:32,h:440,courtWall:true,invisible:true});
 G.walls.push({x:2070,z:-475,y0:250,w:30,d:445,h:440,courtWall:true,invisible:true});
  // These bars close the same two flights as their side catches. They occupy the
  // full radial stair width without reaching the next storey of the spiral.
  for(const gate of stairGates){wall([gate.p[0],gate.p[1],gate.p[2]-8],54,330,168,gate.id);G.walls.at(-1).invisible=true;}
 const part=(name,p,w,h,d,c)=>G.deco.push({portalPart:name,x:p[0],y0:p[2],z:p[1],w,h,d,c:c||'#5f5b67'});
  // Keep the tall shaft supports behind the play camera's usual southward view.
  // A full inner ring hid the hero and the stair catches on the north flights.
  for(let i=0;i<24;i++){const a=i*TAU/24,x=Math.sin(a)*650,z=Math.cos(a)*650;if(z<80)continue;part('pillar',[x,z,970],60,2100,65,'#363b48');for(let j=0;j<5;j++)part('cap',[x,z,j*480],120,28,120,'#79727b');}
 for(let i=0;i<path.length;i+=6){const p=path[i],a=i/120*TAU,xx=p[0]+Math.sin(a)*128,zz=p[1]+Math.cos(a)*128;part('pillar',[xx,zz,p[2]+62],18,124,18,'#807582');part('glow',[xx,zz,p[2]+130],12,20,12,'#e8b97c');}
 for(let i=0;i<path.length;i+=12){const p=path[i];part('cap',[p[0],p[1],p[2]+1.6],65,2,30,'#a5927c');}
 // The lower living quarters are warm, occupied and cramped; upper records are cold and abandoned.
 for(const [x,z,y]of [[1210,-180,250],[1570,65,250],[-1500,-300,750],[-1520,20,750]]){part('stone',[x,z,y+18],70,36,140,'#665443');part('cap',[x,z,y+39],72,8,138,'#8a8073');part('stone',[x,z-46,y+46],55,8,37,'#c5b6a0');}
 for(const p of [[1450,20,250],[1550,20,250],[-1580,-370,750]]){part('stone',[p[0],p[1],p[2]+37],90,74,70,'#73614f');part('cap',[p[0],p[1],p[2]+77],96,6,76,'#ae9470');}
 for(const p of [[-1680,450,1800],[-1730,180,1800]]){part('stone',[p[0],p[1],p[2]+65],75,130,35,'#8a808a');part('cap',[p[0],p[1],p[2]+139],95,16,50,'#bbb0a5');}
 wall([-1630,540,1800],480,35,230);wall([-1835,350,1800],35,400,230);wall([1620,150,250],30,320,190);wall([1930,30,250],30,450,190);
 // Cover lives only on broad fighting landings; no clutter narrows a flight.
 for(const t of [.45,.92,1.45,1.93]){const p=point(t);floor(p,320,320);for(const sign of [-1,1]){const a=t*TAU,q=[p[0]+Math.sin(a)*sign*320,p[1]+Math.cos(a)*sign*320,p[2]];floor(q,160,140);part('cap',[q[0],q[1],q[2]+70],118,10,72,'#8e8390');}}
 G.ascentWorkers=[{id:'ascent_worker_a',x:-1570,z:-300,y:750},{id:'ascent_worker_b',x:-1570,z:-80,y:750}];
 G.storyNpcs=[{id:'miles',name:'Miles',x:1420,z:-170,y:250}];
 const o=(k,label,p,kind='wheel',more={})=>({key:'la.'+k,label,x:p[0],z:p[1],y:p[2],kind,...more});
 G.storyObjects=[o('notice','Read the stair notice',[110,900,0],'book'),o('lower','Release the lower stair catch',[-350,-1190,500]),o('upper','Release the upper stair catch',[350,-1190,1500]),o('cells','Open the worker cells',[-1400,-250,750],'wheel',{blockedLabel:'Defeat the cell guards first'}),o('vault.note','Read the service-vault note',[1250,-355,250],'book'),o('vault.brake','Pull the high service brake',[1910,-345,460],'brake',{blockedLabel:'Free the workers before releasing the service brake',blockedText:'The worker-cell lock still holds the vault cable. Free them, then climb the broken rack above the linen room.'}),o('orders','Read the King’s urgent order',[-120,-970,1500],'book'),o('memorial.note','Read the old workers’ names',[-1630,440,1800],'book'),o('summit','Open the throne doors',[0,1090,2000],'wheel',{blockedLabel:'Release both stair catches and defeat the throne guards first'})];
 G.healpads=[{x:-170,z:900,y:0,r:35,charge:1,_acc:0},{x:1340,z:50,y:250,r:34,charge:1,_acc:0},{x:-1130,z:80,y:750,r:34,charge:1,_acc:0},{x:180,z:940,y:1000,r:34,charge:1,_acc:0},{x:120,z:-1090,y:1500,r:34,charge:1,_acc:0},{x:-200,z:980,y:2000,r:36,charge:1,_acc:0}];
 for(const [t,types,guard]of [[.20,['grunt','caster']],[.45,['siegeknight','royalarcanist']],[.75,['grunt','caster','grunt'],'cells'],[.92,['royalarcanist','grunt']],[1.25,['grunt','caster']],[1.45,['siegeknight','caster']],[1.93,['siegeknight','royalarcanist','grunt'],'summit']]){const p=point(t);floor(p,320,320);types.forEach((type,i)=>{const e=spawn(type,p[0]+(i-1)*75,p[1],false);const y=G.obstacles.reduce((v,o)=>Math.abs(e.x-o.x)<o.w/2&&Math.abs(e.z-o.z)<o.d/2&&o.h<=p[2]+100?Math.max(v,o.h):v,p[2]);Object.assign(e,{y,sx:e.x,sz:e.z,ascentGuard:guard||'landing',authoredStorey:true});});}
 G.bounds={minX:-2150,maxX:2200,minZ:-1600,maxZ:1650};G.progressEnd=1200;G.startPos={x:0,z:880,y:0};G.lastSafe={...G.startPos};G.portalPos={x:0,z:1260,y:2000};G.goalPos={...G.portalPos};floor([0,1250,2000],420,300);Object.assign(G.p,{...G.startPos,vy:0});
}
 function sync({G,state:s,openWay,toast}){if(s.notes["la.notice"])s.notes["la.notice"].text="Each stair catch opens the bars on the next flight. Both are needed to reach the throne doors. Two upper flights have broken steps; jump the gaps and use the ledges below if you fall.";if(s.notes["la.lower"])s.notes["la.lower"].text="The lower bars have pulled back. Continue up the spiral to the next catch.";if(s.notes["la.upper"])s.notes["la.upper"].text="The upper bars have pulled back. Continue toward the throne doors.";if(s.notes["la.vault"])s.notes["la.vault"].text=f(s,'vault.open')?'The high service brake has pulled back the vault bars. The shard is behind them.':'The cell lock holds the vault cable. Free the workers, then climb the broken rack above the linen room to reach its high brake. The lower shelf catches a missed jump.';
  for(const gate of stairGates){const open=f(s,gate.id);if(G.ascent.gateSeen[gate.id]===null)G.ascent.gateSeen[gate.id]=open;else if(open&&!G.ascent.gateSeen[gate.id]){G.ascent.gateSeen[gate.id]=true;G.ascent.gateAt[gate.id]=G.time||0;toast?.((gate.id==='lower'?'Lower':'Upper')+' stair bars retract.');}}
  if(G.ascent.vaultSeen===null)G.ascent.vaultSeen=f(s,'vault.open');else if(f(s,'vault.open')&&!G.ascent.vaultSeen){G.ascent.vaultSeen=true;G.ascent.vaultAt=G.time||0;toast?.('The overhead cable pulls the vault bars aside.');}
  for(const [flag,tag]of [['lower','lower'],['upper','upper'],['cells','cells'],['vault.open','vault'],['summit','summit']])if(f(s,flag))G.walls=G.walls.filter(w=>w.ascentTag!==tag);G.ascent.lift=f(s,'cells');for(const [i,n]of (G.ascentWorkers||[]).entries())if(f(s,'cells'))Object.assign(n,{x:1320+i*120,z:-340,y:250});if(ready(s)){G.qs['la.ascent']=1;openWay();}}
function ride(G,up){if(G.ascent.lift)G.ascent.ride={from:up?250:1250,to:up?1250:250,t:0};}
function tick(G,dt){const r=G.ascent.ride;if(!r)return;r.t=Math.min(1,r.t+dt/3);const u=r.t*r.t*(3-2*r.t),x=1420;Object.assign(G.p,{x,z:-170,y:r.from+(r.to-r.from)*u,vy:0,vx:0,vz:0,onGround:true});if(r.t===1){G.ascent.ride=null;G.lastSafe={x:G.p.x,y:G.p.y,z:G.p.z};}}
function shards(s){return [...(f(s,'vault.open')?[{id:'CD-03',x:1850,z:90,y:250}]:[]),{id:'CD-05',x:-1770,z:350,y:1800}];}
 function draw({G,state:s,bx,ring},t){for(const o of G.storyObjects){if(root.BFCampaignObjects?.drawn(o))continue;const used=s.flags['event.'+o.key];if(used&&o.kind!=='book'&&o.kind!=='brake')continue;bx(o.x,o.y+22,o.z,44,44,42,'#65606a');if(o.kind==='book')bx(o.x,o.y+47,o.z,50,5,33,'#cbb99b');else{ring(o.x,o.y+54,o.z,29,'#b19a70');bx(o.x,o.y+55,o.z,58,7,8,o.kind==='brake'&&f(s,'vault.open')?'#a6d6b6':'#c7ab76');}}
  // Supported, staggered shelving rises above the linen room. Copper edges
  // mark the intended footing and a continuous rope leads to the barred vault.
  for(let i=0;i<vaultSteps.length;i++){const [x,z,y,w,d]=vaultSteps[i];bx(x,y-13,z,w-8,13,d-8,'#675b54');bx(x,y+2,z,w-13,3,d-13,i===vaultSteps.length-1?'#baa67f':'#a49176');for(const dx of [-w*.36,w*.36]){bx(x+dx,y-30,z,11,Math.max(32,(y-250)*2+22),12,'#65574d');bx(x+dx,y+5,z-d*.38,7,8,7,'#d7b978');}bx(x,y+7,z-d*.37,w*.55,3,6,'#e0c383');}
  bx(1690,206,-460,400,14,200,'#504e53');bx(1690,222,-460,370,3,180,'#7c746e');
  bx(1910,505,-345,14,84,14,'#786857');bx(1910,543,-345,64,9,12,f(s,'vault.open')?'#9bc5a9':'#d7b97c');
  bx(1780,547,-290,262,5,5,f(s,'vault.open')?'#e8d0a1':'#a59a84');bx(1650,430,-240,6,235,6,'#a59a84');
  for(const gate of stairGates){
    const [x,z,y]=gate.p,open=f(s,gate.id),at=G.ascent.gateAt[gate.id];
    const u=open?(at===-Infinity?1:Math.max(0,Math.min(1,((G.time||0)-at)/1.2))):0,ease=u*u*(3-2*u);
    for(const side of [-1,1]){
      const center=z+side*(75+ease*190);
      for(let i=-3;i<=3;i++)bx(x,y+76,center+i*22,10,133,10,'#797381');
      bx(x,y+145,center,16,12,152,'#b59d78');
      bx(x,y+10,center,16,12,152,'#8b766a');
    }
    for(const side of [-1,1]){
      bx(x,y+85,z+side*181,30,170,20,'#6b606d');
      bx(x+3,y+163,z+side*181,42,12,29,'#b59d78');
    }
  }
 if(!f(s,'cells'))for(let i=-2;i<=2;i++)bx(-1490,840,-150+i*66,12,180,12,'#8a7f89');
 const opened=f(s,'vault.open'),elapsed=(G.time||0)-G.ascent.vaultAt;
 const pull=opened?(G.ascent.vaultAt===-Infinity?1:Math.max(0,Math.min(1,elapsed/1.25))):0;
 for(let i=-2;i<=2;i++){const side=i<0?-1:1;bx(1640+side*pull*155,335,-240+i*46,12,170,12,opened?'#af9d83':'#8a7f89');}
 if(!f(s,'summit')){for(let i=-5;i<=5;i++)bx(i*65,2180,1170,25,360,20,'#716676');for(const y of [2080,2290])bx(0,y,1170,740,22,26,'#a19187');}
 if(G.ascent.lift)for(const [x,y]of [[1420,250],[1420,1250]]){bx(x,y+3,-170,155,6,120,'#a08763');bx(x,y+60,-110,8,115,8,'#b5a07f');}if(G.ascent.ride)bx(G.p.x,G.p.y-6,G.p.z,160,12,130,'#9d825d');
}
const api={point,path,gaps,anchors,build,status,quest,available,visualKey,ready,sync,ride,tick,shards,draw};root.BFLongAscent=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
