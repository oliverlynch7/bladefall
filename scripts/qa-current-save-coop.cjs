async page=>{
 const results=[];
 for(const kind of ['host','join']){
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const before=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.introSeen=true;b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.run=null;b.meta.bank=null;b.openHub();b.G.p.level=12;b.meta.heroName='Current Warden';b.openPause();window.qaConnect=null;b.MP.host=(cb,pvp)=>{window.qaConnect={kind:'host',name:b.meta.heroName,level:b.meta.hero.level,pvp,slot:b.SLOT};};b.MP.join=(code,cb)=>{window.qaConnect={kind:'join',code,name:b.meta.heroName,level:b.G.p.level,slot:b.SLOT};};return {name:b.meta.heroName,slot:b.SLOT};});
 await page.locator('#multiplayerBtnP').click();if(kind==='join')await page.locator('#mpJoinCode').fill('ABC123');await page.locator(kind==='host'?'#mpHost':'#mpJoin').click();await page.waitForFunction(()=>!!window.qaConnect);
 const result=await page.evaluate(()=>({connection:qaConnect,picker:!!document.querySelector('[data-party-save]')}));if(result.picker||result.connection.name!==before.name||result.connection.slot!==before.slot||result.connection.level!==12)throw Error(JSON.stringify(result));results.push(result);
 }
 await page.evaluate(()=>{__BF3.MP.active=false;__BF3.openMPLobby();});await page.locator('#mpHost').click();await page.locator('[data-party-save]').first().waitFor();results.push({titlePickerPreserved:true});return results;
}
