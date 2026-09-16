const assert=require('node:assert/strict');
(async()=>{const {enemyActionState}=await import(require('node:url').pathToFileURL(require('node:path').resolve(__dirname,'../../public/3d/enemy-action-state.js')).href);
assert.equal(enemyActionState({dmg:50,shootT:10}).phase,null);
for(const key of ['windT','slamW','cleaveW','novaW','poundW','eruptW','knightW','pinT','blinkFx','fuseT','meleeW','shotW'])assert.deepEqual(enemyActionState({[key]:.65}),{phase:'Windup',key,remaining:.65});
for(const key of ['meleeActive','chargeT','lunge','diving'])assert.equal(enemyActionState({[key]:.18}).phase,'Attack');
console.log('17 phase cases passed');})();
