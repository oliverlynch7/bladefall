async page=>{
 const errors=[],checks=[],ok=(name,pass)=>{if(!pass)throw Error(name);checks.push(name)};
 page.on('pageerror',error=>errors.push(error.message));
 await (await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.G.area=1;b.loadArea();b.meta.tutOff=true;b.meta.camMode='far';b.G.p.invuln=999;for(const e of b.G.enemies)e.dead=true;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Long Ascent');
 const before=await page.evaluate(()=>{const b=__BF3,G=b.G;return {art:__world3d().counts.deepArt,closed:G.walls.filter(w=>['lower','upper'].includes(w.ascentTag)).map(w=>({tag:w.ascentTag,x:w.x,z:w.z,y:w.y0,h:w.h})),objects:G.storyObjects.filter(o=>['la.lower','la.upper'].includes(o.key)).map(o=>({key:o.key,x:o.x,z:o.z,y:o.y}))};});
 ok('both catch gates have collision and detailed castle art loads',before.closed.length===2&&before.art==='castle');
 const lowerBlocked=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,w=G.walls.find(w=>w.ascentTag==='lower');Object.assign(p,{x:w.x+125,z:w.z,y:w.y0+8,vx:0,vz:0,vy:0,onGround:true});for(let i=0;i<85;i++){b.input.jx=-1;b.input.jz=0;b.update(.016);}b.input.jx=0;return {x:p.x,y:p.y,gateX:w.x,flag:!!G.storyState.flags['la.lower']};});
 ok('lower closed bars stop a normal walking approach',lowerBlocked.x>lowerBlocked.gateX+33&&!lowerBlocked.flag);
 await page.waitForTimeout(140);await page.screenshot({path:'output/playwright/ascent-catch-lower-closed.png'});
 const lowerOpened=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,o=G.storyObjects.find(o=>o.key==='la.lower');Object.assign(p,{x:o.x,z:o.z,y:o.y,vx:0,vz:0,vy:0,onGround:true});b.update(.016);const prompt=G.interact?.label;b.doInteract();return {prompt,flag:!!G.storyState.flags['la.lower'],wall:G.walls.some(w=>w.ascentTag==='lower'),at:G.ascent.gateAt.lower};});
 ok('ordinary catch interaction opens the lower staircase',lowerOpened.prompt==='Release the lower stair catch'&&lowerOpened.flag&&!lowerOpened.wall&&Number.isFinite(lowerOpened.at));
 await page.evaluate(()=>{for(let i=0;i<35;i++)__BF3.update(.016);});await page.waitForTimeout(120);await page.screenshot({path:'output/playwright/ascent-catch-lower-opening.png'});
 const lowerPassed=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,w=BFLongAscent.point(.55);Object.assign(p,{x:w[0]+125,z:w[1],y:w[2],vx:0,vz:0,vy:0,onGround:true});for(let i=0;i<85;i++){b.input.jx=-1;b.input.jz=0;b.update(.016);}b.input.jx=0;return {x:p.x,y:p.y,gateX:w[0]};});
 ok('player can walk through the opened lower bars',lowerPassed.x<lowerPassed.gateX-30);
 const upperBlocked=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,w=G.walls.find(w=>w.ascentTag==='upper');Object.assign(p,{x:w.x+125,z:w.z,y:w.y0+8,vx:0,vz:0,vy:0,onGround:true});for(let i=0;i<85;i++){b.input.jx=-1;b.input.jz=0;b.update(.016);}b.input.jx=0;return {x:p.x,y:p.y,gateX:w.x,flag:!!G.storyState.flags['la.upper']};});
 ok('upper closed bars stop a normal walking approach',upperBlocked.x>upperBlocked.gateX+33&&!upperBlocked.flag);
 const upperOpened=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,o=G.storyObjects.find(o=>o.key==='la.upper');Object.assign(p,{x:o.x,z:o.z,y:o.y,vx:0,vz:0,vy:0,onGround:true});b.update(.016);const prompt=G.interact?.label;b.doInteract();return {prompt,flag:!!G.storyState.flags['la.upper'],wall:G.walls.some(w=>w.ascentTag==='upper'),at:G.ascent.gateAt.upper};});
 ok('ordinary catch interaction opens the upper staircase',upperOpened.prompt==='Release the upper stair catch'&&upperOpened.flag&&!upperOpened.wall&&Number.isFinite(upperOpened.at));
 await page.evaluate(()=>{for(let i=0;i<90;i++)__BF3.update(.016);});await page.waitForTimeout(120);await page.screenshot({path:'output/playwright/ascent-catch-upper-open.png'});
 const oldSave=await page.evaluate(()=>{const b=__BF3;b.G.storyState.flags['la.upper']=false;b.G.storyState.flags['la.lower']=true;b.G.area=1;b.loadArea();return {lower:b.G.walls.some(w=>w.ascentTag==='lower'),upper:b.G.walls.some(w=>w.ascentTag==='upper'),lowerAt:b.G.ascent.gateAt.lower};});
 ok('prior partial catch save opens only its completed gate',!oldSave.lower&&oldSave.upper&&oldSave.lowerAt===-Infinity);
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,before,lowerBlocked,lowerOpened,lowerPassed,upperBlocked,upperOpened,oldSave,errors};
}
