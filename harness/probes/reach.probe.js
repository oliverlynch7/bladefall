/* WHAT DISTANCE SHOULD THE SKILL BENCH PUT ITS DUMMY AT?

   test-skills.js spawns its target at a hard-coded `p.z - 60` in two places (BASELINE and
   mkDummy). 60 is not a measured number, and three skills currently FAIL the bench for dealing no
   damage while promising some — ranger/Tumble ("roll back ~5m ... + a 0.75x parting shot"),
   mage/Attunement ("a 4s storm ... around you") and berserker/Charge ("rush forward, damaging in
   your path"). Every one of those is a claim ABOUT DISTANCE, so "the skill is broken" and "the
   dummy is in the wrong place" produce the identical verdict and cannot be told apart by reading.

   So sweep it. Same rig as the bench — same weapon selection, same pose restore, same 300-tick
   window — with the ONLY variable being where the dummy stands. A skill that draws blood at 30 and
   none at 60 is a bench artifact. A skill that draws none at ANY distance is a real bug and must
   stay failed.

   Reports the dummy's final position too: the bench never freezes it, so "the target wandered" is
   the other candidate explanation and it should be a number rather than a suspicion. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const G = __BF3.G, p = G.p;

  const DISTS   = [15, 25, 30, 40, 60, 90];
  const CLASSES = ['ranger', 'mage', 'berserker', 'bladedancer', 'warrior'];
  const TICKS   = 300;                         // the bench's own window, so the numbers compare

  /* Lifted from test-skills.js PROBE rather than reinvented: an off-class weapon skips every
     `if(ok)` half of a kit, which is how this bench lied about eleven classes once. */
  const equip = (cls) => {
    const tries = [cls].concat(Object.keys(__BF3.CLASSES || {}));
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
  const mkDummy = (dist) => {
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - dist);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };

  const out = [];
  for(const cls of CLASSES){
    __BF3.meta.classId = cls;
    equip(cls);
    reset(); takePose();
    const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      const row = { c: cls, s: s.n, dmg: [], mv: [], wan: [] };
      for(const dist of DISTS){
        reset();
        const d = mkDummy(dist);
        if(p.skillCd) p.skillCd[i] = 0;
        const z0 = p.z, h0 = d ? d.hp : 0;
        let lo = h0;
        try { __BF3.useSkill(i); } catch(e){}
        for(let k = 0; k < TICKS; k++){
          try { __BF3.update(1/60); } catch(e){}
          if(d && d.hp < lo) lo = d.hp;
        }
        row.dmg.push(Math.round(h0 - lo));
        row.mv.push(Math.round(z0 - p.z));                    // + is toward the dummy
        row.wan.push(d ? Math.round(Math.hypot(d.x - p.x, d.z - (z0 - dist))) : -1);
      }
      out.push(row);
    }
  }
  return JSON.stringify({ dists: DISTS, rows: out });
})()
