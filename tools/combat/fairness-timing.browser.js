async(page)=>{
 await page.goto('http://127.0.0.1:4330/3d/?mute=1&visualqa=1&fairness=7');await page.getByRole('button',{name:'Outskirts',exact:true}).dispatchEvent('click');
 return await page.evaluate(()=>{
 const a=__BF3,g=a.G;a.meta.tutOff=true;a.meta.autoAttack=false;g.haz=null;g.enemies=[];g.pickups=[];g.waystone=null;g.qmarks=[];g.secret=null;g.healpads=[];g.chests=[];g.pet=null;
 const reset=()=>{g.enemies=[];g.projectiles=[];g.trails=[];g.shockwaves=[];g.particles=[];g.slowmo=0;Object.assign(g.p,{x:0,z:400,y:0,vx:0,vy:0,vz:0,hurtKbX:0,hurtKbZ:0,hp:100,invuln:0,dodgeTimer:0,thornT:0});};
 const step=n=>{for(let i=0;i<n;i++)a.update(1/60);};const out=[];
 for(const type of ['sporeback','emberling','toxling']){
  reset();const e=a.spawnEnemy(type,0,400);e.active=true;e.dropT=0;e.xp=0;a.hitEnemy(e,99999,g.p,0,0,null);g.pickups=[];g.slowmo=0;const start=g.p.hp;step(35);const safe=g.p.hp;if(safe!==start)throw Error(JSON.stringify({type,start,safe,trails:g.trails,last:g.lastHitBy,mode:a.mode,p:{x:g.p.x,y:g.p.y,z:g.p.z},hpmax:a.effMaxHp(g.p)}));step(40);out.push({type,start,safe,after:g.p.hp});if(g.p.hp>=start)throw Error(type+' never damages');
  reset();const f=a.spawnEnemy(type,0,400);f.active=true;f.dropT=0;f.xp=0;a.hitEnemy(f,99999,g.p,0,0,null);g.pickups=[];g.slowmo=0;a.input.jx=1;step(90);a.input.jx=0;if(g.p.hp!==100)throw Error(type+' cannot walk clear');
 }
 for(const type of ['grunt','dustjackal','revenant','frostling','caster']){
  reset();const e=a.spawnEnemy(type,0,400);e.active=true;e.dropT=0;e.spec=null;e.role=null;e.speed=0;e.shootT=99;step(30);if(g.p.hp!==100)throw Error(type+' contact early');step(20);if(g.p.hp===100)throw Error(type+' no strike');out.push({type,after:g.p.hp,wind:e.meleeW,cooldown:e.meleeCd});
 }
 reset();const e=a.spawnEnemy('caster',0,550);e.active=true;e.dropT=0;e.speed=0;e.shootT=0;step(1);if(g.projectiles.length)throw Error('instant shot');step(30);if(g.projectiles.length)throw Error('early shot');const aim={...e.shotAim};step(14);if(!g.projectiles.length)throw Error('no shot');out.push({projectileWindup:true,aim,projectiles:g.projectiles.length});
 return {out,mode:a.mode};
 });
}




