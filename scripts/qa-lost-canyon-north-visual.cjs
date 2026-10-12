async page=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const state=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.meta.tutOff=true;b.openHub();b.enterZone(1);b.nextArea();const G=b.G,p=G.p;p.invuln=999;
  const act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,y:o.y,z:o.z,vx:0,vz:0,vy:0});b.briarRequest('world',{key});};
  const talk=(id,choice)=>{const n=G.storyNpcs.find(n=>n.id===id);Object.assign(p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:id});b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};
  act('lc.orders');talk('ward','orders');talk('ruth','help');act('lc.alarm');for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.cage.north');
  for(let i=0;i<600&&G.canyon.northT<5;i++){const n=G.canyonPrisoners.find(n=>n.group==='north');Object.assign(p,{x:n.x,y:n.y,z:n.z+125,vx:0,vz:0,vy:0});b.update(.016);if(G.enemies.some(e=>e.canyonEscortWave&&!e.dead)){for(const e of G.enemies)if(e.canyonEscortWave){e.hp=0;e.dead=true;}}}
  b.render();return {t:G.canyon.northT,actors:G.canyonPrisoners.filter(n=>n.group==='north'||n.follow==='north').map(n=>({x:n.x,z:n.z,hp:n.hp})),player:{x:p.x,z:p.z},quest:BFLostCanyon.quest(G.storyState,G)};
 });await page.waitForFunction(()=>!BF_LOADING.active);await page.evaluate(()=>__BF3.render());await page.waitForTimeout(200);await page.screenshot({path:'output/playwright/lost-canyon-north-evac-lane.png'});return state;
}
