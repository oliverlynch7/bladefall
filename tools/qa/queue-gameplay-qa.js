async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&visualqa=1&queue=release1981s');
 await page.waitForFunction(()=>window.HERO3D?.ready);
 const equipment=await page.evaluate(()=>{const a=__BF3;a.loadMode('rl');a.meta.bank=null;a.meta.introSeen=true;a.meta.tutOff=true;a.enterHub();a.G.p.level=30;a.meta.classUnlocked.mage=true;a.meta.classId='warrior';const sword=a.classStartWeapon('warrior');sword.name='QA kept sword';delete sword.starter;a.G.p.weapon=sword;const staff=a.classStartWeapon('mage');staff.name='QA owned staff';staff.dmg=91;a.meta.stash=[{weapon:staff}];a.trainerEquipClass('mage');if(a.G.p.weapon.name!==staff.name||!a.meta.stash.some(i=>i.weapon?.name===sword.name))throw Error('Class swap lost equipment');a.openBag(()=>a.enterHub());const b=[...document.querySelectorAll('[data-eq]')].find(b=>a.meta.stash[+b.dataset.eq]?.weapon?.name===sword.name);if(!b)throw Error('Missing off-class row');b.onclick();if(a.G.p.weapon.name!==staff.name)throw Error('Off class equipped');a.meta.stash=[];a.meta.classUnlocked.berserker=true;a.trainerEquipClass('berserker');if(!a.classFamilyOk(a.G.p.weapon)||!a.G.p.weapon.starter)throw Error('Starter invalid');return {ownedWeaponSelected:true,displacedWeaponPreserved:true,offClassBlocked:true,starter:a.G.p.weapon.art};});
 await page.evaluate(()=>{const a=__BF3;a.enterHub();a.meta.classId='necromancer';a.G.p.invuln=9999;});
 await page.waitForTimeout(1500);
 const allies=await page.evaluate(()=>{const a=__BF3,g=a.G;g.enemies=[];g.minions=[];const e=a.spawnEnemy('goblin',g.p.x+45,g.p.z);e.xp=0;e.active=true;e.dropT=0;a.hitEnemy(e,999999,g.p,0,0,null);a.SKILL_FX.necro_raise(g.p,true,1);const m=g.minions[0];if(m?.sourceType!=='goblin')throw Error('Wrong raised identity');const target=a.spawnEnemy('goblin',m.x+25,m.z);target.active=true;target.hp=10000;target.maxHp=10000;target.xp=0;const before=target.hp;m.atkT=0;for(let i=0;i<90;i++)a.update(1/60);const damaged=target.hp<before;if(!damaged)throw Error('Ally did not attack');m.life=.01;a.update(.1);if(g.minions.includes(m))throw Error('Ally did not expire');return {raised:'goblin',attackedHostile:damaged,expired:true};});
 await page.evaluate(()=>{__BF3.enterHub();document.getElementById('visual-qa-panel')?.remove();});
 await page.waitForFunction(()=>!BF_LOADING.active);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 const mobile=await page.evaluate(()=>{const r=document.getElementById('hud').getBoundingClientRect();return {width:r.width,right:r.right,viewport:innerWidth};});
 await page.screenshot({path:'output/playwright/queue-mobile.jpg',type:'jpeg'});
 await page.setViewportSize({width:1280,height:900});
 return {equipment,allies,mobile,errors};
}
