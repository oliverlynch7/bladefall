async page=>{await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);return page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.meta.classId='warrior';const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 function prep(kind){b.MP.active=false;b.openHub();b.enterZone(0);const e=b.G.enemies.find(e=>e.ceKind);for(const q of b.G.enemies)if(q!==e)q.stunT=999;Object.assign(e,{ceKind:kind,ceState:'wind',ceClock:BFCampaignElites.kits[kind].wind,ceSerial:1,ceX:e.x,ceZ:e.z,ceY:e.y,ceDX:0,ceDZ:1,stunT:0,active:true,dropT:0});Object.assign(b.G.p,{x:e.x,z:e.z+90,y:e.y,hp:10000,invuln:0,dodgeTimer:0,vx:0,vz:0,vy:0});return e;}
 for(const kind of ['raid','forge','shore','tower']){
  let e=prep(kind),p=b.G.p,hp=p.hp;while(e.ceState==='wind'||e.ceState==='strike'){p.dodgeTimer=1;b.update(.01);}ok(kind+' dodge prevents strike',p.hp===hp);
  e=prep(kind);p=b.G.p;hp=p.hp;b.G.obstacles.push({x:e.x,z:e.z+45,w:45,d:12,h:e.y+100,y0:e.y,kind:'plat'});while(e.ceState==='wind'||e.ceState==='strike')b.update(.01);ok(kind+' solid cover stops damage',p.hp===hp);
 }
 let e=prep('forge'),p=b.G.p,hp=p.hp;while(e.ceState==='wind'||e.ceState==='strike'){p.y=e.y+65;p.vy=0;b.update(.01);}ok('forge pulse clears a jumping player',p.hp===hp);
 e=prep('raid');const oldX=e.x;e.hurtKbX=-150;for(let i=0;i<10;i++)b.update(.01);ok('weapon knockback moves elites and interrupts the locked attack',e.x<oldX-2&&Math.abs(e.hurtKbX)<150&&e.ceState==='recover');
 e=prep('tower');const clock=e.ceClock;b.openPause();for(let i=0;i<100;i++)b.update(.01);ok('pause freezes encounter clock',e.ceClock===clock);
 e=prep('raid');e.hp=0;b.killEnemy(e,false);hp=b.G.p.hp;for(let i=0;i<180;i++)b.update(.01);ok('death cancels a pending strike',b.G.p.hp===hp&&e.ceState==='wind');
 b.openHub();b.enterZone(5);e=b.G.enemies.find(e=>e.ceKind);for(const q of b.G.enemies)if(q!==e)q.stunT=999;Object.assign(e,{active:true,dropT:0,stunT:0});Object.assign(b.G.p,{x:e.x,z:e.z+500,y:e.y,hp:10000,invuln:999});const start=e.z;for(let i=0;i<500;i++)b.update(.01);ok('shore raider closes distance before aiming',Math.abs(e.z-start)>50);
 return {checks};});}
