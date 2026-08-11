/* DOES STORM WARD DO ANYTHING AT ALL?

   Stormcaller rank-5 option b (index.html:2180) reads: "Casting a skill grants a shield equal to 4%
   max HP." `harness/audit-passives.js` says the id `st_ward` appears exactly twice in the whole of
   public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and nowhere
   else, so nothing in the game ever consults it. It is one of the 46 in docs/SKILL_TRIAGE.md
   section E.

   The audit is STATIC and proves WIRED, not CORRECT. This is the other half: it casts a real skill
   with the passive chosen and reads the player's own shield pool back. Three classes already carry
   the identical sentence and the identical implementation - mage `m_ward` (10404), warlock
   `war_shield` (10412), skylancer `sky_guard` at 6% (10417) - so nothing here is an invented number.

   A/B IN ONE LAUNCH, which is the only shape that means anything. The comparison is between the two
   options at the SAME rank in the SAME game: `st_momentum` (the a-side, wired, and nothing to do
   with shields) must leave the pool at zero, and `st_ward` must fill it. Two separate runs could
   differ for any reason at all; one run differing only in which passive is picked cannot.

   Known-bad: watched to fail against the shipped game - ward.shield 0, exactly as the control. */
(function(){
  const G = __BF3.G, p = G.p;

  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "cast did nothing" for every skill. Knock on the game's own resume
     door - the same idiom test-skills.js and headlong.probe.js use. */
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

  /* On-class, through the game's own classStartWeapon(). The shield does not read `ok`, but the
     Arena's sword makes every cast an off-class cast, which is a state the game hard-blocks
     (index.html:13220) and is not what any of this should be measured in. */
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

  /* Read from the list useSkill CASTS from (c2CurSkills), never from curSkills() - the two lists
     disagree at the same index, and that mismatch invalidated every verdict test-skills.js had ever
     produced before faf52c3. Found by fx id, so a rank retune cannot silently repoint it. */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'st_bolt'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'st_bolt is not in the rank-10 build', casts:skills.map(s=>s&&s.fx) });

  G.enemies.length = 0;                      // nothing to hit back, and nothing else to shield you
  const cs = __BF3.classState('stormcaller');
  cs.ch = cs.ch || {};

  const trial = (pid) => {
    cs.ch[5] = pid;
    p.shieldHp = 0; p.shieldT = 0;
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    p.mana = p.maxMana || 999;
    if(p.skillCd) p.skillCd[idx] = 0;
    let threw = null;
    try { __BF3.useSkill(idx); } catch(e){ threw = String(e && e.message || e); }
    /* Read with NO ticks between cast and read: shieldT decays, and a tick loop here would be a
       second thing that could explain a zero. */
    return { pick: pid, shield: Math.round(p.shieldHp || 0),
             shieldT: Math.round((p.shieldT || 0) * 100) / 100,
             onCd: !!(p.skillCd && p.skillCd[idx] > 0), threw: threw };
  };

  const control = trial('st_momentum');      // the a-side of the same rank: wired, and not a shield
  const ward    = trial('st_ward');
  const want    = Math.round(__BF3.effMaxHp(p) * 0.04);

  return JSON.stringify({
    ok: control.shield === 0 && ward.shield === want && want > 0 && control.onCd && ward.onCd,
    want: want, control: control, ward: ward,
    cast: skills[idx] && skills[idx].n, weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
    maxHp: Math.round(__BF3.effMaxHp(p)),
  });
})()
