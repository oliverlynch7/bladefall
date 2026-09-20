async page=>{
 if(!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(page.url()))throw Error('Local QA only');
 const rows=[],T=await page.evaluate(async()=>{window.qaGripTHREE=await import('./three.module.js');return true;});
 const classes=await page.evaluate(()=>Object.keys(__BF3.CLASSES));
 for(const cid of classes){
  await page.evaluate(cid=>{const b=__BF3;b.meta.classUnlocked[cid]=true;b.meta.classId=cid;b.G.p.weapon=b.classStartWeapon(cid);b.openMirror(()=>b.openHub());},cid);
  await page.waitForFunction(cid=>__hero3dSkin()?.classId===cid&&!__hero3dSwapState().reArming,cid);await page.waitForTimeout(180);
  for(const pose of ['idle','attack1','attack2','charge','run','cast1','cast2']){
   await page.evaluate(pose=>{const p=__BF3.mirror.p;Object.assign(p,{atkTimer:pose.startsWith('attack')?.2:0,swingId:pose==='attack2'?2:1,chargeAmt:pose==='charge'?.8:0,vx:pose==='run'?160:0,combatPose:pose.startsWith('cast')?{clip:pose==='cast1'?'Spell1':'Spell2',remaining:.5,serial:pose}:null});},pose);await page.waitForTimeout(110);
   const state=await page.evaluate(()=>{const T=window.qaGripTHREE,r=HERO3D._wrap,g=r.getObjectByName('WeaponPalmGrip')||r.getObjectByName('PirateFlintlock');if(!g)return {unarmed:true,error:HERO3D.err};r.updateMatrixWorld(true);const pts=[];r.traverse(m=>{if(!m.isSkinnedMesh)return;m.skeleton.update();const ids=new Set(m.skeleton.bones.map((b,i)=>/^Fist.*R$/.test(b.name)?i:-1).filter(i=>i>=0)),si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight;for(let i=0;i<si.count;i++){let w=0;for(let k=0;k<4;k++)if(ids.has(si.getComponent(i,k)))w+=sw.getComponent(i,k);if(w>.7)pts.push(g.parent.worldToLocal(m.getVertexPosition(i,new T.Vector3()).applyMatrix4(m.matrixWorld)));}});const b=new T.Box3().setFromPoints(pts);return {distance:b.distanceToPoint(g.position),clip:HERO3D.clip,error:HERO3D.err,weapon:__hero3dWeapon()?.name};});rows.push({cid,pose,...state});
  }
 }
 const failures=rows.filter(r=>r.error||r.distance>.015||r.unarmed&&r.cid!=='monk');return {classes:classes.length,checks:rows.length,failures};
}
