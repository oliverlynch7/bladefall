async root=>{
 const context=await root.context().browser().newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[],models=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL/.test(m.text()))errors.push(m.text());});
 try{
 await page.goto('http://127.0.0.1:4345/prototypes/campaign-craft/preview.html');await page.waitForFunction(()=>window.__craftViewer);
 for(const model of await page.locator('#model option').evaluateAll(es=>es.map(e=>e.value))){await page.locator('#model').selectOption(model);await page.evaluate(()=>new Promise(requestAnimationFrame));const row=await page.evaluate(()=>__craftViewer);if(!(row.triangles>0))throw Error('Empty mesh '+model);models.push(row);}
 for(const [model,theme]of [['cottage','briar'],['furnace','ember'],['wreck','coast'],['rope-bridge','hollow'],['throne','castle']]){await page.locator('#model').selectOption(model);await page.locator('#theme').selectOption(theme);await page.waitForTimeout(100);await page.screenshot({path:'output/playwright/craft186-workshop-'+model+'.png'});}
 await page.locator('#model').selectOption('cottage');await page.locator('#theme').selectOption('briar');await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);await page.screenshot({path:'output/playwright/craft186-workshop-phone.png'});
 const phone=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,failure:getComputedStyle(document.querySelector('#failure')).display}));if(phone.scrollWidth>phone.width||phone.failure!=='none')throw Error('Viewer layout failed');if(errors.length)throw Error(errors.join('; '));return {models,phone,errors};
 }finally{await context.close();}
}
