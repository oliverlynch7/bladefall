/* WHO IS `by`? — the second door this sub-project has verified a wiring through and the player cannot open

   `hurtPlayer(dmg, sx, sz, by)` (index.html:11595) takes an attacker, and Bounce Back (paladin r7 a,
   "Damage you block is returned to whoever dealt it", wired as pass 7) reads it at 11695:

       if(meta.classId==='paladin' && c2Passive('pal_bounce') && by && typeof by==='object'
          && !by.dead && _blocked>=1){ hitEnemy(by, Math.round(_blocked), p, 0,0,null); ... }

   **`foeHit` (11275) is `return {name:foeName(e), attack:atk||'a strike'};`** — a DESCRIPTOR, never
   the enemy. Every named damage source in the game goes through it (a melee blow 13500, a boss
   sweep 13349, a beam 13835) or hands `hurtPlayer` a literal of the same shape (a ranged attack
   13533, geysers, lava vents). So the object Bounce Back reflects into is a `{name, attack}` pair:
   it passes every clause of that guard, `hitEnemy` writes `hp` onto a throwaway, and the player is
   told **BOUNCED**.

   Pass 7 measured "the attacker lost 0 before and 57 after". This probe asks the question that pass
   could not: **through which door?** It is the same shape as section U — a wiring proven through a
   call the game itself never makes — found by the sweep section U's write-up asked the next run to
   run.

   FOUR TRIALS, ONE LAUNCH, one pinned body, `p.guardT` set so the brace is up (the passive lives
   inside `if(p.guardT>0)`):
     1. A BODILESS DESCRIPTOR — `hurtPlayer(dmg, e.x, e.z, {name:'a grunt', attack:'a melee blow'})`.
        Written as "foeHit's output transcribed", which it WAS on 2026-08-12 and stopped being on
        2026-08-13, when the fix gave foeHit a third field. Kept verbatim rather than updated,
        because a `{name, attack}` pair with no body is exactly what must never be hit back — so
        the trial that showed the bug is now the control that shows it is gone. **Generalises: any
        probe that copies a game structure is measuring the day it was written.**
     1b. THE GAME'S OWN `foeHit`, CALLED — the descriptor every melee blow, boss sweep and beam
        really hands `hurtPlayer`. Exists because of what happened to trial 1.
     2. THE PROBE'S DOOR  — `hurtPlayer(dmg, e.x, e.z, e)`, the enemy object itself. Positive
        control: this is the call pass 7's bar was measured with, and it must reflect or the bench
        is broken rather than the game.
     3. REAL CONTACT      — the body placed on the hero and the game ticked, so 13500 fires on its
        own with whatever it really passes. **This is the bar that carries the row**, and it went
        0 → 33 across the fix with this file untouched.
   Each trial also counts the **BOUNCED** floater, because a passive that tells the player it worked
   while returning nothing to nobody is worse than a silent one. */
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
  __BF3.meta.classId = 'paladin';
  const cs = __BF3.classState('paladin');
  cs.ch = cs.ch || {}; cs.rank = 9; cs.ch[7] = 'pal_bounce';
  /* THICK ARMOR IS THE A-SIDE AT RANK 3 AND `cheatRank10All` PICKS IT — "the first hit of every
     fight deals no damage at all" (11611), which ate the first trial's whole 200 and made its zero
     a zero about the wrong passive. Found by this probe's own clean-check: the hero lost 0 HP on a
     trial that was supposed to be measuring what happens to damage he BLOCKS. Switched to the
     b-side of that rank, and `_tarmT` is stamped fresh before every trial as a second guard, since
     the free hit rearms after five seconds out of combat and a slow launch could cross that. */
  cs.ch[3] = 'pal_holypow';
  cs.ch[5] = 'pal_second';

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };
  const bounced = () => Array.prototype.filter.call(document.body.children,
                          d => d && d.textContent === 'BOUNCED').length;
  const DMG = 200;

  const setup = (adjacent) => {
    G.enemies.length = 0; G.projectiles.length = 0;
    const e = __BF3.spawnEnemy('grunt', p.x + (adjacent ? 10 : 260), p.z);
    if(!e) return null;
    e.active = true; e.dummy = false; e.elite = false; e.boss = false;
    e.speed = adjacent ? e.speed : 0; e.hp = e.maxHp = 200000; e.stunT = 0;
    p.hp = __BF3.effMaxHp(p); p.invuln = 0; p.dodgeTimer = 0; p.guardT = 3;
    p.shieldHp = 0; p._stillnessT = 0; p._oath = null;
    tick(1);
    p.guardT = 3;                       // the tick above spends a frame of it
    p._tarmT = G.time;                  // Thick Armor's free hit already spent — see above
    return e;
  };

  const trial = (adjacent, fire) => {
    const e = setup(adjacent); if(!e) return { why: 'no body' };
    const eHp0 = e.hp, pHp0 = p.hp, b0 = bounced();
    let threw = null;
    try { fire(e); } catch(err){ threw = String(err && err.message || err); }
    return { threw: threw,
             attackerLost: Math.round(eHp0 - e.hp),
             heroLost: Math.round(pHp0 - p.hp),
             bouncedFloaters: bounced() - b0 };
  };

  /* TRIAL 1 IS A TRANSCRIPTION AND THAT IS NOW ITS JOB. It was written as "foeHit's shape,
     transcribed", to show the game's own descriptor reflecting nothing. The fix gave foeHit a
     third field, so this literal is no longer what the game produces — it is a BODILESS
     descriptor, and after the fix it must still reflect 0, because "carries no body" is exactly
     what may not be hit back. Kept verbatim as the known-bad control rather than updated to match,
     and trial 1b below asks the game for the real thing. */
  const bodilessShape = trial(false, (e) =>
    __BF3.hurtPlayer(DMG, e.x, e.z, { name: 'a grunt', attack: 'a melee blow' }));

  /* 1b: THE GAME'S OWN foeHit, called rather than copied — the descriptor every melee blow, boss
     sweep and beam in the game actually hands hurtPlayer. Skipped, loudly, if it is not exported,
     because a silently-absent trial reads as a passing one. */
  const gameShape = __BF3.foeHit
    ? trial(false, (e) => __BF3.hurtPlayer(DMG, e.x, e.z, __BF3.foeHit(e, 'a melee blow')))
    : { why: 'foeHit not exported' };

  const probeDoor = trial(false, (e) => __BF3.hurtPlayer(DMG, e.x, e.z, e));

  /* Real contact: the body is already on the hero, so 13500's own test fires as the game ticks.
     `heroLost > 0` is the clean-check — a trial where nothing hit the player proves nothing. */
  const realContact = trial(true, () => { for(let k = 0; k < 240; k++){ __BF3.update(1/60);
                                            if(p.guardT <= 0.4) p.guardT = 3;
                                            p.invuln = 0; p._tarmT = G.time; } });

  return JSON.stringify({
    dmgIn: DMG,
    bodilessShape: bodilessShape, gameShape: gameShape,
    probeDoor: probeDoor, realContact: realContact,
    /* CLEAN-CHECK: the two doors that must work regardless, plus a real hit landing. A run where
       the hero lost no health proves nothing about what he blocks. */
    ok: !!(probeDoor.attackerLost > 0 && realContact.heroLost > 0),
    reflectReachesGameShape: gameShape.attackerLost > 0,
    reflectReachesRealContact: realContact.attackerLost > 0,
    /* A bodiless descriptor must reflect NOTHING and must say nothing. Both halves: silently
       hitting a throwaway was the bug, and announcing BOUNCED for it was the worse half. */
    bodilessStaysSilent: bodilessShape.attackerLost === 0 && bodilessShape.bouncedFloaters <= 0,
    toldThePlayerAnyway: bodilessShape.bouncedFloaters > 0,
  });
})()
