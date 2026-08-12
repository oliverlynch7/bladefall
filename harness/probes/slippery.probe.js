/* DOES SLIPPERY (THE PASSIVE) DO ANYTHING AT ALL?

   Pirate rank-7 option a (index.html:2146) reads: "Firing the pistol pushes you back out of melee
   range." `harness/audit-passives.js` says the id `pir_evasive` appears exactly twice in the whole of
   public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and nowhere
   else. It is one of the rows in docs/SKILL_TRIAGE.md section E.

   NOTHING HERE IS INVENTED, and the arithmetic is the reason this row was worth taking.
   - The push is the PIRATE'S OWN ROLL, verbatim. `SKILL_FX.pir_tumble` IS `SKILL_FX.tumble` (10304,
     10229), which sets `dodgeTimer=0.22` with the dash reversed off the yaw (9886), and the dash
     step is `vx = dashX*560` (12874). 0.22 x 560 = ~123 units.
   - "Out of melee range" is the game's own reach: `((e.weapon&&e.weapon.range)||60) + e.r + p.r`
     (12168), roughly 90-110 units. So the class's own roll distance lands just past its own melee
     reach - the card describes what Roll already does, and no distance had to be chosen.
   - The i-frames and the snare are deliberately NOT copied. The card promises a push and nothing else;
     handing every pistol shot Tumble's 0.35s invulnerability would be a much larger change wearing a
     wiring fix's clothes.

   AND THAT IS WHY THE PUSH RUNS ON ITS OWN TIMER (`p._slipT`) RATHER THAN ON `p.dodgeTimer`, which
   is the obvious one-line reuse and is the trap. `dodgeTimer` is not just the dash's clock: EIGHT
   damage tests in the file read it as "this body is dodging" (12672, 13056, 13061, 13064, 11446,
   12255, 13233), and 13003 blocks attacking while it runs. Setting it would hand every pistol shot
   0.22s of untouchability the card never mentions - the same shape as pass 20's note, where an early
   return out of `hurtPlayer` would have read as knockback immunity and been DAMAGE immunity. The slip
   timer drives the identical velocity (`_slipX/_slipZ * 560`) and nothing else, so this probe asserts
   the push happened AND that `dodgeCdT` was never spent.

   FIRING IS DRIVEN BY THE GAME. `CLASS_BASIC.pirate` (11262) is what fires the pistol, spends
   `_loaded` and prints BANG, and it is dispatched from inside `hitEnemy` (10832) - so the probe lands
   an ordinary hit and lets the game decide whether a shot happened. It never sets `_loaded` itself,
   because that flag is the condition under test's own input.

   TWO TRIALS PER HALF, one per half of the sentence:
   - LOADED: the shot fires, so the passive must push. The gap to the foe must end up past the foe's
     own reach, computed with the game's formula rather than with a number typed here.
   - SPENT: the same hit takes the Cutthroat branch and no shot is fired, so nothing may move. A
     passive that pushed on every swing would satisfy a loaded-only bar and be a different, worse bug.

   THE FOE IS PINNED (`immobile`), and that is bench setup rather than a thumb on the scale: an active
   grunt closes the distance during the 20 ticks the dash takes, so an unpinned measurement reports the
   difference between two moving bodies and cannot say which one moved. `immobile` is the game's own
   field, already honoured by hitEnemy's knockback line (10848). The player's own input is held at zero
   for the same reason.

   THREE HALVES IN ONE LAUNCH: the control is `pir_luck`, the b-side of this very rank - which is also
   dead, because BOTH options at pirate rank 7 are, which is section E's point in one line - and the
   known-bad is `mon_iron`, a dead id fed to the identical bar, so `okAgainstInert` is what this probe
   would say against the shipped game. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'pirate';
  __BF3.meta.pirateSlot = 'basic';

  let weaponNote = 'none';
  (function(){
    const tries = ['pirate'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('pirate');
  cs.ch = cs.ch || {};
  __BF3.meta.camMode = 'far';

  let threw = null;
  const home = { x: p.x, z: p.z };
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  /* A foe pinned 60 units in front - well inside any melee reach - and the hero facing it, standing
     still. Returns the foe plus the reach the GAME would use for it.

     THE HERO IS TURNED BY THE GAME'S OWN AIM EXPRESSION (`atan2(dx, dz)`, 9893) rather than by a
     hand-picked yaw, and that is not a nicety. Forward in this game is `(sin(yaw), cos(yaw))` - every
     projectile spawn and every aim solve in the file agrees - so a foe placed at `z-60` in front of a
     hero at `yaw 0` is BEHIND it, and a backward dash would drive INTO the body while the probe called
     the result a push. An earlier draft of this file did exactly that. */
  const setup = () => {
    G.enemies.length = 0;
    p.x = home.x; p.z = home.z;
    /* THE VELOCITY IS PART OF THE RESET, and leaving it out cost this probe a run. A dash does not
       stop dead when its timer ends - the movement branch hands the leftover 560 to the friction
       tail - so a trial that only put the hero back at `home` began with the PREVIOUS trial's speed
       still under it. Measured: the loaded half pushed 139.4 and the spent half that followed it
       drifted 18.7 with nothing fired, which reads exactly like a passive pushing on every swing. */
    p.vx = 0; p.vz = 0;
    IN.jx = 0; IN.jz = 0;
    p.dodgeTimer = 0; p.dodgeCdT = 0; p._slipT = 0;
    const e = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
    if(!e) return null;
    p.yaw = Math.atan2(e.x - p.x, e.z - p.z);     // face it, the way the game aims at a target
    e.active = true; e.immobile = true; e.hp = e.maxHp = 100000;
    const reach = ((e.weapon && e.weapon.range) || 60) + (e.r || 0) + (p.r || 0);
    return { e: e, reach: reach };
  };

  const reload = () => {                          // a kill, so the game's own rider reloads (10939)
    G.enemies.length = 0;
    const k = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
    if(k){ k.active = true; k.hp = k.maxHp = 1;
      try { __BF3.hitEnemy(k, 500, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); } }
    G.enemies.length = 0;
    return p._loaded;
  };

  /* One hit, then long enough for a 0.22s dash to finish (20 ticks = 0.33s). The gap is measured
     against a pinned foe, so all of the change is the hero. */
  const shoot = (s) => {
    const gap0 = Math.hypot(p.x - s.e.x, p.z - s.e.z);
    const at0 = { x: p.x, z: p.z };
    const loadedAtShot = p._loaded;
    try { __BF3.hitEnemy(s.e, 100, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
    const dashArmed = (p._slipT || 0) > 0;
    tick(20);
    const gap1 = Math.hypot(p.x - s.e.x, p.z - s.e.z);
    /* Positive means the hero ended up FURTHER from the foe, which is the direction the card names. */
    return { loadedAtShot: loadedAtShot, dashArmed: dashArmed,
             gap0: Math.round(gap0 * 10) / 10, gap1: Math.round(gap1 * 10) / 10,
             moved: Math.round(Math.hypot(p.x - at0.x, p.z - at0.z) * 10) / 10,
             reach: Math.round(s.reach * 10) / 10,
             cleared: gap1 > s.reach, dodgeCd: Math.round((p.dodgeCdT || 0) * 100) / 100 };
  };

  const trial = (pick) => {
    cs.ch[7] = pick;
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;

    reload();
    let s = setup(); if(!s) return { pick: pick, why: 'no target' };
    const loaded = shoot(s);

    /* The pistol is now spent (the shot above fired it), so this second hit takes the Cutthroat
       branch and must move nobody. */
    s = setup(); if(!s) return { pick: pick, why: 'no target' };
    const spent = shoot(s);

    return { pick: pick, loaded: loaded, spent: spent };
  };

  const control  = trial('pir_luck');
  const slippery = trial('pir_evasive');
  const inert    = trial('mon_iron');

  /* Both halves must have been staged correctly or neither number means anything: the first hit has
     to have happened with the pistol loaded and the second with it spent. */
  const staged = (t) => !!(t && t.loaded && t.spent && t.loaded.loadedAtShot !== false && t.spent.loadedAtShot === false
                           && t.loaded.gap0 < t.loaded.reach);          // the shot really was taken from inside melee
  const still  = (r) => !!(r && r.moved < 2 && !r.cleared);

  const ok = !!(staged(control) && staged(slippery) && staged(inert) && !threw
                && still(control.loaded) && still(control.spent)         // nothing moves without the passive
                && still(inert.loaded)   && still(inert.spent)
                && slippery.loaded.dashArmed                            // the shot armed the push
                && slippery.loaded.moved > 90                           // Roll's own ~123 units, allowing for the tick grid
                && slippery.loaded.cleared                              // and it ends past the game's own reach
                && slippery.loaded.dodgeCd === 0                        // without spending the dodge the card never mentions
                && still(slippery.spent));                              // and nothing at all when the pistol is empty

  return JSON.stringify({
    ok: ok,
    okAgainstInert: !!(staged(inert) && inert.loaded.dashArmed && inert.loaded.moved > 90 && inert.loaded.cleared),
    control: control, slippery: slippery, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
