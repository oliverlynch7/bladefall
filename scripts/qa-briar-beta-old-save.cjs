// _qa-prechange.html must contain the previous committed index.html.
async originalPage=>{
 const context=await originalPage.context().browser().newContext();const page=await context.newPage();
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.route('**/*',r=>r.continue());
 await page.goto('http://127.0.0.1:4338/3d/_qa-prechange.html?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 const old=await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.heroName='Audit save';b.meta.gold=13579;b.meta.hubTutDone=true;b.meta.classUnlocked.warrior=true;
  for(const cls of Object.keys(b.CLASS2)){const cs=b.classState(cls);cs.rank=10;cs.ch=cs.ch||{};for(let r=2;r<=9;r++)cs.ch[r]=b.CLASS2[cls]['r'+r][r%2?'a':'b'].id;}
  b.persist();return JSON.stringify([b.meta.heroName,b.meta.gold,b.meta.classes,b.meta.classUnlocked]);});
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 const result=await page.evaluate(old=>{const b=__BF3;b.loadMode('rl');const unchanged=JSON.stringify([b.meta.heroName,b.meta.gold,b.meta.classes,b.meta.classUnlocked])===old;if(!unchanged)throw Error('Previous-version save changed');return {previousVersionSavePreserved:true,classes:Object.keys(b.CLASS2).length};},old);await context.close();return result;
}
