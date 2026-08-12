/* DOES HASTE RESET ANY COOLDOWN AT ALL?

   Chronomancer rank-3 option b (index.html:2154) reads: "Rewinding resets every skill cooldown."
   The death-save block that owns the Rewind ends with the line that is supposed to deliver it
   (11644):

       if(c2Passive('chr_haste')){ for(let i=0;i<4;i++) p.cds && (p.cds[i]=0); }

   THERE IS NO `p.cds` IN THIS GAME. The player's cooldown array is `p.skillCd`, built at 3642 and
   read in twenty-three other places; `p.cds` is assigned nowhere in the file, so `p.cds &&` is a
   short-circuit onto undefined and the loop's body never runs. The whole card is a no-op.

   THIS IS NOT A DEAD PASSIVE AND THE AUDIT NEXT DOOR CANNOT SEE IT. `harness/audit-passives.js`
   asks "does anything mention this id", and `chr_haste` is mentioned twice in live code: here, and
   in `effCdr` (3766) where it grants +10% cooldown reduction. So the id is wired, one of its two
   readers works, and the class's rank-3 menu still promises something no chronomancer has ever had.
   Fourth instance of the limit docs/superpowers/plans/2026-08-10-skill-correctness.md Task 3 Step 2
   states in advance, after `w_unyield` (pass 20), Unseen (section H) and Combo Edge (section N).

   Found by the READ-NEVER-WRITTEN half of `harness/audit-fields.js`, which the plan records as
   never having been worked: `p.cds  (2 reads, first at line 11644)`. Both reads are that one line.

   THE BAR IS WHAT THE PLAYER IS PROMISED, NOT WHAT THE CODE SETS - this document has twice been
   burned reading the field instead of the effect (pass 15 lit exactly the right enemy and burned
   nothing; pass 23 measured distance covered rather than an effSpeed reading). So each half ends by
   PRESSING a skill after the rewind and reading the mana it spends. `useSkill` returns at
   `if(p.skillCd[i]>0) return;` (10580) BEFORE it spends anything, so mana leaving the pool is the
   game's own proof that the cast was allowed - a reset you can see in `p.skillCd` but cannot cast
   off would clear a field-reading bar and still be the bug.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only
   difference between the halves is which passive is chosen. `chr_potent` is the control: it is
   wired, it is delivered by the same three lines of the same death save, and it has nothing to do
   with cooldowns - so a control whose cooldowns survive says the reset is the PASSIVE and not the
   Rewind.

   KNOWN-BAD, and it could not be an `inert` half. The trick petorder.probe.js and unseen.probe.js
   use - pin the field back between ticks - is unavailable, because the reset and the press either
   side of it are one synchronous stretch with no frame in between. So the shipped statement is
   TRANSCRIBED and fed the identical bar, the shape harness/test/gate.test.js uses: `p.cds` is read
   out of the live game, and if it does not exist the shipped line provably cannot move a cooldown,
   so the bar is re-evaluated against the cooldowns as they stood before the hit. `okAgainstShipped`
   is what this probe would say against the game as it ships. */
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

  /* The Arena hands out its own loadout, which is usually off-class, and eleven of sixteen classes
     were being benched that way until it was measured (this plan's Task 1 Step 1, fault 1). Equip
     through the game's own starter table so the bench stands where the game would let you stand. */
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
  const cds = () => [0,1,2,3].map(i => Math.round(((p.skillCd && p.skillCd[i]) || 0) * 100) / 100);

  const trial = (pick) => {
    cs.ch[3] = pick;

    /* Reset every gate between the death save and this trial. G._rewUsed is the once-per-area
       counter; invuln is what the previous trial's rewind left behind and would make hurtPlayer
       return early; the cooldown array is cleared so the casts below are the only thing that can
       have filled it. */
    G.enemies.length = 0;
    G._rewUsed = 0;
    p._rew = []; p._rewT = 0;
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0;
    p.maxMana = p.maxMana || 100;
    p.hp = __BF3.effMaxHp(p);
    for(let i = 0; i < 4; i++){ p.skillCd[i] = 0; p.skillCdMax[i] = 0; }

    /* Let the game record its own history rather than fabricating a `_rew` array - asserting on
       something the probe wrote is how the first MP test came to pass against the bug it existed to
       catch. 0.25s per sample, 14 kept, so ~4.3s guarantees the ring is full.
       THE TICKS COME BEFORE THE CASTS, not after: `update` decays skillCd by dt every frame (13014),
       so casting first would hand the trial four cooldowns that had already run 4.3 seconds down. */
    for(let k = 0; k < 260; k++) __BF3.update(1/60);
    const samples = (p._rew || []).length;

    /* Put the four skills on cooldown by CASTING them, never by assigning to skillCd. Mana is
       refilled before each press so a cast can never be refused for a reason the trial did not
       intend - `spendSkillMana` returning false leaves the slot cold and would read as a reset. */
    const names = [];
    for(let i = 0; i < 4; i++){
      p.mana = p.maxMana;
      const s = (__BF3.c2CurSkills() || [])[i];
      names.push(s ? s.n : null);
      try { __BF3.useSkill(i); } catch(e){}
    }
    const cdBefore = cds();
    const armed = cdBefore.filter(c => c > 0).length;

    /* No ticks between here and the blow, so nothing can decay a cooldown or regenerate the hp. */
    p.hp = 1; p.invuln = 0; p.dodgeTimer = 0;
    const usedBefore = G._rewUsed || 0;
    let threw = null;
    try { __BF3.hurtPlayer(99999, p.x, p.z - 40, null); } catch(e){ threw = String(e && e.message || e); }
    const rewound = (G._rewUsed || 0) > usedBefore;
    const cdAfter = cds();

    /* THE PLAYER-FACING HALF. Press slot 0 again and watch the pool: useSkill returns at
       `if(p.skillCd[i]>0) return;` before it spends anything, so mana leaving is the game's own
       statement that the cast was allowed through. Set the pool explicitly - chr_potent hands mana
       back on the rewind and the control must not be scored on that. */
    p.mana = p.maxMana;
    p.invuln = 0; p.dead = false; p.downed = false;
    const manaBefore = Math.round(p.mana);
    try { __BF3.useSkill(0); } catch(e){}
    const manaSpent = manaBefore - Math.round(p.mana);

    return {
      pick, samples, names,
      cdBefore, armed, cdAfter,
      allClear: cdAfter.every(c => c === 0),
      rewound, threw,
      manaBefore, manaSpent,
      recast: manaSpent > 0,
      hpAfter: Math.round(p.hp || 0),
    };
  };

  const control = trial('chr_potent');   // a-side of the SAME rank: wired, same death save, nothing to do with cooldowns
  const haste   = trial('chr_haste');

  /* The shipped statement, transcribed and fed the identical bar. `p.cds` is read out of the live
     game rather than asserted from the source: if it is absent, `p.cds && (p.cds[i]=0)` cannot move
     any cooldown, so what ships leaves cdBefore standing. */
  const cdsType = typeof p.cds;
  const shippedAfter = (p.cds != null) ? [0,0,0,0] : haste.cdBefore;

  const ok = !!(control.rewound && haste.rewound                  // the rewind fired in BOTH halves, so a survivor is never a no-op blow
                && control.armed >= 3 && haste.armed >= 3         // and both halves went in with real cooldowns
                && haste.allClear && haste.recast                 // the passive clears them AND the skill can be cast off the reset
                && !control.allClear && !control.recast           // the Rewind on its own clears nothing
                && !control.threw && !haste.threw);

  return JSON.stringify({
    ok,
    okAgainstShipped: !!(haste.rewound && haste.armed >= 3
                         && shippedAfter.every(c => c === 0)),
    cdsType, cdsIsThePlayersCooldownArray: p.cds === p.skillCd,
    control, haste,
    weapon: p.weapon && p.weapon.name, weaponNote,
  });
})()
