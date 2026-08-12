/* DOES JUGGERNAUT'S KNOCKBACK RESISTANCE EXIST?

   Warrior rank-9 option b (index.html:2044) reads: "+15% knockback resistance and +8% damage
   reduction while moving." docs/SKILL_TRIAGE.md section Q carries it as HALF wired — the damage half
   is `hurtPlayer`'s `dmg*=.92` while moving, and the knockback half had no reader anywhere in the
   file. `audit-passives.js` reports the id WIRED, correctly, because it asks whether anything
   mentions the id; the warrior has always reported 0/8 dead.

   NOTHING IS INVENTED: 15% is the card's own number and the knock-away is the game's own three lines
   in hurtPlayer, the same ones the berserker's Heavy Hands skips outright. This probe is
   heavyhands.probe.js's rig with the trials aimed at the other half of the same site.

   THREE HALVES IN ONE LAUNCH, so the yardstick is measured in the same game as the thing it judges:
     - control:   `w_master`, the genuine a-side of the SAME rank — the shipped behaviour
     - passive:   `w_juggernaut`
     - known-bad: `mon_iron`, an id nothing reads, from another class. `okAgainstInert` is what this
                  probe would have reported against the unfixed game and MUST be false.

   FOUR TRIALS PER HALF, one per clause of the card and one per thing the fix must not become:
     - `still`  — a hit from a known direction while standing. The throw must shrink by exactly the
                  card's 15%, measured against the CONTROL's own throw rather than against a
                  hard-coded 210, and `vy` must NOT move: the file's own comment says the vy launch is
                  the STAGGER, and stagger is a word on Heavy Hands' card, not on this one.
     - `dmgStill` — the same hit's hpLost. It must be IDENTICAL in every half: the +8% clause reads
                  `Math.hypot(p.vx,p.vz)>20` and the player is standing, so nothing here may change
                  damage. A wiring that reduced damage would be a different, better card.
     - `moving` — the same hit with the player already moving, which is the +8% clause's own
                  condition. Its hpLost must be LOWER than the control's, which is how this probe
                  proves it did not break the half that already worked.
     - `onGround` — false in every half. Resistance must not turn into "you are not launched at all",
                  which is Unyielding's card and a balance question this run is not allowed to answer. */
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
  __BF3.meta.camMode = 'far';

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

  const cs = __BF3.classState('warrior');
  cs.ch = cs.ch || {};
  /* The other three passive ranks are pinned to options that cannot touch this site.
     w_heavy is a flat damage/attack-speed pair; w_second only speaks below 35% HP and the trials keep
     the player at full; w_bloodlust is about momentum on a kill and nothing dies here.
     w_unyield is pinned AWAY deliberately — its reader is a damage reduction in the same block, and
     section Q refuses to touch that row, so a probe that steered into it would be measuring the row
     it is not allowed to fix. */
  cs.ch[3] = 'w_heavy';
  cs.ch[5] = 'w_second';
  cs.ch[7] = 'w_bloodlust';

  const MAXHP = Math.round(__BF3.effMaxHp(p));

  const reset = () => {
    G.enemies.length = 0;
    p.dead = false; p.downed = false;
    p.hp = MAXHP;
    p.invuln = 0; p.dodgeTimer = 0; p.dodgeCdT = 0; p.shieldHp = 0; p.shieldT = 0; p.guardT = 0;
    p.tacticalT = 0;
    p.vx = 0; p.vy = 0; p.vz = 0; p.onGround = true;
    p.yaw = 0; G.camYaw = 0;
  };

  /* A hit from a KNOWN direction, through the game's own hurtPlayer: the source sits 100 units south,
     so the throw is northward (+z) and vz carries the whole of it.
     `moveFirst` sets the player's own velocity above the +8% clause's 20-unit threshold BEFORE the
     hit, which is the only way to observe that clause. It is set on the axis the throw does not use,
     so it cannot contaminate the vz reading. */
  const hit = (moveFirst) => {
    reset();
    if(moveFirst){ p.vx = 200; }
    const hp0 = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(100, p.x, p.z - 100, { name:'the bench', attack:'a shove' }); }
    catch(e){ threw = String(e && e.message || e); }
    return { vz: Math.round(p.vz || 0), vy: Math.round(p.vy || 0), onGround: !!p.onGround,
             hpLost: hp0 - Math.round(p.hp), threw: threw };
  };

  const half = (pick) => {
    cs.ch[9] = pick;
    return { pick: pick, still: hit(false), moving: hit(true) };
  };

  const control = half('w_master');        // the genuine a-side of the same rank
  const jug     = half('w_juggernaut');
  const inert   = half('mon_iron');        // an id nothing reads, from another class

  const clean = (h) => !h.still.threw && !h.moving.threw && h.still.hpLost > 0 && h.moving.hpLost > 0;
  const allClean = [control, jug, inert].every(clean);

  /* The control's own throw is the yardstick, so 210 is never written down here. */
  const want = control.still.vz * 0.85;
  const bar = (h) => Math.abs(h.still.vz - want) <= 1          // 15% less throw, measured not assumed
                  && h.still.vz < control.still.vz - 5         // and visibly less than the control
                  && h.still.vy === control.still.vy           // the stagger pop is untouched
                  && h.still.onGround === false                // still launched, not immune
                  && h.still.hpLost === control.still.hpLost    // standing still, damage unchanged
                  && h.moving.hpLost < control.moving.hpLost;   // the +8% clause still works

  return JSON.stringify({
    ok: !!(allClean && bar(jug)),
    okAgainstInert: !!(allClean && bar(inert)),
    allClean: allClean, maxHp: MAXHP, wantVz: Math.round(want),
    control: control, jug: jug, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
