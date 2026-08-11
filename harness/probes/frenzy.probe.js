/* CAN A BERSERKER WHO PICKED FRENZY BE HURT AT ALL?

   `hurtPlayer` (index.html:11205) carries this line:

     if(meta.classId==='berserker'&&c2def('berserker')){ if(c2Passive('bsk_frenzy')){ … v*=1+(1-fr); }}

   **There is no `v` in `hurtPlayer`.** The clause is a copy of the one in `effAtkSpeed`, where `v`
   is the attack speed being built up; here the local is `dmg`. Everything below line 1019 is inside
   one `"use strict"` IIFE, so assigning to an undeclared name is a ReferenceError, not a new global
   — and it is thrown BEFORE `p.hp-=dmg` at 11226. A Berserker who takes the rank-7 B option
   therefore cannot be damaged, staggered or killed by anything that routes through `hurtPlayer`.

   Frenzy is rank 7 option **B**, and `cheatRank10All` fills every choice rank with option **A**.
   That is why nothing has ever caught this: the whole skill bench, every balance run and every
   harness pass plays the Berserker with `bsk_rage` and never once picks the option that breaks it.

   Two trials in ONE launch, identical but for the rank-7 choice:

     A  bsk_frenzy   the subject. Must take damage and must not throw.
     B  bsk_rage     the other rank-7 option, carried permanently as the control. It shares every
                     line of this path except the broken clause, so if B also fails to take damage
                     the fault is the bench (invuln, a hub, a dodge window) and not the passive.

   Watched to fail: against the unfixed game A comes back `threw: "v is not defined"` with hp
   unchanged, while B loses health normally. */
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
  if(!__BF3.hurtPlayer) return JSON.stringify({ ok:false, why:'hurtPlayer is not exported — cannot drive the damage path' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();

  function trial(pick){
    __BF3.meta.classId = 'berserker';
    const cs = __BF3.classState('berserker');
    cs.ch = cs.ch || {};
    cs.ch[7] = pick;

    /* Clear every gate hurtPlayer returns on before it reaches the clause under test, so a miss
       here can only be the clause. Half health also puts Frenzy in its interesting range — the
       formula it copied scales with how far the health has fallen. */
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0; p.guardT = 0; p.shieldHp = 0; p.reflectT = 0;
    p._tarmT = 0; p.bdParryT = 0;
    p.hp = Math.max(20, Math.round((p.maxHp || 100) * 0.5));

    const hpBefore = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(25, p.x, p.z + 60, null); }
    catch(e){ threw = String((e && e.message) || e); }
    const hpAfter = p.hp;

    return {
      pick: pick, threw: threw,
      hpBefore: Math.round(hpBefore), hpAfter: Math.round(hpAfter),
      took: Math.round(hpBefore - hpAfter), invulnAfter: Math.round((p.invuln || 0) * 100) / 100,
    };
  }

  const A = trial('bsk_frenzy');
  const B = trial('bsk_rage');

  const controlTookDamage = B.took > 0 && !B.threw;
  const frenzyDidNotThrow = !A.threw;
  const frenzyTookDamage  = A.took > 0;

  return JSON.stringify({
    ok: controlTookDamage && frenzyDidNotThrow && frenzyTookDamage,
    controlTookDamage: controlTookDamage,
    frenzyDidNotThrow: frenzyDidNotThrow,
    frenzyTookDamage: frenzyTookDamage,
    trials: { A_frenzy: A, B_control: B },
  });
})()
