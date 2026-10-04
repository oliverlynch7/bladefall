async page=>{
 if(!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(page.url()))throw Error('Local QA only');
 await page.setViewportSize({width:1280,height:900});await page.reload();await page.waitForFunction(()=>window.HERO3D?.ready);
 await page.evaluate(async()=>{await __BF3.briarReady;__BF3.meta.hubTutDone=true;__BF3.loadMode('rl');__BF3.meta.classUnlocked.warrior=true;__BF3.meta.hubTutDone=true;__BF3.meta.introSeen=true;__BF3.openHub();});
 const matrix=['common','rare','epic'].map((rarity,i)=>({cid:'warrior',art:'hammer',name:['Hammer_Small','Hammer_Double','Hammer_Double_Golden'][i],model:'Warrior',rarity}));
 const results=[];
 for(const item of matrix){
  await page.evaluate(({cid,art,rarity})=>{const b=__BF3;b.meta.classUnlocked[cid]=true;b.meta.classId=cid;b.G.p.weapon={art,arche:art,rarity,name:art};if(cid==='reaper')b.G.p.weapon=b.intrinsicWeapon(cid);b.openMirror(()=>b.openHub());b.mirror.yaw=-.65;Object.assign(b.mirror.p,{vx:0,atkTimer:0,saberSwingT:0,chargeAmt:0,onGround:true});},item);
  await page.waitForFunction(n=>__hero3dWeapon()?.name===n&&!__hero3dSwapState().reArming,item.name);await page.waitForTimeout(180);
  const poses=[];
  for(const [pose,vx,attack,charge]of [['idle',0,0,0],['walk',75,0,0],['run',160,0,0],['charge',0,0,.9],['attack start',0,.23,0],['attack middle',0,.12,0],['moving attack',160,.05,0]]){
   await page.evaluate(v=>{const p=__BF3.mirror.p;Object.assign(p,{vx:v[0],atkTimer:v[1],chargeAmt:v[2],throwHideT:0});if(v[3]==='attack start')p.swingId=(p.swingId||0)+1;},[vx,attack,charge,pose]);await page.waitForTimeout(90);
   const state=await page.evaluate(async()=>{const T=await import('./three.module.js'),{PALMS}=await import('./weapon-grips.js?v=2108'),r=HERO3D._wrap,g=r.getObjectByName('WeaponPalmGrip');if(!g)return {error:'Missing anatomical grip'};r.updateMatrixWorld(true);const profile=g.userData.gripProfile,q=g.getWorldQuaternion(new T.Quaternion()),rq=r.getWorldQuaternion(new T.Quaternion()),axis=new T.Vector3(0,1,0).applyQuaternion(q);let supportError=0;if(profile.support>0||profile.kind==='bow'){const l=r.getObjectByName('Fist1L'),a=g.localToWorld(new T.Vector3(profile.kind==='bow'?g.getObjectByName('BowString').geometry.attributes.position.getX(1):(profile.supportX||0),profile.kind==='bow'?0:profile.support,0)),h=l.localToWorld(new T.Vector3().fromArray(PALMS[HERO3D.model].left));supportError=h.distanceTo(a)/HERO3D.scale;}return {supportError,up:axis.dot(new T.Vector3(0,1,0).applyQuaternion(rq)),forward:axis.dot(new T.Vector3(0,0,1).applyQuaternion(rq)),error:HERO3D.err,clip:HERO3D.clip,finite:g.matrixWorld.elements.every(Number.isFinite)};});
   poses.push({pose,...state});
  }
  await page.evaluate(()=>Object.assign(__BF3.mirror.p,{vx:0,atkTimer:0,chargeAmt:0}));await page.waitForTimeout(180);
  await page.screenshot({path:'C:/Users/Oliver/Documents/Codex/2026-09-08/o-2/work/bladefall-queue/output/playwright/weapon-'+item.model+'-'+item.name+'.png',clip:{x:300,y:180,width:580,height:610}});
  results.push({...item,poses});await page.evaluate(r=>window.qaGripResults=r,results);
 }
 const failures=results.flatMap(r=>r.poses.filter(p=>p.error||!p.finite||p.supportError>.04||p.pose==='idle'&&(p.up<.4||p.forward<.05)).map(p=>({name:r.model+'|'+r.name,...p})));
 return {fits:results.length,poseChecks:results.reduce((n,r)=>n+r.poses.length,0),failures};
}
