async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.route('**/*',r=>r.continue());await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonCombat&&window.BFPrisonRun&&HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{const b=__BF3,C=BFPrisonCombat;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.openHub();b.startDelve('warrior');const g=b.G,p=g.p;for(const q of g.escape.plan.rooms)g.escape.states[q.id]={cleared:true};g.enemies=[];
 const rows=[];for(const type of Object.keys(C.roster)){
  g.enemies=[];const e=b.spawnEnemy(type,0,-720);e.active=true;e.dropT=0;e.prisonRoom=1;Object.assign(p,{x:0,z:-630,y:0,hp:100,invuln:0,dodgeTimer:0});let wind=false,strike=false,recovery=false;
  for(let i=0;i<220;i++){b.update(1/60);wind ||= e.pcState==='wind';strike ||= e.pcState==='strike';recovery ||= e.pcState==='recover';if(i%20===0){b.renderFrame();}}
  if(!wind||!strike||!recovery)throw Error('Missing attack phases '+type);rows.push({type,hp:p.hp,wind,strike,recovery});
 }
 // Controlled strike: one hit per attack, dodge immunity, and solid cover.
 g.enemies=[];const e=b.spawnEnemy('prison_pike',0,-720);e.active=true;e.dropT=0;e.prisonRoom=1;
 const arm=()=>Object.assign(e,{pcState:'strike',pcMove:'thrust',pcClock:.2,pcSerial:(e.pcSerial||0)+1,pcX:0,pcY:0,pcZ:-720,pcDX:0,pcDZ:1});
 Object.assign(p,{x:0,z:-640,y:0,hp:100,invuln:0,dodgeTimer:0});arm();b.update(.016);const hurt=p.hp;if(!(hurt<100))throw Error('Strike did not damage');p.invuln=0;b.update(.016);if(p.hp!==hurt)throw Error('Repeated same-strike damage');
 Object.assign(p,{hp:100,invuln:0,dodgeTimer:.4});arm();b.update(.016);if(p.hp!==100)throw Error('Dodge failed');p.dodgeTimer=0;p.vx=p.vz=0;p.x=0;p.z=-640;
 const cover={x:0,z:-675,y0:0,h:100,w:70,d:15};g.obstacles.push(cover);arm();b.update(.016);if(p.hp!==100)throw Error('Cover failed');g.obstacles.splice(g.obstacles.indexOf(cover),1);
 // Group aggression is capped, while every living foe eventually gets an opening.
 g.enemies=[];Object.assign(p,{x:0,z:-640,y:0,hp:100,invuln:999,dodgeTimer:0});for(let i=0;i<5;i++){const f=b.spawnEnemy('prison_pike',-40+i*20,-720);f.active=true;f.dropT=0;f.prisonRoom=1;}
 let peak=0;for(let i=0;i<650;i++){b.update(1/60);peak=Math.max(peak,g.enemies.filter(f=>['wind','strike'].includes(f.pcState)).length);}if(peak>2||g.enemies.some(f=>!f.pcSerial))throw Error('Aggression budget failed');
 g.enemies=[e];arm();
 // Existing co-op packet mirrors the same attack, including locked position and phase.
 const packet=b.MP.enemySnap(),serial=e.pcSerial;b.MP.active=true;b.MP.isHost=false;b.MP.zone=-304;g.enemies=[];b.MP.applyEnemies(packet,[]);const mirrored=g.enemies[0];if(!mirrored||mirrored.pcSerial!==serial||mirrored.prisonFoe!=='prison_pike')throw Error('Attack snapshot lost');Object.assign(p,{x:0,z:-640,hp:100,invuln:0,dodgeTimer:0});b.update(.016);if(p.hp!==100)throw Error('Unseen guest warning dealt damage');
 b.MP.active=false;b.MP.isHost=false;g.enemies=[];b.delveExit();return {rows,oneHit:true,dodge:true,cover:true,coOpSnapshot:true,missedWarningSafe:true,maxSimultaneous:peak};
 });if(errors.length)throw Error(errors.join('\n'));return result;
}