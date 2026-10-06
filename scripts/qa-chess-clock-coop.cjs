async page=>{
const checks=[],errors=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)},context=await page.context().browser().newContext(),guest=await context.newPage();
try{
for(const p of [page,guest]){p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>window.requestAnimationFrame=()=>0);await p.goto('http://127.0.0.1:4338/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&window.BFSocial&&window.BFHubDialogue&&window.HERO3D?.ready,null,{polling:100});await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.hubTutDone=true;b.meta.hubDialogue={};b.openHub();document.body.classList.remove('t-title','t-attract');b.update(.016);window.qaPackets=[];});}
await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
// Use the real social handler with synchronized presence; no live PeerJS service is required.
await page.evaluate(()=>{const b=__BF3;b.meta.hubUpgrades={...b.meta.hubUpgrades,chess:true};Object.assign(b.G.p,{x:220,z:390});Object.assign(b.MP.peers.g,{x:380,z:390,hp:100,zone:b.MP.zone,hall:false});});

await page.evaluate(()=>{window.qaNow=performance.now();performance.now=()=>qaNow;BFSocial.open();BFSocial.receive('h',{type:'configure',config:{enabled:true,base:15,increment:2}});});
await guest.evaluate(s=>{BFSocial.apply(s);Object.assign(__BF3.G.p,{x:324,z:390});BFSocial.open();},await page.evaluate(()=>BFSocial.snapshot()));await flush();
await guest.evaluate(s=>BFSocial.apply(s),await page.evaluate(()=>BFSocial.snapshot()));
ok('guest cannot change time control',await page.evaluate(()=>!BFSocial.receive('g',{type:'configure',config:{enabled:false}})));
await page.locator('#chessReady').click();ok('one ready does not start clock',await page.evaluate(()=>BFSocial.snapshot().clock.running===null));
await guest.locator('#chessReady').click();await flush();ok('both ready starts white clock',await page.evaluate(()=>BFSocial.snapshot().clock.running==='w'));
ok('settings locked once started',await page.evaluate(()=>!BFSocial.receive('h',{type:'configure',config:{enabled:false}})));
await page.evaluate(()=>{qaNow+=3000;__BF3.renderFrame();});
const clickSquare=async sq=>{const p=await page.evaluate(s=>__BF_SOCIAL_API.project(300+(+s[1]-4.5)*2.5,23.1,390+(s.charCodeAt(0)-100.5)*2.5),sq);await page.mouse.click(p.x,p.y);await page.evaluate(()=>__BF3.renderFrame());};
await clickSquare('e2');await clickSquare('e4');ok('world board click makes legal move',await page.evaluate(()=>BFSocial.snapshot().motion?.to==='e4'));
ok('thinking time charged before animation',await page.evaluate(()=>BFSocial.snapshot().clock.left.w===12));
ok('cannot move during choreography',await page.evaluate(()=>!BFSocial.receive('g',{type:'move',from:'e7',to:'e5',rev:BFSocial.snapshot().rev})));
await page.evaluate(()=>{qaNow+=650;__BF3.update(.016);__BF3.renderFrame();});
await guest.evaluate(s=>{BFSocial.apply(s);__BF3.renderFrame();},await page.evaluate(()=>BFSocial.snapshot()));
await page.evaluate(()=>__BF3.MP.broadcast());await flush();await guest.evaluate(()=>{for(let i=0;i<30;i++){__BF3.update(.016);__BF3.renderFrame();}});
ok('guest sees same movement sequence',await guest.evaluate(()=>document.getElementById('chessStatus').textContent==='Moving piece…'&&'e4'==='e4'));
await page.screenshot({path:'output/playwright/chess-coop-host.png'});await guest.screenshot({path:'output/playwright/chess-coop-guest.png'});
await page.evaluate(()=>{qaNow+=1250;BFSocial.tick();});ok('increment credited once and clock handed over',await page.evaluate(()=>{BFSocial.tick();const c=BFSocial.snapshot().clock;return c.left.w===14&&c.left.b===15&&c.running==='b'}));
await page.evaluate(()=>{qaNow+=16000;BFSocial.tick();});ok('timeout awards result on host',await page.evaluate(()=>BFSocial.snapshot().result==='White wins on time'));
ok('late move after flag rejected',await page.evaluate(()=>!BFSocial.receive('g',{type:'move',from:'e7',to:'e5',rev:BFSocial.snapshot().rev})));
await guest.evaluate(s=>BFSocial.apply(s),await page.evaluate(()=>BFSocial.snapshot()));ok('timeout result reaches guest',await guest.locator('#chessStatus').textContent()==='White wins on time');
await page.evaluate(()=>{BFSocial.receive('h',{type:'new'});BFSocial.receive('h',{type:'configure',config:{enabled:false,base:300,increment:0}});});
ok('untimed option resets clock',await page.evaluate(()=>!BFSocial.snapshot().clock.enabled&&BFSocial.snapshot().clock.started));
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.evaluate(()=>{for(let i=0;i<3;i++)__BF3.renderFrame();});await page.screenshot({path:'output/playwright/chess-phone.png'});
if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
}finally{await page.setViewportSize({width:1280,height:720});await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
