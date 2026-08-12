/* DOES BLESSED BLADE DO ANYTHING AT ALL?

   Paladin rank-9 option b (index.html:2100) reads: "Your oath can be sworn at any range - mark
   without closing." `harness/audit-passives.js` says the id `pal_blessed` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else, so nothing in the game ever consults it. It is one of the 32 in
   docs/SKILL_TRIAGE.md section E, and the LAST one the Paladin has.

   NOTHING IS INVENTED. The oath already exists and is already sworn by the class's own basic-attack
   hook (CLASS_BASIC.paladin, index.html:11224), which `hitEnemy` calls only when a swing CONNECTS -
   so without this passive you must walk into melee to mark anything. The card changes exactly one
   thing about that, the RANGE, and it states the range itself: "any". So the wiring swears on the
   SWING rather than on the hit, at Infinity, and invents no number. Targeting is the game's own
   `aimTarget` with the ranged profile, so the foe must still be inside the 90-degree sight cone with
   an unobstructed line - "mark without closing" is about distance, not about marking through walls.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. `pal_will`
   (Guardian's Will) is the control: the a-side of this very rank, wired, and about damage taken
   below half HP - it cannot swear anything.

   THREE TRIALS PER HALF, because the card has a promise and two things it must NOT quietly become:
     - `far`    - a foe well beyond any melee reach, straight ahead. The promise. Must be sworn only
                  in the passive half.
     - `behind` - the same foe placed straight BEHIND the player. A wiring that swore the nearest
                  enemy anywhere on the map would satisfy a naive one-trial bar and would be a
                  strictly different, strictly better card than the menu shows - the kind of bug
                  nobody reports. Must be sworn in NO half.
     - `near`   - a foe hit at melee range through the game's own `hitEnemy`. This is the UNCHANGED
                  base path, so it must be sworn in EVERY half. Without it the control's zero could
                  just as well be a bench that cannot observe an oath at all, and the whole A/B would
                  be measuring nothing.

   The distances are reported against `aimReach` - `(w.range+40)*1.6`, the reach playerAttack's own
   aim uses - so "well beyond melee" is a number in the output rather than a claim in this comment.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   puts `mon_iron` - a passive from docs/SKILL_TRIAGE.md section E that is still dead, and belongs to
   another class - into the same rank slot. c2Passive (9987) is a plain id lookup over ranks 3/5/7/9,
   so any id nothing reads reproduces exactly the state the shipped game was in here.
   `okAgainstInert` is therefore what this probe would report against the unfixed game, and it must
   be false while `ok` is true. */
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
  __BF3.meta.classId = 'paladin';
  /* World-space steering, so playerAimYaw reads p.yaw rather than the camera - the same line
     harness/probes/level.probe.js sets for the same reason. */
  __BF3.meta.camMode = 'far';

  let weaponNote = 'none';
  (function(){
    const tries = ['paladin'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('paladin');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned to wired options that cannot mark anything, so the only thing
     that can swear an oath at range is the rank under test. */
  cs.ch[3] = 'pal_thick';
  cs.ch[5] = 'pal_second';
  cs.ch[7] = 'pal_bounce';

  const w = p.weapon || {};
  const aimReach = Math.round(((w.range || 0) + 40) * 1.6);   // playerAttack's own melee aim reach
  const FAR = 600;

  const spawnAt = (dz) => {
    G.enemies.length = 0;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z + dz);
    if(!foe) return null;
    foe.active = true; foe.dead = false; foe.hp = foe.maxHp = 100000;
    return foe;
  };

  const reset = () => {
    p._oath = null; p.dead = false; p.downed = false;
    p.atkCd = 0; p.atkTimer = 0;
    p.yaw = 0;                       // forward is (sin yaw, cos yaw) - yaw 0 looks down +z
    G.camYaw = 0; G._desig = false;
  };

  /* A SWING, not a hit: playerAttack sets the swing timer and resolveSwing lands it later out of
     update(), which this deliberately never ticks. So anything sworn here was sworn without the
     blade ever touching the target, which is the whole of the card. */
  const swing = (dz) => {
    reset();
    const foe = spawnAt(dz);
    if(!foe) return { why:'no target could be spawned' };
    const dist = Math.round(Math.hypot(foe.x - p.x, foe.z - p.z));
    let aimSees = false;
    try { aimSees = __BF3.aimTarget(p, { cls:'ranged' }, Infinity) === foe; } catch(e){}
    let threw = null;
    try { __BF3.playerAttack(); } catch(e){ threw = String(e && e.message || e); }
    return { dist: dist, aimSees: aimSees, sworn: p._oath === foe, hurt: foe.hp < 100000, threw: threw };
  };

  /* The unchanged base path: a connecting basic hit, through the game's own hitEnemy. */
  const nearHit = () => {
    reset();
    const foe = spawnAt(60);
    if(!foe) return { why:'no target could be spawned' };
    let threw = null;
    try { __BF3.hitEnemy(foe, 5, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    return { dist: Math.round(Math.hypot(foe.x - p.x, foe.z - p.z)), sworn: p._oath === foe, threw: threw };
  };

  const half = (pick) => {
    cs.ch[9] = pick;
    return { pick: pick, far: swing(FAR), behind: swing(-FAR), near: nearHit() };
  };

  const control = half('pal_will');       // a-side of the same rank: wired, and marks nothing
  const blessed = half('pal_blessed');
  const inert   = half('mon_iron');       // an id nothing reads - the permanent known-bad

  const clean = (h) => !h.far.threw && !h.behind.threw && !h.near.threw
                    && h.far.dist > aimReach && h.behind.dist > aimReach
                    && h.near.sworn === true;     // the oath mechanism is live in this bench
  const allClean = [control, blessed, inert].every(clean);

  /* The bar, one clause per clause of the card.
     - far + the passive: sworn, without the swing ever landing
     - behind + the passive: NOT sworn ("mark without closing" is about distance, not about facing)
     - the control: nothing sworn at range, in either direction */
  const controlHeld = control.far.sworn === false && control.behind.sworn === false;
  const bar = (h) => h.far.sworn === true && h.behind.sworn === false && h.far.hurt === false;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(blessed)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld,
    aimReach: aimReach, far: FAR,
    control: control, blessed: blessed, inert: inert,
    weapon: w.name, weaponCls: w.cls, weaponNote: weaponNote,
  });
})()
