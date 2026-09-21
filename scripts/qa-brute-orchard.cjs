async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.petOwned=[];b.meta.petActive=null;b.openHub();b.enterZone(0);b.nextArea();b.nextArea();const checks=[],walks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};let g=b.G,p=g.p,e=g.boss;e.stunT=999;p.invuln=999;
 function walk(x,z){for(let i=0;i<1400;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<15)break;b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);}b.input.jx=b.input.jz=0;const good=Math.hypot(x-p.x,z-p.z)<26;walks.push({x,z,y:Math.round(p.y),good});if(!good)throw Error(JSON.stringify({walks,at:[p.x,p.y,p.z]}));}
 ok('authored arena only one initial boss',g._scapeTable==='BRUTE_ORCHARD'&&g.enemies.length===1);
 for(const [x,z]of [[0,550],[-600,500],[-1000,280],[-1000,-200],[-620,-400],[-500,-720],[0,-940],[550,-690],[1000,-690],[1000,-100],[670,240],[560,520],[0,600]])walk(x,z);
 e.stunT=0;e.active=true;Object.assign(e,{x:-340,z:-300,y:0,sx:-340,sz:-300,bruteState:'hunt',bruteClock:0,bruteTurns:0,bruteWaves:0});Object.assign(p,{x:-340,z:360,y:0});let n=0;while(e.bruteState!=='stagger'&&n++<250)b.update(.016);
 ok('actual charge hits west cart',e.bruteState==='stagger'&&e.z<100);ok('charge cannot pass through solid cover',e.z<50&&e.z>0);ok('stagger has a damage window',e.staggerT>2.9);
 const before=e.hp;b.hitEnemy(e,10,0,null,0,null);ok('stagger applies 1.6x damage',Math.abs(before-e.hp-16)<.01);
 e.hp=e.maxHp*.69;for(let i=0;i<120;i++)b.update(.016);ok('first threshold creates exactly two handlers',g.enemies.filter(x=>x.orchardHandler).length===2);
 e.hp=e.maxHp*.34;for(let i=0;i<120;i++)b.update(.016);ok('second threshold creates exactly two more',g.enemies.filter(x=>x.orchardHandler).length===4);
 e.stunT=999;for(let i=0;i<200;i++)b.update(.016);ok('no rubble accumulates',!g.obstacles.some(o=>o._rubble));
 e.stunT=0;Object.assign(e,{bruteState:'hunt',bruteClock:0,bruteTurns:2,x:0,z:0,y:0,sx:0,sz:0});Object.assign(p,{x:0,z:160,y:0});b.update(.016);ok('slam starts with warning, no hitbox',e.slamW>.9&&!g.shockwaves.some(w=>w.orchardId));for(let i=0;i<61;i++)b.update(.016);ok('slam wave follows warning',g.shockwaves.some(w=>w.orchardId));
 e.hp=0;b.killEnemy(e);ok('handlers hold exit after boss dies',!g.portal);for(const h of g.enemies.filter(x=>x.orchardHandler)){h.hp=0;b.killEnemy(h);}ok('exit opens after surviving handlers fall',!!g.portal);
 b.restartCampaignCheckpoint();g=b.G;ok('boss retry resets arena and waves',g.bruteArena&&g.enemies.length===1&&!g.boss.bruteWaves&&!g.portal);ok('boss retry stays at boss checkpoint',g.area===-1&&g.p.z===850);b.openPause();return {checks,walks};});
 if(errors.length)throw Error(errors.join(';'));return result;
}
