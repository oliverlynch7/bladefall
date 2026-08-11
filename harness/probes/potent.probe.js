/* DOES POTENT DO ANYTHING AT ALL?

   Chronomancer rank-3 option a (index.html:2154) reads: "Rewinding also restores the mana you had
   three seconds ago." `harness/audit-passives.js` says the id `chr_potent` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else, so nothing in the game has ever consulted it. It is one of the 42 in
   docs/SKILL_TRIAGE.md section E.

   The audit is STATIC and proves WIRED, not CORRECT. This is the other half: it fills the
   chronomancer's own three-second ring by TICKING THE GAME, spends the mana, drives the game's own
   `hurtPlayer` with a killing blow, and reads what the Rewind gave back.

   NO NUMBER IS INVENTED, which is why this row was taken. The rewind already restores your POSITION
   and your HEALTH from a sample the game takes four times a second (index.html:12583); "the mana you
   had three seconds ago" is the mana that went with them. The fix adds one field to that sample and
   one line beside `chr_haste` - the sibling option at the SAME rank, which resets cooldowns on the
   very line above.

   A/B IN ONE LAUNCH, which is the only shape that means anything. The comparison is between the two
   options at the same rank in the same game: with the b-side `chr_haste` picked the mana must stay
   spent, with `chr_potent` it must come back to what the ring holds. Two separate runs could differ
   for any reason at all; one run differing only in which passive is picked cannot.

   THE ASSERTION IS AGAINST THE RING, NOT AGAINST A NUMBER THIS FILE CHOSE. `sampled` is read off
   `p._rew[0]` - the game's own oldest sample - so the bar is "you got back exactly what the game
   recorded", and it stays true the day the sample rate or the ring length is retuned. A bare "mana
   went up" bar would also pass for a passive that refilled you to full, which is a different and much
   stronger promise than the card makes.

   BOTH TRIALS MUST REWIND, and that is checked rather than assumed: if the ring were empty the
   killing blow would simply kill, and "mana did not come back" would be true for the most boring
   possible reason. `rewound` is read from the game's own `G._rewUsed` counter moving.

   Known-bad: `?nopotent=1` disables the restore permanently in game code, so this probe can be
   watched to fail without editing the repo. Against it `potent` reads exactly like `control`.
   Watched to fail that way before the fix was believed. */
(function(){
  const G = __BF3.G, p = G.p, up = __BF3.update;

  /* Arrive in PLAY. Roughly one launch in six lands paused; the game's own resume door is the idiom
     test-skills.js, thickhide.probe.js and stward.probe.js all use. This probe needs real ticks -
     the ring is filled by update() and by nothing else - so a paused bench would measure an empty
     ring and report a false zero for both halves. */
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

  /* hurtPlayer returns before every death save when G.hub is set - the Waystation is a sanctuary and
     converts a killing blow to half HP. A probe run there would never reach the Rewind at all. The
     ring is not even recorded in the hub (index.html:12579 guards on !G.hub). */
  if(G.hub) return JSON.stringify({ ok:false, why:'in the hub, where nothing can kill you and the ring is not recorded' });
  if(!G.arena) return JSON.stringify({ ok:false, why:'not in the Arena - death would not be recoverable' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'chronomancer';

  const cs = __BF3.classState('chronomancer');
  cs.ch = cs.ch || {};
  /* Pin rank 5 to the a-side. The b-side is `chr_glass`, "you may Rewind twice per area instead of
     once", which changes the counter this probe reads `rewound` from. Every trial resets the counter
     itself, so pinning is belt and braces rather than the mechanism. */
  cs.ch[5] = 'chr_ward';

  const score = () => { G.arenaScore = G.arenaScore || { p:0, b:0 }; return G.arenaScore.b | 0; };
  const maxHp = () => Math.round(__BF3.effMaxHp(p));

  /* Ticks with the arena emptied and the player untouchable, so an Arena bot cannot land a hit
     mid-fill and spend the Rewind before the trial's own killing blow does. */
  const quietTicks = (n) => { for(let i = 0; i < n; i++){ G.enemies.length = 0; p.invuln = 999; up(1/60); } };

  const trial = (pick) => {
    cs.ch[3] = pick;
    G.enemies.length = 0;
    p.dead = false; p.downed = false;
    /* Protection is zeroed rather than trusted: shieldHp, guardT and reflectT each have their own
       early return in hurtPlayer, and any one left over from the previous trial would stop the blow
       before the Rewind ever ran. */
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0; p.reflectT = 0;
    p._rew = []; p._rewT = 0;
    G._rewUsed = 0;

    const mm = p.maxMana || 100;
    p.hp = maxHp();
    p.mana = mm;
    quietTicks(75);                         // ~1.25s: five samples taken at full mana
    const s0 = p._rew[0] || {};
    p.mana = Math.round(mm * 0.1);          // you spent it on the three seconds that killed you
    quietTicks(24);                         // ~0.4s more, so the ring's LATER samples hold the low value

    p.hp = Math.max(1, Math.round(maxHp() * 0.25));
    p.invuln = 0; p.dodgeTimer = 0;
    const manaBefore = Math.round(p.mana), used0 = G._rewUsed | 0, d0 = score();
    let threw = null;
    try { __BF3.hurtPlayer(maxHp() * 10, p.x, p.z + 120, null); }
    catch(e){ threw = String(e && e.message || e); }

    return { pick: pick, samples: p._rew.length, sampled: s0.mana == null ? null : Math.round(s0.mana),
             maxMana: mm, manaBefore: manaBefore, manaAfter: Math.round(p.mana),
             rewound: (G._rewUsed | 0) > used0, died: score() > d0, hpAfter: Math.round(p.hp),
             threw: threw };
  };

  const control = trial('chr_haste');       // the b-side of the same rank: wired, and not about mana
  const potent  = trial('chr_potent');

  /* `samples` is reported and asserted on because it is the one way this probe can be vacuously
     green: a ring the fill loop failed to write would hand both halves a null and the two would agree
     for a reason that has nothing to do with the passive. It is read AFTER the blow, when a
     successful Rewind has already emptied it, so the count that matters is the control's - the
     assertion below only requires that the game recorded something at all. */
  return JSON.stringify({
    ok: control.rewound && potent.rewound
        && !control.died && !potent.died
        && !control.threw && !potent.threw
        && potent.sampled != null
        && control.manaAfter === control.manaBefore
        && potent.manaAfter === potent.sampled
        && potent.manaAfter > potent.manaBefore + potent.maxMana * 0.5,
    control: control, potent: potent,
    noPotentFlag: /[?&]nopotent=1/.test(location.search),
    at: G.areaName || null,
  });
})()
