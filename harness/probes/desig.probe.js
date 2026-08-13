/* WHICH DOOR IS `hitEnemy(e, dmg, p, …)`? THE BASIC ATTACK'S, OR EVERY HIT THE PLAYER LANDS?

   This probe exists to settle the assumption the whole of the section Z sweep rests on
   (docs/SKILL_TRIAGE.md), and it was written because reading the source gave the WRONG answer first.

   The CLASS_BASIC dispatch (index.html:10930) is `src===G.p && !(G&&G._desig)`. Sixteen probes in
   harness/probes drive an effect by calling `hitEnemy(tgt, 60, p, 0, 0, null)` with `G._desig` held
   false, and section Z's verdicts all turn on one claim: that this call is the BASIC ATTACK's door
   and no other. If instead it were "any hit the player lands", then every direct-hit SKILL would run
   the hook too — and CLASS_BASIC.mage spends 6 mana and returns ×1.35 PER BODY, so a Nova into four
   enemies would quietly cost 24 mana on top of its own price and pay 35% more damage than its card
   says. That is a large, unadvertised economy, and it is exactly what a run reading only line 10930
   would conclude: skill handlers call `hitEnemy(e, dmg, p, …)` in that very shape (10411, 10318,
   10333 and thirty more).

   THE ANSWER IS IN `useSkill`, NOT IN `hitEnemy`, WHICH IS WHY READING ONE SIDE GOT IT WRONG.
   useSkill sets `G._desig = true` at 10649, calls the handler, and clears it at 10659 — so for the
   whole synchronous life of a cast the dispatch's own guard is false. The hook is correctly
   basic-attack-only. But `_desig` is a FRAME flag on `G`, not a property of the hit, so this is a
   claim about ORDER: it holds because a direct-hit skill resolves inside that window. A skill that
   resolves LATER — a projectile — lands with `_desig` already false, which is the hazard section U3
   records from the other side.

   THE BAR IS PER-HIT SCALING, and it needs no cross-launch comparison and no number from a card:
   a skill's own mana cost is charged once per CAST, so anything that scales with the number of
   BODIES STRUCK by one cast is the hook. Two casts of the same skill, same rank, same weapon, same
   launch — one with a single body in range, one with four:

     - through the BASIC door, four hits must cost four times one hit (6 each, CLASS_BASIC.mage);
     - through the SKILL door, four bodies must cost exactly what one body cost.

   Both halves must show real damage on every body, or a zero is just a cast that missed. The mage is
   the class for this because its hook's cost is a plain integer on a resource the probe can read
   exactly; the warlock's is 3% of max HP and would need rounding to be argued about. */
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
  __BF3.meta.classId = 'mage';

  /* Off-class casting was fault 1 of this sub-project's bench repairs: a great many handlers gate
     their defining half on `classFamilyOk(p.weapon)`, so a borrowed sword changes numbers for a
     reason that has nothing to do with the question. */
  let weaponNote = 'none';
  (function(){
    const tries = ['mage'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  /* THE PLAY-MODE RECEIPT. A probe that keeps calling update() into a stopped world collects a full
     run's worth of plausible zeroes — update() returns at its third line unless mode is 'play', and
     `__BF3.mode` is a getter with no setter, so nothing here could put it back. Counted and
     reported beside the ticks asked for. */
  let asked = 0, ran = 0, leftPlayAt = null;
  const tick = (n) => {
    for(let k = 0; k < n; k++){
      asked++;
      if(__BF3.mode === 'play'){ ran++; } else if(leftPlayAt === null){ leftPlayAt = asked; }
      __BF3.update(1/60);
    }
  };

  /* Bodies in a tight cluster ahead of the player, well inside any AoE radius in the file (the
     widest skill ring here is 230). `n` of them, all immortal and still, so the only thing that
     changes between trials is HOW MANY are standing there. */
  const stage = (n) => {
    G.enemies.length = 0;
    const out = [];
    for(let i = 0; i < n; i++){
      const e = __BF3.spawnEnemy('grunt', p.x + (i - (n - 1) / 2) * 30, p.z - 70);
      if(!e) return null;
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0; e.hp = e.maxHp = 100000; e.stunT = 0;
      out.push(e);
    }
    tick(2);                       // let the spawn settle without letting anyone move
    return out;
  };

  /* THE MANA POOL IS THE GAME'S OWN, TOPPED UP BY REGEN, AND THE SPEND IS READ WITH NO TICK IN
     BETWEEN. Both halves of that are corrections to this probe's first run, and both produced
     numbers that looked like data:
       - `p.mana = 100000` does not survive a frame. The game clamps the pool to its maximum, so the
         trailing tick turned every reading into ~99933 "spent" — a figure with no relation to
         anything, arrived at identically by four different trials.
       - the mage's rank-10 rider refunds half the cost on every THIRD cast (index.html:10650), so
         two casts of one skill are not comparable unless they sit at the same place in that cycle.
         `_mageCasts` is pinned to 0 before each measured cast, which puts every one of them on
         cast 1 of 3 and refunds none of them. */
  const spent = (fn, n) => {
    const bodies = stage(n);
    if(!bodies) return { why:'bodies could not be spawned' };
    tick(300);                     // five seconds of the game's own regen: fill the pool legally
    p._mageCasts = 0;              // every measured cast is cast 1 of the rank-10 refund's 3
    const manaBefore = p.mana;
    const before = bodies.map(e => e.hp);
    let threw = null;
    try { fn(bodies); } catch(e){ threw = String(e && e.message || e); }
    const manaSpent = Math.round(manaBefore - p.mana);   // read synchronously: no tick may intervene
    const lost = bodies.map((e, i) => Math.round(before[i] - e.hp));
    return {
      threw: threw,
      manaBefore: Math.round(manaBefore),
      manaSpent: manaSpent,
      hit: lost.filter(v => v > 0).length,
      lost: lost,
    };
  };

  /* THE BASIC DOOR, transcribed: `_desig` false, src `p`. This is resolveSwing's own call shape
     (index.html:9807) and it is the shape all sixteen section Z probes use. */
  const basic = (bodies) => {
    G._desig = false;
    for(const e of bodies) __BF3.hitEnemy(e, 60, p, 0, 0, null);
  };

  /* THE SKILL DOOR: the game's own cast entry point, cooldown gate included. Nothing is called by
     hand inside it — useSkill sets and clears `_desig` itself, which is the thing under test. */
  const cast = (i) => (bodies) => { p.skillCd[i] = 0; __BF3.useSkill(i); };

  /* WHICH skill is found rather than named, because a card's index is not a promise: the kit is
     re-picked by rank and this probe must not care which slot the AoE landed in. The first index
     that strikes at least three of four bodies in one cast is the one used. */
  let aoe = -1, scan = [];
  for(let i = 0; i < 4; i++){
    const r = spent(cast(i), 4);
    scan.push({ i: i, hit: r.hit, manaSpent: r.manaSpent, threw: r.threw });
    if(aoe < 0 && r.hit >= 3) aoe = i;
  }

  const basic1 = spent(basic, 1);
  const basic4 = spent(basic, 4);
  const skill1 = aoe < 0 ? null : spent(cast(aoe), 1);
  const skill4 = aoe < 0 ? null : spent(cast(aoe), 4);

  /* A half is readable only if the blow landed on every body it was aimed at, the world was running
     the whole time, and the pool was deep enough to pay for the hits — CLASS_BASIC.mage returns
     WITHOUT charging when mana is short (index.html:11542), so an empty bar reads exactly like a
     hook that did not fire. */
  const clean = !!(basic1 && basic4 && skill1 && skill4
                && !basic1.threw && !basic4.threw && !skill1.threw && !skill4.threw
                && basic1.hit === 1 && basic4.hit === 4
                && skill1.hit === 1 && skill4.hit >= 3
                && ran === asked
                && basic4.manaBefore >= basic1.manaSpent * 4);

  /* CLASS_BASIC.mage's own cost (index.html:11541): 6, or 12 with Potent Weave. Read here rather
     than assumed, so a bench that happened to pick the passive still reports a true multiple. */
  const perHit = basic1 ? basic1.manaSpent : null;

  return JSON.stringify({
    ok: !!(clean
        /* the basic door charges PER BODY */
        && perHit > 0 && basic4.manaSpent === perHit * 4
        /* the skill door does not: four bodies cost exactly what one body cost */
        && skill4.manaSpent === skill1.manaSpent),
    /* What this probe would report if the dispatch were "any hit the player lands" — the reading
       that a run looking only at index.html:10930 comes away with. It must be false while ok is
       true, or the two hypotheses are not being told apart. */
    okIfSkillsFiredTheHookToo: !!(clean && skill4.manaSpent === skill1.manaSpent + perHit * 3),
    clean: clean,
    aoeSkill: aoe, perHitBasicCost: perHit,
    basicScales: !!(perHit > 0 && basic4 && basic4.manaSpent === perHit * 4),
    skillFlat: !!(skill1 && skill4 && skill4.manaSpent === skill1.manaSpent),
    basic1: basic1, basic4: basic4, skill1: skill1, skill4: skill4,
    scan: scan,
    /* Potent Weave is not read through `c2Passive` — it is not on `__BF3` (measured: the first run
       of this probe died on exactly that). It does not need to be: the hook's cost IS the tell,
       6 without the passive and 12 with it (index.html:11541), and `perHitBasicCost` is measured. */
    potentWeave: perHit === 12,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
    playTicks: ran + ' of ' + asked, leftPlayAt: leftPlayAt,
    mode: __BF3.mode,
  });
})()
