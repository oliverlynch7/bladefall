/* DOES THE NINJA'S UNSEEN EVER ARM BY STANDING STILL?

   CLASS_BASIC.ninja (index.html:11310) is the Ninja's whole basic-attack identity, and its own
   comment states the promise: "Stand still for a moment and your next attack lands from BEHIND the
   target - a melee class with repositioning built into its ordinary attack rather than into a
   cooldown." Two of the class's passive cards are written ABOUT it - `nin_swift` (r3 a, "Unseen
   rearms in half the time - strike from behind twice as often") and `nin_combo` (r5 b, "Killing
   with Unseen instantly rearms it") - so the audit in harness/audit-passives.js calls both of them
   WIRED. They are. They are wired to a clock that does not run.

   The gate is `p._stillT` (11314). It is accumulated in exactly ONE place in the whole file,
   class2Innate (10045), and that line is inside `if(meta.classId==='mage')` - the mage needs it for
   `m_temporal`. So for a Ninja the clock never advances, and the only two lines that ever set it are
   the Vanish skill (19233) and Combo Edge (10930), which needs an Unseen strike to have landed
   first and is therefore circular. Standing still has never armed anything.

   This probe is the measurement, not the reading. It fails against the shipped game.

   NOTHING IS INVENTED. Every threshold under test is already in the file: 1 second, or 0.5 with
   Swift (11314), and the arm sentinel 9 is Vanish's own line verbatim.

   THREE HALVES IN ONE LAUNCH, and the third is a permanent known-bad carried in the probe rather
   than produced by breaking the repo (the same rule level.probe.js's ?breakgap and mp.probe.js's
   ?heroslot follow):
     - `live`  - the game's own update loop, rank 3 pinned to `nin_deadly`, so Swift is NOT held.
     - `swift` - the same, rank 3 pinned to `nin_swift`. Its only job is the 0.7s trial below.
     - `inert` - identical, except `_stillT` is zeroed after every tick, which is exactly the state
                 the mage-gated accumulator leaves a Ninja in. `okAgainstInert` is therefore what
                 this probe would report against the unfixed game and MUST be false while `ok` is
                 true.

   FOUR TRIALS PER HALF, one per clause and two that must NOT fire:
     - `still`  - 1.2s of the game's own ticks with no input, then a hit. The promise. Must fire in
                  both live halves and in neither of the others.
     - `short`  - 0.7s: past Swift's 0.5 and short of the base 1. Must fire ONLY in the swift half.
                  Without it "the clock runs" and "the clock runs at the rate the card states" are
                  the same measurement, and Swift - a passive that has never been able to do
                  anything - would stay unproven.
     - `moving` - 1.2s of ticks spent WALKING, then a hit. A wiring that repositioned on every hit
                  would satisfy a one-trial bar and would be a strictly different, strictly better
                  card than the menu shows. Must fire in NO half.
     - `armed`  - `p._stillT = 9`, Vanish's own arming line, then a hit. Must fire in EVERY half.
                  This is the bench-liveness check: without it the control's zeros could just as
                  well be a bench that cannot observe an Unseen strike at all.

   THE BAR IS WHERE THE BODY ENDED UP, not a flag. Unseen sets p.x/p.z to `e.r+26` on the far side
   of the target (11322), so "it fired" is measured as: the hero moved, and the vector from the foe
   to the hero REVERSED - a negative dot product against where it started. A flag would have gone
   green for a wiring that set the field and never moved anyone, which is the shape pass 15
   (Burning Light) was caught by. */
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
  __BF3.meta.classId = 'ninja';
  /* World-space steering, so the walking trial walks in world space rather than relative to a
     camera the bench never turns - the same line level.probe.js sets for the same reason. */
  __BF3.meta.camMode = 'far';

  /* Through the game's own classStartWeapon, because useSkill and every basic-attack hook are
     handed classFamilyOk(p.weapon) and a great many of them gate their defining half on it - the
     fault this sub-project's Task 1 found in the skill bench, where eleven of sixteen classes were
     being measured off-class. */
  let weaponNote = 'none';
  (function(){
    const tries = ['ninja'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('ninja');
  cs.ch = cs.ch || {};
  /* Ranks 5/7/9 are pinned to options that cannot arm or reposition anything, so the only thing
     under test at rank 3 is the clock's rate. nin_combo is deliberately NOT picked: it arms Unseen
     from a kill, and nothing here is allowed to arm it except standing still. */
  cs.ch[5] = 'nin_evasive';
  cs.ch[7] = 'nin_bleed';
  cs.ch[9] = 'nin_assassin';

  const HOME = { x: p.x, z: p.z };

  /* Stand (or walk) for `secs` of the game's OWN update loop. Enemies are cleared every tick, not
     once: this bench runs in the Arena, whose bots respawn and would otherwise walk into the hero
     and knock it a unit off its mark - which resets the very clock being measured. */
  const tick = (secs, walk, pin) => {
    p.x = HOME.x; p.z = HOME.z; p.vx = 0; p.vz = 0;
    p._stillT = 0; p._stillX = p.x; p._stillZ = p.z;
    const n = Math.round(secs * 60);
    for(let k = 0; k < n; k++){
      G.enemies.length = 0;
      IN.jx = walk ? 1 : 0; IN.jz = 0;
      try { __BF3.update(1/60); } catch(e){}
      if(pin) p._stillT = 0;
    }
    IN.jx = 0; IN.jz = 0;
    return Math.round(Math.hypot(p.x - HOME.x, p.z - HOME.z));
  };

  /* A connecting basic hit through the game's own damage door. hitEnemy is what calls CLASS_BASIC
     (10832), so this is the real path and not an imitation of it. */
  const strike = () => {
    G.enemies.length = 0; G._desig = false;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z + 60);
    if(!foe) return { why:'no target could be spawned' };
    foe.active = true; foe.dead = false; foe.hp = foe.maxHp = 100000;
    foe.vx = 0; foe.vz = 0;
    const bx = p.x, bz = p.z, stillT = Math.round((p._stillT || 0) * 100) / 100;
    let threw = null;
    try { __BF3.hitEnemy(foe, 5, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const moved = Math.round(Math.hypot(p.x - bx, p.z - bz) * 10) / 10;
    /* Did the hero end up on the OTHER side of the target? Unseen mirrors it through the foe. */
    const dot = (bx - foe.x) * (p.x - foe.x) + (bz - foe.z) * (p.z - foe.z);
    return {
      stillT: stillT, moved: moved, behind: dot < 0,
      distAfter: Math.round(Math.hypot(p.x - foe.x, p.z - foe.z)),
      wanted: Math.round(foe.r + 26),
      hpLost: Math.round(100000 - foe.hp), threw: threw,
    };
  };

  const trial = (secs, walk, pin) => {
    const drift = tick(secs, walk, pin);
    const r = strike();
    r.drift = drift;
    return r;
  };

  const armedTrial = (pin) => {
    tick(0.2, false, pin);
    p._stillT = 9;                      // Vanish's own arming line, verbatim (19233)
    const r = strike();
    r.drift = 0;
    return r;
  };

  const half = (pick, pin) => {
    cs.ch[3] = pick;
    return {
      pick: pick, pinned: !!pin,
      still:  trial(1.2, false, pin),
      short:  trial(0.7, false, pin),
      moving: trial(1.2, true,  pin),
      armed:  armedTrial(pin),
    };
  };

  const live  = half('nin_deadly', false);
  const swift = half('nin_swift',  false);
  const inert = half('nin_deadly', true);    // the shipped state: the clock never advances

  const fired = (t) => t.moved > 0 && t.behind === true;

  /* Clean-checks, so a zero can only ever mean "Unseen did not fire" and never "the bench could not
     look": nothing threw, the standing trials really did stand (the clock's own <1 unit rule), the
     walking trial really did walk, and the Vanish arm repositions in every half. */
  const clean = (h) => !h.still.threw && !h.short.threw && !h.moving.threw && !h.armed.threw
                    && h.still.drift < 1 && h.short.drift < 1
                    && h.moving.drift > 1
                    && fired(h.armed);
  const allClean = [live, swift, inert].every(clean);

  /* Nothing may reposition off a walking hit, in any half. */
  const controlHeld = [live, swift, inert].every(h => !fired(h.moving));

  /* The card, clause by clause:
       - a full second of standing still arms it
       - 0.7s does NOT, unless Swift is held, and then it does */
  const bar = (h, hasSwift) => fired(h.still) && (fired(h.short) === !!hasSwift);

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(live, false) && bar(swift, true)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert, false)),
    allClean: allClean, controlHeld: controlHeld,
    clean: { live: clean(live), swift: clean(swift), inert: clean(inert) },
    live: live, swift: swift, inert: inert,
    weapon: (p.weapon || {}).name, weaponNote: weaponNote,
  });
})()
