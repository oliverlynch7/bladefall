async page=>{
 if(!/^http:\/\/127\.0\.0\.1:4331\//.test(page.url()))throw Error('Local only');
 await page.waitForFunction(()=>window.HERO3D?.ready);await page.evaluate(()=>{__BF3.loadMode('rl');__BF3.meta.introSeen=true;__BF3.openHub();});
 await page.setViewportSize({width:1280,height:900});
 const releases=await page.evaluate(()=>{const b=__BF3,rows=[];for(const [cid,key] of [['warrior','sword'],['warrior','great'],['warrior','axe'],['warrior','hammer'],['ranger','bow'],['ranger','knives'],['ranger','javelin'],['mage','firestaff'],['mage','frostwand'],['paladin','sunblade']]){b.meta.classId=cid;const w=b.makeWeapon(key,'rare');if(!w||!b.classFamilyOk(w))continue;const p=b.G.p;p.weapon=w;p.swingId=100;for(let i=0;i<3;i++){b.G.projectiles=[];const prev=p.swingId;b.chargeRelease(p,w,1);if(p.swingId!==prev+1)throw Error(key+' serial '+p.swingId);rows.push({key,chg:w.chg,serial:p.swingId});}}return rows;});
 const dagger=[];
 for(const cid of ['ranger','ninja','pirate']){
 await page.evaluate(cid=>{const b=__BF3;b.meta.classId=cid;b.G.p.weapon=b.makeWeapon('knives','rare');b.openMirror(()=>b.openHub());b.mirror.yaw=-.8;},cid);
 await page.waitForFunction(()=>__hero3dWeapon()?.name==='Dagger_2'&&!__hero3dSwapState().reArming);await page.waitForTimeout(200);
 const state=await page.evaluate(()=>{const b=__BF3,p=b.G.p;b.G.projectiles=[];b.chargeRelease(p,p.weapon,1);const peer=b.MP.mkPeer(b.MP.selfState());b.MP.applyPos(peer,b.MP.snap(peer));Object.assign(b.mirror.p,{onGround:true,combatPose:null,atkTimer:p.atkTimer,combatPose:p.combatPose?{...p.combatPose}:null,swingId:p.swingId,throwHideT:p.throwHideT,throwHideArche:p.throwHideArche,chargeAmt:0});return {shape:b.G.projectiles[0]?.shape,token:b.G.projectiles[0]?.throwToken,peer:peer.th>0&&peer.ta===p.weapon.arche&&peer.si===p.swingId};});await page.waitForTimeout(100);
 state.hidden=await page.evaluate(()=>HERO3D._wrap.getObjectByName('WeaponPalmGrip')?.visible===false);state.clip=await page.evaluate(()=>HERO3D.clip);
 if(state.shape!=='dagger'||!state.token||!state.peer||!state.hidden||state.clip!=='Staff_Attack')throw Error(JSON.stringify(state));
 await page.screenshot({path:'output/playwright/dagger-release-'+cid+'.png'});
 await page.evaluate(()=>Object.assign(__BF3.mirror.p,{throwHideT:0,atkTimer:0,combatPose:null}));await page.waitForTimeout(150);state.restored=await page.evaluate(()=>HERO3D._wrap.getObjectByName('WeaponPalmGrip')?.visible===true);if(!state.restored)throw Error('Dagger did not return');dagger.push({cid,...state});
 }
 const rejected=await page.evaluate(()=>{const b=__BF3;b.meta.classId='warrior';const p=b.G.p,w=b.makeWeapon('knives','rare'),s=p.swingId;b.G.projectiles=[];b.chargeRelease(p,w,1);return p.swingId===s&&!b.G.projectiles.length;});if(!rejected)throw Error('Off-class release allowed');return {releases,dagger,rejected};
}

