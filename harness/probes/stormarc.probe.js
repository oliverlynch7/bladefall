/* DOES STORM LORD MAKE THE LIGHTNING ARC TO MORE ENEMIES?

   Stormcaller rank-10 capstone (index.html:2176):
       "+12% damage, +10% cooldown reduction, and your lightning arcs to more enemies."

   The first clause is at 3728 and the second was wired on 2026-08-12 (`9795786`, the capstone
   sweep). The third had no implementation anywhere: the chain lives in `CLASS_BASIC.stormcaller`
   (index.html:11315) and read nothing about rank until this pass. It is the last unbuilt clause of
   the sixteen capstone cards — see docs/SKILL_TRIAGE.md section S.

   NOTHING IS CHOSEN. "More" is one more, which is the step Overcharge already takes at rank 3
   (pass 37) and the only step this hook has. The radius, the 34%, the shock element and the ring
   are the hook's own.

   THE MEASUREMENT IS RANK 9 AGAINST RANK 10 IN THE SAME GAME, which is the shape the capstone
   sweep's other probe (stormlord.probe.js) uses, and for its reason: a capstone has no id, so
   `c2Passive` cannot reach it and the A/B has to be the rank itself.

   FOUR TRIALS, because the clause has to stack with the passive and stop at the radius:
     - rank 9              1 arc   the shipped chain
     - rank 10             2 arcs  the card
     - rank 10 + Overcharge 3 arcs  "as well as a second" and "more", both at once
     - ninja at rank 10    0 arcs  NEGATIVE CONTROL. The class has no chain, so if this moves the
                                   measurement is merely rank-sensitive and would go green for
                                   anything.
   Four neighbours stand at 80, 140, 200 and 900 units from the target. The three inside the reach
   are struck in strict nearest-first order as the count climbs, and the one at 900 must never be
   struck in any trial — which is what keeps 260 a radius rather than "everyone". */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();

  const equip = (cls) => {
    const tries = [cls].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return (i === 0) ? 'own starter' : ('borrowed from ' + tries[i]); }
    }
    return 'none';
  };

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };
  const dist = (a, b) => Math.round(Math.hypot(a.x - b.x, a.z - b.z));

  const trial = (cls, rank, r3) => {
    __BF3.meta.classId = cls;
    const weaponNote = equip(cls);
    const cs = __BF3.classState(cls);
    cs.rank = rank;
    cs.ch = cs.ch || {};
    if(cls === 'stormcaller'){
      cs.ch[3] = r3;
      cs.ch[5] = 'st_ward';      // a shield on cast: it cannot reach an enemy
      cs.ch[7] = 'st_amped';     // dead; NOT st_charged, whose doubled reach would move the geometry
      cs.ch[9] = 'st_master';    // dead; NOT st_galvanize, which strikes the FIRST body again
    }

    G.enemies.length = 0;
    const tgt = __BF3.spawnEnemy('grunt', p.x,       p.z - 240);
    const n1  = __BF3.spawnEnemy('grunt', p.x +  80, p.z - 240);
    const n2  = __BF3.spawnEnemy('grunt', p.x + 140, p.z - 240);
    const n3  = __BF3.spawnEnemy('grunt', p.x + 200, p.z - 240);
    const far = __BF3.spawnEnemy('grunt', p.x + 900, p.z - 240);
    const all = [tgt, n1, n2, n3, far];
    if(all.some(e => !e)) return { cls, rank, r3, why:'bodies could not be spawned' };
    for(const e of all){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0; e.hp = e.maxHp = 100000; e.stunT = 0;
    }
    tick(2);

    const before = all.map(e => e.hp);
    let threw = null;
    G._desig = false;
    try { __BF3.hitEnemy(tgt, 60, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const lost = all.map((e, i) => Math.round(before[i] - e.hp));

    return {
      cls, rank, r3, threw, weaponNote,
      tgtLost: lost[0], n1Lost: lost[1], n2Lost: lost[2], n3Lost: lost[3], farLost: lost[4],
      arcs: [lost[1], lost[2], lost[3], lost[4]].filter(v => v > 0).length,
      d1: dist(n1, tgt), d2: dist(n2, tgt), d3: dist(n3, tgt), dFar: dist(far, tgt),
      chaining: p._chaining || 0,
    };
  };

  const r9    = trial('stormcaller',  9, 'st_conductor');
  const r10   = trial('stormcaller', 10, 'st_conductor');
  const both  = trial('stormcaller', 10, 'st_overcharge');
  const ninja = trial('ninja',       10, null);

  const clean = (t) => !t.threw && t.tgtLost > 0 && t.d1 < 260 && t.d2 < 260 && t.d3 < 260 && t.dFar > 260;
  const allClean = [r9, r10, both, ninja].every(clean);
  const noFar = [r9, r10, both, ninja].every(t => t.farLost === 0);

  return JSON.stringify({
    ok: !!(allClean && noFar
           && r9.arcs === 1  && r9.n1Lost > 0
           && r10.arcs === 2 && r10.n1Lost > 0 && r10.n2Lost > 0 && r10.n3Lost === 0
           && both.arcs === 3 && both.n3Lost > 0
           && ninja.arcs === 0),
    allClean, noFar,
    arcs: { r9: r9.arcs, r10: r10.arcs, r10overcharge: both.arcs, ninjaR10: ninja.arcs },
    detail: { r9, r10, both, ninja },
  });
})()
