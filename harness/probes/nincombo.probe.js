/* DOES KILLING WITH UNSEEN EVER REARM IT?

   `nin_combo` (CLASS2.ninja r5 b, index.html:2120) reads: "Killing with Unseen instantly rearms it
   — chain from body to body." It is WIRED — killEnemy (10967) checks `c2Passive('nin_combo')` and
   sets `p._stillT = 9`, Vanish's own arming line — so harness/audit-passives.js calls it live and
   this whole class has reported 0/8 dead throughout. It is wired to a condition that an ordinary
   Unseen kill never meets.

   The gate is `e._ninExec !== undefined`, and `_ninExec` is assigned in exactly ONE place in the
   file: inside CLASS_BASIC.ninja's DEADLY PRECISION branch (11358), the `nin_deadly` execute. So the
   shipped card is not "killing with Unseen rearms it" — it is "killing with Deadly Precision rearms
   it". Two consequences, both of which a player would experience as the card lying:
     - `nin_deadly` is rank 3 b and `nin_combo` is rank 5 b, so a Ninja who took SWIFT at rank 3 can
       never fire Combo Edge at all, at any HP, forever. That is half of all Ninjas.
     - Even holding both, an Unseen strike that kills a healthy enemy outright — the ordinary case,
       and the one the card's "chain from body to body" describes — marks nothing and rearms nothing.

   This probe is the measurement, not the reading. It fails against the shipped game.

   NOTHING IS INVENTED. The rearm sentinel 9, the arm thresholds and the execute's own HP fraction
   are all already in the file; the only thing under test is WHICH strikes are marked.

   THREE HALVES IN ONE LAUNCH:
     - `live`    - rank 3 pinned to `nin_swift`, rank 5 to `nin_combo`. Deadly Precision is
                   deliberately NOT held, because a Ninja in exactly this state is the one the
                   shipped game can never pay out to.
     - `deadly`  - rank 3 pinned to `nin_deadly`, rank 5 to `nin_combo`. Carries the shipped game's
                   own working path, so a zero anywhere else cannot be "the bench cannot see a
                   rearm".
     - `control` - rank 5 pinned to `nin_evasive`, so Combo Edge is NOT held. Nothing may rearm in
                   this half, in any trial, either side of the fix.

   THE KNOWN-BAD IS CARRIED PERMANENTLY AND IN THE SAME LAUNCH, but it cannot be an `inert` half of
   the kind petorder.probe.js and unseen.probe.js use: the mark is written and read inside ONE
   synchronous hitEnemy call, so nothing a bench pins between ticks can reach it. Instead the shipped
   gate's condition is TRANSCRIBED here — `shippedFired`, below — and the identical bar is evaluated
   against it. That is the shape harness/test/gate.test.js uses when it asserts OLD_LINE and the new
   line disagree, and it is stronger than reading a field back, because the transcription is visible.
   `okAgainstShipped` is therefore what this probe reports against the unfixed game and MUST be false
   while `ok` is true.

   THREE TRIALS PER HALF, one per clause and one that must NOT fire:
     - `hearty`    - a foe at FULL health, killed outright by one armed Unseen strike. This is the
                     card, verbatim. The shipped game cannot pay it in any half.
     - `wounded`   - a foe already below a third of its health. The shipped game pays this one, and
                     only in the `deadly` half. Without it, "the fix works" and "the fix replaced the
                     execute path" would be the same measurement.
     - `notunseen` - Unseen NOT armed; the foe is killed by a plain hit. Must rearm in NO half. A
                     wiring that rearmed on every kill would be a strictly different and strictly
                     better card than the menu shows, and it would clear a two-trial bar.

   THE BAR IS THE GAME'S OWN ARM STATE, `p._stillT`, read after the kill. An armed Unseen strike
   CONSUMES it to 0 (11354) on its way through, so 0 after the kill is a real "did not rearm" and 9
   is the rearm's own line. Each trial also reports that the foe actually died, so a zero can never
   mean the bench failed to kill anything. */
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
  __BF3.meta.classId = 'ninja';
  __BF3.meta.camMode = 'far';

  /* Through the game's own classStartWeapon, because hitEnemy hands every basic hook
     classFamilyOk(p.weapon) and a great many of them gate their defining half on it - the fault
     this sub-project's Task 1 found in the skill bench, where eleven of sixteen classes were being
     measured off-class. */
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
  /* Ranks 7 and 9 are pinned to the two plain damage cards, identically in every half, so the only
     thing that differs between halves is which of the three passives under test is held. */
  cs.ch[7] = 'nin_bleed';
  cs.ch[9] = 'nin_assassin';

  const HOME = { x: p.x, z: p.z };

  /* One trial: park the hero, arm (or deliberately do not arm) Unseen, spawn a foe with the health
     the trial is about, and kill it through the game's own damage door. hitEnemy is what calls
     CLASS_BASIC (10872) and what calls killEnemy (10958), so both halves of this mechanism are the
     real ones and neither is imitated. */
  const trial = (armed, maxHp, hp) => {
    p.x = HOME.x; p.z = HOME.z; p.vx = 0; p.vz = 0;
    G.enemies.length = 0; G._desig = false;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z + 60);
    if(!foe) return { why: 'no target could be spawned' };
    foe.active = true; foe.dead = false; foe.maxHp = maxHp; foe.hp = hp;
    foe.vx = 0; foe.vz = 0;
    p._stillT = armed ? 9 : 0;               // 9 is Vanish's own arming line, verbatim (19233)
    const preHp = foe.hp, preMax = foe.maxHp;
    let threw = null;
    try { __BF3.hitEnemy(foe, 400, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    return {
      armed: !!armed, preHp: preHp, preMax: preMax,
      killed: !!(foe.dead || foe.hp <= 0),
      stillT: Math.round((p._stillT || 0) * 100) / 100,
      threw: threw,
    };
  };

  const half = (r3, r5) => {
    cs.ch[3] = r3; cs.ch[5] = r5;
    return {
      r3: r3, r5: r5,
      hasCombo: r5 === 'nin_combo', hasDeadly: r3 === 'nin_deadly',
      hearty:    trial(true,  40,   40),   // full health, killed outright by the Unseen strike
      wounded:   trial(true,  1000, 100),  // already below a third: the execute's own condition
      notunseen: trial(false, 40,   40),   // a plain kill, no Unseen involved
    };
  };

  const live    = half('nin_swift',  'nin_combo');
  const deadly  = half('nin_deadly', 'nin_combo');
  const control = half('nin_swift',  'nin_evasive');
  const halves  = [live, deadly, control];

  /* The rearm sets p._stillT to 9. An armed Unseen strike zeroes it on the way through, and an
     unarmed one leaves the 0 the trial set, so anything at all above the arm threshold can only be
     the rearm. */
  const fired = (t) => (t.stillT || 0) >= 1;

  /* THE SHIPPED GATE, TRANSCRIBED. killEnemy (10967) requires nin_combo, and `e._ninExec` is set
     only by CLASS_BASIC.ninja's Deadly Precision branch (11356) - which needs Unseen armed, the
     passive held, and the target already below a third of its health. */
  const shippedFired = (h, t) =>
    h.hasCombo && t.armed && h.hasDeadly && t.preHp <= t.preMax / 3;

  const clean = (h) => !h.hearty.threw && !h.wounded.threw && !h.notunseen.threw
                    && h.hearty.killed && h.wounded.killed && h.notunseen.killed;
  const allClean = halves.every(clean);

  /* Nothing may rearm off a kill that was not an Unseen strike, in any half. */
  const controlHeld = halves.every(h => !fired(h.notunseen));

  /* The card, evaluated against whatever "fired" means: both Combo Edge halves pay out on a healthy
     foe AND on a wounded one, and the half without Combo Edge pays out on neither. */
  const bar = (f) => f(live, live.hearty) && f(live, live.wounded)
                  && f(deadly, deadly.hearty) && f(deadly, deadly.wounded)
                  && !f(control, control.hearty) && !f(control, control.wounded);

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar((h, t) => fired(t))),
    okAgainstShipped: !!(allClean && controlHeld && bar(shippedFired)),
    allClean: allClean, controlHeld: controlHeld,
    clean: { live: clean(live), deadly: clean(deadly), control: clean(control) },
    live: live, deadly: deadly, control: control,
    weapon: (p.weapon || {}).name, weaponNote: weaponNote,
  });
})()
