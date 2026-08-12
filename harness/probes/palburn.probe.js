/* DOES BURNING LIGHT (THE PASSIVE) DO ANYTHING AT ALL?

   Paladin rank-5 option b (index.html:2096) reads: "Killing your Sworn target sets every enemy near
   it alight." `harness/audit-passives.js` says the id `pal_burn` appears exactly twice in the whole
   of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and
   nowhere else. It is one of the 36 in docs/SKILL_TRIAGE.md section E.

   NOTHING HERE IS INVENTED. "Alight" is the game's own Burn stack, applied through applyElement -
   the door every fire hit in the game already uses - and the radius is igniteBurn's combustion
   splash, verbatim (`<120+o.r` over G.enemies). The heat is the Sworn target's own `stDmg`, the
   representative hit applyStatus already records for exactly this purpose, so the fire that was
   consuming your target is what spreads.

   THE CARD HAS TWO CONDITIONS, NOT ONE, AND EACH GETS ITS OWN CONTROL INSIDE THE SAME HALF:
     "killing your SWORN target"  -> a kill that is NOT the oath must light nothing
     "every enemy NEAR it"        -> a foe outside the splash radius must not light either
   A wiring that lit on every kill, or lit the whole level, would satisfy a naive "the passive half
   differs from the control" bar and would be a worse bug than the dead passive. So every half puts
   TWO clusters in the world - one around the Sworn target, one around a foe that is deliberately not
   sworn - and kills both.

   THE OATH IS SWORN BY THE GAME, NOT BY THE PROBE. `p._oath` is set in `CLASS_BASIC.paladin`
   (index.html, the basic-attack hook) on the first non-designated hit of a fight, so the probe hits
   the intended target first with `hitEnemy` and then asserts `p._oath` really is that enemy. The
   second cluster's foe is hit the same way afterwards and must NOT take the oath - which is the
   game's own rule (the hook only swears while `!p._oath || p._oath.dead`) and is worth asserting,
   because if it did take the oath the second cluster would stop being a control.

   THE HIT CARRIES 'fire' because the spread reads the dying target's representative hit. That is not
   the probe standing in for the mechanism: a paladin's swing is what puts a representative hit on the
   thing it kills, and `applyStatus` is where the field is set for every damage path in the game.
   `sworn.stDmg` is reported so the number the burn scales off is visible rather than assumed.

   THE PROOF IS HEALTH LOST, NOT A STACK COUNT, and that distinction is the reason this probe exists
   in this shape. A burn stack that nothing can act on is a passive that reads as wired to the audit
   and burns nothing - so after both kills the probe steps the GAME'S OWN update() for two seconds
   (inside STWIN.burn's 2.5s grace, so no decay is being raced) and measures each foe's HP.

   THAT CLAUSE EARNED ITS PLACE ON THE FIRST RUN. The wiring's first version handed the spread to
   applyElement alone, whose buildup scales with the weapon's swing speed: the paladin's own Squire's
   Sword yields **0.95** of a stack, and statusTick's DoT is `Math.floor(st.burn) * stDmg * 0.055`.
   Measured, in this probe's own output: `lit.nearA 0.95`, `heat.nearA 1293`, `lost.nearA 0`. The
   neighbour was alight, the audit would have called the id wired, and it burned for exactly nothing.
   A stack-count bar would have passed it.

   THE BENCH DOES NOT EMPTY G.enemies. Two destinations in this game end a round when the enemy list
   drains - the Arena scores it, a campaign area calls areaClear/openWay - so a probe that clears the
   list can find itself measuring a different mode than the one it started in. Existing mobs are
   deactivated instead, which is what statusTick (12949) already gates on, and every foe the probe
   spawns is pinned with `speed = 0` so nothing walks out of its own cluster mid-measurement.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   picks `pal_blessed` - the paladin's other passive from section E, still dead - and feeds it to the
   identical bar. `okAgainstInert` is therefore what this probe would report against the shipped game,
   and it must be false while `ok` is true. (`c2Passive` scans ranks 3/5/7/9 for the id, index.html:
   9987, so which slot a dead id is written into does not change whether it reads as chosen - that is
   the function's own behaviour, checked rather than assumed.)

   The control is `pal_second`, the a-side of the same rank, which IS wired ("dropping below 35% HP
   heals you"). Stated rather than hidden: it cannot contaminate anything here because it acts on the
   PLAYER's health and the player is held at full HP, and every number measured is on an enemy. */
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
  __BF3.meta.classId = 'paladin';

  /* Equip through the game's own starter table: the game hard-blocks an off-class weapon (13220), so
     the bench should stand where the game would let you stand. */
  let weaponNote = 'none';
  (function(){
    const tries = ['paladin'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('paladin');
  cs.ch = cs.ch || {};

  const HIT     = 1000;   // large on purpose: the burn DoT scales off this, and hp is floored per tick
  const NEAR    = 60;     // inside igniteBurn's 120+r splash
  const FAR     = 600;    // comfortably outside it
  const APART   = 900;    // between the two clusters, so neither can reach into the other
  const TICKS   = 120;    // 2.0s at 1/60 - inside STWIN.burn's 2.5s grace, so decay is not being raced

  const spawn = (x, z) => {
    const e = __BF3.spawnEnemy('grunt', x, z);
    if(!e) return null;
    e.active = true; e.dropT = 0; e.speed = 0;      // statusTick (12949) runs only for active, awake mobs
    e.hp = e.maxHp = 100000;
    return e;
  };
  const burnOf = (e) => (e && e.st) ? Math.round((e.st.burn || 0) * 1000) / 1000 : 0;

  const trial = (pick, label) => {
    cs.ch[5] = pick;

    for(const e of G.enemies) e.active = false;     // deactivate, never empty - see the header
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;
    p._oath = null;

    const sworn  = spawn(p.x,         p.z - 300);
    const nearA  = spawn(p.x + NEAR,  p.z - 300);
    const farA   = spawn(p.x + FAR,   p.z - 300);
    const other  = spawn(p.x + APART, p.z - 300);          // killed, but never sworn
    const nearB  = spawn(p.x + APART + NEAR, p.z - 300);
    if(!sworn || !nearA || !farA || !other || !nearB) return { pick:pick, label:label, why:'a foe could not be spawned' };

    let threw = null;
    /* The oath goes to the first thing hit. The second hit must NOT take it - that is the game's own
       rule and it is what keeps cluster B a control. */
    G.combo = 0; G.comboT = 0;
    try { __BF3.hitEnemy(sworn, HIT, p, 0, 0, 'fire'); } catch(e){ threw = String(e && e.message || e); }
    const oathIsSworn = p._oath === sworn;
    G.combo = 0; G.comboT = 0;
    try { __BF3.hitEnemy(other, HIT, p, 0, 0, 'fire'); } catch(e){ threw = threw || String(e && e.message || e); }
    const oathHeld = p._oath === sworn;

    const litBeforeAnyKill = { nearA: burnOf(nearA), nearB: burnOf(nearB), farA: burnOf(farA) };

    /* The UNSWORN kill first, so anything it lights is visible before the sworn kill can explain it. */
    other.hp = 0;
    try { __BF3.killEnemy(other); } catch(e){ threw = threw || String(e && e.message || e); }
    const litByUnsworn = burnOf(nearB);

    sworn.hp = 0;
    try { __BF3.killEnemy(sworn); } catch(e){ threw = threw || String(e && e.message || e); }

    const lit = { nearA: burnOf(nearA), farA: burnOf(farA), nearB: burnOf(nearB) };
    const heat = { sworn: Math.round(sworn.stDmg || 0), nearA: Math.round(nearA.stDmg || 0) };

    /* Now let the game burn. Health, not stacks, is the promise. */
    const hp0 = { nearA: nearA.hp, farA: farA.hp, nearB: nearB.hp };
    for(let k = 0; k < TICKS; k++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); break; } }
    const lost = { nearA: hp0.nearA - nearA.hp, farA: hp0.farA - farA.hp, nearB: hp0.nearB - nearB.hp };

    return { pick:pick, label:label, threw:threw,
             oathIsSworn:oathIsSworn, oathHeld:oathHeld,
             litBeforeAnyKill:litBeforeAnyKill, litByUnsworn:litByUnsworn,
             lit:lit, heat:heat, lost:lost, mode:__BF3.mode };
  };

  /* THE BAR, applied to (control, candidate) so the same code can be run against a candidate KNOWN to
     be inert - see okAgainstInert below. */
  const bar = (c, b) => {
    if(!c || !b || c.why || b.why || c.threw || b.threw) return false;
    return c.mode === 'play' && b.mode === 'play'
        && c.oathIsSworn && c.oathHeld && b.oathIsSworn && b.oathHeld
        /* nothing is alight before a kill, in either half */
        && c.litBeforeAnyKill.nearA === 0 && c.litBeforeAnyKill.nearB === 0 && c.litBeforeAnyKill.farA === 0
        && b.litBeforeAnyKill.nearA === 0 && b.litBeforeAnyKill.nearB === 0 && b.litBeforeAnyKill.farA === 0
        /* an UNSWORN kill lights nothing, in either half - "killing your Sworn target" */
        && c.litByUnsworn === 0 && b.litByUnsworn === 0 && c.lit.nearB === 0 && b.lit.nearB === 0
        /* the control burns nothing at all, anywhere */
        && c.lit.nearA === 0 && c.lit.farA === 0
        && c.lost.nearA === 0 && c.lost.farA === 0 && c.lost.nearB === 0
        /* the passive lights the neighbour of the Sworn kill, and only it - "every enemy near it" */
        && b.lit.nearA >= 1 && b.lit.farA === 0
        && b.heat.sworn > 0 && b.heat.nearA > 0        // the heat carried across from the dying target
        /* and being alight costs health, which is the whole promise */
        && b.lost.nearA > 0 && b.lost.farA === 0 && b.lost.nearB === 0;
  };

  const control = trial('pal_second',  'control (the a-side of the same rank; wired, but only on the player)');
  const burn    = trial('pal_burn',    'burning light');
  const inert   = trial('pal_blessed', 'the paladin\'s other dead passive, fed to the bar as if it were the fix');

  return JSON.stringify({
    ok: bar(control, burn),
    /* The known-bad, measured rather than argued: against a game where nothing reads `pal_burn` the
       second half would look exactly like this one, and the bar must go red. */
    okAgainstInert: bar(control, inert),
    hit: HIT, ticks: TICKS, near: NEAR, far: FAR,
    control: control, burn: burn, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
