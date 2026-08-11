/* WHY DOES bladedancer/Riposte FLAP?

   docs/SKILL_TRIAGE.md section F: a full run-all.js sweep reported
   `REGRESSION: skills:bladedancer/Riposte:damage` and `GATE: FAIL (1 new)` on a run whose only game
   changes were in the 3D renderer and the MP peer fields - nothing that can reach a bladedancer
   skill - and `node harness/test-skills.js --classes bladedancer` immediately afterwards came back
   5 pass / 0 fail. So it is the bench, not the game. That matters more than one flaky row: this flap
   produces a NEW hard FAIL, which run-all.js treats as a REGRESSION, and autopilot.ps1's green gate
   answers a red gate with `git checkout -- .`. An unstable assertion here can delete a run's work.

   The recorded lead was lunge-overshoot: SKILL_FX.bd_riposte (index.html:10236) moves the player 55
   units along its facing BEFORE swinging bdArc(p, d, 170, 1.25, ...), and the bench spawns its dummy
   at p.z - 60, so the swing resolves a 1.25-radian cone from about five units of separation. The
   lead was never confirmed. This confirms or refutes it, by repeating the bench's own rig many times
   in one launch and reading the geometry back at the instant the arc ran.

   WHY THE GEOMETRY CAN BE READ AFTER THE FACT. bd_riposte lunges and swings inside one synchronous
   handler and nothing ticks in between, so p.x/p.z immediately after useSkill() returns ARE the
   coordinates the arc used. On a miss the dummy has not been knocked anywhere either, so the
   separation, the reach test and the cone test can all be recomputed exactly. On a hit the dummy has
   taken knockback - but a hit needs no explaining.

   The trials deliberately alternate. An isolated cast measures the rig in its clean state; a
   "wandered" trial casts every OTHER bladedancer skill first, because three of them move the player
   (bd_step dashes 235, bd_steel teleports onto a target, bd_riposte itself lunges) and the real sweep
   casts all of them in order before it gets here. If the flap needs a wandered bench, only the second
   kind can see it.

   ── WHAT IT FOUND, and the lead was right in shape and wrong in the number. ──
   It is the CHARGED lunge that overshoots, not the uncharged one, and that is the whole reason the
   row flapped rather than simply failing. `p.bdRiposte` is stored by hurtPlayer (index.html:11149)
   when a parry lands, and the wander sequence casts three parry stances (bd_counter, bd_mirror,
   bd_perfect) whose windows the grunt may or may not hit inside - so whether the NEXT Riposte is
   charged is a race, and the charge survives into the following skill because nothing clears it.

   | trial | p.bdRiposte | lunge | separation at the swing | facing dot | arc hit |
   |---|---|---|---|---|---|
   | t=0  | not charged | 55 |  5 | +1.0 (dead ahead)  | yes, 62 dmg |
   | t=1  | charged     | 95 | 35 | -1.0 (dead behind) | no, 0 dmg   |

   9 of 24 trials failed the bench's own bar before the fix; 0 of 24 after, with the facing dot +1.0
   on every trial and the uncharged path unchanged (lunge 55, separation 5, 62 damage, identical).

   KNOWN-BAD, permanent, so this assertion has been watched to fail and can be again:

     node _shot/shot.js --scene arena:flat --wait 12000 \
       --url "/3d/index.html?hero3d=1&world3d=1&nobloom&ripostepast=1" \
       --eval @harness/probes/riposte.probe.js

   `?ripostepast=1` skips the clamp and restores the overshoot. Measured: 12 of 24 trials fail, every
   one of them charged, every one at separation 35 with the facing dot at -1.0. Without the flag, 0.
   Both directions in one command, and nobody has to break the repo to produce the failing one. */
