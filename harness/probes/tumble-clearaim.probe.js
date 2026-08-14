/* DOES "A DODGED HIT KEEPS CLEAR AIM" ALREADY WORK — asked BEFORE ranger/Tumble is touched.

   ranger/Tumble's card (index.html:2053) sells three things: "Roll back ~5m with brief i-frames +
   a 0.75x parting shot. A dodged hit keeps Clear Aim." Measured, the roll happens (197 units, away)
   and the shot does not exist (0 damage at every bench distance, harness/baseline.json). The third
   clause had never been measured by anything, and it is the reason this probe exists rather than a
   straight-to-the-fix commit: if the Clear Aim half is the only part of this card that WORKS, then
   the way to lose ground here is to add the shot and quietly break it.

   WHAT THE CLAUSE COMPILES TO, read off the file rather than assumed. Clear Aim is the Ranger
   innate (2047): 3s without taking direct damage buys +10% damage, and "a hit disables it". The
   only thing in the game that disables it is class2OnHit (10239), and class2OnHit has exactly ONE
   caller — hurtPlayer (11804). Every path that hurts the player gates on `p.invuln>0 ||
   p.dodgeTimer>0` BEFORE it reaches hurtPlayer (melee 13100, boss sweep 13537, ground slam 13542,
   magma 13545, enemy projectiles 13727, beam 14029, arena hazard 12659). Tumble sets both fields
   (SKILL_FX.tumble, 9992: dodgeTimer 0.22, invuln 0.35).
   So the clause should already hold, and hold for FREE — not because Tumble is special, but because
   an i-framed hit never becomes a hit at all. This probe is here to check that reasoning against the
   running game, because "it should already work" is exactly the kind of claim this repo does not
   accept unwatched.

   THREE ARMS, and the middle one carries its own proof that a swing was available:
     exposed  — grunt adjacent, no i-frames. Clear Aim must BREAK. This is the direction that proves
                the probe can see the effect at all; without it, "it stayed true" means nothing.
     dodged   — the identical rig with p.invuln pinned. Clear Aim must SURVIVE... and then the pin is
                RELEASED and the same grunt keeps swinging, and it must break. That second phase is
                what stops this arm passing vacuously: a grunt that wandered off, died, or never
                closed would fail the release phase, so a pass means the swings were really landing
                on the i-frames and not on nothing.
     skill    — Tumble cast through the game's own useSkill, reading p.invuln / p.dodgeTimer the
                instant it returns. This is the link between the mechanism above and THIS card: the
                i-frames the clause depends on are the ones this skill grants. It is also the assert
                that a parting shot added to this body has not cost the roll its invulnerability.

   RUN AT RANK 9, AND THE FIRST DRAFT'S RANK 10 IS THE REASON THIS SAYS SO OUT LOUD.
   cheatRank10All gives rank 10, where Perfect Hunt (2048) is live and class2OnHit (10242) takes a
   different branch: a hit sets a 0.75s GRACE and RETURNS, instead of dropping Clear Aim. Measured
   that way first, the EXPOSED arm - a grunt standing on the hero, 25 HP taken - reported Clear Aim
   still TRUE at the end of four seconds. That is not the dodge working, it is the grace: every hit
   that lands while Clear Aim is up REFRESHES the 0.75s rather than spending it, so a body being hit
   often enough never drops it, and the arm that exists to prove the probe can SEE a break instead
   proved that at rank 10 there is barely a break to see.
   So the rank is set to 9 for the two combat arms, where "a hit disables it" is the plain path the
   innate card describes, and rank 10 is reported alongside as its own row rather than deleted -
   because the difference between the two IS the Perfect Hunt card doing its job, and a reader who
   sees only the rank-9 number would think this probe had been tuned until it passed.
   Every window is pumped well past 0.75s after a hit regardless, and every arm now samples EVERY
   TICK: reading only the end state let a break that healed itself inside the window read as no
   break at all.

   Clear Aim is rebuilt from scratch inside each arm (empty room, pump past the 3.5s Patient Hunter
   needs — the A-side pick at r7, which cheatRank10All takes) rather than carried between them, so
   one arm cannot inherit the previous arm's answer.

   WATCHED IN BOTH DIRECTIONS: this reports the same verdict before and after the parting shot is
   added. Its job is to be the thing that would have caught the regression, not to change. */
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
  __BF3.meta.classId = 'ranger';

  /* Equip on-class through the game's own starter table. useSkill passes classFamilyOk(p.weapon)
     into every handler as `ok`, and the Arena's loadout is a sword. */
  let weaponNote = 'none';
  (function(){
    const tries = ['ranger'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = (i===0)?'own starter':('borrowed from '+tries[i]); return; }
    }
  })();

  const HOME = { x: p.x, z: p.z, y: p.y };
  const setRank = (r) => { try { __BF3.classState('ranger').rank = r; } catch(e){} return (__BF3.classState('ranger')||{}).rank; };

  /* Samples every tick, because the end state is not the story. `broke` is the question the card
     asks ("did a hit disable it"); `hits` counts the moments HP actually went down, so an arm that
     reports "Clear Aim survived" while nothing ever swung at the hero is visibly vacuous. */
  const pump = (n, pin) => {
    const r = { broke:false, hits:0, lastHitTick:-1, lastBreakTick:-1, hpLost:0 };
    let hp = p.hp;
    for(let k=0;k<n;k++){
      if(pin) p.invuln = Math.max(p.invuln||0, 1);
      try { __BF3.update(1/60); } catch(e){}
      if(p.hp < hp){ r.hits++; r.lastHitTick = k; r.hpLost += (hp - p.hp); }
      hp = p.hp;
      if(!p.clearAim){ r.broke = true; r.lastBreakTick = k; }
    }
    r.hpLost = Math.round(r.hpLost);
    r.clearAimAtEnd = !!p.clearAim;
    return r;
  };

  /* An empty room, a healthy body, and enough quiet seconds for the innate to arm. Patient Hunter
     (the r7 A pick) needs 3.5s; 5s is pumped. Returns whether it actually armed - if it did not,
     every verdict below is about a state the game was never in, and the probe says so instead of
     reporting a pass. */
  const armClearAim = () => {
    G.enemies.length = 0;
    p.x = HOME.x; p.z = HOME.z; p.y = HOME.y; p.vx = 0; p.vz = 0;
    p.hp = p.maxHp || 100; p.invuln = 0; p.dodgeTimer = 0;
    p._caGrace = 0; p._noHitT = 0; p.clearAim = false; p._caAnn = 0;
    pump(300, false);
    return !!p.clearAim;
  };
  const grunt = () => {
    const d = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
    if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    return d;
  };

  const out = { weaponNote, rankFromCheat: (__BF3.classState('ranger')||{}).rank };

  out.rankUsed = setRank(9);                           // the plain "a hit disables it" path; see the header

  // ── ARM 1: exposed. The direction that proves the probe can see Clear Aim break at all.
  {
    const armed = armClearAim(); const d = grunt();
    const r = pump(240, false);                        // 4s
    out.exposed = { armedFirst: armed, ...r, gruntDist: d ? Math.round(Math.hypot(d.x-p.x, d.z-p.z)) : null };
  }

  // ── ARM 2: dodged, then released. Phase two is this arm's proof that swings were available.
  {
    const armed = armClearAim(); const d = grunt();
    const held = pump(240, true);                      // 4s with i-frames pinned
    held.gruntDist = d ? Math.round(Math.hypot(d.x-p.x, d.z-p.z)) : null;
    p.invuln = 0; p.dodgeTimer = 0;                    // drop the guard; same grunt, same spot
    const rel = pump(240, false);
    out.dodged = { armedFirst: armed, whilePinned: held, afterRelease: rel };
  }

  // ── ARM 1b: the same exposed rig at rank 10, reported so the Perfect Hunt difference is visible.
  {
    setRank(10);
    const armed = armClearAim(); grunt();
    const r = pump(240, false);
    out.exposedAtRank10 = { armedFirst: armed, ...r };
    setRank(9);
  }

  // ── ARM 3: does the skill itself still grant the i-frames the clause depends on?
  {
    armClearAim();
    /* Slot 1, and it is not a guess: CLASS2.ranger.r4 carries `slot:1` on the card itself (2053),
       and useSkill casts c2CurSkills()[i] by that index. The cast is asserted below off p.dodgeTimer
       moving rather than off the return value, so a mis-slotted cast cannot read as a pass. */
    const slot = 1;
    let cast = null;
    try { cast = __BF3.useSkill(slot); } catch(e){ cast = 'threw: ' + e.message; }
    out.skill = { slot, invulnAfterCast: +(p.invuln||0).toFixed(3), dodgeTimerAfterCast: +(p.dodgeTimer||0).toFixed(3),
                  clearAimAfterCast: !!p.clearAim, castReturn: (cast===undefined?'undefined':cast) };
  }

  out.clearAimBreaksWhenExposed = (out.exposed.armedFirst === true && out.exposed.broke === true && out.exposed.hits > 0);
  out.dodgedHitKeepsClearAim    = (out.dodged.armedFirst === true && out.dodged.whilePinned.broke === false
                                   && out.dodged.whilePinned.hits === 0 && out.dodged.afterRelease.broke === true
                                   && out.dodged.afterRelease.hits > 0);
  out.tumbleStillGrantsIframes  = (out.skill.invulnAfterCast > 0 && out.skill.dodgeTimerAfterCast > 0);
  out.ok = out.clearAimBreaksWhenExposed && out.dodgedHitKeepsClearAim && out.tumbleStillGrantsIframes;
  return JSON.stringify(out);
})()
