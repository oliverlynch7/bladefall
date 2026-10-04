async page=>{
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.route('**/*',r=>r.continue());await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();b.startDelve('warrior');b.G.runSeed=31;b.loadDelveFloor(1);b.G.p.z=-720;BFPrisonRun.tick(.016);const solo=b.G.enemies[0].maxHp;b.delveExit();
  b.MP.active=true;b.MP.isHost=true;b.MP.myId='host';b.MP.zone=-304;b.MP.peers={friend:{id:'friend',zone:-304,x:0,z:180}};
  b.startDelve('warrior');b.G.runSeed=31;b.loadDelveFloor(1);b.G.p.z=-720;BFPrisonRun.tick(.016);const coop=b.G.enemies[0].maxHp;if(Math.abs(coop/solo-1.6)>.05)throw Error('Co-op scale '+coop/solo);
  delete b.MP.peers.friend;BFPrisonRun.tick(.016);if(b.G.enemies[0].maxHp!==coop)throw Error('Midfight rescale');
  b.G.p.hp=42;BFPrisonRun.checkpoint();const host=JSON.parse(JSON.stringify(BFPrisonRun.packet()));b.MP.leave();b.delveExit();b.startDelve('warrior',{resume:true});if(b.G.p.hp!==42||!b.G.escape)throw Error('Host solo resume failed');b.delveExit();
  const cp=JSON.stringify(BFPrisonRun.profile().checkpoint),gold=BFPrisonRun.profile().gold;
  b.MP.active=true;b.MP.isHost=false;b.MP.myId='friend';b.MP.zone=-304;host.id+='guesttest';host.events=[{id:host.id+':test',gold:33,members:['friend']}];
  b.MP.onGuestData({t:'special',kind:'prison',prison:host});if(b.G.escape)throw Error('Guest entered before save choice');BFPrisonRun.selectSlot(BFPrisonRun.library().active);b.MP.onGuestData({t:'special',kind:'prison',prison:host});
  if(BFPrisonRun.profile().gold!==gold+33)throw Error('Duplicate reward');if(JSON.stringify(BFPrisonRun.profile().checkpoint)!==cp)throw Error('Guest overwrote solo checkpoint');
  b.MP.leave();if(!b.G.hub)throw Error('Guest disconnect did not return safely');if(JSON.stringify(BFPrisonRun.profile().checkpoint)!==cp)throw Error('Disconnect changed checkpoint');
  b.persist();return {solo,coop,ratio:coop/solo,guestCheckpointPreserved:true,rewardsDeduplicated:true,checkpoint:cp};
 });
 await page.reload();await page.waitForFunction(()=>window.BFPrisonRun,null,{polling:100});const restored=await page.evaluate(()=>{__BF3.loadMode('rl');return JSON.stringify(BFPrisonRun.profile().checkpoint);});if(restored!==result.checkpoint)throw Error('Reload lost checkpoint');delete result.checkpoint;return {...result,reloadPreserved:true};
}
