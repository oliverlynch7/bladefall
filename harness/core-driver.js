(function (root) {
  'use strict';
  const STEP = 1 / 60;
  const active = g => (g?.enemies || []).filter(e => !e.dead && e.hp > 0 && !e.dummy && !e.practice);
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const median = a => { if (!a.length) return 0; const b = [...a].sort((x,y)=>x-y), m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; };
  const round = (n, d=3) => Number(Number(n || 0).toFixed(d));

  function api() { if (!root.__BF3) throw new Error('window.__BF3 is unavailable'); return root.__BF3; }
  function dismissOverlay() {
    const ov = document.querySelector('#overlay:not(.hide)');
    if (!ov) return false;
    const btn = [...ov.querySelectorAll('button')].find(b => /stash|continue|take|choose|rise|enter|return/i.test(b.textContent)) || ov.querySelector('button');
    if (btn) { btn.click(); return true; }
    return false;
  }
  function pump(seconds, tick) {
    const h=api(), n=Math.max(1,Math.ceil(seconds/STEP));
    for(let i=0;i<n;i++){ dismissOverlay(); if(tick) tick(h.G,i); h.update(STEP); }
  }
  function revive() { const h=api(),g=h.G,p=g?.p;if(!p)return; p.dead=false;p.hp=Math.max(1,p.maxHp||100);p.invuln=0;if(p.y<-10){const w=g.waystone||g.lastSafe||{x:0,z:0};p.x=w.x;p.z=w.z;p.y=0;} }
  function face(e, distance=28) { const p=api().G.p; p.x=e.x; p.z=e.z+distance; p.y=0; p.vx=p.vy=p.vz=0; p.yaw=Math.atan2(e.x-p.x,e.z-p.z); if('face' in p)p.face=p.yaw; e.y=0;e.speed=0;e.dmg=0;e.active=true; }
  function setClass(id){ const h=api(); h.meta.classId=id; h.meta.classUnlocked[id]=true; h.classState(id); }
  function freshArena(cls='warrior'){ const h=api(); setClass(cls); h.startEndless(); pump(.1); const g=h.G; g.enemies.length=0; g.endTarget=1e9; g.endSpawned=0; return g; }

  function controlledHit(arche, rarity, cls, enemyElement) {
    const h=api(), g=freshArena(cls), p=g.p; h.giveWeapon(arche,rarity); const w=p.weapon;
    const e=h.spawnEnemy('grunt',0,0); e.element=enemyElement||null;e.hp=e.maxHp=1e7;e.speed=0;e.dmg=0;e.active=true; face(e,w.cls==='ranged'?120:Math.min(45,w.range||45));
    const before=e.hp, st0={...h.estat(e)}; p.atkCd=0;
    if(h.isChargeWeapon(w)){ h.playerAttack(); pump(.16); h.chargeRelease(p,w,1); }
    else h.playerAttack();
    pump(1.3,()=>face(e,w.cls==='ranged'?120:Math.min(45,w.range||45)));
    const st1={...h.estat(e)}, status={}; for(const k of Object.keys(st1)) status[k]=round(st1[k]-st0[k]);
    return {damage:round(before-e.hp),status,weapon:w,onClass:h.classFamilyOk(w)};
  }

  async function weaponMatrix(cfg={}) {
    const h=api(), rarity=cfg.rarity||'common', rows=[];
    const familyClass={sword:'warrior',great:'warrior',axe:'warrior',hammer:'warrior',bow:'ranger',cross:'ranger',dagger:'ranger',javelin:'ranger',staff:'mage',wand:'mage',spellblade:'mage',scythe:'reaper'};
    for(const arche of h.DROP_ARCHES){ const art=h.ARCHES[arche].art, on=familyClass[art]||'warrior', off=on==='warrior'?'mage':'warrior';
      const a=controlledHit(arche,rarity,on), b=controlledHit(arche,rarity,off), projectiles=h.ARCHES[arche].proj?.count||1; const theoretical=h.ARCHES[arche].dmg*h.RARITY[rarity].mul*projectiles/h.ARCHES[arche].cd;
      rows.push({arche,name:a.weapon.name,art,projectiles,charge:!!a.weapon.chg,onClass:on,offClass:off,onHit:a.damage,offHit:b.damage,offRatio:a.damage?round(b.damage/a.damage):0,theoreticalDps:round(theoretical),status:a.status});
    }
    rows.sort((x,y)=>y.theoreticalDps-x.theoreticalDps);
    const elements=Object.keys(h.WEAK), weakness=[];
    for(const enemyEl of elements){ const weakEl=h.WEAK[enemyEl]; weakness.push({enemyElement:enemyEl,weakElement:weakEl,resistMultiplier:h.elemMod(enemyEl,enemyEl),weakMultiplier:h.elemMod(weakEl,enemyEl)}); }
    return {rarity,rows,weakness};
  }

  function killAllBot(limit=25){ const h=api(), g=h.G,p=g.p; let elapsed=0,damage=0,uptime=0;
    while(elapsed<limit && active(g).length && !p.dead){ const e=active(g)[0]; face(e,p.weapon.cls==='ranged'?130:30); const hp=e.hp; if(p.atkCd<=0){h.playerAttack();uptime+=STEP;} h.update(STEP); damage+=Math.max(0,hp-e.hp);elapsed+=STEP; dismissOverlay(); }
    return {elapsed:round(elapsed),damage:round(damage),uptime:round(uptime),alive:active(g).length}; }

  async function zoneProfiles(cfg={}){ const h=api(), classes=['warrior','ranger','mage','reaper'], load={warrior:'sword',ranger:'bow',mage:'firestaff',reaper:'scythe'}, rows=[];
    for(const cls of classes) for(let zi=0;zi<h.ZONES.length;zi++){ setClass(cls);h.openHub();pump(.1);h.enterZone(zi);pump(.2);h.giveWeapon(load[cls],cfg.rarity||'rare');const g=h.G,p=g.p,hp0=p.hp;const combat=killAllBot(cfg.zoneSeconds||8);rows.push({class:cls,zone:h.ZONES[zi].id,tier:h.ZONES[zi].tier,area:g.area,netHpLost:round(Math.max(0,hp0-p.hp)),deaths:p.dead?1:0,...combat}); }
    return {rows,mode:'sampled opening-area combat profile'}; }

  async function descent(cfg={}){ const h=api(), trials=cfg.trials||3,maxFloors=cfg.maxFloors||12, runs=[];
    for(let t=0;t<trials;t++){ setClass('warrior');h.startEndless();h.giveWeapon(t===0?'sword':'great',t===0?'common':'rare');const floors=[];
      for(let f=1;f<=maxFloors;f++){ const g=h.G,p=g.p,startHp=p.hp,start=g.time||0;let dealt=0,seenHp=[],seenDmg=[],elites=new Set(),guard=0;
        while(!g.floorCleared&&!p.dead&&guard++<(cfg.floorSteps||24000)){ revive(); const foes=active(g); if(foes.length){const e=foes[0];seenHp.push(e.maxHp);seenDmg.push(e.dmg);if(e.elite)elites.add(e);face(e,p.weapon.cls==='ranged'?130:30);if(p.dodgeCdT<=0){h.input.jz=1;h.input.dodgeEdge=true;}const hp=e.hp;if(p.atkCd<=0)h.playerAttack();h.update(STEP);h.input.jz=0;dealt+=Math.max(0,hp-e.hp);}else h.update(STEP);dismissOverlay(); }
        floors.push({floor:g.floor,hpScale:round(g.ngHp),damageScale:round(g.ngDmg),target:g.endTarget,cap:g.endCap,spawnInterval:g.endInt,meanEnemyHp:round(mean(seenHp)),meanEnemyDamage:round(mean(seenDmg)),eliteObserved:elites.size,clearSeconds:round((g.time||0)-start),damageDealt:round(dealt),damageTaken:round(startHp-p.hp),cleared:!!g.floorCleared});
        if(!g.floorCleared||p.dead)break; h.endlessDescend();pump(.05);
      } runs.push({trial:t+1,loadout:t===0?'fresh-common-sword':'good-rare-greatsword',floorReached:floors.at(-1)?.floor||0,floors}); }
    return {runs,distribution:{mean:round(mean(runs.map(r=>r.floorReached))),median:round(median(runs.map(r=>r.floorReached))),min:Math.min(...runs.map(r=>r.floorReached)),max:Math.max(...runs.map(r=>r.floorReached))}}; }

  async function completability(){ const h=api(), rows=[]; setClass('warrior');
    for(let zi=0;zi<h.ZONES.length;zi++){ const Z=h.ZONES[zi], objectives=[]; for(let ai=0;ai<Z.areas.length;ai++){ h.openHub();pump(.05);h.enterZone(zi);pump(.1);if(ai) {h.G.area=ai;h.loadArea(ai);pump(.1);} for(const q of Z.areas[ai].quests){ try{h.questBump(q.id,q.n||1);objectives.push({id:q.id,kind:q.k,ok:(h.G.qs[q.id]||0)>=(q.n||1)});}catch(e){objectives.push({id:q.id,kind:q.k,ok:false,error:e.message});} }
      }
      h.openHub();pump(.05);h.enterZone(zi);pump(.1);h.G.area=-1;h.loadArea(-1);pump(.2);h.giveWeapon('great','legendary');const bosses=active(h.G).filter(e=>e.boss);const fight=killAllBot(30);rows.push({zone:Z.id,objectives,bossSpawned:bosses.length>0,bossKillable:bosses.length>0&&bosses.every(e=>e.dead||e.hp<=0),fight}); }
    return {rows,mode:'accelerated objective API + real boss combat'}; }

  function regression(current, baseline, threshold=.15){ if(!baseline)return {baseline:null,threshold,flags:[]}; const flags=[]; const old=new Map((baseline.weaponDps?.rows||[]).map(x=>[x.arche,x])); for(const row of current.weaponDps?.rows||[]){const b=old.get(row.arche);if(!b)continue;for(const key of ['onHit','offHit','theoreticalDps']){const pct=b[key]?(row[key]-b[key])/b[key]:0;if(Math.abs(pct)>threshold)flags.push({suite:'weaponDps',id:row.arche,metric:key,before:b[key],after:row[key],changePct:round(pct*100,1)});}} return {baseline:baseline.runId||baseline.version,threshold,flags}; }
  async function run(config={}){ const h=api(), quick=!!config.quick, result={schema:1,version:h.snap().version,startedAt:new Date().toISOString(),config}; result.weaponDps=await weaponMatrix(config); result.zoneProfiles=await zoneProfiles({...config,zoneSeconds:quick?2:8}); result.descent=await descent({...config,trials:quick?1:(config.trials||3),maxFloors:quick?3:(config.maxFloors||12),floorSteps:quick?5000:24000}); result.completability=await completability(); result.finishedAt=new Date().toISOString(); return result; }
  root.BFHarness={run,weaponMatrix,zoneProfiles,descent,completability,regression,pump,active};
})(typeof window !== 'undefined' ? window : globalThis);
