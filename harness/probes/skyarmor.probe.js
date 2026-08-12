/* DOES SKY ARMOR DO ANYTHING AT ALL?

   Skylancer rank-9 option b (index.html:2208) reads: "Nothing can hit you in the first moment after
   a jump." `harness/audit-passives.js` says the id `sky_armor` appears exactly twice in the whole of
   public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and nowhere
   else, so nothing in the game ever consults it. It is one of the 35 in docs/SKILL_TRIAGE.md
   section E.

   NOTHING HERE IS INVENTED. "Nothing can hit you" already has exactly one meaning in this file:
   hurtPlayer returns on `p.invuln>0` (11327) before any class clause runs. And "the first moment" is
   the player's own i-frame window, 0.18 - the dodge's, set at 12834 with a comment explaining why it
   is that length. So the passive is the dodge's window granted by a jump instead of by a roll.

   THE JUMP IS THE GAME'S OWN. This probe sets `input.jumpEdge` and steps `update()`, so the handler
   under test is reached the way a player reaches it; it never writes `p.invuln` or `p.vy` itself.
   Per sub-project A Task 5: a probe that imitates the thing it means to measure passes against the
   bug it exists to catch.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only thing
   that differs between the halves is which passive is chosen. `sky_reset` (Second Wind) is the
   control: the a-side of this very rank, WIRED (10134), and it grants no protection of any kind.

   TWO HITS PER HALF, and the late one is the clause that matters most. A wiring that made a
   Skylancer permanently untouchable after its first jump would satisfy a naive one-hit bar and would
   be a far worse bug than the dead passive. So each half is measured twice from a fresh jump: once
   in the frame after lift-off, and once 20 frames (~0.33s) later, past the window. The late hit must
   land in BOTH halves, and it must land for the SAME amount - that is what says the window was
   added rather than the damage changed.

   THE TWO HITS ARE SEPARATE TRIALS, not one sequence, because hurtPlayer sets `p.invuln=0.7` on
   every hit that lands (11390). Measured in sequence, the control's early hit would arm a 0.7s
   window of its own and swallow its own late hit, and the halves would stop being comparable.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   feeds `sky_high` - another passive from docs/SKILL_TRIAGE.md section E, still dead - to the
   identical bar. `okAgainstInert` is therefore what this probe would report against the shipped
   game, and it must be false while `ok` is true. It goes in `ch[9]` like the other two: c2Passive
   (9987) scans ranks 3/5/7/9 for the id and does not care which one holds it. */
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
  __BF3.meta.classId = 'skylancer';

  /* On-class through the game's own classStartWeapon(), as the other probes in this set do: the
     Arena hands out a rolled loadout and the game hard-blocks an off-class weapon (13220), so a
     bench holding one is standing where no player can stand. */
  let weaponNote = 'none';
  (function(){
    const tries = ['skylancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('skylancer');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned away from anything that could soak or refuse a hit, so the only
     protection in play is the one under test. sky_soft (r3 b) is a flat -15% in the air and would
     make the two halves' late hits differ; sky_guard/sky_tail (r5) and sky_float (r7) are the
     a-sides cheatRank10All would otherwise leave in place. */
  cs.ch[3] = 'sky_high';      // dead, and read by nothing — see the known-bad note in the header
  cs.ch[5] = 'sky_tail';
  cs.ch[7] = 'sky_float';

  const HIT = 100;
  const GROUND = p.y;

  const trial = (pick, waitFrames) => {
    cs.ch[9] = pick;

    G.enemies.length = 0;
    /* A real enemy, so `by` is what the game passes hurtPlayer - its knockback and lastHitBy
       branches both read it. Parked well out of reach and unkillable so it can neither reach the
       hero during the wait nor die of this. */
    const foe = __BF3.spawnEnemy('grunt', p.x + 320, p.z + 320);
    if(!foe) return { pick: pick, wait: waitFrames, why: 'no attacker could be spawned' };
    foe.active = true; foe.hp = foe.maxHp = 100000;

    p.dead = false; p.downed = false; p.recoverT = 0;
    p.invuln = 0; p.dodgeTimer = 0; p.hurtFlash = 0;
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0; p.reflectT = 0; p._stillnessT = 0;
    p.y = GROUND; p.vy = 0; p.vx = 0; p.vz = 0; p.onGround = true; p.jumps = 0;
    p.hp = Math.round(__BF3.effMaxHp(p));

    /* The game's own jump: the edge the input layer sets (7701) and the handler at 12820 that reads
       it. Nothing here touches p.vy or p.invuln. */
    const inv0 = p.invuln || 0;
    __BF3.input.jumpEdge = true;
    let threw = null;
    try { __BF3.update(1/60); } catch(e){ threw = String(e && e.message || e); }
    const jumped = !p.onGround && (p.vy || 0) > 0;
    const invAfterJump = Math.round((p.invuln || 0) * 1000) / 1000;

    for(let k = 0; k < waitFrames && !threw; k++){
      try { __BF3.update(1/60); } catch(e){ threw = String(e && e.message || e); }
    }

    const hp0 = p.hp, invAtHit = Math.round((p.invuln || 0) * 1000) / 1000;
    try { __BF3.hurtPlayer(HIT, foe.x, foe.z, foe); } catch(e){ threw = threw || String(e && e.message || e); }

    return { pick: pick, wait: waitFrames, jumped: jumped, invBefore: inv0,
             invAfterJump: invAfterJump, invAtHit: invAtHit,
             took: hp0 - Math.round(p.hp), threw: threw };
  };

  const half = (pick) => ({ early: trial(pick, 0), late: trial(pick, 20) });

  const control = half('sky_reset');    // the a-side of the same rank: wired, and protects nothing
  const armor   = half('sky_armor');
  const inert   = half('sky_high');     // still dead — the permanent known-bad

  /* The bar, one clause per clause of the card.
     - the jump must have happened in every trial, or nothing below means anything
     - the window opened: with the passive, the hit in the frame after lift-off does nothing
     - the window CLOSED: 20 frames later the same hit lands, and for the same amount as the control
       took, which says a window was added rather than the damage being changed */
  const jumpedEverywhere = [control, armor, inert].every(h => h.early.jumped && h.late.jumped);
  const threwSomewhere   = [control, armor, inert].some(h => h.early.threw || h.late.threw);

  const controlHeld = control.early.took > 0 && control.late.took > 0
                      && control.early.invAfterJump === 0;

  const bar = (h) => h.early.took === 0 && h.early.invAfterJump > 0
                     && h.late.took > 0 && h.late.took === control.late.took;

  return JSON.stringify({
    ok: !!(jumpedEverywhere && !threwSomewhere && controlHeld && bar(armor)),
    okAgainstInert: !!(jumpedEverywhere && !threwSomewhere && controlHeld && bar(inert)),
    jumpedEverywhere: jumpedEverywhere, controlHeld: controlHeld,
    hit: HIT, control: control, armor: armor, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
    maxHp: Math.round(__BF3.effMaxHp(p)),
  });
})()
