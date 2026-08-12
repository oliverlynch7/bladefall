/* DOES MASTER STRIKER (THE PASSIVE) DO ANYTHING AT ALL?

   Monk rank-9 option b (index.html:2172) reads: "Every fourth unbroken strike hits everything around
   you." `harness/audit-passives.js` says the id `mon_master` appears exactly twice in the whole of
   public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and nowhere
   else. It is one of the rows in docs/SKILL_TRIAGE.md section E.

   NOTHING HERE IS INVENTED, which is why this row was takeable at all.
   - "Everything around you" is the monk's OWN Whirl Kick, verbatim: SKILL_FX.mon_whirl is
     SKILL_FX.w_whirl (10261), whose reach is `<165+e.r` over combatTargets() with a losBlocked check
     and a 260 knockback, and whose ring is `skillRing(...,185)`. The class already has an authored
     answer to "strikes everything around you" and this passive is that answer fired by a chain
     instead of by a button.
   - "Every fourth" needs no new machinery either: `w_swift` (warrior) is the same shape four hundred
     lines up - `src._swiftHits%4===0` at 10781 - and the SPLASH is Soul Tether's shape (10824), a
     re-entrant-guarded loop over combatTargets() from inside hitEnemy.
   - "Unbroken" is the monk's own Focus rhythm. Focus is built on every monk hit (10882) and its
     stacks are zeroed by class2Innate the moment `focusT` lapses (10048), so the game already has a
     definition of "the monk stopped attacking" and this passive borrows it rather than inventing a
     second window with a second number in it.

   THREE HALVES IN ONE LAUNCH, so the only difference between them is which passive is chosen:
   - control `mon_still`, the a-side of this very rank. It is the honest control for rank 9 because
     BOTH options at this rank are dead, so there is no wired sibling to use - and that is itself the
     point of section E: a rank-9 "choice" between two passives that each do nothing.
   - the passive itself.
   - known-bad `mon_iron`, a dead monk id fed to the identical bar, so `okAgainstInert` is what this
     probe would say against the shipped game. It must be false while `ok` is true.

   TWO CLAUSES ON THE CARD, TWO PHASES PER HALF, because "every FOURTH" and "UNBROKEN" are different
   promises and a wiring that kept only one of them would be a different, worse bug:
   - Phase 1 lands four strikes back to back on one foe. A NEIGHBOUR standing 120 units away is never
     struck directly, so anything it loses came from the splash - and it must lose nothing on strikes
     1..3 and something on strike 4. A FAR foe 420 units out is the radius control inside the same
     phase: a splash that ignored the reach would hit it too.
   - Phase 2 breaks the chain THROUGH THE GAME'S OWN DECAY (ticks of update() until focusT reaches 0,
     never by writing the counter) and then lands TWO more strikes. If the count restarts they are
     1 and 2 and nothing splashes. A `%4` counter that ignored the break would be at 5 and 6 - so
     this phase is the only thing in the probe that can tell "unbroken" from "every fourth", and it
     had to be placed at a non-multiple of four for that to be observable at all.

   G.combo IS PINNED BEFORE EVERY STRIKE. hitEnemy multiplies by `1+min(0.2,G.combo*0.004)` and
   increments the counter on every hit that passes through, so consecutive strikes drift upward by a
   percent or so and an equality assertion between them can never hold. Recorded at length in
   harness/probes/monkiller.probe.js, whose first run was defeated by exactly this.

   THE ENEMY LIST IS RE-EMPTIED AFTER EVERY TICK PHASE. The Arena keeps its own waves running, and a
   bot that wandered in during the 4 seconds of decay would stand inside the splash reach and be
   counted as a neighbour. Each phase asserts it is measuring exactly its own three bodies. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

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
  __BF3.meta.classId = 'monk';

  /* The Arena hands out its own loadout, which is usually off-class. Equip through the game's own
     starter table: the bench's rule is to stand where the game would let you stand, and the game
     hard-blocks an off-class weapon (13220). */
  let weaponNote = 'none';
  (function(){
    const tries = ['monk'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('monk');
  cs.ch = cs.ch || {};

  const BASE = 100;
  const NEAR = 120;    // inside Whirl Kick's 165 reach
  const FAR  = 420;    // outside it, by a margin no body radius can close

  let threw = null;

  /* Break the chain the way a player does: stop hitting things and let the game's own decay run.
     Nothing here writes focusT, focusStacks or the strike counter. */
  const lapse = () => {
    G.enemies.length = 0;
    let ticks = 0;
    while(ticks < 600 && ((p.focusT || 0) > 0 || (p.focusStacks || 0) > 0)){
      try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); break; }
      ticks++;
    }
    /* update() ran, so the Arena may have spawned. Clear again and only then place the trio, so the
       splash can only ever reach bodies this probe put there. */
    G.enemies.length = 0;
    return { ticks: ticks, focusT: Math.round((p.focusT || 0) * 100) / 100, stacks: p.focusStacks || 0 };
  };

  const place = () => {
    const primary   = __BF3.spawnEnemy('grunt', p.x,        p.z - 70);
    const neighbour = __BF3.spawnEnemy('grunt', p.x + NEAR, p.z);
    const far       = __BF3.spawnEnemy('grunt', p.x + FAR,  p.z);
    for(const e of [primary, neighbour, far]){
      if(!e) continue;
      e.active = true; e.hp = e.maxHp = 100000;
    }
    return { primary: primary, neighbour: neighbour, far: far, count: G.enemies.length };
  };

  /* One strike on the primary, reporting what each of the three bodies lost. Only the primary is
     ever passed to hitEnemy, so the other two readings are the splash and nothing else. */
  const strike = (t) => {
    G.combo = 0; G.comboT = 0;
    const b = { pri: t.primary.hp, nb: t.neighbour.hp, far: t.far.hp };
    try { __BF3.hitEnemy(t.primary, BASE, p, 0, 0, null); }
    catch(e){ threw = threw || String(e && e.message || e); }
    return { pri: b.pri - t.primary.hp, nb: b.nb - t.neighbour.hp, far: b.far - t.far.hp };
  };

  const trial = (pick) => {
    cs.ch[9] = pick;
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;

    const l1 = lapse();
    const t1 = place();
    if(!(t1.primary && t1.neighbour && t1.far)) return { pick: pick, why: 'targets could not be spawned' };
    const chain = [strike(t1), strike(t1), strike(t1), strike(t1)];

    /* The chain is now four long and has just splashed. Break it and land two more: with the count
       restarted these are strikes 1 and 2 of a new chain and must splash nothing. */
    const l2 = lapse();
    const t2 = place();
    if(!(t2.primary && t2.neighbour && t2.far)) return { pick: pick, why: 'targets could not be respawned' };
    const after = [strike(t2), strike(t2)];

    return { pick: pick, lapse1: l1, lapse2: l2, bodies: [t1.count, t2.count], chain: chain, afterBreak: after };
  };

  const bar = (t) => !!(t && t.chain && t.bodies && t.bodies[0] === 3 && t.bodies[1] === 3
    /* focusT is decremented while positive and left alone once it is not (10048), so a lapsed window
       reads as a small NEGATIVE number - measured at -0.02 - never as exactly 0. Asserting equality
       here failed every half of this probe's first run against an unfixed game that was behaving
       correctly, which is the wrong reason for a probe to be red. */
    && t.lapse1.focusT <= 0 && t.lapse2.focusT <= 0              // the chain really was broken, by the game
    && t.chain.every(s => s.pri > 0)                             // every strike landed
    && t.chain[0].nb === 0 && t.chain[1].nb === 0 && t.chain[2].nb === 0
    && t.chain[3].nb > 0                                         // the FOURTH, and only the fourth
    && t.chain.every(s => s.far === 0)                           // and only within the reach
    && t.afterBreak.every(s => s.pri > 0 && s.nb === 0 && s.far === 0));   // a broken chain starts over

  const control = trial('mon_still');    // the a-side of the same rank
  const master  = trial('mon_master');
  const inert   = trial('mon_iron');     // known-bad: a dead monk id through the identical bar

  const quiet = (t) => !!(t && t.chain && t.chain.every(s => s.nb === 0 && s.far === 0)
                          && t.afterBreak.every(s => s.nb === 0 && s.far === 0));

  return JSON.stringify({
    ok: !!(bar(master) && quiet(control) && quiet(inert) && !threw),
    okAgainstInert: bar(inert),          // what this probe says against the shipped game — must be false
    base: BASE, near: NEAR, far: FAR,
    control: control, master: master, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
