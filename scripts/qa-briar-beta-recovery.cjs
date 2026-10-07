async page=>{
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4338/3d/?devbriar=1&mute=1');await page.waitForFunction(()=>window.__BF3&&document.getElementById('bstart'),null,{polling:100});await page.locator('#bstart').click();
 return page.evaluate(()=>{const b=__BF3,prog=BFBriarBeta.progress,ok=(v,m)=>{if(!v)throw Error(m);};let g=b.G,s=g.devBriar;
 const at=(o)=>Object.assign(g.p,{x:o.x,z:o.z,y:o.y||0,onGround:true,vy:0,vx:0,vz:0});const use=(o,label)=>{at(o);b.updateInteract();ok(g.interact?.label===label,'Expected '+label+' got '+g.interact?.label);b.doInteract();};
 use(s.jam,'Free the jammed timber');ok(!prog.bridge,'Catch released without weight');
 Object.assign(s.crate,{x:-475,z:-490});at({x:-100,z:-400});for(let i=0;i<60;i++)BFBriarBeta.movePlatforms(1/60);ok(s.plate>.99,'Crate did not hold plate');
 use({x:-320,z:-380},'Reset the grain crate');ok(s.crate.x===-260&&!s.drag,'Crate reset failed');for(let i=0;i<60;i++)BFBriarBeta.movePlatforms(1/60);ok(s.plate<.01,'Plate did not release');
 prog.medicine=prog.healing=prog.bridge=true;prog.shards.push('home-roof');s.bridgeT=1;s.groups.forEach(q=>q.spawned=true);g.enemies=[];BFBriarBeta.tick(.016);ok(s.evac,'Defense did not begin');
 const n=s.actors[0],e={betaId:'evac-test',pcState:'strike',pcMove:'thrust',pcSerial:1,pcX:n.x,pcZ:n.z-40,pcY:0,pcDX:0,pcDZ:1};
 BFBriarBeta.captiveHit(e,()=>false);ok(s.evac.hp===92,'Real hit volume failed');BFBriarBeta.captiveHit(e,()=>false);ok(s.evac.hp===92,'Repeated damage in same attack');e.pcSerial++;BFBriarBeta.captiveHit(e,()=>true);ok(s.evac.hp===92,'Blocked attack hurt villager');
 s.evac.hp=0;BFBriarBeta.tick(.016);ok(document.body.innerText.includes('escape route was overrun'),'Failure prompt absent');document.getElementById('bb0').click();g=b.G;s=g.devBriar;ok(prog.bridge&&prog.healing&&prog.shards.length===1&&!s.evac,'Retry lost progress or retained failed defense');ok(g.p.hp>0,'Retry health');
 const safe={...s.safe};g.p.y=-200;BFBriarBeta.tick(.016);ok(prog.falls===1&&g.p.y===safe.y,'Fall recovery');
 prog.evacuated=true;use(s.exit,'Enter the Black Woods');g=b.G;s=g.devBriar;g.enemies=[];s.groups.forEach(q=>q.spawned=true);prog.hunt=true;at({x:-550,z:-1250});
 for(let i=0;i<10;i++)BFBriarBeta.tick(4.1);ok(g.enemies.filter(e=>e.betaId?.startsWith('hunt:')&&!e.dead).length===2,'Hunt cap');
 for(let j=0;j<11;j++){for(const e of g.enemies)e.dead=true;BFBriarBeta.tick(4.1);}ok(prog.huntKills===12,'Hunt did not reach twelve kills: '+prog.huntKills);const before=prog.smallHeals;
 use(s.actors[0],'Talk to Lewis');document.getElementById('bb2').click();document.getElementById('bb0').click();use(s.actors[0],'Talk to Lewis');document.getElementById('bb2').click();document.getElementById('bb0').click();ok(prog.smallHeals===before+2,'Duplicate reward');
 return {wrongSolution:true,crateReset:true,realVillagerHit:true,oneHitPerAttack:true,blockedHit:true,defenseRetry:true,fallRecovery:true,huntCap:prog.huntKills,rewardOnce:true};
 });
}
