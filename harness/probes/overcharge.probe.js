/* DOES OVERCHARGE ARC TO A THIRD ENEMY?

   Stormcaller rank-3 option b (index.html:2178) reads: "Your lightning arcs to a third enemy as well
   as a second." `st_overcharge` is one of docs/SKILL_TRIAGE.md section E's dead passives - offered,
   described, and read by nothing.

   THE REASON IT WAS FILED AS BLOCKED IS STALE, AND THAT IS THE FINDING BEHIND THIS PROBE.
   Section E says of this passive and five of its siblings: "There is no chain in the game." That was
   established by grepping the SKILL table - `SKILL_FX.st_bolt` is the mage's single projectile - and
   it missed the place the chain actually lives. `CLASS_BASIC.stormcaller` (index.html:11315) IS a
   lightning chain: every basic attack finds the nearest other body within 260 units and hits it for
   34% of the damage, with a `_chaining` re-entry guard and its own `skillRing`. It shipped
   2026-08-03 in `96cd511`, days BEFORE the triage entry that says it does not exist.

   So nothing has to be invented and nothing has to be designed. The mechanism is there, the number
   is the card's own ("a third enemy as well as a second" = two arcs rather than one), and the arc's
   damage, radius, element and ring are the hook's own.

   THE BAR IS "HOW MANY DISTINCT BODIES LOST HP TO ONE SWING", not "the passive is read". Four
   neighbours stand at four different distances from the target and only the two nearest may be
   struck: a wiring that arced to everything in range would satisfy a count-only bar and would be a
   different, much stronger card. The far foe at 900 units must never be touched in any half, which
   is what keeps 260 a radius.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. `st_conductor`
   (Conductor) is the control: the a-side of this very rank, and dead - so a control half reproduces
   the shipped single arc exactly.

   PERMANENT KNOWN-BAD, carried here rather than produced by breaking the repo: a third half puts
   `mon_iron` - a still-dead passive belonging to another class - in the same slot. `c2Passive` is a
   plain id lookup over ranks 3/5/7/9, so any id nothing reads reproduces the state the shipped game
   was in. `okAgainstInert` is what this probe would report against the unfixed game, and it must be
   false while `ok` is true.

   The other three choice ranks are pinned identically in every half, so they cannot explain a
   difference between halves. Two of them (`st_charged`, `st_master`) are themselves dead today and
   are named here so that a later pass which wires them knows this probe assumes they are inert. */
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

  /* Off-class casting was fault 1 of this sub-project's bench repairs. The chain hook itself does
     not read `classFamilyOk`, but the damage that feeds it does, and a borrowed sword would change
     every number below for a reason that has nothing to do with the passive. */
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

  const cs = __BF3.classState('stormcaller');
  cs.ch = cs.ch || {};
  cs.ch[5] = 'st_ward';        // wired, and a shield on cast: it cannot reach an enemy
  /* Was `st_charged` until 2026-08-12, when pass 38 wired it and it began DOUBLING the jump
     distance this probe's geometry is built around. Moved to the b-side of the same rank, which is
     still dead — the swap this file's header asked the wiring pass to make. */
  cs.ch[7] = 'st_amped';       // dead today (per-jump damage ramp) - see the header
  cs.ch[9] = 'st_master';      // dead today (stun on a chained body) - see the header

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };
  const dist = (a, b) => Math.round(Math.hypot(a.x - b.x, a.z - b.z));

  /* One trial: one basic hit on the target, and a head-count of who else lost HP.

     Everything goes through the game's own door. `hitEnemy` with `G._desig` false is exactly what a
     basic swing calls (index.html:10921), so the hook under test is entered the way the game enters
     it - the probe never calls CLASS_BASIC itself. A real swing was rejected for this bar: the
     stormcaller's starter is a magic weapon whose basic attack is a travelling projectile, so a
     swing measures aim and flight time as much as it measures the chain. */
  const trial = () => {
    G.enemies.length = 0;
    const tgt = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
    /* Four neighbours at four distances from the TARGET: 80, 140, 200 (all inside the hook's 260)
       and 900 (well outside it). The order matters - "a third enemy as well as a second" is the two
       NEAREST, so n3 is the body that separates a correct wiring from an everything-in-range one. */
    const n1  = __BF3.spawnEnemy('grunt', p.x +  80, p.z - 240);
    const n2  = __BF3.spawnEnemy('grunt', p.x + 140, p.z - 240);
    const n3  = __BF3.spawnEnemy('grunt', p.x + 200, p.z - 240);
    const far = __BF3.spawnEnemy('grunt', p.x + 900, p.z - 240);
    const all = [tgt, n1, n2, n3, far];
    if(all.some(e => !e)) return { why:'bodies could not be spawned' };
    for(const e of all){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0;                                  // hold the geometry still; "near" is a distance
      e.hp = e.maxHp = 100000;                      // nothing under test may die and change the set
      e.stunT = 0;
    }
    tick(2);                                        // let the spawn settle without letting anyone move

    const before = all.map(e => e.hp);
    let threw = null;
    G._desig = false;
    try { __BF3.hitEnemy(tgt, 60, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const lost = all.map((e, i) => Math.round(before[i] - e.hp));

    return {
      threw: threw,
      tgtLost: lost[0], n1Lost: lost[1], n2Lost: lost[2], n3Lost: lost[3], farLost: lost[4],
      /* The head-count the card is about: bodies OTHER than the one you hit that lost HP. */
      arcs: [lost[1], lost[2], lost[3], lost[4]].filter(v => v > 0).length,
      d1: dist(n1, tgt), d2: dist(n2, tgt), d3: dist(n3, tgt), dFar: dist(far, tgt),
      /* Reported, not asserted: the re-entry guard. If an arc re-entered the hook the count above
         would climb on its own, so a clean run is also evidence `_chaining` still holds. */
      chaining: p._chaining || 0,
    };
  };

  const half = (pick) => { cs.ch[3] = pick; return { pick: pick, t: trial() }; };

  const control = half('st_conductor');   // a-side of the same rank: dead, and chains nobody
  const over    = half('st_overcharge');
  const inert   = half('mon_iron');       // an id nothing reads - the permanent known-bad

  /* A half is readable only if the swing landed at all and the geometry is what it claims. */
  const clean = (h) => !h.t.threw && h.t.tgtLost > 0
                    && h.t.d1 < 260 && h.t.d2 < 260 && h.t.d3 < 260 && h.t.dFar > 260
                    && h.t.d1 < h.t.d2 && h.t.d2 < h.t.d3;
  const allClean = [control, over, inert].every(clean);

  /* The bar, one clause per clause of the card:
     - TWO other bodies are struck, not one and not four
     - they are the two NEAREST (n1 and n2), which is "a third enemy as well as a second"
     - n3 and the far foe are untouched, so 260 is still a radius and the arc still stops */
  const bar = (h) => h.t.arcs === 2 && h.t.n1Lost > 0 && h.t.n2Lost > 0
                  && h.t.n3Lost === 0 && h.t.farLost === 0;
  /* The shipped chain, which every half must still do: exactly one arc, to the nearest body. */
  const single = (h) => h.t.arcs === 1 && h.t.n1Lost > 0 && h.t.farLost === 0;

  return JSON.stringify({
    ok: !!(allClean && bar(over) && single(control) && single(inert)),
    okAgainstInert: !!(allClean && bar(inert)),
    allClean: allClean,
    controlSingle: single(control), inertSingle: single(inert),
    control: control, over: over, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
