/* DOES BOUNCE BACK DO ANYTHING AT ALL?

   Paladin rank-7 option a (index.html:2098) reads: "Damage you block is returned to whoever dealt
   it." `harness/audit-passives.js` says the id `pal_bounce` appears exactly twice in the whole of
   public/ — in CLASS2 where it is defined and in PASSIVE_ART where its icon is named — and nowhere
   else, so nothing in the game ever consults it. It is one of the 44 in docs/SKILL_TRIAGE.md
   section E.

   Nothing here is invented. "Block" already has one meaning in this game: `p.guardT>0` makes
   `hurtPlayer` do `dmg*=0.4` (11222), so the damage you blocked is the 60% that multiply removed —
   a number the game computes for itself. Returning damage to an attacker already exists twice in the
   same function: `p.reflectT` throws it back at 1.5x (11223) and the monk's Stillness returns it
   doubled (11170), the latter through `hitEnemy(by, …)` inside a try/catch, which is the idiom this
   copies. And the paladin reaches the brace through its own default kit — `pal_bash` is `w_bash`
   (guardT 1.2) and `pal_taunt` is `bulwark` (guardT 3.2), both a-side, both in the rank-10 build.

   A/B IN ONE LAUNCH: the comparison is between the two options at the SAME rank in the SAME game.
   With the b-side `pal_heal` picked the attacker must come out of the exchange untouched; with
   `pal_bounce` it must lose the part the brace ate.

   `ch[3]` IS PINNED TO THE B-SIDE, and without that this probe reports a false zero for both halves.
   The a-side is `pal_thick` — "the first hit of every fight deals no damage at all" — which
   `hurtPlayer` honours at 11179 by RETURNING before the brace is ever reached. `cheatRank10All` takes
   a-sides, so the very first hit of each trial would be swallowed and neither half would reach the
   line under test.

   Known-bad: watched to fail against the shipped game — the attacker lost nothing in either half. */
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
  if(G.hub) return JSON.stringify({ ok:false, why:'in the hub — hurtPlayer returns before everything' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'paladin';

  /* On-class through the game's own classStartWeapon(), as stward.probe.js does. Nothing measured
     here reads classFamilyOk, but the Arena's rolled loadout is not a state a player can be in. */
  let weaponNote = 'none';
  (function(){
    const tries = ['paladin'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('paladin');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'pal_holypow';                  // NOT pal_thick — see the header, it eats the first hit

  const HIT = 100;

  const trial = (pick) => {
    cs.ch[7] = pick;
    G.enemies.length = 0;
    /* The attacker is a real enemy so `by` is what the game passes: hurtPlayer's own knockback and
       lastHitBy branches both read it, and a plain object would be a second thing that could explain
       a zero. Parked well out of reach and unkillable so it can neither hit back nor die of this. */
    const foe = __BF3.spawnEnemy('grunt', p.x + 260, p.z + 260);
    if(!foe) return { pick: pick, why: 'no attacker could be spawned' };
    foe.active = true; foe.hp = foe.maxHp = 100000;

    p.dead = false; p.downed = false; p.invuln = 0; p.dodgeTimer = 0;
    p.shieldHp = 0; p.shieldT = 0; p.reflectT = 0; p._stillnessT = 0;
    p._tarmT = 0; p._thickUsed = false;
    p.hp = Math.round(__BF3.effMaxHp(p));
    p.guardT = 3;                            // braced, which is what "block" means here

    const hp0 = p.hp, foe0 = foe.hp;
    let threw = null;
    try { __BF3.hurtPlayer(HIT, foe.x, foe.z, foe); } catch(e){ threw = String(e && e.message || e); }
    return { pick: pick, took: hp0 - Math.round(p.hp), returned: foe0 - Math.round(foe.hp),
             braced: (p.guardT || 0) > 0, threw: threw };
  };

  const control = trial('pal_heal');         // the b-side of the same rank: wired, and not a reflect
  const bounce  = trial('pal_bounce');

  return JSON.stringify({
    /* The bar is EFFECT, not amount: the returned number depends on the class multipliers the brace
       sits behind (the rank-10 capstone alone is dmg*=0.82), so a hard-coded expectation would be a
       balance assertion pretending to be a correctness one. What must be true is that the control
       returns nothing, the passive returns something, and both take the same hit — the last part is
       what says the reflect was added rather than the brace being changed. */
    ok: control.returned === 0 && bounce.returned > 0
        && control.took > 0 && control.took === bounce.took
        && !control.threw && !bounce.threw,
    hit: HIT, control: control, bounce: bounce,
    ratio: control.took ? Math.round((bounce.returned / control.took) * 100) / 100 : null,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
    maxHp: Math.round(__BF3.effMaxHp(p)),
  });
})()
