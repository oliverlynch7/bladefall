/* DOES HARVESTED STRENGTH (THE PASSIVE) DO ANYTHING AT ALL?

   Reaper rank-3 option a (index.html:2082) reads: "Souls you collect are spent on your next skill,
   making it free." `harness/audit-passives.js` says the id `x_strength` appears exactly twice in the
   whole of public/ — in CLASS2 where it is defined and in PASSIVE_ART where its icon is named — and
   nowhere else. It is one of the 39 in docs/SKILL_TRIAGE.md section E.

   NOTHING HAS TO BE INVENTED, and both halves of the sentence are already defined by the game:
     - a SOUL is a KILL, in the file's own words. The Reaper's innate is "slain enemies restore 2
       mana" and its own Soul Armor card (r5 a) calls the identical event "collecting a kill".
       c2OnKill's reaper branch (10083) is where that event already lands, and its comment has said
       since the rewrite that this passive "now makes your next skill free".
     - FREE already means a mana cost of nothing: `m_glass` (Glass Cannon, "below a quarter health
       your skills are free") is the same word in the same game.

   THE CONTROL IS THE OTHER OPTION AT THE SAME RANK, `x_doom` (Lingering Doom), which is wired — it
   is read at 12866 — and works on marks, nowhere near the mana pool. So any difference between the
   halves is the passive under test.

   THREE TRIALS PER HALF, because the sentence has three parts:
     1. kill, then cast                → the cast costs nothing at all
     2. cast again, no new kill        → back to full price, because the card says "your NEXT skill"
     3. kill, empty the bar, then cast → it still fires, because "free" is not "cheaper": the pool
                                         is not checked. The control cannot cast here at all, which
                                         is the same assertion from the other side.
   A passive that merely discounted every cast would pass trial 1 and fail 2. One that zeroed the
   COST rather than skipping the payment would fail trial 3 in the other direction — and worse, it
   is the shape that stops a skill firing at all, because useSkill reads a zero from spendSkillMana
   as "the cast could not be paid for" (`if(!manaSpent) return`).

   Driven through the game's own systems throughout: the kill goes through `hitEnemy`, which is what
   calls `killEnemy` → `c2OnKill`, and the cast goes through `useSkill`. The probe never sets the
   flag the passive reads; doing so is the fault the harness plan's Task 5 records as passing forever
   against the very bug it existed to catch. Both halves assert the cast really happened, off the
   game's own cooldown moving, so a mana delta of zero can never be a cast that silently never was.

   No `update()` is ever run, so no game time passes and no mana regenerates between readings.

   Known-bad: watched to fail against the shipped game. */
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
  __BF3.meta.classId = 'reaper';

  /* The Arena hands out its own loadout, which is usually off-class, and useSkill passes
     classFamilyOk(p.weapon) into every handler. Equip through the game's own starter table. */
  let weaponNote = 'none';
  (function(){
    const tries = ['reaper'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('reaper');
  cs.ch = cs.ch || {};
  const SLOT = 0;                       // rank 2 is slot 0; cheatRank10All takes a-sides, so that is Reap
  const maxMana = () => p.maxMana || 100;

  /* A kill, through the game's own damage path — hitEnemy calls killEnemy, which calls c2OnKill. */
  const kill = () => {
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 90);
    if(!foe) return false;
    foe.active = true; foe.hp = foe.maxHp = 1; foe.immobile = true;
    try { __BF3.hitEnemy(foe, 9999, p, 0, 0, null); } catch(e){ return false; }
    return !!foe.dead;
  };

  const trial = (pick) => {
    cs.ch[3] = pick;
    G.enemies.length = 0;
    p.hp = __BF3.effMaxHp(p);
    p.dead = false; p.downed = false;
    p._soulFree = 0;                    // reset state, never armed by hand
    if(p.skillCd) p.skillCd[SLOT] = 0;

    const cost = __BF3.skillManaCost(SLOT);
    let threw = null;
    const cast = () => {
      if(p.skillCd) p.skillCd[SLOT] = 0;
      const before = p.mana;
      try { __BF3.useSkill(SLOT); } catch(e){ threw = threw || String(e && e.message || e); }
      return { fired: !!(p.skillCd && p.skillCd[SLOT] > 0), before: before, after: p.mana,
               spent: Math.round((before - p.mana) * 100) / 100 };
    };

    /* 1. a soul, then a cast. */
    p.mana = maxMana();
    const killed1 = kill();
    const first = cast();

    /* 2. the very next cast, with no new kill. */
    p.mana = maxMana();
    const second = cast();

    /* 3. a soul, an empty bar, then a cast. */
    const killed3 = kill();
    p.mana = 0;
    const third = cast();

    return { pick: pick, skill: (__BF3.c2CurSkills ? __BF3.c2CurSkills() : [])[SLOT]?.n,
             cost: cost, killed1: killed1, killed3: killed3,
             first: first, second: second, third: third, threw: threw };
  };

  const control  = trial('x_doom');
  const strength = trial('x_strength');

  const ok = !!(
    control.cost > 0 && strength.cost > 0 &&
    control.killed1 && control.killed3 && strength.killed1 && strength.killed3 &&
    !control.threw && !strength.threw &&
    /* the control pays full price every time, and cannot cast on an empty bar at all */
    control.first.fired  && control.first.spent  === control.cost &&
    control.second.fired && control.second.spent === control.cost &&
    !control.third.fired &&
    /* the passive: the cast after a kill is free... */
    strength.first.fired  && strength.first.spent  === 0 &&
    /* ...only the NEXT one... */
    strength.second.fired && strength.second.spent === strength.cost &&
    /* ...and free means free: it fires with nothing in the pool and takes nothing out of it. */
    strength.third.fired && strength.third.after === 0
  );

  return JSON.stringify({ ok: ok, control: control, strength: strength,
                          weapon: p.weapon && p.weapon.name, weaponNote: weaponNote });
})()
