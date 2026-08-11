/* DOES STORM WARD DO ANYTHING AT ALL?

   Stormcaller rank-5 option B (index.html CLASS2, `st_ward`): "Casting a skill grants a shield equal
   to 4% max HP." It is one of the 46 passives `harness/audit-passives.js` found that are offered,
   described, and then never consulted by any line of game code (docs/SKILL_TRIAGE.md section E) —
   the id appears exactly twice in the whole repo, in CLASS2 and in the PASSIVE_ART icon table.

   The audit is STATIC and proves WIRED, not CORRECT: it would go green the moment the id is
   mentioned anywhere, including by a line that mentions it and does the wrong thing. This probe
   asks the behavioural question instead — cast a skill and see whether a shield appears — and it
   carries its own known-bad rather than needing the repo broken to produce one.

   THE KNOWN-BAD IS THE CONTROL ARM, and it is the reason this is believable. The same skill is cast
   twice in one launch, changing only which rank-5 passive is chosen: `st_ward` (option B) must grant
   a shield, and `st_momentum` (option A, the attack/move-speed passive, already wired at 3754/3755)
   must not. Both arms failing is the unfixed game; both arms passing would mean something else in
   the cast grants shields and this measures nothing. Against the unfixed game it reports
   ward.shield 0 — watched, before the fix went in.

   One launch, not two, on purpose: a shield is 4% of effMaxHp, and effMaxHp moves with the level
   and gear the Arena happens to hand out. Comparing an arm from one game against an arm from
   another compares two different bodies. */
(function(){
  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "cast did nothing" for every arm. Knock on the game's own resume
     door — the same idiom test-skills.js and headlong.probe.js use. */
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
  const G = __BF3.G, p = G.p;

  /* Equip on-class through the game's own classStartWeapon(), for the reason test-skills.js
     documents at length: the Arena hands out a sword, `useSkill` passes classFamilyOk(p.weapon)
     into every handler, and eleven of sixteen classes were once measured casting off-class. Storm
     Ward itself does not read `ok`, but the CAST has to be a cast a player could actually make. */
  let weaponNote = 'none';
  (function(){
    const tries = ['stormcaller'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = i === 0 ? 'own starter' : 'borrowed from ' + tries[i]; return; }
    }
  })();

  /* Cast from the list useSkill CASTS from, and find the skill by its fx id rather than by slot, so
     a rank retune cannot silently repoint this at a different skill (the two-list trap, faf52c3). */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'st_bolt'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'st_bolt is not in the rank-10 build', casts:skills.map(s => s && s.fx) });

  const ch = __BF3.c2ch('stormcaller');
  G.enemies.length = 0;                                  // nothing to hurt the player mid-measurement

  const arm = (pid) => {
    ch[5] = pid;                                         // the rank-5 choice, the only thing that differs
    p.shieldHp = 0; p.shieldT = 0;
    p.mana = 99999;
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    if(p.skillCd) p.skillCd[idx] = 0;
    let threw = null;
    try { __BF3.useSkill(idx); } catch(e){ threw = String(e && e.message || e); }
    return { passive: pid, chose: ch[5], shield: Math.round(p.shieldHp || 0),
             shieldT: Math.round((p.shieldT || 0) * 100) / 100,
             onCd: !!(p.skillCd && p.skillCd[idx] > 0), threw: threw };
  };

  const ward = arm('st_ward');
  const ctrl = arm('st_momentum');
  const maxHp = Math.round(__BF3.effMaxHp(p));
  const want = Math.round(maxHp * 0.04);

  return JSON.stringify({
    /* The bar: the skill fired in BOTH arms (or nothing below means anything), the ward arm gained a
       shield of the size its own card names, and the control arm gained none. */
    ok: !!(ward.onCd && ctrl.onCd && ward.shield > 0 && ctrl.shield === 0 && ward.shield === want),
    fired: !!(ward.onCd && ctrl.onCd),
    want: want, maxHp: maxHp, skill: skills[idx] && skills[idx].n, weapon: weaponNote,
    ward: ward, control: ctrl,
  });
})()
