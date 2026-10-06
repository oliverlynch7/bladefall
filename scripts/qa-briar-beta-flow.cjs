async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4338/3d/?devbriar=1&mute=1');await page.waitForFunction(()=>window.__BF3&&document.getElementById('bstart'),null,{polling:100});await page.locator('#bstart').click();
 return await page.evaluate(()=>{
 const b=__BF3,check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)b.update(1/60);};let g=b.G,s=g.devBriar,p=g.p;const jumps=[];
 function at(x,z,y=0){b.releaseKeyboard();Object.assign(p,{x,z,y,onGround:true,jumps:0,vx:0,vy:0,vz:0,hp:10000,invuln:999});}
 function use(x,z,y,label){at(x,z,y);b.updateInteract();check(g.interact?.label===label,'Interaction '+g.interact?.label+' expected '+label);b.doInteract();}
 function jump(a,t,id){at(a.x,a.z,a.h||0);const angle=Math.atan2(t.x-a.x,t.z-a.z);Object.assign(p,{x:p.x+Math.sin(angle)*24,z:p.z+Math.cos(angle)*24,vx:Math.sin(angle)*180,vz:Math.cos(angle)*180});b.input.jump=true;b.input.jumpEdge=true;let left=false,land=false,trace=[];
 for(let f=0;f<150;f++){g.camYaw=Math.atan2(t.x-p.x,t.z-p.z);b.input.up=Math.hypot(t.x-p.x,t.z-p.z)>5;b.update(1/60);if(f%10===0)trace.push([Math.round(p.x),Math.round(p.y),Math.round(p.z)]);if(!p.onGround)left=true;if(left&&p.onGround){land=Math.abs(p.y-t.h)<3&&Math.abs(p.x-t.x)<t.w/2+10&&Math.abs(p.z-t.z)<t.d/2+10;break;}}
 b.releaseKeyboard();check(land,'Jump '+id+' failed '+JSON.stringify({at:[p.x,p.y,p.z],target:t,trace}));jumps.push(id);}
 function route(ids,start){let prev=start;for(const id of ids){const t=s.plats.find(q=>q.id===id);jump(prev,t,id);prev=t;}}
 // This test isolates traversal physics from combat. Combat has a separate test.
 g.enemies=[];for(const q of s.groups)q.spawned=true;
 route(['roof0','roof1','roof2','roof3','loft'],{x:340,z:50,h:0});
 use(s.med.x,s.med.z,s.med.y,'Take the medical satchel');check(BFBriarBeta.progress.medicine,'Medicine');
 route(['ridge0','ridge1','ridge2'],s.plats.find(q=>q.id==='loft'));
 use(860,-850,350,'Collect Rift Shard');check(BFBriarBeta.progress.shards.length===1,'Shard');
 use(-300,220,0,'Deliver Mara’s supplies');document.getElementById('bb0').click();check(BFBriarBeta.progress.healing,'Mara unlock');
 at(s.plateAt.x,s.plateAt.z);step(40);check(s.plate>.9,'Body weight');at(-100,-400);step(50);check(s.plate<.1,'Body releases plate');
 use(-200,-445,0,'Move the grain crate');check(s.drag,'Grab crate');g.camYaw=-Math.PI/2;b.input.up=true;step(65);b.releaseKeyboard();
 check(s.crate.x< -350,'Crate did not follow ordinary movement '+s.crate.x);
 // Place precisely via player position to isolate mechanism behavior after the control check.
 at(-415,-490);s.drag=true;s.dragOffset={x:-60,z:0};step(2);s.drag=false;at(-150,-400);step(45);check(s.plate>.9,'Crate weight did not hold plate');
 route(['mill0','mill1','mill2','mill3','catch'],{x:-360,z:-505,h:0});
 use(-320,-950,205,'Free the jammed timber');check(BFBriarBeta.progress.bridge,'Bridge release');step(140);check(g.movers.includes(s.bridge),'Bridge collider');
 route(['bank0','bank1'],{x:260,z:-1150,h:0});
 use(450,-1170,95,'Collect Rift Shard');
 at(0,-1400);for(let i=0;i<2400&&!BFBriarBeta.progress.evacuated;i++){for(const e of g.enemies)e.dead=true;b.update(1/60);}check(BFBriarBeta.progress.evacuated,'Evacuation actors did not finish');use(0,-1770,0,'Enter the Black Woods');g=b.G;s=g.devBriar;p=g.p;check(s.part===1,'Chapter transition');g.enemies=[];for(const q of s.groups)q.spawned=true;
 route(['stream0','stream1','stream2','stream3'],{x:0,z:-310,h:0});
 route(['tower0','tower1','tower2','tower3','tower-top'],{x:0,z:-1370,h:0});
 use(-40,-1920,255,'Cut the signal cable');check(BFBriarBeta.progress.signal,'Signal');
 route(['canopy0','canopy1','canopy2'],s.plats.find(q=>q.id==='tower2'));
 use(700,-1900,300,'Collect Rift Shard');
 route(['pen-roof0','pen-roof1','pen-roof2'],{x:-420,z:-1020,h:0});use(-780,-730,160,'Collect Rift Shard');
 route(['lookout0','lookout1','lookout2'],{x:-440,z:-2460,h:0});use(-760,-2710,160,'Collect Rift Shard');
 use(-690,-1030,0,'Open the captive pen');use(690,-1410,0,'Release the two dogs');
 check(BFBriarBeta.progress.shards.length===5,'Shard count');check(BFBriarBeta.progress.captive&&BFBriarBeta.progress.dogs,'Rescues');
 return {jumps,progress:BFBriarBeta.progress,description:'Physics/state checks; per-jump starts positioned directly. Not an unassisted playthrough.'};
 });
}
