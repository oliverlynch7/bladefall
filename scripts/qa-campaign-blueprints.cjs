async root=>{
 const context=await root.context().browser().newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const ok=(name,condition)=>{if(!condition)throw Error(name);checks.push(name);};
 try{
  await page.goto('http://127.0.0.1:4345/design/campaign-geography/');await page.waitForFunction(()=>document.querySelectorAll('#steps .stop').length>0);
  for(let z=0;z<8;z++)for(let a=0;a<2;a++){
   await page.selectOption('#region',String(z));await page.locator('#half'+a).click();
   ok('plan '+z+'/'+a,await page.evaluate(()=>document.querySelectorAll('#map .point').length>3&&!document.getElementById('error').offsetHeight));
   await page.locator('#steps .stop').first().click();ok('select stop '+z+'/'+a,await page.locator('#focusPoint').count()===1);
   await page.selectOption('#view','before');ok('old geometry '+z+'/'+a,await page.locator('#map .route').count()===0);
   await page.selectOption('#view','changes');await page.selectOption('#height','0');await page.selectOption('#height','2');await page.selectOption('#view','after');await page.selectOption('#height','all');
  }
  await page.selectOption('#region','7');await page.locator('#half1').click();await page.selectOption('#height','2');await page.screenshot({path:'output/playwright/geo187-blueprint-ascent.png',fullPage:true});
  await page.selectOption('#region','2');await page.locator('#half0').click();
  const first=await page.locator('#map').getAttribute('viewBox');await page.locator('#zoomIn').click();ok('zoom changes view',first!==await page.locator('#map').getAttribute('viewBox'));
  const map=await page.locator('#map').boundingBox();const before=await page.locator('#map').getAttribute('viewBox');await page.mouse.move(map.x+map.width*.5,map.y+map.height*.5);await page.mouse.down();await page.mouse.move(map.x+map.width*.5+95,map.y+map.height*.5+55,{steps:5});await page.mouse.up();ok('drag pans view',before!==await page.locator('#map').getAttribute('viewBox'));
  await page.locator('#fit').click();ok('fit restores frame',first===await page.locator('#map').getAttribute('viewBox'));
  await page.screenshot({path:'output/playwright/geo187-blueprint-keep.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.selectOption('#region','6');await page.locator('#half1').click();
  ok('phone has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#steps .stop[data-id="sl.orders"]').click();await page.locator('#focusPoint').click();ok('phone focus point',await page.locator('#selection').innerText().then(t=>t.includes('Legion orders')));
  await page.locator('#fit').click();await page.screenshot({path:'output/playwright/geo187-blueprint-phone.png',fullPage:true});
  await page.reload();await page.waitForFunction(()=>document.querySelectorAll('#steps .stop').length>0);ok('deep link retains level',await page.locator('#title').innerText()==='Sunspire · Sky Library');
  ok('no page errors',!errors.length);return {checks,errors};
 }finally{await context.close();}
}
