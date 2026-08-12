/* DOES BONE LEGION MAKE *YOUR MINIONS* HIT HARDER, OR ONLY THE SKELETONS FROM ONE SKILL?

   The card, CLASS2.necromancer r3 a (index.html:2106):

     Bone Legion — "Summon one extra skeleton and your minions hit 20% harder."

   `c2Passive('necro_legion')` is read in exactly ONE place in the whole file - SKILL_FX.necro_summon
   (11784), where it turns 3 skeletons into 4 and their damage coefficient from 0.65 into 0.85. The
   necromancer's two OTHER minion skills never mention it:

     - `necro_raise`  (r4 a, Raise the Dead)     - a risen fighter at base*1.4, and a corpseless
                                                   fallback of two at base*0.7. No legion, and no
                                                   necro_master either.
     - `necro_army`   (r8 a, Army of the Dead)   - six minions at base*0.9, scaled by necro_master
                                                   and by nothing else.

   So a Minions-build necromancer takes the rank-3 passive that says "your minions hit 20% harder"
   and then, at rank 4 and rank 8, raises minions it does not touch. The passive audit calls
   `necro_legion` WIRED, because the id is mentioned - the same blind spot section H's Unseen and
   section N's Combo Edge sat in. This is that shape again: a promise honoured on one of the three
   paths it is written about.

   NOTHING IS INVENTED. 1.2 is the card's own "20% harder", verbatim, and it is applied to the two
   minion sources the card's own words cover. What is NOT touched is necro_summon's 0.85/0.65, which
   is +30.8% rather than +20% - a number that disagrees with the same card and is therefore a balance
   call, recorded in docs/SKILL_TRIAGE.md for Oliver rather than quietly retuned here.

   THE BAR IS THE MINION'S OWN `dmg` FIELD, which is what spawnMinion (11743) stores and what
   minionUpdate hits with - not a damage roll against a dummy. That is deliberate: this sub-project
   has twice been burned measuring something downstream of the promise (pass 15 lit the right enemy
   and burned nothing), and here the promise IS the number the minion carries. It is also fully
   deterministic - `dmg` has no RNG in it - so a ratio of exactly 1.2 means exactly the card.

   THREE HALVES IN ONE LAUNCH, differing only in the rank-3 PICK:
     - `control` - necro_wither at r3. The other option at the same rank, so the only difference
                   between halves is the choice under test.
     - `live`    - necro_legion at r3. The promise.
     - `live2`   - the identical live half a second time. Costs nothing and rules out a lucky cast.

   FOUR TRIALS PER HALF, one per minion source the card covers plus one that must move in EVERY
   version of the game:
     - `summon`   - Summon Skeletons. Legion is wired here already, so this is the BENCH LIVENESS
                    check: if this ratio does not move, the probe is not choosing the passive at all
                    and every zero below would be meaningless.
     - `raise`    - Raise the Dead onto a corpse left by the game's own death path. The promise.
     - `fallback` - Raise the Dead with NO corpse, which spawns two weaker minions. Still minions,
                    still covered by the card's own words.
     - `army`     - Army of the Dead. The promise, at the rank a minions necromancer is built for.

   THE KNOWN-BAD IS TRANSCRIBED, not produced by breaking the repo, for pass 28's reason: the shipped
   game applies legion in necro_summon and nowhere else, so under it the live half's raise/fallback/
   army numbers ARE the control half's numbers. `okAgainstShipped` feeds exactly that to the identical
   bar and MUST be false while `ok` is true. The before-run is the other half of the proof and is the
   real measurement: this probe was watched to fail against the unfixed game first.

   EVERY OTHER PASSIVE RANK IS PINNED, and r9 matters most: `necro_master` multiplies minion damage by
   1.25 in two of the three skills under test, so leaving it to the game's default would have put a
   second, larger multiplier inside the measurement. */
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
  __BF3.meta.camMode = 'far';

  /* Through the game's own classStartWeapon: useSkill hands every handler classFamilyOk(p.weapon),
     and these three multiply by OFFCLASS_MUL when it is false - which would scale both halves and
     hide nothing, but would make the numbers unreadable. */
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

  const cs = __BF3.classState('necromancer');
  cs.ch = cs.ch || {};
  /* The three minion skills under test, and the passive ranks pinned away from anything that also
     scales a minion. r9 is necro_pest and NOT necro_master for the reason in the header. */
  cs.ch[2] = 'necro_summon';
  cs.ch[4] = 'necro_raise';
  cs.ch[6] = 'necro_wall';
  cs.ch[8] = 'necro_army';
  cs.ch[5] = 'necro_plague';
  cs.ch[7] = 'necro_harvest';
  cs.ch[9] = 'necro_pest';

  /* THE TWO-LIST CHECK, inside the probe rather than in a command nobody re-runs (faf52c3): useSkill
     casts c2CurSkills()[i], which is not curSkills()[i]. If these three slots are not the three
     skills named above, the whole measurement is about some other skill. */
  const SUMMON = 0, RAISE = 1, ARMY = 3;
  const casts = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : []).map(s => s && s.n);
  const castsRight = /summon/i.test(String(casts[SUMMON] || ''))
                  && /raise/i.test(String(casts[RAISE] || ''))
                  && /army/i.test(String(casts[ARMY] || ''));

  const HOME = { x: p.x, z: p.z };

  const cast = (slot) => {
    G.minions = G.minions || []; G.minions.length = 0;
    p.x = HOME.x; p.z = HOME.z; p.vx = 0; p.vz = 0;
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) p.skillCd[slot] = 0;
    let threw = null;
    try { __BF3.useSkill(slot); } catch(e){ threw = String(e && e.message || e); }
    const m = G.minions || [];
    return { n: m.length, dmg: m.length ? m[m.length - 1].dmg : 0, threw: threw };
  };

  /* A corpse from the game's own death path (11024, t:3.5), never one this probe pushed - so
     `raise` really is measuring the branch a player reaches. */
  const makeCorpse = () => {
    G.corpses = [];
    G.enemies.length = 0;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z + 60);
    if(!foe) return 'no target could be spawned';
    foe.active = true; foe.dead = false; foe.hp = foe.maxHp = 40; foe.vx = 0; foe.vz = 0;
    G._desig = false;
    try { __BF3.hitEnemy(foe, foe.hp + 9999, p, 0, 0, null); } catch(e){ return String(e && e.message || e); }
    return (G.corpses || []).length === 1 ? null : 'the death path left no corpse';
  };

  const half = (pick) => {
    cs.ch[3] = pick;
    p.hp = p.hpm || p.hpMax || p.hp;

    const summon = cast(SUMMON);

    const corpseErr = makeCorpse();
    const raise = cast(RAISE);

    G.corpses = [];
    const fallback = cast(RAISE);

    const army = cast(ARMY);

    return { pick: pick, corpseErr: corpseErr,
             summon: summon, raise: raise, fallback: fallback, army: army };
  };

  const control = half('necro_wither');
  const live    = half('necro_legion');
  const live2   = half('necro_legion');

  const threw = (h) => [h.summon, h.raise, h.fallback, h.army].some(t => t.threw) || h.corpseErr;
  const allClean = castsRight
                && [control, live, live2].every(h => !threw(h))
                /* the raise trial must really have consumed a corpse: one risen fighter, not the
                   corpseless fallback's two. The game's own discriminator (11788/11790). */
                && [control, live, live2].every(h => h.raise.n === 1 && h.fallback.n === 2)
                && [control, live, live2].every(h => h.army.n === 6 && h.summon.dmg > 0);

  const ratio = (a, b) => (b ? a / b : 0);
  /* THE BAR IS ROUNDING-AWARE, and it had to be: `dmg` is stored through Math.round, so the ratio of
     two stored numbers is not the ratio the code applied. Measured, first after-run: raise 25 → 30 is
     exactly 1.2, but the corpseless fallback's 12 → 15 reads as 1.25 and the army's 16 → 19 as
     1.1875, and a flat ±0.02 on the ratio failed a fix that is provably correct. So the bar asks the
     only question the stored integers can answer: is the live value what rounding 1.2× an unrounded
     control in [C-0.5, C+0.5) could have produced? A shipped value of L === C is outside that
     interval for every C >= 3, which is what keeps the known-bad red. */
  const scaled = (L, C, k) => L >= Math.round(k * (C - 0.5)) && L <= Math.round(k * (C + 0.5));

  /* Legion adds a skeleton as well as damage, and it is already wired in necro_summon, so this must
     hold in the shipped game too - it is what says the pick reached the game at all. */
  const liveness = (h) => h.summon.n === control.summon.n + 1
                       && ratio(h.summon.dmg, control.summon.dmg) > 1.2;

  const bar = (r) => scaled(r.raise,    control.raise.dmg,    1.2)
                  && scaled(r.fallback, control.fallback.dmg, 1.2)
                  && scaled(r.army,     control.army.dmg,     1.2);

  const measured = (h) => ({ raise: h.raise.dmg, fallback: h.fallback.dmg, army: h.army.dmg });
  /* THE TRANSCRIBED KNOWN-BAD: under the shipped game legion is read only by necro_summon, so these
     three numbers in the live half would be the control's own. Fed to the identical bar. */
  const shipped = measured(control);

  const ratios = (h) => ({
    summon:   +ratio(h.summon.dmg,   control.summon.dmg).toFixed(4),
    raise:    +ratio(h.raise.dmg,    control.raise.dmg).toFixed(4),
    fallback: +ratio(h.fallback.dmg, control.fallback.dmg).toFixed(4),
    army:     +ratio(h.army.dmg,     control.army.dmg).toFixed(4),
  });

  return JSON.stringify({
    ok: !!(allClean && liveness(live) && liveness(live2) && bar(measured(live)) && bar(measured(live2))),
    okAgainstShipped: !!(allClean && bar(shipped)),
    allClean: allClean, castsRight: castsRight, casts: casts,
    ratios: { live: ratios(live), live2: ratios(live2), control: ratios(control) },
    control: control, live: live, live2: live2,
    weapon: (p.weapon || {}).name, weaponNote: weaponNote,
  });
})()
