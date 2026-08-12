/* DOES ECHO DO ANYTHING AT ALL?

   Chronomancer rank-9 option a (index.html:2160) reads: "Your last skill fires again, by itself,
   three seconds later." `harness/audit-passives.js` says the id `chr_echo` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else, so nothing in the game ever consults it. It is one of the 33 in
   docs/SKILL_TRIAGE.md section E.

   NOTHING IS INVENTED. The mechanism is the MAGE's Echo of the Weave (useSkill 10499), which
   re-calls the same `fx` for a repeat cast; the delay is the card's own three seconds; the power is
   the skill's own `s.am`, unreduced, because unlike the mage's card ("a weaker echo", 0.35) this one
   only says it fires again.

   THE MEASUREMENT IS TWO WINDOWS ON ONE DUMMY, not a single total, and that is the whole design of
   this probe. The chronomancer's slot-0 skill is a ~2s stream of bolts, so "did more damage happen"
   is not a question a single number can answer - the original cast is still landing hits at 2s.
   Each trial therefore casts once, steps 2.5s and records what the cast did, then steps another 1.5s
   and records that window separately. The echo is due at 3.0s, so the FIRST window must be identical
   in every half (nothing has happened yet that differs) and only the SECOND may move.

   A/B IN ONE LAUNCH. The control is `chr_ward` (Time Ward), a WIRED chronomancer passive parked in
   the same rank slot: c2Passive (9987) is a plain id lookup over ranks 3/5/7/9, so what matters is
   which id sits there, not which rank it was authored for. A wired-but-irrelevant control says the
   second window's silence is the absence of an echo rather than the absence of a passive.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   puts `chr_freeze` - this rank's own b-side, and one of the 32 still dead - into the slot and feeds
   it to the identical bar. `okAgainstInert` is what this probe would report against the shipped
   game, and it must be false while `ok` is true.

   THE DUMMY IS UNKILLABLE AND INERT. A target that dies mid-window ends the stream early and would
   read as a missing echo; a target that fights back damages the player and can end the run. */
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
  __BF3.meta.classId = 'chronomancer';

  let weaponNote = 'none';
  (function(){
    const tries = ['chronomancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('chronomancer');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'chr_haste';        // wired, and about Rewind — no bearing on a bolt
  cs.ch[5] = 'chr_glass';
  cs.ch[7] = 'chr_temporal';

  const SLOT = 0;                // the class's rank-2 skill: always unlocked at rank 10, always damaging
  const skillName = (() => {
    try { const S = __BF3.c2CurSkills(); return S && S[SLOT] ? S[SLOT].n : null; } catch(e){ return null; }
  })();

  const step = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };

  const trial = (pick) => {
    cs.ch[9] = pick;

    G.enemies.length = 0;
    const dummy = __BF3.spawnEnemy('dummy', p.x, p.z - 110);
    if(!dummy) return { pick: pick, why: 'no dummy could be spawned' };
    dummy.dummy = true; dummy.active = true; dummy.hp = dummy.maxHp = 1000000;

    p.dead = false; p.downed = false; p.invuln = 0;
    p.hp = Math.round(__BF3.effMaxHp(p));
    p.mana = p.manam || p.maxMana || 999;
    if(p.skillCd) p.skillCd[SLOT] = 0;
    p._echo = null;                       // no echo may survive from the previous trial
    p.yaw = 0;                            // facing the dummy, which sits due -z

    const hp0 = dummy.hp;
    let threw = null;
    try { __BF3.useSkill(SLOT); } catch(e){ threw = String(e && e.message || e); }
    /* READ AT THE MOMENT OF THE CAST. The first version of this probe read it at the end and got
       `onCd:false` in all three halves, because Time Bolt's cooldown is 2s and the trial steps 4s -
       the same fault sub-project B Task 1 Step 1 records as fault 3, made again in a new place. A
       cooldown is evidence that the cast happened, and it is only evidence while it is still running. */
    const onCd = !!(p.skillCd && p.skillCd[SLOT] > 0);

    /* Window one: everything the cast itself does, including its whole stream. The echo is not due
       until 3.0s, so this must come out the same in every half. */
    step(150);
    const hp1 = dummy.hp;
    const armed = !!p._echo;              // reported, never asserted on — the bar is the damage
    /* Window two: 2.5s -> 5.0s. Wide enough to hold the whole of an echo due at 3.0s, so the two
       windows can be compared for POWER and not merely for presence. */
    step(150);
    const hp2 = dummy.hp;

    return { pick: pick, threw: threw, armed: armed,
             cast: Math.round(hp0 - hp1), window2: Math.round(hp1 - hp2), onCd: onCd };
  };

  const control = trial('chr_ward');      // wired, and nothing to do with repeating a skill
  const echo    = trial('chr_echo');
  const inert   = trial('chr_freeze');    // still dead — the permanent known-bad

  const clean = (h) => !h.threw && h.cast > 0 && h.onCd;
  const allClean = [control, echo, inert].every(clean);

  /* The bar:
     - every half's cast landed and went on cooldown, or nothing below means anything
     - the FIRST window is the same everywhere: the echo has not fired yet, so nothing may differ
     - the SECOND window is silent without the passive and loud with it
     - and it is loud by exactly the cast's own amount: "fires again" is the whole card, so an echo
       at reduced power would be the MAGE's card (0.35) rather than this one */
  const firstWindowAgrees = control.cast === echo.cast && control.cast === inert.cast;
  const controlHeld = control.window2 === 0 && inert.window2 === 0;
  const bar = (h) => h.window2 === h.cast && h.cast > 0;

  return JSON.stringify({
    ok: !!(allClean && firstWindowAgrees && controlHeld && bar(echo)),
    okAgainstInert: !!(allClean && firstWindowAgrees && control.window2 === 0 && bar(inert)),
    allClean: allClean, firstWindowAgrees: firstWindowAgrees, controlHeld: controlHeld,
    skill: skillName, slot: SLOT,
    control: control, echo: echo, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
