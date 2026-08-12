/* DOES HEAVY HANDS (THE PASSIVE) DO ANYTHING AT ALL?

   Berserker rank-3 option a (index.html:2130) reads: "You cannot dodge — but nothing can knock you
   back or stagger you." `harness/audit-passives.js` says the id `bsk_heavy` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else. It is one of the 36 still standing in docs/SKILL_TRIAGE.md section E.

   NOTHING IS INVENTED, which is what makes it a wiring row rather than a design one: the card states
   no numbers at all. Both clauses are absolutes, and both name a thing the game already does to the
   player in exactly one place each -

     knock you back : hurtPlayer, 11360 - `p.vx=(p.x-sx)/d*210; p.vz=…; p.vy=160; p.onGround=false`
     dodge          : the dodgeEdge branch, 12791 - the only place `p.dodgeTimer` is armed by input

   - so "nothing can" and "you cannot" are each one guard, and there is no amount to choose.

   THE DRAWBACK IS HALF THE CARD AND IS ASSERTED AS HARD AS THE BENEFIT. A wiring that granted the
   knockback immunity and quietly left the dodge working would pass any "the passive half differs"
   bar, ship a strictly-better rank-3 option, and be a worse bug than the dead passive it replaced.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only difference
   between the halves is which passive is chosen. The control is `bsk_reckless`, the b-side of rank 3.
   It is itself dead - rank 3 is a cluster where both options are unread - which is exactly what a
   control has to be here: it must neither block a dodge nor absorb a shove, and a passive nothing
   reads cannot do either.

   Known-bad carried in the probe rather than produced by breaking the repo, per Task 4's rule: a
   THIRD half runs the inert control again and is fed to the identical bar as if it were the fix, so
   `okAgainstInert` is what this probe would say against the shipped game. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

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

  /* The Arena hands out its own loadout, which is usually off-class. Neither clause reads
     classFamilyOk, but the bench's rule is to stand where the game would let you stand. */
  let weaponNote = 'none';
  (function(){
    const tries = ['berserker'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[5] = 'bsk_blood';        // NOT bsk_thick: a death save would change what a hit does to us
  cs.ch[7] = 'bsk_frenzy';       // attack speed only - nothing to do with being shoved or dodging

  const trial = (pick, label) => {
    cs.ch[3] = pick;

    G.enemies.length = 0;
    p.dead = false; p.downed = false;
    p.hp = __BF3.effMaxHp(p);
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0;

    /* CLAUSE 1 - "nothing can knock you back". A shove is read off the velocity the hit writes, not
       off where the body ends up: position is also moved by gravity, terrain and the walk, and a
       displacement of zero could be a floor the body could not slide along. */
    p.invuln = 0; p.dodgeTimer = 0; p.onGround = true;
    p.vx = 0; p.vz = 0; p.vy = 0;
    let threw = null;
    try { __BF3.hurtPlayer(10, p.x, p.z - 60, null); } catch(e){ threw = String(e && e.message || e); }
    const kb = Math.round(Math.hypot(p.vx || 0, p.vz || 0));
    const hpAfterHit = Math.round(p.hp);

    /* CLAUSE 2 - "you cannot dodge". Driven through the game's own input edge and its own update,
       never by calling a dodge function directly, so a guard placed anywhere on that path is seen. */
    p.vx = 0; p.vz = 0; p.invuln = 0;
    p.dodgeTimer = 0; p.dodgeCdT = 0;
    IN.dodgeEdge = true;
    __BF3.update(1/60);
    const dodged = (p.dodgeTimer || 0) > 0;
    const dodgeCdSpent = (p.dodgeCdT || 0) > 0;
    IN.dodgeEdge = false;

    return {
      label: label, pick: pick,
      knockback: kb, hpAfterHit: hpAfterHit,
      dodged: dodged, dodgeCdSpent: dodgeCdSpent,
      threw: threw,
    };
  };

  /* THE BAR. The control must be shoved and must be able to dodge - otherwise a zero on the passive
     half is a bench that cannot move a body rather than a passive that stopped one. The passive half
     must take the hit (both clauses are about what a hit DOES, not about avoiding it), take no shove
     at all, and be unable to dodge - and must not have spent the dodge cooldown on the attempt,
     because a "dodge" that burns the cooldown and grants no dash is a broken dodge, not a refused one. */
  const bar = (ctl, hh) =>
    !!(ctl && hh && !ctl.threw && !hh.threw
       && ctl.knockback > 0 && ctl.dodged
       && hh.hpAfterHit < __BF3.effMaxHp(p)
       && hh.knockback === 0
       && hh.dodged === false && hh.dodgeCdSpent === false);

  const control = trial('bsk_reckless', 'control (b-side of the same rank, itself unread)');
  const heavy   = trial('bsk_heavy',    'heavy hands');
  const inert   = trial('bsk_reckless', 'known-bad: the inert control fed to the fix\'s own bar');

  return JSON.stringify({
    ok: bar(control, heavy),
    okAgainstInert: bar(control, inert),
    control: control, heavy: heavy, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
