// Standalone design review checks, not gameplay simulation or aesthetic acceptance.
async root=>{
 const context=await root.context().browser().newContext({viewport:{width:1600,height:1240}}),p=await context.newPage(),errors=[],checks=[],badResponses=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
 try{
  await p.goto('http://127.0.0.1:4345/design/hud-preview/');await p.waitForSelector('.skill-btn');
  for(const screen of ['desktop','laptop']){
   await p.selectOption('#screen',screen);
   for(const design of ['a','b','c'])for(const scenario of ['explore','combat','clue','coop','beginner'])for(const details of [false,true]){
    await p.locator(`button[data-design="${design}"]`).click();await p.locator(`button[data-scenario="${scenario}"]`).click();await p.waitForTimeout(30);
    await p.locator('#detailsToggle').setChecked(details);
    const layout=await p.evaluate(()=>{
     const stage=document.querySelector('#stage').getBoundingClientRect(),regions=[...document.querySelectorAll('[data-region]')].map(e=>({name:e.dataset.region,r:e.getBoundingClientRect()})),overlaps=[];
     for(let i=0;i<regions.length;i++)for(let j=i+1;j<regions.length;j++){const a=regions[i],b=regions[j];if(Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>3&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>3)overlaps.push([a.name,b.name]);}
     const escapes=regions.filter(o=>o.r.left<stage.left-1||o.r.top<stage.top-1||o.r.right>stage.right+1||o.r.bottom>stage.bottom+1).map(o=>o.name);
     return{overlaps,escapes,images:[...document.querySelectorAll('#stage img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),bodyOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
    });checks.push({screen,design,scenario,details,...layout});
    if(screen==='desktop'&&!details&&['explore','combat','clue'].includes(scenario))await p.locator('#viewer').screenshot({path:`output/playwright/hud189-${design}-${scenario}.png`});
   }
  }
  await p.locator('button[data-scenario="explore"]').click();await p.locator('[data-skill="1"]').click();await p.waitForTimeout(100);const cooldownStarted=await p.locator('[data-skill="1"] .cooldown').isVisible();await p.waitForTimeout(2100);const cooldownFinished=!(await p.locator('[data-skill="1"] .cooldown').isVisible());
  await p.locator('button[data-scenario="clue"]').click();await p.locator('.clue-footer button').click();const clueClosed=!(await p.locator('.journal-card').count());await p.locator('.journal-return').click();const clueReopened=await p.locator('.journal-card').isVisible();
  await p.locator('#detailsToggle').check();const details=await p.locator('.gear-detail').isVisible();
  await p.locator('#currentToggle').click();const comparison=await p.locator('.current-image').isVisible();await p.locator('[data-return-design]').click();
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(70);await p.screenshot({path:'output/playwright/hud189-phone.png',fullPage:true});
  const phone=await p.evaluate(()=>({bodyOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,stage:document.querySelector('#stage').getBoundingClientRect().width,viewport:document.documentElement.clientWidth}));
  await p.locator('#fullSize').click();const actual=await p.evaluate(()=>({width:document.querySelector('#stage').getBoundingClientRect().width,scrollWidth:document.querySelector('#stageScroll').scrollWidth,container:document.querySelector('#stageScroll').clientWidth}));
  const storage=await p.evaluate(()=>Object.keys(localStorage));
  await p.setViewportSize({width:1440,height:1080});await p.locator('#fullSize').click();await p.locator('#fullscreen').click();await p.waitForTimeout(100);
  const fullscreen=await p.evaluate(()=>({open:!!document.fullscreenElement,stage:document.querySelector('#stage').getBoundingClientRect().height,available:document.querySelector('#stageScroll').clientHeight}));await p.locator('#fullscreen').click();
  await p.goto('http://127.0.0.1:4345/design/hud-preview/?design=b&scene=coop');const deepLink=await p.locator('button[data-design="b"]').getAttribute('aria-pressed')==='true'&&await p.locator('button[data-scenario="coop"]').getAttribute('aria-pressed')==='true';
  const result={checks,cooldownStarted,cooldownFinished,clueClosed,clueReopened,details,comparison,phone,actual,storage,fullscreen,deepLink,errors,badResponses};
  if(checks.some(r=>r.overlaps.length||r.escapes.length||r.images.length||r.bodyOverflow)||phone.bodyOverflow||!fullscreen.open||fullscreen.stage>fullscreen.available+1||errors.length||badResponses.length)result.failed=true;
  return result;
 }finally{await context.close();}
}
