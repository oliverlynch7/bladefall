async page=>{
 await page.reload();await page.waitForFunction(()=>window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,{introSeen:true,hubTutDone:true,legendaryFound:1,totalKills:1000,beatHitless:true,bossRushCleared:true});b.meta.classUnlocked.warrior=true;b.meta.classUnlocked.reaper=true;b.openHub();});
 const results=[];
 for(const [cid,arche,name] of [['warrior','hammer','Hammer_Double'],['warrior','sword','Sword_2'],['ranger','bow','Bow_Wooden2'],['mage','firestaff','Staff_Wizard'],['reaper','intrinsic','Scythe'],['pirate','intrinsic','Flintlock & Saber']]){
  await page.evaluate(([cid,arche])=>{const b=__BF3;b.meta.classId=cid;b.meta.classUnlocked[cid]=true;b.G.p.weapon=arche==='intrinsic'?b.intrinsicWeapon(cid):b.makeWeapon(arche,'rare');b.openMirror(()=>b.openHub());b.mirror.yaw=-.65;},[cid,arche]);
  await page.waitForFunction(name=>__hero3dWeapon()?.name===name&&!__hero3dSwapState().reArming,name);
  for(const id of ['gold','blood','soul','perfect','gauntlet',null]){
   await page.evaluate(id=>__BF3.meta.cosEquipped.glow=id,id);await page.waitForTimeout(90);
   const result=await page.evaluate(async id=>{const {GLOW_COLORS}=await import('./weapon-glow.js?v=2109');const edges=[];HERO3D._wrap.traverse(o=>{if(o.userData.weaponGlowEdge)edges.push(o)});if(!edges.length||edges.some(e=>e.visible!==!!id))throw Error('Glow visibility '+id);if(id&&edges.some(e=>'#'+e.material.color.getHexString()!==GLOW_COLORS[id]))throw Error('Glow color');if(__BF3.cosmeticAppearance().glow!==id||__BF3.validCosmeticAppearance({glow:id}).glow!==id)throw Error('Network appearance');return edges.length;},id);
   results.push([arche,id,result]);
   if(arche==='hammer'&&id==='soul')await page.screenshot({path:'output/playwright/hammer-soul-glow.png'});
  }
 }
 return {checks:results.length,results};
}
