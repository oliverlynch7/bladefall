/* DOES LIGHT FEET DO WHAT ITS CARD SAYS?

   Bladedancer rank-3 option b (index.html:2214) reads: "Dodging through an enemy parries their next
   attack automatically."

   SECTION Q'S SHAPE, not section E's, and it is the second row of it. `harness/audit-passives.js`
   reports `bd_feet` WIRED and is right — it is read, once, in `effSpeed` (3755), where it grants +10%
   move speed as a rider on the rank-10 capstone's own line. The card says nothing about move speed,
   and what the card DOES say had no implementation anywhere: nothing in the file opened a parry off a
   dodge. The audit asks whether anything reads the id; it cannot ask whether the reader honours the
   card.

   NOTHING IS INVENTED. The window is Counter Stance's own (`bd_counter`, 10454), Patient Guard branch
   included, and the payoff is not new code at all — `hurtPlayer` already turns an open window into a
   parry, a stored Riposte, i-frames, Healing Counter and the capstone.

   THE BAR IS A PARRY, NOT A FLAG. `p.bdParryT` is read straight after the dash and reported, because
   it is the cheapest thing to look at and therefore the easiest thing to be fooled by — this
   sub-project has twice measured what the code SETS instead of what the card PROMISES (passes 15 and
   23). So the verdict is what the player would see: a real enemy lands a real hit afterwards, through
   the game's own contact path (13348), and the question is whether it was parried. `hurtPlayer` is
   deliberately not exported and is not reached any other way here.

   TWO TRIALS PER HALF, and the second is the one that makes the first mean anything:
   - THROUGH: a foe sits 55 units ahead, inside the 112 units a 0.20s dash at 560 u/s covers, so the
     body passes through it. The following hit must be parried.
   - PAST: the identical dash, in the identical direction, with the foe 400 units off to the side so
     nothing is passed through. The following hit must LAND. A passive that opened a parry on every
     dodge would satisfy a through-only bar, and would be a bigger buff than the card describes.

   THE HIT IS DELIVERED THE SAME WAY IN BOTH TRIALS: after the dash the foe is moved onto the hero and
   the game is ticked until its own contact damage fires. Only whether the DASH passed through a body
   differs between them, which is the whole claim.

   THE FOE IS PINNED (`immobile`) and given a huge HP pool — bench setup, not a thumb on the scale.
   `immobile` is the game's own field and an unpinned grunt closes distance during the dash, so the
   measurement would be of two moving bodies. The hero's own input is held at zero so the dash follows
   the yaw rather than a steering vector, which is the game's own fallback (13135) and removes
   `moveX`/`moveZ` from the experiment.

   THREE HALVES IN ONE LAUNCH: the control is `bd_sharp`, the a-side of this very rank, so the only
   difference between the halves is the pick; the known-bad is `mon_iron`, a dead id from another class
   fed to the identical bar, so `okAgainstInert` is what this probe would have said against the
   shipped game. */
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
  __BF3.meta.classId = 'bladedancer';

  let weaponNote = 'none';
  (function(){
    const tries = ['bladedancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('bladedancer');
  cs.ch = cs.ch || {};
  __BF3.meta.camMode = 'far';

  let threw = null;
  const home = { x: p.x, z: p.z };
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  /* `offX` puts the foe out of the dash's way without changing anything else about the trial. */
  const run = (offX) => {
    G.enemies.length = 0;
    p.x = home.x; p.z = home.z; p.vx = 0; p.vz = 0;
    IN.jx = 0; IN.jz = 0;
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0; p.dodgeCdT = 0;
    p.bdParryT = 0; p.bdRiposte = 0; p.bdMirrorDmg = 0; p.bdPerfectDmg = 0;

    const e = __BF3.spawnEnemy('grunt', home.x + offX, home.z - 55);
    if(!e) return { why:'no target' };
    /* `dropT` is the spawn-in delay, and it is checked BEFORE `active` (13261), so setting `active`
       alone leaves the body inert. Measured: the first version of this probe waited ~41 frames for a
       hit that should have come on frame one, which put the contact PAST the 0.65s window it was
       supposed to be testing — a bench fault that reads exactly like a parry that does not hold. */
    e.active = true; e.dropT = 0; e.immobile = true; e.hp = e.maxHp = 100000;
    /* Forward in this game is `(sin(yaw), cos(yaw))` — every aim solve and projectile spawn agrees —
       so this is the yaw that points down -z, where the foe is. Sub-project B has already lost a run
       to facing a hero at yaw 0 toward a foe the game puts BEHIND it (pass 24). */
    p.yaw = Math.atan2(0, -1);

    const at0 = { x: p.x, z: p.z };
    IN.dodgeEdge = true;
    tick(1);
    const dashing = (p.dodgeTimer || 0) > 0;
    /* 14 ticks = 0.233s: past the 0.20s dash AND past the 0.18s i-frame it grants, but well inside
       the 0.65s window under test. A hit delivered before the i-frames lapse proves nothing — the
       game refuses it at hurtPlayer's own guard, parry or no parry. */
    tick(14);
    const parryOpen = Math.round((p.bdParryT || 0) * 100) / 100;
    const moved = Math.round(Math.hypot(p.x - at0.x, p.z - at0.z));
    const invuln = Math.round((p.invuln || 0) * 100) / 100;

    /* Now let the game hit us: the foe is put on the hero and its own contact damage (13348) fires on
       the next frame they overlap.
       THE VELOCITY IS ZEROED AND THE FOE IS RE-PLACED EVERY FRAME, and leaving either out cost this
       probe a run. A dash does not stop dead — the movement branch hands its leftover 560 u/s to the
       friction tail — so a hero parked next to a PINNED foe walks out of contact before the contact
       check runs, and the foe cannot follow. Measured: `hitAt -1` in five of six trials, one stray
       landing at frame 46. That is a bench fault reading exactly like an enemy that cannot attack. */
    const hp0 = p.hp;
    p.vx = 0; p.vz = 0; IN.jx = 0; IN.jz = 0;
    let hitAt = -1;
    for(let k = 0; k < 60 && hitAt < 0; k++){
      e.x = p.x; e.z = p.z; e.y = p.y;
      tick(1);
      if(p.hp < hp0 || (p.bdRiposte || 0) > 0) hitAt = k;
    }
    return { dashing: dashing, moved: moved, invulnAtHit: invuln, parryOpen: parryOpen,
             hitAt: hitAt, hpLost: hp0 - p.hp, riposte: (p.bdRiposte || 0) > 0,
             parried: hitAt >= 0 && (p.bdRiposte || 0) > 0 && p.hp === hp0,
             landed:  hitAt >= 0 && p.hp < hp0 };
  };

  /* The other three ranks are whatever cheatRank10All left, and `parryOpen` cannot be read without
     knowing rank 5: Patient Guard makes this window .85 rather than .65, exactly as it does for the
     class's other four parries. Reported rather than assumed — an unexplained number in a proof is
     how this sub-project has twice convinced itself of the wrong mechanism. */
  const trial = (pick) => {
    cs.ch[3] = pick;
    return { pick: pick, ch: JSON.stringify(cs.ch), through: run(0), past: run(400) };
  };

  const control = trial('bd_sharp');
  const feet    = trial('bd_feet');
  const inert   = trial('mon_iron');

  /* Neither number in a trial means anything unless the dash really ran the length it should and the
     foe really got a hit in afterwards. 100 rather than 112 because the dash is measured on a 1/60
     tick grid and the last frame is partial. */
  const staged = (r) => !!(r && r.dashing && r.moved > 100 && r.hitAt >= 0);
  const stagedBoth = (t) => !!(t && staged(t.through) && staged(t.past));

  const ok = !!(stagedBoth(control) && stagedBoth(feet) && stagedBoth(inert) && !threw
                && feet.through.parried                  // the card's own sentence
                && feet.past.landed                      // and only when you went THROUGH something
                && control.through.landed                // nothing without the pick
                && control.past.landed
                && inert.through.landed                  // nor for a dead id fed the same bar
                && inert.past.landed);

  return JSON.stringify({
    ok: ok,
    okAgainstInert: !!(stagedBoth(inert) && inert.through.parried && inert.past.landed),
    control: control, feet: feet, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
