/* WHERE DOES warlock/Final Curse's DELAYED PAYOUT GO?

   `skills:warlock/Final Curse:damage` is the row that made the confirm pass necessary: it fails the
   bench about three launches in four, on trees the change under test cannot reach, and a single
   confirming re-run therefore upholds it three times in four. Best-of-N made the gate HONEST about
   the row (see gate-rules.js). It did not make the row work, and nothing yet says where the damage
   goes — the run that recorded the flap deliberately did not guess.

   What is known before this probe runs, from source only:
     - `SKILL_FX.war_final` (index.html:10442) picks the highest-HP non-dummy target within 760,
       returns 'refund' if there is none, and otherwise arms `t.warBurstT = 1.0` with
       `t.warBurstDmg`. It does NOT deal damage itself.
     - the payout lands a full second later, in the enemies loop (index.html:13431), and only for an
       enemy that is not dead, is not a bot, has `dropT <= 0` and is `active`.
     - `onCd` is true in every failing sample, so the cast is not being refunded.

   So the question is exactly: between arming and the payout, which of those guards stops being
   true — or does the payout land on something the bench is not watching?

   ONE LAUNCH, MANY SAMPLES. The row is a coin toss, so a single cast says nothing; the previous run
   spent four whole gate launches to see 3-of-4. This repeats the bench's own warlock B-side sequence
   REPS times in one page, which is where the cheap evidence was all along.

   IT REPRODUCES THE BENCH, NOT A CONVENIENT SUBSET. Final Curse is the r8 B-side, i.e. the LAST
   skill of the LAST pass, so by the time it is cast the page has already run the drift control, four
   A-side casts and three B-side casts — about 2400 ticks of game time, with whatever each of them
   left in the room. Casting it alone would be a different experiment, and if the answer turns out to
   be contamination, the alone-cast version is the one that would have said "works fine". */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'warlock';
  const G = __BF3.G, p = G.p;

  const REPS = 8;
  const TICKS = 300;               // the bench's own window, so a verdict here is the bench's verdict
  const DUMMY_DIST = 60;           // the bench's own DUMMY_DIST
  const TRACE = 120;               // ticks of per-tick detail kept for one pass and one failure

  /* THE RECEIPT, and without it a quiet world is indistinguishable from a stopped one.
     `update()` returns at its third line unless `mode === 'play'` (index.html:13038) and `__BF3.mode`
     is a getter with no setter, so a probe cannot put the game back and gets a full run of plausible
     zeroes instead. AUTOPILOT.md's rule for this is to count the ticks that actually RAN in play mode
     and print them beside the ticks asked for; `mp-drift` says `playTicks 1800 of 1800`.
     It matters more here than anywhere: this probe exists to explain a row whose damage arrives a
     second after the cast, and "the second never elapsed" is the one explanation that would look
     exactly like "the damage went somewhere else". Counted over EVERY tick the probe spends,
     the plain casts included, because a card raised during the fourth A-side skill is still up
     during the eighth B-side one. */
  let asked = 0, ranInPlay = 0, leftPlayAt = null;
  const tick = () => {
    asked++;
    if(__BF3.mode === 'play') ranInPlay++;
    else if(leftPlayAt == null) leftPlayAt = { tick: asked, mode: __BF3.mode };
    try { __BF3.update(1/60); } catch(e){}
  };

  /* Lifted from test-skills.js: an off-class weapon skips every `if(ok)` half of a kit. */
  (function(){
    const tries = ['warlock'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
    let w = null; try { w = __BF3.classStartWeapon('warlock'); } catch(e){}
    if(w){ w.anyClass = true; p.weapon = w; }
  })();
  const onClass = __BF3.classFamilyOk(p.weapon);

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
    if(G.minions) G.minions.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - DUMMY_DIST);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };

  const CHOICE_RANKS = [2, 4, 6, 8];
  const C2 = __BF3.CLASS2 || {};
  const setSide = (side) => {
    const def = C2.warlock; if(!def) return side === 'a';
    let cs = null; try { cs = __BF3.classState('warlock'); } catch(e){}
    if(!cs) return false;
    if(!cs.ch || typeof cs.ch !== 'object') cs.ch = {};
    let n = 0;
    for(const r of CHOICE_RANKS){
      const R2 = def['r' + r];
      if(!R2 || R2.kind !== 'skill' || !R2[side]) continue;
      cs.ch[r] = R2[side].id; n++;
    }
    return n > 0;
  };

  /* A plain bench cast: everything the suite does for a skill it is not asking about. */
  const plainCast = (i) => {
    reset(); mkDummy();
    if(p.skillCd) p.skillCd[i] = 0;
    try { __BF3.useSkill(i); } catch(e){}
    for(let k = 0; k < TICKS; k++) tick();
  };

  /* THE INSTRUMENTED CAST. Samples the four guards the payout has to survive, on the object that was
     actually armed — which is deliberately looked up rather than assumed to be the dummy. */
  const curseCast = (i) => {
    reset();
    const dummy = mkDummy();
    if(p.skillCd) p.skillCd[i] = 0;

    const hp0 = dummy ? dummy.hp : null;
    let threw = null, ret = null;
    try { ret = __BF3.useSkill(i); } catch(e){ threw = String((e && e.message) || e); }
    const onCd = !!(p.skillCd && p.skillCd[i] > 0);

    /* WHO GOT ARMED? Not assumed to be the dummy: `war_final` searches combatTargets() and skips
       anything flagged `dummy`, so "it armed something else" and "it armed nothing" are two
       different answers and must not share a verdict. */
    let armed = null, armedIdx = -1;
    for(let j = 0; j < G.enemies.length; j++){
      const e = G.enemies[j];
      if(e && (e.warBurstT || 0) > 0){ armed = e; armedIdx = j; break; }
    }
    const rec = {
      onCd, threw, ret: (typeof ret === 'string' ? ret : null),
      armedIsDummy: armed ? (armed === dummy) : null,
      armedIdx,
      armedDmg: armed ? Math.round(armed.warBurstDmg || 0) : null,
      armedT: armed ? +(armed.warBurstT || 0).toFixed(3) : null,
      enemies0: G.enemies.length,
      elem: dummy ? (dummy.element || null) : null,
      /* the state of every guard between arming and payout, sampled at the moment of arming */
      g0: armed ? { dead: !!armed.dead, active: !!armed.active, dropT: +(armed.dropT || 0).toFixed(2),
                    bot: !!armed.bot, untargetable: !!armed.untargetable, inList: G.enemies.indexOf(armed) } : null,
      burstTick: null, burstDealt: null, mode: null, trace: null,
    };

    const watched = armed || dummy;
    const trace = [];
    let minHp = watched ? watched.hp : null;
    let prevT = watched ? (watched.warBurstT || 0) : 0;
    const play0 = ranInPlay;
    for(let k = 0; k < TICKS; k++){
      tick();
      if(!watched) continue;
      const t = watched.warBurstT || 0;
      if(watched.hp < minHp) minHp = watched.hp;
      if(k < TRACE){
        trace.push([k, +t.toFixed(3), Math.round(watched.hp), watched.dead ? 1 : 0,
                    watched.active ? 1 : 0, Math.round(__BF3.dXZ ? __BF3.dXZ(watched.x, watched.z, p.x, p.z)
                                                                : Math.hypot(watched.x - p.x, watched.z - p.z)),
                    G.enemies.indexOf(watched)]);
      }
      /* The payout tick is the one on which the timer crosses zero — recorded whether or not any
         damage came with it, because "the burst never fired" and "the burst fired for nothing" are
         the two answers this probe exists to tell apart. */
      if(rec.burstTick == null && prevT > 0 && t <= 0){
        rec.burstTick = k;
        rec.burstDealt = Math.round((hp0 == null ? 0 : hp0) - watched.hp);
        rec.burstLeftDmg = Math.round(watched.warBurstDmg || 0);
      }
      prevT = t;
    }
    rec.mode = __BF3.mode;
    /* Per-cast receipt: this window is where the burst had to land, so a shortfall here is the whole
       answer and a full count rules the explanation out rather than leaving it open. */
    rec.playTicks = (ranInPlay - play0) + ' of ' + TICKS;
    rec.dealt = (hp0 == null || minHp == null) ? null : Math.round(hp0 - minHp);
    rec.pass = !!(rec.dealt > 0);
    rec.end = watched ? { dead: !!watched.dead, active: !!watched.active,
                          hp: Math.round(watched.hp), inList: G.enemies.indexOf(watched),
                          burstT: +(watched.warBurstT || 0).toFixed(3),
                          burstDmg: Math.round(watched.warBurstDmg || 0) } : null;
    rec.trace = trace;
    return rec;
  };

  reset(); takePose();

  const reps = [];
  for(let r = 0; r < REPS; r++){
    /* One full bench pass per rep: A side in order, then B side in order, Final Curse instrumented
       in place rather than pulled out of the sequence. */
    let curse = null;
    for(const side of ['a', 'b']){
      if(!setSide(side)) continue;
      const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
      for(let i = 0; i < skills.length; i++){
        const s = skills[i]; if(!s) continue;
        if(side === 'b' && s.n === 'Final Curse') curse = curseCast(i);
        else plainCast(i);
      }
    }
    if(curse) reps.push(curse);
  }

  /* Keep the per-tick detail for ONE pass and ONE failure and drop the rest: eight full traces is
     a wall of numbers, two is a comparison. */
  const firstPass = reps.find(r => r.pass), firstFail = reps.find(r => !r.pass);
  for(const r of reps) if(r !== firstPass && r !== firstFail) r.trace = null;

  return JSON.stringify({
    onClass, reps: reps.length,
    passed: reps.filter(r => r.pass).length,
    /* Whole-probe receipt. `playTicks` short of `asked` means the game stopped under the probe and
       NOTHING below is evidence about Final Curse; `leftPlayAt` names the tick and the mode it went
       to, so the next reader is told rather than left to bisect. */
    playTicks: ranInPlay + ' of ' + asked,
    leftPlayAt,
    traceLegend: 'tick, warBurstT, hp, dead, active, dist, indexInEnemies',
    rows: reps,
  });
})()
