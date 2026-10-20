/* Injected into a LOCAL-ONLY disposable page. Staged physics checks, not human playtest evidence. */
(()=>{
 const box=document.querySelector('#districtQA'),report=document.querySelector('#districtResult');
 const button=(id,title,fn)=>{const n=document.createElement('button');n.id=id;n.textContent=title;n.onclick=()=>{try{report.value=JSON.stringify(fn());}catch(e){report.value=JSON.stringify({error:e.message,stack:e.stack});}};box.append(n);};
 const settle=(b,n=40)=>{b.input.jx=b.input.jz=0;b.input.jump=false;for(let i=0;i<n;i++)b.update(.016);};
 const place=(b,x,z,y=0)=>{Object.assign(b.G.p,{x,z,y,vx:0,vy:0,vz:0,onGround:true,jumps:0,invuln:99999});b.G.enemies.forEach(e=>e.stunT=99999);};
 function walk(b,x,z,jump=false,max=800){const p=b.G.p;let i=0,stuck=0,last=Infinity;
  for(;i<max;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<7)break;
   if(Math.abs(d-last)<.005)stuck++;else stuck=0;if(stuck>80)break;last=d;
   b.input.jx=dx/d;b.input.jz=dz/d;b.input.jump=jump;b.update(.016);
  }
  settle(b);return {target:[x,z],at:[p.x,p.y,p.z].map(n=>Math.round(n*10)/10),frames:i,ok:Math.hypot(x-p.x,z-p.z)<22};
 }
 window.districtWalk=walk;
 button('districtWatch','Check original watchpost stairs',()=>{const b=__BF3,results=[];place(b,130,-1060);for(let i=0;i<=20;i++)results.push(walk(b,100-i*28,-1060));results.push(walk(b,-620,-1000));window.districtWatchResults=results;return {staged:true,checks:results,endHeight:b.G.p.y};});
 button('districtWrong','Check wrong turns and recovery',()=>{const b=__BF3,results=[];
  for(const [name,x,z,tx,tz]of [['West homes',-700,300,-1800,300],['East fields',1550,-20,2200,-20],['South commons',0,850,0,1200]]){place(b,x,z);const hp=b.G.p.hp,r=walk(b,tx,tz);results.push({name,blocked:!r.ok,damage:hp-b.G.p.hp,...r});}
  place(b,120,-760);const r=walk(b,280,-830);results.push({name:'Return to main lane',...r});window.districtWrongResults=results;return {staged:true,checks:results};});
 button('districtOrchard','Walk complete orchard access',()=>{const b=__BF3,results=[];place(b,-1460,-790);
  for(const p of BFBriarDistrict.plan.roads.find(r=>r.id==='workshopOrchard').points.slice(1))results.push(walk(b,...p));
  for(const p of b.G.homefieldsExploration.orchardSteps)results.push(walk(b,p[0],p[1]));results.push(walk(b,-2210,-1840));
  window.districtOrchardResults=results;return {staged:true,checks:results,endHeight:b.G.p.y};});
 button('districtRoutes','Check ground routes',()=>{const b=__BF3,results=[];for(const r of BFBriarDistrict.plan.roads){place(b,...r.points[0]);for(const p of r.points.slice(1))results.push({route:r.id,...walk(b,...p)});}window.districtRouteResults=results;return {staged:true,checks:results,errors:districtErrors};});
 button('districtStairs','Check tower stairs both ways',()=>{const b=__BF3,results=[];place(b,2350,-960);for(const p of b.G.briarDistrict.stairUp)results.push({route:'up',...walk(b,p[0],p[1])});results.push({route:'top',...walk(b,2350,-1810)});results.push({route:'top',...walk(b,2100,-1810)});for(const p of b.G.briarDistrict.stairDown)results.push({route:'down',...walk(b,p[0],p[1])});for(const p of [...b.G.briarDistrict.stairDown].reverse())results.push({route:'return-up',...walk(b,p[0],p[1])});window.districtStairResults=results;return {staged:true,checks:results,errors:districtErrors};});
 button('districtJumps','Check picking deck jumps',()=>{const b=__BF3,results=[];place(b,-2105,-1840,164);const p=b.G.p;
  for(const [x,z,y,takeoff]of [[-1990,-1840,192,null],[-1810,-1950,224,[-1950,-1870]],[-1630,-1840,252,[-1750,-1910]]]){if(takeoff)results.push({route:'takeoff',...walk(b,...takeoff)});b.input.jump=true;b.input.jumpEdge=true;const r=walk(b,x,z,true,150);r.expectedHeight=y;r.ok=r.ok&&Math.abs(p.y-y)<2;results.push(r);}
  results.push({route:'miss-recovery',...walk(b,-1480,-1560,false)});window.districtJumpResults=results;return {staged:true,checks:results,errors:districtErrors};});
 button('districtMain','Check main quest and mill',()=>{const b=__BF3,results=window.districtMainResults=[],check=(name,ok)=>{results.push({name,ok:!!ok});if(!ok)throw Error(name);},act=key=>b.briarRequest('world',{key}),talk=(npc,choices)=>{b.briarRequest('open',{npc});check('Open '+npc,b.G.storyState.conversation);for(const choice of choices){b.briarRequest('choose',{line:b.G.storyState.conversation?.node,choice});}b.briarRequest('close');};
  place(b,0,470);let w=(x,z,j=false)=>{const r=walk(b,x,z,j);check('Walk '+x+','+z,r.ok);};
  w(0,410);talk('thomas',['protect','prepare']);w(-130,160);talk('mara',['help','accept']);w(-340,-65);
  for(const [k,x,z]of [['1',-410,-130],['2',-505,-245],['3',-370,-335]]){w(x,z);act('briar.root.'+k);}
  w(-180,-480);w(230,-480);w(230,-50);w(440,-50);w(440,-208);act('briar.dressings');check('Supplies collected',b.G.storyState.items.tangle_root===3&&b.G.storyState.items.dressings===1);
  w(440,-50);w(230,-50);w(230,-480);w(-180,-480);w(-190,80);talk('mara',['deliver']);check('Mill quest active',b.G.storyState.quests['briar.escape']==='active');
  for(const p of BFBriarDistrict.plan.roads[0].points.slice(2,9))w(...p);w(200,-1600);act('briar.water');w(200,-1880);settle(b,50);check('Crate holds sluice',b.G.storyState.flags['briar.water']);
  w(210,-1740);act('briar.jam');check('Wheel freed',b.G.storyState.flags['briar.jam']);w(0,-1990);w(0,-2040);act('briar.bridge');check('Opening bridge remains a barrier',b.G.walls.some(o=>o.storyBridge));settle(b,130);check('Lowered bridge opens',!b.G.walls.some(o=>o.storyBridge));w(180,-2030);w(180,-2200);w(130,-2320);check('Passed real mill crossing',b.G.p.z<-2280);window.districtMainResults=results;return {staged:true,checks:results,flags:b.G.storyState.flags,errors:districtErrors};
 });
 const locations=[['Village fields',120,-760,0],['West supply approach',-1700,-640,0],['Workshop return',-1170,-1100,0],['Orchard decks',-2210,-1840,164],['Bell ridge',2350,-1810,168],['Mill approach',200,-1450,0],['Southwest boundary',-850,300,0]];
 const legacy=document.createElement('button');legacy.id='districtLegacy';legacy.textContent='Load preserved legacy fixture';legacy.onclick=async()=>{try{const entries=await fetch('.qa-briar-district-legacy.json').then(r=>r.json());for(const [k,v]of entries)localStorage.setItem(k,v);const b=__BF3;b.loadMode('rl');if(b.meta.run)b.continueRun();else b.openHub();const initial={level:b.G.p.level,gold:b.meta.gold};b.enterZone(0);report.value=JSON.stringify({initial,after:{level:b.G.p.level,gold:b.meta.gold,district:b.G.briarDistrict?.revision,objects:b.G.storyObjects.length},errors:districtErrors});}catch(e){report.value=JSON.stringify({error:e.message});}};box.append(legacy);
 const select=document.createElement('select');select.setAttribute('aria-label','Inspect district location');for(const [name]of locations){const o=document.createElement('option');o.textContent=name;select.append(o);}box.append(select);
 button('districtInspect','Inspect selected location',()=>{const b=__BF3,[name,x,z,y]=locations[select.selectedIndex];place(b,x,z,y);settle(b,1);return {staged:true,name,at:[b.G.p.x,b.G.p.y,b.G.p.z]};});
})();
