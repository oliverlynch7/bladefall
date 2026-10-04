async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1120,height:820});
 await page.goto('http://127.0.0.1:4338/3d/animation-preview.html');await page.waitForFunction(()=>window.__animationQA?.().bones>0);
 await page.locator('#play').click();const checks=[];
 for(const model of ['grunt','sentinel','revenant','caster','frostlobber','sunpriest','dustjackal','thornboar','cragspitter']){
  await page.selectOption('#model',model);await page.waitForFunction(m=>__animationQA().type===m&&document.getElementById('status').textContent.includes(m),model);
  for(const clip of ['Windup','Attack','Recover','Hit','Move']){
   await page.selectOption('#clip',clip);
   for(const phase of [.01,.2,.5,.8,.99]){
    await page.locator('#scrub').fill(String(phase));await page.locator('#scrub').dispatchEvent('input');
    const q=await page.evaluate(()=>__animationQA());if(!q.finite||q.clip!==clip)throw Error(JSON.stringify(q));
   }checks.push(model+':'+clip);
  }
  if(['sentinel','caster','frostlobber','dustjackal'].includes(model)){
   await page.selectOption('#clip','Attack');await page.locator('#scrub').fill('0.2');await page.locator('#scrub').dispatchEvent('input');
   await page.waitForTimeout(80);await page.screenshot({path:'output/playwright/choreography-'+model+'.png'});
  }
 }
 if(errors.length)throw Error(errors.join(';'));return {clips:checks.length,samples:checks.length*5,errors};
}
