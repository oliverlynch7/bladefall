/* DOES AMBUSHER DO ANYTHING AT ALL?

   Ranger rank-5 option B (`r_ambush`, index.html:2056) says: "After Tumble/Shadowstrike: next click
   within 3s +20% (once per 6s)." It is one of the 46 passives docs/SKILL_TRIAGE.md section E found
   that are offered, described, and then never consulted - the id appears in CLASS2 and in the
   PASSIVE_ART icon table and nowhere else, so choosing it has never changed a number.

   THIS DRIVES THE GAME, IT DOES NOT IMITATE IT. The bonus lives in CLASS_BASIC.ranger, the
   basic-attack hook hitEnemy calls at index.html:10663 for the player's non-designated hits, so the
   probe hands a fixed damage to the game's own hitEnemy and reads what the dummy's HP actually lost.
   Every multiplier in that path (difficulty, tPlayerDmg, the ranger's own distance curve) applies
   identically to both halves, so the RATIO is the measurement and none of those numbers has to be
   known.

   THREE THINGS THIS RIG HAS TO CONTROL, each of which produced a wrong answer first:

   - DISTANCE. CLASS_BASIC.ranger already scales damage by how far away the target is
     (0.75x..1.35x across 520 units). Tumble is a ROLL - it moves the body ~123 units - so casting
     it between two measurements changes the distance and therefore changes the damage, by up to
     14%, with nothing to do with the passive. Every strike below is taken from an identical pose at
     an identical separation; the pose is restored after every cast and after every tick loop.
   - THE PREVIOUS STRIKE'S LEAVINGS, which is section F's lesson one level out and is the one that
     nearly wrecked this measurement. `hitEnemy` runs a HIT COMBO (index.html:10625): every hit adds
     0.4% damage, capped at +20%, and resets 2s after the last one. So three identical strikes are
     NOT identical - measured, before it was controlled: 1103, 1107, 1112, and back to exactly 1103
     once 3.5s of game time had passed. The cap is +20%, the SAME size as the effect under test, so
     an uncontrolled combo could have manufactured this passive or hidden it. G.combo/G.comboT are
     zeroed before every strike, which makes each one the first hit of a fresh combo and the
     baseline spread exactly 0 - asserted below, because a ratio is worth nothing if the thing it is
     a ratio of wobbles.
   - THE PREVIOUS SKILL'S LEAVINGS. docs/SKILL_TRIAGE.md section F: a skill's verdict that depends
     on what the last cast left on the player is a verdict that flaps. reset() puts the body back
     before each trial.
   - THE PAUSE. useSkill's first guard returns on mode!=='play' WITHOUT spending a cooldown, so a
     bench that arrives paused reports "cast did nothing" for everything. Knock on the game's own
     resume door first, the same idiom test-skills.js uses.

   Known-bad: watched to fail against the unfixed game, where every ratio below is 1.000 -
   `armed` and `icdElapsed` included. `?noambush=1` keeps that case reproducible after the fix. */
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
  __BF3.meta.classId = 'ranger';

  /* cheatRank10All auto-fills path A at every choice rank (14945), so rank 5 lands on r_escape.
     Ambusher is option B and has to be chosen explicitly or c2Passive('r_ambush') is false and the
     probe measures the game correctly doing nothing. */
  const ch = __BF3.c2ch('ranger');
  ch[5] = 'r_ambush';

  /* ON-CLASS, or half the kit's `if(ok)` branches never run - bench fault 1 in the triage doc, which
     had eleven of sixteen classes casting with the Arena's sword in hand. */
  try { p.weapon = __BF3.classStartWeapon('ranger'); } catch(e){}
  const onClass = !!__BF3.classFamilyOk(p.weapon);

  /* The list useSkill CASTS from, found by fx id rather than by slot so a rank retune cannot
     silently repoint it. Tumble is preferred over Shadowstrike because Shadowstrike needs a target
     in sight and refunds without one; both are supposed to arm this passive. */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let idx = -1, usedFx = null;
  for(const want of ['r_tumble', 'r_shadow']){
    for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === want){ idx = i; usedFx = want; break; } }
    if(idx >= 0) break;
  }
  if(idx < 0) return JSON.stringify({ ok:false, why:'neither r_tumble nor r_shadow is in the build',
                                      casts: skills.map(s => s && s.fx) });

  G.enemies.length = 0;
  const SEP = 200;                                   // fixed, because the ranger's damage IS distance
  const dummy = __BF3.spawnEnemy('grunt', p.x, p.z - SEP);
  if(!dummy) return JSON.stringify({ ok:false, why:'could not spawn a target' });
  dummy.dummy = true; dummy.active = true; dummy.immobile = true;
  dummy.hp = dummy.maxHp = 1e7;

  const HOME = { x: p.x, y: p.y, z: p.z, yaw: p.yaw };
  function reset(){
    p.x = HOME.x; p.y = HOME.y; p.z = HOME.z; p.yaw = HOME.yaw;
    p.vx = p.vy = p.vz = 0;
    p.dodgeTimer = 0; p.dashX = 0; p.dashZ = -1; p.invuln = 0;
    p.clearAim = false; p._noHitT = 0; p._caGrace = 0; p._caAnn = 0;
    p.mana = p.maxMana || 999;
    if(p.skillCd) p.skillCd[idx] = 0;
    dummy.x = HOME.x; dummy.z = HOME.z - SEP; dummy.hp = dummy.maxHp;
  }

  const SAMPLE = 1000;                               // big enough that a 20% step cannot hide in the round
  function strike(){
    G.combo = 0; G.comboT = 0;                       // every strike is the first hit of a fresh combo
    const before = dummy.hp;
    try { __BF3.hitEnemy(dummy, SAMPLE, p, 0, 0, null); } catch(e){ return -1; }
    const dealt = before - dummy.hp;
    dummy.hp = dummy.maxHp;
    return dealt;
  }
  function cast(){ try { __BF3.useSkill(idx); } catch(e){} }
  function tick(n){ for(let k = 0; k < n; k++){ try { __BF3.update(1/60); } catch(e){} } }

  /* BASELINE. Three strikes from the same pose with nothing armed: if these three disagree the
     ratio below means nothing, so the spread is reported and asserted on. */
  reset();
  const base = [strike(), strike(), strike()];
  const b0 = base[0];
  const baseSpread = Math.max.apply(null, base) - Math.min.apply(null, base);

  /* ARMED. Cast, put the body back where it was (the roll moves it), strike. */
  reset(); cast();
  const armedFlag = +(p._ambushT || 0);
  reset();                                            // undo the roll, keep _ambushT
  const armed = strike();

  /* CONSUMED. The very next strike must be ordinary again - "next click", not a 3s buff. */
  const afterConsume = strike();

  /* ICD. A second cast right away is inside the 6s lockout and must NOT re-arm. */
  reset(); cast(); reset();
  const inIcd = strike();

  /* WINDOW EXPIRY. Arm, let 3.5s of real game time pass, strike. Ticks move the body and the
     clock; the pose goes back afterwards, the clock does not. */
  reset(); cast(); tick(210); reset();
  const afterWindow = strike();

  /* ICD ELAPSED. Past 6s from the arm above, a fresh cast must arm again. */
  tick(210); reset(); cast(); reset();
  const icdElapsed = strike();

  const r = (v) => b0 > 0 ? Math.round((v / b0) * 1000) / 1000 : 0;
  const near = (v, want) => Math.abs(r(v) - want) <= 0.03;

  const checks = {
    baselineStable:  baseSpread === 0,
    armedIsStronger: near(armed, 1.20),
    consumedOnce:    near(afterConsume, 1.00),
    icdBlocksRearm:  near(inIcd, 1.00),
    windowExpires:   near(afterWindow, 1.00),
    icdElapsedRearms:near(icdElapsed, 1.20),
  };
  const failed = Object.keys(checks).filter(k => !checks[k]);

  return JSON.stringify({
    ok: failed.length === 0, failed: failed,
    onClass: onClass, cast: usedFx, sep: SEP, passive: __BF3.c2ch('ranger')[5],
    baseline: base, baseSpread: baseSpread,
    ratios: { armed: r(armed), afterConsume: r(afterConsume), inIcd: r(inIcd),
              afterWindow: r(afterWindow), icdElapsed: r(icdElapsed) },
    raw: { base: b0, armed: armed, afterConsume: afterConsume, inIcd: inIcd,
           afterWindow: afterWindow, icdElapsed: icdElapsed },
    ambushTAfterCast: armedFlag,
  });
})()
