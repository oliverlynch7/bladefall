/* CAN A BERSERKER WHO PICKED FRENZY BE HURT AT ALL?

   `hurtPlayer` (index.html ~11162) carries a berserker clause among its damage multipliers:

     if(meta.classId==='berserker'&&c2def('berserker')){ if(c2Passive('bsk_frenzy')){ … v*=1+(1-fr); }}

   `v` is not declared in `hurtPlayer`. It is the local of `effAtkSpeed` (3754), where the identical
   clause belongs and works; this is that line pasted into a function that has no such variable. The
   file is strict mode (1022), so `v *= …` on an undeclared name is a ReferenceError — thrown BEFORE
   `p.hp -= dmg` at 11225, and before the shield, the reflect and the second-wind hooks under it.

   So the question is not "does Frenzy give the right number" but "does anything happen when a
   Frenzy berserker is hit". This probe asks the game, because the answer depends on whether the
   caller swallows the throw, and reading cannot tell you that.

   WHY NOTHING HAD CAUGHT IT. `cheatRank10All` fills every rank choice with option **a**, and Frenzy
   is rank 7 option **b** (Rage is a). Every bench in this harness therefore plays path A, and this
   line is unreachable on path A. It is one choice away for any real player, exactly like the six
   path-B skills in docs/SKILL_TRIAGE.md section A that the same blind spot hid.

   THE CONTROL ARM IS THE SIBLING, `bsk_rage`, and it is the right control here for the reason
   Storm Ward's was: it is a different rank-7 choice that this line does not read, so it exercises
   the whole of `hurtPlayer` except the clause under test. Both arms take the same hit from the same
   body at the same HP. Against the unfixed game the Rage arm loses HP and the Frenzy arm does not —
   watched, before anything was edited. */
(function(){
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
  __BF3.meta.classId = 'berserker';
  const G = __BF3.G, p = G.p;
  const ch = __BF3.c2ch('berserker');

  /* A real attacker, because hurtPlayer's `by` is read by Stillness, the death screen and the oath.
     Kept far enough away that its own AI cannot land a second hit inside the measurement. */
  G.enemies.length = 0;
  const foe = __BF3.spawnEnemy('grunt', p.x + 400, p.z);
  if(foe){ foe.active = true; foe.dropT = 0; foe.maxHp = 1e6; foe.hp = 1e6; }

  const HIT = 40;

  const arm = (label, pid) => {
    ch[7] = pid;
    /* The same body every time: half health (so Frenzy's own fraction is well away from both ends),
       no lingering grace, no shield, no brace. p.invuln and p.dodgeTimer are hurtPlayer's first
       guard and would return before anything under test. */
    p.hp = Math.round((p.maxHp || 100) * 0.5);
    p.invuln = 0; p.dodgeTimer = 0; p.shieldHp = 0; p.shieldT = 0;
    p.guardT = 0; p.reflectT = 0; p._stillnessT = 0; p._tarmT = 0;
    const hp0 = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(HIT, p.x + 400, p.z, foe); } catch(e){ threw = String((e && e.name || '') + ': ' + (e && e.message || e)); }
    return { label, chose: ch[7], hp0: Math.round(hp0), hp1: Math.round(p.hp),
             took: Math.round(hp0 - p.hp), threw: threw };
  };

  const frenzy = arm('bsk_frenzy — "attack speed rises as your health falls"', 'bsk_frenzy');
  const rage   = arm('bsk_rage (control) — the other rank-7 choice', 'bsk_rage');

  return JSON.stringify({
    /* THE BAR: both arms take real damage and neither throws. The control arm is what says the rig
       can land a hit at all — a Frenzy arm that "takes damage" in a launch where the control took
       none would be measuring a guard, not the fix. */
    ok: !!(frenzy.took > 0 && rage.took > 0 && !frenzy.threw && !rage.threw),
    hit: HIT, maxHp: Math.round(__BF3.effMaxHp(p)), foe: !!foe,
    frenzy: frenzy, control: rage,
  });
})()
