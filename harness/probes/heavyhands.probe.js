/* DOES HEAVY HANDS DO ANYTHING AT ALL?

   Berserker rank-3 option a (index.html:2130) reads: "You cannot dodge - but nothing can knock you
   back or stagger you." `harness/audit-passives.js` says the id `bsk_heavy` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else, so nothing in the game ever consults it. It is one of the 31 in
   docs/SKILL_TRIAGE.md section E.

   NOTHING IS INVENTED, AND THIS IS THE FIRST ROW IN THE SECTION WITH NO NUMBER ON EITHER SIDE. Both
   halves are booleans over mechanisms that already exist and already run on every player:
     - the knock-back is `hurtPlayer` 11470-11471, which throws the player away from the source at a
       fixed 210 with vy 160 and clears onGround. That launch IS the stagger - there is no separate
       stagger state in the file - so "knock you back or stagger you" is one line to skip.
     - the dodge is the `input.dodgeEdge` gate at 12915. "You cannot dodge" is that gate refusing.
   No amount, no duration and no radius had to be chosen, which is why this row was takeable.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. The control is
   `bsk_reckless`, the genuine b-side of this rank - and it is ITSELF still dead, which is stated
   rather than hidden: it doubles as an inert control, so a third half carries `mon_iron`, a dead
   passive from another class, as the cross-class known-bad. Both must fail the bar.

   THREE TRIALS PER HALF, because the card has two promises and one thing it must NOT become:
     - `knock`  - a hit from a known direction through the game's own hurtPlayer. The player must be
                  thrown in the control and stand still under the passive.
     - `damage` - read off that same hit. A wiring that early-returned out of hurtPlayer would look
                  exactly like knockback immunity and would in fact be DAMAGE immunity, which is a
                  different and far better card than the menu shows. HP must drop in every half.
     - `dodge`  - the game's own dodgeEdge, ticked through the game's own update(). Must fire in the
                  control and refuse under the passive, because the drawback is half the card and a
                  wiring that granted the immunity without taking the dodge would be a strict upgrade.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: c2Passive
   (9987) is a plain id lookup over ranks 3/5/7/9, so any id nothing reads reproduces exactly the
   state the shipped game was in here. `okAgainstInert` is what this probe would report against the
   unfixed game, and it must be false while `ok` is true. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

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
  __BF3.meta.classId = 'berserker';
  __BF3.meta.camMode = 'far';

  let weaponNote = 'none';
  (function(){
    const tries = ['berserker'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned to options that cannot move the body or refuse an input.
     bsk_thick is a death save at 1 HP and bsk_rage only speaks below a quarter health - the trials
     below keep the player near full, so both are inert here. bsk_frenzy is pinned AWAY deliberately:
     it hard-locked the game until 7122bd9 and a probe that steers into it is measuring that instead. */
  cs.ch[5] = 'bsk_thick';
  cs.ch[7] = 'bsk_rage';
  cs.ch[9] = 'bsk_brutal';

  const MAXHP = Math.round(__BF3.effMaxHp(p));

  const reset = () => {
    G.enemies.length = 0;
    p.dead = false; p.downed = false;
    p.hp = MAXHP;
    p.invuln = 0; p.dodgeTimer = 0; p.dodgeCdT = 0; p.shieldHp = 0; p.shieldT = 0;
    p.vx = 0; p.vy = 0; p.vz = 0; p.onGround = true;
    p.yaw = 0; G.camYaw = 0;
    IN.jx = 0; IN.jz = 0; IN.jump = false; IN.jumpEdge = false; IN.dodgeEdge = false;
  };

  /* A hit from a KNOWN direction, through the game's own hurtPlayer: the source sits 100 units south
     of the player, so an unmodified game throws the player north (+z) at the fixed 210. */
  const knock = () => {
    reset();
    const hp0 = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(10, p.x, p.z - 100, { name:'the bench', attack:'a shove' }); }
    catch(e){ threw = String(e && e.message || e); }
    const vz = Math.round(p.vz || 0), vy = Math.round(p.vy || 0);
    return {
      vx: Math.round(p.vx || 0), vz: vz, vy: vy, onGround: !!p.onGround,
      moved: Math.hypot(p.vx || 0, p.vz || 0) > 1 || (p.vy || 0) > 1 || !p.onGround,
      hpLost: hp0 - Math.round(p.hp), threw: threw,
    };
  };

  /* The game's own dodge, through the game's own update(). Nothing here reimplements the gate. */
  const dodge = () => {
    reset();
    IN.dodgeEdge = true;
    let threw = null;
    try { __BF3.update(1/60); } catch(e){ threw = String(e && e.message || e); }
    return {
      fired: (p.dodgeTimer || 0) > 0, dodgeTimer: +(p.dodgeTimer || 0).toFixed(3),
      cd: +(p.dodgeCdT || 0).toFixed(2), threw: threw,
    };
  };

  const half = (pick) => {
    cs.ch[3] = pick;
    return { pick: pick, knock: knock(), dodge: dodge() };
  };

  const control = half('bsk_reckless');   // the genuine b-side of this rank - and itself still dead
  const heavy   = half('bsk_heavy');
  const inert   = half('mon_iron');       // an id nothing reads, from another class

  const clean = (h) => !h.knock.threw && !h.dodge.threw && h.knock.hpLost > 0;
  const allClean = [control, heavy, inert].every(clean);

  /* The bar, one clause per clause of the card.
     - the control is thrown and can dodge (the shipped game)
     - the passive half is NOT thrown, CANNOT dodge, and still takes the damage */
  const controlHeld = control.knock.moved === true && control.dodge.fired === true;
  const bar = (h) => h.knock.moved === false && h.dodge.fired === false && h.knock.hpLost > 0;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(heavy)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld, maxHp: MAXHP,
    control: control, heavy: heavy, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
