/* DOES POTENT (THE PASSIVE) DO ANYTHING AT ALL?

   Chronomancer rank-3 option a (index.html:2154) reads: "Rewinding also restores the mana you had
   three seconds ago." `harness/audit-passives.js` says the id `chr_potent` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else. It is one of the 42 in docs/SKILL_TRIAGE.md section E.

   IT IS THE CHEAPEST HONEST ROW LEFT, and for the reason that made Storm Ward and Flow cheap: the
   thing it asks for is already in the file. `p._rew` (12583) is a ring the game pushes every 0.25s
   and keeps 14 of - 3.5s of history - and the death-save at 11301 already reads `_rew[0]` and
   restores position and hp from it. "The mana you had three seconds ago" is therefore that same
   sample's mana, and the only reason it cannot be read today is that the push does not record the
   field. Nothing is invented and there is no number to put to Oliver.

   WHICH "Rewinding" IT MEANS IS SETTLED BY THE FILE, NOT BY ME, and it matters because there are two
   things called Rewind - the rank-4 skill `chr_blink` and the death save. `chr_potent`'s two siblings
   at the same rank cluster are already wired INSIDE the death save: `chr_ward` ("for three seconds
   after a Rewind you cannot be harmed") at 11307 and `chr_haste` ("rewinding resets every skill
   cooldown") at 11308. So this is the third line of a block that already has two of the same shape.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only difference
   between the halves is which passive is chosen. `chr_haste` is the control: it is wired, it fires on
   the same event, and it has nothing to do with mana - so a control that stays at 0 says the restore
   is the PASSIVE and not the rewind.

   Driven through the game's own systems throughout: the history is built by running `update()` until
   the game has recorded it (never by fabricating a `_rew` array, which would be asserting on
   something the probe wrote), and the rewind is reached by taking a real killing blow through
   `hurtPlayer`. Both trials assert `rewound`, read off the game's own `G._rewUsed` counter, so a mana
   reading of 0 can never be a rewind that silently never happened.

   Known-bad: watched to fail against the shipped game - the potent half restores nothing, exactly
   like the control. */
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

  /* The Arena hands out its own loadout, which is usually off-class. Nothing measured here reads
     classFamilyOk - hurtPlayer never does - but the bench's own rule is to stand where the game
     would let you stand, so equip through the game's own starter table. */
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

  const trial = (pick) => {
    cs.ch[3] = pick;

    /* Reset every gate between the death save and this trial. G._rewUsed is the once-per-area
       counter (chr_glass raises it to 2 and cheatRank10All takes a-sides, so it is 1 here); invuln
       is what chr_ward left behind from the PREVIOUS trial and would make hurtPlayer return early. */
    G.enemies.length = 0;
    G._rewUsed = 0;
    p._rew = []; p._rewT = 0;
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0;
    p.maxMana = p.maxMana || 100;
    p.hp = __BF3.effMaxHp(p);
    p.mana = p.maxMana;                       // the mana we HAVE, and therefore the mana we WILL have had

    /* Let the game record its own history. 0.25s per sample, 14 kept, so ~4.3s guarantees the ring
       is full and _rew[0] is the oldest sample the death save will read. */
    for(let k = 0; k < 260; k++) __BF3.update(1/60);

    const ring   = p._rew || [];
    const oldest = ring[0] || null;
    const ageS   = oldest && oldest.t != null ? Math.round((G.time - oldest.t) * 100) / 100 : null;
    /* Read the depth NOW. The death save does `p._rew.length = 0` (11309) on the same array this
       holds a reference to, so a count taken after the hit reports 0 and reads exactly like a ring
       that was never filled. The first run of this probe printed `samples: 0` beside an
       `oldestAgeS` of 3.53 for precisely that reason. */
    const samples = ring.length;

    /* Spend it all, then take a killing blow. No ticks in between, so nothing can regenerate the
       mana back and make a broken restore look like a working one. */
    p.mana = 0;
    p.hp = 1; p.invuln = 0; p.dodgeTimer = 0;
    const usedBefore = G._rewUsed || 0;
    let threw = null;
    try { __BF3.hurtPlayer(99999, p.x, p.z - 40, null); } catch(e){ threw = String(e && e.message || e); }

    return {
      pick: pick,
      samples: samples,
      oldestAgeS: ageS,
      past: oldest ? (oldest.mana == null ? null : Math.round(oldest.mana)) : null,
      rewound: (G._rewUsed || 0) > usedBefore,
      hpAfter: Math.round(p.hp || 0),
      manaAfter: Math.round(p.mana || 0),
      maxMana: Math.round(p.maxMana || 0),
      threw: threw,
    };
  };

  const control = trial('chr_haste');        // b-side of the same rank: wired, fires on the same event, nothing to do with mana
  const potent  = trial('chr_potent');

  return JSON.stringify({
    ok: !!(control.rewound && potent.rewound                 // the rewind fired in BOTH halves, so a 0 is never a no-op cast
           && control.manaAfter === 0                        // the rewind itself restores nothing
           && potent.past != null && potent.past > 0         // the ring recorded the mana we held
           && potent.manaAfter === potent.past               // and the save gave exactly that back
           && !control.threw && !potent.threw),
    control: control, potent: potent,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
