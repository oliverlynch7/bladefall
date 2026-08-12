/* DOES CORRUPTION MASTERY SPREAD ANYTHING?

   Reaper rank-9 option a (index.html:2088) reads: "Rupturing a corrupted enemy corrupts everything
   near it." `x_corrupt` IS read - twice - so `harness/audit-passives.js` calls it wired and is
   right: +25% corruption buildup (applyStatus 9527) and +15% rupture damage (ruptureCorrupt 9551).
   Neither of those is the card. Nothing in the file spreads corruption to anybody.

   That is docs/SKILL_TRIAGE.md section Q's shape - the card promises a MECHANIC and the only reader
   multiplies a STAT - and it is the shape the passive audit cannot see, because the audit asks
   whether anything reads the id and not whether the reader honours the card.

   NOTHING IS INVENTED, which is the whole reason this row was takeable.
     - The SPREAD is `igniteBurn`'s combustion splash, verbatim: over G.enemies, `< 120 + o.r`, one
       whole stack of the effect's own status. igniteBurn is corruption's structural twin - both are
       cap reactions fired out of applyStatus, both end `e.hp-=dmg; if(e.hp<=0) killEnemy(e)` - and
       it is this file's only existing answer to "the status spreads to everything near it".
     - The RADIUS is also rupture's OWN: `skillRing(e.x,e.z,'#d69bff','#8f52d6',120)` is the ring
       Rupture has always drawn, so 120 is a number this effect already had rather than one chosen
       here. docs/SKILL_TRIAGE.md made "does corruption own a radius" the condition on this row.
     - Going through `applyElement` rather than writing `st.corrupt` by hand is pass 15's correction
       (pal_burn): applyStatus is what stamps stFresh, without which a stack lands already past its
       STWIN grace window, and it is what carries stDmg, the per-target rate limit and the dummy
       guard. The top-up to a whole stack afterwards is pass 15's other half - buildAmt scales with
       the weapon's swing speed and can hand over a fraction, and a fraction of a corrupt meter
       primes nothing.

   THE BAR IS NOT "st.corrupt WENT UP". Corruption has no damage-over-time of its own (statusTick
   DoTs burn and venom only), so its entire payoff to the player is that a corrupted enemy can be
   RUPTURED. Each half therefore ruptures the neighbour afterwards and reads the damage that comes
   out: a stack that cannot be cashed in is pass 15's 0.95 stacks all over again.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. `x_favor` (Death's
   Favor) is the control: the b-side of this very rank, wired, and about elite kills restoring mana
   and HP - it can corrupt nobody.

   TWO TRIALS PER HALF, one where the ruptured body was corrupted and one where it was NOT, because
   "rupturing a corrupted enemy" is the condition on the card. A wiring that spread on every
   designated hit would satisfy a naive one-trial bar and would be a different, strictly better
   card. The uncorrupted trial must spread nothing, in every half.

   A FAR FOE IN EVERY TRIAL, outside the radius, so "everything near it" is tested as a radius and
   not as "everything". A wiring that corrupted the whole level would pass a near-foe-only bar.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   puts `mon_iron` - a passive from docs/SKILL_TRIAGE.md section E that is still dead, and belongs to
   another class - into the same rank slot. c2Passive is a plain id lookup over ranks 3/5/7/9, so any
   id nothing reads reproduces exactly the state the shipped game was in here. `okAgainstInert` is
   therefore what this probe would report against the unfixed game, and it must be false while `ok`
   is true. */
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
  __BF3.meta.classId = 'reaper';

  /* Off-class casting was fault 1 of this sub-project's bench repairs: a great many handlers gate
     their defining half on `classFamilyOk(p.weapon)`, and the Arena hands you a sword. */
  let weaponNote = 'none';
  (function(){
    const tries = ['reaper'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('reaper');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned to wired options that cannot touch an enemy's corrupt meter,
     so the only thing that can move it is the rank under test. */
  cs.ch[3] = 'x_strength';
  cs.ch[5] = 'x_wraithwalk';
  cs.ch[7] = 'x_crimson';

  const CORR = (e) => (e && e.st && e.st.corrupt) || 0;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };

  /* One trial. `corrupted` decides whether the body that gets the designated hit was corrupted
     first — the condition on the card.

     Everything is driven through the game's own doors: corruption is built by real `hitEnemy` calls
     carrying the void element (10892 routes those into applyElement), and the rupture is a real
     designated hit (10915 is where the game itself calls ruptureCorrupt). The probe never calls
     ruptureCorrupt, applyStatus or the passive directly. `G._desig` is the game's own flag for "this
     was a charged hit or a skill" and is set the same way useSkill sets it (10590). */
  const trial = (corrupted) => {
    G.enemies.length = 0;
    const tgt  = __BF3.spawnEnemy('grunt', p.x,       p.z - 240);
    const near = __BF3.spawnEnemy('grunt', p.x +  80, p.z - 240);
    const far  = __BF3.spawnEnemy('grunt', p.x + 420, p.z - 240);
    if(!tgt || !near || !far) return { corrupted: corrupted, why: 'bodies could not be spawned' };
    for(const e of [tgt, near, far]){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0;                                  // hold the geometry still; "near" is a distance
      e.hp = e.maxHp = 100000;                      // nothing under test may die and change the set
    }

    let built = 0;
    if(corrupted){
      /* Real void hits on the TARGET only, spaced past applyStatus's 0.12s per-target rate limit by
         ticking the game rather than by clearing the limiter. */
      for(let k = 0; k < 5; k++){
        G._desig = false;
        try { __BF3.hitEnemy(tgt, 20, p, 0, 0, 'void'); } catch(e){}
        tick(10);
      }
      built = CORR(tgt);
    }

    const nearBefore = CORR(near), farBefore = CORR(far), tgtBefore = CORR(tgt);

    G._desig = true;
    let threw = null;
    try { __BF3.hitEnemy(tgt, 20, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    G._desig = false;

    /* Read the ruptured body's OWN meter HERE, not at the end of the trial. The first version read
       it last and the fixed game failed its own clean-check: the neighbour's rupture in the payoff
       block below is 80 units from this body and spreads corruption straight back onto it, so
       `tgt` was capped again by the time it was measured. That is the fix chaining, correctly, and
       the probe was mis-reading it as a rupture that never happened. */
    const tgtAfter = CORR(tgt);
    const nearAfter = CORR(near), farAfter = CORR(far);
    tick(60);                                       // the stack must still be there a second later
    const nearHeld = CORR(near);

    /* THE PAYOFF, which is the only thing the card is worth to a player: can the neighbour now be
       ruptured? Topped to the cap through the game's own void hits, then hit designated, and the
       damage it takes is read. A neighbour that gained a stack it can never cash in has gained
       nothing. */
    let cashed = 0;
    if(nearHeld > 0){
      for(let k = 0; k < 5; k++){
        G._desig = false;
        try { __BF3.hitEnemy(near, 20, p, 0, 0, 'void'); } catch(e){}
        tick(10);
      }
      const hp0 = near.hp;
      G._desig = true;
      try { __BF3.hitEnemy(near, 20, p, 0, 0, null); } catch(e){}
      G._desig = false;
      cashed = Math.round(hp0 - near.hp) - 20;      // minus the hit's own 20, so this is the rupture
    }

    return {
      corrupted: corrupted, threw: threw, built: Math.round(built * 100) / 100,
      tgtBefore: Math.round(tgtBefore * 100) / 100,
      tgtAfter: Math.round(tgtAfter * 100) / 100,
      ruptured: corrupted ? (tgtBefore >= 5 && tgtAfter === 0) : false,
      /* The chain, reported rather than asserted: after the neighbour is ruptured in its turn, is
         this body corrupted again? It is only a consequence of the radius being symmetric, so it is
         evidence and not a clause of the card. */
      chainedBack: Math.round(CORR(tgt) * 100) / 100,
      nearBefore: nearBefore, nearAfter: Math.round(nearAfter * 100) / 100,
      nearHeld: Math.round(nearHeld * 100) / 100,
      farBefore: farBefore, farAfter: Math.round(farAfter * 100) / 100,
      cashed: cashed,
      dNear: Math.round(dist(near, tgt)), dFar: Math.round(dist(far, tgt)),
    };
  };

  const half = (pick) => {
    cs.ch[9] = pick;
    return { pick: pick, hot: trial(true), cold: trial(false) };
  };

  const control = half('x_favor');       // b-side of the same rank: wired, and corrupts nobody
  const mastery = half('x_corrupt');
  const inert   = half('mon_iron');      // an id nothing reads — the permanent known-bad

  /* A half is only readable if its hot trial actually ruptured something and its geometry held. */
  const clean = (h) => !h.hot.threw && !h.cold.threw && h.hot.ruptured
                    && h.hot.dNear < 120 && h.hot.dFar > 120 && h.cold.dNear < 120;
  const allClean = [control, mastery, inert].every(clean);

  /* The bar, one clause per clause of the card.
     - rupturing a CORRUPTED enemy: the near foe gains a whole stack, it survives a second of the
       game's own ticks, and it can be cashed in for real rupture damage
     - the FAR foe gains nothing: "everything near it" is a radius
     - rupturing an UNCORRUPTED enemy spreads nothing: that is the condition on the card
     - the control does none of it */
  const bar = (h) => h.hot.nearAfter >= h.hot.nearBefore + 1 && h.hot.nearHeld >= 1
                  && h.hot.cashed > 0
                  && h.hot.farAfter === h.hot.farBefore
                  && h.cold.nearAfter === h.cold.nearBefore;
  const controlHeld = control.hot.nearAfter === control.hot.nearBefore
                   && control.hot.farAfter === control.hot.farBefore
                   && control.cold.nearAfter === control.cold.nearBefore;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(mastery)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld,
    control: control, mastery: mastery, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
