/* DOES HASTE RESET ANYTHING?

   Chronomancer rank-3 option b (index.html:2154) reads: "Rewinding resets every skill cooldown."
   The death save at 11631 answers it in one line:

       if(c2Passive('chr_haste')){ for(let i=0;i<4;i++) p.cds && (p.cds[i]=0); }

   `p.cds` DOES NOT EXIST. The player's cooldown array is `p.skillCd`, built in newG (3642) as
   `skillCd:[0,0,0,0]` and used by every other line in the file that touches a cooldown - the
   Warlock capstone (10207), the Reaper capstone (10246), Rhythm (10782), the Bladedancer capstone
   (11507), and the per-frame decrement (13001). So `p.cds &&` short-circuits, the loop body has
   never once run, and a Chronomancer who took Haste rewinds with every cooldown exactly where it
   was.

   WHY NOTHING FOUND IT UNTIL NOW, which is the point worth keeping. `audit-passives.js` asks "does
   anything mention this id" and `chr_haste` is mentioned twice - here, and in effCdr (3766) where it
   also grants a flat +10% cooldown reduction. So the passive audit has called it wired for its whole
   life, and the half of it the CARD is about has never worked. This is the shape docs/SKILL_TRIAGE.md
   section H names (the ninja's Unseen, gated on a clock that only ran for the mage) and it was found
   the way section I's was: the static field sweep, read-never-written half - `p.cds`, two reads, zero
   writes, in a file where the sweep's other 170 player fields all have both.

   Nothing is invented and there is no number to put to Oliver: the card says every cooldown, the
   shipped line says 0, and the only edit is the name of the array.

   THREE HALVES IN ONE LAUNCH, because two would not separate the fix from the rewind:
     - control  picks `chr_potent`, the a-side of the SAME rank. It fires on the same event and has
                nothing to do with cooldowns, so a control whose cooldowns survive says the reset is
                the PASSIVE and not the rewind.
     - haste    picks `chr_haste` and lets the game's own line run.
     - inert    picks `chr_potent` (so the game's real line is skipped) and then executes the SHIPPED
                form verbatim on the live player, fed to the identical bar as if it were the fix.
                That is what this probe says against the game as it was, permanently, without anyone
                having to break the repo to see it - the idiom harness/probes/bounty.probe.js
                established.

   The cooldowns are LOADED BY CASTING, through the game's own useSkill, never by assignment: a bench
   that writes the numbers it later reads is the trap Task 5 of the harness plan records at length.
   Every half asserts `rewound` off the game's own `G._rewUsed` counter, so a cooldown reading can
   never be a rewind that silently never happened. */
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

  /* Stand where the game would let you stand: the Arena hands out its own loadout and it is usually
     off-class, and an off-class cast is a different code path (OFFCLASS_MUL, and several handlers
     gate their defining half on it). Nothing measured here reads it, but the bench's rule is to be
     a legal player. */
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
  const round1 = v => Math.round((v || 0) * 100) / 100;

  /* `runShipped` is the known-bad: the dead line, transcribed character for character out of the
     game as it shipped, run at the moment the game's own line would have run. */
  const trial = (label, pick, runShipped) => {
    cs.ch[3] = pick;

    /* Reset every gate between one trial and the next. `G._rewUsed` is the once-per-area counter
       (chr_glass raises it to 2; cheatRank10All takes a-sides, so it is 1 here); `invuln` is what
       chr_ward left behind from the previous trial and would make hurtPlayer return early. */
    G.enemies.length = 0;
    G._rewUsed = 0;
    p._rew = []; p._rewT = 0;
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0;
    p.maxMana = p.maxMana || 100;
    p.hp = __BF3.effMaxHp(p);
    p.mana = p.maxMana;
    for(let i = 0; i < 4; i++){ p.skillCd[i] = 0; p.skillCdMax[i] = 0; }

    /* A body to cast AT. Several of the kit refund when they find no target, and a refunded cast
       never goes on cooldown - so without this the control's "cooldowns survived" could be a
       cooldown that was never loaded. */
    const dummy = __BF3.spawnEnemy('dummy', p.x, p.z - 120);
    if(dummy){ dummy.dummy = true; dummy.active = true; dummy.hp = dummy.maxHp = 100000; }

    /* Let the game record its own three seconds. 0.25s per sample, 14 kept, so ~4.3s guarantees the
       ring is full and _rew[0] is the oldest sample the death save reads. */
    for(let k = 0; k < 260; k++) __BF3.update(1/60);

    /* LOAD THE COOLDOWNS BY PLAYING. Mana is topped between casts because spendSkillMana refusing
       is indistinguishable, at the array, from a skill that never fired. */
    const names = [];
    for(let i = 0; i < 4; i++){
      p.mana = p.maxMana;
      const s = (__BF3.c2CurSkills() || [])[i];
      names.push(s ? s.n : null);
      try { __BF3.useSkill(i); } catch(e){}
    }
    const loaded = [0,1,2,3].map(i => round1(p.skillCd[i]));
    const allLoaded = loaded.every(v => v > 0);

    /* Take a real killing blow. No ticks between the load and the hit, so nothing can tick a
       cooldown down far enough to be mistaken for a reset. */
    p.hp = 1; p.invuln = 0; p.dodgeTimer = 0;
    const usedBefore = G._rewUsed || 0;
    let threw = null;
    try { __BF3.hurtPlayer(99999, p.x, p.z - 40, null); } catch(e){ threw = String(e && e.message || e); }

    /* THE KNOWN-BAD, verbatim from index.html as it shipped. */
    if(runShipped){ for(let i = 0; i < 4; i++) p.cds && (p.cds[i] = 0); }

    const after = [0,1,2,3].map(i => round1(p.skillCd[i]));
    return {
      label: label, pick: pick, skills: names,
      loaded: loaded, allLoaded: allLoaded,
      after: after,
      anyReset: after.some((v, i) => loaded[i] > 0 && v === 0),
      allReset: after.every((v, i) => loaded[i] === 0 || v === 0),
      rewound: (G._rewUsed || 0) > usedBefore,
      hpAfter: Math.round(p.hp || 0),
      hasCds: p.cds !== undefined,
      threw: threw,
    };
  };

  /* HASTE LAST, so the frame the harness photographs after this returns is the one under test. The
     halves are independent - every gate is reset at the top of `trial` - so the order is free, and
     spending it on the picture is worth it here: four cleared cooldown wheels in the skill bar is
     exactly the kind of claim a still frame CAN settle. Run with `inert` last instead, the shot
     shows 1.4 / 5.9 / 9.7 / 16.4 still counting down, which is the shipped game. */
  const control = trial('control', 'chr_potent', false);
  const inert   = trial('inert',   'chr_potent', true);
  const haste   = trial('haste',   'chr_haste',  false);

  /* The bar, applied to whichever half is being offered as the fix. Run against `inert` it is what
     this probe says about the game as it shipped, on real measurements taken in this same launch -
     which is the only reason a green `ok` means anything. */
  const bar = (fix) => !!(control.rewound && fix.rewound
                          && control.allLoaded && fix.allLoaded
                          && !control.anyReset          // the rewind on its own resets nothing
                          && fix.allReset               // the passive resets every loaded cooldown
                          && !control.threw && !fix.threw);

  return JSON.stringify({
    ok: bar(haste) && !inert.anyReset,
    okAgainstInert: bar(inert),
    control: control, haste: haste, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
