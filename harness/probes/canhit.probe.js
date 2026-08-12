/* WOULD FREEZING THE DUMMY BREAK THE ONE ASSERTION EVERY OTHER ASSERTION RESTS ON?

   benchdet.probe.js measured that pinning the dummy to its spawn point roughly halves the skill
   bench's run-to-run variance and zeroes no skill that was non-zero without it. That makes pinning
   the obvious hardening — and it carries one hazard big enough to sink the whole suite, which is
   why it is measured here before anything ships.

   test-skills.js opens with a rig test: swing a PLAIN ATTACK at the dummy, and if it cannot draw
   blood, report every damage claim in the run UNPROVEN rather than FAILED. Today that works partly
   by accident — the grunt walks the whole 60 units to the player, so the swing lands whether or not
   melee reaches 60. Pin the grunt and the target stays 60 units away for the entire window. A basic
   swing with a battered starter weapon may simply not reach that far, and if it does not, `canHit`
   goes false for sixteen classes at once and every damage verdict in the suite turns to UNPROVEN.

   So ask it directly, for all sixteen classes on the weapon each is actually measured with, plus
   the BASELINE rig on the Arena's own legendary sword. `free` is the bench as it stands; `pin`
   holds the dummy still. A `pin` column of zeroes is a verdict on the whole idea. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const G = __BF3.G, p = G.p;

  const DIST  = 60;
  const TICKS = 240;                            // the bench's own rig-test budget: 4s of swinging

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

  /* Returns the tick the swing first drew blood, or -1. The tick matters as well as the yes/no:
     a hit that only lands at tick 200 is one that needed the grunt to walk most of the way. */
  const swing = (pin) => {
    reset();
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - DIST);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    if(!d) return { at: -1, gap: -1 };
    const sx = d.x, sz = d.z, h0 = d.hp;
    for(let k = 0; k < TICKS; k++){
      try { if(__BF3.playerAttack) __BF3.playerAttack(); } catch(e){}
      try { __BF3.update(1/60); } catch(e){}
      if(pin){ d.x = sx; d.z = sz; }
      if(d.hp < h0) return { at: k, gap: Math.round(Math.hypot(d.x - p.x, d.z - p.z)) };
    }
    return { at: -1, gap: Math.round(Math.hypot(d.x - p.x, d.z - p.z)) };
  };

  const out = [];

  /* The BASELINE rig first: whatever the Arena handed us, no class swap, no starter weapon. This is
     the exact gate that decides FAILED vs UNPROVEN for the entire run. */
  reset(); takePose();
  out.push({ c: '(BASELINE, arena weapon)', w: p.weapon && p.weapon.name,
             free: swing(false), pin: swing(true) });

  for(const cls of Object.keys(__BF3.CLASSES || {})){
    __BF3.meta.classId = cls;
    equip(cls);
    reset(); takePose();
    out.push({ c: cls, w: p.weapon && p.weapon.name, free: swing(false), pin: swing(true) });
  }
  return JSON.stringify({ dist: DIST, ticks: TICKS, rows: out });
})()
