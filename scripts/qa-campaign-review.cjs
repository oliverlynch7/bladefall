async page=>{
 const results=[];
 for(const width of [390,1365]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4338/design/campaign-audit/');
  await page.locator('details').first().locator('summary').click();
  const check=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,details:document.querySelectorAll('details').length,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0)}));
  if(check.overflow||check.details!==18||!check.images)throw Error(JSON.stringify(check));
  results.push({width,...check});
  await page.screenshot({path:'output/playwright/campaign-review-'+width+'.png'});
 }
 for(const name of ['peaks.svg','caves.svg']){
  const r=await page.request.get('http://127.0.0.1:4338/design/campaign-audit/'+name);
  if(r.status()!==200||!(await r.text()).includes('<svg'))throw Error('Map missing '+name);
 }
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3,null,{polling:100});
 const start=page.locator('#tbegin');
 if(await start.isVisible())await start.click();
 await page.locator('#mmDev').click();
 await page.getByRole('link',{name:'Campaign review & Frostfell maps'}).click();
 if(!page.url().endsWith('/design/campaign-audit/'))throw Error('Dev link failed');
 return {layouts:results,maps:true,titleMenuLink:true};
}
