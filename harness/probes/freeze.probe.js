/* SHOULD THE SKILL BENCH FREEZE ITS DUMMY?

   docs/superpowers/plans/2026-08-11-harness-hardening.md, Task 1 Step 3, asks for two things:
   a named constant for the target distance, and "freeze the dummy so it cannot walk out of range:
   set its speed to 0 after spawn". The first is free. The second is a change to what every one of
   the sixteen kits is measured against, so it gets measured before it is believed - the sibling
   probe reach.probe.js already killed the other half of that step (30 units turns a PASSING skill
   into a hard failure) by measuring instead of reasoning.

   The suspicion this checks: the dummy never walks out of range, it walks INTO it. reach.probe.js
   recorded every dummy ending `spawn distance + ~44` from where it was put - the grunt closes the
   whole gap - so a frozen dummy is not "the same rig, held still", it is a rig where nothing ever
   arrives. Two consequences, both of which would land as new HARD failures (i.e. as the
   REGRESSION that run-all.js reports and autopilot.ps1 used to answer with a destructive revert):

     - a melee skill with no lunge cannot reach 60 units, so it deals nothing;
     - a skill that pays out when the PLAYER IS HIT can never pay out, because a frozen grunt
       never arrives to swing. bladedancer/Counter Stance is exactly that skill.

   So: same rig as test-skills.js - same weapon selection, same pose restore, same 300-tick window,
   same 60-unit spawn - with the ONLY variable being whether `e.speed` is zeroed after spawn
   (index.html:12874, `let spd=e.speed*D.moveMul*...`, is the whole of an enemy's locomotion).

   Reports per skill, for each mode: damage dealt, whether the PLAYER took a hit inside the window,
   and how far the dummy ended up from its spawn point. `hurt` is the load-bearing column - if it
   is true only in the mobile column, freezing removes a payout condition rather than noise. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  const G = __BF3.G, p = G.p;

  const DIST    = 60;                          // the bench's own distance, unchanged on purpose
  const CLASSES = ['bladedancer', 'warrior', 'ranger', 'mage', 'monk'];
  const TICKS   = 300;                         // the bench's own window, so the numbers compare

  /* Lifted from test-skills.js PROBE rather than reinvented: an off-class weapon skips every
     `if(ok)` half of a kit, which is how that bench lied about eleven classes once. */
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
  const mkDummy = (frozen) => {
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - DIST);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000;
             if(frozen) d.speed = 0; }
    } catch(e){}
    return d;
  };

  const cast = (i, frozen) => {
    reset();
    const d = mkDummy(frozen);
    if(p.skillCd) p.skillCd[i] = 0;
    const z0 = p.z, hp0 = p.hp, h0 = d ? d.hp : 0;
    let lo = h0, hurt = false;
    try { __BF3.useSkill(i); } catch(e){}
    for(let k = 0; k < TICKS; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(d && d.hp < lo) lo = d.hp;
      if(p.hp < hp0) hurt = true;             // did the grunt land a swing on the player at all
    }
    return { dmg: Math.round(h0 - lo), hurt: hurt,
             wan: d ? Math.round(Math.hypot(d.x - p.x, d.z - (z0 - DIST))) : -1 };
  };

  const out = [];
  for(const cls of CLASSES){
    __BF3.meta.classId = cls;
    equip(cls);
    reset(); takePose();
    const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      /* Mobile first, then frozen, so the mobile column is measured from the same cold state the
         bench measures from rather than after a frozen pass has run. */
      const mob = cast(i, false), frz = cast(i, true);
      out.push({ c: cls, s: s.n, mob: mob, frz: frz });
    }
  }
  return JSON.stringify({ dist: DIST, ticks: TICKS, rows: out });
})()
