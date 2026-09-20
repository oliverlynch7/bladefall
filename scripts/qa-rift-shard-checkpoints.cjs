async page=>{
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local saves only');
await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.riftShards=[];b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.persist();b.enterZone(0);b.openPause()});
ok('physical shard is provisional',await page.evaluate(()=>{const b=__BF3;return b.collectRiftShard('BR-01')==='found'&&b.meta.riftShards.length===0}));
ok('duplicate physical pickup has no second reward',await page.evaluate(()=>__BF3.collectRiftShard('BR-01')==='already'));
await page.evaluate(()=>__BF3.autosaveRun());ok('autosave excludes unfinished shard',await page.evaluate(()=>!JSON.parse(localStorage.getItem(__BF3.MKEY('rl'))).riftShards.length));
await page.reload();await page.waitForFunction(()=>!!window.__BF3);await page.evaluate(()=>{__BF3.loadMode('rl');__BF3.continueRun();__BF3.openPause()});
ok('reload loses provisional shard',await page.evaluate(()=>!__BF3.G.pendingRiftShards&&!__BF3.meta.riftShards.length));
await page.evaluate(()=>{const b=__BF3;b.collectRiftShard('BR-01');b.collectRiftShard('BR-02');b.nextArea();b.openPause()});
ok('half completion banks each unique shard',await page.evaluate(()=>__BF3.campaignCheckpoint().state.riftShards.join(',')==='BR-01,BR-02'));
await page.evaluate(()=>{__BF3.collectRiftShard('BR-03');__BF3.restartCampaignCheckpoint();__BF3.openPause()});
ok('retry keeps first half and removes second half shard',await page.evaluate(()=>__BF3.G.area===1&&__BF3.meta.riftShards.join(',')==='BR-01,BR-02'&&!__BF3.G.pendingRiftShards));
ok('saved duplicate pays only once this attempt',await page.evaluate(()=>{const b=__BF3,g=b.meta.gold;return b.collectRiftShard('BR-01')==='echo'&&b.meta.gold>g&&b.collectRiftShard('BR-01')==='already'}));
await page.evaluate(()=>{__BF3.collectRiftShard('BR-03');__BF3.nextArea();__BF3.openPause()});await page.reload();await page.waitForFunction(()=>!!window.__BF3);await page.evaluate(()=>{__BF3.loadMode('rl');__BF3.continueRun();__BF3.openPause()});
ok('boss checkpoint reload preserves both halves',await page.evaluate(()=>__BF3.G.area===-1&&__BF3.meta.riftShards.join(',')==='BR-01,BR-02,BR-03'));
ok('pending boss shard does not persist on hub exit',await page.evaluate(()=>{const b=__BF3;b.collectRiftShard('BR-04');b.openHub();return b.meta.riftShards.join(',')==='BR-01,BR-02,BR-03'}));
return checks;
}
