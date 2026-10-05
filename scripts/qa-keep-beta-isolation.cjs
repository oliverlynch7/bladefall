async page=>{
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 const before=await page.evaluate(()=>{localStorage.setItem('qa-keep-sentinel','untouched');return Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]));});
 await page.goto('http://127.0.0.1:4338/3d/?devkeep=1&mute=1');await page.waitForFunction(()=>window.__BF3&&document.getElementById('kstart'),null,{polling:100});
 const isolated=await page.evaluate(()=>{if(localStorage.getItem('qa-keep-sentinel'))throw Error('Beta read real storage');document.getElementById('kstart').click();__BF3.meta.gold=999999;__BF3.persist();localStorage.clear();__BF3.persist();BFKeepBeta.start();return !!window.BF_KEEP_ISOLATED;});
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});const after=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Real storage changed across beta');
 return {isolated,allRealStorageUnchanged:true,keys:Object.keys(before).length};
}
