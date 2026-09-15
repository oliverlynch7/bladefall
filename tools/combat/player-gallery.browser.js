async(page)=>{
 await page.goto('http://127.0.0.1:4330/3d/?mute=1&visualqa=1&combatart=6');
 const classes=await page.evaluate(()=>Object.keys(__BF3.CLASS2));const shots=[];
 for(const cls of classes){
  await page.evaluate(cls=>{__BF3.meta.classId=cls;__BF3.meta.quality='high';},cls);
  await page.locator('#visual-qa-panel').evaluate(e=>e.open=true);
  await page.getByRole('button',{name:'Outskirts',exact:true}).dispatchEvent('click');await page.evaluate(cls=>{__BF3.meta.classId=cls;},cls);await page.waitForTimeout(650);
  for(const side of ['a','b']){
   const info=await page.evaluate(({cls,side})=>{const a=__BF3,g=a.G,p=g.p,def=a.CLASS2[cls],cs=a.classState(cls);a.meta.classId=cls;a.meta.tutOff=true;a.meta.autoAttack=false;cs.rank=10;cs.ch={};for(let r=2;r<=9;r++)cs.ch[r]=def['r'+r].a.id;cs.ch[8]=def.r8[side].id;
    g.enemies=[];g.combatArt=[];g.projectiles=[];g.shockwaves=[];g.particles=[];g.minions=[];g.pet=null;
    Object.assign(p,{x:0,z:520,y:0,yaw:Math.PI,vx:0,vy:0,vz:0,onGround:true,hp:999,maxHp:999,mana:9999,skillCd:[0,0,0,0],atkTimer:0,guardT:0,shieldHp:0,invuln:99999,dead:false});p.weapon=a.classStartWeapon(cls);
    Object.assign(g.cam,{x:0,z:520,y:0});g.camYaw=Math.PI;g.camPitch=.45;
    for(let j=0;j<3;j++){const e=a.spawnEnemy('sporeback',(j-1)*50,410);e.active=true;e.dropT=0;e.hp=e.maxHp=100000;e.xp=0;}
    a.useSkill(3);if(g.combatArt.at(-1)?.profile.id!==def.r8[side].id)throw Error('Wrong skill captured: '+cls);a.hudUpdate();a.skillbarUpdate();return {cls,id:def.r8[side].id,name:def.r8[side].n,events:g.combatArt.length};
   },{cls,side});
   await page.locator('#visual-qa-panel').evaluate(e=>e.open=false);await page.waitForTimeout(160);await page.screenshot({path:`output/playwright/combat/${cls}-${side}.png`});shots.push(info);
  }
 }
 return {shots,stats:await page.evaluate(()=>({art:__combatArtStats,world:__world3d().err,hero:HERO3D.err}))};
}
