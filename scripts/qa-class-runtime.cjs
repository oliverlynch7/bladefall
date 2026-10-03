// Serve public/ on port 4338; run with playwright-cli run-code --filename.
async page=>{
 const errors=[];
 await page.route('**/*',r=>r.continue());
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.dialogueTTS=false;b.openHub();b.enterArena();window.auditBase=JSON.stringify(b.G.p);});
 const catalog=await page.evaluate(()=>Object.entries(__BF3.CLASS2).flatMap(([cls,c])=>[2,4,6,8].flatMap(rank=>['a','b'].map(side=>({cls,rank,side,id:c['r'+rank][side].id})))));
 const results=[];
 for(const item of catalog){
  const result=await page.evaluate(item=>{
   const b=__BF3,g=b.G;b.meta.classId=item.cls;const cs=b.classState(item.cls);cs.rank=10;
   for(let rank=2;rank<=9;rank++)cs.ch[rank]=b.CLASS2[item.cls]['r'+rank][item.side].id;
   g.p=JSON.parse(window.auditBase);const p=g.p;p.weapon=b.classStartWeapon(item.cls);p.hp=b.effMaxHp(p)*.5;p.maxMana=p.mana=1000;p.invuln=999;p.x=p.z=p.y=0;p.yaw=0;p.skillCd=[0,0,0,0];p.skillCdMax=[0,0,0,0];
   g.enemies=[];g.projectiles=[];g.minions=[];g.corpses=[];g.pet=null;g.petLost=false;g.combatArt=[];g._desig=false;g.camYaw=0;
   for(const x of [-50,0,50]){b.spawnEnemy('grunt',x,65,false);const e=g.enemies.at(-1);e.hp=e.maxHp=100000;e.speed=0;e.stunT=999;e.active=true;}
   try{b.useSkill(item.rank/2-1);const cast=p.skillCd[item.rank/2-1]>0;
    for(let n=0;n<210;n++){b.update(1/30);if(n%15===0){b.render(n/30);b.flushHero3D();}}
    const finite=[p.x,p.y,p.z,p.hp,p.mana,...p.skillCd,...g.enemies.map(e=>e.hp)].every(Number.isFinite);
    return {...item,cast,finite,damage:g.enemies.reduce((s,e)=>s+100000-e.hp,0),renderer:HERO3D.on};
   }catch(e){return {...item,error:e.stack};}
  },item);
  results.push(result);
  // Let real-time burst callbacks finish against the same hero, before replacing it.
  await page.waitForTimeout(1100);
 }
 return {classes:new Set(catalog.map(x=>x.cls)).size,skills:results.length,failures:results.filter(x=>x.error||!x.cast||!x.finite||!x.renderer),pageErrors:errors,results};
}
