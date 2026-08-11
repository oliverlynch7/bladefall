/* DOES STORM WARD DO ANYTHING AT ALL?

   Stormcaller rank-5 option B, `st_ward`: "Casting a skill grants a shield equal to 4% max HP."
   docs/SKILL_TRIAGE.md section E found it in the dead 46 — offered, described, and never read by
   any line of code. This measures it rather than grepping for it.

   THE BAR IS THE GAME'S OWN, NOT ONE THIS PROBE INVENTED. Three classes already ship that exact
   sentence and that exact implementation inside useSkill's CLASS2 branch — mage `m_ward`, warlock
   `war_shield`, skylancer `sky_guard`, each
   `p.shieldHp=Math.max(p.shieldHp||0,Math.round(effMaxHp(p)*.04)); p.shieldT=3`. So the assertion
   is not "some shield appeared", it is "the Stormcaller gets the SAME shield the Warlock gets off
   the same promise", which needs no exported effMaxHp and no number chosen here.

   Three trials in ONE launch, because comparing across launches compares two different games:

     A  stormcaller, rank-5 = st_momentum   the passive NOT taken. Must stay 0 — a fix that shields
                                            every Stormcaller regardless of choice is not this passive.
     B  stormcaller, rank-5 = st_ward       the subject.
     C  warlock,     rank-3 = war_shield    THE KNOWN-GOOD, carried permanently. If C comes back 0
                                            the bench is broken and B's verdict means nothing —
                                            without it, a probe that cannot see any shield at all
                                            reports the game as broken with total confidence.

   Watched to fail: against the unfixed game B is `shield 0, shieldT 0` while C grants its full
   4%, which is the dead passive stated in numbers.

   Warlock rank 3 is set to war_shield rather than left on the cheat's default `war_frail`
   (+15% damage, -10% max HP) on purpose: frail power would shrink the warlock's effMaxHp by a
   tenth and the two 4% shields would no longer be comparable. */
(function(){
  const G = __BF3.G, p = G.p;

  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "cast did nothing" for every skill. Knock on the game's own resume
     door — the idiom test-skills.js and headlong.probe.js already use. */
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

  /* One cast of slot 0, from a cleared body, reporting what protection it left behind.
     Slot 0 is found through c2CurSkills — the list useSkill actually casts from — so a rank
     retune cannot silently repoint this at a different skill. */
  function castOnce(cls, rank, pick){
    __BF3.meta.classId = cls;
    const cs = __BF3.classState(cls);
    cs.ch = cs.ch || {};
    cs.ch[rank] = pick;
    const casts = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || [];
    const s = casts[0];
    p.shieldHp = 0; p.shieldT = 0;
    p.mana = p.maxMana || 999;
    if(p.skillCd) p.skillCd[0] = 0;
    p.dead = false; p.downed = false;
    const hpBefore = p.hp;
    try { __BF3.useSkill(0); } catch(e){ return { cls, pick, threw: String(e && e.message || e) }; }
    return {
      cls: cls, pick: pick, slot0: s ? s.fx : null,
      shield: Math.round(p.shieldHp || 0), shieldT: Math.round((p.shieldT || 0) * 100) / 100,
      onCd: !!(p.skillCd && p.skillCd[0] > 0),
      hpAfter: Math.round(p.hp), hpBefore: Math.round(hpBefore),
    };
  }

  const A = castOnce('stormcaller', 5, 'st_momentum');
  const B = castOnce('stormcaller', 5, 'st_ward');
  const C = castOnce('warlock',     3, 'war_shield');

  /* The verdicts, in the order they have to be read. benchOk first: a bench that cannot observe a
     shield the game definitely grants has no standing to accuse one it does not. */
  const benchOk   = C.shield > 0;
  const notTaken  = A.shield === 0;
  const granted   = B.shield > 0;
  const sameAsWar = B.shield === C.shield;
  const holds     = B.shieldT >= 2.5;

  return JSON.stringify({
    ok: benchOk && notTaken && granted && sameAsWar && holds,
    benchOk: benchOk, shieldWhenNotTaken: A.shield, granted: granted,
    matchesWarlock: sameAsWar, shieldT: B.shieldT,
    trials: { A_noPassive: A, B_stormWard: B, C_warlockKnownGood: C },
  });
})()
