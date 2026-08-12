/* DOES THE NECROMANCER'S HARVEST EVER LEAVE A CORPSE YOU CAN RAISE?

   CLASS_BASIC.necromancer (index.html:11393) is the class's whole basic-attack identity, and its own
   comment states the promise: "Every basic hit builds toward a corpse: at five, the target drops one
   whether it dies or not. A Necromancer should never be short of bodies, and waiting for kills made
   the class worst exactly when it was losing."

   It counts to five correctly, it pushes a corpse, and it announces one to the player - `addText(...
   'CORPSE' ...)` on the next line. Then it pushes it with `t: 0`, and `minionUpdate` (11694) does
   `c.t -= dt` and keeps only `c.t > 0`, so the body is filtered out of G.corpses on the very next
   frame. The kill path three hundred lines up (11024) pushes the same object with `t: 3.5`.

   So the game says CORPSE and there is no corpse. This is the same shape as section H's Unseen: a
   mechanic that exists, is described, is read - and is gated on something that never survives.

   This probe is the measurement, not the reading. It fails against the shipped game.

   NOTHING IS INVENTED. The only number under test is 3.5 seconds, which is the corpse lifetime this
   same feature already uses for a corpse left by a kill (11024), and the threshold of five is the
   hook's own.

   THE BAR IS A RISEN FIGHTER, not a corpse count. Raise the Dead is what the card sells a corpse
   FOR ("Turn the nearest fresh corpse into a stronger risen fighter", r4 a), and this sub-project
   has twice been burned measuring what the code sets rather than what the player is promised - see
   pass 15 (Burning Light lit exactly the right enemy and burned nothing). A corpse that cannot be
   raised is not a corpse. The count is carried alongside as a diagnostic only.

   THREE HALVES IN ONE LAUNCH, the third a permanent known-bad carried in the probe rather than
   produced by breaking the repo (the rule level.probe.js's ?breakgap and mp.probe.js's ?heroslot
   follow):
     - `live`  - the game's own hook, its own update loop, its own Raise the Dead.
     - `live2` - the identical half run a second time. Corpse decay is a clock and the raise is a
                 nearest-search; a one-shot green could be a lucky frame, and this costs nothing.
     - `inert` - identical, except every corpse the harvest hook adds has its `t` set straight back
                 to 0, which is exactly the shipped line. `okAgainstInert` is therefore what this
                 probe would report against the unfixed game and MUST be false while `ok` is true.

   THREE TRIALS PER HALF, one per clause and two that must behave the same in every half:
     - `harvest` - five basic hits on a dummy that never dies, then a quarter second of the game's
                   own ticks so the decay filter definitely runs, then Raise the Dead. The promise.
     - `four`    - four hits, not five. "At five" is half the sentence: a hook that dropped a body on
                   every swing would clear a one-trial bar and would be a different, stronger card
                   than the one the class was designed around. Must find no corpse in ANY half.

   AND THE BAR IS THE GAME'S OWN DISCRIMINATOR, not a number this probe chose. `SKILL_FX.necro_raise`
   (11732) raises ONE risen fighter off the nearest corpse and, finding none, falls back to TWO
   weaker ones (11735). So `risen === 1` means a real corpse was consumed and `risen === 2` means the
   cast ran and found nothing - which is why the four-hit control asserts 2 rather than 0. A plain
   "did any minion appear" bar would have gone green against the shipped game on the fallback alone.
     - `kill`    - a corpse from the game's own death path (11024, t:3.5), raised the same way. This
                   is the bench-liveness check: without it the control's zeros could equally mean the
                   bench cannot observe a raise at all. Must raise in EVERY half, inert included -
                   the inert half only touches corpses the harvest hook added. */
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
  __BF3.meta.classId = 'necromancer';
  __BF3.meta.camMode = 'far';

  /* Through the game's own classStartWeapon, because every basic-attack hook is handed
     classFamilyOk(p.weapon) and a great many of them gate their defining half on it - the fault this
     sub-project's Task 1 found in the skill bench, where eleven of sixteen classes were off-class. */
  let weaponNote = 'none';
  (function(){
    const tries = ['necromancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  /* THE TWO-LIST CHECK, inside the probe rather than in a command nobody re-runs. useSkill(i) casts
     c2CurSkills()[i], which is NOT curSkills()[i] - the mismatch that invalidated every verdict this
     suite had ever produced (faf52c3). Slot 1 must really be Raise the Dead here or the whole
     measurement is about some other skill. */
  const casts = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : []).map(s => s && s.n);
  const RAISE = 1;
  const castsRaise = /raise/i.test(String(casts[RAISE] || ''));

  const HOME = { x: p.x, z: p.z };

  const tick = (secs) => {
    const n = Math.round(secs * 60);
    for(let k = 0; k < n; k++){
      G.enemies.length = 0;
      try { __BF3.update(1/60); } catch(e){}
    }
  };

  /* One connecting basic hit through the game's own damage door. hitEnemy is what calls CLASS_BASIC
     (10854), and only for an UNDESIGNATED hit from the player - so this is the real path and not an
     imitation of it. */
  const swing = (foe, lethal) => {
    G._desig = false;
    try { __BF3.hitEnemy(foe, lethal ? (foe.hp + 9999) : 5, p, 0, 0, null); } catch(e){ return String(e && e.message || e); }
    return null;
  };

  const freshFoe = () => {
    G.enemies.length = 0;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z + 60);
    if(foe){ foe.active = true; foe.dead = false; foe.hp = foe.maxHp = 100000; foe.vx = 0; foe.vz = 0; }
    return foe;
  };

  /* Cast Raise the Dead through useSkill, the door the player uses, and report what the game did
     with the minion list rather than what the handler was asked to do. */
  const raise = () => {
    G.minions = G.minions || []; G.minions.length = 0;
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) p.skillCd[RAISE] = 0;
    let threw = null;
    try { __BF3.useSkill(RAISE); } catch(e){ threw = String(e && e.message || e); }
    return { risen: (G.minions || []).length, threw: threw };
  };

  const trial = (hits, lethal, pin) => {
    p.x = HOME.x; p.z = HOME.z; p.vx = 0; p.vz = 0;
    p.hp = p.hpm || p.hpMax || p.hp;
    p._harv = 0;
    G.corpses = [];
    let threw = null;
    for(let k = 0; k < hits; k++){
      const foe = freshFoe();
      if(!foe) return { why:'no target could be spawned' };
      const e = swing(foe, lethal);
      if(e && !threw) threw = e;
      /* THE KNOWN-BAD, and it is the shipped line verbatim: a corpse the harvest hook adds carries
         t = 0. Skipped on a lethal swing, and that is not a detail: the first version pinned every
         corpse in the list, which in the kill trial is the DEATH path's corpse - so the inert half
         zeroed its own liveness control and reported `kill.risen 2` (measured, before-run). The
         shipped bug is in the harvest push alone and the known-bad must be too. */
      if(pin && !lethal) for(const c of (G.corpses || [])) c.t = 0;
    }
    const added = (G.corpses || []).length;
    tick(0.25);                                  // the decay filter runs every frame inside update
    const survived = (G.corpses || []).length;
    const r = raise();
    return { hits: hits, harv: p._harv || 0, added: added, survived: survived,
             risen: r.risen, threw: threw || r.threw };
  };

  const half = (pin) => ({
    pinned: !!pin,
    harvest: trial(5, false, pin),
    four:    trial(4, false, pin),
    kill:    trial(1, true,  pin),   // the death path's own corpse (11024), never touched by `pin`
  });

  const live  = half(false);
  const live2 = half(false);
  const inert = half(true);          // the shipped state: the harvest corpse is dead on arrival

  /* Clean-checks, so a zero can only ever mean "no corpse to raise" and never "the bench could not
     look": nothing threw anywhere, slot 1 really is Raise the Dead, the hook really did count to
     five (and to four), and a corpse from a KILL is raisable in every half. */
  const clean = (h) => !h.harvest.threw && !h.four.threw && !h.kill.threw
                    && h.harvest.harv === 0 && h.four.harv === 4
                    && h.kill.risen === 1;
  const allClean = castsRaise && [live, live2, inert].every(clean);

  /* Four swings must leave nothing to raise, in every half - and the cast must still have RUN,
     which its own corpseless fallback of two weaker minions is the proof of. */
  const controlHeld = [live, live2, inert].every(h => h.four.added === 0 && h.four.risen === 2);

  const bar = (h) => h.harvest.added === 1 && h.harvest.survived === 1 && h.harvest.risen === 1;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(live) && bar(live2)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld, castsRaise: castsRaise,
    casts: casts,
    clean: { live: clean(live), live2: clean(live2), inert: clean(inert) },
    live: live, live2: live2, inert: inert,
    weapon: (p.weapon || {}).name, weaponNote: weaponNote,
  });
})()
