async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/animation-preview.html');await page.waitForFunction(()=>window.__animationQA?.().bones>0);
 await page.locator('#play').click();const checks=[];
 for(const model of ['grunt','brute','caster','dustjackal']){
  await page.selectOption('#model',model);await page.waitForFunction(m=>__animationQA().type===m&&document.getElementById('status').textContent.includes(m),model);
  for(const clip of ['Windup','Attack','Hit','Move']){
   await page.selectOption('#clip',clip);
   for(const phase of [.01,.2,.5,.8,.99]){
    await page.locator('#scrub').fill(String(phase));await page.locator('#scrub').dispatchEvent('input');
    const q=await page.evaluate(()=>__animationQA());if(!q.finite||q.clip!==clip)throw Error(JSON.stringify(q));
   }checks.push(model+':'+clip);
  }
 }
 if(errors.length)throw Error(errors.join(';'));return checks;
}
