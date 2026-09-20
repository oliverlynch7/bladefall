async page=>{
 if(!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(page.url()))throw Error('Local QA only');
 const results=[];
 for(const cid of ['ranger','ninja','pirate']){
  await page.evaluate(cid=>{const b=__BF3;b.meta.classId=cid;b.G.p.weapon=b.makeWeapon('javelin','rare');b.openMirror(()=>b.openHub());b.mirror.yaw=-.8;},cid);
  await page.waitForFunction(()=>__hero3dWeapon()?.name==='Spear'&&!__hero3dSwapState().reArming);await page.waitForTimeout(350);
  for(const [pose,timer,charge]of [['ready',0,0],['thrust',.12,0],['charge',0,.9]]){
   await page.evaluate(v=>{const p=__BF3.mirror.p;Object.assign(p,{atkTimer:v[0],chargeAmt:v[1],combatPose:null,vx:0,throwHideT:0});p.swingId=(p.swingId||0)+1;},[timer,charge]);await page.waitForTimeout(150);
   await page.screenshot({path:'C:/Users/Oliver/Documents/Codex/2026-09-08/o-2/work/bladefall-queue/output/playwright/javelin-'+cid+'-'+pose+'.png',clip:{x:300,y:180,width:580,height:610}});
  }
  const state=await page.evaluate(()=>{const b=__BF3,p=b.G.p;b.G.projectiles=[];b.chargeRelease(p,p.weapon,1);const packet=b.MP.selfState(),peer=b.MP.mkPeer(packet),relay=b.MP.snap(peer);b.MP.applyPos(peer,relay);Object.assign(b.mirror.p,{atkTimer:p.atkTimer,throwHideT:p.throwHideT,throwHideArche:p.throwHideArche,chargeAmt:0});return {projectile:b.G.projectiles.some(x=>x.shape==='javelin'),hidden:p.throwHideT>0,peer:peer.th>0&&peer.ta===p.weapon.arche&&peer.weapon.arche===p.weapon.arche,serial:peer.si===p.swingId};});await page.waitForTimeout(100);
  state.visible=await page.evaluate(()=>HERO3D._wrap.getObjectByName('WeaponPalmGrip')?.visible);
  if(!state.projectile||!state.hidden||!state.peer||!state.serial||state.visible)throw Error(cid+' release '+JSON.stringify(state));results.push({cid,...state});
  await page.screenshot({path:'C:/Users/Oliver/Documents/Codex/2026-09-08/o-2/work/bladefall-queue/output/playwright/javelin-'+cid+'-release.png',clip:{x:300,y:180,width:580,height:610}});
 }
 return results;
}
