async root=>{
 const c=await root.context().browser().newContext({viewport:{width:1440,height:960}}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('https://bladefall.pages.dev/3d/?mute=1&verify='+Date.now());
  const version=await p.evaluate(()=>document.documentElement.innerHTML.match(/const VERSION3D='([^']+)'/)?.[1]);
  if(version!=='2.189.1-hud-previews')return{published:false,version};
  await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.locator('body').click({position:{x:720,y:480}});await p.locator('#mmDev').click();await p.getByRole('link',{name:'HUD designs · compare three layouts'}).click();await p.waitForSelector('.skill-btn');
  const rows=[];
  for(const design of ['a','b','c']){
   await p.locator(`button[data-design="${design}"]`).click();await p.locator('button[data-scenario="clue"]').click();
   await p.waitForFunction(()=>[...document.querySelectorAll('#stage img')].every(i=>i.complete&&i.naturalWidth));
   rows.push(await p.evaluate(()=>({design:document.querySelector('#stage').dataset.design,title:document.querySelector('#designTitle').textContent,note:!!document.querySelector('.journal-card'),skills:document.querySelectorAll('.skill-btn').length})));
  }
  await p.screenshot({path:'output/playwright/hud189-production.png',fullPage:true});
  await p.locator('#fullscreen').click();await p.waitForSelector('#fullscreenDesign',{state:'visible'});await p.selectOption('#fullscreenDesign','a');const fullscreenSwitch=await p.locator('#stage').getAttribute('data-design')==='a';await p.locator('#fullscreen').click();
  if(errors.length||rows.some(r=>!r.note||r.skills!==6)||!fullscreenSwitch)throw Error(JSON.stringify({rows,errors,fullscreenSwitch}));
  return{published:true,version,rows,fullscreenSwitch,errors,url:p.url()};
 }finally{await c.close();}
}
