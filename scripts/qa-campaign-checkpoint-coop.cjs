async page => {
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error("Checkpoint QA only runs against a local test save.");
 const checks=[],check=(name,v)=>{if(!v)throw Error(name);checks.push(name);};
 const context=await page.context().browser().newContext();const guest=await context.newPage();
 try{
  await page.reload();await guest.goto('http://127.0.0.1:4331/3d/?mute=1');
  const setup=({gold,level})=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked={warrior:true};b.meta.classId='warrior';b.openHub();b.meta.gold=gold;b.G.p.level=level;b.meta.hero=b.snapOf(b.G.p);b.persist();};
  await page.evaluate(setup,{gold:1000,level:5});await guest.evaluate(setup,{gold:2000,level:8});
  await page.evaluate(()=>{const b=__BF3;window.qaPackets=[];b.MP.active=true;b.MP.isHost=true;b.MP.conns=[{send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))}];b.enterZone(0);b.openPause();});
  await guest.evaluate(()=>{__BF3.MP.active=true;__BF3.MP.isHost=false;});
  let packet=await page.evaluate(()=>qaPackets.find(d=>d.t==='zone'));
  await guest.evaluate(d=>{__BF3.MP.onGuestData(d);__BF3.openPause();},packet);
  check('guest enters identical route and seed',await guest.evaluate(d=>__BF3.G.runSeed===d.rseed&&__BF3.G.area===0&&__BF3.campaignCheckpoint().state.gold===2000,packet));
  await guest.evaluate(()=>{const b=__BF3;b.meta.gold+=200;b.G.p.level=9;b.G.pendingSecret={id:'personal-rift',name:'Personal Rift'};});
  await page.evaluate(()=>{const b=__BF3;b.meta.gold+=100;b.G.p.level=6;b.G.qs.ok1=2;b.nextArea();b.openPause();});
  packet=await page.evaluate(()=>qaPackets.filter(d=>d.t==='zone').at(-1));
  await guest.evaluate(d=>{__BF3.MP.onGuestData(d);__BF3.openPause();},packet);
  check('guest banks own half rewards, not host inventory',await guest.evaluate(()=>{const b=__BF3;return b.G.area===1&&b.campaignCheckpoint().state.gold===2200&&b.G.p.level===9&&b.meta.sideFound['personal-rift']&&b.G.qs.ok1===2;}));
  await guest.evaluate(()=>{__BF3.meta.gold+=77;__BF3.G.p.level=12;});
  await page.evaluate(()=>{__BF3.meta.gold+=55;__BF3.G.p.level=11;__BF3.restartCampaignCheckpoint();__BF3.openPause();});
  packet=await page.evaluate(()=>qaPackets.filter(d=>d.t==='zone').at(-1));
  check('host sends shared restart event',packet.restart===true);
  await guest.evaluate(d=>{__BF3.MP.onGuestData(d);__BF3.openPause();},packet);
  check('guest shared restart restores individual checkpoint',await guest.evaluate(()=>__BF3.meta.gold===2200&&__BF3.G.p.level===9&&__BF3.G.area===1));
  check('host shared restart restores host checkpoint',await page.evaluate(()=>__BF3.meta.gold===1100&&__BF3.G.p.level===6));
  await guest.evaluate(()=>{__BF3.meta.gold+=600;__BF3.G.p.level=20;__BF3.MP.leave('Disconnected');__BF3.openPause();});
  check('disconnect rolls back guest unfinished half',await guest.evaluate(()=>!__BF3.MP.active&&__BF3.meta.gold===2200&&__BF3.G.p.level===9&&__BF3.G.area===1));
  await page.evaluate(()=>{const b=__BF3;b.MP.leave();b.openHub();b.loadMode('hc');b.meta.run=null;b.meta.bank=null;b.meta.classUnlocked={warrior:true};b.meta.classId='warrior';b.meta.introSeen=true;b.openHub();b.enterZone(0);b.die();});
  await page.getByRole('button',{name:'Return to Hub',exact:true}).waitFor();
  check('hardcore does not show normal retry',await page.locator('#checkpointRetry').count()===0);
  await page.getByRole('button',{name:'Return to Hub',exact:true}).click();
  check('hardcore death still wipes progression',await page.evaluate(()=>!__BF3.meta.run&&__BF3.meta.gold===0&&__BF3.meta.zoneMax===0));
  return checks;
 }finally{await context.close();await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];__BF3.loadMode('rl');__BF3.openHub();});}
}
