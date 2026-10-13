// Save created by the previous release in isolated storage, then loaded by this one.
async root=>{
 const c=await root.context().browser().newContext({viewport:{width:1440,height:900}}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('http://127.0.0.1:4345/3d/.qa-pre2189.html?mute=1');await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(()=>__BF3.briarReady);
  const before=await p.evaluate(()=>{const b=__BF3;b.loadMode('rl');Object.assign(b.meta,{run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,dialogueTTS:false,autoAttack:false,classId:'warrior',heroName:'HUD Save Check'});b.openHub();b.enterZone(0);b.meta.gold=317;b.G.p.xp=99;b.classState('warrior').xp=41;b.G.storyState.flags['thomas.ready']=true;b.meta.run.campaign.storyState=JSON.parse(JSON.stringify(b.G.storyState));b.autosaveRun();return{gold:b.meta.gold,xp:b.G.p.xp,classXp:b.classState('warrior').xp,weapon:b.G.p.weapon.name,name:b.meta.heroName,flag:!!b.G.storyState.flags['thomas.ready']};});
  await p.goto('http://127.0.0.1:4345/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(async()=>{await __BF3.briarReady;__BF3.loadMode('rl');__BF3.continueRun();});
  const after=await p.evaluate(()=>{const b=__BF3;return{gold:b.meta.gold,xp:b.G.p.xp,classXp:b.classState('warrior').xp,weapon:b.G.p.weapon.name,name:b.meta.heroName,flag:!!b.G.storyState.flags['thomas.ready']};});
  const same=JSON.stringify(before)===JSON.stringify(after);
  await p.goto('http://127.0.0.1:4345/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.locator('body').click({position:{x:720,y:450}});await p.locator('#mmDev').click();await p.getByRole('link',{name:'HUD designs · compare three layouts'}).click();await p.waitForSelector('.skill-btn');
  const route=p.url();await p.screenshot({path:'output/playwright/hud189-design-desk.png',fullPage:true});
  if(!same||errors.length||!route.includes('/design/hud-preview/'))throw Error(JSON.stringify({before,after,errors,route}));
  return{before,after,same,route,errors};
 }finally{await c.close();}
}
