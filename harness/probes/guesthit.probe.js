/* DOES A CO-OP GUEST'S SHOT REACH THE HOST AT ALL?

   Found by the argument sweep docs/superpowers/plans/2026-08-10-skill-correctness.md names after
   pass 55: `hurtPlayer`'s `by` was swept because a probe's bar rode on it, and the generalisation is
   that EVERY argument the game passes between subsystems has the same failure mode. `hitEnemy`'s
   `src` is the biggest of them, and section U is only one of its readers. This is another.

   THE GUEST RELAY, index.html:10869:

     if(MP.active && !MP.isHost && e && e.mid!=null && !e.dummy && !e.practice
        && (src===G.p || (src && src.pet))){
       MP.sendHit(e.mid, dmg, kb||0, el||null, src.x, src.z); … return; }

   The host owns enemy HP in co-op, so a guest must RELAY its damage and never apply it. The guard
   is the same `src===G.p` comparison section U is about, plus the `src.pet` clause its own comment
   explains was added because pets "appear to attack locally, then the host snapshot restores the
   mob's HP and makes Necromancer summons (and pets) effectively deal zero shared damage."

   A PLAYER PROJECTILE PASSES NEITHER. index.html:13603 is

     hitEnemy(e, pr.dmg, {x:pr.x-pr.vx*0.01, z:pr.z-pr.vz*0.01}, pr.kb, effLifesteal(G.p), pr.el);

   a bare position — the shot's own, because knockback is thrown from the bolt rather than from the
   caster. It is not `G.p` and it has no `.pet`, so on a guest the relay does not fire, execution
   falls through to `e.hp-=dmg` at 10945, and `applyEnemies` (12517) overwrites that HP with the
   host's value on the next snapshot. That is word for word the failure the pet clause was written
   to stop, in the one place nobody re-read.

   NINE OF SIXTEEN CLASSES ATTACK AT RANGE, so if this reads the way the source says, a guest
   playing any of them deals nothing a party can see — and every projectile SKILL, on every class,
   is in the same state. docs/VISION.md's priority #1.

   WHAT THIS MEASURES, AND WHY EACH TRIAL IS HERE. `MP.sendHit` is a no-op without a live host
   connection (12510 returns unless `hostConn.open`), so the relay cannot be observed by its effect
   and is WRAPPED instead — restored in a `finally`, like every field this probe touches.

     1. melee door, as a guest      — `hitEnemy(e,d,p,…)`, what resolveSwing calls: must RELAY
     2. pet door, as a guest        — `{x,z,pet:true}`, the clause already fixed: must RELAY
     3. A REAL SHOT, as a guest     — `playerAttack()` on a mage, ticked until the bolt lands
     4. 13603's shape, transcribed  — the same call with no flight, so a zero in 3 cannot be blamed
                                      on aim or on a guest not simulating projectiles
     5. melee door as the HOST      — must NOT relay, because a host applies damage itself

   Trial 5 is what stops "0 relays" from being read as broken instrumentation, and trials 1 and 2
   are what stop it being read as a guard that never fires. THE TWO HALVES OF THE ROW ARE MEASURED
   IN ONE READING: a relayed hit returns before 10945, so a working door shows `relayed 1, hpLost 0`
   and a broken one shows `relayed 0, hpLost > 0` — the damage is not merely unsent, it is applied
   to a body the host is about to overwrite. */
