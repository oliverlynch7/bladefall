async page=>{
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.__storageAtBoot=Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]));});await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});
 // Ordinary title navigation persists normalized default keybinds once. Establish
 // that no-beta baseline before asserting the isolated preview leaves it intact.
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});
 const before=await page.evaluate(()=>{localStorage.setItem('briar-beta-sentinel','unchanged');return Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]));});
 await page.goto('http://127.0.0.1:4338/3d/?devbriar=1&mute=1');await page.waitForFunction(()=>document.getElementById('bstart'),null,{polling:100});
 await page.evaluate(()=>{if(localStorage.getItem('briar-beta-sentinel'))throw Error('Read campaign storage');document.getElementById('bstart').click();__BF3.meta.gold=99999;__BF3.persist();BFBriarBeta.progress.medicine=true;BFBriarBeta.progress.shards.push('home-roof');BFBriarBeta.death();document.getElementById('bb0').click();if(!BFBriarBeta.progress.medicine||BFBriarBeta.progress.shards.length!==1)throw Error('Retry lost progress');BFBriarBeta.start();if(BFBriarBeta.progress.shards.length)throw Error('Reset retained prior discoveries');});
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});const after=await page.evaluate(()=>window.__storageAtBoot);if(JSON.stringify(before)!==JSON.stringify(after)){const keys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>before[k]!==after[k]);throw Error('Campaign storage changed: '+keys.join(', '));}return {allKeysUnchanged:true,retryRetainsProgress:true,resetClearsProgress:true};
}