(function(){
  const G = __BF3.G, p = G.p;

  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "cast did nothing" for every skill. Knock on the game's own resume
     door - the same idiom test-skills.js and headlong.probe.js use. */
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
  __BF3.meta.classId = 'bladedancer';

  /* Equip on-class through the game's own classStartWeapon(), exactly as the bench does: a great
     many SKILL_FX bodies gate their defining half on the `ok` argument useSkill derives from the
     held weapon, and measuring off-class is how eleven of sixteen classes were once accused. */
  let weaponNote = 'none';
  (function(){
    const tries = ['bladedancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w; weaponNote = (i === 0) ? 'own starter' : ('borrowed from ' + tries[i]); return;
      }
    }
  })();

  /* Found by fx id, never by slot, so a rank retune cannot silently repoint this probe. */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'bd_riposte'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'bd_riposte is not in the rank-10 build',
                                      casts: skills.map(s => s && s.fx) });

  const TICKS = 300;                       // the bench's own 5s observation window
  const tick = (n) => { for(let k = 0; k < n; k++){ try { __BF3.update(1/60); } catch(e){} } };

  /* The bench's mkDummy and reset, copied rather than referenced because they live inside a template
     string in test-skills.js. Any drift between the two makes this probe measure a different bench. */
  const mkDummy = () => {
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };
  const reset = () => {
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    p.mana = p.maxMana || 999;
    p.yaw = Math.PI; G.camYaw = Math.PI;
  };

  const rows = [];
  const TRIALS = 24;
  for(let t = 0; t < TRIALS; t++){
    /* Odd trials wander first: every other skill in the kit, one 60-tick window each, so the player
       arrives at the Riposte cast from wherever the real sweep would have left it. */
    const wandered = (t % 2) === 1;
    if(wandered){
      for(let j = 0; j < skills.length; j++){
        if(j === idx || !skills[j]) continue;
        mkDummy(); reset();
        if(p.skillCd) p.skillCd[j] = 0;
        try { __BF3.useSkill(j); } catch(e){}
        tick(60);
      }
    }

    const d = mkDummy();
    reset();
    if(p.skillCd) p.skillCd[idx] = 0;
    const pre = { px: p.x, pz: p.z, yaw: p.yaw,
                  dx: d ? d.x : null, dz: d ? d.z : null, r: d ? d.r : null,
                  role: d ? (d.role || null) : null, spec: d ? (d.spec || null) : null,
                  active: d ? !!d.active : null, hp: d ? d.hp : null,
                  charged: !!p.bdRiposte, stun: p.stunT || 0, atk: p.atkTimer || 0 };
    let threw = null;
    try { __BF3.useSkill(idx); } catch(e){ threw = String((e && e.message) || e); }
    /* NOTHING HAS TICKED. These are the coordinates bdArc itself used. */
    const post = { px: p.x, pz: p.z, dx: d ? d.x : null, dz: d ? d.z : null, hp: d ? d.hp : null };
    const onCd = !!(p.skillCd && p.skillCd[idx] > 0);

    /* Recompute bdArc's own two tests from those coordinates (index.html:10231-10232):
         reach : d <= 170 + e.r
         cone  : d <= e.r, or (dx*sin(yaw) + dz*cos(yaw)) / d >= cos(1.25 / 2)
       Reported whether the hit landed or not, because a hit that lands with the cone test barely
       satisfied is the same finding as a miss, one run earlier. */
    let sep = null, cone = null, inReach = null, inCone = null;
    if(d){
      const ax = d.x - post.px, az = d.z - post.pz;
      sep = Math.hypot(ax, az);
      const fx = Math.sin(pre.yaw), fz = Math.cos(pre.yaw);
      cone = sep > 0 ? (ax * fx + az * fz) / sep : null;
      inReach = sep <= 170 + (d.r || 0);
      inCone = (sep <= (d.r || 0)) || (cone != null && cone >= Math.cos(1.25 / 2));
    }

    const arcHit = d ? (post.hp < pre.hp) : null;      // did the swing itself draw blood
    const before = d ? d.hp : null;
    let minHp = d ? d.hp : null;
    for(let k = 0; k < TICKS; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(d && d.hp < minHp) minHp = d.hp;
    }
    /* The bench's own verdict for this skill: MET.damage is "the target's HP went down at any point
       in the window", so it is min-over-window against the value at cast time. */
    const benchPass = d ? (minHp < pre.hp) : null;

    rows.push({ t, wandered, threw, onCd, arcHit, benchPass,
                lunge: Math.round(Math.hypot(post.px - pre.px, post.pz - pre.pz)),
                sep: sep == null ? null : Math.round(sep * 10) / 10,
                cone: cone == null ? null : Math.round(cone * 1000) / 1000,
                inReach, inCone, r: pre.r, role: pre.role, spec: pre.spec,
                dealt: (before != null && minHp != null) ? Math.round(before - minHp) : null,
                charged: pre.charged, stun: pre.stun, atk: Math.round((pre.atk || 0) * 100) / 100,
                pAt: { x: Math.round(pre.px), z: Math.round(pre.pz) },
                dAt: pre.dx == null ? null : { x: Math.round(pre.dx), z: Math.round(pre.dz) } });
  }

  const misses = rows.filter(r => r.benchPass === false);
  const arcMisses = rows.filter(r => r.arcHit === false);
  const noTarget = rows.filter(r => r.sep == null);
  const cones = rows.filter(r => r.cone != null).map(r => r.cone);
  const seps = rows.filter(r => r.sep != null).map(r => r.sep);
  const num = (a, f) => a.length ? Math.round(f(a) * 1000) / 1000 : null;

  return JSON.stringify({
    ok: misses.length === 0,
    weapon: { name: p.weapon && p.weapon.name, note: weaponNote },
    idx, trials: TRIALS,
    benchFails: misses.length, arcMisses: arcMisses.length, spawnFails: noTarget.length,
    sep: { min: num(seps, a => Math.min.apply(null, a)), max: num(seps, a => Math.max.apply(null, a)) },
    cone: { min: num(cones, a => Math.min.apply(null, a)), max: num(cones, a => Math.max.apply(null, a)),
            threshold: Math.round(Math.cos(1.25 / 2) * 1000) / 1000 },
    /* Every miss in full, plus the first clean trial of each kind for comparison. A verdict with no
       failing row next to a passing one is a number nobody can check. */
    failing: misses.slice(0, 8),
    sampleClean: [rows.find(r => r.benchPass && !r.wandered) || null,
                  rows.find(r => r.benchPass && r.wandered) || null],
  });
})()
