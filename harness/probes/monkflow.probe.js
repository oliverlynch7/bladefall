/* DOES FLOW (THE PASSIVE) DO ANYTHING AT ALL?

   Monk rank-5 option a (index.html:2168) reads: "Each hit shortens your dodge twice as much."
   `harness/audit-passives.js` says the id `mon_flow` appears exactly twice in the whole of public/ —
   in CLASS2 where it is defined and in PASSIVE_ART where its icon is named — and nowhere else. It is
   one of the 43 in docs/SKILL_TRIAGE.md section E.

   THIS IS THE CHEAPEST HONEST ROW IN THE SECTION, because the thing it doubles already exists and is
   already a number in the file. The monk's own innate — `CLASS_BASIC.monk` (11103), whose comment is
   also headed FLOW — does `p.dodgeCdT -= 0.35` on every connecting hit. "Twice as much" is therefore
   0.70, derived from the game's own constant rather than chosen: nothing here is a balance decision
   and there is no number to put to Oliver.

   Driven through the game's own hit path, not around it: `hitEnemy` calls
   `CLASS_BASIC[meta.classId](p, e, dmg)` when the source is the player (10670), so calling hitEnemy
   is what exercises the hook. A probe that called the hook itself would be measuring its own copy.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, and the assertion is
   the RATIO the card states — flow must cut exactly twice what the control cuts. An absolute
   expectation would go stale the day the innate's 0.35 is retuned; the ratio is what the sentence
   promises.

   Known-bad: watched to fail against the shipped game — both halves cut the same 0.35. */
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
  __BF3.meta.classId = 'monk';

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

  const START = 5;

  const trial = (pick) => {
    cs.ch[5] = pick;
    G.enemies.length = 0;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 70);
    if(!foe) return { pick: pick, why: 'no target could be spawned' };
    foe.active = true; foe.hp = foe.maxHp = 100000;
    p.dodgeCdT = START;
    let threw = null;
    /* ONE hit, through hitEnemy, which is where the innate hook is dispatched from. */
    try { __BF3.hitEnemy(foe, 10, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const left = p.dodgeCdT || 0;
    return { pick: pick, left: Math.round(left * 1000) / 1000,
             cut: Math.round((START - left) * 1000) / 1000, threw: threw };
  };

  const control = trial('mon_focused');      // the b-side of the same rank: wired, and nothing to do with dodge
  const flow    = trial('mon_flow');
  const ratio   = control.cut ? flow.cut / control.cut : null;

  return JSON.stringify({
    ok: control.cut > 0 && flow.cut > 0
        && ratio != null && Math.abs(ratio - 2) < 0.001
        && !control.threw && !flow.threw,
    start: START, control: control, flow: flow,
    ratio: ratio == null ? null : Math.round(ratio * 1000) / 1000,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
