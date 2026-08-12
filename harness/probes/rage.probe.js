/* CAN A RAGING BERSERKER STILL BE HEALED?

   Berserker rank-7 option a (index.html:2134) reads: "Below a quarter health you cannot be healed,
   and your damage doubles." `bsk_rage` IS read, so `harness/audit-passives.js` calls it wired and is
   right - but its ONE reader is the doubling (CLASS_BASIC.berserker, 11390). Nothing in the file
   ever declined a heal. That is docs/SKILL_TRIAGE.md section Q's shape, with the twist that makes
   this row takeable at all: the half that shipped is the UPSIDE, so picking Rage over the card it is
   offered against (Frenzy) was a strict upgrade with its printed cost missing. Pass 20 (Heavy Hands,
   "you cannot dodge") set the rule this follows: a card with a drawback has to be wired on both
   sides or it is a different and better card than the menu shows.

   NOTHING IS INVENTED. Both halves of the sentence are booleans and the threshold is the doubling's
   OWN expression - the card names one quarter and means it once, so healBlocked() reads the same
   `p.hp / effMaxHp(p) < 0.25` the multiplier already read.

   THE HEAL IS DELIVERED BY THE GAME, NEVER BY THE PROBE. A healing spring is pushed into G.springs
   as a plain `{x,z,y,used:false}` and the game's own update step (13305) decides whether to fire it.
   The probe never calls healPlayer, healBlocked, or applyArenaPickup - calling the door would prove
   the door swings, which is sub-project A Task 5's fault in a new costume. It assigns p.hp only to
   STAGE each trial's starting health, which is the input; the heal is the output and it is the
   game's.

   TWO TRIALS PER HALF plus a drift window, because "below a quarter" is half the sentence:
     - high: staged at 60% health. A heal MUST land, in every half. A lock that fired at any health
       would clear a low-only bar and would be a far worse card than the one printed.
     - low:  staged at 10% health. A heal must land in the control and the known-bad and must NOT
       land in the Rage half.
     - drift: the identical ticks at 10% health with NO spring in the world, so the low trial's zero
       is a real zero and not a bench that healed nobody anyway. Section E's own correction: the
       noise floor of this game is made of a class's unprompted passive healing.

   AND THE UPSIDE IS MEASURED IN THE SAME LAUNCH, because a fix to one half of a sentence that
   quietly broke the other half would still read as green here. Each half also lands one 20-damage
   hit at 10% health and one at 60%, through hitEnemy with G._desig false, which is the door
   CLASS_BASIC is applied behind (10938). The Rage half must deal exactly twice the control's at 10%
   and exactly the same as the control's at 60% - so the doubling is proven to be both present and
   still conditional.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   puts `mon_iron` - a passive docs/SKILL_TRIAGE.md section E still lists as dead, and belonging to
   another class - into the same rank slot. c2Passive is a plain id lookup over ranks 3/5/7/9, so any
   id nothing reads reproduces exactly the state the shipped game was in here. `okAgainstInert` is
   what this probe would report against the unfixed game, and it must be false while `ok` is true. */
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
  __BF3.meta.classId = 'berserker';

  /* Off-class casting was fault 1 of this sub-project's bench repairs, and the berserker is one of
     the three classes docs/SKILL_TRIAGE.md section D records as unable to equip its own starter. */
  let weaponNote = 'none';
  (function(){
    const tries = ['berserker'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned so that nothing except the rank under test can add or refuse
     health. bsk_blood (r5 b, "kills heal you below half health") is deliberately NOT picked - it is
     the one other berserker card that heals. bsk_thick assigns p.hp=1 on a killing blow and never
     adds, so it cannot heal. bsk_brutal (r9 b) is avoided because it kills anything under a quarter
     and the damage trials use a live body. */
  cs.ch[3] = 'bsk_heavy';
  cs.ch[5] = 'bsk_thick';
  cs.ch[9] = 'bsk_tough';

  const MAX  = () => __BF3.effMaxHp(p);
  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };

  const stage = (frac) => {
    G.enemies.length = 0; G.springs.length = 0;
    p.dead = false; p.downed = false; p.invuln = 9;      // nothing may hurt the body mid-trial
    p.vx = 0; p.vy = 0; p.vz = 0; p.onGround = true;
    p.hp = Math.max(1, Math.round(MAX() * frac));
  };

  /* One heal trial. `spring` false is the drift window: identical ticks, nothing in the world to
     heal you, so a gain of 0 in the low trial can be told apart from a bench that never healed. */
  const healTrial = (frac, spring) => {
    stage(frac);
    if(spring) G.springs.push({ x:p.x, z:p.z, y:p.y || 0, used:false });
    const before = p.hp;
    let threw = null;
    try { tick(4); } catch(e){ threw = String(e && e.message || e); }
    return {
      frac: frac, spring: !!spring, threw: threw,
      before: Math.round(before), after: Math.round(p.hp),
      gained: Math.round(p.hp - before),
      spent: spring ? !!(G.springs[0] && G.springs[0].used) : null,
    };
  };

  /* One damage trial, at the same staged health. G._desig false is what routes a hit through
     CLASS_BASIC (10938), which is where the doubling lives. */
  const dmgTrial = (frac) => {
    stage(frac);
    const t = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
    if(!t) return { frac: frac, why: 'body could not be spawned' };
    t.active = true; t.dummy = false; t.elite = false; t.boss = false;
    t.speed = 0; t.dropT = 0; t.hp = t.maxHp = 100000;
    const hp0 = t.hp;
    G._desig = false;
    let threw = null;
    try { __BF3.hitEnemy(t, 20, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    return { frac: frac, dealt: Math.round(hp0 - t.hp), threw: threw };
  };

  const half = (pick) => {
    cs.ch[7] = pick;
    return {
      pick: pick,
      high:  healTrial(0.60, true),
      low:   healTrial(0.10, true),
      drift: healTrial(0.10, false),
      dmgLow:  dmgTrial(0.10),
      dmgHigh: dmgTrial(0.60),
    };
  };

  const control = half('bsk_frenzy');   // the b-side of this very rank: wired, and heals nobody
  const rage    = half('bsk_rage');
  const inert   = half('mon_iron');     // an id nothing reads — the permanent known-bad

  /* A half is readable only if its bench worked: the 60% heal landed, the drift window moved
     nothing, nothing threw, and both damage trials drew blood. */
  const clean = (h) => !h.high.threw && !h.low.threw && !h.drift.threw
                    && !h.dmgLow.threw && !h.dmgHigh.threw
                    && h.high.gained > 0 && h.drift.gained === 0
                    && h.dmgLow.dealt > 0 && h.dmgHigh.dealt > 0;
  const allClean = [control, rage, inert].every(clean);

  /* The bar, one clause per clause of the card.
     - below a quarter you cannot be healed: nothing lands, and the spring is not spent for nothing
     - ABOVE a quarter you can: the lock is a condition and not an off switch
     - your damage doubles, still, and still only below a quarter */
  const ratio = (h) => (control.dmgLow.dealt > 0) ? (h.dmgLow.dealt / control.dmgLow.dealt) : 0;
  const bar = (h) => h.low.gained === 0 && h.low.spent === false && h.high.gained > 0;
  /* The doubling is asserted with a tolerance of ONE POINT, not as an exact ratio, because the game
     rounds a hit once at 10946 before it is applied: the first run of this probe measured 40 against
     79 - 1.975, not 2 - and 79 is what 39.75 doubled and rounded once comes to. A ratio bar tight
     enough to be meaningful would have failed the working fix on arithmetic the fix does not touch. */
  const upsideHeld = Math.abs(rage.dmgLow.dealt - control.dmgLow.dealt * 2) <= 1
                  && rage.dmgHigh.dealt === control.dmgHigh.dealt;
  const controlHeld = control.low.gained > 0 && control.high.gained > 0
                   && Math.abs(ratio(control) - 1) < 0.02;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && upsideHeld && bar(rage)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld, upsideHeld: upsideHeld,
    ratioRage: Math.round(ratio(rage) * 1000) / 1000,
    ratioInert: Math.round(ratio(inert) * 1000) / 1000,
    control: control, rage: rage, inert: inert,
    maxHp: Math.round(MAX()), weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
