async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 return page.evaluate(async()=>{
 const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;
 const assert=(v,s)=>{if(!v)throw Error(s)},near=(a,c)=>Math.abs(a-c)<1e-8,rows=[];
 for(let z=0;z<8;z++){b.openHub();b.enterZone(z);for(let a=0;a<2;a++){b.G.area=a;const m=b.campaignEnemyDamageMul();assert(near(m,z?1+z*.1+a*.03:1),'damage curve');const e=b.spawnEnemy('grunt',900,900);rows.push({zone:z,half:a+1,multiplier:m,damage:e.dmg});}b.G.area=-1;assert(b.campaignEnemyDamageMul()===1,'boss arena');}
 b.openHub();assert(b.campaignEnemyDamageMul()===1,'hub');b.enterZone(4);b.G.area=0;
 b.MP.active=true;b.MP.isHost=true;b.MP.pvp=false;b.MP.zone=4;b.MP.peers={};
 const e=b.spawnEnemy('grunt',900,900);e.hp=e.maxHp*.37;const original=e.maxHp;const dummy=b.spawnEnemy('grunt',900,900);dummy.dummy=true;const dh=dummy.maxHp;
 const party=n=>{b.MP.peers={};for(let i=1;i<n;i++)b.MP.peers[i]={zone:4};b.syncCampaignPartyHealth();};
 const parties=[];for(const n of [2,3,4,2,1]){party(n);assert(e.maxHp===Math.round(original*(1+.6*(n-1))),'party max');assert(near(e.hp/e.maxHp,.37),'party fraction');assert(dummy.maxHp===dh,'dummy');parties.push({players:n,maxHp:e.maxHp,hp:e.hp});}
 for(let i=0;i<20;i++){party(2);party(1);}assert(e.maxHp===original&&near(e.hp,original*.37),'drift');
 party(2);const fresh=b.spawnEnemy('grunt',900,900);const freshMax=fresh.maxHp;b.syncCampaignPartyHealth();assert(fresh.maxHp===freshMax,'double scale');
 b.MP.active=false;b.syncCampaignPartyHealth();assert(e.maxHp===original,'offline restore');
 b.MP.active=true;b.MP.isHost=false;e.partyHealthMul=1;const guestMax=e.maxHp;b.syncCampaignPartyHealth();assert(e.maxHp===guestMax,'guest authority');
 b.MP.active=false;b.MP.isHost=true;b.openHub();b.enterZone(7);b.G.area=-1;b.loadArea();const boss=b.G.boss;const base=boss.akBaseHP;
 b.MP.active=true;b.MP.zone=7;b.MP.peers={friend:{zone:7}};b.syncCampaignPartyHealth();assert(near(boss.akBaseHP,base*1.6),'king base');BFFinalKing.startFight(boss,2);boss.hp=boss.maxHp*.4;const phaseMax=boss.maxHp;b.MP.peers={};b.syncCampaignPartyHealth();assert(boss.maxHp===Math.round(phaseMax/1.6)&&near(boss.hp/boss.maxHp,.4),'king phase');
 b.G.trial=true;assert(b.campaignEnemyDamageMul()===1,'trial exclusion');b.G.trial=false;b.MP.active=false;
 return {rows,parties,repeatCycles:20,checks:['curve','boss-arena exclusion','hub exclusion','trial exclusion','late joins and departures','health fraction','dummy exclusion','no compounding','spawn scaling','offline restore','guest authority','king second phase']};
 });
}
