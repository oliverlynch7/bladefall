/* DOES BOUNTY HUNTER (THE PASSIVE) DO ANYTHING AT ALL?

   Ranger rank-9 option b (index.html:2064) reads: "Marked enemies deal −8% to you; killing one heals
   4% HP and gives +10% gold." `harness/audit-passives.js` says the id `r_bounty` appeared exactly
   twice in the whole of public/ — in CLASS2 where it is defined and in PASSIVE_ART where its icon is
   named — and nowhere else. It is one of the 38 in docs/SKILL_TRIAGE.md section E, and that document
   already calls it the ranger's only "fully stated, nothing blocked" row: three clauses, three
   numbers, all three written on the card and all three mechanisms already in the file.

   THE CARD HAS THREE CLAUSES SO THIS PROBE MEASURES THREE THINGS, and each one has its own control
   INSIDE the same half, because two of the three are conditioned on the MARK rather than on the
   passive:
     1. damage taken from a marked attacker      → ×0.92 against the same hit from an unmarked one
     2. killing a marked enemy                   → heals 4% of max HP; killing an unmarked one heals 0
     3. the marked kill's purse                  → ×1.1 against the unmarked kill's
   A wiring that ignored the mark would satisfy a naive "the bounty half differs" bar and would be a
   different, worse bug than the dead one — every enemy in the game would pay the bounty.

   THE CONTROL IS THE OTHER OPTION AT THE SAME RANK, `r_elem` (Elemental Archer), AND IT IS ITSELF
   DEAD — stated rather than hidden, exactly as harness/probes/ambush.probe.js states it for the
   ranger's rank-5 pair. It is still the right control and arguably a stricter one: it is a passive
   PROVEN to consult nothing, so any difference between the halves is the passive under test.

   THE ASSERTION IS WATCHED TO FAIL IN THE SAME LAUNCH, without breaking the repo and without a
   stash. A THIRD half runs with `r_elem` picked again and is then fed to the identical bar as if it
   were the passive: `okAgainstInert` is what this probe would report against a game where nothing
   reads the id, which is precisely the state it exists to detect. It must be false while `ok` is
   true. A green light nobody has watched go red is a green light nobody should believe.

   THE MARK IS PUT ON BY THE GAME'S OWN SKILL. Hunter's Mark is ranger rank 8 = slot 3, and
   cheatRank10All takes a-sides, so slot 3 is `r_mark`. The probe casts it with `useSkill` and only
   falls back to writing `markT` itself if the cast refunds (no line of sight to the target); it says
   which it did in `markedBy`, because a probe that silently imitates the thing it is testing is how
   this harness's multiplayer suite once passed against the bug it existed to catch.

   TWO CONFOUNDS, both handled and both real:
   - `p.invuln=0.7` is set by every landed hit, and hurtPlayer returns early on it — so a second
     damage trial in the same half would measure nothing at all. Cleared before each.
   - the payout is rounded twice (`Math.round` inside the gold formula and again inside awardGold),
     so a small purse cannot express a 10% difference. Both kills are given the same large `xp`,
     which is the enemy's own field the formula reads, so the rounding error is under a tenth of a
     percent instead of a quarter.

   Driven through the game's own systems throughout: the hit goes through `hurtPlayer` with a real
   enemy as `by` (its knockback and lastHitBy branches both read it, so a plain object would be a
   second thing that could explain a difference), and the kill goes through `killEnemy`, which is the
   one door every kill in the game passes through. */
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
  __BF3.meta.classId = 'ranger';

  /* The Arena hands out its own loadout, which is usually off-class. Nothing measured here reads
     classFamilyOk — hurtPlayer and killEnemy never call it — but the mark is cast with useSkill,
     which passes it into every handler, so equip through the game's own starter table anyway. */
  let weaponNote = 'none';
  (function(){
    const tries = ['ranger'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('ranger');
  cs.ch = cs.ch || {};

  const HIT = 1000;          // large on purpose: hurtPlayer rounds the final number, so a small hit cannot express 8%
  const XP  = 1000;          // ditto for the purse, which is rounded twice
  const MARK_SLOT = 3;       // rank 8 is slot 3; cheatRank10All takes a-sides, so that is Hunter's Mark
  const MAXHP = Math.round(__BF3.effMaxHp(p));

  const markedBy = [];

  /* Put a foe in the world and, if `marked`, put the game's own mark on it. */
  const foeAt = (marked, dz) => {
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z + dz);
    if(!foe) return null;
    foe.active = true; foe.hp = foe.maxHp = 100000; foe.immobile = true; foe.xp = XP;
    if(marked){
      p.mana = p.maxMana || 100;
      if(p.skillCd) p.skillCd[MARK_SLOT] = 0;
      try { __BF3.useSkill(MARK_SLOT); } catch(e){}
      if((foe.markT || 0) > 0) markedBy.push('cast');
      else { foe.markT = 8; markedBy.push('field'); }   // no line of sight — say so rather than hide it
    }
    return foe;
  };

  /* One hit from `foe`, measured on the player's own health. */
  const take = (foe) => {
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0;                     // every landed hit sets invuln 0.7 and the next call returns early
    p.shieldHp = 0; p.shieldT = 0; p.reflectT = 0; p._stillnessT = 0; p.guardT = 0;
    p.hp = 100000;                                      // far above max so a 1000 hit can never reach a death branch
    const hp0 = p.hp;
    try { __BF3.hurtPlayer(HIT, foe.x, foe.z, foe); } catch(e){ return { took:null, threw:String(e && e.message || e) }; }
    return { took: hp0 - p.hp };
  };

  /* One kill, measured on the player's health and on the purse. */
  const kill = (foe) => {
    p.dead = false; p.downed = false;
    p.hp = Math.max(1, Math.round(MAXHP * 0.35));       // damaged, so a 4% heal has room to show
    const hp0 = p.hp, gold0 = __BF3.meta.gold || 0;
    foe.hp = 0;
    try { __BF3.killEnemy(foe); } catch(e){ return { healed:null, gold:null, threw:String(e && e.message || e) }; }
    return { healed: Math.round(p.hp) - hp0, gold: (__BF3.meta.gold || 0) - gold0, dead: !!foe.dead };
  };

  const trial = (pick, label) => {
    cs.ch[9] = pick;
    G.enemies.length = 0;

    const mFoe = foeAt(true,  -300);
    const pFoe = foeAt(false, -520);
    if(!mFoe || !pFoe) return { pick:pick, label:label, why:'no target could be spawned' };

    const tookMarked = take(mFoe);
    const tookPlain  = take(pFoe);
    const killMarked = kill(mFoe);
    const killPlain  = kill(pFoe);

    return { pick:pick, label:label,
             marked:(mFoe.markT || 0) > 0, plainMarked:(pFoe.markT || 0) > 0,
             tookMarked:tookMarked.took, tookPlain:tookPlain.took,
             healMarked:killMarked.healed, healPlain:killPlain.healed,
             goldMarked:killMarked.gold,  goldPlain:killPlain.gold,
             killedMarked:killMarked.dead, killedPlain:killPlain.dead,
             threw: tookMarked.threw || tookPlain.threw || killMarked.threw || killPlain.threw || null };
  };

  const near = (v, want, tol) => v != null && Math.abs(v - want) <= tol;

  /* THE BAR. Applied to (control, candidate) so the same code can be run against a candidate that is
     KNOWN to be inert — see okAgainstInert below. */
  const bar = (c, b) => {
    if(!c || !b || c.why || b.why || c.threw || b.threw) return false;
    return c.marked && b.marked && !c.plainMarked && !b.plainMarked          // the mark went on, and only where it was meant to
        && c.killedMarked && c.killedPlain && b.killedMarked && b.killedPlain
        && c.tookMarked > 0 && c.tookPlain > 0 && c.tookMarked === c.tookPlain   // control: the mark changes nothing
        && c.healMarked === 0 && c.healPlain === 0                               // control: no heal either way
        && c.goldMarked > 0 && c.goldMarked === c.goldPlain                      // control: same purse either way
        && b.tookPlain === c.tookPlain                                           // an UNMARKED foe still hits just as hard
        && near(b.tookMarked / b.tookPlain, 0.92, 0.005)                         // -8%, as the card says
        && b.healPlain === 0                                                     // and only a MARKED kill heals
        && near(b.healMarked, Math.max(1, Math.round(MAXHP * 0.04)), 1)          // 4% of max HP
        && b.goldPlain === c.goldPlain                                           // an unmarked kill pays the same as always
        && near(b.goldMarked / b.goldPlain, 1.1, 0.005);                         // +10% on the marked one
  };

  const control = trial('r_elem',   'control (the a-side of the same rank, itself dead)');
  const bounty  = trial('r_bounty', 'bounty hunter');
  const inert   = trial('r_elem',   'the same dead passive again, fed to the bar as if it were the fix');

  return JSON.stringify({
    ok: bar(control, bounty),
    /* This is the known-bad, measured rather than argued: against a game where nothing reads
       `r_bounty` the second half would look exactly like this one, and the bar must go red. */
    okAgainstInert: bar(control, inert),
    hit: HIT, xp: XP, maxHp: MAXHP, expectedHeal: Math.max(1, Math.round(MAXHP * 0.04)),
    control: control, bounty: bounty, inert: inert,
    dmgRatio:  bounty.tookPlain ? Math.round((bounty.tookMarked / bounty.tookPlain) * 1000) / 1000 : null,
    goldRatio: bounty.goldPlain ? Math.round((bounty.goldMarked / bounty.goldPlain) * 1000) / 1000 : null,
    markedBy: markedBy.join(','),
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
