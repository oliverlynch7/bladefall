/* WHAT ELSE DOES A PROJECTILE HIT LOSE BY NOT BEING THE PLAYER'S?

   `harness/probes/basichook.probe.js` proved that a ranged basic attack never enters `CLASS_BASIC`,
   because the projectile step hands `hitEnemy` a synthetic src (index.html:13522) and the dispatch
   asks `src===G.p` (10921). That line is not the only one asking. `hitEnemy` carries NINETEEN
   `src===G.p` gates, and three of them are not class identity at all:

     10966  `if(lifesteal>0 && src===G.p)`   — the heal. The projectile step passes
            `effLifesteal(G.p)` as the parameter and the gate then throws it away.
     10898  `if(src===G.p) dmg=dmg*tPlayerDmg()` — the DIFFICULTY dial (and the beginner-trial
            damage dial).
     11007  the Stormcaller's Static stack, "every hit you land builds a Static stack (up to 5)",
            which is the class's rank-1 INNATE card and not a passive anyone chose.

   THREE TRIALS, ONE LAUNCH, ONE GEOMETRY, and the same three doors as the basic-hook probe so the
   two read together:
     1. REAL SWING    — `playerAttack()`, ticked until the bolt lands.
     2. MELEE DOOR    — `hitEnemy(tgt, DMG, p, 0, LS, null)`.
     3. SYNTHETIC SRC — `hitEnemy(tgt, DMG, {x,z}, 0, LS, null)`, 13522's own shape.

   THE DAMAGE NUMBER IS THE INSTRUMENT FOR THE DIAL. Trials 2 and 3 pass the identical damage into
   the identical target one tick apart, so anything by which the two results differ is a multiplier
   the synthetic src did not receive. It is deliberately large (2000) so the `Math.max(1,
   Math.round())` at 10935 cannot move the ratio, and the hero carries no Ian's blade and no No
   Retreat window, which are the only other `src===G.p` multipliers on that path.

   THE CLEAN-CHECK: the real swing has to have LANDED, and the hero has to be missing health before
   any lifesteal reading means anything — a full-health hero cannot be healed, and would report the
   same zero as a lifesteal that never fired. */
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
  __BF3.meta.classId = 'stormcaller';

  let weaponNote = 'none';
  (function(){
    const tries = ['stormcaller'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();
  /* Lifesteal comes from the WEAPON so the real swing carries it too — the projectile step reads
     `effLifesteal(G.p)` at the call site, which is the same door. 25% is large enough that a single
     hit is unmistakable and is never zero by rounding. */
  if(p.weapon) p.weapon.lifesteal = 0.25;
  const LS = (function(){ try { return __BF3.effLifesteal ? __BF3.effLifesteal(p) : 0.25; } catch(e){ return 0.25; } })() || 0.25;

  const cs = __BF3.classState('stormcaller');
  cs.ch = cs.ch || {}; cs.rank = 9;

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };
  const DMG = 2000;

  const setup = () => {
    G.enemies.length = 0;
    G.projectiles.length = 0;
    const tgt = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
    if(!tgt) return null;
    tgt.active = true; tgt.dummy = false; tgt.elite = false; tgt.boss = false;
    tgt.speed = 0; tgt.hp = tgt.maxHp = 5000000; tgt.stunT = 0;
    p.yaw = Math.atan2(tgt.x - p.x, tgt.z - p.z); G.camYaw = p.yaw;
    /* Room to be healed INTO. A hero at full health reads the same zero as a lifesteal that never
       fired, which is the shape this sub-project keeps having to say out loud. */
    p.hp = Math.max(1, Math.round(__BF3.effMaxHp(p) * 0.4));
    p.staticStacks = 0; p.staticT = 0;
    tick(2);
    return tgt;
  };

  const read = (tgt, hp0, stat0) => ({
    tgtLost: Math.round(hp0 - tgt.hp),
    heroHealed: Math.round(p.hp - hpBefore),
    staticStacks: Math.round((p.staticStacks || 0) - stat0),
  });
  let hpBefore = 0;

  const realSwing = (() => {
    const tgt = setup(); if(!tgt) return { why: 'no body' };
    const hp0 = tgt.hp; hpBefore = p.hp; const stat0 = p.staticStacks || 0;
    p.atkCd = 0;
    let threw = null;
    try { __BF3.playerAttack(); } catch(e){ threw = String(e && e.message || e); }
    let landedAt = -1;
    for(let k = 0; k < 180; k++){
      tick(1);
      if(landedAt < 0 && tgt.hp < hp0) landedAt = k;
      if(landedAt >= 0 && k > landedAt + 2) break;
    }
    const r = read(tgt, hp0, stat0);
    /* Ticking regenerates and the hero is at 40% — so the heal is reported as "did the pool move
       more than the ticks alone would", and the control halves run the same number of ticks. */
    return Object.assign({ threw: threw, landedAtTick: landedAt, landed: r.tgtLost > 0 }, r);
  })();

  /* REGEN BASELINE. The real swing has to be ticked for the bolt to fly, and the hero regenerates
     while it does — so a heal reading taken over those ticks is confounded in the FLATTERING
     direction: it would report a lifesteal that never fired. Same setup, same tick count, no
     attack. Whatever this reports is subtracted from the swing's. */
  const regenOnly = (() => {
    const tgt = setup(); if(!tgt) return { why: 'no body' };
    const hp0 = tgt.hp; hpBefore = p.hp; const stat0 = p.staticStacks || 0;
    tick(Math.max(4, (realSwing.landedAtTick || 25) + 3));
    return read(tgt, hp0, stat0);
  })();

  const meleeDoor = (() => {
    const tgt = setup(); if(!tgt) return { why: 'no body' };
    const hp0 = tgt.hp; hpBefore = p.hp; const stat0 = p.staticStacks || 0;
    let threw = null; G._desig = false;
    try { __BF3.hitEnemy(tgt, DMG, p, 0, LS, null); } catch(e){ threw = String(e && e.message || e); }
    return Object.assign({ threw: threw }, read(tgt, hp0, stat0));
  })();

  const syntheticSrc = (() => {
    const tgt = setup(); if(!tgt) return { why: 'no body' };
    const hp0 = tgt.hp; hpBefore = p.hp; const stat0 = p.staticStacks || 0;
    let threw = null; G._desig = false;
    try { __BF3.hitEnemy(tgt, DMG, { x: tgt.x, z: tgt.z + 30 }, 0, LS, null); }
    catch(e){ threw = String(e && e.message || e); }
    return Object.assign({ threw: threw }, read(tgt, hp0, stat0));
  })();

  return JSON.stringify({
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, lifesteal: LS, dmgIn: DMG,
    realSwing: realSwing, regenOnly: regenOnly, meleeDoor: meleeDoor, syntheticSrc: syntheticSrc,
    swingHealNetOfRegen: (realSwing.heroHealed != null && regenOnly.heroHealed != null)
                           ? realSwing.heroHealed - regenOnly.heroHealed : null,
    /* The three consequences, each stated as the comparison that shows it. */
    dialRatio: (meleeDoor.tgtLost && syntheticSrc.tgtLost)
                 ? Math.round(meleeDoor.tgtLost / syntheticSrc.tgtLost * 1000) / 1000 : null,
    lifestealReachesRangedHit: !!(realSwing.heroHealed != null && regenOnly.heroHealed != null
                                  && (realSwing.heroHealed - regenOnly.heroHealed) > 0),
    staticReachesRangedSwing: !!(realSwing.staticStacks > 0),
    ok: !!(realSwing.landed && meleeDoor.tgtLost > 0 && syntheticSrc.tgtLost > 0),
  });
})()
