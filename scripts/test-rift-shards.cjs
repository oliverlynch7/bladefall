const assert=require('node:assert/strict'),R=require('../public/3d/rift-shards.js');
assert.deepEqual(R.normalize(['BR-01','BR-01','BR-06','__proto__',null]),['BR-01']);
let a=R.collect([],null,'BR-01');assert.equal(a.outcome,'found');assert.equal(R.collect([],a.pending,'BR-01').outcome,'already');assert.equal(R.progress([],a.pending,'briar').ready,false);assert.deepEqual(R.normalize([]),[],'pending is not permanent');
let saved=R.bank([],a.pending);assert.deepEqual(saved,['BR-01']);assert.equal(R.collect(saved,null,'BR-01').outcome,'echo');let echo=R.collect(saved,null,'BR-01');assert.equal(R.collect(saved,echo.pending,'BR-01').outcome,'already');
let p;for(let n=2;n<=5;n++)p=R.collect(saved,p,'BR-0'+n).pending;assert.equal(R.progress(saved,p,'briar').ready,false,'five provisional shards cannot open trial');saved=R.bank(saved,p);assert.equal(R.progress(saved,null,'briar').ready,true);assert.equal(R.progress(saved,null,'hollow').banked,0);
assert.equal(R.collect([],null,'BR-01').outcome,'found','another player must collect independently');assert.deepEqual(R.bank(saved,null),saved,'retry preserves banked only');assert.equal(R.collect(saved,null,'garbage').outcome,'invalid');assert.deepEqual(R.normalize({bad:true}),[]);assert.equal(R.progress([],null,'none'),null);
assert.equal(R.regions[6].classId,'paladin');assert.equal(R.regions[7].classId,'necromancer');
console.log('Rift shard ledger passed: stable IDs, sanitization, individual collection, once-only echo, provisional/banked distinction, rollback, 5/5 gating and approved class mapping.');
