async page=>{
 await page.goto('http://127.0.0.1:4338/3d/animation-preview.html');
 await page.waitForFunction(()=>window.__animationQA?.().bones>0);
 await page.locator('#play').click();
 const shots=[];
 for(const [type,clip,phase] of [['grunt','Move',.25],['dustjackal','Move',.25],['caster','Attack',.35],['flyer','Move',.25],['prison_bell','Attack_toll',.27],['colossus','Attack_sweep',.27],['marblecolossus','Attack_fall',.27]]){
  await page.locator('#model').selectOption(type);
  await page.waitForFunction(type=>__animationQA().type===type&&document.getElementById('status').textContent.includes(type),type);
  await page.locator('#clip').selectOption(clip);
  await page.locator('#scrub').fill(String(phase));
  await page.locator('#scrub').dispatchEvent('input');
  const file=`output/playwright/enemy-pose-${type}-${clip}-v2141.png`;
  await page.locator('#view').screenshot({path:file});
  shots.push(file);
 }
 return shots;
}
