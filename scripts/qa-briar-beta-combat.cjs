async page=>{
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:4338/3d/?devbriar=1&mute=1');await page.waitForFunction(()=>document.getElementById('bstart'),null,{polling:100});await page.locator('#bstart').click();
 return page.evaluate(()=>{const b=__BF3,g=b.G,p=g.p,results=[];g.enemies=[];for(const q of g.devBriar.groups)q.spawned=true;
 for(const type of ['prison_pike','prison_guard','prison_hound','prison_maw']){
  g.enemies=[];g.boss=null;b.releaseKeyboard();Object.assign(p,{x:0,z:200,y:0,vx:0,vy:0,vz:0,hp:5000,invuln:0,dead:false,onGround:true});const e=b.spawnEnemy(type,0,110);Object.assign(e,{active:true,hp:300,maxHp:300,dmg:10});
  const before=p.hp;for(let i=0;i<280;i++)b.update(1/60);if(p.hp>=before)throw Error(type+' never damaged player');
  const hp=e.hp;Object.assign(p,{x:e.x+45,z:e.z,y:e.y,yaw:-Math.PI/2,atkCd:0,invuln:999});b.playerAttack();for(let i=0;i<50;i++)b.update(1/60);if(e.hp>=hp)throw Error(type+' did not take normal attack damage');results.push({type,playerDamage:before-p.hp,enemyDamage:hp-e.hp,move:e.pcMove});
 }
 return {results};});
}
