/* DOES HASTE RESET ANYTHING?

   Chronomancer rank-3 option B, `chr_haste`: "Rewinding resets every skill cooldown."

   This one is NOT in the dead-46. The wiring audit finds `chr_haste` mentioned twice — in
   `effCdr` (a flat +10% cooldown reduction) and in the Rewind block — so it counts as wired and
   always has. It is the first concrete instance of the caveat that audit ships with: **WIRED is
   not CORRECT.** The Rewind half writes `p.cds[i]`, and `p.cds` appears exactly ONCE in the whole
   file, at that line. Nothing ever creates it. The player's cooldown array is `p.skillCd`
   everywhere else in the game, so `p.cds && (p.cds[i]=0)` short-circuits on undefined every time —
   silently, which is why it survived: the guard that was there to be safe is what hid it.

   The measurement drives the game's own death-and-rewind path (`hurtPlayer`, exported for the
   harness next to the MP render exports) rather than calling the block directly, because the
   question is what happens when a Chronomancer actually dies.

   Two trials in ONE launch, identical but for the rank-3 choice:

     A  chr_haste    the subject. Every cooldown must be 0 after the Rewind.
     B  chr_potent   the other rank-3 option, carried permanently as the control. Its cooldowns
                     must SURVIVE the Rewind — otherwise something else is clearing them and this
                     probe would report Haste as fixed no matter what the code said.

   Both trials also assert the Rewind FIRED (hp back above zero, _rewUsed spent). A rewind that
   never happened leaves cooldowns untouched too, and that failure must not be readable as "Haste
   is broken".

   Watched to fail: against the unfixed game trial A comes back with all four cooldowns still
   running, exactly like the control. */
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
  if(!__BF3.hurtPlayer) return JSON.stringify({ ok:false, why:'hurtPlayer is not exported — cannot drive the death path' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();

  function trial(pick){
    __BF3.meta.classId = 'chronomancer';
    const cs = __BF3.classState('chronomancer');
    cs.ch = cs.ch || {};
    cs.ch[3] = pick;

    /* The Rewind reads p._rew[0], a ring the game fills from update() every 0.25s. Let it fill
       itself rather than hand-writing a snapshot: a probe that authors the history it then rewinds
       into is testing its own arithmetic. */
    p._rew = []; p._rewT = 0;
    G._rewUsed = 0;
    p.dead = false; p.downed = false; p.invuln = 0; p.dodgeTimer = 0;
    p.hp = Math.max(2, Math.round((p.maxHp || 100) * 0.5));
    for(let k = 0; k < 90; k++){ try { __BF3.update(1/60); } catch(e){} }   // 1.5s — six samples
    const history = (p._rew || []).length;

    /* Put the bar on cooldown through the game's own caster, so the numbers under test are the
       ones useSkill writes. Anything it will not cast is topped up by hand and reported. */
    p.mana = p.maxMana || 999;
    for(let i = 0; i < 4; i++){
      if(p.skillCd) p.skillCd[i] = 0;
      try { __BF3.useSkill(i); } catch(e){}
    }
    const cast = (p.skillCd || []).slice(0, 4).map(v => Math.round((v || 0) * 100) / 100);
    for(let i = 0; i < 4; i++) if(p.skillCd && !(p.skillCd[i] > 0)) p.skillCd[i] = 6;
    const before = (p.skillCd || []).slice(0, 4).map(v => Math.round((v || 0) * 100) / 100);

    const hpBefore = p.hp;
    p.invuln = 0; p.dodgeTimer = 0;
    try { __BF3.hurtPlayer(hpBefore + 500, p.x, p.z + 40, null); } catch(e){
      return { pick, threw: String(e && e.message || e) };
    }
    const after = (p.skillCd || []).slice(0, 4).map(v => Math.round((v || 0) * 100) / 100);

    return {
      pick: pick, history: history, castCds: cast, before: before, after: after,
      rewound: !p.dead && p.hp > 0 && (G._rewUsed || 0) > 0,
      rewUsed: G._rewUsed || 0, hpAfter: Math.round(p.hp), hpBefore: Math.round(hpBefore),
      allClear: after.every(v => v === 0), anyRunning: after.some(v => v > 0),
    };
  }

  const A = trial('chr_haste');
  const B = trial('chr_potent');

  const bothRewound = !!A.rewound && !!B.rewound;
  const hasteClears = !!A.allClear;
  const controlKeeps = !!B.anyRunning;

  return JSON.stringify({
    ok: bothRewound && hasteClears && controlKeeps,
    bothRewound: bothRewound, hasteClears: hasteClears, controlKeepsItsCooldowns: controlKeeps,
    trials: { A_haste: A, B_control: B },
  });
})()
