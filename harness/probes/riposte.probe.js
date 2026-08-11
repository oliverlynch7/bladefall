/* WHY DOES bladedancer/Riposte:damage FLAP?

   docs/SKILL_TRIAGE.md section F: a full run-all.js sweep reported
   `REGRESSION: skills:bladedancer/Riposte:damage` and `GATE: FAIL (1 new)` on a run whose only game
   edits were in the 3D renderer and the MP peer fields - nothing that can reach a bladedancer skill.
   `test-skills.js --classes bladedancer` immediately afterwards came back 5 pass / 0 fail. So the
   instability is in the bench, and it is not the harmless kind: a NEW hard failure is what
   run-all.js treats as a REGRESSION, and autopilot.ps1 answers a red gate with `git checkout -- .`.
   An unstable assertion here does not mis-report, it DELETES a run's verified work.

   Section F's stated lead, which this probe exists to confirm or kill: SKILL_FX.bd_riposte
   (index.html:10235) is a LUNGE - it moves the player 55 units along its facing (95 charged) and
   only then swings bdArc(p, d, 170, 1.25, ...), a cone. The bench spawns its dummy at p.z-60. So
   the lunge lands the player about FIVE units from the target and the arc has to resolve a
   direction from a near-zero separation.

   Two questions, because only one of them can be answered by staring at that arithmetic:

     A. ISOLATED. Cast Riposte N times from a clean rig, nothing else cast. If it lands every time,
        the geometry is not marginal on its own and the flap lives in the state some earlier skill
        leaves behind.
     B. IN SEQUENCE. Replay the bench's real order - drift control, then every skill in
        c2CurSkills() order with the same 5s window - and read Riposte's row out of it, twice. This
        is the only version of the question the gate actually asks.
     C. IN SEQUENCE, WITH THE POSE RESTORED - the fix test-skills.js now carries, run side by side
        with B in the same launch so the two cannot be compared across two different games. B and C
        differ in exactly one thing: whether the player's scalar state is put back before each cast.

   Reports numbers, not a verdict about the game: separation after the lunge, the target's radius,
   the cone term, and whether blood was drawn at the cast (bdArc is synchronous inside useSkill) as
   well as over the window. A fix belongs in the probe geometry, never in the skill, unless these
   numbers say the skill misses a target a player would expect it to hit. */
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

  /* Equip on-class through the game's own classStartWeapon(), exactly as the bench does - eleven of
     sixteen classes were once measured holding the Arena's sword, and every `if(ok)` half of their
     kit was skipped. */
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

  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let RI = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'bd_riposte'){ RI = i; break; } }
  if(RI < 0) return JSON.stringify({ ok:false, why:'bd_riposte is not in the rank-10 build',
                                     casts: skills.map(s => s && s.fx) });

  const TICKS = 300;                                   // the bench's own 5s window
  const mkDummy = () => {
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };
  /* The pose restore under test, copied in behaviour from test-skills.js's reset(). `RESTORE` is
     flipped between phase B and phase C so both halves are measured in one game. */
  let RESTORE = false, POSE = null;
  const takePose = () => {
    POSE = {};
    for(const k in p){ const v = p[k]; if(typeof v === 'number' || typeof v === 'boolean') POSE[k] = v; }
  };
  const reset = () => {
    if(RESTORE && POSE){
      for(const k in p){
        const v = p[k];
        if(typeof v !== 'number' && typeof v !== 'boolean') continue;
        p[k] = (k in POSE) ? POSE[k] : (typeof v === 'number' ? 0 : false);
      }
    }
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    p.mana = p.maxMana || 999;
    p.yaw = Math.PI; G.camYaw = Math.PI;
  };
  takePose();
  const tick = (n, d, low) => {
    for(let k = 0; k < n; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(d && d.hp < low.v) low.v = d.hp;
    }
    return low.v;
  };
  const r2 = (v) => Math.round(v * 100) / 100;

  /* One Riposte cast, fully instrumented. `atCast` is the number that matters: bdArc runs
     synchronously inside useSkill, so blood drawn by the skill itself is visible before a single
     update() has run and cannot be confused with the dummy walking into a swing chain. */
  const castRiposte = (tag) => {
    reset(); const d = mkDummy();                    // pose first, then place the target on it
    if(p.skillCd) p.skillCd[RI] = 0;
    const charged = !!p.bdRiposte;
    const p0 = { x: p.x, z: p.z }, hp0 = d ? d.hp : null;
    let threw = null;
    try { __BF3.useSkill(RI); } catch(e){ threw = String((e && e.message) || e); }
    const p1 = { x: p.x, z: p.z };
    const hpAtCast = d ? d.hp : null;
    const dx = d ? d.x - p.x : 0, dz = d ? d.z - p.z : 0;
    const sep = d ? Math.hypot(dx, dz) : null;
    /* The two tests inside bdArc, evaluated on the post-lunge pose the skill actually swung from.
       `inCone` is vacuously true when sep <= e.r, because bdArc skips the cone test for a target
       whose body already overlaps the swing origin - which is the whole question here. */
    const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
    const reach = charged ? 235 : 170, arcCos = Math.cos(1.25 / 2);
    const dot = sep ? (dx * fx + dz * fz) / sep : 0;
    const low = { v: d ? d.hp : Infinity };
    tick(TICKS, d, low);
    return { tag: tag, charged: charged, threw: threw,
             onCd: !!(p.skillCd && p.skillCd[RI] > 0),
             lunge: r2(Math.hypot(p1.x - p0.x, p1.z - p0.z)),
             yaw: r2(p.yaw), dummyR: d ? d.r : null,
             sep: sep == null ? null : r2(sep),
             inReach: sep != null && d ? (sep <= reach + (d.r || 0)) : false,
             overlaps: sep != null && d ? (sep <= (d.r || 0)) : false,
             dot: r2(dot), needDot: r2(arcCos),
             dealtAtCast: (hp0 != null && hpAtCast != null) ? hp0 - hpAtCast : null,
             dealtInWindow: (hp0 != null) ? hp0 - low.v : null,
             at: { x: Math.round(p.x), z: Math.round(p.z) },
             dummyAt: d ? { x: Math.round(d.x), z: Math.round(d.z) } : null };
  };

  /* ── A. ISOLATED ─────────────────────────────────────────────────────────────────────────── */
  const isolated = [];
  for(let n = 0; n < 6; n++) isolated.push(castRiposte('iso' + n));

  /* ── B. IN SEQUENCE ──────────────────────────────────────────────────────────────────────────
     The bench's real order: drift control first (it must run before any swing - playerAttack leaves
     the chain running and the control then measures a player mid-combo), then every skill in list
     order with a fresh dummy and the same window. Riposte's row is read out of that. */
  const runSequence = (tag) => {
    const rows = [];
    { reset(); const d = mkDummy(); const low = { v: d ? d.hp : Infinity }; tick(TICKS, d, low); }
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      if(i === RI){ rows.push(castRiposte(tag)); continue; }
      reset(); const d = mkDummy();
      if(p.skillCd) p.skillCd[i] = 0;
      try { __BF3.useSkill(i); } catch(e){}
      const low = { v: d ? d.hp : Infinity };
      tick(TICKS, d, low);
    }
    return rows[0] || { tag: tag, why: 'riposte never reached' };
  };
  RESTORE = false;
  const seq = [runSequence('raw0'), runSequence('raw1'), runSequence('raw2')];

  /* ── C. IN SEQUENCE, WITH THE POSE RESTORED ──────────────────────────────────────────────── */
  RESTORE = true;
  const seqFixed = [runSequence('fix0'), runSequence('fix1'), runSequence('fix2')];

  const missed = (rows) => rows.filter(r => !(r.dealtAtCast > 0)).length;
  return JSON.stringify({
    weapon: { name: p.weapon && p.weapon.name, note: weaponNote },
    riposteIndex: RI, casts: skills.map(s => s && s.fx),
    missedIsolated: missed(isolated) + '/' + isolated.length,
    missedRaw: missed(seq) + '/' + seq.length,
    missedRestored: missed(seqFixed) + '/' + seqFixed.length,
    chargedRaw: seq.map(r => r.charged), chargedRestored: seqFixed.map(r => r.charged),
    isolated: isolated, sequence: seq, sequenceRestored: seqFixed, mode: __BF3.mode,
  });
})()
