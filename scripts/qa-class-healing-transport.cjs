async page=>{
const checks=[],errors=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)},context=await page.context().browser().newContext(),guest=await context.newPage();
try{
for(const p of [page,guest]){p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>window.requestAnimationFrame=()=>0);await p.goto('http://127.0.0.1:4338/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.hubTutDone=true;b.meta.hubDialogue={};b.openHub();document.body.classList.remove('t-title','t-attract');b.update(.016);window.qaPackets=[];});}
await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();

for(const p of [page,guest])await p.evaluate(()=>{const b=__BF3;b.meta.classId='warrior';b.classState('warrior').ch={};b.classState('warrior').rank=9;b.G.enemies=[];b.G.walls=[];b.G.doors=[];b.spawnEnemy('grunt',0,60,false);const e=b.G.enemies.at(-1);e.mid=42;e.hp=e.maxHp=1000;e.active=true;b.G.p.hp=20;b.G.combo=0;b.G._desig=false;});
await page.evaluate(()=>__BF3.G.enemies[0].hp=10);
await guest.evaluate(()=>{const b=__BF3;b.hitEnemy(b.G.enemies[0],100,b.G.p,0,1,null);window.lastHit=qaPackets.find(d=>d.t==='hit');});
ok('Guest waits for real host receipt',await guest.evaluate(()=>__BF3.G.p.hp===20));await flush();ok('Overkill heals only actual health removed',await guest.evaluate(()=>Math.abs(__BF3.G.p.hp-23)<.001));
await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>lastHit));await flush();ok('Repeated request and receipt cannot heal twice',await guest.evaluate(()=>Math.abs(__BF3.G.p.hp-23)<.001));
for(const p of [page,guest])await p.evaluate(()=>{const b=__BF3;b.G.enemies=[];b.G.walls=[];b.G.doors=[];b.spawnEnemy('grunt',0,60,false);const e=b.G.enemies.at(-1);e.mid=43;e.hp=e.maxHp=1000;e.active=true;b.G.p.hp=20;});
await page.evaluate(()=>Object.assign(__BF3.G.enemies[0],{boss:true,shielded:true}));
await guest.evaluate(()=>{const b=__BF3;b.hitEnemy(b.G.enemies[0],100,b.G.p,0,1,null);});await flush();ok('Host ward prevents predicted healing',await guest.evaluate(()=>__BF3.G.p.hp===20));
await page.evaluate(()=>__BF3.G.enemies[0].shielded=false);
await guest.evaluate(()=>{const b=__BF3;b.meta.classId='reaper';b.classState('reaper').ch={};b.classState('reaper').rank=9;b.G.p.weapon=b.classStartWeapon('reaper');Object.assign(b.G.p,{x:0,z:0,y:0,yaw:0});b.SKILL_FX.harvest(b.G.p,true,1);});await flush();ok('Harvest heals the actual guest through transport',await guest.evaluate(()=>Math.abs(__BF3.G.p.hp-20-__BF3.effMaxHp(__BF3.G.p)*.05)<.001));
if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
}catch(e){return {error:String(e),errors,host:await page.evaluate(()=>({ready:window.HERO3D?.ready,b:!!window.__BF3})),guest:await guest.evaluate(()=>({ready:window.HERO3D?.ready,b:!!window.__BF3,hp:__BF3.G.p.hp,max:__BF3.effMaxHp(__BF3.G.p),packets:qaPackets,pending:[...(__BF3.MP._pendingEnemyHits||[])],en:__BF3.G.enemies.map(e=>({hp:e.hp,mid:e.mid,dead:e.dead,shielded:e.shielded,boss:e.boss,x:e.x,z:e.z}))}))};}finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
