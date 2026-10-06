async host=>{
 const context=await host.context().browser().newContext();const guest=await context.newPage();await guest.addInitScript(()=>window.requestAnimationFrame=()=>0);const checks=[];
 try{
 for(const p of [host,guest]){await p.goto('http://127.0.0.1:4339/3d/?mute=1');await p.waitForFunction(()=>window.__BF3,null,{polling:100});await p.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.stash=[];b.meta.chestRecords={};b.meta.hubTutDone=true;b.meta.classUnlocked.warrior=true;b.openHub();});}
 await host.evaluate(()=>{const b=__BF3;window.packets=[];b.MP.active=true;b.MP.isHost=true;b.MP.conns=[{send:d=>packets.push(JSON.parse(JSON.stringify(d)))}];b.startEndless({floor:1,runSeed:92145});b.G.endSpawned=b.G.endTarget;b.G.enemies=[];b.endlessTick(.016);});
 const packet=await host.evaluate(()=>packets.filter(d=>d.t==='special'&&d.cleared).at(-1));if(!packet)throw Error('No clear broadcast');
 await guest.evaluate(d=>{const b=__BF3;b.MP.active=true;b.MP.isHost=false;b.MP.onGuestData(d);},packet);
 const h=await host.evaluate(()=>{const b=__BF3;b.openChest(b.G.chests[0]);return {grade:b.G.chests[0].rarity,count:b.meta.stash.length};});
 const g=await guest.evaluate(()=>{const b=__BF3;if(b.meta.stash.length)throw Error('Host claimed guest loot');b.openChest(b.G.chests[0]);b.openChest(b.G.chests[0]);return {grade:b.G.chests[0].rarity,count:b.meta.stash.length};});
 if(h.grade!==g.grade||h.count!==1||g.count!==1)throw Error('Personal reward mismatch');checks.push('Host and guest share chest grade, each claim exactly one personal item');
 await guest.evaluate(d=>{const b=__BF3;b.MP.onGuestData(d);b.G.chests=[];b.descentRewardChest();b.openChest(b.G.chests[0]);if(b.meta.stash.length!==1)throw Error('Repeated clear duplicated guest loot');},packet);checks.push('Repeated clear/reconstructed chest cannot duplicate guest claim');
 await guest.reload();await guest.waitForFunction(()=>window.__BF3,null,{polling:100});
 await guest.evaluate(d=>{const b=__BF3;b.loadMode('rl');b.MP.active=true;b.MP.isHost=false;b.MP.onGuestData(d);if(!b.G.chests[0].opened)throw Error('Reconnect claim lost');b.openChest(b.G.chests[0]);if(b.meta.stash.length!==1)throw Error('Reconnect duplicated item');},packet);checks.push('Guest reload/rejoin retains claimed chest and item');return checks;
 }finally{await context.close();await host.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];BFChestReveal.clear();});}
}
