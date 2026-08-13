/* THE WARRIOR'S CHARGE CARD SAYS 1.6x AND THE HANDLER SAYS 1.5

   Charge (warrior r4 a, index.html:2039): "Rush through enemies for 1.6x damage and stun them."
   `SKILL_FX.w_charge` is an alias for `wcharge` (10304), whose one and only damage literal is
   `*1.5*` (9914). One site, one literal, no second definition. Found by the skill-card NUMBER sweep,
   docs/SKILL_TRIAGE.md section Y - the sweep that exists because `harness/claims.js` reads which KIND
   of promise a card makes and `test-skills.js`'s own header says "the bar is EFFECT, not number", so
   a magnitude has never been checked by anything in this repo.

   TAKEABLE by this document's standing test: 1.6 is the card's own number, there is nothing to
   invent, and raising 1.5 to 1.6 adds the clause the card already sells without taking anything from
   anyone. Every other row in section Y's table runs the other way - the code is MORE generous than
   the card - so making those honest is a nerf and stays Oliver's.

   THE YARDSTICK IS MEASURED IN THE SAME GAME, so no absolute is ever written into a bar. Charge's
   dealt damage is read against SHOCKWAVE STOMP's, cast at the same body with the same weapon in the
   same launch. Stomp is 1.6x (9909) and this fix does not touch it, so:

       ratio = chargeDealt / stompDealt     1.5/1.6 = 0.938 before,  1.6/1.6 = 1.000 after

   THE YARDSTICK WAS SHIELD BASH FIRST AND IT READ ZERO, WHICH IS A BENCH FAULT WORTH RECORDING.
   Bash reaches its target through `projectileAimTarget` (10306), and that function's FIRST line
   (9689) is `const aim=playerAimYaw(p); if(meta.camMode!=='far') p.yaw=aim` - it OVERWRITES the yaw
   the probe set and then aims down the camera reticle. So a body placed along `p.yaw` is not where
   the game is looking, `aimTarget` returns null, and Bash silently casts CLEAVE instead (a different
   multiplier, aimed the same wrong way): `bash.dealt 0` in both halves, `stunT 0`, while Charge and
   Whirlwind in the same launch dealt 84 and 124. **A yardstick that reads zero fails loudly; one that
   had fallen through to Cleave and dealt SOMETHING would have been a wrong number that looked fine.**
   Stomp and Whirlwind are both RADIAL - they walk `combatTargets()` on distance alone and touch no
   yaw - so nothing in this probe now depends on where the camera happens to point.

   Everything `effPower` contributes - Weapon Master's +10%, the armour and skin multipliers, the
   innate fold - is common to both casts and divides out. That is the point of a ratio here: two
   launches of this probe read different absolutes (pass 49 measured the identical control cell at
   4.2973 and then 5.0278), so an absolute would call a +7% fix a +29% one.

   THE HALF THAT MUST NOT MOVE is WHIRLWIND, 2.2x (10308), measured against the same stomp in a
   second half: 2.2/1.6 = 1.375 before AND after. It shares slot 1 with Charge - it is the b-side of
   the same rank - so it is the closest thing in the game to Charge that this fix cannot reach.
   Stomp's own dealt number must also come back identical in both halves; if it does not, the two
   halves are not the same rig and no ratio in the run means anything.

   THREE CONFOUNDS ARE PINNED, EACH FOR A MEASURED REASON:
     - `G.combo` (10884) multiplies every blow by up to 1.20 off a run-wide counter that climbs as
       blows land. It is set to 0 every frame. `harness/probes/legion.probe.js` recorded what skipping
       this costs: two halves with identical picks dealing 352 and 408, i.e. a fabricated 1.159.
     - THE WEAPON'S ELEMENT IS STRIPPED. Whirlwind passes `ok?(w&&w.el):null` to `hitEnemy` while
       Charge (13291) and Stomp (9911) both pass a hard `null`, so an elemental weapon would add a
       modifier to one trial and not the others. The starter reads `el: null` already; stripping it
       is belt-and-braces and `weaponEl` reports what was there, so the reading is never silent.
     - `w_swift` (r3 b) multiplies every fourth hit by 1.25 (10870). Rank 3 is set to `w_heavy`
       explicitly rather than left to `cheatRank10All`'s A-side default, for the reason pass 49's
       probe records: a default that happens to be right today is not a control.

   PLAY-MODE RECEIPT, because AUTOPILOT.md demands one: a probe that drives the player will have the
   game stop under it and it looks like data. Ticks are counted, and the ticks that ran with
   `mode === 'play'` are counted separately. */
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
  __BF3.meta.classId = 'warrior';

  /* Through the game's own classStartWeapon, and in family: every SKILL_FX handler is handed
     `classFamilyOk(p.weapon)` as `ok`, and an off-family cast takes OFFCLASS_MUL - which would scale
     both casts equally but also flips Bash's element argument, so the rig would differ from a real
     warrior's in the one place this probe is sensitive. */
  let weaponNote = 'none';
  (function(){
    const tries = ['warrior'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();
  const weaponEl = (p.weapon && p.weapon.el) || null;
  if(p.weapon) p.weapon.el = null;

  const cs = __BF3.classState('warrior');
  cs.ch = cs.ch || {}; cs.rank = 10;
  cs.ch[3] = 'w_heavy';        // NOT w_swift: every fourth hit x1.25 would land in one trial and not the other

  const HOME = { x: p.x, y: p.y, z: p.z };
  let ticks = 0, playTicks = 0;

  const tick = (n) => {
    for(let k = 0; k < n; k++){
      ticks++;
      if(__BF3.mode === 'play') playTicks++;
      G.combo = 0;
      p.hp = __BF3.effMaxHp(p); p.invuln = Math.max(p.invuln || 0, 5);
      try { __BF3.update(1/60); } catch(e){}
    }
  };

  const reset = () => {
    G.enemies.length = 0;
    if(G.minions) G.minions.length = 0;
    if(G.projectiles) G.projectiles.length = 0;
    p.x = HOME.x; p.y = HOME.y; p.z = HOME.z; p.vx = 0; p.vz = 0;
    p.yaw = 0;                                  // +z, so dashZ = cos(0) = 1 carries the charge at the body
    p.chargeDash = 0; p.hp = __BF3.effMaxHp(p);
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) for(let i = 0; i < p.skillCd.length; i++) p.skillCd[i] = 0;
  };

  /* A body 60 units up +z: inside Stomp's radius of 150, inside Whirlwind's 165, and two frames into
     a 0.32s dash that covers 880 u/s. Frozen and unkillable so the geometry is the one thing
     identical across every trial. */
  const sink = () => {
    const e = __BF3.spawnEnemy('grunt', HOME.x, HOME.z + 60);
    if(e){ e.active = true; e.dead = false; e.hp = e.maxHp = 1e7; e.speed = 0; e.vx = 0; e.vz = 0; e.dropT = 0; }
    return e;
  };

  const slotOf = (re) => {
    const names = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : []).map(s => s && s.n);
    for(let i = 0; i < names.length; i++) if(re.test(String(names[i] || ''))) return i;
    return -1;
  };

  /* ONE CAST, MEASURED AS HP OFF A BODY, and the slot is found by NAME rather than assumed.
     `useSkill(i)` casts `c2CurSkills()[i]` and not `curSkills()[i]` - the mismatch that invalidated
     every verdict this suite had ever produced (faf52c3). */
  const trial = (re) => {
    reset();
    const slot = slotOf(re);
    if(slot < 0) return { why: 'no slot matched ' + re };
    const foe = sink();
    if(!foe) return { why: 'no sink could be spawned' };
    const before = foe.hp;
    p.mana = p.manam || p.manaMax || 999;
    if(p.skillCd) p.skillCd[slot] = 0;
    let threw = null, ret = null;
    try { ret = __BF3.useSkill(slot); } catch(e){ threw = String(e && e.message || e); }
    tick(40);                                    // 0.67s: the whole dash plus its contact frames
    return { slot: slot, dealt: Math.round(before - foe.hp), chDmg: p._chDmg != null ? Math.round(p._chDmg) : null,
             stunT: Math.round((foe.stunT || 0) * 100) / 100, refund: ret === 'refund', threw: threw };
  };

  const half = (r4) => {
    cs.ch[6] = 'w_stomp';                        // slot 2 - the yardstick. cheatRank10All's A-side is Iron Guard, which deals nothing.
    cs.ch[4] = r4;                               // slot 1 - Charge, or Whirlwind for the half that must not move
    return { pick: r4, stomp: trial(/stomp|shockwave/i), other: trial(r4 === 'w_charge' ? /charge/i : /whirl/i) };
  };

  const A = half('w_charge');
  const B = half('w_whirl');

  const round = (x) => x == null ? null : Math.round(x * 1000) / 1000;
  const ratio = (a, b) => (b && b > 0) ? round(a / b) : null;

  const rCharge = ratio(A.other.dealt, A.stomp.dealt);
  const rWhirl  = ratio(B.other.dealt, B.stomp.dealt);

  /* TOLERANCE 0.025. Every handler rounds its damage to a whole number before it lands and `hitEnemy`
     rounds again, which is worth about 1% at this weapon's scale - the first launch read whirl/charge
     as 1.476 where the literals say 1.467. The two bars this has to separate are 0.938 and 1.000, 62
     thousandths apart, so the window is well under half the gap and cannot blur it. */
  const near = (x, want) => x != null && Math.abs(x - want) < 0.025;

  const threwAnywhere = [A, B].some(h => h.stomp.threw || h.other.threw || h.stomp.why || h.other.why
                                      || h.stomp.refund || h.other.refund);
  const dealtOk  = [A, B].every(h => h.stomp.dealt > 0 && h.other.dealt > 0);
  const sameRig  = A.stomp.dealt === B.stomp.dealt;    // the yardstick itself, measured twice
  const modeOk   = ticks > 0 && playTicks === ticks;
  const clean    = !!(dealtOk && sameRig && modeOk && !threwAnywhere);

  return JSON.stringify({
    ok: !!(clean && near(rCharge, 1.000) && near(rWhirl, 1.375)),
    chargeIsOnItsCard: near(rCharge, 1.000),
    chargeIsStillTheOldNumber: near(rCharge, 0.938),
    whirlwindDidNotMove: near(rWhirl, 1.375),

    clean: clean,
    checks: { dealtOk: dealtOk, sameRig: sameRig, modeOk: modeOk, threwAnywhere: threwAnywhere },
    ratios: { chargeOverStomp: rCharge, whirlOverStomp: rWhirl },
    A: A, B: B,
    casts: (__BF3.c2CurSkills ? __BF3.c2CurSkills() : []).map(s => s && s.n),
    weapon: (p.weapon || {}).name, weaponNote: weaponNote, weaponEl: weaponEl,
    playTicks: playTicks + ' of ' + ticks,
  });
})()
