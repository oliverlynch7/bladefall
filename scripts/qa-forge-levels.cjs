async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.dialogueTTS=false;b.openHub();});
 const checks=await page.evaluate(()=>{
  const b=__BF3,results=[];
  for(const [rarity,level] of [['common',5],['uncommon',12],['rare',20],['epic',30]]){
   for(const kind of ['weapon','armor','trinket']){
    const make=()=>kind==='weapon'?{weapon:b.makeWeapon('sword',rarity)}:kind==='armor'?{armor:b.makeArmor(rarity,'helmet')}:{trinket:b.makeTrinket(rarity,'ring')};
    b.meta.stash=[make(),make()];b.meta.hero.level=level-1;b.openForge(()=>{});
    if(!document.querySelector('[data-g]').disabled)throw Error('Locked boundary '+kind+rarity);
    b.meta.hero.level=level;b.openForge(()=>{});
    if(document.querySelector('[data-g]').disabled)throw Error('Unlocked boundary '+kind+rarity);
    results.push(kind+rarity);
   }
  }
  b.meta.hero.level=5;b.meta.stash=[...Array.from({length:4},()=>({weapon:b.makeWeapon('sword','common')})),...Array.from({length:2},()=>({weapon:b.makeWeapon('sword','uncommon')}))];b.openForge(()=>{});
  return results;
 });
 await page.locator('#forgeAllBtn').click();
 const batch=await page.evaluate(()=>{const b=__BF3;if(b.meta.stash.length!==4||b.meta.stash.some(it=>it.weapon.rarity!=='uncommon'))throw Error('Batch crossed cap/lost inputs');if(document.querySelector('#forgeAllBtn'))throw Error('Cascade unlocked');return true;});
 await page.screenshot({path:'output/playwright/forge-level-guide.png'});
 await page.evaluate(()=>{const b=__BF3;b.meta.hero.level=12;b.openForge(()=>{});});
 await page.locator('[data-g="0"]').click();await page.locator('#forgeGo').waitFor({state:'visible'});
 const single=await page.evaluate(()=>{const a=__BF3.meta.stash;if(a.length!==3||a.filter(i=>i.weapon.rarity==='rare').length!==1)throw Error('Single failed');return true;});
 if(errors.length)throw Error(errors.join('\n'));return {boundaries:checks.length,batch,single,errors};
}
