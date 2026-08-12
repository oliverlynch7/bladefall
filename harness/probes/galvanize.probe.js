/* DOES A CHAIN WITH NOWHERE TO GO COME BACK?

   Stormcaller rank-9 option b (index.html:2184) reads: "Chains that find no second target strike the
   first one twice." `st_galvanize` is one of docs/SKILL_TRIAGE.md section E's dead passives, filed
   under the same stale blocker as Overcharge and Charged — "there is no chain in the game" — when the
   chain is `CLASS_BASIC.stormcaller` (index.html:11315) and has been since 96cd511 on 2026-08-03.

   NO NUMBER IS CHOSEN HERE AT ALL, which is what makes this row takeable: the second strike is the
   arc that failed, so it carries the arc's own 34% and the arc's own shock element. The card says
   twice, not harder.

   TWO TRIALS PER HALF, because "chains that find NO second target" is a condition and not a
   description. The lone trial has one body in the room and is the card. The company trial puts a
   second body 80 units away, so the chain does find somewhere to go — and the first body must then
   take exactly what it takes in every other half. A wiring that struck twice whichever way would
   satisfy a lone-trial bar and would be a flatly better card: +34% on every basic attack.

   THE BAR IS THE TARGET'S OWN HP, not a hit count. The extra strike lands on the body that was just
   hit, so the only honest evidence is how much more it lost — and it must be the arc's share rather
   than a second full hit, which is the difference between the card and a damage doubler.

   A/B IN ONE LAUNCH between the two options at the SAME rank. `st_master` (Static Master) is the
   control: the a-side of this very rank, and dead. PERMANENT KNOWN-BAD: a third half runs `mon_iron`,
   a still-dead passive of another class, so `okAgainstInert` is what this probe would report against
   the unfixed game and must be false while `ok` is true. */
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

  const cs = __BF3.classState('stormcaller');
  cs.ch = cs.ch || {};
  /* RANK 9, NOT 10: Storm Lord's third clause (pass 40) adds an arc. It cannot change this bar —
     the lone trial has nobody to arc to and the pair trial has exactly one candidate — but the
     capstone is not what this row is about, so it is held off the bench rather than reasoned around. */
  cs.rank = 9;
  cs.ch[3] = 'st_conductor';   // dead: one arc, so "no second target" means an empty room
  cs.ch[5] = 'st_ward';        // wired, and a shield on cast: it cannot reach an enemy
  cs.ch[7] = 'st_amped';       // dead today (per-jump damage ramp); NOT st_charged, whose doubled
                               // reach would change which bodies count as company

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };

  /* One trial. `company` decides whether there is anywhere for the chain to go — the condition on
     the card. Everything goes through the game's own door: `hitEnemy` with `G._desig` false is what
     a basic swing calls (index.html:10921), so the hook is entered the way the game enters it. */
  const trial = (company) => {
    G.enemies.length = 0;
    const tgt  = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
    const mate = company ? __BF3.spawnEnemy('grunt', p.x + 80, p.z - 240) : null;
    const all = company ? [tgt, mate] : [tgt];
    if(all.some(e => !e)) return { company: company, why:'bodies could not be spawned' };
    for(const e of all){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0; e.hp = e.maxHp = 100000; e.stunT = 0;
    }
    tick(2);

    const h0 = tgt.hp, m0 = mate ? mate.hp : 0;
    let threw = null;
    G._desig = false;
    try { __BF3.hitEnemy(tgt, 60, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }

    return {
      company: company, threw: threw,
      tgtLost: Math.round(h0 - tgt.hp),
      mateLost: mate ? Math.round(m0 - mate.hp) : null,
      /* Reported, not asserted: the re-entry guard. A second strike on the body you just hit is the
         one shape that could recurse, so a clean 0 here is evidence `_chaining` still holds. */
      chaining: p._chaining || 0,
      others: (G.enemies || []).length,
    };
  };

  const half = (pick) => { cs.ch[9] = pick; return { pick: pick, lone: trial(false), pair: trial(true) }; };

  const control   = half('st_master');    // a-side of the same rank: dead, and returns nothing
  const galvanize = half('st_galvanize');
  const inert     = half('mon_iron');     // an id nothing reads - the permanent known-bad

  /* A half is readable only if both swings landed and the geometry held: the lone trial really was
     alone, and the pair trial really did have company inside the arc's reach. */
  const clean = (h) => !h.lone.threw && !h.pair.threw && h.lone.tgtLost > 0 && h.pair.tgtLost > 0
                    && h.lone.others === 1 && h.pair.others === 2 && h.pair.mateLost > 0;
  const allClean = [control, galvanize, inert].every(clean);

  /* The base hit is what a target takes when the chain has somewhere else to go, read from the
     controls rather than restated: every half's pair trial must agree on it, and the lone trial of a
     half without the passive must agree with it too. */
  const base = control.pair.tgtLost;
  /* Measured on the before-run rather than guessed: the base hit climbs a point per half across a
     launch (67, 68, 69), so the tolerance has to cover that drift. It is nowhere near the 23 the
     card is worth, so widening it costs the bar nothing. */
  const near = (a, b) => Math.abs(a - b) <= 3;

  /* WHAT AN ARC IS WORTH IS MEASURED, NOT COMPUTED, and the first run of this probe got that wrong.
     The bar was `round(base * 0.34)` — the constant in the hook — and the fixed game failed it by
     four points (27 against 23). The hook hands 34% to `hitEnemy`, which then runs it through the
     same player multipliers the original swing went through, so what an arc actually LANDS is 27.
     The card says the first body is struck twice, so the honest yardstick is the arc it replaced:
     the mate's loss in this half's own pair trial, measured in the same launch. */
  const arcWorth = galvanize.pair.mateLost;
  const extra = galvanize.lone.tgtLost - base;
  const bar = (h) => {
    const ex = h.lone.tgtLost - base;
    return ex > 0 && Math.abs(ex - h.pair.mateLost) <= 3
        && near(h.pair.tgtLost, base) && h.pair.mateLost > 0;
  };
  /* What every other half must still do: alone is the same as in company — no return strike. */
  const flat = (h) => near(h.lone.tgtLost, base) && near(h.pair.tgtLost, base);

  return JSON.stringify({
    ok: !!(allClean && bar(galvanize) && flat(control) && flat(inert)),
    okAgainstInert: !!(allClean && bar(inert)),
    allClean: allClean, base: base, extra: extra, wantExtra: arcWorth,
    controlFlat: flat(control), inertFlat: flat(inert),
    control: control, galvanize: galvanize, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
