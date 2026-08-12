/* DOES FAST HANDS DO WHAT ITS CARD SAYS?

   Bladedancer rank-5 option b (index.html:2216) reads: "A parry refunds the time your attack would
   have taken."

   SECTION Q'S THIRD ROW, after Quick Hands and Light Feet, and the same shape as both.
   `harness/audit-passives.js` reports `bd_fast` WIRED and is right — it is read, once, in
   `effAtkSpeed` (3754), for +12% attack speed. The card says nothing about attack speed, and what the
   card DOES say had no implementation anywhere.

   `p.atkCd` IS THE TIME THE ATTACK TAKES. `playerAttack` sets it to `w.cd/effAtkSpeed(p)*cdMul` and
   returns on it (9672), so it is both the cost and the gate; zeroing it is Swift Steel's own refund
   three lines away. Nothing invented.

   THE BAR IS THE COOLDOWN THAT REMAINS AFTER A REAL PARRY, and every part of that sentence is driven
   by the game:
   - The window is opened by CASTING Counter Stance through `__BF3.useSkill`, not by assigning
     `bdParryT`. Assigning the field would be the plan's own Task 5 fault — asserting on what you just
     wrote — and it would also skip whatever else the cast does to the player.
   - The swing is a real swing: `input.attack` pressed for one frame, so `playerAttack` sets the
     cooldown the card promises to refund. The probe never assigns `atkCd`, because that is the
     quantity under test.
   - The hit is a real hit: the foe is put on the hero and the game's own contact damage fires
     (13363). `hurtPlayer` is not exported and is not reached any other way.

   TWO TRIALS PER HALF, and the second is what stops a false positive:
   - PARRIED: window open, swing, take the hit. The cooldown must come back to zero.
   - UNPARRIED: identical, with NO window open, so the hit lands. The cooldown must SURVIVE. A passive
     that zeroed the timer on any hit taken would satisfy a parry-only bar and be a much larger and
     stranger card than the one printed.

   ONE FRAME between the swing and the hit, on purpose: `atkCd` decays every tick, so a slow delivery
   would shrink the very number being read. `e.dropT` is cleared for the same reason — it is the
   spawn-in delay and is checked BEFORE `active` (13276), and leaving it cost the Light Feet probe a
   run by pushing the contact ~41 frames out.

   THREE HALVES IN ONE LAUNCH: the control is `bd_patient`, the a-side of this very rank, so the only
   difference between the halves is the pick — and it is a useful control rather than an inert one,
   because it lengthens the parry window without touching the cooldown, which is exactly the
   distinction under test. The known-bad is `mon_iron`, a dead id from another class fed to the
   identical bar, so `okAgainstInert` is what this probe would have said against the shipped game. */
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
  cs.ch[2] = 'bd_counter';          // the parry this probe opens; the r2 b-side has no window at all
  __BF3.meta.camMode = 'far';

  let threw = null;
  const home = { x: p.x, z: p.z };
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  const run = (openWindow) => {
    G.enemies.length = 0;
    p.x = home.x; p.z = home.z; p.vx = 0; p.vz = 0;
    IN.jx = 0; IN.jz = 0; IN.attack = false;
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0; p.dodgeCdT = 0;
    p.bdParryT = 0; p.bdRiposte = 0; p.bdMirrorDmg = 0; p.bdPerfectDmg = 0;
    p.atkCd = 0; p.atkTimer = 0; p.attackHeld = false; p.charging = false; p.holdT = 0;
    p.mana = p.manam || p.maxMana || 999;
    if(p.skillCd) p.skillCd[0] = 0;

    /* Parked well clear so nothing touches the hero while the window and the swing are being set up;
       it is brought in only for the delivery below. */
    const e = __BF3.spawnEnemy('grunt', home.x + 400, home.z);
    if(!e) return { why:'no target' };
    e.active = true; e.dropT = 0; e.immobile = true; e.hp = e.maxHp = 100000;
    p.yaw = Math.atan2(0, -1);

    let castThrew = null;
    if(openWindow){ try { __BF3.useSkill(0); } catch(err){ castThrew = String(err && err.message || err); } }
    const parryOpen = Math.round((p.bdParryT || 0) * 100) / 100;

    /* One frame of held attack: a press swings, and releasing before 0.24s keeps it out of the
       charge branch (13126). */
    IN.attack = true; tick(1); IN.attack = false; p.attackHeld = false; p.charging = false;
    const atkCdBefore = Math.round((p.atkCd || 0) * 1000) / 1000;

    const hp0 = p.hp;
    p.vx = 0; p.vz = 0;
    let hitAt = -1;
    for(let k = 0; k < 60 && hitAt < 0; k++){
      e.x = p.x; e.z = p.z; e.y = p.y;
      tick(1);
      if(p.hp < hp0 || (p.bdRiposte || 0) > 0) hitAt = k;
    }
    const atkCdAfter = Math.round((p.atkCd || 0) * 1000) / 1000;

    return { castThrew: castThrew, parryOpen: parryOpen, atkCdBefore: atkCdBefore,
             atkCdAfter: atkCdAfter, hitAt: hitAt, hpLost: hp0 - p.hp,
             parried: hitAt >= 0 && (p.bdRiposte || 0) > 0 && p.hp === hp0,
             landed: hitAt >= 0 && p.hp < hp0, refunded: atkCdAfter === 0 };
  };

  const trial = (pick) => {
    cs.ch[5] = pick;
    return { pick: pick, ch: JSON.stringify(cs.ch), parried: run(true), unparried: run(false) };
  };

  const control = trial('bd_patient');
  const fast    = trial('bd_fast');
  const inert   = trial('mon_iron');

  /* A trial says nothing unless the swing really put a cooldown on the clock and the foe really got
     its hit in — and unless the two windows really differed in the way they were set up. */
  const staged = (t) => !!(t && t.parried && t.unparried
                           && t.parried.atkCdBefore > 0 && t.unparried.atkCdBefore > 0
                           && t.parried.hitAt >= 0 && t.unparried.hitAt >= 0
                           && t.parried.parried && t.unparried.landed
                           && !t.parried.castThrew);

  const ok = !!(staged(control) && staged(fast) && staged(inert) && !threw
                && fast.parried.refunded                 // the card's own sentence
                && !fast.unparried.refunded              // and only on a PARRY, not on any hit
                && !control.parried.refunded             // nothing without the pick
                && !control.unparried.refunded
                && !inert.parried.refunded               // nor for a dead id fed the same bar
                && !inert.unparried.refunded);

  return JSON.stringify({
    ok: ok,
    okAgainstInert: !!(staged(inert) && inert.parried.refunded && !inert.unparried.refunded),
    control: control, fast: fast, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
