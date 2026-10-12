async root=>{
 const ctx=await root.context().browser().newContext({viewport:{width:1280,height:720}}),page=await ctx.newPage();
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto('http://127.0.0.1:4345/3d/?mute=1&qa=placement2183');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready,null,{polling:100});
  const rows=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.petActive=null;b.openHub();const rows=[];
   for(let zone=0;zone<8;zone++)for(const area of [0,1]){
    b.openHub();b.enterZone(zone);b.G.area=area;b.loadArea();const g=b.G;
    const enemies=g.enemies.filter(e=>!e.dead&&!e.boss&&!e.dummy&&!e.practice&&e.kind!=='fly'&&!e.crackWall).map(e=>{
     const floor=b.enemySupport(e),q={...e,hh:e.hh||56};b.resolveObstacles(q,e.r,null,0);
     return {type:e.type,at:[e.x,e.y,e.z],floor:Number.isFinite(floor)?floor:null,push:Math.round(Math.hypot(q.x-e.x,q.z-e.z)),pushTo:[q.x,q.z],role:e.role,patrol:e.patrolGroup};
    });
    const objects=g.storyObjects.map(o=>{
     let spots=0;const range=Math.min(o.range||92,100);
     for(const r of [range*.45,range*.8])for(let i=0;i<12;i++){
      const x=o.x+Math.sin(i*Math.PI/6)*r,z=o.z+Math.cos(i*Math.PI/6)*r,q={x,z,y:o.y||0,r:18,hh:56},floor=b.enemySupport(q);if(!Number.isFinite(floor)||Math.abs(floor-q.y)>32)continue;q.y=floor;b.resolveObstacles(q,q.r,null,0);if(Math.hypot(q.x-x,q.z-z)<2)spots++;
     }
     return {key:o.key,kind:o.kind,at:[o.x,o.y,o.z],spots};
    });
    const rests=[];b.releaseKeyboard();for(const e of g.enemies)e.stunT=999;
    for(const pad of g.healpads){
     const f=b.enemySupport({...pad,r:0});if(!Number.isFinite(f)||Math.abs(f-pad.y)>1)throw Error('Rest center off floor '+JSON.stringify(pad));
     if(!pad.infinite)for(let i=0;i<8;i++){const y=b.enemySupport({x:pad.x+Math.sin(i*Math.PI/4)*(pad.r+5),z:pad.z+Math.cos(i*Math.PI/4)*(pad.r+5),y:pad.y,r:0});if(!Number.isFinite(y)||Math.abs(y-pad.y)>1)throw Error('Rest footprint crosses a step '+JSON.stringify(pad));}
     let heal=null;
     if(!pad.locked&&!pad.infinite){
      const max=b.effMaxHp(g.p);pad.charge=1;Object.assign(g.p,{x:pad.x,y:pad.y,z:pad.z,hp:max*.1,invuln:999,vy:0,vx:0,vz:0,onGround:true});
      for(let i=0;i<100;i++)b.update(.02);
      heal=g.p.hp-max*.1;if(Math.abs(heal-max*.4)>1||pad.charge>.002||Math.abs(g.p.y-pad.y)>2)throw Error('Rest not usable '+JSON.stringify({zone,area,pad,heal,player:[g.p.x,g.p.y,g.p.z],mode:b.mode}));
     }
     rests.push({at:[pad.x,pad.y,pad.z],floor:f,locked:!!pad.locked,healed:heal});
    }
    const respawns=[],slots=g.patrolWork?.slots||[];
    for(const slot of slots){const original=g.enemies.find(e=>e.mid===slot.mid);if(!original)throw Error('Missing patrol member');original.dead=true;original.hp=0;slot.readyAt=0;}
    for(const slot of slots){
     const positions=Array.from({length:16},(_,i)=>({x:slot.x+Math.sin(i*Math.PI/8)*500,z:slot.z+Math.cos(i*Math.PI/8)*500,y:slot.y}));
     const player=positions.find(p=>slots.every(s=>Math.hypot(p.x-s.x,p.z-s.z)>220));if(!player)throw Error('No patrol test spot');
     BFCampaignPatrols.tick(g,g.storyState,.016,{host:true,players:[player],notice:()=>{},spawn:(...args)=>{const e=b.spawnEnemy(...args);respawns.push(e);return e;}});
    }
    for(const e of respawns){const slot=slots.find(s=>s.mid===e.mid);if(!slot||e.y!==slot.y||e.x!==slot.x||e.z!==slot.z)throw Error('Wrong patrol refill point');}
    if(respawns.length!==slots.length)throw Error('Missing patrol respawns '+zone+'.'+area);
    rows.push({zone,area,name:g.areaName,rests,respawns:respawns.length,unresolved:g.campaignPlacement?.unresolved,missingDecorColors:g.deco.filter(d=>d.y0!=null&&!d.c).length,enemyCount:enemies.length,enemyIssues:enemies.filter(e=>e.floor==null||Math.abs(e.floor-e.at[1])>32||e.push>16),objectIssues:objects.filter(o=>!o.spots),objects});
   }return rows;
  });
  for(const r of rows){if(r.enemyIssues.length||r.unresolved.length||r.missingDecorColors)throw Error(JSON.stringify(r));}
  return {halves:rows.length,enemies:rows.reduce((n,r)=>n+r.enemyCount,0),patrolRefills:rows.reduce((n,r)=>n+r.respawns,0),rows};
 }finally{await ctx.close();}
}
