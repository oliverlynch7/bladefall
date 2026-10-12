async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(4);b.nextArea();});
 await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.furnace);
 const before=await page.evaluate(()=>{const b=__BF3,G=b.G,s=G.storyState,p=G.p;for(const key of ['gf.access','gf.martin.met','gf.passage','gf.evacuated'])s.flags[key]=true;s.items['gf.cool']=2;b.briarSync();p.invuln=999;Object.assign(p,{x:0,z:-4910,y:120,vy:0,vx:0,vz:0});b.meta.camMode='far';G.camYaw=0;for(let i=0;i<40;i++)b.update(.016);b.questUpdate();return {heat:G.furnace.heat,oldPartial:s.items['gf.cool'],objects:G.storyObjects.filter(o=>o.key.startsWith('gf.cool.')).length,quest:document.querySelector('#questbox')?.textContent};});
 if(before.heat!==100||before.objects!==0||!before.quest?.includes('cooling pedal'))throw Error('Cooling objective is not clear after rescue '+JSON.stringify(before));
 await page.waitForTimeout(300);await page.screenshot({path:'output/playwright/emberdeep-pedal-before.png'});
 const result=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,F=BFGreatFurnace,checks=[],ok=(n,v)=>{if(!v)throw Error(n+JSON.stringify({heat:G.furnace.heat,wave:G.furnace.coolWave,flags:G.storyState.flags,p:{x:p.x,z:p.z,y:p.y}}));checks.push(n);};
 const tick=n=>{for(let i=0;i<n;i++){for(const e of G.enemies)e.stunT=999;b.update(.016);}};
 b.input.jx=0;b.input.jz=-1;for(let i=0;i<180&&p.z>-5120;i++){for(const e of G.enemies)e.stunT=999;b.update(.016);}b.input.jz=0;
 ok('normal movement reaches the pedal and starts water',p.z<-5005&&G.furnace.heat<100);
 Object.assign(p,{x:0,z:-5150,y:120,vy:0,vx:0,vz:0,onGround:true});tick(100);
 const warm=G.furnace.heat;ok('pedal drives water and first attack wave',warm<100&&warm>70&&G.furnace.coolWave===1&&G.enemies.some(e=>e.furnaceCoolingWave));
 Object.assign(p,{x:410,z:-5150,y:120,vy:0,vx:0,vz:0,onGround:true});tick(90);ok('stepping off reheats without resetting the waves',G.furnace.heat>warm&&G.furnace.coolWave===1&&!G.storyState.flags['gf.cool.open']);
 Object.assign(p,{x:0,z:-5150,y:120,vy:0,vx:0,vz:0,onGround:true});tick(820);
 ok('sustained defense cools and opens the crossing',G.storyState.flags['gf.cool.open']&&G.furnace.cooled&&G.furnace.coolWave===3);
 ok('optional counterweights receive cold water',G.furnace.cachePistonsLive);
 const oldCompleted=BFStoryState.restore({...G.storyState,items:{...G.storyState.items,'gf.cool':0}});
 ok('completed flag survives old item values',oldCompleted.flags['gf.cool.open']);
 Object.assign(p,{x:0,z:-5700,y:45,vy:0,vx:0,vz:0});tick(75);ok('missed bridge jump returns to start',Math.abs(p.z+5330)<30&&p.y>=119);
 Object.assign(p,{x:0,z:-5700,y:45,hp:0});F.tick({G,state:G.storyState},1.2);ok('dead player is not teleported',p.z===-5700);
 p.hp=p.maxHp;Object.assign(p,{x:120,z:-4960,y:120,vy:0,vx:0,vz:0,onGround:true});return {checks,warm,finalHeat:G.furnace.heat,waves:G.enemies.filter(e=>e.furnaceCoolingWave).length,bridgeSteps:F.bridgeSteps.length};});
 await page.waitForTimeout(300);await page.screenshot({path:'output/playwright/emberdeep-pedal-after.png'});
 if(errors.length)throw Error(errors.join('\n'));
 return result;
}
