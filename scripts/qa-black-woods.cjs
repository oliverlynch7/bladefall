async page=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();b.enterZone(0);b.collectRiftShard('BR-01');b.nextArea();b.meta.camMode='far';b.meta.tutOff=true;for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;const p=b.G.p,checks=[],walks=[];const ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
function walk(x,z,jump=false){
 const platform=b.G.obstacles.find(o=>o.kind==='plat'&&o.x===x&&o.z===z)||b.G.obstacles.find(o=>o.woodsSignalDeck&&Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2),height=platform?.h||0;
 const source=b.G.obstacles.find(o=>o.kind==='plat'&&Math.abs(o.h-p.y)<4&&Math.abs(p.x-o.x)<o.w/2&&Math.abs(p.z-o.z)<o.d/2);
 if(jump&&(source?.woodsSignalPerch||source?.woodsSignalDeck)&&Math.hypot(x-p.x,z-p.z)>50){
  const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz),ux=dx/d,uz=dz/d;
  const edgeX=Math.abs(ux)<.01?Infinity:((ux>0?source.x+source.w/2-16:source.x-source.w/2+16)-p.x)/ux;
  const edgeZ=Math.abs(uz)<.01?Infinity:((uz>0?source.z+source.d/2-16:source.z-source.d/2+16)-p.z)/uz;
  const run=Math.max(0,Math.min(edgeX,edgeZ)*.88),startX=p.x,startZ=p.z;
  for(let i=0;i<120&&Math.hypot(p.x-startX,p.z-startZ)<run&&p.onGround;i++){b.input.jx=ux;b.input.jz=uz;b.update(.016);}
 }
 let launched=false;
 for(let i=0;i<1600;i++){
  const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);
  if(d<22&&(!jump||p.onGround&&Math.abs(p.y-height)<4))break;
  b.input.jx=d>15?dx/d:0;b.input.jz=d>15?dz/d:0;
  if(jump&&!launched&&p.onGround&&d>40){b.input.jump=true;b.input.jumpEdge=true;launched=true;}
  b.update(.016);
 }
 b.input.jx=b.input.jz=0;b.input.jump=false;
 const good=Math.hypot(x-p.x,z-p.z)<32&&(!jump||p.onGround&&Math.abs(p.y-height)<4);
 walks.push({x,z,at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],good});if(!good)throw Error(JSON.stringify(walks));
}
const act=key=>b.briarRequest('world',{key});function choose(choice){b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice})}
ok('new half has Lewis and no old fetch clutter',b.G.storyNpcs[0].id==='lewis'&&!b.G.qmarks.length&&!b.G.thorns.length);ok('exit initially locked',!b.G.portal);
walk(-100,180);b.briarRequest('open',{npc:'lewis'});choose('prisoners');choose('route');choose('go');b.briarRequest('close');ok('Lewis opens both signal approaches',b.G.storyState.flags['woods.ready']);
walk(0,-650);walk(560,-740);for(const [x,z]of b.G.blackWoods.climb)walk(x,z,true);for(const [x,z]of b.G.blackWoods.upper){if(z>=-1800)walk(x,z,true);}for(const [x,z]of b.G.blackWoods.loft)walk(x,z,true);walk(1480,-1950,true);for(let i=0;i<80;i++)b.update(.016);ok('loft shard reachable',b.takeWorldRiftShard('BR-03')==='found');
walk(1390,-1850,true);for(const [x,z]of [...b.G.blackWoods.loft].reverse())walk(x,z,true);for(const [x,z]of b.G.blackWoods.upper){if(z<-1800)walk(x,z,true);}for(const [x,z]of b.G.blackWoods.cross)walk(x,z,true);walk(0,-3070);act('woods.signal.cable');ok('upper cable opens required exit',b.G.storyState.flags['woods.signal']&&!!b.G.portal);
for(const [x,z]of b.G.blackWoods.down)walk(x,z);walk(-650,-3680);walk(0,-3680);walk(0,-3500);walk(550,-3500);walk(370,-3500);walk(370,-3390);ok('hidden supply nook shard reachable',b.takeWorldRiftShard('BR-05')==='found');
Object.assign(p,{x:-650,z:-1850,y:0});walk(-1850,-2100);walk(-1770,-2050);act('woods.tracks.clue');ok('track clue stored',!!b.G.storyState.notes['woods.tracks']);
const release=b.G.storyObjects.find(o=>o.key==='woods.tracks.release');Object.assign(p,{x:release.x,z:release.z,y:0});act(release.key);ok('ground cannot release high binding',!b.G.storyState.flags['woods.tracks.open']);Object.assign(p,{x:release.x,z:release.z,y:release.y});act(release.key);ok('high binding opens personal shard',b.G.storyState.flags['woods.tracks.open']);Object.assign(p,{x:-2130,z:-2530,y:0});ok('grove shard collected',b.takeWorldRiftShard('BR-04')==='found');
b.restartCampaignCheckpoint();b.openPause();ok('retry keeps first-half shard but removes woods gains',b.meta.riftShards.includes('BR-01')&&!b.G.pendingRiftShards?.found.length&&!b.G.storyState.flags['woods.signal']);return {checks,walks};});
await page.waitForTimeout(300);if(errors.length)throw Error(errors.join(';'));return result;
}

