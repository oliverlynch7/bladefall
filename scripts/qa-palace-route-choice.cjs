async page=>{
 const checks=[],errors=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 const ctx=await page.context().browser().newContext(),other=await ctx.newPage();
 for(const p of [page,other])p.on('pageerror',e=>errors.push(e.message));
 try{
  for(const [p,side,route]of [[page,'west','lower'],[other,'east','upper']]){
   await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
   await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.tutOff=true;b.meta.camMode='far';b.openHub();b.enterZone(6);b.G.p.invuln=999;window.qaAct=k=>{const G=b.G,o=G.storyObjects.find(o=>o.key==='pc.'+k);Object.assign(G.p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key:o.key});};window.qaTalk=(id,choices)=>{const G=b.G,o=G.storyNpcs.find(o=>o.id===id);Object.assign(G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('open',{npc:id});for(const choice of choices)b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};});
   await p.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.court);
   const start=await p.evaluate(({side,route})=>{const b=__BF3,G=b.G;qaTalk('grace',['help','go']);qaAct('clamp');qaAct('water');if(route==='upper'){qaAct(side+'.upper');if(G.storyState.flags['pc.'+side])throw Error('Upper release ignored its guards');for(const e of G.enemies.filter(e=>e.courtGuard===side&&!e.dead)){Object.assign(G.p,{x:e.x-30,z:e.z,y:e.y});b.hitEnemy(e,99999,G.p,0,0);}}qaAct(side+'.'+route);const chosen=!!G.storyState.flags['pc.'+side],alternate=!!G.storyState.flags['pc.'+(side==='west'?'east':'west')],shared=!!G.storyState.flags['pc.route.open'],navigation=BFPartyNavigation.target(G)?.key;return {chosen,alternate,shared,navigation};},{side,route});
   ok(side+' '+route+' opens the route without requiring the other balcony',start.chosen&&start.shared&&!start.alternate);
   ok(side+' routes guidance to the mirrors',start.navigation==='pc.mirror.note');
   const travel=await p.evaluate(side=>{const b=__BF3,G=b.G,p=G.p,path=BFPalaceCourtyard.paths[side==='west'?'westGarden':'eastBalcony'],other=side==='west'?'east':'west';for(const e of G.enemies){e.dead=true;e.hp=0;}Object.assign(p,{x:path[0][0],z:path[0][1],y:path[0][2],vy:0,vx:0,vz:0,onGround:true});for(const q of path){let arrived=false;for(let i=0;i<2100;i++){const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<16&&Math.abs(p.y-q[2])<45){arrived=true;break;}b.input.jx=d>1?dx/d:0;b.input.jz=d>1?dz/d:0;b.update(.016);}if(!arrived)throw Error('Physical route blocked '+JSON.stringify({side,q,at:[p.x,p.y,p.z]}));}b.input.jx=b.input.jz=0;return {at:[p.x,p.y,p.z],chosenWall:G.walls.some(w=>w.courtTag===side),otherWall:G.walls.some(w=>w.courtTag===other)};},side);
   ok(side+' is physically traversable while the other barrier stays shut',!travel.chosenWall&&travel.otherWall);
   if(side==='west'){
    await p.evaluate(()=>{const b=__BF3,G=b.G;Object.assign(G.p,{x:200,z:-3980,y:420,vy:0});b.meta.camMode='shoulder';G.cam.x=200;G.cam.z=-3980;G.cam.y=420;G.camYaw=-Math.PI/2;G.camPitch=-.12;b.update(.016);});await p.waitForTimeout(5500);await p.screenshot({path:'output/playwright/palace-single-route-beam.png'});
   }
   const solved=await p.evaluate(()=>{const b=__BF3,G=b.G;qaAct('mirror.note');qaAct('mirror.0');qaAct('mirror.2');const lit=!!G.storyState.flags['pc.light.open']&&BFPalaceCourtyard.lightPath(G.storyState.items['pc.light.mask']).solved;qaAct('enter');return {lit,portal:!!G.portal,ready:!!G.storyState.flags['pc.ready']};});
   ok(side+' alone can solve the beam and reach the library',solved.lit&&solved.portal&&solved.ready);
   if(side==='west'){const optional=await p.evaluate(()=>{qaAct('east.lower');return {east:!!__BF3.G.storyState.flags['pc.east'],barrier:__BF3.G.walls.some(w=>w.courtTag==='east'),portal:!!__BF3.G.portal};});ok('the second balcony remains optional and usable afterward',optional.east&&!optional.barrier&&optional.portal);}
  }
  const saves=await other.evaluate(()=>{const b=__BF3,G=b.G,base={version:1,flags:{'pc.met':true,'pc.clamp':true,'pc.court':true,'pc.east':true},items:{},quests:{},notes:{},cursors:{},rewards:{},events:{}};G.storyState=BFStoryState.restore(base);b.briarSync();const partial={route:!!G.storyState.flags['pc.route.open'],quest:BFPalaceCourtyard.quest(G.storyState),arrow:BFPartyNavigation.target(G)?.key};G.storyState=BFStoryState.restore({...base,flags:{...base.flags,'pc.west':true,'pc.light.open':true,'pc.ready':true}});b.briarSync();const complete={route:!!G.storyState.flags['pc.route.open'],ready:BFPalaceCourtyard.ready(G.storyState),portal:!!G.portal};return {partial,complete};});
  ok('old one-balcony and completed saves remain traversable',saves.partial.route&&/sunbeam/.test(saves.partial.quest)&&saves.partial.arrow==='pc.mirror.note'&&saves.complete.route&&saves.complete.ready&&saves.complete.portal);
  ok('no browser errors',!errors.length);
  return {checks,saves,errors};
 }finally{await ctx.close();}
}
