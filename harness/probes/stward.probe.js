/* DOES STORM WARD GRANT A SHIELD?

   Stormcaller r5 b — "Storm Ward: Casting a skill grants a shield equal to 4% max HP."
   docs/SKILL_TRIAGE.md section E: `st_ward` is one of 46 passives that are offered, described, and
   then never consulted by any code. It has three working siblings with the SAME sentence, so
   nothing about this needs a number invented:

     mage      m_ward    "Casting a skill grants a shield equal to 4% max HP."  index.html:10404
     warlock   war_shield same sentence, same 4%                                index.html:10412
     skylancer sky_guard  same shape at 6%, gated on being airborne             index.html:10417

   THE BAR IS THE A/B, NOT THE ABSOLUTE. Asking only "is there a shield after the cast" would pass
   against any other source of protection in the room, and the stormcaller's own rank-10 tier and
   several skills could supply one. So the SAME sequence is cast twice in ONE launch, the only
   difference being which rank-5 option is chosen — Momentum (the sibling option, which promises no
   shield) against Storm Ward. A fix that works must separate the two; a fix that merely gives
   everyone a shield cannot.

   Known-bad: this probe has been watched to fail. Against the unfixed game both trials report
   shield 0 and `sameEitherWay:true` — the passive changes nothing at all. */
(function(){
  const G = __BF3.G, p = G.p;

  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "the cast did nothing" for every trial. Knock on the game's own
     resume door — the same idiom test-skills.js and headlong.probe.js use. */
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

  /* EQUIP ON-CLASS. useSkill calls fx(p, classFamilyOk(p.weapon), am) and a great many handlers gate
     their defining half on that argument; the arena hands out a sword, which is off-class for a
     stormcaller. Eleven of sixteen classes were measured in that state once and the suite called the
     result a bug (docs/SKILL_TRIAGE.md, bench fault 1). */
  let weaponNote = 'none';
  (function(){
    const tries = ['stormcaller'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w; weaponNote = (i === 0) ? 'own starter' : ('borrowed from ' + tries[i]); return;
      }
    }
  })();

  G.enemies.length = 0;                       // nothing in the room to shield, stun or heal anybody

  const ch = __BF3.c2ch('stormcaller');
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];

  /* Cast by fx id, never by slot, so a rank retune cannot silently repoint the trial at another
     skill. Chain Bolt is the stormcaller's rank-2 slot-0 skill and is in every default build. */
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'st_bolt'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'st_bolt is not in the rank-10 build',
                                      casts: skills.map(s => s && s.fx) });

  const maxHp = __BF3.effMaxHp(p);
  const expect = Math.round(maxHp * 0.04);

  const trial = (pick) => {
    ch[5] = pick;
    /* Clear every protection the previous trial could have left standing, and top the resources up
       so the cast cannot be refused for a reason that has nothing to do with the passive. */
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0;
    p.hp = Math.round(maxHp * 0.5);
    p.mana = p.maxMana || 999;
    if(p.skillCd) p.skillCd[idx] = 0;
    const before = p.shieldHp || 0;
    let threw = null;
    try { __BF3.useSkill(idx); } catch(e){ threw = String((e && e.message) || e); }
    /* Read the cooldown AT THE MOMENT OF CASTING. useSkill's guards return without spending one, so
       onCd false means the cast never happened and the trial measured nothing. */
    const onCd = !!(p.skillCd && p.skillCd[idx] > 0);
    /* Read the shield NOW too: the grant sets shieldT=3 and the pool decays, so a window would only
       add a way for a real grant to disappear before it was counted. */
    return { pick: pick, passiveOn: __BF3.c2ch('stormcaller')[5] === pick,
             before: before, shield: p.shieldHp || 0, shieldT: Math.round((p.shieldT || 0) * 100) / 100,
             onCd: onCd, threw: threw };
  };

  const off = trial('st_momentum');       // the sibling rank-5 option — promises speed, not a shield
  const on  = trial('st_ward');           // the passive under test

  const cast = off.onCd && on.onCd && !off.threw && !on.threw;
  return JSON.stringify({
    ok: cast && on.shield >= expect && off.shield === 0,
    cast: cast,
    sameEitherWay: off.shield === on.shield,
    expectedShield: expect, maxHp: Math.round(maxHp),
    withWard: on, withoutWard: off,
    weapon: { name: p.weapon && p.weapon.name, art: p.weapon && p.weapon.art, note: weaponNote },
    castSkill: skills[idx] && skills[idx].n,
  });
})()
