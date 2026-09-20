async page => {
 if(!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(page.url()))throw Error('Local QA only');
 await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.classUnlocked.pirate=true;b.meta.classId='pirate';b.openHub();b.G.p.weapon=b.intrinsicWeapon('pirate');b.openMirror(()=>b.openHub());});
 await page.waitForFunction(()=>__hero3dWeapon()?.intrinsic==='pirate'&&!__hero3dSwapState().reArming);
 const results=[];
 for(const [pose,velocity,attack,saber,charge] of [['idle',0,0,0,0],['run',160,0,0,0],['aim',0,.3,0,0],['moving aim',160,.3,0,0],['charge',0,0,0,.8],['saber',0,.3,.3,0],['moving saber',150,.3,.3,0]]){
  await page.evaluate(v=>{const p=__BF3.mirror.p;Object.assign(p,{vx:v[0],vz:0,atkTimer:v[1],saberSwingT:v[2],chargeAmt:v[3],onGround:true});p.swingId=(p.swingId||0)+1;},[velocity,attack,saber,charge]);
  await page.waitForTimeout(190);
  const result=await page.evaluate(async()=>{const T=await import('./three.module.js'),root=HERO3D._wrap,gun=root.getObjectByName('PirateFlintlock'),blade=root.getObjectByName('PirateSaber');root.updateMatrixWorld(true);
   const palm=o=>{const hand=o.parent,pts=[];root.traverse(m=>{if(!m.isSkinnedMesh)return;const side=o===gun?'R':'L',ids=new Set(m.skeleton.bones.map((b,i)=>/^Fist/.test(b.name)&&b.name.endsWith(side)?i:-1).filter(i=>i>=0)),si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight;for(let i=0;i<si.count;i++){let w=0;for(let k=0;k<4;k++)if(ids.has(si.getComponent(i,k)))w+=sw.getComponent(i,k);if(w>.7)pts.push(hand.worldToLocal(m.getVertexPosition(i,new T.Vector3()).applyMatrix4(m.matrixWorld)));}});const box=new T.Box3().setFromPoints(pts);return {inside:box.containsPoint(o.position),distance:box.getCenter(new T.Vector3()).distanceTo(o.position)};};
   const forward=new T.Vector3(0,0,1).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));return {gun:palm(gun),saber:palm(blade),forward:new T.Vector3(1,0,0).applyQuaternion(gun.getWorldQuaternion(new T.Quaternion())).dot(forward),clip:HERO3D.clip,error:HERO3D.err};});
  if(result.error||!result.gun.inside||!result.saber.inside)throw Error(pose+' grip outside hand '+JSON.stringify(result));
  if(pose.includes('aim')&&result.forward<.97)throw Error('Muzzle backward '+pose);
  results.push({pose,...result});
 }
 await page.evaluate(()=>Object.assign(__BF3.mirror.p,{vx:0,atkTimer:0,saberSwingT:0,chargeAmt:0}));
 return results;
}
