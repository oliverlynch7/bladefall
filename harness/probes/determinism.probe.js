/* IS THE SKILL BENCH DETERMINISTIC AT THE LEVEL THAT DECIDES A VERDICT?

   docs/superpowers/plans/2026-08-11-harness-hardening.md exists because `bladedancer/Riposte`
   flapped: identical code returned `5 pass, 0 fail` and `4 pass, 1 fail` on consecutive runs, and a
   new hard failure is what run-all.js calls a REGRESSION. The flap itself was killed on 2026-08-11
   by the pose restore in test-skills.js reset(). What was never checked is whether any OTHER row in
   the game has the same shape - and "run the whole suite ten times" is not affordable: one full
   `node harness/run-all.js` is sixteen Chrome launches.

   So repeat the casts INSIDE ONE PAGE instead. Same rig as test-skills.js - same weapon selection,
   same pose restore, same 60-unit spawn, same 300-tick window - every kit cast REPS times over, and
   report the rows whose VERDICT changed between repeats.

   VERDICT, not damage. test-skills.js decides FAIL on the MET table: did the target's HP go down at
   all, did the player's HP go up, did any of the three protections rise, did a minion appear, did
   the cast take a cooldown. A skill that deals 62 one repeat and 92 the next is not a flap - both
   pass. A skill that deals 62 and then 0 is the thing this plan is about. So the booleans MET reads
   are what gets compared, and the raw numbers are carried alongside only to make a flap readable.

   What this CANNOT see, stated so nobody over-reads a clean result: cross-LAUNCH variation. Each
   repeat here shares one page, one asset cache and one arrival state, so this measures the bench's
   own run-to-run noise (enemy AI timing, crit rolls, whether a chasing grunt lands a swing inside a
   0.65s parry window) and not "did the game load differently today". The ten-launch loop in the
   plan's Step 4 is what covers that, for one class. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const G = __BF3.G, p = G.p;

  const DIST  = 60;                            // the bench's own distance, unchanged on purpose
  const TICKS = 300;                           // the bench's own window, so the numbers compare
  const REPS  = 3;
  const CLASSES = Object.keys(__BF3.CLASSES || {});

  /* Lifted from test-skills.js PROBE rather than reinvented: an off-class weapon skips every
     `if(ok)` half of a kit, which is how that bench lied about eleven classes once. */
  const equip = (cls) => {
    const tries = [cls].concat(CLASSES);
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
    let w = null; try { w = __BF3.classStartWeapon(cls); } catch(e){}
    if(w){ w.anyClass = true; p.weapon = w; }
  };

  let POSE = null;
  const takePose = () => {
    POSE = {};
    for(const k in p){ const v = p[k]; if(typeof v === 'number' || typeof v === 'boolean') POSE[k] = v; }
  };
  const reset = () => {
    if(POSE) for(const k in p){
      const v = p[k];
      if(typeof v !== 'number' && typeof v !== 'boolean') continue;
      p[k] = (k in POSE) ? POSE[k] : (typeof v === 'number' ? 0 : false);
    }
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    p.mana = p.maxMana || 999;
    p.yaw = Math.PI; G.camYaw = Math.PI;
  };
  /* THIS RIG MUST TRACK test-skills.js mkDummy, INCLUDING THE MINION CLEAR. It is a second copy of
     the bench's rig — that is the point of the probe and also its hazard — so a change to one is a
     change to both, or the two measure two different things while both being called "the bench".
     The minion clear was added here only after this probe measured the flap it fixes: run this file
     with the line below removed and `necromancer/Raise the Dead` returns summon TRUE, FALSE, TRUE. */
  const CLEAR_MINIONS = true;
  const mkDummy = () => {
    G.enemies.length = 0;
    if(CLEAR_MINIONS && G.minions) G.minions.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - DIST);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };
  /* The three protections and both bodies they can land on - see test-skills.js, where reading only
     p.shieldHp failed three skills for not doing something none of them claimed. */
  const petShield = () => {
    let s = 0;
    const pet = G.pet;
    if(pet && !pet.dead) s = Math.max(s, pet.shieldHp || 0);
    for(const m of (G.minions || [])) s = Math.max(s, (m && m.shieldHp) || 0);
    return s;
  };
  const guardOf = () => Math.max(0, p.guardT || 0);

  const cast = (i) => {
    reset();
    const d = mkDummy();
    if(p.skillCd) p.skillCd[i] = 0;
    const b = { tgt: d ? d.hp : null, hp: p.hp, minions: (G.minions || []).length,
                shield: p.shieldHp || 0, guard: guardOf(), petShield: petShield() };
    const a = { tgt: b.tgt, hp: b.hp, minions: b.minions,
                shield: b.shield, guard: b.guard, petShield: b.petShield };
    let threw = false;
    try { __BF3.useSkill(i); } catch(e){ threw = true; }
    const onCd = !!(p.skillCd && p.skillCd[i] > 0);
    for(let k = 0; k < TICKS; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(p.hp > a.hp) a.hp = p.hp;
      if((p.shieldHp || 0) > a.shield) a.shield = p.shieldHp || 0;
      if(guardOf() > a.guard) a.guard = guardOf();
      const ps = petShield(); if(ps > a.petShield) a.petShield = ps;
      const mn = (G.minions || []).length; if(mn > a.minions) a.minions = mn;
      if(d && d.hp < a.tgt) a.tgt = d.hp;
    }
    /* The MET table of test-skills.js, verbatim in meaning: five booleans and the cooldown. */
    return { v: [ a.tgt != null && a.tgt < b.tgt,                          // damage
                  a.hp > b.hp,                                            // heal
                  a.shield > b.shield || a.guard > b.guard || a.petShield > b.petShield,
                  a.minions > b.minions,                                  // summon
                  onCd,                                                   // control / buff
                  threw ].map(x => x ? 1 : 0).join(''),
             dmg: b.tgt != null ? Math.round(b.tgt - a.tgt) : 0,
             heal: Math.round(a.hp - b.hp) };
  };

  const flaps = [], stable = [];
  let casts = 0;
  for(const cls of CLASSES){
    __BF3.meta.classId = cls;
    equip(cls);
    reset(); takePose();
    const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      const runs = [];
      for(let r = 0; r < REPS; r++){ runs.push(cast(i)); casts++; }
      const vs = runs.map(r => r.v);
      const row = { c: cls, s: s.n, v: vs, dmg: runs.map(r => r.dmg), heal: runs.map(r => r.heal) };
      if(vs.some(v => v !== vs[0])) flaps.push(row); else stable.push(cls + '/' + s.n);
    }
  }
  return JSON.stringify({ reps: REPS, dist: DIST, ticks: TICKS, casts: casts,
                          classes: CLASSES.length, stable: stable.length,
                          key: 'damage,heal,shield,summon,onCd,threw', flaps: flaps });
})()
