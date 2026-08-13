/* DOES A RANGED CLASS'S BASIC ATTACK ENTER ITS OWN IDENTITY HOOK?

   `CLASS_BASIC` (index.html:11300) is described in its own header as the keystone of the class
   rewrite: "there was nowhere for a class to say what its ORDINARY attack does. This is that place."
   Every wiring this sub-project has put into it — the stormcaller's chain (passes 37-40), the
   ranger's Ambusher (11), the pirate's loaded pistol (28), the ninja's mark (28), the paladin's oath
   — is entered from ONE line, index.html:10921:

       if(src===G.p && !(G&&G._desig)){ const _bh = CLASS_BASIC[meta.classId]; ... }

   A melee swing calls `hitEnemy(e,dmg,p,...)` and satisfies it. A PROJECTILE hit does not: the
   projectile step (13522) calls

       hitEnemy(e, pr.dmg, {x:pr.x-pr.vx*0.01, z:pr.z-pr.vz*0.01}, ...)

   — a synthetic src carrying the SHOT's position, because knockback is thrown away from where the
   bolt was, not from where the archer stands. It is not `G.p`, so `src===G.p` is false, and nine of
   the sixteen classes attack at range (attackStyle `mage` or `ranger`).

   THIS IS MEASURED HERE RATHER THAN READ because every probe that has ever exercised this hook took
   the melee door deliberately. `harness/probes/overcharge.probe.js` says so in its own comment: "A
   real swing was rejected for this bar: the stormcaller's starter is a magic weapon whose basic
   attack is a travelling projectile, so a swing measures aim and flight time as much as it measures
   the chain." That was the right call for measuring the ARC and it is exactly why nothing has ever
   asked whether a real shot reaches the hook at all.

   THREE TRIALS, ONE LAUNCH, ONE GEOMETRY:
     1. REAL SWING — `playerAttack()` through the game's own door, ticked until the bolt lands.
     2. MELEE DOOR — `hitEnemy(tgt, dmg, p, ...)`, the call a sword makes and the call every
        previous chain probe made. This is the positive control: it must arc, or the bench is broken
        rather than the game.
     3. SYNTHETIC SRC — `hitEnemy(tgt, dmg, {x,z}, ...)`, the projectile step's own call shape,
        transcribed. If trial 1 and trial 3 agree and trial 2 differs, the mechanism is the src
        identity and nothing else — not aim, not flight time, not the weapon.

   THE CLEAN-CHECK THAT MAKES TRIAL 1's ZERO MEAN ANYTHING: the shot has to have LANDED. A bolt that
   missed also arcs to nobody, and this sub-project has twice published a zero that was a probe
   missing rather than a game failing. Trial 1 reports the target's own HP loss and the tick it
   landed on, and `ok` is false if it never connected. */
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
  __BF3.meta.classId = 'stormcaller';

  /* The stormcaller, because it is the class whose whole tree is written about the hook — and the
     one whose chain three separate passes measured through the melee door. Its starter is a magic
     ranged weapon, which is the condition under test. */
  let weaponNote = 'none';
  (function(){
    const tries = ['stormcaller'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  /* RANK 9 with Overcharge, the same bench overcharge.probe.js uses: two arcs, well clear of zero,
     and short of the capstone's third so a rank-10 build cannot be the thing that differs. */
  const cs = __BF3.classState('stormcaller');
  cs.ch = cs.ch || {};
  cs.rank = 9;
  cs.ch[3] = 'st_overcharge';
  cs.ch[5] = 'st_ward';
  cs.ch[7] = 'st_amped';
  cs.ch[9] = 'st_master';

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };

  /* The overcharge probe's geometry verbatim: the target dead ahead, three neighbours inside the
     hook's 260 reach of it and one far outside, everything pinned and unkillable. */
  const setup = () => {
    G.enemies.length = 0;
    G.projectiles.length = 0;
    const tgt = __BF3.spawnEnemy('grunt', p.x,       p.z - 240);
    const n1  = __BF3.spawnEnemy('grunt', p.x +  80, p.z - 240);
    const n2  = __BF3.spawnEnemy('grunt', p.x + 140, p.z - 240);
    const far = __BF3.spawnEnemy('grunt', p.x + 900, p.z - 240);
    const all = [tgt, n1, n2, far];
    if(all.some(e => !e)) return null;
    for(const e of all){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0; e.hp = e.maxHp = 100000; e.stunT = 0;
    }
    p.yaw = Math.atan2(tgt.x - p.x, tgt.z - p.z);
    G.camYaw = p.yaw;
    tick(2);
    return { tgt: tgt, all: all };
  };

  const lossOf = (all, before) => all.map((e, i) => Math.round(before[i] - e.hp));

  /* TRIAL 1 — a real basic attack. Nothing is called that a player pressing the button would not. */
  const realSwing = (() => {
    const s = setup(); if(!s) return { why: 'bodies could not be spawned' };
    const before = s.all.map(e => e.hp);
    p.atkCd = 0;
    let threw = null;
    try { __BF3.playerAttack(); } catch(e){ threw = String(e && e.message || e); }
    const fired = G.projectiles.length;
    /* Tick until the bolt lands, then a few more so anything it triggers has run. A miss is a
       reported outcome, not a silent zero. */
    let landedAt = -1;
    for(let k = 0; k < 180; k++){
      tick(1);
      if(landedAt < 0 && s.tgt.hp < before[0]) landedAt = k;
      if(landedAt >= 0 && k > landedAt + 4) break;
    }
    const lost = lossOf(s.all, before);
    return { threw: threw, projectilesFired: fired, landedAtTick: landedAt,
             tgtLost: lost[0], n1Lost: lost[1], n2Lost: lost[2], farLost: lost[3],
             arcs: lost.slice(1).filter(v => v > 0).length, landed: lost[0] > 0 };
  })();

  /* TRIAL 2 — the melee door, the positive control. */
  const meleeDoor = (() => {
    const s = setup(); if(!s) return { why: 'bodies could not be spawned' };
    const before = s.all.map(e => e.hp);
    let threw = null;
    G._desig = false;
    try { __BF3.hitEnemy(s.tgt, 60, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const lost = lossOf(s.all, before);
    return { threw: threw, tgtLost: lost[0], n1Lost: lost[1], n2Lost: lost[2], farLost: lost[3],
             arcs: lost.slice(1).filter(v => v > 0).length };
  })();

  /* TRIAL 3 — the projectile step's own call shape, transcribed (index.html:13522). Same damage,
     same target, same frame budget; only the src object differs. */
  const syntheticSrc = (() => {
    const s = setup(); if(!s) return { why: 'bodies could not be spawned' };
    const before = s.all.map(e => e.hp);
    let threw = null;
    G._desig = false;
    try { __BF3.hitEnemy(s.tgt, 60, { x: s.tgt.x, z: s.tgt.z + 30 }, 0, 0, null); }
    catch(e){ threw = String(e && e.message || e); }
    const lost = lossOf(s.all, before);
    return { threw: threw, tgtLost: lost[0], n1Lost: lost[1], n2Lost: lost[2], farLost: lost[3],
             arcs: lost.slice(1).filter(v => v > 0).length };
  })();

  return JSON.stringify({
    weapon: p.weapon && p.weapon.name, weaponClass: p.weapon && p.weapon.cls, weaponNote: weaponNote,
    realSwing: realSwing, meleeDoor: meleeDoor, syntheticSrc: syntheticSrc,
    /* The verdict, stated as the comparison rather than as a number: the hook is reachable from the
       melee door, and the question is whether a real shot reaches it too. */
    ok: !!(realSwing.landed && meleeDoor.arcs > 0),
    hookReachedByRealSwing: realSwing.arcs > 0,
    mechanismIsTheSrc: !!(meleeDoor.arcs > 0 && syntheticSrc.arcs === 0),
  });
})()
