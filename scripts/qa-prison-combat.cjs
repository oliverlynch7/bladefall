async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.route('**/*',r=>r.continue());await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();b.startDelve('warrior');const g=b.G,p=g.p,rows=[];
  for(const id of [1,3,5,6,4]){const room=g.escape.plan.rooms[id];Object.assign(p,{x:room.x,y:0,z:room.z+80,hp:110,dead:false,invuln:999});BFPrisonRun.tick(.016);const list=g.enemies.filter(e=>e.prisonRoom===id);const start=list.map(e=>[e.x,e.z]);for(let k=0;k<180;k++)b.update(1/60);b.render();b.flushHero3D();rows.push({room:id,count:list.length,moved:list.some((e,i)=>Math.hypot(e.x-start[i][0],e.z-start[i][1])>2)});g.enemies.forEach(e=>{e.dead=true;e.hp=0;});g.time+=2;BFPrisonRun.tick(.016);}
  b.loadDelveFloor(2);p.hp=49;b.loadDelveFloor(3);if(p.hp!==49)throw Error('Floor healed');
  for(const cam of ['fps','shoulder','far']){b.meta.camMode=cam;b.render();b.flushHero3D();if(g.eye.y>=240)throw Error('Camera above roof');}
  b.meta.camMode='shoulder';b.render();b.flushHero3D();
  if(rows.some(r=>!r.count||!r.moved))throw Error(JSON.stringify(rows));return rows;
 });await page.screenshot({path:'output/playwright/prison-interior.png'});if(errors.length)throw Error(errors.join('\n'));return result;
}
