async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{
 const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.riftShards=[];b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.persist();b.enterZone(0);b.meta.camMode='far';b.meta.tutOff=true;for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;
 const checks=[],walks=[],ok=(name,v)=>{if(!v)throw Error(name);checks.push(name)},p=b.G.p;
 function walk(x,z,jump=false){for(let i=0;i<1100;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<16)break;b.input.jx=dx/d;b.input.jz=dz/d;if(jump&&i%30===0)b.input.jumpEdge=true;b.update(.016)}b.input.jx=b.input.jz=0;const pass=Math.hypot(x-p.x,z-p.z)<25;walks.push({x,z,actual:[p.x,p.y,p.z],pass});if(!pass)throw Error(JSON.stringify(walks))}
 function open(id){const n=b.G.storyNpcs.find(n=>n.id===id);Object.assign(b.G.p,{x:n.x,y:n.y,z:n.z});b.briarRequest('open',{npc:id})}
 function pick(choice){b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice})}
 function close(){b.briarRequest('close')}
 open('thomas');pick('protect');pick('prepare');close();
 open('gus');pick('help');pick('accept');close();
 b.briarRequest('world',{key:'briar.gus.tools'});ok('cannot grab loft tools from outside',!b.G.storyState.items.gus_tools);
 walk(-1500,-800);walk(-1500,-940);walk(-1500,-1250);b.input.jz=-1;for(let i=0;i<120;i++)b.update(.016);b.input.jz=0;ok('closed door blocks walking through',p.z>-1340);walk(-1500,-940);walk(-1660,-930);for(const [x,z]of b.G.gusWorkshop.steps)walk(x,z,true);walk(-1460,-1270,true);for(let i=0;i<60;i++)b.update(.016);
 b.briarRequest('world',{key:'briar.gus.tools'});ok('loft climb collects tools',b.G.storyState.items.gus_tools===1);
 walk(-1500,-1000);walk(-1500,-790);open('gus');pick('deliver');ok('quest awards a pending shard',b.G.pendingRiftShards.found.includes('BR-02')&&!b.meta.riftShards.length);ok('back door opens',!b.G.walls.some(w=>w.gusDoor));close();
 b.briarSync();b.briarSync();ok('reward remains once only',b.G.pendingRiftShards.found.length===1);
 walk(-1500,-950);walk(-1500,-1250);walk(-1500,-1430);walk(-1700,-1780);walk(-1850,-1760);
 b.restartCampaignCheckpoint();for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;
 ok('retry restores door and removes provisional shard',b.G.walls.some(w=>w.gusDoor)&&!b.G.pendingRiftShards?.found?.length&&!b.G.storyState.flags['gus.shortcut']);
 open('thomas');pick('protect');pick('prepare');close();open('gus');pick('mock');pick('sorry');close();const sign=b.G.storyObjects.find(o=>o.key==='briar.gus.sign');Object.assign(b.G.p,sign);b.briarRequest('world',{key:sign.key});ok('sign repair persists for attempt',b.G.storyState.flags['gus.sign_fixed']);open('gus');pick('repair');pick('help');pick('accept');close();ok('apology reopens tool quest',b.G.storyState.quests['briar.gus.tools']==='active');
 Object.assign(b.G.p,{x:-1460,z:-1270,y:104});b.briarRequest('world',{key:'briar.gus.tools'});open('gus');pick('deliver');close();b.nextArea();b.openPause();ok('finishing half banks actual quest reward',b.campaignCheckpoint().state.riftShards.includes('BR-02'));
 return {checks,walks};});
 await page.reload();await page.waitForFunction(()=>window.__BF3);const saved=await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.continueRun();b.openPause();return b.meta.riftShards.includes('BR-02')&&b.G.area===1});if(!saved)throw Error('Quest shard lost after reload');return {...result,reload:true};
}

