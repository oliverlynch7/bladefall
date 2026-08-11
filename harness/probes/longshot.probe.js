/* DOES LONGSHOT DO WHAT ITS CARD SAYS?

   docs/SKILL_TRIAGE.md section E: 46 of the game's 124 passives are offered in the rank-up menu,
   given a name, a role and a description, and then never read by a single line of code. `r_longshot`
   is the Ranger's rank-3 option A - "+8% damage to enemies 7m+ away" - and the Ranger is the one
   CORE class in that list, with six of its eight passives dead, both options at rank 3 among them.

   The static audit (harness/audit-passives.js) can only prove WIRED: that some line somewhere
   mentions the id. This proves the EFFECT.

   ── THE BAR, AND WHY THE OBVIOUS ONE IS WRONG ──────────────────────────────────────────────────
   The first version of this probe asked "is a far hit 8% bigger than a near hit", and its control -
   the same pair with the OTHER rank-3 option chosen - immediately killed it: the control pair came
   back 1.141, not 1.000. The Ranger's basic attack already scales with distance, by design and
   independently of any passive. CLASS_BASIC.ranger (index.html:11030) is a ramp,
   `k = clamp(0.75 + d/520*0.6, 0.75, 1.35)`, whose own comment is "a ranger is about spacing, so the
   damage IS spacing". At 200 units that is 0.9808 and at 320 it is 1.1192: ratio 1.1412, which is
   what the control measured to three decimals. A distance-vs-distance bar would therefore have
   reported a healthy +14% bonus against a completely unwired passive, and passed forever.

   So the comparison is held at ONE distance and the PASSIVE is what changes:

     FAR  (320 units, past the card's 7m): Longshot chosen must beat the other option by 1.08.
     NEAR (200 units, inside it):          the two options must be indistinguishable.

   The near pair is what makes this a test rather than a thermometer - a "+8% to everything"
   implementation, the easiest wrong version to write, passes the far half and fails the near half.
   The distance ramp cancels exactly, because both cells of each pair are measured at the same range.

   Both halves run in ONE launch against ONE dummy body: docs/SKILL_TRIAGE.md section F is the record
   of what comparing two runs of this bench across two different games costs.

   No update() is ever called. The probe drives the game's own hitEnemy() - the function every damage
   path funnels through, by its own comment - and reads the target's HP either side, so the AI, the
   swing chain, hazard damage and the combo timer are out of the measurement. G.combo is zeroed
   before each hit because hitEnemy's own +0.4%-per-hit combo scaling would otherwise make the second
   hit of a pair bigger than the first for a reason that has nothing to do with the passive. */
(function(){
  const G = __BF3.G, p = G.p;

  /* The paused-bench hazard: roughly one launch in six arrives in mode 'pause'. Knock on the game's
     own resume door, the way test-skills.js and riposte.probe.js do. */
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
  __BF3.meta.classId = 'ranger';

  /* On-class, through the game's own classStartWeapon(). Eleven of sixteen classes were once
     measured holding the Arena's sword, and every `if(ok)` half of their kit was skipped. Longshot
     does not read the weapon itself, but effPower's ranger block does and a bench that is off-class
     is not measuring a ranger. */
  let weaponNote = 'none';
  (function(){
    const tries = ['ranger'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w; weaponNote = (i === 0) ? 'own starter' : ('borrowed from ' + tries[i]); return;
      }
    }
  })();

  const cs = __BF3.classState('ranger');
  cs.ch = cs.ch || {};

  const NEAR = 200, FAR = 320;          // 5m and 8m, either side of the card's 7m (280 units)
  const RAW  = 1000;                    // a round number in, so the ratio out is readable

  /* One hit, at one distance, with everything that could move the number pinned. The dummy is
     spawned fresh each time and never ticked, so it cannot walk, retaliate, or die.
     `desig` picks which half of the game's damage plumbing runs: false is a BASIC attack (and only
     then does CLASS_BASIC.ranger's distance ramp apply), true is a skill or charged hit. */
  function hitAt(dist, desig){
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - dist);
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 1e7; d.hp = 1e7; d.x = p.x; d.z = p.z - dist; }
    } catch(e){}
    if(!d) return { dist: dist, dealt: null, why: 'no dummy' };
    G.combo = 0; G.comboT = 0; G._desig = !!desig; G._crit = false;
    const before = d.hp;
    let threw = null;
    try { __BF3.hitEnemy(d, RAW, p, 0, 0, null); } catch(e){ threw = String((e && e.message) || e); }
    G._desig = false;
    return { dist: dist, sep: Math.round(Math.hypot(d.x - p.x, d.z - p.z)),
             dealt: before - d.hp, threw: threw };
  }

  /* r_closeq is the control precisely because it is the OTHER half of the same choice: same class,
     same rank, same menu, and (today) equally unwired - so it changes the chosen id and nothing
     else. Measuring against "no choice at all" would leave c2Passive() reading an empty slot, which
     is not a state a rank-10 ranger can be in. */
  function cell(pick, dist, desig){
    cs.ch[3] = pick;
    return hitAt(dist, desig);
  }
  function pairAt(dist, desig){
    const ls = cell('r_longshot', dist, desig), ct = cell('r_closeq', dist, desig);
    return { dist: dist, desig: !!desig, longshot: ls, control: ct,
             gain: (ct.dealt > 0) ? Math.round((ls.dealt / ct.dealt) * 1000) / 1000 : null };
  }

  const far   = pairAt(FAR,  false);    // past 7m, basic attack: the promise
  const near  = pairAt(NEAR, false);    // inside 7m, basic attack: must be untouched
  /* The card does not say "basic attacks", so the bonus is wired for every damage path. Reported
     rather than asserted, because whether a range passive should also pay on skills is a design
     reading and this probe's job is to say what the code does. */
  const farSkill = pairAt(FAR, true);

  /* Tolerance is on the RATIO, not on a raw number, so a later change to base damage or to the
     ranger's distance ramp cannot silently break this. 0.005 covers the single Math.round hitEnemy
     does before applying the hit; 8% of a ~1200 hit is ~95, two orders above that. */
  const near8 = (r) => r != null && Math.abs(r - 1.08) < 0.005;
  const near1 = (r) => r != null && Math.abs(r - 1.00) < 0.005;
  const ok = near8(far.gain) && near1(near.gain);

  /* Recorded, not asserted: the class's own distance identity, so a future reader can see it is
     still there and separate from the passive. */
  const ramp = (far.control.dealt > 0 && near.control.dealt > 0)
             ? Math.round((far.control.dealt / near.control.dealt) * 1000) / 1000 : null;

  return JSON.stringify({
    ok: ok,
    verdict: ok ? 'Longshot pays +8% past 7m and nothing past 7m without it'
                : ('FAILED: gain past 7m ' + far.gain + ' (want 1.08), gain inside 7m ' + near.gain + ' (want 1.00)'),
    thresholdUnits: 280, nearUnits: NEAR, farUnits: FAR, rawDamageIn: RAW,
    gainPast7m: far.gain, gainInside7m: near.gain, gainPast7mOnSkill: farSkill.gain,
    classDistanceRamp: ramp,
    weapon: { name: p.weapon && p.weapon.name, note: weaponNote },
    rank: cs.rank, far: far, near: near, farSkill: farSkill, mode: __BF3.mode,
  });
})()
