async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(5);b.nextArea();const G=b.G,p=G.p,w=G.patrolWork,checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};for(const e of G.enemies)e.stunT=999;
  BFJournalNotice.queue.reset('qa-camp',{});Object.assign(p,{x:w.anchor.x,z:w.anchor.z,y:w.anchor.y,vy:0,vx:0,vz:0,onGround:true});b.update(.016);
  ok('approaching patrol adds optional hunt',!!G.storyState.flags[w.id+'.known']&&!!G.storyState.flags[w.id+'.camp']);
  ok('discovery uses compact toast, not journal panel',BFJournalNotice.queue.pending===0&&!BFJournalNotice.queue.current);
  ok('hunt remains in tracker',document.querySelector('#questbox')?.textContent.includes(w.title));
  ok('hunt remains in optional journal',b.discoveredOptionalTasks().some(t=>t.title===w.title&&t.kind==='hunt'));
  const e=G.enemies.find(e=>e.patrolGroup===w.group&&!e.dead);if(!e)throw Error('No hunt target');Object.assign(p,{x:e.x,z:e.z,y:e.y,invuln:999});b.hitEnemy(e,e.hp+100,p,0,0);
  ok('defeating a designated foe advances the same hunt',G.storyState.items[w.id]===1);
  return {checks,target:w.target,place:w.place,progress:G.storyState.items[w.id]};});
 if(errors.length)throw Error(JSON.stringify({errors,result}));return {...result,errors};
}
