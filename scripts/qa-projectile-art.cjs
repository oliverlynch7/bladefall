async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.continue());
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();b.enterArena();b.G.enemies=[];b.G.walls=[];b.G.obstacles=[];});
 const skills=await page.evaluate(()=>{
  const b=__BF3,g=b.G,p=g.p,rows=[];
  for(const cls of ['mage','pyromancer','stormcaller','chronomancer','necromancer','warlock','ninja','ranger','pirate','skylancer']){
   b.meta.classId=cls;b.classState(cls).rank=10;p.weapon=b.classStartWeapon(cls);p.mana=1000;p.maxMana=1000;p.skillCd=[0,0,0,0];g.projectiles=[];
   const sk=b.CLASS2[cls].r2.b;b.classState(cls).ch={2:sk.id};b.useSkill(0);b.render(1);b.flushHero3D();
   rows.push({cls,id:sk.id,projectiles:g.projectiles.length,tagged:g.projectiles.every(pr=>pr.fxClass===cls&&pr.fxSkill),art:window.__projectileArtStats});
  }return rows;
 });
 const thrown=[];
 for(const [cls,arche] of [['warrior','axe'],['ranger','javelin'],['ninja','knives'],['reaper','voidscythe']]){
  await page.evaluate(({cls,arche})=>{const b=__BF3,g=b.G,p=g.p;b.meta.classId=cls;b.classState(cls).rank=10;p.weapon=cls==='reaper'?b.classStartWeapon(cls):b.makeWeapon(arche,'legendary');p.weapon.el='frost';p.weapon.blade='#75ccd9';g.projectiles=[];p.yaw=0;b.chargeRelease(p,p.weapon,1);b.render(1);b.flushHero3D();},{cls,arche});
  await page.waitForTimeout(700);
  thrown.push(await page.evaluate(()=>{const b=__BF3;b.render(2);b.flushHero3D();return {art:window.__projectileArtStats,shots:b.G.projectiles.map(p=>({shape:p.shape,weapon:p.weapon}))};}));
 }
 const extra=await page.evaluate(()=>{
  const b=__BF3,g=b.G,m=b.MP;let packet;m.active=true;m.isHost=true;m.conns=[{open:true,send:p=>{packet=p;}}];g.combatArt=[];g.shockwaves=[];
  g.projectiles.push({owner:'player',x:0,y:20,z:0,vx:100,vy:0,vz:0,size:10,shape:'runeorb',fxClass:'mage',fxSkill:'m_bolt',life:1});
  m.sendCombat();g.projectiles=[];m.isHost=false;m.recvCombat({...packet,by:'qa-remote'});
  const coop=g.projectiles.some(p=>p.weapon?.art==='scythe')&&g.projectiles.some(p=>p.fxClass==='mage'&&p.fxSkill==='m_bolt')&&g.projectiles.every(p=>p.visual);
  m.active=false;m.conns=[];g.projectiles=[];b.render(3);b.flushHero3D();const cleanup=__projectileArtStats.pendingWeapons===0;
  b.meta.quality='low';for(let i=0;i<100;i++)g.projectiles.push({x:i*3,y:20,z:0,vx:100,shape:'orb',color:'#987bef',size:8,fxClass:'mage',fxSkill:'m_bolt'});b.render(3);b.flushHero3D();const low=__projectileArtStats.count===40&&__projectileArtStats.batches<=5;b.meta.quality='high';
  return {coop,cleanup,low};
 });
 if(errors.length||skills.some(s=>!s.tagged||!s.projectiles||s.art.count!==s.projectiles)||thrown.some(s=>s.art.weaponModels!==1)||Object.values(extra).some(x=>!x))throw Error(JSON.stringify({skills,thrown,extra,errors}));
 return {skills,thrown,extra,errors};
}
