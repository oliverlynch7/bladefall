// Local browser fixture: navigation uses real movement/collision; enemies are
// stunned here. Separate combat probes exercise damage without invulnerability.
async root=>{
 const ctx=await root.context().browser().newContext({viewport:{width:1440,height:900}}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:4345/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(()=>__BF3.briarReady);
 await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');Object.assign(b.meta,{classId:'warrior',run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,autoAttack:false,petActive:null,dialogueTTS:false,camMode:'far'});b.openHub();b.enterZone(0);b.G.p.invuln=99999;for(const e of b.G.enemies)e.stunT=99999;
 window.qaChecks=[];window.qaWalks=[];window.check=(n,v)=>{if(!v)throw Error(n+' '+JSON.stringify({items:__BF3.G.storyState.items,flags:__BF3.G.storyState.flags,at:[__BF3.G.p.x,__BF3.G.p.y,__BF3.G.p.z],mode:__BF3.mode}));qaChecks.push(n);};
 window.walk=(x,z,jump=false)=>{const b=__BF3,p=b.G.p;let i=0;for(;i<1200;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<9)break;b.input.jx=dx/d;b.input.jz=dz/d;b.input.jump=jump;if(jump&&p.onGround)b.input.jumpEdge=true;b.update(.016);}b.input.jx=b.input.jz=0;b.input.jump=false;for(let settle=0;settle<65;settle++)b.update(.016);const ok=Math.hypot(x-p.x,z-p.z)<22;const r={target:[x,z],at:[p.x,p.y,p.z].map(Math.round),frames:i,ok};qaWalks.push(r);if(!ok)throw Error('Walk blocked '+JSON.stringify(r));};
 window.act=key=>__BF3.briarRequest('world',{key});window.talk=(npc,choices)=>{const b=__BF3;b.briarRequest('open',{npc});check('Open '+npc,!!b.G.storyState.conversation);for(const choice of choices){const line=b.G.storyState.conversation?.node;if(!line)throw Error('Missing dialogue '+npc+choice);b.briarRequest('choose',{line,choice});}b.briarRequest('close');};
 });await page.waitForFunction(()=>!BF_LOADING.active);
 await page.evaluate(()=>{
 const b=__BF3,p=b.G.p;
 walk(0,410);talk('thomas',['protect','prepare']);walk(-130,160);talk('mara',['help','accept']);
 walk(-340,-65);for(const [key,x,z]of [['1',-410,-130],['2',-505,-245],['3',-370,-335]]){walk(x,z);act('briar.root.'+key);}
 walk(-180,-480);walk(230,-480);walk(440,-430);walk(440,-360,true);walk(440,-308,true);walk(440,-255);act('briar.dressings');check('All physical supplies collected',b.G.storyState.items.tangle_root===3&&b.G.storyState.items.dressings===1);
 walk(440,-308,true);walk(440,-435,true);walk(230,-480);walk(-180,-480);walk(-190,80);talk('mara',['deliver']);check('Delivery immediately activates mill quest',b.G.storyState.quests['briar.escape']==='active'&&b.G.storyState.flags['mara.healing']);
 walk(-180,-480);walk(-180,-860);for(const q of b.G.campaignLayout.edges.find(e=>e.a===2&&e.b===4).points)walk(q.x,q.z);walk(100,-1470);
 });
 await page.evaluate(()=>{walk(210,-1740);act('briar.jam');check('Rushing the jam fails safely',!__BF3.G.storyState.flags['briar.jam']);walk(230,-1880);walk(130,-1880);for(let i=0;i<32;i++)__BF3.update(.016);check('Player weight closes the sluice',__BF3.G.briarMill.water<.1);});
 await page.screenshot({path:'output/playwright/briar188-plate-demonstration.png'});
 await page.evaluate(()=>{walk(230,-1880);for(let i=0;i<32;i++)__BF3.update(.016);check('Stepping off restores flow',__BF3.G.briarMill.water>.9);walk(220,-1510);walk(130,-1510);act('briar.water');check('Crate can be gripped from the walking lane',__BF3.G.briarMill.owner==='solo');walk(130,-1690);act('briar.water');walk(5,-1730);act('briar.mill.reset');check('Reset returns a misplaced crate',__BF3.G.briarMill.z===-1600&&!__BF3.G.briarMill.owner);walk(0,-1490);walk(130,-1510);act('briar.water');walk(130,-1790);for(let i=0;i<60;i++)__BF3.update(.016);check('Crate weight holds the sluice and advances quest',__BF3.G.storyState.flags['briar.water']&&!__BF3.G.briarMill.owner);walk(210,-1740);act('briar.jam');check('Timber is removed',__BF3.G.storyState.flags['briar.jam']);walk(0,-1990);walk(0,-2040);act('briar.bridge');check('Bridge collision remains during lowering',__BF3.G.walls.some(w=>w.storyBridge)&&__BF3.G.briarMill.bridge<1);});
 await page.waitForTimeout(2200);await page.screenshot({path:'output/playwright/briar188-open-crossing.png'});
 await page.evaluate(()=>{const b=__BF3;check('Lowered crossing removes the closed barrier',b.G.briarMill.bridge===1&&!b.G.walls.some(w=>w.storyBridge));walk(180,-2030);walk(180,-2200);walk(130,-2320);walk(50,-2620);for(const [a,c]of [[8,10],[10,12]]){for(const q of b.G.campaignLayout.edges.find(e=>e.a===a&&e.b===c).points)walk(q.x,q.z);const r=b.G.rooms[c];walk(r.x,r.z);}walk(-210,-4240);act('briar.depart');check('Guard objective still blocks evacuation',!b.G.storyState.flags['briar.depart']);for(const e of b.G.enemies)if(e.briarGuard){e.dead=true;e.hp=0;}act('briar.depart');check('Departure opens the Woods transition',b.G.storyState.quests['briar.escape']==='complete'&&!!b.G.portal);b.nextArea();for(const e of b.G.enemies)e.stunT=99999;b.G.p.invuln=99999;});
 await page.waitForFunction(()=>!BF_LOADING.active);
 await page.evaluate(()=>{const b=__BF3;check('Signal defenders occupy the ground storey',b.G.enemies.filter(e=>e.woodsSignalGround).length===2&&b.G.enemies.filter(e=>e.woodsSignalGround).every(e=>e.y===0));walk(-100,230);talk('lewis',['route','go']);for(const [x,z]of [[0,-600],[-650,-1250],[-650,-1850],[0,-2600],[80,-3000]])walk(x,z);act('woods.signal.crank');check('Ground-route crank opens the north shelter',b.G.storyState.flags['woods.signal']&&b.G.storyNpcs.find(n=>n.id==='lewis').z===-4250&&!!b.G.portal);for(const [x,z]of [[0,-3540],[0,-3900],[0,-4300]])walk(x,z);b.nextArea();check('Briar reaches its Brute encounter',b.G.area===-1&&!!b.G.boss);b.autosaveRun();});
 const evidence=await page.evaluate(()=>({checks:qaChecks,walks:qaWalks,mode:__BF3.mode,boss:__BF3.G.boss.type,bounds:__BF3.G.bounds}));
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{await __BF3.briarReady;__BF3.loadMode('rl');__BF3.continueRun();});
 const saved=await page.evaluate(()=>({area:__BF3.G.area,depart:!!__BF3.G.storyState.flags['briar.depart'],signal:!!__BF3.G.storyState.flags['woods.signal'],reward:!!__BF3.G.storyClaims['briar.mara.supplies']}));
 if(saved.area!==-1||!saved.depart||!saved.signal||!saved.reward||errors.length)throw Error(JSON.stringify({saved,errors}));return {...evidence,saved,errors};
 }finally{await ctx.close();}
}
