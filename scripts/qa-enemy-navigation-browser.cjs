async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.openHub();
  const G=b.G;G.obstacles=[];G.walls=[];G.doors=[];G.movers=[];G.crumbles=[];G.torches=[];
  G.segments=[{x:0,z:0,w:1000,d:1000}];G.obstacles=[{x:0,z:0,w:60,d:140,h:120}];
  const e={x:-160,z:0,y:0,r:16,h:40},target={x:160,z:0,y:0,h:40};let excursion=0;
  for(let i=0;i<700&&Math.hypot(e.x-target.x,e.z-target.z)>12;i++){
   G.time+=.016;b.moveGroundEnemy(e,target.x-e.x,target.z-e.z,100,.016);excursion=Math.max(excursion,Math.abs(e.z));
   if(Math.abs(e.x)<46&&Math.abs(e.z)<86)throw Error('Walked through solid obstacle');
  }
  if(Math.hypot(e.x-target.x,e.z-target.z)>15)throw Error('Failed detour '+JSON.stringify(e));
  const a={x:-20,z:0,y:0,h:40,r:18},p={x:20,z:0,y:0,h:40};G.obstacles=[{x:0,z:0,w:8,d:100,h:100}];
  if(b.enemyMeleeClear(a,p))throw Error('Melee penetrates cover');G.obstacles[0].h=10;
  if(!b.enemyMeleeClear(a,p))throw Error('Low floor blocks torso hit');
  G.obstacles=[];G.segments=[{x:0,z:0,w:100,d:100}];Object.assign(e,{x:30,z:0,y:0,_route:null,_routeAt:0});
  for(let i=0;i<100;i++){G.time+=.016;b.moveGroundEnemy(e,1,0,100,.016);}
  if(e.x>41)throw Error('Walked off ledge');
  G.segments=[{x:0,z:0,w:1000,d:1000}];G.obstacles=[{x:0,z:0,w:80,d:80,h:32}];
  if(!b.enemyRouteEdge({...e,r:10},{x:-60,z:0,y:0},{x:0,z:0,y:0}))throw Error('Cannot climb permitted step');
  G.obstacles[0].h=100;if(b.enemyRouteEdge({...e,r:10},{x:-60,z:0,y:0},{x:0,z:0,y:0}))throw Error('Climbs tall cover');
  return {detour:true,excursion:Math.round(excursion),cover:true,ledge:true,steps:true};
 });if(errors.length)throw Error(JSON.stringify(errors));return result;
}
