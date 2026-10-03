// Serve public/ on isolated localhost:4338. _qa-prechange.html is the previous index.
// Run with playwright-cli run-code --filename scripts/qa-pyromancer-emotes.cjs.
async page=>{
 const base='http://127.0.0.1:4338/3d/',errors=[];
 await page.route('**/*',route=>route.continue()); // Do not reuse earlier QA revisions from cache.
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'_qa-prechange.html?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const before=await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.heroName='Regression';b.meta.gold=12345;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.dialogueTTS=false;b.cheatUnlockClasses();b.cheatRank10All();b.meta.classId='pyromancer';b.persist();return JSON.stringify([b.meta.heroName,b.meta.gold,b.meta.classes,b.meta.classUnlocked]);});
 await page.goto(base+'?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const combat=await page.evaluate(async before=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');
  if(before!==JSON.stringify([b.meta.heroName,b.meta.gold,b.meta.classes,b.meta.classUnlocked]))throw Error('Save changed');
  b.enterWaystation();const g=b.G,p=g.p;g.hub=false;p.weapon=b.makeWeapon('firestaff','common',1);p.invuln=999;
  b.spawnEnemy('grunt',p.x,p.z+65,false);const target=g.enemies[g.enemies.length-1];target.hp=target.maxHp=100000;target.speed=0;target.stunT=999;
  const results=[];
  const pump=()=>{for(let n=0;n<100;n++){b.update(.016);b.render(n/60);b.flushHero3D();}if(!HERO3D.on)throw Error('Hero renderer disabled');};
  p.yaw=0;g.camYaw=0;p.atkCd=0;b.playerAttack();pump();results.push('basic');
  b.chargeRelease(p,p.weapon,1);pump();results.push('charged');
  for(const side of ['a','b']){
   for(const rank of [2,3,4,5,6,7,8,9])b.classState('pyromancer').ch[rank]=b.CLASS2.pyromancer['r'+rank][side].id;
   for(let i=0;i<4;i++){
    target.x=p.x;target.z=p.z+65;target.y=p.y;target.dead=false;target.hp=100000;
    p.skillCd=[0,0,0,0];p.mana=1000;p.maxMana=1000;p.yaw=0;g.camYaw=0;
    const id=b.c2CurSkills()[i].id;b.useSkill(i);if(!(p.skillCd[i]>0))throw Error('Did not cast '+id);
    pump();results.push({id,damage:100000-target.hp,shield:p.shieldHp||0});
   }
  }
  g.enemies=[];g.combatArt=[];g.projectiles=[];p.pyInfernoT=0;p.shieldHp=0;p.combatPose=null;p.atkTimer=0;p.invuln=0;g.hub=true;
  return results;
 },before);
 const poses=[];
 for(const cid of ['warrior','ranger','mage','paladin','ninja','monk','pirate','reaper']){
  await page.evaluate(cid=>{const b=__BF3;b.meta.classId=cid;b.G.p.weapon=b.classStartWeapon(cid);b.G.p.emote=null;b.render(1);b.flushHero3D();},cid);
  await page.waitForTimeout(600);
  await page.waitForFunction(()=>HERO3D.ready&&!__hero3dSwapState().reArming);
  poses.push(await page.evaluate(()=>{
   const b=__BF3,p=b.G.p,root=HERO3D._wrap,checks=[];
   const point=name=>{const bone=root.getObjectByName(name),v=bone.position.clone();bone.getWorldPosition(v);return root.worldToLocal(v);};
   for(const [id] of BFEmotes.entries){
    BFEmotes.start(id);if(p.emote?.id!==id)throw Error('Cannot start '+id);
    const packet=b.MP.selfState(),peer=b.MP.mkPeer(packet);if(peer.motion?.emote?.id!==id)throw Error('Peer missing '+id);
    for(const t of [.1,.6,1.3,2.1,3.2,3.95]){
     p.emote.t=t;b.render(t);b.flushHero3D();if(!HERO3D.on)throw Error('Renderer failed '+id);
     root.traverse(n=>{if(n.isBone&&!n.quaternion.toArray().every(Number.isFinite))throw Error('Invalid bone '+n.name);if(n.userData?._weap&&n.visible)throw Error('Visible emote weapon '+n.name);});
     if(t===1.3&&id==='wave'&&point('FistR').y<point('Head').y)throw Error('Wave hand below head');
     if(t===1.3&&id==='cheer'&&['R','L'].some(s=>point('Fist'+s).y<point('Head').y))throw Error('Cheer hand below head');
    }
    BFEmotes.tick(b.G,'play',4.1,b.input);if(p.emote)throw Error('Emote did not expire');b.render(4.1);b.flushHero3D();checks.push(id);
   }
   for(const cause of ['move','attack','damage','jump']){
    p.vx=p.vz=0;p.atkTimer=0;p.onGround=true;BFEmotes.start('wave');p.emote.t=1;b.render(1);b.flushHero3D();
    const input={};if(cause==='move')input.up=true;if(cause==='attack')input.attack=true;if(cause==='damage')p.hp-=1;if(cause==='jump')p.onGround=false;
    BFEmotes.tick(b.G,'play',.016,input);if(p.emote)throw Error('Cancel '+cause);p.onGround=true;b.render(2);b.flushHero3D();
   }
   const attachments=[];root.traverse(n=>{if(n.userData?._weap&&!n.parent?.userData?._weap)attachments.push(n.visible);});
   if(attachments.length&&!attachments.some(Boolean))throw Error('Weapons not restored');
   return {cid:b.meta.classId,model:HERO3D.model,checks,attachments};
  }));
 }
 if(errors.length)throw Error(errors.join('\n'));
 return {save:'preserved',combat,poses,errors};
}
