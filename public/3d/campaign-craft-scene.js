import * as T from './three.module.js';
import {craftModel,createCraftModel,craftCacheStats} from './campaign-craft-models.js?v=2187a';
import {trackCampaignOccluder,updateCampaignOccluders} from './campaign-scene.js?v=2182f';
import {buildCampaignJourneyArt} from './campaign-journey-art.js?v=2197';
let active=null;
const mappedKinds=new Set(['craft','shoreWreck','shoreShelter','shoreRock','thunderArch','iceResearch','forgeRack','forgeBench','forgeCrates','forgeLamp','forgePipe','forgeFrame']);
export const craftReplacesDeco=(d,w)=>enabled(w)&&(d.craftHidden||mappedKinds.has(d.kind));
function enabled(w){return !w.hub&&!w.trial&&!w.arena&&!w.bonus&&!w.side&&!w.endless&&!w.delve&&!w.briarBeta&&!w.devKeep&&new URLSearchParams(location.search).get('campaigncraft')!=='0';}
function themeFor(w){return w.zone==='outskirts'?'briar':w.zone==='abyss'?'coast':w.zone;}
export function attachCampaignCraft(parent,w,counts){
 if(!enabled(w)||!['outskirts','hollow','keep','frost','ember','abyss','palace','castle'].includes(w.zone)||w.finalStage==='void'||w.finalStage==='restored')return;
 const theme=themeFor(w),root=new T.Group();root.name='Campaign crafted environment';parent.add(root);
 const bins=new Map(),items=[],animated=[],occluders=[],groups=[],keys=new Set(),g=window.__BF3?.G;
 const add=(id,name,x,y,z,options={},yaw=0,scale=1,dynamic=null)=>{
  if(keys.has(id))throw Error('Duplicate campaign craft id '+id);keys.add(id);
  const records=craftModel(name,theme,options),matrix=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,yaw,0)),new T.Vector3(scale,scale,scale));
  const row={id,name,x,y,z,theme,options,triangles:records.reduce((n,r)=>n+r.tri,0)};items.push(row);
  if(dynamic){const node=createCraftModel(name,theme,options);node.position.set(x,y,z);node.rotation.y=yaw;node.scale.setScalar(scale);root.add(node);animated.push({node,step:dynamic,row});return node;}
  for(const r of records){const cell=Math.floor(x/500)+','+Math.floor(z/500),key=cell+'|'+r.geo.uuid;if(!bins.has(key))bins.set(key,{cell,r,list:[]});bins.get(key).list.push({matrix,row});}return null;
 };
 const fitting=(id,name,o,extra={})=>add(id,name,o.x,o.y0||0,o.z,{w:o.w||100,h:o.h||100,d:o.d||80,...extra},o.rot||0);
 for(const [i,d]of (w.deco||[]).entries()){
  const id='deco-'+i;
  if(d.kind==='craft'){const node=add(d.craftId||id,d.model,d.x,d.y0||0,d.z,d.options||{w:d.w,h:d.h,d:d.d},d.rot||0,d.scale||1,d.motion==='mill'?(node,world,game)=>{node.rotation.z=game.briarMill?game.briarMill.wheel:game.storyState?.flags?.['briar.water']?0:Math.sin(game.time*1.2)*.025;}:null);continue;}
  if(d.kind==='shoreWreck')fitting(id,'wreck',d,{port:d.x===-1320});
  else if(d.kind==='shoreRock')fitting(id,'rock',d);
  else if(d.kind==='shoreShelter'){
   // Keep the original roof height and open entrance clear; posts are at the
   // same four authored corners, with a proper gable above the existing roof.
   add(id,'roof',d.x,(d.y0||0)+d.h,d.z,{w:d.w+16,h:d.h*.3,d:d.d+16});
   for(const sx of [-1,1])for(const sz of [-1,1])add(id+'-post-'+sx+sz,'buttress',d.x+sx*d.w*.42,d.y0||0,d.z+sz*d.d*.42,{w:12,h:d.h,d:12});
  }else if(d.kind==='thunderArch')fitting(id,'arch',d);
  else if(d.kind==='iceResearch')fitting(id,d.h>90?'bookshelf':'laboratory',d);
  else if(d.kind==='forgeRack')fitting(id,'rack',d);
  else if(d.kind==='forgeBench')fitting(id,'workbench',d);
  else if(d.kind==='forgeCrates')add(id,'supplies',d.x,d.y0||0,d.z,{},0,Math.min(1.7,(d.w||80)/80));
  else if(d.kind==='forgeLamp')add(id,'brazier',d.x,d.y0||0,d.z,{},0,Math.max(.6,(d.h||60)/70));
  else if(d.kind==='forgeFrame')fitting(id,'arch',d);
  else if(d.kind==='forgePipe'){
   // Main pipe follows the old horizontal run, with elbows/supports at its ends.
   const pipe=add(id,'pipe',d.x,(d.y0||0)+d.h,d.z-d.d/2,{w:24,h:d.d,d:24},0,1,(n)=>{n.rotation.x=Math.PI/2;});
   for(const side of [-1,1]){add(id+'-riser'+side,'pipe',d.x,d.y0||0,d.z+side*d.d*.45,{w:28,h:d.h,d:28});add(id+'-valve'+side,'valve',d.x+19,(d.y0||0)+d.h*.55,d.z+side*d.d*.45,{w:30,h:30,d:10},Math.PI/2);}
  }
 }
 // Every light/timber detail added here has an authored owner. No random scatter.
 // Existing mature tree models remain the canopy; roots and small undergrowth
 // stay in their collider footprint, never across an adjacent path.
 for(const [i,d]of (w.deco||[]).entries())if(d.kind==='tree'&&d.lead&&(d.trunkH||d.h)>120){
  add('tree-root-'+i,'root',d.x,Math.max(0,(d.y0||0)-(d.trunkH||0)),d.z,{w:Math.min(d.w||70,85),h:25,d:Math.min(d.d||70,85)});
  if(i%3===0)add('tree-understory-'+i,'foliage',d.x,Math.max(0,(d.y0||0)-(d.trunkH||0))+1,d.z,{w:Math.min(d.w||65,75),h:22,d:60});
 }
 // Make constructed decks legible from below without changing their tops.
 // Only explicitly tagged construction receives these supports.
 for(const [i,o]of (w.obstacles||[]).entries())if(o.kind==='plat'&&!o.invisible&&(o.bridge||o.cargoBracket||o.freightClimb||o.shelfJump)){
  if(o.w>850||o.d>950||o.h<18)continue;
  add('deck-joints-'+i,'landing',o.x,o.h-5,o.z,{w:Math.max(10,o.w-8),h:16,d:Math.max(10,o.d-8)});
 }
 if(theme==='briar'){
  if(w.area===0&&!w.bruteOrchard){
   // Granary remains an open aisle: no roof is put across its camera opening.
   for(const z of [-130,305])add('barn-gable-'+z,'roof',1150,224,z,{w:515,h:74,d:24});
   for(const x of [889,1411])for(const z of [-100,85,270])add('barn-foot-'+x+z,'buttress',x,0,z,{w:27,h:89,d:34});
   for(const z of [-130,305])add('barn-hoist-'+z,'pulley',1150,249,z,{w:34,h:34,d:17});
   add('barn-winch','winch',1275,220,-78,{},0,.36);
   add('barn-rack','rack',1356,0,85,{w:65,h:69,d:28});
   for(const z of [-870,-1350])add('workshop-gable-'+z,'roof',-1500,212,z,{w:500,h:80,d:22});
   add('workshop-bench','workbench',-1340,0,-780,{w:120,h:35,d:48});
   add('old-stone-bridge','stone-bridge',230,80.7,-3490,{w:714,h:80,d:594,rails:false});

   // Contextual dressing on the existing orchard wagon, not an unrelated cart.
   const wagon=g?.storyObjects?.find(o=>o.kind==='wagon');if(wagon)add('orchard-wagon','wagon',wagon.x,wagon.y||0,wagon.z,{},0,.75);
   for(const d of w.deco||[])if(d.c==='#8a8062'&&d.w===13&&d.h===6)add('riverbank-'+d.x+','+d.z,'bank',d.x,d.y0||0,d.z,{w:13,h:6,d:d.d});
  }
  if(w.area===1){
   for(const [i,p]of w.obstacles.filter(o=>o.woodsSignalPerch||o.woodsSignalDeck).entries()){
    // New collars and tenons belong below the already detailed supported deck.
    for(const side of [-1,1])add('canopy-tenon-'+i+side,'counterweight',p.x+side*(p.w*.33),p.h-19,p.z,{w:14,h:12,d:Math.min(p.d-15,68)});
   }
   const signal=g?.storyObjects?.find(o=>o.key==='woods.signal.cable');if(signal){add('signal-roof','roof',signal.x,signal.y+150,signal.z,{w:195,h:60,d:135});add('signal-winch','winch',signal.x+30,signal.y+25,signal.z,{},0,.65);}
   for(const [i,o]of w.obstacles.filter(o=>o.woodsRootPerch).entries())if(i%2===0)add('root-trunk-'+i,'trunk',o.x,o.h-23,o.z,{w:o.w*.85});
  }
 }
 if(theme==='hollow'){
  if(w.area===0&&!w.marksmanCrossing){
   add('freight-crane','crane',20,0,-2570,{w:860,h:223,d:85,liveCable:true});
   add('freight-cart','wagon',-450,0,-2530,{freight:true},0,1,(n,world,game)=>{n.position.x=game.cliffs?.cartCollider?.x??-450;n.position.z=game.cliffs?.cartCollider?.z??-2530;});
   add('freight-pressure','pressure',-175,7,-2610,{w:138,h:10,d:128},0,1,(n,world,game)=>{n.position.y=7-5*(window.BFHollowCliffs?.cartProgress?.(game)||0);});
   add('freight-winch','winch',230,0,-2680,{},0,.85);

   add('cargo-pulley','pulley',-1550,282,-2160,{w:37,h:37,d:15});
   add('cargo-frame','crane',-1550,0,-2185,{w:180,h:285,d:75,liveCable:true});
   add('cliff-bridge','rope-bridge',0,0,-2800,{w:250,h:20,d:540},0,1,(n,world,game)=>{const k=game.cliffs,progress=game.storyState.flags['hp.bridge']?Math.max(0,Math.min(1,((game.time||0)-(k?.bridgeLowerAt??-Infinity))/1.5)):0;const angle=(1-progress*progress*(3-2*progress))*1.24;n.rotation.x=angle;n.position.set(0,5+270*Math.sin(angle),-2540-270*Math.cos(angle));});
  }else if(w.area===1){
   add('canyon-signal-winch','winch',0,180,-2600,{},0,2);
   for(const [id,c]of Object.entries(g?.canyon?.cages||{})){
    add('cage-back-'+id,'cell-front',c.x,c.y,c.z-95,{w:226,h:150,d:12});
    for(const side of [-1,1])add('cage-side-'+id+side,'cell-front',c.x+side*105,c.y,c.z,{w:190,h:150,d:12},Math.PI/2);
    add('cage-frame-'+id,'arch',c.x,c.y,c.z+95,{w:242,h:165,d:16});
    add('cage-door-'+id,'cell-front',c.x,c.y,c.z+95,{w:210,h:140,d:10},0,1,(n,world,game)=>{const flag=game.storyState.flags['lc.'+id]||(id==='north'&&game.storyState.flags['lc.north.open']);n.position.y=c.y+(flag?151:0);});
   }
   for(const [flag,z,y]of [['lc.entry',-940,70],['lc.escape',-4610,0]]){
    add('canyon-gate-'+flag,'arch',0,y,z,{w:430,h:205,d:30});
    add('canyon-bars-'+flag,'portcullis',0,y,z,{w:390,h:170,d:14},0,1,(n,world,game)=>{n.visible=!game.storyState.flags[flag];});
   }
   add('holding-wagon','prison-cart',1420,0,-2460,{},0,1.65,(n,world,game)=>{const open=game.storyState.flags['lc.wagon'];n.position.set(open?1550:1420,0,open?-2290:-2460);});
   for(const [i,[x,z,y]]of [[-320,-90,220],[-910,-700,120],[760,-1950,0],[-1200,-2500,0],[310,-4150,0],[2470,-3180,0]].entries())add('camp-supplies-'+i,'supplies',x,y+38,z,{},0,.65);
   for(const [i,[x,z]]of [[-680,-1770],[780,-2160]].entries())add('camp-roof-'+i,'roof',x,110,z,{w:225,h:58,d:180});
   add('shelter-tent','tent',0,0,-4090,{w:480,h:185,d:375,openAwning:true,existingPosts:true});
  }
 }
 if(theme==='keep'){
  if(w.keepScene==='broken-walls'){
   // Keep the central gate path empty; stone additions hug its existing wings.
   for(const x of [-700,700])add('keep-gate-tower-'+x,'buttress',x,0,-896,{w:60,h:250,d:70});
   add('keep-gate-arch','gatehouse',0,0,-900,{w:756,h:300,d:58,noTowers:true});
   for(const [id,x,z,y,width,height]of [['gate',0,-930,0,440,180],['cells',0,-4100,0,450,220],['workshop',1450,-2770,0,300,150]])add('keep-portcullis-'+id,'portcullis',x,y,z,{w:width,h:height,d:15},0,1,(n,world,game)=>{n.visible=!game.storyState.flags['rk.'+id];});
   add('workshop-anvil','workbench',1500,0,-3200,{w:115,h:50,d:65});
  }
  if(w.keepScene==='dungeons'){
   for(const [i,[x,z,y]]of [[-720,-950,180],[800,-1020,180],[-1100,-2130,180]].entries()){
    add('prison-stone-arch-'+i,'arch',x,y,z-140,{w:365,h:195,d:30});
    for(const side of [-1,1])add('cell-lamp-'+i+side,'sconce',x+side*149,y+119,z-112,{},0,.7);
   }
   for(const x of [-205,205])add('rescue-shaft-cap-'+x,'buttress',x,180,-2500,{w:35,h:315,d:35});
   add('rescue-hoist-pulley','pulley',0,490,-2500,{w:66,h:66,d:24});
   const rescue=g.movers.find(m=>m.prisonLift);if(rescue)add('rescue-deck','bridge',rescue.x,rescue.h,rescue.z,{w:rescue.w,h:18,d:rescue.d,rails:false},0,1,(n,world,game)=>{const m=game.movers.find(m=>m.prisonLift);if(m)n.position.set(m.x,m.h,m.z);});
   for(const [i,p]of (g?.prison?.presses||[]).entries())for(const x of [-265,265])add('press-gear-'+i+x,'pulley',x,148,p.z,{w:36,h:36,d:15},0,1,(n,world,game)=>{n.rotation.z=(game.prison?.clock||0)*.7;});
  }
  // Repeated cell/bar/gate details use the upgraded shared kit in all three scenes.
 }
 if(theme==='frost'){
  if(String(w.frostScene).startsWith('peaks')){
   for(const [i,d]of w.deco.entries())if(d.kind==='mountainAwning')add('snow-roof-'+i,'roof',d.x,d.y0+18,d.z,{w:d.w,h:65,d:d.d});
   for(const [i,d]of w.deco.entries())if(d.kind==='mountainCamp'){add('camp-barrel-'+i,'barrel',d.x+d.w*.32,d.y0,d.z-d.d*.3,{},0,.8);add('camp-station-'+i,'workbench',d.x,d.y0,d.z-d.d*.3,{w:95,h:38,d:48});}
  }else if(String(w.frostScene).startsWith('caves')){
   add('ice-entrance','cave-mouth',0,200,200,{w:1050,h:720,d:90});
   const valves=(g?.storyObjects||[]).filter(o=>['fill','freeze','drain'].includes(o.kind));
   for(const [i,o]of valves.entries()){
    add('waterworks-valve-'+i,'valve',o.x,(o.y||0)+49,o.z,{w:48,h:48,d:15},0,1,(n,world,game)=>{n.rotation.z=(game.iceCaves?.water||0)/88*Math.PI*.4;});
    add('waterworks-base-'+i,'pipe',o.x,(o.y||0),o.z-13,{w:29,h:55,d:29});
   }
   for(const [i,d]of w.deco.entries())if(d.kind==='iceResearch'&&d.h<90)add('lab-light-'+i,'lantern',d.x-d.w*.36,d.y0+d.h+1,d.z,{},0,.55);
  }
 }
 if(theme==='ember'){
  for(const [i,d]of w.deco.entries())if(d.kind==='forgeBench'){add('forge-bellows-'+i,'bellows',d.x+d.w*.31,d.y0+d.h+1,d.z,{w:42,h:30,d:23});}
  if(String(w.ironScene).startsWith('furnace')){
   add('furnace-plinth','wall',160,-220,-3470,{w:600,h:380,d:290});
   add('great-fire-chamber','furnace',160,160,-3470,{w:560,h:365,d:230});
   for(const side of [-1,1]){add('furnace-exhaust-'+side,'pipe',160+side*290,160,-3500,{w:49,h:400,d:49});add('furnace-bellows-'+side,'bellows',160+side*260,160,-3340,{w:65,h:80,d:47});}
   add('cooling-wheel','valve',-280,249,-4840,{w:62,h:62,d:18},0,1,(n,world,game)=>{n.rotation.z=game.furnace?.pedalHeld?(game.furnace.clock||0)*.6:0;});
   for(const x of [-210,530])add('furnace-channel-bank-'+x,'wall',x,110,-3470,{w:29,h:48,d:1090});
   for(const [i,m]of (g?.movers||[]).filter(m=>m.furnaceCache).entries())add('cooling-piston-'+i,'counterweight',m.x,m.h-35,m.z,{w:30,h:26,d:31},0,1,(n,world,game)=>{const live=game.movers.find(v=>v===m);if(live)n.position.set(live.x,live.h-35,live.z);});
  }else if(w.ironScene!=null){
   for(let i=0;i<2;i++){
    const z=-2190-i*320;add('forge-press-'+i,'press',900,300,z,{w:320,h:290,d:100,frameOnly:true});
    add('forge-hammer-'+i,'counterweight',900,460,z,{w:190,h:40,d:125},0,1,(n,world,game)=>{const h=window.BFIronHalls.phase(game.iron?.clock||0,i),stopped=game.storyState.flags['ih.line.open'];n.position.y=280+(stopped?180:h.hit?18:h.warn?150:180);});
    add('forge-drive-'+i,'pipe',900,460,z,{w:25,h:140,d:25},0,1,(n,world,game)=>{const h=window.BFIronHalls.phase(game.iron?.clock||0,i),height=game.storyState.flags['ih.line.open']?180:h.hit?18:h.warn?150:180;n.position.y=300+height+20;n.scale.y=Math.max(.2,(575-n.position.y)/140);});
   }
  }
 }
 if(theme==='coast'){
  if(String(w.shipScene).startsWith('shore')){
   add('salvage-crane','crane',-1430,300,-2240,{w:555,h:230,d:115,liveCable:true});
   add('salvage-winch','winch',-1560,302,-2170,{},0,.8);
   add('shore-ballista','ballista',-1510,130,-3310,{},Math.PI/2,1.8);
   for(const [i,[x,z,y]]of [[-420,-70,30],[-70,-120,30],[330,-60,30],[-1830,-3400,130]].entries())add('dock-rope-'+i,'bollard',x,y,z);
   add('otto-workbench','workbench',300,30,-320,{w:150,h:50,d:75});
  }
 }
 if(theme==='palace'){
  if(w.area===0&&w.palaceScene!=null&&!String(w.palaceScene).startsWith('guardian')){
   add('court-fountain','fountain',0,200,-1470,{w:178,h:72,d:178});
   for(const [i,o]of (g?.storyObjects||[]).filter(o=>o.kind.startsWith('mirror')).entries()){
    add('mirror-pedestal-'+i,'pipe',o.x,o.y,o.z,{w:32,h:59,d:32});
    add('sun-mirror-'+i,'mirror',o.x,o.y+92,o.z,{w:112,h:94,d:15},0,1,(n,world,game)=>{const mask=game.storyState.flags['pc.light.open']?5:game.storyState.items['pc.light.mask']||0;n.rotation.y=(mask&(1<<i)?Math.PI/4:-Math.PI/4)+Math.PI/2;});
   }
   add('sun-receiver','receiver',0,420,-4120,{w:125,h:127,d:30});
  }
  if(String(w.palaceScene).startsWith('library')){
   for(const [i,[x,z,y]]of (window.BFSkyLibrary?.shelfJumps||[[1790,-3910,375],[1910,-4040,390],[1820,-4180,405],[1940,-4270,420],[2080,-4360,420],[2180,-4390,420]]).entries()){
    add('folding-frame-'+i,'folding-shelf',x,285,z-64,{w:110,h:Math.max(65,y-260),d:19});
    add('hinged-leaf-'+i,'landing',x,y,z,{w:108,h:12,d:94},0,1,(n,world,game)=>{const f=game.storyState.flags,open=i<2?(f['sl.shelf.stage1']||f['sl.shelf.open']):f['sl.shelf.open'];n.rotation.x=open?0:Math.PI/2;n.position.set(x,open?y:y+47,open?z:z-47);});
    for(const side of [-1,1])add('shelf-hinge-'+i+side,'pulley',x+side*53,y-12,z-48,{w:17,h:17,d:9},Math.PI/2);
   }
  }
 }
 if(theme==='castle'){
  if(w.finalStage==='hall'){
   add('royal-throne','throne',0,0,-1020,{w:145,h:230,d:100});
   // Detail outside the already-visible single Hollow Gate, no new gate/reveal.
   for(const side of [-1,1])add('hollow-gate-buttress-'+side,'buttress',side*390,0,-1380,{w:100,h:720,d:110});
   for(let i=0;i<14;i++){const a=i*Math.PI/7;add('gate-jewel-'+i,'counterweight',Math.sin(a)*364,420+Math.cos(a)*431,-1340,{w:15,h:30,d:14},-a);}
  }else if(String(w.castleScene).startsWith('ascent')){
   for(const [i,p]of (window.BFLongAscent?.path||[]).entries())if(i%6===0&&!window.BFLongAscent.gaps.includes(i)){
    // Only below the true stair slabs, leaving player and jump volumes empty.
    add('spiral-corbel-'+i,'buttress',p[0],p[2]-59,p[1],{w:52,h:34,d:65},i/120*Math.PI*2-Math.PI/2);
   }
   for(const x of [1315,1525])add('service-lift-housing-'+x,'buttress',x,205,-170,{w:27,h:1100,d:32});
   add('service-hoist','winch',1420,1340,-170,{},0,1.1);
   for(const y of [320,1320])add('service-pulley-'+y,'pulley',1510,y,-170,{w:76,h:76,d:20});
  }else{
   add('castle-gatehouse','gatehouse',0,280,-5260,{w:1930,h:690,d:115,noTowers:true});
   add('castle-portcullis','portcullis',0,280,-5230,{w:955,h:520,d:25},0,1,(n,world,game)=>{n.visible=!game.storyState.flags['cg.entry'];});
   for(const side of [-1,1]){add('castle-entry-buttress-'+side,'buttress',side*880,280,-4740,{w:115,h:610,d:90});for(const y of [490,765])add('castle-window-'+side+y,'window',side*880,y-78,-4730,{w:86,h:156,d:12});}
  }
 }
 const journey=buildCampaignJourneyArt(w);if(journey)root.add(journey);
 const dummy=new T.Object3D();let triangles=0;
 for(const {cell,r,list}of bins.values()){
  const mesh=new T.InstancedMesh(r.geo,r.material,list.length);mesh.name='Craft '+list[0].row.name;mesh.castShadow=true;mesh.receiveShadow=true;
  list.forEach(({matrix,row},i)=>{mesh.setMatrixAt(i,matrix);trackCampaignOccluder(occluders,mesh,i,matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);groups.push({mesh,cell});triangles+=r.tri*list.length;
 }
 counts.craft={theme,models:items.length,triangles:triangles+animated.reduce((sum,a)=>sum+a.row.triangles,0),drawCalls:bins.size+animated.reduce((n,a)=>n+a.node.children.length,0),items,visibleDrawCalls:0};
 active={root,journey,world:w,counts:counts.craft,items,animated,occluders,groups,keys,cache:craftCacheStats()};
 const prior=parent.userData.dispose;parent.userData.dispose=()=>{prior?.();journey?.userData.dispose?.();for(const {mesh}of groups)mesh.dispose();if(active?.root===root){active=null;window.__CAMPAIGN_CRAFT=null;}};
 // Other art modules can import older cache-key copies of this module.
 // Publish the API from the instance that actually owns the scene, so fallback
 // geometry is suppressed by the rendered models rather than an idle import.
 exposeCraftApi();
 window.__CAMPAIGN_CRAFT={...counts.craft,cache:active.cache};
 updateCampaignCraft(w);
}
export function updateCampaignCraft(w){
 if(!active)return;const a=active,p=w.p,game=window.__BF3?.G;if(!p||!game)return;
 a.journey?.userData.update?.();let calls=0;const range=window.__BF_META?.().quality==='low'?850:1300;
 for(const q of a.groups){const [x,z]=q.cell.split(',').map(n=>(+n+.5)*500);q.mesh.visible=Math.hypot(x-p.x,z-p.z)<range+360;if(q.mesh.visible)calls++;}
 for(const q of a.animated){q.node.visible=true;q.step(q.node,w,game);q.node.visible=q.node.visible&&Math.hypot(q.node.position.x-p.x,q.node.position.z-p.z)<range+400;if(q.node.visible)calls+=q.node.children.length;}
 updateCampaignOccluders(a.occluders,w);a.counts.visibleDrawCalls=calls;if(window.__CAMPAIGN_CRAFT)window.__CAMPAIGN_CRAFT.visibleDrawCalls=calls;
}
function exposeCraftApi(){window.BFCampaignCraft={has:id=>!!(active&&window.HERO3D?.on&&window.__world3d?.()?.on&&active.keys.has(id)),stats:()=>window.__CAMPAIGN_CRAFT,snapshot:()=>active?{...active.counts,animated:active.animated.map(a=>({id:a.row.id,position:a.node.position.toArray(),rotation:a.node.rotation.toArray().slice(0,3),visible:a.node.visible})),kits:window.__CAMPAIGN_CRAFT_KITS}:null};}
