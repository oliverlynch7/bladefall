/* WHY DOES bladedancer/Riposte:damage FLAP?

   docs/SKILL_TRIAGE.md section F: a full run-all.js sweep reported
   `REGRESSION: skills:bladedancer/Riposte:damage` and `GATE: FAIL (1 new)` on a run whose only game
   changes were in the 3D renderer and the MP peer fields - nothing that can reach a bladedancer
   skill - and `test-skills.js --classes bladedancer` immediately afterwards came back 5 pass / 0
   fail. That matters more than one flaky row: an unstable HARD FAIL is what run-all.js calls a
   REGRESSION, and autopilot.ps1 answers a red gate with `git checkout -- .`. It can delete a run's
   verified work.

   Section F's lead was "the lunge lands the player about five units from the target and the arc has
   to resolve a direction from a near-zero separation". This probe tests that lead and the one
   beside it, because the two differ by a number in the skill's own body:

     SKILL_FX.bd_riposte (index.html:10235)
       const charged = !!p.bdRiposte
       p.x += sin(yaw) * (charged ? 95 : 55);  p.z += cos(yaw) * (charged ? 95 : 55)
       bdArc(p, d, charged ? 235 : 170, 1.25, ...)

   The bench spawns its dummy at p.z - 60. So an UNCHARGED lunge stops 5 units short of it and a
   CHARGED lunge overshoots it by 35 - and bdArc (10231) skips any target that is behind the
   facing: `if(d > e.r && (dx*fx + dz*fz)/d < cos) continue`. Behind is not near-zero separation;
   it is a different fault with a different fix.

   p.bdRiposte is stored when hurtPlayer consumes a parry window, and the bladedancer's own
   Counter Stance opens one at slot 0 - which the bench casts, with a live grunt, five seconds
   before it casts Riposte. Whether that grunt lands a hit in those five seconds is the coin toss.
   So this probe forces BOTH states rather than waiting for the toss, which is what makes it a
   measurement instead of another sample of the flap.

   Reports one row per cast: where the player and the target were before and after, whether the
   target ended in front of or behind the facing, and how much HP came off. */
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

  /* Equip on-class exactly the way test-skills.js does: a great many SKILL_FX bodies gate their
     defining half on classFamilyOk(p.weapon), so a bench holding the Arena's sword measures a
     different skill from the one a player casts. */
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
  if(idx < 0) return JSON.stringify({ ok:false, why:'bd_riposte is not in the rank-10 build', casts:skills.map(s=>s&&s.fx) });

  /* EXACTLY the rig test-skills.js uses - a grunt at 60 units, awake, drop-in timer cleared, huge
     HP so nothing dies mid-measurement. Changing this distance is what must NOT happen: it is the
     distance all sixteen classes are measured at and moving it forces a full re-baseline. */
  const mkDummy = () => {
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };

  /* Is the target in front of the facing, by bdArc's own test? Reported as the raw dot so a reader
     can see how far behind, not just that it was. */
  const facingDot = (d) => {
    if(!d) return null;
    const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
    const dx = d.x - p.x, dz = d.z - p.z, len = Math.hypot(dx, dz) || 1;
    return Math.round(((dx * fx + dz * fz) / len) * 100) / 100;
  };
  const geom = (d) => ({ px: Math.round(p.x), pz: Math.round(p.z),
                         tx: d ? Math.round(d.x) : null, tz: d ? Math.round(d.z) : null,
                         tr: d ? Math.round(d.r || 0) : null,
                         gap: d ? Math.round(Math.hypot(d.x - p.x, d.z - p.z)) : null,
                         dot: facingDot(d) });

  const cast = (charged) => {
    const d = mkDummy();
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    p.mana = p.maxMana || 999;
    p.yaw = Math.PI; G.camYaw = Math.PI;          // face the dummy, as the bench does
    if(p.skillCd) p.skillCd[idx] = 0;
    p.bdRiposte = charged ? 1 : 0;
    const before = geom(d), hp0 = d ? d.hp : null;
    let threw = null;
    try { __BF3.useSkill(idx); } catch(e){ threw = String((e && e.message) || e); }
    const atCast = geom(d);                       // the instant the lunge has moved the body
    let worst = d ? d.hp : null;
    for(let k = 0; k < 300; k++){                 // the bench's own 5s window
      try { __BF3.update(1/60); } catch(e){}
      if(d && d.hp < worst) worst = d.hp;
    }
    return { charged: charged, threw: threw, before: before, atCast: atCast, after: geom(d),
             dealt: (hp0 != null && worst != null) ? (hp0 - worst) : null,
             onCd: !!(p.skillCd && p.skillCd[idx] > 0) };
  };

  const rows = [];
  for(let i = 0; i < 3; i++) rows.push(cast(false));
  for(let i = 0; i < 3; i++) rows.push(cast(true));

  const hit = (r) => (r.dealt || 0) > 0;
  return JSON.stringify({
    ok: true, weapon: { name: p.weapon && p.weapon.name, note: weaponNote }, idx: idx,
    uncharged: { hits: rows.filter(r => !r.charged && hit(r)).length, of: 3 },
    charged:   { hits: rows.filter(r =>  r.charged && hit(r)).length, of: 3 },
    rows: rows,
  });
})()
