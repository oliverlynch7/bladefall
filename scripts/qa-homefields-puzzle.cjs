async rootPage=>{
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(rootPage.url()))throw Error('Local QA only');
const context=await rootPage.context().browser().newContext(),page=await context.newPage();
try{
await page.goto('http://127.0.0.1:4331/3d/?mute=1');
await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.classId='warrior';b.openHub();b.enterZone(0);b.meta.camMode='far';b.G.p.invuln=999;});
const start=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;if(!G.homeBell)throw Error('No bell encounter built');const clue=G.storyObjects.find(o=>o.key==='home.bell.clue'),bell=G.storyObjects.find(o=>o.key==='home.bell.alarm');
 Object.assign(p,{x:clue.x+70,z:clue.z,y:clue.y,vx:0,vy:0,vz:0});b.updateInteract();if(G.interact?.label!=='Read the watchtower notice')throw Error('Clue prompt missing: '+G.interact?.label);b.doInteract();if(!G.storyState.notes['home.bells'])throw Error('Clue missing');
 Object.assign(p,{x:bell.x,z:bell.z+72,y:bell.y,vx:0,vy:0,vz:0});b.updateInteract();if(G.interact?.label!=='Ring the warning bell')throw Error('Bell prompt missing: '+G.interact?.label);b.doInteract();if(!G.storyState.flags['home.bell.alarm'])throw Error('Bell did not ring');
 Object.assign(p,{x:2440,z:-1800,y:168});for(let i=0;i<100;i++)b.update(.016);b.questUpdate();return {wave:G.homeBell.wave,alive:BFHomeBellDefense.foes(G,1).length,tracker:document.querySelector('#questbox')?.textContent};});
if(start.wave!==1||start.alive!==2||!start.tracker?.includes('The watchtower key'))throw Error('Bell start: '+JSON.stringify(start));
await page.waitForFunction(()=>!BF_LOADING.active);
await page.screenshot({path:'output/playwright/homefields-warning-bell-wave.png'});
const outcome=await page.evaluate(()=>{const b=__BF3,G=b.G;let captainKind=null,combatXp=0;for(let wave=1;wave<=3;wave++){const live=BFHomeBellDefense.foes(G,wave);if(live.length!==[2,3,2][wave-1])throw Error('Wave '+wave+' count '+live.length);if(wave===1){const before=G.p.xp;b.hitEnemy(live[0],live[0].maxHp*5,G.p,0,0,null);if(!live[0].dead)throw Error('Bell raider ignored combat damage');combatXp=G.p.xp-before;if(combatXp<=0)throw Error('Bell raider gave no XP');}if(wave===3){const captain=live.find(e=>e.label==='Watch Captain');if(!captain?.elite||!captain.ceKind)throw Error('Captain lacks elite attack');const row=b.MP.enemySnap().find(a=>a[0]===captain.mid);if(!row?.[7]?.campaignElite||row[7].ceKind!==captain.ceKind)throw Error('Captain attack missing from co-op snapshot');captainKind=captain.ceKind;}for(const e of live)e.dead=true;for(let i=0;i<160;i++)b.update(.016);}if(!G.storyState.flags['home.bells.open'])throw Error('Tower chest did not unlock');
 const chest=G.storyObjects.find(o=>o.key==='home.bell.cache'),gold=b.meta.gold;Object.assign(G.p,{x:chest.x-72,z:chest.z,y:chest.y,vx:0,vy:0,vz:0});b.updateInteract();if(G.interact?.label!=='Open the tower chest')throw Error('Chest prompt missing: '+G.interact?.label);b.doInteract();if(b.meta.gold<=gold||!G.storyClaims['home.bells.cache'])throw Error('Chest reward missing');const paid=b.meta.gold;b.briarRequest('world',{key:chest.key});if(b.meta.gold!==paid)throw Error('Chest paid twice');
 return {wave:G.homeBell.wave,open:G.storyState.flags['home.bells.open'],captain:captainKind,combatXp,award:paid-gold,gold:paid,tracker:document.querySelector('#questbox')?.textContent};});
await page.screenshot({path:'output/playwright/homefields-warning-bell-open.png'});
await page.evaluate(()=>__BF3.autosaveRun());await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
const saved=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();return {open:!!b.G.storyState.flags['home.bells.open'],claimed:!!b.G.storyClaims['home.bells.cache'],gold:b.meta.gold,available:b.briarObjects().some(o=>o.key==='home.bell.cache'&&o.available)};});
if(!saved.open||!saved.claimed||saved.gold!==outcome.gold||saved.available)throw Error('Bell reward did not save once: '+JSON.stringify({saved,expectedGold:outcome.gold}));
return {start,outcome,saved};
}finally{await context.close();}
}
