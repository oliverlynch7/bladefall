async page=>{
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');
 await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready);
 await page.waitForTimeout(1500);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');b.G.p.invuln=999;});
 await page.waitForTimeout(750);
 const start=await page.evaluate(()=>{const b=__BF3,g=b.G.doors.find(d=>d.from===1);return{rev:b.G.escape.layoutVersion,gate:{x:g.x,z:g.z,open:g.open},p:{x:b.G.p.x,z:b.G.p.z}}});
 await page.evaluate(()=>{__BF3.G.camYaw=Math.PI;__BF3.input.up=true;});
 await page.waitForTimeout(10000);
 await page.evaluate(()=>__BF3.input.up=false);
 const blocked=await page.evaluate(()=>{const b=__BF3,g=b.G.doors.find(d=>d.from===1);return{p:{x:b.G.p.x,z:b.G.p.z},gateOpen:g.open,foes:b.G.enemies.filter(e=>e.prisonRoom===1&&!e.dead&&e.hp>0).length,started:!!b.G.escape.states[1]?.started,objective:document.querySelector('#prisonhud .pr-objective')?.textContent}});
 await page.screenshot({path:'output/playwright/dungeon11-closed-gate.png'});
 await page.evaluate(()=>{const b=__BF3;for(const e of b.G.enemies)if(e.prisonRoom===1){e.dead=true;e.hp=0;}b.G.time+=2;b.G.p.invuln=999;});
 await page.waitForTimeout(250);
 const cleared=await page.evaluate(()=>{const b=__BF3,g=b.G.doors.find(d=>d.from===1);return{roomCleared:!!b.G.escape.states[1]?.cleared,gateOpen:g.open,p:{x:b.G.p.x,z:b.G.p.z}}});
 await page.screenshot({path:'output/playwright/dungeon11-open-gate.png'});
 await page.evaluate(()=>__BF3.input.up=true);await page.waitForTimeout(900);await page.evaluate(()=>__BF3.input.up=false);
 const crossed=await page.evaluate(()=>({z:__BF3.G.p.z,gate:__BF3.G.doors.find(d=>d.from===1).z}));
 await page.evaluate(()=>{const b=__BF3;b.openHub();b.startDelve('warrior',{resume:true});});
 const resumed=await page.evaluate(()=>({rev:__BF3.G.escape.layoutVersion,gateOpen:__BF3.G.doors.find(d=>d.from===1).open,cleared:!!__BF3.G.escape.states[1]?.cleared}));
 if(start.rev!==11||!blocked.started||blocked.foes<1||blocked.gateOpen||blocked.p.z<start.gate.z+20||!blocked.objective?.includes('Exit sealed'))throw Error('closed gate did not stop and guide the player');
 if(!cleared.roomCleared||!cleared.gateOpen||crossed.z>=crossed.gate-25)throw Error('cleared gate did not let the player through');
 if(resumed.rev!==11||!resumed.gateOpen||!resumed.cleared)throw Error('checkpoint did not restore the cleared gate');
 return{start,blocked,cleared,crossed,resumed};
}
