async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.tutOff=true;b.openHub();b.enterZone(1);
  const e=b.spawnEnemy('grunt',b.G.p.x+60,b.G.p.z);Object.assign(e,{active:true,dropT:0,stunT:999,ceKind:'raid',ceState:'wind',ceClock:.65});b.G.enemies=[e];b.G.p.invuln=999;
 });
 await page.waitForFunction(()=>window.__mob3d?.().actors.some(a=>a.type==='grunt'));
 // Pause gameplay via the menu; render time still advances, so state transitions can be inspected exactly.
 await page.evaluate(()=>{__BF3.openPause();__BF3.G.enemies[0].stunT=0;});
 const state=()=>page.evaluate(()=>__mob3d().actors.find(a=>a.type==='grunt'));
 await page.waitForTimeout(120);if((await state()).clip!=='Windup')throw Error('Missing wind-up');
 await page.evaluate(()=>Object.assign(__BF3.G.enemies[0],{ceState:'recover',ceClock:1}));
 await page.waitForTimeout(120);if((await state()).clip==='Attack')throw Error('Cancelled warning caused false strike');
 await page.evaluate(()=>Object.assign(__BF3.G.enemies[0],{ceState:'wind',ceClock:.65}));await page.waitForTimeout(120);
 await page.evaluate(()=>Object.assign(__BF3.G.enemies[0],{ceState:'strike',ceClock:.3}));await page.waitForTimeout(80);
 const strike=await state();if(strike.clip!=='Attack'||Object.keys(strike.weights).some(k=>k!=='Attack'&&strike.weights[k]>.05))throw Error('Old pose still blended '+JSON.stringify(strike));
 await page.evaluate(()=>Object.assign(__BF3.G.enemies[0],{ceState:'recover',ceClock:1}));await page.waitForTimeout(90);
 if((await state()).clip!=='Recover')throw Error('Missing follow-through recovery');await page.waitForTimeout(400);
 if((await state()).clip!=='Idle')throw Error('Recovery failed to settle');
 await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.enemies[0],{ceState:'wind',ceClock:.65});b.G._freezeT=1;});await page.waitForTimeout(60);
 const before=(await state()).time;await page.waitForTimeout(140);const after=(await state()).time;
 if(Math.abs(before-after)>.001)throw Error('Freeze did not freeze the pose');
 await page.evaluate(()=>{__BF3.G._freezeT=0;});
 await page.evaluate(()=>{
  const b=__BF3;b.openHub();b.enterZone(1);const p=b.G.p,e=b.spawnEnemy('caster',p.x+180,p.z);Object.assign(e,{active:true,dropT:0,shootT:99,meleeCd:1,shotW:.01,shotAim:{x:p.x,y:p.y,z:p.z,h:p.h}});b.G.enemies=[e];b.update(.016);
  if(!(e.shotReleaseT>0)||!b.G.projectiles.some(q=>q.src===e))throw Error('Actual projectile did not signal release');b.openPause();
 });
 await page.waitForFunction(()=>__mob3d().actors.some(a=>a.type==='caster'&&a.clip==='Attack'));
 if(errors.length)throw Error(errors.join(';'));return {cancelledWarningSafe:true,onlyAttackWeighted:true,recovery:true,freeze:true,projectileRelease:true};
}
