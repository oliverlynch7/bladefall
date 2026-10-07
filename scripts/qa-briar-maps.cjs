async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const out=[];
 for(const name of ['homefields','black-woods']){
  await page.goto(`http://127.0.0.1:4339/design/briar-beta/${name}-expansion.svg`);
  await page.screenshot({path:`output/playwright/briar-${name}-map.png`});
  out.push({name,title:await page.locator('svg > text').first().textContent(),labels:await page.locator('svg > text').count()});
 }
 await page.goto('http://127.0.0.1:4339/design/briar-beta/');
 const guide=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,maps:[...document.querySelectorAll('img')].slice(0,2).map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),play:!!document.querySelector('a[href="/3d/?devbriar=1"]')}));
 if(!guide.play||guide.maps.some(m=>!m.loaded))throw Error(JSON.stringify(guide));out.push({guide});
 if(errors.length)throw Error(errors.join('\n'));
 return out;
}
