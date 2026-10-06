async page=>{
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.meta.hubUpgrades={};b.meta.gold=40000;b.openHub();});
 for(let i=0;i<25;i++){await page.evaluate(()=>{__BF3.update(.016);__BF3.renderFrame()});await page.waitForTimeout(100);}
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.screenshot({path:'output/playwright/hub-upgrades-before.png'});
 await page.evaluate(()=>__BF3.openShopMenu());
 const shop=await page.locator('.hubbuy').evaluateAll(bs=>bs.map(b=>({id:b.dataset.h,text:b.textContent})));
 for(const id of ['chess','braziers','banners','ramparts','gild']){await page.locator('.hubbuy[data-h="'+id+'"]').click();}
 const result=await page.evaluate(()=>{const b=__BF3;const walls=b.G.walls.filter(w=>String(w.hubFixture).startsWith('upgrade-'));const blocked=b.G.hubArt.approaches.filter(p=>walls.some(w=>Math.abs(w.x-p.x)<w.w/2+13&&Math.abs(w.z-p.z)<w.d/2+13));if(blocked.length)throw Error('Blocked approaches '+JSON.stringify(blocked));if(b.meta.gold!==13500)throw Error('Purchase cost mismatch '+b.meta.gold);b.openHub();return {gold:b.meta.gold,owned:b.meta.hubUpgrades,fixtures:walls.length,blocked};});
 for(let i=0;i<15;i++){await page.evaluate(()=>{__BF3.update(.016);__BF3.renderFrame()});await page.waitForTimeout(100);}
 await page.screenshot({path:'output/playwright/hub-upgrades-after.png'});
 await page.reload();await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 const saved=await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.openHub();return {gold:b.meta.gold,owned:b.meta.hubUpgrades,fixtures:b.G.walls.filter(w=>String(w.hubFixture).startsWith('upgrade-')).length};});
 if(JSON.stringify(saved.owned)!==JSON.stringify(result.owned)||saved.gold!==result.gold||saved.fixtures!==8)throw Error('Reload mismatch');
 return {shop,result,saved,errors};
}

