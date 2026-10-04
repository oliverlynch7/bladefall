async page=>{
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
 const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');
 const counts=[];const {buildPrisonArt}=await import('./prison-art3d.js?v=2110');
 for(let section=1;section<=3;section++){const plan=BFPrisonDungeon.layout(13,section,2,5),art=buildPrisonArt(plan);if(art.counts.drawCalls>10||art.counts.triangles>45000)throw Error('Art budget '+JSON.stringify(art.counts));for(const mesh of art.group.children){const a=mesh.geometry.attributes.position;for(let i=0;i<a.array.length;i++)if(!Number.isFinite(a.array[i]))throw Error('Bad geometry');}counts.push(art.counts);art.group.userData.dispose();}
 const g=b.G,s=BFPrisonRun.packet();for(const q of g.escape.plan.rooms)s.states[q.id]={cleared:true};s.stamp=100;g.chests=[];g.escape.chestRooms={};BFPrisonRun.receive(s);if(g.chests.length!==2||g.chests[0].rarity!=='common'||g.chests[1].rarity!=='uncommon')throw Error('Guest rewards');g.chests[0].opened=true;BFPrisonRun.receive(s);BFPrisonRun.receive({...s,stamp:101});if(g.chests.length!==2||!g.chests[0].opened)throw Error('Duplicate/reopened reward');BFPrisonRun.checkpoint();b.openHub();b.startDelve('warrior',{resume:true});if(b.G.chests.length!==2||!b.G.chests[0].opened)throw Error('Resume rewards');
 b.meta.camMode='shoulder';b.G.runSeed=13;b.loadDelveFloor(1);const q=b.G.escape.plan.rooms[7];Object.assign(b.G.p,{x:q.x,z:q.z+210,y:0,yaw:Math.PI});b.G.cam={x:b.G.p.x,y:0,z:b.G.p.z};b.G.camYaw=Math.PI;b.G.camPitch=.35;b.renderFrame();b.renderFrame();return {counts,guestChests:2,replayedPacketsSafe:true,resumeOpenedChest:true};});
 await page.screenshot({path:'output/playwright/prison-refectory-2110.png'});return result;
}

