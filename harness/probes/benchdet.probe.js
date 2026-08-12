/* IS THE SKILL BENCH DETERMINISTIC, AND WOULD FREEZING THE DUMMY MAKE IT SO?

   reach.probe.js settled that the bench's spawn distance is not what varies: the grunt closes the
   whole gap within the window, so every distance collapses to melee. What is left is the grunt
   ITSELF — it chases, it swings, and skills that pay out when the player is HIT (bladedancer
   Counter Stance and Mirror Guard both did, non-monotonically, across that sweep) are therefore
   racing its AI rather than measuring their own effect.

   The harness-hardening plan proposes freezing the dummy "so it cannot walk out of range". That is
   a plausible fix and it is also a plausible way to break every counter skill in the game at once,
   because a frozen grunt at 60 units never reaches the player to swing. Neither half can be settled
   by reading, so run both.

   Casts each skill REPEATS times in the identical rig and reports the damage each time. Two
   configs, same page, same dt:
     free — exactly what test-skills.js does today
     pin  — the dummy's position forced back to its spawn point after every tick

   Read the output as: `dmg` values that differ within a row are the bench's own noise, and a row
   whose free values are all non-zero while its pin values are all zero is a skill that freezing
   would convert into a false failure. `hurt` is how much HP the player lost in the window, which is
   what says WHY a counter skill paid out or did not. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const G = __BF3.G, p = G.p;

  const DIST    = 60;                          // the bench's own distance, held fixed on purpose
  const REPEATS = 4;
  const TICKS   = 300;
  const CLASSES = ['bladedancer', 'warrior', 'ranger', 'mage', 'berserker'];

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
  const mkDummy = () => {
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - DIST);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };

  /* One cast, measured. `pin` forces the dummy back to its spawn point after every tick rather
     than zeroing a speed field, because which field a grunt steers with is a guess and a position
     clamp is not. */
  const cast = (i, pin) => {
    reset();
    const d = mkDummy();
    if(!d) return { dmg: -1, hurt: -1 };
    const sx = d.x, sz = d.z;
    if(p.skillCd) p.skillCd[i] = 0;
    const h0 = d.hp, php = p.hp;
    let lo = h0, plo = php;
    try { __BF3.useSkill(i); } catch(e){}
    for(let k = 0; k < TICKS; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(pin){ d.x = sx; d.z = sz; }
      if(d.hp < lo) lo = d.hp;
      if(p.hp < plo) plo = p.hp;
    }
    return { dmg: Math.round(h0 - lo), hurt: Math.round(php - plo) };
  };

  const out = [];
  for(const cls of CLASSES){
    __BF3.meta.classId = cls;
    equip(cls);
    reset(); takePose();
    const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      const row = { c: cls, s: s.n, free: [], freeHurt: [], pin: [], pinHurt: [] };
      for(let r = 0; r < REPEATS; r++){
        const a = cast(i, false); row.free.push(a.dmg); row.freeHurt.push(a.hurt);
        const b = cast(i, true);  row.pin.push(b.dmg);  row.pinHurt.push(b.hurt);
      }
      out.push(row);
    }
  }
  return JSON.stringify({ dist: DIST, repeats: REPEATS, rows: out });
})()
