/* DOES TAKING A HIT AS A FRENZY BERSERKER THROW?

   index.html:11208, inside hurtPlayer:

     if(meta.classId==='berserker'&&c2def('berserker')){ if(c2Passive('bsk_frenzy')){
       const fr=...; v*=1+(1-fr); }}

   `v` does not exist in hurtPlayer. It is the accumulator from effPower / effAtkSpeed /
   effLifesteal, where the identical snippet appears three more times and is correct; `8054cf9`
   ("Passives batch three") pasted it into a fourth function whose local is `dmg`. The whole game is
   inside one `(function(){ "use strict"; … })()` (index.html:1019-1020), so reading an undeclared
   binding is a ReferenceError, not an implicit global — and the throw happens at 11208, twenty-one
   lines ABOVE `p.hp-=dmg` at 11229.

   So a Berserker who picks Frenzy at rank 7 takes no damage from anything and every incoming hit
   throws out of hurtPlayer into whatever was resolving that attack. This is not one of the 46 dead
   passives: `bsk_frenzy` is wired, in three places, and works in all three. It is the fourth paste.

   WHY NO SUITE HAS EVER SEEN IT: `cheatRank10All` fills each rank with the **a** option, and r7 a is
   `bsk_rage`. Frenzy is the b option, so the default rank-10 build every bench measures does not
   have it. Nothing else in the harness picks a b-side passive.

   THE BAR IS THE A/B. The same call is made twice in ONE launch against the same body, changing only
   the rank-7 choice — Rage (the sibling, which must keep working) against Frenzy. That separates
   "hurtPlayer is broken" from "this passive breaks hurtPlayer", which an absolute cannot. */
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
  if(G.hub) return JSON.stringify({ ok:false, why:'hurtPlayer returns early in the hub — wrong scene' });

  G.enemies.length = 0;                        // nothing else may hurt, heal or interrupt the body
  const ch = __BF3.c2ch('berserker');
  const maxHp = __BF3.effMaxHp(p);

  const trial = (pick) => {
    ch[7] = pick;
    /* Clear every gate between the top of hurtPlayer and line 11208: i-frames, the dodge window,
       an absorb pool that would swallow the hit, and the downed flag. */
    p.invuln = 0; p.dodgeTimer = 0; p.shieldHp = 0; p.shieldT = 0; p.guardT = 0;
    p.downed = false; p.dead = false;
    p.hp = Math.round(maxHp * 0.9);
    const before = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(30, p.x, p.z + 120, null); }
    catch(e){ threw = String((e && e.message) || e); }
    return { pick: pick, threw: threw, hpBefore: before, hpAfter: p.hp, took: before - p.hp };
  };

  /* Rage FIRST, so the control is taken on a body no Frenzy trial has touched. */
  const rage    = trial('bsk_rage');
  const frenzy  = trial('bsk_frenzy');

  return JSON.stringify({
    ok: !frenzy.threw && frenzy.took > 0 && !rage.threw && rage.took > 0,
    frenzyThrows: !!frenzy.threw,
    onlyFrenzy: !!frenzy.threw && !rage.threw,
    maxHp: Math.round(maxHp),
    withFrenzy: frenzy, withRage: rage,
  });
})()
