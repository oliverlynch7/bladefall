async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4330/3d/?mute=1&visualqa=1&combatart=5');await page.getByRole('button',{name:'Outskirts',exact:true}).dispatchEvent('click');await page.waitForTimeout(500);
 const results=await page.evaluate(()=>{
  const a=__BF3,g=a.G,out=[];a.meta.tutOff=true;a.meta.autoAttack=false;g.enemies=[];g.p.invuln=99999;
  for(const [cls,def] of Object.entries(a.CLASS2))for(const rank of [2,4,6,8])for(const side of ['a','b']){
   a.meta.classId=cls;const cs=a.classState(cls);cs.rank=10;cs.ch={};for(const k of [2,3,4,5,6,7,8,9])cs.ch[k]=def['r'+k].a.id;cs.ch[rank]=def['r'+rank][side].id;
   g.enemies=[];g.combatArt=[];g.shockwaves=[];g.projectiles=[];g.particles=[];Object.assign(g.p,{x:0,y:0,z:520,yaw:Math.PI,mana:9999,skillCd:[0,0,0,0],atkTimer:0,dead:false});g.p.weapon=a.classStartWeapon(cls);
   for(let j=0;j<3;j++){const e=a.spawnEnemy('sporeback',(j-1)*25,450-j*8);e.active=true;e.dropT=0;e.hp=e.maxHp=100000;e.xp=0;}
   const id=def['r'+rank][side].fx;
   try{a.useSkill([2,4,6,8].indexOf(rank));out.push({id,events:g.combatArt.length,pose:g.p.combatPose?.clip,cd:g.p.skillCd[[2,4,6,8].indexOf(rank)],finite:g.combatArt.every(e=>[e.x,e.y,e.z,e.life].every(Number.isFinite))});}catch(e){out.push({id,error:e.message});}
  }
  g.enemies=[];return out;
 });
 await page.waitForTimeout(1200);return {results,errors,renderer:await page.evaluate(()=>({world:__world3d().err,hero:HERO3D.err,art:window.__combatArtStats}))};
}
