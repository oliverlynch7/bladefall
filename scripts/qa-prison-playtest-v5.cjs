async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
 const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.run=null;b.meta.bank=null;b.openHub();b.startDelve('warrior');let g=b.G,p=g.p;
 const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 check(g.escape.plan.rooms.length===9,'room count');const required=g.escape.plan.rooms.filter(q=>!q.optional&&['fight','waves','boss'].includes(q.kind));check(required.length===5,'encounters');
 // Pickup all three kinds through the real proximity/update path, regardless of stale old auto-sell setting.
 b.meta.stash=[];b.meta.autoKeep=true;b.meta.autoBag=false;g.enemies=[];
 for(const item of [{weapon:b.makeWeapon('sword','common')},{armor:b.makeArmor('common','chest')},{trinket:b.makeTrinket('common','ring')}])b.pushLoot(p.x,p.z,p.y,item);
 b.update(.016);check(b.meta.stash.length===3&&!g.lootCard&&!g.pickups.length,'immediate pickup');
 const cp=BFPrisonRun.profile().checkpoint;check(cp.stash.length===3&&cp.pickups.length===0,'atomic pickup checkpoint');
 while(b.meta.stash.length<b.STASH_CAP)b.meta.stash.push({weapon:b.makeWeapon('sword','common')});const gold=BFPrisonRun.profile().gold;
 b.pushLoot(p.x,p.z,p.y,{weapon:b.makeWeapon('sword','common')});b.update(.016);check(BFPrisonRun.profile().gold>gold,'overflow gold');check(b.meta.stash.length===b.STASH_CAP,'capacity');
 const chestCounts={};for(const rarity of ['common','uncommon','rare']){chestCounts[rarity]={};for(let i=0;i<200;i++){g.pickups=[];b.openChest({x:100,z:100,y:0,rarity,opened:false});check(g.pickups.length===1,'one chest item');const it=g.pickups[0].weapon||g.pickups[0].armor||g.pickups[0].trinket;chestCounts[rarity][it.rarity]=(chestCounts[rarity][it.rarity]||0)+1;}}
 check(!chestCounts.common.rare&&!chestCounts.common.epic,'common quality');g.pickups=[];
 // Every new required encounter gates exit, and exactly two chests are earned.
 for(const floor of [1,2,3]){b.loadDelveFloor(floor);g=b.G;p=g.p;for(const q of required){const room=g.escape.plan.rooms[q.id];Object.assign(p,{x:room.x,z:room.z+80,y:0,invuln:999});for(let wave=0;wave<(room.kind==='waves'?2:1);wave++){BFPrisonRun.tick(.016);g.enemies.forEach(e=>{e.dead=true;e.hp=0;});g.time+=5;BFPrisonRun.tick(.016);g.time+=4;}}
 check(g.floorCleared&&g.portal,'exit '+floor);check(g.chests.length===2,'chest count '+floor);}
 // Measured jumps use game physics and steering, never teleport between launch and landing.
 b.meta.camMode="shoulder";const jumps=[];for(const seed of [1,2,3]){g.runSeed=seed;b.loadDelveFloor(1);for(const r of g.escape.plan.rooms)g.escape.states[r.id]={cleared:true};const pts=g.escape.plan.rooms[2].waypoints;
 for(let n=0;n<pts.length-1;n++){const a=pts[n],z=pts[n+1],angle=Math.atan2(z.x-a.x,z.z-a.z);Object.assign(p,{x:a.x+Math.sin(angle)*22,z:a.z+Math.cos(angle)*22,y:a.y,vx:Math.sin(angle)*180,vy:0,vz:Math.cos(angle)*180,onGround:true,jumps:0,hp:1000,invuln:999});b.input.jump=true;b.input.jumpEdge=true;let left=false,land=false;const trace=[];
 for(let f=0;f<150;f++){g.camYaw=Math.atan2(z.x-p.x,z.z-p.z);b.input.up=Math.hypot(z.x-p.x,z.z-p.z)>5;b.update(1/60);if(f%5===0)trace.push([f,Math.round(p.x),Math.round(p.y),Math.round(p.z)]);if(!p.onGround)left=true;if(left&&p.onGround){land=Math.hypot(z.x-p.x,z.z-p.z)<40&&Math.abs(p.y-z.y)<3;break;}}
 b.releaseKeyboard();check(land,'jump '+seed+':'+n+' '+JSON.stringify({x:p.x,z:p.z,y:p.y,target:z,trace}));jumps.push(seed+':'+n);}}
 b.meta.camMode='far';Object.assign(p,{x:0,y:0,z:-900});g.cam={x:p.x,y:0,z:p.z};b.renderFrame();
 return {rooms:9,required:5,chestsPerFloor:2,immediateBag:true,overflowGold:true,chestCounts,jumps:jumps.length,camera:g.eye};
 });await page.screenshot({path:'output/playwright/prison-playtest-v5.png'});if(errors.length)throw Error(errors.join(';'));return result;
}
