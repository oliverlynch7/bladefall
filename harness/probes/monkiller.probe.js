/* DOES KILLER FOCUS (THE PASSIVE) DO ANYTHING AT ALL?

   Monk rank-7 option b (index.html:2170) reads: "The first strike after a dodge hits for triple."
   `harness/audit-passives.js` says the id `mon_killer` appears exactly twice in the whole of public/ —
   in CLASS2 where it is defined and in PASSIVE_ART where its icon is named — and nowhere else. It is
   one of the 41 in docs/SKILL_TRIAGE.md section E.

   NOTHING HERE IS INVENTED. The multiplier is written on the card ("triple"), the event is the
   player's own dodge, and the two halves of the mechanism already exist twenty lines apart in the
   file: `w_tactical` (warrior, Tactical Retreat) is set at the dodge itself — `if(meta.classId===
   'warrior'&&c2Passive('w_tactical'))p.tacticalT=2` (12702) — and read later in hurtPlayer. Killer
   Focus is that same shape mirrored onto the DEALING side, where `CLASS_BASIC.monk` already sits.

   Driven through the game's own systems at both ends, which is the whole point:
   - the dodge is a real dodge. The probe sets `input.dodgeEdge` and runs a frame of `update()`, so
     the game's own dodge branch (12701) decides whether a dodge happened. It never assigns the flag
     the passive reads — a probe that set that itself would be asserting on something it wrote, which
     is the fault Task 5 of the harness plan records as passing forever against the very bug it
     existed to catch. Both trials assert `dodged`, read off the game's own cooldown moving, so a 1x
     reading can never be a dodge that silently never happened.
   - the strike goes through `hitEnemy`, which is where `CLASS_BASIC[meta.classId]` is dispatched from
     (10670). Calling the hook directly would measure the probe's own copy.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only difference
   between the halves is which passive is chosen. `mon_med` (Meditation) is the control: it is the
   a-side of this very rank, it is wired, and it is a slow self-heal with nothing to do with damage —
   so a control that stays at 1x says the multiplier is the PASSIVE and not the dodge.

   TWO STRIKES PER TRIAL, because "the FIRST strike after a dodge" is half the sentence. A passive
   that tripled every strike would satisfy a naive one-hit bar and would be a different, worse bug.
   The second strike must come back to the control's number.

   The assertion is the RATIO against the control, never an absolute: the monk's damage sits behind
   weapon rolls, power and the rank-10 capstone, so a hard-coded expected number would be a balance
   assertion wearing a correctness assertion's clothes.

   `G.combo` IS PINNED BEFORE EVERY STRIKE, and finding out why cost the first run of this probe.
   Its four strikes came back 112, 113, 113, 114 — creeping by one, in sequence, across both halves.
   That is `hitEnemy` itself: line 10632 does `dmg = round(dmg * mod * (1 + min(0.2, G.combo*0.004)))`
   and line 10631 increments `G.combo` on every hit that passes through. So **no two strikes in a
   sequence are measured under the same multiplier unless the counter is reset**, and an
   equality assertion between them can never hold. Worth carrying to any future damage probe: this is
   global, not a monk mechanic, and it drifts silently in exactly the direction that makes a bonus
   look real. Reset here rather than tolerated, so the ratio the card promises can be asserted exactly.

   Known-bad: watched to fail against the shipped game — ratio 1.009 on both strikes of both halves,
   which is the combo drift alone and not the passive, because nothing reads the id. */
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
  __BF3.meta.classId = 'monk';

  /* The Arena hands out its own loadout, which is usually off-class. Equip through the game's own
     starter table: the bench's rule is to stand where the game would let you stand, and the game
     hard-blocks an off-class weapon (13220). */
  let weaponNote = 'none';
  (function(){
    const tries = ['monk'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('monk');
  cs.ch = cs.ch || {};

  const BASE = 100;

  const trial = (pick) => {
    cs.ch[7] = pick;

    /* No enemies during the dodge frame, so nothing can hit back and knock the player out of the
       state under test. The target is spawned AFTER the dodge for the same reason. */
    G.enemies.length = 0;
    p.hp = __BF3.effMaxHp(p);
    p.dead = false; p.downed = false;

    /* A REAL dodge: the game's own branch at 12701 requires the cooldown to be clear and consumes
       the input edge itself. */
    p.dodgeCdT = 0; p.dodgeTimer = 0;
    IN.dodgeEdge = true;
    let threw = null;
    try { __BF3.update(1/60); } catch(e){ threw = String(e && e.message || e); }
    const dodged = (p.dodgeCdT || 0) > 0 || (p.dodgeTimer || 0) > 0;

    const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 70);
    if(!foe) return { pick: pick, dodged: dodged, why: 'no target could be spawned', threw: threw };
    foe.active = true; foe.hp = foe.maxHp = 100000;

    /* Two strikes, back to back, no ticks between them - so nothing can re-arm the bonus and make a
       permanently-tripling passive look like a first-strike one. G.combo is pinned before each so
       every strike in this probe is measured under the identical multiplier (see the header). */
    const strike = () => {
      G.combo = 0; G.comboT = 0;
      const b = foe.hp;
      try { __BF3.hitEnemy(foe, BASE, p, 0, 0, null); } catch(e){ threw = threw || String(e && e.message || e); }
      return b - foe.hp;
    };
    const h1 = strike();
    const h2 = strike();

    return { pick: pick, dodged: dodged, first: h1, second: h2, threw: threw };
  };

  const control = trial('mon_med');           // the a-side of the same rank: wired, a slow heal, nothing to do with damage
  const killer  = trial('mon_killer');

  const rFirst  = control.first  ? killer.first  / control.first  : null;
  const rSecond = control.second ? killer.second / control.second : null;

  return JSON.stringify({
    ok: !!(control.dodged && killer.dodged                       // both halves really dodged
           && control.first > 0 && control.second > 0
           && control.first === control.second                   // the control never spikes
           && rFirst != null && Math.abs(rFirst - 3) < 0.001     // triple, as the card says
           && rSecond != null && Math.abs(rSecond - 1) < 0.001   // and only the FIRST strike
           && !control.threw && !killer.threw),
    base: BASE, control: control, killer: killer,
    ratioFirst: rFirst == null ? null : Math.round(rFirst * 1000) / 1000,
    ratioSecond: rSecond == null ? null : Math.round(rSecond * 1000) / 1000,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