(function(){
  const G = __BF3.G, p = G && G.p, MP = __BF3.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!G || !p) return JSON.stringify({ ok:false, why:'no live run' });

  /* The game stops under a probe that drives it, and that reads as data — AUTOPILOT.md's rule.
     Knock on the game's own door rather than assigning `mode`, which is a getter with no setter. */
  if(__BF3.mode !== 'play'){
    for(const sel of ['#shadeGo', '#hubTutGo', '#resBtn']){
      const b = document.querySelector(sel); if(b && b.offsetParent !== null){ try { b.click(); } catch(e){} }
    }
  }
  let playTicks = 0, asked = 0, leftPlayAt = null;
  const tick = (n) => { for(let k = 0; k < n; k++){ asked++;
    if(__BF3.mode === 'play'){ __BF3.update(1/60); playTicks++; }
    else if(leftPlayAt == null) leftPlayAt = asked; } };

  const SAVED = { active:MP.active, isHost:MP.isHost, pvp:MP.pvp, peers:MP.peers,
                  sendHit:MP.sendHit, cid:__BF3.meta.classId, weapon:p.weapon, yaw:p.yaw,
                  x:p.x, z:p.z, atkCd:p.atkCd, mana:p.mana };

  let relays = [];
  MP.sendHit = function(mid, dmg, kb, el, sx, sz){ relays.push({ mid:mid, dmg:dmg }); };

  const asGuest = () => { MP.active = true;  MP.isHost = false; MP.pvp = false; MP.peers = {}; };
  const asHost  = () => { MP.active = true;  MP.isHost = true;  MP.pvp = false; MP.peers = {}; };

  let out;
  try {
    __BF3.cheatUnlockClasses();
    __BF3.cheatRank10All();
    __BF3.meta.classId = 'mage';                       // attackStyle 'mage' — the basic attack is a bolt
    /* Through the game's own equip path, never by hand: a bench holding an off-class weapon is
       fault 1 of this sub-project's own triage. */
    let weaponNote = 'none';
    try { const w = __BF3.classStartWeapon('mage');
          if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = 'own starter'; } } catch(e){}

    const MID = 770001;
    const setup = () => {
      G.enemies.length = 0;
      if(G.projectiles) G.projectiles.length = 0;
      const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
      if(!foe) return null;
      foe.active = true; foe.dummy = false; foe.practice = false; foe.elite = false; foe.boss = false;
      foe.speed = 0; foe.immobile = true; foe.hp = foe.maxHp = 100000; foe.stunT = 0;
      foe.mid = MID;                                   // the host's id for this body: what a relay names
      p.yaw = Math.atan2(foe.x - p.x, foe.z - p.z);
      G.camYaw = p.yaw;
      p.mana = p.maxMana || 100;
      tick(2);
      return foe;
    };

    /* One trial: run `fire` against a fresh body and report BOTH halves — what was relayed and what
       was taken off the local body. */
    const trial = (label, mode, fire) => {
      const foe = setup();
      if(!foe) return { label:label, why:'no body could be spawned' };
      mode();
      relays = [];
      const hp0 = foe.hp;
      let threw = null, fired = 0, landedAt = -1;
      try { fired = fire(foe) || 0; } catch(e){ threw = String(e && e.message || e); }
      if(fired){
        for(let k = 0; k < 180; k++){
          tick(1);
          if(landedAt < 0 && (foe.hp < hp0 || relays.length)) landedAt = k;
          if(landedAt >= 0 && k > landedAt + 4) break;
        }
      }
      return { label:label, threw:threw,
               relayed: relays.length, relayMid: relays.length ? relays[0].mid : null,
               hpLost: Math.round(hp0 - foe.hp),
               projectilesFired: fired || 0, landedAtTick: landedAt };
    };

    const melee = (foe) => { G._desig = false; __BF3.hitEnemy(foe, 60, p, 0, 0, null); return 0; };
    const pet   = (foe) => { __BF3.hitEnemy(foe, 60, { x:p.x, z:p.z, pet:true }, 0, 0, null); return 0; };
    /* 13603's own call shape, transcribed: a bare position where `src` should be. */
    const shot  = (foe) => { __BF3.hitEnemy(foe, 60, { x:foe.x, z:foe.z + 30 }, 0, 0, null); return 0; };
    const real  = () => { p.atkCd = 0; __BF3.playerAttack();
                          return (G.projectiles && G.projectiles.length) || 0; };

    const guestMelee = trial('guest, melee door (resolveSwing s own call)',      asGuest, melee);
    const guestPet   = trial('guest, pet door (the clause already fixed)',       asGuest, pet);
    const guestReal  = trial('guest, A REAL BASIC ATTACK (a mage bolt)',         asGuest, real);
    const guestShot  = trial('guest, 13603 transcribed (no flight)',             asGuest, shot);
    const hostMelee  = trial('HOST, melee door — must NOT relay',                asHost,  melee);

    const relayWorks = guestMelee.relayed === 1 && guestMelee.hpLost === 0
                    && guestPet.relayed   === 1 && guestPet.hpLost   === 0
                    && hostMelee.relayed  === 0 && hostMelee.hpLost   >  0;

    out = {
      /* The instrument is sound: the two doors that should relay do, the host does not, and the
         relay names the host's own mid. Every verdict below is worthless without this. */
      instrumentOk: relayWorks && guestMelee.relayMid === MID,
      /* THE ROW. True means a guest's real shot never reaches the host AND is applied locally to a
         body the host's next snapshot overwrites. */
      shotIsLostInCoop: guestReal.projectilesFired > 0 && guestReal.landedAtTick >= 0
                     && guestReal.relayed === 0 && guestReal.hpLost > 0,
      /* And it is the SRC SHAPE, not the flight: the same call with no travel behaves identically. */
      itIsTheSrcShape: guestShot.relayed === 0 && guestShot.hpLost > 0,
      guestMelee: guestMelee, guestPet: guestPet, guestReal: guestReal,
      guestShot: guestShot, hostMelee: hostMelee,
      weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
      playTicks: playTicks, ticksAsked: asked, leftPlayAt: leftPlayAt, mode: __BF3.mode,
    };
  } finally {
    MP.sendHit = SAVED.sendHit;
    MP.active = SAVED.active; MP.isHost = SAVED.isHost; MP.pvp = SAVED.pvp; MP.peers = SAVED.peers;
    __BF3.meta.classId = SAVED.cid; p.weapon = SAVED.weapon; p.yaw = SAVED.yaw;
    p.x = SAVED.x; p.z = SAVED.z; p.atkCd = SAVED.atkCd; p.mana = SAVED.mana;
    G.enemies.length = 0; if(G.projectiles) G.projectiles.length = 0;
  }
  return JSON.stringify(out);
})()
