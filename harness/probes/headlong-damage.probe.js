/* DOES HEADLONG DEAL ITS HIT NOW, AND HOW FAR DOES IT CARRY YOU WHILE IT DOES?

   Berserker Charge's card (index.html:2131) reads "Rush forward, damaging and stunning in your
   path". Measured before this fix: 684 units travelled, 0 damage at every bench distance, because
   bsk_charge drives p._headlongT and the headlong tick only ever MOVED the body - the hit loop
   lives in the OTHER movement channel, p.chargeDash, which is the one warrior's Charge uses.

   This probe reports both halves of the design call in one launch:
     1. does the hit land (dealt > 0, and at the 1.6x the pattern was copied from), and
     2. how far the body travels while landing it - the number Oliver asked to see next to
        warrior's, because 684 against warrior's ~315 is what suggests this was built as a pure
        gap-closer and may want retuning now that it damages.

   BOTH CHARGES ARE MEASURED IN THE SAME LAUNCH against the same frozen sink with the same weapon
   scale, so the ratio between them is not a comparison across two runs of a game whose effPower
   fold differs (charge.probe.js records two launches reading the identical control cell at 4.2973
   and 5.0278 - an absolute would lie, a same-launch pair does not).

   THE SINK IS FROZEN AND UNKILLABLE (speed 0, 1e7 HP) so the geometry is the one thing identical
   across trials, and G.combo is pinned to 0 every frame because it multiplies every blow by up to
   1.20 off a run-wide counter (legion.probe.js measured a fabricated 1.159 from skipping it).

   KNOWN-BAD, WATCHED, NOT ASSUMED. Run against the unfixed index.html (git checkout of the file,
   probe unchanged) this reports:
       ok false, headlongDealsItsHit false, headlongStuns false,
       berserker { dealt 0, chDmg 0, mult 0, maxStun 0 },
       warrior   { dealt 90, chDmg 80, mult 1.6, maxStun 0.78 }
   and with the fix restored, the berserker row becomes { dealt 84, chDmg 74, mult 1.6, maxStun
   0.78 } while the WARRIOR ROW IS IDENTICAL IN BOTH DIRECTIONS - which is the second thing this
   probe is for. Warrior's Charge shares _chDmg/_chOk/_chHit with Headlong now, so "the reference
   skill did not move" is a claim that has to be measured rather than reasoned about. */
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

  const HOME = { x: p.x, y: p.y, z: p.z };
  let ticks = 0, playTicks = 0;

  const tick = (n) => {
    for(let k = 0; k < n; k++){
      ticks++;
      if(__BF3.mode === 'play') playTicks++;
      G.combo = 0;
      p.hp = __BF3.effMaxHp(p); p.invuln = Math.max(p.invuln || 0, 5);
      try { __BF3.update(1/60); } catch(e){}
    }
  };

  /* In-family starter through the game's own classStartWeapon: every SKILL_FX body is handed
     classFamilyOk(p.weapon) as `ok`, and both charges gate their STUN on it.

     THE anyClass FALLBACK IS NOT OPTIONAL FOR THIS CLASS, and leaving it out is the third rig fault
     this probe shipped. NO starter in the game lands in the berserker's weapon family, so the
     preference walk falls off the end and the hero keeps whatever the Arena handed him - which is
     off-family. The cast then takes OFFCLASS_MUL and, more importantly, skips the `if(_chOk)` stun
     entirely: the probe read mult 0.96 (= 1.6 x 0.6) and maxStun 0 and looked like it had caught the
     fix not stunning. It had caught its own bench standing somewhere index.html:13220 hard-blocks a
     real player from standing. test-skills.js solves it the same way (its line 149). */
  const equip = (cls) => {
    const tries = [cls].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; if(p.weapon) p.weapon.el = null;
        return (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]); }
    }
    let w = null; try { w = __BF3.classStartWeapon(cls); } catch(e){}
    if(w){ w.anyClass = true; w.el = null; p.weapon = w;
           return 'FORCED anyClass - no starter in the game lands in this class family'; }
    return 'none';
  };

  const reset = () => {
    G.enemies.length = 0;
    if(G.minions) G.minions.length = 0;
    if(G.projectiles) G.projectiles.length = 0;
    p.x = HOME.x; p.y = HOME.y; p.z = HOME.z; p.vx = 0; p.vz = 0;
    p.yaw = 0;                                   // +z, so dashZ = cos(0) = 1 carries both charges at the body
    p.chargeDash = 0; p._headlongT = 0; p._chDmg = 0;
    p.hp = __BF3.effMaxHp(p);
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) for(let i = 0; i < p.skillCd.length; i++) p.skillCd[i] = 0;
  };

  const sink = () => {
    const e = __BF3.spawnEnemy('grunt', HOME.x, HOME.z + 60);
    if(e){ e.active = true; e.dead = false; e.hp = e.maxHp = 1e7; e.speed = 0; e.vx = 0; e.vz = 0; e.dropT = 0; }
    return e;
  };

  /* Found by fx id, never by slot, so a rank retune cannot silently repoint the probe, and cast
     through useSkill so it goes down the same path the game uses.

     TWO RIG FAULTS THIS PROBE HAD ON ITS FIRST LAUNCH, both mine and both fixed here, recorded
     because each produced a number that looked like a finding:

     - IT READ THE STUN AFTER THE STUN HAD EXPIRED. The stun both charges apply is 0.8s and the
       probe sampled foe.stunT once, after ticking 1.2s. It read 0 for the BERSERKER and 0 for the
       WARRIOR - i.e. it accused the known-working reference skill of not stunning either, which is
       what gave it away. Sampled every frame now and reported as a max.

     - IT COMPARED TWO DIFFERENT WEAPONS AS IF THEY WERE A MULTIPLIER. No starter in the game lands
       in the berserker's weapon family (test-skills.js reports the same thing as "FORCED anyClass"),
       so equip() fell through to the arena's Vampiric Legendary Sword for the berserker and the
       Rusty Sword for the warrior. Raw dealt was 170 vs 90 - a 1.889 "ratio" that is a weapon gap,
       not a damage-multiplier gap. The multiplier is now RECOVERED from the handler's own arithmetic
       (chDmg / (weapon.dmg * effPower)) so it is weapon-independent and both should read 1.6. */
  const trial = (cls, fxid, withSink) => {
    __BF3.meta.classId = cls;
    const weaponNote = equip(cls);
    reset();
    const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
    let idx = -1;
    for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === fxid){ idx = i; break; } }
    if(idx < 0) return { why: fxid + ' is not in the rank-10 build', casts: skills.map(s => s && s.fx) };
    const foe = withSink ? sink() : null;
    if(withSink && !foe) return { why: 'no sink could be spawned' };
    const before = foe ? foe.hp : 0, start = { x: p.x, z: p.z };
    if(p.skillCd) p.skillCd[idx] = 0;
    p.mana = p.manam || p.manaMax || 999;
    const onClass = (function(){ try { return !!__BF3.classFamilyOk(p.weapon); } catch(e){ return null; } })();
    let threw = null, ret = null;
    try { ret = __BF3.useSkill(idx); } catch(e){ threw = String(e && e.message || e); }
    const chDmg = p._chDmg != null ? Math.round(p._chDmg) : null;
    /* The multiplier the handler actually applied, backed out of its own product so the weapon
       divides out. Both bodies compute dmg = weapon.dmg * effPower * MULT * am * (ok?1:OFFCLASS_MUL),
       and abilityMul() (2352) is a retired hook that returns a hard 1, so `am` drops out.

       effPower MUST BE READ INSIDE THE CAST'S OWN CONTEXT, and this is the fourth fault this probe
       had. useSkillLegacy sets G._desig = true around the SKILL_FX call - skills are "designated"
       attacks - and effPower (3724) reads that flag: the warrior's w_heavy passive is
       `if(c2Passive('w_heavy') && !(G && G._desig)) v *= 1.12`, i.e. it applies to ordinary swings
       and NOT to skills. Reading effPower after the cast returns it, so the recovered multiplier
       came back 1.6/1.12 = 1.429 for the warrior and a clean 1.6 for the berserker, which read as
       the two skills disagreeing when it was one passive being counted in the divisor and not the
       dividend. Restoring the flag makes both classes report the multiplier their handler used. */
    const wdmg = (p.weapon ? p.weapon.dmg : 10);
    const _prevDesig = G._desig;
    G._desig = true;
    const pw = __BF3.effPower(p);
    G._desig = _prevDesig;
    const mult = (wdmg && pw) ? (p._chDmg / (wdmg * pw)) : null;
    let maxStun = 0;
    for(let k = 0; k < 72; k++){ tick(1); if(foe) maxStun = Math.max(maxStun, foe.stunT || 0); }
    return {
      dealt: foe ? Math.round(before - foe.hp) : null,
      dist: Math.round(Math.hypot(p.x - start.x, p.z - start.z)),
      chDmg: chDmg, mult: mult == null ? null : Math.round(mult * 1000) / 1000,
      maxStun: Math.round(maxStun * 100) / 100,
      onClass: onClass, weapon: (p.weapon || {}).name, weaponNote: weaponNote,
      refund: ret === 'refund', threw: threw,
    };
  };

  const bsk = trial('berserker', 'bsk_charge', true);
  const war = trial('warrior', 'w_charge', true);
  /* NO FREE-SPACE REACH IS REPORTED FROM THIS SCENE, and the reason is worth leaving in place.
     The first launch reported "distanceFreeSpace" berserker 443 / warrior 293 and the with-a-body
     numbers came back 443 / 293 as well - IDENTICAL to the unit, which is not what a charge that
     ploughs into a grunt should read. arena:flat bounds the run at ~443 units from this spawn, so
     the berserker number is the WALL, not the skill: 0.9s x 760 u/s is 684 and it never got there.
     Warrior's 293 is just over its own 0.32s x 880 = 282, so warrior is unclamped and berserker is
     clamped, and reporting the pair as a ratio would have invented a 1.512 that means nothing.
     The reach figures Oliver asked about are the arithmetic above, which harness/probes/
     headlong.probe.js measured directly at 684; this probe measures the HIT, not the reach. */

  const round = (x) => x == null ? null : Math.round(x * 1000) / 1000;
  const all = [bsk, war];
  const bothLanded = bsk.dealt > 0 && war.dealt > 0;
  const bothOnClass = bsk.onClass === true && war.onClass === true;
  const modeOk = ticks > 0 && playTicks === ticks;
  const threwAnywhere = all.some(t => t.threw || t.why || t.refund);
  /* The multiplier is recovered from a product the game rounds twice, so the window matches
     charge.probe.js's stated tolerance rather than demanding an exact 1.6. */
  const near = (x, want) => x != null && Math.abs(x - want) < 0.05;

  return JSON.stringify({
    ok: !!(bothLanded && bothOnClass && modeOk && !threwAnywhere
           && bsk.maxStun > 0 && war.maxStun > 0
           && round(bsk.mult) === round(war.mult)),
    headlongDealsItsHit: bsk.dealt > 0,
    headlongStuns: bsk.maxStun > 0,
    /* Weapon-independent: the multiplier backed out of each handler's own product, so the berserker
       and the warrior are comparable even holding different swords. The bar is that the two AGREE -
       that is the whole claim of "copy the working pattern" - and the absolute is reported so a
       retune of either one shows up here rather than hiding behind a ratio of 1. */
    multiplier: { berserker: bsk.mult, warrior: war.mult,
                  agree: round(bsk.mult) === round(war.mult), bothNear1_6: near(bsk.mult, 1.6) && near(war.mult, 1.6) },
    stun: { berserker: bsk.maxStun, warrior: war.maxStun },
    damageDealt: { berserker: bsk.dealt, warrior: war.dealt },

    checks: { bothLanded: bothLanded, bothOnClass: bothOnClass, modeOk: modeOk, threwAnywhere: threwAnywhere },
    berserker: bsk, warrior: war,
    playTicks: playTicks + ' of ' + ticks,
  });
})()
