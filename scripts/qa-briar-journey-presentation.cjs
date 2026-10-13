async root=>{
 const ctx=await root.context().browser().newContext({viewport:{width:1440,height:900},recordVideo:{dir:'output/playwright/briar188-video',size:{width:1440,height:900}}}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:4345/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(()=>__BF3.briarReady);
 await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');Object.assign(b.meta,{classId:'warrior',run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,autoAttack:false,petActive:null,dialogueTTS:false,camMode:'far'});b.openHub();b.enterZone(0);Object.assign(b.G.storyState.flags,{'thomas.ready':true,'mara.healing':true});b.G.storyState.quests['briar.escape']='active';b.briarSync();Object.assign(b.G.p,{x:210,z:-1720,y:0,invuln:9999});for(const e of b.G.enemies)e.stunT=9999;b.G.camYaw=Math.PI;});await page.waitForFunction(()=>!BF_LOADING.active);await page.waitForTimeout(3200);
 const move=async(x,z)=>{for(let i=0;i<160;i++){const done=await page.evaluate(({x,z})=>{const b=__BF3,dx=x-b.G.p.x,dz=z-b.G.p.z,d=Math.hypot(dx,dz);b.input.jx=d>10?dx/d:0;b.input.jz=d>10?dz/d:0;return d<10;},{x,z});if(done){await page.waitForTimeout(120);return;}await page.waitForTimeout(60);}throw Error('Real-time move blocked '+x+','+z);};
 const interact=async()=>{await page.keyboard.press('e');await page.waitForTimeout(350);};
 await interact();await page.screenshot({path:'output/playwright/briar188-mistake.png'});
 await move(220,-1880);await move(130,-1880);await page.waitForTimeout(500);await page.screenshot({path:'output/playwright/briar188-weight-on.png'});
 await move(230,-1880);await page.waitForTimeout(500);await page.screenshot({path:'output/playwright/briar188-weight-off.png'});
 await move(220,-1510);await move(130,-1510);await interact();
 await move(130,-1790);await page.waitForTimeout(800);await page.screenshot({path:'output/playwright/briar188-weighted.png'});
 const weightedNotice=await page.evaluate(()=>BFJournalNotice.queue.current?.id);if(weightedNotice==='inspect.briar.jam')throw Error('Obsolete pressure hint remains visible');
 await move(210,-1740);await interact();await move(0,-1990);await move(0,-2040);await interact();await page.waitForTimeout(2200);await page.screenshot({path:'output/playwright/briar188-restored.png'});
 const mill=await page.evaluate(()=>({bridge:__BF3.G.briarMill.bridge,water:__BRIAR_JOURNEY_ART.mill.water.scale.z,gate:__BRIAR_JOURNEY_ART.mill.gate.position.y,wheel:__BF3.G.briarMill.wheel,notice:BFJournalNotice.queue.current?.id,flags:__BF3.G.storyState.flags,stats:__BF_RENDER_STATS,error:HERO3D.err}));if(mill.bridge!==1||mill.water<.99||mill.gate<69||!mill.flags['briar.jam']||mill.notice==='briar.mill')throw Error(JSON.stringify(mill));
 // Separate combat fixture: actual authored enemy coordinates, ordinary starter
 // health and no invulnerability. Other enemies are stunned for attribution.
 const guards=await page.evaluate(()=>{const b=__BF3;b.nextArea();for(const e of b.G.enemies)e.stunT=99999;const out=[];for(const e of b.G.enemies.filter(e=>e.woodsSignalGround)){const start={x:e.x,z:e.z,y:e.y};Object.assign(b.G.p,{x:e.x-110,z:e.z,y:0,hp:b.effMaxHp(b.G.p),invuln:0,dead:false,downed:false});Object.assign(e,{stunT:0,dropT:0,active:true,ceState:'hunt',ceClock:0});const hp=b.G.p.hp,phases=new Set();let frames=0;for(;frames<500&&b.G.p.hp===hp;frames++){b.update(.016);phases.add(e.ceState);}out.push({type:e.type,start,damage:hp-b.G.p.hp,frames,phases:[...phases]});e.stunT=99999;b.G.projectiles=[];}return out;});
 if(guards.some(e=>e.damage<=0||e.start.y!==0)||errors.length)throw Error(JSON.stringify({guards,errors}));return{mill,guards,errors,video:await page.video().path()};
 }finally{await ctx.close();}
}
