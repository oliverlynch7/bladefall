/* DOES SWAGGER (THE PASSIVE) DO ANYTHING AT ALL?

   Pirate rank-5 option b (index.html:2144) reads: "While your pistol is loaded you move noticeably
   faster." `harness/audit-passives.js` says the id `pir_swagger` appears exactly twice in the whole of
   public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and nowhere
   else. It is one of the rows in docs/SKILL_TRIAGE.md section E.

   NOTHING HERE IS INVENTED.
   - The condition is the pistol state the class already keeps and a SIBLING PASSIVE already reads:
     `p._loaded`, spent in CLASS_BASIC.pirate (11267) and reloaded on a kill in killEnemy (10939),
     with Cutthroat (`pir_brutal`) reading the spent half of it at 11265. So "while your pistol is
     loaded" needs no new bookkeeping, no timer and no threshold.
   - The size of "noticeably faster" is the pirate's OWN move-speed step, taken from the clause
     immediately beside it in effSpeed: the Dread Captain capstone is `v*=1.10` for this same class in
     this same function. A number the class already moves by is a better answer than a number chosen
     to look reasonable.

   THE BAR IS DISTANCE WALKED, NOT effSpeed(). The card promises the player MOVES faster, and this
   sub-project keeps re-learning that the bar has to be the thing the card promises rather than the
   thing the code sets - Burning Light passed a stack-count assertion while burning nobody. A
   multiplier that lands in the function and never reaches the body would satisfy an effSpeed reading
   and fail this one.

   MEASURED AT TERMINAL SPEED. 30 warm-up ticks are run before the stopwatch starts, because the body
   accelerates from a standstill and a fixed acceleration would dilute the ratio toward 1 - which is
   the direction that hides a real bonus.

   THE PISTOL IS EMPTIED AND RELOADED BY THE GAME, never by assignment. `_loaded` is the field under
   test's own input, so a probe that wrote it would be feeding the assertion its own answer:
   - loaded: a grunt spawned at 1 HP and struck, so killEnemy runs the class's reload rider.
   - spent: a grunt at 100000 HP struck once, so CLASS_BASIC.pirate fires the shot and spends it.
   Each trial reports the flag it actually measured under.

   THREE HALVES IN ONE LAUNCH: the control is `pir_swift` (Quick Hands, r3 b) - wired, and a chest
   reload has nothing to do with movement - and the known-bad is `mon_iron`, a dead id fed to the
   identical bar, so `okAgainstInert` is what this probe would say against the shipped game.

   TWO TRIALS PER HALF, because "while your pistol is loaded" is half the sentence. A passive that
   simply made the pirate faster would satisfy a loaded-only reading and would be a different, worse
   bug: the spent trial must come back to the control's number. */
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
  __BF3.meta.pirateSlot = 'basic';       // the pistol on the basic attack, which is where 11262 fires it

  /* The pirate cannot equip its own starter (docs/SKILL_TRIAGE.md section D: the flintlock is not in
     its own family list), so the bench borrows the first in-family starter the game would allow -
     the same fallback harness/probes/deadaim.probe.js uses, and it is reported rather than hidden. */
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
  __BF3.meta.camMode = 'far';             // world-space steering; camera-relative would spin (see level.probe.js)

  let threw = null;
  const home = { x: p.x, z: p.z, y: p.y };

  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  /* Walk due north through the game's own input channel and report the ground covered at terminal
     speed. The body is put back afterwards so every trial starts from the same square. */
  const walk = () => {
    p.x = home.x; p.z = home.z;
    p.dodgeCdT = 0; p.dodgeTimer = 0;
    IN.jx = 0; IN.jz = -1;
    tick(30);                             // warm-up: reach terminal speed before the stopwatch starts
    const s = { x: p.x, z: p.z };
    tick(60);
    const d = Math.hypot(p.x - s.x, p.z - s.z);
    IN.jx = 0; IN.jz = 0;
    tick(2);
    return Math.round(d * 100) / 100;
  };

  const reload = () => {                  // a kill, so the game's own rider reloads (10939)
    G.enemies.length = 0;
    const e = __BF3.spawnEnemy('grunt', p.x, p.z - 70);
    if(!e) return 'no target';
    e.active = true; e.hp = e.maxHp = 1;
    try { __BF3.hitEnemy(e, 500, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
    G.enemies.length = 0;
    return p._loaded;
  };

  const fire = () => {                    // one shot into something that cannot die, so it is SPENT
    G.enemies.length = 0;
    const e = __BF3.spawnEnemy('grunt', p.x, p.z - 70);
    if(!e) return 'no target';
    e.active = true; e.hp = e.maxHp = 100000;
    try { __BF3.hitEnemy(e, 100, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
    G.enemies.length = 0;
    return p._loaded;
  };

  const trial = (pick) => {
    cs.ch[5] = pick;
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;

    const lf = reload();
    const loadedFlag = p._loaded;
    const loaded = walk();

    const sf = fire();
    const spentFlag = p._loaded;
    const spent = walk();

    return { pick: pick, loadedFlag: loadedFlag, spentFlag: spentFlag,
             loaded: loaded, spent: spent,
             ratio: spent ? Math.round((loaded / spent) * 1000) / 1000 : null,
             reload: lf, fire: sf };
  };

  const control = trial('pir_swift');     // wired, and a chest reload has nothing to do with movement
  const swagger = trial('pir_swagger');
  const inert   = trial('mon_iron');      // known-bad: a dead id through the identical bar

  /* Every half must really have been loaded for its first walk and spent for its second, or the two
     numbers are not the two states the card distinguishes. */
  const staged = (t) => !!(t && t.loadedFlag !== false && t.spentFlag === false && t.loaded > 0 && t.spent > 0);
  /* THE TOLERANCE IS THE MEASURED NOISE FLOOR, NOT A ROUND NUMBER. Six walks of the unfixed game came
     back 245.42 / 245.83 / 245.67 / 245.83 / 245.67 / 245.83 - ratios of 0.998 and 0.999 - because a
     tick-quantised walk cannot land on the same tenth of a unit twice. An exact-equality bar was red
     against a game that was behaving correctly. 1% admits that drift and still leaves the 10% the
     card promises ten times clear of it. */
  const near = (a, b, tol) => a != null && b != null && Math.abs(a - b) <= (tol == null ? 0.01 : tol);

  const ok = !!(staged(control) && staged(swagger) && staged(inert) && !threw
                && near(control.ratio, 1)                    // the control never speeds up
                && near(inert.ratio, 1)
                && near(swagger.ratio, 1.1)                  // the class's own move-speed step, while loaded
                && near(swagger.spent, control.spent, 1));   // and NOT while spent

  return JSON.stringify({
    ok: ok,
    okAgainstInert: !!(staged(inert) && near(inert.ratio, 1.1)),   // what this says against the shipped game
    control: control, swagger: swagger, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
