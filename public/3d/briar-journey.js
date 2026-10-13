/* The live Briar route, not the beta. All mechanics retain the campaign's IDs. */
(function(root){'use strict';
const CRATE={x:130,z:-1600},PLATE={x:130,z:-1880},BRIDGE={x:180,z:-2160};
const signs=[
 [{x:-285,z:-560,rows:['MILL & WOODS  ↑','WEST FARM  ←','GRANARY  →']},
  {x:-1330,z:-670,rows:['GUS’S WORKSHOP  ↑','SUPPLY WAGON  ←','VILLAGE  →']},
  {x:1730,z:-660,rows:['WATCHTOWER  ↑','GRANARY  ←']},
  {x:-2260,z:-1280,rows:['ORCHARD CLIMB  ↑','MILL  →']},
  {x:100,z:-2740,rows:['STONE BRIDGE  ↑','RIVERSIDE HOMES  ←','WINDMILL RISE  →']}],
 [{x:205,z:-640,rows:['LEGION CAMP  ←','CANOPY CLIMB  →','BOTH REACH THE SIGNAL']},
  {x:-910,z:-2070,rows:['SIGNAL POST  →','OLD GROVE  ←']},
  {x:1060,z:-970,rows:['CANOPY  ←','BETH’S TRAIL  →']},
  {x:150,z:-3750,rows:['NORTH SHELTER  ↑']}]
];
function build(G){
 if(G.zone!==0||G.area<0||G.hub||G.side||G.trial||G.devBriar||G.devKeep||G.endless||G.delve)return;
 const paths=G.area===0?[...(G.campaignLayout?.edges||[]).map(e=>({points:[G.rooms[e.a],...e.points,G.rooms[e.b]].map(p=>[p.x,p.z,p.y||0]),width:145})),...(G.homefieldsExploration?.paths||[]).map(points=>({points:points.map(p=>[...p,0]),width:115}))]:[...(G.blackWoods?.paths||[]).map(points=>({points:points.map(p=>[...p,0]),width:135})),{points:(G.bethRescue?.trail||[]).map(p=>[...p,0]),width:90}];
 // Add the actual short connectors rather than drawing through the store or barn.
 if(G.area===0)paths.push({points:[[0,470,0],[0,120,0],[-130,80,0],[-190,160,0]],width:115},{points:[[440,-410,0],[760,-410,0],[760,360,0],[1150,360,0],[1150,230,0]],width:90});
 G.briarJourney={revision:2188,paths,signs:signs[G.area]};
 for(const s of signs[G.area])G.obstacles.push({kind:'col',x:s.x,z:s.z,w:16,d:16,h:122,invisible:true,briarSign:true});
 if(G.area!==0)return;
 // Keep the old roadside lamp on the east bank, outside the widened crossing.
 for(const d of G.deco||[])if(d.kind==='lantern'&&d.x>280&&d.x<390&&Math.abs(d.z-BRIDGE.z)<100){
  for(const o of G.obstacles)if(o.autoCol&&o.x===d.x&&o.z===d.z)o.x=425;
  d.x=425;
 }
 // Open the old brook's west curb where the crossing joins it. Preserve the
 // upstream/downstream portions instead of leaving masonry across the water.
 if(G.deco)G.deco=G.deco.flatMap(d=>{
  if(d.c!=='#8a8062'||d.w!==13||d.x>320||d.z+d.d/2<=-2238||d.z-d.d/2>=-2082)return[d];
  const out=[],lo=d.z-d.d/2,hi=d.z+d.d/2;
  if(lo<-2238)out.push({...d,z:(lo-2238)/2,d:-2238-lo});
  if(hi>-2082)out.push({...d,z:(hi-2082)/2,d:hi+2082});return out;
 });
 const f=G.storyState.flags,stopped=!!(f['briar.water']||f['briar.jam']||f['briar.bridge']);
 const m=G.briarMill={x:stopped?PLATE.x:CRATE.x,z:stopped?PLATE.z:CRATE.z,owner:null,offset:null,plate:stopped?1:0,water:stopped?0:1,docked:0,wheel:0,bridge:f['briar.bridge']?1:0,latched:stopped,bridgeSeen:!!f['briar.bridge']};
 m.solid={kind:'col',x:m.x,z:m.z,y0:0,w:66,d:66,h:62,invisible:true,millCrate:true,interactionKey:'briar.water'};G.obstacles.push(m.solid);
 // Replace only the old water handle; the wheel and crossing stay where they belong.
 const o=G.storyObjects.find(o=>o.key==='briar.water');Object.assign(o,{x:m.x,z:m.z,kind:'millcrate',range:118,label:'Move the grain crate · E, then walk'});
 Object.assign(G.storyObjects.find(o=>o.key==='briar.jam'),{z:-1740,label:'Free the wheel and latch the sluice',blockedText:'The water is pushing against the jam. Keep the broad pressure plate down first.'});
 Object.assign(G.storyObjects.find(o=>o.key==='briar.bridge'),{x:80,blockedText:'The wheel is still jammed. Hold the sluice closed and free the timber beside the wheel.'});
 G.storyObjects.push({key:'briar.mill.note',x:5,z:-1570,y:0,kind:'millnote',label:'Read the millwright’s sketch'},
  {key:'briar.mill.reset',x:5,z:-1780,y:0,kind:'millreset',range:78,label:'Return the grain crate to its starting place'});
 for(const o of G.walls)if(o.storyBridge){o.x=BRIDGE.x;o.h=238;}
 G.briarBridge.x=BRIDGE.x;
 G.obstacles.push({kind:'col',x:5,z:-1780,w:12,d:12,h:44,invisible:true,interactionKey:'briar.mill.reset'});
 G.obstacles.push({kind:'plat',...BRIDGE,h:8,w:190,d:220,invisible:true,millDeck:true});
 m.gateSolid={kind:'col',x:300,z:-1640,y0:70,w:93,d:12,h:144,invisible:true,millGate:true};G.obstacles.push(m.gateSolid);
 for(const z of [-1640,-1880])G.obstacles.push({kind:'col',x:50,z,w:10,d:10,h:98,invisible:true,millFrame:true});
 for(const x of [250,350])G.obstacles.push({kind:'col',x,z:-1640,w:10,d:12,h:96,invisible:true,millFrame:true});
 sync(G);
}
function sync(G){const m=G.briarMill;if(!m)return;const f=G.storyState.flags;
 if(f['briar.water']||f['briar.jam']||f['briar.bridge']){m.latched=true;m.owner=null;m.offset=null;m.x=PLATE.x;m.z=PLATE.z;}
 if(f['briar.bridge']&&!m.bridgeSeen){m.bridgeSeen=true;m.bridge=0;}
 if(G.briarBridge)G.briarBridge.closed=m.bridge<1;
 if(m.bridge>=1)G.walls=G.walls.filter(o=>!o.storyBridge);
 const flow=f['briar.bridge']?m.bridge:m.water;m.gateSolid.y0=flow*70;m.gateSolid.h=flow*70+74;
 if(m.solid.x!==m.x||m.solid.z!==m.z)G._obsDirty=true;
 Object.assign(m.solid,{x:m.x,z:m.z});
 const o=G.storyObjects.find(o=>o.key==='briar.water');if(o)Object.assign(o,{x:m.x,z:m.z,label:m.owner?'Release the grain crate · E':'Move the grain crate · E, then walk'});
 refreshNotices(G,root.BFJournalNotice?.queue);
}
function refreshNotices(G,q){if(!q||!G.briarMill)return;const f=G.storyState.flags;
 if(G.briarMill.water<.1||G.briarMill.latched)q.dismiss('inspect.briar.jam');
 if(f['briar.water'])q.dismiss('inspect.briar.water');
 if(f['briar.jam'])q.dismiss('inspect.briar.bridge');
 if(f['briar.bridge'])q.dismiss('briar.mill');
 else{const n=G.storyState.notes['briar.mill'];if(n&&q.current?.id==='briar.mill'&&q.current.text!==n.text){q.dismiss('briar.mill');q.push({id:'briar.mill',kind:'Journal updated',title:n.title,text:n.text});}}
}
function available(G,key){const m=G.briarMill;if(!m)return true;
 if(key==='briar.jam')return m.latched||m.water<.1;
 if(['briar.water','briar.mill.reset'].includes(key))return !m.latched;
 return true;
}
function grip(G,actor,p){const m=G.briarMill;if(!m||m.latched||m.owner&&m.owner!==actor)return false;
 if(m.owner){m.owner=null;m.offset=null;}else{m.owner=actor;m.offset={x:m.x-p.x,z:m.z-p.z};}
 sync(G);return true;
}
function reset(G,actor){const m=G.briarMill;if(!m||m.latched||m.owner&&m.owner!==actor)return false;Object.assign(m,CRATE,{owner:null,offset:null});sync(G);return true;}
function blocked(G,x,z){
 if(x<55||x>195||z<-1970||z>-1470)return true;
 const hit=o=>o!==G.briarMill.solid&&!o.nocol&&!o.disabled&&(o.y0||0)<62&&o.h>5&&Math.abs(x-o.x)<o.w/2+34&&Math.abs(z-o.z)<o.d/2+34;
 return G.obstacles.some(hit)||G.walls.some(hit);
}
function tick(G,dt,host,players,complete){const m=G.briarMill;if(!m)return;const f=G.storyState.flags;
 if(host){
  const p=players.find(p=>p.id===m.owner&&p.hp>0&&!p.dead&&!p.downed);
  if(m.owner){
   if(!p||Math.abs(p.y||0)>15||Math.hypot(p.x-m.x,p.z-m.z)>175){m.owner=null;m.offset=null;}
   else{const tx=p.x+m.offset.x,tz=p.z+m.offset.z,dx=tx-m.x,dz=tz-m.z,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/12));
    if(n<25)for(let k=0;k<n;k++){const x=m.x+dx/n,z=m.z+dz/n;if(blocked(G,x,z))break;m.x=x;m.z=z;}
   }
  }
  const weighted=Math.abs(m.x-PLATE.x)<35&&Math.abs(m.z-PLATE.z)<35;
  const standing=players.some(p=>p.hp>0&&!p.dead&&!p.downed&&Math.abs(p.y||0)<12&&Math.abs(p.x-PLATE.x)<52&&Math.abs(p.z-PLATE.z)<52);
  m.plate+=((weighted||standing||m.latched?1:0)-m.plate)*Math.min(1,dt*7);m.water=1-m.plate;
  m.docked=weighted?m.docked+dt:0;
  if(!m.latched&&m.docked>.55&&G.storyState.quests['briar.escape']==='active')complete('briar.mill.weighted');
 }
 if(f['briar.bridge'])m.bridge=Math.min(1,m.bridge+dt/1.6);
 m.wheel+=(f['briar.jam']?m.bridge*.7:Math.sin(G.time*3)*m.water*.12)*dt;
 sync(G);
}
function status(G){const m=G.briarMill;return m?{run:G.runSeed,area:G.area,x:m.x,z:m.z,owner:m.owner,plate:m.plate,water:m.water,bridge:m.bridge}:null;}
function apply(G,s){const m=G.briarMill;if(!m||!s||s.run!==G.runSeed||s.area!==G.area||![s.x,s.z,s.plate,s.water,s.bridge].every(Number.isFinite))return;Object.assign(m,{x:s.x,z:s.z,owner:s.owner||null,plate:Math.max(0,Math.min(1,s.plate)),water:Math.max(0,Math.min(1,s.water)),bridge:Math.max(0,Math.min(1,s.bridge))});if(G.storyState.flags['briar.bridge'])m.bridgeSeen=true;sync(G);}
function fallback(G,bx){const m=G.briarMill,w=root.__world3d?.();if(!m||root.__BRIAR_MILL_3D_ACTIVE&&root.HERO3D?.on&&root.HERO3D?.ready&&w?.on&&w?.ready)return;
 bx(m.x,31,m.z,66,62,66,'#a5804b');bx(PLATE.x,4-m.plate*3,PLATE.z,115,8,115,m.plate>.8?'#b9c87d':'#a89563');
 bx(300,37+(1-m.plate)*70,-1640,90,70,8,'#74664c');
 const a=(1-m.bridge)*Math.PI*.48;for(let i=0;i<11;i++){const d=20*i;bx(BRIDGE.x,8+Math.sin(a)*d,-2050-Math.cos(a)*d,190,8,18,'#aa8758');}
}
root.BFBriarJourney={build,sync,available,grip,reset,tick,status,apply,fallback,refreshNotices,CRATE,PLATE,BRIDGE};
if(typeof module!=='undefined')module.exports=root.BFBriarJourney;
})(typeof window!=='undefined'?window:globalThis);
