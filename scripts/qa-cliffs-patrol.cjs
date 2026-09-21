async page=>{
 if(!page.url().startsWith('http://127.0.0.1:'))throw Error('Local QA only');await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;});await page.waitForFunction(()=>__world3d().counts.hollowArt&&!BF_LOADING.active);await page.waitForTimeout(300);
 return await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 function act(key){const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key});}
 Object.assign(p,{x:-100,z:210,y:0});b.briarRequest('open',{npc:'caleb'});b.briarRequest('choose',{line:'hp.caleb.first',choice:'help'});b.briarRequest('close');for(const k of ['hp.orders','hp.weight.2','hp.weight.5','hp.brake.right'])act(k);
 const guard=G.enemies.find(e=>e.cliffGuard&&e.role==='shielder');Object.assign(p,{x:guard.x,z:guard.z+40,y:0});let hp=guard.hp;b.hitEnemy(guard,10,p,0,0);const front=hp-guard.hp;Object.assign(p,{x:guard.x,z:guard.z-40});hp=guard.hp;b.hitEnemy(guard,10,p,0,0);ok('shielded patrol rewards attacking from behind',hp-guard.hp>front*2);
 for(const e of G.enemies.filter(e=>e.cliffGuard))b.hitEnemy(e,100000,p,0,0);act('hp.lift');ok('combat route opens lift without quiet rope',!!G.portal&&!G.storyState.flags['hp.quiet']);
 act('hp.windbreak');Object.assign(p,{x:850,z:-1710,y:200});ok('authored windbreak shelters exposed crossing',b.canyonWindState().push===0&&G.storyState.flags['hp.wind.safe']);return checks;
 });
}
