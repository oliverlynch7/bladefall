async page=>{const ctx=await page.context().browser().newContext(),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
return await p.evaluate(async()=>{const b=__BF3,book=await b.briarReady,checks=[];b.loadMode('rl');b.meta.introSeen=true;b.meta.classUnlocked={warrior:true};b.meta.classId='warrior';b.meta.dialogueTTS=false;b.meta.autoAttack=false;b.openHub();b.meta.classes.warrior.rank=10;b.meta.tutOff=true;
const rows=[
[1,0,'hp.bridge.clue','hp.weight',/^hp\.weight\.\d+$/,['hp.trail','hp.orders'],'Bridge weights'],
[2,1,'kd.lift.note','kd.lift',/^kd\.lift\.\d+$/,['kd.roster','kd.hidden','kd.free','kd.papers'],'Lift weights'],
[3,0,'ff.reflect.clue','ff.reflect',/^ff\.reflect\.\d+$/,['ff.trail','ff.heath','ff.part','ff.heater'],'Signal stand'],
[3,1,'ic.lock.clue','ic.lock',/^ic\.lock\.\d+$/,['ic.pages','ic.free','ic.ellis.met','ic.notes','ic.ellis.lead'],'Water controls'],
[4,1,'gf.pipes','gf.cool',/^gf\.cool\.\d+$/,['gf.access','gf.martin.met','gf.evacuated'],'Cooling controls'],
[6,0,'pc.mirror.note','pc.light',/^pc\.mirror\.\d+$/,['pc.met','pc.clamp','pc.court','pc.west','pc.east'],'Sun mirrors']];
for(const [zone,area,clue,puzzle,pattern,flags,label]of rows){b.openHub();b.enterZone(zone);b.G.area=area;b.loadArea();const G=b.G;G.enemies.forEach(e=>e.dead=true);G.p.level=50;G.p.xpNext=1e9;G.p.invuln=999;flags.forEach(k=>G.storyState.flags[k]=true);b.briarSync();
const act=key=>{const o=G.storyObjects.find(o=>o.key===key);if(!o)throw Error('Missing object '+key);Object.assign(G.p,{x:o.x,z:o.z,y:o.y||0,vy:0});b.briarRequest('world',{key});};
if(BFPartyNavigation.target(G)?.key!==clue)throw Error('Clue target '+clue);act(clue);if(!G.storyState.flags['event.'+clue])throw Error('Clue transaction failed '+clue);
const controls=G.storyObjects.filter(o=>pattern.test(o.key)),t=BFPartyNavigation.target(G),expected=controls.reduce((sum,o)=>sum+o.x,0)/controls.length;if(t?.navLabel!==label||Math.abs(t.x-expected)>.01||t.key)throw Error('Puzzle hint leaks/stale '+clue);checks.push(clue+' -> neutral controls');
const effects=controls.map(o=>({key:o.key,e:book.events[o.key].effects.find(e=>['sequence','rotatePuzzle','counterweight'].includes(e.type))}));const kind=effects[0].e;
if(kind.type==='sequence'){const wrong=effects.find(x=>x.e.value!==kind.solution[0]);act(wrong.key);if(BFPartyNavigation.target(G)?.navLabel!==label)throw Error('Wrong answer hides task');for(const value of kind.solution)act(effects.find(x=>x.e.value===value).key);}
if(kind.type==='rotatePuzzle')for(const x of effects)for(let n=0;n<x.e.target[x.e.index];n++)act(x.key);
if(kind.type==='counterweight'){const mask=Array.from({length:1<<kind.weights.length},(_,m)=>m).find(m=>kind.weights.reduce((n,v,i)=>n+((m&(1<<i))?v:0),0)===kind.target);for(const x of effects)if(mask&(1<<x.e.index))act(x.key);}
if(!G.storyState.flags[puzzle+'.open'])throw Error('Puzzle did not solve '+puzzle);const next=BFPartyNavigation.target(G);if(!next||next.navLabel===label)throw Error('Task did not advance '+puzzle);checks.push(puzzle+' solved -> '+(next.navLabel||next.key||next.id||'exit'));
const restored=BFStoryState.restore(G.storyState);const prev=G.storyState;G.storyState=restored;if(JSON.stringify(BFPartyNavigation.target(G))!==JSON.stringify(next))throw Error('Restored guidance differs');G.storyState=prev;
}
for(const [zone,area,key,flags,field,value]of [[2,1,'kd.free',['kd.roster','kd.hidden'],'prisonGuard','cells'],[3,1,'ic.free',['ic.pages'],'iceGuard',true],[4,0,'ih.workers',['ih.flint.met'],'ironGuard',true],[4,1,'gf.gate',['gf.alarm'],'furnaceGate',true],[4,1,'gf.writings',['gf.access','gf.martin.met','gf.evacuated','gf.cool.open'],'furnaceOffice',true],[6,1,'sl.release',['sl.access','sl.orders'],'libraryGuard','main'],[7,1,'la.summit',['la.lower','la.upper'],'ascentGuard','summit']]){b.openHub();b.enterZone(zone);b.G.area=area;b.loadArea();const G=b.G;flags.forEach(k=>G.storyState.flags[k]=true);const guards=G.enemies.filter(e=>e[field]===value&&!e.dead&&e.hp>0);if(!guards.length)throw Error('Missing actual guards '+key);if(BFPartyNavigation.target(G)?.navLabel!=='Clear the guards')throw Error('No guard hint '+key);guards.forEach(e=>e.dead=true);if(BFPartyNavigation.target(G)?.key!==key)throw Error('Guard hint fails to release '+key);checks.push(key+' guards -> interaction');}
return {checks,scope:'Real puzzle transactions and scene guards; earlier quest flags prepared as fixtures, not a natural full campaign run'};});
}finally{await ctx.close();if(errors.length)throw Error(errors.join('\n'));}}
