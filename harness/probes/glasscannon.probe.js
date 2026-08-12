/* DOES GLASS CANNON DO WHAT IT SAYS, OR DOES IT STOP YOUR SKILLS FIRING?

   Mage rank-5 option a (index.html:2072) reads: "Below a quarter health your skills cost no mana at
   all." Unlike the 46 in docs/SKILL_TRIAGE.md section E this passive IS wired - `m_glass` is read
   twice, at 10334 (the cost) and 11289 (you take 8% more damage) - so `harness/audit-passives.js`
   cannot see it either way, and neither can `test-skills.js`, which never picks a rank-5 b-side or
   drops the player below a quarter health.

   THE LEAD, read from the source and measured HERE for the first time: `skillManaCost` returns 0
   when the passive is active, and `useSkill` reads what `spendSkillMana` hands back as
   "did the cast get paid for" - `if(!manaSpent) return`. Zero is the value that means BOTH
   "this cost nothing" and "you could not afford it". If that is what happens, the Mage's skills go
   dead exactly when the passive is supposed to be carrying them, which is worse than the passive
   doing nothing at all.

   THE CONTROL IS THE OTHER OPTION AT THE SAME RANK, `m_ward` (Arcane Ward), which is wired and puts
   a shield up on a cast - nowhere near the mana pool or the cooldown.

   TWO TRIALS PER HALF, because the promise is conditional:
     1. below a quarter health  → the cast must FIRE and must cost nothing
     2. at full health          → the cast must fire and must cost full price, in both halves,
                                  because a fix that made every cast free would be a worse bug
   `fired` is read off the game's own cooldown, so a mana delta of zero can never be a cast that
   silently never happened - which is the whole question here.

   THE CAPSTONE HAD TO BE STEERED AROUND, and saying so matters: the Mage's rank-10 Archmage refunds
   half the mana of every THIRD skill (useSkill, `p._mageCasts%3===0`), and `cheatRank10All` gives
   rank 10. The counter is reset before every cast so that no measured cast is a third one; without
   it two of the four readings here would be half price for a reason that has nothing to do with the
   passive under test.

   No `update()` is ever run, so no game time passes and no mana regenerates between readings. */
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

  const cs = __BF3.classState('mage');
  cs.ch = cs.ch || {};
  const SLOT = 0;                        // rank 2 is slot 0; cheatRank10All takes a-sides, so that is Elemental Bolt

  const trial = (pick) => {
    cs.ch[5] = pick;
    G.enemies.length = 0;
    p.dead = false; p.downed = false;

    const maxHp = __BF3.effMaxHp(p), maxMana = p.maxMana || 100;
    const cast = (hp) => {
      p.hp = hp;
      p.mana = maxMana;
      p._mageCasts = 0;                  // never let a measured cast be the capstone's third
      if(p.skillCd) p.skillCd[SLOT] = 0;
      const cost = __BF3.skillManaCost(SLOT), before = p.mana;
      let threw = null;
      try { __BF3.useSkill(SLOT); } catch(e){ threw = String(e && e.message || e); }
      return { hp: Math.round(hp), cost: cost, fired: !!(p.skillCd && p.skillCd[SLOT] > 0),
               spent: Math.round((before - p.mana) * 100) / 100, threw: threw };
    };

    const low  = cast(Math.max(1, Math.round(maxHp * 0.10)));    // below a quarter
    const full = cast(maxHp);
    return { pick: pick, skill: (__BF3.c2CurSkills ? __BF3.c2CurSkills() : [])[SLOT]?.n,
             maxHp: Math.round(maxHp), low: low, full: full };
  };

  const control = trial('m_ward');
  const glass   = trial('m_glass');

  const ok = !!(
    !control.low.threw && !control.full.threw && !glass.low.threw && !glass.full.threw &&
    /* the control pays full price at any health, and always fires */
    control.low.fired  && control.low.spent  === control.low.cost  && control.low.cost > 0 &&
    control.full.fired && control.full.spent === control.full.cost && control.full.cost > 0 &&
    /* the passive: below a quarter the skill FIRES and costs nothing... */
    glass.low.cost === 0 && glass.low.fired && glass.low.spent === 0 &&
    /* ...and above it, nothing has been made free by accident */
    glass.full.fired && glass.full.cost > 0 && glass.full.spent === glass.full.cost
  );

  return JSON.stringify({ ok: ok, control: control, glass: glass,
                          weapon: p.weapon && p.weapon.name, weaponNote: weaponNote });
})()
