/* "YOUR MINIONS HIT 20% HARDER" REACHES ONE OF THE NECROMANCER'S THREE MINION SKILLS

   Bone Legion (necromancer r3 a, index.html:2107): "Summon one extra skeleton and your minions hit
   20% harder."  Master of Death (r9 a, 2112): "Keep more minions at once and they hit even harder."

   Found by the single-site half of the undocumented-rider sweep (docs/SKILL_TRIAGE.md section X,
   "THE FLOOR THIS SECTION NAMED WAS TAKEN"). `c2Passive('necro_legion')` has exactly ONE site in the
   file and it is inside `SKILL_FX.necro_summon` (11947). `necro_master` has three, and they are
   `necroMinCap()` plus a x1.25 in `necro_summon` and in `necro_army`. So:

     - Raise the Dead (r4 a) is reached by NEITHER passive, and its own card is the one that
       advertises "a stronger risen fighter";
     - Army of the Dead (r8 a) is reached by Master of Death and not by Bone Legion;
     - and `necro_raise` calls `spawnMinion` with no `cap` (11952/11953), so the default 14 (11907)
       applies and a raise made while holding more than fourteen minions EVICTS the oldest - against
       a capstone whose text is "you may keep more of them at once".

   TAKEABLE, by this document's standing test: 20% is on Bone Legion's card, x1.25 is already the
   file's own encoding of Master of Death (it is the literal in the two summons that DO read it), and
   `necroMinCap()` is the function those same two already pass. Nothing is chosen. The rider on the
   same card - `necro_summon`'s 0.85/0.65, which is x1.308 where the card says x1.20 - is NOT touched
   and stays Oliver's, exactly as pass 49 left Weapon Master's undocumented stagger alone.

   THE BAR IS DAMAGE A MINION TAKES OFF A BODY, not the `dmg` field the handler writes. This
   sub-project has been burned twice measuring what the code sets (pass 15, Burning Light lit exactly
   the right enemy and burned nothing; pass 23, which measured distance covered rather than the speed
   multiplier). Every reading below is a dummy's HP before minus its HP after, produced by the game's
   own `minionUpdate` -> `hitEnemy` path. The `dmg` field is carried alongside as a diagnostic only.

   DETERMINISTIC BY CONSTRUCTION rather than by averaging. Each round sets every live minion's
   `atkT` to 0 and ticks; `minionUpdate` (11930) fires one blow per minion and re-arms it to 0.8s
   (melee) or 1.1s (ranged), neither of which can come round again inside the round's window. So a
   trial is exactly `rounds x minions` blows in both halves, and the ratio is damage and not tempo.

   THREE HALVES IN ONE LAUNCH, the third a half that must NOT move:
     - `ctrl` - r3 Withering, r9 Pestilence: neither minion passive held.
     - `pass` - r3 Bone Legion, r9 Master of Death: both held.
     - `bad`  - the control's picks with r5 Grave Bond added. Grave Bond pays the PLAYER on a minion
                hit (11940) and cannot touch what the minion deals, so every bar must read the
                control's number. A half that moved here would mean the probe is measuring the pick
                and not the passive.

   FOUR TRIALS PER HALF, and the first is the instrument's own positive control:
     - `summon` - Summon Skeletons' COUNT. Bone Legion's one working clause (`legion?4:3`), which is
                  correct in the shipped game. If this does not read 3 in `ctrl` and 4 in `pass` the
                  half was never armed and nothing below it means anything. It is deliberately not a
                  damage bar: legion changes the count here, so a dealt-damage reading would mix the
                  two clauses.
     - `raise`  - THE ROW. One melee minion off a real corpse, eight blows. Reads 1.000 against the
                  shipped game and must read x1.50 after (x1.20 legion * x1.25 master).
     - `army`   - six minions, the same count in every half because legion adds none here. Reads
                  x1.25 against the shipped game (Master of Death alone) and must read x1.50 after.
                  A trial whose control is already non-1.000 is worth more than one that is not: it
                  proves the instrument can see this class's minion damage at all.
     - `cap`    - twenty minions parked, then a raise. The shipped default of 14 shifts one out, so
                  the list stays at 20; `necroMinCap()` at rank 10 is 26, so it must reach 21.

   PLAY-MODE RECEIPT, because AUTOPILOT.md demands one: a probe that drives the player for more than
   a few seconds will have the game stop under it and it looks like data. Every tick is counted and
   the ticks that ran with `mode === 'play'` are counted separately; a shortfall invalidates the run
   rather than quietly halving every number. */
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
  __BF3.meta.classId = 'necromancer';

  /* Through the game's own classStartWeapon: every SKILL_FX handler is handed classFamilyOk(p.weapon)
     and the three summons all multiply by OFFCLASS_MUL without it, which would scale every reading
     here by the same factor and still be the wrong rig. */
  let weaponNote = 'none';
  (function(){
    const tries = ['necromancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  /* THE TWO-LIST CHECK. useSkill(i) casts c2CurSkills()[i] and NOT curSkills()[i] - the mismatch that
     invalidated every verdict this suite had ever produced (faf52c3). All three slots are named. */
  const casts = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : []).map(s => s && s.n);
  const SUMMON = 0, RAISE = 1, ARMY = 3;
  const slotsOk = /summon/i.test(String(casts[SUMMON] || ''))
               && /raise/i.test(String(casts[RAISE] || ''))
               && /army/i.test(String(casts[ARMY] || ''));

  const cs = __BF3.classState('necromancer');
  cs.ch = cs.ch || {}; cs.rank = 10;

  const HOME = { x: p.x, y: p.y, z: p.z };
  let ticks = 0, playTicks = 0;

  /* `G.combo` IS PINNED TO 0 EVERY FRAME AND THE FIRST RUN IS WHY. `hitEnemy` multiplies every blow
     by `1 + min(0.2, G.combo * 0.004)` (10884) - a run-wide counter that climbs as blows land and
     decays on its own clock, so it is a per-TRIAL constant that drifts UPWARD through a launch. It
     showed up as the half that must not move reading 1.159 instead of 1.000: two halves with
     identical picks, identical minion counts and identical `dmg` fields dealt 352 and 408, because
     one ran first and one ran ninth. Pinned rather than averaged away - the halves are meant to
     differ in one thing, and a confound that rises monotonically through the run does not cancel. */
  const tick = (n) => {
    for(let k = 0; k < n; k++){
      ticks++;
      if(__BF3.mode === 'play') playTicks++;
      G.combo = 0;
      p.hp = __BF3.effMaxHp(p); p.invuln = Math.max(p.invuln || 0, 5);   // the dummy is a damage sink, not an opponent
      try { __BF3.update(1/60); } catch(e){}
    }
  };

  const clearRoom = () => {
    G.enemies.length = 0;
    G.minions = G.minions || []; G.minions.length = 0;
    G.corpses = [];
    if(G.projectiles) G.projectiles.length = 0;
    p.x = HOME.x; p.y = HOME.y; p.z = HOME.z; p.vx = 0; p.vz = 0;
    p.hp = __BF3.effMaxHp(p);
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) for(let i = 0; i < p.skillCd.length; i++) p.skillCd[i] = 0;
  };

  /* A body that stands still and cannot die. Frozen because the geometry is the one thing that must
     be identical across halves - `harness/probes/freeze.probe.js` measured what freezing costs, and
     what it costs is payouts that depend on being HIT, of which there are none here. */
  const sink = (dx, dz) => {
    const e = __BF3.spawnEnemy('grunt', HOME.x + dx, HOME.z + dz);
    if(e){ e.active = true; e.dead = false; e.hp = e.maxHp = 1e7; e.speed = 0; e.vx = 0; e.vz = 0; e.dropT = 0; }
    return e;
  };

  const cast = (slot) => {
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) p.skillCd[slot] = 0;
    let threw = null;
    try { __BF3.useSkill(slot); } catch(e){ threw = String(e && e.message || e); }
    return threw;
  };

  /* Eight blows from every minion in the list, each one through minionUpdate. The minions are placed
     beside the body first because they spawn at the CASTER with a +-22 jitter and would otherwise
     spend the window walking; `want` (11925) then holds them at 34 (melee) or 200 (ranged), both
     inside their own attack reach. */
  const blows = (foe, rounds, frames) => {
    for(let r = 0; r < rounds; r++){
      for(const m of G.minions){
        if(m.dead) continue;
        const ang = (r + 1) * 1.7;
        m.x = foe.x + Math.sin(ang) * (m.ranged ? 190 : 30);
        m.z = foe.z + Math.cos(ang) * (m.ranged ? 190 : 30);
        m.y = foe.y; m.atkT = 0;
      }
      tick(frames);
    }
  };

  /* THE INSTRUMENT'S OWN POSITIVE CONTROL, and it is a DEALT reading rather than a field read. Bone
     Legion's count clause and Master of Death's x1.25 both already work here, so `perMinion` must
     read x1.635 (0.85 * 1.25 / 0.65) in the pass half BEFORE and AFTER the fix - this trial is the
     one thing the fix must not move. Per minion rather than total, because legion changes the count
     here and a total would mix the two clauses. */
  const trialSummon = () => {
    clearRoom();
    const threw = cast(SUMMON);
    const spawned = (G.minions || []).length;
    const dmg = spawned ? G.minions[0].dmg : null;
    const foe = sink(0, 300);
    if(!foe) return { why:'no sink could be spawned' };
    const before = foe.hp;
    blows(foe, 8, 3);
    const dealt = Math.round(before - foe.hp);
    return { spawned: spawned, dmg: dmg, dealt: dealt,
             perMinion: spawned ? Math.round(dealt / spawned * 100) / 100 : null, threw: threw };
  };

  const trialRaise = () => {
    clearRoom();
    /* A corpse from the game's own death path (11024, t:3.5) rather than one written by hand, so the
       cast takes its CORPSE branch (one stronger fighter) and not its corpseless fallback of two
       weaker ones - which is a different line with a different multiplier. */
    const victim = sink(0, 60);
    if(!victim) return { why:'no victim could be spawned' };
    G._desig = false;
    try { __BF3.hitEnemy(victim, victim.hp + 9999, p, 0, 0, null); } catch(e){ return { why:'lethal swing threw: ' + e }; }
    G.enemies.length = 0;
    const threw = cast(RAISE);
    const risen = (G.minions || []).length;
    const dmg = risen ? G.minions[0].dmg : null;
    const foe = sink(0, 300);
    if(!foe) return { why:'no sink could be spawned' };
    const before = foe.hp;
    blows(foe, 8, 3);
    return { risen: risen, dmg: dmg, dealt: Math.round(before - foe.hp), threw: threw };
  };

  const trialArmy = () => {
    clearRoom();
    const threw = cast(ARMY);
    const spawned = (G.minions || []).length;
    const melee = G.minions.filter(m => !m.ranged).length;
    const dmg = spawned ? G.minions[0].dmg : null;
    const foe = sink(0, 300);
    if(!foe) return { why:'no sink could be spawned' };
    const before = foe.hp;
    blows(foe, 8, 34);   // 34 frames clears a 190-unit seeking bolt at 520 u/s and re-arms nobody
    return { spawned: spawned, melee: melee, dmg: dmg, dealt: Math.round(before - foe.hp), threw: threw };
  };

  /* THE CAP CLAUSE. Twenty parked minions, then one raise. spawnMinion shifts when the list is at or
     past its cap, so the shipped default of 14 keeps the list at 20 and evicts the oldest, while
     necroMinCap() - 26 at rank 10 with Master of Death - lets it reach 21. The parked minions are
     pushed through the game's own spawnMinion at a cap of 99 so nothing about the parking is what is
     being measured. */
  const trialCap = () => {
    clearRoom();
    const victim = sink(0, 60);
    if(!victim) return { why:'no victim could be spawned' };
    G._desig = false;
    try { __BF3.hitEnemy(victim, victim.hp + 9999, p, 0, 0, null); } catch(e){ return { why:'lethal swing threw: ' + e }; }
    G.enemies.length = 0;
    G.minions.length = 0;
    for(let i = 0; i < 20; i++) __BF3.spawnMinion(p.x, p.z, { dmg: 1, life: null, ranged: false, cap: 99 });
    const parked = G.minions.length;
    const threw = cast(RAISE);
    return { parked: parked, after: G.minions.length, threw: threw };
  };

  const half = (r3, r5, r9) => {
    cs.ch[3] = r3; cs.ch[5] = r5; cs.ch[9] = r9;
    return {
      picks: { r3: r3, r5: r5, r9: r9 },
      summon: trialSummon(),
      raise:  trialRaise(),
      army:   trialArmy(),
      cap:    trialCap(),
    };
  };

  const ctrl = half('necro_wither', 'necro_plague', 'necro_pest');
  const pass = half('necro_legion', 'necro_plague', 'necro_master');
  const bad  = half('necro_wither', 'necro_bond',   'necro_pest');

  const round = (x) => x == null ? null : Math.round(x * 1000) / 1000;
  const ratio = (a, b) => (b && b > 0) ? round(a / b) : null;

  const rRaise  = ratio(pass.raise.dealt, ctrl.raise.dealt);
  const rArmy   = ratio(pass.army.dealt,  ctrl.army.dealt);
  const rSummon = ratio(pass.summon.perMinion, ctrl.summon.perMinion);
  const rBadR   = ratio(bad.raise.dealt,  ctrl.raise.dealt);
  const rBadA   = ratio(bad.army.dealt,   ctrl.army.dealt);
  const rBadS   = ratio(bad.summon.perMinion, ctrl.summon.perMinion);

  /* TOLERANCE 0.05, and it is rounding rather than slack. Every handler rounds its minion's `dmg` to
     a whole number before the multipliers are applied, so a x1.20 * x1.25 on a base near 21 can land
     anywhere in 1.467..1.533 depending on which side of a half the two roundings fall. The bar it has
     to separate is 1.000 against 1.500, which no rounding can blur. */
  const near = (x, want, tol) => x != null && Math.abs(x - want) < (tol || 0.05);

  const threwAnywhere = [ctrl, pass, bad].some(h =>
    h.summon.threw || h.raise.threw || h.army.threw || h.cap.threw ||
    h.summon.why || h.raise.why || h.army.why || h.cap.why);

  /* CLEAN-CHECKS. Every one of them can only be satisfied by the bench working, never by the fix:
     the slots are the skills they are named after, the passives really are held where they are meant
     to be, the counts the game controls are the counts it should be, every half actually dealt
     damage (so a zero elsewhere is a real zero), and the world never left play mode. */
  const countsOk = ctrl.summon.spawned === 3 && pass.summon.spawned === 4 && bad.summon.spawned === 3
                && ctrl.raise.risen === 1 && pass.raise.risen === 1 && bad.raise.risen === 1
                && ctrl.army.spawned === 6 && pass.army.spawned === 6 && bad.army.spawned === 6;
  /* BOTH PASSIVES ARE ARMED IN THE PASS HALF, asked of the game rather than of the object we wrote:
     `c2Passive` is not on __BF3, so a boolean read would have had to transcribe the game's own gate.
     Summon Skeletons already honours both cards, so its count (legion) and its per-minion damage
     (0.85 * 1.25 / 0.65 = 1.635, both passives) ARE the receipt - and neither is touched by the fix,
     so this control reads the same before and after. */
  /* The count clause is exact and carries no rounding, so it is the hard half. The damage half is
     asserted as a FLOOR rather than a point: `0.85 * 1.25 / 0.65` is 1.635 in real numbers but each
     handler rounds its minion's `dmg` to a whole number first, and at this weapon's scale that is 19
     against 11 - a measured 1.727. A point bar there would be asserting a rounding. What makes it a
     control is that the fix does not touch `necro_summon` at all, so this figure must come back
     IDENTICAL in the after-run; that comparison is between the two runs, not inside one. */
  const armedOk = pass.summon.spawned === 4 && rSummon != null && rSummon > 1.5;
  const dealtOk = [ctrl, pass, bad].every(h => h.raise.dealt > 0 && h.army.dealt > 0 && h.summon.dealt > 0);
  const modeOk  = ticks > 0 && playTicks === ticks;
  const clean   = !!(slotsOk && countsOk && armedOk && dealtOk && modeOk && !threwAnywhere);

  return JSON.stringify({
    /* THE THREE BARS THE ROW TURNS ON. All three false against the shipped game. */
    ok: !!(clean && near(rRaise, 1.50) && near(rArmy, 1.50) && pass.cap.after === 21),
    raiseGetsBothPassives: near(rRaise, 1.50),
    armyGetsBoneLegionToo: near(rArmy, 1.50),
    raiseHonoursTheCap:    pass.cap.after === 21,

    clean: clean,
    checks: { slotsOk: slotsOk, countsOk: countsOk, armedOk: armedOk, dealtOk: dealtOk, modeOk: modeOk,
              threwAnywhere: threwAnywhere },
    /* The half that must not move. All three must read 1.000 whatever the game does. */
    knownBad: { raise: rBadR, army: rBadA, summon: rBadS },
    ratios: { raise: rRaise, army: rArmy, summonPerMinion: rSummon },
    ctrl: ctrl, pass: pass, bad: bad,
    casts: casts, weapon: (p.weapon || {}).name, weaponNote: weaponNote,
    playTicks: playTicks + ' of ' + ticks,
  });
})()
