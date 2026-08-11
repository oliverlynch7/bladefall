/* WHY DOES bladedancer/Riposte:damage FLAP?

   docs/SKILL_TRIAGE.md section F: a full run-all.js sweep reported
   `REGRESSION: skills:bladedancer/Riposte:damage` and `GATE: FAIL (1 new)` on a run whose only game
   changes were in the 3D renderer and the MP peer fields - nothing that can reach a bladedancer
   skill - and `test-skills.js --classes bladedancer` immediately afterwards came back 5/0/0. That
   matters more than one flaky row: a NEW hard fail is what run-all.js calls a REGRESSION, and
   autopilot.ps1 answers a red gate with `git checkout -- .`. An unstable assertion here does not
   just mis-report, it can delete a run's verified work.

   Section F's lead was that the UNCHARGED lunge (55 units, at a dummy spawned 60 in front) leaves
   about five units of separation and the arc cannot resolve a direction from it. This probe exists
   to check that by measuring rather than by reading, because the same section says so, and because
   the reading has a competing explanation that predicts a flap where the five-unit one predicts a
   constant.

   What it measures, in one launch:
     A. the two lunge states cast at the bench's own geometry, repeated - uncharged (p.bdRiposte
        falsy, 55-unit lunge, 170 reach) and charged (p.bdRiposte set by a parry, 95-unit lunge,
        235 reach). Damage, both bodies' positions, and the separation and facing the arc actually
        saw.
     B. the bench's own sequence, repeated - cast slot 0 (Counter Stance, which opens a parry
        window), watch 300 ticks the way test-skills.js does, then cast Riposte - and reports
        whether the dummy's attack landed inside that window and left a Riposte stored. That is the
        thing that would make the SAME bench produce two different verdicts on two runs.

   Nothing here is class-specific cleverness: the skills are found by fx id, so a rank retune cannot
   silently repoint this at a different skill. */
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

  /* EQUIP ON-CLASS through the game's own classStartWeapon(), exactly as test-skills.js does - with
     the Arena's off-class sword in hand every `if(ok)` half of the kit is skipped and the numbers
     below would describe a state index.html:13220 hard-blocks a player from reaching. */
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
  const idxOf = (fx) => { for(let i = 0; i < skills.length; i++) if(skills[i] && skills[i].fx === fx) return i; return -1; };
  const rip = idxOf('bd_riposte'), ctr = idxOf('bd_counter');
  if(rip < 0) return JSON.stringify({ ok:false, why:'bd_riposte is not in the rank-10 build', casts:skills.map(s=>s&&s.fx) });

  const tick = (n) => { for(let k = 0; k < n; k++){ try { __BF3.update(1/60); } catch(e){} } };
  const mkDummy = () => {                       // the bench's own rig: a grunt 60 in front, awake
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };
  const reset = () => { p.hp = Math.round((p.maxHp || 100) * 0.5); p.mana = p.maxMana || 999;
                        p.yaw = Math.PI; G.camYaw = Math.PI; };

  /* A: the two lunge states, cast at the bench's geometry. The geometry reported is the one bdArc
     itself tests (10231): separation against the target's radius, and the cosine of the angle
     between the player's facing and the direction to the target against cos(arc/2). */
  const lunge = [];
  for(const charged of [false, false, true, true]){
    const d = mkDummy(); reset();
    if(p.skillCd) p.skillCd[rip] = 0;
    p.bdRiposte = charged ? 1 : 0;
    const p0 = { x: p.x, z: p.z }, e0 = d ? { x: d.x, z: d.z, r: d.r } : null;
    const hp0 = d ? d.hp : null;
    /* THE COMBO COUNTER IS IN EVERY DAMAGE NUMBER THIS PROBE PRINTS. hitEnemy (10532) ends with
       `G.combo++; G.comboT=2; dmg=round(dmg*mod*(1+min(0.2,G.combo*0.004)))`, so the same skill on
       the same target reads up to 20% apart depending only on how many hits have landed recently.
       Published rather than left to be re-derived: without it a change of a few percent in a number
       here looks like the edit under test and is the chain the player was already on. */
    const combo0 = G.combo || 0;
    let threw = null;
    try { __BF3.useSkill(rip); } catch(e){ threw = String((e && e.message) || e); }
    /* bdArc is synchronous inside the handler, so the damage is decided before the next frame -
       read it immediately as well as after the bench's full window, so a hit that lands later from
       something else cannot be mistaken for the skill connecting. */
    const hpAtCast = d ? d.hp : null;
    const p1 = { x: p.x, z: p.z };
    let geo = null;
    if(e0){
      const dx = e0.x - p1.x, dz = e0.z - p1.z, sep = Math.hypot(dx, dz);
      const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
      geo = { sep: Math.round(sep), targetR: Math.round(e0.r || 0),
              facing: Math.round((sep ? (dx*fx + dz*fz)/sep : 1) * 100) / 100,
              coneNeeds: Math.round(Math.cos(1.25/2) * 100) / 100,
              exemptByRadius: sep <= (e0.r || 0) };
    }
    tick(300);
    lunge.push({ charged: charged, threw: threw, comboAtCast: combo0,
                 lungeLen: Math.round(Math.hypot(p1.x - p0.x, p1.z - p0.z)),
                 dealtAtCast: (hp0 != null && hpAtCast != null) ? hp0 - hpAtCast : null,
                 dealtIn5s: (hp0 != null && d) ? hp0 - d.hp : null,
                 geoAfterLunge: geo });
  }

  /* A2: THE SAME CAST AT FOUR SEPARATIONS, because the clamp changed a number it had no business
     changing and a number nobody can explain is not a number to commit on. Clamped, the uncharged
     hit reads 108 where the unclamped one read 127 - same build, same weapon, same skill, combo 0
     at both casts (published above), and the damage `d` is computed BEFORE the lunge in either
     case, so nothing upstream of the arc can differ. That leaves distance. This sweeps it: the
     dummy is planted at four depths and the same uncharged cast is measured against each. A flat
     line says the difference is not distance and the delta is unexplained; a slope says the game
     has a proximity term and names it in numbers. */
  const sweep = [];
  for(const depth of [60, 40, 24, 14]){
    G.enemies.length = 0;
    let d = null;
    try { d = __BF3.spawnEnemy('grunt', p.x, p.z - depth);
          if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; } } catch(e){}
    reset();
    if(p.skillCd) p.skillCd[rip] = 0;
    p.bdRiposte = 0;
    const e0 = d ? { x: d.x, z: d.z } : null, hp0 = d ? d.hp : null, combo0 = G.combo || 0;
    try { __BF3.useSkill(rip); } catch(e){}
    const sep = e0 ? Math.round(Math.hypot(e0.x - p.x, e0.z - p.z)) : null;
    sweep.push({ spawnedAt: depth, sepAtArc: sep, comboAtCast: combo0,
                 /* combo counts one per hitEnemy call, so this says how many times the arc landed -
                    which separates "a bigger hit" from "two hits". */
                 hits: (G.combo || 0) - combo0,
                 dealtAtCast: (hp0 != null && d) ? hp0 - d.hp : null });
    tick(150);                                    // let the combo window (2s) lapse before the next
  }

  /* B: the bench's own sequence, repeated. test-skills.js casts every skill in c2CurSkills order,
     watching 300 ticks after each, and NOTHING resets the player between them - so whatever slot 0
     leaves behind is still on the body when Riposte is cast. Counter Stance opens a parry window;
     hurtPlayer (11148) closes it into p.bdRiposte=1 if the dummy connects inside it. Whether it
     connects is a question about one grunt's attack cadence against a 0.65-0.85s window. */
  const seq = [];
  if(ctr >= 0){
    for(let run = 0; run < 4; run++){
      const d0 = mkDummy(); reset();
      p.bdRiposte = 0;
      if(p.skillCd){ p.skillCd[ctr] = 0; p.skillCd[rip] = 0; }
      try { __BF3.useSkill(ctr); } catch(e){}
      const parryT = p.bdParryT || 0;
      tick(300);
      const storedAfterCounter = !!p.bdRiposte;

      const d = mkDummy(); reset();
      if(p.skillCd) p.skillCd[rip] = 0;
      const chargedNow = !!p.bdRiposte;
      const hp0 = d ? d.hp : null;
      try { __BF3.useSkill(rip); } catch(e){}
      const dealtAtCast = (hp0 != null && d) ? hp0 - d.hp : null;
      tick(300);
      seq.push({ run: run, parryWindow: Math.round(parryT * 100) / 100,
                 storedRiposte: storedAfterCounter, castCharged: chargedNow,
                 dealtAtCast: dealtAtCast,
                 dealtIn5s: (hp0 != null && d) ? hp0 - d.hp : null,
                 verdict: (hp0 != null && d && (hp0 - d.hp) > 0) ? 'PASS' : 'FAIL' });
    }
  }

  const verdicts = seq.map(s => s.verdict);
  return JSON.stringify({
    ok: true, noClamp: /[?&]ripostenoclamp=1/.test(location.search),
    weapon: { name: p.weapon && p.weapon.name, note: weaponNote },
    casts: skills.map(s => s && s.fx), ripIdx: rip, ctrIdx: ctr,
    lunge: lunge, sweep: sweep, sequence: seq,
    flapped: verdicts.length > 1 && verdicts.some(v => v !== verdicts[0]),
  });
})()
