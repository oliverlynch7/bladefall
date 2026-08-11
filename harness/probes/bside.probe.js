/* THE B-SIDE OF EVERY CHOICE RANK IN THE GAME, WHICH NOTHING HAS EVER PLAYED.

   `cheatRank10All` fills every rank-3/5/7/9 choice with the **a**-side. Every suite in this harness
   runs through it, so `test-skills.js`, every baseline, and every verdict in docs/SKILL_TRIAGE.md
   about any class has only ever exercised one half of every choice in the game.

   That is not a theoretical gap. docs/SKILL_TRIAGE.md section G: `bsk_frenzy`, rank 7 option b,
   carried a `ReferenceError` in `hurtPlayer` that aborted the function before `p.hp-=dmg`, so a
   Berserker who picked Frenzy could not be hurt by anything at all. The static passive audit called
   it WIRED, correctly - three live call sites name it. Wired is not correct, and nothing that reads
   source can tell the difference.

   So this sweep asks the cheapest question that would have caught it, of every b-side at once: with
   this passive chosen, do the game's own hot paths still RUN? Six calls per pick - the four stat
   functions the passive blocks live in, plus hurtPlayer and one swing - each in its own try, and a
   throw is recorded against the pick that was standing when it happened.

   It is deliberately NOT a correctness test. A passive that is read and read wrongly passes here,
   exactly as it passes the static audit. This is the floor under both: a passive whose own presence
   breaks the function that reads it.

   ONE PICK AT A TIME, and that is what makes a throw attributable. Choosing all four b-sides at once
   would find the same crashes and could not say which of the four caused one - and a class whose
   rank-3 pick throws would report its rank-9 pick as broken too, because hurtPlayer never gets past
   the first bad clause.

   Known-bad: run it against a build with the section G fix reverted and berserker/bsk_frenzy must
   come back `hurtPlayer: v is not defined`. It was in fact written the other way round - the fault
   was found first, by hand, and this generalises it - so the assertion has been watched to fail on
   the real thing rather than on a mock. */
(function(){
  const G = __BF3.G, p = G.p, meta = __BF3.meta;

  /* The bench sometimes arrives paused (~1 launch in 6), and a paused game's guards return early
     from the very functions this sweep is trying to run - which would report every class clean. */
  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(__BF3.mode !== 'play' && b){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });
  if(G.hub) return JSON.stringify({ ok:false, why:'hurtPlayer returns early in the hub (11191)' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  G.enemies.length = 0;                      // nothing else may touch the health bar

  const CLASSES = Object.keys(__BF3.CLASSES || {});
  const RANKS = [3, 5, 7, 9];
  const rows = [], throwsFound = [], zeroDealt = [];
  let picks = 0;

  /* On-class, through the game's own classStartWeapon(). A great many handlers gate their defining
     half on classFamilyOk(p.weapon), and docs/SKILL_TRIAGE.md section D records three classes whose
     own starter is off-class for them - so borrow an in-family one rather than measure a state the
     game hard-blocks (index.html:13220). */
  const armFor = (cid) => {
    const tries = [cid].concat(CLASSES);
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return i === 0 ? 'own' : ('borrowed:' + tries[i]); }
    }
    let w = null; try { w = __BF3.classStartWeapon(cid); } catch(e){}
    if(w){ w.anyClass = true; p.weapon = w; return 'FORCED anyClass'; }
    return 'none';
  };

  /* Every early return in hurtPlayer that is NOT a bug has to be cleared, or a hit that lands for
     zero is indistinguishable from a hit that threw: invuln and dodgeTimer (11193), downed (11192),
     the parry (11194), and the absorb pool and brace (11222-11224). */
  const clear = () => {
    p.invuln = 0; p.dodgeTimer = 0; p.downed = false; p.dead = false;
    p.shieldHp = 0; p.guardT = 0; p.bdParryT = 0; p._stillnessT = 0;
    /* NOT zero. Thick Armor (pal_thick, 11179) turns the FIRST hit of every fight aside and returns
       - so `_tarmT = 0` reads as "out of combat, rearm" and every paladin row would come back
       dealt 0, four invented bugs. Stamping it with now spends the free hit instead. */
    p._tarmT = G.time;
    p.hp = Math.round((p.maxHp || 100) * 0.8);
  };

  const call = (label, fn) => { try { fn(); return null; } catch(e){ return label + ': ' + String((e && e.message) || e); } };

  for(const cid of CLASSES){
    let cs = null; try { cs = __BF3.classState(cid); } catch(e){}
    if(!cs) continue;
    cs.ch = cs.ch || {};
    const savedCh = Object.assign({}, cs.ch);

    for(const rank of RANKS){
      /* The b-side id has to come from the game's own tree, not from a list restated here - a list
         goes stale the day a class gains a rank and then sweeps nothing while looking busy. */
      let pid = null, pname = null;
      try {
        const tree = __BF3.CLASS2 && __BF3.CLASS2[cid];
        const node = tree && tree['r' + rank];
        if(node && node.kind === 'passive' && node.b){ pid = node.b.id; pname = node.b.n; }
      } catch(e){}
      if(!pid) continue;

      meta.classId = cid;
      const weaponNote = armFor(cid);
      cs.ch[rank] = pid;
      picks++;

      clear();
      const errs = [];
      let e1 = call('effMaxHp',     () => __BF3.effMaxHp(p));           if(e1) errs.push(e1);
      let e2 = call('effPower',     () => __BF3.effPower && __BF3.effPower(p));
      if(e2) errs.push(e2);
      const before = p.hp;
      let e3 = call('hurtPlayer',   () => __BF3.hurtPlayer(60, p.x, p.z + 120, null)); if(e3) errs.push(e3);
      const dealt = before - p.hp;
      clear();
      let e4 = call('playerAttack', () => __BF3.playerAttack && __BF3.playerAttack()); if(e4) errs.push(e4);
      let e5 = call('update',       () => { for(let k = 0; k < 6; k++) __BF3.update(1/60); }); if(e5) errs.push(e5);

      const row = { cls: cid, rank: rank, id: pid, n: pname, dealt: dealt,
                    errs: errs, weapon: weaponNote };
      rows.push(row);
      /* A THROW is the verdict. A zero is only a QUESTION, and conflating them would make this
         report bugs it has not found - the ninja dodges a share of hits at random (11200), and any
         passive that legitimately turns a hit aside reads the same as one that crashed. Reported
         separately so a zero is looked at rather than accused. Per docs/VISION.md: missing data is
         not a negative finding. */
      if(errs.length) throwsFound.push(row);
      else if(dealt <= 0) zeroDealt.push(row);

      cs.ch[rank] = savedCh[rank];
    }
    cs.ch = savedCh;
  }

  return JSON.stringify({
    ok: throwsFound.length === 0,
    classes: CLASSES.length, picks: picks,
    broken: throwsFound.length, brokenRows: throwsFound.slice(0, 24),
    zero: zeroDealt.length, zeroRows: zeroDealt.slice(0, 12),
  });
})()
