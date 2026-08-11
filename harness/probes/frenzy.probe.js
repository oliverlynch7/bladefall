/* CAN A BERSERKER WHO PICKED FRENZY BE HURT AT ALL?

   `hurtPlayer` (index.html:11163) carries this line among the class damage-reduction block:

     if(meta.classId==='berserker'&&c2def('berserker')){ if(c2Passive('bsk_frenzy')){ ... v*=1+(1-fr); }}

   `v` is not declared anywhere in hurtPlayer. It is the attack-speed accumulator from effAtkSpeed
   (3754) and effPower (3740), where the same three lines are correct and wired - this is the copy
   that landed in the damage function. Reading an undeclared name throws a ReferenceError, so on
   this build every hit the player takes should abort hurtPlayer before `p.hp-=dmg` at 11226.

   That is read, and reading is not proof. This CASTS the state: it picks each of the two rank-7
   options in turn and calls the game's own hurtPlayer, and asks the only question that matters -
   did the health bar move.

   Why nothing has caught it: bsk_frenzy is rank 7 option **b**, and `cheatRank10All` fills every
   choice rank with the a-side, so the whole harness has only ever played the Rage half of that
   choice. Every other verdict in this file about the berserker was measured on a build that cannot
   reach this line.

   A/B IN ONE LAUNCH. The control is the other option at the SAME rank in the SAME game, so the only
   difference between the two halves is which passive is chosen.

   Known-bad: watched to fail against the shipped game - frenzy.threw a ReferenceError and dealt 0. */
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
  __BF3.meta.classId = 'berserker';

  /* On-class, through the game's own classStartWeapon(). docs/SKILL_TRIAGE.md section D: NO starter
     in the game lands in the berserker's great/axe/hammer family, so this ends on the anyClass
     override - recorded in weaponNote rather than hidden. */
  let weaponNote = 'none';
  (function(){
    const tries = ['berserker'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = (i === 0) ? 'own starter' : ('borrowed from ' + tries[i]); return; }
    }
    let w = null; try { w = __BF3.classStartWeapon('berserker'); } catch(e){}
    if(w){ w.anyClass = true; p.weapon = w; weaponNote = 'FORCED anyClass'; }
  })();

  G.enemies.length = 0;                       // nothing else may touch the health bar

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};

  const trial = (pid) => {
    cs.ch[7] = pid;
    /* Every early return in hurtPlayer that is NOT the bug has to be cleared, or a zero proves
       nothing: invuln and dodgeTimer return at 11193, downed at 11192, and the hub returns at 11191
       because the Waystation is a sanctuary. */
    p.invuln = 0; p.dodgeTimer = 0; p.downed = false; p.dead = false;
    p.shieldHp = 0; p.guardT = 0; p.bdParryT = 0; p._tarmT = 0; p._stillnessT = 0;
    p.hp = Math.round((p.maxHp || 100) * 0.8);
    const before = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(60, p.x, p.z + 120, null); } catch(e){ threw = String((e && e.message) || e); }
    return { pick: pid, hpBefore: before, hpAfter: p.hp, dealt: before - p.hp,
             hub: !!G.hub, threw: threw };
  };

  const rage    = trial('bsk_rage');           // the a-side of the same rank - the only build ever tested
  const frenzy  = trial('bsk_frenzy');

  return JSON.stringify({
    ok: rage.dealt > 0 && frenzy.dealt > 0 && !rage.threw && !frenzy.threw,
    rage: rage, frenzy: frenzy,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
    maxHp: Math.round(__BF3.effMaxHp(p)),
  });
})()
