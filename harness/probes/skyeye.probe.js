/* DOES HUNTER'S EYE (THE PASSIVE) DO ANYTHING AT ALL?

   Skylancer rank-7 option b (index.html:2206) reads: "Attacking while falling drives you down onto
   the target." `harness/audit-passives.js` says the id `sky_eye` appears exactly twice in the whole
   of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and
   nowhere else. It is one of the 37 in docs/SKILL_TRIAGE.md section E.

   NOTHING HERE IS INVENTED, and for this card that had to be checked twice because the card states
   no number at all. The EVENT is the class's own airborne basic attack, which `CLASS_BASIC.skylancer`
   already tests for (`!p.onGround && p.y > 6`, and `p.vy < 0` for falling - the innate's hang reads
   the same two fields). The DRIVE is Dive Strike's own, verbatim: `SKILL_FX.sky_dive` (10264) sets
   `p.vx/p.vz` to 520 along the heading and `p.vy = Math.min(p.vy, -360)`. So the passive turns the
   ordinary airborne attack into the dive the class already has, aimed at the target instead of at the
   camera - the same shape as mon_flow taking the monk innate's own 0.35 rather than a new number.

   THE MEASUREMENT IS KINEMATIC, NOT A DAMAGE NUMBER, because the card promises movement and says
   nothing about damage. Both halves must deal the SAME damage: a wiring that quietly paid a damage
   bonus would be a different promise than the one on the card, and it would pass a damage-only bar.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only difference
   between the halves is which passive is chosen. `sky_float` (Long Flight) is the control: it is the
   a-side of this very rank and it is WIRED (10022, it softens gravity while falling), so a control
   that does not dive says the dive is the PASSIVE and not the airborne branch. It cannot contaminate
   the reading either - it acts inside `update()`, and no frame is stepped between the setup and the
   strike.

   TWO STRIKES PER HALF, because "while FALLING" is half the sentence. A wiring that drove you down
   whenever you were airborne would satisfy a naive one-strike bar and would be a worse bug - it would
   cancel the class's own rising attacks. The second strike of each half is taken while RISING and
   must leave the body exactly as it found it, in both halves.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   feeds `sky_armor` - another passive from docs/SKILL_TRIAGE.md section E, still dead - to the
   identical bar. `okAgainstInert` is therefore what this probe would report against the shipped game,
   and it must be false while `ok` is true.

   G.combo IS PINNED BEFORE EVERY STRIKE. hitEnemy (10668) does
   `dmg = round(dmg * mod * (1 + min(0.2, G.combo*0.004)))` and increments the counter on every hit,
   so two strikes in a sequence are never measured under the same multiplier unless it is reset. That
   is global, not a monk mechanic (harness/probes/monkiller.probe.js found it), and here it would make
   the "same damage in both halves" assertion impossible to hold. */
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
  __BF3.meta.classId = 'skylancer';

  /* The Arena hands out its own loadout, which is usually off-class. Equip through the game's own
     starter table: the bench's rule is to stand where the game would let you stand, and the game
     hard-blocks an off-class weapon (13220). */
  let weaponNote = 'none';
  (function(){
    const tries = ['skylancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('skylancer');
  cs.ch = cs.ch || {};

  const BASE = 100;
  const GROUND = p.y;            // where the hero stands now; every trial lifts off from here
  const REACH = 140;             // the foe sits due -z of the hero, on the ground, this far away

  const strike = (pick, rising) => {
    cs.ch[7] = pick;

    G.enemies.length = 0;
    p.hp = __BF3.effMaxHp(p);
    p.dead = false; p.downed = false;

    const foe = __BF3.spawnEnemy('grunt', p.x, p.z - REACH);
    if(!foe) return { pick: pick, rising: rising, why: 'no target could be spawned' };
    foe.active = true; foe.hp = foe.maxHp = 100000;

    /* Airborne over the spot the hero was standing on, so `p.y > 6` is true whatever the floor is,
       and moving straight up or straight down with no horizontal drift of its own - so any heading
       the strike leaves behind was put there by the code under test. */
    p.onGround = false;
    p.y = GROUND + 140;
    p.vy = rising ? 200 : -100;
    p.vx = 0; p.vz = 0;
    p.yaw = 0;                                    // deliberately NOT aimed at the foe: the card says onto the TARGET

    const before = { vy: p.vy, x: Math.round(p.x), z: Math.round(p.z) };

    G.combo = 0; G.comboT = 0;
    const hp0 = foe.hp;
    let threw = null;
    try { __BF3.hitEnemy(foe, BASE, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }

    const vx = p.vx || 0, vz = p.vz || 0, sp = Math.hypot(vx, vz);
    /* Cosine between the heading the strike left and the direction of the foe. 1 is straight at it. */
    const ux = foe.x - before.x, uz = foe.z - before.z, ud = Math.hypot(ux, uz) || 1;
    const aim = sp > 0 ? (vx * ux + vz * uz) / (sp * ud) : null;

    return {
      pick: pick, rising: rising, threw: threw,
      vyBefore: Math.round(before.vy), vyAfter: Math.round(p.vy),
      horiz: Math.round(sp), aim: aim == null ? null : Math.round(aim * 1000) / 1000,
      dmg: hp0 - foe.hp,
    };
  };

  const half = (pick) => ({ fall: strike(pick, false), rise: strike(pick, true) });

  const control = half('sky_float');     // a-side of the same rank: wired, softens the fall, never dives
  const eye     = half('sky_eye');
  const inert   = half('sky_armor');     // still dead - the permanent known-bad

  /* The bar, one clause per clause of the card.
     - falling + the passive: driven down at Dive Strike's own -360 or harder, and aimed at the foe
     - falling + no passive:  the innate's hang, vy damped to 55% and no heading at all
     - rising:                untouched, in BOTH halves ("while falling")
     - damage:                identical everywhere (the card promises movement, not damage) */
  const bar = (h) =>
    !h.fall.threw && !h.rise.threw &&
    h.fall.vyAfter <= -360 &&                                   // the dive
    h.fall.horiz > 0 && h.fall.aim != null && h.fall.aim > 0.99 &&  // onto the TARGET, not along the yaw
    h.rise.vyAfter === h.rise.vyBefore && h.rise.horiz === 0;   // only while falling

  const controlHeld =
    !control.fall.threw && !control.rise.threw &&
    control.fall.vyAfter === Math.round(control.fall.vyBefore * 0.55) &&   // the innate's hang, unchanged
    control.fall.horiz === 0 &&
    control.rise.vyAfter === control.rise.vyBefore && control.rise.horiz === 0;

  const dmgs = [control.fall.dmg, control.rise.dmg, eye.fall.dmg, eye.rise.dmg];
  const sameDamage = dmgs.every(d => d > 0 && d === dmgs[0]);

  return JSON.stringify({
    ok: !!(controlHeld && sameDamage && bar(eye)),
    okAgainstInert: !!(controlHeld && sameDamage && bar(inert)),   // must be false, or the bar proves nothing
    controlHeld: controlHeld, sameDamage: sameDamage, damage: dmgs,
    control: control, eye: eye, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
