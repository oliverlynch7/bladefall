async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4330/3d/?mute=1&visualqa=1&hostile=2');const out=[];
 for(const name of ['Brute','Marksman','The Fallen','Frost Sorcerer','Ember Colossus','Abyss King','Marble Colossus','Awakened King']){
  await page.locator('#visual-qa-panel').evaluate(e=>e.open=true);await page.getByRole('button',{name,exact:true}).dispatchEvent('click');await page.waitForTimeout(600);
  await page.evaluate(()=>{const a=__BF3,g=a.G,e=g.boss;a.meta.tutOff=true;a.meta.autoAttack=false;a.meta.quality='high';g.p.invuln=99999;g.enemies=[e];e.active=true;e.dropT=0;e.speed=0;Object.assign(e,{atkTimer:999,shootT:999,slamCd:0,cleaveCd:0,novaCd:0,poundCd:0,quakeCd:0,pinCd:0,beamCd:0,stunT:0,courtCd:0});Object.assign(g.p,{x:e.x,z:e.z+240,y:e.y||0,vx:0,vy:0,vz:0});Object.assign(g.cam,{x:g.p.x,z:g.p.z,y:g.p.y});g.camYaw=Math.PI;g.camPitch=.38;if(e.type==='tyrant'){e.phase=2;e.tileCd=0;e.windT=.85;e.windMax=.85;e.teleX=0;e.teleZ=1;}});
  await page.waitForTimeout(180);await page.locator('#visual-qa-panel').evaluate(e=>e.open=false);await page.screenshot({path:`output/playwright/hostile/${name.replaceAll(' ','-').toLowerCase()}.jpg`,type:'jpeg',quality:82});
  await page.waitForTimeout(900);await page.screenshot({path:"output/playwright/hostile/"+name.replaceAll(' ','-').toLowerCase()+"-impact.jpg",type:'jpeg',quality:82});
  out.push(await page.evaluate(name=>({name,type:__BF3.G.boss.type,theme:__BF_WORLD().theme,stats:__combatArtStats,world:__world3d().err,mobs:__mob3d().err}),name));
 }
 return {out,errors};
}


