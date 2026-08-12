/* DID THE SKILL FAIL, OR DID THE PLAYER DIE HOLDING IT?

   benchdet.probe.js reported the player's HP loss per cast alongside the damage dealt, and one
   column stopped the whole line of enquiry: every berserker skill came back `hurt: 239` — which is
   exactly `maxHp * 0.5`, the HP the bench starts each cast with. The berserker reaches ZERO HP
   inside all four of its 300-tick windows, and it does so with the dummy PINNED 60 units away and
   unable to reach it, so the damage is not coming from the grunt.

   That matters because all three of the berserker's zero-damage skills are among the suite's hard
   failures, and `useSkill`'s second guard is `if(p.dead || p.downed) return;`. A skill cast by a
   corpse does nothing, and the bench cannot tell that apart from a skill that does nothing. The
   phase marks do not catch it either: they are taken BEFORE each cast, where reset() has just put
   `dead` back to false, so a death that happens mid-window is invisible.

   The decisive test is to remove the only variable: make the player unkillable and cast again. If
   damage appears, the failure was the bench. If it stays zero, the skill is genuinely broken and
   the verdict stands.

   Reports for each skill, at normal HP and at 1e6 HP: the damage dealt, the tick the player first
   went dead/downed (-1 for never), and the HP lost. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const G = __BF3.G, p = G.p;

  const DIST  = 60;
  const TICKS = 300;
  const BIG   = 1000000;
  /* The three classes that own the suite's hard failures, plus the warrior as the control that
     already passes — if the control changes under a huge HP pool, the rig is what moved. */
  const CLASSES = ['berserker', 'ranger', 'mage', 'warrior'];

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

  const cast = (i) => {
    reset();
    const d = mkDummy();
    if(!d) return { dmg: -1, deadAt: -1, hurt: -1 };
    if(p.skillCd) p.skillCd[i] = 0;
    const h0 = d.hp, php = p.hp;
    let lo = h0, plo = php, deadAt = -1;
    try { __BF3.useSkill(i); } catch(e){}
    for(let k = 0; k < TICKS; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(deadAt < 0 && (p.dead || p.downed)) deadAt = k;
      if(d.hp < lo) lo = d.hp;
      if(p.hp < plo) plo = p.hp;
    }
    return { dmg: Math.round(h0 - lo), deadAt: deadAt, hurt: Math.round(php - plo) };
  };

  const out = [];
  for(const cls of CLASSES){
    __BF3.meta.classId = cls;
    equip(cls);
    reset();
    const realMax = p.maxHp;
    takePose();
    const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      const row = { c: cls, s: s.n, maxHp: Math.round(realMax) };
      POSE.maxHp = realMax;  row.normal = cast(i);       // the bench as it stands today
      POSE.maxHp = BIG;      row.big    = cast(i);       // identical, minus the ability to die
      POSE.maxHp = realMax;
      out.push(row);
    }
  }
  return JSON.stringify({ dist: DIST, ticks: TICKS, rows: out });
})()
